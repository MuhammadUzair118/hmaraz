import { NextResponse } from 'next/server';
export declare function POST(request: Request): Promise<NextResponse<{
    error: {
        email?: string[] | undefined;
        password?: string[] | undefined;
    };
}> | NextResponse<{
    error: string;
}> | NextResponse<{
    data: {
        user: import("@supabase/auth-js").User;
        session: import("@supabase/auth-js").Session;
    };
}>>;
//# sourceMappingURL=route.d.ts.map