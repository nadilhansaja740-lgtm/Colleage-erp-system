import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Languages,
  Moon,
  Sun,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    language,
    setLanguage,
    darkMode,
    setDarkMode,
    products,
    sales,
    expenses,
    collections,
    businessInfo,
    restoreDataBackup,
    resetAllFinancials,
    t,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      businessInfo,
      products,
      sales,
      expenses,
      collections,
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `MINU_SHOE_PALACE_BACKUP_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setMsg({ type: 'success', text: 'Database backup downloaded successfully!' });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.products && parsed.sales) {
            await restoreDataBackup(parsed);
            setMsg({ type: 'success', text: t('restoreSuccess') });
          } else {
            setMsg({ type: 'error', text: 'Invalid backup file format.' });
          }
        } catch (err) {
          setMsg({ type: 'error', text: 'Error parsing backup file.' });
        }
        setTimeout(() => setMsg(null), 4000);
      };
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t('settingsTitle')}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          System preferences, language toggle, light/dark mode, database backup & restore
        </p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            msg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 text-rose-800 dark:text-rose-300'
          }`}
        >
          {msg.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Language & Theme Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-base border-b border-gray-100 dark:border-gray-700 pb-3">
            Interface & Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Language Selection */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                <Languages className="w-4 h-4 text-rose-600" />
                <span>System Language</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Instantly switch menus, buttons, labels, forms, and reports
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                    language === 'en'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('si')}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                    language === 'si'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  සිංහල (Sinhala)
                </button>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                {darkMode ? (
                  <Moon className="w-4 h-4 text-rose-500" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <span>Appearance Theme</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Toggle between light mode and dark eye-friendly UI
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setDarkMode(false)}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                    !darkMode
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  Light Theme
                </button>
                <button
                  onClick={() => setDarkMode(true)}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                    darkMode
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  Dark Theme
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Database Backup & Restore Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-base border-b border-gray-100 dark:border-gray-700 pb-3">
            {t('dataManagement')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Download Backup */}
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                  <Download className="w-4 h-4 text-rose-600" />
                  <span>{t('backupData')}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Export all shop products, sales invoices, collections, and expense records into a secure JSON backup file.
                </p>
              </div>

              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Database JSON</span>
              </button>
            </div>

            {/* Restore Backup */}
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                  <Upload className="w-4 h-4 text-rose-600" />
                  <span>{t('restoreData')}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Restore previously saved database files to reload complete shop state.
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Backup JSON</span>
              </button>
            </div>
          </div>

          {/* Reset All Store Financials Card */}
          <div className="mt-4 p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-200">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>Reset All Financial Balances & Prices</span>
              </div>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                Sets all product item prices, sales totals, expenses, and account balances to 00.00 for a fresh start.
              </p>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all financial values, prices, sales, and expenses to 00.00?')) {
                  resetAllFinancials();
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All to 00.00</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
