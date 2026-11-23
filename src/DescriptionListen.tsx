import { useEffect, useRef, useState } from 'react'

export function DescriptionListen({ src, onReadingChange }: { src: string; onReadingChange: (reading: boolean) => void }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [reading, setReading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const track = audio.current
    return () => {
      track?.pause()
      onReadingChange(false)
    }
  }, [onReadingChange])

  const finishReading = () => {
    setReading(false)
    onReadingChange(false)
  }

  const playError = () => {
    finishReading()
    setMessage('No se pudo reproducir la lectura en voz alta.')
  }

  const toggleReading = () => {
    const track = audio.current
    if (!track) return

    if (!track.paused) {
      track.pause()
      track.currentTime = 0
      finishReading()
      return
    }

    setMessage('')
    setReading(true)
    onReadingChange(true)
    void track.play().catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === 'AbortError')) playError()
    })
  }

  return (
    <>
      <audio ref={audio} src={src} preload="none" onEnded={finishReading} onError={playError} />
      <button type="button" className="poster poster-red description-listen"
        aria-label={reading ? 'Detener lectura' : 'Escuchar descripción'}
        data-reading={reading} onClick={toggleReading}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {reading ? <rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor" />
            : <>
              <path d="M3 9h4l5-4v14l-5-4H3z" />
              <path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" />
            </>}
        </svg>
        {reading ? 'Detener' : 'Escuchar'}
      </button>
      {message && <p className="description-listen-message" role="status">{message}</p>}
    </>
  )
}
