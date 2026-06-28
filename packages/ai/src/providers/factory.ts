import { ProviderHealthRegistry } from './health'
import { ProviderRegistry } from './registry'
import { FallbackProvider } from './fallback'

export interface AIProviderSuite {
  health: ProviderHealthRegistry
  registry: ProviderRegistry
  fallback: FallbackProvider
}

export function createProviderSuite(
  overrides?: Parameters<ProviderRegistry['registerDefaults']>[0]
): AIProviderSuite {
  const health = new ProviderHealthRegistry()
  const registry = new ProviderRegistry(health)
  registry.registerDefaults(overrides)
  const fallback = new FallbackProvider(registry, health)
  return { health, registry, fallback }
}
