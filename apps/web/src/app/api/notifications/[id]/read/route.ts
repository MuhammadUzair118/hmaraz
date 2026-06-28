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

  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
  }
  if (notification.userId !== supabaseUser.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  })

  return NextResponse.json({ data: updated })
}
