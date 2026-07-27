import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TeacherRecord } from '../../types';
import { saveTeacher, deleteTeacher } from '../../firebase/db';
import {
  UserCheck,
  Plus,
  Search,
  BookOpen,
  Trash2,
  Edit,
  X,
  Mail,
  Phone,
  Building,
  Check
} from 'lucide-react';

export const TeacherManager: React.FC = () => {
  const { allTeachers } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<TeacherRecord>>({
    teacherId: '',
    name: '',
    email: '',
    subject: '',
    phone: '',
    department: 'Computer Science',
    assignedClasses: ['B.Tech CSE - 3rd Year']
  });

  const [saving, setSaving] = useState(false);

  const filteredTeachers = allTeachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacherId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'All' || teacher.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const handleOpenAddModal = () => {
    const nextId = `TCH-${2000 + allTeachers.length + 1}`;
    setFormData({
      teacherId: nextId,
      name: '',
      email: '',
      subject: '',
      phone: '',
      department: 'Computer Science',
      assignedClasses: ['B.Tech CSE - 3rd Year']
    });
    setEditingTeacher(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (teacher: TeacherRecord) => {
    setEditingTeacher(teacher);
    setFormData(teacher);
    setIsAddModalOpen(true);
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.teacherId || !formData.email || !formData.subject) {
      alert('Please fill in required fields (Name, Teacher ID, Email, Subject)');
      return;
    }

    setSaving(true);
    const newTeacher: TeacherRecord = {
      id: formData.teacherId || `TCH-${Date.now().toString().slice(-4)}`,
      teacherId: formData.teacherId!,
      name: formData.name!,
      email: formData.email!,
      subject: formData.subject!,
      phone: formData.phone || '+1 (555) 000-0000',
      department: formData.department || 'Computer Science',
      assignedClasses: formData.assignedClasses?.length ? formData.assignedClasses : ['B.Tech CSE - 3rd Year'],
      avatarUrl: formData.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
    };

    const success = await saveTeacher(newTeacher);
    setSaving(false);

    if (success) {
      setIsAddModalOpen(false);
    } else {
      alert('Failed to save teacher record to Firebase Realtime Database');
    }
  };

  const handleDeleteTeacher = async (teacherId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete teacher record for "${name}"?`)) {
      const ok = await deleteTeacher(teacherId);
      if (!ok) {
        alert('Failed to delete teacher record from Firebase Realtime Database');
      }
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            <span>Manage Teacher & Faculty Records</span>
          </h1>
          <p className="text-xs text-slate-500">
            Faculty directory, assigned subject specializations, and assigned classes.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by teacher name, ID, subject, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
        >
          <option value="All">All Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Electronics">Electronics</option>
          <option value="Mechanical">Mechanical</option>
        </select>
      </div>

      {/* Teacher Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((teacher) => (
          <div key={teacher.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 border border-emerald-200">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{teacher.name}</h3>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {teacher.teacherId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEditModal(teacher)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Teacher"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Teacher"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="font-semibold text-slate-800">{teacher.subject}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{teacher.department} Dept</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{teacher.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{teacher.phone}</span>
                </div>
              </div>

              {/* Assigned Classes */}
              <div className="pt-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Assigned Classes
                </span>
                <div className="flex flex-wrap gap-1">
                  {teacher.assignedClasses?.map((cls, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium border border-slate-200">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingTeacher ? 'Edit Teacher Record' : 'Add New Teacher'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teacher ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.teacherId || ''}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="e.g. TCH-2005"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="e.g. Dr. Sarah Connor"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="e.g. sarah.connor@college.edu"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Specialization *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="e.g. Machine Learning & AI"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department || 'Computer Science'}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Classes (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.assignedClasses?.join(', ') || 'B.Tech CSE - 3rd Year'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assignedClasses: e.target.value.split(',').map((s) => s.trim())
                    })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="e.g. B.Tech CSE - 3rd Year, B.Tech CSE - 2nd Year"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Teacher'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
