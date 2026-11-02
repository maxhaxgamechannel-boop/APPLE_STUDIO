import type { ModelKind } from '@/types'
import { cn } from '@/lib/format'

/**
 * Лёгкая векторная иллюстрация устройства. Используется как заглушка
 * во время загрузки 3D, в корзине и поиске, а также как fallback без WebGL.
 */
export function DeviceSilhouette({ kind, color = '#d2d2d7', className }: { kind: ModelKind; color?: string; className?: string }) {
  const stroke = '#1d1d1f'
  const common = { fill: color, stroke, strokeOpacity: 0.12, strokeWidth: 1.5 }
  const glass = { fill: '#111214' }
  let body: React.ReactNode
  switch (kind) {
    case 'phone':
    case 'case':
      body = (
        <>
          <rect x="34" y="8" width="52" height="104" rx="11" {...common} />
          <rect x="37.5" y="11.5" width="45" height="97" rx="8.5" {...glass} />
          <rect x="52" y="15" width="16" height="4.5" rx="2.25" fill="#000" />
          <rect x="40" y="24" width="40" height="60" rx="6" fill="url(#scr)" opacity="0.9" />
        </>
      )
      break
    case 'fold':
      body = (
        <>
          <rect x="14" y="20" width="92" height="74" rx="9" {...common} />
          <rect x="17" y="23" width="86" height="68" rx="7" {...glass} />
          <rect x="20" y="26" width="80" height="62" rx="5" fill="url(#scr)" opacity="0.9" />
          <line x1="60" y1="20" x2="60" y2="94" stroke="#fff" strokeOpacity="0.15" />
        </>
      )
      break
    case 'tablet':
      body = (
        <>
          <rect x="26" y="8" width="68" height="100" rx="9" {...common} />
          <rect x="30" y="12" width="60" height="92" rx="5" {...glass} />
          <rect x="33" y="15" width="54" height="86" rx="3" fill="url(#scr)" opacity="0.9" />
        </>
      )
      break
    case 'laptop':
      body = (
        <>
          <rect x="22" y="18" width="76" height="52" rx="5" {...common} />
          <rect x="25" y="21" width="70" height="46" rx="3" {...glass} />
          <rect x="27" y="24" width="66" height="41" rx="2" fill="url(#scr)" opacity="0.9" />
          <path d="M10 74h100l-6 8H16l-6-8Z" {...common} />
        </>
      )
      break
    case 'imac':
      body = (
        <>
          <rect x="16" y="10" width="88" height="68" rx="5" {...common} />
          <rect x="20" y="14" width="80" height="48" rx="2" fill="url(#scr)" opacity="0.9" />
          <path d="M50 78h20l4 26H46l4-26Z" {...common} />
          <rect x="40" y="102" width="40" height="4" rx="2" {...common} />
        </>
      )
      break
    case 'mini':
      body = (
        <>
          <rect x="26" y="50" width="68" height="26" rx="9" {...common} />
          <circle cx="86" cy="64" r="1.2" fill="#3fd47b" />
        </>
      )
      break
    case 'watch':
      body = (
        <>
          <rect x="45" y="4" width="30" height="34" rx="6" {...common} />
          <rect x="45" y="82" width="30" height="34" rx="6" {...common} />
          <rect x="36" y="30" width="48" height="60" rx="14" {...common} />
          <rect x="41" y="35" width="38" height="50" rx="10" {...glass} />
          <rect x="84" y="46" width="5" height="12" rx="2" {...common} />
        </>
      )
      break
    case 'earbuds':
      body = (
        <>
          <rect x="36" y="46" width="48" height="40" rx="17" fill="#f7f7f7" stroke={stroke} strokeOpacity="0.12" />
          <path d="M18 30c0-7 10-9 13-3l1 30h-6l-8-27Z" fill="#f7f7f7" stroke={stroke} strokeOpacity="0.12" />
          <path d="M102 30c0-7-10-9-13-3l-1 30h6l8-27Z" fill="#f7f7f7" stroke={stroke} strokeOpacity="0.12" />
        </>
      )
      break
    case 'headphones':
      body = (
        <>
          <path d="M28 64c0-30 14-46 32-46s32 16 32 46" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
          <rect x="18" y="58" width="22" height="34" rx="10" {...common} />
          <rect x="80" y="58" width="22" height="34" rx="10" {...common} />
        </>
      )
      break
    default:
      body = (
        <>
          <rect x="38" y="38" width="44" height="44" rx="10" fill="#f7f7f7" stroke={stroke} strokeOpacity="0.12" />
          <circle cx="60" cy="60" r="10" fill="none" stroke={stroke} strokeOpacity="0.2" />
        </>
      )
  }
  return (
    <svg viewBox="0 0 120 120" className={cn('h-full w-full', className)} aria-hidden>
      <defs>
        <linearGradient id="scr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.9" />
          <stop offset="1" stopColor="#0a0a12" />
        </linearGradient>
      </defs>
      {body}
    </svg>
  )
}
