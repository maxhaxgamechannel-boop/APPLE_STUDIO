import * as THREE from 'three'

/** Скруглённый прямоугольник с центром в (0,0) */
export function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  const rr = Math.min(r, w / 2, h / 2)
  s.moveTo(x + rr, y)
  s.lineTo(x + w - rr, y)
  s.quadraticCurveTo(x + w, y, x + w, y + rr)
  s.lineTo(x + w, y + h - rr)
  s.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
  s.lineTo(x + rr, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - rr)
  s.lineTo(x, y + rr)
  s.quadraticCurveTo(x, y, x + rr, y)
  return s
}

/** Нормализует UV плоской геометрии в диапазон 0..1 по её габаритам */
function normalizeUV(geo: THREE.BufferGeometry) {
  geo.computeBoundingBox()
  const bb = geo.boundingBox!
  const pos = geo.attributes.position
  const uv = new Float32Array(pos.count * 2)
  const sx = bb.max.x - bb.min.x || 1
  const sy = bb.max.y - bb.min.y || 1
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - bb.min.x) / sx
    uv[i * 2 + 1] = (pos.getY(i) - bb.min.y) / sy
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
}

const cache = new Map<string, THREE.BufferGeometry>()

function cached<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = cache.get(key) as T | undefined
  if (!g) {
    g = make()
    cache.set(key, g)
  }
  return g
}

const k = (...n: (number | string)[]) => n.map((v) => (typeof v === 'number' ? v.toFixed(4) : v)).join(':')

/**
 * Толстая «плита» со скруглёнными углами и фаской — основа корпусов.
 * Центрирована, лицевая сторона смотрит в +Z.
 */
export function slabGeometry(w: number, h: number, depth: number, radius: number, bevel = Math.min(depth * 0.35, 0.03), curve = 24) {
  return cached(k('slab', w, h, depth, radius, bevel, curve), () => {
    const inner = roundedRectShape(w - bevel * 2, h - bevel * 2, Math.max(radius - bevel, 0.001))
    const geo = new THREE.ExtrudeGeometry(inner, {
      depth: Math.max(depth - bevel * 2, 0.0005),
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 6,
      curveSegments: curve,
    })
    geo.translate(0, 0, -(depth - bevel * 2) / 2)
    geo.computeVertexNormals()
    return geo
  })
}

/** Плоская панель со скруглёнными углами и UV 0..1 (экраны, стекло) */
export function roundedPlaneGeometry(w: number, h: number, r: number, curve = 20) {
  return cached(k('plane', w, h, r, curve), () => {
    const geo = new THREE.ShapeGeometry(roundedRectShape(w, h, r), curve)
    normalizeUV(geo)
    return geo
  })
}

/** Тонкая рамка-кольцо со скруглёнными углами (полированная фаска вокруг стекла) */
export function ringPanelGeometry(w: number, h: number, r: number, t: number, curve = 24) {
  return cached(k('ring', w, h, r, t, curve), () => {
    const outer = roundedRectShape(w, h, r)
    const inner = roundedRectShape(w - t * 2, h - t * 2, Math.max(r - t, 0.001))
    outer.holes.push(new THREE.Path(inner.getPoints(curve * 4).reverse()))
    return new THREE.ShapeGeometry(outer, curve)
  })
}

/** Капсула вдоль оси X (Dynamic Island, решётки, прорези) */
export function pillGeometry(w: number, h: number) {
  return roundedPlaneGeometry(w, h, Math.min(w, h) / 2, 12)
}

/** Лента со скруглённым сечением, вытянутая по кривой (ремешки, оголовье) */
export function bandGeometry(points: THREE.Vector3[], width: number, thickness: number, steps = 64) {
  const key = k('band', width, thickness, steps, ...points.flatMap((p) => [p.x, p.y, p.z]))
  return cached(key, () => {
    const curve = new THREE.CatmullRomCurve3(points)
    const shape = roundedRectShape(thickness, width, Math.min(thickness, width) * 0.45)
    const geo = new THREE.ExtrudeGeometry(shape, { steps, bevelEnabled: false, extrudePath: curve, curveSegments: 8 })
    geo.computeVertexNormals()
    return geo
  })
}
