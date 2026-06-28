import type { VitalMetric } from './types'

const PRISMA_TO_AI: Record<string, VitalMetric> = {
  HEART_RATE: 'heart_rate',
  BLOOD_PRESSURE_SYSTOLIC: 'blood_pressure_systolic',
  BLOOD_PRESSURE_DIASTOLIC: 'blood_pressure_diastolic',
  TEMPERATURE: 'temperature',
  SPO2: 'spo2',
  WEIGHT: 'weight',
  BLOOD_GLUCOSE: 'glucose',
  HRV: 'hrv',
  RESPIRATORY_RATE: 'respiratory_rate',
  STEPS: 'steps',
  CALORIES_BURNED: 'calories',
  SLEEP_HOURS: 'sleep_hours',
} as const

export function toVitalMetric(prismaMetric: string): VitalMetric {
  return PRISMA_TO_AI[prismaMetric] ?? prismaMetric.toLowerCase() as VitalMetric
}
