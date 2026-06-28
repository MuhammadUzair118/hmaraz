import { NextResponse } from 'next/server'
import { prisma } from '@hamraz/database'
import type { VitalRecord } from '@hamraz/ai'
import { createProviderSuite, AnomalyService, toVitalMetric } from '@hamraz/ai'
import { verifyCronSecret } from '../_cron-auth'
import { acquireJobLock, completeJobLock, processBatch } from '../_cron-queue'

const JOB_KEY = 'anomaly-cleanup'

export async function GET(request: Request) {
  const authError = verifyCronSecret(request)
  if (authError) return authError

  const acquired = await acquireJobLock(JOB_KEY)
  if (!acquired) {
    return NextResponse.json({ data: { message: 'Job already running, skipped' }, error: null })
  }

  const anomalies = await prisma.anomalyDetection.findMany({
    where: {
      notifiedAt: null,
      isReviewed: false,
      severity: { in: ['MODERATE', 'HIGH', 'CRITICAL'] },
    },
  })

  const { success, failed, errors } = await processBatch(
    anomalies,
    async (anomaly) => {
      const recentVitals = await prisma.vitalRecord.findMany({
        where: { userId: anomaly.userId, metric: anomaly.metric },
        orderBy: { timestamp: 'desc' },
        take: 20,
      })

      const aiVitals: VitalRecord[] = recentVitals.map(v => ({
        userId: v.userId,
        metric: toVitalMetric(v.metric),
        value: v.value,
        unit: v.unit,
        timestamp: v.timestamp.toISOString(),
      }))

      const aiAnomaly = {
        detected: true,
        metric: toVitalMetric(anomaly.metric),
        value: anomaly.value,
        zScore: anomaly.zScore ?? 0,
        severity: (anomaly.severity?.toLowerCase() ?? 'low') as 'low' | 'medium' | 'high',
      }

      const { fallback } = createProviderSuite()
      const anomalyService = new AnomalyService(fallback)
      const explanation = await anomalyService.explainAnomaly(aiAnomaly, aiVitals)

      await prisma.anomalyDetection.update({
        where: { id: anomaly.id },
        data: { explanation, notifiedAt: new Date() },
      })

      await prisma.notification.create({
        data: {
          userId: anomaly.userId,
          type: 'ANOMALY_ALERT',
          title: `${anomaly.severity} ${anomaly.metric} Anomaly Detected`,
          message: explanation.substring(0, 200),
        },
      })

      await prisma.auditLog.create({
        data: {
          userId: anomaly.userId,
          action: 'CRON_ANOMALY_CLEANUP',
          resource: 'anomaly_detections',
          details: `Notified anomaly ${anomaly.id} (${anomaly.metric}, ${anomaly.severity})`,
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
      message: 'Anomaly cleanup cron completed',
      anomaliesProcessed: success,
      failedCount: failed,
    },
    error: null,
  })
}
