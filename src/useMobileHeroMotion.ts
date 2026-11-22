import { useEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'
import { listenToTilt, normalizeMotion, orientationSensor, type MotionPoint } from './deviceTilt'

export const MOBILE_HERO_QUERY = '(max-width: 1024px) and (any-pointer: coarse)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const neutral = { x: 0, y: 0 }
const TOUCH_RANGE = 72
const TOUCH_DEAD_ZONE = 4

type TiltStatus = 'idle' | 'requesting' | 'enabled' | 'denied' | 'unsupported' | 'error'
type Controls = { toggleTilt: () => void; recalibrate: () => void }

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
  const [status, setStatus] = useState<TiltStatus>('idle')
  const controls = useRef<Controls>(null)

  useEffect(() => {
    const section = hero.current
    const visual = section?.querySelector(visualSelector)
    if (!mobile || !enabled || !section || !visual) return

    setStatus('idle')
    const layers = Array.from(section.querySelectorAll<HTMLElement>('[data-mobile-depth]'), element => ({
      depth: Number(element.dataset.mobileDepth),
      x: gsap.quickTo(element, 'x', { duration: 0.32, ease: 'power3.out' }),
      y: gsap.quickTo(element, 'y', { duration: 0.32, ease: 'power3.out' }),
    }))
    let visible = true
    let gesture: (MotionPoint & { id: number }) | undefined
    let sensor: ReturnType<typeof listenToTilt> | undefined
    let request = 0
    let pending = false
    let scrollContext: gsap.Context | undefined
    let disposed = false

    const move = ({ x, y }: MotionPoint) => {
      const amount = (reduced ? 0.45 : 1) * (window.innerWidth < 376 ? 0.77 : 1)
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
      const active = visible && !document.hidden
      sensor?.setActive(active)
      if (!active) reset()
    }

    const stop = () => {
      request += 1
      pending = false
      sensor?.setActive(false)
      sensor = undefined
      reset()
    }

    const toggleTilt = async () => {
      if (sensor || pending) {
        stop()
        setStatus('idle')
        return
      }

      const api = orientationSensor()
      if (!window.isSecureContext || !api) {
        setStatus('unsupported')
        return
      }

      const attempt = ++request
      pending = true
      setStatus('requesting')
      try {
        // Invoke Safari's permission method directly in the button gesture.
        const permission = api.requestPermission ? await api.requestPermission() : 'granted'
        if (request !== attempt) return
        pending = false
        if (permission !== 'granted') {
          setStatus('denied')
          return
        }

        reset()
        sensor = listenToTilt({
          move: point => { if (introReady.current && visible && !document.hidden) move(point) },
          ready: () => setStatus('enabled'),
          unavailable: () => {
            stop()
            setStatus('error')
          },
        })
        syncVisibility()
      } catch (error) {
        if (request !== attempt) return
        stop()
        setStatus(error instanceof DOMException && error.name === 'NotAllowedError' ? 'denied' : 'error')
      }
    }

    const touchStart = (event: PointerEvent) => {
      if (reduced || sensor || pending || !visible || !introReady.current || event.pointerType !== 'touch' || !event.isPrimary) return
      if (event.target instanceof Element && event.target.closest('button, a')) return
      const box = visual.getBoundingClientRect()
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) return
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY }
    }

    const touchMove = (event: PointerEvent) => {
      if (gesture?.id !== event.pointerId) return
      move({
        x: normalizeMotion(event.clientX - gesture.x, TOUCH_RANGE, TOUCH_DEAD_ZONE),
        y: normalizeMotion(event.clientY - gesture.y, TOUCH_RANGE, TOUCH_DEAD_ZONE),
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
    if (!reduced && scrollingLayer) {
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

    controls.current = { toggleTilt, recalibrate: () => sensor?.recalibrate() }
    return () => {
      disposed = true
      stop()
      controls.current = null
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

  return {
    isMobile: mobile,
    reduced,
    status,
    toggleTilt: () => controls.current?.toggleTilt(),
    recalibrate: () => controls.current?.recalibrate(),
  }
}
