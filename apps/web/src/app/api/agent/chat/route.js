"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const auth_helpers_1 = require("@/lib/auth-helpers");
const database_1 = require("@hamraz/database");
const ai_1 = require("@hamraz/ai");
const ROLE_MAP = { user: 'user', assistant: 'assistant' };
async function POST(request) {
    const supabaseUser = await (0, auth_helpers_1.requireAuth)();
    if (!supabaseUser)
        return (0, auth_helpers_1.unauthorized)();
    try {
        const body = await request.json();
        const { message, conversationId: existingConversationId } = body;
        if (!message || typeof message !== 'string') {
            return server_1.NextResponse.json({ error: 'message is required' }, { status: 400 });
        }
        let conversationId = existingConversationId;
        if (!conversationId) {
            const conversation = await database_1.prisma.conversation.create({
                data: { userId: supabaseUser.id, title: message.slice(0, 80) },
            });
            conversationId = conversation.id;
        }
        else {
            const conversation = await database_1.prisma.conversation.findUnique({ where: { id: conversationId } });
            if (!conversation || conversation.userId !== supabaseUser.id) {
                return server_1.NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
            }
        }
        await database_1.prisma.message.create({
            data: { conversationId, role: 'user', content: message },
        });
        const previousMessages = await database_1.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: 50,
        });
        const aiMessages = previousMessages.map(m => ({
            role: ROLE_MAP[m.role] ?? 'user',
            content: m.content,
            timestamp: m.createdAt.getTime(),
        }));
        const { fallback } = (0, ai_1.createProviderSuite)();
        const chatService = new ai_1.ChatService(fallback);
        const response = await chatService.sendMessage(conversationId, aiMessages);
        await database_1.prisma.message.create({
            data: { conversationId, role: 'assistant', content: response.content },
        });
        return server_1.NextResponse.json({
            data: {
                message: response.content,
                conversationId: response.conversationId,
            },
        });
    }
    catch (error) {
        console.error('POST /api/agent/chat error:', error);
        return server_1.NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
    }
}
//# sourceMappingURL=route.js.map