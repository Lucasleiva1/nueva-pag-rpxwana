import { createRoot } from 'react-dom/client'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import gsap from 'gsap'
import { Description } from './Description'
import { HeroSound } from './HeroSound'
import { useHeroMusic } from './useHeroMusic'
import { StampExperience } from './features/probador/StampExperience'
import { SocialWall } from './features/social/SocialWall'
import { SiteFooter } from './features/footer/SiteFooter'
import { contactUrl, WhatsAppLink } from './WhatsAppLink'
import { MobileMotionControls } from './MobileMotionControls'
import { MOBILE_HERO_QUERY, useMobileHeroMotion } from './useMobileHeroMotion'
import { useGSAP } from '@gsap/react'
import { backgrounds as urbanBackgrounds, brand, characters as urbanCharacters, metalBackgrounds, metalCharacters, metalSkull, rapBackgrounds, rapCharacters, NAV_ITEMS } from './heroAssets'
import '@fontsource/barlow-condensed/latin-900-italic.css'
import '@fontsource/barlow/latin-700.css'
import './hero.css'
import './mobileHero.css'

gsap.registerPlugin(useGSAP)

const scenes = {
  urbano: { label: 'Estilo urbano', backgrounds: urbanBackgrounds, characters: urbanCharacters, lead: 'frente' },
  metal: { label: 'Heavy metal', backgrounds: metalBackgrounds, characters: metalCharacters, lead: 'metal-dragon' },
  rap: { label: 'Rap', backgrounds: rapBackgrounds, characters: rapCharacters, lead: 'rap-gorra' },
} as const

type Scene = keyof typeof scenes
const sceneOrder = ['urbano', 'metal', 'rap'] as const
const autoSceneDelay = 20_000
const sceneTracks: Record<Scene, string> = {
  urbano: import.meta.env.BASE_URL + 'assets/portada-urbana-v0.19.0.mp3',
  metal: import.meta.env.BASE_URL + 'assets/portada-heavy-v0.19.0.mp3',
  rap: import.meta.env.BASE_URL + 'assets/portada-rap-v0.19.0.mp3',
}

function requestedScene(): Scene {
  const scene = new URLSearchParams(window.location.search).get('escena')
  return scene === 'metal' || scene === 'rap' ? scene : 'urbano'
}

function sceneHref(mode: Scene, motion: boolean) {
  const params = new URLSearchParams(window.location.search)
  if (mode === 'urbano') params.delete('escena')
  else params.set('escena', mode)
  if (motion) params.delete('movimiento')
  else params.set('movimiento', '0')
  return params.size ? '?' + params : window.location.pathname
}

type HeroProps = {
  mode: Scene
  motionEnabled: boolean
  onSceneChange: (mode: Scene, event: MouseEvent<HTMLAnchorElement>) => void
}

