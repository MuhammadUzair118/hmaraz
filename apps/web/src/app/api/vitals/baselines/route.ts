import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

export async function GET() {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const baselines = await prisma.vitalBaseline.findMany({
    where: { userId: supabaseUser.id },
  })

  return NextResponse.json({ data: baselines })
}
