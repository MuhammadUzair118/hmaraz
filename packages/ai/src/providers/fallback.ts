import type { CompletionRequest, CompletionResponse } from '../types'
import { ProviderRegistry } from './registry'
import { ProviderHealthRegistry } from './health'

export class FallbackProvider {
  private registry: ProviderRegistry
  private health: ProviderHealthRegistry

  constructor(registry: ProviderRegistry, health: ProviderHealthRegistry) {
    this.registry = registry
    this.health = health
  }

  async complete(req: CompletionRequest): Promise<CompletionResponse> {
    const available = this.registry.getAvailable()
    if (available.length === 0) {
      throw new Error('No AI providers available')
    }

    for (const provider of available) {
      try {
        const result = await provider.complete(req)
        this.health.recordSuccess(provider.name, 0)
        return result
      } catch {
        this.health.recordFailure(provider.name)
      }
    }

    throw new Error('All AI providers failed')
  }

  async *completeStream(req: CompletionRequest): AsyncIterable<string> {
    const available = this.registry.getAvailable()
    if (available.length === 0) {
      throw new Error('No AI providers available for streaming')
    }

    for (const provider of available) {
      try {
        for await (const chunk of provider.completeStream(req)) {
          yield chunk
        }
        this.health.recordSuccess(provider.name, 0)
        return
      } catch {
        this.health.recordFailure(provider.name)
      }
    }

    throw new Error('All AI providers failed for streaming')
  }
}
