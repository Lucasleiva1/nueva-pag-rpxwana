import './heroSound.css'

type Props = {
  silenced: boolean
  waitingForInteraction: boolean
  toggle: () => void
  volume: number
  setVolume: (volume: number) => void
}

export function HeroSound({ silenced, waitingForInteraction, toggle, volume, setVolume }: Props) {
  const showSoundCue = silenced || waitingForInteraction
  const label = showSoundCue ? 'Activar música' : 'Silenciar música'
  return (
    <div className="hero-audio-controls">
      <button type="button" className="poster poster-red hero-sound" onClick={toggle}
        data-silenced={silenced} data-waiting={waitingForInteraction} aria-label={label} title={label}>
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 9h4l5-4v14l-5-4H3z" />
          {silenced ? <path d="m16 10 5 5m0-5-5 5" />
            : waitingForInteraction ? <path d="m16 9 5 3-5 3z" fill="currentColor" />
            : <path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" />}
        </svg>
        {showSoundCue && (
          <svg className="hero-sound-waves" viewBox="0 0 28 36" fill="none" stroke="currentColor"
            strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M25 13q-5 5 0 10" />
            <path d="M18 8q-10 10 0 20" />
            <path d="M11 3q-15 15 0 30" />
          </svg>
        )}
      </button>
      <label className="poster poster-sand hero-volume">
        <output aria-hidden="true">{volume}%</output>
        <input type="range" min="0" max="100" value={volume} aria-label="Volumen de música"
          aria-valuetext={volume + '%'} onChange={event => setVolume(event.currentTarget.valueAsNumber)} />
      </label>
    </div>
  )
}
