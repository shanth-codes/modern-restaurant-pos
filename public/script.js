/* ─── THE MODERN RESTAURANT — Instant Performance Script (v3.1) ─── */

const API_BASE = (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http'))
  ? `${window.location.origin}/api`
  : 'http://localhost:3000/api';

let isServerOnline = false;

// ── LOCAL FALLBACK & IN-MEMORY STATE STORE ──
const fallbackData = {
  menu: [
    { id: 1, name: 'Idly (2 pcs)', category: 'breakfast', img: 'idly.jpg', desc: 'Two soft steamed rice cakes served with classic Madurai sambar & 3 chutneys.', price: 40, badge: 'Best Seller', available: true },
    { id: 2, name: 'Crispy Medu Vada', category: 'breakfast', img: 'vada.jpg', desc: 'Crispy golden lentil doughnuts tempered with peppercorn & curry leaves.', price: 50, badge: null, available: true },
    { id: 3, name: 'Ghee Ven Pongal', category: 'breakfast', img: 'pongal.jpg', desc: 'Soft fragrant rice & yellow moong porridge drizzled with pure cow ghee & cashews.', price: 60, badge: 'Breakfast Special', available: true },
    { id: 4, name: 'Madurai Masala Dosa', category: 'breakfast', img: 'masaladosa.jpg', desc: 'Crispy fermented crepe filled with aromatic spiced potato onion masala.', price: 100, badge: "Chef's Pick", available: true },
    { id: 5, name: 'Ghee Roast Dosa', category: 'breakfast', img: 'Ghee Roast Dosa.jpg', desc: 'Extra golden-crisp cone dosa generously basted with farm-fresh ghee.', price: 120, badge: null, available: true },
    { id: 6, name: 'Set Dosa (3 pcs)', category: 'breakfast', img: 'Set Dosa (3 pcs).jpg', desc: 'Three soft sponge dosas served with Vadacurry and coconut chutney.', price: 90, badge: null, available: true },
    { id: 7, name: 'Poori Masala (2 pcs)', category: 'mains', img: 'Poori.jpg', desc: 'Fluffy puffed whole wheat breads accompanied by spiced potato sagu.', price: 70, badge: null, available: true },
    { id: 8, name: 'Tangy Lemon Rice', category: 'mains', img: 'Lemon Rice.jpg', desc: 'Aromatic ponni rice tempered with fresh lemon juice, mustard seeds & roasted peanuts.', price: 80, badge: null, available: true },
    { id: 9, name: 'Special Curd Rice', category: 'mains', img: 'Curd Rice.jpg', desc: 'Refreshing chilled curd rice garnished with pomegranate, carrot & raw mango pickle.', price: 75, badge: 'Popular', available: true },
    { id: 10, name: 'Degree Filter Coffee', category: 'beverages', img: 'Filter Coffee.jpg', desc: 'Authentic brass tumbler South Indian filter coffee brewed with chicory blend.', price: 50, badge: 'Must Try', available: true },
    { id: 11, name: 'Madurai Masala Chai', category: 'beverages', img: 'Masala Chai.jpg', desc: 'Steaming hot whole milk tea infused with cardamom, crushed ginger & cloves.', price: 40, badge: null, available: true },
    { id: 12, name: 'Fresh Ginger Tea', category: 'beverages', img: 'Ginger Tea.jpg', desc: 'Warming golden herbal tea with pounded fresh ginger root & country sugar.', price: 35, badge: null, available: true },
    { id: 13, name: 'Mint Green Tea', category: 'beverages', img: 'Green Tea.jpg', desc: 'Organic green tea brewed with fresh garden mint leaves & wild honey.', price: 45, badge: null, available: true }
  ],
  tables: [
    { id: 1, name: "Table 1", seats: 2, status: "available", currentToken: null },
    { id: 2, name: "Table 2", seats: 2, status: "available", currentToken: null },
    { id: 3, name: "Table 3", seats: 4, status: "occupied", currentToken: 101 },
    { id: 4, name: "Table 4", seats: 4, status: "available", currentToken: null },
    { id: 5, name: "Table 5", seats: 6, status: "reserved", currentToken: null },
    { id: 6, name: "Table 6", seats: 6, status: "available", currentToken: null },
    { id: 7, name: "Table 7", seats: 2, status: "billing", currentToken: 102 },
    { id: 8, name: "Table 8", seats: 4, status: "available", currentToken: null },
    { id: 9, name: "Table 9", seats: 4, status: "available", currentToken: null },
    { id: 10, name: "Table 10", seats: 8, status: "available", currentToken: null },
    { id: 11, name: "Table 11", seats: 2, status: "available", currentToken: null },
    { id: 12, name: "Table 12", seats: 4, status: "available", currentToken: null }
  ],
  orders: [
    {
      token: 101, tableId: 3, serverCode: "SRV04", type: "Dine-in",
      items: [{ id: 4, name: "Madurai Masala Dosa", price: 100, qty: 2 }, { id: 10, name: "Degree Filter Coffee", price: 50, qty: 2 }],
      subtotal: 300, cgst: 7.5, sgst: 7.5, total: 315, status: "cooking", createdAt: new Date().toISOString()
    },
    {
      token: 102, tableId: 7, serverCode: "SRV01", type: "Dine-in",
      items: [{ id: 3, name: "Ghee Ven Pongal", price: 60, qty: 1 }, { id: 1, name: "Idly (2 pcs)", price: 40, qty: 2 }],
      subtotal: 140, cgst: 3.5, sgst: 3.5, total: 147, status: "ready", createdAt: new Date().toISOString()
    }
  ]
};

// ── LOCAL STORAGE PERSISTENCE ──
function loadLocalData() {
  try {
    const saved = localStorage.getItem('tmr_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.menu) && parsed.menu.length) fallbackData.menu = parsed.menu;
      if (Array.isArray(parsed.tables) && parsed.tables.length) fallbackData.tables = parsed.tables;
      if (Array.isArray(parsed.orders) && parsed.orders.length) fallbackData.orders = parsed.orders;
    }
  } catch (e) {}
}

function saveLocalData() {
  try {
    localStorage.setItem('tmr_data', JSON.stringify({
      menu: fallbackData.menu,
      tables: fallbackData.tables,
      orders: fallbackData.orders
    }));
  } catch (e) {}
}

loadLocalData();

// ── SERVER STATUS CHECK & AUTO-SYNC ──
async function syncWithServer() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${API_BASE}/menu`, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      isServerOnline = true;
      const remoteMenu = await res.json();
      if (Array.isArray(remoteMenu) && remoteMenu.length > 0) {
        fallbackData.menu = remoteMenu;
      }
      
      const [tRes, oRes] = await Promise.all([
        fetch(`${API_BASE}/tables`).catch(() => null),
        fetch(`${API_BASE}/orders`).catch(() => null)
      ]);
      if (tRes && tRes.ok) {
        const tables = await tRes.json();
        if (Array.isArray(tables) && tables.length) fallbackData.tables = tables;
      }
      if (oRes && oRes.ok) {
        const orders = await oRes.json();
        if (Array.isArray(orders)) fallbackData.orders = orders;
      }

      saveLocalData();

      if (typeof renderCustomerMenu === 'function' && document.getElementById('menuCards')) {
        renderCustomerMenu(currentCategoryFilter);
      }
      if (typeof renderActiveTab === 'function') {
        renderActiveTab();
      }
    }
  } catch (e) {
    isServerOnline = false;
  }
}

syncWithServer();

// ── UNIFIED API CLIENT ──
const apiClient = {
  getMenu() {
    if (!isServerOnline) return Promise.resolve(fallbackData.menu);
    return fetch(`${API_BASE}/menu`).then(r => r.json()).catch(() => fallbackData.menu);
  },

  addMenuItem(item) {
    const newItem = { ...item, id: Date.now() };
    fallbackData.menu.push(newItem);
    saveLocalData();
    if (isServerOnline) {
      fetch(`${API_BASE}/menu`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) }).catch(() => {});
    }
    return Promise.resolve({ success: true, item: newItem });
  },

  deleteMenuItem(id) {
    fallbackData.menu = fallbackData.menu.filter(m => m.id !== id);
    saveLocalData();
    if (isServerOnline) {
      fetch(`${API_BASE}/menu/${id}`, { method: 'DELETE' }).catch(() => {});
    }
    return Promise.resolve({ success: true });
  },

  getTables() {
    if (!isServerOnline) return Promise.resolve(fallbackData.tables);
    return fetch(`${API_BASE}/tables`).then(r => r.json()).catch(() => fallbackData.tables);
  },

  updateTableStatus(id, status, currentToken = null) {
    const idx = fallbackData.tables.findIndex(t => t.id === id);
    if (idx !== -1) {
      fallbackData.tables[idx].status = status;
      fallbackData.tables[idx].currentToken = currentToken;
      saveLocalData();
    }
    if (isServerOnline) {
      fetch(`${API_BASE}/tables/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, currentToken }) }).catch(() => {});
    }
    return Promise.resolve({ success: true });
  },

  getOrders() {
    if (!isServerOnline) return Promise.resolve(fallbackData.orders);
    return fetch(`${API_BASE}/orders`).then(r => r.json()).catch(() => fallbackData.orders);
  },

  getOrder(token) {
    if (isServerOnline) {
      return fetch(`${API_BASE}/orders/${token}`).then(r => r.json()).catch(() => {
        const o = fallbackData.orders.find(ord => ord.token === Number(token));
        return o ? { success: true, order: o } : { success: false };
      });
    }
    const o = fallbackData.orders.find(ord => ord.token === Number(token));
    return Promise.resolve(o ? { success: true, order: o } : { success: false, message: 'Order not found' });
  },

  createOrder(orderPayload) {
    const nextToken = (fallbackData.orders.reduce((max, o) => Math.max(max, o.token || 100), 100)) + 1;
    const subtotal = orderPayload.items.reduce((s, i) => s + (i.price * i.qty), 0);
    const cgst = Math.round(subtotal * 0.025 * 100) / 100;
    const sgst = Math.round(subtotal * 0.025 * 100) / 100;
    const total = Math.round((subtotal + cgst + sgst) * 100) / 100;

    const newOrder = {
      token: nextToken,
      tableId: orderPayload.tableId ? Number(orderPayload.tableId) : null,
      serverCode: orderPayload.serverCode || 'APP',
      type: orderPayload.type || (orderPayload.tableId ? 'Dine-in' : 'Takeaway'),
      paymentMethod: orderPayload.paymentMethod || 'Cash',
      items: orderPayload.items,
      subtotal, cgst, sgst, total,
      status: orderPayload.status || 'pending',
      createdAt: new Date().toISOString()
    };
    fallbackData.orders.push(newOrder);

    if (newOrder.tableId) {
      const tIdx = fallbackData.tables.findIndex(t => t.id === newOrder.tableId);
      if (tIdx !== -1) {
        fallbackData.tables[tIdx].status = 'occupied';
        fallbackData.tables[tIdx].currentToken = nextToken;
      }
    }
    saveLocalData();

    if (isServerOnline) {
      fetch(`${API_BASE}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderPayload) }).catch(() => {});
    }
    return Promise.resolve({ success: true, order: newOrder });
  },

  updateOrderStatus(token, status) {
    const idx = fallbackData.orders.findIndex(o => o.token === token);
    if (idx !== -1) {
      fallbackData.orders[idx].status = status;
      if (status === 'completed' || status === 'cancelled') {
        const tableId = fallbackData.orders[idx].tableId;
        if (tableId) {
          const tIdx = fallbackData.tables.findIndex(t => t.id === tableId);
          if (tIdx !== -1 && fallbackData.tables[tIdx].currentToken === token) {
            fallbackData.tables[tIdx].status = 'available';
            fallbackData.tables[tIdx].currentToken = null;
          }
        }
      }
      saveLocalData();
    }

    if (isServerOnline) {
      fetch(`${API_BASE}/orders/${token}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).catch(() => {});
    }
    return Promise.resolve({ success: true });
  },

  getAnalytics() {
    if (isServerOnline) {
      return fetch(`${API_BASE}/analytics`).then(r => r.json()).catch(() => this.getFallbackAnalytics());
    }
    return Promise.resolve(this.getFallbackAnalytics());
  },

  getFallbackAnalytics() {
    const orders = fallbackData.orders;
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const itemMap = {};
    const catMap = { breakfast: 0, mains: 0, beverages: 0 };
    let totalItems = 0;

    orders.forEach(o => {
      (o.items || []).forEach(item => {
        itemMap[item.name] = (itemMap[item.name] || 0) + item.qty;
        totalItems += item.qty;
        const m = fallbackData.menu.find(menuItem => menuItem.name === item.name);
        const cat = m ? m.category : 'mains';
        if (catMap[cat] !== undefined) catMap[cat] += (item.price * item.qty);
      });
    });

    const topItems = Object.entries(itemMap).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 5);
    return {
      totalRevenue: revenue,
      orderCount: orders.length,
      avgOrderValue: orders.length > 0 ? Math.round(revenue / orders.length) : 0,
      topItems: topItems,
      categorySales: catMap,
      totalItemQty: totalItems
    };
  },

  async login(email, password) {
    if (isServerOnline) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data && data.success) return data;
      } catch (e) {}
    }
    if (password === 'tmr123' || password === 'kitchen1' || password === 'admin123' || password === '123') {
      const role = email.includes('kitchen') ? 'kitchen' : (email.includes('admin') ? 'admin' : 'cashier');
      return Promise.resolve({ success: true, user: { email, name: email.split('@')[0], role } });
    }
    return Promise.resolve({ success: false, message: 'Invalid credentials' });
  }
};

