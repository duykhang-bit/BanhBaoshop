import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET: Lấy danh sách conversations + tin nhắn
export async function GET(request: NextRequest) {
  const admin = verifyToken(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (conversationId) {
      // Lấy messages của 1 conversation
      const messages = await prisma.chatMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
      })
      return NextResponse.json({ messages })
    }

    // Lấy tất cả conversations
    const conversations = await prisma.chatConversation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: { select: { messages: true } },
      },
    })

    // Đếm tin chưa đọc (tin từ guest mà admin chưa reply)
    const convWithUnread = conversations.map(conv => {
      const lastMsg = conv.messages[0]
      const hasUnread = lastMsg?.sender === 'guest'
      return {
        id: conv.id,
        guestName: conv.guestName,
        guestPhone: conv.guestPhone,
        status: conv.status,
        lastMessage: lastMsg?.text || '',
        lastSender: lastMsg?.sender || '',
        messageCount: conv._count.messages,
        hasUnread,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt,
      }
    })

    return NextResponse.json({ conversations: convWithUnread })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}

// POST: Admin gửi reply
export async function POST(request: NextRequest) {
  const admin = verifyToken(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { conversationId, text } = await request.json()

    if (!conversationId || !text?.trim()) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
    }

    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        sender: 'admin',
        text: text.trim(),
      },
    })

    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ message })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi gửi tin nhắn' }, { status: 500 })
  }
}
