import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Briefcase, Calendar, DollarSign, AlertCircle, Inbox, ArrowRight, X, Edit, Trash2, Plus } from 'lucide-react';

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & form state
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Notice');
  const [scope, setScope] = useState('College-wide');
  const [btnLoading, setBtnLoading] = useState(false);

  const categories = ['All', 'Notice', 'Event', 'Placement', 'Finance', 'Internship'];

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const url = category === 'All' ? '/announcements' : `/announcements?category=${category}`;
      const res = await api.get(url);
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [category]);

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    setBtnLoading(true);

    try {
      if (editingId) {
        await api.put(`/admin/announcements/${editingId}`, {
          title,
          description,
          category: formCategory,
          scope
        });
        alert('Notice updated successfully!');
      } else {
        await api.post('/admin/announcements', {
          title,
          description,
          category: formCategory,
          scope
        });
        alert('Notice posted successfully!');
      }
      setFormOpen(false);
      setTitle('');
      setDescription('');
      setEditingId(null);
      await fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert('Operation failed.');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice permanently?')) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      alert('Notice deleted.');
      await fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert('Failed to delete notice.');
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'Placement':
        return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20">Placement</span>;
      case 'Event':
        return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20">Event</span>;
      case 'Notice':
        return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-105 dark:bg-navy-700 text-slate-650 dark:text-slate-400 border border-slate-200 dark:border-navy-600">Notice</span>;
      case 'Finance':
        return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-amber/10 text-brand-amber border border-brand-amber/20">Finance</span>;
      case 'Internship':
        return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20">Internship</span>;
      default:
        return <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">{cat}</span>;
    }
  };

  const getAnnouncementIcon = (icon) => {
    switch (icon) {
      case 'Briefcase':
        return <Briefcase className="h-5 w-5 text-brand-blue" />;
      case 'Calendar':
        return <Calendar className="h-5 w-5 text-brand-green" />;
      case 'DollarSign':
        return <DollarSign className="h-5 w-5 text-brand-amber" />;
      default:
        return <Megaphone className="h-5 w-5 text-brand-purple" />;
    }
  };

  const getDaysAgo = (dateStr) => {
    const diffTime = Math.abs(new Date() - new Date(dateStr));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Today';
    return `${diffDays - 1} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Filters & Actions header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-navy-800 border border-slate-200/50 dark:border-navy-700/50 shadow-sm select-none">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-heading transition-all ${
                category === cat
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/15'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {/* Post Button for Faculty & Admin */}
        <div className="flex items-center gap-3">
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <button
              onClick={() => {
                setEditingId(null);
                setTitle('');
                setDescription('');
                setFormCategory('Notice');
                setScope('College-wide');
                setFormOpen(true);
              }}
              className="px-3.5 py-1.5 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-[10px] uppercase font-heading tracking-wide rounded-lg shadow flex items-center gap-1 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Post Notice</span>
            </button>
          )}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {announcements.length} Announcement(s) loaded
          </span>
        </div>
      </div>

      {/* Main card list */}
      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-brand-red/10 border border-brand-red/20 rounded-xl text-brand-red text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      ) : announcements.length === 0 ? (
        <div className="py-12 bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 text-center flex flex-col items-center justify-center gap-3">
          <Inbox className="h-10 w-10 text-slate-400" />
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white font-heading">No announcements posted</p>
            <p className="text-xs text-slate-400">Try switching your category filter or check back later.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex gap-4 hover-lift"
            >
              {/* Icon Container */}
              <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-105 dark:bg-navy-900 border border-slate-200/50 dark:border-navy-700/50 flex items-center justify-center">
                {getAnnouncementIcon(item.icon)}
              </div>

              {/* Text content details */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">{item.title}</h3>
                    {getCategoryBadge(item.category)}
                    {item.scope && item.scope !== 'College-wide' && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                        {item.scope}
                      </span>
                    )}
                  </div>
                  
                  {/* Actions Header controls */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{getDaysAgo(item.timestamp)}</span>
                    {user?.role === 'admin' && (
                      <div className="flex gap-1 select-none">
                        <button
                          onClick={() => {
                            setEditingId(item._id);
                            setTitle(item.title);
                            setDescription(item.description);
                            setFormCategory(item.category);
                            setScope(item.scope || 'College-wide');
                            setFormOpen(true);
                          }}
                          className="p-1 text-slate-450 hover:text-brand-blue"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1 text-slate-450 hover:text-brand-red"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedAnnouncement(item)}
                    className="text-[11px] text-brand-blue font-bold flex items-center gap-1 cursor-pointer hover:underline outline-none"
                  >
                    Read more <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Read More announcement detail */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-2xl w-full max-w-lg overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-150 dark:border-navy-700 flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">{selectedAnnouncement.title}</h3>
                  {getCategoryBadge(selectedAnnouncement.category)}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Posted {new Date(selectedAnnouncement.timestamp || selectedAnnouncement.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelectedAnnouncement(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 select-none">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedAnnouncement.description}</p>
              
              <div className="pt-4 border-t border-slate-100 dark:border-navy-700 flex justify-between items-center text-[10px] font-bold text-slate-405 uppercase">
                <span>Scope: <span className="text-slate-700 dark:text-white">{selectedAnnouncement.scope || 'College-wide'}</span></span>
                <span>Author: <span className="text-brand-blue">{selectedAnnouncement.createdBy?.name || 'Academic Registrar'}</span> ({selectedAnnouncement.createdBy?.role || 'Staff'})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Post / Edit Announcement Form */}
      {formOpen && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-150 dark:border-navy-700 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white font-heading uppercase tracking-wider">
                {editingId ? 'Edit Announcement' : 'Post New Announcement'}
              </h3>
              <button onClick={() => setFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePostNotice} className="p-5 space-y-4 text-xs font-semibold">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Title</label>
                <input
                  type="text"
                  placeholder="e.g. End Trimester Date-Sheet updates..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
                  >
                    <option value="Notice">Notice</option>
                    <option value="Event">Event</option>
                    <option value="Placement">Placement</option>
                    <option value="Finance">Finance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                {/* Scope */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Audience Scope</label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
                  >
                    <option value="College-wide">College-wide</option>
                    <option value="Computer Science & Engineering">CSE Department</option>
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Details Content</label>
                <textarea
                  rows="5"
                  placeholder="Provide announcement details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
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
                    'Publish notice'
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

export default Announcements;
