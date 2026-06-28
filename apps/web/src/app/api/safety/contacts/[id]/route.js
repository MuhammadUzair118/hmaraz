"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
const database_1 = require("@hamraz/database");
async function PUT(request, { params }) {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    const { id } = await params;
    const existing = await database_1.prisma.emergencyContact.findUnique({ where: { id } });
    if (!existing) {
        return server_1.NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    if (existing.userId !== supabaseUser.id) {
        return server_1.NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json();
    const allowedFields = ['name', 'phone', 'relationship', 'isNotified'];
    const updateData = {};
    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            updateData[field] = body[field];
        }
    }
    const contact = await database_1.prisma.emergencyContact.update({
        where: { id },
        data: updateData,
    });
    return server_1.NextResponse.json({ data: contact });
}
async function DELETE(_request, { params }) {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    const { id } = await params;
    const existing = await database_1.prisma.emergencyContact.findUnique({ where: { id } });
    if (!existing) {
        return server_1.NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    if (existing.userId !== supabaseUser.id) {
        return server_1.NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await database_1.prisma.emergencyContact.delete({ where: { id } });
    return server_1.NextResponse.json({ data: { deleted: true } });
}
//# sourceMappingURL=route.js.map