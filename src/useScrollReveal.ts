import { useLayoutEffect, useRef, type RefObject } from 'react'

export function useScrollReveal(section: RefObject<HTMLElement | null>, enabled: boolean) {
  const revealed = useRef(new WeakSet<HTMLElement>())

  useLayoutEffect(() => {
    const root = section.current
    if (!root || !enabled || typeof IntersectionObserver === 'undefined' || typeof root.animate !== 'function') return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const compact = window.matchMedia('(max-width: 900px)').matches
    const animations = new Map<HTMLElement, Animation>()
    const selector = '[data-scroll-reveal]'

    const reveal = (element: HTMLElement, immediate = false) => {
      const animation = animations.get(element)
      if (!animation) return

      if (immediate) animation.finish()
      else animation.play()
      revealed.current.add(element)
      observer.unobserve(element)
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) reveal(entry.target as HTMLElement)
      }
    }, { rootMargin: '0px 0px -32px 0px' })

    for (const element of root.querySelectorAll<HTMLElement>(selector)) {
      if (revealed.current.has(element) || element.contains(document.activeElement)) continue
      const offset = Number(element.dataset.scrollReveal) || 0
      const x = compact ? offset * .45 : offset
      const y = compact ? 14 : 24
      const delay = Number(element.dataset.revealDelay) || 0
      const opacity = getComputedStyle(element).opacity
      const frames = reduce
        ? [{ opacity: 0 }, { opacity }]
        : [{ opacity: 0, translate: x + 'px ' + y + 'px' }, { opacity, translate: '0px 0px' }]
      const animation = element.animate(frames, {
        duration: reduce ? 220 : 560,
        delay: reduce ? delay / 2 : delay,
        easing: 'cubic-bezier(.22, .72, .25, 1)',
        fill: 'backwards',
      })
      animation.pause()
      animation.currentTime = 0
      animations.set(element, animation)
      observer.observe(element)
    }

    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return
      const block = event.target.closest<HTMLElement>(selector)
      if (block) reveal(block, true)
    }
    root.addEventListener('focusin', onFocus)

    return () => {
      observer.disconnect()
      root.removeEventListener('focusin', onFocus)
      for (const animation of animations.values()) animation.cancel()
    }
  }, [enabled, section])
}
