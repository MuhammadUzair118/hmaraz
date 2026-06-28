import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'
import { wearableConnectSchema } from '@hamraz/types'

export async function GET() {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const devices = await prisma.wearableDevice.findMany({
    where: { userId: supabaseUser.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: devices })
}

export async function POST(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  try {
    const body = await request.json()
    const parsed = wearableConnectSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const device = await prisma.wearableDevice.create({
      data: {
        userId: supabaseUser.id,
        ...parsed.data,
      },
    })

    return NextResponse.json({ data: device }, { status: 201 })
  } catch (error) {
    console.error('POST /api/devices error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
