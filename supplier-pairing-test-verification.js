// Tedarikçi Eşleştirme verilerini test etmek için browser console script'i
// Browser console'da çalıştırın

console.log("🔍 TEDARİKÇİ EŞLEŞTİRME VERİ DOĞRULAMA BAŞLIYOR...");

// Önce mevcut verileri kontrol et
const checkCurrentData = () => {
  console.log("\n📊 MEVCUT VERİ DURUMU:");
  
  const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
  const pairs = JSON.parse(localStorage.getItem('supplier-pairs') || '[]');
  
  console.log("👥 Mevcut Tedarikçi Sayısı:", suppliers.length);
  console.log("🔗 Mevcut Eşleştirme Sayısı:", pairs.length);
  
  const onayliTedarikcilar = suppliers.filter(s => s.type === 'onaylı');
  const alternatifTedarikcilar = suppliers.filter(s => s.type === 'alternatif');
  
  console.log("🔵 Onaylı Tedarikçiler:", onayliTedarikcilar.length);
  console.log("🟡 Alternatif Tedarikçiler:", alternatifTedarikcilar.length);
  
  if (pairs.length > 0) {
    console.log("\n🔗 MEVCUT EŞLEŞTİRMELER:");
    pairs.forEach((pair, index) => {
      console.log(`${index + 1}. ${pair.primarySupplier.name} ↔ ${pair.alternativeSuppliers[0]?.name} (${pair.materialType})`);
    });
  }
  
  return { suppliers, pairs, onayliTedarikcilar, alternatifTedarikcilar };
};

