import { z } from 'zod'
import { VitalMetricType } from '@hamraz/types'

function toStandardUnit(value: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return value
  const conversions: Record<string, Record<string, number | ((v: number) => number)>> = {
    'kg': { 'lb': 2.20462 },
    'lb': { 'kg': 0.453592 },
    'celsius': { 'fahrenheit': (v: number) => v * 9 / 5 + 32 },
    'fahrenheit': { 'celsius': (v: number) => (v - 32) * 5 / 9 },
    'cm': { 'in': 0.393701 },
    'in': { 'cm': 2.54 },
  }
  const conv = conversions[fromUnit]?.[toUnit]
  if (typeof conv === 'number') return value * conv
  if (typeof conv === 'function') return conv(value)
  return value
}

export function normalizeVitalValue(value: number, metric: VitalMetricType, unit: string): { value: number; unit: string } {
  const standardUnits: Partial<Record<VitalMetricType, string>> = {
    [VitalMetricType.HEART_RATE]: 'bpm',
    [VitalMetricType.HRV]: 'ms',
    [VitalMetricType.RESPIRATORY_RATE]: 'breaths/min',
    [VitalMetricType.TEMPERATURE]: 'celsius',
    [VitalMetricType.SPO2]: '%',
    [VitalMetricType.WEIGHT]: 'kg',
    [VitalMetricType.BLOOD_GLUCOSE]: 'mmol/L',
    [VitalMetricType.STEPS]: 'steps',
    [VitalMetricType.CALORIES_BURNED]: 'kcal',
    [VitalMetricType.SLEEP_HOURS]: 'hours',
    [VitalMetricType.STRESS_LEVEL]: '%',
  }

  const targetUnit = standardUnits[metric] ?? unit
  const normalizedValue = toStandardUnit(value, unit, targetUnit)

  return { value: Math.round(normalizedValue * 100) / 100, unit: targetUnit }
}

export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0
  return (value - mean) / stdDev
}

export function deduplicateVitals<T extends { metric: string; timestamp: Date; value: number }>(
  records: T[],
  windowMs: number = 60000
): T[] {
  const seen = new Map<string, T>()
  const sorted = [...records].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  for (const record of sorted) {
    const key = record.metric
    const existing = seen.get(key)
    if (!existing) {
      seen.set(key, record)
    } else {
      const diff = Math.abs(record.timestamp.getTime() - existing.timestamp.getTime())
      if (diff >= windowMs) {
        seen.set(key, record)
      }
    }
  }

  return Array.from(seen.values())
}

export function convertUnit(value: number, fromUnit: string, toUnit: string): number {
  return toStandardUnit(value, fromUnit, toUnit)
}

export function anonymizeData(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ['email', 'password', 'phone', 'avatar', 'authToken', 'refreshToken', 'ipAddress']
  const anonymized = { ...data }
  for (const key of sensitiveKeys) {
    if (key in anonymized) {
      anonymized[key] = '[REDACTED]'
    }
  }
  return anonymized
}
