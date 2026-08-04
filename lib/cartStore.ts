import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Safe localStorage that won't crash in-app browsers (Zalo, FB, etc.)
const safeStorage = {
  getItem: (name: string) => {
    try { return localStorage.getItem(name) } catch { return null }
  },
  setItem: (name: string, value: string) => {
    try { localStorage.setItem(name, value) } catch {}
  },
  removeItem: (name: string) => {
    try { localStorage.removeItem(name) } catch {}
  },
}

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

export interface AppliedPromo {
  code: string
  discount: number
}

interface CartStore {
  items: CartItem[]
  appliedPromo: AppliedPromo | null
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setAppliedPromo: (promo: AppliedPromo | null) => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedPromo: null,

      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(item => item.id === newItem.id)
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
            }
          }
          return { items: [...state.items, newItem] }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id),
        }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [], appliedPromo: null })
      },

      setAppliedPromo: (promo) => {
        set({ appliedPromo: promo })
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
    }),
    {
      name: 'banhbao-cart-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
)
