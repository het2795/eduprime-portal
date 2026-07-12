import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CalendarRange, ShieldAlert, Check, X, AlertTriangle, Users } from 'lucide-react';

const MarkAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState({}); // studentId -> 'Present' | 'Absent' | 'Late'
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/faculty/classes');
        setClasses(res.data);
        if (res.data.length > 0) {
          setSelectedClassId(res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const activeClass = classes.find(c => c._id === selectedClassId);

  const fetchRoster = async () => {
    if (!activeClass) return;
    setLoadingStudents(true);
    try {
      const res = await api.get(`/faculty/students?subject=${activeClass.subject}&section=${activeClass.section}`);
      setStudents(res.data);
      
      // Initialize logs to 'Present' by default
      const initialLogs = {};
      res.data.forEach(s => {
        initialLogs[s._id] = 'Present';
      });
      setLogs(initialLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [selectedClassId]);

  const handleStatusChange = (studentId, status) => {
    setLogs(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach(s => {
      updated[s._id] = status;
    });
    setLogs(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (students.length === 0 || !activeClass) return;
    setSubmitting(true);

    const logArray = Object.keys(logs).map(studentId => ({
      studentId,
      status: logs[studentId]
    }));

    try {
      await api.post('/attendance/mark', {
        subject: activeClass.subject,
        section: activeClass.section,
        date,
        logs: logArray
      });
      alert('Attendance marked and saved to student records!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit attendance logs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtering selectors header */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-wrap gap-4 items-end justify-between select-none">
        <div className="flex flex-wrap gap-4 items-end flex-1">
          {/* Class Select */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Select Class</label>
            {loadingClasses ? (
              <div className="h-9 w-40 bg-slate-100 rounded animate-pulse"></div>
            ) : (
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
              >
                {classes.map(c => (
                  <option key={c._id} value={c._id}>{c.subject} (Sec {c.section})</option>
                ))}
              </select>
            )}
          </div>

          {/* Date select */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Date of Record</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
            />
          </div>
        </div>

        {students.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleMarkAll('Present')}
              className="px-2.5 py-1.5 rounded-lg bg-brand-green/10 text-brand-green border border-brand-green/20 text-[9px] font-bold uppercase tracking-wider"
            >
              All Present
            </button>
            <button
              onClick={() => handleMarkAll('Absent')}
              className="px-2.5 py-1.5 rounded-lg bg-brand-red/10 text-brand-red border border-brand-red/20 text-[9px] font-bold uppercase tracking-wider"
            >
              All Absent
            </button>
          </div>
        )}
      </div>

      {/* Roster table */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Class Roster</h3>
          <p className="text-[10px] text-slate-400">Mark students attendance for the selected date</p>
        </div>

        {loadingStudents ? (
          <div className="py-12 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-slate-400 italic">No students registered in this section group.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-navy-700 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                    <th className="py-2.5">Roll ID</th>
                    <th className="py-2.5">Student Name</th>
                    <th className="py-2.5">Current Attendance</th>
                    <th className="py-2.5 text-center">Status Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
                  {students.map((student) => {
                    const status = logs[student._id] || 'Present';
                    return (
                      <tr key={student._id} className="text-slate-650 dark:text-slate-300 font-medium">
                        <td className="py-3 font-mono font-bold text-brand-blue">{student.rollNo}</td>
                        <td className="py-3 font-bold text-slate-800 dark:text-white">{student.name}</td>
                        <td className="py-3 font-semibold text-slate-400">{student.attendancePercentage}% overall</td>
                        <td className="py-3">
                          <div className="flex justify-center gap-1.5 select-none">
                            {['Present', 'Absent', 'Late'].map((st) => {
                              const isActive = status === st;
                              let btnClass = 'text-slate-400 border-slate-200 dark:border-navy-700 bg-transparent hover:text-slate-200';
                              if (isActive) {
                                if (st === 'Present') btnClass = 'bg-brand-green text-white border-brand-green';
                                else if (st === 'Absent') btnClass = 'bg-brand-red text-white border-brand-red';
                                else btnClass = 'bg-brand-amber text-white border-brand-amber';
                              }
                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleStatusChange(student._id, st)}
                                  className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-all ${btnClass}`}
                                >
                                  {st}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-navy-700/40">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs font-heading tracking-wide shadow-md shadow-brand-blue/20 flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Submit Attendance'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MarkAttendance;
