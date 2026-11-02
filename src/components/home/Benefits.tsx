import { Reveal } from '../ui/Reveal'
import { CubeIcon, ShieldIcon, SparkIcon, TruckIcon } from '../ui/Icons'
import { ButtonLink } from '../ui/Button'

const items = [
  { icon: CubeIcon, title: 'Каждый товар в 3D', text: 'Вращайте, приближайте и меняйте цвет до покупки.' },
  { icon: TruckIcon, title: 'Доставка по Германии и ЕС', text: 'Бесплатно по Германии при заказе от 50 €.' },
  { icon: ShieldIcon, title: 'Гарантия и возврат', text: 'Гарантия производителя и 14 дней на возврат.' },
  { icon: SparkIcon, title: 'Только проверенные данные', text: 'Характеристики — по официальным источникам.' },
]

export function Benefits() {
  return (
    <section className="container-x relative py-28 md:py-32">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 0.07} className="rounded-[28px] border border-line p-7 transition-colors duration-500 hover:bg-mist">
            <it.icon size={28} className="text-ink" />
            <h3 className="mt-5 text-lg font-semibold tracking-tight">{it.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-mute">{it.text}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="relative mt-20 overflow-hidden cta-band rounded-[36px] px-8 py-16 text-center md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(255,255,255,0.16),transparent)]" />
        <p className="eyebrow relative text-white/60!">APPLE STUDIO</p>
        <h2 className="display relative mx-auto mt-3 max-w-3xl text-[clamp(2rem,5vw,4rem)]">Найдите своё устройство.</h2>
        <p className="relative mx-auto mt-4 max-w-xl text-white/70">Поиск, фильтры по цене и категориям, сравнение цветов в 3D — всё в одном каталоге.</p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink to="/catalog" variant="primary" size="lg">
            Открыть каталог
          </ButtonLink>
          <ButtonLink to="/faq" variant="outline" size="lg" className="border-white/25! bg-transparent! text-white!">
            Вопросы и ответы
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  )
}