// ── KITCHEN AUDIO SYNTHESIZER ──
function playKitchenBell() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const playNote = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(0.35, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    playNote(587.33, 0, 0.45);
    playNote(880.00, 0.16, 0.85);
  } catch (e) {}
}

// ── TOAST MANAGER ──
function showToast(msg, type = 'info') {
  const stack = document.getElementById('toastStack');
  if (!stack) return;
  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerHTML = `<div class="toast-dot ${type}"></div><span>${msg}</span>`;
  stack.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ── CUSTOMER SITE LOGIC (index.html) ──
let customerCart = {};
let currentCategoryFilter = 'all';
let currentCustomerOrderType = 'Takeaway';

function renderCustomerMenu(filter = 'all') {
  currentCategoryFilter = filter;
  const container = document.getElementById('menuCards');
  if (!container) return;

  const searchQuery = (document.getElementById('customerSearchInput')?.value || '').toLowerCase().trim();
  let items = filter === 'all' ? fallbackData.menu : fallbackData.menu.filter(m => m.category === filter);

  if (searchQuery) {
    items = items.filter(m => m.name.toLowerCase().includes(searchQuery) || (m.desc || '').toLowerCase().includes(searchQuery));
  }

  if (items.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 4rem; color: var(--pos-sub)">No dishes found matching "${searchQuery}".</div>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="mc">
      <div class="mc-img">
        <img src="images/${item.img}" alt="${item.name}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60';">
        ${item.badge ? `<div class="mc-badge">${item.badge}</div>` : ''}
      </div>
      <div class="mc-body">
        <div class="mc-cat">${item.category}</div>
        <div class="mc-name">${item.name}</div>
        <div class="mc-desc">${item.desc || 'Authentic traditional South Indian preparation.'}</div>
        <div class="mc-foot">
          <div class="mc-price">₹${item.price}</div>
          <button class="mc-add-btn" onclick="addToCustomerCart(${item.id})">+ Add to Order</button>
        </div>
      </div>
    </div>
  `).join('');
}

function setCustomerOrderType(type) {
  currentCustomerOrderType = type;
  document.getElementById('orderTypeTakeaway')?.classList.toggle('active', type === 'Takeaway');
  document.getElementById('orderTypeDineIn')?.classList.toggle('active', type === 'Dine-in');
  document.getElementById('customerTableSelectWrap')?.classList.toggle('hidden', type !== 'Dine-in');
}

function addToCustomerCart(itemId) {
  const item = fallbackData.menu.find(m => m.id === itemId);
  if (!item) return;

  if (customerCart[itemId]) {
    customerCart[itemId].qty++;
  } else {
    customerCart[itemId] = { ...item, qty: 1 };
  }
  updateCartBadge();
  showToast(`Added ${item.name} to order`, 'ok');
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const count = Object.values(customerCart).reduce((s, i) => s + i.qty, 0);
  badge.textContent = count;
}

function toggleCartDrawer() {
  const overlay = document.getElementById('cartOverlay');
  if (!overlay) return;
  overlay.classList.toggle('open');
  if (overlay.classList.contains('open')) renderCartDrawer();
}

function renderCartDrawer() {
  const list = document.getElementById('cartItemsList');
  const totalVal = document.getElementById('cartTotalVal');
  if (!list) return;

  const items = Object.values(customerCart);
  if (items.length === 0) {
    list.innerHTML = `
      <div class="cd-empty">
        <div class="cd-empty-icon">🍽</div>
        <div>Your cart is empty. Explore our menu to add items!</div>
      </div>`;
    if (totalVal) totalVal.textContent = '₹0';
    return;
  }

  const total = items.reduce((s, i) => s + (i.price * i.qty), 0);
  if (totalVal) totalVal.textContent = `₹${total}`;

  list.innerHTML = items.map(item => `
    <div class="cd-item">
      <img class="cd-item-img" src="images/${item.img}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=100&auto=format&fit=crop&q=60';">
      <div class="cd-item-info">
        <div class="cd-item-name">${item.name}</div>
        <div class="cd-item-price">₹${item.price}</div>
      </div>
      <div class="cd-qty-ctrl">
        <button class="cd-qty-btn" onclick="changeCustomerCartQty(${item.id}, -1)">−</button>
        <span style="font-size:0.85rem;font-weight:700;color:#fff">${item.qty}</span>
        <button class="cd-qty-btn" onclick="changeCustomerCartQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
}

function changeCustomerCartQty(id, delta) {
  if (customerCart[id]) {
    customerCart[id].qty += delta;
    if (customerCart[id].qty <= 0) delete customerCart[id];
  }
  updateCartBadge();
  renderCartDrawer();
}

function placeCustomerOrder() {
  const items = Object.values(customerCart);
  if (items.length === 0) return;

  const tableId = currentCustomerOrderType === 'Dine-in' ? document.getElementById('customerTableSelect').value : null;

  apiClient.createOrder({
    items: items,
    type: currentCustomerOrderType,
    tableId: tableId,
    status: 'pending'
  }).then(res => {
    if (res && res.success) {
      customerCart = {};
      updateCartBadge();
      toggleCartDrawer();
      showToast(`Order Placed! Token #${res.order.token}`, 'ok');
      
      // Auto open tracker modal with this order token
      openTrackerModal();
      document.getElementById('trackerTokenInput').value = res.order.token;
      trackCustomerOrder();
    }
  });
}

// ── CUSTOMER ORDER TRACKER ──
function openTrackerModal() {
  document.getElementById('trackerModal')?.classList.add('open');
}
function closeTrackerModal() {
  document.getElementById('trackerModal')?.classList.remove('open');
}

function trackCustomerOrder() {
  const tokenVal = document.getElementById('trackerTokenInput')?.value;
  const resultArea = document.getElementById('trackerResultArea');
  if (!tokenVal || !resultArea) return;

  apiClient.getOrder(tokenVal).then(res => {
    if (!res || !res.success || !res.order) {
      resultArea.innerHTML = `
        <div style="text-align:center; padding:2rem; color:var(--fire)">
          Order Token #${tokenVal} not found. Please check your token number.
        </div>`;
      return;
    }

    const o = res.order;
    const statusMap = { 'pending': 1, 'cooking': 2, 'ready': 3, 'completed': 4 };
    const stepLevel = statusMap[o.status] || 1;
    const progressWidth = stepLevel === 1 ? '10%' : stepLevel === 2 ? '40%' : stepLevel === 3 ? '75%' : '100%';

    resultArea.innerHTML = `
      <div class="ot-card">
        <div class="ot-token-header">
          <div>
            <span style="font-size:0.75rem; color:var(--pos-sub); text-transform:uppercase; font-weight:700">Order Ticket</span>
            <div class="ot-token-tag">#${o.token}</div>
          </div>
          <span class="ot-status-badge ${o.status === 'completed' ? 'available' : o.status === 'ready' ? 'billing' : 'occupied'}">${o.status}</span>
        </div>

        <div style="font-size:0.85rem; color:var(--pos-sub); margin-bottom:1rem">
          Type: <strong>${o.type}</strong> ${o.tableId ? `(Table ${o.tableId})` : ''} · Items: <strong>${o.items.length}</strong> · Total: <strong>₹${o.total}</strong>
        </div>

        <!-- Animated Status Timeline -->
        <div class="ot-timeline">
          <div class="ot-progress-line" style="width: ${progressWidth}"></div>
          
          <div class="ot-step ${stepLevel >= 1 ? (stepLevel === 1 ? 'active' : 'done') : ''}">
            <div class="ot-node">${stepLevel > 1 ? '✓' : '1'}</div>
            <div class="ot-step-lbl">Received</div>
          </div>

          <div class="ot-step ${stepLevel >= 2 ? (stepLevel === 2 ? 'active' : 'done') : ''}">
            <div class="ot-node">${stepLevel > 2 ? '✓' : '2'}</div>
            <div class="ot-step-lbl">Cooking 🔥</div>
          </div>

          <div class="ot-step ${stepLevel >= 3 ? (stepLevel === 3 ? 'active' : 'done') : ''}">
            <div class="ot-node">${stepLevel > 3 ? '✓' : '3'}</div>
            <div class="ot-step-lbl">Ready 🔔</div>
          </div>

          <div class="ot-step ${stepLevel >= 4 ? 'done' : ''}">
            <div class="ot-node">${stepLevel >= 4 ? '✓' : '4'}</div>
            <div class="ot-step-lbl">Served</div>
          </div>
        </div>
      </div>
    `;
  });
}

// ── POS SYSTEM LOGIC (pos.html) ──
let currentTicketItems = [];
let activeCategory = 'all';
let activeTabName = 'cashier';
let posPaymentMethod = 'Cash';

function initPosSystem() {
  setInterval(() => {
    const clock = document.getElementById('posClock');
    if (clock) clock.textContent = new Date().toLocaleTimeString();
  }, 1000);

  // Initial Render
  renderActiveTab();
}

function setPosPaymentMethod(method) {
  posPaymentMethod = method;
  document.getElementById('payMethodCash')?.classList.toggle('active', method === 'Cash');
  document.getElementById('payMethodCard')?.classList.toggle('active', method === 'Card');
  document.getElementById('payMethodUpi')?.classList.toggle('active', method === 'UPI');
  document.getElementById('cashCalcPanel')?.classList.toggle('hidden', method !== 'Cash');
}

function calculatePosChange() {
  const tendered = Number(document.getElementById('tenderedAmount')?.value || 0);
  const totalValStr = document.getElementById('tsTotal')?.textContent.replace('₹', '') || '0';
  const total = Number(totalValStr);
  const change = Math.max(0, tendered - total);
  const changeEl = document.getElementById('posChangeVal');
  if (changeEl) changeEl.textContent = `₹${change}`;
}

function switchPosTab(tabName) {
  activeTabName = tabName;
  document.querySelectorAll('.pos-tab').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

  const tabs = ['cashier', 'tables', 'orders', 'kitchen', 'menu', 'analytics'];
  tabs.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    if (el) el.classList.toggle('hidden', t !== tabName);
  });

  renderActiveTab();
}

