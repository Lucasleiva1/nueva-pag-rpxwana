import { useEffect, useState, type RefObject } from 'react'
import gsap from 'gsap'

export const MOBILE_HERO_QUERY = '(max-width: 1024px) and (any-pointer: coarse)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const neutral = { x: 0, y: 0 }
const TOUCH_RANGE = 72
const TOUCH_DEAD_ZONE = 4

type MotionPoint = { x: number; y: number }

function normalizeMotion(value: number) {
  return Math.sign(value) * Math.min(1, Math.max(0, (Math.abs(value) - TOUCH_DEAD_ZONE) / (TOUCH_RANGE - TOUCH_DEAD_ZONE)))
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])
  return matches
}

export function useMobileHeroMotion(
  hero: RefObject<HTMLElement | null>,
  introReady: RefObject<boolean>,
  enabled: boolean,
  visualSelector = '.cast',
) {
  const mobile = useMediaQuery(MOBILE_HERO_QUERY)
  const reduced = useMediaQuery(REDUCED_MOTION_QUERY)

  useEffect(() => {
    const section = hero.current
    const visual = section?.querySelector(visualSelector)
    if (!mobile || reduced || !enabled || !section || !visual) return
    const layers = Array.from(section.querySelectorAll<HTMLElement>('[data-mobile-depth]'), element => ({
      depth: Number(element.dataset.mobileDepth),
      x: gsap.quickTo(element, 'x', { duration: 0.32, ease: 'power3.out' }),
      y: gsap.quickTo(element, 'y', { duration: 0.32, ease: 'power3.out' }),
    }))
    let visible = true
    let gesture: (MotionPoint & { id: number }) | undefined
    let scrollContext: gsap.Context | undefined
    let disposed = false

    const move = ({ x, y }: MotionPoint) => {
      const amount = window.innerWidth < 376 ? 0.77 : 1
      layers.forEach(layer => {
        layer.x(x * layer.depth * amount)
        layer.y(y * layer.depth * amount * 0.75)
      })
    }

    const reset = () => {
      gesture = undefined
      move(neutral)
    }

    const syncVisibility = () => {
      if (!visible || document.hidden) reset()
    }

    const touchStart = (event: PointerEvent) => {
      if (!visible || !introReady.current || event.pointerType !== 'touch' || !event.isPrimary) return
      if (event.target instanceof Element && event.target.closest('button, a')) return
      const box = visual.getBoundingClientRect()
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) return
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY }
    }

    const touchMove = (event: PointerEvent) => {
      if (gesture?.id !== event.pointerId) return
      move({
        x: normalizeMotion(event.clientX - gesture.x),
        y: normalizeMotion(event.clientY - gesture.y),
      })
    }

    const touchEnd = (event: PointerEvent) => {
      if (gesture?.id === event.pointerId) reset()
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      syncVisibility()
    }, { threshold: 0.08 })
    observer.observe(section)

    section.addEventListener('pointerdown', touchStart, { passive: true })
    section.addEventListener('pointermove', touchMove, { passive: true })
    window.addEventListener('pointerup', touchEnd, { passive: true })
    window.addEventListener('pointercancel', touchEnd, { passive: true })
    window.addEventListener('orientationchange', reset)
    document.addEventListener('visibilitychange', syncVisibility)

    const scrollingLayer = section.querySelector('.scenery')
    if (scrollingLayer) {
      void import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        if (disposed) return
        gsap.registerPlugin(ScrollTrigger)
        scrollContext = gsap.context(() => {
          gsap.to(scrollingLayer, {
            y: -12,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
          })
        }, section)
      }).catch(() => { /* The native scroll remains usable when the optional chunk fails. */ })
    }

    return () => {
      disposed = true
      observer.disconnect()
      scrollContext?.revert()
      layers.forEach(({ x, y }) => { x.tween.revert(); y.tween.revert() })
      section.removeEventListener('pointerdown', touchStart)
      section.removeEventListener('pointermove', touchMove)
      window.removeEventListener('pointerup', touchEnd)
      window.removeEventListener('pointercancel', touchEnd)
      window.removeEventListener('orientationchange', reset)
      document.removeEventListener('visibilitychange', syncVisibility)
    }
  }, [enabled, hero, introReady, mobile, reduced, visualSelector])

  return mobile
}
