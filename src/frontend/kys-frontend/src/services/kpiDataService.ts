/**
 * KPI Data Service - Otomatik Veri Çekme ve Analiz Sistemi
 * TanStack Query kullanarak diğer modüllerden veri çeker ve KPI'ları hesaplar
 * 
 * @author Atakan Battal
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ✅ Modül Veri Tipleri
export interface ModuleDataSource {
  moduleName: string;
  endpoint: string;
  lastUpdated: string;
  isHealthy: boolean;
  dataCount: number;
}

export interface KPIDataPoint {
  id: string;
  kpiId: string;
  value: number;
  target: number;
  timestamp: string;
  period: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface AutoCalculatedKPI {
  id: string;
  name: string;
  description: string;
  category: 'quality' | 'production' | 'cost' | 'supplier' | 'document' | 'audit' | 'risk';
  formula: string;
  dataSources: string[];
  updateFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  currentValue: number;
  targetValue: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  lastCalculated: string;
  historicalData: KPIDataPoint[];
}

export interface PerformanceAnalysis {
  period: string;
  kpiCount: number;
  averagePerformance: number;
  topPerformers: AutoCalculatedKPI[];
  bottomPerformers: AutoCalculatedKPI[];
  trends: {
    improving: number;
    declining: number;
    stable: number;
  };
  insights: string[];
  recommendations: string[];
}

// ✅ Veri Çekme Fonksiyonları
const API_BASE = '/api';

// Diğer modüllerden veri çekme
export const fetchModuleData = async (moduleName: string): Promise<any> => {
  const endpoints: Record<string, string> = {
    'supplier-quality': `${API_BASE}/supplier-audits`,
    'quality-cost': `${API_BASE}/quality-costs`,
    'dof-8d': `${API_BASE}/dof-reports`,
    'vehicle-quality': `${API_BASE}/vehicle-quality`,
    'document-management': `${API_BASE}/documents`,
    'audit-management': `${API_BASE}/audits`,
    'tank-leak-test': `${API_BASE}/tank-tests`,
    'material-certificates': `${API_BASE}/material-certificates`,
    'fan-test': `${API_BASE}/fan-tests`,
    'welding-cost': `${API_BASE}/welding-costs`
  };

  const endpoint = endpoints[moduleName];
  if (!endpoint) {
    throw new Error(`Unknown module: ${moduleName}`);
  }

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${moduleName} data`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${moduleName} data:`, error);
    // Mock data for development
    return generateMockData(moduleName);
  }
};

// Mock data generator for development
const generateMockData = (moduleName: string): any => {
  const mockData: Record<string, any> = {
    'supplier-quality': {
      totalSuppliers: 45,
      approvedSuppliers: 38,
      qualityScore: 4.2,
      rejectionRate: 2.8,
      onTimeDeliveryRate: 94.5,
      audits: Array.from({ length: 20 }, (_, i) => ({
        id: `audit-${i}`,
        supplierId: `supplier-${i}`,
        score: 70 + Math.random() * 30,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }))
    },
    'quality-cost': {
      totalCost: 125000,
      reworkCost: 45000,
      scrapCost: 28000,
      wasteCost: 18000,
      warrantyCost: 22000,
      complaintCost: 12000,
      records: Array.from({ length: 50 }, (_, i) => ({
        id: `cost-${i}`,
        amount: Math.random() * 10000,
        type: ['rework', 'scrap', 'waste', 'warranty', 'complaint'][Math.floor(Math.random() * 5)],
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
      }))
    },
    'dof-8d': {
      totalReports: 28,
      openReports: 8,
      closedReports: 20,
      overdueReports: 3,
      averageClosureTime: 12.5,
      reports: Array.from({ length: 28 }, (_, i) => ({
        id: `dof-${i}`,
        status: Math.random() > 0.3 ? 'closed' : 'open',
        severity: ['minor', 'major', 'critical'][Math.floor(Math.random() * 3)],
        createdDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
        closedDate: Math.random() > 0.3 ? new Date().toISOString() : null
      }))
    },
    'vehicle-quality': {
      totalVehicles: 156,
      qualityIssues: 12,
      defectRate: 7.7,
      inspectionCompliance: 96.2,
      inspections: Array.from({ length: 156 }, (_, i) => ({
        id: `vehicle-${i}`,
        hasIssues: Math.random() < 0.077,
        defectCount: Math.floor(Math.random() * 5),
        inspectionDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
      }))
    },
    'document-management': {
      totalDocuments: 234,
      activeDocuments: 198,
      expiringDocuments: 18,
      approvalPendingDocuments: 12,
      certificateValidityRate: 94.1,
      documents: Array.from({ length: 234 }, (_, i) => ({
        id: `doc-${i}`,
        status: ['active', 'expired', 'pending'][Math.floor(Math.random() * 3)],
        type: ['WPS', 'WPQR', 'Certificate', 'Manual'][Math.floor(Math.random() * 4)],
        expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      }))
    },
    'audit-management': {
      totalAudits: 42,
      completedAudits: 38,
      auditComplianceRate: 91.2,
      averageScore: 87.5,
      openNonConformities: 15,
      audits: Array.from({ length: 42 }, (_, i) => ({
        id: `audit-${i}`,
        status: Math.random() > 0.1 ? 'completed' : 'pending',
        score: 60 + Math.random() * 40,
        date: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000).toISOString()
      }))
    },
    'tank-leak-test': {
      totalTests: 89,
      passedTests: 82,
      failedTests: 4,
      conditionalTests: 3,
      testSuccessRate: 92.1,
      averagePressureDrop: 0.85,
      tests: Array.from({ length: 89 }, (_, i) => ({
        id: `test-${i}`,
        result: ['passed', 'failed', 'conditional'][Math.floor(Math.random() * 3)],
        pressureDrop: Math.random() * 2,
        testDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }))
    }
  };

  return mockData[moduleName] || {};
};

// ✅ KPI Hesaplama Fonksiyonları
export const calculateKPIValue = (
  formula: string,
  dataContext: Record<string, any>
): number => {
  try {
    // Güvenli formül değerlendirme
    const safeEval = (expression: string, context: Record<string, any>): number => {
      // Temel matematik işlemleri için güvenli değerlendirme
      const variables = Object.keys(context);
      const values = Object.values(context);
      
      let processedExpression = expression;
      
      // Değişkenleri değerlerle değiştir
      variables.forEach((variable, index) => {
        const value = values[index];
        processedExpression = processedExpression.replace(
          new RegExp(`\\b${variable}\\b`, 'g'), 
          String(value)
        );
      });
      
      // Güvenli matematik operasyonları
      processedExpression = processedExpression
        .replace(/\bMath\./, 'Math.')
        .replace(/[^0-9+\-*/.()Math\s]/g, '');
      
      // eslint-disable-next-line no-new-func
      return Function(`"use strict"; return (${processedExpression})`)();
    };

    return safeEval(formula, dataContext);
  } catch (error) {
    console.error('KPI calculation error:', error);
    return 0;
  }
};

