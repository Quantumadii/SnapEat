import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/useAuthStore'

import HomePage       from './pages/HomePage'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import ForgotPage     from './pages/ForgotPage'
import ResetPage      from './pages/ResetPage'
import RestaurantPage from './pages/RestaurantPage'
import CartPage       from './pages/CartPage'
import OrdersPage     from './pages/OrdersPage'
import ProfilePage    from './pages/ProfilePage'
import AboutPage      from './pages/AboutPage'
import HelpPage       from './pages/HelpPage'
import ContactPage    from './pages/ContactPage'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailure from './pages/PaymentFailure'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminBranches  from './pages/admin/AdminBranches'
import AdminMenu      from './pages/admin/AdminMenu'
import AdminOrders    from './pages/admin/AdminOrders'
import AdminProfile   from './pages/admin/AdminProfile'

function PrivateRoute({ children }) {
  
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/" replace />
}
function AdminRoute({ children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}
function GuestRoute({ children }) {
  const { user } = useAuthStore()
  return !user ? children : <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/'} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"               element={<HomePage />} />
      <Route path="/restaurant/:id" element={<RestaurantPage />} />
      <Route path="/about"          element={<AboutPage />} />
      <Route path="/help"           element={<HelpPage />} />
      <Route path="/contact"        element={<ContactPage />} />
      <Route path="/payment/success" element={<PrivateRoute><PaymentSuccess /></PrivateRoute>} />
      <Route path="/payment/failure" element={<PrivateRoute><PaymentFailure /></PrivateRoute>} />

      {/* Guest only */}
      <Route path="/login"           element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register"        element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPage /></GuestRoute>} />
      <Route path="/reset-password"  element={<GuestRoute><ResetPage /></GuestRoute>} />

      {/* Customer */}
      <Route path="/cart"    element={<PrivateRoute><CartPage /></PrivateRoute>} />
      <Route path="/orders"  element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/branches"  element={<AdminRoute><AdminBranches /></AdminRoute>} />
      <Route path="/admin/menu"      element={<AdminRoute><AdminMenu /></AdminRoute>} />
      <Route path="/admin/orders"    element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path="/admin/profile"   element={<AdminRoute><AdminProfile /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
