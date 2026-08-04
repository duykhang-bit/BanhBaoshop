'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package, ShoppingBag, LogOut, User, Phone,
  MapPin, CreditCard, Wallet, CheckCircle, XCircle, Clock, Truck, Settings, Tag, Trash2, BanknoteIcon, Menu, X
} from 'lucide-react'

interface OrderItem {
  id: string
  productName: string
  productImage: string
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

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending:          { label: 'Chờ xử lý',           color: 'bg-yellow-100 text-yellow-700',  icon: Clock },
  awaiting_payment: { label: 'Chờ xác nhận CK',      color: 'bg-orange-100 text-orange-700',  icon: BanknoteIcon },
  confirmed:        { label: 'Đã xác nhận',           color: 'bg-blue-100 text-blue-700',     icon: CheckCircle },
  shipping:         { label: 'Đang giao',             color: 'bg-purple-100 text-purple-700', icon: Truck },
  completed:        { label: 'Hoàn thành',            color: 'bg-green-100 text-green-700',   icon: CheckCircle },
  cancelled:        { label: 'Đã hủy',                color: 'bg-red-100 text-red-700',       icon: XCircle },
}

const TABS = [
  { key: 'all',              label: 'Tất cả' },
  { key: 'awaiting_payment', label: '🔔 Chờ xác nhận CK' },
  { key: 'pending',          label: 'Chờ xử lý' },
  { key: 'confirmed',        label: 'Đã xác nhận' },
  { key: 'shipping',         label: 'Đang giao' },
  { key: 'completed',        label: 'Hoàn thành' },
  { key: 'cancelled',        label: 'Đã hủy' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { router.push('/admin/login'); return }
    fetchOrders(token)
  }, [router])

  const fetchOrders = async (token: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    router.push('/admin/login')
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem('admin_token')
    if (!token) return
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    })
    fetchOrders(token)
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm('Xóa đơn hàng này? Không thể hoàn tác.')) return
    const token = localStorage.getItem('admin_token')
    if (!token) return
    setDeletingId(orderId)
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchOrders(token)
    setDeletingId(null)
  }

  const awaitingCount = orders.filter(o => o.status === 'awaiting_payment').length
  const filtered = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="text-6xl">⚙️</motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar toggle */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-purple-600 to-pink-600 text-white shadow-2xl z-20 transition-all duration-300 ${sidebarOpen ? 'w-60' : 'w-0 overflow-hidden'}`}>
        <div className="p-5 w-60">
          <div className="mb-8"><div className="text-3xl mb-1">👑</div><h2 className="text-xl font-bold">Admin Panel</h2></div>
          <nav className="space-y-1">
            <Link href="/admin/dashboard"><button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/10 text-sm"><Package size={18} /><span>Sản Phẩm</span></button></Link>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/20 text-sm">
              <ShoppingBag size={18} /><span>Đơn Hàng</span>
              {awaitingCount > 0 && <span className="ml-auto bg-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">{awaitingCount}</span>}
            </button>
            <Link href="/admin/config"><button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/10 text-sm"><Settings size={18} /><span>Cấu Hình</span></button></Link>
          </nav>
          <button onClick={handleLogout} className="absolute bottom-5 left-5 right-5 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-sm">
            <LogOut size={18} /><span>Đăng Xuất</span>
          </button>
        </div>
      </div>
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-4 z-30 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-r-xl p-2 shadow-lg transition-all duration-300 ${sidebarOpen ? 'left-60' : 'left-0'}`}>
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-10 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className={`transition-all duration-300 p-4 md:p-8 ${sidebarOpen ? 'md:ml-60' : 'ml-0'}`}>
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-1">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-500">Tổng {orders.length} đơn · {awaitingCount > 0 && <span className="text-orange-600 font-semibold">{awaitingCount} chờ xác nhận chuyển khoản</span>}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
              } ${tab.key === 'awaiting_payment' && awaitingCount > 0 ? 'ring-2 ring-orange-400' : ''}`}>
              {tab.label}
              {tab.key === 'awaiting_payment' && awaitingCount > 0 && (
                <span className="ml-1 bg-orange-400 text-white text-xs px-1.5 py-0.5 rounded-full">{awaitingCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="space-y-4">
          {filtered.map((order) => {
            const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending
            const StatusIcon = statusInfo.icon
            const subtotal = order.totalAmount + (order.discountAmount || 0)

            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl shadow-lg p-6 ${order.status === 'awaiting_payment' ? 'ring-2 ring-orange-400' : ''}`}>

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-gray-800">#{order.id.substring(0, 8).toUpperCase()}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusInfo.color}`}>
                        <StatusIcon size={14} />{statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  <div className="text-right">
                    {order.discountAmount > 0 && (
                      <p className="text-sm text-gray-400 line-through">{subtotal.toLocaleString()}₫</p>
                    )}
                    <p className="text-2xl font-bold text-pink-600">{order.totalAmount.toLocaleString()}₫</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1 justify-end">
                      {order.paymentMethod === 'cod' ? <Wallet size={14} /> : <CreditCard size={14} />}
                      {order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}
                    </div>
                  </div>
                </div>

                {/* Customer info */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-2">
                    <User size={18} className="text-gray-500 mt-0.5" />
                    <div><p className="text-xs text-gray-500">Khách hàng</p><p className="font-semibold">{order.customerName}</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone size={18} className="text-gray-500 mt-0.5" />
                    <div><p className="text-xs text-gray-500">Số điện thoại</p><p className="font-semibold">{order.customerPhone}</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={18} className="text-gray-500 mt-0.5" />
                    <div><p className="text-xs text-gray-500">Địa chỉ</p><p className="font-semibold text-sm">{order.customerAddress}</p></div>
                  </div>
                </div>

                {order.note && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700"><strong>📝 Ghi chú khách:</strong> {order.note}</p>
                  </div>
                )}

                {/* Admin note */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={(order as any).adminNote || ''}
                      placeholder="📌 Ghi chú nội bộ (VD: đã ship, thiếu hàng...)"
                      onBlur={(e) => {
                        const val = e.target.value
                        if (val !== ((order as any).adminNote || '')) {
                          const token = localStorage.getItem('admin_token')
                          fetch(`/api/admin/orders/${order.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ adminNote: val }),
                          })
                        }
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-dashed border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 bg-purple-50/50 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.productName} x{item.quantity}</span>
                      <span className="font-semibold">{(item.price * item.quantity).toLocaleString()}₫</span>
                    </div>
                  ))}
                </div>

                {/* Discount */}
                {order.discountCode && order.discountAmount > 0 && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-700">
                      <Tag size={16} />
                      <span className="text-sm">Mã giảm giá:</span>
                      <span className="font-mono font-bold">{order.discountCode}</span>
                    </div>
                    <span className="text-green-700 font-bold">-{order.discountAmount.toLocaleString()}₫</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t flex-wrap items-center">
                  {/* Nút xác nhận thanh toán CK — ưu tiên hiện lên đầu */}
                  {order.status === 'awaiting_payment' && (
                    <button onClick={() => updateStatus(order.id, 'confirmed')}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold text-sm flex items-center gap-1">
                      <BanknoteIcon size={15} /> Xác nhận thanh toán
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(order.id, 'confirmed')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium">
                        Xác nhận
                      </button>
                      <button onClick={() => updateStatus(order.id, 'cancelled')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium">
                        Hủy đơn
                      </button>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <button onClick={() => updateStatus(order.id, 'shipping')}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium">
                      Bắt đầu giao hàng
                    </button>
                  )}
                  {order.status === 'shipping' && (
                    <button onClick={() => updateStatus(order.id, 'completed')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium">
                      Hoàn thành
                    </button>
                  )}
                  <button onClick={() => handleDelete(order.id)} disabled={deletingId === order.id}
                    className="ml-auto px-4 py-2 bg-gray-100 text-red-500 rounded-lg hover:bg-red-50 text-sm font-medium flex items-center gap-1 disabled:opacity-50">
                    <Trash2 size={15} />
                    {deletingId === order.id ? 'Đang xóa...' : 'Xóa đơn'}
                  </button>
                </div>
              </motion.div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-xl text-gray-600">Không có đơn hàng nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
