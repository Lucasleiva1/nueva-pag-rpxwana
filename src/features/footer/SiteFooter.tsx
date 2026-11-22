import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { brand } from '../../heroAssets'
import { MobileMotionControls } from '../../MobileMotionControls'
import { MOBILE_HERO_QUERY, useMobileHeroMotion } from '../../useMobileHeroMotion'
import { socialProfiles } from '../social/socialCards'
import './siteFooter.css'

const art = import.meta.env.BASE_URL + 'assets/footer/'
const footerProfiles = ['Instagram', 'TikTok'] as const

type Props = {
  motionEnabled: boolean
  toggleMotion: () => void
}

export function SiteFooter({ motionEnabled, toggleMotion }: Props) {
  const footer = useRef<HTMLElement>(null)
  const introReady = useRef(true)
  const mobileMotion = useMobileHeroMotion(footer, introReady, motionEnabled, '.site-footer__stage')

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

      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.26) return
        observer.disconnect()
        context.add(() => {
          gsap.from(section.querySelectorAll('[data-footer-arrival]'), {
            opacity: 0,
            x: (_index: number, item: HTMLElement) => Number(item.dataset.footerArrival),
            y: 17,
            duration: 0.53,
            stagger: 0.09,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          })
        })
      }, { threshold: 0.26 })
      observer.observe(section)
      if (useMouse) {
        section.addEventListener('pointermove', onMouseMove)
        section.addEventListener('pointerleave', reset)
        window.addEventListener('blur', reset)
        document.addEventListener('visibilitychange', reset)
      }

      return () => {
        observer.disconnect()
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
            <span />
          </div>
          <div className="site-footer__guitarist" data-footer-depth="36" data-mobile-depth="14" aria-hidden="true">
            <img src={art + 'guitarrista-v0.13.0.webp'} width="1024" height="1536" alt=""
              loading="lazy" decoding="async" draggable={false} data-footer-arrival="-32" />
          </div>
          <div className="site-footer__brand" data-footer-arrival="16">
            <img src={brand.seal} width="126" height="126" alt="" loading="lazy" decoding="async" />
            <span>ROXWANA</span>
          </div>
        </div>

        <div className="site-footer__message" data-footer-depth="6" data-mobile-depth="3">
          <div data-footer-arrival="26">
            <h2 id="site-footer-title" className="poster site-footer__headline">¿Listo para hacer ruido?</h2>
          </div>
          <div data-footer-arrival="-22">
            <p className="poster poster-red site-footer__subline">Hablá con ROXWANA</p>
          </div>
        </div>

        <div className="site-footer__actions">
          <nav className="site-footer__networks" aria-label="Redes del pie de página">
            {footerProfiles.map((profile) => (
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

        {mobileMotion.isMobile && (
          <div className="site-footer__motion">
            <MobileMotionControls motion={mobileMotion} enabled={motionEnabled} toggleMotion={toggleMotion} />
          </div>
        )}
        <p className="site-footer__copyright">© ROXWANA · Identidad, diseño y actitud</p>
      </div>
    </footer>
  )
}
