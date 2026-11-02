import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { InfoCard, InfoPage } from '@/components/layout/InfoPage'
import { ChatIcon, ClockIcon, MailIcon, PinIcon } from '@/components/ui/Icons'
import { Button } from '@/components/ui/Button'
import { store } from '@/data/info'

export default function Contacts() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.name.trim().length < 2) errs.name = 'Укажите имя'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errs.email = 'Проверьте адрес почты'
    if (form.message.trim().length < 10) errs.message = 'Сообщение должно быть не короче 10 символов'
    setErrors(errs)
    if (!Object.keys(errs).length) setSent(true)
  }

  return (
    <InfoPage eyebrow="Контакты" title="Мы на связи." lead="Поможем выбрать устройство, подобрать аксессуары и ответим на вопросы о доставке.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard title="Почта" icon={<MailIcon size={26} />}>
          {store.email}
        </InfoCard>
        <InfoCard title="Телефон" icon={<ChatIcon size={26} />}>
          {store.phone}
          <br />
          <span className="text-xs">Номер-заглушка до запуска магазина</span>
        </InfoCard>
        <InfoCard title="Часы работы" icon={<ClockIcon size={26} />}>
          {store.hours}
        </InfoCard>
        <InfoCard title="Шоурум" icon={<PinIcon size={26} />}>
          {store.address}
        </InfoCard>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="display text-[clamp(1.8rem,3.5vw,2.8rem)]">Напишите нам</h2>
          <p className="mt-4 leading-relaxed text-mute">
            Форма работает в демонстрационном режиме: сообщение проверяется, но никуда не отправляется, пока не подключён почтовый сервер.
          </p>
        </div>
        <div className="rounded-[28px] bg-mist p-6 md:p-8">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-10 text-center">
                <p className="text-2xl font-semibold">Сообщение проверено</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-mute">В демо-режиме оно не отправлено. После запуска магазина ответ придёт на {form.email}.</p>
                <Button variant="ghost" className="mt-6 bg-card!" onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }) }}>
                  Написать ещё
                </Button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} noValidate className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {(['name', 'email'] as const).map((k) => (
                  <label key={k} className="block">
                    <span className="mb-1.5 block text-sm font-medium">{k === 'name' ? 'Имя' : 'Электронная почта'}</span>
                    <input className="field" type={k === 'email' ? 'email' : 'text'} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} aria-invalid={errors[k] ? 'true' : 'false'} />
                    {errors[k] && <span className="mt-1 block text-xs text-danger">{errors[k]}</span>}
                  </label>
                ))}
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium">Сообщение</span>
                  <textarea className="field min-h-32" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} aria-invalid={errors.message ? 'true' : 'false'} />
                  {errors.message && <span className="mt-1 block text-xs text-danger">{errors.message}</span>}
                </label>
                <Button type="submit" size="lg" variant="dark" className="w-full">
                  Отправить
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </InfoPage>
  )
}
