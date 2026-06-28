'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function NotificationsPage() {
  const router = useRouter()

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-bg px-4 pt-6">
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-muted-gray">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="flex flex-1 flex-col items-center justify-center pb-24">
        <Bell size={48} className="mb-4 text-muted-gray" />
        <h1 className="text-xl font-bold text-dark-slate">Notifications</h1>
        <p className="mt-2 text-sm text-muted-gray">Coming soon</p>
      </div>
      <BottomNav />
    </div>
  )
}
