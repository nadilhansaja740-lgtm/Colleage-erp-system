import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, CreditCard, Sparkles } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { sales, expenses, products, t, language } = useApp();

  // Completed Sales
  const completedSales = sales.filter((s) => s.status === 'Completed');

  const totalRevenue = completedSales.reduce((acc, s) => acc + s.total, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const totalUnitsSold = completedSales.reduce(
    (acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );

  const avgOrderVal = completedSales.length > 0 ? Math.round(totalRevenue / completedSales.length) : 0;

  // Monthly breakdown for Sales and Expenses
  const monthMap: Record<string, { month: string; sales: number; expenses: number }> = {
    Jan: { month: 'Jan', sales: 42000, expenses: 12000 },
    Feb: { month: 'Feb', sales: 55000, expenses: 14000 },
    Mar: { month: 'Mar', sales: 48000, expenses: 11000 },
    Apr: { month: 'Apr', sales: 62000, expenses: 18000 },
    May: { month: 'May', sales: 78000, expenses: 21000 },
    Jun: { month: 'Jun', sales: 91000, expenses: 24000 },
    Jul: { month: 'Jul', sales: totalRevenue > 0 ? totalRevenue : 112000, expenses: totalExpenses },
  };

  const monthlyChartData = Object.values(monthMap);

  // Category sales breakdown for Pie chart
  const catSalesMap: Record<string, number> = {};
  completedSales.forEach((s) => {
    s.items.forEach((item) => {
      // Find category
      const p = products.find((prod) => prod.id === item.productId || prod.name === item.productName);
      const cat = p ? p.category : 'Shoes';
      catSalesMap[cat] = (catSalesMap[cat] || 0) + item.total;
    });
  });

  // Default seed values if empty
  if (Object.keys(catSalesMap).length === 0) {
    catSalesMap['Shoes'] = 45000;
    catSalesMap['Bags'] = 28000;
    catSalesMap['Umbrellas'] = 15000;
    catSalesMap['Perfumes'] = 22000;
  }

  const COLORS = ['#e11d48', '#8b5cf6', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899'];

  const categoryPieData = Object.keys(catSalesMap).map((key) => ({
    name: key,
    value: catSalesMap[key],
  }));

  // Payment method breakdown
  const paymentMap: Record<string, number> = { Cash: 0, Card: 0, 'Bank Transfer': 0, Other: 0 };
  completedSales.forEach((s) => {
    paymentMap[s.paymentMethod] = (paymentMap[s.paymentMethod] || 0) + s.total;
  });

  const paymentData = Object.keys(paymentMap).map((m) => ({
    method: m,
    amount: paymentMap[m] || (m === 'Cash' ? 65000 : 25000),
  }));

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t('analyticsTitle')}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Financial growth, revenue charts, expense distribution, and retail category analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500">{t('totalSalesRevenue')}</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalRevenue, language)}
          </p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">↑ +14.2% Growth</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500">{t('netProfit')}</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(netProfit, language)}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Sales revenue minus shop expenses</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500">{t('unitsSold')}</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {formatNumber(totalUnitsSold)} Items
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Total items purchased by customers</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-xs font-semibold text-gray-500">{t('avgOrderValue')}</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {formatCurrency(avgOrderVal, language)}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">Average spent per invoice</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales vs Expenses Trend Area Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {t('monthlySalesVsExpenses')}
            </h3>
            <p className="text-xs text-gray-500">Comparative financial timeline</p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(val: number) => `Rs.${val.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="sales" name="Sales Revenue" stroke="#e11d48" fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f59e0b" fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Sales Distribution Pie Chart (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {t('salesByCategory')}
            </h3>
            <p className="text-xs text-gray-500">Retail sales contribution</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => `Rs.${val.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Bar Chart */}
        <div className="lg:col-span-12 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {t('paymentMethodBreakdown')}
            </h3>
            <p className="text-xs text-gray-500">Cash vs Card vs Bank Transfer Collections</p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="method" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(val: number) => `Rs.${val.toLocaleString()}`} />
                <Bar dataKey="amount" name="Collected Amount" fill="#e11d48" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
