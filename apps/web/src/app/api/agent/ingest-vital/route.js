"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
const database_1 = require("@hamraz/database");
const ai_1 = require("@hamraz/ai");
async function POST(request) {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    try {
        const body = await request.json();
        const { records } = body;
        if (!records || !Array.isArray(records) || records.length === 0) {
            return server_1.NextResponse.json({ error: 'records array is required' }, { status: 400 });
        }
        const aiRecords = records.map((r) => ({
            userId: supabaseUser.id,
            metric: r.metric,
            value: Number(r.value),
            unit: r.unit,
            timestamp: r.timestamp ?? new Date().toISOString(),
            source: r.source,
        }));
        const { fallback } = (0, ai_1.createProviderSuite)();
        const baselineService = new ai_1.BaselineService();
        const anomalyService = new ai_1.AnomalyService(fallback);
        const ingestService = new ai_1.IngestService(baselineService, anomalyService);
        const result = await ingestService.process(aiRecords);
        if (!result.success || !result.data) {
            return server_1.NextResponse.json({ error: result.error ?? 'Ingestion failed' }, { status: 400 });
        }
        for (const record of result.data.records) {
            await database_1.prisma.vitalRecord.create({
                data: {
                    userId: supabaseUser.id,
                    metric: record.metric.toUpperCase(),
                    value: record.value,
                    unit: record.unit,
                    timestamp: new Date(record.timestamp),
                    source: record.source ? record.source : undefined,
                },
            });
        }
        for (const [, baseline] of result.data.baselines) {
            await database_1.prisma.vitalBaseline.upsert({
                where: { userId_metric: { userId: supabaseUser.id, metric: baseline.metric.toUpperCase() } },
                update: {
                    minValue: baseline.min,
                    maxValue: baseline.max,
                    mean: baseline.mean,
                    stdDev: baseline.stdDev,
                    sampleCount: baseline.sampleSize,
                },
                create: {
                    userId: supabaseUser.id,
                    metric: baseline.metric.toUpperCase(),
                    minValue: baseline.min,
                    maxValue: baseline.max,
                    mean: baseline.mean,
                    stdDev: baseline.stdDev,
                    sampleCount: baseline.sampleSize,
                    unit: '',
                },
            });
        }
        for (const anomaly of result.data.anomalies) {
            await database_1.prisma.anomalyDetection.create({
                data: {
                    userId: supabaseUser.id,
                    metric: anomaly.metric.toUpperCase(),
                    value: anomaly.value,
                    zScore: anomaly.zScore,
                    severity: anomaly.severity.toUpperCase(),
                },
            });
        }
        return server_1.NextResponse.json({
            data: {
                ingested: result.data.records.length,
                anomalies: result.data.anomalies.length,
                warnings: result.data.warnings,
            },
        }, { status: 201 });
    }
    catch (error) {
        console.error('POST /api/agent/ingest-vital error:', error);
        return server_1.NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
    }
}
//# sourceMappingURL=route.js.map