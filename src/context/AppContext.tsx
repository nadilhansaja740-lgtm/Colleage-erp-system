import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Language,
  Product,
  Sale,
  Expense,
  MoneyCollection,
  BusinessInfo,
  User,
  DateRange,
  ActiveTab,
  CartItem,
  PaymentMethod,
} from '../types';
import {
  initialProducts,
  initialSales,
  initialExpenses,
  initialMoneyCollections,
  initialBusinessInfo,
} from '../data/sampleData';
import { getTranslation } from '../i18n/translations';
import {
  subscribeProducts,
  saveProductToRTDB,
  deleteProductFromRTDB,
  subscribeSales,
  saveSaleToRTDB,
  updateSaleStatusInRTDB,
  subscribeExpenses,
  saveExpenseToRTDB,
  deleteExpenseFromRTDB,
  subscribeCollections,
  saveCollectionToRTDB,
  subscribeBusinessInfo,
  saveBusinessInfoToRTDB,
  subscribeConnectionStatus,
  resetAllFinancialsToZeroInRTDB,
} from '../services/firebase';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: User | null;
  isAuthenticated: boolean;
  isFirebaseConnected: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;

  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  collections: MoneyCollection[];
  businessInfo: BusinessInfo;

  addProduct: (product: Omit<Product, 'id' | 'dateAdded'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  processSale: (
    items: CartItem[],
    discount: number,
    paymentMethod: PaymentMethod,
    cashReceived: number,
    customerName?: string,
    customerPhone?: string,
    notes?: string
  ) => Promise<Sale | null>;
  cancelSale: (id: string) => Promise<void>;
  returnSale: (id: string) => Promise<void>;

  saveDailyCollection: (collection: Omit<MoneyCollection, 'id'>) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  updateBusinessInfo: (info: Partial<BusinessInfo>) => Promise<void>;
  restoreBackup: (data: any) => Promise<void>;
  resetAllFinancials: () => Promise<void>;

  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Saved Language preference
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('minu_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('minu_lang', lang);
  };

  const t = (key: string) => getTranslation(language, key);

  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('minu_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('minu_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Auth User
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('minu_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    const isLoggedOut = localStorage.getItem('minu_logged_out');
    if (isLoggedOut === 'true') {
      return null;
    }
    const defaultUser: User = { id: 'u1', username: 'admin', name: 'System Admin', role: 'admin' };
    localStorage.setItem('minu_user', JSON.stringify(defaultUser));
    return defaultUser;
  });

  const login = async (username: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('minu_user', JSON.stringify(data.user));
        localStorage.removeItem('minu_logged_out');
        addToast('success', t('loginSuccess'));
        return true;
      }
    } catch {
      // Fallback for static dev
      if (username === 'admin' && (pass === 'admin123' || pass === 'admin')) {
        const adminUser: User = { id: 'u1', username: 'admin', name: 'System Admin', role: 'admin' };
        setUser(adminUser);
        localStorage.setItem('minu_user', JSON.stringify(adminUser));
        localStorage.removeItem('minu_logged_out');
        addToast('success', t('loginSuccess'));
        return true;
      }
    }
    addToast('error', t('invalidCredentials'));
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('minu_user');
    localStorage.setItem('minu_logged_out', 'true');
  };

  // Navigation state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Date Filters
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({
    preset: 'today',
    startDate: todayStr,
    endDate: todayStr,
  });

  // Data State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [collections, setCollections] = useState<MoneyCollection[]>(initialMoneyCollections);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(initialBusinessInfo);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Realtime Sync with Firebase Realtime Database
  useEffect(() => {
    const unsubConn = subscribeConnectionStatus((connected) => {
      setIsFirebaseConnected(connected);
    });
    const unsubProd = subscribeProducts((prods) => {
      setProducts(prods);
    });
    const unsubSales = subscribeSales((s) => {
      setSales(s);
    });
    const unsubExp = subscribeExpenses((exp) => {
      setExpenses(exp);
    });
    const unsubCol = subscribeCollections((col) => {
      setCollections(col);
    });
    const unsubBiz = subscribeBusinessInfo((biz) => {
      setBusinessInfo(biz);
    });

    return () => {
      unsubConn();
      unsubProd();
      unsubSales();
      unsubExp();
      unsubCol();
      unsubBiz();
    };
  }, []);

  // CRUD Actions
  const addProduct = async (productData: Omit<Product, 'id' | 'dateAdded'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    setProducts((prev) => [newProd, ...prev]);
    addToast('success', t('productAdded'));

    try {
      await saveProductToRTDB(newProd);
    } catch (err) {
      console.error('Failed saving product to Firebase RTDB:', err);
    }

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd),
      });
    } catch {}
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const existing = products.find((p) => p.id === id);
    if (!existing) return;
    const updated = { ...existing, ...productData };

    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    addToast('success', t('productUpdated'));

    try {
      await saveProductToRTDB(updated);
    } catch (err) {
      console.error('Failed updating product in Firebase RTDB:', err);
    }

    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
    } catch {}
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('success', t('productDeleted'));

    try {
      await deleteProductFromRTDB(id);
    } catch (err) {
      console.error('Failed deleting product from Firebase RTDB:', err);
    }

    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const processSale = async (
    cartItems: CartItem[],
    discount: number,
    paymentMethod: PaymentMethod,
    cashReceived: number,
    customerName?: string,
    customerPhone?: string,
    notes?: string
  ): Promise<Sale | null> => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
    const total = Math.max(0, subtotal - discount);
    const changeDue = paymentMethod === 'Cash' ? Math.max(0, cashReceived - total) : 0;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNo: `INV-2026-${String(sales.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      dateTime: new Date().toLocaleString(),
      timestamp: Date.now(),
      status: 'Completed',
      items: cartItems.map((ci) => ({
        productId: ci.product.id,
        productCode: ci.product.code,
        productName: ci.product.name,
        category: ci.product.category,
        brand: ci.product.brand,
        size: ci.product.size,
        color: ci.product.color,
        unitPrice: ci.product.sellingPrice,
        purchasePrice: ci.product.purchasePrice,
        quantity: ci.quantity,
        discount: ci.discount,
        total: ci.product.sellingPrice * ci.quantity - ci.discount,
      })),
      subtotal,
      discount,
      total,
      paymentMethod,
      cashReceived,
      changeDue,
      customerName,
      customerPhone,
      notes,
    };

    // Update product stock in state and Firebase
    const updatedProducts = products.map((p) => {
      const itemInCart = cartItems.find((ci) => ci.product.id === p.id);
      if (itemInCart) {
        const updatedP = { ...p, stock: Math.max(0, p.stock - itemInCart.quantity) };
        saveProductToRTDB(updatedP).catch(() => {});
        return updatedP;
      }
      return p;
    });

    setProducts(updatedProducts);
    setSales((prev) => [newSale, ...prev]);
    addToast('success', t('saleCompleted'));

    try {
      await saveSaleToRTDB(newSale);
    } catch (err) {
      console.error('Failed saving sale to Firebase RTDB:', err);
    }

    try {
      await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSale),
      });
    } catch {}

    return newSale;
  };

  const cancelSale = async (id: string) => {
    const sale = sales.find((s) => s.id === id);
    if (!sale) return;

    setSales((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'Cancelled' } : s)));

    // Restore stock in products
    const restoredProducts = products.map((p) => {
      const soldItem = sale.items.find((i) => i.productId === p.id);
      if (soldItem) {
        const updatedP = { ...p, stock: p.stock + soldItem.quantity };
        saveProductToRTDB(updatedP).catch(() => {});
        return updatedP;
      }
      return p;
    });

    setProducts(restoredProducts);
    addToast('warning', 'Sale cancelled. Stock restored.');

    try {
      await updateSaleStatusInRTDB(id, 'Cancelled');
    } catch (err) {
      console.error('Failed cancelling sale in Firebase RTDB:', err);
    }

    try {
      await fetch(`/api/sales/${id}/cancel`, { method: 'PUT' });
    } catch {}
  };

  const returnSale = async (id: string) => {
    const sale = sales.find((s) => s.id === id);
    if (!sale) return;

    setSales((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'Returned' } : s)));

    const restoredProducts = products.map((p) => {
      const soldItem = sale.items.find((i) => i.productId === p.id);
      if (soldItem) {
        const updatedP = { ...p, stock: p.stock + soldItem.quantity };
        saveProductToRTDB(updatedP).catch(() => {});
        return updatedP;
      }
      return p;
    });

    setProducts(restoredProducts);
    addToast('warning', 'Processed return. Stock updated.');

    try {
      await updateSaleStatusInRTDB(id, 'Returned');
    } catch (err) {
      console.error('Failed processing return in Firebase RTDB:', err);
    }

    try {
      await fetch(`/api/sales/${id}/return`, { method: 'PUT' });
    } catch {}
  };

  const saveDailyCollection = async (collectionData: Omit<MoneyCollection, 'id'>) => {
    const newCol: MoneyCollection = {
      ...collectionData,
      id: `col-${collectionData.date}`,
    };

    setCollections((prev) => {
      const exists = prev.findIndex((c) => c.date === collectionData.date);
      if (exists !== -1) {
        const copy = [...prev];
        copy[exists] = newCol;
        return copy;
      }
      return [newCol, ...prev];
    });
    addToast('success', t('collectionSaved'));

    try {
      await saveCollectionToRTDB(newCol);
    } catch (err) {
      console.error('Failed saving collection to Firebase RTDB:', err);
    }

    try {
      await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectionData),
      });
    } catch {}
  };

  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };

    setExpenses((prev) => [newExp, ...prev]);
    addToast('success', t('expenseAdded'));

    try {
      await saveExpenseToRTDB(newExp);
    } catch (err) {
      console.error('Failed adding expense to Firebase RTDB:', err);
    }

    try {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
    } catch {}
  };

  const deleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    addToast('success', t('expenseDeleted'));

    try {
      await deleteExpenseFromRTDB(id);
    } catch (err) {
      console.error('Failed deleting expense from Firebase RTDB:', err);
    }

    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const updateBusinessInfo = async (info: Partial<BusinessInfo>) => {
    const updated = { ...businessInfo, ...info };
    setBusinessInfo(updated);
    addToast('success', 'Branch info updated successfully!');

    try {
      await saveBusinessInfoToRTDB(updated);
    } catch (err) {
      console.error('Failed updating business info in Firebase RTDB:', err);
    }

    try {
      await fetch('/api/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      });
    } catch {}
  };

  const restoreBackup = async (data: any) => {
    if (data.products) {
      setProducts(data.products);
      data.products.forEach((p: Product) => saveProductToRTDB(p).catch(() => {}));
    }
    if (data.sales) {
      setSales(data.sales);
      data.sales.forEach((s: Sale) => saveSaleToRTDB(s).catch(() => {}));
    }
    if (data.expenses) {
      setExpenses(data.expenses);
      data.expenses.forEach((e: Expense) => saveExpenseToRTDB(e).catch(() => {}));
    }
    if (data.collections) {
      setCollections(data.collections);
      data.collections.forEach((c: MoneyCollection) => saveCollectionToRTDB(c).catch(() => {}));
    }
    if (data.businessInfo) {
      setBusinessInfo(data.businessInfo);
      saveBusinessInfoToRTDB(data.businessInfo).catch(() => {});
    }

    try {
      await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {}

    addToast('success', 'Database backup restored successfully!');
  };

  const resetAllFinancials = async () => {
    const zeroedProducts = products.map((p) => ({
      ...p,
      purchasePrice: 0,
      sellingPrice: 0,
    }));
    setProducts(zeroedProducts);
    setSales([]);
    setExpenses([]);
    setCollections([]);

    try {
      await resetAllFinancialsToZeroInRTDB();
    } catch (err) {
      console.error('Error resetting Firebase RTDB:', err);
    }

    try {
      await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: zeroedProducts,
          sales: [],
          expenses: [],
          collections: [],
          businessInfo,
        }),
      });
    } catch {}

    addToast('success', 'All financial balances, sales, expenses, and prices reset to 00.00!');
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        theme,
        toggleTheme,
        user,
        isAuthenticated: !!user,
        isFirebaseConnected,
        login,
        logout,
        activeTab,
        setActiveTab,
        dateRange,
        setDateRange,
        products,
        sales,
        expenses,
        collections,
        businessInfo,
        addProduct,
        updateProduct,
        deleteProduct,
        processSale,
        cancelSale,
        returnSale,
        saveDailyCollection,
        addExpense,
        deleteExpense,
        updateBusinessInfo,
        restoreBackup,
        resetAllFinancials,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
