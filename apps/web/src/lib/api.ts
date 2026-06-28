export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface NotificationPreference {
  email: boolean
  push: boolean
  sms: boolean
  types: string[]
  insights: boolean
  anomalies: boolean
  summaries: boolean
}

export interface UserSettings {
  theme: string
  measurementSystem: string
  aiProvider: string
  wearableAutoSync: boolean
  dataCollectionEnabled: boolean
  insightFrequency: string
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(endpoint, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error ?? 'API Error')
  return json.data
}

export const api = {
  auth: {
    signup: (data: { email: string; password: string; name: string }) =>
      fetchApi<{ user: { id: string; email: string } }>('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    signin: (data: { email: string; password: string }) =>
      fetchApi<{ user: unknown; session: unknown }>('/api/auth/signin', { method: 'POST', body: JSON.stringify(data) }),
    refresh: () =>
      fetchApi<{ session: unknown; user: unknown }>('/api/auth/refresh', { method: 'POST' }),
    getUser: () =>
      fetchApi<Record<string, unknown>>('/api/auth/user'),
  },
  users: {
    getMe: () =>
      fetchApi<Record<string, unknown>>('/api/users/me'),
    updateMe: (data: Record<string, unknown>) =>
      fetchApi<Record<string, unknown>>('/api/users/me', { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchApi<{ deleted: boolean }>(`/api/users/${id}`, { method: 'DELETE' }),
  },
  vitals: {
    create: (data: { metric: string; value: number; unit: string; timestamp?: string; source?: string }) =>
      fetchApi<Record<string, unknown>>('/api/vitals', { method: 'POST', body: JSON.stringify(data) }),
    getLatestAll: () =>
      fetchApi<Record<string, unknown>>('/api/vitals/latest/all'),
    getLatest: (metric: string) =>
      fetchApi<Record<string, unknown>>(`/api/vitals/latest/${metric}`),
    getHistory: (metric: string, params?: { from?: string; to?: string; limit?: number }) => {
      const qs = new URLSearchParams()
      if (params?.from) qs.set('from', params.from)
      if (params?.to) qs.set('to', params.to)
      if (params?.limit) qs.set('limit', String(params.limit))
      const query = qs.toString()
      return fetchApi<Record<string, unknown>[]>(`/api/vitals/history/${metric}${query ? `?${query}` : ''}`)
    },
    getBaselines: () =>
      fetchApi<Record<string, unknown>[]>('/api/vitals/baselines'),
    computeBaseline: (metric: string) =>
      fetchApi<Record<string, unknown>>('/api/vitals/baseline', { method: 'POST', body: JSON.stringify({ metric }) }),
  },
  devices: {
    list: () =>
      fetchApi<Record<string, unknown>[]>('/api/devices'),
    connect: (data: { deviceType: string; deviceName: string; externalId: string }) =>
      fetchApi<Record<string, unknown>>('/api/devices', { method: 'POST', body: JSON.stringify(data) }),
    disconnect: (id: string) =>
      fetchApi<{ deleted: boolean }>(`/api/devices/${id}`, { method: 'DELETE' }),
    recordSensor: (data: { sensorType: string; value: number; unit: string; timestamp?: string; metadata?: Record<string, unknown> }) =>
      fetchApi<Record<string, unknown>>('/api/devices/sensors', { method: 'POST', body: JSON.stringify(data) }),
  },
  safety: {
    triggerSos: (data?: { type?: string; location?: string }) =>
      fetchApi<{ alert: Record<string, unknown>; notifiedContacts: number }>('/api/safety/sos', { method: 'POST', body: JSON.stringify(data ?? {}) }),
    getContacts: () =>
      fetchApi<Record<string, unknown>[]>('/api/safety/contacts'),
    addContact: (data: { name: string; phone: string; relationship: string; isNotified?: boolean }) =>
      fetchApi<Record<string, unknown>>('/api/safety/contacts', { method: 'POST', body: JSON.stringify(data) }),
    updateContact: (id: string, data: Record<string, unknown>) =>
      fetchApi<Record<string, unknown>>(`/api/safety/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteContact: (id: string) =>
      fetchApi<{ deleted: boolean }>(`/api/safety/contacts/${id}`, { method: 'DELETE' }),
    getAlerts: (params?: { status?: string; limit?: number }) => {
      const qs = new URLSearchParams()
      if (params?.status) qs.set('status', params.status)
      if (params?.limit) qs.set('limit', String(params.limit))
      const query = qs.toString()
      return fetchApi<Record<string, unknown>[]>(`/api/safety/alerts${query ? `?${query}` : ''}`)
    },
  },
  notifications: {
    list: (params?: { unreadOnly?: boolean; limit?: number }) => {
      const qs = new URLSearchParams()
      if (params?.unreadOnly) qs.set('unreadOnly', 'true')
      if (params?.limit) qs.set('limit', String(params.limit))
      const query = qs.toString()
      return fetchApi<{ notifications: Notification[]; unreadCount: number }>(`/api/notifications${query ? `?${query}` : ''}`)
    },
    markRead: (id: string) =>
      fetchApi<Notification>(`/api/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () =>
      fetchApi<{ updatedCount: number }>('/api/notifications/read-all', { method: 'PUT' }),
    getPreferences: () =>
      fetchApi<NotificationPreference>('/api/notifications/preferences'),
    updatePreferences: (data: Partial<NotificationPreference>) =>
      fetchApi<NotificationPreference>('/api/notifications/preferences', { method: 'PUT', body: JSON.stringify(data) }),
  },
  insights: {
    list: (params?: { type?: string; limit?: number }) => {
      const qs = new URLSearchParams()
      if (params?.type) qs.set('type', params.type)
      if (params?.limit) qs.set('limit', String(params.limit))
      const query = qs.toString()
      return fetchApi<Record<string, unknown>[]>(`/api/insights${query ? `?${query}` : ''}`)
    },
    get: (id: string) =>
      fetchApi<Record<string, unknown>>(`/api/insights/${id}`),
    getDailySummary: () =>
      fetchApi<Record<string, unknown> | null>('/api/insights/daily-summary'),
    dismiss: (id: string) =>
      fetchApi<Record<string, unknown>>(`/api/insights/${id}/dismiss`, { method: 'PUT' }),
  },
  settings: {
    get: () =>
      fetchApi<UserSettings>('/api/settings'),
    update: (data: Partial<UserSettings>) =>
      fetchApi<UserSettings>('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },
  anomalies: {
    list: (params?: { severity?: string; metric?: string; limit?: number }) => {
      const qs = new URLSearchParams()
      if (params?.severity) qs.set('severity', params.severity)
      if (params?.metric) qs.set('metric', params.metric)
      if (params?.limit) qs.set('limit', String(params.limit))
      const query = qs.toString()
      return fetchApi<Record<string, unknown>[]>(`/api/anomalies${query ? `?${query}` : ''}`)
    },
  },
  analytics: {
    get: (params?: { metric?: string; period?: string }) => {
      const qs = new URLSearchParams()
      if (params?.metric) qs.set('metric', params.metric)
      if (params?.period) qs.set('period', params.period)
      const query = qs.toString()
      return fetchApi<Record<string, unknown>[]>(`/api/analytics${query ? `?${query}` : ''}`)
    },
  },
  agent: {
    chat: (data: { message: string; conversationId?: string }) =>
      fetchApi<{ message: string; conversationId: string }>('/api/agent/chat', { method: 'POST', body: JSON.stringify(data) }),
    generateInsight: (period?: 'daily' | 'weekly' | 'monthly') =>
      fetchApi<Record<string, unknown>>('/api/agent/insights', { method: 'POST', body: JSON.stringify({ period }) }),
    analyzeAnomaly: (anomalyId: string) =>
      fetchApi<Record<string, unknown>>('/api/agent/analyze-anomaly', { method: 'POST', body: JSON.stringify({ anomalyId }) }),
    computeBaseline: (metric: string) =>
      fetchApi<Record<string, unknown>>('/api/agent/compute-baseline', { method: 'POST', body: JSON.stringify({ metric }) }),
    ingestVital: (records: { metric: string; value: number; unit: string; timestamp?: string; source?: string }[]) =>
      fetchApi<{ ingested: number; anomalies: number; warnings?: string[] }>('/api/agent/ingest-vital', { method: 'POST', body: JSON.stringify({ records }) }),
  },
}
