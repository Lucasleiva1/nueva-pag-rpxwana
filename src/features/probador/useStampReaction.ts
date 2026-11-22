import { useCallback, useEffect, useRef, useState } from 'react'
import type { Stamp } from './catalog'
import type { Frames, Pose } from './artwork'

function decode(src: string) {
  const image = new Image()
  image.src = src
  return image.decode().then(() => image.naturalWidth / image.naturalHeight)
}

type Print = { stamp: Stamp | null; ratio: number | null }
type View = Print & { pose: Pose | null; lookingDown: boolean }
type Ready = { head: boolean; arms: boolean }

export function useStampReaction(frames: Frames) {
  const printed = useRef<Print>({ stamp: null, ratio: null })
  const [view, setView] = useState<View>({ ...printed.current, pose: null, lookingDown: false })
  const [message, setMessage] = useState('')
  const serial = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  const reactions = useRef(new Map<Frames, Promise<Ready>>())

  const prepareReaction = useCallback(() => {
    const cached = reactions.current.get(frames)
    if (cached) return cached
    const pending = Promise.allSettled([decode(frames.mirada), decode(frames.reaccion)]).then(([head, arms]) => {
      const ready = { head: head.status === 'fulfilled', arms: arms.status === 'fulfilled' }
      if (!ready.head || !ready.arms) reactions.current.delete(frames)
      return ready
    })
    reactions.current.set(frames, pending)
    return pending
  }, [frames])

  useEffect(() => () => {
    serial.current += 1
    window.clearTimeout(timer.current)
  }, [])

  const playReaction = async (revision: number, replay: boolean) => {
    const ready = await prepareReaction()
    if (revision !== serial.current) return
    if (!ready.head && !ready.arms) {
      setMessage('No se pudo cargar la reacción del modelo.')
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const steps: { pose: Pose; lookingDown: boolean; duration: number }[] = []
    if (replay) steps.push({ pose: 'neutra', lookingDown: false, duration: 180 })
    if (ready.head && ready.arms) steps.push({ pose: 'mirada', lookingDown: true, duration: reduced ? 200 : 280 })
    steps.push({ pose: ready.arms ? 'reaccion' : 'mirada', lookingDown: ready.head, duration: 630 })
    if (ready.head && ready.arms) steps.push({ pose: 'mirada', lookingDown: true, duration: 210 })

    window.clearTimeout(timer.current)
    let index = 0
    const advance = () => {
      const step = steps[index++]
      const pose = step?.pose ?? null
      const lookingDown = step?.lookingDown ?? false
      setView(previous => ({ ...previous, pose, lookingDown }))
      if (step) timer.current = window.setTimeout(advance, step.duration)
    }
    advance()
  }

  const select = async (stamp: Stamp | null) => {
    const revision = ++serial.current
    const replay = stamp?.id === printed.current.stamp?.id
    if (!replay) {
      const ratio = stamp ? await decode(stamp.src).catch(() => null) : null
      if (revision !== serial.current) return
      if (stamp && !ratio) {
        setMessage('No se pudo cargar esta estampa.')
        return
      }

      const next = { stamp, ratio }
      printed.current = next
      setView(previous => ({ ...previous, ...next }))
    }

    setMessage(stamp ? 'Estampa aplicada: ' + stamp.title : 'Remera lisa')
    await playReaction(revision, replay)
  }

  const resetPose = (clearPrint: boolean) => {
    serial.current += 1
    window.clearTimeout(timer.current)
    if (clearPrint) {
      printed.current = { stamp: null, ratio: null }
      setMessage('')
    }
    setView({ ...printed.current, pose: null, lookingDown: false })
  }

  return { view, message, select, prepareReaction, resetPose }
}
