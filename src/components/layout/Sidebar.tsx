import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  ShoppingBag,
  Grid,
  Boxes,
  ShoppingCart,
  Wallet,
  Receipt,
  BarChart3,
  FileSpreadsheet,
  Store,
  Settings,
  LogOut,
  Footprints,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, logout, user, t, businessInfo } = useApp();

  const navItems: { id: ActiveTab; labelKey: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', labelKey: 'navDashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'products', labelKey: 'navProducts', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'categories', labelKey: 'navCategories', icon: <Grid className="w-5 h-5" /> },
    { id: 'stock', labelKey: 'navStock', icon: <Boxes className="w-5 h-5" /> },
    { id: 'sales', labelKey: 'navSales', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'collection', labelKey: 'navCollection', icon: <Wallet className="w-5 h-5" /> },
    { id: 'expenses', labelKey: 'navExpenses', icon: <Receipt className="w-5 h-5" /> },
    { id: 'analytics', labelKey: 'navAnalytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'reports', labelKey: 'navReports', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { id: 'branch', labelKey: 'navBranch', icon: <Store className="w-5 h-5" /> },
    { id: 'settings', labelKey: 'navSettings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-screen sticky top-0 z-30 flex-shrink-0 transition-colors">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
          <Footprints className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 dark:text-white leading-tight tracking-tight text-base">
            {businessInfo.name}
          </h1>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {businessInfo.branch} • Buttala
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-semibold shadow-sm border border-rose-200/50 dark:border-rose-800/40'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className={isActive ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400 dark:text-gray-500'}>
                {item.icon}
              </span>
              <span className="truncate">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      {/* User & Logout Section */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">{user?.role || 'Admin'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title={t('logout')}
            className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
