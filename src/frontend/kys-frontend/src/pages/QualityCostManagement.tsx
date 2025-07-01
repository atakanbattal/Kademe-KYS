import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import {
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  CardActions,
  CardHeader,
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
  Popover,
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
  Person as PersonIcon,

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
  FilterList as FilterListIcon,
  Tune as TuneIcon,
  Science as ScienceIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  SettingsBackupRestore as SettingsBackupRestoreIcon,
  AccessTime as AccessTimeIcon,
  Schedule as ScheduleIcon,
  Update as UpdateIcon,
  Work as WorkIcon,
  Save as SaveIcon,
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



// 🔥 ULTIMATE STABLE SEARCH INPUT - Kesinlikle focus kaybı yok!
const UltimateStableSearchInput = memo<{
  defaultValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}>(({ defaultValue = '', onChange, placeholder = "", label = "", size = "small", fullWidth = true }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // ⚡ DOM-based state management - React state'ini bypass et
  const lastValue = useRef(defaultValue || '');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isUserTyping = useRef(false);
  const isMounted = useRef(true);
  const focusGuard = useRef<NodeJS.Timeout | null>(null);
  
  // ⚡ Initial value set - sadece mount olurken
  useEffect(() => {
    if (inputRef.current && !isUserTyping.current) {
      inputRef.current.value = defaultValue || '';
      lastValue.current = defaultValue || '';
    }
  }, []); // Dependency array boş - sadece mount'ta çalışsın
  
  // ⚡ Aggressive focus guard
  useEffect(() => {
    const interval = setInterval(() => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        // Eğer focus varsa, re-render'ları engelle
        if (focusGuard.current) clearTimeout(focusGuard.current);
        focusGuard.current = setTimeout(() => {
          // Focus guard süresi dolunca normal işleme dön
        }, 1000);
      }
    }, 50); // Her 50ms kontrol et
    
    return () => clearInterval(interval);
  }, []);
  
  // ⚡ Raw DOM input handler - React state'siz
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // User typing lock
    isUserTyping.current = true;
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer
    debounceTimer.current = setTimeout(() => {
      if (isMounted.current) {
        onChange(newValue);
        lastValue.current = newValue;
        isUserTyping.current = false;
      }
    }, 200); // Çok hızlı response
    
  }, [onChange]);
  
  // ⚡ Focus handlers
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const target = e.target;
    // Cursor'u sona taşı
    setTimeout(() => {
      if (target && target === document.activeElement) {
        target.setSelectionRange(target.value.length, target.value.length);
      }
    }, 0);
  }, []);
  
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Blur'u engelle eğer container içinde bir element'e tıklanmışsa
    setTimeout(() => {
      if (containerRef.current && 
          containerRef.current.contains(document.activeElement)) {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }, 10);
  }, []);
  
  // ⚡ Mouse handlers - Focus kaybını tamamen engelle
  const handleContainerMouseDown = useCallback((e: React.MouseEvent) => {
    // Container'a tıklama focus kaybına sebep olmasın
    if (e.target !== inputRef.current) {
      e.preventDefault();
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleInputMouseDown = useCallback((e: React.MouseEvent) => {
    // Input'a tıklama normal çalışsın
    e.stopPropagation();
  }, []);
  
  // ⚡ Cleanup
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (focusGuard.current) clearTimeout(focusGuard.current);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      onMouseDown={handleContainerMouseDown}
      style={{ 
        width: fullWidth ? '100%' : 'auto',
        position: 'relative'
      }}
    >
      <TextField
        ref={inputRef}
        fullWidth={fullWidth}
        size={size}
        label={label}
        defaultValue={defaultValue || ''}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseDown={handleInputMouseDown}
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
            '&.Mui-focused': {
              '& fieldset': {
                borderColor: '#1976d2 !important',
                borderWidth: '2px !important',
              },
            },
          },
        }}
      />
    </div>
  );
}, () => true); // Hiç re-render olma

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
  | 'Çay Toplama Makinesi'
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
  'Araç Üstü Vakumlu': ['KDM 80', 'KDM 70', 'KDM 35'],
  'Çekilir Tip Mekanik Süpürgeler': ['FTH-240', 'Çelik-2000', 'Ural'],
  'Kompost Makinesi': ['Kompost Makinesi'],
  'Çay Toplama Makinesi': ['Çay Toplama Makinesi'],
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
  'Çay Toplama Makinesi': 'Çay Toplama Makinesi',
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

