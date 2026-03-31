import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const requestUrl = String(err.config?.url || '')
      const isAuthLoginRequest = requestUrl.includes('/auth/login')

      if (isAuthLoginRequest) {
        return Promise.reject(err)
      }

      const redirectToHomeAfterLogout = sessionStorage.getItem('postLogoutRedirect') === '1'
      sessionStorage.removeItem('postLogoutRedirect')
      localStorage.clear()
      window.location.href = redirectToHomeAfterLogout ? '/' : '/login'
    }
    return Promise.reject(err)
  }
)

export default api
