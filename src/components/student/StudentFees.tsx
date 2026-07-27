import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FeePayment } from '../../types';
import { saveFeePayment, subscribeToPath } from '../../firebase/db';
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Receipt,
  Printer,
  X,
  Zap
} from 'lucide-react';

export const StudentFees: React.FC = () => {
  const { activeStudent } = useAuth();
  const studentId = activeStudent?.id || 'STU-1001';

  const [paymentHistory, setPaymentHistory] = useState<FeePayment[]>([]);

  // Online Pay Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(
    Math.max(0, (activeStudent?.feeAmount || 4500) - (activeStudent?.paidAmount || 0))
  );
  const [payMethod, setPayMethod] = useState('Online Banking (UPI)');
  const [paying, setPaying] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<FeePayment | null>(null);

  useEffect(() => {
    const unsub = subscribeToPath<Record<string, FeePayment>>('feePayments', (data) => {
      if (data) {
        const studentPayments = Object.values(data).filter((p) => p.studentId === studentId);
        setPaymentHistory(studentPayments);
      } else {
        setPaymentHistory([
          {
            id: 'PAY-8001',
            studentId,
            studentName: activeStudent?.name || 'John Doe',
            admissionId: activeStudent?.admissionId || 'STU-1001',
            amount: activeStudent?.paidAmount || 4500,
            date: '2026-07-01',
            paymentMethod: 'Online Banking (UPI)',
            status: 'Completed',
            receiptNo: 'REC-2026-0711',
            remarks: 'Semester Fee Payment'
          }
        ]);
      }
    });

    return () => unsub();
  }, [studentId]);

  const totalFee = activeStudent?.feeAmount || 4500;
  const paidAmount = activeStudent?.paidAmount || 0;
  const balanceDue = Math.max(0, totalFee - paidAmount);
  const isPaid = activeStudent?.feeStatus === 'Paid';

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;

    setPaying(true);
    const newPayment: FeePayment = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      studentId,
      studentName: activeStudent?.name || 'John Doe',
      admissionId: activeStudent?.admissionId || 'STU-1001',
      amount: Number(payAmount),
      date: new Date().toISOString().split('T')[0],
      paymentMethod: payMethod,
      status: 'Completed',
      receiptNo: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      remarks: 'Online Student Fee Payment'
    };

    const ok = await saveFeePayment(newPayment);
    setPaying(false);

    if (ok) {
      setIsPayModalOpen(false);
      setActiveReceipt(newPayment);
    } else {
      alert('Failed to process payment in Firebase Realtime Database');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            <span>My Fee Status & Online Payments</span>
          </h1>
          <p className="text-xs text-slate-500">
            View financial ledger, generate payment receipts, and make tuition fee payments.
          </p>
        </div>

        {balanceDue > 0 && (
          <button
            onClick={() => {
              setPayAmount(balanceDue);
              setIsPayModalOpen(true);
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center space-x-2 transition-colors self-start sm:self-auto"
          >
            <Zap className="w-4 h-4" />
            <span>Pay Pending Fee (${balanceDue})</span>
          </button>
        )}
      </div>

      {/* Status Banner */}
      <div
        className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isPaid
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isPaid ? 'bg-emerald-200/60 text-emerald-800' : 'bg-amber-200/60 text-amber-800'
            }`}
          >
            {isPaid ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-base font-bold">
              {isPaid ? 'Tuition Fee Account Cleared' : 'Pending Tuition Fee Balance'}
            </h2>
            <p className="text-xs mt-0.5 opacity-90">
              {isPaid
                ? 'All required fees for the current semester have been received.'
                : `Balance due amount: $${balanceDue}. Please complete payment before deadline.`}
            </p>
          </div>
        </div>

        {!isPaid && (
          <button
            onClick={() => {
              setPayAmount(balanceDue);
              setIsPayModalOpen(true);
            }}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs shrink-0"
          >
            Pay Now
          </button>
        )}
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Course Fee</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">${totalFee}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-emerald-700 font-bold uppercase block">Total Paid</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">${paidAmount}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-rose-700 font-bold uppercase block">Remaining Balance</span>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">${balanceDue}</div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
          Fee Payment Receipt History
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paymentHistory.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">{p.receiptNo}</td>
                  <td className="py-3 px-4 text-slate-700">{p.date}</td>
                  <td className="py-3 px-4 text-slate-600">{p.paymentMethod}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">${p.amount}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveReceipt(p)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Payment Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>Online Fee Payment</span>
              </h3>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-500">Payer: <strong className="text-slate-900">{activeStudent?.name}</strong></div>
                <div className="text-slate-500 mt-1">Admission ID: <span className="font-mono">{activeStudent?.admissionId}</span></div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Amount ($) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={balanceDue > 0 ? balanceDue : 5000}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-extrabold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Payment Gateway</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Online Banking (UPI)">Instant UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {paying ? 'Processing Payment...' : 'Confirm & Pay Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
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
                <div className="text-[10px] text-indigo-600 dark:text-indigo-300 font-semibold mt-0.5">Student Financial Services</div>
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
                  <span className="text-slate-500">Payment Date:</span>
                  <span>{activeReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span>{activeReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">Paid Amount</span>
                  <span className="text-2xl font-extrabold text-emerald-700">${activeReceipt.amount}</span>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-full text-xs">
                  SUCCESS
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl font-semibold flex items-center space-x-1"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold"
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
