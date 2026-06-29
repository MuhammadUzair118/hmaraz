'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Smartphone, Plus, X, Check, Loader2, Apple, Watch, Gauge, ExternalLink } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { api } from '@/lib/api'

const DEVICE_ICONS: Record<string, any> = {
  GOOGLE_HEALTH_CONNECT: Gauge,
  APPLE_HEALTH_KIT: Apple,
  FITBIT: Watch,
  GARMIN: Watch,
  SAMSUNG_HEALTH: Smartphone,
  HUAWEI_HEALTH: Smartphone,
  MANUAL: Smartphone,
}

const DEVICE_LABELS: Record<string, string> = {
  GOOGLE_HEALTH_CONNECT: 'Google Health Connect',
  APPLE_HEALTH_KIT: 'Apple Health',
  FITBIT: 'Fitbit',
  GARMIN: 'Garmin',
  SAMSUNG_HEALTH: 'Samsung Health',
  HUAWEI_HEALTH: 'Huawei Health',
  MANUAL: 'Manual Entry',
}

export default function DevicesPage() {
  const router = useRouter()
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showConnect, setShowConnect] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ deviceType: 'MANUAL', deviceName: '', externalId: '' })

  useEffect(() => {
    loadDevices()
    const params = new URLSearchParams(window.location.search)
    if (params.get('fitbit') === 'connected') setToast('Fitbit connected successfully!')
    else if (params.get('fitbit') === 'error') setToast('Failed to connect Fitbit. Try again.')
    if (params.get('fitbit')) window.history.replaceState({}, '', '/devices')
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 4000)
    return () => clearTimeout(t)
  }, [toast])

  async function loadDevices() {
    try {
      const data = await api.devices.list()
      setDevices(data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function handleConnect() {
    setConnecting(true)
    try {
      const device = await api.devices.connect(form)
      setDevices(prev => [device, ...prev])
      setShowConnect(false)
      setForm({ deviceType: 'MANUAL', deviceName: '', externalId: '' })
    } catch { /* ignore */ }
    setConnecting(false)
  }

  async function handleDisconnect(id: string) {
    try {
      await api.devices.disconnect(id)
      setDevices(prev => prev.filter(d => d.id !== id))
    } catch { /* ignore */ }
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted-gray">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-lg font-semibold text-dark-slate">Devices</h1>
        <button onClick={() => setShowConnect(true)} className="flex items-center gap-1 text-sm font-medium text-primary">
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="px-4 pb-24 pt-4">
        {toast && (
          <div className="mb-4 rounded-lg bg-success/10 px-4 py-3 text-center text-sm font-medium text-success">
            {toast}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-muted-gray" />
          </div>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Smartphone size={48} className="mb-4 text-muted-gray" />
            <p className="text-sm text-muted-gray">No devices connected</p>
            <button
              onClick={() => setShowConnect(true)}
              className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-medium text-white"
            >
              Connect a Device
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map((device: any) => {
              const Icon = DEVICE_ICONS[device.deviceType] ?? Smartphone
              return (
                <div key={device.id} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-dark-slate">{device.deviceName}</p>
                    <p className="text-xs text-muted-gray">{DEVICE_LABELS[device.deviceType] ?? device.deviceType}</p>
                    {device.lastSyncAt && (
                      <p className="text-[10px] text-muted-gray">
                        Last sync: {new Date(device.lastSyncAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex h-2 w-2 rounded-full ${device.isConnected ? 'bg-success' : 'bg-muted-gray'}`} />
                    <button
                      onClick={() => handleDisconnect(device.id)}
                      className="rounded-full p-1.5 text-muted-gray hover:bg-red-50 hover:text-danger"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {showConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-dark-slate">Connect Device</h2>
              <button onClick={() => setShowConnect(false)}><X size={20} className="text-muted-gray" /></button>
            </div>
            <div className="space-y-3">
              <select
                value={form.deviceType}
                onChange={(e) => setForm(prev => ({ ...prev, deviceType: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              >
                {Object.entries(DEVICE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              {form.deviceType === 'FITBIT' ? (
                <div className="rounded-lg bg-primary/5 p-4 text-center">
                  <Watch size={32} className="mx-auto mb-2 text-primary" />
                  <p className="mb-3 text-sm text-dark-slate">
                    Connect your Fitbit account with one click. You'll be redirected to Fitbit to authorize access.
                  </p>
                  <a
                    href="/api/devices/fitbit/auth"
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
                  >
                    <ExternalLink size={16} />
                    Connect with Fitbit
                  </a>
                </div>
              ) : (
                <>
                  <input
                    value={form.deviceName}
                    onChange={(e) => setForm(prev => ({ ...prev, deviceName: e.target.value }))}
                    placeholder="Device name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                  <input
                    value={form.externalId}
                    onChange={(e) => setForm(prev => ({ ...prev, externalId: e.target.value }))}
                    placeholder="Device ID or serial number"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                  <button
                    onClick={handleConnect}
                    disabled={connecting || !form.deviceName || !form.externalId}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {connecting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    {connecting ? 'Connecting...' : 'Connect'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
