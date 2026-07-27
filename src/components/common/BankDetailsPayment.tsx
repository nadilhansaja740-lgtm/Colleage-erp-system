import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BankDepositRecord } from '../../types';
import {
  subscribeToPath,
  saveBankDeposit,
  updateBankDepositStatus,
  saveFeePayment
} from '../../firebase/db';
import {
  Building2,
  CreditCard,
  PlusCircle,
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  DollarSign,
  Search,
  Filter,
  KeyRound,
  Lock,
  Smartphone,
  User,
  Mail,
  Phone,
  Eye,
  FileCheck2,
  TrendingUp,
  X
} from 'lucide-react';

const INITIAL_BANK_DEPOSITS: BankDepositRecord[] = [
  {
    id: 'DEP-901',
    studentId: 'STU-1001',
    admissionId: 'STU-1001',
    studentName: 'Aarav Sharma',
    depositorEmail: 'aarav.sharma@nhcollege.edu',
    depositorPhone: '+91 98765 43210',
    depositorRole: 'Student',
    amount: 4500,
    bankName: 'National Heritage Bank',
    transactionRef: 'TXN-NHB-8839201',
    depositDate: '2026-07-22',
    paymentMode: 'Direct Bank Transfer',
    status: 'Verified',
    notes: 'Full tuition fee payment for Semester 5',
    verifiedBy: 'NH College Finance Office',
    verifiedAt: '2026-07-22 14:30'
  },
  {
    id: 'DEP-902',
    studentId: 'STU-1002',
    admissionId: 'STU-1002',
    studentName: 'Priya Patel',
    depositorEmail: 'dev.patel.parent@gmail.com',
    depositorPhone: '+91 98123 77654',
    depositorRole: 'Parent / Guardian',
    amount: 2200,
    bankName: 'State Bank of India',
    transactionRef: 'UPI-9923847102',
    depositDate: '2026-07-25',
    paymentMode: 'UPI/QR Deposit',
    status: 'Pending Approval',
    notes: 'Semester fee deposit via UPI ID nhcollege@upi'
  },
  {
    id: 'DEP-903',
    studentId: 'STU-1003',
    admissionId: 'STU-1003',
    studentName: 'Rohan Verma',
    depositorEmail: 'csr@techcorp-foundation.org',
    depositorPhone: '+91 99001 12233',
    depositorRole: 'Corporate Sponsor',
    amount: 6000,
    bankName: 'HDFC Bank',
    transactionRef: 'NEFT-HDFC-0019283',
    depositDate: '2026-07-26',
    paymentMode: 'NEFT/RTGS',
    status: 'Verified',
    notes: 'Merit Scholarship Sponsor Deposit for NH College',
    verifiedBy: 'NH College Accounts Dept',
    verifiedAt: '2026-07-26 10:15'
  }
];

