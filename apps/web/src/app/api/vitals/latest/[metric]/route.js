"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
const database_1 = require("@hamraz/database");
async function GET(_request, { params }) {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    const { metric } = await params;
    const metricUpper = metric.toUpperCase();
    const record = await database_1.prisma.vitalRecord.findFirst({
        where: { userId: supabaseUser.id, metric: metricUpper },
        orderBy: { timestamp: 'desc' },
    });
    if (!record) {
        return server_1.NextResponse.json({ error: 'No data found for this metric' }, { status: 404 });
    }
    return server_1.NextResponse.json({ data: record });
}
//# sourceMappingURL=route.js.map