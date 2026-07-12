import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Folder, FileText, ArrowRight, Download, Link, Layers, AlertCircle } from 'lucide-react';

const CourseMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await api.get('/course-materials');
        setMaterials(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-brand-red" />;
      case 'PPT':
        return <Layers className="h-5 w-5 text-brand-amber" />;
      default:
        return <Link className="h-5 w-5 text-brand-blue" />;
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : materials.length === 0 ? (
        <div className="py-12 bg-white dark:bg-navy-800 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 text-center flex flex-col items-center justify-center gap-3">
          <Folder className="h-10 w-10 text-slate-400" />
          <p className="text-sm font-bold text-slate-800 dark:text-white font-heading">No course materials uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materials.map((folder) => (
            <div
              key={folder._id}
              className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm space-y-4"
            >
              {/* Folder Name */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-navy-700/50">
                <div className="h-8 w-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                  <Folder className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider font-heading">{folder.subject}</h3>
                  <span className="text-[10px] text-slate-400 font-semibold">{folder.files.length} Resources available</span>
                </div>
              </div>

              {/* Files */}
              <div className="space-y-2">
                {folder.files.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-navy-900/50 rounded-xl border border-slate-200/30 dark:border-navy-700/30 flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-navy-900 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {getFileIcon(file.type)}
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                        <span className="text-[9px] font-mono text-slate-400 font-bold">{file.type} Material</span>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white dark:bg-navy-800 text-slate-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-blue border border-slate-250 dark:border-navy-750 shrink-0 transition-colors select-none"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseMaterials;
