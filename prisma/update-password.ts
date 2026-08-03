import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔑 Updating admin password...')

  const hashedPassword = await bcrypt.hash('Cr7ronaldojk.', 10)
  
  const admin = await prisma.admin.update({
    where: { username: 'admin' },
    data: {
      password: hashedPassword,
    },
  })

  console.log('✅ Password updated successfully!')
  console.log('👤 Username: admin')
  console.log('🔐 New Password: Cr7ronaldojk.')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
