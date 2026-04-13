import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { apiErrorMessage, authAPI } from '../api'
import useAuthStore from '../store/useAuthStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [role, setRole]        = useState('CUSTOMER')
  const [step, setStep] = useState('FORM')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]  = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [registrationPayload, setRegistrationPayload] = useState(null)
  const otpRefs = useRef([])
  const [form, setForm] = useState({
    fullName: '', email: '', password: '',
    restaurantName: '', restaurantDescription: '', restaurantAddress: '',
    restaurantArea: '', restaurantCity: '', restaurantPhone: '',
    restaurantInstagram: '', restaurantContactEmail: '', openingHours: '',
  })

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const maskEmail = (email = '') => {
    const [name, domain] = email.split('@')
    if (!name || !domain) return email
    if (name.length <= 2) return `${name[0] || ''}***@${domain}`
    return `${name[0]}${'*'.repeat(Math.max(name.length - 2, 3))}${name[name.length - 1]}@${domain}`
  }

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)

    if (digit && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] || '')
    setOtp(next)
    const focusIndex = Math.min(pasted.length, 5)
    otpRefs.current[focusIndex]?.focus()
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, role }
      await authAPI.sendRegisterOtp(payload)
      setRegistrationPayload(payload)
      setOtp(['', '', '', '', '', ''])
      setStep('OTP')
      toast.success('OTP sent to your email')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Registration failed'))
    } finally { setLoading(false) }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    const otpValue = otp.join('')
    if (otpValue.length !== 6) {
      toast.error('Please enter the 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const res = await authAPI.verifyRegisterOtp({
        email: registrationPayload?.email,
        otp: otpValue,
      })

      const { token, ...user } = res.data.data || {}
      if (!token) {
        toast.success('Email verified. Please sign in.')
        navigate('/login')
        return
      }

      setAuth(user, token)
      toast.success('Account created successfully!')
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'OTP verification failed'))
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    if (!registrationPayload) return
    setLoading(true)
    try {
      await authAPI.sendRegisterOtp(registrationPayload)
      toast.success('A new OTP has been sent')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to resend OTP'))
    } finally {
      setLoading(false)
    }
  }

  const backToForm = () => {
    setStep('FORM')
    setOtp(['', '', '', '', '', ''])
  }

  return (
    <div className="auth-page-shell min-h-screen py-10 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link to="/" className="snap-logo text-3xl">Snap<span>Eat</span></Link>
          <h5 className="auth-page-title font-bold mt-3 mb-1">Create your account</h5>
          <p className="auth-page-subtitle text-sm">Join SnapEat today</p>
        </div>

        <div className="snap-card auth-form-card p-6">
          {step === 'FORM' && (
            <>
          {/* Role tabs */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl bg-gray-100">
            {[['CUSTOMER','🛒 Customer'],['ADMIN','🍽️ Restaurant']].map(([r, label]) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`flex-1 py-2 font-semibold text-sm rounded-lg transition-all border-0 cursor-pointer ${role === r ? 'btn-brand shadow-sm' : 'bg-transparent text-gray-600'}`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={submit}>
            <div className="mb-4">
              <label className="form-label">Full Name</label>
              <div className="input-wrap">
                <span className="input-icon"><i className="bi bi-person" /></span>
                <input name="fullName" className="form-input" value={form.fullName}
                  onChange={handle} required placeholder="Full Name" />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon"><i className="bi bi-envelope" /></span>
                <input name="email" type="email" className="form-input" value={form.email}
                  onChange={handle} required placeholder="you@example.com" />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <span className="input-icon"><i className="bi bi-lock" /></span>
                <input name="password" type={showPass ? 'text' : 'password'} className="form-input"
                  value={form.password} onChange={handle} required minLength={8} placeholder="Min. 8 characters" />
                <button type="button" className="input-icon-end" onClick={() => setShowPass(!showPass)}>
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
            </div>

            {role === 'ADMIN' && (
              <div className="border-t border-gray-100 pt-4 mt-4">
                <p className="font-bold text-sm mb-3">
                  <i className="bi bi-shop text-brand mr-1" />Restaurant Details
                </p>
                <div className="space-y-2">
                  <input name="restaurantName" className="form-input-sm" value={form.restaurantName} onChange={handle} placeholder="Restaurant Name" />
                  <textarea name="restaurantDescription" className="form-textarea" style={{ padding: '6px 12px', fontSize: '0.875rem' }} rows={2}
                    value={form.restaurantDescription} onChange={handle} placeholder="Short description..." />
                  <input name="restaurantAddress" className="form-input-sm" value={form.restaurantAddress} onChange={handle} placeholder="Full Address" />
                  <div className="grid grid-cols-2 gap-2">
                    <input name="restaurantArea" className="form-input-sm" value={form.restaurantArea} onChange={handle} placeholder="Area / Locality *" required={role === 'ADMIN'} />
                    <input name="restaurantCity" className="form-input-sm" value={form.restaurantCity} onChange={handle} placeholder="City *" required={role === 'ADMIN'} />
                  </div>
                  <input name="restaurantPhone" className="form-input-sm" value={form.restaurantPhone} onChange={handle} placeholder="Contact Phone" />
                  <input name="restaurantContactEmail" type="email" className="form-input-sm" value={form.restaurantContactEmail} onChange={handle} placeholder="Restaurant Contact Email" />
                  <input name="restaurantInstagram" className="form-input-sm" value={form.restaurantInstagram} onChange={handle} placeholder="Instagram handle or URL" />
                  <input name="openingHours" className="form-input-sm" value={form.openingHours} onChange={handle} placeholder="Opening Hours e.g. 10AM – 11PM" />
                </div>
              </div>
            )}

            <button type="submit" className="btn-brand w-full py-2.5 mt-4 justify-center" disabled={loading}>
              {loading ? <><span className="spinner mr-2" />Sending OTP...</> : 'Send OTP'}
            </button>
          </form>
            </>
          )}

          {step === 'OTP' && (
            <form onSubmit={verifyOtp}>
              <div className="text-center mb-5">
                <div className="mx-auto mb-3 w-11 h-11 rounded-full bg-orange-100 text-brand flex items-center justify-center text-xl">
                  <i className="bi bi-shield-lock" />
                </div>
                <h6 className="font-bold mb-1">Verify your email</h6>
                <p className="text-sm text-gray-500 mb-0">
                  Enter the 6-digit OTP sent to <span className="font-semibold">{maskEmail(registrationPayload?.email)}</span>
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 mb-4" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:border-brand focus:outline-none"
                    aria-label={`OTP digit ${index + 1}`}
                    required
                  />
                ))}
              </div>

              <button type="submit" className="btn-brand w-full py-2.5 justify-center" disabled={loading}>
                {loading ? <><span className="spinner mr-2" />Verifying...</> : 'Verify & Create Account'}
              </button>

              <div className="flex items-center justify-between mt-4 text-sm">
                <button type="button" onClick={backToForm} className="text-gray-500 hover:text-gray-700 border-0 bg-transparent">
                  Edit details
                </button>
                <button type="button" onClick={resendOtp} className="text-brand font-semibold border-0 bg-transparent" disabled={loading}>
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-4 mb-0">
            Already have an account?{' '}
            <Link to="/login" className="text-brand font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
