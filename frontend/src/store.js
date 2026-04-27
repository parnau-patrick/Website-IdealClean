// ============================================================
// IdealClean Store — localStorage data layer
// ============================================================

const KEYS = {
  products: 'idealclean_products',
  orders: 'idealclean_orders',
  cart: 'idealclean_cart',
  nextOrderId: 'idealclean_next_order_id',
};

function _get(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function _set(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const DEFAULT_PRODUCTS = [
  {
    id: 'prod_001',
    name: 'Detergent Universal IdealClean',
    slug: 'detergent-universal',
    price: 49.99,
    oldPrice: 79.99,
    description: 'Formula concentrată pentru curățenie perfectă. Elimină 99.9% din bacterii și lasă un parfum proaspăt de durată.',
    shortDescription: 'Curățenie impecabilă pentru întreaga casă.',
    features: ['Formula concentrată — randament dublu', 'Elimină 99.9% bacterii', 'Parfum proaspăt de lungă durată', 'Sigur pentru toate suprafețele', 'Biodegradabil & Eco-friendly'],
    images: [],
    stock: 150,
    category: 'Curățenie',
    active: true,
    bundles: [
      { qty: 1, label: '1x buc', price: 49.99, oldPrice: 79.99, badge: '', badgeColor: 'bg-slate-500' },
      { qty: 2, label: '2x buc', price: 79.00, oldPrice: 99.98, badge: 'CEL MAI CUMPĂRAT', badgeColor: 'bg-amber-500' },
      { qty: 3, label: '3x buc', price: 99.00, oldPrice: 149.97, badge: 'CEL MAI RENTABIL', badgeColor: 'bg-red-500' }
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_002',
    name: 'Spray Dezinfectant Multi-Suprafețe',
    slug: 'spray-dezinfectant',
    price: 34.99,
    oldPrice: 54.99,
    description: 'Spray dezinfectant cu acțiune rapidă. Ideal pentru bucătărie, baie și orice suprafață din casă.',
    shortDescription: 'Dezinfectare rapidă pentru toată casa.',
    features: ['Acțiune rapidă în 30 secunde', 'Fără clătire necesară', 'Parfum fresh lavandă', 'Nu lasă urme', 'Spray ergonomic 360°'],
    images: [],
    stock: 200,
    category: 'Dezinfectanți',
    active: true,
    bundles: [
      { qty: 1, label: '1x buc', price: 34.99, oldPrice: 54.99, badge: '', badgeColor: 'bg-slate-500' },
      { qty: 2, label: '2x buc', price: 59.00, oldPrice: 69.98, badge: 'RECOMANDAT', badgeColor: 'bg-[#0077B6]' },
      { qty: 3, label: '3x buc', price: 75.00, oldPrice: 104.97, badge: 'OFERTA ZILEI', badgeColor: 'bg-emerald-500' }
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_003',
    name: 'Set Complet Curățenie Profesională',
    slug: 'set-complet-curatenie',
    price: 129.99,
    oldPrice: 199.99,
    description: 'Pachet complet cu 5 produse profesionale pentru întreaga casă. Tot ce ai nevoie într-un singur set.',
    shortDescription: 'Tot ce ai nevoie pentru o casă strălucitoare.',
    features: ['Include 5 produse profesionale', 'Economisești 35% față de individual', 'Livrare gratuită', 'Ambalaj premium cadou', 'Ghid de curățenie inclus'],
    images: [],
    stock: 75,
    category: 'Seturi',
    active: true,
    bundles: [
      { qty: 1, label: '1x Set (5 produse)', price: 129.99, oldPrice: 199.99, badge: '', badgeColor: 'bg-slate-500' },
      { qty: 2, label: '2x Seturi (Pachet Complet XXL)', price: 199.00, oldPrice: 259.98, badge: 'OFERTĂ SPECIALĂ', badgeColor: 'bg-red-500' }
    ],
    createdAt: new Date().toISOString(),
  }
];

export function initStore() {
  if (!_get(KEYS.products)) _set(KEYS.products, DEFAULT_PRODUCTS);
  if (!_get(KEYS.orders)) _set(KEYS.orders, []);
  if (!_get(KEYS.cart)) _set(KEYS.cart, []);
  if (!_get(KEYS.nextOrderId)) _set(KEYS.nextOrderId, 1001);
}

// ---- Products ----
export function getProducts() { return _get(KEYS.products) || []; }
export function getActiveProducts() { return getProducts().filter(p => p.active); }
export function getProduct(id) { return getProducts().find(p => p.id === id) || null; }

export function addProduct(product) {
  const products = getProducts();
  product.id = 'prod_' + Date.now();
  product.createdAt = new Date().toISOString();
  product.active = true;
  product.bundles = product.bundles || [
    { qty: 1, label: '1x buc', price: product.price || 0, oldPrice: product.oldPrice || null, badge: '', badgeColor: 'bg-slate-500' }
  ];
  products.push(product);
  _set(KEYS.products, products);
  return product;
}

export function updateProduct(id, updates) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...updates };
  _set(KEYS.products, products);
  return products[idx];
}

export function deleteProduct(id) {
  _set(KEYS.products, getProducts().filter(p => p.id !== id));
}

// ---- Cart ----
export function getCart() { return _get(KEYS.cart) || []; }

export function addToCart(productId, quantity = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.productId === productId);
  if (existing) existing.quantity += quantity;
  else cart.push({ productId, quantity });
  _set(KEYS.cart, cart);
  return cart;
}

export function removeFromCart(productId) {
  _set(KEYS.cart, getCart().filter(i => i.productId !== productId));
}

export function clearCart() { _set(KEYS.cart, []); }

export function getCartTotal() {
  const cart = getCart();
  const products = getProducts();
  let total = 0, itemCount = 0;
  cart.forEach(item => {
    const p = products.find(pr => pr.id === item.productId);
    if (p) { total += p.price * item.quantity; itemCount += item.quantity; }
  });
  return { total, itemCount };
}

// ---- Orders ----
export function getOrders() { return _get(KEYS.orders) || []; }
export function getOrder(id) { return getOrders().find(o => o.id === id) || null; }

export function createOrder(customerData, cartItems) {
  const orders = getOrders();
  const products = getProducts();
  let nextId = _get(KEYS.nextOrderId) || 1001;

  const items = cartItems.map(item => {
    const p = products.find(pr => pr.id === item.productId);
    return { productId: item.productId, name: p?.name || '?', price: p?.price || 0, quantity: item.quantity, subtotal: (p?.price || 0) * item.quantity };
  });

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const shipping = subtotal >= 150 ? 0 : 19.99;

  const order = {
    id: `IC-${nextId}`, customer: customerData, items, subtotal, shipping, total: subtotal + shipping,
    status: 'nou', paymentMethod: customerData.paymentMethod || 'ramburs',
    awb: null, invoiceNumber: null, notes: '',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    statusHistory: [{ status: 'nou', date: new Date().toISOString(), note: 'Comandă plasată' }]
  };

  orders.unshift(order);
  _set(KEYS.orders, orders);
  _set(KEYS.nextOrderId, nextId + 1);
  clearCart();
  return order;
}

export function addOrder(orderData) {
  const orders = getOrders();
  let nextId = _get(KEYS.nextOrderId) || 1001;

  const order = {
    id: `IC-${nextId}`,
    ...orderData,
    status: 'nou',
    paymentMethod: orderData.customer?.paymentMethod || 'ramburs',
    awb: null, 
    invoiceNumber: null, 
    notes: '',
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString(),
    statusHistory: [{ status: 'nou', date: new Date().toISOString(), note: 'Comandă plasată (Direct)' }]
  };

  orders.unshift(order);
  _set(KEYS.orders, orders);
  _set(KEYS.nextOrderId, nextId + 1);
  return order;
}

export function updateOrderStatus(orderId, newStatus, note = '') {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return null;
  order.status = newStatus;
  order.updatedAt = new Date().toISOString();
  order.statusHistory.push({ status: newStatus, date: new Date().toISOString(), note });
  _set(KEYS.orders, orders);
  return order;
}

export function getStats() {
  const orders = getOrders();
  const products = getProducts();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
  const monthOrders = orders.filter(o => new Date(o.createdAt) >= thisMonth);

  return {
    totalOrders: orders.length, todayOrders: todayOrders.length, monthOrders: monthOrders.length,
    todayRevenue: todayOrders.reduce((s, o) => s + o.total, 0),
    monthRevenue: monthOrders.reduce((s, o) => s + o.total, 0),
    totalProducts: products.length, activeProducts: products.filter(p => p.active).length,
    pendingOrders: orders.filter(o => ['nou', 'confirmat'].includes(o.status)).length,
    shippedOrders: orders.filter(o => o.status === 'expediat').length,
  };
}

initStore();
