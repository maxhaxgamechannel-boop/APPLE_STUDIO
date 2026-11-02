import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { InfoPage } from '@/components/layout/InfoPage'
import { PlusIcon } from '@/components/ui/Icons'
import { faq } from '@/data/info'
import { cn } from '@/lib/format'

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <InfoPage eyebrow="Помощь" title="Вопросы и ответы" lead="Коротко о самом важном: как устроен магазин, откуда данные и что с заказами.">
      <div className="mx-auto max-w-3xl divide-y divide-line border-y border-line">
        {faq.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-semibold tracking-tight"
              >
                {item.q}
                <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mist transition-transform duration-500', isOpen && 'rotate-45 bg-ink text-paper')}>
                  <PlusIcon size={16} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                    <p className="pb-6 pr-14 leading-relaxed text-mute">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </InfoPage>
  )
}
