import { useId } from 'react'
import { motion } from 'framer-motion'
import type { OptionGroup, ProductColor } from '@/types'
import { cn, formatPrice } from '@/lib/format'

export function ColorSwatches({
  colors,
  value,
  onChange,
  size = 'md',
}: {
  colors: ProductColor[]
  value: number
  onChange: (i: number) => void
  size?: 'sm' | 'md'
}) {
  const d = size === 'sm' ? 'h-5 w-5' : 'h-9 w-9'
  const id = useId()
  return (
    <div className="flex flex-wrap items-center gap-2.5" role="radiogroup" aria-label="Цвет">
      {colors.map((c, i) => (
        <button
          key={c.name}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={c.name}
          title={c.name}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onChange(i)
          }}
          className={cn(
            'relative grid place-items-center rounded-full transition-transform duration-300 hover:scale-110',
            size === 'sm' ? 'h-6 w-6' : 'h-11 w-11',
          )}
        >
          {value === i && (
            <motion.span
              layoutId={`swatch-ring-${id}`}
              className="absolute inset-0 rounded-full border-2 border-accent"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span
            className={cn(d, 'rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.25),inset_0_-1px_1px_rgba(255,255,255,0.5)]')}
            style={{ background: `linear-gradient(145deg, ${c.swatch}, ${c.frame})` }}
          />
        </button>
      ))}
    </div>
  )
}

export function OptionPicker({
  group,
  value,
  onChange,
  base,
}: {
  group: OptionGroup
  value: string
  onChange: (label: string) => void
  base: number
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-ink">{group.title}</legend>
      <div className={cn('grid gap-2.5', group.items.length > 2 ? 'grid-cols-2' : 'grid-cols-2')}>
        {group.items.map((it) => {
          const active = it.label === value
          return (
            <button
              key={it.label}
              type="button"
              onClick={() => onChange(it.label)}
              aria-pressed={active}
              className={cn(
                'relative rounded-2xl border px-4 py-3.5 text-left transition-all duration-300',
                active ? 'border-accent bg-accent/[0.04] shadow-[0_0_0_1px_var(--color-accent)]' : 'border-silver hover:border-ink/40',
              )}
            >
              <span className="block text-[15px] font-semibold">{it.label}</span>
              <span className="mt-0.5 block text-xs text-mute">
                {it.delta === 0 ? `от ${formatPrice(base)}` : `+ ${formatPrice(it.delta)}`}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function QtyStepper({ value, onChange, min = 1, max = 10 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="inline-flex items-center rounded-full border border-silver">
      <button type="button" aria-label="Уменьшить" className="grid h-8 w-8 place-items-center rounded-full text-lg hover:bg-mist disabled:opacity-30" onClick={() => onChange(value - 1)} disabled={value <= min}>
        −
      </button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button type="button" aria-label="Увеличить" className="grid h-8 w-8 place-items-center rounded-full text-lg hover:bg-mist disabled:opacity-30" onClick={() => onChange(value + 1)} disabled={value >= max}>
        +
      </button>
    </div>
  )
}

export function Badge({ children, tone = 'new' }: { children: React.ReactNode; tone?: 'new' | 'muted' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]',
        tone === 'new' ? 'bg-[#fff1e6] text-[#b64400] dark:bg-[#3a2410] dark:text-[#ffb27a]' : 'bg-mist text-mute',
      )}
    >
      {children}
    </span>
  )
}
