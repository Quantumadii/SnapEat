import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import AdminLayout from './AdminLayout'
import { adminAPI, apiErrorMessage } from '../../api'
import useAuthStore from '../../store/useAuthStore'

const STATUS_COLORS = {
  PLACED:    'status-PLACED',
  CONFIRMED: 'status-CONFIRMED',
  PREPARING: 'status-PREPARING',
  READY:     'status-READY',
  COMPLETED: 'status-COMPLETED',
  CANCELLED: 'status-CANCELLED',
}

export default function AdminDashboard() {
  const { user }     = useAuthStore()
  const restaurantId = user?.restaurantId
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    if (!restaurantId) return
    setLoading(true)
    adminAPI.getDashboard(restaurantId)
      .then((r) => setStats(r.data.data))
      .catch((err) => toast.error(apiErrorMessage(err, 'Failed to load dashboard')))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [restaurantId])

  const STAT_CARDS = stats ? [
    { label: 'Total Orders',    value: stats.totalOrders,     icon: 'bi-bag-fill',         color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Pending',         value: stats.pendingOrders,   icon: 'bi-hourglass-split',  color: '#d97706', bg: '#fef3c7' },
    { label: 'Completed',       value: stats.completedOrders, icon: 'bi-check-circle-fill', color: '#16a34a', bg: '#dcfce7' },
    { label: "Today's Revenue", value: `₹${stats.dailyRevenue ?? 0}`, icon: 'bi-currency-rupee', color: '#ff6b35', bg: '#fff4ee' },
    { label: 'Cancelled',       value: stats.cancelledOrders, icon: 'bi-x-circle-fill',    color: '#dc2626', bg: '#fee2e2' },
    { label: 'Menu Items',      value: stats.totalMenuItems,  icon: 'bi-menu-button-wide', color: '#7c3aed', bg: '#ede9fe' },
  ] : []

  return (
    <AdminLayout title="Dashboard">

      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="snap-card p-5 h-24 animate-pulse">
              <div className="bg-gray-200 rounded h-3 w-1/2 mb-2" />
              <div className="bg-gray-200 rounded h-6 w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className="snap-card p-4 flex items-center gap-4">
              <div className="w-13 h-13 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ width: 52, height: 52, background: s.bg }}>
                <i className={`bi ${s.icon} text-xl`} style={{ color: s.color }} />
              </div>
              <div>
                <h4 className="font-bold mb-0" style={{ color: s.color }}>{s.value}</h4>
                <p className="text-gray-500 text-sm mb-0">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      
      <div className="snap-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h6 className="font-bold mb-0">Recent Orders</h6>
          <button onClick={fetch} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm cursor-pointer border-0 hover:bg-gray-200 transition-colors">
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>

        {!stats?.recentOrders?.length ? (
          <div className="text-center py-10">
            <i className="bi bi-inbox text-gray-400" style={{ fontSize: '2.5rem' }} />
            <p className="text-gray-500 mt-2 mb-0">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Order #','Customer','Items','Total','Status','Time'].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-500 font-semibold pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="font-bold py-3 pr-4">#{o.id}</td>
                    <td className="pr-4">{o.customerName}</td>
                    <td className="text-gray-500 pr-4">{o.orderItems?.length} item(s)</td>
                    <td className="font-semibold pr-4">₹{o.totalAmount}</td>
                    <td className="pr-4">
                      <span className={STATUS_COLORS[o.status]}>{o.status}</span>
                    </td>
                    <td className="text-gray-500">
                      {new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </AdminLayout>
  )
}
