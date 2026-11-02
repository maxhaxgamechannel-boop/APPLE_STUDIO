import { formatPrice } from '@/lib/format'

/** Двойной ползунок диапазона цен на нативных input[type=range] */
export function PriceRange({
  min,
  max,
  value,
  onChange,
  step = 10,
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (v: [number, number]) => void
  step?: number
}) {
  const [lo, hi] = value
  const pct = (v: number) => ((v - min) / (max - min)) * 100
  return (
    <div>
      <div className="relative h-8">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line" />
        <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label="Минимальная цена"
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
          className="range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label="Максимальная цена"
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
          className="range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
        />
      </div>
      <div className="mt-2 flex justify-between text-sm tabular-nums text-ink-2">
        <span>{formatPrice(lo)}</span>
        <span>{formatPrice(hi)}</span>
      </div>
    </div>
  )
}
