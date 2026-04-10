import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { apiErrorMessage, authAPI } from '../api'

export function ForgotPage() {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
      toast.success('Reset link sent!')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to send reset link'))
    } finally { setLoading(false) }
  }

  return (
    <AuthCard title="Forgot Password?" subtitle="We'll send a reset link to your email">
      {sent ? (
        <div className="text-center py-4">
          <i className="bi bi-envelope-check text-green-500" style={{ fontSize: '3rem' }} />
          <h6 className="font-bold mt-3 mb-2">Check your inbox!</h6>
          <p className="text-gray-500 text-sm mb-4">Reset link sent to <strong>{email}</strong>. Expires in 1 hour.</p>
          <Link to="/login" className="btn-brand px-6">Back to Sign In</Link>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="mb-4">
            <label className="form-label">Email Address</label>
            <div className="input-wrap">
              <span className="input-icon"><i className="bi bi-envelope" /></span>
              <input type="email" className="form-input" value={email}
                onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
          </div>
          <button type="submit" className="btn-brand w-full py-2.5 justify-center" disabled={loading}>
            {loading ? <><span className="spinner mr-2" />Sending...</> : 'Send Reset Link'}
          </button>
          <div className="text-center mt-3">
            <Link to="/login" className="text-sm text-gray-500">
              <i className="bi bi-arrow-left mr-1" />Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  )
}

export function ResetPage() {
  const [searchParams]       = useSearchParams()
  const navigate             = useNavigate()
  const token                = searchParams.get('token') || ''
  const [form, setForm]      = useState({ newPassword: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]  = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await authAPI.resetPassword({ token, newPassword: form.newPassword })
      toast.success('Password reset! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Reset failed. Link may have expired.'))
    } finally { setLoading(false) }
  }

  return (
    <AuthCard title="Set New Password" subtitle="Choose a strong password for your account">
      {!token ? (
        <div className="text-center py-4">
          <p className="text-red-500 mb-3">Invalid or missing reset token.</p>
          <Link to="/forgot-password" className="btn-brand px-6">Request New Link</Link>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="mb-4">
            <label className="form-label">New Password</label>
            <div className="input-wrap">
              <span className="input-icon"><i className="bi bi-lock" /></span>
              <input type={showPass ? 'text' : 'password'} className="form-input"
                value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                required minLength={8} placeholder="Min. 8 characters" />
              <button type="button" className="input-icon-end" onClick={() => setShowPass(!showPass)}>
                <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} />
              </button>
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrap">
              <span className="input-icon"><i className="bi bi-lock-fill" /></span>
              <input type={showPass ? 'text' : 'password'} className="form-input"
                value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required placeholder="Repeat password" />
            </div>
          </div>
          <button type="submit" className="btn-brand w-full py-2.5 justify-center" disabled={loading}>
            {loading ? <><span className="spinner mr-2" />Resetting...</> : 'Reset Password'}
          </button>
        </form>
      )}
    </AuthCard>
  )
}

function AuthCard({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg,#fff4ee,#fff,#fff4ee)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="snap-logo text-3xl">Snap<span>Eat</span></Link>
          <h5 className="font-bold mt-3 mb-1">{title}</h5>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>
        <div className="snap-card p-6">{children}</div>
      </div>
    </div>
  )
}

export default ForgotPage
