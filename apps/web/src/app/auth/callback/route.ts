import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase'
import { prisma } from '@hamraz/database'
import { NextResponse } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerSupabase(cookieStore)
    await supabase.auth.exchangeCodeForSession(code)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await prisma.userProfile.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email ?? '',
          name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User',
        },
      })
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
