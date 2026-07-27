import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  CalendarCheck,
  Award,
  Megaphone,
  BookOpen,
  Settings,
  Shield,
  Sun,
  Moon,
  Globe,
  Building2,
  DollarSign
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSetupModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenSetupModal }) => {
  const { role, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'subjects', label: 'Manage Subjects', icon: BookOpen },
        { id: 'students', label: 'Add & Manage Students', icon: Users },
        { id: 'teachers', label: 'Add & Manage Teachers', icon: UserCheck },
        { id: 'attendance', label: 'Faculty & Teacher Attendance', icon: CalendarCheck },
        { id: 'fees', label: 'Financial & Fee Mgmt', icon: CreditCard },
        { id: 'bank-details', label: 'Bank Details & Money Add', icon: DollarSign },
        { id: 'final-cert', label: 'Final Certificate Exam', icon: Award },
        { id: 'college-rating', label: 'College Rate & Reviews', icon: Building2 },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'setup', label: 'Firebase Config', icon: Settings }
      ];
    } else if (role === 'teacher') {
      return [
        { id: 'dashboard', label: 'Teacher Home', icon: LayoutDashboard },
        { id: 'subjects', label: 'Curriculum Subjects', icon: BookOpen },
        { id: 'attendance', label: 'Mark Attendance', icon: CalendarCheck },
        { id: 'results', label: 'Exam & Results', icon: Award },
        { id: 'students', label: 'Add & View Students', icon: Users },
        { id: 'teachers', label: 'Faculty Directory', icon: UserCheck },
        { id: 'bank-details', label: 'Bank Details & Deposit', icon: DollarSign },
        { id: 'final-cert', label: 'Final Certificate Portal', icon: Award },
        { id: 'college-rating', label: 'College Rate & Reviews', icon: Building2 },
        { id: 'announcements', label: 'Announcements', icon: Megaphone }
      ];
    } else {
      // Student
      return [
        { id: 'dashboard', label: 'My Overview', icon: LayoutDashboard },
        { id: 'subjects', label: 'My Subjects', icon: BookOpen },
        { id: 'my-attendance', label: 'My Attendance', icon: CalendarCheck },
        { id: 'my-results', label: 'Exam Results', icon: Award },
        { id: 'my-fees', label: 'Fee Status & Receipts', icon: CreditCard },
        { id: 'bank-details', label: 'Bank Details & Money Add', icon: DollarSign },
        { id: 'final-cert', label: 'Final Certificate Exam', icon: Award },
        { id: 'college-rating', label: 'College Rate & Reviews', icon: Building2 },
        { id: 'announcements', label: 'College Notices', icon: Megaphone }
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex border-r border-slate-800">
      <div>
        {/* User Card */}
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              {user?.name.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-indigo-400 capitalize font-medium">{role} Portal</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700/60 text-[11px] text-slate-400 flex justify-between items-center">
            <span>ID: {user?.admissionId || user?.teacherId || 'NH-ADMIN-01'}</span>
            <span className="text-emerald-400 font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span>Online</span>
            </span>
          </div>
        </div>

        {/* Navigation Heading */}
        <div className="px-2 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {role?.toUpperCase()} NAVIGATION
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'setup') {
                    onOpenSetupModal();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Info */}
      <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2.5">
        <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-200 font-bold text-xs">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>NH Education Group</span>
          </div>
          <p className="text-[11px] text-slate-400">Official Owner & Management Trust</p>
          <a
            href="https://www.nhcollege.edu"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-indigo-400 hover:underline flex items-center space-x-1 font-medium mt-1"
          >
            <Globe className="w-3 h-3" />
            <span>www.nhcollege.edu</span>
          </a>
        </div>

        {/* Theme Toggle in Sidebar */}
        <button
          onClick={toggleTheme}
          className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between"
        >
          <span className="flex items-center space-x-2">
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
            {theme}
          </span>
        </button>

        <button
          onClick={onOpenSetupModal}
          className="w-full py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center space-x-1"
        >
          <Shield className="w-3 h-3 text-indigo-400" />
          <span>Firebase RTDB Rules</span>
        </button>
      </div>
    </aside>
  );
};
