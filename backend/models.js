const mongoose = require('mongoose');

// User Schema (Admin, Faculty, Student)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
  avatarUrl: String,

  // Role-Specific: Student
  rollNo: String,
  dept: String,
  year: String,
  semester: String,
  section: String,
  cgpa: { type: Number, default: 0.0 },
  attendancePercentage: { type: Number, default: 0.0 },
  creditsEarned: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  dob: String,
  gender: String,
  bloodGroup: String,
  aadhar: String,
  phone: String,
  hostel: String,
  homeCity: String,
  mentor: String,
  advisor: String,
  guardianName: String,
  guardianPhone: String,
  skills: [String],
  clubs: [String],

  // Role-Specific: Faculty
  designation: String, // e.g., Assistant Professor, HOD
  department: String, // e.g., Computer Science
  subjectsTaught: [String], // e.g., ['Machine Learning', 'Database Management Systems']
  officeHours: String, // e.g., 'Mon & Wed: 2:00 PM - 4:00 PM'

  // Role-Specific: Admin
  officeRoom: String // e.g., 'Admin Block, Room 101'
}, { timestamps: true });

// Class / Course Section Linker Model
const classSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  section: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  room: String
}, { timestamps: true });

// Attendance Schema
const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  subject: { type: String, required: true },
  section: String,
  faculty: { type: String, required: true },
  time: { type: String, required: true },
  method: { type: String, enum: ['QR Code', 'Manual', 'Biometric'], default: 'Manual' },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true }
}, { timestamps: true });

// Assignment Schema
const assignmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  section: String,
  status: { type: String, enum: ['Pending', 'Submitted'], default: 'Pending' },
  dueDate: { type: Date, required: true },
  maxPoints: { type: Number, required: true },
  pointsEarned: Number,
  description: String,
  fileUrl: String, // Faculty attached syllabus/spec document
  submissionContent: String,
  submissionFileUrl: String, // Student submitted file
  submittedAt: Date,
  feedback: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Faculty creator
}, { timestamps: true });

// Announcement Schema
const announcementSchema = new mongoose.Schema({
  icon: { type: String, default: 'Info' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Notice', 'Event', 'Placement', 'Finance', 'Internship'], default: 'Notice' },
  scope: { type: String, default: 'College-wide' }, // e.g., 'College-wide' or 'CSE' or 'Section A'
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Timetable Schema
const timetableSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Student specific override if any
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Faculty teaching schedule
  subject: { type: String, required: true },
  type: { type: String, enum: ['Lecture', 'Lab'], required: true },
  room: { type: String, required: true },
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], required: true },
  timeStart: { type: String, required: true }, // e.g. "09:00 AM"
  timeEnd: { type: String, required: true }, // e.g. "09:50 AM"
  section: String
}, { timestamps: true });

// Fee Schema
const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalOutstanding: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paymentBreakup: [
    {
      item: String,
      amount: Number
    }
  ],
  paymentHistory: [
    {
      semester: String,
      amount: Number,
      status: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
      date: { type: Date, default: Date.now },
      receiptUrl: String
    }
  ]
}, { timestamps: true });

// Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  icon: { type: String, default: 'Calendar' },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  price: { type: Number, default: 0 },
  seats: { type: Number, default: 0 },
  category: { type: String, enum: ['All', 'Registered', 'Cultural', 'Technical'], required: true }
}, { timestamps: true });

// Event Registration Schema
const eventRegistrationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: String, default: 'Registered' },
  registrationDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Helpdesk (Ticket) Schema
const ticketSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assigned Faculty or staff
  resolutionNotes: String,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Leave Application Schema
const leaveApplicationSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Student or Faculty
  applicantRole: { type: String, enum: ['student', 'faculty'], default: 'student' },
  leaveType: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

// Course Material Schema
const courseMaterialSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  section: String, // Scoped to section
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  files: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
      type: { type: String, enum: ['PDF', 'PPT', 'Link', 'Document'], default: 'PDF' }
    }
  ]
}, { timestamps: true });

// Chat Message Schema
const chatMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: String, enum: ['user', 'bot'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Class = mongoose.model('Class', classSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);
const Timetable = mongoose.model('Timetable', timetableSchema);
const Fee = mongoose.model('Fee', feeSchema);
const Event = mongoose.model('Event', eventSchema);
const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema);
const Ticket = mongoose.model('Ticket', ticketSchema);
const LeaveApplication = mongoose.model('LeaveApplication', leaveApplicationSchema);
const CourseMaterial = mongoose.model('CourseMaterial', courseMaterialSchema);
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = {
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
};
