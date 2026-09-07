import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import { useChat } from './hooks/useChat'
import './index.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sessionId] = useState(() => localStorage.getItem('sessionId') || (() => {
    const id = crypto.randomUUID()
    localStorage.setItem('sessionId', id)
    return id
  })())

  const { messages, isLoading, error, send } = useChat(sessionId)

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="flex h-screen w-screen bg-navy-950 text-white overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSend={send}
        onMenuToggle={toggleSidebar}
      />
    </div>
  )
}

export default App
