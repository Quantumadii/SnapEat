import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  items:          [],
  restaurantId:   null,
  restaurantName: '',
  branchId:       null,
  branchName:     '',

  addItem: (item, restaurantId, restaurantName, branchId = null, branchName = '') => {
    const { items, restaurantId: cur } = get()
    if (cur && cur !== restaurantId) {
      set({ items: [{ ...item, quantity: 1 }], restaurantId, restaurantName, branchId, branchName })
      return
    }
    const existing = items.find((i) => i.id === item.id)
    if (existing) {
      set({ items: items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) })
    } else {
      set({ items: [...items, { ...item, quantity: 1 }], restaurantId, restaurantName, branchId, branchName })
    }
  },

  removeItem: (itemId) => {
    const filtered = get().items.filter((i) => i.id !== itemId)
    set({
      items: filtered,
      restaurantId: filtered.length ? get().restaurantId : null,
      branchId: filtered.length ? get().branchId : null,
      branchName: filtered.length ? get().branchName : '',
    })
  },

  updateQuantity: (itemId, qty) => {
    if (qty < 1) { get().removeItem(itemId); return }
    set({ items: get().items.map((i) => i.id === itemId ? { ...i, quantity: qty } : i) })
  },

  clearCart: () => set({ items: [], restaurantId: null, restaurantName: '', branchId: null, branchName: '' }),

  getTotalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
  getTotalPrice: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
}))

export default useCartStore
