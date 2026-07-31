# 🛍️ BanhBao Shop - E-Commerce Website

Website bán hàng trực tuyến chuyên **Mỹ Phẩm, Phân Bón và Công Nghệ** với giao diện đẹp mắt, có animations và admin panel đầy đủ tính năng.

## ✨ Tính Năng

### 🎨 Giao Diện Người Dùng
- ✅ Trang chủ với hero banner và 3 danh mục sản phẩm
- ✅ Trang danh sách sản phẩm theo danh mục với tìm kiếm, filter, sort
- ✅ Trang chi tiết sản phẩm với ảnh lớn, chọn số lượng
- ✅ Giỏ hàng động với tính năng thêm/xóa/cập nhật số lượng
- ✅ Animations mượt mà với Framer Motion
- ✅ Responsive design cho mọi thiết bị
- ✅ 100% Tiếng Việt

### 👑 Admin Panel
- ✅ Đăng nhập bảo mật với JWT Authentication
- ✅ Dashboard với thống kê tổng quan
- ✅ Quản lý sản phẩm: Thêm, Sửa, Xóa
- ✅ Upload ảnh sản phẩm (URL)
- ✅ Chỉnh sửa giá, số lượng, mô tả
- ✅ Đánh dấu sản phẩm nổi bật
- ✅ Tìm kiếm sản phẩm

## 🚀 Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Database**: SQLite với Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Icons**: Lucide React

## 📦 Cài Đặt

### 1. Clone repo
```bash
git clone https://github.com/duykhang-bit/BanhBaoshop.git
cd BanhBaoshop
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Setup database
```bash
# Tạo database
npm run db:push

# Seed data mẫu (admin user + sản phẩm)
npm run db:seed
```

### 4. Chạy development server
```bash
npm run dev
```

Website sẽ chạy tại: **http://localhost:3000**

## 🔐 Admin Login

Để truy cập Admin Panel, vào: **http://localhost:3000/admin/login**

**Demo Account:**
- Username: `admin`
- Password: `admin123`

## 📁 Cấu Trúc Project

```
BanhBaoshop/
├── app/
│   ├── page.tsx              # Trang chủ
│   ├── products/[slug]/      # Danh sách sản phẩm theo category
│   ├── product/[id]/         # Chi tiết sản phẩm
│   ├── cart/                 # Giỏ hàng
│   ├── admin/
│   │   ├── login/            # Admin login
│   │   └── dashboard/        # Admin dashboard
│   └── api/
│       ├── products/         # API sản phẩm public
│       └── admin/            # API admin (protected)
├── lib/
│   ├── prisma.ts            # Prisma client
│   ├── auth.ts              # JWT verification
│   └── cartStore.ts         # Zustand cart store
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed data
└── public/                  # Static files
```

## 🎯 Danh Mục Sản Phẩm

1. **Mỹ Phẩm** (`/products/my-pham`)
   - Kem dưỡng da, Son môi, Nước hoa, Sữa rửa mặt...

2. **Phân Bón** (`/products/phan-bon`)
   - Phân NPK, Phân hữu cơ, Phân bón lá...

3. **Công Nghệ** (`/products/cong-nghe`)
   - iPhone, MacBook, AirPods, Samsung Watch...

## 🛠️ Scripts

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server
npm run db:push      # Đồng bộ database schema
npm run db:seed      # Seed data mẫu
npm run db:studio    # Mở Prisma Studio (GUI quản lý DB)
```

## 🎨 Features Highlights

### Animations & UX
- ✨ Fade in, slide up, scale animations khi load trang
- 🎭 Hover effects trên cards và buttons
- 🌊 Smooth transitions giữa các trang
- 📱 Mobile-first responsive design

### Shopping Experience
- 🛒 Add to cart với animation feedback
- 🔍 Tìm kiếm và filter sản phẩm real-time
- 💰 Hiển thị giá VNĐ với format đẹp
- 📦 Thông tin stock và trạng thái sản phẩm
- ⭐ Sản phẩm nổi bật được highlight

### Admin Features
- 📊 Dashboard với stats cards
- 🔐 Secure authentication với JWT
- 🖼️ **Upload ảnh từ máy tính** hoặc nhập URL
- 📤 Auto-save uploaded images vào `/public/uploads`
- 🖼️ Image preview khi thêm/sửa sản phẩm
- ✏️ Inline editing trong modal
- 🗑️ Xác nhận trước khi xóa
- 🎯 Real-time search trong product list

## 📸 Screenshots

### Homepage
- Hero banner với gradient background
- 3 category cards với emoji icons
- Smooth animations

### Product Listing
- Grid layout responsive
- Search và sort functionality
- Product cards với hover effects

### Shopping Cart
- Item quantity controls
- Total calculation với shipping fee
- Empty cart state với call-to-action

### Admin Dashboard
- Stats overview (Total products, Warehouse value, Low stock, Featured)
- Product table với images
- Add/Edit modal với form validation

## 🔒 Security

- JWT tokens cho admin authentication
- Password hashing với bcryptjs
- Protected API routes với middleware
- Environment variables cho sensitive data

## 🌐 Environment Variables

File `.env` đã được tạo sẵn với:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-this-in-production"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

⚠️ **Lưu ý**: Đổi `JWT_SECRET` khi deploy production!

## 🚀 Deploy Production

### Build
```bash
npm run build
```

### Start
```bash
npm start
```

## 📝 License

MIT License - Free to use for personal and commercial projects

## 👨‍💻 Developer

Created with ❤️ by Kiro AI

---

**Enjoy shopping! 🛍️✨**


## 📤 Upload Ảnh Sản Phẩm

Admin có **2 cách** để thêm ảnh sản phẩm:

### Cách 1: Upload từ máy tính (Khuyên dùng) 💻
1. Vào Admin Dashboard
2. Click "Thêm Sản Phẩm" hoặc "Sửa" sản phẩm
3. Click vào box "**Upload từ máy tính**"
4. Chọn file ảnh (jpg, png, webp...)
5. Ảnh sẽ tự động upload và hiện preview

**Giới hạn:**
- Kích thước tối đa: **5MB**
- Format hỗ trợ: jpg, jpeg, png, webp, gif
- Ảnh được lưu vào: `/public/uploads/`

### Cách 2: Nhập URL ảnh từ internet 🌐
1. Tìm ảnh trên internet (Google Images, Unsplash...)
2. Copy link ảnh
3. Paste vào ô "**Hoặc nhập URL ảnh từ internet**"

**Ví dụ URL:**
```
https://images.unsplash.com/photo-1234567890
https://example.com/product-image.jpg
```

---

**Lưu ý:** Nếu cả 2 cách đều có ảnh, ảnh upload sẽ được ưu tiên!
