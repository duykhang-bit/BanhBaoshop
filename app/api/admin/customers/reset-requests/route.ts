import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET: Lấy danh sách yêu cầu reset mật khẩu
export async function GET(request: NextRequest) {
  const admin = verifyToken(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const requests = await prisma.passwordResetRequest.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
