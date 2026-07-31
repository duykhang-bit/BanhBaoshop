'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  LayoutDashboard, Package, Plus, Edit, Trash2, LogOut,
  Search, X, Check, Upload, DollarSign, Box, Star, TrendingUp, ShoppingBag, Settings
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  stock: number
  featured: boolean
  category: { id: string; name: string; slug: string }
}

interface Category {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    categoryId: '',
    stock: '',
    featured: false,
  })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [revenueStats, setRevenueStats] = useState({ total: 0, revenue: 0 })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchData(token)
  }, [router])

  const fetchData = async (token: string) => {
    try {
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      const ordersData = await ordersRes.json()
      setProducts(productsData.products || [])
      setCategories(categoriesData.categories || [])
      // Store orders count for revenue
      const orders = ordersData.orders || []
      const revenue = orders
        .filter((o: any) => o.status !== 'cancelled')
        .reduce((sum: number, o: any) => sum + o.totalAmount, 0)
      setRevenueStats({ total: orders.length, revenue })
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    router.push('/admin/login')
  }

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        image: product.image,
        categoryId: product.category.id,
        stock: product.stock.toString(),
        featured: product.featured,
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        image: '',
        categoryId: categories[0]?.id || '',
        stock: '0',
        featured: false,
      })
    }
    setShowModal(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn file ảnh (jpg, png, webp...)')
      return
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB')
      return
    }

    setUploading(true)
    setUploadError('')

    // Preview ngay bằng base64
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setFormData((prev) => ({ ...prev, image: ev.target!.result as string }))
      }
    }
    reader.readAsDataURL(file)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await res.json()

      if (res.ok) {
        // Thay base64 bằng URL thật sau khi upload xong
        setFormData((prev) => ({ ...prev, image: data.imageUrl }))
      } else {
        setUploadError(data.error || 'Upload thất bại')
        setFormData((prev) => ({ ...prev, image: '' }))
      }
    } catch (error) {
      setUploadError('Lỗi kết nối, thử lại sau')
      setFormData((prev) => ({ ...prev, image: '' }))
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.image) {
      setUploadError('Vui lòng upload ảnh hoặc nhập URL ảnh')
      return
    }
    
    const token = localStorage.getItem('admin_token')
    if (!token) return

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowModal(false)
        fetchData(token)
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return
    const token = localStorage.getItem('admin_token')
    if (!token) return

    try {
      await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchData(token)
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: products.length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
    lowStock: products.filter((p) => p.stock < 10).length,
    featured: products.filter((p) => p.featured).length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          ⚙️
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-purple-600 to-pink-600 text-white p-6 shadow-2xl">
        <div className="mb-8">
          <div className="text-4xl mb-2">👑</div>
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <p className="text-sm text-white/70">BanhBao Shop</p>
        </div>

        <nav className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
            <Package size={20} />
            <span>Sản Phẩm</span>
          </button>
          <Link href="/admin/orders">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
              <ShoppingBag size={20} />
              <span>Đơn Hàng</span>
            </button>
          </Link>
          <Link href="/admin/config">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
              <Settings size={20} />
              <span>Cấu Hình</span>
            </button>
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-colors"
        >
          <LogOut size={20} />
          <span>Đăng Xuất</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Quản Lý Sản Phẩm</h1>
          <p className="text-gray-600">Thêm, sửa, xóa sản phẩm trong cửa hàng</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <Package size={32} className="mb-3 opacity-80" />
            <p className="text-3xl font-bold mb-1">{stats.total}</p>
            <p className="text-blue-100 text-sm">Tổng Sản Phẩm</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <TrendingUp size={32} className="mb-3 opacity-80" />
            <p className="text-3xl font-bold mb-1">
              {revenueStats.revenue >= 1000000
                ? `${(revenueStats.revenue / 1000000).toFixed(1)}M`
                : `${(revenueStats.revenue / 1000).toFixed(0)}K`}
            </p>
            <p className="text-emerald-100 text-sm">Tổng Doanh Thu</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <ShoppingBag size={32} className="mb-3 opacity-80" />
            <p className="text-3xl font-bold mb-1">{revenueStats.total}</p>
            <p className="text-purple-100 text-sm">Tổng Đơn Hàng</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <Box size={32} className="mb-3 opacity-80" />
            <p className="text-3xl font-bold mb-1">{stats.lowStock}</p>
            <p className="text-orange-100 text-sm">Sắp Hết Hàng</p>
          </motion.div>
        </div>

        {/* Search & Add */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              <Plus size={20} />
              Thêm Sản Phẩm
            </motion.button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Hình Ảnh</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tên Sản Phẩm</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Danh Mục</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Giá</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Kho</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Trạng Thái</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {filtered.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">{product.price.toLocaleString('vi-VN')}₫</td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.featured && (
                          <span className="flex items-center gap-1 text-yellow-600 text-sm font-medium">
                            <Star size={14} className="fill-yellow-400" />
                            Nổi bật
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openModal(product)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <Edit size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(product.id)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên Sản Phẩm *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="VD: iPhone 15 Pro Max"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô Tả *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Mô tả chi tiết sản phẩm..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giá (₫) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số Lượng *</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Danh Mục *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hình Ảnh Sản Phẩm *</label>
                  
                  {/* Image Preview */}
                  {formData.image && (
                    <div className="mb-3 relative w-full h-48 rounded-xl overflow-hidden border-2 border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div className="mb-3">
                    <label className="cursor-pointer">
                      <div className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-pink-400 hover:bg-pink-50 transition-colors">
                        <Upload size={20} className="text-gray-500" />
                        <span className="text-gray-700 font-medium">
                          {uploading ? 'Đang upload...' : 'Upload từ máy tính'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    {uploadError && (
                      <p className="text-red-500 text-sm mt-2">⚠️ {uploadError}</p>
                    )}
                  </div>
                  
                  {/* Or separator */}
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-sm text-gray-500">hoặc</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                  
                  {/* URL Input */}
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="https://example.com/image.jpg hoặc /uploads/image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Hoặc nhập URL ảnh từ internet</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-300"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Star size={16} className="text-yellow-500" />
                    Sản phẩm nổi bật
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg"
                  >
                    {editingProduct ? 'Cập Nhật' : 'Thêm Mới'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
