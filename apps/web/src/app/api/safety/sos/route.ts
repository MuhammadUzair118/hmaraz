import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

export async function POST(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  try {
    const body = await request.json()
    const type = body.type ?? 'MANUAL'
    const location = body.location ?? null

    const alert = await prisma.emergencyAlert.create({
      data: {
        userId: supabaseUser.id,
        type,
        severity: 'CRITICAL',
        location,
        status: 'ACTIVE',
      },
    })

    const contacts = await prisma.emergencyContact.findMany({
      where: { userId: supabaseUser.id, isNotified: true },
    })

    return NextResponse.json({ data: { alert, notifiedContacts: contacts.length } }, { status: 201 })
  } catch (error) {
    console.error('POST /api/safety/sos error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
