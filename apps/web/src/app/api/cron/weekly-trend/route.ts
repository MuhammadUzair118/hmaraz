import { NextResponse } from 'next/server'
import { prisma } from '@hamraz/database'
import type { VitalRecord, Baseline } from '@hamraz/ai'
import { createProviderSuite, InsightsService, toVitalMetric } from '@hamraz/ai'
import { verifyCronSecret } from '../_cron-auth'
import { acquireJobLock, completeJobLock, processBatch, getConsentedUserIds } from '../_cron-queue'

const JOB_KEY = 'weekly-trend'

export async function GET(request: Request) {
  const authError = verifyCronSecret(request)
  if (authError) return authError

  const acquired = await acquireJobLock(JOB_KEY)
  if (!acquired) {
    return NextResponse.json({ data: { message: 'Job already running, skipped' }, error: null })
  }

  const users = await getConsentedUserIds()
  const since = new Date()
  since.setDate(since.getDate() - 7)

  const { success, failed, errors } = await processBatch(
    users,
    async (user) => {
      const vitals = await prisma.vitalRecord.findMany({
        where: { userId: user.id, timestamp: { gte: since } },
        orderBy: { timestamp: 'asc' },
      })

      const baselines = await prisma.vitalBaseline.findMany({
        where: { userId: user.id },
      })

      const aiVitals: VitalRecord[] = vitals.map(v => ({
        userId: v.userId,
        metric: toVitalMetric(v.metric),
        value: v.value,
        unit: v.unit,
        timestamp: v.timestamp.toISOString(),
      }))

      const aiBaselines: Baseline[] = baselines.map(b => ({
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
      const insight = await insightsService.generateWeeklyInsight(user.id, aiVitals, aiBaselines)

      await prisma.aIInsight.create({
        data: {
          userId: user.id,
          insightType: 'WEEKLY_TREND',
          title: insight.title,
          summary: insight.summary,
        },
      })

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'WEEKLY_TREND',
          title: 'Weekly Trend Report Ready',
          message: insight.summary.substring(0, 200),
        },
      })

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CRON_WEEKLY_TREND',
          resource: 'ai_insights',
          details: `Generated weekly trend from ${aiVitals.length} records`,
        },
      })
    }
  )

  await completeJobLock(
    JOB_KEY,
    success,
    failed,
    errors.length > 0 ? errors.join(' | ') : undefined
  )

  return NextResponse.json({
    data: {
      message: 'Weekly trend cron completed',
      usersProcessed: success,
      failedCount: failed,
    },
    error: null,
  })
}
