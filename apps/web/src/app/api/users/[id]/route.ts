import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const { id } = await params

  const profile = await prisma.userProfile.findUnique({ where: { id } })
  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (supabaseUser.id !== id && profile.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.userProfile.delete({ where: { id } })

  return NextResponse.json({ data: { deleted: true } })
}
