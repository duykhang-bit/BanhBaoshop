import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'banhbao_super_secret_2026'

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; phone: string }

    const { name, address } = await request.json()

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        ...(name !== undefined && { name }),
        ...(address !== undefined && { address }),
      },
      select: { id: true, phone: true, name: true, address: true },
    })

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật thông tin' }, { status: 500 })
  }
}
