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
        const metric = body.metric?.toUpperCase();
        if (!metric) {
            return server_1.NextResponse.json({ error: 'metric is required' }, { status: 400 });
        }
        const records = await database_1.prisma.vitalRecord.findMany({
            where: { userId: supabaseUser.id, metric },
            orderBy: { timestamp: 'asc' },
        });
        if (records.length < 5) {
            return server_1.NextResponse.json({ error: 'Need at least 5 records to compute baseline' }, { status: 400 });
        }
        const vitals = records.map(v => ({
            userId: v.userId,
            metric: v.metric.toLowerCase(),
            value: v.value,
            unit: v.unit,
            timestamp: v.timestamp.toISOString(),
        }));
        const baselineService = new ai_1.BaselineService();
        const baselinesMap = baselineService.computeBaselines(vitals);
        const baseline = baselinesMap.get(metric.toLowerCase());
        if (!baseline) {
            return server_1.NextResponse.json({ error: 'Could not compute baseline' }, { status: 500 });
        }
        const saved = await database_1.prisma.vitalBaseline.upsert({
            where: { userId_metric: { userId: supabaseUser.id, metric } },
            update: {
                minValue: baseline.min,
                maxValue: baseline.max,
                mean: baseline.mean,
                stdDev: baseline.stdDev,
                sampleCount: baseline.sampleSize,
                unit: records[0].unit,
            },
            create: {
                userId: supabaseUser.id,
                metric,
                minValue: baseline.min,
                maxValue: baseline.max,
                mean: baseline.mean,
                stdDev: baseline.stdDev,
                sampleCount: baseline.sampleSize,
                unit: records[0].unit,
            },
        });
        return server_1.NextResponse.json({ data: saved });
    }
    catch (error) {
        console.error('POST /api/agent/compute-baseline error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map