# 🚀 Kalite Yönetim Sistemi - MongoDB Deployment Rehberi

## 📋 Ön Hazırlık

### 1. Gerekli Bağımlılıkları Yükleyin

```bash
# Backend bağımlılıklarını yükle
cd src/backend
npm install

# Frontend bağımlılıklarını yükle  
cd ../..
npm install
```

### 2. Environment Variables Ayarlayın

```bash
# Backend klasöründe .env dosyası oluşturun
cp src/backend/env.example src/backend/.env
```

`.env` dosyasını düzenleyin:
```env
MONGODB_URI=mongodb://localhost:27017/kys
NODE_ENV=development
PORT=5003
JWT_SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=http://localhost:3005
```

## 🐳 Docker ile Local Deployment

### 1. Docker Compose ile Başlat

```bash
# Tüm servisleri başlat (MongoDB, Backend, Frontend)
docker-compose up -d

# Logları takip et
docker-compose logs -f

# Servisleri durdur
docker-compose down
```

### 2. Manuel Docker Build

```bash
# Docker image'ı oluştur
docker build -t kys-app .

# Container'ı çalıştır
docker run -d -p 5003:5003 --name kys-backend kys-app
```

## 🌐 Cloud Deployment Seçenekleri

### 1. Railway (Önerilen)

```bash
# Railway CLI kurulumu
npm install -g @railway/cli

# Railway'e login
railway login

# Proje oluştur
railway init
railway add

# Environment variables ayarla
railway variables set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/kys"
railway variables set JWT_SECRET="your-production-jwt-secret"
railway variables set NODE_ENV="production"

# Deploy et
railway deploy
```

### 2. Heroku

```bash
# Heroku CLI kurulumu gerekli
heroku create kys-app

# MongoDB Atlas bağlantısı
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/kys"
heroku config:set JWT_SECRET="your-production-jwt-secret"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main
```

### 3. Vercel (Serverless)

```bash
# Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Environment variables Vercel dashboard'tan ayarlayın
```

### 4. DigitalOcean/AWS/GCP VPS

```bash
# Sunucuya bağlan
ssh user@your-server-ip

# Node.js ve Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Git clone
git clone https://github.com/your-username/kys-app.git
cd kys-app

# Environment variables ayarla
cp src/backend/env.example src/backend/.env
nano src/backend/.env

# Docker Compose ile çalıştır
docker-compose up -d

# Nginx reverse proxy (isteğe bağlı)
sudo apt install nginx
# nginx.conf dosyasını /etc/nginx/sites-available/ klasörüne kopyalayın
```

## 📊 MongoDB Setup

### 1. MongoDB Atlas (Cloud)

1. [MongoDB Atlas](https://cloud.mongodb.com) hesabı oluşturun
2. Yeni cluster oluşturun (FREE tier kullanabilirsiniz)
3. Database user oluşturun
4. Network access ayarlayın (0.0.0.0/0 veya specific IP)
5. Connection string'i kopyalayın

```
mongodb+srv://username:password@cluster0.mongodb.net/kys?retryWrites=true&w=majority
```

### 2. Local MongoDB

```bash
# MongoDB kurulumu (Ubuntu/Debian)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# MongoDB servisini başlat
sudo systemctl start mongod
sudo systemctl enable mongod

# MongoDB'ye bağlan
mongo --host localhost:27017
```

## 🔧 Production Konfigürasyonu

### 1. Environment Variables (Production)

```env
# Production .env
NODE_ENV=production
PORT=5003
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kys
JWT_SECRET=super-secure-256-bit-secret-key
FRONTEND_URL=https://your-domain.com
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_MAX=100
```

### 2. SSL/HTTPS Kurulumu

```bash
# Let's Encrypt ile SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# SSL sertifikalarını nginx.conf'ta aktif edin
```

### 3. PM2 ile Process Management

```bash
# PM2 kurulumu
npm install -g pm2

# Backend'i PM2 ile çalıştır
cd src/backend
pm2 start dist/index.js --name "kys-backend"

# PM2 auto-start
pm2 startup
pm2 save

# Logs
pm2 logs kys-backend
```

## 🛠️ Development Workflow

```bash
# Development modunda çalıştır
npm run dev

# Backend build
cd src/backend && npm run build

# Frontend build
npm run build

# Test
npm test

# Lint
npm run lint
```

## 📈 Monitoring & Logs

### 1. Health Check

```bash
# API health check
curl http://your-domain.com/health

# MongoDB connection check
curl http://your-domain.com/api/status
```

### 2. Log Monitoring

```bash
# Docker logs
docker-compose logs -f backend

# PM2 logs
pm2 logs kys-backend

# System logs
tail -f /var/log/nginx/access.log
```

## 🔒 Security Checklist

- [ ] JWT secret güçlü ve unique
- [ ] MongoDB authentication aktif
- [ ] HTTPS/SSL aktif
- [ ] Rate limiting aktif
- [ ] CORS ayarları doğru
- [ ] Environment variables güvenli
- [ ] Firewall kuralları ayarlı
- [ ] Backup stratejisi mevcut

## 🌟 URL Örnekleri

Deployment sonrası erişilebilir URL'ler:

- **Frontend:** `https://your-domain.com`
- **API:** `https://your-domain.com/api`
- **Health:** `https://your-domain.com/health`

---

## 🆘 Sorun Giderme

### Backend çalışmıyor
```bash
# Logları kontrol et
docker-compose logs backend
pm2 logs kys-backend

# Port kullanımını kontrol et
lsof -i :5003
```

### MongoDB bağlantı sorunu
```bash
# MongoDB durumunu kontrol et
docker-compose ps
mongo --host localhost:27017

# Connection string'i kontrol et
echo $MONGODB_URI
```

### Build hataları
```bash
# Node modules temizle
rm -rf node_modules package-lock.json
npm install

# TypeScript build
cd src/backend && npm run build
```

📞 **Destek:** Herhangi bir sorun yaşarsanız, loglara bakın ve gerekli debugging adımlarını uygulayın. 