function renderActiveTab() {
  if (activeTabName === 'cashier') renderPosMenu();
  else if (activeTabName === 'tables') renderTables();
  else if (activeTabName === 'kitchen') renderKitchenKds();
  else if (activeTabName === 'orders') renderLiveOrders();
  else if (activeTabName === 'menu') renderMenuManager();
  else if (activeTabName === 'analytics') renderAnalyticsTab();
  updateAnalytics();
}

function updateAnalytics() {
  const revEl = document.getElementById('abRevenue');
  const ordEl = document.getElementById('abOrders');
  const actEl = document.getElementById('abActive');
  const occEl = document.getElementById('abOccupied');

  const orders = fallbackData.orders;
  const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeCount = orders.filter(o => o.status === 'pending' || o.status === 'cooking').length;

  if (revEl) revEl.textContent = `₹${revenue}`;
  if (ordEl) ordEl.textContent = orders.length;
  if (actEl) actEl.textContent = activeCount;

  const occCount = fallbackData.tables.filter(t => t.status === 'occupied' || t.status === 'billing').length;
  if (occEl) occEl.textContent = `${occCount} / 12`;
}

function setPosCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.mp-cat').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderPosMenu();
}

function filterPosMenu() {
  renderPosMenu();
}

function renderPosMenu() {
  const container = document.getElementById('posMenuGrid');
  if (!container) return;

  const query = (document.getElementById('mpSearch')?.value || '').toLowerCase();
  let items = activeCategory === 'all' ? fallbackData.menu : fallbackData.menu.filter(m => m.category === activeCategory);
  if (query) items = items.filter(m => m.name.toLowerCase().includes(query));

  container.innerHTML = items.map(item => `
    <div class="pos-mc" onclick="addToTicket(${item.id})">
      <img class="pos-mc-img" src="images/${item.img}" alt="${item.name}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=60';">
      <div class="pos-mc-body">
        <div>
          <div class="pos-mc-cat">${item.category}</div>
          <div class="pos-mc-name">${item.name}</div>
        </div>
        <div class="pos-mc-price">₹${item.price}</div>
      </div>
    </div>
  `).join('');
}

