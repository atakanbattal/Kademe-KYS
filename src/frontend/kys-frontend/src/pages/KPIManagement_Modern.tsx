/**
 * ✅ Context7 Best Practice: Modern KPI Management Dashboard
 * Auto-integrated data, equal-sized cards, with advanced analytics
 * Real-time monitoring with minimal UI complexity
 */

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  TextField,
  InputAdornment,
  Alert,
  FormControlLabel,
  Switch,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  Skeleton,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';

import {
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  FileDownload as ExportIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,

  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  IntegrationInstructions as IntegrationInstructionsIcon
} from '@mui/icons-material';

// ✅ Context7 Best Practice: Recharts for data visualization
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// ✅ Context7 Best Practice: Type-safe interfaces
interface KPIHistoricalData {
  period: string;  // YYYY-MM for months, YYYY-Q1/Q2/Q3/Q4 for quarters
  value: number;
  targetValue: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface KPI {
  id: string;
  title: string;
  description: string;
  category: 'quality' | 'production' | 'cost' | 'supplier' | 'document' | 'safety' | 'efficiency';
  department: string;
  responsible: string;
  unit: string;
  measurementPeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dataType: 'automatic' | 'manual';
  dataSource: string;
  targetValue: number;
  currentValue: number;
  previousValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  isIncreasing: boolean;
  lastUpdated: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  isFavorite: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  moduleSource: string;
  progress: number;
  historicalData: KPIHistoricalData[];
}



// ✅ Context7 Best Practice: Historical data generator (2025 centered)
const generateHistoricalData = (kpiId: string, baseValue: number, targetValue: number): KPIHistoricalData[] => {
  const data: KPIHistoricalData[] = [];
  
  // Generate last 12 months data starting from 2025
  const currentDate = new Date(2025, 11, 31); // December 2025 as current
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Simulate realistic variance around base value
    const variance = (Math.random() - 0.5) * 0.3 * baseValue;
    const value = Math.max(0, baseValue + variance);
    
    const getStatus = (val: number, target: number): 'excellent' | 'good' | 'warning' | 'critical' => {
      const ratio = val / target;
      if (kpiId.includes('safety')) { // Lower is better for safety incidents
        if (val <= target * 0.5) return 'excellent';
        if (val <= target) return 'good';
        if (val <= target * 1.5) return 'warning';
        return 'critical';
      } else { // Higher is better for most KPIs
        if (ratio >= 1.1) return 'excellent';
        if (ratio >= 0.9) return 'good';
        if (ratio >= 0.7) return 'warning';
        return 'critical';
      }
    };
    
    const getTrend = (currentVal: number, previousVal: number): 'up' | 'down' | 'stable' => {
      const diff = currentVal - previousVal;
      if (Math.abs(diff) < currentVal * 0.05) return 'stable';
      return diff > 0 ? 'up' : 'down';
    };
    
    const previousValue = data.length > 0 ? data[data.length - 1].value : baseValue;
    
    data.push({
      period,
      value: Math.round(value * 100) / 100,
      targetValue,
      status: getStatus(value, targetValue),
      trend: getTrend(value, previousValue)
    });
  }
  
  // Generate quarterly data for 2024-2025
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  
  for (let year = 2024; year <= 2025; year++) {
    quarters.forEach((quarter, qIndex) => {
      const period = `${year}-${quarter}`;
      const quarterlyValue = baseValue + (Math.random() - 0.5) * 0.2 * baseValue;
      const value = Math.max(0, quarterlyValue);
      
      data.push({
        period,
        value: Math.round(value * 100) / 100,
        targetValue,
        status: value >= targetValue * 0.9 ? 'good' : value >= targetValue * 0.7 ? 'warning' : 'critical',
        trend: Math.random() > 0.5 ? 'up' : 'down'
      });
    });
  }
  
  return data;
};

// ✅ Context7 Best Practice: Category label mapping
const getCategoryLabel = (category: string): string => {
  const categoryMap: Record<string, string> = {
    quality: 'Kalite',
    production: 'Üretim',
    cost: 'Maliyet',
    supplier: 'Tedarikçi',
    document: 'Doküman',
    safety: 'Güvenlik',
    efficiency: 'Verimlilik'
  };
  return categoryMap[category] || category;
};

