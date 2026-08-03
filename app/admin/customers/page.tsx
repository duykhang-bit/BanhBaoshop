'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Search, Key, Phone, Clock, CheckCircle, AlertCircle, ArrowLeft, Copy, Bell } from 'lucide-react'

interface Customer {
  id: string
  phone: string
  name: string
  address: string
  createdAt: string
}

interface ResetRequest {
  id: string
  phone: string
  userName: string
  status: string
  newPassword: string
  createdAt: string
}

export default function AdminCustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [resetRequests, setResetRequests] = useState<ResetRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'customers' | 'requests'>('customers')
  const [resetResult, setResetResult] = useState<{ userId: string; password: string } | null>(null)
  const [resetting, setResetting] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { router.push('/admin/login'); return }
    fetchData(token)
  }, [router])

  const fetchData = async (token?: string) => {
    const t = token || localStorage.getItem('admin_token')
    if (!t) return

    try {
      const [custRes, reqRes] = await Promise.all([
        fetch('/api/admin/customers', { headers: { Authorization: `Bearer ${t}` } }),
        fetch('/api/admin/customers/reset-requests', { headers: { Authorization: `Bearer ${t}` } }),
      ])
      const custData = await custRes.json()
      const reqData = await reqRes.json()
      setCustomers(custData.users || [])
      setResetRequests(reqData.requests || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (userId: string, requestId?: string) => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    setResetting(userId)
    try {
      const res = await fetch('/api/admin/customers/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, requestId }),
      })
      const data = await res.json()
      if (res.ok) {
        setResetResult({ userId, password: data.newPassword })
        fetchData(token)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setResetting(null)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pendingRequests = resetRequests.filter(r => r.status === 'pending')
  const filteredCustomers = customers.filter(c =>
    c.phone.includes(search) || c.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">⏳ Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Users size={20} /> Quản lý khách hàng
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{customers.length} tài khoản</span>
            {pendingRequests.length > 0 && (
              <button onClick={() => setTab('requests')}
                className="relative bg-red-50 text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                <Bell size={14} /> {pendingRequests.length} yêu cầu reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('customers')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === 'customers' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}>
            👥 Khách hàng ({customers.length})
          </button>
          <button onClick={() => setTab('requests')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors relative ${
              tab === 'requests' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}>
            🔑 Yêu cầu reset ({pendingRequests.length})
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
          </button>
        </div>

        {/* CUSTOMERS TAB */}
        {tab === 'customers' && (
          <>
            {/* Search */}
            <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-2 mb-4 shadow-sm">
              <Search size={18} className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm theo SĐT hoặc tên..."
                className="flex-1 outline-none text-sm" />
            </div>

            {/* Customer list */}
            <div className="space-y-2">
              {filteredCustomers.map(customer => (
                <motion.div key={customer.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{customer.name || 'Chưa đặt tên'}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone size={12} /> {customer.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-gray-400">
                      {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                    <button
                      onClick={() => handleResetPassword(customer.id)}
                      disabled={resetting === customer.id}
                      className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-100 disabled:opacity-50 flex items-center gap-1"
                    >
                      <Key size={12} /> {resetting === customer.id ? '...' : 'Reset MK'}
                    </button>
                  </div>
                </motion.div>
              ))}
              {filteredCustomers.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-4xl mb-2">👥</p>
                  <p>Không tìm thấy khách hàng</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* RESET REQUESTS TAB */}
        {tab === 'requests' && (
          <div className="space-y-3">
            {resetRequests.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-2">✅</p>
                <p>Không có yêu cầu nào</p>
              </div>
            ) : (
              resetRequests.map(req => {
                const customer = customers.find(c => c.phone === req.phone)
                const isPending = req.status === 'pending'
                return (
                  <motion.div key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${isPending ? 'border-l-orange-400' : 'border-l-green-400'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800 text-sm flex items-center gap-2">
                          {isPending ? <AlertCircle size={14} className="text-orange-500" /> : <CheckCircle size={14} className="text-green-500" />}
                          {req.userName || req.phone}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Phone size={12} /> {req.phone}
                          <span className="mx-2">•</span>
                          <Clock size={12} /> {new Date(req.createdAt).toLocaleString('vi-VN')}
                        </p>
                        {req.status === 'done' && req.newPassword && (
                          <p className="text-xs mt-1 text-green-600 font-mono bg-green-50 px-2 py-1 rounded inline-block">
                            MK mới: {req.newPassword}
                          </p>
                        )}
                      </div>
                      {isPending && customer && (
                        <button
                          onClick={() => handleResetPassword(customer.id, req.id)}
                          disabled={resetting === customer.id}
                          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                        >
                          {resetting === customer.id ? '⏳' : '🔑 Reset ngay'}
                        </button>
                      )}
                      {isPending && !customer && (
                        <span className="text-xs text-red-500">SĐT chưa có tài khoản</span>
                      )}
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Reset result modal */}
      <AnimatePresence>
        {resetResult && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setResetResult(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <p className="text-4xl mb-3">🔑</p>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Mật khẩu mới</h3>
                <p className="text-sm text-gray-500 mb-4">Copy gửi cho khách hàng:</p>

                <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
                  <code className="text-lg font-bold text-purple-600">{resetResult.password}</code>
                  <button onClick={() => handleCopy(resetResult.password)}
                    className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 font-medium">
                    <Copy size={14} /> {copied ? 'Đã copy!' : 'Copy'}
                  </button>
                </div>

                <button onClick={() => setResetResult(null)}
                  className="mt-4 w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2.5 rounded-xl font-bold text-sm">
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
