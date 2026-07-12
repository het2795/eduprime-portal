import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, ShieldAlert, Key, Search, UserPlus, X, RefreshCw } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('student');
  const [loading, setLoading] = useState(true);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  
  // Student fields
  const [rollNo, setRollNo] = useState('');
  const [dept, setDept] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('3rd Year');
  const [semester, setSemester] = useState('6');
  const [section, setSection] = useState('A');
  const [cgpa, setCgpa] = useState('0.0');

  // Faculty fields
  const [designation, setDesignation] = useState('Assistant Professor');
  const [officeHours, setOfficeHours] = useState('');

  const [btnLoading, setBtnLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?role=${roleFilter}`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setEmail('');
    setPassword('');
    setName('');
    setRole(roleFilter);
    setRollNo('');
    setDept('Computer Science & Engineering');
    setYear('3rd Year');
    setSemester('6');
    setSection('A');
    setCgpa('0.0');
    setDesignation('Assistant Professor');
    setOfficeHours('');
    setModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingId(u._id);
    setEmail(u.email);
    setPassword(''); // Leave blank if not updating
    setName(u.name);
    setRole(u.role);
    setRollNo(u.rollNo || '');
    setDept(u.dept || u.department || 'Computer Science & Engineering');
    setYear(u.year || '3rd Year');
    setSemester(u.semester || '6');
    setSection(u.section || 'A');
    setCgpa(u.cgpa?.toString() || '0.0');
    setDesignation(u.designation || 'Assistant Professor');
    setOfficeHours(u.officeHours || '');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const payload = {
      email,
      name,
      role,
      dept,
      department: dept,
      year,
      semester,
      section,
      cgpa: parseFloat(cgpa || 0),
      rollNo,
      designation,
      officeHours
    };

    if (password) {
      payload.password = password;
    }

    try {
      if (editingId) {
        await api.put(`/admin/users/${editingId}`, payload);
        alert('User updated successfully!');
      } else {
        await api.post('/admin/users', payload);
        alert('User added successfully!');
      }
      setModalOpen(false);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Operation failed. Please verify fields.');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user from system records?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      alert('User removed from directory.');
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Deletion failed.');
    }
  };

  // Local Search filtering
  const filteredUsers = users.filter((u) => {
    const val = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(val) ||
      u.email.toLowerCase().includes(val) ||
      (u.rollNo && u.rollNo.toLowerCase().includes(val))
    );
  });

  return (
    <div className="space-y-6">
      {/* Filtering header and tools */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Tab role filter */}
          {['student', 'faculty', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wide transition-all ${
                roleFilter === r
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/15'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-700/40'
              }`}
            >
              {r}s
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full sm:w-auto shrink-0">
          {/* Search bar */}
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search by name, roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 outline-none text-slate-800 dark:text-white"
            />
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          </div>

          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-[10px] uppercase font-heading tracking-wide rounded-lg shadow flex items-center gap-1 shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Main Roster Grid */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading capitalize">{roleFilter} Directory</h3>
          <p className="text-[10px] text-slate-400">Total active registration files managed under {roleFilter} profiles</p>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 italic">No users found matching query details.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-navy-700 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Registration ID</th>
                  <th className="py-2.5">Department</th>
                  <th className="py-2.5">Academic/Staff details</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50 font-medium">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="text-slate-655 dark:text-slate-300">
                    <td className="py-3 font-bold text-slate-800 dark:text-white">
                      <p>{u.name}</p>
                      <span className="text-[9px] text-slate-450 font-normal">{u.email}</span>
                    </td>
                    <td className="py-3 font-mono font-bold text-brand-blue">{u.rollNo || 'N/A'}</td>
                    <td className="py-3 text-[11px]">{u.dept || u.department || 'N/A'}</td>
                    <td className="py-3 text-[10px]">
                      {u.role === 'student' ? (
                        <span>Sem {u.semester} · CGPA: {u.cgpa}</span>
                      ) : (
                        <span>Designation: {u.designation || 'Staff'}</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-750 rounded hover:text-brand-blue transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="p-1.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-750 rounded hover:text-brand-red transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Add/Edit User Dialog Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] animate-scaleUp">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-150 dark:border-navy-700 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white font-heading uppercase tracking-wider">
                {editingId ? 'Edit Account File' : 'Register New User'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-805 dark:text-white outline-none focus:border-brand-blue"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Role Type</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
                    disabled={!!editingId}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-805 dark:text-white outline-none focus:border-brand-blue"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">
                    {editingId ? 'Password (Leave blank to keep)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-805 dark:text-white outline-none focus:border-brand-blue"
                    required={!editingId}
                  />
                </div>
              </div>

              {/* Student specific fields */}
              {role === 'student' && (
                <div className="space-y-4 border-t border-slate-100 dark:border-navy-700/60 pt-3">
                  <h4 className="text-[10px] font-bold text-brand-blue uppercase tracking-widest leading-none">Student Academic Specs</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase">Roll ID</label>
                      <input
                        type="text"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase">Semester</label>
                      <input
                        type="text"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase">Section</label>
                      <input
                        type="text"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase">Active CGPA</label>
                      <input
                        type="text"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                        className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase">Department</label>
                      <input
                        type="text"
                        value={dept}
                        onChange={(e) => setDept(e.target.value)}
                        className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Faculty specific fields */}
              {role === 'faculty' && (
                <div className="space-y-4 border-t border-slate-100 dark:border-navy-700/60 pt-3">
                  <h4 className="text-[10px] font-bold text-brand-purple uppercase tracking-widest leading-none">Faculty Office Specs</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase">Designation</label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase">Office Hours</label>
                      <input
                        type="text"
                        placeholder="e.g. Mon & Wed 2-4 PM"
                        value={officeHours}
                        onChange={(e) => setOfficeHours(e.target.value)}
                        className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase">Department</label>
                    <input
                      type="text"
                      value={dept}
                      onChange={(e) => setDept(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-805 dark:text-white outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-150 dark:border-navy-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
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
                    'Save Account'
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

export default UserManagement;
