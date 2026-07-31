import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, price, image, categoryId, stock, featured } = body

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        categoryId,
        stock: parseInt(stock),
        featured: featured || false,
      },
      include: { category: true },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Lỗi khi cập nhật sản phẩm' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = verifyToken(request)
  if (!user) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ message: 'Đã xóa sản phẩm' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Lỗi khi xóa sản phẩm' }, { status: 500 })
  }
}
