import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BarChart2,
  Megaphone,
  CalendarCheck,
  Award,
  Clock,
  BookOpen,
  FolderOpen,
  Briefcase,
  Calendar,
  FileText,
  HelpCircle,
  CreditCard,
  Contact,
  MessageSquare,
  User,
  LogOut,
  GraduationCap,
  Users,
  Settings,
  ListFilter,
  Layers,
  Cpu
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Define sidebar configurations for each role
  const studentMenu = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Analytics', path: '/analytics', icon: BarChart2 },
        { name: 'Announcements', path: '/announcements', icon: Megaphone }
      ]
    },
    {
      title: 'ACADEMIC',
      items: [
        { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
        { name: 'Grades & Results', path: '/grades', icon: Award },
        { name: 'Timetable', path: '/timetable', icon: Clock },
        { name: 'Assignments', path: '/assignments', icon: BookOpen },
        { name: 'Course Materials', path: '/course-materials', icon: FolderOpen }
      ]
    },
    {
      title: 'CAMPUS LIFE',
      items: [
        { name: 'Placements', path: '/placements', icon: Briefcase },
        { name: 'Events & RSVPs', path: '/events', icon: Calendar },
        { name: 'Leave Application', path: '/leave', icon: FileText },
        { name: 'Helpdesk', path: '/helpdesk', icon: HelpCircle }
      ]
    },
    {
      title: 'FINANCE & ID',
      items: [
        { name: 'Fee Status', path: '/fees', icon: CreditCard },
        { name: 'Digital ID Card', path: '/id-card', icon: Contact }
      ]
    },
    {
      title: 'TOOLS',
      items: [
        { name: 'AI Chatbot', path: '/chat', icon: MessageSquare },
        { name: 'My Profile', path: '/profile', icon: User }
      ]
    }
  ];

  const facultyMenu = [
    {
      title: 'MAIN',
      items: [
        { name: 'Faculty Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
        { name: 'My Classes', path: '/faculty/classes', icon: Layers }
      ]
    },
    {
      title: 'TEACHING',
      items: [
        { name: 'Attendance Marking', path: '/faculty/mark-attendance', icon: CalendarCheck },
        { name: 'Assignments & Grading', path: '/faculty/assignments', icon: Award },
        { name: 'Course Materials Upload', path: '/faculty/upload-materials', icon: FolderOpen },
        { name: 'Timetable', path: '/timetable', icon: Clock }
      ]
    },
    {
      title: 'STUDENTS',
      items: [
        { name: 'My Students Roster', path: '/faculty/my-students', icon: Users },
        { name: 'Performance Analytics', path: '/analytics', icon: BarChart2 }
      ]
    },
    {
      title: 'CAMPUS LIFE',
      items: [
        { name: 'Announcements', path: '/announcements', icon: Megaphone },
        { name: 'Leave Application', path: '/leave', icon: FileText },
        { name: 'Helpdesk Tickets', path: '/helpdesk', icon: HelpCircle }
      ]
    },
    {
      title: 'TOOLS',
      items: [
        { name: 'AI Chatbot', path: '/chat', icon: MessageSquare },
        { name: 'My Profile', path: '/profile', icon: User }
      ]
    }
  ];

  const adminMenu = [
    {
      title: 'MAIN',
      items: [
        { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'College Analytics', path: '/analytics', icon: BarChart2 }
      ]
    },
    {
      title: 'USER MANAGEMENT',
      items: [
        { name: 'Manage Users', path: '/admin/users', icon: Users }
      ]
    },
    {
      title: 'ACADEMIC ADMIN',
      items: [
        { name: 'Timetable Management', path: '/admin/timetable-management', icon: Clock },
        { name: 'Course & Class Setup', path: '/admin/classes-setup', icon: Layers },
        { name: 'Post Announcement', path: '/announcements', icon: Megaphone }
      ]
    },
    {
      title: 'CAMPUS OPS',
      items: [
        { name: 'Manage Events', path: '/events', icon: Calendar },
        { name: 'Leave Approvals', path: '/admin/leave-approvals', icon: FileText },
        { name: 'Helpdesk Admin', path: '/admin/helpdesk-tickets', icon: HelpCircle }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { name: 'Fee Operations', path: '/admin/fee-management', icon: CreditCard }
      ]
    },
    {
      title: 'TOOLS',
      items: [
        { name: 'AI Chatbot', path: '/chat', icon: MessageSquare },
        { name: 'My Profile', path: '/profile', icon: User }
      ]
    }
  ];

  const getMenuConfig = () => {
    if (user?.role === 'admin') return adminMenu;
    if (user?.role === 'faculty') return facultyMenu;
    return studentMenu;
  };

  const activeMenu = getMenuConfig();

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-700/60 h-screen fixed top-0 left-0 flex flex-col text-slate-300 z-30 select-none overflow-y-auto">
      {/* Logo banner */}
      <div className="p-6 border-b border-navy-700/50 flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-brand-blue" />
        <span className="text-xl font-bold tracking-wider font-heading text-white">
          Edu<span className="text-brand-blue">Prime</span>
        </span>
      </div>

      {/* User details Card */}
      {user && (
        <div className="p-4 mx-4 my-5 bg-navy-800/80 rounded-xl border border-navy-700/40 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-brand-blue/20 border border-brand-blue/50 flex items-center justify-center text-brand-blue font-bold text-sm overflow-hidden shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              getInitials(user.name)
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
            <p className="text-[10px] text-slate-400 capitalize">{user.role} Portal</p>
          </div>
        </div>
      )}

      {/* Navigation menu list */}
      <nav className="flex-1 px-4 space-y-6 pb-6">
        {activeMenu.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <p className="text-[9px] font-bold tracking-widest text-slate-500 px-3">{section.title}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/' || item.path === '/faculty/dashboard' || item.path === '/admin/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-blue/20 text-white border-l-2 border-brand-blue shadow-md shadow-brand-blue/5'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/55 border-l-2 border-transparent'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign Out Action */}
      <div className="p-4 border-t border-navy-700/50">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-brand-red bg-brand-red/10 border border-brand-red/20 transition-all hover:bg-brand-red hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
