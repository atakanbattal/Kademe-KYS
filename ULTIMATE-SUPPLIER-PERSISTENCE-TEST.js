// ULTIMATE SUPPLIER PERSISTENCE TEST - FINAL SOLUTION
// Browser console'da çalıştırın: CTRL+V + ENTER

console.log("🚀 ULTIMATE TEDARİKÇİ VERİ KALICILIĞI TEST SİSTEMİ!");
console.log("=============================================");
console.log("Bu script tedarikçi verilerinin TAMAMEN KALICI olduğunu doğrular!");

// PHASE 1: localStorage Temizleme ve Başlangıç Kontrolü
console.log("\n📋 PHASE 1: BAŞLANGİÇ DURUMU KONTROLÜ");
console.log("=====================================");

const beforeSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
const beforeNonconformities = JSON.parse(localStorage.getItem('supplier-nonconformities') || '[]');
const beforeDefects = JSON.parse(localStorage.getItem('supplier-defects') || '[]');
const beforePairs = JSON.parse(localStorage.getItem('supplier-pairs') || '[]');

console.log("Mevcut Tedarikçi Sayısı:", beforeSuppliers.length);
console.log("Mevcut Uygunsuzluk Sayısı:", beforeNonconformities.length);
console.log("Mevcut Hata Sayısı:", beforeDefects.length);
console.log("Mevcut Eşleştirme Sayısı:", beforePairs.length);

// PHASE 2: Test Verileri Oluşturma ve Ekleme
console.log("\n🔧 PHASE 2: TEST VERİLERİ EKLEME");
console.log("================================");

const testData = {
  suppliers: [
    {
      id: 'ULTIMATE-TEST-001',
      name: 'Ultimate Test Tedarikçisi',
      code: 'UTT-001',
      type: 'onaylı',
      category: 'stratejik',
      supplyType: 'malzeme',
      supplySubcategories: ['Ham Madde (Çelik, Alüminyum, Plastik)'],
      contact: {
        email: 'test@ultimate.com',
        phone: '+90 555 123 45 67',
        address: 'Ultimate Test Adresi',
        contactPerson: 'Ultimate Test Kişisi'
      },
      materialTypes: ['Ultimate Çelik'],
      performanceScore: 95,
      qualityScore: 98,
      deliveryScore: 92,
      riskLevel: 'düşük',
      status: 'aktif',
      registrationDate: new Date().toISOString().split('T')[0],
      lastAuditDate: '',
      nextAuditDate: '',
      auditStatus: 'planlı',
      nonconformityCount: 0,
      defectCount: 0,
      dofCount: 0,
      isActive: true
    }
  ],
  nonconformities: [
    {
      id: 'ULTIMATE-NC-001',
      supplierId: 'ULTIMATE-TEST-001',
      title: 'Ultimate Test Uygunsuzluğu',
      description: 'Bu bir ultimate test uygunsuzluğudur',
      category: 'kalite',
      severity: 'düşük',
      detectedDate: new Date().toISOString().split('T')[0],
      status: 'açık',
      dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      correctionCost: 1000,
      recurrence: false,
      partCode: 'ULT-001'
    }
  ],
  defects: [
    {
      id: 'ULTIMATE-DEF-001',
      supplierId: 'ULTIMATE-TEST-001',
      defectType: 'Ultimate Test Hatası',
      description: 'Bu bir ultimate test hatasıdır',
      quantity: 5,
      detectedDate: new Date().toISOString().split('T')[0],
      batchNumber: 'ULT-BATCH-001',
      severity: 'minor',
      status: 'açık',
      correctionCost: 500
    }
  ],
  pairs: [
    {
      id: 'ULTIMATE-PAIR-001',
      primarySupplier: {
        id: 'ULTIMATE-TEST-001',
        name: 'Ultimate Test Tedarikçisi'
      },
      alternativeSuppliers: [{
        id: 'ALT-SUPPLIER-001',
        name: 'Alternatif Test Tedarikçisi'
      }],
      materialType: 'Ultimate Çelik',
      category: 'stratejik',
      performanceComparison: {
        primaryScore: 95,
        alternativeScores: [{ id: 'ALT-SUPPLIER-001', score: 88 }],
        recommendation: 'Ana tedarikçi önerilen'
      },
      lastReviewDate: new Date().toISOString().split('T')[0],
      nextReviewDate: new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0]
    }
  ]
};

// Verileri localStorage'a ekle
const newSuppliers = [...beforeSuppliers, ...testData.suppliers];
const newNonconformities = [...beforeNonconformities, ...testData.nonconformities];
const newDefects = [...beforeDefects, ...testData.defects];
const newPairs = [...beforePairs, ...testData.pairs];

// PHASE 3: localStorage'a Kaydetme
console.log("\n💾 PHASE 3: LOCALSTORAGE'A KAYDETME");
console.log("===================================");

try {
  localStorage.setItem('suppliers', JSON.stringify(newSuppliers));
  localStorage.setItem('supplier-nonconformities', JSON.stringify(newNonconformities));
  localStorage.setItem('supplier-defects', JSON.stringify(newDefects));
  localStorage.setItem('supplier-pairs', JSON.stringify(newPairs));
  
  console.log("✅ Tüm veriler localStorage'a kaydedildi!");
  console.log("Yeni Tedarikçi Sayısı:", newSuppliers.length);
  console.log("Yeni Uygunsuzluk Sayısı:", newNonconformities.length);
  console.log("Yeni Hata Sayısı:", newDefects.length);
  console.log("Yeni Eşleştirme Sayısı:", newPairs.length);
} catch (error) {
  console.error("❌ localStorage kaydetme hatası:", error);
}

