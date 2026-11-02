import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import { productBySlug } from '@/data/products'
import { formatPrice } from '@/lib/format'
import { useAddToCart } from '@/hooks/useAddToCart'
import { ProductVisual } from '../product/ProductVisual'
import { ColorSwatches } from '../ui/Pickers'
import { Reveal, SectionHeading } from '../ui/Reveal'

function LineupCard({ product, delay }: { product: Product; delay: number }) {
  const [i, setI] = useState(0)
  const [hover, setHover] = useState(false)
  const [playKey, setPlayKey] = useState(0)
  const addToCart = useAddToCart()
  const btn = useRef<HTMLButtonElement>(null)
  const color = product.colors[i]
  return (
    <Reveal delay={delay} className="card overflow-hidden" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="stage relative aspect-[4/4.4] md:aspect-[4/4]">
        <ProductVisual model={product.model} color={color} active={hover} playKey={playKey} distance={4.1} className="absolute inset-0 h-full w-full" />
        <button type="button" onClick={() => setPlayKey((k) => k + 1)} className="absolute inset-0 z-[1] cursor-pointer" aria-label={`Покрутить 3D-модель ${product.name}`} />
      </div>
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <ColorSwatches colors={product.colors} value={i} onChange={setI} />
        <p className="-mt-2 text-xs text-mute">{color.name}</p>
        <h3 className="text-3xl font-semibold tracking-tight">{product.name}</h3>
        <p className="max-w-sm text-mute">{product.tagline}</p>
        <p className="text-sm">
          от <span className="font-semibold tabular-nums">{formatPrice(product.price)}</span>
        </p>
        <div className="flex gap-3">
          <Link to={`/product/${product.slug}`} className="inline-flex h-11 items-center rounded-full border border-ink/15 px-6 text-sm font-medium transition hover:border-ink/40">
            Подробнее
          </Link>
          <button
            ref={btn}
            type="button"
            onClick={() => addToCart(product, { color, origin: btn.current })}
            className="inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-white transition hover:bg-accent-2 active:scale-95"
          >
            Купить
          </button>
        </div>
      </div>
    </Reveal>
  )
}

export function ProLineup() {
  const pro = productBySlug('iphone-18-pro')!
  const max = productBySlug('iphone-18-pro-max')!
  return (
    <section className="container-x relative py-28 md:py-36">
      <SectionHeading eyebrow="Линейка Pro 2026" title="Два размера. Один уровень." lead="iPhone 18 Pro и iPhone 18 Pro Max — чип A20 Pro, камера с переменной диафрагмой и четыре цвета. Нажмите на модель, чтобы увидеть её со всех сторон." />
      <div className="mt-16 grid gap-6 md:grid-cols-2">
        <LineupCard product={pro} delay={0} />
        <LineupCard product={max} delay={0.1} />
      </div>
    </section>
  )
}
