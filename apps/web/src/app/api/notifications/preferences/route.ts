import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

export async function GET() {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: supabaseUser.id },
  })

  return NextResponse.json({ data: prefs ?? {} })
}

export async function PUT(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  try {
    const body = await request.json()
    const allowedFields = ['email', 'push', 'sms', 'types', 'insights', 'anomalies', 'summaries']

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const prefs = await prisma.notificationPreference.upsert({
      where: { userId: supabaseUser.id },
      update: updateData,
      create: { userId: supabaseUser.id, ...updateData },
    })

    return NextResponse.json({ data: prefs })
  } catch (error) {
    console.error('PUT /api/notifications/preferences error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
