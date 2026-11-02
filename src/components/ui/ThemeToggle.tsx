import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '@/store/theme'
import { cn } from '@/lib/format'

/** Переключатель темы: солнце ↔ луна с мягкой анимацией поворота */
export function ThemeToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const theme = useTheme((s) => s.theme)
  const toggle = useTheme((s) => s.toggle)
  const dark = theme === 'dark'
  const label = dark ? 'Включить светлую тему' : 'Включить тёмную тему'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        'group relative inline-flex h-10 items-center gap-2 rounded-full text-ink-2 transition-colors hover:bg-ink/[0.06] hover:text-ink',
        withLabel ? 'px-4' : 'w-10 justify-center',
        className,
      )}
    >
      <span className="relative block h-[19px] w-[19px]">
        <AnimatePresence mode="wait" initial={false}>
          {dark ? (
            <motion.svg
              key="moon"
              viewBox="0 0 24 24"
              className="absolute inset-0 h-full w-full"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden
            >
              <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              viewBox="0 0 24 24"
              className="absolute inset-0 h-full w-full"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              initial={{ rotate: 90, scale: 0.4, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>
      {withLabel && <span className="text-sm">{dark ? 'Светлая тема' : 'Тёмная тема'}</span>}
    </button>
  )
}
