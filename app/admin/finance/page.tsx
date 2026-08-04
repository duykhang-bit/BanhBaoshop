'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  PieChart, Plus, Trash2, Package, Truck, Gift, MoreHorizontal
} from 'lucide-react'

interface FinanceData {
  summary: {
    totalRevenue: number
    totalCost: number
    totalExpenses: number
    totalProfit: number
    orderCount: number
    profitMargin: number
  }
  chartData: { date: string; revenue: number; cost: number; expense: number; profit: number }[]
  expenses: Expense[]
}

interface Expense {
  id: string
  type: string
  description: string
  amount: number
  createdAt: string
}

const EXPENSE_TYPES = [
  { value: 'restock', label: 'Nhập hàng', icon: '📦', color: 'bg-blue-100 text-blue-700' },
  { value: 'shipping', label: 'Phí ship', icon: '🚚', color: 'bg-orange-100 text-orange-700' },
  { value: 'packaging', label: 'Đóng gói', icon: '🎁', color: 'bg-pink-100 text-pink-700' },
  { value: 'other', label: 'Khác', icon: '💰', color: 'bg-gray-100 text-gray-700' },
]

export default function FinancePage() {
  const router = useRouter()
  const [data, setData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [expenseForm, setExpenseForm] = useState({ type: 'restock', description: '', amount: '' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { router.push('/admin/login'); return }
    fetchData(token)
  }, [period])

  const fetchData = async (token?: string) => {
    const t = token || localStorage.getItem('admin_token')
    if (!t) return
    try {
      const res = await fetch(`/api/admin/finance?period=${period}`, {
        headers: { Authorization: `Bearer ${t}` },
      })
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('admin_token')
    if (!token) return
    setAdding(true)
    try {
      await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(expenseForm),
      })
      setExpenseForm({ type: 'restock', description: '', amount: '' })
      setShowAddExpense(false)
      fetchData(token)
    } catch (error) {
      console.error(error)
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Xóa chi phí này?')) return
    const token = localStorage.getItem('admin_token')
    if (!token) return
    await fetch('/api/admin/expenses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    })
    fetchData(token)
  }

  const formatMoney = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
    return n.toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">⏳ Đang tải...</p>
      </div>
    )
  }

  const summary = data?.summary || { totalRevenue: 0, totalCost: 0, totalExpenses: 0, totalProfit: 0, orderCount: 0, profitMargin: 0 }
  const chartData = data?.chartData || []
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <PieChart size={20} /> Tài Chính & Lợi Nhuận
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {['week', 'month', 'all'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  period === p ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {p === 'week' ? '7 ngày' : p === 'month' ? 'Tháng này' : 'Tất cả'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-green-600" />
              </div>
              <span className="text-xs text-gray-500">Doanh thu</span>
            </div>
            <p className="text-xl font-bold text-gray-800">{formatMoney(summary.totalRevenue)}₫</p>
            <p className="text-xs text-gray-400 mt-1">{summary.orderCount} đơn hàng</p>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package size={16} className="text-blue-600" />
              </div>
              <span className="text-xs text-gray-500">Giá vốn</span>
            </div>
            <p className="text-xl font-bold text-gray-800">{formatMoney(summary.totalCost)}₫</p>
            <p className="text-xs text-gray-400 mt-1">Chi phí nhập hàng</p>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Truck size={16} className="text-orange-600" />
              </div>
              <span className="text-xs text-gray-500">Chi phí khác</span>
            </div>
            <p className="text-xl font-bold text-gray-800">{formatMoney(summary.totalExpenses)}₫</p>
            <p className="text-xs text-gray-400 mt-1">Ship, đóng gói, khác</p>
          </motion.div>

          <motion.div whileHover={{ y: -3 }}
            className={`rounded-2xl p-5 shadow-sm border ${
              summary.totalProfit >= 0 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
            }`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${summary.totalProfit >= 0 ? 'bg-green-200' : 'bg-red-200'}`}>
                {summary.totalProfit >= 0 ? <TrendingUp size={16} className="text-green-700" /> : <TrendingDown size={16} className="text-red-700" />}
              </div>
              <span className="text-xs text-gray-500">Lợi nhuận</span>
            </div>
            <p className={`text-xl font-bold ${summary.totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {summary.totalProfit >= 0 ? '+' : ''}{formatMoney(summary.totalProfit)}₫
            </p>
            <p className="text-xs text-gray-400 mt-1">Biên lợi nhuận: {summary.profitMargin}%</p>
          </motion.div>
        </div>

        {/* Simple Bar Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">📊 Biểu đồ doanh thu & lợi nhuận</h3>
            <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
              {chartData.map((d, i) => {
                const revenueHeight = (d.revenue / maxRevenue) * 100
                const profitHeight = Math.abs(d.profit) / maxRevenue * 100
                return (
                  <div key={i} className="flex flex-col items-center gap-1 min-w-[40px] flex-shrink-0">
                    <div className="flex items-end gap-0.5 h-32">
                      {/* Revenue bar */}
                      <div
                        className="w-4 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                        style={{ height: `${revenueHeight}%` }}
                        title={`Doanh thu: ${d.revenue.toLocaleString()}₫`}
                      />
                      {/* Profit bar */}
                      <div
                        className={`w-4 rounded-t ${d.profit >= 0 ? 'bg-gradient-to-t from-green-500 to-green-300' : 'bg-gradient-to-t from-red-400 to-red-300'}`}
                        style={{ height: `${Math.min(profitHeight, 100)}%` }}
                        title={`Lợi nhuận: ${d.profit.toLocaleString()}₫`}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {d.date.slice(5)}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded-sm" /> Doanh thu</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded-sm" /> Lãi</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded-sm" /> Lỗ</span>
            </div>
          </div>
        )}

        {/* Expenses Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">💸 Chi phí</h3>
            <button onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
              <Plus size={14} /> Thêm chi phí
            </button>
          </div>

          {/* Add expense form */}
          {showAddExpense && (
            <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAddExpense}
              className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <select value={expenseForm.type} onChange={e => setExpenseForm({ ...expenseForm, type: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm">
                  {EXPENSE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                  ))}
                </select>
                <input type="text" placeholder="Mô tả (VD: Nhập son MAC)"
                  value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm col-span-2" required />
                <input type="number" placeholder="Số tiền (₫)"
                  value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm" required />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={adding}
                  className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50">
                  {adding ? '⏳' : '✓ Lưu'}
                </button>
                <button type="button" onClick={() => setShowAddExpense(false)}
                  className="bg-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-xs font-medium">
                  Hủy
                </button>
              </div>
            </motion.form>
          )}

          {/* Expense list */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {(data?.expenses || []).length === 0 ? (
              <p className="text-center text-gray-400 py-6 text-sm">Chưa có chi phí nào</p>
            ) : (
              (data?.expenses || []).map(exp => {
                const typeInfo = EXPENSE_TYPES.find(t => t.value === exp.type) || EXPENSE_TYPES[3]
                return (
                  <div key={exp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${typeInfo.color}`}>
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                      <div>
                        <p className="text-sm text-gray-800">{exp.description}</p>
                        <p className="text-xs text-gray-400">{new Date(exp.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-red-600">-{exp.amount.toLocaleString()}₫</span>
                      <button onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1 text-gray-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Hướng dẫn */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800">
          <p className="font-bold mb-1">💡 Hướng dẫn:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Giá vốn:</strong> Vào chỉnh sửa sản phẩm → nhập "Giá vốn" cho mỗi SP</li>
            <li><strong>Chi phí:</strong> Mỗi lần nhập hàng/phát sinh chi phí → bấm "Thêm chi phí" ở trên</li>
            <li><strong>Lợi nhuận</strong> = Doanh thu - Giá vốn - Chi phí khác</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
