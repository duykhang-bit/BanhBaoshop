import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET: Lấy danh sách khách hàng
export async function GET(request: NextRequest) {
  const admin = verifyToken(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const users = await prisma.user.findMany({
      select: { id: true, phone: true, name: true, address: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users, total: users.length })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
