import type { VitalRecord, PipelineResult, Baseline, AnomalyResult } from '../types'
import { validateVitals } from '../pipeline/validate'
import { normalizeVitals } from '../pipeline/normalize'
import { deduplicateVitals } from '../pipeline/deduplicate'
import { imputeVitals } from '../pipeline/impute'
import { BaselineService } from './baseline'
import { AnomalyService } from './anomaly'

export interface IngestResult {
  records: VitalRecord[]
  baselines: Map<string, Baseline>
  anomalies: AnomalyResult[]
  warnings?: string[]
}

export class IngestService {
  private baselineService: BaselineService
  private anomalyService: AnomalyService

  constructor(baselineService: BaselineService, anomalyService: AnomalyService) {
    this.baselineService = baselineService
    this.anomalyService = anomalyService
  }

  async process(records: VitalRecord[], existingBaselines?: Map<string, Baseline>): Promise<PipelineResult<IngestResult>> {
    const warnings: string[] = []

    const validated = validateVitals(records)
    if (!validated.success || !validated.data) {
      return { success: false, error: validated.error }
    }
    if (validated.warnings) warnings.push(...validated.warnings)

    const normalized = normalizeVitals(validated.data)
    if (!normalized.success || !normalized.data) {
      return { success: false, error: normalized.error }
    }
    if (normalized.warnings) warnings.push(...normalized.warnings)

    const deduped = deduplicateVitals(normalized.data)
    if (!deduped.success || !deduped.data) {
      return { success: false, error: deduped.error }
    }
    if (deduped.warnings) warnings.push(...deduped.warnings)

    const imputed = imputeVitals(deduped.data)
    if (!imputed.success || !imputed.data) {
      return { success: false, error: imputed.error }
    }
    if (imputed.warnings) warnings.push(...imputed.warnings)

    const baselines = this.baselineService.computeBaselines(imputed.data)
    const anomalyBaselines = existingBaselines ?? baselines
    const anomalies = this.anomalyService.detectAnomalies(imputed.data, anomalyBaselines)

    return {
      success: true,
      data: {
        records: imputed.data,
        baselines,
        anomalies,
        warnings: warnings.length > 0 ? warnings : undefined,
      },
    }
  }
}
