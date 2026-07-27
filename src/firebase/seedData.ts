import { StudentRecord, TeacherRecord, Exam, Announcement, AttendanceRecord, ExamMark, FeePayment } from '../types';
import { updateData, writeData } from './db';

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 'STU-1001',
    admissionId: 'STU-1001',
    name: 'John Doe',
    email: 'student.john@college.edu',
    stream: 'Computer Science',
    class: 'B.Tech CSE - 3rd Year',
    phone: '+1 (555) 234-5678',
    parentName: 'Robert Doe',
    parentPhone: '+1 (555) 888-1212',
    feeStatus: 'Paid',
    feeAmount: 4500,
    paidAmount: 4500,
    dueDate: '2026-08-15',
    joiningYear: 2023,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'STU-1002',
    admissionId: 'STU-1002',
    name: 'Emily Watson',
    email: 'emily.watson@college.edu',
    stream: 'Computer Science',
    class: 'B.Tech CSE - 3rd Year',
    phone: '+1 (555) 345-6789',
    parentName: 'David Watson',
    parentPhone: '+1 (555) 888-2323',
    feeStatus: 'Pending',
    feeAmount: 4500,
    paidAmount: 2000,
    dueDate: '2026-08-15',
    joiningYear: 2023,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'STU-1003',
    admissionId: 'STU-1003',
    name: 'Michael Chang',
    email: 'michael.chang@college.edu',
    stream: 'Electronics',
    class: 'B.Tech ECE - 2nd Year',
    phone: '+1 (555) 456-7890',
    parentName: 'Ken Chang',
    parentPhone: '+1 (555) 888-3434',
    feeStatus: 'Paid',
    feeAmount: 4200,
    paidAmount: 4200,
    dueDate: '2026-08-20',
    joiningYear: 2024,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'STU-1004',
    admissionId: 'STU-1004',
    name: 'Sophia Patel',
    email: 'sophia.patel@college.edu',
    stream: 'Computer Science',
    class: 'B.Tech CSE - 3rd Year',
    phone: '+1 (555) 567-8901',
    parentName: 'Sanjay Patel',
    parentPhone: '+1 (555) 888-4545',
    feeStatus: 'Pending',
    feeAmount: 4500,
    paidAmount: 0,
    dueDate: '2026-08-15',
    joiningYear: 2023,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'STU-1005',
    admissionId: 'STU-1005',
    name: 'Alex Rivera',
    email: 'alex.rivera@college.edu',
    stream: 'Mechanical',
    class: 'B.Tech ME - 4th Year',
    phone: '+1 (555) 678-9012',
    parentName: 'Carlos Rivera',
    parentPhone: '+1 (555) 888-5656',
    feeStatus: 'Paid',
    feeAmount: 4800,
    paidAmount: 4800,
    dueDate: '2026-08-10',
    joiningYear: 2022,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'STU-1006',
    admissionId: 'STU-1006',
    name: 'Samantha Vance',
    email: 'samantha.vance@college.edu',
    stream: 'Business Admin',
    class: 'MBA - 1st Year',
    phone: '+1 (555) 789-0123',
    parentName: 'Greg Vance',
    parentPhone: '+1 (555) 888-6767',
    feeStatus: 'Pending',
    feeAmount: 5000,
    paidAmount: 2500,
    dueDate: '2026-08-30',
    joiningYear: 2025,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250'
  }
];

