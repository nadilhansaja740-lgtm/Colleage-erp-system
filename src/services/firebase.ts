/// <reference types="vite/client" />

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  set,
  remove,
  update,
  get,
} from 'firebase/database';
import {
  Product,
  Sale,
  Expense,
  MoneyCollection,
  BusinessInfo,
} from '../types';
import {
  initialProducts,
  initialSales,
  initialExpenses,
  initialMoneyCollections,
  initialBusinessInfo,
} from '../data/sampleData';

const DATABASE_URL =
  import.meta.env.VITE_FIREBASE_DATABASE_URL ||
  'https://minu-sha-default-rtdb.asia-southeast1.firebasedatabase.app/';

const firebaseConfig = {
  databaseURL: DATABASE_URL,
  projectId: 'minu-sha',
};

// Initialize Firebase App & Realtime Database
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const rtdb = getDatabase(app, DATABASE_URL);

// Helper to convert Firebase object or array to array
function objToArray<T>(data: any): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  return Object.values(data);
}

// 1. Products Realtime Subscriptions & Actions
export function subscribeProducts(callback: (products: Product[]) => void) {
  const productsRef = ref(rtdb, 'products');
  return onValue(productsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      callback(objToArray<Product>(data));
    } else {
      // Seed initial data if empty
      seedInitialProducts();
      callback(initialProducts);
    }
  }, (err) => {
    console.warn('Firebase RTDB Products error:', err);
  });
}

export async function saveProductToRTDB(product: Product) {
  const productRef = ref(rtdb, `products/${product.id}`);
  await set(productRef, product);
}

export async function deleteProductFromRTDB(productId: string) {
  const productRef = ref(rtdb, `products/${productId}`);
  await remove(productRef);
}

// 2. Sales Realtime Subscriptions & Actions
export function subscribeSales(callback: (sales: Sale[]) => void) {
  const salesRef = ref(rtdb, 'sales');
  return onValue(salesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list = objToArray<Sale>(data);
      list.sort((a, b) => b.timestamp - a.timestamp);
      callback(list);
    } else {
      seedInitialSales();
      callback(initialSales);
    }
  }, (err) => {
    console.warn('Firebase RTDB Sales error:', err);
  });
}

export async function saveSaleToRTDB(sale: Sale) {
  const saleRef = ref(rtdb, `sales/${sale.id}`);
  await set(saleRef, sale);
}

export async function updateSaleStatusInRTDB(saleId: string, status: 'Completed' | 'Cancelled' | 'Returned') {
  const saleRef = ref(rtdb, `sales/${saleId}`);
  await update(saleRef, { status });
}

// 3. Expenses Realtime Subscriptions & Actions
export function subscribeExpenses(callback: (expenses: Expense[]) => void) {
  const expensesRef = ref(rtdb, 'expenses');
  return onValue(expensesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list = objToArray<Expense>(data);
      callback(list);
    } else {
      seedInitialExpenses();
      callback(initialExpenses);
    }
  }, (err) => {
    console.warn('Firebase RTDB Expenses error:', err);
  });
}

export async function saveExpenseToRTDB(expense: Expense) {
  const expenseRef = ref(rtdb, `expenses/${expense.id}`);
  await set(expenseRef, expense);
}

export async function deleteExpenseFromRTDB(expenseId: string) {
  const expenseRef = ref(rtdb, `expenses/${expenseId}`);
  await remove(expenseRef);
}

// 4. Money Collections Subscriptions & Actions
export function subscribeCollections(callback: (collections: MoneyCollection[]) => void) {
  const collectionsRef = ref(rtdb, 'collections');
  return onValue(collectionsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list = objToArray<MoneyCollection>(data);
      callback(list);
    } else {
      seedInitialCollections();
      callback(initialMoneyCollections);
    }
  }, (err) => {
    console.warn('Firebase RTDB Collections error:', err);
  });
}

export async function saveCollectionToRTDB(collection: MoneyCollection) {
  const collectionRef = ref(rtdb, `collections/${collection.id}`);
  await set(collectionRef, collection);
}

// 5. Business Info Subscriptions & Actions
export function subscribeBusinessInfo(callback: (info: BusinessInfo) => void) {
  const bizRef = ref(rtdb, 'businessInfo');
  return onValue(bizRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      seedInitialBusinessInfo();
      callback(initialBusinessInfo);
    }
  }, (err) => {
    console.warn('Firebase RTDB BusinessInfo error:', err);
  });
}

export async function saveBusinessInfoToRTDB(info: BusinessInfo) {
  const bizRef = ref(rtdb, 'businessInfo');
  await set(bizRef, info);
}

// 6. Connection status listener
export function subscribeConnectionStatus(callback: (isConnected: boolean) => void) {
  const connectedRef = ref(rtdb, '.info/connected');
  return onValue(connectedRef, (snap) => {
    callback(snap.val() === true);
  });
}

// Reset All Financials and Product Prices to 0 in Firebase RTDB
export async function resetAllFinancialsToZeroInRTDB() {
  const productsSnapshot = await get(ref(rtdb, 'products'));
  if (productsSnapshot.exists()) {
    const data = productsSnapshot.val();
    const prods = objToArray<Product>(data);
    const zeroedProds: Record<string, Product> = {};
    prods.forEach((p) => {
      zeroedProds[p.id] = {
        ...p,
        purchasePrice: 0,
        sellingPrice: 0,
      };
    });
    await set(ref(rtdb, 'products'), zeroedProds);
  } else {
    await seedInitialProducts();
  }

  await remove(ref(rtdb, 'sales'));
  await remove(ref(rtdb, 'expenses'));
  await remove(ref(rtdb, 'collections'));
}

// Seeding Helpers
async function seedInitialProducts() {
  const productsObj: Record<string, Product> = {};
  initialProducts.forEach((p) => {
    productsObj[p.id] = p;
  });
  await set(ref(rtdb, 'products'), productsObj);
}

async function seedInitialSales() {
  const salesObj: Record<string, Sale> = {};
  initialSales.forEach((s) => {
    salesObj[s.id] = s;
  });
  await set(ref(rtdb, 'sales'), salesObj);
}

async function seedInitialExpenses() {
  const expensesObj: Record<string, Expense> = {};
  initialExpenses.forEach((e) => {
    expensesObj[e.id] = e;
  });
  await set(ref(rtdb, 'expenses'), expensesObj);
}

async function seedInitialCollections() {
  const colObj: Record<string, MoneyCollection> = {};
  initialMoneyCollections.forEach((c) => {
    colObj[c.id] = c;
  });
  await set(ref(rtdb, 'collections'), colObj);
}

async function seedInitialBusinessInfo() {
  await set(ref(rtdb, 'businessInfo'), initialBusinessInfo);
}
