import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, Sale, Expense, MoneyCollection, BusinessInfo } from '../types';

export function exportSalesReportPDF(
  sales: Sale[],
  businessInfo: BusinessInfo,
  title: string,
  dateSubtitle: string
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(businessInfo.name, 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${businessInfo.branch} - ${businessInfo.address}`, 14, 25);
  doc.text(`Contact: ${businessInfo.contactNumber} | Email: ${businessInfo.email}`, 14, 30);

  doc.setLineWidth(0.5);
  doc.line(14, 33, 196, 33);

  // Report Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period / Date: ${dateSubtitle}`, 14, 48);
  doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 53);

  // Summary Metrics
  const totalRev = sales.reduce((acc, s) => acc + (s.status === 'Completed' ? s.total : 0), 0);
  const totalCount = sales.length;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Sales Count: ${totalCount}   |   Total Net Revenue: LKR ${totalRev.toLocaleString()}`, 14, 61);

  // Table Data
  const tableData = sales.map((sale) => [
    sale.invoiceNo,
    sale.dateTime,
    sale.paymentMethod,
    sale.items.map((i) => `${i.productName} (${i.quantity})`).join(', '),
    sale.status,
    `LKR ${sale.total.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: 66,
    head: [['Invoice No', 'Date & Time', 'Method', 'Items', 'Status', 'Total Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [225, 29, 72] }, // Rose-600 primary color
    styles: { fontSize: 8 },
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}

export function exportStockReportPDF(
  products: Product[],
  businessInfo: BusinessInfo,
  title: string
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(businessInfo.name, 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${businessInfo.branch} - ${businessInfo.address}`, 14, 25);
  doc.text(`Contact: ${businessInfo.contactNumber}`, 14, 30);

  doc.setLineWidth(0.5);
  doc.line(14, 33, 196, 33);

  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 48);

  const totalQty = products.reduce((acc, p) => acc + p.stock, 0);
  const totalVal = products.reduce((acc, p) => acc + p.stock * p.sellingPrice, 0);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Products: ${products.length}  |  Total Stock Qty: ${totalQty}  |  Est. Retail Value: LKR ${totalVal.toLocaleString()}`, 14, 56);

  const tableData = products.map((p) => [
    p.code,
    p.name,
    p.category,
    p.size || '-',
    p.color || '-',
    `LKR ${p.sellingPrice.toLocaleString()}`,
    p.stock.toString(),
    p.stock <= p.minStockLevel ? 'LOW STOCK' : 'OK',
  ]);

  autoTable(doc, {
    startY: 61,
    head: [['Code', 'Product Name', 'Category', 'Size', 'Color', 'Selling Price', 'Stock Qty', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42] }, // Slate-900
    styles: { fontSize: 8 },
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}

export function exportExpensesReportPDF(
  expenses: Expense[],
  businessInfo: BusinessInfo,
  title: string
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(businessInfo.name, 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${businessInfo.branch} - ${businessInfo.address}`, 14, 25);

  doc.setLineWidth(0.5);
  doc.line(14, 28, 196, 28);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 37);

  const totalExp = expenses.reduce((acc, e) => acc + e.amount, 0);

  doc.setFontSize(11);
  doc.text(`Total Expense Items: ${expenses.length}   |   Total Amount Spent: LKR ${totalExp.toLocaleString()}`, 14, 45);

  const tableData = expenses.map((e) => [
    e.date,
    e.name,
    e.category,
    `LKR ${e.amount.toLocaleString()}`,
    e.description || '-',
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Date', 'Expense Name', 'Category', 'Amount', 'Description']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [225, 29, 72] },
    styles: { fontSize: 8 },
  });

  doc.save(`Expense_Report_${Date.now()}.pdf`);
}

export function exportMoneyCollectionReportPDF(
  collections: MoneyCollection[],
  businessInfo: BusinessInfo
) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(businessInfo.name, 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Daily Money Collection & Cash Balance Log - ${businessInfo.branch}`, 14, 25);

  doc.setLineWidth(0.5);
  doc.line(14, 28, 196, 28);

  const tableData = collections.map((c) => [
    c.date,
    `LKR ${c.openingCash.toLocaleString()}`,
    `LKR ${c.cashSales.toLocaleString()}`,
    `LKR ${c.otherMoneyReceived.toLocaleString()}`,
    `LKR ${c.expenses.toLocaleString()}`,
    `LKR ${c.closingCash.toLocaleString()}`,
    c.notes || '-',
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['Date', 'Opening Cash', 'Cash Sales', 'Other Recv.', 'Expenses', 'Closing Cash', 'Notes']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] }, // Emerald
    styles: { fontSize: 8 },
  });

  doc.save(`Money_Collection_Report_${Date.now()}.pdf`);
}

export function printSaleReceiptPDF(sale: Sale, businessInfo: BusinessInfo) {
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 180], // Thermal 80mm width format
  });

  let y = 8;

  // Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(businessInfo.name, 40, y, { align: 'center' });
  y += 5;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`${businessInfo.branch}`, 40, y, { align: 'center' });
  y += 4;
  doc.text(`100m from Buttala Town, Katharagama Rd`, 40, y, { align: 'center' });
  y += 4;
  doc.text(`Tel: ${businessInfo.contactNumber}`, 40, y, { align: 'center' });
  y += 5;

  doc.setLineWidth(0.2);
  doc.line(5, y, 75, y);
  y += 4;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`RECEIPT: ${sale.invoiceNo}`, 5, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${sale.dateTime}`, 5, y);
  y += 4;
  doc.text(`Payment: ${sale.paymentMethod}`, 5, y);
  if (sale.customerName) {
    y += 4;
    doc.text(`Customer: ${sale.customerName}`, 5, y);
  }
  y += 5;

  doc.line(5, y, 75, y);
  y += 4;

  // Items Header
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 5, y);
  doc.text('Qty x Price', 45, y);
  doc.text('Total', 75, y, { align: 'right' });
  y += 4;

  doc.setFont('helvetica', 'normal');
  sale.items.forEach((item) => {
    doc.text(`${item.productName.substring(0, 22)}`, 5, y);
    y += 3.5;
    doc.text(`${item.quantity} x Rs.${item.unitPrice}`, 5, y);
    doc.text(`Rs.${item.total.toLocaleString()}`, 75, y, { align: 'right' });
    y += 4;
  });

  doc.line(5, y, 75, y);
  y += 4;

  // Totals
  doc.text('Subtotal:', 40, y, { align: 'right' });
  doc.text(`Rs.${sale.subtotal.toLocaleString()}`, 75, y, { align: 'right' });
  y += 4;

  if (sale.discount > 0) {
    doc.text('Discount:', 40, y, { align: 'right' });
    doc.text(`-Rs.${sale.discount.toLocaleString()}`, 75, y, { align: 'right' });
    y += 4;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL:', 40, y, { align: 'right' });
  doc.text(`Rs.${sale.total.toLocaleString()}`, 75, y, { align: 'right' });
  y += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  if (sale.paymentMethod === 'Cash') {
    doc.text('Cash Received:', 40, y, { align: 'right' });
    doc.text(`Rs.${sale.cashReceived.toLocaleString()}`, 75, y, { align: 'right' });
    y += 4;
    doc.text('Change Due:', 40, y, { align: 'right' });
    doc.text(`Rs.${sale.changeDue.toLocaleString()}`, 75, y, { align: 'right' });
    y += 5;
  }

  doc.line(5, y, 75, y);
  y += 5;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank You For Shopping With Us!', 40, y, { align: 'center' });
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text('නැවත පැමිණෙන්න! (Please Come Again)', 40, y, { align: 'center' });

  doc.save(`Receipt_${sale.invoiceNo}.pdf`);
}
