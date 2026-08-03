'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Phone, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useUserStore } from '@/lib/userStore'

export default function AccountLoginPage() {
  const router = useRouter()
  const { setAuth } = useUserStore()
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    phone: '',
    password: '',
    name: '',
    confirmPassword: '',
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, password: form.password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setAuth(data.token, data.user)
      router.push('/account')
    } catch {
      setError('Lỗi kết nối, thử lại sau')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, password: form.password, name: form.name }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setAuth(data.token, data.user)
      router.push('/account')
    } catch {
      setError('Lỗi kết nối, thử lại sau')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setSuccess(data.message)
    } catch {
      setError('Lỗi kết nối, thử lại sau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-600 text-sm mb-4">
            <ArrowLeft size={16} /> Về trang chủ
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {mode === 'login' && '🔐 Đăng nhập'}
            {mode === 'register' && '📝 Tạo tài khoản'}
            {mode === 'forgot' && '🔑 Quên mật khẩu'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'login' && 'Đăng nhập để quản lý đơn hàng'}
            {mode === 'register' && 'Tạo tài khoản để mua sắm tiện hơn'}
            {mode === 'forgot' && 'Gửi yêu cầu để admin đặt lại mật khẩu'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              ⚠️ {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl mb-4">
              ✅ {success}
            </motion.div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Số điện thoại</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="0389 xxx xxx"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Mật khẩu</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50 hover:shadow-lg transition-shadow"
              >
                {loading ? '⏳ Đang xử lý...' : 'ĐĂNG NHẬP'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess('') }}
                  className="text-pink-600 hover:underline">
                  Quên mật khẩu?
                </button>
              </div>

              <div className="border-t pt-4 text-center">
                <p className="text-sm text-gray-500">Chưa có tài khoản?{' '}
                  <button type="button" onClick={() => { setMode('register'); setError('') }}
                    className="text-pink-600 font-semibold hover:underline">
                    Tạo tài khoản mới
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Họ tên</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Số điện thoại <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="0389 xxx xxx"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Mật khẩu <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Ít nhất 6 ký tự"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50 hover:shadow-lg transition-shadow"
              >
                {loading ? '⏳ Đang xử lý...' : 'TẠO TÀI KHOẢN'}
              </button>

              <div className="border-t pt-4 text-center">
                <p className="text-sm text-gray-500">Đã có tài khoản?{' '}
                  <button type="button" onClick={() => { setMode('login'); setError('') }}
                    className="text-pink-600 font-semibold hover:underline">
                    Đăng nhập
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-xl">
                💡 Nhập số điện thoại đã đăng ký. Admin sẽ tạo mật khẩu mới và liên hệ bạn qua SĐT này.
              </p>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Số điện thoại</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="0389 xxx xxx"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50 hover:shadow-lg transition-shadow"
              >
                {loading ? '⏳ Đang gửi...' : 'GỬI YÊU CẦU'}
              </button>

              <div className="border-t pt-4 text-center">
                <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                  className="text-sm text-pink-600 font-semibold hover:underline">
                  ← Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Note: tra cứu đơn hàng */}
        <div className="mt-4 text-center">
          <Link href="/my-orders" className="text-sm text-gray-500 hover:text-pink-600">
            📦 Tra cứu đơn hàng bằng SĐT (không cần đăng nhập)
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
