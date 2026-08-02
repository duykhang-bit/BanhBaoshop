'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ShoppingCart, User, ShoppingBag, Search, ChevronRight, Menu, X, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/cartStore'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  price: number
  image: string
  stock: number
  featured: boolean
}

interface Category {
  id: string
  name: string
  slug: string
  products?: Product[]
}

const CATEGORY_COLORS: Record<string, { from: string; emoji: string }> = {
  'my-pham':   { from: 'from-pink-500 to-rose-400',    emoji: '💄' },
  'phan-bon':  { from: 'from-green-500 to-emerald-400', emoji: '🌱' },
  'cong-nghe': { from: 'from-blue-500 to-cyan-400',     emoji: '💻' },
  'tom-giong': { from: 'from-orange-400 to-amber-400',  emoji: '🦐' },
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [homepageSlugs, setHomepageSlugs] = useState<string[]>([])
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({})
  const [addedId, setAddedId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ name: string } | null>(null)
  const [hiddenNavItems, setHiddenNavItems] = useState<string[]>([])
  const { items, addItem } = useCartStore()
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 })
    setAddedId(product.id)
    setToast({ name: product.name })
    setTimeout(() => setAddedId(null), 1500)
    setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    // Lấy config để biết danh mục nào hiện trang chủ
    fetch('/api/config').then(r => r.json()).then(data => {
      setHomepageSlugs(data.homepageCategories || [])
      setHiddenNavItems(data.hiddenNavItems || [])
    })
    // Lấy danh sách tất cả categories
    fetch('/api/categories').then(r => r.json()).then(data => {
      setAllCategories(data.categories || [])
    })
  }, [])

  useEffect(() => {
    if (homepageSlugs.length === 0) return
    // Fetch sản phẩm cho từng danh mục được chọn
    homepageSlugs.forEach(slug => {
      fetch(`/api/products?category=${slug}&limit=9`).then(r => r.json()).then(data => {
        // Sort featured lên đầu
        const products = (data.products || []).sort((a: Product, b: Product) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return 0
        })
        setCategoryProducts(prev => ({ ...prev, [slug]: products }))
      })
    })
  }, [homepageSlugs])

  if (!mounted) return null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) window.location.href = `/search?q=${encodeURIComponent(search.trim())}`
  }

  const getCategoryBySlug = (slug: string) => allCategories.find(c => c.slug === slug)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          {/* Top row */}
          <div className="flex items-center gap-3 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <span className="text-2xl">🛍️</span>
              <span className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                BanhBao Shop
              </span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5 max-w-xl mx-auto">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400" />
              <button type="submit" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                Tìm
              </button>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/cart">
                <button className="relative p-2 rounded-full hover:bg-gray-100">
                  <ShoppingCart size={22} className="text-gray-700" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {totalItems}
                    </span>
                  )}
                </button>
              </Link>
              <Link href="/admin/login">
                <button className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-xl text-sm font-semibold shadow-md">
                  <User size={14} /> Admin
                </button>
              </Link>
              <button onClick={() => setShowMenu(!showMenu)} className="sm:hidden p-2 rounded-full hover:bg-gray-100">
                {showMenu ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Category nav bar */}
          <div className="flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
            <button onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0 mr-2">
              <Menu size={16} /> DANH MỤC
            </button>
            {allCategories.filter(cat => !hiddenNavItems.includes(cat.slug)).map(cat => {
              const info = CATEGORY_COLORS[cat.slug] || { emoji: '🛒', from: 'from-gray-400 to-gray-500' }
              return (
                <Link key={cat.id} href={`/products/${cat.slug}`}>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors flex-shrink-0 whitespace-nowrap">
                    {info.emoji} {cat.name}
                  </button>
                </Link>
              )
            })}
            {!hiddenNavItems.includes('my-orders') && (
              <Link href="/my-orders">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 flex-shrink-0 whitespace-nowrap">
                  📦 Đơn hàng
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {showMenu && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 z-50 p-4 grid grid-cols-2 gap-2">
            {allCategories.map(cat => {
              const info = CATEGORY_COLORS[cat.slug] || { emoji: '🛒', from: 'from-gray-400 to-gray-500' }
              return (
                <Link key={cat.id} href={`/products/${cat.slug}`} onClick={() => setShowMenu(false)}>
                  <div className="flex items-center gap-2 p-3 rounded-xl hover:bg-pink-50 transition-colors">
                    <span className="text-xl">{info.emoji}</span>
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                  </div>
                </Link>
              )
            })}
            <Link href="/my-orders" onClick={() => setShowMenu(false)}>
              <div className="flex items-center gap-2 p-3 rounded-xl hover:bg-pink-50">
                <span className="text-xl">📦</span>
                <span className="text-sm font-medium text-gray-700">Tra cứu đơn hàng</span>
              </div>
            </Link>
          </motion.div>
        )}
      </header>

      {/* Hero Banner - nhỏ gọn */}
      <section className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 py-8 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity }}
            className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <motion.div animate={{ scale: [1.1, 1, 1.1] }} transition={{ duration: 8, repeat: Infinity }}
            className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        </div>
        <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
          <div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-3xl font-bold text-white mb-2">
              Chào mừng ghé thăm <span className="text-yellow-300">BanhBao Shop</span> 🛍️
            </motion.h1>
            <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="text-white/80 text-sm md:text-base">
              Hàng chất, giá tốt, giao nhanh toàn quốc
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="hidden md:flex gap-3">
            <Link href="/products/my-pham">
              <button className="bg-white text-purple-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-shadow">
                Mua ngay →
              </button>
            </Link>
            <Link href="/cart">
              <button className="bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-semibold text-sm border border-white/30 hover:bg-white/30 transition-colors">
                Xem giỏ hàng
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Products by category */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {homepageSlugs.length === 0 ? (
          // Nếu chưa config → hiện tất cả danh mục dạng card
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allCategories.map(cat => {
              const info = CATEGORY_COLORS[cat.slug] || { from: 'from-gray-400 to-gray-500', emoji: '🛒' }
              return (
                <Link key={cat.id} href={`/products/${cat.slug}`}>
                  <motion.div whileHover={{ y: -4 }}
                    className={`bg-gradient-to-br ${info.from} rounded-2xl p-6 text-white text-center shadow-lg cursor-pointer`}>
                    <p className="text-4xl mb-2">{info.emoji}</p>
                    <p className="font-bold">{cat.name}</p>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        ) : (
          homepageSlugs.map(slug => {
            const cat = getCategoryBySlug(slug)
            const products = categoryProducts[slug] || []
            const info = CATEGORY_COLORS[slug] || { from: 'from-gray-400 to-gray-500', emoji: '🛒' }
            if (!cat) return null

            return (
              <section key={slug}>
                {/* Section header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${info.from} flex items-center justify-center text-lg`}>
                      {info.emoji}
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{cat.name}</h2>
                    <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${info.from} hidden md:block`} />
                  </div>
                  <Link href={`/products/${slug}`}>
                    <button className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 font-semibold">
                      Xem tất cả <ChevronRight size={16} />
                    </button>
                  </Link>
                </div>

                {/* Products grid */}
                {products.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 bg-white rounded-2xl">
                    <p className="text-4xl mb-2">📦</p>
                    <p>Chưa có sản phẩm</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {products.map((product, i) => (
                      <motion.div key={product.id}
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -4 }}>
                        <Link href={`/product/${product.id}`}>
                          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 group">
                            <div className="relative aspect-square overflow-hidden bg-gray-50">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={product.image} alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              {product.featured && (
                                <span className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                  Nổi bật
                                </span>
                              )}
                              {product.stock < 10 && product.stock > 0 && (
                                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                  Còn {product.stock}
                                </span>
                              )}
                              {product.stock === 0 && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <span className="bg-white text-gray-700 text-xs px-3 py-1 rounded-full font-semibold">Hết hàng</span>
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight mb-1">{product.name}</p>
                              <p className={`text-sm font-bold bg-gradient-to-r ${info.from} bg-clip-text text-transparent mb-1.5`}>
                                {product.price.toLocaleString('vi-VN')}₫
                              </p>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => handleAddToCart(product, e)}
                                disabled={product.stock === 0}
                                className={`w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm disabled:opacity-40 bg-gradient-to-r ${info.from}`}
                              >
                                {addedId === product.id ? '✓ Đã thêm' : <><Plus size={10} /> MUA</>}
                              </motion.button>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            )
          })
        )}
      </main>

      {/* Toast thông báo thêm giỏ hàng */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-20 left-4 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-xs w-full mx-4"
          >
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm">✓</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">Đã thêm vào giỏ hàng</p>
              <p className="text-sm font-semibold truncate">{toast.name}</p>
            </div>
            <Link href="/cart" onClick={() => setToast(null)}
              className="text-xs text-pink-400 font-bold flex-shrink-0 hover:text-pink-300">
              Xem giỏ →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 mt-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="text-xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">BanhBao Shop 🛍️</p>
              <p className="text-gray-400 text-sm">Mua sắm thông minh, sống đẹp mỗi ngày</p>
            </div>
            <div>
              <p className="font-semibold mb-3">Danh mục</p>
              <div className="space-y-1.5 text-sm text-gray-400">
                {allCategories.map(cat => {
                  const info = CATEGORY_COLORS[cat.slug] || { emoji: '🛒' }
                  return (
                    <Link key={cat.id} href={`/products/${cat.slug}`} className="block hover:text-pink-400 transition-colors">
                      {info.emoji} {cat.name}
                    </Link>
                  )
                })}
                <Link href="/my-orders" className="block hover:text-pink-400 transition-colors">📦 Tra Cứu Đơn Hàng</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-3">Liên hệ</p>
            <div className="space-y-2 text-sm text-gray-400">
                <p className="text-white font-semibold mb-1">💄 Mỹ Phẩm</p>
                <p className="flex items-start gap-2">
                  <span>📞</span>
                  <a href="tel:0389839161" className="hover:text-pink-400 transition-colors">0389 839 161</a>
                </p>
                <p className="text-white font-semibold mt-2 mb-1">🌱 Phân Bón & 🦐 Tôm Giống</p>
                <p className="flex items-start gap-2">
                  <span>📞</span>
                  <a href="tel:0813988058" className="hover:text-pink-400 transition-colors">081 3988 058</a>
                </p>
                <p className="flex items-start gap-2 mt-2">
                  <span>💬</span>
                  <a href="https://www.facebook.com/thitam.truong.5268" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Facebook</a>
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
