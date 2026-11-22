import { randomUUID } from 'node:crypto'
import { readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, type Plugin } from 'vite'

type Adjustment = { x: number; y: number; scale: number }

function validAdjustment(value: unknown): value is Adjustment {
  if (!value || typeof value !== 'object') return false
  const { x, y, scale } = value as Adjustment
  return Number.isInteger(x) && Math.abs(x) <= 100 &&
    Number.isInteger(y) && Math.abs(y) <= 100 &&
    Number.isInteger(scale) && scale >= 45 && scale <= 120
}

function reply(response: ServerResponse, status: number, data: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(data))
}

function readBody(request: IncomingMessage) {
  return new Promise<string>((resolveBody, reject) => {
    let body = ''
    request.setEncoding('utf8')
    request.on('data', (chunk: string) => {
      if (body.length > 12000) return
      body += chunk
      if (body.length > 12000) reject(new Error('Body demasiado largo'))
    })
    request.once('end', () => resolveBody(body))
    request.once('error', reject)
    request.once('aborted', () => reject(new Error('Solicitud cancelada')))
  })
}

function savePrintAdjustments(): Plugin {
  return {
    name: 'roxwana-print-adjustments',
    apply: 'serve',
    configureServer(server) {
      const feature = resolve(server.config.root, 'src/features/probador')
      const manifest = resolve(server.config.root, 'package.json')
      const endpoint = server.config.base + '__roxwana/probador/ajustes'

      server.middlewares.use(async (request, response, next) => {
        const [path, query] = (request.url ?? '').split('?')
        if (path !== endpoint) return next()
        const model = new URLSearchParams(query).get('modelo') ?? 'mujer'
        if (model !== 'mujer' && model !== 'hombre') return reply(response, 400, { error: 'Modelo inválido' })
        const file = resolve(feature, model === 'hombre' ? 'ajustes-hombre.json' : 'ajustes.json')
        const read = (): Record<string, Adjustment> => JSON.parse(readFileSync(file, 'utf8'))
        const host = request.headers.host ?? ''
        if (!/^(?:127\.0\.0\.1|localhost|\[::1\])(?::\d+)?$/.test(host)) {
          return reply(response, 403, { error: 'Edición disponible en localhost' })
        }

        try {
          if (request.method === 'GET') return reply(response, 200, read())
          if (request.method !== 'POST') return reply(response, 405, { error: 'Método no permitido' })
          const origin = request.headers.origin
          if (origin !== 'http://' + host && origin !== 'https://' + host) {
            return reply(response, 403, { error: 'Origen no permitido' })
          }

          let changes: Record<string, unknown>
          try {
            changes = JSON.parse(await readBody(request))
            if (!changes || typeof changes !== 'object' || Array.isArray(changes)) throw new Error()
          } catch {
            return reply(response, 400, { error: 'Ajustes inválidos' })
          }

          const stampIds = new Set(readdirSync(resolve(feature, 'estampas'))
            .filter(name => /\.(webp|png|avif)$/.test(name))
            .map(name => name.replace(/\.[^.]+$/, '').replace(/-v\d+\.\d+\.\d+$/, '')))
          const entries = Object.entries(changes)
          if (entries.some(([id, value]) => !stampIds.has(id) || !validAdjustment(value))) {
            return reply(response, 400, { error: 'Ajustes inválidos' })
          }

          if (JSON.parse(readFileSync(manifest, 'utf8')).name !== 'roxwana-portada-urbana') {
            return reply(response, 403, { error: 'Proyecto inesperado' })
          }

          const updated = { ...read(), ...Object.fromEntries(entries) }
          const temporary = file + '.' + randomUUID() + '.tmp'
          try {
            writeFileSync(temporary, JSON.stringify(updated, null, 2) + '\n', { flag: 'wx' })
            renameSync(temporary, file)
          } finally {
            rmSync(temporary, { force: true })
          }
          return reply(response, 200, updated)
        } catch {
          return reply(response, 500, { error: 'No se pudieron guardar los ajustes' })
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [savePrintAdjustments()],
  server: { watch: { ignored: ['**/probador/ajustes*.json', '**/probador/ajustes*.json.*.tmp'] } },
})
