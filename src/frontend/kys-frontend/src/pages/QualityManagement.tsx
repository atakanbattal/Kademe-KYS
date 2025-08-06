/**
 * 🎯 ENTEGRE KALİTE YÖNETİMİ MODÜLİ
 * 
 * Bu modül tüm kalite ile ilgili modüllerden veri çekerek:
 * - Otomatik KPI hesaplama
 * - Gerçek zamanlı performans izleme  
 * - Kalite dashboard'u
 * - Trend analizi
 * - Uyarı sistemi
 * 
 * Entegre Modüller:
 * 1. Kalite ve Araç Performans Yönetimi
 * 2. DF ve 8D Yönetimi
 * 3. Üretim Kaynaklı Kalite Hata Takip Sistemi 
 * 4. Tank Sızdırmazlık Testi
 * 5. Fan Balans ve Kaynak Kalite Analizi
 * 6. Tedarikçi Kalite Yönetimi
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Tab,
  Tabs,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab
} from '@mui/material';

import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Notifications as NotificationIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// ============================================
// 🔥 INTERFACES & TYPES
// ============================================

interface QualityKPI {
  id: string;
  name: string;
  category: 'quality' | 'cost' | 'delivery' | 'safety' | 'environment' | 'efficiency' | 'satisfaction' | 'innovation';
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  lastUpdated: string;
  dataSource: string;
  description: string;
  isHigherBetter: boolean; // true = yüksek daha iyi, false = düşük daha iyi
}

interface ModuleIntegrationStatus {
  moduleName: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  recordCount: number;
  dataQuality: 'high' | 'medium' | 'low';
}

interface QualityAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  source: string;
  timestamp: string;
  isRead: boolean;
}

// ============================================
// 🎯 ENTEGRE VERİ ÇEKİM FONKSİYONLARI
// ============================================

// Kalitesizlik maliyeti verilerini çek
const getQualityCostData = () => {
  try {
    const data = JSON.parse(localStorage.getItem('kys-cost-management-data') || '[]');
    const totalCost = data.reduce((sum: number, record: any) => sum + (record.maliyet || 0), 0);
    const recordCount = data.length;
    
    return {
      totalCost,
      recordCount,
              dataQuality: (recordCount > 10 ? 'high' : recordCount > 5 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    };
  } catch (error) {
    return {
      totalCost: 0,
      recordCount: 0,
      dataQuality: 'low' as const
    };
  }
};

// DF ve 8D verilerini çek
const getDOFData = () => {
  try {
    const data = JSON.parse(localStorage.getItem('dofRecords') || '[]');
    const totalDOF = data.length;
    const closedDOF = data.filter((record: any) => record.status === 'closed').length;
    const closureRate = totalDOF > 0 ? (closedDOF / totalDOF) * 100 : 0;

    return {
      totalDOF,
      closedDOF,
      closureRate,
      dataQuality: (totalDOF > 10 ? 'high' : totalDOF > 5 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    };
  } catch (error) {
    return {
      totalDOF: 0,
      closedDOF: 0,
      closureRate: 0,
      dataQuality: 'low' as const
    };
  }
};

// Tank sızdırmazlık test verilerini çek
const getTankTestData = () => {
  try {
    const data = JSON.parse(localStorage.getItem('tankLeakTests') || '[]');
    const totalTests = data.length;
    const passedTests = data.filter((test: any) => 
      test.testResult?.result === 'passed'
    ).length;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    return {
      totalTests,
      passedTests,
      successRate,
      dataQuality: (totalTests > 10 ? 'high' : totalTests > 5 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    };
  } catch (error) {
    return {
      totalTests: 0,
      passedTests: 0,
      successRate: 0,
      dataQuality: 'low' as const
    };
  }
};

// Fan test verilerini çek
const getFanTestData = () => {
  try {
    const data = JSON.parse(localStorage.getItem('fanTestRecords') || '[]');
    const totalTests = data.length;
    const passedTests = data.filter((test: any) => 
      test.overallResult === 'pass'
    ).length;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    return {
      totalTests,
      passedTests,
      successRate,
      dataQuality: (totalTests > 10 ? 'high' : totalTests > 5 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    };
  } catch (error) {
    return {
      totalTests: 0,
      passedTests: 0,
      successRate: 0,
      dataQuality: 'low' as const
    };
  }
};

// Tedarikçi verilerini çek (güncellenmiş)
const getSupplierData = () => {
  try {
    const supplierData = JSON.parse(localStorage.getItem('suppliers') || '[]');
    const nonconformities = JSON.parse(localStorage.getItem('supplier-nonconformities') || '[]');
    const defects = JSON.parse(localStorage.getItem('supplier-defects') || '[]');
    const audits = JSON.parse(localStorage.getItem('supplier-audits') || '[]');
    
    const totalSuppliers = supplierData.length;
    const approvedSuppliers = supplierData.filter((supplier: any) => 
      supplier.qualificationStatus === 'qualified' || supplier.status === 'approved'
    ).length;
    const approvalRate = totalSuppliers > 0 ? (approvedSuppliers / totalSuppliers) * 100 : 0;
    
    const activeNonconformities = nonconformities.filter((nc: any) => nc.status !== 'closed').length;
    const activeDefects = defects.filter((defect: any) => defect.status !== 'resolved').length;
    const completedAudits = audits.filter((audit: any) => audit.status === 'completed').length;
    const auditCompletionRate = audits.length > 0 ? (completedAudits / audits.length) * 100 : 0;

    return {
      totalSuppliers,
      approvedSuppliers,
      approvalRate,
      activeNonconformities,
      activeDefects,
      totalAudits: audits.length,
      completedAudits,
      auditCompletionRate,
      dataQuality: (totalSuppliers > 5 ? 'high' : totalSuppliers > 2 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    };
  } catch (error) {
    return {
      totalSuppliers: 0,
      approvedSuppliers: 0,
      approvalRate: 0,
      activeNonconformities: 0,
      activeDefects: 0,
      totalAudits: 0,
      completedAudits: 0,
      auditCompletionRate: 0,
      dataQuality: 'low' as const
    };
  }
};

// Üretim kalite hata takip verilerini çek
const getProductionQualityData = () => {
  try {
    // Üretim Kalite Hata Takip modülünden gerçek veri çek - DOĞRU KEY
    const productionData = JSON.parse(localStorage.getItem('productionQualityTracking') || '[]');
    
    console.log('📊 Production Quality Data check:', {
      dataLength: productionData.length,
      sampleRecord: productionData[0] || 'VERİ YOK'
    });
    
    // Toplam araç kayıt sayısı
    const totalVehicles = productionData.length;
    
    // Tüm hata detaylarını çek (tekrarlama sayısı dahil)
    const allDefects = productionData.flatMap((record: any) => record.defects || []);
    const totalDefectsWithRepeats = allDefects.reduce((sum: number, defect: any) => 
      sum + (defect.repeatCount || 1), 0);
    
    // Kritik hatalar
    const criticalDefects = allDefects.filter((defect: any) => 
      defect.severity === 'critical' || defect.severity === 'high' || defect.defectType === 'critical'
    ).length;
    
    const criticalDefectRate = allDefects.length > 0 ? (criticalDefects / allDefects.length) * 100 : 0;
    
    // Açık/devam eden hatalar
    const openDefects = allDefects.filter((defect: any) => 
      defect.status === 'open' || defect.status === 'in_progress' || defect.status === 'açık'
    ).length;

    console.log('📈 Production Quality Analysis:', {
      totalVehicles,
      totalDefects: totalDefectsWithRepeats,
      criticalDefects,
      criticalDefectRate: criticalDefectRate.toFixed(2),
      openDefects
    });

    return {
      totalVehicles,
      totalDefects: totalDefectsWithRepeats,
      criticalDefects,
      criticalDefectRate,
      openDefects,
      dataQuality: (totalVehicles > 10 ? 'high' : totalVehicles > 5 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    };
  } catch (error) {
    console.error('Production Quality Data Error:', error);
    return {
      totalVehicles: 0,
      totalDefects: 0,
      criticalDefects: 0,
      criticalDefectRate: 0,
      openDefects: 0,
      dataQuality: 'low' as const
    };
  }
};

// İç denetim verilerini çek (YENİ)
const getInternalAuditData = () => {
  try {
    const data = JSON.parse(localStorage.getItem('auditManagementData') || '[]');
    const totalAudits = data.length;
    const completedAudits = data.filter((audit: any) => audit.status === 'completed').length;
    const nonconformitiesFound = data.reduce((sum: number, audit: any) => 
      sum + (audit.nonconformities?.length || 0), 0);
    const completionRate = totalAudits > 0 ? (completedAudits / totalAudits) * 100 : 0;

    return {
      totalAudits,
      completedAudits,
      completionRate,
      nonconformitiesFound,
      dataQuality: (totalAudits > 5 ? 'high' : totalAudits > 2 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    };
  } catch (error) {
    return {
      totalAudits: 0,
      completedAudits: 0,
      completionRate: 0,
      nonconformitiesFound: 0,
      dataQuality: 'low' as const
    };
  }
};

// Risk yönetimi verilerini çek (YENİ)
const getRiskManagementData = () => {
  try {
    const data = JSON.parse(localStorage.getItem('riskManagementData') || '[]');
    const totalRisks = data.length;
    const highRisks = data.filter((risk: any) => risk.riskLevel === 'high' || risk.severity === 'high').length;
    const mitigatedRisks = data.filter((risk: any) => risk.status === 'mitigated' || risk.status === 'closed').length;
    const mitigationRate = totalRisks > 0 ? (mitigatedRisks / totalRisks) * 100 : 0;

    return {
      totalRisks,
      highRisks,
      mitigatedRisks,
      mitigationRate,
      dataQuality: (totalRisks > 5 ? 'high' : totalRisks > 2 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    };
  } catch (error) {
    return {
      totalRisks: 0,
      highRisks: 0,
      mitigatedRisks: 0,
      mitigationRate: 0,
      dataQuality: 'low' as const
    };
  }
};

// Eğitim yönetimi verilerini çek (YENİ)
const getTrainingData = () => {
  try {
    const data = JSON.parse(localStorage.getItem('training-records') || '[]');
    const totalTrainings = data.length;
    const completedTrainings = data.filter((training: any) => training.status === 'completed').length;
    const completionRate = totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 0;
    
    // Sertifika durumu kontrolü
    const certificatedPersonnel = data.filter((training: any) => 
      training.certificateIssued === true || training.hasCertificate === true
    ).length;
    const certificationRate = totalTrainings > 0 ? (certificatedPersonnel / totalTrainings) * 100 : 0;

    return {
      totalTrainings,
      completedTrainings,
      completionRate,
      certificatedPersonnel,
      certificationRate,
      dataQuality: (totalTrainings > 10 ? 'high' : totalTrainings > 5 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    };
  } catch (error) {
    return {
      totalTrainings: 0,
      completedTrainings: 0,
      completionRate: 0,
      certificatedPersonnel: 0,
      certificationRate: 0,
      dataQuality: 'low' as const
    };
  }
};

// Doküman yönetimi verilerini çek (YENİ)
const getDocumentManagementData = () => {
  try {
    const data = JSON.parse(localStorage.getItem('documentManagementData') || '[]');
    const totalDocuments = data.length;
    const approvedDocuments = data.filter((doc: any) => doc.status === 'approved').length;
    const expiredDocuments = data.filter((doc: any) => {
      if (!doc.expiryDate) return false;
      return new Date(doc.expiryDate) < new Date();
    }).length;
    const approvalRate = totalDocuments > 0 ? (approvedDocuments / totalDocuments) * 100 : 0;

    return {
      totalDocuments,
      approvedDocuments,
      expiredDocuments,
      approvalRate,
      dataQuality: (totalDocuments > 20 ? 'high' : totalDocuments > 10 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    };
  } catch (error) {
    return {
      totalDocuments: 0,
      approvedDocuments: 0,
      expiredDocuments: 0,
      approvalRate: 0,
      dataQuality: 'low' as const
    };
  }
};

// Müşteri geri bildirim verilerini çek (YENİ)
const getCustomerFeedbackData = () => {
  try {
    const data = JSON.parse(localStorage.getItem('customer-feedbacks') || '[]');
    const totalFeedbacks = data.length;
    const resolvedFeedbacks = data.filter((feedback: any) => feedback.status === 'resolved').length;
    const positiveFeedbacks = data.filter((feedback: any) => 
      feedback.type === 'compliment' || feedback.rating >= 4
    ).length;
    const resolutionRate = totalFeedbacks > 0 ? (resolvedFeedbacks / totalFeedbacks) * 100 : 0;
    const satisfactionRate = totalFeedbacks > 0 ? (positiveFeedbacks / totalFeedbacks) * 100 : 0;

    return {
      totalFeedbacks,
      resolvedFeedbacks,
      positiveFeedbacks,
      resolutionRate,
      satisfactionRate,
      dataQuality: (totalFeedbacks > 10 ? 'high' : totalFeedbacks > 5 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    };
  } catch (error) {
    return {
      totalFeedbacks: 0,
      resolvedFeedbacks: 0,
      positiveFeedbacks: 0,
      resolutionRate: 0,
      satisfactionRate: 0,
      dataQuality: 'low' as const
    };
  }
};

// Kalibrasyon yönetimi verilerini çek (YENİ)
const getCalibrationData = () => {
  try {
    const data = JSON.parse(localStorage.getItem('equipmentCalibration') || '[]');
    const totalEquipments = data.length;
    const calibratedEquipments = data.filter((equipment: any) => equipment.status === 'calibrated').length;
    const overdueEquipments = data.filter((equipment: any) => {
      if (!equipment.nextCalibrationDate) return false;
      return new Date(equipment.nextCalibrationDate) < new Date();
    }).length;
    const calibrationRate = totalEquipments > 0 ? (calibratedEquipments / totalEquipments) * 100 : 0;

    return {
      totalEquipments,
      calibratedEquipments,
      overdueEquipments,
      calibrationRate,
      dataQuality: (totalEquipments > 15 ? 'high' : totalEquipments > 8 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    };
  } catch (error) {
    return {
      totalEquipments: 0,
      calibratedEquipments: 0,
      overdueEquipments: 0,
      calibrationRate: 0,
      dataQuality: 'low' as const
    };
  }
};

// ============================================
// 🔧 HELPER FUNCTIONS
// ============================================

// Saklanan hedef değeri çek
const getStoredTargetValue = (kpiId: string, defaultValue: number): number => {
  try {
    const stored = localStorage.getItem(`kpi_target_${kpiId}`);
    return stored ? parseFloat(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Hedef değeri sakla
const saveTargetValue = (kpiId: string, value: number): void => {
  try {
    localStorage.setItem(`kpi_target_${kpiId}`, value.toString());
  } catch (error) {
    console.error('Hedef değer kaydedilemedi:', error);
  }
};

// Manuel KPI'ları çek
const getManualKPIs = (): QualityKPI[] => {
  try {
    const stored = localStorage.getItem('manual_kpis');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Manuel KPI'ları sakla
const saveManualKPIs = (kpis: QualityKPI[]): void => {
  try {
    localStorage.setItem('manual_kpis', JSON.stringify(kpis));
  } catch (error) {
    console.error('Manuel KPI kaydedilemedi:', error);
  }
};

// ============================================
// 🚀 ANA COMPONENT
// ============================================

const QualityManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [alerts, setAlerts] = useState<QualityAlert[]>([]);
  const [kpis, setKPIs] = useState<QualityKPI[]>([]);
  const [moduleStatus, setModuleStatus] = useState<ModuleIntegrationStatus[]>([]);
  const [kpiDetailDialog, setKpiDetailDialog] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<QualityKPI | null>(null);
  const [editTargetDialog, setEditTargetDialog] = useState(false);
  const [newTargetValue, setNewTargetValue] = useState('');
  const [addKpiDialog, setAddKpiDialog] = useState(false);
  const [newKPI, setNewKPI] = useState({
    name: '',
    category: 'quality' as 'quality' | 'cost' | 'delivery' | 'safety' | 'environment' | 'efficiency' | 'satisfaction' | 'innovation',
    targetValue: '',
    unit: '',
    description: '',
    isHigherBetter: true
  });
  const [editValueDialog, setEditValueDialog] = useState(false);
  const [newCurrentValue, setNewCurrentValue] = useState('');

  // ============================================
  // 🔥 VERİ GÜNCELLEME VE ENTEGRASYONu
  // ============================================

  const calculateKPIs = useCallback(() => {
    console.log('🔄 Quality Management KPI hesaplama başladı...');
    
    // ✅ DF modülü tarzında CANLI VERİ ÇEKME
    const loadRealTimeData = () => {
      console.log('📦 Quality Management - Real-time veri çekme başlıyor...');
      
      // Doğrudan localStorage'dan güncel verileri çek
      const costData = localStorage.getItem('kys-cost-management-data');
      const dofData = localStorage.getItem('dofRecords');
      const tankData = localStorage.getItem('tankLeakTests');
      const fanData = localStorage.getItem('fanTestRecords');
      const supplierData = localStorage.getItem('suppliers');
      const supplierNCData = localStorage.getItem('supplier-nonconformities');
      const supplierDefectData = localStorage.getItem('supplier-defects');
      const productionData = localStorage.getItem('productionQualityTracking');
      
      console.log('📊 Quality Management Real-time Veri Durumu:', {
        kostMaliyeti: costData ? `${JSON.parse(costData).length} kayıt` : 'VERİ YOK',
        dofKayitlari: dofData ? `${JSON.parse(dofData).length} kayıt` : 'VERİ YOK',
        tankTest: tankData ? `${JSON.parse(tankData).length} kayıt` : 'VERİ YOK',
        fanTest: fanData ? `${JSON.parse(fanData).length} kayıt` : 'VERİ YOK',
        tedarikci: supplierData ? `${JSON.parse(supplierData).length} kayıt` : 'VERİ YOK',
        tedarikciUygunsuzluk: supplierNCData ? `${JSON.parse(supplierNCData).length} kayıt` : 'VERİ YOK',
        tedarikciHata: supplierDefectData ? `${JSON.parse(supplierDefectData).length} kayıt` : 'VERİ YOK',
        uretimKalite: productionData ? `${JSON.parse(productionData).length} kayıt` : 'VERİ YOK'
      });
      
      // Veri yoksa sadece uyarı ver, test verisi oluşturma
      if (!costData && !dofData && !tankData && !fanData) {
        console.log('⚠️ Quality Management - Hiçbir modülde veri bulunamadı!');
        console.log('💡 Veri yüklemek için: modüllere girin ve veri ekleyin veya test verisini manuel yükleyin.');
      }
      
      return {
        hasData: !!(costData || dofData || tankData || fanData || supplierData || productionData),
        costCount: costData ? JSON.parse(costData).length : 0,
        dofCount: dofData ? JSON.parse(dofData).length : 0,
        tankCount: tankData ? JSON.parse(tankData).length : 0,
        fanCount: fanData ? JSON.parse(fanData).length : 0,
        supplierCount: supplierData ? JSON.parse(supplierData).length : 0,
        productionCount: productionData ? JSON.parse(productionData).length : 0
      };
    };
    
    // Real-time veri yükle
    const dataStatus = loadRealTimeData();
    
    // Sadece real-time veri kullan, test verisi oluşturma YOK
    console.log('🎯 Quality Management - Sadece gerçek verilerle KPI hesaplama yapılacak');
    
    // Tüm modüllerden veri çek
    const qualityCostData = getQualityCostData();
    const dofData = getDOFData();
    const tankTestData = getTankTestData();
    const fanTestData = getFanTestData();
    const supplierData = getSupplierData();
    const productionData = getProductionQualityData();
    const internalAuditData = getInternalAuditData();
    const riskData = getRiskManagementData();
    const trainingData = getTrainingData();
    const documentData = getDocumentManagementData();
    const customerFeedbackData = getCustomerFeedbackData();
    const calibrationData = getCalibrationData();
    
    console.log('📊 Quality Management Veri Kaynakları:', {
      qualityCost: { totalCost: qualityCostData.totalCost, recordCount: qualityCostData.recordCount },
      dof: { totalDOF: dofData.totalDOF, closureRate: dofData.closureRate },
      tankTest: { totalTests: tankTestData.totalTests, successRate: tankTestData.successRate },
      fanTest: { totalTests: fanTestData.totalTests, successRate: fanTestData.successRate },
      supplier: { totalSuppliers: supplierData.totalSuppliers, approvalRate: supplierData.approvalRate, auditCompletionRate: supplierData.auditCompletionRate },
      production: { totalVehicles: productionData.totalVehicles, totalDefects: productionData.totalDefects, criticalDefectRate: productionData.criticalDefectRate },
      internalAudit: { totalAudits: internalAuditData.totalAudits, completionRate: internalAuditData.completionRate },
      risk: { totalRisks: riskData.totalRisks, mitigationRate: riskData.mitigationRate },
      training: { totalTrainings: trainingData.totalTrainings, completionRate: trainingData.completionRate },
      document: { totalDocuments: documentData.totalDocuments, approvalRate: documentData.approvalRate },
      customerFeedback: { totalFeedbacks: customerFeedbackData.totalFeedbacks, satisfactionRate: customerFeedbackData.satisfactionRate },
      calibration: { totalEquipments: calibrationData.totalEquipments, calibrationRate: calibrationData.calibrationRate }
    });

    // KPI'ları hesapla
    const calculatedKPIs: QualityKPI[] = [
      {
        id: 'total_quality_cost',
        name: 'Toplam Kalitesizlik Maliyeti',
        category: 'cost',
        currentValue: qualityCostData.totalCost,
        targetValue: getStoredTargetValue('total_quality_cost', 500000),
        unit: '₺',
        trend: (() => {
          const previousValue = 450000; // Önceki dönem değeri (geçici)
          const current = qualityCostData.totalCost;
          // Düşük daha iyi: azalış iyi, artış kötü
          return current < previousValue ? 'down' : current > previousValue ? 'up' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('total_quality_cost', 500000);
          const current = qualityCostData.totalCost;
          // Düşük daha iyi (maliyet)
          return current <= target * 0.7 ? 'excellent' : 
                 current <= target ? 'good' : 
                 current <= target * 1.3 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'Kalitesizlik Maliyeti Modülü',
        description: 'Toplam kalitesizlik maliyeti (hurda, yeniden işlem, fire, garanti vs.)',
        isHigherBetter: false
      },
      {
        id: 'dof_closure_rate',
        name: 'DF Kapanma Oranı',
        category: 'quality',
        currentValue: dofData.closureRate,
        targetValue: getStoredTargetValue('dof_closure_rate', 85),
        unit: '%',
        trend: (() => {
          const previousValue = 82; // Önceki dönem değeri (geçici)
          const current = dofData.closureRate;
          // Yüksek daha iyi: artış iyi, azalış kötü
          return current > previousValue ? 'up' : current < previousValue ? 'down' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('dof_closure_rate', 85);
          const current = dofData.closureRate;
          // Yüksek daha iyi (oran)
          return current >= target * 1.1 ? 'excellent' : 
                 current >= target * 0.95 ? 'good' : 
                 current >= target * 0.8 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'DF ve 8D Yönetimi Modülü',
        description: 'Zamanında kapatılan DF kayıtlarının oranı',
        isHigherBetter: true
      },
      {
        id: 'tank_test_success_rate',
        name: 'Tank Test Başarı Oranı',
        category: 'quality',
        currentValue: tankTestData.successRate,
        targetValue: getStoredTargetValue('tank_test_success_rate', 95),
        unit: '%',
        trend: (() => {
          const previousValue = 93; // Önceki dönem değeri (geçici)
          const current = tankTestData.successRate;
          // Yüksek daha iyi: artış iyi, azalış kötü
          return current > previousValue ? 'up' : current < previousValue ? 'down' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('tank_test_success_rate', 95);
          const current = tankTestData.successRate;
          // Yüksek daha iyi (başarı oranı)
          return current >= target * 1.02 ? 'excellent' : 
                 current >= target * 0.95 ? 'good' : 
                 current >= target * 0.85 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'Tank Sızdırmazlık Testi Modülü',
        description: 'Tank sızdırmazlık testlerinde başarılı sonuç oranı',
        isHigherBetter: true
      },
      {
        id: 'fan_test_success_rate',
        name: 'Fan Test Başarı Oranı',
        category: 'quality',
        currentValue: fanTestData.successRate,
        targetValue: getStoredTargetValue('fan_test_success_rate', 92),
        unit: '%',
        trend: (() => {
          const previousValue = 88; // Önceki dönem değeri (geçici)
          const current = fanTestData.successRate;
          // Yüksek daha iyi: artış iyi, azalış kötü
          return current > previousValue ? 'up' : current < previousValue ? 'down' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('fan_test_success_rate', 92);
          const current = fanTestData.successRate;
          // Yüksek daha iyi (başarı oranı)
          return current >= target * 1.05 ? 'excellent' : 
                 current >= target * 0.95 ? 'good' : 
                 current >= target * 0.8 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'Fan Balans ve Kaynak Kalite Analizi Modülü',
        description: 'Fan dengeleme ve kalite testlerinde başarı oranı',
        isHigherBetter: true
      },
      {
        id: 'supplier_approval_rate',
        name: 'Tedarikçi Onay Oranı',
        category: 'quality',
        currentValue: supplierData.approvalRate,
        targetValue: getStoredTargetValue('supplier_approval_rate', 80),
        unit: '%',
        trend: (() => {
          const previousValue = 77; // Önceki dönem değeri (geçici)
          const current = supplierData.approvalRate;
          // Yüksek daha iyi: artış iyi, azalış kötü
          return current > previousValue ? 'up' : current < previousValue ? 'down' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('supplier_approval_rate', 80);
          const current = supplierData.approvalRate;
          // Yüksek daha iyi (onay oranı)
          return current >= target * 1.1 ? 'excellent' : 
                 current >= target * 0.95 ? 'good' : 
                 current >= target * 0.8 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'Tedarikçi Kalite Yönetimi Modülü',
        description: 'Onaylanmış tedarikçilerin toplam tedarikçilere oranı',
        isHigherBetter: true
      },
      {
        id: 'critical_defect_rate',
        name: 'Kritik Hata Oranı',
        category: 'safety',
        currentValue: productionData.criticalDefectRate,
        targetValue: getStoredTargetValue('critical_defect_rate', 5),
        unit: '%',
        trend: (() => {
          const previousValue = 6; // Önceki dönem değeri (geçici)
          const current = productionData.criticalDefectRate;
          // Düşük daha iyi: azalış iyi, artış kötü
          return current < previousValue ? 'down' : current > previousValue ? 'up' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('critical_defect_rate', 5);
          const current = productionData.criticalDefectRate;
          // Düşük daha iyi (hata oranı)
          return current <= target * 0.6 ? 'excellent' : 
                 current <= target ? 'good' : 
                 current <= target * 1.5 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'Üretim Kalite Hata Takip Sistemi',
        description: 'Üretimde tespit edilen kritik hataların oranı',
        isHigherBetter: false
      },
      // ============================================
      // 🔥 YENİ KPI'LAR - TÜM MODÜLLERDEN
      // ============================================
      {
        id: 'supplier_audit_completion_rate',
        name: 'Tedarikçi Denetim Tamamlama Oranı',
        category: 'quality',
        currentValue: supplierData.auditCompletionRate,
        targetValue: getStoredTargetValue('supplier_audit_completion_rate', 90),
        unit: '%',
        trend: (() => {
          const previousValue = 85;
          const current = supplierData.auditCompletionRate;
          return current > previousValue ? 'up' : current < previousValue ? 'down' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('supplier_audit_completion_rate', 90);
          const current = supplierData.auditCompletionRate;
          return current >= target * 1.05 ? 'excellent' : 
                 current >= target * 0.95 ? 'good' : 
                 current >= target * 0.8 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'Tedarikçi Kalite Yönetimi Modülü',
        description: 'Tamamlanan tedarikçi denetimlerinin toplam denetimlere oranı',
        isHigherBetter: true
      },
      {
        id: 'internal_audit_completion_rate',
        name: 'İç Denetim Tamamlama Oranı',
        category: 'quality',
        currentValue: internalAuditData.completionRate,
        targetValue: getStoredTargetValue('internal_audit_completion_rate', 95),
        unit: '%',
        trend: (() => {
          const previousValue = 92;
          const current = internalAuditData.completionRate;
          return current > previousValue ? 'up' : current < previousValue ? 'down' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('internal_audit_completion_rate', 95);
          const current = internalAuditData.completionRate;
          return current >= target * 1.02 ? 'excellent' : 
                 current >= target * 0.95 ? 'good' : 
                 current >= target * 0.85 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'İç Denetim Yönetimi Modülü',
        description: 'Tamamlanan iç denetimlerin toplam denetimlere oranı',
        isHigherBetter: true
      },
      {
        id: 'risk_mitigation_rate',
        name: 'Risk Azaltma Oranı',
        category: 'safety',
        currentValue: riskData.mitigationRate,
        targetValue: getStoredTargetValue('risk_mitigation_rate', 80),
        unit: '%',
        trend: (() => {
          const previousValue = 75;
          const current = riskData.mitigationRate;
          return current > previousValue ? 'up' : current < previousValue ? 'down' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('risk_mitigation_rate', 80);
          const current = riskData.mitigationRate;
          return current >= target * 1.1 ? 'excellent' : 
                 current >= target * 0.9 ? 'good' : 
                 current >= target * 0.7 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'Risk Yönetimi Modülü',
        description: 'Azaltılan/kapatılan risklerin toplam risklere oranı',
        isHigherBetter: true
      },
      {
        id: 'training_completion_rate',
        name: 'Eğitim Tamamlama Oranı',
        category: 'efficiency',
        currentValue: trainingData.completionRate,
        targetValue: getStoredTargetValue('training_completion_rate', 85),
        unit: '%',
        trend: (() => {
          const previousValue = 80;
          const current = trainingData.completionRate;
          return current > previousValue ? 'up' : current < previousValue ? 'down' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('training_completion_rate', 85);
          const current = trainingData.completionRate;
          return current >= target * 1.1 ? 'excellent' : 
                 current >= target * 0.95 ? 'good' : 
                 current >= target * 0.8 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'Eğitim Yönetimi Modülü',
        description: 'Tamamlanan eğitimlerin toplam eğitimlere oranı',
        isHigherBetter: true
      },
      {
        id: 'training_certification_rate',
        name: 'Eğitim Sertifikasyon Oranı',
        category: 'efficiency',
        currentValue: trainingData.certificationRate,
        targetValue: getStoredTargetValue('training_certification_rate', 70),
        unit: '%',
        trend: (() => {
          const previousValue = 65;
          const current = trainingData.certificationRate;
          return current > previousValue ? 'up' : current < previousValue ? 'down' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('training_certification_rate', 70);
          const current = trainingData.certificationRate;
          return current >= target * 1.15 ? 'excellent' : 
                 current >= target * 0.9 ? 'good' : 
                 current >= target * 0.7 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'Eğitim Yönetimi Modülü',
        description: 'Sertifika alan personelin toplam eğitim alan personele oranı',
        isHigherBetter: true
      },
      {
        id: 'document_approval_rate',
        name: 'Doküman Onay Oranı',
        category: 'quality',
        currentValue: documentData.approvalRate,
        targetValue: getStoredTargetValue('document_approval_rate', 95),
        unit: '%',
        trend: (() => {
          const previousValue = 92;
          const current = documentData.approvalRate;
          return current > previousValue ? 'up' : current < previousValue ? 'down' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('document_approval_rate', 95);
          const current = documentData.approvalRate;
          return current >= target * 1.02 ? 'excellent' : 
                 current >= target * 0.95 ? 'good' : 
                 current >= target * 0.85 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'Doküman Yönetimi Modülü',
        description: 'Onaylanmış dokümanların toplam dokümanlara oranı',
        isHigherBetter: true
      },
      {
        id: 'expired_documents_count',
        name: 'Süresi Dolan Doküman Sayısı',
        category: 'quality',
        currentValue: documentData.expiredDocuments,
        targetValue: getStoredTargetValue('expired_documents_count', 5),
        unit: 'adet',
        trend: (() => {
          const previousValue = 8;
          const current = documentData.expiredDocuments;
          return current < previousValue ? 'down' : current > previousValue ? 'up' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('expired_documents_count', 5);
          const current = documentData.expiredDocuments;
          return current <= target * 0.6 ? 'excellent' : 
                 current <= target ? 'good' : 
                 current <= target * 2 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'Doküman Yönetimi Modülü',
        description: 'Süresi dolmuş ve yenilenmesi gereken doküman sayısı',
        isHigherBetter: false
      },
      {
        id: 'customer_satisfaction_rate',
        name: 'Müşteri Memnuniyet Oranı',
        category: 'satisfaction',
        currentValue: customerFeedbackData.satisfactionRate,
        targetValue: getStoredTargetValue('customer_satisfaction_rate', 85),
        unit: '%',
        trend: (() => {
          const previousValue = 82;
          const current = customerFeedbackData.satisfactionRate;
          return current > previousValue ? 'up' : current < previousValue ? 'down' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('customer_satisfaction_rate', 85);
          const current = customerFeedbackData.satisfactionRate;
          return current >= target * 1.1 ? 'excellent' : 
                 current >= target * 0.95 ? 'good' : 
                 current >= target * 0.8 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'Müşteri Geri Bildirim Modülü',
        description: 'Olumlu müşteri geri bildirimlerinin toplam geri bildirimlere oranı',
        isHigherBetter: true
      },
      {
        id: 'customer_feedback_resolution_rate',
        name: 'Müşteri Şikayet Çözüm Oranı',
        category: 'satisfaction',
        currentValue: customerFeedbackData.resolutionRate,
        targetValue: getStoredTargetValue('customer_feedback_resolution_rate', 90),
        unit: '%',
        trend: (() => {
          const previousValue = 88;
          const current = customerFeedbackData.resolutionRate;
          return current > previousValue ? 'up' : current < previousValue ? 'down' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('customer_feedback_resolution_rate', 90);
          const current = customerFeedbackData.resolutionRate;
          return current >= target * 1.05 ? 'excellent' : 
                 current >= target * 0.95 ? 'good' : 
                 current >= target * 0.8 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'Müşteri Geri Bildirim Modülü',
        description: 'Çözümlenen müşteri şikayetlerinin toplam şikayetlere oranı',
        isHigherBetter: true
      },
      {
        id: 'equipment_calibration_rate',
        name: 'Ekipman Kalibrasyon Oranı',
        category: 'quality',
        currentValue: calibrationData.calibrationRate,
        targetValue: getStoredTargetValue('equipment_calibration_rate', 95),
        unit: '%',
        trend: (() => {
          const previousValue = 92;
          const current = calibrationData.calibrationRate;
          return current > previousValue ? 'up' : current < previousValue ? 'down' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('equipment_calibration_rate', 95);
          const current = calibrationData.calibrationRate;
          return current >= target * 1.02 ? 'excellent' : 
                 current >= target * 0.95 ? 'good' : 
                 current >= target * 0.85 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'Ekipman Kalibrasyon Modülü',
        description: 'Kalibre edilmiş ekipmanların toplam ekipmanlara oranı',
        isHigherBetter: true
      },
      {
        id: 'overdue_calibrations_count',
        name: 'Vadesi Geçen Kalibrasyon Sayısı',
        category: 'quality',
        currentValue: calibrationData.overdueEquipments,
        targetValue: getStoredTargetValue('overdue_calibrations_count', 3),
        unit: 'adet',
        trend: (() => {
          const previousValue = 5;
          const current = calibrationData.overdueEquipments;
          return current < previousValue ? 'down' : current > previousValue ? 'up' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('overdue_calibrations_count', 3);
          const current = calibrationData.overdueEquipments;
          return current <= target * 0.5 ? 'excellent' : 
                 current <= target ? 'good' : 
                 current <= target * 2 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'Ekipman Kalibrasyon Modülü',
        description: 'Kalibrasyon vadesi geçmiş ekipman sayısı',
        isHigherBetter: false
      },
      // ============================================
      // 🎯 KALCULO KPI'LARI - BİLEŞİK METRIKLER
      // ============================================
      {
        id: 'overall_quality_index',
        name: 'Genel Kalite İndeksi',
        category: 'quality',
        currentValue: (() => {
          // Tüm kalite KPI'larından bileşik indeks hesapla
          const qualityScore = (
            (tankTestData.successRate * 0.2) +
            (fanTestData.successRate * 0.2) +
            (dofData.closureRate * 0.15) +
            (supplierData.approvalRate * 0.15) +
            (internalAuditData.completionRate * 0.1) +
            (documentData.approvalRate * 0.1) +
            (calibrationData.calibrationRate * 0.1)
          );
          return Math.round(qualityScore);
        })(),
        targetValue: getStoredTargetValue('overall_quality_index', 90),
        unit: '/100',
        trend: (() => {
          const previousValue = 85;
          const current = (() => {
            const qualityScore = (
              (tankTestData.successRate * 0.2) +
              (fanTestData.successRate * 0.2) +
              (dofData.closureRate * 0.15) +
              (supplierData.approvalRate * 0.15) +
              (internalAuditData.completionRate * 0.1) +
              (documentData.approvalRate * 0.1) +
              (calibrationData.calibrationRate * 0.1)
            );
            return Math.round(qualityScore);
          })();
          return current > previousValue ? 'up' : current < previousValue ? 'down' : 'stable';
        })(),
        status: (() => {
          const target = getStoredTargetValue('overall_quality_index', 90);
          const current = (() => {
            const qualityScore = (
              (tankTestData.successRate * 0.2) +
              (fanTestData.successRate * 0.2) +
              (dofData.closureRate * 0.15) +
              (supplierData.approvalRate * 0.15) +
              (internalAuditData.completionRate * 0.1) +
              (documentData.approvalRate * 0.1) +
              (calibrationData.calibrationRate * 0.1)
            );
            return Math.round(qualityScore);
          })();
          return current >= target * 1.05 ? 'excellent' : 
                 current >= target * 0.95 ? 'good' : 
                 current >= target * 0.8 ? 'warning' : 'critical';
        })(),
        lastUpdated: new Date().toISOString(),
        dataSource: 'Kalite Yönetimi - Bileşik Hesaplama',
        description: 'Tüm kalite metriklerinden hesaplanan genel kalite performans indeksi',
        isHigherBetter: true
      }
    ];

    // Manuel KPI'ları ekle
    const manualKPIs = getManualKPIs();
    const allKPIs = [...calculatedKPIs, ...manualKPIs];

    setKPIs(allKPIs);

    // Modül durumlarını güncelle
    const moduleStatuses: ModuleIntegrationStatus[] = [
      {
        moduleName: 'Kalitesizlik Maliyeti',
        status: qualityCostData.recordCount > 0 ? 'connected' : 'disconnected',
        lastSync: new Date().toISOString(),
        recordCount: qualityCostData.recordCount,
        dataQuality: qualityCostData.dataQuality
      },
      {
        moduleName: 'DF ve 8D Yönetimi',
        status: dofData.totalDOF > 0 ? 'connected' : 'disconnected',
        lastSync: new Date().toISOString(),
        recordCount: dofData.totalDOF,
        dataQuality: dofData.dataQuality
      },
      {
        moduleName: 'Tank Sızdırmazlık Testi',
        status: tankTestData.totalTests > 0 ? 'connected' : 'disconnected',
        lastSync: new Date().toISOString(),
        recordCount: tankTestData.totalTests,
        dataQuality: tankTestData.dataQuality
      },
      {
        moduleName: 'Fan Test Analizi',
        status: fanTestData.totalTests > 0 ? 'connected' : 'disconnected',
        lastSync: new Date().toISOString(),
        recordCount: fanTestData.totalTests,
        dataQuality: fanTestData.dataQuality
      },
      {
        moduleName: 'Tedarikçi Kalite Yönetimi',
        status: (supplierData.totalSuppliers > 0 || supplierData.activeNonconformities > 0 || supplierData.activeDefects > 0) ? 'connected' : 'disconnected',
        lastSync: new Date().toISOString(),
        recordCount: supplierData.totalSuppliers + supplierData.activeNonconformities + supplierData.activeDefects,
        dataQuality: supplierData.dataQuality
      },
      {
        moduleName: 'Üretim Kalite Hata Takip',
        status: (productionData.totalVehicles > 0 || productionData.totalDefects > 0) ? 'connected' : 'disconnected',
        lastSync: new Date().toISOString(),
        recordCount: productionData.totalVehicles,
        dataQuality: productionData.dataQuality
      },
      {
        moduleName: 'İç Denetim Yönetimi',
        status: internalAuditData.totalAudits > 0 ? 'connected' : 'disconnected',
        lastSync: new Date().toISOString(),
        recordCount: internalAuditData.totalAudits,
        dataQuality: internalAuditData.dataQuality
      },
      {
        moduleName: 'Risk Yönetimi',
        status: riskData.totalRisks > 0 ? 'connected' : 'disconnected',
        lastSync: new Date().toISOString(),
        recordCount: riskData.totalRisks,
        dataQuality: riskData.dataQuality
      },
      {
        moduleName: 'Eğitim Yönetimi',
        status: trainingData.totalTrainings > 0 ? 'connected' : 'disconnected',
        lastSync: new Date().toISOString(),
        recordCount: trainingData.totalTrainings,
        dataQuality: trainingData.dataQuality
      },
      {
        moduleName: 'Doküman Yönetimi',
        status: documentData.totalDocuments > 0 ? 'connected' : 'disconnected',
        lastSync: new Date().toISOString(),
        recordCount: documentData.totalDocuments,
        dataQuality: documentData.dataQuality
      },
      {
        moduleName: 'Müşteri Geri Bildirim',
        status: customerFeedbackData.totalFeedbacks > 0 ? 'connected' : 'disconnected',
        lastSync: new Date().toISOString(),
        recordCount: customerFeedbackData.totalFeedbacks,
        dataQuality: customerFeedbackData.dataQuality
      },
      {
        moduleName: 'Ekipman Kalibrasyon',
        status: calibrationData.totalEquipments > 0 ? 'connected' : 'disconnected',
        lastSync: new Date().toISOString(),
        recordCount: calibrationData.totalEquipments,
        dataQuality: calibrationData.dataQuality
      }
    ];

    setModuleStatus(moduleStatuses);

    // Uyarılar oluştur
    const newAlerts: QualityAlert[] = [];

    // Kritik KPI uyarıları
    allKPIs.forEach(kpi => {
      if (kpi.status === 'critical') {
        newAlerts.push({
          id: `alert_${kpi.id}_${Date.now()}`,
          type: 'critical',
          title: `Kritik KPI Uyarısı: ${kpi.name}`,
          message: `${kpi.name} kritik seviyede (${kpi.currentValue}${kpi.unit}). Hedef: ${kpi.targetValue}${kpi.unit}`,
          source: kpi.dataSource,
          timestamp: new Date().toISOString(),
          isRead: false
        });
      } else if (kpi.status === 'warning') {
        newAlerts.push({
          id: `warning_${kpi.id}_${Date.now()}`,
          type: 'warning',
          title: `Uyarı: ${kpi.name}`,
          message: `${kpi.name} hedefin altında (${kpi.currentValue}${kpi.unit}). Hedef: ${kpi.targetValue}${kpi.unit}`,
          source: kpi.dataSource,
          timestamp: new Date().toISOString(),
          isRead: false
        });
      }
    });

    setAlerts(prev => [...newAlerts, ...prev.slice(0, 20)]); // Son 20 uyarıyı tut

    console.log('✅ Quality Management KPI hesaplama tamamlandı:', {
      kpiCount: allKPIs.length,
      alertCount: newAlerts.length,
      connectedModules: moduleStatuses.filter(m => m.status === 'connected').length,
      moduleDetails: moduleStatuses.map(m => ({ name: m.moduleName, status: m.status, records: m.recordCount }))
    });
  }, []);

  // İlk yükleme
  useEffect(() => {
    calculateKPIs();
  }, [calculateKPIs]);

  // Manual refresh trigger - localStorage değişikliklerini izle
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('📦 localStorage değişikliği tespit edildi, KPI\'lar yenileniyor...');
      setTimeout(() => calculateKPIs(), 100);
    };

    const handleSupplierDataUpdate = () => {
      console.log('🏭 Tedarikçi veri güncellemesi sinyali alındı, KPI\'lar yenileniyor...');
      setTimeout(() => calculateKPIs(), 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('supplierDataUpdated', handleSupplierDataUpdate);
    
    // Manual refresh interval for immediate updates
    const refreshInterval = setInterval(() => {
      console.log('⚡ Quality Management hızlı güncelleme tetiklendi...');
      calculateKPIs();
    }, 3000); // 3 saniyede bir hızlı güncelleme

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('supplierDataUpdated', handleSupplierDataUpdate);
      clearInterval(refreshInterval);
    };
  }, [calculateKPIs]);

  // ============================================
  // 🎨 EVENT HANDLERS
  // ============================================

  const handleKPIClick = (kpi: QualityKPI) => {
    setSelectedKPI(kpi);
    setKpiDetailDialog(true);
  };

  const handleEditTarget = () => {
    if (selectedKPI) {
      setNewTargetValue(selectedKPI.targetValue.toString());
      setEditTargetDialog(true);
    }
  };

  const handleSaveTarget = () => {
    if (selectedKPI && newTargetValue) {
      const newValue = parseFloat(newTargetValue);
      if (!isNaN(newValue)) {
        saveTargetValue(selectedKPI.id, newValue);
        
        // Manuel KPI ise currentValue'yu da güncelle
        if (selectedKPI.dataSource === 'Manuel Giriş') {
          const manualKPIs = getManualKPIs();
          const updatedKPIs = manualKPIs.map(kpi => 
            kpi.id === selectedKPI.id 
              ? { ...kpi, targetValue: newValue, lastUpdated: new Date().toISOString() }
              : kpi
          );
          saveManualKPIs(updatedKPIs);
        }
        
        // State'i güncelle ve yeniden hesapla
        setTimeout(() => {
          calculateKPIs();
          setEditTargetDialog(false);
          setNewTargetValue('');
        }, 100);
      }
    }
  };

  const handleEditValue = () => {
    if (selectedKPI) {
      setNewCurrentValue(selectedKPI.currentValue.toString());
      setEditValueDialog(true);
    }
  };

  const handleSaveValue = () => {
    if (selectedKPI && newCurrentValue && selectedKPI.dataSource === 'Manuel Giriş') {
      const newValue = parseFloat(newCurrentValue);
      if (!isNaN(newValue)) {
        const manualKPIs = getManualKPIs();
        const updatedKPIs = manualKPIs.map(kpi => 
          kpi.id === selectedKPI.id 
            ? { 
                ...kpi, 
                currentValue: newValue,
                lastUpdated: new Date().toISOString(),
                trend: (newValue > kpi.currentValue ? 'up' : newValue < kpi.currentValue ? 'down' : 'stable') as 'up' | 'down' | 'stable',
                status: (kpi.isHigherBetter 
                  ? (newValue >= kpi.targetValue * 0.95 ? 'excellent' : 
                     newValue >= kpi.targetValue * 0.8 ? 'good' : 
                     newValue >= kpi.targetValue * 0.6 ? 'warning' : 'critical')
                  : (newValue <= kpi.targetValue * 1.05 ? 'excellent' : 
                     newValue <= kpi.targetValue * 1.2 ? 'good' : 
                     newValue <= kpi.targetValue * 1.4 ? 'warning' : 'critical')) as 'excellent' | 'good' | 'warning' | 'critical'
              }
            : kpi
        );
        saveManualKPIs(updatedKPIs);
        
        setTimeout(() => {
          calculateKPIs();
          setEditValueDialog(false);
          setNewCurrentValue('');
        }, 100);
      }
    }
  };

  const handleAddKPI = () => {
    if (newKPI.name && newKPI.targetValue && newKPI.unit) {
      const manualKPIs = getManualKPIs();
      const kpiToAdd: QualityKPI = {
        id: `manual_${Date.now()}`,
        name: newKPI.name,
        category: newKPI.category,
        currentValue: 0,
        targetValue: parseFloat(newKPI.targetValue),
        unit: newKPI.unit,
        trend: 'stable',
        status: 'warning',
        lastUpdated: new Date().toISOString(),
        dataSource: 'Manuel Giriş',
        description: newKPI.description || 'Manuel olarak oluşturulan KPI',
        isHigherBetter: newKPI.isHigherBetter
      };
      
      saveManualKPIs([...manualKPIs, kpiToAdd]);
      calculateKPIs();
      setAddKpiDialog(false);
      setNewKPI({
        name: '',
        category: 'quality',
        targetValue: '',
        unit: '',
        description: '',
        isHigherBetter: true
      });
    }
  };

  // ============================================
  // 🎨 UI COMPONENTS
  // ============================================

  const KPICard: React.FC<{ kpi: QualityKPI }> = ({ kpi }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'excellent': return '#4caf50';
        case 'good': return '#8bc34a';
        case 'warning': return '#ff9800';
        case 'critical': return '#f44336';
        default: return '#9e9e9e';
      }
    };

    const getTrendIcon = (trend: string) => {
      // isHigherBetter mantığına göre renk belirleme
      if (kpi.isHigherBetter) {
        // Yüksek daha iyi: UP yeşil, DOWN kırmızı
        switch (trend) {
          case 'up': return <TrendingUpIcon sx={{ color: '#4caf50', fontSize: '1.8rem' }} />;
          case 'down': return <TrendingDownIcon sx={{ color: '#f44336', fontSize: '1.8rem' }} />;
          default: return <InfoIcon sx={{ color: '#9e9e9e', fontSize: '1.8rem' }} />;
        }
      } else {
        // Düşük daha iyi: DOWN yeşil, UP kırmızı
        switch (trend) {
          case 'up': return <TrendingUpIcon sx={{ color: '#f44336', fontSize: '1.8rem' }} />;
          case 'down': return <TrendingDownIcon sx={{ color: '#4caf50', fontSize: '1.8rem' }} />;
          default: return <InfoIcon sx={{ color: '#9e9e9e', fontSize: '1.8rem' }} />;
        }
      }
    };

    const progress = (() => {
      if (kpi.isHigherBetter) {
        // Yüksek daha iyi: currentValue/targetValue oranı
        return Math.min((kpi.currentValue / kpi.targetValue) * 100, 100);
      } else {
        // Düşük daha iyi (maliyet): Ters oran - düşük maliyet = yüksek progress
        // 93.111 / 100.000 = 0.931 -> progress = 100 - 93.1 = 6.9% başarı göstergesi değil
        // Daha iyi gösterim: 100 - (currentValue/targetValue * 100)
        if (kpi.currentValue <= kpi.targetValue) {
          // Hedef altında: tasarruf oranını progress olarak göster
          return Math.min(100 - ((kpi.currentValue / kpi.targetValue) * 100), 100);
        } else {
          // Hedef üstünde: negatif progress (kırmızı)
          return Math.max(100 - ((kpi.currentValue / kpi.targetValue) * 100), 0);
        }
      }
    })();

    const getPerformancePercentage = () => {
      if (kpi.isHigherBetter) {
        // Yüksek daha iyi: currentValue/targetValue * 100
        return Math.min((kpi.currentValue / kpi.targetValue) * 100, 150);
      } else {
        // Düşük daha iyi (maliyet): Gerçek performans yüzdesi
        // 93.111 / 100.000 = 93.1% (hedefin %93.1'i kadar maliyet)
        return Math.min((kpi.currentValue / kpi.targetValue) * 100, 150);
      }
    };

    const getCategoryLabel = (category: string) => {
      switch (category) {
        case 'quality': return 'KALİTE';
        case 'cost': return 'MALİYET';
        case 'delivery': return 'TESLİMAT';
        case 'safety': return 'GÜVENLİK';
        case 'environment': return 'ÇEVRE';
        case 'efficiency': return 'VERİMLİLİK';
        case 'satisfaction': return 'MEMNUNİYET';
        case 'innovation': return 'İNOVASYON';
        default: return category.toUpperCase();
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'excellent': return 'MÜKEMMEL';
        case 'good': return 'İYİ';
        case 'warning': return 'UYARI';
        case 'critical': return 'KRİTİK';
        default: return status.toUpperCase();
      }
    };

    return (
      <Card 
        sx={{ 
          height: '100%', 
          border: `3px solid ${getStatusColor(kpi.status)}`,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${getStatusColor(kpi.status)}08 0%, ${getStatusColor(kpi.status)}03 100%)`,
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: `0 12px 30px ${getStatusColor(kpi.status)}40`,
            border: `3px solid ${getStatusColor(kpi.status)}`
          }
        }}
        onClick={() => handleKPIClick(kpi)}
      >
        {/* Status indicator bar */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: `linear-gradient(90deg, ${getStatusColor(kpi.status)} 0%, ${getStatusColor(kpi.status)}80 100%)`
          }}
        />
        
        <CardContent sx={{ pt: 3 }}>
          {/* Header with category and status */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Chip 
                label={getCategoryLabel(kpi.category)} 
                size="small" 
                sx={{ 
                  backgroundColor: getStatusColor(kpi.status), 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.7rem'
                }}
              />
              <Chip 
                label={getStatusLabel(kpi.status)} 
                size="small" 
                variant="outlined"
                sx={{ 
                  borderColor: getStatusColor(kpi.status),
                  color: getStatusColor(kpi.status),
                  fontWeight: 'bold'
                }}
              />
            </Box>
            <Box display="flex" flexDirection="column" alignItems="center">
              {getTrendIcon(kpi.trend)}
              <Typography 
                variant="caption" 
                sx={{ 
                  mt: 0.5, 
                  fontWeight: 'bold',
                  color: (() => {
                    if (kpi.trend === 'stable') return '#9e9e9e';
                    
                    // Yüksek daha iyi KPI'lar için
                    if (kpi.isHigherBetter) {
                      return kpi.trend === 'up' ? '#4caf50' : '#f44336';
                    } 
                    // Düşük daha iyi KPI'lar için (maliyet, hata oranı vs.)
                    else {
                      return kpi.trend === 'down' ? '#4caf50' : '#f44336';
                    }
                  })()
                }}
              >
                {kpi.trend === 'up' ? (kpi.isHigherBetter ? 'Artış (İyi)' : 'Artış (Kötü)') : 
                 kpi.trend === 'down' ? (kpi.isHigherBetter ? 'Azalış (Kötü)' : 'Azalış (İyi)') : 
                 'Stabil'}
              </Typography>
            </Box>
          </Box>
          
          {/* KPI Name */}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontSize: '1.1rem', 
              fontWeight: 700,
              mb: 2.5,
              lineHeight: 1.3,
              color: 'text.primary',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {kpi.name}
          </Typography>
          
          {/* Main Value Display */}
          <Box display="flex" alignItems="baseline" justifyContent="center" mb={2}>
            <Typography 
              variant="h3" 
              component="div" 
              sx={{ 
                color: getStatusColor(kpi.status), 
                fontWeight: 'bold',
                fontFamily: 'monospace',
                textShadow: `0 2px 4px ${getStatusColor(kpi.status)}30`
              }}
            >
              {kpi.currentValue.toLocaleString('tr-TR', {
                minimumFractionDigits: kpi.unit === '%' ? 1 : 0,
                maximumFractionDigits: kpi.unit === '%' ? 1 : 0
              })}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                ml: 1, 
                color: 'text.secondary',
                fontWeight: 'medium' 
              }}
            >
              {kpi.unit}
            </Typography>
          </Box>
          
          {/* Target and Performance */}
          <Box mb={2.5}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                Hedef: {kpi.targetValue.toLocaleString('tr-TR')} {kpi.unit}
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight="bold"
                sx={{ 
                  color: getStatusColor(kpi.status),
                  padding: '2px 8px',
                  borderRadius: 2,
                  backgroundColor: `${getStatusColor(kpi.status)}15`
                }}
              >
                {getPerformancePercentage().toFixed(0)}%
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={Math.min(progress, 100)} 
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: 'rgba(0,0,0,0.08)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getStatusColor(kpi.status),
                  borderRadius: 6,
                  transition: 'all 0.3s ease'
                }
              }}
            />
            
            {(() => {
              // Hedef aşılma kontrolü: KPI tipine göre farklı mantık
              const performancePercent = getPerformancePercentage();
              
              if (kpi.isHigherBetter) {
                // Yüksek daha iyi: %100'den fazlaysa hedef aşıldı
                return performancePercent > 100;
              } else {
                // Düşük daha iyi (maliyet): gerçek değer hedeften düşükse başarı
                return kpi.currentValue < kpi.targetValue;
              }
            })() && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#4caf50', 
                  fontWeight: 'bold', 
                  mt: 0.5,
                  display: 'block'
                }}
              >
                {kpi.isHigherBetter ? 'Hedef aşıldı!' : 'Hedef altında! (Başarılı)'}
              </Typography>
            )}
          </Box>
          
          {/* Data Source and Last Update */}
          <Box 
            sx={{ 
              borderTop: '1px solid rgba(0,0,0,0.08)', 
              pt: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5
            }}
          >
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 'medium',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              Kaynak: {kpi.dataSource}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontWeight: 'medium' }}
            >
              Güncelleme: {new Date(kpi.lastUpdated).toLocaleString('tr-TR')}
            </Typography>
          </Box>

          {/* Description Preview */}
                        {kpi.description && (
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    display: 'block',
                    mt: 1,
                    fontStyle: 'italic',
                    opacity: 0.8,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {kpi.description}
                </Typography>
              )}
        </CardContent>
      </Card>
    );
  };

  const ModuleStatusCard: React.FC<{ module: ModuleIntegrationStatus }> = ({ module }) => {
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'connected': return <CheckCircleIcon color="success" />;
        case 'disconnected': return <ErrorIcon color="error" />;
        case 'error': return <WarningIcon color="warning" />;
        default: return <ErrorIcon color="disabled" />;
      }
    };

    const getQualityColor = (quality: string) => {
      switch (quality) {
        case 'high': return '#4caf50';
        case 'medium': return '#ff9800';
        case 'low': return '#f44336';
        default: return '#9e9e9e';
      }
    };

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
              {module.moduleName}
            </Typography>
            {getStatusIcon(module.status)}
          </Box>
          
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Kayıt Sayısı: {module.recordCount.toLocaleString('tr-TR')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Son Senkronizasyon: {new Date(module.lastSync).toLocaleTimeString('tr-TR')}
            </Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Chip 
                label={`Veri Kalitesi: ${module.dataQuality === 'high' ? 'Yüksek' : module.dataQuality === 'medium' ? 'Orta' : 'Düşük'}`}
                size="small"
                sx={{ 
                  backgroundColor: getQualityColor(module.dataQuality), 
                  color: 'white' 
                }}
              />
              <Chip 
                label={module.status === 'connected' ? 'Bağlı' : module.status === 'disconnected' ? 'Bağlantısız' : 'Hata'}
                size="small"
                color={module.status === 'connected' ? 'success' : 'error'}
              />
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Ana dashboard
  const DashboardTab = () => (
    <Box>
      {/* KPI Kartları */}
      
      <Grid container spacing={3} mb={4}>
        {kpis.map((kpi) => (
          <Grid item xs={12} sm={6} md={4} key={kpi.id}>
            <KPICard kpi={kpi} />
          </Grid>
        ))}
      </Grid>


    </Box>
  );

  // Modül entegrasyonu sekmesi
  const ModuleIntegrationTab = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Modül Entegrasyon Durumu
      </Typography>
      
      <Grid container spacing={3}>
        {moduleStatus.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <ModuleStatusCard module={module} />
          </Grid>
        ))}
      </Grid>

      <Box mt={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Entegrasyon Özeti
            </Typography>
            <Box display="flex" justifyContent="space-around" flexWrap="wrap" gap={2}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {moduleStatus.filter(m => m.status === 'connected').length}
                </Typography>
                <Typography variant="body2">Bağlı Modül</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" color="error.main">
                  {moduleStatus.filter(m => m.status === 'disconnected').length}
                </Typography>
                <Typography variant="body2">Bağlantısız Modül</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" color="primary.main">
                  {moduleStatus.reduce((sum, m) => sum + m.recordCount, 0).toLocaleString('tr-TR')}
                </Typography>
                <Typography variant="body2">Toplam Kayıt</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" color="info.main">
                  {moduleStatus.filter(m => m.dataQuality === 'high').length}
                </Typography>
                <Typography variant="body2">Yüksek Kalite Veri</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  // Uyarılar sekmesi
  const AlertsTab = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Kalite Uyarıları
      </Typography>
      
      {alerts.length === 0 ? (
        <Alert severity="success">
          Herhangi bir uyarı bulunmuyor. Tüm sistemler normal çalışıyor.
        </Alert>
      ) : (
        <List>
          {alerts.map((alert) => (
            <ListItem key={alert.id} divider>
              <ListItemIcon>
                {alert.type === 'critical' ? <ErrorIcon color="error" /> :
                 alert.type === 'warning' ? <WarningIcon color="warning" /> :
                 <InfoIcon color="info" />}
              </ListItemIcon>
              <ListItemText
                primary={alert.title}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {alert.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Kaynak: {alert.source} | {new Date(alert.timestamp).toLocaleString('tr-TR')}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );

  return (
    <Box p={3}>



      {/* Tab Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<DashboardIcon />} label="Dashboard" />
          <Tab icon={<AssessmentIcon />} label="Modül Entegrasyonu" />
          <Tab icon={<NotificationIcon />} label={`Uyarılar (${alerts.filter(a => !a.isRead).length})`} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && <DashboardTab />}
      {activeTab === 1 && <ModuleIntegrationTab />}
      {activeTab === 2 && <AlertsTab />}

      {/* KPI Detay Dialog */}
      <Dialog 
        open={kpiDetailDialog} 
        onClose={() => setKpiDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedKPI?.name} - Detaylar
        </DialogTitle>
        <DialogContent>
          {selectedKPI && (
            <Box>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Mevcut Değer:</Typography>
                  <Typography variant="h5" color="primary">
                    {selectedKPI.currentValue.toLocaleString('tr-TR')} {selectedKPI.unit}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Hedef Değer:</Typography>
                  <Typography variant="h5" color="secondary">
                    {selectedKPI.targetValue.toLocaleString('tr-TR')} {selectedKPI.unit}
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle2" gutterBottom>Açıklama:</Typography>
              <Typography variant="body2" paragraph>
                {selectedKPI.description}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>Veri Kaynağı:</Typography>
              <Typography variant="body2" paragraph>
                {selectedKPI.dataSource}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>Hedef Yönü:</Typography>
              <Chip 
                label={selectedKPI.isHigherBetter ? 'Yüksek Daha İyi' : 'Düşük Daha İyi'} 
                color={selectedKPI.isHigherBetter ? 'primary' : 'secondary'}
                icon={selectedKPI.isHigherBetter ? <TrendingUpIcon /> : <TrendingDownIcon />}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="subtitle2" gutterBottom>Son Güncelleme:</Typography>
              <Typography variant="body2">
                {new Date(selectedKPI.lastUpdated).toLocaleString('tr-TR')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditTarget} startIcon={<EditIcon />}>
            Hedef Değiştir
          </Button>
          {selectedKPI?.dataSource === 'Manuel Giriş' && (
            <Button onClick={handleEditValue} startIcon={<EditIcon />} color="secondary">
              Veri Gir
            </Button>
          )}
          <Button onClick={() => setKpiDetailDialog(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hedef Düzenleme Dialog */}
      <Dialog open={editTargetDialog} onClose={() => setEditTargetDialog(false)}>
        <DialogTitle>Hedef Değer Düzenle</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Yeni Hedef Değer"
            type="number"
            fullWidth
            variant="outlined"
            value={newTargetValue}
            onChange={(e) => setNewTargetValue(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTargetDialog(false)}>İptal</Button>
          <Button onClick={handleSaveTarget} startIcon={<SaveIcon />}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Veri Girme Dialog */}
      <Dialog open={editValueDialog} onClose={() => setEditValueDialog(false)}>
        <DialogTitle>Mevcut Değer Düzenle</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Yeni Mevcut Değer"
            type="number"
            fullWidth
            variant="outlined"
            value={newCurrentValue}
            onChange={(e) => setNewCurrentValue(e.target.value)}
            sx={{ mt: 2 }}
            helperText={selectedKPI && `Birim: ${selectedKPI.unit} | Hedef: ${selectedKPI.targetValue.toLocaleString('tr-TR')}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditValueDialog(false)}>İptal</Button>
          <Button onClick={handleSaveValue} startIcon={<SaveIcon />}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Yeni KPI Ekleme Dialog */}
      <Dialog open={addKpiDialog} onClose={() => setAddKpiDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni KPI Ekle</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="KPI Adı"
            fullWidth
            variant="outlined"
            value={newKPI.name}
            onChange={(e) => setNewKPI({...newKPI, name: e.target.value})}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Kategori</InputLabel>
            <Select
              value={newKPI.category}
              onChange={(e) => setNewKPI({...newKPI, category: e.target.value as any})}
              label="Kategori"
            >
              <MenuItem value="quality">Kalite</MenuItem>
              <MenuItem value="cost">Maliyet</MenuItem>
              <MenuItem value="delivery">Teslimat</MenuItem>
              <MenuItem value="safety">Güvenlik</MenuItem>
              <MenuItem value="environment">Çevre</MenuItem>
              <MenuItem value="efficiency">Verimlilik</MenuItem>
              <MenuItem value="satisfaction">Memnuniyet</MenuItem>
              <MenuItem value="innovation">İnovasyon</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Birim</InputLabel>
            <Select
              value={newKPI.unit}
              onChange={(e) => setNewKPI({...newKPI, unit: e.target.value})}
              label="Birim"
            >
              <MenuItem value="%">% (Yüzde)</MenuItem>
              <MenuItem value="₺">₺ (Türk Lirası)</MenuItem>
              <MenuItem value="€">€ (Euro)</MenuItem>
              <MenuItem value="$">$ (Dolar)</MenuItem>
              <MenuItem value="adet">Adet</MenuItem>
              <MenuItem value="gün">Gün</MenuItem>
              <MenuItem value="saat">Saat</MenuItem>
              <MenuItem value="kg">Kilogram</MenuItem>
              <MenuItem value="ton">Ton</MenuItem>
              <MenuItem value="m²">Metrekare</MenuItem>
              <MenuItem value="m³">Metreküp</MenuItem>
              <MenuItem value="ppm">PPM</MenuItem>
              <MenuItem value="pcs">Parça</MenuItem>
              <MenuItem value="lot">Lot</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Hedef Yön</InputLabel>
            <Select
              value={newKPI.isHigherBetter ? 'true' : 'false'}
              onChange={(e) => setNewKPI({...newKPI, isHigherBetter: e.target.value === 'true'})}
              label="Hedef Yön"
            >
              <MenuItem value="true">Yüksek Daha İyi</MenuItem>
              <MenuItem value="false">Düşük Daha İyi</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Hedef Değer"
            type="number"
            fullWidth
            variant="outlined"
            value={newKPI.targetValue}
            onChange={(e) => setNewKPI({...newKPI, targetValue: e.target.value})}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Açıklama"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newKPI.description}
            onChange={(e) => setNewKPI({...newKPI, description: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddKpiDialog(false)}>İptal</Button>
          <Button onClick={handleAddKPI} startIcon={<SaveIcon />}>
            KPI Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* KPI Ekleme FAB */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setAddKpiDialog(true)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default QualityManagement; 