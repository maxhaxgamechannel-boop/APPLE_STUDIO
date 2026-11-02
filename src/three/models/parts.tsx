import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import type * as THREE from 'three'
import { roundedPlaneGeometry, slabGeometry } from '../lib/geometry'
import { blackGlass, hole, lensCoating, metal, polished, sapphire } from '../lib/materials'

export interface DeviceFinish {
  frame: string
  back: string
  accent?: string
  swatch?: string
}

export interface ModelProps {
  finish: DeviceFinish
  variant?: string
  size?: number
  /** Состояние трансформации (раскрытие Duo, крышка ноутбука): 0..1 */
  state?: number
}

type GroupProps = ThreeElements['group']

/** Корпус-«плита» со скруглениями */
export function Slab({
  w,
  h,
  d,
  r,
  bevel,
  material,
  ...props
}: { w: number; h: number; d: number; r: number; bevel?: number; material: THREE.Material } & ThreeElements['mesh']) {
  return <mesh geometry={slabGeometry(w, h, d, r, bevel)} material={material} castShadow receiveShadow {...props} />
}

/** Плоская скруглённая панель (стекло, экран). По умолчанию смотрит в +Z */
export function Panel({
  w,
  h,
  r,
  material,
  ...props
}: { w: number; h: number; r: number; material: THREE.Material } & ThreeElements['mesh']) {
  return <mesh geometry={roundedPlaneGeometry(w, h, r)} material={material} {...props} />
}

/**
 * Объектив камеры: металлическое кольцо, сапфировое стекло,
 * просветлённая линза и тёмная апертура. Ось — вдоль -Z (смотрит назад).
 */
export function Lens({ r = 0.08, ring = '#9a9a9e', depth = 0.022, ...props }: { r?: number; ring?: string; depth?: number } & GroupProps) {
  return (
    <group {...props}>
      {/* корпус-кольцо объектива */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -depth / 2]} material={metal(ring, 0.2)}>
        <cylinderGeometry args={[r, r * 1.03, depth, 56]} />
      </mesh>
      {/* полированный ободок */}
      <mesh position={[0, 0, -depth]} material={polished(ring)}>
        <torusGeometry args={[r * 0.97, r * 0.055, 12, 64]} />
      </mesh>
      {/* сапфировое стекло */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -depth - 0.0006]} material={sapphire()}>
        <cylinderGeometry args={[r * 0.9, r * 0.9, 0.002, 56]} />
      </mesh>
      {/* внутреннее чёрное кольцо с тонкими концентрическими гранями */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -depth - 0.0009]} material={blackGlass('#08080a')}>
        <ringGeometry args={[r * 0.6, r * 0.86, 56]} />
      </mesh>
      {[0.66, 0.74, 0.82].map((k) => (
        <mesh key={k} rotation={[0, Math.PI, 0]} position={[0, 0, -depth - 0.001]} material={metal('#3c3c42', 0.35)}>
          <ringGeometry args={[r * k, r * (k + 0.012), 56]} />
        </mesh>
      ))}
      {/* линза с отливом просветления */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -depth - 0.0012]} material={lensCoating()}>
        <circleGeometry args={[r * 0.58, 48]} />
      </mesh>
      {/* второй элемент линзы — создаёт ощущение глубины */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -depth - 0.0014]} material={blackGlass('#141a33')}>
        <ringGeometry args={[r * 0.3, r * 0.42, 40]} />
      </mesh>
      {/* апертура */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -depth - 0.0016]} material={hole()}>
        <circleGeometry args={[r * 0.24, 32]} />
      </mesh>
    </group>
  )
}

/** Боковая кнопка */
export function SideButton({
  len,
  material,
  thickness = 0.012,
  depth = 0.03,
  ...props
}: { len: number; material: THREE.Material; thickness?: number; depth?: number } & ThreeElements['mesh']) {
  return (
    <RoundedBox args={[thickness, len, depth]} radius={Math.min(thickness, depth) * 0.45} smoothness={3} material={material} {...props} />
  )
}

/** Ряд круглых отверстий (динамики, микрофоны). Смотрят вдоль нормали плоскости */
export function HoleRow({
  count,
  spacing,
  r = 0.006,
  ...props
}: { count: number; spacing: number; r?: number } & GroupProps) {
  return (
    <group {...props}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[(i - (count - 1) / 2) * spacing, 0, 0]} material={hole()}>
          <circleGeometry args={[r, 16]} />
        </mesh>
      ))}
    </group>
  )
}
