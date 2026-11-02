import { useLayoutEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useTheme } from '@/store/theme'

/**
 * Студийный свет без внешних HDR-файлов: окружение собирается из
 * светящихся панелей (Lightformer) — мягкий софтбокс сверху, контровые полосы
 * по бокам и тёплый рефлектор снизу. Используется в «больших» сценах
 * (главный экран, страница товара).
 */
export function Studio({ intensity = 1, resolution = 256 }: { intensity?: number; resolution?: number }) {
  const dark = useTheme((s) => s.theme) === 'dark'
  return (
    <>
      <ambientLight intensity={(dark ? 0.25 : 0.35) * intensity} />
      <directionalLight position={[3, 5, 4]} intensity={(dark ? 1.9 : 1.6) * intensity} />
      <directionalLight position={[-4, 2, -3]} intensity={(dark ? 0.9 : 0.6) * intensity} color="#dfe8ff" />
      {/* key: при смене темы карта окружения пересобирается один раз */}
      <Environment key={dark ? 'd' : 'l'} resolution={resolution} frames={1} environmentIntensity={intensity}>
        <color attach="background" args={[dark ? '#141416' : '#f4f4f6']} />
        <Lightformer form="rect" intensity={dark ? 3.6 : 3} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 6, 1]} />
        <Lightformer form="rect" intensity={2.4} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 1.4, 1]} />
        <Lightformer form="rect" intensity={2.4} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[8, 1.4, 1]} />
        <Lightformer form="rect" intensity={dark ? 0.7 : 1.2} position={[0, 0.5, 6]} scale={[10, 3, 1]} />
        <Lightformer form="ring" color="#fff3e2" intensity={1.6} position={[2, -3, -3]} scale={3} />
        <Lightformer form="rect" color="#202022" intensity={1} position={[0, 1, -6]} scale={[12, 6, 1]} />
      </Environment>
    </>
  )
}

/** Одна карта окружения на рендерер — генерируется один раз и переиспользуется всеми превью */
const envCache = new WeakMap<THREE.WebGLRenderer, THREE.Texture>()

function getSharedEnv(gl: THREE.WebGLRenderer) {
  let tex = envCache.get(gl)
  if (!tex) {
    const pmrem = new THREE.PMREMGenerator(gl)
    const room = new RoomEnvironment()
    tex = pmrem.fromScene(room, 0.035).texture
    pmrem.dispose()
    room.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose?.()
      const mat = m.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
      else mat?.dispose?.()
    })
    envCache.set(gl, tex)
  }
  return tex
}

/**
 * Лёгкий свет для превью в каталоге (drei View). В отличие от Studio,
 * не рендерит кубическую карту для каждой карточки — это главная причина
 * «подвисаний» при открытии страниц с десятками моделей.
 */
export function ViewLights() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const env = useMemo(() => getSharedEnv(gl), [gl])
  const dark = useTheme((s) => s.theme) === 'dark'
  useLayoutEffect(() => {
    const prev = scene.environment
    scene.environment = env
    return () => {
      scene.environment = prev
    }
  }, [scene, env])
  return (
    <>
      <ambientLight intensity={dark ? 0.3 : 0.45} />
      <directionalLight position={[3, 5, 4]} intensity={dark ? 1.8 : 1.5} />
      <directionalLight position={[-4, 1.5, -2]} intensity={0.7} color="#dfe8ff" />
    </>
  )
}
