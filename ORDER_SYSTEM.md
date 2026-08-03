# 📦 Hệ Thống Đặt Hàng & Quản Lý Đơn Hàng

## ✅ ĐÃ HOÀN THÀNH!

### 🛒 Khách Hàng Đặt Hàng

**Bước 1:** Thêm sản phẩm vào giỏ hàng
- Browse sản phẩm → Click "Thêm vào giỏ"
- Hoặc vào chi tiết sản phẩm → Chọn số lượng → Thêm vào giỏ

**Bước 2:** Vào giỏ hàng
- URL: `http://localhost:3000/cart`
- Xem lại sản phẩm, điều chỉnh số lượng
- Click **"Tiến Hành Thanh Toán"**

**Bước 3:** Điền thông tin giao hàng
- URL: `http://localhost:3000/checkout`
- Họ và tên *
- Số điện thoại *
- Địa chỉ giao hàng *
- Ghi chú (tùy chọn)

**Bước 4:** Chọn phương thức thanh toán
- **COD** 💵: Thanh toán tiền mặt khi nhận hàng
- **Chuyển khoản** 💳: Hiện QR code để quét

**Bước 5:** Đặt hàng
- Click "Đặt Hàng Ngay"
- Nhận mã đơn hàng
- Done! ✅

---

### 👑 Admin Quản Lý Đơn Hàng

**Đăng nhập Admin:**
```
URL: http://localhost:3000/admin/login
Username: admin
Password: admin123
```

**Xem danh sách đơn hàng:**
```
URL: http://localhost:3000/admin/orders
```

**Thông tin hiển thị:**
- ✅ Mã đơn hàng (8 ký tự đầu)
- ✅ Thông tin khách hàng (Tên, SĐT, Địa chỉ)
- ✅ Ghi chú của khách
- ✅ Phương thức thanh toán (COD/Bank)
- ✅ Trạng thái đơn hàng
- ✅ Danh sách sản phẩm
- ✅ Tổng tiền
- ✅ Thời gian đặt hàng

**Trạng thái đơn hàng:**
1. 🟡 **Chờ xử lý** (pending) - Đơn mới vào
2. 🔵 **Đã xác nhận** (confirmed) - Admin đã xác nhận
3. 🟣 **Đang giao** (shipping) - Đang trên đường giao
4. 🟢 **Hoàn thành** (completed) - Đã giao thành công
5. 🔴 **Đã hủy** (cancelled) - Đơn bị hủy

**Thao tác Admin:**
- Đơn "Chờ xử lý" → Click "Xác nhận" hoặc "Hủy đơn"
- Đơn "Đã xác nhận" → Click "Bắt đầu giao hàng"
- Đơn "Đang giao" → Click "Hoàn thành"

---

## 🗄️ Database Schema

### Table: Order
```prisma
model Order {
  id              String      // UUID
  customerName    String      // Tên khách
  customerPhone   String      // SĐT
  customerAddress String      // Địa chỉ
  note            String      // Ghi chú
  paymentMethod   String      // "cod" hoặc "bank"
  status          String      // pending/confirmed/shipping/completed/cancelled
  totalAmount     Float       // Tổng tiền
  items           OrderItem[] // Sản phẩm trong đơn
  createdAt       DateTime    // Thời gian tạo
  updatedAt       DateTime    // Cập nhật lần cuối
}
```

### Table: OrderItem
```prisma
model OrderItem {
  id           String  // UUID
  orderId      String  // FK → Order
  productId    String  // ID sản phẩm
  productName  String  // Tên SP (lưu lại)
  productImage String  // Ảnh SP (lưu lại)
  price        Float   // Giá tại thời điểm đặt
  quantity     Int     // Số lượng
}
```

**Lưu ý:** 
- Lưu tên, ảnh, giá sản phẩm vào OrderItem để tránh mất data khi sản phẩm bị xóa/sửa
- Relationship: Order 1-N OrderItem (cascade delete)

---

## 🔌 API Endpoints

### Public APIs (Khách hàng)

**POST /api/orders**
- Tạo đơn hàng mới
- Body:
```json
{
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0912345678",
  "customerAddress": "123 ABC, Q1, HCM",
  "note": "Giao giờ hành chính",
  "paymentMethod": "cod",
  "totalAmount": 6500000,
  "items": [
    {
      "productId": "uuid",
      "productName": "iPhone 15",
      "productImage": "/uploads/...",
      "price": 32000000,
      "quantity": 1
    }
  ]
}
```
- Response: `{ success: true, order: {...} }`

---

### Admin APIs (Cần token)

