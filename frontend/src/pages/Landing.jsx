import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAppStore } from '../context/AppProvider'

const EMOJIS = { 'Curățenie': '🧴', 'Dezinfectanți': '🧹', 'Seturi': '📦' }

export default function Landing() {
  const { products: allProducts } = useAppStore()
  const products = allProducts.filter(p => p.active)

  return (
    <div className="min-h-screen bg-[#FAFBFE] overflow-hidden">
      <Navbar transparent />

      {/* ═══════════════════════════════ HERO ═══════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-20 pb-20">
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Gradient mesh */}
          <div className="absolute -top-[30%] -right-[15%] w-[800px] h-[800px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #0077B6 0%, transparent 70%)' }} />
          <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #2EC4B6 0%, transparent 70%)' }} />
          <div className="absolute top-[20%] left-[50%] w-[400px] h-[400px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #00B4D8 0%, transparent 70%)' }} />

          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.35]" style={{
            backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }} />

          {/* Decorative lines */}
          <div className="absolute top-32 right-[15%] w-[1px] h-48 bg-gradient-to-b from-transparent via-[#0077B6]/20 to-transparent" />
          <div className="absolute bottom-40 left-[20%] w-48 h-[1px] bg-gradient-to-r from-transparent via-[#2EC4B6]/20 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-20 items-center">
          {/* Text Column */}
          <div>
            {/* Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#0077B6]/10 bg-white shadow-[0_2px_20px_rgba(0,119,182,0.06)] mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2EC4B6] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2EC4B6]" />
              </span>
              <span className="text-[13px] font-semibold text-[#0077B6] tracking-wide">Livrare Gratuită peste 150 lei</span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up delay-100 font-['Outfit'] text-[3.5rem] sm:text-[4.2rem] lg:text-[5rem] font-[900] leading-[1.02] tracking-[-0.03em] text-[#0F172A] mb-7">
              Curățenie{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#0077B6] via-[#00B4D8] to-[#2EC4B6] bg-clip-text text-transparent animate-gradient">Profesională</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none"><path d="M2 8C50 3 100 2 150 5C200 8 250 4 298 6" stroke="url(#g1)" strokeWidth="3" strokeLinecap="round"><animate attributeName="stroke-dasharray" from="0 400" to="400 0" dur="1.5s" fill="freeze" /></path><defs><linearGradient id="g1"><stop stopColor="#0077B6" /><stop offset="1" stopColor="#2EC4B6" /></linearGradient></defs></svg>
              </span>
              <br />La Tine Acasă
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-in-up delay-200 text-lg lg:text-xl text-slate-400 max-w-lg mb-10 leading-relaxed font-medium">
              Formule concentrate, eco-friendly, cu rezultate vizibile din prima utilizare. Brandul românesc care redefinește curățenia.
            </p>

            {/* CTA */}
            <div className="animate-fade-in-up delay-300 flex flex-wrap items-center gap-4 mb-14">
              <a href="#produse" className="btn-premium text-[15px]">
                🛍️ Descoperă Produsele
              </a>
              <a href="#beneficii" className="group inline-flex items-center gap-3 px-7 py-4 text-[15px] font-semibold text-slate-600 hover:text-[#0077B6] transition-colors">
                Află mai multe
                <span className="w-8 h-8 rounded-full bg-[#0077B6]/8 flex items-center justify-center group-hover:bg-[#0077B6] group-hover:text-white transition-all duration-300 text-sm">→</span>
              </a>
            </div>

            {/* Stats */}
            <div className="animate-fade-in-up delay-400 flex items-center gap-10">
              {[
                { value: '10K+', label: 'Clienți Fericiți' },
                { value: '99.9%', label: 'Bacterii Eliminate' },
                { value: '100%', label: 'Eco-Friendly' },
              ].map((stat, i) => (
                <div key={i} className="relative">
                  <strong className="font-['Outfit'] text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-[#0077B6] to-[#00B4D8] bg-clip-text text-transparent">{stat.value}</strong>
                  <span className="block text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Column */}
          <div className="animate-fade-in-right delay-300 relative hidden lg:flex items-center justify-center">
            {/* Outer ring */}
            <div className="absolute w-[460px] h-[460px] rounded-full border border-dashed border-[#0077B6]/10 animate-spin-slow" />
            <div className="absolute w-[380px] h-[380px] rounded-full border border-[#2EC4B6]/8" />

            {/* Main blob */}
            <div className="relative w-[300px] h-[300px]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0077B6] via-[#00B4D8] to-[#2EC4B6] rounded-[40%_60%_55%_45%/50%_40%_60%_50%] shadow-[0_20px_60px_rgba(0,119,182,0.3)] animate-float" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl drop-shadow-lg relative z-10">🧴</span>
              </div>
              <div className="absolute -inset-8 bg-gradient-to-br from-[#0077B6]/20 to-[#2EC4B6]/20 rounded-full blur-[40px] animate-pulse-glow" />
            </div>

            {/* Floating cards */}
            {[
              { icon: '🛡️', text: 'Sigur pentru Familie', x: '-left-10', y: 'top-8', delay: '0s' },
              { icon: '✅', text: 'Testat Dermatologic', x: '-right-6', y: 'top-1/2 -translate-y-1/2', delay: '1.5s' },
              { icon: '🚀', text: 'Livrare în 24h', x: '-left-4', y: 'bottom-8', delay: '3s' },
            ].map((card, i) => (
              <div key={i} className={`absolute ${card.x} ${card.y} flex items-center gap-2.5 px-5 py-3 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60 text-[13px] font-semibold text-slate-700 whitespace-nowrap animate-float`} style={{ animationDelay: card.delay }}>
                <span className="text-base">{card.icon}</span>
                <span>{card.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in-up delay-600">
          <span className="text-[11px] text-slate-400 font-medium tracking-widest uppercase">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-1.5 bg-[#0077B6] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ TRUST BAR ═══════════════════════════════ */}
      <section className="relative py-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🚚', title: 'Livrare Rapidă', desc: '24-48h în toată România', color: 'from-blue-500/10 to-cyan-500/10' },
              { icon: '🛡️', title: 'Plată Securizată', desc: 'Ramburs sau Card Online', color: 'from-emerald-500/10 to-teal-500/10' },
              { icon: '🔄', title: 'Garanție 30 Zile', desc: 'Returnare fără întrebări', color: 'from-amber-500/10 to-orange-500/10' },
              { icon: '📞', title: 'Suport Dedicat', desc: 'Răspundem în < 1 oră', color: 'from-purple-500/10 to-pink-500/10' },
            ].map((item, i) => (
              <div key={i} className="group flex items-center gap-4 p-5 rounded-2xl hover:bg-slate-50/80 transition-all duration-300 cursor-default">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <div>
                  <strong className="text-sm font-bold text-slate-800 block">{item.title}</strong>
                  <span className="text-xs text-slate-400 font-medium">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ PRODUCTS ═══════════════════════════════ */}
      <section className="py-28 relative" id="produse">
        {/* BG accent */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #0077B6 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0077B6]/5 border border-[#0077B6]/10 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0077B6]" />
              <span className="text-[12px] font-bold text-[#0077B6] uppercase tracking-[0.15em]">Colecția Noastră</span>
            </div>
            <h2 className="font-['Outfit'] text-4xl sm:text-5xl font-[900] tracking-tight mb-5">
              Alege <span className="bg-gradient-to-r from-[#0077B6] via-[#00B4D8] to-[#2EC4B6] bg-clip-text text-transparent">Excelența</span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto text-lg font-medium">
              Fiecare produs este creat cu ingrediente premium, testat riguros și îmbunătățit constant.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, i) => {
              const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0
              const emoji = EMOJIS[product.category] || '🫧'
              return (
                <Link key={product.id} to={`/produs/${product.id}`} className="group premium-card gradient-border rounded-3xl overflow-hidden block transition-all duration-500 hover:-translate-y-2">
                  {/* Image area */}
                  <div className="relative h-72 bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#BAE6FD] flex items-center justify-center overflow-hidden">
                    {discount > 0 && product.config?.showDiscount !== false && (
                      <div className="absolute top-5 left-5 z-10 flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500 text-white rounded-xl text-xs font-bold shadow-[0_4px_12px_rgba(239,68,68,0.3)]">
                        <span>-{discount}%</span>
                      </div>
                    )}
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" 
                      />
                    ) : (
                      <span className="text-8xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] drop-shadow-lg">{emoji}</span>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6">
                      <div className="px-6 py-3 bg-white text-[#0077B6] text-sm font-bold rounded-xl shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        Vezi Detalii →
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-7">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0077B6]" />
                      <span className="text-[11px] font-bold text-[#0077B6] uppercase tracking-[0.15em]">{product.category}</span>
                    </div>
                    <h3 className="font-['Outfit'] font-bold text-xl text-slate-800 mb-2 group-hover:text-[#0077B6] transition-colors duration-300">{product.name}</h3>
                    <p className="text-sm text-slate-400 mb-5 line-clamp-2 leading-relaxed">{product.shortDescription}</p>

                    <div className="flex items-end justify-between">
                      <div>
                        <span className="font-['Outfit'] text-3xl font-[900] text-slate-800">{Math.floor(product.price)}</span>
                        <span className="text-base font-bold text-slate-500 ml-0.5">.{product.price.toFixed(2).split('.')[1]} lei</span>
                        {product.oldPrice && (
                          <span className="block text-sm text-slate-300 line-through font-medium mt-0.5">{product.oldPrice.toFixed(2)} lei</span>
                        )}
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0077B6] to-[#00B4D8] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(0,119,182,0.3)] group-hover:shadow-[0_8px_24px_rgba(0,119,182,0.4)] group-hover:scale-105 transition-all duration-300 text-lg">
                        →
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ BENEFITS ═══════════════════════════════ */}
      <section className="py-28 bg-white relative overflow-hidden" id="beneficii">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle, #0077B6 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left — visual */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-[480px] mx-auto">
                {/* Rings */}
                <div className="absolute inset-8 rounded-full border-2 border-dashed border-[#0077B6]/10 animate-spin-slow" />
                <div className="absolute inset-16 rounded-full border border-[#2EC4B6]/15" />

                {/* Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-[#0077B6] to-[#2EC4B6] rounded-[35%_65%_55%_45%/50%_45%_55%_50%] shadow-[0_20px_60px_rgba(0,119,182,0.3)] animate-float flex items-center justify-center">
                  <span className="text-5xl">✨</span>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 bg-gradient-to-br from-[#0077B6]/15 to-[#2EC4B6]/15 rounded-full blur-[30px] animate-pulse-glow" />

                {/* Orbiting badges */}
                {[
                  { icon: '🌍', label: 'Eco', top: '5%', left: '50%' },
                  { icon: '🧪', label: 'Lab', top: '50%', left: '95%' },
                  { icon: '⚡', label: 'Fast', top: '90%', left: '40%' },
                  { icon: '❤️', label: 'Safe', top: '40%', left: '5%' },
                ].map((badge, i) => (
                  <div key={i} className="absolute w-14 h-14 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center justify-center text-xl animate-float-slow" style={{ top: badge.top, left: badge.left, animationDelay: `${i * 1.5}s` }}>
                    {badge.icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — content */}
            <div>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0077B6]/5 border border-[#0077B6]/10 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2EC4B6]" />
                <span className="text-[12px] font-bold text-[#0077B6] uppercase tracking-[0.15em]">De ce IdealClean</span>
              </div>
              <h2 className="font-['Outfit'] text-4xl sm:text-5xl font-[900] tracking-tight text-slate-800 mb-6">
                Diferența Este în{' '}
                <span className="bg-gradient-to-r from-[#0077B6] to-[#2EC4B6] bg-clip-text text-transparent">Fiecare Detaliu</span>
              </h2>
              <p className="text-slate-400 text-lg mb-12">Nu facem compromisuri. Fiecare produs trece prin 7 teste de calitate înainte de a ajunge la tine.</p>

              <div className="space-y-6">
                {[
                  { icon: '🌍', title: 'Formule Eco-Friendly', desc: 'Ingrediente biodegradabile care protejează mediul fără a compromite eficiența.', num: '01' },
                  { icon: '❤️', title: 'Sigur pentru Toată Familia', desc: 'Testate dermatologic, fără substanțe agresive. Parfumuri naturale și delicate.', num: '02' },
                  { icon: '⭐', title: 'Calitate Profesională', desc: 'Concentrație de nivel profesional. Rezultate extraordinare cu cantitate minimă.', num: '03' },
                  { icon: '🚀', title: 'Livrare Express Națională', desc: 'Comandă azi, primești mâine. Livrare gratuită pentru comenzi peste 150 lei.', num: '04' },
                ].map((b, i) => (
                  <div key={i} className="group flex gap-5 p-5 rounded-2xl hover:bg-[#0077B6]/3 transition-all duration-300 cursor-default">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 group-hover:from-[#0077B6]/10 group-hover:to-[#2EC4B6]/10 flex items-center justify-center text-xl flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg relative">
                      {b.icon}
                      <span className="absolute -top-1 -right-1 text-[9px] font-bold text-[#0077B6] bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm border border-slate-100">{b.num}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 mb-1 group-hover:text-[#0077B6] transition-colors">{b.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ TESTIMONIALS ═══════════════════════════════ */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0077B6]/5 border border-[#0077B6]/10 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0077B6]" />
              <span className="text-[12px] font-bold text-[#0077B6] uppercase tracking-[0.15em]">Recenzii</span>
            </div>
            <h2 className="font-['Outfit'] text-4xl sm:text-5xl font-[900] tracking-tight mb-4">
              Ce Spun <span className="bg-gradient-to-r from-[#0077B6] to-[#2EC4B6] bg-clip-text text-transparent">Clienții Noștri</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Maria P.', text: 'Cel mai bun detergent pe care l-am încercat! Mirosul persist ore întregi și curăță perfect.', stars: 5 },
              { name: 'Andrei M.', text: 'Am comandat setul complet și sunt impresionat de calitate. Livrarea a fost rapidă, ambalaj premium.', stars: 5 },
              { name: 'Elena D.', text: 'Spray-ul dezinfectant e extraordinar. Folosesc zilnic în bucătărie. Recomand cu căldură!', stars: 5 },
            ].map((review, i) => (
              <div key={i} className="premium-card rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-6 right-6 text-6xl text-[#0077B6]/5 font-serif leading-none">"</div>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: review.stars }).map((_, j) => (
                    <span key={j} className="text-amber-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-slate-500 leading-relaxed mb-6 relative z-10">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0077B6] to-[#2EC4B6] flex items-center justify-center text-white text-sm font-bold">
                    {review.name[0]}
                  </div>
                  <div>
                    <strong className="text-sm text-slate-700 block">{review.name}</strong>
                    <span className="text-xs text-slate-400">Client Verificat ✓</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════ CTA ═══════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative rounded-[2rem] overflow-hidden noise">
            {/* BG */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#023E8A] via-[#0077B6] to-[#2EC4B6]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#2EC4B6] rounded-full opacity-20 blur-[80px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00B4D8] rounded-full opacity-15 blur-[60px] translate-y-1/3 -translate-x-1/4" />

            <div className="relative z-10 p-14 md:p-20 text-center">
              <h2 className="font-['Outfit'] text-3xl md:text-5xl font-[900] text-white mb-5 tracking-tight">
                Pregătit pentru o Casă<br />Strălucitoare?
              </h2>
              <p className="text-white/70 max-w-lg mx-auto mb-10 text-lg font-medium">
                Alege produsele IdealClean și simte diferența de prima utilizare. Satisfacție garantată.
              </p>
              <a href="#produse" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-[#0077B6] font-bold text-[15px] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-400">
                Cumpără Acum
                <span className="w-8 h-8 rounded-xl bg-[#0077B6] text-white flex items-center justify-center text-sm">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
