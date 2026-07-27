export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  admissionId?: string;
  teacherId?: string;
  stream?: string;
  class?: string;
  phone?: string;
  createdAt?: number;
}

export interface StudentRecord {
  id: string; // usually admissionId or auto key
  admissionId: string;
  name: string;
  email: string;
  stream: string; // e.g., 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Business'
  class: string; // e.g., 'B.Tech CSE - 3rd Year', 'B.Tech ECE - 2nd Year'
  phone: string;
  parentName?: string;
  parentPhone?: string;
  feeStatus: 'Paid' | 'Pending';
  feeAmount: number;
  paidAmount: number;
  dueDate: string;
  joiningYear?: number;
  avatarUrl?: string;
}

export interface TeacherRecord {
  id: string; // usually teacherId or auto key
  teacherId: string;
  name: string;
  email: string;
  subject: string;
  phone: string;
  assignedClasses: string[]; // e.g., ['B.Tech CSE - 3rd Year', 'B.Tech CSE - 2nd Year']
  department: string;
  joiningDate?: string;
  avatarUrl?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  studentName: string;
  admissionId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: string;
  markedByName: string;
  timestamp: number;
}

export interface Exam {
  id: string;
  title: string; // e.g. "Mid-Term Examination 2026"
  stream: string;
  classId: string;
  subject: string;
  examDate: string;
  maxMarks: number;
  createdBy: string;
}

export interface ExamMark {
  id?: string;
  examId: string;
  studentId: string;
  studentName: string;
  admissionId: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks?: string;
  updatedBy: string;
  updatedAt: number;
}

export interface FeePayment {
  id: string;
  studentId: string;
  studentName: string;
  admissionId: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: 'Completed' | 'Pending' | 'Failed';
  receiptNo: string;
  remarks?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: 'All' | 'Teacher' | 'Student';
  date: string;
  author: string;
  important?: boolean;
}

export interface SubjectRecord {
  id: string;
  code: string; // e.g. "CS301"
  name: string; // e.g. "Data Structures & Algorithms"
  department: string; // e.g. "Computer Science"
  credits: number; // e.g. 4
  type: 'Theory' | 'Practical' | 'Elective';
  assignedTeacher?: string; // e.g. "Prof. Alan Smith"
  semester?: string; // e.g. "Semester 5"
}

export interface CollegeReview {
  id: string;
  authorName: string;
  role: 'Student' | 'Teacher' | 'Alumni' | 'Parent';
  department: string;
  overallRating: number; // 1-5
  academicsRating: number; // 1-5
  facultyRating: number; // 1-5
  infrastructureRating: number; // 1-5
  placementsRating: number; // 1-5
  comment: string;
  date: string;
  verified?: boolean;
}

export interface FinalCertificateRecord {
  id: string;
  studentId: string;
  admissionId: string;
  studentName: string;
  degreeName: string; // e.g., "Bachelor of Technology in Computer Science & Engineering"
  stream: string;
  completionYear: number;
  cgpa: number;
  grade: string;
  certificateNumber: string; // e.g., "NHC-CERT-2026-8842"
  issueDate: string;
  status: 'Issued' | 'Pending Verification' | 'Eligible for Exam';
  verificationCode: string;
}

export interface BankDepositRecord {
  id: string;
  studentId: string;
  admissionId: string;
  studentName: string;
  depositorEmail?: string;
  depositorPhone?: string;
  depositorRole?: 'Student' | 'Parent / Guardian' | 'Corporate Sponsor' | 'Alumni Donor';
  amount: number;
  bankName: string;
  transactionRef: string;
  depositDate: string;
  paymentMode: 'Direct Bank Transfer' | 'NEFT/RTGS' | 'UPI/QR Deposit' | 'Wire Transfer' | 'Cash Deposit';
  receiptUrl?: string;
  status: 'Verified' | 'Pending Approval' | 'Rejected';
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface TeacherAttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  department: string; // Faculty / Department (e.g. "Faculty of Computer Science & AI")
  date: string; // YYYY-MM-DD
  checkInTime?: string; // e.g. "08:30 AM"
  checkOutTime?: string; // e.g. "04:30 PM"
  status: 'Present' | 'Absent' | 'Late' | 'On Leave' | 'Duty Travel';
  workMode: 'On Campus' | 'Remote / Online' | 'Field Work';
  remarks?: string;
  markedBy: string;
  timestamp: number;
}

