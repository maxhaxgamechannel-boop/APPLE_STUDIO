import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/format'

type Variant = 'primary' | 'dark' | 'ghost' | 'outline' | 'link'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-2 shadow-[0_8px_24px_-8px_rgba(0,113,227,0.55)]',
  dark: 'bg-ink text-paper hover:bg-ink-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)]',
  ghost: 'bg-mist text-ink hover:bg-line',
  outline: 'border border-ink/15 text-ink hover:border-ink/40 bg-card/60',
  link: 'text-accent hover:underline px-0! h-auto!',
}
const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[15px]',
  lg: 'h-14 px-8 text-base',
}

const baseCls =
  'relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-[-0.01em] transition-all duration-300 ease-[var(--ease-premium)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, children, ...props },
  ref,
) {
  return (
    <button ref={ref} className={cn(baseCls, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
})

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: LinkProps & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <Link className={cn(baseCls, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  )
}
