import { useCallback, useSyncExternalStore } from 'react'

export function useMediaQuery(query: string) {
  // Стабильная подписка: не переподписываемся на каждый рендер
  const subscribe = useCallback(
    (cb: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', cb)
      return () => mql.removeEventListener('change', cb)
    },
    [query],
  )
  const get = useCallback(() => window.matchMedia(query).matches, [query])
  return useSyncExternalStore(subscribe, get, () => false)
}

export const useIsMobile = () => useMediaQuery('(max-width: 767px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
export const useCoarsePointer = () => useMediaQuery('(pointer: coarse)')
