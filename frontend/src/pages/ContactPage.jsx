import { useState } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiErrorMessage, contactAPI } from '../api'

const CONTACT_INFO = [
  { icon: 'bi-envelope-fill', label: 'Email', value: 'snapeatroos@gmail.com', href: 'mailto:snapeatroos@gmail.com' },
  { icon: 'bi-telephone-fill', label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
  { icon: 'bi-geo-alt-fill', label: 'Location', value: 'Pune, Maharashtra, India', href: null },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await contactAPI.submit(form)
      toast.success("Message sent! We'll get back to you soon.")
      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to send message'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <section className="hero-section py-10">
        <div className="max-w-7xl mx-auto px-4 relative text-center text-white py-8">
          <h1 className="font-display font-bold mb-3" style={{ fontSize: 'clamp(2.2rem,5vw,3.5rem)' }}>
            Contact <span className="text-brand">Us</span>
          </h1>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.75)' }}>
            We'd love to hear from you. Drop us a message!
          </p>
        </div>
        <div style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 48L1440 48L1440 16C1200 48 960 0 720 16C480 32 240 0 0 16Z" fill="#fafafa" />
          </svg>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            <div>
              <h4 className="font-bold mb-2">Get in touch</h4>
              <p className="text-gray-500 text-sm mb-6" style={{ lineHeight: 1.7 }}>
                Have a question, feedback, or want to list your restaurant? We're here to help.
              </p>
              <div className="space-y-4">
                {CONTACT_INFO.map((c) => (
                  <div key={c.label} className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-brand-light flex items-center justify-center flex-shrink-0">
                      <i className={`bi ${c.icon} text-brand`} />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0">{c.label}</p>
                      {c.href ? (
                        <a href={c.href} className="font-semibold text-sm text-gray-800 no-underline">{c.value}</a>
                      ) : (
                        <p className="font-semibold text-sm mb-0">{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="snap-card p-6">
                {sent ? (
                  <div className="text-center py-10">
                    <i className="bi bi-send-check-fill text-green-500" style={{ fontSize: '3.5rem' }} />
                    <h5 className="font-bold mt-3 mb-2">Message Sent!</h5>
                    <p className="text-gray-500 mb-0">We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={submit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="form-label">Your Name</label>
                        <input name="name" className="form-input" value={form.name}
                          onChange={handle} required placeholder="Enter Your Name" />
                      </div>
                      <div>
                        <label className="form-label">Email Address</label>
                        <input name="email" type="email" className="form-input" value={form.email}
                          onChange={handle} required placeholder="Enter Your Email" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="form-label">Subject</label>
                      <input name="subject" className="form-input" value={form.subject}
                        onChange={handle} required placeholder="How can we help?" />
                    </div>
                    <div className="mb-6">
                      <label className="form-label">Message</label>
                      <textarea name="message" className="form-textarea" rows={5}
                        value={form.message} onChange={handle} required
                        placeholder="Write your message here..." />
                    </div>
                    <button type="submit" className="btn-brand px-6 py-2.5 gap-2" disabled={sending}>
                      {sending
                        ? <><span className="spinner" /> Sending...</>
                        : <><i className="bi bi-send-fill" /> Send Message</>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
