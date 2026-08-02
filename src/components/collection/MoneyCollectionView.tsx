import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MoneyCollection } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Wallet, DollarSign, Calendar, Save, History, TrendingUp, PiggyBank } from 'lucide-react';

export const MoneyCollectionView: React.FC = () => {
  const { collections, sales, expenses, saveDailyCollection, t, language } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [openingCash, setOpeningCash] = useState<number | ''>(15000);
  const [cashSales, setCashSales] = useState<number | ''>(0);
  const [otherMoneyReceived, setOtherMoneyReceived] = useState<number | ''>(0);
  const [expensesAmount, setExpensesAmount] = useState<number | ''>(0);
  const [notes, setNotes] = useState('');

  // Auto populate cashSales and expensesAmount from system records for selected date
  useEffect(() => {
    const existingCol = collections.find((c) => c.date === date);
    if (existingCol) {
      setOpeningCash(existingCol.openingCash);
      setCashSales(existingCol.cashSales);
      setOtherMoneyReceived(existingCol.otherMoneyReceived);
      setExpensesAmount(existingCol.expenses);
      setNotes(existingCol.notes);
    } else {
      // Calculate from sales & expenses
      const salesOnDate = sales.filter((s) => s.date === date && s.status === 'Completed' && s.paymentMethod === 'Cash');
      const calcCashSales = salesOnDate.reduce((acc, s) => acc + s.total, 0);

      const expOnDate = expenses.filter((e) => e.date === date);
      const calcExpenses = expOnDate.reduce((acc, e) => acc + e.amount, 0);

      setOpeningCash(15000);
      setCashSales(calcCashSales);
      setOtherMoneyReceived(0);
      setExpensesAmount(calcExpenses);
      setNotes('');
    }
  }, [date, collections, sales, expenses]);

  const numOpening = Number(openingCash) || 0;
  const numCashSales = Number(cashSales) || 0;
  const numOther = Number(otherMoneyReceived) || 0;
  const numExp = Number(expensesAmount) || 0;

  // Closing Cash Formula = Opening Cash + Cash Sales + Other Money Received - Expenses
  const closingCash = numOpening + numCashSales + numOther - numExp;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveDailyCollection({
      date,
      openingCash: numOpening,
      cashSales: numCashSales,
      otherMoneyReceived: numOther,
      expenses: numExp,
      closingCash,
      notes,
    });
  };

  // Summaries
  const todayRecord = collections.find((c) => c.date === todayStr);
  const todayCollectedMoney = todayRecord ? todayRecord.cashSales + todayRecord.otherMoneyReceived : numCashSales;

  const totalCollectedMoneyAllTime = collections.reduce(
    (acc, c) => acc + c.cashSales + c.otherMoneyReceived,
    0
  );

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t('moneyCollectionTitle')}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Track daily register opening cash, cash sales, receipts, expenses, and closing cash balance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500">{t('todayCollectedMoney')}</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(todayCollectedMoney, language)}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Cash received today</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500">{t('dailyCashBalance')}</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(closingCash, language)}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Target closing register cash</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500">{t('totalCollectedMoney')}</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {formatCurrency(totalCollectedMoneyAllTime, language)}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Historical total cash log</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500">Record Date</span>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 font-mono">
            {date}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Main Branch • Buttala</p>
        </div>
      </div>

      {/* Main Grid: Form + History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Record Daily Collection Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
            <Wallet className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {t('recordCollection')}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Date */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('expenseDate')}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            {/* Opening Cash */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('openingCash')} *
              </label>
              <input
                type="number"
                min="0"
                value={openingCash}
                onChange={(e) =>
                  setOpeningCash(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-bold"
              />
            </div>

            {/* Cash Sales */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('cashSales')} *
              </label>
              <input
                type="number"
                min="0"
                value={cashSales}
                onChange={(e) =>
                  setCashSales(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>

            {/* Other Money Received */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('otherMoneyReceived')}
              </label>
              <input
                type="number"
                min="0"
                value={otherMoneyReceived}
                onChange={(e) =>
                  setOtherMoneyReceived(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-bold text-sky-600 dark:text-sky-400"
              />
            </div>

            {/* Expenses */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('expensesIncurred')} *
              </label>
              <input
                type="number"
                min="0"
                value={expensesAmount}
                onChange={(e) =>
                  setExpensesAmount(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-bold text-rose-600 dark:text-rose-400"
              />
            </div>

            {/* Calculated Closing Cash Banner */}
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
              <p className="text-[10px] font-semibold uppercase tracking-wide">
                {t('closingCashFormula')}
              </p>
              <p className="text-lg font-black mt-1">
                {t('closingCash')}: {formatCurrency(closingCash, language)}
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('notes')}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Remarks about register cash..."
                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{t('saveCollection')}</span>
            </button>
          </form>
        </div>

        {/* History Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
            <History className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {t('collectionHistory')}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Opening</th>
                  <th className="py-2.5 px-3">Cash Sales</th>
                  <th className="py-2.5 px-3">Expenses</th>
                  <th className="py-2.5 px-3 text-right">Closing Cash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {collections.map((col) => (
                  <tr key={col.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-3 px-3 font-mono font-bold text-gray-900 dark:text-white">
                      {col.date}
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-300">
                      Rs.{col.openingCash.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                      Rs.{col.cashSales.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-rose-600 dark:text-rose-400 font-bold">
                      Rs.{col.expenses.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-rose-600 dark:text-rose-400">
                      Rs.{col.closingCash.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
