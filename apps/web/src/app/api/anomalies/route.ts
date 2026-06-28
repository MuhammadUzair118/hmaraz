import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

export async function GET(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const { searchParams } = new URL(request.url)
  const severity = searchParams.get('severity')
  const metric = searchParams.get('metric')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)

  const where: Record<string, unknown> = { userId: supabaseUser.id }
  if (severity) where.severity = severity.toUpperCase()
  if (metric) where.metric = metric.toUpperCase()

  const anomalies = await prisma.anomalyDetection.findMany({
    where,
    orderBy: { detectedAt: 'desc' },
    take: limit,
  })

  return NextResponse.json({ data: anomalies })
}
