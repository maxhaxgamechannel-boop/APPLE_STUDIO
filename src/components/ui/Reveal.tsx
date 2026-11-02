import { motion, type HTMLMotionProps } from 'framer-motion'

/** Плавное появление блока при попадании в область видимости */
export function Reveal({
  delay = 0,
  y = 28,
  children,
  className,
  ...props
}: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeading({ eyebrow, title, lead, align = 'center' }: { eyebrow?: string; title: React.ReactNode; lead?: React.ReactNode; align?: 'center' | 'left' }) {
  return (
    <Reveal className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 className="display text-[clamp(2.1rem,5vw,3.8rem)] text-gradient">{title}</h2>
      {lead && <p className="mt-5 text-[clamp(1.02rem,1.6vw,1.25rem)] leading-relaxed text-mute">{lead}</p>}
    </Reveal>
  )
}
