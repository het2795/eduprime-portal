import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Contact, ShieldCheck, Mail, Phone, Home, Heart, Award, Key, Settings, Edit3, X } from 'lucide-react';

const Profile = () => {
  const { user, updateProfileState } = useAuth();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passModalOpen, setPassModalOpen] = useState(false);

  // Edit fields state
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [hostel, setHostel] = useState(user?.hostel || '');
  const [skillsStr, setSkillsStr] = useState(user?.skills?.join(', ') || '');
  const [clubsStr, setClubsStr] = useState(user?.clubs?.join(', ') || '');
  const [btnLoading, setBtnLoading] = useState(false);

  // Password fields state
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passBtnLoading, setPassBtnLoading] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
      const clubs = clubsStr.split(',').map(c => c.trim()).filter(Boolean);

      const res = await api.put('/profile', {
        phone,
        email,
        hostel,
        skills,
        clubs
      });

      updateProfileState(res.data.user);
      alert(res.data.message);
      setEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile settings.');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');
    if (!currPassword || !newPassword) return;
    setPassBtnLoading(true);

    try {
      const res = await api.post('/profile/change-password', {
        currentPassword: currPassword,
        newPassword
      });
      setPassSuccess(res.data.message);
      setCurrPassword('');
      setNewPassword('');
      setTimeout(() => setPassModalOpen(false), 1200);
    } catch (err) {
      console.error(err);
      setPassError(err.response?.data?.message || 'Password update failed.');
    } finally {
      setPassBtnLoading(false);
    }
  };

  const u = user || {};

  return (
    <div className="space-y-6">
      {/* Header Profile Card Banner */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          {/* Avatar frame */}
          <div className="h-20 w-20 rounded-2xl bg-brand-blue/10 border-2 border-brand-blue/30 p-1 flex items-center justify-center">
            <div className="h-full w-full rounded-xl bg-navy-900 flex items-center justify-center text-brand-blue font-bold text-2xl overflow-hidden">
              {u.avatarUrl ? (
                <img src={u.avatarUrl} alt={u.name} className="h-full w-full object-cover" />
              ) : (
                getInitials(u.name)
              )}
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="text-md font-bold text-slate-800 dark:text-white font-heading">{u.name}</h2>
              <span className="px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase bg-brand-blue/15 text-brand-blue">
                Student · 3rd Year
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">Roll ID: {u.rollNo}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{u.dept} · Sec {u.section}</p>
          </div>
        </div>

        {/* Buttons & Quick stats */}
        <div className="flex flex-col gap-3 shrink-0 select-none w-full md:w-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setEditModalOpen(true)}
              className="flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-[10px] font-heading tracking-wide flex items-center justify-center gap-1.5 transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setPassModalOpen(true)}
              className="flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-[10px] font-heading tracking-wide flex items-center justify-center gap-1.5 transition-colors"
            >
              <Key className="h-3.5 w-3.5" />
              <span>Change Password</span>
            </button>
          </div>

          {/* Quick Stats Pills */}
          <div className="grid grid-cols-4 gap-1 text-center bg-slate-50 dark:bg-navy-900/50 p-2 rounded-xl border border-slate-100 dark:border-navy-700/50">
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">CGPA</p>
              <p className="text-xs font-black text-slate-800 dark:text-white font-heading mt-1">{u.cgpa}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">ATTND</p>
              <p className="text-xs font-black text-slate-800 dark:text-white font-heading mt-1">{u.attendancePercentage}%</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">CREDIT</p>
              <p className="text-xs font-black text-slate-800 dark:text-white font-heading mt-1">{u.creditsEarned}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">RANK</p>
              <p className="text-xs font-black text-slate-800 dark:text-white font-heading mt-1">#{u.rank}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Academic details */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-navy-700 pb-2">
            <Award className="h-4.5 w-4.5 text-brand-blue" />
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider font-heading">Academic Registration</h3>
          </div>
          <div className="grid grid-cols-2 gap-y-3.5 text-xs font-semibold">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Department / Branch</span>
              <span className="text-slate-700 dark:text-slate-200">{u.dept}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Batch Course Year</span>
              <span className="text-slate-700 dark:text-slate-200">{u.year} (2023 - 2027)</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Current Trimester Semester</span>
              <span className="text-slate-700 dark:text-slate-200">Semester {u.semester}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Section & Division</span>
              <span className="text-slate-700 dark:text-slate-200">Section {u.section}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Faculty Mentor</span>
              <span className="text-brand-purple">{u.mentor}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Department Advisor</span>
              <span className="text-brand-blue">{u.advisor}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Personal Information */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-navy-700 pb-2">
            <User className="h-4.5 w-4.5 text-brand-purple" />
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider font-heading">Personal Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-y-3.5 text-xs font-semibold">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Date of Birth</span>
              <span className="text-slate-700 dark:text-slate-200">{u.dob}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Gender</span>
              <span className="text-slate-700 dark:text-slate-200">{u.gender}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Blood Group</span>
              <span className="text-brand-red font-bold">{u.bloodGroup || 'O+'}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Aadhar UID Number</span>
              <span className="text-slate-700 dark:text-slate-200">{u.aadhar}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Contact details */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-navy-700 pb-2">
            <Contact className="h-4.5 w-4.5 text-brand-green" />
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider font-heading">Contact Information</h3>
          </div>
          <div className="space-y-3.5 text-xs font-semibold">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase block">Official Email Address</span>
                <span className="text-slate-700 dark:text-slate-200">{u.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-slate-400" />
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase block">Phone Number</span>
                <span className="text-slate-700 dark:text-slate-200">{u.phone}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Home className="h-4 w-4 text-slate-400" />
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase block">Resident Room / Hostel</span>
                <span className="text-slate-700 dark:text-slate-200">{u.hostel}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-navy-700 pt-3">
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase block">Guardian Parent</span>
                <span className="text-slate-700 dark:text-slate-200">{u.guardianName}</span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase block">Guardian Contact</span>
                <span className="text-slate-700 dark:text-slate-200">{u.guardianPhone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Skills & Activities */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-navy-700 pb-2">
            <Settings className="h-4.5 w-4.5 text-brand-amber" />
            <h3 className="text-xs font-bold text-slate-855 dark:text-white uppercase tracking-wider font-heading">Skills & Extras</h3>
          </div>
          <div className="space-y-4">
            {/* Skills tag */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Expertise tags</span>
              <div className="flex flex-wrap gap-1.5">
                {u.skills?.map((s) => (
                  <span key={s} className="px-2.5 py-0.5 bg-slate-100 dark:bg-navy-900 border border-slate-250 dark:border-navy-700 text-slate-600 dark:text-slate-350 rounded-lg text-[10px] font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Clubs bullet list */}
            <div className="space-y-1.5 border-t border-slate-100 dark:border-navy-700 pt-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Campus Clubs & Societies</span>
              <ul className="space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-350 list-disc list-inside">
                {u.clubs?.map((c) => (
                  <li key={c} className="text-slate-650 dark:text-slate-350">{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-150 dark:border-navy-700 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-850 dark:text-white font-heading uppercase tracking-wider">Edit Profile Settings</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-455 hover:text-slate-605">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Hostel Room Details</label>
                <input
                  type="text"
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="e.g. React.js, Python, SQL"
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Clubs (Comma-separated)</label>
                <input
                  type="text"
                  value={clubsStr}
                  onChange={(e) => setClubsStr(e.target.value)}
                  placeholder="e.g. Coding Club, Music society"
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={btnLoading}
                  className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold font-heading tracking-wide shadow-md flex items-center gap-1.5"
                >
                  {btnLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Save Settings'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal Dialog */}
      {passModalOpen && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-150 dark:border-navy-700 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-850 dark:text-white font-heading uppercase tracking-wider">Change Account Password</h3>
              <button onClick={() => setPassModalOpen(false)} className="text-slate-455 hover:text-slate-605">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              {passError && (
                <div className="p-3 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-lg text-xs font-semibold">
                  {passError}
                </div>
              )}
              {passSuccess && (
                <div className="p-3 bg-brand-green/10 border border-brand-green/20 text-brand-green rounded-lg text-xs font-semibold">
                  {passSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Current Password</label>
                <input
                  type="password"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passBtnLoading}
                  className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold font-heading tracking-wide shadow-md flex items-center gap-1.5"
                >
                  {passBtnLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Update Password'
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

export default Profile;
