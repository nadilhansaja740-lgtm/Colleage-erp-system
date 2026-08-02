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
  X,
  Footprints,
} from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
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

  const handleSelect = (id: ActiveTab) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          <div className="relative flex-1 max-w-xs w-full bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col z-10">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center">
                  <Footprints className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-sm">
                    {businessInfo.name}
                  </h2>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400">
                    {businessInfo.branch}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className={isActive ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    <span>{t(item.labelKey)}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div className="text-xs">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{user?.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase">{user?.role}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-2 py-1.5 flex justify-around items-center text-[10px] font-medium text-gray-600 dark:text-gray-400">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl ${
            activeTab === 'dashboard' ? 'text-rose-600 dark:text-rose-400 font-bold' : ''
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>{t('navDashboard')}</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl ${
            activeTab === 'products' ? 'text-rose-600 dark:text-rose-400 font-bold' : ''
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>{t('navProducts')}</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className="flex flex-col items-center gap-0.5 p-2 rounded-2xl bg-rose-600 text-white font-bold shadow-md shadow-rose-600/30 -mt-4"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="text-[9px]">{t('navSales')}</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl ${
            activeTab === 'expenses' ? 'text-rose-600 dark:text-rose-400 font-bold' : ''
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span>{t('navExpenses')}</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl ${
            activeTab === 'reports' ? 'text-rose-600 dark:text-rose-400 font-bold' : ''
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span>{t('navReports')}</span>
        </button>
      </div>
    </>
  );
};
