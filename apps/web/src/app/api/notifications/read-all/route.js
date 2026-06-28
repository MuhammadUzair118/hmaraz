"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
const database_1 = require("@hamraz/database");
async function PUT() {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    const result = await database_1.prisma.notification.updateMany({
        where: { userId: supabaseUser.id, isRead: false },
        data: { isRead: true },
    });
    return server_1.NextResponse.json({ data: { updatedCount: result.count } });
}
//# sourceMappingURL=route.js.map