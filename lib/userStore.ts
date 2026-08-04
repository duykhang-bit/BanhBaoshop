import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UserInfo {
  id: string
  phone: string
  name: string
  address: string
}

interface UserStore {
  token: string | null
  user: UserInfo | null
  setAuth: (token: string, user: UserInfo) => void
  updateUser: (user: Partial<UserInfo>) => void
  logout: () => void
  isLoggedIn: () => boolean
}

// Safe localStorage that won't crash in-app browsers
const safeStorage = {
  getItem: (name: string) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value)
    } catch {}
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name)
    } catch {}
  },
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setAuth: (token, user) => set({ token, user }),

      updateUser: (partial) => {
        const current = get().user
        if (current) {
          set({ user: { ...current, ...partial } })
        }
      },

      logout: () => set({ token: null, user: null }),

      isLoggedIn: () => !!get().token,
    }),
    {
      name: 'banhbao-user-storage',
      storage: createJSONStorage(() => safeStorage),
    }
  )
)
