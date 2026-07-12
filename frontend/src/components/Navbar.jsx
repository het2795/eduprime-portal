import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Bell, Search } from 'lucide-react';

const Navbar = () => {
  const { user, darkMode, toggleTheme } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'Dashboard Overview';
      case '/analytics': return 'Performance Analytics';
      case '/announcements': return 'Campus Announcements';
      case '/attendance': return 'Attendance Log';
      case '/grades': return 'Academic Report Card';
      case '/timetable': return 'Weekly Lecture Schedule';
      case '/assignments': return 'Academic Assignments';
      case '/course-materials': return 'Learning Resources';
      case '/placements': return 'Career Drives & Internships';
      case '/events': return 'Campus Events Scheduler';
      case '/leave': return 'Leave Applications Manager';
      case '/helpdesk': return 'Helpdesk & Ticket Center';
      case '/fees': return 'Fee Statement Details';
      case '/id-card': return 'Digital Student ID Card';
      case '/chat': return 'EduBot — AI Assistant';
      case '/profile': return 'Student Profile';
      default: return 'Student Portal';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const sampleNotifications = [
    { id: 1, text: 'Google SDE drive registration closes in 2 days!', read: false },
    { id: 2, text: 'Your Leave request has been Approved', read: false },
    { id: 3, text: 'Operating Systems homework is due tomorrow', read: true }
  ];

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white dark:bg-navy-900 border-b border-slate-200/60 dark:border-navy-700/60 flex items-center justify-between px-6 z-20 transition-all duration-300">
      {/* Title & Date */}
      <div className="flex flex-col">
        <h2 className="text-md font-bold text-slate-800 dark:text-white font-heading truncate">
          {getPageTitle(location.pathname)}
        </h2>
        <span className="text-[10px] text-slate-400 font-medium">
          {today}
        </span>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block w-64">
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-navy-700 outline-none focus:border-brand-blue dark:focus:border-brand-blue transition-colors"
          />
          <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-navy-800 hover:text-brand-blue hover:bg-slate-200/50 dark:hover:bg-navy-700 transition-colors"
          title="Toggle Theme Mode"
        >
          {darkMode ? <Sun className="h-4.5 w-4.5 text-brand-amber" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-navy-800 hover:text-brand-blue hover:bg-slate-200/50 dark:hover:bg-navy-700 transition-colors relative"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-brand-red animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 shadow-xl rounded-xl py-2 z-50 text-slate-800 dark:text-slate-200">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-navy-700 flex justify-between items-center">
                <span className="text-xs font-bold font-heading">Notifications</span>
                <span className="text-[10px] text-brand-blue cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {sampleNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-navy-700/50 border-b border-slate-50 dark:border-navy-700/30 flex gap-2 ${
                      !notif.read ? 'font-medium bg-slate-50/50 dark:bg-navy-700/10' : 'text-slate-500'
                    }`}
                  >
                    <div className={`h-1.5 w-1.5 rounded-full shrink-0 mt-1.5 ${!notif.read ? 'bg-brand-blue' : 'bg-transparent'}`}></div>
                    <p className="leading-relaxed">{notif.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-navy-700"></div>

        {/* Small avatar */}
        {user && (
          <div className="flex items-center gap-2 select-none">
            <div className="h-8 w-8 rounded-full bg-brand-blue/20 text-brand-blue font-bold text-xs flex items-center justify-center border border-brand-blue/20">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover rounded-full" />
              ) : (
                getInitials(user.name)
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
