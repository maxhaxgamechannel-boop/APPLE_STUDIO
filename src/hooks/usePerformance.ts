/**
 * Грубая оценка мощности устройства. На слабых машинах уменьшаем
 * плотность пикселей, разрешение теней и отключаем декоративные частицы.
 */
export interface PerfProfile {
  lowPower: boolean
  maxDpr: number
}

let cached: PerfProfile | null = null

export function getPerfProfile(): PerfProfile {
  if (cached) return cached
  if (typeof navigator === 'undefined') return { lowPower: false, maxDpr: 1.5 }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const cores = nav.hardwareConcurrency ?? 8
  const memory = nav.deviceMemory ?? 8
  const saveData = !!nav.connection?.saveData
  const mobile = /Android|iPhone|iPad|iPod/i.test(nav.userAgent)
  const lowPower = saveData || cores <= 4 || memory <= 4
  cached = {
    lowPower,
    maxDpr: lowPower ? 1.25 : mobile ? 1.6 : 2,
  }
  return cached
}

export const usePerformance = () => getPerfProfile()
