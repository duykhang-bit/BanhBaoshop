import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  })
  console.log('✅ Admin created:', admin.username)

  // Create categories
  const categories = [
    { name: 'Mỹ Phẩm', slug: 'my-pham' },
    { name: 'Phân Bón', slug: 'phan-bon' },
    { name: 'Công Nghệ', slug: 'cong-nghe' },
    { name: 'Tôm Giống', slug: 'tom-giong' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Categories created')

  // Get categories
  const myPham = await prisma.category.findUnique({ where: { slug: 'my-pham' } })
  const phanBon = await prisma.category.findUnique({ where: { slug: 'phan-bon' } })
  const congNghe = await prisma.category.findUnique({ where: { slug: 'cong-nghe' } })

  // Create sample products for Mỹ Phẩm
  const cosmeticProducts = [
    {
      name: 'Kem Dưỡng Da La Roche-Posay',
      description: 'Kem dưỡng ẩm cho da nhạy cảm, chống lão hóa, nuôi dưỡng làn da khỏe mạnh',
      price: 450000,
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500',
      stock: 50,
      featured: true,
      categoryId: myPham!.id,
    },
    {
      name: 'Son Môi MAC Ruby Woo',
      description: 'Son lì lâu trôi, màu đỏ ruby quyến rũ, công thức dưỡng ẩm',
      price: 650000,
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500',
      stock: 30,
      featured: true,
      categoryId: myPham!.id,
    },
    {
      name: 'Nước Hoa Chanel No.5',
      description: 'Hương thơm cổ điển, quyến rũ, lưu hương cả ngày',
      price: 2500000,
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500',
      stock: 15,
      featured: false,
      categoryId: myPham!.id,
    },
    {
      name: 'Sữa Rửa Mặt Cetaphil',
      description: 'Làm sạch nhẹ nhàng, phù hợp mọi loại da',
      price: 280000,
      image: 'https://images.unsplash.com/photo-1556228852-80c3ae6bdb4b?w=500',
      stock: 100,
      featured: false,
      categoryId: myPham!.id,
    },
  ]

  // Create sample products for Phân Bón
  const fertilizerProducts = [
    {
      name: 'Phân Bón NPK 16-16-8',
      description: 'Phân bón tổng hợp, cung cấp đầy đủ dinh dưỡng cho cây trồng',
      price: 120000,
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500',
      stock: 200,
      featured: true,
      categoryId: phanBon!.id,
    },
    {
      name: 'Phân Hữu Cơ Vi Sinh',
      description: 'Phân bón hữu cơ, giàu vi sinh vật có lợi, cải thiện đất trồng',
      price: 85000,
      image: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=500',
      stock: 150,
      featured: true,
      categoryId: phanBon!.id,
    },
    {
      name: 'Phân Bón Lá Đầu Trâu',
      description: 'Phân bón lá, giúp cây xanh tốt, tăng năng suất',
      price: 45000,
      image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500',
      stock: 300,
      featured: false,
      categoryId: phanBon!.id,
    },
  ]

  // Create sample products for Công Nghệ
  const techProducts = [
    {
      name: 'iPhone 15 Pro Max 256GB',
      description: 'Smartphone cao cấp, chip A17 Pro, camera 48MP, titanium',
      price: 32000000,
      image: 'https://images.unsplash.com/photo-1592286927505-2c07e0c523e6?w=500',
      stock: 20,
      featured: true,
      categoryId: congNghe!.id,
    },
    {
      name: 'MacBook Air M3 15 inch',
      description: 'Laptop siêu mỏng nhẹ, chip M3 mạnh mẽ, màn hình Retina',
      price: 36000000,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      stock: 10,
      featured: true,
      categoryId: congNghe!.id,
    },
    {
      name: 'AirPods Pro 2',
      description: 'Tai nghe true wireless, chống ồn chủ động, âm thanh tuyệt vời',
      price: 6500000,
      image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500',
      stock: 50,
      featured: false,
      categoryId: congNghe!.id,
    },
    {
      name: 'Samsung Galaxy Watch 6',
      description: 'Đồng hồ thông minh, theo dõi sức khỏe, pin 40 giờ',
      price: 8500000,
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500',
      stock: 25,
      featured: false,
      categoryId: congNghe!.id,
    },
  ]

  // Insert all products
  for (const product of [...cosmeticProducts, ...fertilizerProducts, ...techProducts]) {
    await prisma.product.create({
      data: product,
    })
  }

  console.log('✅ Sample products created')
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