function addToTicket(itemId) {
  const item = fallbackData.menu.find(m => m.id === itemId);
  if (!item) return;

  const existing = currentTicketItems.find(i => i.id === itemId);
  if (existing) {
    existing.qty++;
  } else {
    currentTicketItems.push({ id: item.id, name: item.name, price: item.price, img: item.img, qty: 1, note: '' });
  }
  updateTicketUI();
}

function addTicketItemNote(id) {
  const item = currentTicketItems.find(i => i.id === id);
  if (!item) return;
  const note = prompt(`Enter special note for ${item.name}:`, item.note || 'e.g. Extra Spicy, No Ghee');
  if (note !== null) {
    item.note = note.trim();
    updateTicketUI();
  }
}

function updateTicketUI() {
  const container = document.getElementById('ticketItems');
  const subtotalEl = document.getElementById('tsSubtotal');
  const cgstEl = document.getElementById('tsCgst');
  const sgstEl = document.getElementById('tsSgst');
  const totalEl = document.getElementById('tsTotal');
  const sendBtn = document.getElementById('sendKitchenBtn');
  const billBtn = document.getElementById('billOnlyBtn');

  if (currentTicketItems.length === 0) {
    container.innerHTML = `
      <div class="tp-empty">
        <div class="tp-empty-icon">🧾</div>
        <div>Select items from menu to start order</div>
      </div>`;
    if (subtotalEl) subtotalEl.textContent = '₹0';
    if (cgstEl) cgstEl.textContent = '₹0';
    if (sgstEl) sgstEl.textContent = '₹0';
    if (totalEl) totalEl.textContent = '₹0';
    if (sendBtn) sendBtn.disabled = true;
    if (billBtn) billBtn.disabled = true;
    calculatePosChange();
    return;
  }

  if (sendBtn) sendBtn.disabled = false;
  if (billBtn) billBtn.disabled = false;

  const subtotal = currentTicketItems.reduce((s, i) => s + (i.price * i.qty), 0);
  const cgst = Math.round(subtotal * 0.025 * 100) / 100;
  const sgst = Math.round(subtotal * 0.025 * 100) / 100;
  const total = Math.round((subtotal + cgst + sgst) * 100) / 100;

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  if (cgstEl) cgstEl.textContent = `₹${cgst}`;
  if (sgstEl) sgstEl.textContent = `₹${sgst}`;
  if (totalEl) totalEl.textContent = `₹${total}`;

  calculatePosChange();

  container.innerHTML = currentTicketItems.map(item => `
    <div class="tpi-row">
      <div style="display:flex;align-items:center;gap:0.65rem">
        <img src="images/${item.img || 'idly.jpg'}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;background:#182030" onerror="this.style.display='none'">
        <div>
          <div class="tpi-name">${item.name}</div>
          <div class="tpi-price">₹${item.price * item.qty} (₹${item.price} ea)</div>
          ${item.note ? `<span class="tpi-note-tag">Note: ${item.note}</span>` : `<button class="tpi-note-btn" onclick="addTicketItemNote(${item.id})">+ Note</button>`}
        </div>
      </div>
      <div class="tpi-controls">
        <button class="tpi-btn" onclick="changeTicketQty(${item.id}, -1)">−</button>
        <span style="font-size:0.85rem;font-weight:700;color:#fff;padding:0 0.3rem">${item.qty}</span>
        <button class="tpi-btn" onclick="changeTicketQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
}

function changeTicketQty(id, delta) {
  const item = currentTicketItems.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      currentTicketItems = currentTicketItems.filter(i => i.id !== id);
    }
  }
  updateTicketUI();
}

function resetTicket() {
  currentTicketItems = [];
  document.getElementById('serverCode').value = '';
  document.getElementById('tpTableSelect').value = '';
  document.getElementById('tenderedAmount').value = '';
  updateTicketUI();
}

function submitPosOrder(sendToKitchen) {
  if (currentTicketItems.length === 0) return;

  const serverCode = document.getElementById('serverCode').value.trim() || 'SRV01';
  const tableId = document.getElementById('tpTableSelect').value;

  apiClient.createOrder({
    items: currentTicketItems,
    serverCode,
    tableId,
    paymentMethod: posPaymentMethod,
    status: sendToKitchen ? 'cooking' : 'ready'
  }).then(res => {
    if (res && res.success) {
      if (sendToKitchen) playKitchenBell();
      showToast(`Order #${res.order.token} submitted successfully via ${posPaymentMethod}`, 'ok');
      openBillModal(res.order);
      resetTicket();
      renderActiveTab();
    }
  });
}

