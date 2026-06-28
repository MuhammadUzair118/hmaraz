'use client'

import { useState, useEffect } from 'react'
import { User, Settings, Bell, Shield, ChevronRight, LogOut, Smartphone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { api } from '@/lib/api'
import { createClient } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const profile = await api.users.getMe()
        setUser({
          name: (profile.name as string) ?? '',
          email: (profile.email as string) ?? '',
          phone: (profile.phone as string) ?? '',
        })
      } catch { /* use defaults */ }
      setLoading(false)
    }
    load()
  }, [])

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    router.push('/signin')
    router.refresh()
  }

  const menuItems = [
    { icon: User, label: 'Health Profile', href: '/onboarding' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: Smartphone, label: 'Wearable Devices', href: '/devices' },
    { icon: Shield, label: 'Privacy & Security', href: '#' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      {/* Profile Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <User size={36} className="text-primary" />
        </div>
        {loading ? (
          <div className="flex justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-dark-slate">{user.name || 'User'}</h1>
            <p className="text-sm text-muted-gray">{user.email}</p>
            <p className="text-xs text-muted-gray">{user.phone}</p>
            <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Member
            </span>
          </>
        )}
      </div>

      {/* Menu */}
      <div className="space-y-1 rounded-xl bg-white shadow-sm">
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={() => item.href !== '#' && router.push(item.href)}
            className="flex w-full items-center justify-between px-4 py-3.5 transition hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className="text-muted-gray" />
              <span className="text-sm font-medium text-dark-slate">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-muted-gray" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleSignOut}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-medium text-danger shadow-sm transition hover:bg-red-50"
      >
        <LogOut size={18} />
        Sign Out
      </button>

      <BottomNav />
    </div>
  )
}
