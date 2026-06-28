import { NextResponse } from 'next/server'

export function verifyCronSecret(request: Request): NextResponse | null {
  const authHeader = request.headers.get('x-cron-secret')
  const expected = process.env.CRON_SECRET

  if (!expected) {
    return NextResponse.json(
      { data: null, error: 'CRON_SECRET not configured on server' },
      { status: 500 }
    )
  }

  if (authHeader !== expected) {
    return NextResponse.json(
      { data: null, error: 'Invalid or missing cron secret' },
      { status: 401 }
    )
  }

  return null
}
