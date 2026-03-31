import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import AdminLayout from './AdminLayout'
import { adminAPI, apiErrorMessage } from '../../api'
import useAuthStore from '../../store/useAuthStore'

const CATEGORIES   = ['STARTER','MAIN_COURSE','BEVERAGES','SNACKS','CHINESE','RICE','ADD_ONS']
const CAT_LABELS   = { STARTER:'Starters', MAIN_COURSE:'Main Course', BEVERAGES:'Beverages', SNACKS:'Snacks', CHINESE:'Chinese', RICE:'Rice', ADD_ONS:'Add Ons' }
const SPICE_LEVELS = ['MILD','MEDIUM','HOT']
const EMPTY_FORM   = { name:'', description:'', price:'', category:'STARTER', imageFile:null, available:true, veg:true, spiceLevel:'MILD' }
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
      <span
        className={`w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-brand' : 'bg-gray-300'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-5' : 'left-0.5'}`}
        />
      </span>
    </button>
  )
}

export default function AdminMenu() {
  const { user }        = useAuthStore()
  const restaurantId    = user?.restaurantId
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [filterCat, setFilterCat] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const imageInputRef = useRef(null)

  const fetchMenu = () => {
    if (!restaurantId) return
    adminAPI.getAdminMenu(restaurantId)
      .then((r) => setItems(r.data.data || []))
      .catch((err) => toast.error(apiErrorMessage(err, 'Failed to load menu')))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMenu() }, [restaurantId])

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (item) => {
    setEditing(item)
    setForm({ name: item.name, description: item.description || '', price: item.price,
      category: item.category, imageFile: null, available: item.available,
      veg: item.veg, spiceLevel: item.spiceLevel || 'MILD' })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = new FormData()
      payload.append('name', form.name)
      payload.append('description', form.description || '')
      payload.append('price', String(parseFloat(form.price)))
      payload.append('category', form.category)
      payload.append('available', String(form.available))
      payload.append('veg', String(form.veg))
      payload.append('spiceLevel', form.spiceLevel || 'MILD')
      if (form.imageFile) payload.append('imageFile', form.imageFile)

      if (editing) {
        await adminAPI.updateMenuItem(editing.id, payload)
        toast.success('Item updated!')
      } else {
        await adminAPI.createMenuItem(restaurantId, payload)
        toast.success('Item added!')
      }
      setShowModal(false)
      fetchMenu()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Save failed'))
    } finally { setSaving(false) }
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

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this item from the menu?')) return
    try { await adminAPI.deleteMenuItem(id); toast.success('Item removed'); fetchMenu() }
    catch (err) { toast.error(apiErrorMessage(err, 'Failed to delete')) }
  }

  const handleToggle = async (id) => {
    try { await adminAPI.toggleMenuItem(id); fetchMenu() }
    catch (err) { toast.error(apiErrorMessage(err, 'Failed to toggle')) }
  }

  const displayed = filterCat === 'ALL' ? items : items.filter((i) => i.category === filterCat)

  return (
    <AdminLayout title="Menu Management">

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => setFilterCat('ALL')} className={`cat-pill ${filterCat === 'ALL' ? 'active' : ''}`}>
            All ({items.length})
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setFilterCat(c)} className={`cat-pill ${filterCat === c ? 'active' : ''}`}>
              {CAT_LABELS[c]}
            </button>
          ))}
        </div>
        <button onClick={openCreate} className="btn-brand gap-2 shrink-0">
          <i className="bi bi-plus-lg" /> Add Item
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="snap-card h-64 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16">
          <i className="bi bi-plus-circle text-gray-400" style={{ fontSize: '3rem' }} />
          <p className="text-gray-500 mt-3">No items yet. Add your first menu item!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((item) => (
            <div key={item.id} className={`snap-card overflow-hidden h-full ${!item.available ? 'opacity-50' : ''}`}>
              <div className="relative overflow-hidden" style={{ height: 140, background: '#fff4ee' }}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
                )}
                <span className={`absolute top-2 left-2 veg-dot ${item.veg ? 'veg' : 'nonveg'}`}><span className="inner" /></span>
                {!item.available && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
                    <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-lg">Unavailable</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-brand font-semibold" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>{CAT_LABELS[item.category]}</span>
                  <span className="font-bold">₹{item.price}</span>
                </div>
                <h6 className="font-bold mb-1 text-sm">{item.name}</h6>
                {item.description && (
                  <p className="text-gray-500 text-xs mb-2" style={{ WebkitLineClamp: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => openEdit(item)} className="flex items-center gap-1 px-2 py-1 border border-gray-300 text-gray-600 rounded-lg text-xs cursor-pointer bg-transparent hover:bg-gray-50 transition-colors">
                    <i className="bi bi-pencil" /> Edit
                  </button>
                  <button onClick={() => handleToggle(item.id)}
                    className={`flex items-center gap-1 px-2 py-1 border rounded-lg text-xs cursor-pointer bg-transparent transition-colors ${item.available ? 'border-yellow-400 text-yellow-600 hover:bg-yellow-50' : 'border-green-400 text-green-600 hover:bg-green-50'}`}>
                    <i className={`bi ${item.available ? 'bi-eye-slash' : 'bi-eye'}`} />
                    {item.available ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="ml-auto px-2 py-1 border border-red-300 text-red-500 rounded-lg text-xs cursor-pointer bg-transparent hover:bg-red-50 transition-colors">
                    <i className="bi bi-trash3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h5 className="font-bold mb-0">{editing ? 'Edit Menu Item' : 'Add Menu Item'}</h5>
              <button className="border-0 bg-transparent cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setShowModal(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="modal-body">
              <form id="menuForm" onSubmit={handleSave}>
                <div className="mb-4">
                  <label className="form-label">Item Name *</label>
                  <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                    className="form-input" required placeholder="e.g. Butter Chicken" />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="form-label">Price (₹) *</label>
                    <input type="number" min="1" step="0.01" value={form.price}
                      onChange={(e) => setForm({...form, price: e.target.value})}
                      className="form-input" required placeholder="0.00" />
                  </div>
                  <div>
                    <label className="form-label">Category *</label>
                    <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="form-select">
                      {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label">Description</label>
                  <textarea rows={2} value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    className="form-textarea" placeholder="Describe the dish..." />
                </div>
                <div className="mb-4">
                  <label className="form-label">Item Image</label>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={onImageDrop}
                    className={`rounded-xl border-2 border-dashed p-4 text-center ${dragActive ? 'border-brand bg-brand-light' : 'border-gray-300 bg-gray-50'}`}
                  >
                    <p className="text-sm font-medium">Drag and drop item image here</p>
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
                  </div>
                  {editing?.imageUrl && !form.imageFile && (
                    <p className="text-xs text-gray-500 mt-2">Current image will be kept unless you upload a new one.</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="form-label">Spice Level</label>
                    <select value={form.spiceLevel} onChange={(e) => setForm({...form, spiceLevel: e.target.value})} className="form-select">
                      {SPICE_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col justify-end gap-2 pb-1">
                    <ToggleSwitch
                      checked={form.veg}
                      onChange={(value) => setForm({ ...form, veg: value })}
                      label="Vegetarian"
                      activeLabelClass="text-green-700"
                    />
                    <ToggleSwitch
                      checked={form.available}
                      onChange={(value) => setForm({ ...form, available: value })}
                      label="Available"
                      activeLabelClass="text-brand"
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm cursor-pointer border-0 hover:bg-gray-200 transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" form="menuForm" className="btn-brand" disabled={saving}>
                {saving ? <><span className="spinner mr-2" />Saving...</> : editing ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  )
}
