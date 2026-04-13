import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PaymentFailure() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <div className="snap-card p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-4">
            <i className="bi bi-x-octagon-fill" style={{ fontSize: '1.9rem' }} />
          </div>

          <h3 className="font-bold mb-2">Payment Failed</h3>
          <p className="text-gray-500 mb-6">
            Your payment could not be completed. No charges were finalized. Please try again.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/cart" className="btn-brand px-5">
              Try Again
            </Link>
            <Link to="/orders" className="btn-outline-brand px-5">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
