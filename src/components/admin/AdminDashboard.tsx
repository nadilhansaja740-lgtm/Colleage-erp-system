import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import {
  Users,
  UserCheck,
  CreditCard,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Megaphone,
  BookOpen,
  DollarSign,
  GraduationCap
} from 'lucide-react';
import { subscribeToPath } from '../../firebase/db';
import { Announcement } from '../../types';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveTab }) => {
  const { allStudents, allTeachers } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const unsub = subscribeToPath<Record<string, Announcement>>('announcements', (data) => {
      if (data) {
        setAnnouncements(Object.values(data));
      }
    });
    return () => unsub();
  }, []);

  // Compute metrics
  const totalStudents = allStudents.length;
  const totalTeachers = allTeachers.length;

  const totalCollectedFees = allStudents.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const totalExpectedFees = allStudents.reduce((sum, s) => sum + (s.feeAmount || 0), 0);
  const totalPendingFees = Math.max(0, totalExpectedFees - totalCollectedFees);

  const pendingStudentsCount = allStudents.filter(s => s.feeStatus === 'Pending').length;

  // Stream counts
  const streamCounts = allStudents.reduce((acc, s) => {
    const stream = s.stream || 'Other';
    acc[stream] = (acc[stream] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Admin Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">NH College ERP Overview</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Monitor real-time student admissions, faculty assignments, tuition collection status, and institutional notifications.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('students')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Student</span>
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-xs transition-all flex items-center space-x-2 border border-white/20"
            >
              <CreditCard className="w-4 h-4" />
              <span>Fee Collection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Students Enrolled"
          value={totalStudents}
          subtitle="Across 4 Academic Streams"
          icon={Users}
          badge="+12% this year"
          badgeColor="emerald"
          iconColor="text-indigo-600 bg-indigo-50 border-indigo-200"
        />

        <StatCard
          title="Faculty Teachers"
          value={totalTeachers}
          subtitle="Full-time & Visiting Professors"
          icon={UserCheck}
          badge="Active"
          badgeColor="blue"
          iconColor="text-emerald-600 bg-emerald-50 border-emerald-200"
        />

        <StatCard
          title="Fees Collected"
          value={`$${totalCollectedFees.toLocaleString()}`}
          subtitle={`Out of $${totalExpectedFees.toLocaleString()} total`}
          icon={DollarSign}
          badge="Realtime Sync"
          badgeColor="emerald"
          iconColor="text-emerald-600 bg-emerald-50 border-emerald-200"
        />

        <StatCard
          title="Pending Fees Balance"
          value={`$${totalPendingFees.toLocaleString()}`}
          subtitle={`${pendingStudentsCount} students pending`}
          icon={AlertCircle}
          badge={pendingStudentsCount > 0 ? "Attention Needed" : "All Cleared"}
          badgeColor={pendingStudentsCount > 0 ? "rose" : "emerald"}
          iconColor="text-rose-600 bg-rose-50 border-rose-200"
        />
      </div>

      {/* Main Content Grid: Stream Distribution & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Stream Distribution & Statistics */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Enrollment by Stream</h2>
              <p className="text-xs text-slate-500">Distribution across major engineering & business departments</p>
            </div>
            <button
              onClick={() => setActiveTab('students')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <span>View All Students</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(streamCounts).map(([stream, count]) => {
              const percentage = Math.round((Number(count) / (totalStudents || 1)) * 100);
              return (
                <div key={stream} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-800">
                    <span>{stream}</span>
                    <span className="text-slate-500">{count} Students ({percentage}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Institutional Highlights */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-xs text-slate-500 font-medium">Average Student Attendance</div>
              <div className="text-lg font-bold text-slate-900 mt-1">88.4%</div>
              <p className="text-[11px] text-emerald-600 mt-0.5">↑ Above 75% requirement</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-xs text-slate-500 font-medium">Fee Collection Progress</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {Math.round((totalCollectedFees / (totalExpectedFees || 1)) * 100)}%
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Updated in Realtime</p>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Announcements & Quick Actions */}
        <div className="space-y-6">

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Quick System Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setActiveTab('students')}
                className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl text-left transition-all border border-indigo-100 group"
              >
                <Users className="w-5 h-5 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold">Students</div>
                <p className="text-[10px] text-indigo-600">Add or edit records</p>
              </button>

              <button
                onClick={() => setActiveTab('teachers')}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-left transition-all border border-emerald-100 group"
              >
                <UserCheck className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold">Teachers</div>
                <p className="text-[10px] text-emerald-600">Faculty directory</p>
              </button>

              <button
                onClick={() => setActiveTab('fees')}
                className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-left transition-all border border-amber-100 group"
              >
                <CreditCard className="w-5 h-5 text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold">Collect Fees</div>
                <p className="text-[10px] text-amber-600">Track payments</p>
              </button>

              <button
                onClick={() => setActiveTab('bank-details')}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-left transition-all border border-emerald-100 group"
              >
                <DollarSign className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold">Bank Details</div>
                <p className="text-[10px] text-emerald-600">Money add & transfers</p>
              </button>

              <button
                onClick={() => setActiveTab('final-cert')}
                className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl text-left transition-all border border-purple-100 group"
              >
                <GraduationCap className="w-5 h-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold">Final Cert Exam</div>
                <p className="text-[10px] text-purple-600">Degree & Exam Portal</p>
              </button>

              <button
                onClick={() => setActiveTab('college-rating')}
                className="p-3 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-xl text-left transition-all border border-teal-100 group"
              >
                <TrendingUp className="w-5 h-5 text-teal-600 mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold">College Rate</div>
                <p className="text-[10px] text-teal-600">Rating & Reviews</p>
              </button>
            </div>
          </div>

          {/* Announcements Feed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-indigo-600" />
                <span>Recent Announcements</span>
              </h3>
              <button
                onClick={() => setActiveTab('announcements')}
                className="text-xs text-indigo-600 font-medium hover:underline"
              >
                All
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span className="truncate max-w-[180px]">{ann.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{ann.date}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
