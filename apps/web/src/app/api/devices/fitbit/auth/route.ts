import { NextResponse } from 'next/server'

const FITBIT_AUTH_URL = 'https://www.fitbit.com/oauth2/authorize'
const SCOPES = [
  'heartrate',
  'activity',
  'sleep',
  'oxygen_saturation',
  'temperature',
  'weight',
  'profile',
  'settings',
]

export async function GET() {
  const clientId = process.env['FITBIT_CLIENT_ID']
  if (!clientId) {
    return NextResponse.json({ error: 'Fitbit integration not configured' }, { status: 501 })
  }

  const redirectUri = `${process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'}/api/devices/fitbit/callback`

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPES.join(' '),
    expires_in: '31536000',
  })

  return NextResponse.redirect(`${FITBIT_AUTH_URL}?${params.toString()}`)
}
