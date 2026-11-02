import { memo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { Lens, Panel, Slab, type ModelProps } from './parts'
import { pillGeometry } from '../lib/geometry'
import { aluminum, blackGlass, flash, hole, matte, metal, screen } from '../lib/materials'
import { tabletWallpaper } from '../lib/textures'

const SIZES = {
  pro: { W: 1.78, H: 2.48, D: 0.05, R: 0.17 },
  air: { W: 1.78, H: 2.48, D: 0.062, R: 0.17 },
  mini: { W: 1.34, H: 1.96, D: 0.063, R: 0.15 },
} as const

/** Планшет: алюминиевый корпус, равномерная рамка, камеры, кнопки, динамики, USB-C, Smart Connector */
export const Tablet = memo(function Tablet({ finish, variant = 'pro' }: ModelProps) {
  const s = SIZES[(variant as keyof typeof SIZES) in SIZES ? (variant as keyof typeof SIZES) : 'pro']
  const { W, H, D, R } = s
  const shell = aluminum(finish.frame)
  const accent = finish.swatch ?? finish.back
  const isPro = variant === 'pro'
  const bz = -D / 2

  return (
    <group>
      <Slab w={W} h={H} d={D} r={R} bevel={D * 0.32} material={shell} />
      {/* фронт */}
      <Panel w={W - 0.016} h={H - 0.016} r={R - 0.01} material={blackGlass()} position={[0, 0, D / 2 + 0.0005]} />
      <Panel w={W - 0.13} h={H - 0.13} r={R - 0.07} material={screen(tabletWallpaper(accent), `tab-${accent}`)} position={[0, 0, D / 2 + 0.001]} />
      {/* фронтальная камера на длинной стороне (альбомная ориентация) */}
      <mesh position={[W / 2 - 0.035, 0, D / 2 + 0.0012]} material={blackGlass('#14182a')}>
        <circleGeometry args={[0.012, 20]} />
      </mesh>

      {/* тыл: камеры */}
      {isPro ? (
        <group position={[W / 2 - 0.25, H / 2 - 0.25, 0]}>
          <Slab w={0.36} h={0.36} d={0.016} r={0.1} bevel={0.006} material={blackGlass('#151517')} position={[0, 0, bz - 0.004]} />
          <Lens r={0.062} ring={finish.frame} position={[0.075, 0.075, bz - 0.012]} />
          <Lens r={0.05} ring={finish.frame} position={[0.075, -0.08, bz - 0.012]} />
          <mesh position={[-0.08, 0.08, bz - 0.0125]} rotation={[0, Math.PI, 0]} material={blackGlass()}>
            <circleGeometry args={[0.034, 32]} />
          </mesh>
          <mesh position={[-0.08, -0.08, bz - 0.0125]} rotation={[0, Math.PI, 0]} material={flash()}>
            <circleGeometry args={[0.026, 32]} />
          </mesh>
        </group>
      ) : (
        <group position={[W / 2 - 0.15, H / 2 - 0.15, 0]}>
          <Lens r={0.065} ring={finish.frame} depth={0.016} position={[0, 0, bz]} />
        </group>
      )}

      {/* верхняя кнопка */}
      <RoundedBox args={[0.2, 0.014, 0.024]} radius={0.006} smoothness={3} material={metal(finish.frame, 0.25)} position={[W / 2 - 0.3, H / 2 + 0.002, 0]} />
      {/* громкость */}
      {[0.55, 0.78].map((y) => (
        <RoundedBox key={y} args={[0.014, 0.16, 0.024]} radius={0.006} smoothness={3} material={metal(finish.frame, 0.25)} position={[W / 2 + 0.002, H / 2 - y, 0]} />
      ))}
      {/* динамики сверху и снизу */}
      {[1, -1].map((sy) =>
        [-1, 1].map((sx) => (
          <mesh
            key={`${sy}${sx}`}
            geometry={pillGeometry(0.22, 0.014)}
            material={hole()}
            position={[sx * (W / 2 - 0.3), sy * (H / 2 + 0.0008), 0]}
            rotation={[(-sy * Math.PI) / 2, 0, 0]}
          />
        )),
      )}
      {/* USB-C */}
      <mesh geometry={pillGeometry(0.09, 0.026)} material={hole()} position={[0, -H / 2 - 0.0009, 0]} rotation={[Math.PI / 2, 0, 0]} />
      {/* Smart Connector */}
      {[-0.05, 0, 0.05].map((y) => (
        <mesh key={y} position={[-W / 2 - 0.0008, y, 0]} rotation={[0, -Math.PI / 2, 0]} material={metal('#b9b9bc', 0.2)}>
          <circleGeometry args={[0.012, 16]} />
        </mesh>
      ))}
      {/* тыльная полоса Magic Keyboard (декоративная) */}
      <mesh position={[0, -H / 2 + 0.25, bz - 0.0006]} rotation={[0, Math.PI, 0]} material={matte(finish.frame, 0.5)}>
        <planeGeometry args={[0.3, 0.004]} />
      </mesh>
    </group>
  )
})
