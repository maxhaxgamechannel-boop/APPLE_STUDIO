import { useUI } from '@/store/ui'

let cached: boolean | null = null

/** Проверяет поддержку WebGL один раз за сессию */
export function detectWebGL(): boolean {
  if (cached !== null) return cached
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl =
      (canvas.getContext('webgl2') as WebGLRenderingContext | null) ||
      (canvas.getContext('webgl') as WebGLRenderingContext | null)
    cached = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    cached = false
  }
  return cached
}

/** true — можно показывать 3D: браузер поддерживает WebGL и сцены не падали */
export function useWebGL() {
  const failed = useUI((s) => s.webglFailed)
  return detectWebGL() && !failed
}