export const INITIAL_TEACHERS: TeacherRecord[] = [
  {
    id: 'TCH-2001',
    teacherId: 'TCH-2001',
    name: 'Prof. Alan Smith',
    email: 'teacher.smith@college.edu',
    subject: 'Data Structures & Algorithms',
    phone: '+1 (555) 901-2345',
    department: 'Computer Science',
    assignedClasses: ['B.Tech CSE - 3rd Year', 'B.Tech CSE - 2nd Year'],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH-2002',
    teacherId: 'TCH-2002',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@college.edu',
    subject: 'Digital Signal Processing',
    phone: '+1 (555) 012-3456',
    department: 'Electronics',
    assignedClasses: ['B.Tech ECE - 2nd Year'],
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'TCH-2003',
    teacherId: 'TCH-2003',
    name: 'Prof. Robert Miller',
    email: 'robert.miller@college.edu',
    subject: 'Thermodynamics & Fluid Mechanics',
    phone: '+1 (555) 123-4567',
    department: 'Mechanical',
    assignedClasses: ['B.Tech ME - 4th Year'],
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250'
  }
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'EXAM-3001',
    title: 'Mid-Term Examination 2026',
    stream: 'Computer Science',
    classId: 'B.Tech CSE - 3rd Year',
    subject: 'Data Structures & Algorithms',
    examDate: '2026-07-15',
    maxMarks: 100,
    createdBy: 'TCH-2001'
  },
  {
    id: 'EXAM-3002',
    title: 'End-Sem Theory Exam',
    stream: 'Electronics',
    classId: 'B.Tech ECE - 2nd Year',
    subject: 'Digital Signal Processing',
    examDate: '2026-07-20',
    maxMarks: 100,
    createdBy: 'TCH-2002'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ANN-4001',
    title: 'Mid-Semester Examination Schedule Released',
    content: 'The detailed timetable for Mid-Semester examinations is now available. Students are requested to clear all pending fees before July 30th.',
    targetRole: 'All',
    date: '2026-07-24',
    author: 'Dean of Academics',
    important: true
  },
  {
    id: 'ANN-4002',
    title: 'Faculty Progress Review Meeting',
    content: 'All HODs and teaching faculty members are invited to attend the quarterly academic progress review on Friday at 3:00 PM in Seminar Hall B.',
    targetRole: 'Teacher',
    date: '2026-07-25',
    author: 'Principal Office',
    important: false
  },
  {
    id: 'ANN-4003',
    title: 'Campus Hackathon 2026 - Registration Open',
    content: 'Annual 36-hour Hackathon registrations are open for all CSE, ECE, and IT students. Cash prizes up to $5,000!',
    targetRole: 'Student',
    date: '2026-07-26',
    author: 'Tech Club Committee',
    important: false
  }
];

export const INITIAL_MARKS: Record<string, ExamMark[]> = {
  'EXAM-3001': [
    {
      examId: 'EXAM-3001',
      studentId: 'STU-1001',
      studentName: 'John Doe',
      admissionId: 'STU-1001',
      marksObtained: 92,
      maxMarks: 100,
      grade: 'A+',
      remarks: 'Excellent problem solving skills in trees & graphs',
      updatedBy: 'Prof. Alan Smith',
      updatedAt: Date.now() - 86400000 * 2
    },
    {
      examId: 'EXAM-3001',
      studentId: 'STU-1002',
      studentName: 'Emily Watson',
      admissionId: 'STU-1002',
      marksObtained: 84,
      maxMarks: 100,
      grade: 'A',
      remarks: 'Good grasp of dynamic programming',
      updatedBy: 'Prof. Alan Smith',
      updatedAt: Date.now() - 86400000 * 2
    },
    {
      examId: 'EXAM-3001',
      studentId: 'STU-1004',
      studentName: 'Sophia Patel',
      admissionId: 'STU-1004',
      marksObtained: 78,
      maxMarks: 100,
      grade: 'B+',
      remarks: 'Solid code syntax, practice time complexity',
      updatedBy: 'Prof. Alan Smith',
      updatedAt: Date.now() - 86400000 * 2
    }
  ]
};

export const INITIAL_PAYMENTS: FeePayment[] = [
  {
    id: 'PAY-8001',
    studentId: 'STU-1001',
    studentName: 'John Doe',
    admissionId: 'STU-1001',
    amount: 4500,
    date: '2026-07-01',
    paymentMethod: 'Online Banking (UPI)',
    status: 'Completed',
    receiptNo: 'REC-2026-0711',
    remarks: 'Full Semester Fee Payment'
  },
  {
    id: 'PAY-8002',
    studentId: 'STU-1002',
    studentName: 'Emily Watson',
    admissionId: 'STU-1002',
    amount: 2000,
    date: '2026-07-10',
    paymentMethod: 'Credit Card',
    status: 'Completed',
    receiptNo: 'REC-2026-0712',
    remarks: 'Part payment - Installment 1'
  }
];

