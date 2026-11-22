export type MotionPoint = { x: number; y: number }

type SensorConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

export function orientationSensor() {
  return window.DeviceOrientationEvent as SensorConstructor | undefined
}

const neutral = { x: 0, y: 0 }
const INPUT_RANGE = 17
const DEAD_ZONE = 1.2
const SAMPLES = 3
const SENSOR_TIMEOUT = 2300

export function normalizeMotion(value: number, limit: number, deadZone: number) {
  return Math.sign(value) * Math.min(1, Math.max(0, (Math.abs(value) - deadZone) / (limit - deadZone)))
}

function difference(angle: number, neutralAngle: number) {
  return ((angle - neutralAngle + 540) % 360) - 180
}

type TiltEvents = {
  move: (point: MotionPoint) => void
  ready: () => void
  unavailable: () => void
}

export function listenToTilt({ move, ready, unavailable }: TiltEvents) {
  let anchor: MotionPoint | undefined
  let samples = 0
  let offset = { ...neutral }
  let listening = false
  let received = false
  let timeout: number | undefined

  const recalibrate = () => {
    anchor = undefined
    samples = 0
    offset = { ...neutral }
    move(neutral)
  }

  const read = ({ beta, gamma }: DeviceOrientationEvent) => {
    if (beta === null || gamma === null || !Number.isFinite(beta) || !Number.isFinite(gamma)) return
    anchor ??= { x: gamma, y: beta }
    const deltaX = difference(gamma, anchor.x)
    const deltaY = difference(beta, anchor.y)

    if (samples < SAMPLES) {
      offset.x += deltaX / SAMPLES
      offset.y += deltaY / SAMPLES
      samples += 1
      if (samples === SAMPLES && !received) {
        received = true
        window.clearTimeout(timeout)
        ready()
      }
      return
    }

    const angle = (window.screen.orientation?.angle ?? window.orientation ?? 0) * Math.PI / 180
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const x = deltaX - offset.x
    const y = deltaY - offset.y
    move({
      x: normalizeMotion(x * cos + y * sin, INPUT_RANGE, DEAD_ZONE),
      y: normalizeMotion(y * cos - x * sin, INPUT_RANGE, DEAD_ZONE),
    })
  }

  const setActive = (active: boolean) => {
    if (active === listening) return
    listening = active
    if (active) {
      recalibrate()
      window.addEventListener('deviceorientation', read, { passive: true })
      window.addEventListener('orientationchange', recalibrate)
      window.screen.orientation?.addEventListener?.('change', recalibrate)
      if (!received) timeout = window.setTimeout(unavailable, SENSOR_TIMEOUT)
      return
    }

    window.clearTimeout(timeout)
    window.removeEventListener('deviceorientation', read)
    window.removeEventListener('orientationchange', recalibrate)
    window.screen.orientation?.removeEventListener?.('change', recalibrate)
  }

  return { setActive, recalibrate }
}
