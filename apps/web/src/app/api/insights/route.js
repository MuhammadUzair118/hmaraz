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
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
    const where = { userId: supabaseUser.id, isDismissed: false };
    if (type)
        where.insightType = type.toUpperCase();
    const insights = await database_1.prisma.aIInsight.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
    return server_1.NextResponse.json({ data: insights });
}
//# sourceMappingURL=route.js.map