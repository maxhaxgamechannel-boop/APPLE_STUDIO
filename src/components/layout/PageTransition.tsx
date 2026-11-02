import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/** Переход между страницами: мягкое затухание с лёгким подъёмом и размытием */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen"
    >
      {children}
    </motion.main>
  )
}

export function PageLoader() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-silver border-t-ink" aria-label="Загрузка" />
    </div>
  )
}
