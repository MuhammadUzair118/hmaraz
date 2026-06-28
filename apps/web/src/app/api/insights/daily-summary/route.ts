import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

export async function GET() {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const summary = await prisma.dailySummary.findFirst({
    where: {
      userId: supabaseUser.id,
      date: { gte: today },
    },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json({ data: summary })
}
