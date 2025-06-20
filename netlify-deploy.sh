#!/bin/bash

# Netlify Deployment Script
echo "🚀 Netlify + MongoDB Deployment Başlıyor..."
echo "==========================================="

# Seçenek kontrolü
echo "Hangi deployment seçeneğini kullanmak istiyorsunuz?"
echo "1) Hybrid (Frontend: Netlify, Backend: Railway) - Önerilen"
echo "2) Full Serverless (Her şey Netlify Functions'da)"
echo ""
read -p "Seçiminizi yapın (1 veya 2): " choice

case $choice in
    1)
        echo "✅ Hybrid deployment seçildi"
        
        # MongoDB Atlas kontrol
        if [ -z "$MONGODB_URI" ]; then
            echo "⚠️  MONGODB_URI environment variable bulunamadı"
            echo "📋 Lütfen MongoDB Atlas connection string'inizi girin:"
            read -p "MONGODB_URI: " mongodb_uri
            export MONGODB_URI="$mongodb_uri"
        fi
        
        # Railway CLI kontrol
        if ! command -v railway &> /dev/null; then
            echo "📦 Railway CLI kuruluyor..."
            npm install -g @railway/cli
        fi
        
        # Netlify CLI kontrol
        if ! command -v netlify &> /dev/null; then
            echo "📦 Netlify CLI kuruluyor..."
            npm install -g netlify-cli
        fi
        
        # Backend deploy
        echo "🔧 Backend Railway'e deploy ediliyor..."
        cd src/backend
        echo "MONGODB_URI=$MONGODB_URI" > .env
        echo "NODE_ENV=production" >> .env
        echo "PORT=5003" >> .env
        echo "JWT_SECRET=kys-production-secret-$(date +%s)" >> .env
        
        railway login
        railway init --name "kys-backend"
        railway add
        railway deploy
        
        # Backend URL al
        echo "📝 Railway backend URL'ini alın ve not edin"
        echo "   https://dashboard.railway.app → your-project → settings → Public Domain"
        read -p "Backend URL'inizi girin (https://...railway.app): " backend_url
        
        # Frontend build
        cd ../..
        echo "🔧 Frontend build ediliyor..."
        
        # netlify.toml güncelle
        sed -i '' "s|https://your-backend-url.railway.app|$backend_url|g" netlify.toml
        
        npm install
        npm run build
        
        # Netlify deploy
        echo "🚀 Frontend Netlify'e deploy ediliyor..."
        netlify login
        netlify deploy --prod --dir=dist
        
        echo "✅ Hybrid deployment tamamlandı!"
        echo "🌐 Frontend: Netlify dashboard'dan URL'inizi alın"
        echo "📡 Backend: $backend_url"
        ;;
        
    2)
        echo "✅ Full Serverless deployment seçildi"
        
        # MongoDB Atlas kontrol
        if [ -z "$MONGODB_URI" ]; then
            echo "⚠️  MONGODB_URI environment variable bulunamadı"
            echo "📋 Lütfen MongoDB Atlas connection string'inizi girin:"
            read -p "MONGODB_URI: " mongodb_uri
            export MONGODB_URI="$mongodb_uri"
        fi
        
        # Netlify CLI kontrol
        if ! command -v netlify &> /dev/null; then
            echo "📦 Netlify CLI kuruluyor..."
            npm install -g netlify-cli
        fi
        
        # Serverless config kullan
        cp netlify-functions.toml netlify.toml
        
        # Serverless dependencies
        echo "📦 Serverless bağımlılıkları yükleniyor..."
        npm install serverless-http express mongoose cors
        
        # Build
        echo "🔧 Build ediliyor..."
        npm run build
        
        # Netlify deploy
        echo "🚀 Netlify'e deploy ediliyor..."
        netlify login
        netlify env:set MONGODB_URI "$MONGODB_URI"
        netlify env:set NODE_ENV "production"
        netlify deploy --prod
        
        echo "✅ Full Serverless deployment tamamlandı!"
        echo "🌐 Site: Netlify dashboard'dan URL'inizi alın"
        ;;
        
    *)
        echo "❌ Geçersiz seçenek. Lütfen 1 veya 2 seçin."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment tamamlandı!"
echo "📖 Detaylı bilgi için: netlify-deploy.md" 