import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

export async function PUT() {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const result = await prisma.notification.updateMany({
    where: { userId: supabaseUser.id, isRead: false },
    data: { isRead: true },
  })

  return NextResponse.json({ data: { updatedCount: result.count } })
}
