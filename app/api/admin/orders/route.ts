import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Get all orders (admin)
export async function GET(request: NextRequest) {
  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 })
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json({ orders })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi tải đơn hàng' }, { status: 500 })
  }
}
