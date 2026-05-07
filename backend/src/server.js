require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const { db, getProducts } = require('./db')

const app = express()
const server = http.createServer(app)

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// Global: max 200 request-uri per IP la 15 minute
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Prea multe request-uri. Încearcă din nou mai târziu.' },
})

// Comenzi: max 5 comenzi per IP la 15 minute
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Prea multe comenzi trimise. Încearcă din nou în 15 minute.' },
})

// Tracking abandonat: max 20 per IP la 5 minute
const trackLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: { error: 'Prea multe request-uri de tracking.' },
})

// Auth: max 10 încercări per IP la 15 minute (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Prea multe încercări de autentificare. Încearcă din nou în 15 minute.' },
})

app.use(globalLimiter)

// ── Shopify config ────────────────────────────────────────────────────────────
const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-04'
// Fișier persistent pentru token — în volumul Docker /app/data (supraviețuiește restart-urilor)
const TOKEN_FILE = path.join(process.env.DATA_DIR || path.join(__dirname, '../data'), 'shopify_token.json')

let _cachedToken = process.env.SHOPIFY_ACCESS_TOKEN || null
let _tokenExpiresAt = _cachedToken ? Date.now() + 23 * 60 * 60 * 1000 : 0

// Citește tokenul salvat anterior din volum (la startup)
function loadTokenFromFile() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'))
      if (data.token && data.expiresAt && Date.now() < data.expiresAt - 60_000) {
        _cachedToken = data.token
        _tokenExpiresAt = data.expiresAt
      }
    }
  } catch (_) { }
}

// Salvează tokenul în volumul persistent (supraviețuiește restart Docker)
function saveTokenToFile(token, expiresAt) {
  try {
    fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true })
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token, expiresAt }), 'utf8')
  } catch (_) { }
}

// Inițializare — citim tokenul la pornire
loadTokenFromFile()

// ── Token management ──────────────────────────────────────────────────────────
async function getShopifyToken() {
  // Token din cache valabil → îl folosim
  if (_cachedToken && Date.now() < _tokenExpiresAt - 60_000) {
    return _cachedToken
  }

  if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
    if (_cachedToken) return _cachedToken
    throw new Error('Shopify credentials not configured')
  }

  try {
    const resp = await fetch(`https://${SHOPIFY_STORE_URL}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
      }),
    });

    const data = await resp.json();
    if (!resp.ok || !data.access_token) {
      console.error('❌ [AUTH] Token Fetch Failed:', data);
      throw new Error('Nu s-a putut obține tokenul Shopify');
    }

    _cachedToken = data.access_token;
    _tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
    saveTokenToFile(_cachedToken, _tokenExpiresAt);
    return _cachedToken;
  } catch (e) {
    console.error('💥 [AUTH] Critical Error:', e.message);
    if (_cachedToken) return _cachedToken;
    throw e;
  }
}

// ── Customer: găsește sau creează ─────────────────────────────────────────────
async function findOrCreateShopifyCustomer(customer, token) {
  const baseUrl = `https://${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}`
  const rawPhone = (customer.phone || '').replace(/\s/g, '')
  const intlPhone = rawPhone.startsWith('0')
    ? '+4' + rawPhone
    : rawPhone.startsWith('+') ? rawPhone : '+40' + rawPhone

  const addressPayload = {
    first_name: customer.firstName || '',
    last_name: customer.lastName || '',
    address1: customer.address || '',
    city: customer.city || '',
    province: customer.county || '',
    country: 'Romania',
    phone: intlPhone,
  }

  async function updateCustomerAddress(customerId) {
    try {
      const addrResp = await fetch(
        `${baseUrl}/customers/${customerId}/addresses.json?limit=1`,
        { headers: { 'X-Shopify-Access-Token': token } }
      )
      if (!addrResp.ok) return
      const addrData = await addrResp.json()
      if (addrData.addresses?.length > 0) {
        await fetch(`${baseUrl}/customers/${customerId}/addresses/${addrData.addresses[0].id}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
          body: JSON.stringify({ address: addressPayload }),
        })
      } else {
        await fetch(`${baseUrl}/customers/${customerId}/addresses.json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
          body: JSON.stringify({ address: addressPayload }),
        })
      }
    } catch (_) { }
  }

  // Caută după telefon (ambele formate)
  for (const q of [intlPhone, rawPhone]) {
    try {
      const r = await fetch(
        `${baseUrl}/customers/search.json?query=phone:${encodeURIComponent(q)}&limit=1`,
        { headers: { 'X-Shopify-Access-Token': token } }
      )
      if (r.ok) {
        const d = await r.json()
        if (d.customers?.length > 0) {
          const found = d.customers[0]
          await updateCustomerAddress(found.id)
          return `gid://shopify/Customer/${found.id}`
        }
      }
    } catch (_) { }
  }

  // Creează client nou
  try {
    const createResp = await fetch(`${baseUrl}/customers.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({
        customer: {
          first_name: customer.firstName || '',
          last_name: customer.lastName || '',
          phone: intlPhone,
          addresses: [addressPayload],
          send_email_welcome: false,
        }
      }),
    })
    const createData = await createResp.json()

    if (createResp.ok && createData.customer?.id) {
      return `gid://shopify/Customer/${createData.customer.id}`
    }

    // Telefon deja luat → caută din nou
    if (JSON.stringify(createData.errors || '').includes('already been taken')) {
      const retryResp = await fetch(
        `${baseUrl}/customers/search.json?query=phone:${encodeURIComponent(intlPhone)}&limit=1`,
        { headers: { 'X-Shopify-Access-Token': token } }
      )
      if (retryResp.ok) {
        const retryData = await retryResp.json()
        if (retryData.customers?.length > 0) {
          await updateCustomerAddress(retryData.customers[0].id)
          return `gid://shopify/Customer/${retryData.customers[0].id}`
        }
      }
    }
  } catch (_) { }

  return null
}

