import { memo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/format'
import { useAddToCart } from '@/hooks/useAddToCart'
import { ProductVisual } from './ProductVisual'
import { Badge, ColorSwatches } from '../ui/Pickers'
import { BagIcon, RotateIcon } from '../ui/Icons'

/** Карточка товара с живой 3D-моделью, сменой цвета и быстрым добавлением в корзину */
export const ProductCard = memo(function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [color, setColor] = useState(0)
  const [hover, setHover] = useState(false)
  const [playKey, setPlayKey] = useState(0)
  const addToCart = useAddToCart()
  const btn = useRef<HTMLButtonElement>(null)
  const c = product.colors[color]

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, delay: Math.min(index, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="card group relative flex flex-col overflow-hidden"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link to={`/product/${product.slug}`} className="absolute inset-0 z-[1]" aria-label={`${product.name} — подробнее`} />
      <div className="stage relative aspect-[4/3.3] w-full">
        <ProductVisual model={product.model} color={c} active={hover} playKey={playKey} className="absolute inset-0 h-full w-full" />
        {/* клик по модели — эффектный оборот; переход на страницу — по названию и остальной карточке */}
        <button
          type="button"
          onClick={() => setPlayKey((k) => k + 1)}
          className="absolute inset-0 z-[2] cursor-pointer"
          aria-label={`Покрутить 3D-модель ${product.name}`}
        />
        <div className="pointer-events-none absolute left-4 top-4 z-[3] flex gap-2">
          {product.badge && <Badge>{product.badge}</Badge>}
        </div>
        <span
          className={`tap-hint pointer-events-none absolute bottom-3 right-3 z-[3] transition-all duration-300 ${hover ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}`}
          aria-hidden
        >
          <RotateIcon size={12} /> Нажмите на модель
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6 pt-5">
        <div className="relative z-[2] w-fit">
          <ColorSwatches colors={product.colors} value={color} onChange={setColor} size="sm" />
        </div>
        <div>
          <h3 className="text-[19px] font-semibold tracking-tight">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-mute">{product.tagline}</p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-xs text-mute">{product.options.length ? 'от' : 'цена'}</p>
            <p className="text-lg font-semibold tabular-nums">{formatPrice(product.price)}</p>
          </div>
          <button
            ref={btn}
            type="button"
            onClick={() => addToCart(product, { color: c, origin: btn.current })}
            className="relative z-[2] inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-paper transition-all duration-300 hover:bg-ink-2 active:scale-95"
            aria-label={`Добавить ${product.name} в корзину`}
          >
            <BagIcon size={16} /> В корзину
          </button>
        </div>
      </div>
    </motion.article>
  )
})
