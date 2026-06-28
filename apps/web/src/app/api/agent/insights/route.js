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
        const period = body.period ?? 'daily';
        const since = new Date();
        if (period === 'weekly')
            since.setDate(since.getDate() - 7);
        else if (period === 'monthly')
            since.setDate(since.getDate() - 30);
        else
            since.setDate(since.getDate() - 1);
        const vitals = await database_1.prisma.vitalRecord.findMany({
            where: { userId: supabaseUser.id, timestamp: { gte: since } },
            orderBy: { timestamp: 'asc' },
        });
        const baselines = await database_1.prisma.vitalBaseline.findMany({
            where: { userId: supabaseUser.id },
        });
        const aiVitals = vitals.map(v => ({
            userId: v.userId,
            metric: v.metric.toLowerCase(),
            value: v.value,
            unit: v.unit,
            timestamp: v.timestamp.toISOString(),
        }));
        const aiBaselines = baselines.map(b => ({
            metric: b.metric.toLowerCase(),
            mean: b.mean ?? 0,
            stdDev: b.stdDev ?? 0,
            min: b.minValue,
            max: b.maxValue,
            sampleSize: b.sampleCount,
            lastComputed: b.updatedAt.toISOString(),
        }));
        const { fallback } = (0, ai_1.createProviderSuite)();
        const insightsService = new ai_1.InsightsService(fallback);
        let insight;
        if (period === 'weekly') {
            insight = await insightsService.generateWeeklyInsight(supabaseUser.id, aiVitals, aiBaselines);
        }
        else if (period === 'monthly') {
            insight = await insightsService.generateMonthlyInsight(supabaseUser.id, aiVitals, aiBaselines);
        }
        else {
            insight = await insightsService.generateDailyInsight(supabaseUser.id, aiVitals, aiBaselines);
        }
        const saved = await database_1.prisma.aIInsight.create({
            data: {
                userId: supabaseUser.id,
                insightType: insight.type.toUpperCase(),
                title: insight.title,
                summary: insight.summary,
            },
        });
        if (period === 'daily') {
            await database_1.prisma.dailySummary.upsert({
                where: { userId_date: { userId: supabaseUser.id, date: new Date() } },
                update: { summary: insight.summary },
                create: {
                    userId: supabaseUser.id,
                    date: new Date(),
                    summary: insight.summary,
                    highlights: [],
                    recommendations: [],
                },
            });
        }
        return server_1.NextResponse.json({ data: saved }, { status: 201 });
    }
    catch (error) {
        console.error('POST /api/agent/insights error:', error);
        return server_1.NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
    }
}
//# sourceMappingURL=route.js.map