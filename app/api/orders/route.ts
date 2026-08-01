import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const TELEGRAM_BOT_TOKEN = '8691571072:AAGD2_tNASd7lHZsfV-sqDADBK78Uetrx54'
const TELEGRAM_CHAT_ID = '1158898649'

async function sendTelegramNotification(order: any, items: any[]) {
  try {
    const paymentText = order.paymentMethod === 'cod' ? '💵 COD' : '🏦 Chuyển khoản'
    const itemsText = items.map((i: any) => `  • ${i.productName} x${i.quantity} — ${(i.price * i.quantity).toLocaleString('vi-VN')}₫`).join('\n')
    const discountText = order.discountAmount > 0 ? `\n🏷️ Mã giảm: ${order.discountCode} (-${order.discountAmount.toLocaleString('vi-VN')}₫)` : ''
    const noteText = order.note ? `\n📝 Ghi chú: ${order.note}` : ''

    const message = `🛍️ ĐƠN HÀNG MỚI #${order.id.substring(0, 8).toUpperCase()}

👤 ${order.customerName}
📞 ${order.customerPhone}
📍 ${order.customerAddress}${noteText}
${paymentText}${discountText}

📦 Sản phẩm:
${itemsText}

💰 Tổng: ${order.totalAmount.toLocaleString('vi-VN')}₫`

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    })
  } catch (error) {
    console.error('Telegram notification error:', error)
  }
}

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
        items: { create: items }
      },
      include: { items: true }
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

    // Gửi thông báo Telegram
    await sendTelegramNotification(order, order.items)

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Lỗi tạo đơn hàng' }, { status: 500 })
  }
}
