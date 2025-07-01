// localStorage Debug Script
console.log('🔍 LOCALSTORAGE VERİ KONTROLÜ BAŞLIYOR...');

const storageKeys = [
  'monthly_category_productions',
  'monthly_vehicle_productions',
  'kys-cost-management-data',
  'productionQualityData',
  'productionQualityTracking'
];

const currentMonth = new Date().toISOString().substring(0, 7);
console.log('🗓️ Mevcut Ay (beklenen format):', currentMonth);

storageKeys.forEach(key => {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      console.log(`\n📦 ${key}:`, {
        exists: true,
        totalRecords: Array.isArray(parsed) ? parsed.length : 'not array',
        currentMonthRecords: Array.isArray(parsed) ? 
          parsed.filter(p => p.donem === currentMonth || p.month === currentMonth || p.createdDate?.includes(currentMonth)).length : 0,
        sampleData: Array.isArray(parsed) ? parsed.slice(0, 2) : parsed,
        allDates: Array.isArray(parsed) ? 
          parsed.map(p => p.donem || p.month || p.createdDate || p.tarih).filter(Boolean).slice(0, 5) : []
      });
    } else {
      console.log(`\n❌ ${key}: NOT FOUND`);
    }
  } catch (error) {
    console.log(`\n⚠️ ${key}: PARSE ERROR`, error.message);
  }
});

console.log('\n🎯 ÖNERİLER:');
console.log('1. Aylık Üretim Sayıları sekmesinde veri girişi yapın');
console.log('2. Veri donem formatının', currentMonth, 'olarak kaydedildiğinden emin olun');
console.log('3. Console\'da "🏭 Bu Ay Üretilen Kartı - ÇOK KAYNAK DEBUG" mesajını kontrol edin'); 