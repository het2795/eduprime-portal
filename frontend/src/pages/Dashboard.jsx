import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  TrendingUp,
  CalendarCheck,
  BookOpen,
  Award,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Connection issues. Please check if backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
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

  if (error) {
    return (
      <div className="p-4 bg-brand-red/10 border border-brand-red/20 rounded-xl text-brand-red text-xs font-semibold flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <span>{error}</span>
      </div>
    );
  }

  // Fallback default values
  const {
    greetingName = 'Student',
    cgpa = 0.0,
    attendancePercentage = 0.0,
    creditsEarned = 0,
    rank = 0,
    assignments = { total: 0, completed: 0, pending: 0 },
    recentAttendance = [],
    upcomingDeadlines = []
  } = data || {};

  // CGPA trend Sem 1 - 6
  const cgpaTrendData = [
    { name: 'Sem 1', CGPA: 8.4 },
    { name: 'Sem 2', CGPA: 8.6 },
    { name: 'Sem 3', CGPA: 8.5 },
    { name: 'Sem 4', CGPA: 8.8 },
    { name: 'Sem 5', CGPA: 8.9 },
    { name: 'Sem 6', CGPA: cgpa }
  ];

  // Attendance Breakdown Pie
  const attendancePieData = [
    { name: 'Machine Learning', value: 89, color: '#10B981' },
    { name: 'Computer Networks', value: 84, color: '#8B5CF6' },
    { name: 'Database Management Systems', value: 92, color: '#3B82F6' },
    { name: 'Operating Systems', value: 86, color: '#EF4444' },
    { name: 'Data Structures', value: 90, color: '#F59E0B' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-green/10 text-brand-green">Present</span>;
      case 'Late':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-amber/10 text-brand-amber">Late</span>;
      case 'Absent':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-red/10 text-brand-red">Absent</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-brand-blue/20 via-brand-purple/10 to-transparent p-6 rounded-2xl border border-brand-blue/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-blue">
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">EduPrime Dashboard</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white font-heading">
            {getGreeting()}, {greetingName}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You have <span className="text-brand-blue font-bold">{assignments.pending} pending assignments</span> to complete and class schedules are active.
          </p>
        </div>
        <div className="bg-white/80 dark:bg-navy-800/80 p-3 rounded-xl border border-slate-200/50 dark:border-navy-700/50 flex items-center gap-3 shrink-0">
          <CalendarCheck className="h-8 w-8 text-brand-green" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold">ATTENDANCE STATUS</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white font-heading">{attendancePercentage}% Overall</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: CGPA */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Overall CGPA</span>
            <h3 className="text-2xl font-extrabold font-heading text-slate-800 dark:text-white">{cgpa}</h3>
            <span className="text-[10px] text-brand-green font-semibold flex items-center gap-0.5">
              ▲ +0.1 <span className="text-slate-400 font-normal">vs last sem</span>
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
            <Award className="h-6 w-6" />
          </div>
        </div>

        {/* Stat 2: Attendance */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Attendance Rate</span>
            <h3 className="text-2xl font-extrabold font-heading text-slate-800 dark:text-white">{attendancePercentage}%</h3>
            <span className="text-[10px] text-brand-green font-semibold flex items-center gap-0.5">
              ▲ +1.2% <span className="text-slate-400 font-normal">this month</span>
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green">
            <CalendarCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Stat 3: Assignments */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Assignments</span>
            <h3 className="text-2xl font-extrabold font-heading text-slate-800 dark:text-white">
              {assignments.completed}/{assignments.total}
            </h3>
            <span className="text-[10px] text-brand-amber font-semibold flex items-center gap-0.5">
              ⚠️ {assignments.pending} pending tasks
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-amber/10 flex items-center justify-center text-brand-amber">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Stat 4: Credits */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Credits Earned</span>
            <h3 className="text-2xl font-extrabold font-heading text-slate-800 dark:text-white">{creditsEarned}</h3>
            <span className="text-[10px] text-brand-purple font-semibold flex items-center gap-0.5">
              ▲ Rank #{rank} <span className="text-slate-400 font-normal">in branch</span>
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-purple/10 flex items-center justify-center text-brand-purple">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Academic Performance */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Academic Performance</h3>
            <p className="text-[10px] text-slate-400">Semester-wise Cumulative Grade Point Average trend (Sem 1–6)</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cgpaTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E3B4E" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis domain={[7.5, 9.5]} stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#475569',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '11px'
                  }}
                />
                <Line type="monotone" dataKey="CGPA" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, stroke: '#3B82F6', strokeWidth: 2, fill: '#FFF' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Attendance Breakdown */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Attendance Breakdown</h3>
            <p className="text-[10px] text-slate-400">Subject-wise current percentage analysis</p>
          </div>
          <div className="h-48 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attendancePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={70} paddingAngle={3} dataKey="value">
                  {attendancePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#475569',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Overall</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white font-heading">{attendancePercentage}%</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center mt-2">
            {attendancePieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-400">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                <span>{d.name.split(' ').map(w => w[0]).join('')}: {d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table: Recent Attendance Logs */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Recent Attendance Logs</h3>
            <p className="text-[10px] text-slate-400">Log tracker from the last 7 classroom sessions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-navy-700 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-2.5">Subject</th>
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
                {recentAttendance.length > 0 ? (
                  recentAttendance.map((log) => (
                    <tr key={log._id} className="text-slate-600 dark:text-slate-300 font-medium">
                      <td className="py-3 font-semibold text-slate-800 dark:text-white">{log.subject}</td>
                      <td className="py-3 text-[11px]">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="py-3 text-[11px] text-slate-400">{log.method}</td>
                      <td className="py-3">{getStatusBadge(log.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-slate-400 font-semibold">No recent logs recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table: Upcoming Deadlines */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Upcoming Deadlines</h3>
            <p className="text-[10px] text-slate-400">Active coursework submissions requiring attention</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-navy-700 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-2.5">Course Work</th>
                  <th className="py-2.5">Due Date</th>
                  <th className="py-2.5">Max Score</th>
                  <th className="py-2.5">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
                {upcomingDeadlines.length > 0 ? (
                  upcomingDeadlines.map((task) => {
                    const daysRemaining = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                    const isUrgent = daysRemaining <= 2;
                    return (
                      <tr key={task._id} className="text-slate-600 dark:text-slate-300 font-medium">
                        <td className="py-3">
                          <p className="font-semibold text-slate-800 dark:text-white">{task.title}</p>
                          <span className="text-[10px] text-slate-400">{task.subject}</span>
                        </td>
                        <td className="py-3 text-[11px]">{new Date(task.dueDate).toLocaleDateString()}</td>
                        <td className="py-3 text-[11px] font-semibold">{task.maxPoints} pts</td>
                        <td className="py-3">
                          {isUrgent ? (
                            <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-brand-red/10 text-brand-red animate-pulse">Urgent ({daysRemaining}d left)</span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-slate-100 dark:bg-navy-700 text-slate-500 dark:text-slate-400">Normal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-slate-400 font-semibold">No pending homework deadlines. All tasks completed!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
