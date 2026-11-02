import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { LAST_ORDER_KEY } from '@/lib/validation'
import { formatPrice } from '@/lib/format'
import { ButtonLink } from '@/components/ui/Button'

interface DemoOrder {
  number: string
  createdAt: string
  customer: { name: string; email: string; city: string }
  delivery: string
  items: { name: string; color: string; options: string[]; qty: number; price: number }[]
  total: number
}

export default function Success() {
  const order = useMemo<DemoOrder | null>(() => {
    try {
      const raw = sessionStorage.getItem(LAST_ORDER_KEY)
      return raw ? (JSON.parse(raw) as DemoOrder) : null
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    document.title = 'Демо-заказ сформирован — APPLE STUDIO'
  }, [])

  return (
    <div className="container-x flex min-h-[80vh] flex-col items-center pt-32 text-center">
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
        className="grid h-24 w-24 place-items-center rounded-full bg-ink text-paper shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]"
      >
        <svg viewBox="0 0 24 24" className="h-11 w-11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="m5 12.5 4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }} />
        </svg>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}>
        <p className="eyebrow mt-10">Демонстрационный режим</p>
        <h1 className="display mt-3 text-[clamp(2.4rem,5vw,4rem)] text-gradient">Демо-заказ сформирован</h1>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-mute">
          Спасибо за интерес к APPLE STUDIO! Заказ создан только в вашем браузере: он <strong className="text-ink">не отправлен</strong> в магазин, оплата не списана, письмо не высылается. Реальные заказы станут доступны после подключения серверной системы.
        </p>
      </motion.div>

      {order && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.7 }} className="mt-10 w-full max-w-lg rounded-[28px] bg-mist p-6 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-mute">Номер демо-заказа</span>
            <span className="font-mono font-semibold">{order.number}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-mute">Получатель</span>
            <span>
              {order.customer.name}, {order.customer.city}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-mute">Доставка</span>
            <span>{order.delivery}</span>
          </div>
          <ul className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between gap-3">
                <span>
                  {i.name} × {i.qty}
                  <span className="block text-xs text-mute">{[i.color, ...i.options].join(' · ')}</span>
                </span>
                <span className="tabular-nums">{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-line pt-4 font-semibold">
            <span>Итого</span>
            <span className="tabular-nums">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format(order.total)}</span>
          </div>
        </motion.div>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/catalog" variant="dark">
          Продолжить покупки
        </ButtonLink>
        <ButtonLink to="/" variant="ghost">
          На главную
        </ButtonLink>
      </div>
    </div>
  )
}
