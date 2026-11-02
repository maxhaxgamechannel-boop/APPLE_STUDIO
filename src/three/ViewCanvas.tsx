import { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { View } from '@react-three/drei'
import * as THREE from 'three'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useUI } from '@/store/ui'
import { getPerfProfile } from '@/hooks/usePerformance'

/**
 * Рендер по требованию. Канвас перерисовывается только когда что-то меняется:
 * прокрутка, изменение размеров, анимации DOM (framer-motion меняет style/class),
 * или сами модели просят кадр (наведение, вращение по клику, раскрытие).
 * В покое GPU не нагружается вовсе — это убирает лаги на слабых компьютерах.
 */
function DemandDriver() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    let raf = 0
    let until = 0
    const loop = () => {
      invalidate()
      if (performance.now() < until) raf = requestAnimationFrame(loop)
      else raf = 0
    }
    const kick = (ms: number) => {
      until = Math.max(until, performance.now() + ms)
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const onScroll = () => kick(250)
    // capture: ловим прокрутку и вложенных контейнеров (горизонтальные карусели)
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onScroll)
    const mo = new MutationObserver(() => kick(350))
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'class'] })
    kick(1500)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('resize', onScroll)
      mo.disconnect()
    }
  }, [invalidate])
  return null
}

/**
 * Единый прозрачный канвас поверх страницы. Все превью товаров (drei View)
 * рисуются в нём ножницами (scissor) в границах своих DOM-элементов.
 * pointer-events: none — канвас не мешает кликам по интерфейсу.
 */
export default function ViewCanvas() {
  const setFailed = useUI((s) => s.setWebglFailed)
  const { maxDpr } = getPerfProfile()
  return (
    <ErrorBoundary onError={() => setFailed(true)}>
      <Canvas
        className="view-canvas"
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 30 }}
        frameloop="demand"
        dpr={[1, Math.min(maxDpr, 1.75)]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
        eventSource={document.getElementById('root') ?? undefined}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            console.warn('[APPLE STUDIO] WebGL-контекст потерян — переключаемся на иллюстрации')
            setFailed(true)
          })
        }}
      >
        <View.Port />
        <DemandDriver />
      </Canvas>
    </ErrorBoundary>
  )
}
