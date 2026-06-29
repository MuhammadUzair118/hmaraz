'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { api } from '@/lib/api'

const STEPS = [
  { id: 'goal', title: 'What brings you to Hamraz?', options: ['Monitor a health condition', 'Improve fitness', 'Track daily wellness', 'Understand my body better', 'Stay motivated and consistent'] },
  { id: 'age', title: 'What is your age?', input: 'number' },
  { id: 'sex', title: 'What is your biological sex?', options: ['Male', 'Female', 'Other', 'Prefer not to say'] },
  { id: 'height', title: 'What is your height?', input: 'height' },
  { id: 'weight', title: 'What is your weight?', input: 'weight' },
  { id: 'conditions', title: 'Any existing health conditions?', options: ['Diabetes', 'Hypertension', 'Heart disease', 'Asthma', 'None', 'Other'], multi: true },
  { id: 'wearable', title: 'Do you use a wearable device?', options: ['Apple Watch', 'Fitbit', 'Garmin', 'Samsung Galaxy Watch', 'None', 'Other'] },
  { id: 'done', title: "You're all set!", final: true },
]

const STORAGE_KEY = 'hamraz_onboarding'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setAnswers(parsed.answers ?? {})
        setStep(parsed.step ?? 0)
      } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, step }))
  }, [answers, step])

  const current = STEPS[step]

  const handleNext = () => {
    if (current.options && selectedOptions.length > 0) {
      setAnswers(prev => ({ ...prev, [current.id]: current.multi ? selectedOptions : selectedOptions[0] }))
      setSelectedOptions([])
    }
    if (current.input === 'number' || current.input === 'height' || current.input === 'weight') {
      // keep answers from input onChange
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    }
  }

  const handleFinish = async () => {
    try {
      const healthProfile = {
        goal: answers.goal || null,
        age: answers.age ? Number(answers.age) : null,
        conditions: answers.conditions || [],
        wearable: answers.wearable || null,
      }
      await api.users.updateMe({ ...answers, healthProfile, onboardingCompleted: true })
    } catch { /* save best-effort */ }
    localStorage.removeItem(STORAGE_KEY)
    router.push('/')
  }

  const handleSkip = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      setSelectedOptions([])
    }
  }

  const toggleOption = (opt: string) => {
    if (current.multi) {
      setSelectedOptions(prev =>
        prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
      )
    } else {
      setSelectedOptions([opt])
    }
  }

  if (current.final) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <Check size={40} className="text-success" />
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold text-dark-slate">{current.title}</h1>
        <p className="mb-8 text-center text-sm text-muted-gray">
          Your AI health agent is setting up your personal baseline. This will take about 7 days of monitoring.
        </p>
        <button
          onClick={handleFinish}
          className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg px-4">
      {/* Progress */}
      <div className="flex items-center gap-2 pt-6">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`h-1.5 flex-1 rounded-full transition ${
              i <= step ? 'bg-primary' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Back */}
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="mt-4 flex items-center gap-1 text-sm text-muted-gray">
          <ArrowLeft size={16} />
          Back
        </button>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center">
        <h2 className="mb-8 text-2xl font-bold text-dark-slate">{current.title}</h2>

        {current.options && (
          <div className="space-y-3">
            {current.options.map(opt => (
              <button
                key={opt}
                onClick={() => toggleOption(opt)}
                className={`w-full rounded-xl border-2 px-4 py-3.5 text-left text-sm font-medium transition ${
                  selectedOptions.includes(opt)
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 bg-white text-dark-slate hover:border-gray-300'
                } ${current.multi && selectedOptions.includes(opt) ? 'ring-2 ring-primary/20' : ''}`}
              >
                {opt}
                {current.multi && selectedOptions.includes(opt) && (
                  <Check size={16} className="float-right mt-0.5 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}

        {(current.input === 'number' || current.input === 'height' || current.input === 'weight') && (
          <input
            type="number"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg focus:border-primary focus:outline-none"
            placeholder={current.input === 'number' ? 'Enter your age' : `Enter your ${current.input}`}
            onChange={(e) => setAnswers(prev => ({ ...prev, [current.id]: e.target.value }))}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pb-8">
        <button onClick={handleSkip} className="text-sm text-muted-gray hover:text-dark-slate">
          Skip
        </button>
        <button
          onClick={handleNext}
          disabled={current.options && selectedOptions.length === 0}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
        >
          {step === STEPS.length - 2 ? 'Finish' : 'Next'}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
