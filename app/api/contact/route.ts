import { NextRequest, NextResponse } from 'next/server'

const TELEGRAM_BOT_TOKEN = '8691571072:AAGD2_tNASd7lHZsfV-sqDADBK78Uetrx54'
const TELEGRAM_CHAT_ID = '1158898649'

export async function POST(request: NextRequest) {
  try {
    const { phone, message, name } = await request.json()

    if (!phone || !message) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
    }

    const text = `💬 TIN NHẮN TƯ VẤN MỚI

👤 ${name || 'Khách hàng'}
📞 ${phone}
💬 ${message}

👉 Liên hệ lại qua Zalo/điện thoại: ${phone}`

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
