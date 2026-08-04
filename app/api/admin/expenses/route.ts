import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET: Lấy danh sách chi phí
export async function GET(request: NextRequest) {
  const admin = verifyToken(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ expenses })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}

// POST: Thêm chi phí mới
export async function POST(request: NextRequest) {
  const admin = verifyToken(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { type, description, amount } = await request.json()

    if (!type || !description || !amount) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
    }

    const expense = await prisma.expense.create({
      data: {
        type,
        description,
        amount: parseFloat(amount),
      },
    })

    return NextResponse.json({ expense })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi thêm chi phí' }, { status: 500 })
  }
}

// DELETE: Xóa chi phí
export async function DELETE(request: NextRequest) {
  const admin = verifyToken(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await request.json()
    await prisma.expense.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi xóa chi phí' }, { status: 500 })
  }
}
