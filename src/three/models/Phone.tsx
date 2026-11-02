import { memo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { Lens, HoleRow, Panel, SideButton, Slab, type ModelProps } from './parts'
import { pillGeometry, ringPanelGeometry } from '../lib/geometry'
import { aluminum, blackGlass, flash, frostedGlass, glassGlare, hole, matte, metal, polished, sapphire, screen } from '../lib/materials'
import { phoneWallpaper } from '../lib/textures'

// Пропорции близки к реальным (≈ 71,9 × 150 × 8,75 мм для модели 6,3″)
export const PHONE = { W: 0.766, H: 1.6, D: 0.088, R: 0.125 }

interface PhoneProps extends ModelProps {
  screenOn?: boolean
  /** Силиконовый чехол: матовый корпус без металла */
  silicone?: boolean
}

/**
 * Процедурный смартфон: металлическая рамка, стекло спереди и сзади,
 * Dynamic Island, блок камер (3 варианта компоновки), кнопки, USB-C, динамики.
 */
export const Phone = memo(function Phone({ finish, variant = 'pro18', size = 1, screenOn = true, silicone = false }: PhoneProps) {
  const { W, H, D, R } = PHONE
  const isPro = variant.startsWith('pro')
  const frameMat = silicone ? matte(finish.frame, 0.8) : isPro && variant === 'pro16' ? metal(finish.frame, 0.34) : aluminum(finish.frame)
  const backMat = silicone ? matte(finish.back, 0.85) : frostedGlass(finish.back)
  const btnMat = silicone ? matte(finish.frame, 0.7) : metal(finish.frame, 0.25)
  const wallpaper = phoneWallpaper(finish.swatch ?? finish.back)
  const fz = D / 2
  const bz = -D / 2

  return (
    <group scale={size}>
      {/* Корпус / рамка */}
      <Slab w={W} h={H} d={D} r={R} bevel={0.02} material={frameMat} />

      {/* ── Лицевая сторона ── */}
      {/* полированная фаска рамки вокруг стекла */}
      {!silicone && <mesh geometry={ringPanelGeometry(W - 0.006, H - 0.006, R - 0.003, 0.008)} material={polished(finish.frame)} position={[0, 0, fz + 0.0002]} />}
      <Panel w={W - 0.014} h={H - 0.014} r={R - 0.01} material={blackGlass()} position={[0, 0, fz + 0.0005]} />
      {screenOn && !silicone && (
        <Panel
          w={W - 0.042}
          h={H - 0.042}
          r={R - 0.024}
          material={screen(wallpaper, `phone-${finish.swatch ?? finish.back}`)}
          position={[0, 0, fz + 0.001]}
        />
      )}
      {/* Dynamic Island — глянцевое чёрное стекло */}
      <mesh geometry={pillGeometry(variant === 'pro18' ? 0.165 : 0.195, 0.05)} material={blackGlass('#010101')} position={[0, H / 2 - 0.078, fz + 0.0016]} />
      {/* блики защитного стекла (аддитивный слой поверх экрана) */}
      {!silicone && <Panel w={W - 0.014} h={H - 0.014} r={R - 0.01} material={glassGlare()} position={[0, 0, fz + 0.002]} />}
      {/* Динамик разговорный */}
      <mesh geometry={pillGeometry(0.11, 0.008)} material={matte('#141414')} position={[0, H / 2 - 0.022, fz + 0.0012]} />

      {/* ── Задняя сторона ── */}
      <Panel w={W - 0.04} h={H - 0.04} r={R - 0.02} material={backMat} position={[0, 0, bz - 0.0005]} rotation={[0, Math.PI, 0]} />
      <CameraModule variant={variant} finish={finish} bz={bz} silicone={silicone} />
      {/* Кольцо MagSafe (едва заметное) */}
      <mesh position={[0, -0.05, bz - 0.0008]} rotation={[0, Math.PI, 0]} material={silicone ? matte(finish.back, 0.9) : frostedGlass(finish.back)}>
        <ringGeometry args={[0.2, 0.205, 64]} />
      </mesh>

      {/* ── Кнопки ── */}
      {/* левая сторона: кнопка действия + громкость */}
      <SideButton len={0.07} material={btnMat} position={[-W / 2 - 0.002, 0.5, 0]} />
      <SideButton len={0.12} material={btnMat} position={[-W / 2 - 0.002, 0.33, 0]} />
      <SideButton len={0.12} material={btnMat} position={[-W / 2 - 0.002, 0.18, 0]} />
      {/* правая сторона: питание + управление камерой */}
      <SideButton len={0.2} material={btnMat} position={[W / 2 + 0.002, 0.3, 0]} />
      {variant !== 'case' && (
        <RoundedBox args={[0.008, 0.13, 0.03]} radius={0.004} smoothness={3} material={sapphire()} position={[W / 2 + 0.001, -0.17, 0]} />
      )}

      {/* ── Антенные вставки ── */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sy) => (
          <mesh
            key={`${sx}${sy}`}
            position={[sx * (W / 2 + 0.0004), sy * (H / 2 - 0.2), 0]}
            rotation={[0, (sx * Math.PI) / 2, 0]}
            material={matte(silicone ? finish.frame : '#8a8a8e', 0.6)}
          >
            <planeGeometry args={[0.04, 0.008]} />
          </mesh>
        )),
      )}

      {/* ── Нижний торец: USB-C, динамики, микрофоны ── */}
      <group position={[0, -H / 2 - 0.0009, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={pillGeometry(0.092, 0.028)} material={hole()} />
        <mesh geometry={pillGeometry(0.07, 0.01)} material={metal('#3a3a3c', 0.3)} position={[0, 0, 0.0005]} />
        <HoleRow count={6} spacing={0.02} r={0.006} position={[0.16, 0, 0]} />
        <HoleRow count={6} spacing={0.02} r={0.006} position={[-0.16, 0, 0]} />
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.07, 0, 0]} material={metal('#6a6a6e', 0.3)}>
            <circleGeometry args={[0.006, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  )
})

