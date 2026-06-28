import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

export async function GET(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const { searchParams } = new URL(request.url)
  const metric = searchParams.get('metric')
  const period = searchParams.get('period')

  const where: Record<string, unknown> = { userId: supabaseUser.id }
  if (metric) where.metric = metric.toUpperCase()
  if (period) where.period = period

  const analytics = await prisma.analytics.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ data: analytics })
}
