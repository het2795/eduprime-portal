import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { HelpCircle, ShieldAlert, CheckCircle2, UserCheck, X } from 'lucide-react';

const AdminHelpdesk = () => {
  const [tickets, setTickets] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal assign states
  const [activeTicket, setActiveTicket] = useState(null);
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('Open');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const initPage = async () => {
    setLoading(true);
    try {
      const tRes = await api.get('/helpdesk'); // Admins get all populated tickets automatically
      setTickets(tRes.data);

      const fRes = await api.get('/admin/users?role=faculty');
      setFacultyList(fRes.data);
      if (fRes.data.length > 0) {
        setAssignedTo(fRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initPage();
  }, []);

  const openAssignModal = (ticket) => {
    setActiveTicket(ticket);
    setAssignedTo(ticket.assignedTo || (facultyList[0]?._id || ''));
    setStatus(ticket.status);
    setResolutionNotes(ticket.resolutionNotes || '');
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!activeTicket) return;
    setSubmitting(true);

    try {
      await api.put(`/admin/tickets/${activeTicket._id}/assign`, {
        assignedTo,
        status,
        resolutionNotes
      });
      alert('Ticket settings updated successfully!');
      setActiveTicket(null);
      await initPage();
    } catch (err) {
      console.error(err);
      alert('Failed to update ticket assignment details.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High': return 'bg-brand-red/10 text-brand-red border-brand-red/20';
      case 'Medium': return 'bg-brand-amber/10 text-brand-amber border-brand-amber/20';
      default: return 'bg-brand-blue/10 text-brand-blue border-brand-blue/20';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved': return <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-brand-green/10 text-brand-green border border-brand-green/20">Resolved</span>;
      case 'In Progress': return <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-brand-blue/10 text-brand-blue border border-brand-blue/20">In Progress</span>;
      default: return <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-100 dark:bg-navy-900 border border-slate-200">Open</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm">
      <div className="mb-6 pb-3 border-b border-slate-100 dark:border-navy-700 flex justify-between items-center select-none">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading uppercase tracking-wider">Helpdesk Admin</h3>
          <p className="text-[10px] text-slate-400">Escalate support tickets to faculty or close resolved complaints</p>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase">{tickets.length} Tickets active</span>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="py-12 text-center text-slate-400 italic">No tickets reported. Queue is clean.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-medium">
            <thead>
              <tr className="border-b border-slate-100 dark:border-navy-700 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-2.5">Ticket ID</th>
                <th className="py-2.5">Student</th>
                <th className="py-2.5">Issue Subject</th>
                <th className="py-2.5">Priority</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
              {tickets.map((t) => (
                <tr key={t._id} className="text-slate-655 dark:text-slate-300">
                  <td className="py-3.5 font-mono font-bold text-brand-blue">#{t._id.slice(-6).toUpperCase()}</td>
                  <td className="py-3.5 font-bold text-slate-800 dark:text-white">{t.student?.name || 'Student'}</td>
                  <td className="py-3.5">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{t.subject}</p>
                    <p className="text-[9.5px] text-slate-450 truncate max-w-xs">{t.description}</p>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${getPriorityStyle(t.priority)}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3.5">{getStatusBadge(t.status)}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => openAssignModal(t)}
                      className="px-2.5 py-1 rounded bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-750 hover:text-brand-blue text-[10px] font-bold"
                    >
                      Update / Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ticket Assignment Modal Panel */}
      {activeTicket && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-150 dark:border-navy-700 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-850 dark:text-white font-heading uppercase tracking-wider">Update Ticket File</h3>
              <button onClick={() => setActiveTicket(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAssignSubmit} className="p-5 space-y-4 text-xs font-semibold">
              {/* Assign Instructor */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Escalate / Assign to Faculty</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-805 dark:text-white outline-none focus:border-brand-blue"
                >
                  <option value="">Leave Unassigned</option>
                  {facultyList.map(f => (
                    <option key={f._id} value={f._id}>{f.name} ({f.department})</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Ticket Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Resolution Notes */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Resolution Notes</label>
                <textarea
                  rows="3"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Provide resolution summary remarks..."
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTicket(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold font-heading tracking-wide flex items-center gap-1.5"
                >
                  {submitting ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHelpdesk;
