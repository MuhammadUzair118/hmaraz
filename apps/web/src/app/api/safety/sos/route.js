"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
const database_1 = require("@hamraz/database");
async function POST(request) {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    try {
        const body = await request.json();
        const type = body.type ?? 'MANUAL';
        const location = body.location ?? null;
        const alert = await database_1.prisma.emergencyAlert.create({
            data: {
                userId: supabaseUser.id,
                type,
                severity: 'EMERGENCY',
                location,
                status: 'ACTIVE',
            },
        });
        const contacts = await database_1.prisma.emergencyContact.findMany({
            where: { userId: supabaseUser.id, isNotified: true },
        });
        return server_1.NextResponse.json({ data: { alert, notifiedContacts: contacts.length } }, { status: 201 });
    }
    catch (error) {
        console.error('POST /api/safety/sos error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map