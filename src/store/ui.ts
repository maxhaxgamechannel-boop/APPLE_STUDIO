import { create } from 'zustand'

export interface FlyingItem {
  id: number
  x: number
  y: number
  color: string
}

interface UIState {
  cartOpen: boolean
  searchOpen: boolean
  menuOpen: boolean
  flying: FlyingItem[]
  cartPulse: number
  /** Заставка уже показана — можно запускать hero-анимацию */
  introDone: boolean
  /** 3D отключено: WebGL-контекст потерян или сцена упала — показываем векторные иллюстрации */
  webglFailed: boolean
  setWebglFailed: (v: boolean) => void
  setIntroDone: (v: boolean) => void
  setCartOpen: (v: boolean) => void
  setSearchOpen: (v: boolean) => void
  setMenuOpen: (v: boolean) => void
  /** Запускает анимацию «полёта» товара к иконке корзины */
  flyToCart: (x: number, y: number, color: string) => void
  landFlying: (id: number) => void
}

let flyId = 0

export const useUI = create<UIState>()((set) => ({
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  flying: [],
  cartPulse: 0,
  introDone: false,
  webglFailed: false,
  setWebglFailed: (webglFailed) => set({ webglFailed }),
  setIntroDone: (introDone) => set({ introDone }),
  setCartOpen: (cartOpen) => set({ cartOpen, searchOpen: false, menuOpen: false }),
  setSearchOpen: (searchOpen) => set({ searchOpen, cartOpen: false, menuOpen: false }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  flyToCart: (x, y, color) => set((s) => ({ flying: [...s.flying, { id: ++flyId, x, y, color }] })),
  landFlying: (id) => set((s) => ({ flying: s.flying.filter((f) => f.id !== id), cartPulse: s.cartPulse + 1 })),
}))
