import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { Stamp } from './catalog'
import type { Frames, Pose } from './artwork'

function decode(src: string) {
  const image = new Image()
  image.src = src
  return image.decode().then(() => image.naturalWidth / image.naturalHeight)
}

type Print = { stamp: Stamp | null; ratio: number | null }
type View = Print & { pose: Pose }

export function useStampReaction(frames: Frames) {
  const printed = useRef<Print>({ stamp: null, ratio: null })
  const [view, setView] = useState<View>({ ...printed.current, pose: 'neutra' })
  const [message, setMessage] = useState('')
  const serial = useRef(0)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const reactions = useRef(new Map<Frames, Promise<boolean>>())

  const prepareReaction = useCallback(() => {
    const cached = reactions.current.get(frames)
    if (cached) return cached
    const pending = Promise.allSettled(Object.values(frames).map(decode)).then(results => {
      const ready = results.every(result => result.status === 'fulfilled')
      if (!ready) reactions.current.delete(frames)
      return ready
    })
    reactions.current.set(frames, pending)
    return pending
  }, [frames])

  useEffect(() => {
    const visibility = () => timeline.current?.paused(document.hidden)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      serial.current += 1
      timeline.current?.kill()
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])

  const setPose = (pose: Pose) => setView(previous => ({ ...previous, pose }))

  const select = async (stamp: Stamp | null) => {
    const revision = ++serial.current
    if (stamp === printed.current.stamp) {
      setMessage('')
      return
    }

    const ratio = stamp ? await decode(stamp.src).catch(() => null) : null
    if (revision !== serial.current) return
    if (stamp && !ratio) {
      setMessage('No se pudo cargar esta estampa.')
      return
    }

    const next = { stamp, ratio }
    printed.current = next
    setView(previous => ({ ...next, pose: previous.pose }))
    setMessage(stamp ? 'Estampa aplicada: ' + stamp.title : 'Remera lisa')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timeline.current?.kill()
      timeline.current = null
      setPose('neutra')
      return
    }
    if (!await prepareReaction() || revision !== serial.current) return

    timeline.current?.kill()
    const animation = gsap.timeline({
      paused: true,
      onComplete: () => { timeline.current = null },
    })
    timeline.current = animation
    animation.call(setPose, ['mirada'], 0.03)
    animation.call(setPose, ['reaccion'], 0.18)
    animation.call(setPose, ['mirada'], 0.62)
    animation.call(setPose, ['neutra'], 0.77)
    if (!document.hidden) animation.play()
  }

  const resetPose = () => {
    serial.current += 1
    timeline.current?.kill()
    timeline.current = null
    setView({ ...printed.current, pose: 'neutra' })
  }

  return { view, message, select, prepareReaction, resetPose }
}
