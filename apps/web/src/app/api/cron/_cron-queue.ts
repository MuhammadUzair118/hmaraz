import { prisma } from '@hamraz/database'

const BATCH_SIZE = 5
const BATCH_STAGGER_MS = 200

export async function acquireJobLock(jobKey: string): Promise<boolean> {
  const existing = await prisma.cronJob.findUnique({ where: { jobKey } })

  if (existing && existing.status === 'running') {
    return false
  }

  await prisma.cronJob.upsert({
    where: { jobKey },
    update: {
      status: 'running',
      startedAt: new Date(),
      completedAt: null,
      usersProcessed: 0,
      failedCount: 0,
      errorLog: null,
    },
    create: {
      jobKey,
      status: 'running',
      startedAt: new Date(),
    },
  })

  return true
}

export async function completeJobLock(
  jobKey: string,
  usersProcessed: number,
  failedCount: number,
  errorLog?: string
): Promise<void> {
  await prisma.cronJob.update({
    where: { jobKey },
    data: {
      status: 'completed',
      completedAt: new Date(),
      lastRunAt: new Date(),
      usersProcessed,
      failedCount,
      errorLog: errorLog || null,
    },
  })
}

export async function processBatch<T>(
  items: T[],
  processor: (item: T) => Promise<void>,
  batchSize = BATCH_SIZE,
  staggerMs = BATCH_STAGGER_MS
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0
  let failed = 0
  const errors: string[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)

    const results = await Promise.allSettled(
      batch.map((item) => processor(item))
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        success++
      } else {
        failed++
        errors.push(result.reason?.message || result.reason || 'Unknown error')
      }
    }

    if (i + batchSize < items.length) {
      await new Promise((r) => setTimeout(r, staggerMs))
    }
  }

  return { success, failed, errors }
}

export function getConsentedUserIds(): Promise<{ id: string; timezone: string | null }[]> {
  return prisma.userProfile.findMany({
    where: {
      isActive: true,
      userSettings: { dataCollectionEnabled: true },
    },
    select: { id: true, timezone: true },
  })
}
