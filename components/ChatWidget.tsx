'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'

interface Message {
  id: string
  sender: string
  text: string
  createdAt: string
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [unread, setUnread] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastCountRef = useRef(0)

  // Load conversationId từ localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('banhbao_chat_conv')
      if (saved) setConversationId(saved)
    } catch {}
  }, [])

  // Poll tin nhắn mỗi 3 giây
  useEffect(() => {
    if (!conversationId) return
    const poll = () => {
      fetch(`/api/chat?conversationId=${conversationId}`)
        .then(r => r.json())
        .then(data => {
          const msgs = data.messages || []
          setMessages(msgs)
          // Đếm unread khi widget đóng
          if (!open && msgs.length > lastCountRef.current) {
            const newMsgs = msgs.slice(lastCountRef.current)
            const adminMsgs = newMsgs.filter((m: Message) => m.sender === 'admin')
            if (adminMsgs.length > 0) setUnread(prev => prev + adminMsgs.length)
          }
        })
        .catch(() => {})
    }
    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [conversationId, open])

  // Scroll to bottom
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setUnread(0)
      lastCountRef.current = messages.length
    }
  }, [messages, open])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, text }),
      })
      const data = await res.json()
      if (data.conversationId) {
        setConversationId(data.conversationId)
        try { localStorage.setItem('banhbao_chat_conv', data.conversationId) } catch {}
      }
      if (data.message) {
        setMessages(prev => [...prev, data.message])
      }
    } catch {}
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Nút Zalo góc trái */}
      <a href="https://zalo.me/0389839161" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2.5 rounded-full shadow-lg transition-colors text-sm font-semibold">
        💬 Zalo
      </a>

      {/* Chat widget góc phải */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛍️</span>
                  <div>
                    <p className="text-white font-bold text-sm">BanhBao Shop</p>
                    <p className="text-white/70 text-xs">Chat trực tiếp</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <p className="text-2xl mb-2">👋</p>
                    <p>Xin chào! Bạn cần hỗ trợ gì?</p>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'guest' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      msg.sender === 'guest'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t bg-white flex-shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-pink-400"
                  />
                  <button onClick={handleSend} disabled={!input.trim() || sending}
                    className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl disabled:opacity-40">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(!open)}
          className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white relative"
        >
          {open ? <X size={24} /> : <MessageCircle size={24} />}
          {!open && unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
          {!open && unread === 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white">
              <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
            </span>
          )}
        </motion.button>
      </div>
    </>
  )
}
