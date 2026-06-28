"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const ssr_1 = require("@supabase/ssr");
const headers_1 = require("next/headers");
const types_1 = require("@hamraz/types");
async function POST(request) {
    try {
        const body = await request.json();
        const parsed = types_1.signInSchema.safeParse(body);
        if (!parsed.success) {
            return server_1.NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const { email, password } = parsed.data;
        const cookieStore = await (0, headers_1.cookies)();
        const supabase = (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '', {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                },
            },
        });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            return server_1.NextResponse.json({ error: error.message }, { status: 401 });
        }
        return server_1.NextResponse.json({ data: { user: data.user, session: data.session } });
    }
    catch (error) {
        console.error('POST /api/auth/signin error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map