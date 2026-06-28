"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
const database_1 = require("@hamraz/database");
const types_1 = require("@hamraz/types");
const utils_1 = require("@hamraz/utils");
async function POST(request) {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    try {
        const body = await request.json();
        const parsed = types_1.vitalCreateSchema.safeParse({ ...body, userId: supabaseUser.id });
        if (!parsed.success) {
            return server_1.NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        const { metric, value, unit, timestamp, source } = parsed.data;
        const normalized = (0, utils_1.normalizeVitalValue)(value, metric, unit);
        const record = await database_1.prisma.vitalRecord.create({
            data: {
                userId: supabaseUser.id,
                metric,
                value: normalized.value,
                unit: normalized.unit,
                source,
                timestamp: timestamp ? new Date(timestamp) : new Date(),
            },
        });
        return server_1.NextResponse.json({ data: record }, { status: 201 });
    }
    catch (error) {
        console.error('POST /api/vitals error:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map