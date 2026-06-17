import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getCart, clearCart, addToCart } from '../store'
import { useAppStore } from '../context/AppProvider'

const EMOJIS = { 'Curățenie': '🧴', 'Dezinfectanți': '🧹', 'Seturi': '📦' }
const API_URL = '/api'

export default function Checkout() {
  const [searchParams] = useSearchParams()
  const { products: allProducts, settings } = useAppStore()

  const [orderPlaced, setOrderPlaced] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [payment, setPayment] = useState('ramburs')
  const [cartItems, setCartItems] = useState([])

  // Stochează draft ID-ul primit de la backend (dacă există deja)
  const shopifyDraftIdRef = useRef(null)

  // Form fields state (pentru tracking în timp real)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', address: '', city: '', county: '', postalCode: '', notes: ''
  })

  // Timer pentru debounce tracking
  const trackTimer = useRef(null)
  const lastTrackedPhone = useRef(null)

  // ── Init cart ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const directProduct = searchParams.get('product')
    const directQty = parseInt(searchParams.get('qty')) || 1
    if (directProduct) {
      clearCart()
      addToCart(directProduct, directQty)
    }
    setCartItems(getCart())
  }, [searchParams])

  // ── Calculează produse din cart ──────────────────────────────────────────────
  const items = cartItems.map(ci => {
    const p = allProducts.find(pr => pr.id === ci.productId)
    if (!p) return null
    // Suportă bundle: dacă e setat bundleIndex, preia prețul din bundle
    const bundle = (ci.bundleIndex !== undefined && p.bundles) ? p.bundles[ci.bundleIndex] : null
    const price = bundle ? bundle.price : p.price * (ci.quantity || 1)
    return {
      ...ci,
      product: p,
      price,
      subtotal: price,
      bundleLabel: bundle?.label || null,
      shopifyVariantId: p.shopifyVariantId || null,
    }
  }).filter(Boolean)

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0)
  const shippingCost = Number(settings.shippingCost !== undefined ? settings.shippingCost : 19.99)
  const shipping = subtotal >= 150 ? 0 : shippingCost
  const total = subtotal + shipping

  // ── Funcție de tracking (checkout abandonat) ─────────────────────────────────
  const sendTrack = useCallback(async (formData, force = false) => {
    const phone = (formData.phone || '').replace(/\s/g, '')
    const firstName = (formData.firstName || '').trim()

    // Obligatoriu: telefon minim 10 cifre + nume completat
    if (phone.length < 10 || !firstName) return

    // Nu re-trimite dacă nu s-a schimbat nimic important
    if (!force && phone === lastTrackedPhone.current) return

    try {
      const trackItems = items.map(i => ({
        productId: i.productId,
        productName: i.product?.name,
        qty: i.quantity,
        price: i.price,
        bundleLabel: i.bundleLabel,
        shopifyVariantId: i.shopifyVariantId,
      }))

      const resp = await fetch(`${API_URL}/checkout/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            county: formData.county,
          },
          items: trackItems,
          shipping,
          total,
        })
      })

      if (resp.ok) {
        const data = await resp.json()
        lastTrackedPhone.current = phone
        // Dacă backend-ul returnează un draftId deja creat, îl salvăm
        if (data.shopifyDraftId && !shopifyDraftIdRef.current) {
          shopifyDraftIdRef.current = data.shopifyDraftId
        }
      }
    } catch (_) {
      // Tracking silențios — nu blochăm UX-ul
    }
  }, [items, shipping, total])

  // ── Handler schimbare câmpuri (cu debounce 3s) ───────────────────────────────
  const handleFieldChange = (field, value) => {
    const newForm = { ...form, [field]: value }
    setForm(newForm)

    // Pornim tracking-ul abia când există telefon valid + nume
    const phone = (field === 'phone' ? value : newForm.phone).replace(/\s/g, '')
    const firstName = (field === 'firstName' ? value : newForm.firstName).trim()
    if (phone.length >= 10 && firstName) {
      if (trackTimer.current) clearTimeout(trackTimer.current)
      trackTimer.current = setTimeout(() => {
        sendTrack(newForm)
      }, 3000) // 3 secunde debounce
    }
  }

  // ── Tracking la închiderea paginii (beforeunload) ────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = () => {
      const phone = (form.phone || '').replace(/\s/g, '')
      const firstName = (form.firstName || '').trim()
      if (phone.length >= 10 && firstName) {
        // sendBeacon e mai fiabil la unload decât fetch
        const trackItems = items.map(i => ({
          productId: i.productId,
          productName: i.product?.name,
          qty: i.quantity,
          price: i.price,
          bundleLabel: i.bundleLabel,
          shopifyVariantId: i.shopifyVariantId,
        }))
        navigator.sendBeacon(`${API_URL}/checkout/track`, new Blob([JSON.stringify({
          customer: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            county: form.county,
          },
          items: trackItems,
          shipping,
          total,
        })], { type: 'application/json' }))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (trackTimer.current) clearTimeout(trackTimer.current)
    }
  }, [form, items, shipping, total])

  // ── Submit comandă ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (items.length === 0 || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)

    // Trimitem un track final înainte de comandă
    if (trackTimer.current) clearTimeout(trackTimer.current)

    const orderItems = items.map(i => ({
      productId: i.productId,
      productName: i.product?.name,
      qty: i.quantity,
      price: i.price,
      originalUnitPrice: i.product?.oldPrice || null,
      bundleLabel: i.bundleLabel,
      shopifyVariantId: i.shopifyVariantId,
    }))

    const orderData = {
      customer: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        county: form.county,
        postalCode: form.postalCode,
        notes: form.notes,
        paymentMethod: payment,
      },
      items: orderItems,
      subtotal,
      shipping,
      total,
      // Date de marketing pentru Shopify
      tracking: JSON.parse(localStorage.getItem('ic_tracking') || '{}'),
      // Trimitem draftId dacă există
      shopifyDraftId: shopifyDraftIdRef.current || null,
    }

    try {
      const resp = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const data = await resp.json()

      if (!resp.ok) {
        throw new Error(data.error || 'Eroare la plasarea comenzii')
      }

      // ✅ Declanșare Facebook Pixel Purchase Event
      if (window.fbq) {
        window.fbq('track', 'Purchase', {
          currency: 'RON',
          value: total,
          content_name: items.map(i => i.product?.name).join(', '),
          content_ids: items.map(i => i.productId),
          content_type: 'product'
        })
      }

      clearCart()
      setOrderPlaced({ id: data.id })
    } catch (err) {
      setSubmitError(err.message || 'A apărut o eroare. Te rugăm să încerci din nou.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Ecran confirmare ─────────────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center animate-fade-in-up">
          <span className="text-6xl block mb-4">🎉</span>
          <h2 className="font-['Outfit'] text-2xl font-bold mb-2">Comandă Plasată cu Succes!</h2>
          <p className="text-slate-500 mb-2">Numărul comenzii tale:</p>
          <p className="text-2xl font-extrabold text-[#0077B6] mb-6">{orderPlaced.id}</p>
          <p className="text-sm text-slate-400 mb-8">
            Te vom contacta în curând pentru confirmare. Îți mulțumim că ai ales IdealClean! 💙
          </p>
          <Link to="/" className="inline-block px-8 py-3 bg-gradient-to-r from-[#0077B6] to-[#00B4D8] text-white font-semibold rounded-xl">
            Înapoi la Magazin
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h1 className="font-['Outfit'] text-3xl font-bold">Finalizare Comandă</h1>
            <p className="text-slate-400 mt-1">Completează datele de mai jos pentru a plasa comanda</p>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
            {/* Form */}
            <form onSubmit={handleSubmit} className="animate-fade-in-up">
              {/* 1. Date Personale */}
              <Section num="1" title="Date Personale">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    name="firstName" label="Prenume *" placeholder="Ex: Ion" required
                    value={form.firstName} onChange={e => handleFieldChange('firstName', e.target.value)}
                  />
                  <Input
                    name="lastName" label="Nume *" placeholder="Ex: Popescu" required
                    value={form.lastName} onChange={e => handleFieldChange('lastName', e.target.value)}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <Input
                    name="email" label="Email" type="email" placeholder="email@exemplu.ro"
                    value={form.email} onChange={e => handleFieldChange('email', e.target.value)}
                  />
                  <Input
                    name="phone" label="Telefon *" type="tel" placeholder="07XX XXX XXX" required
                    value={form.phone} onChange={e => handleFieldChange('phone', e.target.value)}
                  />
                </div>
              </Section>

              {/* 2. Adresa */}
              <Section num="2" title="Adresa de Livrare">
                <Input
                  name="address" label="Adresă completă *" placeholder="Str. Exemplu nr. 1, Bl. A1, Ap. 10" required
                  value={form.address} onChange={e => handleFieldChange('address', e.target.value)}
                />
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <Input
                    name="city" label="Oraș *" placeholder="Ex: București" required
                    value={form.city} onChange={e => handleFieldChange('city', e.target.value)}
                  />
                  <Input
                    name="county" label="Județ *" placeholder="Ex: Ilfov" required
                    value={form.county} onChange={e => handleFieldChange('county', e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <Input
                    name="postalCode" label="Cod Poștal" placeholder="Ex: 010101"
                    value={form.postalCode} onChange={e => handleFieldChange('postalCode', e.target.value)}
                  />
                </div>
              </Section>

              {/* 3. Plata */}
              <Section num="3" title="Metoda de Plată">
                <div className="space-y-3">
                  <PaymentOption value="ramburs" selected={payment} onSelect={setPayment} icon="💵" title="Plată Ramburs" desc="Plătești la livrare, în numerar" />
                  <PaymentOption value="card" selected={payment} onSelect={setPayment} icon="💳" title="Card Online" desc="Visa, Mastercard — securizat" />
                </div>
              </Section>

              {/* 4. Observatii */}
              <Section num="4" title="Observații (opțional)" noBorder>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={e => handleFieldChange('notes', e.target.value)}
                  className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-[#0077B6] focus:ring-4 focus:ring-[#0077B6]/10 outline-none transition-all min-h-[100px] resize-y"
                  placeholder="Instrucțiuni speciale pentru livrare, etc."
                />
              </Section>

              {/* Error message */}
              {submitError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                  ⚠️ {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full py-4 mt-4 bg-gradient-to-r from-[#0077B6] via-[#00B4D8] to-[#2EC4B6] text-white font-bold text-lg rounded-2xl shadow-[0_4px_20px_rgba(0,119,182,0.35)] hover:shadow-[0_8px_30px_rgba(0,119,182,0.5)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Se procesează...
                  </>
                ) : (
                  <>🛡️ Plasează Comanda</>
                )}
              </button>
            </form>

            {/* Summary */}
            <div className="animate-fade-in-up delay-100">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm lg:sticky lg:top-24 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-bold">Sumar Comandă</h3>
                </div>

                {items.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <span className="text-3xl block mb-2">🛒</span>
                    <p>Coșul tău este gol</p>
                    <Link to="/" className="text-sm text-[#0077B6] font-semibold mt-2 inline-block">
                      Vezi Produsele →
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="p-5 space-y-3">
                      {items.map(item => {
                        const emoji = EMOJIS[item.product?.category] || '🫧'
                        return (
                          <div key={item.productId + (item.bundleLabel || '')} className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                              {item.product?.images?.[0]
                                ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover rounded-xl" />
                                : emoji
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{item.product?.name}</p>
                              <p className="text-xs text-slate-400">
                                {item.bundleLabel ? item.bundleLabel : `×${item.quantity}`}
                              </p>
                            </div>
                            <span className="text-sm font-bold whitespace-nowrap">{item.subtotal.toFixed(2)} lei</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="p-5 border-t border-slate-100 space-y-2">
                      <div className="flex justify-between text-sm"><span>Subtotal</span><span>{subtotal.toFixed(2)} lei</span></div>
                      <div className={`flex justify-between text-sm ${shipping === 0 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                        <span>Livrare</span>
                        <span>{shipping === 0 ? 'GRATUITĂ ✓' : `${shipping.toFixed(2)} lei`}</span>
                      </div>
                      {shipping > 0 && <p className="text-xs text-slate-400">Mai adaugă {(150 - subtotal).toFixed(2)} lei pentru livrare gratuită</p>}
                      <div className="flex justify-between text-lg font-extrabold pt-3 border-t-2 border-slate-200">
                        <span>Total</span>
                        <span>{total.toFixed(2)} lei</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {['🛡️ Plată 100% securizată', '🔄 Garanție de 30 zile retur', '🚚 Livrare gratuită peste 150 lei'].map((g, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function Section({ num, title, children, noBorder }) {
  return (
    <div className={`mb-8 pb-8 ${noBorder ? '' : 'border-b border-slate-100'}`}>
      <h3 className="flex items-center gap-3 font-bold text-lg mb-5">
        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0077B6] to-[#00B4D8] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{num}</span>
        {title}
      </h3>
      {children}
    </div>
  )
}

function Input({ label, value, onChange, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5">{label}</label>
      <input
        {...props}
        value={value}
        onChange={onChange}
        autoComplete="off"
        className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-[#0077B6] focus:ring-4 focus:ring-[#0077B6]/10 outline-none transition-all"
      />
    </div>
  )
}

function PaymentOption({ value, selected, onSelect, icon, title, desc }) {
  const active = selected === value
  return (
    <label
      onClick={() => onSelect(value)}
      className={`flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${active ? 'border-[#0077B6] bg-[#0077B6]/3' : 'border-slate-200 hover:border-[#00B4D8]'}`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${active ? 'border-[#0077B6]' : 'border-slate-300'}`}>
        {active && <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#0077B6] to-[#00B4D8]" />}
      </div>
      <span className="text-xl">{icon}</span>
      <div>
        <strong className="text-sm block">{title}</strong>
        <span className="text-xs text-slate-400">{desc}</span>
      </div>
    </label>
  )
}
