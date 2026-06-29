'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, TriangleAlert, Activity, Footprints, ShieldAlert } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import VitalRing from '@/components/VitalRing'
import { createClient } from '@/lib/supabase'
import { api } from '@/lib/api'
import { usePhoneSensors } from '@/hooks/usePhoneSensors'

const VITAL_DISPLAY: Record<string, { label: string; unit: string }> = {
  heart_rate: { label: 'Heart Rate', unit: 'bpm' },
  spo2: { label: 'SpO2', unit: '%' },
  steps: { label: 'Steps', unit: 'steps' },
  blood_pressure_systolic: { label: 'Systolic', unit: 'mmHg' },
  blood_pressure_diastolic: { label: 'Diastolic', unit: 'mmHg' },
  temperature: { label: 'Temp', unit: '°C' },
  weight: { label: 'Weight', unit: 'kg' },
  hrv: { label: 'HRV', unit: 'ms' },
  blood_glucose: { label: 'Glucose', unit: 'mmol/L' },
  respiratory_rate: { label: 'Resp Rate', unit: 'breaths/min' },
  sleep_hours: { label: 'Sleep', unit: 'hours' },
  calories_burned: { label: 'Calories', unit: 'kcal' },
  stress_level: { label: 'Stress', unit: '%' },
}

export default function Dashboard() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [loading, setLoading] = useState(true)
  const [vitals, setVitals] = useState<Record<string, any>>({})
  const [insight, setInsight] = useState<string>('')
  const [alerts, setAlerts] = useState<any[]>([])
  const [userName, setUserName] = useState('')
  const { steps, permission, active, requestPermission } = usePhoneSensors()

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/signin')
        return
      }
      setChecking(false)

      try {
        const [vitalsData, insightsData, notificationsData, userData] = await Promise.allSettled([
          api.vitals.getLatestAll(),
          api.insights.list({ limit: 1 }),
          api.notifications.list({ unreadOnly: true, limit: 3 }),
          api.users.getMe(),
        ])

        if (vitalsData.status === 'fulfilled') setVitals(vitalsData.value)
        if (insightsData.status === 'fulfilled' && insightsData.value.length > 0) {
          setInsight(String(insightsData.value[0].summary ?? ''))
        }
        if (notificationsData.status === 'fulfilled') {
          setAlerts(notificationsData.value.notifications ?? [])
        }
        if (userData.status === 'fulfilled') {
          setUserName(String(userData.value.name ?? ''))
        }
      } catch { /* data failed to load — keep defaults */ }
      setLoading(false)
    }
    init()
  }, [router])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const displayVitals = Object.entries(vitals)
    .filter(([, v]) => v && typeof v === 'object' && 'value' in v)
    .slice(0, 3)

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      {userName && (
        <p className="mb-2 text-lg font-semibold text-dark-slate">
          Hello, {userName}
        </p>
      )}

      {/* AI Agent Greeting */}
      <div className="mb-6 rounded-xl bg-gradient-to-r from-primary to-sky-accent p-4 text-white">
        <div className="mb-1 flex items-center gap-2">
          <MessageCircle size={18} />
          <span className="text-sm font-semibold">Hamraz AI</span>
        </div>
        <p className="text-sm leading-relaxed opacity-90">
          {loading ? 'Loading your health insight...' : insight || 'No insight available yet. Check back after logging some vitals.'}
        </p>
      </div>

      {/* Phone Step Counter */}
      <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Footprints size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-gray">Steps Today</p>
              <p className="text-2xl font-bold text-dark-slate">{steps.toLocaleString()}</p>
            </div>
          </div>
          {!active && permission === 'prompt' && (
            <button
              onClick={requestPermission}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary/90"
            >
              <ShieldAlert size={14} />
              Enable
            </button>
          )}
          {!active && permission === 'denied' && (
            <p className="text-xs text-muted-gray">Motion permission denied</p>
          )}
          {active && (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Live</span>
          )}
        </div>
      </div>

      {/* Vitals Ring */}
      <h2 className="mb-3 text-lg font-semibold text-dark-slate">Your Vitals</h2>
      {loading ? (
        <div className="mb-6 flex h-24 items-center justify-center rounded-xl bg-white shadow-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : displayVitals.length > 0 ? (
        <div className="mb-6 flex justify-around rounded-xl bg-white p-4 shadow-sm">
          {displayVitals.map(([key, v]) => {
            const display = VITAL_DISPLAY[key] ?? { label: key, unit: v.unit ?? '' }
            return (
              <VitalRing
                key={key}
                label={display.label}
                value={v.value}
                unit={display.unit}
                status={v.status ?? 'normal'}
              />
            )
          })}
        </div>
      ) : (
        <div className="mb-6 rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-muted-gray">No vitals recorded yet. Connect a device or add manually.</p>
        </div>
      )}

      {/* Alerts (unread notifications) */}
      {!loading && alerts.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-dark-slate">Active Alerts</h3>
          {alerts.map((alert: any, i: number) => (
            <div key={i} className="mb-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <TriangleAlert size={16} className="mt-0.5 shrink-0 text-warning" />
              <div>
                <p className="text-sm text-dark-slate">{alert.title ?? alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <h3 className="mb-3 text-sm font-semibold text-dark-slate">Quick Actions</h3>
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link href="/chat" className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
          <MessageCircle size={24} className="text-sky-accent" />
          <span className="text-sm font-medium text-dark-slate">AI Chat</span>
        </Link>
        <Link href="/sos" className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
          <TriangleAlert size={24} className="text-danger" />
          <span className="text-sm font-medium text-danger">SOS</span>
        </Link>
        <Link href="/vitals" className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
          <Activity size={24} className="text-primary" />
          <span className="text-sm font-medium text-dark-slate">Vitals</span>
        </Link>
      </div>

      <BottomNav />
    </div>
  )
}