// ── Creare Draft Order (checkout abandonat) ─────────────────────────────────────
async function createShopifyDraft(items, shipping, customer) {
  const token = await getShopifyToken()
  const baseUrl = `https://${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}`

  const lineItems = (items || []).map(item => {
    const vId = item.shopifyVariantId || item.productShopifyVariantId || null
    const numericId = vId && typeof vId === 'string' && vId.includes('/') ? vId.split('/').pop() : vId
    const label = item.bundleLabel ? ` (${item.bundleLabel})` : ''

    const payload = {}
    if (numericId) {
      payload.variant_id = parseInt(numericId)
      payload.quantity = item.qty || 1
    } else {
      payload.title = `${item.productName || 'Produs'}${label}`
      payload.price = (item.price / (item.qty || 1)).toFixed(2)
      payload.quantity = item.qty || 1
    }

    if (item.color) {
      payload.properties = [{ name: 'Culoare', value: item.color }]
    }

    return payload
  })

  // Date client — adăugate la draft pentru a fi vizibile în Shopify Admin
  const rawPhone = ((customer?.phone || '')).replace(/\s/g, '')
  const intlPhone = rawPhone.startsWith('40') ? '+' + rawPhone
    : rawPhone.startsWith('0') ? '+4' + rawPhone
      : rawPhone.startsWith('+') ? rawPhone
        : '+40' + rawPhone

  const draftPayload = {
    line_items: lineItems,
    shipping_line: {
      title: Number(shipping) > 0 ? 'Transport RAPID' : 'Transport GRATUIT',
      price: Number(shipping).toFixed(2),
      custom: true,
    },
    tags: 'idealclean,draft',
    send_invoice: false,
  }

  // Adăugăm datele clientului dacă există
  if (customer?.firstName) {
    const firstName = customer.firstName || ''
    const lastName = customer.lastName || firstName  // dacă lipsește lastName, duplicăm firstName

    const address = {
      first_name: firstName,
      last_name: lastName,
      phone: intlPhone,
      address1: customer.address || '',
      city: customer.city || '',
      province: customer.county || '',
      country: 'Romania',
      country_code: 'RO',
    }
    draftPayload.shipping_address = address
    draftPayload.customer = {
      first_name: firstName,
      last_name: lastName,
      phone: intlPhone,
    }
  }

  const resp = await fetch(`${baseUrl}/draft_orders.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ draft_order: draftPayload }),
  })
  const data = await resp.json()
  if (!resp.ok) throw new Error(`Draft create error: ${resp.status} ${JSON.stringify(data.errors)}`)
  return data.draft_order?.id
}

// ── Completare Draft → comandă reală ─────────────────────────────────────────
async function completeShopifyDraft(draftId, orderData) {
  const token = await getShopifyToken()
  const baseUrl = `https://${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}`
  const { customer, items, shipping, total } = orderData

  const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
  const shippingTitle = Number(shipping) > 0 ? 'Transport RAPID' : 'Transport GRATUIT'

  const rawPhone = (customer.phone || '').replace(/\D/g, '')
  const intlPhone = rawPhone.startsWith('40') ? '+' + rawPhone : (rawPhone.startsWith('0') ? '+4' + rawPhone : '+40' + rawPhone)

  const customerGid = await findOrCreateShopifyCustomer(customer, token)
  const customerNumId = customerGid ? customerGid.split('/').pop() : null

  const firstName = customer.firstName || 'Client'
  const lastName = customer.lastName || firstName

  const address = {
    first_name: firstName,
    last_name: lastName,
    address1: customer.address || '',
    city: customer.city || '',
    province: customer.county || '',
    country: 'Romania',
    country_code: 'RO',
    phone: intlPhone,
  }

  const lineItems = (items || []).map(item => {
    const vId = item.shopifyVariantId || item.productShopifyVariantId || null
    const numericId = vId && typeof vId === 'string' && vId.includes('/') ? vId.split('/').pop() : vId
    const label = item.bundleLabel ? ` (${item.bundleLabel})` : ''

    if (numericId) {
      return {
        variant_id: parseInt(numericId),
        quantity: item.qty || 1
      }
    }
    return {
      title: `${item.productName || 'Produs'}${label}`,
      price: (item.price / (item.qty || 1)).toFixed(2),
      quantity: item.qty || 1,
    }
  })

  // Actualizează draft-ul cu datele finale ale clientului
  await fetch(`${baseUrl}/draft_orders/${draftId}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      draft_order: {
        line_items: lineItems,
        shipping_address: address,
        billing_address: address,
        customer: customerNumId ? { id: parseInt(customerNumId), email: customer.email || null } : {
          first_name: firstName,
          last_name: lastName,
          phone: intlPhone,
          email: customer.email || null,
        },
        shipping_line: { title: shippingTitle, price: Number(shipping).toFixed(2), custom: true },
        tags: 'idealclean',
      }
    }),
  })

  // Completează draft → comandă reală COD
  const completeResp = await fetch(
    `${baseUrl}/draft_orders/${draftId}/complete.json?payment_pending=true`,
    { method: 'PUT', headers: { 'X-Shopify-Access-Token': token } }
  )
  const completeData = await completeResp.json()
  if (!completeResp.ok) throw new Error(`Draft complete error: ${completeResp.status}`)

  return {
    id: completeData.draft_order?.order_id,
    name: completeData.draft_order?.name,
  }
}

async function createShopifyOrder(orderData) {
  const { customer, items, shipping, total } = orderData
  const token = await getShopifyToken()
  const baseUrl = `https://${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}`
  const shippingTitle = Number(shipping) > 0 ? 'Transport RAPID' : 'Transport GRATUIT'
  const rawPhone = (customer.phone || '').replace(/\D/g, '')
  const intlPhone = rawPhone.startsWith('40') ? '+' + rawPhone : (rawPhone.startsWith('0') ? '+4' + rawPhone : '+40' + rawPhone)

  const customerGid = await findOrCreateShopifyCustomer(customer, token)
  const customerNumId = customerGid ? customerGid.split('/').pop() : null

  let totalOriginal = 0
  let totalQty = 0
  const lineItems = (items || []).map(item => {
    const vId = item.shopifyVariantId || item.productShopifyVariantId || null
    const numericId = vId && typeof vId === 'string' && vId.includes('/') ? vId.split('/').pop() : vId
    const label = item.bundleLabel ? ` (${item.bundleLabel})` : ''

    const qty = Number(item.qty || 1)
    totalQty += qty

    // Pentru 1 singur produs, trimitem prețul final direct (fără linie de discount separat)
    // Pentru mai multe bucăți, trimitem prețul mare + linie de Discount (ca în poză)
    const priceToUse = (qty > 1 && item.originalUnitPrice)
      ? Number(item.originalUnitPrice).toFixed(2)
      : (item.price / qty).toFixed(2)

    totalOriginal += Number(priceToUse) * qty

    const payload = {
      quantity: qty,
      price: priceToUse,
    }

    if (numericId) {
      payload.variant_id = parseInt(numericId)
    } else {
      payload.title = `${item.productName || 'Produs'}${label}`
    }

    if (item.color) {
      payload.properties = [{ name: 'Culoare', value: item.color }]
    }

    return payload
  })

  // Calculăm discount-ul DOAR dacă avem mai mult de o bucată
  const calculatedDiscount = (totalQty > 1)
    ? Math.max(0, totalOriginal - (total - Number(shipping))).toFixed(2)
    : "0.00"


  const firstName = customer.firstName || 'Client'
  const lastName = customer.lastName || firstName

  const address = {
    first_name: firstName,
    last_name: lastName,
    address1: customer.address || '',
    city: customer.city || '',
    province: customer.county || '',
    country: 'Romania',
    country_code: 'RO',
    phone: intlPhone,
  }

  const resp = await fetch(`${baseUrl}/orders.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      order: {
        email: customer.email || null,
        phone: intlPhone,

        shipping_address: address,
        billing_address: address,

        customer: customerNumId ? { id: parseInt(customerNumId), email: customer.email || null } : {
          first_name: firstName,
          last_name: lastName,
          phone: intlPhone,
          email: customer.email || null,
        },

        line_items: lineItems,

        shipping_lines: [{
          title: shippingTitle,
          price: Number(shipping).toFixed(2),
          code: 'RAPID',
          source: 'custom',
        }],

        ...(Number(calculatedDiscount) > 0.01 ? {
          discount_codes: [{
            code: 'QUANTITY DISCOUNT',
            amount: calculatedDiscount,
            type: 'fixed_amount'
          }]
        } : {}),

        transactions: [{
          kind: 'sale',
          status: 'pending',
          gateway: 'cash_on_delivery',
          amount: Number(total).toFixed(2),
        }],

        note_attributes: [
          { name: 'Nume și prenume', value: `${firstName} ${lastName}` },
          { name: 'Telefon', value: intlPhone },
          { name: 'Adresa', value: customer.address || '' },
          { name: 'Judet', value: customer.county || '' },
          { name: 'Localitate', value: customer.city || '' },
          { name: 'country', value: 'RO' },
          ...(orderData.tracking?.utm_source ? [{ name: 'utm_source', value: orderData.tracking.utm_source }] : []),
          ...(orderData.tracking?.utm_medium ? [{ name: 'utm_medium', value: orderData.tracking.utm_medium }] : []),
          ...(orderData.tracking?.utm_campaign ? [{ name: 'utm_campaign', value: orderData.tracking.utm_campaign }] : []),
          ...(orderData.tracking?.utm_term ? [{ name: 'utm_term', value: orderData.tracking.utm_term }] : []),
          ...(orderData.tracking?.utm_content ? [{ name: 'utm_content', value: orderData.tracking.utm_content }] : []),
          ...(orderData.tracking?.utm_id ? [{ name: 'utm_id', value: orderData.tracking.utm_id }] : []),
          ...(orderData.tracking?.full_url ? [{ name: 'full_url', value: orderData.tracking.full_url }] : []),
          { name: 'IP Address', value: orderData.clientIp || '' },
          { name: 'xconnector-key', value: 'nm9ajM64D9' }
        ],

        currency: 'RON',
        financial_status: 'pending',
        send_receipt: false,
        send_fulfillment_receipt: false,
        tags: 'idealclean',
      }
    }),
  })
  const data = await resp.json()
  if (!resp.ok) {
    console.error('❌ [SHOPIFY ERROR] Details:', JSON.stringify(data.errors || data, null, 2))
    throw new Error(`Shopify order error: ${resp.status}`)
  }
  return { id: data.order.id, name: `#${data.order.order_number}` }
}

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:4173',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true,
  }
})

