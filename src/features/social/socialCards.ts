export const socialProfiles = {
  Instagram: 'https://www.instagram.com/roxwana.info/',
  YouTube: 'https://www.youtube.com/@ROXWANAINFO',
  TikTok: 'https://www.tiktok.com/@roxwanainfo',
} as const

export const visibleSocialProfiles = ['Instagram', 'YouTube'] as const

export const socialCards = [
  {
    id: 'produccion',
    title: 'Producción',
    detail: 'Estampados y taller',
    image: 'assets/social/produccion-editorial-v0.12.0.webp',
    alt: 'Manos estampando una remera, entre recortes de papel e imágenes del taller',
    network: 'Instagram',
  },
  {
    id: 'calle',
    title: 'ROXWANA en la calle',
    detail: 'Prendas en la calle',
    image: 'assets/social/calle-editorial-v0.12.0.webp',
    alt: 'Retrato urbano de una modelo con remera clara, junto a dos fotos de calle',
    network: 'Instagram',
  },
  {
    id: 'movimiento',
    title: 'En movimiento',
    detail: 'Reels y nuevas estampas',
    image: 'assets/social/movimiento-editorial-v0.12.0.webp',
    alt: 'Fotos instantáneas de prendas estampadas y una tira de película de un recital',
    network: 'YouTube',
  },
] as const
