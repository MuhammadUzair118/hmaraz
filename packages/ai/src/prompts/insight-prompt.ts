export const INSIGHT_PROMPTS = {
  daily: `Analyze this user's 24-hour health data and generate a concise daily health summary.

Vitals data:
{{vitals}}

Baselines:
{{baselines}}

Provide:
1. Key observations (1-2 sentences)
2. Notable changes from baseline
3. One actionable recommendation
4. Overall assessment (great/good/fair/needs attention)

Keep the response under 150 words. Use metric names and values where relevant.`,

  weekly: `Analyze this user's 7-day health trends and generate a weekly summary.

Weekly vitals:
{{vitals}}

Baselines:
{{baselines}}

Provide:
1. Weekly trend overview
2. Notable patterns or improvements
3. Areas needing attention
4. Recommendation for next week

Keep the response under 200 words. Highlight week-over-week changes.`,

  monthly: `Generate a comprehensive monthly health report.

Monthly vitals:
{{vitals}}

Baselines:
{{baselines}}

Provide:
1. Overall health trajectory
2. Key metrics summary (average, min, max, trend)
3. Significant events or anomalies
4. Progress toward health goals
5. Recommendations for next month

Keep the response under 300 words. Include specific data points.`,
}
