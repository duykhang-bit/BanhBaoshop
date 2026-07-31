import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET public categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
    })
    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi tải danh mục' }, { status: 500 })
  }
}
