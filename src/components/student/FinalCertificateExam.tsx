import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  GraduationCap,
  CheckCircle2,
  FileCheck,
  QrCode,
  Download,
  Printer,
  Building2,
  Sparkles,
  Calendar,
  AlertCircle,
  FileText,
  Edit3,
  Save,
  X
} from 'lucide-react';

export const FinalCertificateExam: React.FC = () => {
  const { user } = useAuth();
  const [showCertificate, setShowCertificate] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Editable Certificate Details
  const [certStudentName, setCertStudentName] = useState(user?.name || 'Aarav Sharma');
  const [certAdmissionId, setCertAdmissionId] = useState(user?.admissionId || 'STU-1001');
  const [certDegreeName, setCertDegreeName] = useState('Bachelor of Technology (B.Tech)');
  const [certStream, setCertStream] = useState(user?.stream || 'Computer Science & Engineering');
  const [certCgpa, setCertCgpa] = useState('3.88');
  const [certGrade, setCertGrade] = useState('First Class with Distinction (Honors)');
  const [certIssueDate, setCertIssueDate] = useState('July 26, 2026');
  const [certNumber] = useState(`NHC-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [verificationCode] = useState('NH-VERIFY-998823');

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    // Printable / Download PDF trigger
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-100 text-xs font-semibold mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>NH College Academic Convocation & Final Certificate Examination</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Final Degree Certificate & Graduation Exam</h1>
          <p className="text-amber-100 text-xs sm:text-sm mt-1">
            Official degree verification, final examination hall clearance, and customizable printable graduation certificates issued by NH Education Foundation.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center justify-center space-x-1.5 bg-amber-900/40 hover:bg-amber-900/60 text-white font-bold px-4 py-2.5 rounded-xl border border-amber-300/40 shadow-md text-xs transition-all"
          >
            <Edit3 className="w-4 h-4 text-amber-300" />
            <span>Edit Student Name & Details</span>
          </button>

          <button
            onClick={() => setShowCertificate(!showCertificate)}
            className="inline-flex items-center justify-center space-x-2 bg-white text-slate-900 hover:bg-slate-100 font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all text-xs"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>{showCertificate ? 'Hide Certificate' : 'View Official Certificate'}</span>
          </button>
        </div>
      </div>

      {/* Final Exam Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Exam Clearance Status</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
              PASSED
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Final Semester Exam</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Cleared all 8 Semesters without arrears.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cumulative CGPA</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{certCgpa} / 4.0</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{certGrade}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Certificate Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">Degree Verified</div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Serial No: {certNumber}</p>
        </div>
      </div>

      {/* Graduation Certificate Render */}
      {showCertificate && (
        <div id="certificate-print-area" className="bg-white text-slate-900 rounded-3xl p-8 sm:p-12 border-8 border-amber-600/30 shadow-2xl space-y-8 relative overflow-hidden print:m-0 print:border-none print:shadow-none">
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <GraduationCap className="w-96 h-96 text-amber-900" />
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-2 border-b-2 border-amber-500/40 pb-6 relative z-10">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-600 to-indigo-700 flex items-center justify-center text-white shadow-lg mb-2">
              <GraduationCap className="w-10 h-10" />
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-amber-800">NH EDUCATION FOUNDATION</div>
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-indigo-950 tracking-tight">NH COLLEGE OF TECHNOLOGY</h2>
            <p className="text-xs text-slate-600 font-medium">Autonomous Institution Accredited by NAAC Grade A++ • www.nhcollege.edu</p>
          </div>

          {/* Body Content */}
          <div className="text-center space-y-4 max-w-2xl mx-auto relative z-10 font-serif">
            <p className="text-sm uppercase tracking-widest text-slate-500 font-sans font-semibold">This is to certify that</p>
            
            {/* Student Name Display */}
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-900 border-b border-indigo-200 pb-2 inline-block px-8 relative group">
              <span>{certStudentName}</span>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="ml-3 text-xs font-sans text-indigo-600 hover:text-indigo-800 underline print:hidden inline-flex items-center space-x-1"
                title="Edit Student Name"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Name</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 font-sans">
              Admission ID: <span className="font-mono font-bold text-slate-800">{certAdmissionId}</span>
            </p>

            <p className="text-sm text-slate-700 leading-relaxed font-sans pt-2">
              Having successfully passed the <strong className="text-slate-900">Final Certificate Examination</strong> and satisfied all curriculum requirements, is hereby awarded the degree of
            </p>

            <div className="text-2xl font-extrabold text-amber-800 font-serif bg-amber-50 py-2.5 px-6 rounded-2xl border border-amber-200 inline-block">
              {certDegreeName}
            </div>

            <p className="text-xs text-slate-600 font-sans">
              Specialization in <strong className="text-slate-800">{certStream}</strong> with a Final CGPA of{' '}
              <strong className="text-indigo-900">{certCgpa} / 4.0 ({certGrade})</strong>.
            </p>
          </div>

          {/* Certificate Footer Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200 relative z-10 text-center font-sans">
            <div>
              <div className="font-mono text-[10px] text-slate-500">Verified QR Code</div>
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center mt-1">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">{verificationCode}</div>
            </div>

            <div className="flex flex-col items-center justify-end">
              <div className="w-20 h-20 rounded-full border-4 border-amber-500/40 bg-amber-50 flex items-center justify-center font-serif text-[10px] font-bold text-amber-900 text-center p-1 shadow-inner">
                OFFICIAL SEAL OF NH COLLEGE
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-semibold">{certIssueDate}</div>
            </div>

            <div className="flex flex-col items-center justify-end">
              <div className="font-serif italic text-lg text-indigo-900 font-bold border-b border-slate-400 pb-1 w-32">
                Dr. H. N. Roy
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">Dean & Academic Controller</div>
              <div className="text-[10px] text-slate-500">NH Education Foundation</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 print:hidden">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all"
            >
              <Edit3 className="w-4 h-4 text-indigo-600" />
              <span>Edit Certificate Info</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Certificate</span>
            </button>

            <button
              onClick={handlePrintCertificate}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs shadow-md flex items-center space-x-2 hover:bg-slate-800"
            >
              <Printer className="w-4 h-4" />
              <span>Print Certificate</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Student Certificate Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Edit Certificate Portal Info</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={certStudentName}
                  onChange={(e) => setCertStudentName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. Aarav Sharma"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Admission ID / Roll No.
                </label>
                <input
                  type="text"
                  value={certAdmissionId}
                  onChange={(e) => setCertAdmissionId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Degree Name
                </label>
                <input
                  type="text"
                  value={certDegreeName}
                  onChange={(e) => setCertDegreeName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Stream
                </label>
                <input
                  type="text"
                  value={certStream}
                  onChange={(e) => setCertStream(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">CGPA</label>
                  <input
                    type="text"
                    value={certCgpa}
                    onChange={(e) => setCertCgpa(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Issue Date</label>
                  <input
                    type="text"
                    value={certIssueDate}
                    onChange={(e) => setCertIssueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md flex items-center space-x-1"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Certificate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Examination Schedule & Rules */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-base">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Final Graduation Certificate Exam Guidelines</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">1. Eligibility Criteria</h4>
            <p className="text-slate-600 dark:text-slate-400">
              Students must have minimum 75% attendance across all subjects and clear all outstanding tuition fees.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">2. Certificate Verification</h4>
            <p className="text-slate-600 dark:text-slate-400">
              Each certificate carries a unique cryptographic QR verification code that employers can verify at <span className="text-indigo-600 dark:text-indigo-400 font-medium">www.nhcollege.edu/verify</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
