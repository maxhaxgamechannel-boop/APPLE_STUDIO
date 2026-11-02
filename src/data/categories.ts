import type { CategoryId, ModelConfig } from '@/types'

export interface Category {
  id: CategoryId
  title: string
  path: string
  lead: string
  model: ModelConfig
  color: string
}

export const categories: Category[] = [
  {
    id: 'iphone',
    title: 'iPhone',
    path: '/catalog/iphone',
    lead: 'От iPhone 16 до складного iPhone Duo',
    model: { kind: 'phone', variant: 'pro18' },
    color: '#6b2a33',
  },
  {
    id: 'ipad',
    title: 'iPad',
    path: '/catalog/ipad',
    lead: 'Тонкие, мощные, с поддержкой Apple Pencil',
    model: { kind: 'tablet', variant: 'pro' },
    color: '#2e2e30',
  },
  {
    id: 'mac',
    title: 'Mac',
    path: '/catalog/mac',
    lead: 'MacBook, iMac и Mac mini на чипах Apple',
    model: { kind: 'laptop', variant: 'pro' },
    color: '#2f3033',
  },
  {
    id: 'watch',
    title: 'Apple Watch',
    path: '/catalog/watch',
    lead: 'Здоровье, спорт и связь на запястье',
    model: { kind: 'watch', variant: 'ultra' },
    color: '#b7aa98',
  },
  {
    id: 'airpods',
    title: 'AirPods',
    path: '/catalog/airpods',
    lead: 'Звук, который подстраивается под вас',
    model: { kind: 'earbuds', variant: 'pro' },
    color: '#f2f2f2',
  },
  {
    id: 'accessories',
    title: 'Аксессуары',
    path: '/catalog/accessories',
    lead: 'Зарядка, кабели, чехлы и полезные мелочи',
    model: { kind: 'magsafe' },
    color: '#e8e8ea',
  },
]

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>

export const accessorySubs = [
  { id: 'chargers', title: 'Зарядные устройства' },
  { id: 'cables', title: 'Кабели' },
  { id: 'cases', title: 'Чехлы' },
  { id: 'other', title: 'Другое' },
] as const
