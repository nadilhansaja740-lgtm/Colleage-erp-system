import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { printSaleReceiptPDF } from '../../utils/pdfExporter';
import { X, Search, Printer, RotateCcw, Ban, Eye } from 'lucide-react';

interface SalesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewReceipt: (sale: Sale) => void;
}

export const SalesHistoryModal: React.FC<SalesHistoryModalProps> = ({
  isOpen,
  onClose,
  onViewReceipt,
}) => {
  const { sales, cancelSale, returnSale, t, language, businessInfo } = useApp();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredSales = sales.filter(
    (s) =>
      s.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      s.dateTime.toLowerCase().includes(search.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {t('salesHistory')}
            </h3>
            <p className="text-xs text-gray-500">
              Total {sales.length} invoices recorded at MINU SHOE PALACE
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice number, date, customer..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="p-4 overflow-y-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-gray-400 uppercase font-semibold border-b border-gray-100 dark:border-gray-700">
                <th className="py-2.5 px-3">{t('invoiceNo')}</th>
                <th className="py-2.5 px-3">{t('dateAndTime')}</th>
                <th className="py-2.5 px-3">{t('item')}s</th>
                <th className="py-2.5 px-3">{t('paymentMethod')}</th>
                <th className="py-2.5 px-3">{t('status')}</th>
                <th className="py-2.5 px-3 text-right">{t('total')}</th>
                <th className="py-2.5 px-3 text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-3 font-mono font-bold text-rose-600 dark:text-rose-400">
                    {sale.invoiceNo}
                  </td>
                  <td className="py-3 px-3 text-gray-600 dark:text-gray-300">
                    {sale.dateTime}
                  </td>
                  <td className="py-3 px-3 max-w-xs truncate text-gray-700 dark:text-gray-300">
                    {sale.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                  </td>
                  <td className="py-3 px-3 text-gray-600 font-medium">
                    {sale.paymentMethod}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sale.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : sale.status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {t(sale.status.toLowerCase())}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-black text-gray-900 dark:text-white">
                    {formatCurrency(sale.total, language)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onViewReceipt(sale)}
                        title="View Receipt"
                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => printSaleReceiptPDF(sale, businessInfo)}
                        title="Print PDF"
                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {sale.status === 'Completed' && (
                        <>
                          <button
                            onClick={() => {
                              if (window.confirm(t('confirmReturnSale'))) {
                                returnSale(sale.id);
                              }
                            }}
                            title="Sales Return / Refund"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 rounded-lg"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(t('confirmCancelSale'))) {
                                cancelSale(sale.id);
                              }
                            }}
                            title="Cancel Sale"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
