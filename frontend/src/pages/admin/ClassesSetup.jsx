import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layers, Plus, ShieldCheck, Users, MapPin, X } from 'lucide-react';

const ClassesSetup = () => {
  const [classes, setClasses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('A');
  const [facultyId, setFacultyId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]); // Array of IDs
  const [room, setRoom] = useState('');

  const [btnLoading, setBtnLoading] = useState(false);

  const initPage = async () => {
    setLoading(true);
    try {
      const clsRes = await api.get('/admin/classes');
      setClasses(clsRes.data);

      const facRes = await api.get('/admin/users?role=faculty');
      setFacultyList(facRes.data);
      if (facRes.data.length > 0) {
        setFacultyId(facRes.data[0]._id);
      }

      const studRes = await api.get('/admin/users?role=student');
      setStudentList(studRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initPage();
  }, []);

  const handleStudentCheckbox = (id) => {
    setSelectedStudents(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!subject || !facultyId) {
      alert('Please provide subject and instructor.');
      return;
    }
    setBtnLoading(true);

    try {
      await api.post('/admin/classes', {
        subject,
        section,
        facultyId,
        studentIds: selectedStudents,
        room
      });
      alert('Class section mapped successfully!');
      setSubject('');
      setRoom('');
      setSelectedStudents([]);
      await initPage();
    } catch (err) {
      console.error(err);
      alert('Failed to map class.');
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Create Form */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm h-fit">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Course & Section Map</h3>
          <p className="text-[10px] text-slate-400">Map a subject and section division to an instructor and students</p>
        </div>

        <form onSubmit={handleCreateClass} className="space-y-4">
          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Subject Name</label>
            <input
              type="text"
              placeholder="e.g. Machine Learning"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-808 dark:text-white outline-none focus:border-brand-blue"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Section */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Section</label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
                required
              />
            </div>
            {/* Room */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Room</label>
              <input
                type="text"
                placeholder="e.g. LHC-301"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Faculty list select */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Assign Instructor</label>
            <select
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
            >
              {facultyList.map(f => (
                <option key={f._id} value={f._id}>{f.name} ({f.designation})</option>
              ))}
            </select>
          </div>

          {/* Student enrollment Checklist */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Enroll Students</label>
            <div className="max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl space-y-1.5">
              {studentList.map(s => (
                <div key={s._id} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(s._id)}
                    onChange={() => handleStudentCheckbox(s._id)}
                    className="rounded text-brand-blue focus:ring-brand-blue h-3.5 w-3.5"
                  />
                  <span>{s.name} ({s.rollNo})</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={btnLoading}
            className="w-full py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs font-heading tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            {btnLoading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Save Class Mapping'
            )}
          </button>
        </form>
      </div>

      {/* Classes list */}
      <div className="lg:col-span-2 bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Assigned Class Groups</h3>
          <p className="text-[10px] text-slate-400">Database map links connecting faculty, subjects, and student rosters</p>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : classes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 italic">No class groups mapped. Create a mapping in the form.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[480px] pr-1">
            {classes.map((cls) => (
              <div
                key={cls._id}
                className="p-4 bg-slate-50/50 dark:bg-navy-900/50 rounded-xl border border-slate-200/40 dark:border-navy-700/40 space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase font-heading">{cls.subject}</h4>
                    <span className="text-[9px] text-brand-blue font-bold">Section {cls.section}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Room: {cls.room || 'N/A'}</span>
                </div>
                <div className="text-[10.5px] font-semibold text-slate-550 dark:text-slate-350">
                  <p>Instructor: <span className="text-brand-purple">{cls.faculty?.name || 'Unassigned'}</span></p>
                  <p className="mt-1">Students enrolled: <span className="text-slate-700 dark:text-white">{cls.students?.length || 0}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassesSetup;
