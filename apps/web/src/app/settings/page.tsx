'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Settings, Moon, Sun, Ruler, Database, Cpu, RefreshCw, Bell, Save, Loader2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { api, type UserSettings } from '@/lib/api'

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Settings },
]

const MEASUREMENTS = [
  { value: 'metric', label: 'Metric (kg, cm, °C)' },
  { value: 'imperial', label: 'Imperial (lb, in, °F)' },
]

const AI_PROVIDERS = [
  { value: 'gemini', label: 'Gemini' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'ollama', label: 'Local (Ollama)' },
]

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const data = await api.settings.get()
      setSettings(data as UserSettings)
    } catch {
      setSettings(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(update: Partial<UserSettings>) {
    if (!settings) return
    const merged = { ...settings, ...update }
    setSettings(merged)
    setSaving(true)
    setSaved(false)
    try {
      await api.settings.update(update)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { /* silent */ }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-bg px-4">
        <Loader2 size={24} className="animate-spin text-muted-gray" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-bg px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted-gray">
          <ArrowLeft size={16} /> Back
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <Save size={14} /> Saved
          </span>
        )}
      </div>

      <h1 className="mb-6 text-xl font-bold text-dark-slate">Settings</h1>

      <div className="flex-1 space-y-6 pb-24">
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-gray">
            <Moon size={16} /> Appearance
          </h2>
          <div className="flex gap-2">
            {THEMES.map(t => {
              const Icon = t.icon
              const active = (settings?.theme ?? 'light') === t.value
              return (
                <button
                  key={t.value}
                  onClick={() => handleUpdate({ theme: t.value })}
                  disabled={saving}
                  className={`flex flex-1 flex-col items-center gap-2 rounded-xl border p-4 text-sm transition ${
                    active ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-muted-gray'
                  }`}
                >
                  <Icon size={24} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-gray">
            <Ruler size={16} /> Units
          </h2>
          <div className="space-y-2">
            {MEASUREMENTS.map(m => (
              <button
                key={m.value}
                onClick={() => handleUpdate({ measurementSystem: m.value })}
                disabled={saving}
                className={`flex w-full items-center rounded-xl border p-3 text-sm transition ${
                  (settings?.measurementSystem ?? 'metric') === m.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-100 text-dark-slate'
                }`}
              >
                <div className={`mr-3 h-4 w-4 rounded-full border-2 ${(settings?.measurementSystem ?? 'metric') === m.value ? 'border-primary bg-primary' : 'border-gray-300'}`} />
                {m.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-gray">
            <Cpu size={16} /> AI Provider
          </h2>
          <select
            value={settings?.aiProvider ?? 'gemini'}
            onChange={e => handleUpdate({ aiProvider: e.target.value })}
            disabled={saving}
            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-dark-slate"
          >
            {AI_PROVIDERS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-gray">
            <RefreshCw size={16} /> Insight Frequency
          </h2>
          <div className="flex gap-2">
            {FREQUENCIES.map(f => (
              <button
                key={f.value}
                onClick={() => handleUpdate({ insightFrequency: f.value })}
                disabled={saving}
                className={`flex flex-1 rounded-xl border py-2.5 text-sm transition ${
                  (settings?.insightFrequency ?? 'daily') === f.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-100 text-muted-gray'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-gray">
            <Database size={16} /> Data & Privacy
          </h2>
          <div className="space-y-3 rounded-xl border border-gray-100 p-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-dark-slate">Allow data collection</span>
              <button
                onClick={() => handleUpdate({ dataCollectionEnabled: !(settings?.dataCollectionEnabled ?? true) })}
                disabled={saving}
                className={`h-6 w-11 rounded-full transition ${settings?.dataCollectionEnabled ?? true ? 'bg-primary' : 'bg-gray-300'}`}
              >
                <div className={`h-5 w-5 rounded-full bg-white shadow transition ${settings?.dataCollectionEnabled ?? true ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
              </button>
            </label>
            <p className="text-xs text-muted-gray">Required for AI insights and anomaly detection to work.</p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-gray">
            <RefreshCw size={16} /> Sync
          </h2>
          <div className="space-y-3 rounded-xl border border-gray-100 p-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-dark-slate">Auto-sync wearables</span>
              <button
                onClick={() => handleUpdate({ wearableAutoSync: !(settings?.wearableAutoSync ?? true) })}
                disabled={saving}
                className={`h-6 w-11 rounded-full transition ${settings?.wearableAutoSync ?? true ? 'bg-primary' : 'bg-gray-300'}`}
              >
                <div className={`h-5 w-5 rounded-full bg-white shadow transition ${settings?.wearableAutoSync ?? true ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
              </button>
            </label>
            <p className="text-xs text-muted-gray">Automatically sync data from connected wearable devices.</p>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