// Test tedarikçi verisi oluştur (eğer eksikse)
const createTestSuppliersIfNeeded = () => {
  const { suppliers, onayliTedarikcilar, alternatifTedarikcilar } = checkCurrentData();
  
  let needsUpdate = false;
  let updatedSuppliers = [...suppliers];
  
  // En az 1 onaylı tedarikçi olmalı
  if (onayliTedarikcilar.length === 0) {
    console.log("⚠️ Onaylı tedarikçi eksik, ekleniyor...");
    updatedSuppliers.push({
      id: "TEST-APPROVED-001",
      name: "Test Onaylı Çelik A.Ş.",
      code: "TOCA-001",
      type: "onaylı",
      category: "kritik",
      supplyType: "malzeme",
      supplySubcategories: ["Ham Madde (Çelik, Alüminyum, Plastik)"],
      contact: {
        email: "info@testcelik.com",
        phone: "0312 111 22 33",
        address: "Test Onaylı Adres",
        contactPerson: "Onaylı Test Kişi"
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
    });
    needsUpdate = true;
  }
  
  // En az 1 alternatif tedarikçi olmalı
  if (alternatifTedarikcilar.length === 0) {
    console.log("⚠️ Alternatif tedarikçi eksik, ekleniyor...");
    updatedSuppliers.push({
      id: "TEST-ALT-001",
      name: "Test Alternatif Metal Ltd.",
      code: "TAM-001",
      type: "alternatif",
      category: "genel",
      supplyType: "malzeme",
      supplySubcategories: ["Yarı Mamul (Profil, Sac, Boru)"],
      contact: {
        email: "info@testalternatif.com",
        phone: "0212 333 44 55",
        address: "Test Alternatif Adres",
        contactPerson: "Alternatif Test Kişi"
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
    });
    needsUpdate = true;
  }
  
  if (needsUpdate) {
    localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
    console.log("✅ Eksik tedarikçiler eklendi");
    return updatedSuppliers;
  }
  
  return suppliers;
};

// Test eşleştirmesi oluştur
const createTestPairing = () => {
  console.log("\n🔗 TEST EŞLEŞTİRMESİ OLUŞTURULUYOR...");
  
  const suppliers = createTestSuppliersIfNeeded();
  const onayliTedarikci = suppliers.find(s => s.type === 'onaylı');
  const alternatifTedarikci = suppliers.find(s => s.type === 'alternatif');
  
  if (!onayliTedarikci || !alternatifTedarikci) {
    console.log("❌ Eşleştirme için uygun tedarikçiler bulunamadı!");
    return;
  }
  
  const existingPairs = JSON.parse(localStorage.getItem('supplier-pairs') || '[]');
  
  const testPair = {
    id: `PAIR-TEST-${Date.now()}`,
    primarySupplier: onayliTedarikci,
    alternativeSuppliers: [alternatifTedarikci],
    materialType: 'çelik',
    category: 'kritik',
    performanceComparison: {
      primaryScore: onayliTedarikci.performanceScore,
      alternativeScores: [{ 
        id: alternatifTedarikci.id, 
        score: alternatifTedarikci.performanceScore 
      }],
      recommendation: onayliTedarikci.performanceScore >= alternatifTedarikci.performanceScore 
        ? 'Ana tedarikçi önerilen' : 'Alternatif tedarikçi değerlendirilebilir'
    },
    lastReviewDate: new Date().toISOString().split('T')[0],
    nextReviewDate: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
  };
  
  // Aynı eşleştirme var mı kontrol et
  const existsPair = existingPairs.find(p => 
    p.primarySupplier.id === onayliTedarikci.id && 
    p.alternativeSuppliers[0]?.id === alternatifTedarikci.id &&
    p.materialType === 'çelik'
  );
  
  if (existsPair) {
    console.log("⚠️ Bu eşleştirme zaten mevcut:", existsPair.id);
    console.log(`🔵 Ana: ${existsPair.primarySupplier.name}`);
    console.log(`🟡 Alternatif: ${existsPair.alternativeSuppliers[0]?.name}`);
    return existsPair;
  }
  
  const updatedPairs = [...existingPairs, testPair];
  localStorage.setItem('supplier-pairs', JSON.stringify(updatedPairs));
  
  console.log("✅ Test eşleştirmesi oluşturuldu!");
  console.log(`🆔 ID: ${testPair.id}`);
  console.log(`🔵 Ana Tedarikçi: ${onayliTedarikci.name} (${onayliTedarikci.type})`);
  console.log(`🟡 Alternatif: ${alternatifTedarikci.name} (${alternatifTedarikci.type})`);
  console.log(`📦 Malzeme: ${testPair.materialType}`);
  console.log(`⭐ Tavsiye: ${testPair.performanceComparison.recommendation}`);
  
  return testPair;
};

// Veri doğrulama fonksiyonu
const verifyData = () => {
  console.log("\n🔍 VERİ DOĞRULAMA:");
  
  const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
  const pairs = JSON.parse(localStorage.getItem('supplier-pairs') || '[]');
  
  console.log("👥 Toplam Tedarikçi:", suppliers.length);
  console.log("🔗 Toplam Eşleştirme:", pairs.length);
  
  const onayliCount = suppliers.filter(s => s.type === 'onaylı').length;
  const alternatifCount = suppliers.filter(s => s.type === 'alternatif').length;
  
  console.log("🔵 Onaylı Tedarikçi Sayısı:", onayliCount);
  console.log("🟡 Alternatif Tedarikçi Sayısı:", alternatifCount);
  
  if (pairs.length > 0) {
    console.log("\n📋 EŞLEŞTIRME DETAYLARI:");
    pairs.forEach((pair, index) => {
      console.log(`${index + 1}. ${pair.primarySupplier.name} (${pair.primarySupplier.type}) ↔ ${pair.alternativeSuppliers[0]?.name} (${pair.alternativeSuppliers[0]?.type})`);
      console.log(`   📦 Malzeme: ${pair.materialType}`);
      console.log(`   ⭐ Tavsiye: ${pair.performanceComparison.recommendation}`);
      console.log("");
    });
    
    console.log("✅ Eşleştirme verileri başarıyla korunuyor!");
  } else {
    console.log("⚠️ Henüz eşleştirme verisi yok");
  }
  
  return { suppliers, pairs };
};

// Event tetikle
const triggerEvents = () => {
  window.dispatchEvent(new Event('supplierDataUpdated'));
  window.dispatchEvent(new Event('storage'));
  console.log("🔄 Güncelleme event'leri tetiklendi");
};

// Ana test süreci
console.log("🚀 TEST SÜRECİ BAŞLIYOR...\n");

// 1. Mevcut durum kontrolü
checkCurrentData();

// 2. Test eşleştirmesi oluştur
createTestPairing();

// 3. Event'leri tetikle
triggerEvents();

// 4. 1 saniye sonra doğrulama
setTimeout(() => {
  console.log("\n" + "=".repeat(50));
  console.log("📊 1 SANİYE SONRA DOĞRULAMA SONUÇLARI");
  console.log("=".repeat(50));
  
  const result = verifyData();
  
  if (result.pairs.length > 0) {
    console.log("🎉 BAŞARILI! Eşleştirme verileri localStorage'da korunuyor!");
  } else {
    console.log("❌ SORUN VAR! Eşleştirme verileri silinmiş!");
  }
  
  console.log("\n💡 ŞİMDİ YAPACAKLARINIZ:");
  console.log("1. Tedarikçi Kalite Yönetimi sayfasına gidin (http://localhost:3026/supplier-quality-management)");
  console.log("2. 'Tedarikçi Eşleştirme' tab'ına tıklayın");
  console.log("3. Yeni eşleştirme oluşturmayı deneyin");
  console.log("4. Ana tedarikçi kısmında sadece 'Onaylı' tedarikçilerin göründüğünü kontrol edin");
  console.log("5. Alternatif kısmında 'Onaylı' ve 'Alternatif' tedarikçilerin göründüğünü kontrol edin");
  console.log("6. Sayfa yenilendikten sonra eşleştirmelerin korunduğunu kontrol edin");
}, 1000);

console.log("\n⏳ 1 saniye bekleniyor..."); 