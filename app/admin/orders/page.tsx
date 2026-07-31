'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Package, ShoppingBag, LogOut, User, Phone,
  MapPin, CreditCard, Wallet, CheckCircle, XCircle, Clock, Truck, Settings, Tag, Trash2
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchOrders(token)
  }, [router])

  const fetchOrders = async (token: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setOrders(data.orders || [])
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
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
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      fetchOrders(token)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm('Xóa đơn hàng này? Không thể hoàn tác.')) return
    const token = localStorage.getItem('admin_token')
    if (!token) return
    setDeletingId(orderId)
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchOrders(token)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700', icon: Truck },
      completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: XCircle }
    }
    return map[status] || map.pending
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="text-6xl">⚙️</motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-purple-600 to-pink-600 text-white p-6 shadow-2xl">
        <div className="mb-8">
          <div className="text-4xl mb-2">👑</div>
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <p className="text-sm text-white/70">BanhBao Shop</p>
        </div>

        <nav className="space-y-2">
          <Link href="/admin/dashboard">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
              <Package size={20} />
              <span>Sản Phẩm</span>
            </button>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
            <ShoppingBag size={20} />
            <span>Đơn Hàng</span>
          </button>
          <Link href="/admin/config">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
              <Settings size={20} />
              <span>Cấu Hình</span>
            </button>
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-colors"
        >
          <LogOut size={20} />
          <span>Đăng Xuất</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-600">Tổng {orders.length} đơn hàng</p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status)
            const StatusIcon = statusInfo.icon
            const subtotal = order.totalAmount + (order.discountAmount || 0)

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">#{order.id.substring(0, 8)}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusInfo.color}`}>
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    {order.discountAmount > 0 && (
                      <p className="text-sm text-gray-400 line-through">{subtotal.toLocaleString()}₫</p>
                    )}
                    <p className="text-2xl font-bold text-pink-600">
                      {order.totalAmount.toLocaleString()}₫
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1 justify-end">
                      {order.paymentMethod === 'cod' ? <Wallet size={14} /> : <CreditCard size={14} />}
                      {order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-2">
                    <User size={18} className="text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Khách hàng</p>
                      <p className="font-semibold">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone size={18} className="text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Số điện thoại</p>
                      <p className="font-semibold">{order.customerPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={18} className="text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Địa chỉ</p>
                      <p className="font-semibold text-sm">{order.customerAddress}</p>
                    </div>
                  </div>
                </div>

                {order.note && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700"><strong>Ghi chú:</strong> {order.note}</p>
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.productName} x{item.quantity}</span>
                      <span className="font-semibold">{(item.price * item.quantity).toLocaleString()}₫</span>
                    </div>
                  ))}
                </div>

                {/* Discount Info */}
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

                {/* Status Actions + Delete */}
                <div className="flex gap-2 pt-4 border-t flex-wrap">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(order.id, 'confirmed')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        Xác nhận
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, 'cancelled')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                      >
                        Hủy đơn
                      </button>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => updateStatus(order.id, 'shipping')}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                    >
                      Bắt đầu giao hàng
                    </button>
                  )}
                  {order.status === 'shipping' && (
                    <button
                      onClick={() => updateStatus(order.id, 'completed')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      Hoàn thành
                    </button>
                  )}

                  {/* Nút xóa đơn — luôn hiện */}
                  <button
                    onClick={() => handleDelete(order.id)}
                    disabled={deletingId === order.id}
                    className="ml-auto px-4 py-2 bg-gray-100 text-red-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                    {deletingId === order.id ? 'Đang xóa...' : 'Xóa đơn'}
                  </button>
                </div>
              </motion.div>
            )
          })}

          {orders.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-xl text-gray-600">Chưa có đơn hàng nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
