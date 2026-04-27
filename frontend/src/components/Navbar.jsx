import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar({ transparent = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const isTransparent = transparent && !scrolled

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isTransparent
          ? 'bg-transparent'
          : 'bg-white/80 backdrop-blur-2xl saturate-[180%] border-b border-slate-200/50 shadow-[0_1px_30px_rgba(0,0,0,0.04)]'
        }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 relative z-10">
            <img src="/logo.webp" alt="IdealClean" className="h-14 w-auto drop-shadow-sm" />
            <span className="font-['Outfit'] text-[1.35rem] font-[900] tracking-tight hidden sm:block">
              <span className="text-[#0077B6]">Ideal</span><span className="text-slate-700">Clean</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '/#produse', label: 'Produse' },
              { href: '/#beneficii', label: 'De Ce Noi' },
              { href: '/#contact', label: 'Contact' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`relative px-5 py-2.5 text-[13px] font-semibold tracking-wide uppercase transition-all duration-300 rounded-xl group ${isTransparent
                    ? 'text-slate-600 hover:text-[#0077B6]'
                    : 'text-slate-500 hover:text-[#0077B6] hover:bg-[#0077B6]/5'
                  }`}
              >
                {link.label}
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#0077B6] to-[#2EC4B6] group-hover:w-6 transition-all duration-400 rounded-full" />
              </a>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-[5px] hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className={`w-5 h-[2px] bg-slate-700 rounded-full transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`w-5 h-[2px] bg-slate-700 rounded-full transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-0' : ''}`} />
            <span className={`w-5 h-[2px] bg-slate-700 rounded-full transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileOpen(false)} />

      {/* Mobile Menu Panel */}
      <div className={`fixed top-0 right-0 w-[300px] h-full bg-white z-50 md:hidden transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6">
          <button onClick={() => setMobileOpen(false)} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center ml-auto mb-6 text-lg transition-colors">✕</button>
          <div className="flex flex-col gap-2">
            {[
              { href: '/#produse', label: 'Produse' },
              { href: '/#beneficii', label: 'De Ce Noi' },
              { href: '/#contact', label: 'Contact' },
            ].map((link) => (
              <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="px-4 py-3 text-[15px] font-semibold text-slate-700 hover:text-[#0077B6] hover:bg-[#0077B6]/5 rounded-xl transition-all">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
