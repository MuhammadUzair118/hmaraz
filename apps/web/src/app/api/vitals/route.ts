import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'
import { vitalCreateSchema } from '@hamraz/types'
import { normalizeVitalValue } from '@hamraz/utils'

export async function POST(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  try {
    const body = await request.json()
    const parsed = vitalCreateSchema.safeParse({ ...body, userId: supabaseUser.id })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { metric, value, unit, timestamp, source } = parsed.data
    const normalized = normalizeVitalValue(value, metric, unit)

    const record = await prisma.vitalRecord.create({
      data: {
        userId: supabaseUser.id,
        metric,
        value: normalized.value,
        unit: normalized.unit,
        source,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    })

    return NextResponse.json({ data: record }, { status: 201 })
  } catch (error) {
    console.error('POST /api/vitals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
