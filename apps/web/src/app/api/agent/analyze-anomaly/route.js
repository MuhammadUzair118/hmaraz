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
        const { anomalyId } = body;
        if (!anomalyId) {
            return server_1.NextResponse.json({ error: 'anomalyId is required' }, { status: 400 });
        }
        const anomaly = await database_1.prisma.anomalyDetection.findUnique({ where: { id: anomalyId } });
        if (!anomaly || anomaly.userId !== supabaseUser.id) {
            return server_1.NextResponse.json({ error: 'Anomaly not found' }, { status: 404 });
        }
        const recentVitals = await database_1.prisma.vitalRecord.findMany({
            where: { userId: supabaseUser.id, metric: anomaly.metric },
            orderBy: { timestamp: 'desc' },
            take: 20,
        });
        const { fallback } = (0, ai_1.createProviderSuite)();
        const baselineService = new ai_1.BaselineService();
        const vitals = recentVitals.map(v => ({
            userId: v.userId,
            metric: v.metric.toLowerCase(),
            value: v.value,
            unit: v.unit,
            timestamp: v.timestamp.toISOString(),
        }));
        const baselinesMap = baselineService.computeBaselines(vitals);
        const baseline = baselinesMap.get(anomaly.metric.toLowerCase());
        if (!baseline) {
            return server_1.NextResponse.json({ error: 'Insufficient data for baseline' }, { status: 400 });
        }
        const aiAnomaly = {
            detected: true,
            metric: anomaly.metric.toLowerCase(),
            value: anomaly.value,
            zScore: anomaly.zScore ?? 0,
            severity: (anomaly.severity?.toLowerCase() ?? 'low'),
            baseline,
        };
        const anomalyService = new ai_1.AnomalyService(fallback);
        const explanation = await anomalyService.explainAnomaly(aiAnomaly, vitals);
        const updated = await database_1.prisma.anomalyDetection.update({
            where: { id: anomalyId },
            data: { explanation, isReviewed: true, reviewedAt: new Date() },
        });
        return server_1.NextResponse.json({ data: updated });
    }
    catch (error) {
        console.error('POST /api/agent/analyze-anomaly error:', error);
        return server_1.NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
    }
}
//# sourceMappingURL=route.js.map