import { useCallback } from 'react'
import { useCart } from '@/store/cart'
import { useUI } from '@/store/ui'
import type { Product, ProductColor } from '@/types'

/** Добавляет товар в корзину и запускает анимацию полёта к иконке корзины */
export function useAddToCart() {
  const add = useCart((s) => s.add)
  const flyToCart = useUI((s) => s.flyToCart)

  return useCallback(
    (
      product: Product,
      opts: { color?: ProductColor; options?: string[]; price?: number; origin?: HTMLElement | null } = {},
    ) => {
      const color = opts.color ?? product.colors[0]
      const options =
        opts.options ?? product.options.map((g) => g.items[0]?.label).filter((v): v is string => Boolean(v))
      const price = opts.price ?? product.price
      add({
        slug: product.slug,
        name: product.name,
        color: color.name,
        colorSwatch: color.swatch,
        options,
        price,
        kind: product.model.kind,
      })
      if (opts.origin) {
        const r = opts.origin.getBoundingClientRect()
        flyToCart(r.left + r.width / 2, r.top + r.height / 2, color.swatch)
      } else {
        useUI.setState((s) => ({ cartPulse: s.cartPulse + 1 }))
      }
    },
    [add, flyToCart],
  )
}

/** Цена с учётом выбранных опций */
export function priceWithOptions(product: Product, selected: string[]) {
  return product.options.reduce((sum, group, i) => {
    const item = group.items.find((it) => it.label === selected[i])
    return sum + (item?.delta ?? 0)
  }, product.price)
}
