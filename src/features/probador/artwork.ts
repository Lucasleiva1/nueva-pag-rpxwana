import { defaultAdjustment, type Adjustment } from './adjustments'

const folder = import.meta.env.BASE_URL + 'assets/probador/'

function whiteBlink(model: ModelId): BlinkArt {
  return { image: folder + model + '-blanca-parpadeo-v0.19.0.webp', left: 0, top: 0, width: 100 }
}

function whiteFrames(model: ModelId, headFrame?: string): Frames {
  const prefix = folder + model + '-blanca-'
  const reaction = prefix + 'reaccion-v0.19.0.webp'
  return { neutra: prefix + 'neutra-v0.19.0.webp', mirada: headFrame ?? reaction, reaccion: reaction }
}
export const backdrop = folder + 'pared-probador-v0.10.0.webp'

export type Pose = 'neutra' | 'mirada' | 'reaccion'
export const modelIds = ['mujer', 'hombre', 'nino'] as const
export type ModelId = (typeof modelIds)[number]
export type Frames = Record<Pose, string>

type Zone = { x: number; y: number; width: number; height: number; rotation: number }
export type PrintPosition = 'centro' | 'pechoDerecho'
export type BlinkArt = { image: string; left: number; top: number; width: number }
type ModelArt = {
  label: string
  frames: Frames
  whiteFrames: Frames
  blink: BlinkArt
  whiteBlink: BlinkArt
  portraitRatio: number
  printZones: Record<PrintPosition, Zone>
  chest: Omit<Zone, 'rotation'>
}

export const models: Record<ModelId, ModelArt> = {
  mujer: {
    label: 'Mujer',
    whiteFrames: whiteFrames('mujer'),
    whiteBlink: whiteBlink('mujer'),
    frames: {
      neutra: folder + 'modelo-neutra-v0.10.0.webp',
      mirada: folder + 'modelo-mirada-v0.10.0.webp',
      reaccion: folder + 'modelo-agarre-v0.14.0.webp',
    },
    blink: { image: folder + 'modelo-parpadeo-v0.15.0.webp', left: 211 / 520 * 100, top: 89 / 738 * 100, width: 91 / 520 * 100 },
    portraitRatio: 520 / 738,
    printZones: {
      centro: { x: 28, y: 44, width: 44, height: 30, rotation: 0 },
      pechoDerecho: { x: 32, y: 43, width: 13, height: 11, rotation: 0 },
    },
    chest: { x: 24, y: 42, width: 52, height: 37 },
  },
  hombre: {
    label: 'Hombre',
    whiteFrames: whiteFrames('hombre'),
    whiteBlink: whiteBlink('hombre'),
    frames: {
      neutra: folder + 'hombre-neutra-v0.11.0.webp',
      mirada: folder + 'hombre-mirada-v0.11.0.webp',
      reaccion: folder + 'hombre-agarre-v0.14.0.webp',
    },
    blink: { image: folder + 'hombre-parpadeo-v0.15.0.webp', left: 250 / 560 * 100, top: 89 / 738 * 100, width: 94 / 560 * 100 },
    portraitRatio: 560 / 738,
    printZones: {
      centro: { x: 28, y: 42, width: 44, height: 30, rotation: 0 },
      pechoDerecho: { x: 32, y: 41, width: 13, height: 11, rotation: 0 },
    },
    chest: { x: 23, y: 40, width: 54, height: 39 },
  },
  nino: {
    label: 'Niño',
    whiteFrames: whiteFrames('nino', folder + 'nino-blanca-mirada-v0.19.0.webp'),
    whiteBlink: whiteBlink('nino'),
    frames: {
      neutra: folder + 'nino-neutro-v0.17.0.webp',
      mirada: folder + 'nino-mirada-v0.17.0.webp',
      reaccion: folder + 'nino-agarre-v0.17.0.webp',
    },
    blink: { image: folder + 'nino-parpadeo-v0.17.0.webp', left: 445 / 1086 * 100, top: 193 / 1448 * 100, width: 200 / 1086 * 100 },
    portraitRatio: 1086 / 1448,
    printZones: {
      centro: { x: 30, y: 40, width: 40, height: 33, rotation: 0 },
      pechoDerecho: { x: 33, y: 39, width: 12, height: 10, rotation: 0 },
    },
    chest: { x: 27, y: 37, width: 46, height: 41 },
  },
}

const torsoOffsets: Record<Pose, number> = { neutra: 0, mirada: 0, reaccion: 0 }

function slide(center: number, min: number, max: number, amount: number) {
  const base = Math.max(min, Math.min(max, center))
  return base + (amount / 100) * (amount < 0 ? base - min : max - base)
}

export function placement(
  modelId: ModelId,
  pose: Pose,
  zone: PrintPosition = 'centro',
  adjustment: Adjustment = defaultAdjustment,
  artworkRatio?: number | null,
): Zone {
  const model = models[modelId]
  const spec = model.printZones[zone]
  const frameX = torsoOffsets[pose]
  if (!artworkRatio) return { ...spec, x: spec.x + frameX }

  const bounds = zone === 'centro' ? model.chest : spec
  const ratio = artworkRatio / model.portraitRatio
  const scale = adjustment.scale / 100
  const width = Math.min(spec.width * scale, spec.height * scale * ratio, bounds.width, bounds.height * ratio)
  const height = width / ratio
  return {
    x: frameX + slide(spec.x + (spec.width - width) / 2, bounds.x, bounds.x + bounds.width - width, adjustment.x),
    y: slide(spec.y + (spec.height - height) / 2, bounds.y, bounds.y + bounds.height - height, adjustment.y),
    width,
    height,
    rotation: spec.rotation,
  }
}
