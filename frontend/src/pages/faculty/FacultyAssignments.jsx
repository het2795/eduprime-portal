import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, Award, FileText, CheckCircle2, Upload, Calendar, Plus, X, Inbox } from 'lucide-react';

const FacultyAssignments = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxPoints, setMaxPoints] = useState('100');
  const [fileAttachment, setFileAttachment] = useState(null);

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentTitle, setSelectedAssignmentTitle] = useState('');
  const [submissions, setSubmissions] = useState([]);
  
  const [gradingId, setGradingId] = useState(null);
  const [pointsEarned, setPointsEarned] = useState('');
  const [feedback, setFeedback] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gradingSubmitting, setGradingSubmitting] = useState(false);

  // Fetch classes and initial list of assignments
  const initPage = async () => {
    try {
      const clsRes = await api.get('/faculty/classes');
      setClasses(clsRes.data);
      if (clsRes.data.length > 0) {
        setSelectedClassId(clsRes.data[0]._id);
      }

      const res = await api.get('/assignments'); // Fetches general assignments list
      // Group by distinct title & section created by this faculty
      // To simulate, we can fetch all assignments and filter locally for createdBy === faculty.id
      // But we will fetch from general endpoint and filter distinct titles locally.
      // Better yet, we can filter them by distinct titles!
      const uniqueTitles = [];
      const seen = new Set();
      res.data.forEach(item => {
        const key = `${item.title}-${item.section}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueTitles.push(item);
        }
      });
      setAssignments(uniqueTitles);
      if (uniqueTitles.length > 0) {
        setSelectedAssignmentTitle(uniqueTitles[0].title);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initPage();
  }, []);

  const fetchSubmissions = async () => {
    if (!selectedAssignmentTitle) return;
    try {
      const res = await api.get(`/faculty/submissions/${selectedAssignmentTitle}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [selectedAssignmentTitle]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!title || !selectedClassId || !dueDate) {
      alert('Please fill out necessary fields.');
      return;
    }
    setSubmitting(true);

    const activeClass = classes.find(c => c._id === selectedClassId);
    if (!activeClass) return;

    // Use FormData for file attachment support
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', activeClass.subject);
    formData.append('section', activeClass.section);
    formData.append('description', description);
    formData.append('dueDate', dueDate);
    formData.append('maxPoints', maxPoints);
    if (fileAttachment) {
      formData.append('assignmentAttachment', fileAttachment);
    }

    try {
      const res = await api.post('/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message || 'Assignment created and distributed!');
      setTitle('');
      setDescription('');
      setDueDate('');
      setFileAttachment(null);
      await initPage();
    } catch (err) {
      console.error(err);
      alert('Failed to distribute assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!gradingId || !pointsEarned) return;
    setGradingSubmitting(true);

    try {
      await api.post(`/faculty/grade/${gradingId}`, {
        pointsEarned,
        feedback
      });
      alert('Grade updated successfully!');
      setGradingId(null);
      setPointsEarned('');
      setFeedback('');
      await fetchSubmissions();
    } catch (err) {
      console.error(err);
      alert('Grading update failed.');
    } finally {
      setGradingSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Create assignment form */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between h-fit">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Distribute Assignment</h3>
          <p className="text-[10px] text-slate-400">Distribute coursework specifications to all students in section</p>
        </div>

        <form onSubmit={handleCreateAssignment} className="space-y-4">
          {/* Select Class */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Select Target Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
            >
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.subject} (Sec {c.section})</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Assignment Title</label>
            <input
              type="text"
              placeholder="e.g. decision Trees Python project..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Specifications / Guidelines</label>
            <textarea
              rows="3"
              placeholder="Provide guidelines for submissions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
            />
          </div>

          {/* Dates & Score parameters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Max Points</label>
              <input
                type="number"
                value={maxPoints}
                onChange={(e) => setMaxPoints(e.target.value)}
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none"
                required
              />
            </div>
          </div>

          {/* Attachment */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Syllabus / spec document</label>
            <input
              type="file"
              onChange={(e) => setFileAttachment(e.target.files[0])}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-brand-blue/10 file:text-brand-blue"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs font-heading tracking-wide transition-all shadow-md shadow-brand-blue/15 flex items-center justify-center gap-1.5"
          >
            {submitting ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Distribute Task'
            )}
          </button>
        </form>
      </div>

      {/* Submissions tracking & grading */}
      <div className="lg:col-span-2 space-y-6">
        {/* Selector Card */}
        <div className="bg-white dark:bg-navy-800 p-4 rounded-xl border border-slate-200/50 dark:border-navy-700/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Selected Assignment</span>
            {assignments.length > 0 ? (
              <select
                value={selectedAssignmentTitle}
                onChange={(e) => setSelectedAssignmentTitle(e.target.value)}
                className="p-1 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white font-bold outline-none"
              >
                {assignments.map((a, idx) => (
                  <option key={idx} value={a.title}>{a.title} ({a.subject})</option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-bold text-slate-450 italic block">No active tasks created</span>
            )}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{submissions.length} Students tracked</span>
        </div>

        {/* Submissions table */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Submissions List</h3>
            <p className="text-[10px] text-slate-400">Class submissions queue. Click Grade button to award scores.</p>
          </div>

          <div className="overflow-x-auto flex-1 max-h-[400px]">
            <table className="w-full text-left text-xs border-collapse font-medium">
              <thead>
                <tr className="border-b border-slate-100 dark:border-navy-700 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-2">Student</th>
                  <th className="py-2">Submitted File / Text</th>
                  <th className="py-2">Score Awarded</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
                {submissions.length > 0 ? (
                  submissions.map((sub) => {
                    const isSubmitted = sub.status === 'Submitted';
                    const isGraded = typeof sub.pointsEarned === 'number';
                    return (
                      <tr key={sub._id} className="text-slate-655 dark:text-slate-300">
                        <td className="py-3 font-semibold text-slate-800 dark:text-white">
                          <p>{sub.student?.name}</p>
                          <span className="text-[9px] text-slate-450">{sub.student?.rollNo}</span>
                        </td>
                        <td className="py-3 text-[10.5px]">
                          {isSubmitted ? (
                            <div className="space-y-1">
                              {sub.submissionFileUrl && (
                                <a
                                  href={sub.submissionFileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-blue font-bold hover:underline flex items-center gap-1"
                                >
                                  <FileText className="h-3.5 w-3.5" /> Download Uploaded Work
                                </a>
                              )}
                              <p className="text-slate-400 italic max-w-xs truncate">{sub.submissionContent}</p>
                            </div>
                          ) : (
                            <span className="text-brand-red italic">No submission</span>
                          )}
                        </td>
                        <td className="py-3 font-bold text-slate-700 dark:text-slate-200">
                          {isGraded ? `${sub.pointsEarned} / ${sub.maxPoints}` : 'Not graded'}
                        </td>
                        <td className="py-3 text-right">
                          {isSubmitted ? (
                            <button
                              onClick={() => {
                                setGradingId(sub._id);
                                setPointsEarned(sub.pointsEarned?.toString() || '');
                                setFeedback(sub.feedback || '');
                              }}
                              className="px-2.5 py-1 rounded bg-brand-blue text-white text-[10px] font-bold font-heading shadow hover:bg-brand-blue/90"
                            >
                              {isGraded ? 'Update Grade' : 'Grade Submission'}
                            </button>
                          ) : (
                            <button disabled className="px-2.5 py-1 rounded bg-slate-100 dark:bg-navy-750 text-slate-400 text-[10px] font-bold border border-slate-200 dark:border-navy-700 cursor-not-allowed">
                              Grade
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-450 italic">Select an active assignment title to load submissions rosters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grading Form Modal Panel */}
      {gradingId && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-150 dark:border-navy-700 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white font-heading uppercase tracking-wider">Evaluate Submission</h3>
              <button onClick={() => setGradingId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleGradeSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Award Points</label>
                <input
                  type="number"
                  placeholder="e.g. 90"
                  value={pointsEarned}
                  onChange={(e) => setPointsEarned(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-850 dark:text-white outline-none focus:border-brand-blue"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Faculty Review Feedback</label>
                <textarea
                  rows="4"
                  placeholder="Provide feedback on the submission work..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-550 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={gradingSubmitting}
                  className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold font-heading tracking-wide flex items-center gap-1.5"
                >
                  {gradingSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Save Grade'
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

export default FacultyAssignments;
