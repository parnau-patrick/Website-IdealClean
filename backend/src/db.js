const Database = require('better-sqlite3')
const path = require('path')
const bcrypt = require('bcryptjs')

// În Docker, DATA_DIR = /app/data (volum persistent)
// Local, folosim directorul src/ ca înainte
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '..')
const dbPath = path.join(DATA_DIR, 'database.sqlite')
const db = new Database(dbPath)

// Setup schema
db.pragma('journal_mode = WAL')

// Create Products Table
db.prepare(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    price REAL NOT NULL,
    oldPrice REAL,
    category TEXT,
    stock INTEGER DEFAULT 0,
    shortDescription TEXT,
    description TEXT,
    features TEXT, -- JSON array
    bundles TEXT, -- JSON array
    images TEXT, -- JSON array
    landingConfig TEXT, -- JSON object
    reviews TEXT, -- JSON array
    active INTEGER DEFAULT 1,
    createdAt TEXT
  )
`).run()

// Create Users Table
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    createdAt TEXT
  )
`).run()

// Auto-migrate if needed
try { db.prepare("ALTER TABLE products ADD COLUMN landingConfig TEXT").run() } catch(e) {}
try { db.prepare("ALTER TABLE products ADD COLUMN reviews TEXT").run() } catch(e) {}
try { db.prepare("ALTER TABLE products ADD COLUMN config TEXT").run() } catch(e) {}

// Create Orders Table
db.prepare(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer TEXT, -- JSON object
    items TEXT, -- JSON array
    subtotal REAL,
    shipping REAL,
    total REAL,
    status TEXT DEFAULT 'nou',
    paymentMethod TEXT,
    awb TEXT,
    invoiceNumber TEXT,
    notes TEXT,
    statusHistory TEXT, -- JSON array
    createdAt TEXT,
    updatedAt TEXT
  )
`).run()

// Create Abandoned Checkouts Table
db.prepare(`
  CREATE TABLE IF NOT EXISTS abandoned_checkouts (
    id TEXT PRIMARY KEY, -- phone number
    customer TEXT,
    items TEXT,
    shipping REAL,
    total REAL,
    shopifyDraftId TEXT,
    status TEXT DEFAULT 'pending', -- pending, synced, ordered
    exitIntent INTEGER DEFAULT 0,
    lastActivity TEXT,
    createdAt TEXT
  )
`).run()

// Auto-migrate: add exitIntent column for existing databases
try { db.prepare("ALTER TABLE abandoned_checkouts ADD COLUMN exitIntent INTEGER DEFAULT 0").run() } catch(_) {}

// Create Settings Table
db.prepare(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`).run()

// Initialize default settings if they don't exist
try {
  db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('facebookPixelId', '')").run()
} catch(_) {}

// Helper functions for reading/writing JSON fields transparently
const getProducts = () => {
  const rows = db.prepare('SELECT * FROM products ORDER BY createdAt DESC').all()
  return rows.map(r => ({
    ...r,
    active: r.active === 1,
    features: JSON.parse(r.features || '[]'),
    bundles: JSON.parse(r.bundles || '[]'),
    images: JSON.parse(r.images || '[]'),
    landingConfig: JSON.parse(r.landingConfig || 'null'),
    reviews: JSON.parse(r.reviews || '[]'),
    config: JSON.parse(r.config || '{"showDiscount": true, "showBestSeller": true}')
  }))
}

