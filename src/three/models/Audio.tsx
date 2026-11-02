import { memo, useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { HoleRow, Slab, type ModelProps } from './parts'
import { bandGeometry, pillGeometry } from '../lib/geometry'
import { aluminum, blackGlass, fabric, glossyPlastic, hole, matte, metal } from '../lib/materials'

const LED = new THREE.MeshBasicMaterial({ color: '#b6ffcf' })

/** Один наушник-вкладыш: «головка», амбушюра (Pro), ножка с микрофоном, датчик */
function Bud({ pro, side }: { pro: boolean; side: 1 | -1 }) {
  const white = glossyPlastic('#f7f7f7')
  return (
    <group rotation={[0.1, side * 0.5, side * -0.12]}>
      <mesh material={white} scale={[1, 0.92, 1.1]} castShadow>
        <sphereGeometry args={[pro ? 0.085 : 0.095, 40, 30]} />
      </mesh>
      {pro && (
        <mesh position={[0, 0.01, 0.075]} scale={[1, 0.9, 0.75]} material={matte('#dcdcde', 0.85)}>
          <sphereGeometry args={[0.062, 32, 24]} />
        </mesh>
      )}
      {/* сетка динамика / датчик */}
      <mesh position={[0, 0.03, -0.088]} rotation={[0, Math.PI, 0]} material={blackGlass()}>
        <circleGeometry args={[0.018, 20]} />
      </mesh>
      <mesh position={[0, -0.18, -0.01]} material={white} castShadow>
        <capsuleGeometry args={[0.033, pro ? 0.24 : 0.28, 8, 24]} />
      </mesh>
      <mesh position={[0, pro ? -0.335 : -0.355, -0.01]} rotation={[Math.PI / 2, 0, 0]} material={metal('#b0b0b4', 0.3)}>
        <circleGeometry args={[0.02, 20]} />
      </mesh>
      <mesh position={[0, -0.1, -0.044]} rotation={[0, Math.PI, 0]} geometry={pillGeometry(0.02, 0.05)} material={hole()} />
    </group>
  )
}

/** Наушники-вкладыши с зарядным кейсом */
export const Earbuds = memo(function Earbuds({ variant = 'pro' }: ModelProps) {
  const pro = variant === 'pro'
  const W = pro ? 0.62 : 0.6
  const H = pro ? 0.48 : 0.5
  const D = 0.24
  const white = glossyPlastic('#f7f7f7')
  return (
    <group>
      <group position={[0, -0.05, 0]}>
        <Slab w={W} h={H} d={D} r={0.19} bevel={0.09} material={white} />
        {/* линия крышки */}
        <Slab w={W + 0.002} h={D + 0.002} d={0.006} r={0.11} bevel={0.002} material={matte('#c9c9cb', 0.6)} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        {/* индикатор */}
        <mesh position={[0, -0.06, D / 2 + 0.0008]} material={LED}>
          <circleGeometry args={[0.008, 16]} />
        </mesh>
        {pro && (
          <>
            <RoundedBox args={[0.02, 0.06, 0.04]} radius={0.008} smoothness={3} material={metal('#c0c0c4', 0.25)} position={[W / 2 + 0.004, 0.06, 0]} />
            <HoleRow count={5} spacing={0.022} r={0.006} position={[0.12, -H / 2 - 0.0008, 0]} rotation={[Math.PI / 2, 0, 0]} />
          </>
        )}
        <mesh geometry={pillGeometry(0.075, 0.022)} material={hole()} position={[0, -H / 2 - 0.0009, 0]} rotation={[Math.PI / 2, 0, 0]} />
      </group>
      <group position={[-0.52, 0.12, 0.05]}>
        <Bud pro={pro} side={-1} />
      </group>
      <group position={[0.52, 0.12, 0.05]}>
        <Bud pro={pro} side={1} />
      </group>
    </group>
  )
})

/** Полноразмерные наушники: чашки, амбушюры, телескопические стойки, сетчатый оголовник */
export const Headphones = memo(function Headphones({ finish }: ModelProps) {
  const cupMat = aluminum(finish.frame)
  const cushion = fabric(finish.accent ?? finish.back)

  const canopy = useMemo(
    () =>
      bandGeometry(
        [
          new THREE.Vector3(-0.5, 0.42, 0),
          new THREE.Vector3(-0.44, 0.78, 0),
          new THREE.Vector3(0, 0.98, 0),
          new THREE.Vector3(0.44, 0.78, 0),
          new THREE.Vector3(0.5, 0.42, 0),
        ],
        0.3,
        0.03,
      ),
    [],
  )
  const frame = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.56, 0.36, 0),
      new THREE.Vector3(-0.5, 0.84, 0),
      new THREE.Vector3(0, 1.06, 0),
      new THREE.Vector3(0.5, 0.84, 0),
      new THREE.Vector3(0.56, 0.36, 0),
    ])
    return new THREE.TubeGeometry(curve, 80, 0.016, 12, false)
  }, [])

  return (
    <group position={[0, -0.3, 0]}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.58, 0, 0]} rotation={[0, (s * Math.PI) / 2, 0]}>
          <Slab w={0.48} h={0.6} d={0.22} r={0.2} bevel={0.06} material={cupMat} />
          {/* амбушюра — к голове (внутрь) */}
          <Slab w={0.46} h={0.58} d={0.12} r={0.2} bevel={0.05} material={cushion} position={[0, 0, -0.15]} />
          <mesh position={[0, 0, -0.212]} rotation={[0, Math.PI, 0]} material={matte('#2a2a2c', 0.9)}>
            <circleGeometry args={[0.12, 32]} />
          </mesh>
          {/* стойка */}
          <mesh position={[0, 0.36, -0.03]} material={metal('#c8c8cc', 0.18)}>
            <cylinderGeometry args={[0.018, 0.018, 0.2, 16]} />
          </mesh>
        </group>
      ))}
      {/* Digital Crown и кнопка шумоподавления на правой чашке */}
      <mesh position={[0.6, 0.27, 0.1]} material={metal(finish.frame, 0.2)}>
        <cylinderGeometry args={[0.04, 0.04, 0.05, 32]} />
      </mesh>
      <RoundedBox args={[0.03, 0.02, 0.09]} radius={0.008} smoothness={3} material={metal(finish.frame, 0.25)} position={[0.6, 0.3, -0.06]} />

      <mesh geometry={frame} position={[0, 0, 0.13]} material={metal('#c8c8cc', 0.18)} />
      <mesh geometry={frame} position={[0, 0, -0.13]} material={metal('#c8c8cc', 0.18)} />
      <mesh geometry={canopy} material={fabric(finish.back)} />
    </group>
  )
})
