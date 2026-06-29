import type { CompletionRequest, CompletionResponse, AIProviderName, AIProviderConfig } from '../types'
import { AIProvider } from './base'

export class OllamaProvider extends AIProvider {
  readonly name: AIProviderName = 'ollama'

  constructor(config: AIProviderConfig) {
    super(config)
  }

  async complete(req: CompletionRequest): Promise<CompletionResponse> {
    const response = await fetch(
      `${this.config.baseUrl ?? 'http://localhost:11434'}/api/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model ?? 'llama3',
          messages: [
            ...(req.systemPrompt ? [{ role: 'system', content: req.systemPrompt }] : []),
            ...req.messages.map(m => ({ role: m.role, content: m.content })),
          ],
          options: {
            temperature: req.temperature ?? 0.7,
            num_predict: req.maxTokens ?? 2048,
          },
          stream: false,
        }),
        signal: AbortSignal.timeout(this.config.timeout ?? 60_000),
      }
    )

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    const json: Record<string, unknown> = await response.json()
    const message = json.message as Record<string, unknown> | undefined
    return {
      content: (message?.content as string) ?? '',
      finishReason: json.done ? 'stop' : 'unknown',
      usage: json.eval_count
        ? {
            promptTokens: (json.prompt_eval_count as number) ?? 0,
            completionTokens: (json.eval_count as number) ?? 0,
            totalTokens: ((json.prompt_eval_count as number) ?? 0) + ((json.eval_count as number) ?? 0),
          }
        : undefined,
    }
  }

  async *completeStream(req: CompletionRequest): AsyncIterable<string> {
    const response = await fetch(
      `${this.config.baseUrl ?? 'http://localhost:11434'}/api/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model ?? 'llama3',
          messages: [
            ...(req.systemPrompt ? [{ role: 'system', content: req.systemPrompt }] : []),
            ...req.messages.map(m => ({ role: m.role, content: m.content })),
          ],
          options: {
            temperature: req.temperature ?? 0.7,
            num_predict: req.maxTokens ?? 2048,
          },
          stream: true,
        }),
        signal: AbortSignal.timeout(this.config.timeout ?? 60_000),
      }
    )

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
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
        if (!line.trim()) continue
        try {
          const parsed = JSON.parse(line)
          const content = parsed.message?.content ?? ''
          if (content) yield content
          if (parsed.done) return
        } catch {
          // skip
        }
      }
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.config.baseUrl ?? 'http://localhost:11434'}/api/tags`,
        { signal: AbortSignal.timeout(5_000) }
      )
      return response.ok
    } catch {
      return false
    }
  }
}
