import * as THREE from 'three'

/**
 * Библиотека материалов. Материалы кэшируются по параметрам, поэтому
 * десятки моделей в каталоге используют одни и те же экземпляры.
 */
const cache = new Map<string, THREE.Material>()

function get<T extends THREE.Material>(key: string, make: () => T): T {
  let m = cache.get(key) as T | undefined
  if (!m) {
    m = make()
    cache.set(key, m)
  }
  return m
}

/** Полированный или матовый металл корпуса */
export const metal = (color: string, roughness = 0.28) =>
  get(`metal:${color}:${roughness}`, () =>
    new THREE.MeshPhysicalMaterial({
      color,
      metalness: 1,
      roughness,
      clearcoat: 0.5,
      clearcoatRoughness: 0.14,
      anisotropy: 0.35,
      envMapIntensity: 1.4,
    }),
  )

/** Зеркально полированная кромка (фаски рамки, ободки объективов) */
export const polished = (color: string) =>
  get(`polished:${color}`, () =>
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.25),
      metalness: 1,
      roughness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.8,
    }),
  )

/**
 * Блик защитного стекла поверх экрана: чёрная основа + аддитивное смешивание,
 * так что добавляются только отражения окружения (с френелем у краёв).
 */
export const glassGlare = () =>
  get('glare', () =>
    new THREE.MeshPhysicalMaterial({
      color: '#000000',
      metalness: 0,
      roughness: 0.04,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.4,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )

/** Анодированный алюминий — чуть мягче по бликам */
export const aluminum = (color: string) =>
  get(`alu:${color}`, () =>
    new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.88,
      roughness: 0.32,
      clearcoat: 0.45,
      clearcoatRoughness: 0.22,
      anisotropy: 0.25,
      envMapIntensity: 1.25,
    }),
  )

/** Матовое (frosted) стекло задней панели */
export const frostedGlass = (color: string) =>
  get(`frost:${color}`, () =>
    new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.15,
      roughness: 0.42,
      clearcoat: 1,
      clearcoatRoughness: 0.35,
      envMapIntensity: 1,
    }),
  )

/** Глянцевое тёмное стекло (лицевая панель, линзы) */
export const blackGlass = (tint = '#050506') =>
  get(`bglass:${tint}`, () =>
    new THREE.MeshPhysicalMaterial({
      color: tint,
      metalness: 0.2,
      roughness: 0.04,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      reflectivity: 0.9,
      envMapIntensity: 1.6,
    }),
  )

/** Объектив с «просветлением» — фиолетово-синий отлив */
export const lensCoating = () =>
  get('lens', () =>
    new THREE.MeshPhysicalMaterial({
      color: '#0b0d1c',
      metalness: 0.9,
      roughness: 0.08,
      iridescence: 1,
      iridescenceIOR: 1.6,
      iridescenceThicknessRange: [200, 600],
      clearcoat: 1,
      envMapIntensity: 2,
    }),
  )

/** Матовый пластик / силикон / ткань */
export const matte = (color: string, roughness = 0.65) =>
  get(`matte:${color}:${roughness}`, () =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 }),
  )

/** Глянцевый пластик (AirPods, адаптеры) */
export const glossyPlastic = (color: string) =>
  get(`gloss:${color}`, () =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.18,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      sheen: 0.2,
      envMapIntensity: 0.9,
    }),
  )

/** Прозрачный поликарбонат */
export const clearPlastic = () =>
  get('clear', () =>
    new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.05,
      metalness: 0,
      // без transmission: он включает дополнительный проход рендера всей сцены
      transparent: true,
      opacity: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      depthWrite: false,
      envMapIntensity: 1.2,
    }),
  )

/** Почти чёрная «пустота» — разъёмы, отверстия, вырезы */
export const hole = () => get('hole', () => new THREE.MeshBasicMaterial({ color: '#050505' }))

/** Самосветящийся экран с текстурой */
export const screen = (map: THREE.Texture, key: string) =>
  get(`screen:${key}`, () =>
    new THREE.MeshPhysicalMaterial({
      color: '#000000',
      emissive: '#ffffff',
      emissiveMap: map,
      emissiveIntensity: 1,
      roughness: 0.08,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 0.6,
    }),
  )

/** Тёплая светодиодная вспышка */
export const flash = () =>
  get('flash', () =>
    new THREE.MeshPhysicalMaterial({ color: '#f7f1df', roughness: 0.2, emissive: '#ffe9b8', emissiveIntensity: 0.15, clearcoat: 1 }),
  )

/** Сапфировое стекло (кнопка управления камерой, крышки линз) */
export const sapphire = () =>
  get('sapphire', () =>
    new THREE.MeshPhysicalMaterial({ color: '#15161a', roughness: 0.02, metalness: 0.3, clearcoat: 1, envMapIntensity: 2 }),
  )

/** Сетчатая ткань (оголовье AirPods Max, амбушюры) */
export const fabric = (color: string) =>
  get(`fabric:${color}`, () =>
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.95, metalness: 0, sheen: 1, sheenColor: new THREE.Color(color).offsetHSL(0, 0, 0.15), sheenRoughness: 0.6 }),
  )
