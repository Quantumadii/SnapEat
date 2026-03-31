import api from './axios'

export const apiErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  if (!err || !err.response) {
    return 'Server is down. Please try again later.'
  }
  return err.response?.data?.message || fallback
}

export const authAPI = {
  register:       (data)  => api.post('/auth/register', data),
  sendRegisterOtp: (data) => api.post('/auth/register/send-otp', data),
  verifyRegisterOtp: (data) => api.post('/auth/register/verify-otp', data),
  login:          (data)  => api.post('/auth/login', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (data)  => api.post('/auth/reset-password', data),
  changePassword: (data)  => api.post('/auth/change-password', data),
  deleteAccount:  ()      => api.delete('/auth/delete'),
}

export const restaurantAPI = {
  getAll:  ()   => api.get('/restaurants'),
  getById: (id) => api.get(`/restaurants/${id}`),
  getStats: ()  => api.get('/restaurants/stats'),
}

export const menuAPI = {
  getMenu: (restaurantId, category) =>
    api.get(`/menu/restaurant/${restaurantId}`, {
      params: category ? { category } : {},
    }),
}

export const paymentAPI = {
  getConfig:    () => api.get('/payments/config'),
  createIntent: (data) => api.post('/payments/create-intent', data),
  verifyPayment: (paymentIntentId) => api.post(`/payments/verify/${paymentIntentId}`),
  createCheckoutSession: (data) => api.post('/payments/create-checkout-session', data),
  verifyCheckoutSession: (sessionId) => api.post(`/payments/verify-session/${sessionId}`),
}

export const orderAPI = {
  placeOrder:  (data) => api.post('/orders', data),
  getMyOrders: ()     => api.get('/orders/my'),
  getById:     (id)   => api.get(`/orders/${id}`),
  cancelOrder: (id)   => api.post(`/orders/${id}/cancel`),
}

export const ratingAPI = {
  add: (data) => api.post('/ratings/add', data),
}

export const contactAPI = {
  submit: (data) => api.post('/contact', data),
}

export const adminAPI = {
  getRestaurant:    (id)             => api.get(`/admin/restaurant/${id}`),
  updateRestaurant: (id, data)        => api.put(`/admin/restaurant/${id}`, data),
  getAdminMenu:     (restaurantId) => api.get(`/admin/menu/${restaurantId}`),
  createMenuItem:   (restaurantId, data) => api.post(`/admin/menu/${restaurantId}`, data),
  updateMenuItem:   (itemId, data)    => api.put(`/admin/menu/item/${itemId}`, data),
  deleteMenuItem:   (itemId)          => api.delete(`/admin/menu/item/${itemId}`),
  toggleMenuItem:   (itemId)          => api.patch(`/admin/menu/item/${itemId}/toggle`),
  getOrders:        (restaurantId, status) =>
    api.get(`/admin/orders/${restaurantId}`, { params: status ? { status } : {} }),
  updateOrderStatus:(orderId, status) => api.patch(`/admin/orders/${orderId}/status`, { status }),
  getDashboard:     (restaurantId)    => api.get(`/admin/dashboard/${restaurantId}`),
}
