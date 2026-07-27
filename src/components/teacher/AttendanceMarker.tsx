import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { saveBulkAttendance, subscribeToPath } from '../../firebase/db';
import {
  CalendarCheck,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  Check,
  Filter
} from 'lucide-react';

export const AttendanceMarker: React.FC = () => {
  const { allStudents, activeTeacher } = useAuth();

  const teacherClasses = activeTeacher?.assignedClasses?.length
    ? activeTeacher.assignedClasses
    : ['B.Tech CSE - 3rd Year', 'B.Tech ECE - 2nd Year', 'B.Tech ME - 4th Year'];

  const [selectedClass, setSelectedClass] = useState<string>(teacherClasses[0]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Student list for current selected class
  const classStudents = allStudents.filter(
    (s) => s.class === selectedClass || selectedClass === 'All'
  );

  // State mapping: studentId -> AttendanceStatus
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load existing attendance from Firebase RTDB for selected class & date
  useEffect(() => {
    const sanitizedClass = selectedClass.replace(/[^a-zA-Z0-9]/g, '_');
    const path = `attendance/${sanitizedClass}/${selectedDate}`;

    const unsub = subscribeToPath<Record<string, AttendanceRecord>>(path, (data) => {
      const newState: Record<string, AttendanceStatus> = {};
      if (data) {
        Object.values(data).forEach((rec) => {
          newState[rec.studentId] = rec.status;
        });
      } else {
        // Default all to Present
        classStudents.forEach((stu) => {
          newState[stu.id] = 'Present';
        });
      }
      setAttendanceState(newState);
    });

    return () => unsub();
  }, [selectedClass, selectedDate, allStudents]);

  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status
    }));
    setSavedSuccess(false);
  };

  const handleMarkAllPresent = () => {
    const newState: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => {
      newState[s.id] = 'Present';
    });
    setAttendanceState(newState);
    setSavedSuccess(false);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSavedSuccess(false);

    const records: AttendanceRecord[] = classStudents.map((stu) => ({
      studentId: stu.id,
      studentName: stu.name,
      admissionId: stu.admissionId,
      classId: selectedClass,
      date: selectedDate,
      status: attendanceState[stu.id] || 'Present',
      markedBy: activeTeacher?.teacherId || 'TCH-2001',
      markedByName: activeTeacher?.name || 'Prof. Alan Smith',
      timestamp: Date.now()
    }));

    const ok = await saveBulkAttendance(selectedClass, selectedDate, records);
    setSaving(false);

    if (ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } else {
      alert('Failed to save attendance records to Firebase Realtime Database');
    }
  };

  // Metrics
  const totalCount = classStudents.length;
  const presentCount = classStudents.filter(
    (s) => (attendanceState[s.id] || 'Present') === 'Present'
  ).length;
  const absentCount = classStudents.filter(
    (s) => attendanceState[s.id] === 'Absent'
  ).length;
  const lateCount = classStudents.filter((s) => attendanceState[s.id] === 'Late').length;

  const attendancePercentage = totalCount
    ? Math.round((presentCount / totalCount) * 100)
    : 100;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
            <span>Mark Class Attendance</span>
          </h1>
          <p className="text-xs text-slate-500">
            Record student daily attendance with instant synchronization to Firebase Realtime Database.
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || totalCount === 0}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center space-x-2 transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Saved to Firebase!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
            </>
          )}
        </button>
      </div>

      {/* Class & Date Selector Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Class Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Select Class / Batch
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {teacherClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

        </div>

        {/* Quick Bulk Action */}
        <button
          onClick={handleMarkAllPresent}
          className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors shrink-0"
        >
          ✓ Mark All Present
        </button>
      </div>

      {/* Summary Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Roster</span>
          <span className="text-xl font-extrabold text-slate-900">{totalCount}</span>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 text-center">
          <span className="text-[10px] text-emerald-800 font-bold uppercase block">Present</span>
          <span className="text-xl font-extrabold text-emerald-700">{presentCount}</span>
        </div>

        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 text-center">
          <span className="text-[10px] text-rose-800 font-bold uppercase block">Absent</span>
          <span className="text-xl font-extrabold text-rose-700">{absentCount}</span>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 text-center">
          <span className="text-[10px] text-amber-800 font-bold uppercase block">Late</span>
          <span className="text-xl font-extrabold text-amber-700">{lateCount}</span>
        </div>
      </div>

      {/* Attendance Sheet Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-bold text-xs text-slate-700">
          <span>Roster: {selectedClass}</span>
          <span className="text-indigo-600 font-mono">Date: {selectedDate}</span>
        </div>

        {classStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic">
            No students found enrolled under class "{selectedClass}". You can add students in Admin &gt; Manage Students.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {classStudents.map((student) => {
              const currentStatus = attendanceState[student.id] || 'Present';
              return (
                <div
                  key={student.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{student.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Admission ID: {student.admissionId}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Buttons */}
                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleSetStatus(student.id, 'Present')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                        currentStatus === 'Present'
                          ? 'bg-emerald-600 text-white shadow-xs font-bold ring-2 ring-emerald-600/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Present</span>
                    </button>

                    <button
                      onClick={() => handleSetStatus(student.id, 'Absent')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                        currentStatus === 'Absent'
                          ? 'bg-rose-600 text-white shadow-xs font-bold ring-2 ring-rose-600/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Absent</span>
                    </button>

                    <button
                      onClick={() => handleSetStatus(student.id, 'Late')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                        currentStatus === 'Late'
                          ? 'bg-amber-500 text-white shadow-xs font-bold ring-2 ring-amber-500/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Late</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {classStudents.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Class Attendance Rate: <strong className="text-slate-800">{attendancePercentage}%</strong>
            </span>

            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Attendance to Realtime DB'}</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
