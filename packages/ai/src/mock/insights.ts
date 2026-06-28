import type { Insight, VitalRecord, Baseline } from '../types'

export function mockDailyInsight(
  _vitals: VitalRecord[],
  _baselines: Baseline[]
): Insight {
  return {
    userId: 'mock-user',
    type: 'daily',
    title: 'Daily Health Summary',
    summary: 'Your vitals look great today. Heart rate is steady at 72 bpm, SpO2 at 98%, and you\'re on track for 10,000 steps. Your HRV is 12% above baseline — excellent recovery quality.',
    severity: 'info',
    timestamp: new Date().toISOString(),
  }
}

export function mockWeeklyInsight(): Insight {
  return {
    userId: 'mock-user',
    type: 'weekly',
    title: 'Weekly Health Trend',
    summary: 'This week showed consistent improvement in sleep duration (+45 min avg) and HRV (+8%). Your step count averaged 8,500/day. One elevated heart rate episode on Tuesday evening resolved within 30 minutes.',
    severity: 'info',
    timestamp: new Date().toISOString(),
  }
}

export function mockMonthlyInsight(): Insight {
  return {
    userId: 'mock-user',
    type: 'monthly',
    title: 'Monthly Health Report',
    summary: 'This month: Sleep quality improved 15%. Resting heart rate dropped 3 bpm. Daily step average increased 12%. Two minor anomalies detected (both resolved). Overall trend: positive.',
    severity: 'info',
    timestamp: new Date().toISOString(),
  }
}
