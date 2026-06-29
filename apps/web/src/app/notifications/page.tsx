'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, CheckCheck, Loader2, Circle, AlertTriangle, TrendingUp, FileText } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { api, type Notification } from '@/lib/api'

const NOTIF_ICONS: Record<string, any> = {
  DAILY_SUMMARY: FileText,
  WEEKLY_TREND: TrendingUp,
  ANOMALY_ALERT: AlertTriangle,
}

const NOTIF_COLORS: Record<string, string> = {
  DAILY_SUMMARY: 'text-sky-accent',
  WEEKLY_TREND: 'text-primary',
  ANOMALY_ALERT: 'text-danger',
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    loadNotifications()
  }, [filter])

  async function loadNotifications() {
    setLoading(true)
    try {
      const result = await api.notifications.list({ unreadOnly: filter === 'unread' })
      setNotifications(result.notifications as Notification[])
      setUnreadCount(result.unreadCount)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await api.notifications.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch { /* silent */ }
  }

  async function handleMarkAllRead() {
    try {
      await api.notifications.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch { /* silent */ }
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const visible = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-bg px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted-gray">
          <ArrowLeft size={16} /> Back
        </button>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-sm text-primary">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      <h1 className="mb-4 text-xl font-bold text-dark-slate">Notifications</h1>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-4 py-1.5 text-sm ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-muted-gray'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`rounded-full px-4 py-1.5 text-sm ${filter === 'unread' ? 'bg-primary text-white' : 'bg-gray-100 text-muted-gray'}`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      <div className="flex-1 pb-24">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-muted-gray" />
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Bell size={48} className="mb-4 text-muted-gray" />
            <p className="text-sm text-muted-gray">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map(n => {
              const Icon = NOTIF_ICONS[n.type] ?? Bell
              const color = NOTIF_COLORS[n.type] ?? 'text-muted-gray'
              return (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                    n.isRead ? 'border-gray-100 bg-white' : 'border-primary/10 bg-primary/5'
                  }`}
                >
                  <div className={`mt-0.5 ${color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-dark-slate">{n.title}</p>
                      {!n.isRead && <Circle size={8} className="fill-primary text-primary shrink-0" />}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-gray line-clamp-2">{n.message}</p>
                    <p className="mt-1 text-[10px] text-muted-gray">{formatTime(n.createdAt)}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
