import type { VitalRecord, PipelineResult } from '../types'
import { PIPELINE } from '../config'

export function deduplicateVitals(records: VitalRecord[]): PipelineResult<VitalRecord[]> {
  const window = PIPELINE.deduplicateWindowMs
  const seen = new Map<string, VitalRecord>()

  for (const record of records) {
    const ts = new Date(record.timestamp).getTime()
    const key = `${record.userId}:${record.metric}`
    const existing = seen.get(key)

    if (!existing) {
      seen.set(key, record)
    } else {
      const existingTs = new Date(existing.timestamp).getTime()
      if (Math.abs(ts - existingTs) < window) {
        if (ts > existingTs) {
          seen.set(key, record)
        }
      } else {
        seen.set(key, record)
      }
    }
  }

  const deduped = Array.from(seen.values())
  const removed = records.length - deduped.length

  return {
    success: true,
    data: deduped,
    warnings: removed > 0 ? [`Removed ${removed} duplicate records`] : undefined,
  }
}
