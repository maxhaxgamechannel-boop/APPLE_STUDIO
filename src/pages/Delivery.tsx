import { InfoCard, InfoPage } from '@/components/layout/InfoPage'
import { Reveal } from '@/components/ui/Reveal'
import { deliveryOptions, paymentOptions } from '@/data/info'

export default function Delivery() {
  return (
    <InfoPage eyebrow="Покупателям" title="Доставка и оплата" lead="Планируемые условия после запуска магазина. Сейчас оформление работает в демонстрационном режиме.">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight">Способы доставки</h2>
      <div className="overflow-hidden rounded-[28px] border border-line">
        {deliveryOptions.map((d, i) => (
          <Reveal key={d.title} delay={i * 0.05} y={12} className="grid gap-2 border-b border-line p-6 last:border-b-0 md:grid-cols-3 md:items-center">
            <p className="font-semibold">{d.title}</p>
            <p className="text-sm text-mute">{d.time}</p>
            <p className="text-sm md:text-right">{d.price}</p>
          </Reveal>
        ))}
      </div>

      <h2 className="mb-6 mt-16 text-2xl font-semibold tracking-tight">Способы оплаты</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {paymentOptions.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.05}>
            <InfoCard title={p.title}>{p.text}</InfoCard>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16 rounded-[28px] bg-mist p-8 text-sm leading-relaxed text-mute">
        Все цены указаны в евро и включают НДС. Срок доставки отсчитывается с момента подтверждения заказа. При получении проверьте целостность упаковки и комплектность.
      </Reveal>
    </InfoPage>
  )
}
