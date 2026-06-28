import type { NextRequest, NextResponse } from 'next/server';
export declare function createClient(): import("@supabase/supabase-js").SupabaseClient<any, "public", any, any, any>;
export declare function createServerSupabase(cookieStore: Awaited<ReturnType<typeof import('next/headers').cookies>>): import("@supabase/supabase-js").SupabaseClient<any, "public", any, any, any>;
export declare function createMiddlewareSupabase(request: NextRequest, response: NextResponse): import("@supabase/supabase-js").SupabaseClient<any, "public", any, any, any>;
//# sourceMappingURL=supabase.d.ts.map