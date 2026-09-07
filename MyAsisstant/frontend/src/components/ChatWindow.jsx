import { useState, useRef, useEffect } from 'react'
import { CheckCircle2, Send, Menu } from 'lucide-react'
import Message from './Message'

export default function ChatWindow({ messages, isLoading, error, onSend, onMenuToggle }) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    onSend(input.trim())
    setInput('')
  }

  const suggestions = [
    "What's his tech stack?",
    'Recent projects?',
    'Open to new roles?',
  ]

  return (
    <div className="flex-1 flex flex-col h-full bg-navy-950 min-w-0">
      {/* Chat Header */}
      <div className="px-4 sm:px-7 py-4 sm:py-5 border-b border-navy-700/40 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuToggle}
              className="w-9 h-9 rounded-lg bg-navy-800/60 border border-navy-700/50 flex items-center justify-center text-navy-400 hover:text-white hover:border-navy-600 transition-colors lg:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-[17px] sm:text-[20px] font-bold text-white tracking-tight">
                Ask about Sudipto
              </h2>
              <p className="text-[9px] sm:text-[11px] font-medium tracking-[1.5px] text-navy-400 uppercase mt-0.5 sm:mt-1">
                Resume-Grounded · No Hallucination
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-7 py-5 sm:py-6 min-h-0">
        {messages.length === 0 && !isLoading && (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Welcome Message */}
            <div className="max-w-full sm:max-w-[520px]">
              <div className="p-4 sm:p-5 rounded-2xl bg-navy-800/50 border border-navy-700/40">
                <p className="text-[13px] sm:text-[15px] text-navy-100 leading-relaxed">
                  Hi, I'm Sudipto's AI assistant. Ask me about his experience, projects, or skills — I'll answer straight from his resume.
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-2.5 sm:mt-3 ml-1">
                <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gold-500" strokeWidth={2.5} />
                <span className="text-[9px] sm:text-[11px] font-semibold tracking-[1.5px] text-gold-500/80 uppercase">
                  Verified
                </span>
              </div>
            </div>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-2 sm:gap-2.5 pt-3 sm:pt-4">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); inputRef.current?.focus() }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-navy-800/60 border border-navy-600/40 text-[12px] sm:text-[13px] font-medium text-navy-300 hover:border-gold-500/40 hover:text-gold-300 hover:bg-navy-800 transition-all duration-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message List */}
        {messages.map((msg, i) => (
          <Message
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isNew={i === messages.length - 1 && msg.role === 'assistant'}
          />
        ))}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-navy-800/50 border border-navy-700/40">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gold-500 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-gold-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-gold-300 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] sm:text-[13px] mb-4">
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="px-4 sm:px-7 pb-4 sm:pb-6 pt-2 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2.5 sm:gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about Sudipto..."
            disabled={isLoading}
            className="flex-1 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-navy-800/50 border border-navy-600/40 text-[13px] sm:text-[14px] text-white placeholder:text-navy-400 outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all duration-200 disabled:opacity-40 min-w-0"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-[46px] sm:w-[50px] h-[46px] sm:h-[50px] rounded-xl bg-gold-500 hover:bg-gold-400 flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:hover:bg-gold-500 shrink-0 shadow-lg shadow-gold-500/20"
          >
            <Send className="w-[18px] sm:w-5 h-[18px] sm:h-5 text-navy-950 -translate-x-px" strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  )
}
