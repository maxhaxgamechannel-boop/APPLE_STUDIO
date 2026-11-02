import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { ContactShadows, Sparkles } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import { Phone } from './models/Phone'
import { Studio } from './Studio'
import type { DeviceFinish } from './models/parts'
import { getPerfProfile } from '@/hooks/usePerformance'

export type HeroCaption = 'intro' | 'front' | 'back' | 'side' | 'done'

interface HeroProps {
  /** Можно запускать вступительный вылет (заставка закончилась) */
  start: boolean
  /** Каждое увеличение запускает демонстрацию: задняя панель → грань → фронт */
  playKey: number
  finish: DeviceFinish
  isMobile: boolean
  reducedMotion: boolean
  /** Сцена видна на экране; иначе рендер ставится на паузу */
  active: boolean
  onPhoneClick: () => void
  onCaption?: (c: HeroCaption) => void
}

const PHONE_SCALE = 1.25
const PHONE_H = 1.6 * PHONE_SCALE
const PHONE_W = 0.766 * PHONE_SCALE
const FOV = 30

/** Расстояние камеры, при котором телефон целиком помещается в кадр с запасом под вращение */
function fitDistance(aspect: number) {
  const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
  const byHeight = (PHONE_H * 1.22) / 2 / t
  const byWidth = (PHONE_W * 1.9) / 2 / (t * aspect)
  return Math.max(byHeight, byWidth)
}

/**
 * Кинематографическая сцена главного экрана.
 * 1) Вступление (GSAP): смартфон вылетает из глубины с оборотом, камера наезжает.
 * 2) Покой: красивая поза, лёгкое «дыхание» и параллакс за курсором.
 * 3) Клик по телефону: демонстрация задней панели, боковой грани и возврат к фронту.
 * Прокрутка страницы моделью не управляет.
 */
