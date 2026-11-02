import { Suspense } from 'react'
import { lazyRetry } from '@/lib/lazy'
import type { ModelConfig, ProductColor } from '@/types'
import { useWebGL } from '@/hooks/useWebGL'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { DeviceSilhouette } from './DeviceSilhouette'
import { cn } from '@/lib/format'
import { ErrorBoundary } from '../ErrorBoundary'

const ModelView = lazyRetry(() => import('@/three/ModelView'), 'ModelView')

interface Props {
  model: ModelConfig
  color: ProductColor
  className?: string
  active?: boolean
  /** Увеличение значения запускает оборот модели (по клику) */
  playKey?: number
  distance?: number
  state?: number
  openRef?: { current: number }
  tilt?: [number, number]
}

/**
 * Визуал товара: живая 3D-модель в общем канвасе, а без WebGL —
 * аккуратная векторная иллюстрация. 3D-модуль подгружается лениво.
 */
export function ProductVisual({ model, color, className, active, playKey, distance, state, openRef, tilt }: Props) {
  const webgl = useWebGL()
  const reduced = usePrefersReducedMotion()
  const fallback = (
    <div className={cn('grid place-items-center p-6', className)}>
      <DeviceSilhouette kind={model.kind} color={color.swatch} className="max-h-full max-w-[70%] opacity-90" />
    </div>
  )
  if (!webgl) return fallback
  return (
    <ErrorBoundary fallback={fallback}>
    <Suspense fallback={fallback}>
      <ModelView
        className={className}
        kind={model.kind}
        variant={model.variant}
        size={model.size}
        finish={{ frame: color.frame, back: color.back, accent: color.accent, swatch: color.swatch }}
        active={active}
        playKey={playKey}
        distance={distance}
        state={state}
        openRef={openRef}
        tilt={tilt}
        reducedMotion={reduced}
      />
    </Suspense>
    </ErrorBoundary>
  )
}
