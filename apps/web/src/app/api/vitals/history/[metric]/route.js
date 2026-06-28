"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamic = void 0;
exports.GET = GET;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
const database_1 = require("@hamraz/database");
exports.dynamic = 'force-dynamic';
async function GET(request, { params }) {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    const { metric } = await params;
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 500);
    const metricUpper = metric.toUpperCase();
    const where = { userId: supabaseUser.id, metric: metricUpper };
    if (from || to) {
        where.timestamp = {};
        if (from)
            where.timestamp.gte = new Date(from);
        if (to)
            where.timestamp.lte = new Date(to);
    }
    const records = await database_1.prisma.vitalRecord.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
    });
    return server_1.NextResponse.json({ data: records });
}
//# sourceMappingURL=route.js.map