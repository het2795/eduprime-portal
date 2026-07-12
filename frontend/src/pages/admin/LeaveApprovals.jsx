import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, CheckCircle, XCircle, Clock, Info } from 'lucide-react';

const LeaveApprovals = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoadingId, setBtnLoadingId] = useState(null);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleLeaveDecision = async (id, status) => {
    setBtnLoadingId(id);
    try {
      await api.put(`/admin/leaves/${id}`, { status });
      alert(`Application marked as ${status}!`);
      await fetchLeaves();
    } catch (err) {
      console.error(err);
      alert('Failed to update leave application.');
    } finally {
      setBtnLoadingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm">
      <div className="mb-6 pb-3 border-b border-slate-100 dark:border-navy-700 flex justify-between items-center select-none">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading uppercase tracking-wider">Leave Approvals Queue</h3>
          <p className="text-[10px] text-slate-400">Approve or Reject leave requests from student body and faculty members</p>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase">{leaves.length} Applications</span>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : leaves.length === 0 ? (
        <div className="py-12 text-center text-slate-400 italic">No leave applications submitted. Queue is empty.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-navy-700 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-2.5">Applicant</th>
                <th className="py-2.5">Leave Type</th>
                <th className="py-2.5">Dates / Duration</th>
                <th className="py-2.5">Reason</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50 font-medium">
              {leaves.map((leave) => {
                const isPending = leave.status === 'Pending';
                return (
                  <tr key={leave._id} className="text-slate-655 dark:text-slate-300">
                    <td className="py-3.5 font-bold text-slate-850 dark:text-white">
                      <p>{leave.applicant?.name}</p>
                      <span className="text-[9px] text-slate-450 capitalize font-normal">
                        {leave.applicant?.role} · {leave.applicant?.dept || leave.applicant?.department}
                      </span>
                    </td>
                    <td className="py-3.5 font-semibold text-slate-700 dark:text-slate-200">{leave.leaveType}</td>
                    <td className="py-3.5 font-mono text-[10px] text-slate-500">
                      {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 text-slate-450 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${
                        leave.status === 'Approved' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : (leave.status === 'Rejected' ? 'bg-brand-red/10 text-brand-red border-brand-red/20' : 'bg-brand-amber/10 text-brand-amber border-brand-amber/20')
                      }`}>{leave.status}</span>
                    </td>
                    <td className="py-3.5 text-right">
                      {isPending ? (
                        <div className="flex justify-end gap-1.5 select-none">
                          <button
                            onClick={() => handleLeaveDecision(leave._id, 'Approved')}
                            disabled={btnLoadingId === leave._id}
                            className="p-1 px-2 bg-brand-green hover:bg-brand-green/90 text-white rounded text-[10px] font-bold flex items-center gap-0.5"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleLeaveDecision(leave._id, 'Rejected')}
                            disabled={btnLoadingId === leave._id}
                            className="p-1 px-2 bg-brand-red hover:bg-brand-red/90 text-white rounded text-[10px] font-bold flex items-center gap-0.5"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 italic">Evaluated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovals;
