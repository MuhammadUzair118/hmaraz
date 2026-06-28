"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const headers_1 = require("next/headers");
const supabase_1 = require("@/lib/supabase");
const server_1 = require("next/server");
async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    if (code) {
        const cookieStore = await (0, headers_1.cookies)();
        const supabase = (0, supabase_1.createServerSupabase)(cookieStore);
        await supabase.auth.exchangeCodeForSession(code);
    }
    return server_1.NextResponse.redirect(`${origin}/`);
}
//# sourceMappingURL=route.js.map