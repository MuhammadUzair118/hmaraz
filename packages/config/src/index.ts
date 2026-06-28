import dotenv from 'dotenv'
dotenv.config()

export const API_PORT = parseInt(process.env['API_PORT'] ?? '4000', 10)

export const PORTS = {
  api: API_PORT,
  web: parseInt(process.env['PORT'] ?? '3000', 10),
  aiEngine: parseInt(process.env['AI_ENGINE_PORT'] ?? '8000', 10),
} as const

export const JWT_SECRET = process.env['JWT_SECRET'] ?? 'hamraz-dev-jwt-secret-change-in-production'

export const SUPABASE_URL = process.env['SUPABASE_URL'] ?? ''
export const SUPABASE_ANON_KEY = process.env['SUPABASE_ANON_KEY'] ?? ''
export const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? ''

export const ALLOWED_ORIGINS = (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:3000').split(',')

export const NODE_ENV = process.env['NODE_ENV'] ?? 'development'
export const LOG_LEVEL = process.env['LOG_LEVEL'] ?? 'debug'
export const IS_DEV = NODE_ENV !== 'production'

export const AI_CONFIG = {
  defaultProvider: process.env['AI_DEFAULT_PROVIDER'] ?? 'gemini',
  geminiApiKey: process.env['GEMINI_API_KEY'] ?? '',
  deepseekApiKey: process.env['DEEPSEEK_API_KEY'] ?? '',
  qwenApiKey: process.env['QWEN_API_KEY'] ?? '',
  ollamaBaseUrl: process.env['OLLAMA_BASE_URL'] ?? 'http://localhost:11434',
}

export const WEARABLE_CONFIG = {
  googleHealthConnect: {
    clientId: process.env['GOOGLE_HEALTH_CONNECT_CLIENT_ID'] ?? '',
    clientSecret: process.env['GOOGLE_HEALTH_CONNECT_CLIENT_SECRET'] ?? '',
  },
  fitbit: {
    clientId: process.env['FITBIT_CLIENT_ID'] ?? '',
    clientSecret: process.env['FITBIT_CLIENT_SECRET'] ?? '',
  },
}
