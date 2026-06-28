"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PUT = PUT;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
const database_1 = require("@hamraz/database");
const types_1 = require("@hamraz/types");
async function GET() {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    const settings = await database_1.prisma.userSettings.findUnique({
        where: { userId: supabaseUser.id },
    });
    return server_1.NextResponse.json({ data: settings ?? {} });
}
async function PUT(request) {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    try {
        const body = await request.json();
        const parsed = types_1.userSettingsUpdateSchema.safeParse(body);
        if (!parsed.success) {
            return server_1.NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const settings = await database_1.prisma.userSettings.upsert({
            where: { userId: supabaseUser.id },
            update: parsed.data,
            create: { userId: supabaseUser.id, ...parsed.data },
        });
        return server_1.NextResponse.json({ data: settings });
    }
    catch (error) {
        console.error('PUT /api/settings error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map