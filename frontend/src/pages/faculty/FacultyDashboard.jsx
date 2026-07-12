import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Users, Award, Calendar, AlertCircle, Clock, Sparkles } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/faculty/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch faculty stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    classesCount = 0,
    studentsCount = 0,
    pendingGrading = 0,
    schedule = [],
    pendingAssignmentsList = []
  } = data || {};

  // Find today's schedule slots (or default to Monday slots if weekend)
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = new Date().getDay();
  const dayName = (dayIndex === 0 || dayIndex === 6) ? 'Monday' : daysOfWeek[dayIndex];

  const todaySchedule = schedule.filter(s => s.day === dayName);

  // subject-wise student marks average trend chart
  const averagePerformanceData = [
    { subject: 'ML', 'Average Score': 82, 'Highest Score': 97 },
    { subject: 'DBMS', 'Average Score': 79, 'Highest Score': 97 },
    { subject: 'DS', 'Average Score': 78, 'Highest Score': 95 },
    { subject: 'OS', 'Average Score': 81, 'Highest Score': 96 }
  ];

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-brand-blue/20 via-brand-purple/10 to-transparent p-6 rounded-2xl border border-brand-blue/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-blue">
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Faculty Portal</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white font-heading">
            {getGreeting()}, Dr. {user?.name.split(' ').slice(-1)[0]}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Today is <span className="text-brand-blue font-bold">{dayName}</span>. You have <span className="text-brand-blue font-bold">{todaySchedule.length} lecture slots</span> and <span className="text-brand-amber font-bold">{pendingGrading} assignments</span> pending review.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Classes Assigned */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Classes</span>
            <h3 className="text-2xl font-extrabold font-heading text-slate-800 dark:text-white">{classesCount} Subjects</h3>
            <p className="text-[10px] text-slate-400 font-semibold">Across Section A & B</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Students</span>
            <h3 className="text-2xl font-extrabold font-heading text-slate-800 dark:text-white">{studentsCount} Active</h3>
            <p className="text-[10px] text-brand-green font-semibold">Enrolled under your care</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Pending Grading */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Gradings</span>
            <h3 className="text-2xl font-extrabold font-heading text-slate-850 dark:text-white text-brand-amber">{pendingGrading} Submissions</h3>
            <p className="text-[10px] text-slate-400 font-semibold">Require immediate review</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-amber/10 flex items-center justify-center text-brand-amber">
            <Award className="h-6 w-6" />
          </div>
        </div>

        {/* Today Attendance Marked */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Attendance Marked</span>
            <h3 className="text-2xl font-extrabold font-heading text-slate-800 dark:text-white">100%</h3>
            <p className="text-[10px] text-brand-purple font-semibold">For all today classes</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-purple/10 flex items-center justify-center text-brand-purple">
            <Calendar className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Average Performance Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Performance Trend</h3>
            <p className="text-[10px] text-slate-400">Class average scores against highest marks in subjects taught by you</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={averagePerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E3B4E" vertical={false} />
                <XAxis dataKey="subject" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#475569',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="Average Score" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Highest Score" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today schedule */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Today's Lecture Schedule</h3>
            <p className="text-[10px] text-slate-400">Active class slots allocated for {dayName}</p>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] pr-1">
            {todaySchedule.length > 0 ? (
              todaySchedule.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-navy-900/50 rounded-xl border border-slate-250/20 dark:border-navy-700/35 flex justify-between items-center gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-brand-blue" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{s.subject}</h4>
                      <p className="text-[9px] text-slate-450 mt-0.5">Section {s.section} · Room {s.room}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold font-mono text-slate-400 shrink-0">{s.timeStart}</span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 italic">No teaching slots scheduled for today.</div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Pending Grading list */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Pending Student Submissions</h3>
          <p className="text-[10px] text-slate-400">Recent homework submissions awaiting point reviews and feedback</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-navy-700 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-2.5">Student</th>
                <th className="py-2.5">Assignment</th>
                <th className="py-2.5">Subject</th>
                <th className="py-2.5">Submitted Date</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
              {pendingAssignmentsList.length > 0 ? (
                pendingAssignmentsList.map((a) => (
                  <tr key={a._id} className="text-slate-650 dark:text-slate-300 font-medium">
                    <td className="py-3 font-semibold text-slate-800 dark:text-white">
                      <p>{a.student?.name}</p>
                      <span className="text-[9px] text-slate-450">{a.student?.rollNo}</span>
                    </td>
                    <td className="py-3 font-semibold text-slate-700 dark:text-slate-200">{a.title}</td>
                    <td className="py-3 text-slate-450">{a.subject} (Sec {a.section})</td>
                    <td className="py-3 text-[10.5px] font-mono text-slate-400">
                      {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-brand-amber/10 text-brand-amber border border-brand-amber/20">
                        Needs Grade
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-450 font-bold italic">All assignments are graded! Excellent.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
