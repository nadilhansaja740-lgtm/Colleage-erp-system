import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  GraduationCap,
  LogOut,
  Database,
  SlidersHorizontal,
  Sun,
  Moon,
  Globe,
  Building
} from 'lucide-react';

interface HeaderProps {
  onOpenSetupModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSetupModal, activeTab, setActiveTab }) => {
  const { user, role, loginAsRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-lg tracking-tight">NH College</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  ERP Portal
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 hidden sm:flex">
                <span className="font-medium text-indigo-600 dark:text-indigo-400">NH Education Foundation</span>
                <span>•</span>
                <a
                  href="https://www.nhcollege.edu"
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="hover:underline text-slate-600 dark:text-slate-300 flex items-center space-x-0.5 font-medium"
                >
                  <Globe className="w-3 h-3 text-indigo-500 inline" />
                  <span>www.nhcollege.edu</span>
                </a>
              </div>
            </div>
          </div>

          {/* Center: RTDB Status & Role Switcher Pills */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Connection badge */}
            <button
              onClick={onOpenSetupModal}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              title="Click to view Firebase Configuration & Rules"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Database className="w-3.5 h-3.5" />
              <span>Firebase Connected</span>
            </button>

            {/* Quick Role Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="px-2 font-medium text-slate-500 dark:text-slate-400">Role:</span>
              <button
                onClick={() => loginAsRole('admin')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  role === 'admin'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                👑 Admin
              </button>
              <button
                onClick={() => loginAsRole('teacher')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  role === 'teacher'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                👨‍🏫 Teacher
              </button>
              <button
                onClick={() => loginAsRole('student')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  role === 'student'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                🎓 Student
              </button>
            </div>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center space-x-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center space-x-1.5 text-xs font-medium"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenSetupModal}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center space-x-1 text-xs font-medium border border-slate-200 dark:border-slate-700"
              title="Firebase Settings & Setup"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden md:inline">Firebase</span>
            </button>

            {/* User Details */}
            {user && (
              <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="text-right hidden md:block">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-none">{user.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-1 flex items-center justify-end space-x-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span>{user.role}</span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm border border-indigo-200 dark:border-indigo-800 shadow-xs">
                  {user.name.charAt(0)}
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
