import type { AIProviderConfig } from './types'

export const PROVIDER_PRIORITY: Array<AIProviderConfig['name']> = [
  'gemini',
  'deepseek',
  'qwen',
  'ollama',
]

export const DEFAULT_PROVIDER: AIProviderConfig['name'] = 'gemini'

export const PROVIDER_DEFAULTS: Record<AIProviderConfig['name'], AIProviderConfig> = {
  gemini: {
    name: 'gemini',
    model: 'gemini-2.5-flash',
    maxRetries: 2,
    timeout: 30_000,
  },
  deepseek: {
    name: 'deepseek',
    model: 'deepseek-chat',
    maxRetries: 2,
    timeout: 30_000,
  },
  qwen: {
    name: 'qwen',
    model: 'qwen-max',
    maxRetries: 2,
    timeout: 30_000,
  },
  ollama: {
    name: 'ollama',
    model: 'llama3',
    baseUrl: 'http://localhost:11434',
    maxRetries: 1,
    timeout: 60_000,
  },
}

export const COOLDOWN_MS = 5 * 60 * 1000

export const MAX_CONSECUTIVE_FAILURES = 3

export const HEALTH_CHECK_TIMEOUT = 5_000

export const PIPELINE = {
  validate: true,
  normalize: true,
  deduplicateWindowMs: 60_000,
  imputeMaxGapMs: 300_000,
} as const
