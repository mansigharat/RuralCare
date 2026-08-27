import { useState, useRef, useEffect } from 'react'
import { sendAssistantMessage } from '../services/api'

const SUGGESTED_QUESTIONS = [
  'I have a fever — where should I go?',
  'Where can I find maternity services?',
  'My child needs vaccination — which facility?',
  'Is there a 24-hour emergency facility nearby?',
  'Where can I get TB treatment?',
  'How do I find available medicines?',
]

const INITIAL_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hello! I am the RuralCare AI Assistant. I can help you find the right type of government healthcare facility based on your needs, and provide general healthcare guidance.\n\nWhat healthcare help do you need today?',
  timestamp: new Date(),
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return
    const userMsg = { id: Date.now(), role: 'user', text: text.trim(), timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { response } = await sendAssistantMessage(text)
      const aiMsg = { id: Date.now() + 1, role: 'assistant', text: response, timestamp: new Date() }
      setMessages((prev) => [...prev, aiMsg])
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Sorry, I could not get a response right now. Please try again, or use the facility search to find a healthcare facility near you.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const formatTime = (date) =>
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col h-[calc(100vh-4.5rem)]">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            🤖
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">RuralCare AI Assistant</h1>
            <p className="text-sm text-slate-500">Get general healthcare guidance and find the right type of facility.</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Important Disclaimer:</strong> The AI Assistant provides general healthcare guidance and facility navigation only.
            It is <strong>not a doctor</strong> and does <strong>not provide medical diagnosis or treatment advice</strong>.
            For emergencies, call <strong>108</strong>.
          </p>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-card overflow-y-auto p-4 mb-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-0.5">
                🤖
              </div>
            )}
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'ml-auto' : ''}`}>
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
              <p className={`text-[10px] text-slate-400 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0">
              🤖
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested questions (only show at start) */}
      {messages.length <= 1 && (
        <div className="mb-4 flex-shrink-0">
          <p className="text-xs text-slate-500 mb-2 font-medium">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs border border-slate-200 bg-white text-slate-700 px-3 py-1.5 rounded-full hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a symptom, facility type, or service..."
          disabled={loading}
          className="flex-1 text-sm border border-slate-200 rounded-xl px-4 py-3 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-60 shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-primary-600 text-white px-5 py-3 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-40 flex-shrink-0 shadow-sm"
          aria-label="Send message"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>

      {/* Footer note */}
      <p className="text-center text-xs text-slate-400 mt-3 flex-shrink-0">
        Responses are powered by AI and are for guidance only. Always consult a qualified doctor.
      </p>
    </div>
  )
}
