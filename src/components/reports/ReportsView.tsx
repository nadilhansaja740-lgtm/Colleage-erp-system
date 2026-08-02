import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  exportSalesReportPDF,
  exportStockReportPDF,
  exportExpensesReportPDF,
  exportMoneyCollectionReportPDF,
} from '../../utils/pdfExporter';
import {
  exportSalesToExcel,
  exportProductsToExcel,
  exportExpensesToExcel,
  exportCollectionsToExcel,
} from '../../utils/excelExporter';
import { FileText, Download, Printer, Calendar, FileSpreadsheet } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { sales, products, expenses, collections, businessInfo, t } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const reportCards = [
    {
      title: 'Daily Sales Report',
      description: 'Comprehensive invoice breakdown, items sold, payment methods, and revenue totals',
      pdfAction: () =>
        exportSalesReportPDF(
          sales,
          businessInfo,
          'Daily Sales Statement Report',
          `${startDate} to ${endDate}`
        ),
      excelAction: () => exportSalesToExcel(sales, `Sales_Report_${startDate}_${endDate}`),
    },
    {
      title: 'Product Stock Inventory Report',
      description: 'All store inventory stock levels, unit purchase vs selling prices, and total valuation',
      pdfAction: () =>
        exportStockReportPDF(products, businessInfo, 'Store Stock & Inventory Report'),
      excelAction: () => exportProductsToExcel(products, 'Inventory_Stock_Report'),
    },
    {
      title: 'Shop Expenses Log Report',
      description: 'Shop rent, electricity, salaries, supplies, and maintenance overhead record sheet',
      pdfAction: () =>
        exportExpensesReportPDF(expenses, businessInfo, 'Shop Overhead Expenses Report'),
      excelAction: () => exportExpensesToExcel(expenses, `Expenses_Report_${startDate}_${endDate}`),
    },
    {
      title: 'Daily Cash Collection Report',
      description: 'Daily opening register cash, sales receipts, cash flow, and closing cash logs',
      pdfAction: () => exportMoneyCollectionReportPDF(collections, businessInfo),
      excelAction: () => exportCollectionsToExcel(collections, `Money_Collection_Report_${todayStr}`),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t('reportsTitle')}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Generate, print, and export official PDF documents and Excel/CSV spreadsheets for MINU SHOE PALACE
        </p>
      </div>

      {/* Date Filter Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
          <Calendar className="w-4 h-4 text-rose-600" />
          <span>Select Report Date Range:</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto text-xs">
          <div>
            <label className="text-[10px] text-gray-500 block mb-0.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 block mb-0.5">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium"
            />
          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportCards.map((rc, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                {rc.title}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                {rc.description}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex flex-col gap-2">
              <button
                onClick={rc.pdfAction}
                className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF Print Report</span>
              </button>

              <button
                onClick={rc.excelAction}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel CSV Export</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
