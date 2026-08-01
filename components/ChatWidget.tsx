'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Phone, User, CheckCircle } from 'lucide-react'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.phone || !form.message) {
      setError('Vui lòng nhập số điện thoại và tin nhắn')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setSent(true)
      } else {
        setError('Gửi thất bại, thử lại sau')
      }
    } catch {
      setError('Lỗi kết nối, thử lại sau')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      setSent(false)
      setForm({ name: '', phone: '', message: '' })
      setError('')
    }, 300)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute bottom-16 right-0 w-80 bg-white rounded-3xl shadow-2xl overflow-hidden border border-pink-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                  🛍️
                </div>
                <div>
                  <p className="text-white font-bold text-sm">BanhBao Shop</p>
                  <p className="text-white/80 text-xs">Tư vấn miễn phí</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {!sent ? (
                <>
                  <p className="text-gray-600 text-sm mb-4">
                    Để lại số điện thoại, shop sẽ liên hệ tư vấn cho bạn sớm nhất! 💬
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-pink-400 transition-colors">
                      <User size={16} className="text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Tên của bạn (tùy chọn)"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
                      />
                    </div>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-pink-400 transition-colors">
                      <Phone size={16} className="text-gray-400 flex-shrink-0" />
                      <input
                        type="tel"
                        required
                        placeholder="Số điện thoại *"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
                      />
                    </div>
                    <div className="border border-gray-200 rounded-xl px-3 py-2 focus-within:border-pink-400 transition-colors">
                      <textarea
                        required
                        rows={3}
                        placeholder="Bạn cần tư vấn gì? *"
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        className="w-full outline-none text-sm text-gray-700 placeholder-gray-400 resize-none"
                      />
                    </div>
                    {error && <p className="text-red-500 text-xs">⚠️ {error}</p>}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Send size={16} />
                      {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                    </motion.button>
                  </form>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4">
                  <div className="text-5xl mb-3">✅</div>
                  <p className="font-bold text-green-600 text-lg mb-1">Gửi thành công!</p>
                  <p className="text-gray-500 text-sm mb-4">
                    Shop sẽ liên hệ với bạn qua số <strong className="text-pink-600">{form.phone}</strong> sớm nhất có thể!
                  </p>
                  <button onClick={handleClose}
                    className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-semibold">
                    Đóng
                  </button>
                </motion.div>
              )}
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
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Ping animation */}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white">
            <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
          </span>
        )}
      </motion.button>
    </div>
  )
}
