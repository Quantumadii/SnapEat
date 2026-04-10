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
  getAll:  (page = 0, size = 10) => api.get('/restaurants', { params: { page, size } }),
  getAllPaginated: (page = 0, size = 10) => api.get('/restaurants', { params: { page, size } }),
  getById: (id) => api.get(`/restaurants/${id}`),
  getBranches: (restaurantId) => api.get(`/restaurants/${restaurantId}/branches`),
  getStats: ()  => api.get('/restaurants/stats'),
}

export const menuAPI = {
  getMenu: (restaurantId, branchId, page = 0, size = 8) =>
    api.get(`/restaurants/${restaurantId}/menu`, {
      params: {
        ...(branchId ? { branchId } : {}),
        page,
        size,
      },
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
  getMyOrders: (page = 0, size = 10) => api.get('/orders/my', { params: { page, size } }),
  getById:     (id)   => api.get(`/orders/${id}`),
  cancelOrder: (id)   => api.patch(`/orders/${id}`),
}

export const ratingAPI = {
  add: (data) => api.post('/ratings/add', data),
}

export const contactAPI = {
  submit: (data) => api.post('/contact', data),
}

export const adminAPI = {
  getRestaurant:    (id)             => api.get(`/admin/restaurants/${id}`),
  updateRestaurant: (id, data)        => api.put(`/admin/restaurants/${id}`, data),
  getBranches:      (restaurantId)    => api.get(`/admin/restaurants/${restaurantId}/branches`),
  createBranch:     (restaurantId, data) => api.post(`/admin/restaurants/${restaurantId}/branches`, data),
  updateBranch:     (branchId, data)   => api.put(`/admin/branches/${branchId}`, data),
  deleteBranch:     (branchId)         => api.delete(`/admin/branches/${branchId}`),
  getAdminMenu:     (restaurantId, page = 0, size = 10) =>
    api.get(`/admin/restaurants/${restaurantId}/menu`, { params: { page, size } }),
  createMenuItem:   (restaurantId, data) => api.post(`/admin/restaurants/${restaurantId}/menu`, data),
  updateMenuItem:   (itemId, data)    => api.put(`/admin/menu/item/${itemId}`, data),
  deleteMenuItem:   (itemId)          => api.delete(`/admin/menu/item/${itemId}`),
  toggleMenuItem:   (itemId)          => api.patch(`/admin/menu/item/${itemId}`),
  getOrders:        (restaurantId, status, page = 0, size = 10) =>
    api.get(`/admin/restaurants/${restaurantId}/orders`, { params: status ? { status, page, size } : { page, size } }),
  updateOrderStatus:(orderId, status) => api.patch(`/admin/orders/${orderId}/status`, { status }),
  getDashboard:     (restaurantId)    => api.get(`/admin/restaurants/${restaurantId}/dashboard`),
}
