const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

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

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eduprime';

async function seedData() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB. Wiping database collections...');

    // Clear old data
    await User.deleteMany({});
    await Class.deleteMany({});
    await Attendance.deleteMany({});
    await Assignment.deleteMany({});
    await Announcement.deleteMany({});
    await Timetable.deleteMany({});
    await Fee.deleteMany({});
    await Event.deleteMany({});
    await EventRegistration.deleteMany({});
    await Ticket.deleteMany({});
    await LeaveApplication.deleteMany({});
    await CourseMaterial.deleteMany({});
    await ChatMessage.deleteMany({});

    console.log('Database wiped. Creating passwords...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Seed Users (Students, Faculty, Admin)
    console.log('Seeding users...');
    const arjun = new User({
      email: 'arjun@eduprime.edu',
      password: hashedPassword,
      name: 'Arjun Mehta',
      role: 'student',
      rollNo: 'CS21B042',
      dept: 'Computer Science & Engineering',
      year: '3rd Year',
      semester: '6',
      section: 'A',
      cgpa: 8.7,
      attendancePercentage: 87.3,
      creditsEarned: 104,
      rank: 14,
      dob: '2004-04-12',
      gender: 'Male',
      bloodGroup: 'O+',
      aadhar: 'XXXX-XXXX-5821',
      phone: '+91 98765 43210',
      hostel: 'Ramanujan Hostel, Block C, Room 302',
      homeCity: 'Mumbai, Maharashtra',
      mentor: 'Dr. Sneha Roy',
      advisor: 'Prof. Amit Sharma',
      guardianName: 'Rajesh Mehta',
      guardianPhone: '+91 99999 88888',
      skills: ['React.js', 'Node.js', 'Python', 'Machine Learning', 'SQL'],
      clubs: ['Coding Club (Lead)', 'Music Society'],
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
    });

    const karan = new User({
      email: 'karan@eduprime.edu',
      password: hashedPassword,
      name: 'Karan Patel',
      role: 'student',
      rollNo: 'CS21B050',
      dept: 'Computer Science & Engineering',
      year: '3rd Year',
      semester: '6',
      section: 'A',
      cgpa: 7.9,
      attendancePercentage: 78.4,
      creditsEarned: 98,
      rank: 29,
      dob: '2003-11-22',
      gender: 'Male',
      bloodGroup: 'A+',
      aadhar: 'XXXX-XXXX-9104',
      phone: '+91 91111 22222',
      hostel: 'Ramanujan Hostel, Block A, Room 104',
      homeCity: 'Ahmedabad, Gujarat',
      mentor: 'Dr. Sneha Roy',
      advisor: 'Prof. Amit Sharma',
      guardianName: 'Dilip Patel',
      guardianPhone: '+91 91111 33333',
      skills: ['Python', 'SQL', 'Django'],
      clubs: ['Gaming Society'],
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    });

    const priya = new User({
      email: 'priya@eduprime.edu',
      password: hashedPassword,
      name: 'Priya Sharma',
      role: 'student',
      rollNo: 'CS21B112',
      dept: 'Computer Science & Engineering',
      year: '3rd Year',
      semester: '6',
      section: 'B',
      cgpa: 9.2,
      attendancePercentage: 91.5,
      creditsEarned: 110,
      rank: 3,
      dob: '2004-01-18',
      gender: 'Female',
      bloodGroup: 'B+',
      aadhar: 'XXXX-XXXX-4729',
      phone: '+91 92222 33333',
      hostel: 'Kalpana Chawla Hostel, Block B, Room 201',
      homeCity: 'Delhi',
      mentor: 'Prof. Amit Sharma',
      advisor: 'Prof. Amit Sharma',
      guardianName: 'Vikas Sharma',
      guardianPhone: '+91 92222 44444',
      skills: ['Java', 'C++', 'Algorithms', 'Android'],
      clubs: ['Robotics Club (Vice President)', 'Literary Club'],
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    });

    const facultyRoy = new User({
      email: 'sneha.roy@eduprime.edu',
      password: hashedPassword,
      name: 'Dr. Sneha Roy',
      role: 'faculty',
      designation: 'Assistant Professor',
      department: 'Computer Science & Engineering',
      subjectsTaught: ['Machine Learning', 'Database Management Systems'],
      officeHours: 'Mon & Wed: 2:00 PM - 4:00 PM',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
    });

    const facultySharma = new User({
      email: 'amit.sharma@eduprime.edu',
      password: hashedPassword,
      name: 'Prof. Amit Sharma',
      role: 'faculty',
      designation: 'Head of Department (HOD)',
      department: 'Computer Science & Engineering',
      subjectsTaught: ['Data Structures', 'Operating Systems'],
      officeHours: 'Tue & Thu: 10:00 AM - 12:00 PM',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    });

    const adminUser = new User({
      email: 'admin@eduprime.edu',
      password: hashedPassword,
      name: 'System Admin Portal',
      role: 'admin',
      designation: 'Chief Registrar',
      department: 'Academic Operations',
      officeRoom: 'Admin Block, Room 101',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
    });

    await arjun.save();
    await karan.save();
    await priya.save();
    await facultyRoy.save();
    await facultySharma.save();
    await adminUser.save();

    // 2. Class Section mappings
    console.log('Seeding class sections...');
    const classML = new Class({
      subject: 'Machine Learning',
      section: 'A',
      faculty: facultyRoy._id,
      students: [arjun._id, karan._id],
      room: 'LHC-301'
    });

    const classDBMS = new Class({
      subject: 'Database Management Systems',
      section: 'A',
      faculty: facultyRoy._id,
      students: [arjun._id, karan._id],
      room: 'LHC-301'
    });

    const classDS = new Class({
      subject: 'Data Structures',
      section: 'A',
      faculty: facultySharma._id,
      students: [arjun._id, karan._id],
      room: 'Lab 4'
    });

    const classOS = new Class({
      subject: 'Operating Systems',
      section: 'B',
      faculty: facultySharma._id,
      students: [priya._id],
      room: 'LHC-402'
    });

    await classML.save();
    await classDBMS.save();
    await classDS.save();
    await classOS.save();

    // 3. Seeding Timetable
    console.log('Seeding timetable slots...');
    const timetable = [
      // Section A slots (Roy & Sharma)
      { subject: 'Machine Learning', type: 'Lecture', room: 'LHC-301', day: 'Monday', timeStart: '09:00 AM', timeEnd: '09:50 AM', section: 'A', faculty: facultyRoy._id },
      { subject: 'Database Management Systems', type: 'Lecture', room: 'LHC-301', day: 'Monday', timeStart: '10:00 AM', timeEnd: '10:50 AM', section: 'A', faculty: facultyRoy._id },
      { subject: 'Data Structures', type: 'Lab', room: 'Lab 4', day: 'Tuesday', timeStart: '11:00 AM', timeEnd: '12:50 PM', section: 'A', faculty: facultySharma._id },
      { subject: 'Machine Learning', type: 'Lecture', room: 'LHC-301', day: 'Wednesday', timeStart: '09:00 AM', timeEnd: '09:50 AM', section: 'A', faculty: facultyRoy._id },
      
      // Section B slots (Sharma OS)
      { subject: 'Operating Systems', type: 'Lecture', room: 'LHC-402', day: 'Wednesday', timeStart: '10:00 AM', timeEnd: '10:50 AM', section: 'B', faculty: facultySharma._id },
      { subject: 'Operating Systems', type: 'Lecture', room: 'LHC-402', day: 'Friday', timeStart: '10:00 AM', timeEnd: '10:50 AM', section: 'B', faculty: facultySharma._id }
    ];
    await Timetable.insertMany(timetable);

    // 4. Seeding Attendance Logs (Arjun & Karan)
    console.log('Seeding attendance logs...');
    const attendanceLogs = [];
    const subjects = ['Machine Learning', 'Database Management Systems', 'Data Structures'];
    const facultyMap = {
      'Machine Learning': 'Dr. Sneha Roy',
      'Database Management Systems': 'Dr. Sneha Roy',
      'Data Structures': 'Prof. Amit Sharma'
    };

    // June 2026 logs for Arjun & Karan
    for (let d = 1; d <= 15; d++) {
      const logDate = new Date(`2026-06-${d < 10 ? '0' + d : d}`);
      if (logDate.getDay() === 0 || logDate.getDay() === 6) continue;

      subjects.forEach((sub) => {
        // Arjun Logs
        attendanceLogs.push({
          student: arjun._id,
          date: logDate,
          subject: sub,
          section: 'A',
          faculty: facultyMap[sub],
          time: '09:00 AM',
          method: 'Manual',
          status: Math.random() > 0.12 ? 'Present' : 'Absent'
        });

        // Karan Logs
        attendanceLogs.push({
          student: karan._id,
          date: logDate,
          subject: sub,
          section: 'A',
          faculty: facultyMap[sub],
          time: '09:00 AM',
          method: 'Biometric',
          status: Math.random() > 0.22 ? 'Present' : 'Absent'
        });
      });
    }

    // Priya logs (Section B)
    for (let d = 1; d <= 15; d++) {
      const logDate = new Date(`2026-06-${d < 10 ? '0' + d : d}`);
      if (logDate.getDay() === 0 || logDate.getDay() === 6) continue;

      attendanceLogs.push({
        student: priya._id,
        date: logDate,
        subject: 'Operating Systems',
        section: 'B',
        faculty: 'Prof. Amit Sharma',
        time: '10:00 AM',
        method: 'QR Code',
        status: Math.random() > 0.08 ? 'Present' : 'Absent'
      });
    }

    await Attendance.insertMany(attendanceLogs);

    // 5. Seeding Coursework Assignments
    console.log('Seeding homework assignments...');
    const assignments = [
      // Arjun
      {
        student: arjun._id,
        title: 'Build and Evaluate Decision Tree Models',
        subject: 'Machine Learning',
        section: 'A',
        status: 'Submitted',
        dueDate: new Date('2026-06-25'),
        maxPoints: 100,
        pointsEarned: 95,
        submissionContent: 'Implemented Decision Trees in Python. Accuracy: 93%. Attached git link.',
        submittedAt: new Date('2026-06-24'),
        createdBy: facultyRoy._id
      },
      {
        student: arjun._id,
        title: 'SQL Triggers and Log Auditing',
        subject: 'Database Management Systems',
        section: 'A',
        status: 'Submitted',
        dueDate: new Date('2026-07-02'),
        maxPoints: 50,
        submissionContent: 'Submitted trigger queries file updating e-commerce status lists.',
        submittedAt: new Date('2026-07-01'),
        createdBy: facultyRoy._id
        // Points outstanding to test Faculty grading panel!
      },
      {
        student: arjun._id,
        title: 'Socket Programming TCP Chat App',
        subject: 'Data Structures',
        section: 'A',
        status: 'Pending',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
        maxPoints: 100,
        createdBy: facultySharma._id
      },
      
      // Karan
      {
        student: karan._id,
        title: 'Build and Evaluate Decision Tree Models',
        subject: 'Machine Learning',
        section: 'A',
        status: 'Pending',
        dueDate: new Date('2026-06-25'),
        maxPoints: 100,
        createdBy: facultyRoy._id
      },
      {
        student: karan._id,
        title: 'SQL Triggers and Log Auditing',
        subject: 'Database Management Systems',
        section: 'A',
        status: 'Submitted',
        dueDate: new Date('2026-07-02'),
        maxPoints: 50,
        submissionContent: 'Completed e-commerce logs database procedurals.',
        submittedAt: new Date('2026-07-02'),
        createdBy: facultyRoy._id
      },

      // Priya
      {
        student: priya._id,
        title: 'Custom Linux Kernel Compilation',
        subject: 'Operating Systems',
        section: 'B',
        status: 'Pending',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        maxPoints: 50,
        createdBy: facultySharma._id
      }
    ];
    await Assignment.insertMany(assignments);

    // 6. Seeding Announcements
    console.log('Seeding notices...');
    const notices = [
      {
        icon: 'Briefcase',
        title: 'Google SDE recruitment drive details',
        description: 'Google India drive open for CSE, CGPA >= 8.5. Registrations close July 25, 2026.',
        category: 'Placement',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3)
      },
      {
        icon: 'AlertCircle',
        title: 'Final Trimester Date-Sheet updates',
        description: 'Semester 6 exam drives begin July 20th. Practical sheets are on notice boards.',
        category: 'Notice',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)
      }
    ];
    await Announcement.insertMany(notices);

    // 7. Seeding Fees for all students
    console.log('Seeding student fees...');
    const fees = [
      {
        student: arjun._id,
        totalOutstanding: 1200,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        paymentBreakup: [{ item: 'Academic Tuition Dues', amount: 900 }, { item: 'Library charges', amount: 300 }],
        paymentHistory: [{ semester: 'Semester 5', amount: 4500, status: 'Paid', receiptUrl: 'REC-25983' }]
      },
      {
        student: karan._id,
        totalOutstanding: 1500,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        paymentBreakup: [{ item: 'Academic Tuition Dues', amount: 1000 }, { item: 'Lab dues', amount: 500 }],
        paymentHistory: [{ semester: 'Semester 5', amount: 4500, status: 'Paid', receiptUrl: 'REC-25992' }]
      },
      {
        student: priya._id,
        totalOutstanding: 0, // Cleared
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        paymentBreakup: [],
        paymentHistory: [{ semester: 'Semester 6', amount: 4500, status: 'Paid', receiptUrl: 'REC-26112' }]
      }
    ];
    await Fee.insertMany(fees);

    // 8. Seeding Support Tickets (Helpdesk)
    console.log('Seeding tickets...');
    const tickets = [
      {
        student: arjun._id,
        category: 'Infrastructure',
        priority: 'High',
        subject: 'Hostel Room 302 Wi-Fi cutouts',
        description: 'Frequent network drops make lab uploads difficult.',
        status: 'In Progress',
        assignedTo: facultyRoy._id
      },
      {
        student: karan._id,
        category: 'Finance',
        priority: 'Medium',
        subject: 'Ledger payment transaction double deduction',
        description: 'Deducted twice during Sem 5 checkout.',
        status: 'Open'
      }
    ];
    await Ticket.insertMany(tickets);

    // 9. Seeding Leave Requests
    console.log('Seeding leave applications...');
    const leaves = [
      {
        applicant: arjun._id,
        applicantRole: 'student',
        leaveType: 'Sick Leave',
        fromDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        toDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
        reason: 'Down with viral fever.',
        status: 'Approved'
      },
      {
        applicant: facultyRoy._id,
        applicantRole: 'faculty',
        leaveType: 'On Duty (OD) / Seminar',
        fromDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        toDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        reason: 'Attending National ML Conference.',
        status: 'Pending'
      }
    ];
    await LeaveApplication.insertMany(leaves);

    // 10. Seeding Course Materials
    console.log('Seeding folders course materials...');
    const courseMaterials = [
      {
        subject: 'Machine Learning',
        section: 'A',
        createdBy: facultyRoy._id,
        files: [
          { name: 'Lecture 1: Introduction to Supervised Regression', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'PDF' }
        ]
      },
      {
        subject: 'Data Structures',
        section: 'A',
        createdBy: facultySharma._id,
        files: [
          { name: 'Red-Black Trees balancing procedures', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'PPT' }
        ]
      }
    ];
    await CourseMaterial.insertMany(courseMaterials);

    // 11. Campus general events
    console.log('Seeding campus general events...');
    const campusEvents = [
      { title: 'TechNovation 2026 College Hackathon', icon: 'Cpu', date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6), location: 'Auditorium & Labs', price: 10, seats: 150, category: 'Technical' },
      { title: 'Cultural DJ and Dance Night', icon: 'Music', date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), location: 'Open Quadrangle', price: 0, seats: 80, category: 'Cultural' }
    ];
    const seededEvents = await Event.insertMany(campusEvents);

    // Register Arjun for Hackathon
    const eventReg = new EventRegistration({
      student: arjun._id,
      event: seededEvents[0]._id
    });
    await eventReg.save();

    console.log('Data Seeding completed successfully!');
    console.log('Demo Credentials:');
    console.log('- Students (Section A):');
    console.log('  arjun@eduprime.edu (pass: password123)');
    console.log('  karan@eduprime.edu (pass: password123)');
    console.log('- Students (Section B):');
    console.log('  priya@eduprime.edu (pass: password123)');
    console.log('- Faculty (Roy ML/DBMS, Sharma DS/OS):');
    console.log('  sneha.roy@eduprime.edu (pass: password123)');
    console.log('  amit.sharma@eduprime.edu (pass: password123)');
    console.log('- Admin:');
    console.log('  admin@eduprime.edu (pass: password123)');

    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (err) {
    console.error('Seeding crashed:', err);
    process.exit(1);
  }
}

seedData();
