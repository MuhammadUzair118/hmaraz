import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'
import { createProviderSuite, InsightsService, toVitalMetric } from '@hamraz/ai'

export async function POST(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  try {
    const body = await request.json()
    const period = body.period ?? 'daily'

    const since = new Date()
    if (period === 'weekly') since.setDate(since.getDate() - 7)
    else if (period === 'monthly') since.setDate(since.getDate() - 30)
    else since.setDate(since.getDate() - 1)

    const vitals = await prisma.vitalRecord.findMany({
      where: { userId: supabaseUser.id, timestamp: { gte: since } },
      orderBy: { timestamp: 'asc' },
    })

    const baselines = await prisma.vitalBaseline.findMany({
      where: { userId: supabaseUser.id },
    })

    const aiVitals = vitals.map(v => ({
      userId: v.userId,
      metric: toVitalMetric(v.metric),
      value: v.value,
      unit: v.unit,
      timestamp: v.timestamp.toISOString(),
    }))

    const aiBaselines = baselines.map(b => ({
      metric: toVitalMetric(b.metric),
      mean: b.mean ?? 0,
      stdDev: b.stdDev ?? 0,
      min: b.minValue,
      max: b.maxValue,
      sampleSize: b.sampleCount,
      lastComputed: b.updatedAt.toISOString(),
    }))

    const { fallback } = createProviderSuite()
    const insightsService = new InsightsService(fallback)

    let insight: import('@hamraz/ai').Insight
    if (period === 'weekly') {
      insight = await insightsService.generateWeeklyInsight(supabaseUser.id, aiVitals, aiBaselines)
    } else if (period === 'monthly') {
      insight = await insightsService.generateMonthlyInsight(supabaseUser.id, aiVitals, aiBaselines)
    } else {
      insight = await insightsService.generateDailyInsight(supabaseUser.id, aiVitals, aiBaselines)
    }

    const saved = await prisma.aIInsight.create({
      data: {
        userId: supabaseUser.id,
        insightType: insight.type.toUpperCase() as import('@prisma/client').$Enums.InsightType,
        title: insight.title,
        summary: insight.summary,
      },
    })

    if (period === 'daily') {
      await prisma.dailySummary.upsert({
        where: { userId_date: { userId: supabaseUser.id, date: new Date() } },
        update: { summary: insight.summary },
        create: {
          userId: supabaseUser.id,
          date: new Date(),
          summary: insight.summary,
          highlights: [],
          recommendations: [],
        },
      })
    }

    return NextResponse.json({ data: saved }, { status: 201 })
  } catch (error) {
    console.error('POST /api/agent/insights error:', error)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }
}
