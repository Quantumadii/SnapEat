import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authAPI } from '../api'
import useAuthStore from '../store/useAuthStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]  = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      const { token, ...user } = res.data.data
      setAuth(user, token)
      toast.success(`Welcome back, ${user.fullName?.split(' ')[0]}!`)
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg,#fff4ee,#fff,#fff4ee)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="snap-logo text-3xl">Snap<span>Eat</span></Link>
          <h5 className="font-bold mt-3 mb-1">Welcome back</h5>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <div className="snap-card p-6">
          <form onSubmit={submit}>
            <div className="mb-4">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon"><i className="bi bi-envelope" /></span>
                <input name="email" type="email" className="form-input" value={form.email}
                  onChange={handle} required placeholder="you@example.com" />
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="form-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand">Forgot password?</Link>
              </div>
              <div className="input-wrap">
                <span className="input-icon"><i className="bi bi-lock" /></span>
                <input name="password" type={showPass ? 'text' : 'password'} className="form-input"
                  value={form.password} onChange={handle} required placeholder="••••••••" />
                <button type="button" className="input-icon-end" onClick={() => setShowPass(!showPass)}>
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
            </div>
            <button type="submit" className="btn-brand w-full py-2.5 mt-1 justify-center" disabled={loading}>
              {loading ? <><span className="spinner mr-2" />Signing in...</> : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4 mb-0">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand font-semibold">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
