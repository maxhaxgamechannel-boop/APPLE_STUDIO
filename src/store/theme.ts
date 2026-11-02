import { create } from 'zustand'

export type Theme = 'light' | 'dark'
export const THEME_KEY = 'apple-studio-theme'

const readInitial = (): Theme => {
  if (typeof document === 'undefined') return 'light'
  // Класс выставляет inline-скрипт в index.html ещё до отрисовки — без «вспышки»
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function apply(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff')
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* приватный режим — тема просто не сохранится */
  }
}

interface ThemeState {
  theme: Theme
  toggle: () => void
  set: (t: Theme) => void
}

export const useTheme = create<ThemeState>()((set, get) => ({
  theme: readInitial(),
  set: (theme) => {
    if (theme === get().theme) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
    const run = () => {
      apply(theme)
      set({ theme })
    }
    if (!reduced && typeof doc.startViewTransition === 'function') {
      // Современные браузеры: плавное растворение всей страницы
      doc.startViewTransition(run)
    } else if (!reduced) {
      const root = document.documentElement
      root.classList.add('theme-anim')
      run()
      window.setTimeout(() => root.classList.remove('theme-anim'), 600)
    } else {
      run()
    }
  },
  toggle: () => get().set(get().theme === 'dark' ? 'light' : 'dark'),
}))
