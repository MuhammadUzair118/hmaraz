'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Heart, TrendingUp, MessageCircle } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/vitals', label: 'Vitals', icon: Heart },
  { href: '/trends', label: 'Trends', icon: TrendingUp },
  { href: '/chat', label: 'AI Chat', icon: MessageCircle },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-2 pb-2 pt-1">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-gray hover:text-dark-slate'
              }`}
            >
              <Icon size={22} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
