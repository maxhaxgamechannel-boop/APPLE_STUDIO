import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { lazyRetry } from '@/lib/lazy'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { productBySlug, products } from '@/data/products'
import { categoryById } from '@/data/categories'
import { formatPrice, cn } from '@/lib/format'
import { priceWithOptions, useAddToCart } from '@/hooks/useAddToCart'
import { useWebGL } from '@/hooks/useWebGL'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import type { ViewAngle, ViewerHandle } from '@/three/ProductViewer'
import { Badge, ColorSwatches, OptionPicker } from '@/components/ui/Pickers'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { CheckIcon, CubeIcon, RotateIcon, ShieldIcon, TruckIcon, ZoomInIcon, ZoomOutIcon } from '@/components/ui/Icons'
import { SpecsTable } from '@/components/product/SpecsTable'
import { ProductCard } from '@/components/product/ProductCard'
import { DeviceSilhouette } from '@/components/product/DeviceSilhouette'
import NotFound from './NotFound'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const ProductViewer = lazyRetry(() => import('@/three/ProductViewer'), 'ProductViewer')

const ANGLES: { id: ViewAngle; label: string }[] = [
  { id: 'three-quarter', label: '3/4' },
  { id: 'front', label: 'Спереди' },
  { id: 'back', label: 'Сзади' },
  { id: 'side', label: 'Сбоку' },
  { id: 'top', label: 'Сверху' },
]

