import { useState, useEffect, useRef } from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function Message({ role, content, isNew }) {
  const [displayed, setDisplayed] = useState(isNew ? '' : content)
  const [done, setDone] = useState(!isNew)
  const idx = useRef(0)

  useEffect(() => {
    if (!isNew || role !== 'assistant') {
      setDisplayed(content)
      setDone(true)
      return
    }

    idx.current = 0
    setDisplayed('')
    setDone(false)

    const interval = setInterval(() => {
      idx.current++
      if (idx.current <= content.length) {
        setDisplayed(content.slice(0, idx.current))
      } else {
        setDone(true)
        clearInterval(interval)
      }
    }, 16)

    return () => clearInterval(interval)
  }, [content, isNew, role])

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-3 sm:mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="max-w-[85%] sm:max-w-[75%] px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-navy-700/60 border border-navy-600/40 text-[13px] sm:text-[14px] text-white leading-relaxed rounded-br-md">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start mb-3 sm:mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="max-w-[85%] sm:max-w-[75%]">
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-navy-800/50 border border-navy-700/40 text-[13px] sm:text-[14px] text-navy-100 leading-relaxed rounded-bl-md">
          <p className="m-0 whitespace-pre-wrap break-words">
            {displayed}
            {!done && <span className="text-gold-400 animate-pulse ml-px font-light">|</span>}
          </p>
        </div>
        {done && (
          <div className="flex items-center gap-1.5 mt-1.5 sm:mt-2 ml-1">
            <CheckCircle2 className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-gold-500" strokeWidth={2.5} />
            <span className="text-[8px] sm:text-[10px] font-semibold tracking-[1.5px] text-gold-500/70 uppercase">
              Verified
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
