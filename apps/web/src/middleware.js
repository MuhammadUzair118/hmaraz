"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.middleware = middleware;
const ssr_1 = require("@supabase/ssr");
const server_1 = require("next/server");
async function middleware(request) {
    let response = server_1.NextResponse.next({ request: { headers: request.headers } });
    const supabase = (0, ssr_1.createServerClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            getAll() { return request.cookies.getAll(); },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
            },
        },
    });
    const { data: { user } } = await supabase.auth.getUser();
    const isAuthPage = request.nextUrl.pathname.startsWith('/signin') ||
        request.nextUrl.pathname.startsWith('/signup') ||
        request.nextUrl.pathname.startsWith('/auth/');
    if (!user && !isAuthPage) {
        return server_1.NextResponse.redirect(new URL('/signin', request.url));
    }
    if (user && isAuthPage) {
        return server_1.NextResponse.redirect(new URL('/', request.url));
    }
    return response;
}
exports.config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
//# sourceMappingURL=middleware.js.map