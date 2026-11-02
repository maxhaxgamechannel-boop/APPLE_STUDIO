import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  add: (item: Omit<CartItem, 'key' | 'qty'>, qty?: number) => void
  remove: (key: string) => void
  setQty: (key: string, qty: number) => void
  clear: () => void
}

const makeKey = (slug: string, color: string, options: string[]) => [slug, color, ...options].join('|')

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((state) => {
          const key = makeKey(item.slug, item.color, item.options)
          const existing = state.items.find((i) => i.key === key)
          if (existing) {
            return {
              items: state.items.map((i) => (i.key === key ? { ...i, qty: Math.min(10, i.qty + qty) } : i)),
            }
          }
          return { items: [...state.items, { ...item, key, qty }] }
        }),
      remove: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      setQty: (key, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.key !== key)
              : state.items.map((i) => (i.key === key ? { ...i, qty: Math.min(10, qty) } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'apple-studio-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export const cartCount = (items: CartItem[]) => items.reduce((s, i) => s + i.qty, 0)
export const cartTotal = (items: CartItem[]) => items.reduce((s, i) => s + i.qty * i.price, 0)
