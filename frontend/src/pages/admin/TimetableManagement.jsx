import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Clock, Plus, Trash2, Edit2, ShieldAlert, X, CalendarRange, Layers } from 'lucide-react';

const TimetableManagement = () => {
  const [timetable, setTimetable] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Top header filters
  const [dept, setDept] = useState('Computer Science & Engineering');
  const [section, setSection] = useState('A');
  const [semester, setSemester] = useState('6');

  // Modal / Editor form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('Lecture');
  const [room, setRoom] = useState('');
  const [day, setDay] = useState('Monday');
  const [timeStart, setTimeStart] = useState('09:00 AM');
  const [timeEnd, setTimeEnd] = useState('09:50 AM');
  const [facultyId, setFacultyId] = useState('');
  
  const [btnLoading, setBtnLoading] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'];

  // Helper mappings for duration end-times based on start times
  const timeEndMapping = {
    '09:00 AM': '09:50 AM',
    '10:00 AM': '10:50 AM',
    '11:00 AM': '11:50 AM',
    '02:00 PM': '02:50 PM',
    '03:00 PM': '03:50 PM'
  };

  const fetchTimetableAndFaculty = async () => {
    setLoading(true);
    try {
      const ttRes = await api.get('/timetable'); // Returns slots populated
      setTimetable(ttRes.data);

      const facRes = await api.get('/admin/users?role=faculty');
      setFacultyList(facRes.data);
      if (facRes.data.length > 0) {
        setFacultyId(facRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetableAndFaculty();
  }, []);

  // Filter timetable slots locally to match currently selected section
  const filteredSlots = timetable.filter(slot => slot.section === section);

  const getSlot = (dayName, timeName) => {
    return filteredSlots.find(slot => slot.day === dayName && slot.timeStart === timeName);
  };

  const openAddSlot = (cellDay, cellTime) => {
    setEditingSlotId(null);
    setSubject('');
    setType('Lecture');
    setRoom('');
    setDay(cellDay);
    setTimeStart(cellTime);
    setTimeEnd(timeEndMapping[cellTime] || '09:50 AM');
    if (facultyList.length > 0) {
      setFacultyId(facultyList[0]._id);
    }
    setModalOpen(true);
  };

  const openEditSlot = (slot) => {
    setEditingSlotId(slot._id);
    setSubject(slot.subject);
    setType(slot.type);
    setRoom(slot.room);
    setDay(slot.day);
    setTimeStart(slot.timeStart);
    setTimeEnd(slot.timeEnd);
    setFacultyId(slot.faculty?._id || slot.faculty || '');
    setModalOpen(true);
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    if (!subject || !room || !facultyId) {
      alert('Please fill out all fields.');
      return;
    }
    setBtnLoading(true);

    const payload = {
      subject,
      type,
      room,
      day,
      timeStart,
      timeEnd,
      section, // Scope slot to active section filter
      facultyId
    };

    try {
      if (editingSlotId) {
        await api.put(`/admin/timetable/${editingSlotId}`, payload);
        alert('Slot updated successfully!');
      } else {
        await api.post('/admin/timetable', payload);
        alert('Slot added successfully!');
      }
      setModalOpen(false);
      await fetchTimetableAndFaculty();
    } catch (err) {
      console.error(err);
      alert('Failed to save slot. Please check parameters.');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lecture slot?')) return;
    try {
      await api.delete(`/admin/timetable/${id}`);
      alert('Lecture slot deleted.');
      setModalOpen(false);
      await fetchTimetableAndFaculty();
    } catch (err) {
      console.error(err);
      alert('Failed to delete slot.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Selection Header Bar */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-wrap gap-5 items-end select-none">
        <div className="flex items-center gap-2 pb-2 shrink-0">
          <Layers className="h-5 w-5 text-brand-blue" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-white font-heading uppercase tracking-wider">Weekly Grid Editor</h2>
        </div>

        <div className="flex flex-wrap gap-4 items-end flex-1 justify-end">
          {/* Dept */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase">Department</label>
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="p-2 rounded-lg text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white font-bold outline-none"
            >
              <option value="Computer Science & Engineering">CSE Department</option>
              <option value="Electronics & Communication">ECE Department</option>
            </select>
          </div>

          {/* Semester */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="p-2 rounded-lg text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white font-bold outline-none"
            >
              <option value="6">Trimester Semester 6</option>
              <option value="5">Trimester Semester 5</option>
            </select>
          </div>

          {/* Section */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase">Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="p-2 rounded-lg text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-850 dark:text-white font-bold outline-none"
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
        <div className="mb-6 flex justify-between items-center select-none">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Schedule Matrix</h3>
            <p className="text-[10px] text-slate-400">Click a cell to edit or add a lecture slot directly into the timetable calendar</p>
          </div>
        </div>

        {loading ? (
          <div className="h-60 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse table-fixed min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-navy-700">
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase w-28">Time Slot</th>
                  {days.map(d => (
                    <th key={d} className="py-3 text-[10px] font-bold text-slate-400 uppercase">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-navy-700/50">
                {times.map((time) => (
                  <tr key={time} className="h-24">
                    {/* Time Column */}
                    <td className="py-3 border-r border-slate-150 dark:border-navy-700/50 text-[10.5px] font-bold text-slate-400 font-mono">
                      {time}
                    </td>
                    
                    {/* Days column cells */}
                    {days.map((dayName) => {
                      const slot = getSlot(dayName, time);
                      if (slot) {
                        const isLab = slot.type === 'Lab';
                        return (
                          <td key={`${dayName}-${time}`} className="p-1.5">
                            <div
                              onClick={() => openEditSlot(slot)}
                              className={`h-full rounded-xl p-3 border flex flex-col justify-between transition-all hover:scale-[1.02] text-left cursor-pointer group shadow-sm hover:shadow-md ${
                                isLab
                                  ? 'bg-brand-purple/10 border-brand-purple/20 text-brand-purple hover:bg-brand-purple/15'
                                  : 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue hover:bg-brand-blue/15'
                              }`}
                            >
                              <div className="overflow-hidden">
                                <h4 className="text-[10px] font-extrabold leading-tight truncate text-slate-800 dark:text-slate-100 group-hover:text-brand-blue dark:group-hover:text-brand-blue-lighter">
                                  {slot.subject}
                                </h4>
                                <span className="text-[8px] font-bold opacity-85 block mt-0.5">{slot.type} · Room {slot.room}</span>
                              </div>
                              <span className="text-[8px] font-extrabold text-slate-450 truncate">
                                Ins: {slot.faculty?.name || 'Unassigned'}
                              </span>
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={`${dayName}-${time}`} className="p-1.5">
                          <button
                            type="button"
                            onClick={() => openAddSlot(dayName, time)}
                            className="w-full h-full rounded-xl bg-slate-50/40 dark:bg-navy-900/30 border border-dashed border-slate-200/50 dark:border-navy-750/50 hover:bg-slate-100/50 dark:hover:bg-navy-750/30 hover:border-brand-blue/40 flex items-center justify-center text-slate-350 dark:text-slate-500 hover:text-brand-blue transition-all"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
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

      {/* Editor Modal Popup */}
      {modalOpen && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-150 dark:border-navy-700 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white font-heading uppercase tracking-wider">
                {editingSlotId ? 'Edit Schedule Slot' : 'Create Schedule Slot'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-655 select-none">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSlot} className="p-5 space-y-4 text-xs font-semibold">
              {/* Subject */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Machine Learning..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-805 dark:text-white outline-none focus:border-brand-blue"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Type */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Slot Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-805 dark:text-white outline-none"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab Session</option>
                  </select>
                </div>
                {/* Room */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Classroom Room</label>
                  <input
                    type="text"
                    placeholder="e.g. LHC-301"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-805 dark:text-white outline-none focus:border-brand-blue"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Day */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Day</label>
                  <input
                    type="text"
                    value={day}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-750 text-slate-400 outline-none cursor-not-allowed"
                    readOnly
                  />
                </div>
                {/* Time Start */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Time Slot Block</label>
                  <input
                    type="text"
                    value={timeStart}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-750 text-slate-400 outline-none cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>

              {/* Faculty Select */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Assign Instructor</label>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
                >
                  {facultyList.map(f => (
                    <option key={f._id} value={f._id}>{f.name} ({f.department})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-navy-700/60">
                <div>
                  {editingSlotId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(editingSlotId)}
                      className="px-3.5 py-2 rounded-xl bg-brand-red/10 text-brand-red border border-brand-red/20 hover:bg-brand-red hover:text-white transition-all text-xs font-bold font-heading uppercase"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="flex gap-3 select-none">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={btnLoading}
                    className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold font-heading tracking-wide flex items-center gap-1.5"
                  >
                    {btnLoading ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Save changes'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableManagement;
