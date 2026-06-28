import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const { id } = await params

  const existing = await prisma.emergencyContact.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }
  if (existing.userId !== supabaseUser.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const allowedFields = ['name', 'phone', 'relationship', 'isNotified']
  const updateData: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field]
    }
  }

  const contact = await prisma.emergencyContact.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json({ data: contact })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const { id } = await params

  const existing = await prisma.emergencyContact.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }
  if (existing.userId !== supabaseUser.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.emergencyContact.delete({ where: { id } })

  return NextResponse.json({ data: { deleted: true } })
}
