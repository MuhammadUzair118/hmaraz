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
    const baselines = await database_1.prisma.vitalBaseline.findMany({
        where: { userId: supabaseUser.id },
    });
    return server_1.NextResponse.json({ data: baselines });
}
//# sourceMappingURL=route.js.map