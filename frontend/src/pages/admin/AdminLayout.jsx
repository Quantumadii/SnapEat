import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import ThemeToggle from '../../components/ThemeToggle'

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: 'bi-speedometer2',     label: 'Dashboard' },
  { to: '/admin/branches',  icon: 'bi-diagram-3',        label: 'Branches' },
  { to: '/admin/menu',      icon: 'bi-menu-button-wide', label: 'Menu' },
  { to: '/admin/orders',    icon: 'bi-receipt',          label: 'Orders' },
  { to: '/admin/profile',   icon: 'bi-gear',             label: 'Settings' },
]

export default function AdminLayout({ children, title }) {
  const location         = useLocation()
  const navigate         = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }
  const isActive = (to) => location.pathname === to

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-gray-100">
        <Link to="/" className="snap-logo text-xl">Snap<span>Eat</span></Link>
        <div className="flex items-center gap-2 mt-3 p-2 rounded-xl bg-brand-light">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{user?.fullName?.[0]}</span>
          </div>
          <p className="font-semibold text-sm mb-0 truncate">{user?.fullName}</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link key={item.to} to={item.to}
            className={`admin-nav-link ${isActive(item.to) ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}>
            <i className={`bi ${item.icon}`} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100 space-y-1">
        <Link to="/" className="admin-nav-link" onClick={() => setSidebarOpen(false)}>
          <i className="bi bi-arrow-left" /> View Site
        </Link>
        <button onClick={handleLogout} className="admin-nav-link text-red-500 border-0 bg-transparent cursor-pointer">
          <i className="bi bi-box-arrow-right" /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="admin-sidebar hidden lg:flex flex-col">
        <SidebarContent />
      </div>

      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40" onClick={() => setSidebarOpen(false)} />
          <div className="admin-sidebar show flex flex-col lg:hidden" style={{ zIndex: 50 }}>
            <SidebarContent />
          </div>
        </>
      )}

      <div className="admin-content">
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="lg:hidden border border-gray-200 bg-gray-50 rounded-lg p-1.5 cursor-pointer" onClick={() => setSidebarOpen(true)}>
              <i className="bi bi-list text-xl" />
            </button>
            <h5 className="font-bold mb-0">{title}</h5>
          </div>
          <ThemeToggle />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
