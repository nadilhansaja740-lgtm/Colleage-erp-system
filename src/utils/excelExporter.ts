import * as XLSX from 'xlsx';
import { Product, Sale, Expense, MoneyCollection } from '../types';

export function exportToExcel(data: any[], filename: string, sheetName = 'Sheet1') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToCSV(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatSalesForExport(sales: Sale[]) {
  return sales.map((s) => ({
    'Invoice No': s.invoiceNo,
    'Date & Time': s.dateTime,
    'Payment Method': s.paymentMethod,
    Status: s.status,
    Items: s.items.map((i) => `${i.productName} (x${i.quantity})`).join('; '),
    Subtotal: s.subtotal,
    Discount: s.discount,
    'Total Amount (LKR)': s.total,
    'Customer Name': s.customerName || 'N/A',
    'Customer Phone': s.customerPhone || 'N/A',
  }));
}

export function formatProductsForExport(products: Product[]) {
  return products.map((p) => ({
    'Product Code': p.code,
    'Product Name': p.name,
    Category: p.category,
    Brand: p.brand,
    Color: p.color,
    Size: p.size,
    'Purchase Price (LKR)': p.purchasePrice,
    'Selling Price (LKR)': p.sellingPrice,
    'Stock Quantity': p.stock,
    'Min Stock Level': p.minStockLevel,
    Status: p.stock <= p.minStockLevel ? 'LOW STOCK' : 'IN STOCK',
    'Date Added': p.dateAdded,
  }));
}

export function formatExpensesForExport(expenses: Expense[]) {
  return expenses.map((e) => ({
    Date: e.date,
    'Expense Name': e.name,
    Category: e.category,
    'Amount (LKR)': e.amount,
    Description: e.description,
  }));
}

export function formatMoneyCollectionsForExport(collections: MoneyCollection[]) {
  return collections.map((c) => ({
    Date: c.date,
    'Opening Cash': c.openingCash,
    'Cash Sales': c.cashSales,
    'Other Money Received': c.otherMoneyReceived,
    Expenses: c.expenses,
    'Closing Cash': c.closingCash,
    Notes: c.notes,
  }));
}

export function exportSalesToExcel(sales: Sale[], filename: string) {
  exportToExcel(formatSalesForExport(sales), filename, 'Sales');
}

export function exportProductsToExcel(products: Product[], filename: string) {
  exportToExcel(formatProductsForExport(products), filename, 'Inventory');
}

export function exportExpensesToExcel(expenses: Expense[], filename: string) {
  exportToExcel(formatExpensesForExport(expenses), filename, 'Expenses');
}

export function exportCollectionsToExcel(collections: MoneyCollection[], filename: string) {
  exportToExcel(formatMoneyCollectionsForExport(collections), filename, 'Money_Collections');
}
