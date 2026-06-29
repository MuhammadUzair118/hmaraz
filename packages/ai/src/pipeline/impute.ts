import type { VitalRecord, PipelineResult } from '../types'
import { PIPELINE } from '../config'

export function imputeVitals(records: VitalRecord[]): PipelineResult<VitalRecord[]> {
  const maxGap = PIPELINE.imputeMaxGapMs
  const grouped = new Map<string, VitalRecord[]>()

  for (const record of records) {
    const key = `${record.userId}:${record.metric}`
    const group = grouped.get(key) ?? []
    group.push(record)
    grouped.set(key, group)
  }

  const result: VitalRecord[] = []
  const warnings: string[] = []

  const groups = Array.from(grouped.entries())
  for (const [, group] of groups) {
    const sorted = [...group].sort(
      (a: VitalRecord, b: VitalRecord) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    for (let i = 0; i < sorted.length; i++) {
      const record = sorted[i]!
      result.push(record)

      if (i < sorted.length - 1) {
        const current = new Date(record.timestamp).getTime()
        const next = new Date(sorted[i + 1]!.timestamp).getTime()
        const gap = next - current

        if (gap > maxGap) {
          warnings.push(
            `Gap of ${Math.round(gap / 1000 / 60)}min in ${sorted[i]!.metric} at ${sorted[i]!.timestamp}`
          )
        }
      }
    }

    if (sorted.length >= 2) {
      const interpolated = interpolate(sorted)
      result.push(...interpolated)
    }
  }

  return {
    success: true,
    data: result,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

function interpolate(sorted: VitalRecord[]): VitalRecord[] {
  const maxGap = PIPELINE.imputeMaxGapMs
  const interpolated: VitalRecord[] = []

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]!
    const b = sorted[i + 1]!
    const tA = new Date(a.timestamp).getTime()
    const tB = new Date(b.timestamp).getTime()
    const gap = tB - tA

    if (gap > maxGap) continue

    const midTs = new Date(tA + gap / 2).toISOString()
    const midValue = Math.round(((a.value + b.value) / 2) * 100) / 100

    interpolated.push({
      userId: a.userId,
      metric: a.metric,
      value: midValue,
      unit: a.unit,
      timestamp: midTs,
      source: 'imputed',
    })
  }

  return interpolated
}
