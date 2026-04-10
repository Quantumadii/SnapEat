import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import useCartStore from '../store/useCartStore'
import { apiErrorMessage, orderAPI, paymentAPI } from '../api'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, restaurantId, restaurantName, branchId, branchName, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore()
  const [form, setForm]   = useState({ flatNo: '', deliveryArea: '', deliveryCity: '', pincode: '', specialInstructions: '' })
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [loading, setLoading] = useState(false)
  const [stripeConfig, setStripeConfig] = useState({ publishableKey: '', currency: 'inr' })

  useEffect(() => {
    paymentAPI.getConfig()
      .then((r) => setStripeConfig(r.data?.data || { publishableKey: '', currency: 'inr' }))
      .catch(() => {})
  }, [])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const placeOrder = async () => {
    if (!restaurantId) {
      toast.error('Please select a restaurant and add items again')
      return
    }
    if (!items.length || items.some((i) => !i.id || !i.quantity)) {
      toast.error('Cart has invalid items. Please refresh and try again')
      return
    }
    if (!form.flatNo || !form.deliveryArea || !form.deliveryCity || !form.pincode) {
      toast.error('Please fill in all delivery address fields')
      return
    }
    setLoading(true)
    try {
      const payload = {
        restaurantId,
        branchId: branchId || null,
        items: items.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
        paymentMethod,
        ...form,
      }
      const res = await orderAPI.placeOrder(payload)
      const createdOrder = res.data?.data || null
      const orderId = createdOrder?.id

      if (paymentMethod === 'STRIPE') {
        if (!stripeConfig.publishableKey) {
          throw new Error('Stripe publishable key is missing. Please set stripe.publishable-key in backend properties.')
        }
        if (!orderId) {
          throw new Error('Order created but ID is missing, cannot continue to checkout')
        }

        const amountInPaise = Math.round(Number(createdOrder?.totalAmount ?? grandTotal) * 100)
        const successUrl = `${window.location.origin}/payment/success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`
        const cancelUrl = `${window.location.origin}/payment/failure?orderId=${orderId}`

        const checkoutRes = await paymentAPI.createCheckoutSession({
          orderId,
          amountInPaise,
          description: `SnapEat order #${orderId}`,
          successUrl,
          cancelUrl,
        })

        const checkoutUrl = checkoutRes.data?.data?.checkoutUrl
        if (!checkoutUrl) {
          throw new Error('Could not create Stripe checkout session')
        }

        toast.success('Redirecting to Stripe checkout...')
        window.location.href = checkoutUrl
        return
      }

      clearCart()
      toast.success('Order placed successfully! 🎉')
      navigate('/orders')
    } catch (err) {
      toast.error(apiErrorMessage(err, err.message || 'Failed to place order'))
    } finally { setLoading(false) }
  }

  const total      = getTotalPrice()
  const delivery   = 0
  const grandTotal = total + delivery

  if (items.length === 0) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-16">
          <i className="bi bi-bag text-gray-400" style={{ fontSize: '4rem' }} />
          <h4 className="font-bold mt-4 mb-2">Your cart is empty</h4>
          <p className="text-gray-500 mb-6">Add some delicious items to get started</p>
          <Link to="/" className="btn-brand px-6">Browse Restaurants</Link>
        </div>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <h3 className="font-bold mb-1">Your Cart</h3>
        <p className="text-gray-500 mb-6 text-sm"><i className="bi bi-shop text-brand mr-1" />{restaurantName}{branchName ? ` · ${branchName}` : ''}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="snap-card p-3 flex items-center gap-3">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="rounded-xl shrink-0 object-cover" style={{ width: 72, height: 72 }} />
                ) : (
                  <div className="rounded-xl shrink-0 flex items-center justify-center" style={{ width: 72, height: 72, background: '#fff4ee', fontSize: '2rem' }}>🍽️</div>
                )}
                <div className="flex-1 min-w-0">
                  <h6 className="font-semibold mb-0 truncate">{item.name}</h6>
                  <span className="text-brand font-bold">₹{item.price}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="qty-ctrl">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <i className="bi bi-dash" />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <i className="bi bi-plus" />
                    </button>
                  </div>
                  <span className="font-bold text-sm" style={{ minWidth: 64, textAlign: 'right' }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button className="text-red-400 bg-transparent border-0 cursor-pointer p-0" onClick={() => removeItem(item.id)}>
                    <i className="bi bi-trash3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="snap-card p-4">
              <h6 className="font-bold mb-3"><i className="bi bi-geo-alt text-brand mr-1" />Delivery Address</h6>
              <div className="space-y-2">
                <input name="flatNo"       className="form-input-sm" value={form.flatNo}       onChange={handle} placeholder="Flat / House No. *" />
                <input name="deliveryArea" className="form-input-sm" value={form.deliveryArea} onChange={handle} placeholder="Area / Locality *" />
                <div className="grid grid-cols-2 gap-2">
                  <input name="deliveryCity" className="form-input-sm" value={form.deliveryCity} onChange={handle} placeholder="City *" />
                  <input name="pincode"      className="form-input-sm" value={form.pincode}      onChange={handle} placeholder="Pincode *" />
                </div>
                <textarea name="specialInstructions" className="form-textarea" style={{ padding: '6px 12px', fontSize: '0.875rem' }} rows={2}
                  value={form.specialInstructions} onChange={handle} placeholder="Special instructions (optional)..." />
              </div>
            </div>

            <div className="snap-card p-4">
              <h6 className="font-bold mb-3">Bill Summary</h6>
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Item Total</span><span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Delivery Fee</span><span>Included</span>
              </div>
              <hr className="my-2 border-gray-100" />
              <div className="flex justify-between font-bold">
                <span>Grand Total</span>
                <span className="text-brand">₹{grandTotal.toFixed(2)}</span>
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold border transition-all ${paymentMethod === 'COD' ? 'border-brand bg-brand-light text-brand' : 'border-gray-200 text-gray-600 bg-white'}`}
                  >
                    <i className="bi bi-cash-coin mr-1" />Cash on Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('STRIPE')}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold border transition-all ${paymentMethod === 'STRIPE' ? 'border-brand bg-brand-light text-brand' : 'border-gray-200 text-gray-600 bg-white'}`}
                  >
                    <i className="bi bi-credit-card-2-front mr-1" />Online (Stripe)
                  </button>
                </div>
              </div>

              <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm mt-3 ${paymentMethod === 'COD' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                <i className={`bi ${paymentMethod === 'COD' ? 'bi-cash-coin' : 'bi-shield-check'}`} />
                <span className="font-semibold">
                  {paymentMethod === 'COD' ? 'Pay when your order arrives' : 'Secure payment via Stripe'}
                </span>
              </div>
              <button onClick={placeOrder} disabled={loading}
                className="btn-brand w-full py-2.5 mt-3 justify-center gap-2">
                {loading
                  ? <><span className="spinner" />{paymentMethod === 'STRIPE' ? 'Processing Payment...' : 'Placing Order...'}</>
                  : <>{paymentMethod === 'STRIPE' ? 'Pay & Place Order' : 'Place Order'} <i className="bi bi-arrow-right" /></>}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
