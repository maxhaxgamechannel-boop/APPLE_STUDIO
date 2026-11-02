import { memo, useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { Slab, type ModelProps } from './parts'
import { pillGeometry } from '../lib/geometry'
import { aluminum, clearPlastic, glossyPlastic, hole, matte, metal } from '../lib/materials'
import { Phone } from './Phone'

/** Сетевой адаптер USB-C с евровилкой (один или два порта) */
export const Charger = memo(function Charger({ variant = 'single' }: ModelProps) {
  const dual = variant === 'dual'
  const W = dual ? 0.62 : 0.5
  const H = dual ? 0.46 : 0.5
  const white = glossyPlastic('#f7f7f7')
  return (
    <group rotation={[0.2, -0.5, 0]}>
      <Slab w={W} h={H} d={0.42} r={0.09} bevel={0.06} material={white} />
      {(dual ? [-0.12, 0.12] : [0]).map((x) => (
        <group key={x} position={[x, 0, 0.2105]}>
          <mesh geometry={pillGeometry(0.1, 0.034)} material={hole()} rotation={[0, 0, Math.PI / 2]} />
          <mesh geometry={pillGeometry(0.075, 0.012)} material={metal('#8a8a8e', 0.3)} position={[0, 0, 0.0006]} rotation={[0, 0, Math.PI / 2]} />
        </group>
      ))}
      {/* евровилка */}
      {[-0.095, 0.095].map((x) => (
        <group key={x} position={[x, 0, -0.21]}>
          <mesh position={[0, 0, -0.12]} rotation={[Math.PI / 2, 0, 0]} material={metal('#d2d2d6', 0.2)}>
            <cylinderGeometry args={[0.024, 0.024, 0.24, 24]} />
          </mesh>
          <mesh position={[0, 0, -0.245]} material={metal('#d2d2d6', 0.2)}>
            <sphereGeometry args={[0.024, 16, 12]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0, -0.2115]} rotation={[0, Math.PI, 0]} material={matte('#e6e6e8', 0.5)}>
        <circleGeometry args={[0.17, 40]} />
      </mesh>
    </group>
  )
})

/** Коннектор USB-C с обжимом */
function Plug({ position, rotation }: { position: THREE.Vector3; rotation: THREE.Euler }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[0.1, 0.22, 0.06]} radius={0.025} smoothness={4} material={glossyPlastic('#f5f5f5')} position={[0, 0.11, 0]} />
      <RoundedBox args={[0.08, 0.1, 0.03]} radius={0.012} smoothness={3} material={metal('#c4c4c8', 0.18)} position={[0, 0.27, 0]} />
      <mesh position={[0, 0.321, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={pillGeometry(0.06, 0.014)} material={hole()} />
    </group>
  )
}

/** Плетёный кабель USB-C, свёрнутый в мягкую петлю */
export const Cable = memo(function Cable({ variant }: ModelProps) {
  const short = variant === 'short'
  const { tube, a, b } = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const loops = short ? 1.25 : 2.1
    const n = 80
    pts.push(new THREE.Vector3(-0.35, 0.55, 0.1))
    pts.push(new THREE.Vector3(-0.35, 0.3, 0.1))
    for (let i = 0; i <= n; i++) {
      const t = i / n
      const ang = t * Math.PI * 2 * loops + Math.PI
      const r = 0.55 + Math.sin(t * Math.PI) * 0.12
      pts.push(new THREE.Vector3(Math.cos(ang) * r, -0.15 + Math.sin(t * 9) * 0.03 - t * 0.12, Math.sin(ang) * r * 0.75))
    }
    pts.push(new THREE.Vector3(0.35, 0.25, -0.05))
    pts.push(new THREE.Vector3(0.35, 0.52, -0.05))
    const curve = new THREE.CatmullRomCurve3(pts)
    return {
      tube: new THREE.TubeGeometry(curve, 400, 0.028, 12, false),
      a: pts[0],
      b: pts[pts.length - 1],
    }
  }, [short])

  return (
    <group position={[0, -0.1, 0]}>
      <mesh geometry={tube} material={matte('#f1f1f1', 0.92)} castShadow />
      <Plug position={a.clone().add(new THREE.Vector3(0, -0.02, 0))} rotation={new THREE.Euler(0, 0, 0)} />
      <Plug position={b.clone().add(new THREE.Vector3(0, -0.02, 0))} rotation={new THREE.Euler(0, 0.6, 0)} />
    </group>
  )
})

/** Магнитная беспроводная зарядка */
export const MagSafe = memo(function MagSafe({ finish }: ModelProps) {
  const cable = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.42, 0, 0),
      new THREE.Vector3(0.75, -0.05, 0.1),
      new THREE.Vector3(1.0, -0.1, 0.45),
      new THREE.Vector3(0.9, -0.12, 0.85),
    ])
    return new THREE.TubeGeometry(curve, 60, 0.024, 10, false)
  }, [])
  return (
    <group rotation={[0.9, 0, 0]}>
      <mesh material={aluminum(finish.frame === '#f5f5f5' ? '#c9cacc' : finish.frame)} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.08, 72]} />
      </mesh>
      <mesh position={[0, 0.0405, 0]} rotation={[-Math.PI / 2, 0, 0]} material={glossyPlastic('#f7f7f7')}>
        <circleGeometry args={[0.39, 72]} />
      </mesh>
      <mesh position={[0, 0.041, 0]} rotation={[-Math.PI / 2, 0, 0]} material={matte('#e4e4e6', 0.4)}>
        <ringGeometry args={[0.24, 0.25, 72]} />
      </mesh>
      <mesh geometry={cable} material={matte('#f1f1f1', 0.8)} />
    </group>
  )
})

