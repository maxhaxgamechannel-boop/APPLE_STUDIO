import { categoryById, accessorySubs } from '@/data/categories'
import type { CategoryId, Product } from '@/types'

/** Русские и разговорные синонимы → латинские названия */
const SYNONYMS: [RegExp, string][] = [
  [/айфон|айфоны|iфон/g, 'iphone'],
  [/айпад|планшет/g, 'ipad'],
  [/макбук|ноутбук/g, 'macbook'],
  [/аймак|моноблок/g, 'imac'],
  [/мак мини|макмини/g, 'mac mini'],
  [/мак(?!бук)/g, 'mac'],
  [/часы|вотч|воч/g, 'watch'],
  [/эирподс|аирподс|наушники|airpod(?!s)/g, 'airpods'],
  [/складн\S*|раскладн\S*|дуо/g, 'duo'],
  [/про макс/g, 'pro max'],
  [/(^|\s)про(?=\s|$)/g, '$1pro'],
  [/ультра/g, 'ultra'],
  [/зарядк\S*|адаптер\S*|блок питания/g, 'адаптер зарядное'],
  [/провод\S*/g, 'кабель'],
  [/стилус|карандаш|пенсил/g, 'pencil'],
  [/трекер|метк\S*|эйртег/g, 'airtag'],
]

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[″"«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

function expand(q: string) {
  let out = normalize(q)
  for (const [re, rep] of SYNONYMS) out = out.replace(re, rep)
  return out
}

function haystack(p: Product) {
  const sub = p.sub ? accessorySubs.find((s) => s.id === p.sub)?.title ?? '' : ''
  return normalize([p.name, p.tagline, categoryById[p.category].title, sub, p.description, p.colors.map((c) => c.name).join(' ')].join(' '))
}

/** Поиск с ранжированием: точное совпадение названия важнее совпадения в описании */
export function searchProducts(list: Product[], query: string): Product[] {
  const q = expand(query)
  if (!q) return list
  const terms = q.split(' ').filter(Boolean)
  return list
    .map((p) => {
      const name = normalize(p.name)
      const hay = haystack(p)
      let score = 0
      for (const t of terms) {
        if (name.includes(t)) score += name.startsWith(t) ? 6 : 4
        else if (hay.includes(t)) score += 1
        else return { p, score: -1 }
      }
      if (name === q) score += 10
      return { p, score }
    })
    .filter((r) => r.score >= 0)
    .sort((a, b) => b.score - a.score || b.p.year - a.p.year)
    .map((r) => r.p)
}

export type SortMode = 'popular' | 'price-asc' | 'price-desc' | 'new'

export interface Filters {
  q: string
  category: CategoryId | 'all'
  sub: string
  min: number
  max: number
  sort: SortMode
}

export function applyFilters(list: Product[], f: Filters): Product[] {
  let out = f.q ? searchProducts(list, f.q) : list.slice()
  if (f.category !== 'all') out = out.filter((p) => p.category === f.category)
  if (f.category === 'accessories' && f.sub) out = out.filter((p) => p.sub === f.sub)
  out = out.filter((p) => p.price >= f.min && p.price <= f.max)
  switch (f.sort) {
    case 'price-asc':
      out.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      out.sort((a, b) => b.price - a.price)
      break
    case 'new':
      out.sort((a, b) => b.year - a.year)
      break
    default:
      if (!f.q) out.sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.year - a.year)
  }
  return out
}
