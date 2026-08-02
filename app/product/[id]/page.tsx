'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, ArrowLeft, Plus, Minus, Star, Check, User } from 'lucide-react'
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

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const { addItem, items } = useCartStore()

  useEffect(() => {
    if (!productId) return
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data.product)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [productId])

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const totalCartItems = items.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-6xl mb-4"
          >
            🛍️
          </motion.div>
          <p className="text-xl text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <p className="text-xl text-gray-600 mb-4">Không tìm thấy sản phẩm</p>
          <Link href="/">
            <button className="btn-primary">Quay lại trang chủ</button>
          </Link>
        </div>
      </div>
    )
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

      {/* Breadcrumb */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-pink-500 transition-colors">Trang chủ</Link>
          <span>›</span>
          <Link href={`/products/${product.category.slug}`} className="hover:text-pink-500 transition-colors">
            {product.category.name}
          </Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">{product.name}</span>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="relative h-[500px]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {product.featured && (
                  <span className="absolute top-6 left-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                    ⭐ Sản Phẩm Nổi Bật
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <span className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm mb-4">
                {product.category.name}
              </span>
              
              <h1 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-500 text-sm">(127 đánh giá)</span>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {product.description}
              </p>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700 font-medium">Số lượng:</span>
                <div className="flex items-center gap-3 bg-gray-100 rounded-full px-2 py-1">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-full bg-white shadow hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </motion.button>
                  <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 rounded-full bg-white shadow hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </motion.button>
                </div>
                <span className="text-sm text-gray-500">
                  ({product.stock} sản phẩm có sẵn)
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 mb-4"
              >
                {added ? (
                  <>
                    <Check size={24} />
                    Đã Thêm Vào Giỏ Hàng
                  </>
                ) : (
                  <>
                    <ShoppingCart size={24} />
                    Thêm Vào Giỏ Hàng
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Back Button */}
        <div className="mt-12">
          <Link href={`/products/${product.category.slug}`}>
            <motion.button
              whileHover={{ x: -5 }}
              className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors font-medium"
            >
              <ArrowLeft size={20} />
              Quay lại {product.category.name}
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  )
}
