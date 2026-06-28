"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
const database_1 = require("@hamraz/database");
async function GET() {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    const contacts = await database_1.prisma.emergencyContact.findMany({
        where: { userId: supabaseUser.id },
        orderBy: { createdAt: 'asc' },
    });
    return server_1.NextResponse.json({ data: contacts });
}
async function POST(request) {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    try {
        const body = await request.json();
        const { name, phone, relationship, isNotified } = body;
        if (!name || !phone || !relationship) {
            return server_1.NextResponse.json({ error: 'name, phone, and relationship are required' }, { status: 400 });
        }
        const contact = await database_1.prisma.emergencyContact.create({
            data: {
                userId: supabaseUser.id,
                name,
                phone,
                relationship,
                isNotified: isNotified ?? false,
            },
        });
        return server_1.NextResponse.json({ data: contact }, { status: 201 });
    }
    catch (error) {
        console.error('POST /api/safety/contacts error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map