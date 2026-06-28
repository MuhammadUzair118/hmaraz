import { NextResponse } from 'next/server'
import { prisma } from '@hamraz/database'
import type { VitalRecord, Baseline } from '@hamraz/ai'
import { createProviderSuite, InsightsService, toVitalMetric } from '@hamraz/ai'
import { verifyCronSecret } from '../_cron-auth'
import { acquireJobLock, completeJobLock, processBatch, getConsentedUserIds } from '../_cron-queue'

const JOB_KEY = 'daily-summary'

export async function GET(request: Request) {
  const authError = verifyCronSecret(request)
  if (authError) return authError

  const acquired = await acquireJobLock(JOB_KEY)
  if (!acquired) {
    return NextResponse.json({ data: { message: 'Job already running, skipped' }, error: null })
  }

  const users = await getConsentedUserIds()
  const since = new Date()
  since.setDate(since.getDate() - 1)

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
      const insight = await insightsService.generateDailyInsight(user.id, aiVitals, aiBaselines)

      await prisma.dailySummary.upsert({
        where: { userId_date: { userId: user.id, date: new Date() } },
        update: { summary: insight.summary },
        create: {
          userId: user.id,
          date: new Date(),
          summary: insight.summary,
          highlights: [],
          recommendations: [],
        },
      })

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'DAILY_SUMMARY',
          title: 'Your Daily Health Summary',
          message: insight.summary.substring(0, 200),
        },
      })

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CRON_DAILY_SUMMARY',
          resource: 'daily_summaries',
          details: `Generated daily summary for ${aiVitals.length} records`,
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
      message: 'Daily summary cron completed',
      usersProcessed: success,
      failedCount: failed,
    },
    error: null,
  })
}