/** Чехол: силиконовый (матовый, в цвет) или прозрачный поверх iPhone */
export const PhoneCase = memo(function PhoneCase({ finish, variant }: ModelProps) {
  if (variant === 'clear') {
    return (
      <group>
        <Phone finish={{ frame: '#34425e', back: '#27344d', swatch: '#2c3a55' }} variant="pro17" screenOn={false} />
        <Slab w={0.82} h={1.64} d={0.11} r={0.15} bevel={0.03} material={clearPlastic()} position={[0, 0, -0.005]} />
      </group>
    )
  }
  return <Phone finish={finish} variant="case" silicone screenOn={false} />
})

/** Трекер: глянцевая белая крышка и полированная стальная тыльная часть */
export const Tag = memo(function Tag() {
  return (
    <group rotation={[1.1, 0, 0.2]}>
      <mesh position={[0, 0.03, 0]} material={glossyPlastic('#f7f7f7')} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.06, 72]} />
      </mesh>
      <mesh position={[0, 0.06, 0]} scale={[1, 0.12, 1]} material={glossyPlastic('#f7f7f7')}>
        <sphereGeometry args={[0.34, 64, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, -0.02, 0]} material={metal('#d0d0d4', 0.1)}>
        <cylinderGeometry args={[0.335, 0.32, 0.05, 72]} />
      </mesh>
      <mesh position={[0, -0.05, 0]} scale={[1, 0.18, 1]} rotation={[Math.PI, 0, 0]} material={metal('#d0d0d4', 0.1)}>
        <sphereGeometry args={[0.32, 64, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  )
})

/** Стилус: шестигранно-скруглённый корпус с плоской гранью и наконечником */
export const Pencil = memo(function Pencil() {
  const white = glossyPlastic('#f7f7f7')
  return (
    <group rotation={[0.3, 0, -0.75]}>
      <mesh material={white} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2.0, 48]} />
      </mesh>
      <mesh position={[0.046, 0.2, 0]} material={matte('#ececee', 0.45)}>
        <boxGeometry args={[0.012, 1.2, 0.06]} />
      </mesh>
      <mesh position={[0, -1.08, 0]} material={white}>
        <cylinderGeometry args={[0.05, 0.02, 0.16, 48]} />
      </mesh>
      <mesh position={[0, -1.19, 0]} material={matte('#f0f0f0', 0.5)}>
        <coneGeometry args={[0.02, 0.06, 32]} />
      </mesh>
      <mesh position={[0, 1.0, 0]} scale={[1, 0.3, 1]} material={white}>
        <sphereGeometry args={[0.05, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  )
})
