import { useState, useCallback } from 'react'
import { sendMessage } from '../utils/api'

export function useChat(sessionId) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const send = useCallback(async (question) => {
    if (!question.trim() || !sessionId) return

    const userMsg = { role: 'user', content: question, id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setError(null)

    try {
      const { answer } = await sendMessage(question, sessionId)
      const assistantMsg = { role: 'assistant', content: answer, id: Date.now() + 1 }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isLoading, error, send, clearMessages }
}
