# 📤 Hướng Dẫn Upload Ảnh Sản Phẩm

## 🎯 Quick Start

### Cách 1: Upload Từ Máy Tính (Recommended)

1. **Đăng nhập Admin** tại `http://localhost:3000/admin/login`
   - Username: `admin`
   - Password: `admin123`

2. **Thêm/Sửa sản phẩm**
   - Click "Thêm Sản Phẩm" hoặc icon Edit ✏️

3. **Upload ảnh**
   - Click vào box **"Upload từ máy tính"**
   - Chọn file ảnh từ máy
   - Xem preview ngay lập tức
   - Click "Thêm Mới" hoặc "Cập Nhật"

### Cách 2: Dùng URL Từ Internet

1. Tìm ảnh trên Google/Unsplash
2. Copy link ảnh (right-click → Copy image address)
3. Paste vào ô "**Hoặc nhập URL ảnh từ internet**"

---

## ✅ File Requirements

| Yêu cầu | Giá trị |
|---------|---------|
| **Kích thước max** | 5MB |
| **Format** | JPG, PNG, WEBP, GIF |
| **Chiều rộng đề xuất** | 800px - 1200px |

---

## 📁 Ảnh Được Lưu Ở Đâu?

Khi bạn upload ảnh từ máy tính:
- Ảnh được lưu vào folder: `/public/uploads/`
- Tên file: `timestamp-tên-file-gốc.jpg`
- URL public: `/uploads/1234567890-product.jpg`

Ví dụ:
```
Original: my-product.jpg
Saved as: 1738320000000-my-product.jpg
URL: /uploads/1738320000000-my-product.jpg
```

---

## 🔍 Troubleshooting

### ❌ "Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB"
**Giải pháp:**
- Compress ảnh bằng tinypng.com hoặc compressor.io
- Hoặc resize ảnh về 1200px width

### ❌ "Vui lòng chọn file ảnh"
**Giải pháp:**
- Đảm bảo file có extension: .jpg, .png, .webp, .gif
- Không upload file PDF, Word, hay video

### ❌ Upload bị lag hoặc lâu
**Giải pháp:**
- Check kích thước ảnh (nên dưới 2MB)
- Check internet connection
- Refresh page và thử lại

---

## 💡 Tips & Best Practices

### ✨ Chọn Ảnh Đẹp
- Dùng ảnh sáng, rõ nét
- Background đơn giản
- Sản phẩm ở giữa ảnh
- Tỷ lệ: 3:4 hoặc 1:1 (square)

### 🚀 Optimize Performance
- Compress ảnh trước khi upload
- Dùng WEBP format (nhẹ hơn JPG)
- Resolution: 800x1000px là đủ

### 🎨 Consistency
- Dùng same style cho tất cả sản phẩm
- Same background color
- Same lighting

---

## 🔐 Security Note

⚠️ **Lưu ý bảo mật:**
- Chỉ upload ảnh từ nguồn tin cậy
- Không upload ảnh có copyright
- Không upload ảnh có nội dung nhạy cảm

---

## 🌐 URL Ảnh Miễn Phí

Một số nguồn ảnh miễn phí chất lượng cao:

- **Unsplash:** https://unsplash.com (API có sẵn URL)
- **Pexels:** https://pexels.com
- **Pixabay:** https://pixabay.com

**Lấy URL từ Unsplash:**
```
1. Tìm ảnh trên unsplash.com
2. Click ảnh → Click "Download"
3. Right-click → Copy link
4. Paste vào form
```

---

## 📊 Technical Details

### API Endpoint
```
POST /api/upload
Content-Type: multipart/form-data
Body: { file: File }
```

### Response
```json
{
  "success": true,
  "imageUrl": "/uploads/1738320000-product.jpg",
  "message": "Upload thành công!"
}
```

### Error Codes
- `400` - No file uploaded
- `500` - Upload failed (server error)

---

**Happy Uploading! 📸✨**
