import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { printSaleReceiptPDF } from '../../utils/pdfExporter';
import { X, Printer, Download, CheckCircle2, Footprints } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const { businessInfo, language, t } = useApp();

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    printSaleReceiptPDF(sale, businessInfo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between no-print bg-gray-50 dark:bg-gray-800/80">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>{t('saleCompleted')}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area */}
        <div className="p-6 overflow-y-auto space-y-4 printable-area font-sans text-xs bg-white text-gray-900">
          {/* Shop Header */}
          <div className="text-center space-y-1 border-b border-dashed border-gray-300 pb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-rose-600 text-white mb-1">
              <Footprints className="w-6 h-6" />
            </div>
            <h2 className="text-base font-black tracking-tight text-gray-900 uppercase">
              {businessInfo.name}
            </h2>
            <p className="font-semibold text-rose-600 text-[11px]">{businessInfo.branch}</p>
            <p className="text-[11px] text-gray-600">{businessInfo.address}</p>
            <p className="text-[11px] text-gray-600">Tel: {businessInfo.contactNumber}</p>
          </div>

          {/* Invoice Info */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-gray-300 pb-3">
            <div className="flex justify-between font-bold">
              <span>Receipt No:</span>
              <span className="font-mono text-rose-600">{sale.invoiceNo}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Date & Time:</span>
              <span>{sale.dateTime}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Payment Method:</span>
              <span className="font-semibold">{sale.paymentMethod}</span>
            </div>
            {sale.customerName && (
              <div className="flex justify-between text-gray-600">
                <span>Customer:</span>
                <span>{sale.customerName} ({sale.customerPhone || 'N/A'})</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full text-left border-b border-dashed border-gray-300 pb-3 text-[11px]">
            <thead>
              <tr className="text-gray-500 font-bold border-b border-gray-200">
                <th className="py-1">Item</th>
                <th className="py-1 text-center">Qty x Price</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sale.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1.5 font-medium">
                    <div>{item.productName}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{item.productCode}</div>
                  </td>
                  <td className="py-1.5 text-center text-gray-600">
                    {item.quantity} x Rs.{item.unitPrice}
                  </td>
                  <td className="py-1.5 text-right font-bold">
                    Rs.{item.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Breakdown */}
          <div className="space-y-1.5 text-xs pt-1">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>Rs.{sale.subtotal.toLocaleString()}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Discount:</span>
                <span>-Rs.{sale.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-300 pt-2">
              <span>TOTAL PAYMENT:</span>
              <span>Rs.{sale.total.toLocaleString()}</span>
            </div>

            {sale.paymentMethod === 'Cash' && (
              <div className="pt-1 space-y-1 text-[11px] text-gray-600 border-t border-dashed border-gray-200">
                <div className="flex justify-between">
                  <span>Cash Received:</span>
                  <span>Rs.{sale.cashReceived.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Change Due:</span>
                  <span>Rs.{sale.changeDue.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Message */}
          <div className="text-center pt-4 border-t border-dashed border-gray-300 space-y-1">
            <p className="font-bold text-gray-900 text-[11px]">
              {businessInfo.receiptFooter}
            </p>
            <p className="text-[10px] text-rose-600 font-medium">
              ස්තූතියි! නැවත පැමිණෙන්න! (Thank You! Come Again!)
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center justify-between gap-3 no-print">
          <button
            onClick={handleDownloadPDF}
            className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4 text-rose-500" />
            <span>PDF Receipt</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-600/30 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>{t('printReceipt')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
