import type { VitalRecord, Baseline, VitalMetric } from '../types'

export class BaselineService {
  computeBaseline(records: VitalRecord[]): Baseline | null {
    if (records.length < 5) return null

    const metric = records[0].metric
    const values = records.map(r => r.value)
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
    const stdDev = Math.sqrt(variance)

    return {
      metric,
      mean: Math.round(mean * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      min: Math.round(Math.min(...values) * 100) / 100,
      max: Math.round(Math.max(...values) * 100) / 100,
      sampleSize: values.length,
      lastComputed: new Date().toISOString(),
    }
  }

  computeBaselines(records: VitalRecord[]): Map<string, Baseline> {
    const grouped = new Map<VitalMetric, VitalRecord[]>()

    for (const record of records) {
      const group = grouped.get(record.metric) ?? []
      group.push(record)
      grouped.set(record.metric, group)
    }

  const baselines = new Map<string, Baseline>()
  const entries = Array.from(grouped.entries())
  for (const [metric, group] of entries) {
    const baseline = this.computeBaseline(group)
    if (baseline) {
      baselines.set(metric, baseline)
    }
  }

    return baselines
  }

  shouldRecalculate(existing: Baseline, newRecords: number): boolean {
    return newRecords >= existing.sampleSize * 0.25
  }
}
