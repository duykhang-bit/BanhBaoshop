#!/bin/bash
# BanhBao Shop Deploy Script
# Run on server: bash deploy.sh

set -e
echo "🚀 Bắt đầu deploy BanhBao Shop..."

# 1. Pull code mới nhất
echo "📥 Pull code từ GitHub..."
git pull origin main

# 2. Install dependencies
echo "📦 Cài đặt dependencies..."
npm install --production=false

# 3. Build
echo "🔨 Build production..."
npm run build

# 4. Setup database
echo "🗄️ Setup database..."
npx prisma db push
npx tsx prisma/seed.ts || echo "Seed đã chạy rồi, bỏ qua"

# 5. Restart với PM2
echo "♻️ Restart PM2..."
pm2 restart banhbaoshop || pm2 start ecosystem.config.js

echo "✅ Deploy thành công!"
echo "🌐 Website: http://159.65.136.39:3001"
