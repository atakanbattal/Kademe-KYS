# 🔧 Supplier Quality Management - Dosya Sorunu Çözüm Kılavuzu

## 🎯 Sorunun Açıklaması
- Dosyalar yüklenebiliyor ama sayfa yenilendikten sonra görüntülenemiyor
- İndirme sırasında "internet bağlantınızı kontrol edin" hatası
- localStorage'da base64 veri bütünlüğü sorunu

## 💊 Hızlı Çözüm (5 Dakika)

### Adım 1: Tarayıcı Console Açın
1. `F12` tuşuna basın
2. `Console` tab'ına geçin
3. Aşağıdaki kodu kopyalayıp yapıştırın:

```javascript
// SUPPLIER QUALITY DOSYA SORUNU ÇÖZÜMÜ
console.log('🔧 Dosya sorunu düzeltiliyor...');
const audits = localStorage.getItem('supplier-audits');
if (audits) {
  try {
    const parsed = JSON.parse(audits);
    const fixedAudits = parsed.map(audit => ({
      ...audit,
      attachments: (audit.attachments || []).filter(att => 
        att.url && att.url.startsWith('data:') && att.name && att.type
      )
    }));
    localStorage.setItem('supplier-audits', JSON.stringify(fixedAudits));
    localStorage.setItem('supplier-audits-backup', JSON.stringify(fixedAudits));
    console.log('✅ Düzeltildi!');
    window.location.reload();
  } catch (error) {
    localStorage.removeItem('supplier-audits');
    window.location.reload();
  }
}
```

### Adım 2: Alternatif Çözüm (Manuel)
Eğer yukarıdaki kod çalışmazsa:

1. F12 → Application → Local Storage → localhost
2. `supplier-audits` anahtarını silin
3. `supplier-audits-backup` anahtarını silin
4. Sayfayı yenileyin (F5)

## 🛠️ Kalıcı Çözüm (Geliştiriciler için)

### localStorage Veri Doğrulama Sistemi:
```javascript
// Dosya yükleme sonrası doğrulama
const validateFileData = (attachment) => {
  return attachment.url && 
         attachment.url.startsWith('data:') && 
         attachment.name && 
         attachment.type &&
         attachment.size > 0;
};

// localStorage kaydetme öncesi kontrol
const saveAuditsWithValidation = (audits) => {
  const validatedAudits = audits.map(audit => ({
    ...audit,
    attachments: (audit.attachments || []).filter(validateFileData)
  }));
  
  localStorage.setItem('supplier-audits', JSON.stringify(validatedAudits));
  localStorage.setItem('supplier-audits-backup', JSON.stringify(validatedAudits));
};
```

## 🚨 Gelecekte Bu Sorunu Önleme

1. **Dosya Boyutu**: 10MB'dan küçük dosyalar yükleyin
2. **Tarayıcı Cache**: Düzenli olarak temizleyin
3. **localStorage Limiti**: Çok fazla dosya yüklemeyin
4. **Yedekleme**: Önemli dosyaları başka yerde de saklayın

## 🎯 Test Etme

Çözüm uygulandıktan sonra:
1. Bir PDF dosyası yükleyin
2. Sayfayı yenileyin (F5)
3. "Görüntüle" butonuna tıklayın
4. "İndir" butonunu test edin

## 📞 Destek

Sorun devam ederse:
- Tarayıcı konsol loglarını kontrol edin
- Farklı tarayıcıda test edin
- İncognito modda test edin
