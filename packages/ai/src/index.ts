// Types
export type {
  Role,
  Message,
  VitalMetric,
  VitalRecord,
  Baseline,
  AnomalyResult,
  Insight,
  AIProviderName,
  AIProviderConfig,
  CompletionRequest,
  CompletionResponse,
  HealthStatus,
  PipelineResult,
  ChatSession,
} from './types'

// Config
export {
  PROVIDER_PRIORITY,
  DEFAULT_PROVIDER,
  PROVIDER_DEFAULTS,
  COOLDOWN_MS,
  MAX_CONSECUTIVE_FAILURES,
  HEALTH_CHECK_TIMEOUT,
  PIPELINE,
} from './config'

// Providers
export { AIProvider } from './providers/base'
export { ProviderHealthRegistry } from './providers/health'
export { ProviderRegistry } from './providers/registry'
export { FallbackProvider } from './providers/fallback'
export { createProviderSuite } from './providers/factory'
export type { AIProviderSuite } from './providers/factory'
export { GeminiProvider } from './providers/gemini'
export { DeepSeekProvider } from './providers/deepseek'
export { QwenProvider } from './providers/qwen'
export { OllamaProvider } from './providers/ollama'

// Pipeline
export { validateVital, validateVitals } from './pipeline/validate'
export { normalizeVital, normalizeVitals } from './pipeline/normalize'
export { deduplicateVitals } from './pipeline/deduplicate'
export { imputeVitals } from './pipeline/impute'

// Services
export { ChatService } from './services/chat'
export { InsightsService } from './services/insights'
export { AnomalyService } from './services/anomaly'
export { BaselineService } from './services/baseline'
export { IngestService } from './services/ingest'
export type { IngestResult } from './services/ingest'

// Prompts
export { SYSTEM_PROMPT } from './prompts/system-prompt'
export { INSIGHT_PROMPTS } from './prompts/insight-prompt'
export { ANOMALY_PROMPT } from './prompts/anomaly-prompt'

// Mocks
export { mockChatStream, mockChatComplete } from './mock/chat'
export { mockDailyInsight, mockWeeklyInsight, mockMonthlyInsight } from './mock/insights'
export { mockAnomaly, mockAnomalyList, mockAnomalyExplanation } from './mock/anomaly'
