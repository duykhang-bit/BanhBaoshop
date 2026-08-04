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
  manualShippingCategories: string[]
  promoEnabled: boolean
  promoCodes: PromoCode[]
}

const defaultConfig: ShopConfig = {
  shippingFee: 30000,
  freeShippingMin: 300000,
  shippingEnabled: true,
  showShippingHint: true,
  shippingByAddress: false,
  manualShippingCategories: ['phan-bon', 'tom-giong'],
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

  // Check xem giỏ hàng có sản phẩm thuộc danh mục "shop báo sau" không
  const hasManualShippingItem = (categorySlugs: (string | undefined)[]): boolean => {
    return categorySlugs.some(slug => slug && config.manualShippingCategories.includes(slug))
  }

  const calcShipping = (subtotal: number, categorySlugs?: (string | undefined)[]): number => {
    if (!config.shippingEnabled) return 0
    // Nếu giỏ có phân bón/tôm giống → shop báo sau, không cộng phí
    if (categorySlugs && hasManualShippingItem(categorySlugs)) return 0
    // Nếu config chung là "tính theo địa chỉ" → không cộng
    if (config.shippingByAddress) return 0
    // Tính phí bình thường (mỹ phẩm, công nghệ)
    return subtotal >= config.freeShippingMin ? 0 : config.shippingFee
  }

  // Xác định kiểu hiển thị phí ship
  const getShippingType = (categorySlugs?: (string | undefined)[]): 'auto' | 'manual' => {
    if (categorySlugs && hasManualShippingItem(categorySlugs)) return 'manual'
    if (config.shippingByAddress) return 'manual'
    return 'auto'
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

  return { config, loading, calcShipping, getShippingType, applyPromo }
}