export const seedDatabase = async (): Promise<boolean> => {
  try {
    const updates: Record<string, any> = {};

    // Students
    INITIAL_STUDENTS.forEach(stu => {
      updates[`students/${stu.id}`] = stu;
    });

    // Teachers
    INITIAL_TEACHERS.forEach(tch => {
      updates[`teachers/${tch.id}`] = tch;
    });

    // Exams
    INITIAL_EXAMS.forEach(ex => {
      updates[`exams/${ex.id}`] = ex;
    });

    // Announcements
    INITIAL_ANNOUNCEMENTS.forEach(ann => {
      updates[`announcements/${ann.id}`] = ann;
    });

    // Fee Payments
    INITIAL_PAYMENTS.forEach(pay => {
      updates[`feePayments/${pay.id}`] = pay;
    });

    // Marks for EXAM-3001
    INITIAL_MARKS['EXAM-3001'].forEach(m => {
      updates[`marks/EXAM-3001/${m.studentId}`] = m;
    });

    // Attendance sample for B.Tech CSE - 3rd Year today
    const todayStr = new Date().toISOString().split('T')[0];
    const classSanitized = 'B_Tech_CSE___3rd_Year';
    
    const attendanceRecords: AttendanceRecord[] = [
      {
        studentId: 'STU-1001',
        studentName: 'John Doe',
        admissionId: 'STU-1001',
        classId: 'B.Tech CSE - 3rd Year',
        date: todayStr,
        status: 'Present',
        markedBy: 'TCH-2001',
        markedByName: 'Prof. Alan Smith',
        timestamp: Date.now()
      },
      {
        studentId: 'STU-1002',
        studentName: 'Emily Watson',
        admissionId: 'STU-1002',
        classId: 'B.Tech CSE - 3rd Year',
        date: todayStr,
        status: 'Present',
        markedBy: 'TCH-2001',
        markedByName: 'Prof. Alan Smith',
        timestamp: Date.now()
      },
      {
        studentId: 'STU-1004',
        studentName: 'Sophia Patel',
        admissionId: 'STU-1004',
        classId: 'B.Tech CSE - 3rd Year',
        date: todayStr,
        status: 'Absent',
        markedBy: 'TCH-2001',
        markedByName: 'Prof. Alan Smith',
        timestamp: Date.now()
      }
    ];

    attendanceRecords.forEach(att => {
      updates[`attendance/${classSanitized}/${todayStr}/${att.studentId}`] = att;
    });

    // Add demo user accounts in DB
    updates['users/admin_user'] = {
      uid: 'admin_user',
      email: 'admin@college.edu',
      name: 'Dr. Richard Vance (Admin)',
      role: 'admin',
      phone: '+1 (555) 000-1111'
    };

    updates['users/teacher_smith'] = {
      uid: 'teacher_smith',
      email: 'teacher.smith@college.edu',
      name: 'Prof. Alan Smith',
      role: 'teacher',
      teacherId: 'TCH-2001',
      stream: 'Computer Science',
      phone: '+1 (555) 901-2345'
    };

    updates['users/student_john'] = {
      uid: 'student_john',
      email: 'student.john@college.edu',
      name: 'John Doe',
      role: 'student',
      admissionId: 'STU-1001',
      class: 'B.Tech CSE - 3rd Year',
      stream: 'Computer Science',
      phone: '+1 (555) 234-5678'
    };

    await updateData('', updates);
    console.log('Database successfully seeded with college ERP sample data');
    return true;
  } catch (error) {
    console.error('Failed to seed database:', error);
    return false;
  }
};
