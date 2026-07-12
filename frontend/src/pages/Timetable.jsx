import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CalendarRange, Info, Clock, Download, ArrowRight, BookOpen } from 'lucide-react';

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get('/timetable');
        setTimetable(res.data);
      } catch (err) {
        console.error('Failed to fetch timetable:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'];

  // Map slots to helper object key: "Day-Time"
  const getSlot = (day, time) => {
    return timetable.find(slot => slot.day === day && slot.timeStart === time);
  };

  const handleExport = () => {
    window.print();
  };

  // Find next class banner (Mock search based on day/time)
  const getNextClass = () => {
    if (timetable.length === 0) return null;
    // Just grab first slot that fits a logical next class
    const next = timetable[3] || timetable[0]; // Data Structures Lab or Machine Learning
    return next;
  };

  const nextClass = getNextClass();

  return (
    <div className="space-y-6 print:p-8">
      {/* Next Class Banner Strip */}
      {nextClass && (
        <div className="bg-brand-blue/15 border border-brand-blue/30 p-4 rounded-xl flex items-center justify-between flex-wrap gap-4 animate-pulse-subtle">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-brand-blue flex items-center justify-center text-white shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Upcoming Lecture</p>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-0.5">
                {nextClass.subject} ({nextClass.type}) — Room {nextClass.room}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-navy-800 text-[10px] font-bold text-slate-300 font-mono">
              Starts: {nextClass.timeStart} ({nextClass.day})
            </span>
            <ArrowRight className="h-4 w-4 text-brand-blue hidden sm:block" />
          </div>
        </div>
      )}

      {/* Main Timetable View */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Weekly Lecture Schedule</h3>
            <p className="text-[10px] text-slate-400">Regular lecture blocks and lab routines for the active trimester</p>
          </div>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-[10px] font-heading tracking-wide flex items-center gap-1.5 w-fit select-none"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Schedule</span>
          </button>
        </div>

        {loading ? (
          <div className="h-60 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse table-fixed min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-250 dark:border-navy-700">
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase w-28">Time Slot</th>
                  {days.map(d => (
                    <th key={d} className="py-3 text-[10px] font-bold text-slate-400 uppercase">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-navy-700/50">
                {times.map((time) => (
                  <tr key={time} className="h-20">
                    {/* Time Column */}
                    <td className="py-3 border-r border-slate-150 dark:border-navy-700/50 text-[10px] font-bold text-slate-400 font-mono">
                      {time}
                    </td>
                    
                    {/* Days column */}
                    {days.map((day) => {
                      const slot = getSlot(day, time);
                      if (slot) {
                        const isLab = slot.type === 'Lab';
                        return (
                          <td key={`${day}-${time}`} className="p-1">
                            <div
                              className={`h-full rounded-xl p-2.5 border flex flex-col justify-between transition-all hover:scale-[1.02] text-left ${
                                isLab
                                  ? 'bg-brand-purple/10 border-brand-purple/20 text-brand-purple'
                                  : 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'
                              }`}
                            >
                              <div>
                                <h4 className="text-[10px] font-bold leading-tight truncate text-slate-800 dark:text-slate-100">{slot.subject}</h4>
                                <span className="text-[8px] font-semibold opacity-85 block mt-0.5">{slot.type}</span>
                              </div>
                              <span className="text-[8px] font-extrabold font-mono opacity-80 mt-1 block">Room {slot.room}</span>
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={`${day}-${time}`} className="p-1">
                          <div className="h-full rounded-xl bg-slate-50/50 dark:bg-navy-900/35 border border-dashed border-slate-200/50 dark:border-navy-700/30 flex items-center justify-center text-[9px] text-slate-350 dark:text-slate-500 italic">
                            Free
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timetable;