function Hero({ mode, motionEnabled, onSceneChange }: HeroProps) {
  const metal = mode === 'metal'
  const { characters, backgrounds, lead } = scenes[mode]
  const index = sceneOrder.indexOf(mode)
  const previousScene = index > 0 ? sceneOrder[index - 1] : undefined
  const nextScene = sceneOrder.at(index + 1)
  const hero = useRef<HTMLElement>(null)
  const [missing, setMissing] = useState<string[]>([])

  const introReady = useRef(!motionEnabled)
  const mobileMotion = useMobileHeroMotion(hero, introReady, motionEnabled)

  useGSAP(() => {
    const section = hero.current
    if (!section || !motionEnabled) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const compact = window.matchMedia('(max-width: 850px)').matches
    const mobile = window.matchMedia(MOBILE_HERO_QUERY).matches
    const travel = reduced ? (mobile ? 0.22 : 0.4) : compact ? 0.55 : 1
    const timeline = gsap.timeline({
      paused: true,
      defaults: { ease: 'power2.out' },
      onComplete: () => { introReady.current = true },
    })

    const reveal = (
      target: gsap.TweenTarget,
      position: { x: number; y: number; rotation?: number; scale?: number },
      duration: number,
      delay: number,
    ) => {
      const end: gsap.TweenVars = { x: 0, y: 0, opacity: 1, duration, clearProps: 'willChange' }
      if (position.rotation !== undefined) end.rotation = 0
      if (position.scale !== undefined) end.scale = 1
      gsap.set(target, { ...position, opacity: 0, willChange: 'transform, opacity' })
      timeline.to(target, end, delay)
    }

    for (const panel of backgrounds) {
      reveal('.scene-' + panel.id, { x: panel.x * travel, y: panel.y * travel }, 0.43, panel.delay)
    }

    reveal('.scene-scrap-top', { x: -42 * travel, y: -30 * travel }, 0.4, 0.16)
    reveal('.scene-scrap-bottom', { x: 55 * travel, y: 44 * travel }, 0.45, 0.31)
    if (metal) reveal('.scene-skull', { x: -30 * travel, y: 28 * travel }, 0.39, 0.39)

    for (const character of characters) {
      const layer = section.querySelector('[data-character="' + character.id + '"]')
      const image = layer?.querySelector('.character-image')
      if (!layer || !image) continue

      reveal(image, {
        x: character.x * travel,
        y: character.y * travel,
        rotation: reduced ? 0 : character.angle * travel,
        scale: reduced ? 1 : 0.97,
      }, 0.48, character.delay)
      timeline.fromTo(layer.querySelector('.vapor'),
        { opacity: 0, scale: 0.68, x: character.x * travel * 0.45, y: 14 * travel },
        { keyframes: { opacity: [0, reduced ? 0.28 : 0.48, 0], scale: [0.68, 1, 1.35], x: [character.x * travel * 0.45, 0, character.x * travel * -0.2], y: [14 * travel, 0, -22 * travel] }, duration: 0.51 },
        character.delay
      )
    }

    timeline.from('.poster', { x: 12 * travel, stagger: 0.035, duration: 0.32, clearProps: 'transform' }, 0.34)

    let frame = 0
    let waiting = true
    const start = () => {
      if (!waiting) return
      waiting = false
      window.clearTimeout(waitLimit)
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => timeline.play())
      })
    }
    const waitLimit = window.setTimeout(start, 180)
    const images = section.querySelectorAll<HTMLImageElement>('.scene-main, .character-image')
    void Promise.allSettled(Array.from(images, image => image.decode())).then(start)

    const cancelStart = () => {
      waiting = false
      window.clearTimeout(waitLimit)
      cancelAnimationFrame(frame)
    }
    const finish = () => {
      cancelStart()
      timeline.progress(1).pause()
      introReady.current = true
    }
    const replay = (event: PageTransitionEvent) => {
      if (event.persisted && new URLSearchParams(window.location.search).get('movimiento') !== '0') {
        introReady.current = false
        timeline.restart()
      }
    }
    section.addEventListener('keydown', finish)
    section.addEventListener('pointerdown', finish)
    window.addEventListener('pageshow', replay)
    return () => {
      section.removeEventListener('keydown', finish)
      section.removeEventListener('pointerdown', finish)
      window.removeEventListener('pageshow', replay)
      cancelStart()
    }
  }, { scope: hero })

  useGSAP(() => {
    const section = hero.current
    if (!section || !motionEnabled) return

    const media = gsap.matchMedia()
    media.add({
      desktop: '(any-hover: hover) and (any-pointer: fine) and (min-width: 851px)',
      mobile: MOBILE_HERO_QUERY,
    }, context => {
      if (!context.conditions?.desktop || context.conditions.mobile) return
      const layers = Array.from(section.querySelectorAll<HTMLElement>('[data-depth]'), layer => {
        const depth = Number(layer.dataset.depth)
        const options = { duration: 0.33 + Math.abs(depth) * 0.004, ease: 'power3.out' }
        return { depth, x: gsap.quickTo(layer, 'x', options), y: gsap.quickTo(layer, 'y', options) }
      })

      const reset = () => layers.forEach(({ x, y }) => { x(0); y(0) })
      const move = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' || document.hidden) return
        const bounds = section.getBoundingClientRect()
        const xOffset = gsap.utils.clamp(-1, 1, (event.clientX - bounds.left) / bounds.width * 2 - 1)
        const yOffset = gsap.utils.clamp(-1, 1, (event.clientY - bounds.top) / bounds.height * 2 - 1)
        layers.forEach(({ x, y, depth }) => {
          x(xOffset * depth)
          y(yOffset * depth * 0.65)
        })
      }
      section.addEventListener('pointermove', move)
      section.addEventListener('pointerleave', reset)
      window.addEventListener('blur', reset)
      document.addEventListener('visibilitychange', reset)
      return () => {
        section.removeEventListener('pointermove', move)
        section.removeEventListener('pointerleave', reset)
        window.removeEventListener('blur', reset)
        document.removeEventListener('visibilitychange', reset)
      }
    })

    return () => media.revert()
  }, { scope: hero, dependencies: [motionEnabled], revertOnUpdate: true })

  const heroClass = 'hero hero-' + mode +
    (motionEnabled ? ' hero-motion-enabled' : '') +
    (mobileMotion.isMobile ? ' hero-mobile' : '')
  return (
    <section id="portada" aria-label="Portada" className={heroClass} ref={hero}>
      <div className="scenery" aria-hidden="true">
        {backgrounds.map(panel => (
          <div key={panel.id} className="scene-depth" data-depth={panel.depth} data-mobile-depth={panel.mobileDepth}>
            <div className={'scene-panel scene-' + panel.id}>
              <img className="scene-main" src={panel.image} alt="" decoding="async" />
              {'fragment' in panel && <img className="scene-fragment" src={panel.image} alt="" decoding="async" />}
            </div>
          </div>
        ))}
        <div className="scene-scrap-top" />
      </div>
      <div className="scene-scrap-bottom" aria-hidden="true" />
      {metal && <img src={metalSkull} className="scene-skull" alt="" decoding="async" />}
      <header className="masthead">
        <img src={brand.mark} width="52" height="38" alt="RXW" />
        <span>Estilo urbano</span>
      </header>

      <div className="brand">
        <img className="seal" src={brand.seal} width="190" height="190" alt="Sello original de ROXWANA" />
        <h1>ROXWANA</h1>
        <div className="brand-rule" aria-hidden="true" />
        <p>Remeras gráficas</p>
      </div>

      <div className="cast">
        {characters.map(character => (
          <div key={character.id} className={'character character-' + character.id} data-character={character.id}>
            <div className="vapor" aria-hidden="true" />
            <div className="character-motion" data-depth={character.depth} data-mobile-depth={character.mobileDepth}>
              {missing.includes(character.id)
                ? <span className="missing-character">{character.alt}</span>
                : <img
                    className="character-image"
                    src={character.image}
                    alt={character.alt}
                    draggable={false}
                    fetchPriority={character.id === lead ? 'high' : 'auto'}
                    decoding="async"
                    onError={() => setMissing(previous => [...previous, character.id])}
                  />}
            </div>
          </div>
        ))}
      </div>

      <nav className="posters" aria-label="Secciones de la página">
        {NAV_ITEMS.map(item => (
          <a key={item.targetId} className={'poster poster-' + item.color} href={'#' + item.targetId}>
            <span>{item.label}</span><span className="poster-arrow" aria-hidden="true">↓</span>
          </a>
        ))}
        <a className="poster poster-sand" href={contactUrl} target="_blank" rel="noopener noreferrer">
          <span>Contacto</span><span className="poster-arrow" aria-hidden="true">↗</span>
        </a>
      </nav>

      {mobileMotion.isMobile && (
        <MobileMotionControls motion={mobileMotion} enabled={motionEnabled} />
      )}
      <footer className="hero-footer">
        <div className="scene-arrows" role="group" aria-label="Flechas de portada">
          {previousScene && (
            <a className="poster poster-sand scene-arrow" data-scene-direction="previous"
              href={sceneHref(previousScene, motionEnabled)} onClick={event => onSceneChange(previousScene, event)}
              aria-label="Portada anterior"><span aria-hidden="true">←</span></a>
          )}
          {nextScene && (
            <a className="poster poster-red scene-arrow" data-scene-direction="next"
              href={sceneHref(nextScene, motionEnabled)} onClick={event => onSceneChange(nextScene, event)}
              aria-label="Portada siguiente"><span aria-hidden="true">→</span></a>
          )}
        </div>
        <nav className="scene-switcher" aria-label="Cambiar portada">
          {sceneOrder.map(id => (
            <a
              key={id}
              href={sceneHref(id, motionEnabled)}
              aria-current={mode === id ? 'page' : undefined}
              aria-label={scenes[id].label}
              onClick={event => onSceneChange(id, event)}
            />
          ))}
        </nav>
      </footer>
    </section>
  )
}

