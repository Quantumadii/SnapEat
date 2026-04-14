import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiErrorMessage, orderAPI, ratingAPI } from '../api'
import useAuthStore from '../store/useAuthStore'

const STATUS_CONFIG = {
  PLACED:    { label: 'Awaiting Confirmation', badge: 'status-PLACED',    icon: 'bi-hourglass-split' },
  CONFIRMED: { label: 'Order Confirmed',       badge: 'status-CONFIRMED', icon: 'bi-patch-check-fill' },
  PREPARING: { label: 'Preparing',             badge: 'status-PREPARING', icon: 'bi-fire' },
  READY:     { label: 'Out for Delivery',      badge: 'status-READY',     icon: 'bi-bicycle' },
  COMPLETED: { label: 'Delivered',             badge: 'status-COMPLETED', icon: 'bi-check-circle-fill' },
  CANCELLED: { label: 'Cancelled',             badge: 'status-CANCELLED', icon: 'bi-x-circle-fill' },
}

const STEPS = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED']
const STAR_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
}

export default function OrdersPage() {
  const { user } = useAuthStore()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(0)
  const [pagination, setPagination] = useState({ totalPages: 1, totalElements: 0 })
  const [ratingOrder, setRatingOrder] = useState(null)
  const [ratingForm, setRatingForm] = useState({ orderId: '', menuItemId: '', score: 5, comment: '' })
  const [submittingRating, setSubmittingRating] = useState(false)

  const fetchOrders = () => {
    orderAPI.getMyOrders(page, 10)
      .then((r) => {
        const pageData = r.data.data || {}
        setOrders(pageData?.content || [])
        setPagination({
          totalPages: Number(pageData?.totalPages ?? 1),
          totalElements: Number(pageData?.totalElements ?? 0),
        })
      })
      .catch((err) => toast.error(apiErrorMessage(err, 'Failed to load orders')))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [page])

  const handleCancel = async (orderId) => {
    try {
      await orderAPI.cancelOrder(orderId)
      toast.success('Order cancelled')
      fetchOrders()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Cannot cancel this order'))
    }
  }

  const openRating = (order) => {
    const resolvedMenuItemId = order.orderItems?.[0]?.menuItemId ?? ''
    setRatingOrder(order)
    setRatingForm({ orderId: order.id, menuItemId: resolvedMenuItemId, score: 5, comment: '' })
  }

  const submitRating = async (e) => {
    e.preventDefault()
    const resolvedUserId = user?.userId ?? user?.id ?? null
    const resolvedOrderId = Number(ratingForm.orderId)
    const resolvedMenuItemId = Number(ratingForm.menuItemId)

    if (!resolvedUserId) {
      toast.error('Please login again to submit your rating')
      return
    }
    if (!ratingForm.orderId || !Number.isFinite(resolvedOrderId) || resolvedOrderId <= 0) {
      toast.error('Order not found for this rating')
      return
    }
    setSubmittingRating(true)
    try {
      await ratingAPI.add({
        userId: resolvedUserId,
        orderId: resolvedOrderId,
        menuItemId: Number.isFinite(resolvedMenuItemId) && resolvedMenuItemId > 0
          ? resolvedMenuItemId
          : null,
        score: Number(ratingForm.score),
        comment: ratingForm.comment.trim(),
      })
      toast.success('Thanks for your review!')
      setRatingOrder(null)
      fetchOrders()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to submit rating'))
    } finally {
      setSubmittingRating(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="max-w-2xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8 flex-1">
        <h3 className="font-bold mb-6">My Orders</h3>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="snap-card p-6 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="bg-gray-200 rounded h-4 w-36" />
                  <div className="bg-gray-200 rounded-full h-6 w-24" />
                </div>
                <div className="bg-gray-200 rounded h-3 w-3/5 mb-2" />
                <div className="bg-gray-200 rounded h-3 w-4/5" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <i className="bi bi-bag text-gray-400" style={{ fontSize: '3.5rem' }} />
            <h5 className="font-bold mt-4 mb-2">No orders yet</h5>
            <p className="text-gray-500 mb-6">Your order history will appear here</p>
            <Link to="/" className="btn-brand px-6">Order Now</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              {/* const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PLACED
              return (
                <div key={order.id} className="snap-card p-6 fade-up"> */}
                  {/* Header */}
              return (
                <div key={order.id} className="snap-card p-4 sm:p-6 fade-up">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                    <div>
                      <p className="text-gray-500 text-xs mb-0">Order #{order.id}</p>
                      <h6 className="font-bold mb-0">{order.restaurantName}</h6>
                      <p className="text-gray-500 text-xs mb-0">
                        <i className="bi bi-shop text-brand mr-1" />
                        {order.branchName || 'Main branch'}
                      </p>
                      <p className="text-gray-500 text-xs mb-0">
                        {new Date(order.createdAt).toLocaleString('en-IN')}
                      </p>
                      {/* <span className={cfg.badge}>
                      <i className={bi ${cfg.icon} mr-1} />{cfg.label}
                    </span> */}
                    </div>
                  </div>

                  <div className="rounded-xl p-3 mb-3 bg-gray-50">
                    {order.orderItems?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm mb-1">
                        <span className="text-gray-800">
                          {item.menuItemName}
                          <span className="text-gray-500 ml-1">× {item.quantity}</span>
                        </span>
                        <span className="font-medium">₹{item.subtotal}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-sm">
                      <span>Total</span>
                      <span className="text-brand">₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Address */}
                  <p className="text-sm text-gray-500 mb-4">
                    <i className="bi bi-geo-alt text-brand mr-1" />{order.deliveryAddress}
                  </p>

                  <OrderProgress status={order.status} />

                  {order.canCancel && (
                    <div className="mt-3 text-right">
                      <button onClick={() => handleCancel(order.id)}
                        className="text-sm px-3 py-1.5 border border-red-400 text-red-500 rounded-lg bg-transparent cursor-pointer hover:bg-red-50 transition-colors">
                        Cancel Order
                      </button>
                    </div>
                  )}

                  {order.status === 'COMPLETED' && order.orderItems?.length > 0 && (
                    <div className="mt-3 text-right">
                      <button
                        onClick={() => openRating(order)}
                        className="text-sm px-3 py-1.5 border rounded-lg bg-transparent transition-colors border-brand text-brand cursor-pointer hover:bg-brand-light"
                      >
                        Rate Restaurant
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                className="px-3 py-2 border rounded-lg text-sm cursor-pointer disabled:opacity-50">
                <i className="bi bi-chevron-left" /> Previous
              </button>
              <span className="text-sm font-medium">Page {page + 1} of {Math.max(1, pagination.totalPages)}</span>
              <button onClick={() => setPage(Math.min(Math.max(1, pagination.totalPages) - 1, page + 1))} disabled={page >= Math.max(1, pagination.totalPages) - 1}
                className="px-3 py-2 border rounded-lg text-sm cursor-pointer disabled:opacity-50">
                Next <i className="bi bi-chevron-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {ratingOrder && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h5 className="font-bold mb-0">Rate Order #{ratingOrder.id}</h5>
              <button
                className="border-0 bg-transparent cursor-pointer text-gray-400 hover:text-gray-600"
                onClick={() => setRatingOrder(null)}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="modal-body">
              <form id="ratingForm" onSubmit={submitRating}>
                <div className="mb-3">
                  <label className="form-label">Restaurant</label>
                  <div className="form-input bg-gray-50">{ratingOrder.restaurantName}</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((score) => {
                      const active = score <= ratingForm.score
                      return (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setRatingForm({ ...ratingForm, score })}
                          className="p-1 border-0 bg-transparent cursor-pointer"
                          aria-label={`Rate ${score} star${score > 1 ? 's' : ''}`}
                          title={`${score} star${score > 1 ? 's' : ''}`}
                        >
                          <i
                            className={`bi ${active ? 'bi-star-fill' : 'bi-star'}`}
                            style={{ fontSize: '1.4rem', color: active ? '#f59e0b' : '#d1d5db' }}
                          />
                        </button>
                      )
                    })}
                    <span className="text-sm font-medium text-gray-600 ml-1">{STAR_LABELS[ratingForm.score]}</span>
                  </div>
                </div>

                <div>
                  <label className="form-label">Comment</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    value={ratingForm.comment}
                    onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                    placeholder="Share your feedback"
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm cursor-pointer border-0 hover:bg-gray-200 transition-colors"
                onClick={() => setRatingOrder(null)}
              >
                Cancel
              </button>
              <button type="submit" form="ratingForm" className="btn-brand" disabled={submittingRating}>
                {submittingRating ? <><span className="spinner mr-2" />Submitting...</> : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

function OrderProgress({ status }) {
  if (status === 'CANCELLED') return (
    <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
      <i className="bi bi-x-circle-fill" /> Order Cancelled
    </div>
  )
  const current = STEPS.indexOf(status)
  return (
    <div className="progress-wrap">
      <div className="flex items-start gap-0.5">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-start flex-1">
          <div className="progress-stage">
            <div className={`progress-step ${i <= current ? 'done' : 'pending'}`}>
              {i < current ? <i className="bi bi-check" /> : i + 1}
            </div>
            <div className={`progress-stage-label ${i <= current ? 'done' : 'pending'}`}>
              {STATUS_CONFIG[step].label}
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`progress-line progress-line-offset flex-1 ${i < current ? 'done' : 'pending'}`} />
          )}
        </div>
      ))}
      </div>
    </div>
  )
}
