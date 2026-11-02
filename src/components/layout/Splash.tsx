import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useUI } from '@/store/ui'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { LogoMark } from '../ui/Logo'

const KEY = 'apple-studio-intro-seen'

/**
 * Минималистичная белая заставка: знак проявляется, буквы APPLE STUDIO
 * поднимаются по одной, тонкая линия прогресса — затем экран растворяется.
 * Показывается один раз за сессию; с prefers-reduced-motion — мгновенно.
 */
export function Splash() {
  const setIntroDone = useUI((s) => s.setIntroDone)
  const reduced = usePrefersReducedMotion()
  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem(KEY) !== '1'
    } catch {
      return true
    }
  })
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!visible || reduced) {
      setVisible(false)
      setIntroDone(true)
    }
  }, [visible, reduced, setIntroDone])

  useLayoutEffect(() => {
    if (!visible || reduced || !root.current) return
    document.body.style.overflow = 'hidden'
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          try {
            sessionStorage.setItem(KEY, '1')
          } catch {
            /* приватный режим */
          }
          document.body.style.overflow = ''
          setVisible(false)
        },
      })
      tl.from('.sp-mark', { scale: 0.6, opacity: 0, rotate: -30, duration: 0.8, ease: 'expo.out' })
        .from('.sp-char', { yPercent: 110, opacity: 0, duration: 0.7, stagger: 0.035, ease: 'expo.out' }, '-=0.5')
        .from('.sp-line', { scaleX: 0, duration: 0.8, ease: 'power3.inOut' }, '-=0.55')
        .from('.sp-sub', { opacity: 0, y: 8, duration: 0.5 }, '-=0.5')
        // телефон начинает вылет ещё под растворяющейся заставкой — переход бесшовный
        .add(() => setIntroDone(true), '+=0.05')
        .to('.sp-inner', { y: -24, opacity: 0, duration: 0.5, ease: 'power3.in' }, '+=0.05')
        .to(root.current, { opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
    }, root)
    // страховка: даже если анимация не доиграет, страница не останется заблокированной
    const safety = window.setTimeout(() => {
      document.body.style.overflow = ''
      setIntroDone(true)
      setVisible(false)
    }, 4500)
    return () => {
      window.clearTimeout(safety)
      ctx.revert()
      document.body.style.overflow = ''
    }
  }, [visible, reduced, setIntroDone])

  if (!visible || reduced) return null

  const word = 'APPLE STUDIO'
  return (
    <div ref={root} className="fixed inset-0 z-[100] grid place-items-center bg-paper" aria-hidden>
      <div className="sp-inner flex flex-col items-center">
        <LogoMark className="sp-mark mb-7 h-14 w-14" />
        <div className="flex overflow-hidden text-[clamp(1.6rem,4.5vw,2.6rem)] font-semibold tracking-[0.32em] text-ink">
          {word.split('').map((ch, i) => (
            <span key={i} className="sp-char inline-block" style={{ width: ch === ' ' ? '0.6em' : undefined }}>
              {ch}
            </span>
          ))}
        </div>
        <div className="sp-line mt-6 h-px w-48 origin-left bg-gradient-to-r from-transparent via-ink/50 to-transparent" />
        <p className="sp-sub mt-4 text-xs uppercase tracking-[0.3em] text-mute">Техника Apple в 3D</p>
      </div>
    </div>
  )
}
