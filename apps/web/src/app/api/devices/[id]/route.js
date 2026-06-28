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
    const device = await database_1.prisma.wearableDevice.findUnique({ where: { id } });
    if (!device) {
        return server_1.NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }
    if (device.userId !== supabaseUser.id) {
        return server_1.NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await database_1.prisma.wearableDevice.delete({ where: { id } });
    return server_1.NextResponse.json({ data: { deleted: true } });
}
//# sourceMappingURL=route.js.map