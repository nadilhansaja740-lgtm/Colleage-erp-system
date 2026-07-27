import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile, StudentRecord, TeacherRecord } from '../types';
import { subscribeToPath, getDataOnce } from '../firebase/db';
import { seedDatabase, INITIAL_STUDENTS, INITIAL_TEACHERS } from '../firebase/seedData';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  activeStudent: StudentRecord | null;
  activeTeacher: TeacherRecord | null;
  allStudents: StudentRecord[];
  allTeachers: TeacherRecord[];
  rtdbConnected: boolean;
  loginAsRole: (role: UserRole, customEmail?: string) => void;
  loginWithEmailPassword: (email: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  triggerSeed: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default accounts
const DEMO_USERS: Record<UserRole, UserProfile> = {
  admin: {
    uid: 'admin_user',
    email: 'admin@college.edu',
    name: 'Dr. Richard Vance (Admin)',
    role: 'admin',
    phone: '+1 (555) 000-1111'
  },
  teacher: {
    uid: 'teacher_smith',
    email: 'teacher.smith@college.edu',
    name: 'Prof. Alan Smith',
    role: 'teacher',
    teacherId: 'TCH-2001',
    stream: 'Computer Science',
    phone: '+1 (555) 901-2345'
  },
  student: {
    uid: 'student_john',
    email: 'student.john@college.edu',
    name: 'John Doe',
    role: 'student',
    admissionId: 'STU-1001',
    class: 'B.Tech CSE - 3rd Year',
    stream: 'Computer Science',
    phone: '+1 (555) 234-5678'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('college_erp_active_user');
    return saved ? JSON.parse(saved) : DEMO_USERS.admin;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [allStudents, setAllStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [allTeachers, setAllTeachers] = useState<TeacherRecord[]>(INITIAL_TEACHERS);
  const [rtdbConnected, setRtdbConnected] = useState<boolean>(true);

  // Sync Students in Realtime from RTDB
  useEffect(() => {
    const unsub = subscribeToPath<Record<string, StudentRecord>>('students', (data) => {
      if (data) {
        setAllStudents(Object.values(data));
        setRtdbConnected(true);
      } else {
        // Fallback to initial local list if db is empty
        setAllStudents(INITIAL_STUDENTS);
      }
    });
    return () => unsub();
  }, []);

  // Sync Teachers in Realtime from RTDB
  useEffect(() => {
    const unsub = subscribeToPath<Record<string, TeacherRecord>>('teachers', (data) => {
      if (data) {
        setAllTeachers(Object.values(data));
        setRtdbConnected(true);
      } else {
        setAllTeachers(INITIAL_TEACHERS);
      }
    });
    return () => unsub();
  }, []);

  // Check if RTDB is empty on start, if so auto-seed
  useEffect(() => {
    const checkAndSeed = async () => {
      const studentsInDb = await getDataOnce('students');
      if (!studentsInDb) {
        console.log('RTDB appears unpopulated. Running initial seed...');
        await seedDatabase();
      }
    };
    checkAndSeed();
  }, []);

  const loginAsRole = (role: UserRole, customEmail?: string) => {
    let targetUser: UserProfile = DEMO_USERS[role];
    
    if (customEmail) {
      if (role === 'student') {
        const matched = allStudents.find(s => s.email.toLowerCase() === customEmail.toLowerCase());
        if (matched) {
          targetUser = {
            uid: `stu_${matched.id}`,
            email: matched.email,
            name: matched.name,
            role: 'student',
            admissionId: matched.id,
            class: matched.class,
            stream: matched.stream,
            phone: matched.phone
          };
        }
      } else if (role === 'teacher') {
        const matched = allTeachers.find(t => t.email.toLowerCase() === customEmail.toLowerCase());
        if (matched) {
          targetUser = {
            uid: `tch_${matched.id}`,
            email: matched.email,
            name: matched.name,
            role: 'teacher',
            teacherId: matched.id,
            stream: matched.department,
            phone: matched.phone
          };
        }
      }
    }

    setUser(targetUser);
    localStorage.setItem('college_erp_active_user', JSON.stringify(targetUser));
  };

  const loginWithEmailPassword = async (email: string, role: UserRole): Promise<boolean> => {
    setLoading(true);
    try {
      // Direct credential lookup from RTDB or seeded profiles
      loginAsRole(role, email);
      setLoading(false);
      return true;
    } catch (e) {
      console.error('Login error', e);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('college_erp_active_user');
  };

  const triggerSeed = async () => {
    setLoading(true);
    const success = await seedDatabase();
    setLoading(false);
    return success;
  };

  // Derive active student / teacher record if applicable
  const activeStudent = user?.role === 'student'
    ? allStudents.find(s => s.email.toLowerCase() === user.email.toLowerCase() || s.admissionId === user.admissionId) || INITIAL_STUDENTS[0]
    : null;

  const activeTeacher = user?.role === 'teacher'
    ? allTeachers.find(t => t.email.toLowerCase() === user.email.toLowerCase() || t.teacherId === user.teacherId) || INITIAL_TEACHERS[0]
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        loading,
        activeStudent,
        activeTeacher,
        allStudents,
        allTeachers,
        rtdbConnected,
        loginAsRole,
        loginWithEmailPassword,
        logout,
        triggerSeed
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
