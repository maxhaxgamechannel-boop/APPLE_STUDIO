import { memo } from 'react'
import * as THREE from 'three'
import { Panel, Slab, type ModelProps } from './parts'
import { pillGeometry } from '../lib/geometry'
import { aluminum, blackGlass, hole, matte, metal, screen } from '../lib/materials'
import { desktopWallpaper } from '../lib/textures'

/** Моноблок: тонкая панель, цветной «подбородок», светлая рамка, алюминиевая подставка */
export const IMac = memo(function IMac({ finish }: ModelProps) {
  const W = 2.3
  const H = 1.62
  const D = 0.045
  const chin = 0.34
  const accent = finish.accent ?? '#e8e8ea'
  const body = aluminum(finish.frame)

  return (
    <group position={[0, 0.25, 0]}>
      <Slab w={W} h={H} d={D} r={0.06} bevel={0.012} material={body} />
      {/* светлая рамка дисплея */}
      <Panel w={W - 0.02} h={H - chin} r={0.05} material={matte(accent, 0.35)} position={[0, chin / 2, D / 2 + 0.0005]} />
      <Panel w={W - 0.13} h={H - chin - 0.12} r={0.02} material={blackGlass('#020203')} position={[0, chin / 2, D / 2 + 0.001]} />
      <Panel w={W - 0.15} h={H - chin - 0.14} r={0.015} material={screen(desktopWallpaper(finish.swatch ?? finish.frame), `imac-${finish.frame}`)} position={[0, chin / 2, D / 2 + 0.0015]} />
      {/* камера */}
      <mesh position={[0, H / 2 - 0.035, D / 2 + 0.0012]} material={blackGlass('#14182a')}>
        <circleGeometry args={[0.01, 20]} />
      </mesh>
      {/* подбородок — светлее основного цвета */}
      <Panel w={W - 0.02} h={chin - 0.01} r={0.05} material={aluminum('#' + new THREE.Color(finish.frame).lerp(new THREE.Color('#ffffff'), 0.35).getHexString())} position={[0, -H / 2 + chin / 2, D / 2 + 0.0005]} />

      {/* подставка */}
      <group position={[0, -H / 2 + 0.2, -D / 2]}>
        <Slab w={0.62} h={0.92} d={0.035} r={0.03} bevel={0.01} material={body} position={[0, -0.32, -0.16]} rotation={[-0.38, 0, 0]} />
        <Slab w={0.62} h={0.6} d={0.03} r={0.06} bevel={0.01} material={body} position={[0, -0.76, -0.02]} rotation={[-Math.PI / 2, 0, 0]} />
        {/* отверстие для кабеля */}
        <mesh position={[0, -0.12, -0.105]} rotation={[-0.38 + Math.PI, 0, 0]} material={hole()}>
          <circleGeometry args={[0.04, 24]} />
        </mesh>
      </group>
    </group>
  )
})

const LED = new THREE.MeshBasicMaterial({ color: '#d9ffe3' })

/** Компактный неттоп: алюминиевый корпус, порты спереди и сзади, тёмное основание */
export const MacMini = memo(function MacMini({ finish }: ModelProps) {
  const S = 1.0
  const T = 0.4
  const body = aluminum(finish.frame)
  return (
    <group>
      <Slab w={S} h={S} d={T} r={0.14} bevel={0.04} material={body} rotation={[-Math.PI / 2, 0, 0]} />
      {/* фронт */}
      <group position={[0, -0.04, S / 2 + 0.0008]}>
        <mesh geometry={pillGeometry(0.07, 0.022)} material={hole()} position={[-0.32, 0, 0]} />
        <mesh geometry={pillGeometry(0.07, 0.022)} material={hole()} position={[-0.2, 0, 0]} />
        <mesh material={hole()} position={[-0.08, 0, 0]}>
          <circleGeometry args={[0.012, 20]} />
        </mesh>
        <mesh position={[0.36, 0, 0]} material={LED}>
          <circleGeometry args={[0.006, 16]} />
        </mesh>
      </group>
      {/* тыл */}
      <group position={[0, -0.04, -S / 2 - 0.0008]} rotation={[0, Math.PI, 0]}>
        <mesh material={hole()} position={[-0.35, 0, 0]}>
          <circleGeometry args={[0.04, 32]} />
        </mesh>
        <mesh material={hole()} position={[-0.17, 0, 0]}>
          <planeGeometry args={[0.1, 0.07]} />
        </mesh>
        <mesh material={hole()} position={[0.0, 0, 0]}>
          <planeGeometry args={[0.1, 0.03]} />
        </mesh>
        {[0.15, 0.26, 0.37].map((x) => (
          <mesh key={x} geometry={pillGeometry(0.07, 0.022)} material={hole()} position={[x, 0, 0]} />
        ))}
      </group>
      {/* основание с вентиляцией */}
      <mesh position={[0, -T / 2 - 0.004, 0]} material={matte('#1a1a1c', 0.7)}>
        <cylinderGeometry args={[0.4, 0.4, 0.01, 64]} />
      </mesh>
      <mesh position={[0, -T / 2 - 0.0095, 0]} rotation={[Math.PI / 2, 0, 0]} material={metal('#3a3a3c', 0.5)}>
        <ringGeometry args={[0.3, 0.38, 64]} />
      </mesh>
    </group>
  )
})
