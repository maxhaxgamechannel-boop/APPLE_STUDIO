import { useEffect } from 'react'
import { ButtonLink } from '@/components/ui/Button'

export default function NotFound() {
  useEffect(() => {
    document.title = 'Страница не найдена — APPLE STUDIO'
  }, [])
  return (
    <div className="container-x grid min-h-[80vh] place-items-center pt-28 text-center">
      <div>
        <p className="display text-[clamp(6rem,20vw,12rem)] leading-none text-ink/[0.07]">404</p>
        <h1 className="display -mt-6 text-4xl">Страница не найдена</h1>
        <p className="mt-3 text-mute">Возможно, ссылка устарела или товар снят с продажи.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink to="/" variant="dark">
            На главную
          </ButtonLink>
          <ButtonLink to="/catalog" variant="ghost">
            В каталог
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}
