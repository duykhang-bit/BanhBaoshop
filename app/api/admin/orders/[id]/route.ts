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
    const { status } = body

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true }
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Lỗi cập nhật đơn hàng' }, { status: 500 })
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
    await prisma.order.delete({ where: { id } })
    return NextResponse.json({ message: 'Đã xóa đơn hàng' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Lỗi xóa đơn hàng' }, { status: 500 })
  }
}
