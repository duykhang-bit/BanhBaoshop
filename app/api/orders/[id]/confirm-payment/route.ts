import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Khách bấm "Tôi đã chuyển khoản" → đơn chuyển sang awaiting_payment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.order.update({
      where: { id },
      data: { status: 'awaiting_payment' }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Lỗi cập nhật' }, { status: 500 })
  }
}
