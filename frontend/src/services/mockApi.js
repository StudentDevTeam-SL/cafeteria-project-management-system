import api, { setAuthToken } from './api.js';

// ─── Toggle ────────────────────────────────────────────────────────────────
const USE_MOCK = true;
const MOCK_DELAY = 600; // ms — simulates real network latency

const delay = (ms = MOCK_DELAY) => new Promise((r) => setTimeout(r, ms));

// ─── Mock Database ──────────────────────────────────────────────────────────

export const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Drinks', 'Snacks', 'Desserts'];

let mockMenuItems = [
  { id: 1,  name: 'Avocado Toast',        category: 'Breakfast', price: 8.50,  description: 'Sourdough toast with smashed avocado, cherry tomatoes & a poached egg.', emoji: '🥑', available: true, popular: true },
  { id: 2,  name: 'Eggs Benedict',         category: 'Breakfast', price: 12.00, description: 'English muffin with Canadian bacon, poached eggs & hollandaise sauce.', emoji: '🍳', available: true, popular: false },
  { id: 3,  name: 'Granola Bowl',          category: 'Breakfast', price: 7.50,  description: 'House granola with Greek yogurt, fresh berries & honey drizzle.', emoji: '🥣', available: true, popular: true },
  { id: 4,  name: 'Pancake Stack',         category: 'Breakfast', price: 9.00,  description: 'Fluffy buttermilk pancakes with maple syrup & fresh fruit.', emoji: '🥞', available: true, popular: false },
  { id: 5,  name: 'Grilled Chicken Wrap', category: 'Lunch',     price: 11.00, description: 'Grilled chicken, lettuce, tomato, cheese & chipotle mayo in a flour tortilla.', emoji: '🌯', available: true, popular: true },
  { id: 6,  name: 'Caesar Salad',          category: 'Lunch',     price: 9.50,  description: 'Romaine lettuce, parmesan, croutons & house-made Caesar dressing.', emoji: '🥗', available: true, popular: false },
  { id: 7,  name: 'Beef Burger',           category: 'Lunch',     price: 13.00, description: 'Juicy beef patty with lettuce, tomato, pickles, onion & special sauce.', emoji: '🍔', available: true, popular: true },
  { id: 8,  name: 'Veggie Bowl',           category: 'Lunch',     price: 10.00, description: 'Brown rice, roasted vegetables, chickpeas & tahini dressing.', emoji: '🍲', available: true, popular: false },
  { id: 9,  name: 'Fresh Orange Juice',   category: 'Drinks',    price: 4.50,  description: 'Freshly squeezed Valencia oranges, served chilled.', emoji: '🍊', available: true, popular: true },
  { id: 10, name: 'Cappuccino',            category: 'Drinks',    price: 4.00,  description: 'Double espresso with steamed milk foam, lightly dusted with cocoa.', emoji: '☕', available: true, popular: true },
  { id: 11, name: 'Green Tea',             category: 'Drinks',    price: 3.50,  description: 'Japanese sencha green tea, served hot or iced.', emoji: '🍵', available: true, popular: false },
  { id: 12, name: 'Mineral Water',         category: 'Drinks',    price: 2.00,  description: 'Sparkling or still, 500 ml bottle.', emoji: '💧', available: true, popular: false },
  { id: 13, name: 'Chocolate Muffin',     category: 'Snacks',    price: 3.50,  description: 'Double chocolate chip muffin, baked fresh every morning.', emoji: '🧁', available: true, popular: false },
  { id: 14, name: 'Fruit Cup',             category: 'Snacks',    price: 4.00,  description: 'Seasonal fresh fruit with mint & lime zest.', emoji: '🍓', available: true, popular: false },
  { id: 15, name: 'Chocolate Lava Cake',  category: 'Desserts',  price: 6.50,  description: 'Warm chocolate cake with molten centre, served with vanilla ice cream.', emoji: '🍫', available: true, popular: true },
  { id: 16, name: 'Ice Cream Sundae',     category: 'Desserts',  price: 5.50,  description: 'Three scoops of artisan ice cream with toppings of your choice.', emoji: '🍨', available: true, popular: false },
];

