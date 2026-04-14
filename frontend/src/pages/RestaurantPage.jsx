import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiErrorMessage, restaurantAPI, menuAPI } from '../api'
import useCartStore from '../store/useCartStore'
import useAuthStore from '../store/useAuthStore'

const CATEGORIES = [
  { value: null,           label: '🍽 All' },
  { value: 'STARTER',     label: '🥗 Starters' },
  { value: 'MAIN_COURSE', label: '🍛 Main Course' },
  { value: 'RICE',        label: '🍚 Rice' },
  { value: 'CHINESE',     label: '🥡 Chinese' },
  { value: 'SNACKS',      label: '🍟 Snacks' },
  { value: 'BEVERAGES',   label: '🥤 Beverages' },
  { value: 'ADD_ONS',     label: '➕ Add Ons' },
]

const MENU_PAGE_SIZE = 8

export default function RestaurantPage() {
  const { id }            = useParams()
  const { user }          = useAuthStore()
  const { addItem, items, updateQuantity, removeItem } = useCartStore()
  const [restaurant, setRestaurant] = useState(null)
  const [branches, setBranches]     = useState([])
  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [menuItems, setMenuItems]   = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [menuPage, setMenuPage]     = useState(0)
  const [vegOnly, setVegOnly]       = useState(false)
  const [loading, setLoading]       = useState(true)
  const [menuLoading, setMenuLoading] = useState(false)

  const selectedBranch = branches.find((b) => String(b.id) === String(selectedBranchId)) || null

  const resolvedRating = Number(restaurant?.avgRating ?? restaurant?.averageRating)
  const hasRating = Number.isFinite(resolvedRating) && resolvedRating > 0
  const ratingLabel = hasRating ? resolvedRating.toFixed(1) : 'New'

  useEffect(() => {
    Promise.all([restaurantAPI.getById(id), restaurantAPI.getBranches(id)])
      .then(([rRes, bRes]) => {
        setRestaurant(rRes.data.data)
        const branchList = bRes.data.data || []
        setBranches(branchList)
        setSelectedBranchId(branchList[0]?.id ? String(branchList[0].id) : '')
      })
      .catch((err) => toast.error(apiErrorMessage(err, 'Failed to load menu')))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    let ignore = false
    const fetchAllMenuItems = async () => {
      setMenuLoading(true)
      try {
        const size = 100
        let page = 0
        let totalPages = 1
        const collected = []

        while (page < totalPages) {
          const res = await menuAPI.getMenu(id, selectedBranchId || null, page, size)
          const payload = res.data.data || {}
          collected.push(...(payload.content || []))
          totalPages = Number(payload.totalPages || 0)
          page += 1
        }

        if (!ignore) {
          setMenuItems(collected)
        }
      } catch (err) {
        if (!ignore) {
          toast.error(apiErrorMessage(err, 'Failed to load menu'))
        }
      } finally {
        if (!ignore) {
          setMenuLoading(false)
        }
      }
    }

    fetchAllMenuItems()

    return () => {
      ignore = true
    }
  }, [id, selectedBranchId])

  useEffect(() => {
    setMenuPage(0)
  }, [activeCategory, selectedBranchId])

  const categoryFiltered = activeCategory
    ? menuItems.filter((m) => m.category === activeCategory)
    : menuItems
  const filtered = vegOnly ? categoryFiltered.filter((m) => m.veg) : categoryFiltered
  const menuTotalItems = filtered.length
  const menuTotalPages = Math.ceil(menuTotalItems / MENU_PAGE_SIZE)
  const currentPage = Math.min(menuPage, Math.max(menuTotalPages - 1, 0))
  const pagedItems = filtered.slice(currentPage * MENU_PAGE_SIZE, (currentPage + 1) * MENU_PAGE_SIZE)

  useEffect(() => {
    if (menuPage !== currentPage) {
      setMenuPage(currentPage)
    }
  }, [currentPage, menuPage])

  const getQty    = (itemId) => items.find((i) => i.id === itemId)?.quantity || 0
  const handleAdd = (item) => {
    if (!user) { toast.error('Please sign in to add items'); return }
    if (user.role === 'ADMIN') { toast.error('Admins cannot place orders'); return }
    addItem(item, Number(id), restaurant?.name, selectedBranch?.id || null, selectedBranch?.branchName || '')
    toast.success(`${item.name} added!`)
  }

  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Loading menu...</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Restaurant header */}
      <div className="relative py-12" style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', color: '#fff', minHeight: 220 }}>
        {restaurant?.imageUrl && (
          <img src={restaurant.imageUrl} alt={restaurant.name}
            className="absolute inset-0 w-full h-full object-cover opacity-15" />
        )}
        <div className="max-w-7xl mx-auto px-4 relative">
          <h1 className="font-display font-bold mb-2" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)' }}>
            {restaurant?.name}
          </h1>
          {restaurant?.description && (
            <p className="mb-3 max-w-xl" style={{ color: 'rgba(255,255,255,0.75)' }}>{restaurant.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <span><i className="bi bi-star-fill text-brand mr-1" />{ratingLabel}</span>
            {(restaurant?.area || restaurant?.city) && (
              <span><i className="bi bi-geo-alt text-brand mr-1" />{[restaurant.area, restaurant.city].filter(Boolean).join(', ')}</span>
            )}
            {restaurant?.openingHours && (
              <span><i className="bi bi-clock text-brand mr-1" />{restaurant.openingHours}</span>
            )}
            {restaurant?.contactPhone && (
              <span><i className="bi bi-telephone text-brand mr-1" />{restaurant.contactPhone}</span>
            )}
          </div>
          {branches.length > 0 && (
            <div className="mt-6 max-w-5xl">
              <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.75)' }}>Choose a branch before ordering</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
                {branches.map((branch) => {
                  const isActive = String(selectedBranchId) === String(branch.id)
                  return (
                    <button
                      key={branch.id}
                      onClick={() => setSelectedBranchId(String(branch.id))}
                      className={`text-left rounded-2xl border p-4 transition-all ${isActive ? 'border-brand bg-white/10 shadow-lg' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                      style={{ color: '#fff' }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h6 className="font-bold mb-1">{branch.branchName}</h6>
                          <p className="text-sm mb-0" style={{ color: 'rgba(255,255,255,0.72)' }}>{branch.area}, {branch.city}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isActive ? 'bg-brand text-white' : 'bg-white/10 text-white'}`}>
                          {isActive ? 'Selected' : 'Select'}
                        </span>
                      </div>
                      {branch.openingHours && (
                        <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.78)' }}>
                          <i className="bi bi-clock text-brand mr-1" /> {branch.openingHours}
                        </p>
                      )}
                      {branch.contactPhone && (
                        <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.78)' }}>
                          <i className="bi bi-telephone text-brand mr-1" /> {branch.contactPhone}
                        </p>
                      )}
                      {branch.deliveryCoverage && (
                        <p className="text-sm mb-0" style={{ color: 'rgba(255,255,255,0.78)' }}>
                          <i className="bi bi-truck text-brand mr-1" /> {branch.deliveryCoverage}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
              {selectedBranch && (
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4" style={{ color: '#fff' }}>
                  <div className="flex flex-wrap items-center gap-3 justify-between mb-2">
                    <h6 className="font-bold mb-0">{selectedBranch.branchName}</h6>
                    <span className="text-xs px-2 py-1 rounded-full bg-brand text-white font-semibold">Ordering from this branch</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>Hours</p>
                      <p className="mb-0 font-semibold">{selectedBranch.openingHours || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>Contact</p>
                      <p className="mb-0 font-semibold">{selectedBranch.contactPhone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>Delivery Coverage</p>
                      <p className="mb-0 font-semibold">{selectedBranch.deliveryCoverage || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky category bar */}
      <div className="bg-white border-b sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat) => (
              <button key={String(cat.value)} onClick={() => { setActiveCategory(cat.value); setMenuPage(0) }}
                className={`cat-pill ${activeCategory === cat.value ? 'active' : ''}`}>
                {cat.label}
              </button>
            ))}
            <div className="pl-2 border-l flex items-center shrink-0">
              <button onClick={() => setVegOnly(!vegOnly)}
                className={`cat-pill flex items-center gap-1 ${vegOnly ? 'active' : ''}`}>
                <i className="bi bi-leaf" /> Veg Only
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 flex-1 w-full">
        {menuLoading && (
          <div className="text-center mb-4">
            <div className="inline-block w-7 h-7 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!menuLoading && menuTotalItems > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            Showing page {currentPage + 1} of {Math.max(menuTotalPages, 1)} • {menuTotalItems} items
          </p>
        )}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <i className="bi bi-basket text-gray-400" style={{ fontSize: '3rem' }} />
            <p className="text-gray-500 mt-3 font-medium">No items in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pagedItems.map((item) => (
              <MenuCard key={item.id} item={item} qty={getQty(item.id)} onAdd={handleAdd}
                onInc={() => handleAdd(item)}
                onDec={() => getQty(item.id) === 1 ? removeItem(item.id) : updateQuantity(item.id, getQty(item.id) - 1)} />
            ))}
          </div>
        )}

        {menuTotalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setMenuPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
              className="px-3 py-1.5 rounded-xl border border-gray-300 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage + 1} / {menuTotalPages}
            </span>
            <button
              onClick={() => setMenuPage((prev) => Math.min(prev + 1, menuTotalPages - 1))}
              disabled={currentPage >= menuTotalPages - 1}
              className="px-3 py-1.5 rounded-xl border border-gray-300 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Footer restaurant={restaurant} />
    </div>
  )
}

function MenuCard({ item, qty, onAdd, onInc, onDec }) {
  return (
    <div className="snap-card menu-card h-full flex flex-col">
      <div className="relative overflow-hidden rounded-t-2xl" style={{ height: 170, background: '#fff4ee' }}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`veg-dot ${item.veg ? 'veg' : 'nonveg'}`}><span className="inner" /></span>
        </div>
        {item.spiceLevel && item.spiceLevel !== 'MILD' && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-lg">
            <i className="bi bi-fire mr-1" />{item.spiceLevel}
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <div className="flex-1">
          <span className="text-brand font-semibold" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {item.categoryLabel}
          </span>
          {!item.shared && item.branchName && (
            <p className="text-xs text-gray-500 mb-1">Branch special: {item.branchName}</p>
          )}
          <h6 className="font-bold mb-1 mt-1">{item.name}</h6>
          {item.description && (
            <p className="text-gray-500 text-sm mb-0"
              style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {item.description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-lg">₹{item.price}</span>
          {qty > 0 ? (
            <div className="qty-ctrl">
              <button onClick={onDec}><i className="bi bi-dash" /></button>
              <span>{qty}</span>
              <button onClick={onInc}><i className="bi bi-plus" /></button>
            </div>
          ) : (
            <button onClick={() => onAdd(item)} className="btn-brand text-sm py-1.5 px-3 gap-1">
              <i className="bi bi-plus" /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
