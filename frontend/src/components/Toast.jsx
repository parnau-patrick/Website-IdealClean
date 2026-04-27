import { useState, useEffect, createContext, useContext } from 'react'

const ToastContext = createContext()

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed top-20 right-5 z-[500] flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-3 bg-white rounded-xl shadow-xl border-l-4 animate-slide-in-right min-w-[300px] ${
              toast.type === 'success' ? 'border-emerald-500' : 
              toast.type === 'error' ? 'border-red-500' : 'border-amber-500'
            }`}
          >
            <span className="text-lg">
              {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : '⚠️'}
            </span>
            <span className="text-sm font-medium text-slate-700">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
