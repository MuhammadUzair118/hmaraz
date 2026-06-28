'use client'

import { useState, useEffect } from 'react'
import { Heart, Activity, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import VitalChart from '@/components/VitalChart'
import { api } from '@/lib/api'

const PERIODS = ['7d', '30d'] as const
type Period = typeof PERIODS[number]

const METRICS = [
  { key: 'heart_rate', label: 'Heart Rate', unit: 'bpm', icon: Heart },
  { key: 'spo2', label: 'SpO2', unit: '%', icon: Activity },
  { key: 'hrv', label: 'HRV', unit: 'ms', icon: Activity },
  { key: 'steps', label: 'Steps', unit: 'steps', icon: TrendingUp },
  { key: 'sleep_hours', label: 'Sleep', unit: 'hours', icon: Activity },
]

function getDateRange(period: Period): { current: { from: string; to: string }; previous: { from: string; to: string } } {
  const now = new Date()
  if (period === '7d') {
    const currentStart = new Date(now); currentStart.setDate(currentStart.getDate() - 7)
    const prevStart = new Date(currentStart); prevStart.setDate(prevStart.getDate() - 7)
    return {
      current: { from: currentStart.toISOString(), to: now.toISOString() },
      previous: { from: prevStart.toISOString(), to: currentStart.toISOString() },
    }
  }
  const currentStart = new Date(now); currentStart.setDate(currentStart.getDate() - 30)
  const prevStart = new Date(currentStart); prevStart.setDate(prevStart.getDate() - 30)
  return {
    current: { from: currentStart.toISOString(), to: now.toISOString() },
    previous: { from: prevStart.toISOString(), to: currentStart.toISOString() },
  }
}

function computeStats(data: any[]) {
  if (data.length === 0) return { avg: 0, min: 0, max: 0 }
  const values = data.map(d => d.value)
  return {
    avg: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
    min: Math.round(Math.min(...values) * 10) / 10,
    max: Math.round(Math.max(...values) * 10) / 10,
  }
}

export default function TrendsPage() {
  const [selectedMetric, setSelectedMetric] = useState('heart_rate')
  const [period, setPeriod] = useState<Period>('7d')
  const [currentData, setCurrentData] = useState<any[]>([])
  const [previousData, setPreviousData] = useState<any[]>([])
  const [baseline, setBaseline] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const range = getDateRange(period)
        const [current, previous, baselines] = await Promise.all([
          api.vitals.getHistory(selectedMetric, { from: range.current.from, to: range.current.to }),
          api.vitals.getHistory(selectedMetric, { from: range.previous.from, to: range.previous.to }),
          api.vitals.getBaselines(),
        ])
        setCurrentData(current.map((d: any) => ({ time: new Date(d.timestamp).toLocaleDateString(), value: d.value })).reverse())
        setPreviousData(previous.map((d: any) => ({ time: new Date(d.timestamp).toLocaleDateString(), value: d.value })).reverse())
        const bl = baselines.find((b: any) => b.metric === selectedMetric.toUpperCase())
        setBaseline(Number(bl?.mean) || undefined)
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
  }, [selectedMetric, period])

  const currentStats = computeStats(currentData)
  const previousStats = computeStats(previousData)
  const trend = currentStats.avg - previousStats.avg
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend > 0 ? 'text-success' : trend < 0 ? 'text-danger' : 'text-muted-gray'

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <h1 className="mb-6 text-2xl font-bold text-dark-slate">Trends</h1>

      {/* Metric selector */}
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setSelectedMetric(m.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              selectedMetric === m.key
                ? 'bg-primary text-white'
                : 'bg-white text-muted-gray shadow-sm hover:text-dark-slate'
            }`}
          >
            <m.icon size={14} />
            {m.label}
          </button>
        ))}
      </div>

      {/* Period toggle */}
      <div className="mb-4 flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              period === p
                ? 'bg-primary text-white'
                : 'bg-white text-muted-gray shadow-sm hover:text-dark-slate'
            }`}
          >
            Last {p}
          </button>
        ))}
      </div>

      {/* Stats summary */}
      {!loading && currentData.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-[10px] text-muted-gray">Average</p>
            <p className="text-lg font-bold text-dark-slate">{currentStats.avg}</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-[10px] text-muted-gray">Range</p>
            <p className="text-lg font-bold text-dark-slate">{currentStats.min}-{currentStats.max}</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-[10px] text-muted-gray">vs Prev</p>
            <div className={`flex items-center justify-center gap-0.5 text-lg font-bold ${trendColor}`}>
              <TrendIcon size={16} />
              {Math.abs(trend).toFixed(1)}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-muted-gray" />
        </div>
      ) : (
        <div className="space-y-4">
          <VitalChart
            data={currentData}
            baseline={baseline}
            label={`Current ${period}`}
            unit={METRICS.find(m => m.key === selectedMetric)?.unit ?? ''}
          />
          {previousData.length > 0 && (
            <VitalChart
              data={previousData}
              baseline={baseline}
              label={`Previous ${period}`}
              unit={METRICS.find(m => m.key === selectedMetric)?.unit ?? ''}
            />
          )}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
