#!/bin/bash

# Kademe A.Ş. Kalite Yönetim Sistemi Otomatik Başlatıcı
# Bu script frontend uygulamasını kolayca başlatır

# Ana dizine git
cd "/Users/atakanbattal/Desktop/Kademe A.Ş. Kalite Yönetim Sistemi"

# Frontend dizinine git
cd src/frontend/kys-frontend

# Çalışan React processlerini öldür
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "react-app-rewired" 2>/dev/null || true

# 2 saniye bekle
sleep 2

# Port 3000'i temizle
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    kill -9 $(lsof -Pi :3000 -sTCP:LISTEN -t) 2>/dev/null || true
    sleep 2
fi

# node_modules yoksa yükle
if [ ! -d "node_modules" ]; then
    npm install
fi

# Uygulamayı başlat
npm start
