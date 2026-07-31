'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, Sprout, Laptop, ShoppingCart, User, ChevronRight } from 'lucide-react'
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

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { items } = useCartStore()
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100"
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
              <motion.button whileHover={{ scale: 1.05 }} className="relative p-2 rounded-full hover:bg-gray-100">
                <ShoppingCart size={22} className="text-gray-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </motion.button>
            </Link>
            <Link href="/admin/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow"
              >
                <User size={15} /> Admin
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-14 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="text-6xl block mb-5"
          >
            🛍️
          </motion.span>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Chào mừng ghé thăm<br />
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              BanhBao Shop 🛍️
            </span>
          </h1>
          <p className="text-gray-500 text-lg max-w-lg mx-auto mb-8">
            Mỹ phẩm, phân bón, công nghệ — tất cả hàng chất, giá tốt, giao nhanh.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/products/my-pham">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-7 py-3 rounded-full font-semibold shadow-lg text-base"
              >
                Mua ngay →
              </motion.button>
            </Link>
            <Link href="/cart">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="bg-white border border-gray-200 text-gray-700 px-7 py-3 rounded-full font-semibold text-base hover:border-pink-300 transition-colors"
              >
                Xem giỏ hàng
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6 pb-14">
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-2xl font-bold text-gray-800 mb-6"
        >
          Danh mục sản phẩm
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Link href={`/products/${cat.slug}`}>
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.color} p-7 text-white cursor-pointer shadow-lg group`}>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-4xl mb-3">{cat.emoji}</p>
                      <h3 className="text-2xl font-bold">{cat.name}</h3>
                      <p className="text-white/80 text-sm mt-1">{cat.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all">
                    Xem sản phẩm <ChevronRight size={16} />
                  </div>
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                  <div className="absolute -top-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '🚚', title: 'Giao hàng nhanh', desc: 'Miễn phí ship đơn đủ điều kiện' },
            { icon: '💯', title: 'Hàng chính hãng', desc: 'Cam kết 100% chính hãng' },
            { icon: '🎁', title: 'Khuyến mãi mỗi ngày', desc: 'Ưu đãi cập nhật liên tục' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <p className="font-bold text-gray-800 mb-1">{f.title}</p>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-2xl font-bold mb-2">BanhBao Shop</p>
          <p className="text-gray-400 text-sm mb-1">Mua sắm thông minh, sống đẹp mỗi ngày</p>
          <p className="text-gray-600 text-xs">© 2026 BanhBao Shop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
