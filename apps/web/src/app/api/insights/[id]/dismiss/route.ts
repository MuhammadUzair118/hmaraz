import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

export async function PUT(
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

  const updated = await prisma.aIInsight.update({
    where: { id },
    data: { isDismissed: true },
  })

  return NextResponse.json({ data: updated })
}
