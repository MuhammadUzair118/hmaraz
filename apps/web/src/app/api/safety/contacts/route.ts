import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

export async function GET() {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const contacts = await prisma.emergencyContact.findMany({
    where: { userId: supabaseUser.id },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ data: contacts })
}

export async function POST(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  try {
    const body = await request.json()
    const { name, phone, relationship, isNotified } = body

    if (!name || !phone || !relationship) {
      return NextResponse.json({ error: 'name, phone, and relationship are required' }, { status: 400 })
    }

    const contact = await prisma.emergencyContact.create({
      data: {
        userId: supabaseUser.id,
        name,
        phone,
        relationship,
        isNotified: isNotified ?? false,
      },
    })

    return NextResponse.json({ data: contact }, { status: 201 })
  } catch (error) {
    console.error('POST /api/safety/contacts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