export const BankDetailsPayment: React.FC = () => {
  const { user, role } = useAuth();
  const [deposits, setDeposits] = useState<BankDepositRecord[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Verified' | 'Pending Approval' | 'Rejected'>('All');

  // Selected depositor modal
  const [selectedDeposit, setSelectedDeposit] = useState<BankDepositRecord | null>(null);

  // Deposit Proof Modal
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [amount, setAmount] = useState('4500');
  const [bankName, setBankName] = useState('National Heritage Bank');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Direct Bank Transfer' | 'NEFT/RTGS' | 'UPI/QR Deposit' | 'Wire Transfer' | 'Cash Deposit'>('Direct Bank Transfer');
  const [depositorName, setDepositorName] = useState(user?.name || 'Aarav Sharma');
  const [depositorEmail, setDepositorEmail] = useState(user?.email || 'student@nhcollege.edu');
  const [depositorPhone, setDepositorPhone] = useState('+91 98765 43210');
  const [depositorRole, setDepositorRole] = useState<'Student' | 'Parent / Guardian' | 'Corporate Sponsor' | 'Alumni Donor'>('Student');
  const [notes, setNotes] = useState('');

  // Interactive OTP Money Transfer Modal
  const [isOtpTransferModalOpen, setIsOtpTransferModalOpen] = useState(false);
  const [transferStep, setTransferStep] = useState<'setup' | 'otp'>('setup');
  const [transferAmount, setTransferAmount] = useState('3500');
  const [transferBank, setTransferBank] = useState('National Heritage Bank');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  // Subscribe to Firebase RTDB for bank deposits
  useEffect(() => {
    const unsub = subscribeToPath<Record<string, BankDepositRecord>>('bankDeposits', (data) => {
      if (data) {
        setDeposits(Object.values(data));
      } else {
        INITIAL_BANK_DEPOSITS.forEach((dep) => saveBankDeposit(dep));
        setDeposits(INITIAL_BANK_DEPOSITS);
      }
    });

    return () => unsub();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGenerateOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || Number(transferAmount) <= 0) {
      alert('Please enter a valid transfer amount.');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTransferStep('otp');
    setEnteredOtp('');
    setOtpError(null);
  };

  const handleVerifyOtpAndTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== generatedOtp) {
      setOtpError('Invalid OTP Code entered. Please check the security SMS/Alert code and try again.');
      return;
    }

    const txRef = `TXN-NHB-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const newDeposit: BankDepositRecord = {
      id: `DEP-${Date.now().toString().slice(-5)}`,
      studentId: user?.admissionId || 'STU-1001',
      admissionId: user?.admissionId || 'STU-1001',
      studentName: depositorName || user?.name || 'Aarav Sharma',
      depositorEmail: depositorEmail || user?.email || 'student@nhcollege.edu',
      depositorPhone: depositorPhone || '+91 98765 43210',
      depositorRole: depositorRole,
      amount: Number(transferAmount) || 0,
      bankName: transferBank,
      transactionRef: txRef,
      depositDate: new Date().toISOString().split('T')[0],
      paymentMode: 'Direct Bank Transfer',
      status: 'Verified',
      notes: 'OTP Verified direct bank money transfer to NH College Account',
      verifiedBy: 'Automated 2FA OTP Gate',
      verifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    const ok = await saveBankDeposit(newDeposit);
    if (ok) {
      await saveFeePayment({
        id: `PAY-${Date.now().toString().slice(-5)}`,
        studentId: user?.admissionId || 'STU-1001',
        studentName: depositorName || user?.name || 'Aarav Sharma',
        admissionId: user?.admissionId || 'STU-1001',
        amount: Number(transferAmount) || 0,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Direct Bank Transfer (OTP Verified)',
        status: 'Completed',
        receiptNo: txRef,
        remarks: 'NH College Direct Bank OTP Money Transfer'
      });

      setStatusMessage({
        type: 'success',
        text: `Money Credited! $${transferAmount} deposited & verified into NH College Account. Ref: ${txRef}`
      });
      setIsOtpTransferModalOpen(false);
      setTransferStep('setup');
      setGeneratedOtp(null);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !transactionRef.trim()) {
      setStatusMessage({ type: 'error', text: 'Please fill in Deposit Amount and Transaction Reference Number.' });
      return;
    }

    const newDeposit: BankDepositRecord = {
      id: `DEP-${Date.now().toString().slice(-5)}`,
      studentId: user?.admissionId || 'STU-1001',
      admissionId: user?.admissionId || 'STU-1001',
      studentName: depositorName || user?.name || 'Aarav Sharma',
      depositorEmail: depositorEmail || 'depositor@nhcollege.edu',
      depositorPhone: depositorPhone || '+91 98765 43210',
      depositorRole: depositorRole,
      amount: Number(amount) || 0,
      bankName: bankName.trim(),
      transactionRef: transactionRef.trim(),
      depositDate: new Date().toISOString().split('T')[0],
      paymentMode,
      status: 'Pending Approval',
      notes: notes.trim() || 'Direct bank deposit receipt submitted for credit check'
    };

    const ok = await saveBankDeposit(newDeposit);
    if (ok) {
      setStatusMessage({
        type: 'success',
        text: `Bank deposit record of $${amount} submitted! Verification status set to Pending Credited Check.`
      });
      setIsDepositModalOpen(false);
      setTransactionRef('');
      setNotes('');
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({ type: 'error', text: 'Failed to record bank deposit.' });
    }
  };

  const handleApproveDeposit = async (deposit: BankDepositRecord) => {
    const ok = await updateBankDepositStatus(deposit.id, 'Verified');
    if (ok) {
      // Update with verification details
      const updatedRecord: BankDepositRecord = {
        ...deposit,
        status: 'Verified',
        verifiedBy: user?.name || 'NH Finance Office',
        verifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      await saveBankDeposit(updatedRecord);

      await saveFeePayment({
        id: `PAY-${Date.now().toString().slice(-5)}`,
        studentId: deposit.studentId,
        studentName: deposit.studentName,
        admissionId: deposit.admissionId,
        amount: deposit.amount,
        date: deposit.depositDate,
        paymentMethod: deposit.paymentMode,
        status: 'Completed',
        receiptNo: deposit.transactionRef,
        remarks: deposit.notes
      });

      setStatusMessage({ type: 'success', text: `Deposit ${deposit.transactionRef} marked as CREDITED & VERIFIED into NH College account!` });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleRejectDeposit = async (depositId: string) => {
    const ok = await updateBankDepositStatus(depositId, 'Rejected');
    if (ok) {
      setStatusMessage({ type: 'error', text: 'Deposit record flagged as Rejected / Not Credited.' });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Filtered deposits
  const filteredDeposits = deposits.filter((dep) => {
    const matchesStatus = statusFilter === 'All' || dep.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      dep.studentName.toLowerCase().includes(query) ||
      dep.admissionId.toLowerCase().includes(query) ||
      dep.transactionRef.toLowerCase().includes(query) ||
      dep.bankName.toLowerCase().includes(query) ||
      (dep.depositorEmail && dep.depositorEmail.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  // Calculate Funds KPI
  const totalCreditedFunds = deposits
    .filter((d) => d.status === 'Verified')
    .reduce((sum, d) => sum + d.amount, 0);

  const pendingVerificationFunds = deposits
    .filter((d) => d.status === 'Pending Approval')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-100 text-xs font-semibold mb-1">
            <Building2 className="w-4 h-4 text-emerald-200" />
            <span>NH College Accounts & Finance Division</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">NH College Bank Funds & Depositor Record System</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Track all direct bank transfers, verify credited money, view depositor personal profiles, and authorize 2FA OTP transactions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setIsOtpTransferModalOpen(true);
              setTransferStep('setup');
            }}
            className="inline-flex items-center justify-center space-x-2 bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-300/40 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-xs"
          >
            <KeyRound className="w-4 h-4 text-emerald-300" />
            <span>OTP Bank Money Transfer</span>
          </button>

          <button
            onClick={() => setIsDepositModalOpen(true)}
            className="inline-flex items-center justify-center space-x-2 bg-white text-emerald-900 hover:bg-emerald-50 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-xs"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            <span>Record New Bank Deposit</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Funds Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Total Verified Credited Funds</div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${totalCreditedFunds.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center space-x-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Pending Verification Check</div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              ${pendingVerificationFunds.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 rounded-xl">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Total Recorded Depositors</div>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {deposits.length} Records
            </div>
          </div>
        </div>
      </div>

      {/* Official NH College Bank Account Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Account Details */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                NH College Official Bank Account Details
              </h2>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
              Verified Beneficiary Trust
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Beneficiary Name</div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">NH Education Foundation</div>
              <div className="text-[11px] text-slate-500">Official College Fee & Grants Trust</div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Bank Name & Branch</div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">National Heritage Bank (NHB)</div>
              <div className="text-[11px] text-slate-500">NH Campus Main Branch, University Road</div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 relative">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Account Number</div>
              <div className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-base">9876 5432 1098</div>
              <button
                onClick={() => handleCopy('987654321098', 'acc')}
                className="absolute top-3 right-3 text-slate-400 hover:text-indigo-600"
                title="Copy Account Number"
              >
                {copiedField === 'acc' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 relative">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">IFSC / Branch Routing Code</div>
              <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">NHBK0004589</div>
              <button
                onClick={() => handleCopy('NHBK0004589', 'ifsc')}
                className="absolute top-3 right-3 text-slate-400 hover:text-indigo-600"
                title="Copy IFSC Code"
              >
                {copiedField === 'ifsc' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">SWIFT / BIC Code</div>
              <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">NHBKINBBXXX</div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 relative">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Official UPI Handle</div>
              <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">nhcollege@upi</div>
              <button
                onClick={() => handleCopy('nhcollege@upi', 'upi')}
                className="absolute top-3 right-3 text-slate-400 hover:text-emerald-600"
                title="Copy UPI ID"
              >
                {copiedField === 'upi' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* QR Code Quick Deposit Box */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-2xl p-6 border border-slate-800 shadow-lg flex flex-col justify-between items-center text-center space-y-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
              <QrCode className="w-4 h-4" />
              <span>Instant Bank Transfer QR</span>
            </div>
            <h3 className="font-extrabold text-lg text-white">Scan & Pay NH College Fees</h3>
            <p className="text-[11px] text-slate-300">Scan with any Mobile Banking App, UPI, or GPay</p>
          </div>

          <div className="p-3 bg-white rounded-2xl shadow-md border-4 border-emerald-500/40">
            <QrCode className="w-32 h-32 text-slate-900" />
          </div>

          <div className="text-xs text-slate-300 space-y-1">
            <div className="font-mono text-emerald-300 font-bold">UPI ID: nhcollege@upi</div>
            <div className="text-[10px] text-slate-400">Include Student ID in remarks when paying.</div>
          </div>
        </div>

      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search depositor name, email, ref..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-600 dark:text-slate-300">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Verification Statuses</option>
            <option value="Verified">Credited & Verified</option>
            <option value="Pending Approval">Pending Credited Check</option>
            <option value="Rejected">Rejected / Not Credited</option>
          </select>
        </div>
      </div>

      {/* Bank Transactions Ledger & Depositor Records */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              NH College Depositors & Credited Funds Record System ({filteredDeposits.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Realtime Firebase DB Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Depositor & Personal Details</th>
                <th className="py-3.5 px-4">Amount Credited</th>
                <th className="py-3.5 px-4">Bank & Payment Mode</th>
                <th className="py-3.5 px-4">Transaction Ref</th>
                <th className="py-3.5 px-4">Deposit Date</th>
                <th className="py-3.5 px-4">Money Verification Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    No bank deposit records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                    {/* Depositor Personal Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-xs">
                          {dep.studentName.charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center space-x-2">
                            <span>{dep.studentName}</span>
                            {dep.depositorRole && (
                              <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                {dep.depositorRole}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                            ID: {dep.admissionId}
                          </div>
                          {dep.depositorEmail && (
                            <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{dep.depositorEmail}</span>
                            </div>
                          )}
                          {dep.depositorPhone && (
                            <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{dep.depositorPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                      ${dep.amount.toLocaleString()}
                    </td>

                    {/* Bank & Mode */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{dep.bankName}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{dep.paymentMode}</div>
                    </td>

                    {/* Transaction Ref */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {dep.transactionRef}
                    </td>

                    {/* Deposit Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">{dep.depositDate}</td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            dep.status === 'Verified'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                              : dep.status === 'Rejected'
                              ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                              : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                          }`}
                        >
                          {dep.status === 'Verified' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                          {dep.status === 'Pending Approval' && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                          {dep.status === 'Rejected' && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                          <span>{dep.status === 'Verified' ? 'CREDITED & VERIFIED' : dep.status === 'Pending Approval' ? 'PENDING CREDITED CHECK' : 'REJECTED / NOT CREDITED'}</span>
                        </span>

                        {dep.verifiedBy && (
                          <div className="text-[10px] text-slate-400 italic">
                            By {dep.verifiedBy} ({dep.verifiedAt || 'Verified'})
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedDeposit(dep)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-[11px] inline-flex items-center space-x-1"
                        title="View Full Depositor Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-500" />
                        <span>View Info</span>
                      </button>

                      {role === 'admin' && dep.status === 'Pending Approval' && (
                        <div className="inline-flex items-center space-x-1.5 ml-1">
                          <button
                            onClick={() => handleApproveDeposit(dep)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-xs"
                          >
                            Mark Credited
                          </button>
                          <button
                            onClick={() => handleRejectDeposit(dep.id)}
                            className="px-2 py-1 bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-700 font-bold rounded-lg text-[11px]"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Depositor Personal Details & Verification Modal */}
      {selectedDeposit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Depositor & Bank Fund Verification Card
                </h3>
              </div>
              <button
                onClick={() => setSelectedDeposit(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Status Header */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 uppercase text-[10px] font-bold">Transaction Reference</div>
                  <div className="font-mono font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                    {selectedDeposit.transactionRef}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedDeposit.status === 'Verified'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                      : selectedDeposit.status === 'Rejected'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                  }`}
                >
                  {selectedDeposit.status === 'Verified' ? 'CREDITED & VERIFIED' : selectedDeposit.status === 'Pending Approval' ? 'PENDING CHECK' : 'REJECTED'}
                </span>
              </div>

              {/* Depositor Personal Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-1">
                  1. Depositor Personal Profile
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Full Name:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedDeposit.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Admission / Roll ID:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{selectedDeposit.admissionId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact Email:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedDeposit.depositorEmail || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone Number:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedDeposit.depositorPhone || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Depositor Relationship:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedDeposit.depositorRole || 'Student'}</span>
                  </div>
                </div>
              </div>

              {/* Deposit Financial Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-1">
                  2. Bank Deposit & Credit Verification
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Amount Credited:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 text-lg">${selectedDeposit.amount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Payer Bank:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedDeposit.bankName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Payment Method:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedDeposit.paymentMode}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Deposit Date:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedDeposit.depositDate}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Remarks / Purpose:</span>
                    <span className="text-slate-700 dark:text-slate-300 italic">{selectedDeposit.notes || 'No remarks added'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                {role === 'admin' && selectedDeposit.status === 'Pending Approval' && (
                  <button
                    onClick={() => {
                      handleApproveDeposit(selectedDeposit);
                      setSelectedDeposit(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                  >
                    Confirm Money Credited
                  </button>
                )}
                <button
                  onClick={() => setSelectedDeposit(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Money Transfer Modal */}
      {isOtpTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">NH College OTP Money Transfer</h3>
              </div>
              <button
                onClick={() => setIsOtpTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            {transferStep === 'setup' ? (
              <form onSubmit={handleGenerateOtp} className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-1">
                  <div className="font-bold text-xs flex items-center space-x-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Target Beneficiary Account:</span>
                  </div>
                  <p className="font-mono font-bold text-sm">9876 5432 1098 (NH Education Foundation)</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Depositor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={depositorName}
                    onChange={(e) => setDepositorName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Depositor Phone *
                    </label>
                    <input
                      type="text"
                      required
                      value={depositorPhone}
                      onChange={(e) => setDepositorPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Relationship Role
                    </label>
                    <select
                      value={depositorRole}
                      onChange={(e) => setDepositorRole(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      <option value="Student">Student</option>
                      <option value="Parent / Guardian">Parent / Guardian</option>
                      <option value="Corporate Sponsor">Corporate Sponsor</option>
                      <option value="Alumni Donor">Alumni Donor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Transfer Amount ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-extrabold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payer Bank Name
                  </label>
                  <select
                    value={transferBank}
                    onChange={(e) => setTransferBank(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="National Heritage Bank">National Heritage Bank (NHB)</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsOtpTransferModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center space-x-1.5"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Generate Security OTP</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpAndTransfer} className="space-y-4 text-xs">
                {/* Simulated SMS Security Alert Banner */}
                <div className="p-4 bg-amber-50 dark:bg-amber-950/60 rounded-xl border-2 border-amber-400 text-amber-900 dark:text-amber-100 space-y-1 animate-pulse">
                  <div className="flex items-center space-x-1.5 font-bold text-xs text-amber-800 dark:text-amber-300">
                    <Smartphone className="w-4 h-4 text-amber-600" />
                    <span>SECURITY SMS ALERT (2FA):</span>
                  </div>
                  <p className="text-xs">
                    Your 6-digit Security Transfer Code is:{' '}
                    <strong className="font-mono text-base text-indigo-700 dark:text-indigo-300 tracking-widest bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                      {generatedOtp}
                    </strong>
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Sent to registered mobile for NH College Bank Transfer of ${transferAmount}</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enter 6-Digit OTP Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-center text-xl font-mono tracking-widest font-extrabold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {otpError && <p className="text-rose-600 text-[11px] font-semibold mt-1">{otpError}</p>}
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setTransferStep('setup')}
                    className="text-slate-500 hover:text-slate-800 text-xs font-semibold"
                  >
                    ← Back to Transfer Setup
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center space-x-1.5"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Authorize Transfer</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Record Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Record Bank Deposit Receipt</h3>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitDeposit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Depositor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={depositorName}
                    onChange={(e) => setDepositorName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role / Relationship
                  </label>
                  <select
                    value={depositorRole}
                    onChange={(e) => setDepositorRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="Student">Student</option>
                    <option value="Parent / Guardian">Parent / Guardian</option>
                    <option value="Corporate Sponsor">Corporate Sponsor</option>
                    <option value="Alumni Donor">Alumni Donor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={depositorEmail}
                    onChange={(e) => setDepositorEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={depositorPhone}
                    onChange={(e) => setDepositorPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deposit Amount ($) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. National Heritage Bank, State Bank, HDFC"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Reference / UTR Number *
                </label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. TXN-NHB-99882200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                  <option value="NEFT/RTGS">NEFT / RTGS</option>
                  <option value="UPI/QR Deposit">UPI / QR Deposit</option>
                  <option value="Wire Transfer">Wire Transfer</option>
                  <option value="Cash Deposit">Cash Deposit at Campus Bank</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deposit Remarks / Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Semester 5 fee payment deposit"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Submit Deposit Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
