import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import * as bcrypt from 'bcryptjs'

// POST: Admin reset mật khẩu cho khách
export async function POST(request: NextRequest) {
  const admin = verifyToken(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { userId, requestId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Thiếu userId' }, { status: 400 })
    }

    // Tạo mật khẩu ngẫu nhiên
    const newPassword = 'banh' + Math.floor(1000 + Math.random() * 9000)
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    // Nếu có requestId thì đánh dấu đã xử lý
    if (requestId) {
      await prisma.passwordResetRequest.update({
        where: { id: requestId },
        data: { status: 'done', newPassword },
      })
    }

    return NextResponse.json({ newPassword, message: 'Đã reset mật khẩu thành công' })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi reset mật khẩu' }, { status: 500 })
  }
}
