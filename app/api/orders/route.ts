import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Create order (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName, customerPhone, customerAddress,
      note, paymentMethod, totalAmount, items,
      discountCode, discountAmount
    } = body

    if (!customerName || !customerPhone || !customerAddress || !paymentMethod || !items) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
    }

    // Kiểm tra voucher chỉ dùng 1 lần
    if (discountCode && discountCode.trim() !== '') {
      const alreadyUsed = await prisma.usedPromo.findUnique({
        where: {
          code_customerPhone: {
            code: discountCode.toUpperCase(),
            customerPhone: customerPhone.trim(),
          }
        }
      })
      if (alreadyUsed) {
        return NextResponse.json(
          { error: `Số điện thoại này đã sử dụng mã "${discountCode}" rồi` },
          { status: 400 }
        )
      }
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerAddress,
        note: note || '',
        paymentMethod,
        totalAmount,
        discountCode: discountCode?.toUpperCase() || '',
        discountAmount: discountAmount || 0,
        items: {
          create: items
        }
      },
      include: {
        items: true
      }
    })

    // Ghi lại voucher đã dùng
    if (discountCode && discountCode.trim() !== '') {
      await prisma.usedPromo.create({
        data: {
          code: discountCode.toUpperCase(),
          customerPhone: customerPhone.trim(),
        }
      })
    }

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Lỗi tạo đơn hàng' }, { status: 500 })
  }
}
