import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentRecord, FeePayment } from '../../types';
import { saveFeePayment, subscribeToPath } from '../../firebase/db';
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  FileText,
  X,
  Receipt,
  Download,
  Printer
} from 'lucide-react';

export const FeeManager: React.FC = () => {
  const { allStudents } = useAuth();
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [feeFilter, setFeeFilter] = useState<'All' | 'Paid' | 'Pending'>('All');

  // Modal States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(2000);
  const [paymentMethod, setPaymentMethod] = useState('Online Banking (UPI)');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  // Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<FeePayment | null>(null);

  useEffect(() => {
    const unsub = subscribeToPath<Record<string, FeePayment>>('feePayments', (data) => {
      if (data) {
        setPayments(Object.values(data));
      }
    });
    return () => unsub();
  }, []);

  // Compute overall financial metrics
  const totalCollected = allStudents.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const totalExpected = allStudents.reduce((sum, s) => sum + (s.feeAmount || 0), 0);
  const totalPending = Math.max(0, totalExpected - totalCollected);

  const filteredStudents = allStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = feeFilter === 'All' || s.feeStatus === feeFilter;

    return matchesSearch && matchesFilter;
  });

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('Please select a student');
      return;
    }

    const student = allStudents.find((s) => s.id === selectedStudentId);
    if (!student) return;

    setSaving(true);
    const newPayment: FeePayment = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      studentId: student.id,
      studentName: student.name,
      admissionId: student.admissionId,
      amount: Number(paymentAmount),
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      status: 'Completed',
      receiptNo: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      remarks: remarks || 'Tuition Fee Payment'
    };

    const ok = await saveFeePayment(newPayment);
    setSaving(false);

    if (ok) {
      setIsRecordModalOpen(false);
      setActiveReceipt(newPayment);
    } else {
      alert('Failed to record payment in Firebase Realtime Database');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            <span>Financial & Fee Management</span>
          </h1>
          <p className="text-xs text-slate-500">
            Track student tuition fee status, record new payments, and view transaction history.
          </p>
        </div>

        <button
          onClick={() => {
            if (allStudents.length > 0) {
              setSelectedStudentId(allStudents[0].id);
              setPaymentAmount(allStudents[0].feeAmount - allStudents[0].paidAmount || 1000);
            }
            setIsRecordModalOpen(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Fee Payment</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expected Revenue</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">${totalExpected.toLocaleString()}</div>
          <p className="text-xs text-slate-400 mt-0.5">Annual student fee quota</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200 bg-emerald-50/30 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Total Collected</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">${totalCollected.toLocaleString()}</div>
          <p className="text-xs text-emerald-600 mt-0.5">
            {Math.round((totalCollected / (totalExpected || 1)) * 100)}% Collection Rate
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-rose-200 bg-rose-50/30 shadow-2xs">
          <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Pending Balance</span>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">${totalPending.toLocaleString()}</div>
          <p className="text-xs text-rose-600 mt-0.5">
            {allStudents.filter((s) => s.feeStatus === 'Pending').length} students pending
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search student by name or admission ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={feeFilter}
            onChange={(e) => setFeeFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="All">All Fee Status</option>
            <option value="Paid">Fully Paid</option>
            <option value="Pending">Pending Payment</option>
          </select>
        </div>
      </div>

      {/* Student Fee Status Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
          Student Fee Collection Roster
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Total Fee</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.map((student) => {
                const balance = Math.max(0, student.feeAmount - student.paidAmount);
                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{student.admissionId}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">{student.class}</td>

                    <td className="py-3 px-4 font-semibold text-slate-800">${student.feeAmount}</td>

                    <td className="py-3 px-4 font-semibold text-emerald-700">${student.paidAmount}</td>

                    <td className="py-3 px-4 font-semibold text-rose-600">${balance}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
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
                        <span>{student.feeStatus}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedStudentId(student.id);
                          setPaymentAmount(balance > 0 ? balance : 500);
                          setIsRecordModalOpen(true);
                        }}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Record Payment
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <span>Record Fee Payment</span>
              </h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    const stu = allStudents.find((s) => s.id === e.target.value);
                    if (stu) {
                      const bal = Math.max(0, stu.feeAmount - stu.paidAmount);
                      setPaymentAmount(bal > 0 ? bal : 500);
                    }
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {allStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admissionId}) - Balance: ${Math.max(0, s.feeAmount - s.paidAmount)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Amount ($) *</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="Online Banking (UPI)">Online Banking (UPI / NetBanking)</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="Cash at Accounts Desk">Cash at Accounts Desk</option>
                  <option value="Demand Draft / Cheque">Demand Draft / Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks / Note</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="e.g. Semester 2 installment"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving Payment...' : 'Generate Receipt & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Official Fee Receipt</h3>
                <p className="text-xs text-slate-400 font-mono">{activeReceipt.receiptNo}</p>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-800">
              <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="font-extrabold text-base text-indigo-900 dark:text-indigo-400">NH College</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Owned by NH Education Foundation • www.nhcollege.edu</div>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-300 font-semibold mt-0.5">Accounts & Financial Services</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-bold">{activeReceipt.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Admission ID:</span>
                  <span className="font-mono">{activeReceipt.admissionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date Paid:</span>
                  <span>{activeReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span>{activeReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">Amount Received</span>
                  <span className="text-2xl font-extrabold text-emerald-700">${activeReceipt.amount}</span>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-full text-xs">
                  PAID
                </span>
              </div>

              <p className="text-[11px] text-slate-400 text-center italic">
                This is an electronically verified fee payment receipt stored in Realtime Database.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold flex items-center space-x-1"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
