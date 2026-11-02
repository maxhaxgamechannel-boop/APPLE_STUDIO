import { AnimatePresence, motion } from 'framer-motion'
import { useUI } from '@/store/ui'

/** Анимация добавления в корзину: цветная «капля» летит по дуге к иконке корзины */
export function FlyingLayer() {
  const flying = useUI((s) => s.flying)
  const land = useUI((s) => s.landFlying)

  const target = () => {
    const el = document.getElementById('cart-target')
    if (!el) return { x: window.innerWidth - 40, y: 28 }
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[80]" aria-hidden>
      <AnimatePresence>
        {flying.map((f) => {
          const t = target()
          const midX = (f.x + t.x) / 2
          const midY = Math.min(f.y, t.y) - 120
          return (
            <motion.span
              key={f.id}
              className="absolute left-0 top-0 h-5 w-5 rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.25)] ring-2 ring-white"
              style={{ background: f.color }}
              initial={{ x: f.x - 10, y: f.y - 10, scale: 1.4, opacity: 1 }}
              animate={{ x: [f.x - 10, midX - 10, t.x - 10], y: [f.y - 10, midY, t.y - 10], scale: [1.4, 1, 0.4], opacity: [1, 1, 0.6] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.5, 0, 0.3, 1] }}
              onAnimationComplete={() => land(f.id)}
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
}
