import { NextResponse } from 'next/server'
import { requireAuth, unauthorized, getOrCreateProfile } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

export async function GET() {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const profile = await getOrCreateProfile(supabaseUser)

  return NextResponse.json({
    data: {
      ...profile,
      needsOnboarding: !profile.onboardingCompleted,
    },
  })
}

export async function PUT(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  try {
    const body = await request.json()
    const allowedFields = ['name', 'phone', 'gender', 'dateOfBirth', 'height', 'weight', 'avatar', 'timezone', 'measurementSystem', 'onboardingCompleted']

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const profile = await prisma.userProfile.update({
      where: { id: supabaseUser.id },
      data: updateData,
    })

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error('PUT /api/users/me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
