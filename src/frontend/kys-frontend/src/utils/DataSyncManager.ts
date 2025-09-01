// ✅ MERKEZI VERİ YÖNETİM SİSTEMİ - Tüm Modüller İçin Tek Kaynak
// Bu sistem tüm veri tutarsızlığını çözer ve gerçek zamanlı senkronizasyon sağlar

// localStorage ve DÖF modülü entegrasyonu için

export interface MasterDataHub {
  // DÖF ve 8D Verileri
  dof: {
    total: number;
    open: number;
    closed: number;
    overdue: number;
    closureRate: number;
    averageClosureTime: number;
    records: DOFRecord[];
  };
  
  // Tedarikçi Verileri
  suppliers: {
    total: number;
    approved: number;
    alternative: number;
    evaluation: number;
    avgRating: number;
    rejectionRate: number;
    records: SupplierRecord[];
  };
  
  // Kalite Maliyeti
  qualityCost: {
    totalCost: number;
    reworkCost: number;
    scrapCost: number;
    wasteCost: number;
    costRatio: number;
    records: QualityCostRecord[];
  };
  
  // Araç Kalitesi
  vehicleQuality: {
    totalVehicles: number;
    defectiveVehicles: number;
    defectRate: number;
    inspectionCompliance: number;
    records: VehicleRecord[];
  };
  
  // Denetim Verileri
  audits: {
    total: number;
    completed: number;
    pending: number;
    complianceRate: number;
    avgScore: number;
    records: AuditRecord[];
  };
  
  // Performans Metrikleri
  performance: {
    lastUpdate: string;
    dataVersion: number;
    syncStatus: 'synced' | 'syncing' | 'error';
  };
}

export interface DOFRecord {
  id: string;
  dofNumber: string;
  title: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  status: 'open' | 'in_progress' | 'awaiting_approval' | 'overdue' | 'closed' | 'rejected';
  createdDate: string;
  openingDate: string; // ✅ Açılış tarihi eklendi
  closedDate?: string;
  dueDate: string;
  department: string;
  responsible: string;
  supplierId?: string;
  category: 'quality' | 'production' | 'delivery' | 'process';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'corrective' | 'preventive' | '8d' | 'improvement' | 'mdi';
  // ✅ KÖK NEDEN ANALİZİ VE 8D VERİLERİ
  rootCause?: string;
  rejectionReason?: string;
  d8Steps?: {
    d1_team?: string;
    d2_problem?: string;
    d3_containment?: string;
    d4_rootCause?: string;
    d5_permanentAction?: string;
    d6_implementation?: string;
    d7_prevention?: string;
    d8_recognition?: string;
  };
  d8Progress?: number;
  actions?: any[];
  attachments?: any[];
  history?: any[];
  metadata?: any;
}

export interface SupplierRecord {
  id: string;
  name: string;
  code: string;
  status: 'onaylı' | 'alternatif' | 'değerlendirmede' | 'askıda';
  rating: number;
  lastAuditDate: string;
  nextAuditDate: string;
  activeDOFs: number;
  riskLevel: 'düşük' | 'orta' | 'yüksek' | 'kritik';
  qualityScore: number;
  deliveryPerformance: number;
  email: string;
  phone: string;
}

export interface QualityCostRecord {
  id: string;
  date: string;
  category: 'rework' | 'scrap' | 'waste' | 'warranty' | 'complaint';
  cost: number;
  description: string;
  department: string;
  relatedDOF?: string;
}

export interface VehicleRecord {
  id: string;
  vehicleId: string;
  date: string;
  inspectionResult: 'pass' | 'fail' | 'conditional';
  defects: string[];
  inspector: string;
  notes?: string;
}

export interface AuditRecord {
  id: string;
  auditType: 'internal' | 'external' | 'supplier' | 'process';
  date: string;
  auditor: string;
  department: string;
  score: number;
  status: 'completed' | 'pending' | 'in_progress';
  findings: string[];
  nonConformities: number;
}

