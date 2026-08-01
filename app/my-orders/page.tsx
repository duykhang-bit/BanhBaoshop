'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Phone, Search, ShoppingBag, Clock, CheckCircle, XCircle, Truck, CreditCard, Wallet, Tag, ArrowLeft, PackageX } from 'lucide-react'

interface OrderItem {
  id: string
  productName: string
  price: number
  quantity: number
}

interface Order {
  id: string
  customerName: string
  customerPhone: string
  customerAddress: string
  note: string
  paymentMethod: string
  status: string
  totalAmount: number
  discountCode: string
  discountAmount: number
  items: OrderItem[]
  createdAt: string
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:          { label: 'Chờ xử lý',        color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock },
  awaiting_payment: { label: 'Chờ xác nhận CK',   color: 'text-orange-700', bg: 'bg-orange-100', icon: Clock },
  confirmed:        { label: 'Đã xác nhận',        color: 'text-blue-700',   bg: 'bg-blue-100',   icon: CheckCircle },
  shipping:         { label: 'Đang giao hàng',     color: 'text-purple-700', bg: 'bg-purple-100', icon: Truck },
  completed:        { label: 'Hoàn thành',         color: 'text-green-700',  bg: 'bg-green-100',  icon: CheckCircle },
  cancelled:        { label: 'Đã huỷ',             color: 'text-red-700',    bg: 'bg-red-100',    icon: XCircle },
}

export default function MyOrdersPage() {
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const router = useRouter()

  const handleSearch = async () => {
    if (!phone.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/by-phone?phone=${encodeURIComponent(phone.trim())}`)
      const data = await res.json()
      setOrders(data.orders || [])
      setSearched(true)
    } catch {
      setOrders([])
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (orderId: string) => {
    if (!confirm('Bạn có chắc muốn huỷ đơn hàng này?')) return
    setCancellingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o))
      } else {
        alert(data.error || 'Không thể huỷ đơn')
      }
    } catch {
      alert('Lỗi kết nối, thử lại sau')
    } finally {
      setCancellingId(null)
    }
  }

  const canCancel = (status: string) => ['pending', 'awaiting_payment'].includes(status)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 50%, #eff6ff 100%)' }}>
      {/* Header */}
      <motion.header initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-pink-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/">
            <motion.button whileHover={{ x: -3 }} className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors">
              <ArrowLeft size={20} />
            </motion.button>
          </Link>
          <Link href="/">
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              BanhBao Shop
            </span>
          </Link>
        </div>
      </motion.header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="text-5xl mb-3">📦</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tra Cứu Đơn Hàng</h1>
          <p className="text-gray-500">Nhập số điện thoại để xem tất cả đơn hàng của bạn</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-3 border-2 border-gray-200 focus-within:border-pink-400 rounded-xl px-4 py-3 transition-colors">
              <Phone size={20} className="text-gray-400 flex-shrink-0" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Nhập số điện thoại đặt hàng..."
                className="flex-1 outline-none text-gray-800 placeholder-gray-400"
              />
            </div>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleSearch} disabled={loading || !phone.trim()}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold shadow-md disabled:opacity-50 flex items-center gap-2">
              <Search size={18} />
              {loading ? 'Đang tìm...' : 'Tìm'}
            </motion.button>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {searched && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy đơn hàng</p>
                  <p className="text-gray-500 text-sm">Kiểm tra lại số điện thoại bạn đã dùng khi đặt hàng</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600 font-medium mb-2">Tìm thấy <span className="text-pink-600 font-bold">{orders.length}</span> đơn hàng</p>
                  {orders.map((order, i) => {
                    const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending
                    const StatusIcon = statusInfo.icon

                    return (
                      <motion.div key={order.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="bg-white rounded-2xl shadow-lg p-5">

                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-bold text-gray-800 text-lg">#{order.id.substring(0, 8).toUpperCase()}</p>
                            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                              <StatusIcon size={14} />
                              {statusInfo.label}
                            </span>
                            <p className="text-lg font-bold text-pink-600 mt-1">{order.totalAmount.toLocaleString()}₫</p>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-1 mb-3 pb-3 border-b border-gray-100">
                          {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-700">{item.productName} x{item.quantity}</span>
                              <span className="font-medium">{(item.price * item.quantity).toLocaleString()}₫</span>
                            </div>
                          ))}
                        </div>

                        {/* Discount */}
                        {order.discountCode && order.discountAmount > 0 && (
                          <div className="flex items-center justify-between text-sm text-green-600 mb-3">
                            <span className="flex items-center gap-1"><Tag size={14} /> Mã <strong>{order.discountCode}</strong></span>
                            <span>-{order.discountAmount.toLocaleString()}₫</span>
                          </div>
                        )}

                        {/* Payment + Address */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            {order.paymentMethod === 'cod' ? <Wallet size={14} /> : <CreditCard size={14} />}
                            {order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="truncate">{order.customerAddress}</span>
                        </div>

                        {/* Cancel button */}
                        {canCancel(order.status) && (
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => handleCancel(order.id)}
                            disabled={cancellingId === order.id}
                            className="w-full py-2.5 border-2 border-red-300 text-red-500 rounded-xl font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                            <PackageX size={18} />
                            {cancellingId === order.id ? 'Đang huỷ...' : 'Huỷ đơn hàng'}
                          </motion.button>
                        )}

                        {order.status === 'cancelled' && (
                          <div className="text-center text-sm text-red-400 py-2">Đơn hàng đã bị huỷ</div>
                        )}

                        {['confirmed', 'shipping', 'completed'].includes(order.status) && (
                          <div className="text-center text-sm text-gray-400 py-2">Đơn đang được xử lý, không thể huỷ</div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
