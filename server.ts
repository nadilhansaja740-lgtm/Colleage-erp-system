import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  initialProducts,
  initialSales,
  initialExpenses,
  initialMoneyCollections,
  initialBusinessInfo,
} from './src/data/sampleData.js';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Memory database loaded from db.json or initialized with sampleData
let db = {
  products: initialProducts,
  sales: initialSales,
  expenses: initialExpenses,
  collections: initialMoneyCollections,
  businessInfo: initialBusinessInfo,
};

if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    db = JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json, using defaults:', err);
  }
} else {
  saveDb();
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API ROUTES
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && (password === 'admin123' || password === 'admin')) {
      return res.json({
        success: true,
        user: { id: 'u1', username: 'admin', name: 'System Admin', role: 'admin' },
        token: 'admin-token-minu-shoe-palace',
      });
    }
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  });

  // Business Info
  app.get('/api/business', (req, res) => {
    res.json(db.businessInfo);
  });

  app.put('/api/business', (req, res) => {
    db.businessInfo = { ...db.businessInfo, ...req.body };
    saveDb();
    res.json(db.businessInfo);
  });

  // Products
  app.get('/api/products', (req, res) => {
    res.json(db.products);
  });

  app.post('/api/products', (req, res) => {
    const newProduct = {
      ...req.body,
      id: `prod-${Date.now()}`,
      dateAdded: req.body.dateAdded || new Date().toISOString().split('T')[0],
    };
    db.products.unshift(newProduct);
    saveDb();
    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const index = db.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      db.products[index] = { ...db.products[index], ...req.body };
      saveDb();
      return res.json(db.products[index]);
    }
    res.status(404).json({ message: 'Product not found' });
  });

  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.products = db.products.filter((p) => p.id !== id);
    saveDb();
    res.json({ success: true, id });
  });

  // Sales
  app.get('/api/sales', (req, res) => {
    res.json(db.sales);
  });

  app.post('/api/sales', (req, res) => {
    const saleData = req.body;
    const newSale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      invoiceNo: `INV-2026-${String(db.sales.length + 1).padStart(4, '0')}`,
      timestamp: Date.now(),
      status: 'Completed',
    };

    // Automatically update product stock
    newSale.items.forEach((item: any) => {
      const p = db.products.find((prod) => prod.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    });

    db.sales.unshift(newSale);
    saveDb();
    res.status(201).json(newSale);
  });

  app.put('/api/sales/:id/cancel', (req, res) => {
    const { id } = req.params;
    const sale = db.sales.find((s) => s.id === id);
    if (sale && sale.status === 'Completed') {
      sale.status = 'Cancelled';
      // Restore stock
      sale.items.forEach((item) => {
        const p = db.products.find((prod) => prod.id === item.productId);
        if (p) {
          p.stock += item.quantity;
        }
      });
      saveDb();
      return res.json(sale);
    }
    res.status(400).json({ message: 'Sale not eligible for cancellation' });
  });

  app.put('/api/sales/:id/return', (req, res) => {
    const { id } = req.params;
    const sale = db.sales.find((s) => s.id === id);
    if (sale && sale.status === 'Completed') {
      sale.status = 'Returned';
      // Restore stock
      sale.items.forEach((item) => {
        const p = db.products.find((prod) => prod.id === item.productId);
        if (p) {
          p.stock += item.quantity;
        }
      });
      saveDb();
      return res.json(sale);
    }
    res.status(400).json({ message: 'Sale not eligible for return' });
  });

  // Money Collections
  app.get('/api/collections', (req, res) => {
    res.json(db.collections);
  });

  app.post('/api/collections', (req, res) => {
    const collectionData = req.body;
    const index = db.collections.findIndex((c) => c.date === collectionData.date);
    if (index !== -1) {
      db.collections[index] = { ...db.collections[index], ...collectionData };
    } else {
      db.collections.unshift({
        ...collectionData,
        id: `col-${collectionData.date}`,
      });
    }
    saveDb();
    res.json(db.collections);
  });

  // Expenses
  app.get('/api/expenses', (req, res) => {
    res.json(db.expenses);
  });

  app.post('/api/expenses', (req, res) => {
    const newExpense = {
      ...req.body,
      id: `exp-${Date.now()}`,
    };
    db.expenses.unshift(newExpense);
    saveDb();
    res.status(201).json(newExpense);
  });

  app.delete('/api/expenses/:id', (req, res) => {
    const { id } = req.params;
    db.expenses = db.expenses.filter((e) => e.id !== id);
    saveDb();
    res.json({ success: true, id });
  });

  // Backup & Restore
  app.get('/api/backup', (req, res) => {
    res.json(db);
  });

  app.post('/api/restore', (req, res) => {
    const restored = req.body;
    if (restored && restored.products && restored.sales) {
      db = restored;
      saveDb();
      return res.json({ success: true, message: 'Database restored successfully' });
    }
    res.status(400).json({ message: 'Invalid backup structure' });
  });

  // Vite Middleware in Dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MINU SHOE PALACE Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
