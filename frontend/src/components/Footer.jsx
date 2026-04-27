import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative bg-[#0F172A] text-white overflow-hidden" id="contact">
      {/* Top gradient line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#0077B6] to-transparent" />

      {/* BG accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #0077B6 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-[0.02]" style={{ background: 'radial-gradient(circle, #2EC4B6 0%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-16">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-5">
              <img src="/logo.webp" alt="IdealClean" className="h-14 w-auto object-contain" />
              <span className="font-['Outfit'] text-xl font-[900] tracking-tight">
                <span className="text-white/90">Ideal</span><span className="text-[#00B4D8]">Clean</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] mb-6">
              Produse profesionale de curățenie pentru o casă impecabilă. Formule concentrate, eco-friendly, create în România.
            </p>
            <div className="flex gap-3">
              {['📘', '📸', '🎵'].map((icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#0077B6]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 text-sm">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Navigare</h4>
            <ul className="space-y-3.5">
              {[
                { to: '/', label: 'Acasă' },
                { to: '/#produse', label: 'Produse' },
                { to: '/#beneficii', label: 'De Ce Noi' },
                { to: '/dashboard', label: 'Dashboard' },
              ].map(link => (
                <li key={link.label}>
                  <a href={link.to} className="text-slate-400 text-sm hover:text-[#5EEAD4] transition-colors duration-300 hover:translate-x-1 inline-block transform">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Legal</h4>
            <ul className="space-y-3.5">
              {[
                { label: 'Termeni și Condiții', to: '/termeni-si-conditii' },
                { label: 'Politica de Confidențialitate', to: '/politica-de-confidentialitate' },
                { label: 'Politica de Retur', to: '/politica-de-retur' },
                { label: 'ANPC', href: 'https://anpc.ro/' }
              ].map(item => (
                <li key={item.label}>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-slate-400 text-sm hover:text-[#5EEAD4] transition-colors duration-300 hover:translate-x-1 inline-block transform">
                      {item.label}
                    </a>
                  ) : (
                    <Link to={item.to} onClick={() => window.scrollTo(0,0)} className="text-slate-400 text-sm hover:text-[#5EEAD4] transition-colors duration-300 hover:translate-x-1 inline-block transform">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Contact</h4>
            <ul className="space-y-4">
              {[
                { icon: '📧', text: 'avidoshop0@gmail.com' },
                { icon: '📞', text: '0741803646' },
                { icon: '📍', text: 'Baia Mare, România' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-400 text-sm">
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between text-[13px] text-slate-500 gap-6">
          <div className="flex flex-col gap-2">
            <span>&copy; {new Date().getFullYear()} IdealClean. Toate drepturile rezervate.</span>
            <span>Creat cu 💙 în România</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noopener noreferrer">
              <img src="https://wp.anpc.ro/wp-content/uploads/2022/05/sal-anpc-2.jpg" alt="ANPC SAL" className="h-12 w-auto object-contain rounded-lg" />
            </a>
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
              <img src="https://wp.anpc.ro/wp-content/uploads/2022/05/sol-anpc-2.jpg" alt="ANPC SOL" className="h-12 w-auto object-contain rounded-lg" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
