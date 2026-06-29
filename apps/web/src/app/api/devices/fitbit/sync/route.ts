import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'
import { VitalMetricType } from '@hamraz/types'

const FITBIT_API = 'https://api.fitbit.com/1/user/-'

async function refreshAccessToken(device: { id: string; refreshToken: string | null }) {
  const clientId = process.env['FITBIT_CLIENT_ID']!
  const clientSecret = process.env['FITBIT_CLIENT_SECRET']!
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: device.refreshToken ?? '',
  })

  const res = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!res.ok) throw new Error('Token refresh failed')

  const data = await res.json()

  await prisma.wearableDevice.update({
    where: { id: device.id },
    data: {
      authToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: new Date(Date.now() + (data.expires_in ?? 28800) * 1000),
      lastSyncAt: new Date(),
    },
  })

  return data.access_token
}

async function fetchFitbitData(endpoint: string, accessToken: string) {
  const res = await fetch(`${FITBIT_API}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Fitbit API error: ${res.status}`)
  return res.json()
}

export async function POST(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  let body: { deviceId?: string } = {}
  try { body = await request.json() } catch { /* use default */ }

  const devices = await prisma.wearableDevice.findMany({
    where: {
      userId: supabaseUser.id,
      deviceType: 'FITBIT',
      isConnected: true,
      ...(body.deviceId ? { id: body.deviceId } : {}),
    },
  })

  if (devices.length === 0) {
    return NextResponse.json({ error: 'No Fitbit devices connected' }, { status: 404 })
  }

  const results: { deviceId: string; records: number; error?: string }[] = []

  for (const device of devices) {
    try {
      let accessToken = device.authToken

      if (device.tokenExpiresAt && new Date(device.tokenExpiresAt) < new Date()) {
        accessToken = await refreshAccessToken(device)
      }

      if (!accessToken) {
        results.push({ deviceId: device.id, records: 0, error: 'No access token' })
        continue
      }

      const today = new Date().toISOString().split('T')[0]
      const [activities, heart, sleep, spo2] = await Promise.allSettled([
        fetchFitbitData(`/activities/date/${today}.json`, accessToken),
        fetchFitbitData(`/activities/heart/date/${today}/1d.json`, accessToken),
        fetchFitbitData(`/sleep/date/${today}.json`, accessToken),
        fetchFitbitData(`/spo2/date/${today}.json`, accessToken).catch(() => null),
      ])

      let recordsCreated = 0

      const vitalData: { metric: VitalMetricType; value: number; unit: string; timestamp: Date }[] = []

      if (activities.status === 'fulfilled' && activities.value.summary) {
        const s = activities.value.summary
        if (s.steps) vitalData.push({ metric: VitalMetricType.STEPS, value: s.steps, unit: 'steps', timestamp: new Date() })
        if (s.caloriesOut) vitalData.push({ metric: VitalMetricType.CALORIES_BURNED, value: s.caloriesOut, unit: 'kcal', timestamp: new Date() })
      }

      if (heart.status === 'fulfilled' && heart.value['activities-heart']?.[0]?.value?.restingHeartRate) {
        vitalData.push({
          metric: VitalMetricType.HEART_RATE,
          value: heart.value['activities-heart'][0].value.restingHeartRate,
          unit: 'bpm',
          timestamp: new Date(),
        })
      }

      if (sleep.status === 'fulfilled' && sleep.value.summary?.totalMinutesAsleep) {
        vitalData.push({
          metric: VitalMetricType.SLEEP_HOURS,
          value: Math.round((sleep.value.summary.totalMinutesAsleep / 60) * 10) / 10,
          unit: 'hours',
          timestamp: new Date(),
        })
      }

      if (spo2.status === 'fulfilled' && spo2.value) {
        const avg = spo2.value.avg ?? spo2.value.summary?.average
        if (avg) vitalData.push({ metric: VitalMetricType.SPO2, value: avg, unit: '%', timestamp: new Date() })
      }

      for (const v of vitalData) {
        await prisma.vitalRecord.create({
          data: {
            userId: supabaseUser.id,
            metric: v.metric,
            value: v.value,
            unit: v.unit,
            source: 'FITBIT',
            timestamp: v.timestamp,
          },
        })
        recordsCreated++
      }

      await prisma.wearableDevice.update({
        where: { id: device.id },
        data: { lastSyncAt: new Date() },
      })

      results.push({ deviceId: device.id, records: recordsCreated })
    } catch (err) {
      results.push({ deviceId: device.id, records: 0, error: String(err) })
    }
  }

  return NextResponse.json({ data: results })
}