let mockOrders = [
  {
    id: 'ORD-001',
    userId: 'user1',
    items: [
      { id: 7, name: 'Beef Burger', emoji: '🍔', price: 13.00, qty: 2 },
      { id: 9, name: 'Fresh Orange Juice', emoji: '🍊', price: 4.50,  qty: 1 },
    ],
    total: 30.50,
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    note: '',
  },
  {
    id: 'ORD-002',
    userId: 'user1',
    items: [
      { id: 1,  name: 'Avocado Toast', emoji: '🥑', price: 8.50, qty: 1 },
      { id: 10, name: 'Cappuccino',    emoji: '☕', price: 4.00, qty: 1 },
    ],
    total: 12.50,
    status: 'pending',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    note: 'Extra shot please',
  },
  {
    id: 'ORD-003',
    userId: 'user1',
    items: [
      { id: 6,  name: 'Caesar Salad', emoji: '🥗', price: 9.50, qty: 1 },
      { id: 11, name: 'Green Tea',    emoji: '🍵', price: 3.50, qty: 1 },
    ],
    total: 13.00,
    status: 'in-progress',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    note: '',
  },
];

let orderIdCounter = 4;

const mockUsers = [
  { id: 'user1',  email: 'user@cafe.com',  password: 'password123', name: 'Alex Johnson', role: 'customer', avatar: '👤' },
  { id: 'admin1', email: 'admin@cafe.com', password: 'admin123',    name: 'Sam Admin',    role: 'admin',    avatar: '🛡️' },
];

// ─── Auth ───────────────────────────────────────────────────────────────────

export async function login(email, password) {
  if (USE_MOCK) {
    await delay(800);
    const user = mockUsers.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    const { password: _, ...safeUser } = user;
    return { token, user: safeUser };
  }
  const res = await api.post('/auth/login/', { email, password });
  return res.data;
}

// ─── Menu ───────────────────────────────────────────────────────────────────

export async function getMenu() {
  if (USE_MOCK) {
    await delay();
    return [...mockMenuItems];
  }
  const res = await api.get('/menu/');
  return res.data;
}

export async function addMenuItem(item) {
  if (USE_MOCK) {
    await delay();
    const newItem = { ...item, id: Date.now(), available: true };
    mockMenuItems.push(newItem);
    return newItem;
  }
  const res = await api.post('/menu/', item);
  return res.data;
}

export async function updateMenuItem(id, updates) {
  if (USE_MOCK) {
    await delay(400);
    mockMenuItems = mockMenuItems.map((m) => (m.id === id ? { ...m, ...updates } : m));
    return mockMenuItems.find((m) => m.id === id);
  }
  const res = await api.patch(`/menu/${id}/`, updates);
  return res.data;
}

export async function deleteMenuItem(id) {
  if (USE_MOCK) {
    await delay(400);
    mockMenuItems = mockMenuItems.filter((m) => m.id !== id);
    return { success: true };
  }
  await api.delete(`/menu/${id}/`);
  return { success: true };
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export async function getOrders() {
  if (USE_MOCK) {
    await delay();
    return [...mockOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  const res = await api.get('/orders/');
  return res.data;
}

export async function placeOrder(orderData) {
  if (USE_MOCK) {
    await delay(1200);
    const order = {
      id: `ORD-00${orderIdCounter++}`,
      userId: 'user1',
      items: orderData.items,
      total: orderData.total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      note: orderData.note || '',
    };
    mockOrders.unshift(order);
    return order;
  }
  const res = await api.post('/orders/', orderData);
  return res.data;
}

export async function updateOrderStatus(id, status) {
  if (USE_MOCK) {
    await delay(400);
    mockOrders = mockOrders.map((o) => (o.id === id ? { ...o, status } : o));
    return mockOrders.find((o) => o.id === id);
  }
  const res = await api.patch(`/orders/${id}/`, { status });
  return res.data;
}

// ─── Analytics (Admin) ──────────────────────────────────────────────────────

export async function getAnalytics() {
  if (USE_MOCK) {
    await delay();
    const todayOrders = mockOrders.filter((o) => {
      const d = new Date(o.createdAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    });
    const pending   = mockOrders.filter((o) => o.status === 'pending').length;
    const inProgress = mockOrders.filter((o) => o.status === 'in-progress').length;
    const completed = mockOrders.filter((o) => o.status === 'completed').length;
    const revenue   = mockOrders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.total, 0);

    const itemCounts = {};
    mockOrders.forEach((o) =>
      o.items.forEach((i) => { itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty; })
    );
    const topItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      totalOrders:   mockOrders.length,
      todayOrders:   todayOrders.length,
      pendingOrders: pending,
      inProgressOrders: inProgress,
      completedOrders: completed,
      totalRevenue:  revenue,
      menuItemCount: mockMenuItems.length,
      topItems,
    };
  }
  const res = await api.get('/analytics/');
  return res.data;
}
