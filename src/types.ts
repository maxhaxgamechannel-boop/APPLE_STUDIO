export type CategoryId = 'iphone' | 'ipad' | 'mac' | 'watch' | 'airpods' | 'accessories'

export type ModelKind =
  | 'phone'
  | 'fold'
  | 'laptop'
  | 'imac'
  | 'mini'
  | 'tablet'
  | 'watch'
  | 'earbuds'
  | 'headphones'
  | 'charger'
  | 'cable'
  | 'magsafe'
  | 'case'
  | 'tag'
  | 'pencil'

/** Цветовое исполнение: swatch — для интерфейса, остальное — для 3D-материалов */
export interface ProductColor {
  name: string
  swatch: string
  /** Рамка / корпус (металл) */
  frame: string
  /** Задняя панель / второстепенная поверхность */
  back: string
  /** Акцент (кнопка, ремешок, линзы) */
  accent?: string
}

export interface OptionItem {
  label: string
  /** Надбавка к базовой цене, ₽ */
  delta: number
}

export interface OptionGroup {
  title: string
  items: OptionItem[]
}

export interface SpecGroup {
  title: string
  rows: [string, string][]
}

export interface Highlight {
  title: string
  text: string
}

export interface ModelConfig {
  kind: ModelKind
  /** Вариант геометрии: камеры, размеры, исполнение */
  variant?: string
  /** Множитель размера (например, Pro Max крупнее Pro) */
  size?: number
}

export interface Product {
  slug: string
  category: CategoryId
  /** Подкатегория для аксессуаров */
  sub?: 'chargers' | 'cables' | 'cases' | 'other'
  name: string
  tagline: string
  description: string
  price: number
  badge?: string
  year: number
  colors: ProductColor[]
  options: OptionGroup[]
  highlights: Highlight[]
  specs: SpecGroup[]
  model: ModelConfig
  /** Примечание об источнике данных / наличии */
  note?: string
  featured?: boolean
}

export interface CartItem {
  key: string
  slug: string
  name: string
  color: string
  colorSwatch: string
  options: string[]
  price: number
  qty: number
  kind: ModelKind
}
