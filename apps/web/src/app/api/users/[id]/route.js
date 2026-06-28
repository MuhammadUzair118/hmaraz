"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = DELETE;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
const database_1 = require("@hamraz/database");
async function DELETE(_request, { params }) {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    const { id } = await params;
    const profile = await database_1.prisma.userProfile.findUnique({ where: { id } });
    if (!profile) {
        return server_1.NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (supabaseUser.id !== id && profile.role !== 'ADMIN') {
        return server_1.NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await database_1.prisma.userProfile.delete({ where: { id } });
    return server_1.NextResponse.json({ data: { deleted: true } });
}
//# sourceMappingURL=route.js.map