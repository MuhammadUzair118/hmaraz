"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const ssr_1 = require("@supabase/ssr");
const database_1 = require("@hamraz/database");
const types_1 = require("@hamraz/types");
function createSupabaseAdmin() {
    return (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.SUPABASE_SERVICE_ROLE_KEY ?? '', { cookies: { getAll: () => [], setAll: () => { } } });
}
async function POST(request) {
    try {
        const body = await request.json();
        const parsed = types_1.signUpSchema.safeParse(body);
        if (!parsed.success) {
            return server_1.NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const { email, password, name } = parsed.data;
        const supabase = createSupabaseAdmin();
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name },
        });
        if (authError) {
            return server_1.NextResponse.json({ error: authError.message }, { status: 400 });
        }
        if (authData.user) {
            await database_1.prisma.userProfile.create({
                data: {
                    id: authData.user.id,
                    email,
                    name,
                },
            });
        }
        return server_1.NextResponse.json({ data: { user: { id: authData.user.id, email: authData.user.email } } }, { status: 201 });
    }
    catch (error) {
        console.error('POST /api/auth/signup error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map