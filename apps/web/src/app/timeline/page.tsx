'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Activity, TriangleAlert, MessageCircle, Bell, Loader2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { api } from '@/lib/api'

type EventType = 'vital' | 'anomaly' | 'insight' | 'notification'

interface TimelineEvent {
  id: string
  type: EventType
  title: string
  description: string
  timestamp: string
  icon: any
  color: string
}

const FILTERS: { label: string; value: EventType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Vitals', value: 'vital' },
  { label: 'Anomalies', value: 'anomaly' },
  { label: 'Insights', value: 'insight' },
]

const EVENT_CONFIG: Record<EventType, { icon: any; color: string }> = {
  vital: { icon: Activity, color: 'text-primary' },
  anomaly: { icon: TriangleAlert, color: 'text-danger' },
  insight: { icon: MessageCircle, color: 'text-sky-accent' },
  notification: { icon: Bell, color: 'text-warning' },
}

export default function TimelinePage() {
  const router = useRouter()
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<EventType | 'all'>('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 20

  useEffect(() => {
    loadEvents()
  }, []) // eslint-disable-line

  async function loadEvents(loadMore = false) {
    if (!loadMore) setLoading(true)
    try {
      const now = new Date()
      const from = new Date(now); from.setDate(from.getDate() - 7)

      const [vitals, anomalies, insights, notificationData] = await Promise.all([
        api.vitals.getHistory('heart_rate', { from: from.toISOString(), to: now.toISOString(), limit: 20 }),
        api.anomalies.list({ limit: 20 }),
        api.insights.list({ limit: 20 }),
        api.notifications.list({ limit: 20 }),
      ])
      const notifications = notificationData.notifications ?? []

      const mapped: TimelineEvent[] = [
        ...vitals.slice(0, 10).map((v: any) => ({
          id: `v-${v.id}`,
          type: 'vital' as EventType,
          title: 'Vital Reading',
          description: `${v.metric}: ${v.value} ${v.unit}`,
          timestamp: v.timestamp,
          ...EVENT_CONFIG.vital,
        })),
        ...anomalies.map((a: any) => ({
          id: `a-${a.id}`,
          type: 'anomaly' as EventType,
          title: `${a.severity} Anomaly`,
          description: a.explanation ?? `${a.metric} value ${a.value} (z-score: ${a.zScore})`,
          timestamp: a.detectedAt,
          ...EVENT_CONFIG.anomaly,
        })),
        ...insights.map((i: any) => ({
          id: `i-${i.id}`,
          type: 'insight' as EventType,
          title: i.title,
          description: i.summary,
          timestamp: i.createdAt,
          ...EVENT_CONFIG.insight,
        })),
        ...notifications.map((n: any) => ({
          id: `n-${n.id}`,
          type: 'notification' as EventType,
          title: n.title,
          description: n.message,
          timestamp: n.createdAt,
          ...EVENT_CONFIG.notification,
        })),
      ]

      mapped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      if (loadMore) {
        setEvents(prev => [...prev, ...mapped])
      } else {
        setEvents(mapped.slice(0, PAGE_SIZE))
        setHasMore(mapped.length > PAGE_SIZE)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  function loadMore() {
    setPage(prev => prev + 1)
    loadEvents(true)
  }

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter)

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-bg">
      {/* Header */}
      <div className="flex items-center gap-2 bg-white px-4 py-3">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted-gray">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-lg font-semibold text-dark-slate">Health Timeline</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto bg-white px-4 pb-3">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === f.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-muted-gray hover:text-dark-slate'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="px-4 pb-24 pt-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-muted-gray" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-gray">
            No events in the last 7 days
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200" />

            <div className="space-y-4">
              {filtered.map((event) => {
                const date = new Date(event.timestamp)
                const Icon = event.icon
                return (
                  <div key={event.id} className="relative flex gap-4 pl-10">
                    {/* Dot */}
                    <div className={`absolute left-2.5 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-white ring-2 ring-gray-200 ${event.color}`}>
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    {/* Card */}
                    <div className="flex-1 rounded-xl bg-white p-3 shadow-sm">
                      <div className="mb-1 flex items-center gap-2">
                        <Icon size={14} className={event.color} />
                        <span className={`text-xs font-semibold ${event.color}`}>{event.title}</span>
                        <span className="ml-auto text-[10px] text-muted-gray">
                          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-dark-slate">{event.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {hasMore && (
              <button
                onClick={loadMore}
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-medium text-primary shadow-sm"
              >
                Load More
              </button>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