// ✅ Context7: Enhanced Quality Cost Record with Batch Operations
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
  
  // ⭐ YENİ: ADET BAZLI YENİDEN İŞLEM MALİYETİ
  adetBilgisi?: {
    hataliAdet: number;        // Hatalı adet sayısı (1-15 arası)
    birimMaliyet: number;      // Her bir adet için maliyet
    toplamMaliyet: number;     // hataliAdet * birimMaliyet
    islemTuru: 'yeniden_islem' | 'hurda' | 'ret' | 'fire';
  };
  
  // ⭐ YENİ: FAZLADAN BİRİM MALİYETLERİ
  ekBirimMaliyetleri?: {
    id: string;
    birimAdi: string;         // Kalite Kontrol, Montaj, vs.
    hataSebebi: string;       // Kaynakhane hatası, vs.
    olusmaSebebi: string;     // Ana birim hatası yüzünden ek iş
    maliyet: number;
    islemDetayi: string;
    sorumluBirim: string;
  }[];
  
  // Araç bazlı tracking alanları
  aracModeli?: VehicleModel;
  atikTuru?: WasteType;
  miktar?: number;          // adet cinsinden
  agirlik?: number;         // kg cinsinden
  unit?: 'adet' | 'kg' | 'lt' | 'ton';
  category?: string;        // Motor Parçaları, Şase Elemanları, vs.
  
  // Malzeme bazlı maliyet hesaplama
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
  displayName?: string;     // Opsiyonel: görüntüleme adı
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
  const [isLoading, setIsLoading] = useState(false); // ⚡ HIZLI: Default false olarak başla
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
    
    // ✅ YENİ: Yeniden işlem maliyeti için etkilenen diğer birimler
    ekBirimMaliyetleri: []
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

  // ✅ Optimize edilmiş search handler fonksiyonu
  const handleSearchTermChange = useCallback((newSearchTerm: string) => {
    setGlobalFilters(prev => ({
      ...prev,
      searchTerm: newSearchTerm
    }));
  }, []);

  // ✅ Context7: Global Filtered Data for All Tabs
  const [globalFilteredData, setGlobalFilteredData] = useState<any[]>([]);
  
  // ✅ YENİ: Collapsible Filter State
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  
  // ✅ REAL-TIME TRIGGER: localStorage değişikliklerini dinlemek için state
  const [dataRefreshTrigger, setDataRefreshTrigger] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(0);

  // ✅ ÜRETIM VERİSİ: Aylık üretim verilerini almak için
  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []); // 2025-01 formatı
  
    const monthlyProductionData = useMemo(() => {
    try {
      // ✅ HEM monthly_vehicle_productions HEM DE monthly_category_productions kontrol et
      let savedProductions = [];
      
      // Önce monthly_vehicle_productions'ı dene
      const vehicleProductions = JSON.parse(localStorage.getItem('monthly_vehicle_productions') || '[]');
      
      // Sonra monthly_category_productions'ı dene
      const categoryProductions = JSON.parse(localStorage.getItem('monthly_category_productions') || '[]');
      
      console.log('🔍 Çoklu localStorage kontrol:', {
        vehicleProductionsLength: vehicleProductions.length,
        categoryProductionsLength: categoryProductions.length,
        vehicleData: vehicleProductions,
        categoryData: categoryProductions
      });
      
      // Hangi veri varsa onu kullan
      if (categoryProductions.length > 0) {
        savedProductions = categoryProductions;
        console.log('✅ Kategori bazlı üretim verisi kullanılıyor');
      } else if (vehicleProductions.length > 0) {
        savedProductions = vehicleProductions;
        console.log('✅ Araç bazlı üretim verisi kullanılıyor');
      }
      
      // ✅ DÜZELTME: Dashboard için currentMonth (bu ay) filtrelemesi yap
      const filteredData = savedProductions.filter((p: any) => {
        const isActive = p.isActive !== false; // undefined da aktif sayılır
        
        // Dashboard'da "Bu Ay Üretim" için currentMonth'u kullan
        // Kayıtların donem alanı ile mevcut ayı karşılaştır
        return isActive && p.donem === currentMonth;
      });
      
      console.log('📊 Ana Component Monthly Production Data Debug:', {
        currentMonth,
        totalSavedProductions: savedProductions.length,
        filteredForCurrentMonth: filteredData.length,
        filteredProductions: filteredData,
        allProductions: savedProductions,
        filterLogic: `Dashboard için sadece ${currentMonth} dönemi gösteriliyor`,
        forceRefreshCount: dataRefreshTrigger
      });
      
      return filteredData;
    } catch (error) {
      console.error('Üretim verisi okuma hatası:', error);
      return [];
    }
  }, [currentMonth, dataRefreshTrigger, forceRefresh]);

  // ✅ DÜZELTME: productionSummary fonksiyonunu implement ediyoruz
  const productionSummary = useMemo(() => {
    console.log('🏭 ProductionSummary Hesaplama Başlıyor:', {
      monthlyProductionDataLength: monthlyProductionData?.length || 0,
      monthlyProductionData: monthlyProductionData,
      isEmpty: !monthlyProductionData || monthlyProductionData.length === 0
    });

    if (!monthlyProductionData || monthlyProductionData.length === 0) {
      console.log('⚠️ ProductionSummary: Veri yok, default değerler döndürülüyor');
      return {
        totalVehicles: 0,
        activeModels: 0,
        topProducingModel: { model: 'Veri Yok', count: 0 },
        totalPlanned: 0,
        completionRate: 0
      };
    }

    // Toplam üretilen araç sayısı - farklı alan isimlerini kontrol et
    const totalVehicles = monthlyProductionData.reduce((sum: number, item: any) => {
      const value = item.uretilenAracSayisi || item.uretilen || item.quantity || item.adet || 0;
      console.log(`🔢 Item ${item.id}:`, {
        uretilenAracSayisi: item.uretilenAracSayisi,
        uretilen: item.uretilen,
        quantity: item.quantity,
        adet: item.adet,
        finalValue: value,
        allFields: Object.keys(item)
      });
      return sum + value;
    }, 0);
    
    // Aktif model sayısı
    const activeModels = monthlyProductionData.length;
    
    // Toplam planlanan üretim
    const totalPlanned = monthlyProductionData.reduce((sum: number, item: any) => sum + (item.planlanmisUretim || 0), 0);
    
    // Tamamlanma oranı
    const completionRate = totalPlanned > 0 ? (totalVehicles / totalPlanned) * 100 : 0;
    
    // En çok üretilen model
    const topProducingModel = monthlyProductionData.reduce((max: any, item: any) => {
      const currentCount = item.uretilenAracSayisi || 0;
      const maxCount = max.count || 0;
      const modelName = item.kategori || item.displayName || item.aracModeli || 'Veri Yok';
      return currentCount > maxCount ? { model: modelName, count: currentCount } : max;
    }, { model: 'Veri Yok', count: 0 });

    const result = {
      totalVehicles,
      activeModels,
      topProducingModel,
      totalPlanned,
      completionRate
    };

    console.log('✅ ProductionSummary Hesaplama Sonucu:', result);
    return result;
  }, [monthlyProductionData]);

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
    setForceRefresh(prev => prev + 1);
  }, []);

  // ✅ REAL-TIME UPDATE SİSTEMİ: Üretim verilerini dinamik olarak güncelle
  useEffect(() => {
    console.log('🎯 Real-time üretim veri listener sistemi aktif');

    // ✅ Custom event listener'ları tanımla
    const handleProductionDataChange = (event: any) => {
      console.log('📊 Üretim verisi değişti, kartlar güncelleniyor...', event.detail);
      setForceRefresh(prev => prev + 1);
      setDataRefreshTrigger(prev => prev + 1);
    };

    const handleNewProductionRecord = (event: any) => {
      console.log('➕ Yeni üretim kaydı eklendi, dashboard güncelleniyor...', event.detail);
      setForceRefresh(prev => prev + 1);
      setDataRefreshTrigger(prev => prev + 1);
    };

    const handleProductionUpdate = (event: any) => {
      console.log('🔄 Üretim kaydı güncellendi, dashboard yenileniyor...', event.detail);
      setForceRefresh(prev => prev + 1);
      setDataRefreshTrigger(prev => prev + 1);
    };

    // ✅ Event listener'ları ekle
    window.addEventListener('productionDataChanged', handleProductionDataChange);
    window.addEventListener('newProductionRecord', handleNewProductionRecord);
    window.addEventListener('productionUpdated', handleProductionUpdate);
    window.addEventListener('addNewProductionRecord', handleNewProductionRecord);

    // ✅ "Bu Ay Üretim" kartına tıklandığında Aylık Üretim Sayıları sekmesine git
    const handleGoToProductionTab = () => {
      console.log('🎯 "Bu Ay Üretim" kartından Aylık Üretim sekmesine yönlendiriliyor...');
      setCurrentTab(7); // Aylık Üretim Sayıları sekmesi
    };

    window.addEventListener('goToProductionTab', handleGoToProductionTab);

    // ✅ localStorage değişikliklerini dinle
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && (
        event.key.includes('monthly_vehicle_productions') || 
        event.key.includes('monthly_category_productions')
      )) {
        console.log('💾 localStorage üretim verisi değişti:', event.key);
        setForceRefresh(prev => prev + 1);
        setDataRefreshTrigger(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // ✅ Cleanup function
    return () => {
      window.removeEventListener('productionDataChanged', handleProductionDataChange);
      window.removeEventListener('newProductionRecord', handleNewProductionRecord);
      window.removeEventListener('productionUpdated', handleProductionUpdate);
      window.removeEventListener('addNewProductionRecord', handleNewProductionRecord);
      window.removeEventListener('goToProductionTab', handleGoToProductionTab);
      window.removeEventListener('storage', handleStorageChange);
      console.log('🧹 Real-time listener sistemi temizlendi');
    };
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
      'ssh': 'SSH',
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

  // ✅ Context7: Global Filtering Function (Memoized)
  const applyGlobalFilters = useCallback(() => {
    console.log('🔍 applyGlobalFilters çalışıyor:', {
      globalFilters,
      searchTerm: globalFilters.searchTerm,
      hasSearchTerm: !!globalFilters.searchTerm,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Load data from localStorage (check multiple possible keys)
      let rawData = localStorage.getItem('kys-cost-management-data') || 
                   localStorage.getItem('kalitesizlikMaliyetleri') ||
                   localStorage.getItem('context7_qualityCosts');
      let costData = rawData ? JSON.parse(rawData) : [];
      
      console.log('📁 Raw data yüklendi:', {
        rawDataLength: costData.length,
        hasRawData: costData.length > 0
      });
      
      // Apply filters
      let filtered = costData;

      // Maliyet türü filtresi
      if (globalFilters.maliyetTuru) {
        filtered = filtered.filter((item: any) => item.maliyetTuru === globalFilters.maliyetTuru);
      }

      // Birim filtresi
      if (globalFilters.birim) {
        filtered = filtered.filter((item: any) => item.birim === globalFilters.birim);
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
        console.log('🔍 Arama filtresi uygulanıyor:', {
          searchTerm: globalFilters.searchTerm,
          searchLower,
          beforeFilterCount: filtered.length
        });
        
        filtered = filtered.filter((item: any) =>
          (item.parcaKodu?.toLowerCase().includes(searchLower)) ||
          (item.maliyetTuru?.toLowerCase().includes(searchLower)) ||
          (item.birim?.toLowerCase().includes(searchLower)) ||
          (item.arac?.toLowerCase().includes(searchLower)) ||
          (item.maliyet?.toString().includes(searchLower))
        );
        
        console.log('✅ Arama filtresi uygulandı:', {
          afterFilterCount: filtered.length,
          sampleFilteredData: filtered.slice(0, 2)
        });
      }

      // Sort by newest first
      filtered = filtered.sort((a: any, b: any) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());

      setGlobalFilteredData(filtered);

      console.log('🔍 Global filters applied - FINAL RESULT:', {
        originalCount: costData.length,
        filteredCount: filtered.length,
        filters: globalFilters,
        finalFilteredData: filtered.slice(0, 3),
        willPropagate: true
      });

    } catch (error) {
      console.error('Global filtering error:', error);
      setGlobalFilteredData([]);
    }
  }, [globalFilters, dataRefreshTrigger]);

  // ✅ Filtreleme effect'i
  useEffect(() => {
    applyGlobalFilters();
  }, [applyGlobalFilters]);

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

  // ✅ Context7 Optimized Data Loading Effect
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // ⚡ HIZLI YÜKLEME: Yapay gecikme kaldırıldı
        // Sadece gerçek hesaplamaları yapalım
        const copqData = generateCOPQData();
        const kpiData = generateKPIs(copqData);
        const insightData = generateAIInsights(copqData);
        const paretoAnalysis = generateParetoData(copqData);
        
        setCopqData(copqData);
        setKpis(kpiData);
        setAiInsights(insightData);
        setParetoData(paretoAnalysis);
      } catch (error) {
        console.error('❌ COPQ Data loading error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [refreshKey]); // ⚡ OPTIMIZE: Sadece refreshKey dependency'si

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
      'ssh': 'SSH',
      'SSH': 'SSH',
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
      'ssh': 'SSH',
      'satis_sonrasi_hizmetleri': 'SSH',
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
      'satis sonrasi': 'SSH',
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
    productionSummary?: any,
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
    productionSummary,
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
    // ✅ Default productionSummary if not provided
    const defaultProductionSummary = {
      totalVehicles: 0,
      activeModels: 0,
      topProducingModel: { model: 'Veri Yok', count: 0 },
      totalPlanned: 0,
      completionRate: 0
    };
    
    const currentProductionSummary = productionSummary || defaultProductionSummary;
    
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
                      
                      return topUnit ? formatProfessionalDepartmentName(topUnit[0]) : 'Veri Yok';
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
                    {currentProductionSummary.totalVehicles}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Bu Ay Üretim
                  </Typography>
                  <Chip 
                    label={`${currentProductionSummary.activeModels} Model`}
                    size="small"
                    color="default"
                    variant="outlined"
                  />
                  {currentProductionSummary.activeModels > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={`En Fazla: ${currentProductionSummary.topProducingModel.model}`}
                        size="small"
                        color="primary"
                        variant="outlined"
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
                                {formatProfessionalDepartmentName(department.birim || department.department || `Birim-${index + 1}`)}
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

    // ✅ DÜZELTME: productionSummary fonksiyonunu implement ediyoruz
    const productionSummary = useMemo(() => {
      if (!monthlyProductionData || monthlyProductionData.length === 0) {
        return {
          totalVehicles: 0,
          activeModels: 0,
          topProducingModel: { model: 'Veri Yok', count: 0 },
          totalPlanned: 0,
          completionRate: 0
        };
      }

      // Toplam üretilen araç sayısı
      const totalVehicles = monthlyProductionData.reduce((sum, item) => sum + (item.uretilenAracSayisi || 0), 0);
      
      // Aktif model sayısı
      const activeModels = monthlyProductionData.length;
      
      // Toplam planlanan üretim
      const totalPlanned = monthlyProductionData.reduce((sum, item) => sum + (item.planlanmisUretim || 0), 0);
      
      // Tamamlanma oranı
      const completionRate = totalPlanned > 0 ? (totalVehicles / totalPlanned) * 100 : 0;
      
      // En çok üretilen model
      const topProducingModel = monthlyProductionData.reduce((max, item) => {
        const currentCount = item.uretilenAracSayisi || 0;
        const maxCount = max.count || 0;
        const modelName = item.kategori || item.displayName || item.aracModeli || 'Veri Yok';
        return currentCount > maxCount ? { model: modelName, count: currentCount } : max;
      }, { model: 'Veri Yok', count: 0 });

      return {
        totalVehicles,
        activeModels,
        topProducingModel,
        totalPlanned,
        completionRate
      };
    }, [monthlyProductionData]);

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
    // ⚡ PERFORMANCE: Heavy computation'ı memo ile optimize et
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
    }, [globalFilteredData, vehicleTargets]); // ⚡ OPTIMIZE: Sadece kritik dependency'ler

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

    // ⚡ OPTIMIZED: Memo'lu araç kartı komponenti
    const VehicleCard = memo(({ vehicle, index }: { vehicle: VehiclePerformanceAnalysis; index: number }) => {
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

            {/* Basit format kaldırıldı - Sadece gelişmiş performans kartları kullanılacak */}



            {/* Detaylı Hedef Karşılaştırması */}
            {(() => {
              // 🚗 KATEGORİ BAZLI hedef eşleştirme sistemi - ULTRA GELİŞTİRİLDİ
              let categoryTarget = null;
              
              // Normalizasyon fonksiyonu - kategori isimleri farklılıklarını giderir
              const normalizeCategory = (category: string) => {
                if (!category) return '';
                return category.toLowerCase()
                  .replace(/\s+/g, '_')
                  .replace(/[üû]/g, 'u')
                  .replace(/[çc]/g, 'c')
                  .replace(/[ğg]/g, 'g')
                  .replace(/[ıi]/g, 'i')
                  .replace(/[öo]/g, 'o')
                  .replace(/[şs]/g, 's')
                  .trim();
              };
              
              const normalizedVehicleCategory = normalizeCategory(vehicle.kategori || '');
              const normalizedDisplayName = normalizeCategory(vehicle.displayName || displayName || '');
              
              // 1. EXACT kategori eşleştirmesi (önce aktif hedefleri)
              if (vehicle.kategori) {
                categoryTarget = vehicleTargets.find(target => 
                  target.kategori === vehicle.kategori && target.isActive !== false
                );
              }
              
              // 2. EXACT model eşleştirmesi (geriye uyumluluk)
              if (!categoryTarget && vehicle.aracModeli) {
                categoryTarget = vehicleTargets.find(target => 
                  target.aracModeli === vehicle.aracModeli && target.isActive !== false
                );
              }
              
              // 3. NORMALIZED kategori eşleştirmesi (space/accent tolerant)
              if (!categoryTarget && normalizedVehicleCategory) {
                categoryTarget = vehicleTargets.find(target => 
                  normalizeCategory(target.kategori || '') === normalizedVehicleCategory && 
                  target.isActive !== false
                );
              }
              
              // 4. NORMALIZED displayName eşleştirmesi
              if (!categoryTarget && normalizedDisplayName) {
                categoryTarget = vehicleTargets.find(target => 
                  (normalizeCategory(target.kategori || '') === normalizedDisplayName ||
                   normalizeCategory(target.aracModeli || '') === normalizedDisplayName) &&
                  target.isActive !== false
                );
              }
              
              // 5. Aktif olmayan hedefleri de dene (exact)
              if (!categoryTarget && vehicle.kategori) {
                categoryTarget = vehicleTargets.find(target => target.kategori === vehicle.kategori);
              }
              
              // 6. Aktif olmayan hedefleri de dene (normalized)
              if (!categoryTarget && normalizedVehicleCategory) {
                categoryTarget = vehicleTargets.find(target => 
                  normalizeCategory(target.kategori || '') === normalizedVehicleCategory
                );
              }
              
              // Debug bilgisi ekle
                            console.log('🎯 HEDEF YÖNETİMİ EŞLEŞTİRME DEBUG:', {
                // Araç bilgileri
                vehicle: {
                kategori: vehicle.kategori,
                  aracModeli: vehicle.aracModeli,
                  displayName: vehicle.displayName || displayName,
                  categoryModels: vehicle.categoryModels
                },
                
                // Hedef Yönetimi Sekmesi Durumu
                targetManagement: {
                totalTargetsCount: vehicleTargets.length,
                  localStorageKey: 'vehicle-targets',
                  availableTargets: vehicleTargets.map(t => ({ 
                    id: t.id,
                    kategori: t.kategori, 
                    aracModeli: t.aracModeli, 
                    donem: t.donem, 
                    isActive: t.isActive,
                    hedefler: {
                      ret: t.hedefler?.maksRetAdet || 'undefined',
                      hurda: t.hedefler?.maksHurdaKg || 'undefined',  
                      fire: t.hedefler?.maksFireKg || 'undefined'
                    }
                  })),
                  activeTargets: vehicleTargets.filter(t => t.isActive !== false).length,
                  categorySpecificTargets: vehicleTargets.filter(t => t.kategori === vehicle.kategori).length
                },
                
                // Eşleştirme Algoritması 
                algorithm: {
                  normalizedVehicleCategory: normalizedVehicleCategory,
                  normalizedDisplayName: normalizedDisplayName,
                  step1_exactMatch: vehicleTargets.filter(t => t.kategori === vehicle.kategori && t.isActive !== false).length,
                  step2_modelMatch: vehicleTargets.filter(t => t.aracModeli === vehicle.aracModeli && t.isActive !== false).length,
                  step3_normalizedMatch: vehicleTargets.filter(t => normalizeCategory(t.kategori || '') === normalizedVehicleCategory && t.isActive !== false).length,
                  finalMatch: categoryTarget ? `✅ Hedef bulundu: ${categoryTarget.kategori} (${categoryTarget.donem})` : '❌ Hedef bulunamadı - Hedef Yönetimi sekmesine yönlendirilecek'
                }
              });
              
              // ⚠️ Hedef bulunamadı - Hedef Yönetimi sekmesinden hedef oluşturulmasını iste
              if (!categoryTarget) {
                return (
                  <Box sx={{ mb: 3, p: 3, bgcolor: 'warning.50', borderRadius: 2, border: '2px dashed', borderColor: 'warning.main' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        bgcolor: 'warning.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}>
                        <Typography variant="h6" color="white" fontWeight={700}>
                          ⚠️
                    </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600} color="warning.dark">
                          Hedef Belirlenmemiş
                    </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {displayName} kategorisi için performans hedefleri bulunamadı
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
                      Bu kategorinin performansını ölçebilmek için önce "Hedef Yönetimi" sekmesinden hedefler belirlemelisiniz.
                    </Typography>
                    
                    <Button
                      variant="contained"
                      color="warning"
                      size="large"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        // Hedef Yönetimi sekmesine geç (tab index 4)
                        setCurrentTab(4);
                        // Scroll to top
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      sx={{ 
                        fontWeight: 700,
                        fontSize: '1rem',
                        py: 1.5,
                        boxShadow: 3,
                        '&:hover': {
                          boxShadow: 6,
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      🎯 Hedef Yönetimi Sekmesine Git
                    </Button>
                    
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
                      <Typography variant="caption" color="info.dark" sx={{ fontWeight: 500 }}>
                        💡 İpucu: Hedef Yönetimi sekmesinde bu kategori için Ret, Hurda ve Fire hedeflerini adet/kg cinsinden belirleyebilirsiniz.
                    </Typography>
                    </Box>
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Hedef Performansı
                  </Typography>
                    <Chip
                      label={`Dönem: ${categoryTarget.donem}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: '24px'
                      }}
                    />
                  </Box>
                  
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
    }); // ⚡ MEMO component - dependency array gerekli değil

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
              {vehicleAnalysis.map((vehicle, index) => (
                <VehicleCard key={vehicle.kategori || vehicle.aracModeli || index} vehicle={vehicle} index={index} />
              ))}
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

  // ⚡ OPTIMIZED Loading State - Sadece gerektiğinde göster
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <AutoGraphIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Veri Hazırlanıyor...
          </Typography>
          <LinearProgress sx={{ maxWidth: 200, mx: 'auto' }} />
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
                <InputLabel>Araç Kategorisi</InputLabel>
                <Select
                  value={globalFilters.maliyetTuru}
                  onChange={(e) => setGlobalFilters({...globalFilters, maliyetTuru: e.target.value})}
                  label="Araç Kategorisi"
                >
                  <MenuItem value="">Tüm Kategoriler</MenuItem>
                  {Object.keys(VEHICLE_CATEGORIES).map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4} lg={2.2}>
              <FormControl fullWidth size="small">
                <InputLabel>Üretim Durumu</InputLabel>
                <Select
                  value={globalFilters.birim}
                  onChange={(e) => setGlobalFilters({...globalFilters, birim: e.target.value})}
                  label="Üretim Durumu"
                >
                  <MenuItem value="">Tüm Durumlar</MenuItem>
                  <MenuItem value="hedef_ustu">Hedef Üstü (&ge;100%)</MenuItem>
                  <MenuItem value="hedef_yakın">Hedefe Yakın (80-99%)</MenuItem>
                  <MenuItem value="hedef_alti">Hedef Altı (&lt;80%)</MenuItem>
                  <MenuItem value="yuksek_uretim">Yüksek Üretim (&gt;50 adet)</MenuItem>
                  <MenuItem value="orta_uretim">Orta Üretim (20-50 adet)</MenuItem>
                  <MenuItem value="dusuk_uretim">Düşük Üretim (&lt;20 adet)</MenuItem>
                  <MenuItem value="aktif">Aktif Üretim</MenuItem>
                  <MenuItem value="planlanan">Sadece Planlanan</MenuItem>
                  <MenuItem value="geciken">Gecikmeli Üretim</MenuItem>
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
              <UltimateStableSearchInput
                defaultValue={globalFilters.searchTerm}
                onChange={handleSearchTermChange}
                label="Gelişmiş Arama"
                placeholder="Araç modeli, kategori, açıklama..."
                size="small"
                fullWidth
              />
            </Grid>

            {/* Filtre Temizleme Butonu */}
            <Grid item xs={12} sm={6} md={4} lg={1.6}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => {
                  setGlobalFilters({
                    maliyetTuru: '', // Araç kategorisi
                    birim: '', // Üretim durumu
                    arac: '',
                    searchTerm: '',
                    selectedMonth: '',
                    selectedYear: new Date().getFullYear().toString()
                  });
                }}
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
          productionSummary={productionSummary}
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
        {currentTab === 1 && <DataManagementComponent onDataChange={setRealTimeAnalytics} filteredData={globalFilteredData} onDataRefresh={() => {
              setDataRefreshTrigger(prev => prev + 1);
              triggerDataRefresh();
            }} />}
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
        {currentTab === 5 && <CostSettingsComponent 
          filteredData={globalFilteredData}
        />}
        {currentTab === 6 && <MaterialPricingManagementComponent />}
                    {currentTab === 7 && <CategoryProductionManagementComponent 
            onTabChange={setCurrentTab} 
            globalFilters={globalFilters}
            setGlobalFilters={setGlobalFilters}
          />}
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
            // Manuel refresh tetikle
            setTimeout(() => {
              setForceRefresh(prev => prev + 1);
              setDataRefreshTrigger(prev => prev + 1);
            }, 100);
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
                {globalSelectedDetailEntry?.birim && `Birim: ${formatProfessionalDepartmentName(globalSelectedDetailEntry.birim)} • `}
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
                             {formatProfessionalDepartmentName(globalSelectedDetailEntry.birim)}
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
                               const arac = globalSelectedDetailEntry.aracModeli || globalSelectedDetailEntry.arac;
                               // Araç isimlerini formatla
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
               console.log('🔧 Executive Dashboard Düzenleme başlatıldı:', globalSelectedDetailEntry);
               
               // Veri yönetimi kısmındaki düzenleme fonksiyonunu kullan
               if (globalSelectedDetailEntry) {
                 // DataManagementComponent'e ref oluşturalım ve handleEdit'i çağıralım
                 if ((window as any).globalHandleEdit) {
                   console.log('✅ Global handleEdit kullanılıyor');
                   (window as any).globalHandleEdit(globalSelectedDetailEntry);
                 } else {
                   // Fallback: currentTab'ı veri yönetimi sekmesine değiştir ve düzenlemeyi başlat
                   console.log('📋 Veri yönetimi sekmesine yönlendiriliyor');
                   setCurrentTab(1); // Veri yönetimi sekmesi
                   
                   // DataManagementComponent'in yüklenmesi için kısa bir gecikme
                   setTimeout(() => {
                     // Global state'e düzenlenecek kayıtı set et
                     (window as any).editingEntryFromExecutiveDashboard = globalSelectedDetailEntry;
                     console.log('✅ Düzenleme kaydı global state\'e eklendi');
                   }, 100);
                 }
               } else {
                 console.error('❌ Düzenlenecek kayıt bulunamadı');
                 alert('Düzenlenecek kayıt bulunamadı!');
               }
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
      'idari_isler': 'İdari İşler',
      'kalite_kontrol': 'Kalite Kontrol',
      'kaynakhane': 'Kaynakhane',
      'kesim': 'Kesim',
      'mekanik_montaj': 'Mekanik Montaj',
      'satin_alma': 'Satın Alma',
      'satis': 'Satış',
      'ssh': 'SSH',
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

    // Default table for other types (highest-cost, monthly-records, part-analysis, unit-analysis)
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><Typography fontWeight="bold">Sıra</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Parça Kodu</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Maliyet Türü</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Birim</Typography></TableCell>
              <TableCell align="right"><Typography fontWeight="bold">Maliyet</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Tarih</Typography></TableCell>
              <TableCell align="center"><Typography fontWeight="bold">Durum</Typography></TableCell>
              <TableCell align="center"><Typography fontWeight="bold">İşlemler</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow 
                key={item.id || index}
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
                  <Typography fontWeight={item.parcaKodu ? 'bold' : 'normal'}>
                    {item.parcaKodu || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getMaliyetTuruLabel(item.maliyetTuru)}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Typography>
                    {formatProfessionalName(item.birim)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography 
                    variant="h6" 
                    color={index < 3 ? 'error.main' : 'text.primary'}
                    fontWeight="bold"
                  >
                    ₺{item.maliyet.toLocaleString('tr-TR')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(item.tarih).toLocaleDateString('tr-TR')}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={item.durum === 'aktif' ? 'Aktif' : 'Pasif'}
                    size="small"
                    color={item.durum === 'aktif' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {/* ✅ YENİ: Default Table Detay Görüntüleme Butonu */}
                    <Tooltip title="Detayları Görüntüle">
                      <IconButton 
                        size="small" 
                                                                          onClick={(e) => {
                          e.stopPropagation();
                          console.log('🔍 Detay görüntüleme:', item);
                          
                          if (handleViewDetails) {
                            console.log('✅ Props handleViewDetails kullanılıyor');
                            try {
                              handleViewDetails(item);
                            } catch (error) {
                              console.error('❌ Props handleViewDetails hatası:', error);
                              alert('Props handleViewDetails çağrısında hata oluştu: ' + error);
                            }
                          } else if ((window as any).handleViewDetails) {
                            console.log('✅ Global handleViewDetails kullanılıyor');
                            try {
                              (window as any).handleViewDetails(item);
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
                            // DOF/8D oluşturma parametreleri
                            const dofParams = {
                              sourceModule: 'qualityCost' as const,
                              recordId: item.id || `cost_${Date.now()}`,
                              recordData: item,
                              issueType: 'nonconformity' as const,
                              issueDescription: `Kalitesizlik Maliyeti Uygunsuzluğu - ${getMaliyetTuruLabel(item.maliyetTuru)} (₺${item.maliyet.toLocaleString('tr-TR')})`,
                              priority: (item.maliyet > 10000 ? 'high' : item.maliyet > 5000 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
                              affectedDepartment: formatProfessionalName(item.birim),
                              responsiblePerson: 'Kalite Sorumlusu'
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
                        title={dofCreated ? "Bu Kayıt İçin DÖF Zaten Oluşturulmuş" : "Bu Kayıt İçin DÖF/8D Oluştur"}
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
  };

  const summary = useMemo(() => {
    if (type === 'problematic-unit') {
      const totalCost = data.reduce((sum, item) => sum + item.total, 0);
      const totalRecords = data.reduce((sum, item) => sum + item.count, 0);
      return { totalCost, totalRecords, avgCost: totalCost / totalRecords };
    } else {
      const totalCost = data.reduce((sum, item) => sum + (item.maliyet || 0), 0);
      const totalRecords = data.length;
      return { totalCost, totalRecords, avgCost: totalCost / totalRecords };
    }
  }, [data, type]);



  return (
    <Box>
      {/* Summary Cards */}
      <Box sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                ₺{summary.totalCost.toLocaleString('tr-TR')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Maliyet
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {summary.totalRecords}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam Kayıt
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" color="warning.main">
                ₺{summary.avgCost.toLocaleString('tr-TR')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ortalama Maliyet
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>



      {/* Data Table */}
      <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
        {renderTableContent()}
      </Box>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Sayfa başına:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} / ${count !== -1 ? count : `${to} den fazla`}`
        }
      />
    </Box>
  );
};

// ✅ Context7: Full Data Management Component
  // ✅ Analytics hesaplama fonksiyonu herhangi data array'i ile
  const getAnalyticsFromData = (data: any[]) => {
    const birimler = Array.from(new Set(data.map(item => item.birim).filter(Boolean)));
    const araclar = Array.from(new Set(data.map(item => item.arac).filter(Boolean)));
    const maliyetTurleri = Array.from(new Set(data.map(item => item.maliyetTuru).filter(Boolean)));
    
    // ... diğer analytics hesaplamaları
    const totalCost = data.reduce((sum, item) => sum + item.maliyet, 0);
    const totalItems = data.length;
    const avgCost = totalCost / (totalItems || 1);
    
    console.log('🔄 Fresh Analytics:', { totalCost, totalItems });
    
    return {
      totalSummary: { totalCost, totalItems, avgCost },
      // diğer analytics
    };
  };

  const DataManagementComponent: React.FC<{ 
  onDataChange?: (analytics: any) => void,
  filteredData?: any[],
  onDataRefresh?: () => void
}> = ({ onDataChange, filteredData = [], onDataRefresh }) => {
  
  // ✅ PROFESYONEL: Gelişmiş Veri Kurtarma ve Otomatik Güvenlik Sistemi
  const [costData, setCostData] = useState<any[]>(() => {
    try {
      // Önce ana veriyi kontrol et
      const saved = localStorage.getItem('kys-cost-management-data');
      if (saved && saved !== '[]') {
        const parsedData = JSON.parse(saved);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          // Sample data kontrol sistemi
          const isSampleData = parsedData.length === 50 && 
            parsedData.every(item => item.parcaKodu?.startsWith('5001'));
          
          if (isSampleData) {
            console.log('⚠️ Sample data tespit edildi, backup kontrol ediliyor...');
            
            // Backup'tan gerçek veriyi kontrol et
            const backup = localStorage.getItem('kys-cost-management-data-backup');
            if (backup) {
              try {
                const backupData = JSON.parse(backup);
                if (backupData.data && Array.isArray(backupData.data) && 
                    backupData.data.length > 0 && backupData.data.length !== 50) {
                  console.log('🔄 Gerçek kullanıcı verisi backup\'tan geri yükleniyor...');
                  console.log('📊 Geri yüklenen kayıt sayısı:', backupData.data.length);
                  
                  // Backup verisini ana veriye geri yükle
                  localStorage.setItem('kys-cost-management-data', JSON.stringify(backupData.data));
                  return backupData.data;
                }
              } catch (backupError) {
                console.error('❌ Backup kontrol hatası:', backupError);
              }
            }
          }
          
          console.log('✅ Ana veriler yüklendi:', parsedData.length, 'kayıt');
          return parsedData;
        }
      }
      
      // Ana veri yoksa backup'tan geri yükle
      const backup = localStorage.getItem('kys-cost-management-data-backup');
      if (backup) {
        try {
          const backupData = JSON.parse(backup);
          if (backupData.data && Array.isArray(backupData.data) && backupData.data.length > 0) {
            console.log('🔄 Backup\'tan otomatik geri yükleme:', backupData.data.length, 'kayıt');
            console.log('📅 Backup tarihi:', backupData.timestamp);
            
            // Backup verisini ana veriye geri yükle
            localStorage.setItem('kys-cost-management-data', JSON.stringify(backupData.data));
            return backupData.data;
          }
        } catch (backupError) {
          console.error('❌ Backup verisi yüklenemedi:', backupError);
        }
      }
      
      console.log('ℹ️ Yeni kullanıcı - veri bulunmadı');
      return [];
    } catch (error) {
      console.error('❌ Veri yükleme hatası:', error);
      return [];
    }
  });
  // ✅ Context7: filteredData now comes from props (global filter)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  
  // ✅ YENİ: Detay görüntüleme dialog state'leri
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDetailEntry, setSelectedDetailEntry] = useState<any>(null);
  
  // ✅ Context7: Enhanced Form State with Unified Vehicle Tracking
  const [formData, setFormData] = useState({
    // Mevcut kalitesizlik maliyeti alanları
    maliyetTuru: '',
    birim: '',
    arac: '',
    parcaKodu: '', // ✅ NEW: Optional part code for analytics
    maliyet: 0,
    sure: 0, // Dynamic field for time-based costs
    birimMaliyet: 0, // From settings
    agirlik: 0, // Dynamic field for weight-based costs (kg)
    kgMaliyet: 0, // From settings (₺/kg)
    parcaMaliyeti: 0, // ✅ Context7: Part cost for net loss calculation
    tarih: new Date().toISOString().split('T')[0],
    durum: 'aktif',
    
    // ✅ YENİ: Araç kategorisi ve model sistemi
    aracKategorisi: '' as VehicleCategory | '',
    aracModeli: '' as VehicleModel | '',
    atikTuru: '' as WasteType | '',
    miktar: 0, // adet cinsinden
    unit: 'adet' as 'adet' | 'kg' | 'lt' | 'ton',
    category: '', // Motor Parçaları, Şase Elemanları, vs.
    aciklama: '', // Detaylı açıklama
    
    // ✅ YENİ: Fire ve Hurda için alış/satış fiyatları
    hurdaSatisFiyati: 0, // Hurda satış fiyatı ₺/kg
    fireGeriKazanim: 0,  // Fire geri kazanım değeri ₺/kg
    
    // ✅ YENİ: Malzeme bazlı maliyet hesaplama
    malzemeTuru: '' as MaterialType | '',
    
    // ✅ YENİ: İşçilik ve genel gider toggle sistemi
    includeLabor: false,
    
    // ✅ YENİ: Yeniden işlem maliyeti için etkilenen diğer birimler
    ekBirimMaliyetleri: []
  });

  // ✅ Context7: filters now comes from global props (no local filter state needed)

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ✅ Context7: Memoized Arrays to prevent infinite loops
  const maliyetTurleri = useMemo(() => [
    { value: 'hurda', label: 'Hurda Maliyeti', requiresTime: false, requiresWeight: false, requiresMaterial: true },
    { value: 'yeniden_islem', label: 'Yeniden İşlem Maliyeti', requiresTime: true, timeUnit: 'dakika', requiresWeight: false, requiresMaterial: false },
    { value: 'fire', label: 'Fire Maliyeti', requiresTime: false, requiresWeight: true, weightUnit: 'kg', requiresMaterial: true }, // NEW: Weight-based
    { value: 'garanti', label: 'Garanti Maliyeti', requiresTime: false, requiresWeight: false, requiresMaterial: false },
    { value: 'iade', label: 'İade Maliyeti', requiresTime: false, requiresWeight: false, requiresMaterial: false },
    { value: 'sikayet', label: 'Şikayet Maliyeti', requiresTime: false, requiresWeight: false, requiresMaterial: false },
    { value: 'onleme', label: 'Önleme Maliyeti', requiresTime: true, timeUnit: 'saat', requiresWeight: false, requiresMaterial: false }
  ], []);

  // ✅ Context7: Memoized Arrays to prevent infinite loops
  const birimler = useMemo(() => [
    { value: 'arge', label: 'Ar-Ge' },
    { value: 'boyahane', label: 'Boyahane' },
    { value: 'bukum', label: 'Büküm' },
    { value: 'depo', label: 'Depo' },
    { value: 'elektrikhane', label: 'Elektrikhane' },
    { value: 'idari_isler', label: 'İdari İşler' },
    { value: 'kalite_kontrol', label: 'Kalite Kontrol' },
    { value: 'kaynakhane', label: 'Kaynakhane' },
    { value: 'kesim', label: 'Kesim' },
    { value: 'mekanik_montaj', label: 'Mekanik Montaj' },
    { value: 'satin_alma', label: 'Satın Alma' },
    { value: 'satis', label: 'Satış' },
    { value: 'ssh', label: 'SSH' },
    { value: 'uretim_planlama', label: 'Üretim Planlama' }
  ], []);

  // ✅ YENİ: Araç kategorileri listesi
  const aracKategorileri = useMemo(() => [
    { value: 'Kompakt Araçlar', label: 'Kompakt Araçlar' },
    { value: 'Araç Üstü Vakumlu', label: 'Araç Üstü Vakumlu' },
    { value: 'Çekilir Tip Mekanik Süpürgeler', label: 'Çekilir Tip Mekanik Süpürgeler' },
    { value: 'Kompost Makinesi', label: 'Kompost Makinesi' },
    { value: 'Çay Toplama Makinesi', label: 'Çay Toplama Makinesi' },
    { value: 'Rusya Motor Odası', label: 'Rusya Motor Odası' },
    { value: 'HSCK', label: 'HSCK' },
    { value: 'Genel', label: 'Genel (Araç Spesifik Olmayan)' }
  ], []);

  // ✅ Context7: Memoized Arrays to prevent infinite loops
  const araclar = useMemo(() => [
    { value: 'fth240', label: 'FTH-240' },
    { value: 'celik2000', label: 'Çelik-2000' },
    { value: 'aga2100', label: 'Aga2100' },
    { value: 'aga3000', label: 'Aga3000' },
    { value: 'aga6000', label: 'Aga6000' },
    { value: 'kompost_makinesi', label: 'Kompost Makinesi' },
    { value: 'cay_toplama_makinesi', label: 'Çay Toplama Makinesi' },
    { value: 'kdm35', label: 'KDM 35' },
    { value: 'kdm70', label: 'KDM 70' },
    { value: 'kdm80', label: 'KDM 80' },
    { value: 'rusya_motor_odasi', label: 'Rusya Motor Odası' },
    { value: 'ural', label: 'Ural' },
    { value: 'hsck', label: 'HSCK' }
  ], []);

  // ✅ DEBUG: Filtrelenmiş veri debug'u
  useEffect(() => {
    console.log('🔍 DataManagementComponent - filteredData prop güncellemesi:', {
      filteredDataLength: filteredData.length,
      costDataLength: costData.length,
      filteredDataSample: filteredData.slice(0, 3),
      costDataSample: costData.slice(0, 3),
      usingFilteredData: filteredData.length > 0,
      timestamp: new Date().toISOString()
    });
  }, [filteredData, costData]);

  // ✅ YENİ: Kategoriye göre araç modelleri filtreleme
  const getModelsForCategory = useCallback((category: VehicleCategory) => {
    const models = VEHICLE_CATEGORIES[category] || [];
    return models.map(model => {
      const aracItem = araclar.find(a => a.label === model);
      return aracItem || { value: model.toLowerCase().replace(/[\s\-]/g, '_'), label: model };
    });
  }, [araclar]);

  // ✅ Context7: Sample Data Generation with Real Part Codes
  const generateSampleData = useCallback(() => {
    const sampleEntries = [];
    const maliyetTurleriArray = maliyetTurleri.map(mt => mt.value);
    const birimlerArray = birimler.map(b => b.value);
    const araclarArray = araclar.map(a => a.value);
    
    // ✅ Context7: Realistic Part Code Pool - 5001 prefix + 5 variable digits
    const partCodes = [
      '500123845', '500156789', '500134567', '500145678', '500167890', '500178901',
      '500189012', '500134567', '500145678', '500123845', '500156789', '500167890', // Duplicates for aggregation testing
      '500190123', '500101234', '500112345', '500123456', '500134567', '500145678', // More duplicates
      '500156789', '500167890', '500178901', '500189012', '500190123', '500101234'  // Strategic repeats
    ];

    for (let i = 1; i <= 50; i++) {
      // 70% of entries have part codes (realistic scenario)
      const hasPartCode = Math.random() > 0.3;
      
      sampleEntries.push({
        id: i,
        maliyetTuru: maliyetTurleriArray[Math.floor(Math.random() * maliyetTurleriArray.length)],
        birim: birimlerArray[Math.floor(Math.random() * birimlerArray.length)],
        arac: araclarArray[Math.floor(Math.random() * araclarArray.length)],
        maliyet: Math.floor(Math.random() * 50000) + 5000,
        parcaKodu: hasPartCode ? partCodes[Math.floor(Math.random() * partCodes.length)] : '',
        tarih: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
          .toISOString().split('T')[0],
        durum: Math.random() > 0.1 ? 'aktif' : 'pasif',
        olusturmaTarihi: new Date().toISOString()
      });
    }
    return sampleEntries;
  }, [maliyetTurleri, birimler, araclar]);

  // ✅ YENİ: Departman İsimleri Migration Fonksiyonu
  const migrateDepartmentNames = useCallback((data: any[]) => {
    console.log('🔄 Departman isimleri migration başlatılıyor...');
    
    const departmentMigrationMap: { [key: string]: string } = {
      'Idari_isler': 'idari_isler',
      'İdari_isler': 'idari_isler', 
      'Idari isler': 'idari_isler',
      'İdari isler': 'idari_isler',
      'Satis_sonrasi': 'ssh',
      'satis_sonrasi': 'ssh',
      'Satis sonrasi': 'ssh',
      'satış_sonrası': 'ssh',
      'satis_sonrasi_hizmetler': 'ssh',
      'elektrikhane': 'elektrikhane',
      'Elektrikhane': 'elektrikhane',
      'bukum': 'bukum',
      'Bukum': 'bukum',
      'Büküm': 'bukum'
    };

    let migrationCount = 0;
    
    const migratedData = data.map(item => {
      if (item.birim && departmentMigrationMap[item.birim]) {
        console.log(`📝 Migration: "${item.birim}" → "${departmentMigrationMap[item.birim]}"`);
        migrationCount++;
        return {
          ...item,
          birim: departmentMigrationMap[item.birim]
        };
      }
      return item;
    });

    if (migrationCount > 0) {
      console.log(`✅ Departman isimleri migration tamamlandı: ${migrationCount} kayıt güncellendi`);
      // Migration sonrasında verileri localStorage'a kaydet
      localStorage.setItem('kys-cost-management-data', JSON.stringify(migratedData));
    } else {
      console.log('ℹ️ Migration gerekmedi - tüm departman isimleri zaten doğru');
    }

    return migratedData;
  }, []);

  // ✅ YENİ: Manual Migration Tetikleyici
  const fixDepartmentNamesNow = useCallback(() => {
    console.log('🔧 Manual departman isimleri düzeltme başlatılıyor...');
    
    try {
      const existingData = localStorage.getItem('kys-cost-management-data');
      if (existingData) {
        const parsedData = JSON.parse(existingData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          const migratedData = migrateDepartmentNames(parsedData);
          setCostData(migratedData);
          
          // Executive Dashboard verilerini de temizle ve yenile
          window.dispatchEvent(new CustomEvent('costDataUpdated'));
          onDataRefresh?.();
          
          console.log('✅ Manuel departman isimleri düzeltme tamamlandı!');
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Manuel migration hatası:', error);
      return false;
    }
  }, [migrateDepartmentNames, onDataRefresh]);

  // ✅ YENİ: LocalStorage Temizleme ve Migration
  const forceCleanupAndMigration = useCallback(() => {
    console.log('🧹 Force cleanup ve migration başlatılıyor...');
    
    // Tüm migration flag'lerini temizle
    localStorage.removeItem('department-names-migration-applied');
    localStorage.removeItem('department-names-migration-applied-v2');
    
    // Migration'ı zorla çalıştır
    const success = fixDepartmentNamesNow();
    
    if (success) {
      localStorage.setItem('department-names-migration-applied-v2', 'true');
      console.log('✅ Force cleanup ve migration tamamlandı!');
    }
    
    return success;
  }, [fixDepartmentNamesNow]);

  // ✅ Başlangıçta otomatik migration çalıştır (V2)
  useEffect(() => {
    const shouldAutoFix = localStorage.getItem('department-names-migration-applied-v2');
    if (!shouldAutoFix) {
      console.log('🔄 V2 Migration: Departman isimleri migration otomatik uygulanıyor...');
      forceCleanupAndMigration();
    }
  }, [forceCleanupAndMigration]);

  // ✅ VERİ KAYBI FİXİ: Sample data generation sadece component ilk yüklendiğinde çalışsın
  useEffect(() => {
    // VERİ GÜVENLİĞİ: localStorage'dan mevcut veriyi kontrol et
    const existingData = localStorage.getItem('kys-cost-management-data');
    
    if (!existingData || existingData === '[]') {
      // Sadece localStorage boş ise sample data oluştur
      console.log('📊 localStorage boş - Sample data oluşturuluyor...');
      const data = generateSampleData();
      const sortedData = data.sort((a, b) => b.id - a.id);
      setCostData(sortedData);
      localStorage.setItem('kys-cost-management-data', JSON.stringify(sortedData));
    } else {
      // Mevcut veriyi yükle ve sırala
      try {
        const parsedData = JSON.parse(existingData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          console.log('📂 Mevcut veriler yüklendi:', parsedData.length, 'kayıt');
          
          // ✅ YENİ: Migration uygula
          const migratedData = migrateDepartmentNames(parsedData);
          const sortedData = migratedData.sort((a, b) => b.id - a.id);
          setCostData(sortedData);
        } else {
          // Geçersiz veri varsa sample data oluştur
          console.log('⚠️ Geçersiz veri tespit edildi - Sample data oluşturuluyor...');
          const data = generateSampleData();
          const sortedData = data.sort((a, b) => b.id - a.id);
          setCostData(sortedData);
          localStorage.setItem('kys-cost-management-data', JSON.stringify(sortedData));
    }
      } catch (error) {
        console.error('❌ Veri yükleme hatası:', error);
        // Hatalı veriyi temizle ve sample data oluştur
        localStorage.removeItem('kys-cost-management-data');
        const data = generateSampleData();
        const sortedData = data.sort((a, b) => b.id - a.id);
        setCostData(sortedData);
        localStorage.setItem('kys-cost-management-data', JSON.stringify(sortedData));
      }
    }
  }, [generateSampleData, migrateDepartmentNames]); // ✅ Migration dependency eklendi

  // ✅ VERİ GÜVENLİĞİ: sadece kullanıcı aksiyonlarında localStorage'a kaydet
  useEffect(() => {
    if (costData.length > 0) {
      try {
        // VERİ KORUMA: Önce mevcut localStorage verisini kontrol et
        const currentData = localStorage.getItem('kys-cost-management-data');
        const newDataString = JSON.stringify(costData);
        
        // Sadece veri gerçekten değiştiyse kaydet (gereksiz kaydetmeleri önle)
        if (currentData !== newDataString) {
          console.log('💾 Veriler localStorage\'a kaydediliyor...', costData.length, 'kayıt');
          localStorage.setItem('kys-cost-management-data', newDataString);
          
          // VERİ YEDEKLEME: Kritik verileri backup anahtarına da kaydet
          const timestamp = new Date().toISOString();
          localStorage.setItem('kys-cost-management-data-backup', JSON.stringify({
            data: costData,
            timestamp,
            version: '2.0'
          }));
        }
      } catch (error) {
        console.error('❌ localStorage kaydetme hatası:', error);
      }
    }
  }, [costData]);

  // ✅ Context7: Memoized CRUD Operations
  const handleAdd = useCallback(() => {
    setEditingEntry(null);
    setFormData({
      // Mevcut kalitesizlik maliyeti alanları
      maliyetTuru: '',
      birim: '',
      arac: '',
      parcaKodu: '', // ✅ Context7: Include new field
    
    // ✅ YENİ: Fire ve Hurda için alış/satış fiyatları
    hurdaSatisFiyati: 0,
    fireGeriKazanim: 0,
      maliyet: 0,
      sure: 0,
      birimMaliyet: 0,
      agirlik: 0,
      kgMaliyet: 0,
      parcaMaliyeti: 0, // ✅ Context7: Part cost field
      tarih: new Date().toISOString().split('T')[0],
      durum: 'aktif',
      
      // ✅ YENİ: Araç kategorisi ve model sistemi
      aracKategorisi: '' as VehicleCategory | '',
      aracModeli: '' as VehicleModel | '',
      atikTuru: '' as WasteType | '',
      miktar: 0,
      unit: 'adet' as 'adet' | 'kg' | 'lt' | 'ton',
      category: '',
      aciklama: '',
      
      // ✅ YENİ: Malzeme bazlı maliyet hesaplama
      malzemeTuru: '' as MaterialType | '',
      
      // ✅ YENİ: İşçilik ve genel gider toggle sistemi
      includeLabor: false,
    
    // ✅ YENİ: Yeniden işlem maliyeti için etkilenen diğer birimler
    ekBirimMaliyetleri: []
  });

    setDialogOpen(true);
  }, []);

  // ✅ Context7: FAB Event Listener with useCallback
  useEffect(() => {
    const handleAddNewEntry = () => {
      handleAdd();
    };

    window.addEventListener('addNewCostEntry', handleAddNewEntry);
    return () => {
      window.removeEventListener('addNewCostEntry', handleAddNewEntry);
    };
  }, [handleAdd]);

  // ✅ Context7: Local filtering removed - using global filteredData prop instead

  // ✅ Context7: Helper Functions
  const getDisplayName = (value: string, array: any[]) => {
    const item = array.find(item => item.value === value);
    return item ? item.label : value;
  };

  // ✅ Context7: Dynamic Form Helpers with Auto-fetch
  const getSelectedMaliyetTuruInfo = () => {
    return maliyetTurleri.find(mt => mt.value === formData.maliyetTuru);
  };

  // ✅ YENİ: Malzeme fiyatlarını localStorage'dan yükle
  const [materialPricings, setMaterialPricings] = useState<MaterialPricing[]>([]);

  useEffect(() => {
    const savedPricings = localStorage.getItem('material-pricings');
    if (savedPricings) {
      try {
        const parsedPricings = JSON.parse(savedPricings);
        setMaterialPricings(parsedPricings);
      } catch (error) {
        console.error('Malzeme fiyatları yüklenirken hata:', error);
      }
    }
  }, []);

  // ✅ YENİ: Malzeme seçildiğinde otomatik fiyat çekme
  useEffect(() => {
    if (formData.malzemeTuru && materialPricings.length > 0) {
      const selectedMaterial = materialPricings.find(
        mat => mat.malzemeTuru === formData.malzemeTuru && mat.aktif
      );
      
      if (selectedMaterial) {
        // Fire maliyeti için fire geri kazanım değerini hesapla
        // Fire maliyeti için geri kazanım değerini hesapla (alış fiyatı × geri kazanım oranı)
        if (formData.maliyetTuru === 'fire') {
          const fireGeriKazanimDegeri = selectedMaterial.alisKgFiyati * (selectedMaterial.fireGeriKazanimOrani / 100);
          setFormData(prev => ({ 
            ...prev, 
            fireGeriKazanim: fireGeriKazanimDegeri,
            malzemeAlisFiyati: selectedMaterial.alisKgFiyati,
            malzemeSatisFiyati: selectedMaterial.satisKgFiyati
          }));
        }
        
        // Hurda maliyeti için hurda satış fiyatını hesapla (alış fiyatı × geri kazanım oranı)
        if (formData.maliyetTuru === 'hurda') {
          const hurdaSatisDegeri = selectedMaterial.alisKgFiyati * (selectedMaterial.hurdaGeriKazanimOrani / 100);
          setFormData(prev => ({ 
            ...prev, 
            hurdaSatisFiyati: hurdaSatisDegeri,
            malzemeAlisFiyati: selectedMaterial.alisKgFiyati,
            malzemeSatisFiyati: selectedMaterial.satisKgFiyati
          }));
        }
      }
    }
  }, [formData.malzemeTuru, formData.maliyetTuru, materialPricings]);

  // ✅ Context7: Auto-fetch Logic with useEffect for Real-time Updates and Unit Conversion
  useEffect(() => {
    const maliyetTuruInfo = getSelectedMaliyetTuruInfo();
    
    // ✅ YENİ: Birim Maliyet Ayarları Entegrasyonu
    if (maliyetTuruInfo?.requiresTime && formData.birim) {
      // Önce yeni birim maliyet ayarlarından al
      if (typeof window !== 'undefined' && (window as any).getUnitCost) {
        const timeUnit = maliyetTuruInfo.timeUnit || 'dakika';
        const unitCost = (window as any).getUnitCost(formData.birim, timeUnit);
        
        if (unitCost > 0 && Math.abs(unitCost - formData.birimMaliyet) > 0.01) {
          setFormData(prev => ({ ...prev, birimMaliyet: unitCost }));
        }
      } else {
        // ✅ Fallback: Eski departman ayarları sistemi
      const departmanSettings = [
          { departman: 'arge', saatlikMaliyet: 35.00 },
          { departman: 'boyahane', saatlikMaliyet: 18.00 },
          { departman: 'bukum', saatlikMaliyet: 22.00 },
          { departman: 'depo', saatlikMaliyet: 16.00 },
          { departman: 'elektrikhane', saatlikMaliyet: 28.00 },
          { departman: 'idari_isler', saatlikMaliyet: 24.00 },
          { departman: 'kalite_kontrol', saatlikMaliyet: 27.00 },
          { departman: 'kaynakhane', saatlikMaliyet: 30.00 },
          { departman: 'kesim', saatlikMaliyet: 20.00 },
          { departman: 'mekanik_montaj', saatlikMaliyet: 25.00 },
          { departman: 'satin_alma', saatlikMaliyet: 22.00 },
          { departman: 'satis', saatlikMaliyet: 26.00 },
          { departman: 'ssh', saatlikMaliyet: 24.00 },
          { departman: 'uretim_planlama', saatlikMaliyet: 28.00 }
      ];
      
      const setting = departmanSettings.find(d => d.departman === formData.birim);
      if (setting) {
        // ✅ Context7: Proper Unit Conversion Logic
        let convertedRate = setting.saatlikMaliyet;
        
        // Convert hourly rate to required time unit
        if (maliyetTuruInfo.timeUnit === 'dakika') {
            convertedRate = Math.round((setting.saatlikMaliyet / 60) * 1000) / 1000; // Convert hour to minute with precision
        }
        
        if (Math.abs(convertedRate - formData.birimMaliyet) > 0.01) {
          setFormData(prev => ({ ...prev, birimMaliyet: convertedRate }));
          }
        }
      }
    }
    
    // Auto-fetch weight-based cost - SADECE GENEL ATIK MALİYETLERİ
    if (maliyetTuruInfo?.requiresWeight) {
      const agirlikSettings = [
        { maliyetTuru: 'metal_kaybi', kgMaliyet: 50 },
        { maliyetTuru: 'atik', kgMaliyet: 15 },
        { maliyetTuru: 'geri_donusum', kgMaliyet: 25 }
      ];
      
      const setting = agirlikSettings.find(a => a.maliyetTuru === formData.maliyetTuru);
      if (setting && setting.kgMaliyet !== formData.kgMaliyet) {
        setFormData(prev => ({ ...prev, kgMaliyet: setting.kgMaliyet }));
      }
    }
  }, [formData.maliyetTuru, formData.birim]); // ✅ Context7: Proper dependency array

  // ✅ YENİ: Parça maliyeti tahmini fonksiyonu
  const estimatePartCostFromMaterial = useCallback((
    malzemeTuru: MaterialType, 
    agirlik: number, 
    miktar: number = 1
  ): number => {
    if (!malzemeTuru || agirlik <= 0) return 0;
    
    const selectedMaterial = materialPricings.find(
      mat => mat.malzemeTuru === malzemeTuru && mat.aktif
    );
    
    if (selectedMaterial) {
      // Basit tahmini: (Alış fiyatı × ağırlık) + %30 işçilik/genel giderler
      const malzemeMaliyeti = selectedMaterial.alisKgFiyati * agirlik;
      const iscilikPayi = malzemeMaliyeti * 0.30; // %30 işçilik tahmini
      const tahminiParcaMaliyeti = malzemeMaliyeti + iscilikPayi;
      
      return miktar > 1 ? tahminiParcaMaliyeti / miktar : tahminiParcaMaliyeti;
    }
    
    return 0;
  }, [materialPricings]);

  // ✅ GELİŞTİRİLMİŞ: calculateDynamicCost - Parça maliyeti tahmini ile
  const calculateDynamicCost = useCallback(() => {
    const maliyetTuruInfo = getSelectedMaliyetTuruInfo();
    
    // Time-based calculation (Departmental hourly cost)
    if (maliyetTuruInfo?.requiresTime && formData.sure > 0 && formData.birimMaliyet > 0) {
      return formData.sure * formData.birimMaliyet;
    }
    
    // Hurda maliyeti hesabı 
    if (formData.maliyetTuru === 'hurda') {
      // ADET bazlı hurda hesaplaması
      if (formData.unit === 'adet' && formData.miktar > 0) {
        let birimMaliyet = formData.birimMaliyet || 0;
        
        // ✅ YENİ: Parça maliyeti bilinmiyorsa malzeme türünden tahmin et
        if (birimMaliyet === 0 && formData.malzemeTuru && formData.agirlik > 0) {
          birimMaliyet = estimatePartCostFromMaterial(
            formData.malzemeTuru, 
            formData.agirlik, 
            1
          );
          console.log(`🔧 TAHMINI PARÇA MALİYETİ: ${formData.malzemeTuru} - ${formData.agirlik}kg = ₺${birimMaliyet.toFixed(2)}`);
        }
        
        let toplamMaliyet = formData.miktar * birimMaliyet;
        
        // İşçilik ve genel gider ekle (%30) - sadece malzeme maliyetine
        if (formData.includeLabor) {
          const laborCost = toplamMaliyet * 0.30;
          toplamMaliyet += laborCost;
        }
        
        const toplamAgirlık = formData.miktar * (formData.agirlik || 0);
        
        // Hurda satış fiyatını malzeme seçiminden veya manuel girişten al
        let hurdaSatisFiyati = formData.kgMaliyet || 0;
        if (formData.malzemeTuru) {
          const selectedMaterial = materialPricings.find(
            mat => mat.malzemeTuru === formData.malzemeTuru && mat.aktif
          );
          if (selectedMaterial) {
            hurdaSatisFiyati = selectedMaterial.satisKgFiyati;
          }
        }
        
        const hurdaSatisGeliri = toplamAgirlık * hurdaSatisFiyati;
        return Math.max(0, toplamMaliyet - hurdaSatisGeliri);
      }
      
      // KG bazlı hurda hesaplaması
      if (formData.unit === 'kg' && formData.agirlik > 0) {
        // Malzeme bazlı hesaplama
        if (formData.malzemeTuru) {
          const selectedMaterial = materialPricings.find(
            mat => mat.malzemeTuru === formData.malzemeTuru && mat.aktif
          );
          
          if (selectedMaterial) {
            // Basit formül: (Alış fiyatı - Satış fiyatı) × Ağırlık
            const fiyatFarki = selectedMaterial.alisKgFiyati - selectedMaterial.satisKgFiyati;
            return Math.max(0, formData.agirlik * fiyatFarki);
          }
        }
        
        // ✅ FIX: Doğru hurda formülü - Parça Maliyeti - (Ağırlık × Hurda Satış Fiyatı)
        if (formData.parcaMaliyeti && formData.parcaMaliyeti > 0) {
          const hurdaSatisFiyati = formData.kgMaliyet || 45;
          const hurdaSatisGeliri = formData.agirlik * hurdaSatisFiyati;
          const netHurdaZarari = Math.max(0, formData.parcaMaliyeti - hurdaSatisGeliri);
          return netHurdaZarari;
        } 
        
        // ✅ YENİ: Fallback ile malzeme türünden tahmini parça maliyeti
        if (formData.malzemeTuru && formData.agirlik > 0) {
          const tahminiParcaMaliyeti = estimatePartCostFromMaterial(
            formData.malzemeTuru, 
            formData.agirlik, 
            1
          );
          
          if (tahminiParcaMaliyeti > 0) {
            const hurdaSatisFiyati = formData.kgMaliyet || 45;
            const hurdaSatisGeliri = formData.agirlik * hurdaSatisFiyati;
            return Math.max(0, tahminiParcaMaliyeti - hurdaSatisGeliri);
        }
        }
        
        // Son fallback: Sadece ağırlık × kg maliyet (parça maliyeti yoksa)
        return formData.agirlik * (formData.kgMaliyet || 50);
      }
      
      return 0; // Herhangi bir miktar girilmemişse
    }

    // Fire maliyeti hesabı - Basit: (Alış fiyatı - Satış fiyatı) × Ağırlık + İsteğe bağlı %30 işçilik
    if (formData.maliyetTuru === 'fire' && formData.agirlik > 0) {
      let baseMaliyet = 0;
      
      // Malzeme bazlı hesaplama
      if (formData.malzemeTuru) {
        const selectedMaterial = materialPricings.find(
          mat => mat.malzemeTuru === formData.malzemeTuru && mat.aktif
        );
        
        if (selectedMaterial) {
          // Basit formül: (Alış fiyatı - Satış fiyatı) × Ağırlık
          const fiyatFarki = selectedMaterial.alisKgFiyati - (selectedMaterial.satisKgFiyati || 0);
          baseMaliyet = formData.agirlik * fiyatFarki;
        }
      } else {
      // Fallback: Manuel fiyat girişi
      if (formData.parcaMaliyeti && formData.parcaMaliyeti > 0) {
        const fireGeriKazanim = formData.agirlik * (formData.fireGeriKazanim || 0);
          baseMaliyet = Math.max(0, formData.parcaMaliyeti - fireGeriKazanim);
      } else {
          baseMaliyet = formData.agirlik * (formData.kgMaliyet || 50);
      }
      }
      
      // İşçilik ve genel gider ekle (%30)
      const laborCost = formData.includeLabor ? baseMaliyet * 0.30 : 0;
      return Math.max(0, baseMaliyet + laborCost);
    }
    
    // Weight-based calculation (Fire, etc.)
    if (maliyetTuruInfo?.requiresWeight && formData.agirlik > 0 && formData.kgMaliyet > 0) {
      return formData.agirlik * formData.kgMaliyet;
    }
    
    return formData.maliyet;
  }, [formData, getSelectedMaliyetTuruInfo, materialPricings, estimatePartCostFromMaterial]);

  const getMaliyetTuruColor = (maliyetTuru: string) => {
    const colorMap: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
      hurda: 'error',
      yeniden_islem: 'warning',
      fire: 'error',
      garanti: 'warning',
      iade: 'error',
      sikayet: 'warning',
      onleme: 'success'
    };
    return colorMap[maliyetTuru] || 'info';
  };

  // ✅ Context7: CRUD Operations

  const handleEdit = useCallback((entry: any) => {
    setEditingEntry(entry);
    setFormData({
      // Mevcut kalitesizlik maliyeti alanları
      maliyetTuru: entry.maliyetTuru,
      birim: entry.birim,
      arac: entry.arac,
      parcaKodu: entry.parcaKodu || '', // ✅ Context7: Include part code from entry
      maliyet: entry.maliyet,
      sure: entry.sure || 0,
      birimMaliyet: entry.birimMaliyet || 0,
      agirlik: entry.agirlik || 0,
      kgMaliyet: entry.kgMaliyet || 0,
      parcaMaliyeti: entry.parcaMaliyeti || 0, // ✅ Context7: Part cost from entry
      tarih: entry.tarih,
      durum: entry.durum,
      
      // ✅ YENİ: Araç bazlı tracking alanları
      aracKategorisi: entry.aracKategorisi || MODEL_TO_CATEGORY[entry.aracModeli] || '' as VehicleCategory | '',
      aracModeli: entry.aracModeli || '' as VehicleModel | '',
      atikTuru: entry.atikTuru || '' as WasteType | '',
      miktar: entry.miktar || 0,
      unit: entry.unit || (entry.agirlik > 0 ? 'kg' : 'adet') as 'adet' | 'kg' | 'lt' | 'ton', // Ağırlık varsa kg, yoksa adet
      category: entry.category || '',
      aciklama: entry.aciklama || '',
      
      // ✅ YENİ: Fire ve Hurda için alış/satış fiyatları
      hurdaSatisFiyati: entry.hurdaSatisFiyati || 0,
      fireGeriKazanim: entry.fireGeriKazanim || 0,
      
      // ✅ YENİ: Malzeme bazlı maliyet hesaplama
      malzemeTuru: entry.malzemeTuru || '' as MaterialType | '',
      
      // ✅ YENİ: İşçilik ve genel gider toggle sistemi
      includeLabor: entry.includeLabor || false,
      
      // ✅ YENİ: Etkilenen diğer birimler
      ekBirimMaliyetleri: entry.ekBirimMaliyetleri || [],    });
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    const calculatedCost = calculateDynamicCost();
    // 🔧 ETKİLENEN BİRİMLER MALİYETİ: Etkilenen diğer birimlerin maliyetini de dahil et
    const ekBirimlerToplamMaliyet = (formData.ekBirimMaliyetleri || []).reduce((sum: number, eb: any) => sum + (eb.maliyet || 0), 0);
    // 🔧 GÜVENLİ MALİYET HESAPLAMA: Temel maliyet + etkilenen birimler maliyeti
    const baseCost = calculatedCost > 0 ? calculatedCost : formData.maliyet || 0;
    const finalCost = baseCost + ekBirimlerToplamMaliyet;
    const finalFormData = {
      ...formData,
      maliyet: finalCost, // Use calculated cost + affected departments cost
    };

    if (editingEntry) {
      // Update existing and maintain newest-first order
      const updatedData = costData.map(item => 
        item.id === editingEntry.id 
          ? { ...item, ...finalFormData, guncellemeTarihi: new Date().toISOString() }
          : item
      );
      // Ensure newest-first order is maintained after update
      const sortedUpdatedData = updatedData.sort((a, b) => b.id - a.id);
      setCostData(sortedUpdatedData);
      
      // ✅ IMMEDIATE localStorage UPDATE: Anında localStorage'a kaydet
      localStorage.setItem('kys-cost-management-data', JSON.stringify(sortedUpdatedData));
      
      // ✅ REAL-TIME TRIGGER: Ana component'te globalFilteredData yeniden hesaplansın
      onDataRefresh?.();
      
      // ✅ ARAÇ BAZLI TAKİP SENKRONIZASYON FİXİ: Araç kartlarını güncelle
      window.dispatchEvent(new CustomEvent('costDataUpdated'));
      
      // ✅ REAL-TIME ANALYTICS UPDATE: Analytics yeniden hesaplanacak (useEffect ile)
      setTimeout(() => {
        const freshAnalytics = getAnalyticsFromData(sortedUpdatedData);
        onDataChange?.(freshAnalytics);
      }, 100);
    } else {
      // ✅ Context7: Add new entry at the beginning (prepend) for newest-first order
      const newEntry = {
        id: Math.max(...costData.map(d => d.id), 0) + 1,
        ...finalFormData,
        olusturmaTarihi: new Date().toISOString()
      };
      // Prepend new entry to beginning of array using spread syntax
      const newData = [newEntry, ...costData];
      setCostData(newData);
      
      // ✅ IMMEDIATE localStorage UPDATE: Anında localStorage'a kaydet
      localStorage.setItem('kys-cost-management-data', JSON.stringify(newData));
      
      // ✅ REAL-TIME TRIGGER: Ana component'te globalFilteredData yeniden hesaplansın
      onDataRefresh?.();
      
      // ✅ ARAÇ BAZLI TAKİP SENKRONIZASYON FİXİ: Araç kartlarını güncelle
      window.dispatchEvent(new CustomEvent('costDataUpdated'));
      
      // ✅ REAL-TIME ANALYTICS UPDATE: Analytics yeniden hesaplanacak (useEffect ile)  
      setTimeout(() => {
        const freshAnalytics = getAnalyticsFromData(newData);
        onDataChange?.(freshAnalytics);
      }, 100);
    }
    setDialogOpen(false);
  }, [editingEntry, formData, costData, calculateDynamicCost]);

  const handleDelete = useCallback((id: number) => {
    console.log('🗑️ Silme işlemi başlatıldı - ID:', id);
    const entry = costData.find(item => item.id === id);
    console.log('🔍 Bulunan kayıt:', entry);
    
    if (!entry) {
      console.error('❌ Kayıt bulunamadı - ID:', id);
      alert('HATA: Silinecek kayıt bulunamadı!');
      return;
    }
    
    setSelectedEntry(entry);
    setDeleteConfirmOpen(true);
    console.log('✅ Silme onay dialog açıldı');
  }, [costData]);

  const confirmDelete = useCallback(() => {
    console.log('🗑️ Silme onaylandı - Kayıt:', selectedEntry);
    
    if (selectedEntry) {
      const originalLength = costData.length;
      const updatedData = costData.filter(item => item.id !== selectedEntry.id);
      const newLength = updatedData.length;
      
      console.log(`📊 Veri güncellendi: ${originalLength} → ${newLength} (${originalLength - newLength} kayıt silindi)`);
      
      setCostData(updatedData);
      setDeleteConfirmOpen(false);
      setSelectedEntry(null);
      
      // ✅ IMMEDIATE localStorage UPDATE: Anında localStorage'a kaydet
      localStorage.setItem('kys-cost-management-data', JSON.stringify(updatedData));
      
      // ✅ REAL-TIME TRIGGER: Ana component'te globalFilteredData yeniden hesaplansın
      onDataRefresh?.();
      
      // ✅ ARAÇ BAZLI TAKİP SENKRONIZASYON FİXİ: Araç kartlarını güncelle
      window.dispatchEvent(new CustomEvent('costDataUpdated'));
      
      // ✅ REAL-TIME ANALYTICS UPDATE: Analytics yeniden hesaplanacak (useEffect ile)  
      setTimeout(() => {
        const freshAnalytics = getAnalyticsFromData(updatedData);
        onDataChange?.(freshAnalytics);
      }, 100);
      
      console.log('✅ Silme işlemi başarıyla tamamlandı');
    } else {
      console.error('❌ selectedEntry null - silme işlemi iptal edildi');
      alert('HATA: Seçilen kayıt bulunamadı!');
    }
  }, [selectedEntry, costData, onDataRefresh, onDataChange]);

  // ✅ EXECUTIVE DASHBOARD INTEGRATION: Global handleEdit fonksiyonu (handleEdit tanımlandıktan sonra)
  useEffect(() => {
    // Global handleEdit fonksiyonunu window objesine ata
    (window as any).globalHandleEdit = handleEdit;
    
    // Executive Dashboard'tan gelen düzenleme isteklerini dinle
    const checkForEditRequest = () => {
      const editingEntry = (window as any).editingEntryFromExecutiveDashboard;
      if (editingEntry) {
        console.log('🔧 Executive Dashboard\'tan düzenleme isteği geldi:', editingEntry);
        handleEdit(editingEntry);
        // İsteği temizle
        delete (window as any).editingEntryFromExecutiveDashboard;
      }
    };
    
    // Düzenli olarak kontrol et
    const interval = setInterval(checkForEditRequest, 100);
    
    return () => {
      clearInterval(interval);
      // Cleanup: Global fonksiyonu temizle
      delete (window as any).globalHandleEdit;
      delete (window as any).editingEntryFromExecutiveDashboard;
    };
  }, [handleEdit]);

  // ✅ PROFESYONEL: Otomatik Veri Kurtarma Fonksiyonu (Arkaplanda çalışır)
  const autoRecoverDataFromBackup = useCallback(() => {
    try {
      const backup = localStorage.getItem('kys-cost-management-data-backup');
      if (backup) {
        const backupData = JSON.parse(backup);
        if (backupData.data && Array.isArray(backupData.data) && backupData.data.length > 0) {
          console.log('🔄 Otomatik veri kurtarma başlatılıyor...');
          console.log(`📊 Backup'ta ${backupData.data.length} kayıt bulundu`);
          console.log(`📅 Backup tarihi: ${new Date(backupData.timestamp).toLocaleString('tr-TR')}`);
          
          setCostData(backupData.data);
          localStorage.setItem('kys-cost-management-data', JSON.stringify(backupData.data));
          
          // Refresh işlemleri
          onDataRefresh?.();
          window.dispatchEvent(new CustomEvent('costDataUpdated'));
          
          console.log(`✅ Otomatik veri kurtarma tamamlandı: ${backupData.data.length} kayıt geri yüklendi`);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Otomatik veri kurtarma hatası:', error);
      return false;
    }
  }, [onDataRefresh]);

  // ✅ DÖF/8D Integration Functions
  const getDOFStatusForRecord = useCallback((record: any) => {
    try {
      // ✅ KAPSAMLI DÖF DURUM KONTROLÜ - Hem dofRecords hem de dof-8d-records anahtarlarını kontrol et
      
      // 1. Ana DÖF kayıtlarını kontrol et (dofRecords)
      const mainDofRecords = localStorage.getItem('dofRecords');
      if (mainDofRecords) {
        const parsedMainRecords = JSON.parse(mainDofRecords);
        const foundInMain = parsedMainRecords.find((dof: any) => {
          const sourceMatch = dof.sourceModule === 'qualityCost' && 
                             dof.sourceRecordId === record.id?.toString();
          const titleMatch = record.parcaKodu && 
                            dof.title?.toLowerCase().includes(record.parcaKodu.toLowerCase());
          const descMatch = record.parcaKodu && 
                           dof.description?.toLowerCase().includes(record.parcaKodu.toLowerCase());
          
          return sourceMatch || titleMatch || descMatch;
        });
        
        if (foundInMain) {
          return {
            dofNumber: foundInMain.dofNumber || foundInMain.id,
            status: foundInMain.status,
            source: 'main'
          };
        }
      }

      // 2. Entegrasyon DÖF kayıtlarını kontrol et (dof-8d-records)
      const integrationDofRecords = localStorage.getItem('dof-8d-records');
      if (integrationDofRecords) {
        const parsedIntegrationRecords = JSON.parse(integrationDofRecords);
        const foundInIntegration = parsedIntegrationRecords.find((dof: any) => {
          const sourceMatch = dof.sourceModule === 'qualityCost' && 
                             dof.sourceRecordId === record.id?.toString();
          const titleMatch = record.parcaKodu && 
                            dof.title?.toLowerCase().includes(record.parcaKodu.toLowerCase());
          
          return sourceMatch || titleMatch;
        });
        
        if (foundInIntegration) {
          return {
            dofNumber: foundInIntegration.dofNumber || foundInIntegration.id,
            status: foundInIntegration.status,
            source: 'integration'
          };
        }
      }

      // 3. Fallback - checkDOFStatus kullan
    return checkDOFStatus('qualityCost', record.id.toString());
      
    } catch (error) {
      console.error('❌ DÖF durum kontrolü hatası:', error);
      return null;
    }
  }, []);

  const handleCreateDOFForRecord = useCallback((record: any) => {
    console.log('🚀 Birleşik Veri Yönetimi - DÖF oluşturuluyor:', record);
    
    // ✅ ÖNCE DÖF VAR MI KONTROL ET
    if (getDOFStatusForRecord(record)) {
      alert(`⚠️ UYARI: Bu kayıt için zaten bir uygunsuzluk kaydı oluşturulmuş!\n\nAynı kayıt için birden fazla uygunsuzluk açamazsınız. Mevcut uygunsuzluk kaydını DÖF ve 8D Yönetimi modülünden kontrol edebilirsiniz.`);
      return; // DÖF açma işlemini durdur
    }

    // Birim mapping (inline)
    const birimToDepartmentMap: { [key: string]: string } = {
      'arge': 'Ar-Ge',
      'boyahane': 'Boyahane',
      'bukum': 'Büküm',
      'depo': 'Depo',
      'elektrikhane': 'Elektrik Montaj',
      'kalite_kontrol': 'Kalite Kontrol',
      'kaynakhane': 'Kaynakhane',
      'kesim': 'Kesim',
      'mekanik_montaj': 'Mekanik Montaj',
      'satin_alma': 'Satın Alma',
      'uretim': 'Üretim',
      'uretim_planlama': 'Üretim Planlama'
    };
    const birimDisplayName = getDisplayName(record.birim, birimler);
    const mappedDepartment = birimToDepartmentMap[birimDisplayName.toLowerCase()] || birimDisplayName || 'Kalite Kontrol';
    
    const prefillData = {
      sourceModule: 'qualityCost',
      sourceRecordId: record.id.toString(),
      prefillData: {
        title: `Kalitesizlik Maliyeti - ${record.parcaKodu || 'Genel'} Uygunsuzluğu`,
        description: `Parça Kodu: ${record.parcaKodu || 'Belirtilmemiş'}
Maliyet Türü: ${getDisplayName(record.maliyetTuru, maliyetTurleri)}
Birim: ${birimDisplayName}
Araç: ${getDisplayName(record.arac, araclar)}
Maliyet: ₺${record.maliyet?.toLocaleString('tr-TR') || '0'}
Tarih: ${new Date(record.tarih).toLocaleDateString('tr-TR')}
Açıklama: ${record.aciklama || 'Detay bilgi yok'}

Bu kayıt yüksek kalitesizlik maliyeti nedeniyle uygunsuzluk olarak değerlendirilmiştir.`,
        department: mappedDepartment,
        priority: record.maliyet > 100000 ? 'critical' : 
                  record.maliyet > 50000 ? 'high' : 
                  record.maliyet > 20000 ? 'medium' : 'low',
        type: 'corrective',
        responsible: 'Kalite Sorumlusu',
        rootCause: 'Araştırılacak - Kalitesizlik maliyet analizi gerekli',
        issueDescription: `Kalitesizlik maliyeti: ₺${record.maliyet?.toLocaleString('tr-TR') || '0'}`,
        suggestedType: 'corrective'
      },
      recordData: record
    };

    // Prefill verisini localStorage'a kaydet
    localStorage.setItem('dof-form-prefill', JSON.stringify(prefillData));
    
    // DÖF8DManagement sayfasına yönlendir ve form açılmasını tetikle
    localStorage.setItem('dof-auto-open-form', 'true');
    
    console.log('🚀 Birleşik Veri Yönetimi - DÖF form açılıyor:', {
      parcaKodu: record.parcaKodu,
      recordId: record.id,
      prefillDataSaved: true,
      autoOpenSet: true
    });
    
    window.location.href = '/dof-8d-management';
  }, [getDisplayName, maliyetTurleri, birimler, araclar, getDOFStatusForRecord]);

  // ✅ BASIT: Sadece filtrelenmiş veriyi kullan - başka filtre YOK!
  const getAnalytics = useMemo(() => {
    // ✅ Global filtrelenmiş veriyi doğrudan kullan
    const activeData = filteredData;
    
    console.log('🔍 BASIT DataManagement Analytics:', {
      globalFilteredDataLength: filteredData.length,
      usingOnlyGlobalFilters: true,
      activeDataSample: activeData.slice(0, 2)
    });
    
    const byBirim = birimler.map(birim => ({
      birim: birim.label,
      toplam: activeData
        .filter(item => item.birim === birim.value)
        .reduce((sum, item) => sum + item.maliyet, 0),
      adet: activeData.filter(item => item.birim === birim.value).length
    })).filter(item => item.toplam > 0);

    const byArac = araclar.map(arac => ({
      arac: arac.label,
      toplam: activeData
        .filter(item => item.arac === arac.value)
        .reduce((sum, item) => sum + item.maliyet, 0),
      adet: activeData.filter(item => item.arac === arac.value).length
    })).filter(item => item.toplam > 0);

    const byMaliyetTuru = maliyetTurleri.map(mt => ({
      tur: mt.label,
      toplam: activeData
        .filter(item => item.maliyetTuru === mt.value)
        .reduce((sum, item) => sum + item.maliyet, 0),
      adet: activeData.filter(item => item.maliyetTuru === mt.value).length
    })).filter(item => item.toplam > 0);

    // ✅ Context7: Real-time Pareto Analysis from actual data
    const totalCost = activeData.reduce((sum, item) => sum + item.maliyet, 0);
    const sortedByMaliyet = [...byMaliyetTuru].sort((a, b) => b.toplam - a.toplam);
    let cumulative = 0;
    const paretoAnalysis = sortedByMaliyet.map((item, index) => {
      const percentage = totalCost > 0 ? (item.toplam / totalCost) * 100 : 0;
      cumulative += percentage;
      return {
        category: item.tur,
        cost: item.toplam,
        percentage,
        cumulative,
        count: index + 1
      };
    });

    // ✅ Context7: Real-time COPQ Breakdown from actual data mapped to COPQ categories
    const copqCategories = {
      internal: { name: 'İç Hata (Hurda, Yeniden İşlem, Fire)', value: 0, color: '#ff9800' },
      external: { name: 'Dış Hata (Garanti, İade, Şikayet)', value: 0, color: '#f44336' },
      appraisal: { name: 'Değerlendirme (Denetim, Test)', value: 0, color: '#2196f3' },
      prevention: { name: 'Önleme (Eğitim, Genel Önleme)', value: 0, color: '#4caf50' }
    };

    // Map actual cost types to COPQ categories using Context7 mapping
    const mapMaliyetTuruToCOPQ = (maliyetTuru) => {
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

    // Aggregate costs by COPQ category
    byMaliyetTuru.forEach(item => {
      const maliyetTuruKey = maliyetTurleri.find(mt => mt.label === item.tur)?.value;
      if (maliyetTuruKey) {
        const copqCategory = mapMaliyetTuruToCOPQ(maliyetTuruKey);
        copqCategories[copqCategory].value += item.toplam;
      }
    });

    const copqBreakdown = Object.values(copqCategories).filter(cat => cat.value > 0);

    // ✅ Context7: NEW - Real Part Code Analysis from Actual Data
    const parcaKoduData = new Map();
    
    // ✅ Context7: Aggregate real part code data from cost data entries
    activeData.forEach(item => {
      if (item.parcaKodu) {
        const existing = parcaKoduData.get(item.parcaKodu);
        if (existing) {
          existing.toplam += item.maliyet;
          existing.problemSayisi += 1;
          existing.entries.push(item);
        } else {
          parcaKoduData.set(item.parcaKodu, {
            parcaKodu: item.parcaKodu,
            toplam: item.maliyet,
            problemSayisi: 1,
            entries: [item]
          });
        }
      }
    });

    // ✅ Context7: Convert Map to Array and enhance with descriptions for new part codes
    const partDescriptions = {
      '500123845': 'Ana Şase Kaynağı',
      '500156789': 'Motor Braketi', 
      '500134567': 'Diferansiyel Muhafaza',
      '500145678': 'Fren Diski',
      '500167890': 'Transmisyon Kasası',
      '500178901': 'Hidrolik Silindir',
      '500189012': 'Hidrolik Pompa',
      '500190123': 'Soğutma Sistemi',
      '500101234': 'Klima Kompresörü',
      '500112345': 'Elektronik Kontrol',
      '500123456': 'Sensör Modülü'
    };

    const byParcaKodu = Array.from(parcaKoduData.values())
      .map(part => ({
        ...part,
        aciklama: partDescriptions[part.parcaKodu] || `Parça ${part.parcaKodu}`
      }))
      .sort((a, b) => b.toplam - a.toplam) // Sort by cost descending
      .slice(0, 10); // Top 10 most expensive parts

    // ✅ Context7: Generate ENHANCED COPQ trend with category breakdown
    const generateRealTrendData = () => {
      const monthlyData = new Map();
      
      // Group cost data by month and COPQ category from actual activeData
      activeData.forEach((item: any) => {
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
      
      console.log('📈 DataManagement COPQ Trend Generated:', {
        recordsProcessed: activeData.length,
        monthsGenerated: sortedMonths.length,
        detailedTrendData: sortedMonths,
        filteredMode: filteredData.length > 0 ? 'FILTERED' : 'ALL_DATA'
      });
      
      return sortedMonths;
    };

    const analytics = { 
      byBirim, 
      byArac, 
      byMaliyetTuru, 
      byParcaKodu, // ✅ NEW: Part code analysis
      paretoAnalysis,
      copqBreakdown,
      trendData: generateRealTrendData(), // ✅ NEW: Real trend data
      totalSummary: {
        totalCost,
        totalItems: activeData.length,
        avgCost: totalCost / (activeData.length || 1)
      }
    };
    
    // ✅ Context7: Real-time data sharing via callback with debug
    const totalCostValue = filteredData.reduce((sum, item) => sum + item.maliyet, 0);
    const totalItemsValue = filteredData.length;
    
    console.log('🔄 DataManagement Analytics Generated:', {
      totalCost: totalCostValue,
      totalItems: totalItemsValue,
      trendDataLength: analytics.trendData.length,
      trendData: analytics.trendData
    });
    
    if (onDataChange) {
      console.log('📤 Sending analytics to parent component...');
      onDataChange(analytics);
    }

    return analytics;
  }, [filteredData, birimler, araclar, maliyetTurleri, onDataChange]);

  return (
    <Box sx={{ p: 3 }}>
      
      {/* BASIT Analytics Cards - SADECE global filtrelenmiş veri */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, background: 'linear-gradient(45deg, #2196f3, #21cbf3)' }}>
            <Typography variant="h6" color="white">Toplam Kayıt</Typography>
            <Typography variant="h4" color="white">
              {filteredData.length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, background: 'linear-gradient(45deg, #f44336, #ff6b6b)' }}>
            <Typography variant="h6" color="white">Toplam Maliyet</Typography>
            <Typography variant="h4" color="white">
              ₺{filteredData.reduce((sum, item) => sum + item.maliyet, 0).toLocaleString('tr-TR')}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, background: 'linear-gradient(45deg, #4caf50, #66bb6a)' }}>
            <Typography variant="h6" color="white">En Yüksek Maliyet</Typography>
            <Typography variant="h4" color="white">
              ₺{Math.max(...filteredData.map(item => item.maliyet), 0).toLocaleString('tr-TR')}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, background: 'linear-gradient(45deg, #ff9800, #ffb74d)' }}>
            <Typography variant="h6" color="white">Ortalama Maliyet</Typography>
            <Typography variant="h4" color="white">
              ₺{filteredData.length > 0 ? Math.round(filteredData.reduce((sum, item) => sum + item.maliyet, 0) / filteredData.length).toLocaleString('tr-TR') : '0'}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* ✅ PROFESYONEL: Sadece Ana İşlev Butonu */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1565c0, #1976d2)',
            },
            px: 3,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600
          }}
        >
          Yeni Maliyet Kaydı Ekle
        </Button>
        
        {/* ✅ BASIT: Sadece global filtrelenmiş veri sayısı */}
        <Chip
          icon={<InfoIcon />}
          label={`${filteredData.length} kayıt görüntüleniyor`}
          color="primary"
          variant="outlined"
          sx={{ 
            ml: 1,
            fontSize: '0.85rem',
            fontWeight: 500
          }}
        />
      </Box>

      {/* Data Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Maliyet Türü</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Birim</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Araç</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Maliyet (₺)</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Parça Kodu</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Tarih</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>Durumu</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f5f5' }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .sort((a, b) => b.id - a.id) // ✅ ID'ye göre azalan sıralama (en yeni üstte)
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}
                >
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Chip
                      label={getDisplayName(row.maliyetTuru, maliyetTurleri)}
                      color={getMaliyetTuruColor(row.maliyetTuru)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{getDisplayName(row.birim, birimler)}</TableCell>
                  <TableCell>{getDisplayName(row.arac, araclar)}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: row.maliyet > 30000 ? 'error.main' : 'text.primary'
                      }}
                    >
                      ₺{row.maliyet.toLocaleString('tr-TR')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: row.parcaKodu ? 600 : 400,
                        color: row.parcaKodu ? 'primary.main' : 'text.secondary',
                        maxWidth: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {row.parcaKodu || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>{new Date(row.tarih).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.durum === 'aktif' ? 'Aktif' : 'Pasif'}
                      color={row.durum === 'aktif' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                        {/* ✅ YENİ: Detay Görüntüleme Butonu */}
                        <Tooltip title="Detayları Görüntüle">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(row)}
                            sx={{ color: 'info.main' }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <IconButton 
                          size="small" 
                        onClick={() => handleEdit(row)}
                        sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                        onClick={() => handleDelete(row.id)}
                        sx={{ color: 'error.main' }}
                        >
                        <DeleteIcon />
                        </IconButton>
                        {/* ✅ HER KAYIT İÇİN UYGUNSUZLUK OLUŞTURMA BUTONU */}
                          <Tooltip title={getDOFStatusForRecord(row) ? `DÖF Mevcut: ${getDOFStatusForRecord(row)?.dofNumber}` : "Uygunsuzluk Oluştur"}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleCreateDOFForRecord(row)}
                              disabled={!!getDOFStatusForRecord(row)}
                              sx={{ 
                                color: getDOFStatusForRecord(row) ? 'success.main' : 'warning.main',
                                '&:disabled': { color: 'success.main' }
                              }}
                            >
                              <ReportIcon />
                            </IconButton>
                          </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Sayfa başına satır:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} arası, toplam ${count !== -1 ? count : `${to}'den fazla`}`
          }
        />
      </Paper>



      {/* Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingEntry ? 'Maliyet Kaydını Düzenle' : 'Yeni Maliyet Kaydı'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Maliyet Türü</InputLabel>
                <Select
                  value={formData.maliyetTuru}
                  onChange={(e) => setFormData({...formData, maliyetTuru: e.target.value})}
                  label="Maliyet Türü"
                >
                  {maliyetTurleri.map(mt => (
                    <MenuItem key={mt.value} value={mt.value}>{mt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Birim</InputLabel>
                <Select
                  value={formData.birim}
                  onChange={(e) => setFormData({...formData, birim: e.target.value})}
                  label="Birim"
                >
                  {birimler.map(b => (
                    <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* ⭐ YENİ: ADET BAZLI YENİDEN İŞLEM MALİYETİ */}
            
            {/* 🏭 YENİ: Genel kategori seçildiğinde açıklama alanı zorunlu hale gelir */}
            {formData.aracKategorisi === 'Genel' && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <AlertTitle>Genel Kategori Seçildi</AlertTitle>
                  Bu kategori araç spesifik olmayan maliyetler içindir (saha hurdaları, genel fire vs.). 
                  Lütfen açıklama alanında detay belirtiniz.
                </Alert>
              </Grid>
            )}
            
            {/* 🚗 Geriye Uyumluluk: Kategori seçilmemişse direkt araç seçimi */}
            {!formData.aracKategorisi && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Araç</InputLabel>
                  <Select
                    value={formData.arac}
                    onChange={(e) => setFormData({...formData, arac: e.target.value})}
                    label="Araç"
                  >
                    {araclar.map(a => (
                      <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            

            
            {/* ✅ Context7: Optional Part Code for Analytics */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Parça Kodu (Opsiyonel)"
                value={formData.parcaKodu}
                onChange={(e) => setFormData({...formData, parcaKodu: e.target.value})}
                helperText="Analiz için parça kodunu girebilirsiniz (zorunlu değil)"
                InputProps={{
                  startAdornment: <InputAdornment position="start">🔍</InputAdornment>
                }}
              />
            </Grid>
            
            {/* Dynamic Cost Calculation Fields */}
            {getSelectedMaliyetTuruInfo()?.requiresTime ? (
              <>
                <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                    required
                    label={`Süre (${getSelectedMaliyetTuruInfo()?.timeUnit})`}
                type="number"
                    value={formData.sure}
                    onChange={(e) => setFormData({...formData, sure: parseFloat(e.target.value) || 0})}
                    helperText={`Bu maliyet türü için ${getSelectedMaliyetTuruInfo()?.timeUnit} cinsinden girin`}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    required
                    label={`Birim Maliyet (₺/${getSelectedMaliyetTuruInfo()?.timeUnit})`}
                    type="number"
                    value={formData.birimMaliyet}
                    onChange={(e) => setFormData({...formData, birimMaliyet: parseFloat(e.target.value) || 0})}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₺</InputAdornment>
                    }}
                    helperText={formData.birimMaliyet > 0 ? `Otomatik çekilen: ₺${formData.birimMaliyet}/${getSelectedMaliyetTuruInfo()?.timeUnit}` : "Ayarlardan otomatik çekilir"}
                    color={formData.birimMaliyet > 0 ? "success" : "primary"}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Toplam Maliyet (₺)"
                    type="number"
                    value={calculateDynamicCost()}
                    disabled
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>₺</Typography>
                    }}
                    helperText={`${formData.sure} × ₺${formData.birimMaliyet} = ₺${calculateDynamicCost()}`}
                  />
                </Grid>

                {/* ✅ ETKİLENEN BİRİMLER BÖLÜMÜ - YENİ PROFESYONELLEŞTİRİLMİŞ TASARIM */}
                {formData.maliyetTuru === 'yeniden_islem' && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ 
                        mb: 2, 
                        color: 'orange.main',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <WorkIcon />
                        Etkilenen Diğer Birimler
                      </Typography>
                    </Grid>

                    {/* Etkilenen birimler listesi */}
                    {(formData.ekBirimMaliyetleri || []).map((ekBirim: any, index: number) => (
                      <React.Fragment key={index}>
                        <Grid item xs={12}>
                          <Paper 
                            elevation={2}
                            sx={{ 
                              p: 3,
                              bgcolor: 'orange.50',
                              border: '2px solid',
                              borderColor: 'orange.200',
                              borderRadius: 2,
                              '&:hover': {
                                borderColor: 'orange.400',
                                boxShadow: '0 4px 12px rgba(255,152,0,0.15)'
                              }
                            }}
                          >
                            <Grid container spacing={3} alignItems="center">
                              <Grid item xs={12} md={3}>
                                <FormControl fullWidth required>
                                  <InputLabel>Etkilenen Birim</InputLabel>
                                  <Select
                                    value={ekBirim.birimAdi || ''}
                                    onChange={(e) => {
                                      const updatedEkBirimler = [...(formData.ekBirimMaliyetleri || [])];
                                      const selectedBirim = e.target.value;
                                      
                                      // ✅ ANA SİSTEMLE TAMAMEN AYNI LOJİĞİ KULLAN
                                      const maliyetTuruInfo = getSelectedMaliyetTuruInfo();
                                      let birimMaliyeti = 0; // Başlangıç değeri
                                      
                                      // Önce yeni birim maliyet ayarlarından al (Ana sistemle aynı)
                                      if (typeof window !== 'undefined' && (window as any).getUnitCost) {
                                        const timeUnit = maliyetTuruInfo?.timeUnit || 'dakika';
                                        birimMaliyeti = (window as any).getUnitCost(selectedBirim, timeUnit);
                                        console.log(`🔧 ETKİLENEN BİRİM: ${selectedBirim} - ${timeUnit} = ₺${birimMaliyeti}`);
                                      } else {
                                        // ✅ Fallback: Eski departman ayarları sistemi (Ana sistemle aynı)
                                        const departmanSettings = [
                                          { departman: 'arge', saatlikMaliyet: 35.00 },
                                          { departman: 'boyahane', saatlikMaliyet: 18.00 },
                                          { departman: 'bukum', saatlikMaliyet: 22.00 },
                                          { departman: 'depo', saatlikMaliyet: 16.00 },
                                          { departman: 'elektrikhane', saatlikMaliyet: 28.00 },
                                          { departman: 'idari_isler', saatlikMaliyet: 24.00 },
                                          { departman: 'kalite_kontrol', saatlikMaliyet: 27.00 },
                                          { departman: 'kaynakhane', saatlikMaliyet: 30.00 },
                                          { departman: 'kesim', saatlikMaliyet: 20.00 },
                                          { departman: 'mekanik_montaj', saatlikMaliyet: 25.00 },
                                          { departman: 'satin_alma', saatlikMaliyet: 22.00 },
                                          { departman: 'satis', saatlikMaliyet: 26.00 },
                                          { departman: 'ssh', saatlikMaliyet: 24.00 },
                                          { departman: 'uretim_planlama', saatlikMaliyet: 28.00 }
                                        ];
                                        
                                        const setting = departmanSettings.find(d => d.departman === selectedBirim);
                                        if (setting && maliyetTuruInfo) {
                                          // Ana birimde olduğu gibi zaman birimini dönüştür
                                          birimMaliyeti = setting.saatlikMaliyet;
                                          if (maliyetTuruInfo.timeUnit === 'dakika') {
                                            birimMaliyeti = Math.round((setting.saatlikMaliyet / 60) * 1000) / 1000;
                                          }
                                        }
                                      }
                                      
                                      updatedEkBirimler[index] = { 
                                        ...ekBirim, 
                                        birimAdi: selectedBirim,
                                        birimMaliyet: birimMaliyeti,
                                        sure: ekBirim.sure || 0,
                                        // Süre varsa otomatik hesapla
                                        maliyet: (ekBirim.sure || 0) * birimMaliyeti
                                      };
                                      setFormData({...formData, ekBirimMaliyetleri: updatedEkBirimler});
                                    }}
                                    label="Etkilenen Birim"
                                  >
                                    {birimler.map(b => (
                                      <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>

                              {/* ✅ Süre alanı */}
                              <Grid item xs={12} md={2.5}>
                                <TextField
                                  fullWidth
                                  required
                                  label={`Süre (${getSelectedMaliyetTuruInfo()?.timeUnit || 'dk'})`}
                                  type="number"
                                  value={ekBirim.sure || 0}
                                  onChange={(e) => {
                                    const updatedEkBirimler = [...(formData.ekBirimMaliyetleri || [])];
                                    const sure = parseFloat(e.target.value) || 0;
                                    const birimMaliyet = ekBirim.birimMaliyet || 0;
                                    updatedEkBirimler[index] = { 
                                      ...ekBirim, 
                                      sure: sure,
                                      maliyet: sure * birimMaliyet
                                    };
                                    setFormData({...formData, ekBirimMaliyetleri: updatedEkBirimler});
                                  }}

                                />
                              </Grid>

                              {/* ✅ Birim Maliyet (Otomatik) */}
                              <Grid item xs={12} md={2.5}>
                                <TextField
                                  fullWidth
                                  label={`Birim Maliyet (₺/${getSelectedMaliyetTuruInfo()?.timeUnit || 'dk'})`}
                                  type="number"
                                  value={ekBirim.birimMaliyet || 0}
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">₺</InputAdornment>
                                  }}

                                  disabled
                                  color="success"
                                />
                              </Grid>

                              {/* ✅ Toplam Maliyet (Hesaplanan) */}
                              <Grid item xs={12} md={3}>
                                <TextField
                                  fullWidth
                                  label="Toplam Maliyet (₺)"
                                  type="number"
                                  value={ekBirim.maliyet || 0}
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">₺</InputAdornment>
                                  }}

                                  disabled
                                  color="info"
                                />
                              </Grid>
                              
                              {/* ✅ Silme Butonu */}
                              <Grid item xs={12} md={1}>
                                <Box display="flex" justifyContent="center">
                                  <IconButton 
                                    color="error" 
                                    onClick={() => {
                                      const updatedEkBirimler = [...(formData.ekBirimMaliyetleri || [])];
                                      updatedEkBirimler.splice(index, 1);
                                      setFormData({...formData, ekBirimMaliyetleri: updatedEkBirimler});
                                    }}
                                    size="large"
                                    sx={{ 
                                      bgcolor: 'error.50',
                                      '&:hover': { 
                                        bgcolor: 'error.100',
                                        transform: 'scale(1.1)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      </React.Fragment>
                    ))}

                    {/* Yeni birim ekleme butonu */}
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          const yeniEkBirim = {
                            id: Date.now().toString(),
                            birimAdi: '',
                            sure: 0,
                            birimMaliyet: 0,
                            maliyet: 0
                          };
                          setFormData({
                            ...formData, 
                            ekBirimMaliyetleri: [...(formData.ekBirimMaliyetleri || []), yeniEkBirim]
                          });
                        }}
                        size="large"
                        sx={{ 
                          width: '100%',
                          py: 2,
                          borderColor: 'orange.main',
                          color: 'orange.main',
                          '&:hover': {
                            borderColor: 'orange.dark',
                            bgcolor: 'orange.50',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 8px rgba(255,152,0,0.2)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Etkilenen Birim Ekle
                      </Button>
                    </Grid>

                    {/* Toplam maliyet özeti - YENİ PROFESYONELLEŞTİRİLMİŞ TASARIM */}
                    {(formData.ekBirimMaliyetleri || []).length > 0 && (
                      <Grid item xs={12}>
                        <Card 
                          elevation={4}
                          sx={{ 
                            bgcolor: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                            borderLeft: '6px solid',
                            borderLeftColor: 'success.main',
                            borderRadius: 3,
                            overflow: 'hidden'
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Typography variant="h5" sx={{ 
                              color: 'success.dark',
                              fontWeight: 700,
                              mb: 3,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}>
                              <MoneyIcon />
                              Toplam Maliyet Özeti
                            </Typography>
                            
                            <Grid container spacing={3}>
                              <Grid item xs={12} md={4}>
                                <Paper 
                                  elevation={2}
                                  sx={{ 
                                    p: 2, 
                                    textAlign: 'center',
                                    bgcolor: 'primary.50',
                                    border: '1px solid',
                                    borderColor: 'primary.200'
                                  }}
                                >
                                  <Typography variant="body2" color="primary.dark" fontWeight={500}>
                                    Ana Birim Maliyeti
                                  </Typography>
                                  <Typography variant="h4" color="primary.main" fontWeight={700}>
                                    ₺{calculateDynamicCost().toLocaleString('tr-TR')}
                                  </Typography>
                                </Paper>
                              </Grid>
                              
                              <Grid item xs={12} md={4}>
                                <Paper 
                                  elevation={2}
                                  sx={{ 
                                    p: 2, 
                                    textAlign: 'center',
                                    bgcolor: 'orange.50',
                                    border: '1px solid',
                                    borderColor: 'orange.200'
                                  }}
                                >
                                  <Typography variant="body2" color="orange.dark" fontWeight={500}>
                                    Etkilenen Birimler
                                  </Typography>
                                  <Typography variant="h4" color="orange.main" fontWeight={700}>
                                    ₺{(formData.ekBirimMaliyetleri || []).reduce((sum: number, eb: any) => sum + (eb.maliyet || 0), 0).toLocaleString('tr-TR')}
                                  </Typography>
                                </Paper>
                              </Grid>
                              
                              <Grid item xs={12} md={4}>
                                <Paper 
                                  elevation={3}
                                  sx={{ 
                                    p: 2, 
                                    textAlign: 'center',
                                    bgcolor: 'success.50',
                                    border: '2px solid',
                                    borderColor: 'success.main'
                                  }}
                                >
                                  <Typography variant="body2" color="success.dark" fontWeight={600}>
                                    GENEL TOPLAM
                                  </Typography>
                                  <Typography variant="h3" color="success.main" fontWeight={800}>
                                    ₺{(calculateDynamicCost() + (formData.ekBirimMaliyetleri || []).reduce((sum: number, eb: any) => sum + (eb.maliyet || 0), 0)).toLocaleString('tr-TR')}
                                  </Typography>
                                </Paper>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </>
                )}
              </>
            ) : formData.maliyetTuru === 'hurda' ? (
              <>
                {formData.unit === 'kg' ? (
                  <>
                    {/* ✅ YENİ: İşçilik ve Genel Gider Toggle - KG bazlı hurda için */}
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.includeLabor || false}
                            onChange={(e) => setFormData({...formData, includeLabor: e.target.checked})}
                            color="primary"
                          />
                        }
                        label="İşçilik ve genel gider maliyetlerini dahil et (%30)"
                        sx={{ 
                          bgcolor: 'grey.50', 
                          p: 1, 
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'grey.200'
                        }}
                      />
                    </Grid>

                    {/* KG bazlı hurda formu */}
                    {/* ✅ PROFESYONEL: Malzeme Türü Seçimi - Hurda için gelişmiş */}
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Malzeme Türü (Opsiyonel)</InputLabel>
                        <Select
                          value={formData.malzemeTuru || ''}
                          onChange={(e) => setFormData({...formData, malzemeTuru: e.target.value as MaterialType || ''})}
                          label="Malzeme Türü (Opsiyonel)"
                        >
                          <MenuItem value="">
                            <em>Manuel Fiyat Girişi</em>
                          </MenuItem>
                          {materialPricings
                            .filter(material => material.aktif)
                            .map((material) => (
                              <MenuItem key={material.id} value={material.malzemeTuru}>
                                {material.malzemeTuru} (₺{material.alisKgFiyati}/kg alış - ₺{material.satisKgFiyati}/kg satış)
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>
                          Malzeme seçerseniz fiyatlar otomatik doldurulur
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        required
                        label="Hurda Ağırlığı"
                        type="number"
                        value={formData.agirlik}
                        onChange={(e) => setFormData({...formData, agirlik: parseFloat(e.target.value) || 0})}
                        InputProps={{
                          endAdornment: <InputAdornment position="end" sx={{ minWidth: '30px', flexShrink: 0, whiteSpace: 'nowrap' }}>kg</InputAdornment>
                        }}
                        helperText="Hurdaya çıkan malzeme miktarı"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Hurda Satış Fiyatı"
                        type="number"
                        value={(() => {
                          if (formData.malzemeTuru) {
                            const selectedMaterial = materialPricings.find(m => m.malzemeTuru === formData.malzemeTuru);
                            if (selectedMaterial) {
                              return selectedMaterial.satisKgFiyati;
                            }
                          }
                          return formData.kgMaliyet || 45;
                        })()}
                        onChange={(e) => {
                          if (!formData.malzemeTuru) {
                            setFormData({...formData, kgMaliyet: parseFloat(e.target.value) || 45})
                          }
                        }}
                        disabled={!!formData.malzemeTuru}
                        InputProps={{
                          startAdornment: <InputAdornment position="start" sx={{ minWidth: '25px', flexShrink: 0 }}>₺</InputAdornment>,
                          endAdornment: <InputAdornment position="end" sx={{ minWidth: '30px', flexShrink: 0, whiteSpace: 'nowrap' }}>/kg</InputAdornment>
                        }}
                        helperText={formData.malzemeTuru ? "Otomatik (malzeme ayarları)" : "Hurdanın kg satış fiyatı"}
                        color={formData.malzemeTuru ? "success" : "primary"}
                      />
                    </Grid>
                    
                    {/* ✅ PROFESYONEL: KG Bazlı Maliyet Analizi Kartı */}
                    {formData.malzemeTuru && formData.agirlik > 0 && (
                      <Grid item xs={12}>
                        <Card sx={{ 
                          bgcolor: 'success.50', 
                          borderLeft: '4px solid',
                          borderLeftColor: 'success.main',
                          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.15)'
                        }}>
                          <CardContent sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <ScaleIcon sx={{ color: 'success.main', mr: 1.5, fontSize: '20px' }} />
                              <Typography variant="h6" color="success.main" fontWeight="600">
                                KG Bazlı Hurda Maliyet Analizi
                              </Typography>
                            </Box>
                            
                            {(() => {
                              const selectedMaterial = materialPricings.find(m => m.malzemeTuru === formData.malzemeTuru);
                              
                              if (selectedMaterial && formData.agirlik > 0) {
                                const alisFiyati = selectedMaterial.alisKgFiyati;
                                const satisFiyati = selectedMaterial.satisKgFiyati;
                                const fiyatFarki = alisFiyati - satisFiyati;
                                const netZarar = Math.max(0, formData.agirlik * fiyatFarki);
                                
                                return (
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} md={8}>
                                      <Typography variant="body2" color="text.primary" sx={{ mb: 1, fontWeight: 500 }}>
                                        {formData.malzemeTuru} • {formData.agirlik} kg
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                          • Alış Fiyatı: ₺{alisFiyati}/kg
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          • Satış Fiyatı: ₺{satisFiyati}/kg
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          • Net Hurda Zararı: ₺{fiyatFarki.toFixed(2)}/kg
                                        </Typography>
                                      </Box>
                                    </Grid>
                                    <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Box sx={{ 
                                        p: 2, 
                                        bgcolor: 'success.main', 
                                        borderRadius: 2, 
                                        color: 'white',
                                        textAlign: 'center',
                                        width: '100%'
                                      }}>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                          Toplam Hurda Zararı
                                        </Typography>
                                        <Typography variant="h6" fontWeight="700">
                                          ₺{netZarar.toFixed(2)}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  </Grid>
                                );
                              }
                              
                              return (
                                <Typography variant="body2" color="text.secondary">
                                  Malzeme bilgileri bulunamadı
                                </Typography>
                              );
                            })()}
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Parça Maliyeti"
                        type="number"
                        value={(() => {
                          // Eğer manuel girilmişse onu göster
                          if (formData.parcaMaliyeti && formData.parcaMaliyeti > 0) {
                            return formData.parcaMaliyeti;
                          }
                          
                          // Yoksa tahmini değeri göster
                          if (formData.malzemeTuru && formData.agirlik > 0) {
                            return estimatePartCostFromMaterial(
                              formData.malzemeTuru, 
                              formData.agirlik, 
                              1
                            ).toFixed(2);
                          }
                          
                          return '';
                        })()}
                        onChange={(e) => setFormData({...formData, parcaMaliyeti: parseFloat(e.target.value) || 0})}
                        InputProps={{
                          startAdornment: <InputAdornment position="start" sx={{ minWidth: '20px' }}>₺</InputAdornment>
                        }}
                        helperText={(() => {
                          if (formData.parcaMaliyeti && formData.parcaMaliyeti > 0) {
                            return 'Manuel girilen maliyet';
                          }
                          
                          if (formData.malzemeTuru && formData.agirlik > 0) {
                            return 'Malzeme türünden otomatik tahmin';
                          }
                          
                          return 'Parça maliyetini girin veya malzeme türü seçin';
                        })()}
                        color={formData.parcaMaliyeti > 0 ? "primary" : formData.malzemeTuru ? "info" : "warning"}
                        sx={{ 
                          '& .MuiInputAdornment-root': { 
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Net Hurda Zararı"
                        type="number"
                        value={calculateDynamicCost()}
                        disabled
                        InputProps={{
                          startAdornment: <InputAdornment position="start" sx={{ minWidth: '25px' }}>-₺</InputAdornment>
                        }}
                        helperText={(() => {
                          if (formData.malzemeTuru && formData.agirlik > 0) {
                            const selectedMaterial = materialPricings.find(m => m.malzemeTuru === formData.malzemeTuru);
                            if (selectedMaterial) {
                              return `${formData.agirlik} kg × (₺${selectedMaterial.alisKgFiyati} - ₺${selectedMaterial.satisKgFiyati}) = ₺${calculateDynamicCost()}`;
                            }
                          }
                          
                          let parcaMaliyeti = formData.parcaMaliyeti || 0;
                          if (parcaMaliyeti === 0 && formData.malzemeTuru && formData.agirlik > 0) {
                            parcaMaliyeti = estimatePartCostFromMaterial(formData.malzemeTuru, formData.agirlik, 1);
                          }
                          
                          if (parcaMaliyeti > 0 && formData.agirlik > 0) {
                            const hurdaSatisFiyati = formData.kgMaliyet || 45;
                            const hurdaSatisGeliri = formData.agirlik * hurdaSatisFiyati;
                            const maliyetTipi = formData.parcaMaliyeti > 0 ? 'Manuel' : 'Tahmini';
                            return `₺${parcaMaliyeti.toFixed(2)} (${maliyetTipi}) - (${formData.agirlik} kg × ₺${hurdaSatisFiyati}) = ₺${calculateDynamicCost()}`;
                          }
                          return `Parça Maliyeti - (Ağırlık × Hurda Satış Fiyatı) = Net Hurda Zararı`;
                        })()}
                        color="error"
                        sx={{ 
                          '& .MuiInputAdornment-root': { 
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }
                        }}
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    {/* İşçilik ve Genel Gider Toggle - Adet bazlı hurda için */}
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.includeLabor || false}
                            onChange={(e) => setFormData({...formData, includeLabor: e.target.checked})}
                            color="primary"
                          />
                        }
                        label="İşçilik ve genel gider maliyetlerini dahil et (%30)"
                        sx={{ 
                          bgcolor: 'grey.50', 
                          p: 1, 
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'grey.200'
                        }}
                      />
                    </Grid>

                    {/* ✅ PROFESYONEL: ADET bazlı hurda formu - Gelişmiş layout */}
                    
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Malzeme Türü (Opsiyonel)</InputLabel>
                        <Select
                          value={formData.malzemeTuru || ''}
                          onChange={(e) => setFormData({...formData, malzemeTuru: e.target.value as MaterialType || ''})}
                          label="Malzeme Türü (Opsiyonel)"
                        >
                          <MenuItem value="">
                            <em>Manuel Maliyet Girişi</em>
                          </MenuItem>
                          {materialPricings
                            .filter(material => material.aktif)
                            .map((material) => (
                              <MenuItem key={material.id} value={material.malzemeTuru}>
                                {material.malzemeTuru} (₺{material.alisKgFiyati}/kg alış)
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>
                          Seçerseniz otomatik maliyet hesaplaması yapılır
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        required
                        label="Parça Adedi"
                        type="number"
                        value={formData.miktar}
                        onChange={(e) => setFormData({...formData, miktar: parseInt(e.target.value) || 0})}
                        InputProps={{
                          endAdornment: <InputAdornment position="end" sx={{ minWidth: '35px', flexShrink: 0, whiteSpace: 'nowrap' }}>adet</InputAdornment>
                        }}
                        helperText="Hurdaya çıkan parça sayısı"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        required
                        label="Parça Ağırlığı"
                        type="number"
                        value={formData.agirlik}
                        onChange={(e) => setFormData({...formData, agirlik: parseFloat(e.target.value) || 0})}
                        InputProps={{
                          endAdornment: <InputAdornment position="end" sx={{ minWidth: '30px', flexShrink: 0, whiteSpace: 'nowrap' }}>kg</InputAdornment>
                        }}
                        helperText="Parça başına ağırlık"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Toplam Ağırlık"
                        type="number"
                        value={(formData.miktar * (formData.agirlik || 0)).toFixed(2)}
                        disabled
                        InputProps={{
                          endAdornment: <InputAdornment position="end" sx={{ minWidth: '30px', flexShrink: 0, whiteSpace: 'nowrap' }}>kg</InputAdornment>
                        }}
                        helperText="Otomatik hesaplanan"
                        color="info"
                      />
                    </Grid>
                    {/* ✅ PROFESYONEL: Adet Bazlı Maliyet Analizi Kartı */}
                    {formData.malzemeTuru && formData.agirlik > 0 && formData.miktar > 0 && (
                      <Grid item xs={12}>
                        <Card sx={{ 
                          bgcolor: 'primary.50', 
                          borderLeft: '4px solid',
                          borderLeftColor: 'primary.main',
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)'
                        }}>
                          <CardContent sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <AnalyticsIcon sx={{ color: 'primary.main', mr: 1.5, fontSize: '20px' }} />
                              <Typography variant="h6" color="primary.main" fontWeight="600">
                                Adet Bazlı Maliyet Analizi
                              </Typography>
                            </Box>
                            
                            {(() => {
                              const selectedMaterial = materialPricings.find(m => m.malzemeTuru === formData.malzemeTuru);
                              
                              if (selectedMaterial && formData.agirlik > 0 && formData.miktar > 0) {
                                const baseBirimMaliyet = estimatePartCostFromMaterial(formData.malzemeTuru, formData.agirlik, 1);
                                const laborCost = formData.includeLabor ? baseBirimMaliyet * 0.30 : 0;
                                const birimMaliyet = baseBirimMaliyet + laborCost;
                                const toplamMaliyet = birimMaliyet * formData.miktar;
                                const alisFiyati = selectedMaterial.alisKgFiyati;
                                const toplamAgirlik = formData.miktar * formData.agirlik;
                                
                                return (
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} md={8}>
                                      <Typography variant="body2" color="text.primary" sx={{ mb: 1, fontWeight: 500 }}>
                                        {formData.miktar} adet × {formData.agirlik} kg = {toplamAgirlik.toFixed(1)} kg toplam
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                          • Temel Parça Maliyeti: ₺{baseBirimMaliyet.toFixed(2)}/adet
                                        </Typography>
                                        {formData.includeLabor && (
                                          <Typography variant="body2" color="text.secondary">
                                            • İşçilik ve Genel Gider (%30): +₺{laborCost.toFixed(2)}/adet
                                          </Typography>
                                        )}
                                        <Typography variant="body2" color="text.secondary">
                                          • Toplam Parça Maliyeti: ₺{toplamMaliyet.toFixed(2)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          • Alış Fiyatı: ₺{alisFiyati}/kg ({formData.malzemeTuru})
                                        </Typography>
                                      </Box>
                                    </Grid>
                                    <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Box sx={{ 
                                        p: 2, 
                                        bgcolor: 'primary.main', 
                                        borderRadius: 2, 
                                        color: 'white',
                                        textAlign: 'center',
                                        width: '100%'
                                      }}>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                          Birim Maliyet
                                        </Typography>
                                        <Typography variant="h6" fontWeight="700">
                                          ₺{birimMaliyet.toFixed(2)}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  </Grid>
                                );
                              }
                              
                              return (
                                <Typography variant="body2" color="text.secondary">
                                  Malzeme bilgileri bulunamadı
                                </Typography>
                              );
                            })()}
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Parça Maliyeti"
                        type="number"
                        value={(() => {
                          // Eğer manuel girilmişse onu göster
                          if (formData.birimMaliyet && formData.birimMaliyet > 0) {
                            return formData.birimMaliyet;
                          }
                          
                          // Yoksa tahmini değeri göster
                          if (formData.malzemeTuru && formData.agirlik > 0) {
                            return estimatePartCostFromMaterial(
                              formData.malzemeTuru, 
                              formData.agirlik, 
                              1
                            ).toFixed(2);
                          }
                          
                          return '';
                        })()}
                        onChange={(e) => setFormData({...formData, birimMaliyet: parseFloat(e.target.value) || 0})}
                        InputProps={{
                          startAdornment: <InputAdornment position="start" sx={{ minWidth: '25px', flexShrink: 0 }}>₺</InputAdornment>,
                          endAdornment: <InputAdornment position="end" sx={{ minWidth: '40px', flexShrink: 0, whiteSpace: 'nowrap' }}>/adet</InputAdornment>
                        }}
                        helperText={(() => {
                          if (formData.birimMaliyet && formData.birimMaliyet > 0) {
                            return 'Manuel girilen maliyet';
                          }
                          
                          if (formData.malzemeTuru && formData.agirlik > 0) {
                            return 'Malzeme türünden otomatik tahmin';
                          }
                          
                          return 'Parça maliyetini girin veya malzeme türü seçin';
                        })()}
                        color={formData.birimMaliyet > 0 ? "primary" : formData.malzemeTuru ? "info" : "warning"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Hurda Satış Fiyatı"
                        type="number"
                        value={(() => {
                          if (formData.malzemeTuru) {
                            const selectedMaterial = materialPricings.find(m => m.malzemeTuru === formData.malzemeTuru);
                            if (selectedMaterial) {
                              return selectedMaterial.satisKgFiyati;
                            }
                          }
                          return formData.kgMaliyet || 0;
                        })()}
                        onChange={(e) => {
                          if (!formData.malzemeTuru) {
                            setFormData({...formData, kgMaliyet: parseFloat(e.target.value) || 0})
                          }
                        }}
                        disabled={!!formData.malzemeTuru}
                        InputProps={{
                          startAdornment: <InputAdornment position="start" sx={{ minWidth: '25px', flexShrink: 0 }}>₺</InputAdornment>,
                          endAdornment: <InputAdornment position="end" sx={{ minWidth: '30px', flexShrink: 0, whiteSpace: 'nowrap' }}>/kg</InputAdornment>
                        }}
                        helperText={formData.malzemeTuru ? "Otomatik (malzeme ayarları)" : "Hurdanın kg satış fiyatı"}
                        color={formData.malzemeTuru ? "success" : "primary"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Net Hurda Zararı"
                        type="number"
                        value={calculateDynamicCost()}
                        disabled
                        InputProps={{
                          startAdornment: <InputAdornment position="start" sx={{ minWidth: '30px', flexShrink: 0 }}>-₺</InputAdornment>
                        }}
                        helperText="Otomatik hesaplanan zarar"
                        color="error"
                      />
                    </Grid>
                    


                    {/* Detaylı hesaplama gösterimi - GELİŞTİRİLMİŞ */}
                    <Grid item xs={12}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 'grey.50', 
                        borderRadius: 1, 
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Hesaplama Detayı:</strong> {(() => {
                            let birimMaliyet = formData.birimMaliyet || 0;
                            
                            // Tahmini parça maliyeti kullan
                            if (birimMaliyet === 0 && formData.malzemeTuru && formData.agirlik > 0) {
                              birimMaliyet = estimatePartCostFromMaterial(
                                formData.malzemeTuru, 
                                formData.agirlik, 
                                1
                              );
                            }
                            
                            // Temel maliyet hesapla
                            let baseMaliyet = (formData.miktar || 0) * birimMaliyet;
                            
                            // İşçilik maliyeti ekle
                            let laborCost = 0;
                            if (formData.includeLabor) {
                              laborCost = baseMaliyet * 0.30;
                              baseMaliyet += laborCost;
                            }
                            
                            const toplamMaliyet = baseMaliyet;
                            const toplamAgirlık = (formData.miktar || 0) * (formData.agirlik || 0);
                            const hurdaSatisFiyati = formData.malzemeTuru ? 
                              (materialPricings.find(m => m.malzemeTuru === formData.malzemeTuru)?.satisKgFiyati || 0) : 
                              (formData.kgMaliyet || 0);
                            const hurdaGeliri = toplamAgirlık * hurdaSatisFiyati;
                            
                            const maliyetTipi = (formData.birimMaliyet && formData.birimMaliyet > 0) ? 'Manuel' : 'Tahmini';
                            const laborText = formData.includeLabor ? ` + %30 İşçilik (₺${laborCost.toFixed(2)})` : '';
                            
                            return `${formData.miktar || 0} adet × ₺${birimMaliyet.toFixed(2)} (${maliyetTipi})${laborText} - ${toplamAgirlık.toFixed(1)} kg × ₺${hurdaSatisFiyati} = ₺${toplamMaliyet.toFixed(2)} - ₺${hurdaGeliri.toFixed(2)} = ₺${calculateDynamicCost()}`;
                          })()}
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}
              </>
            ) : getSelectedMaliyetTuruInfo()?.requiresMaterial ? (
              <>
                {/* İşçilik ve Genel Gider Toggle - Fire için */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.includeLabor || false}
                        onChange={(e) => setFormData({...formData, includeLabor: e.target.checked})}
                        color="primary"
                      />
                    }
                    label="İşçilik ve genel gider maliyetlerini dahil et (%30)"
                    sx={{ 
                      bgcolor: 'grey.50', 
                      p: 1, 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}
                  />
                </Grid>

                {/* ✅ PROFESYONEL: FIRE FORMU - Hurda ile tutarlı malzeme seçim sistemi */}
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Malzeme Türü (Opsiyonel)</InputLabel>
                    <Select
                      value={formData.malzemeTuru || ''}
                      onChange={(e) => setFormData({...formData, malzemeTuru: e.target.value as MaterialType || ''})}
                      label="Malzeme Türü (Opsiyonel)"
                    >
                      <MenuItem value="">
                        <em>Manuel Fiyat Girişi</em>
                          </MenuItem>
                                                {materialPricings
                            .filter(material => material.aktif)
                            .map((material) => (
                              <MenuItem key={material.id} value={material.malzemeTuru}>
                                {material.malzemeTuru} (₺{material.alisKgFiyati}/kg alış - ₺{material.satisKgFiyati}/kg satış)
                              </MenuItem>
                            ))}
                    </Select>
                        <FormHelperText>
                          Malzeme seçerseniz fiyatlar otomatik doldurulur
                        </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    required
                    label="Fire Ağırlığı"
                    type="number"
                    value={formData.agirlik}
                    onChange={(e) => setFormData({...formData, agirlik: parseFloat(e.target.value) || 0})}
                    InputProps={{
                      endAdornment: <InputAdornment position="end" sx={{ minWidth: '30px', flexShrink: 0, whiteSpace: 'nowrap' }}>kg</InputAdornment>
                    }}
                    helperText="Fire olan malzeme miktarını kilogram cinsinden girin"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Fire Satış Fiyatı"
                    type="number"
                    value={(() => {
                      if (formData.malzemeTuru) {
                        const selectedMaterial = materialPricings.find(m => m.malzemeTuru === formData.malzemeTuru);
                        if (selectedMaterial) {
                          return selectedMaterial.satisKgFiyati;
                        }
                      }
                      return formData.kgMaliyet || 0;
                    })()}
                    onChange={(e) => {
                      if (!formData.malzemeTuru) {
                        setFormData({...formData, kgMaliyet: parseFloat(e.target.value) || 0})
                      }
                    }}
                    disabled={!!formData.malzemeTuru}
                    InputProps={{
                      startAdornment: <InputAdornment position="start" sx={{ minWidth: '25px', flexShrink: 0 }}>₺</InputAdornment>,
                      endAdornment: <InputAdornment position="end" sx={{ minWidth: '30px', flexShrink: 0, whiteSpace: 'nowrap' }}>/kg</InputAdornment>
                    }}
                    helperText={formData.malzemeTuru ? "Otomatik (malzeme ayarları)" : "Fire satış fiyatını kg başına girin"}
                    color={formData.malzemeTuru ? "success" : "primary"}
                  />
                </Grid>

                {/* ✅ PROFESYONEL: Fire Maliyet Analizi Kartı */}
                {formData.malzemeTuru && formData.agirlik > 0 && (
                  <Grid item xs={12}>
                    <Card sx={{ 
                      bgcolor: 'warning.50', 
                      borderLeft: '4px solid',
                      borderLeftColor: 'warning.main',
                      boxShadow: '0 2px 8px rgba(255, 152, 0, 0.15)'
                    }}>
                      <CardContent sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <LocalFireDepartmentIcon sx={{ color: 'warning.main', mr: 1.5, fontSize: '20px' }} />
                          <Typography variant="h6" color="warning.main" fontWeight="600">
                            Fire Maliyet Analizi
                          </Typography>
                        </Box>
                        
                        {(() => {
                          const selectedMaterial = materialPricings.find(m => m.malzemeTuru === formData.malzemeTuru);
                          
                          if (selectedMaterial && formData.agirlik > 0) {
                            const alisFiyati = selectedMaterial.alisKgFiyati;
                            const satisFiyati = selectedMaterial.satisKgFiyati || 0;
                            const fiyatFarki = alisFiyati - satisFiyati;
                            const baseMaliyet = formData.agirlik * fiyatFarki;
                            const laborCost = formData.includeLabor ? baseMaliyet * 0.30 : 0;
                            const netZarar = Math.max(0, baseMaliyet + laborCost);
                            
                            return (
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={8}>
                                  <Typography variant="body2" color="text.primary" sx={{ mb: 1, fontWeight: 500 }}>
                                    {formData.malzemeTuru} • {formData.agirlik} kg
                                  </Typography>
                                  
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      • Alış Fiyatı: ₺{alisFiyati}/kg
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      • Satış Fiyatı: ₺{satisFiyati}/kg
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      • Net Fire Zararı: ₺{fiyatFarki.toFixed(2)}/kg
                                    </Typography>
                                    {formData.includeLabor && (
                                      <Typography variant="body2" color="text.secondary">
                                        • İşçilik ve Genel Gider (%30): +₺{laborCost.toFixed(2)}
                                      </Typography>
                                    )}
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box sx={{ 
                                    p: 2, 
                                    bgcolor: 'warning.main', 
                                    borderRadius: 2, 
                                    color: 'white',
                                    textAlign: 'center',
                                    width: '100%'
                                  }}>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                      Toplam Fire Maliyeti
                                    </Typography>
                                    <Typography variant="h6" fontWeight="700">
                                      ₺{netZarar.toFixed(2)}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            );
                          }
                          
                          return (
                            <Typography variant="body2" color="text.secondary">
                              Malzeme bilgileri bulunamadı
                            </Typography>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Net Fire Maliyeti"
                    type="number"
                    value={calculateDynamicCost()}
                    disabled
                    InputProps={{
                      startAdornment: <InputAdornment position="start" sx={{ minWidth: '25px', flexShrink: 0 }}>₺</InputAdornment>
                    }}
                    helperText="Malzeme maliyet ayarlarından otomatik hesaplanır"
                    color="warning"
                  />
                </Grid>
                
                {/* Fire hesaplama detayları - TUTARLI */}
                {formData.malzemeTuru && materialPricings.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card sx={{ 
                      bgcolor: 'grey.50', 
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}>
                      <CardContent sx={{ py: 2 }}>
                    {(() => {
                      const selectedMaterial = materialPricings.find(
                        mat => mat.malzemeTuru === formData.malzemeTuru && mat.aktif
                      );
                      
                      if (selectedMaterial && formData.agirlik > 0) {
                            const alisFiyati = selectedMaterial.alisKgFiyati;
                            const satisFiyati = selectedMaterial.satisKgFiyati || 0;
                            const fiyatFarki = alisFiyati - satisFiyati;
                            const baseMaliyet = formData.agirlik * fiyatFarki;
                            const laborCost = formData.includeLabor ? baseMaliyet * 0.30 : 0;
                            const netZarar = Math.max(0, baseMaliyet + laborCost);
                        
                        return (
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                <strong>Hesaplama:</strong> {formData.agirlik} kg × (₺{alisFiyati} - ₺{satisFiyati}) = ₺{baseMaliyet.toFixed(2)}
                                {formData.includeLabor && <> + %30 İşçilik (₺{laborCost.toFixed(2)})</>}
                                = <strong>₺{netZarar.toFixed(2)} Toplam Fire Maliyeti</strong>
                          </Typography>
                        );
                      }
                      
                          return (
                            <Typography variant="body2" color="text.secondary">
                              Hesaplama için malzeme türü ve ağırlık gerekli
                            </Typography>
                          );
                    })()}
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </>
            ) : (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Maliyet (₺)"
                  type="number"
                  value={formData.maliyet}
                  onChange={(e) => setFormData({...formData, maliyet: parseFloat(e.target.value) || 0})}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₺</InputAdornment>
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="date"
                label="Tarih"
                value={formData.tarih}
                onChange={(e) => setFormData({...formData, tarih: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Durumu</InputLabel>
                <Select
                  value={formData.durum}
                  onChange={(e) => setFormData({...formData, durum: e.target.value})}
                  label="Durumu"
                >
                  <MenuItem value="aktif">Aktif</MenuItem>
                  <MenuItem value="pasif">Pasif</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* ✅ YENİ: Açıklama Alanı - Genel kategoride zorunlu */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required={formData.aracKategorisi === 'Genel'}
                label={formData.aracKategorisi === 'Genel' ? "Açıklama (Zorunlu)" : "Açıklama (İsteğe Bağlı)"}
                multiline
                rows={formData.aracKategorisi === 'Genel' ? 3 : 2}
                value={formData.aciklama}
                onChange={(e) => setFormData({...formData, aciklama: e.target.value})}
                placeholder={
                  formData.aracKategorisi === 'Genel' 
                    ? "Genel kategori için detaylı açıklama zorunludur. Hangi saha hurdaları, genel fire vs. olduğunu belirtiniz..."
                    : "Maliyet kaydıyla ilgili detaylı açıklama yazabilirsiniz..."
                }
                helperText={
                  formData.aracKategorisi === 'Genel'
                    ? "⚠️ Genel kategori seçildi - açıklama zorunludur"
                    : "Problem açıklaması, öneriler veya notlarınızı buraya yazabilirsiniz"
                }
                error={formData.aracKategorisi === 'Genel' && !formData.aciklama?.trim()}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={
              // 🔧 BASİTLEŞTİRİLMİŞ VALİDASYON: Sadece temel alanlar zorunlu
              !formData.maliyetTuru || 
              !formData.birim || 
              (!formData.aracKategorisi && !formData.arac) || // Kategori veya eski araç seçimi zorunlu
              (formData.aracKategorisi && formData.aracKategorisi !== 'Genel' && !formData.aracModeli) || // Genel hariç kategori seçilmişse model zorunlu
              (formData.aracKategorisi === 'Genel' && !formData.aciklama?.trim()) // Genel kategoride açıklama zorunlu
              // 🚀 AĞIR VALİDASYON KALDIRILDI: calculateDynamicCost kontrolü kaldırıldı
            }
          >
            {editingEntry ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Silme Onayı</DialogTitle>
        <DialogContent>
          <Typography>
            Bu maliyet kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>İptal</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ YENİ: Detay Görüntüleme Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <VisibilityIcon color="info" />
            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold">
                {selectedDetailEntry?.birimAnalizi ? 'Birim Analizi Detayları' :
                 selectedDetailEntry?.uretimDetaylari ? 'Üretim Kaydı Detayları' :
                 'Maliyet Kaydı Detayları'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedDetailEntry?.parcaKodu && `Parça: ${selectedDetailEntry.parcaKodu} • `}
                {selectedDetailEntry?.birim && `Birim: ${getDisplayName(selectedDetailEntry.birim, birimler)} • `}
                ID: {selectedDetailEntry?.id}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDetailEntry && (
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
                            label={getDisplayName(selectedDetailEntry.maliyetTuru, maliyetTurleri)}
                            color={getMaliyetTuruColor(selectedDetailEntry.maliyetTuru)}
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
                            ₺{selectedDetailEntry.maliyet.toLocaleString('tr-TR')}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Birim/Departman
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {getDisplayName(selectedDetailEntry.birim, birimler)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Araç/Model
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {selectedDetailEntry.aracModeli || getDisplayName(selectedDetailEntry.arac, araclar)}
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
                      {selectedDetailEntry.parcaKodu && (
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
                              {selectedDetailEntry.parcaKodu}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      
                      {selectedDetailEntry.malzemeTuru && (
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Malzeme Türü
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedDetailEntry.malzemeTuru}
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {selectedDetailEntry.agirlik > 0 && (
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Ağırlık
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedDetailEntry.agirlik} kg
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {selectedDetailEntry.miktar > 0 && (
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Miktar
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedDetailEntry.miktar} {selectedDetailEntry.unit || 'adet'}
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {selectedDetailEntry.birimMaliyet > 0 && (
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Birim Maliyet
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              ₺{selectedDetailEntry.birimMaliyet.toLocaleString('tr-TR')}
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {selectedDetailEntry.kgMaliyet > 0 && (
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              KG Maliyeti/Satış Fiyatı
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              ₺{selectedDetailEntry.kgMaliyet.toLocaleString('tr-TR')}/kg
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {selectedDetailEntry.parcaMaliyeti > 0 && (
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Parça Maliyeti (Orijinal)
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              ₺{selectedDetailEntry.parcaMaliyeti.toLocaleString('tr-TR')}
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
                <Card>
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
                            {new Date(selectedDetailEntry.tarih).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Durum
                          </Typography>
                          <Chip
                            label={selectedDetailEntry.durum === 'aktif' ? 'Aktif' : 'Pasif'}
                            color={selectedDetailEntry.durum === 'aktif' ? 'success' : 'default'}
                            size="medium"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Grid>
                      
                      {selectedDetailEntry.olusturmaTarihi && (
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Oluşturma Tarihi
                            </Typography>
                            <Typography variant="body2">
                              {new Date(selectedDetailEntry.olusturmaTarihi).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Box>
                        </Grid>
                      )}

                      {selectedDetailEntry.guncellemeTarihi && (
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Son Güncelleme
                            </Typography>
                            <Typography variant="body2">
                              {new Date(selectedDetailEntry.guncellemeTarihi).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* ✅ YENİ: Birim Analizi Detayları */}
              {selectedDetailEntry.birimAnalizi && (
                <Grid item xs={12}>
                  <Card sx={{ mb: 2, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                    <CardContent>
                      <Typography variant="h6" color="info.main" gutterBottom>
                        Birim Analizi Detayları
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Birim Adı
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>
                              {selectedDetailEntry.birimAnalizi.birimAdi}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Toplam Maliyet
                            </Typography>
                            <Typography variant="h6" color="error.main" fontWeight={600}>
                              ₺{selectedDetailEntry.birimAnalizi.toplamMaliyet.toLocaleString('tr-TR')}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Kayıt Sayısı
                            </Typography>
                            <Typography variant="h6" color="primary.main" fontWeight={600}>
                              {selectedDetailEntry.birimAnalizi.kayitSayisi} kayıt
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Kritiklik Seviyesi
                            </Typography>
                            <Chip
                              label={selectedDetailEntry.birimAnalizi.kritiklikSeviyesi}
                              color={
                                selectedDetailEntry.birimAnalizi.kritiklikSeviyesi === 'YÜKSEK' ? 'error' :
                                selectedDetailEntry.birimAnalizi.kritiklikSeviyesi === 'ORTA' ? 'warning' : 'success'
                              }
                              size="medium"
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* ✅ YENİ: Üretim Kaydı Detayları */}
              {selectedDetailEntry.uretimDetaylari && (
                <Grid item xs={12}>
                  <Card sx={{ mb: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
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
                            <Typography variant="h6" fontWeight={600}>
                              {selectedDetailEntry.uretimDetaylari.donem}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Üretilen Araç Sayısı
                            </Typography>
                            <Typography variant="h6" color="success.main" fontWeight={600}>
                              {selectedDetailEntry.uretimDetaylari.uretilenAracSayisi} adet
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Gerçekleşme Oranı
                            </Typography>
                            <Typography variant="h6" color="warning.main" fontWeight={600}>
                              %{selectedDetailEntry.uretimDetaylari.gerceklesmeOrani || 0}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Açıklama */}
              {selectedDetailEntry.aciklama && (
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
                        {selectedDetailEntry.aciklama}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* ✅ YENİ: Ham Veri Debug (Sadece development için) */}
              {process.env.NODE_ENV === 'development' && selectedDetailEntry._rawData && (
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
                        {JSON.stringify(selectedDetailEntry._rawData, null, 2)}
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
              setDetailDialogOpen(false);
              handleEdit(selectedDetailEntry);
            }}
            variant="outlined"
          >
            Düzenle
          </Button>
          <Button onClick={() => setDetailDialogOpen(false)} variant="contained">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ✅ YENİ: Birim Maliyet Ayarları Komponenti - TABLO FORMATINDA
const CostSettingsComponent: React.FC<{
  filteredData?: any[]
}> = ({ filteredData = [] }) => {
  const [unitCostSettings, setUnitCostSettings] = useState<{ [key: string]: { saatlik: number, dakikalik: number } }>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Birimler listesi - görseldeki gibi
  const birimler = useMemo(() => [
    { value: 'arge', label: 'Ar-Ge' },
    { value: 'boyahane', label: 'Boyahane' },
    { value: 'bukum', label: 'Büküm' },
    { value: 'depo', label: 'Depo' },
    { value: 'elektrikhane', label: 'Elektrikhane' },
    { value: 'idari_isler', label: 'İdari İşler' },
    { value: 'kalite_kontrol', label: 'Kalite Kontrol' },
    { value: 'kaynakhane', label: 'Kaynakhane' },
    { value: 'kesim', label: 'Kesim' },
    { value: 'mekanik_montaj', label: 'Mekanik Montaj' },
    { value: 'satin_alma', label: 'Satın Alma' },
    { value: 'satis', label: 'Satış' },
    { value: 'ssh', label: 'SSH' },
    { value: 'uretim_planlama', label: 'Üretim Planlama' }
  ], []);

  // Varsayılan ayarları oluştur
  const initializeDefaultSettings = useCallback(() => {
    const defaultSettings: { [key: string]: { saatlik: number, dakikalik: number } } = {};
    
    birimler.forEach(birim => {
      // Birim türüne göre varsayılan saatlik maliyetler
      let defaultSaatlik = 25.00; // Genel varsayılan
      
      switch (birim.value) {
        case 'kaynakhane':
          defaultSaatlik = 30.00;
          break;
        case 'mekanik_montaj':
          defaultSaatlik = 25.00;
          break;
        case 'elektrikhane':
          defaultSaatlik = 28.00;
          break;
        case 'bukum':
          defaultSaatlik = 22.00;
          break;
        case 'kesim':
          defaultSaatlik = 20.00;
          break;
        case 'boyahane':
          defaultSaatlik = 18.00;
          break;
        case 'kalite_kontrol':
          defaultSaatlik = 27.00;
          break;
        case 'arge':
          defaultSaatlik = 35.00;
          break;
        case 'idari_isler':
          defaultSaatlik = 24.00;
          break;
        case 'satin_alma':
          defaultSaatlik = 22.00;
          break;
        case 'satis':
          defaultSaatlik = 26.00;
          break;
        case 'ssh':
          defaultSaatlik = 24.00;
          break;
        case 'uretim_planlama':
          defaultSaatlik = 28.00;
          break;
        case 'depo':
          defaultSaatlik = 16.00;
          break;
        default:
          defaultSaatlik = 25.00;
      }
      
      defaultSettings[birim.value] = {
        saatlik: defaultSaatlik,
        dakikalik: parseFloat((defaultSaatlik / 60).toFixed(3))
      };
    });
    
    setUnitCostSettings(defaultSettings);
    localStorage.setItem('unit-cost-settings-v2', JSON.stringify(defaultSettings));
  }, [birimler]);

  // localStorage'dan ayarları yükle - SADECE BİR KEZ
  useEffect(() => {
    if (!isInitialized) {
      const savedSettings = localStorage.getItem('unit-cost-settings-v2');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setUnitCostSettings(parsedSettings);
        } catch (error) {
          console.error('Birim maliyet ayarları yüklenirken hata:', error);
          initializeDefaultSettings();
        }
      } else {
        initializeDefaultSettings();
      }
      setIsInitialized(true);
    }
  }, [isInitialized, initializeDefaultSettings]);

  // Ayarları localStorage'a kaydet - SADECE değişiklik olduğunda
  useEffect(() => {
    if (isInitialized && Object.keys(unitCostSettings).length > 0) {
      localStorage.setItem('unit-cost-settings-v2', JSON.stringify(unitCostSettings));
    }
  }, [unitCostSettings, isInitialized]);

  // Global fonksiyon - maliyet kayıtlarında kullanım için
  useEffect(() => {
    if (isInitialized) {
      (window as any).getUnitCostSettings = () => unitCostSettings;
      (window as any).getUnitCost = (birim: string, timeUnit: 'saat' | 'dakika') => {
        const settings = unitCostSettings[birim];
        if (!settings) return 0;
        return timeUnit === 'saat' ? settings.saatlik : settings.dakikalik;
      };
    }
  }, [unitCostSettings, isInitialized]);

  // Saatlik maliyet değiştirme
  const handleSaatlikChange = useCallback((birimValue: string, saatlikMaliyet: number) => {
    const dakikalikMaliyet = parseFloat((saatlikMaliyet / 60).toFixed(3));
    
    setUnitCostSettings(prev => ({
      ...prev,
      [birimValue]: {
        saatlik: saatlikMaliyet,
        dakikalik: dakikalikMaliyet
      }
    }));
  }, []);

  // Dakikalık maliyet değiştirme
  const handleDakikalikChange = useCallback((birimValue: string, dakikalikMaliyet: number) => {
    const saatlikMaliyet = parseFloat((dakikalikMaliyet * 60).toFixed(2));
    
    setUnitCostSettings(prev => ({
      ...prev,
      [birimValue]: {
        saatlik: saatlikMaliyet,
        dakikalik: dakikalikMaliyet
      }
    }));
  }, []);



  return (
    <Box>

        {/* Profesyonel Birim Maliyet Tablosu */}
        <TableContainer 
          component={Paper} 
          sx={{ 
            border: '2px solid', 
            borderColor: 'primary.main',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 3
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                height: 60
              }}>
                <TableCell sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  minWidth: 200,
                  py: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon />
                    Departman/Birim
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  minWidth: 250,
                  py: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <AccessTimeIcon />
                    Saatlik Maliyet
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  minWidth: 250,
                  py: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <ScheduleIcon />
                    Dakikalık Maliyet
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  minWidth: 150,
                  py: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <UpdateIcon />
                    Son Güncelleme
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {birimler.map((birim, index) => (
                <TableRow 
                  key={birim.value}
                  sx={{ 
                    '&:nth-of-type(odd)': { bgcolor: 'grey.50' },
                    '&:hover': { 
                      bgcolor: 'primary.50',
                      transform: 'scale(1.01)',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: 1
                    },
                    height: 70
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <BusinessIcon fontSize="small" />
                      </Box>
                      <Typography variant="body1" fontWeight="600" color="text.primary">
                        {birim.label}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell align="center">
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      justifyContent: 'center',
                      bgcolor: 'grey.50',
                      p: 1,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        ₺
                      </Typography>
                      <TextField
                        type="number"
                        size="small"
                        value={Number(unitCostSettings[birim.value]?.saatlik || 0).toFixed(2)}
                        onChange={(e) => handleSaatlikChange(birim.value, parseFloat(e.target.value) || 0)}
                        variant="standard"
                        sx={{ 
                          width: 80,
                          '& .MuiInput-root': {
                            fontSize: '0.95rem',
                            fontWeight: 'bold'
                          },
                          '& .MuiInput-input': {
                            textAlign: 'center',
                            padding: '4px 0'
                          }
                        }}
                        inputProps={{
                          step: 0.25,
                          min: 0
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 25 }}>
                        /saat
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell align="center">
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      justifyContent: 'center',
                      bgcolor: 'grey.50',
                      p: 1,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        ₺
                      </Typography>
                      <TextField
                        type="number"
                        size="small"
                        value={Number(unitCostSettings[birim.value]?.dakikalik || 0).toFixed(3)}
                        onChange={(e) => handleDakikalikChange(birim.value, parseFloat(e.target.value) || 0)}
                        variant="standard"
                        sx={{ 
                          width: 80,
                          '& .MuiInput-root': {
                            fontSize: '0.95rem',
                            fontWeight: 'bold'
                          },
                          '& .MuiInput-input': {
                            textAlign: 'center',
                            padding: '4px 0'
                          }
                        }}
                        inputProps={{
                          step: 0.001,
                          min: 0
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 25 }}>
                        /dk
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Box sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      <Typography variant="body2" fontWeight="500" color="text.primary">
                        {new Date().toLocaleDateString('tr-TR')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Bugün
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
    </Box>
  );
};

// ✅ Context7: Professional Material Pricing Management System
// 🧪 Malzeme Fiyat Yönetimi Komponenti
// 🧪 BASİTLEŞTİRİLMİŞ MALZEME FİYAT YÖNETİMİ - Sadece Alış/Satış Fiyatı
const MaterialPricingManagementComponent: React.FC = () => {
  const [materialPricings, setMaterialPricings] = useState<MaterialPricing[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<MaterialPricing | null>(null);
  const [materialFormOpen, setMaterialFormOpen] = useState(false);
  const [materialFormData, setMaterialFormData] = useState<Partial<MaterialPricing>>({});

  // localStorage'dan malzeme fiyatlarını yükle
  useEffect(() => {
    const savedPricings = localStorage.getItem('material-pricings');
    if (savedPricings) {
      try {
        const parsedPricings = JSON.parse(savedPricings);
        setMaterialPricings(parsedPricings);
      } catch (error) {
        console.error('Malzeme fiyatları yüklenirken hata:', error);
        initializeDefaultMaterials();
      }
    } else {
      initializeDefaultMaterials();
    }
  }, []);

  // Varsayılan malzeme fiyatlarını oluştur
  const initializeDefaultMaterials = () => {
    const defaultMaterials: MaterialPricing[] = [
      {
        id: 'mat-s235-001',
        malzemeTuru: 'S235',
        alisKgFiyati: 25.50,
        satisKgFiyati: 8.75,
        fireGeriKazanimOrani: 35,    // Sistem tarafından otomatik hesaplanan
        hurdaGeriKazanimOrani: 85,   // Sistem tarafından otomatik hesaplanan
        guncellemeTarihi: new Date().toISOString(),
        aktif: true,
        aciklama: 'Yapısal çelik'
      },
      {
        id: 'mat-s355-001',
        malzemeTuru: 'S355',
        alisKgFiyati: 28.75,
        satisKgFiyati: 9.25,
        fireGeriKazanimOrani: 40,
        hurdaGeriKazanimOrani: 90,
        guncellemeTarihi: new Date().toISOString(),
        aktif: true,
        aciklama: 'Yüksek mukavemetli çelik'
      },
      {
        id: 'mat-304-001',
        malzemeTuru: '304 Paslanmaz',
        alisKgFiyati: 85.50,
        satisKgFiyati: 45.75,
        fireGeriKazanimOrani: 55,
        hurdaGeriKazanimOrani: 95,
        guncellemeTarihi: new Date().toISOString(),
        aktif: true,
        aciklama: 'Paslanmaz çelik'
      },
      {
        id: 'mat-hardox-001',
        malzemeTuru: 'Hardox460',
        alisKgFiyati: 45.25,
        satisKgFiyati: 12.50,
        fireGeriKazanimOrani: 30,
        hurdaGeriKazanimOrani: 80,
        guncellemeTarihi: new Date().toISOString(),
        aktif: true,
        aciklama: 'Aşınma dayanımlı çelik'
      }
    ];
    
    setMaterialPricings(defaultMaterials);
    localStorage.setItem('material-pricings', JSON.stringify(defaultMaterials));
  };

  // Malzeme fiyatlarını localStorage'a kaydet
  useEffect(() => {
    if (materialPricings.length > 0) {
      localStorage.setItem('material-pricings', JSON.stringify(materialPricings));
    }
  }, [materialPricings]);

  // FAB Event Listener
  useEffect(() => {
    const handleAddNewMaterial = () => {
      handleAddMaterial();
    };

    window.addEventListener('addNewMaterial', handleAddNewMaterial);
    return () => {
      window.removeEventListener('addNewMaterial', handleAddNewMaterial);
    };
  }, []);

  // Yeni malzeme ekleme
  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setMaterialFormData({
      malzemeTuru: 'S235',
      alisKgFiyati: 0,
      satisKgFiyati: 0,
      fireGeriKazanimOrani: 35,
      hurdaGeriKazanimOrani: 85,
      aktif: true
    });
    setMaterialFormOpen(true);
  };

  // Malzeme düzenleme
  const handleEditMaterial = (material: MaterialPricing) => {
    setEditingMaterial(material);
    setMaterialFormData(material);
    setMaterialFormOpen(true);
  };

  // Malzeme kaydetme - BASİTLEŞTİRİLMİŞ
  const handleSaveMaterial = () => {
    if (!materialFormData.malzemeTuru || !materialFormData.alisKgFiyati || !materialFormData.satisKgFiyati) {
      alert('Lütfen malzeme türü, alış fiyatı ve satış fiyatı alanlarını doldurun');
      return;
    }

    // Otomatik geri kazanım oranları (sistem tarafından hesaplanır)
    const getDefaultRecoveryRates = (materialType: MaterialType) => {
      const rates = {
        // Yapısal Çelikler
        'S235': { fire: 35, hurda: 85 }, 'S275': { fire: 37, hurda: 87 }, 'S355': { fire: 40, hurda: 90 },
        'S420': { fire: 42, hurda: 88 }, 'S460': { fire: 45, hurda: 92 },
        // Paslanmaz Çelikler
        '304 Paslanmaz': { fire: 55, hurda: 95 }, '316 Paslanmaz': { fire: 60, hurda: 96 },
        '321 Paslanmaz': { fire: 58, hurda: 94 }, '430 Paslanmaz': { fire: 50, hurda: 90 },
        // Aşınma Dayanımlı
        'Hardox400': { fire: 28, hurda: 78 }, 'Hardox450': { fire: 30, hurda: 80 }, 'Hardox460': { fire: 30, hurda: 80 },
        'Hardox500': { fire: 32, hurda: 82 }, 'Hardox600': { fire: 35, hurda: 85 },
        // Yüksek Mukavemetli
        'S690': { fire: 48, hurda: 88 }, 'S890': { fire: 50, hurda: 90 }, 'S960': { fire: 52, hurda: 92 },
        // Özel Alaşımlar
        'Cor-Ten A': { fire: 40, hurda: 85 }, 'Cor-Ten B': { fire: 42, hurda: 87 }, 'Weathering Steel': { fire: 38, hurda: 83 },
        // Alüminyum
        'Al 1050': { fire: 70, hurda: 98 }, 'Al 3003': { fire: 68, hurda: 97 }, 'Al 5754': { fire: 65, hurda: 96 }, 'Al 6061': { fire: 72, hurda: 98 },
        // Galvaniz
        'DX51D+Z': { fire: 25, hurda: 75 }, 'DX52D+Z': { fire: 27, hurda: 77 }, 'DX53D+Z': { fire: 30, hurda: 80 },
        // Diğer
        'Diğer': { fire: 30, hurda: 75 }
      };
      return rates[materialType] || rates['Diğer'];
    };

    const recoveryRates = getDefaultRecoveryRates(materialFormData.malzemeTuru!);

    const materialData: MaterialPricing = {
      id: editingMaterial?.id || `mat-${Date.now()}`,
      malzemeTuru: materialFormData.malzemeTuru!,
      alisKgFiyati: materialFormData.alisKgFiyati!,
      satisKgFiyati: materialFormData.satisKgFiyati!,
      fireGeriKazanimOrani: recoveryRates.fire,      // Otomatik hesaplanan
      hurdaGeriKazanimOrani: recoveryRates.hurda,    // Otomatik hesaplanan
      guncellemeTarihi: new Date().toISOString(),
      aktif: materialFormData.aktif !== false,
      aciklama: materialFormData.aciklama || ''
    };

    if (editingMaterial) {
      setMaterialPricings(prev => 
        prev.map(mat => mat.id === editingMaterial.id ? materialData : mat)
      );
    } else {
      setMaterialPricings(prev => [...prev, materialData]);
    }

    setMaterialFormOpen(false);
    setEditingMaterial(null);
    setMaterialFormData({});
    
    // Başarı mesajı
    const action = editingMaterial ? 'güncellendi' : 'eklendi';
    alert(`${materialFormData.malzemeTuru} malzeme fiyatı başarıyla ${action}!`);
  };

  // Malzeme silme
  const handleDeleteMaterial = (materialId: string) => {
    if (window.confirm('Bu malzeme fiyatını silmek istediğinizden emin misiniz?')) {
      setMaterialPricings(prev => prev.filter(mat => mat.id !== materialId));
    }
  };

  const getMaterialTypeColor = (type: MaterialType) => {
    const colors = {
      // Yapısal Çelikler - Mavi tonları
      'S235': '#2196F3', 'S275': '#1976D2', 'S355': '#1565C0', 'S420': '#0D47A1', 'S460': '#0277BD',
      // Paslanmaz Çelikler - Turuncu tonları  
      '304 Paslanmaz': '#FF9800', '316 Paslanmaz': '#F57C00', '321 Paslanmaz': '#EF6C00', '430 Paslanmaz': '#E65100',
      // Aşınma Dayanımlı - Mor tonları
      'Hardox400': '#9C27B0', 'Hardox450': '#8E24AA', 'Hardox460': '#7B1FA2', 'Hardox500': '#6A1B9A', 'Hardox600': '#4A148C',
      // Yüksek Mukavemetli - Yeşil tonları
      'S690': '#4CAF50', 'S890': '#388E3C', 'S960': '#2E7D32',
      // Özel Alaşımlar - Kahverengi tonları
      'Cor-Ten A': '#8D6E63', 'Cor-Ten B': '#6D4C41', 'Weathering Steel': '#5D4037',
      // Alüminyum - Gri tonları
      'Al 1050': '#9E9E9E', 'Al 3003': '#757575', 'Al 5754': '#616161', 'Al 6061': '#424242',
      // Galvaniz - Cyan tonları
      'DX51D+Z': '#00BCD4', 'DX52D+Z': '#0097A7', 'DX53D+Z': '#00838F',
      // Diğer
      'Diğer': '#757575'
    };
    return colors[type] || colors['Diğer'];
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddMaterial}
          >
            Yeni Malzeme Ekle
          </Button>
        </Box>

        {/* BASİTLEŞTİRİLMİŞ TABLO GÖRÜNÜMÜ */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Malzeme Türü</strong></TableCell>
                <TableCell align="right"><strong>Alış Fiyatı (₺/kg)</strong></TableCell>
                <TableCell align="right"><strong>Satış Fiyatı (₺/kg)</strong></TableCell>
                <TableCell align="center"><strong>Durum</strong></TableCell>
                <TableCell align="center"><strong>İşlemler</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materialPricings.map((material) => (
                <TableRow 
                  key={material.id}
                  sx={{ 
                    opacity: material.aktif ? 1 : 0.6,
                    borderLeft: '4px solid',
                    borderLeftColor: getMaterialTypeColor(material.malzemeTuru)
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: getMaterialTypeColor(material.malzemeTuru) 
                        }} 
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {material.malzemeTuru}
                      </Typography>
                    </Box>
                    {material.aciklama && (
                      <Typography variant="caption" color="text.secondary">
                        {material.aciklama}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      ₺{material.alisKgFiyati.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      ₺{material.satisKgFiyati.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={material.aktif ? 'Aktif' : 'Pasif'}
                      size="small"
                      color={material.aktif ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      {/* ✅ YENİ: Malzeme Detay Görüntüleme Butonu */}
                      <Tooltip title="Malzeme Detaylarını Görüntüle">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            // Malzeme bazlı detay görüntüleme için özel bir kayıt oluştur
                            const materialDetailRecord = {
                              id: `material_${material.id}`,
                              maliyetTuru: 'material_pricing',
                              malzemeTuru: material.malzemeTuru,
                              maliyet: material.alisKgFiyati,
                              tarih: material.guncellemeTarihi || new Date().toISOString(),
                              durum: material.aktif ? 'aktif' : 'pasif',
                              parcaKodu: `MAT-${material.malzemeTuru.toUpperCase()}`,
                              aciklama: `${material.malzemeTuru} malzeme fiyat bilgileri - Alış: ₺${material.alisKgFiyati}/kg, Satış: ₺${material.satisKgFiyati}/kg`,
                              // Ek malzeme verileri
                              malzemeDetaylari: {
                                malzemeTuru: material.malzemeTuru,
                                alisKgFiyati: material.alisKgFiyati,
                                satisKgFiyati: material.satisKgFiyati,
                                fireGeriKazanimOrani: material.fireGeriKazanimOrani,
                                hurdaGeriKazanimOrani: material.hurdaGeriKazanimOrani,
                                aktif: material.aktif,
                                aciklama: material.aciklama,
                                guncellemeTarihi: material.guncellemeTarihi
                              }
                            };
                            console.log('🔍 Material Table Görüntüle Butonu Tıklandı:', materialDetailRecord);
                            if ((window as any).handleViewDetails) {
                              console.log('✅ Global handleViewDetails bulundu, çağırılıyor...');
                              (window as any).handleViewDetails(materialDetailRecord);
                            } else {
                              console.log('❌ Global handleViewDetails bulunamadı!');
                              console.log('📊 Malzeme detay kayıtları:', materialDetailRecord);
                              alert('⚠️ Detay görüntüleme servisi başlatılıyor, lütfen birkaç saniye bekleyip tekrar deneyin.');
                            }
                          }}
                          sx={{ color: 'info.main' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <IconButton
                        size="small"
                        onClick={() => handleEditMaterial(material)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteMaterial(material.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

             {/* BASİTLEŞTİRİLMİŞ Malzeme Ekleme/Düzenleme Dialog */}
      <Dialog 
        open={materialFormOpen} 
        onClose={() => setMaterialFormOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingMaterial ? 'Malzeme Fiyatını Düzenle' : 'Yeni Malzeme Fiyatı Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Malzeme Türü</InputLabel>
                <Select
                  value={materialFormData.malzemeTuru || ''}
                  onChange={(e) => setMaterialFormData(prev => ({ ...prev, malzemeTuru: e.target.value as MaterialType }))}
                  label="Malzeme Türü"
                >
                  {/* Yapısal Çelikler */}
                  <ListSubheader>Yapısal Çelikler</ListSubheader>
                  <MenuItem value="S235">S235 - Yapısal Çelik</MenuItem>
                  <MenuItem value="S275">S275 - Yapısal Çelik</MenuItem>
                  <MenuItem value="S355">S355 - Yüksek Mukavemetli</MenuItem>
                  <MenuItem value="S420">S420 - Yüksek Mukavemetli</MenuItem>
                  <MenuItem value="S460">S460 - Yüksek Mukavemetli</MenuItem>
                  
                  {/* Paslanmaz Çelikler */}
                  <ListSubheader>Paslanmaz Çelikler</ListSubheader>
                  <MenuItem value="304 Paslanmaz">304 Paslanmaz</MenuItem>
                  <MenuItem value="316 Paslanmaz">316 Paslanmaz</MenuItem>
                  <MenuItem value="321 Paslanmaz">321 Paslanmaz</MenuItem>
                  <MenuItem value="430 Paslanmaz">430 Paslanmaz</MenuItem>
                  
                  {/* Aşınma Dayanımlı Çelikler */}
                  <ListSubheader>Aşınma Dayanımlı Çelikler</ListSubheader>
                  <MenuItem value="Hardox400">Hardox400</MenuItem>
                  <MenuItem value="Hardox450">Hardox450</MenuItem>
                  <MenuItem value="Hardox460">Hardox460</MenuItem>
                  <MenuItem value="Hardox500">Hardox500</MenuItem>
                  <MenuItem value="Hardox600">Hardox600</MenuItem>
                  
                  {/* Yüksek Mukavemetli Çelikler */}
                  <ListSubheader>Yüksek Mukavemetli Çelikler</ListSubheader>
                  <MenuItem value="S690">S690</MenuItem>
                  <MenuItem value="S890">S890</MenuItem>
                  <MenuItem value="S960">S960</MenuItem>
                  
                  {/* Özel Alaşımlar */}
                  <ListSubheader>Özel Alaşımlar</ListSubheader>
                  <MenuItem value="Cor-Ten A">Cor-Ten A - Atmosfer Dayanımlı</MenuItem>
                  <MenuItem value="Cor-Ten B">Cor-Ten B - Atmosfer Dayanımlı</MenuItem>
                  <MenuItem value="Weathering Steel">Weathering Steel</MenuItem>
                  
                  {/* Alüminyum Alaşımlar */}
                  <ListSubheader>Alüminyum Alaşımlar</ListSubheader>
                  <MenuItem value="Al 1050">Al 1050 - Saf Alüminyum</MenuItem>
                  <MenuItem value="Al 3003">Al 3003 - Genel Amaçlı</MenuItem>
                  <MenuItem value="Al 5754">Al 5754 - Denizcilik</MenuItem>
                  <MenuItem value="Al 6061">Al 6061 - Yapısal</MenuItem>
                  
                  {/* Galvaniz ve Kaplama */}
                  <ListSubheader>Galvaniz ve Kaplama</ListSubheader>
                  <MenuItem value="DX51D+Z">DX51D+Z - Galvanizli</MenuItem>
                  <MenuItem value="DX52D+Z">DX52D+Z - Galvanizli</MenuItem>
                  <MenuItem value="DX53D+Z">DX53D+Z - Galvanizli</MenuItem>
                  
                  {/* Diğer */}
                  <ListSubheader>Diğer</ListSubheader>
                  <MenuItem value="Diğer">Diğer Malzeme</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Alış Fiyatı"
                type="number"
                value={materialFormData.alisKgFiyati || ''}
                onChange={(e) => setMaterialFormData(prev => ({ ...prev, alisKgFiyati: parseFloat(e.target.value) || 0 }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/kg</InputAdornment>
                }}
                helperText="Malzeme satın alma fiyatı"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Satış Fiyatı"
                type="number"
                value={materialFormData.satisKgFiyati || ''}
                onChange={(e) => setMaterialFormData(prev => ({ ...prev, satisKgFiyati: parseFloat(e.target.value) || 0 }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/kg</InputAdornment>
                }}
                helperText="Hurda/Fire satış fiyatı"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={materialFormData.aktif !== false}
                    onChange={(e) => setMaterialFormData(prev => ({ ...prev, aktif: e.target.checked }))}
                  />
                }
                label="Bu malzeme fiyatını aktif olarak kullan"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Açıklama (Opsiyonel)"
                value={materialFormData.aciklama || ''}
                onChange={(e) => setMaterialFormData(prev => ({ ...prev, aciklama: e.target.value }))}
                placeholder="Örn: Genel kullanım malzemesi"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaterialFormOpen(false)}>
            İptal
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveMaterial}
          >
            {editingMaterial ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ✅ Context7: Professional Cost Settings System - Centralized Management
// 🎯 Akıllı Hedef Yönetimi Komponenti
const SmartTargetManagementComponent: React.FC<{ 
  realTimeData?: any, 
  filteredData?: any[],
  onDataRefresh?: () => void
}> = ({ realTimeData, filteredData = [], onDataRefresh }) => {
  const [vehicleTargets, setVehicleTargets] = useState<VehicleTarget[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'ay' | 'ceyrek' | 'yil'>('ay');
  const [selectedVehicles, setSelectedVehicles] = useState<VehicleModel[]>([]);
  const [bulkTargetDialogOpen, setBulkTargetDialogOpen] = useState(false);
  const [targetFormData, setTargetFormData] = useState<Partial<VehicleTarget>>({});
  const [editingTarget, setEditingTarget] = useState<VehicleTarget | null>(null);
  const [editTargetDialogOpen, setEditTargetDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // localStorage'dan hedefleri yükle ve eski formatları güncelle
  useEffect(() => {
    const savedTargets = localStorage.getItem('vehicle-targets');
    if (savedTargets) {
      try {
        const parsedTargets = JSON.parse(savedTargets);
        
        // Eski formatları yeni formata dönüştür
        const updatedTargets = parsedTargets.map((target: VehicleTarget) => {
          if (target.donem.includes('MONTHLY')) {
            return {
              ...target,
              donem: target.donem.replace('-MONTHLY', ' Yılı Aylık Hedef')
            };
          } else if (target.donem.includes('QUARTERLY')) {
            return {
              ...target,
              donem: target.donem.replace('-QUARTERLY', ' Yılı Çeyreklik Hedef')
            };
          } else if (target.donem.match(/^\d{4}$/)) {
            return {
              ...target,
              donem: `${target.donem} Yılı Hedef`
            };
          }
          return target;
        });
        
        // Güncellenen hedefleri kaydet
        if (JSON.stringify(parsedTargets) !== JSON.stringify(updatedTargets)) {
          localStorage.setItem('vehicle-targets', JSON.stringify(updatedTargets));
          console.log('🔄 Hedef formatları güncellendi');
        }
        
        setVehicleTargets(updatedTargets);
      } catch (error) {
        console.error('Hedefler yüklenirken hata:', error);
      }
    }
  }, []);

  // Hedefleri localStorage'a kaydet
  useEffect(() => {
    if (vehicleTargets.length > 0) {
      localStorage.setItem('vehicle-targets', JSON.stringify(vehicleTargets));
    }
  }, [vehicleTargets]);

  // 🚗 KATEGORİ BAZLI hedef yönetimi 
  const vehicleCategories: VehicleCategory[] = [
    'Kompakt Araçlar',
    'Araç Üstü Vakumlu', 
    'Çekilir Tip Mekanik Süpürgeler',
    'Kompost Makinesi',
    'Çay Toplama Makinesi',
    'Rusya Motor Odası',
    'HSCK'
  ];

  const [selectedCategories, setSelectedCategories] = useState<VehicleCategory[]>([]);

  // 🔄 ESKİ HEDEFLERİ TEMİZLEME FONKSİYONU
  const clearOldTargetsAndReset = () => {
    if (window.confirm('⚠️ Eski hedef sistemi temizlenecek ve yeni template sistemi aktif edilecek.\n\nBu işlem geri alınamaz. Devam etmek istiyor musunuz?')) {
      // localStorage'daki eski hedefleri temizle
      localStorage.removeItem('vehicle-targets');
      
      // State'i sıfırla
      setVehicleTargets([]);
      
      // Veri yenileme tetikle
      if (onDataRefresh) {
        onDataRefresh();
      }
      
      alert('✅ Eski hedefler temizlendi! Artık yeni template sistemi ile hedef oluşturabilirsiniz.');
    }
  };

  // 🚗 KATEGORİ BAZLI toplu hedef belirleme - DÜZELTME: Her dönem için geçerli hedefler
  const handleBulkTargetSet = () => {
    if (selectedCategories.length === 0) {
      alert('Lütfen en az bir kategori seçin');
      return;
    }

    const currentYear = new Date().getFullYear();
    const newTargets: VehicleTarget[] = [];

    selectedCategories.forEach(kategori => {
      const currentDate = new Date().toISOString();
      
      if (selectedPeriod === 'ay') {
        // 🗓️ AYLIK HEDEF: Tek aylık hedef template'i - tüm aylar için aynı hedef geçerli
        newTargets.push({
          id: `target-${kategori}-${currentYear}-monthly-${Date.now()}`,
          kategori,
          donem: `${currentYear} Yılı Aylık Hedef`, // Profesyonel görünüm
          donemTuru: 'ay',
          hedefler: {
            maksRetAdet: 5,        // Aylık hedef
            maksRetMaliyet: 10000,
            maksHurdaKg: 10,
            maksHurdaMaliyet: 5000,
            maksFireKg: 5,
            maksFireMaliyet: 3000,
            toplamMaksimumMaliyet: 20000,
            hedefVerimlilik: 85
          },
          gerceklesme: {
            guncelRetAdet: 0,
            guncelRetMaliyet: 0,
            guncelHurdaKg: 0,
            guncelHurdaMaliyet: 0,
            guncelFireKg: 0,
            guncelFireMaliyet: 0,
            toplamMaliyet: 0,
            mevcutVerimlilik: 100
          },
          performans: {
            retPerformans: 100,
            hurdaPerformans: 100,
            firePerformans: 100,
            toplamPerformans: 100,
            status: 'hedef_altinda'
          },
          createdDate: currentDate,
          updatedDate: currentDate,
          createdBy: 'Sistem',
          isActive: true
        });
      } else if (selectedPeriod === 'ceyrek') {
        // 🗓️ ÇEYREKLİK HEDEF: Tek çeyreklik hedef template'i
        newTargets.push({
          id: `target-${kategori}-${currentYear}-quarterly-${Date.now()}`,
          kategori,
          donem: `${currentYear} Yılı Çeyreklik Hedef`, // Profesyonel görünüm
          donemTuru: 'ceyrek',
          hedefler: {
            maksRetAdet: 15,      // Çeyreklik hedef (3 aylık)
            maksRetMaliyet: 30000,
            maksHurdaKg: 30,
            maksHurdaMaliyet: 15000,
            maksFireKg: 15,
            maksFireMaliyet: 9000,
            toplamMaksimumMaliyet: 60000,
            hedefVerimlilik: 85
          },
          gerceklesme: {
            guncelRetAdet: 0,
            guncelRetMaliyet: 0,
            guncelHurdaKg: 0,
            guncelHurdaMaliyet: 0,
            guncelFireKg: 0,
            guncelFireMaliyet: 0,
            toplamMaliyet: 0,
            mevcutVerimlilik: 100
          },
          performans: {
            retPerformans: 100,
            hurdaPerformans: 100,
            firePerformans: 100,
            toplamPerformans: 100,
            status: 'hedef_altinda'
          },
          createdDate: currentDate,
          updatedDate: currentDate,
          createdBy: 'Sistem',
          isActive: true
        });
      } else {
        // 🗓️ YILLIK HEDEF: Tek yıllık hedef
        newTargets.push({
          id: `target-${kategori}-${currentYear}-yearly-${Date.now()}`,
          kategori,
          donem: `${currentYear} Yılı Hedef`,
          donemTuru: 'yil',
          hedefler: {
            maksRetAdet: 60,      // Yıllık hedef (12 aylık)
            maksRetMaliyet: 120000,
            maksHurdaKg: 120,
            maksHurdaMaliyet: 60000,
            maksFireKg: 60,
            maksFireMaliyet: 36000,
            toplamMaksimumMaliyet: 240000,
            hedefVerimlilik: 85
          },
          gerceklesme: {
            guncelRetAdet: 0,
            guncelRetMaliyet: 0,
            guncelHurdaKg: 0,
            guncelHurdaMaliyet: 0,
            guncelFireKg: 0,
            guncelFireMaliyet: 0,
            toplamMaliyet: 0,
            mevcutVerimlilik: 100
          },
          performans: {
            retPerformans: 100,
            hurdaPerformans: 100,
            firePerformans: 100,
            toplamPerformans: 100,
            status: 'hedef_altinda'
          },
          createdDate: currentDate,
          updatedDate: currentDate,
          createdBy: 'Sistem',
          isActive: true
        });
      }
    });

    setVehicleTargets(prev => [...prev, ...newTargets]);
    setBulkTargetDialogOpen(false);
    setSelectedCategories([]);
    
    // ✅ REAL-TIME UPDATE: Hedef oluşturulduktan sonra araç bazlı takip modülünü güncelle
    if (onDataRefresh) {
      onDataRefresh();
    }
    
    // Bilgilendirme mesajı
    const totalTargets = newTargets.length;
    const periodText = selectedPeriod === 'ay' ? 'aylık hedef şablonu' : 
                      selectedPeriod === 'ceyrek' ? 'çeyreklik hedef şablonu' : 'yıllık hedef';
    alert(`✅ ${selectedCategories.length} kategori için ${periodText} başarıyla oluşturuldu!\n\n📊 Toplam ${totalTargets} hedef şablonu aktif\n\n📋 Hedef Şablonu Sistemi:\n• Aylık: Tüm aylar için aynı hedef değerleri\n• Çeyreklik: Tüm çeyrekler için aynı hedef değerleri\n• Yıllık: Tüm yıl için tek hedef`);
  };

  // Hedef düzenleme
  const handleEditTarget = (target: VehicleTarget) => {
    setEditingTarget(target);
    setTargetFormData(target);
    setEditTargetDialogOpen(true);
  };

  // Hedef güncelleme kaydetme
  const handleSaveEditedTarget = () => {
    if (!editingTarget || !targetFormData) return;

    const updatedTarget: VehicleTarget = {
      ...editingTarget,
      ...targetFormData,
      updatedDate: new Date().toISOString()
    };

    setVehicleTargets(prev => 
      prev.map(target => 
        target.id === editingTarget.id ? updatedTarget : target
      )
    );

    setEditTargetDialogOpen(false);
    setEditingTarget(null);
    setTargetFormData({});
  };

  // Hedef silme
  const handleDeleteTarget = (targetId: string) => {
    if (window.confirm('Bu hedefi silmek istediğinizden emin misiniz?')) {
      setVehicleTargets(prev => prev.filter(t => t.id !== targetId));
    }
  };

  // Hedef güncelleme
  const updateTargetPerformance = useCallback((target: VehicleTarget) => {
    // Gerçek verilerden güncel performansı hesapla
    const vehicleData = filteredData.filter(item => {
      const allTextFields = [
        item.arac || '', item.aracModeli || '', item.birim || '', 
        item.aciklama || '', item.parcaKodu || ''
      ].join(' ').toLowerCase();
      
      // Kategori bazlı hedef için kategorideki tüm modelleri kontrol et
      if (target.kategori) {
        const categoryModels = VEHICLE_CATEGORIES[target.kategori] || [];
        return categoryModels.some(model => {
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
          
          const keywords = modelKeywords[model] || [model.toLowerCase()];
          return keywords.some(keyword => allTextFields.includes(keyword)) || 
                 item.aracModeli === model;
        });
      }
      
      // Eski sistem uyumluluğu - spesifik model hedefi
      if (target.aracModeli) {
        const keywords = [target.aracModeli.toLowerCase()];
        return keywords.some(keyword => allTextFields.includes(keyword)) || 
               item.aracModeli === target.aracModeli;
      }
      
      return false;
    });

    // Dönem filtreleme - Template sistemi ile uyumlu
    const periodData = vehicleData.filter(item => {
      const itemDate = new Date(item.tarih);
      const targetYear = parseInt(target.donem.split('-')[0]);
      
      if (target.donemTuru === 'ay') {
        // Aylık template sistemi: Belirtilen yılın mevcut ayı için filtrele
        if (target.donem.includes('Aylık Hedef')) {
          // Template sistem: Mevcut ayın verilerini göster
          const currentMonth = new Date().getMonth() + 1;
          return itemDate.getFullYear() === targetYear && 
                 itemDate.getMonth() + 1 === currentMonth;
        } else {
          // Eski sistem: Belirli ay için
          const targetMonth = parseInt(target.donem.split('-')[1]);
          return itemDate.getFullYear() === targetYear && 
                 itemDate.getMonth() + 1 === targetMonth;
        }
      } else if (target.donemTuru === 'ceyrek') {
        // Çeyreklik template sistemi: Belirtilen yılın mevcut çeyreği için filtrele
        if (target.donem.includes('Çeyreklik Hedef')) {
          // Template sistem: Mevcut çeyreğin verilerini göster
          const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
          const itemQuarter = Math.ceil((itemDate.getMonth() + 1) / 3);
          return itemDate.getFullYear() === targetYear && 
                 itemQuarter === currentQuarter;
        } else {
          // Eski sistem: Belirli çeyrek için
          const targetQuarter = parseInt(target.donem.split('Q')[1]);
          const itemQuarter = Math.ceil((itemDate.getMonth() + 1) / 3);
          return itemDate.getFullYear() === targetYear && 
                 itemQuarter === targetQuarter;
        }
      } else {
        // Yıllık: Tüm yıl
        return itemDate.getFullYear() === targetYear;
      }
    });

    // Atık türü bazlı gerçekleşme
    const retData = periodData.filter(item => 
      item.atikTuru === 'Ret' || 
      item.maliyetTuru?.toLowerCase().includes('ret')
    );
    const hurdaData = periodData.filter(item => 
      item.atikTuru === 'Hurda' || 
      item.maliyetTuru?.toLowerCase().includes('hurda')
    );
    const fireData = periodData.filter(item => 
      item.atikTuru === 'Fire' || 
      item.maliyetTuru?.toLowerCase().includes('fire')
    );

    const gerceklesme = {
      guncelRetAdet: retData.length,
      guncelRetMaliyet: retData.reduce((sum, item) => sum + item.maliyet, 0),
      guncelHurdaKg: hurdaData.reduce((sum, item) => sum + (item.agirlik || 0), 0),
      guncelHurdaMaliyet: hurdaData.reduce((sum, item) => sum + item.maliyet, 0),
      guncelFireKg: fireData.reduce((sum, item) => sum + (item.agirlik || 0), 0),
      guncelFireMaliyet: fireData.reduce((sum, item) => sum + item.maliyet, 0),
      toplamMaliyet: periodData.reduce((sum, item) => sum + item.maliyet, 0),
      mevcutVerimlilik: 100 - (periodData.reduce((sum, item) => sum + item.maliyet, 0) / target.hedefler.toplamMaksimumMaliyet * 100)
    };

    // Performans hesaplama - Düşük değerler iyi olduğu için ters mantık
    const calculateInversePerformance = (actual: number, target: number) => {
      if (target === 0) return 100; // Hedef sıfırsa tam performans
      if (actual === 0) return 100; // Gerçekleşen sıfırsa mükemmel performans
      
      // Hedef altında kalma oranı = ne kadar iyi olduğu
      // Örnek: Fire hedefi 40, gerçekleşen 20 ise → (40-20)/40 * 100 = %50 performans
      // Örnek: Fire hedefi 40, gerçekleşen 30 ise → (40-30)/40 * 100 = %25 performans
      // Örnek: Fire hedefi 40, gerçekleşen 50 ise → (40-50)/40 * 100 = -%25 (0'a çekiliyor)
      
      const performanceRatio = Math.max(0, (target - actual) / target * 100);
      return Math.round(performanceRatio);
    };

    const performans = {
      retPerformans: calculateInversePerformance(gerceklesme.guncelRetAdet, target.hedefler.maksRetAdet),
      hurdaPerformans: calculateInversePerformance(gerceklesme.guncelHurdaKg, target.hedefler.maksHurdaKg),
      firePerformans: calculateInversePerformance(gerceklesme.guncelFireKg, target.hedefler.maksFireKg),
      toplamPerformans: calculateInversePerformance(gerceklesme.toplamMaliyet, target.hedefler.toplamMaksimumMaliyet),
      status: gerceklesme.toplamMaliyet <= target.hedefler.toplamMaksimumMaliyet ? 'hedef_altinda' :
              gerceklesme.toplamMaliyet <= target.hedefler.toplamMaksimumMaliyet * 1.1 ? 'hedefte' : 'hedef_ustunde'
    } as const;

    return {
      ...target,
      gerceklesme,
      performans,
      updatedDate: new Date().toISOString()
    };
  }, [filteredData]);

  useEffect(() => {
    // Mevcut hedeflerin performansını güncelle
    setVehicleTargets(prev => prev.map(target => updateTargetPerformance(target)));
  }, [filteredData, updateTargetPerformance]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setBulkTargetDialogOpen(true)}
            sx={{ fontWeight: 600 }}
          >
            Toplu Hedef Belirle
          </Button>
          
          {vehicleTargets.length > 0 && (
            <Button
              variant="outlined"
              color="warning"
              onClick={clearOldTargetsAndReset}
              size="small"
              sx={{ fontWeight: 600 }}
            >
              Hedef Sistemini Sıfırla
            </Button>
          )}

        </Box>
      </Box>

      {/* Özet Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold">Toplam Hedef</Typography>
            <Typography variant="h3" fontWeight="bold">{vehicleTargets.length}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Aktif hedef sayısı</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3, background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold">Başarılı</Typography>
            <Typography variant="h3" fontWeight="bold">
              {vehicleTargets.filter(t => t.performans.status === 'hedef_altinda').length}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Hedef altında kalan</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3, background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold">Dikkat</Typography>
            <Typography variant="h3" fontWeight="bold">
              {vehicleTargets.filter(t => t.performans.status === 'hedefte').length}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Hedef seviyesinde</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 3, background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold">Kritik</Typography>
            <Typography variant="h3" fontWeight="bold">
              {vehicleTargets.filter(t => t.performans.status === 'hedef_ustunde').length}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Hedef üstünde</Typography>
          </Card>
        </Grid>
      </Grid>



      {/* Mevcut Hedefler */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Mevcut Hedefler ve Performans
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={viewMode === 'cards' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('cards')}
            >
              Kartlar
            </Button>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('table')}
            >
              Tablo
            </Button>
          </Box>
        </Box>

        {vehicleTargets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Henüz hedef belirlenmemiş
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Araçlarınız için hedef belirleyerek performans takibine başlayın
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setBulkTargetDialogOpen(true)}
            >
              İlk Hedefi Belirle
            </Button>
          </Box>
        ) : viewMode === 'cards' ? (
          <Grid container spacing={2}>
            {vehicleTargets.map((target) => (
              <Grid item xs={12} sm={6} lg={4} key={target.id}>
                <Card sx={{ 
                  height: '100%',
                  border: '1px solid',
                  borderColor: target.performans.status === 'hedef_ustunde' ? 'error.main' :
                              target.performans.status === 'hedefte' ? 'warning.main' : 'success.main',
                  borderLeft: '4px solid',
                  borderLeftColor: target.performans.status === 'hedef_ustunde' ? 'error.main' :
                                  target.performans.status === 'hedefte' ? 'warning.main' : 'success.main',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)'
                  }
                                  }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ 
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        mb: 1
                      }}>
                        {target.kategori || target.aracModeli}
                      </Typography>
                      <Chip 
                        label={target.donem}
                        size="small"
                        color="primary"
                        sx={{ 
                          fontSize: '0.75rem',
                          height: 24,
                          '& .MuiChip-label': {
                            px: 1
                          }
                        }}
                      />
                    </Box>
                    
                    {/* Kategori detayları */}
                    {target.kategori && (
                      <Box sx={{ 
                        bgcolor: 'grey.50', 
                        p: 1.5, 
                        borderRadius: 1, 
                        mb: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <Typography variant="caption" color="text.secondary" sx={{ 
                          fontSize: '0.75rem',
                          lineHeight: 1.4
                        }}>
                          <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>İçerir:</Box>
                          <br />
                          <Box component="span" sx={{ fontWeight: 500 }}>
                            {target.kategori === 'Kompakt Araçlar' && 'Aga2100, Aga3000, Aga6000'}
                            {target.kategori === 'Araç Üstü Vakumlu' && 'KDM80, KDM70, KDM35, Çay Toplama Makinesi'}
                            {target.kategori === 'Çekilir Tip Mekanik Süpürgeler' && 'FTH-240, Çelik-2000, Ural'}
                            {target.kategori === 'Kompost Makinesi' && 'Kompost Makinesi'}
                            {target.kategori === 'Rusya Motor Odası' && 'Rusya Motor Odası'}
                            {target.kategori === 'HSCK' && 'HSCK'}
                          </Box>
                        </Typography>
                      </Box>
                    )}

                    {/* Performans Özeti */}
                    <Box sx={{ 
                      bgcolor: target.performans.status === 'hedef_ustunde' ? 'error.50' :
                               target.performans.status === 'hedefte' ? 'warning.50' : 'success.50',
                      p: 2, 
                      borderRadius: 2, 
                      mb: 2,
                      border: '1px solid',
                      borderColor: target.performans.status === 'hedef_ustunde' ? 'error.200' :
                                  target.performans.status === 'hedefte' ? 'warning.200' : 'success.200'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>
                          Genel Performans
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ 
                          color: target.performans.status === 'hedef_ustunde' ? 'error.main' :
                                 target.performans.status === 'hedefte' ? 'warning.main' : 'success.main',
                          fontSize: '1rem'
                        }}>
                          %{target.performans.toplamPerformans.toFixed(1)}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(100, target.performans.toplamPerformans)}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: 'rgba(255,255,255,0.7)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: target.performans.status === 'hedef_ustunde' ? 'error.main' :
                                    target.performans.status === 'hedefte' ? 'warning.main' : 'success.main'
                          }
                        }}
                      />
                    </Box>

                    {/* Detaylı Metrikler */}
                    <Box sx={{ mb: 2 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            bgcolor: 'grey.50', 
                            p: 1.5, 
                            borderRadius: 1,
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'grey.200'
                          }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              RET
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
                              {target.gerceklesme.guncelRetAdet}/{target.hedefler.maksRetAdet}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              adet
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            bgcolor: 'grey.50', 
                            p: 1.5, 
                            borderRadius: 1,
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'grey.200'
                          }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              HURDA
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
                              {target.gerceklesme.guncelHurdaKg.toFixed(1)}/{target.hedefler.maksHurdaKg}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              kg
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            bgcolor: 'grey.50', 
                            p: 1.5, 
                            borderRadius: 1,
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'grey.200'
                          }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              FIRE
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
                              {target.gerceklesme.guncelFireKg.toFixed(1)}/{target.hedefler.maksFireKg}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              kg
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            bgcolor: 'primary.50', 
                            p: 1.5, 
                            borderRadius: 1,
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'primary.200'
                          }}>
                            <Typography variant="caption" color="primary.main" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                              TOPLAM
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.8rem', color: 'primary.main' }}>
                              ₺{target.gerceklesme.toplamMaliyet.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                              /₺{target.hedefler.toplamMaksimumMaliyet.toLocaleString()}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEditTarget(target)}
                        startIcon={<EditIcon />}
                        sx={{ 
                          flex: 1,
                          fontSize: '0.75rem',
                          py: 0.5
                        }}
                      >
                        Düzenle
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteTarget(target.id)}
                        startIcon={<DeleteIcon />}
                        sx={{ 
                          flex: 1,
                          fontSize: '0.75rem',
                          py: 0.5
                        }}
                      >
                        Sil
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          // Tablo görünümü burada olacak
          <Typography>Tablo görünümü geliştiriliyor...</Typography>
        )}
      </Paper>

      {/* Toplu Hedef Belirleme Dialog */}
      <Dialog 
        open={bulkTargetDialogOpen} 
        onClose={() => setBulkTargetDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
                 <DialogTitle>
           Toplu Hedef Belirleme
         </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Dönem Türü</InputLabel>
                <Select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as 'ay' | 'ceyrek' | 'yil')}
                  label="Dönem Türü"
                >
                  <MenuItem value="ay">Aylık</MenuItem>
                  <MenuItem value="ceyrek">Çeyreklik</MenuItem>
                  <MenuItem value="yil">Yıllık</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Hedef Belirlenecek Araç Kategorileri:
              </Typography>
              <Grid container spacing={1}>
                {vehicleCategories.map((category) => (
                  <Grid item xs={12} md={6} key={category}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories(prev => [...prev, category]);
                            } else {
                              setSelectedCategories(prev => prev.filter(v => v !== category));
                            }
                          }}
                        />
                      }
                      label={category}
                      sx={{
                        '& .MuiFormControlLabel-label': {
                          fontWeight: 600,
                          fontSize: '0.9rem'
                        }
                      }}
                    />
                    {/* Kategori detayları */}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4, mt: 0.5 }}>
                      {category === 'Kompakt Araçlar' && 'Aga2100, Aga3000, Aga6000'}
                      {category === 'Araç Üstü Vakumlu' && 'KDM80, KDM70, KDM35, Çay Toplama Makinesi'}
                      {category === 'Çekilir Tip Mekanik Süpürgeler' && 'FTH-240, Çelik-2000, Ural'}
                      {category === 'Kompost Makinesi' && 'Kompost Makinesi'}
                      {category === 'Rusya Motor Odası' && 'Rusya Motor Odası'}
                      {category === 'HSCK' && 'HSCK'}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkTargetDialogOpen(false)}>
            İptal
          </Button>
          <Button 
            variant="contained" 
            onClick={handleBulkTargetSet}
            disabled={selectedCategories.length === 0}
          >
            Hedefleri Belirle ({selectedCategories.length} kategori)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hedef Düzenleme Dialog */}
      <Dialog 
        open={editTargetDialogOpen} 
        onClose={() => setEditTargetDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Hedef Düzenle - {editingTarget?.kategori || editingTarget?.aracModeli}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Hedef Değerleri
              </Typography>
            </Grid>
            
            {/* Ret Hedefleri */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maksimum Ret Adet"
                type="number"
                value={targetFormData.hedefler?.maksRetAdet || ''}
                onChange={(e) => setTargetFormData(prev => ({
                  ...prev,
                  hedefler: {
                    ...prev.hedefler!,
                    maksRetAdet: parseInt(e.target.value) || 0
                  }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maksimum Ret Maliyet (₺)"
                type="number"
                value={targetFormData.hedefler?.maksRetMaliyet || ''}
                onChange={(e) => setTargetFormData(prev => ({
                  ...prev,
                  hedefler: {
                    ...prev.hedefler!,
                    maksRetMaliyet: parseInt(e.target.value) || 0
                  }
                }))}
              />
            </Grid>

            {/* Hurda Hedefleri */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maksimum Hurda (kg)"
                type="number"
                value={targetFormData.hedefler?.maksHurdaKg || ''}
                onChange={(e) => setTargetFormData(prev => ({
                  ...prev,
                  hedefler: {
                    ...prev.hedefler!,
                    maksHurdaKg: parseInt(e.target.value) || 0
                  }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maksimum Hurda Maliyet (₺)"
                type="number"
                value={targetFormData.hedefler?.maksHurdaMaliyet || ''}
                onChange={(e) => setTargetFormData(prev => ({
                  ...prev,
                  hedefler: {
                    ...prev.hedefler!,
                    maksHurdaMaliyet: parseInt(e.target.value) || 0
                  }
                }))}
              />
            </Grid>

            {/* Fire Hedefleri */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maksimum Fire (kg)"
                type="number"
                value={targetFormData.hedefler?.maksFireKg || ''}
                onChange={(e) => setTargetFormData(prev => ({
                  ...prev,
                  hedefler: {
                    ...prev.hedefler!,
                    maksFireKg: parseInt(e.target.value) || 0
                  }
                }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maksimum Fire Maliyet (₺)"
                type="number"
                value={targetFormData.hedefler?.maksFireMaliyet || ''}
                onChange={(e) => setTargetFormData(prev => ({
                  ...prev,
                  hedefler: {
                    ...prev.hedefler!,
                    maksFireMaliyet: parseInt(e.target.value) || 0
                  }
                }))}
              />
            </Grid>

            {/* Toplam Hedef */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Toplam Maksimum Maliyet (₺)"
                type="number"
                value={targetFormData.hedefler?.toplamMaksimumMaliyet || ''}
                onChange={(e) => setTargetFormData(prev => ({
                  ...prev,
                  hedefler: {
                    ...prev.hedefler!,
                    toplamMaksimumMaliyet: parseInt(e.target.value) || 0
                  }
                }))}
              />
            </Grid>

            {/* Dönem Bilgileri */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Dönem Türü</InputLabel>
                <Select
                  value={targetFormData.donemTuru || 'ay'}
                  onChange={(e) => setTargetFormData(prev => ({
                    ...prev,
                    donemTuru: e.target.value as 'ay' | 'ceyrek' | 'yil'
                  }))}
                  label="Dönem Türü"
                >
                  <MenuItem value="ay">Aylık</MenuItem>
                  <MenuItem value="ceyrek">Çeyreklik</MenuItem>
                  <MenuItem value="yil">Yıllık</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dönem"
                value={targetFormData.donem || ''}
                onChange={(e) => setTargetFormData(prev => ({
                  ...prev,
                  donem: e.target.value
                }))}
                helperText="Örnek: 2025-01, 2025-Q1, 2025"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTargetDialogOpen(false)}>
            İptal
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveEditedTarget}
            disabled={!targetFormData.hedefler}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
// CategoryProductionManagementComponent ekleniyor...
const CategoryProductionManagementComponent: React.FC<{ 
  onTabChange?: (tabIndex: number) => void,
  globalFilters?: any,
  setGlobalFilters?: (filters: any) => void
}> = ({ onTabChange, globalFilters, setGlobalFilters }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // ✅ YENİ: Kategori bazlı state'ler
  const [categoryProductions, setCategoryProductions] = useState<MonthlyCategoryProduction[]>([]);
  const [filteredProductions, setFilteredProductions] = useState<MonthlyCategoryProduction[]>([]);
  const [loading, setLoading] = useState(true);


  // Search term artık doğrudan TextField onChange ile handle ediliyor
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduction, setEditingProduction] = useState<MonthlyCategoryProduction | null>(null);

  // ✅ YENİ: Gelişmiş Araç Bazlı Yıllık Üretim Yönetimi Modal
  const [advancedDialogOpen, setAdvancedDialogOpen] = useState(false);
  const [selectedVehicleCategory, setSelectedVehicleCategory] = useState<VehicleCategory | ''>('Kompakt Araçlar');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [yearlyProductionData, setYearlyProductionData] = useState<MonthlyCategoryProduction[]>([]);


  // ✅ YENİ: Kategori bazlı form data
  const [formData, setFormData] = useState<Partial<MonthlyCategoryProduction>>({
    kategori: 'Araç Üstü Vakumlu',
    displayName: 'Araç Üstü Vakumlu',
    donem: new Date().toISOString().substring(0, 7), // YYYY-MM format
    donemTuru: 'ay',
    uretilenAracSayisi: 0,
    planlanmisUretim: 0,
    gerceklesmeOrani: 0,
    categoryModels: VEHICLE_CATEGORIES['Araç Üstü Vakumlu'],
    isActive: true,
    aciklama: ''
  });

  // ✅ YENİ: Kategori bazlı storage key
  const STORAGE_KEY = 'monthly_category_productions';

  // Veri yükleme
  useEffect(() => {
    loadProductionData();
  }, []);

  // Filtreleme - GlobalFilters ile entegre
  useEffect(() => {
    if (!globalFilters) {
      setFilteredProductions(categoryProductions);
      return;
    }

    let filtered = [...categoryProductions];

    // Araç Kategorisi filtresi (eski maliyetTuru)
    if (globalFilters.maliyetTuru) {
      filtered = filtered.filter(prod => prod.kategori === globalFilters.maliyetTuru);
    }

    // Üretim Durumu filtresi (eski birim)
    if (globalFilters.birim) {
      filtered = filtered.filter(prod => {
        switch (globalFilters.birim) {
          case 'hedef_ustu':
            return prod.gerceklesmeOrani >= 100;
          case 'hedef_yakın':
            return prod.gerceklesmeOrani >= 80 && prod.gerceklesmeOrani < 100;
          case 'hedef_alti':
            return prod.gerceklesmeOrani < 80;
          case 'yuksek_uretim':
            return prod.uretilenAracSayisi > 50;
          case 'orta_uretim':
            return prod.uretilenAracSayisi >= 20 && prod.uretilenAracSayisi <= 50;
          case 'dusuk_uretim':
            return prod.uretilenAracSayisi < 20;
          case 'aktif':
            return prod.isActive;
          case 'planlanan':
            return prod.planlanmisUretim > 0;
          case 'geciken':
            return prod.gerceklesmeOrani < 90 && prod.planlanmisUretim > 0;
          default:
            return true;
        }
      });
    }

    // Ay filtresi
    if (globalFilters.selectedMonth) {
      filtered = filtered.filter(prod => prod.donem === globalFilters.selectedMonth);
    }

    // Arama filtresi
    if (globalFilters.searchTerm) {
      const searchLower = globalFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(prod =>
        prod.kategori.toLowerCase().includes(searchLower) ||
        prod.displayName.toLowerCase().includes(searchLower) ||
        prod.donem.includes(searchLower) ||
        (prod.aciklama && prod.aciklama.toLowerCase().includes(searchLower)) ||
        prod.categoryModels.some(model => 
          model.toLowerCase().includes(searchLower)
        )
      );
    }

    // Aktif olanlar önce
    filtered.sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return new Date(b.donem).getTime() - new Date(a.donem).getTime();
    });

    setFilteredProductions(filtered);
  }, [categoryProductions, globalFilters]);

  // Event listeners
  useEffect(() => {
    const handleAddNewRecord = () => {
      setEditingProduction(null);
      setFormData({
        kategori: 'Araç Üstü Vakumlu',
        displayName: 'Araç Üstü Vakumlu',
        donem: new Date().toISOString().substring(0, 7),
        donemTuru: 'ay',
        uretilenAracSayisi: 0,
        planlanmisUretim: 0,
        gerceklesmeOrani: 0,
        categoryModels: VEHICLE_CATEGORIES['Araç Üstü Vakumlu'],
        isActive: true,
        aciklama: ''
      });
      setDialogOpen(true);
    };

    window.addEventListener('addNewProductionRecord', handleAddNewRecord);
    
    // Üretim sekmesine yönlendirme event listener'ı
    const handleGoToProductionTab = () => {
      if (onTabChange) {
        onTabChange(7); // Aylık Üretim Sayıları sekmesi
      }
    };
    
    window.addEventListener('goToProductionTab', handleGoToProductionTab);
    
    return () => {
      window.removeEventListener('addNewProductionRecord', handleAddNewRecord);
      window.removeEventListener('goToProductionTab', handleGoToProductionTab);
    };
  }, []);

  const loadProductionData = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let data: MonthlyCategoryProduction[] = [];
      
      if (stored) {
        data = JSON.parse(stored);
      }
      
      // Eğer hiç veri yoksa test verisi oluştur
      if (data.length === 0) {
        console.log('⚠️ Hiç veri bulunamadı, test verisi oluşturuluyor...');
        data = generateSampleCategoryProductionData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('✅ Test verisi oluşturuldu ve kaydedildi');
      }
      
      console.log('📊 Gerçek Veri Yükleme Debug:', {
        storageKey: STORAGE_KEY,
        totalDataCount: data.length,
        allData: data,
        currentMonth: new Date().toISOString().substring(0, 7),
        availableMonths: Array.from(new Set(data.map(p => p.donem))).sort()
      });
      
      setCategoryProductions(data);
    } catch (error) {
      console.error('Kategori üretim verisi yüklenemedi:', error);
      setCategoryProductions([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleCategoryProductionData = (): MonthlyCategoryProduction[] => {
    const currentDate = new Date();
    const sampleData: MonthlyCategoryProduction[] = [];
    
    // Son 6 ay için örnek veri
    for (let i = 0; i < 6; i++) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthString = month.toISOString().substring(0, 7);
      
      // Her kategori için veri oluştur
      Object.entries(VEHICLE_CATEGORIES).forEach(([categoryName, models]) => {
        const kategori = categoryName as VehicleCategory;
        const baseProduction = Math.floor(Math.random() * 30) + 5; // 5-35 arası (kategori toplamı)
        const planlanmis = baseProduction + Math.floor(Math.random() * 10);
        const gerceklesme = planlanmis > 0 ? Math.round((baseProduction / planlanmis) * 100) : 0;
        
        sampleData.push({
          id: `${monthString}-${kategori}-category`,
          kategori,
          displayName: kategori,
          donem: monthString,
          donemTuru: 'ay',
          uretilenAracSayisi: baseProduction,
          planlanmisUretim: planlanmis,
          gerceklesmeOrani: gerceklesme,
          categoryModels: models,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          createdBy: 'system',
          isActive: true,
          aciklama: `${monthString} dönemi ${kategori} kategorisi üretim verisi`
        });
      });
    }
    
    return sampleData;
  };



  // ✅ YENİ: Gelişmiş Araç Bazlı Yıllık Üretim Yönetimi Fonksiyonları
  
  // 12 aylık template oluştur
  const createYearlyTemplate = useCallback((category: VehicleCategory, year: string) => {
    const template: MonthlyCategoryProduction[] = [];
    
    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, '0');
      const donem = `${year}-${monthStr}`;
      
      template.push({
        id: `${donem}-${category}-template`,
        kategori: category,
        displayName: category,
        donem,
        donemTuru: 'ay',
        uretilenAracSayisi: 0,
        planlanmisUretim: 0,
        gerceklesmeOrani: 0,
        categoryModels: VEHICLE_CATEGORIES[category],
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        createdBy: 'system',
        isActive: true,
        aciklama: `${category} - ${donem} dönemi`
      });
    }
    
    return template;
  }, []);

  // Seçilen araç kategorisi için mevcut verileri yükle
  const loadYearlyProductionData = useCallback((category: VehicleCategory, year: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allData: MonthlyCategoryProduction[] = stored ? JSON.parse(stored) : [];
      
      // Seçilen kategori ve yıl için verileri filtrele
      const categoryYearData = allData.filter(p => 
        p.kategori === category && p.donem.startsWith(year)
      );
      
      // 12 aylık template oluştur
      const template = createYearlyTemplate(category, year);
      
      // Mevcut verilerle template'i merge et
      const mergedData = template.map(templateItem => {
        const existingData = categoryYearData.find(d => d.donem === templateItem.donem);
        return existingData || templateItem;
      });
      
      console.log('📊 Yıllık üretim verisi yüklendi:', {
        category,
        year,
        existingCount: categoryYearData.length,
        templateCount: template.length,
        mergedCount: mergedData.length,
        mergedData
      });
      
      setYearlyProductionData(mergedData);
    } catch (error) {
      console.error('Yıllık üretim verisi yüklenemedi:', error);
      setYearlyProductionData(createYearlyTemplate(category, year));
    }
  }, [createYearlyTemplate]);

  // Gelişmiş modal'ı aç
  const handleOpenAdvancedDialog = useCallback((category?: VehicleCategory) => {
    const selectedCategory = category || selectedVehicleCategory || 'Kompakt Araçlar';
    setSelectedVehicleCategory(selectedCategory);
    loadYearlyProductionData(selectedCategory, selectedYear);
    setAdvancedDialogOpen(true);
  }, [selectedVehicleCategory, selectedYear, loadYearlyProductionData]);

  // Yıllık veriyi toplu kaydet
  const handleSaveYearlyData = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let allData: MonthlyCategoryProduction[] = stored ? JSON.parse(stored) : [];
      
      // Mevcut yıllık veriyi sistemden kaldır
      allData = allData.filter(p => 
        !(p.kategori === selectedVehicleCategory && p.donem.startsWith(selectedYear))
      );
      
      // Yeni veriyi ekle (sadece değişen veriler)
      const validData = yearlyProductionData.filter(item => 
        item.uretilenAracSayisi > 0 || item.planlanmisUretim > 0
      );
      
      // ID'leri güncelle
      const finalData = validData.map(item => ({
        ...item,
        id: `${item.donem}-${item.kategori}-yearly`,
        updatedDate: new Date().toISOString(),
        gerceklesmeOrani: item.planlanmisUretim > 0 
          ? Math.round((item.uretilenAracSayisi / item.planlanmisUretim) * 100) 
          : 0
      }));
      
      allData.push(...finalData);
      
      // Kaydet
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
      
      // Ana listeyi güncelle
      setCategoryProductions(allData);
      
      console.log('✅ Yıllık üretim verisi toplu kaydedildi:', {
        category: selectedVehicleCategory,
        year: selectedYear,
        savedCount: finalData.length,
        totalCount: allData.length
      });
      
      setAdvancedDialogOpen(false);
      
    } catch (error) {
      console.error('❌ Yıllık veri kaydetme hatası:', error);
      alert('Veriler kaydedilemedi! Lütfen tekrar deneyin.');
    }
  }, [selectedVehicleCategory, selectedYear, yearlyProductionData]);

  // Yıllık veri güncelleme
  const handleUpdateYearlyData = useCallback((index: number, field: keyof MonthlyCategoryProduction, value: any) => {
    setYearlyProductionData(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Gerçekleşme oranını otomatik hesapla
      if (field === 'uretilenAracSayisi' || field === 'planlanmisUretim') {
        const item = updated[index];
        item.gerceklesmeOrani = item.planlanmisUretim > 0 
          ? Math.round((item.uretilenAracSayisi / item.planlanmisUretim) * 100) 
          : 0;
      }
      
      return updated;
    });
  }, []);

  const handleSaveProduction = () => {
    if (!formData.kategori || !formData.donem || formData.uretilenAracSayisi === undefined || formData.planlanmisUretim === undefined) {
      alert('Lütfen tüm zorunlu alanları doldurun!');
      return;
    }

    const now = new Date().toISOString();
    const gerceklesmeOrani = formData.planlanmisUretim && formData.planlanmisUretim > 0 
      ? (formData.uretilenAracSayisi! / formData.planlanmisUretim) * 100 
      : 100;

    if (editingProduction) {
      // Güncelleme
      const updatedProductions = categoryProductions.map(prod => 
        prod.id === editingProduction.id 
          ? {
              ...prod,
              ...formData,
              categoryModels: VEHICLE_CATEGORIES[formData.kategori!], // Kategori modelleri güncelle
              gerceklesmeOrani,
              updatedDate: now
            } as MonthlyCategoryProduction
          : prod
      );
      setCategoryProductions(updatedProductions);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProductions));
    } else {
      // Yeni kayıt
      const newProduction: MonthlyCategoryProduction = {
        id: `${formData.donem}-${formData.kategori}-${Date.now()}`,
        kategori: formData.kategori!,
        displayName: formData.kategori!,
        donem: formData.donem!,
        donemTuru: 'ay',
        uretilenAracSayisi: formData.uretilenAracSayisi!,
        planlanmisUretim: formData.planlanmisUretim!,
        gerceklesmeOrani,
        categoryModels: VEHICLE_CATEGORIES[formData.kategori!],
        createdDate: now,
        updatedDate: now,
        createdBy: 'user',
        isActive: formData.isActive ?? true,
        aciklama: formData.aciklama
      };
      
      const newProductions = [...categoryProductions, newProduction];
      setCategoryProductions(newProductions);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProductions));
    }

    setDialogOpen(false);
    setEditingProduction(null);
  };

  const handleEditProduction = (production: MonthlyCategoryProduction) => {
    setEditingProduction(production);
    setFormData({
      kategori: production.kategori,
      displayName: production.displayName,
      donem: production.donem,
      donemTuru: production.donemTuru,
      uretilenAracSayisi: production.uretilenAracSayisi,
      planlanmisUretim: production.planlanmisUretim,
      gerceklesmeOrani: production.gerceklesmeOrani,
      categoryModels: production.categoryModels,
      isActive: production.isActive,
      aciklama: production.aciklama
    });
    setDialogOpen(true);
  };

  const handleDeleteProduction = (production: MonthlyCategoryProduction) => {
    // Direkt sil - onay mesajı yok
    const updatedProductions = categoryProductions.filter(prod => prod.id !== production.id);
    setCategoryProductions(updatedProductions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProductions));
  };

  const getStatusColor = (production: MonthlyCategoryProduction) => {
    if (!production.isActive) return 'default';
    if (!production.gerceklesmeOrani) return 'primary';
    if (production.gerceklesmeOrani >= 100) return 'success';
    if (production.gerceklesmeOrani >= 90) return 'warning';
    return 'error';
  };

  const getStatusText = (production: MonthlyCategoryProduction) => {
    if (!production.isActive) return 'Pasif';
    if (!production.gerceklesmeOrani) return 'Veri Yok';
    return `%${production.gerceklesmeOrani.toFixed(1)} Gerçekleşme`;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Aylık üretim verileri yükleniyor...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            height: 140, 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: 2,
            '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
            transition: 'all 0.2s ease-in-out'
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              p: 2.5
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FactoryIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  Toplam Kayıt
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 'bold', 
                color: 'primary.main',
                textAlign: 'center' 
              }}>
                {filteredProductions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            height: 140, 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: 2,
            '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
            transition: 'all 0.2s ease-in-out'
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              p: 2.5
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DirectionsCarIcon sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  Bu Ay Üretilen
                </Typography>
                {(() => {
                  const currentMonth = new Date().toISOString().substring(0, 7);
                  const hasData = filteredProductions.some(p => p.donem === currentMonth);
                  const vehicleData = JSON.parse(localStorage.getItem('monthly_vehicle_productions') || '[]');
                  const hasVehicleData = vehicleData.some(p => p.donem === currentMonth && p.isActive !== false);
                  
                  if (!hasData && !hasVehicleData) {
                    return (
                      <Tooltip title={`${currentMonth} ayı için henüz veri girilmemiş. Aylık Üretim Sayıları sekmesinden veri ekleyin.`}>
                        <WarningIcon sx={{ ml: 1, color: 'warning.main', fontSize: 16 }} />
                      </Tooltip>
                    );
                  }
                  return null;
                })()}
              </Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 'bold', 
                color: 'success.main',
                textAlign: 'center' 
              }}>
                {(() => {
                  const currentMonth = new Date().toISOString().substring(0, 7);
                  
                  // ✅ ÇOKLU KAYNAK KONTROLÜ: Hem category hem vehicle production verilerini kontrol et
                  let totalProduced = 0;
                  let allSources = [];
                  let debugInfo = {
                    currentMonth,
                    hasAnyData: false,
                    categoryData: { exists: false, total: 0, count: 0, data: [] },
                    vehicleData: { exists: false, total: 0, count: 0, data: [] },
                    selectedSource: 'none'
                  };
                  
                  // 1. Category productions (mevcut filteredProductions)
                  const currentMonthCategoryData = filteredProductions.filter(p => p.donem === currentMonth);
                  const categoryTotal = currentMonthCategoryData.reduce((sum, p) => sum + (p.uretilenAracSayisi || 0), 0);
                  
                  if (currentMonthCategoryData.length > 0) {
                    debugInfo.categoryData = {
                      exists: true,
                      total: categoryTotal,
                      count: currentMonthCategoryData.length,
                      data: currentMonthCategoryData.map(p => ({ 
                        id: p.id, 
                        donem: p.donem, 
                        kategori: p.kategori, 
                        uretilen: p.uretilenAracSayisi 
                      }))
                    };
                  }
                  
                  // 2. Vehicle productions (eski sistem için)
                  let vehicleTotal = 0;
                  let vehicleData = [];
                  try {
                    vehicleData = JSON.parse(localStorage.getItem('monthly_vehicle_productions') || '[]');
                    const currentMonthVehicleData = vehicleData.filter(p => p.donem === currentMonth && p.isActive !== false);
                    vehicleTotal = currentMonthVehicleData.reduce((sum, p) => sum + (p.uretilenAracSayisi || p.uretilen || p.quantity || p.adet || 0), 0);
                    
                    if (currentMonthVehicleData.length > 0) {
                      debugInfo.vehicleData = {
                        exists: true,
                        total: vehicleTotal,
                        count: currentMonthVehicleData.length,
                        data: currentMonthVehicleData.map(p => ({ 
                          id: p.id, 
                          donem: p.donem, 
                          model: p.aracModeli || p.vehicleModel, 
                          uretilen: p.uretilenAracSayisi || p.uretilen || p.quantity || p.adet || 0
                        }))
                      };
                    }
                  } catch (error) {
                    console.warn('Vehicle production verileri okunamadı:', error);
                  }
                  
                  // 3. Hangi kaynağın daha fazla verisi varsa onu kullan
                  if (categoryTotal > 0) {
                    totalProduced = categoryTotal;
                    debugInfo.selectedSource = 'category_productions';
                    debugInfo.hasAnyData = true;
                  } else if (vehicleTotal > 0) {
                    totalProduced = vehicleTotal;
                    debugInfo.selectedSource = 'vehicle_productions';
                    debugInfo.hasAnyData = true;
                  }
                  
                  // ✅ KAPSAMLI DEBUG MESAJI
                  console.log('🏭 Bu Ay Üretilen Kartı - DETAYLI DEBUG:', debugInfo);
                  
                  // Eğer veri yoksa uyarı mesajı da yazdır
                  if (!debugInfo.hasAnyData) {
                    console.warn('⚠️ BU AY İÇİN HİÇ ÜRETİM VERİSİ BULUNAMADI!', {
                      çözüm1: 'Aylık Üretim Sayıları sekmesinden veri girişi yapın',
                      çözüm2: 'Dönem formatının ' + currentMonth + ' olmasına dikkat edin',
                      localStorage: {
                        categoryProductionsKey: 'monthly_category_productions',
                        vehicleProductionsKey: 'monthly_vehicle_productions',
                        mevcutKeys: Object.keys(localStorage).filter(k => k.includes('production'))
                      }
                    });
                  }
                  
                  return totalProduced;
                })()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            height: 140, 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: 2,
            '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
            transition: 'all 0.2s ease-in-out'
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              p: 2.5
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DateRangeIcon sx={{ mr: 1, color: 'info.main', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  Seçilen Ay
                </Typography>
                {(() => {
                  const selectedMonth = globalFilters?.selectedMonth || '';
                  const hasSelectedMonth = selectedMonth && selectedMonth.trim() !== '';
                  const hasData = hasSelectedMonth && filteredProductions.some(p => p.donem === selectedMonth);
                  
                  if (hasSelectedMonth && !hasData) {
                    return (
                      <Tooltip title={`${selectedMonth} ayı için henüz veri girilmemiş. Veri ekleyin veya farklı ay seçin.`}>
                        <WarningIcon sx={{ ml: 1, color: 'warning.main', fontSize: 14 }} />
                      </Tooltip>
                    );
                  }
                  if (!hasSelectedMonth) {
                    return (
                      <Tooltip title="Yukarıdaki filtreden ay seçin">
                        <InfoIcon sx={{ ml: 1, color: 'info.main', fontSize: 14 }} />
                      </Tooltip>
                    );
                  }
                  return null;
                })()}
              </Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 'bold', 
                color: 'info.main',
                textAlign: 'center' 
              }}>
                {(() => {
                  const selectedMonth = globalFilters?.selectedMonth || '';
                  if (!selectedMonth || selectedMonth.trim() === '') {
                    return '-';
                  }
                  
                  // Seçili ay için üretim verilerini hesapla
                  const selectedMonthData = filteredProductions.filter(p => p.donem === selectedMonth);
                  const selectedMonthTotal = selectedMonthData.reduce((sum, p) => sum + (p.uretilenAracSayisi || 0), 0);
                  
                  // Eğer kategori verisi yoksa vehicle verilerini kontrol et
                  let vehicleTotal = 0;
                  if (selectedMonthTotal === 0) {
                    try {
                      const vehicleData = JSON.parse(localStorage.getItem('monthly_vehicle_productions') || '[]');
                      const selectedMonthVehicleData = vehicleData.filter(p => p.donem === selectedMonth && p.isActive !== false);
                      vehicleTotal = selectedMonthVehicleData.reduce((sum, p) => sum + (p.uretilenAracSayisi || p.uretilen || p.quantity || p.adet || 0), 0);
                    } catch (error) {
                      console.warn('Vehicle production verileri okunamadı:', error);
                    }
                  }
                  
                  const finalTotal = selectedMonthTotal > 0 ? selectedMonthTotal : vehicleTotal;
                  
                  console.log('📅 Seçilen Ay Üretilen Kartı Debug:', {
                    selectedMonth,
                    selectedMonthData: selectedMonthData.length,
                    selectedMonthTotal,
                    vehicleTotal,
                    finalTotal,
                    filterApplied: true
                  });
                  
                  return finalTotal;
                })()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            height: 140, 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: 2,
            '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
            transition: 'all 0.2s ease-in-out'
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              p: 2.5
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'warning.main', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  Ortalama Üretim
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 'bold', 
                color: 'warning.main',
                textAlign: 'center' 
              }}>
                {filteredProductions.length > 0 
                  ? Math.round(filteredProductions.reduce((sum, p) => sum + p.uretilenAracSayisi, 0) / filteredProductions.length)
                  : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            height: 140, 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: 2,
            '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
            transition: 'all 0.2s ease-in-out'
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              p: 2.5
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TargetIcon sx={{ mr: 1, color: 'error.main', fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  Hedef Tutma Oranı
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 'bold', 
                color: 'error.main',
                textAlign: 'center' 
              }}>
                %{filteredProductions.length > 0 
                  ? Math.round(filteredProductions
                      .filter(p => p.gerceklesmeOrani && p.gerceklesmeOrani >= 90)
                      .length / filteredProductions.length * 100)
                  : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ✅ YENİ: Gelişmiş Buton Alanı */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Aylık Üretim Kayıtları
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => handleOpenAdvancedDialog()}
              size="small"
            >
              Yeni Kayıt
            </Button>
            
            {/* ✅ YENİ: Basit Modal Butonu (Eski Yöntem) */}
            <Button
              startIcon={<CalendarTodayIcon />}
              variant="outlined"
              onClick={() => setDialogOpen(true)}
              size="small"
              color="secondary"
              sx={{ 
                borderColor: 'secondary.main',
                '&:hover': {
                  borderColor: 'secondary.dark',
                  backgroundColor: 'secondary.light'
                }
              }}
            >
              Tek Kayıt
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* ✅ YENİ: Gelişmiş Card View - Daha Kullanışlı Liste Görünümü */}
      <Box sx={{ mb: 3 }}>
        {filteredProductions.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <FactoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Henüz üretim kaydı bulunmuyor
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Yeni bir kayıt eklemek için yukarıdaki "Yeni Kayıt" butonunu kullanın
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenAdvancedDialog()}
            >
              İlk Kaydı Oluştur
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filteredProductions.map((production) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={production.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    },
                    borderLeft: '4px solid',
                    borderLeftColor: getStatusColor(production) === 'success' ? 'success.main' :
                                    getStatusColor(production) === 'warning' ? 'warning.main' :
                                    getStatusColor(production) === 'error' ? 'error.main' : 'primary.main',
                    opacity: production.isActive ? 1 : 0.7
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    {/* Başlık */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h3" sx={{ 
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        lineHeight: 1.2,
                        flexGrow: 1
                      }}>
                        {production.displayName}
                      </Typography>
                      <Switch
                        checked={production.isActive}
                        onChange={(e) => {
                          const updatedProductions = categoryProductions.map(p =>
                            p.id === production.id ? { ...p, isActive: e.target.checked } : p
                          );
                          setCategoryProductions(updatedProductions);
                          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProductions));
                        }}
                        size="small"
                      />
                    </Box>

                    {/* Dönem ve Kategori */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={production.donem} 
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                      <Chip 
                        label={production.kategori} 
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    {/* Üretim Bilgileri */}
                    <Box sx={{ mb: 2 }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            textAlign: 'center',
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: 'primary.50',
                            border: '1px solid',
                            borderColor: 'primary.200'
                          }}>
                            <Typography variant="h5" color="primary" fontWeight="bold">
                              {production.uretilenAracSayisi}
                  </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Üretilen
                  </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ 
                            textAlign: 'center',
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: 'success.50',
                            border: '1px solid',
                            borderColor: 'success.200'
                          }}>
                            <Typography variant="h5" color="success.main" fontWeight="bold">
                              {production.planlanmisUretim || '-'}
                  </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Planlanan
                  </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Performans Durumu */}
                    <Box sx={{ mb: 2 }}>
                  <Chip
                    label={getStatusText(production)}
                    color={getStatusColor(production)}
                    size="small"
                        sx={{ width: '100%', justifyContent: 'center' }}
                      />
                    </Box>

                    {/* Açıklama (Varsa) */}
                    {production.aciklama && (
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        fontSize: '0.85rem',
                        fontStyle: 'italic',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {production.aciklama}
                  </Typography>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 1, justifyContent: 'center' }}>
                    <Tooltip title="Detayları Görüntüle">
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          const productionDetailRecord = {
                            id: `production_${production.id}`,
                            maliyetTuru: 'production_record',
                            aracModeli: production.displayName,
                            aracKategorisi: production.kategori,
                            maliyet: 0,
                            tarih: production.createdDate || new Date().toISOString(),
                            durum: production.isActive ? 'aktif' : 'pasif',
                            parcaKodu: `PROD-${production.displayName.toUpperCase()}`,
                            aciklama: `${production.displayName} üretim kaydı - ${production.donem} dönemi`,
                            uretimDetaylari: {
                              donem: production.donem,
                              aracModeli: production.displayName,
                              kategori: production.kategori,
                              uretilenAracSayisi: production.uretilenAracSayisi,
                              planlanmisUretim: production.planlanmisUretim,
                              gerceklesmeOrani: production.gerceklesmeOrani,
                              isActive: production.isActive
                            }
                          };
                          if ((window as any).handleViewDetails) {
                            (window as any).handleViewDetails(productionDetailRecord);
                          }
                        }}
                        color="info"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzenle">
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditProduction(production)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteProduction(production)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduction ? 'Üretim Kaydını Düzenle' : 'Yeni Üretim Kaydı'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={formData.kategori || ''}
                  onChange={(e) => {
                    const kategori = e.target.value as VehicleCategory;
                    setFormData(prev => ({ 
                      ...prev, 
                      kategori,
                      displayName: kategori,
                      categoryModels: VEHICLE_CATEGORIES[kategori]
                    }));
                  }}
                  label="Kategori"
                >
                  {Object.keys(VEHICLE_CATEGORIES).map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="month"
                label="Dönem"
                value={formData.donem || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, donem: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Üretilen Araç Sayısı"
                value={formData.uretilenAracSayisi ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === '' ? 0 : parseInt(value);
                  setFormData(prev => ({ ...prev, uretilenAracSayisi: isNaN(numValue) ? 0 : numValue }));
                }}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Planlanan Üretim"
                value={formData.planlanmisUretim ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === '' ? 0 : parseInt(value);
                  setFormData(prev => ({ ...prev, planlanmisUretim: isNaN(numValue) ? 0 : numValue }));
                }}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Açıklama"
                value={formData.aciklama || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, aciklama: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleSaveProduction}>
            {editingProduction ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ YENİ: Gelişmiş Araç Bazlı Yıllık Üretim Yönetimi Modal */}
      <Dialog 
        open={advancedDialogOpen} 
        onClose={() => setAdvancedDialogOpen(false)} 
        maxWidth="xl" 
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '80vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
          color: 'white',
          p: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarTodayIcon />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Yıllık Üretim Planı
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                12 aylık üretim verilerini tek ekranda düzenleyin
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {/* Araç ve Yıl Seçimi */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Araç Kategorisi</InputLabel>
                <Select
                  value={selectedVehicleCategory}
                  onChange={(e) => {
                    const category = e.target.value as VehicleCategory;
                    setSelectedVehicleCategory(category);
                    loadYearlyProductionData(category, selectedYear);
                  }}
                  label="Araç Kategorisi"
                >
                  {Object.keys(VEHICLE_CATEGORIES).map(category => (
                    <MenuItem key={category} value={category}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DirectionsCarIcon fontSize="small" />
                        {category}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Yıl</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => {
                    const year = e.target.value;
                    setSelectedYear(year);
                    if (selectedVehicleCategory) {
                      loadYearlyProductionData(selectedVehicleCategory, year);
                    }
                  }}
                  label="Yıl"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <MenuItem key={year} value={year.toString()}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* 12 Aylık Grid Tablosu */}
          {selectedVehicleCategory && (
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FactoryIcon color="primary" />
                    <Typography variant="h6">
                      {selectedVehicleCategory} - {selectedYear} Yıllık Üretim Planı
                    </Typography>
                  </Box>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    12 aylık üretim verilerini aşağıdaki tabloda düzenleyebilirsiniz
                  </Typography>
                }
              />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Ay</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Üretilen Miktar</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Planlanan Miktar</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Gerçekleşme %</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Açıklama</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {yearlyProductionData.map((monthData, index) => {
                        const monthName = new Date(`${monthData.donem}-01`).toLocaleDateString('tr-TR', { 
                          month: 'long', 
                          year: 'numeric' 
                        });
                        
                        return (
                          <TableRow key={monthData.donem}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarTodayIcon fontSize="small" color="primary" />
                                <Typography variant="body2" fontWeight="bold">
                                  {monthName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                value={monthData.uretilenAracSayisi}
                                onChange={(e) => handleUpdateYearlyData(index, 'uretilenAracSayisi', parseInt(e.target.value) || 0)}
                                inputProps={{ min: 0 }}
                                size="small"
                                fullWidth
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end" sx={{ minWidth: '45px', flexShrink: 0 }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                                        adet
                                      </Typography>
                                    </InputAdornment>
                                  )
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                value={monthData.planlanmisUretim}
                                onChange={(e) => handleUpdateYearlyData(index, 'planlanmisUretim', parseInt(e.target.value) || 0)}
                                inputProps={{ min: 0 }}
                                size="small"
                                fullWidth
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end" sx={{ minWidth: '45px', flexShrink: 0 }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                                        adet
                                      </Typography>
                                    </InputAdornment>
                                  )
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                  label={`%${monthData.gerceklesmeOrani}`}
                                  color={
                                    monthData.gerceklesmeOrani >= 100 ? 'success' :
                                    monthData.gerceklesmeOrani >= 90 ? 'warning' :
                                    monthData.gerceklesmeOrani > 0 ? 'error' : 'default'
                                  }
                                  size="small"
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <TextField
                                value={monthData.aciklama || ''}
                                onChange={(e) => handleUpdateYearlyData(index, 'aciklama', e.target.value)}
                                placeholder="Açıklama ekle..."
                                size="small"
                                fullWidth
                                multiline
                                maxRows={2}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Özet İstatistikler */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>Yıllık Özet</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary" fontWeight="bold">
                          {yearlyProductionData.reduce((sum, item) => sum + item.uretilenAracSayisi, 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Toplam Üretilen
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main" fontWeight="bold">
                          {yearlyProductionData.reduce((sum, item) => sum + item.planlanmisUretim, 0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Toplam Planlanan
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main" fontWeight="bold">
                          %{yearlyProductionData.length > 0 
                            ? Math.round(yearlyProductionData.reduce((sum, item) => sum + item.gerceklesmeOrani, 0) / yearlyProductionData.length)
                            : 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Ortalama Gerçekleşme
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main" fontWeight="bold">
                          {yearlyProductionData.filter(item => item.uretilenAracSayisi > 0 || item.planlanmisUretim > 0).length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Veri Bulunan Ay
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setAdvancedDialogOpen(false)} color="inherit">
            İptal
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveYearlyData}
            startIcon={<SaveIcon />}
            disabled={!selectedVehicleCategory}
          >
            Yıllık Veriyi Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
