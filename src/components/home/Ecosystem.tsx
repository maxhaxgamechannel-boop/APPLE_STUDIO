import { useState } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '@/data/categories'
import { products } from '@/data/products'
import { ProductVisual } from '../product/ProductVisual'
import { Reveal, SectionHeading } from '../ui/Reveal'
import { ArrowRight } from '../ui/Icons'
import { cn, formatPrice } from '@/lib/format'
import type { ProductColor } from '@/types'

const tileColor = (hex: string): ProductColor => ({ name: '', swatch: hex, frame: hex, back: hex, accent: hex })

function Tile({ index }: { index: number }) {
  const c = categories[index]
  const [hover, setHover] = useState(false)
  const [playKey, setPlayKey] = useState(0)
  const items = products.filter((p) => p.category === c.id)
  const from = Math.min(...items.map((p) => p.price))
  const big = index < 2
  return (
    <Reveal delay={index * 0.06} className={cn(big ? 'md:col-span-3' : 'md:col-span-2')}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="card group relative flex h-full flex-col overflow-hidden">
        <Link to={c.path} className="absolute inset-0 z-[1]" aria-label={`${c.title} — перейти в каталог`} />
        <div className={cn('stage relative w-full', big ? 'aspect-[16/11]' : 'aspect-[4/3.6]')}>
          <ProductVisual model={c.model} color={tileColor(c.color)} active={hover} playKey={playKey} distance={big ? 4.2 : 4.6} className="absolute inset-0 h-full w-full" />
          {/* клик по модели — оборот; клик по подписи — переход в категорию */}
          <button type="button" onClick={() => setPlayKey((k) => k + 1)} className="absolute inset-0 z-[2] cursor-pointer" aria-label={`Покрутить модель: ${c.title}`} />
        </div>
        <div className="pointer-events-none relative flex items-end justify-between gap-4 p-6">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">{c.title}</h3>
            <p className="mt-1 text-sm text-mute">{c.lead}</p>
            <p className="mt-2 text-xs text-mute">
              {items.length} моделей · от {formatPrice(from)}
            </p>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist transition-all duration-500 group-hover:translate-x-1 group-hover:bg-ink group-hover:text-paper">
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Reveal>
  )
}

export function Ecosystem() {
  return (
    <section className="container-x relative py-28 md:py-36">
      <SectionHeading eyebrow="Экосистема" title="Всё, что работает вместе." lead="Каждое устройство — живая 3D-модель, построенная прямо в браузере. Нажмите на модель, чтобы покрутить её." />
      <div className="mt-16 grid gap-6 md:grid-cols-6">
        {categories.map((c, i) => (
          <Tile key={c.id} index={i} />
        ))}
      </div>
    </section>
  )
}