// ✅ Context7 Best Practice: Simulated module integration
const generateIntegratedKPIs = (): KPI[] => {
  const currentTime = new Date().toISOString();
  
  // ✅ KALİTESİZLİK MALİYETİ VERİLERİ - QualityCostManagement'tan
  const getQualityCostKPIs = (): KPI[] => {
    try {
      const costData = JSON.parse(localStorage.getItem('kys-cost-management-data') || '[]');
      
      // Toplam maliyet
      const totalCost = costData.reduce((sum: number, item: any) => sum + (item.maliyet || 0), 0);
      
      // Bu ay maliyeti (dinamik)
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const thisMonthCost = costData
        .filter((item: any) => {
          const itemDate = new Date(item.tarih);
          return itemDate.getMonth() + 1 === currentMonth && itemDate.getFullYear() === currentYear;
        })
        .reduce((sum: number, item: any) => sum + (item.maliyet || 0), 0);
      
      // Geçen ay maliyeti
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const lastMonthCost = costData
        .filter((item: any) => {
          const itemDate = new Date(item.tarih);
          return itemDate.getMonth() + 1 === lastMonth && itemDate.getFullYear() === lastMonthYear;
        })
        .reduce((sum: number, item: any) => sum + (item.maliyet || 0), 0);
      
      // COPQ kategorileri
      const copqMapping: { [key: string]: string } = {
        'hurda': 'İç Hata',
        'yeniden_islem': 'İç Hata',
        'fire': 'İç Hata',
        'test': 'Değerlendirme',
        'denetim': 'Değerlendirme',
        'garanti': 'Dış Hata',
        'iade': 'Dış Hata',
        'sikayet': 'Dış Hata',
        'egitim': 'Önleme',
        'onleme': 'Önleme'
      };
      
      const copqBreakdown = costData.reduce((acc: any, item: any) => {
        const category = copqMapping[item.maliyetTuru] || 'İç Hata';
        acc[category] = (acc[category] || 0) + item.maliyet;
        return acc;
      }, {});
      
      const internalFailureCost = copqBreakdown['İç Hata'] || 0;
      const externalFailureCost = copqBreakdown['Dış Hata'] || 0;
      
      console.log('📊 KPI Integration - Quality Cost Data:', {
        totalRecords: costData.length,
        totalCost,
        thisMonthCost,
        lastMonthCost,
        copqBreakdown
      });
      
      return [
        {
          id: 'quality-cost-total',
          title: 'Toplam Kalitesizlik Maliyeti',
          description: 'Tüm kalitesizlik türlerinin toplam maliyeti',
          category: 'cost',
          department: 'Kalite Kontrol',
          responsible: 'Kalite Müdürü',
          unit: '₺',
          measurementPeriod: 'monthly',
          dataType: 'automatic',
          dataSource: 'Kalitesizlik Maliyet Modülü',
          targetValue: 50000,
          currentValue: totalCost,
          previousValue: lastMonthCost || totalCost * 0.9,
          warningThreshold: 75000,
          criticalThreshold: 100000,
          isIncreasing: false,
          lastUpdated: currentTime,
          status: totalCost <= 50000 ? 'excellent' : totalCost <= 75000 ? 'good' : totalCost <= 100000 ? 'warning' : 'critical',
          trend: thisMonthCost > lastMonthCost ? 'up' : thisMonthCost < lastMonthCost ? 'down' : 'stable',
          isFavorite: true,
          isActive: true,
          createdAt: currentTime,
          updatedAt: currentTime,
          moduleSource: 'QualityCostManagement',
          progress: Math.max(0, Math.min(100, ((50000 - totalCost) / 50000) * 100)),
          historicalData: generateHistoricalData('quality-cost-total', totalCost, 50000)
        },
        {
          id: 'internal-failure-cost',
          title: 'İç Hata Maliyeti',
          description: 'Hurda, yeniden işleme, fire maliyetleri',
          category: 'cost',
          department: 'Üretim',
          responsible: 'Üretim Müdürü',
          unit: '₺',
          measurementPeriod: 'monthly',
          dataType: 'automatic',
          dataSource: 'Kalitesizlik Maliyet Modülü',
          targetValue: 25000,
          currentValue: internalFailureCost,
          previousValue: internalFailureCost * 0.95,
          warningThreshold: 35000,
          criticalThreshold: 50000,
          isIncreasing: false,
          lastUpdated: currentTime,
          status: internalFailureCost <= 25000 ? 'excellent' : internalFailureCost <= 35000 ? 'good' : internalFailureCost <= 50000 ? 'warning' : 'critical',
          trend: 'down',
          isFavorite: false,
          isActive: true,
          createdAt: currentTime,
          updatedAt: currentTime,
          moduleSource: 'QualityCostManagement',
          progress: Math.max(0, Math.min(100, ((25000 - internalFailureCost) / 25000) * 100)),
          historicalData: generateHistoricalData('internal-failure-cost', internalFailureCost, 25000)
        }
      ];
    } catch (error) {
      console.error('❌ Quality Cost KPI integration error:', error);
      return [];
    }
  };

  // ✅ TEDARİKÇİ KALİTE VERİLERİ - SupplierQualityManagement'tan
  const getSupplierQualityKPIs = (): KPI[] => {
    try {
      // Suppliers verisi genellikle component state'inde olduğu için localStorage'da olmayabilir
      // Alternativ olarak nonconformities ve defects verilerini kullanabiliriz
      const nonconformities = JSON.parse(localStorage.getItem('supplier-nonconformities') || '[]');
      const defects = JSON.parse(localStorage.getItem('supplier-defects') || '[]');
      
      // Açık uygunsuzluk sayısı
      const openNonconformities = nonconformities.filter((nc: any) => nc.status === 'açık').length;
      const totalNonconformities = nonconformities.length;
      
      // Açık hata sayısı
      const openDefects = defects.filter((d: any) => d.status === 'açık').length;
      const totalDefects = defects.length;
      
      // Çözüm oranı
      const resolutionRate = totalNonconformities > 0 ? 
        ((totalNonconformities - openNonconformities) / totalNonconformities) * 100 : 100;
      
      console.log('📊 KPI Integration - Supplier Quality Data:', {
        totalNonconformities,
        openNonconformities,
        totalDefects,
        openDefects,
        resolutionRate
      });
      
      return [
        {
          id: 'supplier-nonconformity-rate',
          title: 'Tedarikçi Uygunsuzluk Oranı',
          description: 'Açık tedarikçi uygunsuzluklarının toplam içindeki oranı',
          category: 'supplier',
          department: 'Satın Alma',
          responsible: 'Satın Alma Müdürü',
          unit: '%',
          measurementPeriod: 'monthly',
          dataType: 'automatic',
          dataSource: 'Tedarikçi Kalite Modülü',
          targetValue: 5,
          currentValue: totalNonconformities > 0 ? (openNonconformities / totalNonconformities) * 100 : 0,
          previousValue: 8.5,
          warningThreshold: 10,
          criticalThreshold: 15,
          isIncreasing: false,
          lastUpdated: currentTime,
          status: (openNonconformities / Math.max(totalNonconformities, 1)) * 100 <= 5 ? 'excellent' : 
                  (openNonconformities / Math.max(totalNonconformities, 1)) * 100 <= 10 ? 'good' : 
                  (openNonconformities / Math.max(totalNonconformities, 1)) * 100 <= 15 ? 'warning' : 'critical',
          trend: 'down',
          isFavorite: true,
          isActive: true,
          createdAt: currentTime,
          updatedAt: currentTime,
          moduleSource: 'SupplierQualityManagement',
          progress: Math.max(0, 100 - ((openNonconformities / Math.max(totalNonconformities, 1)) * 100 * 20)),
          historicalData: generateHistoricalData('supplier-nonconformity-rate', (openNonconformities / Math.max(totalNonconformities, 1)) * 100, 5)
        },
        {
          id: 'supplier-resolution-rate',
          title: 'Tedarikçi Çözüm Oranı',
          description: 'Kapatılan uygunsuzlukların toplam içindeki oranı',
          category: 'supplier',
          department: 'Satın Alma',
          responsible: 'Kalite Sorumlusu',
          unit: '%',
          measurementPeriod: 'monthly',
          dataType: 'automatic',
          dataSource: 'Tedarikçi Kalite Modülü',
          targetValue: 95,
          currentValue: resolutionRate,
          previousValue: 92,
          warningThreshold: 85,
          criticalThreshold: 75,
          isIncreasing: true,
          lastUpdated: currentTime,
          status: resolutionRate >= 95 ? 'excellent' : resolutionRate >= 85 ? 'good' : resolutionRate >= 75 ? 'warning' : 'critical',
          trend: 'up',
          isFavorite: false,
          isActive: true,
          createdAt: currentTime,
          updatedAt: currentTime,
          moduleSource: 'SupplierQualityManagement',
          progress: resolutionRate,
          historicalData: generateHistoricalData('supplier-resolution-rate', resolutionRate, 95)
        }
      ];
    } catch (error) {
      console.error('❌ Supplier Quality KPI integration error:', error);
      return [];
    }
  };

  // ✅ DÖF/8D VERİLERİ - DOF8DManagement'tan
  const getDOFKPIs = (): KPI[] => {
    try {
      const dofRecords = JSON.parse(localStorage.getItem('dofRecords') || '[]');
      
      const totalDOF = dofRecords.length;
      const openDOF = dofRecords.filter((dof: any) => dof.status !== 'closed').length;
      const closedDOF = dofRecords.filter((dof: any) => dof.status === 'closed').length;
      const overdueDOF = dofRecords.filter((dof: any) => {
        if (dof.status === 'closed') return false;
        const dueDate = new Date(dof.dueDate);
        const today = new Date();
        return dueDate < today;
      }).length;
      
      const closureRate = totalDOF > 0 ? (closedDOF / totalDOF) * 100 : 100;
      
      // Ortalama kapanma süresi (gün)
      const avgClosureTime = closedDOF > 0 ? 
        Math.round(dofRecords
          .filter((dof: any) => dof.status === 'closed' && dof.closedDate && dof.createdDate)
          .reduce((acc: number, dof: any) => {
            const days = Math.abs(new Date(dof.closedDate).getTime() - new Date(dof.createdDate).getTime()) / (1000 * 60 * 60 * 24);
            return acc + days;
          }, 0) / closedDOF) : 0;
      
      console.log('📊 KPI Integration - DOF Data:', {
        totalDOF,
        openDOF,
        closedDOF,
        overdueDOF,
        closureRate,
        avgClosureTime
      });
      
      return [
        {
          id: 'dof-closure-rate',
          title: 'DÖF Kapanma Oranı',
          description: 'Kapatılan DÖF kayıtlarının toplam içindeki oranı',
          category: 'quality',
          department: 'Kalite Güvence',
          responsible: 'Kalite Müdürü',
          unit: '%',
          measurementPeriod: 'monthly',
          dataType: 'automatic',
          dataSource: 'DÖF ve 8D Modülü',
          targetValue: 90,
          currentValue: closureRate,
          previousValue: 87,
          warningThreshold: 80,
          criticalThreshold: 70,
          isIncreasing: true,
          lastUpdated: currentTime,
          status: closureRate >= 90 ? 'excellent' : closureRate >= 80 ? 'good' : closureRate >= 70 ? 'warning' : 'critical',
          trend: closureRate > 87 ? 'up' : closureRate < 87 ? 'down' : 'stable',
          isFavorite: true,
          isActive: true,
          createdAt: currentTime,
          updatedAt: currentTime,
          moduleSource: 'DOF8DManagement',
          progress: Math.min(100, closureRate),
          historicalData: generateHistoricalData('dof-closure-rate', closureRate, 90)
        },
        {
          id: 'dof-overdue-count',
          title: 'Gecikmiş DÖF Sayısı',
          description: 'Vadesi geçmiş açık DÖF kayıtlarının sayısı',
          category: 'quality',
          department: 'Kalite Güvence',
          responsible: 'Kalite Sorumlusu',
          unit: 'adet',
          measurementPeriod: 'daily',
          dataType: 'automatic',
          dataSource: 'DÖF ve 8D Modülü',
          targetValue: 0,
          currentValue: overdueDOF,
          previousValue: overdueDOF + 1,
          warningThreshold: 3,
          criticalThreshold: 5,
          isIncreasing: false,
          lastUpdated: currentTime,
          status: overdueDOF === 0 ? 'excellent' : overdueDOF <= 3 ? 'good' : overdueDOF <= 5 ? 'warning' : 'critical',
          trend: 'down',
          isFavorite: true,
          isActive: true,
          createdAt: currentTime,
          updatedAt: currentTime,
          moduleSource: 'DOF8DManagement',
          progress: Math.max(0, 100 - (overdueDOF * 20)),
          historicalData: generateHistoricalData('dof-overdue-count', overdueDOF, 0)
        }
      ];
    } catch (error) {
      console.error('❌ DOF KPI integration error:', error);
      return [];
    }
  };

  // ✅ RİSK YÖNETİMİ VERİLERİ - RiskManagement'tan
  const getRiskManagementKPIs = (): KPI[] => {
    try {
      const riskRecords = JSON.parse(localStorage.getItem('riskRecords') || '[]');
      
      const totalRisks = riskRecords.length;
      const highRisks = riskRecords.filter((risk: any) => 
        risk.riskLevel === 'high' || risk.riskLevel === 'very_high'
      ).length;
      const mitigatedRisks = riskRecords.filter((risk: any) => 
        risk.status === 'mitigated' || risk.status === 'closed'
      ).length;
      
      const highRiskRatio = totalRisks > 0 ? (highRisks / totalRisks) * 100 : 0;
      const mitigationRate = totalRisks > 0 ? (mitigatedRisks / totalRisks) * 100 : 100;
      
      // Risk skoru ortalaması
      const avgRiskScore = totalRisks > 0 ? 
        riskRecords.reduce((sum: number, risk: any) => sum + (risk.riskScore || 0), 0) / totalRisks : 0;
      
      console.log('📊 KPI Integration - Risk Management Data:', {
        totalRisks,
        highRisks,
        mitigatedRisks,
        highRiskRatio,
        mitigationRate,
        avgRiskScore
      });
      
      return [
        {
          id: 'high-risk-ratio',
          title: 'Yüksek Risk Oranı',
          description: 'Yüksek ve çok yüksek risklerin toplam içindeki oranı',
          category: 'safety',
          department: 'Risk Yönetimi',
          responsible: 'Risk Sorumlusu',
          unit: '%',
          measurementPeriod: 'monthly',
          dataType: 'automatic',
          dataSource: 'Risk Yönetimi Modülü',
          targetValue: 15,
          currentValue: highRiskRatio,
          previousValue: 20,
          warningThreshold: 25,
          criticalThreshold: 35,
          isIncreasing: false,
          lastUpdated: currentTime,
          status: highRiskRatio <= 15 ? 'excellent' : highRiskRatio <= 25 ? 'good' : highRiskRatio <= 35 ? 'warning' : 'critical',
          trend: highRiskRatio < 20 ? 'down' : 'up',
          isFavorite: true,
          isActive: true,
          createdAt: currentTime,
          updatedAt: currentTime,
          moduleSource: 'RiskManagement',
          progress: Math.max(0, 100 - (highRiskRatio * 100 / 35)),
          historicalData: generateHistoricalData('high-risk-ratio', highRiskRatio, 15)
        },
        {
          id: 'risk-mitigation-rate',
          title: 'Risk Azaltma Oranı',
          description: 'Azaltılmış ve kapatılmış risklerin toplam içindeki oranı',
          category: 'safety',
          department: 'Risk Yönetimi',
          responsible: 'Risk Yöneticisi',
          unit: '%',
          measurementPeriod: 'quarterly',
          dataType: 'automatic',
          dataSource: 'Risk Yönetimi Modülü',
          targetValue: 80,
          currentValue: mitigationRate,
          previousValue: 75,
          warningThreshold: 70,
          criticalThreshold: 60,
          isIncreasing: true,
          lastUpdated: currentTime,
          status: mitigationRate >= 80 ? 'excellent' : mitigationRate >= 70 ? 'good' : mitigationRate >= 60 ? 'warning' : 'critical',
          trend: mitigationRate > 75 ? 'up' : 'down',
          isFavorite: false,
          isActive: true,
          createdAt: currentTime,
          updatedAt: currentTime,
          moduleSource: 'RiskManagement',
          progress: Math.min(100, mitigationRate),
          historicalData: generateHistoricalData('risk-mitigation-rate', mitigationRate, 80)
        }
      ];
    } catch (error) {
      console.error('❌ Risk Management KPI integration error:', error);
      return [];
    }
  };

  const getProductionQualityKPIs = (): KPI[] => {
    try {
      const productionData = JSON.parse(localStorage.getItem('productionQualityData') || '[]');
      
      const totalDefects = productionData.reduce((sum: number, record: any) => 
        sum + (record.defects ? record.defects.length : 0), 0
      );
      
      const resolvedDefects = productionData.reduce((sum: number, record: any) => 
        sum + (record.defects ? record.defects.filter((d: any) => d.status === 'resolved').length : 0), 0
      );
      
      const defectResolutionRate = totalDefects > 0 ? (resolvedDefects / totalDefects) * 100 : 100;
      
      console.log('📊 KPI Integration - Production Quality Data:', {
        totalRecords: productionData.length,
        totalDefects,
        resolvedDefects,
        defectResolutionRate
      });
      
      return productionData.length > 0 ? [
        {
          id: 'production-defect-rate',
          title: 'Üretim Hata Oranı',
          description: 'Üretimde tespit edilen hataların toplam üretim içindeki oranı',
          category: 'production',
          department: 'Üretim',
          responsible: 'Üretim Müdürü',
          unit: '%',
          measurementPeriod: 'daily',
          dataType: 'automatic',
          dataSource: 'Üretim Kalite Takip Modülü',
          targetValue: 2,
          currentValue: productionData.length > 0 ? (totalDefects / productionData.length) * 100 : 0,
          previousValue: 2.5,
          warningThreshold: 5,
          criticalThreshold: 10,
          isIncreasing: false,
          lastUpdated: currentTime,
          status: (totalDefects / Math.max(productionData.length, 1)) * 100 <= 2 ? 'excellent' : 
                  (totalDefects / Math.max(productionData.length, 1)) * 100 <= 5 ? 'good' : 
                  (totalDefects / Math.max(productionData.length, 1)) * 100 <= 10 ? 'warning' : 'critical',
          trend: 'down',
          isFavorite: true,
          isActive: true,
          createdAt: currentTime,
          updatedAt: currentTime,
          moduleSource: 'ProductionQualityTracking',
          progress: Math.max(0, 100 - ((totalDefects / Math.max(productionData.length, 1)) * 100 * 10)),
          historicalData: generateHistoricalData('production-defect-rate', (totalDefects / Math.max(productionData.length, 1)) * 100, 2)
        },
        {
          id: 'defect-resolution-rate',
          title: 'Hata Çözüm Oranı',
          description: 'Çözülen üretim hatalarının toplam içindeki oranı',
          category: 'production',
          department: 'Kalite Kontrol',
          responsible: 'Kalite Sorumlusu',
          unit: '%',
          measurementPeriod: 'weekly',
          dataType: 'automatic',
          dataSource: 'Üretim Kalite Takip Modülü',
          targetValue: 95,
          currentValue: defectResolutionRate,
          previousValue: 92,
          warningThreshold: 85,
          criticalThreshold: 75,
          isIncreasing: true,
          lastUpdated: currentTime,
          status: defectResolutionRate >= 95 ? 'excellent' : defectResolutionRate >= 85 ? 'good' : defectResolutionRate >= 75 ? 'warning' : 'critical',
          trend: defectResolutionRate > 92 ? 'up' : 'down',
          isFavorite: false,
          isActive: true,
          createdAt: currentTime,
          updatedAt: currentTime,
          moduleSource: 'ProductionQualityTracking',
          progress: Math.min(100, defectResolutionRate),
          historicalData: generateHistoricalData('defect-resolution-rate', defectResolutionRate, 95)
        }
      ] : [];
    } catch (error) {
      console.error('❌ Production Quality KPI integration error:', error);
      return [];
    }
  };

  const getEquipmentCalibrationKPIs = (): KPI[] => {
    try {
      const equipmentData = JSON.parse(localStorage.getItem('equipment_calibration_data') || '[]');
      
      const totalEquipment = equipmentData.length;
      const overdueCalibrations = equipmentData.filter((eq: any) => {
        if (!eq.nextCalibrationDate) return false;
        const dueDate = new Date(eq.nextCalibrationDate);
        const today = new Date();
        return dueDate < today && eq.status !== 'calibrated';
      }).length;
      
      const calibrationComplianceRate = totalEquipment > 0 ? ((totalEquipment - overdueCalibrations) / totalEquipment) * 100 : 100;
      
      console.log('📊 KPI Integration - Equipment Calibration Data:', {
        totalEquipment,
        overdueCalibrations,
        calibrationComplianceRate
      });
      
      return totalEquipment > 0 ? [
        {
          id: 'calibration-compliance-rate',
          title: 'Kalibrasyon Uyum Oranı',
          description: 'Zamanında kalibre edilen ekipmanların toplam içindeki oranı',
          category: 'quality',
          department: 'Kalite Güvence',
          responsible: 'Kalibrasyon Sorumlusu',
          unit: '%',
          measurementPeriod: 'monthly',
          dataType: 'automatic',
          dataSource: 'Ekipman Kalibrasyon Modülü',
          targetValue: 98,
          currentValue: calibrationComplianceRate,
          previousValue: 96,
          warningThreshold: 95,
          criticalThreshold: 90,
          isIncreasing: true,
          lastUpdated: currentTime,
          status: calibrationComplianceRate >= 98 ? 'excellent' : calibrationComplianceRate >= 95 ? 'good' : calibrationComplianceRate >= 90 ? 'warning' : 'critical',
          trend: calibrationComplianceRate > 96 ? 'up' : 'down',
          isFavorite: true,
          isActive: true,
          createdAt: currentTime,
          updatedAt: currentTime,
          moduleSource: 'EquipmentCalibrationManagement',
          progress: Math.min(100, calibrationComplianceRate),
          historicalData: generateHistoricalData('calibration-compliance-rate', calibrationComplianceRate, 98)
        },
        {
          id: 'overdue-calibrations',
          title: 'Gecikmiş Kalibrasyon Sayısı',
          description: 'Kalibrasyon tarihi geçmiş ekipman sayısı',
          category: 'quality',
          department: 'Kalite Güvence',
          responsible: 'Kalibrasyon Sorumlusu',
          unit: 'adet',
          measurementPeriod: 'daily',
          dataType: 'automatic',
          dataSource: 'Ekipman Kalibrasyon Modülü',
          targetValue: 0,
          currentValue: overdueCalibrations,
          previousValue: overdueCalibrations + 1,
          warningThreshold: 2,
          criticalThreshold: 5,
          isIncreasing: false,
          lastUpdated: currentTime,
          status: overdueCalibrations === 0 ? 'excellent' : overdueCalibrations <= 2 ? 'good' : overdueCalibrations <= 5 ? 'warning' : 'critical',
          trend: 'down',
          isFavorite: false,
          isActive: true,
          createdAt: currentTime,
          updatedAt: currentTime,
          moduleSource: 'EquipmentCalibrationManagement',
          progress: Math.max(0, 100 - (overdueCalibrations * 20)),
          historicalData: generateHistoricalData('overdue-calibrations', overdueCalibrations, 0)
        }
      ] : [];
    } catch (error) {
      console.error('❌ Equipment Calibration KPI integration error:', error);
      return [];
    }
  };

  const getTrainingManagementKPIs = (): KPI[] => {
    try {
      const trainingData = JSON.parse(localStorage.getItem('training-records') || '[]');
      
      const totalTrainings = trainingData.length;
      const completedTrainings = trainingData.filter((t: any) => t.status === 'completed').length;
      const trainingCompletionRate = totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 100;
      
      // Ortalama eğitim puanı hesaplama
      const completedWithScores = trainingData.filter((t: any) => t.status === 'completed' && t.score);
      const avgTrainingScore = completedWithScores.length > 0 ? 
        completedWithScores.reduce((sum: number, t: any) => sum + t.score, 0) / completedWithScores.length : 0;
      
      console.log('📊 KPI Integration - Training Management Data:', {
        totalTrainings,
        completedTrainings,
        trainingCompletionRate,
        avgTrainingScore
      });
      
      return totalTrainings > 0 ? [
        {
          id: 'training-completion-rate',
          title: 'Eğitim Tamamlama Oranı',
          description: 'Tamamlanan eğitimlerin toplam planlanan eğitimler içindeki oranı',
          category: 'efficiency',
          department: 'İnsan Kaynakları',
          responsible: 'Eğitim Sorumlusu',
          unit: '%',
          measurementPeriod: 'monthly',
          dataType: 'automatic',
          dataSource: 'Eğitim Yönetimi Modülü',
          targetValue: 90,
          currentValue: trainingCompletionRate,
          previousValue: 85,
          warningThreshold: 80,
          criticalThreshold: 70,
          isIncreasing: true,
          lastUpdated: currentTime,
          status: trainingCompletionRate >= 90 ? 'excellent' : trainingCompletionRate >= 80 ? 'good' : trainingCompletionRate >= 70 ? 'warning' : 'critical',
          trend: trainingCompletionRate > 85 ? 'up' : 'down',
          isFavorite: true,
          isActive: true,
          createdAt: currentTime,
          updatedAt: currentTime,
          moduleSource: 'TrainingManagement',
          progress: Math.min(100, trainingCompletionRate),
          historicalData: generateHistoricalData('training-completion-rate', trainingCompletionRate, 90)
        },
        {
          id: 'average-training-score',
          title: 'Ortalama Eğitim Puanı',
          description: 'Tamamlanan eğitimlerin ortalama başarı puanı',
          category: 'efficiency',
          department: 'İnsan Kaynakları',
          responsible: 'Eğitim Sorumlusu',
          unit: 'puan',
          measurementPeriod: 'quarterly',
          dataType: 'automatic',
          dataSource: 'Eğitim Yönetimi Modülü',
          targetValue: 80,
          currentValue: avgTrainingScore,
          previousValue: 78,
          warningThreshold: 70,
          criticalThreshold: 60,
          isIncreasing: true,
          lastUpdated: currentTime,
          status: avgTrainingScore >= 80 ? 'excellent' : avgTrainingScore >= 70 ? 'good' : avgTrainingScore >= 60 ? 'warning' : 'critical',
          trend: avgTrainingScore > 78 ? 'up' : 'down',
          isFavorite: false,
          isActive: true,
          createdAt: currentTime,
          updatedAt: currentTime,
          moduleSource: 'TrainingManagement',
          progress: Math.min(100, (avgTrainingScore / 100) * 100),
          historicalData: generateHistoricalData('average-training-score', avgTrainingScore, 80)
        }
      ] : [];
    } catch (error) {
      console.error('❌ Training Management KPI integration error:', error);
      return [];
    }
  };

  // ✅ MEVCUT STATİK KPI'LAR (gerektiğinde)
  const getStaticKPIs = (): KPI[] => {
    return [
      {
        id: 'production-efficiency',
        title: 'Üretim Verimliliği',
        description: 'Planlanan üretim kapasitesine karşı gerçekleşen üretim oranı',
        category: 'production',
        department: 'Üretim',
        responsible: 'Üretim Müdürü',
        unit: '%',
        measurementPeriod: 'daily',
        dataType: 'automatic',
        dataSource: 'Üretim Takip Sistemi',
        targetValue: 85,
        currentValue: 92.3,
        previousValue: 89.1,
        warningThreshold: 80,
        criticalThreshold: 75,
        isIncreasing: true,
        lastUpdated: currentTime,
        status: 'excellent',
        trend: 'up',
        isFavorite: false,
        isActive: true,
        createdAt: currentTime,
        updatedAt: currentTime,
        moduleSource: 'ProductionSystem',
        progress: 108,
        historicalData: generateHistoricalData('production-efficiency', 92.3, 85)
      }
    ];
  };

  console.log('🔄 KPI Integration - Collecting data from all modules...');
  
  const getTankLeakTestKPIs = (): KPI[] => {
    try {
      const tankTestData = JSON.parse(localStorage.getItem('tankLeakTests') || '[]');
      
      const totalTests = tankTestData.length;
      const passedTests = tankTestData.filter((test: any) => 
        test.testResult && test.testResult.result === 'Geçti'
      ).length;
      
      const testSuccessRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 100;
      
      console.log('📊 KPI Integration - Tank Leak Test Data:', {
        totalTests, passedTests, testSuccessRate
      });
      
      return totalTests > 0 ? [{
        id: 'tank-test-success-rate',
        title: 'Tank Test Başarı Oranı',
        description: 'Başarılı tank sızıntı testlerinin toplam test içindeki oranı',
        category: 'quality',
        department: 'Kalite Kontrol',
        responsible: 'Test Sorumlusu',
        unit: '%',
        measurementPeriod: 'weekly',
        dataType: 'automatic',
        dataSource: 'Tank Sızıntı Test Modülü',
        targetValue: 95,
        currentValue: testSuccessRate,
        previousValue: 93,
        warningThreshold: 90,
        criticalThreshold: 85,
        isIncreasing: true,
        lastUpdated: currentTime,
        status: testSuccessRate >= 95 ? 'excellent' : testSuccessRate >= 90 ? 'good' : testSuccessRate >= 85 ? 'warning' : 'critical',
        trend: testSuccessRate > 93 ? 'up' : 'down',
        isFavorite: true,
        isActive: true,
        createdAt: currentTime,
        updatedAt: currentTime,
        moduleSource: 'TankLeakTest',
        progress: Math.min(100, testSuccessRate),
        historicalData: generateHistoricalData('tank-test-success-rate', testSuccessRate, 95)
      }] : [];
    } catch (error) {
      console.error('❌ Tank Leak Test KPI integration error:', error);
      return [];
    }
  };

  const getCustomerFeedbackKPIs = (): KPI[] => {
    try {
      const feedbackData = JSON.parse(localStorage.getItem('customer-feedbacks') || '[]');
      
      const totalFeedbacks = feedbackData.length;
      const avgSatisfactionScore = totalFeedbacks > 0 ? 
        feedbackData.reduce((sum: number, fb: any) => sum + (fb.rating || 0), 0) / totalFeedbacks : 0;
      
      console.log('📊 KPI Integration - Customer Feedback Data:', {
        totalFeedbacks, avgSatisfactionScore
      });
      
      return totalFeedbacks > 0 ? [{
        id: 'customer-satisfaction-score',
        title: 'Müşteri Memnuniyet Puanı',
        description: 'Müşteri geri bildirimlerinin ortalama puanı',
        category: 'quality',
        department: 'Müşteri Hizmetleri',
        responsible: 'Müşteri İlişkileri Müdürü',
        unit: 'puan',
        measurementPeriod: 'monthly',
        dataType: 'automatic',
        dataSource: 'Müşteri Geri Bildirim Modülü',
        targetValue: 4.5,
        currentValue: avgSatisfactionScore,
        previousValue: 4.2,
        warningThreshold: 4.0,
        criticalThreshold: 3.5,
        isIncreasing: true,
        lastUpdated: currentTime,
        status: avgSatisfactionScore >= 4.5 ? 'excellent' : avgSatisfactionScore >= 4.0 ? 'good' : avgSatisfactionScore >= 3.5 ? 'warning' : 'critical',
        trend: avgSatisfactionScore > 4.2 ? 'up' : 'down',
        isFavorite: true,
        isActive: true,
        createdAt: currentTime,
        updatedAt: currentTime,
        moduleSource: 'CustomerFeedbackManagement',
        progress: Math.min(100, (avgSatisfactionScore / 5) * 100),
        historicalData: generateHistoricalData('customer-satisfaction-score', avgSatisfactionScore, 4.5)
      }] : [];
    } catch (error) {
      console.error('❌ Customer Feedback KPI integration error:', error);
      return [];
    }
  };

  const getFanTestAnalysisKPIs = (): KPI[] => {
    try {
      const fanTestData = JSON.parse(localStorage.getItem('fanTestRecords') || '[]');
      
      const totalTests = fanTestData.length;
      const passedTests = fanTestData.filter((test: any) => 
        test.testResult === 'Geçti' || test.status === 'passed'
      ).length;
      
      const fanTestSuccessRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 100;
      
      console.log('📊 KPI Integration - Fan Test Analysis Data:', {
        totalTests, passedTests, fanTestSuccessRate
      });
      
      return totalTests > 0 ? [{
        id: 'fan-test-success-rate',
        title: 'Fan Test Başarı Oranı',
        description: 'Başarılı fan testlerinin toplam test içindeki oranı',
        category: 'quality',
        department: 'Test Laboratuvarı',
        responsible: 'Test Mühendisi',
        unit: '%',
        measurementPeriod: 'weekly',
        dataType: 'automatic',
        dataSource: 'Fan Test Analiz Modülü',
        targetValue: 92,
        currentValue: fanTestSuccessRate,
        previousValue: 90,
        warningThreshold: 85,
        criticalThreshold: 80,
        isIncreasing: true,
        lastUpdated: currentTime,
        status: fanTestSuccessRate >= 92 ? 'excellent' : fanTestSuccessRate >= 85 ? 'good' : fanTestSuccessRate >= 80 ? 'warning' : 'critical',
        trend: fanTestSuccessRate > 90 ? 'up' : 'down',
        isFavorite: true,
        isActive: true,
        createdAt: currentTime,
        updatedAt: currentTime,
        moduleSource: 'FanTestAnalysis',
        progress: Math.min(100, fanTestSuccessRate),
        historicalData: generateHistoricalData('fan-test-success-rate', fanTestSuccessRate, 92)
      }] : [];
    } catch (error) {
      console.error('❌ Fan Test Analysis KPI integration error:', error);
      return [];
    }
  };

  const getMaterialCertificateKPIs = (): KPI[] => {
    try {
      const materialData = JSON.parse(localStorage.getItem('materialCertificateTracking') || '[]');
      
      const totalMaterials = materialData.length;
      const certifiedMaterials = materialData.filter((mat: any) => 
        mat.certificateStatus === 'valid' || mat.status === 'certified'
      ).length;
      
      const certificationRate = totalMaterials > 0 ? (certifiedMaterials / totalMaterials) * 100 : 100;
      
      console.log('📊 KPI Integration - Material Certificate Data:', {
        totalMaterials, certifiedMaterials, certificationRate
      });
      
      return totalMaterials > 0 ? [{
        id: 'material-certification-rate',
        title: 'Malzeme Sertifikasyon Oranı',
        description: 'Sertifikalı malzemelerin toplam malzeme içindeki oranı',
        category: 'quality',
        department: 'Kalite Güvence',
        responsible: 'Malzeme Sorumlusu',
        unit: '%',
        measurementPeriod: 'monthly',
        dataType: 'automatic',
        dataSource: 'Malzeme Sertifika Takip Modülü',
        targetValue: 98,
        currentValue: certificationRate,
        previousValue: 96,
        warningThreshold: 95,
        criticalThreshold: 90,
        isIncreasing: true,
        lastUpdated: currentTime,
        status: certificationRate >= 98 ? 'excellent' : certificationRate >= 95 ? 'good' : certificationRate >= 90 ? 'warning' : 'critical',
        trend: certificationRate > 96 ? 'up' : 'down',
        isFavorite: true,
        isActive: true,
        createdAt: currentTime,
        updatedAt: currentTime,
        moduleSource: 'MaterialCertificateTracking',
        progress: Math.min(100, certificationRate),
        historicalData: generateHistoricalData('material-certification-rate', certificationRate, 98)
      }] : [];
    } catch (error) {
      console.error('❌ Material Certificate KPI integration error:', error);
      return [];
    }
  };

  // Tüm KPI'ları birleştir
  const allKPIs = [
    ...getQualityCostKPIs(),
    ...getSupplierQualityKPIs(),
    ...getDOFKPIs(),
    ...getRiskManagementKPIs(),
    ...getProductionQualityKPIs(),
    ...getEquipmentCalibrationKPIs(),
    ...getTrainingManagementKPIs(),
    ...getTankLeakTestKPIs(),
    ...getCustomerFeedbackKPIs(),
    ...getFanTestAnalysisKPIs(),
    ...getMaterialCertificateKPIs(),
    ...getStaticKPIs()
  ];

  console.log('✅ KPI Integration Complete:', {
    totalKPIs: allKPIs.length,
    byModule: allKPIs.reduce((acc, kpi) => {
      acc[kpi.moduleSource] = (acc[kpi.moduleSource] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  });

  return allKPIs;
};



// ✅ Context7 Best Practice: Memoized KPI Card Component
const KPICard = memo(({ kpi, onToggleFavorite, onCardClick }: { 
  kpi: KPI; 
  onToggleFavorite: (id: string) => void;
  onCardClick: (kpi: KPI) => void;
}) => {
  const performancePercentage = kpi.progress;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'primary';
    }
  };

  return (
    <Card 
      onClick={() => onCardClick(kpi)}
      sx={{ 
        height: 320, // ✅ Fixed height for equal sizes
        display: 'flex',
        flexDirection: 'column',
        borderLeft: 4,
        borderLeftColor: `${getStatusColor(kpi.status)}.main`,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 6
        }
      }}
    >
      <CardContent sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1.5}>
          <Box flex={1} minWidth={0}>
            <Typography variant="h6" fontWeight={600} noWrap fontSize="1rem">
              {kpi.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {kpi.description}
            </Typography>
          </Box>
          <Box display="flex" gap={0.5} alignItems="center" ml={1}>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(kpi.id);
              }}
              color={kpi.isFavorite ? 'warning' : 'default'}
            >
              {kpi.isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
            </IconButton>
            {kpi.trend === 'up' && <TrendingUpIcon color="success" fontSize="small" />}
            {kpi.trend === 'down' && <TrendingDownIcon color="error" fontSize="small" />}
            {kpi.trend === 'stable' && <TrendingFlatIcon color="disabled" fontSize="small" />}
          </Box>
        </Box>

        {/* Value Display */}
        <Box mb={1.5} flex={1}>
          <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={1}>
            <Typography variant="h4" fontWeight={700} color="primary" fontSize="1.75rem">
              {kpi.currentValue.toFixed(1)}
              <Typography component="span" variant="body2" color="text.secondary" ml={0.5}>
                {kpi.unit}
              </Typography>
            </Typography>
            <Chip 
              label={kpi.status === 'excellent' ? 'Mükemmel' : kpi.status === 'good' ? 'İyi' : kpi.status === 'warning' ? 'Uyarı' : 'Kritik'} 
              color={getStatusColor(kpi.status) as any}
              size="small"
              variant="filled"
            />
          </Box>
          
          <Typography variant="caption" color="text.secondary" mb={1} display="block">
            Hedef: {kpi.targetValue} {kpi.unit} • Önceki: {kpi.previousValue} {kpi.unit}
          </Typography>
          
          <LinearProgress 
            variant="determinate" 
            value={Math.min(performancePercentage, 100)}
            sx={{ 
              height: 6, 
              borderRadius: 3,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                backgroundColor: `${getStatusColor(kpi.status)}.main`
              }
            }}
          />
          <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
            Performans: %{performancePercentage.toFixed(0)}
          </Typography>
        </Box>

        {/* Footer Info */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto">
          <Typography variant="caption" color="text.secondary" noWrap>
            {kpi.department}
          </Typography>
          <Chip 
            label={kpi.moduleSource}
            size="small"
            variant="outlined"
            color="primary"
          />
        </Box>
      </CardContent>
    </Card>
  );
});

