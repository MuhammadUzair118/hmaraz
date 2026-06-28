import type { HealthStatus, AIProviderName } from '../types'
import { COOLDOWN_MS, MAX_CONSECUTIVE_FAILURES, HEALTH_CHECK_TIMEOUT } from '../config'

export class ProviderHealthRegistry {
  private statuses = new Map<AIProviderName, HealthStatus>()

  get(name: AIProviderName): HealthStatus {
    let status = this.statuses.get(name)
    if (!status) {
      status = {
        healthy: true,
        provider: name,
        latency: 0,
        lastChecked: new Date().toISOString(),
        consecutiveFailures: 0,
        cooldownUntil: null,
      }
      this.statuses.set(name, status)
    }
    return status
  }

  recordSuccess(name: AIProviderName, latency: number): void {
    this.statuses.set(name, {
      healthy: true,
      provider: name,
      latency,
      lastChecked: new Date().toISOString(),
      consecutiveFailures: 0,
      cooldownUntil: null,
    })
  }

  recordFailure(name: AIProviderName): void {
    const current = this.get(name)
    const failures = current.consecutiveFailures + 1
    const shouldCooldown = failures >= MAX_CONSECUTIVE_FAILURES

    this.statuses.set(name, {
      ...current,
      healthy: !shouldCooldown,
      consecutiveFailures: failures,
      lastChecked: new Date().toISOString(),
      cooldownUntil: shouldCooldown
        ? new Date(Date.now() + COOLDOWN_MS).toISOString()
        : current.cooldownUntil,
    })
  }

  isAvailable(name: AIProviderName): boolean {
    const status = this.get(name)
    if (!status.healthy) {
      if (status.cooldownUntil && new Date(status.cooldownUntil) > new Date()) {
        return false
      }
      this.statuses.set(name, { ...status, healthy: true, cooldownUntil: null, consecutiveFailures: 0 })
      return true
    }
    return true
  }

  async check(name: AIProviderName, healthFn: () => Promise<boolean>): Promise<HealthStatus> {
    const start = Date.now()
    try {
      const ok = await withTimeout(healthFn(), HEALTH_CHECK_TIMEOUT)
      if (ok) {
        this.recordSuccess(name, Date.now() - start)
      } else {
        this.recordFailure(name)
      }
    } catch {
      this.recordFailure(name)
    }
    return this.get(name)
  }

  getAll(): Map<AIProviderName, HealthStatus> {
    return new Map(this.statuses)
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Health check timed out')), ms)
  )
  return Promise.race([promise, timeout])
}