const seedProducts = () => {
  const count = db.prepare('SELECT COUNT(*) as count FROM products').get().count
  if (count === 0) {
    const DEFAULT_PRODUCTS = [
      {
        id: 'prod_001', name: 'Detergent Universal IdealClean', slug: 'detergent-universal',
        price: 49.99, oldPrice: 79.99, description: 'Formula concentrată pentru curățenie perfectă. Elimină 99.9% din bacterii și lasă un parfum proaspăt de durată.',
        shortDescription: 'Curățenie impecabilă pentru întreaga casă.', features: ['Formula concentrată — randament dublu', 'Elimină 99.9% bacterii', 'Parfum proaspăt de lungă durată', 'Sigur pentru toate suprafețele', 'Biodegradabil & Eco-friendly'],
        images: [], stock: 150, category: 'Curățenie', active: true, createdAt: new Date().toISOString(),
        bundles: [
          { qty: 1, label: '1x buc', price: 49.99, oldPrice: 79.99, badge: '', badgeColor: 'bg-slate-500' },
          { qty: 2, label: '2x buc', price: 79.00, oldPrice: 99.98, badge: 'CEL MAI CUMPĂRAT', badgeColor: 'bg-amber-500' },
          { qty: 3, label: '3x buc', price: 99.00, oldPrice: 149.97, badge: 'CEL MAI RENTABIL', badgeColor: 'bg-red-500' }
        ]
      },
      {
        id: 'prod_002', name: 'Spray Dezinfectant Multi-Suprafețe', slug: 'spray-dezinfectant',
        price: 34.99, oldPrice: 54.99, description: 'Spray dezinfectant cu acțiune rapidă. Ideal pentru bucătărie, baie și orice suprafață din casă.',
        shortDescription: 'Dezinfectare rapidă pentru toată casa.', features: ['Acțiune rapidă în 30 secunde', 'Fără clătire necesară', 'Parfum fresh lavandă', 'Nu lasă urme', 'Spray ergonomic 360°'],
        images: [], stock: 200, category: 'Dezinfectanți', active: true, createdAt: new Date().toISOString(),
        bundles: [
          { qty: 1, label: '1x buc', price: 34.99, oldPrice: 54.99, badge: '', badgeColor: 'bg-slate-500' },
          { qty: 2, label: '2x buc', price: 59.00, oldPrice: 69.98, badge: 'RECOMANDAT', badgeColor: 'bg-[#0077B6]' },
          { qty: 3, label: '3x buc', price: 75.00, oldPrice: 104.97, badge: 'OFERTA ZILEI', badgeColor: 'bg-emerald-500' }
        ]
      },
    ]

    const stmt = db.prepare(`INSERT INTO products (id, name, slug, price, oldPrice, category, stock, shortDescription, description, features, bundles, images, landingConfig, reviews, active, createdAt) 
      VALUES (@id, @name, @slug, @price, @oldPrice, @category, @stock, @shortDescription, @description, @features, @bundles, @images, @landingConfig, @reviews, @active, @createdAt)`)
    
    const insertMany = db.transaction((prods) => {
      for (const p of prods) {
        stmt.run({
          ...p,
          features: JSON.stringify(p.features || []),
          bundles: JSON.stringify(p.bundles || []),
          images: JSON.stringify(p.images || []),
          landingConfig: JSON.stringify(p.landingConfig || null),
          reviews: JSON.stringify(p.reviews || []),
          active: p.active ? 1 : 0
        })
      }
    })
    insertMany(DEFAULT_PRODUCTS)
    console.log('Seeded database with default products.')
  }
}

seedProducts()

const seedUsers = async () => {
  const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || 'admin1234'
  const count = db.prepare('SELECT COUNT(*) as count FROM users').get().count
  if (count === 0) {
    const hashedPassword = await bcrypt.hash(initialPassword, 10)
    db.prepare('INSERT INTO users (id, username, password, role, createdAt) VALUES (?, ?, ?, ?, ?)')
      .run('u_001', 'admin', hashedPassword, 'admin', new Date().toISOString())
  } else if (process.env.INITIAL_ADMIN_PASSWORD) {
    // Dacă am schimbat-o în .env, forțăm actualizarea o singură dată
    const hashedPassword = await bcrypt.hash(initialPassword, 10)
    db.prepare('UPDATE users SET password = ? WHERE username = ?').run(hashedPassword, 'admin')
  }
}

seedUsers()

module.exports = {
  db,
  getProducts
}
