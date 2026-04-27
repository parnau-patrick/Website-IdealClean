import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAppStore } from '../context/AppProvider'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CustomLandingPage from '../components/CustomLandingPage'

export default function ProductPage() {
  const { id } = useParams()
  const { products: allProducts } = useAppStore()
  const product = allProducts.find(p => p.id === id)

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [id])

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAFBFE]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-4xl mb-6">🔍</div>
          <h2 className="font-['Outfit'] text-2xl font-bold mb-2">Produsul nu a fost găsit</h2>
          <p className="text-slate-400 mb-8">Ne pare rău, acest produs nu există sau a fost dezactivat.</p>
          <Link to="/" className="px-8 py-3 bg-gradient-to-r from-[#0077B6] to-[#00B4D8] text-white font-bold rounded-xl hover:shadow-lg transition-all">
            ← Înapoi la Magazin
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  // Always render the unified landing page template
  return <CustomLandingPage product={product} />
}
