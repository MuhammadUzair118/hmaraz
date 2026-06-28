import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

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

    const values = records.map(r => r.value)
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
    const stdDev = Math.sqrt(variance)
    const sorted = [...values].sort((a, b) => a - b)
    const percentile5 = sorted[Math.floor(sorted.length * 0.05)]
    const percentile95 = sorted[Math.floor(sorted.length * 0.95)]

    const baseline = await prisma.vitalBaseline.upsert({
      where: { userId_metric: { userId: supabaseUser.id, metric } },
      update: {
        minValue: Math.min(...values),
        maxValue: Math.max(...values),
        mean: Math.round(mean * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100,
        percentile5: Math.round(percentile5 * 100) / 100,
        percentile95: Math.round(percentile95 * 100) / 100,
        sampleCount: values.length,
        unit: records[0].unit,
      },
      create: {
        userId: supabaseUser.id,
        metric,
        minValue: Math.min(...values),
        maxValue: Math.max(...values),
        mean: Math.round(mean * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100,
        percentile5: Math.round(percentile5 * 100) / 100,
        percentile95: Math.round(percentile95 * 100) / 100,
        sampleCount: values.length,
        unit: records[0].unit,
      },
    })

    return NextResponse.json({ data: baseline })
  } catch (error) {
    console.error('POST /api/vitals/baseline error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
