import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'
import {
  createProviderSuite,
  BaselineService,
  AnomalyService,
  IngestService,
  toVitalMetric,
} from '@hamraz/ai'

export async function POST(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  try {
    const body = await request.json()
    const { records } = body

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'records array is required' }, { status: 400 })
    }

    const aiRecords: import('@hamraz/ai').VitalRecord[] = records.map((r: Record<string, unknown>) => ({
      userId: supabaseUser.id,
      metric: toVitalMetric(r.metric as string),
      value: Number(r.value),
      unit: r.unit as string,
      timestamp: (r.timestamp as string) ?? new Date().toISOString(),
      source: r.source as string | undefined,
    }))

    const { fallback } = createProviderSuite()
    const baselineService = new BaselineService()
    const anomalyService = new AnomalyService(fallback)
    const ingestService = new IngestService(baselineService, anomalyService)

    const result = await ingestService.process(aiRecords)

    if (!result.success || !result.data) {
      return NextResponse.json({ error: result.error ?? 'Ingestion failed' }, { status: 400 })
    }

    for (const record of result.data.records) {
      await prisma.vitalRecord.create({
        data: {
          userId: supabaseUser.id,
          metric: record.metric.toUpperCase() as import('@prisma/client').$Enums.VitalMetricType,
          value: record.value,
          unit: record.unit,
          timestamp: new Date(record.timestamp),
          source: record.source ? record.source as import('@prisma/client').$Enums.DeviceType : undefined,
        },
      })
    }

    for (const [, baseline] of result.data.baselines) {
      const metricUpper = baseline.metric.toUpperCase() as import('@prisma/client').$Enums.VitalMetricType
      await prisma.vitalBaseline.upsert({
        where: { userId_metric: { userId: supabaseUser.id, metric: metricUpper } },
        update: {
          minValue: baseline.min,
          maxValue: baseline.max,
          mean: baseline.mean,
          stdDev: baseline.stdDev,
          sampleCount: baseline.sampleSize,
        },
        create: {
          userId: supabaseUser.id,
          metric: metricUpper,
          minValue: baseline.min,
          maxValue: baseline.max,
          mean: baseline.mean,
          stdDev: baseline.stdDev,
          sampleCount: baseline.sampleSize,
          unit: '',
        },
      })
    }

    for (const anomaly of result.data.anomalies) {
      await prisma.anomalyDetection.create({
        data: {
          userId: supabaseUser.id,
          metric: anomaly.metric.toUpperCase() as import('@prisma/client').$Enums.VitalMetricType,
          value: anomaly.value,
          zScore: anomaly.zScore,
          severity: anomaly.severity.toUpperCase() as import('@prisma/client').$Enums.AnomalySeverity,
        },
      })
    }

    return NextResponse.json({
      data: {
        ingested: result.data.records.length,
        anomalies: result.data.anomalies.length,
        warnings: result.data.warnings,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/agent/ingest-vital error:', error)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }
}
