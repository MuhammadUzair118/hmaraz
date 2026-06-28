"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const ssr_1 = require("@supabase/ssr");
const headers_1 = require("next/headers");
async function POST() {
    try {
        const cookieStore = await (0, headers_1.cookies)();
        const supabase = (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                },
            },
        });
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
            return server_1.NextResponse.json({ error: error.message }, { status: 401 });
        }
        return server_1.NextResponse.json({ data: { session: data.session, user: data.user } });
    }
    catch (error) {
        console.error('POST /api/auth/refresh error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map