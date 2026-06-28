"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
async function fetchApi(endpoint, options) {
    const res = await fetch(endpoint, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
    });
    const json = await res.json();
    if (!res.ok)
        throw new Error(json?.error ?? 'API Error');
    return json.data;
}
exports.api = {
    auth: {
        signup: (data) => fetchApi('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
        signin: (data) => fetchApi('/api/auth/signin', { method: 'POST', body: JSON.stringify(data) }),
        refresh: () => fetchApi('/api/auth/refresh', { method: 'POST' }),
        getUser: () => fetchApi('/api/auth/user'),
    },
    users: {
        getMe: () => fetchApi('/api/users/me'),
        updateMe: (data) => fetchApi('/api/users/me', { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => fetchApi(`/api/users/${id}`, { method: 'DELETE' }),
    },
    vitals: {
        create: (data) => fetchApi('/api/vitals', { method: 'POST', body: JSON.stringify(data) }),
        getLatestAll: () => fetchApi('/api/vitals/latest/all'),
        getLatest: (metric) => fetchApi(`/api/vitals/latest/${metric}`),
        getHistory: (metric, params) => {
            const qs = new URLSearchParams();
            if (params?.from)
                qs.set('from', params.from);
            if (params?.to)
                qs.set('to', params.to);
            if (params?.limit)
                qs.set('limit', String(params.limit));
            const query = qs.toString();
            return fetchApi(`/api/vitals/history/${metric}${query ? `?${query}` : ''}`);
        },
        getBaselines: () => fetchApi('/api/vitals/baselines'),
        computeBaseline: (metric) => fetchApi('/api/vitals/baseline', { method: 'POST', body: JSON.stringify({ metric }) }),
    },
    devices: {
        list: () => fetchApi('/api/devices'),
        connect: (data) => fetchApi('/api/devices', { method: 'POST', body: JSON.stringify(data) }),
        disconnect: (id) => fetchApi(`/api/devices/${id}`, { method: 'DELETE' }),
        recordSensor: (data) => fetchApi('/api/devices/sensors', { method: 'POST', body: JSON.stringify(data) }),
    },
    safety: {
        triggerSos: (data) => fetchApi('/api/safety/sos', { method: 'POST', body: JSON.stringify(data ?? {}) }),
        getContacts: () => fetchApi('/api/safety/contacts'),
        addContact: (data) => fetchApi('/api/safety/contacts', { method: 'POST', body: JSON.stringify(data) }),
        updateContact: (id, data) => fetchApi(`/api/safety/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteContact: (id) => fetchApi(`/api/safety/contacts/${id}`, { method: 'DELETE' }),
        getAlerts: (params) => {
            const qs = new URLSearchParams();
            if (params?.status)
                qs.set('status', params.status);
            if (params?.limit)
                qs.set('limit', String(params.limit));
            const query = qs.toString();
            return fetchApi(`/api/safety/alerts${query ? `?${query}` : ''}`);
        },
    },
    notifications: {
        list: (params) => {
            const qs = new URLSearchParams();
            if (params?.unreadOnly)
                qs.set('unreadOnly', 'true');
            if (params?.limit)
                qs.set('limit', String(params.limit));
            const query = qs.toString();
            return fetchApi(`/api/notifications${query ? `?${query}` : ''}`);
        },
        markRead: (id) => fetchApi(`/api/notifications/${id}/read`, { method: 'PUT' }),
        markAllRead: () => fetchApi('/api/notifications/read-all', { method: 'PUT' }),
        getPreferences: () => fetchApi('/api/notifications/preferences'),
        updatePreferences: (data) => fetchApi('/api/notifications/preferences', { method: 'PUT', body: JSON.stringify(data) }),
    },
    insights: {
        list: (params) => {
            const qs = new URLSearchParams();
            if (params?.type)
                qs.set('type', params.type);
            if (params?.limit)
                qs.set('limit', String(params.limit));
            const query = qs.toString();
            return fetchApi(`/api/insights${query ? `?${query}` : ''}`);
        },
        get: (id) => fetchApi(`/api/insights/${id}`),
        getDailySummary: () => fetchApi('/api/insights/daily-summary'),
        dismiss: (id) => fetchApi(`/api/insights/${id}/dismiss`, { method: 'PUT' }),
    },
    settings: {
        get: () => fetchApi('/api/settings'),
        update: (data) => fetchApi('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),
    },
    agent: {
        chat: (data) => fetchApi('/api/agent/chat', { method: 'POST', body: JSON.stringify(data) }),
        generateInsight: (period) => fetchApi('/api/agent/insights', { method: 'POST', body: JSON.stringify({ period }) }),
        analyzeAnomaly: (anomalyId) => fetchApi('/api/agent/analyze-anomaly', { method: 'POST', body: JSON.stringify({ anomalyId }) }),
        computeBaseline: (metric) => fetchApi('/api/agent/compute-baseline', { method: 'POST', body: JSON.stringify({ metric }) }),
        ingestVital: (records) => fetchApi('/api/agent/ingest-vital', { method: 'POST', body: JSON.stringify({ records }) }),
    },
};
//# sourceMappingURL=api.js.map