import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BookOpen, FileText, CheckCircle2, AlertCircle, Calendar, Plus, Upload, X } from 'lucide-react';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingId, setSubmittingId] = useState(null); // Active assignment ID in modal
  const [submissionText, setSubmissionText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const openSubmitModal = (id) => {
    setSubmittingId(id);
    setSubmissionText('');
    setModalOpen(true);
  };

  const closeSubmitModal = () => {
    setSubmittingId(null);
    setSubmissionText('');
    setModalOpen(false);
  };

  const handlePostSubmission = async (e) => {
    e.preventDefault();
    if (!submissionText.trim()) return;
    setBtnLoading(true);

    try {
      await api.post(`/assignments/${submittingId}/submit`, {
        submissionContent: submissionText
      });
      // Fetch updated assignments and close modal
      await fetchAssignments();
      closeSubmitModal();
    } catch (err) {
      console.error(err);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setBtnLoading(false);
    }
  };

  // Group assignments by subject
  const groupedAssignments = assignments.reduce((groups, item) => {
    const sub = item.subject;
    if (!groups[sub]) {
      groups[sub] = [];
    }
    groups[sub].push(item);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {/* Alert status summary */}
      {error && (
        <div className="p-4 bg-brand-red/10 border border-brand-red/20 rounded-xl text-brand-red text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : Object.keys(groupedAssignments).length === 0 ? (
        <div className="py-12 bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 text-center flex flex-col items-center justify-center gap-3">
          <BookOpen className="h-10 w-10 text-slate-400" />
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white font-heading">No assignments found</p>
            <p className="text-xs text-slate-400">All coursework is currently clear.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(groupedAssignments).map((subject) => (
            <div key={subject} className="space-y-3">
              {/* Subject Title */}
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-navy-700/50 pb-2">
                <BookOpen className="h-4.5 w-4.5 text-brand-blue" />
                <h2 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-heading">{subject}</h2>
                <span className="text-[10px] text-slate-400 font-semibold">({groupedAssignments[subject].length} task)</span>
              </div>

              {/* Assignment list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedAssignments[subject].map((task) => {
                  const isSubmitted = task.status === 'Submitted';
                  const daysRemaining = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysRemaining <= 2 && !isSubmitted;

                  return (
                    <div
                      key={task._id}
                      className={`p-5 rounded-2xl border bg-white dark:bg-navy-800 shadow-sm flex flex-col justify-between transition-all ${
                        isSubmitted ? 'border-brand-green/20' : (isUrgent ? 'border-brand-red/30' : 'border-slate-200/50 dark:border-navy-700/50')
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Status bar */}
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Max Point: {task.maxPoints}</span>
                          <div className="flex items-center gap-1.5">
                            {isUrgent && (
                              <span className="px-2 py-0.5 text-[8px] font-bold rounded bg-brand-red/10 text-brand-red animate-pulse">URGENT</span>
                            )}
                            {isSubmitted ? (
                              <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-brand-green/10 text-brand-green flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Submitted
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-full bg-brand-amber/10 text-brand-amber">Pending</span>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xs font-bold text-slate-800 dark:text-white font-heading leading-snug">{task.title}</h3>
                      </div>

                      {/* Due Date & Action */}
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-navy-700/40 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-medium font-mono">{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>

                        {isSubmitted ? (
                          <button
                            disabled
                            className="px-3 py-1 rounded bg-brand-green/10 text-brand-green border border-brand-green/20 text-[10px] font-bold font-heading flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Done
                          </button>
                        ) : (
                          <button
                            onClick={() => openSubmitModal(task._id)}
                            className="px-3 py-1 rounded bg-brand-blue hover:bg-brand-blue/90 text-white text-[10px] font-bold font-heading shadow-md shadow-brand-blue/10 flex items-center gap-1 hover:translate-y-[-0.5px] active:translate-y-[0.5px]"
                          >
                            <Upload className="h-3.5 w-3.5" /> Upload Submission
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-2xl w-full max-w-lg overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-150 dark:border-navy-700 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white font-heading uppercase tracking-wider">Submit Coursework</h3>
              <button onClick={closeSubmitModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePostSubmission} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Submission Details / URL</label>
                <textarea
                  rows="5"
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Paste GitHub link, cloud storage folder, or write text response here..."
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-250 dark:border-navy-700 outline-none focus:border-brand-blue dark:focus:border-brand-blue text-slate-800 dark:text-white transition-colors"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeSubmitModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={btnLoading}
                  className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold font-heading tracking-wide shadow-md shadow-brand-blue/20 flex items-center gap-1.5"
                >
                  {btnLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Submit Work'
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

export default Assignments;
