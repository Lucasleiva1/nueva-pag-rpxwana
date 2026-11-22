import { socialProfiles } from './socialCards'

const icons = {
  Instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </>
  ),
  YouTube: (
    <>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </>
  ),
  TikTok: (
    <>
      <circle cx="8" cy="18" r="4" />
      <path d="M12 18V2l7 4" />
    </>
  ),
}

const networks = ['Instagram', 'YouTube', 'TikTok'] as const

export function SocialLinks() {
  return (
    <nav className="social-wall__profiles" aria-label="Perfiles sociales de ROXWANA">
      {networks.map((network) => (
        <a key={network} href={socialProfiles[network]} target="_blank" rel="noopener noreferrer"
          aria-label={network} title={network} className="social-wall__profile" data-network={network}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {icons[network]}
          </svg>
        </a>
      ))}
    </nav>
  )
}