function App() {
  const [mode, setMode] = useState(requestedScene)
  const [motionEnabled, setMotionEnabled] = useState(() => new URLSearchParams(window.location.search).get('movimiento') !== '0')
  const [autoCycle, setAutoCycle] = useState(true)
  const keyboardControl = useRef<string | null>(null)
  const music = useHeroMusic(sceneTracks[mode])
  const cue = music.cue

  useEffect(() => {
    if (!autoCycle) return
    const timer = window.setTimeout(() => {
      const next = sceneOrder.at(sceneOrder.indexOf(mode) + 1) ?? 'urbano'
      if (next === 'urbano') setAutoCycle(false)
      window.history.replaceState(window.history.state, '', sceneHref(next, motionEnabled) + window.location.hash)
      cue(sceneTracks[next])
      setMode(next)
    }, autoSceneDelay)
    return () => window.clearTimeout(timer)
  }, [autoCycle, cue, mode, motionEnabled])

  useEffect(() => {
    const control = keyboardControl.current
    keyboardControl.current = null
    if (!control) return
    const cover = document.getElementById('portada')
    const active = cover?.querySelector<HTMLElement>('.scene-switcher [aria-current="page"]')
    const arrow = control === 'dot' ? undefined
      : cover?.querySelector<HTMLElement>('[data-scene-direction="' + control + '"]')
        ?? cover?.querySelector<HTMLElement>('.scene-arrow')
    const target = arrow ?? active
    target?.focus({ preventScroll: true })
  }, [mode])

  useEffect(() => {
    const readHistory = () => {
      const next = requestedScene()
      if (next !== mode) setAutoCycle(false)
      setMode(next)
      setMotionEnabled(new URLSearchParams(window.location.search).get('movimiento') !== '0')
    }
    window.addEventListener('popstate', readHistory)
    return () => window.removeEventListener('popstate', readHistory)
  }, [mode])

  const toggleMotion = () => {
    const enabled = !motionEnabled
    window.history.replaceState(window.history.state, '', sceneHref(mode, enabled) + window.location.hash)
    setMotionEnabled(enabled)
  }

  const selectScene = (next: Scene, event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setAutoCycle(false)
    cue(sceneTracks[next])
    if (next === mode) return

    if (event.detail === 0) keyboardControl.current = event.currentTarget.dataset.sceneDirection ?? 'dot'
    window.history.pushState(window.history.state, '', sceneHref(next, motionEnabled))
    setMode(next)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <>
      <main>
        <Hero key={mode} mode={mode} motionEnabled={motionEnabled} onSceneChange={selectScene} />
        <Description onReadingChange={music.setNarrating} />
        <StampExperience />
        <SocialWall />
      </main>
      <SiteFooter motionEnabled={motionEnabled} toggleMotion={toggleMotion} />
      <WhatsAppLink />
      <HeroSound silenced={music.silenced} waitingForInteraction={music.waitingForInteraction}
        toggle={music.toggle} volume={music.volume} setVolume={music.setVolume} />
      <audio ref={music.audio} preload="none" loop />
    </>
  )
}

function restartCoverOnReload() {
  const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  if (navigation?.type !== 'reload') return

  const url = new URL(window.location.href)
  url.searchParams.delete('escena')
  url.hash = ''
  const previousRestoration = window.history.scrollRestoration
  window.history.scrollRestoration = 'manual'
  window.history.replaceState(window.history.state, '', url)
  window.scrollTo({ top: 0, behavior: 'instant' })
  window.addEventListener('pageshow', () => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' })
      window.history.scrollRestoration = previousRestoration
    })
  }, { once: true })
}

restartCoverOnReload()
createRoot(document.getElementById('root')!).render(<App />)
