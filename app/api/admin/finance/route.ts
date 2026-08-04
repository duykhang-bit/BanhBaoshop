import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET: Lấy dữ liệu tài chính
export async function GET(request: NextRequest) {
  const admin = verifyToken(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // week, month, all

    const now = new Date()
    let startDate: Date

    if (period === 'week') {
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else {
      startDate = new Date(0) // all time
    }

    // Đơn hàng hoàn thành (không bị hủy)
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'cancelled' },
      },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    })

    // Lấy tất cả products để biết giá vốn
    const products = await prisma.product.findMany({
      select: { id: true, name: true, costPrice: true, price: true },
    })
    const productMap = new Map(products.map(p => [p.id, p]))

    // Chi phí
    const expenses = await prisma.expense.findMany({
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: 'asc' },
    })

    // Tính toán
    let totalRevenue = 0
    let totalCost = 0
    const dailyData: Record<string, { revenue: number; cost: number; expense: number; profit: number }> = {}

    orders.forEach(order => {
      const day = order.createdAt.toISOString().slice(0, 10)
      if (!dailyData[day]) dailyData[day] = { revenue: 0, cost: 0, expense: 0, profit: 0 }

      let orderRevenue = order.totalAmount
      let orderCost = 0

      order.items.forEach(item => {
        const product = productMap.get(item.productId)
        orderCost += (product?.costPrice || 0) * item.quantity
      })

      totalRevenue += orderRevenue
      totalCost += orderCost
      dailyData[day].revenue += orderRevenue
      dailyData[day].cost += orderCost
    })

    let totalExpenses = 0
    expenses.forEach(exp => {
      const day = exp.createdAt.toISOString().slice(0, 10)
      if (!dailyData[day]) dailyData[day] = { revenue: 0, cost: 0, expense: 0, profit: 0 }
      dailyData[day].expense += exp.amount
      totalExpenses += exp.amount
    })

    // Tính profit cho mỗi ngày
    Object.keys(dailyData).forEach(day => {
      dailyData[day].profit = dailyData[day].revenue - dailyData[day].cost - dailyData[day].expense
    })

    const totalProfit = totalRevenue - totalCost - totalExpenses

    // Chart data (sorted by date)
    const chartData = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }))

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalCost,
        totalExpenses,
        totalProfit,
        orderCount: orders.length,
        profitMargin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0,
      },
      chartData,
      expenses,
    })
  } catch (error) {
    console.error('Finance error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