**GET /api/admin/orders**
- Lấy tất cả đơn hàng
- Headers: `Authorization: Bearer <token>`
- Response: `{ orders: [...] }`

**PUT /api/admin/orders/:id**
- Cập nhật trạng thái đơn
- Headers: `Authorization: Bearer <token>`
- Body: `{ status: "confirmed" }`
- Response: `{ order: {...} }`

**DELETE /api/admin/orders/:id**
- Xóa đơn hàng
- Headers: `Authorization: Bearer <token>`
- Response: `{ message: "Đã xóa đơn hàng" }`

---

## 💳 Phương Thức Thanh Toán

### 1. COD (Cash on Delivery)
- Thanh toán tiền mặt khi nhận hàng
- Không cần xác nhận thanh toán
- Đơn được tạo ngay lập tức

### 2. Chuyển Khoản (Bank Transfer)
- Hiện QR code TPBank
- Thông tin:
  ```
  Tên: LE DUY KHANG
  Ngân hàng: TPBank
  STK: 00004775170
  ```
- QR code: `/public/qr-payment.jpg` (cần thêm ảnh QR thật)
- Sau 5s tự động hoàn tất đơn (demo)

**Lưu ý Production:**
- Tích hợp API bank để verify thanh toán
- Webhook để nhận thông báo khi có tiền về
- Auto-update status khi thanh toán thành công

---

## 📊 Workflow

```
[Khách hàng]
   ↓
Browse sản phẩm → Thêm giỏ hàng → Checkout
   ↓
Điền thông tin → Chọn phương thức TT → Đặt hàng
   ↓
Nhận mã đơn → Done!

[Admin nhận đơn]
   ↓
"Chờ xử lý" → Xác nhận → "Đã xác nhận"
   ↓
Chuẩn bị hàng → "Bắt đầu giao hàng" → "Đang giao"
   ↓
Giao thành công → "Hoàn thành" ✅
```

---

## 🎨 UI/UX Features

### Checkout Page
- ✅ Form validation
- ✅ 2 payment methods với icons
- ✅ Order summary với images
- ✅ Shipping fee calculator
- ✅ QR modal cho bank transfer
- ✅ Loading states
- ✅ Success/error feedback

### Admin Orders Page
- ✅ Status badges với colors
- ✅ Customer info cards
- ✅ Payment method icons
- ✅ Order items list
- ✅ Quick status update buttons
- ✅ Timestamp display
- ✅ Empty state
- ✅ Animations

---

## 🔧 Testing

### Test Flow 1: COD Order
1. Vào `localhost:3000`
2. Thêm sản phẩm vào giỏ
3. Vào `/cart` → "Tiến Hành Thanh Toán"
4. Điền form → Chọn COD → Đặt hàng
5. Vào `/admin/orders` → Thấy đơn mới
6. Test update status: Xác nhận → Giao hàng → Hoàn thành

### Test Flow 2: Bank Transfer
1. Thêm SP vào giỏ → Checkout
2. Điền form → Chọn "Chuyển khoản"
3. Đặt hàng → Thấy QR modal
4. Chờ 5s → Auto redirect
5. Check admin orders → Đơn đã tạo

### Test Admin
1. Login admin
2. Vào "Đơn Hàng" sidebar
3. Thấy list orders
4. Test update status cho từng đơn
5. Check empty state (xóa hết orders)

---

## 📝 Notes

**Đã fix:**
- ✅ Lỗi params.slug React async (unwrap params)
- ✅ Lỗi params.id product detail (unwrap params)
- ✅ Cart button từ "Thanh Toán Ngay" → "Tiến Hành Thanh Toán"
- ✅ Ẩn Demo Account trên login page
- ✅ Thêm link "Đơn Hàng" vào admin sidebar

**TODO (nếu cần):**
- [ ] Add ảnh QR code thật vào `/public/qr-payment.jpg`
- [ ] Tích hợp API bank verify payment
- [ ] Email notification cho khách & admin
- [ ] Export orders to Excel/CSV
- [ ] Order search & filter
- [ ] Statistics dashboard

---

## 🚀 Production Checklist

- [ ] Update QR code image
- [ ] Setup payment gateway (VNPay, Momo, etc.)
- [ ] Email service (SendGrid, Mailgun)
- [ ] SMS notification
- [ ] Order tracking page cho khách
- [ ] Print invoice feature
- [ ] Shipping integration
- [ ] Analytics & reports

---

**🎉 Hệ thống đặt hàng đã hoàn chỉnh!**

Khách hàng có thể đặt hàng → Admin quản lý đơn → Cập nhật trạng thái → Hoàn thành! 🎊
