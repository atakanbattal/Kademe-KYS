import api from './api';

// ENUMS - Backend ile uyumlu
export enum VehicleStatus {
  PRODUCTION = 'production',
  QUALITY_CONTROL = 'quality_control', 
  RETURNED_TO_PRODUCTION = 'returned_to_production',
  SERVICE = 'service',  // SERVİS adımı eklendi
  READY_FOR_SHIPMENT = 'ready_for_shipment',
  SHIPPED = 'shipped'
}

export enum DefectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum DefectStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

// INTERFACES
export interface Vehicle {
  _id: string;
  vehicleName: string;
  vehicleModel: string;
  serialNumber: string;
  customerName: string;
  spsNumber?: string;
  productionDate: Date;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  currentStatus: VehicleStatus;
  statusHistory: StatusHistory[];
  defects: Defect[];
  isOverdue: boolean;
  overdueDate?: Date;
  warningLevel: 'none' | 'warning' | 'critical';
  estimatedCompletionDate?: Date;
  productionReturnDate?: Date;
  qualityStartDate?: Date;
  serviceStartDate?: Date; // Servis başlangıç tarihi
  serviceEndDate?: Date; // Servis bitiş tarihi  
  shipmentDate?: Date;
  shipmentNotes?: string;
  targetShipmentDate?: Date; // Hedef müşteri sevk tarihi
  dmoDate?: Date; // DMO muayene tarihi
  qualityControlDuration?: number; // Kalitede geçirilen süre (gün)
  productionDuration?: number; // Üretimde geçirilen süre (gün)
  serviceDuration?: number; // Serviste geçirilen süre (gün)
  totalProcessDuration?: number; // Toplam süreç süresi (gün)
  createdAt: Date;
  updatedAt: Date;
}

export interface StatusHistory {
  id: string;
  status: VehicleStatus;
  date: Date;
  performedBy: string;
  performedById: string;
  notes?: string;
  reason?: string;
}

export interface Defect {
  _id: string;
  category: string; // Ana kategori (Malzeme Hatası, Personel Hatası, vs.)
  subcategory: string; // Alt kategori (detaylı sebep)
  description: string;
  department: string;
  responsiblePerson?: string;
  priority: DefectPriority;
  status: DefectStatus;
  notes?: string;
  reportedDate: Date;
  resolvedDate?: Date;
  estimatedResolutionDate?: Date;
  reportedBy: string;
  resolvedBy?: string;
  resolutionDuration?: number; // Çözüm süresi (saat)
}

export interface DashboardStats {
  totalVehicles: number;
  inProduction: number;
  inQualityControl: number;
  returnedToProduction: number;
  inService: number;  // Servis durumu eklendi
  readyForShipment: number;
  shipped: number;
  overdueVehicles: number;
  criticalDefects: number;
  avgQualityTime: number;
  avgProductionTime: number;
  avgServiceTime?: number;  // Servis süresi eklendi (opsiyonel)
  avgShipmentTime: number;
  monthlyShipped: number;
  qualityEfficiency: number;
  recentActivities: RecentActivity[];
}

