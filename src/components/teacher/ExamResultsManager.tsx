import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Exam, ExamMark } from '../../types';
import { saveExam, saveBulkExamMarks, subscribeToPath } from '../../firebase/db';
import {
  Award,
  Plus,
  BookOpen,
  Save,
  Check,
  X,
  TrendingUp,
  BarChart,
  User
} from 'lucide-react';

export const ExamResultsManager: React.FC = () => {
  const { allStudents, activeTeacher } = useAuth();

  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('EXAM-3001');

  // Modal to create new exam
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [examFormData, setExamFormData] = useState<Partial<Exam>>({
    title: 'Mid-Term Examination 2026',
    stream: 'Computer Science',
    classId: 'B.Tech CSE - 3rd Year',
    subject: activeTeacher?.subject || 'Data Structures & Algorithms',
    examDate: new Date().toISOString().split('T')[0],
    maxMarks: 100
  });

  // Marks state: studentId -> { marksObtained, grade, remarks }
  const [marksState, setMarksState] = useState<Record<string, { marksObtained: number; grade: string; remarks: string }>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load Exams from RTDB
  useEffect(() => {
    const unsub = subscribeToPath<Record<string, Exam>>('exams', (data) => {
      if (data) {
        const list = Object.values(data);
        setExams(list);
        if (!selectedExamId && list.length > 0) {
          setSelectedExamId(list[0].id);
        }
      }
    });
    return () => unsub();
  }, []);

  const activeExam = exams.find((e) => e.id === selectedExamId) || {
    id: 'EXAM-3001',
    title: 'Mid-Term Examination 2026',
    stream: 'Computer Science',
    classId: 'B.Tech CSE - 3rd Year',
    subject: activeTeacher?.subject || 'Data Structures & Algorithms',
    examDate: '2026-07-15',
    maxMarks: 100,
    createdBy: 'TCH-2001'
  };

  // Filter students by active exam class
  const classStudents = allStudents.filter(
    (s) => s.class === activeExam.classId || activeExam.classId === 'All'
  );

  // Load existing marks for selected exam from RTDB
  useEffect(() => {
    if (!activeExam.id) return;

    const path = `marks/${activeExam.id}`;
    const unsub = subscribeToPath<Record<string, ExamMark>>(path, (data) => {
      const state: Record<string, { marksObtained: number; grade: string; remarks: string }> = {};
      if (data) {
        Object.values(data).forEach((m) => {
          state[m.studentId] = {
            marksObtained: m.marksObtained,
            grade: m.grade,
            remarks: m.remarks || ''
          };
        });
      } else {
        // Default initialized marks
        classStudents.forEach((stu) => {
          state[stu.id] = {
            marksObtained: 85,
            grade: 'A',
            remarks: 'Good progress'
          };
        });
      }
      setMarksState(state);
    });

    return () => unsub();
  }, [selectedExamId, allStudents]);

  const calculateGrade = (marks: number, max: number): string => {
    const pct = (marks / (max || 100)) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    return 'F';
  };

  const handleMarksChange = (studentId: string, marks: number, remarks?: string) => {
    const max = activeExam.maxMarks || 100;
    const boundedMarks = Math.max(0, Math.min(max, marks));
    const grade = calculateGrade(boundedMarks, max);

    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        marksObtained: boundedMarks,
        grade,
        remarks: remarks !== undefined ? remarks : (prev[studentId]?.remarks || '')
      }
    }));
    setSaveSuccess(false);
  };

  const handleCreateExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examFormData.title || !examFormData.subject) return;

    const newExam: Exam = {
      id: `EXAM-${Date.now().toString().slice(-4)}`,
      title: examFormData.title!,
      stream: examFormData.stream || 'Computer Science',
      classId: examFormData.classId || 'B.Tech CSE - 3rd Year',
      subject: examFormData.subject!,
      examDate: examFormData.examDate || '2026-07-26',
      maxMarks: Number(examFormData.maxMarks) || 100,
      createdBy: activeTeacher?.teacherId || 'TCH-2001'
    };

    const ok = await saveExam(newExam);
    if (ok) {
      setSelectedExamId(newExam.id);
      setIsCreateExamOpen(false);
    } else {
      alert('Failed to create exam in Firebase Realtime Database');
    }
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    setSaveSuccess(false);

    const marksToSave: ExamMark[] = classStudents.map((stu) => {
      const entry = marksState[stu.id] || { marksObtained: 80, grade: 'A', remarks: '' };
      return {
        examId: activeExam.id,
        studentId: stu.id,
        studentName: stu.name,
        admissionId: stu.admissionId,
        marksObtained: entry.marksObtained,
        maxMarks: activeExam.maxMarks || 100,
        grade: entry.grade,
        remarks: entry.remarks,
        updatedBy: activeTeacher?.name || 'Prof. Alan Smith',
        updatedAt: Date.now()
      };
    });

    const ok = await saveBulkExamMarks(activeExam.id, marksToSave);
    setSaving(false);

    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert('Failed to save marks to Firebase Realtime Database');
    }
  };

  // Performance calculations
  const marksList = classStudents.map((s) => marksState[s.id]?.marksObtained || 0);
  const highest = marksList.length ? Math.max(...marksList) : 0;
  const avg = marksList.length
    ? Math.round(marksList.reduce((a, b) => a + b, 0) / marksList.length)
    : 0;
  const passCount = marksList.filter((m) => (m / (activeExam.maxMarks || 100)) >= 0.5).length;
  const passRate = classStudents.length ? Math.round((passCount / classStudents.length) * 100) : 100;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Award className="w-6 h-6 text-emerald-600" />
            <span>Exam & Student Results Management</span>
          </h1>
          <p className="text-xs text-slate-500">
            Grade exams, record student marks, and publish official academic performance cards.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setIsCreateExamOpen(true)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-200"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Exam</span>
          </button>

          <button
            onClick={handleSaveMarks}
            disabled={saving || classStudents.length === 0}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Marks Saved to Firebase!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save All Marks'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Exam Selector Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Active Exam:</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden flex-1 sm:flex-none"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.subject} - {ex.classId})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4 text-xs text-slate-600 font-medium">
          <span>Subject: <strong className="text-slate-900">{activeExam.subject}</strong></span>
          <span>Max Marks: <strong className="text-indigo-600">{activeExam.maxMarks}</strong></span>
        </div>
      </div>

      {/* Class Statistics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Highest Score</span>
          <span className="text-2xl font-extrabold text-emerald-700">{highest} / {activeExam.maxMarks}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Class Average</span>
          <span className="text-2xl font-extrabold text-indigo-700">{avg} / {activeExam.maxMarks}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Pass Rate</span>
          <span className="text-2xl font-extrabold text-blue-700">{passRate}%</span>
        </div>
      </div>

      {/* Student Marks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between items-center">
          <span>Student Score Evaluator</span>
          <span className="text-xs text-emerald-700 font-mono">Realtime Grade Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Admission ID</th>
                <th className="py-3 px-4">Marks Obtained (out of {activeExam.maxMarks})</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {classStudents.map((student) => {
                const entry = marksState[student.id] || { marksObtained: 80, grade: 'A', remarks: '' };
                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{student.name}</td>

                    <td className="py-3 px-4 font-mono text-slate-600">{student.admissionId}</td>

                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min={0}
                        max={activeExam.maxMarks}
                        value={entry.marksObtained}
                        onChange={(e) =>
                          handleMarksChange(student.id, Number(e.target.value), entry.remarks)
                        }
                        className="w-24 p-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${
                          entry.grade === 'A+' || entry.grade === 'A'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : entry.grade === 'B+' || entry.grade === 'B'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {entry.grade}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={entry.remarks}
                        onChange={(e) =>
                          handleMarksChange(student.id, entry.marksObtained, e.target.value)
                        }
                        placeholder="Feedback e.g. Great performance"
                        className="w-full max-w-xs p-2 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Exam Modal */}
      {isCreateExamOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="text-base font-bold">Create New Examination</h3>
              <button
                onClick={() => setIsCreateExamOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExamSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Title *</label>
                <input
                  type="text"
                  required
                  value={examFormData.title || ''}
                  onChange={(e) => setExamFormData({ ...examFormData, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="e.g. End-Semester Data Structures 2026"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={examFormData.subject || ''}
                  onChange={(e) => setExamFormData({ ...examFormData, subject: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Class</label>
                  <input
                    type="text"
                    value={examFormData.classId || 'B.Tech CSE - 3rd Year'}
                    onChange={(e) => setExamFormData({ ...examFormData, classId: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={examFormData.maxMarks || 100}
                    onChange={(e) => setExamFormData({ ...examFormData, maxMarks: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateExamOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
