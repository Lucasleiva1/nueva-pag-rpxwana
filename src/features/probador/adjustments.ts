import womanAdjustments from './ajustes.json'
import manAdjustments from './ajustes-hombre.json'
import type { ModelId } from './artwork'

export type Adjustment = { x: number; y: number; scale: number }
export type Adjustments = Record<string, Adjustment>

export const initialAdjustments: Record<ModelId, Adjustments> = { mujer: womanAdjustments, hombre: manAdjustments }
export const defaultAdjustment: Adjustment = { x: 0, y: 0, scale: 100 }
export const scaleLimits = { min: 45, max: 120 }
export const developerEndpoint = import.meta.env.BASE_URL + '__roxwana/probador/ajustes'
