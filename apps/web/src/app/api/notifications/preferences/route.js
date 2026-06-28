"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PUT = PUT;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
const database_1 = require("@hamraz/database");
async function GET() {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    const prefs = await database_1.prisma.notificationPreference.findUnique({
        where: { userId: supabaseUser.id },
    });
    return server_1.NextResponse.json({ data: prefs ?? {} });
}
async function PUT(request) {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    try {
        const body = await request.json();
        const allowedFields = ['email', 'push', 'sms', 'types', 'insights', 'anomalies', 'summaries'];
        const updateData = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }
        const prefs = await database_1.prisma.notificationPreference.upsert({
            where: { userId: supabaseUser.id },
            update: updateData,
            create: { userId: supabaseUser.id, ...updateData },
        });
        return server_1.NextResponse.json({ data: prefs });
    }
    catch (error) {
        console.error('PUT /api/notifications/preferences error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map