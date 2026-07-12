const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  User,
  Class,
  Attendance,
  Assignment,
  Announcement,
  Timetable,
  Fee,
  Event,
  EventRegistration,
  Ticket,
  LeaveApplication,
  CourseMaterial,
  ChatMessage
} = require('./models');
const { authenticateToken, requireRole } = require('./middleware');

// --- MULTER SETUP FOR FILE UPLOADS ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// --- AUTH ENDPOINTS ---

// Register
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, ...extra } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role: role || 'student',
      ...extra
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration.', error: err.message });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'eduprime_secret_session_token_key_2026',
      { expiresIn: '7d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      token,
      user: userResponse
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login.', error: err.message });
  }
});

// Get Current User Info
router.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// Update Profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { phone, email, hostel, skills, clubs, designation, department, officeHours } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (hostel) user.hostel = hostel;
    if (skills) user.skills = skills;
    if (clubs) user.clubs = clubs;
    if (designation) user.designation = designation;
    if (department) user.department = department;
    if (officeHours) user.officeHours = officeHours;

    await user.save();
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile.', error: err.message });
  }
});

// Change Password
router.post('/profile/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to change password.', error: err.message });
  }
});

// Profile Photo Upload
router.post('/profile/photo', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const user = await User.findById(req.user.id);
    user.avatarUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    await user.save();
    res.json({ message: 'Profile photo updated!', avatarUrl: user.avatarUrl });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload image', error: err.message });
  }
});

