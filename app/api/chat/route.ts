import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: Khách gửi tin nhắn (tạo conversation nếu chưa có)
export async function POST(request: NextRequest) {
  try {
    const { conversationId, text, guestName, guestPhone } = await request.json()

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Tin nhắn trống' }, { status: 400 })
    }

    let convId = conversationId

    // Tạo conversation mới nếu chưa có
    if (!convId) {
      const conv = await prisma.chatConversation.create({
        data: {
          guestName: guestName || '',
          guestPhone: guestPhone || '',
        },
      })
      convId = conv.id
    }

    // Lưu tin nhắn
    const message = await prisma.chatMessage.create({
      data: {
        conversationId: convId,
        sender: 'guest',
        text: text.trim(),
      },
    })

    // Update conversation timestamp
    await prisma.chatConversation.update({
      where: { id: convId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ conversationId: convId, message })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Lỗi gửi tin nhắn' }, { status: 500 })
  }
}

// GET: Khách poll tin nhắn mới
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ messages: [] })
    }

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    return NextResponse.json({ messages: [] })
  }
}
