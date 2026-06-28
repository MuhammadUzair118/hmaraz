import { NextResponse } from 'next/server';
export declare function POST(): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    data: {
        session: import("@supabase/auth-js").Session | null;
        user: import("@supabase/auth-js").User | null;
    };
}>>;
//# sourceMappingURL=route.d.ts.map