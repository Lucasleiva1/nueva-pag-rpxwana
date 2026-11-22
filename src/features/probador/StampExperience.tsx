import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { backdrop, modelIds, models, placement, type ModelId, type Pose } from './artwork'
import { stamps, childStamps } from './catalog'
import { defaultAdjustment } from './adjustments'
import { StampAdjuster } from './StampAdjuster'
import { IdleBlink } from './IdleBlink'
import { usePrintAdjustments } from './usePrintAdjustments'
import { useStampReaction } from './useStampReaction'
import './stampExperience.css'

const calibration = (() => {
  if (!import.meta.env.DEV) return null
  const pose = new URLSearchParams(window.location.search).get('calibrar')
  return pose === 'neutra' || pose === 'mirada' || pose === 'reaccion' ? pose : null
})()

const modelPosterColors = { mujer: 'paper', hombre: 'red', nino: 'gold' } as const

export function StampExperience() {
  const section = useRef<HTMLElement>(null)
  const [modelId, setModelId] = useState<ModelId>(() => {
    const requested = new URLSearchParams(window.location.search).get('modelo')
    return modelIds.find(id => id === requested) ?? 'mujer'
  })
  const model = models[modelId]
  const catalog = modelId === 'nino' ? childStamps : stamps
  const { view, message, select, prepareReaction, resetPose } = useStampReaction(model.frames)
  const editor = usePrintAdjustments(modelId)
  const pose: Pose = view.pose ?? calibration ?? 'neutra'
  const lookingDown = view.lookingDown || (view.pose === null && calibration !== null && calibration !== 'neutra')
  const stampId = view.stamp?.id
  const adjustment = stampId ? editor.drafts[stampId] ?? editor.saved[stampId] ?? defaultAdjustment : defaultAdjustment
  const zone = placement(modelId, pose, 'centro', adjustment, view.ratio)

  const chooseModel = (id: ModelId) => {
    if (id === modelId) return
    resetPose((id === 'nino') !== (modelId === 'nino'))
    setModelId(id)
    const url = new URL(window.location.href)
    if (id === 'mujer') url.searchParams.delete('modelo')
    else url.searchParams.set('modelo', id)
    window.history.replaceState(window.history.state, '', url)
  }

  useLayoutEffect(() => {
    if (window.location.hash === '#probador') section.current?.scrollIntoView()
  }, [])

  useEffect(() => {
    const element = section.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      void prepareReaction()
    }, { rootMargin: '180px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [prepareReaction])

  return (
    <section id="probador" className="tryon" ref={section} aria-labelledby="tryon-title">
      <img src={backdrop} className="tryon-backdrop" loading="lazy" decoding="async" alt="" />
      <div className={import.meta.env.DEV ? "tryon-layout tryon-layout-dev" : "tryon-layout"}>
        <header className="tryon-heading">
          <h2 id="tryon-title">Cambiá <span>la estampa</span></h2>
          <p>Elegí un diseño y mirá cómo queda en la remera.</p>
          <div className="tryon-model-picker" role="group" aria-label="Modelo del probador">
            {modelIds.map(id => (
              <button type="button" key={id} className={'poster poster-' + modelPosterColors[id]}
                aria-pressed={modelId === id} onClick={() => chooseModel(id)}>
                {models[id].label}
              </button>
            ))}
          </div>
        </header>

        <div className="tryon-stage">
          <div className="tryon-model" style={{ aspectRatio: model.portraitRatio }} data-model={modelId} data-pose={pose} data-looking-down={lookingDown}>
            <img className="tryon-portrait tryon-arms-rest" src={model.frames.neutra} alt=""
              loading="lazy" decoding="async" draggable={false} />
            <img className="tryon-portrait tryon-arms-up" src={model.frames.reaccion} alt=""
              loading="lazy" decoding="async" draggable={false} />
            <img className="tryon-portrait tryon-front" src={model.frames.neutra}
              alt={model.label + ' con remera negra probando estampas'}
              loading="lazy" decoding="async" draggable={false} />
            <img className="tryon-portrait tryon-head tryon-head-rest" src={model.frames.neutra} alt=""
              loading="lazy" decoding="async" draggable={false} />
            <img className="tryon-portrait tryon-head tryon-head-down" src={model.frames.mirada} alt=""
              loading="lazy" decoding="async" draggable={false} />
            <IdleBlink art={model.blink} paused={lookingDown || pose !== 'neutra'} />
            <div className="tryon-print-window" style={{
              left: zone.x + '%',
              top: zone.y + '%',
              width: zone.width + '%',
              height: zone.height + '%',
              transform: 'rotate(' + zone.rotation + 'deg)',
            }}>
              <div className="tryon-print">
                {view.stamp && <img src={view.stamp.src} alt={'Estampa ' + view.stamp.title} draggable={false} />}
              </div>
            </div>
            <img className="tryon-portrait tryon-fingers tryon-fingers-left" src={model.frames.reaccion}
              alt="" loading="lazy" decoding="async" draggable={false} />
            <img className="tryon-portrait tryon-fingers tryon-fingers-right" src={model.frames.reaccion}
              alt="" loading="lazy" decoding="async" draggable={false} />
            {calibration && Object.entries({ centro: placement(modelId, pose), pechoDerecho: placement(modelId, pose, 'pechoDerecho') }).map(([label, box]) => (
              <div className="tryon-guide" key={label} style={{
                left: box.x + '%', top: box.y + '%', width: box.width + '%', height: box.height + '%',
              }}>{label}</div>
            ))}
          </div>
        </div>

        <div className="tryon-catalog">
          <h3>Estampas</h3>
          <ul className="tryon-options">
            <li>
              <button type="button" aria-pressed={view.stamp === null} onClick={() => select(null)}>
                <span className="tryon-blank" aria-hidden="true">Lisa</span>
                <span className="tryon-sr">Remera lisa</span>
              </button>
            </li>
            {catalog.map(stamp => (
              <li key={stamp.id}>
                <button
                  type="button"
                  title={stamp.title}
                  aria-pressed={view.stamp?.id === stamp.id}
                  onClick={() => select(stamp)}
                >
                  <img src={stamp.thumb} alt={stamp.title} loading="lazy" decoding="async" />
                </button>
              </li>
            ))}
          </ul>
          {catalog.length === 0 && <p className="tryon-notice">Estampas en preparación.</p>}
        </div>
        {import.meta.env.DEV && (
          <StampAdjuster
            adjustment={adjustment}
            title={view.stamp?.title}
            changes={Object.keys(editor.drafts).length > 0}
            saving={editor.saving}
            message={editor.message}
            onAdjust={next => { if (stampId) editor.update(stampId, next) }}
            onSave={() => void editor.save()}
          />
        )}
        <p role="status" className={message.startsWith('No se pudo') ? 'tryon-notice' : 'tryon-sr'}>{message}</p>
      </div>
    </section>
  )
}
