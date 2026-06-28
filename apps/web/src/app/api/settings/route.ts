import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'
import { userSettingsUpdateSchema } from '@hamraz/types'
import type { Prisma } from '@prisma/client'

export async function GET() {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const settings = await prisma.userSettings.findUnique({
    where: { userId: supabaseUser.id },
  })

  return NextResponse.json({ data: settings ?? {} })
}

export async function PUT(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  try {
    const body = await request.json()
    const parsed = userSettingsUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const data: Prisma.UserSettingsUpdateInput = {}
    if (parsed.data.theme !== undefined) data.theme = parsed.data.theme
    if (parsed.data.measurementSystem !== undefined) data.measurementSystem = parsed.data.measurementSystem
    if (parsed.data.aiProvider !== undefined) data.aiProvider = parsed.data.aiProvider
    if (parsed.data.wearableAutoSync !== undefined) data.wearableAutoSync = parsed.data.wearableAutoSync
    if (parsed.data.dataCollectionEnabled !== undefined) data.dataCollectionEnabled = parsed.data.dataCollectionEnabled
    if (parsed.data.insightFrequency !== undefined) data.insightFrequency = parsed.data.insightFrequency
    if (parsed.data.privacyJson !== undefined) data.privacyJson = parsed.data.privacyJson as Prisma.InputJsonValue

    const settings = await prisma.userSettings.upsert({
      where: { userId: supabaseUser.id },
      update: data,
      create: { userId: supabaseUser.id, ...data } as Prisma.UserSettingsUncheckedCreateInput,
    })

    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error('PUT /api/settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
