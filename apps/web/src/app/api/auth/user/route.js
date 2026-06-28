"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
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
//# sourceMappingURL=route.js.map