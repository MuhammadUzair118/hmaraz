import type { CompletionRequest, CompletionResponse, AIProviderConfig, AIProviderName } from '../types'

export abstract class AIProvider {
  abstract readonly name: AIProviderName
  protected config: AIProviderConfig

  constructor(config: AIProviderConfig) {
    this.config = config
  }

  abstract complete(req: CompletionRequest): Promise<CompletionResponse>

  abstract completeStream(req: CompletionRequest): AsyncIterable<string>

  abstract checkHealth(): Promise<boolean>
}
