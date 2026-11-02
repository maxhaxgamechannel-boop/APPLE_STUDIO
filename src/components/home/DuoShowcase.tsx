import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { productBySlug } from '@/data/products'
import { formatPrice, cn } from '@/lib/format'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { ProductVisual } from '../product/ProductVisual'
import { ColorSwatches } from '../ui/Pickers'
import { ArrowRight } from '../ui/Icons'
import { Reveal } from '../ui/Reveal'

/**
 * Сцена iPhone Duo: смартфон раскрывается и складывается по нажатию на модель
 * (или на кнопку). Прокрутка страницы моделью не управляет.
 */
export function DuoShowcase() {
  const duo = productBySlug('iphone-duo')!
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const [colorIdx, setColorIdx] = useState(0)
  const size = useMotionValue(5.4)
  const sizeText = useTransform(size, (v) => `${v.toFixed(1).replace('.', ',')}″`)
  const bar = useTransform(size, [5.4, 7.6], ['0%', '100%'])

  useEffect(() => {
    const ctrl = animate(size, open ? 7.6 : 5.4, { duration: reduced ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] })
    return () => ctrl.stop()
  }, [open, size, reduced])

  const toggle = () => setOpen((v) => !v)

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="container-x text-center">
        <Reveal>
          <p className="eyebrow">Первый складной iPhone</p>
          <h2 className="display mt-3 text-[clamp(2.4rem,7vw,5.6rem)] text-gradient">iPhone Duo</h2>
          <p className="mx-auto mt-4 max-w-xl text-mute">Нажмите на смартфон, чтобы раскрыть его — и ещё раз, чтобы сложить.</p>
        </Reveal>
      </div>

      {/* сцена — отдельная область; вся площадь кликабельна */}
      <div className="container-x mt-8">
        <div className="stage relative h-[52svh] min-h-[340px] overflow-hidden rounded-[36px] md:h-[60svh]">
          <ProductVisual model={duo.model} color={duo.colors[colorIdx]} state={open ? 1 : 0} distance={4.3} tilt={[0.08, 0]} className="absolute inset-0 h-full w-full" />
          <button
            type="button"
            onClick={toggle}
            className="absolute inset-0 z-[1] cursor-pointer rounded-[36px] focus-visible:outline-offset-[-4px]"
            aria-label={open ? 'Сложить iPhone Duo' : 'Раскрыть iPhone Duo'}
            aria-pressed={open}
          />
        </div>
      </div>

      <div className="container-x mt-8 grid gap-8 md:grid-cols-3 md:items-center">
        <div className="min-h-[64px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={open ? 'open' : 'closed'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
              <p className="text-sm text-mute">{open ? 'Раскрыт' : 'Сложен'}</p>
              <p className="text-lg font-semibold">{open ? 'Внутренний дисплей 7,6″ — самый большой в истории iPhone' : 'Внешний дисплей 5,4″ — как привычный iPhone'}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex flex-col items-center gap-4">
          <motion.p className="display text-6xl tabular-nums md:text-7xl">{sizeText}</motion.p>
          <div className="h-[3px] w-40 overflow-hidden rounded-full bg-line">
            <motion.div style={{ width: bar }} className="h-full rounded-full bg-ink" />
          </div>
          <button
            type="button"
            onClick={toggle}
            className={cn('inline-flex h-11 items-center rounded-full px-6 text-sm font-medium transition active:scale-95', open ? 'bg-mist text-ink hover:bg-line' : 'bg-ink text-paper hover:bg-ink-2')}
          >
            {open ? 'Сложить' : 'Раскрыть'}
          </button>
        </div>
        <div className="flex flex-col items-center gap-4 md:items-end">
          <ColorSwatches colors={duo.colors} value={colorIdx} onChange={setColorIdx} />
          <p className="text-sm text-mute">
            от <span className="font-semibold text-ink tabular-nums">{formatPrice(duo.price)}</span> · цена магазина
          </p>
          <Link to={`/product/${duo.slug}`} className="group inline-flex h-11 items-center gap-2 rounded-full border border-ink/15 px-6 text-sm font-medium transition hover:border-ink/40 active:scale-95">
            Узнать больше <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
