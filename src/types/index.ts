export type Language = 'en' | 'si';

export type ProductCategory =
  | 'Shoes'
  | 'Bags'
  | 'Umbrellas'
  | 'Hats / Caps'
  | 'Hair Accessories'
  | 'Lip Products'
  | 'Perfumes'
  | 'Other Items';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  brand: string;
  color: string;
  size: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStockLevel: number;
  image: string;
  description: string;
  dateAdded: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number; // Discount per item or line
  total: number;
}

export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer' | 'Other';

export interface SaleItem {
  productId: string;
  productCode: string;
  productName: string;
  category: ProductCategory;
  brand: string;
  size: string;
  color: string;
  unitPrice: number;
  purchasePrice: number;
  quantity: number;
  discount: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string; // YYYY-MM-DD
  dateTime: string; // Printable ISO/Formatted
  timestamp: number;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived: number;
  changeDue: number;
  status: 'Completed' | 'Cancelled' | 'Returned';
  notes?: string;
  customerName?: string;
  customerPhone?: string;
}

export type ExpenseCategory =
  | 'Shop Rent'
  | 'Electricity'
  | 'Water'
  | 'Salary'
  | 'Transport'
  | 'Repairs'
  | 'Shop Supplies'
  | 'Other Expenses';

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
}

export interface MoneyCollection {
  id: string;
  date: string; // YYYY-MM-DD
  openingCash: number;
  cashSales: number;
  otherMoneyReceived: number;
  expenses: number;
  closingCash: number;
  notes: string;
}

export interface BusinessInfo {
  name: string;
  branch: string;
  address: string;
  contactNumber: string;
  email: string;
  taxRate: number;
  receiptFooter: string;
  currency: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'staff';
  avatar?: string;
}

export type DateFilterPreset = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';

export interface DateRange {
  preset: DateFilterPreset;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export type ActiveTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'stock'
  | 'sales'
  | 'collection'
  | 'expenses'
  | 'analytics'
  | 'reports'
  | 'branch'
  | 'settings';