export default function ProductPage() {
  const { slug = '' } = useParams()
  const product = productBySlug(slug)
  const navigate = useNavigate()
  const webgl = useWebGL()
  const reduced = usePrefersReducedMotion()
  const addToCart = useAddToCart()
  const viewer = useRef<ViewerHandle>(null)
  const addBtn = useRef<HTMLButtonElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const stageInView = useInView(stageRef)

  const [colorIdx, setColorIdx] = useState(0)
  const [selected, setSelected] = useState<string[]>(() => product?.options.map((g) => g.items[0].label) ?? [])
  const [angle, setAngle] = useState<ViewAngle>('three-quarter')
  const [autoRotate, setAutoRotate] = useState(false)
  const [playKey, setPlayKey] = useState(0)
  const [transformState, setTransformState] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (product) document.title = `${product.name} — APPLE STUDIO`
  }, [product])

  const related = useMemo(
    () => (product ? products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 3) : []),
    [product],
  )

  if (!product) return <NotFound />

  const color = product.colors[colorIdx]
  const price = priceWithOptions(product, selected)
  const kind = product.model.kind
  const transformLabel = kind === 'fold' ? (transformState ? 'Сложить' : 'Раскрыть') : kind === 'laptop' ? (transformState ? 'Закрыть крышку' : 'Открыть крышку') : null

  const onAdd = () => {
    addToCart(product, { color, options: selected, price, origin: addBtn.current })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }
  const onBuy = () => {
    addToCart(product, { color, options: selected, price })
    navigate('/checkout')
  }

  const pickAngle = (a: ViewAngle) => {
    setAngle(a)
    setAutoRotate(false)
    viewer.current?.setAngle(a)
  }

  return (
    <div className="pt-14">
      <div className="container-x grid gap-10 pt-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* ── Левая часть: 3D ── */}
        <div className="lg:sticky lg:top-20 lg:h-[calc(100svh-6rem)]">
          <div ref={stageRef} className="stage relative h-[58svh] min-h-[380px] overflow-hidden rounded-[32px] lg:h-full">
            {webgl ? (
              <ErrorBoundary
                resetKey={product.slug}
                fallback={
                  <div className="grid h-full place-items-center p-10">
                    <DeviceSilhouette kind={kind} color={color.swatch} className="max-h-[70%]" />
                    <p className="absolute bottom-4 text-xs text-mute">Не удалось загрузить 3D — показана иллюстрация</p>
                  </div>
                }
              >
                <Suspense fallback={<div className="skeleton absolute inset-0" />}>
                  <ProductViewer
                    ref={viewer}
                    active={stageInView}
                    kind={kind}
                    variant={product.model.variant}
                    size={product.model.size}
                    finish={{ frame: color.frame, back: color.back, accent: color.accent, swatch: color.swatch }}
                    state={transformState}
                    autoRotate={autoRotate}
                    playKey={playKey}
                    onModelClick={() => setPlayKey((k) => k + 1)}
                    reducedMotion={reduced}
                    onInteract={() => setAutoRotate(false)}
                  />
                </Suspense>
              </ErrorBoundary>
            ) : (
              <div className="grid h-full place-items-center p-10">
                <DeviceSilhouette kind={kind} color={color.swatch} className="max-h-[70%]" />
                <p className="absolute bottom-4 text-xs text-mute">3D недоступно: браузер не поддерживает WebGL</p>
              </div>
            )}

            {/* панель управления */}
            {webgl && (
              <>
                <div className="absolute left-1/2 top-4 flex -translate-x-1/2 gap-1 rounded-full bg-card/80 p-1 shadow-sm backdrop-blur">
                  {ANGLES.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => pickAngle(a.id)}
                      className={cn('relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors', angle === a.id ? 'text-paper' : 'text-ink-2 hover:text-ink')}
                    >
                      {angle === a.id && <motion.span layoutId="angle-pill" className="absolute inset-0 rounded-full bg-ink" />}
                      <span className="relative">{a.label}</span>
                    </button>
                  ))}
                </div>
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <IconBtn label="Приблизить" onClick={() => viewer.current?.zoom(1)}>
                    <ZoomInIcon size={18} />
                  </IconBtn>
                  <IconBtn label="Отдалить" onClick={() => viewer.current?.zoom(-1)}>
                    <ZoomOutIcon size={18} />
                  </IconBtn>
                  <IconBtn label="Показать со всех сторон" onClick={() => setPlayKey((k) => k + 1)}>
                    <CubeIcon size={18} />
                  </IconBtn>
                  <IconBtn label={autoRotate ? 'Остановить вращение' : 'Включить вращение'} active={autoRotate} onClick={() => setAutoRotate((v) => !v)}>
                    <RotateIcon size={18} />
                  </IconBtn>
                </div>
                {transformLabel && (
                  <button
                    type="button"
                    onClick={() => setTransformState((s) => (s ? 0 : 1))}
                    className="absolute bottom-4 right-4 rounded-full bg-ink px-4 py-2.5 text-xs font-medium text-paper shadow-lg transition hover:bg-ink-2 active:scale-95"
                  >
                    {transformLabel}
                  </button>
                )}
                <p className="pointer-events-none absolute bottom-[22px] left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-xs text-mute 2xl:block">Нажмите на модель · перетащите для вращения · колесо — масштаб</p>
              </>
            )}
          </div>
        </div>

        {/* ── Правая часть: информация ── */}
        <div className="pb-6 lg:py-6">
          <nav className="text-sm text-mute" aria-label="Хлебные крошки">
            <Link to="/catalog" className="hover:text-ink">Каталог</Link>
            <span className="mx-1.5">/</span>
            <Link to={categoryById[product.category].path} className="hover:text-ink">
              {categoryById[product.category].title}
            </Link>
          </nav>
          <div className="mt-5 flex items-center gap-2">
            {product.badge && <Badge>{product.badge}</Badge>}
            <Badge tone="muted">{product.year}</Badge>
          </div>
          <h1 className="display mt-3 text-[clamp(2.3rem,4.5vw,3.6rem)]">{product.name}</h1>
          <p className="mt-3 text-lg leading-relaxed text-ink-2">{product.tagline}</p>
          <p className="mt-3 leading-relaxed text-mute">{product.description}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={price}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-3xl font-semibold tabular-nums"
              >
                {formatPrice(price)}
              </motion.span>
            </AnimatePresence>
            <span className="text-xs text-mute">цена магазина, вкл. НДС</span>
          </div>

          <div className="mt-8 space-y-8 border-t border-line pt-8">
            <div>
              <p className="mb-3 text-sm font-semibold">
                Цвет — <span className="font-normal text-ink-2">{color.name}</span>
              </p>
              <ColorSwatches colors={product.colors} value={colorIdx} onChange={setColorIdx} />
            </div>
            {product.options.map((g, gi) => (
              <OptionPicker
                key={g.title}
                group={g}
                base={product.price}
                value={selected[gi]}
                onChange={(label) => setSelected((s) => s.map((v, i) => (i === gi ? label : v)))}
              />
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button ref={addBtn} size="lg" variant="dark" onClick={onAdd}>
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span key="ok" className="flex items-center gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <CheckIcon size={18} /> Добавлено
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    Добавить в корзину
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
            <Button size="lg" onClick={onBuy}>
              Купить сейчас
            </Button>
          </div>

          <ul className="mt-8 space-y-3 text-sm text-ink-2">
            <li className="flex items-center gap-3">
              <TruckIcon size={18} className="text-mute" /> Бесплатная доставка по Германии от 50 €
            </li>
            <li className="flex items-center gap-3">
              <ShieldIcon size={18} className="text-mute" /> Гарантия производителя и 14 дней на возврат
            </li>
          </ul>

          {product.note && <p className="mt-6 rounded-2xl bg-mist p-4 text-xs leading-relaxed text-mute">{product.note}</p>}
        </div>
      </div>

      {/* ── Ключевые возможности ── */}
      <section className="container-x mt-24">
        <Reveal>
          <p className="eyebrow">Главное</p>
          <h2 className="display mt-2 text-[clamp(2rem,4vw,3rem)] text-gradient">Почему {product.name}</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {product.highlights.map((h, i) => (
            <Reveal key={h.title} delay={i * 0.08} className="rounded-[28px] bg-mist p-8">
              <p className="text-3xl font-semibold tracking-tight">{h.title}</p>
              <p className="mt-3 leading-relaxed text-mute">{h.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Характеристики ── */}
      <section className="container-x mt-24" id="specs">
        <Reveal className="mb-8">
          <p className="eyebrow">Технические характеристики</p>
          <h2 className="display mt-2 text-[clamp(2rem,4vw,3rem)] text-gradient">Характеристики</h2>
        </Reveal>
        <SpecsTable specs={product.specs} />
      </section>

      {/* ── Похожие ── */}
      {related.length > 0 && (
        <section className="container-x mt-24">
          <Reveal className="mb-8 flex items-end justify-between">
            <h2 className="display text-[clamp(1.8rem,3.5vw,2.6rem)]">Вам также может понравиться</h2>
            <Link to={categoryById[product.category].path} className="hidden text-sm font-medium text-accent hover:underline md:block">
              Все {categoryById[product.category].title}
            </Link>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function IconBtn({ children, label, onClick, active }: { children: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn('grid h-10 w-10 place-items-center rounded-full shadow-sm backdrop-blur transition active:scale-90', active ? 'bg-ink text-paper' : 'bg-card/85 text-ink hover:bg-card')}
    >
      {children}
    </button>
  )
}
