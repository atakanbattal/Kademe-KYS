// Equipment Calibration Cache Temizleme Script'i
// Bu script'i tarayıcı console'unda çalıştırın

console.log("🔧 Ekipman Kalibrasyon Cache'i Temizleniyor...");

// Mevcut cache'leri listele
const cacheKeys = [
  'equipment_names_by_category',
  'equipment_names_version',
  'measurement_ranges_by_sub_category', 
  'measurement_ranges_version',
  'measurement_uncertainties_by_sub_category',
  'measurement_uncertainties_version',
  'measurement_ranges_by_category',
  'measurement_uncertainties_by_category'
];

console.log("📋 Mevcut Cache Keys:");
cacheKeys.forEach(key => {
  const value = localStorage.getItem(key);
  console.log(`${key}: ${value ? '✓ Var' : '✗ Yok'}`);
});

// Cache'leri temizle
console.log("\n🧹 Cache'ler temizleniyor...");
cacheKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`🗑️ ${key} temizlendi`);
});

console.log("\n✅ Cache temizleme tamamlandı!");
console.log("🔄 Sayfayı yenileyin (F5) ve yeni cihazlar görünecek.");

// Yeni eklenen cihazları listele
console.log("\n📋 Eklenen Yeni Cihazlar:");
const newDevices = [
  "Takometre - Digital",
  "Takometre - Laser", 
  "Takometre - Optik",
  "Sentil Çakısı - 0.001mm",
  "Sentil Çakısı - 0.002mm", 
  "Sentil Çakısı - 0.005mm",
  "Radius Mastar - İç R",
  "Radius Mastar - Dış R",
  "Radius Mastar - Universal", 
  "Dijital Isı Ölçer - İnfrared",
  "Dijital Isı Ölçer - Temaslı",
  "Dijital Isı Ölçer - Problu",
  "Su Terazisi - Standart",
  "Su Terazisi - Hassas", 
  "Su Terazisi - Digital"
];

newDevices.forEach((device, index) => {
  console.log(`${index + 1}. ✨ ${device}`);
}); 