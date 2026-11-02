import { cn } from '@/lib/format'

/** Собственный знак APPLE STUDIO: «объектив» в скруглённом квадрате + словесный знак */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-7 w-7', className)} aria-hidden>
      <defs>
        <linearGradient id="lm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--logo-a)' }} />
          <stop offset="1" style={{ stopColor: 'var(--logo-b)' }} />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#lm)" />
      <circle cx="16" cy="16" r="7" fill="none" style={{ stroke: 'var(--logo-fg)' }} strokeWidth="1.9" />
      <circle cx="16" cy="16" r="2.4" style={{ fill: 'var(--logo-fg)' }} />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-[0.18em] text-ink">
        APPLE<span className="font-light text-mute"> STUDIO</span>
      </span>
    </span>
  )
}
