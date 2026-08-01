import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { phone } = await request.json()

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: 'Không tìm thấy đơn' }, { status: 404 })

    // Kiểm tra SĐT khớp
    if (order.customerPhone !== phone?.trim()) {
      return NextResponse.json({ error: 'Số điện thoại không khớp' }, { status: 403 })
    }

    // Chỉ huỷ được khi pending hoặc awaiting_payment
    if (!['pending', 'awaiting_payment'].includes(order.status)) {
      return NextResponse.json({ error: 'Đơn hàng đã được xử lý, không thể huỷ' }, { status: 400 })
    }

    await prisma.order.update({
      where: { id },
      data: { status: 'cancelled' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