// Analytics (Role-based)
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const role = req.user.role;
    if (role === 'student') {
      const student = await User.findById(req.user.id);
      if (!student) return res.status(404).json({ message: 'Student not found.' });

      // Build subject-wise performance
      const assignments = await Assignment.find({ student: student._id, status: 'Submitted', pointsEarned: { $exists: true } });
      const subjectStats = {};
      assignments.forEach(a => {
        if (!subjectStats[a.subject]) {
          subjectStats[a.subject] = { totalPoints: 0, maxPoints: 0 };
        }
        subjectStats[a.subject].totalPoints += a.pointsEarned;
        subjectStats[a.subject].maxPoints += a.maxPoints;
      });

      const subjectMarksData = Object.keys(subjectStats).map(sub => {
        const avg = parseFloat(((subjectStats[sub].totalPoints / subjectStats[sub].maxPoints) * 100).toFixed(1));
        return {
          subject: sub,
          'Your Mark': avg,
          'Class Average': 80
        };
      });

      const finalSubjectMarks = subjectMarksData.length > 0 ? subjectMarksData : [
        { subject: 'Machine Learning', 'Your Mark': 95, 'Class Average': 82 },
        { subject: 'Database Management Systems', 'Your Mark': 90, 'Class Average': 79 },
        { subject: 'Data Structures', 'Your Mark': 85, 'Class Average': 78 }
      ];

      // Monthly attendance
      const attendanceLogs = await Attendance.find({ student: student._id }).sort({ date: 1 });
      const monthlyAttendance = {};
      attendanceLogs.forEach(log => {
        const month = log.date.toLocaleString('en-US', { month: 'short' });
        if (!monthlyAttendance[month]) {
          monthlyAttendance[month] = { present: 0, total: 0 };
        }
        monthlyAttendance[month].total += 1;
        if (log.status === 'Present' || log.status === 'Late') {
          monthlyAttendance[month].present += 1;
        }
      });

      const attendanceMonthlyData = Object.keys(monthlyAttendance).map(m => ({
        month: m,
        Attendance: parseFloat(((monthlyAttendance[m].present / monthlyAttendance[m].total) * 100).toFixed(1))
      }));

      const finalAttendance = attendanceMonthlyData.length > 0 ? attendanceMonthlyData : [
        { month: 'Jan', Attendance: 85.0 },
        { month: 'Feb', Attendance: 86.4 },
        { month: 'Mar', Attendance: 88.2 },
        { month: 'Apr', Attendance: 87.0 },
        { month: 'May', Attendance: 86.9 },
        { month: 'Jun', Attendance: 87.3 }
      ];

      // Grade distribution
      const gradesCount = { 'O': 0, 'A+': 0, 'A': 0, 'B+': 0, 'B': 0 };
      assignments.forEach(a => {
        const pct = (a.pointsEarned / a.maxPoints) * 100;
        if (pct >= 90) gradesCount['O']++;
        else if (pct >= 80) gradesCount['A+']++;
        else if (pct >= 70) gradesCount['A']++;
        else if (pct >= 60) gradesCount['B+']++;
        else gradesCount['B']++;
      });

      const gradeDistributionData = [
        { grade: 'O (Outstanding)', count: gradesCount['O'] || 1, color: '#10B981' },
        { grade: 'A+ (Excellent)', count: gradesCount['A+'] || 2, color: '#3B82F6' },
        { grade: 'A (Very Good)', count: gradesCount['A'] || 1, color: '#8B5CF6' },
        { grade: 'B+ (Good)', count: gradesCount['B+'] || 0, color: '#F59E0B' },
        { grade: 'B (Above Average)', count: gradesCount['B'] || 0, color: '#EF4444' }
      ];

      res.json({
        role: 'student',
        subjectMarksData: finalSubjectMarks,
        attendanceMonthlyData: finalAttendance,
        gradeDistributionData,
        weakestStudents: []
      });

    } else if (role === 'faculty') {
      const classes = await Class.find({ faculty: req.user.id });
      const subjects = classes.map(c => c.subject);
      const sections = classes.map(c => c.section);

      // Subject-wise class average
      const classPerformance = [];
      for (const cls of classes) {
        const assignments = await Assignment.find({
          subject: cls.subject,
          section: cls.section,
          status: 'Submitted',
          pointsEarned: { $exists: true }
        });

        let total = 0;
        let count = 0;
        assignments.forEach(a => {
          total += (a.pointsEarned / a.maxPoints) * 100;
          count++;
        });

        const avg = count > 0 ? parseFloat((total / count).toFixed(1)) : 80;
        classPerformance.push({
          subject: `${cls.subject} (Sec ${cls.section})`,
          'Average Mark': avg
        });
      }

      const subjectMarksData = classPerformance.length > 0 ? classPerformance : [
        { subject: 'Machine Learning (Sec A)', 'Average Mark': 82 },
        { subject: 'Database Management Systems (Sec A)', 'Average Mark': 79 }
      ];

      // Attendance trend
      const monthlyAttendance = {};
      const attendanceLogs = await Attendance.find({
        subject: { $in: subjects },
        section: { $in: sections }
      });

      attendanceLogs.forEach(log => {
        const month = log.date.toLocaleString('en-US', { month: 'short' });
        if (!monthlyAttendance[month]) {
          monthlyAttendance[month] = { present: 0, total: 0 };
        }
        monthlyAttendance[month].total += 1;
        if (log.status === 'Present' || log.status === 'Late') {
          monthlyAttendance[month].present += 1;
        }
      });

      const attendanceMonthlyData = Object.keys(monthlyAttendance).map(m => ({
        month: m,
        Attendance: parseFloat(((monthlyAttendance[m].present / monthlyAttendance[m].total) * 100).toFixed(1))
      }));

      const monthOrder = { 'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12 };
      attendanceMonthlyData.sort((a, b) => monthOrder[a.month] - monthOrder[b.month]);

      const finalAttendance = attendanceMonthlyData.length > 0 ? attendanceMonthlyData : [
        { month: 'Jun', Attendance: 83.2 }
      ];

      // Grade distribution
      const gradesCount = { 'O': 0, 'A+': 0, 'A': 0, 'B+': 0, 'B': 0 };
      const allSubmissions = await Assignment.find({
        subject: { $in: subjects },
        section: { $in: sections },
        status: 'Submitted',
        pointsEarned: { $exists: true }
      });

      allSubmissions.forEach(sub => {
        const pct = (sub.pointsEarned / sub.maxPoints) * 100;
        if (pct >= 90) gradesCount['O']++;
        else if (pct >= 80) gradesCount['A+']++;
        else if (pct >= 70) gradesCount['A']++;
        else if (pct >= 60) gradesCount['B+']++;
        else gradesCount['B']++;
      });

      const gradeDistributionData = [
        { grade: 'O (Outstanding)', count: gradesCount['O'] || 1, color: '#10B981' },
        { grade: 'A+ (Excellent)', count: gradesCount['A+'] || 2, color: '#3B82F6' },
        { grade: 'A (Very Good)', count: gradesCount['A'] || 1, color: '#8B5CF6' },
        { grade: 'B+ (Good)', count: gradesCount['B+'] || 0, color: '#F59E0B' },
        { grade: 'B (Above Average)', count: gradesCount['B'] || 0, color: '#EF4444' }
      ];

      // Weakest-performing students roster
      const studentIds = [];
      classes.forEach(c => {
        c.students.forEach(s => {
          if (!studentIds.includes(s.toString())) {
            studentIds.push(s.toString());
          }
        });
      });

      const studentsInfo = await User.find({ _id: { $in: studentIds } });
      const weakestStudents = [];

      for (const student of studentsInfo) {
        const studAssignments = await Assignment.find({
          student: student._id,
          subject: { $in: subjects },
          status: 'Submitted',
          pointsEarned: { $exists: true }
        });

        let totalScore = 0;
        let gradedCount = 0;
        studAssignments.forEach(a => {
          totalScore += (a.pointsEarned / a.maxPoints) * 100;
          gradedCount++;
        });

        const avgGrade = gradedCount > 0 ? parseFloat((totalScore / gradedCount).toFixed(1)) : 80;

        if (student.attendancePercentage < 75 || avgGrade < 60) {
          weakestStudents.push({
            name: student.name,
            rollNo: student.rollNo,
            attendance: student.attendancePercentage,
            averageGrade: avgGrade,
            reason: student.attendancePercentage < 75 && avgGrade < 60
              ? 'Low Attendance & Low Grade'
              : (student.attendancePercentage < 75 ? 'Low Attendance' : 'Low Grade')
          });
        }
      }

      res.json({
        role: 'faculty',
        subjectMarksData,
        attendanceMonthlyData: finalAttendance,
        gradeDistributionData,
        weakestStudents
      });

    } else {
      // Admin overall college aggregates
      const subjectMarksData = [
        { subject: 'Machine Learning', 'Average Mark': 83 },
        { subject: 'Database Management Systems', 'Average Mark': 78 },
        { subject: 'Data Structures', 'Average Mark': 81 }
      ];

      const attendanceMonthlyData = [
        { month: 'Jun', Attendance: 82.4 }
      ];

      const gradeDistributionData = [
        { grade: 'O (Outstanding)', count: 12, color: '#10B981' },
        { grade: 'A+ (Excellent)', count: 18, color: '#3B82F6' },
        { grade: 'A (Very Good)', count: 14, color: '#8B5CF6' }
      ];

      res.json({
        role: 'admin',
        subjectMarksData,
        attendanceMonthlyData,
        gradeDistributionData,
        weakestStudents: []
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve analytics dashboard statistics.', error: err.message });
  }
});

// --- STUDENT SPECIFIC ENDPOINTS ---

// Dashboard
router.get('/dashboard', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const totalAssignments = await Assignment.countDocuments({ student: student._id });
    const completedAssignments = await Assignment.countDocuments({ student: student._id, status: 'Submitted' });
    const pendingAssignments = totalAssignments - completedAssignments;

    const upcomingDeadlines = await Assignment.find({ student: student._id, status: 'Pending' })
      .sort({ dueDate: 1 })
      .limit(5);

    const recentAttendance = await Attendance.find({ student: student._id })
      .sort({ date: -1 })
      .limit(7);

    res.json({
      greetingName: student.name,
      cgpa: student.cgpa,
      attendancePercentage: student.attendancePercentage,
      creditsEarned: student.creditsEarned,
      rank: student.rank,
      assignments: {
        total: totalAssignments,
        completed: completedAssignments,
        pending: pendingAssignments
      },
      recentAttendance,
      upcomingDeadlines
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard data.', error: err.message });
  }
});

// Attendance
router.get('/attendance', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const logs = await Attendance.find({ student: req.user.id }).sort({ date: -1 });
    
    const subjectStats = {};
    logs.forEach(log => {
      if (!subjectStats[log.subject]) {
        subjectStats[log.subject] = { present: 0, total: 0 };
      }
      subjectStats[log.subject].total += 1;
      if (log.status === 'Present' || log.status === 'Late') {
        subjectStats[log.subject].present += 1;
      }
    });

    const breakdown = Object.keys(subjectStats).map(sub => {
      const pct = parseFloat(((subjectStats[sub].present / subjectStats[sub].total) * 100).toFixed(1));
      return {
        subject: sub,
        percentage: pct,
        present: subjectStats[sub].present,
        total: subjectStats[sub].total
      };
    });

    res.json({ logs, breakdown });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch attendance logs.', error: err.message });
  }
});

