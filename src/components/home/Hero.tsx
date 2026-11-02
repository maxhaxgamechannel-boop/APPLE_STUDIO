import { Suspense, useCallback, useRef, useState } from 'react'
import { lazyRetry } from '@/lib/lazy'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { productBySlug } from '@/data/products'
import { useUI } from '@/store/ui'
import { useWebGL } from '@/hooks/useWebGL'
import { useIsMobile, usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { useAddToCart } from '@/hooks/useAddToCart'
import { formatPrice, cn } from '@/lib/format'
import type { Product } from '@/types'
import type { HeroCaption } from '@/three/HeroScene'
import { ErrorBoundary } from '../ErrorBoundary'
import { ColorSwatches } from '../ui/Pickers'
import { ArrowRight, RotateIcon } from '../ui/Icons'
import { DeviceSilhouette } from '../product/DeviceSilhouette'
import { Reveal } from '../ui/Reveal'

const HeroScene = lazyRetry(() => import('@/three/HeroScene'), 'HeroScene')

const ease = [0.22, 1, 0.36, 1] as const

const CAPTIONS: Record<HeroCaption, string> = {
  intro: 'iPhone 18 Pro Max',
  done: 'Нажмите на iPhone, чтобы рассмотреть',
  back: 'Задняя панель · камеры Pro',
  side: 'Боковая грань · кнопки',
  front: 'Дисплей Super Retina XDR',
}

/**
 * Первый экран. Текст и 3D-сцена живут в отдельных областях сетки,
 * поэтому надписи никогда не перекрывают телефон — ни на телефоне, ни на широком мониторе.
 * Анимация модели запускается кликом по iPhone (или кнопкой под ним), а не прокруткой.
 */
export function Hero() {
  const product = productBySlug('iphone-18-pro-max')!
  const section = useRef<HTMLElement>(null)
  const inView = useInView(section, { margin: '0px 0px -10% 0px' })
  const introDone = useUI((s) => s.introDone)
  const webgl = useWebGL()
  const isMobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  const [colorIdx, setColorIdx] = useState(0)
  const [playKey, setPlayKey] = useState(0)
  const [caption, setCaption] = useState<HeroCaption>('intro')
  const color = product.colors[colorIdx]

  const play = useCallback(() => setPlayKey((k) => k + 1), [])
  const playing = caption === 'back' || caption === 'side' || caption === 'front'

  const show = (delay: number) => ({
    initial: { opacity: 0, y: 22, filter: 'blur(8px)' },
    animate: introDone ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {},
    transition: { duration: 1, delay: reduced ? 0 : delay, ease },
  })

  return (
    <>
      <section ref={section} className="stage relative overflow-hidden" aria-label="iPhone 18 Pro Max">
        {/* декоративное фоновое слово — всегда ПОЗАДИ сцены и никогда не перекрывает её */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-[6%] select-none whitespace-nowrap text-center text-[19vw] font-bold leading-none tracking-[-0.06em] text-ink/[0.035]"
          aria-hidden
        >
          PRO MAX
        </div>

        <div className="container-x relative grid min-h-[100svh] grid-rows-[auto_minmax(300px,1fr)_auto] items-center gap-y-3 pb-8 pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:grid-rows-1 lg:gap-x-10 lg:pb-0 lg:pt-14">
          {/* ── Текст ── */}
          <div className="text-center lg:text-left">
            <motion.p {...show(0.15)} className="eyebrow">
              Новинка · Анонс 9 сентября 2026
            </motion.p>
            <motion.h1 {...show(0.25)} className="display mt-3 text-[clamp(2.4rem,6.4vw,5.2rem)] text-metal">
              {product.name}
            </motion.h1>
            <motion.p {...show(0.35)} className="mx-auto mt-3 max-w-md text-[clamp(1rem,1.6vw,1.25rem)] text-ink-2 lg:mx-0">
              {product.tagline}
            </motion.p>
            <div className="hidden lg:block">
              <HeroActions product={product} colorIdx={colorIdx} setColorIdx={setColorIdx} show={show} />
            </div>
          </div>

          {/* ── 3D-сцена: отдельная область, текст сюда не попадает ── */}
          <motion.div
            className="relative flex h-full min-h-[300px] flex-col self-stretch lg:h-[calc(100svh-3.5rem)] lg:self-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative min-h-0 flex-1">
              {webgl ? (
                <ErrorBoundary resetKey={colorIdx} fallback={<HeroFallback swatch={color.swatch} />}>
                  <Suspense fallback={<HeroFallback swatch={color.swatch} loading />}>
                    <HeroScene
                      start={introDone}
                      playKey={playKey}
                      finish={{ frame: color.frame, back: color.back, swatch: color.swatch }}
                      isMobile={isMobile}
                      reducedMotion={reduced}
                      active={inView}
                      onPhoneClick={play}
                      onCaption={setCaption}
                    />
                  </Suspense>
                </ErrorBoundary>
              ) : (
                <HeroFallback swatch={color.swatch} />
              )}
            </div>
            {/* подпись и кнопка повтора — под сценой, а не поверх телефона */}
            <div className="flex justify-center pb-1 pt-2 lg:pb-8">
              <button type="button" onClick={play} className="tap-hint" aria-label="Показать iPhone со всех сторон">
                <RotateIcon size={14} className={cn(playing && 'animate-spin [animation-duration:2.5s]')} />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={caption} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }}>
                    {webgl ? CAPTIONS[caption] : 'Подробнее о модели'}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </motion.div>

          {/* ── Действия на мобильных — под сценой ── */}
          <div className="lg:hidden">
            <HeroActions product={product} colorIdx={colorIdx} setColorIdx={setColorIdx} show={show} centered />
          </div>
        </div>
      </section>

      {/* Ключевые возможности — отдельным блоком, без наложения на модель */}
      <section className="container-x py-16 md:py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {product.highlights.map((h, i) => (
            <Reveal key={h.title} delay={i * 0.08} className="rounded-[28px] border border-line p-7 transition-colors duration-500 hover:bg-mist">
              <p className="eyebrow">Внутри</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">{h.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-mute">{h.text}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}

type ShowFn = (delay: number) => Record<string, unknown>

function HeroActions({
  product,
  colorIdx,
  setColorIdx,
  show,
  centered,
}: {
  product: Product
  colorIdx: number
  setColorIdx: (i: number) => void
  show: ShowFn
  centered?: boolean
}) {
  const addToCart = useAddToCart()
  const buyBtn = useRef<HTMLButtonElement>(null)
  const color = product.colors[colorIdx]
  return (
    <div className={cn('flex flex-col gap-5', centered ? 'items-center text-center' : 'mt-9 items-start')}>
      <motion.div {...show(0.45)}>
        <ColorSwatches colors={product.colors} value={colorIdx} onChange={setColorIdx} />
        <p className="mt-2 text-xs text-mute">{color.name}</p>
      </motion.div>
      <motion.p {...show(0.55)} className="text-sm text-ink-2">
        от <span className="text-lg font-semibold text-ink tabular-nums">{formatPrice(product.price)}</span>
        <span className="ml-2 text-xs text-mute">цена магазина</span>
      </motion.p>
      <motion.div {...show(0.65)} className="flex flex-wrap justify-center gap-3">
        <Link
          to={`/product/${product.slug}`}
          className="group inline-flex h-12 items-center gap-2 rounded-full border border-ink/15 bg-card/70 px-7 text-[15px] font-medium backdrop-blur transition-all hover:border-ink/40 active:scale-95"
        >
          Подробнее <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
        <button
          ref={buyBtn}
          type="button"
          onClick={() => addToCart(product, { color, origin: buyBtn.current })}
          className="inline-flex h-12 items-center rounded-full bg-accent px-8 text-[15px] font-medium text-white shadow-[0_10px_30px_-10px_rgba(0,113,227,0.7)] transition-all hover:-translate-y-0.5 hover:bg-accent-2 active:scale-95"
        >
          Купить
        </button>
      </motion.div>
    </div>
  )
}

function HeroFallback({ swatch, loading }: { swatch: string; loading?: boolean }) {
  return (
    <div className="grid h-full place-items-center">
      <DeviceSilhouette kind="phone" color={swatch} className={cn('h-[70%] w-auto max-w-full', loading && 'animate-pulse')} />
    </div>
  )
}
