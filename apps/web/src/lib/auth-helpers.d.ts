export declare function requireAuth(): Promise<import("@supabase/auth-js").User | null>;
export declare function getOrCreateProfile(supabaseUser: NonNullable<Awaited<ReturnType<typeof requireAuth>>>): Promise<{
    email: string;
    name: string;
    measurementSystem: string;
    phone: string | null;
    avatar: string | null;
    id: string;
    role: import(".prisma/client").$Enums.UserRole;
    gender: import(".prisma/client").$Enums.Gender | null;
    dateOfBirth: Date | null;
    height: number | null;
    weight: number | null;
    onboardingCompleted: boolean;
    isActive: boolean;
    timezone: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function unauthorized(): import("undici-types").Response;
//# sourceMappingURL=auth-helpers.d.ts.map