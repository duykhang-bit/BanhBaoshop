'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ShoppingBag, LogOut, Settings, Plus, Trash2, Tag, Truck, Save, CheckCircle } from 'lucide-react'

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
}

const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-pink-500' : 'bg-gray-300'}`}
  >
    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
  </button>
)

export default function AdminConfigPage() {
  const router = useRouter()
  const [config, setConfig] = useState<Config>({
    shippingFee: 30000,
    freeShippingMin: 300000,
    shippingEnabled: true,
    showShippingHint: true,
    promoEnabled: false,
    promoCodes: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newCode, setNewCode] = useState({ code: '', type: 'percent' as 'percent' | 'fixed', value: 10, minOrder: 0, active: true })

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { router.push('/admin/login'); return }
    fetch('/api/admin/config', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.error) { console.error(data.error); return }
        setConfig({
          shippingFee: data.shippingFee ?? 30000,
          freeShippingMin: data.freeShippingMin ?? 300000,
          shippingEnabled: data.shippingEnabled ?? true,
          showShippingHint: data.showShippingHint ?? true,
          promoEnabled: data.promoEnabled ?? false,
          promoCodes: data.promoCodes ?? [],
        })
      })
      .finally(() => setLoading(false))
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
      const data = await res.json()
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert('Lỗi: ' + data.error)
      }
    } catch {
      alert('Không thể kết nối server')
    } finally {
      setSaving(false)
    }
  }

  const addPromoCode = () => {
    if (!newCode.code.trim()) return
    setConfig(prev => ({ ...prev, promoCodes: [...prev.promoCodes, { ...newCode, code: newCode.code.toUpperCase() }] }))
    setNewCode({ code: '', type: 'percent', value: 10, minOrder: 0, active: true })
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="text-6xl">⚙️</motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-60 bg-gradient-to-b from-purple-600 to-pink-600 text-white p-5 shadow-2xl z-10">
        <div className="mb-8">
          <div className="text-3xl mb-1">👑</div>
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-xs text-white/60">BanhBao Shop</p>
        </div>
        <nav className="space-y-1">
          <Link href="/admin/dashboard">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm">
              <Package size={18} /><span>Sản Phẩm</span>
            </button>
          </Link>
          <Link href="/admin/orders">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm">
              <ShoppingBag size={18} /><span>Đơn Hàng</span>
            </button>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/20 text-sm">
            <Settings size={18} /><span>Cấu Hình</span>
          </button>
        </nav>
        <button onClick={handleLogout} className="absolute bottom-5 left-5 right-5 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-colors text-sm">
          <LogOut size={18} /><span>Đăng Xuất</span>
        </button>
      </div>

      {/* Main */}
      <div className="ml-60 p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Cấu Hình Cửa Hàng</h1>
            <p className="text-gray-500 text-sm mt-1">Phí vận chuyển & mã khuyến mãi</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg text-white transition-all ${saved ? 'bg-green-500' : 'bg-gradient-to-r from-pink-500 to-purple-600'} disabled:opacity-50`}
          >
            {saved ? <><CheckCircle size={18} /> Đã lưu!</> : saving ? '⏳ Đang lưu...' : <><Save size={18} /> Lưu thay đổi</>}
          </motion.button>
        </div>

        {/* Shipping Config */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck size={18} className="text-blue-600" />
              </div>
              Phí Vận Chuyển
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Hiển thị cho khách</span>
              <Toggle value={config.shippingEnabled} onChange={() => setConfig(p => ({ ...p, shippingEnabled: !p.shippingEnabled }))} />
            </div>
          </div>

          <div className={`transition-all duration-300 ${!config.shippingEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phí vận chuyển (₫)</label>
                <input
                  type="number" value={config.shippingFee}
                  onChange={e => setConfig(p => ({ ...p, shippingFee: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Miễn phí ship từ (₫)</label>
                <input
                  type="number" value={config.freeShippingMin}
                  onChange={e => setConfig(p => ({ ...p, freeShippingMin: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none font-semibold"
                />
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-sm flex flex-wrap gap-4">
              <span>📦 Dưới {config.freeShippingMin.toLocaleString()}₫ → <strong className="text-red-500">+{config.shippingFee.toLocaleString()}₫</strong></span>
              <span>🎉 Từ {config.freeShippingMin.toLocaleString()}₫ → <strong className="text-green-600">Miễn phí</strong></span>
            </div>

            {/* Show hint toggle */}
            <div className="mt-3 flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <div>
                <p className="text-sm font-semibold text-gray-700">Hiện gợi ý "Mua thêm X để miễn phí ship"</p>
                <p className="text-xs text-gray-500 mt-0.5">Hiện thông báo nhắc khách mua thêm để đạt mức miễn ship</p>
              </div>
              <Toggle value={config.showShippingHint} onChange={() => setConfig(p => ({ ...p, showShippingHint: !p.showShippingHint }))} />
            </div>
          </div>

          {!config.shippingEnabled && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-xl text-sm text-yellow-700 font-medium">
              ⚠️ Phí vận chuyển đang bị ẩn — khách sẽ thấy miễn phí ship
            </div>
          )}
        </motion.div>

        {/* Promo Codes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                <Tag size={18} className="text-pink-600" />
              </div>
              Mã Khuyến Mãi
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Hiển thị cho khách</span>
              <Toggle value={config.promoEnabled} onChange={() => setConfig(p => ({ ...p, promoEnabled: !p.promoEnabled }))} />
            </div>
          </div>

          {/* Add new */}
          <div className={`bg-gray-50 rounded-xl p-4 mb-4 transition-all duration-300 ${!config.promoEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <p className="text-xs font-bold text-gray-600 mb-3">➕ Thêm mã mới</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Mã giảm giá</label>
                <input
                  type="text" value={newCode.code}
                  onChange={e => setNewCode(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 font-mono font-bold text-sm uppercase"
                  placeholder="SALE20"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Loại giảm</label>
                <select
                  value={newCode.type}
                  onChange={e => setNewCode(p => ({ ...p, type: e.target.value as 'percent' | 'fixed' }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none text-sm"
                >
                  <option value="percent">% Phần trăm</option>
                  <option value="fixed">₫ Số tiền</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Giá trị {newCode.type === 'percent' ? '(%)' : '(₫)'}</label>
                <input
                  type="number" value={newCode.value}
                  onChange={e => setNewCode(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none text-sm"
                  min={0} max={newCode.type === 'percent' ? 100 : undefined}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Đơn tối thiểu (₫)</label>
                <input
                  type="number" value={newCode.minOrder}
                  onChange={e => setNewCode(p => ({ ...p, minOrder: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none text-sm"
                />
              </div>
            </div>
            <button onClick={addPromoCode}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
            >
              <Plus size={16} /> Thêm mã
            </button>
          </div>

          {/* List */}
          {config.promoCodes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Tag size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chưa có mã khuyến mãi nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {config.promoCodes.map((promo, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border-2 ${promo.active ? 'border-pink-200 bg-pink-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-pink-600 bg-white px-2 py-1 rounded-lg border border-pink-200 text-sm">
                      {promo.code}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        Giảm {promo.type === 'percent' ? `${promo.value}%` : `${promo.value.toLocaleString()}₫`}
                      </p>
                      <p className="text-xs text-gray-500">
                        Đơn tối thiểu: {promo.minOrder > 0 ? `${promo.minOrder.toLocaleString()}₫` : 'Không giới hạn'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Toggle
                      value={promo.active}
                      onChange={() => setConfig(prev => ({
                        ...prev,
                        promoCodes: prev.promoCodes.map((p, i) => i === idx ? { ...p, active: !p.active } : p)
                      }))}
                    />
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, promoCodes: prev.promoCodes.filter((_, i) => i !== idx) }))}
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!config.promoEnabled && config.promoCodes.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-xl text-sm text-yellow-700 font-medium">
              ⚠️ Mã khuyến mãi đang bị ẩn — khách không thấy ô nhập mã
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
