#!/bin/bash

# 🚀 Kademe KYS - Hızlı Deployment Script
# Bu script deployment dosyalarını hazırlar ve GitHub'a push eder

echo "🚀 Kademe KYS Deployment Hazırlığı Başlıyor..."

# Deployment dosyalarını GitHub'a ekle
echo "📁 Deployment dosyaları ekleniyor..."
git add .

# Commit oluştur
echo "💾 Deployment commit'i oluşturuluyor..."
git commit -m "🚀 Production deployment hazırlığı tamamlandı

✅ Deployment dosyaları eklendi:
- railway.json - Railway backend deployment config
- netlify.toml - Netlify frontend deployment config  
- deployment-guide.md - Kapsamlı deployment rehberi
- backend.env.example - Backend environment variables örneği
- frontend.env.example - Frontend environment variables örneği

🔧 Backend production optimizasyonları:
- CORS konfigürasyonu güncellendi
- Error handling geliştirildi
- Health check endpoints eklendi
- Production logging ayarlandı

📋 Deployment sırası:
1. MongoDB Atlas cluster oluştur
2. Railway'da backend deploy et  
3. Netlify'da frontend deploy et
4. Environment variables'ları ayarla
5. Cross-service bağlantıları test et"

# GitHub'a push et
echo "🌐 GitHub'a push ediliyor..."
git push origin main

echo ""
echo "✅ Deployment hazırlığı tamamlandı!"
echo ""
echo "📋 Sıradaki adımlar:"
echo "1. 🗄️  MongoDB Atlas: https://cloud.mongodb.com"
echo "2. 🚂 Railway Backend: https://railway.app/dashboard"
echo "3. 🌐 Netlify Frontend: https://app.netlify.com"
echo ""
echo "📖 Detaylı rehber: deployment-guide.md dosyasını inceleyin"
echo "🔗 GitHub Repository: https://github.com/atakanbattal/Kademe-KYS"
echo ""
echo "🎯 Her servis için environment variables'ları ayarlamayı unutmayın!" 