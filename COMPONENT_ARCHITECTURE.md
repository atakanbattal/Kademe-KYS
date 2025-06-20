# 🏗️ Component Architecture - Kademe A.Ş. Kalite Yönetim Sistemi

## 📁 Ana Bileşen Yapısı

### 🎯 **Layout ve Navigation**
```
src/frontend/kys-frontend/src/components/
├── Layout.tsx          ← 🚨 ANA LAYOUT! Sidebar burada!
├── PageHeader.tsx      ← Sayfa başlıkları
└── PerformanceOptimizer.tsx ← Performans optimizasyonu
```

### 📄 **Sayfalar (Pages)**
```
src/frontend/kys-frontend/src/pages/
├── Dashboard.tsx       ← Ana dashboard sayfası
├── KPIManagement.tsx   ← KPI yönetim modülü
├── Settings.tsx        ← Uygulama ayarları
└── [diğer modüller]    ← Tüm diğer işlevsel sayfalar
```

## 🔧 **Kritik Dosyalar ve Sorumlulukları**

### `Layout.tsx` - Ana Layout Kontrolcüsü
- **Sidebar/Navigation menüsü:** ✅ BURADADIR
- **Company header:** ✅ BURADADIR  
- **Responsive davranış:** ✅ BURADADIR
- **Menu sections:** ✅ BURADADIR

**⚠️ ÖNEMLİ:** Sidebar ile ilgili TÜM düzenlemeler `Layout.tsx` dosyasında yapılmalıdır!

### `App.tsx` - Routing ve Global Setup
- Route tanımları
- Layout wrapper'ları
- Global providers

### `Dashboard.tsx` - Dashboard İçeriği
- KPI kartları
- Dashboard widgets
- Veri görselleştirme

## 🚨 **Yaygın Hatalar ve Çözümleri**

### ❌ Hata: "Sidebar değişiklikleri görünmüyor"
**Sebep:** `Sidebar.tsx` yerine `Layout.tsx` kullanılıyor  
**Çözüm:** Değişiklikleri `Layout.tsx` dosyasında yap

### ❌ Hata: "Hangi dosyayı düzenleyeceğimi bilmiyorum"
**Sebep:** Component hierarchy belirsiz  
**Çözüm:** Bu dokumanı kontrol et veya grep search kullan

### ❌ Hata: "Duplicate components"
**Sebep:** Benzer isimli birden fazla dosya  
**Çözüm:** Kullanılmayan dosyaları sil, net isimlendirme yap

## 🔍 **Hızlı Arama Komutları**

```bash
# Bir component'in nerede kullanıldığını bul
grep -r "ComponentName" src/

# Import'ları kontrol et
grep -r "import.*ComponentName" src/

# Dosya içinde arama
grep -n "className\|function\|const" dosya.tsx
```

## 📋 **Geliştirme İçin Best Practices**

1. **Dosya değiştirmeden önce:**
   - `grep` ile gerçekten doğru dosyayı bulduğunu doğrula
   - Component'in nereden import edildiğini kontrol et

2. **Yeni component oluştururken:**
   - Net, açıklayıcı isimler kullan
   - Bu dokümantasyonu güncelle
   - Dosya başına açıklama yorumu ekle

3. **Refactoring yaparken:**
   - Kullanılmayan dosyaları sil
   - İsimlendirmeleri tutarlı tut
   - Dependencies'leri kontrol et

## 📞 **Yardım Gerektiğinde**

- Component bulamıyorsan: Bu dokümanı kontrol et
- Değişiklik görünmüyorsa: Layout.tsx'e bak
- Duplicate dosya varsa: Kullanılan versiyonu bul, diğerini sil

---
**Son Güncelleme:** 2024-12-29  
**Güncelleyen:** Atakan Battal  
**Versiyon:** 1.0 