"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
const database_1 = require("@hamraz/database");
async function GET(request) {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);
    const where = { userId: supabaseUser.id };
    if (status) {
        where.status = status.toUpperCase();
    }
    const alerts = await database_1.prisma.emergencyAlert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
    return server_1.NextResponse.json({ data: alerts });
}
//# sourceMappingURL=route.js.map