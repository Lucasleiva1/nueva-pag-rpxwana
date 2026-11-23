import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { scaleLimits, type Adjustment } from './adjustments'

type Props = {
  section: RefObject<HTMLElement | null>
  adjustment: Adjustment
  title: string | undefined
  changes: boolean
  saving: boolean
  message: string
  onAdjust: (next: Adjustment) => void
  onSave: () => void
}

const clamp = (value: number) => Math.max(-100, Math.min(100, Math.round(value)))

function clampPanelPosition(x: number, y: number, panel: HTMLElement) {
  const margin = 8
  return {
    x: Math.max(margin, Math.min(document.documentElement.clientWidth - panel.offsetWidth - margin, x)),
    y: Math.max(margin, Math.min(window.innerHeight - panel.offsetHeight - margin, y)),
  }
}

export function StampAdjuster({ section, adjustment, title, changes, saving, message, onAdjust, onSave }: Props) {
  const panel = useRef<HTMLElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [position, setPanelPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const target = section.current
    const windowPanel = panel.current
    if (!target || !windowPanel) return
    const visibility = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    const fitPanel = () => setPanelPosition(previous => {
      if (!previous || windowPanel.hidden) return previous
      return clampPanelPosition(previous.x, previous.y, windowPanel)
    })
    const size = new ResizeObserver(fitPanel)
    visibility.observe(target)
    size.observe(windowPanel)
    window.addEventListener('resize', fitPanel)
    return () => {
      visibility.disconnect()
      size.disconnect()
      window.removeEventListener('resize', fitPanel)
    }
  }, [section])

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !panel.current) return
    const rect = panel.current.getBoundingClientRect()
    dragOffset.current = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const drag = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId) || !panel.current) return
    const { x, y } = dragOffset.current
    setPanelPosition(clampPanelPosition(event.clientX - x, event.clientY - y, panel.current))
  }

  const disabled = !title || saving
  const setPosition = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    onAdjust({
      ...adjustment,
      x: clamp(((event.clientX - box.left) / box.width * 2 - 1) * 100),
      y: clamp(((event.clientY - box.top) / box.height * 2 - 1) * 100),
    })
  }

  const moveWithKeys = (event: KeyboardEvent<HTMLButtonElement>) => {
    const moves: Partial<Record<string, [number, number]>> = {
      ArrowUp: [0, -5], ArrowDown: [0, 5], ArrowLeft: [-5, 0], ArrowRight: [5, 0], Home: [0, 0],
    }
    const delta = moves[event.key]
    if (!delta) return
    event.preventDefault()
    onAdjust({
      ...adjustment,
      x: event.key === 'Home' ? 0 : clamp(adjustment.x + delta[0]),
      y: event.key === 'Home' ? 0 : clamp(adjustment.y + delta[1]),
    })
  }

  return createPortal(
    <aside ref={panel} className="tryon-adjuster" aria-label="Ajustes de estampa" hidden={!visible}
      style={position ? { left: position.x, top: position.y, bottom: 'auto' } : undefined}>
      <div className="tryon-adjuster-header">
        <div className="tryon-adjuster-grip" onPointerDown={startDrag} onPointerMove={drag}>
          <h3>Ajustar estampa</h3>
        </div>
        <button type="button" className="tryon-adjuster-toggle" onClick={() => setMinimized(value => !value)}
          aria-expanded={!minimized} aria-controls="tryon-adjuster-body"
          aria-label={minimized ? 'Expandir ajustes de estampa' : 'Minimizar ajustes de estampa'}>
          <span aria-hidden="true">{minimized ? '+' : '−'}</span>
        </button>
      </div>
      <div id="tryon-adjuster-body" hidden={minimized}>
        <p>{title ?? 'Elegí una estampa.'}</p>
        <fieldset disabled={disabled}>
          <label className="tryon-scale">
            Tamaño <span aria-hidden="true">{adjustment.scale}%</span>
            <input
              type="range"
              min={scaleLimits.min}
              max={scaleLimits.max}
              value={adjustment.scale}
              aria-valuetext={adjustment.scale + '%'}
              onChange={event => onAdjust({ ...adjustment, scale: event.target.valueAsNumber })}
            />
          </label>
          <div
            className="tryon-lever"
            onPointerDown={event => {
              if (disabled || event.button !== 0) return
              event.currentTarget.setPointerCapture(event.pointerId)
              setPosition(event)
            }}
            onPointerMove={event => {
              if (!disabled && event.currentTarget.hasPointerCapture(event.pointerId)) setPosition(event)
            }}
          >
            <button
              type="button"
              className="tryon-lever-knob"
              aria-label="Posición de la estampa"
              aria-describedby="tryon-position-help"
              style={{ left: (adjustment.x + 100) / 2 + '%', top: (adjustment.y + 100) / 2 + '%' }}
              onKeyDown={moveWithKeys}
            />
          </div>
          <span className="tryon-sr" id="tryon-position-help">
            Arrastrá el punto o usá las flechas. Inicio centra la estampa.
            Posición horizontal {adjustment.x}, vertical {adjustment.y}.
          </span>
        </fieldset>
        <button type="button" className="tryon-save" disabled={!changes || saving} onClick={onSave}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        <p role="status" className="tryon-adjuster-status">{message || (changes ? 'Cambios sin guardar' : '')}</p>
      </div>
    </aside>,
    document.body,
  )
}
