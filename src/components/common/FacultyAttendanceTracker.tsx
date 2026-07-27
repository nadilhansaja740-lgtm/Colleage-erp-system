import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRecord, AttendanceStatus, TeacherAttendanceRecord } from '../../types';
import {
  saveBulkAttendance,
  saveTeacherAttendance,
  saveBulkTeacherAttendance,
  subscribeToPath
} from '../../firebase/db';
import {
  CalendarCheck,
  Building2,
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Save,
  Check,
  Filter,
  Search,
  Calendar,
  Sparkles,
  Briefcase,
  Smartphone,
  TrendingUp,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const FACULTIES = [
  'Faculty of Computer Science & AI',
  'Faculty of Electronics & Electrical Engineering',
  'Faculty of Mechanical & Mechatronics',
  'Faculty of Business & Management',
  'Faculty of Basic & Applied Sciences'
];

// Mapping faculty to class streams
const FACULTY_CLASS_MAP: Record<string, string[]> = {
  'Faculty of Computer Science & AI': [
    'B.Tech CSE - 3rd Year',
    'B.Tech CSE - 2nd Year',
    'B.Tech AI & ML - 1st Year',
    'M.Tech Software Eng - 1st Year'
  ],
  'Faculty of Electronics & Electrical Engineering': [
    'B.Tech ECE - 2nd Year',
    'B.Tech EEE - 3rd Year',
    'M.Tech VLSI - 2nd Year'
  ],
  'Faculty of Mechanical & Mechatronics': [
    'B.Tech ME - 4th Year',
    'B.Tech Robotics - 2nd Year'
  ],
  'Faculty of Business & Management': [
    'MBA - 1st Year',
    'BBA - 2nd Year',
    'B.Com Honors - 3rd Year'
  ],
  'Faculty of Basic & Applied Sciences': [
    'B.Sc Physics - 1st Year',
    'B.Sc Mathematics - 2nd Year'
  ]
};

const INITIAL_TEACHER_ATTENDANCE: TeacherAttendanceRecord[] = [
  {
    id: 'TATT-101',
    teacherId: 'TCH-2001',
    teacherName: 'Prof. Alan Smith',
    department: 'Faculty of Computer Science & AI',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '08:30 AM',
    checkOutTime: '04:30 PM',
    status: 'Present',
    workMode: 'On Campus',
    remarks: 'Delivered Operating Systems & Algorithms lectures',
    markedBy: 'Self Check-In',
    timestamp: Date.now()
  },
  {
    id: 'TATT-102',
    teacherId: 'TCH-2002',
    teacherName: 'Dr. Sarah Connor',
    department: 'Faculty of Electronics & Electrical Engineering',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '08:45 AM',
    checkOutTime: '05:00 PM',
    status: 'Present',
    workMode: 'On Campus',
    remarks: 'Microprocessors Lab Supervisor',
    markedBy: 'Self Check-In',
    timestamp: Date.now()
  },
  {
    id: 'TATT-103',
    teacherId: 'TCH-2003',
    teacherName: 'Dr. Michael Brown',
    department: 'Faculty of Mechanical & Mechatronics',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '09:15 AM',
    checkOutTime: '--',
    status: 'Late',
    workMode: 'On Campus',
    remarks: 'Traffic delay on university expressway',
    markedBy: 'Self Check-In',
    timestamp: Date.now()
  },
  {
    id: 'TATT-104',
    teacherId: 'TCH-2004',
    teacherName: 'Prof. Elena Rostova',
    department: 'Faculty of Business & Management',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '--',
    checkOutTime: '--',
    status: 'On Leave',
    workMode: 'Remote / Online',
    remarks: 'Academic Research Conference Presentation',
    markedBy: 'HOD Approved',
    timestamp: Date.now()
  }
];

export const FacultyAttendanceTracker: React.FC = () => {
  const { user, role, allStudents, allTeachers, activeTeacher } = useAuth();

  // Primary Tab: 'student-attendance' | 'teacher-attendance'
  const [activeTab, setActiveTab] = useState<'student-attendance' | 'teacher-attendance'>('student-attendance');

  // --- Student Attendance State ---
  const [selectedFaculty, setSelectedFaculty] = useState<string>(FACULTIES[0]);
  const availableClasses = FACULTY_CLASS_MAP[selectedFaculty] || ['All Classes'];
  const [selectedClass, setSelectedClass] = useState<string>(availableClasses[0] || 'All Classes');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Update selected class when faculty changes
  useEffect(() => {
    const classes = FACULTY_CLASS_MAP[selectedFaculty] || [];
    if (classes.length > 0) {
      setSelectedClass(classes[0]);
    } else {
      setSelectedClass('All Classes');
    }
  }, [selectedFaculty]);

  // Filter students for current faculty / class
  const classStudents = allStudents.filter((s) => {
    if (selectedClass !== 'All Classes' && s.class !== selectedClass) return false;
    return true;
  });

  const [studentAttendanceState, setStudentAttendanceState] = useState<Record<string, AttendanceStatus>>({});
  const [savingStudent, setSavingStudent] = useState(false);
  const [savedStudentSuccess, setSavedStudentSuccess] = useState(false);

  // Subscribe to Firebase RTDB for Student Attendance
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
        classStudents.forEach((stu) => {
          newState[stu.id] = 'Present';
        });
      }
      setStudentAttendanceState(newState);
    });

    return () => unsub();
  }, [selectedClass, selectedDate, allStudents]);

  const handleSetStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setStudentAttendanceState((prev) => ({
      ...prev,
      [studentId]: status
    }));
    setSavedStudentSuccess(false);
  };

  const handleMarkAllStudentsPresent = () => {
    const newState: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => {
      newState[s.id] = 'Present';
    });
    setStudentAttendanceState(newState);
    setSavedStudentSuccess(false);
  };

  const handleSaveStudentAttendance = async () => {
    setSavingStudent(true);
    setSavedStudentSuccess(false);

    const records: AttendanceRecord[] = classStudents.map((stu) => ({
      studentId: stu.id,
      studentName: stu.name,
      admissionId: stu.admissionId,
      classId: selectedClass,
      date: selectedDate,
      status: studentAttendanceState[stu.id] || 'Present',
      markedBy: activeTeacher?.teacherId || user?.admissionId || 'TCH-2001',
      markedByName: activeTeacher?.name || user?.name || 'Prof. Alan Smith',
      timestamp: Date.now()
    }));

    const ok = await saveBulkAttendance(selectedClass, selectedDate, records);
    setSavingStudent(false);

    if (ok) {
      setSavedStudentSuccess(true);
      setTimeout(() => setSavedStudentSuccess(false), 3000);
    } else {
      alert('Failed to sync student attendance to Realtime DB');
    }
  };

  // Student Metrics
  const totalStudentsCount = classStudents.length;
  const presentStudentsCount = classStudents.filter(
    (s) => (studentAttendanceState[s.id] || 'Present') === 'Present'
  ).length;
  const absentStudentsCount = classStudents.filter((s) => studentAttendanceState[s.id] === 'Absent').length;
  const lateStudentsCount = classStudents.filter((s) => studentAttendanceState[s.id] === 'Late').length;
  const studentAttendanceRate = totalStudentsCount
    ? Math.round((presentStudentsCount / totalStudentsCount) * 100)
    : 100;

  // --- Teacher Attendance State ---
  const [teacherDate, setTeacherDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTeacherFaculty, setSelectedTeacherFaculty] = useState<string>('All Faculties');
  const [teacherAttendanceLogs, setTeacherAttendanceLogs] = useState<TeacherAttendanceRecord[]>([]);
  const [savingTeacher, setSavingTeacher] = useState(false);
  const [savedTeacherSuccess, setSavedTeacherSuccess] = useState(false);

  // Self Check-In Modal for Teacher
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInTime, setCheckInTime] = useState('08:30 AM');
  const [checkOutTime, setCheckOutTime] = useState('04:30 PM');
  const [teacherWorkMode, setTeacherWorkMode] = useState<'On Campus' | 'Remote / Online' | 'Field Work'>('On Campus');
  const [teacherStatus, setTeacherStatus] = useState<'Present' | 'Absent' | 'Late' | 'On Leave' | 'Duty Travel'>('Present');
  const [teacherRemarks, setTeacherRemarks] = useState('');

  // Subscribe to Teacher Attendance in Firebase RTDB
  useEffect(() => {
    const path = `teacherAttendance/${teacherDate}`;
    const unsub = subscribeToPath<Record<string, TeacherAttendanceRecord>>(path, (data) => {
      if (data) {
        setTeacherAttendanceLogs(Object.values(data));
      } else {
        // Fallback default teacher attendance log
        const defaultLogs: TeacherAttendanceRecord[] = allTeachers.map((tch, idx) => ({
          id: `TATT-${100 + idx}`,
          teacherId: tch.teacherId || tch.id,
          teacherName: tch.name,
          department: tch.department || 'Faculty of Computer Science & AI',
          date: teacherDate,
          checkInTime: idx % 2 === 0 ? '08:30 AM' : '08:50 AM',
          checkOutTime: idx % 2 === 0 ? '04:30 PM' : '05:00 PM',
          status: idx === 3 ? 'On Leave' : 'Present',
          workMode: 'On Campus',
          remarks: 'Standard Academic Schedule',
          markedBy: 'Faculty System',
          timestamp: Date.now()
        }));

        setTeacherAttendanceLogs(defaultLogs.length ? defaultLogs : INITIAL_TEACHER_ATTENDANCE);
      }
    });

    return () => unsub();
  }, [teacherDate, allTeachers]);

  // Filter teachers by selected faculty
  const filteredTeacherLogs = teacherAttendanceLogs.filter((rec) => {
    if (selectedTeacherFaculty === 'All Faculties') return true;
    return rec.department === selectedTeacherFaculty;
  });

  const handleTeacherSelfCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentTeacherId = activeTeacher?.teacherId || user?.teacherId || 'TCH-2001';
    const currentTeacherName = activeTeacher?.name || user?.name || 'Prof. Alan Smith';
    const currentDepartment = activeTeacher?.department || selectedFaculty;

    const newRecord: TeacherAttendanceRecord = {
      id: `TATT-${Date.now().toString().slice(-5)}`,
      teacherId: currentTeacherId,
      teacherName: currentTeacherName,
      department: currentDepartment,
      date: teacherDate,
      checkInTime,
      checkOutTime,
      status: teacherStatus,
      workMode: teacherWorkMode,
      remarks: teacherRemarks.trim() || 'Recorded via NH College Attendance Portal',
      markedBy: user?.name || 'Self Check-In',
      timestamp: Date.now()
    };

    const ok = await saveTeacherAttendance(newRecord);
    if (ok) {
      setSavedTeacherSuccess(true);
      setIsCheckInModalOpen(false);
      setTimeout(() => setSavedTeacherSuccess(false), 4000);
    } else {
      alert('Failed to record teacher attendance');
    }
  };

  const handleQuickTeacherStatus = async (teacherId: string, status: 'Present' | 'Absent' | 'Late' | 'On Leave' | 'Duty Travel') => {
    const existing = teacherAttendanceLogs.find((t) => t.teacherId === teacherId);
    const tchObj = allTeachers.find((t) => t.teacherId === teacherId || t.id === teacherId);

    const updatedRecord: TeacherAttendanceRecord = {
      id: existing?.id || `TATT-${Date.now().toString().slice(-5)}`,
      teacherId: teacherId,
      teacherName: existing?.teacherName || tchObj?.name || 'Faculty Member',
      department: existing?.department || tchObj?.department || selectedFaculty,
      date: teacherDate,
      checkInTime: status === 'Present' ? '08:30 AM' : '--',
      checkOutTime: status === 'Present' ? '04:30 PM' : '--',
      status,
      workMode: existing?.workMode || 'On Campus',
      remarks: `Status updated to ${status} by ${user?.name || 'Admin'}`,
      markedBy: user?.name || 'Department Admin',
      timestamp: Date.now()
    };

    await saveTeacherAttendance(updatedRecord);
  };

  // Teacher Metrics
  const totalTeachersCount = filteredTeacherLogs.length;
  const presentTeachersCount = filteredTeacherLogs.filter((t) => t.status === 'Present').length;
  const leaveTeachersCount = filteredTeacherLogs.filter((t) => t.status === 'On Leave').length;
  const lateTeachersCount = filteredTeacherLogs.filter((t) => t.status === 'Late').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold mb-1">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>NH Education Group • All Faculties Attendance Division</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Faculty & Student Attendance Tracker
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Monitor student attendance days across all faculties and manage daily teacher presence & check-ins.
          </p>
        </div>

        {/* Tab Switch Buttons */}
        <div className="flex items-center space-x-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 shrink-0">
          <button
            onClick={() => setActiveTab('student-attendance')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'student-attendance'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Attendance</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher-attendance')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'teacher-attendance'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Teacher Attendance</span>
          </button>
        </div>
      </div>

      {savedTeacherSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>Teacher attendance recorded and synchronized with Realtime Database!</span>
        </div>
      )}

      {/* TAB 1: STUDENT ATTENDANCE ACROSS FACULTIES */}
      {activeTab === 'student-attendance' && (
        <div className="space-y-6">
          
          {/* Faculty & Class Selector Toolbar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Select Faculty & Class Roster
                </h2>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                {classStudents.length} Students Enrolled
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Faculty Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  1. Select Faculty Department
                </label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {FACULTIES.map((fac) => (
                    <option key={fac} value={fac}>
                      {fac}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Stream Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  2. Select Class / Batch Program
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  3. Attendance Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleMarkAllStudentsPresent}
                className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition-colors"
              >
                ✓ Mark All Students Present
              </button>

              <button
                onClick={handleSaveStudentAttendance}
                disabled={savingStudent || totalStudentsCount === 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                {savedStudentSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Saved to Firebase Realtime DB!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{savingStudent ? 'Saving...' : 'Save Student Attendance'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Attendance KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Enrolled</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{totalStudentsCount}</span>
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase block">Present</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{presentStudentsCount}</span>
            </div>

            <div className="bg-rose-50/60 dark:bg-rose-950/40 p-4 rounded-xl border border-rose-200 dark:border-rose-800 text-center">
              <span className="text-[10px] text-rose-800 dark:text-rose-300 font-bold uppercase block">Absent</span>
              <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{absentStudentsCount}</span>
            </div>

            <div className="bg-amber-50/60 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
              <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase block">Attendance Rate</span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{studentAttendanceRate}%</span>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-xs text-slate-700 dark:text-slate-300">
              <div>
                <span>Faculty: <strong>{selectedFaculty}</strong></span>
                <span className="ml-3 text-slate-400">• Class: <strong>{selectedClass}</strong></span>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">Date: {selectedDate}</span>
            </div>

            {classStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                No students enrolled under class "{selectedClass}". Select another faculty or class.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700 text-xs">
                {classStudents.map((student) => {
                  const currentStatus = studentAttendanceState[student.id] || 'Present';
                  return (
                    <div
                      key={student.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{student.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Admission ID: {student.admissionId} • {student.stream}
                          </div>
                        </div>
                      </div>

                      {/* Attendance Toggle Buttons */}
                      <div className="flex items-center space-x-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleSetStudentStatus(student.id, 'Present')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-600 text-white shadow-xs font-bold ring-2 ring-emerald-600/30'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        <button
                          onClick={() => handleSetStudentStatus(student.id, 'Absent')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                            currentStatus === 'Absent'
                              ? 'bg-rose-600 text-white shadow-xs font-bold ring-2 ring-rose-600/30'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>

                        <button
                          onClick={() => handleSetStudentStatus(student.id, 'Late')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                            currentStatus === 'Late'
                              ? 'bg-amber-500 text-white shadow-xs font-bold ring-2 ring-amber-500/30'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-700'
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
          </div>
        </div>
      )}

      {/* TAB 2: TEACHER ATTENDANCE & CHECK-IN RECORDER */}
      {activeTab === 'teacher-attendance' && (
        <div className="space-y-6">
          
          {/* Top Bar for Teacher Attendance */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Filter by Faculty
                </label>
                <select
                  value={selectedTeacherFaculty}
                  onChange={(e) => setSelectedTeacherFaculty(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="All Faculties">All Faculty Departments</option>
                  {FACULTIES.map((fac) => (
                    <option key={fac} value={fac}>
                      {fac}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={teacherDate}
                  onChange={(e) => setTeacherDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              <button
                onClick={() => setIsCheckInModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center space-x-2 transition-all"
              >
                <Clock className="w-4 h-4" />
                <span>Teacher Self Check-In / Clock-In</span>
              </button>
            </div>
          </div>

          {/* Teacher Attendance KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Faculty Members</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{totalTeachersCount}</span>
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase block">Present Today</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{presentTeachersCount}</span>
            </div>

            <div className="bg-amber-50/60 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
              <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase block">Late Arrivals</span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{lateTeachersCount}</span>
            </div>

            <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 text-center">
              <span className="text-[10px] text-indigo-800 dark:text-indigo-300 font-bold uppercase block">On Leave</span>
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{leaveTeachersCount}</span>
            </div>
          </div>

          {/* Teacher Attendance Ledger */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Faculty Teacher Attendance Register ({filteredTeacherLogs.length})
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">Date: {teacherDate}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Teacher Name & Faculty</th>
                    <th className="py-3.5 px-4">Check-In / Out</th>
                    <th className="py-3.5 px-4">Work Mode</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Remarks</th>
                    <th className="py-3.5 px-4 text-right">Admin Mark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredTeacherLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                        No teacher attendance logs found for this date and department filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTeacherLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{log.teacherName}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{log.department}</div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                          <div>In: <span className="text-emerald-600 dark:text-emerald-400">{log.checkInTime || '--'}</span></div>
                          <div className="text-slate-500">Out: {log.checkOutTime || '--'}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                            {log.workMode || 'On Campus'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              log.status === 'Present'
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                                : log.status === 'Late'
                                ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                                : log.status === 'On Leave'
                                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300'
                                : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                            }`}
                          >
                            <span>{log.status}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate italic">
                          {log.remarks || 'Normal academic duties'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center space-x-1">
                            <button
                              onClick={() => handleQuickTeacherStatus(log.teacherId, 'Present')}
                              className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg text-[10px]"
                              title="Mark Present"
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleQuickTeacherStatus(log.teacherId, 'On Leave')}
                              className="px-2 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg text-[10px]"
                              title="Mark Leave"
                            >
                              Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Self Check-In Modal */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Teacher Self Clock-In</h3>
              </div>
              <button
                onClick={() => setIsCheckInModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleTeacherSelfCheckIn} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Faculty Member</div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {activeTeacher?.name || user?.name || 'Prof. Alan Smith'}
                </div>
                <div className="text-[11px] text-indigo-600 dark:text-indigo-400">
                  {activeTeacher?.department || selectedFaculty}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Check-In Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Check-Out
                  </label>
                  <input
                    type="text"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work Mode
                </label>
                <select
                  value={teacherWorkMode}
                  onChange={(e) => setTeacherWorkMode(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="On Campus">On Campus (Main University)</option>
                  <option value="Remote / Online">Remote / Online Virtual Lecture</option>
                  <option value="Field Work">Field Work / External Duty</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attendance Status
                </label>
                <select
                  value={teacherStatus}
                  onChange={(e) => setTeacherStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late Arrival</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Duty Travel">Official Duty Travel</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Remarks / Lecture Notes
                </label>
                <input
                  type="text"
                  value={teacherRemarks}
                  onChange={(e) => setTeacherRemarks(e.target.value)}
                  placeholder="e.g. Conducted CS301 Data Structures Lab"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Confirm Self Clock-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
