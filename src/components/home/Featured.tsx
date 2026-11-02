import { useRef } from 'react'
import { featuredProducts } from '@/data/products'
import { ProductCard } from '../product/ProductCard'
import { SectionHeading } from '../ui/Reveal'
import { ArrowRight } from '../ui/Icons'
import { ButtonLink } from '../ui/Button'

export function Featured() {
  const track = useRef<HTMLDivElement>(null)
  const scroll = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * (track.current.clientWidth * 0.8), behavior: 'smooth' })

  return (
    <section className="relative bg-mist py-28 md:py-36">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading align="left" eyebrow="Выбор APPLE STUDIO" title="Хиты сезона." />
          <div className="flex gap-2">
            <button type="button" onClick={() => scroll(-1)} className="grid h-11 w-11 place-items-center rounded-full bg-card shadow-sm transition hover:shadow-md" aria-label="Прокрутить назад">
              <ArrowRight size={18} className="rotate-180" />
            </button>
            <button type="button" onClick={() => scroll(1)} className="grid h-11 w-11 place-items-center rounded-full bg-card shadow-sm transition hover:shadow-md" aria-label="Прокрутить вперёд">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <div ref={track} className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-6 md:px-[max(2rem,calc((100vw-1240px)/2+2rem))]">
        {featuredProducts.map((p, i) => (
          <div key={p.slug} className="w-[82vw] shrink-0 snap-start sm:w-[360px]">
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
      <div className="container-x mt-8">
        <ButtonLink to="/catalog" variant="dark">
          Весь каталог <ArrowRight size={16} />
        </ButtonLink>
      </div>
    </section>
  )
}
