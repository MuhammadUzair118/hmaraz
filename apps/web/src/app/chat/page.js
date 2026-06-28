"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ChatPage;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const BottomNav_1 = __importDefault(require("@/components/BottomNav"));
function ChatPage() {
    const [messages, setMessages] = (0, react_1.useState)([
        { role: 'assistant', content: "Hello! I'm your Hamraz AI health companion. How are you feeling today?" },
    ]);
    const [input, setInput] = (0, react_1.useState)('');
    const [isStreaming, setIsStreaming] = (0, react_1.useState)(false);
    const bottomRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    const handleSend = async () => {
        if (!input.trim() || isStreaming)
            return;
        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsStreaming(true);
        // Check for emergency keywords
        const lower = input.toLowerCase();
        const emergencyKeywords = ['chest pain', "can't breathe", 'cannot breathe', 'heart attack', 'stroke', 'unconscious', 'fainted', 'seizure'];
        if (emergencyKeywords.some(kw => lower.includes(kw))) {
            setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "🚨 **EMERGENCY ALERT**: Please call emergency services immediately:\n- 🇵🇰 Pakistan: **115**\n- International: **911**\n\nDo not wait — get help now.",
                    isEmergency: true,
                }]);
            setIsStreaming(false);
            return;
        }
        // Stream mock response (replace with actual SSE when AI service is running)
        const mockResponses = [
            "Based on your recent health data, your vitals are looking **generally stable**. Your heart rate has been within your normal range today.\n\n**Recommendation:** Keep up your hydration — aim for 8 glasses of water today.",
            "I can see from your health timeline that your sleep patterns have been inconsistent this week. Poor sleep can affect HRV and immune function.\n\n**Recommendation:** Try to establish a consistent sleep schedule.",
            "Looking at your data, I notice you haven't logged vitals in the last 24 hours. Regular check-ins help me give you more accurate insights.\n\n**Recommendation:** Do a quick health check-in now.",
        ];
        setTimeout(() => {
            const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            setIsStreaming(false);
        }, 1000);
    };
    return (<div className="mx-auto flex min-h-screen max-w-lg flex-col bg-bg">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
        <lucide_react_1.MessageCircle size={20} className="text-sky-accent"/>
        <h1 className="text-lg font-semibold text-dark-slate">AI Health Agent</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                ? 'bg-primary text-white'
                : msg.isEmergency
                    ? 'border border-danger bg-red-50 text-danger'
                    : 'bg-white shadow-sm text-dark-slate'}`}>
              {msg.isEmergency && (<div className="mb-1 flex items-center gap-1 text-xs font-bold uppercase">
                  <lucide_react_1.TriangleAlert size={14}/>
                  Emergency
                </div>)}
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>))}
        {isStreaming && (<div className="flex justify-start">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <span className="animate-pulse text-sm text-muted-gray">Thinking...</span>
            </div>
          </div>)}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask about your health..." className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" disabled={isStreaming}/>
          <button onClick={handleSend} disabled={!input.trim() || isStreaming} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90 disabled:opacity-50">
            <lucide_react_1.Send size={18}/>
          </button>
        </div>
      </div>

      <BottomNav_1.default />
    </div>);
}
//# sourceMappingURL=page.js.map