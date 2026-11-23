import type { ModelId, PrintPosition } from './artwork'

export type Stamp = {
  id: string
  title: string
  src: string
  thumb: string
  position: PrintPosition
  lightInk?: boolean
}

const files = import.meta.glob<string>(['./estampas/*.{webp,png,avif}', './estampas/infantil/*.{webp,png,avif}'], { eager: true, query: '?url&no-inline', import: 'default' })
const thumbs = import.meta.glob<string>(['./miniaturas/*.webp', './miniaturas/infantil/*.webp'], { eager: true, query: '?url&no-inline', import: 'default' })
const adultVersions = new Map<string, { version: string; stamp: Stamp }>()
const childVersions = new Map<string, { version: string; stamp: Stamp }>()
type StampDetails = { title?: string; models?: readonly ModelId[]; position?: PrintPosition; lightInk?: boolean }

const details: Record<string, StampDetails> = {
  'ac-dc': { title: 'AC/DC' },
  'spider-man': { title: 'Spider-Man' },
  'lilo-y-stitch': { title: 'Lilo y Stitch' },
  rastrojero: { models: ['mujer', 'nino'] },
  shinobu: { models: ['mujer', 'nino'] },
  satoru: { title: 'Satoru Gojo', models: ['mujer', 'nino'] },
  itadori: { title: 'Yuji Itadori', models: ['mujer', 'nino'] },
  luffy: { title: 'Luffy · One Piece' },
  'rolling-stones': { title: 'The Rolling Stones' },
  'los-popes': { title: 'Los Popes' },
  'popes-pecho': { title: 'Los Popes · Logo de pecho', position: 'pechoDerecho' },
  'malvinas-argentinas': { title: 'Malvinas Argentinas', lightInk: true },
  primus: { lightInk: true },
  portishead: { lightInk: true },
  'plan-4': { lightInk: true },
  horcas: { lightInk: true },
  messi: { models: ['mujer', 'hombre', 'nino'] },
  ibanez: { title: 'Ibanez', lightInk: true },
  guason: { title: 'El Guasón' },
  bts: { title: 'BTS', models: ['mujer', 'hombre', 'nino'] },
}

for (const [path, src] of Object.entries(files)) {
  const relative = path.slice('./estampas/'.length)
  const versions = relative.startsWith('infantil/') ? childVersions : adultVersions
  const name = relative.split('/').at(-1)!.replace(/\.[^.]+$/, '')
  const id = name.replace(/-v\d+\.\d+\.\d+$/, '')
  const version = name.slice(id.length + 2)
  const previous = versions.get(id)
  if (previous && previous.version.localeCompare(version, undefined, { numeric: true }) >= 0) continue
  const stampDetails = details[id]
  versions.set(id, {
    version,
    stamp: {
      id,
      title: stampDetails?.title ?? id.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' '),
      src,
      lightInk: stampDetails?.lightInk,
      position: stampDetails?.position ?? 'centro',
      thumb: thumbs['./miniaturas/' + relative.replace(/\.[^.]+$/, '.webp')] ?? src,
    },
  })
}

const sharedStamps = [...adultVersions.values()].map(({ stamp }) => stamp)
const childStamps = [...childVersions.values()].map(({ stamp }) => stamp)

function catalogFor(model: ModelId) {
  const shared = sharedStamps.filter(({ id }) => details[id]?.models?.includes(model) ?? model !== 'nino')
  const catalog = model === 'nino' ? [...childStamps, ...shared] : shared
  return catalog.sort((left, right) => left.title.localeCompare(right.title, 'es', { numeric: true }))
}

export const stampsByModel = {
  mujer: catalogFor('mujer'),
  hombre: catalogFor('hombre'),
  nino: catalogFor('nino'),
} satisfies Record<ModelId, Stamp[]>
