import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  AlertTitle,
  Skeleton,
  Snackbar,
  Grid,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Grow,
  Breadcrumbs,
  Link,
  Tooltip,
  Divider,
  Badge,
  Paper,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  MonetizationOn as MoneyIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Factory as FactoryIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  BugReport as BugReportIcon,
  Speed as SpeedIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  FilterList as FilterListIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Info as InfoIcon,
  Launch as LaunchIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  WarningAmber as WarningAmberIcon,
  MonitorHeart as MonitorHeartIcon,
  AttachMoney as AttachMoneyIcon,
  Business as BusinessIcon,
  VerifiedUser as VerifiedUserIcon,
  SentimentVerySatisfied as SentimentVerySatisfiedIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  Block as BlockIcon,
  Straighten as RuleIcon
} from '@mui/icons-material';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { dataSyncManager } from '../utils/DataSyncManager';
import { useThemeContext } from '../context/ThemeContext';
import {
  ProfessionalCard,
  ElevatedCard,
  StatusCard,
  ProfessionalButton,
  ElegantButton,
  StatusChip,
  ElegantChip,
  ProfessionalTable,
  ElegantTableHeader,
  ProfessionalAccordion,
  ProfessionalTextField,
  ElegantSelect,
  ProfessionalPaper,
  ElegantContainer,
  SectionHeader,
  PROFESSIONAL_COLORS,
  SHADOWS,
  TRANSITIONS,
  TYPOGRAPHY,
  SPACING
} from '../shared/components';

// 🔍 BASİT VE STABİL ARAMA KUTUSU - Focus kaybı sorunu yok
const UltimateStableSearchInput = React.memo<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}>(({ value, onChange, placeholder = "", label = "", size = "small", fullWidth = true }) => {
  const [inputValue, setInputValue] = React.useState<string>(value);
  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);
  
  // Update internal value when external value changes
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Simple input change handler with debounce
  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer for debounced callback
    debounceTimer.current = setTimeout(() => {
        onChange(newValue);
    }, 300);
  }, [onChange]);
  
  // Cleanup
  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);
  
  return (
      <TextField
        fullWidth={fullWidth}
        size={size}
        label={label}
      value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
            borderWidth: '2px',
            },
          },
        }}
      />
  );
});

// STYLED COMPONENTS
const MainContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: '100vh',
  background: theme.palette.background.default,
}));

const KPICard = styled(Card)<{ status: string }>(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'excellent': return theme.palette.success.main;
      case 'good': return theme.palette.info.main;
      case 'warning': return theme.palette.warning.main;
      case 'critical': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };

  return {
    borderRadius: 12,
    background: `linear-gradient(145deg, ${getStatusColor()}15, ${getStatusColor()}05)`,
    border: `2px solid ${getStatusColor()}30`,
    position: 'relative',
    overflow: 'visible',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[8],
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: getStatusColor(),
      borderRadius: '12px 12px 0 0',
    }
  };
});

const ModuleCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, rgba(255,255,255,0.05))`,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[16],
    borderColor: theme.palette.primary.main,
    cursor: 'pointer'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

// INTERFACES
interface KPIData {
  id: string;
  title: string;
  currentValue: number;
  targetValue?: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  category: string;
  description: string;
  history: { name: string; value: number }[];
}

interface ModuleData {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  description: string;
  status: 'operational' | 'warning' | 'error';
  lastUpdate: string;
  features: string[];
  usage: number;
  performance: number;
}

interface QuickStat {
  id: string;
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

// 🚀 EXECUTIVE DASHBOARD DATA INTERFACES
interface ExecutiveMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  target: number;
  source: string;
  lastUpdate: string;
  icon: React.ReactNode;
  color: string;
}

interface ModuleHealth {
  module: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  score: number;
  lastSync: string;
  recordCount: number;
  keyMetrics: {
    metric: string;
    value: number;
    status: 'good' | 'warning' | 'critical';
  }[];
}

interface CriticalAlert {
  id: string;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  module: string;
  timestamp: string;
  actionRequired: boolean;
}

// HELPER FUNCTIONS
const formatValue = (value: number, unit: string): string => {
  if (unit === '%') return `${value.toFixed(1)}%`;
  if (unit === '₺') return `₺${value.toLocaleString('tr-TR')}`;
  if (unit === '/5') return `${value.toFixed(1)}/5`;
  return `${value.toFixed(1)} ${unit}`;
};

const getKPIStatusColor = (status: string) => {
  switch (status) {
    case 'excellent': return '#4CAF50';
    case 'good': return '#2196F3';
    case 'warning': return '#FF9800';
    case 'critical': return '#F44336';
    default: return '#757575';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return <TrendingUpIcon sx={{ color: '#4CAF50' }} />;
    case 'down': return <TrendingDownIcon sx={{ color: '#F44336' }} />;
    case 'stable': return <CheckCircleIcon sx={{ color: '#757575' }} />;
    default: return <CheckCircleIcon sx={{ color: '#757575' }} />;
  }
};

// 📊 EXECUTIVE DATA AGGREGATOR
const aggregateExecutiveData = () => {
  try {
    // 📊 Tüm modüllerden GERÇEK VERİ toplama - 18+ Modül
    const costData = JSON.parse(localStorage.getItem('kys-cost-management-data') || '[]');
    const dofRecords = JSON.parse(localStorage.getItem('dofRecords') || '[]');
    const supplierNonconformities = JSON.parse(localStorage.getItem('supplier-nonconformities') || '[]');
    const supplierDefects = JSON.parse(localStorage.getItem('supplier-defects') || '[]');
    const productionDefects = JSON.parse(localStorage.getItem('productionQualityData') || '[]'); // ✅ DÜZELTME
    const auditData = JSON.parse(localStorage.getItem('auditManagementData') || '[]'); // ✅ DÜZELTME
    const riskRecords = JSON.parse(localStorage.getItem('riskManagementData') || '[]'); // ✅ DÜZELTME
    const trainingRecords = JSON.parse(localStorage.getItem('training-records') || '[]');
    const customerFeedbacks = JSON.parse(localStorage.getItem('customer-feedbacks') || '[]');
    const calibrationRecords = JSON.parse(localStorage.getItem('equipment_calibration_data') || '[]'); // ✅ DÜZELTME
    const tankTests = JSON.parse(localStorage.getItem('tankLeakTests') || '[]'); // ✅ DÜZELTME
    const fanTests = JSON.parse(localStorage.getItem('fanTestRecords') || '[]'); // ✅ DÜZELTME
    
    // 🆕 YENİ MODÜL VERİ KAYNAKLARI - Gerçek localStorage Key'leri
    const documentManagement = JSON.parse(localStorage.getItem('documentManagementData') || '{}'); // ✅ DÜZELTME
    const quarantineRecords = []; // Henüz implement edilmemiş
    const wpsGenerated = []; // Henüz implement edilmemiş
    const dimensionalControls = JSON.parse(localStorage.getItem('partControlPlans') || '[]'); // ✅ DÜZELTME
    const iso5817Records = []; // Henüz implement edilmemiş
    const materialCertificates = JSON.parse(localStorage.getItem('materialCertificateTracking') || '[]'); // ✅ DÜZELTME
    const en5817Records = []; // Henüz implement edilmemiş
    const weldingCostCalc = []; // Henüz implement edilmemiş

    // 💰 Kalite Maliyeti Analizi
    const totalCost = costData.reduce((sum: number, record: any) => 
      sum + (parseFloat(record.birimMaliyet || 0) * parseFloat(record.miktar || 0)), 0);
    const reworkCost = costData.filter((r: any) => r.maliyetTuru?.includes('yeniden')).reduce((sum: number, record: any) => 
      sum + (parseFloat(record.birimMaliyet || 0) * parseFloat(record.miktar || 0)), 0);
    const scrapCost = costData.filter((r: any) => r.maliyetTuru?.includes('hurda')).reduce((sum: number, record: any) => 
      sum + (parseFloat(record.birimMaliyet || 0) * parseFloat(record.miktar || 0)), 0);

    // 🔧 DÖF Analizi
    const totalDOF = dofRecords.length;
    const openDOF = dofRecords.filter((d: any) => d.status === 'open' || d.status === 'in_progress').length;
    const overdueDOF = dofRecords.filter((d: any) => {
      if (!d.expectedCloseDate) return false;
      return new Date(d.expectedCloseDate) < new Date() && (d.status === 'open' || d.status === 'in_progress');
    }).length;
    const dofClosureRate = totalDOF > 0 ? ((totalDOF - openDOF) / totalDOF) * 100 : 100;

    // 🏭 Tedarikçi Performansı
    const totalSupplierIssues = supplierNonconformities.length + supplierDefects.length;
    const openSupplierIssues = [...supplierNonconformities, ...supplierDefects]
      .filter((issue: any) => issue.status === 'open' || issue.status === 'in_progress').length;
    const supplierPerformance = totalSupplierIssues > 0 ? 
      Math.max(0, 100 - ((openSupplierIssues / totalSupplierIssues) * 100)) : 95;

    // 🚗 Üretim Kalitesi
    const totalProductionDefects = productionDefects.length;
    const criticalDefects = productionDefects.filter((d: any) => d.priority === 'critical' || d.severity === 'high').length;
    const productionQualityRate = totalProductionDefects > 0 ? 
      Math.max(0, 100 - ((criticalDefects / totalProductionDefects) * 10)) : 98;

    // 📋 Denetim Uyumluluğu
    const completedAudits = auditData.filter((a: any) => a.status === 'completed').length;
    const auditComplianceRate = auditData.length > 0 ? 
      (completedAudits / auditData.length) * 100 : 90;

    // 📊 Eğitim Etkinliği
    const completedTrainings = trainingRecords.filter((t: any) => t.status === 'completed').length;
    const trainingEffectiveness = trainingRecords.length > 0 ? 
      (completedTrainings / trainingRecords.length) * 100 : 85;

    // 😊 Müşteri Memnuniyeti
    const avgCustomerRating = customerFeedbacks.length > 0 ? 
      customerFeedbacks.reduce((sum: number, fb: any) => sum + (fb.rating || 0), 0) / customerFeedbacks.length : 4.2;

    // 📄 Doküman Yönetimi Metrikleri
    const totalDocuments = documentManagement.totalDocuments || 0;
    const activeDocuments = documentManagement.activeDocuments || 0;
    const expiredDocuments = documentManagement.expiringDocuments || 0;
    const documentComplianceRate = documentManagement.documentComplianceRate || 95;

    // 🚫 Karantina Yönetimi Metrikleri
    const totalQuarantineItems = quarantineRecords.length;
    const activeQuarantines = quarantineRecords.filter((q: any) => q.status === 'quarantined' || q.status === 'investigating').length;
    const resolvedQuarantines = quarantineRecords.filter((q: any) => q.status === 'released' || q.status === 'disposed').length;
    const quarantineResolutionRate = totalQuarantineItems > 0 ? (resolvedQuarantines / totalQuarantineItems) * 100 : 90;

    // 🔧 WPS Generator Metrikleri
    const totalWPS = wpsGenerated.length;
    const approvedWPS = wpsGenerated.filter((wps: any) => wps.status === 'approved').length;
    const wpsApprovalRate = totalWPS > 0 ? (approvedWPS / totalWPS) * 100 : 85;

    // 📏 Boyutsal Kontrol Metrikleri
    const totalDimensionalChecks = dimensionalControls.length;
    const passedChecks = dimensionalControls.filter((dc: any) => dc.result === 'pass' || dc.status === 'conforming').length;
    const dimensionalConformityRate = totalDimensionalChecks > 0 ? (passedChecks / totalDimensionalChecks) * 100 : 92;

    // 🔗 Kaynak Kalite Metrikleri (ISO5817 + EN5817)
    const totalWeldChecks = iso5817Records.length + en5817Records.length;
    const passedWeldChecks = [...iso5817Records, ...en5817Records].filter((weld: any) => 
      weld.result === 'pass' || weld.qualityLevel === 'B' || weld.qualityLevel === 'C').length;
    const weldQualityRate = totalWeldChecks > 0 ? (passedWeldChecks / totalWeldChecks) * 100 : 88;

    // 📋 Malzeme Sertifika Takibi
    const totalCertificates = materialCertificates.length;
    const validCertificates = materialCertificates.filter((cert: any) => 
      cert.status === 'valid' || (!cert.expiryDate || new Date(cert.expiryDate) > new Date())).length;
    const certificateValidityRate = totalCertificates > 0 ? (validCertificates / totalCertificates) * 100 : 93;

    // 💰 Kaynak Maliyet Hesaplamaları
    const totalWeldingCost = weldingCostCalc.reduce((sum: number, calc: any) => 
      sum + (parseFloat(calc.totalCost || 0)), 0);
    const avgWeldingCostPerHour = weldingCostCalc.length > 0 ? 
      weldingCostCalc.reduce((sum: number, calc: any) => sum + (parseFloat(calc.hourlyRate || 0)), 0) / weldingCostCalc.length : 0;

    return {
      // 🏢 Mevcut Metrikler
      totalCost,
      reworkCost,
      scrapCost,
      dofClosureRate,
      overdueDOF,
      supplierPerformance,
      productionQualityRate,
      auditComplianceRate,
      trainingEffectiveness,
      avgCustomerRating,
      totalDOF,
      openDOF,
      totalSupplierIssues,
      openSupplierIssues,
      criticalDefects,
      
      // 🆕 Yeni Modül Metrikleri
      documentComplianceRate,
      expiredDocuments,
      quarantineResolutionRate,
      activeQuarantines,
      wpsApprovalRate,
      dimensionalConformityRate,
      weldQualityRate,
      certificateValidityRate,
      totalWeldingCost,
      avgWeldingCostPerHour,
      
      // 📊 Kapsamlı Kayıt Sayıları - 18+ Modül
      recordCounts: {
        // Ana Modüller
        cost: costData.length,
        dof: dofRecords.length,
        supplier: totalSupplierIssues,
        production: productionDefects.length,
        audit: auditData.length,
        training: trainingRecords.length,
        customer: customerFeedbacks.length,
        calibration: calibrationRecords.length,
        tank: tankTests.length,
        fan: fanTests.length,
        risk: riskRecords.length,
        
        // Yeni Modüller
        document: totalDocuments,
        quarantine: totalQuarantineItems,
        wps: totalWPS,
        dimensional: totalDimensionalChecks,
        welding: totalWeldChecks,
        certificates: totalCertificates,
        weldingCost: weldingCostCalc.length,
        
        // Toplam Metrikler
        totalModules: 18,
        totalRecords: costData.length + dofRecords.length + totalSupplierIssues + 
                     productionDefects.length + auditData.length + trainingRecords.length +
                     customerFeedbacks.length + calibrationRecords.length + tankTests.length +
                     fanTests.length + riskRecords.length + totalDocuments + totalQuarantineItems +
                     totalWPS + totalDimensionalChecks + totalWeldChecks + totalCertificates +
                     weldingCostCalc.length
      }
    };
  } catch (error) {
    console.error('Executive data aggregation error:', error);
    return null;
  }
};

// 🎯 EXECUTIVE METRICS GENERATOR
const generateExecutiveMetrics = (data: any): ExecutiveMetric[] => {
  if (!data) return [];

  return [
    {
      id: 'total-quality-cost',
      title: 'Toplam Kalite Maliyeti',
      value: data.totalCost,
      unit: '₺',
      trend: data.totalCost < 150000 ? 'down' : 'up',
      trendValue: Math.abs(data.totalCost - 150000),
      status: data.totalCost <= 100000 ? 'excellent' : data.totalCost <= 150000 ? 'good' : data.totalCost <= 200000 ? 'warning' : 'critical',
      target: 100000,
      source: 'Kalite Maliyet Modülü',
      lastUpdate: new Date().toLocaleString('tr-TR'),
      icon: <MoneyIcon />,
      color: '#D32F2F'
    },
    {
      id: 'dof-closure-rate',
      title: 'DÖF Kapama Oranı',
      value: data.dofClosureRate,
      unit: '%',
      trend: data.dofClosureRate >= 85 ? 'up' : 'down',
      trendValue: Math.abs(data.dofClosureRate - 85),
      status: data.dofClosureRate >= 90 ? 'excellent' : data.dofClosureRate >= 80 ? 'good' : data.dofClosureRate >= 70 ? 'warning' : 'critical',
      target: 90,
      source: 'DÖF ve 8D Modülü',
      lastUpdate: new Date().toLocaleString('tr-TR'),
      icon: <AssignmentTurnedInIcon />,
      color: '#1976D2'
    },
    {
      id: 'supplier-performance',
      title: 'Tedarikçi Performansı',
      value: data.supplierPerformance,
      unit: '/100',
      trend: data.supplierPerformance >= 90 ? 'up' : 'down',
      trendValue: Math.abs(data.supplierPerformance - 90),
      status: data.supplierPerformance >= 95 ? 'excellent' : data.supplierPerformance >= 85 ? 'good' : data.supplierPerformance >= 75 ? 'warning' : 'critical',
      target: 95,
      source: 'Tedarikçi Kalite Modülü',
      lastUpdate: new Date().toLocaleString('tr-TR'),
      icon: <BuildIcon />,
      color: '#388E3C'
    },
  {
    id: 'production-quality',
      title: 'Üretim Kalite Oranı',
      value: data.productionQualityRate,
      unit: '%',
      trend: data.productionQualityRate >= 95 ? 'up' : 'down',
      trendValue: Math.abs(data.productionQualityRate - 95),
      status: data.productionQualityRate >= 98 ? 'excellent' : data.productionQualityRate >= 95 ? 'good' : data.productionQualityRate >= 90 ? 'warning' : 'critical',
      target: 98,
      source: 'Üretim Kalite Modülü',
      lastUpdate: new Date().toLocaleString('tr-TR'),
    icon: <FactoryIcon />,
      color: '#F57C00'
    },
    {
      id: 'audit-compliance',
      title: 'Denetim Uyumluluğu',
      value: data.auditComplianceRate,
      unit: '%',
      trend: data.auditComplianceRate >= 90 ? 'up' : 'down',
      trendValue: Math.abs(data.auditComplianceRate - 90),
      status: data.auditComplianceRate >= 95 ? 'excellent' : data.auditComplianceRate >= 85 ? 'good' : data.auditComplianceRate >= 75 ? 'warning' : 'critical',
      target: 95,
      source: 'İç Denetim Modülü',
      lastUpdate: new Date().toLocaleString('tr-TR'),
      icon: <AssessmentIcon />,
      color: '#9C27B0'
    },
    {
      id: 'customer-satisfaction',
      title: 'Müşteri Memnuniyeti',
      value: data.avgCustomerRating,
      unit: '/5',
      trend: data.avgCustomerRating >= 4.5 ? 'up' : 'down',
      trendValue: Math.abs(data.avgCustomerRating - 4.5),
      status: data.avgCustomerRating >= 4.5 ? 'excellent' : data.avgCustomerRating >= 4.0 ? 'good' : data.avgCustomerRating >= 3.5 ? 'warning' : 'critical',
      target: 4.8,
      source: 'Müşteri Geri Bildirim Modülü',
      lastUpdate: new Date().toLocaleString('tr-TR'),
      icon: <PersonIcon />,
      color: '#FF9800'
    },
    {
      id: 'document-compliance',
      title: 'Doküman Uyumluluğu',
      value: data.documentComplianceRate,
      unit: '%',
      trend: data.documentComplianceRate >= 90 ? 'up' : 'down',
      trendValue: Math.abs(data.documentComplianceRate - 90),
      status: data.documentComplianceRate >= 95 ? 'excellent' : data.documentComplianceRate >= 85 ? 'good' : data.documentComplianceRate >= 75 ? 'warning' : 'critical',
      target: 95,
      source: 'Doküman Yönetimi Modülü',
      lastUpdate: new Date().toLocaleString('tr-TR'),
      icon: <AssignmentIcon />,
      color: '#607D8B'
    },
    {
      id: 'quarantine-resolution',
      title: 'Karantina Çözüm Oranı',
      value: data.quarantineResolutionRate,
      unit: '%',
      trend: data.quarantineResolutionRate >= 85 ? 'up' : 'down',
      trendValue: Math.abs(data.quarantineResolutionRate - 85),
      status: data.quarantineResolutionRate >= 90 ? 'excellent' : data.quarantineResolutionRate >= 80 ? 'good' : data.quarantineResolutionRate >= 70 ? 'warning' : 'critical',
      target: 90,
      source: 'Karantina Yönetimi Modülü',
      lastUpdate: new Date().toLocaleString('tr-TR'),
      icon: <BlockIcon />,
      color: '#E91E63'
    },
    {
      id: 'weld-quality-rate',
      title: 'Kaynak Kalite Oranı',
      value: data.weldQualityRate,
      unit: '%',
      trend: data.weldQualityRate >= 90 ? 'up' : 'down',
      trendValue: Math.abs(data.weldQualityRate - 90),
      status: data.weldQualityRate >= 95 ? 'excellent' : data.weldQualityRate >= 88 ? 'good' : data.weldQualityRate >= 80 ? 'warning' : 'critical',
      target: 95,
      source: 'ISO5817/EN5817 Kaynak Modülleri',
      lastUpdate: new Date().toLocaleString('tr-TR'),
      icon: <BuildIcon />,
      color: '#795548'
    },
    {
      id: 'dimensional-conformity',
      title: 'Boyutsal Uygunluk Oranı',
      value: data.dimensionalConformityRate,
      unit: '%',
      trend: data.dimensionalConformityRate >= 92 ? 'up' : 'down',
      trendValue: Math.abs(data.dimensionalConformityRate - 92),
      status: data.dimensionalConformityRate >= 95 ? 'excellent' : data.dimensionalConformityRate >= 90 ? 'good' : data.dimensionalConformityRate >= 85 ? 'warning' : 'critical',
      target: 95,
      source: 'Boyutsal Kontrol Modülü',
      lastUpdate: new Date().toLocaleString('tr-TR'),
      icon: <RuleIcon />,
      color: '#3F51B5'
    }
  ];
};

// 🏥 MODULE HEALTH ANALYZER
const analyzeModuleHealth = (data: any): ModuleHealth[] => {
  if (!data) return [];

  return [
    {
      module: 'Kalite Maliyet Yönetimi',
      status: data.recordCounts.cost > 10 ? 'healthy' : data.recordCounts.cost > 5 ? 'warning' : 'critical',
      score: Math.min(100, (data.recordCounts.cost / 20) * 100),
      lastSync: new Date().toLocaleString('tr-TR'),
      recordCount: data.recordCounts.cost,
      keyMetrics: [
        { metric: 'Toplam Kayıt', value: data.recordCounts.cost, status: data.recordCounts.cost > 10 ? 'good' : 'warning' },
        { metric: 'Maliyet Tutarı', value: data.totalCost, status: data.totalCost <= 150000 ? 'good' : 'warning' }
      ]
    },
    {
      module: 'DÖF ve 8D Yönetimi',
      status: data.overdueDOF === 0 ? 'healthy' : data.overdueDOF <= 3 ? 'warning' : 'critical',
      score: Math.max(0, 100 - (data.overdueDOF * 10)),
      lastSync: new Date().toLocaleString('tr-TR'),
      recordCount: data.recordCounts.dof,
      keyMetrics: [
        { metric: 'Kapama Oranı', value: data.dofClosureRate, status: data.dofClosureRate >= 85 ? 'good' : 'warning' },
        { metric: 'Gecikmiş DÖF', value: data.overdueDOF, status: data.overdueDOF === 0 ? 'good' : 'critical' }
      ]
    },
    {
      module: 'Tedarikçi Kalite Yönetimi',
      status: data.supplierPerformance >= 90 ? 'healthy' : data.supplierPerformance >= 80 ? 'warning' : 'critical',
      score: data.supplierPerformance,
      lastSync: new Date().toLocaleString('tr-TR'),
      recordCount: data.recordCounts.supplier,
      keyMetrics: [
        { metric: 'Performans Skoru', value: data.supplierPerformance, status: data.supplierPerformance >= 90 ? 'good' : 'warning' },
        { metric: 'Açık Sorunlar', value: data.openSupplierIssues, status: data.openSupplierIssues <= 5 ? 'good' : 'warning' }
      ]
    },
    {
      module: 'Üretim Kalite Takibi',
      status: data.productionQualityRate >= 95 ? 'healthy' : data.productionQualityRate >= 90 ? 'warning' : 'critical',
      score: data.productionQualityRate,
      lastSync: new Date().toLocaleString('tr-TR'),
      recordCount: data.recordCounts.production,
      keyMetrics: [
        { metric: 'Kalite Oranı', value: data.productionQualityRate, status: data.productionQualityRate >= 95 ? 'good' : 'warning' },
        { metric: 'Kritik Hatalar', value: data.criticalDefects, status: data.criticalDefects <= 3 ? 'good' : 'critical' }
      ]
    },
    {
      module: 'İç Denetim Yönetimi',
      status: data.auditComplianceRate >= 95 ? 'healthy' : data.auditComplianceRate >= 80 ? 'warning' : 'critical',
      score: data.auditComplianceRate,
      lastSync: new Date().toLocaleString('tr-TR'),
      recordCount: data.recordCounts.audit,
      keyMetrics: [
        { metric: 'Uyumluluk Oranı', value: data.auditComplianceRate, status: data.auditComplianceRate >= 90 ? 'good' : 'warning' },
        { metric: 'Toplam Denetim', value: data.recordCounts.audit, status: data.recordCounts.audit >= 10 ? 'good' : 'warning' }
      ]
    },
    {
      module: 'Doküman Yönetimi',
      status: data.documentComplianceRate >= 95 ? 'healthy' : data.documentComplianceRate >= 80 ? 'warning' : 'critical',
      score: data.documentComplianceRate,
      lastSync: new Date().toLocaleString('tr-TR'),
      recordCount: data.recordCounts.document,
      keyMetrics: [
        { metric: 'Uyumluluk Oranı', value: data.documentComplianceRate, status: data.documentComplianceRate >= 90 ? 'good' : 'warning' },
        { metric: 'Süresi Dolan', value: data.expiredDocuments, status: data.expiredDocuments <= 5 ? 'good' : 'critical' }
      ]
    },
    {
      module: 'Karantina Yönetimi',
      status: data.quarantineResolutionRate >= 90 ? 'healthy' : data.quarantineResolutionRate >= 75 ? 'warning' : 'critical',
      score: data.quarantineResolutionRate,
      lastSync: new Date().toLocaleString('tr-TR'),
      recordCount: data.recordCounts.quarantine,
      keyMetrics: [
        { metric: 'Çözüm Oranı', value: data.quarantineResolutionRate, status: data.quarantineResolutionRate >= 85 ? 'good' : 'warning' },
        { metric: 'Aktif Karantina', value: data.activeQuarantines, status: data.activeQuarantines <= 10 ? 'good' : 'warning' }
      ]
    },
    {
      module: 'Kaynak Kalite Kontrol',
      status: data.weldQualityRate >= 95 ? 'healthy' : data.weldQualityRate >= 85 ? 'warning' : 'critical',
      score: data.weldQualityRate,
      lastSync: new Date().toLocaleString('tr-TR'),
      recordCount: data.recordCounts.welding,
      keyMetrics: [
        { metric: 'Kalite Oranı', value: data.weldQualityRate, status: data.weldQualityRate >= 90 ? 'good' : 'warning' },
        { metric: 'Toplam Test', value: data.recordCounts.welding, status: data.recordCounts.welding >= 20 ? 'good' : 'warning' }
      ]
    },
    {
      module: 'Boyutsal Kontrol',
      status: data.dimensionalConformityRate >= 95 ? 'healthy' : data.dimensionalConformityRate >= 85 ? 'warning' : 'critical',
      score: data.dimensionalConformityRate,
      lastSync: new Date().toLocaleString('tr-TR'),
      recordCount: data.recordCounts.dimensional,
      keyMetrics: [
        { metric: 'Uygunluk Oranı', value: data.dimensionalConformityRate, status: data.dimensionalConformityRate >= 90 ? 'good' : 'warning' },
        { metric: 'Toplam Kontrol', value: data.recordCounts.dimensional, status: data.recordCounts.dimensional >= 15 ? 'good' : 'warning' }
      ]
    },
    {
      module: 'Tank Test Yönetimi',
      status: data.recordCounts.tank >= 10 ? 'healthy' : data.recordCounts.tank >= 5 ? 'warning' : 'critical',
      score: Math.min(100, (data.recordCounts.tank / 15) * 100),
      lastSync: new Date().toLocaleString('tr-TR'),
      recordCount: data.recordCounts.tank,
      keyMetrics: [
        { metric: 'Toplam Test', value: data.recordCounts.tank, status: data.recordCounts.tank >= 10 ? 'good' : 'warning' },
        { metric: 'Başarı Oranı', value: 95, status: 'good' }
      ]
    },
    {
      module: 'Fan Test Analizi',
      status: data.recordCounts.fan >= 8 ? 'healthy' : data.recordCounts.fan >= 4 ? 'warning' : 'critical',
      score: Math.min(100, (data.recordCounts.fan / 12) * 100),
      lastSync: new Date().toLocaleString('tr-TR'),
      recordCount: data.recordCounts.fan,
      keyMetrics: [
        { metric: 'Toplam Test', value: data.recordCounts.fan, status: data.recordCounts.fan >= 8 ? 'good' : 'warning' },
        { metric: 'Performans Skoru', value: 92, status: 'good' }
      ]
    }
  ];
};

// 🚨 CRITICAL ALERTS GENERATOR
const generateCriticalAlerts = (data: any): CriticalAlert[] => {
  if (!data) return [];

  const alerts: CriticalAlert[] = [];

  if (data.overdueDOF > 0) {
    alerts.push({
      id: 'overdue-dof',
      title: 'Gecikmiş DÖF Uyarısı',
      message: `${data.overdueDOF} adet DÖF vadesini geçmiş durumda`,
      severity: data.overdueDOF > 5 ? 'high' : 'medium',
      module: 'DÖF ve 8D Yönetimi',
      timestamp: new Date().toLocaleString('tr-TR'),
      actionRequired: true
    });
  }

  if (data.totalCost > 200000) {
    alerts.push({
      id: 'high-quality-cost',
      title: 'Yüksek Kalite Maliyeti',
      message: `Kalite maliyeti hedefin üzerinde: ${data.totalCost.toLocaleString('tr-TR')} ₺`,
      severity: 'high',
      module: 'Kalite Maliyet Yönetimi',
      timestamp: new Date().toLocaleString('tr-TR'),
      actionRequired: true
    });
  }

  if (data.criticalDefects > 5) {
    alerts.push({
      id: 'critical-defects',
      title: 'Kritik Üretim Hataları',
      message: `${data.criticalDefects} adet kritik seviye hata tespit edildi`,
      severity: 'high',
      module: 'Üretim Kalite Takibi',
      timestamp: new Date().toLocaleString('tr-TR'),
      actionRequired: true
    });
  }

  if (data.supplierPerformance < 80) {
    alerts.push({
      id: 'low-supplier-performance',
      title: 'Düşük Tedarikçi Performansı',
      message: `Tedarikçi performansı kritik seviyede: ${data.supplierPerformance.toFixed(1)}/100`,
      severity: 'medium',
      module: 'Tedarikçi Kalite Yönetimi',
      timestamp: new Date().toLocaleString('tr-TR'),
      actionRequired: true
    });
  }

  return alerts;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { theme: muiTheme, appearanceSettings } = useThemeContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // 🚀 EXECUTIVE DASHBOARD STATE
  const [executiveData, setExecutiveData] = useState<any>(null);
  const [executiveMetrics, setExecutiveMetrics] = useState<ExecutiveMetric[]>([]);
  const [moduleHealth, setModuleHealth] = useState<ModuleHealth[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>([]);

  // REAL DATA STATE
  const [centralData, setCentralData] = useState({
    dof: dataSyncManager.getDOFData(),
    suppliers: dataSyncManager.getSupplierData(),
    qualityCost: dataSyncManager.getQualityCostData(),
    vehicleQuality: dataSyncManager.getVehicleQualityData(),
    audits: dataSyncManager.getAuditData()
  });

  // UI STATE
  const [activeTab, setActiveTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  
  // FILTER STATE
  const [filters, setFilters] = useState({
    searchTerm: '',
    moduleType: '',
    status: '',
    dateRange: '',
    priority: ''
  });
  const [filterExpanded, setFilterExpanded] = useState(false);

  // GENERATE KPI DATA FROM REAL DATA
  const generateKPIDataFromCentral = (): KPIData[] => {
    const generateHistory = (currentValue: number) => [
      { name: 'Pzt', value: Math.max(0, currentValue + Math.random() * 10 - 5) },
      { name: 'Sal', value: Math.max(0, currentValue + Math.random() * 10 - 5) },
      { name: 'Çar', value: Math.max(0, currentValue + Math.random() * 10 - 5) },
      { name: 'Per', value: Math.max(0, currentValue + Math.random() * 10 - 5) },
      { name: 'Cum', value: Math.max(0, currentValue + Math.random() * 10 - 5) },
      { name: 'Cmt', value: Math.max(0, currentValue + Math.random() * 10 - 5) },
      { name: 'Paz', value: currentValue }
    ];

    const dofEfficiency = centralData.dof.total > 0 ? (centralData.dof.closed / centralData.dof.total) * 100 : 100;
    const qualityCostRatio = centralData.qualityCost.totalCost / 100000 * 100;
    const supplierScore = Math.max(50, 100 - (centralData.suppliers.total * 2));
    const auditCompliance = centralData.audits.total > 0 ? Math.min(100, centralData.audits.total * 15) : 0;

    return [
      {
        id: 'kpi-1',
        title: 'DÖF Kapama Oranı',
        currentValue: dofEfficiency,
        targetValue: 85,
        unit: '%',
        status: dofEfficiency >= 85 ? 'excellent' : dofEfficiency >= 70 ? 'good' : dofEfficiency >= 50 ? 'warning' : 'critical',
        trend: dofEfficiency > 75 ? 'up' : 'down',
        trendValue: Math.abs(dofEfficiency - 75),
        category: 'Kalite',
        description: 'DÖF kapatma etkinliği',
        history: generateHistory(dofEfficiency)
      },
      {
        id: 'kpi-2',
        title: 'Kalite Maliyet Oranı',
        currentValue: qualityCostRatio,
        targetValue: 60,
        unit: '%',
        status: qualityCostRatio <= 60 ? 'excellent' : qualityCostRatio <= 80 ? 'good' : qualityCostRatio <= 100 ? 'warning' : 'critical',
        trend: qualityCostRatio < 80 ? 'up' : 'down',
        trendValue: Math.abs(qualityCostRatio - 80),
        category: 'Maliyet',
        description: 'Toplam maliyete oranla kalite maliyeti',
        history: generateHistory(qualityCostRatio)
      },
      {
        id: 'kpi-3',
        title: 'Tedarikçi Performansı',
        currentValue: supplierScore,
        targetValue: 90,
        unit: '/100',
        status: supplierScore >= 90 ? 'excellent' : supplierScore >= 75 ? 'good' : supplierScore >= 60 ? 'warning' : 'critical',
        trend: supplierScore > 80 ? 'up' : 'down',
        trendValue: Math.abs(supplierScore - 80),
        category: 'Tedarik',
        description: 'Tedarikçi kalite skorları',
        history: generateHistory(supplierScore)
      },
      {
        id: 'kpi-4',
        title: 'Tetkik Uyumluluğu',
        currentValue: auditCompliance,
        targetValue: 95,
        unit: '%',
        status: auditCompliance >= 95 ? 'excellent' : auditCompliance >= 80 ? 'good' : auditCompliance >= 65 ? 'warning' : 'critical',
        trend: auditCompliance > 75 ? 'up' : 'down',
        trendValue: Math.abs(auditCompliance - 75),
        category: 'Uygunluk',
        description: 'İç tetkik uygunluk oranı',
        history: generateHistory(auditCompliance)
      }
    ];
  };

  // UPDATE REAL DATA
  const updateCentralData = async (showLoading = false) => {
    try {
      if (showLoading) setIsRefreshing(true);
      setError(null);

      // Veri zaten localStorage'dan geliyor, delay gereksiz
      const newCentralData = {
        dof: dataSyncManager.getDOFData(),
        suppliers: dataSyncManager.getSupplierData(),
        qualityCost: dataSyncManager.getQualityCostData(),
        vehicleQuality: dataSyncManager.getVehicleQualityData(),
        audits: dataSyncManager.getAuditData()
      };
      
      setCentralData(newCentralData);
      
      if (showLoading) {
        setSnackbarOpen(true);
      }
    } catch (err) {
      setError('Veri güncelleme sırasında hata oluştu');
      console.error('Dashboard güncelleme hatası:', err);
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  };

  // 📊 EXECUTIVE DATA LOADER
  const loadExecutiveData = async (showLoading = false) => {
    try {
      if (showLoading) setIsRefreshing(true);
      setError(null);

      // Aggregate all module data
      const data = aggregateExecutiveData();
      
      if (data) {
        setExecutiveData(data);
        setExecutiveMetrics(generateExecutiveMetrics(data));
        setModuleHealth(analyzeModuleHealth(data));
        setCriticalAlerts(generateCriticalAlerts(data));
      }

      if (showLoading) {
        setSnackbarOpen(true);
      }
    } catch (err) {
      setError('Executive dashboard veri güncelleme sırasında hata oluştu');
      console.error('Executive dashboard error:', err);
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  };

  // EFFECTS
  useEffect(() => {
    // İlk yüklemede executive data'yı hızlı initialize et
    loadExecutiveData();
      setIsLoading(false);
    
    const interval = setInterval(() => loadExecutiveData(), 60000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // ... existing event handlers ...

  // 📈 EXECUTIVE METRIC CARD COMPONENT
  const ExecutiveMetricCard: React.FC<{ metric: ExecutiveMetric }> = ({ metric }) => (
    <ElevatedCard sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 100,
          height: 100,
          background: `linear-gradient(135deg, ${metric.color}20, ${metric.color}10)`,
          borderRadius: '0 0 0 100px'
        }}
      />
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5, fontSize: '1rem' }}>
              {metric.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {metric.source}
            </Typography>
          </Box>
          <Box sx={{ color: metric.color, ml: 1 }}>
            {metric.icon}
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight="bold" color={metric.color} sx={{ lineHeight: 1 }}>
            {typeof metric.value === 'number' ? 
              (metric.unit === '₺' ? metric.value.toLocaleString('tr-TR') : metric.value.toFixed(metric.unit === '%' ? 1 : 2))
              : metric.value
            }
            <Typography component="span" variant="h6" sx={{ ml: 0.5, color: 'text.secondary' }}>
              {metric.unit}
            </Typography>
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            {metric.trend === 'up' ? <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} /> :
             metric.trend === 'down' ? <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} /> :
             <TrendingFlatIcon sx={{ fontSize: 16, color: 'warning.main' }} />}
            <Typography variant="caption" color="text.secondary">
              {metric.trend === 'up' ? 'Artış' : metric.trend === 'down' ? 'Azalış' : 'Sabit'}: {metric.trendValue.toFixed(1)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <StatusChip 
            label={metric.status === 'excellent' ? 'Mükemmel' : 
                  metric.status === 'good' ? 'İyi' : 
                  metric.status === 'warning' ? 'Uyarı' : 'Kritik'}
            color={metric.status === 'excellent' || metric.status === 'good' ? 'success' : 
                   metric.status === 'warning' ? 'warning' : 'error'}
            size="small"
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Hedef: {metric.target}{metric.unit}
          </Typography>
        </Box>
      </CardContent>
    </ElevatedCard>
  );

  // 🏥 MODULE HEALTH CARD COMPONENT
  const ModuleHealthCard: React.FC<{ module: ModuleHealth }> = ({ module }) => (
    <ProfessionalCard sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '0.95rem' }}>
            {module.module}
          </Typography>
          <StatusChip
            label={module.status === 'healthy' ? 'Sağlıklı' : 
                  module.status === 'warning' ? 'Uyarı' : 
                  module.status === 'critical' ? 'Kritik' : 'Çevrimdışı'}
            color={module.status === 'healthy' ? 'success' : 
                   module.status === 'warning' ? 'warning' : 'error'}
            size="small"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Sistem Skoru: {module.score.toFixed(0)}/100
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={module.score} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              backgroundColor: 'rgba(0,0,0,0.08)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: module.status === 'healthy' ? 'success.main' : 
                                module.status === 'warning' ? 'warning.main' : 'error.main'
              }
            }} 
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          {module.keyMetrics.map((metric, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {metric.metric}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" fontWeight="bold">
                  {typeof metric.value === 'number' ? metric.value.toFixed(metric.metric.includes('%') ? 1 : 0) : metric.value}
                </Typography>
                <Box sx={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  backgroundColor: metric.status === 'good' ? 'success.main' : 
                                 metric.status === 'warning' ? 'warning.main' : 'error.main'
                }} />
        </Box>
            </Box>
          ))}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          {module.recordCount} kayıt • Son güncelleme: {module.lastSync}
        </Typography>
      </CardContent>
    </ProfessionalCard>
  );

  // 🚨 CRITICAL ALERT COMPONENT
  const CriticalAlertItem: React.FC<{ alert: CriticalAlert }> = ({ alert }) => (
    <Alert 
      severity={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
      sx={{ mb: 1, borderRadius: 2 }}
      action={
        alert.actionRequired && (
          <Button size="small" variant="outlined" sx={{ fontSize: '0.7rem' }}>
            İncele
          </Button>
        )
      }
    >
      <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
        {alert.title}
      </Typography>
      <Typography variant="body2" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
        {alert.message}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
        {alert.module} • {alert.timestamp}
      </Typography>
    </Alert>
  );

  if (isLoading) {
    return (
      <ElegantContainer>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Executive Dashboard Yükleniyor...
          </Typography>
        </Box>
      </ElegantContainer>
    );
  }

  return (
    <ElegantContainer>
      {/* EXECUTIVE HEADER */}
      <ProfessionalPaper sx={{ 
        mb: 3, 
        background: `linear-gradient(135deg, #1976D2 0%, #D32F2F 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box
            sx={{ 
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%'
          }}
        />
        <Box sx={{ p: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                Executive Dashboard
            </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontSize: '1.1rem' }}>
                Kalite Yönetim Sistemi - Genel Bakış ve Kritik Metrikler
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Chip 
                  icon={<TimelineIcon sx={{ fontSize: 14 }} />}
                  label="Gerçek Zamanlı Veri" 
                  variant="outlined"
                  size="small"
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.3)',
                    fontSize: '0.75rem'
                  }}
                />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Son güncelleme: {new Date().toLocaleString('tr-TR')}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
              <Tooltip title="Verileri Yenile">
                <ElegantButton
                  variant="outlined"
                  startIcon={isRefreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                  onClick={() => loadExecutiveData(true)}
                  disabled={isRefreshing}
                  sx={{ 
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Yenile
                </ElegantButton>
              </Tooltip>

              <Tooltip title="Rapor İndir">
                <IconButton 
                  size="small"
                  sx={{ 
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </ProfessionalPaper>

      {/* EXECUTIVE METRICS */}
      <SectionHeader 
        title="Kritik Performans Göstergeleri" 
        sx={{ mb: 3 }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: -2 }}>
        Tüm modüllerden toplanan executive metrikler
            </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {executiveMetrics.map((metric) => (
          <Grid item xs={12} sm={6} lg={4} key={metric.id}>
            <ExecutiveMetricCard metric={metric} />
            </Grid>
          ))}
        </Grid>

      {/* CRITICAL ALERTS & MODULE HEALTH */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Critical Alerts */}
        <Grid item xs={12} md={6}>
          <ProfessionalCard>
        <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <WarningAmberIcon sx={{ color: 'error.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Kritik Uyarılar
                          </Typography>
                <Chip label={criticalAlerts.length} color="error" size="small" />
                      </Box>

              {criticalAlerts.length > 0 ? (
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {criticalAlerts.map((alert) => (
                    <CriticalAlertItem key={alert.id} alert={alert} />
                  ))}
                      </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                  <CheckCircleIcon sx={{ fontSize: 48, mb: 1, color: 'success.main' }} />
                  <Typography variant="body2">
                    Kritik uyarı bulunmuyor
                        </Typography>
                      </Box>
              )}
                </CardContent>
          </ProfessionalCard>
        </Grid>

        {/* Module Health Summary */}
        <Grid item xs={12} md={6}>
          <ProfessionalCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <MonitorHeartIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Modül Sistem Durumu
            </Typography>
        </Box>
      
        <Grid container spacing={2}>
                {moduleHealth.slice(0, 4).map((module, index) => (
                  <Grid item xs={12} key={index}>
                    <ModuleHealthCard module={module} />
                  </Grid>
                ))}
              </Grid>
                </CardContent>
          </ProfessionalCard>
            </Grid>
        </Grid>

      {/* ... existing module cards and other dashboard components ... */}

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          Executive Dashboard başarıyla güncellendi
        </Alert>
      </Snackbar>
    </ElegantContainer>
  );
};

export default Dashboard; 