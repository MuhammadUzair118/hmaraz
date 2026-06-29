import type { VitalRecord, Baseline, AnomalyResult } from '../types'
import { ANOMALY_PROMPT } from '../prompts/anomaly-prompt'
import { FallbackProvider } from '../providers/fallback'

function computeAdaptiveThresholds(baseline: Baseline): { low: number; moderate: number; high: number } {
  const mean = Math.abs(baseline.mean)
  const cv = mean > 0 ? baseline.stdDev / mean : 0.1

  if (cv < 0.05) {
    return { low: 1.5, moderate: 2.0, high: 2.5 }
  }
  if (cv < 0.15) {
    return { low: 2.0, moderate: 2.5, high: 3.0 }
  }
  return { low: 2.5, moderate: 3.0, high: 3.5 }
}

export class AnomalyService {
  private fallback: FallbackProvider

  constructor(fallback: FallbackProvider) {
    this.fallback = fallback
  }

  detectAnomaly(record: VitalRecord, baseline: Baseline): AnomalyResult | null {
    if (baseline.sampleSize < 5) return null

    const zScore = (record.value - baseline.mean) / (baseline.stdDev || 1)
    const absZ = Math.abs(zScore)
    const thresholds = computeAdaptiveThresholds(baseline)

    if (absZ < thresholds.low) return null

    return {
      detected: true,
      metric: record.metric,
      value: record.value,
      zScore: Math.round(zScore * 100) / 100,
      severity: absZ >= thresholds.high ? 'high' : absZ >= thresholds.moderate ? 'moderate' : 'low',
      baseline,
    }
  }

  detectAnomalies(records: VitalRecord[], baselines: Map<string, Baseline>): AnomalyResult[] {
    const anomalies: AnomalyResult[] = []

    for (const record of records) {
      const baseline = baselines.get(record.metric)
      if (baseline) {
        const result = this.detectAnomaly(record, baseline)
        if (result) {
          anomalies.push(result)
        }
      }
    }

    return anomalies
  }

  async explainAnomaly(anomaly: AnomalyResult, recentVitals: VitalRecord[]): Promise<string> {
    const prompt = ANOMALY_PROMPT
      .replace('{{metric}}', anomaly.metric)
      .replace('{{value}}', anomaly.value.toString())
      .replace('{{zScore}}', anomaly.zScore.toString())
      .replace('{{severity}}', anomaly.severity)
      .replace('{{baseline}}', JSON.stringify(anomaly.baseline, null, 2))
      .replace('{{recent}}', JSON.stringify(recentVitals.slice(-10), null, 2))

    const response = await this.fallback.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      maxTokens: 256,
    })

    return response.content
  }
}
