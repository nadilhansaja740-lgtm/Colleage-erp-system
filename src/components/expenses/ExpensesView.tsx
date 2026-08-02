import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { ExpenseFormModal } from './ExpenseFormModal';
import {
  Receipt,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  Calendar,
  DollarSign,
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, deleteExpense, t, language } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const todayExp = expenses
    .filter((e) => e.date === todayStr)
    .reduce((acc, e) => acc + e.amount, 0);

  const monthExp = expenses
    .filter((e) => e.date.startsWith(currentMonthStr))
    .reduce((acc, e) => acc + e.amount, 0);

  const totalExp = expenses.reduce((acc, e) => acc + e.amount, 0);

  const categories = [
    'All',
    'Shop Rent',
    'Electricity',
    'Water',
    'Salary',
    'Transport',
    'Repairs',
    'Shop Supplies',
    'Other Expenses',
  ];

  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = selectedCat === 'All' || e.category === selectedCat;
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t('navExpenses')}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Record shop overhead expenses, electricity bills, shop rent, salaries, and maintenance
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center gap-2 transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addExpense')}</span>
        </button>
      </div>

      {/* Expense Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500">{t('todayExpenses')}</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(todayExp, language)}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500">{t('monthlyExpenses')}</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(monthExp, language)}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500">{t('totalExpenses')}</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {formatCurrency(totalExp, language)}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat === 'All' ? t('allCategories') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase font-semibold border-b border-gray-100 dark:border-gray-700">
                <th className="py-3.5 px-4">{t('expenseDate')}</th>
                <th className="py-3.5 px-4">{t('expenseName')}</th>
                <th className="py-3.5 px-4">{t('expenseCategory')}</th>
                <th className="py-3.5 px-4">{t('notesDescription')}</th>
                <th className="py-3.5 px-4 text-right">{t('amount')}</th>
                <th className="py-3.5 px-4 text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-900 dark:text-white">
                    {exp.date}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                    {exp.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {exp.description || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-rose-600 dark:text-rose-400">
                    {formatCurrency(exp.amount, language)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this expense entry?')) {
                          deleteExpense(exp.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
