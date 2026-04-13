import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import useCartStore from '../store/useCartStore'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const totalItems = useCartStore((s) => s.getTotalItems())
  const navigate   = useNavigate()
  const location   = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/'); setOpen(false) }
  const isActive = (path) => location.pathname === path ? 'active' : ''
  const close = () => setOpen(false)

  return (
    <nav className="snap-nav sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-4">

        <Link to="/" className="snap-logo text-xl mr-4" onClick={close}>
          Snap<span>Eat</span>
        </Link>

        <div className="flex items-center gap-2 lg:hidden ml-auto mr-2">
          <ThemeToggle />
          {user?.role !== 'ADMIN' && (
            <Link to="/cart" className="relative text-gray-800 text-xl" onClick={close}>
              <i className="bi bi-bag" />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
          )}
        </div>
        <button className="lg:hidden border-0 bg-transparent p-1" onClick={() => setOpen(!open)}>
          <i className={`bi ${open ? 'bi-x-lg' : 'bi-list'} text-xl`} />
        </button>

        <div className={`${open ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row items-start lg:items-center gap-1 absolute lg:static top-14 left-0 right-0 nav-mobile-panel lg:bg-transparent px-4 lg:px-0 py-3 lg:py-0 border-b lg:border-0 shadow-md lg:shadow-none flex-1 z-50`}>

          <div className="flex flex-col lg:flex-row gap-1 mr-auto">
            {[
              { to: '/',        label: 'Home' },
              { to: '/about',   label: 'About Us' },
              { to: '/help',    label: 'Help' },
              { to: '/contact', label: 'Contact Us' },
            ].map((l) => (
              <Link key={l.to} to={l.to} className={`nav-link-item ${isActive(l.to)}`} onClick={close}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden lg:inline-flex" />

            {user?.role !== 'ADMIN' && (
              <Link to="/cart" className="relative text-gray-800 text-xl hidden lg:block mr-1" onClick={close}>
                <i className="bi bi-bag" />
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </Link>
            )}

            {user ? (
              <>
                {user.role === 'ADMIN' ? (
                  <Link to="/admin/dashboard" className="btn-brand text-sm py-1.5 px-3" onClick={close}>
                    <i className="bi bi-speedometer2 mr-1" />Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/orders" className="nav-link-item" onClick={close}>My Orders</Link>
                    <Link to="/profile" className="flex items-center gap-2 no-underline" onClick={close}>
                      <div className="w-8 h-8 rounded-full bg-[#ff6b35] flex items-center justify-center text-white ">
                        <span className="text-white font-bold" style={{ fontSize: 13 }}>
                          {user.fullName?.[0]}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-800 text-sm">{user.fullName?.split(' ')[0]}</span>
                    </Link>
                  </>
                )}
                {user.role === 'ADMIN' && (
                  <button onClick={handleLogout} className="btn-outline-brand text-sm py-1.5 px-3 text-red-500 border-red-400 hover:bg-red-500">
                    <i className="bi bi-box-arrow-right" />
                  </button>
                )}
              </>
            ) : (
              <>
                <Link to="/login"    className="btn-outline-brand text-sm py-1.5 px-3" onClick={close}>Sign In</Link>
                <Link to="/register" className="btn-brand text-sm py-1.5 px-3" onClick={close}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
