"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
const database_1 = require("@hamraz/database");
async function PUT(_request, { params }) {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    const { id } = await params;
    const notification = await database_1.prisma.notification.findUnique({ where: { id } });
    if (!notification) {
        return server_1.NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    if (notification.userId !== supabaseUser.id) {
        return server_1.NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const updated = await database_1.prisma.notification.update({
        where: { id },
        data: { isRead: true },
    });
    return server_1.NextResponse.json({ data: updated });
}
//# sourceMappingURL=route.js.map