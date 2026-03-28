import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { authAPI } from '../api'
import useAuthStore from '../store/useAuthStore'

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const navigate         = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
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
      toast.error(err.response?.data?.message || 'Failed to change password')
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
      toast.error(err.response?.data?.message || 'Failed to delete account')
    } finally {
      setDeleting(false)
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

        {/* Change Password */}
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

        {/* Logout */}
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
      </div>

      <Footer />
    </div>
  )
}
