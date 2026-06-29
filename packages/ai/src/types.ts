export type Role = 'user' | 'assistant' | 'system'

export interface Message {
  role: Role
  content: string
  timestamp?: number
}

export type VitalMetric =
  | 'heart_rate'
  | 'spo2'
  | 'temperature'
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'respiratory_rate'
  | 'steps'
  | 'calories'
  | 'sleep_hours'
  | 'hrv'
  | 'glucose'
  | 'weight'

export interface VitalRecord {
  id?: string
  userId: string
  metric: VitalMetric
  value: number
  unit: string
  timestamp: string | Date
  source?: string
}

export interface Baseline {
  metric: VitalMetric
  mean: number
  stdDev: number
  min: number
  max: number
  sampleSize: number
  lastComputed: string
}

export interface AnomalyResult {
  detected: boolean
  metric: VitalMetric
  value: number
  zScore: number
  severity: 'low' | 'moderate' | 'high'
  explanation?: string
  baseline?: Baseline
}

export interface Insight {
  id?: string
  userId: string
  type: 'daily' | 'weekly' | 'monthly' | 'anomaly' | 'trend' | 'achievement'
  title: string
  summary: string
  detail?: string
  severity?: 'info' | 'warning' | 'critical'
  timestamp: string | Date
  read?: boolean
  dismissed?: boolean
}

export type AIProviderName = 'gemini' | 'deepseek' | 'qwen' | 'ollama'

export interface AIProviderConfig {
  name: AIProviderName
  apiKey?: string
  baseUrl?: string
  model?: string
  maxRetries?: number
  timeout?: number
}

export interface CompletionRequest {
  messages: Message[]
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface CompletionResponse {
  content: string
  finishReason?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface HealthStatus {
  healthy: boolean
  provider: AIProviderName
  latency: number
  lastChecked: string
  consecutiveFailures: number
  cooldownUntil: string | null
}

export interface PipelineResult<T> {
  success: boolean
  data?: T
  error?: string
  warnings?: string[]
}

export interface ChatSession {
  id: string
  userId: string
  messages: Message[]
  context?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}
