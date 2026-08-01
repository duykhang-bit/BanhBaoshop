'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowLeft,
  ShoppingBag, CreditCard, User, Tag, X
} from 'lucide-react'
import { useCartStore } from '@/lib/cartStore'
import { useShopConfig } from '@/lib/useShopConfig'
import { useState } from 'react'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems, appliedPromo, setAppliedPromo } = useCartStore()
  const { config, calcShipping, applyPromo } = useShopConfig()
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')

  const totalPrice = getTotalPrice()
  const shippingFee = calcShipping(totalPrice)
  const discount = appliedPromo?.discount || 0
  const finalTotal = totalPrice + shippingFee - discount

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return
    const { discount, error } = applyPromo(promoInput, totalPrice)
    if (error) {
      setPromoError(error)
      setAppliedPromo(null)
    } else {
      setAppliedPromo({ code: promoInput.toUpperCase(), discount })
      setPromoError('')
    }
  }

  const removePromo = () => {
    setAppliedPromo(null)
    setPromoInput('')
    setPromoError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-md shadow-md sticky top-0 z-50"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-2">
              <span className="text-3xl">🛍️</span>
              <span className="text-2xl font-bold text-gradient">BanhBao Shop</span>
            </motion.div>
          </Link>
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-pink-100 text-pink-600 px-4 py-2 rounded-full font-semibold"
            >
              <ShoppingCart size={20} />
              <span>{getTotalItems()} sản phẩm</span>
            </motion.div>
            <Link href="/admin/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                <User size={16} /> Admin
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Page Title */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 py-12">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-7xl mb-4"
          >
            🛒
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Giỏ Hàng Của Bạn
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/90"
          >
            {getTotalItems()} sản phẩm đang chờ thanh toán
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {items.length === 0 ? (
          /* Empty Cart */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-6"
            >
              🛍️
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-700 mb-4">Giỏ Hàng Trống</h2>
            <p className="text-gray-500 mb-8 text-lg">
              Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
            </p>
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-lg"
              >
                Tiếp Tục Mua Sắm 🚀
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between mb-4"
              >
                <h2 className="text-2xl font-bold text-gray-800">Sản Phẩm Trong Giỏ</h2>
                {items.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-1"
                  >
                    <Trash2 size={16} />
                    Xóa tất cả
                  </motion.button>
                )}
              </motion.div>

              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-4 flex items-start gap-3 relative overflow-hidden group"
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative flex-shrink-0">
                      <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-xl overflow-hidden shadow-md">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </div>

                    <div className="flex-1 relative z-10 min-w-0">
                      <h3 className="text-base md:text-xl font-bold text-gray-800 mb-1 line-clamp-2">{item.name}</h3>
                      <p className="text-lg md:text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                        {item.price.toLocaleString('vi-VN')}₫
                      </p>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-2 py-1">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 rounded-full bg-white shadow hover:bg-gray-50"
                          >
                            <Minus size={14} />
                          </motion.button>
                          <span className="text-lg font-bold w-8 text-center">{item.quantity}</span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 rounded-full bg-white shadow hover:bg-gray-50"
                          >
                            <Plus size={14} />
                          </motion.button>
                        </div>

                        <span className="text-gray-500">×</span>
                        <span className="text-xl font-bold text-gray-700">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeItem(item.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors z-10"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Link href="/">
                <motion.button
                  whileHover={{ x: -5 }}
                  className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors font-medium mt-6"
                >
                  <ArrowLeft size={20} />
                  Tiếp tục mua sắm
                </motion.button>
              </Link>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <ShoppingBag size={24} />
                  Tổng Đơn Hàng
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-semibold">{totalPrice.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-semibold">
                      {shippingFee === 0 ? (
                        <span className="text-green-500">Miễn phí</span>
                      ) : (
                        `${shippingFee.toLocaleString('vi-VN')}₫`
                      )}
                    </span>
                  </div>
                  {shippingFee > 0 && config.showShippingHint && (
                    <div className="text-xs text-pink-600 bg-pink-50 p-3 rounded-lg">
                      💡 Mua thêm {(config.freeShippingMin - totalPrice).toLocaleString('vi-VN')}₫ để được miễn phí ship
                    </div>
                  )}

                  {/* Promo Code */}
                  {config.promoEnabled && (
                    <div>
                      {appliedPromo ? (
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded-xl">
                          <div className="flex items-center gap-2 text-green-700">
                            <Tag size={16} />
                            <span className="font-mono font-bold">{appliedPromo.code}</span>
                            <span className="text-sm">-{appliedPromo.discount.toLocaleString()}₫</span>
                          </div>
                          <button onClick={removePromo}><X size={16} className="text-gray-400 hover:text-red-500" /></button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Nhập mã khuyến mãi"
                              value={promoInput}
                              onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError('') }}
                              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm font-mono"
                            />
                            <button onClick={handleApplyPromo}
                              className="px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-semibold hover:bg-pink-600"
                            >
                              Áp dụng
                            </button>
                          </div>
                          {promoError && <p className="text-red-500 text-xs mt-1">⚠️ {promoError}</p>}
                        </div>
                      )}
                    </div>
                  )}

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span className="font-semibold">-{discount.toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">Tổng cộng</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                      {finalTotal.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>

                <Link href="/checkout" className="block">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard size={22} />
                    Tiến Hành Thanh Toán
                  </motion.button>
                </Link>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-lg">
                      ✓
                    </div>
                    <span>Thanh toán an toàn & bảo mật</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                      🚚
                    </div>
                    <span>Giao hàng nhanh 2-3 ngày</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-lg">
                      🔄
                    </div>
                    <span>Đổi trả miễn phí trong 7 ngày</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
