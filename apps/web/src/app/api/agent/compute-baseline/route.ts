import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'
import { BaselineService } from '@hamraz/ai'

export async function POST(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  try {
    const body = await request.json()
    const metric = body.metric?.toUpperCase()
    if (!metric) {
      return NextResponse.json({ error: 'metric is required' }, { status: 400 })
    }

    const records = await prisma.vitalRecord.findMany({
      where: { userId: supabaseUser.id, metric },
      orderBy: { timestamp: 'asc' },
    })

    if (records.length < 5) {
      return NextResponse.json({ error: 'Need at least 5 records to compute baseline' }, { status: 400 })
    }

    const vitals = records.map(v => ({
      userId: v.userId,
      metric: v.metric.toLowerCase() as import('@hamraz/ai').VitalMetric,
      value: v.value,
      unit: v.unit,
      timestamp: v.timestamp.toISOString(),
    }))

    const baselineService = new BaselineService()
    const baselinesMap = baselineService.computeBaselines(vitals)
    const baseline = baselinesMap.get(metric.toLowerCase())

    if (!baseline) {
      return NextResponse.json({ error: 'Could not compute baseline' }, { status: 500 })
    }

    const saved = await prisma.vitalBaseline.upsert({
      where: { userId_metric: { userId: supabaseUser.id, metric } },
      update: {
        minValue: baseline.min,
        maxValue: baseline.max,
        mean: baseline.mean,
        stdDev: baseline.stdDev,
        sampleCount: baseline.sampleSize,
        unit: records[0].unit,
      },
      create: {
        userId: supabaseUser.id,
        metric,
        minValue: baseline.min,
        maxValue: baseline.max,
        mean: baseline.mean,
        stdDev: baseline.stdDev,
        sampleCount: baseline.sampleSize,
        unit: records[0].unit,
      },
    })

    return NextResponse.json({ data: saved })
  } catch (error) {
    console.error('POST /api/agent/compute-baseline error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