// Grades
router.get('/grades', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Detailed static-structured grades per sem
    const semesterData = [
      {
        semester: 'Semester 1', gpa: 8.4,
        courses: [
          { code: 'MA101', name: 'Mathematics I', credits: 4, grade: 'A', marks: 88 },
          { code: 'PH101', name: 'Physics for Engineers', credits: 4, grade: 'A+', marks: 92 },
          { code: 'CS101', name: 'Computer Programming', credits: 3, grade: 'O', marks: 95 }
        ]
      },
      {
        semester: 'Semester 2', gpa: 8.6,
        courses: [
          { code: 'MA102', name: 'Mathematics II', credits: 4, grade: 'A', marks: 86 },
          { code: 'CS102', name: 'Data Structures', credits: 4, grade: 'A+', marks: 91 }
        ]
      },
      {
        semester: 'Semester 3', gpa: 8.5,
        courses: [
          { code: 'CS202', name: 'Database Management Systems', credits: 4, grade: 'O', marks: 97 },
          { code: 'CS204', name: 'Digital Logic Design', credits: 3, grade: 'A+', marks: 90 }
        ]
      },
      {
        semester: 'Semester 4', gpa: 8.8,
        courses: [
          { code: 'CS205', name: 'Operating Systems', credits: 4, grade: 'O', marks: 96 },
          { code: 'CS206', name: 'Computer Networks', credits: 4, grade: 'A+', marks: 93 }
        ]
      },
      {
        semester: 'Semester 5', gpa: 8.9,
        courses: [
          { code: 'CS303', name: 'Machine Learning', credits: 4, grade: 'O', marks: 97 },
          { code: 'CS304', name: 'Compiler Design', credits: 3, grade: 'A', marks: 86 }
        ]
      },
      {
        semester: 'Semester 6', gpa: 9.0,
        courses: [
          { code: 'CS305', name: 'Distributed Systems', credits: 4, grade: 'A+', marks: 90 },
          { code: 'CS306', name: 'Artificial Intelligence', credits: 4, grade: 'O', marks: 96 }
        ]
      }
    ];

    res.json({ cgpa: student.cgpa, semesterData });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch grades data.', error: err.message });
  }
});

// Timetable
router.get('/timetable', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const student = await User.findById(req.user.id);
      const slots = await Timetable.find({ section: student.section }).populate('faculty', 'name');
      res.json(slots);
    } else if (req.user.role === 'faculty') {
      const slots = await Timetable.find({ faculty: req.user.id }).populate('faculty', 'name');
      res.json(slots);
    } else {
      const slots = await Timetable.find({}).populate('faculty', 'name');
      res.json(slots);
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch timetable.', error: err.message });
  }
});

