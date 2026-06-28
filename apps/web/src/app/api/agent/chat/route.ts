import { NextResponse } from 'next/server'
import { requireAuth, unauthorized } from '@/lib/auth-helpers'
import { prisma } from '@hamraz/database'
import { createProviderSuite, ChatService } from '@hamraz/ai'

const ROLE_MAP: Record<string, 'user' | 'assistant'> = { user: 'user', assistant: 'assistant' }

export async function POST(request: Request) {
  const supabaseUser = await requireAuth()
  if (!supabaseUser) return unauthorized()

  try {
    const body = await request.json()
    const { message, conversationId: existingConversationId } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    let conversationId = existingConversationId
    if (!conversationId) {
      const conversation = await prisma.conversation.create({
        data: { userId: supabaseUser.id, title: message.slice(0, 80) },
      })
      conversationId = conversation.id
    } else {
      const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } })
      if (!conversation || conversation.userId !== supabaseUser.id) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
    }

    await prisma.message.create({
      data: { conversationId, role: 'user', content: message },
    })

    const previousMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })

    const aiMessages = previousMessages.map(m => ({
      role: ROLE_MAP[m.role] ?? 'user',
      content: m.content,
      timestamp: m.createdAt.getTime(),
    }))

    const { fallback } = createProviderSuite()
    const chatService = new ChatService(fallback)
    const response = await chatService.sendMessage(conversationId, aiMessages)

    await prisma.message.create({
      data: { conversationId, role: 'assistant', content: response.content },
    })

    return NextResponse.json({
      data: {
        message: response.content,
        conversationId: response.conversationId,
      },
    })
  } catch (error) {
    console.error('POST /api/agent/chat error:', error)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }
}
