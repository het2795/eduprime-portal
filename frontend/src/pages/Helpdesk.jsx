import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { HelpCircle, Plus, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const Helpdesk = () => {
  const [tickets, setTickets] = useState([]);
  const [category, setCategory] = useState('Academics');
  const [priority, setPriority] = useState('Medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/helpdesk');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    setBtnLoading(true);

    try {
      await api.post('/helpdesk', {
        category,
        priority,
        subject,
        description
      });
      setSubject('');
      setDescription('');
      alert('Support ticket created successfully!');
      await fetchTickets();
    } catch (err) {
      console.error(err);
      alert('Failed to submit ticket.');
    } finally {
      setBtnLoading(false);
    }
  };

  const getPriorityStyle = (prio) => {
    switch (prio) {
      case 'High':
        return 'bg-brand-red/10 text-brand-red border border-brand-red/20';
      case 'Medium':
        return 'bg-brand-amber/10 text-brand-amber border border-brand-amber/20';
      default:
        return 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-brand-green/10 text-brand-green border border-brand-green/20">Resolved</span>;
      case 'In Progress':
        return <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-brand-blue/10 text-brand-blue border border-brand-blue/20 animate-pulse">In Progress</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-slate-105 text-slate-400 border border-slate-200/50">Open</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Submit Ticket Form */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between h-fit">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Submit a Complaint</h3>
          <p className="text-[10px] text-slate-400">File a support ticket for infrastructure, finance, or academic issues</p>
        </div>

        <form onSubmit={handleSubmitTicket} className="space-y-4">
          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Complaint Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue transition-colors"
            >
              <option value="Academics">Academics</option>
              <option value="Hostel & Mess">Hostel & Mess</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Finance & Dues">Finance & Dues</option>
              <option value="IT Services & Wi-Fi">IT Services & Wi-Fi</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>

          {/* Priority Pills Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Ticket Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {['Low', 'Medium', 'High'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1.5 rounded-lg text-[10.5px] font-bold font-heading border transition-all ${
                    priority === p
                      ? (p === 'High' ? 'bg-brand-red text-white border-brand-red' : (p === 'Medium' ? 'bg-brand-amber text-white border-brand-amber' : 'bg-brand-blue text-white border-brand-blue'))
                      : 'bg-transparent text-slate-400 border-slate-200 dark:border-navy-700 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Subject / Title</label>
            <input
              type="text"
              placeholder="Brief summary of the issue..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Detailed Description</label>
            <textarea
              rows="4"
              placeholder="Describe the complaint in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={btnLoading}
            className="w-full py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs font-heading tracking-wide transition-all shadow-md shadow-brand-blue/15 flex items-center justify-center gap-1.5"
          >
            {btnLoading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Submit Support Ticket'
            )}
          </button>
        </form>
      </div>

      {/* Tickets List */}
      <div className="lg:col-span-2 bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">My Tickets</h3>
            <p className="text-[10px] text-slate-400">Track active support queries and administrative feedback histories</p>
          </div>
          <button
            onClick={fetchTickets}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-750 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* List Layout */}
        <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1">
          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <div className="h-5 w-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : tickets.length > 0 ? (
            tickets.map((t) => (
              <div
                key={t._id}
                className="p-4 bg-slate-50 dark:bg-navy-900/50 rounded-xl border border-slate-200/30 dark:border-navy-700/30 space-y-2.5 transition-all hover:bg-slate-100 dark:hover:bg-navy-900"
              >
                {/* Meta row */}
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-brand-blue font-mono">ID: {t._id.slice(-6).toUpperCase()}</span>
                    <span className={`px-2 py-0.5 text-[8px] font-bold rounded ${getPriorityStyle(t.priority)}`}>
                      {t.priority} Priority
                    </span>
                  </div>
                  {getStatusBadge(t.status)}
                </div>

                {/* Subject & Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white font-heading">{t.subject}</h4>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-450 mt-1">{t.description}</p>
                </div>

                {/* Footer date */}
                <div className="pt-2 border-t border-slate-150 dark:border-navy-700/30 flex justify-between text-[9px] text-slate-400 font-semibold font-mono">
                  <span>Category: {t.category}</span>
                  <span>{new Date(t.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 italic">No tickets submitted. Your queue is clean.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Helpdesk;