// Assignments List
router.get('/assignments', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const list = await Assignment.find({ student: req.user.id }).sort({ dueDate: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch assignments.', error: err.message });
  }
});

// Submit assignment (with file upload)
router.post('/assignments/:id/submit', authenticateToken, requireRole(['student']), upload.single('submissionFile'), async (req, res) => {
  try {
    const { submissionContent } = req.body;
    const assignment = await Assignment.findOne({ _id: req.params.id, student: req.user.id });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    assignment.status = 'Submitted';
    assignment.submissionContent = submissionContent || 'Uploaded online via student portal.';
    if (req.file) {
      assignment.submissionFileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }
    assignment.submittedAt = new Date();
    await assignment.save();

    res.json({ message: 'Assignment submitted successfully!', assignment });
  } catch (err) {
    res.status(500).json({ message: 'Submission failed.', error: err.message });
  }
});

// Course Materials
router.get('/course-materials', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const student = await User.findById(req.user.id);
      const materials = await CourseMaterial.find({ section: student.section });
      res.json(materials);
    } else {
      const materials = await CourseMaterial.find({});
      res.json(materials);
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch course materials.', error: err.message });
  }
});

// Placements list
router.get('/placements', authenticateToken, async (req, res) => {
  try {
    const placements = await Event.find({ category: 'Placement' }).sort({ date: 1 });
    // Map event elements to company drive specs
    const drives = placements.map(p => ({
      id: p._id,
      company: p.title,
      role: 'Graduate Development Engineer',
      eligibility: 'B.Tech CSE/IT/ECE, CGPA >= 7.5',
      date: p.date,
      status: 'Open',
      registered: false
    }));
    res.json(drives);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch placement drives.', error: err.message });
  }
});

// Events & Registrations
router.get('/events', authenticateToken, async (req, res) => {
  try {
    const events = await Event.find({});
    const registrations = await EventRegistration.find({ student: req.user.id });
    const registeredIds = registrations.map(r => r.event.toString());

    const result = events.map(event => ({
      ...event.toObject(),
      registered: registeredIds.includes(event._id.toString())
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch campus events.', error: err.message });
  }
});

router.post('/events/:id/register', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const existing = await EventRegistration.findOne({ student: req.user.id, event: event._id });
    if (existing) return res.status(400).json({ message: 'Already registered!' });

    if (event.seats <= 0) return res.status(400).json({ message: 'No seats left.' });

    const reg = new EventRegistration({ student: req.user.id, event: event._id });
    await reg.save();

    event.seats -= 1;
    await event.save();

    res.json({ message: 'Registered successfully!', event });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
});

// Leave Application submit/view
router.get('/leave-applications', authenticateToken, async (req, res) => {
  try {
    const requests = await LeaveApplication.find({ applicant: req.user.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leave requests.', error: err.message });
  }
});

router.post('/leave-applications', authenticateToken, requireRole(['student', 'faculty']), async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;
    const app = new LeaveApplication({
      applicant: req.user.id,
      applicantRole: req.user.role,
      leaveType,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      reason,
      status: 'Pending'
    });
    await app.save();
    res.status(201).json({ message: 'Leave application submitted!', request: app });
  } catch (err) {
    res.status(500).json({ message: 'Submission failed.', error: err.message });
  }
});

// Helpdesk submit/view
router.get('/helpdesk', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const tickets = await Ticket.find({ student: req.user.id }).sort({ timestamp: -1 });
      res.json(tickets);
    } else if (req.user.role === 'faculty') {
      const tickets = await Ticket.find({ assignedTo: req.user.id }).sort({ timestamp: -1 });
      res.json(tickets);
    } else {
      const tickets = await Ticket.find({}).populate('student', 'name').sort({ timestamp: -1 });
      res.json(tickets);
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch support tickets.', error: err.message });
  }
});

router.post('/helpdesk', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const { category, priority, subject, description } = req.body;
    const ticket = new Ticket({
      student: req.user.id,
      category,
      priority,
      subject,
      description,
      status: 'Open'
    });
    await ticket.save();
    res.status(201).json({ message: 'Ticket submitted!', ticket });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create ticket.', error: err.message });
  }
});

// Fee Status
router.get('/fees', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const feeStatement = await Fee.findOne({ student: req.user.id });
    res.json(feeStatement);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fee details.', error: err.message });
  }
});

router.post('/fees/pay', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const feeStatement = await Fee.findOne({ student: req.user.id });
    if (!feeStatement || feeStatement.totalOutstanding <= 0) {
      return res.status(400).json({ message: 'No dues to pay.' });
    }

    const payAmount = feeStatement.totalOutstanding;
    feeStatement.totalOutstanding = 0;
    feeStatement.paymentHistory.push({
      semester: 'Semester 6',
      amount: payAmount,
      status: 'Paid',
      date: new Date(),
      receiptUrl: 'REC-' + Math.floor(Math.random() * 900000 + 100000)
    });

    await feeStatement.save();
    res.json({ message: 'Payment processed successfully!', statement: feeStatement });
  } catch (err) {
    res.status(500).json({ message: 'Payment failed.', error: err.message });
  }
});

