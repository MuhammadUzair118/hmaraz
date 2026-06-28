import type { VitalRecord, PipelineResult } from '../types'

interface Conversion {
  from: string
  to: string
  convert: (value: number) => number
}

const CONVERSIONS: Conversion[] = [
  { from: 'fahrenheit', to: 'celsius', convert: v => (v - 32) * 5 / 9 },
  { from: 'f', to: 'celsius', convert: v => (v - 32) * 5 / 9 },
  { from: 'lbs', to: 'kg', convert: v => v * 0.453592 },
  { from: 'pounds', to: 'kg', convert: v => v * 0.453592 },
  { from: 'inches', to: 'cm', convert: v => v * 2.54 },
  { from: 'feet', to: 'cm', convert: v => v * 30.48 },
]

const STANDARD_UNITS: Record<string, string> = {
  heart_rate: 'bpm',
  spo2: '%',
  temperature: 'celsius',
  blood_pressure_systolic: 'mmHg',
  blood_pressure_diastolic: 'mmHg',
  respiratory_rate: 'breaths/min',
  steps: 'steps',
  calories: 'kcal',
  sleep_hours: 'hours',
  hrv: 'ms',
  glucose: 'mmol/L',
  weight: 'kg',
}

export function normalizeVital(record: VitalRecord): PipelineResult<VitalRecord> {
  const normalized = { ...record }
  const targetUnit = STANDARD_UNITS[record.metric]

  if (targetUnit && record.unit !== targetUnit) {
    const conversion = CONVERSIONS.find(
      c => c.from === record.unit.toLowerCase() && c.to === targetUnit
    )
    if (conversion) {
      normalized.value = Math.round(conversion.convert(record.value) * 100) / 100
      normalized.unit = targetUnit
    }
  }

  return { success: true, data: normalized }
}

export function normalizeVitals(records: VitalRecord[]): PipelineResult<VitalRecord[]> {
  const normalized: VitalRecord[] = []
  const warnings: string[] = []

  for (const record of records) {
    const result = normalizeVital(record)
    if (result.success && result.data) {
      normalized.push(result.data)
    } else {
      warnings.push(`Failed to normalize ${record.metric}: ${result.error}`)
    }
  }

  return {
    success: normalized.length > 0,
    data: normalized,
    warnings: warnings.length > 0 ? warnings : undefined,
    error: normalized.length === 0 ? 'No records could be normalized' : undefined,
  }
}
