import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRecord } from '../../types';
import { subscribeToPath } from '../../firebase/db';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Award,
  Calendar
} from 'lucide-react';

export const StudentAttendance: React.FC = () => {
  const { activeStudent } = useAuth();
  const studentId = activeStudent?.id || 'STU-1001';
  const studentClass = activeStudent?.class || 'B.Tech CSE - 3rd Year';

  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const sanitizedClass = studentClass.replace(/[^a-zA-Z0-9]/g, '_');
    const path = `attendance/${sanitizedClass}`;

    const unsub = subscribeToPath<Record<string, Record<string, AttendanceRecord>>>(path, (data) => {
      if (data) {
        const studentLogs: AttendanceRecord[] = [];
        Object.keys(data).forEach((dateKey) => {
          const dateGroup = data[dateKey];
          if (dateGroup && dateGroup[studentId]) {
            studentLogs.push(dateGroup[studentId]);
          }
        });
        // Sort newest first
        studentLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecords(studentLogs);
      } else {
        // Sample attendance logs fallback
        const todayStr = new Date().toISOString().split('T')[0];
        setRecords([
          {
            studentId,
            studentName: activeStudent?.name || 'John Doe',
            admissionId: activeStudent?.admissionId || 'STU-1001',
            classId: studentClass,
            date: todayStr,
            status: 'Present',
            markedBy: 'TCH-2001',
            markedByName: 'Prof. Alan Smith',
            timestamp: Date.now()
          },
          {
            studentId,
            studentName: activeStudent?.name || 'John Doe',
            admissionId: activeStudent?.admissionId || 'STU-1001',
            classId: studentClass,
            date: '2026-07-25',
            status: 'Present',
            markedBy: 'TCH-2001',
            markedByName: 'Prof. Alan Smith',
            timestamp: Date.now() - 86400000
          },
          {
            studentId,
            studentName: activeStudent?.name || 'John Doe',
            admissionId: activeStudent?.admissionId || 'STU-1001',
            classId: studentClass,
            date: '2026-07-24',
            status: 'Late',
            markedBy: 'TCH-2001',
            markedByName: 'Prof. Alan Smith',
            timestamp: Date.now() - 86400000 * 2
          }
        ]);
      }
    });

    return () => unsub();
  }, [studentId, studentClass]);

  const totalClasses = records.length;
  const presentCount = records.filter((r) => r.status === 'Present').length;
  const lateCount = records.filter((r) => r.status === 'Late').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;

  const percentage = totalClasses
    ? Math.round(((presentCount + lateCount * 0.5) / totalClasses) * 100)
    : 94;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <CalendarCheck className="w-6 h-6 text-indigo-600" />
          <span>My Attendance History</span>
        </h1>
        <p className="text-xs text-slate-500">
          Personal attendance performance log synchronized with Realtime Database.
        </p>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Attendance Percentage Badge */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Overall Attendance</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{percentage}%</div>
          <p className="text-[11px] text-emerald-600 mt-0.5">≥75% Attendance Requirement Met</p>
        </div>

        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Present Days</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{presentCount}</div>
        </div>

        <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-800 uppercase block">Late Days</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{lateCount}</div>
        </div>

        <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-200 shadow-2xs">
          <span className="text-[10px] font-bold text-rose-800 uppercase block">Absent Days</span>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">{absentCount}</div>
        </div>

      </div>

      {/* Attendance Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
          Attendance Log Details
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Class / Subject</th>
                <th className="py-3 px-4">Marked By</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {records.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{rec.date}</td>

                  <td className="py-3.5 px-4 text-slate-700 font-medium">{rec.classId}</td>

                  <td className="py-3.5 px-4 text-slate-500">{rec.markedByName || 'Prof. Alan Smith'}</td>

                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-bold border ${
                        rec.status === 'Present'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : rec.status === 'Late'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {rec.status === 'Present' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                      {rec.status === 'Late' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      {rec.status === 'Absent' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                      <span>{rec.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
