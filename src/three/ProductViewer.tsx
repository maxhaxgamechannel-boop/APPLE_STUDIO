import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { FramedDevice, type DeviceModelProps } from './DeviceModel'
import { Studio } from './Studio'
import { getPerfProfile } from '@/hooks/usePerformance'

export type ViewAngle = 'front' | 'back' | 'side' | 'three-quarter' | 'top'

const ANGLES: Record<ViewAngle, [number, number, number]> = {
  front: [0, 0.2, 4.6],
  back: [0, 0.2, -4.6],
  side: [4.6, 0.2, 0],
  'three-quarter': [3.1, 1.3, 3.3],
  top: [0.01, 4.8, 0.6],
}

export interface ViewerHandle {
  setAngle: (a: ViewAngle) => void
  zoom: (dir: 1 | -1) => void
  reset: () => void
}

interface Props extends DeviceModelProps {
  autoRotate: boolean
  /** Просмотрщик на экране — иначе рендер на паузе */
  active?: boolean
  playKey: number
  onModelClick: () => void
  reducedMotion?: boolean
  onInteract?: () => void
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * Поворотный стол: лёгкий «отскок» при смене цвета, автоповорот (по желанию)
 * и эффектный оборот на 360° с подъёмом — по клику на модель.
 */
function Turntable({
  autoRotate,
  swapKey,
  playKey,
  reducedMotion,
  onModelClick,
  children,
}: {
  autoRotate: boolean
  swapKey: string
  playKey: number
  reducedMotion?: boolean
  onModelClick: () => void
  children: React.ReactNode
}) {
  const g = useRef<THREE.Group>(null)
  const pulse = useRef(0)
  const spin = useRef(1)
  const base = useRef(0)
  const first = useRef(true)
  const firstPlay = useRef(playKey)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    pulse.current = 1
  }, [swapKey])
  useEffect(() => {
    if (playKey !== firstPlay.current && !reducedMotion) spin.current = 0
  }, [playKey, reducedMotion])
  useFrame((_, dt) => {
    if (!g.current) return
    if (autoRotate) base.current += dt * 0.3
    pulse.current = THREE.MathUtils.damp(pulse.current, 0, 4, dt)
    if (spin.current < 1) spin.current = Math.min(1, spin.current + dt / 1.6)
    const k = spin.current < 1 ? easeInOutCubic(spin.current) : 0
    const bump = Math.sin(spin.current * Math.PI)
    g.current.rotation.y = base.current + k * Math.PI * 2
    g.current.rotation.x = -bump * 0.1
    g.current.position.y = bump * 0.15
    g.current.scale.setScalar(1 + Math.sin(pulse.current * Math.PI) * 0.05 + bump * 0.05)
  })
  return (
    <group
      ref={g}
      onClick={(e) => {
        // клик, а не перетаскивание камеры
        if (e.delta > 6) return
        e.stopPropagation()
        onModelClick()
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      {children}
    </group>
  )
}

/**
 * Полноценный 3D-просмотрщик на странице товара:
 * вращение мышью/пальцем, зум колесом и щипком, ракурсы, мягкая контактная тень.
 */
const ProductViewer = forwardRef<ViewerHandle, Props>(function ProductViewer({ active = true, autoRotate, playKey, onModelClick, reducedMotion, onInteract, ...device }, ref) {
  const controls = useRef<CameraControls>(null)

  useImperativeHandle(ref, () => ({
    setAngle: (a) => {
      const [x, y, z] = ANGLES[a]
      controls.current?.setLookAt(x, y, z, 0, 0, 0, !reducedMotion)
    },
    zoom: (dir) => {
      controls.current?.dolly(dir * 0.8, !reducedMotion)
    },
    reset: () => {
      const [x, y, z] = ANGLES['three-quarter']
      controls.current?.setLookAt(x, y, z, 0, 0, 0, !reducedMotion)
    },
  }))

  useEffect(() => () => void (document.body.style.cursor = ''), [])

  useEffect(() => {
    const [x, y, z] = ANGLES['three-quarter']
    controls.current?.setLookAt(x * 1.6, y + 1, z * 1.6, 0, 0, 0, false)
    const id = requestAnimationFrame(() => controls.current?.setLookAt(x, y, z, 0, 0, 0, !reducedMotion))
    return () => cancelAnimationFrame(id)
  }, [reducedMotion])

  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, getPerfProfile().maxDpr]}
      camera={{ position: ANGLES['three-quarter'], fov: 32, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ touchAction: 'none' }}
      onPointerDown={onInteract}
      onWheel={onInteract}
    >
      <Studio resolution={256} />
      <Turntable
        autoRotate={autoRotate && !reducedMotion}
        swapKey={`${device.finish.frame}-${device.finish.back}`}
        playKey={playKey}
        reducedMotion={reducedMotion}
        onModelClick={onModelClick}
      >
        <FramedDevice {...device} />
      </Turntable>
      <ContactShadows position={[0, -1.15, 0]} opacity={0.35} scale={6} blur={2.6} far={2.5} resolution={getPerfProfile().lowPower ? 256 : 384} color="#000000" />
      <CameraControls ref={controls} minDistance={2.2} maxDistance={8} smoothTime={0.35} draggingSmoothTime={0.12} />
    </Canvas>
  )
})

export default ProductViewer