// Digital ID Card
router.get('/id-card', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      name: user.name,
      rollNo: user.rollNo || 'EMP-' + user._id.toString().slice(-4).toUpperCase(),
      dept: user.dept || user.department || 'Administration',
      year: user.year || 'Staff',
      semester: user.semester || 'N/A',
      section: user.section || 'N/A',
      bloodGroup: user.bloodGroup || 'B+',
      cgpa: user.cgpa || 0,
      email: user.email,
      phone: user.phone || '+91 98765 43210',
      hostel: user.hostel || 'Staff Quarters, Block A',
      mentor: user.mentor || 'N/A',
      emergencyContact: user.guardianPhone || '+91 99999 88888',
      validUntil: 'June 2028',
      batch: 'Permanent Staff',
      avatarUrl: user.avatarUrl
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ID card info.', error: err.message });
  }
});

// Announcements general view
router.get('/announcements', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }
    const notices = await Announcement.find(filter).populate('createdBy', 'name role').sort({ timestamp: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch announcements.', error: err.message });
  }
});


// --- FACULTY DIRECT ROUTINGS ---

// Dashboard overview data
router.get('/faculty/dashboard', authenticateToken, requireRole(['faculty']), async (req, res) => {
  try {
    const classes = await Class.find({ faculty: req.user.id });
    
    // Count total unique students across taught classes
    const studentSet = new Set();
    classes.forEach(c => c.students.forEach(s => studentSet.add(s.toString())));
    
    // Total pending grading count
    const pendingGradingCount = await Assignment.countDocuments({
      createdBy: req.user.id,
      status: 'Submitted',
      pointsEarned: { $exists: false }
    });

    // Schedule: Get all Timetable records matching this faculty
    const schedule = await Timetable.find({ faculty: req.user.id });

    // Pending list elements
    const pendingAssignmentsList = await Assignment.find({
      createdBy: req.user.id,
      status: 'Submitted',
      pointsEarned: { $exists: false }
    }).populate('student', 'name rollNo').limit(5);

    res.json({
      classesCount: classes.length,
      studentsCount: studentSet.size,
      pendingGrading: pendingGradingCount,
      schedule,
      pendingAssignmentsList
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load faculty dashboard', error: err.message });
  }
});

// Fetch subjects and sections taught
router.get('/faculty/classes', authenticateToken, requireRole(['faculty']), async (req, res) => {
  try {
    const list = await Class.find({ faculty: req.user.id });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch classes list.', error: err.message });
  }
});

// Faculty get class roster
router.get('/faculty/students', authenticateToken, requireRole(['faculty']), async (req, res) => {
  try {
    const { subject, section } = req.query;
    const targetClass = await Class.findOne({ faculty: req.user.id, subject, section }).populate('students', 'name rollNo email cgpa attendancePercentage');
    if (!targetClass) {
      // Fallback: return students matching section
      const students = await User.find({ role: 'student', section }).select('name rollNo email cgpa attendancePercentage');
      return res.json(students);
    }
    res.json(targetClass.students);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch class roster.', error: err.message });
  }
});

// Mark Attendance
router.post('/attendance/mark', authenticateToken, requireRole(['faculty']), async (req, res) => {
  try {
    const { subject, section, date, logs } = req.body;
    if (!subject || !section || !date || !logs) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const attendanceDate = new Date(date);
    const facultyUser = await User.findById(req.user.id);

    // Save attendance logs and update overall calculations
    for (const log of logs) {
      // Create new attendance
      const attendance = new Attendance({
        student: log.studentId,
        date: attendanceDate,
        subject,
        section,
        faculty: facultyUser.name,
        time: '09:00 AM',
        status: log.status,
        method: 'Manual'
      });
      await attendance.save();

      // Recalculate student overall percentage
      const totalCount = await Attendance.countDocuments({ student: log.studentId });
      const presentCount = await Attendance.countDocuments({
        student: log.studentId,
        status: { $in: ['Present', 'Late'] }
      });
      const pct = parseFloat(((presentCount / totalCount) * 100).toFixed(1));

      await User.findByIdAndUpdate(log.studentId, { attendancePercentage: pct });
    }

    res.json({ message: 'Attendance logs submitted and percentages updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark attendance.', error: err.message });
  }
});

// Faculty upload course material
router.post('/course-materials', authenticateToken, requireRole(['faculty']), upload.single('materialFile'), async (req, res) => {
  try {
    const { subject, section, fileName } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Please attach a document file.' });

    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    const fileType = req.file.originalname.toLowerCase().endsWith('.pdf') ? 'PDF' : (req.file.originalname.toLowerCase().endsWith('.ppt') || req.file.originalname.toLowerCase().endsWith('.pptx') ? 'PPT' : 'Document');

    let material = await CourseMaterial.findOne({ subject, section });
    if (!material) {
      material = new CourseMaterial({
        subject,
        section,
        createdBy: req.user.id,
        files: []
      });
    }

    material.files.push({
      name: fileName || req.file.originalname,
      url: fileUrl,
      type: fileType
    });

    await material.save();
    res.json({ message: 'Resource file uploaded successfully!', material });
  } catch (err) {
    res.status(500).json({ message: 'Resource upload failed.', error: err.message });
  }
});

// Faculty create assignment
router.post('/assignments', authenticateToken, requireRole(['faculty']), upload.single('assignmentAttachment'), async (req, res) => {
  try {
    const { title, subject, section, description, dueDate, maxPoints } = req.body;
    let fileUrl = '';
    if (req.file) {
      fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    // Find enrolled students in class/section
    const targetClass = await Class.findOne({ subject, section });
    let students = [];
    if (targetClass) {
      students = targetClass.students;
    } else {
      students = await User.find({ role: 'student', section }).select('_id');
    }

    if (students.length === 0) {
      return res.status(400).json({ message: 'No students found enrolled in this subject/section' });
    }

    // Create assignment for each student
    for (const studentId of students) {
      const assignment = new Assignment({
        student: studentId,
        title,
        subject,
        section,
        status: 'Pending',
        dueDate: new Date(dueDate),
        maxPoints: parseInt(maxPoints),
        description,
        fileUrl,
        createdBy: req.user.id
      });
      await assignment.save();
    }

    res.status(201).json({ message: `Assignment "${title}" distributed to ${students.length} students.` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create assignment.', error: err.message });
  }
});

// Faculty view submissions list
router.get('/faculty/submissions/:assignmentTitle', authenticateToken, requireRole(['faculty']), async (req, res) => {
  try {
    const submissions = await Assignment.find({
      createdBy: req.user.id,
      title: req.params.assignmentTitle
    }).populate('student', 'name rollNo');
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve submissions.', error: err.message });
  }
});

// Faculty grade a student assignment
router.post('/faculty/grade/:id', authenticateToken, requireRole(['faculty']), async (req, res) => {
  try {
    const { pointsEarned, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Submission not found' });

    assignment.pointsEarned = parseInt(pointsEarned);
    assignment.feedback = feedback;
    await assignment.save();

    res.json({ message: 'Grades and feedback saved!', assignment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save grade.', error: err.message });
  }
});


// --- ADMIN MANAGEMENT ROUTES ---

// Admin Dashboard stats
router.get('/admin/dashboard', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const studentsCount = await User.countDocuments({ role: 'student' });
    const facultyCount = await User.countDocuments({ role: 'faculty' });
    const openTickets = await Ticket.countDocuments({ status: { $ne: 'Resolved' } });
    const pendingLeaves = await LeaveApplication.countDocuments({ status: 'Pending' });
    
    // Total outstanding fees sum
    const feesStatement = await Fee.find({});
    const totalOutstandingFees = feesStatement.reduce((acc, f) => acc + f.totalOutstanding, 0);

    // Recent activities: 5 latest users, 5 tickets, 5 leave apps
    const recentLeaves = await LeaveApplication.find({}).populate('applicant', 'name role').sort({ createdAt: -1 }).limit(5);
    const recentTickets = await Ticket.find({}).populate('student', 'name').sort({ timestamp: -1 }).limit(5);
    const recentUsers = await User.find({}).select('name role email createdAt').sort({ createdAt: -1 }).limit(5);

    res.json({
      studentsCount,
      facultyCount,
      openTickets,
      pendingLeaves,
      totalOutstandingFees,
      recentActivities: {
        recentLeaves,
        recentTickets,
        recentUsers
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load admin metrics', error: err.message });
  }
});

// User CRUD operations
router.get('/admin/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { role, dept } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (dept) {
      filter.$or = [{ dept }, { department: dept }];
    }
    const users = await User.find(filter).select('-password').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve users.', error: err.message });
  }
});

router.post('/admin/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { email, password, name, role, ...extra } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists.' });

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role,
      ...extra
    });
    await user.save();

    // If role is student, auto-generate empty fee statement
    if (role === 'student') {
      const fee = new Fee({
        student: user._id,
        totalOutstanding: 4500,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        paymentBreakup: [
          { item: 'Academic Tuition Fee', amount: 3500 },
          { item: 'Lab Resources Dues', amount: 1000 }
        ],
        paymentHistory: []
      });
      await fee.save();
    }

    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create user.', error: err.message });
  }
});

