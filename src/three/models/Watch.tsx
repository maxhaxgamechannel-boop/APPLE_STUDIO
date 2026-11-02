import { memo, useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { Panel, Slab, type ModelProps } from './parts'
import { bandGeometry } from '../lib/geometry'
import { aluminum, blackGlass, fabric, matte, metal, screen, sapphire } from '../lib/materials'
import { watchFace } from '../lib/textures'

/**
 * Смарт-часы: корпус с крупным скруглением (или угловатый титан Ultra),
 * сапфировое стекло, циферблат, Digital Crown с насечками, боковые кнопки,
 * датчики на тыльной стороне и изогнутые ремешки.
 */
export const Watch = memo(function Watch({ finish, variant = 'series' }: ModelProps) {
  const ultra = variant === 'ultra'
  const W = ultra ? 0.44 : variant === 'se' ? 0.4 : 0.42
  const H = ultra ? 0.52 : variant === 'se' ? 0.48 : 0.5
  const D = ultra ? 0.13 : 0.1
  const R = ultra ? 0.09 : 0.11
  const caseMat = ultra ? metal(finish.frame, 0.42) : aluminum(finish.frame)
  const bandColor = finish.accent ?? finish.back
  const face = watchFace(ultra ? '#ff8a3d' : '#ffffff', ultra)
  const bandW = W * 0.78

  const [topBand, bottomBand] = useMemo(() => {
    const up = [
      new THREE.Vector3(0, H / 2 - 0.03, -0.01),
      new THREE.Vector3(0, H / 2 + 0.16, -0.03),
      new THREE.Vector3(0, H / 2 + 0.34, -0.14),
      new THREE.Vector3(0, H / 2 + 0.44, -0.34),
      new THREE.Vector3(0, H / 2 + 0.46, -0.56),
    ]
    const down = up.map((p) => new THREE.Vector3(p.x, -p.y, p.z))
    return [bandGeometry(up, bandW, 0.035), bandGeometry(down, bandW, 0.035)]
  }, [H, bandW])

  const crownRidges = useMemo(() => new THREE.CylinderGeometry(0.045, 0.045, 0.05, 40, 1, false), [])

  return (
    <group rotation={[0, 0, 0]}>
      {/* корпус */}
      <Slab w={W} h={H} d={D} r={R} bevel={ultra ? 0.022 : 0.04} material={caseMat} />
      {/* стекло и экран */}
      {ultra && <Slab w={W - 0.01} h={H - 0.01} d={0.02} r={R - 0.005} bevel={0.006} material={metal(finish.frame, 0.3)} position={[0, 0, D / 2 - 0.004]} />}
      <Panel w={W - (ultra ? 0.05 : 0.03)} h={H - (ultra ? 0.05 : 0.03)} r={R - 0.02} material={blackGlass()} position={[0, 0, D / 2 + (ultra ? 0.0065 : 0.0005)]} />
      <Panel
        w={W - 0.08}
        h={H - 0.08}
        r={R - 0.04}
        material={screen(face, `watch-${ultra}`)}
        position={[0, 0, D / 2 + (ultra ? 0.007 : 0.001)]}
      />

      {/* Digital Crown */}
      <group position={[W / 2 + 0.02, 0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh geometry={crownRidges} material={metal(finish.frame, 0.2)} />
        <mesh position={[0, -0.026, 0]} material={ultra ? matte('#e8692f', 0.4) : sapphire()}>
          <cylinderGeometry args={[0.038, 0.038, 0.004, 32]} />
        </mesh>
      </group>
      {ultra && <RoundedBox args={[0.03, 0.17, 0.05]} radius={0.012} smoothness={3} material={metal(finish.frame, 0.4)} position={[W / 2 + 0.008, 0.05, 0]} />}
      {/* боковая кнопка */}
      <RoundedBox args={[0.016, 0.12, 0.035]} radius={0.007} smoothness={3} material={metal(finish.frame, 0.25)} position={[W / 2 + 0.004, -0.1, 0]} />
      {/* кнопка действия Ultra */}
      {ultra && <RoundedBox args={[0.018, 0.13, 0.05]} radius={0.008} smoothness={3} material={matte('#e8692f', 0.35)} position={[-W / 2 - 0.006, 0.06, 0]} />}
      {/* динамик / микрофон */}
      <mesh position={[-W / 2 - 0.0008, -0.08, 0]} rotation={[0, -Math.PI / 2, 0]} material={matte('#111', 0.5)}>
        <planeGeometry args={[0.03, 0.09]} />
      </mesh>

      {/* датчики на тыльной стороне */}
      <mesh position={[0, 0, -D / 2]} scale={[1, 1, 0.35]} material={blackGlass('#0d0d10')}>
        <sphereGeometry args={[0.16, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 0, -D / 2 - 0.057]} rotation={[0, Math.PI, 0]} material={metal('#3a3a3c', 0.3)}>
        <ringGeometry args={[0.03, 0.04, 40]} />
      </mesh>

      {/* ремешки */}
      <mesh geometry={topBand} material={ultra ? fabric(bandColor) : matte(bandColor, 0.6)} castShadow />
      <mesh geometry={bottomBand} material={ultra ? fabric(bandColor) : matte(bandColor, 0.6)} castShadow />
      {/* крепления ремешков */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, s * (H / 2 - 0.02), -0.005]} material={metal(finish.frame, 0.3)}>
          <boxGeometry args={[bandW + 0.01, 0.03, 0.05]} />
        </mesh>
      ))}
    </group>
  )
})
