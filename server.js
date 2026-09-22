const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Determine writable DB path.
// On Vercel / AWS Lambda, the root deployment directory is read-only.
// We write to /tmp/db.json and seed it from data/db.json on first run.
const SEED_DB_FILE = path.join(__dirname, 'data', 'db.json');
const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.LAMBDA_TASK_ROOT;
const DB_FILE = isServerless ? path.join('/tmp', 'db.json') : SEED_DB_FILE;

// Utility to read DB
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      if (fs.existsSync(SEED_DB_FILE)) {
        const seed = fs.readFileSync(SEED_DB_FILE, 'utf8');
        try {
          const dir = path.dirname(DB_FILE);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(DB_FILE, seed, 'utf8');
        } catch (e) {
          // If /tmp is not writable for any reason, continue with memory
        }
        return JSON.parse(seed);
      }
      return { users: [], menu: [], tables: [], orders: [] };
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database:', err);
    try {
      if (fs.existsSync(SEED_DB_FILE)) {
        return JSON.parse(fs.readFileSync(SEED_DB_FILE, 'utf8'));
      }
    } catch (e) {}
    return { users: [], menu: [], tables: [], orders: [] };
  }
}

// Utility to write DB
function writeDB(data) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database:', err);
  }
}

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const apiRouter = express.Router();

// ── AUTH ENDPOINTS ──
apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase() && u.pass === password);
  if (user) {
    res.json({ success: true, user: { email: user.email, name: user.name, role: user.role } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// ── MENU ENDPOINTS ──
apiRouter.get('/menu', (req, res) => {
  const db = readDB();
  res.json(db.menu || []);
});

apiRouter.post('/menu', (req, res) => {
  const db = readDB();
  const newItem = {
    id: Date.now(),
    name: req.body.name || 'New Item',
    category: req.body.category || 'mains',
    img: req.body.img || 'food-placeholder.jpg',
    desc: req.body.desc || '',
    price: Number(req.body.price) || 0,
    badge: req.body.badge || null,
    available: req.body.available !== false
  };
  db.menu.push(newItem);
  writeDB(db);
  res.json({ success: true, item: newItem });
});

apiRouter.put('/menu/:id', (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  const idx = db.menu.findIndex(m => m.id === id);
  if (idx !== -1) {
    db.menu[idx] = { ...db.menu[idx], ...req.body };
    writeDB(db);
    res.json({ success: true, item: db.menu[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Item not found' });
  }
});

apiRouter.delete('/menu/:id', (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  db.menu = db.menu.filter(m => m.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// ── TABLE ENDPOINTS ──
apiRouter.get('/tables', (req, res) => {
  const db = readDB();
  res.json(db.tables || []);
});

apiRouter.patch('/tables/:id', (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  const idx = db.tables.findIndex(t => t.id === id);
  if (idx !== -1) {
    db.tables[idx] = { ...db.tables[idx], ...req.body };
    writeDB(db);
    res.json({ success: true, table: db.tables[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Table not found' });
  }
});

// ── ORDERS ENDPOINTS ──
apiRouter.get('/orders', (req, res) => {
  const db = readDB();
  res.json(db.orders || []);
});

apiRouter.get('/orders/:token', (req, res) => {
  const db = readDB();
  const token = Number(req.params.token);
  const order = (db.orders || []).find(o => o.token === token);
  if (order) {
    res.json({ success: true, order });
  } else {
    res.status(404).json({ success: false, message: 'Order not found' });
  }
});

apiRouter.post('/orders', (req, res) => {
  const db = readDB();
  const maxToken = db.orders.reduce((max, o) => Math.max(max, o.token || 100), 100);
  const nextToken = maxToken + 1;

  const items = req.body.items || [];
  const subtotal = items.reduce((s, item) => s + (item.price * item.qty), 0);
  const cgst = Math.round(subtotal * 0.025 * 100) / 100;
  const sgst = Math.round(subtotal * 0.025 * 100) / 100;
  const total = Math.round((subtotal + cgst + sgst) * 100) / 100;

  const newOrder = {
    token: nextToken,
    tableId: req.body.tableId ? Number(req.body.tableId) : null,
    serverCode: req.body.serverCode || 'APP',
    type: req.body.type || (req.body.tableId ? 'Dine-in' : 'Takeaway'),
    paymentMethod: req.body.paymentMethod || 'Cash',
    items: items,
    subtotal: subtotal,
    cgst: cgst,
    sgst: sgst,
    total: total,
    status: req.body.status || 'pending',
    createdAt: new Date().toISOString()
  };

  db.orders.push(newOrder);

  // If assigned to a table, update table status
  if (newOrder.tableId) {
    const tIdx = db.tables.findIndex(t => t.id === newOrder.tableId);
    if (tIdx !== -1) {
      db.tables[tIdx].status = 'occupied';
      db.tables[tIdx].currentToken = nextToken;
    }
  }

  writeDB(db);
  res.json({ success: true, order: newOrder });
});

apiRouter.patch('/orders/:token/status', (req, res) => {
  const db = readDB();
  const token = Number(req.params.token);
  const { status } = req.body;
  const idx = db.orders.findIndex(o => o.token === token);
  if (idx !== -1) {
    db.orders[idx].status = status;

    // Clear table status if order completed or cancelled
    if (status === 'completed' || status === 'cancelled') {
      const tableId = db.orders[idx].tableId;
      if (tableId) {
        const tIdx = db.tables.findIndex(t => t.id === tableId);
        if (tIdx !== -1 && db.tables[tIdx].currentToken === token) {
          db.tables[tIdx].status = 'available';
          db.tables[tIdx].currentToken = null;
        }
      }
    }

    writeDB(db);
    res.json({ success: true, order: db.orders[idx] });
  } else {
    res.status(404).json({ success: false, message: 'Order not found' });
  }
});

// ── ANALYTICS ENDPOINT ──
apiRouter.get('/analytics', (req, res) => {
  const db = readDB();
  const orders = db.orders || [];
  const menu = db.menu || [];
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'ready' || o.status === 'cooking' || o.status === 'pending');
  const revenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const orderCount = orders.length;
  const avgOrderValue = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

  // Calculate item popularity and category breakdown
  const itemMap = {};
  const catMap = { breakfast: 0, mains: 0, beverages: 0 };
  let totalItemQty = 0;

  orders.forEach(o => {
    (o.items || []).forEach(item => {
      itemMap[item.name] = (itemMap[item.name] || 0) + item.qty;
      totalItemQty += item.qty;

      // Find item category
      const menuItem = menu.find(m => m.name === item.name || m.id === item.id);
      const cat = menuItem ? menuItem.category : 'mains';
      if (catMap[cat] !== undefined) {
        catMap[cat] += (item.price * item.qty);
      } else {
        catMap[cat] = (item.price * item.qty);
      }
    });
  });

  const topItems = Object.entries(itemMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  res.json({
    totalRevenue: revenue,
    orderCount: orderCount,
    avgOrderValue: avgOrderValue,
    topItems: topItems,
    categorySales: catMap,
    totalItemQty: totalItemQty
  });
});

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes on both /api and / so rewrites work seamlessly
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Start server if run directly (local node server.js)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`The Modern Restaurant server running at http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless function
module.exports = app;