router.put('/admin/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { password, ...updates } = req.body;
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
});

router.delete('/admin/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted from system records.' });
  } catch (err) {
    res.status(500).json({ message: 'Deletion failed.', error: err.message });
  }
});

// Leave approvals
router.get('/admin/leaves', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const list = await LeaveApplication.find({}).populate('applicant', 'name role dept department').sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leaves queue.', error: err.message });
  }
});

router.put('/admin/leaves/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await LeaveApplication.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    leave.status = status;
    await leave.save();
    res.json({ message: `Leave application status updated to ${status}`, leave });
  } catch (err) {
    res.status(500).json({ message: 'Approval process failed.', error: err.message });
  }
});

// Helpdesk ticket assign & resolve
router.put('/admin/tickets/:id/assign', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { assignedTo, status, resolutionNotes } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (assignedTo) ticket.assignedTo = assignedTo;
    if (status) ticket.status = status;
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
    await ticket.save();

    res.json({ message: 'Ticket settings updated successfully!', ticket });
  } catch (err) {
    res.status(500).json({ message: 'Update ticket failed.', error: err.message });
  }
});

// Admin Timetable master CRUD
router.post('/admin/timetable', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { subject, type, room, day, timeStart, timeEnd, section, facultyId } = req.body;
    const slot = new Timetable({
      subject,
      type,
      room,
      day,
      timeStart,
      timeEnd,
      section,
      faculty: facultyId
    });
    await slot.save();
    res.status(201).json({ message: 'Lecture slot created in master schedule.', slot });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create timetable slot.', error: err.message });
  }
});

