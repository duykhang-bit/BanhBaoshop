import type { Metadata } from 'next'
import './globals.css'
import ChatWidget from '@/components/ChatWidget'

export const metadata: Metadata = {
  title: 'BanhBao Shop - Mỹ Phẩm, Phân Bón, Công Nghệ',
  description: 'Cửa hàng trực tuyến chuyên mỹ phẩm, phân bón và đồ công nghệ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}
