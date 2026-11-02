import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cartCount, cartTotal, useCart } from '@/store/cart'
import { useUI } from '@/store/ui'
import { formatPrice, pluralize } from '@/lib/format'
import { BagIcon, CloseIcon, TrashIcon } from '../ui/Icons'
import { QtyStepper } from '../ui/Pickers'
import { DeviceSilhouette } from '../product/DeviceSilhouette'
import { Button } from '../ui/Button'

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen)
  const setOpen = useUI((s) => s.setCartOpen)
  const items = useCart((s) => s.items)
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)
  const navigate = useNavigate()
  const total = cartTotal(items)
  const count = cartCount(items)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, setOpen])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            className="absolute inset-0 bg-black/25 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Корзина"
            className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-card shadow-[-30px_0_80px_-20px_rgba(0,0,0,0.25)] sm:rounded-l-[32px]"
            initial={{ x: '100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.6 }}
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
          >
            <header className="flex items-center justify-between px-6 pb-4 pt-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Корзина</h2>
                <p className="text-sm text-mute">
                  {count} {pluralize(count, ['товар', 'товара', 'товаров'])}
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-mist hover:bg-line" aria-label="Закрыть корзину">
                <CloseIcon size={18} />
              </button>
            </header>

            {items.length === 0 ? (
              <motion.div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <span className="grid h-20 w-20 place-items-center rounded-full bg-mist text-mute">
                  <BagIcon size={34} />
                </span>
                <p className="text-lg font-semibold">Ваша корзина пуста</p>
                <p className="text-sm text-mute">Выберите устройство в каталоге — оно появится здесь.</p>
                <Button variant="dark" onClick={() => { setOpen(false); navigate('/catalog') }}>
                  Перейти в каталог
                </Button>
              </motion.div>
            ) : (
              <>
                <ul className="flex-1 space-y-3 overflow-y-auto px-6 py-2">
                  <AnimatePresence initial={false}>
                    {items.map((it, i) => (
                      <motion.li
                        key={it.key}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                        exit={{ opacity: 0, x: 60, height: 0, marginTop: 0, transition: { duration: 0.3 } }}
                        className="flex gap-4 rounded-3xl bg-mist/70 p-3"
                      >
                        <Link to={`/product/${it.slug}`} onClick={() => setOpen(false)} className="h-20 w-20 shrink-0 rounded-2xl bg-card p-2">
                          <DeviceSilhouette kind={it.kind} color={it.colorSwatch} />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <Link to={`/product/${it.slug}`} onClick={() => setOpen(false)} className="font-semibold leading-tight hover:underline">
                              {it.name}
                            </Link>
                            <button type="button" onClick={() => remove(it.key)} className="text-mute transition-colors hover:text-danger" aria-label={`Удалить ${it.name}`}>
                              <TrashIcon size={17} />
                            </button>
                          </div>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-mute">
                            <span className="inline-block h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: it.colorSwatch }} />
                            {it.color}
                            {it.options.length > 0 && <span>· {it.options.join(' · ')}</span>}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <QtyStepper value={it.qty} onChange={(v) => setQty(it.key, v)} />
                            <span className="font-semibold tabular-nums">{formatPrice(it.price * it.qty)}</span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <footer className="border-t border-line px-6 pb-7 pt-5">
                  <div className="mb-1 flex justify-between text-sm text-mute">
                    <span>Доставка</span>
                    <span>{total >= 50 ? 'Бесплатно' : 'Рассчитывается при оформлении'}</span>
                  </div>
                  <div className="mb-5 flex items-baseline justify-between">
                    <span className="text-lg font-semibold">Итого</span>
                    <motion.span key={total} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold tabular-nums">
                      {formatPrice(total)}
                    </motion.span>
                  </div>
                  <Button size="lg" className="w-full" onClick={() => { setOpen(false); navigate('/checkout') }}>
                    Оформить заказ
                  </Button>
                  <p className="mt-3 text-center text-xs text-mute">Демонстрационный режим — оплата не списывается</p>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
