import * as THREE from 'three'

/**
 * Процедурные текстуры экранов, нарисованные на 2D-canvas.
 * Никаких внешних изображений — всё генерируется в браузере.
 */
const cache = new Map<string, THREE.CanvasTexture>()

function make(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  tex.needsUpdate = true
  cache.set(key, tex)
  return tex
}

const FONT = '-apple-system, "SF Pro Display", "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

function blob(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, color)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

const now = () => {
  const d = new Date()
  const time = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  const date = d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
  return { time, date }
}

/** Экран блокировки смартфона в тоне корпуса */
export function phoneWallpaper(accent: string, variant: 'portrait' | 'wide' = 'portrait') {
  const w = variant === 'wide' ? 1024 : 512
  const h = variant === 'wide' ? 820 : 1080
  return make(`phone:${accent}:${variant}`, w, h, (ctx) => {
    const base = new THREE.Color(accent)
    const hsl = { h: 0, s: 0, l: 0 }
    base.getHSL(hsl)
    const deep = new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s * 0.9 + 0.1), 0.12).getStyle()
    const mid = new THREE.Color().setHSL(hsl.h, Math.min(1, hsl.s + 0.25), 0.45).getStyle()
    const light = new THREE.Color().setHSL((hsl.h + 0.08) % 1, Math.min(1, hsl.s + 0.3), 0.72).getStyle()

    const g = ctx.createLinearGradient(0, 0, w * 0.4, h)
    g.addColorStop(0, deep)
    g.addColorStop(1, '#050507')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    blob(ctx, w * 0.25, h * 0.7, w * 0.8, mid)
    blob(ctx, w * 0.85, h * 0.35, w * 0.6, light)
    blob(ctx, w * 0.5, h * 1.05, w * 0.7, 'rgba(255,255,255,0.25)')

    // мягкие «шелковые» волны
    ctx.globalAlpha = 0.18
    ctx.strokeStyle = '#ffffff'
    for (let i = 0; i < 9; i++) {
      ctx.lineWidth = 1.5
      ctx.beginPath()
      for (let x = 0; x <= w; x += 8) {
        const y = h * 0.55 + i * 18 + Math.sin(x / (60 + i * 6) + i) * 40
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    const { time, date } = now()
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.textAlign = 'center'
    ctx.font = `500 ${variant === 'wide' ? 34 : 26}px ${FONT}`
    ctx.fillText(date.charAt(0).toUpperCase() + date.slice(1), w / 2, h * 0.14)
    ctx.font = `600 ${variant === 'wide' ? 210 : 150}px ${FONT}`
    ctx.fillText(time, w / 2, h * (variant === 'wide' ? 0.42 : 0.29))

    // виджеты-капсулы
    ctx.fillStyle = 'rgba(255,255,255,0.14)'
    const pw = variant === 'wide' ? 140 : 96
    for (let i = 0; i < 3; i++) {
      const x = w / 2 - (pw * 3 + 24) / 2 + i * (pw + 12)
      roundRect(ctx, x, h * (variant === 'wide' ? 0.5 : 0.34), pw, pw * 0.62, 22)
    }
    // нижние кнопки
    ctx.fillStyle = 'rgba(255,255,255,0.16)'
    ctx.beginPath()
    ctx.arc(w * 0.17, h * 0.92, 34, 0, Math.PI * 2)
    ctx.arc(w * 0.83, h * 0.92, 34, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    roundRect(ctx, w / 2 - 70, h * 0.975, 140, 7, 4)
  })
}

const halves = new Map<string, THREE.Texture>()

/** Левая/правая половина широкого экрана складного смартфона (кэшируется) */
export function phoneWallpaperHalf(accent: string, side: 'left' | 'right') {
  const key = `${accent}:${side}`
  let t = halves.get(key)
  if (!t) {
    t = phoneWallpaper(accent, 'wide').clone()
    t.repeat.set(0.5, 1)
    t.offset.set(side === 'left' ? 0 : 0.5, 0)
    t.needsUpdate = true
    halves.set(key, t)
  }
  return t
}

/** Рабочий стол ноутбука / моноблока: абстрактные обои и окна */
export function desktopWallpaper(accent: string) {
  return make(`desk:${accent}`, 1280, 820, (ctx, w, h) => {
    const base = new THREE.Color(accent)
    const hsl = { h: 0, s: 0, l: 0 }
    base.getHSL(hsl)
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, new THREE.Color().setHSL(hsl.h, 0.55, 0.2).getStyle())
    g.addColorStop(1, new THREE.Color().setHSL((hsl.h + 0.12) % 1, 0.6, 0.55).getStyle())
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    blob(ctx, w * 0.2, h * 0.8, w * 0.6, 'rgba(255,255,255,0.35)')
    blob(ctx, w * 0.85, h * 0.2, w * 0.5, new THREE.Color().setHSL((hsl.h + 0.5) % 1, 0.7, 0.6).getStyle())

    // строка меню
    ctx.fillStyle = 'rgba(255,255,255,0.28)'
    ctx.fillRect(0, 0, w, 26)
    // окна
    const win = (x: number, y: number, ww: number, hh: number, a: number) => {
      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,0.35)'
      ctx.shadowBlur = 40
      ctx.shadowOffsetY = 16
      ctx.fillStyle = `rgba(250,250,252,${a})`
      roundRect(ctx, x, y, ww, hh, 18)
      ctx.restore()
      ctx.fillStyle = 'rgba(0,0,0,0.06)'
      roundRect(ctx, x, y, ww, 44, 18)
      ;['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
        ctx.fillStyle = c
        ctx.beginPath()
        ctx.arc(x + 24 + i * 22, y + 22, 7, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      for (let i = 0; i < 5; i++) roundRect(ctx, x + 28, y + 72 + i * 34, ww * (0.4 + ((i * 37) % 40) / 100), 14, 7)
    }
    win(w * 0.12, h * 0.16, w * 0.46, h * 0.56, 0.92)
    win(w * 0.46, h * 0.3, w * 0.4, h * 0.5, 0.96)
    // док
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    roundRect(ctx, w * 0.3, h - 74, w * 0.4, 58, 20)
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = new THREE.Color().setHSL((i * 0.11 + hsl.h) % 1, 0.6, 0.6).getStyle()
      roundRect(ctx, w * 0.3 + 18 + i * ((w * 0.4 - 36) / 9), h - 66, 42, 42, 11)
    }
  })
}

