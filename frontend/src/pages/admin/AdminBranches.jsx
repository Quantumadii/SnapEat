import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import AdminLayout from './AdminLayout'
import { adminAPI, apiErrorMessage } from '../../api'
import useAuthStore from '../../store/useAuthStore'

const EMPTY_FORM = {
  branchName: '',
  address: '',
  area: '',
  city: '',
  contactPhone: '',
  openingHours: '',
  deliveryCoverage: '',
  imageUrl: '',
  imageFile: null,
  active: true,
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

function ToggleSwitch({ checked, onChange, label, activeLabelClass = 'text-gray-900' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 bg-white hover:border-brand/50 transition-colors"
    >
      <span className={`text-sm ${checked ? activeLabelClass : 'text-gray-500'}`}>{label}</span>
      <span className={`w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-brand' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
      </span>
    </button>
  )
}

export default function AdminBranches() {
  const { user } = useAuthStore()
  const restaurantId = user?.restaurantId
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [dragActive, setDragActive] = useState(false)
  const imageInputRef = useRef(null)

  const fetchBranches = () => {
    if (!restaurantId) return
    setLoading(true)
    adminAPI.getBranches(restaurantId)
      .then((r) => setBranches(r.data.data || []))
      .catch((err) => toast.error(apiErrorMessage(err, 'Failed to load branches')))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBranches() }, [restaurantId])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (branch) => {
    setEditing(branch)
    setForm({
      branchName: branch.branchName || '',
      address: branch.address || '',
      area: branch.area || '',
      city: branch.city || '',
      contactPhone: branch.contactPhone || '',
      openingHours: branch.openingHours || '',
      deliveryCoverage: branch.deliveryCoverage || '',
      imageUrl: branch.imageUrl || '',
      imageFile: null,
      active: branch.active,
    })
    setShowModal(true)
  }

  const handleImageChange = (file) => {
    if (!file) {
      setForm({ ...form, imageFile: null })
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
    setForm({ ...form, imageFile: file })
  }

  const onImageDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    handleImageChange(e.dataTransfer.files?.[0] || null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!restaurantId) {
      toast.error('Restaurant context is missing')
      return
    }

    setSaving(true)
    try {
      const payload = new FormData()
      payload.append('branchName', form.branchName)
      payload.append('address', form.address || '')
      payload.append('area', form.area)
      payload.append('city', form.city)
      payload.append('contactPhone', form.contactPhone || '')
      payload.append('openingHours', form.openingHours || '')
      payload.append('deliveryCoverage', form.deliveryCoverage || '')
      payload.append('active', String(form.active))
      if (form.imageFile) payload.append('imageFile', form.imageFile)
      else if (form.imageUrl) payload.append('imageUrl', form.imageUrl)

      if (editing) {
        await adminAPI.updateBranch(editing.id, payload)
        toast.success('Branch updated!')
      } else {
        await adminAPI.createBranch(restaurantId, payload)
        toast.success('Branch created!')
      }

      setShowModal(false)
      fetchBranches()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to save branch'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (branch) => {
    if (!window.confirm(`Deactivate ${branch.branchName}?`)) return
    try {
      await adminAPI.deleteBranch(branch.id)
      toast.success('Branch deactivated')
      fetchBranches()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to deactivate branch'))
    }
  }

  const filteredBranches = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return branches
    return branches.filter((branch) => [branch.branchName, branch.area, branch.city, branch.contactPhone, branch.deliveryCoverage]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q)))
  }, [branches, search])

  const activeCount = branches.filter((branch) => branch.active).length
  const inactiveCount = branches.length - activeCount

  return (
    <AdminLayout title="Branches">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-bold mb-1">Branch Management</h3>
          <p className="text-gray-500 text-sm mb-0">Create branch locations, set delivery coverage, and manage branch-specific information.</p>
        </div>
        <button onClick={openCreate} className="btn-brand gap-2 shrink-0">
          <i className="bi bi-plus-lg" /> Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="snap-card p-4">
          <p className="text-gray-500 text-sm mb-1">Total Branches</p>
          <h4 className="font-bold mb-0">{branches.length}</h4>
        </div>
        <div className="snap-card p-4">
          <p className="text-gray-500 text-sm mb-1">Active</p>
          <h4 className="font-bold mb-0 text-green-600">{activeCount}</h4>
        </div>
        <div className="snap-card p-4">
          <p className="text-gray-500 text-sm mb-1">Inactive</p>
          <h4 className="font-bold mb-0 text-red-500">{inactiveCount}</h4>
        </div>
      </div>

      <div className="snap-card p-4 mb-6">
        <div className="flex items-center gap-2">
          <i className="bi bi-search text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 outline-none w-full bg-transparent"
            placeholder="Search branches by name, area, city, contact, or coverage"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="snap-card h-72 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : filteredBranches.length === 0 ? (
        <div className="text-center py-16 snap-card">
          <i className="bi bi-diagram-3 text-gray-400" style={{ fontSize: '3rem' }} />
          <p className="text-gray-500 mt-3 mb-0">No branches found</p>
          <button onClick={openCreate} className="btn-brand mt-4">Create your first branch</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBranches.map((branch) => (
            <div key={branch.id} className={`snap-card overflow-hidden h-full ${!branch.active ? 'opacity-70' : ''}`}>
              <div className="relative" style={{ height: 180, background: '#fff4ee' }}>
                {branch.imageUrl ? (
                  <img src={branch.imageUrl} alt={branch.branchName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🏪</div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${branch.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {branch.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h5 className="font-bold mb-1">{branch.branchName}</h5>
                    <p className="text-gray-500 text-sm mb-0">{branch.area}, {branch.city}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-brand-light text-brand font-semibold">#{branch.id}</span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {branch.address && (
                    <div className="flex gap-2">
                      <i className="bi bi-geo-alt text-brand mt-0.5" />
                      <span>{branch.address}</span>
                    </div>
                  )}
                  {branch.openingHours && (
                    <div className="flex gap-2">
                      <i className="bi bi-clock text-brand mt-0.5" />
                      <span>{branch.openingHours}</span>
                    </div>
                  )}
                  {branch.contactPhone && (
                    <div className="flex gap-2">
                      <i className="bi bi-telephone text-brand mt-0.5" />
                      <span>{branch.contactPhone}</span>
                    </div>
                  )}
                  {branch.deliveryCoverage && (
                    <div className="flex gap-2">
                      <i className="bi bi-truck text-brand mt-0.5" />
                      <span>{branch.deliveryCoverage}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                  <button onClick={() => openEdit(branch)} className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm cursor-pointer bg-transparent hover:bg-gray-50 transition-colors">
                    <i className="bi bi-pencil mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeactivate(branch)}
                    disabled={!branch.active}
                    className={`px-3 py-2 border rounded-lg text-sm cursor-pointer bg-transparent transition-colors ${branch.active ? 'border-red-300 text-red-500 hover:bg-red-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    <i className="bi bi-slash-circle mr-1" />
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h5 className="font-bold mb-0">{editing ? 'Edit Branch' : 'Add Branch'}</h5>
              <button className="border-0 bg-transparent cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setShowModal(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="modal-body">
              <form id="branchForm" onSubmit={handleSave}>
                <div className="mb-4">
                  <label className="form-label">Branch Name *</label>
                  <input value={form.branchName} onChange={(e) => setForm({ ...form, branchName: e.target.value })} className="form-input" required placeholder="e.g. Downtown Branch" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="form-label">Area *</label>
                    <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="form-input" required placeholder="Area / locality" />
                  </div>
                  <div>
                    <label className="form-label">City *</label>
                    <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="form-input" required placeholder="City" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label">Address</label>
                  <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="form-textarea" placeholder="Full branch address..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="form-label">Contact Phone</label>
                    <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="form-input" placeholder="Phone number" />
                  </div>
                  <div>
                    <label className="form-label">Opening Hours</label>
                    <input value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} className="form-input" placeholder="e.g. 9:00 AM - 11:00 PM" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label">Delivery Coverage</label>
                  <textarea rows={2} value={form.deliveryCoverage} onChange={(e) => setForm({ ...form, deliveryCoverage: e.target.value })} className="form-textarea" placeholder="Areas, radius, or delivery rules shown to customers" />
                </div>
                <div className="mb-4">
                  <label className="form-label">Branch Image</label>
                  <input ref={imageInputRef} type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files?.[0] || null)} className="hidden" />
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={onImageDrop}
                    className={`rounded-xl border-2 border-dashed p-4 text-center ${dragActive ? 'border-brand bg-brand-light' : 'border-gray-300 bg-gray-50'}`}
                  >
                    <p className="text-sm font-medium">Drag and drop branch image here</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP up to 2MB</p>
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="mt-3 px-4 py-2 rounded-lg border border-brand text-brand text-sm bg-white hover:bg-brand-light"
                    >
                      Upload File
                    </button>
                    {form.imageFile && (
                      <p className="text-xs text-green-600 mt-2">Selected: {form.imageFile.name}</p>
                    )}
                    {!form.imageFile && form.imageUrl && (
                      <p className="text-xs text-gray-500 mt-2">Current image will be kept unless you upload a new one.</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                  <div className="flex flex-col justify-end gap-2 pb-1">
                    <ToggleSwitch checked={form.active} onChange={(value) => setForm({ ...form, active: value })} label="Active" activeLabelClass="text-brand" />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm cursor-pointer border-0 hover:bg-gray-200 transition-colors" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" form="branchForm" className="btn-brand" disabled={saving}>
                {saving ? <><span className="spinner mr-2" />Saving...</> : editing ? 'Update Branch' : 'Add Branch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
