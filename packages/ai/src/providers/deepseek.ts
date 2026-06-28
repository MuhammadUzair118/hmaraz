import type { CompletionRequest, CompletionResponse, AIProviderName, AIProviderConfig } from '../types'
import { AIProvider } from './base'

export class DeepSeekProvider extends AIProvider {
  readonly name: AIProviderName = 'deepseek'

  constructor(config: AIProviderConfig) {
    super(config)
  }

  async complete(req: CompletionRequest): Promise<CompletionResponse> {
    const response = await fetch(
      this.config.baseUrl ?? 'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey ?? ''}`,
        },
        body: JSON.stringify({
          model: this.config.model ?? 'deepseek-chat',
          messages: [
            ...(req.systemPrompt ? [{ role: 'system', content: req.systemPrompt }] : []),
            ...req.messages.map(m => ({ role: m.role, content: m.content })),
          ],
          temperature: req.temperature ?? 0.7,
          max_tokens: req.maxTokens ?? 2048,
          stream: false,
        }),
        signal: AbortSignal.timeout(this.config.timeout ?? 30_000),
      }
    )

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
    }

    const json = await response.json()
    return {
      content: json.choices?.[0]?.message?.content ?? '',
      finishReason: json.choices?.[0]?.finish_reason ?? 'unknown',
      usage: json.usage
        ? {
            promptTokens: json.usage.prompt_tokens ?? 0,
            completionTokens: json.usage.completion_tokens ?? 0,
            totalTokens: json.usage.total_tokens ?? 0,
          }
        : undefined,
    }
  }

  async *completeStream(req: CompletionRequest): AsyncIterable<string> {
    const response = await fetch(
      this.config.baseUrl ?? 'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey ?? ''}`,
        },
        body: JSON.stringify({
          model: this.config.model ?? 'deepseek-chat',
          messages: [
            ...(req.systemPrompt ? [{ role: 'system', content: req.systemPrompt }] : []),
            ...req.messages.map(m => ({ role: m.role, content: m.content })),
          ],
          temperature: req.temperature ?? 0.7,
          max_tokens: req.maxTokens ?? 2048,
          stream: true,
        }),
        signal: AbortSignal.timeout(this.config.timeout ?? 30_000),
      }
    )

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body for streaming')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') return
          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content ?? ''
            if (content) yield content
          } catch {
            // skip parse errors
          }
        }
      }
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(
        this.config.baseUrl ?? 'https://api.deepseek.com/v1/models',
        {
          headers: { Authorization: `Bearer ${this.config.apiKey ?? ''}` },
          signal: AbortSignal.timeout(5_000),
        }
      )
      return response.ok
    } catch {
      return false
    }
  }
}
