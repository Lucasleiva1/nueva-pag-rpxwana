import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { brand } from '../../heroAssets'
import { useScrollReveal } from '../../useScrollReveal'
import { MOBILE_HERO_QUERY, useMobileHeroMotion } from '../../useMobileHeroMotion'
import { socialProfiles, visibleSocialProfiles } from '../social/socialCards'
import './siteFooter.css'

const art = import.meta.env.BASE_URL + 'assets/footer/'

type Props = {
  motionEnabled: boolean
}

export function SiteFooter({ motionEnabled }: Props) {
  const footer = useRef<HTMLElement>(null)
  useScrollReveal(footer, motionEnabled)
  const introReady = useRef(true)
  useMobileHeroMotion(footer, introReady, motionEnabled, '.site-footer__stage')

  useEffect(() => {
    if (window.location.hash === '#pie') footer.current?.scrollIntoView()
  }, [])

  useGSAP(() => {
    const section = footer.current
    if (!section || !motionEnabled) return

    const media = gsap.matchMedia()
    media.add({
      animate: '(prefers-reduced-motion: no-preference)',
      pointer: '(any-hover: hover) and (any-pointer: fine)',
      mobile: MOBILE_HERO_QUERY,
    }, (context) => {
      if (!context.conditions?.animate) return
      const useMouse = context.conditions.pointer && !context.conditions.mobile
      const layers = useMouse
        ? Array.from(section.querySelectorAll<HTMLElement>('[data-footer-depth]'), (element) => {
          const depth = Number(element.dataset.footerDepth)
          const tween = { duration: 0.33 + Math.abs(depth) * 0.004, ease: 'power3.out' }
          return { depth, x: gsap.quickTo(element, 'x', tween), y: gsap.quickTo(element, 'y', tween) }
        })
        : []

      const reset = () => layers.forEach(({ x, y }) => { x(0); y(0) })
      const onMouseMove = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' || document.hidden) return
        const bounds = section.getBoundingClientRect()
        const xOffset = gsap.utils.clamp(-1, 1, (event.clientX - bounds.left) / bounds.width * 2 - 1)
        const yOffset = gsap.utils.clamp(-1, 1, (event.clientY - bounds.top) / bounds.height * 2 - 1)
        layers.forEach(({ x, y, depth }) => {
          x(xOffset * depth)
          y(yOffset * depth * 0.65)
        })
      }

      if (useMouse) {
        section.addEventListener('pointermove', onMouseMove)
        section.addEventListener('pointerleave', reset)
        window.addEventListener('blur', reset)
        document.addEventListener('visibilitychange', reset)
      }

      return () => {
        section.removeEventListener('pointermove', onMouseMove)
        section.removeEventListener('pointerleave', reset)
        window.removeEventListener('blur', reset)
        document.removeEventListener('visibilitychange', reset)
      }
    })
    return () => media.revert()
  }, { scope: footer, dependencies: [motionEnabled], revertOnUpdate: true })

  return (
    <footer id="pie" className="site-footer" ref={footer} aria-labelledby="site-footer-title">
      <div className="site-footer__wall" data-footer-depth="-18" data-mobile-depth="-5" aria-hidden="true">
        <img src={art + 'pared-urbana-v0.13.0.webp'} width="1672" height="941" alt="" loading="lazy" decoding="async" />
      </div>

      <div className="site-footer__layout">
        <div className="site-footer__stage">
          <div className="site-footer__scrap" data-footer-depth="-7" data-mobile-depth="-2" aria-hidden="true">
            <span data-scroll-reveal="38" />
          </div>
          <div className="site-footer__guitarist" data-footer-depth="36" data-mobile-depth="14" aria-hidden="true">
            <img src={art + 'guitarrista-v0.13.0.webp'} width="1024" height="1536" alt=""
              loading="lazy" decoding="async" draggable={false} data-scroll-reveal="-54" />
          </div>
          <div className="site-footer__brand" data-scroll-reveal="18" data-reveal-delay="75">
            <img src={brand.seal} width="126" height="126" alt="" loading="lazy" decoding="async" />
            <span>ROXWANA</span>
          </div>
        </div>

        <div className="site-footer__message" data-footer-depth="6" data-mobile-depth="3">
          <div data-scroll-reveal="40" data-reveal-delay="125">
            <h2 id="site-footer-title" className="poster site-footer__headline">¿Listo para hacer ruido?</h2>
          </div>
          <div data-scroll-reveal="-34" data-reveal-delay="195">
            <p className="poster poster-red site-footer__subline">Hablá con ROXWANA</p>
          </div>
        </div>

        <div className="site-footer__actions" data-scroll-reveal="0" data-reveal-delay="85">
          <nav className="site-footer__networks" aria-label="Redes del pie de página">
            {visibleSocialProfiles.map((profile) => (
              <a className="poster site-footer__link" key={profile} href={socialProfiles[profile]}
                target="_blank" rel="noopener noreferrer">
                {profile}<span aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>

          <a href="#portada" className="poster poster-sand site-footer__link site-footer__back">
            Volver arriba<span aria-hidden="true">↑</span>
          </a>
        </div>

        <p className="site-footer__copyright">© ROXWANA · Identidad, diseño y actitud</p>
      </div>
    </footer>
  )
}
