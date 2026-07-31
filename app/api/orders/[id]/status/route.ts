import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      select: { status: true }
    })
    if (!order) return NextResponse.json({ error: 'Không tìm thấy đơn' }, { status: 404 })
    return NextResponse.json({ status: order.status })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
