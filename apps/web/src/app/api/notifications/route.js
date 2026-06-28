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
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);
    const where = { userId: supabaseUser.id };
    if (unreadOnly)
        where.isRead = false;
    const notifications = await database_1.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
    const unreadCount = await database_1.prisma.notification.count({
        where: { userId: supabaseUser.id, isRead: false },
    });
    return server_1.NextResponse.json({ data: { notifications, unreadCount } });
}
//# sourceMappingURL=route.js.map