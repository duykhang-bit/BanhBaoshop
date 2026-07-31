import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ thông tin' },
        { status: 400 }
      )
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Tên đăng nhập hoặc mật khẩu không đúng' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Tên đăng nhập hoặc mật khẩu không đúng' },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'banhbao_super_secret_2026',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      message: 'Đăng nhập thành công',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi đăng nhập' },
      { status: 500 }
    )
  }
}
