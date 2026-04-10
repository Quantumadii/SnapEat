import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiErrorMessage, authAPI } from '../api'
import useAuthStore from '../store/useAuthStore'

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const navigate         = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [activePanel, setActivePanel] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const changePassword = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await authAPI.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      toast.success('Password changed successfully!')
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to change password'))
    } finally { setLoading(false) }
  }

  const deleteAccount = async () => {
    const confirmText = user?.role === 'ADMIN'
      ? 'Delete your admin account and restaurant permanently?'
      : 'Delete your account permanently?'

    if (!window.confirm(confirmText)) return

    setDeleting(true)
    try {
      await authAPI.deleteAccount()
      logout()
      toast.success('Your account has been deleted')
      navigate('/')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to delete account'))
    } finally {
      setDeleting(false)
    }
  }

  const signOut = async () => {
    setSigningOut(true)
    try {
      logout()
      toast.success('Signed out successfully')
      navigate('/')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="max-w-xl mx-auto w-full px-4 py-8 flex-1">
        <h3 className="font-bold mb-6">My Profile</h3>

        {/* Profile card */}
        <div className="snap-card p-6 mb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">{user?.fullName?.[0]}</span>
            </div>
            <div>
              <h5 className="font-bold mb-0">{user?.fullName}</h5>
              <p className="text-gray-500 text-sm mb-1">{user?.email}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${user?.role === 'ADMIN' ? 'bg-blue-500' : 'bg-green-500'}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 bg-gray-50">
              <p className="text-gray-500 text-xs mb-1">Full Name</p>
              <p className="font-semibold text-sm mb-0">{user?.fullName}</p>
            </div>
            <div className="rounded-xl p-3 bg-gray-50">
              <p className="text-gray-500 text-xs mb-1">Email</p>
              <p className="font-semibold text-sm mb-0 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="snap-card p-4 mb-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setActivePanel('password')}
              className={`text-left rounded-xl border px-4 py-3 transition-colors ${activePanel === 'password' ? 'border-brand bg-brand-light' : 'border-gray-200 hover:border-brand/50'}`}
            >
              <p className="font-semibold text-sm"><i className="bi bi-shield-lock mr-2" />Change Password</p>
              <p className="text-xs text-gray-500 mt-1">Secure your account with a new password.</p>
            </button>
            <button
              type="button"
              onClick={() => setActivePanel('delete')}
              className={`text-left rounded-xl border px-4 py-3 transition-colors ${activePanel === 'delete' ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}
            >
              <p className="font-semibold text-sm"><i className="bi bi-trash3 mr-2" />Delete Account</p>
              <p className="text-xs text-gray-500 mt-1">Permanently remove your account data.</p>
            </button>
            <button
              type="button"
              onClick={() => setActivePanel('logout')}
              className={`text-left rounded-xl border px-4 py-3 transition-colors ${activePanel === 'logout' ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}
            >
              <p className="font-semibold text-sm"><i className="bi bi-box-arrow-right mr-2" />Sign Out</p>
              <p className="text-xs text-gray-500 mt-1">Log out from your account on this device.</p>
            </button>
          </div>
        </div>

        {/* Change Password */}
        {activePanel === 'password' && (
        <div className="snap-card p-6 mb-4">
          <h6 className="font-bold mb-4">
            <i className="bi bi-shield-lock text-brand mr-2" />Change Password
          </h6>
          <form onSubmit={changePassword}>
            {[
              { name: 'currentPassword', label: 'Current Password',    ph: 'Your current password' },
              { name: 'newPassword',     label: 'New Password',        ph: 'Min. 8 characters' },
              { name: 'confirm',         label: 'Confirm New Password', ph: 'Repeat new password' },
            ].map((f) => (
              <div key={f.name} className="mb-3">
                <label className="form-label">{f.label}</label>
                <div className="input-wrap">
                  <span className="input-icon"><i className="bi bi-lock" /></span>
                  <input name={f.name} type={showPass ? 'text' : 'password'}
                    className="form-input" value={form[f.name]} onChange={handle}
                    required minLength={8} placeholder={f.ph} />
                </div>
              </div>
            ))}
            <label className="flex items-center gap-2 mb-4 cursor-pointer text-sm">
              <input type="checkbox" checked={showPass} onChange={() => setShowPass(!showPass)} className="rounded" />
              Show passwords
            </label>
            <button type="submit" className="btn-brand gap-2" disabled={loading}>
              {loading
                ? <><span className="spinner" />Updating...</>
                : <><i className="bi bi-check-circle" />Update Password</>}
            </button>
          </form>
        </div>
        )}

        {activePanel === 'delete' && (
        <div className="snap-card p-6">
          <h6 className="font-bold mb-1">Account</h6>
          <p className="text-gray-500 text-sm mb-3">Permanently delete your account</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={deleteAccount} disabled={deleting} className="flex items-center gap-2 px-4 py-2 border border-red-500 text-white rounded-lg bg-red-500 cursor-pointer hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed">
              {deleting ? <><span className="spinner" />Deleting...</> : <><i className="bi bi-trash3" />Delete Account</>}
            </button>
          </div>
          {user?.role === 'ADMIN' && (
            <p className="text-xs text-red-500 mt-2 mb-0">Deleting admin account will also remove restaurant data and menu.</p>
          )}
        </div>
        )}

        {activePanel === 'logout' && (
        <div className="snap-card p-6">
          <h6 className="font-bold mb-1">Sign Out</h6>
          <p className="text-gray-500 text-sm mb-3">You will be logged out and redirected to home.</p>
          <button
            onClick={signOut}
            disabled={signingOut}
            className="flex items-center gap-2 px-4 py-2 border border-amber-500 text-white rounded-lg bg-amber-500 cursor-pointer hover:bg-amber-600 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {signingOut ? <><span className="spinner" />Signing out...</> : <><i className="bi bi-box-arrow-right" />Sign Out</>}
          </button>
        </div>
        )}

        {!activePanel && (
          <div className="text-center text-sm text-gray-500 py-4">Select an action above to continue.</div>
        )}
      </div>

      <Footer />
    </div>
  )
}
