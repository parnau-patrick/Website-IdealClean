import React, { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAppStore } from '../context/AppProvider'
import { useToast } from '../components/Toast'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { api, token } = useAppStore()
  const showToast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  // Dacă e deja logat → redirect automat
  if (token) return <Navigate to={from} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) return showToast("Te rugăm să completezi ambele câmpuri", "error")
    
    setIsSubmitting(true)
    try {
      await api.login(username, password)
      showToast("Autentificare reușită! Bine ai revenit.")
      navigate(from, { replace: true })
    } catch (err) {
      showToast(err.message || "Eroare la autentificare", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 selection:bg-[#0077B6]/30">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0077B6]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00B4D8]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-[440px] animate-fade-in-up">
        {/* Logo Area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 mb-6 shadow-2xl scale-110">
            <img src="/logo.webp" alt="IdealClean" className="w-14 h-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight font-['Outfit'] mb-2">
            Panou <span className="text-[#00B4D8]">Control</span>
          </h1>
          <p className="text-slate-400 font-medium">Introdu datele pentru a accesa magazinul</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Utilizator</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00B4D8] transition-colors">👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00B4D8]/50 focus:bg-white/10 transition-all"
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Parolă</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00B4D8] transition-colors">🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00B4D8]/50 focus:bg-white/10 transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden py-4 rounded-2xl bg-gradient-to-r from-[#0077B6] to-[#00B4D8] text-white font-black uppercase tracking-wider text-sm shadow-[0_10px_25px_-5px_rgba(0,180,216,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(0,180,216,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:pointer-events-none"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Autentificare <span>→</span></>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#00B4D8] to-[#0077B6] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center mt-8 text-sm text-slate-500 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Toate sistemele sunt funcționale
        </p>
      </div>
    </div>
  )
}
