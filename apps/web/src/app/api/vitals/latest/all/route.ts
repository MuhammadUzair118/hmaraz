import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'
import { Prisma } from '@prisma/client'

export async function GET() {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const metrics = await prisma.vitalRecord.groupBy({
    by: ['metric'],
    where: { userId: supabaseUser.id },
    _max: { timestamp: true },
  })

  const latest: Record<string, unknown> = {}
  for (const group of metrics) {
    const record = await prisma.vitalRecord.findFirst({
      where: { userId: supabaseUser.id, metric: group.metric, timestamp: group._max.timestamp ?? undefined },
      orderBy: { timestamp: 'desc' },
    })
    if (record) {
      latest[record.metric.toLowerCase()] = record
    }
  }

  return NextResponse.json({ data: latest })
}
