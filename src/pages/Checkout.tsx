import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cartTotal, useCart } from '@/store/cart'
import { formatPrice, cn } from '@/lib/format'
import { LAST_ORDER_KEY, validate, type CheckoutForm, type Errors } from '@/lib/validation'
import { Button, ButtonLink } from '@/components/ui/Button'
import { DeviceSilhouette } from '@/components/product/DeviceSilhouette'

const DELIVERY = [
  { id: 'courier', title: 'Курьер', note: '1–2 рабочих дня', price: (t: number) => (t >= 50 ? 0 : 4.9) },
  { id: 'express', title: 'Экспресс', note: 'В день заказа', price: () => 14.9 },
  { id: 'pickup', title: 'Самовывоз', note: 'Из шоурума', price: () => 0 },
] as const

const PAYMENT = [
  { id: 'card', title: 'Банковская карта' },
  { id: 'applepay', title: 'Apple Pay / Google Pay' },
  { id: 'invoice', title: 'Банковский перевод' },
] as const

const initial: CheckoutForm = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  city: '',
  address: '',
  delivery: 'courier',
  payment: 'card',
  comment: '',
  agree: false,
}

export default function Checkout() {
  const items = useCart((s) => s.items)
  const clear = useCart((s) => s.clear)
  const navigate = useNavigate()
  const [form, setForm] = useState<CheckoutForm>(initial)
  const [touched, setTouched] = useState<Partial<Record<keyof CheckoutForm, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    document.title = 'Оформление заказа — APPLE STUDIO'
  }, [])

  const errors: Errors = useMemo(() => validate(form), [form])
  const subtotal = cartTotal(items)
  const delivery = DELIVERY.find((d) => d.id === form.delivery)!.price(subtotal)
  const total = subtotal + delivery

  const set = <K extends keyof CheckoutForm>(k: K, v: CheckoutForm[K]) => setForm((f) => ({ ...f, [k]: v }))
  const showError = (k: keyof CheckoutForm) => (touched[k] || submitted) && errors[k]

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length) {
      const first = document.querySelector('[aria-invalid="true"]') as HTMLElement | null
      first?.focus()
      return
    }
    setProcessing(true)
    // Демо-режим: заказ НЕ отправляется на сервер. Сохраняем сводку локально, чтобы показать её на странице успеха.
    const order = {
      number: `AS-DEMO-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      createdAt: new Date().toISOString(),
      customer: { name: `${form.firstName} ${form.lastName}`, email: form.email, city: form.city },
      delivery: DELIVERY.find((d) => d.id === form.delivery)!.title,
      items: items.map((i) => ({ name: i.name, color: i.color, options: i.options, qty: i.qty, price: i.price })),
      total,
    }
    setTimeout(() => {
      try {
        sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order))
      } catch {
        /* хранилище недоступно */
      }
      clear()
      navigate('/success')
    }, 900)
  }

  if (!items.length && !processing) {
    return (
      <div className="container-x grid min-h-[70vh] place-items-center pt-28 text-center">
        <div>
          <h1 className="display text-4xl">Корзина пуста</h1>
          <p className="mt-3 text-mute">Добавьте товары, чтобы оформить заказ.</p>
          <ButtonLink to="/catalog" variant="dark" className="mt-6">
            Перейти в каталог
          </ButtonLink>
        </div>
      </div>
    )
  }

  const field = (k: keyof CheckoutForm, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        className="field"
        value={form[k] as string}
        onChange={(e) => set(k, e.target.value as never)}
        onBlur={() => setTouched((t) => ({ ...t, [k]: true }))}
        aria-invalid={showError(k) ? 'true' : 'false'}
        aria-describedby={`${k}-err`}
        {...props}
      />
      <AnimatePresence>
        {showError(k) && (
          <motion.span id={`${k}-err`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-1.5 block text-xs text-danger">
            {errors[k]}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  )

  return (
    <div className="container-x pb-10 pt-28 md:pt-32">
      <h1 className="display text-[clamp(2.4rem,5vw,4rem)] text-gradient">Оформление заказа</h1>
      <div className="mt-5 rounded-2xl border border-[#ffd8b0] bg-[#fff7ee] px-5 py-4 text-sm leading-relaxed text-[#8a4a00] dark:border-[#5a3a14] dark:bg-[#1f160c] dark:text-[#ffc685]">
        <strong>Демонстрационный режим.</strong> Серверная система заказов ещё не подключена: данные не передаются, оплата не списывается, товар не резервируется.
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          <section>
            <h2 className="mb-5 text-xl font-semibold">Контактные данные</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('firstName', 'Имя', { autoComplete: 'given-name' })}
              {field('lastName', 'Фамилия', { autoComplete: 'family-name' })}
              {field('phone', 'Номер телефона', { type: 'tel', autoComplete: 'tel', placeholder: '+49 151 2345 6789', inputMode: 'tel' })}
              {field('email', 'Электронная почта', { type: 'email', autoComplete: 'email', placeholder: 'name@example.com' })}
            </div>
          </section>

          <section>
            <h2 className="mb-5 text-xl font-semibold">Доставка</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {DELIVERY.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => set('delivery', d.id)}
                  aria-pressed={form.delivery === d.id}
                  className={cn('rounded-2xl border p-4 text-left transition-all', form.delivery === d.id ? 'border-accent shadow-[0_0_0_1px_var(--color-accent)]' : 'border-silver hover:border-ink/40')}
                >
                  <span className="block font-semibold">{d.title}</span>
                  <span className="block text-xs text-mute">{d.note}</span>
                  <span className="mt-2 block text-sm">{d.price(subtotal) === 0 ? 'Бесплатно' : formatPrice(d.price(subtotal))}</span>
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_2fr]">
              {field('city', 'Город', { autoComplete: 'address-level2' })}
              {form.delivery !== 'pickup' ? (
                field('address', 'Адрес доставки', { autoComplete: 'street-address', placeholder: 'Улица, дом, квартира, индекс' })
              ) : (
                <div className="rounded-2xl bg-mist p-4 text-sm text-mute">Адрес шоурума будет указан в подтверждении после запуска магазина.</div>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-5 text-xl font-semibold">Способ оплаты</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {PAYMENT.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => set('payment', p.id)}
                  aria-pressed={form.payment === p.id}
                  className={cn('rounded-2xl border p-4 text-left text-sm font-medium transition-all', form.payment === p.id ? 'border-accent shadow-[0_0_0_1px_var(--color-accent)]' : 'border-silver hover:border-ink/40')}
                >
                  {p.title}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-mute">В демо-режиме платёжные данные не запрашиваются.</p>
            <label className="mt-6 block">
              <span className="mb-1.5 block text-sm font-medium">Комментарий к заказу</span>
              <textarea className="field min-h-24" value={form.comment} onChange={(e) => set('comment', e.target.value)} />
            </label>
          </section>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => set('agree', e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded accent-[var(--color-accent)]"
              aria-invalid={showError('agree') ? 'true' : 'false'}
            />
            <span>
              Я понимаю, что это демонстрационный заказ: он не будет отправлен и оплачен.
              {showError('agree') && <span className="mt-1 block text-xs text-danger">{errors.agree}</span>}
            </span>
          </label>
        </div>

        {/* Сводка */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[28px] bg-mist p-6">
            <h2 className="text-xl font-semibold">Ваш заказ</h2>
            <ul className="mt-5 space-y-4">
              {items.map((i) => (
                <li key={i.key} className="flex gap-3">
                  <span className="relative h-16 w-16 shrink-0 rounded-2xl bg-card p-1.5">
                    <DeviceSilhouette kind={i.kind} color={i.colorSwatch} />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-semibold text-paper">{i.qty}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{i.name}</span>
                    <span className="block text-xs text-mute">{[i.color, ...i.options].join(' · ')}</span>
                  </span>
                  <span className="text-sm font-medium tabular-nums">{formatPrice(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-mute">Товары</dt>
                <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mute">Доставка</dt>
                <dd className="tabular-nums">{delivery === 0 ? 'Бесплатно' : new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format(delivery)}</dd>
              </div>
              <div className="flex justify-between pt-2 text-lg font-semibold">
                <dt>Итого</dt>
                <dd className="tabular-nums">{new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format(total)}</dd>
              </div>
            </dl>
            <Button type="submit" size="lg" className="mt-6 w-full" disabled={processing}>
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Формируем…
                </span>
              ) : (
                'Оформить демо-заказ'
              )}
            </Button>
            <Link to="/catalog" className="mt-4 block text-center text-sm text-accent hover:underline">
              Продолжить покупки
            </Link>
          </div>
        </aside>
      </form>
    </div>
  )
}
