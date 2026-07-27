import React, { useState, useEffect } from 'react';
import { SubjectRecord, TeacherRecord } from '../../types';
import { subscribeToPath, saveSubject, deleteSubject } from '../../firebase/db';
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Filter,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Building,
  UserCheck
} from 'lucide-react';

const DEFAULT_SUBJECTS: SubjectRecord[] = [
  {
    id: 'SUB-101',
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    department: 'Computer Science',
    credits: 4,
    type: 'Theory',
    assignedTeacher: 'Prof. Alan Smith',
    semester: 'Semester 3'
  },
  {
    id: 'SUB-102',
    code: 'CS302',
    name: 'Database Management Systems',
    department: 'Computer Science',
    credits: 4,
    type: 'Theory',
    assignedTeacher: 'Dr. Sarah Connor',
    semester: 'Semester 4'
  },
  {
    id: 'SUB-103',
    code: 'EC201',
    name: 'Digital Circuits & Microprocessors',
    department: 'Electronics',
    credits: 4,
    type: 'Theory',
    assignedTeacher: 'Dr. Sarah Connor',
    semester: 'Semester 3'
  },
  {
    id: 'SUB-104',
    code: 'ME105',
    name: 'Thermodynamics & Fluid Dynamics',
    department: 'Mechanical',
    credits: 3,
    type: 'Theory',
    assignedTeacher: 'Prof. Robert Bruce',
    semester: 'Semester 2'
  },
  {
    id: 'SUB-105',
    code: 'CS303L',
    name: 'Advanced Web Development Lab',
    department: 'Computer Science',
    credits: 2,
    type: 'Practical',
    assignedTeacher: 'Prof. Alan Smith',
    semester: 'Semester 5'
  }
];

export const SubjectManager: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New subject state
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    department: string;
    credits: number;
    type: 'Theory' | 'Practical' | 'Elective';
    assignedTeacher: string;
    semester: string;
  }>({
    code: '',
    name: '',
    department: 'Computer Science',
    credits: 3,
    type: 'Theory',
    assignedTeacher: '',
    semester: 'Semester 1'
  });

  // Realtime DB subscription for subjects
  useEffect(() => {
    const unsubSubjects = subscribeToPath<Record<string, SubjectRecord>>('subjects', (data) => {
      if (data) {
        setSubjects(Object.values(data));
      } else {
        // Seed default subjects if DB is empty
        DEFAULT_SUBJECTS.forEach((sub) => {
          saveSubject(sub);
        });
        setSubjects(DEFAULT_SUBJECTS);
      }
    });

    const unsubTeachers = subscribeToPath<Record<string, TeacherRecord>>('teachers', (data) => {
      if (data) {
        setTeachers(Object.values(data));
      }
    });

    return () => {
      unsubSubjects();
      unsubTeachers();
    };
  }, []);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      setStatusMessage({ type: 'error', text: 'Please fill in Subject Code and Name' });
      return;
    }

    const newSubject: SubjectRecord = {
      id: `SUB-${Date.now().toString().slice(-5)}`,
      code: formData.code.toUpperCase().trim(),
      name: formData.name.trim(),
      department: formData.department,
      credits: Number(formData.credits) || 3,
      type: formData.type,
      assignedTeacher: formData.assignedTeacher || 'Unassigned',
      semester: formData.semester
    };

    const success = await saveSubject(newSubject);
    if (success) {
      setStatusMessage({ type: 'success', text: `Subject "${newSubject.name}" added successfully!` });
      setIsModalOpen(false);
      setFormData({
        code: '',
        name: '',
        department: 'Computer Science',
        credits: 3,
        type: 'Theory',
        assignedTeacher: '',
        semester: 'Semester 1'
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({ type: 'error', text: 'Failed to add subject to database.' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete subject "${name}"?`)) {
      const ok = await deleteSubject(id);
      if (ok) {
        setStatusMessage({ type: 'success', text: `Subject "${name}" deleted.` });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    }
  };

  const filteredSubjects = subjects.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.assignedTeacher && sub.assignedTeacher.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = selectedDepartment === 'All' || sub.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const departments = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Business'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-100 text-sm font-medium mb-1">
            <Building className="w-4 h-4 text-indigo-200" />
            <span>NH College Academic Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Subject & Curriculum Manager</h1>
          <p className="text-indigo-100 text-sm mt-1">
            Configure academic courses, credit weightings, theory/lab types, and faculty assignments.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-5 py-3 rounded-xl shadow-md transition-all text-sm shrink-0"
        >
          <Plus className="w-5 h-5 text-indigo-700" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search code, name, teacher..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Stream:</span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                selectedDepartment === dept
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects Grid/Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100">
              Active Curriculum Subjects ({filteredSubjects.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">NH College Syllabus 2026</span>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-base font-semibold">No subjects match your query</p>
            <p className="text-xs">Try clearing search filters or add a new subject.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Subject Code</th>
                  <th className="py-3.5 px-6">Subject Title</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Semester</th>
                  <th className="py-3.5 px-6">Credits & Type</th>
                  <th className="py-3.5 px-6">Assigned Faculty</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {subject.code}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-100">
                      {subject.name}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {subject.department}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium text-xs">
                      {subject.semester || 'Semester 1'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{subject.credits} Credits</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            subject.type === 'Practical'
                              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                              : subject.type === 'Elective'
                              ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300'
                              : 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
                          }`}
                        >
                          {subject.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-200 text-xs font-medium">
                      <div className="flex items-center space-x-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{subject.assignedTeacher || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(subject.id, subject.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 mb-5">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Add New Subject - NH College</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS301"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={`Semester ${s}`}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Title / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems & Kernel Design"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department / Stream
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'Theory' | 'Practical' | 'Elective'
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical Lab</option>
                    <option value="Elective">Elective</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Faculty Teacher
                  </label>
                  <select
                    value={formData.assignedTeacher}
                    onChange={(e) => setFormData({ ...formData, assignedTeacher: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {teachers.length > 0 ? (
                      teachers.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} ({t.department})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Prof. Alan Smith">Prof. Alan Smith</option>
                        <option value="Dr. Sarah Connor">Dr. Sarah Connor</option>
                        <option value="Prof. Robert Bruce">Prof. Robert Bruce</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
