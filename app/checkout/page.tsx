'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, Wallet, User, Phone, MapPin, FileText, Tag, CheckCircle } from 'lucide-react'
import { useCartStore } from '@/lib/cartStore'
import { useShopConfig } from '@/lib/useShopConfig'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart, appliedPromo } = useCartStore()
  const { calcShipping } = useShopConfig()
  const [loading, setLoading] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [fullOrderId, setFullOrderId] = useState('')
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [confirmingPayment, setConfirmingPayment] = useState(false)

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    note: '',
    paymentMethod: 'cod',
  })

  const totalPrice = getTotalPrice()
  const shippingFee = calcShipping(totalPrice)
  const discount = appliedPromo?.discount || 0
  const finalTotal = totalPrice + shippingFee - discount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) { alert('Giỏ hàng trống!'); return }
    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalAmount: finalTotal,
          discountCode: appliedPromo?.code || '',
          discountAmount: discount,
          items: items.map(item => ({
            productId: item.id,
            productName: item.name,
            productImage: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        const shortId = data.order.id.substring(0, 8).toUpperCase()
        setOrderId(shortId)
        setFullOrderId(data.order.id)
        if (formData.paymentMethod === 'bank') {
          setShowQR(true)
          clearCart()
        } else {
          clearCart()
          alert('✅ Đặt hàng thành công! Mã đơn: #' + shortId)
          router.push('/')
        }
      } else {
        alert(data.error || 'Lỗi khi đặt hàng, thử lại sau')
      }
    } catch {
      alert('Lỗi khi đặt hàng, thử lại sau')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    setConfirmingPayment(true)
    try {
      await fetch(`/api/orders/${fullOrderId}/confirm-payment`, {
        method: 'POST',
      })
      setPaymentConfirmed(true)
    } catch {
      // vẫn show confirmed dù lỗi, vì đây chỉ là UX
      setPaymentConfirmed(true)
    } finally {
      setConfirmingPayment(false)
    }
  }

  if (items.length === 0 && !showQR) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-3xl font-bold text-gray-700 mb-4">Giỏ hàng trống</h2>
          <Link href="/"><button className="btn-primary">Quay lại mua sắm</button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-6">
      <div className="container mx-auto max-w-4xl">

        <Link href="/cart">
          <motion.button
            whileHover={{ x: -5 }}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors font-medium mb-6"
          >
            <ArrowLeft size={20} />
            Quay lại giỏ hàng
          </motion.button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Thông Tin Giao Hàng</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2"><User size={18} /> Họ và tên *</span>
              </label>
              <input type="text" required value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="Nguyễn Văn A" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2"><Phone size={18} /> Số điện thoại *</span>
              </label>
              <input type="tel" required value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="0912345678" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2"><MapPin size={18} /> Địa chỉ giao hàng *</span>
              </label>
              <textarea required rows={3} value={formData.customerAddress}
                onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="123 Đường ABC, Quận 1, TP.HCM" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2"><FileText size={18} /> Ghi chú (tùy chọn)</span>
              </label>
              <textarea rows={2} value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="Giao giờ hành chính, nhắn trước khi giao..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Phương thức thanh toán *</label>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${formData.paymentMethod === 'cod' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'}`}>
                  <Wallet size={32} className="mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">COD</p>
                  <p className="text-sm text-gray-600">Tiền mặt khi nhận</p>
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, paymentMethod: 'bank' })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${formData.paymentMethod === 'bank' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'}`}>
                  <CreditCard size={32} className="mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Chuyển khoản</p>
                  <p className="text-sm text-gray-600">QR Banking</p>
                </button>
              </div>
            </div>

            {/* Tóm tắt */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Tóm tắt đơn hàng</h3>
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-gray-200">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.quantity} x {item.price.toLocaleString()}₫</p>
                  </div>
                  <p className="font-bold text-gray-800">{(item.price * item.quantity).toLocaleString()}₫</p>
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-semibold">{totalPrice.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className={`font-semibold ${shippingFee === 0 ? 'text-green-600' : ''}`}>
                  {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()}₫`}
                </span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag size={14} />
                    Mã <span className="font-mono font-bold ml-1">{appliedPromo.code}</span>
                  </span>
                  <span className="font-semibold">-{discount.toLocaleString()}₫</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t-2 border-gray-300 text-xl font-bold">
                <span>Tổng cộng</span>
                <span className="text-pink-600">{finalTotal.toLocaleString()}₫</span>
              </div>
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl disabled:opacity-50">
              {loading ? '⏳ Đang xử lý...' : '🎉 Đặt Hàng Ngay'}
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl my-4">

            {!paymentConfirmed ? (
              <>
                <div className="text-4xl mb-2">🧾</div>
                <h3 className="text-xl font-bold mb-1">Đặt hàng thành công!</h3>
                <p className="text-gray-500 text-sm mb-1">Mã đơn: <span className="font-bold text-pink-600">#{orderId}</span></p>
                <p className="text-xs text-gray-400 mb-4">Quét QR để thanh toán, sau đó bấm xác nhận bên dưới</p>

                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.vietqr.io/image/TPBank-00004775170-compact2.jpg?amount=${finalTotal}&addInfo=DH${orderId}&accountName=LE%20DUY%20KHANG`}
                    alt="QR Thanh toán"
                    className="w-56 h-56 mx-auto rounded-xl object-contain"
                  />
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="font-bold text-gray-800">LE DUY KHANG</p>
                    <p className="text-gray-600">TPBank · <span className="font-mono font-bold">00004775170</span></p>
                    <p className="text-2xl font-bold text-pink-600 mt-1">{finalTotal.toLocaleString()}₫</p>
                    <p className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg font-mono font-bold">Nội dung: DH{orderId}</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmPayment}
                  disabled={confirmingPayment}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={22} />
                  {confirmingPayment ? 'Đang xử lý...' : 'Tôi đã chuyển khoản'}
                </motion.button>
                <p className="text-xs text-gray-400 mt-3">Shop sẽ xác nhận sau khi kiểm tra giao dịch</p>
              </>
            ) : (
              <>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                  className="text-6xl mb-4">✅</motion.div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Cảm ơn bạn!</h3>
                <p className="text-gray-600 mb-1">Đơn <span className="font-bold text-pink-600">#{orderId}</span> đang chờ xác nhận</p>
                <p className="text-sm text-gray-500 mb-6">Shop sẽ liên hệ với bạn trong thời gian sớm nhất</p>
                <button onClick={() => router.push('/')}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold">
                  Về trang chủ
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
