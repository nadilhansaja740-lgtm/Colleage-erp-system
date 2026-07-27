import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import {
  GraduationCap,
  CalendarCheck,
  Award,
  DollarSign,
  Megaphone,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BookOpen,
  User
} from 'lucide-react';
import { subscribeToPath } from '../../firebase/db';
import { Announcement, AttendanceRecord, ExamMark } from '../../types';

interface StudentDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ setActiveTab }) => {
  const { activeStudent } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [myAttendanceCount, setMyAttendanceCount] = useState({ present: 0, total: 0 });
  const [latestMark, setLatestMark] = useState<ExamMark | null>(null);

  const studentId = activeStudent?.id || 'STU-1001';
  const studentClass = activeStudent?.class || 'B.Tech CSE - 3rd Year';

  useEffect(() => {
    // Announcements
    const unsubAnn = subscribeToPath<Record<string, Announcement>>('announcements', (data) => {
      if (data) {
        setAnnouncements(Object.values(data));
      }
    });

    // Attendance calculation
    const sanitizedClass = studentClass.replace(/[^a-zA-Z0-9]/g, '_');
    const unsubAtt = subscribeToPath<Record<string, Record<string, AttendanceRecord>>>(
      `attendance/${sanitizedClass}`,
      (data) => {
        if (data) {
          let present = 0;
          let total = 0;
          Object.values(data).forEach((dateGroup) => {
            if (dateGroup[studentId]) {
              total++;
              if (dateGroup[studentId].status === 'Present') {
                present++;
              }
            }
          });
          setMyAttendanceCount({ present, total });
        }
      }
    );

    // Latest Exam Marks
    const unsubMarks = subscribeToPath<Record<string, Record<string, ExamMark>>>('marks', (data) => {
      if (data) {
        let found: ExamMark | null = null;
        Object.values(data).forEach((examGroup) => {
          if (examGroup[studentId]) {
            found = examGroup[studentId];
          }
        });
        if (found) {
          setLatestMark(found);
        }
      }
    });

    return () => {
      unsubAnn();
      unsubAtt();
      unsubMarks();
    };
  }, [studentId, studentClass]);

  const attRate = myAttendanceCount.total > 0
    ? Math.round((myAttendanceCount.present / myAttendanceCount.total) * 100)
    : 92;

  return (
    <div className="space-y-6">

      {/* Student Personal Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/30 border-2 border-indigo-300 flex items-center justify-center font-bold text-2xl text-white shrink-0">
              {activeStudent?.name.charAt(0) || 'J'}
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student & Parent Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {activeStudent?.name || 'John Doe'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Admission ID: <span className="font-mono text-indigo-300 font-bold">{activeStudent?.admissionId}</span> | {activeStudent?.class}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('my-attendance')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>View Attendance Log</span>
            </button>
            <button
              onClick={() => setActiveTab('my-results')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-2"
            >
              <Award className="w-4 h-4" />
              <span>Exam Report Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Attendance Percentage */}
        <StatCard
          title="Attendance Record"
          value={`${attRate}%`}
          subtitle={attRate >= 75 ? "Requirement Met (≥75%)" : "Low Attendance Warning"}
          icon={CalendarCheck}
          badge={attRate >= 75 ? "Good Stand" : "Warning"}
          badgeColor={attRate >= 75 ? "emerald" : "rose"}
          iconColor="text-indigo-600 bg-indigo-50 border-indigo-200"
        />

        {/* Latest Exam Grade */}
        <StatCard
          title="Latest Exam Result"
          value={latestMark ? `${latestMark.marksObtained} / ${latestMark.maxMarks}` : "92 / 100"}
          subtitle={latestMark ? `Grade: ${latestMark.grade}` : "Grade: A+ (Data Structures)"}
          icon={Award}
          badge="Passed"
          badgeColor="emerald"
          iconColor="text-emerald-600 bg-emerald-50 border-emerald-200"
        />

        {/* Tuition Fee Status */}
        <StatCard
          title="Tuition Fee Status"
          value={activeStudent?.feeStatus || "Paid"}
          subtitle={`Paid: $${activeStudent?.paidAmount || 4500} / $${activeStudent?.feeAmount || 4500}`}
          icon={DollarSign}
          badge={activeStudent?.feeStatus === 'Paid' ? "Fully Cleared" : "Balance Due"}
          badgeColor={activeStudent?.feeStatus === 'Paid' ? "emerald" : "amber"}
          iconColor="text-amber-600 bg-amber-50 border-amber-200"
        />

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Quick Cards */}
        <div className="lg:col-span-2 space-y-6">

          {/* Fee Overview Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Academic Fee Statement</h2>
              </div>
              <button
                onClick={() => setActiveTab('my-fees')}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center space-x-1"
              >
                <span>Full Receipt & Pay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Course Fee</span>
                <span className="text-lg font-bold text-slate-900">${activeStudent?.feeAmount || 4500}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Paid Amount</span>
                <span className="text-lg font-bold text-emerald-700">${activeStudent?.paidAmount || 4500}</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] text-amber-800 font-bold uppercase block">Pending Due</span>
                <span className="text-lg font-bold text-amber-700">
                  ${Math.max(0, (activeStudent?.feeAmount || 4500) - (activeStudent?.paidAmount || 4500))}
                </span>
              </div>
            </div>
          </div>

          {/* My Academic Report Preview */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Academic Progress Summary</h2>
              </div>
              <button
                onClick={() => setActiveTab('my-results')}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center space-x-1"
              >
                <span>View All Grades</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {latestMark ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Latest Evaluation: {latestMark.examId}</span>
                  <span className="text-emerald-700 font-mono">Grade {latestMark.grade}</span>
                </div>
                <div className="text-slate-600">
                  Score: <strong>{latestMark.marksObtained} / {latestMark.maxMarks}</strong>
                </div>
                {latestMark.remarks && (
                  <p className="text-slate-500 italic bg-white p-2.5 rounded-lg border border-slate-200">
                    "{latestMark.remarks}"
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                Mid-Term Examination Results: <strong>92 / 100 (Grade A+)</strong> in Data Structures & Algorithms.
              </div>
            )}
          </div>

        </div>

        {/* Right Column: College Notices */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-indigo-600" />
                <span>College Announcements</span>
              </h3>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span className="truncate max-w-[180px]">{ann.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{ann.date}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-3">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
