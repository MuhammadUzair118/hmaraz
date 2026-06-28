import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const { id } = await params

  const insight = await prisma.aIInsight.findUnique({ where: { id } })
  if (!insight) {
    return NextResponse.json({ error: 'Insight not found' }, { status: 404 })
  }
  if (insight.userId !== supabaseUser.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ data: insight })
}
