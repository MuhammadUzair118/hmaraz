import { z } from 'zod'
import type { VitalRecord, PipelineResult } from '../types'

const METRIC_RANGES: Record<string, { min: number; max: number }> = {
  heart_rate: { min: 20, max: 250 },
  spo2: { min: 50, max: 100 },
  temperature: { min: 32, max: 43 },
  blood_pressure_systolic: { min: 50, max: 300 },
  blood_pressure_diastolic: { min: 30, max: 200 },
  respiratory_rate: { min: 4, max: 60 },
  steps: { min: 0, max: 200_000 },
  calories: { min: 0, max: 10_000 },
  sleep_hours: { min: 0, max: 24 },
  hrv: { min: 0, max: 300 },
  glucose: { min: 1, max: 50 },
  weight: { min: 10, max: 500 },
}

const vitalSchema = z.object({
  userId: z.string().min(1),
  metric: z.enum([
    'heart_rate', 'spo2', 'temperature', 'blood_pressure_systolic',
    'blood_pressure_diastolic', 'respiratory_rate', 'steps', 'calories',
    'sleep_hours', 'hrv', 'glucose', 'weight',
  ]),
  value: z.number(),
  unit: z.string().min(1),
  timestamp: z.union([z.string(), z.date()]),
  source: z.string().optional(),
})

export function validateVital(record: VitalRecord): PipelineResult<VitalRecord> {
  const parsed = vitalSchema.safeParse(record)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; '),
    }
  }

  const range = METRIC_RANGES[parsed.data.metric]
  if (range) {
    if (parsed.data.value < range.min || parsed.data.value > range.max) {
      return {
        success: false,
        error: `${parsed.data.metric} value ${parsed.data.value} out of range [${range.min}, ${range.max}]`,
      }
    }
  }

  return { success: true, data: parsed.data as VitalRecord }
}

export function validateVitals(records: VitalRecord[]): PipelineResult<VitalRecord[]> {
  const valid: VitalRecord[] = []
  const warnings: string[] = []

  for (const record of records) {
    const result = validateVital(record)
    if (result.success && result.data) {
      valid.push(result.data)
    } else {
      warnings.push(`Record ${record.metric} ${record.value}: ${result.error}`)
    }
  }

  return {
    success: valid.length > 0,
    data: valid,
    warnings: warnings.length > 0 ? warnings : undefined,
    error: valid.length === 0 ? 'No valid records after validation' : undefined,
  }
}
