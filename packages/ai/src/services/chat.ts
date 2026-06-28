import type { CompletionRequest, Message } from '../types'
import { SYSTEM_PROMPT } from '../prompts/system-prompt'
import { FallbackProvider } from '../providers/fallback'

export class ChatService {
  private fallback: FallbackProvider

  constructor(fallback: FallbackProvider) {
    this.fallback = fallback
  }

  async sendMessage(
    conversationId: string,
    messages: Message[],
    context?: Record<string, unknown>
  ): Promise<{ content: string; conversationId: string }> {
    const systemMessage = buildSystemPrompt(context)

    const req: CompletionRequest = {
      messages,
      systemPrompt: systemMessage,
      temperature: 0.7,
      maxTokens: 1024,
    }

    const response = await this.fallback.complete(req)

    return {
      content: response.content,
      conversationId,
    }
  }

  async *streamMessage(
    conversationId: string,
    messages: Message[],
    context?: Record<string, unknown>
  ): AsyncIterable<string> {
    const systemMessage = buildSystemPrompt(context)

    const req: CompletionRequest = {
      messages,
      systemPrompt: systemMessage,
      temperature: 0.7,
      maxTokens: 1024,
      stream: true,
    }

    for await (const chunk of this.fallback.completeStream(req)) {
      yield chunk
    }
  }
}

function buildSystemPrompt(context?: Record<string, unknown>): string {
  const contextBlock = context
    ? `\n\nCurrent user context:\n${JSON.stringify(context, null, 2)}`
    : ''
  return `${SYSTEM_PROMPT}${contextBlock}`
}
