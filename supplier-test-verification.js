// Tedarikçi verilerini test etmek için browser console script'i
// Browser console'da çalıştırın

console.log("🔍 TEDARİKÇİ VERİ DOĞRULAMA BAŞLIYOR...");

// Test tedarikçi verisi oluştur
const testSuppliers = [
  {
    id: "TEST-SUPPLIER-001",
    name: "Test Onaylı Tedarikçi",
    code: "TST-001",
    type: "onaylı",
    category: "kritik",
    supplyType: "malzeme",
    supplySubcategories: ["Çelik İmalat"],
    contact: {
      email: "test@onaylitedarikci.com",
      phone: "0312 123 45 67",
      address: "Test Adres",
      contactPerson: "Test Kişi"
    },
    materialTypes: ["çelik"],
    performanceScore: 95,
    qualityScore: 92,
    deliveryScore: 98,
    riskLevel: "düşük",
    status: "aktif",
    registrationDate: "2024-01-15",
    lastAuditDate: "2024-11-01",
    nextAuditDate: "2025-11-01",
    auditStatus: "tamamlandı",
    nonconformityCount: 0,
    defectCount: 0,
    dofCount: 0,
    isActive: true
  },
  {
    id: "TEST-SUPPLIER-002", 
    name: "Test Alternatif Tedarikçi",
    code: "TST-002",
    type: "alternatif",
    category: "genel",
    supplyType: "malzeme",
    supplySubcategories: ["Alüminyum İmalat"],
    contact: {
      email: "test@alternatiftedarikci.com",
      phone: "0312 234 56 78",
      address: "Test Alternatif Adres",
      contactPerson: "Test Alt Kişi"
    },
    materialTypes: ["alüminyum"],
    performanceScore: 87,
    qualityScore: 85,
    deliveryScore: 89,
    riskLevel: "orta",
    status: "aktif",
    registrationDate: "2024-02-10",
    lastAuditDate: "2024-10-15",
    nextAuditDate: "2025-10-15",
    auditStatus: "tamamlandı",
    nonconformityCount: 1,
    defectCount: 0,
    dofCount: 1,
    isActive: true
  }
];

// Test uygunsuzluk verisi
const testNonconformities = [
  {
    id: "TEST-NC-001",
    supplierId: "TEST-SUPPLIER-002",
    title: "Geç Teslimat",
    description: "Malzemeler 3 gün geç teslim edildi",
    category: "teslimat",
    severity: "orta",
    detectedDate: "2024-12-01",
    status: "açık",
    dueDate: "2024-12-15",
    correctionCost: 5000,
    partCode: "ALM-001",
    delayDays: 3,
    recurrence: false
  }
];

// Test hata verisi
const testDefects = [];

// Verileri localStorage'a kaydet
localStorage.setItem('suppliers', JSON.stringify(testSuppliers));
localStorage.setItem('supplier-nonconformities', JSON.stringify(testNonconformities)); 
localStorage.setItem('supplier-defects', JSON.stringify(testDefects));

console.log("✅ Test verileri localStorage'a kaydedildi");
console.log("📊 Onaylı Tedarikçi:", testSuppliers[0].name);
console.log("📊 Alternatif Tedarikçi:", testSuppliers[1].name);

// Event tetikle
window.dispatchEvent(new Event('supplierDataUpdated'));
console.log("🔄 Event tetiklendi, sayfayı yenileyin");

// Doğrulama fonksiyonu
setTimeout(() => {
  console.log("\n🔍 VERİ DOĞRULAMA:");
  
  const savedSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
  const savedNonconformities = JSON.parse(localStorage.getItem('supplier-nonconformities') || '[]');
  const savedDefects = JSON.parse(localStorage.getItem('supplier-defects') || '[]');
  
  console.log("👥 Kaydedilmiş Tedarikçi Sayısı:", savedSuppliers.length);
  console.log("⚠️ Kaydedilmiş Uygunsuzluk Sayısı:", savedNonconformities.length);
  console.log("🔴 Kaydedilmiş Hata Sayısı:", savedDefects.length);
  
  if (savedSuppliers.length === 2) {
    console.log("✅ Tedarikçi verileri başarıyla korundu!");
    
    // Type kontrolleri
    const onayliTedarikci = savedSuppliers.find(s => s.type === 'onaylı');
    const alternatifTedarikci = savedSuppliers.find(s => s.type === 'alternatif');
    
    if (onayliTedarikci && alternatifTedarikci) {
      console.log("✅ Onaylı ve Alternatif tedarikçi türleri mevcut");
      console.log("🔵 Onaylı:", onayliTedarikci.name);
      console.log("🟡 Alternatif:", alternatifTedarikci.name);
    } else {
      console.log("❌ Tedarikçi türleri eksik!");
    }
  } else {
    console.log("❌ Tedarikçi verileri kaybolmuş!");
  }
}, 1000);

console.log("\n💡 Şimdi Tedarikçi Kalite Yönetimi sayfasına gidin ve:");
console.log("1. Yeni tedarikçi eklemeyi deneyin");
console.log("2. Tür olarak 'Onaylı' seçin");
console.log("3. Console'da kaydetme loglarını izleyin");
console.log("4. Sayfa yenilendikten sonra verilerin korunup korunmadığını kontrol edin"); 