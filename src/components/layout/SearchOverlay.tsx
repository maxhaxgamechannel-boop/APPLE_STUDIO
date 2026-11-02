import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { products } from '@/data/products'
import { categories } from '@/data/categories'
import { searchProducts } from '@/lib/search'
import { formatPrice, cn } from '@/lib/format'
import { useUI } from '@/store/ui'
import { ArrowRight, CloseIcon, SearchIcon } from '../ui/Icons'
import { DeviceSilhouette } from '../product/DeviceSilhouette'

const POPULAR = ['iPhone 18 Pro', 'iPhone Duo', 'MacBook Pro', 'AirPods 5', 'Apple Watch Ultra', 'iPad mini']

export function SearchOverlay() {
  const open = useUI((s) => s.searchOpen)
  const setOpen = useUI((s) => s.setSearchOpen)
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const results = useMemo(() => (q.trim() ? searchProducts(products, q).slice(0, 8) : []), [q])

  useEffect(() => {
    if (open) {
      setQ('')
      setCursor(0)
      const t = setTimeout(() => input.current?.focus(), 60)
      document.body.style.overflow = 'hidden'
      return () => {
        clearTimeout(t)
        document.body.style.overflow = ''
      }
    }
  }, [open])

  useEffect(() => setCursor(0), [q])

  const go = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, results.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    }
    if (e.key === 'Enter') {
      if (results[cursor]) go(`/product/${results[cursor].slug}`)
      else if (q.trim()) go(`/catalog?q=${encodeURIComponent(q.trim())}`)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <div className="absolute inset-0 bg-paper/70 backdrop-blur-2xl" onClick={() => setOpen(false)} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Поиск товаров"
            className="container-x relative pt-20 md:pt-28"
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onKeyDown={onKey}
          >
            <div className="mx-auto max-w-2xl">
              <div className="flex items-center gap-3 border-b border-ink/15 pb-4">
                <SearchIcon size={26} className="text-mute" />
                <input
                  ref={input}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Поиск: iPhone, MacBook, часы…"
                  className="w-full bg-transparent text-2xl font-semibold tracking-tight placeholder:text-silver focus:outline-none md:text-3xl"
                  aria-label="Поисковый запрос"
                />
                <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/[0.06]" aria-label="Закрыть поиск">
                  <CloseIcon />
                </button>
              </div>

              {!q.trim() ? (
                <div className="grid gap-8 pt-8 md:grid-cols-2">
                  <div>
                    <p className="eyebrow mb-3">Популярные запросы</p>
                    <ul className="space-y-1">
                      {POPULAR.map((p) => (
                        <li key={p}>
                          <button type="button" onClick={() => setQ(p)} className="flex items-center gap-2 py-1.5 text-[15px] text-ink-2 hover:text-accent">
                            <ArrowRight size={14} /> {p}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="eyebrow mb-3">Категории</p>
                    <ul className="space-y-1">
                      {categories.map((c) => (
                        <li key={c.id}>
                          <button type="button" onClick={() => go(c.path)} className="flex items-center gap-2 py-1.5 text-[15px] text-ink-2 hover:text-accent">
                            <ArrowRight size={14} /> {c.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : results.length ? (
                <ul className="max-h-[60vh] overflow-y-auto pt-4" role="listbox">
                  {results.map((p, i) => (
                    <motion.li key={p.slug} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={i === cursor}
                        onMouseEnter={() => setCursor(i)}
                        onClick={() => go(`/product/${p.slug}`)}
                        className={cn('flex w-full items-center gap-4 rounded-2xl p-3 text-left transition-colors', i === cursor ? 'bg-ink/[0.06]' : '')}
                      >
                        <span className="h-14 w-14 shrink-0 rounded-xl bg-mist p-1.5">
                          <DeviceSilhouette kind={p.model.kind} color={p.colors[0].swatch} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{p.name}</span>
                          <span className="block truncate text-sm text-mute">{p.tagline}</span>
                        </span>
                        <span className="text-sm font-medium tabular-nums">{formatPrice(p.price)}</span>
                      </button>
                    </motion.li>
                  ))}
                  <li className="pt-3">
                    <button type="button" onClick={() => go(`/catalog?q=${encodeURIComponent(q.trim())}`)} className="flex items-center gap-2 px-3 text-[15px] font-medium text-accent hover:underline">
                      Все результаты в каталоге <ArrowRight size={15} />
                    </button>
                  </li>
                </ul>
              ) : (
                <p className="pt-8 text-mute">По запросу «{q}» ничего не найдено. Попробуйте «iPhone», «Mac» или «AirPods».</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