// ✅ Auto-calculated KPI Templates
export const AUTO_KPI_TEMPLATES: Omit<AutoCalculatedKPI, 'currentValue' | 'lastCalculated' | 'historicalData'>[] = [
  // Kalite KPI'ları
  {
    id: 'quality-cost-ratio',
    name: 'Kalite Maliyet Oranı',
    description: 'Toplam kalite maliyetinin üretim maliyetine oranı',
    category: 'quality',
    formula: '(reworkCost + scrapCost + wasteCost) / (reworkCost + scrapCost + wasteCost + 500000) * 100',
    dataSources: ['quality-cost'],
    updateFrequency: 'daily',
    targetValue: 5,
    trend: 'stable',
    status: 'good'
  },
  {
    id: 'dof-closure-rate',
    name: 'DÖF Kapatma Oranı',
    description: 'Kapatılan DÖF raporlarının toplam rapor sayısına oranı',
    category: 'quality',
    formula: 'closedReports / totalReports * 100',
    dataSources: ['dof-8d'],
    updateFrequency: 'daily',
    targetValue: 90,
    trend: 'up',
    status: 'good'
  },
  {
    id: 'supplier-quality-index',
    name: 'Tedarikçi Kalite İndeksi',
    description: 'Tedarikçi kalite performansının genel değerlendirmesi',
    category: 'supplier',
    formula: '(approvedSuppliers / totalSuppliers * 50) + (qualityScore * 10) + ((100 - rejectionRate) * 0.4)',
    dataSources: ['supplier-quality'],
    updateFrequency: 'weekly',
    targetValue: 85,
    trend: 'up',
    status: 'good'
  },
  {
    id: 'document-compliance-rate',
    name: 'Doküman Uygunluk Oranı',
    description: 'Aktif ve güncel dokümanların toplam dokümana oranı',
    category: 'document',
    formula: 'activeDocuments / totalDocuments * 100',
    dataSources: ['document-management'],
    updateFrequency: 'daily',
    targetValue: 95,
    trend: 'stable',
    status: 'good'
  },
  {
    id: 'audit-effectiveness',
    name: 'Denetim Etkinliği',
    description: 'Tamamlanan denetimlerin etkinlik skoru',
    category: 'audit',
    formula: '(completedAudits / totalAudits * 60) + (averageScore * 0.4)',
    dataSources: ['audit-management'],
    updateFrequency: 'monthly',
    targetValue: 85,
    trend: 'up',
    status: 'good'
  },
  {
    id: 'test-success-rate',
    name: 'Test Başarı Oranı',
    description: 'Başarılı geçen testlerin toplam test sayısına oranı',
    category: 'production',
    formula: 'passedTests / totalTests * 100',
    dataSources: ['tank-leak-test'],
    updateFrequency: 'daily',
    targetValue: 95,
    trend: 'stable',
    status: 'good'
  },
  // Finansal KPI'lar
  {
    id: 'cost-per-defect',
    name: 'Hata Başına Maliyet',
    description: 'Toplam kalite maliyetinin hata sayısına bölümü',
    category: 'cost',
    formula: '(reworkCost + scrapCost + wasteCost + warrantyCost + complaintCost) / qualityIssues',
    dataSources: ['quality-cost', 'vehicle-quality'],
    updateFrequency: 'weekly',
    targetValue: 5000,
    trend: 'down',
    status: 'good'
  },
  // Operasyonel KPI'lar
  {
    id: 'overall-quality-score',
    name: 'Genel Kalite Skoru',
    description: 'Tüm kalite metriklerinin ağırlıklı ortalaması',
    category: 'quality',
    formula: '(testSuccessRate * 0.3) + (auditComplianceRate * 0.25) + ((100 - rejectionRate) * 0.25) + (documentComplianceRate * 0.2)',
    dataSources: ['tank-leak-test', 'audit-management', 'supplier-quality', 'document-management'],
    updateFrequency: 'daily',
    targetValue: 90,
    trend: 'up',
    status: 'good'
  }
];

