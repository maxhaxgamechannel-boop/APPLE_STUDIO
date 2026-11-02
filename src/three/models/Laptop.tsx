import { memo, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Panel, Slab, type ModelProps } from './parts'
import { pillGeometry } from '../lib/geometry'
import { aluminum, blackGlass, frostedGlass, hole, matte, metal, screen } from '../lib/materials'
import { desktopWallpaper } from '../lib/textures'

const U = 0.134
const KEY_ROWS: number[][] = [
  [...Array(13).fill(1.0357), 1.0357], // функциональный ряд (низкие клавиши)
  [...Array(13).fill(1), 1.5],
  [1.5, ...Array(13).fill(1)],
  [1.8, ...Array(11).fill(1), 1.7],
  [2.3, ...Array(10).fill(1), 2.2],
  [1, 1, 1, 1.25, 5.0, 1.25, 1, 1, 1, 1],
]

const flatX = (m: THREE.Object3D) => m.rotation.set(-Math.PI / 2, 0, 0)

/**
 * Ноутбук: алюминиевый корпус, клавиатура из инстансов, трекпад,
 * решётки динамиков, порты по бокам, ножки, крышка на шарнире с дисплеем и «чёлкой».
 * state: 0 — закрыт, 1 — открыт.
 */
export const Laptop = memo(function Laptop({ finish, variant = 'pro', state = 1, openRef }: ModelProps & { openRef?: { current: number } }) {
  const isPro = variant === 'pro'
  const W = isPro ? 2.4 : 2.3
  const L = isPro ? 1.66 : 1.6
  const T = isPro ? 0.066 : 0.048
  const TL = isPro ? 0.04 : 0.032
  const lid = useRef<THREE.Group>(null)
  const current = useRef(state)
  const shell = aluminum(finish.frame)
  const accent = finish.swatch ?? finish.back
  const wall = desktopWallpaper(accent)

  useFrame((st, dt) => {
    const target = openRef ? openRef.current : state
    current.current = THREE.MathUtils.damp(current.current, target, 5, dt)
    // пока шарнир движется — просим следующий кадр (рендер по требованию)
    if (Math.abs(current.current - target) > 0.0005) st.invalidate()
    if (lid.current) lid.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 2, -0.3, current.current)
  })

  // ── Клавиатура (InstancedMesh) ──
  const keys = useMemo(() => {
    const list: { x: number; z: number; w: number; d: number }[] = []
    const totalW = 14.5 * U
    let z = -0.62
    KEY_ROWS.forEach((row, ri) => {
      const d = ri === 0 ? U * 0.55 : U
      let x = -totalW / 2
      row.forEach((units) => {
        const w = units * U
        list.push({ x: x + w / 2, z: z + d / 2, w: w - 0.016, d: d - 0.016 })
        x += w
      })
      z += d
    })
    return list
  }, [])

  const keyRef = useRef<THREE.InstancedMesh>(null)
  const grilleRef = useRef<THREE.InstancedMesh>(null)
  const grille = useMemo(() => {
    const pts: [number, number][] = []
    for (const side of [-1, 1])
      for (let c = 0; c < 4; c++)
        for (let r = 0; r < 34; r++) pts.push([side * (1.06 + c * 0.022) * (W / 2.4), -0.62 + r * 0.026])
    return pts
  }, [W])

  useLayoutEffect(() => {
    const m = new THREE.Object3D()
    if (keyRef.current) {
      keys.forEach((k, i) => {
        m.position.set(k.x, T / 2 + 0.006, k.z)
        m.rotation.set(0, 0, 0)
        m.scale.set(k.w, 0.012, k.d)
        m.updateMatrix()
        keyRef.current!.setMatrixAt(i, m.matrix)
      })
      keyRef.current.instanceMatrix.needsUpdate = true
    }
    if (grilleRef.current) {
      grille.forEach(([x, z], i) => {
        m.position.set(x, T / 2 + 0.0008, z)
        flatX(m)
        m.scale.set(1, 1, 1)
        m.updateMatrix()
        grilleRef.current!.setMatrixAt(i, m.matrix)
      })
      grilleRef.current.instanceMatrix.needsUpdate = true
    }
  }, [keys, grille, T])

  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const dotGeo = useMemo(() => new THREE.CircleGeometry(0.0055, 10), [])

  return (
    <group position={[0, -0.35, 0.2]}>
      {/* ── Нижняя часть ── */}
      <Slab w={W} h={L} d={T} r={0.11} bevel={T * 0.35} material={shell} rotation={[-Math.PI / 2, 0, 0]} />
      {/* ниша клавиатуры */}
      <Panel w={W * 0.86} h={0.86} r={0.04} material={matte(isPro ? '#121214' : '#1a1a1c', 0.7)} position={[0, T / 2 + 0.0005, -0.27]} rotation={[-Math.PI / 2, 0, 0]} />
      <instancedMesh ref={keyRef} args={[boxGeo, matte('#0d0d0f', 0.55), keys.length]} castShadow />
      {/* Touch ID */}
      <Panel w={0.11} h={0.068} r={0.02} material={blackGlass()} position={[0.905, T / 2 + 0.0125, -0.583]} rotation={[-Math.PI / 2, 0, 0]} />
      {/* решётки динамиков */}
      {isPro && <instancedMesh ref={grilleRef} args={[dotGeo, hole(), grille.length]} />}
      {/* трекпад */}
      <Panel w={isPro ? 1.06 : 0.95} h={0.58} r={0.05} material={frostedGlass(finish.frame)} position={[0, T / 2 + 0.0008, 0.48]} rotation={[-Math.PI / 2, 0, 0]} />
      {/* выемка для открытия */}
      <mesh position={[0, T / 2 - 0.004, L / 2 + 0.0005]} material={matte(finish.frame, 0.4)}>
        <planeGeometry args={[0.32, 0.01]} />
      </mesh>

      {/* порты слева */}
      <group position={[-W / 2 - 0.0008, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh geometry={pillGeometry(0.11, 0.024)} material={hole()} position={[-0.48, 0, 0]} />
        <mesh geometry={pillGeometry(0.075, 0.022)} material={hole()} position={[-0.25, 0, 0]} />
        <mesh geometry={pillGeometry(0.075, 0.022)} material={hole()} position={[-0.1, 0, 0]} />
        <mesh material={hole()} position={[0.25, 0, 0]}>
          <circleGeometry args={[0.012, 20]} />
        </mesh>
      </group>
      {/* порты справа */}
      {isPro && (
        <group position={[W / 2 + 0.0008, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh geometry={pillGeometry(0.12, 0.012)} material={hole()} position={[-0.42, 0, 0]} />
          <mesh geometry={pillGeometry(0.075, 0.022)} material={hole()} position={[-0.15, 0, 0]} />
          <mesh material={hole()} position={[0.14, 0, 0]}>
            <planeGeometry args={[0.12, 0.03]} />
          </mesh>
        </group>
      )}
      {/* ножки */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * (W / 2 - 0.18), -T / 2 - 0.006, sz * (L / 2 - 0.16)]} material={matte('#222', 0.8)}>
            <cylinderGeometry args={[0.05, 0.05, 0.012, 24]} />
          </mesh>
        )),
      )}

      {/* ── Шарнир ── */}
      <mesh position={[0, T / 2, -L / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]} material={metal(isPro ? '#1b1b1d' : finish.frame, 0.35)}>
        <cylinderGeometry args={[0.024, 0.024, W - 0.5, 24]} />
      </mesh>

      {/* ── Крышка ── */}
      <group ref={lid} position={[0, T / 2, -L / 2 + 0.03]}>
        <group position={[0, (L - 0.02) / 2, -TL / 2]}>
          <Slab w={W} h={L - 0.02} d={TL} r={0.11} bevel={TL * 0.3} material={shell} />
          {/* рамка и дисплей */}
          <Panel w={W - 0.03} h={L - 0.05} r={0.095} material={blackGlass('#020203')} position={[0, 0, TL / 2 + 0.0005]} />
          <Panel w={W - 0.1} h={L - 0.16} r={0.06} material={screen(wall, `desk-${accent}`)} position={[0, -0.025, TL / 2 + 0.001]} />
          {/* «чёлка» с камерой */}
          <Panel w={0.28} h={0.06} r={0.025} material={blackGlass('#020203')} position={[0, (L - 0.02) / 2 - 0.085, TL / 2 + 0.0015]} />
          <mesh position={[0, (L - 0.02) / 2 - 0.08, TL / 2 + 0.002]} material={blackGlass('#14182a')}>
            <circleGeometry args={[0.01, 20]} />
          </mesh>
          {/* надпись-панель внизу рамки */}
          <mesh position={[0, -(L - 0.02) / 2 + 0.035, TL / 2 + 0.0012]} material={matte('#1c1c1e', 0.5)}>
            <planeGeometry args={[0.24, 0.012]} />
          </mesh>
        </group>
      </group>
    </group>
  )
})
