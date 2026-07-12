import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Briefcase, Info, CheckCircle2, XCircle, Calendar, Users, AlertCircle } from 'lucide-react';

const Placements = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const res = await api.get('/placements');
        setDrives(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrives();
  }, []);

  const handleRegister = (id) => {
    // Optimistic state toggle
    setDrives(prev => prev.map(drive => {
      if (drive.id === id) {
        return { ...drive, status: 'Registered', registered: true };
      }
      return drive;
    }));
    alert('Successfully registered for placement drive!');
  };

  const getStatusBadge = (drive) => {
    if (drive.status === 'Registered') {
      return (
        <span className="px-2.5 py-0.5 text-[9px] font-bold rounded bg-brand-green/10 text-brand-green border border-brand-green/20 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Registered
        </span>
      );
    }
    if (drive.status === 'Closed') {
      return (
        <span className="px-2.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-navy-700 text-slate-500 border border-slate-200 dark:border-navy-600 flex items-center gap-1">
          <XCircle className="h-3 w-3" /> Closed
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 text-[9px] font-bold rounded bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
        Open
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 p-5 rounded-2xl border border-brand-purple/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Placement & Internship Drives</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Campus recruitment scheduler for active engineering graduates.</p>
        </div>
        <div className="flex gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5"><Users className="h-4 w-4 text-brand-blue" /> <span>4 Total Drives</span></div>
          <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-brand-green" /> <span>1 Registered</span></div>
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drives.map((drive) => {
            const isOpen = drive.status === 'Open';
            return (
              <div
                key={drive.id}
                className={`bg-white dark:bg-navy-800 p-5 rounded-2xl border shadow-sm flex flex-col justify-between hover-lift ${
                  drive.registered ? 'border-brand-green/20' : 'border-slate-200/50 dark:border-navy-700/50'
                }`}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center shrink-0">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 dark:text-white font-heading">{drive.company}</h3>
                        <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">{drive.role}</p>
                      </div>
                    </div>
                    {getStatusBadge(drive)}
                  </div>

                  {/* Details */}
                  <div className="p-3 bg-slate-50 dark:bg-navy-900/60 rounded-xl space-y-2 border border-slate-100 dark:border-navy-700/50">
                    <div className="text-[10px] leading-relaxed">
                      <span className="font-bold text-slate-400 uppercase tracking-widest block text-[8px] mb-0.5">Eligibility criteria</span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">{drive.eligibility}</span>
                    </div>
                  </div>
                </div>

                {/* Footer info & Action */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-navy-700/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span className="text-[10px] font-bold font-mono">{new Date(drive.date).toLocaleDateString()}</span>
                  </div>

                  {isOpen ? (
                    <button
                      onClick={() => handleRegister(drive.id)}
                      className="px-4 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-[10px] font-heading tracking-wide shadow-md shadow-brand-blue/15 hover:translate-y-[-0.5px] active:translate-y-[0.5px]"
                    >
                      Register Now
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-750 text-slate-450 dark:text-slate-500 text-[10px] font-bold font-heading border border-slate-200 dark:border-navy-700"
                    >
                      {drive.registered ? 'Registered ✓' : 'Register Closed'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Placements;
