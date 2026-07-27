import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ExamMark, Exam } from '../../types';
import { subscribeToPath } from '../../firebase/db';
import {
  Award,
  BookOpen,
  CheckCircle,
  TrendingUp,
  FileText,
  Printer
} from 'lucide-react';

export const StudentResults: React.FC = () => {
  const { activeStudent } = useAuth();
  const studentId = activeStudent?.id || 'STU-1001';

  const [myMarks, setMyMarks] = useState<ExamMark[]>([]);
  const [examsMap, setExamsMap] = useState<Record<string, Exam>>({});

  useEffect(() => {
    // Fetch Exams
    const unsubExams = subscribeToPath<Record<string, Exam>>('exams', (data) => {
      if (data) setExamsMap(data);
    });

    // Fetch Marks
    const unsubMarks = subscribeToPath<Record<string, Record<string, ExamMark>>>('marks', (data) => {
      if (data) {
        const list: ExamMark[] = [];
        Object.values(data).forEach((examGroup) => {
          if (examGroup && examGroup[studentId]) {
            list.push(examGroup[studentId]);
          }
        });
        setMyMarks(list);
      } else {
        // Fallback sample mark
        setMyMarks([
          {
            examId: 'EXAM-3001',
            studentId,
            studentName: activeStudent?.name || 'John Doe',
            admissionId: activeStudent?.admissionId || 'STU-1001',
            marksObtained: 92,
            maxMarks: 100,
            grade: 'A+',
            remarks: 'Excellent problem solving skills in Data Structures',
            updatedBy: 'Prof. Alan Smith',
            updatedAt: Date.now()
          }
        ]);
      }
    });

    return () => {
      unsubExams();
      unsubMarks();
    };
  }, [studentId]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Award className="w-6 h-6 text-emerald-600" />
            <span>My Exam Results & Academic Report</span>
          </h1>
          <p className="text-xs text-slate-500">
            Official transcript card generated from Realtime Database records.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print Report Card</span>
        </button>
      </div>

      {/* Report Card Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Banner */}
        <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Official Report Card</div>
            <h2 className="text-xl font-extrabold mt-0.5">{activeStudent?.name}</h2>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              Admission ID: {activeStudent?.admissionId} | {activeStudent?.class}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-right">
            <span className="text-[10px] text-slate-300 uppercase font-semibold block">Academic Standing</span>
            <span className="text-lg font-bold text-emerald-400">First Class Distinction</span>
          </div>
        </div>

        {/* Results List */}
        <div className="p-6 space-y-4">
          {myMarks.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs italic">
              No exam results published yet for this student.
            </div>
          ) : (
            myMarks.map((m, idx) => {
              const examDetails = examsMap[m.examId];
              const pct = Math.round((m.marksObtained / (m.maxMarks || 100)) * 100);

              return (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {examDetails?.title || 'Mid-Term Examination 2026'}
                      </div>
                      <div className="text-xs text-slate-500">
                        Subject: <strong className="text-slate-800">{examDetails?.subject || 'Data Structures'}</strong>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-slate-900">
                          {m.marksObtained} / {m.maxMarks}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{pct}% Score</div>
                      </div>

                      <span
                        className={`px-3 py-1.5 rounded-xl text-sm font-extrabold border ${
                          m.grade === 'A+' || m.grade === 'A'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        }`}
                      >
                        {m.grade}
                      </span>
                    </div>
                  </div>

                  {/* Score Progress Bar */}
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-indigo-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    ></div>
                  </div>

                  {m.remarks && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-0.5">
                      <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
                        Teacher Feedback ({m.updatedBy}):
                      </span>
                      <p className="italic">"{m.remarks}"</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