// ✅ TanStack Query Hooks
export const useModuleData = (moduleName: string) => {
  return useQuery({
    queryKey: ['module-data', moduleName],
    queryFn: () => fetchModuleData(moduleName),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
    refetchInterval: 5 * 60 * 1000, // 5 dakikada bir otomatik güncelle
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

export const useAutoCalculatedKPIs = () => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['auto-calculated-kpis'],
    queryFn: async (): Promise<AutoCalculatedKPI[]> => {
      const calculatedKPIs: AutoCalculatedKPI[] = [];
      
      for (const template of AUTO_KPI_TEMPLATES) {
        try {
          // Her KPI için gerekli veri kaynaklarından veri çek
          const dataContext: Record<string, any> = {};
          
          for (const source of template.dataSources) {
            const data = await queryClient.fetchQuery({
              queryKey: ['module-data', source],
              queryFn: () => fetchModuleData(source),
              staleTime: 5 * 60 * 1000
            });
            
            // Veriyi context'e ekle
            Object.assign(dataContext, data);
          }
          
          // KPI değerini hesapla
          const currentValue = calculateKPIValue(template.formula, dataContext);
          
          // Trend hesapla (geçmiş verilerle karşılaştır)
          const previousValue = await getPreviousKPIValue(template.id);
          const trend = calculateTrend(currentValue, previousValue);
          
          // Status hesapla
          const status = calculateStatus(currentValue, template.targetValue, template.category);
          
          // Geçmiş veri oluştur
          const historicalData = await getKPIHistoricalData(template.id, currentValue);
          
          calculatedKPIs.push({
            ...template,
            currentValue,
            trend,
            status,
            lastCalculated: new Date().toISOString(),
            historicalData
          });
          
        } catch (error) {
          console.error(`Error calculating KPI ${template.id}:`, error);
          
          // Hata durumunda varsayılan değerlerle KPI oluştur
          calculatedKPIs.push({
            ...template,
            currentValue: 0,
            trend: 'stable',
            status: 'critical',
            lastCalculated: new Date().toISOString(),
            historicalData: []
          });
        }
      }
      
      return calculatedKPIs;
    },
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 5 * 60 * 1000, // 5 dakika
    refetchInterval: 2 * 60 * 1000, // 2 dakikada bir güncelle
    retry: 2
  });
};

