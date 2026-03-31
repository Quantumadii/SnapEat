import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiErrorMessage, restaurantAPI } from '../api'

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([])
  const [search, setSearch]           = useState('')
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    restaurantAPI.getAll()
      .then((r) => setRestaurants(r.data.data || []))
      .catch((err) => toast.error(apiErrorMessage(err, 'Failed to load restaurants')))
      .finally(() => setLoading(false))
  }, [])

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.area?.toLowerCase().includes(search.toLowerCase()) ||
    r.city?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <section className="hero-section py-10">
        <div className="max-w-7xl mx-auto px-4 relative py-8">
          <div className="text-center text-white max-w-2xl mx-auto">
            <span className="inline-flex items-center px-4 py-2 rounded-full mb-4 text-sm"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <i className="bi bi-lightning-fill text-brand mr-1" />
              Fast delivery · Fresh food · Easy ordering
            </span>
            <h1 className="font-display font-bold mb-4" style={{ fontSize: 'clamp(2.4rem,5vw,3.8rem)', lineHeight: 1.15 }}>
              Delicious food,<br />
              <span className="text-brand">delivered fast</span>
            </h1>
            <p className="text-lg mb-6" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Order from your favourite restaurant and track your meal in real time.
            </p>

            <div className="flex bg-white rounded-xl p-2 shadow-xl max-w-lg mx-auto">
              <i className="bi bi-search  text-gray-400 mx-2 self-center" />
              <input
                type="text"
                className="flex-1 border-none outline-none text-sm bg-transparent text-gray-800 placeholder:text-gray-400"
                placeholder="Search restaurants or areas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn-brand px-5 py-2 text-sm rounded-lg">Search</button>
            </div>
          </div>
        </div>
        <div style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 48L1440 48L1440 16C1200 48 960 0 720 16C480 32 240 0 0 16Z" fill="#fafafa" />
          </svg>
        </div>
      </section>

      <section className="bg-white border-b py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-6">
            {[
              { icon: 'bi-lightning-fill', label: 'Fast Delivery',  desc: 'Hot food at your door' },
              { icon: 'bi-stars',          label: 'Fresh & Tasty',  desc: 'Made fresh every order' },
              { icon: 'bi-shield-check',   label: 'Safe & Secure',  desc: 'Secure Payment' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-brand-light">
                  <i className={`bi ${f.icon} text-brand`} />
                </div>
                <div className="hidden sm:block">
                  <p className="font-semibold mb-0 text-sm">{f.label}</p>
                  <p className="text-gray-500 mb-0" style={{ fontSize: '0.78rem' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 flex-1">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-brand font-semibold text-xs uppercase mb-1 tracking-wider">Order Now</p>
              <h2 className="font-display font-bold mb-0">Restaurants Near You</h2>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map((i) => (
                <div key={i} className="snap-card animate-pulse" style={{ height: 300 }}>
                  <div className="bg-gray-200 rounded-t-2xl" style={{ height: 180 }} />
                  <div className="p-4">
                    <div className="bg-gray-200 rounded h-4 w-3/4 mb-2" />
                    <div className="bg-gray-200 rounded h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <i className="bi bi-search text-gray-400" style={{ fontSize: '3rem' }} />
              <h5 className="mt-3 text-gray-500">No restaurants found</h5>
              <p className="text-gray-400">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((r, idx) => (
                <div key={r.id} className="fade-up" style={{ animationDelay: `${idx * 0.06}s` }}>
                  <RestaurantCard restaurant={r} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer restaurant={restaurants[0]} />
    </div>
  )
}

function RestaurantCard({ restaurant: r }) {
  const resolvedRating = Number(r?.avgRating ?? r?.averageRating)
  const hasRating = Number.isFinite(resolvedRating) && resolvedRating > 0
  const ratingLabel = hasRating ? resolvedRating.toFixed(1) : 'New'

  console.log(r.name, r.avgRating, r.averageRating);

  return (
    <Link to={`/restaurant/${r.id}`} className="no-underline">
      <div className="snap-card menu-card h-full rounded-3xl border border-white overflow-hidden">
        <div className="relative overflow-hidden rounded-t-3xl" style={{ height: 190 }}>
          {r.imageUrl ? (
            <>
              <img src={r.imageUrl} alt={r.name} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'blur(8px)', zIndex: 0 }} />
              <img src={r.imageUrl} alt={r.name} className="relative w-full h-full object-contain transition-transform duration-300 hover:scale-100" style={{ zIndex: 1 }} />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#fff4ee,#ffe4d0)' }}>
              <i className="bi bi-shop text-brand" style={{ fontSize: '3rem', opacity: 0.4 }} />
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.25),transparent)', zIndex: 2 }} />
          {r.openingHours && (
            <span className="absolute top-2 right-2 bg-white text-gray-800 text-xs font-semibold px-2 py-1 rounded-lg">
              <i className="bi bi-clock mr-1" />{r.openingHours}
            </span>
          )}
        </div>
        <div className="p-3">
          <div className="flex justify-between items-start mb-1">
            <h6 className="font-display font-bold mb-0 text-gray-900">{r.name}</h6>
            <span className="text-xs font-semibold ml-2 px-2 py-0.5 rounded-full shrink-0" style={{ background: '#fef9c3', color: '#a16207' }}>
              <i className="bi bi-star-fill mr-1" style={{ fontSize: '0.7rem' }} />{ratingLabel}
            </span>
          </div>
          {r.description && (
            <p className="text-gray-500 text-sm mb-2" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {r.description}
            </p>
          )}
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              <i className="bi bi-geo-alt text-brand mr-1" />
              {[r.area, r.city].filter(Boolean).join(', ')}
            </span>
            <span className="text-sm font-semibold text-brand">
              Order Now <i className="bi bi-arrow-right" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
