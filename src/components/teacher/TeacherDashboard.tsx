import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarCheck,
  Award,
  Users,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle,
  GraduationCap
} from 'lucide-react';

interface TeacherDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ setActiveTab }) => {
  const { activeTeacher, allStudents } = useAuth();

  const assignedClasses = activeTeacher?.assignedClasses || ['B.Tech CSE - 3rd Year'];

  // Count students in teacher's assigned classes
  const totalClassStudents = allStudents.filter(
    (s) => assignedClasses.includes(s.class) || activeTeacher?.department === s.stream
  ).length;

  return (
    <div className="space-y-6">

      {/* Teacher Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Teacher Academic Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {activeTeacher?.name || 'Professor'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Subject: <span className="text-indigo-300 font-semibold">{activeTeacher?.subject || 'Computer Science'}</span> | Department: {activeTeacher?.department || 'Engineering'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('attendance')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Mark Attendance Today</span>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-2"
            >
              <Award className="w-4 h-4" />
              <span>Enter Exam Marks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Assigned Subject</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900">{activeTeacher?.subject || 'Data Structures'}</div>
          <p className="text-xs text-slate-500 mt-0.5">{activeTeacher?.department} Department</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Class Batches</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{assignedClasses.length}</div>
          <p className="text-xs text-slate-500 mt-0.5">{assignedClasses.join(', ')}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Students Enrolled</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalClassStudents || 4}</div>
          <p className="text-xs text-slate-500 mt-0.5">Active in assigned classes</p>
        </div>
      </div>

      {/* Main Module Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Attendance Shortcut Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 hover:border-indigo-300 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Attendance Marking Module</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select class and date to record present/absent student attendance directly into Realtime Database.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Status: Realtime Auto-Sync</span>
            <button
              onClick={() => setActiveTab('attendance')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <span>Open Attendance Sheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Exam & Marks Shortcut Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 hover:border-emerald-300 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Exam & Marks Evaluation</h2>
            <p className="text-xs text-slate-500 mt-1">
              Create mid-term or end-term exams, enter student marks, calculate letter grades, and publish report cards.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Grade Auto-Calculation Active</span>
            <button
              onClick={() => setActiveTab('results')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <span>Manage Marks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
