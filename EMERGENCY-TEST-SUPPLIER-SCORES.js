// EMERGENCY TEST - Tedarikçi Performans Skorları Test Sistemi
// Browser console'da çalıştırın: CTRL+V + ENTER

console.log("🚨 TEDARİKÇİ PERFORMANS SKORU TEST SİSTEMİ!");
console.log("======================================");

// Mevcut tedarikçileri kontrol et
const currentSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
console.log("\n📊 MEVCUT TEDARİKÇİLER:");
console.log("Toplam Tedarikçi Sayısı:", currentSuppliers.length);

if (currentSuppliers.length > 0) {
  currentSuppliers.forEach((supplier, index) => {
    console.log(`\n${index + 1}. ${supplier.name} (${supplier.code})`);
    console.log(`   Performans Skoru: ${supplier.performanceScore || 'YOK!'}`);
    console.log(`   Kalite Skoru: ${supplier.qualityScore || 'YOK!'}`);
    console.log(`   Teslimat Skoru: ${supplier.deliveryScore || 'YOK!'}`);
    console.log(`   Risk Seviyesi: ${supplier.riskLevel || 'YOK!'}`);
    console.log(`   Durum: ${supplier.status || 'YOK!'}`);
    console.log(`   Tür: ${supplier.type || 'YOK!'}`);
  });
} else {
  console.log("❌ Hiç tedarikçi bulunamadı!");
}

// Test tedarikçisi ekle
console.log("\n🔧 TEST TEDARİKÇİSİ EKLEME...");

const testSupplier = {
  id: 'TEST-HIGH-PERFORMANCE-' + Date.now(),
  name: 'Test Yüksek Performans Tedarikçisi',
  code: 'TYHP-001',
  type: 'onaylı',
  category: 'stratejik',
  supplyType: 'malzeme',
  supplySubcategories: ['Ham Madde (Çelik, Alüminyum, Plastik)'],
  contact: {
    email: 'test@yuksekperformans.com',
    phone: '+90 312 456 78 90',
    address: 'Test Yüksek Performans Adresi',
    contactPerson: 'Test Performans Uzmanı'
  },
  materialTypes: ['Test Çelik'],
  performanceScore: 95,  // ✅ YÜKSEK SKOR
  qualityScore: 92,      // ✅ YÜKSEK SKOR
  deliveryScore: 98,     // ✅ YÜKSEK SKOR
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
};

// Test tedarikçisini localStorage'a ekle
const updatedSuppliers = [...currentSuppliers, testSupplier];
localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));

console.log("✅ TEST TEDARİKÇİSİ EKLENDİ!");
console.log("Test Tedarikçi Detayları:");
console.log("ID:", testSupplier.id);
console.log("Ad:", testSupplier.name);
console.log("Kod:", testSupplier.code);
console.log("Performans Skoru:", testSupplier.performanceScore);
console.log("Kalite Skoru:", testSupplier.qualityScore);
console.log("Teslimat Skoru:", testSupplier.deliveryScore);
console.log("Risk Seviyesi:", testSupplier.riskLevel);
console.log("Durum:", testSupplier.status);

// KPI modülüne sinyal gönder
window.dispatchEvent(new Event('supplierDataUpdated'));
window.dispatchEvent(new Event('storage'));

console.log("\n🔄 VERİ GÜNCELLEMESİ SİNYALİ GÖNDERİLDİ!");

// Sonuç kontrolü
const finalSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
console.log("\n📋 SONUÇ RAPORU:");
console.log("Toplam Tedarikçi Sayısı:", finalSuppliers.length);
console.log("Son Eklenen Tedarikçi:", finalSuppliers[finalSuppliers.length - 1]?.name);

// Performans skoru kontrolü
const lastSupplier = finalSuppliers[finalSuppliers.length - 1];
if (lastSupplier) {
  console.log("\n🎯 PERFORMANS SKORU ANALİZİ:");
  console.log(`Performans Skoru: ${lastSupplier.performanceScore} ${lastSupplier.performanceScore > 0 ? '✅' : '❌'}`);
  console.log(`Kalite Skoru: ${lastSupplier.qualityScore} ${lastSupplier.qualityScore > 0 ? '✅' : '❌'}`);
  console.log(`Teslimat Skoru: ${lastSupplier.deliveryScore} ${lastSupplier.deliveryScore > 0 ? '✅' : '❌'}`);
  
  if (lastSupplier.performanceScore > 0 && lastSupplier.qualityScore > 0 && lastSupplier.deliveryScore > 0) {
    console.log("\n🎉 BAŞARILI! TÜM PERFORMANS SKORLARI DOĞRU!");
  } else {
    console.log("\n❌ HATA! Performans skorları 0 geldi!");
  }
}

console.log("\n=== TEST TAMAMLANDI ===");
console.log("Tedarikçi Kalite Yönetimi sayfasını yenileyin ve yeni tedarikçiyi kontrol edin."); 