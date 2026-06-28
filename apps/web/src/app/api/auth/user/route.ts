import { NextResponse } from 'next/server'
import { requireAuth, getOrCreateProfile, unauthorized } from '@/lib/auth-helpers'

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
