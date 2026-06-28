import { NextResponse } from 'next/server';
export declare function POST(request: Request): Promise<NextResponse<{
    error: {
        email?: string[] | undefined;
        password?: string[] | undefined;
        name?: string[] | undefined;
    };
}> | NextResponse<{
    error: string;
}> | NextResponse<{
    data: {
        user: {
            id: string;
            email: string | undefined;
        };
    };
}>>;
//# sourceMappingURL=route.d.ts.map