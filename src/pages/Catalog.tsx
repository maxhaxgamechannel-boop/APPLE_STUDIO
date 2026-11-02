import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { products, priceBounds } from '@/data/products'
import { accessorySubs, categories, categoryById } from '@/data/categories'
import { applyFilters, type SortMode } from '@/lib/search'
import { cn, formatPrice, pluralize } from '@/lib/format'
import type { CategoryId } from '@/types'
import { ProductCard } from '@/components/product/ProductCard'
import { PriceRange } from '@/components/catalog/PriceRange'
import { CloseIcon, FilterIcon, SearchIcon } from '@/components/ui/Icons'
import { Button } from '@/components/ui/Button'

const SORTS: { id: SortMode; label: string }[] = [
  { id: 'popular', label: 'Популярные' },
  { id: 'price-asc', label: 'Сначала дешевле' },
  { id: 'price-desc', label: 'Сначала дороже' },
  { id: 'new', label: 'Сначала новые' },
]

const PRESETS: { label: string; range: [number, number] }[] = [
  { label: 'До 300 €', range: [priceBounds.min, 300] },
  { label: '300–1000 €', range: [300, 1000] },
  { label: '1000–1500 €', range: [1000, 1500] },
  { label: 'От 1500 €', range: [1500, priceBounds.max] },
]

const isCategory = (v?: string): v is CategoryId => !!v && v in categoryById

