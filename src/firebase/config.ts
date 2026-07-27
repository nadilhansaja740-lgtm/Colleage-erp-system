import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';

export const DEFAULT_DATABASE_URL = "https://erp-system-9cb39-default-rtdb.asia-southeast1.firebasedatabase.app/";

export interface CustomFirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const getStoredConfig = (): CustomFirebaseConfig => {
  try {
    const saved = localStorage.getItem('college_erp_firebase_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse saved firebase config', e);
  }
  return {};
};

const stored = getStoredConfig();

export const defaultFirebaseConfig = {
  apiKey: stored.apiKey || "AIzaSyD-ERP-System-DemoKeyForLocalTesting123",
  authDomain: stored.authDomain || "erp-system-9cb39.firebaseapp.com",
  databaseURL: stored.databaseURL || DEFAULT_DATABASE_URL,
  projectId: stored.projectId || "erp-system-9cb39",
  storageBucket: stored.storageBucket || "erp-system-9cb39.firebasestorage.app",
  messagingSenderId: stored.messagingSenderId || "848483001288",
  appId: stored.appId || "1:848483001288:web:78a1c93b1d2e"
};

let app: FirebaseApp;

try {
  if (!getApps().length) {
    app = initializeApp(defaultFirebaseConfig);
  } else {
    app = getApp();
  }
} catch (error) {
  console.warn('Firebase initialization warning:', error);
  app = initializeApp(defaultFirebaseConfig, 'college-erp-app');
}

export const auth: Auth = getAuth(app);
export const db: Database = getDatabase(app, defaultFirebaseConfig.databaseURL);

export const saveCustomFirebaseConfig = (config: CustomFirebaseConfig) => {
  try {
    localStorage.setItem('college_erp_firebase_config', JSON.stringify(config));
    window.location.reload();
  } catch (e) {
    console.error('Error saving firebase config', e);
  }
};

export const clearCustomFirebaseConfig = () => {
  try {
    localStorage.removeItem('college_erp_firebase_config');
    window.location.reload();
  } catch (e) {
    console.error('Error clearing firebase config', e);
  }
};
