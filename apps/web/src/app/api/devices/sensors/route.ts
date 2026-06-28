import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'
import { sensorDataSchema } from '@hamraz/types'
import type { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  try {
    const body = await request.json()
    const parsed = sensorDataSchema.safeParse({ ...body })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { sensorType, value, unit, timestamp, metadata } = parsed.data

    const record = await prisma.phoneSensorData.create({
      data: {
        userId: supabaseUser.id,
        sensorType,
        value,
        unit,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    })

    return NextResponse.json({ data: record }, { status: 201 })
  } catch (error) {
    console.error('POST /api/devices/sensors error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