// ✅ Performans Analizi Hook
export const usePerformanceAnalysis = (period: string = 'monthly') => {
  return useQuery({
    queryKey: ['performance-analysis', period],
    queryFn: async (): Promise<PerformanceAnalysis> => {
      const kpis = await fetchAutoCalculatedKPIs();
      
      return analyzePerformance(kpis, period);
    },
    staleTime: 10 * 60 * 1000, // 10 dakika
    gcTime: 30 * 60 * 1000, // 30 dakika
    refetchInterval: 10 * 60 * 1000 // 10 dakikada bir güncelle
  });
};

// ✅ KPI Güncelleme Mutation
export const useUpdateKPIData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (kpiId: string) => {
      // KPI'yı manuel olarak güncelle
      const template = AUTO_KPI_TEMPLATES.find(t => t.id === kpiId);
      if (!template) throw new Error('KPI template not found');
      
      const dataContext: Record<string, any> = {};
      for (const source of template.dataSources) {
        const data = await fetchModuleData(source);
        Object.assign(dataContext, data);
      }
      
      const currentValue = calculateKPIValue(template.formula, dataContext);
      
      // Veriyi kaydet (localStorage veya API)
      await saveKPIValue(kpiId, currentValue);
      
      return { kpiId, value: currentValue, timestamp: new Date().toISOString() };
    },
    onSuccess: () => {
      // KPI verilerini güncelle
      queryClient.invalidateQueries({ queryKey: ['auto-calculated-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['performance-analysis'] });
    }
  });
};

// ✅ Yardımcı Fonksiyonlar
const getPreviousKPIValue = async (kpiId: string): Promise<number> => {
  try {
    const stored = localStorage.getItem(`kpi-history-${kpiId}`);
    if (stored) {
      const history: KPIDataPoint[] = JSON.parse(stored);
      return history.length > 1 ? history[history.length - 2].value : 0;
    }
    return 0;
  } catch {
    return 0;
  }
};

const calculateTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
  if (previous === 0) return 'stable';
  const change = ((current - previous) / previous) * 100;
  if (change > 2) return 'up';
  if (change < -2) return 'down';
  return 'stable';
};

const calculateStatus = (current: number, target: number, category: string): 'good' | 'warning' | 'critical' => {
  const variance = Math.abs((current - target) / target) * 100;
  
  if (variance <= 5) return 'good';
  if (variance <= 15) return 'warning';
  return 'critical';
};

const getKPIHistoricalData = async (kpiId: string, currentValue: number): Promise<KPIDataPoint[]> => {
  try {
    const stored = localStorage.getItem(`kpi-history-${kpiId}`);
    let history: KPIDataPoint[] = stored ? JSON.parse(stored) : [];
    
    // Yeni veri noktası ekle
    const newDataPoint: KPIDataPoint = {
      id: `${kpiId}-${Date.now()}`,
      kpiId,
      value: currentValue,
      target: AUTO_KPI_TEMPLATES.find(t => t.id === kpiId)?.targetValue || 0,
      timestamp: new Date().toISOString(),
      period: 'current',
      source: 'auto-calculation'
    };
    
    history.push(newDataPoint);
    
    // Son 30 veri noktasını tut
    if (history.length > 30) {
      history = history.slice(-30);
    }
    
    // Güncellenen geçmişi kaydet
    localStorage.setItem(`kpi-history-${kpiId}`, JSON.stringify(history));
    
    return history;
  } catch {
    return [];
  }
};

const saveKPIValue = async (kpiId: string, value: number): Promise<void> => {
  try {
    const dataPoint: KPIDataPoint = {
      id: `${kpiId}-${Date.now()}`,
      kpiId,
      value,
      target: AUTO_KPI_TEMPLATES.find(t => t.id === kpiId)?.targetValue || 0,
      timestamp: new Date().toISOString(),
      period: 'manual',
      source: 'manual-update'
    };
    
    // Geçmiş verileri güncelle
    await getKPIHistoricalData(kpiId, value);
    
    console.log(`✅ KPI ${kpiId} updated with value: ${value}`);
  } catch (error) {
    console.error('Error saving KPI value:', error);
    throw error;
  }
};

