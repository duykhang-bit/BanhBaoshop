import * as jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export function verifyToken(request: NextRequest): { id: string; username: string } | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'banhbao_super_secret_2026') as {
      id: string
      username: string
    }
    return decoded
  } catch (error) {
    return null
  }
}
