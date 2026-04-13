import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import useCartStore from '../store/useCartStore'
import { apiErrorMessage, orderAPI, paymentAPI } from '../api'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCartStore()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderId) {
      setError('Missing order ID in the callback URL.')
      setLoading(false)
      return
    }

    const loadOrder = () => orderAPI.getById(orderId)
      .then((r) => {
        const payload = r.data?.data || r.data || null
        setOrder(payload)

        const paymentStatus = String(payload?.paymentStatus || '').toUpperCase()
        if (paymentStatus === 'PAID') {
          clearCart()
        }

        if (paymentStatus && paymentStatus !== 'PAID') {
          setError(`Payment returned successfully, but payment status is ${paymentStatus}.`)
        }
      })
      .catch((err) => {
        setError(apiErrorMessage(err, 'Unable to verify order status right now.'))
      })
      .finally(() => setLoading(false))

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    const verifyWithRetry = async (attempt = 1) => {
      try {
        await paymentAPI.verifyCheckoutSession(sessionId)
        await loadOrder()
      } catch (err) {
        const msg = apiErrorMessage(err, 'Unable to verify Stripe checkout session.')

        if (attempt < 4) {
          await wait(1200)
          return verifyWithRetry(attempt + 1)
        }

        setError(msg)
        await loadOrder()
      }
    }

    if (sessionId) {
      verifyWithRetry()
      return
    }

    loadOrder()
  }, [orderId, sessionId, clearCart])

  const isPaid = useMemo(() => String(order?.paymentStatus || '').toUpperCase() === 'PAID', [order])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        <div className="snap-card p-6 sm:p-8 text-center">
          {loading ? (
            <div className="py-10">
              <span className="spinner text-brand" />
              <p className="text-gray-500 mt-3 mb-0">Verifying your payment and order...</p>
            </div>
          ) : isPaid ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 mx-auto flex items-center justify-center mb-4">
                <i className="bi bi-check-circle-fill" style={{ fontSize: '1.9rem' }} />
              </div>
              <h3 className="font-bold mb-2">Payment Successful</h3>
              <p className="text-gray-500 mb-6">
                Your order has been placed and is now being processed.
              </p>

              <div className="bg-gray-50 rounded-xl px-4 py-3 text-left max-w-md mx-auto mb-6">
                <p className="text-xs text-gray-500 mb-1">Order ID</p>
                <p className="font-semibold mb-2">#{order?.id || orderId}</p>
                <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                <span className="status-PLACED">PAID</span>
              </div>

              <Link to="/orders" className="btn-brand px-6">
                Back to Orders
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-4">
                <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '1.9rem' }} />
              </div>
              <h3 className="font-bold mb-2">Payment Completed, Confirmation Pending</h3>
              <p className="text-gray-500 mb-6">
                {error || 'We could not verify your final order status yet. Please check your orders page.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link to="/orders" className="btn-brand px-5">Back to Orders</Link>
                <Link to="/cart" className="btn-outline-brand px-5">Back to Cart</Link>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