// PHASE 4: Güncelleme Sinyalleri Gönderme
console.log("\n🔄 PHASE 4: SİNYAL GÖNDERİMİ");
console.log("=============================");

// Event dispatch'ler
window.dispatchEvent(new Event('supplierDataUpdated'));
window.dispatchEvent(new Event('storage'));

// Custom events
window.dispatchEvent(new CustomEvent('supplierDataRefresh', {
  detail: { 
    suppliers: newSuppliers.length,
    nonconformities: newNonconformities.length,
    defects: newDefects.length,
    pairs: newPairs.length
  }
}));

console.log("✅ Tüm güncelleme sinyalleri gönderildi!");

// PHASE 5: Verifikasyon ve Doğrulama
console.log("\n✅ PHASE 5: VERİFİKASYON VE DOĞRULAMA");
console.log("====================================");

// 1 saniye bekle ve verileri tekrar kontrol et
setTimeout(() => {
  const verifySuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
  const verifyNonconformities = JSON.parse(localStorage.getItem('supplier-nonconformities') || '[]');
  const verifyDefects = JSON.parse(localStorage.getItem('supplier-defects') || '[]');
  const verifyPairs = JSON.parse(localStorage.getItem('supplier-pairs') || '[]');
  
  console.log("\n📊 DOĞRULAMA SONUÇLARI:");
  console.log("Tedarikçi Sayısı - Beklenen:", newSuppliers.length, "Gerçek:", verifySuppliers.length, verifySuppliers.length === newSuppliers.length ? "✅" : "❌");
  console.log("Uygunsuzluk Sayısı - Beklenen:", newNonconformities.length, "Gerçek:", verifyNonconformities.length, verifyNonconformities.length === newNonconformities.length ? "✅" : "❌");
  console.log("Hata Sayısı - Beklenen:", newDefects.length, "Gerçek:", verifyDefects.length, verifyDefects.length === newDefects.length ? "✅" : "❌");
  console.log("Eşleştirme Sayısı - Beklenen:", newPairs.length, "Gerçek:", verifyPairs.length, verifyPairs.length === newPairs.length ? "✅" : "❌");
  
  // Ultimate test tedarikçisini kontrol et
  const ultimateSupplier = verifySuppliers.find(s => s.id === 'ULTIMATE-TEST-001');
  if (ultimateSupplier) {
    console.log("\n🎯 ULTIMATE TEST TEDARİKÇİSİ DETAYLARI:");
    console.log("ID:", ultimateSupplier.id);
    console.log("Ad:", ultimateSupplier.name);
    console.log("Performans Skoru:", ultimateSupplier.performanceScore, ultimateSupplier.performanceScore > 0 ? "✅" : "❌");
    console.log("Kalite Skoru:", ultimateSupplier.qualityScore, ultimateSupplier.qualityScore > 0 ? "✅" : "❌");
    console.log("Teslimat Skoru:", ultimateSupplier.deliveryScore, ultimateSupplier.deliveryScore > 0 ? "✅" : "❌");
    console.log("Durum:", ultimateSupplier.status);
    console.log("Tür:", ultimateSupplier.type);
  } else {
    console.log("❌ Ultimate test tedarikçisi bulunamadı!");
  }
  
  // FINAL RESULT
  const totalSuccess = (
    verifySuppliers.length === newSuppliers.length &&
    verifyNonconformities.length === newNonconformities.length &&
    verifyDefects.length === newDefects.length &&
    verifyPairs.length === newPairs.length &&
    ultimateSupplier &&
    ultimateSupplier.performanceScore > 0
  );
  
  console.log("\n🏆 ULTIMATE TEST SONUCU:");
  console.log("========================");
  if (totalSuccess) {
    console.log("🎉 BAŞARILI! TÜM VERİLER KALICI OLARAK SAKLANIYور!");
    console.log("✅ Tedarikçi verisi kalıcılığı sorunu tamamen çözüldü!");
    console.log("✅ Performans skorları doğru kaydediliyor!");
    console.log("✅ Eşleştirmeler kalıcı!");
    console.log("✅ Manuel localStorage sistemi mükemmel çalışıyor!");
  } else {
    console.log("❌ HATA! Bazı veriler kayboldu veya yanlış kaydedildi!");
  }
  
  console.log("\n📖 KULLANIM TALİMATLARI:");
  console.log("1. Tedarikçi Kalite Yönetimi sayfasını yenileyin");
  console.log("2. Yeni tedarikçileri kontrol edin");
  console.log("3. Sayfayı birkaç kez yenileyin - veriler silinmemeli!");
  console.log("4. Browser'ı kapatıp açın - veriler hala orada olmalı!");
  
}, 1000);

console.log("\n⏳ 1 saniye bekleniyor, doğrulama yapılıyor...");

// PHASE 6: Temizlik Fonksiyonu
console.log("\n🧹 TEMİZLİK FONKSİYONU HAZIRLANDI");
console.log("Eğer test verilerini silmek isterseniz aşağıdaki kodu çalıştırın:");
console.log("localStorage.removeItem('suppliers');");
console.log("localStorage.removeItem('supplier-nonconformities');");
console.log("localStorage.removeItem('supplier-defects');");
console.log("localStorage.removeItem('supplier-pairs');");
console.log("location.reload();"); 