import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatNumber, filterByDateRange, isLowStock, isOutOfStock } from '../../utils/formatters';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  ShoppingBag,
  Boxes,
  Receipt,
  PiggyBank,
  AlertTriangle,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    products,
    sales,
    expenses,
    collections,
    dateRange,
    t,
    setActiveTab,
    language,
  } = useApp();

  // Filter Data by active date range
  const filteredSales = filterByDateRange(sales, dateRange);
  const filteredExpenses = filterByDateRange(expenses, dateRange);

  // Today specific calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySalesList = sales.filter((s) => s.date === todayStr && s.status === 'Completed');
  const todaySalesAmount = todaySalesList.reduce((acc, s) => acc + s.total, 0);

  const todayCollection = collections.find((c) => c.date === todayStr);
  const todayCollectedMoney = todayCollection ? todayCollection.cashSales + todayCollection.otherMoneyReceived : todaySalesAmount;

  const todaySoldProductsCount = todaySalesList.reduce((acc, s) => {
    return acc + s.items.reduce((sum, item) => sum + item.quantity, 0);
  }, 0);

  // Total Metrics
  const totalSalesRevenue = sales.reduce((acc, s) => acc + (s.status === 'Completed' ? s.total : 0), 0);
  const totalProductsCount = products.length;
  const totalQuantityInStock = products.reduce((acc, p) => acc + p.stock, 0);
  const totalExpensesAmount = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Estimated Total Profit = (Selling Price - Purchase Price) for all sold items
  const estimatedProfit = sales.reduce((acc, s) => {
    if (s.status !== 'Completed') return acc;
    const saleProfit = s.items.reduce((pAcc, item) => {
      const profitPerUnit = item.unitPrice - item.purchasePrice;
      return pAcc + profitPerUnit * item.quantity;
    }, 0);
    return acc + saleProfit - (s.discount || 0);
  }, 0) - totalExpensesAmount;

  // Low stock products
  const lowStockItems = products.filter((p) => isLowStock(p) || isOutOfStock(p));

  // Recent Stock Additions
  const recentStockAdditions = [...products]
    .sort((a, b) => (a.dateAdded < b.dateAdded ? 1 : -1))
    .slice(0, 5);

  // Recent Sales
  const recentSalesList = [...sales].slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Notice */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>MINU SHOE PALACE • ERP System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('welcomeBack')}, System Admin!
            </h1>
            <p className="text-rose-100 text-xs sm:text-sm mt-1 max-w-xl">
              100m from Buttala Town, Katharagama Road, Buttala. Real-time overview of your store's sales, inventory stock, and cash collection.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('sales')}
              className="px-5 py-2.5 rounded-2xl bg-white text-rose-700 font-bold text-xs sm:text-sm shadow-lg hover:bg-rose-50 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t('posTitle')}</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addProduct')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Money / Total Sales */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t('totalMoneySales')}
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {formatCurrency(totalSalesRevenue, language)}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>All-time total sales</span>
            </p>
          </div>
        </div>

        {/* Today's Sales Amount */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t('todaySalesAmount')}
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {formatCurrency(todaySalesAmount, language)}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">
              {todaySalesList.length} sales invoices today
            </p>
          </div>
        </div>

        {/* Today's Collected Money */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t('todayCollectedMoney')}
            </span>
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {formatCurrency(todayCollectedMoney, language)}
            </p>
            <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium mt-1">
              Recorded cash flow today
            </p>
          </div>
        </div>

        {/* Total Products */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t('totalProducts')}
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {formatNumber(totalProductsCount)}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">
              Across 8 retail categories
            </p>
          </div>
        </div>

        {/* Total Quantity in Stock */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t('totalQuantityInStock')}
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {formatNumber(totalQuantityInStock)} Pcs
            </p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
              Current store inventory
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t('totalExpenses')}
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {formatCurrency(totalExpensesAmount, language)}
            </p>
            <p className="text-[11px] text-rose-500 font-medium mt-1">
              Rent, bills & transport
            </p>
          </div>
        </div>

        {/* Estimated Total Profit */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t('estimatedProfit')}
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrency(estimatedProfit, language)}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">
              Margin - Total Expenses
            </p>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t('lowStockProducts')}
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {lowStockItems.length} Products
            </p>
            <button
              onClick={() => setActiveTab('stock')}
              className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold hover:underline mt-1 flex items-center gap-1"
            >
              <span>View low stock alert list</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Sales & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                {t('recentSales')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Latest transactions processed at MINU SHOE PALACE
              </p>
            </div>
            <button
              onClick={() => setActiveTab('sales')}
              className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-700 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">{t('invoiceNo')}</th>
                  <th className="py-2.5 px-3">{t('dateAndTime')}</th>
                  <th className="py-2.5 px-3">{t('paymentMethod')}</th>
                  <th className="py-2.5 px-3">{t('status')}</th>
                  <th className="py-2.5 px-3 text-right">{t('total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {recentSalesList.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-3 px-3 font-semibold text-rose-600 dark:text-rose-400">
                      {sale.invoiceNo}
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-300">
                      {sale.dateTime}
                    </td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300 font-medium">
                      <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-[11px]">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sale.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : sale.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        }`}
                      >
                        {t(sale.status.toLowerCase())}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-gray-900 dark:text-white">
                      {formatCurrency(sale.total, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning Box & Recent Stock Additions */}
        <div className="space-y-6">
          {/* Low Stock Warning Box */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-3xl p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>{t('lowStockProducts')} ({lowStockItems.length})</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              The following products require reordering soon to prevent stockout in your Buttala shop:
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {lowStockItems.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-amber-200/60 dark:border-amber-900/40 text-xs shadow-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{prod.name}</p>
                    <p className="text-[10px] text-gray-500">{prod.code} • {prod.category}</p>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[11px] whitespace-nowrap">
                    {prod.stock} Pcs Left
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Stock Additions */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2.5">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-500" />
                <span>{t('recentStockAdditions')}</span>
              </h3>
            </div>
            <div className="space-y-2.5">
              {recentStockAdditions.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 dark:border-gray-700/50 last:border-none">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400">{p.brand} • Size: {p.size || 'Free'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">+{p.stock} Pcs</p>
                    <p className="text-[10px] text-gray-400">{p.dateAdded}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
