import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layers, Users, BookOpen, MapPin, Inbox, AlertCircle } from 'lucide-react';

const FacultyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/faculty/classes');
        setClasses(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-white dark:bg-navy-800 border border-slate-200/50 dark:border-navy-700/50 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white font-heading">My Classes Roster</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Rosters, divisions, and student capacities currently assigned under your academic domain.</p>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : classes.length === 0 ? (
        <div className="py-12 bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 text-center flex flex-col items-center justify-center gap-3">
          <Inbox className="h-10 w-10 text-slate-400" />
          <p className="text-sm font-bold text-slate-800 dark:text-white font-heading">No classes assigned</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between hover-lift"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-navy-700/50">
                  <div className="h-9 w-9 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-heading">{cls.subject}</h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Section {cls.section}</span>
                  </div>
                </div>

                {/* Info List */}
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex items-center gap-2 text-slate-550 dark:text-slate-350">
                    <Users className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{cls.students?.length || 0} Registered Students</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-550 dark:text-slate-350">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Lecture Room: {cls.room || 'LHC-301'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyClasses;
