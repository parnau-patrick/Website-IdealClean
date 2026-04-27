import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const AppContext = createContext()

export const useAppStore = () => useContext(AppContext)

const API_URL = '/api'

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [socket, setSocket] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState({})

  // ── Auth State ──
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ic_user') || 'null'))
  const [token, setToken] = useState(() => localStorage.getItem('ic_token') || null)

  const request = async (url, options = {}) => {
    const headers = { ...options.headers }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url, { ...options, headers })

    if (res.status === 401 || res.status === 403) {
      if (token) logout()
      throw new Error('Sesiune expirată. Te rugăm să te loghezi din nou.')
    }

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Error ${res.status}: ${res.statusText}`)
    return data
  }

  const api = {
    login: async (username, password) => {
      const data = await request(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('ic_token', data.token)
      localStorage.setItem('ic_user', JSON.stringify(data.user))
      return data
    },
    getProducts: () => request(`${API_URL}/products`),
    addProduct: (data) => request(`${API_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
    updateProduct: (id, data) => request(`${API_URL}/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
    getOrders: () => request(`${API_URL}/orders`),
    addOrder: (data) => request(`${API_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
    updateOrderStatus: (id, status, note) => request(`${API_URL}/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, note }) }),
    deleteOrder: (id) => request(`${API_URL}/orders/${id}`, { method: 'DELETE' }),
    getSettings: () => request(`${API_URL}/settings`),
    updateSettings: (data) => request(`${API_URL}/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('ic_token')
    localStorage.removeItem('ic_user')
  }

  const reloadProducts = () => {
    api.getProducts().then(setProducts).catch(err => console.error(err))
  }

  const reloadOrders = () => {
    if (token) api.getOrders().then(setOrders).catch(err => console.error(err))
  }

  // ── Capture Marketing Tracking (UTMs & Full URL) ──
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search)
      const hasUtm = Array.from(searchParams.keys()).some(k => k.startsWith('utm_') || k === 'fbclid')
      
      // Dacă avem parametri de tracking sau nu avem nimic salvat încă
      if (hasUtm || !localStorage.getItem('ic_tracking')) {
        const trackingData = {
          full_url: window.location.href,
          utm_source: searchParams.get('utm_source') || '',
          utm_medium: searchParams.get('utm_medium') || '',
          utm_campaign: searchParams.get('utm_campaign') || '',
          utm_term: searchParams.get('utm_term') || '',
          utm_content: searchParams.get('utm_content') || '',
          utm_id: searchParams.get('utm_id') || '',
          fbclid: searchParams.get('fbclid') || ''
        }
        
        // Curățăm valorile goale
        Object.keys(trackingData).forEach(key => !trackingData[key] && delete trackingData[key])
        
        // Salvăm doar dacă avem un URL valid sau am găsit utm-uri noi
        if (hasUtm || !localStorage.getItem('ic_tracking')) {
          localStorage.setItem('ic_tracking', JSON.stringify(trackingData))
        }
      }
    } catch(e) {}
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        const p = await api.getProducts()
        setProducts(p)
        const sData = await api.getSettings().catch(() => ({}))
        setSettings(sData)

        // Inject Facebook Pixel
        if (sData.facebookPixelId) {
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', sData.facebookPixelId);
          fbq('track', 'PageView');
        }

        if (token) {
          const o = await api.getOrders()
          setOrders(o)
        }
      } catch (err) {
        console.error("Init load failed:", err)
      } finally {
        setIsLoading(false)
      }
    }
    init()

    // Setup WebSocket — URL dinamic (funcționează atât local cât și în producție)
    const socketUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : window.location.origin
    const s = io(socketUrl, { transports: ['websocket', 'polling'] })
    setSocket(s)

    s.on('products_updated', reloadProducts)
    s.on('new_order', reloadOrders)
    s.on('order_updated', reloadOrders)

    return () => s.disconnect()
  }, [token])

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const todayOrders = orders.filter(o => new Date(o.createdAt) >= today)
  const monthOrders = orders.filter(o => new Date(o.createdAt) >= thisMonth)

  const stats = {
    totalOrders: orders.length, todayOrders: todayOrders.length, monthOrders: monthOrders.length,
    todayRevenue: todayOrders.reduce((s, o) => s + o.total, 0),
    monthRevenue: monthOrders.reduce((s, o) => s + o.total, 0),
    totalProducts: products.length, activeProducts: products.filter(p => p.active).length,
    pendingOrders: orders.filter(o => ['nou', 'confirmat'].includes(o.status)).length,
    shippedOrders: orders.filter(o => o.status === 'expediat').length,
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-[#0077B6] border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <AppContext.Provider value={{ products, orders, stats, socket, reloadProducts, reloadOrders, api, user, token, logout, isLoading, settings, setSettings }}>
      {children}
    </AppContext.Provider>
  )
}
