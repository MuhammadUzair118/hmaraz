import { GoogleGenerativeAI } from '@google/generative-ai'
import type { CompletionRequest, CompletionResponse, AIProviderName, AIProviderConfig } from '../types'
import { AIProvider } from './base'

export class GeminiProvider extends AIProvider {
  readonly name: AIProviderName = 'gemini'
  private client: GoogleGenerativeAI

  constructor(config: AIProviderConfig) {
    super(config)
    if (!config.apiKey) {
      throw new Error('Gemini API key is required')
    }
    this.client = new GoogleGenerativeAI(config.apiKey)
  }

  async complete(req: CompletionRequest): Promise<CompletionResponse> {
    const model = this.client.getGenerativeModel({
      model: this.config.model ?? 'gemini-2.5-flash',
    })

    const history = req.messages
      .filter(m => m.role !== 'system' && m.role !== 'user')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: m.content }],
      }))

    const systemMessage = req.systemPrompt ?? req.messages.find(m => m.role === 'system')?.content
    const lastUserMessage = [...req.messages].reverse().find(m => m.role === 'user')?.content ?? ''

    const chat = model.startChat({
      history,
      systemInstruction: systemMessage ? { role: 'user', parts: [{ text: systemMessage }] } : undefined,
    })

    const result = await chat.sendMessage(lastUserMessage)
    const response = result.response
    const text = response.text()

    const usage = response.usageMetadata
      ? {
          promptTokens: response.usageMetadata.promptTokenCount ?? 0,
          completionTokens: response.usageMetadata.candidatesTokenCount ?? 0,
          totalTokens: (response.usageMetadata.promptTokenCount ?? 0) + (response.usageMetadata.candidatesTokenCount ?? 0),
        }
      : undefined

    return {
      content: text,
      finishReason: response.candidates?.[0]?.finishReason?.toString() ?? 'unknown',
      usage,
    }
  }

  async *completeStream(req: CompletionRequest): AsyncIterable<string> {
    const model = this.client.getGenerativeModel({
      model: this.config.model ?? 'gemini-2.5-flash',
    })

    const systemMessage = req.systemPrompt ?? req.messages.find(m => m.role === 'system')?.content
    const lastUserMessage = [...req.messages].reverse().find(m => m.role === 'user')?.content ?? ''

    const chat = model.startChat({
      systemInstruction: systemMessage ? { role: 'user', parts: [{ text: systemMessage }] } : undefined,
    })

    const result = await chat.sendMessageStream(lastUserMessage)
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        yield text
      }
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.config.model ?? 'gemini-2.5-flash',
      })
      await model.generateContent('ping')
      return true
    } catch {
      return false
    }
  }


}