router.delete('/admin/timetable/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: 'Slot removed from schedule.' });
  } catch (err) {
    res.status(500).json({ message: 'Deletion failed.' });
  }
});

router.put('/admin/timetable/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { subject, type, room, day, timeStart, timeEnd, section, facultyId } = req.body;
    const slot = await Timetable.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found.' });

    if (subject) slot.subject = subject;
    if (type) slot.type = type;
    if (room) slot.room = room;
    if (day) slot.day = day;
    if (timeStart) slot.timeStart = timeStart;
    if (timeEnd) slot.timeEnd = timeEnd;
    if (section) slot.section = section;
    if (facultyId) slot.faculty = facultyId;

    await slot.save();
    res.json({ message: 'Timetable slot updated successfully!', slot });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update timetable slot.', error: err.message });
  }
});

// Admin CRUD Course Sections
router.get('/admin/classes', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const classes = await Class.find({}).populate('faculty', 'name').populate('students', 'name rollNo');
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch classes list.' });
  }
});

router.post('/admin/classes', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { subject, section, facultyId, studentIds, room } = req.body;
    const newClass = new Class({
      subject,
      section,
      faculty: facultyId,
      students: studentIds || [],
      room
    });
    await newClass.save();
    res.status(201).json({ message: `Class group for ${subject} created.`, class: newClass });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create class section map.', error: err.message });
  }
});

// Admin CRUD Placements & Events
router.post('/admin/events', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { title, icon, date, location, price, seats, category } = req.body;
    const event = new Event({
      title,
      icon: icon || 'Calendar',
      date: new Date(date),
      location,
      price: parseFloat(price || 0),
      seats: parseInt(seats || 0),
      category
    });
    await event.save();
    res.status(201).json({ message: 'Campus event created successfully!', event });
  } catch (err) {
    res.status(500).json({ message: 'Event creation failed.', error: err.message });
  }
});

router.post('/admin/announcements', authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
  try {
    const { title, description, category, scope } = req.body;
    const announce = new Announcement({
      title,
      description,
      category,
      scope: scope || 'College-wide',
      createdBy: req.user.id
    });
    await announce.save();
    res.status(201).json({ message: 'Notice posted successfully!', announce });
  } catch (err) {
    res.status(500).json({ message: 'Posting failed.', error: err.message });
  }
});

router.put('/admin/announcements/:id', authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
  try {
    const { title, description, category, scope } = req.body;
    const announce = await Announcement.findById(req.params.id);
    if (!announce) return res.status(404).json({ message: 'Announcement not found.' });

    // Restrict editing to admins, or the faculty member who created it
    if (req.user.role !== 'admin' && announce.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to edit this notice.' });
    }

    if (title) announce.title = title;
    if (description) announce.description = description;
    if (category) announce.category = category;
    if (scope) announce.scope = scope;

    await announce.save();
    res.json({ message: 'Announcement updated successfully!', announce });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update announcement.', error: err.message });
  }
});

router.delete('/admin/announcements/:id', authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
  try {
    const announce = await Announcement.findById(req.params.id);
    if (!announce) return res.status(404).json({ message: 'Announcement not found.' });

    // Restrict deactivation to admins or the creator
    if (req.user.role !== 'admin' && announce.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this notice.' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete announcement.', error: err.message });
  }
});

// Admin Fee management
router.get('/admin/fees', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const feeRecords = await Fee.find({}).populate('student', 'name rollNo dept semester');
    res.json(feeRecords);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve fee logs.', error: err.message });
  }
});

router.put('/admin/fees/:id/pay-manual', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: 'Fee statement not found' });

    const paidVal = fee.totalOutstanding;
    fee.totalOutstanding = 0;
    fee.paymentHistory.push({
      semester: 'Current',
      amount: paidVal,
      status: 'Paid',
      date: new Date(),
      receiptUrl: 'MAN-' + Math.floor(Math.random() * 900000 + 100000)
    });
    await fee.save();
    res.json({ message: 'Manual payment processed successfully!', fee });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process payment.', error: err.message });
  }
});


