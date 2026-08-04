import { useEffect, useState } from 'react'

interface PromoCode {
  code: string
  type: 'percent' | 'fixed'
  value: number
  minOrder: number
  active: boolean
}

export interface ShopConfig {
  shippingFee: number
  freeShippingMin: number
  shippingEnabled: boolean
  showShippingHint: boolean
  shippingByAddress: boolean
  promoEnabled: boolean
  promoCodes: PromoCode[]
}

const defaultConfig: ShopConfig = {
  shippingFee: 30000,
  freeShippingMin: 300000,
  shippingEnabled: true,
  showShippingHint: true,
  shippingByAddress: false,
  promoEnabled: false,
  promoCodes: [],
}

export function useShopConfig() {
  const [config, setConfig] = useState<ShopConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(data => setConfig({ ...defaultConfig, ...data }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const calcShipping = (subtotal: number): number => {
    if (!config.shippingEnabled) return 0
    if (config.shippingByAddress) return 0 // Shop sẽ báo phí sau, không tự cộng
    return subtotal >= config.freeShippingMin ? 0 : config.shippingFee
  }

  const applyPromo = (code: string, subtotal: number): { discount: number; error: string } => {
    if (!config.promoEnabled) return { discount: 0, error: 'Khuyến mãi hiện không khả dụng' }
    const promo = config.promoCodes.find(p => p.code === code.toUpperCase() && p.active)
    if (!promo) return { discount: 0, error: 'Mã khuyến mãi không hợp lệ' }
    if (subtotal < promo.minOrder) return { discount: 0, error: `Đơn tối thiểu ${promo.minOrder.toLocaleString()}₫` }
    const discount = promo.type === 'percent'
      ? Math.round(subtotal * promo.value / 100)
      : promo.value
    return { discount, error: '' }
  }

  return { config, loading, calcShipping, applyPromo }
}
