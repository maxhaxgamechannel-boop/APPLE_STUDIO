import { InfoCard, InfoPage } from '@/components/layout/InfoPage'
import { Reveal } from '@/components/ui/Reveal'
import { warrantyPoints } from '@/data/info'

const steps = ['Свяжитесь с нами по почте или телефону', 'Опишите проблему и приложите номер заказа', 'Получите инструкцию по отправке или визиту в сервис', 'Мы сопровождаем обращение до решения']

export default function Warranty() {
  return (
    <InfoPage eyebrow="Покупателям" title="Гарантия и возврат" lead="Понятные условия без мелкого шрифта. Ниже — общие принципы; детали конкретного случая подскажет консультант.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {warrantyPoints.map((w, i) => (
          <Reveal key={w.title} delay={i * 0.06}>
            <InfoCard title={w.title}>{w.text}</InfoCard>
          </Reveal>
        ))}
      </div>
      <h2 className="mb-8 mt-20 text-2xl font-semibold tracking-tight">Как обратиться по гарантии</h2>
      <ol className="grid gap-5 md:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s} delay={i * 0.08} className="relative rounded-[28px] border border-line p-7">
            <span className="display text-5xl text-silver">{String(i + 1).padStart(2, '0')}</span>
            <p className="mt-4 font-medium leading-snug">{s}</p>
          </Reveal>
        ))}
      </ol>
      <Reveal className="mt-16 rounded-[28px] bg-mist p-8 text-sm leading-relaxed text-mute">
        Информация носит справочный характер и не является юридической консультацией. Точные условия гарантии определяются документами производителя и законодательством страны покупателя.
      </Reveal>
    </InfoPage>
  )
}
