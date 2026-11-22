import { useEffect, useRef } from 'react'
import type { BlinkArt } from './artwork'

export function IdleBlink({ art, paused }: { art: BlinkArt; paused: boolean }) {
  const eyelids = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const image = eyelids.current
    if (!image || paused) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    let timer: number | undefined
    let animation: Animation | undefined

    const stop = () => {
      window.clearTimeout(timer)
      if (animation) {
        animation.onfinish = null
        animation.cancel()
        animation = undefined
      }
    }

    const schedule = (repeat = false) => {
      stop()
      if (!visible || document.hidden || !image.naturalWidth) return

      timer = window.setTimeout(() => {
        const frames = motion.matches
          ? [{ opacity: 1 }, { opacity: 1 }]
          : [
            { opacity: 0, offset: 0 },
            { opacity: 1, offset: 0.25 },
            { opacity: 1, offset: 0.66 },
            { opacity: 0, offset: 1 },
          ]
        animation = image.animate(frames, motion.matches ? 110 : 165)
        animation.onfinish = () => schedule(true)
      }, repeat ? 1800 + Math.random() * 2400 : 620)
    }

    const refresh = () => schedule()
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      schedule()
    })
    observer.observe(image)
    image.addEventListener('load', refresh)
    motion.addEventListener('change', refresh)
    document.addEventListener('visibilitychange', refresh)

    return () => {
      observer.disconnect()
      image.removeEventListener('load', refresh)
      motion.removeEventListener('change', refresh)
      document.removeEventListener('visibilitychange', refresh)
      stop()
    }
  }, [art, paused])

  return (
    <img
      ref={eyelids}
      className="tryon-eyelids"
      src={art.image}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
      style={{ left: art.left + '%', top: art.top + '%', width: art.width + '%' }}
    />
  )
}