io.on('connection', (socket) => {
  socket.on('viewing_product', (productId) => socket.join(`product_${productId}`))
})

// ── Middleware ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000

// Previne crash-ul serverului la erori necaptate în async callbacks (ex: Shopify sync)
process.on('unhandledRejection', (reason) => {
  console.error('⚠️  [UNHANDLED REJECTION] Eroare necaptată — serverul continuă:', reason?.message || reason)
})
process.on('uncaughtException', (err) => {
  console.error('⚠️  [UNCAUGHT EXCEPTION] Eroare necaptată — serverul continuă:', err.message)
})

// Origini permise — adaugă domeniul tău de producție aici
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
].filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
    callback(new Error(`CORS: Origin ${origin} not allowed`))
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}

app.use(helmet({                    // Security headers automate
  crossOriginEmbedderPolicy: false, // necesar pentru assets externe (imagini)
  contentSecurityPolicy: false,     // dezactivat — frontend-ul are inline styles
}))
app.use(cors(corsOptions))
app.use(express.json({ limit: '1mb' })) // redus de la 5mb la 1mb

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET nu este setat în .env! Oprire server.')
  process.exit(1)
}

// ── Auth Middleware ──────────────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ error: 'Autentificare necesară' })

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalid sau expirat' })
    req.user = user
    next()
  })
}

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /api/auth/login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { username, password } = req.body
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
    if (!user) return res.status(401).json({ error: 'Utilizator sau parolă incorectă' })

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) return res.status(401).json({ error: 'Utilizator sau parolă incorectă' })

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' })
    res.json({ token, user: { username: user.username, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: 'Eroare la autentificare' })
  }
})