function HeroRig({ start, playKey, finish, isMobile, reducedMotion, onPhoneClick, onCaption }: Omit<HeroProps, 'active'>) {
  const intro = useRef<THREE.Group>(null) // вылет из глубины
  const show = useRef<THREE.Group>(null) // демонстрация по клику
  const idle = useRef<THREE.Group>(null) // покой + курсор
  const { camera, size } = useThree()
  const camK = useRef({ v: 2.4 }) // множитель дистанции камеры (вступительный наезд)
  const sway = useRef({ v: 0 }) // амплитуда «дыхания» (0 во время демонстрации)
  const showTl = useRef<gsap.core.Timeline | null>(null)
  const firstKey = useRef(playKey)
  const hovered = useRef(false)

  // ── Вступление ──
  useEffect(() => {
    const g = intro.current
    if (!g || !start) return
    if (reducedMotion) {
      g.position.set(0, 0, 0)
      g.rotation.set(0, 0, 0)
      g.scale.setScalar(1)
      camK.current.v = 1
      sway.current.v = 0
      onCaption?.('done')
      return
    }
    onCaption?.('intro')
    const tl = gsap.timeline({ onComplete: () => onCaption?.('done') })
    tl.to(g.position, { z: 0, y: 0, x: 0, duration: 2.3, ease: 'expo.out' }, 0)
      .to(g.rotation, { x: 0, y: 0, z: 0, duration: 2.7, ease: 'power4.out' }, 0)
      .to(g.scale, { x: 1, y: 1, z: 1, duration: 2.2, ease: 'expo.out' }, 0)
      .to(camK.current, { v: 1, duration: 2.8, ease: 'power3.inOut' }, 0.1)
      .to(sway.current, { v: 1, duration: 1.2, ease: 'sine.out' }, 1.8)
    return () => {
      tl.kill()
    }
  }, [start, reducedMotion, onCaption])

  // ── Демонстрация по клику (повторяется при каждом нажатии) ──
  useEffect(() => {
    if (playKey === firstKey.current) return
    const s = show.current
    if (!s) return
    showTl.current?.kill()
    // нормализуем текущий угол, чтобы повторный запуск начинался без рывка
    s.rotation.y = ((s.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    if (reducedMotion) {
      s.rotation.set(0, Math.PI, 0)
      onCaption?.('back')
      return
    }
    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        s.rotation.y = 0
        onCaption?.('done')
      },
    })
    tl.to(sway.current, { v: 0, duration: 0.4 }, 0)
      .call(() => onCaption?.('back'), [], 0.1)
      .to(s.rotation, { y: Math.PI, x: 0.1, z: 0, duration: 1.25 }, 0)
      .to(s.scale, { x: 1.07, y: 1.07, z: 1.07, duration: 1.25 }, 0)
      .call(() => onCaption?.('side'), [], 1.9)
      .to(s.rotation, { y: Math.PI * 1.5, x: -0.04, z: 0.07, duration: 1.0 }, 1.75)
      .call(() => onCaption?.('front'), [], 3.1)
      .to(s.rotation, { y: Math.PI * 2, x: 0, z: 0, duration: 1.2 }, 3.05)
      .to(s.position, { y: 0.1, duration: 0.6, ease: 'power2.out' }, 3.05)
      .to(s.position, { y: 0, duration: 0.6, ease: 'power2.in' }, 3.65)
      .to(s.scale, { x: 1, y: 1, z: 1, duration: 0.9 }, 3.35)
      .to(sway.current, { v: 1, duration: 0.8 }, 3.9)
    showTl.current = tl
  }, [playKey, reducedMotion, onCaption])

  useEffect(() => () => void showTl.current?.kill(), [])

  useFrame((state, dt) => {
    const g = idle.current
    if (!g) return
    // камера держит телефон целиком в кадре при любом соотношении сторон
    const targetZ = fitDistance(size.width / Math.max(size.height, 1)) * camK.current.v
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 6, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.05, 6, dt)
    camera.lookAt(0, 0, 0)

    const t = state.clock.elapsedTime
    const allowPointer = !isMobile && !reducedMotion
    const px = allowPointer ? state.pointer.x : 0
    const py = allowPointer ? state.pointer.y : 0
    const a = sway.current.v
    const targetRotY = (Math.sin(t * 0.45) * 0.22 + px * 0.3) * a
    const targetRotX = (-py * 0.12 + Math.sin(t * 0.6) * 0.03) * a
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetRotY, 3, dt)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetRotX, 3, dt)
    g.position.y = reducedMotion ? 0 : Math.sin(t * 0.8) * 0.03 * a
    const s = hovered.current ? 1.025 : 1
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s, 6, dt))
  })

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    hovered.current = true
    document.body.style.cursor = 'pointer'
  }
  const onOut = () => {
    hovered.current = false
    document.body.style.cursor = ''
  }
  useEffect(() => () => void (document.body.style.cursor = ''), [])

  const { lowPower } = getPerfProfile()

  return (
    <>
      <group ref={intro} position={[0, 0.3, -30]} rotation={[0.6, -Math.PI * 2 - 0.6, 0.3]} scale={0.7}>
        <group ref={idle}>
          <group ref={show}>
            <group
              rotation={[0, -0.28, 0]}
              onClick={(e) => {
                e.stopPropagation()
                onPhoneClick()
              }}
              onPointerOver={onOver}
              onPointerOut={onOut}
            >
              <Phone finish={finish} variant="pro18" size={PHONE_SCALE} />
            </group>
          </group>
        </group>
      </group>
      <ContactShadows position={[0, -1.32, 0]} opacity={0.3} scale={6} blur={3} far={3} resolution={lowPower ? 128 : 256} color="#000000" />
      {!reducedMotion && !lowPower && <Sparkles count={isMobile ? 14 : 32} scale={[5, 4, 3]} size={1.5} speed={0.25} opacity={0.3} color="#b8b8c0" />}
    </>
  )
}

export default function HeroScene({ active, ...props }: HeroProps) {
  const { maxDpr } = getPerfProfile()
  return (
    <Canvas
      // вне экрана сцена не рендерится вовсе — главная не грузит GPU при прокрутке ниже
      frameloop={active ? 'always' : 'never'}
      dpr={[1, Math.min(maxDpr, props.isMobile ? 1.5 : 2)]}
      camera={{ position: [0, 0, 12], fov: FOV, near: 0.1, far: 120 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: 'high-performance' }}
      style={{ touchAction: 'pan-y' }}
      onPointerMissed={() => undefined}
    >
      <Studio resolution={props.isMobile ? 128 : 256} intensity={1.05} />
      <HeroRig {...props} />
    </Canvas>
  )
}
