export const ANOMALY_PROMPT = `Explain the following health anomaly detected in the user's data.

Metric: {{metric}}
Current value: {{value}}
Z-score: {{zScore}} (how many standard deviations from baseline)
Severity: {{severity}}

Baseline data:
{{baseline}}

Recent readings:
{{recent}}

Provide a brief explanation (2-3 sentences):
1. What this value means
2. Possible benign causes (activity, time of day, recent meals, stress)
3. Whether the user should monitor or consult a doctor`
