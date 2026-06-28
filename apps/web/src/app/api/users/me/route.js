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
    const profile = await (0, auth_helpers_1.getOrCreateProfile)(supabaseUser);
    return server_1.NextResponse.json({
        data: {
            ...profile,
            needsOnboarding: !profile.onboardingCompleted,
        },
    });
}
async function PUT(request) {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    try {
        const body = await request.json();
        const allowedFields = ['name', 'phone', 'gender', 'dateOfBirth', 'height', 'weight', 'avatar', 'timezone', 'measurementSystem', 'onboardingCompleted'];
        const updateData = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }
        const profile = await database_1.prisma.userProfile.update({
            where: { id: supabaseUser.id },
            data: updateData,
        });
        return server_1.NextResponse.json({ data: profile });
    }
    catch (error) {
        console.error('PUT /api/users/me error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map