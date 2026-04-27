import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import { AppProvider, useAppStore } from './context/AppProvider'
import Landing from './pages/Landing'
import ProductPage from './pages/ProductPage'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

import { Termeni, Confidentialitate, Retur } from './pages/LegalPages'

function PrivateRoute({ children }) {
  const { token, isLoading } = useAppStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-[#0077B6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/produs/:id" element={<ProductPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/termeni-si-conditii" element={<Termeni />} />
            <Route path="/politica-de-confidentialitate" element={<Confidentialitate />} />
            <Route path="/politica-de-retur" element={<Retur />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
          </Routes>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  )
}
