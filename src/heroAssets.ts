const assets = import.meta.env.BASE_URL + 'assets/'

export const brand = {
  seal: assets + 'sello-roxwana-v0.1.0.png',
  mark: assets + 'monograma-rxw-v0.1.0.png',
}

export const descriptionArt = {
  paper: assets + 'papel-descripcion-v0.8.0.webp',
  portrait: assets + 'pelirroja-v0.1.0.webp',
}

export const backgrounds = [
  { id: 'ciudad', depth: -12, mobileDepth: -2, image: assets + 'ciudad-v0.2.0.webp', x: -72, y: -32, delay: 0 },
  { id: 'playa', depth: 20, mobileDepth: 5, image: assets + 'playa-v0.2.0.webp', fragment: true, x: 110, y: 48, delay: 0.13 },
] as const


export const metalBackgrounds = [
  { id: 'recital', depth: -12, mobileDepth: -2, image: assets + 'metal-recital-v0.4.0.webp', x: -80, y: -38, delay: 0 },
  { id: 'ruta', depth: 20, mobileDepth: 5, image: assets + 'metal-ruta-v0.4.0.webp', fragment: true, x: 112, y: 50, delay: 0.13 },
] as const

export const metalSkull = assets + 'metal-calavera-v0.4.0.webp'

export const characters = [
  { id: 'campera', alt: 'Modelo con lentes oscuros, campera de cuero y remera con calavera', x: 110, y: 40, angle: 6, depth: 12, mobileDepth: 6, delay: 0.23 },
  { id: 'pelirroja', alt: 'Modelo pelirroja con remera clara ROXWANA', x: -76, y: 52, angle: -7, depth: 16, mobileDepth: 8, delay: 0.37 },
  { id: 'frente', alt: 'Modelo con remera RXW negra y la mano extendida', x: -24, y: 102, angle: -3, depth: 32, mobileDepth: 11, delay: 0.51 },
].map(character => ({
  ...character,
  image: assets + character.id + '-v0.1.0.webp',
}))


export const metalCharacters = [
  { id: 'metal-cuero', alt: 'Modelo con lentes oscuros, campera de cuero y brazos cruzados', x: 110, y: 40, angle: 6, depth: 12, mobileDepth: 6, delay: 0.23 },
  { id: 'metal-casco', alt: 'Modelo con remera del casco y gesto de cuernos de metal', x: -76, y: 52, angle: -7, depth: 16, mobileDepth: 8, delay: 0.37 },
  { id: 'metal-dragon', alt: 'Modelo de pelo largo con remera sin mangas y estampado de dragón', x: -24, y: 102, angle: -3, depth: 32, mobileDepth: 11, delay: 0.51 },
].map(character => ({
  ...character,
  image: assets + character.id + '-v0.3.0.webp',
}))

export const rapBackgrounds = [
  { id: 'callejon', depth: -12, mobileDepth: -2, image: assets + 'rap-callejon-v0.5.0.webp', x: -78, y: -35, delay: 0 },
  { id: 'van', depth: 20, mobileDepth: 5, image: assets + 'rap-van-v0.5.0.webp', fragment: true, x: 108, y: 48, delay: 0.13 },
] as const

export const rapCharacters = [
  { id: 'rap-buzo', alt: 'Rapero de sombrero negro con buzo RXW y corona roja', x: 22, y: -56, angle: -3, depth: 14, mobileDepth: 7, delay: 0.23 },
  { id: 'rap-bandana', alt: 'Rapera de trenzas y bandana con musculosa RXW', x: 98, y: 48, angle: 6, depth: 16, mobileDepth: 8, delay: 0.37 },
  { id: 'rap-gorra', alt: 'Rapero de gorra hacia atrás con la mano hacia la cámara', x: -86, y: 82, angle: -7, depth: 32, mobileDepth: 11, delay: 0.51 },
].map(character => ({
  ...character,
  image: assets + character.id + '-v0.5.0.webp',
}))

export const NAV_ITEMS = [
  { label: 'Descripción', targetId: 'descripcion', color: 'paper' },
  { label: 'Estampas', targetId: 'probador', color: 'red' },
  { label: 'Redes', targetId: 'redes', color: 'gold' },
] as const
