import { cookies } from 'next/headers'
import { createServerSupabase } from './supabase'
import { prisma } from '@hamraz/database'

export async function requireAuth() {
  const cookieStore = await cookies()
  const supabase = createServerSupabase(cookieStore)
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user || !user.email) {
    return null
  }

  return user
}

export async function getOrCreateProfile(supabaseUser: NonNullable<Awaited<ReturnType<typeof requireAuth>>>) {
  const existing = await prisma.userProfile.findUnique({
    where: { id: supabaseUser.id },
  })

  if (existing) {
    return existing
  }

  return prisma.userProfile.create({
    data: {
      id: supabaseUser.id,
      email: supabaseUser.email ?? '',
      name: supabaseUser.user_metadata?.full_name ?? supabaseUser.email?.split('@')[0] ?? 'User',
    },
  })
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
