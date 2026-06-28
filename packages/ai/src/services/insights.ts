import type { Insight, VitalRecord, Baseline } from '../types'
import { INSIGHT_PROMPTS } from '../prompts/insight-prompt'
import { FallbackProvider } from '../providers/fallback'

export class InsightsService {
  private fallback: FallbackProvider

  constructor(fallback: FallbackProvider) {
    this.fallback = fallback
  }

  async generateDailyInsight(
    userId: string,
    vitals: VitalRecord[],
    baselines: Baseline[]
  ): Promise<Insight> {
    const prompt = INSIGHT_PROMPTS.daily
      .replace('{{vitals}}', JSON.stringify(vitals, null, 2))
      .replace('{{baselines}}', JSON.stringify(baselines, null, 2))

    const response = await this.fallback.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      maxTokens: 512,
    })

    return {
      userId,
      type: 'daily',
      title: 'Daily Health Summary',
      summary: response.content,
      timestamp: new Date().toISOString(),
    }
  }

  async generateWeeklyInsight(
    userId: string,
    vitals: VitalRecord[],
    baselines: Baseline[]
  ): Promise<Insight> {
    const prompt = INSIGHT_PROMPTS.weekly
      .replace('{{vitals}}', JSON.stringify(vitals, null, 2))
      .replace('{{baselines}}', JSON.stringify(baselines, null, 2))

    const response = await this.fallback.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      maxTokens: 512,
    })

    return {
      userId,
      type: 'weekly',
      title: 'Weekly Health Trend',
      summary: response.content,
      timestamp: new Date().toISOString(),
    }
  }

  async generateMonthlyInsight(
    userId: string,
    vitals: VitalRecord[],
    baselines: Baseline[]
  ): Promise<Insight> {
    const prompt = INSIGHT_PROMPTS.monthly
      .replace('{{vitals}}', JSON.stringify(vitals, null, 2))
      .replace('{{baselines}}', JSON.stringify(baselines, null, 2))

    const response = await this.fallback.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      maxTokens: 512,
    })

    return {
      userId,
      type: 'monthly',
      title: 'Monthly Health Report',
      summary: response.content,
      timestamp: new Date().toISOString(),
    }
  }
}
