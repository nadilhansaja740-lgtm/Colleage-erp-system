import {
  ref,
  set,
  get,
  onValue,
  push,
  update,
  remove,
  child
} from 'firebase/database';
import { db } from './config';
import {
  StudentRecord,
  TeacherRecord,
  AttendanceRecord,
  Exam,
  ExamMark,
  FeePayment,
  Announcement,
  SubjectRecord,
  TeacherAttendanceRecord
} from '../types';

// Generic helper to listen to a path in Realtime Database
export const subscribeToPath = <T>(path: string, callback: (data: T | null) => void) => {
  const dbRef = ref(db, path);
  const unsubscribe = onValue(
    dbRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    },
    (error) => {
      console.warn(`Realtime Database read error at ${path}:`, error.message);
      // Pass null on error so fallback/local handler can process
      callback(null);
    }
  );
  return unsubscribe;
};

// Generic helper to get data once from path
export const getDataOnce = async <T>(path: string): Promise<T | null> => {
  try {
    const snapshot = await get(child(ref(db), path));
    if (snapshot.exists()) {
      return snapshot.val() as T;
    }
    return null;
  } catch (error) {
    console.warn(`Realtime Database fetch error at ${path}:`, error);
    return null;
  }
};

// Generic helper to write or update path
export const writeData = async (path: string, data: any): Promise<boolean> => {
  try {
    await set(ref(db, path), data);
    return true;
  } catch (error) {
    console.error(`Failed to write data to ${path}:`, error);
    return false;
  }
};

// Generic helper to update fields at path
export const updateData = async (path: string, data: Record<string, any>): Promise<boolean> => {
  try {
    await update(ref(db, path), data);
    return true;
  } catch (error) {
    console.error(`Failed to update data at ${path}:`, error);
    return false;
  }
};

// Generic helper to delete path
export const deleteData = async (path: string): Promise<boolean> => {
  try {
    await remove(ref(db, path));
    return true;
  } catch (error) {
    console.error(`Failed to delete data at ${path}:`, error);
    return false;
  }
};

// Students API
export const saveStudent = async (student: StudentRecord): Promise<boolean> => {
  return await writeData(`students/${student.id}`, student);
};

export const deleteStudent = async (studentId: string): Promise<boolean> => {
  return await deleteData(`students/${studentId}`);
};

// Teachers API
export const saveTeacher = async (teacher: TeacherRecord): Promise<boolean> => {
  return await writeData(`teachers/${teacher.id}`, teacher);
};

export const deleteTeacher = async (teacherId: string): Promise<boolean> => {
  return await deleteData(`teachers/${teacherId}`);
};

// Attendance API
// Path: attendance/{classId_sanitized}/{date}/{studentId}
export const saveAttendanceRecord = async (
  classId: string,
  date: string,
  record: AttendanceRecord
): Promise<boolean> => {
  const sanitizedClass = classId.replace(/[^a-zA-Z0-9]/g, '_');
  const path = `attendance/${sanitizedClass}/${date}/${record.studentId}`;
  return await writeData(path, record);
};

export const saveBulkAttendance = async (
  classId: string,
  date: string,
  records: AttendanceRecord[]
): Promise<boolean> => {
  const sanitizedClass = classId.replace(/[^a-zA-Z0-9]/g, '_');
  const updates: Record<string, any> = {};
  records.forEach((rec) => {
    updates[`attendance/${sanitizedClass}/${date}/${rec.studentId}`] = rec;
  });
  return await updateData('', updates);
};

// Exams & Marks API
export const saveExam = async (exam: Exam): Promise<boolean> => {
  return await writeData(`exams/${exam.id}`, exam);
};

export const saveExamMark = async (mark: ExamMark): Promise<boolean> => {
  return await writeData(`marks/${mark.examId}/${mark.studentId}`, mark);
};

export const saveBulkExamMarks = async (examId: string, marks: ExamMark[]): Promise<boolean> => {
  const updates: Record<string, any> = {};
  marks.forEach((m) => {
    updates[`marks/${examId}/${m.studentId}`] = m;
  });
  return await updateData('', updates);
};

// Fee Payments API
export const saveFeePayment = async (payment: FeePayment): Promise<boolean> => {
  const res = await writeData(`feePayments/${payment.id}`, payment);
  if (res) {
    // Also update student feeStatus if fully paid
    const student = await getDataOnce<StudentRecord>(`students/${payment.studentId}`);
    if (student) {
      const newPaid = (student.paidAmount || 0) + payment.amount;
      const newStatus = newPaid >= student.feeAmount ? 'Paid' : 'Pending';
      await updateData(`students/${payment.studentId}`, {
        paidAmount: newPaid,
        feeStatus: newStatus
      });
    }
  }
  return res;
};

// Announcements API
export const saveAnnouncement = async (announcement: Announcement): Promise<boolean> => {
  return await writeData(`announcements/${announcement.id}`, announcement);
};

export const deleteAnnouncement = async (id: string): Promise<boolean> => {
  return await deleteData(`announcements/${id}`);
};

// Subjects API
export const saveSubject = async (subject: SubjectRecord): Promise<boolean> => {
  return await writeData(`subjects/${subject.id}`, subject);
};

export const deleteSubject = async (id: string): Promise<boolean> => {
  return await deleteData(`subjects/${id}`);
};

// College Ratings & Reviews API
export const saveCollegeReview = async (review: any): Promise<boolean> => {
  return await writeData(`collegeReviews/${review.id}`, review);
};

// Final Certificates API
export const saveFinalCertificate = async (cert: any): Promise<boolean> => {
  return await writeData(`finalCertificates/${cert.id}`, cert);
};

// Bank Deposits API
export const saveBankDeposit = async (deposit: any): Promise<boolean> => {
  return await writeData(`bankDeposits/${deposit.id}`, deposit);
};

export const updateBankDepositStatus = async (id: string, status: 'Verified' | 'Rejected'): Promise<boolean> => {
  return await updateData(`bankDeposits/${id}`, { status });
};

// Teacher Attendance API
export const saveTeacherAttendance = async (record: TeacherAttendanceRecord): Promise<boolean> => {
  return await writeData(`teacherAttendance/${record.date}/${record.teacherId}`, record);
};

export const saveBulkTeacherAttendance = async (date: string, records: TeacherAttendanceRecord[]): Promise<boolean> => {
  const updates: Record<string, any> = {};
  records.forEach((rec) => {
    updates[`teacherAttendance/${date}/${rec.teacherId}`] = rec;
  });
  return await updateData('', updates);
};


