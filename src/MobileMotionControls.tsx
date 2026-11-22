import { useId } from 'react'
import type { useMobileHeroMotion } from './useMobileHeroMotion'

type Props = {
  motion: ReturnType<typeof useMobileHeroMotion>
  enabled: boolean
  toggleMotion: () => void
}

export function MobileMotionControls({ motion, enabled, toggleMotion }: Props) {
  const { status, reduced, toggleTilt, recalibrate } = motion
  const statusId = useId()
  const active = status === 'enabled'
  const fallback = reduced ? 'Movimiento reducido activo.' : 'Deslizá el dedo sobre los personajes.'
  const messages = {
    idle: reduced ? fallback : 'Deslizá sobre la escena o activá la inclinación.',
    requesting: 'Mantené el teléfono quieto para calibrar.',
    enabled: 'Incliná suavemente el celular.',
    denied: 'Permiso denegado. ' + fallback,
    unsupported: (window.isSecureContext ? 'Inclinación no disponible. ' : 'La inclinación requiere HTTPS. ') + fallback,
    error: 'No llegaron datos del sensor. ' + fallback,
  }

  return (
    <div className="mobile-motion">
      <div className="mobile-motion-actions">
        {enabled && (
          <button
            type="button"
            aria-pressed={active}
            aria-describedby={statusId}
            onClick={toggleTilt}
          >
            {active ? 'Desactivar movimiento' : status === 'requesting' ? 'Cancelar activación' : 'Activar movimiento'}
          </button>
        )}
        {enabled && active && <button type="button" onClick={recalibrate}>Recalibrar</button>}
        <button type="button" onClick={toggleMotion}>{enabled ? 'Pausar 2.5D' : 'Reanudar 2.5D'}</button>
      </div>
      <p id={statusId} role="status">{enabled ? messages[status] : 'Movimiento en pausa.'}</p>
    </div>
  )
}
