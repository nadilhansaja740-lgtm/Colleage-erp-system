import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DateFilterPreset } from '../../types';
import {
  Globe,
  Sun,
  Moon,
  Calendar,
  Menu,
  ShoppingCart,
  Store,
  Check,
  Database,
} from 'lucide-react';

interface TopbarProps {
  onOpenMobileNav: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileNav }) => {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    activeTab,
    setActiveTab,
    dateRange,
    setDateRange,
    t,
    businessInfo,
    isFirebaseConnected,
  } = useApp();

  const [showDateFilter, setShowDateFilter] = useState(false);

  const presets: { id: DateFilterPreset; labelKey: string }[] = [
    { id: 'today', labelKey: 'today' },
    { id: 'yesterday', labelKey: 'yesterday' },
    { id: 'week', labelKey: 'thisWeek' },
    { id: 'month', labelKey: 'thisMonth' },
    { id: 'year', labelKey: 'thisYear' },
    { id: 'custom', labelKey: 'customRange' },
  ];

  const handlePresetSelect = (preset: DateFilterPreset) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (preset === 'today') {
      setDateRange({ preset: 'today', startDate: todayStr, endDate: todayStr });
    } else if (preset === 'yesterday') {
      const yest = new Date();
      yest.setDate(yest.getDate() - 1);
      const yestStr = yest.toISOString().split('T')[0];
      setDateRange({ preset: 'yesterday', startDate: yestStr, endDate: yestStr });
    } else if (preset === 'week') {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      setDateRange({
        preset: 'week',
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: todayStr,
      });
    } else if (preset === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setDateRange({
        preset: 'month',
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: todayStr,
      });
    } else if (preset === 'year') {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      setDateRange({
        preset: 'year',
        startDate: startOfYear.toISOString().split('T')[0],
        endDate: todayStr,
      });
    } else {
      setDateRange({ ...dateRange, preset: 'custom' });
    }
  };

  const getTabTitleKey = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'navDashboard';
      case 'products':
        return 'navProducts';
      case 'categories':
        return 'navCategories';
      case 'stock':
        return 'navStock';
      case 'sales':
        return 'navSales';
      case 'collection':
        return 'navCollection';
      case 'expenses':
        return 'navExpenses';
      case 'analytics':
        return 'navAnalytics';
      case 'reports':
        return 'navReports';
      case 'branch':
        return 'navBranch';
      case 'settings':
        return 'navSettings';
      default:
        return 'appName';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left Side: Mobile Menu Button & Tab Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              {t(getTabTitleKey())}
            </h2>
            <div className="flex items-center gap-2">
              <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
                {businessInfo.name} • {businessInfo.branch}
              </p>
              <div
                title={
                  isFirebaseConnected
                    ? 'Firebase Realtime Database Connected (minu-sha-default-rtdb)'
                    : 'Firebase Connecting...'
                }
                className={`hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition-all ${
                  isFirebaseConnected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/80'
                    : 'bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/80'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <Database className="w-3 h-3" />
                <span>{isFirebaseConnected ? 'Firebase RTDB Live' : 'Connecting RTDB...'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick POS Action Button */}
          {activeTab !== 'sales' && (
            <button
              onClick={() => setActiveTab('sales')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all duration-150"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{t('navSales')}</span>
            </button>
          )}

          {/* Date Range Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium transition-colors border border-gray-200/60 dark:border-gray-700"
            >
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span className="capitalize">{t(dateRange.preset)}</span>
            </button>

            {/* Date Range Dropdown */}
            {showDateFilter && (
              <div className="absolute right-0 mt-2 w-64 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 text-xs space-y-2">
                <div className="font-semibold text-gray-800 dark:text-gray-200 px-1 border-b border-gray-100 dark:border-gray-700 pb-1.5">
                  {t('dateFilter')}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePresetSelect(p.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-left font-medium transition-colors ${
                        dateRange.preset === p.id
                          ? 'bg-rose-600 text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {t(p.labelKey)}
                    </button>
                  ))}
                </div>

                {dateRange.preset === 'custom' && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-2">
                    <div>
                      <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-0.5">
                        {t('startDate')}
                      </label>
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, startDate: e.target.value })
                        }
                        className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 dark:text-gray-400 block mb-0.5">
                        {t('endDate')}
                      </label>
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, endDate: e.target.value })
                        }
                        className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowDateFilter(false)}
                  className="w-full mt-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-center font-medium hover:opacity-90 transition-opacity"
                >
                  {t('close')}
                </button>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200/60 dark:border-gray-700">
            <button
              onClick={() => setLanguage('si')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                language === 'si'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              සිංහල
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                language === 'en'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200/60 dark:border-gray-700"
            title={theme === 'light' ? t('darkMode') : t('lightMode')}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
