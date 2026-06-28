"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.getOrCreateProfile = getOrCreateProfile;
exports.unauthorized = unauthorized;
const headers_1 = require("next/headers");
const supabase_1 = require("./supabase");
const database_1 = require("@hamraz/database");
async function requireAuth() {
    const cookieStore = await (0, headers_1.cookies)();
    const supabase = (0, supabase_1.createServerSupabase)(cookieStore);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || !user.email) {
        return null;
    }
    return user;
}
async function getOrCreateProfile(supabaseUser) {
    const existing = await database_1.prisma.userProfile.findUnique({
        where: { id: supabaseUser.id },
    });
    if (existing) {
        return existing;
    }
    return database_1.prisma.userProfile.create({
        data: {
            id: supabaseUser.id,
            email: supabaseUser.email ?? '',
            name: supabaseUser.user_metadata?.full_name ?? supabaseUser.email?.split('@')[0] ?? 'User',
        },
    });
}
function unauthorized() {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
//# sourceMappingURL=auth-helpers.js.map