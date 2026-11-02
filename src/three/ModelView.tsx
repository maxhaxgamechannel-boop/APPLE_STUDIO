import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, View } from '@react-three/drei'
import * as THREE from 'three'
import { FramedDevice, type DeviceModelProps } from './DeviceModel'
import { ViewLights } from './Studio'

export interface ModelViewProps extends DeviceModelProps {
  className?: string
  /** Курсор над карточкой — модель слегка поворачивается к курсору */
  active?: boolean
  /** Каждое увеличение запускает эффектный оборот модели (по клику) */
  playKey?: number
  distance?: number
  /** Наклон и разворот модели в кадре */
  tilt?: [number, number]
  reducedMotion?: boolean
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const SPIN_TIME = 1.5

function Rig({
  active,
  playKey = 0,
  tilt = [0.12, 0],
  reducedMotion,
  watch,
  children,
}: Pick<ModelViewProps, 'active' | 'playKey' | 'tilt' | 'reducedMotion'> & { watch?: unknown; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null)
  const invalidate = useThree((s) => s.invalidate)
  const spin = useRef(1) // 0..1 — прогресс оборота; 1 — покой
  const firstKey = useRef(playKey)

  // Клик по модели: запускаем оборот на 360° с лёгким «подскоком»
  useEffect(() => {
    if (playKey === firstKey.current) return
    spin.current = reducedMotion ? 1 : 0
    invalidate()
  }, [playKey, reducedMotion, invalidate])

  // Любое изменение входных данных — просим кадр (рендер по требованию)
  useEffect(() => {
    invalidate()
  }, [active, watch, invalidate])

  useFrame((state, dt) => {
    const o = g.current
    if (!o) return
    let busy = false
    if (spin.current < 1) {
      spin.current = Math.min(1, spin.current + dt / SPIN_TIME)
      busy = true
    }
    const k = easeInOutCubic(spin.current)
    const spinOffset = spin.current < 1 ? k * Math.PI * 2 : 0
    const bump = Math.sin(spin.current * Math.PI)

    const targetY = tilt[1] + (active && !reducedMotion ? state.pointer.x * 0.35 : 0)
    const targetX = tilt[0] + (active && !reducedMotion ? -state.pointer.y * 0.15 : 0) - bump * 0.12
    const targetS = (active ? 1.05 : 1) + bump * 0.06

    const base = (o.userData.baseY as number | undefined) ?? targetY
    const nextBase = THREE.MathUtils.damp(base, targetY, 5, dt)
    o.userData.baseY = nextBase
    o.rotation.y = nextBase + spinOffset
    o.rotation.x = THREE.MathUtils.damp(o.rotation.x, targetX, 5, dt)
    o.position.y = bump * 0.12
    const s = THREE.MathUtils.damp(o.scale.x, targetS, 6, dt)
    o.scale.setScalar(s)

    if (active || busy || Math.abs(nextBase - targetY) > 1e-4 || Math.abs(o.rotation.x - targetX) > 1e-4 || Math.abs(s - targetS) > 1e-4) invalidate()
  })
  return <group ref={g}>{children}</group>
}

/**
 * 3D-превью в общем полноэкранном канвасе (drei View): десятки карточек
 * используют один WebGL-контекст, а невидимые вьюпорты не рендерятся.
 */
export default function ModelView({ className, active, playKey, distance = 4.4, tilt, reducedMotion, ...device }: ModelViewProps) {
  return (
    <View className={className}>
      <PerspectiveCamera makeDefault position={[0, 0.15, distance]} fov={30} />
      <ViewLights />
      <Rig active={active} playKey={playKey} tilt={tilt} reducedMotion={reducedMotion} watch={`${device.finish.frame}|${device.finish.back}|${device.state}`}>
        <FramedDevice {...device} />
      </Rig>
    </View>
  )
}
