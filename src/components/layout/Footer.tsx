import { Link } from 'react-router-dom'
import { Logo } from '../ui/Logo'
import { categories } from '@/data/categories'
import { store } from '@/data/info'

export function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-line bg-mist">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-mute">
            Премиальный магазин техники Apple с интерактивными 3D-презентациями устройств.
          </p>
          <p className="mt-4 text-sm text-ink-2">{store.email}</p>
        </div>
        <FooterCol title="Каталог" links={categories.map((c) => ({ to: c.path, label: c.title }))} />
        <FooterCol
          title="Покупателям"
          links={[
            { to: '/delivery', label: 'Доставка и оплата' },
            { to: '/warranty', label: 'Гарантия и возврат' },
            { to: '/faq', label: 'Вопросы и ответы' },
            { to: '/checkout', label: 'Оформление заказа' },
          ]}
        />
        <FooterCol
          title="APPLE STUDIO"
          links={[
            { to: '/about', label: 'О магазине' },
            { to: '/contacts', label: 'Контакты' },
            { to: '/catalog', label: 'Все товары' },
          ]}
        />
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-3 py-6 text-xs leading-relaxed text-mute md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} APPLE STUDIO. Демонстрационный проект. Не является официальным магазином Apple Inc.</p>
          <p className="max-w-xl md:text-right">
            Apple, iPhone, iPad, Mac, Apple Watch и AirPods — товарные знаки Apple Inc. Цены — ориентировочные цены магазина в евро. 3D-модели процедурные.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.to + l.label}>
            <Link to={l.to} className="link-underline text-sm text-mute transition-colors hover:text-ink">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
