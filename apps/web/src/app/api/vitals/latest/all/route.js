"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
const database_1 = require("@hamraz/database");
async function GET() {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    const metrics = await database_1.prisma.vitalRecord.groupBy({
        by: ['metric'],
        where: { userId: supabaseUser.id },
        _max: { timestamp: true },
    });
    const latest = {};
    for (const group of metrics) {
        const record = await database_1.prisma.vitalRecord.findFirst({
            where: { userId: supabaseUser.id, metric: group.metric, timestamp: group._max.timestamp ?? undefined },
            orderBy: { timestamp: 'desc' },
        });
        if (record) {
            latest[record.metric.toLowerCase()] = record;
        }
    }
    return server_1.NextResponse.json({ data: latest });
}
//# sourceMappingURL=route.js.map