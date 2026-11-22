import type { KeyboardEvent, PointerEvent } from 'react'
import { scaleLimits, type Adjustment } from './adjustments'

type Props = {
  adjustment: Adjustment
  title: string | undefined
  changes: boolean
  saving: boolean
  message: string
  onAdjust: (next: Adjustment) => void
  onSave: () => void
}

const clamp = (value: number) => Math.max(-100, Math.min(100, Math.round(value)))

export function StampAdjuster({ adjustment, title, changes, saving, message, onAdjust, onSave }: Props) {
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

  return (
    <aside className="tryon-adjuster" aria-label="Ajustes de estampa">
      <h3>Ajustar estampa</h3>
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
    </aside>
  )
}
