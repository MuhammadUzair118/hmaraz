import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hamraz — Your AI Health Companion',
  description: 'Personalized AI-powered health monitoring and wellness management.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg antialiased">
        {children}
      </body>
    </html>
  )
}
