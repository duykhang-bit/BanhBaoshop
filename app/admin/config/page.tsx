'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ShoppingBag, LogOut, Settings, Plus, Trash2, Tag, Truck, Save, CheckCircle, LayoutGrid } from 'lucide-react'

interface PromoCode {
  code: string
  type: 'percent' | 'fixed'
  value: number
  minOrder: number
  active: boolean
}

interface Config {
  shippingFee: number
  freeShippingMin: number
  shippingEnabled: boolean
  showShippingHint: boolean
  promoEnabled: boolean
  promoCodes: PromoCode[]
  homepageCategories: string[]
  hiddenNavItems: string[]
}

interface Category {
  id: string
  name: string
  slug: string
}

const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
  <button type="button" onClick={onChange}
    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-pink-500' : 'bg-gray-300'}`}>
    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
  </button>
)

export default function AdminConfigPage() {
  const router = useRouter()
  const [config, setConfig] = useState<Config>({
    shippingFee: 30000, freeShippingMin: 300000, shippingEnabled: true,
    showShippingHint: true, promoEnabled: false, promoCodes: [], homepageCategories: [], hiddenNavItems: [],
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newCode, setNewCode] = useState({ code: '', type: 'percent' as 'percent' | 'fixed', value: 10, minOrder: 0, active: true })

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { router.push('/admin/login'); return }

    Promise.all([
      fetch('/api/admin/config', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([configData, catData]) => {
      if (!configData.error) {
        setConfig({
          shippingFee: configData.shippingFee ?? 30000,
          freeShippingMin: configData.freeShippingMin ?? 300000,
          shippingEnabled: configData.shippingEnabled ?? true,
          showShippingHint: configData.showShippingHint ?? true,
          promoEnabled: configData.promoEnabled ?? false,
          promoCodes: configData.promoCodes ?? [],
          homepageCategories: configData.homepageCategories ?? [],
        })
      }
      setCategories(catData.categories || [])
    }).finally(() => setLoading(false))
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    const token = localStorage.getItem('admin_token')
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(config),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
      else { const d = await res.json(); alert('Lỗi: ' + d.error) }
    } catch { alert('Không thể kết nối server') }
    finally { setSaving(false) }
  }

  const toggleCategory = (slug: string) => {
    setConfig(prev => ({
      ...prev,
      homepageCategories: prev.homepageCategories.includes(slug)
        ? prev.homepageCategories.filter(s => s !== slug)
        : [...prev.homepageCategories, slug]
    }))
  }

  const moveCat = (slug: string, dir: 'up' | 'down') => {
    setConfig(prev => {
      const arr = [...prev.homepageCategories]
      const idx = arr.indexOf(slug)
      if (dir === 'up' && idx > 0) [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
      if (dir === 'down' && idx < arr.length - 1) [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]]
      return { ...prev, homepageCategories: arr }
    })
  }

  const addPromoCode = () => {
    if (!newCode.code.trim()) return
    setConfig(prev => ({ ...prev, promoCodes: [...prev.promoCodes, { ...newCode, code: newCode.code.toUpperCase() }] }))
    setNewCode({ code: '', type: 'percent', value: 10, minOrder: 0, active: true })
  }

  const handleLogout = () => { localStorage.removeItem('admin_token'); router.push('/admin/login') }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="text-6xl">⚙️</motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-60 bg-gradient-to-b from-purple-600 to-pink-600 text-white p-5 shadow-2xl z-10">
        <div className="mb-8"><div className="text-3xl mb-1">👑</div><h2 className="text-xl font-bold">Admin Panel</h2></div>
        <nav className="space-y-1">
          <Link href="/admin/dashboard"><button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/10 text-sm"><Package size={18} />Sản Phẩm</button></Link>
          <Link href="/admin/orders"><button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/10 text-sm"><ShoppingBag size={18} />Đơn Hàng</button></Link>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/20 text-sm"><Settings size={18} />Cấu Hình</button>
        </nav>
        <button onClick={handleLogout} className="absolute bottom-5 left-5 right-5 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-sm">
          <LogOut size={18} />Đăng Xuất
        </button>
      </div>

      {/* Main */}
      <div className="ml-60 p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Cấu Hình Cửa Hàng</h1>
            <p className="text-gray-500 text-sm mt-1">Trang chủ, vận chuyển & khuyến mãi</p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg text-white ${saved ? 'bg-green-500' : 'bg-gradient-to-r from-pink-500 to-purple-600'} disabled:opacity-50`}>
            {saved ? <><CheckCircle size={18} /> Đã lưu!</> : saving ? '⏳ Đang lưu...' : <><Save size={18} /> Lưu thay đổi</>}
          </motion.button>
        </div>

        {/* Homepage Categories */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <LayoutGrid size={18} className="text-purple-600" />
            </div>
            Danh Mục Hiển Thị Trang Chủ
          </h2>
          <p className="text-sm text-gray-500 mb-4">Chọn danh mục sẽ hiện sản phẩm trên trang chủ. Kéo thứ tự bằng nút ↑↓</p>

          <div className="space-y-2">
            {categories.map(cat => {
              const isOn = config.homepageCategories.includes(cat.slug)
              const idx = config.homepageCategories.indexOf(cat.slug)
              return (
                <div key={cat.id} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${isOn ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <Toggle value={isOn} onChange={() => toggleCategory(cat.slug)} />
                    <span className="font-semibold text-gray-800">{cat.name}</span>
                    {isOn && <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full font-bold">#{idx + 1}</span>}
                  </div>
                  {isOn && (
                    <div className="flex gap-1">
                      <button onClick={() => moveCat(cat.slug, 'up')} disabled={idx === 0}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-30 text-sm flex items-center justify-center">↑</button>
                      <button onClick={() => moveCat(cat.slug, 'down')} disabled={idx === config.homepageCategories.length - 1}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-30 text-sm flex items-center justify-center">↓</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {config.homepageCategories.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">Chưa chọn danh mục nào → trang chủ sẽ không hiện sản phẩm</p>
          )}
        </motion.div>

        {/* Nav Items Config */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-base">🧭</span>
            </div>
            Thanh Điều Hướng
          </h2>
          <p className="text-sm text-gray-500 mb-4">Ẩn/hiện các mục trong thanh nav trang chủ</p>
          <div className="space-y-2">
            {[
              ...categories.map(cat => ({ key: cat.slug, label: cat.name })),
              { key: 'my-orders', label: '📦 Đơn hàng' },
            ].map(item => {
              const isHidden = config.hiddenNavItems.includes(item.key)
              return (
                <div key={item.key} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${isHidden ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-green-200 bg-green-50'}`}>
                  <span className="font-medium text-gray-800 text-sm">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{isHidden ? 'Ẩn' : 'Hiện'}</span>
                    <Toggle
                      value={!isHidden}
                      onChange={() => setConfig(prev => ({
                        ...prev,
                        hiddenNavItems: isHidden
                          ? prev.hiddenNavItems.filter(k => k !== item.key)
                          : [...prev.hiddenNavItems, item.key]
                      }))}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Shipping */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><Truck size={18} className="text-blue-600" /></div>
              Phí Vận Chuyển
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Hiển thị</span>
              <Toggle value={config.shippingEnabled} onChange={() => setConfig(p => ({ ...p, shippingEnabled: !p.shippingEnabled }))} />
            </div>
          </div>
          <div className={`transition-all ${!config.shippingEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phí vận chuyển (₫)</label>
                <input type="number" value={config.shippingFee}
                  onChange={e => setConfig(p => ({ ...p, shippingFee: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Miễn phí ship từ (₫)</label>
                <input type="number" value={config.freeShippingMin}
                  onChange={e => setConfig(p => ({ ...p, freeShippingMin: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none font-semibold" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-sm font-semibold text-gray-700">Hiện gợi ý "Mua thêm X để miễn phí ship"</p>
              <Toggle value={config.showShippingHint} onChange={() => setConfig(p => ({ ...p, showShippingHint: !p.showShippingHint }))} />
            </div>
          </div>
        </motion.div>

        {/* Promo Codes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center"><Tag size={18} className="text-pink-600" /></div>
              Mã Khuyến Mãi
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Hiển thị</span>
              <Toggle value={config.promoEnabled} onChange={() => setConfig(p => ({ ...p, promoEnabled: !p.promoEnabled }))} />
            </div>
          </div>

          <div className={`bg-gray-50 rounded-xl p-4 mb-4 ${!config.promoEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <p className="text-xs font-bold text-gray-600 mb-3">➕ Thêm mã mới</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Mã</label>
                <input type="text" value={newCode.code} onChange={e => setNewCode(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 font-mono font-bold text-sm uppercase" placeholder="SALE20" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Loại</label>
                <select value={newCode.type} onChange={e => setNewCode(p => ({ ...p, type: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none text-sm">
                  <option value="percent">% Phần trăm</option>
                  <option value="fixed">₫ Số tiền</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Giá trị</label>
                <input type="number" value={newCode.value} onChange={e => setNewCode(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Đơn tối thiểu</label>
                <input type="number" value={newCode.minOrder} onChange={e => setNewCode(p => ({ ...p, minOrder: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none text-sm" />
              </div>
            </div>
            <button onClick={addPromoCode} className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">
              <Plus size={16} /> Thêm mã
            </button>
          </div>

          {config.promoCodes.length === 0 ? (
            <div className="text-center py-6 text-gray-400"><Tag size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">Chưa có mã nào</p></div>
          ) : (
            <div className="space-y-2">
              {config.promoCodes.map((promo, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border-2 ${promo.active ? 'border-pink-200 bg-pink-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-pink-600 bg-white px-2 py-1 rounded-lg border border-pink-200 text-sm">{promo.code}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Giảm {promo.type === 'percent' ? `${promo.value}%` : `${promo.value.toLocaleString()}₫`}</p>
                      <p className="text-xs text-gray-500">Tối thiểu: {promo.minOrder > 0 ? `${promo.minOrder.toLocaleString()}₫` : 'Không giới hạn'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Toggle value={promo.active} onChange={() => setConfig(prev => ({ ...prev, promoCodes: prev.promoCodes.map((p, i) => i === idx ? { ...p, active: !p.active } : p) }))} />
                    <button onClick={() => setConfig(prev => ({ ...prev, promoCodes: prev.promoCodes.filter((_, i) => i !== idx) }))}
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
