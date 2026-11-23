import { useCallback, useEffect, useRef, useState } from 'react'

const defaultVolume = 10

export function useHeroMusic(track: string) {
  const audio = useRef<HTMLAudioElement>(null)
  const [muted, setMuted] = useState(true)
  const [blocked, setBlocked] = useState(false)
  const [volume, setVolumeState] = useState(defaultVolume)
  const volumeRef = useRef(defaultVolume)
  const gain = useRef<GainNode | null>(null)
  const mutePreference = useRef(muted)
  const narrating = useRef(false)

  const applyVolume = useCallback((player: HTMLAudioElement) => {
    const level = volumeRef.current / 100
    if (!gain.current) {
      player.volume = level
      if (player.volume === level || typeof AudioContext === 'undefined') return

      // Some mobile browsers expose a read-only media volume.
      const context = new AudioContext()
      try {
        const control = context.createGain()
        context.createMediaElementSource(player).connect(control)
        control.connect(context.destination)
        gain.current = control
      } catch {
        void context.close()
        return
      }
    }
    gain.current.gain.value = level
  }, [])

  const sync = useCallback(() => {
    const player = audio.current
    if (!player) return
    applyVolume(player)
    const source = player.getAttribute('src')
    if (!source || mutePreference.current || narrating.current) {
      player.pause()
      return
    }
    const context = gain.current?.context
    if (context && context.state !== 'running' && context.state !== 'closed') void (context as AudioContext).resume().catch(() => {})
    if (!player.paused) return

    void player.play().then(() => setBlocked(false), (error: unknown) => {
      if (player.getAttribute('src') !== source || mutePreference.current || narrating.current) return
      if (error instanceof DOMException && error.name === 'AbortError') return
      setBlocked(true)
    })
  }, [applyVolume])

  const cue = useCallback((source: string) => {
    const player = audio.current
    if (!player) return

    if (player.getAttribute('src') !== source) {
      player.pause()
      setBlocked(false)
      player.src = source
    }
    sync()
  }, [sync])

  useEffect(() => { cue(track) }, [track, cue])

  const setNarrating = useCallback((reading: boolean) => {
    if (narrating.current === reading) return
    narrating.current = reading
    sync()
  }, [sync])

  useEffect(() => () => {
    if (gain.current) void (gain.current.context as AudioContext).close()
  }, [])

  const setVolume = (level: number) => {
    volumeRef.current = level
    setVolumeState(level)
    sync()
  }

  const toggle = () => {
    const next = !(mutePreference.current || blocked || volumeRef.current === 0)
    mutePreference.current = next
    setMuted(next)
    setBlocked(false)
    if (!next && volumeRef.current === 0) setVolume(defaultVolume)
    sync()
  }

  return { audio, cue, toggle, volume, setVolume, setNarrating, waitingForInteraction: blocked && !muted && volume > 0, silenced: muted || volume === 0 }
}
