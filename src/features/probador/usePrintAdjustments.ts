import { useEffect, useState } from 'react'
import { developerEndpoint, initialAdjustments, type Adjustment, type Adjustments } from './adjustments'
import { modelIds, type ModelId } from './artwork'

const endpoint = (model: ModelId) => developerEndpoint + '?modelo=' + model

export function usePrintAdjustments(model: ModelId) {
  const [allSaved, setSaved] = useState(initialAdjustments)
  const [allDrafts, setDrafts] = useState<Record<ModelId, Adjustments>>({ mujer: {}, hombre: {} })
  const [savingModel, setSavingModel] = useState<ModelId | null>(null)
  const [feedback, setFeedback] = useState<Partial<Record<ModelId, string>>>({})
  const saved = allSaved[model]
  const drafts = allDrafts[model]

  useEffect(() => {
    if (!import.meta.env.DEV) return
    const controller = new AbortController()
    for (const id of modelIds) {
      void fetch(endpoint(id), { cache: 'no-store', signal: controller.signal })
        .then(response => {
          if (!response.ok) throw new Error('No se pudieron leer los ajustes')
          return response.json() as Promise<Adjustments>
        })
        .then(settings => {
          setSaved(previous => ({ ...previous, [id]: settings }))
        }, () => {
          if (!controller.signal.aborted) setFeedback(previous => ({ ...previous, [id]: 'No se pudieron leer los ajustes guardados.' }))
        })
    }
    return () => controller.abort()
  }, [])

  const update = (id: string, adjustment: Adjustment) => {
    setDrafts(previous => ({ ...previous, [model]: { ...previous[model], [id]: adjustment } }))
    setFeedback(previous => ({ ...previous, [model]: '' }))
  }

  const save = async () => {
    if (!import.meta.env.DEV || savingModel || Object.keys(drafts).length === 0) return
    setSavingModel(model)
    setFeedback(previous => ({ ...previous, [model]: '' }))
    try {
      const response = await fetch(endpoint(model), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(drafts),
      })
      if (!response.ok) throw new Error('No se pudo guardar')
      const settings = await response.json() as Adjustments
      setSaved(previous => ({ ...previous, [model]: settings }))
      setDrafts(previous => ({ ...previous, [model]: {} }))
      setFeedback(previous => ({ ...previous, [model]: 'Ajustes guardados.' }))
    } catch {
      setFeedback(previous => ({ ...previous, [model]: 'No se pudo guardar. Tus cambios siguen en pantalla.' }))
    } finally {
      setSavingModel(null)
    }
  }

  return { saved, drafts, saving: savingModel !== null, message: feedback[model] ?? '', update, save }
}
