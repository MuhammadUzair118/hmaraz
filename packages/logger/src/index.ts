import pino from 'pino'

const level = process.env['LOG_LEVEL'] ?? 'debug'
const isDev = process.env['NODE_ENV'] !== 'production'

export const logger = pino({
  level,
  transport: isDev
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
    : undefined,
})

export default logger
