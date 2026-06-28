import type { CompletionRequest, CompletionResponse, AIProviderName, AIProviderConfig } from '../types'
import { AIProvider } from './base'

export class QwenProvider extends AIProvider {
  readonly name: AIProviderName = 'qwen'

  constructor(config: AIProviderConfig) {
    super(config)
  }

  async complete(req: CompletionRequest): Promise<CompletionResponse> {
    const response = await fetch(
      this.config.baseUrl ?? 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey ?? ''}`,
        },
        body: JSON.stringify({
          model: this.config.model ?? 'qwen-max',
          input: {
            messages: [
              ...(req.systemPrompt ? [{ role: 'system', content: req.systemPrompt }] : []),
              ...req.messages.map(m => ({ role: m.role, content: m.content })),
            ],
          },
          parameters: {
            temperature: req.temperature ?? 0.7,
            max_tokens: req.maxTokens ?? 2048,
            result_format: 'message',
          },
        }),
        signal: AbortSignal.timeout(this.config.timeout ?? 30_000),
      }
    )

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.status} ${response.statusText}`)
    }

    const json = await response.json()
    const output = json.output
    return {
      content: output?.choices?.[0]?.message?.content ?? output?.text ?? '',
      finishReason: output?.finish_reason ?? 'unknown',
      usage: json.usage
        ? {
            promptTokens: json.usage.input_tokens ?? 0,
            completionTokens: json.usage.output_tokens ?? 0,
            totalTokens: (json.usage.input_tokens ?? 0) + (json.usage.output_tokens ?? 0),
          }
        : undefined,
    }
  }

  async *completeStream(req: CompletionRequest): AsyncIterable<string> {
    const response = await fetch(
      this.config.baseUrl ?? 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey ?? ''}`,
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          model: this.config.model ?? 'qwen-max',
          input: {
            messages: [
              ...(req.systemPrompt ? [{ role: 'system', content: req.systemPrompt }] : []),
              ...req.messages.map(m => ({ role: m.role, content: m.content })),
            ],
          },
          parameters: {
            temperature: req.temperature ?? 0.7,
            max_tokens: req.maxTokens ?? 2048,
            result_format: 'message',
            incremental_output: true,
          },
        }),
        signal: AbortSignal.timeout(this.config.timeout ?? 30_000),
      }
    )

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.status} ${response.statusText}`)
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
        if (line.startsWith('data:')) {
          try {
            const parsed = JSON.parse(line.slice(5).trim())
            const content = parsed?.output?.choices?.[0]?.message?.content ?? ''
            if (content) yield content
            if (parsed?.output?.finish_reason) return
          } catch {
            // skip
          }
        }
      }
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(
        this.config.baseUrl ?? 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey ?? ''}`,
          },
          body: JSON.stringify({
            model: this.config.model ?? 'qwen-max',
            input: { messages: [{ role: 'user', content: 'ping' }] },
            parameters: { max_tokens: 1 },
          }),
          signal: AbortSignal.timeout(5_000),
        }
      )
      return response.ok
    } catch {
      return false
    }
  }
}
