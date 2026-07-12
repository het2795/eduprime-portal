import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, AlertCircle, Inbox, Users } from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch analytics statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    role = 'student',
    subjectMarksData = [],
    attendanceMonthlyData = [],
    gradeDistributionData = [],
    weakestStudents = []
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Intro info banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-navy-800 border border-slate-200/50 dark:border-navy-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm select-none">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white font-heading">
            {role === 'faculty' ? 'Class Performance Analytics' : 'My Performance Analytics'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {role === 'faculty'
              ? 'Aggregated subject statistics, monthly class attendances, and grading distributions across taught divisions.'
              : 'Detailed overview of your marks distributions, subject comparisons, and attendance patterns.'}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs font-semibold rounded-lg border border-brand-blue/20">
            {role === 'faculty' ? `Faculty: ${user?.name}` : 'Current Term: Semester 6'}
          </span>
          <span className="px-3 py-1 bg-brand-purple/10 text-brand-purple text-xs font-semibold rounded-lg border border-brand-purple/20">
            Department: CSE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Performance */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-brand-blue" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">
                {role === 'faculty' ? 'Subject Average Scores' : 'Subject Performance Comparison'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {role === 'faculty'
                  ? 'Average score obtained by students in each subject class taught by you'
                  : 'Comparison of your actual exam marks against the class average'}
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectMarksData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E3B4E" vertical={false} />
                <XAxis dataKey="subject" stroke="#64748B" fontSize={9} tickLine={false} />
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
                <Legend wrapperStyle={{ fontSize: '11px', pt: 10 }} />
                {role === 'faculty' ? (
                  <Bar dataKey="Average Mark" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                ) : (
                  <>
                    <Bar dataKey="Your Mark" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Class Average" fill="#475569" radius={[4, 4, 0, 0]} />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Attendance Trend */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-brand-green" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">
                {role === 'faculty' ? 'Class Aggregate Attendance Trend' : 'Monthly Attendance Trends'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {role === 'faculty'
                  ? 'Monthly percentage aggregate present status of all enrolled students in your classes'
                  : 'Monthly percentage records showing attendance consistency'}
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E3B4E" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="#64748B" fontSize={10} tickLine={false} />
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
                <Area type="monotone" dataKey="Attendance" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" dot={{ r: 4, stroke: '#10B981', strokeWidth: 2, fill: '#FFF' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grade distribution breakdown */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <PieIcon className="h-5 w-5 text-brand-purple" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">
              {role === 'faculty' ? 'Submissions Grade Distribution' : 'Course Grade Distribution'}
            </h3>
            <p className="text-[10px] text-slate-400">
              {role === 'faculty'
                ? "Total distribution bins of grades awarded on students' submissions in your classes"
                : 'Total letter-grades accumulated across all completed courses (Semesters 1-5)'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Donut representation */}
          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gradeDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="count">
                  {gradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
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
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grades</span>
              <span className="text-xl font-black text-slate-850 dark:text-white mt-1">Class</span>
            </div>
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-4">
            {gradeDistributionData.map((entry) => (
              <div key={entry.grade} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200/40 dark:border-navy-700/50">
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{entry.grade}</h4>
                  <p className="text-[10px] text-slate-455 mt-0.5">{entry.count} Submission(s)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Faculty only Weakest Students Alert table */}
      {role === 'faculty' && (
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-red animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white font-heading">Students Requiring Academic Attention</h3>
              <p className="text-[10px] text-slate-400">Roster of students currently flagged with critically low performance (&lt;60% average grade) or low attendance (&lt;75% presence)</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-navy-700 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-2.5">Student Name</th>
                  <th className="py-2.5">Roll ID</th>
                  <th className="py-2.5">Current Attendance</th>
                  <th className="py-2.5">Taught Grade Avg</th>
                  <th className="py-2.5">Alert Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50 font-medium">
                {weakestStudents.length > 0 ? (
                  weakestStudents.map((stud, idx) => (
                    <tr key={idx} className="text-slate-655 dark:text-slate-350">
                      <td className="py-3.5 font-bold text-slate-800 dark:text-white">{stud.name}</td>
                      <td className="py-3.5 font-mono font-bold text-brand-blue">{stud.rollNo}</td>
                      <td className="py-3.5 font-bold text-brand-red">{stud.attendance}%</td>
                      <td className="py-3.5 font-bold text-brand-amber">{stud.averageGrade}%</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-brand-red/10 text-brand-red border border-brand-red/20">
                          {stud.reason}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-450 italic">No students are currently below academic intervention thresholds. Excellent!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
