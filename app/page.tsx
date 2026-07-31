'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, Sprout, Laptop, ShoppingCart, User, ChevronRight, Star, Zap, Shield, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/cartStore'

const categories = [
  {
    id: 1, name: 'Mỹ Phẩm', slug: 'my-pham',
    color: 'from-pink-500 to-rose-400', lightBg: 'bg-pink-50',
    emoji: '💄', description: 'Làm đẹp tự nhiên, rạng rỡ mỗi ngày',
    Icon: Sparkles,
  },
  {
    id: 2, name: 'Phân Bón', slug: 'phan-bon',
    color: 'from-green-500 to-emerald-400', lightBg: 'bg-green-50',
    emoji: '🌱', description: 'Cây xanh tươi tốt, mùa vụ bội thu',
    Icon: Sprout,
  },
  {
    id: 3, name: 'Công Nghệ', slug: 'cong-nghe',
    color: 'from-blue-500 to-cyan-400', lightBg: 'bg-blue-50',
    emoji: '💻', description: 'Thiết bị hiện đại, công nghệ tiên tiến',
    Icon: Laptop,
  },
]

const floatingEmojis = ['✨', '🌸', '💫', '🎀', '⭐', '🌺', '💝', '🎊']

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { items } = useCartStore()
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 30%, #eff6ff 60%, #f0fdf4 100%)' }}>

      {/* Header */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-pink-100 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/">
            <motion.div whileHover={{ scale: 1.03 }} className="flex items-center gap-2">
              <span className="text-3xl">🛍️</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                BanhBao Shop
              </span>
            </motion.div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/cart">
              <motion.button whileHover={{ scale: 1.05 }} className="relative p-2 rounded-full hover:bg-pink-50">
                <ShoppingCart size={22} className="text-gray-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </motion.button>
            </Link>
            <Link href="/admin/login">
              <motion.button whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                <User size={15} /> Admin
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl" />
          <motion.div animate={{ scale: [1.2, 1, 1.2], rotate: [0, -10, 0] }} transition={{ duration: 10, repeat: Infinity }}
            className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl" />
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 7, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl" />
        </div>

        {/* Floating emojis */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {floatingEmojis.map((emoji, i) => (
            <motion.span key={i} className="absolute text-2xl select-none"
              style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}>
              {emoji}
            </motion.span>
          ))}
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

            {/* Badge */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-pink-200 text-pink-600 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">
              <Zap size={14} className="fill-pink-500" />
              Hàng mới về mỗi ngày
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Chào mừng ghé thăm<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                BanhBao Shop 🛍️
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="text-gray-500 text-lg max-w-lg mx-auto mb-10">
              Mỹ phẩm, phân bón, công nghệ — tất cả hàng chất, giá tốt, giao nhanh.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="flex gap-3 justify-center flex-wrap">
              <Link href="/products/my-pham">
                <motion.button whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(236,72,153,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3.5 rounded-full font-bold shadow-xl text-base">
                  Mua ngay →
                </motion.button>
              </Link>
              <Link href="/cart">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-8 py-3.5 rounded-full font-semibold text-base hover:border-pink-300 hover:bg-white transition-all shadow-sm">
                  Xem giỏ hàng 🛒
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex gap-8 justify-center mt-12 flex-wrap">
              {[
                { num: '500+', label: 'Sản phẩm' },
                { num: '1000+', label: 'Khách hàng' },
                { num: '4.9★', label: 'Đánh giá' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">{stat.num}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features banner */}
      <section className="max-w-6xl mx-auto px-6 mb-10">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Truck, label: 'Giao hàng nhanh', desc: 'Toàn quốc' },
            { icon: Shield, label: 'Hàng chính hãng', desc: '100% cam kết' },
            { icon: Star, label: 'Đánh giá 4.9★', desc: 'Từ khách hàng' },
            { icon: Zap, label: 'Thanh toán dễ', desc: 'COD & CK' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <f.icon size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">{f.label}</p>
                <p className="text-white/70 text-xs">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Danh mục sản phẩm</h2>
            <p className="text-gray-500 mt-1">Khám phá hàng nghìn sản phẩm chất lượng</p>
          </div>
          <div className="w-12 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full hidden md:block" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div key={cat.id}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}>
              <Link href={`/products/${cat.slug}`}>
                <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${cat.color} p-8 text-white cursor-pointer shadow-xl group`}>
                  {/* Background decorations */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                  <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
                  <div className="absolute top-4 right-4 w-16 h-16 bg-white/5 rounded-full" />

                  <div className="relative z-10">
                    <p className="text-5xl mb-4">{cat.emoji}</p>
                    <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
                    <p className="text-white/80 text-sm mb-6">{cat.description}</p>
                    <div className="flex items-center gap-2 text-sm font-bold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full w-fit group-hover:bg-white/30 transition-all">
                      Xem sản phẩm <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl text-center py-16 px-8"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f64f59 100%)' }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-20 -right-20 w-64 h-64 border-4 border-white/10 rounded-full" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-16 -left-16 w-48 h-48 border-4 border-white/10 rounded-full" />
          </div>
          <div className="relative z-10">
            <p className="text-5xl mb-4">🎉</p>
            <h3 className="text-3xl font-bold text-white mb-3">Mua sắm ngay hôm nay!</h3>
            <p className="text-white/80 mb-8 text-lg">Hàng chất lượng, giá tốt, giao hàng tận nơi</p>
            <Link href="/products/my-pham">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="bg-white text-purple-600 px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/25">
                Khám phá ngay →
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <p className="text-2xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                BanhBao Shop 🛍️
              </p>
              <p className="text-gray-400 text-sm">Mua sắm thông minh, sống đẹp mỗi ngày</p>
            </div>

            {/* Links */}
            <div>
              <p className="font-semibold text-white mb-3">Danh mục</p>
              <div className="space-y-2 text-sm text-gray-400">
                <Link href="/products/my-pham" className="block hover:text-pink-400 transition-colors">💄 Mỹ Phẩm</Link>
                <Link href="/products/phan-bon" className="block hover:text-green-400 transition-colors">🌱 Phân Bón</Link>
                <Link href="/products/cong-nghe" className="block hover:text-blue-400 transition-colors">💻 Công Nghệ</Link>
                <Link href="/cart" className="block hover:text-purple-400 transition-colors">🛒 Giỏ Hàng</Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="font-semibold text-white mb-3">Liên hệ</p>
              <div className="space-y-2 text-sm text-gray-400">
                <p className="flex items-start gap-2">
                  <span>📞</span>
                  <a href="tel:0389839161" className="hover:text-pink-400 transition-colors font-semibold text-white">0389 839 161</a>
                </p>
                <p className="flex items-start gap-2">
                  <span>📍</span>
                  <span>Ấp Mỹ Bình, Xã Phong Điền / Xã Sông Đốc, Huyện Trần Văn Thời, Tỉnh Cà Mau</span>
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-600 text-xs">© 2026 BanhBao Shop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