/** Циферблат часов */
export function watchFace(accent: string, ultra = false) {
  return make(`watch:${accent}:${ultra}`, 512, 620, (ctx, w, h) => {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, w, h)
    const { time } = now()
    ctx.textAlign = 'center'
    if (ultra) {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2
        const r1 = 230
        const r2 = i % 5 === 0 ? 205 : 218
        ctx.lineWidth = i % 5 === 0 ? 4 : 2
        ctx.beginPath()
        ctx.moveTo(w / 2 + Math.cos(a) * r1, h / 2 + Math.sin(a) * r1)
        ctx.lineTo(w / 2 + Math.cos(a) * r2, h / 2 + Math.sin(a) * r2)
        ctx.stroke()
      }
    }
    ctx.fillStyle = accent
    ctx.font = `700 150px ${FONT}`
    ctx.fillText(time, w / 2, h / 2 + 40)
    const rings: [string, number][] = [
      ['#fa114f', 0.82],
      ['#a6ff00', 0.64],
      ['#00e1ff', 0.48],
    ]
    rings.forEach(([c, p], i) => {
      const r = 46 - i * 13
      ctx.lineWidth = 10
      ctx.strokeStyle = c + '44'
      ctx.beginPath()
      ctx.arc(w / 2, h * 0.79, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeStyle = c
      ctx.beginPath()
      ctx.arc(w / 2, h * 0.79, r, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2)
      ctx.stroke()
    })
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.font = `600 34px ${FONT}`
    const d = new Date().toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' })
    ctx.fillText(d.toUpperCase(), w / 2, h * 0.22)
  })
}

/** Главный экран планшета */
export function tabletWallpaper(accent: string) {
  return make(`tab:${accent}`, 820, 1100, (ctx, w, h) => {
    const base = new THREE.Color(accent)
    const hsl = { h: 0, s: 0, l: 0 }
    base.getHSL(hsl)
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, new THREE.Color().setHSL(hsl.h, 0.6, 0.62).getStyle())
    g.addColorStop(1, new THREE.Color().setHSL((hsl.h + 0.6) % 1, 0.5, 0.18).getStyle())
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    blob(ctx, w * 0.8, h * 0.85, w * 0.7, 'rgba(255,255,255,0.3)')
    const cols = 5
    const size = 92
    const gap = (w - cols * size) / (cols + 1)
    for (let r = 0; r < 4; r++) {
      for (let col = 0; col < cols; col++) {
        ctx.fillStyle = new THREE.Color().setHSL((r * 0.17 + col * 0.09) % 1, 0.55, 0.62).getStyle()
        roundRect(ctx, gap + col * (size + gap), 140 + r * (size + 70), size, size, 24)
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.28)'
    roundRect(ctx, w * 0.12, h - 150, w * 0.76, 120, 40)
  })
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
  ctx.fill()
}
