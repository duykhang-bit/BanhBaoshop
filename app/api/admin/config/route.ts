import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = verifyToken(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    let config = await prisma.shopConfig.findUnique({ where: { id: 'singleton' } })
    if (!config) {
      config = await prisma.shopConfig.create({
        data: { id: 'singleton', shippingFee: 30000, freeShippingMin: 300000, shippingEnabled: true, showShippingHint: true, promoEnabled: false, promoCodes: '[]', homepageCategories: '[]' }
      })
    }
    return NextResponse.json({
      ...config,
      promoCodes: JSON.parse(config.promoCodes),
      homepageCategories: JSON.parse((config as any).homepageCategories || '[]'),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi tải config' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const user = verifyToken(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { shippingFee, freeShippingMin, shippingEnabled, showShippingHint, promoEnabled, promoCodes, homepageCategories } = body

    const config = await prisma.shopConfig.upsert({
      where: { id: 'singleton' },
      update: {
        shippingFee: parseFloat(shippingFee) || 0,
        freeShippingMin: parseFloat(freeShippingMin) || 0,
        shippingEnabled: Boolean(shippingEnabled),
        showShippingHint: Boolean(showShippingHint),
        promoEnabled: Boolean(promoEnabled),
        promoCodes: JSON.stringify(promoCodes || []),
        homepageCategories: JSON.stringify(homepageCategories || []),
      },
      create: {
        id: 'singleton',
        shippingFee: parseFloat(shippingFee) || 0,
        freeShippingMin: parseFloat(freeShippingMin) || 0,
        shippingEnabled: Boolean(shippingEnabled),
        showShippingHint: Boolean(showShippingHint),
        promoEnabled: Boolean(promoEnabled),
        promoCodes: JSON.stringify(promoCodes || []),
        homepageCategories: JSON.stringify(homepageCategories || []),
      },
    })

    return NextResponse.json({
      ...config,
      promoCodes: JSON.parse(config.promoCodes),
      homepageCategories: JSON.parse((config as any).homepageCategories || '[]'),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi khi lưu config' }, { status: 500 })
  }
}
