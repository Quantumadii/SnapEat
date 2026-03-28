import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { restaurantAPI, menuAPI } from '../api'
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

export default function RestaurantPage() {
  const { id }            = useParams()
  const { user }          = useAuthStore()
  const { addItem, items, updateQuantity, removeItem } = useCartStore()
  const [restaurant, setRestaurant] = useState(null)
  const [menu, setMenu]             = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [vegOnly, setVegOnly]       = useState(false)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([restaurantAPI.getById(id), menuAPI.getMenu(id)])
      .then(([rRes, mRes]) => { setRestaurant(rRes.data.data); setMenu(mRes.data.data || []) })
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    menuAPI.getMenu(id, activeCategory)
      .then((r) => setMenu(r.data.data || []))
      .catch(() => {})
  }, [activeCategory, id])

  const filtered  = vegOnly ? menu.filter((m) => m.veg) : menu
  const getQty    = (itemId) => items.find((i) => i.id === itemId)?.quantity || 0
  const handleAdd = (item) => {
    if (!user) { toast.error('Please sign in to add items'); return }
    if (user.role === 'ADMIN') { toast.error('Admins cannot place orders'); return }
    addItem(item, Number(id), restaurant?.name)
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
        </div>
      </div>

      {/* Sticky category bar */}
      <div className="bg-white border-b sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat) => (
              <button key={String(cat.value)} onClick={() => setActiveCategory(cat.value)}
                className={`cat-pill ${activeCategory === cat.value ? 'active' : ''}`}>
                {cat.label}
              </button>
            ))}
            <div className="ml-auto pl-2 border-l flex items-center flex-shrink-0">
              <button onClick={() => setVegOnly(!vegOnly)}
                className={`cat-pill flex items-center gap-1 ${vegOnly ? 'active' : ''}`}>
                <i className="bi bi-leaf" /> Veg Only
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <i className="bi bi-basket text-gray-400" style={{ fontSize: '3rem' }} />
            <p className="text-gray-500 mt-3 font-medium">No items in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} qty={getQty(item.id)} onAdd={handleAdd}
                onInc={() => handleAdd(item)}
                onDec={() => getQty(item.id) === 1 ? removeItem(item.id) : updateQuantity(item.id, getQty(item.id) - 1)} />
            ))}
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
