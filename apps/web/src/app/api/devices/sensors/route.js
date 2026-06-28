"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
const database_1 = require("@hamraz/database");
const types_1 = require("@hamraz/types");
async function POST(request) {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    try {
        const body = await request.json();
        const parsed = types_1.sensorDataSchema.safeParse({ ...body });
        if (!parsed.success) {
            return server_1.NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const { sensorType, value, unit, timestamp, metadata } = parsed.data;
        const record = await database_1.prisma.phoneSensorData.create({
            data: {
                userId: supabaseUser.id,
                sensorType,
                value,
                unit,
                timestamp: timestamp ? new Date(timestamp) : new Date(),
                metadata: metadata ?? undefined,
            },
        });
        return server_1.NextResponse.json({ data: record }, { status: 201 });
    }
    catch (error) {
        console.error('POST /api/devices/sensors error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map