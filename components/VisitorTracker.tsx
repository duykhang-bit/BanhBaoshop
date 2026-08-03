'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function VisitorTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Ghi lại lượt truy cập mỗi khi đổi trang
    // Dùng sessionStorage để không ghi trùng trong 1 session
    const key = `visited_${pathname}`
    if (sessionStorage.getItem(key)) return

    fetch('/api/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {})

    sessionStorage.setItem(key, '1')
  }, [pathname])

  return null
}
