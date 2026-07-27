import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { FirebaseSetupModal } from './components/common/FirebaseSetupModal';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentManager } from './components/admin/StudentManager';
import { TeacherManager } from './components/admin/TeacherManager';
import { FeeManager } from './components/admin/FeeManager';
import { SubjectManager } from './components/admin/SubjectManager';

// Teacher Components
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { AttendanceMarker } from './components/teacher/AttendanceMarker';
import { ExamResultsManager } from './components/teacher/ExamResultsManager';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentAttendance } from './components/student/StudentAttendance';
import { StudentResults } from './components/student/StudentResults';
import { StudentFees } from './components/student/StudentFees';

// Common Views
import { AnnouncementsView } from './components/common/AnnouncementsView';
import { CollegeRating } from './components/common/CollegeRating';
import { BankDetailsPayment } from './components/common/BankDetailsPayment';
import { FacultyAttendanceTracker } from './components/common/FacultyAttendanceTracker';
import { FinalCertificateExam } from './components/student/FinalCertificateExam';
import { LoginPage } from './components/auth/LoginPage';

const MainApp: React.FC = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  if (!user) {
    return (
      <>
        <LoginPage onOpenSetupModal={() => setIsSetupModalOpen(true)} />
        <FirebaseSetupModal
          isOpen={isSetupModalOpen}
          onClose={() => setIsSetupModalOpen(false)}
        />
      </>
    );
  }

  const renderTabContent = () => {
    // Universal routes accessible to all authenticated roles
    if (activeTab === 'college-rating') {
      return <CollegeRating />;
    }
    if (activeTab === 'bank-details') {
      return <BankDetailsPayment />;
    }
    if (activeTab === 'final-cert') {
      return <FinalCertificateExam />;
    }
    if (activeTab === 'students') {
      return <StudentManager />;
    }
    if (activeTab === 'teachers') {
      return <TeacherManager />;
    }
    if (activeTab === 'attendance') {
      return <FacultyAttendanceTracker />;
    }

    if (role === 'admin') {
      switch (activeTab) {
        case 'subjects':
          return <SubjectManager />;
        case 'fees':
          return <FeeManager />;
        case 'announcements':
          return <AnnouncementsView />;
        case 'dashboard':
        default:
          return <AdminDashboard setActiveTab={setActiveTab} />;
      }
    } else if (role === 'teacher') {
      switch (activeTab) {
        case 'subjects':
          return <SubjectManager />;
        case 'attendance':
          return <AttendanceMarker />;
        case 'results':
          return <ExamResultsManager />;
        case 'announcements':
          return <AnnouncementsView />;
        case 'dashboard':
        default:
          return <TeacherDashboard setActiveTab={setActiveTab} />;
      }
    } else {
      // Student
      switch (activeTab) {
        case 'subjects':
          return <SubjectManager />;
        case 'my-attendance':
          return <StudentAttendance />;
        case 'my-results':
          return <StudentResults />;
        case 'my-fees':
          return <StudentFees />;
        case 'announcements':
          return <AnnouncementsView />;
        case 'dashboard':
        default:
          return <StudentDashboard setActiveTab={setActiveTab} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col font-sans text-slate-800 dark:text-slate-100 antialiased transition-colors duration-200">
      <Header
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSetupModal={() => setIsSetupModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderTabContent()}
        </main>
      </div>

      <FirebaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
