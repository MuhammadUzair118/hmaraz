'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle, TriangleAlert, Loader2 } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { api } from '@/lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isEmergency?: boolean
  isError?: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your Hamraz AI health companion. How are you feeling today?" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Emergency keyword check (client-side, immediate)
    const lower = input.toLowerCase()
    const emergencyKeywords = ['chest pain', "can't breathe", 'cannot breathe', 'heart attack', 'stroke', 'unconscious', 'fainted', 'seizure']
    if (emergencyKeywords.some(kw => lower.includes(kw))) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "🚨 **EMERGENCY ALERT**: Please call emergency services immediately:\n- 🇵🇰 Pakistan: **115**\n- International: **911**\n\nDo not wait — get help now.",
        isEmergency: true,
      }])
      setLoading(false)
      return
    }

    try {
      const result = await api.agent.chat({ message: input, conversationId })
      setConversationId(result.conversationId)
      setMessages(prev => [...prev, { role: 'assistant', content: result.message }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isError: true,
      }])
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-bg">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
        <MessageCircle size={20} className="text-sky-accent" />
        <h1 className="text-lg font-semibold text-dark-slate">AI Health Agent</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-white'
                  : msg.isEmergency
                  ? 'border border-danger bg-red-50 text-danger'
                  : msg.isError
                  ? 'border border-gray-300 bg-gray-50 text-muted-gray'
                  : 'bg-white shadow-sm text-dark-slate'
              }`}
            >
              {msg.isEmergency && (
                <div className="mb-1 flex items-center gap-1 text-xs font-bold uppercase">
                  <TriangleAlert size={14} />
                  Emergency
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
              <Loader2 size={16} className="animate-spin text-muted-gray" />
              <span className="text-sm text-muted-gray">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your health..."
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
