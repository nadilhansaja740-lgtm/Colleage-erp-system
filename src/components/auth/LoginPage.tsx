import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';
import {
  GraduationCap,
  Shield,
  UserCheck,
  User,
  ArrowRight,
  Database,
  Lock,
  Mail,
  Sun,
  Moon,
  Globe,
  Building2,
  Sparkles
} from 'lucide-react';

interface LoginPageProps {
  onOpenSetupModal: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenSetupModal }) => {
  const { loginAsRole, loginWithEmailPassword, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  const [email, setEmail] = useState('admin@nhcollege.edu');
  const [password, setPassword] = useState('admin123');

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('admin@nhcollege.edu');
      setPassword('admin123');
    } else if (role === 'teacher') {
      setEmail('teacher.smith@nhcollege.edu');
      setPassword('teacher123');
    } else {
      setEmail('student.john@nhcollege.edu');
      setPassword('student123');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithEmailPassword(email, selectedRole);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 dark:bg-slate-950 flex flex-col justify-between relative overflow-hidden transition-colors duration-200">
      {/* Background Glow FX */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-6 py-6 w-full flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl text-white tracking-tight">NH College</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-semibold">
                ERP System
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center space-x-1.5 font-medium">
              <span>Owned by NH Education Foundation</span>
              <span>•</span>
              <a
                href="https://www.nhcollege.edu"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline inline-flex items-center space-x-0.5"
              >
                <Globe className="w-3 h-3" />
                <span>www.nhcollege.edu</span>
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center space-x-1.5 text-xs font-semibold"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Mode</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenSetupModal}
            className="text-xs text-slate-300 hover:text-white flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Firebase Setup</span>
          </button>
        </div>
      </div>

      {/* Main Form Center */}
      <div className="max-w-md w-full mx-auto px-4 py-8 relative z-10">
        
        {/* Header Card */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted & Owner Authorized Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">NH College Academic Portal</h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Official Campus ERP with Role-Based Portal Access for Faculty, Students, and Administrators
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-800/90 rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-2xl backdrop-blur-md space-y-6">
          
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleRoleTabChange('admin')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center space-x-1 ${
                selectedRole === 'admin'
                  ? 'bg-indigo-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('teacher')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center space-x-1 ${
                selectedRole === 'teacher'
                  ? 'bg-indigo-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Teacher</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('student')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center space-x-1 ${
                selectedRole === 'student'
                  ? 'bg-indigo-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {selectedRole.toUpperCase()} EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm mt-2"
            >
              <span>Login to {selectedRole.toUpperCase()} Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Fast Bypass Demo Accounts */}
          <div className="pt-4 border-t border-slate-700 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Instant 1-Click Role Login
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => loginAsRole('admin')}
                className="p-2.5 bg-slate-900 hover:bg-indigo-950 text-indigo-300 hover:text-indigo-200 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-all text-center space-y-1"
              >
                <div className="font-bold text-xs">👑 Admin</div>
                <div className="text-[10px] text-slate-400">Full Access</div>
              </button>

              <button
                onClick={() => loginAsRole('teacher')}
                className="p-2.5 bg-slate-900 hover:bg-indigo-950 text-emerald-300 hover:text-emerald-200 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-all text-center space-y-1"
              >
                <div className="font-bold text-xs">👨‍🏫 Teacher</div>
                <div className="text-[10px] text-slate-400">Mark Marks/Att</div>
              </button>

              <button
                onClick={() => loginAsRole('student')}
                className="p-2.5 bg-slate-900 hover:bg-indigo-950 text-amber-300 hover:text-amber-200 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-all text-center space-y-1"
              >
                <div className="font-bold text-xs">🎓 Student</div>
                <div className="text-[10px] text-slate-400">View Grades/Fees</div>
              </button>
            </div>
          </div>

          {/* Owner & Official Links */}
          <div className="pt-3 border-t border-slate-700 text-center text-xs space-y-1">
            <p className="text-slate-400 font-semibold">
              Owner Institution: <span className="text-indigo-300">NH Education Foundation</span>
            </p>
            <a
              href="https://www.nhcollege.edu"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline font-bold inline-flex items-center space-x-1"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Official College Website: www.nhcollege.edu</span>
            </a>
          </div>

        </div>

      </div>

      {/* Bottom Footer */}
      <div className="text-center py-4 text-xs text-slate-400 border-t border-slate-800 space-y-1 z-10">
        <div>
          NH College ERP & Realtime Academic Portal • Owned & Managed by NH Education Foundation
        </div>
        <div>
          Official Website:{' '}
          <a
            href="https://www.nhcollege.edu"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:underline font-medium"
          >
            https://www.nhcollege.edu
          </a>
        </div>
      </div>

    </div>
  );
};