// ✅ MERKEZI VERİ DEPOSU - Singleton Pattern
class DataSyncManager {
  private static instance: DataSyncManager;
  private masterData: MasterDataHub;
  private listeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.masterData = this.initializeMasterData();
    this.loadRealDOFData();
    this.loadRealQualityCostData();
    this.setupAutoSync();
  }

  public static getInstance(): DataSyncManager {
    if (!DataSyncManager.instance) {
      DataSyncManager.instance = new DataSyncManager();
    }
    return DataSyncManager.instance;
  }

  // ✅ ANA VERİ BAŞLATMA
  private initializeMasterData(): MasterDataHub {
    return {
      dof: {
        total: 0,
        open: 0,
        closed: 0,
        overdue: 0,
        closureRate: 0,
        averageClosureTime: 0,
        records: []
      },
      suppliers: {
        total: 24,
        approved: 18,
        alternative: 5,
        evaluation: 1,
        avgRating: 4.2,
        rejectionRate: 5.8,
        records: []
      },
      qualityCost: {
        totalCost: 127500,
        reworkCost: 34200,
        scrapCost: 28900,
        wasteCost: 15600,
        costRatio: 3.2,
        records: []
      },
      vehicleQuality: {
        totalVehicles: 156,
        defectiveVehicles: 12,
        defectRate: 7.7,
        inspectionCompliance: 92.3,
        records: []
      },
      audits: {
        total: 28,
        completed: 24,
        pending: 4,
        complianceRate: 85.7,
        avgScore: 88.5,
        records: []
      },
      performance: {
        lastUpdate: new Date().toISOString(),
        dataVersion: 1,
        syncStatus: 'synced'
      }
    };
  }

  // ✅ GERÇEK KALİTE MALİYET VERİLERİNİ LOCALSTORAGE'DAN ÇEK
  private loadRealQualityCostData(): void {
    try {
      console.log('💰 DataSyncManager - Kalitesizlik maliyeti modülünden gerçek veriler yükleniyor...');
      
      // localStorage'dan kalitesizlik maliyet verilerini çek
      const storedCostRecords = localStorage.getItem('kys-cost-management-data');
      const localStorageCostRecords = storedCostRecords ? JSON.parse(storedCostRecords) : [];
      
      console.log('📊 localStorage Kalitesizlik Maliyet Kayıtları:', {
        count: localStorageCostRecords.length,
        firstRecord: localStorageCostRecords[0] || 'Hiç kayıt yok'
      });

      if (localStorageCostRecords.length > 0) {
        // localStorage verilerini QualityCostRecord formatına çevir
        const convertedRecords: QualityCostRecord[] = localStorageCostRecords.map((record: any) => ({
          id: record.id?.toString() || `COST-${Date.now()}`,
          date: record.tarih || new Date().toISOString().split('T')[0],
          category: this.mapCostCategory(record.maliyetTuru),
          cost: record.maliyet || 0,
          description: record.parcaKodu ? `Parça: ${record.parcaKodu}` : 'Açıklama Yok',
          department: record.birim || 'Bilinmiyor',
          relatedDOF: record.relatedDOF || undefined
        }));

        // Maliyet hesaplamaları
        let totalCost = 0;
        let reworkCost = 0;
        let scrapCost = 0;
        let wasteCost = 0;

        convertedRecords.forEach(record => {
          totalCost += record.cost;
          
          switch (record.category) {
            case 'rework':
              reworkCost += record.cost;
              break;
            case 'scrap':
              scrapCost += record.cost;
              break;
            case 'waste':
              wasteCost += record.cost;
              break;
          }
        });

        // Master data güncelle
        this.masterData.qualityCost = {
          totalCost,
          reworkCost,
          scrapCost,
          wasteCost,
          costRatio: totalCost > 0 ? Math.round((totalCost / 1000000) * 100) / 100 : 0,
          records: convertedRecords
        };

        console.log('✅ Kalitesizlik maliyet verileri güncellendi:', {
          totalCost: totalCost.toLocaleString('tr-TR'),
          reworkCost: reworkCost.toLocaleString('tr-TR'),
          scrapCost: scrapCost.toLocaleString('tr-TR'),
          wasteCost: wasteCost.toLocaleString('tr-TR'),
          recordCount: convertedRecords.length
        });
      } else {
        console.log('⚠️ Kalitesizlik maliyet verisi bulunamadı, varsayılan değerler kullanılıyor');
        
        // Varsayılan değerler
        this.masterData.qualityCost = {
          totalCost: 0,
          reworkCost: 0,
          scrapCost: 0,
          wasteCost: 0,
          costRatio: 0,
          records: []
        };
      }

      this.masterData.performance.lastUpdate = new Date().toISOString();
      
    } catch (error) {
      console.error('❌ Kalitesizlik maliyet verileri yüklenemedi:', error);
      
      // Hata durumunda varsayılan değerler
      this.masterData.qualityCost = {
        totalCost: 0,
        reworkCost: 0,
        scrapCost: 0,
        wasteCost: 0,
        costRatio: 0,
        records: []
      };
    }
  }

  private mapCostCategory(maliyetTuru: string): 'rework' | 'scrap' | 'waste' | 'warranty' | 'complaint' {
    const mt = (maliyetTuru || '').toLowerCase();
    
    if (mt.includes('yeniden_islem') || mt.includes('rework')) return 'rework';
    if (mt.includes('hurda') || mt.includes('scrap')) return 'scrap';
    if (mt.includes('fire') || mt.includes('waste')) return 'waste';
    if (mt.includes('garanti') || mt.includes('warranty')) return 'warranty';
    if (mt.includes('sikayet') || mt.includes('complaint')) return 'complaint';
    
    // Varsayılan
    return 'rework';
  }

  // ✅ GERÇEK DÖF VERİLERİNİ LOCALSTORAGE'DAN ÇEK
  private loadRealDOFData(): void {
    try {
      console.log('🔄 DataSyncManager - DÖF modülünden gerçek veriler yükleniyor...');
      
      // localStorage'dan dofRecords çek
      const storedDOFRecords = localStorage.getItem('dofRecords');
      const localStorageDOFRecords = storedDOFRecords ? JSON.parse(storedDOFRecords) : [];
      
      console.log('📊 localStorage DÖF Kayıtları:', {
        count: localStorageDOFRecords.length,
        firstRecord: localStorageDOFRecords[0] || 'Hiç kayıt yok'
      });

      if (localStorageDOFRecords.length > 0) {
        // localStorage verilerini DOFRecord formatına çevir
        const convertedRecords: DOFRecord[] = localStorageDOFRecords.map((record: any) => ({
          id: record.id || record.dofNumber || `DOF-${Date.now()}`,
          dofNumber: record.dofNumber || record.id,
          title: record.title || 'Başlık Yok',
          description: record.description || 'Açıklama Yok',
          severity: this.mapSeverity(record.severity || record.priority),
          status: this.mapStatus(record.status),
          createdDate: record.createdDate || record.date || new Date().toISOString().split('T')[0],
          openingDate: record.openingDate || record.createdDate || record.date || new Date().toISOString().split('T')[0], // ✅ Açılış tarihi eklendi
          closedDate: record.closedDate,
          dueDate: record.dueDate || this.calculateDueDate(record.createdDate || new Date().toISOString().split('T')[0]),
          department: record.department || 'Bilinmiyor',
          responsible: record.responsible || record.assignedTo || 'Atanmamış',
          supplierId: record.supplierId,
          category: this.mapCategory(record.category),
          priority: this.mapPriority(record.priority),
          type: this.mapType(record.type),
          // ✅ KÖK NEDEN ANALİZİ VE TÜR BİLGİLERİNİ KORU
          rootCause: record.rootCause || '',
          rejectionReason: record.rejectionReason || '',
          d8Steps: record.d8Steps || undefined,
          d8Progress: record.d8Progress || 0,
          actions: record.actions || [],
          attachments: record.attachments || [],
          history: record.history || [],
          metadata: record.metadata || undefined
        }));

        // Tarih bazlı hesaplamalar
        const today = new Date();
        const closed = convertedRecords.filter(r => r.status === 'closed').length;
        const open = convertedRecords.filter(r => r.status !== 'closed').length;
        const total = convertedRecords.length;
        
        // Gecikmiş DÖF'leri hesapla
        const overdue = convertedRecords.filter(r => {
          if (r.status === 'closed') return false;
          const dueDate = new Date(r.dueDate);
          return dueDate < today;
        }).length;
        
        // Kapanma oranı
        const closureRate = total > 0 ? (closed / total) * 100 : 0;
        
        // Ortalama kapanma süresi
        const closedRecords = convertedRecords.filter(r => r.status === 'closed' && r.closedDate);
        let averageClosureTime = 0;
        if (closedRecords.length > 0) {
          const totalDays = closedRecords.reduce((sum, record) => {
            // ✅ DÜZELTME: Açılış tarihi kullan (createdDate değil!)
            const opened = new Date(record.openingDate || record.createdDate);
            const closed = new Date(record.closedDate!);
            const diffTime = Math.abs(closed.getTime() - opened.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return sum + diffDays;
          }, 0);
          averageClosureTime = Math.round((totalDays / closedRecords.length) * 10) / 10;
        }

        // MasterData'yı güncelle
        this.masterData.dof = {
          total,
          open,
          closed,
          overdue,
          closureRate: Math.round(closureRate * 10) / 10,
          averageClosureTime,
          records: convertedRecords
        };

        console.log('✅ localStorage DÖF Verileri Dashboard\'a Güncellendi:', {
          total: this.masterData.dof.total,
          open: this.masterData.dof.open,
          closed: this.masterData.dof.closed,
          overdue: this.masterData.dof.overdue,
          closureRate: this.masterData.dof.closureRate,
          recordSample: convertedRecords.slice(0, 2).map(r => ({ 
            id: r.id, 
            status: r.status, 
            type: r.type,
            // ✅ TÜR VE KÖK NEDEN KONTROL
            hasRootCause: !!r.rootCause,
            rootCauseLength: r.rootCause?.length || 0,
            has8DSteps: !!r.d8Steps,
            d8Progress: r.d8Progress || 0
          }))
        });
      } else {
        console.log('📭 localStorage\'de DÖF kaydı bulunamadı');
        // Hiç kayıt yoksa boş data
        this.masterData.dof = {
          total: 0,
          open: 0,
          closed: 0,
          overdue: 0,
          closureRate: 0,
          averageClosureTime: 0,
          records: []
        };
      }

    } catch (error) {
      console.error('❌ localStorage\'den DÖF verileri yüklenirken hata:', error);
      // Fallback - boş data
      this.masterData.dof = {
        total: 0,
        open: 0,
        closed: 0,
        overdue: 0,
        closureRate: 0,
        averageClosureTime: 0,
        records: []
      };
    }
  }

  // ✅ MAPPING FONKSİYONLARI
  private mapSeverity(severity: string): 'minor' | 'major' | 'critical' {
    const s = (severity || '').toLowerCase();
    if (s.includes('kritik') || s.includes('critical') || s.includes('yüksek')) return 'critical';
    if (s.includes('major') || s.includes('büyük') || s.includes('orta')) return 'major';
    return 'minor';
  }

  private mapStatus(status: string): 'open' | 'in_progress' | 'awaiting_approval' | 'overdue' | 'closed' | 'rejected' {
    const s = (status || '').toLowerCase();
    if (s.includes('kapalı') || s.includes('tamamland') || s.includes('closed') || s.includes('completed')) return 'closed';
    if (s.includes('onay') || s.includes('approval') || s.includes('awaiting')) return 'awaiting_approval';
    if (s.includes('gecik') || s.includes('overdue') || s.includes('delay')) return 'overdue';
    if (s.includes('işlem') || s.includes('progress') || s.includes('çözüm') || s.includes('in_progress')) return 'in_progress';
    if (s.includes('ret') || s.includes('reject') || s.includes('red')) return 'rejected';
    return 'open'; // Default open
  }

  private mapCategory(category: string): 'quality' | 'production' | 'delivery' | 'process' {
    const c = (category || '').toLowerCase();
    if (c.includes('kalite') || c.includes('quality')) return 'quality';
    if (c.includes('üretim') || c.includes('production')) return 'production';
    if (c.includes('teslimat') || c.includes('delivery')) return 'delivery';
    return 'process';
  }

  private mapPriority(priority: string): 'low' | 'medium' | 'high' | 'critical' {
    const p = (priority || '').toLowerCase();
    if (p.includes('kritik') || p.includes('critical')) return 'critical';
    if (p.includes('yüksek') || p.includes('high')) return 'high';
    if (p.includes('orta') || p.includes('medium')) return 'medium';
    return 'low';
  }

  private mapType(type: string): 'corrective' | 'preventive' | '8d' | 'improvement' | 'mdi' {
    const t = (type || '').toLowerCase();
    
    // ✅ DÖF modülü type değerlerini AYNEN KORU - Mapping yapmadan direkt dön
    if (t === '8d') return '8d';
    if (t === 'corrective' || t.includes('düzeltici')) return 'corrective';
    if (t === 'preventive' || t.includes('önleyici')) return 'preventive';
    if (t === 'improvement' || t.includes('iyileştirme')) return 'improvement';
    if (t === 'mdi' || t.includes('mühendislik') || t.includes('değişiklik')) return 'mdi';
    
    // Fallback - varsayılan corrective
    return 'corrective';
  }

  private calculateDueDate(createdDate: string): string {
    const created = new Date(createdDate);
    created.setDate(created.getDate() + 30); // 30 gün sonra
    return created.toISOString().split('T')[0];
  }

  // ✅ OTOMATİK SENCRONİZASYON KURULUM - Optimize edildi
  private setupAutoSync(): void {
    // ✅ İLK YÜKLEME: Uygulama başladığında bir kez yükle
    this.loadRealDOFData();
    this.loadRealQualityCostData();
    
    // ✅ OPTIMIZED: Sadece gerekli olduğunda sync yap (5 dakikada bir)
    const syncInterval = setInterval(() => {
      console.log('🔄 Periyodik veri senkronizasyonu...');
      this.loadRealDOFData();
      this.loadRealQualityCostData();
      this.notifyListeners('dof');
      this.notifyListeners('qualityCost');
    }, 300000); // 5 dakika (300000ms) - Çok daha az yük
    
    // ✅ Cleanup için interval'i sakla
    (globalThis as any).dataSyncInterval = syncInterval;
    
    console.log('🔄 DataSyncManager - Optimize edilmiş senkronizasyon başlatıldı (5 dakika)');
  }

  // ✅ VERİ ALMA METODLARİ - Cache ile optimize edildi
  private lastDataFetch = 0;
  private dataCache: any = null;
  
  public getDOFData() {
    const now = Date.now();
    // ✅ 60 saniye cache - Çok daha az yük, aynı veri sürekli çekilmesin
    if (this.dataCache && (now - this.lastDataFetch < 60000)) {
      return this.dataCache;
    }
    
    // localStorage'dan güncel verileri al
    this.loadRealDOFData();
    this.dataCache = this.masterData.dof;
    this.lastDataFetch = now;
    
    return this.masterData.dof;
  }

  public getSupplierData() {
    return this.masterData.suppliers;
  }

  public getQualityCostData() {
    // ✅ GERÇEK KALİTE MALİYET VERİLERİNİ LOCALSTORAGE'DAN ÇEK
    this.loadRealQualityCostData();
    return this.masterData.qualityCost;
  }

  public getVehicleQualityData() {
    return this.masterData.vehicleQuality;
  }

  public getAuditData() {
    return this.masterData.audits;
  }

  public getAllData(): MasterDataHub {
    return { ...this.masterData };
  }

  // ✅ VERİ GÜNCELLEME METODLARİ
  public updateDOFData(data: Partial<typeof this.masterData.dof>): void {
    this.masterData.dof = { ...this.masterData.dof, ...data };
    this.masterData.performance.dataVersion++;
    this.notifyListeners('dof');
  }

  public updateSupplierData(data: Partial<typeof this.masterData.suppliers>): void {
    this.masterData.suppliers = { ...this.masterData.suppliers, ...data };
    this.masterData.performance.dataVersion++;
    this.notifyListeners('suppliers');
  }

  // ✅ MANUEL GÜNCELLEME
  public forceUpdateFromLocalStorage(): void {
    console.log('🔄 Manuel localStorage güncelleme başlatıldı...');
    
    // Cache'i temizle
    this.dataCache = null;
    this.lastDataFetch = 0;
    
    // Yeni verileri zorla yükle
    this.loadRealDOFData();
    this.loadRealQualityCostData();
    console.log('✅ DÖF ve kalitesizlik maliyet verileri korunarak güncellendi');
    
    this.notifyListeners('all');
  }

  // ✅ CACHE TEMİZLEME
  public clearCache(): void {
    console.log('🧹 DataSyncManager cache temizleniyor...');
    this.dataCache = null;
    this.lastDataFetch = 0;
  }

  // ✅ OLAY DİNLEYİCİLERİ
  public subscribe(dataType: string, callback: Function): void {
    if (!this.listeners.has(dataType)) {
      this.listeners.set(dataType, []);
    }
    this.listeners.get(dataType)!.push(callback);
  }

  public unsubscribe(dataType: string, callback: Function): void {
    const listeners = this.listeners.get(dataType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private notifyListeners(dataType: string): void {
    const listeners = this.listeners.get(dataType);
    if (listeners) {
      listeners.forEach(callback => callback(this.masterData));
    }
    
    // 'all' dinleyicilerini de bilgilendir
    if (dataType !== 'all') {
      const allListeners = this.listeners.get('all');
      if (allListeners) {
        allListeners.forEach(callback => callback(this.masterData));
      }
    }
  }

  // ✅ VERİ SEKRONİZASYONU
  public syncAllModules(): void {
    this.masterData.performance.syncStatus = 'syncing';
    
    // localStorage'dan tüm verileri güncelle
    this.loadRealDOFData();
    
    // Tüm dinleyicileri bilgilendir
    this.listeners.forEach((callbacks, dataType) => {
      callbacks.forEach(callback => callback(this.masterData));
    });

    this.masterData.performance.syncStatus = 'synced';
    this.masterData.performance.lastUpdate = new Date().toISOString();
  }

  // ✅ HATA AYIKLAMA
  public getDebugInfo() {
    const storedDOFRecords = localStorage.getItem('dofRecords');
    const localStorageCount = storedDOFRecords ? JSON.parse(storedDOFRecords).length : 0;
    
    return {
      dataVersion: this.masterData.performance.dataVersion,
      lastUpdate: this.masterData.performance.lastUpdate,
      syncStatus: this.masterData.performance.syncStatus,
      totalDOFs: this.masterData.dof.total,
      localStorageRecords: localStorageCount,
      totalSuppliers: this.masterData.suppliers.total,
      totalCost: this.masterData.qualityCost.totalCost,
      listenersCount: Array.from(this.listeners.entries()).map(([key, value]) => ({
        dataType: key,
        listenerCount: value.length
      }))
    };
  }
}

// ✅ GLOBAL ERİŞİM
export const dataSyncManager = DataSyncManager.getInstance();

// ✅ KULLANIM ÖRNEKLERİ
export const useDataSync = () => {
  return {
    getDOFData: () => dataSyncManager.getDOFData(),
    getSupplierData: () => dataSyncManager.getSupplierData(),
    getQualityCostData: () => dataSyncManager.getQualityCostData(),
    getVehicleQualityData: () => dataSyncManager.getVehicleQualityData(),
    getAuditData: () => dataSyncManager.getAuditData(),
    syncAll: () => dataSyncManager.syncAllModules(),
    forceUpdate: () => dataSyncManager.forceUpdateFromLocalStorage(),
    clearCache: () => dataSyncManager.clearCache(),
    debug: () => dataSyncManager.getDebugInfo()
  };
};

export default DataSyncManager; 