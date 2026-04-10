import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiErrorMessage, restaurantAPI } from '../api'

const VALUES = [
  { icon: 'bi-award',        title: 'Quality Food',    desc: 'Every dish crafted with care and the finest ingredients.' },
  { icon: 'bi-lightning',    title: 'Fast & Fresh',    desc: 'From kitchen to your door in the shortest time possible.' },
  { icon: 'bi-heart-fill',   title: 'Made with Love',  desc: 'Passion for food drives everything we do.' },
  { icon: 'bi-people-fill',  title: 'Community First', desc: 'Supporting local restaurants and their communities.' },
]

export default function AboutPage() {
  const [stats, setStats] = useState({
    ordersDelivered: 0,
    restaurantPartners: 0,
    averageRating: null,
  })

  useEffect(() => {
    restaurantAPI.getStats()
      .then((res) => {
        const data = res?.data?.data || {}
        setStats({
          ordersDelivered: Number(data.ordersDelivered) || 0,
          restaurantPartners: Number(data.restaurantPartners) || 0,
          averageRating: typeof data.averageRating === 'number' ? data.averageRating : null,
        })
      })
      .catch((err) => toast.error(apiErrorMessage(err, 'Failed to load platform stats')))
  }, [])

  const avgRatingLabel =
    typeof stats.averageRating === 'number' && Number.isFinite(stats.averageRating)
      ? `${stats.averageRating.toFixed(1)}★`
      : 'New'

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <section className="hero-section py-10">
        <div className="max-w-7xl mx-auto px-4 relative text-center text-white py-8">
          <h1 className="font-display font-bold mb-3" style={{ fontSize: 'clamp(2.2rem,5vw,3.5rem)' }}>
            About <span className="text-brand">SnapEat</span>
          </h1>
          <p className="text-lg mx-auto max-w-xl" style={{ color: 'rgba(255,255,255,0.75)' }}>
            We believe great food should be just a few taps away. SnapEat brings your favourite
            restaurant online so you can enjoy hot, fresh meals without leaving home.
          </p>
        </div>
        <div style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 48L1440 48L1440 16C1200 48 960 0 720 16C480 32 240 0 0 16Z" fill="#fafafa" />
          </svg>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="snap-card p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-brand-light flex items-center justify-center mx-auto mb-3">
                  <i className={`bi ${v.icon} text-brand text-xl`} />
                </div>
                <h6 className="font-bold mb-2">{v.title}</h6>
                <p className="text-gray-500 text-sm mb-0">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#fff4ee]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display font-bold mb-4">Our Story</h2>
            <p className="text-gray-500 mb-3" style={{ lineHeight: 1.8 }}>
              SnapEat was built to help local restaurants go digital and connect with more customers.
              We saw small and mid-sized restaurants struggling to reach customers online, so we built
              a simple, powerful solution.
            </p>
            <p className="text-gray-500 mb-0" style={{ lineHeight: 1.8 }}>
              Today, restaurants on SnapEat manage menus, track orders, and grow their business while
              customers enjoy seamless ordering with real-time updates at every stage.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: stats.ordersDelivered.toLocaleString('en-IN'), label: 'Orders Delivered' },
              { value: stats.restaurantPartners.toLocaleString('en-IN'),  label: 'Restaurant Partners' },
              { value: avgRatingLabel, label: 'Average Rating' },
              { value: '24/7', label: 'Customer Support' },
            ].map((s) => (
              <div key={s.label}>
                <h2 className="font-display font-bold text-brand mb-1">{s.value}</h2>
                <p className="text-gray-500 text-sm mb-0">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
