import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user:  JSON.parse(localStorage.getItem('user')  || 'null'),
  token: localStorage.getItem('token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('user',  JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token })
  },

  logout: () => {
    sessionStorage.setItem('postLogoutRedirect', '1')
    localStorage.clear()
    set({ user: null, token: null })
  },
}))

export default useAuthStore
