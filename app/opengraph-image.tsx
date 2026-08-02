import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BanhBao Shop'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 20 }}>🛍️</div>
        <div style={{ fontSize: 72, fontWeight: 'bold', color: 'white', marginBottom: 10 }}>
          BanhBao Shop
        </div>
        <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.8)' }}>
          Hàng chất, giá tốt, giao nhanh toàn quốc
        </div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)', marginTop: 20 }}>
          Mỹ phẩm • Phân bón • Công nghệ • Tôm giống
        </div>
      </div>
    ),
    { ...size }
  )
}
