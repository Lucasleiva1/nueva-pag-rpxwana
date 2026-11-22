export type Stamp = {
  id: string
  title: string
  src: string
  thumb: string
}

const files = import.meta.glob<string>('./estampas/*.{webp,png,avif}', { eager: true, query: '?url&no-inline', import: 'default' })
const thumbs = import.meta.glob<string>('./miniaturas/*.webp', { eager: true, query: '?url&no-inline', import: 'default' })
const versions = new Map<string, { version: string; stamp: Stamp }>()

for (const [path, src] of Object.entries(files)) {
  const name = path.split('/').at(-1)!.replace(/\.[^.]+$/, '')
  const id = name.replace(/-v\d+\.\d+\.\d+$/, '')
  const version = name.slice(id.length + 2)
  const previous = versions.get(id)
  if (previous && previous.version.localeCompare(version, undefined, { numeric: true }) >= 0) continue
  versions.set(id, {
    version,
    stamp: {
      id,
      title: id === 'ac-dc' ? 'AC/DC' : id.split('-').filter(Boolean).map(word => word[0].toUpperCase() + word.slice(1)).join(' '),
      src,
      thumb: thumbs['./miniaturas/' + name + '.webp'] ?? src,
    },
  })
}

export const stamps = [...versions.values()].map(({ stamp }) => stamp)
  .sort((left, right) => left.title.localeCompare(right.title, 'es', { numeric: true }))
