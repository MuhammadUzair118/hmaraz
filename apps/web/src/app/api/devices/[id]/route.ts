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

  const device = await prisma.wearableDevice.findUnique({ where: { id } })
  if (!device) {
    return NextResponse.json({ error: 'Device not found' }, { status: 404 })
  }
  if (device.userId !== supabaseUser.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.wearableDevice.delete({ where: { id } })

  return NextResponse.json({ data: { deleted: true } })
}
