import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@hamraz/database'
import { signUpSchema } from '@hamraz/types'

function createSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    { cookies: { getAll: () => [], setAll: () => {} } },
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signUpSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { email, password, name } = parsed.data
    const supabase = createSupabaseAdmin()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (authData.user) {
      await prisma.userProfile.create({
        data: {
          id: authData.user.id,
          email,
          name,
        },
      })
    }

    return NextResponse.json({ data: { user: { id: authData.user.id, email: authData.user.email } } }, { status: 201 })
  } catch (error) {
    console.error('POST /api/auth/signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
