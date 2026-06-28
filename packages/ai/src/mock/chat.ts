import type { Message } from '../types'

const MOCK_RESPONSES = [
  "Your heart rate has been steady at 68-72 bpm today — well within your healthy range.",
  "I notice your sleep duration dropped to 5.2 hours last night, below your 7-hour baseline. Try a consistent bedtime routine.",
  "Your HRV is 12% above your baseline today. Great recovery — good day for exercise.",
  "SpO2 at 98% looks excellent. Your respiratory rate of 14 breaths/min is normal.",
  "You've taken 6,842 steps so far. At this pace, you'll hit 10,000 by evening.",
  "Your blood pressure reading of 118/76 is optimal. Keep up the good habits.",
  "I see you've been sedentary for the past 2 hours. A short walk could help reset your focus.",
  "Based on your trends, your energy typically dips around 3 PM. Consider a light snack or stretch break.",
]

export async function* mockChatStream(
  _messages: Message[]
): AsyncIterable<string> {
  const response = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)]
  const words = response.split(' ')

  for (const word of words) {
    yield word + ' '
    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50))
  }
}

export async function mockChatComplete(
  _messages: Message[]
): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)]
}
