import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Что показать вместо упавшего блока */
  fallback?: ReactNode | ((reset: () => void) => ReactNode)
  /** При изменении значения граница сбрасывается (например, при смене страницы) */
  resetKey?: unknown
  onError?: (error: Error) => void
}

interface State {
  error: Error | null
}

/**
 * Изолирует сбои: если 3D-сцена или страница бросит исключение,
 * остальной сайт продолжит работать, а пользователь увидит аккуратную замену
 * вместо пустого белого экрана.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[APPLE STUDIO] Ошибка в компоненте:', error, info.componentStack)
    this.props.onError?.(error)
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null })
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      const { fallback } = this.props
      if (typeof fallback === 'function') return fallback(this.reset)
      return fallback ?? null
    }
    return this.props.children
  }
}

/** Экран ошибки страницы */
export function PageError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="container-x grid min-h-[70vh] place-items-center pt-28 text-center">
      <div>
        <p className="eyebrow">Что-то пошло не так</p>
        <h1 className="display mt-3 text-4xl">Не удалось показать страницу</h1>
        <p className="mx-auto mt-3 max-w-md text-mute">Мы уже изолировали ошибку — остальной сайт работает. Попробуйте ещё раз или перезагрузите страницу.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={onRetry} className="inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-medium text-paper transition hover:bg-ink-2">
            Повторить
          </button>
          <button type="button" onClick={() => window.location.reload()} className="inline-flex h-11 items-center rounded-full bg-mist px-6 text-sm font-medium text-ink transition hover:bg-line">
            Перезагрузить
          </button>
        </div>
      </div>
    </div>
  )
}
