import { Link } from 'react-router-dom'

export default function Footer({ restaurant }) {
  const { instagramUrl, contactEmail, contactPhone } = restaurant || {}

  return (
    <footer className="snap-footer mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="snap-logo text-2xl mb-3">
              <span style={{ color: '#ff6b35' }}>SnapEat</span>
            </div>
            <p className="text-sm mb-3" style={{ color: '#888', lineHeight: 1.7 }}>
              Your favourite restaurant, now online. Order fresh, hot food delivered right to your door.
            </p>
          </div>
          <div>
            <p className="footer-title mb-3">Quick Links</p>
            <ul className="list-none p-0 m-0 space-y-1">
              {[
                { to: '/',        label: 'Home' },
                { to: '/about',   label: 'About Us' },
                { to: '/help',    label: 'Help & FAQ' },
                { to: '/contact', label: 'Contact Us' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer-title mb-3">Get in Touch</p>
            <ul className="list-none p-0 m-0 space-y-3">
              {contactEmail && (
                <li>
                  <a href={`mailto:${contactEmail}`} className="text-sm flex items-center gap-2">
                    <i className="bi bi-envelope text-brand" />{contactEmail}
                  </a>
                </li>
              )}
              {contactPhone && (
                <li>
                  <a href={`tel:${contactPhone}`} className="text-sm flex items-center gap-2">
                    <i className="bi bi-telephone text-brand" />{contactPhone}
                  </a>
                </li>
              )}
              {instagramUrl && (
                <li>
                  <a
                    href={instagramUrl.startsWith('http') ? instagramUrl : `https://instagram.com/${instagramUrl.replace('@','')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-sm flex items-center gap-2"
                  >
                    <i className="bi bi-instagram" style={{ color: '#e1306c' }} />
                    {instagramUrl.startsWith('http') ? 'Instagram' : instagramUrl}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <hr style={{ borderColor: '#333', marginTop: '2rem' }} />
        <div className="flex flex-wrap justify-between items-center gap-2 mt-4">
          <p className="text-sm mb-0" style={{ color: '#666' }}>
            © {new Date().getFullYear()} SnapEat. All rights reserved.
          </p>
          <p className="text-sm mb-0" style={{ color: '#666' }}>
            Made with <i className="bi bi-heart-fill text-brand" /> for food lovers
          </p>
        </div>
      </div>
    </footer>
  )
}
