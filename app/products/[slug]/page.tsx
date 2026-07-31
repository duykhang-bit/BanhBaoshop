'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingCart, ArrowLeft, Search, Filter, Star,
  Sparkles, Sprout, Laptop, ShoppingBag, User
} from 'lucide-react'
import { useCartStore } from '@/lib/cartStore'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  stock: number
  featured: boolean
  category: { name: string; slug: string }
}

const categoryInfo: Record<string, { label: string; icon: React.ReactNode; color: string; gradient: string; bg: string; emoji: string }> = {
  'my-pham': {
    label: 'Mỹ Phẩm',
    icon: <Sparkles className="inline-block" size={28} />,
    color: 'text-pink-600',
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    emoji: '✨',
  },
  'phan-bon': {
    label: 'Phân Bón',
    icon: <Sprout className="inline-block" size={28} />,
    color: 'text-green-600',
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50',
    emoji: '🌱',
  },
  'cong-nghe': {
    label: 'Công Nghệ',
    icon: <Laptop className="inline-block" size={28} />,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    emoji: '💻',
  },
}

export default function ProductsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const { addItem, items } = useCartStore()
  const [addedId, setAddedId] = useState<string | null>(null)

  const info = categoryInfo[slug] || {
    label: 'Sản Phẩm',
    icon: <ShoppingBag size={28} />,
    color: 'text-gray-600',
    gradient: 'from-gray-400 to-gray-600',
    bg: 'bg-gray-50',
    emoji: '🛒',
  }

  useEffect(() => {
    if (!slug) return
    fetch(`/api/products?category=${slug}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
        setFiltered(data.products || [])
        setLoading(false)
      })
  }, [slug])

  useEffect(() => {
    let result = [...products]
    if (search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price)
    else result.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
    setFiltered(result)
  }, [search, sortBy, products])

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    })
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  const totalCartItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className={`min-h-screen ${info.bg}`}>
      {/* Navbar */}
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
            <Link href="/cart">
              <motion.button whileHover={{ scale: 1.1 }} className="relative">
                <ShoppingCart size={24} className="text-gray-700 hover:text-pink-500 transition-colors" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalCartItems}
                  </span>
                )}
              </motion.button>
            </Link>
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

      {/* Hero Banner */}
      <div className={`bg-gradient-to-br ${info.gradient} py-16`}>
        <div className="container mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-8xl mb-4"
          >
            {info.emoji}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold mb-3"
          >
            {info.label}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-lg"
          >
            {products.length} sản phẩm chất lượng cao
          </motion.p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-pink-500 transition-colors">Trang chủ</Link>
          <span>›</span>
          <span className={info.color + ' font-medium'}>{info.label}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="py-3 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white shadow-sm"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse shadow-md" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-2xl text-gray-500">Không tìm thấy sản phẩm nào</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filtered.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.07 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden group"
                >
                  <Link href={`/product/${product.id}`}>
                    <div className="relative overflow-hidden h-52">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized
                      />
                      {product.featured && (
                        <span className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                          ⭐ Nổi bật
                        </span>
                      )}
                      {product.stock < 10 && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Còn {product.stock}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 hover:text-pink-600 transition-colors leading-tight">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>

                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">(5.0)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-xl font-bold bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent`}>
                        {product.price.toLocaleString('vi-VN')}₫
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAddToCart(product)}
                        className={`p-2 rounded-full bg-gradient-to-r ${info.gradient} text-white shadow-md relative overflow-hidden`}
                      >
                        {addedId === product.id ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-sm px-1"
                          >✓</motion.span>
                        ) : (
                          <ShoppingCart size={18} />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="container mx-auto px-6 py-8">
        <Link href="/">
          <motion.button
            whileHover={{ x: -5 }}
            className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Quay lại trang chủ
          </motion.button>
        </Link>
      </div>
    </div>
  )
}
