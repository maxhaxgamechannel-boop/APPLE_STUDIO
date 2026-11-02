import { useEffect, type ReactNode } from 'react'
import { motion } from 'framer-motion'

/** Общий каркас информационных страниц */
export function InfoPage({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead: ReactNode; children: ReactNode }) {
  useEffect(() => {
    document.title = `${title} — APPLE STUDIO`
  }, [title])
  return (
    <div className="pb-10 pt-28 md:pt-36">
      <div className="container-x">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display mt-3 text-[clamp(2.6rem,6vw,4.8rem)] text-gradient">{title}</h1>
          <p className="mt-5 text-[clamp(1.05rem,1.6vw,1.3rem)] leading-relaxed text-mute">{lead}</p>
        </motion.div>
      </div>
      <div className="container-x mt-16">{children}</div>
    </div>
  )
}

export function InfoCard({ title, children, icon }: { title: string; children: ReactNode; icon?: ReactNode }) {
  return (
    <div className="h-full rounded-[28px] bg-mist p-7 transition-transform duration-500 hover:-translate-y-1">
      {icon && <div className="mb-5 text-ink">{icon}</div>}
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-mute">{children}</div>
    </div>
  )
}
