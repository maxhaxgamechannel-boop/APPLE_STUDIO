import { memo } from 'react'
import type { ModelKind } from '@/types'
import type { DeviceFinish } from './models/parts'
import { Phone } from './models/Phone'
import { FoldPhone } from './models/FoldPhone'
import { Laptop } from './models/Laptop'
import { Tablet } from './models/Tablet'
import { IMac, MacMini } from './models/Desktop'
import { Watch } from './models/Watch'
import { Earbuds, Headphones } from './models/Audio'
import { Cable, Charger, MagSafe, PhoneCase, Pencil, Tag } from './models/Accessories'

/** Масштаб и смещение, чтобы любое устройство занимало примерно одинаковый объём в кадре */
export const FRAMING: Record<ModelKind, { scale: number; y?: number; rotY?: number }> = {
  phone: { scale: 1, rotY: -0.35 },
  fold: { scale: 0.95, rotY: -0.3 },
  laptop: { scale: 0.68, y: 0.05, rotY: -0.45 },
  imac: { scale: 0.72, y: -0.1, rotY: -0.35 },
  mini: { scale: 1.25, y: -0.05, rotY: -0.6 },
  tablet: { scale: 0.66, rotY: -0.35 },
  watch: { scale: 1.15, rotY: -0.5 },
  earbuds: { scale: 1.15, rotY: -0.25 },
  headphones: { scale: 1.1, y: -0.1, rotY: -0.5 },
  charger: { scale: 1.9 },
  cable: { scale: 1.15 },
  magsafe: { scale: 1.5 },
  case: { scale: 1, rotY: 2.6 },
  tag: { scale: 1.9 },
  pencil: { scale: 0.75 },
}

export interface DeviceModelProps {
  kind: ModelKind
  finish: DeviceFinish
  variant?: string
  size?: number
  state?: number
  openRef?: { current: number }
}

/** Единая точка выбора процедурной модели по типу устройства */
export const DeviceModel = memo(function DeviceModel({ kind, ...p }: DeviceModelProps) {
  switch (kind) {
    case 'phone':
      return <Phone {...p} />
    case 'fold':
      return <FoldPhone {...p} />
    case 'laptop':
      return <Laptop {...p} />
    case 'tablet':
      return <Tablet {...p} />
    case 'imac':
      return <IMac {...p} />
    case 'mini':
      return <MacMini {...p} />
    case 'watch':
      return <Watch {...p} />
    case 'earbuds':
      return <Earbuds {...p} />
    case 'headphones':
      return <Headphones {...p} />
    case 'charger':
      return <Charger {...p} />
    case 'cable':
      return <Cable {...p} />
    case 'magsafe':
      return <MagSafe {...p} />
    case 'case':
      return <PhoneCase {...p} />
    case 'tag':
      return <Tag {...p} />
    case 'pencil':
      return <Pencil {...p} />
    default:
      return null
  }
})

/** Модель, отнормированная по размеру — для каталога и превью */
export function FramedDevice(props: DeviceModelProps) {
  const f = FRAMING[props.kind]
  return (
    <group scale={f.scale} position={[0, f.y ?? 0, 0]} rotation={[0, f.rotY ?? 0, 0]}>
      <DeviceModel {...props} />
    </group>
  )
}
