'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, Activity, Droplets, Thermometer, Weight, TrendingUp, Moon, Wind, Apple, Gauge, Clock } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import VitalChart from '@/components/VitalChart'
import { api } from '@/lib/api'

const PERIODS = ['24h', '7d', '30d', '3m'] as const
type Period = typeof PERIODS[number]

const VITAL_CONFIG: Record<string, { label: string; icon: any; unit: string }> = {
  heart_rate: { label: 'Heart Rate', icon: Heart, unit: 'bpm' },
  spo2: { label: 'SpO2', icon: Activity, unit: '%' },
  blood_pressure_systolic: { label: 'Systolic', icon: Droplets, unit: 'mmHg' },
  blood_pressure_diastolic: { label: 'Diastolic', icon: Droplets, unit: 'mmHg' },
  temperature: { label: 'Temperature', icon: Thermometer, unit: '°C' },
  weight: { label: 'Weight', icon: Weight, unit: 'kg' },
  hrv: { label: 'HRV', icon: TrendingUp, unit: 'ms' },
  respiratory_rate: { label: 'Resp Rate', icon: Wind, unit: 'br/min' },
  blood_glucose: { label: 'Glucose', icon: Apple, unit: 'mmol/L' },
  steps: { label: 'Steps', icon: TrendingUp, unit: 'steps' },
  calories_burned: { label: 'Calories', icon: TrendingUp, unit: 'kcal' },
  sleep_hours: { label: 'Sleep', icon: Moon, unit: 'hours' },
  stress_level: { label: 'Stress', icon: Gauge, unit: '%' },
}

function getDateRange(period: Period): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  if (period === '24h') from.setHours(from.getHours() - 24)
  else if (period === '7d') from.setDate(from.getDate() - 7)
  else if (period === '30d') from.setDate(from.getDate() - 30)
  else if (period === '3m') from.setMonth(from.getMonth() - 3)
  return { from: from.toISOString(), to: to.toISOString() }
}

interface VitalCard {
  key: string
  label: string
  icon: any
  value: string
  unit: string
}

export default function VitalsPage() {
  const [latest, setLatest] = useState<Record<string, any>>({})
  const [selectedMetric, setSelectedMetric] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('24h')
  const [chartData, setChartData] = useState<any[]>([])
  const [baseline, setBaseline] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)

  useEffect(() => {
    async function loadLatest() {
      try {
        const data = await api.vitals.getLatestAll()
        setLatest(data)
        const keys = Object.keys(data).filter(k => data[k] && typeof data[k] === 'object' && 'value' in data[k])
        if (keys.length > 0 && !selectedMetric) {
          setSelectedMetric(keys[0])
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    loadLatest()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedMetric) return
    async function loadHistory() {
      setChartLoading(true)
      try {
        const range = getDateRange(selectedPeriod)
        const data = await api.vitals.getHistory(selectedMetric, range)
        setChartData(data.map((d: any) => ({
          time: new Date(d.timestamp).toLocaleString(),
          value: d.value,
        })).reverse())

        const baselines = await api.vitals.getBaselines()
        const bl = baselines.find((b: any) => b.metric === selectedMetric.toUpperCase())
        setBaseline(Number(bl?.mean) || undefined)
      } catch { setChartData([]) }
      setChartLoading(false)
    }
    loadHistory()
  }, [selectedMetric, selectedPeriod])

  const vitalCards: VitalCard[] = Object.entries(latest)
    .filter(([, v]) => v && typeof v === 'object' && 'value' in v)
    .map(([key, v]) => {
      const cfg = VITAL_CONFIG[key] ?? { label: key, icon: Activity, unit: v.unit ?? '' }
      if (key === 'blood_pressure_systolic' && latest.blood_pressure_diastolic) {
        return {
          key: 'blood_pressure',
          label: 'Blood Pressure',
          icon: Droplets,
          value: `${v.value}/${latest.blood_pressure_diastolic.value}`,
          unit: 'mmHg',
        }
      }
      if (key === 'blood_pressure_diastolic') return null
      return { key, label: cfg.label, icon: cfg.icon, value: String(v.value), unit: cfg.unit }
    })
    .filter(Boolean) as VitalCard[]

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <h1 className="mb-6 text-2xl font-bold text-dark-slate">Vitals</h1>

      {/* Period Selector */}
      <div className="mb-6 flex gap-2">
        {PERIODS.map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              selectedPeriod === period
                ? 'bg-primary text-white'
                : 'bg-white text-muted-gray shadow-sm hover:text-dark-slate'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Current Vitals Grid */}
      {loading ? (
        <div className="mb-6 flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : vitalCards.length > 0 ? (
        <div className="mb-6 grid grid-cols-2 gap-3">
          {vitalCards.map((vital) => (
            <button
              key={vital.key}
              onClick={() => {
                if (vital.key === 'blood_pressure') {
                  setSelectedMetric('blood_pressure_systolic')
                } else {
                  setSelectedMetric(vital.key)
                }
              }}
              className={`flex items-center gap-3 rounded-xl p-4 text-left shadow-sm transition hover:shadow-md ${
                selectedMetric === vital.key || (vital.key === 'blood_pressure' && (selectedMetric === 'blood_pressure_systolic' || selectedMetric === 'blood_pressure_diastolic'))
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'bg-white'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <vital.icon size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-gray">{vital.label}</p>
                <p className="text-lg font-bold text-dark-slate">{vital.value}</p>
                <p className="text-[10px] text-muted-gray">{vital.unit}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="mb-6 rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-muted-gray">No vitals recorded yet.</p>
        </div>
      )}

      {/* Chart */}
      {chartLoading ? (
        <div className="flex h-48 items-center justify-center rounded-lg bg-white shadow-sm">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <VitalChart
          data={chartData}
          baseline={baseline}
          label={VITAL_CONFIG[selectedMetric]?.label ?? selectedMetric}
          unit={VITAL_CONFIG[selectedMetric]?.unit ?? ''}
        />
      )}

      {/* View Timeline */}
      <Link
        href="/timeline"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-medium text-primary shadow-sm transition hover:shadow-md"
      >
        <Clock size={16} />
        View Health Timeline
      </Link>

      <BottomNav />
    </div>
  )
}
