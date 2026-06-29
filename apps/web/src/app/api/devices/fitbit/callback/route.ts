import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'

const TOKEN_URL = 'https://api.fitbit.com/oauth2/token'

async function exchangeCode(code: string, redirectUri: string) {
  const clientId = process.env['FITBIT_CLIENT_ID']!
  const clientSecret = process.env['FITBIT_CLIENT_SECRET']!

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
  })

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Token exchange failed: ${errText}`)
  }

  return res.json()
}

export async function GET(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/devices?fitbit=error', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/devices?fitbit=no_code', request.url))
  }

  try {
    const redirectUri = `${process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'}/api/devices/fitbit/callback`
    const tokenData = await exchangeCode(code, redirectUri)

    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token
    const expiresIn = tokenData.expires_in ?? 28800

    const userRes = await fetch('https://api.fitbit.com/1/user/-/profile.json', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    let externalId = ''
    let displayName = 'Fitbit'

    if (userRes.ok) {
      const profile = await userRes.json()
      externalId = profile.user?.encodedId ?? ''
      displayName = profile.user?.displayName ?? 'Fitbit'
    }

    await prisma.wearableDevice.upsert({
      where: {
        userId_externalId: {
          userId: supabaseUser.id,
          externalId: externalId || `fitbit_${supabaseUser.id}`,
        },
      },
      update: {
        authToken: accessToken,
        refreshToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
        isConnected: true,
        lastSyncAt: new Date(),
      },
      create: {
        userId: supabaseUser.id,
        deviceType: 'FITBIT',
        deviceName: displayName,
        externalId: externalId || `fitbit_${supabaseUser.id}`,
        authToken: accessToken,
        refreshToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    })

    return NextResponse.redirect(new URL('/devices?fitbit=connected', request.url))
  } catch (err) {
    console.error('Fitbit callback error:', err)
    return NextResponse.redirect(new URL('/devices?fitbit=error', request.url))
  }
}
