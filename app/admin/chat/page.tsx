'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, MessageCircle, User, Phone, Clock } from 'lucide-react'

interface Conversation {
  id: string
  guestName: string
  guestPhone: string
  status: string
  lastMessage: string
  lastSender: string
  messageCount: number
  hasUnread: boolean
  updatedAt: string
  createdAt: string
}

interface Message {
  id: string
  sender: string
  text: string
  createdAt: string
}

export default function AdminChatPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { router.push('/admin/login'); return }
    fetchConversations(token)
    const interval = setInterval(() => fetchConversations(), 5000)
    return () => clearInterval(interval)
  }, [])

  // Poll messages cho conversation đang mở
  useEffect(() => {
    if (!selectedConv) return
    fetchMessages(selectedConv)
    const interval = setInterval(() => fetchMessages(selectedConv), 3000)
    return () => clearInterval(interval)
  }, [selectedConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async (token?: string) => {
    const t = token || localStorage.getItem('admin_token')
    if (!t) return
    try {
      const res = await fetch('/api/admin/chat', { headers: { Authorization: `Bearer ${t}` } })
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch {}
    setLoading(false)
  }

  const fetchMessages = async (convId: string) => {
    const token = localStorage.getItem('admin_token')
    if (!token) return
    try {
      const res = await fetch(`/api/admin/chat?conversationId=${convId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setMessages(data.messages || [])
    } catch {}
  }

  const handleSend = async () => {
    if (!input.trim() || !selectedConv || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ conversationId: selectedConv, text }),
      })
      const data = await res.json()
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

  const unreadCount = conversations.filter(c => c.hasUnread).length

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">⏳ Đang tải...</p></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <MessageCircle size={20} /> Chat với khách
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount} mới</span>
              )}
            </h1>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        {/* Conversation list */}
        <div className={`w-full md:w-80 border-r bg-white overflow-y-auto ${selectedConv ? 'hidden md:block' : ''}`}>
          {conversations.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">💬</p>
              <p className="text-sm">Chưa có cuộc hội thoại nào</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button key={conv.id} onClick={() => setSelectedConv(conv.id)}
                className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition-colors ${
                  selectedConv === conv.id ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
                } ${conv.hasUnread ? 'bg-pink-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${conv.hasUnread ? 'bg-pink-200' : 'bg-gray-100'}`}>
                      👤
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        {conv.guestName || conv.guestPhone || 'Khách'}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[150px]">{conv.lastMessage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">
                      {new Date(conv.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {conv.hasUnread && <span className="w-2 h-2 bg-red-500 rounded-full inline-block mt-1" />}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Chat area */}
        <div className={`flex-1 flex flex-col ${!selectedConv ? 'hidden md:flex' : ''}`}>
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-4xl mb-2">💬</p>
                <p>Chọn cuộc hội thoại để xem</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedConv(null)} className="md:hidden text-gray-400">
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">
                      {conversations.find(c => c.id === selectedConv)?.guestName || 'Khách'}
                    </p>
                    {conversations.find(c => c.id === selectedConv)?.guestPhone && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone size={10} /> {conversations.find(c => c.id === selectedConv)?.guestPhone}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm('Xóa đoạn chat này?')) return
                    const token = localStorage.getItem('admin_token')
                    await fetch('/api/admin/chat', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ conversationId: selectedConv }),
                    })
                    setSelectedConv(null)
                    fetchConversations()
                  }}
                  className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50"
                >
                  🗑️ Xóa chat
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      msg.sender === 'admin'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                    }`}>
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === 'admin' ? 'text-white/60' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 bg-white border-t">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-400"
                  />
                  <button onClick={handleSend} disabled={!input.trim() || sending}
                    className="p-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl disabled:opacity-40">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
