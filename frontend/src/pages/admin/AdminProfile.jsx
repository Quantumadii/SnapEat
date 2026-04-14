import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AdminLayout from './AdminLayout'
import { adminAPI, apiErrorMessage, authAPI } from '../../api'
import useAuthStore from '../../store/useAuthStore'

const MAX_IMAGE_SIZE = 2 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default function AdminProfile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const restaurantId     = user?.restaurantId
  const [restForm, setRestForm]   = useState({})
  const [passForm, setPassForm]   = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [showPass, setShowPass]   = useState(false)
  const [bannerFile, setBannerFile] = useState(null)
  const [activePanel, setActivePanel] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [savingRest, setSavingRest] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const bannerInputRef = useRef(null)

  useEffect(() => {
    if (!restaurantId) return
    adminAPI.getRestaurant(restaurantId)
      .then((r) => setRestForm(r.data.data || {}))
      .catch((err) => toast.error(apiErrorMessage(err, 'Failed to load restaurant info')))
  }, [restaurantId])

  const handleRestSave = async (e) => {
    e.preventDefault()
    setSavingRest(true)
    try {
      const payload = new FormData()
      payload.append('name', restForm.name || '')
      payload.append('description', restForm.description || '')
      payload.append('address', restForm.address || '')
      payload.append('area', restForm.area || '')
      payload.append('city', restForm.city || '')
      payload.append('instagramUrl', restForm.instagramUrl || '')
      payload.append('contactEmail', restForm.contactEmail || '')
      payload.append('contactPhone', restForm.contactPhone || '')
      payload.append('openingHours', restForm.openingHours || '')
      payload.append('customerCancellationAllowedTill', restForm.customerCancellationAllowedTill || 'PREPARING')
      if (bannerFile) payload.append('imageFile', bannerFile)

      await adminAPI.updateRestaurant(restaurantId, payload)
      toast.success('Restaurant profile updated!')
      setBannerFile(null)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Update failed'))
    } finally { setSavingRest(false) }
  }

  const handlePassChange = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirm) { toast.error('Passwords do not match'); return }
    setSavingPass(true)
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
      toast.success('Password changed successfully!')
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to change password'))
    } finally { setSavingPass(false) }
  }

  const rf = (field) => ({
    value: restForm[field] || '',
    onChange: (e) => setRestForm({ ...restForm, [field]: e.target.value }),
  })

  const handleBannerChange = (file) => {
    if (!file) {
      setBannerFile(null)
      return
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Invalid image format. Please upload JPG, PNG, or WEBP.')
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image size exceeds 2MB. Please upload a smaller file.')
      return
    }
    setBannerFile(file)
  }

  const onBannerDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    handleBannerChange(e.dataTransfer.files?.[0] || null)
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Delete your admin account and restaurant permanently? This cannot be undone.')
    if (!confirmed) return

    setDeletingAccount(true)
    try {
      await authAPI.deleteAccount()
      logout()
      toast.success('Account deleted successfully')
      navigate('/')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to delete account'))
    } finally {
      setDeletingAccount(false)
    }
  }

  return (
    <AdminLayout title="Settings">
      <div className="max-w-xl">
        <div className="snap-card p-4 mb-6">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">Quick Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActivePanel('restaurant')}
              className={`text-left rounded-xl border px-4 py-3 transition-colors ${activePanel === 'restaurant' ? 'border-brand bg-brand-light' : 'border-gray-200 hover:border-brand/50'}`}
            >
              <p className="font-semibold text-sm"><i className="bi bi-pencil-square mr-2" />Edit Restaurant Profile</p>
              <p className="text-xs text-gray-500 mt-1">Update contact details, hours, and banner.</p>
            </button>
            <button
              type="button"
              onClick={() => setActivePanel('password')}
              className={`text-left rounded-xl border px-4 py-3 transition-colors ${activePanel === 'password' ? 'border-brand bg-brand-light' : 'border-gray-200 hover:border-brand/50'}`}
            >
              <p className="font-semibold text-sm"><i className="bi bi-shield-lock mr-2" />Change Password</p>
              <p className="text-xs text-gray-500 mt-1">Secure your account with a new password.</p>
            </button>
          </div>
        </div>

        {/* Restaurant Profile */}
        {activePanel === 'restaurant' && (
        <div className="snap-card p-6 mb-6">
          <h6 className="font-bold mb-5">
            <i className="bi bi-shop text-brand mr-2" />Restaurant Profile
          </h6>
          <form onSubmit={handleRestSave}>
            <div className="mb-4">
              <label className="form-label">Restaurant Name *</label>
              <input {...rf('name')} className="form-input" required placeholder="Restaurant Name" />
            </div>
            <div className="mb-4">
              <label className="form-label">Description</label>
              <textarea {...rf('description')} className="form-textarea" rows={2} placeholder="Short description..." />
            </div>
            <div className="mb-4">
              <label className="form-label">Full Address</label>
              <input {...rf('address')} className="form-input" placeholder="Full address" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="form-label"><i className="bi bi-geo-alt text-brand mr-1" />Area *</label>
                <input {...rf('area')} className="form-input" required placeholder="Area / Locality" />
              </div>
              <div>
                <label className="form-label">City *</label>
                <input {...rf('city')} className="form-input" required placeholder="City" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="form-label"><i className="bi bi-telephone text-brand mr-1" />Contact Phone</label>
                <input {...rf('contactPhone')} className="form-input" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="form-label"><i className="bi bi-envelope text-brand mr-1" />Contact Email</label>
                <input {...rf('contactEmail')} type="email" className="form-input" placeholder="contact@email.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="form-label"><i className="bi bi-instagram text-brand mr-1" />Instagram</label>
                <input {...rf('instagramUrl')} className="form-input" placeholder="@handle or URL" />
              </div>
              <div>
                <label className="form-label"><i className="bi bi-clock text-brand mr-1" />Opening Hours</label>
                <input {...rf('openingHours')} className="form-input" placeholder="10AM – 11PM" />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label"><i className="bi bi-sliders text-brand mr-1" />Customer Cancellation Allowed Till</label>
              <select
                className="form-input"
                value={restForm.customerCancellationAllowedTill || 'PREPARING'}
                onChange={(e) => setRestForm({ ...restForm, customerCancellationAllowedTill: e.target.value })}
              >
                <option value="PLACED">PLACED</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PREPARING">PREPARING</option>
                <option value="READY">READY</option>
              </select>
              <p className="text-xs text-gray-500 mt-1 mb-0">
                Customers can cancel when order status is at or before this stage.
              </p>
            </div>
            <div className="mb-5">
              <label className="form-label">Banner Image</label>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleBannerChange(e.target.files?.[0] || null)}
                className="hidden"
              />
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onBannerDrop}
                className={`rounded-xl border-2 border-dashed p-4 text-center ${dragActive ? 'border-brand bg-brand-light' : 'border-gray-300 bg-gray-50'}`}
              >
                <p className="text-sm font-medium">Drag and drop banner image here</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP up to 2MB</p>
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="mt-3 px-4 py-2 rounded-lg border border-brand text-brand text-sm bg-white hover:bg-brand-light"
                >
                  Upload File
                </button>
                {bannerFile && (
                  <p className="text-xs text-green-600 mt-2">Selected: {bannerFile.name}</p>
                )}
              </div>
              {restForm.imageUrl && !bannerFile && (
                <p className="text-xs text-gray-500 mt-2">Current banner will be kept unless you upload a new one.</p>
              )}
            </div>
            <button type="submit" className="btn-brand gap-2" disabled={savingRest}>
              {savingRest ? <><span className="spinner" />Saving...</> : <><i className="bi bi-check-circle" />Save Changes</>}
            </button>
          </form>
        </div>
        )}

        {/* Change Password */}
        {activePanel === 'password' && (
        <div className="snap-card p-6">
          <h6 className="font-bold mb-5">
            <i className="bi bi-shield-lock text-brand mr-2" />Change Password
          </h6>
          <form onSubmit={handlePassChange}>
            {[
              { name: 'currentPassword', label: 'Current Password',     ph: 'Current password' },
              { name: 'newPassword',     label: 'New Password',         ph: 'Min. 8 characters' },
              { name: 'confirm',         label: 'Confirm New Password', ph: 'Repeat new password' },
            ].map((f) => (
              <div key={f.name} className="mb-4">
                <label className="form-label">{f.label}</label>
                <div className="input-wrap">
                  <span className="input-icon"><i className="bi bi-lock" /></span>
                  <input name={f.name} type={showPass ? 'text' : 'password'}
                    className="form-input" value={passForm[f.name]}
                    onChange={(e) => setPassForm({ ...passForm, [f.name]: e.target.value })}
                    required minLength={8} placeholder={f.ph} />
                </div>
              </div>
            ))}
            <label className="flex items-center gap-2 mb-4 cursor-pointer text-sm">
              <input type="checkbox" checked={showPass} onChange={() => setShowPass(!showPass)} className="rounded" />
              Show passwords
            </label>
            <button type="submit" className="btn-brand gap-2" disabled={savingPass}>
              {savingPass ? <><span className="spinner" />Updating...</> : <><i className="bi bi-lock" />Update Password</>}
            </button>
          </form>
        </div>
        )}


        <div className="snap-card p-6 mt-6">
          <h6 className="font-bold mb-1">Account</h6>
          <p className="text-gray-500 text-sm mb-3">Permanently delete your account</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleDeleteAccount} disabled={deletingAccount} className="flex items-center gap-2 px-4 py-2 border border-red-500 text-white rounded-lg bg-red-500 cursor-pointer hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed">
              {deletingAccount ? <><span className="spinner" />Deleting...</> : <><i className="bi bi-trash3" />Delete Account</>}
            </button>
          </div>
          <p className="text-xs text-red-500 mt-2 mb-0">Deleting admin account will also remove restaurant data and menu.</p>
        </div>

      </div>
    </AdminLayout>
  )
}
