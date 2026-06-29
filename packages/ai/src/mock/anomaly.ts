import type { AnomalyResult, VitalRecord } from '../types'

export function mockAnomaly(): AnomalyResult {
  return {
    detected: true,
    metric: 'heart_rate',
    value: 118,
    zScore: 2.8,
    severity: 'moderate',
    explanation: 'Your heart rate spiked to 118 bpm while at rest. This could be due to stress, caffeine, or recent activity. Your baseline is 72 bpm. If this persists, consider resting and monitoring.',
    baseline: {
      metric: 'heart_rate',
      mean: 72,
      stdDev: 12,
      min: 55,
      max: 95,
      sampleSize: 120,
      lastComputed: new Date().toISOString(),
    },
  }
}

export function mockAnomalyList(): AnomalyResult[] {
  return [
    mockAnomaly(),
    {
      detected: true,
      metric: 'spo2',
      value: 91,
      zScore: -2.1,
      severity: 'low',
      explanation: 'SpO2 briefly dropped to 91%. This is below your baseline of 97%. It may have been a sensor placement issue. If you feel fine, no action needed.',
      baseline: {
        metric: 'spo2',
        mean: 97,
        stdDev: 1.5,
        min: 94,
        max: 100,
        sampleSize: 200,
        lastComputed: new Date().toISOString(),
      },
    },
  ]
}

export async function mockAnomalyExplanation(_anomaly: AnomalyResult, _recent: VitalRecord[]): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return 'This reading is outside your normal range but may be explained by recent activity or temporary factors. Monitor and consult a doctor if it persists.'
}
