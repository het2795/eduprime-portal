import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Award, Layers, TrendingUp, BarChart2 } from 'lucide-react';

const Grades = () => {
  const [data, setData] = useState(null);
  const [selectedSem, setSelectedSem] = useState('Semester 6');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await api.get('/grades');
        setData(res.data);
        if (res.data?.semesterData?.length > 0) {
          // Set active semester to the latest one by default
          setSelectedSem(res.data.semesterData[res.data.semesterData.length - 1].semester);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch academic grades.');
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { cgpa = 0.0, semesterData = [] } = data || {};
  const activeSemData = semesterData.find((s) => s.semester === selectedSem);

  const getGradeColor = (grade) => {
    if (grade.startsWith('O') || grade.startsWith('A+')) return 'text-brand-green bg-brand-green/10 border-brand-green/20';
    if (grade.startsWith('A')) return 'text-brand-blue bg-brand-blue/10 border-brand-blue/20';
    if (grade.startsWith('B')) return 'text-brand-amber bg-brand-amber/10 border-brand-amber/20';
    return 'text-brand-red bg-brand-red/10 border-brand-red/20';
  };

  return (
    <div className="space-y-6">
      {/* Overview Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Cumulative CGPA Card */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cumulative CGPA</p>
            <h3 className="text-xl font-extrabold font-heading text-slate-800 dark:text-white mt-1">{cgpa} / 10.0</h3>
            <p className="text-[10px] text-brand-green font-medium">In top 5% of your class</p>
          </div>
        </div>

        {/* Current Semester GPA Card */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Term GPA</p>
            <h3 className="text-xl font-extrabold font-heading text-slate-800 dark:text-white mt-1">
              {activeSemData ? activeSemData.gpa.toFixed(2) : '0.00'}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium capitalize">{selectedSem} score</p>
          </div>
        </div>

        {/* Total Credits Card */}
        <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-purple/10 flex items-center justify-center text-brand-purple shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Degree Credits</p>
            <h3 className="text-xl font-extrabold font-heading text-slate-800 dark:text-white mt-1">104 Earned</h3>
            <p className="text-[10px] text-brand-purple font-medium">130 required for Graduation</p>
          </div>
        </div>
      </div>

      {/* Tabs list & grades matrix */}
      <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm space-y-5">
        {/* Semester tabs list */}
        <div className="flex overflow-x-auto gap-1.5 pb-2.5 border-b border-slate-100 dark:border-navy-700">
          {semesterData.map((sem) => (
            <button
              key={sem.semester}
              onClick={() => setSelectedSem(sem.semester)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg shrink-0 transition-all font-heading ${
                selectedSem === sem.semester
                  ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/15'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-700/50'
              }`}
            >
              {sem.semester}
            </button>
          ))}
        </div>

        {/* Active Tab grades table */}
        {activeSemData ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-navy-900/50 px-4 py-3 rounded-xl border border-slate-200/40 dark:border-navy-700/40">
              <span className="text-xs font-semibold text-slate-500">GPA Score: <span className="text-slate-800 dark:text-white font-bold">{activeSemData.gpa.toFixed(2)}</span></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Passed All Courses</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-navy-700 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                    <th className="py-2.5">Code</th>
                    <th className="py-2.5">Course Name</th>
                    <th className="py-2.5">Credits</th>
                    <th className="py-2.5">Marks (100)</th>
                    <th className="py-2.5">Letter Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
                  {activeSemData.courses.map((course) => (
                    <tr key={course.code} className="text-slate-600 dark:text-slate-300 font-medium">
                      <td className="py-3.5 font-mono text-[11px] text-brand-blue font-bold">{course.code}</td>
                      <td className="py-3.5 font-semibold text-slate-800 dark:text-white">{course.name}</td>
                      <td className="py-3.5 text-slate-400">{course.credits} Credits</td>
                      <td className="py-3.5 font-bold">{course.marks} / 100</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 font-extrabold text-[10px] rounded-full border ${getGradeColor(course.grade)}`}>
                          {course.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 font-bold">Select a semester tab to view results.</div>
        )}
      </div>
    </div>
  );
};

export default Grades;
