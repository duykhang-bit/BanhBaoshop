import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET: Thống kê cho admin dashboard
export async function GET(request: NextRequest) {
  const admin = verifyToken(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfWeek.getDate() - 7)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Lượt truy cập
    const [visitorsToday, visitorsWeek, visitorsMonth, visitorsTotal] = await Promise.all([
      prisma.visitorLog.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.visitorLog.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.visitorLog.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.visitorLog.count(),
    ])

    // Unique visitors (by IP)
    const uniqueToday = await prisma.visitorLog.groupBy({
      by: ['ip'],
      where: { createdAt: { gte: startOfToday } },
    })
    const uniqueWeek = await prisma.visitorLog.groupBy({
      by: ['ip'],
      where: { createdAt: { gte: startOfWeek } },
    })

    // Tài khoản
    const [totalUsers, usersToday, usersWeek] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
    ])

    // Pending reset requests
    const pendingResets = await prisma.passwordResetRequest.count({ where: { status: 'pending' } })

    return NextResponse.json({
      visitors: {
        today: visitorsToday,
        week: visitorsWeek,
        month: visitorsMonth,
        total: visitorsTotal,
        uniqueToday: uniqueToday.length,
        uniqueWeek: uniqueWeek.length,
      },
      users: {
        total: totalUsers,
        today: usersToday,
        week: usersWeek,
      },
      pendingResets,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
