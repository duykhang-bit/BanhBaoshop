import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET all products (admin)
export async function GET(request: NextRequest) {
  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 })
  }

  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi tải sản phẩm' }, { status: 500 })
  }
}

// POST create product
export async function POST(request: NextRequest) {
  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, price, image, categoryId, stock, featured } = body

    if (!name || !description || !price || !image || !categoryId) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        categoryId,
        stock: parseInt(stock) || 0,
        featured: featured || false,
      },
      include: { category: true },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi tạo sản phẩm' }, { status: 500 })
  }
}
