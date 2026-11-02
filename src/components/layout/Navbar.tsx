import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { Logo } from '../ui/Logo'
import { ThemeToggle } from '../ui/ThemeToggle'
import { BagIcon, CloseIcon, MenuIcon, SearchIcon } from '../ui/Icons'
import { cartCount, useCart } from '@/store/cart'
import { useUI } from '@/store/ui'
import { cn } from '@/lib/format'

export const NAV_LINKS = [
  { to: '/', label: 'Главная' },
  { to: '/catalog/iphone', label: 'iPhone' },
  { to: '/catalog/ipad', label: 'iPad' },
  { to: '/catalog/mac', label: 'Mac' },
  { to: '/catalog/watch', label: 'Apple Watch' },
  { to: '/catalog/airpods', label: 'AirPods' },
  { to: '/catalog/accessories', label: 'Аксессуары' },
]

export function Navbar() {
  const count = useCart((s) => cartCount(s.items))
  // точечные подписки: шапка не перерисовывается из-за посторонних изменений стора
  const setCartOpen = useUI((s) => s.setCartOpen)
  const setSearchOpen = useUI((s) => s.setSearchOpen)
  const menuOpen = useUI((s) => s.menuOpen)
  const setMenuOpen = useUI((s) => s.setMenuOpen)
  const cartPulse = useUI((s) => s.cartPulse)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const location = useLocation()
  const bag = useAnimationControls()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location.pathname, setMenuOpen])

  useEffect(() => {
    if (cartPulse > 0) bag.start({ scale: [1, 1.35, 0.92, 1.08, 1], rotate: [0, -10, 8, -4, 0], transition: { duration: 0.6 } })
  }, [cartPulse, bag])

  // Горячая клавиша поиска: ⌘K / Ctrl+K и «/»
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background,box-shadow] duration-500',
          scrolled || menuOpen ? 'glass shadow-[0_1px_0_rgba(0,0,0,0.06)]' : 'bg-paper/40 backdrop-blur-md',
        )}
      >
        <nav className="container-x flex h-14 items-center justify-between gap-4" aria-label="Основная навигация">
          <Link to="/" className="shrink-0 transition-opacity hover:opacity-70" aria-label="APPLE STUDIO — на главную">
            <Logo />
          </Link>

          <ul className="hidden items-center gap-0.5 lg:flex" onMouseLeave={() => setHovered(null)}>
            {NAV_LINKS.map((l) => (
              <li key={l.to} onMouseEnter={() => setHovered(l.to)} className="relative">
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    cn('relative z-[1] block px-3.5 py-2 text-[13px] transition-colors duration-300', isActive ? 'text-ink font-medium' : 'text-ink-2 hover:text-ink')
                  }
                >
                  {({ isActive }) => (
                    <>
                      {l.label}
                      {isActive && <motion.span layoutId="nav-active" className="absolute inset-x-3 -bottom-[3px] h-[2px] rounded-full bg-ink" />}
                    </>
                  )}
                </NavLink>
                <AnimatePresence>
                  {hovered === l.to && (
                    <motion.span
                      layoutId="nav-hover"
                      className="absolute inset-0 rounded-full bg-ink/[0.06]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group flex h-10 items-center gap-2 rounded-full px-3 text-ink-2 transition-colors hover:bg-ink/[0.06] hover:text-ink"
              aria-label="Поиск (⌘K)"
            >
              <SearchIcon size={18} className="transition-transform duration-300 group-hover:scale-110" />
              <span className="hidden text-xs text-mute xl:inline">⌘K</span>
            </button>
            <motion.button
              id="cart-target"
              type="button"
              animate={bag}
              onClick={() => setCartOpen(true)}
              className="relative grid h-10 w-10 place-items-center rounded-full text-ink-2 transition-colors hover:bg-ink/[0.06] hover:text-ink"
              aria-label={`Корзина, товаров: ${count}`}
            >
              <BagIcon size={19} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/[0.06] lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </nav>
      </header>

      {/* Мобильное меню */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="glass fixed inset-0 z-40 pt-14 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.ul
              className="container-x flex flex-col gap-1 pt-6"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            >
              {NAV_LINKS.map((l) => (
                <motion.li key={l.to} variants={{ hidden: { opacity: 0, y: -10 }, show: { opacity: 1, y: 0 } }}>
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) => cn('block border-b border-line py-4 text-2xl font-semibold tracking-tight', isActive ? 'text-ink' : 'text-ink-2')}
                  >
                    {l.label}
                  </NavLink>
                </motion.li>
              ))}
              <motion.li variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="flex flex-wrap gap-x-6 gap-y-2 pt-6 text-sm text-mute">
                <Link to="/about">О магазине</Link>
                <Link to="/delivery">Доставка и оплата</Link>
                <Link to="/warranty">Гарантия</Link>
                <Link to="/faq">FAQ</Link>
                <Link to="/contacts">Контакты</Link>
              </motion.li>
              <motion.li variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="pt-4">
                <ThemeToggle withLabel className="-ml-4" />
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
