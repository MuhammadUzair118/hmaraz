export declare const api: {
    auth: {
        signup: (data: {
            email: string;
            password: string;
            name: string;
        }) => Promise<{
            user: {
                id: string;
                email: string;
            };
        }>;
        signin: (data: {
            email: string;
            password: string;
        }) => Promise<{
            user: unknown;
            session: unknown;
        }>;
        refresh: () => Promise<{
            session: unknown;
            user: unknown;
        }>;
        getUser: () => Promise<Record<string, unknown>>;
    };
    users: {
        getMe: () => Promise<Record<string, unknown>>;
        updateMe: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
        delete: (id: string) => Promise<{
            deleted: boolean;
        }>;
    };
    vitals: {
        create: (data: {
            metric: string;
            value: number;
            unit: string;
            timestamp?: string;
            source?: string;
        }) => Promise<Record<string, unknown>>;
        getLatestAll: () => Promise<Record<string, unknown>>;
        getLatest: (metric: string) => Promise<Record<string, unknown>>;
        getHistory: (metric: string, params?: {
            from?: string;
            to?: string;
            limit?: number;
        }) => Promise<Record<string, unknown>[]>;
        getBaselines: () => Promise<Record<string, unknown>[]>;
        computeBaseline: (metric: string) => Promise<Record<string, unknown>>;
    };
    devices: {
        list: () => Promise<Record<string, unknown>[]>;
        connect: (data: {
            deviceType: string;
            deviceName: string;
            externalId: string;
        }) => Promise<Record<string, unknown>>;
        disconnect: (id: string) => Promise<{
            deleted: boolean;
        }>;
        recordSensor: (data: {
            sensorType: string;
            value: number;
            unit: string;
            timestamp?: string;
            metadata?: Record<string, unknown>;
        }) => Promise<Record<string, unknown>>;
    };
    safety: {
        triggerSos: (data?: {
            type?: string;
            location?: string;
        }) => Promise<{
            alert: Record<string, unknown>;
            notifiedContacts: number;
        }>;
        getContacts: () => Promise<Record<string, unknown>[]>;
        addContact: (data: {
            name: string;
            phone: string;
            relationship: string;
            isNotified?: boolean;
        }) => Promise<Record<string, unknown>>;
        updateContact: (id: string, data: Record<string, unknown>) => Promise<Record<string, unknown>>;
        deleteContact: (id: string) => Promise<{
            deleted: boolean;
        }>;
        getAlerts: (params?: {
            status?: string;
            limit?: number;
        }) => Promise<Record<string, unknown>[]>;
    };
    notifications: {
        list: (params?: {
            unreadOnly?: boolean;
            limit?: number;
        }) => Promise<{
            notifications: Record<string, unknown>[];
            unreadCount: number;
        }>;
        markRead: (id: string) => Promise<Record<string, unknown>>;
        markAllRead: () => Promise<{
            updatedCount: number;
        }>;
        getPreferences: () => Promise<Record<string, unknown>>;
        updatePreferences: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
    };
    insights: {
        list: (params?: {
            type?: string;
            limit?: number;
        }) => Promise<Record<string, unknown>[]>;
        get: (id: string) => Promise<Record<string, unknown>>;
        getDailySummary: () => Promise<Record<string, unknown> | null>;
        dismiss: (id: string) => Promise<Record<string, unknown>>;
    };
    settings: {
        get: () => Promise<Record<string, unknown>>;
        update: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
    };
    agent: {
        chat: (data: {
            message: string;
            conversationId?: string;
        }) => Promise<{
            message: string;
            conversationId: string;
        }>;
        generateInsight: (period?: "daily" | "weekly" | "monthly") => Promise<Record<string, unknown>>;
        analyzeAnomaly: (anomalyId: string) => Promise<Record<string, unknown>>;
        computeBaseline: (metric: string) => Promise<Record<string, unknown>>;
        ingestVital: (records: {
            metric: string;
            value: number;
            unit: string;
            timestamp?: string;
            source?: string;
        }[]) => Promise<{
            ingested: number;
            anomalies: number;
            warnings?: string[];
        }>;
    };
};
//# sourceMappingURL=api.d.ts.map