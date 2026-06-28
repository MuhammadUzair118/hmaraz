import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ metric: string }> },
) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const { metric } = await params
  const metricUpper = metric.toUpperCase() as import('@prisma/client').$Enums.VitalMetricType

  const record = await prisma.vitalRecord.findFirst({
    where: { userId: supabaseUser.id, metric: metricUpper },
    orderBy: { timestamp: 'desc' },
  })

  if (!record) {
    return NextResponse.json({ error: 'No data found for this metric' }, { status: 404 })
  }

  return NextResponse.json({ data: record })
}