/** Блок камер в зависимости от поколения */
function CameraModule({ variant, finish, bz, silicone }: { variant: string; finish: ModelProps['finish']; bz: number; silicone: boolean }) {
  const { W, H } = PHONE
  const ring = silicone ? '#2a2a2c' : finish.frame

  if (variant === 'pro17' || variant === 'pro18' || variant === 'case') {
    // Плато во всю ширину
    const py = H / 2 - 0.27
    const plateauD = 0.03
    const surf = bz - plateauD + 0.006
    return (
      <group>
        <Slab
          w={W - 0.045}
          h={0.47}
          d={plateauD}
          r={0.11}
          bevel={0.01}
          material={silicone ? matte(finish.frame, 0.8) : aluminum(finish.frame)}
          position={[0, py, bz - plateauD / 2 + 0.006]}
        />
        {variant === 'pro18' && (
          <Panel w={0.4} h={0.43} r={0.1} material={frostedGlass(finish.back)} position={[W / 2 - 0.235, py, surf - 0.0006]} rotation={[0, Math.PI, 0]} />
        )}
        {silicone && <Panel w={0.42} h={0.43} r={0.1} material={hole()} position={[W / 2 - 0.235, py, surf - 0.0005]} rotation={[0, Math.PI, 0]} />}
        <Lens r={0.074} ring={ring} position={[W / 2 - 0.15, py + 0.1, surf]} />
        <Lens r={0.074} ring={ring} position={[W / 2 - 0.15, py - 0.1, surf]} />
        <Lens r={0.074} ring={ring} position={[W / 2 - 0.32, py, surf]} />
        <mesh position={[-(W / 2 - 0.13), py + 0.08, surf - 0.001]} rotation={[0, Math.PI, 0]} material={flash()}>
          <circleGeometry args={[0.03, 32]} />
        </mesh>
        <mesh position={[-(W / 2 - 0.13), py - 0.08, surf - 0.001]} rotation={[0, Math.PI, 0]} material={blackGlass()}>
          <circleGeometry args={[0.026, 32]} />
        </mesh>
        <mesh position={[-(W / 2 - 0.22), py, surf - 0.001]} rotation={[0, Math.PI, 0]} material={hole()}>
          <circleGeometry args={[0.006, 16]} />
        </mesh>
      </group>
    )
  }

  if (variant === 'pro16') {
    const cx = W / 2 - 0.26
    const cy = H / 2 - 0.26
    const modD = 0.014
    const surf = bz - modD + 0.004
    return (
      <group>
        <Slab w={0.44} h={0.44} d={modD} r={0.11} bevel={0.005} material={frostedGlass(finish.back)} position={[cx, cy, bz - modD / 2 + 0.004]} />
        <Lens r={0.076} ring={ring} position={[cx + 0.1, cy + 0.1, surf]} />
        <Lens r={0.076} ring={ring} position={[cx + 0.1, cy - 0.1, surf]} />
        <Lens r={0.076} ring={ring} position={[cx - 0.1, cy, surf]} />
        <mesh position={[cx - 0.1, cy + 0.14, surf - 0.001]} rotation={[0, Math.PI, 0]} material={flash()}>
          <circleGeometry args={[0.026, 32]} />
        </mesh>
        <mesh position={[cx - 0.1, cy - 0.14, surf - 0.001]} rotation={[0, Math.PI, 0]} material={blackGlass()}>
          <circleGeometry args={[0.022, 32]} />
        </mesh>
      </group>
    )
  }

  // Базовые модели: вертикальная «таблетка» с двумя камерами
  const cx = W / 2 - 0.17
  const cy = H / 2 - 0.26
  const modD = 0.012
  const surf = bz - modD + 0.004
  return (
    <group>
      <Slab w={0.21} h={0.43} d={modD} r={0.105} bevel={0.005} material={frostedGlass(finish.back)} position={[cx, cy, bz - modD / 2 + 0.004]} />
      <Lens r={0.072} ring={ring} position={[cx, cy + 0.1, surf]} />
      <Lens r={0.072} ring={ring} position={[cx, cy - 0.1, surf]} />
      <mesh position={[cx - 0.17, cy + 0.06, bz - 0.001]} rotation={[0, Math.PI, 0]} material={flash()}>
        <circleGeometry args={[0.024, 32]} />
      </mesh>
      <mesh position={[cx - 0.17, cy - 0.04, bz - 0.001]} rotation={[0, Math.PI, 0]} material={hole()}>
        <circleGeometry args={[0.006, 16]} />
      </mesh>
    </group>
  )
}