// --- CONTEXTUAL MULTI-ROLE AI BOT ASSISTANT ROUTING ---
router.post('/ai-assistant/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message content is required.' });

    const input = message.toLowerCase();
    const userRole = req.user.role;
    let reply = '';

    if (userRole === 'student') {
      const student = await User.findById(req.user.id);
      const attendanceLogs = await Attendance.find({ student: student._id });
      const assignments = await Assignment.find({ student: student._id });
      const feeStatement = await Fee.findOne({ student: student._id });

      const attendanceBreakdown = {};
      attendanceLogs.forEach(log => {
        if (!attendanceBreakdown[log.subject]) {
          attendanceBreakdown[log.subject] = { present: 0, total: 0 };
        }
        attendanceBreakdown[log.subject].total += 1;
        if (log.status === 'Present' || log.status === 'Late') {
          attendanceBreakdown[log.subject].present += 1;
        }
      });

      const parsedAttendance = Object.keys(attendanceBreakdown).map(sub => {
        const pct = ((attendanceBreakdown[sub].present / attendanceBreakdown[sub].total) * 100).toFixed(1);
        return `${sub}: ${pct}%`;
      }).join(', ');

      const pendingAssignments = assignments.filter(a => a.status === 'Pending');

      if (input.includes('attendance')) {
        reply = `Hello ${student.name}. Your overall attendance is **${student.attendancePercentage}%**. Here is your subject-wise breakdown: ${parsedAttendance || 'No logs'}.`;
      } else if (input.includes('assignment') || input.includes('pending') || input.includes('homework')) {
        if (pendingAssignments.length === 0) {
          reply = `Great news, ${student.name}! You have completed all assignments. There are currently 0 pending tasks.`;
        } else {
          const listText = pendingAssignments.map(a => `• **${a.title}** (${a.subject}) - Due: ${new Date(a.dueDate).toLocaleDateString()}`).join('\n');
          reply = `You have **${pendingAssignments.length} pending assignment(s)**:\n\n${listText}`;
        }
      } else if (input.includes('fee') || input.includes('dues') || input.includes('due') || input.includes('outstanding')) {
        const outstanding = feeStatement ? feeStatement.totalOutstanding : 0;
        reply = outstanding > 0 
          ? `Your outstanding balance is **$${outstanding}**. Due Date: **${new Date(feeStatement.dueDate).toLocaleDateString()}**.` 
          : `All your fees are completely cleared! You have **$0** outstanding dues.`;
      } else {
        reply = `Hello ${student.name}, I am EduBot. I can verify your attendance (${student.attendancePercentage}%), pending assignments (${pendingAssignments.length}), and fee status ($${feeStatement ? feeStatement.totalOutstanding : 0}). How can I help you?`;
      }
    } 
    
    else if (userRole === 'faculty') {
      const faculty = await User.findById(req.user.id);
      const classes = await Class.find({ faculty: faculty._id });
      const pendingGradingCount = await Assignment.countDocuments({
        createdBy: faculty._id,
        status: 'Submitted',
        pointsEarned: { $exists: false }
      });
      const timetable = await Timetable.find({ faculty: faculty._id });

      if (input.includes('grade') || input.includes('grading') || input.includes('pending')) {
        reply = `Hello Dr. ${faculty.name}. You have **${pendingGradingCount} assignment submissions** waiting to be graded. You can grade them on the **Assignments & Grading** panel.`;
      } else if (input.includes('class') || input.includes('schedule') || input.includes('timetable')) {
        const schedStr = timetable.map(t => `• **${t.day}** ${t.timeStart}-${t.timeEnd}: ${t.subject} (Room ${t.room}, Sec ${t.section})`).join('\n');
        reply = `Dr. ${faculty.name}, here is your teaching schedule across classes:\n\n${schedStr || 'No lectures scheduled'}.`;
      } else if (input.includes('student') || input.includes('roster')) {
        const classNames = classes.map(c => `• ${c.subject} (Sec ${c.section}): ${c.students.length} students`).join('\n');
        reply = `You are assigned to **${classes.length} classes**. Here is the student roster breakdown:\n\n${classNames}`;
      } else {
        reply = `Hello Dr. ${faculty.name}. I am your assistant. Ask me about your **teaching schedule**, **student rosters** (${classes.length} classes), or **pending gradings** (${pendingGradingCount} submissions).`;
      }
    } 
    
    else if (userRole === 'admin') {
      const admin = await User.findById(req.user.id);
      const studentsCount = await User.countDocuments({ role: 'student' });
      const facultyCount = await User.countDocuments({ role: 'faculty' });
      const openTickets = await Ticket.countDocuments({ status: { $ne: 'Resolved' } });
      const pendingLeaves = await LeaveApplication.countDocuments({ status: 'Pending' });

      if (input.includes('user') || input.includes('student') || input.includes('faculty')) {
        reply = `System contains **${studentsCount} active students** and **${facultyCount} faculty members**. You can manage profiles on the **User Management** page.`;
      } else if (input.includes('ticket') || input.includes('helpdesk')) {
        reply = `There are currently **${openTickets} open helpdesk tickets** across the portal requiring assignment or updates.`;
      } else if (input.includes('leave') || input.includes('approval')) {
        reply = `There are **${pendingLeaves} pending leave requests** from students and faculty waiting for your decision on the **Leave Approvals** tab.`;
      } else {
        reply = `Hello Admin. I can retrieve portal stats. System Stats:\n\n` +
                `• Active Students: **${studentsCount}**\n` +
                `• Active Faculty: **${facultyCount}**\n` +
                `• Pending Leave Requests: **${pendingLeaves}**\n` +
                `• Open Support Tickets: **${openTickets}**`;
      }
    }

    // Save history
    const userMsg = new ChatMessage({ user: req.user.id, sender: 'user', message });
    const botMsg = new ChatMessage({ user: req.user.id, sender: 'bot', message: reply });
    await userMsg.save();
    await botMsg.save();

    res.json({
      sender: 'bot',
      message: reply,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ message: 'Assistant error', error: err.message });
  }
});

module.exports = router;
