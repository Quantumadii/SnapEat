import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const FAQS = [
  { q: 'How do I place an order?',
    a: 'Browse restaurants on the home page, click on one, add items to your cart, fill in your delivery address and place the order. Simple!' },
  { q: 'What payment methods are accepted?',
    a: 'we support Cash on Delivery (COD) and online payments(stripe), you pay either way.' },
  { q: 'Can I cancel my order?',
    a: 'Yes, you can cancel an order as long as it is in PLACED, CONFIRMED, or PREPARING status. Once it is marked READY, cancellation is not possible.' },
  { q: 'How do I track my order?',
    a: "After placing an order, go to \"My Orders\". You'll see a real-time progress bar — Placed → Confirmed → Preparing → Ready → Delivered. You also get email updates at every stage." },
  { q: 'I forgot my password. What do I do?',
    a: "Click \"Forgot password?\" on the login page, enter your registered email, and we'll send a reset link valid for 1 hour." },
  { q: 'How do I register my restaurant?',
    a: 'On the registration page, select the "Restaurant" tab, fill in your details, and submit. Your dashboard will be ready immediately.' },
  { q: 'Can I update my menu after registering?',
    a: 'Yes! Admin users have a full Menu Management section in their dashboard to add, edit, delete or toggle availability of any item at any time.' },
  { q: 'Will I receive email confirmations?',
    a: 'Yes. You receive an email when your order is placed and at every status update — Preparing, Ready, Delivered, and Cancelled.' },
]

export default function HelpPage() {
  const [open, setOpen] = useState(null)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <section className="hero-section py-10">
        <div className="max-w-7xl mx-auto px-4 relative text-center text-white py-8">
          <h1 className="font-display font-bold mb-3" style={{ fontSize: 'clamp(2.2rem,5vw,3.5rem)' }}>
            Help <span className="text-brand">&amp; FAQ</span>
          </h1>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Everything you need to know about using SnapEat
          </p>
        </div>
        <div style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 48L1440 48L1440 16C1200 48 960 0 720 16C480 32 240 0 0 16Z" fill="#fafafa" />
          </svg>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="max-w-2xl mx-auto px-4">
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="snap-card overflow-hidden">
                <button
                  className="w-full text-left px-5 py-4 font-semibold text-sm flex justify-between items-center border-0 bg-transparent cursor-pointer"
                  style={{ color: open === i ? '#ff6b35' : '#1a1a1a' }}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  {faq.q}
                  <i className={`bi bi-chevron-${open === i ? 'up' : 'down'} text-gray-400 ml-2`} />
                </button>
                {open === i && (
                  <div className="px-5 pb-4 text-gray-500 text-sm" style={{ lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="snap-card p-6 text-center mt-6">
            <i className="bi bi-headset text-brand" style={{ fontSize: '2.5rem' }} />
            <h6 className="font-bold mt-3 mb-2">Still have questions?</h6>
            <p className="text-gray-500 text-sm mb-4">Our team is happy to help you out.</p>
            <Link to="/contact" className="btn-brand px-6">Contact Us</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
