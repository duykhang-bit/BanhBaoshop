import type { Metadata } from 'next'
import './globals.css'
import ChatWidget from '@/components/ChatWidget'

export const metadata: Metadata = {
  title: 'BanhBao Shop - Mỹ Phẩm, Phân Bón, Công Nghệ, Tôm Giống',
  description: 'Cửa hàng trực tuyến chuyên mỹ phẩm, phân bón, công nghệ và tôm giống. Hàng chất, giá tốt, giao nhanh toàn quốc.',
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'BanhBao Shop 🛍️',
    description: 'Hàng chất, giá tốt, giao nhanh toàn quốc. Mỹ phẩm, phân bón, công nghệ, tôm giống.',
    url: 'https://banhbaoshop.duckdns.org',
    siteName: 'BanhBao Shop',
    type: 'website',
    images: [
      {
        url: 'https://via.placeholder.com/1200x630/8b5cf6/ffffff?text=BanhBao+Shop+%F0%9F%9B%8D%EF%B8%8F',
        width: 1200,
        height: 630,
        alt: 'BanhBao Shop',
      },
    ],
  },
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