// ── TABLES RENDER ──
function renderTables() {
  const container = document.getElementById('tablesGrid');
  if (!container) return;

  const tables = fallbackData.tables;
  container.innerHTML = tables.map(table => `
    <div class="tc-card">
      <div class="tc-head">
        <div class="tc-name">${table.name}</div>
        <div class="tc-seats">${table.seats} Seats</div>
      </div>
      <div>
        <span class="tc-status-pill ${table.status}">${table.status}</span>
        ${table.currentToken ? `<div class="tc-token">Token: #${table.currentToken}</div>` : ''}
      </div>
      <div class="tc-actions">
        ${table.status === 'available' ? `<button class="tc-btn" onclick="assignTable(${table.id})">Occupy</button>` : ''}
        ${table.status === 'occupied' ? `<button class="tc-btn" onclick="setTableStatus(${table.id}, 'billing')">Bill</button>` : ''}
        ${table.status !== 'available' ? `<button class="tc-btn" onclick="setTableStatus(${table.id}, 'available')">Clear</button>` : ''}
      </div>
    </div>
  `).join('');
}

function assignTable(tableId) {
  document.getElementById('tpTableSelect').value = tableId;
  switchPosTab('cashier');
  showToast(`Selected Table ${tableId} for current order`, 'info');
}

function setTableStatus(tableId, status) {
  apiClient.updateTableStatus(tableId, status, status === 'available' ? null : undefined);
  renderTables();
  updateAnalytics();
  showToast(`Table ${tableId} set to ${status}`, 'ok');
}

// ── KITCHEN KDS RENDER WITH TIMER AGING ──
function renderKitchenKds() {
  const container = document.getElementById('kitchenGrid');
  const countEl = document.getElementById('kitchenCount');
  if (!container) return;

  const orders = fallbackData.orders;
  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'cooking');

  if (countEl) countEl.textContent = `${activeOrders.length} Active Kitchen Orders`;

  if (activeOrders.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--pos-sub)">No active orders in kitchen queue.</div>`;
    return;
  }

  const now = Date.now();

  container.innerHTML = activeOrders.map(order => {
    const createdTime = new Date(order.createdAt || Date.now()).getTime();
    const elapsedMins = Math.floor((now - createdTime) / 60000);

    let agingClass = '';
    let agePillClass = 'fresh';
    if (elapsedMins >= 10) {
      agingClass = 'aging-critical';
      agePillClass = 'critical';
    } else if (elapsedMins >= 5) {
      agingClass = 'aging-warning';
      agePillClass = 'warning';
    }

    return `
      <div class="kc-card ${agingClass}">
        <div class="kc-head">
          <div>
            <div class="kc-token">#${order.token}</div>
            <div style="font-size:0.72rem; color:var(--pos-sub)">${order.type || 'Dine-in'} ${order.tableId ? `(T${order.tableId})` : ''}</div>
          </div>
          <span class="kc-age-pill ${agePillClass}">⏱ ${elapsedMins}m ago</span>
        </div>
        <div class="kc-body">
          ${(order.items || []).map(item => `
            <div class="kci-row">
              <span><span class="kci-qty">${item.qty}x</span> ${item.name}</span>
              ${item.note ? `<span style="font-size:0.75rem; color:var(--gold); font-style:italic">(${item.note})</span>` : ''}
            </div>
          `).join('')}
        </div>
        <div class="kc-foot">
          <button class="kc-action-btn" onclick="advanceOrderStatus(${order.token}, '${order.status}')">
            ${order.status === 'pending' ? 'Start Cooking 🔥' : 'Mark Ready ✓'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function advanceOrderStatus(token, currentStatus) {
  const nextStatus = currentStatus === 'pending' ? 'cooking' : 'ready';
  apiClient.updateOrderStatus(token, nextStatus);
  showToast(`Order #${token} status updated to ${nextStatus}`, 'ok');
  renderActiveTab();
}

// ── LIVE ORDERS RENDER ──
function renderLiveOrders() {
  const container = document.getElementById('ordersGrid');
  const countLbl = document.getElementById('ordersCountLbl');
  if (!container) return;

  const orders = fallbackData.orders;
  if (countLbl) countLbl.textContent = `${orders.length} Total Orders`;

  container.innerHTML = orders.map(order => `
    <div class="oc-card">
      <div class="oc-head">
        <div class="oc-token">Token #${order.token}</div>
        <span class="tc-status-pill ${order.status === 'completed' ? 'available' : order.status === 'ready' ? 'billing' : 'occupied'}">${order.status}</span>
      </div>
      <div style="font-size:0.8rem;color:var(--pos-sub)">
        Type: ${order.type} | Payment: ${order.paymentMethod || 'Cash'} | Server: ${order.serverCode}
      </div>
      <div style="font-size:0.85rem;color:#FFF;border-y:1px solid var(--pos-border);padding:0.5rem 0">
        ${(order.items || []).map(i => `${i.qty}x ${i.name}`).join(', ')}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="oc-total">₹${order.total}</div>
        <button class="tc-btn" onclick="fetchAndPrintBill(${order.token})">Receipt</button>
      </div>
    </div>
  `).join('');
}

function fetchAndPrintBill(token) {
  const order = fallbackData.orders.find(o => o.token === token);
  if (order) openBillModal(order);
}

// ── MENU MANAGER RENDER ──
function renderMenuManager() {
  const body = document.getElementById('mmgrBody');
  if (!body) return;

  const menu = fallbackData.menu;
  body.innerHTML = menu.map(item => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:0.75rem">
          <img src="images/${item.img}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;background:#182030" onerror="this.src='https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=100&auto=format&fit=crop&q=60';">
          <strong>${item.name}</strong>
        </div>
      </td>
      <td><span style="text-transform:uppercase;font-size:0.75rem;color:var(--gold);font-weight:600">${item.category}</span></td>
      <td>₹${item.price}</td>
      <td>${item.badge ? `<span style="font-size:0.75rem;color:var(--go);font-weight:600">${item.badge}</span>` : '—'}</td>
      <td><span style="color:${item.available !== false ? 'var(--go)' : 'var(--fire)'}">${item.available !== false ? 'Active' : 'Disabled'}</span></td>
      <td>
        <button class="tc-btn" style="color:var(--fire)" onclick="deleteItem(${item.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

// ── ANALYTICS TAB RENDER ──
function renderAnalyticsTab() {
  apiClient.getAnalytics().then(data => {
    document.getElementById('anTotalRevenue').textContent = `₹${data.totalRevenue || 0}`;
    document.getElementById('anAvgTicket').textContent = `₹${data.avgOrderValue || 0}`;
    document.getElementById('anTotalOrders').textContent = data.orderCount || 0;
    document.getElementById('anTotalItems').textContent = data.totalItemQty || 0;

    // Render Top Items SVG Bar Chart
    const chartContainer = document.getElementById('topItemsChart');
    if (chartContainer) {
      const topItems = data.topItems || [];
      const maxQty = Math.max(...topItems.map(i => i.qty), 1);

      chartContainer.innerHTML = topItems.map(item => {
        const heightPct = Math.round((item.qty / maxQty) * 100);
        return `
          <div class="bar-col">
            <div class="bar-fill" style="height: ${heightPct}%">
              <div class="bar-val">${item.qty}</div>
            </div>
            <div class="bar-label" title="${item.name}">${item.name}</div>
          </div>
        `;
      }).join('');
    }

    // Render Category Revenue Progress Bars
    const catList = document.getElementById('catSalesList');
    if (catList) {
      const catSales = data.categorySales || { breakfast: 0, mains: 0, beverages: 0 };
      const totalCatSales = Math.max(Object.values(catSales).reduce((a, b) => a + b, 0), 1);

      const categories = [
        { key: 'breakfast', name: 'Breakfast Items', colorClass: 'breakfast' },
        { key: 'mains', name: 'Main Courses & Rice', colorClass: 'mains' },
        { key: 'beverages', name: 'Beverages & Coffee', colorClass: 'beverages' }
      ];

      catList.innerHTML = categories.map(cat => {
        const amount = catSales[cat.key] || 0;
        const pct = Math.round((amount / totalCatSales) * 100);
        return `
          <div class="cpl-item">
            <div class="cpl-row">
              <span>${cat.name}</span>
              <span style="color:var(--gold)">₹${amount} (${pct}%)</span>
            </div>
            <div class="cpl-track">
              <div class="cpl-fill ${cat.colorClass}" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  });
}

function openItemModal() {
  document.getElementById('itemModal').classList.add('open');
}
function closeItemModal() {
  document.getElementById('itemModal').classList.remove('open');
}

function saveMenuItem() {
  const name = document.getElementById('imName').value.trim();
  const category = document.getElementById('imCat').value;
  const price = Number(document.getElementById('imPrice').value);
  const badge = document.getElementById('imBadge').value.trim() || null;

  if (!name || !price) {
    showToast('Please fill in item name and price', 'err');
    return;
  }

  apiClient.addMenuItem({ name, category, price, badge, available: true }).then(() => {
    closeItemModal();
    showToast(`Added ${name} to menu`, 'ok');
    renderActiveTab();
  });
}

function deleteItem(id) {
  if (confirm('Are you sure you want to delete this menu item?')) {
    apiClient.deleteMenuItem(id).then(() => {
      showToast('Menu item deleted', 'info');
      renderActiveTab();
    });
  }
}

// ── BILL MODAL ──
function openBillModal(order) {
  document.getElementById('bmToken').textContent = `#${order.token}`;
  document.getElementById('bmDate').textContent = new Date(order.createdAt || Date.now()).toLocaleTimeString();
  document.getElementById('bmServer').textContent = order.serverCode || 'SRV01';
  document.getElementById('bmType').textContent = order.type || 'Dine-in';

  document.getElementById('bmItems').innerHTML = (order.items || []).map(i => `
    <div class="bm-item-row">
      <span>${i.qty}x ${i.name} ${i.note ? `(${i.note})` : ''}</span>
      <span>₹${i.price * i.qty}</span>
    </div>
  `).join('');

  document.getElementById('bmSub').textContent = `₹${order.subtotal}`;
  document.getElementById('bmCgst').textContent = `₹${order.cgst}`;
  document.getElementById('bmSgst').textContent = `₹${order.sgst}`;
  document.getElementById('bmTotal').textContent = `₹${order.total}`;

  document.getElementById('billModal').classList.add('open');
}

function closeBillModal() {
  document.getElementById('billModal').classList.remove('open');
}