const fetchAutoCalculatedKPIs = async (): Promise<AutoCalculatedKPI[]> => {
  // Mock implementation - gerçek uygulamada API çağrısı yapılacak
  return AUTO_KPI_TEMPLATES.map(template => ({
    ...template,
    currentValue: Math.random() * 100,
    lastCalculated: new Date().toISOString(),
    historicalData: []
  }));
};

const analyzePerformance = (kpis: AutoCalculatedKPI[], period: string): PerformanceAnalysis => {
  const totalKPIs = kpis.length;
  const averagePerformance = kpis.reduce((sum, kpi) => {
    const performance = (kpi.currentValue / kpi.targetValue) * 100;
    return sum + Math.min(performance, 100);
  }, 0) / totalKPIs;
  
  // Performansa göre sırala
  const sortedKPIs = [...kpis].sort((a, b) => {
    const aPerf = (a.currentValue / a.targetValue) * 100;
    const bPerf = (b.currentValue / b.targetValue) * 100;
    return bPerf - aPerf;
  });
  
  const topPerformers = sortedKPIs.slice(0, 3);
  const bottomPerformers = sortedKPIs.slice(-3);
  
  const trends = {
    improving: kpis.filter(kpi => kpi.trend === 'up').length,
    declining: kpis.filter(kpi => kpi.trend === 'down').length,
    stable: kpis.filter(kpi => kpi.trend === 'stable').length
  };
  
  const insights = generateInsights(kpis, averagePerformance);
  const recommendations = generateRecommendations(bottomPerformers);
  
  return {
    period,
    kpiCount: totalKPIs,
    averagePerformance,
    topPerformers,
    bottomPerformers,
    trends,
    insights,
    recommendations
  };
};

const generateInsights = (kpis: AutoCalculatedKPI[], avgPerformance: number): string[] => {
  const insights: string[] = [];
  
  if (avgPerformance > 90) {
    insights.push('🎉 Genel performans hedeflerin üzerinde, mükemmel sonuçlar!');
  } else if (avgPerformance > 75) {
    insights.push('👍 Genel performans iyi seviyede, bazı iyileştirmeler yapılabilir.');
  } else {
    insights.push('⚠️ Genel performans hedeflerin altında, acil aksiyonlar gerekli.');
  }
  
  const criticalKPIs = kpis.filter(kpi => kpi.status === 'critical');
  if (criticalKPIs.length > 0) {
    insights.push(`🚨 ${criticalKPIs.length} KPI kritik durumda, öncelikli müdahale gerekli.`);
  }
  
  const improvingKPIs = kpis.filter(kpi => kpi.trend === 'up');
  if (improvingKPIs.length > kpis.length / 2) {
    insights.push('📈 KPI\'ların çoğunda pozitif trend var, stratejiler başarılı.');
  }
  
  return insights;
};

const generateRecommendations = (bottomPerformers: AutoCalculatedKPI[]): string[] => {
  const recommendations: string[] = [];
  
  bottomPerformers.forEach(kpi => {
    switch (kpi.category) {
      case 'quality':
        recommendations.push(`${kpi.name}: Kalite kontrol süreçlerini gözden geçirin ve iyileştirin.`);
        break;
      case 'cost':
        recommendations.push(`${kpi.name}: Maliyet analizi yapın ve tasarruf fırsatları belirleyin.`);
        break;
      case 'supplier':
        recommendations.push(`${kpi.name}: Tedarikçi değerlendirme kriterlerini güncelleyin.`);
        break;
      case 'document':
        recommendations.push(`${kpi.name}: Doküman yönetim süreçlerini dijitalleştirin.`);
        break;
      default:
        recommendations.push(`${kpi.name}: Detaylı analiz yapın ve iyileştirme planı oluşturun.`);
    }
  });
  
  return recommendations;
};

const kpiDataService = {
  useModuleData,
  useAutoCalculatedKPIs,
  usePerformanceAnalysis,
  useUpdateKPIData,
  fetchModuleData,
  calculateKPIValue,
  AUTO_KPI_TEMPLATES
};

export default kpiDataService; 