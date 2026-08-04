'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ShoppingCart, ArrowLeft, Plus } from 'lucide-react'
import { useCartStore } from '@/lib/cartStore'

interface Product {
  id: string
  name: string
  price: number
  image: string
  stock: number
  featured: boolean
  category: { name: string; slug: string }
}

const CATEGORY_COLORS: Record<string, string> = {
  'my-pham':   'from-pink-500 to-rose-400',
  'phan-bon':  'from-green-500 to-emerald-400',
  'cong-nghe': 'from-blue-500 to-cyan-400',
  'tom-giong': 'from-orange-400 to-amber-400',
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q') || ''
  const [query, setQuery] = useState(q)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [addedId, setAddedId] = useState<string | null>(null)
  const { addItem, items } = useCartStore()
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => {
    if (!q.trim()) return
    setLoading(true)
    fetch(`/api/products?search=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(data => setProducts(data.products || []))
      .finally(() => setLoading(false))
  }, [q])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const handleAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1, categorySlug: product.category?.slug })
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
          </Link>
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              autoFocus />
            <button type="submit" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
              Tìm
            </button>
          </form>
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
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search info */}
        {q && (
          <div className="mb-4">
            <p className="text-gray-600 text-sm">
              {loading ? 'Đang tìm...' : (
                <>Kết quả cho <span className="font-bold text-pink-600">"{q}"</span>: <span className="font-semibold">{products.length}</span> sản phẩm</>
              )}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && q && products.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy sản phẩm</p>
            <p className="text-gray-500 text-sm mb-6">Thử từ khóa khác hoặc xem tất cả sản phẩm</p>
            <Link href="/">
              <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold">
                Về trang chủ
              </button>
            </Link>
          </div>
        )}

        {/* Empty state */}
        {!q && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl font-semibold text-gray-700">Nhập từ khóa để tìm kiếm</p>
          </div>
        )}

        {/* Results */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {products.map((product, i) => {
              const gradient = CATEGORY_COLORS[product.category.slug] || 'from-gray-400 to-gray-500'
              return (
                <motion.div key={product.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }} whileHover={{ y: -4 }}>
                  <Link href={`/product/${product.id}`}>
                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 group">
                      <div className="relative aspect-square overflow-hidden bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.image} alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        {product.featured && (
                          <span className="absolute top-1 left-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                            Nổi bật
                          </span>
                        )}
                        <span className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {product.category.name}
                        </span>
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight mb-1">{product.name}</p>
                        <p className={`text-sm font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1.5`}>
                          {product.price.toLocaleString('vi-VN')}₫
                        </p>
                        <motion.button whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleAdd(product, e)}
                          disabled={product.stock === 0}
                          className={`w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-40 bg-gradient-to-r ${gradient}`}>
                          {addedId === product.id ? '✓ Đã thêm' : <><Plus size={10} /> MUA</>}
                        </motion.button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-spin">🔍</div></div>}>
      <SearchContent />
    </Suspense>
  )
}
