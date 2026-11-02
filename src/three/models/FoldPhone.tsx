import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Lens, Panel, SideButton, Slab, type ModelProps } from './parts'
import { pillGeometry } from '../lib/geometry'
import { blackGlass, flash, frostedGlass, hole, metal, screen } from '../lib/materials'
import { phoneWallpaper, phoneWallpaperHalf } from '../lib/textures'

export const FOLD = { W: 0.78, H: 1.25, D: 0.046, R: 0.12, GAP: 0.004 }

interface FoldProps extends ModelProps {
  /** Внешний источник раскрытия (например, прогресс скролла), 0 — сложен, 1 — раскрыт */
  openRef?: { current: number }
}

/**
 * Складной смартфон книжного типа: две половины на титановом шарнире,
 * внутренний гибкий экран, внешний экран и сдвоенная камера.
 * state / openRef: 0 — сложен, 1 — раскрыт. Анимация шарнира — плавная (damp).
 */
export const FoldPhone = memo(function FoldPhone({ finish, state = 1, openRef }: FoldProps) {
  const { W, H, D, R, GAP } = FOLD
  const pivot = useRef<THREE.Group>(null)
  const root = useRef<THREE.Group>(null)
  const current = useRef(state)
  const frameMat = metal(finish.frame, 0.3)
  const backMat = frostedGlass(finish.back)
  const accent = finish.swatch ?? finish.back

  // половинки общей «широкой» текстуры кэшируются по цвету — без клонов на каждый монтаж
  const [leftTex, rightTex, outerTex] = useMemo(
    () => [phoneWallpaperHalf(accent, 'left'), phoneWallpaperHalf(accent, 'right'), phoneWallpaper(accent, 'portrait')],
    [accent],
  )

  useFrame((st, dt) => {
    const target = openRef ? openRef.current : state
    current.current = THREE.MathUtils.damp(current.current, target, 6, dt)
    // пока шарнир движется — просим следующий кадр (рендер по требованию)
    if (Math.abs(current.current - target) > 0.0005) st.invalidate()
    if (pivot.current) pivot.current.rotation.y = (1 - current.current) * Math.PI
    // держим модель по центру и в сложенном, и в раскрытом виде
    if (root.current) {
      root.current.position.x = -(W / 2) * (1 - current.current)
      root.current.position.z = -(D / 2) * (1 - current.current)
    }
  })

  const half = (isLeft: boolean) => (
    <>
      <Slab w={W} h={H} d={D} r={R} bevel={0.012} material={frameMat} />
      {/* внутренний экран (лицевая сторона) */}
      <Panel w={W - 0.012} h={H - 0.012} r={R - 0.008} material={blackGlass()} position={[0, 0, D / 2 + 0.0005]} />
      <Panel
        w={W - 0.04}
        h={H - 0.05}
        r={R - 0.03}
        material={screen(isLeft ? leftTex : rightTex, `fold-${isLeft ? 'l' : 'r'}-${accent}`)}
        position={[isLeft ? 0.008 : -0.008, 0, D / 2 + 0.001]}
      />
      {/* задняя сторона */}
      {isLeft ? (
        <>
          <Panel w={W - 0.03} h={H - 0.03} r={R - 0.015} material={blackGlass()} position={[0, 0, -D / 2 - 0.0005]} rotation={[0, Math.PI, 0]} />
          <Panel
            w={W - 0.07}
            h={H - 0.07}
            r={R - 0.035}
            material={screen(outerTex, `fold-outer-${accent}`)}
            position={[0, 0, -D / 2 - 0.001]}
            rotation={[0, Math.PI, 0]}
          />
          <mesh position={[0, H / 2 - 0.07, -D / 2 - 0.0015]} rotation={[0, Math.PI, 0]} material={hole()}>
            <circleGeometry args={[0.018, 24]} />
          </mesh>
        </>
      ) : (
        <>
          <Panel w={W - 0.03} h={H - 0.03} r={R - 0.015} material={backMat} position={[0, 0, -D / 2 - 0.0005]} rotation={[0, Math.PI, 0]} />
          {/* сдвоенная камера в вертикальном модуле */}
          <group position={[W / 2 - 0.2, H / 2 - 0.25, 0]}>
            <Slab w={0.2} h={0.4} d={0.016} r={0.1} bevel={0.005} material={frostedGlass(finish.back)} position={[0, 0, -D / 2 - 0.004]} />
            <Lens r={0.07} ring={finish.frame} position={[0, 0.095, -D / 2 - 0.011]} />
            <Lens r={0.07} ring={finish.frame} position={[0, -0.095, -D / 2 - 0.011]} />
            <mesh position={[-0.16, 0.08, -D / 2 - 0.0012]} rotation={[0, Math.PI, 0]} material={flash()}>
              <circleGeometry args={[0.024, 32]} />
            </mesh>
          </group>
          {/* кнопки на внешнем торце */}
          <SideButton len={0.16} material={metal(finish.frame, 0.25)} thickness={0.01} depth={0.022} position={[W / 2 + 0.002, 0.3, 0]} />
          <SideButton len={0.09} material={metal(finish.frame, 0.25)} thickness={0.01} depth={0.022} position={[W / 2 + 0.002, 0.08, 0]} />
          {/* USB-C */}
          <mesh geometry={pillGeometry(0.08, 0.022)} material={hole()} position={[0, -H / 2 - 0.0008, 0]} rotation={[Math.PI / 2, 0, 0]} />
        </>
      )}
    </>
  )

  return (
    <group ref={root}>
      {/* Правая половина — неподвижна */}
      <group position={[W / 2, 0, 0]}>{half(false)}</group>

      {/* Шарнир */}
      <mesh position={[0, 0, 0]} material={metal('#8c8c90', 0.22)}>
        <cylinderGeometry args={[D / 2, D / 2, H - 0.08, 32]} />
      </mesh>

      {/* Левая половина — вращается вокруг шарнира у лицевой плоскости */}
      <group ref={pivot} position={[0, 0, D / 2]}>
        <group position={[-W / 2, 0, -D / 2 - GAP]}>{half(true)}</group>
      </group>
    </group>
  )
})
