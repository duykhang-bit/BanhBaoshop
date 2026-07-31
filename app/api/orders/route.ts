import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Create order (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, customerPhone, customerAddress, note, paymentMethod, totalAmount, items } = body

    if (!customerName || !customerPhone || !customerAddress || !paymentMethod || !items) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerAddress,
        note: note || '',
        paymentMethod,
        totalAmount,
        items: {
          create: items
        }
      },
      include: {
        items: true
      }
    })

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Lỗi tạo đơn hàng' }, { status: 500 })
  }
}
