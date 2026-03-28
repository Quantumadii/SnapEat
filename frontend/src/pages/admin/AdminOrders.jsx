import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import AdminLayout from './AdminLayout'
import { adminAPI } from '../../api'
import useAuthStore from '../../store/useAuthStore'

const STATUSES    = ['ALL','PLACED','PREPARING','READY','COMPLETED','CANCELLED']
const STATUS_CSS  = { PLACED:'status-PLACED', PREPARING:'status-PREPARING', READY:'status-READY', COMPLETED:'status-COMPLETED', CANCELLED:'status-CANCELLED' }
const NEXT_STATUS = { PLACED:'PREPARING', PREPARING:'READY', READY:'COMPLETED' }
const NEXT_LABEL  = { PLACED:'Start Preparing', PREPARING:'Mark Ready', READY:'Mark Delivered' }

export default function AdminOrders() {
  const { user }       = useAuthStore()
  const restaurantId   = user?.restaurantId
  const [orders, setOrders]     = useState([])
  const [filter, setFilter]     = useState('ALL')
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [updating, setUpdating] = useState(null)

  const fetchOrders = () => {
    if (!restaurantId) return
    setLoading(true)
    adminAPI.getOrders(restaurantId, filter === 'ALL' ? null : filter)
      .then((r) => setOrders(r.data.data || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [filter, restaurantId])

  const handleStatus = async (orderId, status) => {
    setUpdating(orderId)
    try {
      await adminAPI.updateOrderStatus(orderId, status)
      toast.success(`Order marked as ${status}`)
      fetchOrders()
    } catch { toast.error('Failed to update status') }
    finally { setUpdating(null) }
  }

  return (
    <AdminLayout title="Order Management">

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`cat-pill ${filter === s ? 'active' : ''}`}>
              {s === 'ALL' ? 'All Orders' : s}
            </button>
          ))}
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm cursor-pointer border-0 hover:bg-gray-200 transition-colors">
          <i className="bi bi-arrow-clockwise" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="snap-card p-6 h-24 animate-pulse">
              <div className="bg-gray-200 rounded h-4 w-1/4 mb-2" />
              <div className="bg-gray-200 rounded h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <i className="bi bi-inbox text-gray-400" style={{ fontSize: '3rem' }} />
          <p className="text-gray-500 mt-3">No orders found for this filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="snap-card overflow-hidden">
              {/* Header */}
              <div className="p-5 flex flex-wrap items-center gap-3 cursor-pointer"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-base">#{order.id}</span>
                    <span className={STATUS_CSS[order.status]}>{order.status}</span>
                  </div>
                  <p className="font-medium text-sm mb-0">{order.customerName}</p>
                  <p className="text-gray-500 text-xs mb-0">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-lg mb-0">₹{order.totalAmount}</p>
                  <p className="text-gray-500 text-xs mb-0">{order.orderItems?.length} item(s)</p>
                </div>
                <i className={`bi bi-chevron-${expanded === order.id ? 'up' : 'down'} text-gray-400`} />
              </div>

              {/* Expanded */}
              {expanded === order.id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">Items Ordered</p>
                      {order.orderItems?.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm mb-1">
                          <span>{item.menuItemName} × {item.quantity}</span>
                          <span className="font-medium">₹{item.subtotal}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 pt-1 mt-1 flex justify-between text-sm font-bold">
                        <span>Total</span>
                        <span className="text-brand">₹{order.totalAmount}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">Delivery Address</p>
                      <p className="text-sm mb-0">
                        <i className="bi bi-geo-alt text-brand mr-1" />{order.deliveryAddress}
                      </p>
                      {order.specialInstructions && (
                        <p className="text-sm text-gray-500 italic mt-2 mb-0">"{order.specialInstructions}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    {NEXT_STATUS[order.status] && (
                      <button onClick={() => handleStatus(order.id, NEXT_STATUS[order.status])}
                        disabled={updating === order.id}
                        className="btn-brand text-sm py-1.5 px-3 gap-1">
                        {updating === order.id
                          ? <><span className="spinner" /> Updating...</>
                          : <><i className="bi bi-arrow-right-circle" />{NEXT_LABEL[order.status]}</>}
                      </button>
                    )}
                    {(order.status === 'PLACED' || order.status === 'PREPARING') && (
                      <button onClick={() => handleStatus(order.id, 'CANCELLED')}
                        disabled={updating === order.id}
                        className="text-sm px-3 py-1.5 border border-red-300 text-red-500 rounded-lg bg-transparent cursor-pointer hover:bg-red-50 transition-colors">
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </AdminLayout>
  )
}
