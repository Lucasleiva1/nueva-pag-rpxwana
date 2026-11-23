import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { socialCards, socialProfiles } from './socialCards'
import { SocialLinks } from './SocialLinks'
import { useScrollReveal } from '../../useScrollReveal'
import './socialWall.css'

const MOBILE_WALL = '(max-width: 900px)'
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

export function SocialWall({ motionEnabled }: { motionEnabled: boolean }) {
  const section = useRef<HTMLElement>(null)
  useScrollReveal(section, motionEnabled)
  const strip = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (window.location.hash === '#redes') section.current?.scrollIntoView()
  }, [])

  useGSAP(() => {
    const track = strip.current
    if (!track || !motionEnabled) return

    const media = gsap.matchMedia()
    media.add({
      mobile: MOBILE_WALL,
      desktop: '(width > 900px)',
      reduce: REDUCED_MOTION,
      pointer: FINE_POINTER,
    }, (context) => {
      const { mobile, desktop, reduce, pointer } = context.conditions!
      if (reduce) return

      const worktop = section.current?.querySelector('.social-wall__papers')
      const layers = gsap.utils.toArray<HTMLElement>('.social-wall__depth', track)
      const move = desktop && pointer ? layers.map((layer, index) => {
        const depth = [10, 16, 8][index]
        const x = gsap.quickTo(layer, 'x', { duration: 0.4, ease: 'power3.out' })
        const y = gsap.quickTo(layer, 'y', { duration: 0.4, ease: 'power3.out' })
        return (horizontal: number, vertical: number) => {
          x(horizontal * depth)
          y(vertical * depth)
        }
      }) : []
      const shiftPaper = worktop && move.length
        ? gsap.quickTo(worktop, 'x', { duration: .6, ease: 'power3.out' })
        : undefined
      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return
        const bounds = track.getBoundingClientRect()
        const horizontal = 2 * (event.clientX - bounds.left) / bounds.width - 1
        const vertical = 2 * (event.clientY - bounds.top) / bounds.height - 1
        move.forEach((shift) => shift(horizontal, vertical))
        shiftPaper?.(-horizontal * 12)
      }
      const reset = () => {
        move.forEach((shift) => shift(0, 0))
        shiftPaper?.(0)
      }
      if (move.length) {
        track.addEventListener('pointermove', onMove)
        track.addEventListener('pointerleave', reset)
      }

      return () => {
        track.removeEventListener('pointermove', onMove)
        track.removeEventListener('pointerleave', reset)
      }
    })
    return () => media.revert()
  }, { scope: section, dependencies: [motionEnabled], revertOnUpdate: true })

  function updateActive() {
    const track = strip.current
    if (!track || !window.matchMedia(MOBILE_WALL).matches) return
    const leadingEdge = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft)
    const nearest = Array.from(track.children).reduce((best, card, index) => {
      const distance = Math.abs(card.getBoundingClientRect().left - leadingEdge)
      return distance < best.distance ? { index, distance } : best
    }, { index: 0, distance: Infinity })
    setActive(nearest.index)
  }

  function goTo(index: number) {
    const track = strip.current
    const card = track?.children[index]
    if (!track || !card) return
    const leadingEdge = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft)
    const reduce = window.matchMedia(REDUCED_MOTION).matches
      || new URLSearchParams(window.location.search).get('movimiento') === '0'
    track.scrollBy({
      left: card.getBoundingClientRect().left - leadingEdge,
      behavior: reduce ? 'instant' : 'smooth',
    })
  }

  return (
    <section id="redes" ref={section} className="social-wall" aria-labelledby="social-wall-title">
      <div className="social-wall__papers" aria-hidden="true">
        <span data-scroll-reveal="-38" />
        <span data-scroll-reveal="38" data-reveal-delay="75" />
      </div>
      <header className="social-wall__header">
        <div className="social-wall__eyebrow" data-scroll-reveal="-18">Redes sociales</div>
        <h2 id="social-wall-title" data-scroll-reveal="34" data-reveal-delay="70">El muro social</h2>
      </header>

      <ul id="afiches-sociales" ref={strip} className="social-wall__strip" onScroll={updateActive}>
        {socialCards.map((card, index) => (
          <li className="social-wall__card" key={card.id} data-scroll-reveal={(index - 1) * 38} data-reveal-delay={index * 90}>
            <div className="social-wall__depth">
              <a className="social-wall__poster" href={socialProfiles[card.network]} target="_blank" rel="noopener noreferrer"
                aria-label={card.title + ' · Ver en ' + card.network}>
                <span className="social-wall__tape" aria-hidden="true" />
                <img src={import.meta.env.BASE_URL + card.image} width="1354" height="1161" alt={card.alt} loading="lazy" decoding="async" />
                <div className="social-wall__caption">
                  <div>
                    <h3>{card.title}</h3>
                    <p>{card.detail}</p>
                  </div>
                  <span className="social-wall__network">{card.network} <span aria-hidden="true">↗</span></span>
                </div>
              </a>
            </div>
          </li>
        ))}
      </ul>

      <div className="social-wall__controls" data-scroll-reveal="0" aria-label="Navegación de afiches">
        <button type="button" aria-label="Afiche anterior" aria-controls="afiches-sociales" disabled={active === 0} onClick={() => goTo(active - 1)}>‹</button>
        <span aria-live="polite" aria-atomic="true">{active + 1} de {socialCards.length}</span>
        <button type="button" aria-label="Afiche siguiente" aria-controls="afiches-sociales" disabled={active === socialCards.length - 1} onClick={() => goTo(active + 1)}>›</button>
      </div>
      <SocialLinks />
    </section>
  )
}
