import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ metric: string }> },
) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const { metric } = await params
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 500)

  const metricUpper = metric.toUpperCase() as import('@prisma/client').$Enums.VitalMetricType

  const where: Record<string, unknown> = { userId: supabaseUser.id, metric: metricUpper }
  if (from || to) {
    const timestampFilter: Record<string, Date> = {}
    if (from) timestampFilter.gte = new Date(from)
    if (to) timestampFilter.lte = new Date(to)
    where.timestamp = timestampFilter
  }

  const records = await prisma.vitalRecord.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: limit,
  })

  return NextResponse.json({ data: records })
}
