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
    const { id } = await params;
    const insight = await database_1.prisma.aIInsight.findUnique({ where: { id } });
    if (!insight) {
        return server_1.NextResponse.json({ error: 'Insight not found' }, { status: 404 });
    }
    if (insight.userId !== supabaseUser.id) {
        return server_1.NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return server_1.NextResponse.json({ data: insight });
}
//# sourceMappingURL=route.js.map