const KPIManagementModern: React.FC = () => {
  // ✅ Context7 Best Practice: Minimal state management
  const [kpis, setKpis] = useState<KPI[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('2025-Q1');
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-01');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<number>(0);
  const [analyticsDialog, setAnalyticsDialog] = useState<boolean>(false);
  const [addKPIDialog, setAddKPIDialog] = useState<boolean>(false);
  
  // ✅ Context7 Best Practice: KPI Detail Dialog State
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [kpiDetailDialog, setKpiDetailDialog] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValues, setEditValues] = useState({
    targetValue: 0,
    warningThreshold: 0,
    criticalThreshold: 0
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  
  // ✅ Context7 Best Practice: Manual KPI Form State
  const [newKPI, setNewKPI] = useState({
    title: '',
    description: '',
    category: 'quality' as 'quality' | 'production' | 'cost' | 'supplier' | 'document' | 'safety' | 'efficiency',
    department: '',
    responsible: '',
    unit: '',
    measurementPeriod: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    targetValue: 0,
    warningThreshold: 0,
    criticalThreshold: 0
  });

  // ✅ Context7 Best Practice: Auto-refresh data loading
  const loadIntegratedData = useCallback(() => {
    console.log('🔄 KPI Data Loading başlatılıyor...');
    setIsLoading(true);
    
    // Real module integration with debug
    setTimeout(() => {
      const generatedKPIs = generateIntegratedKPIs();
      console.log('📊 KPI Integration Results:', {
        totalKPIs: generatedKPIs.length,
        moduleBreakdown: generatedKPIs.reduce((acc, kpi) => {
          acc[kpi.moduleSource] = (acc[kpi.moduleSource] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        statusBreakdown: generatedKPIs.reduce((acc, kpi) => {
          acc[kpi.status] = (acc[kpi.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
      
      setKpis(generatedKPIs);
      setLastRefresh(new Date());
      setIsLoading(false);
      
      // Debug localStorage content
      console.log('💾 LocalStorage Debug Check:');
      console.log('- kys-cost-management-data:', localStorage.getItem('kys-cost-management-data') ? 'EXISTS' : 'MISSING');
      console.log('- supplier-nonconformities:', localStorage.getItem('supplier-nonconformities') ? 'EXISTS' : 'MISSING');
      console.log('- dofRecords:', localStorage.getItem('dofRecords') ? 'EXISTS' : 'MISSING');
      console.log('- riskRecords:', localStorage.getItem('riskRecords') ? 'EXISTS' : 'MISSING');
    }, 800);
  }, []);

  useEffect(() => {
    loadIntegratedData();
    
    // Auto-refresh every 3 minutes for real-time data
    const interval = setInterval(loadIntegratedData, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadIntegratedData]);

  // ✅ Context7 Best Practice: Time period filter helper
  const getKPIForPeriod = useCallback((kpi: KPI, period: string): KPI => {
    if (period === 'current') {
      return kpi; // Return current values
    }
    
    // Find historical data for the selected period
    const historicalData = kpi.historicalData.find(data => data.period === period);
    if (historicalData) {
      return {
        ...kpi,
        currentValue: historicalData.value,
        status: historicalData.status,
        trend: historicalData.trend,
        progress: historicalData.targetValue > 0 ? Math.round((historicalData.value / historicalData.targetValue) * 100) : 0
      };
    }
    
    return kpi; // Fallback to current values
  }, []);

  // ✅ Context7 Best Practice: Memoized filtered data with time period support
  const filteredKPIs = useMemo(() => {
    const currentPeriod = selectedPeriod === 'monthly' ? selectedMonth : 
                         selectedPeriod === 'quarterly' ? selectedQuarter : 'current';
    
    return kpis
      .filter(kpi => {
        const matchesSearch = !searchTerm || 
          kpi.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          kpi.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          kpi.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          kpi.moduleSource.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFavorites = !showFavoritesOnly || kpi.isFavorite;
        
        return matchesSearch && matchesFavorites;
      })
      .map(kpi => getKPIForPeriod(kpi, currentPeriod));
  }, [kpis, searchTerm, showFavoritesOnly, selectedPeriod, selectedMonth, selectedQuarter, getKPIForPeriod]);

  // ✅ Context7 Best Practice: Smart statistics calculation
  const kpiStats = useMemo(() => {
    const total = filteredKPIs.length;
    const excellent = filteredKPIs.filter(kpi => kpi.status === 'excellent').length;
    const good = filteredKPIs.filter(kpi => kpi.status === 'good').length;
    const warning = filteredKPIs.filter(kpi => kpi.status === 'warning').length;
    const critical = filteredKPIs.filter(kpi => kpi.status === 'critical').length;
    const avgPerformance = total > 0 
      ? filteredKPIs.reduce((sum, kpi) => sum + (kpi.progress || 0), 0) / total 
      : 0;

    return { total, excellent, good, warning, critical, avgPerformance };
  }, [filteredKPIs]);

  // ✅ Context7 Best Practice: Trend Analysis Chart Data  
  const departmentTrendData = useMemo(() => {
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const departments = ['Kalite', 'Üretim', 'Satın Alma', 'İK', 'Lojistik'];
    
    return months.map((month, index) => {
      const dataPoint: any = { month };
      departments.forEach(dept => {
        // Simulate realistic performance trends
        const basePerformance = 75 + Math.sin(index * 0.5) * 15;
        const variance = (Math.random() - 0.5) * 10;
        dataPoint[dept] = Math.max(40, Math.min(100, basePerformance + variance));
      });
      return dataPoint;
    });
  }, []);

  // ✅ Context7 Best Practice: Department Performance Ranking Data
  const departmentRankingData = useMemo(() => {
    const departments = [
      { name: 'Kalite', performance: 92, color: '#2e7d32' },
      { name: 'Üretim', performance: 88, color: '#1976d2' },
      { name: 'İK', performance: 85, color: '#7b1fa2' },
      { name: 'Lojistik', performance: 82, color: '#d32f2f' },
      { name: 'Satın Alma', performance: 78, color: '#f57c00' }
    ];
    return departments.sort((a, b) => b.performance - a.performance);
  }, []);

  // ✅ Context7 Best Practice: Optimized handlers
  const handleRefresh = useCallback(() => {
    loadIntegratedData();
  }, [loadIntegratedData]);

  const handleToggleFavorite = useCallback((kpiId: string) => {
    setKpis(prev => prev.map(kpi => 
      kpi.id === kpiId ? { ...kpi, isFavorite: !kpi.isFavorite } : kpi
    ));
  }, []);

  // ✅ Context7 Best Practice: KPI Detail Handlers
  const handleKPIClick = useCallback((kpi: KPI) => {
    setSelectedKPI(kpi);
    setEditValues({
      targetValue: kpi.targetValue,
      warningThreshold: kpi.warningThreshold,
      criticalThreshold: kpi.criticalThreshold
    });
    setKpiDetailDialog(true);
    setIsEditing(false);
  }, []);

  const handleSaveKPI = useCallback(() => {
    if (!selectedKPI) return;

    setKpis(prev => prev.map(kpi => 
      kpi.id === selectedKPI.id 
        ? { 
            ...kpi, 
            targetValue: editValues.targetValue,
            warningThreshold: editValues.warningThreshold,
            criticalThreshold: editValues.criticalThreshold,
            updatedAt: new Date().toISOString()
          } 
        : kpi
    ));

    setIsEditing(false);
    setSnackbar({ 
      open: true, 
      message: 'KPI hedefleri başarıyla güncellendi!', 
      severity: 'success' 
    });
  }, [selectedKPI, editValues]);

  const handleCloseKPIDialog = useCallback(() => {
    setKpiDetailDialog(false);
    setSelectedKPI(null);
    setIsEditing(false);
  }, []);

  // ✅ Context7 Best Practice: Manual KPI Handlers
  const handleAddKPI = useCallback(() => {
    setAddKPIDialog(true);
  }, []);

  const handleSaveNewKPI = useCallback(() => {
    if (!newKPI.title || !newKPI.department || !newKPI.responsible || !newKPI.unit) {
      setSnackbar({
        open: true,
        message: 'Lütfen tüm zorunlu alanları doldurun!',
        severity: 'error'
      });
      return;
    }

    const currentTime = new Date().toISOString();
    const kpiToAdd: KPI = {
      id: `manual-${Date.now()}`,
      title: newKPI.title,
      description: newKPI.description,
      category: newKPI.category,
      department: newKPI.department,
      responsible: newKPI.responsible,
      unit: newKPI.unit,
      measurementPeriod: newKPI.measurementPeriod,
      dataType: 'manual',
      dataSource: 'Manuel Giriş',
      targetValue: newKPI.targetValue,
      currentValue: 0,
      previousValue: 0,
      warningThreshold: newKPI.warningThreshold,
      criticalThreshold: newKPI.criticalThreshold,
      isIncreasing: true,
      lastUpdated: currentTime,
      status: 'good',
      trend: 'stable',
      isFavorite: false,
      isActive: true,
      createdAt: currentTime,
      updatedAt: currentTime,
      moduleSource: 'ManuelGiris',
      progress: 0,
      historicalData: generateHistoricalData(`manual-${Date.now()}`, 0, newKPI.targetValue)
    };

    setKpis(prev => [...prev, kpiToAdd]);
    setAddKPIDialog(false);
    setNewKPI({
      title: '',
      description: '',
      category: 'quality',
      department: '',
      responsible: '',
      unit: '',
      measurementPeriod: 'monthly',
      targetValue: 0,
      warningThreshold: 0,
      criticalThreshold: 0
    });
    
    setSnackbar({
      open: true,
      message: 'Manuel KPI başarıyla eklendi!',
      severity: 'success'
    });
  }, [newKPI]);

  const handleCloseAddKPIDialog = useCallback(() => {
    setAddKPIDialog(false);
    setNewKPI({
      title: '',
      description: '',
      category: 'quality',
      department: '',
      responsible: '',
      unit: '',
      measurementPeriod: 'monthly',
      targetValue: 0,
      warningThreshold: 0,
      criticalThreshold: 0
    });
  }, []);

  return (
    <Box p={3} maxWidth="1600px" mx="auto">
      {/* ✅ Context7 Best Practice: Compact statistics dashboard */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', minHeight: 80 }}>
            <Typography variant="h4" fontWeight={700} color="success.contrastText">
              {kpiStats.excellent}
            </Typography>
            <Typography variant="body2" color="success.contrastText">
              Mükemmel
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', minHeight: 80 }}>
            <Typography variant="h4" fontWeight={700} color="primary.contrastText">
              {kpiStats.good}
            </Typography>
            <Typography variant="body2" color="primary.contrastText">
              İyi
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', minHeight: 80 }}>
            <Typography variant="h4" fontWeight={700} color="warning.contrastText">
              {kpiStats.warning}
            </Typography>
            <Typography variant="body2" color="warning.contrastText">
              Uyarı
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', minHeight: 80 }}>
            <Typography variant="h4" fontWeight={700} color="error.contrastText">
              {kpiStats.critical}
            </Typography>
            <Typography variant="body2" color="error.contrastText">
              Kritik
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', minHeight: 80 }}>
            <Typography variant="h4" fontWeight={700} color="info.contrastText">
              %{isFinite(kpiStats.avgPerformance) ? kpiStats.avgPerformance.toFixed(0) : '0'}
            </Typography>
            <Typography variant="body2" color="info.contrastText">
              Ortalama
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ✅ Context7 Best Practice: Enhanced search and controls */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="KPI ara... (modül, departman, başlık)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />
          
          <FormControlLabel
            control={
              <Switch 
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                color="warning"
              />
            }
            label="Sadece Favoriler"
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Dönem Tipi</InputLabel>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              label="Dönem Tipi"
            >
              <MenuItem value="current">Güncel Değerler</MenuItem>
              <MenuItem value="monthly">Aylık Dönem</MenuItem>
              <MenuItem value="quarterly">Çeyreklik Dönem</MenuItem>
            </Select>
          </FormControl>

          {selectedPeriod === 'monthly' && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Ay Seç</InputLabel>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                label="Ay Seç"
              >
                <MenuItem value="2025-01">Ocak 2025</MenuItem>
                <MenuItem value="2025-02">Şubat 2025</MenuItem>
                <MenuItem value="2025-03">Mart 2025</MenuItem>
                <MenuItem value="2025-04">Nisan 2025</MenuItem>
                <MenuItem value="2025-05">Mayıs 2025</MenuItem>
                <MenuItem value="2025-06">Haziran 2025</MenuItem>
                <MenuItem value="2025-07">Temmuz 2025</MenuItem>
                <MenuItem value="2025-08">Ağustos 2025</MenuItem>
                <MenuItem value="2025-09">Eylül 2025</MenuItem>
                <MenuItem value="2025-10">Ekim 2025</MenuItem>
                <MenuItem value="2025-11">Kasım 2025</MenuItem>
                <MenuItem value="2025-12">Aralık 2025</MenuItem>
                <MenuItem value="2024-01">Ocak 2024</MenuItem>
                <MenuItem value="2024-02">Şubat 2024</MenuItem>
                <MenuItem value="2024-03">Mart 2024</MenuItem>
                <MenuItem value="2024-04">Nisan 2024</MenuItem>
                <MenuItem value="2024-05">Mayıs 2024</MenuItem>
                <MenuItem value="2024-06">Haziran 2024</MenuItem>
                <MenuItem value="2024-07">Temmuz 2024</MenuItem>
                <MenuItem value="2024-08">Ağustos 2024</MenuItem>
                <MenuItem value="2024-09">Eylül 2024</MenuItem>
                <MenuItem value="2024-10">Ekim 2024</MenuItem>
                <MenuItem value="2024-11">Kasım 2024</MenuItem>
                <MenuItem value="2024-12">Aralık 2024</MenuItem>
              </Select>
            </FormControl>
          )}

          {selectedPeriod === 'quarterly' && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Çeyrek Seç</InputLabel>
              <Select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                label="Çeyrek Seç"
              >
                <MenuItem value="2025-Q1">2025 Q1</MenuItem>
                <MenuItem value="2025-Q2">2025 Q2</MenuItem>
                <MenuItem value="2025-Q3">2025 Q3</MenuItem>
                <MenuItem value="2025-Q4">2025 Q4</MenuItem>
                <MenuItem value="2024-Q1">2024 Q1</MenuItem>
                <MenuItem value="2024-Q2">2024 Q2</MenuItem>
                <MenuItem value="2024-Q3">2024 Q3</MenuItem>
                <MenuItem value="2024-Q4">2024 Q4</MenuItem>
                <MenuItem value="2023-Q1">2023 Q1</MenuItem>
                <MenuItem value="2023-Q2">2023 Q2</MenuItem>
                <MenuItem value="2023-Q3">2023 Q3</MenuItem>
                <MenuItem value="2023-Q4">2023 Q4</MenuItem>
              </Select>
            </FormControl>
          )}

          <Button
            variant="outlined"
            startIcon={<AnalyticsIcon />}
            onClick={() => setAnalyticsDialog(true)}
            sx={{ minWidth: 120 }}
          >
            Analizler
          </Button>

          <Tooltip title={`Son güncelleme: ${lastRefresh.toLocaleTimeString('tr-TR')}`}>
            <IconButton 
              onClick={handleRefresh} 
              disabled={isLoading}
              color="primary"
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                '&:disabled': { bgcolor: 'grey.300' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* ✅ Context7 Best Practice: Tab navigation */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.95rem'
            }
          }}
        >
          <Tab 
            label={`KPI Dashboard (${filteredKPIs.length})`}
            icon={<AssessmentIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Trend Analizi" 
            icon={<TimelineIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Performans Raporu" 
            icon={<BarChartIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Modül Entegrasyonu" 
            icon={<IntegrationInstructionsIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* ✅ Context7 Best Practice: Content rendering based on active tab */}
      {activeTab === 0 && (
        <Box>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <Typography variant="h6" color="text.secondary">
                Modüllerden veriler alınıyor...
              </Typography>
            </Box>
          ) : filteredKPIs.length === 0 ? (
            <Alert severity="info">
              <Typography variant="h6">KPI bulunamadı</Typography>
              <Typography>
                {searchTerm || showFavoritesOnly 
                  ? 'Arama kriterlerinizi değiştirin.'
                  : 'Modüllerden henüz KPI verisi alınamadı.'}
              </Typography>
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredKPIs.map(kpi => (
                <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={kpi.id}>
                  <KPICard 
                    kpi={kpi} 
                    onToggleFavorite={handleToggleFavorite}
                    onCardClick={handleKPIClick}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* ✅ Context7 Best Practice: Trend Analysis Tab */}
      {activeTab === 1 && (
        <Box>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" fontWeight={600} mb={3} color="primary">
              Trend Analizi Dashboard
            </Typography>
            
            {/* Period Selector for Trend Analysis */}
            <Box mb={3}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Analiz Dönemi</InputLabel>
                <Select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  label="Analiz Dönemi"
                >
                  <MenuItem value="monthly">Son 12 Ay</MenuItem>
                  <MenuItem value="quarterly">Son 6 Çeyrek</MenuItem>
                  <MenuItem value="yearly">Son 2 Yıl</MenuItem>
                  <MenuItem value="current">Güncel Durum</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Trend Overview Cards */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={3}>
                <Card elevation={2} sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingUpIcon />
                      <Typography variant="h6">Yükselen</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold">
                      {filteredKPIs.filter(kpi => kpi.trend === 'up').length}
                    </Typography>
                    <Typography variant="body2">KPI Artış Trendinde</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card elevation={2} sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingFlatIcon />
                      <Typography variant="h6">Stabil</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold">
                      {filteredKPIs.filter(kpi => kpi.trend === 'stable').length}
                    </Typography>
                    <Typography variant="body2">KPI Stabil Durumda</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card elevation={2} sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingDownIcon />
                      <Typography variant="h6">Düşen</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold">
                      {filteredKPIs.filter(kpi => kpi.trend === 'down').length}
                    </Typography>
                    <Typography variant="body2">KPI Azalış Trendinde</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card elevation={2} sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ShowChartIcon />
                      <Typography variant="h6">Ortalama</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold">
                      %{isFinite(kpiStats.avgPerformance) ? kpiStats.avgPerformance.toFixed(0) : '0'}
                    </Typography>
                    <Typography variant="body2">Genel Performans</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Detailed Trend Analysis Table */}
            <Typography variant="h6" fontWeight={600} mb={2}>
              Detaylı Trend Analizi
            </Typography>
            
            <TableContainer component={Paper} elevation={1}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>KPI Adı</strong></TableCell>
                    <TableCell><strong>Kategori</strong></TableCell>
                    <TableCell><strong>Mevcut Değer</strong></TableCell>
                    <TableCell><strong>Hedef</strong></TableCell>
                    <TableCell><strong>Trend</strong></TableCell>
                    <TableCell><strong>Performans</strong></TableCell>
                    <TableCell><strong>Son Güncelleme</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredKPIs.slice(0, 10).map((kpi) => (
                    <TableRow key={kpi.id} hover>
                      <TableCell>{kpi.title}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getCategoryLabel(kpi.category)} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {kpi.currentValue.toFixed(1)} {kpi.unit}
                        </Typography>
                      </TableCell>
                      <TableCell>{kpi.targetValue.toFixed(1)} {kpi.unit}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {kpi.trend === 'up' && <TrendingUpIcon color="success" />}
                          {kpi.trend === 'down' && <TrendingDownIcon color="error" />}
                          {kpi.trend === 'stable' && <TrendingFlatIcon color="warning" />}
                          <Typography 
                            variant="body2" 
                            color={kpi.trend === 'up' ? 'success.main' : 
                                   kpi.trend === 'down' ? 'error.main' : 'warning.main'}
                          >
                            {kpi.trend === 'up' ? 'Artış' : 
                             kpi.trend === 'down' ? 'Azalış' : 'Stabil'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(100, kpi.progress || 0)} 
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                            color={kpi.status === 'excellent' ? 'success' :
                                   kpi.status === 'good' ? 'primary' :
                                   kpi.status === 'warning' ? 'warning' : 'error'}
                          />
                          <Typography variant="body2">
                            %{Math.min(100, kpi.progress || 0).toFixed(0)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(kpi.lastUpdated).toLocaleDateString('tr-TR')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* ✅ Context7 Best Practice: Trend Analysis Charts */}
            <Grid container spacing={3} mt={4}>
              {/* Departman Karşılaştırma Grafiği */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} mb={3} color="primary">
                    Departman KPI Trend Karşılaştırması
                  </Typography>
                  <Box sx={{ width: '100%', height: 500 }}>
                    <ResponsiveContainer>
                      <LineChart data={departmentTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12 }}
                          axisLine={{ stroke: '#e0e0e0' }}
                        />
                        <YAxis 
                          domain={[40, 100]}
                          tick={{ fontSize: 12 }}
                          axisLine={{ stroke: '#e0e0e0' }}
                          label={{ value: 'Performans (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                          formatter={(value: any) => [`%${value.toFixed(1)}`, '']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="Kalite" 
                          stroke="#2e7d32" 
                          strokeWidth={3}
                          dot={{ fill: '#2e7d32', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#2e7d32', strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Üretim" 
                          stroke="#1976d2" 
                          strokeWidth={3}
                          dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#1976d2', strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Satın Alma" 
                          stroke="#f57c00" 
                          strokeWidth={3}
                          dot={{ fill: '#f57c00', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#f57c00', strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="İK" 
                          stroke="#7b1fa2" 
                          strokeWidth={3}
                          dot={{ fill: '#7b1fa2', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#7b1fa2', strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Lojistik" 
                          stroke="#d32f2f" 
                          strokeWidth={3}
                          dot={{ fill: '#d32f2f', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#d32f2f', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>

              {/* Departman Performans Sıralaması */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} mb={3} color="primary">
                    Departman Performans Sıralaması
                  </Typography>
                  <Box sx={{ width: '100%', height: 450 }}>
                    <ResponsiveContainer>
                      <BarChart data={departmentRankingData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          domain={[70, 100]}
                          tick={{ fontSize: 12 }}
                          label={{ value: 'Performans (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px'
                          }}
                          formatter={(value: any) => [`%${value}`, 'Performans']}
                        />
                        <Bar 
                          dataKey="performance" 
                          fill="#1976d2"
                          radius={[4, 4, 0, 0]}
                          strokeWidth={1}
                          stroke="#ffffff"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Trend Insights */}
            <Paper elevation={1} sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" fontWeight={600} mb={2} color="primary">
                Trend Öngörüleri
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Kalite departmanı sürekli performans artışı gösteriyor"
                    secondary="Son 6 ayda %15 iyileşme ile lider konumda"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Üretim departmanı istikrarlı performans sergiliyor"
                    secondary="Hedef değerlerin %88'ine ulaşılmış durumda"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Satın Alma departmanında iyileştirme potansiyeli"
                    secondary="Son 3 ayda hafif düşüş trendi gözlemlendi"
                  />
                </ListItem>
              </List>
            </Paper>
          </Paper>
        </Box>
      )}

      {/* ✅ Context7 Best Practice: Performance Report Tab */}
      {activeTab === 2 && (
        <Box>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" fontWeight={600} mb={3} color="primary">
              Performans Raporu
            </Typography>

            {/* Performance Summary */}
            <Grid container spacing={3} mb={4}>
              {/* Category Performance Breakdown */}
              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={3}>
                      Kategori Bazında Performans
                    </Typography>
                    
                    {['quality', 'production', 'cost', 'supplier', 'safety', 'efficiency'].map(category => {
                      const categoryKPIs = filteredKPIs.filter(kpi => kpi.category === category);
                      const avgPerformance = categoryKPIs.length > 0 
                        ? categoryKPIs.reduce((sum, kpi) => sum + (kpi.progress || 0), 0) / categoryKPIs.length 
                        : 0;
                      
                      return (
                        <Box key={category} mb={2}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body1" fontWeight={500}>
                              {getCategoryLabel(category)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {categoryKPIs.length} KPI
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={2}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, avgPerformance)}
                              sx={{ flex: 1, height: 8, borderRadius: 4 }}
                              color={avgPerformance >= 90 ? 'success' :
                                     avgPerformance >= 70 ? 'primary' :
                                     avgPerformance >= 50 ? 'warning' : 'error'}
                            />
                            <Typography variant="body2" fontWeight={600} minWidth={50}>
                              %{avgPerformance.toFixed(0)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </CardContent>
                </Card>
              </Grid>

              {/* Top Performers */}
              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={3}>
                      En İyi Performans
                    </Typography>
                    
                    {filteredKPIs
                      .sort((a, b) => (b.progress || 0) - (a.progress || 0))
                      .slice(0, 5)
                      .map((kpi, index) => (
                        <Box key={kpi.id} display="flex" alignItems="center" gap={2} mb={2}>
                          <Chip 
                            label={index + 1} 
                            color={index === 0 ? 'success' : index === 1 ? 'primary' : 'default'}
                            size="small"
                            sx={{ minWidth: 32 }}
                          />
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight={500}>
                              {kpi.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {kpi.department}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            %{(kpi.progress || 0).toFixed(0)}
                          </Typography>
                        </Box>
                      ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Detailed Performance Metrics */}
            <Typography variant="h6" fontWeight={600} mb={2}>
              Detaylı Performans Metrikleri
            </Typography>
            
            <TableContainer component={Paper} elevation={1}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>KPI</strong></TableCell>
                    <TableCell><strong>Birim</strong></TableCell>
                    <TableCell><strong>Mevcut</strong></TableCell>
                    <TableCell><strong>Hedef</strong></TableCell>
                    <TableCell><strong>Fark</strong></TableCell>
                    <TableCell><strong>Başarı Oranı</strong></TableCell>
                    <TableCell><strong>Durum</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredKPIs.map((kpi) => {
                    const difference = kpi.currentValue - kpi.targetValue;
                    const achievementRate = kpi.targetValue > 0 ? (kpi.currentValue / kpi.targetValue) * 100 : 0;
                    
                    return (
                      <TableRow key={kpi.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {kpi.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {kpi.responsible}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{kpi.unit}</TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>
                            {kpi.currentValue.toFixed(1)}
                          </Typography>
                        </TableCell>
                        <TableCell>{kpi.targetValue.toFixed(1)}</TableCell>
                        <TableCell>
                          <Typography 
                            color={difference >= 0 ? 'success.main' : 'error.main'}
                            fontWeight={500}
                          >
                            {difference >= 0 ? '+' : ''}{difference.toFixed(1)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>
                            %{achievementRate.toFixed(0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={kpi.status === 'excellent' ? 'Mükemmel' :
                                   kpi.status === 'good' ? 'İyi' :
                                   kpi.status === 'warning' ? 'Uyarı' : 'Kritik'}
                            color={kpi.status === 'excellent' ? 'success' :
                                   kpi.status === 'good' ? 'primary' :
                                   kpi.status === 'warning' ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Performance Summary Report */}
            <Paper elevation={1} sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" fontWeight={600} mb={2} color="primary">
                                    Performans Özeti
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {kpiStats.excellent + kpiStats.good}
                    </Typography>
                    <Typography variant="body1">Hedefi Karşılayan KPI</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toplam {kpiStats.total} KPI'dan
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      %{isFinite(kpiStats.avgPerformance) ? kpiStats.avgPerformance.toFixed(0) : '0'}
                    </Typography>
                    <Typography variant="body1">Ortalama Performans</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hedef: %85
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {kpiStats.warning + kpiStats.critical}
                    </Typography>
                    <Typography variant="body1">İyileştirme Gereken</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Aksiyon planı gerekli
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Paper>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {/* Bu bölüm kaldırıldı - Boş trend analizi bölümü */}
        </Box>
      )}

      {/* ✅ Context7 Best Practice: Performance Report Tab */}
      {activeTab === 2 && (
        <Box>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" fontWeight={600} mb={3} color="primary">
              Performans Raporu
            </Typography>

            {/* Performance Summary */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={4}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={3}>
                      En İyi Performans
                    </Typography>
                    
                    {filteredKPIs
                      .filter(kpi => kpi.status === 'excellent')
                      .slice(0, 3)
                      .map((kpi, index) => (
                        <Box key={kpi.id} display="flex" alignItems="center" gap={2} mb={2}>
                          <Chip 
                            label={index + 1} 
                            size="small" 
                            color="success" 
                            sx={{ minWidth: 32 }}
                          />
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight={500}>
                              {kpi.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              %{kpi.progress.toFixed(0)} performans
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    }
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={3}>
                      Dikkat Gereken KPI'lar
                    </Typography>
                    
                    {filteredKPIs
                      .filter(kpi => kpi.status === 'warning' || kpi.status === 'critical')
                      .slice(0, 3)
                      .map((kpi, index) => (
                        <Box key={kpi.id} display="flex" alignItems="center" gap={2} mb={2}>
                          <WarningIcon 
                            color={kpi.status === 'critical' ? 'error' : 'warning'} 
                            fontSize="small"
                          />
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight={500}>
                              {kpi.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              %{kpi.progress.toFixed(0)} performans
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    }
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} mb={3}>
                      Modül Dağılımı
                    </Typography>
                    
                    {Array.from(new Set(filteredKPIs.map(kpi => kpi.moduleSource)))
                      .slice(0, 3)
                      .map((module, index) => {
                        const moduleKPIs = filteredKPIs.filter(kpi => kpi.moduleSource === module);
                        const avgPerformance = moduleKPIs.length > 0 
                          ? moduleKPIs.reduce((sum, kpi) => sum + kpi.progress, 0) / moduleKPIs.length 
                          : 0;
                        
                        return (
                          <Box key={module} display="flex" alignItems="center" gap={2} mb={2}>
                            <Box 
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: index === 0 ? 'primary.main' : 
                                         index === 1 ? 'success.main' : 'warning.main'
                              }}
                            />
                            <Box flex={1}>
                              <Typography variant="body2" fontWeight={500}>
                                {module}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {moduleKPIs.length} KPI - %{avgPerformance.toFixed(0)} ort.
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })
                    }
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Performance Insights */}
            <Paper elevation={1} sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" fontWeight={600} mb={2} color="primary">
                Performans Özeti
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUpIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Genel performans trendi pozitif"
                        secondary={`Toplam ${kpiStats.excellent + kpiStats.good} KPI hedef üzerinde`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <InfoIcon color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Modül entegrasyonu başarılı"
                        secondary="Tüm sistemlerden veri alınıyor"
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <AnalyticsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Ortalama performans"
                        secondary={`%${kpiStats.avgPerformance.toFixed(1)} - Hedef: %85`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimelineIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Trend analizi aktif"
                        secondary="2025 yılı verileri güncelleniyor"
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Paper>
          </Paper>
        </Box>
      )}

      {/* ✅ Context7 Best Practice: Module Integration Status Tab */}
      {activeTab === 3 && (
        <Box>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" fontWeight={600} mb={3} color="primary">
              Modül Entegrasyon Durumu
            </Typography>

            {/* Module Integration Summary */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={3}>
                <Card elevation={2} sx={{ bgcolor: 'success.light' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircleIcon sx={{ color: 'success.contrastText' }} />
                      <Typography variant="h6" color="success.contrastText">Bağlı Modül</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold" color="success.contrastText">
                      {Array.from(new Set(filteredKPIs.map(kpi => kpi.moduleSource))).length}
                    </Typography>
                    <Typography variant="body2" color="success.contrastText">
                      Aktif Entegrasyon
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card elevation={2} sx={{ bgcolor: 'primary.light' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AssessmentIcon sx={{ color: 'primary.contrastText' }} />
                      <Typography variant="h6" color="primary.contrastText">Toplam KPI</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold" color="primary.contrastText">
                      {filteredKPIs.length}
                    </Typography>
                    <Typography variant="body2" color="primary.contrastText">
                      Canlı Veri Akışı
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card elevation={2} sx={{ bgcolor: 'warning.light' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <WarningIcon sx={{ color: 'warning.contrastText' }} />
                      <Typography variant="h6" color="warning.contrastText">Yüksek Kalite Veri</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold" color="warning.contrastText">
                      {filteredKPIs.filter(kpi => kpi.dataType === 'automatic').length}
                    </Typography>
                    <Typography variant="body2" color="warning.contrastText">
                      Otomatik KPI
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card elevation={2} sx={{ bgcolor: 'info.light' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TimelineIcon sx={{ color: 'info.contrastText' }} />
                      <Typography variant="h6" color="info.contrastText">Son Güncelleme</Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" color="info.contrastText">
                      {lastRefresh.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    <Typography variant="body2" color="info.contrastText">
                      Bugün
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Module Status Cards */}
            <Typography variant="h6" fontWeight={600} mb={3}>
              Modül Detayları
            </Typography>
            
            <Grid container spacing={3}>
              {Array.from(new Set(filteredKPIs.map(kpi => kpi.moduleSource))).map((moduleSource, index) => {
                const moduleKPIs = filteredKPIs.filter(kpi => kpi.moduleSource === moduleSource);
                const avgPerformance = moduleKPIs.length > 0 
                  ? moduleKPIs.reduce((sum, kpi) => sum + kpi.progress, 0) / moduleKPIs.length 
                  : 0;
                const statusCounts = {
                  excellent: moduleKPIs.filter(kpi => kpi.status === 'excellent').length,
                  good: moduleKPIs.filter(kpi => kpi.status === 'good').length,
                  warning: moduleKPIs.filter(kpi => kpi.status === 'warning').length,
                  critical: moduleKPIs.filter(kpi => kpi.status === 'critical').length
                };
                
                const dataQuality = moduleKPIs.filter(kpi => kpi.dataType === 'automatic').length / moduleKPIs.length * 100;
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={moduleSource}>
                    <Card 
                      elevation={3} 
                      sx={{ 
                        border: avgPerformance >= 85 ? '2px solid' : '1px solid',
                        borderColor: avgPerformance >= 85 ? 'success.main' : 'divider',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      <CardContent>
                        {/* Module Header */}
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Box 
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: avgPerformance >= 85 ? 'success.main' : 
                                       avgPerformance >= 70 ? 'warning.main' : 'error.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <CheckCircleIcon sx={{ color: 'white' }} />
                          </Box>
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight={600}>
                              {moduleSource}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {moduleKPIs.length} KPI kayıt sayısı
                            </Typography>
                          </Box>
                          <Chip 
                            label="Bağlı" 
                            color="success" 
                            size="small"
                            icon={<CheckCircleIcon />}
                          />
                        </Box>

                        {/* Performance Progress */}
                        <Box mb={2}>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="text.secondary">
                              Veri Kalitesi
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              %{dataQuality.toFixed(0)}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={dataQuality} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                bgcolor: dataQuality >= 80 ? 'success.main' : 
                                         dataQuality >= 60 ? 'warning.main' : 'error.main'
                              }
                            }}
                          />
                        </Box>

                        {/* Status Distribution */}
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            KPI Durum Dağılımı
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={3}>
                              <Box textAlign="center">
                                <Typography variant="h6" color="success.main" fontWeight="bold">
                                  {statusCounts.excellent}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Mükemmel
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={3}>
                              <Box textAlign="center">
                                <Typography variant="h6" color="primary.main" fontWeight="bold">
                                  {statusCounts.good}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  İyi
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={3}>
                              <Box textAlign="center">
                                <Typography variant="h6" color="warning.main" fontWeight="bold">
                                  {statusCounts.warning}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Uyarı
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={3}>
                              <Box textAlign="center">
                                <Typography variant="h6" color="error.main" fontWeight="bold">
                                  {statusCounts.critical}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Kritik
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>

                        {/* Module Info */}
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Son Senkronizasyon
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {lastRefresh.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="body2" color="text.secondary">
                              Ortalama Performans
                            </Typography>
                            <Typography 
                              variant="h6" 
                              fontWeight="bold"
                              color={avgPerformance >= 85 ? 'success.main' : 
                                     avgPerformance >= 70 ? 'warning.main' : 'error.main'}
                            >
                              %{avgPerformance.toFixed(0)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* Integration Summary */}
            <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
              <Typography variant="h6" fontWeight={600} mb={2} color="primary">
                Entegrasyon Özeti
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Real-time veri akışı aktif"
                        secondary="Tüm modüllerden 3 dakikada bir güncelleme"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AssessmentIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="LocalStorage entegrasyonu çalışıyor"
                        secondary="Veri kalıcılığı sağlanıyor"
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <TimelineIcon color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Otomatik KPI hesaplaması"
                        secondary={`${filteredKPIs.filter(kpi => kpi.dataType === 'automatic').length} otomatik KPI aktif`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <IntegrationInstructionsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Cross-module entegrasyon"
                        secondary="Modüller arası veri paylaşımı"
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Paper>
          </Paper>
        </Box>
      )}

      {/* ✅ Context7 Best Practice: KPI Detail Dialog */}
      <Dialog 
        open={kpiDetailDialog} 
        onClose={handleCloseKPIDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        {selectedKPI && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box 
                  sx={{
                    width: 8,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: selectedKPI.status === 'excellent' ? 'success.main' : 
                             selectedKPI.status === 'good' ? 'primary.main' :
                             selectedKPI.status === 'warning' ? 'warning.main' : 'error.main'
                  }}
                />
                <Box flex={1}>
                  <Typography variant="h5" fontWeight={600}>
                    {selectedKPI.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedKPI.description}
                  </Typography>
                </Box>
                <Chip 
                  label={selectedKPI.moduleSource}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Stack spacing={3}>
                {/* Mevcut Durum */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
                      <InfoIcon color="primary" />
                      Mevcut Durum
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center" p={2} bgcolor="primary.light" borderRadius={1}>
                          <Typography variant="h4" fontWeight={700} color="primary.contrastText">
                            {selectedKPI.currentValue.toFixed(1)}
                          </Typography>
                          <Typography variant="caption" color="primary.contrastText">
                            Mevcut Değer
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center" p={2} bgcolor="success.light" borderRadius={1}>
                          <Typography variant="h4" fontWeight={700} color="success.contrastText">
                            {selectedKPI.targetValue.toFixed(1)}
                          </Typography>
                          <Typography variant="caption" color="success.contrastText">
                            Hedef Değer
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center" p={2} bgcolor="grey.100" borderRadius={1}>
                          <Typography variant="h4" fontWeight={700} color="text.primary">
                            {selectedKPI.previousValue.toFixed(1)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Önceki Değer
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center" p={2} bgcolor="info.light" borderRadius={1}>
                          <Typography variant="h4" fontWeight={700} color="info.contrastText">
                            %{selectedKPI.progress.toFixed(0)}
                          </Typography>
                          <Typography variant="caption" color="info.contrastText">
                            Performans
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Detaylı Bilgiler */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
                      <HistoryIcon color="primary" />
                      Detaylı Bilgiler
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Kategori
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedKPI.category === 'quality' ? 'Kalite' :
                           selectedKPI.category === 'cost' ? 'Maliyet' :
                           selectedKPI.category === 'supplier' ? 'Tedarikçi' :
                           selectedKPI.category === 'production' ? 'Üretim' :
                           selectedKPI.category === 'document' ? 'Doküman' :
                           selectedKPI.category === 'safety' ? 'Güvenlik' :
                           'Verimlilik'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Departman
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedKPI.department}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Birim
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedKPI.responsible}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Ölçüm Periyodu
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedKPI.measurementPeriod === 'daily' ? 'Günlük' :
                           selectedKPI.measurementPeriod === 'weekly' ? 'Haftalık' :
                           selectedKPI.measurementPeriod === 'monthly' ? 'Aylık' :
                           selectedKPI.measurementPeriod === 'quarterly' ? 'Çeyreklik' : 'Yıllık'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Veri Tipi
                        </Typography>
                        <Chip 
                          label={selectedKPI.dataType === 'automatic' ? 'Otomatik' : 'Manuel'}
                          color={selectedKPI.dataType === 'automatic' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Son Güncelleme
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {new Date(selectedKPI.lastUpdated).toLocaleString('tr-TR')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Hedef Değerler */}
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                        <EditIcon color="primary" />
                        Hedef Değerler
                      </Typography>
                      <Button
                        variant={isEditing ? "outlined" : "contained"}
                        size="small"
                        startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? 'İptal' : 'Düzenle'}
                      </Button>
                    </Box>

                    {isEditing ? (
                      <Stack spacing={3}>
                        {/* ✅ Context7 Best Practice: Custom Value Label Format */}
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Hedef Değer ({selectedKPI.unit})
                          </Typography>
                          <Box px={2}>
                            <Slider
                              value={editValues.targetValue}
                              onChange={(_, value) => setEditValues(prev => ({ ...prev, targetValue: value as number }))}
                              min={0}
                              max={selectedKPI.currentValue * 2}
                              step={0.1}
                              valueLabelDisplay="on"
                              valueLabelFormat={(value) => `${value.toFixed(1)} ${selectedKPI.unit}`}
                              marks={[
                                { value: 0, label: '0' },
                                { value: selectedKPI.currentValue, label: `Mevcut: ${selectedKPI.currentValue.toFixed(1)}` },
                                { value: selectedKPI.currentValue * 2, label: `Max: ${(selectedKPI.currentValue * 2).toFixed(1)}` }
                              ]}
                              sx={{ 
                                mt: 3,
                                mb: 2,
                                '& .MuiSlider-valueLabel': {
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  bgcolor: 'success.main',
                                  borderRadius: '8px',
                                  padding: '4px 8px',
                                  minWidth: 'auto',
                                  transform: 'rotate(0deg) !important',
                                  '&::before': {
                                    color: 'success.main'
                                  },
                                  '& span': {
                                    transform: 'rotate(0deg) !important',
                                    whiteSpace: 'nowrap',
                                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                                  }
                                },
                                '& .MuiSlider-mark': {
                                  bgcolor: 'success.main',
                                  height: 8,
                                  width: 2
                                },
                                '& .MuiSlider-markLabel': {
                                  fontSize: '0.7rem',
                                  fontWeight: 500,
                                  transform: 'rotate(0deg) !important',
                                  whiteSpace: 'nowrap'
                                }
                              }}
                            />
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Uyarı Eşiği ({selectedKPI.unit})
                          </Typography>
                          <Box px={2}>
                            <Slider
                              value={editValues.warningThreshold}
                              onChange={(_, value) => setEditValues(prev => ({ ...prev, warningThreshold: value as number }))}
                              min={0}
                              max={editValues.targetValue}
                              step={0.1}
                              valueLabelDisplay="on"
                              valueLabelFormat={(value) => `${value.toFixed(1)} ${selectedKPI.unit}`}
                              marks={[
                                { value: 0, label: '0' },
                                { value: editValues.targetValue / 2, label: `Orta: ${(editValues.targetValue / 2).toFixed(1)}` },
                                { value: editValues.targetValue, label: `Hedef: ${editValues.targetValue.toFixed(1)}` }
                              ]}
                              sx={{ 
                                mt: 3,
                                mb: 2,
                                '& .MuiSlider-valueLabel': {
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  bgcolor: 'warning.main',
                                  borderRadius: '8px',
                                  padding: '4px 8px',
                                  minWidth: 'auto',
                                  transform: 'rotate(0deg) !important',
                                  '&::before': {
                                    color: 'warning.main'
                                  },
                                  '& span': {
                                    transform: 'rotate(0deg) !important',
                                    whiteSpace: 'nowrap',
                                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                                  }
                                },
                                '& .MuiSlider-mark': {
                                  bgcolor: 'warning.main',
                                  height: 8,
                                  width: 2
                                },
                                '& .MuiSlider-markLabel': {
                                  fontSize: '0.7rem',
                                  fontWeight: 500,
                                  transform: 'rotate(0deg) !important',
                                  whiteSpace: 'nowrap'
                                }
                              }}
                            />
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Kritik Eşik ({selectedKPI.unit})
                          </Typography>
                          <Box px={2}>
                            <Slider
                              value={editValues.criticalThreshold}
                              onChange={(_, value) => setEditValues(prev => ({ ...prev, criticalThreshold: value as number }))}
                              min={0}
                              max={editValues.warningThreshold}
                              step={0.1}
                              valueLabelDisplay="on"
                              valueLabelFormat={(value) => `${value.toFixed(1)} ${selectedKPI.unit}`}
                              marks={[
                                { value: 0, label: '0' },
                                { value: editValues.warningThreshold / 2, label: `Orta: ${(editValues.warningThreshold / 2).toFixed(1)}` },
                                { value: editValues.warningThreshold, label: `Uyarı: ${editValues.warningThreshold.toFixed(1)}` }
                              ]}
                              sx={{ 
                                mt: 3,
                                mb: 2,
                                '& .MuiSlider-valueLabel': {
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  bgcolor: 'error.main',
                                  borderRadius: '8px',
                                  padding: '4px 8px',
                                  minWidth: 'auto',
                                  transform: 'rotate(0deg) !important',
                                  '&::before': {
                                    color: 'error.main'
                                  },
                                  '& span': {
                                    transform: 'rotate(0deg) !important',
                                    whiteSpace: 'nowrap',
                                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                                  }
                                },
                                '& .MuiSlider-mark': {
                                  bgcolor: 'error.main',
                                  height: 8,
                                  width: 2
                                },
                                '& .MuiSlider-markLabel': {
                                  fontSize: '0.7rem',
                                  fontWeight: 500,
                                  transform: 'rotate(0deg) !important',
                                  whiteSpace: 'nowrap'
                                }
                              }}
                            />
                          </Box>
                        </Box>
                      </Stack>
                    ) : (
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Box textAlign="center" p={2} bgcolor="success.light" borderRadius={1}>
                            <Typography variant="h5" fontWeight={700} color="success.contrastText">
                              {selectedKPI.targetValue}
                            </Typography>
                            <Typography variant="caption" color="success.contrastText">
                              Hedef
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box textAlign="center" p={2} bgcolor="warning.light" borderRadius={1}>
                            <Typography variant="h5" fontWeight={700} color="warning.contrastText">
                              {selectedKPI.warningThreshold}
                            </Typography>
                            <Typography variant="caption" color="warning.contrastText">
                              Uyarı
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box textAlign="center" p={2} bgcolor="error.light" borderRadius={1}>
                            <Typography variant="h5" fontWeight={700} color="error.contrastText">
                              {selectedKPI.criticalThreshold}
                            </Typography>
                            <Typography variant="caption" color="error.contrastText">
                              Kritik
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Stack>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={handleCloseKPIDialog}>
                Kapat
              </Button>
              {isEditing && (
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveKPI}
                >
                  Kaydet
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ✅ Context7 Best Practice: Analytics Dialog */}
      <Dialog 
        open={analyticsDialog} 
        onClose={() => setAnalyticsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>KPI Analiz Merkezi</DialogTitle>
        <DialogContent>
          <Typography variant="body1" mb={2}>
            Gelişmiş analiz araçları ve raporlar burada yer alacak:
          </Typography>
          <ul>
            <li>Gerçek zamanlı trend analizi</li>
            <li>Departman karşılaştırması</li>
            <li>Hedef sapma analizleri</li>
            <li>Tahminsel analitik</li>
            <li>Benchmark raporları</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalyticsDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Context7 Best Practice: Manual KPI Add Dialog */}
      <Dialog 
        open={addKPIDialog} 
        onClose={handleCloseAddKPIDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <AddIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Manuel KPI Ekle
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="KPI Başlığı *"
                value={newKPI.title}
                onChange={(e) => setNewKPI(prev => ({ ...prev, title: e.target.value }))}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Kategori *</InputLabel>
                <Select
                  value={newKPI.category}
                  onChange={(e) => setNewKPI(prev => ({ ...prev, category: e.target.value as any }))}
                  label="Kategori *"
                >
                  <MenuItem value="quality">Kalite</MenuItem>
                  <MenuItem value="production">Üretim</MenuItem>
                  <MenuItem value="cost">Maliyet</MenuItem>
                  <MenuItem value="supplier">Tedarikçi</MenuItem>
                  <MenuItem value="document">Doküman</MenuItem>
                  <MenuItem value="safety">Güvenlik</MenuItem>
                  <MenuItem value="efficiency">Verimlilik</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama"
                value={newKPI.description}
                onChange={(e) => setNewKPI(prev => ({ ...prev, description: e.target.value }))}
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Departman *"
                value={newKPI.department}
                onChange={(e) => setNewKPI(prev => ({ ...prev, department: e.target.value }))}
                variant="outlined"
                placeholder="ör: Kalite Kontrol"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sorumlu Birim *"
                value={newKPI.responsible}
                onChange={(e) => setNewKPI(prev => ({ ...prev, responsible: e.target.value }))}
                variant="outlined"
                placeholder="ör: Kalite"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Birim *"
                value={newKPI.unit}
                onChange={(e) => setNewKPI(prev => ({ ...prev, unit: e.target.value }))}
                variant="outlined"
                placeholder="ör: %, adet, puan"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Ölçüm Periyodu</InputLabel>
                <Select
                  value={newKPI.measurementPeriod}
                  onChange={(e) => setNewKPI(prev => ({ ...prev, measurementPeriod: e.target.value as any }))}
                  label="Ölçüm Periyodu"
                >
                  <MenuItem value="daily">Günlük</MenuItem>
                  <MenuItem value="weekly">Haftalık</MenuItem>
                  <MenuItem value="monthly">Aylık</MenuItem>
                  <MenuItem value="quarterly">Çeyreklik</MenuItem>
                  <MenuItem value="yearly">Yıllık</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Hedef Değer"
                type="number"
                value={newKPI.targetValue}
                onChange={(e) => setNewKPI(prev => ({ ...prev, targetValue: Number(e.target.value) }))}
                variant="outlined"
                inputProps={{ step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Uyarı Eşiği"
                type="number"
                value={newKPI.warningThreshold}
                onChange={(e) => setNewKPI(prev => ({ ...prev, warningThreshold: Number(e.target.value) }))}
                variant="outlined"
                inputProps={{ step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Kritik Eşik"
                type="number"
                value={newKPI.criticalThreshold}
                onChange={(e) => setNewKPI(prev => ({ ...prev, criticalThreshold: Number(e.target.value) }))}
                variant="outlined"
                inputProps={{ step: 0.1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseAddKPIDialog}>
            İptal
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveNewKPI}
          >
            KPI Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Context7 Best Practice: Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ✅ Context7 Best Practice: Floating action menu */}
      <SpeedDial
        ariaLabel="KPI İşlemleri"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon />}
        direction="up"
      >
        <SpeedDialAction
          icon={<AddIcon />}
          tooltipTitle="Manuel KPI Ekle"
          onClick={handleAddKPI}
        />
        <SpeedDialAction
          icon={<ExportIcon />}
          tooltipTitle="Excel Rapor İndir"
        />
        <SpeedDialAction
          icon={<AnalyticsIcon />}
          tooltipTitle="Detaylı Analizler"
          onClick={() => setAnalyticsDialog(true)}
        />
      </SpeedDial>
    </Box>
  );
};

export default KPIManagementModern; 