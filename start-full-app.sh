#!/bin/bash

# Kademe A.Ş. Kalite Yönetim Sistemi - Tam Uygulama Başlatıcı
# Bu script hem frontend hem backend'i doğru portlarda başlatır

echo "🚀 Kademe A.Ş. Kalite Yönetim Sistemi başlatılıyor..."

# Ana dizine git
cd "/Users/atakanbattal/Desktop/Kademe A.Ş. Kalite Yönetim Sistemi"

# Eski processları temizle
echo "🧹 Eski processlar temizleniyor..."
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "react-app-rewired" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "ts-node-dev" 2>/dev/null || true

# Port 3000'i temizle (Frontend)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "📱 Frontend portu (3000) temizleniyor..."
    kill -9 $(lsof -Pi :3000 -sTCP:LISTEN -t) 2>/dev/null || true
fi

# Port 5000'i temizle (Backend)
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "🖥️  Backend portu (5000) temizleniyor..."
    kill -9 $(lsof -Pi :5000 -sTCP:LISTEN -t) 2>/dev/null || true
fi

# Port 3005'i de temizle (eski frontend portu)
if lsof -Pi :3005 -sTCP:LISTEN -t >/dev/null ; then
    echo "🗑️  Eski frontend portu (3005) temizleniyor..."
    kill -9 $(lsof -Pi :3005 -sTCP:LISTEN -t) 2>/dev/null || true
fi

sleep 2

echo "🖥️  Backend başlatılıyor (Port: 5000)..."
cd src/backend
if [ ! -d "node_modules" ]; then
    echo "📦 Backend dependencies yükleniyor..."
    npm install
fi

# Backend'i arka planda başlat
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!

sleep 3

echo "📱 Frontend başlatılıyor (Port: 3000)..."
cd ../frontend/kys-frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Frontend dependencies yükleniyor..."
    npm install
fi

echo ""
echo "✅ Sistem başlatıldı!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "❌ Sistemi durdurmak için Ctrl+C tuşlarına basın"
echo ""

# Frontend'i ana process olarak başlat (böylece Ctrl+C ile ikisi de durur)
npm start

# Eğer frontend durdurulursa backend'i de durdur
echo "🛑 Frontend durduruldu, backend de kapatılıyor..."
kill $BACKEND_PID 2>/dev/null || true 