// GET /api/settings
app.get('/api/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM settings').all()
    const settings = {}
    rows.forEach(r => { settings[r.key] = r.value })
    res.json(settings)
  } catch {
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

// PUT /api/settings (Necesită autentificare)
app.put('/api/settings', authenticateToken, (req, res) => {
  try {
    const updates = req.body
    const updateStmt = db.prepare('INSERT INTO settings (key, value) VALUES (@key, @value) ON CONFLICT(key) DO UPDATE SET value=@value')

    db.transaction((settingsObj) => {
      for (const [key, value] of Object.entries(settingsObj)) {
        updateStmt.run({ key, value: String(value) })
      }
    })(updates)

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' })
  }
})

// GET /api/products
app.get('/api/products', (req, res) => {
  try {
    res.json(getProducts())
  } catch {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// POST /api/products
app.post('/api/products', authenticateToken, (req, res) => {
  try {
    const p = req.body
    const newId = 'prod_' + Date.now()
    db.prepare(`INSERT INTO products (id, name, slug, price, oldPrice, category, stock, shortDescription, description, features, bundles, images, landingConfig, reviews, config, active, createdAt)
      VALUES (@id, @name, @slug, @price, @oldPrice, @category, @stock, @shortDescription, @description, @features, @bundles, @images, @landingConfig, @reviews, @config, @active, @createdAt)`)
      .run({
        ...p,
        id: newId,
        features: JSON.stringify(p.features || []),
        bundles: JSON.stringify(p.bundles || []),
        images: JSON.stringify(p.images || []),
        landingConfig: JSON.stringify(p.landingConfig || null),
        reviews: JSON.stringify(p.reviews || []),
        config: JSON.stringify(p.config || { showDiscount: true, showBestSeller: true }),
        active: p.active === undefined ? 1 : (p.active ? 1 : 0),
        createdAt: new Date().toISOString(),
      })
    io.emit('products_updated')
    res.json({ success: true, id: newId })
  } catch {
    res.status(500).json({ error: 'Failed to add product' })
  }
})

// PUT /api/products/:id
app.put('/api/products/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const p = req.body
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
    if (!existing) return res.status(404).json({ error: 'Product not found' })

    db.prepare(`UPDATE products SET
      name=@name, slug=@slug, price=@price, oldPrice=@oldPrice,
      category=@category, stock=@stock, shortDescription=@shortDescription,
      description=@description, features=@features, bundles=@bundles,
      images=@images, landingConfig=@landingConfig, reviews=@reviews,
      config=@config, active=@active WHERE id=@id`)
      .run({
        ...p,
        id,
        features: JSON.stringify(p.features || JSON.parse(existing.features)),
        bundles: JSON.stringify(p.bundles || JSON.parse(existing.bundles)),
        images: JSON.stringify(p.images || JSON.parse(existing.images)),
        landingConfig: JSON.stringify(p.landingConfig !== undefined ? p.landingConfig : JSON.parse(existing.landingConfig || 'null')),
        reviews: JSON.stringify(p.reviews || JSON.parse(existing.reviews || '[]')),
        config: JSON.stringify(p.config || JSON.parse(existing.config || '{"showDiscount":true,"showBestSeller":true}')),
        active: p.active === undefined ? existing.active : (p.active ? 1 : 0),
      })
    io.emit('products_updated')
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// GET /api/orders
app.get('/api/orders', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all()
    res.json(rows.map(r => ({
      ...r,
      customer: JSON.parse(r.customer || '{}'),
      items: JSON.parse(r.items || '[]'),
      statusHistory: JSON.parse(r.statusHistory || '[]'),
    })))
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// POST /api/orders
app.post('/api/orders', orderLimiter, async (req, res) => {
  try {
    const orderData = req.body
    orderData.clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''

    const newId = 'IC-' + (Math.floor(Math.random() * 90000) + 10000)
    const now = new Date().toISOString()

    db.prepare(`INSERT INTO orders (id, customer, items, subtotal, shipping, total, status, paymentMethod, awb, invoiceNumber, notes, statusHistory, createdAt, updatedAt)
      VALUES (@id, @customer, @items, @subtotal, @shipping, @total, @status, @paymentMethod, @awb, @invoiceNumber, @notes, @statusHistory, @createdAt, @updatedAt)`)
      .run({
        id: newId,
        customer: JSON.stringify(orderData.customer || {}),
        items: JSON.stringify(orderData.items || []),
        subtotal: orderData.subtotal || 0,
        shipping: orderData.shipping || 0,
        total: orderData.total || 0,
        status: 'nou',
        paymentMethod: orderData.customer?.paymentMethod || 'ramburs',
        awb: null, invoiceNumber: null, notes: '',
        statusHistory: JSON.stringify([{ status: 'nou', date: now, note: 'Comandă plasată' }]),
        createdAt: now, updatedAt: now,
      })

    // Marcare checkout ca finalizat (pentru a nu mai crea draft ulterior)
    if (orderData.customer?.phone) {
      const phone = orderData.customer.phone.replace(/\s/g, '')
      db.prepare("UPDATE abandoned_checkouts SET status = 'ordered' WHERE id = ?").run(phone)
    }

    // Răspunde instant
    io.emit('new_order', { id: newId, total: orderData.total })
    res.json({ success: true, id: newId })

    // Shopify sync în background
    if (SHOPIFY_STORE_URL && (SHOPIFY_CLIENT_ID || process.env.SHOPIFY_ACCESS_TOKEN)) {
      setImmediate(async () => {
        try {
          const draftId = orderData.shopifyDraftId || null
          const shopifyOrder = draftId
            ? await completeShopifyDraft(draftId, orderData)   // completează draft existent
            : await createShopifyOrder(orderData)               // creare directă
          if (shopifyOrder?.id) {
            db.prepare('UPDATE orders SET notes = ? WHERE id = ?')
              .run(`shopify_id:${shopifyOrder.id}`, newId)
          }
        } catch (err) {
          console.error('❌ [SYNC ERROR] Shopify integration failed:', err)
        }
      })
    }
  } catch (err) {
    console.error('❌ [DATABASE ERROR] Failed to create local order:', err)
    res.status(500).json({ error: 'Failed to create order' })
  }
})


// ── Tracker Checkout Abandonat ───────────────────────────────────────────────
app.post('/api/checkout/track', trackLimiter, async (req, res) => {
  try {
    const { customer, items, shipping, total } = req.body
    const phone = (customer?.phone || '').replace(/\s/g, '')
    const firstName = (customer?.firstName || '').trim()

    // Maschează datele personale în logs (GDPR)
    const maskedPhone = phone.length > 4 ? phone.slice(0, 3) + '*'.repeat(phone.length - 4) + phone.slice(-1) : '***'
    const maskedName = firstName.length > 1 ? firstName[0] + '*'.repeat(firstName.length - 1) : '*'

    // Obligatoriu: telefon + prenume
    if (!phone || !firstName) {
      return res.json({ success: false })
    }

    const now = new Date().toISOString()

    const existing = db.prepare('SELECT id, shopifyDraftId, status FROM abandoned_checkouts WHERE id = ?').get(phone)
    if (existing) {
      db.prepare(`UPDATE abandoned_checkouts SET customer=?, items=?, shipping=?, total=?, lastActivity=?, status='pending', shopifyDraftId=NULL WHERE id=?`)
        .run(JSON.stringify(customer), JSON.stringify(items), shipping, total, now, phone)
      return res.json({ success: true, shopifyDraftId: null })
    } else {
      db.prepare(`INSERT INTO abandoned_checkouts (id, customer, items, shipping, total, lastActivity, createdAt) VALUES (?,?,?,?,?,?,?)`)
        .run(phone, JSON.stringify(customer), JSON.stringify(items), shipping, total, now, now)
    }

    res.json({ success: true, shopifyDraftId: null })
  } catch (err) {
    console.error('❌ [TRACK] Error:', err)
    res.status(500).json({ error: 'Failed' })
  }
})

// ── Background Worker: Sincronizare Draft-uri Shopify ────────────────────────
setInterval(async () => {
  try {
    // Draft se creează dacă clientul a abandonat de minim 5 minute
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const candidates = db.prepare(`SELECT * FROM abandoned_checkouts 
                                  WHERE status = 'pending' 
                                  AND lastActivity < ? 
                                  LIMIT 5`).all(fiveMinsAgo)

    for (const c of candidates) {
      try {
        const customerObj = JSON.parse(c.customer)
        const itemsObj = JSON.parse(c.items)

        if (!customerObj.firstName || !customerObj.firstName.trim()) continue

        // Dacă a plasat vreo comandă în ultima oră, sigur a fost finalizată și acesta e un "late track event"
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
        const hasRecentOrder = db.prepare(
          `SELECT id FROM orders WHERE customer LIKE ? AND createdAt > ?`
        ).get(`%${c.id}%`, oneHourAgo)

        if (hasRecentOrder) {
          db.prepare("UPDATE abandoned_checkouts SET status = 'ordered' WHERE id = ?").run(c.id)
          continue
        }

        const draftId = await createShopifyDraft(itemsObj, c.shipping, customerObj)
        if (draftId) {
          db.prepare("UPDATE abandoned_checkouts SET shopifyDraftId = ?, status = 'synced' WHERE id = ?")
            .run(draftId.toString(), c.id)
        }
      } catch (err) {
        console.error(`❌ [ABANDONED] Eroare pentru ${c.id}:`, err.message)
      }
    }
  } catch (err) {
    console.error('❌ [WORKER] Eroare generală:', err)
  }
}, 60 * 1000) // Verificare la fiecare 60 secunde

// PUT /api/orders/:id/status — cu sync Shopify automat
app.put('/api/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status, note } = req.body
    const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(id)
    if (!existing) return res.status(404).json({ error: 'Order not found' })

    const history = JSON.parse(existing.statusHistory || '[]')
    const now = new Date().toISOString()
    history.push({ status, date: now, note: note || '' })

    db.prepare('UPDATE orders SET status=?, statusHistory=?, updatedAt=? WHERE id=?')
      .run(status, JSON.stringify(history), now, id)

    io.emit('order_updated', { id, status })

    // ── Shopify sync automat ──────────────────────────────────────────────────
    const shopifyNumericId = (() => {
      const fields = [existing.notes, existing.awb, existing.invoiceNumber, existing.id]
      for (const f of fields) {
        const m = (f || '').match(/shopify_id:(\d+)/)
        if (m) return m[1]
      }
      return null
    })()

    if (shopifyNumericId && SHOPIFY_STORE_URL) {
      getShopifyToken().then(async token => {
        if (!token) return
        const baseUrl = `https://${SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}`

        if (status === 'livrat') {
          try {
            const foResp = await fetch(`${baseUrl}/orders/${shopifyNumericId}/fulfillment_orders.json`,
              { headers: { 'X-Shopify-Access-Token': token } })
            const foData = await foResp.json()
            const fo = foData.fulfillment_orders?.find(f => f.status === 'open' || f.status === 'in_progress')
            if (fo) {
              await fetch(`${baseUrl}/fulfillments.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
                body: JSON.stringify({
                  fulfillment: {
                    line_items_by_fulfillment_order: [{ fulfillment_order_id: fo.id }],
                    notify_customer: false,
                  }
                })
              })
            }
          } catch (e) { console.error('⚠️ [SHOPIFY] Fulfillment sync failed:', e.message) }
        }

        if (status === 'anulat') {
          try {
            await fetch(`${baseUrl}/orders/${shopifyNumericId}/cancel.json`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
              body: JSON.stringify({ reason: 'customer', email: false })
            })
          } catch (e) { console.error('⚠️ [SHOPIFY] Cancel sync failed:', e.message) }
        }
      }).catch(() => { })
    }
    // ─────────────────────────────────────────────────────────────────────────

    res.json({ success: true })
  } catch (err) {
    console.error('[STATUS UPDATE ERROR]', err)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

// DELETE /api/orders/:id
app.delete('/api/orders/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const existing = db.prepare('SELECT id FROM orders WHERE id = ?').get(id)
    if (!existing) return res.status(404).json({ error: 'Order not found' })
    db.prepare('DELETE FROM orders WHERE id = ?').run(id)
    io.emit('order_deleted', { id })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete order' })
  }
})

// GET /api/health
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Global error handler
app.use((err, req, res, _next) => {
  res.status(500).json({ error: 'Internal Server Error' })
})

// ── Start server + token auto-refresh ─────────────────────────────────────────
server.listen(PORT, async () => {
  // Obține token la startup (dacă nu e deja valid în .env)
  if (SHOPIFY_STORE_URL && SHOPIFY_CLIENT_ID && SHOPIFY_CLIENT_SECRET) {
    try { await getShopifyToken() } catch (_) { }

    // Refresh automat la fiecare 23h — tokenul nu expiră niciodată în producție
    setInterval(async () => {
      _tokenExpiresAt = 0 // forțează refresh
      try { await getShopifyToken() } catch (_) { }
    }, 23 * 60 * 60 * 1000)
  }
})
