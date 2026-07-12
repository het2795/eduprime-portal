import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const Leave = () => {
  const [requests, setRequests] = useState([]);
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/leave-applications');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    setBtnLoading(true);

    try {
      await api.post('/leave-applications', {
        leaveType,
        fromDate,
        toDate,
        reason
      });
      // Clear form & refresh
      setReason('');
      setFromDate('');
      setToDate('');
      alert('Leave application submitted successfully!');
      await fetchRequests();
    } catch (err) {
      console.error(err);
      alert('Failed to submit leave request.');
    } finally {
      setBtnLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20">Approved</span>;
      case 'Rejected':
        return <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-brand-red/10 text-brand-red border border-brand-red/20">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-brand-amber/10 text-brand-amber border border-brand-amber/20">Pending</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Submit Form */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between h-fit">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Apply for Leave</h3>
          <p className="text-[10px] text-slate-400">Request formal academic leave approval from advisor/mentor</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Leave Type */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Leave Category</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-850 dark:text-white outline-none focus:border-brand-blue"
            >
              <option value="Sick Leave">Sick Leave</option>
              <option value="Medical Leave">Medical Leave</option>
              <option value="Personal Leave">Personal Leave</option>
              <option value="On Duty (OD) / Seminar">On Duty (OD) / Seminar</option>
            </select>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Reason description</label>
            <textarea
              rows="4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a clear description for applying..."
              className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={btnLoading}
            className="w-full py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs font-heading tracking-wide transition-all shadow-md shadow-brand-blue/15 flex items-center justify-center gap-1.5"
          >
            {btnLoading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Submit Application'
            )}
          </button>
        </form>
      </div>

      {/* History log */}
      <div className="lg:col-span-2 bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Application History</h3>
          <p className="text-[10px] text-slate-400">Log tracker for previous leave submissions and approval outcomes</p>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-navy-700 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-2.5">Category</th>
                <th className="py-2.5">Duration</th>
                <th className="py-2.5">Reason</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-slate-400">Loading applications...</td>
                </tr>
              ) : requests.length > 0 ? (
                requests.map((req) => (
                  <tr key={req._id} className="text-slate-600 dark:text-slate-300 font-medium">
                    <td className="py-3.5 font-bold text-slate-850 dark:text-white">{req.leaveType}</td>
                    <td className="py-3.5 text-[10.5px] font-semibold text-slate-500">
                      {new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 text-[11px] max-w-xs truncate text-slate-400" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="py-3.5">{getStatusBadge(req.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-slate-450 italic">No leave applications submitted yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leave;
