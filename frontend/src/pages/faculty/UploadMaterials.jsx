import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FolderOpen, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const UploadMaterials = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedClassId) {
      alert('Please select both a class section and a file.');
      return;
    }
    setSubmitting(true);

    const activeClass = classes.find(c => c._id === selectedClassId);
    if (!activeClass) return;

    const formData = new FormData();
    formData.append('subject', activeClass.subject);
    formData.append('section', activeClass.section);
    formData.append('fileName', fileName || file.name);
    formData.append('materialFile', file);

    try {
      await api.post('/course-materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Course material uploaded successfully!');
      setFileName('');
      setFile(null);
      // Reset input element
      e.target.reset();
    } catch (err) {
      console.error(err);
      alert('Resource file upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-navy-800 p-6 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
      <div className="mb-6 flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-navy-700/50">
        <FolderOpen className="h-5 w-5 text-brand-blue" />
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading uppercase tracking-wider">Upload Course Materials</h3>
          <p className="text-[10px] text-slate-400">Share lecture slides, lab modules, or reference PDFs with students</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : classes.length === 0 ? (
        <div className="py-12 text-center text-slate-400 italic">No assigned classes found to distribute files.</div>
      ) : (
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {/* Select Class */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Target Course / Section</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
            >
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.subject} (Sec {c.section})</option>
              ))}
            </select>
          </div>

          {/* File Name override */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Document Name / Title</label>
            <input
              type="text"
              placeholder="e.g. Unit 2 IP Subnetting Tutorial (Defaults to file name)"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-white outline-none focus:border-brand-blue"
            />
          </div>

          {/* File input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Choose File (PDF / PPT / Docs)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10.5px] file:font-bold file:bg-brand-blue/15 file:text-brand-blue focus:outline-none"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs font-heading tracking-wide transition-all shadow-md shadow-brand-blue/20 flex items-center justify-center gap-2 hover:translate-y-[-0.5px] active:translate-y-[0.5px]"
          >
            {submitting ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Upload className="h-4 w-4" /> Share Document
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default UploadMaterials;
