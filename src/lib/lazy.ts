import { lazy, type ComponentType } from 'react'

/**
 * React.lazy с повтором: если чанк не загрузился (сеть, новая версия сайта после деплоя),
 * пробуем ещё раз, а при повторной неудаче один раз перезагружаем страницу.
 */
export function lazyRetry<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>, name: string) {
  return lazy(async () => {
    const key = `apple-studio-reload:${name}`
    try {
      const mod = await factory()
      sessionStorage.removeItem(key)
      return mod
    } catch (first) {
      try {
        await new Promise((r) => setTimeout(r, 600))
        return await factory()
      } catch {
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1')
          window.location.reload()
        }
        throw first
      }
    }
  })
}