export default function Catalog() {
  const { category: catParam } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const category: CategoryId | 'all' = isCategory(catParam) ? catParam : 'all'

  const q = params.get('q') ?? ''
  const sort = (params.get('sort') as SortMode) || 'popular'
  const sub = params.get('sub') ?? ''
  const min = Number(params.get('min') ?? priceBounds.min)
  const max = Number(params.get('max') ?? priceBounds.max)

  const [query, setQuery] = useState(q)
  const [range, setRange] = useState<[number, number]>([min, max])
  const [sheet, setSheet] = useState(false)

  useEffect(() => setQuery(q), [q])
  useEffect(() => setRange([min, max]), [min, max])

  // Обновляем URL — фильтры переживают перезагрузку и ими можно делиться
  const update = (patch: Record<string, string | number | null>) => {
    // функциональное обновление: отложенные вызовы не затирают свежие параметры
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(patch).forEach(([k, v]) => {
          if (v === null || v === '' || (k === 'min' && v === priceBounds.min) || (k === 'max' && v === priceBounds.max) || (k === 'sort' && v === 'popular')) next.delete(k)
          else next.set(k, String(v))
        })
        return next
      },
      { replace: true },
    )
  }

  // Поиск с небольшой задержкой при вводе
  useEffect(() => {
    const t = setTimeout(() => query !== q && update({ q: query.trim() || null }), 220)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Ценовой диапазон — применяем после остановки ползунка
  useEffect(() => {
    const t = setTimeout(() => (range[0] !== min || range[1] !== max) && update({ min: range[0], max: range[1] }), 180)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range])

  const results = useMemo(
    () => applyFilters(products, { q, category, sub, min, max, sort }),
    [q, category, sub, min, max, sort],
  )

  const title = category === 'all' ? (q ? 'Результаты поиска' : 'Все товары') : categoryById[category].title
  const lead = category === 'all' ? 'Техника Apple — от аксессуаров до флагманов.' : categoryById[category].lead

  useEffect(() => {
    document.title = `${title} — APPLE STUDIO`
  }, [title])

  const activeFilters = Number(!!q) + Number(min !== priceBounds.min || max !== priceBounds.max) + Number(!!sub)
  const reset = () => {
    setQuery('')
    setRange([priceBounds.min, priceBounds.max])
    setParams(new URLSearchParams(), { replace: true })
  }

  const goCategory = (id: CategoryId | 'all') => {
    const keep = new URLSearchParams(params)
    keep.delete('sub')
    const qs = keep.toString()
    navigate(`${id === 'all' ? '/catalog' : categoryById[id].path}${qs ? `?${qs}` : ''}`)
  }

  const filtersPanel = (
    <div className="space-y-9">
      <div>
        <p className="mb-3 text-sm font-semibold">Категория</p>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start lg:gap-1">
          {[{ id: 'all' as const, title: 'Все товары' }, ...categories].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => goCategory(c.id)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm transition-colors lg:px-0 lg:py-1',
                category === c.id ? 'bg-ink text-paper lg:bg-transparent lg:font-semibold lg:text-ink' : 'bg-mist text-ink-2 hover:text-ink lg:bg-transparent',
              )}
            >
              {c.title}
              <span className="ml-1.5 text-xs opacity-60">{c.id === 'all' ? products.length : products.filter((p) => p.category === c.id).length}</span>
            </button>
          ))}
        </div>
      </div>

      {category === 'accessories' && (
        <div>
          <p className="mb-3 text-sm font-semibold">Тип аксессуара</p>
          <div className="flex flex-wrap gap-2">
            {[{ id: '', title: 'Все' }, ...accessorySubs].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => update({ sub: s.id || null })}
                className={cn('rounded-full border px-3.5 py-1.5 text-sm transition-colors', sub === s.id ? 'border-ink bg-ink text-paper' : 'border-silver hover:border-ink/40')}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-sm font-semibold">Цена</p>
        <PriceRange min={priceBounds.min} max={priceBounds.max} value={range} onChange={setRange} />
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const active = min === p.range[0] && max === p.range[1]
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => (active ? update({ min: null, max: null }) : update({ min: p.range[0], max: p.range[1] }))}
                className={cn('rounded-full border px-3 py-1.5 text-xs transition-colors', active ? 'border-ink bg-ink text-paper' : 'border-silver hover:border-ink/40')}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      {activeFilters > 0 && (
        <button type="button" onClick={reset} className="text-sm font-medium text-accent hover:underline">
          Сбросить фильтры
        </button>
      )}
    </div>
  )

  return (
    <div className="container-x pb-10 pt-28 md:pt-32">
      {/* Заголовок */}
      <motion.div key={category} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        <nav className="mb-4 text-sm text-mute" aria-label="Хлебные крошки">
          <Link to="/" className="hover:text-ink">Главная</Link> <span className="mx-1.5">/</span>
          <Link to="/catalog" className="hover:text-ink">Каталог</Link>
          {category !== 'all' && (
            <>
              <span className="mx-1.5">/</span>
              <span className="text-ink">{categoryById[category].title}</span>
            </>
          )}
        </nav>
        <h1 className="display text-[clamp(2.6rem,6vw,4.8rem)] text-gradient">{title}</h1>
        <p className="mt-3 max-w-xl text-lg text-mute">{lead}</p>
      </motion.div>

      {/* Категории-табы */}
      <div className="no-scrollbar -mx-5 mt-8 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
        {[{ id: 'all' as const, title: 'Все' }, ...categories].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => goCategory(c.id)}
            className={cn('relative shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors', category === c.id ? 'text-paper' : 'text-ink-2 hover:text-ink')}
          >
            {category === c.id && <motion.span layoutId="cat-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
            <span className="relative">{c.title}</span>
          </button>
        ))}
      </div>

      {/* Панель поиска и сортировки */}
      <div className="sticky top-14 z-40 -mx-5 mt-6 border-b border-line bg-paper/85 px-5 py-3 backdrop-blur-xl md:mx-0 md:rounded-2xl md:border md:px-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative flex min-w-[200px] flex-1 items-center">
            <SearchIcon size={18} className="pointer-events-none absolute left-3.5 text-mute" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по названию"
              className="h-11 w-full rounded-full bg-mist pl-10 pr-10 text-[15px] placeholder:text-mute focus:outline-none focus:ring-2 focus:ring-accent/30"
              aria-label="Поиск по каталогу"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-3 text-mute hover:text-ink" aria-label="Очистить поиск">
                <CloseIcon size={16} />
              </button>
            )}
          </label>
          <select
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="h-11 rounded-full border border-silver bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            aria-label="Сортировка"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => setSheet(true)} className="inline-flex h-11 items-center gap-2 rounded-full border border-silver px-4 text-sm lg:hidden">
            <FilterIcon size={16} /> Фильтры {activeFilters > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-[10px] text-white">{activeFilters}</span>}
          </button>
          <p className="ml-auto hidden text-sm text-mute md:block" aria-live="polite">
            {results.length} {pluralize(results.length, ['товар', 'товара', 'товаров'])}
            {(min !== priceBounds.min || max !== priceBounds.max) && ` · ${formatPrice(min)} – ${formatPrice(max)}`}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[230px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-36">{filtersPanel}</div>
        </aside>

        <div>
          {results.length ? (
            <motion.div layout className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence>
                {results.map((p, i) => (
                  <ProductCard key={p.slug} product={p} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[28px] bg-mist px-8 py-20 text-center">
              <p className="text-2xl font-semibold">Ничего не найдено</p>
              <p className="mx-auto mt-2 max-w-md text-mute">Измените запрос или расширьте ценовой диапазон.</p>
              <Button variant="dark" className="mt-6" onClick={reset}>
                Сбросить фильтры
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Мобильная панель фильтров */}
      <AnimatePresence>
        {sheet && (
          <div className="fixed inset-0 z-[65] lg:hidden">
            <motion.div className="absolute inset-0 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.div
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[32px] bg-card p-6 pb-10"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 34 }}
              role="dialog"
              aria-label="Фильтры"
            >
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-line" />
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Фильтры</h2>
                <button type="button" onClick={() => setSheet(false)} className="grid h-9 w-9 place-items-center rounded-full bg-mist" aria-label="Закрыть">
                  <CloseIcon size={16} />
                </button>
              </div>
              {filtersPanel}
              <Button className="mt-8 w-full" size="lg" onClick={() => setSheet(false)}>
                Показать {results.length} {pluralize(results.length, ['товар', 'товара', 'товаров'])}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
