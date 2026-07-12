import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, HelpCircle, CreditCard, Sparkles, Plus, Megaphone, CheckCircle2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    studentsCount = 0,
    facultyCount = 0,
    openTickets = 0,
    pendingLeaves = 0,
    totalOutstandingFees = 0,
    recentActivities = {}
  } = data || {};

  const {
    recentLeaves = [],
    recentTickets = [],
    recentUsers = []
  } = recentActivities;

  // College-wide enrollment distribution chart
  const enrollmentDeptData = [
    { name: 'CSE', Students: studentsCount || 3, Faculty: facultyCount || 2 },
    { name: 'ECE', Students: 4, Faculty: 2 },
    { name: 'EE', Students: 2, Faculty: 1 }
  ];

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-brand-blue/20 via-brand-purple/10 to-transparent p-6 rounded-2xl border border-brand-blue/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-blue">
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Administrative Console</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white font-heading">
            System Administrator Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Welcome back, {user?.name}. Operational queues contain <span className="text-brand-amber font-bold">{pendingLeaves} leave requests</span> and <span className="text-brand-red font-bold">{openTickets} active complaints</span>.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Students */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Total Students</span>
            <h3 className="text-xl font-black font-heading text-slate-800 dark:text-white">{studentsCount}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Total Faculty */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Total Faculty</span>
            <h3 className="text-xl font-black font-heading text-slate-800 dark:text-white">{facultyCount}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-brand-purple/10 flex items-center justify-center text-brand-purple">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Total Pending Fees */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Pending Fees</span>
            <h3 className="text-xl font-black font-heading text-slate-800 dark:text-white">${totalOutstandingFees}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-brand-green/10 flex items-center justify-center text-brand-green">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        {/* Open Tickets */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Open Tickets</span>
            <h3 className="text-xl font-black font-heading text-brand-red">{openTickets}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-brand-red/10 flex items-center justify-center text-brand-red">
            <HelpCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Pending Leaves */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Pending Leaves</span>
            <h3 className="text-xl font-black font-heading text-brand-amber">{pendingLeaves}</h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-brand-amber/10 flex items-center justify-center text-brand-amber">
            <FileText className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Grid Quick Actions & Enrollment distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Operations Controls</h3>
            <p className="text-[10px] text-slate-400">Shortcuts to manage academic accounts and configurations</p>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1 select-none">
            <button
              onClick={() => navigate('/admin/users')}
              className="p-3 bg-brand-blue/10 hover:bg-brand-blue/15 text-brand-blue border border-brand-blue/20 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 text-[10px] font-bold font-heading uppercase"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Add Student</span>
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="p-3 bg-brand-purple/10 hover:bg-brand-purple/15 text-brand-purple border border-brand-purple/20 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 text-[10px] font-bold font-heading uppercase"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Add Faculty</span>
            </button>
            <button
              onClick={() => navigate('/announcements')}
              className="p-3 bg-brand-green/10 hover:bg-brand-green/15 text-brand-green border border-brand-green/20 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 text-[10px] font-bold font-heading uppercase"
            >
              <Megaphone className="h-4.5 w-4.5" />
              <span>Post Notice</span>
            </button>
            <button
              onClick={() => navigate('/admin/leave-approvals')}
              className="p-3 bg-brand-amber/10 hover:bg-brand-amber/15 text-brand-amber border border-brand-amber/20 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 text-[10px] font-bold font-heading uppercase"
            >
              <FileText className="h-4.5 w-4.5" />
              <span>Approve Leaves</span>
            </button>
          </div>
        </div>

        {/* Enrollment Distribution */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Department Capacities</h3>
            <p className="text-[10px] text-slate-400">Total faculty and student distribution statistics</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentDeptData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E3B4E" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
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
                <Bar dataKey="Students" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Faculty" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* College wide activity logger table */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Recent Portal Requests</h3>
          <p className="text-[10px] text-slate-400">Live feed showing latest support tickets, user additions, and leave submissions</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Leaves Request */}
          <div className="space-y-3">
            <h4 className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-navy-700/50">Leave Applications Feed</h4>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {recentLeaves.map((l, idx) => (
                <div key={idx} className="p-3 bg-slate-50/50 dark:bg-navy-900/50 rounded-xl border border-slate-250/20 dark:border-navy-700/30 flex justify-between items-center text-xs font-semibold">
                  <div>
                    <h5 className="text-slate-800 dark:text-slate-100">{l.applicant?.name}</h5>
                    <p className="text-[9px] text-slate-450 mt-0.5 capitalize">{l.applicant?.role} · {l.leaveType}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                    l.status === 'Approved' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 'bg-brand-amber/10 text-brand-amber border-brand-amber/20'
                  }`}>{l.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tickets Request */}
          <div className="space-y-3">
            <h4 className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100 dark:border-navy-700/50">Helpdesk Tickets Queue</h4>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {recentTickets.map((t, idx) => (
                <div key={idx} className="p-3 bg-slate-50/50 dark:bg-navy-900/50 rounded-xl border border-slate-250/20 dark:border-navy-700/30 flex justify-between items-center text-xs font-semibold">
                  <div>
                    <h5 className="text-slate-800 dark:text-slate-100 truncate max-w-xs">{t.subject}</h5>
                    <p className="text-[9px] text-slate-450 mt-0.5">By {t.student?.name} · Priority: {t.priority}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                    t.status === 'Resolved' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 'bg-brand-amber/10 text-brand-amber border-brand-amber/20'
                  }`}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
