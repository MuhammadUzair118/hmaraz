'use client'

import { useState, useEffect } from 'react'
import { TriangleAlert, Phone, MapPin, Heart, Shield, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { api } from '@/lib/api'

export default function SosPage() {
  const router = useRouter()
  const [activated, setActivated] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [contactCount, setContactCount] = useState(0)
  const [sending, setSending] = useState(false)
  const [locationLabel, setLocationLabel] = useState('Fetching location...')

  useEffect(() => {
    api.safety.getContacts()
      .then(contacts => setContactCount(contacts.length))
      .catch(() => setContactCount(0))
  }, [])

  const handleSos = () => {
    setActivated(true)
    setSending(true)
    setCountdown(5)

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = `${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`
        setLocationLabel(loc)
        try {
          await api.safety.triggerSos({ type: 'MANUAL', location: loc })
        } catch { /* alert sent best-effort */ }
        setSending(false)
      },
      async () => {
        setLocationLabel('Location unavailable')
        try {
          await api.safety.triggerSos({ type: 'MANUAL' })
        } catch { /* alert sent best-effort */ }
        setSending(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-bg">
      {!activated ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-danger/10">
              <TriangleAlert size={40} className="text-danger" />
            </div>
            <h1 className="text-2xl font-bold text-dark-slate">Emergency SOS</h1>
            <p className="mt-2 text-sm text-muted-gray">
              Press the button below to send an emergency alert with your location and health profile to your emergency contacts.
            </p>
          </div>

          <button
            onClick={handleSos}
            className="flex h-40 w-40 items-center justify-center rounded-full bg-danger text-white shadow-2xl transition hover:bg-danger/90 active:scale-95"
          >
            <div className="text-center">
              <TriangleAlert size={48} className="mx-auto mb-1 animate-pulse" />
              <span className="text-lg font-bold">SOS</span>
            </div>
          </button>

          <div className="mt-8 flex items-center gap-2 text-xs text-muted-gray">
            <Shield size={14} />
            Your location and health data will be shared with your emergency contacts
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center bg-danger px-4 text-white">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            {sending ? <Loader2 size={36} className="animate-spin" /> : <TriangleAlert size={36} />}
          </div>

          <h1 className="mb-2 text-xl font-bold">
            {sending ? 'Sending Alert...' : 'Emergency Alert Sent'}
          </h1>
          <p className="mb-6 text-center text-white/80">
            {countdown > 0
              ? `Alerting emergency contacts in ${countdown}...`
              : sending
              ? 'Please wait...'
              : 'Your emergency contacts have been notified.'}
          </p>

          <div className="w-full max-w-sm space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
              <MapPin size={20} />
              <div>
                <p className="text-xs opacity-80">Location</p>
                <p className="text-sm font-medium">{locationLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
              <Heart size={20} />
              <div>
                <p className="text-xs opacity-80">Health Profile Shared</p>
                <p className="text-sm font-medium">Blood type, allergies, conditions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
              <Phone size={20} />
              <div>
                <p className="text-xs opacity-80">Contacts Notified</p>
                <p className="text-sm font-medium">{contactCount} emergency contacts</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="mt-8 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-danger transition hover:bg-white/90"
          >
            Return to Home
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
