'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Phone, MapPin, Lock, LogOut, Package, Edit2, Check, X, ArrowLeft } from 'lucide-react'
import { useUserStore } from '@/lib/userStore'
import AddressSelector from '@/components/AddressSelector'

interface Order {
  id: string
  status: string
  totalAmount: number
  paymentMethod: string
  createdAt: string
  items: { productName: string; quantity: number; price: number }[]
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
}

export default function AccountPage() {
  const router = useRouter()
  const { token, user, updateUser, logout } = useUserStore()
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<'profile' | 'orders' | 'password'>('profile')
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // Profile edit
  const [editing, setEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', address: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  // Change password
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passLoading, setPassLoading] = useState(false)
  const [passMsg, setPassMsg] = useState({ type: '', text: '' })

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && !token) {
      router.push('/account/login')
    }
  }, [mounted, token, router])

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', address: user.address || '' })
    }
  }, [user])

  useEffect(() => {
    if (token && user?.phone && tab === 'orders') {
      fetchOrders()
    }
  }, [token, tab])

  const fetchOrders = async () => {
    if (!user?.phone) return
    setLoadingOrders(true)
    try {
      const res = await fetch(`/api/orders/by-phone?phone=${encodeURIComponent(user.phone)}`)
      const data = await res.json()
      setOrders(data.orders || [])
    } catch {
      setOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleSaveProfile = async () => {
    setProfileLoading(true)
    setProfileMsg('')
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm),
      })
      const data = await res.json()
      if (res.ok) {
        updateUser(data.user)
        setEditing(false)
        setProfileMsg('Cập nhật thành công!')
        setTimeout(() => setProfileMsg(''), 3000)
      }
    } catch {
      setProfileMsg('Lỗi cập nhật')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassMsg({ type: '', text: '' })

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMsg({ type: 'error', text: 'Mật khẩu mới không khớp' })
      return
    }

    setPassLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setPassMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' })
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setPassMsg({ type: 'error', text: data.error })
      }
    } catch {
      setPassMsg({ type: 'error', text: 'Lỗi hệ thống' })
    } finally {
      setPassLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!mounted || !token || !user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-3">
            <ArrowLeft size={16} /> Trang chủ
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <User size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold">{user.name || 'Khách hàng'}</h1>
              <p className="text-white/80 text-sm">{user.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b">
            {[
              { key: 'profile', label: 'Thông tin', icon: <User size={16} /> },
              { key: 'orders', label: 'Đơn hàng', icon: <Package size={16} /> },
              { key: 'password', label: 'Đổi mật khẩu', icon: <Lock size={16} /> },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* PROFILE TAB */}
            {tab === 'profile' && (
              <div className="space-y-4">
                {profileMsg && (
                  <div className="bg-green-50 text-green-600 text-sm px-4 py-2 rounded-xl">✅ {profileMsg}</div>
                )}

                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Thông tin cá nhân</h3>
                  {!editing ? (
                    <button onClick={() => setEditing(true)}
                      className="flex items-center gap-1 text-sm text-pink-600 hover:underline">
                      <Edit2 size={14} /> Chỉnh sửa
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={handleSaveProfile} disabled={profileLoading}
                        className="flex items-center gap-1 text-sm text-green-600 hover:underline">
                        <Check size={14} /> Lưu
                      </button>
                      <button onClick={() => { setEditing(false); setProfileForm({ name: user.name, address: user.address }) }}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:underline">
                        <X size={14} /> Hủy
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <Phone size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Số điện thoại</p>
                      <p className="font-medium text-gray-800">{user.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <User size={18} className="text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Họ tên</p>
                      {editing ? (
                        <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-pink-500" />
                      ) : (
                        <p className="font-medium text-gray-800">{user.name || '—'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <MapPin size={18} className="text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Địa chỉ giao hàng mặc định</p>
                      {editing ? (
                        <AddressSelector
                          value={profileForm.address}
                          onChange={(addr) => setProfileForm({ ...profileForm, address: addr })}
                        />
                      ) : (
                        <p className="font-medium text-gray-800">{user.address || '—'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <button onClick={handleLogout}
                  className="mt-6 flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium">
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            )}

            {/* ORDERS TAB */}
            {tab === 'orders' && (
              <div>
                {loadingOrders ? (
                  <div className="text-center py-10 text-gray-400">⏳ Đang tải...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-4xl mb-2">📦</p>
                    <p className="text-gray-500">Chưa có đơn hàng nào</p>
                    <Link href="/" className="text-sm text-pink-600 hover:underline mt-2 inline-block">Mua sắm ngay →</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => {
                      const st = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' }
                      return (
                        <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-400">#{order.id.substring(0, 8).toUpperCase()}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                          </div>
                          <div className="space-y-1">
                            {order.items.slice(0, 2).map((item, i) => (
                              <p key={i} className="text-sm text-gray-700">
                                {item.productName} x{item.quantity}
                              </p>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-xs text-gray-400">+{order.items.length - 2} sản phẩm khác</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                            <p className="font-bold text-sm text-pink-600">{order.totalAmount.toLocaleString('vi-VN')}₫</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* CHANGE PASSWORD TAB */}
            {tab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                {passMsg.text && (
                  <div className={`text-sm px-4 py-2 rounded-xl ${passMsg.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {passMsg.type === 'success' ? '✅' : '⚠️'} {passMsg.text}
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Mật khẩu hiện tại</label>
                  <input type="password" value={passForm.currentPassword}
                    onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                    required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Mật khẩu mới</label>
                  <input type="password" value={passForm.newPassword}
                    onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
                    placeholder="Ít nhất 6 ký tự"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                    required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Xác nhận mật khẩu mới</label>
                  <input type="password" value={passForm.confirmPassword}
                    onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                    required />
                </div>
                <button type="submit" disabled={passLoading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50">
                  {passLoading ? '⏳ Đang xử lý...' : 'ĐỔI MẬT KHẨU'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
