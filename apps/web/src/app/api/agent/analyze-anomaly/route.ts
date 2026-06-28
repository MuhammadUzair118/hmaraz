import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'
import { createProviderSuite, AnomalyService, BaselineService } from '@hamraz/ai'

export async function POST(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  try {
    const body = await request.json()
    const { anomalyId } = body

    if (!anomalyId) {
      return NextResponse.json({ error: 'anomalyId is required' }, { status: 400 })
    }

    const anomaly = await prisma.anomalyDetection.findUnique({ where: { id: anomalyId } })
    if (!anomaly || anomaly.userId !== supabaseUser.id) {
      return NextResponse.json({ error: 'Anomaly not found' }, { status: 404 })
    }

    const recentVitals = await prisma.vitalRecord.findMany({
      where: { userId: supabaseUser.id, metric: anomaly.metric },
      orderBy: { timestamp: 'desc' },
      take: 20,
    })

    const { fallback } = createProviderSuite()
    const baselineService = new BaselineService()

    const vitals = recentVitals.map(v => ({
      userId: v.userId,
      metric: v.metric.toLowerCase() as import('@hamraz/ai').VitalMetric,
      value: v.value,
      unit: v.unit,
      timestamp: v.timestamp.toISOString(),
    }))

    const baselinesMap = baselineService.computeBaselines(vitals)
    const baseline = baselinesMap.get(anomaly.metric.toLowerCase())

    if (!baseline) {
      return NextResponse.json({ error: 'Insufficient data for baseline' }, { status: 400 })
    }

    const aiAnomaly = {
      detected: true,
      metric: anomaly.metric.toLowerCase() as import('@hamraz/ai').VitalMetric,
      value: anomaly.value,
      zScore: anomaly.zScore ?? 0,
      severity: (anomaly.severity?.toLowerCase() ?? 'low') as 'low' | 'medium' | 'high',
      baseline,
    }

    const anomalyService = new AnomalyService(fallback)
    const explanation = await anomalyService.explainAnomaly(aiAnomaly, vitals)

    const updated = await prisma.anomalyDetection.update({
      where: { id: anomalyId },
      data: { explanation, isReviewed: true, reviewedAt: new Date() },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('POST /api/agent/analyze-anomaly error:', error)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }
}
