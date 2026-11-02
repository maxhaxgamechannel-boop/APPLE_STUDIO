import { InfoCard, InfoPage } from '@/components/layout/InfoPage'
import { Reveal } from '@/components/ui/Reveal'
import { CubeIcon, ShieldIcon, SparkIcon, TruckIcon } from '@/components/ui/Icons'
import { ButtonLink } from '@/components/ui/Button'
import { products } from '@/data/products'
import { categories } from '@/data/categories'

export default function About() {
  const stats = [
    { value: String(products.length), label: 'товаров в каталоге' },
    { value: String(categories.length), label: 'категорий' },
    { value: '100%', label: 'моделей в 3D' },
    { value: '0', label: 'внешних 3D-файлов' },
  ]
  return (
    <InfoPage
      eyebrow="О магазине"
      title="Технику нужно увидеть."
      lead="APPLE STUDIO — концепция премиального магазина техники Apple, где каждое устройство можно покрутить, приблизить и рассмотреть в любом цвете ещё до покупки."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06} className="rounded-[28px] border border-line p-7">
            <p className="display text-5xl">{s.value}</p>
            <p className="mt-2 text-sm text-mute">{s.label}</p>
          </Reveal>
        ))}
      </div>

      <div className="mt-20 grid gap-12 lg:grid-cols-2">
        <Reveal>
          <h2 className="display text-[clamp(1.8rem,3.5vw,2.8rem)]">Наш подход</h2>
          <p className="mt-5 leading-relaxed text-mute">
            Мы верим, что выбор техники — это не таблица характеристик, а ощущение. Поэтому вместо плоских фотографий в APPLE STUDIO — живые 3D-модели, построенные прямо в браузере: металл рамок, стекло экранов, объективы камер и кнопки.
          </p>
          <p className="mt-4 leading-relaxed text-mute">
            Мы публикуем только подтверждённые характеристики. Если производитель ещё не раскрыл параметр — мы его не придумываем. Цены на сайте — ориентировочные цены магазина в евро.
          </p>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2">
          <InfoCard title="Интерактивное 3D" icon={<CubeIcon size={26} />}>Вращение, масштаб, ракурсы и смена цвета на странице каждого товара.</InfoCard>
          <InfoCard title="Честные данные" icon={<SparkIcon size={26} />}>Только официально подтверждённые характеристики.</InfoCard>
          <InfoCard title="Доставка по ЕС" icon={<TruckIcon size={26} />}>Курьер по Германии и странам Евросоюза, самовывоз.</InfoCard>
          <InfoCard title="Гарантия" icon={<ShieldIcon size={26} />}>Гарантия производителя и законная гарантия продавца в ЕС.</InfoCard>
        </div>
      </div>

      <Reveal className="mt-20 rounded-[32px] bg-mist p-8 md:p-12">
        <h2 className="text-2xl font-semibold tracking-tight">Важно знать</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-mute">
          APPLE STUDIO — независимый демонстрационный проект и не является официальным магазином или партнёром Apple Inc. Оформление заказа работает в демо-режиме без реальной оплаты.
        </p>
        <ButtonLink to="/catalog" variant="dark" className="mt-6">
          Смотреть каталог
        </ButtonLink>
      </Reveal>
    </InfoPage>
  )
}
