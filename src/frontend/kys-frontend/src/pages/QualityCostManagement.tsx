import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  IconButton,
  Chip,
  Alert,
  AlertTitle,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Stack,
  Divider,
  Tabs,
  Tab,
  Fab,
  Tooltip,
  Fade,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Switch,
  FormControlLabel,
  Collapse,
  ButtonBase,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListSubheader,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  MonetizationOn as MoneyIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Analytics as InsightsIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon,
  Add as AddIcon,

  Upload as UploadIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  TableChart as TableChartIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ImportExport as ImportExportIcon,
  GetApp as GetAppIcon,

  AutoGraph as AutoGraphIcon,
  Analytics as AnalyticsIcon,
  Business as BusinessIcon,
  Scale as ScaleIcon,
  Info as InfoIcon,
  Report as ReportIcon,
  DirectionsCar as DirectionsCarIcon,
  CalendarToday as CalendarTodayIcon,
  DateRange as DateRangeIcon,
  Close as CloseIcon,
  ReportProblem as ReportProblemIcon,
  DirectionsCar as VehicleIcon,
  LocalShipping as TruckIcon,
  Build as ToolIcon,
  Factory as FactoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Flag as FlagIcon,
  GpsFixed as TargetIcon,
  FileDownload as ExportIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterListIcon,
  Tune as TuneIcon,
  Science as ScienceIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useThemeContext } from '../context/ThemeContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts';

// DÖF/8D Integration Import
import { navigateToDOFForm, checkDOFStatus, DOFCreationParams } from '../utils/dofIntegration';

// ============================================
// 🚗 YENİ: UNIFIED QUALITY & VEHICLE INTERFACES
// ============================================

// ============================================
// 🚗 YENİ: ARAÇ KATEGORİLERİ SİSTEMİ
// ============================================

// Araç kategorileri
type VehicleCategory = 
  | 'Kompakt Araçlar'
  | 'Araç Üstü Vakumlu'
  | 'Çekilir Tip Mekanik Süpürgeler'
  | 'Kompost Makinesi'
  | 'Rusya Motor Odası'
  | 'HSCK'
  | 'Genel';

// Spesifik araç modelleri
type VehicleModel = 
  | 'FTH-240'
  | 'Çelik-2000'
  | 'Aga2100'
  | 'Aga3000'
  | 'Aga6000'
  | 'Kompost Makinesi'
  | 'Çay Toplama Makinesi'
  | 'KDM 35'
  | 'KDM 70'
  | 'KDM 80'
  | 'Rusya Motor Odası'
  | 'Ural'
  | 'HSCK'
  | 'Genel Amaçlı'
  | 'Özel Proje'
  | 'Protip';

// Kategori ve model eşleştirmesi
const VEHICLE_CATEGORIES: Record<VehicleCategory, VehicleModel[]> = {
  'Kompakt Araçlar': ['Aga2100', 'Aga3000', 'Aga6000'],
  'Araç Üstü Vakumlu': ['KDM 80', 'KDM 70', 'KDM 35', 'Çay Toplama Makinesi'],
  'Çekilir Tip Mekanik Süpürgeler': ['FTH-240', 'Çelik-2000', 'Ural'],
  'Kompost Makinesi': ['Kompost Makinesi'],
  'Rusya Motor Odası': ['Rusya Motor Odası'],
  'HSCK': ['HSCK'],
  'Genel': ['Genel Amaçlı', 'Özel Proje', 'Protip'] // Genel kategori modelleri
};

// Model'den kategoriye mapping
const MODEL_TO_CATEGORY: Record<VehicleModel, VehicleCategory> = {
  'Aga2100': 'Kompakt Araçlar',
  'Aga3000': 'Kompakt Araçlar',
  'Aga6000': 'Kompakt Araçlar',
  'KDM 80': 'Araç Üstü Vakumlu',
  'KDM 70': 'Araç Üstü Vakumlu',
  'KDM 35': 'Araç Üstü Vakumlu',
  'Çay Toplama Makinesi': 'Araç Üstü Vakumlu',
  'FTH-240': 'Çekilir Tip Mekanik Süpürgeler',
  'Çelik-2000': 'Çekilir Tip Mekanik Süpürgeler',
  'Ural': 'Çekilir Tip Mekanik Süpürgeler',
  'Kompost Makinesi': 'Kompost Makinesi',
  'Rusya Motor Odası': 'Rusya Motor Odası',
  'HSCK': 'HSCK',
  'Genel Amaçlı': 'Genel',
  'Özel Proje': 'Genel',
  'Protip': 'Genel'
};

// Atık türleri
type WasteType = 'Ret' | 'Hurda' | 'Fire' | 'Diğer';

// Malzeme türleri
type MaterialType = 
  // Yapısal Çelikler
  | 'S235' | 'S275' | 'S355' | 'S420' | 'S460'
  // Paslanmaz Çelikler  
  | '304 Paslanmaz' | '316 Paslanmaz' | '321 Paslanmaz' | '430 Paslanmaz'
  // Aşınma Dayanımlı Çelikler
  | 'Hardox400' | 'Hardox450' | 'Hardox460' | 'Hardox500' | 'Hardox600'
  // Yüksek Mukavemetli Çelikler
  | 'S690' | 'S890' | 'S960'
  // Özel Alaşımlar
  | 'Cor-Ten A' | 'Cor-Ten B' | 'Weathering Steel'
  // Alüminyum Alaşımlar
  | 'Al 1050' | 'Al 3003' | 'Al 5754' | 'Al 6061'
  // Galvaniz ve Kaplama
  | 'DX51D+Z' | 'DX52D+Z' | 'DX53D+Z'
  // Diğer
  | 'Diğer';

// Kategorize edilmiş malzeme türleri
const MATERIAL_TYPE_CATEGORIES = {
  'Yapısal Çelikler': ['S235', 'S275', 'S355', 'S420', 'S460'] as MaterialType[],
  'Paslanmaz Çelikler': ['304 Paslanmaz', '316 Paslanmaz', '321 Paslanmaz', '430 Paslanmaz'] as MaterialType[],
  'Aşınma Dayanımlı Çelikler': ['Hardox400', 'Hardox450', 'Hardox460', 'Hardox500', 'Hardox600'] as MaterialType[],
  'Yüksek Mukavemetli Çelikler': ['S690', 'S890', 'S960'] as MaterialType[],
  'Özel Alaşımlar': ['Cor-Ten A', 'Cor-Ten B', 'Weathering Steel'] as MaterialType[],
  'Alüminyum Alaşımlar': ['Al 1050', 'Al 3003', 'Al 5754', 'Al 6061'] as MaterialType[],
  'Galvaniz ve Kaplama': ['DX51D+Z', 'DX52D+Z', 'DX53D+Z'] as MaterialType[],
  'Diğer': ['Diğer'] as MaterialType[]
};

// Malzeme fiyat bilgisi
interface MaterialPricing {
  id: string;
  malzemeTuru: MaterialType;
  alisKgFiyati: number;    // Alış fiyatı (₺/kg)
  satisKgFiyati: number;   // Satış fiyatı (₺/kg) - hurda/fire satış
  fireGeriKazanimOrani: number; // Fire geri kazanım oranı (%)
  hurdaGeriKazanimOrani: number; // Hurda geri kazanım oranı (%)
  guncellemeTarihi: string;
  aktif: boolean;
  aciklama?: string;
}

// Unified Quality Record - Hem kalitesizlik maliyeti hem araç takibi için
interface UnifiedQualityRecord {
  // Temel kayıt bilgileri
  id: string;
  tarih: string;
  createdDate: string;
  createdBy: string;
  
  // Kalitesizlik maliyeti alanları (mevcut)
  parcaKodu?: string;
  maliyetTuru: string;
  maliyet: number;
  birim: string;
  arac?: string;
  aciklama: string;
  
  // YENİ: Araç bazlı tracking alanları
  aracModeli?: VehicleModel;
  atikTuru?: WasteType;
  miktar?: number;          // adet cinsinden
  agirlik?: number;         // kg cinsinden
  unit?: 'adet' | 'kg' | 'lt' | 'ton';
  category?: string;        // Motor Parçaları, Şase Elemanları, vs.
  
  // YENİ: Malzeme bazlı maliyet hesaplama
  malzemeTuru?: MaterialType;  // Malzeme cinsi
  malzemeAlisFiyati?: number;  // Otomatik doldurulur
  malzemeSatisFiyati?: number; // Otomatik doldurulur
  netMaliyet?: number;         // Gerçek net maliyet (alış - satış)
  geriKazanim?: number;        // Geri kazanım miktarı (₺)
  
  // Otomatik hesaplanan alanlar
  birimMaliyet?: number;    // maliyet/miktar
  kgMaliyet?: number;       // maliyet/kg
  
  // Performans tracking
  isActive?: boolean;
  cost?: number;            // compat field
  quantity?: number;        // compat field
}

// Araç kategorisi hedefleri için interface
interface VehicleCategoryTarget {
  id: string;
  kategori: VehicleCategory;
  donem: string;            // 2025-01, 2025-Q1, 2025
  donemTuru: 'ay' | 'ceyrek' | 'yil';
  
  hedefler: {
    maksRetAdet: number;
    maksRetMaliyet: number;
    maksHurdaKg: number;
    maksHurdaMaliyet: number;
    maksFireKg: number;       // Fire için kg birimi
    maksFireMaliyet: number;
    toplamMaksimumMaliyet: number;
    hedefVerimlilik: number; // %
  };
  
  gerceklesme: {
    guncelRetAdet: number;
    guncelRetMaliyet: number;
    guncelHurdaKg: number;
    guncelHurdaMaliyet: number;
    guncelFireKg: number;     // Fire için kg birimi
    guncelFireMaliyet: number;
    toplamMaliyet: number;
    mevcutVerimlilik: number; // %
  };
  
  performans: {
    retPerformans: number;    // %
    hurdaPerformans: number;  // %
    firePerformans: number;   // %
    toplamPerformans: number; // %
    status: 'hedef_altinda' | 'hedefte' | 'hedef_ustunde';
  };
  
  createdDate: string;
  updatedDate: string;
  createdBy: string;
  isActive: boolean;
}

// Geriye uyumluluk için VehicleTarget (eskisi gibi)
interface VehicleTarget {
  id: string;
  aracModeli?: VehicleModel; // Optional çünkü kategori bazlı da olabilir
  kategori?: VehicleCategory; // Yeni: kategori bazlı hedefler
  donem: string;            // 2025-01, 2025-Q1, 2025
  donemTuru: 'ay' | 'ceyrek' | 'yil';
  
  hedefler: {
    maksRetAdet: number;
    maksRetMaliyet: number;
    maksHurdaKg: number;
    maksHurdaMaliyet: number;
    maksFireKg: number;       // Fire için kg birimi
    maksFireMaliyet: number;
    toplamMaksimumMaliyet: number;
    hedefVerimlilik: number; // %
  };
  
  gerceklesme: {
    guncelRetAdet: number;
    guncelRetMaliyet: number;
    guncelHurdaKg: number;
    guncelHurdaMaliyet: number;
    guncelFireKg: number;     // Fire için kg birimi
    guncelFireMaliyet: number;
    toplamMaliyet: number;
    mevcutVerimlilik: number; // %
  };
  
  performans: {
    retPerformans: number;    // %
    hurdaPerformans: number;  // %
    firePerformans: number;   // %
    toplamPerformans: number; // %
    status: 'hedef_altinda' | 'hedefte' | 'hedef_ustunde';
  };
  
  createdDate: string;
  updatedDate: string;
  createdBy: string;
  isActive: boolean;
}

// Akıllı Hedef Önerisi Interface'i
interface SmartTargetSuggestion {
  aracModeli?: VehicleModel; // Geriye uyumluluk için
  kategori?: VehicleCategory; // Yeni: kategori bazlı öneriler
  displayName?: string; // Görüntülenecek isim
  onerilenHedefler: {
    retAdet: number;
    retMaliyet: number;
    hurdaKg: number;
    hurdaMaliyet: number;
    fireKg: number;
    fireMaliyet: number;
    toplamMaliyet: number;
  };
  gecmisPerformans: {
    son3AyOrtalama: number;
    son6AyOrtalama: number;
    yillikOrtalama: number;
    trend: 'iyilesen' | 'stabil' | 'kotulesen';
  };
  oneriSebebi: string;
  guvenilirlik: number; // %
}

// Araç performans analizi
interface VehiclePerformanceAnalysis {
  aracModeli?: VehicleModel; // Optional: spesifik model
  kategori?: VehicleCategory; // Yeni: kategori bazlı analiz
  displayName?: string; // Görüntülenecek isim (kategori adı ya da model adı)
  // Geriye uyumluluk için backup
  categoryModels?: VehicleModel[]; // Kategorideki alt modeller
  toplam: {
    kayitSayisi: number;
    toplamMaliyet: number;
    toplamMiktar: number;
    toplamAgirlik: number;
  };
  
  atikTuruDagilim: {
    ret: { adet: number; maliyet: number };
    hurda: { kg: number; maliyet: number };
    fire: { kg: number; maliyet: number };
  };
  
  trend: {
    sonUcAy: number[];       // maliyet trendi
    yuzdelikDegisim: number; // %
    trendYonu: 'yukselis' | 'dususte' | 'stabil';
  };
  
  hedefKarsilastirma?: {
    hedefMaliyet: number;
    gercekMaliyet: number;
    sapmaYuzdesi: number; // Pozitif değer iyi performans (hedef altında), negatif değer kötü performans (hedef üstünde)
    durum: 'basarili' | 'dikkat' | 'kritik';
    performansDurumu: string;
  };
}

// ✅ Context7 Best Practice: Advanced TypeScript Interfaces
interface COPQData {
  // İç Hata Maliyetleri (Internal Failure Costs)
  internalFailure: {
    rework: number;
    scrap: number;
    troubleshooting: number;
    redesign: number;
    downtime: number;
  };
  
  // Dış Hata Maliyetleri (External Failure Costs)
  externalFailure: {
    warranty: number;
    complaints: number;
    returns: number;
    recalls: number;
    legalCosts: number;
    customerLoss: number;
  };
  
  // Değerlendirme Maliyetleri (Appraisal Costs)
  appraisal: {
    inspection: number;
    testing: number;
    qualityAudits: number;
    supplierSurveillance: number;
    instrumentCalibration: number;
  };
  
  // Önleme Maliyetleri (Prevention Costs)
  prevention: {
    qualityPlanning: number;
    processControl: number;
    training: number;
    qualityImprovement: number;
    supplierQualification: number;
  };
}

interface QualityCostKPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  category: 'prevention' | 'appraisal' | 'internal' | 'external';
}

interface AIInsight {
  id: string;
  type: 'cost_reduction' | 'trend_alert' | 'benchmark' | 'recommendation';
  severity: 'dusuk' | 'orta' | 'yuksek';
  title: string;
  description: string;
  action: string;
  impact: number;
  confidence: number;
  timeframe: string;
}

interface ParetoAnalysis {
  category: string;
  cost: number;
  percentage: number;
  cumulative: number;
  count: number;
}

// ============================================
// 🚗 YENİ: AYLIK ÜRETİM ARAÇ SAYILARI SİSTEMİ
// ============================================

// ✅ TAMAMEN YENİ: Kategori Bazlı Üretim Verisi
interface MonthlyCategoryProduction {
  id: string;
  kategori: VehicleCategory;
  displayName: string;      // Görüntülenecek isim
  donem: string;            // 2025-01 formatında
  donemTuru: 'ay';          // Şu an sadece aylık
  uretilenAracSayisi: number;
  planlanmisUretim: number;
  gerceklesmeOrani: number; // (üretilen/planlanan) * 100
  categoryModels: VehicleModel[]; // Bu kategorideki modeller
  createdDate: string;
  updatedDate: string;
  createdBy: string;
  isActive: boolean;
  aciklama?: string;
}

// ⚠️ GERIYE UYUMLULUK: Eski interface (deprecated, yavaş yavaş kaldırılacak)
interface MonthlyVehicleProduction {
  id: string;
  aracModeli: VehicleModel;
  kategori: VehicleCategory;
  donem: string;            // 2025-01 formatında
  donemTuru: 'ay';          // Şu an sadece aylık
  uretilenAracSayisi: number;
  planlanmisUretim?: number; // Opsiyonel: planlanan üretim
  gerceklesmeOrani?: number; // (üretilen/planlanan) * 100
  // Hedef alanları kaldırıldı - Hedefler sekmesinden çekilecek
  // Gerçek değerler kalitesizlik maliyeti verilerinden hesaplanacak
  createdDate: string;
  updatedDate: string;
  createdBy: string;
  isActive: boolean;
  aciklama?: string;
}

// ✅ Context7 Styled Components
const MetricCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: 16,
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    borderColor: theme.palette.primary.main,
  },
}));



const InsightCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}05 100%)`,
  border: `1px solid ${theme.palette.primary.main}20`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

const StyledAccordion = styled(Accordion)(() => ({
  marginBottom: 20,
  borderRadius: '16px !important',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(25, 118, 210, 0.12)',
  overflow: 'hidden',
  '&:before': {
    display: 'none',
  },
  '& .MuiAccordionSummary-root': {
    backgroundColor: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    color: '#ffffff',
    borderRadius: '16px 16px 0 0',
    minHeight: 72,
    padding: '0 24px',
    '&.Mui-expanded': {
      minHeight: 72,
      borderRadius: '16px 16px 0 0',
    },
    '& .MuiAccordionSummary-content': {
      margin: '16px 0',
      '&.Mui-expanded': {
        margin: '16px 0',
      },
    },
    '& .MuiAccordionSummary-expandIconWrapper': {
      color: '#ffffff',
      '&.Mui-expanded': {
        transform: 'rotate(180deg)',
      },
    },
    '&:hover': {
      background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
    },
  },
  '& .MuiAccordionDetails-root': {
    backgroundColor: '#ffffff',
    padding: 32,
    borderTop: '1px solid rgba(25, 118, 210, 0.08)',
  }
})) as any;

export default function QualityCostManagement() {
  const { theme: muiTheme, appearanceSettings } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Tema entegreli StyledAccordion
  const StyledAccordion = styled(Accordion)(() => ({
    marginBottom: 20,
    borderRadius: '16px !important',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(25, 118, 210, 0.12)',
    overflow: 'hidden',
    '&:before': {
      display: 'none',
    },
    '& .MuiAccordionSummary-root': {
      backgroundColor: `linear-gradient(135deg, ${appearanceSettings.primaryColor} 0%, ${appearanceSettings.primaryColor}dd 100%)`,
      background: `linear-gradient(135deg, ${appearanceSettings.primaryColor} 0%, ${appearanceSettings.primaryColor}dd 100%)`,
      color: '#ffffff',
      borderRadius: '16px 16px 0 0',
      minHeight: 72,
      padding: '0 24px',
      '&.Mui-expanded': {
        minHeight: 72,
        borderRadius: '16px 16px 0 0',
      },
      '& .MuiAccordionSummary-content': {
        margin: '16px 0',
        '&.Mui-expanded': {
          margin: '16px 0',
        },
      },
      '& .MuiAccordionSummary-expandIconWrapper': {
        color: '#ffffff',
        '&.Mui-expanded': {
          transform: 'rotate(180deg)',
        },
      },
      '&:hover': {
        background: `linear-gradient(135deg, ${appearanceSettings.primaryColor}cc 0%, ${appearanceSettings.primaryColor}ee 100%)`,
      },
    },
    '& .MuiAccordionDetails-root': {
      backgroundColor: '#ffffff',
      padding: 32,
      borderTop: `1px solid ${appearanceSettings.primaryColor}20`,
    }
  })) as any;

  // ✅ Context7 State Management
  const [currentTab, setCurrentTab] = useState(0);

  // ✅ YENİ: UNIFIED DATA PROCESSING STATES
  const [vehicleTargets, setVehicleTargets] = useState<VehicleTarget[]>([]);
  const [unifiedRecords, setUnifiedRecords] = useState<UnifiedQualityRecord[]>([]);
  const [vehiclePerformanceData, setVehiclePerformanceData] = useState<VehiclePerformanceAnalysis[]>([]);
  const [timeframe, setTimeframe] = useState('3M');
  const [copqData, setCopqData] = useState<COPQData | null>(null);
  const [kpis, setKpis] = useState<QualityCostKPI[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [paretoData, setParetoData] = useState<ParetoAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [costEntryDialogOpen, setCostEntryDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  
  // ✅ YENİ: Global detay dialog state'leri (modal için)
  const [globalDetailDialogOpen, setGlobalDetailDialogOpen] = useState(false);
  const [globalSelectedDetailEntry, setGlobalSelectedDetailEntry] = useState<any>(null);
  const [editingCostEntry, setEditingCostEntry] = useState<any>(null);
  const [formData, setFormData] = useState({
    category: '',
    subCategory: '',
    department: '',
    cost: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'active',
    includeLabor: false,
  });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredCostData, setFilteredCostData] = useState([]);
  const [costData, setCostData] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);

  // ✅ Context7: Real-time Analytics State for Data Sharing
  const [realTimeAnalytics, setRealTimeAnalytics] = useState<any>(null);

  // ✅ Context7: Global Filter State for All Tabs
  const [globalFilters, setGlobalFilters] = useState({
    maliyetTuru: '',
    birim: '',
    arac: '',
    searchTerm: '',
    selectedMonth: '',
    selectedYear: new Date().getFullYear().toString()
  });

  // ✅ Context7: Global Filtered Data for All Tabs
  const [globalFilteredData, setGlobalFilteredData] = useState<any[]>([]);
  
  // ✅ FİLTRELEME DÜZELTMESİ: Ana component'te de costData state'i tut
  const [mainCostData, setMainCostData] = useState<any[]>([]);
  
  // ✅ YENİ: Collapsible Filter State
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  // ✅ REAL-TIME TRIGGER: localStorage değişikliklerini dinlemek için state
  const [dataRefreshTrigger, setDataRefreshTrigger] = useState(0);

  // ✅ PROFESYONEL: Sessiz Veri Koruma ve Otomatik Kurtarma Sistemi
  useEffect(() => {
    console.log('🛡️ Kalite Maliyet Yönetimi - Otomatik Veri Koruma Aktif');
    
    const performDataIntegrityCheck = () => {
      try {
        const mainData = localStorage.getItem('kys-cost-management-data');
        const backupData = localStorage.getItem('kys-cost-management-data-backup');
        
        // Veri durumu analizi
        const hasMainData = mainData && mainData !== '[]';
        const hasBackupData = backupData;
        
        console.log('📊 Veri Durumu Analizi:', {
          anaVeri: hasMainData ? `${JSON.parse(mainData).length} kayıt` : 'YOK',
          backupVeri: hasBackupData ? 'MEVCUT' : 'YOK'
        });
        
        // Otomatik backup oluşturma
        if (hasMainData && !hasBackupData) {
          const parsedMainData = JSON.parse(mainData);
          if (Array.isArray(parsedMainData) && parsedMainData.length > 0) {
            const backupObj = {
              data: parsedMainData,
              timestamp: new Date().toISOString(),
              version: '2.1',
              source: 'auto-protection-system',
              checksum: parsedMainData.length
            };
            localStorage.setItem('kys-cost-management-data-backup', JSON.stringify(backupObj));
            console.log('✅ Koruma sistemi: Otomatik backup oluşturuldu');
          }
        }
        
        // Gelişmiş sample data dedeksiyon sistemi
        if (hasMainData) {
          const parsedData = JSON.parse(mainData);
          if (Array.isArray(parsedData)) {
            // Sample data pattern analizi
            const sampleDataPatterns = {
              exactFifty: parsedData.length === 50,
              allStartWith5001: parsedData.every(item => item.parcaKodu?.startsWith('5001')),
              sameCreationDay: parsedData.filter(item => 
                item.olusturmaTarihi && 
                new Date(item.olusturmaTarihi).toDateString() === new Date().toDateString()
              ).length > 40,
              sequentialIds: parsedData.every((item, index) => item.id === (51 - index))
            };
            
            const sampleDataScore = Object.values(sampleDataPatterns).filter(Boolean).length;
            
            if (sampleDataScore >= 3) {
              console.log('⚠️ Yüksek olasılık sample data override tespit edildi (skor:', sampleDataScore, '/4)');
              
              // Otomatik kurtarma dene
              if (hasBackupData) {
                const backup = JSON.parse(backupData);
                if (backup.data && Array.isArray(backup.data) && 
                    backup.data.length > 0 && backup.data.length !== 50) {
                  console.log('🔄 Otomatik kurtarma sistemi devreye giriyor...');
                  localStorage.setItem('kys-cost-management-data', JSON.stringify(backup.data));
                  console.log('✅ Kullanıcı verileri sessizce geri yüklendi');
                  
                  // Refresh tetikle
                  setTimeout(() => {
                    window.location.reload();
                  }, 100);
                }
              }
            }
          }
        }
        
      } catch (error) {
        console.error('❌ Veri bütünlük kontrolü hatası:', error);
      }
    };
    
    // İlk kontrol
    performDataIntegrityCheck();
    
    // Periyodik kontrol (5 saniyede bir)
    const integrityInterval = setInterval(performDataIntegrityCheck, 5000);
    
    return () => clearInterval(integrityInterval);
  }, []);

  // ✅ ARAÇ BAZLI TAKİP SENKRONIZASYON FİXİ: Otomatik veri yenileme fonksiyonu
  const triggerDataRefresh = useCallback(() => {
    console.log('🔄 Veri yenileme tetiklendi...');
    setDataRefreshTrigger(prev => prev + 1);
  }, []);

  // ✅ Professional Modal Dialog States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    title: string;
    subtitle?: string;
    data: any[];
    type: 'highest-cost' | 'monthly-records' | 'problematic-unit' | 'part-analysis' | 'unit-analysis';
    icon?: React.ReactNode;
    openDOFForm?: (recordData: any) => void;
    isDOFCreated?: (recordData: any) => boolean;
  } | null>(null);

  // 🚗 Araç Detay Dialog State'leri
  const [vehicleDetailDialogOpen, setVehicleDetailDialogOpen] = useState(false);
  const [selectedVehicleData, setSelectedVehicleData] = useState<VehiclePerformanceAnalysis | null>(null);
  const [vehicleDetailTab, setVehicleDetailTab] = useState(0);

  // ✅ DOF Form Dialog States


  // ============================================
  // 🔄 YENİ: UNIFIED DATA PROCESSING FUNCTIONS
  // ============================================

  // Mevcut kalitesizlik maliyeti verisini unified format'a dönüştür
  const convertToUnifiedRecord = useCallback((costRecord: any): UnifiedQualityRecord => {
    return {
      id: costRecord.id?.toString() || `cost_${Date.now()}`,
      tarih: costRecord.tarih || new Date().toISOString().split('T')[0],
      createdDate: costRecord.olusturmaTarihi || new Date().toISOString(),
      createdBy: 'System',
      
      // Mevcut kalitesizlik maliyeti alanları
      parcaKodu: costRecord.parcaKodu || undefined,
      maliyetTuru: costRecord.maliyetTuru || '',
      maliyet: Number(costRecord.maliyet) || 0,
      birim: costRecord.birim || '',
      arac: costRecord.arac || undefined,
      aciklama: costRecord.aciklama || `${costRecord.maliyetTuru} - ${costRecord.birim}`,
      
      // Araç bazlı tracking alanları (otomatik mapping)
      aracModeli: mapAracToVehicleModel(costRecord.arac),
      atikTuru: mapMaliyetTuruToWasteType(costRecord.maliyetTuru),
      miktar: costRecord.miktar || costRecord.adet || 1,
      agirlik: costRecord.agirlik || 0,
      unit: costRecord.unit || (costRecord.agirlik > 0 ? 'kg' : 'adet'),
      category: mapBirimToCategory(costRecord.birim),
      
      // Otomatik hesaplanan alanlar
      birimMaliyet: costRecord.miktar ? Number(costRecord.maliyet) / Number(costRecord.miktar) : 0,
      kgMaliyet: costRecord.agirlik ? Number(costRecord.maliyet) / Number(costRecord.agirlik) : 0,
      
      // Compat fields
      isActive: costRecord.durum === 'aktif',
      cost: Number(costRecord.maliyet) || 0,
      quantity: costRecord.miktar || costRecord.adet || 1
    };
  }, []);

  // Araç adını VehicleModel'e map et
  const mapAracToVehicleModel = useCallback((arac?: string): VehicleModel | undefined => {
    if (!arac) return undefined;
    
    const mapping: Record<string, VehicleModel> = {
      'fth240': 'FTH-240',
      'celik2000': 'Çelik-2000',
      'aga2100': 'Aga2100',
      'aga3000': 'Aga3000',
      'aga6000': 'Aga6000',
      'kompost_makinesi': 'Kompost Makinesi',
      'cay_toplama_makinesi': 'Çay Toplama Makinesi',
      'kdm35': 'KDM 35',
      'kdm70': 'KDM 70',
      'kdm80': 'KDM 80',
      'rusya_motor_odasi': 'Rusya Motor Odası',
      'ural': 'Ural',
      'hsck': 'HSCK'
    };
    
    return mapping[arac.toLowerCase()] || undefined;
  }, []);

  // Maliyet türünü atık türüne map et
  const mapMaliyetTuruToWasteType = useCallback((maliyetTuru: string): WasteType | undefined => {
    const mapping: Record<string, WasteType> = {
      'hurda': 'Hurda',
      'fire': 'Fire',
      'yeniden_islem': 'Ret',
      'iade': 'Ret',
      'sikayet': 'Diğer',
      'garanti': 'Diğer',
      'onleme': 'Diğer'
    };
    
    return mapping[maliyetTuru] || 'Diğer';
  }, []);

  // Birimi kategoriye map et
  const mapBirimToCategory = useCallback((birim: string): string => {
    const mapping: Record<string, string> = {
      'kaynakhane': 'Şase Elemanları',
      'mekanik_montaj': 'Motor Parçaları',
      'elektrikhane': 'Elektrik Sistemleri',
      'boyahane': 'Kaplama ve Boyama',
      'bukum': 'Metal İşleme',
      'kesim': 'Metal İşleme',
      'kalite_kontrol': 'Kalite Kontrol',
      'arge': 'Ar-Ge',
      'idari_isler': 'İdari İşler',
      'uretim_planlama': 'Planlama',
      'satin_alma': 'Tedarik',
      'satis': 'Satış',
      'satis_sonrasi_hizmetleri': 'Satış Sonrası Hizmetleri',
      'depo': 'Lojistik'
    };
    
    return mapping[birim] || 'Genel';
  }, []);

  // Unified record'dan araç performans analizi oluştur
  const generateVehiclePerformanceAnalysis = useCallback((records: UnifiedQualityRecord[]): VehiclePerformanceAnalysis[] => {
    const vehicleGroups = records.reduce((acc, record) => {
      const vehicleModel = record.aracModeli;
      if (!vehicleModel) return acc;
      
      if (!acc[vehicleModel]) {
        acc[vehicleModel] = [];
      }
      acc[vehicleModel].push(record);
      return acc;
    }, {} as Record<VehicleModel, UnifiedQualityRecord[]>);

    return Object.entries(vehicleGroups).map(([vehicleModel, vehicleRecords]) => {
      const totalCost = vehicleRecords.reduce((sum, r) => sum + r.maliyet, 0);
      const totalQuantity = vehicleRecords.reduce((sum, r) => sum + (r.miktar || 1), 0);
      const totalWeight = vehicleRecords.reduce((sum, r) => sum + (r.agirlik || 0), 0);

      // Atık türü dağılımı
      const retRecords = vehicleRecords.filter(r => r.atikTuru === 'Ret');
      const hurdaRecords = vehicleRecords.filter(r => r.atikTuru === 'Hurda');
      const fireRecords = vehicleRecords.filter(r => r.atikTuru === 'Fire');

      // Son 3 ay trend
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const recentRecords = vehicleRecords.filter(r => new Date(r.tarih) >= threeMonthsAgo);
      
      const monthlyTrend = recentRecords.reduce((acc, record) => {
        const month = new Date(record.tarih).getMonth();
        acc[month] = (acc[month] || 0) + record.maliyet;
        return acc;
      }, {} as Record<number, number>);

      const trendArray = Object.values(monthlyTrend);
      const avgChange = trendArray.length > 1 ? 
        ((trendArray[trendArray.length - 1] - trendArray[0]) / trendArray[0]) * 100 : 0;

             return {
         aracModeli: vehicleModel as VehicleModel,
         toplam: {
           kayitSayisi: vehicleRecords.length,
           toplamMaliyet: totalCost,
           toplamMiktar: totalQuantity,
           toplamAgirlik: totalWeight
         },
         atikTuruDagilim: {
           ret: {
             adet: retRecords.reduce((sum, r) => sum + (r.miktar || 1), 0),
             maliyet: retRecords.reduce((sum, r) => sum + r.maliyet, 0)
           },
           hurda: {
             kg: hurdaRecords.reduce((sum, r) => sum + (r.agirlik || 0), 0),
             maliyet: hurdaRecords.reduce((sum, r) => sum + r.maliyet, 0)
           },
           fire: {
             kg: fireRecords.reduce((sum, r) => sum + (r.agirlik || 0), 0),
             maliyet: fireRecords.reduce((sum, r) => sum + r.maliyet, 0)
           }
         },
         trend: {
           sonUcAy: trendArray,
           yuzdelikDegisim: avgChange,
           trendYonu: (avgChange > 5 ? 'yukselis' : avgChange < -5 ? 'dususte' : 'stabil') as 'yukselis' | 'dususte' | 'stabil'
         }
       };
    }).sort((a, b) => b.toplam.toplamMaliyet - a.toplam.toplamMaliyet);
  }, []);

  // Araç hedefleri ile gerçekleşmeleri karşılaştır
  const compareWithTargets = useCallback((analysis: VehiclePerformanceAnalysis[], targets: VehicleTarget[]): VehiclePerformanceAnalysis[] => {
    return analysis.map(vehicleAnalysis => {
      const target = targets.find(t => t.aracModeli === vehicleAnalysis.aracModeli);
      
      if (target) {
        const sapmaYuzdesi = target.hedefler.toplamMaksimumMaliyet > 0 ? 
          ((vehicleAnalysis.toplam.toplamMaliyet - target.hedefler.toplamMaksimumMaliyet) / target.hedefler.toplamMaksimumMaliyet) * 100 : 0;
        
        // Performans değerlendirmesi: Gerçek maliyetin hedeften düşük olması iyi performans
        const performansYuzdesi = target.hedefler.toplamMaksimumMaliyet > 0 ? 
          Math.round(((target.hedefler.toplamMaksimumMaliyet - vehicleAnalysis.toplam.toplamMaliyet) / target.hedefler.toplamMaksimumMaliyet) * 100) : 0;
        
        let durum: 'basarili' | 'dikkat' | 'kritik' = 'basarili';
        let performansDurumu: string;
        
        if (performansYuzdesi >= 20) {
          durum = 'basarili';
          performansDurumu = 'Mükemmel Performans';
        } else if (performansYuzdesi >= 10) {
          durum = 'basarili';
          performansDurumu = 'İyi Performans';
        } else if (performansYuzdesi >= 0) {
          durum = 'dikkat';
          performansDurumu = 'Hedef Seviyesinde';
        } else if (performansYuzdesi >= -10) {
          durum = 'dikkat';
          performansDurumu = 'Hedef Aşımı';
        } else {
          durum = 'kritik';
          performansDurumu = 'Kritik Hedef Aşımı';
        }
        
        return {
          ...vehicleAnalysis,
          hedefKarsilastirma: {
            hedefMaliyet: target.hedefler.toplamMaksimumMaliyet,
            gercekMaliyet: vehicleAnalysis.toplam.toplamMaliyet,
            sapmaYuzdesi: performansYuzdesi,
            durum,
            performansDurumu
          }
        };
      }
      
      return vehicleAnalysis;
    });
  }, []);

  // ============================================
  // 📊 YENİ: SAMPLE DATA GENERATION FOR UNIFIED SYSTEM
  // ============================================

  // ✅ HEDEF YÖNETİMİ: Akıllı Hedef Yönetimi sekmesinden hedefleri çek
  const loadVehicleTargetsFromStorage = useCallback((): VehicleTarget[] => {
    try {
      const savedTargets = localStorage.getItem('vehicle-targets');
      if (savedTargets) {
        const parsedTargets = JSON.parse(savedTargets);
        console.log('🎯 Hedefler Akıllı Hedef Yönetimi\'nden yüklendi:', parsedTargets.length);
        return parsedTargets;
      }
    } catch (error) {
      console.error('Hedefler yüklenirken hata:', error);
    }
    
    // Eğer hiç hedef yoksa boş array döndür (otomatik hedef oluşturma)
    console.log('⚠️ Henüz hedef belirlenmemiş. Akıllı Hedef Yönetimi sekmesinden hedef oluşturun.');
    return [];
  }, []);

  // Sample unified records oluştur (mevcut cost data'dan)
  const generateUnifiedRecords = useCallback((costData: any[]): UnifiedQualityRecord[] => {
    return costData.map(record => convertToUnifiedRecord(record));
  }, [convertToUnifiedRecord]);

  // ✅ HEDEF YÖNETİMİ: Akıllı Hedef Yönetimi'nden hedefleri yükle
  useEffect(() => {
    // Vehicle targets'ı localStorage'dan yükle
    const loadedTargets = loadVehicleTargetsFromStorage();
    setVehicleTargets(loadedTargets);
  }, [loadVehicleTargetsFromStorage, dataRefreshTrigger]); // dataRefreshTrigger ile real-time update

  // Global filtered data değiştiğinde unified records'ı güncelle
  useEffect(() => {
    if (globalFilteredData && globalFilteredData.length > 0) {
      const unified = generateUnifiedRecords(globalFilteredData);
      setUnifiedRecords(unified);
      
      // Vehicle performance analysis'i güncelle
      const analysis = generateVehiclePerformanceAnalysis(unified);
      const analysisWithTargets = compareWithTargets(analysis, vehicleTargets);
      setVehiclePerformanceData(analysisWithTargets);
    }
  }, [globalFilteredData, vehicleTargets, generateUnifiedRecords, generateVehiclePerformanceAnalysis, compareWithTargets]);

  // ✅ Context7: Global Filtering Function
  useEffect(() => {
    const applyGlobalFilters = () => {
      try {
        // ✅ GÜNCEL VERİ KULLANIMI: Hem localStorage hem de costData state'ini kontrol et
        let sourceData: any[] = [];
        
        // Önce localStorage'dan veri al
        const storedData = localStorage.getItem('kys-cost-management-data');
        if (storedData && storedData !== '[]') {
          const parsedData = JSON.parse(storedData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            sourceData = parsedData;
          }
        }
        
        // Eğer localStorage'da veri yoksa veya boşsa, costData state'ini kullan
        if (sourceData.length === 0 && costData && costData.length > 0) {
          sourceData = costData;
        }
        
        console.log('🔍 Global filtreleme - kaynak veri:', {
          source: sourceData.length > 0 ? 'localStorage ve/veya costData' : 'veri yok',
          dataLength: sourceData.length,
          filters: globalFilters
        });

        if (sourceData.length === 0) {
          setGlobalFilteredData([]);
          console.log('⚠️ Filtrelenecek veri bulunamadı');
          return;
        }

        let filtered = [...sourceData];

        // Maliyet türü filtresi
        if (globalFilters.maliyetTuru) {
          filtered = filtered.filter((item: any) => item.maliyetTuru === globalFilters.maliyetTuru);
        }

        // Birim filtresi
        if (globalFilters.birim) {
          filtered = filtered.filter((item: any) => item.birim === globalFilters.birim);
        }

        // Araç filtresi
        if (globalFilters.arac) {
          filtered = filtered.filter((item: any) => item.arac === globalFilters.arac);
        }

        // Yıl filtresi
        if (globalFilters.selectedYear) {
          filtered = filtered.filter((item: any) => {
            const itemDate = new Date(item.tarih);
            return itemDate.getFullYear() === parseInt(globalFilters.selectedYear);
          });
        }

        // Ay filtresi
        if (globalFilters.selectedMonth) {
          filtered = filtered.filter((item: any) => {
            const itemDate = new Date(item.tarih);
            const itemYearMonth = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
            return itemYearMonth === globalFilters.selectedMonth;
          });
        }

        // Arama filtresi
        if (globalFilters.searchTerm) {
          const searchLower = globalFilters.searchTerm.toLowerCase();
          filtered = filtered.filter((item: any) =>
            (item.parcaKodu?.toLowerCase().includes(searchLower)) ||
            (item.maliyetTuru?.toLowerCase().includes(searchLower)) ||
            (item.birim?.toLowerCase().includes(searchLower)) ||
            (item.arac?.toLowerCase().includes(searchLower)) ||
            (item.aciklama?.toLowerCase().includes(searchLower)) ||
            (item.maliyet?.toString().includes(searchLower))
          );
        }

        // Sort by newest first
        filtered = filtered.sort((a: any, b: any) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());

        setGlobalFilteredData(filtered);

        console.log('🔍 Global filters applied:', {
          originalCount: sourceData.length,
          filteredCount: filtered.length,
          filters: globalFilters
        });

       } catch (error) {
         console.error('Global filtering error:', error);
         setGlobalFilteredData([]);
       }
     };

     applyGlobalFilters();
   }, [globalFilters, dataRefreshTrigger, costData]); // ✅ REAL-TIME: costData state'ini de dinle

  // ✅ Context7: Update Analytics Based on Global Filtered Data
  useEffect(() => {
    if (globalFilteredData.length > 0) {
      // Generate analytics from filtered data
      const mapMaliyetTuruToCOPQ = (maliyetTuru: string) => {
        const mapping: { [key: string]: string } = {
          'hurda': 'İç Hata',
          'yeniden_islem': 'İç Hata', 
          'fire': 'İç Hata',
          'garanti': 'Dış Hata',
          'iade': 'Dış Hata',
          'sikayet': 'Dış Hata',
          'denetim': 'Değerlendirme',
          'test': 'Değerlendirme',
          'egitim': 'Önleme',
          'onleme': 'Önleme'
        };
        return mapping[maliyetTuru] || 'Diğer';
      };

      const copqBreakdown = globalFilteredData
        .reduce((acc: any[], item: any) => {
          const copqCategory = mapMaliyetTuruToCOPQ(item.maliyetTuru);
          const existing = acc.find(c => c.category === copqCategory);
          if (existing) {
            existing.value += item.maliyet;
          } else {
            // ✅ Context7: Enhanced COPQ format with name, color, and category
            const categoryColors: { [key: string]: string } = {
              'İç Hata': '#ef4444',
              'Dış Hata': '#f97316', 
              'Değerlendirme': '#3b82f6',
              'Önleme': '#22c55e',
              'Diğer': '#6b7280'
            };
            
            acc.push({ 
              name: copqCategory,
              category: copqCategory, 
              value: item.maliyet,
              color: categoryColors[copqCategory] || '#6b7280'
            });
          }
          return acc;
        }, []);

      const byParcaKodu = globalFilteredData
        .reduce((acc: any[], item: any) => {
          if (item.parcaKodu) { // Only include items with part codes
            const existing = acc.find(p => p.parcaKodu === item.parcaKodu);
            if (existing) {
              existing.totalCost += item.maliyet;
              existing.toplam += item.maliyet; // ✅ Context7: Add toplam for compatibility
              existing.count += 1;
            } else {
              acc.push({
                parcaKodu: item.parcaKodu,
                totalCost: item.maliyet,
                toplam: item.maliyet, // ✅ Context7: Add toplam for compatibility
                count: 1
              });
            }
          }
          return acc;
        }, [])
        .sort((a: any, b: any) => b.totalCost - a.totalCost)
        .slice(0, 10);

      const totalCost = globalFilteredData.reduce((sum: number, item: any) => sum + item.maliyet, 0);
      const totalItems = globalFilteredData.length;
      const avgCost = totalItems > 0 ? totalCost / totalItems : 0;

      // Generate monthly trend from filtered data
      const monthlyData = new Map();
      globalFilteredData.forEach((item: any) => {
        if (item.tarih && item.maliyet) {
          const itemDate = new Date(item.tarih);
          const monthKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
          
          if (monthlyData.has(monthKey)) {
            monthlyData.set(monthKey, monthlyData.get(monthKey) + item.maliyet);
          } else {
            monthlyData.set(monthKey, item.maliyet);
          }
        }
      });

      const trendData = Array.from(monthlyData.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6) // Last 6 months
        .map(([monthKey, total]) => {
          const [year, month] = monthKey.split('-');
          const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                             'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
          return {
            month: monthNames[parseInt(month) - 1],
            total,
            monthKey
          };
        });

      const filteredAnalytics = {
        totalSummary: {
          totalCost,
          totalItems,
          avgCost
        },
        copqBreakdown,
        byParcaKodu,
        trendData,
        byMaliyetTuru: []
      };
      
      setRealTimeAnalytics(filteredAnalytics);
      
      console.log('📊 Analytics updated with filtered data:', filteredAnalytics);
    }
  }, [globalFilteredData]); // Re-run when filtered data changes

  // ✅ Context7: Auto-load analytics data on component mount
  useEffect(() => {
    const loadInitialAnalytics = () => {
      try {
        console.log('🚀 =================================');
        console.log('🚀 TREND ANALYSIS DEBUG BAŞLADI');
        console.log('🚀 =================================');
        
        // localStorage'dan veri çekme - DOĞRU ANAHTAR KULLANıLIYOR
        const storedData = localStorage.getItem('kys-cost-management-data') || 
                          localStorage.getItem('kalitesizlikMaliyetleri') || 
                          localStorage.getItem('context7_qualityCosts');
        console.log('📦 Raw localStorage data:', storedData ? storedData.substring(0, 200) + '...' : 'NULL');
        
        if (storedData) {
          const costData = JSON.parse(storedData);
          console.log('🔍 Parsed costData:', {
            type: typeof costData,
            isArray: Array.isArray(costData),
            length: costData.length,
            firstItem: costData[0]
          });
          
          // İlk 3 kayıt için detaylı format analizi
          costData.slice(0, 3).forEach((item: any, index: number) => {
            console.log(`📊 Kayıt #${index + 1}:`, {
              tarih: item.tarih,
              tarihType: typeof item.tarih,
              maliyet: item.maliyet,
              maliyetType: typeof item.maliyet,
              maliyetTuru: item.maliyetTuru,
              parcaKodu: item.parcaKodu
            });
            
            // Tarih parse test
            if (item.tarih) {
              const parsedDate = new Date(item.tarih);
              console.log(`📅 Tarih parse test - Original: ${item.tarih}, Parsed: ${parsedDate}, Month: ${parsedDate.getMonth() + 1}, Year: ${parsedDate.getFullYear()}`);
            }
          });
          
          // Trend hesaplama debug
          const generateMonthlyTrendWithCOPQ = (data: any[]) => {
            console.log('🔧 COPQ TREND HESAPLAMA BAŞLADI');
            const monthlyData = new Map();
            
            // COPQ mapping fonksiyonu burada tanımla
            const getCOPQCategory = (maliyetTuru: string) => {
              const mapping: { [key: string]: string } = {
                'yeniden_islem': 'internal',
                'hurda': 'internal', 
                'fire': 'internal',
                'test': 'appraisal',
                'denetim': 'appraisal',
                'sikayet': 'external',
                'iade': 'external',
                'garanti': 'external',
                'egitim': 'prevention',
                'onleme': 'prevention',
                // Eski format desteği
                'Yeniden İşlem': 'internal',
                'Hurda': 'internal',
                'Yeniden Test': 'appraisal',
                'Ekstra Kontrol': 'appraisal',
                'Müşteri Şikayeti': 'external',
                'Iade': 'external',
                'Garanti': 'external',
                'Proses İyileştirme': 'prevention',
                'Eğitim': 'prevention',
                'Kalite Planlama': 'prevention'
              };
              return mapping[maliyetTuru] || 'internal';
            };
            
            // Group cost data by month and COPQ category
            data.forEach((item: any, index: number) => {
              if (item.tarih && item.maliyet && item.maliyetTuru) {
                const itemDate = new Date(item.tarih);
                const monthKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
                const copqCategory = getCOPQCategory(item.maliyetTuru);
                
                console.log(`📈 İşlenen kayıt #${index}: Tarih=${item.tarih}, MonthKey=${monthKey}, Tür=${item.maliyetTuru}, COPQ=${copqCategory}, Maliyet=${item.maliyet}`);
                
                if (!monthlyData.has(monthKey)) {
                  monthlyData.set(monthKey, {
                    internal: 0,
                    external: 0,
                    appraisal: 0,
                    prevention: 0
                  });
                }
                
                const monthData = monthlyData.get(monthKey);
                monthData[copqCategory] += item.maliyet;
                console.log(`➕ ${monthKey} ${copqCategory} güncellendi: +${item.maliyet} = ${monthData[copqCategory]}`);
              } else {
                console.log(`⚠️ Geçersiz kayıt #${index}: tarih=${item.tarih}, maliyet=${item.maliyet}, tür=${item.maliyetTuru}`);
              }
            });
            
            console.log('📊 COPQ Aylık veri Map:', monthlyData);
            
            // Convert to array and sort by date (last 6 months)
            const sortedMonths = Array.from(monthlyData.entries())
              .sort((a, b) => a[0].localeCompare(b[0]))
              .slice(-6) // Last 6 months
              .map(([monthKey, copqData]) => {
                const [year, month] = monthKey.split('-');
                const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                                   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                const result = {
                  month: monthNames[parseInt(month) - 1],
                  monthKey,
                  internal: copqData.internal,
                  external: copqData.external,
                  appraisal: copqData.appraisal,
                  prevention: copqData.prevention,
                  total: copqData.internal + copqData.external + copqData.appraisal + copqData.prevention
                };
                console.log(`📋 COPQ trend verisi: ${monthKey} -> ${result.month} (İç:${result.internal}, Dış:${result.external}, Değ:${result.appraisal}, Önl:${result.prevention})`);
                return result;
              });
            
            console.log('🎯 Final COPQ trend data:', sortedMonths);
            return sortedMonths;
          };
          
          const realTrendData = generateMonthlyTrendWithCOPQ(costData);

          // COPQ breakdown hesaplama - GERÇEKÇİ VERİ FORMATIYLA UYUMLU
          const mapMaliyetTuruToCOPQ = (maliyetTuru: string) => {
            const mapping: { [key: string]: string } = {
              'yeniden_islem': 'İç Hata',
              'hurda': 'İç Hata', 
              'fire': 'İç Hata',
              'test': 'Değerlendirme',
              'denetim': 'Değerlendirme',
              'sikayet': 'Dış Hata',
              'iade': 'Dış Hata',
              'garanti': 'Dış Hata',
              'egitim': 'Önleme',
              'onleme': 'Önleme',
              // Eski format desteği
              'Yeniden İşlem': 'İç Hata',
              'Hurda': 'İç Hata',
              'Yeniden Test': 'Değerlendirme',
              'Ekstra Kontrol': 'Değerlendirme',
              'Müşteri Şikayeti': 'Dış Hata',
              'Iade': 'Dış Hata',
              'Garanti': 'Dış Hata',
              'Proses İyileştirme': 'Önleme',
              'Eğitim': 'Önleme',
              'Kalite Planlama': 'Önleme'
            };
            return mapping[maliyetTuru] || 'Diğer';
          };

          // ✅ Enhanced COPQ breakdown with proper formatting
          const categoryColors = {
            'İç Hata': '#ef4444',
            'Dış Hata': '#f97316', 
            'Değerlendirme': '#3b82f6',
            'Önleme': '#22c55e'
          };

          const copqBreakdown = costData
            .reduce((acc: any[], item: any) => {
              const copqCategory = mapMaliyetTuruToCOPQ(item.maliyetTuru);
              const existing = acc.find(c => (c.category || c.name) === copqCategory);
              if (existing) {
                existing.value += item.maliyet;
              } else {
                acc.push({ 
                  name: copqCategory,
                  category: copqCategory, 
                  value: item.maliyet,
                  color: categoryColors[copqCategory] || '#6b7280'
                });
              }
              return acc;
            }, []);

          const byParcaKodu = costData
            .reduce((acc: any[], item: any) => {
              const existing = acc.find(p => p.parcaKodu === item.parcaKodu);
              if (existing) {
                existing.totalCost += item.maliyet;
                existing.count += 1;
              } else {
                acc.push({
                  parcaKodu: item.parcaKodu,
                  totalCost: item.maliyet,
                  count: 1
                });
              }
              return acc;
            }, [])
            .sort((a: any, b: any) => b.totalCost - a.totalCost)
            .slice(0, 10);

          const totalCost = costData.reduce((sum: number, item: any) => sum + item.maliyet, 0);
          const totalItems = costData.length;
          const avgCost = totalCost / totalItems;

          const analytics = {
            totalSummary: {
              totalCost,
              totalItems,
              avgCost
            },
            copqBreakdown,
            byParcaKodu,
            trendData: realTrendData, // Real monthly trend from localStorage
            byMaliyetTuru: []
          };
          
          setRealTimeAnalytics(analytics);
          console.log('✅ Initial analytics loaded:', analytics);
          console.log('🚀 =================================');
          console.log('🚀 TREND ANALYSIS DEBUG BİTTİ');
          console.log('🚀 =================================');
        } else {
          // ✅ VERİ YOKSA BOŞ BAŞLAT - MOCK VERİ DEVRE DIŞI
          console.log('🔍 localStorage veri bulunamadı - Boş veri ile başlatılıyor (mock veri devre dışı)...');
          
          // Boş analytics oluştur
          setRealTimeAnalytics({
            totalSummary: { totalCost: 0, totalItems: 0, avgCost: 0 },
            copqBreakdown: [],
            byParcaKodu: [],
            trendData: [],
            byMaliyetTuru: [],
            sampleDataGenerated: false
          });
          console.log('✅ Boş analytics verileri yüklendi (mock veri devre dışı)');
        }
      } catch (error) {
        console.error('❌ Failed to load initial analytics:', error);
        setRealTimeAnalytics({
          totalSummary: { totalCost: 0, totalItems: 0, avgCost: 0 },
          copqBreakdown: [],
          byParcaKodu: [],
          trendData: [],
          byMaliyetTuru: [],
          error: true
        });
      }
    };

    loadInitialAnalytics();
  }, []);

  // ✅ Context7 Sample Data Generation
  const generateCOPQData = useCallback((): COPQData => {
    return {
      internalFailure: {
        rework: 156000,
        scrap: 89000,
        troubleshooting: 34000,
        redesign: 23000,
        downtime: 67000,
      },
      externalFailure: {
        warranty: 125000,
        complaints: 45000,
        returns: 78000,
        recalls: 12000,
        legalCosts: 8000,
        customerLoss: 234000,
      },
      appraisal: {
        inspection: 89000,
        testing: 56000,
        qualityAudits: 23000,
        supplierSurveillance: 34000,
        instrumentCalibration: 18000,
      },
      prevention: {
        qualityPlanning: 45000,
        processControl: 67000,
        training: 34000,
        qualityImprovement: 56000,
        supplierQualification: 23000,
      }
    };
  }, []);

  const generateKPIs = useCallback((copq: COPQData): QualityCostKPI[] => {
    const totalInternal = Object.values(copq.internalFailure).reduce((sum, val) => sum + val, 0);
    const totalExternal = Object.values(copq.externalFailure).reduce((sum, val) => sum + val, 0);
    const totalAppraisal = Object.values(copq.appraisal).reduce((sum, val) => sum + val, 0);
    const totalPrevention = Object.values(copq.prevention).reduce((sum, val) => sum + val, 0);
    const totalCOPQ = totalInternal + totalExternal + totalAppraisal + totalPrevention;
    const totalSales = 10000000; // Örnek ciro

    return [
      {
        id: 'copq_ratio',
        name: 'COPQ Oranı',
        value: (totalCOPQ / totalSales) * 100,
        target: 2.0,
        unit: '%',
        trend: 'down',
        trendValue: -0.3,
        status: (totalCOPQ / totalSales) * 100 <= 2.0 ? 'excellent' : 'warning',
        category: 'external'
      },
      {
        id: 'prevention_ratio',
        name: 'Önleme/Hata Oranı',
        value: totalPrevention / (totalInternal + totalExternal),
        target: 0.5,
        unit: 'oran',
        trend: 'up',
        trendValue: 0.12,
        status: totalPrevention / (totalInternal + totalExternal) >= 0.4 ? 'good' : 'warning',
        category: 'prevention'
      },
      {
        id: 'failure_cost_trend',
        name: 'Hata Maliyeti Trendi',
        value: totalInternal + totalExternal,
        target: 400000,
        unit: '₺',
        trend: 'down',
        trendValue: -8.5,
        status: (totalInternal + totalExternal) <= 400000 ? 'good' : 'critical',
        category: 'internal'
      },
      {
        id: 'customer_impact',
        name: 'Müşteri Etkisi',
        value: (copq.externalFailure.complaints + copq.externalFailure.returns) / 1000,
        target: 50,
        unit: 'K₺',
        trend: 'stable',
        trendValue: 2.1,
        status: (copq.externalFailure.complaints + copq.externalFailure.returns) <= 100000 ? 'excellent' : 'warning',
        category: 'external'
      }
    ];
  }, []);

  const generateAIInsights = useCallback((copq: COPQData): AIInsight[] => {
    const totalInternal = Object.values(copq.internalFailure).reduce((sum, val) => sum + val, 0);
    const totalPrevention = Object.values(copq.prevention).reduce((sum, val) => sum + val, 0);
    
    return [
      {
        id: 'insight_1',
        type: 'cost_reduction',
        severity: 'yuksek',
        title: 'Yeniden İşlem Maliyetleri Yüksek',
        description: `Yeniden işlem maliyetleri ₺${copq.internalFailure.rework.toLocaleString()} ile toplam maliyetlerin %${((copq.internalFailure.rework / totalInternal) * 100).toFixed(1)}'ini oluşturuyor.`,
        action: 'Kaynak kalitesi ve operatör eğitimlerini artırın',
        impact: copq.internalFailure.rework * 0.3,
        confidence: 0.87,
        timeframe: '3 ay'
      },
      {
        id: 'insight_2',
        type: 'trend_alert',
        severity: 'orta',
        title: 'Önleme Yatırımı Yetersiz',
        description: `Önleme maliyetleri ₺${totalPrevention.toLocaleString()} ile önerilen oranın altında.`,
        action: 'Kalite planlama ve proses kontrole yatırım yapın',
        impact: totalInternal * 0.4,
        confidence: 0.92,
        timeframe: '6 ay'
      },
      {
        id: 'insight_3',
        type: 'benchmark',
        severity: 'dusuk',
        title: 'Sektör Ortalaması Karşılaştırması',
        description: 'COPQ oranınız sektör ortalamasının %15 üzerinde.',
        action: 'Best practice analizleri yapın ve benchmark çalışmaları başlatın',
        impact: 150000,
        confidence: 0.75,
        timeframe: '12 ay'
      }
    ];
  }, []);

  const generateParetoData = useCallback((copq: COPQData): ParetoAnalysis[] => {
    const categories = [
      { name: 'Yeniden İşlem', value: copq.internalFailure.rework },
      { name: 'Müşteri Kaybı', value: copq.externalFailure.customerLoss },
      { name: 'Garanti', value: copq.externalFailure.warranty },
      { name: 'Hurda', value: copq.internalFailure.scrap },
      { name: 'İadeler', value: copq.externalFailure.returns },
      { name: 'Muayene', value: copq.appraisal.inspection },
      { name: 'Duruş Süresi', value: copq.internalFailure.downtime },
      { name: 'Proses Kontrol', value: copq.prevention.processControl }
    ];

    const total = categories.reduce((sum, cat) => sum + cat.value, 0);
    const sortedCategories = categories.sort((a, b) => b.value - a.value);
    
    let cumulative = 0;
    return sortedCategories.map((cat, index) => {
      const percentage = (cat.value / total) * 100;
      cumulative += percentage;
      return {
        category: cat.name,
        cost: cat.value,
        percentage,
        cumulative,
        count: index + 1
      };
    });
  }, []);

  // ✅ Context7 Data Loading Effect
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const copqData = generateCOPQData();
      const kpiData = generateKPIs(copqData);
      const insightData = generateAIInsights(copqData);
      const paretoAnalysis = generateParetoData(copqData);
      
      setCopqData(copqData);
      setKpis(kpiData);
      setAiInsights(insightData);
      setParetoData(paretoAnalysis);
      setIsLoading(false);
    };

    loadData();
  }, [generateCOPQData, generateKPIs, generateAIInsights, generateParetoData, refreshKey]);

  // ✅ Context7 Calculated Values
  const totalCOPQ = useMemo(() => {
    if (!copqData) return 0;
    return Object.values(copqData.internalFailure).reduce((sum, val) => sum + val, 0) +
           Object.values(copqData.externalFailure).reduce((sum, val) => sum + val, 0) +
           Object.values(copqData.appraisal).reduce((sum, val) => sum + val, 0) +
           Object.values(copqData.prevention).reduce((sum, val) => sum + val, 0);
  }, [copqData]);

  const copqCategoryData = useMemo(() => {
    if (!copqData) return [];
    return [
      {
        name: 'İç Hatalar',
        value: Object.values(copqData.internalFailure).reduce((sum, val) => sum + val, 0),
        color: '#ff9800',
        category: 'internal'
      },
      {
        name: 'Dış Hatalar', 
        value: Object.values(copqData.externalFailure).reduce((sum, val) => sum + val, 0),
        color: '#f44336',
        category: 'external'
      },
      {
        name: 'Değerlendirme',
        value: Object.values(copqData.appraisal).reduce((sum, val) => sum + val, 0),
        color: '#2196f3',
        category: 'appraisal'
      },
      {
        name: 'Önleme',
        value: Object.values(copqData.prevention).reduce((sum, val) => sum + val, 0),
        color: '#4caf50',
        category: 'prevention'
      }
    ];
  }, [copqData]);

  // ✅ Context7: Real COPQ Mapping based on actual form data
  const mapMaliyetTuruToCOPQ = useCallback((maliyetTuru: string) => {
    // Map actual cost types from form to COPQ categories
    const copqMapping = {
      'hurda': 'internal',      // İç Hata: Hurda Maliyeti
      'yeniden_islem': 'internal', // İç Hata: Yeniden İşlem
      'fire': 'internal',       // İç Hata: Fire Maliyeti
      'garanti': 'external',    // Dış Hata: Garanti Maliyeti
      'iade': 'external',       // Dış Hata: İade Maliyeti
      'sikayet': 'external',    // Dış Hata: Şikayet Maliyeti
      'denetim': 'appraisal',   // Değerlendirme: Denetim Maliyeti
      'test': 'appraisal',      // Değerlendirme: Test Maliyeti
      'egitim': 'prevention',   // Önleme: Eğitim Maliyeti
      'onleme': 'prevention'    // Önleme: Genel Önleme
    };
    return copqMapping[maliyetTuru] || 'internal';
  }, []);

  const trendData = useMemo(() => {
    // ✅ Context7: REAL TREND DATA - Generate COPQ trend from actual localStorage data
    try {
      const costData = JSON.parse(localStorage.getItem('kalitesizlikMaliyetleri') || '[]');
      
      if (costData.length === 0) {
        // Fallback: Use realistic sample data when no real data exists
        console.log('⚠️ No real cost data found, using sample trend data');
        const calculateCOPQByMonth = (monthIndex: number) => {
          const baseValues = {
            internal: 350000,   // Hurda, Yeniden İşlem, Fire
            external: 280000,   // Garanti, İade, Şikayet
            appraisal: 180000,  // Denetim, Test
            prevention: 120000  // Eğitim, Önleme
          };
          
          // Add monthly variation (±15%)
          const variation = (Math.sin(monthIndex * 0.5) * 0.15) + 1;
          
          return {
            internal: Math.round(baseValues.internal * variation),
            external: Math.round(baseValues.external * variation),
            appraisal: Math.round(baseValues.appraisal * variation),
            prevention: Math.round(baseValues.prevention * variation)
          };
        };

        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
        
        return months.map((month, index) => {
          const monthData = calculateCOPQByMonth(index);
          const total = Object.values(monthData).reduce((sum, val) => sum + val, 0);
          
          return {
            month,
            total,
            ...monthData
          };
        });
      }

      // ✅ REAL DATA PROCESSING: Calculate COPQ trend from actual localStorage
      const monthlyData = new Map();
      
      // Group cost data by month and COPQ category
      costData.forEach((item: any) => {
        if (item.tarih && item.maliyet && item.maliyetTuru) {
          const itemDate = new Date(item.tarih);
          const monthKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
          const monthName = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                           'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'][itemDate.getMonth()];
          
          // Map cost type to COPQ category
          const getCOPQCategory = (maliyetTuru: string) => {
            const copqMapping = {
              'hurda': 'internal',
              'yeniden_islem': 'internal', 
              'fire': 'internal',
              'garanti': 'external',
              'iade': 'external',
              'sikayet': 'external',
              'denetim': 'appraisal',
              'test': 'appraisal',
              'egitim': 'prevention',
              'onleme': 'prevention'
            };
            return copqMapping[maliyetTuru] || 'internal';
          };
          
          const copqCategory = getCOPQCategory(item.maliyetTuru);
          
          if (!monthlyData.has(monthKey)) {
            monthlyData.set(monthKey, {
              month: monthName,
              monthKey,
              internal: 0,
              external: 0,
              appraisal: 0,
              prevention: 0,
              total: 0
            });
          }
          
          const monthData = monthlyData.get(monthKey);
          monthData[copqCategory] += item.maliyet;
          monthData.total += item.maliyet;
        }
      });
      
      // Convert to array and sort by date (last 6 months)
      const sortedMonths = Array.from(monthlyData.values())
        .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
        .slice(-6); // Last 6 months
      
      console.log('✅ REAL COPQ Trend Data Generated:', {
        totalRecords: costData.length,
        monthsGenerated: sortedMonths.length,
        trendData: sortedMonths
      });
      
      return sortedMonths;
      
    } catch (error) {
      console.error('❌ Error generating real trend data:', error);
      // Fallback to sample data on error
      const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
      return months.map((month, index) => ({
        month,
        total: 930000 + (index * 50000),
        internal: 350000 + (index * 20000),
        external: 280000 + (index * 15000),
        appraisal: 180000 + (index * 10000),
        prevention: 120000 + (index * 5000)
      }));
    }
  }, []);

  // ✅ Professional Modal Functions
  const openModal = (data: any) => {
    setModalData(data);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData(null);
  };

  // ✅ Birim isimlerini departman isimlerine çevir
  const mapBirimToDepartment = (birim: string) => {
    const birimToDepartmentMap: { [key: string]: string } = {
      // Mevcut birim isimleri -> DOF8DManagement departman isimleri
      'arge': 'Ar-Ge',
      'Ar-Ge': 'Ar-Ge',
      'bakim_onarim': 'Bakım Onarım',
      'Bakım Onarım': 'Bakım Onarım',
      'boyahane': 'Boyahane',
      'Boyahane': 'Boyahane',
      'bukum': 'Büküm',
      'Büküm': 'Büküm',
      'depo': 'Depo',
      'Depo': 'Depo',
      'elektrik_montaj': 'Elektrik Montaj',
      'Elektrik Montaj': 'Elektrik Montaj',
      'elektrikhane': 'Elektrikhane',
      'idari_isler': 'İdari İşler',
      'İdari İşler': 'İdari İşler',
      'kalite_kontrol': 'Kalite Kontrol',
      'Kalite Kontrol': 'Kalite Kontrol',
      'kaynakhane': 'Kaynakhane',
      'Kaynakhane': 'Kaynakhane',
      'kesim': 'Kesim',
      'Kesim': 'Kesim',
      'mekanik_montaj': 'Mekanik Montaj',
      'Mekanik Montaj': 'Mekanik Montaj',
      'satin_alma': 'Satın Alma',
      'Satın Alma': 'Satın Alma',
      'satis_sonrasi_hizmetleri': 'Satış Sonrası Hizmetleri',
      'Satış Sonrası Hizmetleri': 'Satış Sonrası Hizmetleri',
      'uretim': 'Üretim',
      'Üretim': 'Üretim',
      'uretim_planlama': 'Üretim Planlama',
      'Üretim Planlama': 'Üretim Planlama'
    };
    
    return birimToDepartmentMap[birim] || birim || 'Kalite Kontrol';
  };

  // ✅ Profesyonel Departman İsmi Formatı
  const formatProfessionalDepartmentName = (name: string) => {
    if (!name) return 'Bilinmeyen';
    
    const professionalNames: { [key: string]: string } = {
      // Alt çizgili formatlar
      'arge': 'Ar-Ge',
      'ar_ge': 'Ar-Ge',
      'ar-ge': 'Ar-Ge',
      'bakim_onarim': 'Bakım Onarım',
      'boyahane': 'Boyahane',
      'bukum': 'Büküm',
      'depo': 'Depo',
      'elektrik_montaj': 'Elektrik Montaj',
      'elektrikhane': 'Elektrikhane',
      'idari_isler': 'İdari İşler',
      'kalite_kontrol': 'Kalite Kontrol',
      'kaynakhane': 'Kaynakhane',
      'kesim': 'Kesim',
      'mekanik_montaj': 'Mekanik Montaj',
      'satin_alma': 'Satın Alma',
      'satis_sonrasi_hizmetleri': 'Satış Sonrası Hizmetleri',
      'uretim': 'Üretim',
      'uretim_planlama': 'Üretim Planlama',
      
      // Küçük harfli formatlar
      'ar ge': 'Ar-Ge',
      'bakim onarim': 'Bakım Onarım',
      'elektrik montaj': 'Elektrik Montaj',
      'idari isler': 'İdari İşler',
      'kalite kontrol': 'Kalite Kontrol',
      'mekanik montaj': 'Mekanik Montaj',
      'satin alma': 'Satın Alma',
      'uretim planlama': 'Üretim Planlama',
      
      // Diğer formatlar
      'diger': 'Diğer',
      'other': 'Diğer',
      'genel': 'Genel'
    };
    
    // Önce küçük harfe çevir ve kontrol et
    const lowerName = name.toLowerCase().trim();
    if (professionalNames[lowerName]) {
      return professionalNames[lowerName];
    }
    
    // Eğer mevcut değilse, ilk harfleri büyük yap
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // ✅ Trend Yönü Formatı
  const formatTrendDirection = (direction: string) => {
    const trendMap: { [key: string]: string } = {
      'stabil': 'Stabil',
      'yukselis': 'Yükseliş',
      'dususte': 'Düşüşte',
      'artan': 'Yükseliş',
      'azalan': 'Düşüşte',
      'stable': 'Stabil',
      'up': 'Yükseliş',
      'down': 'Düşüşte'
    };
    
    return trendMap[direction.toLowerCase()] || direction;
  };

  // ✅ DÖF Form Functions
  // DÖF durumlarını takip etmek için yardımcı fonksiyonlar
  const getDOFStatusKey = (recordData: any) => {
    // Her kayıt için benzersiz bir anahtar oluştur
    if (recordData.unit) {
      // Birim bazlı kayıtlar için
      return `dof_unit_${recordData.unit}`;
    } else {
      // Tekil kayıtlar için - parça kodu, birim ve maliyet türü kombinasyonu
      const partKey = recordData.parcaKodu || 'no_part';
      const unitKey = recordData.birim || 'no_unit';
      const typeKey = recordData.maliyetTuru || 'no_type';
      return `dof_record_${partKey}_${unitKey}_${typeKey}`;
    }
  };

  const isDOFCreated = (recordData: any) => {
    try {
      // ✅ KAPSAMLI DÖF KONTROLÜ - Hem dofRecords hem de dof-8d-records anahtarlarını kontrol et
      console.log('🔍 DÖF Kontrol Başladı:', {
        parcaKodu: recordData.parcaKodu,
        birim: recordData.birim,
        maliyetTuru: recordData.maliyetTuru,
        recordId: recordData.id
      });

      // 1. Ana DÖF kayıtlarını kontrol et (dofRecords)
      const mainDofRecords = localStorage.getItem('dofRecords');
      let foundInMain = false;
      
      if (mainDofRecords) {
        const parsedMainRecords = JSON.parse(mainDofRecords);
        console.log('🔍 Ana DÖF Kayıtları:', parsedMainRecords.length, 'kayıt');
        
        foundInMain = parsedMainRecords.some((dof: any) => {
          // Kaynak modül ve kayıt ID'si eşleşmesi
          const sourceMatch = dof.sourceModule === 'qualityCost' && 
                             dof.sourceRecordId === recordData.id?.toString();
          
          // Parça kodu bazında eşleşme
          const titleMatch = recordData.parcaKodu && 
                            dof.title?.toLowerCase().includes(recordData.parcaKodu.toLowerCase());
          const descMatch = recordData.parcaKodu && 
                           dof.description?.toLowerCase().includes(recordData.parcaKodu.toLowerCase());
          
          // Birim eşleşmesi
          const deptMatch = recordData.birim && 
                           dof.department?.toLowerCase().includes(recordData.birim.toLowerCase());
          
          const isMatch = sourceMatch || titleMatch || descMatch || (titleMatch && deptMatch);
          
          if (isMatch) {
            console.log('✅ Ana kayıtlarda DÖF bulundu:', {
              dofId: dof.id,
              dofNumber: dof.dofNumber,
              sourceMatch,
              titleMatch,
              descMatch,
              deptMatch
            });
          }
          
          return isMatch;
        });
      }

      // 2. Entegrasyon DÖF kayıtlarını kontrol et (dof-8d-records)
      const integrationDofRecords = localStorage.getItem('dof-8d-records');
      let foundInIntegration = false;
      
      if (integrationDofRecords) {
        const parsedIntegrationRecords = JSON.parse(integrationDofRecords);
        console.log('🔍 Entegrasyon DÖF Kayıtları:', parsedIntegrationRecords.length, 'kayıt');
        
        foundInIntegration = parsedIntegrationRecords.some((dof: any) => {
          const sourceMatch = dof.sourceModule === 'qualityCost' && 
                             dof.sourceRecordId === recordData.id?.toString();
          
          const titleMatch = recordData.parcaKodu && 
                            dof.title?.toLowerCase().includes(recordData.parcaKodu.toLowerCase());
          const descMatch = recordData.parcaKodu && 
                           dof.description?.toLowerCase().includes(recordData.parcaKodu.toLowerCase());
          
          const isMatch = sourceMatch || titleMatch || descMatch;
          
          if (isMatch) {
            console.log('✅ Entegrasyon kayıtlarında DÖF bulundu:', {
              dofId: dof.id,
              dofNumber: dof.dofNumber,
              sourceMatch,
              titleMatch,
              descMatch
            });
          }
          
          return isMatch;
        });
      }

      const finalResult = foundInMain || foundInIntegration;
      
      console.log('🔍 DÖF Kontrol Sonucu:', {
        parcaKodu: recordData.parcaKodu,
        foundInMain,
        foundInIntegration,
        finalResult
      });
      
      return finalResult;
      
    } catch (error) {
      console.error('❌ DÖF durumu kontrol hatası:', error);
      return false;
    }
  };

  const markDOFAsCreated = (recordData: any) => {
    // Yeni entegrasyon sistemi için DÖF kaydı oluştur
    const recordId = recordData.id || `cost_${recordData.parcaKodu}_${recordData.birim}`;
    
    // Eski sistem (fallback) - localStorage güncelleme
    const key = getDOFStatusKey(recordData);
    let statusMap = {};
    
    try {
      const existing = localStorage.getItem('dofCreatedStatus');
      if (existing) {
        statusMap = JSON.parse(existing);
      }
    } catch {
      statusMap = {};
    }
    
    statusMap[key] = true;
    localStorage.setItem('dofCreatedStatus', JSON.stringify(statusMap));
  };

  const openDOFForm = (recordData: any) => {
    console.log('🚀 DÖF Form açılıyor:', recordData);
    
    // ✅ ÖNCE DÖF VAR MI KONTROL ET
    if (isDOFCreated(recordData)) {
      alert(`⚠️ UYARI: ${recordData.parcaKodu} parça kodu için zaten bir uygunsuzluk kaydı oluşturulmuş!\n\nAynı parça için birden fazla uygunsuzluk açamazsınız. Mevcut uygunsuzluk kaydını DÖF ve 8D Yönetimi modülünden kontrol edebilirsiniz.`);
      return; // DÖF açma işlemini durdur
    }
    
    // DÖF8DManagement modülünün form'unu açmak için prefill verilerini hazırla
    const mappedDepartment = mapBirimToDepartment(recordData.birim || recordData.department);
    
    const prefillData = {
      sourceModule: 'qualityCost',
      sourceRecordId: recordData.id || `cost_${Date.now()}`,
      prefillData: {
        title: `Kalitesizlik Maliyeti - ${recordData.parcaKodu || 'Genel'} Uygunsuzluğu`,
        description: `Parça Kodu: ${recordData.parcaKodu || 'Belirtilmemiş'}
Maliyet Türü: ${getMaliyetTuruLabel(recordData.maliyetTuru)}
Birim: ${recordData.birim || 'Belirtilmemiş'}
Maliyet: ₺${recordData.maliyet?.toLocaleString('tr-TR') || '0'}
Tarih: ${recordData.tarih ? new Date(recordData.tarih).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
Açıklama: ${recordData.aciklama || 'Detay bilgi yok'}

Bu kayıt yüksek kalitesizlik maliyeti nedeniyle uygunsuzluk olarak değerlendirilmiştir.`,
        department: mappedDepartment,
        priority: recordData.maliyet > 50000 ? 'critical' : 
                  recordData.maliyet > 20000 ? 'high' : 
                  recordData.maliyet > 5000 ? 'medium' : 'low',
        type: 'corrective',
        responsible: '',
        rootCause: 'Araştırılacak - Kalitesizlik maliyet analizi gerekli',
        issueDescription: `Kalitesizlik maliyeti: ₺${recordData.maliyet?.toLocaleString('tr-TR') || '0'}`,
        suggestedType: 'corrective',
        // Orijinal birim bilgisini de gönder
        originalBirim: recordData.birim
      },
      recordData: recordData
    };

    // Prefill verisini localStorage'a kaydet
    localStorage.setItem('dof-form-prefill', JSON.stringify(prefillData));
    
    // DÖF8DManagement sayfasına yönlendir ve form açılmasını tetikle
    localStorage.setItem('dof-auto-open-form', 'true');
    window.location.href = '/dof-8d-management';
  };



  const getMaliyetTuruLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'yeniden_islem': 'Yeniden İşlem',
      'hurda': 'Hurda Maliyeti',
      'fire': 'Fire Maliyeti',
      'garanti': 'Garanti Maliyeti',
      'iade': 'İade Maliyeti',
      'sikayet': 'Şikayet Maliyeti',
      'test': 'Test Maliyeti',
      'denetim': 'Denetim Maliyeti',
      'egitim': 'Eğitim Maliyeti',
      'onleme': 'Önleme Maliyeti'
    };
    return labels[type] || type;
  };

  // 🚗 Araç Performans Tıklama Handler'ı
  const handleVehiclePerformanceClick = useCallback((vehicleModel: VehicleModel) => {
    console.log('🚗 Araç Detay Analizi Açılıyor:', vehicleModel);
    
    // Gerçek veri analizi
    const realData = globalFilteredData && globalFilteredData.length > 0 ? globalFilteredData : [];
    
    // Araç modeli için filtrelenmiş veri
    const vehicleData = realData.filter(item => {
      const aracField = item.arac || item.aracModeli || item.vehicle || item.vehicleModel || '';
      const aciklamaField = item.aciklama || item.description || '';
      const parcaKoduField = item.parcaKodu || '';
      
      // Araç modeli eşleştirme
      const modelKeywords = {
        'FTH-240': ['fth', 'fth-240', 'fth240'],
        'Çelik-2000': ['çelik', 'celik', 'çelik-2000', 'celik-2000'],
        'Aga2100': ['aga2100', 'aga 2100', 'aga-2100'],
        'Aga3000': ['aga3000', 'aga 3000', 'aga-3000'],
        'Aga6000': ['aga6000', 'aga 6000', 'aga-6000'],
        'Kompost Makinesi': ['kompost'],
        'Çay Toplama Makinesi': ['çay', 'toplama'],
        'KDM 35': ['kdm35', 'kdm 35', 'kdm-35'],
        'KDM 70': ['kdm70', 'kdm 70', 'kdm-70'],
        'KDM 80': ['kdm80', 'kdm 80', 'kdm-80'],
        'Rusya Motor Odası': ['rusya', 'motor'],
        'Ural': ['ural'],
        'HSCK': ['hsck']
      };

      const keywords = modelKeywords[vehicleModel] || [vehicleModel.toLowerCase()];
      return keywords.some(keyword => 
        aracField.toLowerCase().includes(keyword) ||
        aciklamaField.toLowerCase().includes(keyword) ||
        parcaKoduField.toLowerCase().includes(keyword)
      );
    });

    console.log(`${vehicleModel} için bulunan veri:`, vehicleData.length, 'kayıt');

    // Trend analizi için son 12 ayın verisi
    const trendData = [];
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      
      const monthData = vehicleData.filter(item => {
        const itemDate = new Date(item.tarih || item.createdDate || new Date());
        const itemMonthKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
        return itemMonthKey === monthKey;
      });

      const monthCost = monthData.reduce((sum, item) => sum + (item.maliyet || 0), 0);
      trendData.push(monthCost);
    }

    // Yıllık değişim hesaplama - Gerçek yıllık karşılaştırma
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Bu yılın mevcut ayına kadar olan toplam maliyet
    const currentYearData = vehicleData.filter(item => {
      const itemDate = new Date(item.tarih || item.createdDate || new Date());
      return itemDate.getFullYear() === currentYear && itemDate.getMonth() <= currentMonth;
    });
    const currentYearTotal = currentYearData.reduce((sum, item) => sum + (item.maliyet || 0), 0);
    
    // Geçen yılın aynı dönemine kadar olan toplam maliyet
    const previousYearData = vehicleData.filter(item => {
      const itemDate = new Date(item.tarih || item.createdDate || new Date());
      return itemDate.getFullYear() === (currentYear - 1) && itemDate.getMonth() <= currentMonth;
    });
    const previousYearTotal = previousYearData.reduce((sum, item) => sum + (item.maliyet || 0), 0);
    
    // Yıllık değişim hesaplama
    let yuzdelikDegisim = 0;
    let trendYonu: 'yukselis' | 'dususte' | 'stabil' = 'stabil';
    
    if (previousYearTotal > 0) {
      yuzdelikDegisim = Math.round(((currentYearTotal - previousYearTotal) / previousYearTotal) * 100);
      if (Math.abs(yuzdelikDegisim) > 5) {
        trendYonu = yuzdelikDegisim > 0 ? 'yukselis' : 'dususte';
      }
    } else if (currentYearTotal > 0) {
      // Geçen yıl veri yoksa ama bu yıl varsa, artış olarak değerlendir
      yuzdelikDegisim = 100;
      trendYonu = 'yukselis';
    }
    
    // Kısa vadeli trend için son 3 ay vs önceki 3 ay karşılaştırması
    const recentAvg = trendData.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const previousAvg = trendData.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    
    // Eğer yıllık veri yoksa kısa vadeli trendi kullan
    if (previousYearTotal === 0 && currentYearTotal === 0 && previousAvg > 0) {
      yuzdelikDegisim = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
      if (Math.abs(yuzdelikDegisim) > 5) {
        trendYonu = yuzdelikDegisim > 0 ? 'yukselis' : 'dususte';
      }
    }

    // Atık türü dağılımı - maliyet türüne göre daha hassas filtreleme
    const retData = vehicleData.filter(item => {
      const type = (item.maliyetTuru || '').toLowerCase();
      const description = (item.aciklama || '').toLowerCase();
      return type.includes('ret') || description.includes('ret') || 
             type.includes('reject') || description.includes('reject');
    });
    
    const hurdaData = vehicleData.filter(item => {
      const type = (item.maliyetTuru || '').toLowerCase();
      const description = (item.aciklama || '').toLowerCase();
      return type.includes('hurda') || description.includes('hurda') ||
             type.includes('scrap') || description.includes('scrap');
    });
    
    const fireData = vehicleData.filter(item => {
      const type = (item.maliyetTuru || '').toLowerCase();
      const description = (item.aciklama || '').toLowerCase();
      return type.includes('fire') || description.includes('fire') ||
             type.includes('waste') || description.includes('waste') ||
             type.includes('yeniden') || description.includes('yeniden') ||
             type.includes('rework') || description.includes('rework');
    });

    // Toplam hesaplamalar
    const toplamMaliyet = vehicleData.reduce((sum, item) => sum + (item.maliyet || 0), 0);
    const toplamMiktar = vehicleData.reduce((sum, item) => sum + (item.miktar || item.quantity || 1), 0);
    const toplamAgirlik = vehicleData.reduce((sum, item) => sum + (item.agirlik || item.weight || 0), 0);

    // Hedef karşılaştırma
    const currentTarget = vehicleTargets.find(target => 
      target.aracModeli === vehicleModel && target.isActive
    );

    let hedefKarsilastirma = undefined;
    if (currentTarget) {
      const gercekMaliyet = toplamMaliyet;
      const hedefMaliyet = currentTarget.hedefler.toplamMaksimumMaliyet;
      
      // Performans değerlendirmesi: Gerçek maliyetin hedeften düşük olması iyi performans
      const performansYuzdesi = hedefMaliyet > 0 ? 
        Math.round(((hedefMaliyet - gercekMaliyet) / hedefMaliyet) * 100) : 0;
      
      let durum: 'basarili' | 'dikkat' | 'kritik' = 'basarili';
      let performansDurumu: string;
      
      if (performansYuzdesi >= 20) {
        durum = 'basarili';
        performansDurumu = 'Mükemmel Performans';
      } else if (performansYuzdesi >= 10) {
        durum = 'basarili';
        performansDurumu = 'İyi Performans';
      } else if (performansYuzdesi >= 0) {
        durum = 'dikkat';
        performansDurumu = 'Hedef Seviyesinde';
      } else if (performansYuzdesi >= -10) {
        durum = 'dikkat';
        performansDurumu = 'Hedef Aşımı';
      } else {
        durum = 'kritik';
        performansDurumu = 'Kritik Hedef Aşımı';
      }

      hedefKarsilastirma = {
        hedefMaliyet,
        gercekMaliyet,
        sapmaYuzdesi: performansYuzdesi, // Artık performans yüzdesi olarak kullanıyoruz
        durum,
        performansDurumu
      };
    }

    const detailData: VehiclePerformanceAnalysis = {
      aracModeli: vehicleModel,
      toplam: {
        kayitSayisi: vehicleData.length,
        toplamMaliyet: toplamMaliyet,
        toplamMiktar: toplamMiktar,
        toplamAgirlik: toplamAgirlik
      },
      atikTuruDagilim: {
        ret: { 
          adet: retData.length, 
          maliyet: retData.reduce((sum, item) => sum + (item.maliyet || 0), 0) 
        },
        hurda: { 
          kg: hurdaData.reduce((sum, item) => sum + (item.agirlik || item.weight || 0), 0), 
          maliyet: hurdaData.reduce((sum, item) => sum + (item.maliyet || 0), 0) 
        },
        fire: { 
          kg: fireData.reduce((sum, item) => sum + (item.agirlik || item.weight || 0), 0), 
          maliyet: fireData.reduce((sum, item) => sum + (item.maliyet || 0), 0) 
        }
      },
      trend: {
        sonUcAy: trendData,
        yuzdelikDegisim: Math.abs(yuzdelikDegisim),
        trendYonu: trendYonu as 'yukselis' | 'dususte' | 'stabil'
      },
      hedefKarsilastirma: hedefKarsilastirma
    };

    console.log('Oluşturulan detay verisi:', detailData);
    console.log(`${vehicleModel} Yıllık Değişim Hesaplaması:`, {
      currentYearTotal,
      previousYearTotal,
      yuzdelikDegisim,
      trendYonu,
      currentYear,
      previousYear: currentYear - 1
    });

    setSelectedVehicleData(detailData);
    setVehicleDetailDialogOpen(true);
    setVehicleDetailTab(0);
  }, [globalFilteredData, vehicleTargets]);

  // ✅ Interactive Card Functions
  const interactiveFunctions = {
    handleTotalCOPQClick: () => {
      setCurrentTab(2); // Veri Yönetimi sekmesine git
    },

    handleMonthlyTrendClick: () => {
      setCurrentTab(1); // Analytics sekmesine git
    },

    handleHighestCostClick: () => {
      // En yüksek maliyetli kayıtları bul (Top 10)
      const sortedRecords = (globalFilteredData || [])
        .filter(item => item.maliyet > 0)
        .sort((a, b) => (b.maliyet || 0) - (a.maliyet || 0))
        .slice(0, 10);
      
      if (sortedRecords.length > 0) {
        openModal({
          title: 'En Yüksek Maliyetli Kayıtlar',
          data: sortedRecords,
          type: 'highest-cost',
          icon: <ScaleIcon sx={{ color: '#f44336', fontSize: 28 }} />,
          openDOFForm,
          isDOFCreated
        });
      }
    },

    handleThisMonthClick: () => {
      // Bu ay eklenen kayıtları göster
      const thisMonth = new Date().getMonth() + 1;
      const thisYear = new Date().getFullYear();
      const thisMonthRecords = (globalFilteredData || []).filter(item => {
        if (!item.tarih) return false;
        const date = new Date(item.tarih);
        return date.getMonth() + 1 === thisMonth && date.getFullYear() === thisYear;
      });
      
      if (thisMonthRecords.length > 0) {
        openModal({
          title: 'Bu Ay Eklenen Kayıtlar',
          data: thisMonthRecords,
          type: 'monthly-records',
          icon: <CalendarTodayIcon sx={{ color: '#2196f3', fontSize: 28 }} />,
          openDOFForm,
          isDOFCreated
        });
      }
    },

    handleMostProblematicUnitClick: () => {
      // En problemli birimleri analiz et (Top 10)
      const unitAnalysis = (globalFilteredData || []).reduce((acc: any, item: any) => {
        const unit = item.birim || item.departman || 'Belirtilmemiş';
        if (!acc[unit]) acc[unit] = { total: 0, count: 0, records: [] };
        acc[unit].total += item.maliyet || 0;
        acc[unit].count += 1;
        acc[unit].records.push(item);
        return acc;
      }, {});
      
      const sortedUnits = Object.entries(unitAnalysis)
        .map(([unit, data]: [string, any]) => ({
          unit,
          total: data.total,
          count: data.count,
          average: data.total / data.count,
          records: data.records
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
      
      if (sortedUnits.length > 0) {
        openModal({
          title: 'En Problemli Birimler Analizi',
          data: sortedUnits,
          type: 'problematic-unit',
          icon: <BusinessIcon sx={{ color: '#ff9800', fontSize: 28 }} />,
          openDOFForm,
          isDOFCreated
        });
      }
    },

    handlePartAnalysisClick: (partCode: string) => {
      // Belirli parça koduna ait kayıtları göster
      const partRecords = (globalFilteredData || []).filter(item => 
        item.parcaKodu === partCode
      );
      
      if (partRecords.length > 0) {
        openModal({
          title: `Parça Analizi: ${partCode}`,
          data: partRecords,
          type: 'part-analysis',
          icon: <WarningIcon sx={{ color: '#ff9800', fontSize: 28 }} />,
          openDOFForm,
          isDOFCreated
        });
      }
    },

    handleUnitAnalysisClick: (unitName: string) => {
      // Belirli birime ait kayıtları göster
      const unitRecords = (globalFilteredData || []).filter(item => 
        (item.birim === unitName || item.departman === unitName)
      );
      
      if (unitRecords.length > 0) {
        openModal({
          title: `Birim Analizi: ${formatProfessionalDepartmentName(unitName)}`,
          data: unitRecords,
          type: 'unit-analysis',
          icon: <BusinessIcon sx={{ color: '#2196f3', fontSize: 28 }} />,
          openDOFForm,
          isDOFCreated
        });
      }
    },

    handleCostTypeAnalysisClick: (costType: string) => {
      // Maliyet türüne göre filtrelenmiş verileri modal'da göster
      const costTypeData = (globalFilteredData || []).filter(item => 
        item.maliyetTuru === costType
      ).sort((a, b) => b.maliyet - a.maliyet);
      
      const typeDisplayNames: { [key: string]: string } = {
        'hurda': 'Hurda Maliyeti',
        'yeniden_islem': 'Yeniden İşlem',
        'fire': 'Fire Maliyeti',
        'garanti': 'Garanti Maliyeti',
        'iade': 'İade Maliyeti',
        'sikayet': 'Şikayet Maliyeti',
        'onleme': 'Önleme Maliyeti'
      };
      
      if (costTypeData.length > 0) {
        openModal({
          title: `${typeDisplayNames[costType] || costType} Analizi`,
          data: costTypeData,
          type: 'part-analysis',
          icon: <PieChartIcon sx={{ fontSize: 28 }} />,
          openDOFForm,
          isDOFCreated
        });
      }
    },

    handleVehicleAnalysisClick: (vehicleName: string) => {
      // Araç türüne göre filtrelenmiş verileri modal'da göster
      const vehicleData = (globalFilteredData || []).filter(item => 
        item.arac === vehicleName
      ).sort((a, b) => b.maliyet - a.maliyet);
      
      if (vehicleData.length > 0) {
        openModal({
          title: `${vehicleName} Araç Analizi`,
          data: vehicleData,
          type: 'part-analysis',
          icon: <BarChartIcon sx={{ fontSize: 28 }} />
        });
      }
    }
  };

  // ✅ Context7 Component: Executive Dashboard with Real Data Props


  const ExecutiveDashboard: React.FC<{ 
    realTimeData?: any, 
    filteredData?: any[],
    onTotalCOPQClick?: () => void,
    onMonthlyTrendClick?: () => void,
    onHighestCostClick?: () => void,
    onThisMonthClick?: () => void,
    onMostProblematicUnitClick?: () => void,
    onPartAnalysisClick?: (partCode: string) => void,
    onUnitAnalysisClick?: (unitName: string) => void,
    onCostTypeAnalysisClick?: (costType: string) => void,
    onVehicleAnalysisClick?: (vehicleName: string) => void
  }> = ({ 
    realTimeData, 
    filteredData,
    onTotalCOPQClick,
    onMonthlyTrendClick,
    onHighestCostClick,
    onThisMonthClick,
    onMostProblematicUnitClick,
    onPartAnalysisClick,
    onUnitAnalysisClick,
    onCostTypeAnalysisClick,
    onVehicleAnalysisClick
  }) => {
    // ✅ Context7: Real-time data calculations with defensive programming - FILTERED DATA
    const filteredTotalCost = (filteredData || []).reduce((sum, item) => sum + (item.maliyet || 0), 0);
    const filteredTotalItems = (filteredData || []).length;
    const filteredAvgCost = filteredTotalItems > 0 ? filteredTotalCost / filteredTotalItems : 0;
    
    // Use filtered data instead of static realTimeData
    const realTotalCost = filteredTotalCost;
    const realTotalItems = filteredTotalItems;
    const realAvgCost = filteredAvgCost;
    // ✅ Calculate COPQ breakdown from filtered data
    const copqData = (() => {
      if (!filteredData || filteredData.length === 0) return [];
      
      const mapMaliyetTuruToCOPQ = (maliyetTuru: string) => {
        const mapping: { [key: string]: string } = {
          'hurda': 'İç Hata',
          'yeniden_islem': 'İç Hata', 
          'fire': 'İç Hata',
          'garanti': 'Dış Hata',
          'iade': 'Dış Hata',
          'sikayet': 'Dış Hata',
          'denetim': 'Değerlendirme',
          'test': 'Değerlendirme',
          'egitim': 'Önleme',
          'onleme': 'Önleme'
        };
        return mapping[maliyetTuru] || 'Diğer';
      };

      const categoryColors: { [key: string]: string } = {
        'İç Hata': '#ef4444',
        'Dış Hata': '#f97316', 
        'Değerlendirme': '#3b82f6',
        'Önleme': '#22c55e',
        'Diğer': '#6b7280'
      };

      return filteredData
        .reduce((acc: any[], item: any) => {
          const copqCategory = mapMaliyetTuruToCOPQ(item.maliyetTuru);
          const existing = acc.find(c => c.category === copqCategory);
          if (existing) {
            existing.value += item.maliyet;
          } else {
            acc.push({ 
              name: copqCategory,
              category: copqCategory, 
              value: item.maliyet,
              color: categoryColors[copqCategory] || '#6b7280'
            });
          }
          return acc;
        }, []);
    })();
    
    // ✅ Generate trend data from filtered data
    const realTrendData = (() => {
      if (!filteredData || filteredData.length === 0) {
        return realTimeData?.trendData?.length > 0 ? realTimeData.trendData : trendData;
      }
      
      const monthlyData = new Map();
      
      filteredData.forEach((item: any) => {
        if (item.tarih && item.maliyet && item.maliyetTuru) {
          const itemDate = new Date(item.tarih);
          const monthKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
          const monthName = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                           'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'][itemDate.getMonth()];
          
          const getCOPQCategory = (maliyetTuru: string) => {
            const copqMapping = {
              'hurda': 'internal',
              'yeniden_islem': 'internal', 
              'fire': 'internal',
              'garanti': 'external',
              'iade': 'external',
              'sikayet': 'external',
              'denetim': 'appraisal',
              'test': 'appraisal',
              'egitim': 'prevention',
              'onleme': 'prevention'
            };
            return copqMapping[maliyetTuru] || 'internal';
          };
          
          const copqCategory = getCOPQCategory(item.maliyetTuru);
          
          if (!monthlyData.has(monthKey)) {
            monthlyData.set(monthKey, {
              month: monthName,
              monthKey,
              internal: 0,
              external: 0,
              appraisal: 0,
              prevention: 0,
              total: 0
            });
          }
          
          const monthData = monthlyData.get(monthKey);
          monthData[copqCategory] += item.maliyet;
          monthData.total += item.maliyet;
        }
      });
      
      return Array.from(monthlyData.values())
        .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
        .slice(-6);
    })();
    
    // ✅ Generate real part code analysis from filtered data
    const partCodeData = (() => {
      // Use filteredData parameter instead of globalFilteredData
      const dataToUse = filteredData || globalFilteredData || [];
      
      if (dataToUse.length === 0) {
        // Güvenli fallback: realTimeData'dan gelen veriyi normalize et
        const rawData = realTimeData?.byParcaKodu || [];
        return rawData.map((item: any) => ({
          parcaKodu: item.parcaKodu || item.partCode || 'Bilinmeyen',
          toplam: item.toplam || item.totalCost || item.total || 0,
          adet: item.adet || item.count || 1,
          count: item.count || item.adet || 1,
          totalCost: item.toplam || item.totalCost || item.total || 0
        }));
      }
      
      return dataToUse
        .reduce((acc: any[], item: any) => {
          const parcaKodu = item.parcaKodu;
          if (!parcaKodu) return acc;
          
          const existing = acc.find(part => part.parcaKodu === parcaKodu);
          if (existing) {
            existing.toplam += item.maliyet;
            existing.adet += 1;
            existing.count += 1;
            existing.totalCost += item.maliyet;
          } else {
            acc.push({
              parcaKodu: parcaKodu,
              toplam: item.maliyet,
              adet: 1,
              count: 1,
              totalCost: item.maliyet
            });
          }
          return acc;
        }, [])
        .sort((a: any, b: any) => b.toplam - a.toplam);
    })();
    
    // ✅ Context7: Monthly comparison calculation with debug
    console.log('🔍 COPQ Trend Debug:', {
      realTimeDataTrendLength: realTimeData?.trendData?.length || 0,
      staticTrendDataLength: trendData.length,
      usingRealTrend: realTimeData?.trendData?.length > 0,
      finalTrendData: realTrendData
    });
    
    const currentMonth = realTrendData[realTrendData.length - 1]?.total || 0;
    const previousMonth = realTrendData[realTrendData.length - 2]?.total || 0;
    const monthlyChange = previousMonth ? ((currentMonth - previousMonth) / previousMonth * 100) : 0;
    
    console.log('📊 COPQ Monthly Change Debug:', {
      currentMonth: currentMonth.toLocaleString('tr-TR'),
      previousMonth: previousMonth.toLocaleString('tr-TR'),
      monthlyChange: monthlyChange.toFixed(2) + '%',
      trendDirection: monthlyChange > 0 ? 'Artış' : 'Azalış'
    });
    
    // ✅ Context7: Top problem parts calculation
    const topProblemPart = partCodeData[0];
            const criticalPartsCount = partCodeData.filter(part => (part.toplam || part.totalCost || 0) > realAvgCost * 2).length;
    
    // ✅ YENİ: Üretim verisi özeti
    const currentPeriod = new Date().toISOString().substring(0, 7);
    const getProductionSummary = (period: string) => {
      // Default production summary with all required fields
      return {
        totalProduction: 0,
        targetProduction: 0,
        efficiency: 0,
        categories: [],
        totalVehicles: 0,
        activeModels: 0,
        topProducingModel: null
      };
    };
    const productionSummary = getProductionSummary(currentPeriod);
    
    return (
      <Box>
        {/* ✅ Context7: Enhanced KPI Cards with Real Data */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total COPQ Card - Interactive */}
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard 
                              onClick={onTotalCOPQClick}
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(244, 67, 54, 0.15)',
                  borderColor: '#f44336'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <MoneyIcon sx={{ fontSize: 48, color: '#f44336' }} />
                </Box>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  ₺{realTotalCost.toLocaleString('tr-TR')}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Toplam COPQ Maliyeti
                </Typography>
                <Chip 
                  label={`${realTotalItems} Toplam Kayıt`}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              </CardContent>
            </MetricCard>
          </Grid>

          {/* Monthly Trend Card - Interactive */}
          <Grid item xs={12} sm={6} md={4}>
            <Fade in timeout={300}>
              <MetricCard 
                onClick={onMonthlyTrendClick}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(33, 150, 243, 0.15)',
                    borderColor: '#2196f3'
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <TimelineIcon sx={{ fontSize: 40, color: '#2196f3' }} />
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {(filteredData || []).length}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Toplam Kayıt Sayısı
                  </Typography>
                  <Chip 
                    label="Analiz"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </CardContent>
              </MetricCard>
            </Fade>
          </Grid>

          {/* Highest Single Cost Card - Interactive */}
          <Grid item xs={12} sm={6} md={4}>
            <Fade in timeout={400}>
              <MetricCard
                onClick={onHighestCostClick}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(244, 67, 54, 0.15)',
                    borderColor: '#f44336'
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <ScaleIcon sx={{ fontSize: 40, color: '#f44336' }} />
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color="error.main">
                    ₺{Math.max(...(filteredData || []).map(item => item.maliyet || 0)).toLocaleString('tr-TR')}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    En Yüksek Maliyet
                  </Typography>
                  <Chip 
                    label="Tek Kayıt"
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                </CardContent>
              </MetricCard>
            </Fade>
          </Grid>

          {/* This Month Records Card - Interactive */}
          <Grid item xs={12} sm={6} md={4}>
            <Fade in timeout={500}>
              <MetricCard
                onClick={onThisMonthClick}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(33, 150, 243, 0.15)',
                    borderColor: '#2196f3'
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <CalendarTodayIcon sx={{ fontSize: 40, color: '#2196f3' }} />
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {(() => {
                      const thisMonth = new Date().getMonth() + 1;
                      const thisYear = new Date().getFullYear();
                      return (filteredData || []).filter(item => {
                        if (!item.tarih) return false;
                        const date = new Date(item.tarih);
                        return date.getMonth() + 1 === thisMonth && date.getFullYear() === thisYear;
                      }).length;
                    })()}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Bu Ay Eklenen
                  </Typography>
                  <Chip 
                    label="Yeni Kayıt"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </CardContent>
              </MetricCard>
            </Fade>
          </Grid>

          {/* Most Problematic Unit Card - Interactive */}
          <Grid item xs={12} sm={6} md={4}>
            <Fade in timeout={600}>
              <MetricCard
                onClick={onMostProblematicUnitClick}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(255, 152, 0, 0.15)',
                    borderColor: '#ff9800'
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <BusinessIcon sx={{ fontSize: 40, color: '#ff9800' }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="warning.main" sx={{ fontSize: '1rem' }}>
                    {(() => {
                      const unitAnalysis = (filteredData || []).reduce((acc: any, item: any) => {
                        const unit = item.birim || item.departman || 'Belirtilmemiş';
                        if (!acc[unit]) acc[unit] = { total: 0, count: 0 };
                        acc[unit].total += item.maliyet || 0;
                        acc[unit].count += 1;
                        return acc;
                      }, {});
                      
                      const topUnit = Object.entries(unitAnalysis)
                        .sort(([,a]: any, [,b]: any) => b.total - a.total)[0];
                      
                      const formatProfessionalName = (name: string) => {
                        const specialNames: { [key: string]: string } = {
                          'arge': 'Ar-Ge',
                          'boyahane': 'Boyahane',
                          'bukum': 'Büküm',
                          'depo': 'Depo',
                          'elektrikhane': 'Elektrikhane',
                          'kalite_kontrol': 'Kalite Kontrol',
                          'kaynakhane': 'Kaynakhane',
                          'kesim': 'Kesim',
                          'mekanik_montaj': 'Mekanik Montaj',
                          'satin_alma': 'Satın Alma',
                          'satis': 'Satış',
                          'uretim_planlama': 'Üretim Planlama'
                        };
                        return specialNames[name.toLowerCase()] || name;
                      };
                      
                      return topUnit ? formatProfessionalName(topUnit[0]) : 'Veri Yok';
                    })()}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    En Problemli Birim
                  </Typography>
                  <Chip 
                    label={(() => {
                      const unitAnalysis = (filteredData || []).reduce((acc: any, item: any) => {
                        const unit = item.birim || item.departman || 'Belirtilmemiş';
                        if (!acc[unit]) acc[unit] = { total: 0, count: 0 };
                        acc[unit].total += item.maliyet || 0;
                        acc[unit].count += 1;
                        return acc;
                      }, {});
                      
                      const topUnit = Object.entries(unitAnalysis)
                        .sort(([,a]: any, [,b]: any) => b.total - a.total)[0];
                      
                      return topUnit ? `₺${(topUnit[1] as any).total.toLocaleString('tr-TR')}` : '₺0';
                    })()}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                </CardContent>
              </MetricCard>
            </Fade>
          </Grid>

          {/* YENİ: Bu Ay Üretim Özeti Kartı */}
          <Grid item xs={12} sm={6} md={4}>
            <Fade in timeout={700}>
              <MetricCard
                onClick={() => {
                  // Aylık Üretim Sayıları sekmesine git
                  const customEvent = new CustomEvent('goToProductionTab');
                  window.dispatchEvent(customEvent);
                }}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(156, 39, 176, 0.15)',
                    borderColor: '#9c27b0'
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <FactoryIcon sx={{ fontSize: 40, color: 'purple' }} />
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="purple">
                    {productionSummary.totalVehicles}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Bu Ay Üretim
                  </Typography>
                  <Chip 
                    label={`${productionSummary.activeModels} Model`}
                    size="small"
                    color="default"
                    variant="outlined"
                  />
                  {productionSummary.topProducingModel && (
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={productionSummary.topProducingModel.model}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  )}
                </CardContent>
              </MetricCard>
            </Fade>
          </Grid>
        </Grid>



        {/* ✅ Context7: Elegant Analysis Tables with Enhanced Data */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }} display="flex" alignItems="center" gap={2}>
              <AnalyticsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              Detaylı Performans Analizi
              <Chip label="Top 5 İstatistikleri" color="primary" size="small" />
            </Typography>
          </Grid>
          
          {/* 1. Top 5 Kritik Parça - Elegant Table */}
          <Grid item xs={12} lg={6}>
            <Paper elevation={8} sx={{ 
              borderRadius: 4, 
              overflow: 'hidden',
              height: '750px',
              background: 'linear-gradient(135deg, #fff8e1 0%, #ffffff 100%)',
              border: '2px solid #ffb74d',
              boxShadow: '0 8px 32px rgba(255, 152, 0, 0.15)'
            }}>
              {/* Elegant Header */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                color: 'white',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <WarningIcon sx={{ fontSize: 28 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Top 5 Kritik Parça Analizi
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      En yüksek maliyetli parçalar ve detayları
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Clean & Spacious Table */}
              <Box sx={{ p: 2, maxHeight: '630px', overflowY: 'auto' }}>
                {partCodeData.slice(0, 5).map((part, index) => {
                  const totalCost = part.toplam || part.totalCost || 0;
                  const recordCount = part.adet || part.count || 0;
                  const costPercentage = realTotalCost ? (totalCost / realTotalCost * 100) : 0;
                  

                  
                  return (
                    <Paper 
                      key={part.parcaKodu || index}
                      elevation={2}
                      onClick={() => onPartAnalysisClick?.(part.parcaKodu || `PART-${index + 1}`)}
                      sx={{ 
                        p: 3, 
                        mb: 2, 
                        borderRadius: 3,
                        backgroundColor: index === 0 ? '#fff8e1' : 'white',
                        border: index === 0 ? '2px solid #ff9800' : '1px solid #e0e0e0',
                        cursor: 'pointer',
                        '&:hover': { 
                          boxShadow: 4,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s ease',
                          borderColor: '#ff9800'
                        }
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        {/* Sıra ve Parça Kodu */}
                        <Grid item xs={12} sm={4}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Chip 
                              label={`${index + 1}`} 
                              size="medium" 
                              color={index === 0 ? 'warning' : index < 3 ? 'info' : 'default'}
                              sx={{ fontWeight: 'bold', fontSize: '0.9rem', minWidth: '32px' }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                variant="h6" 
                                fontWeight="bold" 
                                sx={{ 
                                  fontSize: '1rem',
                                  wordBreak: 'break-all',
                                  lineHeight: '1.2'
                                }}
                              >
                                {part.parcaKodu || `PART-${index + 1}`}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                Kritik: {index === 0 ? 'YÜKSEK' : index < 3 ? 'ORTA' : 'DÜŞÜK'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        {/* Maliyet Bilgileri */}
                        <Grid item xs={12} sm={4}>
                          <Box textAlign="center">
                            <Typography variant="h5" fontWeight="bold" color="warning.main">
                              ₺{totalCost.toLocaleString('tr-TR')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Birim Toplam Maliyet
                            </Typography>
                          </Box>
                        </Grid>
                        
                        {/* İstatistikler */}
                        <Grid item xs={12} sm={4}>
                          <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                Kayıt Sayısı:
                              </Typography>
                              <Chip 
                                label={recordCount} 
                                size="small" 
                                variant="outlined"
                                color="warning"
                              />
                            </Box>
                            
                            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                Toplam Pay:
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="warning.main">
                                %{costPercentage.toFixed(1)}
                              </Typography>
                            </Box>
                            
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(costPercentage, 100)} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                backgroundColor: '#fff3e0',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: index === 0 ? '#f57c00' : '#ff9800'
                                }
                              }}
                            />
                            

                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  );
                })}
              </Box>
                
                                 {(!partCodeData || partCodeData.length === 0) && (
                   <Box sx={{ p: 4, textAlign: 'center' }}>
                     <Typography variant="body2" color="text.secondary">
                       Henüz parça verisi mevcut değil
                     </Typography>
                   </Box>
                 )}
            </Paper>
          </Grid>

          {/* 2. Top 5 Maliyetli Birim - Clean Cards */}
          <Grid item xs={12} lg={6}>
            <Paper elevation={8} sx={{ 
              borderRadius: 4, 
              overflow: 'hidden',
              height: '750px',
              background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
              border: '2px solid #64b5f6',
              boxShadow: '0 8px 32px rgba(33, 150, 243, 0.15)'
            }}>
              {/* Header */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                color: 'white',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <BusinessIcon sx={{ fontSize: 28 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Top 5 Maliyetli Birim Analizi
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Departman bazlı maliyet dağılımı
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Content */}
              <Box sx={{ p: 2, maxHeight: '630px', overflowY: 'auto' }}>
                {(() => {
                  // ✅ Profesyonel kapitalizasyon fonksiyonu
                  const formatProfessionalName = (name: string) => {
                    if (!name) return 'Bilinmeyen';
                    
                    // Özel birim isimleri mapping
                    const specialNames: { [key: string]: string } = {
                      'arge': 'Ar-Ge',
                      'boyahane': 'Boyahane',
                      'bukum': 'Büküm',
                      'depo': 'Depo',
                      'elektrikhane': 'Elektrikhane',
                      'kalite_kontrol': 'Kalite Kontrol',
                      'kalite kontrol': 'Kalite Kontrol',
                      'kaynakhane': 'Kaynakhane',
                      'kesim': 'Kesim',
                      'mekanik_montaj': 'Mekanik Montaj',
                      'mekanik montaj': 'Mekanik Montaj',
                      'satin_alma': 'Satın Alma',
                      'satin alma': 'Satın Alma',
                      'satis': 'Satış',
                      'uretim_planlama': 'Üretim Planlama',
                      'uretim planlama': 'Üretim Planlama'
                    };
                    
                    const lowerName = name.toLowerCase();
                    if (specialNames[lowerName]) {
                      return specialNames[lowerName];
                    }
                    
                    // Genel kapitalizasyon (her kelimenin ilk harfi büyük)
                    return name.split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ');
                  };
                  
                  // ✅ Generate real department analysis from filtered data
                  const departmentAnalysis = globalFilteredData
                    .reduce((acc: any[], item: any) => {
                      const birim = item.birim || item.department || 'Bilinmeyen Birim';
                      const existing = acc.find(dept => dept.birim === birim);
                      if (existing) {
                        existing.toplam += item.maliyet;
                        existing.adet += 1;
                        existing.count += 1;
                      } else {
                        acc.push({
                          birim: birim,
                          department: birim,
                          toplam: item.maliyet,
                          adet: 1,
                          count: 1
                        });
                      }
                      return acc;
                    }, [])
                    .sort((a: any, b: any) => b.toplam - a.toplam)
                    .slice(0, 5);

                  return departmentAnalysis.map((department: any, index) => {
                  const deptCost = department.toplam || department.totalCost || 0;
                  const deptCount = department.adet || department.count || 0;
                  const deptPercentage = realTotalCost ? (deptCost / realTotalCost * 100) : 0;
                  
                  return (
                    <Paper 
                      key={department.birim || department.department || index}
                      elevation={2}
                      onClick={() => onUnitAnalysisClick?.(department.birim || department.department || `Birim-${index + 1}`)}
                      sx={{ 
                        p: 3, 
                        mb: 2, 
                        borderRadius: 3,
                        backgroundColor: index === 0 ? '#e3f2fd' : 'white',
                        border: index === 0 ? '2px solid #2196f3' : '1px solid #e0e0e0',
                        cursor: 'pointer',
                        '&:hover': { 
                          boxShadow: 4,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s ease'
                        }
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        {/* Sıra ve Birim Adı */}
                        <Grid item xs={12} sm={4}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Chip 
                              label={`${index + 1}`} 
                              size="medium" 
                              color={index === 0 ? 'primary' : index < 3 ? 'info' : 'default'}
                              sx={{ fontWeight: 'bold', fontSize: '0.9rem', minWidth: '32px' }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                variant="h6" 
                                fontWeight="bold" 
                                sx={{ 
                                  fontSize: '0.85rem',
                                  wordBreak: 'break-word',
                                  lineHeight: '1.1',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {formatProfessionalName(department.birim || department.department || `Birim-${index + 1}`)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                Kritik: {index === 0 ? 'YÜKSEK' : index < 3 ? 'ORTA' : 'DÜŞÜK'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        {/* Maliyet Bilgileri */}
                        <Grid item xs={12} sm={4}>
                          <Box textAlign="center">
                            <Typography variant="h5" fontWeight="bold" color="primary.main">
                              ₺{deptCost.toLocaleString('tr-TR')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Birim Toplam Maliyet
                            </Typography>
                          </Box>
                        </Grid>
                        
                        {/* İstatistikler */}
                        <Grid item xs={12} sm={4}>
                          <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                Kayıt Sayısı:
                              </Typography>
                              <Chip 
                                label={deptCount} 
                                size="small" 
                                variant="outlined"
                                color="primary"
                              />
                            </Box>
                            
                            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                Toplam Pay:
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="primary.main">
                                %{deptPercentage.toFixed(1)}
                              </Typography>
                            </Box>
                            
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(deptPercentage, 100)} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                backgroundColor: '#e3f2fd',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: index === 0 ? '#1976d2' : '#2196f3'
                                }
                              }}
                            />
                            

                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  );
                  });
                })()}
                
                {globalFilteredData.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Henüz birim verisi mevcut değil
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

                    {/* 3. Top 5 Maliyet Türü - Clean Cards */}
          <Grid item xs={12} lg={6}>
            <Paper elevation={8} sx={{ 
              borderRadius: 4, 
              overflow: 'hidden',
              height: '750px',
              background: 'linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)',
              border: '2px solid #ba68c8',
              boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)'
            }}>
              {/* Header */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                color: 'white',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <PieChartIcon sx={{ fontSize: 28 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Top 5 Maliyet Türü Analizi
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Garanti, hurda, fire vb. maliyet türleri
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Content */}
              <Box sx={{ p: 2, maxHeight: '630px', overflowY: 'auto' }}>
                {(() => {
                  // ✅ Generate real cost type analysis from filtered data
                  const costTypeAnalysis = globalFilteredData
                    .reduce((acc: any[], item: any) => {
                      const maliyetTuru = item.maliyetTuru;
                      const existing = acc.find(ct => ct.type === maliyetTuru);
                      if (existing) {
                        existing.toplam += item.maliyet;
                        existing.adet += 1;
                        existing.count += 1;
                      } else {
                        // Map internal value to display name
                        const typeDisplayNames: { [key: string]: string } = {
                          'hurda': 'Hurda Maliyeti',
                          'yeniden_islem': 'Yeniden İşlem Maliyeti',
                          'fire': 'Fire Maliyeti',
                          'garanti': 'Garanti Maliyeti',
                          'iade': 'İade Maliyeti',
                          'sikayet': 'Şikayet Maliyeti',
                          'denetim': 'Denetim Maliyeti',
                          'test': 'Test Maliyeti',
                          'egitim': 'Eğitim Maliyeti',
                          'onleme': 'Önleme Maliyeti'
                        };
                        
                        acc.push({
                          type: maliyetTuru,
                          displayName: typeDisplayNames[maliyetTuru] || maliyetTuru,
                          toplam: item.maliyet,
                          adet: 1,
                          count: 1
                        });
                      }
                      return acc;
                    }, [])
                    .sort((a: any, b: any) => b.toplam - a.toplam)
                    .slice(0, 5);

                  return costTypeAnalysis.map((costType, index) => {
                    const typeCost = costType.toplam || 0;
                    const typeCount = costType.adet || costType.count || 0;
                    const typePercentage = realTotalCost ? (typeCost / realTotalCost * 100) : 0;
                    
                    // Maliyet türü renk eşlemesi
                    const getTypeColor = (type) => {
                      const colorMap = {
                        'garanti': '#f44336',
                        'hurda': '#ff5722', 
                        'fire': '#ff9800',
                        'yeniden_islem': '#2196f3',
                        'iade': '#e91e63',
                        'sikayet': '#9c27b0',
                        'test': '#00bcd4',
                        'denetim': '#4caf50',
                        'egitim': '#607d8b',
                        'onleme': '#795548'
                      };
                      return colorMap[type] || '#757575';
                    };
                    
                    const typeColor = getTypeColor(costType.type);
                  
                    return (
                      <Paper 
                        key={costType.type || index}
                        elevation={2}
                        onClick={() => onCostTypeAnalysisClick?.(costType.type)}
                        sx={{ 
                          p: 2.5, 
                          mb: 2, 
                          borderRadius: 3,
                          backgroundColor: index === 0 ? '#f3e5f5' : 'white',
                          border: `2px solid ${typeColor}`,
                          cursor: 'pointer',
                          '&:hover': { 
                            boxShadow: 4,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.3s ease'
                          }
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          {/* Tür ve Sıra */}
                          <Grid item xs={12} sm={4}>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Chip 
                                label={`${index + 1}`} 
                                size="medium" 
                                sx={{ 
                                  backgroundColor: `${typeColor}20`,
                                  color: typeColor,
                                  fontWeight: 'bold'
                                }}
                              />
                              <Box>
                                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                                  {costType.displayName || costType.type || `Tür-${index + 1}`}
                                </Typography>
                                <Typography variant="body2" sx={{ color: typeColor, fontWeight: 'bold' }}>
                                  Maliyet Türü
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          
                          {/* Maliyet */}
                          <Grid item xs={12} sm={4}>
                            <Box textAlign="center">
                              <Typography variant="h5" fontWeight="bold" sx={{ color: typeColor }}>
                                ₺{typeCost.toLocaleString('tr-TR')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Toplam Maliyet
                              </Typography>
                            </Box>
                          </Grid>
                          
                          {/* İstatistikler */}
                          <Grid item xs={12} sm={4}>
                            <Box>
                              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="body2" fontWeight="bold">
                                  Kayıt:
                                </Typography>
                                <Chip 
                                  label={typeCount} 
                                  size="small" 
                                  sx={{ backgroundColor: `${typeColor}20`, color: typeColor }}
                                />
                              </Box>
                              
                              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="body2" fontWeight="bold">
                                  Pay:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" sx={{ color: typeColor }}>
                                  %{typePercentage.toFixed(1)}
                                </Typography>
                              </Box>
                              
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min(typePercentage, 100)} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  backgroundColor: `${typeColor}20`,
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: typeColor
                                  }
                                }}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    );
                  });
                })()}
                
                {globalFilteredData.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Henüz maliyet türü verisi mevcut değil
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* 4. Top 5 Araç Maliyeti - Clean Cards */}
          <Grid item xs={12} lg={6}>
            <Paper elevation={8} sx={{ 
              borderRadius: 4, 
              overflow: 'hidden',
              height: '750px',
              background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)',
              border: '2px solid #81c784',
              boxShadow: '0 8px 32px rgba(76, 175, 80, 0.15)'
            }}>
              {/* Header */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                color: 'white',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <BarChartIcon sx={{ fontSize: 28 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Top 5 Araç Maliyeti Analizi
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Araç bazlı maliyet takip sistemi
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Content */}
              <Box sx={{ p: 2, maxHeight: '630px', overflowY: 'auto' }}>
                {(() => {
                  // ✅ Profesyonel araç ismi formatlaması
                  const formatProfessionalVehicle = (name: string) => {
                    if (!name) return 'Bilinmeyen Araç';
                    
                    // Özel araç isimleri mapping
                    const specialVehicles: { [key: string]: string } = {
                      'fth240': 'FTH-240',
                      'celik2000': 'Çelik-2000',
                      'aga2100': 'Aga2100',
                      'aga3000': 'Aga3000',
                      'aga6000': 'Aga6000',
                      'kompost_makinesi': 'Kompost Makinesi',
                      'cay_toplama_makinesi': 'Çay Toplama Makinesi',
                      'kdm35': 'KDM 35',
                      'kdm70': 'KDM 70',
                      'kdm80': 'KDM 80',
                      'rusya_motor_odasi': 'Rusya Motor Odası',
                      'ural': 'Ural',
                      'hsck': 'HSCK'
                    };
                    
                    const lowerName = name.toLowerCase();
                    if (specialVehicles[lowerName]) {
                      return specialVehicles[lowerName];
                    }
                    
                    // Genel kapitalizasyon (her kelimenin ilk harfi büyük)
                    return name.split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ');
                  };
                  
                  // ✅ Generate real vehicle analysis from filtered data
                  const vehicleAnalysis = globalFilteredData
                    .reduce((acc: any[], item: any) => {
                      const arac = item.arac || item.vehicle || 'Bilinmeyen Araç';
                      const existing = acc.find(veh => veh.arac === arac);
                      if (existing) {
                        existing.toplam += item.maliyet;
                        existing.adet += 1;
                        existing.count += 1;
                      } else {
                        acc.push({
                          arac: arac,
                          vehicle: arac,
                          toplam: item.maliyet,
                          adet: 1,
                          count: 1
                        });
                      }
                      return acc;
                    }, [])
                    .sort((a: any, b: any) => b.toplam - a.toplam)
                    .slice(0, 5);

                  return vehicleAnalysis.map((vehicle, index) => {
                  const vehicleCost = vehicle.toplam || vehicle.totalCost || 0;
                  const vehicleCount = vehicle.adet || vehicle.count || 0;
                  const vehiclePercentage = realTotalCost ? (vehicleCost / realTotalCost * 100) : 0;
                  
                  return (
                    <Paper 
                      key={vehicle.arac || vehicle.vehicle || index}
                      elevation={2}
                      onClick={() => onVehicleAnalysisClick?.(vehicle.arac || vehicle.vehicle || `Araç-${index + 1}`)}
                      sx={{ 
                        p: 3, 
                        mb: 2, 
                        borderRadius: 3,
                        backgroundColor: index === 0 ? '#e8f5e8' : 'white',
                        border: index === 0 ? '2px solid #4caf50' : '1px solid #e0e0e0',
                        cursor: 'pointer',
                        '&:hover': { 
                          boxShadow: 4,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s ease'
                        }
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        {/* Sıra ve Araç Adı */}
                        <Grid item xs={12} sm={4}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Chip 
                              label={`${index + 1}`} 
                              size="medium" 
                              color={index === 0 ? 'success' : index < 3 ? 'primary' : 'default'}
                              sx={{ fontWeight: 'bold', fontSize: '0.9rem', minWidth: '32px' }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                variant="h6" 
                                fontWeight="bold" 
                                sx={{ 
                                  fontSize: '1rem',
                                  wordBreak: 'break-all',
                                  lineHeight: '1.2'
                                }}
                              >
                                {formatProfessionalVehicle(vehicle.arac || vehicle.vehicle || `Araç-${index + 1}`)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                Kritik: {index === 0 ? 'YÜKSEK' : index < 3 ? 'ORTA' : 'DÜŞÜK'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        {/* Maliyet Bilgileri */}
                        <Grid item xs={12} sm={4}>
                          <Box textAlign="center">
                            <Typography variant="h5" fontWeight="bold" color="success.main">
                              ₺{vehicleCost.toLocaleString('tr-TR')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Toplam Maliyet
                            </Typography>
                          </Box>
                        </Grid>
                        
                        {/* İstatistikler */}
                        <Grid item xs={12} sm={4}>
                          <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                Kayıt Sayısı:
                              </Typography>
                              <Chip 
                                label={vehicleCount} 
                                size="small" 
                                variant="outlined"
                                color="success"
                              />
                            </Box>
                            
                            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                Toplam Pay:
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                %{vehiclePercentage.toFixed(1)}
                              </Typography>
                            </Box>
                            
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(vehiclePercentage, 100)} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                backgroundColor: '#e8f5e8',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: index === 0 ? '#388e3c' : '#4caf50'
                                }
                              }}
                            />
                            

                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  );
                  });
                })()}
                
                {globalFilteredData.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Henüz araç verisi mevcut değil
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

      </Box>
    );
  };

  // ✅ Context7 Component: Analytics Dashboard with Enhanced Wide Layout
  // ✅ YENİ: ARAÇ BAZLI TAKİP DASHBOARD'U
  // Araç Detay Analizi İçerik Bileşeni
  const VehicleDetailAnalysisContent: React.FC<{ vehicle: VehiclePerformanceAnalysis }> = ({ vehicle }) => {
    const theme = useTheme();
    
    // Gerçek veri kaynağından detaylı analiz için veri al
    const [detailedData, setDetailedData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      const loadDetailedData = () => {
        try {
          const rawData = localStorage.getItem('kys-cost-management-data');
          const allData = rawData ? JSON.parse(rawData) : [];
          
          // Bu araç kategorisine ait tüm kayıtları filtrele
          const categoryModels = vehicle.categoryModels || [];
          const vehicleData = allData.filter((item: any) => {
            const aracField = item.arac || item.aracModeli || item.vehicle || item.vehicleModel || '';
            const birimField = item.birim || '';
            const aciklamaField = item.aciklama || item.description || '';
            const parcaKoduField = item.parcaKodu || '';
            
            // Kategori eşleştirme mantığı
            return categoryModels.some((model: VehicleModel) => {
              const modelKeywords = {
                'FTH-240': ['fth', 'fth-240', 'fth240'],
                'Çelik-2000': ['çelik', 'celik', 'çelik-2000', 'celik-2000', 'çelik2000'],
                'Aga2100': ['aga2100', 'aga 2100', 'aga-2100'],
                'Aga3000': ['aga3000', 'aga 3000', 'aga-3000'],
                'Aga6000': ['aga6000', 'aga 6000', 'aga-6000'],
                'Kompost Makinesi': ['kompost', 'kompost makinesi', 'kompost_makinesi'],
                'Çay Toplama Makinesi': ['çay', 'çay toplama', 'çay_toplama', 'çay makinesi', 'çay_makinesi'],
                'KDM 35': ['kdm35', 'kdm 35', 'kdm-35'],
                'KDM 70': ['kdm70', 'kdm 70', 'kdm-70'],
                'KDM 80': ['kdm80', 'kdm 80', 'kdm-80'],
                'Rusya Motor Odası': ['rusya', 'motor odası', 'motor_odası', 'rusya motor'],
                'Ural': ['ural'],
                'HSCK': ['hsck', 'h.s.c.k', 'h s c k']
              };
              
              const keywords = modelKeywords[model] || [model.toLowerCase()];
              const allTextFields = [
                aracField, birimField, aciklamaField, parcaKoduField,
                item.maliyetTuru || '', item.atikTuru || '', item.category || ''
              ].join(' ').toLowerCase();
              
              const directMatch = item.aracModeli === model;
              const keywordMatch = keywords.some(keyword => 
                allTextFields.includes(keyword.toLowerCase())
              );
              
              return directMatch || keywordMatch;
            });
          });
          
          setDetailedData(vehicleData);
          setLoading(false);
        } catch (error) {
          console.error('Detaylı veri yüklenirken hata:', error);
          setDetailedData([]);
          setLoading(false);
        }
      };
      
      loadDetailedData();
    }, [vehicle]);
    
    // Aylık trend verisi oluştur
    const monthlyTrend = useMemo(() => {
      const monthlyData: { [key: string]: number } = {};
      const last12Months = [];
      
      // Son 12 ayı oluştur
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' });
        monthlyData[monthKey] = 0;
        last12Months.push(monthKey);
      }
      
      // Verileri aylara göre grupla
      detailedData.forEach(item => {
        const itemDate = new Date(item.tarih || item.createdDate);
        const monthKey = itemDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' });
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey] += Number(item.maliyet) || 0;
        }
      });
      
      return last12Months.map(month => ({
        month,
        maliyet: monthlyData[month]
      }));
    }, [detailedData]);
    
    // Alt kırılım analizi
    const subCategoryAnalysis = useMemo(() => {
      const analysis: { [key: string]: { count: number; cost: number; records: any[] } } = {};
      
      vehicle.categoryModels?.forEach(model => {
        analysis[model] = { count: 0, cost: 0, records: [] };
      });
      
      detailedData.forEach(item => {
        // Her kaydın hangi alt modele ait olduğunu belirle
        const matchedModel = vehicle.categoryModels?.find(model => {
          const modelKeywords = {
            'FTH-240': ['fth', 'fth-240', 'fth240'],
            'Çelik-2000': ['çelik', 'celik', 'çelik-2000'],
            'Aga2100': ['aga2100', 'aga 2100'],
            'Aga3000': ['aga3000', 'aga 3000'],
            'Aga6000': ['aga6000', 'aga 6000'],
            'Kompost Makinesi': ['kompost'],
            'Çay Toplama Makinesi': ['çay', 'çay toplama'],
            'KDM 35': ['kdm35', 'kdm 35'],
            'KDM 70': ['kdm70', 'kdm 70'],
            'KDM 80': ['kdm80', 'kdm 80'],
            'Rusya Motor Odası': ['rusya', 'motor odası'],
            'Ural': ['ural'],
            'HSCK': ['hsck']
          };
          
          const keywords = modelKeywords[model] || [model.toLowerCase()];
          const allText = [
            item.arac || '', item.aracModeli || '', item.birim || '',
            item.aciklama || '', item.parcaKodu || ''
          ].join(' ').toLowerCase();
          
          return item.aracModeli === model || keywords.some(k => allText.includes(k));
        });
        
        if (matchedModel && analysis[matchedModel]) {
          analysis[matchedModel].count++;
          analysis[matchedModel].cost += Number(item.maliyet) || 0;
          analysis[matchedModel].records.push(item);
        }
      });
      
      return analysis;
    }, [detailedData, vehicle.categoryModels]);
    
    // Maliyet türü dağılımı
    const costTypeDistribution = useMemo(() => {
      const distribution: { [key: string]: number } = {};
      
      detailedData.forEach(item => {
        const costType = item.maliyetTuru || 'Bilinmeyen';
        distribution[costType] = (distribution[costType] || 0) + (Number(item.maliyet) || 0);
      });
      
      return Object.entries(distribution).map(([type, cost]) => ({
        type,
        cost,
        percentage: vehicle.toplam.toplamMaliyet > 0 ? (cost / vehicle.toplam.toplamMaliyet) * 100 : 0
      })).sort((a, b) => b.cost - a.cost);
    }, [detailedData, vehicle.toplam.toplamMaliyet]);
    
    if (loading) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Detaylı analiz yükleniyor...</Typography>
        </Box>
      );
    }
    
    return (
      <Box>
        {/* Özet Bilgiler */}
        <Paper sx={{ m: 3, p: 3, borderRadius: 2, bgcolor: 'primary.50' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  ₺{(vehicle.toplam.toplamMaliyet / 1000).toFixed(0)}K
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Toplam Maliyet
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {vehicle.toplam.kayitSayisi}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Toplam Kayıt
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {vehicle.categoryModels?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Alt Araç Sayısı
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color={
                  vehicle.trend.trendYonu === 'yukselis' ? 'error.main' :
                  vehicle.trend.trendYonu === 'dususte' ? 'success.main' : 'info.main'
                }>
                  {vehicle.trend.yuzdelikDegisim > 0 ? '+' : ''}{vehicle.trend.yuzdelikDegisim.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Trend Değişimi
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Aylık Trend Grafiği */}
        <Paper sx={{ m: 3, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon color="primary" />
            Son 12 Ay Maliyet Trendi
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="costGradientModal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis tickFormatter={(value) => `₺${(value/1000).toFixed(0)}K`} fontSize={11} />
              <ChartTooltip 
                formatter={(value) => [`₺${Number(value).toLocaleString()}`, 'Maliyet']}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="maliyet" 
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                fill="url(#costGradientModal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
        
        {/* Alt Kırılım Analizi */}
        <Paper sx={{ m: 3, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DirectionsCarIcon color="primary" />
            Alt Araç Kırılımı
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(subCategoryAnalysis).map(([model, data]) => (
              <Grid item xs={12} md={6} lg={4} key={model}>
                <Card sx={{ 
                  height: '100%',
                  border: '1px solid',
                  borderColor: data.count > 0 ? 'primary.200' : 'grey.200',
                  bgcolor: data.count > 0 ? 'primary.50' : 'grey.50'
                }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} color="primary.main" gutterBottom>
                      {model}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Kayıt Sayısı:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {data.count}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Toplam Maliyet:
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color={data.cost > 0 ? 'error.main' : 'text.secondary'}>
                        ₺{data.cost.toLocaleString()}
                      </Typography>
                    </Box>
                    {data.cost > 0 && vehicle.toplam.toplamMaliyet > 0 && (
                      <LinearProgress 
                        variant="determinate" 
                        value={(data.cost / vehicle.toplam.toplamMaliyet) * 100}
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
        
        {/* Maliyet Türü Dağılımı */}
        <Paper sx={{ m: 3, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PieChartIcon color="primary" />
            Maliyet Türü Dağılımı
          </Typography>
          <Grid container spacing={2}>
            {costTypeDistribution.map((item, index) => (
              <Grid item xs={12} md={6} key={item.type}>
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 2,
                  bgcolor: 'grey.50'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {item.type}
                    </Typography>
                    <Chip 
                      label={`${item.percentage.toFixed(1)}%`}
                      size="small"
                      color={index === 0 ? 'error' : index === 1 ? 'warning' : 'info'}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={700} color="error.main">
                    ₺{item.cost.toLocaleString()}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={item.percentage}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                    color={index === 0 ? 'error' : index === 1 ? 'warning' : 'info'}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
        
        {/* Atık Türü Detay Analizi */}
        <Paper sx={{ m: 3, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon color="primary" />
            Atık Türü Detay Analizi
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
                <Typography variant="subtitle1" fontWeight={600} color="error.main" gutterBottom>
                  Ret Analizi
                </Typography>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  {vehicle.atikTuruDagilim.ret.adet} adet
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Toplam Ret Sayısı
                </Typography>
                <Typography variant="h6" fontWeight={600} color="error.main">
                  ₺{vehicle.atikTuruDagilim.ret.maliyet.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ret Maliyeti
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                <Typography variant="subtitle1" fontWeight={600} color="warning.main" gutterBottom>
                  Hurda Analizi
                </Typography>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  {vehicle.atikTuruDagilim.hurda.kg.toFixed(1)} kg
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Toplam Hurda Ağırlığı
                </Typography>
                <Typography variant="h6" fontWeight={600} color="warning.main">
                  {vehicle.atikTuruDagilim.hurda.maliyet > 0 ? 
                    `₺${vehicle.atikTuruDagilim.hurda.maliyet.toLocaleString()}` : 
                    'Maliyet Yok'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hurda Maliyeti
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                <Typography variant="subtitle1" fontWeight={600} color="info.main" gutterBottom>
                  Fire Analizi
                </Typography>
                <Typography variant="h5" fontWeight={700} color="info.main">
                  {vehicle.atikTuruDagilim.fire.kg.toFixed(1)} kg
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Toplam Fire Ağırlığı
                </Typography>
                <Typography variant="h6" fontWeight={600} color="info.main">
                  {vehicle.atikTuruDagilim.fire.maliyet > 0 ? 
                    `₺${vehicle.atikTuruDagilim.fire.maliyet.toLocaleString()}` : 
                    'Maliyet Yok'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fire Maliyeti
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Son Kayıtlar */}
        <Paper sx={{ m: 3, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TableChartIcon color="primary" />
            Son Kayıtlar ({detailedData.length} toplam)
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Tarih</strong></TableCell>
                  <TableCell><strong>Maliyet Türü</strong></TableCell>
                  <TableCell align="right"><strong>Maliyet</strong></TableCell>
                  <TableCell><strong>Açıklama</strong></TableCell>
                  <TableCell><strong>İşlemler</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detailedData.slice(0, 10).map((record, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      {new Date(record.tarih || record.createdDate).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={record.maliyetTuru || 'Bilinmeyen'} 
                        size="small"
                        color={
                          (record.maliyetTuru || '').toLowerCase().includes('hurda') ? 'warning' :
                          (record.maliyetTuru || '').toLowerCase().includes('fire') ? 'info' :
                          (record.maliyetTuru || '').toLowerCase().includes('ret') ? 'error' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="error.main">
                        ₺{(Number(record.maliyet) || 0).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {record.aciklama || 'Açıklama yok'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {/* ✅ YENİ: Executive Dashboard Detay Görüntüleme Butonu */}
                      <Tooltip title="Detayları Görüntüle">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            console.log('🔍 Executive Dashboard Görüntüle Butonu Tıklandı:', record);
                            if ((window as any).handleViewDetails) {
                              console.log('✅ Global handleViewDetails bulundu, dialog açılıyor...');
                              (window as any).handleViewDetails(record);
                            } else {
                              console.log('❌ Global handleViewDetails bulunamadı!');
                              console.log('📊 Kayıt detayları:', record);
                              alert('⚠️ Detay görüntüleme servisi başlatılıyor, lütfen birkaç saniye bekleyip tekrar deneyin.');
                            }
                          }}
                          sx={{ color: 'info.main' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {detailedData.length > 10 && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                ... ve {detailedData.length - 10} kayıt daha
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    );
  };

  const VehicleTrackingDashboard: React.FC<{ 
    realTimeData?: any, 
    filteredData?: any[],
    vehicleTargets?: VehicleTarget[],
    onAddTarget?: () => void,
    onEditTarget?: (target: VehicleTarget) => void,
    onVehiclePerformanceClick?: (vehicleModel: VehicleModel) => void
  }> = ({ realTimeData, filteredData, vehicleTargets = [], onAddTarget, onEditTarget, onVehiclePerformanceClick }) => {
    const [viewMode, setViewMode] = useState<'cards' | 'table' | 'charts'>('cards');
    const [forceRefresh, setForceRefresh] = useState(0);
    
    // 📊 Araç Detay Modal State
    const [vehicleDetailModal, setVehicleDetailModal] = useState<{
      open: boolean;
      vehicle: VehiclePerformanceAnalysis | null;
    }>({ open: false, vehicle: null });

    // 📈 AYLIK ÜRETİM VERİLERİ HOOK - Component seviyesine taşındı
    const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []); // 2025-01 formatı
    
    const monthlyProductionData = useMemo(() => {
      try {
        const savedProductions = JSON.parse(localStorage.getItem('monthly_vehicle_productions') || '[]') as MonthlyVehicleProduction[];
        const filteredData = savedProductions.filter(p => p.donem === currentMonth && p.isActive);
        
        console.log('📊 Monthly Production Data Debug:', {
          currentMonth,
          totalSavedProductions: savedProductions.length,
          filteredForCurrentMonth: filteredData.length,
          allProductions: savedProductions,
          filteredProductions: filteredData,
          forceRefreshCount: forceRefresh
        });
        
        return filteredData;
      } catch (error) {
        console.error('Üretim verisi okuma hatası:', error);
        return [];
      }
    }, [currentMonth, forceRefresh]);

    // 🎯 ARAÇ BAŞINA MALIYET HESAPLAMA FUNCTIONları - Component seviyesine taşındı
    const getProductionDataForVehicle = useCallback((vehicle: VehiclePerformanceAnalysis) => {
      // ⚡ KRİTİK FIX: localStorage'dan gerçek veri okuma ve kontrol
      console.log('🚀 getProductionDataForVehicle çağrıldı:', {
        vehicleKategori: vehicle.kategori,
        vehicleCategoryModels: vehicle.categoryModels,
        displayName: vehicle.displayName
      });
      
      // ⚡ YENİ: Kategori bazlı ve eski model bazlı verileri birleştir
      const categoryProductionData = (() => {
        try {
          const rawData = localStorage.getItem('monthly_category_productions');
          if (!rawData || rawData === 'null' || rawData === '[]') {
            return [];
          }
          const parsed = JSON.parse(rawData) as MonthlyCategoryProduction[];
          console.log('✅ KATEGORİ bazlı veri:', parsed.length + ' kayıt', parsed);
          return parsed;
        } catch (error) {
          console.error('❌ Kategori veri parse hatası:', error);
          return [];
        }
      })();
      
      // Eski model bazlı veriler (geriye uyumluluk)
      const oldModelData = (() => {
        try {
          const rawData = localStorage.getItem('monthly_vehicle_productions');
          if (!rawData || rawData === 'null' || rawData === '[]') {
            return [];
          }
          const parsed = JSON.parse(rawData) as MonthlyVehicleProduction[];
          console.log('📦 ESKİ model bazlı veri:', parsed.length + ' kayıt', parsed);
          return parsed;
        } catch (error) {
          console.error('❌ Eski veri parse hatası:', error);
          return [];
        }
      })();
      
      // ⚡ Tarih filtreleme ile aktif verileri al - globalFilters kullan
      const activeCategoryData = categoryProductionData.filter(p => {
        const isActive = p.isActive !== false;
        const matchesDate = !globalFilters.selectedMonth || p.donem === globalFilters.selectedMonth;
        
        console.log(`📅 KATEGORİ TARIH FİLTRESİ: ${p.kategori} - ${p.donem}`, {
          isActive,
          matchesDate,
          selectedDate: globalFilters.selectedMonth,
          recordDate: p.donem
        });
        
        return isActive && matchesDate;
      });
      
      const activeOldData = oldModelData.filter(p => {
        const isActive = p.isActive !== false;
        const matchesDate = !globalFilters.selectedMonth || p.donem === globalFilters.selectedMonth;
        
        console.log(`📅 ESKİ VERİ TARIH FİLTRESİ: ${p.aracModeli} - ${p.donem}`, {
          isActive,
          matchesDate,
          selectedDate: globalFilters.selectedMonth,
          recordDate: p.donem
        });
        
        return isActive && matchesDate;
      });
       
       console.log('🔍 AKTİF VERİ FİLTRELEME:', {
         categoryCount: categoryProductionData.length,
         activeCategoryCount: activeCategoryData.length,
         oldDataCount: oldModelData.length,
         activeOldCount: activeOldData.length,
         categoryData: activeCategoryData.map(p => ({
           id: p.id,
           kategori: p.kategori,
           displayName: p.displayName,
           donem: p.donem,
           uretilen: p.uretilenAracSayisi,
           planlanan: p.planlanmisUretim,
           models: p.categoryModels
         })),
         oldData: activeOldData.map(p => ({
           id: p.id,
           model: p.aracModeli,
           kategori: p.kategori,
           donem: p.donem,
           uretilen: p.uretilenAracSayisi
         }))
       });

      console.log('🔍 ENHANCED getProductionDataForVehicle Debug:', {
        vehicleKategori: vehicle.kategori,
        vehicleAracModeli: vehicle.aracModeli,
        vehicleDisplayName: vehicle.displayName,
        currentMonth: currentMonth,
        categoryDataCount: categoryProductionData.length,
        activeCategoryDataCount: activeCategoryData.length,
        oldDataCount: oldModelData.length,
        activeOldDataCount: activeOldData.length,
        categoryProductionData: categoryProductionData,
        activeCategoryData: activeCategoryData,
        monthlyProductionDataFromHook: monthlyProductionData
      });

      // Kategori bazlı filtreleme önceliği - DÜZELTME: Model bazında da eşleştir
      if (vehicle.kategori) {
        console.log('🎯 KATEGORİ FİLTRELEME BAŞLANIYOR:', {
          arananKategori: vehicle.kategori,
          kategoridekiModeller: vehicle.categoryModels,
          toplamAktifKategoriVeri: activeCategoryData.length,
          toplamAktifEskiVeri: activeOldData.length
        });
        
        // ⚡ YENİ: Önce kategori bazlı verileri kontrol et
        const categoryMatch = activeCategoryData.find(p => p.kategori === vehicle.kategori);
        
        if (categoryMatch) {
          console.log('✅ KATEGORİ BAZLI VERİ BULUNDU:', categoryMatch);
          
          const result = {
            uretilenAdet: categoryMatch.uretilenAracSayisi,
            planlanmisAdet: categoryMatch.planlanmisUretim,
            gerceklesmeOrani: categoryMatch.gerceklesmeOrani,
            kayitSayisi: 1
          };
          
          console.log(`✅ Kategori ${vehicle.kategori} sonuç:`, result);
          return result;
        }
        
        // Fallback: Eski model bazlı verilerden kategori toplama
        console.log('⚠️ Kategori verisi yok, eski verilerden toplama yapılıyor...');
        const categoryProductions = activeOldData.filter(p => {
          // Direkt kategori eşleştirmesi
          const directCategoryMatch = p.kategori === vehicle.kategori;
          
          // Model bazında kategori eşleştirmesi - KDM 80 → Araç Üstü Vakumlu
          const modelInCategory = vehicle.categoryModels?.includes(p.aracModeli);
          
          // Hem kategori hem model eşleştirmesi
          const match = directCategoryMatch || modelInCategory;
          
          console.log(`📊 DETAYLI FİLTRELEME: ${p.aracModeli} (${p.kategori})`, {
            directCategoryMatch: `${p.kategori} === ${vehicle.kategori} = ${directCategoryMatch}`,
            modelInCategory: `${vehicle.categoryModels} includes ${p.aracModeli} = ${modelInCategory}`,
            finalMatch: match,
            productionData: {
              id: p.id,
              aracModeli: p.aracModeli,
              kategori: p.kategori,
              donem: p.donem,
              uretilen: p.uretilenAracSayisi,
              planlanan: p.planlanmisUretim
            }
          });
          return match;
        });
        
        console.log(`📈 Kategori ${vehicle.kategori} için bulunan üretim kayıtları:`, categoryProductions);
        
        // Kategorideki toplam üretim sayısını hesapla
        const totalProduced = categoryProductions.reduce((sum, p) => sum + p.uretilenAracSayisi, 0);
        const totalPlanned = categoryProductions.reduce((sum, p) => sum + (p.planlanmisUretim || 0), 0);
        
        const result = {
          uretilenAdet: totalProduced,
          planlanmisAdet: totalPlanned,
          gerceklesmeOrani: totalPlanned > 0 ? (totalProduced / totalPlanned) * 100 : 0,
          kayitSayisi: categoryProductions.length
        };
        
        console.log(`✅ Kategori ${vehicle.kategori} sonuç:`, result);
        return result;
      }
      
      // Tek model bazlı veri (geriye uyumluluk)
      if (vehicle.aracModeli) {
        const modelProduction = activeOldData.find(p => {
          const match = p.aracModeli === vehicle.aracModeli;
          console.log(`🚗 Model Filtreleme: ${p.aracModeli} vs ${vehicle.aracModeli}`, {
            match,
            productionDonem: p.donem,
            currentMonth: currentMonth,
            isActive: p.isActive
          });
          return match;
        });
        
        console.log(`🏭 Model ${vehicle.aracModeli} için bulunan üretim kaydı:`, modelProduction);
        
        const result = {
          uretilenAdet: modelProduction?.uretilenAracSayisi || 0,
          planlanmisAdet: modelProduction?.planlanmisUretim || 0,
          gerceklesmeOrani: modelProduction?.gerceklesmeOrani || 0,
          kayitSayisi: modelProduction ? 1 : 0
        };
        
        console.log(`✅ Model ${vehicle.aracModeli} sonuç:`, result);
        return result;
      }
      
      console.log('⚠️ Hiç üretim verisi bulunamadı:', vehicle);
      return { uretilenAdet: 0, planlanmisAdet: 0, gerceklesmeOrani: 0, kayitSayisi: 0 };
    }, [currentMonth, forceRefresh, globalFilters.selectedMonth]); // Tarih filtreleme eklendi

    const calculatePerVehicleCosts = useCallback((vehicle: VehiclePerformanceAnalysis, productionCount: number) => {
      if (productionCount === 0) {
        return {
          retPerVehicle: 0,
          hurdaPerVehicle: 0,
          firePerVehicle: 0,
          totalPerVehicle: 0
        };
      }
      
      return {
        retPerVehicle: vehicle.atikTuruDagilim.ret.adet / productionCount,
        hurdaPerVehicle: vehicle.atikTuruDagilim.hurda.kg / productionCount,
        firePerVehicle: vehicle.atikTuruDagilim.fire.kg / productionCount,
        totalPerVehicle: vehicle.toplam.toplamMaliyet / productionCount
      };
    }, []);

    // ✅ ARAÇ BAZLI TAKİP SENKRONIZASYON FİXİ: Event listener ile veri güncellemelerini dinle
    useEffect(() => {
      const handleCostDataUpdate = () => {
        console.log('🔄 Araç bazlı takip kartları güncelleniyor...');
        setForceRefresh(prev => prev + 1);
      };

      const handleStorageChange = (e: StorageEvent) => {
        if ((e.key === 'kys-cost-management-data' || e.key === 'monthly_vehicle_productions') && e.newValue) {
          console.log('🔄 localStorage değişikliği tespit edildi, araç kartları güncelleniyor...', {
            key: e.key,
            oldValue: e.oldValue ? 'var' : 'yok',
            newValue: e.newValue ? 'var' : 'yok'
          });
          setForceRefresh(prev => prev + 1);
        }
      };

      window.addEventListener('costDataUpdated', handleCostDataUpdate);
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('costDataUpdated', handleCostDataUpdate);
        window.removeEventListener('storage', handleStorageChange);
      };
    }, []);

    // 🚀 Gelişmiş Araç Bazlı Veri Analizi
    // 🚀 Gelişmiş Araç Bazlı Veri Analizi - Birleşik Veri Yönetiminden Doğru Veriler
    const vehicleAnalysis = useMemo(() => {
      // ARAÇ BAZLI TAKİP SENKRONIZASYON FİXİ: En güncel localStorage verisini kullan
      let realData;
      try {
        const latestData = localStorage.getItem('kys-cost-management-data');
        realData = latestData ? JSON.parse(latestData) : [];
        console.log('🔄 Araç bazlı takip - localStorage verisi yenilendi:', realData.length, 'kayıt');
      } catch (error) {
        console.error('localStorage okuma hatası:', error);
        realData = globalFilteredData && globalFilteredData.length > 0 ? globalFilteredData : filteredData;
      }
      
      if (!realData || realData.length === 0) return [];
      
      // 📅 Tarih filtreleme ile verileri filtrele - globalFilters.selectedMonth kullan
      const filteredByDate = realData.filter(item => {
        if (!globalFilters.selectedMonth) return true; // Tarih filtresi yoksa tüm veriler
        
        const itemDate = item.tarih || item.createdDate || '';
        const itemMonth = itemDate.substring(0, 7); // YYYY-MM formatına çevir
        return itemMonth === globalFilters.selectedMonth;
      });
      
      console.log(`🔍 Tarih Filtreleme (Global Filters):`, {
        originalDataCount: realData.length,
        selectedMonth: globalFilters.selectedMonth,
        selectedYear: globalFilters.selectedYear,
        filteredDataCount: filteredByDate.length,
        sampleFilteredItems: filteredByDate.slice(0, 3).map(item => ({
          id: item.id,
          tarih: item.tarih,
          createdDate: item.createdDate,
          month: (item.tarih || item.createdDate || '').substring(0, 7),
          maliyet: item.maliyet
        }))
      });
      
      // Veri kaynağı öncelik sırası: globalFilteredData > filteredData > [] (zaman filtreli)
      
      const analysis: VehiclePerformanceAnalysis[] = [];
      
      // 🚗 YENİ: KATEGORİ BAZLI ANALİZ SİSTEMİ
      const vehicleCategories: VehicleCategory[] = [
        'Kompakt Araçlar',
        'Araç Üstü Vakumlu', 
        'Çekilir Tip Mekanik Süpürgeler',
        'Kompost Makinesi',
        'Rusya Motor Odası',
        'HSCK'
      ];

      vehicleCategories.forEach(category => {
        const categoryModels = VEHICLE_CATEGORIES[category];
        // 🚗 KATEGORİ BAZLI VERİ FİLTRELEME - Kategorideki tüm araçları dahil et
        const vehicleData = filteredByDate.filter(item => {
          // Tüm olası araç alanlarını kontrol et
          const aracField = item.arac || item.aracModeli || item.vehicle || item.vehicleModel || '';
          const birimField = item.birim || '';
          const aciklamaField = item.aciklama || item.description || '';
          const parcaKoduField = item.parcaKodu || '';
          
          // Kategorideki her model için kontrol et
          return categoryModels.some(model => {
            // Araç modeli eşleştirme için anahtar kelimeler
            const modelKeywords = {
              'FTH-240': ['fth', 'fth-240', 'fth240'],
              'Çelik-2000': ['çelik', 'celik', 'çelik-2000', 'celik-2000', 'çelik2000'],
              'Aga2100': ['aga2100', 'aga 2100', 'aga-2100'],
              'Aga3000': ['aga3000', 'aga 3000', 'aga-3000'],
              'Aga6000': ['aga6000', 'aga 6000', 'aga-6000'],
              'Kompost Makinesi': ['kompost', 'kompost makinesi', 'kompost_makinesi'],
              'Çay Toplama Makinesi': ['çay', 'çay toplama', 'çay_toplama', 'çay makinesi', 'çay_makinesi'],
              'KDM 35': ['kdm35', 'kdm 35', 'kdm-35'],
              'KDM 70': ['kdm70', 'kdm 70', 'kdm-70'],
              'KDM 80': ['kdm80', 'kdm 80', 'kdm-80'],
              'Rusya Motor Odası': ['rusya', 'motor odası', 'motor_odası', 'rusya motor'],
              'Ural': ['ural'],
              'HSCK': ['hsck', 'h.s.c.k', 'h s c k']
            };
            
            const keywords = modelKeywords[model] || [model.toLowerCase()];
            
            // SÜPER GELİŞMİŞ EŞLEŞTİRME MANTĞI - TÜM OLASI ALANLAR
            const allTextFields = [
              aracField, birimField, aciklamaField, parcaKoduField,
              item.maliyetTuru || '', item.atikTuru || '', item.category || '',
              item.unit || '', item.vehicle || '', item.vehicleModel || '',
              item.description || '', item.type || '', item.name || ''
            ].join(' ').toLowerCase();
            
            // Direkt eşleşme kontrolü
            const directMatch = item.aracModeli === model;
            
            // Anahtar kelime eşleşmesi
            const keywordMatch = keywords.some(keyword => 
              allTextFields.includes(keyword.toLowerCase())
            );
            
            // Kısmi eşleşme (model adının parçaları)
            const modelParts = model.toLowerCase().split(/[\s\-_]+/);
            const partialMatch = modelParts.length > 1 && modelParts.some(part => 
              part.length > 2 && allTextFields.includes(part)
            );
            
            return directMatch || keywordMatch || partialMatch;
          });
        });

        // 🚗 KATEGORİ BAZLI ANALİZ - Kategorideki tüm araçların verilerini topla
        const totalCost = vehicleData.reduce((sum, item) => sum + (Number(item.maliyet) || 0), 0);
        const totalQuantity = vehicleData.reduce((sum, item) => sum + (Number(item.miktar) || Number(item.adet) || 1), 0);
        const totalWeight = vehicleData.reduce((sum, item) => sum + (Number(item.agirlik) || 0), 0);

        // 📊 Detaylı Atık Türü Dağılımı - DÜZELTME: Hurda kayıt sayısı = Ret sayısı
        const retData = vehicleData.filter(item => 
          item.atikTuru === 'Ret' || 
          item.maliyetTuru?.toLowerCase().includes('ret') ||
          item.aciklama?.toLowerCase().includes('ret')
        );
        
        const hurdaData = vehicleData.filter(item => 
          item.atikTuru === 'Hurda' || 
          item.maliyetTuru?.toLowerCase().includes('hurda') ||
          item.aciklama?.toLowerCase().includes('hurda')
        );
        
        const fireData = vehicleData.filter(item => 
          item.atikTuru === 'Fire' || 
          item.maliyetTuru?.toLowerCase().includes('fire') ||
          item.aciklama?.toLowerCase().includes('fire')
        );

        // 🔧 DÜZELTME: Ret sayısı = Hurda kayıt sayısı olmalı
        // Her hurda kaydı 1 ret sayısına karşılık gelir
        const retAdet = hurdaData.length; // Hurda kayıt sayısı = Ret sayısı
        const retMaliyet = retData.reduce((sum, item) => sum + (Number(item.maliyet) || 0), 0);

        // Hurda: kg cinsinden - 0 kg ise maliyet gösterme
        const hurdaKg = hurdaData.reduce((sum, item) => sum + (Number(item.agirlik) || Number(item.miktar) || 0), 0);
        const hurdaMaliyet = hurdaKg > 0 ? hurdaData.reduce((sum, item) => sum + (Number(item.maliyet) || 0), 0) : 0;

        // Fire: kg cinsinden (adet değil) - 0 kg ise maliyet gösterme
        const fireKg = fireData.reduce((sum, item) => sum + (Number(item.agirlik) || Number(item.miktar) || 0), 0);
        const fireMaliyet = fireKg > 0 ? fireData.reduce((sum, item) => sum + (Number(item.maliyet) || 0), 0) : 0;

            // 🎯 Hedef Karşılaştırması - Basit kategori bazlı hedefler
        const categoryTarget = vehicleTargets.find(target => target.kategori === category);
        const monthlyTarget = categoryTarget?.hedefler.toplamMaksimumMaliyet || 50000;
        const currentMonthCost = totalCost;
        const targetDeviation = monthlyTarget > 0 ? ((currentMonthCost - monthlyTarget) / monthlyTarget) * 100 : 0;
        
        console.log(`📊 ${category} HEDEF KARŞILAŞTIRMA:`, {
          totalTargetsAvailable: vehicleTargets.length,
          categoryTargetFound: !!categoryTarget,
          categoryTargetDonem: categoryTarget?.donem,
          monthlyTarget,
          currentMonthCost,
          targetDeviation
        });

        analysis.push({
          kategori: category,
          displayName: category,
          categoryModels: categoryModels,
          toplam: {
            kayitSayisi: vehicleData.length,
            toplamMaliyet: totalCost,
            toplamMiktar: totalQuantity,
            toplamAgirlik: totalWeight
          },
          atikTuruDagilim: {
            ret: { 
              adet: retAdet,
              maliyet: retMaliyet
            },
            hurda: { 
              kg: hurdaKg,
              maliyet: hurdaMaliyet
            },
            fire: {
              kg: fireKg, // Fire için kg birimi
              maliyet: fireMaliyet
            }
          },
          trend: {
            sonUcAy: [], // Trend kaldırıldı
            yuzdelikDegisim: 0,
            trendYonu: 'stabil'
          },
          hedefKarsilastirma: {
            hedefMaliyet: monthlyTarget,
            gercekMaliyet: currentMonthCost,
            sapmaYuzdesi: targetDeviation,
            durum: targetDeviation <= 0 ? 'basarili' : targetDeviation <= 20 ? 'dikkat' : 'kritik',
            performansDurumu: targetDeviation <= 0 ? 'Hedef Altında' : targetDeviation <= 20 ? 'Hedef Aşımı' : 'Kritik Hedef Aşımı'
          }
        });
      });

      // 🔄 Basit sıralama - Maliyet en yüksek olan önce
      const sortedAnalysis = [...analysis].sort((a, b) => b.toplam.toplamMaliyet - a.toplam.toplamMaliyet);

      // 🐛 DEBUG: Kategori sıralama kontrolü
      console.log('🔢 Kategori Sıralama Debug:', {
        totalCategories: sortedAnalysis.length,
        categories: sortedAnalysis.map((item, index) => ({
          index: index + 1,
          displayName: item.displayName || item.kategori || item.aracModeli,
          toplam: item.toplam.toplamMaliyet,
          kayitSayisi: item.toplam.kayitSayisi
        })),
        rawAnalysis: analysis.length
      });

      return sortedAnalysis;
    }, [globalFilteredData, filteredData, vehicleTargets, dataRefreshTrigger, forceRefresh, globalFilters.selectedMonth]);

    // 📊 Özet İstatistikler
    const summaryStats = useMemo(() => {
      const totalCost = vehicleAnalysis.reduce((sum, item) => sum + item.toplam.toplamMaliyet, 0);
      const totalRecords = vehicleAnalysis.reduce((sum, item) => sum + item.toplam.kayitSayisi, 0);
      const improvingVehicles = vehicleAnalysis.filter(item => item.trend.trendYonu === 'dususte').length;
      const criticalVehicles = vehicleAnalysis.filter(item => 
        item.hedefKarsilastirma?.durum === 'kritik' || item.trend.trendYonu === 'yukselis'
      ).length;
      const avgCostPerVehicle = vehicleAnalysis.length > 0 ? totalCost / vehicleAnalysis.length : 0;
      
      return {
        totalCost,
        totalRecords,
        improvingVehicles,
        criticalVehicles,
        avgCostPerVehicle,
        totalVehicles: vehicleAnalysis.length
      };
    }, [vehicleAnalysis]);

    // 🚗 KATEGORİ BAZLI Araç Kartı Render Fonksiyonu
    const renderVehicleCard = (vehicle: VehiclePerformanceAnalysis, index: number) => {
      // 🚗 KATEGORİ BAZLI GÖRÜNTÜLEME: kategori ve displayName'i kullan
      const displayName = vehicle.displayName || vehicle.kategori || vehicle.aracModeli || 'Bilinmeyen Kategori';
      const cardKey = vehicle.kategori || vehicle.aracModeli || `category-${index}`;
      
      // 📈 ÜRETİM VERİLERİNİ ÇEK - Component hook'larını kullan
      const productionData = getProductionDataForVehicle(vehicle);
      const perVehicleCosts = calculatePerVehicleCosts(vehicle, productionData.uretilenAdet);
      
      // 🐛 DEBUG: Kart sıralama kontrolü
      console.log(`🃏 Kart ${index + 1} Debug:`, {
        index: index + 1,
        displayName,
        cardKey,
        maliyet: vehicle.toplam.toplamMaliyet,
        kayitSayisi: vehicle.toplam.kayitSayisi,
        kategori: vehicle.kategori,
        aracModeli: vehicle.aracModeli,
        productionData,
        perVehicleCosts
      });
      
      return (
        <Grid item xs={12} md={6} lg={4} key={cardKey}>
          <Card 
            sx={{ 
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid',
              borderColor: vehicle.hedefKarsilastirma?.durum === 'kritik' ? 'error.main' : 
                          vehicle.hedefKarsilastirma?.durum === 'dikkat' ? 'warning.main' : 'divider',
              borderLeft: '4px solid',
              borderLeftColor: vehicle.hedefKarsilastirma?.durum === 'kritik' ? 'error.main' : 
                              vehicle.hedefKarsilastirma?.durum === 'dikkat' ? 'warning.main' : 'success.main',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
                borderColor: 'primary.main'
              }
            }}
            onClick={() => {
              // Araç detay modalını aç
              console.log('🔍 Araç kartı tıklandı:', vehicle.kategori || vehicle.aracModeli, vehicle.categoryModels);
              setVehicleDetailModal({ open: true, vehicle });
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* 🚗 KATEGORİ Başlık ve Durum - Profesyonel Layout */}
              <Box sx={{ mb: 3 }}>
                {/* Üst Bölüm: Başlık ve Sıra Numarası */}
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box sx={{ flex: 1, pr: 2 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight={700} 
                      color="primary.main" 
                      sx={{ 
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        letterSpacing: '0.02em'
                      }}
                    >
                      {displayName}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`#${index + 1}`} 
                    size="medium"
                    variant="filled"
                    color={index === 0 ? 'error' : index < 3 ? 'warning' : 'primary'}
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      height: '32px',
                      minWidth: '48px'
                    }}
                  />
                </Box>
                
                {/* Alt Bölüm: Kategori Modelleri ve Durum */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Alt modelleri göster */}
                  {vehicle.categoryModels && vehicle.categoryModels.length > 0 && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        lineHeight: 1.2,
                        bgcolor: 'grey.50',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}
                    >
                      <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        İçerir:
                      </Box> {vehicle.categoryModels.join(', ')}
                    </Typography>
                  )}
                  
                  {/* Durum Chip'i */}
                  <Box>
                    <Chip
                      label={
                        vehicle.hedefKarsilastirma?.durum === 'kritik' ? 'Kritik Durum' :
                        vehicle.hedefKarsilastirma?.durum === 'dikkat' ? 'Dikkat Gerekli' : 'Normal Performans'
                      }
                      size="small"
                      variant="outlined"
                      color={
                        vehicle.hedefKarsilastirma?.durum === 'kritik' ? 'error' :
                        vehicle.hedefKarsilastirma?.durum === 'dikkat' ? 'warning' : 'success'
                      }
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: '24px'
                      }}
                    />
                  </Box>
                </Box>
              </Box>

            {/* Üretim ve Maliyet Metrikler */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    {productionData.uretilenAdet}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Üretilen
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {productionData.planlanmisAdet}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Planlanan
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
                  <Typography variant="h6" fontWeight={700} color="error.main">
                    ₺{(vehicle.toplam.toplamMaliyet / 1000).toFixed(0)}K
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Maliyet
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                  <Typography variant="h6" fontWeight={700} color="warning.main">
                    {productionData.gerceklesmeOrani.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gerçekleşme Oranı
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Atık Türü Dağılımı ve Araç Başına Değerler */}
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Atık Türü Dağılımı ve Araç Başına Değerler
            </Typography>
            <Box sx={{ mb: 3 }}>
              {/* Ret */}
              <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'error.50', borderRadius: 1, border: '1px solid', borderColor: 'error.200' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', borderRadius: '50%', mr: 1.5 }} />
                    <Typography variant="body2" fontWeight={600} color="error.main">
                      Ret: {vehicle.atikTuruDagilim.ret.adet} adet
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} color="error.main">
                    ₺{vehicle.atikTuruDagilim.ret.maliyet.toLocaleString()}
                  </Typography>
                </Box>
                {productionData.uretilenAdet > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                    Araç başına: {perVehicleCosts.retPerVehicle.toFixed(2)} adet/araç
                  </Typography>
                )}
              </Box>

              {/* Hurda */}
              <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'warning.50', borderRadius: 1, border: '1px solid', borderColor: 'warning.200' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: 'warning.main', borderRadius: '50%', mr: 1.5 }} />
                    <Typography variant="body2" fontWeight={600} color="warning.main">
                      Hurda: {vehicle.atikTuruDagilim.hurda.kg.toFixed(1)} kg
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} color="warning.main">
                    {vehicle.atikTuruDagilim.hurda.kg > 0 ? `₺${vehicle.atikTuruDagilim.hurda.maliyet.toLocaleString()}` : '-'}
                  </Typography>
                </Box>
                {productionData.uretilenAdet > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                    Araç başına: {perVehicleCosts.hurdaPerVehicle.toFixed(2)} kg/araç
                  </Typography>
                )}
              </Box>

              {/* Fire */}
              <Box sx={{ mb: 1.5, p: 1.5, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: 'info.main', borderRadius: '50%', mr: 1.5 }} />
                    <Typography variant="body2" fontWeight={600} color="info.main">
                      Fire: {vehicle.atikTuruDagilim.fire.kg.toFixed(1)} kg
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} color="info.main">
                    {vehicle.atikTuruDagilim.fire.maliyet > 0 ? `₺${vehicle.atikTuruDagilim.fire.maliyet.toLocaleString()}` : '-'}
                  </Typography>
                </Box>
                {productionData.uretilenAdet > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                    Araç başına: {perVehicleCosts.firePerVehicle.toFixed(2)} kg/araç
                  </Typography>
                )}
              </Box>

              {/* Toplam Araç Başına Maliyet */}
              {productionData.uretilenAdet > 0 && (
                <Box sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: 1, border: '2px solid', borderColor: 'grey.300' }}>
                  <Typography variant="body2" fontWeight={700} color="text.primary" textAlign="center">
                    Araç Başına Toplam Maliyet: ₺{perVehicleCosts.totalPerVehicle.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                </Box>
              )}
            </Box>



            {/* Detaylı Hedef Karşılaştırması */}
            {(() => {
              // 🚗 KATEGORİ BAZLI hedef eşleştirme sistemi - SADELEŞTİRİLDİ
              let categoryTarget = null;
              
              // 1. Kategori bazlı hedef arama
              if (vehicle.kategori) {
                categoryTarget = vehicleTargets.find(target => target.kategori === vehicle.kategori);
              }
              
              // 2. Geriye uyumluluk için aracModeli kontrolü
              if (!categoryTarget && vehicle.aracModeli) {
                categoryTarget = vehicleTargets.find(target => target.aracModeli === vehicle.aracModeli);
              }
              
              // Debug bilgisi ekle
              console.log('🎯 Kategori Bazlı Hedef Eşleştirme Debug:', {
                kategori: vehicle.kategori,
                displayName: displayName,
                totalTargetsCount: vehicleTargets.length,
                availableTargets: vehicleTargets.map(t => ({ kategori: t.kategori, aracModeli: t.aracModeli, donem: t.donem })),
                foundTarget: categoryTarget?.kategori || categoryTarget?.aracModeli || 'Bulunamadı',
                foundTargetDonem: categoryTarget?.donem
              });
              
              if (!categoryTarget) {
                return (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px dashed', borderColor: 'grey.300' }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      Hedef Performansı
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
                      Bu kategori ({displayName}) için henüz hedef belirlenmemiş.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Akıllı Hedef Yönetimi sekmesine geç
                        window.dispatchEvent(new CustomEvent('switchToTargetManagement', { detail: { kategori: vehicle.kategori } }));
                      }}
                      sx={{ mb: 1 }}
                    >
                      Hedef Belirle
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Mevcut hedefler: {vehicleTargets.map(t => `${t.kategori || t.aracModeli} (${t.donem})`).join(', ') || 'Hiç hedef yok'}
                    </Typography>
                  </Box>
                );
              }

              // ⚡ ARAÇ BAŞINA PERFORMANS HESAPLAMA - Hedefler araç başına olduğu için üretim sayısıyla çarpılır
              const calculatePerVehiclePerformance = (actualTotal: number, perVehicleTarget: number, productionCount: number) => {
                if (perVehicleTarget <= 0 || productionCount <= 0) return 100; // Hedef veya üretim sıfırsa tam performans
                if (actualTotal === 0) return 100; // Gerçekleşen sıfırsa mükemmel performans
                
                // Araç başına hedefi toplam hedefe çevir
                const totalTarget = perVehicleTarget * productionCount;
                
                // Hedef altında kalma oranı = ne kadar iyi olduğu
                // Örnek: Araç başı Fire hedefi 0.25 kg/araç, 4 araç üretim → Toplam hedef: 1.0 kg
                // Gerçekleşen: 0.5 kg → (1.0-0.5)/1.0 * 100 = %50 performans
                const performanceRatio = Math.max(0, (totalTarget - actualTotal) / totalTarget * 100);
                return Math.round(performanceRatio);
              };

              // Üretim verilerini al
              const productionData = getProductionDataForVehicle(vehicle);
              const productionCount = productionData.uretilenAdet || 1; // Sıfıra bölmeyi önle
              
              console.log('🎯 ARAÇ BAŞINA PERFORMANS HESAPLAMA:', {
                vehicleKategori: vehicle.kategori,
                productionCount: productionCount,
                categoryTarget: categoryTarget.hedefler,
                actualValues: {
                  retAdet: vehicle.atikTuruDagilim.ret.adet,
                  hurdaKg: vehicle.atikTuruDagilim.hurda.kg,
                  fireKg: vehicle.atikTuruDagilim.fire.kg
                },
                calculatedTotalTargets: {
                  retTotal: categoryTarget.hedefler.maksRetAdet * productionCount,
                  hurdaTotal: categoryTarget.hedefler.maksHurdaKg * productionCount,
                  fireTotal: categoryTarget.hedefler.maksFireKg * productionCount
                }
              });

              const retPerformans = calculatePerVehiclePerformance(vehicle.atikTuruDagilim.ret.adet, categoryTarget.hedefler.maksRetAdet, productionCount);
              const hurdaPerformans = calculatePerVehiclePerformance(vehicle.atikTuruDagilim.hurda.kg, categoryTarget.hedefler.maksHurdaKg, productionCount);
              const firePerformans = calculatePerVehiclePerformance(vehicle.atikTuruDagilim.fire.kg, categoryTarget.hedefler.maksFireKg, productionCount);

              return (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                    Hedef Performansı ({categoryTarget.donem})
                  </Typography>
                  
                  {/* Ret Hedef Karşılaştırması */}
                  <Card sx={{ 
                    mb: 2, 
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: 'error.main' 
                          }} />
                          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                            Ret Performansı
                          </Typography>
                        </Box>
                        <Chip
                          label={`${retPerformans}%`}
                          color={retPerformans >= 80 ? 'success' : retPerformans >= 60 ? 'warning' : 'error'}
                          variant="filled"
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            minWidth: 60
                          }}
                        />
                      </Box>
                      
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                              Hedef
                            </Typography>
                            <Typography variant="h6" fontWeight={600} color="text.primary">
                              {categoryTarget.hedefler.maksRetAdet.toFixed(2)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              adet/araç
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                              Gerçek
                            </Typography>
                            <Typography variant="h6" fontWeight={600} color="text.primary">
                              {(vehicle.atikTuruDagilim.ret.adet / productionCount).toFixed(2)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              adet/araç
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ position: 'relative' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={retPerformans}
                          sx={{ 
                            height: 12, 
                            borderRadius: 6,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 6,
                              background: retPerformans >= 80 
                                ? 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)'
                                : retPerformans >= 60 
                                  ? 'linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)'
                                  : 'linear-gradient(90deg, #f44336 0%, #ef5350 100%)'
                            }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Hurda Hedef Karşılaştırması */}
                  <Card sx={{ 
                    mb: 2, 
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: 'warning.main' 
                          }} />
                          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                            Hurda Performansı
                          </Typography>
                        </Box>
                        <Chip
                          label={`${hurdaPerformans}%`}
                          color={hurdaPerformans >= 80 ? 'success' : hurdaPerformans >= 60 ? 'warning' : 'error'}
                          variant="filled"
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            minWidth: 60
                          }}
                        />
                      </Box>
                      
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                              Hedef
                            </Typography>
                            <Typography variant="h6" fontWeight={600} color="text.primary">
                              {categoryTarget.hedefler.maksHurdaKg.toFixed(2)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              kg/araç
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                              Gerçek
                            </Typography>
                            <Typography variant="h6" fontWeight={600} color="text.primary">
                              {(vehicle.atikTuruDagilim.hurda.kg / productionCount).toFixed(2)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              kg/araç
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ position: 'relative' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={hurdaPerformans}
                          sx={{ 
                            height: 12, 
                            borderRadius: 6,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 6,
                              background: hurdaPerformans >= 80 
                                ? 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)'
                                : hurdaPerformans >= 60 
                                  ? 'linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)'
                                  : 'linear-gradient(90deg, #f44336 0%, #ef5350 100%)'
                            }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Fire Hedef Karşılaştırması */}
                  <Card sx={{ 
                    mb: 2, 
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: 'info.main' 
                          }} />
                          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                            Fire Performansı
                          </Typography>
                        </Box>
                        <Chip
                          label={`${firePerformans}%`}
                          color={firePerformans >= 80 ? 'success' : firePerformans >= 60 ? 'warning' : 'error'}
                          variant="filled"
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            minWidth: 60
                          }}
                        />
                      </Box>
                      
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                              Hedef
                            </Typography>
                            <Typography variant="h6" fontWeight={600} color="text.primary">
                              {categoryTarget.hedefler.maksFireKg.toFixed(2)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              kg/araç
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                              Gerçek
                            </Typography>
                            <Typography variant="h6" fontWeight={600} color="text.primary">
                              {(vehicle.atikTuruDagilim.fire.kg / productionCount).toFixed(2)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              kg/araç
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ position: 'relative' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={firePerformans}
                          sx={{ 
                            height: 12, 
                            borderRadius: 6,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 6,
                              background: firePerformans >= 80 
                                ? 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)'
                                : firePerformans >= 60 
                                  ? 'linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)'
                                  : 'linear-gradient(90deg, #f44336 0%, #ef5350 100%)'
                            }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>


                </Box>
              );
            })()}
          </CardContent>
        </Card>
      </Grid>
    );
  };

    return (
      <Box sx={{ p: 3 }}>
        {/* KPI Dashboard */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                {/* Başlık alanları kaldırıldı */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {/* Son güncelleme chip'i kaldırıldı */}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => {/* Navigate to vehicle list */}}
              >
                <VehicleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" fontWeight="600" color="primary.main">
                  {summaryStats.totalVehicles}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aktif Araç Modeli
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => {/* Navigate to cost analysis */}}
              >
                <MoneyIcon sx={{ fontSize: 40, color: 'error.main', mb: 2 }} />
                <Typography variant="h4" fontWeight="600" color="error.main">
                  ₺{(summaryStats.totalCost / 1000).toFixed(0)}K
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Toplam Kalitesizlik Maliyeti
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => {/* Navigate to improving vehicles */}}
              >
                <TrendingDownIcon sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" fontWeight="600" color="success.main">
                  {summaryStats.improvingVehicles}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  İyileşen Araç Modeli
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => {/* Navigate to critical vehicles */}}
              >
                <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
                <Typography variant="h4" fontWeight="600" color="warning.main">
                  {summaryStats.criticalVehicles}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dikkat Gerektiren Araç
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>





        {/* Ana İçerik Alanı */}
        {viewMode === 'cards' && (
          <>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Araç Performans Sıralaması
              <Chip 
                label={`${vehicleAnalysis.length} araç`} 
                size="small" 
                sx={{ ml: 2 }}
                color="primary"
              />
              <Chip 
                label={`${globalFilters.selectedMonth || 'Tüm aylar'} dönemi`} 
                size="small" 
                sx={{ ml: 1 }}
                color="secondary"
                variant="outlined"
              />
            </Typography>
            
            <Grid container spacing={3}>
              {vehicleAnalysis.map((vehicle, index) => renderVehicleCard(vehicle, index))}
            </Grid>

            {vehicleAnalysis.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Veri Bulunamadı
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Seçilen filtrelere uygun araç verisi bulunmuyor. Filtre ayarlarını değiştirmeyi deneyin.
                </Typography>
              </Paper>
            )}
          </>
        )}

        {viewMode === 'table' && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Detaylı Araç Performans Tablosu
            </Typography>
            {/* Tablo implementasyonu buraya gelecek */}
            <Typography variant="body2" color="text.secondary">
              Tablo görünümü yakında eklenecek...
            </Typography>
          </Paper>
        )}

        {viewMode === 'charts' && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Araç Performans Grafikleri
            </Typography>
            {/* Grafik implementasyonu buraya gelecek */}
            <Typography variant="body2" color="text.secondary">
              Grafik görünümü yakında eklenecek...
            </Typography>
          </Paper>
        )}

        {/* 📊 Araç Detay Modal */}
        <Dialog
          open={vehicleDetailModal.open}
          onClose={() => setVehicleDetailModal({ open: false, vehicle: null })}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              minHeight: '80vh'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DirectionsCarIcon sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {vehicleDetailModal.vehicle?.displayName || vehicleDetailModal.vehicle?.kategori || 'Araç Detayları'}
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Detaylı Performans Analizi ve Trend Görünümü
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={() => setVehicleDetailModal({ open: false, vehicle: null })}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0, maxHeight: '80vh', overflow: 'auto' }}>
            {vehicleDetailModal.vehicle && (
              <VehicleDetailAnalysisContent vehicle={vehicleDetailModal.vehicle} />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    );
  };

  const AnalyticsDashboard: React.FC<{ realTimeData?: any, filteredData?: any[] }> = ({ realTimeData, filteredData }) => (
    <Box>
      <Grid container spacing={4}>
        {/* ✅ Context7: COPQ Trend Analysis - Full Width for Better Readability */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '600px' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }} display="flex" alignItems="center" gap={1}>
              <TimelineIcon color="primary" />
              COPQ Trend Analizi - Aylık Maliyet Takibi
            </Typography>
            {/* ✅ DEBUG: COPQ Trend Verisi Debug */}
            {(() => {
              const chartData = realTimeData?.trendData?.length > 0 ? realTimeData.trendData : trendData;
              console.log('🔍 COPQ CHART DEBUG:', {
                realTimeDataExists: !!realTimeData,
                realTimeDataTrendLength: realTimeData?.trendData?.length || 0,
                staticTrendDataLength: trendData.length,
                finalChartData: chartData,
                chartDataLength: chartData?.length || 0,
                firstDataPoint: chartData?.[0],
                dataKeys: chartData?.[0] ? Object.keys(chartData[0]) : []
              });
              return null;
            })()}
            <ResponsiveContainer width="100%" height="88%">
              <AreaChart data={realTimeData?.trendData?.length > 0 ? realTimeData.trendData : trendData} margin={{ top: 20, right: 40, left: 60, bottom: 80 }}>
                <defs>
                  <linearGradient id="colorInternal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff9800" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorExternal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f44336" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f44336" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorAppraisal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2196f3" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPrevention" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="month" 
                  fontSize={11}
                  fontWeight="bold"
                />
                <YAxis 
                  tickFormatter={(value) => `₺${(value/1000).toFixed(0)}K`}
                  fontSize={11}
                />
                <ChartTooltip 
                  formatter={(value, name) => [`₺${value.toLocaleString()}`, name]}
                  labelStyle={{ fontWeight: 'bold' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    fontSize: '13px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="internal" 
                  stackId="1"
                  stroke="#ff9800" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInternal)"
                  name="İç Hata (Hurda, Yeniden İşlem, Fire)"
                />
                <Area 
                  type="monotone" 
                  dataKey="external" 
                  stackId="1"
                  stroke="#f44336" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExternal)"
                  name="Dış Hata (Garanti, İade, Şikayet)"
                />
                <Area 
                  type="monotone" 
                  dataKey="appraisal" 
                  stackId="1"
                  stroke="#2196f3" 
                  strokeWidth={2}
                  fill="url(#colorAppraisal)"
                  fillOpacity={1}
                  name="Değerlendirme (Denetim, Test)"
                />
                <Area 
                  type="monotone" 
                  dataKey="prevention" 
                  stackId="1"
                  stroke="#4caf50" 
                  strokeWidth={2}
                  fill="url(#colorPrevention)"
                  fillOpacity={1}
                  name="Önleme (Eğitim, Genel Önleme)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* ✅ Context7: COPQ Analysis - Optimized Layout without Legend */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '550px' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }} display="flex" alignItems="center" gap={1}>
              <PieChartIcon color="primary" />
              COPQ Dağılım Analizi - Maliyet Türü Bazında Detaylı Görünüm
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart margin={{ top: 20, right: 50, bottom: 20, left: 50 }}>
                <Pie
                  data={realTimeData?.copqBreakdown || copqCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={160}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value, percent }) => 
                    `${name}\n₺${value.toLocaleString()}\n${(percent * 100).toFixed(1)}%`
                  }
                  labelLine={true}
                  fontSize={12}
                  fontWeight="bold"
                >
                  {(realTimeData?.copqBreakdown || copqCategoryData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <ChartTooltip 
                  formatter={(value, name, props) => [
                    `₺${value.toLocaleString()}`, 
                    `${props.payload.name} Maliyeti`
                  ]}
                  labelFormatter={(label, payload) => 
                    payload && payload[0] ? `${payload[0].payload.name} Detayları` : label
                  }
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* ✅ Context7: Pareto Analysis - Enhanced Height for Better Visibility */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '600px' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }} display="flex" alignItems="center" gap={1}>
              <BarChartIcon color="primary" />
              Pareto Analizi - 80/20 Kuralı ile Gerçek Maliyet Verileri (Detaylı Görünüm)
            </Typography>
            <ResponsiveContainer width="100%" height="88%">
              <ComposedChart data={realTimeData?.paretoAnalysis || paretoData} margin={{ top: 20, right: 60, left: 60, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="category" 
                  angle={-35} 
                  textAnchor="end" 
                  height={100}
                  fontSize={11}
                  fontWeight="bold"
                  interval={0}
                  tick={{ fill: '#333' }}
                />
                <YAxis 
                  yAxisId="left" 
                  tickFormatter={(value) => `₺${(value/1000).toFixed(0)}K`}
                  fontSize={11}
                  label={{ value: 'Maliyet (₺)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                  tick={{ fill: '#2196f3' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                  fontSize={11}
                  label={{ value: 'Kümülatif %', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
                  tick={{ fill: '#f44336' }}
                />
                <ChartTooltip 
                  formatter={(value, name) => {
                    const numValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
                    if (name === 'Maliyet (₺)') return [`₺${numValue.toLocaleString()}`, name];
                    if (name === 'Kümülatif %') return [`${numValue.toFixed(1)}%`, name];
                    return [value, name];
                  }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold'
                  }}
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="cost" 
                  fill="#2196f3" 
                  name="Maliyet (₺)"
                  stroke="#1976d2"
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#f44336" 
                  strokeWidth={3}
                  name="Kümülatif %"
                  dot={{ fill: '#f44336', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: '#f44336' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* ✅ Context7: Detailed Analytics Charts - Moved from Data Management */}
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, mt: 2 }} display="flex" alignItems="center" gap={1}>
            <AnalyticsIcon color="primary" />
            Detaylı Maliyet Analizleri
          </Typography>
        </Grid>

        {/* ✅ Context7: Birim Bazında Maliyet - Full Width Layout */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <BarChartIcon color="secondary" fontSize="small" />
              Birim Bazında Maliyet
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart 
                data={realTimeData?.byBirim || [
                  { birim: 'Kaynakhane', toplam: 125000 },
                  { birim: 'Boyahane', toplam: 98000 },
                  { birim: 'Test', toplam: 87000 },
                  { birim: 'Üretim', toplam: 156000 },
                  { birim: 'Montaj', toplam: 89000 },
                  { birim: 'Kalite Kontrol', toplam: 67000 },
                  { birim: 'Ambar', toplam: 45000 },
                  { birim: 'Bakım', toplam: 78000 }
                ]}
                margin={{ top: 20, right: 40, left: 60, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="birim" 
                  angle={-25} 
                  textAnchor="end" 
                  height={70}
                  fontSize={12}
                  fontWeight="bold"
                  interval={0}
                />
                <YAxis 
                  tickFormatter={(value) => `₺${(value/1000).toFixed(0)}K`}
                  fontSize={11}
                />
                <ChartTooltip 
                  formatter={(value, name, props) => {
                    const formattedValue = value ? `₺${value.toLocaleString()}` : '₺0';
                    return [formattedValue, 'Birim Maliyet'];
                  }}
                  labelFormatter={(label) => label || 'Birim'}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="toplam" 
                  fill="#8884d8" 
                  radius={[4, 4, 0, 0]}
                  stroke="#6366f1"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* ✅ Context7: Araç Bazında Maliyet - Full Width Layout */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <BarChartIcon color="secondary" fontSize="small" />
              Araç Bazında Maliyet
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart 
                data={realTimeData?.byArac || [
                  { arac: 'AGA2100', toplam: 145000 },
                  { arac: 'AGA3000', toplam: 178000 },
                  { arac: 'Freze Makine', toplam: 98000 },
                  { arac: 'CNC Torna', toplam: 134000 },
                  { arac: 'Kaynak Makinesi', toplam: 112000 },
                  { arac: 'Pres Makinesi', toplam: 87000 },
                  { arac: 'Plazma Kesim', toplam: 96000 },
                  { arac: 'Boya Kabini', toplam: 73000 }
                ]}
                margin={{ top: 20, right: 40, left: 60, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="arac" 
                  angle={-25} 
                  textAnchor="end" 
                  height={70}
                  fontSize={12}
                  fontWeight="bold"
                  interval={0}
                />
                <YAxis 
                  tickFormatter={(value) => `₺${(value/1000).toFixed(0)}K`}
                  fontSize={11}
                />
                <ChartTooltip 
                  formatter={(value, name, props) => {
                    const formattedValue = value ? `₺${value.toLocaleString()}` : '₺0';
                    return [formattedValue, 'Araç Maliyet'];
                  }}
                  labelFormatter={(label) => label || 'Araç'}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="toplam" 
                  fill="#82ca9d" 
                  radius={[4, 4, 0, 0]}
                  stroke="#4caf50"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* ✅ Context7: Top 10 Part Code Analysis - Optimized Layout */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '650px' }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 2 }} display="flex" alignItems="center" justifyContent="center" gap={1}>
              <BarChartIcon color="secondary" />
              Parça Kodu Bazında Maliyet Analizi (Top 10 En Problemli Parçalar)
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={realTimeData?.byParcaKodu || [
                  { parcaKodu: '500123845', aciklama: 'Ana Şase Kaynağı', toplam: 145000, problemSayisi: 12, rank: 1 },
                  { parcaKodu: '500156789', aciklama: 'Motor Braketi', toplam: 98000, problemSayisi: 8, rank: 2 },
                  { parcaKodu: '500134567', aciklama: 'Diferansiyel Muhafaza', toplam: 87000, problemSayisi: 6, rank: 3 },
                  { parcaKodu: '500145678', aciklama: 'Fren Diski', toplam: 76000, problemSayisi: 5, rank: 4 },
                  { parcaKodu: '500167890', aciklama: 'Transmisyon Kasası', toplam: 65000, problemSayisi: 4, rank: 5 },
                  { parcaKodu: '500178901', aciklama: 'Hidrolik Silindir', toplam: 54000, problemSayisi: 3, rank: 6 },
                  { parcaKodu: '500189012', aciklama: 'Amortisör Braketi', toplam: 48000, problemSayisi: 3, rank: 7 },
                  { parcaKodu: '500190123', aciklama: 'Direksiyon Kutusu', toplam: 41000, problemSayisi: 2, rank: 8 },
                  { parcaKodu: '500201234', aciklama: 'Yakıt Deposu', toplam: 38000, problemSayisi: 2, rank: 9 },
                  { parcaKodu: '500212345', aciklama: 'Egzoz Manifoldu', toplam: 33000, problemSayisi: 2, rank: 10 }
                ]}
                margin={{
                  top: 20,
                  right: 50,
                  left: 80,
                  bottom: 120,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="parcaKodu" 
                  angle={-30}
                  textAnchor="end"
                  height={110}
                  interval={0}
                  tick={{ fontSize: 10, fontWeight: 600, fontFamily: 'monospace' }}
                  stroke="#666"
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  stroke="#666"
                  tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`}
                  label={{ value: 'Maliyet (₺)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                />
                <ChartTooltip 
                  formatter={(value, name, props) => {
                    const rank = props?.payload?.rank;
                    const rankText = rank ? `#${rank} Sırada` : 'Problemli Parça';
                    return [
                      `₺${value.toLocaleString()}`, 
                      `Toplam Maliyet (${rankText})`
                    ];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0] && payload[0].payload) {
                      const data = payload[0].payload;
                      return `${data.parcaKodu || label} - ${data.aciklama || 'N/A'}\n${data.problemSayisi || 0} Adet Problem`;
                    }
                    return label;
                  }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ccc',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                    maxWidth: '300px'
                  }}
                />
                <Bar 
                  dataKey="toplam" 
                  radius={[6, 6, 0, 0]}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {(realTimeData?.byParcaKodu || [
                    { parcaKodu: '500123845', aciklama: 'Ana Şase Kaynağı', toplam: 145000, problemSayisi: 12, rank: 1 },
                    { parcaKodu: '500156789', aciklama: 'Motor Braketi', toplam: 98000, problemSayisi: 8, rank: 2 },
                    { parcaKodu: '500134567', aciklama: 'Diferansiyel Muhafaza', toplam: 87000, problemSayisi: 6, rank: 3 },
                    { parcaKodu: '500145678', aciklama: 'Fren Diski', toplam: 76000, problemSayisi: 5, rank: 4 },
                    { parcaKodu: '500167890', aciklama: 'Transmisyon Kasası', toplam: 65000, problemSayisi: 4, rank: 5 },
                    { parcaKodu: '500178901', aciklama: 'Hidrolik Silindir', toplam: 54000, problemSayisi: 3, rank: 6 },
                    { parcaKodu: '500189012', aciklama: 'Amortisör Braketi', toplam: 48000, problemSayisi: 3, rank: 7 },
                    { parcaKodu: '500190123', aciklama: 'Direksiyon Kutusu', toplam: 41000, problemSayisi: 2, rank: 8 },
                    { parcaKodu: '500201234', aciklama: 'Yakıt Deposu', toplam: 38000, problemSayisi: 2, rank: 9 },
                    { parcaKodu: '500212345', aciklama: 'Egzoz Manifoldu', toplam: 33000, problemSayisi: 2, rank: 10 }
                  ]).map((entry, index) => {
                    // Top 3 için özel renkler, diğerleri gradient
                    let fillColor;
                    if (index === 0) fillColor = '#f44336'; // En problemli - Kırmızı
                    else if (index === 1) fillColor = '#ff9800'; // İkinci - Turuncu  
                    else if (index === 2) fillColor = '#ffeb3b'; // Üçüncü - Sarı
                    else fillColor = `hsl(${200 + index * 15}, 70%, ${Math.max(40, 60 - index * 2)}%)`; // Gradient mavi tonları
                    
                    return <Cell key={`cell-${index}`} fill={fillColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // ✅ Context7 Loading State
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AutoGraphIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            COPQ Verileri Yükleniyor...
      </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Kalitesizlik maliyeti analizleri hazırlanıyor
        </Typography>
          <LinearProgress sx={{ maxWidth: 300, mx: 'auto' }} />
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>


      {/* Professional Global Filter Section */}
      <StyledAccordion expanded={isFilterExpanded} onChange={(e, expanded) => setIsFilterExpanded(expanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterListIcon />
            <Typography variant="h6" fontWeight="600">
              Filtreleme ve Arama
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={4} lg={2.2}>
              <FormControl fullWidth size="small">
                <InputLabel>Maliyet Türü</InputLabel>
                <Select
                  value={globalFilters.maliyetTuru}
                  onChange={(e) => setGlobalFilters({...globalFilters, maliyetTuru: e.target.value})}
                  label="Maliyet Türü"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="hurda">Hurda Maliyeti</MenuItem>
                  <MenuItem value="yeniden_islem">Yeniden İşlem Maliyeti</MenuItem>
                  <MenuItem value="fire">Fire Maliyeti</MenuItem>
                  <MenuItem value="garanti">Garanti Maliyeti</MenuItem>
                  <MenuItem value="iade">İade Maliyeti</MenuItem>
                  <MenuItem value="sikayet">Şikayet Maliyeti</MenuItem>
                  <MenuItem value="denetim">Denetim Maliyeti</MenuItem>
                  <MenuItem value="test">Test Maliyeti</MenuItem>
                  <MenuItem value="egitim">Eğitim Maliyeti</MenuItem>
                  <MenuItem value="onleme">Önleme Maliyeti</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4} lg={2.2}>
              <FormControl fullWidth size="small">
                <InputLabel>Birim</InputLabel>
                <Select
                  value={globalFilters.birim}
                  onChange={(e) => setGlobalFilters({...globalFilters, birim: e.target.value})}
                  label="Birim"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="arge">Ar-Ge</MenuItem>
                  <MenuItem value="boyahane">Boyahane</MenuItem>
                  <MenuItem value="bukum">Büküm</MenuItem>
                  <MenuItem value="depo">Depo</MenuItem>
                  <MenuItem value="elektrikhane">Elektrikhane</MenuItem>
                  <MenuItem value="kalite_kontrol">Kalite Kontrol</MenuItem>
                  <MenuItem value="kaynakhane">Kaynakhane</MenuItem>
                  <MenuItem value="kesim">Kesim</MenuItem>
                  <MenuItem value="mekanik_montaj">Mekanik Montaj</MenuItem>
                  <MenuItem value="satin_alma">Satın Alma</MenuItem>
                  <MenuItem value="satis">Satış</MenuItem>
                  <MenuItem value="satis_sonrasi_hizmetleri">Satış Sonrası Hizmetleri</MenuItem>
                  <MenuItem value="uretim_planlama">Üretim Planlama</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4} lg={1.8}>
              <FormControl fullWidth size="small">
                <InputLabel>Yıl</InputLabel>
                <Select
                  value={globalFilters.selectedYear}
                  onChange={(e) => setGlobalFilters({...globalFilters, selectedYear: e.target.value, selectedMonth: ''})}
                  label="Yıl"
                >
                  {[2023, 2024, 2025, 2026].map(year => (
                    <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4} lg={1.8}>
              <FormControl fullWidth size="small">
                <InputLabel>Ay</InputLabel>
                <Select
                  value={globalFilters.selectedMonth}
                  onChange={(e) => {
                    setGlobalFilters({...globalFilters, selectedMonth: e.target.value});
                    console.log('📅 Ay filtresi değişti - araç kartları güncellenecek:', e.target.value);
                  }}
                  label="Ay"
                  disabled={!globalFilters.selectedYear}
                >
                  <MenuItem value="">Tüm Aylar</MenuItem>
                  {[
                    { value: `${globalFilters.selectedYear}-01`, label: 'Ocak' },
                    { value: `${globalFilters.selectedYear}-02`, label: 'Şubat' },
                    { value: `${globalFilters.selectedYear}-03`, label: 'Mart' },
                    { value: `${globalFilters.selectedYear}-04`, label: 'Nisan' },
                    { value: `${globalFilters.selectedYear}-05`, label: 'Mayıs' },
                    { value: `${globalFilters.selectedYear}-06`, label: 'Haziran' },
                    { value: `${globalFilters.selectedYear}-07`, label: 'Temmuz' },
                    { value: `${globalFilters.selectedYear}-08`, label: 'Ağustos' },
                    { value: `${globalFilters.selectedYear}-09`, label: 'Eylül' },
                    { value: `${globalFilters.selectedYear}-10`, label: 'Ekim' },
                    { value: `${globalFilters.selectedYear}-11`, label: 'Kasım' },
                    { value: `${globalFilters.selectedYear}-12`, label: 'Aralık' }
                  ].map(month => (
                    <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <TextField
                fullWidth
                size="small"
                label="Gelişmiş Arama"
                value={globalFilters.searchTerm}
                onChange={(e) => setGlobalFilters({...globalFilters, searchTerm: e.target.value})}
                placeholder="Parça kodu, açıklama..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Filtre Temizleme Butonu */}
            <Grid item xs={12} sm={6} md={4} lg={1.6}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => setGlobalFilters({
                  maliyetTuru: '',
                  birim: '',
                  arac: '',
                  searchTerm: '',
                  selectedMonth: '',
                  selectedYear: new Date().getFullYear().toString()
                })}
                sx={{ height: 40, minWidth: 'auto' }}
              >
                Temizle
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </StyledAccordion>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
        >
          <Tab 
            icon={<DashboardIcon />} 
            label="Executive Dashboard" 
            iconPosition="start"
          />
          <Tab 
            icon={<TableChartIcon />} 
            label="Veri Yönetimi" 
            iconPosition="start"
          />
          <Tab 
            icon={<VehicleIcon />} 
            label="Araç Bazlı Takip" 
            iconPosition="start"
          />
          <Tab 
            icon={<MoneyIcon />} 
            label="Kalitesizlik Maliyetleri" 
            iconPosition="start"
          />
          <Tab 
            icon={<TargetIcon />} 
                            label="Hedef Yönetimi" 
            iconPosition="start"
          />
          <Tab 
            icon={<TuneIcon />} 
            label="Birim Maliyet Ayarları" 
            iconPosition="start"
          />
          <Tab 
            icon={<ScienceIcon />} 
                          label="Malzeme Maliyet Ayarları" 
            iconPosition="start"
          />
          <Tab 
            icon={<FactoryIcon />} 
            label="Aylık Üretim Sayıları" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {currentTab === 0 && <ExecutiveDashboard 
          realTimeData={realTimeAnalytics} 
          filteredData={globalFilteredData}
          onTotalCOPQClick={interactiveFunctions.handleTotalCOPQClick}
          onMonthlyTrendClick={interactiveFunctions.handleMonthlyTrendClick}
          onHighestCostClick={interactiveFunctions.handleHighestCostClick}
          onThisMonthClick={interactiveFunctions.handleThisMonthClick}
          onMostProblematicUnitClick={interactiveFunctions.handleMostProblematicUnitClick}
          onPartAnalysisClick={interactiveFunctions.handlePartAnalysisClick}
          onUnitAnalysisClick={interactiveFunctions.handleUnitAnalysisClick}
          onCostTypeAnalysisClick={interactiveFunctions.handleCostTypeAnalysisClick}
          onVehicleAnalysisClick={interactiveFunctions.handleVehicleAnalysisClick}
        />}
        {currentTab === 1 && <DataManagementComponent 
          onDataChange={setRealTimeAnalytics} 
          filteredData={globalFilteredData} 
          onDataRefresh={() => {
            setDataRefreshTrigger(prev => prev + 1);
            triggerDataRefresh();
          }}
          // ✅ YENİ: Global state setter'ları geç
          setGlobalDetailDialogOpen={setGlobalDetailDialogOpen}
          setGlobalSelectedDetailEntry={setGlobalSelectedDetailEntry}
        />}
        {currentTab === 2 && <VehicleTrackingDashboard 
          realTimeData={realTimeAnalytics} 
          filteredData={globalFilteredData}
          vehicleTargets={vehicleTargets}
          onAddTarget={() => setCurrentTab(4)} // Akıllı Hedef Yönetimi sekmesine yönlendir
          onEditTarget={(target) => {
            // Hedef düzenleme modalını aç
            console.log('Hedef düzenle:', target);
          }}
          onVehiclePerformanceClick={handleVehiclePerformanceClick}
        />}
        {currentTab === 3 && <AnalyticsDashboard realTimeData={realTimeAnalytics} filteredData={globalFilteredData} />}
        {currentTab === 4 &&             <SmartTargetManagementComponent 
              realTimeData={realTimeAnalytics}
              filteredData={globalFilteredData}
              onDataRefresh={() => {
                setDataRefreshTrigger(prev => prev + 1);
                // Hedefler güncellendiğinde araç bazlı takip modülünü de güncelle
                const updatedTargets = loadVehicleTargetsFromStorage();
                setVehicleTargets(updatedTargets);
              }}
            />}
        {currentTab === 5 && <CostSettingsComponent />}
        {currentTab === 6 && <MaterialPricingManagementComponent />}
                    {currentTab === 7 && <CategoryProductionManagementComponent onTabChange={setCurrentTab} />}
        </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
        }}
        onClick={() => {
          if (currentTab === 1) {
            // Veri yönetimi sekmesindeyse yeni kayıt ekle
            const event = new CustomEvent('addNewCostEntry');
            window.dispatchEvent(event);
          } else if (currentTab === 5) {
            // Birim maliyet ayarları sekmesindeyse yeni ayar ekle
            const event = new CustomEvent('addNewCostSetting');
            window.dispatchEvent(event);
          } else if (currentTab === 6) {
            // Malzeme maliyet ayarları sekmesindeyse yeni malzeme ekle
            const event = new CustomEvent('addNewMaterial');
            window.dispatchEvent(event);
          } else if (currentTab === 7) {
            // Aylık üretim sayıları sekmesindeyse yeni üretim kaydı ekle
            const event = new CustomEvent('addNewProductionRecord');
            window.dispatchEvent(event);
          } else {
            // Diğer sekmelerde veri yönetimi sekmesine git
            setCurrentTab(1);
          }
        }}
      >
        <AddIcon />
      </Fab>

      {/* ✅ Professional Analysis Modal Dialog */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            minHeight: '600px',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          p: 3
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            {modalData?.icon}
            <Box flex={1}>
              <Typography variant="h5" fontWeight="bold">
                {modalData?.title}
              </Typography>
            </Box>
            <IconButton 
              onClick={closeModal}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {modalData && (
                    <ProfessionalDataTable 
          data={modalData.data} 
          type={modalData.type}
          openDOFForm={modalData.openDOFForm || openDOFForm}
          isDOFCreated={modalData.isDOFCreated || isDOFCreated}
          handleViewDetails={(entry: any) => {
            console.log('🔍 Modal içinden detay görüntüleme başlatılıyor:', entry);
            
            // Veri yönetimi kısmındaki gibi normalizasyon yap
            const normalizedEntry = {
              // Temel bilgiler
              id: entry.id || `temp_${Date.now()}`,
              maliyetTuru: entry.maliyetTuru || 'hurda',
              maliyet: entry.maliyet || entry.total || 0,
              tarih: entry.tarih || entry.createdDate || new Date().toISOString(),
              durum: entry.durum || (entry.isActive ? 'aktif' : 'pasif') || 'aktif',
              
              // Birim/Departman bilgileri
              birim: entry.birim || entry.departman || entry.unit || 'kalite_kontrol',
              
              // Araç bilgileri
              arac: entry.arac || entry.aracModeli || entry.vehicle || null,
              aracModeli: entry.aracModeli || entry.arac || entry.vehicle || null,
              
              // Parça/Ürün bilgileri
              parcaKodu: entry.parcaKodu || entry.partCode || entry.urunKodu || null,
              malzemeTuru: entry.malzemeTuru || entry.materialType || null,
              
              // Maliyet detayları
              agirlik: entry.agirlik || entry.weight || 0,
              miktar: entry.miktar || entry.quantity || entry.count || 0,
              unit: entry.unit || entry.birim || 'adet',
              birimMaliyet: entry.birimMaliyet || entry.unitCost || 0,
              kgMaliyet: entry.kgMaliyet || entry.kgCost || 0,
              parcaMaliyeti: entry.parcaMaliyeti || entry.partCost || 0,
              
              // Açıklama ve ek bilgiler
              aciklama: entry.aciklama || entry.description || entry.issueDescription || null,
              
              // Zaman damgaları
              olusturmaTarihi: entry.olusturmaTarihi || entry.createdDate || entry.tarih || new Date().toISOString(),
              guncellemeTarihi: entry.guncellemeTarihi || entry.updatedDate || entry.updatedAt || null,
              
              // Özel analiz verileri (birim analizi, üretim kaydı vs.)
              birimAnalizi: entry.birimAnalizi || null,
              uretimDetaylari: entry.uretimDetaylari || null,
              
              // Ham veriyi de koru (debug için)
              _rawData: entry
            };
            
            console.log('✅ Modal veri normalizasyonu tamamlandı:', normalizedEntry);
            
            // Global state'leri kullan
            setGlobalSelectedDetailEntry(normalizedEntry);
            setGlobalDetailDialogOpen(true);
          }}
        />
          )}
        </DialogContent>
      </Dialog>

      {/* Araç Detay Analizi Dialog'u */}
      <Dialog
        open={vehicleDetailDialogOpen}
        onClose={() => setVehicleDetailDialogOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            minHeight: '80vh',
            maxHeight: '95vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          p: 3
        }}>
          <Box display="flex" alignItems="center" gap={2}>
            <DirectionsCarIcon sx={{ fontSize: 32 }} />
            <Box flex={1}>
              <Typography variant="h5" fontWeight="bold">
                {selectedVehicleData?.aracModeli} - Detaylı Performans Analizi
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Araç bazlı kalitesizlik maliyeti analizi ve trend değerlendirmesi
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setVehicleDetailDialogOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {selectedVehicleData && (
            <Box sx={{ height: '100%' }}>
              {/* Tab Navigation */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                <Tabs 
                  value={vehicleDetailTab} 
                  onChange={(e, newValue) => setVehicleDetailTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ px: 3 }}
                >
                  <Tab label="Genel Performans" icon={<AssessmentIcon />} />
                  <Tab label="Trend Analizi" icon={<TimelineIcon />} />
                  <Tab label="Maliyet Dağılımı" icon={<PieChartIcon />} />
                  <Tab label="Departman Analizi" icon={<BusinessIcon />} />
                  <Tab label="Hedef Karşılaştırma" icon={<TargetIcon />} />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ p: 3, height: 'calc(100% - 64px)', overflow: 'auto' }}>
                {vehicleDetailTab === 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                      Genel Performans Özeti
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {/* KPI Kartları */}
                      <Grid item xs={12} md={3}>
                        <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
                          <Typography variant="h4" fontWeight="bold" color="error.main">
                            ₺{(selectedVehicleData.toplam.toplamMaliyet / 1000).toFixed(0)}K
                          </Typography>
                          <Typography variant="body2" color="text.secondary">Toplam Maliyet</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                          <Typography variant="h4" fontWeight="bold" color="info.main">
                            {selectedVehicleData.toplam.kayitSayisi}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">Toplam Kayıt</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                          <Typography variant="h4" fontWeight="bold" color="warning.main">
                            {selectedVehicleData.toplam.toplamMiktar}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">Toplam Miktar</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                          <Typography variant="h4" fontWeight="bold" color="success.main">
                            {selectedVehicleData.toplam.toplamAgirlik.toFixed(1)}kg
                          </Typography>
                          <Typography variant="body2" color="text.secondary">Toplam Ağırlık</Typography>
                        </Card>
                      </Grid>

                      {/* Atık Türü Dağılımı */}
                      <Grid item xs={12}>
                        <Card sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                            Atık Türü Dağılımı
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                              <Box sx={{ p: 2, bgcolor: 'error.50', borderRadius: 2, border: '1px solid', borderColor: 'error.200' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', borderRadius: '50%', mr: 1 }} />
                                  <Typography variant="subtitle1" fontWeight="bold">Ret</Typography>
                                </Box>
                                <Typography variant="h5" color="error.main" fontWeight="bold">
                                  {selectedVehicleData.atikTuruDagilim?.ret?.adet || 0} adet
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  ₺{(selectedVehicleData.atikTuruDagilim?.ret?.maliyet || 0).toLocaleString('tr-TR')}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 2, border: '1px solid', borderColor: 'warning.200' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Box sx={{ width: 12, height: 12, bgcolor: 'warning.main', borderRadius: '50%', mr: 1 }} />
                                  <Typography variant="subtitle1" fontWeight="bold">Hurda</Typography>
                                </Box>
                                <Typography variant="h5" color="warning.main" fontWeight="bold">
                                  {(selectedVehicleData.atikTuruDagilim?.hurda?.kg || 0).toFixed(1)} kg
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  ₺{(selectedVehicleData.atikTuruDagilim?.hurda?.maliyet || 0).toLocaleString('tr-TR')}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 2, border: '1px solid', borderColor: 'info.200' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Box sx={{ width: 12, height: 12, bgcolor: 'info.main', borderRadius: '50%', mr: 1 }} />
                                  <Typography variant="subtitle1" fontWeight="bold">Fire</Typography>
                                </Box>
                                <Typography variant="h5" color="info.main" fontWeight="bold">
                                  {(selectedVehicleData.atikTuruDagilim?.fire?.kg || 0).toFixed(1)} kg
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  ₺{(selectedVehicleData.atikTuruDagilim?.fire?.maliyet || 0).toLocaleString('tr-TR')}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {vehicleDetailTab === 1 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                      12 Aylık Maliyet Trend Analizi
                    </Typography>
                    
                    {/* Ana Trend Grafiği */}
                    <Card sx={{ p: 3, mb: 3 }}>
                      <Box sx={{ height: 400, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={(() => {
                              const monthLabels = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
                              const currentDate = new Date();
                              const trendData = selectedVehicleData.trend?.sonUcAy || [];
                              
                              return trendData.map((cost, index) => {
                                // Son 12 ayı geriye doğru hesapla
                                const monthIndex = (currentDate.getMonth() - (11 - index) + 12) % 12;
                                return {
                                  month: `Ay ${index + 1}`,
                                  cost: cost || 0,
                                  label: monthLabels[monthIndex]
                                };
                              });
                            })()}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis tickFormatter={(value) => `₺${(value/1000).toFixed(0)}K`} />
                            <ChartTooltip 
                              formatter={(value) => [`₺${Number(value).toLocaleString('tr-TR')}`, 'Maliyet']}
                              labelFormatter={(label) => `Ay: ${label}`}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="cost" 
                              stroke="#1976d2" 
                              strokeWidth={3}
                              dot={{ fill: '#1976d2', strokeWidth: 2, r: 5 }}
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </Card>

                    {/* Trend İstatistikleri */}
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Card sx={{ p: 3, textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            %{selectedVehicleData.trend?.yuzdelikDegisim || 12.5}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">Yıllık Değişim</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card sx={{ p: 3, textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight="bold" color="warning.main">
                            {formatTrendDirection(selectedVehicleData.trend?.trendYonu || 'stabil')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">Trend Yönü</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card sx={{ p: 3, textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight="bold" color="success.main">
                            ₺{((selectedVehicleData.toplam?.toplamMaliyet || 100000) / 12 / 1000).toFixed(0)}K
                          </Typography>
                          <Typography variant="body2" color="text.secondary">Aylık Ortalama</Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {vehicleDetailTab === 2 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                      Maliyet Dağılımı Analizi
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {/* Pasta Grafik */}
                      <Grid item xs={12} md={6}>
                        <Card sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ mb: 2 }}>Atık Türü Bazlı Dağılım</Typography>
                          <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={(() => {
                                    const retValue = selectedVehicleData.atikTuruDagilim?.ret?.maliyet || 0;
                                    const hurdaValue = selectedVehicleData.atikTuruDagilim?.hurda?.maliyet || 0;
                                    const fireValue = selectedVehicleData.atikTuruDagilim?.fire?.maliyet || 0;
                                    
                                    const data = [];
                                    if (retValue > 0) data.push({ name: 'Ret', value: retValue, fill: '#f44336' });
                                    if (hurdaValue > 0) data.push({ name: 'Hurda', value: hurdaValue, fill: '#ff9800' });
                                    if (fireValue > 0) data.push({ name: 'Fire', value: fireValue, fill: '#2196f3' });
                                    
                                    // Eğer hiç veri yoksa placeholder göster
                                    if (data.length === 0) {
                                      data.push({ name: 'Veri Yok', value: 1, fill: '#e0e0e0' });
                                    }
                                    
                                    return data;
                                  })()}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent, value }) => 
                                    value > 0 && name !== 'Veri Yok' ? 
                                    `${name} ${(percent * 100).toFixed(0)}%` : 
                                    name === 'Veri Yok' ? 'Veri Bulunamadı' : ''
                                  }
                                  outerRadius={100}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                                                 </Pie>
                                 <ChartTooltip 
                                   formatter={(value, name) => [`₺${Number(value).toLocaleString('tr-TR')}`, name]}
                                 />
                               </PieChart>
                            </ResponsiveContainer>
                          </Box>
                        </Card>
                      </Grid>

                      {/* Detaylı Dökümler */}
                      <Grid item xs={12} md={6}>
                        <Card sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ mb: 2 }}>Maliyet Detayları</Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ p: 2, bgcolor: 'error.50', borderRadius: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold" color="error.main">
                                Ret Maliyeti
                              </Typography>
                              <Typography variant="h5" fontWeight="bold">
                                ₺{(selectedVehicleData.atikTuruDagilim?.ret?.maliyet || 0).toLocaleString('tr-TR')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {selectedVehicleData.atikTuruDagilim?.ret?.adet || 0} adet
                              </Typography>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold" color="warning.main">
                                Hurda Maliyeti
                              </Typography>
                              <Typography variant="h5" fontWeight="bold">
                                ₺{(selectedVehicleData.atikTuruDagilim?.hurda?.maliyet || 0).toLocaleString('tr-TR')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {(selectedVehicleData.atikTuruDagilim?.hurda?.kg || 0).toFixed(1)} kg
                              </Typography>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold" color="info.main">
                                Fire Maliyeti
                              </Typography>
                              <Typography variant="h5" fontWeight="bold">
                                ₺{(selectedVehicleData.atikTuruDagilim?.fire?.maliyet || 0).toLocaleString('tr-TR')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {(selectedVehicleData.atikTuruDagilim?.fire?.kg || 0).toFixed(1)} kg
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {vehicleDetailTab === 3 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                      Departman Bazlı Maliyet Analizi
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {/* Bar Chart */}
                      <Grid item xs={12}>
                        <Card sx={{ p: 3, mb: 3 }}>
                          <Typography variant="h6" sx={{ mb: 2 }}>Departman Performansı</Typography>
                          <Box sx={{ height: 400, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={(() => {
                                  // Gerçek verileri globalFilteredData'dan al ve departman bazında grupla
                                  const realData = globalFilteredData || [];
                                  const vehicleModel = selectedVehicleData?.aracModeli;
                                  
                                  // Bu araç için veriler
                                  const vehicleData = realData.filter(item => {
                                    const aracField = item.arac || item.aracModeli || '';
                                    return aracField.toLowerCase().includes(vehicleModel?.toLowerCase() || '');
                                  });
                                  
                                  // Departman bazında topla
                                  const departmentData = vehicleData.reduce((acc: any, item: any) => {
                                    const department = item.birim || item.departman || 'Diğer';
                                    if (!acc[department]) {
                                      acc[department] = { maliyet: 0, miktar: 0 };
                                    }
                                    acc[department].maliyet += item.maliyet || 0;
                                    acc[department].miktar += item.miktar || 1;
                                    return acc;
                                  }, {});
                                  
                                  // Array formatına çevir ve sırala
                                  const result = Object.entries(departmentData)
                                    .map(([name, data]: [string, any]) => ({
                                      name: name.slice(0, 15), // Uzun isimleri kısalt
                                      maliyet: data.maliyet,
                                      miktar: data.miktar
                                    }))
                                    .sort((a, b) => b.maliyet - a.maliyet)
                                    .slice(0, 8); // En yüksek 8 departman
                                  
                                  // Eğer veri yoksa placeholder göster
                                  if (result.length === 0) {
                                    return [
                                      { name: 'Veri Yok', maliyet: 0, miktar: 0 }
                                    ];
                                  }
                                  
                                  return result;
                                })()}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `₺${(value/1000).toFixed(0)}K`} />
                                <ChartTooltip 
                                  formatter={(value) => [`₺${Number(value).toLocaleString('tr-TR')}`, 'Maliyet']}
                                />
                                <Bar dataKey="maliyet" fill="#1976d2" />
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
                        </Card>
                      </Grid>

                      {/* Departman Kartları - Gerçek Verilerle */}
                      {(() => {
                        // Gerçek verileri globalFilteredData'dan al
                        const realData = globalFilteredData || [];
                        const vehicleModel = selectedVehicleData?.aracModeli;
                        
                        // Bu araç için veriler
                        const vehicleData = realData.filter(item => {
                          const aracField = item.arac || item.aracModeli || '';
                          return aracField.toLowerCase().includes(vehicleModel?.toLowerCase() || '');
                        });
                        
                        // Departman bazında topla
                        const departmentData = vehicleData.reduce((acc: any, item: any) => {
                          const department = item.birim || item.departman || 'Diğer';
                          if (!acc[department]) {
                            acc[department] = { maliyet: 0, miktar: 0, kayitSayisi: 0 };
                          }
                          acc[department].maliyet += item.maliyet || 0;
                          acc[department].miktar += item.miktar || 1;
                          acc[department].kayitSayisi += 1;
                          return acc;
                        }, {});
                        
                        // Array formatına çevir ve sırala
                        const departmentArray = Object.entries(departmentData)
                          .map(([name, data]: [string, any]) => ({
                            name: formatProfessionalDepartmentName(name),
                            maliyet: data.maliyet,
                            miktar: data.miktar,
                            kayitSayisi: data.kayitSayisi
                          }))
                          .sort((a, b) => b.maliyet - a.maliyet)
                          .slice(0, 6); // En yüksek 6 departman
                        
                        // Eğer veri yoksa placeholder göster
                        if (departmentArray.length === 0) {
                          return (
                            <Grid item xs={12}>
                              <Card sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body1" color="text.secondary">
                                  Bu araç için departman bazlı veri bulunamadı.
                                </Typography>
                              </Card>
                            </Grid>
                          );
                        }
                        
                        return departmentArray.map((dept, index) => (
                          <Grid item xs={12} md={6} lg={4} key={dept.name}>
                            <Card sx={{ p: 3 }}>
                              <Typography variant="h6" fontWeight="bold" color="primary">
                                {dept.name}
                              </Typography>
                              <Typography variant="h5" fontWeight="bold" sx={{ my: 1 }}>
                                ₺{dept.maliyet.toLocaleString('tr-TR')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Toplam Maliyet
                              </Typography>
                              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                <Box sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1, flex: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Miktar: {dept.miktar} adet
                                  </Typography>
                                </Box>
                                <Box sx={{ p: 1, bgcolor: 'primary.50', borderRadius: 1, flex: 1 }}>
                                  <Typography variant="caption" color="primary.main">
                                    Kayıt: {dept.kayitSayisi}
                                  </Typography>
                                </Box>
                              </Box>
                            </Card>
                          </Grid>
                        ));
                      })()}
                    </Grid>
                  </Box>
                )}

                {vehicleDetailTab === 4 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                      Hedef vs Gerçekleşme Karşılaştırması
                    </Typography>
                    
                    {selectedVehicleData.hedefKarsilastirma ? (
                      <Grid container spacing={3}>
                        {/* Özet Kartlar */}
                        <Grid item xs={12} md={4}>
                          <Card sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              Hedef Maliyet
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" color="success.main">
                              ₺{selectedVehicleData.hedefKarsilastirma.hedefMaliyet.toLocaleString('tr-TR')}
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Card sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              Gerçek Maliyet
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" color="warning.main">
                              ₺{selectedVehicleData.hedefKarsilastirma.gercekMaliyet.toLocaleString('tr-TR')}
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Card sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              Performans
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" 
                              color={selectedVehicleData.hedefKarsilastirma.sapmaYuzdesi > 0 ? "success.main" : "error.main"}
                            >
                              {selectedVehicleData.hedefKarsilastirma.sapmaYuzdesi > 0 ? '+' : ''}%{selectedVehicleData.hedefKarsilastirma.sapmaYuzdesi.toFixed(1)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {selectedVehicleData.hedefKarsilastirma.performansDurumu}
                            </Typography>
                          </Card>
                        </Grid>

                        {/* Durum Analizi */}
                        <Grid item xs={12}>
                          <Card sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Performans Durumu</Typography>
                            <Box sx={{ 
                              p: 3, 
                              bgcolor: selectedVehicleData.hedefKarsilastirma.durum === 'basarili' ? 'success.50' : 
                                      selectedVehicleData.hedefKarsilastirma.durum === 'dikkat' ? 'warning.50' : 'error.50',
                              borderRadius: 2,
                              textAlign: 'center'
                            }}>
                              <Typography variant="h5" fontWeight="bold" 
                                color={selectedVehicleData.hedefKarsilastirma.durum === 'basarili' ? 'success.main' : 
                                      selectedVehicleData.hedefKarsilastirma.durum === 'dikkat' ? 'warning.main' : 'error.main'}
                              >
                                {selectedVehicleData.hedefKarsilastirma.durum === 'basarili' ? 'HEDEF TUTTURULUYOR' :
                                 selectedVehicleData.hedefKarsilastirma.durum === 'dikkat' ? 'DİKKAT GEREKİYOR' : 'KRİTİK DURUM'}
                              </Typography>
                              <Typography variant="body1" sx={{ mt: 1 }}>
                                {selectedVehicleData.hedefKarsilastirma.durum === 'basarili' ? 
                                  'Maliyet hedefleri başarıyla karşılanıyor.' :
                                  selectedVehicleData.hedefKarsilastirma.durum === 'dikkat' ? 
                                  'Hedeflerde küçük sapmalar var, dikkat edilmeli.' :
                                  'Maliyet hedefleri aşılıyor, acil aksiyonlar gerekli.'}
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      </Grid>
                    ) : (
                      <Card sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                          Bu araç için henüz hedef tanımlanmamış.
                        </Typography>
                        <Button variant="contained" sx={{ mt: 2 }}>
                          Hedef Tanımla
                        </Button>
                      </Card>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* ✅ GLOBAL DETAIL DIALOG - Modal için */}
      <Dialog
        open={globalDetailDialogOpen}
        onClose={() => setGlobalDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <VisibilityIcon color="info" />
            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold">
                {globalSelectedDetailEntry?.birimAnalizi ? 'Birim Analizi Detayları' :
                 globalSelectedDetailEntry?.uretimDetaylari ? 'Üretim Kaydı Detayları' :
                 'Maliyet Kaydı Detayları'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {globalSelectedDetailEntry?.parcaKodu && `Parça: ${globalSelectedDetailEntry.parcaKodu} • `}
                {globalSelectedDetailEntry?.birim && `Birim: ${globalSelectedDetailEntry.birim} • `}
                ID: {globalSelectedDetailEntry?.id}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {globalSelectedDetailEntry && (
            <Grid container spacing={3}>
              {/* Temel Bilgiler */}
              <Grid item xs={12}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Temel Bilgiler
                    </Typography>
                                         <Grid container spacing={2}>
                       <Grid item xs={12} md={6}>
                         <Box sx={{ mb: 2 }}>
                           <Typography variant="subtitle2" color="text.secondary">
                             Maliyet Türü
                           </Typography>
                           <Chip
                             label={(() => {
                               const typeMap: { [key: string]: string } = {
                                 'hurda': 'Hurda Maliyeti',
                                 'yeniden_islem': 'Yeniden İşlem',
                                 'fire': 'Fire Maliyeti',
                                 'garanti': 'Garanti Maliyeti',
                                 'iade': 'İade Maliyeti',
                                 'sikayet': 'Şikayet Maliyeti',
                                 'onleme': 'Önleme Maliyeti'
                               };
                               return typeMap[globalSelectedDetailEntry.maliyetTuru] || globalSelectedDetailEntry.maliyetTuru || 'Bilinmiyor';
                             })()}
                             color={(() => {
                               const colorMap: { [key: string]: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" } = {
                                 'hurda': 'warning',
                                 'yeniden_islem': 'error',
                                 'fire': 'warning',
                                 'garanti': 'error',
                                 'iade': 'error',
                                 'sikayet': 'error',
                                 'onleme': 'success'
                               };
                               return colorMap[globalSelectedDetailEntry.maliyetTuru] || 'primary';
                             })()}
                             size="medium"
                             sx={{ mt: 0.5 }}
                           />
                         </Box>
                       </Grid>
                       <Grid item xs={12} md={6}>
                         <Box sx={{ mb: 2 }}>
                           <Typography variant="subtitle2" color="text.secondary">
                             Toplam Maliyet
                           </Typography>
                           <Typography variant="h5" color="error.main" fontWeight={600}>
                             ₺{(globalSelectedDetailEntry.maliyet || 0).toLocaleString('tr-TR')}
                           </Typography>
                         </Box>
                       </Grid>
                       <Grid item xs={12} md={6}>
                         <Box sx={{ mb: 2 }}>
                           <Typography variant="subtitle2" color="text.secondary">
                             Birim/Departman
                           </Typography>
                           <Typography variant="body1" fontWeight={500}>
                             {(() => {
                               const birimMap: { [key: string]: string } = {
                                 'arge': 'Ar-Ge',
                                 'boyahane': 'Boyahane',
                                 'bukum': 'Büküm',
                                 'depo': 'Depo',
                                 'elektrikhane': 'Elektrikhane',
                                 'kalite_kontrol': 'Kalite Kontrol',
                                 'kaynakhane': 'Kaynakhane',
                                 'kesim': 'Kesim',
                                 'mekanik_montaj': 'Mekanik Montaj',
                                 'satin_alma': 'Satın Alma',
                                 'satis': 'Satış',
                                 'uretim_planlama': 'Üretim Planlama'
                               };
                               return birimMap[globalSelectedDetailEntry.birim] || globalSelectedDetailEntry.birim || 'Bilinmiyor';
                             })()}
                           </Typography>
                         </Box>
                       </Grid>
                       <Grid item xs={12} md={6}>
                         <Box sx={{ mb: 2 }}>
                           <Typography variant="subtitle2" color="text.secondary">
                             Araç/Model
                           </Typography>
                           <Typography variant="body1" fontWeight={500}>
                             {(() => {
                               const aracMap: { [key: string]: string } = {
                                 'fth240': 'FTH-240',
                                 'celik2000': 'Çelik-2000',
                                 'aga2100': 'Aga2100',
                                 'aga3000': 'Aga3000',
                                 'aga6000': 'Aga6000',
                                 'kompost_makinesi': 'Kompost Makinesi',
                                 'cay_toplama_makinesi': 'Çay Toplama Makinesi',
                                 'kdm35': 'KDM 35',
                                 'kdm70': 'KDM 70',
                                 'kdm80': 'KDM 80',
                                 'rusya_motor_odasi': 'Rusya Motor Odası',
                                 'ural': 'Ural',
                                 'hsck': 'HSCK'
                               };
                               const arac = globalSelectedDetailEntry.aracModeli || globalSelectedDetailEntry.arac;
                               return aracMap[arac] || arac || 'Bilinmiyor';
                             })()}
                           </Typography>
                         </Box>
                       </Grid>
                     </Grid>
                  </CardContent>
                </Card>
                             </Grid>

               {/* Teknik Detaylar */}
               <Grid item xs={12}>
                 <Card sx={{ mb: 2 }}>
                   <CardContent>
                     <Typography variant="h6" color="primary" gutterBottom>
                       Teknik Detaylar
                     </Typography>
                     <Grid container spacing={2}>
                       {globalSelectedDetailEntry.parcaKodu && (
                         <Grid item xs={12} md={6}>
                           <Box sx={{ mb: 2 }}>
                             <Typography variant="subtitle2" color="text.secondary">
                               Parça Kodu
                             </Typography>
                             <Typography 
                               variant="body1" 
                               fontWeight={600}
                               sx={{ 
                                 fontFamily: 'monospace',
                                 color: 'primary.main',
                                 bgcolor: 'grey.100',
                                 p: 1,
                                 borderRadius: 1,
                                 display: 'inline-block'
                               }}
                             >
                               {globalSelectedDetailEntry.parcaKodu}
                             </Typography>
                           </Box>
                         </Grid>
                       )}
                       
                       {globalSelectedDetailEntry.malzemeTuru && (
                         <Grid item xs={12} md={6}>
                           <Box sx={{ mb: 2 }}>
                             <Typography variant="subtitle2" color="text.secondary">
                               Malzeme Türü
                             </Typography>
                             <Typography variant="body1" fontWeight={500}>
                               {globalSelectedDetailEntry.malzemeTuru}
                             </Typography>
                           </Box>
                         </Grid>
                       )}

                       {globalSelectedDetailEntry.agirlik > 0 && (
                         <Grid item xs={12} md={6}>
                           <Box sx={{ mb: 2 }}>
                             <Typography variant="subtitle2" color="text.secondary">
                               Ağırlık
                             </Typography>
                             <Typography variant="body1" fontWeight={500}>
                               {globalSelectedDetailEntry.agirlik} kg
                             </Typography>
                           </Box>
                         </Grid>
                       )}

                       {globalSelectedDetailEntry.miktar > 0 && (
                         <Grid item xs={12} md={6}>
                           <Box sx={{ mb: 2 }}>
                             <Typography variant="subtitle2" color="text.secondary">
                               Miktar
                             </Typography>
                             <Typography variant="body1" fontWeight={500}>
                               {globalSelectedDetailEntry.miktar} {globalSelectedDetailEntry.unit || 'adet'}
                             </Typography>
                           </Box>
                         </Grid>
                       )}

                       {globalSelectedDetailEntry.birimMaliyet > 0 && (
                         <Grid item xs={12} md={6}>
                           <Box sx={{ mb: 2 }}>
                             <Typography variant="subtitle2" color="text.secondary">
                               Birim Maliyet
                             </Typography>
                             <Typography variant="body1" fontWeight={500} color="warning.main">
                               ₺{globalSelectedDetailEntry.birimMaliyet.toLocaleString('tr-TR')}
                             </Typography>
                           </Box>
                         </Grid>
                       )}

                       {globalSelectedDetailEntry.kgMaliyet > 0 && (
                         <Grid item xs={12} md={6}>
                           <Box sx={{ mb: 2 }}>
                             <Typography variant="subtitle2" color="text.secondary">
                               Kg Maliyet
                             </Typography>
                             <Typography variant="body1" fontWeight={500} color="warning.main">
                               ₺{globalSelectedDetailEntry.kgMaliyet.toLocaleString('tr-TR')}/kg
                             </Typography>
                           </Box>
                         </Grid>
                       )}
                     </Grid>
                   </CardContent>
                 </Card>
               </Grid>

               {/* Zaman ve Durum Bilgileri */}
               <Grid item xs={12}>
                 <Card sx={{ mb: 2 }}>
                   <CardContent>
                     <Typography variant="h6" color="primary" gutterBottom>
                       Zaman ve Durum Bilgileri
                     </Typography>
                     <Grid container spacing={2}>
                       <Grid item xs={12} md={6}>
                         <Box sx={{ mb: 2 }}>
                           <Typography variant="subtitle2" color="text.secondary">
                             Kayıt Tarihi
                           </Typography>
                           <Typography variant="body1" fontWeight={500}>
                             {globalSelectedDetailEntry.tarih ? 
                               new Date(globalSelectedDetailEntry.tarih).toLocaleDateString('tr-TR') : 
                               'Bilinmiyor'}
                           </Typography>
                         </Box>
                       </Grid>
                       <Grid item xs={12} md={6}>
                         <Box sx={{ mb: 2 }}>
                           <Typography variant="subtitle2" color="text.secondary">
                             Durum
                           </Typography>
                           <Chip
                             label={globalSelectedDetailEntry.durum === 'aktif' ? 'Aktif' : 'Pasif'}
                             color={globalSelectedDetailEntry.durum === 'aktif' ? 'success' : 'default'}
                             size="small"
                           />
                         </Box>
                       </Grid>
                       {globalSelectedDetailEntry.olusturmaTarihi && (
                         <Grid item xs={12} md={6}>
                           <Box sx={{ mb: 2 }}>
                             <Typography variant="subtitle2" color="text.secondary">
                               Oluşturma Tarihi
                             </Typography>
                             <Typography variant="body2" color="text.secondary">
                               {new Date(globalSelectedDetailEntry.olusturmaTarihi).toLocaleString('tr-TR')}
                             </Typography>
                           </Box>
                         </Grid>
                       )}
                       {globalSelectedDetailEntry.guncellemeTarihi && (
                         <Grid item xs={12} md={6}>
                           <Box sx={{ mb: 2 }}>
                             <Typography variant="subtitle2" color="text.secondary">
                               Güncelleme Tarihi
                             </Typography>
                             <Typography variant="body2" color="text.secondary">
                               {new Date(globalSelectedDetailEntry.guncellemeTarihi).toLocaleString('tr-TR')}
                             </Typography>
                           </Box>
                         </Grid>
                       )}
                     </Grid>
                   </CardContent>
                 </Card>
               </Grid>
 
               {/* Birim Analizi Detayları */}
              {globalSelectedDetailEntry.birimAnalizi && (
                <Grid item xs={12}>
                  <Card sx={{ mb: 2, bgcolor: 'info.50' }}>
                    <CardContent>
                      <Typography variant="h6" color="info.main" gutterBottom>
                        Birim Analizi Detayları
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Birim Adı
                            </Typography>
                            <Typography variant="h6" color="info.main" fontWeight={600}>
                              {globalSelectedDetailEntry.birimAnalizi.birimAdi}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Kritiklik Seviyesi
                            </Typography>
                            <Chip
                              label={globalSelectedDetailEntry.birimAnalizi.kritiklikSeviyesi}
                              color={globalSelectedDetailEntry.birimAnalizi.kritiklikSeviyesi === 'YÜKSEK' ? 'error' : 
                                     globalSelectedDetailEntry.birimAnalizi.kritiklikSeviyesi === 'ORTA' ? 'warning' : 'success'}
                              size="medium"
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Toplam Maliyet
                            </Typography>
                            <Typography variant="h6" color="info.main" fontWeight={600}>
                              ₺{(globalSelectedDetailEntry.birimAnalizi.toplamMaliyet || 0).toLocaleString('tr-TR')}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Kayıt Sayısı
                            </Typography>
                            <Typography variant="h6" color="info.main" fontWeight={600}>
                              {globalSelectedDetailEntry.birimAnalizi.kayitSayisi || 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Ortalama Maliyet
                            </Typography>
                            <Typography variant="h6" color="info.main" fontWeight={600}>
                              ₺{(globalSelectedDetailEntry.birimAnalizi.ortalamaMaliyet || 0).toLocaleString('tr-TR')}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Üretim Detayları */}
              {globalSelectedDetailEntry.uretimDetaylari && (
                <Grid item xs={12}>
                  <Card sx={{ mb: 2, bgcolor: 'success.50' }}>
                    <CardContent>
                      <Typography variant="h6" color="success.main" gutterBottom>
                        Üretim Kaydı Detayları
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Dönem
                            </Typography>
                            <Typography variant="h6" color="success.main" fontWeight={600}>
                              {globalSelectedDetailEntry.uretimDetaylari.donem}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Üretilen Araç Sayısı
                            </Typography>
                            <Typography variant="h6" color="success.main" fontWeight={600}>
                              {globalSelectedDetailEntry.uretimDetaylari.uretilenAracSayisi || 0} adet
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Gerçekleşme Oranı
                            </Typography>
                            <Typography variant="h6" color="warning.main" fontWeight={600}>
                              %{globalSelectedDetailEntry.uretimDetaylari.gerceklesmeOrani || 0}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Açıklama */}
              {globalSelectedDetailEntry.aciklama && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Açıklama/Notlar
                      </Typography>
                      <Typography 
                        variant="body1"
                        sx={{ 
                          bgcolor: 'grey.50',
                          p: 2,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'grey.200'
                        }}
                      >
                        {globalSelectedDetailEntry.aciklama}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

                             {/* Ham Veri Debug (Development Only) */}
               {false && process.env.NODE_ENV === 'development' && globalSelectedDetailEntry._rawData && (
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: 'grey.100' }}>
                    <CardContent>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Debug - Ham Veri (Development Only)
                      </Typography>
                      <Typography 
                        variant="body2"
                        component="pre"
                        sx={{ 
                          bgcolor: 'grey.50',
                          p: 2,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'grey.200',
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: '200px'
                        }}
                      >
                        {JSON.stringify(globalSelectedDetailEntry._rawData, null, 2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
                 <DialogActions>
           <Button 
             startIcon={<EditIcon />}
             onClick={() => {
               setGlobalDetailDialogOpen(false);
               // Düzenleme açmak için gereken veriyi buraya ekleyebiliriz
               console.log('Düzenleme için kayıt:', globalSelectedDetailEntry);
               alert('Düzenleme özelliği yakında eklenecek!');
             }}
             variant="outlined"
           >
             Düzenle
           </Button>
           <Button onClick={() => setGlobalDetailDialogOpen(false)} variant="contained">
             Kapat
           </Button>
         </DialogActions>
      </Dialog>


    </Box>
  );
}

// ✅ Professional Data Table Component for Modal
const ProfessionalDataTable: React.FC<{
  data: any[];
  type: 'highest-cost' | 'monthly-records' | 'problematic-unit' | 'part-analysis' | 'unit-analysis';
  openDOFForm?: (recordData: any) => void;
  isDOFCreated?: (recordData: any) => boolean;
  handleViewDetails?: (entry: any) => void;
}> = ({ data, type, openDOFForm, isDOFCreated, handleViewDetails }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatProfessionalName = (name: string) => {
    if (!name) return 'Bilinmeyen';
    const specialNames: { [key: string]: string } = {
      'arge': 'Ar-Ge',
      'boyahane': 'Boyahane',
      'bukum': 'Büküm',
      'depo': 'Depo',
      'elektrikhane': 'Elektrikhane',
      'kalite_kontrol': 'Kalite Kontrol',
      'kaynakhane': 'Kaynakhane',
      'kesim': 'Kesim',
      'mekanik_montaj': 'Mekanik Montaj',
      'satin_alma': 'Satın Alma',
      'satis': 'Satış',
      'uretim_planlama': 'Üretim Planlama'
    };
    return specialNames[name.toLowerCase()] || name;
  };

  const getMaliyetTuruLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'hurda': 'Hurda Maliyeti',
      'yeniden_islem': 'Yeniden İşlem',
      'fire': 'Fire Maliyeti',
      'garanti': 'Garanti Maliyeti',
      'iade': 'İade Maliyeti',
      'sikayet': 'Şikayet Maliyeti',
      'onleme': 'Önleme Maliyeti'
    };
    return typeMap[type] || type;
  };



  const renderTableContent = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    if (type === 'problematic-unit') {
      return (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><Typography fontWeight="bold">Sıra</Typography></TableCell>
                <TableCell><Typography fontWeight="bold">Birim</Typography></TableCell>
                <TableCell align="right"><Typography fontWeight="bold">Toplam Maliyet</Typography></TableCell>
                <TableCell align="center"><Typography fontWeight="bold">Kayıt Sayısı</Typography></TableCell>
                <TableCell align="right"><Typography fontWeight="bold">Ortalama</Typography></TableCell>
                <TableCell align="center"><Typography fontWeight="bold">Kritiklik</Typography></TableCell>
                <TableCell align="center"><Typography fontWeight="bold">İşlemler</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow 
                  key={item.unit}
                  sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                >
                  <TableCell>
                    <Chip 
                      label={startIndex + index + 1}
                      size="small"
                      color={index < 3 ? 'error' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold">
                      {formatProfessionalName(item.unit)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" color="error.main" fontWeight="bold">
                      ₺{item.total.toLocaleString('tr-TR')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={item.count}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography>
                      ₺{item.average.toLocaleString('tr-TR')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={index < 3 ? 'YÜKSEK' : index < 7 ? 'ORTA' : 'DÜŞÜK'}
                      size="small"
                      color={index < 3 ? 'error' : index < 7 ? 'warning' : 'success'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {/* ✅ YENİ: Birim Analizi Detay Görüntüleme Butonu */}
                      <Tooltip title="Birim Detaylarını Görüntüle">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Birim bazlı detay görüntüleme için özel bir kayıt oluştur
                            const unitDetailRecord = {
                              id: `unit_${item.unit}_${Date.now()}`,
                              maliyetTuru: 'unit_analysis',
                              birim: item.unit,
                              maliyet: item.total,
                              tarih: new Date().toISOString(),
                              durum: 'aktif',
                              parcaKodu: `UNIT-${item.unit.toUpperCase()}`,
                              aciklama: `${formatProfessionalName(item.unit)} birimi analizi - ${item.count} kayıt, ortalama ₺${item.average.toLocaleString('tr-TR')}`,
                              // Ek birim analiz verileri
                              birimAnalizi: {
                                birimAdi: formatProfessionalName(item.unit),
                                toplamMaliyet: item.total,
                                kayitSayisi: item.count,
                                ortalamaMaliyet: item.average,
                                kritiklikSeviyesi: index < 3 ? 'YÜKSEK' : index < 7 ? 'ORTA' : 'DÜŞÜK'
                              }
                            };
                            console.log('🔍 Birim Detayı Görüntüleme:', unitDetailRecord);
                            
                            // Önce props kontrol et, sonra global window kontrol et
                            if (handleViewDetails) {
                              console.log('✅ Props handleViewDetails kullanılıyor');
                              try {
                                handleViewDetails(unitDetailRecord);
                              } catch (error) {
                                console.error('❌ Props handleViewDetails hatası:', error);
                                alert('Props handleViewDetails çağrısında hata oluştu: ' + error);
                              }
                            } else if ((window as any).handleViewDetails) {
                              console.log('✅ Global handleViewDetails kullanılıyor');
                              try {
                                (window as any).handleViewDetails(unitDetailRecord);
                              } catch (error) {
                                console.error('❌ Global handleViewDetails hatası:', error);
                                alert('Global handleViewDetails çağrısında hata oluştu: ' + error);
                              }
                            } else {
                              console.log('❌ Hiçbir handleViewDetails bulunamadı');
                              alert('Detay görüntüleme fonksiyonu bulunamadı. Lütfen sayfayı yenileyin.');
                            }
                          }}
                          sx={{ color: 'info.main' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                    {(() => {
                      const dofCreated = isDOFCreated ? isDOFCreated(item) : false;
                      return (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!dofCreated && openDOFForm) {
                              // DOF/8D oluşturma parametreleri - Birim bazlı
                              const dofParams = {
                                sourceModule: 'qualityCost' as const,
                                recordId: `unit_${item.unit}_${Date.now()}`,
                                recordData: item,
                                issueType: 'nonconformity' as const,
                                issueDescription: `${formatProfessionalName(item.unit)} Biriminde Yüksek Kalitesizlik Maliyeti (₺${item.total.toLocaleString('tr-TR')} - ${item.count} kayıt)`,
                                priority: (index < 3 ? 'high' : index < 7 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
                                affectedDepartment: formatProfessionalName(item.unit),
                                responsiblePerson: 'Birim Sorumlusu'
                              };
                              
                              // DOF form'unu aç
                              openDOFForm(item);
                            }
                          }}
                          sx={{ 
                            color: dofCreated ? 'success.main' : 'error.main',
                            '&:hover': { 
                              backgroundColor: dofCreated ? 'success.50' : 'error.50' 
                            },
                            cursor: dofCreated ? 'default' : 'pointer'
                          }}
                          title={dofCreated ? "Bu Birim İçin DÖF Zaten Oluşturulmuş" : "Bu Birim İçin DÖF/8D Oluştur"}
                          disabled={dofCreated}
                        >
                          {dofCreated ? <CheckCircleIcon fontSize="small" /> : <ReportProblemIcon fontSize="small" />}
                        </IconButton>
                      );
                    })()}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // Diğer tablo türleri için standart table renderer
    return (
      <Typography>Bu tablo türü henüz desteklenmiyor: {type}</Typography>
    );
  };

  return (
    <Box>
      {data.length > 0 ? (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          {renderTableContent()}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Sayfa başına:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} / ${count !== -1 ? count : `${to}'dan fazla`}`
            }
          />
        </Paper>
      ) : (
        <Typography>Gösterilecek veri bulunamadı.</Typography>
      )}
    </Box>
  );
};

// Export the main component


// ✅ MAIN COST MANAGEMENT TABLE - Tam İşlevsel Ana Tablo Implementation
const DataManagementComponent: React.FC<{
  onDataChange?: (analytics: any) => void,
  filteredData?: any[],
  onDataRefresh?: () => void,
  // ✅ YENİ: Global state setter'ları props olarak al
  setGlobalDetailDialogOpen?: (open: boolean) => void,
  setGlobalSelectedDetailEntry?: (entry: any) => void
}> = ({ 
  onDataChange, 
  filteredData, 
  onDataRefresh,
  setGlobalDetailDialogOpen,
  setGlobalSelectedDetailEntry
}) => {
  const theme = useTheme();
  
  // ✅ Ana tablo state'leri
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'tarih' | 'maliyet' | 'birim'>('tarih');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  
  // ✅ Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // ✅ Sorting handler
  const handleSort = (field: 'tarih' | 'maliyet' | 'birim') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  // ✅ DÜZELTME: Global handleViewDetails function tanımla - güvenli versiyonu
  const handleViewDetails = useCallback((entry: any) => {
    console.log('🔍 Ana Tablo - Detay Görüntüleme:', entry);
    
    try {
      // Entry'yi normalize et
      const normalizedEntry = {
        id: entry.id || `temp_${Date.now()}`,
        maliyetTuru: entry.maliyetTuru || entry.type || 'Bilinmiyor',
        birim: entry.birim || entry.department || entry.unit || 'Bilinmiyor',
        maliyet: entry.maliyet || entry.cost || entry.amount || 0,
        tarih: entry.tarih || entry.date || entry.createdDate || new Date().toISOString(),
        durum: entry.durum || entry.status || 'aktif',
        parcaKodu: entry.parcaKodu || entry.partCode || entry.code || `AUTO-${entry.id || Date.now()}`,
        aciklama: entry.aciklama || entry.description || entry.desc || 'Ana tablo kayıt detayı',
        aracModeli: entry.aracModeli || entry.arac || entry.vehicle,
        malzemeTuru: entry.malzemeTuru || entry.material,
        agirlik: entry.agirlik || entry.weight || 0,
        miktar: entry.miktar || entry.quantity || 1,
        // Ham veriyi de koru
        _rawData: entry
      };
      
      console.log('✅ Normalize edilmiş entry:', normalizedEntry);
      
      // ✅ DÜZELTME: Güvenli state setter kullanımı
      if (setGlobalSelectedDetailEntry && typeof setGlobalSelectedDetailEntry === 'function') {
        setGlobalSelectedDetailEntry(normalizedEntry);
      } else {
        console.warn('⚠️ setGlobalSelectedDetailEntry prop eksik');
      }
      
      if (setGlobalDetailDialogOpen && typeof setGlobalDetailDialogOpen === 'function') {
        setGlobalDetailDialogOpen(true);
      } else {
        console.warn('⚠️ setGlobalDetailDialogOpen prop eksik');
        // Fallback: Alert ile göster
        alert(`Detay Bilgisi:\n\nParça Kodu: ${normalizedEntry.parcaKodu}\nMaliyet: ₺${normalizedEntry.maliyet.toLocaleString('tr-TR')}\nTür: ${normalizedEntry.maliyetTuru}\nBirim: ${normalizedEntry.birim}`);
      }
      
    } catch (error) {
      console.error('❌ HandleViewDetails hatası:', error);
      alert('Detay görüntüleme sırasında hata oluştu: ' + error.message);
    }
  }, [setGlobalSelectedDetailEntry, setGlobalDetailDialogOpen]);
  
  // ✅ Global handleViewDetails'i window'a ata
  useEffect(() => {
    (window as any).handleViewDetails = handleViewDetails;
    console.log('✅ Global handleViewDetails window\'a atandı');
    
    return () => {
      delete (window as any).handleViewDetails;
    };
  }, [handleViewDetails]);
  
  // ✅ Veri filtreleme ve sıralama
  const processedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return [];
    }
    
    // Arama filtresi
    let filtered = filteredData.filter(item => {
      if (!localSearchTerm) return true;
      const searchLower = localSearchTerm.toLowerCase();
      return (
        (item.parcaKodu || '').toLowerCase().includes(searchLower) ||
        (item.maliyetTuru || '').toLowerCase().includes(searchLower) ||
        (item.birim || '').toLowerCase().includes(searchLower) ||
        (item.aciklama || '').toLowerCase().includes(searchLower) ||
        (item.arac || '').toLowerCase().includes(searchLower)
      );
    });
    
    // Sıralama
    filtered = filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'maliyet':
          aValue = a.maliyet || 0;
          bValue = b.maliyet || 0;
          break;
        case 'tarih':
          aValue = new Date(a.tarih || a.createdDate || '1970-01-01');
          bValue = new Date(b.tarih || b.createdDate || '1970-01-01');
          break;
        case 'birim':
          aValue = (a.birim || '').toLowerCase();
          bValue = (b.birim || '').toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [filteredData, localSearchTerm, sortBy, sortOrder]);
  
  // ✅ Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return processedData.slice(startIndex, startIndex + rowsPerPage);
  }, [processedData, page, rowsPerPage]);
  
  // ✅ Utility functions
  const formatMaliyetTuru = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'hurda': 'Hurda Maliyeti',
      'yeniden_islem': 'Yeniden İşlem',
      'fire': 'Fire Maliyeti',
      'garanti': 'Garanti Maliyeti',
      'iade': 'İade Maliyeti',
      'sikayet': 'Şikayet Maliyeti',
      'onleme': 'Önleme Maliyeti'
    };
    return typeMap[type] || type || 'Bilinmiyor';
  };
  
  const formatBirim = (birim: string) => {
    const birimMap: { [key: string]: string } = {
      'arge': 'Ar-Ge',
      'boyahane': 'Boyahane',
      'bukum': 'Büküm',
      'depo': 'Depo',
      'elektrikhane': 'Elektrikhane',
      'kalite_kontrol': 'Kalite Kontrol',
      'kaynakhane': 'Kaynakhane',
      'kesim': 'Kesim',
      'mekanik_montaj': 'Mekanik Montaj',
      'satin_alma': 'Satın Alma',
      'satis': 'Satış',
      'uretim_planlama': 'Üretim Planlama'
    };
    return birimMap[birim] || birim || 'Bilinmiyor';
  };
  
  const getMaliyetTuruColor = (type: string) => {
    const colorMap: { [key: string]: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" } = {
      'hurda': 'warning',
      'yeniden_islem': 'error',
      'fire': 'warning', 
      'garanti': 'error',
      'iade': 'error',
      'sikayet': 'error',
      'onleme': 'success'
    };
    return colorMap[type] || 'primary';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* ✅ Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            📊 Ana Maliyet Yönetimi Tablosu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Toplam {processedData.length} kayıt • Sayfa: {page + 1}
          </Typography>
        </Box>
        
        {/* ✅ Search */}
        <TextField
          size="small"
          placeholder="Arama yapın..."
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 250 }}
        />
      </Box>
      
      {processedData.length > 0 ? (
        <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              {/* ✅ Table Header */}
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.50' }}>
                    <ButtonBase
                      onClick={() => handleSort('tarih')}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: sortBy === 'tarih' ? 'primary.main' : 'text.primary'
                      }}
                    >
                      Tarih
                      {sortBy === 'tarih' && (
                        sortOrder === 'asc' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />
                      )}
                    </ButtonBase>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.50' }}>Parça Kodu</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.50' }}>Maliyet Türü</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.50' }}>
                    <ButtonBase
                      onClick={() => handleSort('birim')}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: sortBy === 'birim' ? 'primary.main' : 'text.primary'
                      }}
                    >
                      Birim
                      {sortBy === 'birim' && (
                        sortOrder === 'asc' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />
                      )}
                    </ButtonBase>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'primary.50' }}>
                    <ButtonBase
                      onClick={() => handleSort('maliyet')}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        ml: 'auto',
                        color: sortBy === 'maliyet' ? 'primary.main' : 'text.primary'
                      }}
                    >
                      Maliyet
                      {sortBy === 'maliyet' && (
                        sortOrder === 'asc' ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />
                      )}
                    </ButtonBase>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.50' }}>Araç</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'primary.50' }}>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              
              {/* ✅ Table Body */}
              <TableBody>
                {paginatedData.map((item, index) => (
                  <TableRow 
                    key={item.id || index}
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover' },
                      '&:nth-of-type(odd)': { bgcolor: 'grey.50' }
                    }}
                  >
                    {/* Tarih */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {new Date(item.tarih || item.createdDate || new Date()).toLocaleDateString('tr-TR')}
                      </Typography>
                    </TableCell>
                    
                    {/* Parça Kodu */}
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        fontFamily="monospace"
                        sx={{ 
                          bgcolor: 'grey.100',
                          p: 0.5,
                          borderRadius: 1,
                          color: 'primary.main',
                          fontWeight: 600
                        }}
                      >
                        {item.parcaKodu || 'N/A'}
                      </Typography>
                    </TableCell>
                    
                    {/* Maliyet Türü */}
                    <TableCell>
                      <Chip
                        label={formatMaliyetTuru(item.maliyetTuru)}
                        color={getMaliyetTuruColor(item.maliyetTuru)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    {/* Birim */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {formatBirim(item.birim)}
                      </Typography>
                    </TableCell>
                    
                    {/* Maliyet */}
                    <TableCell align="right">
                      <Typography variant="h6" color="error.main" fontWeight="bold">
                        ₺{(item.maliyet || 0).toLocaleString('tr-TR')}
                      </Typography>
                    </TableCell>
                    
                    {/* Araç */}
                    <TableCell>
                      <Typography variant="body2">
                        {item.arac || item.aracModeli || 'Genel'}
                      </Typography>
                    </TableCell>
                    
                    {/* ✅ İşlemler - VIEW DETAILS BUTTON */}
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {/* 🎯 YENİ: Detayları Görüntüle Butonu */}
                        <Tooltip title="Detayları Görüntüle">
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              console.log('🔍 Ana Tablo View Details clicked:', item);
                              handleViewDetails(item);
                            }}
                            sx={{ 
                              color: 'info.main',
                              '&:hover': { bgcolor: 'info.50' }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {/* Edit Butonu */}
                        <Tooltip title="Düzenle">
                          <IconButton 
                            size="small"
                            sx={{ 
                              color: 'warning.main',
                              '&:hover': { bgcolor: 'warning.50' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {/* Delete Butonu */}
                        <Tooltip title="Sil">
                          <IconButton 
                            size="small"
                            sx={{ 
                              color: 'error.main',
                              '&:hover': { bgcolor: 'error.50' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* ✅ Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={processedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Sayfa başına:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} / ${count !== -1 ? count : `${to}'dan fazla`}`
            }
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'grey.50'
            }}
          />
        </Paper>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            📊 Henüz Kayıt Bulunmuyor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Maliyet kayıtları eklemek için yeni kayıt oluşturun.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

const SmartTargetManagementComponent: React.FC<{
  realTimeData?: any,
  filteredData?: any[],
  onDataRefresh?: () => void
}> = ({ realTimeData, filteredData, onDataRefresh }) => {
  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Akıllı Hedef Yönetimi
      </Typography>
      <Typography>
        Bu bölüm henüz geliştirilmekte.
      </Typography>
    </Box>
  );
};

const CostSettingsComponent: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Birim Maliyet Ayarları
      </Typography>
      <Typography>
        Bu bölüm henüz geliştirilmekte.
      </Typography>
    </Box>
  );
};

const MaterialPricingManagementComponent: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Malzeme Maliyet Yönetimi
      </Typography>
      <Typography>
        Bu bölüm henüz geliştirilmekte.
      </Typography>
    </Box>
  );
};

const CategoryProductionManagementComponent: React.FC<{
  onTabChange?: (tab: number) => void
}> = ({ onTabChange }) => {
  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Kategori Üretim Yönetimi
      </Typography>
      <Typography>
        Bu bölüm henüz geliştirilmekte.
      </Typography>
    </Box>
  );
};
