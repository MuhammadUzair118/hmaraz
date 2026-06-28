import type { AIProviderName, AIProviderConfig } from '../types'
import { PROVIDER_PRIORITY, PROVIDER_DEFAULTS } from '../config'
import { AIProvider } from './base'
import { GeminiProvider } from './gemini'
import { DeepSeekProvider } from './deepseek'
import { QwenProvider } from './qwen'
import { OllamaProvider } from './ollama'
import { ProviderHealthRegistry } from './health'

export class ProviderRegistry {
  private providers = new Map<AIProviderName, AIProvider>()
  private health: ProviderHealthRegistry

  constructor(healthRegistry: ProviderHealthRegistry) {
    this.health = healthRegistry
  }

  register(config: AIProviderConfig): AIProvider {
    const provider = this.createProvider(config)
    this.providers.set(provider.name, provider)
    return provider
  }

  registerDefaults(overrides?: Partial<Record<AIProviderName, Partial<AIProviderConfig>>>): void {
    for (const name of PROVIDER_PRIORITY) {
      const defaults = PROVIDER_DEFAULTS[name]
      const override = overrides?.[name] ?? {}
      this.register({ ...defaults, ...override })
    }
  }

  get(name: AIProviderName): AIProvider | undefined {
    return this.providers.get(name)
  }

  getAvailable(): AIProvider[] {
    const available: AIProvider[] = []
    for (const name of PROVIDER_PRIORITY) {
      const provider = this.providers.get(name)
      if (provider && this.health.isAvailable(name)) {
        available.push(provider)
      }
    }
    return available
  }

  getNextAvailable(startIndex?: number): AIProvider | null {
    const available = this.getAvailable()
    const start = startIndex ?? 0
    for (let i = start; i < available.length; i++) {
      if (this.health.isAvailable(available[i].name)) {
        return available[i]
      }
    }
    return null
  }

  private createProvider(config: AIProviderConfig): AIProvider {
    switch (config.name) {
      case 'gemini':
        return new GeminiProvider(config)
      case 'deepseek':
        return new DeepSeekProvider(config)
      case 'qwen':
        return new QwenProvider(config)
      case 'ollama':
        return new OllamaProvider(config)
    }
  }
}
