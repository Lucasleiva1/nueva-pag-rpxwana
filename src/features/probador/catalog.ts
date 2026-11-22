export type Stamp = {
  id: string
  title: string
  src: string
  thumb: string
}

const files = import.meta.glob<string>(['./estampas/*.{webp,png,avif}', './estampas/infantil/*.{webp,png,avif}'], { eager: true, query: '?url&no-inline', import: 'default' })
const thumbs = import.meta.glob<string>(['./miniaturas/*.webp', './miniaturas/infantil/*.webp'], { eager: true, query: '?url&no-inline', import: 'default' })
const adultVersions = new Map<string, { version: string; stamp: Stamp }>()
const childVersions = new Map<string, { version: string; stamp: Stamp }>()
const titleOverrides: Record<string, string> = {
  'ac-dc': 'AC/DC',
  'spider-man': 'Spider-Man',
  'lilo-y-stitch': 'Lilo y Stitch',
}

for (const [path, src] of Object.entries(files)) {
  const relative = path.slice('./estampas/'.length)
  const versions = relative.startsWith('infantil/') ? childVersions : adultVersions
  const name = relative.split('/').at(-1)!.replace(/\.[^.]+$/, '')
  const id = name.replace(/-v\d+\.\d+\.\d+$/, '')
  const version = name.slice(id.length + 2)
  const previous = versions.get(id)
  if (previous && previous.version.localeCompare(version, undefined, { numeric: true }) >= 0) continue
  versions.set(id, {
    version,
    stamp: {
      id,
      title: titleOverrides[id] ?? id.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' '),
      src,
      thumb: thumbs['./miniaturas/' + relative.replace(/\.[^.]+$/, '.webp')] ?? src,
    },
  })
}

function sorted(versions: Map<string, { version: string; stamp: Stamp }>) {
  return [...versions.values()].map(({ stamp }) => stamp)
    .sort((left, right) => left.title.localeCompare(right.title, 'es', { numeric: true }))
}

export const stamps = sorted(adultVersions)
export const childStamps = sorted(childVersions)
