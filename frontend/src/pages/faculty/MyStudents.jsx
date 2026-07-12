import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Info, UserCheck, CalendarCheck, Award, X, Mail } from 'lucide-react';

const MyStudents = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

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

  useEffect(() => {
    const fetchRoster = async () => {
      if (!activeClass) return;
      setLoadingStudents(true);
      try {
        const res = await api.get(`/faculty/students?subject=${activeClass.subject}&section=${activeClass.section}`);
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchRoster();
  }, [selectedClassId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Student List roster */}
      <div className="lg:col-span-2 bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Enrolled Students Roster</h3>
            <p className="text-[10px] text-slate-400">Class database records for the selected subject division</p>
          </div>
          
          {/* Class Select Dropdown */}
          {!loadingClasses && classes.length > 0 && (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="p-1.5 px-3 rounded-lg text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white font-bold outline-none"
            >
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.subject} (Sec {c.section})</option>
              ))}
            </select>
          )}
        </div>

        {loadingStudents ? (
          <div className="py-12 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-slate-400 italic">No registered student rosters found.</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-navy-700 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-2.5">Roll ID</th>
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Attendance</th>
                  <th className="py-2.5">CGPA</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
                {students.map((student) => (
                  <tr key={student._id} className="text-slate-655 dark:text-slate-300 font-medium">
                    <td className="py-3.5 font-mono font-bold text-brand-blue">{student.rollNo}</td>
                    <td className="py-3.5 font-bold text-slate-800 dark:text-white">{student.name}</td>
                    <td className="py-3.5 text-brand-green font-semibold">{student.attendancePercentage}%</td>
                    <td className="py-3.5 font-semibold text-brand-purple">{student.cgpa} / 10.0</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="px-3 py-1 rounded bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 hover:text-brand-blue text-[10px] font-bold"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Profile Detail Panel */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between h-fit">
        {selectedStudent ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-navy-700">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase font-heading">Student File</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{selectedStudent.name}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 dark:bg-navy-900 rounded-xl border border-slate-200/30">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Attendance</span>
                <span className="text-base font-extrabold text-brand-green font-heading mt-1 block">{selectedStudent.attendancePercentage}%</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-navy-900 rounded-xl border border-slate-200/30">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">CGPA Record</span>
                <span className="text-base font-extrabold text-brand-purple font-heading mt-1 block">{selectedStudent.cgpa}</span>
              </div>
            </div>

            {/* General Metadata */}
            <div className="space-y-3.5 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Registered Email</span>
                  <span className="text-slate-700 dark:text-slate-200">{selectedStudent.email}</span>
                </div>
              </div>
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase block">Roll Registration ID</span>
                <span className="font-mono text-slate-700 dark:text-slate-200">{selectedStudent.rollNo}</span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase block">Academic Stand</span>
                <span className="text-slate-700 dark:text-slate-200">CSE Department · Trimester Semester 6</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 italic">
            Select a student row in the roster grid to view their detailed performance file.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyStudents;
