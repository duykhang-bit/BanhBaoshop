import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Khách gửi yêu cầu reset mật khẩu → lưu vào DB → admin sẽ thấy trong dashboard
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Vui lòng nhập số điện thoại' }, { status: 400 })
    }

    // Kiểm tra user có tồn tại không
    const user = await prisma.user.findUnique({ where: { phone } })
    if (!user) {
      return NextResponse.json({ error: 'Số điện thoại chưa được đăng ký' }, { status: 404 })
    }

    // Kiểm tra đã có request pending chưa
    const existing = await prisma.passwordResetRequest.findFirst({
      where: { phone, status: 'pending' },
    })
    if (existing) {
      return NextResponse.json({ message: 'Yêu cầu đã được gửi, vui lòng chờ admin xử lý' })
    }

    // Tạo request
    await prisma.passwordResetRequest.create({
      data: { phone, userName: user.name || phone },
    })

    return NextResponse.json({ message: 'Yêu cầu đặt lại mật khẩu đã được gửi. Admin sẽ liên hệ bạn sớm nhất!' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
