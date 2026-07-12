import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Contact, ShieldAlert, Share2, Download, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

const DigitalID = () => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCardInfo = async () => {
    try {
      const res = await api.get('/id-card');
      setCard(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardInfo();
  }, []);

  const handleShare = () => {
    alert('Shareable link generated and copied to clipboard.');
  };

  const handleDownload = () => {
    alert('Downloading high-resolution ID card layout PDF...');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const c = card || {};

  return (
    <div className="space-y-6">
      {/* Buttons top action bar */}
      <div className="flex justify-end gap-3 p-3 bg-white dark:bg-navy-800 rounded-xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm select-none">
        <button
          onClick={handleShare}
          className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-700 hover:bg-slate-250 text-slate-700 dark:text-slate-200 font-bold text-[10px] font-heading tracking-wide flex items-center gap-1.5 transition-colors"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Share Card</span>
        </button>
        <button
          onClick={handleDownload}
          className="px-3.5 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-[10px] font-heading tracking-wide flex items-center gap-1.5 transition-colors shadow-md shadow-brand-blue/15"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left: ID Card mock design */}
        <div className="lg:col-span-2 flex justify-center">
          <div className="w-full max-w-sm bg-gradient-to-br from-navy-900 to-navy-950 border border-brand-blue/30 rounded-3xl p-6 shadow-2xl relative text-white flex flex-col justify-between overflow-hidden aspect-[2.5/4] sm:aspect-[2.5/3.8]">
            {/* Glowing accents inside ID */}
            <div className="absolute top-[-30%] right-[-30%] w-56 h-56 bg-brand-blue/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-15%] w-56 h-56 bg-brand-purple/20 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Logo header */}
            <div className="flex justify-between items-center pb-4 border-b border-navy-700/60 relative z-10">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-brand-blue flex items-center justify-center font-bold text-xs">E</div>
                <span className="text-xs font-black tracking-widest font-heading">EDUPRIME INSTITUTES</span>
              </div>
              <span className="text-[8px] font-black text-brand-green tracking-wider uppercase border border-brand-green/30 px-1.5 py-0.5 rounded bg-brand-green/5">
                Verified
              </span>
            </div>

            {/* Profile Avatar & Primary info */}
            <div className="flex flex-col items-center text-center my-6 relative z-10 space-y-3">
              <div className="h-24 w-24 rounded-full bg-brand-blue/20 text-brand-blue border-2 border-brand-blue/40 p-1 flex items-center justify-center relative">
                <div className="h-full w-full rounded-full bg-navy-900 flex items-center justify-center font-bold text-xl overflow-hidden">
                  {c.avatarUrl ? (
                    <img src={c.avatarUrl} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(c.name)
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-wide font-heading">{c.name}</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Roll: {c.rollNo}</span>
              </div>
            </div>

            {/* Details & QR Section */}
            <div className="grid grid-cols-2 gap-4 items-end border-t border-navy-700/60 pt-4 relative z-10">
              <div className="space-y-1.5 text-[9.5px] leading-tight font-medium text-slate-300">
                <div>
                  <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider block">Course & branch</span>
                  <span>B.Tech CSE</span>
                </div>
                <div>
                  <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider block">Semester / Section</span>
                  <span>Semester {c.semester} / Sec {c.section}</span>
                </div>
                <div>
                  <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider block">Blood Group</span>
                  <span className="text-brand-red font-bold">{c.bloodGroup}</span>
                </div>
              </div>

              {/* QR Code mock block */}
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="h-18 w-18 bg-white p-1 rounded-xl flex items-center justify-center shadow-lg">
                  {/* Visual QR grid */}
                  <div className="grid grid-cols-4 gap-1 w-full h-full p-0.5">
                    <div className="bg-navy-950 rounded"></div><div className="bg-navy-950 rounded"></div><div className="bg-transparent"></div><div className="bg-navy-950 rounded"></div>
                    <div className="bg-transparent"></div><div className="bg-navy-950 rounded"></div><div className="bg-navy-950 rounded"></div><div className="bg-transparent"></div>
                    <div className="bg-navy-950 rounded"></div><div className="bg-transparent"></div><div className="bg-navy-950 rounded"></div><div className="bg-navy-950 rounded"></div>
                    <div className="bg-navy-950 rounded"></div><div className="bg-navy-950 rounded"></div><div className="bg-transparent"></div><div className="bg-navy-950 rounded"></div>
                  </div>
                </div>
                <span className="text-[7px] text-slate-450 font-bold font-mono uppercase tracking-widest leading-none mt-1">Valid Until: {c.validUntil}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Info detailed metadata sheet */}
        <div className="lg:col-span-3 bg-white dark:bg-navy-800 p-5 rounded-2xl border border-slate-200/50 dark:border-navy-700/50 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-heading">Quick Info</h3>
            <p className="text-[10px] text-slate-400">Database register verification files for academic authorities</p>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/50">
                <tr className="text-slate-600 dark:text-slate-300">
                  <td className="py-3 font-bold text-slate-400 uppercase text-[9px] tracking-wider w-1/3">Full Name</td>
                  <td className="py-3 font-bold text-slate-800 dark:text-white">{c.name}</td>
                </tr>
                <tr className="text-slate-600 dark:text-slate-300">
                  <td className="py-3 font-bold text-slate-400 uppercase text-[9px] tracking-wider">Registration Number</td>
                  <td className="py-3 font-mono font-bold text-brand-blue">{c.rollNo}</td>
                </tr>
                <tr className="text-slate-600 dark:text-slate-300">
                  <td className="py-3 font-bold text-slate-400 uppercase text-[9px] tracking-wider">Department</td>
                  <td className="py-3 font-semibold">{c.dept}</td>
                </tr>
                <tr className="text-slate-600 dark:text-slate-300">
                  <td className="py-3 font-bold text-slate-400 uppercase text-[9px] tracking-wider">Active CGPA</td>
                  <td className="py-3 font-semibold text-brand-green">{c.cgpa} / 10.0</td>
                </tr>
                <tr className="text-slate-600 dark:text-slate-300">
                  <td className="py-3 font-bold text-slate-400 uppercase text-[9px] tracking-wider">Official Email</td>
                  <td className="py-3 font-semibold">{c.email}</td>
                </tr>
                <tr className="text-slate-600 dark:text-slate-300">
                  <td className="py-3 font-bold text-slate-400 uppercase text-[9px] tracking-wider">Mobile Number</td>
                  <td className="py-3 font-mono">{c.phone}</td>
                </tr>
                <tr className="text-slate-600 dark:text-slate-300">
                  <td className="py-3 font-bold text-slate-400 uppercase text-[9px] tracking-wider">Resident Hostel</td>
                  <td className="py-3 font-semibold">{c.hostel}</td>
                </tr>
                <tr className="text-slate-600 dark:text-slate-300">
                  <td className="py-3 font-bold text-slate-400 uppercase text-[9px] tracking-wider">Faculty Mentor</td>
                  <td className="py-3 font-semibold text-brand-purple">{c.mentor}</td>
                </tr>
                <tr className="text-slate-600 dark:text-slate-300">
                  <td className="py-3 font-bold text-slate-400 uppercase text-[9px] tracking-wider">Emergency Contact</td>
                  <td className="py-3 font-mono text-brand-red">{c.emergencyContact}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-brand-green/5 border border-brand-green/10 flex items-center gap-2">
            <CheckCircle2 className="h-4.5 w-4.5 text-brand-green shrink-0" />
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-normal">
              This digital identity card uses secure encryption matching campus registrar records. Scan the QR code to verify.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalID;
