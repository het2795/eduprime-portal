import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CalendarRange, Info, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const Attendance = () => {
  const [logs, setLogs] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Heatmap month navigation states (timeline: default to July 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 6 is July (0-indexed)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance');
        setLogs(res.data.logs);
        setBreakdown(res.data.breakdown);
      } catch (err) {
        console.error(err);
        setError('Could not retrieve attendance records.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const handleExport = () => {
    window.print();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-brand-green/10 text-brand-green border-brand-green/20';
      case 'Late':
        return 'bg-brand-amber/10 text-brand-amber border-brand-amber/20';
      case 'Absent':
        return 'bg-brand-red/10 text-brand-red border-brand-red/20';
      default:
        return 'bg-slate-105 text-slate-550 border-slate-200';
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate Month Heatmap Grid
  const generateDynamicHeatmap = () => {
    const days = [];

    // Find the starting weekday padding offset (first day of the month)
    // getDay() is 0 for Sunday, 1 for Monday, etc.
    // If we want Monday to be the start of our column grid:
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const startingPaddingDays = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    // Pad beginning cells
    for (let p = 0; p < startingPaddingDays; p++) {
      days.push({ isPadding: true });
    }

    // Get total days in selected month
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // UTC matcher helper to prevent timezone shifts
    const isSameUTCDate = (logDateStr, y, m, d) => {
      const logDate = new Date(logDateStr);
      return logDate.getUTCFullYear() === y && logDate.getUTCMonth() === m && logDate.getUTCDate() === d;
    };

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateLogs = logs.filter(log => isSameUTCDate(log.date, currentYear, currentMonth, d));

      let status = 'No Class';
      if (dateLogs.length > 0) {
        const hasAbsent = dateLogs.some(l => l.status === 'Absent');
        const hasLate = dateLogs.some(l => l.status === 'Late');
        if (hasAbsent) status = 'Absent';
        else if (hasLate) status = 'Late';
        else status = 'Present';
      }

      days.push({
        isPadding: false,
        dayNum: d,
        status,
        dateStr: `${currentYear}-${currentMonth + 1 < 10 ? '0' + (currentMonth + 1) : currentMonth + 1}-${d < 10 ? '0' + d : d}`
      });
    }

    return days;
  };

  const heatmapDays = generateDynamicHeatmap();

  return (
    <div className="space-y-6 print:p-8">
      {/* Subject breakdown header cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {loading ? (
          <div className="col-span-5 h-20 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : breakdown.length === 0 ? (
          <div className="col-span-5 text-center text-slate-450 italic p-4 bg-white dark:bg-navy-805 rounded-xl border border-slate-200/50">
            No subject-wise attendance metrics computed. Keep registering lectures.
          </div>
        ) : (
          breakdown.map((item) => (
            <div
              key={item.subject}
              className="bg-white dark:bg-navy-800 p-4 rounded-xl border border-slate-200/50 dark:border-navy-700/50 flex flex-col justify-between"
            >
              <h4 className="text-[10px] font-bold text-slate-400 truncate uppercase">{item.subject}</h4>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-lg font-extrabold font-heading text-slate-800 dark:text-white">{item.percentage}%</span>
                <span className="text-[9px] text-slate-405 font-semibold">({item.present}/{item.total})</span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full bg-slate-100 dark:bg-navy-900 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    item.percentage >= 85
                      ? 'bg-brand-green'
                      : (item.percentage >= 75 ? 'bg-brand-amber' : 'bg-brand-red')
                  }`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Heatmap Widget */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4 select-none">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4.5 w-4.5 text-brand-blue" />
              <h3 className="text-xs font-bold text-slate-805 dark:text-white font-heading uppercase tracking-wide">
                {monthNames[currentMonth]} {currentYear}
              </h3>
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-205 dark:border-navy-700 rounded bg-slate-50 dark:bg-navy-900"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-205 dark:border-navy-700 rounded bg-slate-50 dark:bg-navy-900"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Header (Mon to Sun) */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 mb-2">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>

          {/* Calendar Grid Body */}
          <div className="grid grid-cols-7 gap-2 flex-1">
            {heatmapDays.map((day, idx) => {
              if (day.isPadding) {
                return <div key={`pad-${idx}`} className="h-9"></div>;
              }

              let bgClass = 'bg-slate-100 dark:bg-navy-900 text-slate-400';
              let tooltip = `${monthNames[currentMonth]} ${day.dayNum}: No Log`;
              
              if (day.status === 'Present') {
                bgClass = 'bg-brand-green text-white';
                tooltip = `${monthNames[currentMonth]} ${day.dayNum}: Present`;
              } else if (day.status === 'Late') {
                bgClass = 'bg-brand-amber text-white';
                tooltip = `${monthNames[currentMonth]} ${day.dayNum}: Late`;
              } else if (day.status === 'Absent') {
                bgClass = 'bg-brand-red text-white';
                tooltip = `${monthNames[currentMonth]} ${day.dayNum}: Absent`;
              }

              return (
                <div
                  key={`day-${day.dayNum}`}
                  title={tooltip}
                  className={`h-9 rounded-lg flex items-center justify-center text-xs font-extrabold cursor-help select-none ${bgClass}`}
                >
                  {day.dayNum}
                </div>
              );
            })}
          </div>

          {/* Heatmap legends */}
          <div className="mt-4 pt-3 border-t border-slate-150 dark:border-navy-700/50 flex justify-between text-[10px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-brand-green"></span> Present</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-brand-amber"></span> Late</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-brand-red"></span> Absent</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-slate-100 dark:bg-navy-900"></span> Off</span>
          </div>
        </div>

        {/* Detailed Attendance logs */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Classroom Attendance Log</h3>
              <p className="text-[10px] text-slate-400">Complete history logs showing class timestamps and verification parameters</p>
            </div>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-[10px] font-heading tracking-wide flex items-center gap-1.5 w-fit select-none"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Record</span>
            </button>
          </div>

          <div className="overflow-x-auto flex-1 max-h-[350px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-navy-700 text-slate-400 font-bold uppercase text-[9px] tracking-wider font-heading">
                  <th className="py-3">Date</th>
                  <th className="py-3">Subject</th>
                  <th className="py-3">Faculty Advisor</th>
                  <th className="py-3">Verification</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-slate-450">Loading attendance log...</td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log._id} className="text-slate-600 dark:text-slate-300">
                      <td className="py-3.5 font-bold text-slate-850 dark:text-white text-[11px] font-mono">
                        {new Date(log.date).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-705 dark:text-slate-200">{log.subject}</td>
                      <td className="py-3.5 text-slate-450">{log.faculty}</td>
                      <td className="py-3.5 text-[10px] font-bold text-slate-450">{log.method}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${getStatusStyle(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-450 italic">No attendance records found.</td>
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

export default Attendance;
