import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET all categories
export async function GET(request: NextRequest) {
  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 })
  }

  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    })
    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi tải danh mục' }, { status: 500 })
  }
}
