import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { MobileNav } from './components/layout/MobileNav';

import { DashboardView } from './components/dashboard/DashboardView';
import { ProductsView } from './components/products/ProductsView';
import { CategoriesView } from './components/products/CategoriesView';
import { StockView } from './components/products/StockView';
import { SalesPosView } from './components/sales/SalesPosView';
import { MoneyCollectionView } from './components/collection/MoneyCollectionView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ReportsView } from './components/reports/ReportsView';
import { BranchInfoView } from './components/branch/BranchInfoView';
import { SettingsView } from './components/settings/SettingsView';

const MainContent: React.FC = () => {
  const { isAuthenticated, activeTab } = useApp();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'products':
        return <ProductsView />;
      case 'categories':
        return <CategoriesView />;
      case 'stock':
        return <StockView />;
      case 'sales':
        return <SalesPosView />;
      case 'collection':
        return <MoneyCollectionView />;
      case 'expenses':
        return <ExpensesView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'reports':
        return <ReportsView />;
      case 'branch':
        return <BranchInfoView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans flex antialiased selection:bg-rose-500 selection:text-white">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Right Content Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenMobileNav={() => setIsMobileNavOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderTabContent()}
        </main>
      </div>

      {/* Mobile Navigation Drawer & Bottom Bar */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
