import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentRecord } from '../../types';
import { saveStudent, deleteStudent } from '../../firebase/db';
import {
  Users,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Check
} from 'lucide-react';

export const StudentManager: React.FC = () => {
  const { allStudents } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStream, setSelectedStream] = useState('All');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<StudentRecord | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<StudentRecord>>({
    admissionId: '',
    name: '',
    email: '',
    stream: 'Computer Science',
    class: 'B.Tech CSE - 3rd Year',
    phone: '',
    parentName: '',
    parentPhone: '',
    feeAmount: 4500,
    paidAmount: 4500,
    feeStatus: 'Paid',
    dueDate: '2026-08-15'
  });

  const [saving, setSaving] = useState(false);

  // Filter logic
  const filteredStudents = allStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStream = selectedStream === 'All' || student.stream === selectedStream;
    const matchesFee = selectedFeeStatus === 'All' || student.feeStatus === selectedFeeStatus;

    return matchesSearch && matchesStream && matchesFee;
  });

  const handleOpenAddModal = () => {
    const nextId = `STU-${1000 + allStudents.length + 1}`;
    setFormData({
      admissionId: nextId,
      name: '',
      email: '',
      stream: 'Computer Science',
      class: 'B.Tech CSE - 3rd Year',
      phone: '',
      parentName: '',
      parentPhone: '',
      feeAmount: 4500,
      paidAmount: 4500,
      feeStatus: 'Paid',
      dueDate: '2026-08-15'
    });
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (student: StudentRecord) => {
    setEditingStudent(student);
    setFormData(student);
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.admissionId || !formData.email) {
      alert('Please fill in required fields (Name, Admission ID, Email)');
      return;
    }

    setSaving(true);
    const newStudent: StudentRecord = {
      id: formData.admissionId || `STU-${Date.now().toString().slice(-4)}`,
      admissionId: formData.admissionId!,
      name: formData.name!,
      email: formData.email!,
      stream: formData.stream || 'Computer Science',
      class: formData.class || 'B.Tech CSE - 3rd Year',
      phone: formData.phone || '+1 (555) 000-0000',
      parentName: formData.parentName || '',
      parentPhone: formData.parentPhone || '',
      feeAmount: Number(formData.feeAmount) || 4500,
      paidAmount: Number(formData.paidAmount) || 0,
      feeStatus: (Number(formData.paidAmount) >= Number(formData.feeAmount)) ? 'Paid' : 'Pending',
      dueDate: formData.dueDate || '2026-08-15',
      joiningYear: formData.joiningYear || 2024,
      avatarUrl: formData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
    };

    const success = await saveStudent(newStudent);
    setSaving(false);

    if (success) {
      setIsAddModalOpen(false);
    } else {
      alert('Failed to save student record to Firebase Realtime Database');
    }
  };

  const handleDeleteStudent = async (studentId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete student record for "${name}"?`)) {
      const ok = await deleteStudent(studentId);
      if (!ok) {
        alert('Failed to delete student record from Firebase Realtime Database');
      }
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Manage Student Records</span>
          </h1>
          <p className="text-xs text-slate-500">
            Realtime database directory of enrolled students across all streams and classes.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by student name, admission ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Stream Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedStream}
            onChange={(e) => setSelectedStream(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="All">All Streams</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Business Admin">Business Admin</option>
          </select>
        </div>

        {/* Fee Filter */}
        <div>
          <select
            value={selectedFeeStatus}
            onChange={(e) => setSelectedFeeStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="All">All Fee Status</option>
            <option value="Paid">Fee Paid</option>
            <option value="Pending">Fee Pending</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Student Info</th>
                <th className="py-3.5 px-4">Admission ID</th>
                <th className="py-3.5 px-4">Stream & Class</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Fee Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    No student records matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-[11px] text-slate-500">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Admission ID */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {student.admissionId}
                    </td>

                    {/* Stream & Class */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{student.stream}</div>
                      <div className="text-[11px] text-slate-500">{student.class}</div>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 text-slate-600">
                      {student.phone}
                    </td>

                    {/* Fee Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          student.feeStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {student.feeStatus === 'Paid' ? (
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{student.feeStatus} (${student.paidAmount}/${student.feeAmount})</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => setViewingStudent(student)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Student"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteStudent(student.id, student.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden my-8">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingStudent ? 'Edit Student Record' : 'Add New Student'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admission ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.admissionId || ''}
                    onChange={(e) => setFormData({ ...formData, admissionId: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="e.g. STU-1008"
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
                    placeholder="e.g. Alex Johnson"
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
                  placeholder="e.g. alex.johnson@college.edu"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stream / Department</label>
                  <select
                    value={formData.stream || 'Computer Science'}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Business Admin">Business Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class / Year</label>
                  <input
                    type="text"
                    value={formData.class || 'B.Tech CSE - 3rd Year'}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="e.g. B.Tech CSE - 3rd Year"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block font-semibold text-slate-700 mb-1">Parent Name</label>
                  <input
                    type="text"
                    value={formData.parentName || ''}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="e.g. Mark Johnson"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Fee Amount ($)</label>
                  <input
                    type="number"
                    value={formData.feeAmount || 4500}
                    onChange={(e) => setFormData({ ...formData, feeAmount: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Paid Amount ($)</label>
                  <input
                    type="number"
                    value={formData.paidAmount || 0}
                    onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving to Firebase...' : 'Save Student'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* View Student Profile Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-indigo-900 text-white p-6 relative">
              <button
                onClick={() => setViewingStudent(null)}
                className="absolute top-4 right-4 text-indigo-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/30 border-2 border-indigo-300 flex items-center justify-center font-bold text-xl text-white">
                  {viewingStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{viewingStudent.name}</h3>
                  <p className="text-xs text-indigo-200 font-mono">ID: {viewingStudent.admissionId}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Stream</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{viewingStudent.stream}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Class</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{viewingStudent.class}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{viewingStudent.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{viewingStudent.phone}</span>
                </div>
                {viewingStudent.parentName && (
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Parent: {viewingStudent.parentName} ({viewingStudent.parentPhone})</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Fee Requirement</span>
                  <span>${viewingStudent.paidAmount} / ${viewingStudent.feeAmount}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (viewingStudent.paidAmount / (viewingStudent.feeAmount || 1)) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-slate-500 text-right mt-1">
                  Status: <span className="font-semibold text-slate-800">{viewingStudent.feeStatus}</span>
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
