// Eski hedef sistemini temizleme scripti
console.log('🧹 Eski hedef sistemi temizleniyor...');

// localStorage'daki eski hedefleri sil
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('vehicle-targets');
  console.log('✅ Eski hedefler temizlendi');
  
  // Diğer ilgili verileri de temizle
  const keysToRemove = [
    'vehicle-targets',
    'kys-cost-management-data',
    'vehicleQualityRecords',
    'vehicleRecords'
  ];
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`✅ ${key} temizlendi`);
    }
  });
  
  console.log('🎉 Tüm eski veriler temizlendi! Sayfayı yenileyin.');
} else {
  console.log('❌ localStorage mevcut değil');
} 