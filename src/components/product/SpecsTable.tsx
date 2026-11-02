import type { SpecGroup } from '@/types'
import { Reveal } from '../ui/Reveal'

export function SpecsTable({ specs }: { specs: SpecGroup[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {specs.map((g, i) => (
        <Reveal key={g.title} delay={i * 0.04} y={16} className="grid gap-4 py-7 md:grid-cols-[220px_1fr]">
          <h3 className="text-[15px] font-semibold">{g.title}</h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            {g.rows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-[0.08em] text-mute">{k}</dt>
                <dd className="mt-1 text-[15px] leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      ))}
    </div>
  )
}
