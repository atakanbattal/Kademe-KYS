# Kademe A.Ş. Kalite Yönetim Sistemi - Kurulum ve Çalıştırma Kılavuzu

## İç İçe Geçen Yazı Problemi Düzeltmeleri

### Yapılan İyileştirmeler

1. **Layout Component Düzeltmeleri (`src/frontend/kys-frontend/src/components/Layout.tsx`)**
   - Z-index değerleri optimize edildi
   - Overflow yönetimi geliştirildi
   - Responsive tasarım iyileştirildi
   - Sidebar ve main content arasında uygun aralıklar sağlandı

2. **Global CSS Düzeltmeleri (`src/frontend/kys-frontend/src/index.css`)**
   - Text wrapping kuralları eklendi
   - Box-sizing normalize edildi
   - Horizontal scroll önlendi
   - Typography elemanları için word-break kuralları

3. **Component CSS Düzeltmeleri (`src/frontend/kys-frontend/src/App.css`)**
   - MUI Card componentleri için z-index ve spacing
   - Typography elemanları için text overflow koruması
   - Grid layout iyileştirmeleri
   - Chart container düzeltmeleri
   - Button, Chip, Tab text wrapping

4. **Theme Context İyileştirmeleri (`src/frontend/kys-frontend/src/context/ThemeContext.tsx`)**
   - Typography varsayılan değerleri optimize edildi
   - Component override'lar eklendi
   - Word-break ve overflow-wrap ayarları
   - Z-index hierarchy düzenlendi
   - **Floating Label Desteği**: Tüm TextField ve FormControl componentleri için `variant="outlined"` varsayılan olarak ayarlandı
   - **Otomatik Label Shrink**: InputLabel'lar artık otomatik olarak shrink oluyor

5. **Form Field Düzeltmeleri**
   - **MaterialQualityControl**: Tüm TextField'lara `variant="outlined"` eklendi
   - **TankLeakTest**: Form fieldları floating label destekli hale getirildi
   - **Global TextField Config**: Tema seviyesinde tüm TextField'lar için varsayılan variant ayarlandı

6. **Backend Port Yönetimi (`src/backend/src/index.ts`)**
   - Graceful shutdown handling
   - Port çakışması error handling
   - Process yönetimi iyileştirildi

## Floating Label Sistemi

Artık tüm form fieldları aşağıdaki davranışı sergiler:
- Placeholder text normal durumda input içinde görünür
- Field'a tıklandığında label üste çıkar ve border rengi değişir
- Bu davranış otomatik olarak tüm TextField ve Select componentlerinde aktif

### Floating Label Nasıl Çalışır:
- **Boş Field**: Label placeholder olarak gösterilir
- **Focus/Dolu Field**: Label üste çıkar, border vurgulanır
- **Tema Uyumlu**: Dark/Light mode'a uygun renkler
- **Tutarlı**: Tüm sayfalarda aynı davranış

## Kurulum

### Gereksinimler
- Node.js 16+ 
- npm 8+
- MongoDB (backend için)

### Backend Kurulumu

1. Backend dizinine gidin:
```bash
cd src/backend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Environment variables dosyasını oluşturun:
```bash
cp .env.example .env
```

4. MongoDB connection string'ini `.env` dosyasında yapılandırın

### Frontend Kurulumu

1. Frontend dizinine gidin:
```bash
cd src/frontend/kys-frontend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

## Çalıştırma

### Development Modu

1. **Backend'i Başlatın** (Port 5000):
```bash
cd src/backend
npm run dev
```

2. **Frontend'i Başlatın** (Port 3000):
```bash
cd src/frontend/kys-frontend
npm start
```

3. Tarayıcınızda `http://localhost:3000` adresini açın

### Port Çakışması Durumunda

Eğer portlar kullanımdaysa:

```bash
# Port 5000'i temizle
lsof -ti:5000 | xargs kill -9

# Port 3000'i temizle  
lsof -ti:3000 | xargs kill -9

# Tüm node processlerini temizle
killall node
```

## İç İçe Geçen Yazı Problemleri için Kontrol Listesi

### 1. Component Seviyesinde
- [ ] Card componentlerinin `overflow: visible` olduğunu kontrol edin
- [ ] Z-index değerlerinin doğru sırada olduğunu kontrol edin
- [ ] Typography elemanlarının `word-break: break-word` olduğunu kontrol edin

### 2. Layout Seviyesinde
- [ ] Sidebar ve main content arasında uygun spacing olduğunu kontrol edin
- [ ] Mobile responsive tasarımda overlap olmadığını kontrol edin
- [ ] Fixed/absolute positioned elemanların z-index değerlerini kontrol edin

### 3. CSS Seviyesinde
- [ ] Global CSS kurallarının yüklendiğini kontrol edin
- [ ] MUI theme override'larının aktif olduğunu kontrol edin
- [ ] Box-sizing: border-box kuralının uygulandığını kontrol edin

## Debugging

### Console'da CSS kontrolleri:
```javascript
// MUI theme'in yüklendiğini kontrol et
console.log(document.querySelector('[data-mui-theme]'));

// CSS kurallarını kontrol et
getComputedStyle(document.querySelector('.MuiTypography-root'));
```

### Network üzerinden server kontrolü:
```bash
# Backend kontrolü
curl http://localhost:5000

# Frontend kontrolü
curl http://localhost:3000
```

## Önemli Notlar

1. **Tema Değişiklikleri**: Tema değişiklikleri localStorage'da saklanır
2. **Responsive Tasarım**: Mobil cihazlarda sidebar collapse olur
3. **Dark/Light Mode**: Tema değişikliği otomatik olarak tüm componentlere uygulanır
4. **Performance**: Text overflow kuralları performance'ı etkileyebilir, gerekirse optimize edin

## Sorun Giderme

### Yazılar İç İçe Geçerse:
1. Tarayıcı cache'ini temizleyin
2. CSS dosyalarının yüklendiğini kontrol edin
3. MUI theme'in doğru uygulandığını kontrol edin
4. Z-index değerlerini developer tools'da inceleyin

### Port Problemleri:
1. `lsof -i :3000,5000` ile port durumunu kontrol edin
2. Node process'lerini temizleyin
3. Server'ları tek tek yeniden başlatın

### Build Problemleri:
1. `node_modules` klasörlerini silin ve yeniden `npm install` yapın
2. TypeScript error'ları için tip tanımlarını kontrol edin
3. Import path'lerini kontrol edin 