export interface Warning {
  id: string;
  vehicleId: string;
  message: string;
  level: 'warning' | 'critical';
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

interface RecentActivity {
  id: string;
  vehicleId: string;
  vehicleName: string;
  serialNumber: string;
  customerName: string;
  message: string;
  user: string;
  time: Date;
  status?: VehicleStatus;
}

export interface WarningSettings {
  id: string;
  name: string;
  type: 'production_return' | 'target_shipment' | 'dmo_inspection';
  threshold: number;
  unit: 'hours' | 'days';
  level: 'warning' | 'critical';
  isActive: boolean;
  description?: string;
}

export interface VehicleFilters {
  status?: VehicleStatus;
  model?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  isOverdue?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateVehicleData {
  vehicleName: string;
  vehicleModel: string;
  serialNumber: string;
  customerName: string;
  spsNumber?: string;
  productionDate: Date;
  targetShipmentDate?: Date;
  dmoDate?: Date;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface UpdateVehicleData extends Partial<CreateVehicleData> {
  currentStatus?: VehicleStatus;
  statusHistory?: StatusHistory[];
  isOverdue?: boolean;
  warningLevel?: 'none' | 'warning' | 'critical';
  updatedAt?: Date;
}

export interface CreateDefectData {
  category: string;
  subcategory: string;
  description: string;
  department: string;
  responsiblePerson?: string;
  priority: DefectPriority;
  notes?: string;
  estimatedResolutionDate?: Date;
  reportedBy: string;
}

// VEHICLE MODEL CONFIG - Diğer modüllerle uyumlu
export const VEHICLE_MODEL_CONFIG = {
  'HSCK': ['6+1', '8+1', '10+1,5', '13+1,5', '14+1,5', '15+1,5', '16+2', '22+2', '14+2'],
  'Araç Üstü Vakumlu': ['KDM35', 'KDM80S', 'İstac6', 'KDM45', 'KDM75'],
  'Mekanik Süpürge': ['Çelik 2000', 'FTH', 'Ural'],
  'Kompakt Araç': ['AGA2100', 'AGA3000', 'AGA6000'],
  'Çay Toplama Makinesi': ['Çay Toplama Makinesi'],
  'Rusya Motor Odası': ['RMO'],
  'Özel (Manuel Giriş)': []
};

// DEPARTMENTS - Sistemdeki diğer modüllerle uyumlu
export const DEPARTMENTS = [
  'Kalite Kontrol',
  'Kalite Güvence', 
  'Kesim',
  'Büküm',
  'Kaynakhane',
  'Mekanik Montaj',
  'Elektrik Montaj',
  'Boyahane',
  'Sevkiyat',
  'Depo',
  'Satın Alma',
  'Üretim Planlama',
  'Ar-Ge',
  'Proje Yönetimi',
  'Diğer'
];

// DEFECT CATEGORIES - Profesyonel eksiklik kategorileri
export const DEFECT_CATEGORIES: Record<string, string[]> = {
  'Malzeme Hatası': [
    'Hammadde Kalitesizliği', 
    'Yanlış Malzeme Kullanımı', 
    'Malzeme Eksikliği',
    'Malzeme Hasarı (Depolama/Taşıma)', 
    'Ölçü/Boyut Uyumsuzluğu', 
    'Yüzey Kusurları (Çizik, Pas)',
    'Malzeme Sertlik Değeri Hatası',
    'Renk/Görünüm Kalite Hatası'
  ],
  'Personel Hatası': [
    'Hatalı Montaj/Demontaj', 
    'Eksik İşlem/Adım', 
    'Yanlış Ayar/Kalibrasyon',
    'Prosedür İhlali', 
    'Dikkat Eksikliği/Dalgınlık', 
    'Yanlış Ölçüm/Kontrol',
    'İş Talimatına Uymama',
    'Güvenlik Kurallarına Uymama'
  ],
  'Makine/Ekipman Hatası': [
    'Makine Arızası/Duruşu', 
    'Ekipman Kalibrasyon Hatası', 
    'Takım/Aparat Aşınması',
    'Yanlış Ekipman Kullanımı', 
    'Bakım Eksikliği', 
    'Otomasyon Hatası',
    'Yedek Parça Problemi',
    'Makine Performans Düşüklüğü'
  ],
  'Tasarım Hatası': [
    'Tasarım Ölçü Uyumsuzluğu', 
    'Malzeme Seçim Hatası (Tasarım)', 
    'Montaj Zorluğu (Tasarım Kaynaklı)',
    'Fonksiyonel Eksiklik', 
    'Ergonomik Sorunlar', 
    'Dayanıklılık/Ömür Problemi',
    'Teknik Çizim Hatası',
    'Tolerans Hatası'
  ],
  'Proses Hatası': [
    'Yanlış İş Akışı/Sıralama', 
    'Zamanlama Hatası', 
    'Kalite Kontrol Eksikliği (Proses)',
    'Dokümantasyon Eksikliği/Hatası', 
    'İletişim Kopukluğu', 
    'Çevre Koşulları Etkisi (Proses)',
    'Koordinasyon Eksikliği',
    'Kaynak Tahsis Hatası'
  ],
  'Yazılım Hatası': [
    'Yazılım Fonksiyon Hatası', 
    'Entegrasyon Hatası', 
    'Kullanıcı Arayüzü Hatası',
    'Veri İşleme Hatası', 
    'Güvenlik Açığı', 
    'Performans Sorunu',
    'Konfigürasyon Hatası',
    'Güncelleme/Versiyon Problemi'
  ],
  'Diğer': [
    'Nakliye Hasarı', 
    'Dış Kaynaklı Hata', 
    'Müşteri Kaynaklı Hata', 
    'Çevresel Faktörler',
    'Tanımlanamayan Hata',
    'Sistem Dışı Faktör'
  ]
};

// Eski DEFECT_CATEGORIES tanımı kaldırıldı

// DEFAULT WARNING SETTINGS
export const DEFAULT_WARNING_SETTINGS: WarningSettings[] = [
  {
    id: '1',
    name: 'Üretim Geri Dönüş Uyarısı',
    type: 'production_return',
    threshold: 2,
    unit: 'days',
    level: 'warning',
    isActive: true,
    description: 'Üretime geri gönderilip kaliteye dönmeyen araçlar için uyarı'
  },
  {
    id: '2', 
    name: 'Kritik Gecikme Uyarısı',
    type: 'production_return',
    threshold: 5,
    unit: 'days',
    level: 'critical',
    isActive: true,
    description: 'Uzun süreli üretime takılı kalan araçlar için kritik uyarı'
  },
  {
    id: '3',
    name: 'Hedef Sevk Tarihi Yaklaşıyor',
    type: 'target_shipment',
    threshold: 3,
    unit: 'days',
    level: 'warning',
    isActive: true,
    description: 'Müşteri hedef sevk tarihi yaklaşan araçlar için uyarı'
  },
  {
    id: '4',
    name: 'DMO Muayene Tarihi Yaklaşıyor',
    type: 'dmo_inspection',
    threshold: 7,
    unit: 'days',
    level: 'warning',
    isActive: true,
    description: 'DMO muayene tarihi yaklaşan araçlar için uyarı'
  },
  {
    id: '5',
    name: 'DMO Muayene Tarihi Geçti',
    type: 'dmo_inspection',
    threshold: 0,
    unit: 'days',
    level: 'critical',
    isActive: true,
    description: 'DMO muayene tarihi geçen araçlar için kritik uyarı'
  }
];

// HELPER FUNCTIONS
// Helper function for vehicle status labels (Turkish)
export const getVehicleStatusLabel = (status: VehicleStatus): string => {
  switch (status) {
    case VehicleStatus.PRODUCTION: return 'Üretimde';
    case VehicleStatus.QUALITY_CONTROL: return 'Kalite Kontrolde';
    case VehicleStatus.RETURNED_TO_PRODUCTION: return 'Üretime Döndü';
    case VehicleStatus.SERVICE: return 'Serviste';  // SERVİS etiketi eklendi
    case VehicleStatus.READY_FOR_SHIPMENT: return 'Sevke Hazır';
    case VehicleStatus.SHIPPED: return 'Sevk Edildi';
    default: return 'Bilinmiyor';
  }
};

// Helper function for specific status colors (as requested by user)
export const getVehicleStatusColor = (status: VehicleStatus): string => {
  switch (status) {
    case VehicleStatus.PRODUCTION: return '#f44336'; // Red for "Üretimde"
    case VehicleStatus.QUALITY_CONTROL: return '#ff9800'; // Yellow for "Kalite Kontrolde"
    case VehicleStatus.RETURNED_TO_PRODUCTION: return '#f44336'; // Red for "Üretime Döndü"
    case VehicleStatus.SERVICE: return '#9c27b0'; // Purple for "Serviste"
    case VehicleStatus.READY_FOR_SHIPMENT: return '#4caf50'; // Green for "Sevke Hazır"
    case VehicleStatus.SHIPPED: return '#2196f3'; // Blue for "Sevk Edildi"
    default: return '#9e9e9e'; // Gray for unknown
  }
};

// Helper function for Turkish time formatting
export const formatTurkishTime = (timeInHours: number): string => {
  if (!timeInHours || timeInHours === 0) return '0 saat';
  
  const hours = Math.floor(timeInHours);
  const minutes = Math.round((timeInHours - hours) * 60);
  
  if (hours === 0) {
    return `${minutes} dakika`;
  } else if (minutes === 0) {
    return `${hours} saat`;
  } else {
    return `${hours} saat ${minutes} dakika`;
  }
};

export const getPriorityLabel = (priority: 'low' | 'medium' | 'high' | 'critical'): string => {
  const labels = {
    'low': 'Düşük',
    'medium': 'Orta', 
    'high': 'Yüksek',
    'critical': 'Kritik'
  };
  return labels[priority] || priority;
};

export const getPriorityColor = (priority: 'low' | 'medium' | 'high' | 'critical'): string => {
  const colors = {
    'low': '#4caf50',
    'medium': '#ff9800',
    'high': '#ff5722',
    'critical': '#f44336'
  };
  return colors[priority] || '#9e9e9e';
};

export const getShippedDate = (vehicle: Vehicle): Date | null => {
  const shippedStatus = vehicle.statusHistory.find(h => h.status === VehicleStatus.SHIPPED);
  return shippedStatus ? new Date(shippedStatus.date) : null;
};

export const getDefectPriorityLabel = (priority: DefectPriority): string => {
  const labels = {
    [DefectPriority.LOW]: 'Düşük',
    [DefectPriority.MEDIUM]: 'Orta',
    [DefectPriority.HIGH]: 'Yüksek',
    [DefectPriority.CRITICAL]: 'Kritik'
  };
  return labels[priority] || priority;
};

export const getDefectStatusLabel = (status: DefectStatus): string => {
  const labels = {
    [DefectStatus.OPEN]: 'Açık',
    [DefectStatus.IN_PROGRESS]: 'Devam Ediyor', 
    [DefectStatus.RESOLVED]: 'Çözüldü',
    [DefectStatus.CLOSED]: 'Kapatıldı'
  };
  return labels[status] || status;
};

// LOCAL STORAGE KEYS
export const STORAGE_KEYS = {
  VEHICLES: 'vehicleQualityControl_vehicles',
  WARNING_SETTINGS: 'vehicleQualityControl_warningSettings',
  RECENT_ACTIVITIES: 'vehicleQualityControl_recentActivities'
};

// VEHICLE QUALITY CONTROL SERVICE CLASS
class VehicleQualityControlService {
  private vehicles: Vehicle[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // STORAGE METHODS
  private loadFromStorage(): void {
    try {
      const vehiclesData = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      if (vehiclesData) {
        this.vehicles = JSON.parse(vehiclesData);
      }
      
      // Recent activities getRecentActivities metodunda doğrudan localStorage'dan okunuyor
      
      // Vehicles yüklendikten sonra uyarı durumlarını yeniden hesapla
      if (this.vehicles.length > 0) {
        setTimeout(() => this.recalculateAllWarnings(), 100);
      }
      this.clearOldActivities(); // Eski ve geçersiz aktiviteleri temizle
    } catch (error) {
      console.error('LocalStorage yükleme hatası:', error);
      this.vehicles = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(this.vehicles));
      // Recent activities doğrudan addRecentActivity metodunda localStorage'a yazılıyor
    } catch (error) {
      console.error('LocalStorage kaydetme hatası:', error);
    }
  }

  // Eski addRecentActivity tanımı kaldırıldı - yeni tanım dosyanın sonunda

  // DASHBOARD METHODS
  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalVehicles = this.vehicles.length;
    const inProduction = this.vehicles.filter(v => v.currentStatus === VehicleStatus.PRODUCTION).length;
    const inQualityControl = this.vehicles.filter(v => v.currentStatus === VehicleStatus.QUALITY_CONTROL).length;
    const returnedToProduction = this.vehicles.filter(v => v.currentStatus === VehicleStatus.RETURNED_TO_PRODUCTION).length;
    const inService = this.vehicles.filter(v => v.currentStatus === VehicleStatus.SERVICE).length;  // Servis durumu eklendi
    const readyForShipment = this.vehicles.filter(v => v.currentStatus === VehicleStatus.READY_FOR_SHIPMENT).length;
    const shipped = this.vehicles.filter(v => v.currentStatus === VehicleStatus.SHIPPED).length;
    const overdueVehicles = this.vehicles.filter(v => v.isOverdue).length;
    const criticalDefects = this.vehicles.reduce((count, v) => count + v.defects.filter(d => d.priority === DefectPriority.CRITICAL).length, 0);

    // Aylık sevk edilen araçlar
    const monthlyShipped = this.vehicles.filter(v => {
      if (v.currentStatus !== VehicleStatus.SHIPPED) return false;
      const shippedHistory = v.statusHistory.find(h => h.status === VehicleStatus.SHIPPED);
      if (!shippedHistory) return false;
      const shippedDate = new Date(shippedHistory.date);
      return shippedDate.getMonth() === currentMonth && shippedDate.getFullYear() === currentYear;
    }).length;

    // Ortalama süreler (saat cinsinden)
    const avgQualityTime = this.calculateAverageQualityTime();
    const avgProductionTime = this.calculateAverageProductionTime();
    const avgServiceTime = this.calculateAverageServiceTime();  // Servis süresi eklendi
    const avgShipmentTime = this.calculateAverageShipmentTime();
    const qualityEfficiency = this.calculateQualityEfficiency();

    return {
      totalVehicles,
      inProduction,
      inQualityControl,
      returnedToProduction,
      inService,  // Servis durumu eklendi
      readyForShipment,
      shipped,
      overdueVehicles,
      criticalDefects,
      avgQualityTime,
      avgProductionTime,
      avgServiceTime,  // Servis süresi eklendi
      avgShipmentTime,
      monthlyShipped,
      qualityEfficiency,
      recentActivities: this.getRecentActivities(10)
    };
  }

  private calculateAverageQualityTime(): number {
    // Kalite kontrolden geçmiş araçları bul (sevke hazır veya sevk edilmiş)
    const completedVehicles = this.vehicles.filter(v => 
      v.currentStatus === VehicleStatus.READY_FOR_SHIPMENT || 
      v.currentStatus === VehicleStatus.SHIPPED
    );

    if (completedVehicles.length === 0) return 0;

    let totalHours = 0;
    let validCalculations = 0;

    completedVehicles.forEach(vehicle => {
      // Kaliteye giriş zamanları
      const qualityStarts = vehicle.statusHistory.filter(h => h.status === VehicleStatus.QUALITY_CONTROL);
      
      // Kaliteden çıkış zamanları (üretime geri gönderme veya sevke hazır)
      const qualityExits = vehicle.statusHistory.filter(h => 
        h.status === VehicleStatus.RETURNED_TO_PRODUCTION || 
        h.status === VehicleStatus.READY_FOR_SHIPMENT
      );

      qualityStarts.forEach(start => {
        // Bu girişten sonraki ilk çıkışı bul
        const exit = qualityExits.find(e => new Date(e.date) > new Date(start.date));
        if (exit) {
          const hours = (new Date(exit.date).getTime() - new Date(start.date).getTime()) / (1000 * 60 * 60);
          // Mantıklı süre kontrolü (1 dakika - 30 gün arası)
          if (hours >= 0.017 && hours <= 720) { // 1 dakika = 0.017 saat, 30 gün = 720 saat
            totalHours += hours;
            validCalculations++;
          }
        }
      });
    });

    return validCalculations > 0 ? Math.round(totalHours / validCalculations * 10) / 10 : 0;
  }

  private calculateAverageProductionTime(): number {
    // Üretime geri gönderilmiş araçları bul
    const returnedVehicles = this.vehicles.filter(v => 
      v.statusHistory.some(h => h.status === VehicleStatus.RETURNED_TO_PRODUCTION)
    );

    if (returnedVehicles.length === 0) return 0;

    let totalHours = 0;
    let validCalculations = 0;

    returnedVehicles.forEach(vehicle => {
      // Üretime giriş zamanları (üretime geri gönderme)
      const productionStarts = vehicle.statusHistory.filter(h => h.status === VehicleStatus.RETURNED_TO_PRODUCTION);
      
      // Üretimden çıkış zamanları (kaliteye geri dönüş)
      const productionExits = vehicle.statusHistory.filter(h => h.status === VehicleStatus.QUALITY_CONTROL);
      
      productionStarts.forEach(start => {
        // Bu üretime girişten sonraki ilk kaliteye dönüşü bul
        const exit = productionExits.find(e => new Date(e.date) > new Date(start.date));
        if (exit) {
          const hours = (new Date(exit.date).getTime() - new Date(start.date).getTime()) / (1000 * 60 * 60);
          // Mantıklı süre kontrolü (1 dakika - 30 gün arası)
          if (hours >= 0.017 && hours <= 720) { // 1 dakika = 0.017 saat, 30 gün = 720 saat
            totalHours += hours;
            validCalculations++;
          }
        }
      });
    });

    return validCalculations > 0 ? Math.round(totalHours / validCalculations * 10) / 10 : 0;
  }

  private calculateAverageShipmentTime(): number {
    const shippedVehicles = this.vehicles.filter(v => v.currentStatus === VehicleStatus.SHIPPED);
    if (shippedVehicles.length === 0) return 0;

    let totalHours = 0;
    let validCalculations = 0;

    shippedVehicles.forEach(vehicle => {
      const shippedHistory = vehicle.statusHistory.find(h => h.status === VehicleStatus.SHIPPED);
      if (!shippedHistory) return;

      const qualityControlHistory = vehicle.statusHistory.filter(h => h.status === VehicleStatus.QUALITY_CONTROL);
      const qualityStart = qualityControlHistory.find(h => new Date(h.date) < new Date(shippedHistory.date));

      if (qualityStart) {
        const hours = (new Date(shippedHistory.date).getTime() - new Date(qualityStart.date).getTime()) / (1000 * 60 * 60);
        if (hours >= 0.017 && hours <= 720) { // 1 dakika = 0.017 saat, 30 gün = 720 saat
          totalHours += hours;
          validCalculations++;
        }
      } else {
        // Eğer kaliteye dönüş kaydı yoksa, sevke tarihi ile üretim tarihi arasındaki süreyi hesapla
        const productionStart = vehicle.statusHistory.find(h => h.status === VehicleStatus.RETURNED_TO_PRODUCTION);
        if (productionStart) {
          const hours = (new Date(shippedHistory.date).getTime() - new Date(productionStart.date).getTime()) / (1000 * 60 * 60);
          if (hours >= 0.017 && hours <= 720) {
            totalHours += hours;
            validCalculations++;
          }
        }
      }
    });

    return validCalculations > 0 ? Math.round(totalHours / validCalculations * 10) / 10 : 0;
  }

  private calculateAverageServiceTime(): number {
    // Servisten geçmiş araçları bul (servis bitmiş olanlar)
    const servicedVehicles = this.vehicles.filter(v => 
      v.statusHistory.some(h => h.status === VehicleStatus.SERVICE) &&
      (v.currentStatus === VehicleStatus.QUALITY_CONTROL || 
       v.currentStatus === VehicleStatus.READY_FOR_SHIPMENT || 
       v.currentStatus === VehicleStatus.SHIPPED ||
       v.serviceEndDate) // Servis bitiş tarihi olan araçlar
    );

    if (servicedVehicles.length === 0) return 0;

    let totalHours = 0;
    let validCalculations = 0;

    servicedVehicles.forEach(vehicle => {
      // Servise giriş zamanları
      const serviceStarts = vehicle.statusHistory.filter(h => h.status === VehicleStatus.SERVICE);
      
      serviceStarts.forEach(start => {
        let serviceEnd: Date | null = null;
        
        // Önce serviceEndDate alanına bak
        if (vehicle.serviceEndDate) {
          serviceEnd = new Date(vehicle.serviceEndDate);
        } else {
          // Servis başlangıcından sonraki ilk kalite veya sevke hazır durumunu bul
          const serviceExit = vehicle.statusHistory.find(h => 
            (h.status === VehicleStatus.QUALITY_CONTROL || h.status === VehicleStatus.READY_FOR_SHIPMENT) &&
            new Date(h.date) > new Date(start.date)
          );
          if (serviceExit) {
            serviceEnd = new Date(serviceExit.date);
          }
        }
        
        if (serviceEnd) {
          const hours = (serviceEnd.getTime() - new Date(start.date).getTime()) / (1000 * 60 * 60);
          // Mantıklı süre kontrolü (1 dakika - 30 gün arası)
          if (hours >= 0.017 && hours <= 720) { // 1 dakika = 0.017 saat, 30 gün = 720 saat
            totalHours += hours;
            validCalculations++;
          }
        }
      });
    });

    return validCalculations > 0 ? Math.round(totalHours / validCalculations * 10) / 10 : 0;
  }

  private calculateQualityEfficiency(): number {
    if (this.vehicles.length === 0) return 100;
    
    const passed = this.vehicles.filter(v => 
      v.currentStatus === VehicleStatus.READY_FOR_SHIPMENT || 
      v.currentStatus === VehicleStatus.SHIPPED ||
      (v.currentStatus === VehicleStatus.QUALITY_CONTROL && v.defects.length === 0)
    ).length;
    
    return Math.round((passed / this.vehicles.length) * 100);
  }

  // VEHICLE CRUD METHODS
  async getAllVehicles(filters?: VehicleFilters): Promise<Vehicle[]> {
    let filteredVehicles = [...this.vehicles];

    if (filters) {
      if (filters.status) {
        filteredVehicles = filteredVehicles.filter(v => v.currentStatus === filters.status);
      }
      if (filters.model) {
        filteredVehicles = filteredVehicles.filter(v => v.vehicleModel === filters.model);
      }
      if (filters.priority) {
        filteredVehicles = filteredVehicles.filter(v => v.priority === filters.priority);
      }
      if (filters.isOverdue !== undefined) {
        filteredVehicles = filteredVehicles.filter(v => v.isOverdue === filters.isOverdue);
      }
      if (filters.dateFrom) {
        filteredVehicles = filteredVehicles.filter(v => 
          new Date(v.productionDate) >= new Date(filters.dateFrom!)
        );
      }
      if (filters.dateTo) {
        filteredVehicles = filteredVehicles.filter(v => 
          new Date(v.productionDate) <= new Date(filters.dateTo!)
        );
      }
    }

    return filteredVehicles;
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    return this.vehicles.find(v => v._id === id) || null;
  }

  async createVehicle(data: CreateVehicleData): Promise<Vehicle> {
    // Seri numarası kontrolü
    const existingVehicle = this.vehicles.find(v => v.serialNumber === data.serialNumber);
    if (existingVehicle) {
      throw new Error('Bu seri numarası zaten kullanılmaktadır');
    }

    const now = new Date();
    const newVehicle: Vehicle = {
      _id: Date.now().toString(),
      vehicleName: data.vehicleName,
      vehicleModel: data.vehicleModel,
      serialNumber: data.serialNumber,
      customerName: data.customerName,
      spsNumber: data.spsNumber,
      productionDate: data.productionDate,
      description: data.description,
      priority: data.priority || 'medium',
      currentStatus: VehicleStatus.QUALITY_CONTROL,
      statusHistory: [{
        id: Date.now().toString(),
        status: VehicleStatus.QUALITY_CONTROL,
        date: now,
        performedBy: 'Sistem Kullanıcısı',
        performedById: 'system',
        notes: 'Araç sisteme eklendi ve kalite kontrole alındı'
      }],
      defects: [],
      isOverdue: false,
      warningLevel: 'none',
      createdAt: now,
      updatedAt: now
    };

    this.vehicles.unshift(newVehicle);
    this.addRecentActivity(newVehicle._id, newVehicle.vehicleName, 'Araç sisteme eklendi ve kalite kontrole alındı', VehicleStatus.QUALITY_CONTROL);
    this.saveToStorage();

    return newVehicle;
  }

  async updateVehicle(id: string, data: UpdateVehicleData): Promise<Vehicle> {
    const vehicleIndex = this.vehicles.findIndex(v => v._id === id);
    if (vehicleIndex === -1) {
      throw new Error('Araç bulunamadı');
    }

    const vehicle = this.vehicles[vehicleIndex];
    const updatedVehicle = {
      ...vehicle,
      ...data,
      updatedAt: new Date()
    };

    // Eğer durum veya durum geçmişi güncellendiyse, uyarı durumunu yeniden hesapla
    if (data.currentStatus || data.statusHistory) {
      const warningSettings = await this.getWarningSettings();
      const isOverdue = this.checkOverdueStatus(updatedVehicle, warningSettings);
      const warningLevel = this.calculateWarningLevel(updatedVehicle, warningSettings);
      
      updatedVehicle.isOverdue = isOverdue;
      updatedVehicle.warningLevel = warningLevel;
    }

    // DÜZELTME: Araç güncellemesi garantisini artır
    this.vehicles[vehicleIndex] = updatedVehicle;
    
    // Durum değişikliği mesajını daha açıklayıcı yap
    const statusChanged = data.currentStatus && data.currentStatus !== vehicle.currentStatus;
    const activityMessage = statusChanged 
      ? `Araç durumu "${getVehicleStatusLabel(vehicle.currentStatus)}" -> "${getVehicleStatusLabel(data.currentStatus!)}" olarak güncellendi`
      : 'Araç bilgileri güncellendi';
    
    this.addRecentActivity(id, updatedVehicle.vehicleName, activityMessage, updatedVehicle.currentStatus);
    this.saveToStorage();

    return updatedVehicle;
  }

  // Helper methods for warning calculations
  private checkOverdueStatus(vehicle: Vehicle, warningSettings: WarningSettings[]): boolean {
    const activeSettings = warningSettings.filter(w => w.isActive);
    
    // 1. Üretim geri dönüş kontrolü
    const productionReturnWarnings = this.checkProductionReturnWarnings(vehicle, activeSettings);
    
    // 2. Hedef sevk tarihi kontrolü
    const targetShipmentWarnings = this.checkTargetShipmentWarnings(vehicle, activeSettings);
    
    // 3. DMO muayene tarihi kontrolü
    const dmoWarnings = this.checkDmoWarnings(vehicle, activeSettings);
    
    return productionReturnWarnings || targetShipmentWarnings || dmoWarnings;
  }

  private checkProductionReturnWarnings(vehicle: Vehicle, activeSettings: WarningSettings[]): boolean {
    const productionReturnHistory = vehicle.statusHistory.filter(h => h.status === VehicleStatus.RETURNED_TO_PRODUCTION);
    if (productionReturnHistory.length === 0) return false;

    const qualityControlHistory = vehicle.statusHistory.filter(h => h.status === VehicleStatus.QUALITY_CONTROL);
    
    return productionReturnHistory.some(returned => {
      const subsequentQuality = qualityControlHistory.find(q => new Date(q.date) > new Date(returned.date));
      if (!subsequentQuality) {
        const timeSinceReturn = new Date().getTime() - new Date(returned.date).getTime();
        
        // Aktif production_return uyarı ayarlarını kontrol et
        const productionSettings = activeSettings.filter(w => w.type === 'production_return');
        
        for (const setting of productionSettings) {
          let thresholdInMs = 0;
          
          if (setting.unit === 'hours') {
            thresholdInMs = setting.threshold * 60 * 60 * 1000;
          } else if (setting.unit === 'days') {
            thresholdInMs = setting.threshold * 24 * 60 * 60 * 1000;
          } else if (setting.unit === 'minutes') {
            thresholdInMs = setting.threshold * 60 * 1000;
          }
          
          if (timeSinceReturn > thresholdInMs) {
            return true;
          }
        }
        
        // Hiç aktif production ayar yoksa default 2 gün
        if (productionSettings.length === 0) {
          const defaultThreshold = 2 * 24 * 60 * 60 * 1000; // 2 gün
          return timeSinceReturn > defaultThreshold;
        }
      }
      return false;
    });
  }

  private checkTargetShipmentWarnings(vehicle: Vehicle, activeSettings: WarningSettings[]): boolean {
    if (!vehicle.targetShipmentDate) return false;
    
    const targetDate = new Date(vehicle.targetShipmentDate);
    const now = new Date();
    const timeUntilTarget = targetDate.getTime() - now.getTime();
    
    // Hedef tarih geçmişse veya yaklaşıyorsa uyarı ver
    const targetSettings = activeSettings.filter(w => w.type === 'target_shipment');
    
    for (const setting of targetSettings) {
      let thresholdInMs = 0;
      
      if (setting.unit === 'hours') {
        thresholdInMs = setting.threshold * 60 * 60 * 1000;
      } else if (setting.unit === 'days') {
        thresholdInMs = setting.threshold * 24 * 60 * 60 * 1000;
      }
      
      // Eğer kalan süre threshold'dan azsa uyarı ver
      if (timeUntilTarget <= thresholdInMs) {
        return true;
      }
    }
    
    return false;
  }

  private checkDmoWarnings(vehicle: Vehicle, activeSettings: WarningSettings[]): boolean {
    if (!vehicle.dmoDate) return false;
    
    const dmoDate = new Date(vehicle.dmoDate);
    const now = new Date();
    const timeUntilDmo = dmoDate.getTime() - now.getTime();
    
    // DMO tarihi geçmişse veya yaklaşıyorsa uyarı ver
    const dmoSettings = activeSettings.filter(w => w.type === 'dmo_inspection');
    
    for (const setting of dmoSettings) {
      let thresholdInMs = 0;
      
      if (setting.unit === 'hours') {
        thresholdInMs = setting.threshold * 60 * 60 * 1000;
      } else if (setting.unit === 'days') {
        thresholdInMs = setting.threshold * 24 * 60 * 60 * 1000;
      }
      
      // Eğer kalan süre threshold'dan azsa veya geçmişse uyarı ver
      if (timeUntilDmo <= thresholdInMs) {
        return true;
      }
    }
    
    return false;
  }

  private calculateWarningLevel(vehicle: Vehicle, warningSettings: WarningSettings[]): 'none' | 'warning' | 'critical' {
    const activeSettings = warningSettings.filter(w => w.isActive);
    
    // Tüm uyarı türlerinden en yüksek seviyeyi belirle
    const warningLevels: ('none' | 'warning' | 'critical')[] = [
      this.calculateProductionWarningLevel(vehicle, activeSettings),
      this.calculateTargetShipmentWarningLevel(vehicle, activeSettings),
      this.calculateDmoWarningLevel(vehicle, activeSettings)
    ];
    
    // Kritik varsa kritik, yoksa warning varsa warning, yoksa none döndür
    if (warningLevels.includes('critical')) return 'critical';
    if (warningLevels.includes('warning')) return 'warning';
    return 'none';
  }

  private calculateProductionWarningLevel(vehicle: Vehicle, activeSettings: WarningSettings[]): 'none' | 'warning' | 'critical' {
    const productionReturnHistory = vehicle.statusHistory.filter(h => h.status === VehicleStatus.RETURNED_TO_PRODUCTION);
    if (productionReturnHistory.length === 0) return 'none';

    const qualityControlHistory = vehicle.statusHistory.filter(h => h.status === VehicleStatus.QUALITY_CONTROL);
    const productionSettings = activeSettings.filter(w => w.type === 'production_return');
    
    let maxOverdueHours = 0;
    productionReturnHistory.forEach(returned => {
      const subsequentQuality = qualityControlHistory.find(q => new Date(q.date) > new Date(returned.date));
      if (!subsequentQuality) {
        const timeSinceReturn = new Date().getTime() - new Date(returned.date).getTime();
        const hoursSinceReturn = timeSinceReturn / (1000 * 60 * 60);
        
        // En küçük threshold'u bul
        let minThresholdHours = 48; // Default 2 gün = 48 saat
        
        if (productionSettings.length > 0) {
          minThresholdHours = Math.min(...productionSettings.map(setting => {
            if (setting.unit === 'hours') return setting.threshold;
            if (setting.unit === 'days') return setting.threshold * 24;
            if (setting.unit === 'minutes') return setting.threshold / 60;
            return 48;
          }));
        }
        
        const hoursOverdue = hoursSinceReturn - minThresholdHours;
        if (hoursOverdue > maxOverdueHours) {
          maxOverdueHours = hoursOverdue;
        }
      }
    });

    if (maxOverdueHours <= 0) return 'none';
    if (maxOverdueHours <= 24) return 'warning'; // 24 saat içinde warning
    return 'critical'; // 24 saatten fazla critical
  }

  private calculateTargetShipmentWarningLevel(vehicle: Vehicle, activeSettings: WarningSettings[]): 'none' | 'warning' | 'critical' {
    if (!vehicle.targetShipmentDate) return 'none';
    
    const targetDate = new Date(vehicle.targetShipmentDate);
    const now = new Date();
    const timeUntilTarget = targetDate.getTime() - now.getTime();
    const hoursUntilTarget = timeUntilTarget / (1000 * 60 * 60);
    
    const targetSettings = activeSettings.filter(w => w.type === 'target_shipment');
    if (targetSettings.length === 0) return 'none';
    
    // En kısa uyarı süresini bul
    const minWarningHours = Math.min(...targetSettings.map(setting => {
      if (setting.unit === 'hours') return setting.threshold;
      if (setting.unit === 'days') return setting.threshold * 24;
      return 72; // Default 3 gün
    }));
    
    // Hedef tarih geçtiyse kritik
    if (hoursUntilTarget < 0) return 'critical';
    
    // Uyarı süresinden azsa warning
    if (hoursUntilTarget <= minWarningHours) return 'warning';
    
    return 'none';
  }

  private calculateDmoWarningLevel(vehicle: Vehicle, activeSettings: WarningSettings[]): 'none' | 'warning' | 'critical' {
    if (!vehicle.dmoDate) return 'none';
    
    const dmoDate = new Date(vehicle.dmoDate);
    const now = new Date();
    const timeUntilDmo = dmoDate.getTime() - now.getTime();
    const hoursUntilDmo = timeUntilDmo / (1000 * 60 * 60);
    
    const dmoSettings = activeSettings.filter(w => w.type === 'dmo_inspection');
    if (dmoSettings.length === 0) return 'none';
    
    // Kritik ve warning threshold'larını ayır
    const criticalSettings = dmoSettings.filter(s => s.level === 'critical');
    const warningSettings = dmoSettings.filter(s => s.level === 'warning');
    
    // DMO tarihi geçtiyse veya kritik threshold'a ulaştıysa kritik
    if (criticalSettings.length > 0) {
      const criticalHours = Math.max(...criticalSettings.map(setting => {
        if (setting.unit === 'hours') return setting.threshold;
        if (setting.unit === 'days') return setting.threshold * 24;
        return 0;
      }));
      
      if (hoursUntilDmo <= criticalHours) return 'critical';
    }
    
    // Warning threshold'a ulaştıysa warning
    if (warningSettings.length > 0) {
      const warningHours = Math.max(...warningSettings.map(setting => {
        if (setting.unit === 'hours') return setting.threshold;
        if (setting.unit === 'days') return setting.threshold * 24;
        return 168; // Default 7 gün
      }));
      
      if (hoursUntilDmo <= warningHours) return 'warning';
    }
    
    return 'none';
  }

  async deleteVehicle(id: string): Promise<void> {
    const vehicleIndex = this.vehicles.findIndex(v => v._id === id);
    if (vehicleIndex === -1) {
      throw new Error('Araç bulunamadı');
    }

    const vehicle = this.vehicles[vehicleIndex];
    
    // Araçla ilgili tüm eski aktiviteleri temizle
    this.removeVehicleFromRecentActivities(id);
    
    this.vehicles.splice(vehicleIndex, 1);
    
    // Silme aktivitesini ekle (araç henüz bellekte olduğu için gerçek bilgiler kullanılacak)
    this.addRecentActivity(id, vehicle.vehicleName, 'Araç silindi', vehicle.currentStatus);
    this.saveToStorage();
  }

  // STATUS UPDATE METHODS
  async updateVehicleStatus(vehicleId: string, newStatus: VehicleStatus, notes?: string): Promise<Vehicle> {
    const vehicleIndex = this.vehicles.findIndex(v => v._id === vehicleId);
    if (vehicleIndex === -1) {
      throw new Error('Araç bulunamadı');
    }

    const vehicle = this.vehicles[vehicleIndex];
    const now = new Date();

    // Status history ekle
    const statusMessage = this.getStatusChangeMessage(vehicle.currentStatus, newStatus);
    const newStatusRecord: StatusHistory = {
      id: Date.now().toString(),
      status: newStatus,
      date: now,
      performedBy: 'Sistem Kullanıcısı',
      performedById: 'system',
      notes: notes || statusMessage,
      reason: ''
    };

    const updatedVehicle = {
      ...vehicle,
      currentStatus: newStatus,
      statusHistory: [...vehicle.statusHistory, newStatusRecord],
      updatedAt: now,
      productionReturnDate: newStatus === VehicleStatus.RETURNED_TO_PRODUCTION ? now : vehicle.productionReturnDate,
      qualityStartDate: newStatus === VehicleStatus.QUALITY_CONTROL ? now : vehicle.qualityStartDate,
      serviceStartDate: newStatus === VehicleStatus.SERVICE ? now : vehicle.serviceStartDate,
      serviceEndDate: (newStatus === VehicleStatus.QUALITY_CONTROL || newStatus === VehicleStatus.READY_FOR_SHIPMENT) && vehicle.currentStatus === VehicleStatus.SERVICE ? now : vehicle.serviceEndDate
    };

    // Overdue kontrolü
    this.updateOverdueStatus(updatedVehicle);

    this.vehicles[vehicleIndex] = updatedVehicle;
    this.addRecentActivity(vehicleId, vehicle.vehicleName, `Durum değişti: ${getVehicleStatusLabel(newStatus)}`, newStatus);
    this.saveToStorage();

    return updatedVehicle;
  }

  private updateOverdueStatus(vehicle: Vehicle): void {
    if (vehicle.productionReturnDate && vehicle.currentStatus === VehicleStatus.RETURNED_TO_PRODUCTION) {
      const daysSinceReturn = Math.floor(
        (new Date().getTime() - new Date(vehicle.productionReturnDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      vehicle.isOverdue = daysSinceReturn > 2;
      vehicle.warningLevel = daysSinceReturn > 5 ? 'critical' : daysSinceReturn > 2 ? 'warning' : 'none';
      vehicle.overdueDate = vehicle.isOverdue ? vehicle.productionReturnDate : undefined;
    } else {
      vehicle.isOverdue = false;
      vehicle.warningLevel = 'none';
      vehicle.overdueDate = undefined;
    }
  }

  private getStatusChangeMessage(oldStatus: VehicleStatus, newStatus: VehicleStatus): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR');
    const timeStr = now.toLocaleTimeString('tr-TR');
    
    const statusTexts = {
      [VehicleStatus.PRODUCTION]: 'üretime',
      [VehicleStatus.QUALITY_CONTROL]: 'kalite kontrole',
      [VehicleStatus.RETURNED_TO_PRODUCTION]: 'üretime geri',
      [VehicleStatus.SERVICE]: 'servise',  // Servis durumu eklendi
      [VehicleStatus.READY_FOR_SHIPMENT]: 'sevkiyata hazır',
      [VehicleStatus.SHIPPED]: 'sevk edildi'
    };

    return `${dateStr} ${timeStr} tarihinde ${statusTexts[oldStatus] || 'bilinmeyen'} durumundan ${statusTexts[newStatus] || 'bilinmeyen'} durumuna geçirildi`;
  }

  // DEFECT METHODS
  async addDefect(vehicleId: string, defectData: CreateDefectData): Promise<Defect> {
    const vehicleIndex = this.vehicles.findIndex(v => v._id === vehicleId);
    if (vehicleIndex === -1) {
      throw new Error('Araç bulunamadı');
    }

    const newDefect: Defect = {
      _id: Date.now().toString(),
      category: defectData.category,
      subcategory: defectData.subcategory,
      description: defectData.description,
      department: defectData.department,
      responsiblePerson: defectData.responsiblePerson,
      priority: defectData.priority,
      status: DefectStatus.OPEN,
      notes: defectData.notes,
      reportedDate: new Date(),
      estimatedResolutionDate: defectData.estimatedResolutionDate,
      reportedBy: defectData.reportedBy
    };

    this.vehicles[vehicleIndex].defects.push(newDefect);
    this.vehicles[vehicleIndex].updatedAt = new Date();
    
    this.addRecentActivity(vehicleId, this.vehicles[vehicleIndex].vehicleName, 'Yeni eksiklik eklendi', this.vehicles[vehicleIndex].currentStatus);
    this.saveToStorage();

    return newDefect;
  }

  async updateDefect(vehicleId: string, defectId: string, updates: Partial<Defect>): Promise<Defect> {
    const vehicleIndex = this.vehicles.findIndex(v => v._id === vehicleId);
    if (vehicleIndex === -1) {
      throw new Error('Araç bulunamadı');
    }

    const defectIndex = this.vehicles[vehicleIndex].defects.findIndex(d => d._id === defectId);
    if (defectIndex === -1) {
      throw new Error('Eksiklik bulunamadı');
    }

    const updatedDefect = {
      ...this.vehicles[vehicleIndex].defects[defectIndex],
      ...updates
    };

    if (updates.status === DefectStatus.RESOLVED || updates.status === DefectStatus.CLOSED) {
      updatedDefect.resolvedDate = new Date();
    }

    this.vehicles[vehicleIndex].defects[defectIndex] = updatedDefect;
    this.vehicles[vehicleIndex].updatedAt = new Date();
    
    this.addRecentActivity(vehicleId, this.vehicles[vehicleIndex].vehicleName, 'Eksiklik güncellendi', this.vehicles[vehicleIndex].currentStatus);
    this.saveToStorage();

    return updatedDefect;
  }

  // WARNING METHODS
  async getWarnings(): Promise<Warning[]> {
    const warnings: Warning[] = [];
    const now = new Date();

    this.vehicles.forEach(vehicle => {
      if (vehicle.isOverdue && vehicle.productionReturnDate) {
        const daysPastDue = Math.floor(
          (now.getTime() - new Date(vehicle.productionReturnDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        warnings.push({
          id: `warning-${vehicle._id}`,
          vehicleId: vehicle._id,
          message: `Araç ${daysPastDue} gündür üretimde bekliyor`,
          level: daysPastDue > 5 ? 'critical' : 'warning',
          isAcknowledged: false,
          createdAt: vehicle.productionReturnDate
        });
      }
    });

    return warnings;
  }

  async acknowledgeWarning(warningId: string): Promise<void> {
    // Warning acknowledgment localStorage'da tutulabilir
    const acknowledgedWarnings = JSON.parse(localStorage.getItem('acknowledgedWarnings') || '[]');
    if (!acknowledgedWarnings.includes(warningId)) {
      acknowledgedWarnings.push(warningId);
      localStorage.setItem('acknowledgedWarnings', JSON.stringify(acknowledgedWarnings));
    }
  }

  // WARNING SETTINGS METHODS
  async getWarningSettings(): Promise<WarningSettings[]> {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.WARNING_SETTINGS);
      return settings ? JSON.parse(settings) : DEFAULT_WARNING_SETTINGS;
    } catch (error) {
      return DEFAULT_WARNING_SETTINGS;
    }
  }

  async updateWarningSettings(settings: WarningSettings[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.WARNING_SETTINGS, JSON.stringify(settings));
    // Uyarı ayarları değiştiğinde tüm araç uyarılarını yeniden hesapla
    await this.recalculateAllWarnings();
  }

  // ANALYTICS METHODS
  getTopDefectTypes(limit: number = 5): Array<{ category: string; subcategory: string; count: number }> {
    const defectCounts: Record<string, number> = {};
    
    this.vehicles.forEach(vehicle => {
      vehicle.defects.forEach(defect => {
        const key = `${defect.category}|${defect.subcategory}`;
        defectCounts[key] = (defectCounts[key] || 0) + 1;
      });
    });

    return Object.entries(defectCounts)
      .map(([key, count]) => {
        const [category, subcategory] = key.split('|');
        return { category, subcategory, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getTopReturnReasons(limit: number = 5): Array<{ category: string; subcategory: string; count: number }> {
    // Üretime geri gönderilme sebeplerini analiz et
    const returnCounts: Record<string, number> = {};
    
    this.vehicles.forEach(vehicle => {
      // Bu aracın üretime geri gönderilme geçmişi
      const returnToProductionHistory = vehicle.statusHistory.filter(h => h.status === VehicleStatus.RETURNED_TO_PRODUCTION);
      
      returnToProductionHistory.forEach(returnHistory => {
        // Bu geri gönderme sırasında aktif olan eksiklikleri bul
        // Geri gönderme tarihinden önce rapor edilmiş eksiklikleri ara
        const activeDefectsAtReturn = vehicle.defects.filter(defect => {
          const defectDate = new Date(defect.reportedDate);
          const returnDate = new Date(returnHistory.date);
          
          // Eksiklik, geri gönderme tarihinden önce rapor edilmişse ve henüz kapatılmamışsa
          return defectDate <= returnDate && 
                 (defect.status === DefectStatus.OPEN || defect.status === DefectStatus.IN_PROGRESS);
        });
        
        // Bu aktif eksiklikleri say
        activeDefectsAtReturn.forEach(defect => {
          const key = `${defect.category}|${defect.subcategory}`;
          returnCounts[key] = (returnCounts[key] || 0) + 1;
        });
      });
    });

    return Object.entries(returnCounts)
      .map(([key, count]) => {
        const [category, subcategory] = key.split('|');
        return { category, subcategory, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getAverageQualityTime(): number {
    const qualityVehicles = this.vehicles.filter(v => 
      v.statusHistory.some(h => h.status === VehicleStatus.QUALITY_CONTROL)
    );

    if (qualityVehicles.length === 0) return 0;

    const totalHours = qualityVehicles.reduce((total, vehicle) => {
      const qualityEntries = vehicle.statusHistory.filter(h => h.status === VehicleStatus.QUALITY_CONTROL);
      const qualityExits = vehicle.statusHistory.filter(h => 
        h.status === VehicleStatus.RETURNED_TO_PRODUCTION || 
        h.status === VehicleStatus.READY_FOR_SHIPMENT
      );

      let vehicleQualityTime = 0;
      qualityEntries.forEach(entry => {
        const exit = qualityExits.find(e => new Date(e.date) > new Date(entry.date));
        if (exit) {
          vehicleQualityTime += (new Date(exit.date).getTime() - new Date(entry.date).getTime()) / (1000 * 60 * 60);
        } else if (vehicle.currentStatus === VehicleStatus.QUALITY_CONTROL) {
          vehicleQualityTime += (new Date().getTime() - new Date(entry.date).getTime()) / (1000 * 60 * 60);
        }
      });

      return total + vehicleQualityTime;
    }, 0);

    return Math.round(totalHours / qualityVehicles.length);
  }

  getAverageProductionTime(): number {
    const productionVehicles = this.vehicles.filter(v => 
      v.statusHistory.some(h => h.status === VehicleStatus.RETURNED_TO_PRODUCTION)
    );

    if (productionVehicles.length === 0) return 0;

    const totalHours = productionVehicles.reduce((total, vehicle) => {
      const productionEntries = vehicle.statusHistory.filter(h => 
        h.status === VehicleStatus.PRODUCTION || h.status === VehicleStatus.RETURNED_TO_PRODUCTION
      );
      const productionExits = vehicle.statusHistory.filter(h => h.status === VehicleStatus.QUALITY_CONTROL);

      let vehicleProductionTime = 0;
      productionEntries.forEach(entry => {
        const exit = productionExits.find(e => new Date(e.date) > new Date(entry.date));
        if (exit) {
          vehicleProductionTime += (new Date(exit.date).getTime() - new Date(entry.date).getTime()) / (1000 * 60 * 60);
        } else if (vehicle.currentStatus === VehicleStatus.PRODUCTION || vehicle.currentStatus === VehicleStatus.RETURNED_TO_PRODUCTION) {
          vehicleProductionTime += (new Date().getTime() - new Date(entry.date).getTime()) / (1000 * 60 * 60);
        }
      });

      return total + vehicleProductionTime;
    }, 0);

    return Math.round(totalHours / productionVehicles.length);
  }

  getRecentActivities(limit: number = 10): Array<{ 
    id: string; 
    vehicleId: string;
    vehicleName: string;
    serialNumber: string;
    customerName: string;
    message: string; 
    user: string; 
    time: Date; 
    status?: VehicleStatus 
  }> {
    try {
      const activities = localStorage.getItem(STORAGE_KEYS.RECENT_ACTIVITIES);
      const allActivities = activities ? JSON.parse(activities) : [];
      
      // Sadece mevcut araçların aktivitelerini filtrele
      const validActivities = allActivities.filter((activity: any) => {
        // Geçerli tarih kontrolü
        if (!activity.time || isNaN(new Date(activity.time).getTime())) {
          return false;
        }
        
        // Eğer araç 'silindi' mesajı varsa göster, yoksa araç mevcut mu kontrol et
        if (activity.message === 'Araç silindi') {
          return true;
        }
        
        // Araç hala mevcut mu kontrol et
        const vehicleExists = this.vehicles.some(v => v._id === activity.vehicleId);
        if (!vehicleExists) {
          return false;
        }
        
        // Mevcut araç bilgilerini güncelle
        const currentVehicle = this.vehicles.find(v => v._id === activity.vehicleId);
        if (currentVehicle) {
          activity.vehicleName = currentVehicle.vehicleName;
          activity.serialNumber = currentVehicle.serialNumber;
          activity.customerName = currentVehicle.customerName;
        }
        
        return true;
      });
      
      return validActivities
        .sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, limit)
        .map((activity: any) => ({
          ...activity,
          time: new Date(activity.time)
        }));
    } catch (error) {
      console.error('Recent activities yüklenirken hata:', error);
      return [];
    }
  }

  // Tüm araçların uyarı durumlarını yeniden hesapla
  private async recalculateAllWarnings(): Promise<void> {
    try {
      const warningSettings = await this.getWarningSettings();
      let hasChanges = false;
      
      this.vehicles.forEach(vehicle => {
        const wasOverdue = vehicle.isOverdue;
        const oldWarningLevel = vehicle.warningLevel;
        
        const isOverdue = this.checkOverdueStatus(vehicle, warningSettings);
        const warningLevel = this.calculateWarningLevel(vehicle, warningSettings);
        
        if (wasOverdue !== isOverdue || oldWarningLevel !== warningLevel) {
          vehicle.isOverdue = isOverdue;
          vehicle.warningLevel = warningLevel;
          vehicle.updatedAt = new Date();
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        this.saveToStorage();
      }
    } catch (error) {
      console.error('Uyarı durumları güncellenirken hata:', error);
    }
  }

  private addRecentActivity(vehicleId: string, vehicleName: string, action: string, status?: VehicleStatus): void {
    try {
      const vehicle = this.vehicles.find(v => v._id === vehicleId);
      
      const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_ACTIVITIES) || '[]');
      const newActivity: RecentActivity = {
        id: Date.now().toString(),
        vehicleId,
        vehicleName: vehicle ? vehicle.vehicleName : vehicleName,
        serialNumber: vehicle ? vehicle.serialNumber : 'N/A',
        customerName: vehicle ? vehicle.customerName : 'Bilinmiyor',
        message: action,
        user: 'Sistem Kullanıcısı',
        time: new Date(),
        status
      };
      
      activities.unshift(newActivity);
      
      // Sadece son 50 aktiviteyi sakla ve geçersiz tarihli olanları temizle
      const validActivities = activities
        .filter((activity: any) => activity.time && !isNaN(new Date(activity.time).getTime()))
        .slice(0, 50);
      
      localStorage.setItem(STORAGE_KEYS.RECENT_ACTIVITIES, JSON.stringify(validActivities));
    } catch (error) {
      console.error('Recent activity kaydedilemedi:', error);
    }
  }

  private removeVehicleFromRecentActivities(vehicleId: string): void {
    try {
      const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_ACTIVITIES) || '[]');
      const filteredActivities = activities.filter((activity: any) => activity.vehicleId !== vehicleId);
      localStorage.setItem(STORAGE_KEYS.RECENT_ACTIVITIES, JSON.stringify(filteredActivities));
    } catch (error) {
      console.error('Araç aktiviteleri temizlenirken hata:', error);
    }
  }

  // Eski ve geçersiz aktiviteleri temizle
  private clearOldActivities(): void {
    try {
      const activities = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_ACTIVITIES) || '[]');
      const validActivities = activities.filter((activity: any) => {
        // Geçerli tarih kontrolü
        if (!activity.time || isNaN(new Date(activity.time).getTime())) {
          return false;
        }
        
        // Eğer araç silindi mesajı değilse, araç mevcut mu kontrol et
        if (activity.message !== 'Araç silindi') {
          const vehicleExists = this.vehicles.some(v => v._id === activity.vehicleId);
          return vehicleExists;
        }
        
        return true;
      });
      
      if (validActivities.length !== activities.length) {
        localStorage.setItem(STORAGE_KEYS.RECENT_ACTIVITIES, JSON.stringify(validActivities));
        console.log('Geçersiz aktiviteler temizlendi');
      }
    } catch (error) {
      console.error('Aktivite temizleme hatası:', error);
      // Tamamen bozuksa sil
      localStorage.removeItem(STORAGE_KEYS.RECENT_ACTIVITIES);
    }
  }

  // Tüm eski aktiviteleri temizle ve sıfırla
  public resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.VEHICLES);
    localStorage.removeItem(STORAGE_KEYS.WARNING_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.RECENT_ACTIVITIES);
    this.vehicles = [];
    console.warn('Tüm uygulama verileri sıfırlandı!');
    this.loadFromStorage(); // Verileri yeniden yükle
  }
}

// EXPORT SINGLETON INSTANCE
export const vehicleQualityControlService = new VehicleQualityControlService(); 