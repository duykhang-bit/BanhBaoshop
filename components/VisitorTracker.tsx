'use client'

import { useEffect } from 'react'

export default function VisitorTracker() {
  useEffect(() => {
    try {
      // 1 thiết bị = 1 lượt truy cập / ngày
      const today = new Date().toISOString().slice(0, 10)
      const key = `banhbao_visited_${today}`

      if (localStorage.getItem(key)) return

      fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: window.location.pathname }),
      }).catch(() => {})

      localStorage.setItem(key, '1')
    } catch {
      // localStorage không khả dụng (in-app browser), bỏ qua
    }
  }, [])

  return null
}
