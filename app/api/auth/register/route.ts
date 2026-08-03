import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'banhbao_super_secret_2026'

export async function POST(request: NextRequest) {
  try {
    const { phone, password, name } = await request.json()

    if (!phone || !password) {
      return NextResponse.json({ error: 'Vui lòng nhập số điện thoại và mật khẩu' }, { status: 400 })
    }

    // Validate phone
    const phoneRegex = /^0\d{9}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 })
    }

    // Check if phone already exists
    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) {
      return NextResponse.json({ error: 'Số điện thoại đã được đăng ký' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        name: name || '',
      },
    })

    // Generate token
    const token = jwt.sign(
      { id: user.id, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        address: user.address,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
