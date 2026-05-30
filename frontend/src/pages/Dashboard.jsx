import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../context/AppProvider'
import { useToast } from '../components/Toast'

const STATUS_LABELS = {
  'nou': 'Nouă', 'confirmat': 'Confirmată', 'in_procesare': 'În Procesare',
  'expediat': 'Expediată', 'livrat': 'Livrată', 'anulat': 'Anulată',
}

const STATUS_COLORS = {
  'nou': 'bg-blue-100 text-blue-600', 'confirmat': 'bg-purple-100 text-purple-600',
  'in_procesare': 'bg-amber-100 text-amber-600', 'expediat': 'bg-cyan-100 text-cyan-600',
  'livrat': 'bg-emerald-100 text-emerald-600', 'anulat': 'bg-red-100 text-red-600',
}

const EMOJIS = { 'Curățenie': '🧴', 'Dezinfectanți': '🧹', 'Seturi': '📦' }

export default function Dashboard() {
  const [tab, setTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [orderModal, setOrderModal] = useState(null)
  const [productModal, setProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [orderFilter, setOrderFilter] = useState('all')

  const forceRefresh = useCallback(() => setRefresh(r => r + 1), [])

  const { products, orders, stats, api, reloadProducts, reloadOrders, user, logout } = useAppStore()
  const tabConfig = {
    overview: { title: 'Prezentare Generală', subtitle: 'Bine ai revenit! Iată ce se întâmplă azi.' },
    orders: { title: 'Comenzi', subtitle: 'Gestionează toate comenzile magazinului tău.' },
    products: { title: 'Produse', subtitle: 'Adaugă, editează și gestionează produsele.' },
    integrations: { title: 'Integrări', subtitle: 'Conectează servicii externe pentru AWB și facturare.' },
  }

  const switchTab = (t) => { setTab(t); setSidebarOpen(false) }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 bottom-0 left-0 w-[270px] bg-[#0F172A] text-white flex flex-col z-50 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.webp" alt="IdealClean" className="h-12 w-auto drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]" />
            <span className="font-['Outfit'] text-lg font-[900] tracking-tight">
              <span className="text-white/90">Ideal</span><span className="text-[#5EEAD4]">Clean</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <p className="px-3 pt-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Principal</p>
          <SidebarLink icon="📊" label="Prezentare Generală" active={tab === 'overview'} onClick={() => switchTab('overview')} />
          <SidebarLink icon="📦" label="Comenzi" active={tab === 'orders'} onClick={() => switchTab('orders')} badge={stats.pendingOrders} />
          <p className="px-3 pt-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Management</p>
          <SidebarLink icon="🏷️" label="Produse" active={tab === 'products'} onClick={() => switchTab('products')} />
          <SidebarLink icon="⚙️" label="Integrări" active={tab === 'integrations'} onClick={() => switchTab('integrations')} />
        </nav>

        <div className="p-3 border-t border-white/8">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-sm">
            🔗 Vezi Magazinul
          </Link>
          <div className="mt-2 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0077B6] to-[#00B4D8] flex items-center justify-center text-xs font-bold text-white shadow-lg">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.username || 'Administrator'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Online</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all border border-red-500/20"
            >
              🚪 Deconectare
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 lg:ml-0 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span className="block w-5 h-0.5 bg-slate-800 mb-1" /><span className="block w-5 h-0.5 bg-slate-800 mb-1" /><span className="block w-5 h-0.5 bg-slate-800" />
            </button>
            <div>
              <h1 className="font-['Outfit'] text-xl font-extrabold">{tabConfig[tab]?.title}</h1>
              <p className="text-sm text-slate-400">{tabConfig[tab]?.subtitle}</p>
            </div>
          </div>
          <span className="text-sm text-slate-400 bg-slate-50 px-4 py-2 rounded-lg hidden sm:block">
            {new Date().toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </header>

        <div className="p-6 lg:p-8">
          {tab === 'overview' && <OverviewTab onViewOrder={setOrderModal} onSwitchTab={switchTab} />}
          {tab === 'orders' && <OrdersTab filter={orderFilter} setFilter={setOrderFilter} onViewOrder={setOrderModal} />}
          {tab === 'products' && <ProductsTab onAdd={() => { setEditingProduct(null); setProductModal(true) }} onEdit={(p) => { setEditingProduct(p); setProductModal(true) }} />}
          {tab === 'integrations' && <IntegrationsTab />}
        </div>
      </main>

      {/* Order Detail Modal */}
      {orderModal && <OrderDetailModal orderId={orderModal} onClose={() => setOrderModal(null)} />}

      {/* Product Form Modal */}
      {productModal && <ProductFormModal product={editingProduct} onClose={() => setProductModal(false)} onSave={() => { setProductModal(false) }} api={api} />}
    </div>
  )
}

// ═══════════ SIDEBAR LINK ═══════════
function SidebarLink({ icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-0.5 relative ${active ? 'bg-[#0077B6]/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
      {active && <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-gradient-to-b from-[#0077B6] to-[#2EC4B6] rounded-r" />}
      <span>{icon}</span>
      <span>{label}</span>
      {badge > 0 && <span className="ml-auto px-2.5 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">{badge}</span>}
    </button>
  )
}

// ═══════════ OVERVIEW TAB ═══════════
function OverviewTab({ onViewOrder, onSwitchTab }) {
  const { stats, orders: allOrders } = useAppStore()
  const orders = allOrders.slice(0, 5)
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📦" iconBg="bg-blue-100" label="Comenzi Azi" value={stats.todayOrders} trend={`Luna aceasta: ${stats.monthOrders}`} />
        <StatCard icon="💰" iconBg="bg-emerald-100" label="Venituri Azi" value={`${stats.todayRevenue.toFixed(0)} lei`} trend={`Luna: ${stats.monthRevenue.toFixed(0)} lei`} />
        <StatCard icon="⏳" iconBg="bg-amber-100" label="În Așteptare" value={stats.pendingOrders} trend={`Expediate: ${stats.shippedOrders}`} />
        <StatCard icon="🏷️" iconBg="bg-purple-100" label="Produse Active" value={stats.activeProducts} trend={`Total: ${stats.totalProducts}`} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Comenzi Recente</h3>
        <button onClick={() => onSwitchTab('orders')} className="text-sm text-slate-400 hover:text-[#0077B6] font-medium">Vezi toate →</button>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon="📦" title="Nicio comandă încă" desc="Comenzile vor apărea aici după ce clienții plasează comenzi." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <Th>ID</Th><Th>Client</Th><Th>Total</Th><Th>Status</Th><Th>Data</Th><Th>Acțiuni</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <Td><strong>{o.id}</strong></Td>
                  <Td>{o.customer.firstName} {o.customer.lastName}</Td>
                  <Td><strong>{o.total.toFixed(2)} lei</strong></Td>
                  <Td><StatusBadge status={o.status} /></Td>
                  <Td className="text-sm text-slate-400">{fmtDate(o.createdAt)}</Td>
                  <Td><button onClick={() => onViewOrder(o.id)} className="text-sm text-[#0077B6] font-medium hover:underline">Detalii</button></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ═══════════ CALENDAR TAB ═══════════
// ═══════════ PRODUCT STATS VIEW ═══════════
function ProductStatsView({ orders }) {
  const [period, setPeriod] = useState('all')
  const [sortBy, setSortBy] = useState('revenue')

  const now = new Date()
  const filtered = orders.filter(o => {
    if (period === 'today') {
      const d = new Date(o.createdAt)
      return d.toDateString() === now.toDateString()
    }
    if (period === 'month') {
      const d = new Date(o.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }
    return true
  })

  // Aggregate by product name
  const statsMap = {}
  filtered.forEach(order => {
    ; (order.items || []).forEach(item => {
      const name = item.productName || item.name || 'Produs necunoscut'
      if (!statsMap[name]) {
        statsMap[name] = { name, units: 0, revenue: 0, orders: 0, statuses: {} }
      }
      const qty = item.quantity || item.qty || 1
      const price = item.price || 0
      statsMap[name].units += qty
      statsMap[name].revenue += price * qty
      statsMap[name].orders += 1
      const s = order.status || 'nou'
      statsMap[name].statuses[s] = (statsMap[name].statuses[s] || 0) + 1
    })
  })

  let stats = Object.values(statsMap)
  if (sortBy === 'revenue') stats.sort((a, b) => b.revenue - a.revenue)
  if (sortBy === 'units') stats.sort((a, b) => b.units - a.units)
  if (sortBy === 'orders') stats.sort((a, b) => b.orders - a.orders)

  const maxRevenue = stats[0]?.revenue || 1
  const totalRevenue = stats.reduce((s, p) => s + p.revenue, 0)
  const totalUnits = stats.reduce((s, p) => s + p.units, 0)

  const PERIOD_LABELS = { all: 'Tot timpul', month: 'Luna aceasta', today: 'Azi' }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          {Object.entries(PERIOD_LABELS).map(([k, l]) => (
            <button key={k} onClick={() => setPeriod(k)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${period === k ? 'bg-white text-[#0077B6] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              {l}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="px-4 py-2 border-2 border-slate-200 rounded-xl text-sm font-medium focus:border-[#0077B6] outline-none">
          <option value="revenue">Sortare: Venituri</option>
          <option value="units">Sortare: Cantitate vândută</option>
          <option value="orders">Sortare: Număr comenzi</option>
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: '📦', label: 'Produse distincte', val: stats.length },
          { icon: '🛒', label: 'Unități vândute', val: totalUnits },
          { icon: '💰', label: 'Venituri totale', val: `${totalRevenue.toFixed(0)} lei` },
          { icon: '📋', label: 'Comenzi analizate', val: filtered.length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col items-center text-center">
            <span className="text-2xl mb-1">{s.icon}</span>
            <span className="font-black text-slate-800 text-lg">{s.val}</span>
            <span className="text-[11px] text-slate-400 font-semibold mt-0.5">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Product rows */}
      {stats.length === 0 ? (
        <EmptyState icon="📊" title="Nicio vânzare" desc="Nu există comenzi în perioada selectată." />
      ) : (
        <div className="space-y-3">
          {stats.map((p, idx) => {
            const barW = Math.round((p.revenue / maxRevenue) * 100)
            const avgOrder = p.revenue / (p.orders || 1)
            const deliveredPct = p.orders > 0
              ? Math.round(((p.statuses['livrat'] || 0) / p.orders) * 100)
              : 0
            return (
              <div key={p.name} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 text-white
                    ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-orange-400' : 'bg-slate-200 text-slate-500'}`}>
                    #{idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name + stats */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h4 className="font-black text-slate-800 text-base truncate">{p.name}</h4>
                      <span className="font-black text-[#0077B6] text-lg">{p.revenue.toFixed(0)} lei</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full mb-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${barW}%`,
                          background: idx === 0 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#0077B6,#00B4D8)'
                        }}
                      />
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Unități vândute', val: p.units, icon: '📦' },
                        { label: 'Comenzi', val: p.orders, icon: '🛒' },
                        { label: 'Val. medie comandă', val: `${avgOrder.toFixed(0)} lei`, icon: '💵' },
                        { label: 'Livrate', val: `${deliveredPct}%`, icon: '✅' },
                      ].map(m => (
                        <div key={m.label} className="bg-slate-50 rounded-xl p-3 text-center">
                          <div className="text-base mb-0.5">{m.icon}</div>
                          <div className="font-black text-slate-800 text-sm">{m.val}</div>
                          <div className="text-[10px] text-slate-400 font-semibold leading-tight mt-0.5">{m.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Status breakdown */}
                    {Object.keys(p.statuses).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {Object.entries(p.statuses).map(([s, cnt]) => (
                          <span key={s} className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_COLORS[s] || 'bg-slate-100 text-slate-500'}`}>
                            {STATUS_LABELS[s] || s}: {cnt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const MONTH_NAMES = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie']
const DAY_NAMES = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum']

function CalendarTab({ onViewOrder, productFilter = 'all' }) {
  const { orders: allOrders } = useAppStore()
  const today = new Date()
  const [cur, setCur] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [selected, setSelected] = useState(null) // 'YYYY-MM-DD'

  const toKey = (d) => {
    const dt = new Date(d)
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
  }

  // Apply product filter
  const filteredOrders = productFilter === 'all'
    ? allOrders
    : allOrders.filter(o => (o.items || []).some(i => (i.productName || i.name) === productFilter))

  // Group orders by date key
  const byDay = filteredOrders.reduce((acc, o) => {
    const k = toKey(o.createdAt)
    if (!acc[k]) acc[k] = []
    acc[k].push(o)
    return acc
  }, {})

  // Build calendar grid
  const firstDay = new Date(cur.y, cur.m, 1)
  const lastDay = new Date(cur.y, cur.m + 1, 0)
  // Monday-first: shift Sunday (0) → 6
  const startOffset = (firstDay.getDay() + 6) % 7
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startOffset + 1
    if (dayNum < 1 || dayNum > lastDay.getDate()) return null
    return dayNum
  })

  const prev = () => setCur(c => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 })
  const next = () => setCur(c => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 })

  const selectedOrders = selected ? (byDay[selected] || []) : []
  const selectedRevenue = selectedOrders.reduce((s, o) => s + (o.total || 0), 0)

  const todayKey = toKey(today)

  const getDotColor = (count, revenue) => {
    if (count === 0) return null
    if (revenue >= 500) return '#10b981' // emerald
    if (revenue >= 200) return '#0077B6' // blue
    return '#f59e0b' // amber
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6">

      {/* Calendar card */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">

        {/* Month nav */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50"
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #0077B6 100%)' }}>
          <button
            onClick={prev}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold transition-all"
          >‹</button>
          <div className="text-center">
            <p className="text-white font-['Outfit'] text-xl font-black tracking-tight">
              {MONTH_NAMES[cur.m]}
            </p>
            <p className="text-white/50 text-sm font-semibold">{cur.y}</p>
          </div>
          <button
            onClick={next}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold transition-all"
          >›</button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 border-b border-slate-50">
          {DAY_NAMES.map(d => (
            <div key={d} className="py-3 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="aspect-square p-1 bg-slate-50/40" />
            const key = `${cur.y}-${String(cur.m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayOrders = byDay[key] || []
            const rev = dayOrders.reduce((s, o) => s + (o.total || 0), 0)
            const dotColor = getDotColor(dayOrders.length, rev)
            const isToday = key === todayKey
            const isSelected = key === selected
            const isWeekend = (i % 7) >= 5

            return (
              <button
                key={i}
                onClick={() => setSelected(isSelected ? null : key)}
                className={`aspect-square p-1 flex flex-col items-center justify-center gap-0.5 transition-all relative
                  ${isSelected ? 'ring-2 ring-inset ring-[#0077B6] bg-[#0077B6]/5' : 'hover:bg-slate-50'}
                  ${isWeekend && !isSelected ? 'bg-slate-50/60' : ''}
                `}
              >
                {/* Day number */}
                <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${isToday ? 'bg-[#0077B6] text-white shadow-md' : isSelected ? 'bg-[#0077B6]/15 text-[#0077B6]' : isWeekend ? 'text-slate-400' : 'text-slate-700'}
                `}>
                  {day}
                </span>

                {/* Dot indicator */}
                {dotColor && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: dotColor }}
                  />
                )}

                {/* Order count badge */}
                {dayOrders.length > 0 && (
                  <span className="text-[9px] font-black leading-none" style={{ color: dotColor }}>
                    {dayOrders.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 py-4 border-t border-slate-50 text-xs text-slate-400 flex-wrap px-4">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /><b>1–3 comenzi</b></span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0077B6] inline-block" /><b>+200 lei</b></span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /><b>+500 lei</b></span>
        </div>
      </div>

      {/* Day panel */}
      <div className={`xl:w-[380px] transition-all duration-300 ${selected ? 'opacity-100 translate-x-0' : 'opacity-0 xl:opacity-100 xl:translate-x-0'}`}>
        {selected ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-full">
            {/* Panel header */}
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1e3a5f 100%)' }}>
              <div>
                <p className="text-white font-black text-lg font-['Outfit']">
                  {new Date(selected + 'T12:00:00').toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}
                </p>
                <p className="text-white/50 text-sm mt-0.5">
                  {selectedOrders.length} {selectedOrders.length === 1 ? 'comandă' : 'comenzi'} · {selectedRevenue.toFixed(0)} lei
                  {productFilter !== 'all' && <span className="ml-2 bg-white/15 text-white/80 px-2 py-0.5 rounded-full text-[11px] font-bold">📦 {productFilter}</span>}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all">✕</button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
              {[
                { label: 'Comenzi', val: selectedOrders.length, icon: '📦' },
                { label: 'Venituri', val: `${selectedRevenue.toFixed(0)} lei`, icon: '💰' },
                { label: 'Livrate', val: selectedOrders.filter(o => o.status === 'livrat').length, icon: '✅' },
              ].map(s => (
                <div key={s.label} className="py-4 flex flex-col items-center">
                  <span className="text-lg mb-0.5">{s.icon}</span>
                  <span className="font-black text-slate-800 text-sm">{s.val}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Orders list */}
            <div className="overflow-y-auto max-h-[500px]">
              {selectedOrders.length === 0 ? (
                <div className="py-16 text-center text-slate-300">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="font-semibold text-slate-400">Nicio comandă în această zi</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {selectedOrders.map(o => (
                    <div key={o.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-slate-800 text-sm">{o.customer?.firstName} {o.customer?.lastName}</span>
                            <StatusBadge status={o.status} />
                          </div>
                          <div className="text-xs text-slate-400 truncate">{o.items?.map(i => i.productName || i.name).join(', ')}</div>
                          <div className="text-xs text-slate-400 mt-1">{o.customer?.phone}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="font-black text-[#0077B6]">{o.total?.toFixed(2)} lei</span>
                          <button
                            onClick={() => onViewOrder(o.id)}
                            className="text-[11px] font-bold text-white bg-[#0077B6] hover:bg-[#005f8f] px-3 py-1 rounded-lg transition-all"
                          >Detalii</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden xl:flex bg-white rounded-3xl border border-slate-100 h-full min-h-[400px] items-center justify-center flex-col text-center p-8">
            <div className="text-5xl mb-4">📅</div>
            <p className="font-bold text-slate-700 text-lg">Selectează o zi</p>
            <p className="text-slate-400 text-sm mt-2">Click pe orice zi din calendar pentru a vedea comenzile din acea zi.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════ ORDERS TAB ═══════════
function OrdersTab({ filter, setFilter, onViewOrder }) {
  const showToast = useToast()
  const { orders: allOrders, api, reloadOrders } = useAppStore()
  const [view, setView] = useState('list')
  const [productFilter, setProductFilter] = useState('all')

  // Unique product names across all orders
  const productNames = [...new Set(
    allOrders.flatMap(o => (o.items || []).map(i => i.productName || i.name).filter(Boolean))
  )].sort()

  let orders = allOrders
  if (filter !== 'all') orders = allOrders.filter(o => o.status === filter)

  const handleStatusChange = async (orderId, newStatus) => {
    await api.updateOrderStatus(orderId, newStatus)
    showToast(`Status actualizat: ${STATUS_LABELS[newStatus]}${newStatus === 'livrat' ? ' — sincronizat cu Shopify ✅' : newStatus === 'anulat' ? ' — anulat în Shopify ✅' : ''}`)
    reloadOrders()
  }

  const handleDelete = async (order) => {
    if (!window.confirm(`Ștergi comanda ${order.id} (${order.customer?.firstName} ${order.customer?.lastName})? Acțiunea este ireversibilă.`)) return
    await api.deleteOrder(order.id)
    showToast('Comandă ștearsă')
    reloadOrders()
  }

  return (
    <>
      {/* View toggle + header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'list' ? 'bg-white text-[#0077B6] shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
          >📋 Listă</button>
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'calendar' ? 'bg-white text-[#0077B6] shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
          >📅 Calendar</button>
          <button
            onClick={() => setView('products')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'products' ? 'bg-white text-[#0077B6] shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
          >📊 Produse</button>
        </div>
        {view === 'list' && (
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2 border-2 border-slate-200 rounded-xl text-sm font-medium focus:border-[#0077B6] outline-none">
            <option value="all">Toate Statusurile</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        )}
        {view === 'calendar' && (
          <select value={productFilter} onChange={e => setProductFilter(e.target.value)}
            className="px-4 py-2 border-2 border-slate-200 rounded-xl text-sm font-medium focus:border-[#0077B6] outline-none">
            <option value="all">📦 Toate Produsele</option>
            {productNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        )}
      </div>

      {/* Calendar view */}
      {view === 'calendar' && <CalendarTab onViewOrder={onViewOrder} productFilter={productFilter} />}

      {/* Products stats view */}
      {view === 'products' && <ProductStatsView orders={allOrders} />}

      {view === 'list' && (orders.length === 0 ? (
        <EmptyState icon="📦" title="Nicio comandă" desc="Nu există comenzi cu filtrul selectat." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <Th>ID</Th><Th>Client</Th><Th>Produse</Th><Th>Total</Th><Th>Plată</Th>
                <Th>
                  <span title="Statusul 'Livrat' sincronizează automat cu Shopify (fulfilled). 'Anulat' → cancelled în Shopify.">Status ℹ️</span>
                </Th>
                <Th>AWB</Th><Th>Data</Th><Th></Th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                  <Td><strong>{o.id}</strong></Td>
                  <Td>
                    <div>{o.customer.firstName} {o.customer.lastName}</div>
                    <div className="text-xs text-slate-400">{o.customer.phone}</div>
                  </Td>
                  <Td className="max-w-[200px] text-sm text-slate-400 truncate">{o.items.map(i => i.productName || i.name).join(', ')}</Td>
                  <Td><strong>{o.total.toFixed(2)} lei</strong></Td>
                  <Td className="text-sm">{o.paymentMethod === 'ramburs' ? '💵 Ramburs' : '💳 Card'}</Td>
                  <Td>
                    <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)} className="px-3 py-1.5 border-2 border-slate-200 rounded-lg text-xs font-semibold focus:border-[#0077B6] outline-none w-[130px]">
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </Td>
                  <Td className="text-sm text-slate-400">{o.awb || '—'}</Td>
                  <Td className="text-sm text-slate-400">{fmtDate(o.createdAt)}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onViewOrder(o.id)} className="text-lg" title="Detalii">👁️</button>
                      <button
                        onClick={() => handleDelete(o)}
                        className="text-lg hover:scale-110 transition-transform"
                        title="Șterge comanda"
                      >🗑️</button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  )
}

// ═══════════ PRODUCTS TAB ═══════════
function ProductsTab({ onAdd, onEdit }) {
  const showToast = useToast()
  const { products, api, reloadProducts } = useAppStore()

  const toggleActive = async (p) => {
    await api.updateProduct(p.id, { ...p, active: !p.active })
    showToast(!p.active ? 'Produs activat' : 'Produs dezactivat')
    reloadProducts()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg">Produsele Mele</h3>
        <button onClick={onAdd} className="px-5 py-2.5 bg-gradient-to-r from-[#0077B6] to-[#00B4D8] text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
          ➕ Adaugă Produs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {products.map(p => {
          const emoji = EMOJIS[p.category] || '🫧'
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-all">
              <div className="h-36 bg-slate-50 flex items-center justify-center text-5xl overflow-hidden">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="opacity-40">{emoji}</span>
                )}
              </div>
              <div className="p-5">
                <h4 className="font-bold">{p.name}</h4>
                <div className="flex items-center justify-between mt-1 mb-3">
                  <span className="font-['Outfit'] font-extrabold text-[#0077B6]">{p.price.toFixed(2)} lei</span>
                  <span className="text-xs text-slate-400">Stoc: {p.stock}</span>
                </div>
                <div className="mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {p.active ? 'Activ' : 'Inactiv'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(p)} className="flex-1 py-2 px-3 border-2 border-[#0077B6] text-[#0077B6] text-xs font-semibold rounded-xl hover:bg-[#0077B6] hover:text-white transition-all">Editează</button>
                  <Link to={`/produs/${p.id}`} target="_blank" className="py-2 px-3 text-xs font-semibold text-slate-400 rounded-xl hover:bg-slate-50 transition-all">Vezi Pagina</Link>
                  <button onClick={() => toggleActive(p)} className="py-2 px-3 text-xs font-semibold text-red-400 rounded-xl hover:bg-red-50 transition-all">
                    {p.active ? 'Dezact.' : 'Activ.'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ═══════════ INTEGRATIONS TAB ═══════════
function IntegrationsTab() {
  const showToast = useToast()
  const { settings, setSettings, api } = useAppStore()
  const [openFields, setOpenFields] = useState({})

  // Local state for forms
  const [fbPixelId, setFbPixelId] = useState(settings.facebookPixelId || '')
  const [isSaving, setIsSaving] = useState(false)

  const toggle = (name) => setOpenFields(prev => ({ ...prev, [name]: !prev[name] }))

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      await api.updateSettings({ facebookPixelId: fbPixelId })
      setSettings(prev => ({ ...prev, facebookPixelId: fbPixelId }))
      showToast('Setări salvate cu succes!')
    } catch (err) {
      showToast('Eroare la salvare', true)
    } finally {
      setIsSaving(false)
    }
  }

  const integrations = [
    {
      key: 'fanCourier', abbr: 'FC', color: '#E74C3C', name: 'FanCourier', desc: 'Generare AWB automată, tracking și livrare prin FanCourier.',
      fields: [{ label: 'Client ID', ph: 'Client ID FanCourier' }, { label: 'Username', ph: 'Username' }, { label: 'Parola', ph: 'Parola selfAWB', type: 'password' }]
    },
    {
      key: 'sameday', abbr: 'SD', color: '#F39C12', name: 'Sameday', desc: 'Livrare cu easybox. AWB automat și tracking real-time.',
      fields: [{ label: 'Username API', ph: 'Username Sameday' }, { label: 'Parola API', ph: 'Parola API', type: 'password' }]
    },
    {
      key: 'smartBill', abbr: 'SB', color: '#3498DB', name: 'SmartBill', desc: 'Facturare automată și conformitate cu e-Factura.',
      fields: [{ label: 'Email SmartBill', ph: 'email@exemplu.ro', type: 'email' }, { label: 'API Token', ph: 'Token API SmartBill' }, { label: 'CIF Companie', ph: 'RO12345678' }]
    },
    {
      key: 'oblio', abbr: 'OB', color: '#2ECC71', name: 'Oblio', desc: 'Alternativă de facturare simplă. Proforma, factură, chitanță.',
      fields: [{ label: 'Client ID', ph: 'Client ID Oblio' }, { label: 'Client Secret', ph: 'Client Secret', type: 'password' }]
    },
  ]

  return (
    <>
      <h3 className="font-bold text-lg mb-6">Integrări cu Servicii Externe</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {integrations.map(intg => (
          <div key={intg.key} className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-extrabold" style={{ background: intg.color }}>{intg.abbr}</div>
              <div>
                <h4 className="font-bold">{intg.name}</h4>
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Neconectat</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">{intg.desc}</p>
            {openFields[intg.key] && (
              <div className="space-y-3 mb-4">
                {intg.fields.map((f, i) => (
                  <div key={i}>
                    <label className="block text-xs font-semibold mb-1">{f.label}</label>
                    <input type={f.type || 'text'} placeholder={f.ph} className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-sm focus:border-[#0077B6] outline-none" />
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => toggle(intg.key)} className="w-full py-2.5 border-2 border-[#0077B6] text-[#0077B6] text-sm font-semibold rounded-xl hover:bg-[#0077B6] hover:text-white transition-all">
              {openFields[intg.key] ? 'Ascunde' : 'Configurează'}
            </button>
          </div>
        ))}

        {/* Facebook Pixel Integration */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl font-extrabold bg-[#1877F2]">f</div>
            <div>
              <h4 className="font-bold">Facebook Pixel</h4>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${settings.facebookPixelId ? 'bg-emerald-100 text-emerald-600' : 'text-slate-400 bg-slate-100'}`}>
                {settings.facebookPixelId ? 'Conectat' : 'Neconectat'}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-4">Adaugă ID-ul Pixelului pentru a urmări evenimentele PageView și Purchase (ca EasySell).</p>

          {openFields['fbPixel'] && (
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Pixel ID (ex: 123456789012345)</label>
                <input
                  type="text"
                  placeholder="ID Pixel"
                  value={fbPixelId}
                  onChange={e => setFbPixelId(e.target.value)}
                  className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-sm focus:border-[#0077B6] outline-none"
                />
              </div>
              <button
                onClick={saveSettings}
                disabled={isSaving}
                className="w-full py-2.5 bg-[#0077B6] text-white text-sm font-semibold rounded-xl hover:bg-[#005f8f] transition-all"
              >
                {isSaving ? 'Se salvează...' : 'Salvează Setările'}
              </button>
            </div>
          )}

          <button onClick={() => toggle('fbPixel')} className="w-full py-2.5 border-2 border-[#0077B6] text-[#0077B6] text-sm font-semibold rounded-xl hover:bg-[#0077B6] hover:text-white transition-all mt-2">
            {openFields['fbPixel'] ? 'Ascunde' : 'Configurează'}
          </button>
        </div>

      </div>
    </>
  )
}

// ═══════════ ORDER DETAIL MODAL ═══════════
function OrderDetailModal({ orderId, onClose }) {
  const { orders } = useAppStore()
  const order = orders.find(o => o.id === orderId)
  if (!order) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[400]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[401] bg-white rounded-3xl shadow-2xl max-w-[700px] w-[90%] max-h-[85vh] overflow-y-auto animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-bold text-lg">Comandă {order.id}</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-lg transition-colors">✕</button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-sm mb-2">Date Client</h4>
              <div className="text-sm text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">{order.customer.firstName} {order.customer.lastName}</p>
                <p>📧 {order.customer.email}</p>
                <p>📞 {order.customer.phone}</p>
                <p>📍 {order.customer.address}</p>
                <p>{order.customer.city}, {order.customer.county} {order.customer.postalCode || ''}</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-2">Info Comandă</h4>
              <div className="text-sm text-slate-500 space-y-1">
                <p><strong>Status:</strong> <StatusBadge status={order.status} /></p>
                <p><strong>Plată:</strong> {order.paymentMethod === 'ramburs' ? 'Ramburs' : 'Card'}</p>
                <p><strong>AWB:</strong> {order.awb || 'Negenerat'}</p>
                <p><strong>Factură:</strong> {order.invoiceNumber || 'Negenerată'}</p>
                <p><strong>Data:</strong> {fmtDate(order.createdAt)}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-2">Produse Comandate</h4>
            <div className="bg-slate-50 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-100"><Th>Produs</Th><Th>Cant.</Th><Th>Preț</Th><Th>Subtotal</Th></tr></thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="border-t border-slate-100">
                      <Td>{item.productName || item.name}</Td>
                      <Td>×{item.quantity || item.qty || 1}</Td>
                      <Td>{item.price.toFixed(2)} lei</Td>
                      <Td className="font-bold">{(item.price * (item.quantity || item.qty || 1)).toFixed(2)} lei</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-8 text-sm pt-4 border-t border-slate-100">
            <span>Subtotal: <strong>{order.subtotal.toFixed(2)} lei</strong></span>
            <span>Livrare: <strong>{order.shipping === 0 ? 'GRATUITĂ' : order.shipping.toFixed(2) + ' lei'}</strong></span>
            <span className="text-lg">Total: <strong className="text-[#0077B6]">{order.total.toFixed(2)} lei</strong></span>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-2">Istoric Status</h4>
            <div className="space-y-2">
              {order.statusHistory.map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-slate-50">
                  <StatusBadge status={h.status} />
                  <span className="text-slate-400">{fmtDateTime(h.date)}</span>
                  {h.note && <span>— {h.note}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ═══════════ PRODUCT FORM MODAL ═══════════
function ProductFormModal({ product, onClose, onSave, api }) {
  const showToast = useToast()
  const [activeTab, setActiveTab] = useState('basic') // basic, landing, reviews

  const [form, setForm] = useState({
    name: product?.name || '', slug: product?.slug || '',
    price: product?.price || '', oldPrice: product?.oldPrice || '',
    category: product?.category || '', stock: product?.stock || '',
    shortDescription: product?.shortDescription || '', description: product?.description || '',
    features: product?.features?.join('\n') || '',
    shopifyVariantId: product?.shopifyVariantId || '',
  })

  const [images, setImages] = useState(product?.images || [])
  const [bundles, setBundles] = useState(
    product?.bundles || [{ qty: 1, label: '1x buc', price: product?.price || 0, oldPrice: product?.oldPrice || null, badge: '', badgeColor: 'bg-slate-500', freeShipping: false, shopifyVariantId: '' }]
  )

  const [landingConfig, setLandingConfig] = useState(product?.landingConfig || {
    enabled: false, themeColor: '#bba16d',
    heroTitle: 'Transformă-ți Zâmbetul Instant', heroSubtitle: 'Zâmbet Perfect Fără Efort', heroImage: '',
    heroTitleColor: '#0F172A', heroSubtitleColor: '#64748B',
    specTitle: 'CE SPUN SPECIALIȘTII', specText: 'Soluție modernă și non-invazivă...', specImage: '',
    specTitleColor: '#0F172A', specTextColor: '#64748B', specBadgeBg: '',
    specVerifiedTitle: '#1e293b', specVerifiedSub: '#94a3b8',
    detailsTitle: 'Detalii Produs 📋', detailsSubtitle: 'Tot ce trebuie să știi', detailsImage: '',
    detailsTitleColor: '#FFFFFF', detailsSubtitleColor: '#FFFFFF', detailsTextColor: '#FFFFFF',
    storyTitle: 'Povestea Corinei', storyText: 'Mereu am fost complexată...', storyImgLeft: '', storyImgRight: '',
    storyTitleColor: '#FFFFFF', storyTextColor: '#475569',
    photoReviewsBg: '#f1f5f9',
    photoReviewsHeadingColor: '#0f172a',
    photoReviewsCardTitleColor: '#0f172a',
    photoReviewsCardTextColor: '#475569',
    photoReviewsCardNameColor: '#1e293b',
    photoReviews: [],
  })

  const [reviews, setReviews] = useState(product?.reviews || [])
  const [config, setConfig] = useState(product?.config || { showDiscount: true, showBestSeller: true })
  const [isUploading, setIsUploading] = useState(false)

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  // Cloudinary Helper
  const uploadFile = async (file) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)

    const resp = await fetch(url, { method: 'POST', body: fd })
    if (!resp.ok) throw new Error('Cloudinary Upload Failed')
    const res = await resp.json()
    return res.secure_url
  }

  // Basic Handlers
  const handleBundleChange = (index, field, value) => {
    const newBundles = [...bundles]
    newBundles[index][field] = value
    setBundles(newBundles)
  }
  const addBundle = () => setBundles([...bundles, { qty: bundles.length + 1, label: `${bundles.length + 1}x buc`, price: 0, oldPrice: null, badge: '', badgeColor: 'bg-slate-500', freeShipping: false, shopifyVariantId: '' }])
  const removeBundle = (index) => setBundles(bundles.filter((_, i) => i !== index))

  // File Upload Handlers
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file)
  })

  const handleImageUpload = async (e, setter, isArray = true) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setIsUploading(true)
    try {
      if (isArray) {
        const urls = await Promise.all(files.map(f => uploadFile(f)))
        setter(prev => [...prev, ...urls])
      } else {
        const url = await uploadFile(files[0])
        setter(url)
      }
    } catch (err) {
      alert("Eroare la încărcarea imaginii în cloud: " + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  // Reviews Handlers
  const addReview = (type) => {
    const base = { id: Date.now(), type, name: '', text: '', rating: 5, date: '', avatar: '', image: '', title: '' }
    setReviews([base, ...reviews])
  }
  const updateReview = (index, field, value) => {
    const r = [...reviews]; r[index][field] = value; setReviews(r)
  }
  const removeReview = (index) => setReviews(reviews.filter((_, i) => i !== index))

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleNameChange = (e) => {
    const name = e.target.value
    setForm(f => ({
      ...f, name, slug: !product ? name.toLowerCase().replace(/[ăâ]/g, 'a').replace(/[îì]/g, 'i').replace(/[șş]/g, 's').replace(/[țţ]/g, 't').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : f.slug
    }))
  }
  const handleLandingChange = (e) => setLandingConfig(l => ({ ...l, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      name: form.name, slug: form.slug, price: parseFloat(form.price) || 0,
      oldPrice: parseFloat(form.oldPrice) || null, category: form.category || 'Curățenie',
      stock: parseInt(form.stock) || 0, shortDescription: form.shortDescription,
      description: form.description, features: form.features.split('\n').map(f => f.trim()).filter(Boolean),
      shopifyVariantId: form.shopifyVariantId || null,
      images, landingConfig, reviews, config,
      bundles: bundles.map(b => ({
        ...b,
        price: parseFloat(b.price) || 0,
        oldPrice: parseFloat(b.oldPrice) || null,
        qty: parseInt(b.qty) || 1,
        shopifyVariantId: b.shopifyVariantId || null,
      }))
    }

    try {
      if (product) { await api.updateProduct(product.id, data); showToast('Produs actualizat!') }
      else { await api.addProduct(data); showToast('Produs adăugat!') }
      onSave()
      onClose()
    } catch (err) {
      console.error(err)
      alert(`Eroare: ${err.message}`)
    }
  }

  const isSubmitDisabled = isUploading || !form.name || !form.price || !form.slug

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[400]" onClick={onClose} />
      <div className="fixed top-[3vh] bottom-[3vh] left-1/2 -translate-x-1/2 z-[401] bg-white rounded-3xl shadow-2xl max-w-[1100px] w-[98%] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
          <h3 className="font-bold text-lg">{product ? 'Editează Produsul' : 'Creare Produs Nou'}</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-lg">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-slate-100 bg-slate-50/50">
          {[
            { id: 'basic', label: '📦 Informații Bază' },
            { id: 'landing', label: '🎨 Design Landing Page' },
            { id: 'reviews', label: '⭐ Recenzii Custom' }
          ].map(t => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
              className={`px-5 py-3 font-semibold text-sm mr-2 border-b-2 transition-all ${activeTab === t.id ? 'border-[#0077B6] text-[#0077B6]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-fade-in">
              <FormInput label="Nume Sistematic Produs *" name="name" value={form.name} onChange={handleNameChange} required placeholder="Ex: Fațete Snap Smile" />
              <FormInput label="Slug (URL) *" name="slug" value={form.slug} onChange={handleChange} required />
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Preț Actual (lei) *" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required placeholder="149.99" />
                <FormInput label="Preț Vechi (lei)" name="oldPrice" type="number" step="0.01" value={form.oldPrice} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Categorie" name="category" value={form.category} onChange={handleChange} />
                <FormInput label="Stoc" name="stock" type="number" value={form.stock} onChange={handleChange} />
              </div>

              {/* ── Descrieri Produs ── */}
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700">Descriere Scurtă <span className="text-slate-400 font-normal">(apare sub produs în magazin)</span></label>
                <textarea
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Ex: Curățenie impecabilă pentru întreaga casă."
                  className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:border-[#0077B6] outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700">Descriere Completă <span className="text-slate-400 font-normal">(textul albastru de sub titlu pe pagina produsului)</span></label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Ex: Formula concentrată pentru curățenie perfectă. Elimină 99.9% din bacterii și lasă un parfum proaspăt de durată."
                  className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:border-[#0077B6] outline-none resize-none"
                />
              </div>

              {/* ── Shopify Variant ID ── */}
              <div className="flex items-start gap-3 p-4 bg-[#96bf48]/8 border border-[#96bf48]/30 rounded-xl">
                <span className="text-2xl flex-shrink-0">🛍️</span>
                <div className="flex-1">
                  <FormInput
                    label="Shopify Variant ID (pentru sincronizare comenzi)"
                    name="shopifyVariantId"
                    value={form.shopifyVariantId}
                    onChange={handleChange}
                    placeholder="Ex: 48291837462651"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Găsește Variant ID în Shopify Admin → Products → selectează produsul → URL-ul variantei (ex: ...variants/<strong>48291837462651</strong>). Lasă gol dacă nu ai Shopify.
                  </p>
                </div>
              </div>

              {/* ── Variante Culoare ── */}
              <div className="flex gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-4 mb-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${config.hasColors ? 'bg-[#0077B6] border-[#0077B6]' : 'bg-white border-slate-300 group-hover:border-[#0077B6]'}`}>
                    {config.hasColors && <span className="text-white text-xs">✓</span>}
                  </div>
                  <input type="checkbox" checked={config.hasColors || false} onChange={e => setConfig({ ...config, hasColors: e.target.checked })} className="hidden" />
                  <span className="text-sm font-semibold text-slate-700">Produsul are mai multe culori?</span>
                </label>
              </div>

              {config.hasColors && (
                <div className="p-4 border border-[#0077B6]/20 bg-[#0077B6]/5 rounded-xl mb-4">
                  <FormInput
                    label="Culori Disponibile (separate prin virgulă) *"
                    name="colorsList"
                    value={config.colorsList || ''}
                    onChange={e => setConfig({ ...config, colorsList: e.target.value })}
                    placeholder="Ex: Roșu, Albastru, Negru Elegant"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Clienții vor alege obligatoriu una din aceste culori pe pagină, și va fi trimisă în comandă.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-1.5">Imagini Produs (pentru magazinul standard)</label>
                <div className="flex flex-wrap gap-4 items-start">
                  {images.map((img, i) => (
                    <div
                      key={img} // using img as key is safer for drag and drop if they are unique
                      className="relative w-24 h-24 rounded-xl border border-slate-200 overflow-hidden group cursor-move shadow-sm hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIdx = parseInt(e.dataTransfer.getData('text/plain', 10));
                        if (isNaN(fromIdx) || fromIdx === i) return;
                        const arr = [...images];
                        const [moved] = arr.splice(fromIdx, 1);
                        arr.splice(i, 0, moved);
                        setImages(arr);
                      }}
                    >
                      <img src={img} alt="preview" className="w-full h-full object-cover pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Dă click pentru a șterge. Trage pentru a muta."
                      >
                        <span className="text-2xl mb-1">✋</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider hover:text-red-400">Șterge</span>
                      </button>
                    </div>
                  ))}
                  <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#0077B6] hover:bg-[#0077B6]/5 flex items-center justify-center cursor-pointer transition-colors">
                    <span className="text-2xl text-slate-400">➕</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleImageUpload(e, setImages, true)} />
                  </label>
                </div>
              </div>

              <div className="flex gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${config.showDiscount ? 'bg-[#0077B6] border-[#0077B6]' : 'bg-white border-slate-300 group-hover:border-[#0077B6]'}`}>
                    {config.showDiscount && <span className="text-white text-xs">✓</span>}
                  </div>
                  <input type="checkbox" checked={config.showDiscount} onChange={e => setConfig({ ...config, showDiscount: e.target.checked })} className="hidden" />
                  <span className="text-sm font-semibold text-slate-700">Afișează Procent Discount</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${config.showBestSeller ? 'bg-[#0077B6] border-[#0077B6]' : 'bg-white border-slate-300 group-hover:border-[#0077B6]'}`}>
                    {config.showBestSeller && <span className="text-white text-xs">✓</span>}
                  </div>
                  <input type="checkbox" checked={config.showBestSeller} onChange={e => setConfig({ ...config, showBestSeller: e.target.checked })} className="hidden" />
                  <span className="text-sm font-semibold text-slate-700">Afișează Etichetă Best Seller</span>
                </label>
              </div>

              {/* BUNDLE EDITOR */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-bold text-slate-800">Oferte Checkout (Pachete)</label>
                  <button type="button" onClick={addBundle} className="text-xs font-bold text-[#0077B6] hover:underline bg-[#0077B6]/10 px-3 py-1.5 rounded-lg">➕ Adaugă Pachet</button>
                </div>
                <div className="space-y-3">
                  {bundles.map((bundle, i) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3 relative">
                      {bundles.length > 1 && <button type="button" onClick={() => removeBundle(i)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 text-lg">✕</button>}
                      <div className="flex gap-3">
                        <div className="w-16"><label className="text-[10px] uppercase font-bold text-slate-500">Buc.</label><input type="number" value={bundle.qty} onChange={e => handleBundleChange(i, 'qty', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm" /></div>
                        <div className="flex-1"><label className="text-[10px] uppercase font-bold text-slate-500">Label Text</label><input value={bundle.label} onChange={e => handleBundleChange(i, 'label', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm" /></div>
                        <div className="w-24"><label className="text-[10px] uppercase font-bold text-slate-500">Preț Nou</label><input type="number" step="0.01" value={bundle.price} onChange={e => handleBundleChange(i, 'price', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm" /></div>
                        <div className="w-24"><label className="text-[10px] uppercase font-bold text-slate-500">Preț Vechi</label><input type="number" step="0.01" value={bundle.oldPrice || ''} onChange={e => handleBundleChange(i, 'oldPrice', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm" /></div>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        <div className="flex-1 min-w-[160px]"><label className="text-[10px] uppercase font-bold text-slate-500">Text Etichetă (Badge)</label><input value={bundle.badge} onChange={e => handleBundleChange(i, 'badge', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm" /></div>
                        <div className="w-48"><label className="text-[10px] uppercase font-bold text-slate-500">Culoare</label><select value={bundle.badgeColor} onChange={e => handleBundleChange(i, 'badgeColor', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm bg-white"><option value="bg-slate-500">Gri</option><option value="bg-[#bba16d]">Auriu VIP</option><option value="bg-[#0F172A]">Negru Elegant</option><option value="bg-red-500">Roșu</option><option value="bg-[#0077B6]">Albastru</option></select></div>
                        <div className="w-auto flex items-end pb-2">
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                            <input type="checkbox" checked={bundle.freeShipping || false} onChange={e => handleBundleChange(i, 'freeShipping', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-[#0077B6] focus:ring-[#0077B6]" />
                            <span className="mt-0.5">Transport Gratuit</span>
                          </label>
                        </div>
                      </div>
                      {/* Shopify Variant ID per bundle */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                        <span className="text-base">🛍️</span>
                        <div className="flex-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Shopify Variant ID (pachet)</label>
                          <input
                            value={bundle.shopifyVariantId || ''}
                            onChange={e => handleBundleChange(i, 'shopifyVariantId', e.target.value)}
                            placeholder="Ex: 48291837462651 (lasă gol pt. a folosi cel de produs)"
                            className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LANDING PAGE */}
          {activeTab === 'landing' && (
            <div className="space-y-6 animate-fade-in">
              {/* Info banner */}
              <div className="bg-[#0077B6]/8 border border-[#0077B6]/20 text-[#0077B6] p-4 rounded-xl text-sm font-medium flex items-start gap-3">
                <span className="text-xl flex-shrink-0">🎨</span>
                <span>
                  Toate produsele folosesc <strong>un singur template landing page</strong>.
                  Personalizează textele, imaginile și culorile pentru fiecare produs individual de mai jos.
                </span>
              </div>

              {/* ── Beneficii Produs (Features) ── */}
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-emerald-800 text-sm flex items-center gap-2">
                    ✅ Beneficii Produs
                    <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                      {form.features.split('\n').filter(f => f.trim()).length} bife
                    </span>
                  </h4>
                  <span className="text-[11px] text-emerald-600">afișate cu ✓ pe pagina produsului</span>
                </div>
                <textarea
                  name="features"
                  value={form.features}
                  onChange={handleChange}
                  rows={6}
                  placeholder={"Formula concentrată — randament dublu\nElimină 99.9% bacterii\nParfum proaspăt de lungă durată\nSigur pentru toate suprafețele\nBiodegradabil & Eco-friendly\n🚚 Livrare RAPIDĂ — Plata la livrare (RAMBURS)"}
                  className="w-full p-3 border border-emerald-200 rounded-xl text-sm font-mono focus:border-emerald-500 outline-none resize-none bg-white leading-relaxed"
                />
                <p className="text-[11px] text-emerald-600 mt-1.5 font-medium">
                  Un beneficiu per linie. Poți folosi emoji la început (ex: 🚚 Livrare RAPIDĂ).
                </p>
                {form.features.split('\n').filter(f => f.trim()).length > 0 && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Previzualizare:</p>
                    <ul className="space-y-1.5">
                      {form.features.split('\n').filter(f => f.trim()).map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="w-5 h-5 rounded bg-[#0077B6] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[10px] font-bold">✓</span>
                          </span>
                          {f.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Section Toggles */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="font-bold text-[#0077B6] mb-4 uppercase text-xs tracking-widest border-b border-slate-200 pb-2">👁️ Secțiuni Vizibile pe Landing Page</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'showPhotoReviews', label: '📸 Recenzii cu Foto (primele)' },
                    { key: 'showSpec', label: '🔬 Secțiunea Specialiști' },
                    { key: 'showDetails', label: '📋 Detalii Tehnice Produs' },
                    { key: 'showStory', label: '📖 Povestea Clientului' },
                    { key: 'showFbReviews', label: '💬 Recenzii Facebook' },
                    { key: 'showClientReviews', label: '⭐ Recenzii Clienți Grid' },
                  ].map(({ key, label }) => {
                    const isOn = landingConfig[key] !== false
                    return (
                      <label key={key} className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-xl border border-slate-200 hover:border-[#0077B6]/40 transition-all group">
                        <div
                          onClick={() => setLandingConfig(l => ({ ...l, [key]: !isOn }))}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${isOn ? 'bg-[#0077B6] border-[#0077B6]' : 'bg-white border-slate-300 group-hover:border-[#0077B6]'}`}
                        >
                          {isOn && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{label}</span>
                        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${isOn ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {isOn ? 'Activ' : 'Ascuns'}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Theme Color */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="font-bold text-[#0077B6] mb-4 uppercase text-xs tracking-widest border-b border-slate-200 pb-2">🎨 Culoare Temă Produs</h4>
                <div className="flex items-center gap-4">
                  <input type="color" name="themeColor" value={landingConfig.themeColor || '#0077B6'} onChange={handleLandingChange} className="w-14 h-14 rounded-xl cursor-pointer border-2 border-slate-200 p-1" />
                  <div>
                    <div className="text-sm font-bold text-slate-700">Culoare Principală</div>
                    <div className="text-xs text-slate-400 mt-0.5">Folosită pentru butoane, accenturi și secțiuni colorate</div>
                    <div className="text-xs font-mono text-slate-500 mt-1">{landingConfig.themeColor || '#0077B6'}</div>
                  </div>
                  <div className="ml-auto w-12 h-12 rounded-xl shadow-inner" style={{ background: landingConfig.themeColor || '#0077B6' }} />
                </div>
              </div>

              {/* Hero */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-[#0077B6] mb-2 uppercase text-xs tracking-widest border-b border-slate-200 pb-2">1. Secțiunea Hero (Prima Vedere)</h4>
                <p className="text-xs text-slate-500">Titlul și subtitlul mari din zona principală. Dacă lași gol, se va afișa numele produsului.</p>
                <div className="space-y-3">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <FormInput label="Titlu Principal Hero (opțional)" name="heroTitle" value={landingConfig.heroTitle} onChange={handleLandingChange} placeholder="Ex: Curățenie Perfectă în 5 Minute" />
                    </div>
                    <div className="flex flex-col items-center gap-1 mb-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Culoare</label>
                      <input type="color" name="heroTitleColor" value={landingConfig.heroTitleColor || '#0F172A'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                    </div>
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <FormInput label="Subtitlu (opțional)" name="heroSubtitle" value={landingConfig.heroSubtitle} onChange={handleLandingChange} placeholder="Ex: Formula profesională pentru casa ta" />
                    </div>
                    <div className="flex flex-col items-center gap-1 mb-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Culoare</label>
                      <input type="color" name="heroSubtitleColor" value={landingConfig.heroSubtitleColor || '#64748B'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Imagine Hero Principală (opțional)</label>
                  <p className="text-xs text-slate-400 mb-2">Dacă este setată, va apărea prima în galerie. Altfel, se folosesc imaginile de la produse.</p>
                  <ImagePicker value={landingConfig.heroImage} onChange={v => setLandingConfig(l => ({ ...l, heroImage: v }))} handleUpload={handleImageUpload} />
                </div>
              </div>

              {/* Specialists */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-[#0077B6] mb-2 uppercase text-xs tracking-widest border-b border-slate-200 pb-2">2. Secțiunea Specialiști / Experți</h4>
                <p className="text-xs text-slate-500">Dacă lași titlul și textul goale, această secțiune nu va fi afișată.</p>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <FormInput label="Titlu Secțiune" name="specTitle" value={landingConfig.specTitle} onChange={handleLandingChange} placeholder="Ex: CE SPUN SPECIALIȘTII" />
                  </div>
                  <div className="flex flex-col items-center gap-1 mb-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Culoare H2</label>
                    <input type="color" name="specTitleColor" value={landingConfig.specTitleColor || '#0F172A'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                  </div>
                </div>
                {/* Badge + verified colors */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase text-center">Fundal Badge</label>
                    <input type="color" name="specBadgeBg" value={landingConfig.specBadgeBg || landingConfig.themeColor || '#0077B6'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase text-center">Text verificat</label>
                    <input type="color" name="specVerifiedTitle" value={landingConfig.specVerifiedTitle || '#1e293b'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase text-center">Subtext verif.</label>
                    <input type="color" name="specVerifiedSub" value={landingConfig.specVerifiedSub || '#94a3b8'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase text-center">Culoare Text</label>
                    <input type="color" name="specTextColor" value={landingConfig.specTextColor || '#64748B'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1.5">Text Descriere</label>
                    <textarea name="specText" value={landingConfig.specText} onChange={handleLandingChange}
                      className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:border-[#0077B6] outline-none resize-y"
                      rows="4" placeholder="Ex: Produsul nostru a fost testat și recomandat de specialiști..." />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Imagine Specialiști / Înainte-După</label>
                  <ImagePicker value={landingConfig.specImage} onChange={v => setLandingConfig(l => ({ ...l, specImage: v }))} handleUpload={handleImageUpload} />
                </div>
              </div>

              {/* Details Info */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-[#0077B6] mb-2 uppercase text-xs tracking-widest border-b border-slate-200 pb-2">3. Secțiunea Detalii Tehnice</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <FormInput label="Titlu Detalii" name="detailsTitle" value={landingConfig.detailsTitle || 'Detalii Produs 📋'} onChange={handleLandingChange} />
                    </div>
                    <div className="flex flex-col items-center gap-1 mb-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Culoare</label>
                      <input type="color" name="detailsTitleColor" value={landingConfig.detailsTitleColor || '#FFFFFF'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                    </div>
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <FormInput label="Subtitlu Detalii" name="detailsSubtitle" value={landingConfig.detailsSubtitle || 'Tot ce trebuie să știi'} onChange={handleLandingChange} />
                    </div>
                    <div className="flex flex-col items-center gap-1 mb-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Culoare</label>
                      <input type="color" name="detailsSubtitleColor" value={landingConfig.detailsSubtitleColor || '#FFFFFF'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex-1 text-sm font-semibold text-slate-700">Culoare Text Beneficii (Lista)</div>
                  <input type="color" name="detailsTextColor" value={landingConfig.detailsTextColor || '#FFFFFF'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Imagine Grafică Detalii (opțional)</label>
                  <ImagePicker value={landingConfig.detailsImage} onChange={v => setLandingConfig(l => ({ ...l, detailsImage: v }))} handleUpload={handleImageUpload} />
                </div>
              </div>

              {/* Story */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-[#0077B6] mb-2 uppercase text-xs tracking-widest border-b border-slate-200 pb-2">4. Povestea unui Client</h4>
                <p className="text-xs text-slate-500">Dacă lași titlul și textul goale, secțiunea nu va apărea.</p>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <FormInput label="Titlu Poveste" name="storyTitle" value={landingConfig.storyTitle} onChange={handleLandingChange} placeholder="Ex: Povestea Mariei" />
                  </div>
                  <div className="flex flex-col items-center gap-1 mb-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Culoare</label>
                    <input type="color" name="storyTitleColor" value={landingConfig.storyTitleColor || '#FFFFFF'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1.5">Text Poveste</label>
                    <textarea name="storyText" value={landingConfig.storyText} onChange={handleLandingChange}
                      className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:border-[#0077B6] outline-none resize-y"
                      rows="3" placeholder="Ex: Mereu am visat la o casă curată dar nu aveam timp..." />
                  </div>
                  <div className="flex flex-col items-center gap-1 mt-7">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Culoare Text</label>
                    <input type="color" name="storyTextColor" value={landingConfig.storyTextColor || '#475569'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">📸 Poză Rezultat (Stânga)</label>
                    <ImagePicker value={landingConfig.storyImgLeft} onChange={v => setLandingConfig(l => ({ ...l, storyImgLeft: v }))} handleUpload={handleImageUpload} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">📖 Poză Instrucțiuni (Dreapta)</label>
                    <ImagePicker value={landingConfig.storyImgRight} onChange={v => setLandingConfig(l => ({ ...l, storyImgRight: v }))} handleUpload={handleImageUpload} />
                  </div>
                </div>
              </div>

              {/* ── PHOTO REVIEWS ── */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-[#0077B6] mb-2 uppercase text-xs tracking-widest border-b border-slate-200 pb-2">
                  5. Recenzii cu Foto — Carduri
                </h4>
                <p className="text-xs text-slate-500">Dacă nu adaugi niciun card, secțiunea nu apare. Fiecare card are foto sus, titlu, stele, text și badge "Cumpărător verificat".</p>

                {/* BG + Text Colors */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase text-center">Fundal</label>
                    <input type="color" name="photoReviewsBg" value={landingConfig.photoReviewsBg || '#f1f5f9'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase text-center">Titlu secț.</label>
                    <input type="color" name="photoReviewsHeadingColor" value={landingConfig.photoReviewsHeadingColor || '#0f172a'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase text-center">Titlu card</label>
                    <input type="color" name="photoReviewsCardTitleColor" value={landingConfig.photoReviewsCardTitleColor || '#0f172a'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase text-center">Text recenzie</label>
                    <input type="color" name="photoReviewsCardTextColor" value={landingConfig.photoReviewsCardTextColor || '#475569'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase text-center">Nume client</label>
                    <input type="color" name="photoReviewsCardNameColor" value={landingConfig.photoReviewsCardNameColor || '#1e293b'} onChange={handleLandingChange} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-200 p-0.5" />
                  </div>
                </div>

                {/* Add card button */}
                <button
                  type="button"
                  onClick={() => setLandingConfig(l => ({
                    ...l,
                    photoReviews: [...(l.photoReviews || []), { image: '', title: '', text: '', name: '', rating: 5 }]
                  }))}
                  className="w-full py-3 border-2 border-dashed border-[#0077B6]/40 hover:border-[#0077B6] hover:bg-[#0077B6]/5 text-[#0077B6] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  📸 Adaugă Card Recenzie
                </button>

                {/* Cards */}
                <div className="space-y-4">
                  {(landingConfig.photoReviews || []).map((card, idx) => (
                    <div key={idx} className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3 relative">
                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setLandingConfig(l => ({
                          ...l,
                          photoReviews: l.photoReviews.filter((_, i) => i !== idx)
                        }))}
                        className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center text-sm font-bold transition-all"
                      >✕</button>

                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Card #{idx + 1}</div>

                      {/* Photo */}
                      <div>
                        <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5">📷 Fotografie (sus de card)</label>
                        <ImagePicker
                          value={card.image}
                          onChange={v => setLandingConfig(l => {
                            const arr = [...l.photoReviews]
                            arr[idx] = { ...arr[idx], image: v }
                            return { ...l, photoReviews: arr }
                          })}
                          handleUpload={handleImageUpload}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Title */}
                        <div>
                          <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Titlu Card</label>
                          <input
                            value={card.title}
                            onChange={e => setLandingConfig(l => {
                              const arr = [...l.photoReviews]
                              arr[idx] = { ...arr[idx], title: e.target.value }
                              return { ...l, photoReviews: arr }
                            })}
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-[#0077B6] outline-none"
                            placeholder="ex: Calitate TOP"
                          />
                        </div>

                        {/* Rating */}
                        <div>
                          <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Rating Stele (1-5)</label>
                          <input
                            type="number" min="1" max="5"
                            value={card.rating}
                            onChange={e => setLandingConfig(l => {
                              const arr = [...l.photoReviews]
                              arr[idx] = { ...arr[idx], rating: parseInt(e.target.value) || 5 }
                              return { ...l, photoReviews: arr }
                            })}
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-[#0077B6] outline-none"
                          />
                        </div>
                      </div>

                      {/* Review text */}
                      <div>
                        <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Text Recenzie</label>
                        <textarea
                          value={card.text}
                          onChange={e => setLandingConfig(l => {
                            const arr = [...l.photoReviews]
                            arr[idx] = { ...arr[idx], text: e.target.value }
                            return { ...l, photoReviews: arr }
                          })}
                          className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-[#0077B6] outline-none resize-y"
                          rows="3"
                          placeholder="ex: Produsul este fantastic, îl recomand tuturor..."
                        />
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Nume Client</label>
                        <input
                          value={card.name}
                          onChange={e => setLandingConfig(l => {
                            const arr = [...l.photoReviews]
                            arr[idx] = { ...arr[idx], name: e.target.value }
                            return { ...l, photoReviews: arr }
                          })}
                          className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:border-[#0077B6] outline-none"
                          placeholder="ex: Alexandra Dobrescu"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold">Gestionare Recenzii</h4>
                  <p className="text-sm text-slate-500">Acestea vor fi rândate direct în secțiunile speciale ale Landing Page-ului.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button type="button" onClick={() => addReview('facebook')} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm">➕ FB Review</button>
                  <button type="button" onClick={() => addReview('customer')} className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg shadow-sm">➕ Client Grid</button>
                  <button type="button" onClick={() => addReview('photo_review')} className="px-4 py-2 bg-pink-500 text-white text-sm font-bold rounded-lg shadow-sm">📸 Photo Card</button>
                </div>
              </div>

              {reviews.length === 0 && <p className="text-center text-slate-400 py-10">Nu există recenzii adăugate manual.</p>}

              <div className="space-y-4">
                {reviews.map((r, i) => (
                  <div key={r.id} className="p-4 border-2 border-slate-200 rounded-xl bg-white relative">
                    <button type="button" onClick={() => removeReview(i)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">✕</button>

                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 auto text-xs font-bold rounded text-white ${r.type === 'facebook' ? 'bg-blue-600'
                        : r.type === 'photo_review' ? 'bg-pink-500'
                          : 'bg-slate-800'
                        }`}>
                        {r.type === 'facebook' ? 'Facebook Comment' : r.type === 'photo_review' ? '📸 Photo Card Review' : 'Client Grid Review'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Common fields */}
                      <div className="col-span-full sm:col-span-1">
                        <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Nume Recenzent</label>
                        <input value={r.name} onChange={e => updateReview(i, 'name', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="ex: Maria Popescu" />
                      </div>

                      {r.type === 'facebook' && (
                        <div className="col-span-full sm:col-span-1">
                          <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Timp (ex: 1m, 2h)</label>
                          <input value={r.date} onChange={e => updateReview(i, 'date', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="ex: 15m" />
                        </div>
                      )}
                      {(r.type === 'customer' || r.type === 'photo_review') && (
                        <div className="col-span-full sm:col-span-1">
                          <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Rating Stele (1-5)</label>
                          <input type="number" min="1" max="5" value={r.rating} onChange={e => updateReview(i, 'rating', parseInt(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
                        </div>
                      )}
                      {r.type === 'photo_review' && (
                        <div className="col-span-full">
                          <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Titlu Card (ex: "Rezultate Excelente!")</label>
                          <input value={r.title || ''} onChange={e => updateReview(i, 'title', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="ex: Calitate TOP" />
                        </div>
                      )}

                      <div className="col-span-full">
                        <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">Text Recenzie</label>
                        <textarea value={r.text} onChange={e => updateReview(i, 'text', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm" rows="2" placeholder="Comentariul propriu-zis..." />
                      </div>

                      {/* Image fields */}
                      <div className="col-span-full">
                        <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
                          {r.type === 'facebook' ? 'Poza Avatar Profil' : r.type === 'photo_review' ? 'Fotografie Client (sus de card)' : 'Poza Client (Mare)'}
                        </label>
                        <ImagePicker
                          value={r.type === 'facebook' ? r.avatar : r.image}
                          onChange={v => updateReview(i, r.type === 'facebook' ? 'avatar' : 'image', v)}
                          handleUpload={handleImageUpload}
                          small={r.type === 'facebook'}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-white">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-xl">Anulează</button>
          <button onClick={handleSubmit} disabled={isSubmitDisabled}
            className={`px-6 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${isSubmitDisabled ? 'bg-slate-400 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-[#0077B6] to-[#00B4D8] hover:-translate-y-0.5'}`}>
            {isUploading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Urcăm pozele...</> : <><span className="text-lg">💾</span> Salvează Toate Datele</>}
          </button>
        </div>
      </div>
    </>
  )
}

function ImagePicker({ value, onChange, handleUpload, small = false }) {
  if (value) {
    return (
      <div className={`relative ${small ? 'w-16 h-16' : 'w-full h-32'} rounded-xl border border-slate-200 overflow-hidden group bg-slate-100`}>
        <img src={value} alt="preview" className="w-full h-full object-cover" />
        <button type="button" onClick={() => onChange('')} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs font-bold cursor-pointer">Șterge</button>
      </div>
    )
  }
  return (
    <label className={`block ${small ? 'w-16 h-16' : 'w-full h-32'} rounded-xl border-2 border-dashed border-slate-300 hover:border-[#0077B6] hover:bg-[#0077B6]/5 flex items-center justify-center cursor-pointer transition-colors bg-white`}>
      <span className="text-xl text-slate-400">🖼️</span>
      <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, onChange, false)} />
    </label>
  )
}

// ═══════════ SHARED COMPONENTS ═══════════
function StatCard({ icon, iconBg, label, value, trend }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center text-lg`}>{icon}</div>
      </div>
      <div className="font-['Outfit'] text-3xl font-extrabold mb-1">{value}</div>
      <div className="text-xs font-medium text-emerald-500">{trend}</div>
    </div>
  )
}

function StatusBadge({ status }) {
  return <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-500'}`}>{STATUS_LABELS[status] || status}</span>
}

function EmptyState({ icon, title, desc }) {
  return (
    <div className="text-center py-16 text-slate-400">
      <span className="text-5xl block mb-3">{icon}</span>
      <h3 className="font-bold text-slate-500 mb-1">{title}</h3>
      <p className="text-sm">{desc}</p>
    </div>
  )
}

function Th({ children }) { return <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{children}</th> }
function Td({ children, className = '' }) { return <td className={`px-5 py-3 ${className}`}>{children}</td> }

function FormInput({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5">{label}</label>
      <input {...props} className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-[#0077B6] focus:ring-4 focus:ring-[#0077B6]/10 outline-none transition-all" />
    </div>
  )
}

function fmtDate(d) { return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' }) }
function fmtDateTime(d) { return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
