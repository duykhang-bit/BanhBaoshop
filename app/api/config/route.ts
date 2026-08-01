import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let config = await prisma.shopConfig.findUnique({ where: { id: 'singleton' } })
    if (!config) {
      config = await prisma.shopConfig.create({
        data: { id: 'singleton', shippingFee: 30000, freeShippingMin: 300000, shippingEnabled: true, showShippingHint: true, promoEnabled: false, promoCodes: '[]', homepageCategories: '[]' }
      })
    }
    return NextResponse.json({
      shippingFee: config.shippingFee,
      freeShippingMin: config.freeShippingMin,
      shippingEnabled: config.shippingEnabled,
      showShippingHint: config.showShippingHint,
      promoEnabled: config.promoEnabled,
      promoCodes: JSON.parse(config.promoCodes),
      homepageCategories: JSON.parse((config as any).homepageCategories || '[]'),
    })
  } catch {
    return NextResponse.json({ shippingFee: 30000, freeShippingMin: 300000, shippingEnabled: true, showShippingHint: true, promoEnabled: false, promoCodes: [], homepageCategories: [] })
  }
}
