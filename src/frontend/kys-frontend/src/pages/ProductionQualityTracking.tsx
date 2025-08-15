import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Alert,
  InputAdornment,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Factory as FactoryIcon,
  Build as BuildIcon,
  ElectricalServices as ElectricalIcon,
  ColorLens as PaintIcon,
  Engineering as WeldIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Repeat as RepeatIcon,
  Search as SearchIcon,
  Science as RnDIcon,
  LocalShipping as DepoIcon,
  ShoppingCart as PurchaseIcon,
  Inventory as StockIcon,
  Engineering as PlanningIcon,
  Business as SalesIcon,
  Straighten as QualityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterListIcon,
  Report as ReportIcon,
  Close as CloseIcon,
  DirectionsCar as DirectionsCarIcon
} from '@mui/icons-material';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, ComposedChart, Line, ReferenceLine, LineChart
} from 'recharts';

import { createDOFFromSourceRecord, DOFCreationParams } from '../utils/dofIntegration';
import { useThemeContext } from '../context/ThemeContext';

// Interfaces
interface QualityDefectRecord {
  id: string;
  serialNumber: string;
  vehicleType: string;
  defects: DefectDetail[];
  submissionDate: string;
  qualitySubmissionDate?: string; // Kaliteye veriliş tarihi
  inspector: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  updatedAt: string;
}

interface DefectDetail {
  id: string;
  productionUnit: string;
  defectType: string;
  defectDescription: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  repeatCount: number;
  closedDate?: string;
  status: 'open' | 'in_progress' | 'closed';
}

interface ProductionUnitPerformance {
  unit: string;
  unitName: string;
  totalDefects: number;
  averageDefectsPerVehicle: number;
  firstTimePassRate: number;
  qualityScore: number;
  totalVehicles: number;
  repeatedVehicles: number;
  color: string;
}

// Aylık üretilen araçlar için interface
interface MonthlyVehicleProduction {
  id: string;
  vehicleType: string;
  serialNumber: string;
  customerName: string;
  model: string;
  productionDate: string;
  productionMonth: string; // YYYY-MM formatı
  createdAt: string;
  updatedAt: string;
}

// 🔍 MUTLAK İZOLASYON ARAMA KUTUSU - HİÇBİR PARENT RE-RENDER ETKİSİ YOK!
const UltraIsolatedSearchInput = memo<{
  initialValue?: string;
  onDebouncedChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  clearTrigger?: number;
}>(({ initialValue = '', onDebouncedChange, placeholder = "", label = "", size = "small", fullWidth = true, clearTrigger = 0 }) => {
  // TAMAMEN İZOLE EDİLMİŞ STATE - Parent'dan bağımsız
  const [localValue, setLocalValue] = useState<string>(initialValue);
  
  // Debounce ref - asla değişmez
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Input ref - focus korunması için
  const inputRef = useRef<HTMLInputElement>(null);
  
  // İlk değer sadece mount'ta set edilir, sonra hiç dokunulmaz
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    if (!isInitialized) {
      setLocalValue(initialValue);
      setIsInitialized(true);
    }
  }, [initialValue, isInitialized]);
  
  // Clear trigger değiştiğinde arama kutusunu temizle
  useEffect(() => {
    if (clearTrigger > 0 && isInitialized) {
      console.log('🧹 Arama kutusu temizleniyor...');
      setLocalValue('');
      // Debounce'u da temizle
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    }
  }, [clearTrigger, isInitialized]);
  
  // Input değişiklik handler'ı - PARENT'TAN TAMAMEN BAĞIMSIZ
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    console.log('🔍 Local arama değişiyor:', newValue);
    
    // Local state'i hemen güncelle (UI responsive)
    setLocalValue(newValue);
    
    // Önceki debounce'u temizle
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Yeni debounce başlat - DİNAMİK ARAMA İÇİN MAKUL SÜRE
    debounceRef.current = setTimeout(() => {
      console.log('📤 Debounce tamamlandı, parent\'a gönderiliyor:', newValue);
      onDebouncedChange(newValue);
     }, 800); // 800ms - dinamik arama, ama yine de stabil odak
  }, [onDebouncedChange]);
  
  // Blur handler - başka yere tıkladığında arama yap
  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const currentValue = event.target.value;
    console.log('🎯 Odak kaybedildi, hemen arama yapılıyor:', currentValue);
    
    // Debounce'u temizle
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Hemen arama yap
    onDebouncedChange(currentValue);
  }, [onDebouncedChange]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
  
  // STATİK PROPS - HİÇ DEĞİŞMEZ
  const staticInputProps = useMemo(() => ({
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ),
  }), []);
  
  const staticSxProps = useMemo(() => ({
    '& .MuiOutlinedInput-root': {
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'primary.main',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'primary.main',
        borderWidth: '2px',
      },
    },
  }), []);
  
  return (
    <TextField
      ref={inputRef}
      fullWidth={fullWidth}
      size={size}
      label={label}
      value={localValue} // SADECE LOCAL STATE
      onChange={handleInputChange}
      onBlur={handleBlur} // Başka yere tıkladığında arama yap
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
      InputProps={staticInputProps}
      sx={staticSxProps}
    />
  );
});

// Component displayName
UltraIsolatedSearchInput.displayName = 'UltraIsolatedSearchInput';

// Styled Components - Tema entegreli olacak şekilde component içinde tanımlanacak

const ProductionQualityTracking: React.FC = () => {
  const { theme: muiTheme, appearanceSettings } = useThemeContext();

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

  // Form data
  const [formData, setFormData] = useState<Partial<QualityDefectRecord>>({
    serialNumber: '',
    vehicleType: '',
    defects: [],
    submissionDate: new Date().toISOString().split('T')[0],
    qualitySubmissionDate: new Date().toISOString().split('T')[0],
    status: 'open',
    inspector: ''
  });

  // Current defect being added
  const [currentDefect, setCurrentDefect] = useState<Partial<DefectDetail>>({
    productionUnit: '',
    defectType: '',
    defectDescription: '',
    severity: 'medium',
    repeatCount: 1,
    status: 'open'
  });

  // Filters - Gelişmiş filtreleme sistemi
  const [filters, setFilters] = useState({
    vehicleType: '',
    productionUnit: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
    period: 'monthly', // ✅ YENİ: Varsayılan olarak aylık filtre aktif
    year: new Date().getFullYear().toString(),
    month: String(new Date().getMonth() + 1).padStart(2, '0'), // ✅ YENİ: Mevcut ay varsayılan
    quarter: ''
  });

  // Filter expansion state
  const [filterExpanded, setFilterExpanded] = useState(false);

  // ✅ CLEAR TRIGGER - Arama kutusunu temizlemek için
  const [clearTrigger, setClearTrigger] = useState(0);

  // ✅ ULTRA İZOLE EDİLMİŞ ARAMA HANDLER - HİÇBİR RE-RENDER TETİKLEMEZ
  const handleDebouncedSearchChange = useCallback((debouncedSearchTerm: string) => {
    console.log('🔍 Debounced arama terimi geldi:', debouncedSearchTerm);
    setFilters(prev => {
      // Eğer değer değişmemişse state'i güncelleme
      if (prev.searchTerm === debouncedSearchTerm) {
        console.log('🔍 Arama terimi aynı, state güncellenmeyecek');
        return prev;
      }
      console.log('🔍 Arama terimi farklı, state güncelleniyor:', debouncedSearchTerm);
      return {
        ...prev,
        searchTerm: debouncedSearchTerm
      };
    });
  }, []);

  // Dönem seçenekleri
  const periodOptions = [
    { value: 'monthly', label: 'Aylık' },
    { value: 'quarterly', label: 'Çeyreklik' },
    { value: 'custom', label: 'Özel Tarih Aralığı' }
  ];

  // Yıl seçenekleri
  const yearOptions = [
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' }
  ];

  // Ay seçenekleri
  const monthOptions = [
    { value: '01', label: 'Ocak' },
    { value: '02', label: 'Şubat' },
    { value: '03', label: 'Mart' },
    { value: '04', label: 'Nisan' },
    { value: '05', label: 'Mayıs' },
    { value: '06', label: 'Haziran' },
    { value: '07', label: 'Temmuz' },
    { value: '08', label: 'Ağustos' },
    { value: '09', label: 'Eylül' },
    { value: '10', label: 'Ekim' },
    { value: '11', label: 'Kasım' },
    { value: '12', label: 'Aralık' }
  ];

  // Çeyrek seçenekleri
  const quarterOptions = [
    { value: 'Q1', label: '1. Çeyrek (Ocak-Mart)' },
    { value: 'Q2', label: '2. Çeyrek (Nisan-Haziran)' },
    { value: 'Q3', label: '3. Çeyrek (Temmuz-Eylül)' },
    { value: 'Q4', label: '4. Çeyrek (Ekim-Aralık)' }
  ];

  // Vehicle Types (based on your image)
  const vehicleTypes = [
    { value: 'FTH-240', label: 'FTH-240' },
    { value: 'Çelik-2000', label: 'Çelik-2000' },
    { value: 'Aga2100', label: 'Aga2100' },
    { value: 'Aga3000', label: 'Aga3000' },
    { value: 'Aga6000', label: 'Aga6000' },
    { value: 'Kompost Makinesi', label: 'Kompost Makinesi' },
    { value: 'Çay Toplama Makinesi', label: 'Çay Toplama Makinesi' },
    { value: 'KDM 35', label: 'KDM 35' },
    { value: 'KDM 45', label: 'KDM 45' },
    { value: 'KDM 70', label: 'KDM 70' },
    { value: 'KDM 80', label: 'KDM 80' },
    { value: 'Rusya Motor Odası', label: 'Rusya Motor Odası' },
    { value: 'Ural', label: 'Ural' },
    { value: 'HSCK', label: 'HSCK' }
  ];

  // Production Units (based on your image)
  const productionUnits = [
    { value: 'mekanik-montaj', label: 'Mekanik Montaj', icon: <BuildIcon />, color: '#2196F3' },
    { value: 'elektrikhane', label: 'Elektrikhane', icon: <ElectricalIcon />, color: '#FF9800' },
    { value: 'boyahane', label: 'Boyahane', icon: <PaintIcon />, color: '#4CAF50' },
    { value: 'kaynakhane', label: 'Kaynakhane', icon: <WeldIcon />, color: '#F44336' },
    { value: 'ar-ge', label: 'Ar-Ge', icon: <RnDIcon />, color: '#9C27B0' },
    { value: 'depo', label: 'Depo', icon: <DepoIcon />, color: '#795548' },
    { value: 'satın-alma', label: 'Satın Alma', icon: <PurchaseIcon />, color: '#607D8B' },
    { value: 'kalite-kontrol', label: 'Kalite Kontrol', icon: <QualityIcon />, color: '#E91E63' },
    { value: 'kesim', label: 'Kesim', icon: <BuildIcon />, color: '#3F51B5' },
    { value: 'büküm', label: 'Büküm', icon: <BuildIcon />, color: '#009688' },
    { value: 'satış', label: 'Satış', icon: <SalesIcon />, color: '#FF5722' },
    { value: 'üretim-planlama', label: 'Planlama', icon: <PlanningIcon />, color: '#8BC34A' }
  ];

  // Defect Types by Production Unit (initial state)
  const initialDefectTypesByUnit = {
    'mekanik-montaj': [
      'Vida Sıkma Torku Yetersiz',
      'Yanlış Parça Montajı',
      'Eksik Parça',
      'Hatalı Pozisyon',
      'Ölçü Uyumsuzluğu',
      'Montaj Sırası Hatası',
      'Kırık/Çatlak Parça',
      'Gres Uygulanmamış',
      'Conta Eksikliği',
      'Vidanın Sıyrılması'
    ],
    'elektrikhane': [
      'Kablo Bağlantı Hatası',
      'LED Arızası',
      'Sigorta Hatası',
      'Kısa Devre',
      'Topraklama Sorunu',
      'Yanlış Voltaj',
      'Anahtar Arızası',
      'Motor Bağlantı Hatası',
      'Sensör Arızası',
      'Kablo Hasarı'
    ],
    'boyahane': [
      'Renk Tonu Hatası',
      'Boya Kalınlığı Yetersiz',
      'Akıntı/Damlama',
      'Portakal Kabuğu',
      'Toz İçermesi',
      'Aderans Sorunu',
      'Parlaklık Farkı',
      'Leke/Kirlenmeler',
      'Maskeleme Hatası',
      'Eksik Boyama'
    ],
    'kaynakhane': [
      'Kaynak Penetrasyonu Eksik',
      'Köşe Kaynak Hatası',
      'Çatlak Oluşumu',
      'Porozite',
      'Kaynak Dikim Hatası',
      'Yanlış Kaynak Parametresi',
      'Temizlik Eksikliği',
      'Deformasyon',
      'Kaynak Eksikliği',
      'Gaz Koruması Yetersiz'
    ],
    'ar-ge': [
      'Tasarım Hatası',
      'Ölçü Hesap Hatası',
      'Malzeme Seçim Hatası',
      'Test Parametresi Hatası',
      'Prototip Uyumsuzluğu',
      'Simulasyon Hatası',
      'Standart Uyumsuzluğu',
      'Fonksiyon Eksikliği',
      'Ergonomi Sorunu',
      'Güvenlik Riski'
    ],
    'depo': [
      'Yanlış Sevkiyat',
      'Hasarlı Ambalaj',
      'Eksik Malzeme',
      'Karışık Parçalar',
      'Depolama Koşulları',
      'Etiket Hatası',
      'Nem/Korozyon',
      'Fiziksel Hasar',
      'Yanlış Miktar',
      'Süresi Geçmiş Malzeme'
    ],
    'satın-alma': [
      'Yanlış Malzeme Tedariki',
      'Kalitesiz Malzeme',
      'Geç Teslimat',
      'Spesifikasyon Uyumsuzluğu',
      'Sertifika Eksikliği',
      'Fiyat Uyumsuzluğu',
      'Tedarikçi Hatası',
      'Kalite Belgesi Eksik',
      'Ambalaj Hatası',
      'Miktar Uyumsuzluğu'
    ],
    'kalite-kontrol': [
      'Test Cihazı Kalibrasyon Hatası',
      'Ölçüm Hatası',
      'Prosedür Uygulanmamış',
      'Kontrol Eksikliği',
      'Raporlama Hatası',
      'Numune Alma Hatası',
      'Yanlış Değerlendirme',
      'Dokümantasyon Eksik',
      'Test Standart Hatası',
      'Onay Süreci Hatası'
    ],
    'kesim': [
      'Ölçü Hatası',
      'Kesim Açısı Yanlış',
      'Pürüzlü Yüzey',
      'Çapak Oluşumu',
      'Malzeme İsrafı',
      'Yanlış Kesim Noktası',
      'Bıçak Keskinlik Sorunu',
      'Kalıp Pozisyon Hatası',
      'Hız Ayar Hatası',
      'Soğutma Eksikliği'
    ],
    'büküm': [
      'Büküm Açısı Hatası',
      'Çatlak Oluşumu',
      'Ölçü Sapması',
      'Yüzey Hasarı',
      'Elastik Geri Dönüş',
      'Kalıp Uyumsuzluğu',
      'Malzeme Deformasyonu',
      'Basınç Ayar Hatası',
      'Pozisyon Sapması',
      'Simetri Bozukluğu'
    ],
    'satış': [
      'Yanlış Sipariş Alımı',
      'Müşteri İhtiyacı Anlaşılamadı',
      'Teslim Tarihi Hatası',
      'Fiyat Hesap Hatası',
      'Teknik Özellik Hatası',
      'Sözleşme Uyumsuzluğu',
      'İletişim Kopukluğu',
      'Dokümantasyon Eksik',
      'Onay Süreci Gecikme',
      'Müşteri Bilgilendirme Eksik'
    ],
    'üretim-planlama': [
      'Üretim Sırası Hatası',
      'Kapasite Planlama Hatası',
      'Malzeme İhtiyaç Hesabı Yanlış',
      'Zaman Planlaması Hatası',
      'İş Emri Uyumsuzluğu',
      'Kaynak Tahsis Hatası',
      'Öncelik Belirleme Hatası',
      'Tarih Koordinasyonu Eksik',
      'Stok Hesap Hatası',
      'Üretim Takibi Eksik'
    ]
  };

  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [defectRecords, setDefectRecords] = useState<QualityDefectRecord[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRecord, setSelectedRecord] = useState<QualityDefectRecord | null>(null);
  
  // Aylık üretim verileri için state'ler
  const [monthlyVehicles, setMonthlyVehicles] = useState<MonthlyVehicleProduction[]>([]);
  const [monthlyVehicleDialog, setMonthlyVehicleDialog] = useState(false);
  const [selectedMonthlyVehicleId, setSelectedMonthlyVehicleId] = useState<string | null>(null);
  const [monthlyVehicleForm, setMonthlyVehicleForm] = useState<Partial<MonthlyVehicleProduction>>({
    vehicleType: '',
    serialNumber: '',
    customerName: '',
    model: '',
    productionDate: new Date().toISOString().split('T')[0],
    productionMonth: new Date().toISOString().slice(0, 7)
  });
  
  // Dynamic defect types management
  const [defectTypesByUnit, setDefectTypesByUnit] = useState(initialDefectTypesByUnit);
  const [newDefectType, setNewDefectType] = useState('');

  // ✅ CUSTOM DEFECT TYPES PERSİSTENCE: defectTypesByUnit'i localStorage'a kaydet/yükle
  useEffect(() => {
    try {
      const savedDefectTypes = localStorage.getItem('customDefectTypesByUnit');
      if (savedDefectTypes) {
        const parsedDefectTypes = JSON.parse(savedDefectTypes);
        // Mevcut initial types ile merge et
        const mergedDefectTypes = { ...initialDefectTypesByUnit };
        Object.keys(parsedDefectTypes).forEach(unit => {
          mergedDefectTypes[unit] = [
            ...(initialDefectTypesByUnit[unit] || []),
            ...(parsedDefectTypes[unit] || []).filter(type => 
              !(initialDefectTypesByUnit[unit] || []).includes(type)
            )
          ];
        });
        setDefectTypesByUnit(mergedDefectTypes);
        console.log('✅ Custom defect types yüklendi:', mergedDefectTypes);
      }
    } catch (error) {
      console.error('❌ Custom defect types yükleme hatası:', error);
    }
  }, []);

  // ✅ defectTypesByUnit değiştiğinde localStorage'a kaydet
  useEffect(() => {
    try {
      // Sadece custom types'ı kaydet (initial types'ları çıkar)
      const customTypesOnly = {};
      Object.keys(defectTypesByUnit).forEach(unit => {
        const customTypes = (defectTypesByUnit[unit] || []).filter(type => 
          !(initialDefectTypesByUnit[unit] || []).includes(type)
        );
        if (customTypes.length > 0) {
          customTypesOnly[unit] = customTypes;
        }
      });
      localStorage.setItem('customDefectTypesByUnit', JSON.stringify(customTypesOnly));
      console.log('💾 Custom defect types kaydedildi:', customTypesOnly);
    } catch (error) {
      console.error('❌ Custom defect types kaydetme hatası:', error);
    }
  }, [defectTypesByUnit]);
  const [showAddDefectType, setShowAddDefectType] = useState(false);
  
  // Etkileşimli Dashboard için state'ler
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailDialogType, setDetailDialogType] = useState<'unit' | 'kpi' | 'trend'>('unit');
  const [selectedDetailData, setSelectedDetailData] = useState<any>(null);
  const [unitAnalysisDialogOpen, setUnitAnalysisDialogOpen] = useState(false);
  const [selectedUnitForAnalysis, setSelectedUnitForAnalysis] = useState<string>('');

  // Aylık araç verilerini yükleme fonksiyonu (useEffect'ten önce tanımlanmalı)
  const loadMonthlyVehicleData = useCallback(() => {
    try {
      const savedData = localStorage.getItem('monthlyVehicleProduction');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setMonthlyVehicles(parsedData);
        console.log('✅ Aylık araç verileri localStorage\'dan yüklendi:', parsedData.length, 'araç');
      } else {
        // ✅ YENİ: Eğer localStorage'da veri yoksa sample data oluştur
        console.log('⚠️ localStorage\'da aylık araç verisi yok, sample data oluşturuluyor...');
        generateSampleMonthlyVehicles();
      }
    } catch (error) {
      console.error('Aylık araç veri yükleme hatası:', error);
      // ✅ YENİ: Hata durumunda da sample data oluştur
      console.log('🔧 Hata nedeniyle sample data oluşturuluyor...');
      generateSampleMonthlyVehicles();
    }
  }, []);

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('productionQualityData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setDefectRecords(parsedData);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        generateSampleData();
      }
    } else {
      generateSampleData();
    }
    
    // Aylık araç verilerini yükle
    loadMonthlyVehicleData();
  }, [loadMonthlyVehicleData]);

  // Generate sample data focused on performance
  const generateSampleData = () => {
    const sampleData: QualityDefectRecord[] = [
      {
        id: '1',
        serialNumber: 'AGA-2024-001',
        vehicleType: 'Aga2100',
        defects: [
          {
            id: '1-1',
            productionUnit: 'kaynakhane',
            defectType: 'Köşe Kaynak Hatası',
            defectDescription: 'Köşe kaynak kalitesi yetersiz - İlk teslimde tespit edildi',
            severity: 'high',
            repeatCount: 2,
            status: 'closed',
            closedDate: '2024-12-05'
          }
        ],
        submissionDate: '2024-12-01',
        qualitySubmissionDate: '2024-12-02',
        inspector: 'Ahmet Yılmaz',
        status: 'closed',
        createdAt: '2024-12-01T08:00:00Z',
        updatedAt: '2024-12-05T16:30:00Z'
      },
      {
        id: '2',
        serialNumber: 'HSC-2024-012',
        vehicleType: 'HSCK',
        defects: [
          {
            id: '2-1',
            productionUnit: 'elektrikhane',
            defectType: 'LED Arızası',
            defectDescription: 'LED lamba çalışmıyor - İlk kontrolde başarısız',
            severity: 'medium',
            repeatCount: 1,
            status: 'open'
          }
        ],
        submissionDate: '2024-12-02',
        qualitySubmissionDate: '2024-12-03',
        inspector: 'Fatma Kaya',
        status: 'open',
        createdAt: '2024-12-02T09:15:00Z',
        updatedAt: '2024-12-02T09:15:00Z'
      },
      {
        id: '3',
        serialNumber: 'KDM-2024-005',
        vehicleType: 'KDM 70',
        defects: [
          {
            id: '3-1',
            productionUnit: 'boyahane',
            defectType: 'Renk Tonu Hatası',
            defectDescription: 'Renk tonu standart dışı',
            severity: 'low',
            repeatCount: 1,
            status: 'in_progress'
          },
          {
            id: '3-2',
            productionUnit: 'mekanik-montaj',
            defectType: 'Vida Sıkma Torku Yetersiz',
            defectDescription: 'Çeşitli vidalar yeterince sıkılmamış',
            severity: 'medium',
            repeatCount: 1,
            status: 'in_progress'
          }
        ],
        submissionDate: '2024-12-03',
        qualitySubmissionDate: '2024-12-04',
        inspector: 'Mehmet Özkan',
        status: 'in_progress',
        createdAt: '2024-12-03T10:20:00Z',
        updatedAt: '2024-12-03T14:45:00Z'
      },
      {
        id: '4',
        serialNumber: 'HSC-2024-015',
        vehicleType: 'HSCK',
        defects: [
          {
            id: '4-1',
            productionUnit: 'mekanik-montaj',
            defectType: 'Hatalı Montaj',
            defectDescription: 'Tekerlek montajı hatalı - Tekrarlayan sorun',
            severity: 'high',
            repeatCount: 3,
            status: 'closed',
            closedDate: '2024-12-06'
          }
        ],
        submissionDate: '2024-12-04',
        qualitySubmissionDate: '2024-12-05',
        inspector: 'Ali Demir',
        status: 'closed',
        createdAt: '2024-12-04T11:30:00Z',
        updatedAt: '2024-12-06T15:20:00Z'
      },
      {
        id: '5',
        serialNumber: 'AGA-2024-008',
        vehicleType: 'Aga2100',
        defects: [
          {
            id: '5-1',
            productionUnit: 'elektrikhane',
            defectType: 'Hatalı Montaj',
            defectDescription: 'Kablo bağlantıları hatalı montajlı',
            severity: 'medium',
            repeatCount: 4,
            status: 'open'
          }
        ],
        submissionDate: '2024-12-05',
        qualitySubmissionDate: '2024-12-06',
        inspector: 'Zeynep Yıldız',
        status: 'open',
        createdAt: '2024-12-05T13:15:00Z',
        updatedAt: '2024-12-05T13:15:00Z'
      },
      {
        id: '6',
        serialNumber: 'KDM-2024-012',
        vehicleType: 'KDM 70',
        defects: [
          {
            id: '6-1',
            productionUnit: 'boyahane',
            defectType: 'Hatalı Montaj',
            defectDescription: 'Plastik parça montajı kusurlu',
            severity: 'medium',
            repeatCount: 2,
            status: 'in_progress'
          },
          {
            id: '6-2',
            productionUnit: 'kaynakhane',
            defectType: 'Kaynak Hatası',
            defectDescription: 'Tekrarlayan kaynak kalite sorunu',
            severity: 'critical',
            repeatCount: 5,
            status: 'open'
          }
        ],
        submissionDate: '2024-12-06',
        qualitySubmissionDate: '2024-12-07',
        inspector: 'Mustafa Şen',
        status: 'open',
        createdAt: '2024-12-06T09:45:00Z',
        updatedAt: '2024-12-06T14:30:00Z'
      }
    ];

    setDefectRecords(sampleData);
    localStorage.setItem('productionQualityData', JSON.stringify(sampleData));
    
    // ✅ YENİ: Aylık üretim araçları için sample data oluştur
    generateSampleMonthlyVehicles();
  };

  // ✅ YENİ: Aylık üretim araçları için sample data oluşturma fonksiyonu
  const generateSampleMonthlyVehicles = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM
    
    const sampleMonthlyVehicles: MonthlyVehicleProduction[] = [
      // Mevcut aydaki araçlar (hatalı olanlar da dahil)
      {
        id: 'mv-1',
        vehicleType: 'Aga2100',
        serialNumber: 'AGA-2024-001',
        customerName: 'ABC İnşaat Ltd.',
        model: 'Aga2100-ST',
        productionDate: '2024-12-01',
        productionMonth: currentMonth,
        createdAt: '2024-12-01T08:00:00Z',
        updatedAt: '2024-12-01T08:00:00Z'
      },
      {
        id: 'mv-2',
        vehicleType: 'HSCK',
        serialNumber: 'HSC-2024-012',
        customerName: 'XYZ Tarım A.Ş.',
        model: 'HSCK-PRO',
        productionDate: '2024-12-02',
        productionMonth: currentMonth,
        createdAt: '2024-12-02T09:00:00Z',
        updatedAt: '2024-12-02T09:00:00Z'
      },
      {
        id: 'mv-3',
        vehicleType: 'KDM 70',
        serialNumber: 'KDM-2024-005',
        customerName: 'DEF Çiftlik İşl.',
        model: 'KDM70-Eco',
        productionDate: '2024-12-03',
        productionMonth: currentMonth,
        createdAt: '2024-12-03T10:00:00Z',
        updatedAt: '2024-12-03T10:00:00Z'
      },
      // Hatasız araçlar - İlk geçiş oranını doğru hesaplamak için
      {
        id: 'mv-4',
        vehicleType: 'Aga3000',
        serialNumber: 'AGA-2024-015',
        customerName: 'GHI Maden Ltd.',
        model: 'Aga3000-HD',
        productionDate: '2024-12-04',
        productionMonth: currentMonth,
        createdAt: '2024-12-04T11:00:00Z',
        updatedAt: '2024-12-04T11:00:00Z'
      },
      {
        id: 'mv-5',
        vehicleType: 'FTH-240',
        serialNumber: 'FTH-2024-008',
        customerName: 'JKL İnşaat A.Ş.',
        model: 'FTH240-Plus',
        productionDate: '2024-12-05',
        productionMonth: currentMonth,
        createdAt: '2024-12-05T12:00:00Z',
        updatedAt: '2024-12-05T12:00:00Z'
      },
      {
        id: 'mv-6',
        vehicleType: 'Aga6000',
        serialNumber: 'AGA-2024-022',
        customerName: 'MNO Taşımacılık',
        model: 'Aga6000-Super',
        productionDate: '2024-12-06',
        productionMonth: currentMonth,
        createdAt: '2024-12-06T13:00:00Z',
        updatedAt: '2024-12-06T13:00:00Z'
      },
      {
        id: 'mv-7',
        vehicleType: 'KDM 45',
        serialNumber: 'KDM-2024-018',
        customerName: 'PQR Tarım Kooperatifi',
        model: 'KDM45-Compact',
        productionDate: '2024-12-07',
        productionMonth: currentMonth,
        createdAt: '2024-12-07T14:00:00Z',
        updatedAt: '2024-12-07T14:00:00Z'
      },
      {
        id: 'mv-8',
        vehicleType: 'Çelik-2000',
        serialNumber: 'CEL-2024-011',
        customerName: 'STU Metal San.',
        model: 'Çelik2000-Pro',
        productionDate: '2024-12-08',
        productionMonth: currentMonth,
        createdAt: '2024-12-08T15:00:00Z',
        updatedAt: '2024-12-08T15:00:00Z'
      },
      {
        id: 'mv-9',
        vehicleType: 'KDM 80',
        serialNumber: 'KDM-2024-025',
        customerName: 'VWX Orman Ürünleri',
        model: 'KDM80-Heavy',
        productionDate: '2024-12-09',
        productionMonth: currentMonth,
        createdAt: '2024-12-09T16:00:00Z',
        updatedAt: '2024-12-09T16:00:00Z'
      },
      {
        id: 'mv-10',
        vehicleType: 'Kompost Makinesi',
        serialNumber: 'KMP-2024-003',
        customerName: 'YZA Organik Gübre',
        model: 'Kompost-Eco',
        productionDate: '2024-12-10',
        productionMonth: currentMonth,
        createdAt: '2024-12-10T17:00:00Z',
        updatedAt: '2024-12-10T17:00:00Z'
      }
    ];

    setMonthlyVehicles(sampleMonthlyVehicles);
    localStorage.setItem('monthlyVehicleProduction', JSON.stringify(sampleMonthlyVehicles));
    console.log('✅ Sample aylık araç verileri oluşturuldu:', sampleMonthlyVehicles.length, 'araç');
  };

  // Save data to localStorage
  const saveData = useCallback((data: QualityDefectRecord[]) => {
    try {
      localStorage.setItem('productionQualityData', JSON.stringify(data));
      setDefectRecords(data);
    } catch (error) {
      console.error('Veri kaydetme hatası:', error);
    }
  }, []);

  // Aylık araç verilerini kaydetme
  const saveMonthlyVehicleData = useCallback((data: MonthlyVehicleProduction[]) => {
    try {
      localStorage.setItem('monthlyVehicleProduction', JSON.stringify(data));
      setMonthlyVehicles(data);
    } catch (error) {
      console.error('Aylık araç veri kaydetme hatası:', error);
    }
  }, []);

  // Hata tipi ekleme fonksiyonu
  const addDefectType = () => {
    if (!newDefectType.trim() || !currentDefect.productionUnit) {
      alert('Lütfen geçerli bir hata tipi girin ve üretim birimini seçin!');
      return;
    }

    const unitKey = currentDefect.productionUnit;
    if (defectTypesByUnit[unitKey]?.includes(newDefectType.trim())) {
      alert('Bu hata tipi zaten mevcut!');
      return;
    }

    setDefectTypesByUnit(prev => ({
      ...prev,
      [unitKey]: [...(prev[unitKey] || []), newDefectType.trim()]
    }));

    // Eklenen hata tipini otomatik olarak seç
    setCurrentDefect(prev => ({ ...prev, defectType: newDefectType.trim() }));
    
    setNewDefectType('');
    setShowAddDefectType(false);
  };

  // Hata tipi silme fonksiyonu
  const removeDefectType = (unitKey: string, defectType: string) => {
    if (window.confirm(`"${defectType}" hata tipini silmek istediğinizden emin misiniz?`)) {
      setDefectTypesByUnit(prev => ({
        ...prev,
        [unitKey]: prev[unitKey]?.filter(type => type !== defectType) || []
      }));

      // Eğer silinen tip şu anda seçili ise temizle
      if (currentDefect.defectType === defectType) {
        setCurrentDefect(prev => ({ ...prev, defectType: '' }));
      }
    }
  };

  // Add defect to current form
  const addDefectToForm = () => {
    if (!currentDefect.productionUnit || !currentDefect.defectType || !currentDefect.defectDescription) {
      alert('Lütfen hata birimini, tipini ve açıklamasını doldurunuz!');
      return;
    }

    const newDefect: DefectDetail = {
      id: Date.now().toString(),
      ...currentDefect as DefectDetail
    };

    setFormData(prev => ({
      ...prev,
      defects: [...(prev.defects || []), newDefect]
    }));

    // Reset current defect
    setCurrentDefect({
      productionUnit: '',
      defectType: '',
      defectDescription: '',
      severity: 'medium',
      repeatCount: 1,
      status: 'open'
    });
  };

  // Remove defect from form
  const removeDefectFromForm = (defectId: string) => {
    setFormData(prev => ({
      ...prev,
      defects: (prev.defects || []).filter(d => d.id !== defectId)
    }));
  };

  // Handle form submit
  const handleSave = () => {
    // ✅ YENİ: Hata olmadan da kayıt yapılabilir (hiç hata yoksa kalite kontrolü geçmiş demektir)
    if (!formData.serialNumber || !formData.vehicleType || !formData.inspector) {
      alert('Lütfen zorunlu alanları doldurunuz! (Seri No, Araç Tipi, Kontrolör)');
      return;
    }

    const now = new Date().toISOString();
    
    if (dialogMode === 'create') {
      const newRecord: QualityDefectRecord = {
        id: Date.now().toString(),
        ...formData as QualityDefectRecord,
        createdAt: now,
        updatedAt: now
      };
      
      const updatedRecords = [...defectRecords, newRecord];
      saveData(updatedRecords);
    } else if (dialogMode === 'edit' && selectedRecord) {
      const updatedRecords = defectRecords.map(record =>
        record.id === selectedRecord.id
          ? { ...record, ...formData, updatedAt: now }
          : record
      );
      saveData(updatedRecords);
    }

    closeDialog();
  };

  // Dialog handlers
  const openCreateDialog = () => {
    setFormData({
      serialNumber: '',
      vehicleType: '',
      defects: [],
      submissionDate: new Date().toISOString().split('T')[0],
      qualitySubmissionDate: new Date().toISOString().split('T')[0],
      status: 'open',
      inspector: ''
    });
    setCurrentDefect({
      productionUnit: '',
      defectType: '',
      defectDescription: '',
      severity: 'medium',
      repeatCount: 1,
      status: 'open'
    });
    setDialogMode('create');
    setOpenDialog(true);
  };

  const openEditDialog = (record: QualityDefectRecord) => {
    setSelectedRecord(record);
    setFormData(record);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const openViewDialog = (record: QualityDefectRecord) => {
    setSelectedRecord(record);
    setFormData(record);
    setDialogMode('view');
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setSelectedRecord(null);
    setDialogMode('create');
  };

  const handleDelete = (record: QualityDefectRecord) => {
    if (window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      const updatedRecords = defectRecords.filter(r => r.id !== record.id);
      saveData(updatedRecords);
    }
  };

  // Aylık araç yönetimi fonksiyonları
  const handleAddMonthlyVehicle = () => {
    if (!monthlyVehicleForm.vehicleType || !monthlyVehicleForm.serialNumber || !monthlyVehicleForm.customerName) {
      alert('Lütfen gerekli alanları doldurun!');
      return;
    }

    if (selectedMonthlyVehicleId) {
      // Düzenleme modu
      const updatedVehicles = monthlyVehicles.map(vehicle =>
        vehicle.id === selectedMonthlyVehicleId
          ? {
              ...vehicle,
              vehicleType: monthlyVehicleForm.vehicleType!,
              serialNumber: monthlyVehicleForm.serialNumber!,
              customerName: monthlyVehicleForm.customerName!,
              model: monthlyVehicleForm.model || '',
              productionDate: monthlyVehicleForm.productionDate!,
              productionMonth: monthlyVehicleForm.productionMonth!,
              updatedAt: new Date().toISOString()
            }
          : vehicle
      );
      saveMonthlyVehicleData(updatedVehicles);
    } else {
      // Yeni ekleme modu
      const newVehicle: MonthlyVehicleProduction = {
        id: Date.now().toString(),
        vehicleType: monthlyVehicleForm.vehicleType!,
        serialNumber: monthlyVehicleForm.serialNumber!,
        customerName: monthlyVehicleForm.customerName!,
        model: monthlyVehicleForm.model || '',
        productionDate: monthlyVehicleForm.productionDate!,
        productionMonth: monthlyVehicleForm.productionMonth!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedVehicles = [...monthlyVehicles, newVehicle];
      saveMonthlyVehicleData(updatedVehicles);
    }
    
    setMonthlyVehicleDialog(false);
    resetMonthlyVehicleForm();
  };

  const resetMonthlyVehicleForm = () => {
    setMonthlyVehicleForm({
      vehicleType: '',
      serialNumber: '',
      customerName: '',
      model: '',
      productionDate: new Date().toISOString().split('T')[0],
      productionMonth: new Date().toISOString().slice(0, 7)
    });
    setSelectedMonthlyVehicleId(null);
  };

  const handleDeleteMonthlyVehicle = (vehicleId: string) => {
    if (window.confirm('Bu araç kaydını silmek istediğinizden emin misiniz?')) {
      const updatedVehicles = monthlyVehicles.filter(v => v.id !== vehicleId);
      saveMonthlyVehicleData(updatedVehicles);
    }
  };

  // DF/8D oluşturma fonksiyonu
  const handleCreateDOF = (record: QualityDefectRecord) => {
    const defect = record.defects && record.defects[0];
    const dofParams: DOFCreationParams = {
      sourceModule: 'productionQualityTracking',
      recordId: record.id,
      recordData: record,
      issueType: 'defect',
      issueDescription: `Araç: ${getVehicleTypeLabel(record.vehicleType)} (${record.serialNumber})
Üretim Birimi: ${defect ? getProductionUnitLabel(defect.productionUnit) : 'N/A'}
Hata Tipi: ${defect ? defect.defectType : 'N/A'}
Hata Açıklaması: ${defect ? defect.defectDescription : 'N/A'}
Kritiklik: ${defect ? getSeverityLabel(defect.severity) : 'N/A'}
Tekrar Sayısı: ${defect ? defect.repeatCount : 0}
Tespit Tarihi: ${new Date(record.submissionDate).toLocaleDateString('tr-TR')}`,
      priority: defect ? defect.severity : 'medium',
      affectedDepartment: defect ? getProductionUnitLabel(defect.productionUnit) : 'Bilinmiyor',
      responsiblePerson: record.inspector || 'Belirtilmemiş'
    };

    // DF kaydı oluştur
    const result = createDOFFromSourceRecord(dofParams);
    
    if (result.success) {
      // DF form açma bilgilerini localStorage'a kaydet
      localStorage.setItem('dof-auto-open-form', 'true');
      localStorage.setItem('dof-form-prefill', JSON.stringify({
        ...dofParams,
        dofNumber: result.dofRecord?.dofNumber,
        openInEditMode: true
      }));
      
      // DF/8D Management sayfasına direkt yönlendir
      window.location.href = '/dof-8d-management';
    } else {
      alert(`DF oluşturma hatası: ${result.error}`);
    }
  };

  // ✅ ETKILEŞIMLI DASHBOARD FONKSIYONLARI
  
  // KPI kartına tıklama - detaylı analiz
  const handleKPICardClick = (kpiType: string) => {
    const kpiData = getFilteredQualityKPIs();
    let detailData;

    switch (kpiType) {
      case 'total_vehicles':
        detailData = {
          title: 'Toplam İşlenen Araç Detay Analizi',
          type: 'total_vehicles',
          mainValue: getFilteredProductionUnitPerformance().reduce((sum, u) => sum + u.totalVehicles, 0),
          subMetrics: [
            { label: 'En Çok İşleyen Departman', value: Math.max(...getFilteredProductionUnitPerformance().map(u => u.totalVehicles)) },
            { label: 'En Az İşleyen Departman', value: Math.min(...getFilteredProductionUnitPerformance().map(u => u.totalVehicles)) },
            { label: 'Ortalama Araç/Departman', value: Math.round(getFilteredProductionUnitPerformance().reduce((sum, u) => sum + u.totalVehicles, 0) / getFilteredProductionUnitPerformance().length) },
            { label: 'Aktif Departman Sayısı', value: getFilteredProductionUnitPerformance().filter(u => u.totalVehicles > 0).length }
          ],
          detailedBreakdown: getFilteredProductionUnitPerformance().map(unit => ({
            name: unit.unitName,
            value: unit.totalVehicles,
            color: unit.color,
            additional: `${unit.totalDefects} hata`
          })),
          recommendations: [
            'İş yükü dağılımını dengeleyin',
            'Kapasiteyi verimli kullanın',
            'Departmanlar arası koordinasyonu artırın'
          ]
        };
        break;
      
      case 'critical_defects':
        const criticalDefectsData = filteredData.filter(r => 
          r.defects && r.defects.some(d => d.severity === 'critical')
        );
        
        // Departman bazlı kritik hata dağılımı
        const criticalDefectsByUnit = getFilteredProductionUnitPerformance().map(unit => {
          const unitCriticalDefects = filteredData.reduce((sum, record) => {
            if (!record.defects) return sum;
            return sum + record.defects.filter(d => 
              d.productionUnit === unit.unit && d.severity === 'critical'
            ).reduce((defectSum, defect) => defectSum + defect.repeatCount, 0);
          }, 0);
          
          return {
            name: unit.unitName,
            value: unitCriticalDefects,
            color: unit.color,
            additional: `${unit.totalDefects} toplam hata`
          };
        }).filter(unit => unit.value > 0 || criticalDefectsData.length === 0)
          .sort((a, b) => b.value - a.value);
        
        // Eğer hiç kritik hata yoksa placeholder göster
        const finalBreakdown = criticalDefectsByUnit.length > 0 ? criticalDefectsByUnit : 
          getFilteredProductionUnitPerformance().slice(0, 5).map(unit => ({
            name: unit.unitName,
            value: 0,
            color: unit.color,
            additional: 'Kritik hata bulunamadı'
          }));
        
        detailData = {
          title: 'Kritik Hatalar Detay Analizi',
          type: 'critical_defects',
          mainValue: kpiData.criticalDefects,
          subMetrics: [
            { label: 'Kritik Hata Oranı', value: kpiData.totalDefects > 0 ? `%${Math.round((kpiData.criticalDefects / kpiData.totalDefects) * 100)}` : '%0' },
            { label: 'En Çok Kritik Hata Olan Departman', value: getProductionUnitWithMostCriticalDefects() },
            { label: 'Bu Hafta Kritik Hata', value: getWeeklyCriticalDefects() },
            { label: 'Geçen Hafta Kritik Hata', value: getPrevWeeklyCriticalDefects() }
          ],
          detailedBreakdown: finalBreakdown,
          recommendations: [
            'Kritik hataların kök neden analizini yapın',
            'Acil düzeltici eylemler alın',
            'Kalite kontrol süreçlerini gözden geçirin'
          ]
        };
        break;
        
      case 'closed_defects':
        detailData = {
          title: 'Çözülen Hatalar Analizi',
          type: 'closed_defects',
          mainValue: filteredData.filter(r => r.status === 'closed').length,
          subMetrics: [
            { label: 'Çözüm Oranı', value: `%${Math.round((filteredData.filter(r => r.status === 'closed').length / filteredData.length) * 100)}` },
            { label: 'Ortalama Çözüm Süresi', value: `${getAverageResolutionTime()} gün` },
            { label: 'Bu Ay Çözülen', value: getMonthlyClosedDefects() },
            { label: 'Hızlı Çözülen (< 3 gün)', value: getQuicklyResolvedDefects() }
          ],
          detailedBreakdown: getClosureAnalysisByUnit(),
          recommendations: [
            'Çözüm sürelerini kısaltmak için süreç optimizasyonu yapın',
            'İyi performans gösteren departmanların yöntemlerini paylaşın',
            'Hızlı çözüm prosedürlerini standartlaştırın'
          ]
        };
        break;
        
      case 'repeated_defects':
        detailData = {
          title: 'Tekrarlanan Hatalar Analizi',
          type: 'repeated_defects',
          mainValue: filteredData.reduce((sum, record) => {
            if (!record.defects) return sum;
            return sum + record.defects.filter(defect => defect.repeatCount > 1).length;
          }, 0),
          subMetrics: [
            { label: 'En Çok Tekrarlanan', value: Math.max(...filteredData.flatMap(r => r.defects || []).map(d => d.repeatCount)) },
            { label: 'Ortalama Tekrar Sayısı', value: (filteredData.flatMap(r => r.defects || []).reduce((sum, d) => sum + d.repeatCount, 0) / Math.max(1, filteredData.flatMap(r => r.defects || []).length)).toFixed(1) },
            { label: 'Tekrarlanan Hata Türü Sayısı', value: new Set(filteredData.flatMap(r => r.defects || []).filter(d => d.repeatCount > 1).map(d => d.defectType)).size },
            { label: 'Toplam Hata Sayısı', value: filteredData.flatMap(r => r.defects || []).length }
          ],
          detailedBreakdown: getFilteredProductionUnitPerformance().map(unit => ({
            name: unit.unitName,
            value: unit.repeatedVehicles,
            color: unit.color,
            additional: `${unit.totalVehicles} toplam araç`
          })),
          recommendations: [
            'Tekrarlanan hataların kök nedenlerini araştırın',
            'Süreç iyileştirmeleri yapın',
            'Kalite kontrol noktalarını güçlendirin'
          ]
        };
        break;
    }

    setSelectedDetailData(detailData);
    setDetailDialogType('kpi');
    setDetailDialogOpen(true);
  };

  // Departman kartına tıklama - birim detay analizi
  const handleUnitCardClick = (unit: string, unitData: ProductionUnitPerformance) => {
    const unitDefects = filteredData.filter(r => 
      r.defects && r.defects.some(d => d.productionUnit === unit)
    );
    
    const detailData = {
      title: `${unitData.unitName} - Detay Performans Analizi`,
      type: 'unit_analysis',
      unitCode: unit,
      unitName: unitData.unitName,
      mainMetrics: {
        totalDefects: unitData.totalDefects,
        repeatedVehicles: unitData.repeatedVehicles,
        averageDefectsPerVehicle: unitData.averageDefectsPerVehicle,
        totalVehicles: unitData.totalVehicles
      },
      timeSeriesData: generateUnitTimeSeriesData(unit),
      defectTypeBreakdown: getDefectTypeBreakdownForUnit(unit),
      severityAnalysis: getSeverityAnalysisForUnit(unit),
      trendAnalysis: calculateRealTrend(unit),
      recentDefects: unitDefects.slice(0, 5), // Son 5 hata
      recommendations: generateUnitRecommendations(unitData)
    };

    setSelectedDetailData(detailData);
    setDetailDialogType('unit');
    setDetailDialogOpen(true);
  };

  // Yardımcı fonksiyonlar
  const getProductionUnitWithMostCriticalDefects = () => {
    const units = getFilteredProductionUnitPerformance();
    const criticalCounts = units.map(unit => ({
      ...unit,
      criticalDefects: filteredData.filter(r => 
        r.defects && r.defects.some(d => d.productionUnit === unit.unit && d.severity === 'critical')
      ).length
    }));
    const maxCritical = Math.max(...criticalCounts.map(u => u.criticalDefects));
    const topUnit = criticalCounts.find(u => u.criticalDefects === maxCritical);
    return topUnit ? topUnit.unitName : 'Veri Yok';
  };

  const getWeeklyCriticalDefects = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return filteredData.filter(r => 
      new Date(r.submissionDate) >= weekAgo && 
      r.defects && r.defects.some(d => d.severity === 'critical')
    ).length;
  };

  const getPrevWeeklyCriticalDefects = () => {
    const twoWeeksAgo = new Date();
    const weekAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return filteredData.filter(r => 
      new Date(r.submissionDate) >= twoWeeksAgo && 
      new Date(r.submissionDate) < weekAgo &&
      r.defects && r.defects.some(d => d.severity === 'critical')
    ).length;
  };

  const getAverageResolutionTime = () => {
    const closedRecords = filteredData.filter(r => r.status === 'closed');
    if (closedRecords.length === 0) return 0;
    
    const totalTime = closedRecords.reduce((sum, record) => {
      const closedDefects = record.defects ? record.defects.filter(d => d.closedDate) : [];
      if (closedDefects.length === 0) return sum;
      
      const avgTimeForRecord = closedDefects.reduce((defectSum, defect) => {
        const submitDate = new Date(record.submissionDate);
        const closeDate = new Date(defect.closedDate!);
        return defectSum + (closeDate.getTime() - submitDate.getTime());
      }, 0) / closedDefects.length;
      
      return sum + avgTimeForRecord;
    }, 0);
    
    return Math.round(totalTime / (closedRecords.length * 24 * 60 * 60 * 1000));
  };

  const getMonthlyClosedDefects = () => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    return filteredData.filter(r => {
      const recordDate = new Date(r.submissionDate);
      return r.status === 'closed' && 
             recordDate.getMonth() === thisMonth && 
             recordDate.getFullYear() === thisYear;
    }).length;
  };

  const getQuicklyResolvedDefects = () => {
    return filteredData.filter(r => {
      if (r.status !== 'closed') return false;
      const closedDefects = r.defects ? r.defects.filter(d => d.closedDate) : [];
      return closedDefects.some(d => {
        const submitDate = new Date(r.submissionDate);
        const closeDate = new Date(d.closedDate!);
        const daysDiff = (closeDate.getTime() - submitDate.getTime()) / (24 * 60 * 60 * 1000);
        return daysDiff <= 3;
      });
    }).length;
  };

  const getClosureAnalysisByUnit = () => {
    return getFilteredProductionUnitPerformance().map(unit => ({
      name: unit.unitName,
      value: filteredData.filter(r => 
        r.status === 'closed' && r.defects && r.defects.some(d => d.productionUnit === unit.unit)
      ).length,
      color: unit.color,
      additional: `%${Math.round((filteredData.filter(r => r.status === 'closed' && r.defects && r.defects.some(d => d.productionUnit === unit.unit)).length / Math.max(1, filteredData.filter(r => r.defects && r.defects.some(d => d.productionUnit === unit.unit)).length)) * 100)} çözüm oranı`
    }));
  };

  const getLongTermOpenDefects = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return filteredData.filter(r => 
      r.status === 'open' && new Date(r.submissionDate) <= weekAgo
    ).length;
  };

  const getTodayOpenDefects = () => {
    const today = new Date().toISOString().split('T')[0];
    return filteredData.filter(r => 
      r.status === 'open' && r.submissionDate === today
    ).length;
  };

  const getAverageOpenTime = () => {
    const openRecords = filteredData.filter(r => r.status === 'open');
    if (openRecords.length === 0) return 0;
    
    const totalTime = openRecords.reduce((sum, record) => {
      const submitDate = new Date(record.submissionDate);
      const now = new Date();
      return sum + (now.getTime() - submitDate.getTime());
    }, 0);
    
    return Math.round(totalTime / (openRecords.length * 24 * 60 * 60 * 1000));
  };

  const getMaxOpenTime = () => {
    const openRecords = filteredData.filter(r => r.status === 'open');
    if (openRecords.length === 0) return 0;
    
    const maxTime = Math.max(...openRecords.map(record => {
      const submitDate = new Date(record.submissionDate);
      const now = new Date();
      return now.getTime() - submitDate.getTime();
    }));
    
    return Math.round(maxTime / (24 * 60 * 60 * 1000));
  };

  const getOpenDefectsByPriority = () => {
    const severities = ['critical', 'high', 'medium', 'low'];
    return severities.map(severity => ({
      name: getSeverityLabel(severity),
      value: filteredData.filter(r => 
        r.status === 'open' && r.defects && r.defects.some(d => d.severity === severity)
      ).length,
      color: getSeverityColor(severity),
      additional: `${severity} öncelik`
    }));
  };

  const generateUnitTimeSeriesData = (unit: string) => {
    // Son 12 ayın verilerini hesapla
    const months = 12;
    const data = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthDefects = filteredData.filter(r => {
        const recordDate = new Date(r.submissionDate);
        return recordDate >= monthDate && recordDate < nextMonthDate &&
               r.defects && r.defects.some(d => d.productionUnit === unit);
      }).reduce((sum, record) => {
        return sum + (record.defects?.filter(d => d.productionUnit === unit)
          .reduce((defectSum, defect) => defectSum + defect.repeatCount, 0) || 0);
      }, 0);
      
      data.push({
        date: monthDate.toISOString().split('T')[0],
        defects: monthDefects,
        dateLabel: monthDate.toLocaleDateString('tr-TR', { 
          month: 'short', 
          year: '2-digit' 
        }),
        monthYear: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
      });
    }
    
    return data;
  };

  const getDefectTypeBreakdownForUnit = (unit: string) => {
    const unitDefects = filteredData.filter(r => 
      r.defects && r.defects.some(d => d.productionUnit === unit)
    ).flatMap(r => r.defects ? r.defects.filter(d => d.productionUnit === unit) : []);
    
    const typeCount: { [key: string]: number } = {};
    unitDefects.forEach(defect => {
      typeCount[defect.defectType] = (typeCount[defect.defectType] || 0) + 1;
    });
    
    return Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({
        name: type,
        value: count,
        percentage: Math.round((count / unitDefects.length) * 100)
      }));
  };

  const getSeverityAnalysisForUnit = (unit: string) => {
    const unitDefects = filteredData.filter(r => 
      r.defects && r.defects.some(d => d.productionUnit === unit)
    ).flatMap(r => r.defects ? r.defects.filter(d => d.productionUnit === unit) : []);
    
    const severityCount: { [key: string]: number } = {};
    unitDefects.forEach(defect => {
      severityCount[defect.severity] = (severityCount[defect.severity] || 0) + 1;
    });
    
    return ['critical', 'high', 'medium', 'low'].map(severity => ({
      name: getSeverityLabel(severity),
      value: severityCount[severity] || 0,
      color: getSeverityColor(severity),
      percentage: unitDefects.length > 0 ? Math.round(((severityCount[severity] || 0) / unitDefects.length) * 100) : 0
    }));
  };

  const generateUnitRecommendations = (unitData: ProductionUnitPerformance) => {
    const recommendations = [];
    
    if (unitData.repeatedVehicles > 2) {
      recommendations.push('Tekrarlanan hataları azaltmak için süreç iyileştirmesi yapın');
    }
    
    if (unitData.totalDefects > 5) {
      recommendations.push('Toplam hata sayısını azaltmak için kök neden analizi yapın');
    }
    
    if (unitData.averageDefectsPerVehicle > 2) {
      recommendations.push('Araç başına hata sayısını düşürmek için kalite kontrol noktalarını artırın');
    }
    
    if (unitData.totalVehicles === 0) {
      recommendations.push('Bu birimde henüz işlem yapılmamış');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('İyi performans! Mevcut standartları koruyun ve sürekli iyileştirme yapın');
    }
    
    return recommendations;
  };

  // Performance Analytics
  const getProductionUnitPerformance = (): ProductionUnitPerformance[] => {
    return productionUnits.map(unit => {
      // Bu birimde hata olan araçları bul
      const vehiclesWithUnitDefects = defectRecords.filter(record =>
        record.defects && record.defects.some(defect => defect.productionUnit === unit.value)
      );
      
      // Bu birimde toplam hata sayısı (tekrar sayısı dahil)
      const totalUnitDefectsWithRepeats = defectRecords.reduce((sum, record) => {
        if (!record.defects) return sum;
        return sum + record.defects
          .filter(defect => defect.productionUnit === unit.value)
          .reduce((defectSum, defect) => defectSum + defect.repeatCount, 0);
      }, 0);
      
      // İLK GEÇİŞ ORANI: TOPLAM ÜRETİLEN ARAÇLAR BAZ ALINIR (doğru hesaplama)
      
      // 1. Toplam üretilen araç sayısını aylık üretim verilerinden al
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const totalProducedVehicles = monthlyVehicles.filter(v => 
        v.productionMonth === currentMonth
      ).length;
      
      // 2. Bu birimde hatası olan araçları bul (defectRecords'tan, filtrelenmemiş)
      const vehiclesWithUnitDefectsInThisMonth = defectRecords.filter(record => {
        // Önce tarihi kontrol et (sadece bu aydakiler)
        const recordMonth = new Date(record.submissionDate).toISOString().slice(0, 7);
        if (recordMonth !== currentMonth) return false;
        
        // Bu birimde hata var mı?
        return record.defects && record.defects.some(defect => defect.productionUnit === unit.value);
      });
      
      // 3. Bu birimde ilk seferde başarılı olanları bul
      const vehiclesPassedFirstTime = vehiclesWithUnitDefectsInThisMonth.filter(record => {
        const unitDefectsForVehicle = record.defects ? record.defects.filter(defect => 
          defect.productionUnit === unit.value
        ) : [];
        // Bu birimde hata varsa hepsi ilk seferde (repeatCount <= 1) olmalı
        return unitDefectsForVehicle.every(defect => defect.repeatCount <= 1);
      });
      
      // ✅ YENİ: BASİT İLK GEÇİŞ ORANI HESABI
      // İlk geçiş oranı = Hata kaydı olmayan araç sayısı / Toplam üretilen araç sayısı
      // Örnek: 10 araç üretilmiş, 5'ine hata kaydı girişse ilk geçiş oranı %50
      const vehiclesWithoutAnyDefects = totalProducedVehicles - vehiclesWithUnitDefectsInThisMonth.length;
      const firstTimePassRate = totalProducedVehicles > 0 ? 
        (vehiclesWithoutAnyDefects / totalProducedVehicles) * 100 : 100;
      
      // DEBUG: İlk geçiş oranı hesaplama bilgisi
      console.log(`${unit.label} İlk Geçiş Oranı Hesaplama (BASİT):`, {
        totalProducedVehicles,
        vehiclesWithDefects: vehiclesWithUnitDefectsInThisMonth.length,
        vehiclesWithoutDefects: vehiclesWithoutAnyDefects,
        firstTimePassRate: firstTimePassRate.toFixed(1) + '%',
        calculation: `${vehiclesWithoutAnyDefects}/${totalProducedVehicles} = ${firstTimePassRate.toFixed(1)}%`
      });
      
      // ✅ DÜZELTME: Araç başına ortalama hata sayısı (TOPLAM üretilen araçlara göre)
      // Aylık üretim verilerinden toplam araç sayısını al
      const currentMonth1 = new Date().toISOString().slice(0, 7); // YYYY-MM
      const totalProducedVehicles1 = monthlyVehicles.filter(v => 
        v.productionMonth === currentMonth1
      ).length;
      
      // Eğer aylık üretim verisi yoksa tüm veriyi kullan
      const totalVehicleCount1 = totalProducedVehicles1 > 0 ? totalProducedVehicles1 : monthlyVehicles.length;
      
      // Ortalama hata = toplam hata / toplam araç (hatalı olmayan araçlar da dahil)
      const avgDefectsPerVehicle = totalVehicleCount1 > 0 ? 
        totalUnitDefectsWithRepeats / totalVehicleCount1 : 0;
      
      // KALİTE SKORU HESAPLAMA - TÜRKİYE SANAYI STANDARTLARI (TSE)
      let qualityScore;
      
      if (vehiclesWithUnitDefects.length === 0) {
        // Hiç hata yoksa mükemmel skor
        qualityScore = 100;
      } else {
        // POKA-YOKE VE SIX SIGMA TABANLI HESAPLAMA
        
        // 1. Hata Yoğunluk Oranı (DPO - Defects Per Opportunity)
        const defectRate = (totalUnitDefectsWithRepeats / vehiclesWithUnitDefects.length);
        
        // 2. Six Sigma Sigma Seviyesi Hesabı (Basitleştirilmiş)
        // 0-1 hata/araç = Sigma 6 (99.9997% kalite)
        // 1-2 hata/araç = Sigma 5 (99.977% kalite)
        // 2-3 hata/araç = Sigma 4 (99.379% kalite)
        // 3-4 hata/araç = Sigma 3 (93.32% kalite)
        // 4+ hata/araç = Sigma 2 (69.15% kalite)
        
        let sigmaLevel;
        if (defectRate <= 0.5) sigmaLevel = 6;
        else if (defectRate <= 1.0) sigmaLevel = 5;
        else if (defectRate <= 2.0) sigmaLevel = 4;
        else if (defectRate <= 3.0) sigmaLevel = 3;
        else if (defectRate <= 4.0) sigmaLevel = 2;
        else sigmaLevel = 1;
        
        // 3. Sigma seviyesinden kalite skoruna dönüşüm
        const sigmaToQualityScore = {
          6: 100,  // Mükemmel
          5: 95,   // Çok İyi
          4: 85,   // İyi
          3: 70,   // Kabul Edilebilir
          2: 50,   // Gelişmeli
          1: 25    // Kritik
        };
        
        let baseScore = sigmaToQualityScore[sigmaLevel];
        
        // 4. İlk Geçiş Başarısı Bonus/Cezası
        const firstTimePassBonus = (firstTimePassRate - 70) * 0.3; // 70% altı ceza, üstü bonus
        
                         // 5. Tekrar Hatası Cezası
        const repeatedVehiclesCount = vehiclesWithUnitDefects.length - vehiclesPassedFirstTime.length;
        const repeatPenalty = Math.min((repeatedVehiclesCount / vehiclesWithUnitDefects.length) * 30, 20);
        
        // FINAL SKOR
        qualityScore = Math.round(baseScore + firstTimePassBonus - repeatPenalty);
        
        // DEBUG BİLGİSİ (Geliştirme amaçlı)
        console.log(`${unit.label} Kalite Skoru Hesaplaması:`, {
          vehiclesWithUnitDefects: vehiclesWithUnitDefects.length,
          totalUnitDefectsWithRepeats,
          defectRate: defectRate.toFixed(2),
          sigmaLevel,
          baseScore,
          firstTimePassRate: firstTimePassRate.toFixed(1),
          firstTimePassBonus: firstTimePassBonus.toFixed(1),
          repeatedVehicles: repeatedVehiclesCount,
          repeatPenalty: repeatPenalty.toFixed(1),
          finalScore: qualityScore
        });
        
        // Sınırlar
        qualityScore = Math.max(1, Math.min(100, qualityScore));
      }

      // Tekrarlanan araç sayısını hesapla
      const repeatedVehiclesCount = vehiclesWithUnitDefects.length - vehiclesPassedFirstTime.length;

      // ✅ DÜZELTME: Toplam araç sayısını mevcut ay aylık üretim verilerinden al
      const currentMonth2 = new Date().toISOString().slice(0, 7); // YYYY-MM
      const totalProducedVehicles2 = monthlyVehicles.filter(v => 
        v.productionMonth === currentMonth2
      ).length;
      
      // Eğer aylık üretim verisi yoksa tüm veriyi kullan
      const totalVehicleCount2 = totalProducedVehicles2 > 0 ? totalProducedVehicles2 : monthlyVehicles.length;

      return {
        unit: unit.value,
        unitName: unit.label,
        totalDefects: totalUnitDefectsWithRepeats, // Tekrarlama sayısı dahil toplam hata
        averageDefectsPerVehicle: Math.round(avgDefectsPerVehicle * 100) / 100,
        firstTimePassRate: Math.round(firstTimePassRate * 100) / 100,
        qualityScore: qualityScore,
        totalVehicles: totalVehicleCount2, // ✅ YENİ: Toplam üretim verisi
        repeatedVehicles: repeatedVehiclesCount,
        color: unit.color
      };
    });
  };

  // Quality Performance KPIs
  const getQualityKPIs = () => {
    // ✅ DÜZELTME: Filtrelenmiş verileri kullan
    const filteredData = getFilteredData();
    
    // Tekrarlama sayısını dahil ederek toplam hata sayısını hesapla
    const totalDefects = filteredData.reduce((sum, record) => {
      if (!record.defects) return sum;
      return sum + record.defects.reduce((defectSum, defect) => defectSum + defect.repeatCount, 0);
    }, 0);
    
    // Hata olan araçlar
    const vehiclesWithDefects = filteredData.filter(record => 
      record.defects && record.defects.length > 0
    );
    
    // ✅ DÜZELTME: Kullanıcının seçtiği filtreye göre toplam araç sayısını hesapla
    let filteredMonthlyVehicles = [];
    
    if (filters.period === 'monthly' && filters.year && filters.month) {
      const filterMonth = `${filters.year}-${filters.month}`;
      filteredMonthlyVehicles = monthlyVehicles.filter(v => 
        v.productionMonth === filterMonth
      );
    } else if (filters.period === 'quarterly' && filters.year && filters.quarter) {
      // Çeyreklik filtreleme
      let startMonth = 1, endMonth = 3;
      switch (filters.quarter) {
        case 'Q1': startMonth = 1; endMonth = 3; break;
        case 'Q2': startMonth = 4; endMonth = 6; break;
        case 'Q3': startMonth = 7; endMonth = 9; break;
        case 'Q4': startMonth = 10; endMonth = 12; break;
      }
      
      filteredMonthlyVehicles = monthlyVehicles.filter(v => {
        const vehicleYear = parseInt(v.productionMonth.split('-')[0]);
        const vehicleMonth = parseInt(v.productionMonth.split('-')[1]);
        return vehicleYear === parseInt(filters.year) && 
               vehicleMonth >= startMonth && vehicleMonth <= endMonth;
      });
    } else if (filters.period === 'custom' && filters.dateFrom && filters.dateTo) {
      // Özel tarih aralığı
      filteredMonthlyVehicles = monthlyVehicles.filter(v => {
        if (!v.productionDate) return false; // ✅ KONTROL: Tarih yoksa dahil etme
        const vehicleDate = new Date(v.productionDate);
        if (isNaN(vehicleDate.getTime())) return false; // ✅ KONTROL: Geçersiz tarih kontrolü
        const fromDate = new Date(filters.dateFrom);
        const toDate = new Date(filters.dateTo);
        return vehicleDate >= fromDate && vehicleDate <= toDate;
      });
    } else {
      // Filtre seçilmemişse TÜM araçları kullan
      filteredMonthlyVehicles = monthlyVehicles;
    }
    
    const totalVehiclesCount = filteredMonthlyVehicles.length;
    
    const avgDefectsPerVehicle = totalVehiclesCount > 0 ? totalDefects / totalVehiclesCount : 0;
    
    // İlk geçiş başarılı araçlar: Hiç hatası olmayan + tüm hataları ilk seferde olan
    const vehiclesWithoutDefectsCount = totalVehiclesCount - vehiclesWithDefects.length;
    
    const firstTimeSuccessVehicles = vehiclesWithDefects.filter(record =>
      record.defects && record.defects.every(defect => defect.repeatCount <= 1)
    );
    
    const totalFirstTimePass = vehiclesWithoutDefectsCount + firstTimeSuccessVehicles.length;
    const firstTimePassRate = totalVehiclesCount > 0 ? 
      (totalFirstTimePass / totalVehiclesCount) * 100 : 100;
    
    const repeatedVehicles = vehiclesWithDefects.filter(record =>
      record.defects && record.defects.some(defect => defect.repeatCount > 1)
    );
    
    const repeatRate = totalVehiclesCount > 0 ? (repeatedVehicles.length / totalVehiclesCount) * 100 : 0;

    // ✅ DEBUG: KPI hesaplama detayları
    console.log('📊 Dashboard KPI Hesaplamaları:', {
      filterPeriod: filters.period,
      filterYear: filters.year,
      filterMonth: filters.month,
      filterQuarter: filters.quarter,
      totalMonthlyVehicles: monthlyVehicles.length,
      filteredMonthlyVehicles: filteredMonthlyVehicles.length,
      totalVehiclesCount: totalVehiclesCount,
      filteredDataLength: filteredData.length,
      vehiclesWithDefects: vehiclesWithDefects.length,
      vehiclesWithoutDefects: vehiclesWithoutDefectsCount,
      totalDefects: totalDefects,
      avgDefectsPerVehicle: avgDefectsPerVehicle,
      firstTimePassRate: firstTimePassRate,
      repeatRate: repeatRate
    });

    return {
      totalVehicles: totalVehiclesCount,
      totalDefects,
      avgDefectsPerVehicle: Math.round(avgDefectsPerVehicle * 100) / 100,
      firstTimePassRate: Math.round(firstTimePassRate * 100) / 100,
      repeatRate: Math.round(repeatRate * 100) / 100,
      criticalDefects: filteredData.reduce((sum, record) => {
        if (!record.defects) return sum;
        return sum + record.defects
          .filter(defect => defect.severity === 'critical')
          .reduce((criticalSum, defect) => criticalSum + defect.repeatCount, 0);
      }, 0)
    };
  };

  // Filter data - Gelişmiş filtreleme sistemi
  const getFilteredData = () => {
    return defectRecords.filter(record => {
      const matchVehicleType = !filters.vehicleType || record.vehicleType === filters.vehicleType;
      const matchProductionUnit = !filters.productionUnit || (record.defects && record.defects.some(defect => defect.productionUnit === filters.productionUnit));
      const matchStatus = !filters.status || record.status === filters.status;
      const matchSearch = !filters.searchTerm || 
        record.serialNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (record.defects && record.defects.some(defect => defect.defectType.toLowerCase().includes(filters.searchTerm.toLowerCase())));
      
      // ✅ YENİ: Gelişmiş tarih filtreleme - Ay filtresi dönemden bağımsız çalışabilir
      let matchDate = true;
      
      // Önce yıl kontrolü yap
      const recordDate = new Date(record.submissionDate);
      const recordYear = recordDate.getFullYear();
      const yearMatch = !filters.year || recordYear.toString() === filters.year;
      
      // Ay filtresi (dönemden bağımsız)
      let monthMatch = true;
      if (filters.month) {
        const recordMonth = String(recordDate.getMonth() + 1).padStart(2, '0');
        monthMatch = recordMonth === filters.month;
      }
      
      // Dönem bazlı filtreleme
      if (filters.period === 'monthly' && filters.year && filters.month) {
        matchDate = yearMatch && monthMatch;
      } else if (filters.period === 'quarterly' && filters.year && filters.quarter) {
        const recordMonth = recordDate.getMonth() + 1; // 1-12
        
        let quarterMatch = false;
        switch (filters.quarter) {
          case 'Q1': quarterMatch = recordMonth >= 1 && recordMonth <= 3; break;
          case 'Q2': quarterMatch = recordMonth >= 4 && recordMonth <= 6; break;
          case 'Q3': quarterMatch = recordMonth >= 7 && recordMonth <= 9; break;
          case 'Q4': quarterMatch = recordMonth >= 10 && recordMonth <= 12; break;
        }
        matchDate = yearMatch && quarterMatch;
      } else if (filters.period === 'custom') {
        const matchDateFrom = !filters.dateFrom || record.submissionDate >= filters.dateFrom;
        const matchDateTo = !filters.dateTo || record.submissionDate <= filters.dateTo;
        matchDate = matchDateFrom && matchDateTo;
      } else {
        // ✅ YENİ: Dönem seçilmemiş ama yıl/ay filtreleri varsa onları uygula
        matchDate = yearMatch && monthMatch;
      }

      return matchVehicleType && matchProductionUnit && matchStatus && matchSearch && matchDate;
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#FFC107';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'closed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Açık';
      case 'in_progress': return 'İşlemde';
      case 'closed': return 'Kapalı';
      default: return status;
    }
  };

  const getProductionUnitLabel = (unit: string) => {
    const found = productionUnits.find(u => u.value === unit);
    return found ? found.label : unit;
  };

  const getVehicleTypeLabel = (type: string) => {
    const found = vehicleTypes.find(v => v.value === type);
    return found ? found.label : type;
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Kritik';
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return severity;
    }
  };

  const filteredData = getFilteredData();
  
  // TOP 5 Causes analysis memoized
  const memoizedTop5Causes = React.useMemo(() => {
    console.log('🔄 TOP 5 Causes hesaplanıyor, filteredData uzunluğu:', filteredData.length);
    
    // Detaylı sebep analizi için filtrelenmiş veri kullan
    const detailedCauses = filteredData.flatMap(record => 
      record.defects?.map(defect => ({
        productionUnit: defect.productionUnit,
        defectType: defect.defectType,
        defectDescription: defect.defectDescription,
        severity: defect.severity,
        repeatCount: defect.repeatCount || 1
      })) || []
    );

    console.log('📊 Detaylı sebep listesi:', detailedCauses.length, 'adet');

    // Sebep türlerine göre gruplandırma
    const causeAnalysis = detailedCauses.reduce((acc, defect) => {
      const key = defect.defectType;
      if (!acc[key]) {
        acc[key] = {
          defectType: defect.defectType,
          productionUnit: defect.productionUnit,
          totalCount: 0,
          severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
          descriptions: []
        };
      }
      acc[key].totalCount += defect.repeatCount;
      acc[key].severityBreakdown[defect.severity as keyof typeof acc[typeof key]['severityBreakdown']]++;
      if (!acc[key].descriptions.includes(defect.defectDescription)) {
        acc[key].descriptions.push(defect.defectDescription);
      }
      return acc;
    }, {} as Record<string, any>);

    let top5Causes = Object.values(causeAnalysis)
      .sort((a: any, b: any) => b.totalCount - a.totalCount);

    console.log('🏆 Sıralanmış sebepler:', top5Causes.length, 'adet');

    // Her zaman 5 kart göster - TOP 5 analizi
    if (top5Causes.length === 0) {
      console.log('⚠️ Hiç veri yok, placeholder kartlar gösteriliyor');
      // Hiç veri yoksa 5 placeholder kart göster
      top5Causes = [
        {
          defectType: 'Veri Bulunamadı',
          productionUnit: '',
          totalCount: 0,
          severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
          descriptions: ['Seçilen tarih aralığında hata verisi bulunmuyor']
        },
        {
          defectType: 'Veri Bulunamadı',
          productionUnit: '',
          totalCount: 0,
          severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
          descriptions: ['Seçilen tarih aralığında hata verisi bulunmuyor']
        },
        {
          defectType: 'Veri Bulunamadı',
          productionUnit: '',
          totalCount: 0,
          severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
          descriptions: ['Seçilen tarih aralığında hata verisi bulunmuyor']
        },
        {
          defectType: 'Veri Bulunamadı',
          productionUnit: '',
          totalCount: 0,
          severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
          descriptions: ['Seçilen tarih aralığında hata verisi bulunmuyor']
        },
        {
          defectType: 'Veri Bulunamadı',
          productionUnit: '',
          totalCount: 0,
          severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
          descriptions: ['Seçilen tarih aralığında hata verisi bulunmuyor']
        }
      ];
    } else {
      console.log('✅ Veri var, TOP 5 hesaplanıyor');
      // Veri varsa en yüksek 5 tanesini al, 5'ten azsa kalan yerleri 0'larla doldur
      const topCauses = top5Causes.slice(0, 5);
      while (topCauses.length < 5) {
        topCauses.push({
          defectType: `${topCauses.length + 1}. Sırada Veri Yok`,
          productionUnit: '',
          totalCount: 0,
          severityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
          descriptions: ['Bu sırada hata bulunmuyor']
        });
      }
      top5Causes = topCauses;
    }

    console.log('🎯 Final TOP 5:', top5Causes.map(c => `${c.defectType}: ${c.totalCount}`));
    return top5Causes;
  }, [filteredData, JSON.stringify(filters)]);
  
  // KPI ve analiz fonksiyonlarını filtrelenmiş veri ile çalıştır
  const getFilteredQualityKPIs = () => {
    const records = filteredData;
    // Tekrarlama sayısını dahil ederek toplam hata sayısını hesapla
    const totalDefects = records.reduce((sum, record) => {
      if (!record.defects) return sum;
      return sum + record.defects.reduce((defectSum, defect) => defectSum + defect.repeatCount, 0);
    }, 0);
    
    // Hata olan araçlar
    const vehiclesWithDefects = records.filter(record => 
      record.defects && record.defects.length > 0
    );
    
    // ✅ YENİ: Filtrelenmiş dönemde toplam üretilen araç sayısını hesapla
    let totalVehiclesInFilteredPeriod = 0;
    
    if (filters.period === 'monthly' && filters.year && filters.month) {
      const filterMonth = `${filters.year}-${filters.month}`;
      totalVehiclesInFilteredPeriod = monthlyVehicles.filter(v => 
        v.productionMonth === filterMonth
      ).length;
    } else if (filters.period === 'quarterly' && filters.year && filters.quarter) {
      // Çeyreklik filtreleme
      let startMonth = 1, endMonth = 3;
      switch (filters.quarter) {
        case 'Q1': startMonth = 1; endMonth = 3; break;
        case 'Q2': startMonth = 4; endMonth = 6; break;
        case 'Q3': startMonth = 7; endMonth = 9; break;
        case 'Q4': startMonth = 10; endMonth = 12; break;
      }
      
      totalVehiclesInFilteredPeriod = monthlyVehicles.filter(v => {
        const vehicleYear = parseInt(v.productionMonth.split('-')[0]);
        const vehicleMonth = parseInt(v.productionMonth.split('-')[1]);
        return vehicleYear === parseInt(filters.year) && 
               vehicleMonth >= startMonth && vehicleMonth <= endMonth;
      }).length;
    } else {
      // Varsayılan: Mevcut ay
      const currentMonth = new Date().toISOString().slice(0, 7);
      totalVehiclesInFilteredPeriod = monthlyVehicles.filter(v => 
        v.productionMonth === currentMonth
      ).length;
    }
    
    // Eğer filtrelenmiş dönemde aylık veri yoksa hata kayıtlarını kullan
    const totalVehicles = totalVehiclesInFilteredPeriod > 0 ? totalVehiclesInFilteredPeriod : records.length;
    
    const avgDefectsPerVehicle = totalVehicles > 0 ? totalDefects / totalVehicles : 0;
    
    // İlk geçiş başarılı araçlar: Hiç hatası olmayan + tüm hataları ilk seferde olan
    const vehiclesWithoutDefectsCount = totalVehicles - vehiclesWithDefects.length;
    
    const firstTimeSuccessVehicles = vehiclesWithDefects.filter(record =>
      record.defects && record.defects.every(defect => defect.repeatCount <= 1)
    );
    
    const totalFirstTimePass = vehiclesWithoutDefectsCount + firstTimeSuccessVehicles.length;
    const firstTimePassRate = totalVehicles > 0 ? 
      (totalFirstTimePass / totalVehicles) * 100 : 100;
    
    const repeatedVehicles = vehiclesWithDefects.filter(record =>
      record.defects && record.defects.some(defect => defect.repeatCount > 1)
    );
    
    const repeatRate = totalVehicles > 0 ? (repeatedVehicles.length / totalVehicles) * 100 : 0;

    return {
      totalVehicles,
      totalDefects,
      avgDefectsPerVehicle: Math.round(avgDefectsPerVehicle * 100) / 100,
      firstTimePassRate: Math.round(firstTimePassRate * 100) / 100,
      repeatRate: Math.round(repeatRate * 100) / 100,
      criticalDefects: records.reduce((sum, record) => {
        if (!record.defects) return sum;
        return sum + record.defects
          .filter(defect => defect.severity === 'critical')
          .reduce((criticalSum, defect) => criticalSum + defect.repeatCount, 0);
      }, 0)
    };
  };

  const getFilteredProductionUnitPerformance = (): ProductionUnitPerformance[] => {
    const records = filteredData;
    
    // Önce tüm birimler için hesapla
    const allUnitsPerformance = productionUnits.map(unit => {
      // Bu birimde hata olan araçları bul
      const vehiclesWithUnitDefects = records.filter(record => 
        record.defects && record.defects.some(defect => defect.productionUnit === unit.value)
      );

      // Bu birimde toplam hata sayısı (tekrar sayısı dahil)
      const totalUnitDefectsWithRepeats = records.reduce((sum, record) => {
        if (!record.defects) return sum;
        return sum + record.defects
          .filter(defect => defect.productionUnit === unit.value)
          .reduce((defectSum, defect) => defectSum + defect.repeatCount, 0);
      }, 0);

      // İLK GEÇİŞ ORANI: TOPLAM ÜRETİLEN ARAÇLAR BAZ ALINIR (filtrelenmiş için)
      
      // 1. Filtrelenmiş dönemde toplam üretilen araç sayısı
      let totalProducedInFilteredPeriod = 0;
      
      // Filtreleme dönemine göre aylık araç sayısını hesapla
      if (filters.period === 'monthly' && filters.year && filters.month) {
        const filterMonth = `${filters.year}-${filters.month}`;
        totalProducedInFilteredPeriod = monthlyVehicles.filter(v => 
          v.productionMonth === filterMonth
        ).length;
      } else if (filters.period === 'quarterly' && filters.year && filters.quarter) {
        // Çeyreklik filtreleme
        let startMonth = 1, endMonth = 3;
        switch (filters.quarter) {
          case 'Q1': startMonth = 1; endMonth = 3; break;
          case 'Q2': startMonth = 4; endMonth = 6; break;
          case 'Q3': startMonth = 7; endMonth = 9; break;
          case 'Q4': startMonth = 10; endMonth = 12; break;
        }
        
        totalProducedInFilteredPeriod = monthlyVehicles.filter(v => {
          const vehicleYear = parseInt(v.productionMonth.split('-')[0]);
          const vehicleMonth = parseInt(v.productionMonth.split('-')[1]);
          return vehicleYear === parseInt(filters.year) && 
                 vehicleMonth >= startMonth && vehicleMonth <= endMonth;
        }).length;
      } else {
        // Varsayılan: Mevcut ay
        const currentMonth = new Date().toISOString().slice(0, 7);
        totalProducedInFilteredPeriod = monthlyVehicles.filter(v => 
          v.productionMonth === currentMonth
        ).length;
      }
      
      // 2. Bu birimde ilk seferde başarılı olan araçları bul
      const vehiclesPassedFirstTime = vehiclesWithUnitDefects.filter(record => {
        const unitDefectsForVehicle = record.defects ? record.defects.filter(defect => 
          defect.productionUnit === unit.value
        ) : [];
        // Bu birimde hata varsa hepsi ilk seferde (repeatCount <= 1) olmalı
        return unitDefectsForVehicle.every(defect => defect.repeatCount <= 1);
      });
      
      // ✅ YENİ: BASİT İLK GEÇİŞ ORANI HESABI (Filtrelenmiş)
      // İlk geçiş oranı = Hata kaydı olmayan araç sayısı / Toplam üretilen araç sayısı
      const vehiclesWithoutAnyDefects = totalProducedInFilteredPeriod - vehiclesWithUnitDefects.length;
      const firstTimePassRate = totalProducedInFilteredPeriod > 0 ? 
        (vehiclesWithoutAnyDefects / totalProducedInFilteredPeriod) * 100 : 100;
        
      // DEBUG: Filtrelenmiş ilk geçiş oranı hesaplama bilgisi
      console.log(`FILTERED ${unit.label} İlk Geçiş Oranı (BASİT):`, {
        totalProducedInFilteredPeriod,
        vehiclesWithDefects: vehiclesWithUnitDefects.length,
        vehiclesWithoutDefects: vehiclesWithoutAnyDefects,
        firstTimePassRate: firstTimePassRate.toFixed(1) + '%',
        calculation: `${vehiclesWithoutAnyDefects}/${totalProducedInFilteredPeriod} = ${firstTimePassRate.toFixed(1)}%`
      });

      // ✅ DÜZELTME: Araç başına ortalama hata sayısı (Filtrelenmiş dönem için)
      // Filtrelenmiş dönemde toplam üretilen araç sayısını hesapla
      let totalProducedInFilteredPeriod3 = 0;
      
      if (filters.period === 'monthly' && filters.year && filters.month) {
        const filterMonth = `${filters.year}-${filters.month}`;
        totalProducedInFilteredPeriod3 = monthlyVehicles.filter(v => 
          v.productionMonth === filterMonth
        ).length;
      } else if (filters.period === 'quarterly' && filters.year && filters.quarter) {
        // Çeyreklik filtreleme
        let startMonth = 1, endMonth = 3;
        switch (filters.quarter) {
          case 'Q1': startMonth = 1; endMonth = 3; break;
          case 'Q2': startMonth = 4; endMonth = 6; break;
          case 'Q3': startMonth = 7; endMonth = 9; break;
          case 'Q4': startMonth = 10; endMonth = 12; break;
        }
        
        totalProducedInFilteredPeriod3 = monthlyVehicles.filter(v => {
          const vehicleYear = parseInt(v.productionMonth.split('-')[0]);
          const vehicleMonth = parseInt(v.productionMonth.split('-')[1]);
          return vehicleYear === parseInt(filters.year) && 
                 vehicleMonth >= startMonth && vehicleMonth <= endMonth;
        }).length;
      } else {
        // Varsayılan: Mevcut ay
        const currentMonth = new Date().toISOString().slice(0, 7);
        totalProducedInFilteredPeriod3 = monthlyVehicles.filter(v => 
          v.productionMonth === currentMonth
        ).length;
      }
      
      // Eğer filtrelenmiş dönemde aylık veri yoksa tüm veriyi göster
      const totalVehicleCount3 = totalProducedInFilteredPeriod3 > 0 ? totalProducedInFilteredPeriod3 : monthlyVehicles.length;
      
      // Ortalama hata = toplam hata / toplam araç (hatalı olmayan araçlar da dahil)
      const avgDefectsPerVehicle = totalVehicleCount3 > 0 ? 
        totalUnitDefectsWithRepeats / totalVehicleCount3 : 0;

      // KALİTE SKORU HESAPLAMA - getProductionUnitPerformance ile TAMAMEN AYNI
      let qualityScore;
      
      if (vehiclesWithUnitDefects.length === 0) {
        // Hiç hata yoksa mükemmel skor
        qualityScore = 100;
      } else {
        // POKA-YOKE VE SIX SIGMA TABANLI HESAPLAMA
        
        // 1. Hata Yoğunluk Oranı (DPO - Defects Per Opportunity)
        const defectRate = (totalUnitDefectsWithRepeats / vehiclesWithUnitDefects.length);
        
        // 2. Six Sigma Sigma Seviyesi Hesabı (Basitleştirilmiş)
        let sigmaLevel;
        if (defectRate <= 0.5) sigmaLevel = 6;
        else if (defectRate <= 1.0) sigmaLevel = 5;
        else if (defectRate <= 2.0) sigmaLevel = 4;
        else if (defectRate <= 3.0) sigmaLevel = 3;
        else if (defectRate <= 4.0) sigmaLevel = 2;
        else sigmaLevel = 1;
        
        // 3. Sigma seviyesinden kalite skoruna dönüşüm
        const sigmaToQualityScore = {
          6: 100,  // Mükemmel
          5: 95,   // Çok İyi
          4: 85,   // İyi
          3: 70,   // Kabul Edilebilir
          2: 50,   // Gelişmeli
          1: 25    // Kritik
        };
        
        let baseScore = sigmaToQualityScore[sigmaLevel];
        
        // 4. İlk Geçiş Başarısı Bonus/Cezası
        const firstTimePassBonus = (firstTimePassRate - 70) * 0.3; // 70% altı ceza, üstü bonus
        
        // 5. Tekrar Hatası Cezası
        const repeatedVehiclesCount = vehiclesWithUnitDefects.length - vehiclesPassedFirstTime.length;
        const repeatPenalty = Math.min((repeatedVehiclesCount / vehiclesWithUnitDefects.length) * 30, 20);
        
        // FINAL SKOR
        qualityScore = Math.round(baseScore + firstTimePassBonus - repeatPenalty);
        
        // DEBUG BİLGİSİ (Filtrelenmiş veri)
        console.log(`FILTERED ${unit.label} Kalite Skoru:`, {
          vehiclesWithUnitDefects: vehiclesWithUnitDefects.length,
          totalUnitDefectsWithRepeats,
          defectRate: defectRate.toFixed(2),
          sigmaLevel,
          baseScore,
          firstTimePassRate: firstTimePassRate.toFixed(1),
          firstTimePassBonus: firstTimePassBonus.toFixed(1),
          repeatedVehicles: repeatedVehiclesCount,
          repeatPenalty: repeatPenalty.toFixed(1),
          finalScore: qualityScore
        });
        
        // Sınırlar
        qualityScore = Math.max(1, Math.min(100, qualityScore));
      }

      const repeatedVehiclesCount = vehiclesWithUnitDefects.length - vehiclesPassedFirstTime.length;

      // ✅ DÜZELTME: Toplam araç sayısını filtrelenmiş döneme göre aylık üretim verilerinden al
      // Filtrelenmiş dönemde toplam üretilen araç sayısını hesapla
      let totalProducedInFilteredPeriod4 = 0;
      
      if (filters.period === 'monthly' && filters.year && filters.month) {
        const filterMonth = `${filters.year}-${filters.month}`;
        totalProducedInFilteredPeriod4 = monthlyVehicles.filter(v => 
          v.productionMonth === filterMonth
        ).length;
      } else if (filters.period === 'quarterly' && filters.year && filters.quarter) {
        // Çeyreklik filtreleme
        let startMonth = 1, endMonth = 3;
        switch (filters.quarter) {
          case 'Q1': startMonth = 1; endMonth = 3; break;
          case 'Q2': startMonth = 4; endMonth = 6; break;
          case 'Q3': startMonth = 7; endMonth = 9; break;
          case 'Q4': startMonth = 10; endMonth = 12; break;
        }
        
        totalProducedInFilteredPeriod4 = monthlyVehicles.filter(v => {
          const vehicleYear = parseInt(v.productionMonth.split('-')[0]);
          const vehicleMonth = parseInt(v.productionMonth.split('-')[1]);
          return vehicleYear === parseInt(filters.year) && 
                 vehicleMonth >= startMonth && vehicleMonth <= endMonth;
        }).length;
      } else {
        // Varsayılan: Mevcut ay
        const currentMonth = new Date().toISOString().slice(0, 7);
        totalProducedInFilteredPeriod4 = monthlyVehicles.filter(v => 
          v.productionMonth === currentMonth
        ).length;
      }
      
      // Eğer filtrelenmiş dönemde aylık veri yoksa tüm veriyi göster
      const totalVehicleCount4 = totalProducedInFilteredPeriod4 > 0 ? totalProducedInFilteredPeriod4 : monthlyVehicles.length;

      return {
        unit: unit.value,
        unitName: unit.label,
        totalDefects: totalUnitDefectsWithRepeats,
        averageDefectsPerVehicle: Math.round(avgDefectsPerVehicle * 100) / 100,
        firstTimePassRate: Math.round(firstTimePassRate * 100) / 100,
        qualityScore: qualityScore,
        totalVehicles: totalVehicleCount4, // ✅ YENİ: Toplam üretim verisi
        repeatedVehicles: repeatedVehiclesCount,
        color: unit.color
      };
    });

    // Gerçek filtreleme: Seçili filtreler varsa sadece ilgili kartları göster
    if (filters.productionUnit) {
      // Sadece seçili birim
      return allUnitsPerformance.filter(unit => unit.unit === filters.productionUnit);
    }
    
    // Hiç filtre yoksa tüm birimleri göster
    return allUnitsPerformance;
  };

  const kpiMetrics = getFilteredQualityKPIs();
  const productionStats = getFilteredProductionUnitPerformance();

  // Aylık trend hesaplama fonksiyonu
  const calculateRealTrend = (unit: string) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Bu ayın verileri
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);
    
    // Geçen ayın verileri
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const previousMonthStart = new Date(previousYear, previousMonth, 1);
    const previousMonthEnd = new Date(previousYear, previousMonth + 1, 0);

    // Bu ayın verileri
    const currentMonthData = defectRecords.filter(record => {
      const recordDate = new Date(record.createdAt);
      return recordDate >= currentMonthStart && recordDate <= currentMonthEnd;
    });

    // Geçen ayın verileri
    const previousMonthData = defectRecords.filter(record => {
      const recordDate = new Date(record.createdAt);
      return recordDate >= previousMonthStart && recordDate <= previousMonthEnd;
    });

    // Bu birim için hata sayıları
    const currentMonthDefects = currentMonthData.reduce((acc, record) => {
      return acc + (record.defects?.filter(d => d.productionUnit === unit).reduce((sum, defect) => sum + defect.repeatCount, 0) || 0);
    }, 0);

    const previousMonthDefects = previousMonthData.reduce((acc, record) => {
      return acc + (record.defects?.filter(d => d.productionUnit === unit).reduce((sum, defect) => sum + defect.repeatCount, 0) || 0);
    }, 0);

    // Trend hesaplama
    if (previousMonthDefects === 0) {
      if (currentMonthDefects === 0) {
        return { 
          trend: 'stable', 
          value: 0,
          currentPeriod: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
          previousPeriod: `${previousYear}-${String(previousMonth + 1).padStart(2, '0')}`,
          currentValue: currentMonthDefects,
          previousValue: previousMonthDefects
        };
      } else {
        return { 
          trend: 'up', 
          value: 100,
          currentPeriod: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
          previousPeriod: `${previousYear}-${String(previousMonth + 1).padStart(2, '0')}`,
          currentValue: currentMonthDefects,
          previousValue: previousMonthDefects
        };
      }
    }

    const trendPercentage = Math.abs(((currentMonthDefects - previousMonthDefects) / previousMonthDefects) * 100);
    const trend = currentMonthDefects > previousMonthDefects ? 'up' : currentMonthDefects < previousMonthDefects ? 'down' : 'stable';

    return {
      trend,
      value: Math.round(trendPercentage * 10) / 10,
      currentPeriod: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
      previousPeriod: `${previousYear}-${String(previousMonth + 1).padStart(2, '0')}`,
      currentValue: currentMonthDefects,
      previousValue: previousMonthDefects
    };
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
            size="large"
            sx={{ height: 48 }}
          >
            Yeni Hata Kaydı
          </Button>
        </Box>

        {/* Global Filter Panel - KPI kartlarının üstüne taşındı */}
        <StyledAccordion expanded={filterExpanded} onChange={(e, expanded) => setFilterExpanded(expanded)}>
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
              {/* Dönem Filtresi */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Dönem</InputLabel>
                  <Select
                    value={filters.period}
                    label="Dönem"
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      period: e.target.value,
                      month: '',
                      quarter: '',
                      dateFrom: '',
                      dateTo: ''
                    }))}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {periodOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Yıl Filtresi */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Yıl</InputLabel>
                  <Select
                    value={filters.year}
                    label="Yıl"
                    onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                  >
                    {yearOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Ay Filtresi (Aylık seçildiğinde) */}
              {filters.period === 'monthly' && (
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Ay</InputLabel>
                    <Select
                      value={filters.month}
                      label="Ay"
                      onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                    >
                      <MenuItem value="">Tüm Aylar</MenuItem>
                      {monthOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Çeyrek Filtresi (Çeyreklik seçildiğinde) */}
              {filters.period === 'quarterly' && (
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Çeyrek</InputLabel>
                    <Select
                      value={filters.quarter}
                      label="Çeyrek"
                      onChange={(e) => setFilters(prev => ({ ...prev, quarter: e.target.value }))}
                    >
                      <MenuItem value="">Tüm Çeyrekler</MenuItem>
                      {quarterOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Özel Tarih Aralığı */}
              {filters.period === 'custom' && (
                <>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      label="Başlangıç Tarihi"
                      type="date"
                      size="small"
                      fullWidth
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      label="Bitiş Tarihi"
                      type="date"
                      size="small"
                      fullWidth
                      value={filters.dateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}

              {/* Birim Filtresi */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Birim</InputLabel>
                  <Select
                    value={filters.productionUnit}
                    label="Birim"
                    onChange={(e) => setFilters(prev => ({ ...prev, productionUnit: e.target.value }))}
                  >
                    <MenuItem value="">Tüm Birimler</MenuItem>
                    {productionUnits.map(unit => (
                      <MenuItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Araç Filtresi */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Araç Tipi</InputLabel>
                  <Select
                    value={filters.vehicleType}
                    label="Araç Tipi"
                    onChange={(e) => setFilters(prev => ({ ...prev, vehicleType: e.target.value }))}
                  >
                    <MenuItem value="">Tüm Araçlar</MenuItem>
                    {vehicleTypes.map(vehicle => (
                      <MenuItem key={vehicle.value} value={vehicle.value}>
                        {vehicle.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Durum Filtresi */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={filters.status}
                    label="Durum"
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="open">Açık</MenuItem>
                    <MenuItem value="in_progress">Devam Ediyor</MenuItem>
                    <MenuItem value="closed">Kapalı</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Arama Alanı */}
              <Grid item xs={12} sm={6} md={3}>
                <UltraIsolatedSearchInput
                  label="Arama"
                  placeholder="Seri no, hata türü..."
                  initialValue={filters.searchTerm}
                  onDebouncedChange={handleDebouncedSearchChange}
                  size="small"
                  fullWidth
                  clearTrigger={clearTrigger}
                />
              </Grid>

              {/* Temizle Butonu */}
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  size="medium"
                  fullWidth
                  onClick={() => {
                    console.log('🧹 Tüm filtreler temizleniyor...');
                    setFilters({
                      vehicleType: '',
                      productionUnit: '',
                      status: '',
                      dateFrom: '',
                      dateTo: '',
                      searchTerm: '',
                      period: '',
                      year: new Date().getFullYear().toString(),
                      month: '',
                      quarter: ''
                    });
                    // Arama kutusunu da temizlemek için trigger güncelle
                    setClearTrigger(prev => prev + 1);
                  }}
                  sx={{ height: 40 }}
                >
                  Filtreleri Temizle
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </StyledAccordion>



        {/* Tabs */}
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                      <Tab label="Executive Dashboard" icon={<AssessmentIcon />} />
            <Tab label="Birim Analizi" icon={<SearchIcon />} />
            <Tab label="Hata Listesi" icon={<AssessmentIcon />} />
                            <Tab label="Araç Üretim Adetleri" icon={<DirectionsCarIcon />} />
        </Tabs>

        {/* Tab Content */}
        {/* Executive Dashboard */}
        {activeTab === 0 && (
          <Box>

            {/* Modern KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)', 
                  color: 'white', 
                  height: 140,
                  cursor: 'pointer',
                  '&:hover': { 
                    transform: 'translateY(-4px) scale(1.02)', 
                    boxShadow: 8, 
                    transition: 'all 0.3s ease' 
                  }
                }}
                onClick={() => handleKPICardClick('total_vehicles')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Toplam İşlenen Araç</Typography>
                    <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
                      {(() => {
                        // ✅ DÜZELTME: TOPLAM araç sayısı - Filtreleme yapma, tüm aylık üretim verilerini say
                        const totalVehicles = monthlyVehicles.length;
                        
                        // ✅ DEBUG: Console'da detaylı bilgi göster
                        console.log('🚗 Dashboard Toplam Araç Hesaplama:', {
                          monthlyVehiclesTotal: monthlyVehicles.length,
                          defectRecordsLength: defectRecords.length,
                          finalResult: totalVehicles
                        });
                        
                        return totalVehicles;
                      })()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Hata olan araçlar dahil</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)', 
                  color: 'white', 
                  height: 140,
                  cursor: 'pointer',
                  '&:hover': { 
                    transform: 'translateY(-4px) scale(1.02)', 
                    boxShadow: 8, 
                    transition: 'all 0.3s ease' 
                  }
                }}
                onClick={() => handleKPICardClick('critical_defects')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Kritik Hatalar</Typography>
                    <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
                      {kpiMetrics.criticalDefects}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Detay analizi için tıklayın
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)', 
                  color: 'white', 
                  height: 140,
                  cursor: 'pointer',
                  '&:hover': { 
                    transform: 'translateY(-4px) scale(1.02)', 
                    boxShadow: 8, 
                    transition: 'all 0.3s ease' 
                  }
                }}
                onClick={() => handleKPICardClick('closed_defects')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Çözülen Hatalar</Typography>
                    <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
                      {filteredData.filter(r => r.status === 'closed').length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Çözüm analizi için tıklayın</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)', 
                  color: 'white', 
                  height: 140,
                  cursor: 'pointer',
                  '&:hover': { 
                    transform: 'translateY(-4px) scale(1.02)', 
                    boxShadow: 8, 
                    transition: 'all 0.3s ease' 
                  }
                }}
                onClick={() => handleKPICardClick('repeated_defects')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Tekrarlanan Hatalar</Typography>
                    <Typography variant="h2" fontWeight="bold" sx={{ mb: 1 }}>
                      {(() => {
                        // ✅ DÜZELTME: Tekrarlanan hata sayısı (repeatCount > 1) - Debug ile
                        console.log('🔄 Tekrarlanan hatalar hesaplanıyor:', {
                          filteredDataLength: filteredData.length,
                          totalDefects: filteredData.flatMap(r => r.defects || []).length,
                          samplerRecord: filteredData.slice(0, 1)
                        });
                        
                        const repeatedDefectsCount = filteredData.reduce((sum, record) => {
                          if (!record.defects) return sum;
                          const recordRepeatedDefects = record.defects.filter(defect => defect.repeatCount > 1);
                          console.log(`📊 ${record.serialNumber}: ${recordRepeatedDefects.length} tekrarlanan hata`, recordRepeatedDefects);
                          return sum + recordRepeatedDefects.length;
                        }, 0);
                        
                        console.log('✅ Toplam tekrarlanan hata sayısı:', repeatedDefectsCount);
                        return repeatedDefectsCount;
                      })()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Birden fazla kez oluşan</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>



            {/* Enhanced Performance Dashboard */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ 
                  mb: 3, 
                  pb: 2, 
                  borderBottom: '2px solid #e0e0e0',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
                }}>
                  <Typography variant="h5" fontWeight="600" color="primary.main" sx={{ mb: 1 }}>
                    Departman Performans Analizi
                  </Typography>
                </Box>
              </Grid>

              {/* Enhanced Performance Cards - Dinamik Sıralama (En Çok Hata → En Az Hata) */}
              {getFilteredProductionUnitPerformance()
                .sort((a, b) => {
                  // Önce toplam hata sayısına göre sırala (azalan)
                  if (b.totalDefects !== a.totalDefects) {
                    return b.totalDefects - a.totalDefects;
                  }
                  // Hata sayısı aynıysa kalite skoruna göre sırala (artan - en düşük skor en üstte)
                  return a.qualityScore - b.qualityScore;
                })
                .map((stat, sortedIndex) => {
                // ✅ DÜZELTME: Kullanıcının seçtiği filtreye göre araç sayısını hesapla
                let filteredMonthlyVehicles = [];
                
                if (filters.period === 'monthly' && filters.year && filters.month) {
                  const filterMonth = `${filters.year}-${filters.month}`;
                  filteredMonthlyVehicles = monthlyVehicles.filter(v => 
                    v.productionMonth === filterMonth
                  );
                } else if (filters.period === 'quarterly' && filters.year && filters.quarter) {
                  // Çeyreklik filtreleme
                  let startMonth = 1, endMonth = 3;
                  switch (filters.quarter) {
                    case 'Q1': startMonth = 1; endMonth = 3; break;
                    case 'Q2': startMonth = 4; endMonth = 6; break;
                    case 'Q3': startMonth = 7; endMonth = 9; break;
                    case 'Q4': startMonth = 10; endMonth = 12; break;
                  }
                  
                  filteredMonthlyVehicles = monthlyVehicles.filter(v => {
                    const vehicleYear = parseInt(v.productionMonth.split('-')[0]);
                    const vehicleMonth = parseInt(v.productionMonth.split('-')[1]);
                    return vehicleYear === parseInt(filters.year) && 
                           vehicleMonth >= startMonth && vehicleMonth <= endMonth;
                  });
                } else if (filters.period === 'custom' && filters.dateFrom && filters.dateTo) {
                  // Özel tarih aralığı
                  filteredMonthlyVehicles = monthlyVehicles.filter(v => {
                    if (!v.productionDate) return false; // ✅ KONTROL: Tarih yoksa dahil etme
                    const vehicleDate = new Date(v.productionDate);
                    if (isNaN(vehicleDate.getTime())) return false; // ✅ KONTROL: Geçersiz tarih kontrolü
                    const fromDate = new Date(filters.dateFrom);
                    const toDate = new Date(filters.dateTo);
                    return vehicleDate >= fromDate && vehicleDate <= toDate;
                  });
                } else {
                  // Filtre seçilmemişse TÜM araçları kullan
                  filteredMonthlyVehicles = monthlyVehicles;
                }
                
                const currentMonthProduced = filteredMonthlyVehicles.length;
                
                const affectedVehicles = currentMonthProduced; // TÜM araçlar etkilenen
                
                // Bu birimde HATA GİRİLEN araç sayısı
                const defectiveVehicleCount = filteredData.filter(r => 
                  r.defects && r.defects.some(d => d.productionUnit === stat.unit)
                ).length;
                
                // BAŞARILI ARAÇ = Toplam araç - Hata girilen araç
                const successfulVehicles = currentMonthProduced - defectiveVehicleCount;
                
                // İLK GEÇİŞ ORANI = Başarılı araç / Toplam araç * 100
                const firstPassRate = currentMonthProduced > 0 ? 
                  (successfulVehicles / currentMonthProduced) * 100 : 100;
                
                // ✅ DEBUG: Filtrelenmiş hesaplama detayları
                console.log(`🎯 ${stat.unit} - Filtrelenmiş Hesaplama:`, {
                  filterPeriod: filters.period,
                  filterYear: filters.year,
                  filterMonth: filters.month,
                  filterQuarter: filters.quarter,
                  totalMonthlyVehicles: monthlyVehicles.length,
                  filteredVehicleCount: currentMonthProduced,
                  affectedVehicles: affectedVehicles,
                  defectiveVehicleCount: defectiveVehicleCount,
                  successfulVehicles: successfulVehicles,
                  firstPassRate: firstPassRate.toFixed(1) + '%'
                });
                
                const criticalDefects = filteredData.filter(r => 
                  r.defects && r.defects.some(d => d.productionUnit === stat.unit && d.severity === 'critical')
                ).length;

                // Gerçek trend hesaplama
                const trendData = calculateRealTrend(stat.unit);
                const recentTrend = trendData.trend;
                const trendValue = trendData.value;

                return (
                  <Grid item xs={12} md={6} lg={4} key={stat.unit}>
                    <Card sx={{ 
                      height: '100%',
                      background: '#ffffff',
                      border: `3px solid ${
                        firstPassRate >= 90 ? '#4caf50' :
                        firstPassRate >= 75 ? '#2196f3' :
                        firstPassRate >= 50 ? '#ff9800' : '#f44336'
                      }`,
                      borderRadius: 4,
                      cursor: 'pointer',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      '&:hover': { 
                        transform: 'translateY(-8px)', 
                        boxShadow: '0 16px 48px rgba(0,0,0,0.24)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: `3px solid ${
                          firstPassRate >= 90 ? '#388e3c' :
                          firstPassRate >= 75 ? '#1976d2' :
                          firstPassRate >= 50 ? '#f57c00' : '#d32f2f'
                        }`
                      }
                    }}
                    onClick={() => handleUnitCardClick(stat.unit, stat)}
                    >
                      {/* Modern Header Bar */}
                      <Box sx={{
                        height: 6,
                        background: `linear-gradient(90deg, ${
                          firstPassRate >= 90 ? '#4caf50' :
                          firstPassRate >= 75 ? '#2196f3' :
                          firstPassRate >= 50 ? '#ff9800' : '#f44336'
                        } 0%, ${
                          firstPassRate >= 90 ? '#66bb6a' :
                          firstPassRate >= 75 ? '#42a5f5' :
                          firstPassRate >= 50 ? '#ffb74d' : '#ef5350'
                        } 100%)`,
                      }} />
                      
                      <CardContent sx={{ p: 3 }}>
                        {/* Modern Department Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                          <Box>
                            <Typography variant="h5" fontWeight="700" color="text.primary" sx={{ mb: 0.5 }}>
                              {stat.unitName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Üretim Birimi
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            background: `linear-gradient(135deg, ${
                              firstPassRate >= 90 ? '#4caf50' :
                              firstPassRate >= 75 ? '#2196f3' :
                              firstPassRate >= 50 ? '#ff9800' : '#f44336'
                            } 0%, ${
                              firstPassRate >= 90 ? '#66bb6a' :
                              firstPassRate >= 75 ? '#42a5f5' :
                              firstPassRate >= 50 ? '#ffb74d' : '#ef5350'
                            } 100%)`,
                            borderRadius: 3, 
                            px: 2, 
                            py: 1,
                            color: 'white',
                            boxShadow: 2
                          }}>
                            <Typography variant="body2" fontWeight="bold">
                              #{sortedIndex + 1}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Performance Status Badge */}
                        <Box sx={{ mb: 3 }}>
                          <Chip 
                            label={
                              stat.totalVehicles === 0 ? 'Veri Yok' :
                              stat.repeatedVehicles === 0 ? 'Mükemmel' :
                              stat.repeatedVehicles <= 1 ? 'İyi' : 'Gelişmeli'
                            }
                            color={
                              stat.totalVehicles === 0 ? 'default' :
                              stat.repeatedVehicles === 0 ? 'success' :
                              stat.repeatedVehicles <= 1 ? 'warning' : 'error'
                            }
                            size="small"
                          />
                        </Box>

                        {/* Key Metrics */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#f0f7ff', borderRadius: 1 }}>
                              <Typography variant="h4" fontWeight="bold" color="primary">
                                {stat.totalDefects}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Toplam Hata
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                              <Typography variant="h4" fontWeight="bold" color="warning.main">
                                {affectedVehicles}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Etkilenen Araç
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Performance Indicators - Basit ve Anlaşılır */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Tekrarlanan Hatalar</Typography>
                            <Typography variant="body2" fontWeight="bold" color="error.main">
                              {stat.repeatedVehicles} araç
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            width: '100%', 
                            height: 8, 
                            backgroundColor: '#e0e0e0', 
                            borderRadius: 4,
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: `${stat.totalVehicles > 0 ? (stat.repeatedVehicles / stat.totalVehicles) * 100 : 0}%`, 
                              height: '100%', 
                              background: 'linear-gradient(90deg, #f44336 0%, #ef5350 100%)',
                              transition: 'width 0.5s ease'
                            }} />
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Ortalama Hata/Araç</Typography>
                            <Typography variant="body2" fontWeight="bold" color="warning.main">
                              {stat.averageDefectsPerVehicle.toFixed(1)}
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            width: '100%', 
                            height: 8, 
                            backgroundColor: '#e0e0e0', 
                            borderRadius: 4,
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: `${Math.min((stat.averageDefectsPerVehicle / 5) * 100, 100)}%`, 
                              height: '100%', 
                              background: 'linear-gradient(90deg, #ff9800 0%, #ffc107 100%)',
                              transition: 'width 0.5s ease'
                            }} />
                          </Box>
                        </Box>

                        {/* Additional Details */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderTop: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" color="text.secondary">
                            Kritik Hata: {criticalDefects}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Başarılı Araç: {successfulVehicles}
                          </Typography>
                        </Box>

                        {/* Aylık Trend Indicator - Profesyonel */}
                        <Box sx={{ 
                          mt: 2,
                          p: 2,
                          backgroundColor: 
                            recentTrend === 'up' ? '#ffebee' : 
                            recentTrend === 'down' ? '#e8f5e8' : '#f5f5f5',
                          borderRadius: 2,
                          border: `2px solid ${
                            recentTrend === 'up' ? '#f44336' : 
                            recentTrend === 'down' ? '#4caf50' : '#9e9e9e'
                          }`
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="600">
                              AYLIK TREND ANALİZİ
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color={
                              recentTrend === 'up' ? 'error.main' : 
                              recentTrend === 'down' ? 'success.main' : 'text.secondary'
                            }>
                              {recentTrend === 'up' ? '↗ ARTIŞ' : recentTrend === 'down' ? '↘ AZALIŞ' : '→ STABİL'}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {trendData.previousPeriod} → {trendData.currentPeriod}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {trendData.previousValue} → {trendData.currentValue} hata
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold" color={
                              recentTrend === 'up' ? 'error.main' : 
                              recentTrend === 'down' ? 'success.main' : 'text.secondary'
                            }>
                              {trendValue > 0 ? `%${trendValue}` : '0%'}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Analizi Tab - Profesyonel Pareto Analizi */}
        {activeTab === 1 && (
          <Box>
            {/* Üretim Birimi Performans Kartları */}
            <Typography variant="h6" gutterBottom>Üretim Birimi Performans Analizi</Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {getFilteredProductionUnitPerformance()
                .sort((a, b) => {
                  // Önce toplam hata sayısına göre sırala (azalan)
                  if (b.totalDefects !== a.totalDefects) {
                    return b.totalDefects - a.totalDefects;
                  }
                  // Hata sayısı aynıysa kalite skoruna göre sırala (artan - en düşük skor en üstte)
                  return a.qualityScore - b.qualityScore;
                })
                .map((stat, index) => {
                  // Gerçek trend hesaplama
                  const trendData = calculateRealTrend(stat.unit);
                  const recentTrend = trendData.trend;
                  const trendValue = trendData.value;

                  return (
                    <Grid item xs={12} sm={6} md={3} key={stat.unit}>
                      <Card sx={{ 
                        height: '100%',
                        '&:hover': { 
                          transform: 'translateY(-2px)', 
                          boxShadow: 4, 
                          transition: 'all 0.3s ease'
                        }
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            {productionUnits.find(unit => unit.value === stat.unit)?.icon}
                            <Typography variant="h6" sx={{ ml: 1 }}>{stat.unitName}</Typography>
                            <Chip 
                              label={`#${index + 1}`}
                              size="small"
                              variant="outlined"
                              color={index === 0 ? 'error' : index === 1 ? 'warning' : 'default'}
                              sx={{ ml: 'auto', fontSize: '0.7rem', height: 20 }}
                            />
                          </Box>
                          
                          {(() => {
                            // Kart için filtrelenmiş hesaplamalar
                            let cardFilteredMonthlyVehicles = [];
                            
                            if (filters.period === 'monthly' && filters.year && filters.month) {
                              const filterMonth = `${filters.year}-${filters.month}`;
                              cardFilteredMonthlyVehicles = monthlyVehicles.filter(v => 
                                v.productionMonth === filterMonth
                              );
                            } else if (filters.period === 'quarterly' && filters.year && filters.quarter) {
                              // Çeyreklik filtreleme
                              let startMonth = 1, endMonth = 3;
                              switch (filters.quarter) {
                                case 'Q1': startMonth = 1; endMonth = 3; break;
                                case 'Q2': startMonth = 4; endMonth = 6; break;
                                case 'Q3': startMonth = 7; endMonth = 9; break;
                                case 'Q4': startMonth = 10; endMonth = 12; break;
                              }
                              
                              cardFilteredMonthlyVehicles = monthlyVehicles.filter(v => {
                                const vehicleYear = parseInt(v.productionMonth.split('-')[0]);
                                const vehicleMonth = parseInt(v.productionMonth.split('-')[1]);
                                return vehicleYear === parseInt(filters.year) && 
                                       vehicleMonth >= startMonth && vehicleMonth <= endMonth;
                              });
                            } else if (filters.period === 'custom' && filters.dateFrom && filters.dateTo) {
                              // Özel tarih aralığı
                              cardFilteredMonthlyVehicles = monthlyVehicles.filter(v => {
                                if (!v.productionDate) return false; // ✅ KONTROL: Tarih yoksa dahil etme
                                const vehicleDate = new Date(v.productionDate);
                                if (isNaN(vehicleDate.getTime())) return false; // ✅ KONTROL: Geçersiz tarih kontrolü
                                const fromDate = new Date(filters.dateFrom);
                                const toDate = new Date(filters.dateTo);
                                return vehicleDate >= fromDate && vehicleDate <= toDate;
                              });
                            } else {
                              // Filtre seçilmemişse TÜM araçları kullan
                              cardFilteredMonthlyVehicles = monthlyVehicles;
                            }
                            
                            const cardCurrentMonthProduced = cardFilteredMonthlyVehicles.length;
                            const cardAffectedVehicles = cardCurrentMonthProduced;
                            const cardDefectiveCount = filteredData.filter(r => 
                              r.defects && r.defects.some(d => d.productionUnit === stat.unit)
                            ).length;
                            const cardSuccessfulVehicles = cardAffectedVehicles - cardDefectiveCount;
                            const cardFirstPassRate = cardAffectedVehicles > 0 ? 
                              (cardSuccessfulVehicles / cardAffectedVehicles * 100) : 100;

                            return (
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">Toplam Hata</Typography>
                                  <Typography variant="h5" color="error.main">{stat.totalDefects}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">Etkilenen Araç</Typography>
                                  <Typography variant="h5">{cardAffectedVehicles}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">Başarılı Araç</Typography>
                                  <Typography variant="h5" color="success.main">{cardSuccessfulVehicles}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">İlk Geçiş Oranı</Typography>
                                  <Typography variant="h5" color="success.main">%{cardFirstPassRate.toFixed(1)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">Kalite Puanı</Typography>
                                  <Typography variant="h5" color={stat.qualityScore === 0 ? "text.secondary" : "success.main"}>
                                    {stat.qualityScore === 0 ? "Veri Yok" : stat.qualityScore}
                                  </Typography>
                                </Grid>
                              </Grid>
                            );
                          })()}

                          {/* Aylık Trend Indicator - Kompakt */}
                          <Box sx={{ 
                            mt: 2,
                            p: 1.5,
                            backgroundColor: 
                              recentTrend === 'up' ? '#ffebee' : 
                              recentTrend === 'down' ? '#e8f5e8' : '#f5f5f5',
                            borderRadius: 2,
                            borderLeft: `4px solid ${
                              recentTrend === 'up' ? '#f44336' : 
                              recentTrend === 'down' ? '#4caf50' : '#9e9e9e'
                            }`
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary" fontWeight="600">
                                AYLIK TREND
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color={
                                recentTrend === 'up' ? 'error.main' : 
                                recentTrend === 'down' ? 'success.main' : 'text.secondary'
                              }>
                                {recentTrend === 'up' ? '↗' : recentTrend === 'down' ? '↘' : '→'} 
                                {trendValue > 0 ? `%${trendValue}` : '0%'}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {trendData.previousPeriod} → {trendData.currentPeriod}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
            </Grid>

            {/* Pareto Analizi Bölümü */}
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600, mt: 4 }}>
              Pareto Analizi - Öncelik Sıralaması
            </Typography>
            
            {(() => {
              const performanceStats = getFilteredProductionUnitPerformance();
              const totalDefects = performanceStats.reduce((sum, stat) => sum + stat.totalDefects, 0);
              
              // Pareto analizi için veriyi filtrele (sıfır olmayan), sırala ve kümülatif yüzdeleri hesapla
              const nonZeroStats = performanceStats.filter(stat => stat.totalDefects > 0);
              
              console.log('Performance Stats:', performanceStats.map(s => ({ unit: s.unitName, defects: s.totalDefects })));
              console.log('Non-Zero Stats:', nonZeroStats.map(s => ({ unit: s.unitName, defects: s.totalDefects })));
              console.log('Total Defects:', totalDefects);
              
              const paretoData = nonZeroStats
                .sort((a, b) => b.totalDefects - a.totalDefects)
                .map((stat, index, sortedArray) => {
                  const cumulativeDefects = sortedArray.slice(0, index + 1).reduce((sum, s) => sum + s.totalDefects, 0);
                  const cumulativePercentage = totalDefects > 0 ? (cumulativeDefects / totalDefects) * 100 : 0;
                  const individualPercentage = totalDefects > 0 ? (stat.totalDefects / totalDefects) * 100 : 0;
                  
                  console.log(`${stat.unitName}: Defects=${stat.totalDefects}, Individual%=${individualPercentage.toFixed(1)}, Cumulative%=${cumulativePercentage.toFixed(1)}`);
                  
                  return {
                    ...stat,
                    individualPercentage: Math.round(individualPercentage * 10) / 10,
                    cumulativePercentage: Math.round(cumulativePercentage * 10) / 10,
                    isCritical: cumulativePercentage <= 80,
                    rank: index + 1
                  };
                });

              // Veri yoksa placeholder veriler kullan
              const finalParetoData = paretoData.length > 0 ? paretoData : 
                performanceStats.slice(0, 5).map((stat, index) => ({
                  ...stat,
                  individualPercentage: 0,
                  cumulativePercentage: 0,
                  isCritical: false,
                  rank: index + 1
                }));

              const criticalUnits = finalParetoData.filter(unit => unit.cumulativePercentage <= 80);
              const vitalFew = criticalUnits.length;

              return (
                <>
                  {/* Özet Kartları */}
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" color="primary" fontWeight="bold">
                            {vitalFew}
                          </Typography>
                          <Typography variant="h6" gutterBottom>
                            Kritik Birim
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Problemlerin %80'inin kaynağı
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" color="error" fontWeight="bold">
                            {totalDefects}
                          </Typography>
                          <Typography variant="h6" gutterBottom>
                            Toplam Hata
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tüm üretim birimlerinde
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h3" color="warning.main" fontWeight="bold">
                            %{Math.round((criticalUnits.reduce((sum, unit) => sum + unit.totalDefects, 0) / totalDefects) * 100)}
                          </Typography>
                          <Typography variant="h6" gutterBottom>
                            Kritik Oran
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Pareto prensibi (80/20)
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Alt Alta Düzenli Pareto Analizi */}
                  <Box sx={{ 
                    bgcolor: '#f5f5f5', 
                    p: 4, 
                    borderRadius: 3,
                    border: '2px solid #e0e0e0'
                  }}>
                    
                    {/* 1. Pareto Grafiği - Tam Genişlik */}
                    <Box sx={{ 
                      bgcolor: 'white', 
                      borderRadius: 3,
                      border: '2px solid #ddd',
                      mb: 4,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      {/* Header */}
                      <Box sx={{ 
                        bgcolor: '#3f51b5', 
                        color: 'white', 
                        p: 3, 
                        borderRadius: '10px 10px 0 0',
                        textAlign: 'center'
                      }}>
                        <Typography variant="h5" fontWeight="bold">
                          PARETO GRAFİĞİ
                        </Typography>
                      </Box>
                      
                      {/* Grafik Alanı - Düzgün Pareto Analizi */}
                      <Box sx={{ width: '100%', height: '700px', p: 3 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart 
                            data={finalParetoData} 
                            margin={{ top: 40, right: 100, left: 60, bottom: 120 }}
                          >
                            {/* Grid Lines */}
                            <CartesianGrid 
                              strokeDasharray="3 3" 
                              stroke="#e0e0e0" 
                              opacity={0.6}
                            />
                            
                            {/* X Axis - Birim Adları */}
                            <XAxis 
                              dataKey="unitName" 
                              angle={-45} 
                              textAnchor="end" 
                              height={120}
                              fontSize={13}
                              fontWeight="600"
                              interval={0}
                              tick={{ fill: '#333', fontWeight: 'bold' }}
                            />
                            
                            {/* Sol Y Ekseni - Problem Sayısı */}
                            <YAxis 
                              yAxisId="left" 
                              domain={[0, 'dataMax + 2']}
                              tickFormatter={(value) => value.toString()}
                              fontSize={13}
                              fontWeight="600"
                              label={{ 
                                value: 'Problem Sayısı', 
                                angle: -90, 
                                position: 'insideLeft', 
                                style: { 
                                  textAnchor: 'middle', 
                                  fontSize: '14px', 
                                  fontWeight: 'bold',
                                  fill: '#1976d2'
                                } 
                              }}
                              tick={{ fill: '#1976d2', fontWeight: 'bold' }}
                              axisLine={{ stroke: '#1976d2', strokeWidth: 2 }}
                              tickLine={{ stroke: '#1976d2' }}
                            />
                            
                            {/* Sağ Y Ekseni - Kümülatif Yüzde */}
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              domain={[0, 100]}
                              tickFormatter={(value) => `${value}%`}
                              fontSize={13}
                              fontWeight="600"
                              label={{ 
                                value: 'Kümülatif Yüzde (%)', 
                                angle: 90, 
                                position: 'insideRight', 
                                style: { 
                                  textAnchor: 'middle', 
                                  fontSize: '14px', 
                                  fontWeight: 'bold',
                                  fill: '#d32f2f'
                                } 
                              }}
                              tick={{ fill: '#d32f2f', fontWeight: 'bold' }}
                              axisLine={{ stroke: '#d32f2f', strokeWidth: 2 }}
                              tickLine={{ stroke: '#d32f2f' }}
                            />
                            
                            {/* Tooltip */}
                            <RechartsTooltip 
                              formatter={(value, name) => {
                                const numValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
                                if (name === 'Problem Sayısı') return [`${numValue} adet`, name];
                                if (name === 'Kümülatif %') return [`${numValue.toFixed(1)}%`, name];
                                return [value, name];
                              }}
                              contentStyle={{ 
                                backgroundColor: '#fff', 
                                border: '2px solid #1976d2',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                padding: '12px',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                              }}
                              labelStyle={{ 
                                fontWeight: 'bold', 
                                color: '#333',
                                marginBottom: '4px'
                              }}
                            />
                            
                            {/* Legend */}
                            <Legend 
                              wrapperStyle={{ 
                                paddingTop: '20px',
                                fontSize: '13px',
                                fontWeight: 'bold'
                              }}
                              iconType="rect"
                            />
                            
                            {/* Problem Sayısı - Bar Chart */}
                            <Bar 
                              yAxisId="left" 
                              dataKey="totalDefects" 
                              fill="#1976d2" 
                              name="Problem Sayısı"
                              stroke="#0d47a1"
                              strokeWidth={1}
                              radius={[4, 4, 0, 0]}
                              opacity={0.8}
                            />
                            
                            {/* Kümülatif Yüzde - Line Chart */}
                            <Line 
                              yAxisId="right" 
                              type="monotone" 
                              dataKey="cumulativePercentage" 
                              stroke="#d32f2f" 
                              strokeWidth={3}
                              name="Kümülatif %"
                              dot={{ 
                                fill: '#d32f2f', 
                                stroke: '#fff',
                                strokeWidth: 2, 
                                r: 6 
                              }}
                              activeDot={{ 
                                r: 8, 
                                fill: '#d32f2f',
                                stroke: '#fff',
                                strokeWidth: 2
                              }}
                              connectNulls={false}
                            />
                            
                            {/* 80% Pareto Referans Çizgisi */}
                            <ReferenceLine 
                              yAxisId="right" 
                              y={80}
                              stroke="#ff9800" 
                              strokeWidth={2}
                              strokeDasharray="8 4"
                              label={{ 
                                value: "80% Pareto Sınırı", 
                                position: "top",
                                style: {
                                  fill: '#ff9800',
                                  fontWeight: 'bold',
                                  fontSize: '12px'
                                }
                              }}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </Box>
                    </Box>

                    {/* 2. Sorumlu Kişiye Göre İlk 5 Sebep */}
                    <Box sx={{ 
                      bgcolor: 'white', 
                      borderRadius: 3,
                      border: '2px solid #ddd',
                      mb: 4,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      {/* Header */}
                      <Box sx={{ 
                        bgcolor: '#3f51b5', 
                        color: 'white', 
                        p: 3, 
                        borderRadius: '10px 10px 0 0',
                        textAlign: 'center'
                      }}>
                        <Typography variant="h5" fontWeight="bold">
                          Sorumlu Birime Göre İlk 5 Sebep
                        </Typography>
                      </Box>
                      
                      {/* Content */}
                      <Box sx={{ p: 4 }}>
                        <Grid container spacing={4} alignItems="center">
                          <Grid item xs={12} md={6}>
                            <Box sx={{ width: '100%', height: '300px' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={paretoData.slice(0, 5).map((unit, index) => ({
                                      name: unit.unitName,
                                      value: unit.totalDefects,
                                      fill: ['#3f51b5', '#7986cb', '#9fa8da', '#c5cae9', '#e8eaf6'][index]
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    dataKey="value"
                                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                                    labelLine={true}
                                  >
                                    {paretoData.slice(0, 5).map((_, index) => (
                                      <Cell key={`cell-${index}`} fill={['#3f51b5', '#7986cb', '#9fa8da', '#c5cae9', '#e8eaf6'][index]} />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
                                Detaylı Dağılım
                              </Typography>
                              {finalParetoData.slice(0, 5).map((unit, index) => (
                                <Box key={unit.unit} sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  p: 2,
                                  bgcolor: '#f8f9fa',
                                  borderRadius: 2,
                                  border: `2px solid ${['#3f51b5', '#7986cb', '#9fa8da', '#c5cae9', '#e8eaf6'][index]}`
                                }}>
                                  <Box sx={{ 
                                    width: 20, 
                                    height: 20, 
                                    bgcolor: ['#3f51b5', '#7986cb', '#9fa8da', '#c5cae9', '#e8eaf6'][index], 
                                    borderRadius: 1,
                                    mr: 2
                                  }} />
                                  <Typography variant="body1" fontWeight="600" sx={{ flex: 1 }}>
                                    {unit.unitName}
                                  </Typography>
                                  <Typography variant="h6" fontWeight="bold" sx={{ 
                                    color: ['#3f51b5', '#7986cb', '#9fa8da', '#c5cae9', '#e8eaf6'][index]
                                  }}>
                                    {unit.totalDefects}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>

                    {/* 3. Sebepler Top 3 */}
                    <Box sx={{ 
                      bgcolor: 'white', 
                      borderRadius: 3,
                      border: '2px solid #ddd',
                      mb: 4,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      {/* Header */}
                      <Box sx={{ 
                        bgcolor: '#3f51b5', 
                        color: 'white', 
                        p: 3, 
                        borderRadius: '10px 10px 0 0',
                        textAlign: 'center'
                      }}>
                        <Typography variant="h5" fontWeight="bold">
                          Sebepler - Top 5
                        </Typography>
                      </Box>
                      
                      {/* Content */}
                      <Box sx={{ p: 4 }}>
                        <Grid container spacing={3}>
                          {(() => {
                            const colors = ['#3f51b5', '#9c27b0', '#ff9800', '#4caf50', '#f44336'];
                            const bgColors = ['#e3f2fd', '#f3e5f5', '#fff3e0', '#e8f5e8', '#ffebee'];

                            return memoizedTop5Causes.map((cause: any, index) => (
                              <Grid item xs={12} md={6} lg={4} key={cause.defectType}>
                                <Box sx={{ 
                                  p: 3,
                                  bgcolor: bgColors[index],
                                  borderRadius: 3,
                                  border: `3px solid ${colors[index]}`,
                                  position: 'relative',
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column'
                                }}>
                                  {/* Ranking Badge */}
                                  <Box sx={{
                                    position: 'absolute',
                                    top: -15,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    bgcolor: colors[index],
                                    color: 'white',
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px',
                                    fontWeight: 'bold'
                                  }}>
                                    {index + 1}
                                  </Box>
                                  
                                  {/* Ana Sebep */}
                                  <Typography variant="h6" fontWeight="bold" sx={{ 
                                    mt: 2,
                                    mb: 1,
                                    color: colors[index],
                                    textAlign: 'center',
                                    minHeight: '48px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    {cause.defectType}
                                  </Typography>

                                  {/* Birim */}
                                  <Typography variant="body2" sx={{ 
                                    textAlign: 'center',
                                    color: 'text.secondary',
                                    mb: 2,
                                    fontWeight: 600
                                  }}>
                                    {cause.productionUnit ? getProductionUnitLabel(cause.productionUnit) : 'Birim Belirtilmemiş'}
                                  </Typography>
                                  
                                  {/* Toplam Sayı */}
                                  <Typography variant="h3" fontWeight="bold" sx={{ 
                                    color: colors[index],
                                    mb: 1,
                                    textAlign: 'center'
                                  }}>
                                    {cause.totalCount}
                                  </Typography>
                                  
                                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                                    Toplam Olay
                                  </Typography>

                                  {/* Alt Kırılım */}
                                  <Box sx={{ flex: 1, mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: colors[index] }}>
                                      Alt Detaylar:
                                    </Typography>
                                    {cause.descriptions.slice(0, 3).map((desc: string, idx: number) => (
                                      <Typography key={idx} variant="caption" sx={{ 
                                        display: 'block',
                                        mb: 0.5,
                                        fontSize: '0.7rem',
                                        color: 'text.secondary'
                                      }}>
                                        • {desc.slice(0, 35)}{desc.length > 35 ? '...' : ''}
                                      </Typography>
                                    ))}
                                  </Box>

                                  {/* Kritiklik Dağılımı */}
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                      Kritiklik: 
                                      {cause.totalCount === 0 ? ' Veri Yok' : 
                                        (cause.severityBreakdown.critical > 0 ? ` Kritik: ${cause.severityBreakdown.critical}` : '') +
                                        (cause.severityBreakdown.high > 0 ? ` Yüksek: ${cause.severityBreakdown.high}` : '') +
                                        (cause.severityBreakdown.medium > 0 ? ` Orta: ${cause.severityBreakdown.medium}` : '') +
                                        (cause.severityBreakdown.low > 0 ? ` Düşük: ${cause.severityBreakdown.low}` : '') ||
                                        ' Veri Yok'
                                      }
                                    </Typography>
                                  </Box>
                                  
                                  {/* Progress Bar */}
                                  <Box>
                                    <Box sx={{ 
                                      width: '100%', 
                                      height: 8, 
                                      bgcolor: '#e0e0e0', 
                                      borderRadius: 1,
                                      overflow: 'hidden'
                                    }}>
                                      <Box sx={{ 
                                        width: `${(cause.totalCount / (memoizedTop5Causes[0]?.totalCount || 1)) * 100}%`, 
                                        height: '100%', 
                                        bgcolor: colors[index],
                                        borderRadius: 1
                                      }} />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                                                                              {Math.round((cause.totalCount / (memoizedTop5Causes[0]?.totalCount || 1)) * 100)}% oranında
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                            ));
                          })()}
                        </Grid>
                      </Box>
                    </Box>


                  </Box>
                </>
              );
            })()}
          </Box>
        )}

        {/* Hata Listesi Tab */}
        {activeTab === 2 && (
          <Box>
            {/* Results count */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredData.length} kayıt bulundu
              </Typography>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, boxShadow: 2 }}>
              <Table size="medium" stickyHeader>
                <TableHead>
                  <TableRow sx={{ 
                    backgroundColor: 'primary.main',
                    '& .MuiTableCell-head': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      borderBottom: '2px solid #1565c0',
                      textAlign: 'center'
                    }
                  }}>
                    <TableCell sx={{ minWidth: 120, maxWidth: 120 }}>Seri No</TableCell>
                    <TableCell sx={{ minWidth: 140, maxWidth: 140 }}>Araç Tipi</TableCell>
                    <TableCell sx={{ minWidth: 160, maxWidth: 160 }}>Üretim Birimi</TableCell>
                    <TableCell sx={{ minWidth: 180, maxWidth: 180 }}>Hata Tipi</TableCell>
                    <TableCell sx={{ minWidth: 80, maxWidth: 80, textAlign: 'center' }}>Tekrar</TableCell>
                    <TableCell sx={{ minWidth: 120, maxWidth: 120 }}>Kaliteye Veriliş</TableCell>
                    <TableCell sx={{ minWidth: 120, maxWidth: 120 }}>Tespit Tarihi</TableCell>
                    <TableCell sx={{ minWidth: 100, maxWidth: 100, textAlign: 'center' }}>Durum</TableCell>
                    <TableCell sx={{ minWidth: 100, maxWidth: 100, textAlign: 'center' }}>Önem</TableCell>
                    <TableCell sx={{ minWidth: 120, maxWidth: 120, textAlign: 'center' }}>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((record, index) => (
                    <TableRow 
                      key={record.id} 
                      hover 
                      sx={{ 
                        backgroundColor: index % 2 === 0 ? 'grey.50' : 'white',
                        '&:hover': { backgroundColor: 'action.hover' },
                        borderLeft: '4px solid',
                        borderLeftColor: record.defects && record.defects[0] ? 
                          getSeverityColor(record.defects[0].severity) : 'grey.300'
                      }}
                    >
                      <TableCell sx={{ 
                        fontSize: '0.85rem', 
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 120
                      }}>
                        <Tooltip title={record.serialNumber}>
                          <span>{record.serialNumber}</span>
                        </Tooltip>
                      </TableCell>
                      
                      <TableCell sx={{ 
                        fontSize: '0.85rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 140
                      }}>
                        <Tooltip title={getVehicleTypeLabel(record.vehicleType)}>
                          <span>{getVehicleTypeLabel(record.vehicleType)}</span>
                        </Tooltip>
                      </TableCell>
                      
                      <TableCell sx={{ maxWidth: 160 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {record.defects && record.defects[0] && productionUnits.find(u => u.value === record.defects[0].productionUnit)?.icon}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.8rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {record.defects && record.defects[0] ? getProductionUnitLabel(record.defects[0].productionUnit) : 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell sx={{ 
                        fontSize: '0.85rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 180
                      }}>
                        <Tooltip title={record.defects && record.defects[0] ? record.defects[0].defectType : 'N/A'}>
                          <span>{record.defects && record.defects[0] ? record.defects[0].defectType : 'N/A'}</span>
                        </Tooltip>
                      </TableCell>
                      
                      <TableCell sx={{ textAlign: 'center' }}>
                        {(() => {
                          const totalDefectsWithRepeats = record.defects ? 
                            record.defects.reduce((sum, defect) => sum + defect.repeatCount, 0) : 0;
                          return (
                            <Chip 
                              size="small" 
                              label={totalDefectsWithRepeats.toString()} 
                              color={totalDefectsWithRepeats > 1 ? "error" : "default"}
                              sx={{ fontSize: '0.7rem', height: 24 }}
                            />
                          );
                        })()}
                      </TableCell>
                      
                      <TableCell sx={{ 
                        fontSize: '0.8rem',
                        textAlign: 'center'
                      }}>
                        {record.qualitySubmissionDate ? 
                          new Date(record.qualitySubmissionDate).toLocaleDateString('tr-TR') : 
                          new Date(record.submissionDate).toLocaleDateString('tr-TR')
                        }
                      </TableCell>
                      
                      <TableCell sx={{ 
                        fontSize: '0.8rem',
                        textAlign: 'center'
                      }}>
                        {new Date(record.submissionDate).toLocaleDateString('tr-TR')}
                      </TableCell>
                      
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip 
                          size="small" 
                          label={getStatusLabel(record.status)} 
                          color={getStatusColor(record.status) as any}
                          sx={{ fontSize: '0.7rem', height: 24 }}
                        />
                      </TableCell>
                      
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip 
                          size="small" 
                          label={record.defects && record.defects[0] ? getSeverityLabel(record.defects[0].severity) : 'N/A'} 
                          sx={{ 
                            backgroundColor: record.defects && record.defects[0] ? getSeverityColor(record.defects[0].severity) : '#9E9E9E', 
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 24
                          }}
                        />
                      </TableCell>
                      
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Görüntüle">
                            <IconButton size="small" onClick={() => openViewDialog(record)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Düzenle">
                            <IconButton size="small" onClick={() => openEditDialog(record)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Uygunsuzluk Oluştur">
                            <IconButton 
                              size="small" 
                              onClick={() => handleCreateDOF(record)}
                              sx={{ color: 'orange' }}
                            >
                              <ReportIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton size="small" onClick={() => handleDelete(record)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Aylık Üretim Araçları Tab */}
        {activeTab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Araç Üretim Adetleri ({monthlyVehicles.length} kayıt)
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetMonthlyVehicleForm();
                  setMonthlyVehicleDialog(true);
                }}
                sx={{ borderRadius: 2 }}
              >
                Yeni Araç Ekle
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, boxShadow: 2 }}>
              <Table size="medium" stickyHeader>
                <TableHead>
                  <TableRow sx={{ 
                    backgroundColor: 'primary.main',
                    '& .MuiTableCell-head': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      fontWeight: 'bold'
                    }
                  }}>
                    <TableCell>Seri No</TableCell>
                    <TableCell>Araç Tipi</TableCell>
                    <TableCell>Müşteri Adı</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Üretim Tarihi</TableCell>
                    <TableCell>Üretim Ayı</TableCell>
                    <TableCell align="center">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* ✅ YENİ: Aylık üretim araçlarına filtre uygula */}
                  {monthlyVehicles.filter(vehicle => {
                    // Yıl filtresi
                    let yearMatch = true;
                    if (filters.year) {
                      const vehicleYear = vehicle.productionMonth.split('-')[0];
                      yearMatch = vehicleYear === filters.year;
                    }
                    
                    // Ay filtresi
                    let monthMatch = true;
                    if (filters.month) {
                      const vehicleMonth = vehicle.productionMonth.split('-')[1];
                      monthMatch = vehicleMonth === filters.month;
                    }
                    
                    // Araç tipi filtresi
                    let vehicleTypeMatch = true;
                    if (filters.vehicleType) {
                      vehicleTypeMatch = vehicle.vehicleType === filters.vehicleType;
                    }
                    
                    return yearMatch && monthMatch && vehicleTypeMatch;
                  }).map((vehicle) => (
                    <TableRow key={vehicle.id} hover>
                      <TableCell>{vehicle.serialNumber}</TableCell>
                      <TableCell>
                        <Chip 
                          label={vehicle.vehicleType} 
                          size="small" 
                          color="primary"
                          sx={{ borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>{vehicle.customerName}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell>
                        {vehicle.productionDate && !isNaN(new Date(vehicle.productionDate).getTime()) 
                          ? new Date(vehicle.productionDate).toLocaleDateString('tr-TR')
                          : 'Geçersiz Tarih'
                        }
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={vehicle.productionMonth} 
                          size="small" 
                          variant="outlined"
                          sx={{ borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Düzenle">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => {
                                setMonthlyVehicleForm({
                                  vehicleType: vehicle.vehicleType,
                                  serialNumber: vehicle.serialNumber,
                                  customerName: vehicle.customerName,
                                  model: vehicle.model,
                                  productionDate: vehicle.productionDate,
                                  productionMonth: vehicle.productionMonth
                                });
                                setSelectedMonthlyVehicleId(vehicle.id);
                                setMonthlyVehicleDialog(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteMonthlyVehicle(vehicle.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {monthlyVehicles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Henüz araç kaydı bulunmuyor
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

      </Paper>

      {/* Aylık Araç Ekleme Dialog */}
      <Dialog 
        open={monthlyVehicleDialog} 
        onClose={() => {
          setMonthlyVehicleDialog(false);
          resetMonthlyVehicleForm();
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {selectedMonthlyVehicleId ? 'Araç Bilgilerini Düzenle' : 'Yeni Araç Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Araç Tipi *</InputLabel>
                <Select
                  value={monthlyVehicleForm.vehicleType || ''}
                  label="Araç Tipi *"
                  onChange={(e) => setMonthlyVehicleForm(prev => ({ ...prev, vehicleType: e.target.value }))}
                >
                  {vehicleTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Seri Numarası *"
                value={monthlyVehicleForm.serialNumber || ''}
                onChange={(e) => setMonthlyVehicleForm(prev => ({ ...prev, serialNumber: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Müşteri Adı *"
                value={monthlyVehicleForm.customerName || ''}
                onChange={(e) => setMonthlyVehicleForm(prev => ({ ...prev, customerName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Model"
                value={monthlyVehicleForm.model || ''}
                onChange={(e) => setMonthlyVehicleForm(prev => ({ ...prev, model: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Üretim Tarihi *"
                value={monthlyVehicleForm.productionDate || ''}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  const month = date.toISOString().slice(0, 7);
                  setMonthlyVehicleForm(prev => ({ 
                    ...prev, 
                    productionDate: e.target.value,
                    productionMonth: month
                  }));
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="month"
                label="Üretim Ayı *"
                value={monthlyVehicleForm.productionMonth || ''}
                onChange={(e) => setMonthlyVehicleForm(prev => ({ ...prev, productionMonth: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setMonthlyVehicleDialog(false);
            resetMonthlyVehicleForm();
          }}>
            İptal
          </Button>
          <Button onClick={handleAddMonthlyVehicle} variant="contained">
            {selectedMonthlyVehicleId ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' && 'Yeni Hata Kaydı Oluştur'}
          {dialogMode === 'edit' && 'Hata Kaydını Düzenle'}
          {dialogMode === 'view' && 'Hata Kaydı Detayları'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Vehicle Information */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Seri Numarası (Aylık Üretim Listesinden) *</InputLabel>
                <Select
                  value={formData.serialNumber || ''}
                  label="Seri Numarası (Aylık Üretim Listesinden) *"
                  onChange={(e) => {
                    const selectedVehicle = monthlyVehicles.find(v => v.serialNumber === e.target.value);
                    setFormData(prev => ({ 
                      ...prev, 
                      serialNumber: e.target.value,
                      vehicleType: selectedVehicle ? selectedVehicle.vehicleType : prev.vehicleType
                    }));
                  }}
                  disabled={dialogMode === 'view'}
                >
                  {monthlyVehicles
                    .filter((vehicle, index, self) => 
                      index === self.findIndex(v => v.serialNumber === vehicle.serialNumber)
                    )
                    .map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.serialNumber}>
                        {vehicle.serialNumber} - {vehicle.vehicleType} ({vehicle.customerName})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Araç Tipi *</InputLabel>
                <Select
                  value={formData.vehicleType || ''}
                  label="Araç Tipi *"
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                  disabled={dialogMode === 'view'}
                >
                  {vehicleTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Submission Information */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tespit Tarihi *"
                type="date"
                value={formData.submissionDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, submissionDate: e.target.value }))}
                disabled={dialogMode === 'view'}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kaliteye Veriliş Tarihi"
                type="date"
                value={formData.qualitySubmissionDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, qualitySubmissionDate: e.target.value }))}
                disabled={dialogMode === 'view'}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kontrol Eden *"
                value={formData.inspector || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, inspector: e.target.value }))}
                disabled={dialogMode === 'view'}
              />
            </Grid>

            {/* Defect Addition Section */}
            {(dialogMode === 'create' || dialogMode === 'edit') && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Hata Ekleme
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Üretim Birimi *</InputLabel>
                    <Select
                      value={currentDefect.productionUnit || ''}
                      label="Üretim Birimi *"
                      onChange={(e) => setCurrentDefect(prev => ({ 
                        ...prev, 
                        productionUnit: e.target.value,
                        defectType: '' // Reset defect type when unit changes
                      }))}
                    >
                      {productionUnits.map(unit => (
                        <MenuItem key={unit.value} value={unit.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {unit.icon}
                            {unit.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <FormControl fullWidth>
                      <InputLabel>Hata Tipi *</InputLabel>
                      <Select
                        value={currentDefect.defectType || ''}
                        label="Hata Tipi *"
                        onChange={(e) => setCurrentDefect(prev => ({ ...prev, defectType: e.target.value }))}
                        disabled={!currentDefect.productionUnit}
                      >
                        {currentDefect.productionUnit && defectTypesByUnit[currentDefect.productionUnit]?.map(type => (
                          <MenuItem key={type} value={type}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <span>{type}</span>
                                                             {dialogMode === 'create' || dialogMode === 'edit' ? (
                                 <IconButton
                                   size="small"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     removeDefectType(currentDefect.productionUnit!, type);
                                   }}
                                   sx={{ ml: 1, color: 'error.main' }}
                                 >
                                   <DeleteIcon fontSize="small" />
                                 </IconButton>
                               ) : null}
                             </Box>
                           </MenuItem>
                         ))}
                       </Select>
                     </FormControl>
                     
                     {(dialogMode === 'create' || dialogMode === 'edit') && (
                      <IconButton
                        onClick={() => setShowAddDefectType(true)}
                        disabled={!currentDefect.productionUnit}
                        sx={{ mt: 1, color: 'primary.main' }}
                      >
                        <AddIcon />
                      </IconButton>
                    )}
                  </Box>

                                     {/* Yeni hata tipi ekleme alanı */}
                   {showAddDefectType && (dialogMode === 'create' || dialogMode === 'edit') && (
                    <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Yeni Hata Tipi Ekle
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Hata Tipi Adı"
                          value={newDefectType}
                          onChange={(e) => setNewDefectType(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addDefectType();
                            }
                          }}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          onClick={addDefectType}
                          disabled={!newDefectType.trim()}
                        >
                          Ekle
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setShowAddDefectType(false);
                            setNewDefectType('');
                          }}
                        >
                          İptal
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Hata Açıklaması *"
                    multiline
                    rows={3}
                    value={currentDefect.defectDescription || ''}
                    onChange={(e) => setCurrentDefect(prev => ({ ...prev, defectDescription: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Önem Derecesi</InputLabel>
                    <Select
                      value={currentDefect.severity || 'medium'}
                      label="Önem Derecesi"
                      onChange={(e) => setCurrentDefect(prev => ({ ...prev, severity: e.target.value as 'low' | 'medium' | 'high' | 'critical' }))}
                    >
                      <MenuItem value="low">Düşük</MenuItem>
                      <MenuItem value="medium">Orta</MenuItem>
                      <MenuItem value="high">Yüksek</MenuItem>
                      <MenuItem value="critical">Kritik</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Tekrarlama Sayısı"
                    value={currentDefect.repeatCount || 1}
                    onChange={(e) => setCurrentDefect(prev => ({ ...prev, repeatCount: parseInt(e.target.value) || 1 }))}
                    inputProps={{ min: 1 }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={addDefectToForm}
                    sx={{ height: '56px' }}
                    startIcon={<AddIcon />}
                  >
                    Hata Ekle
                  </Button>
                </Grid>
              </>
            )}

            {/* Added Defects List */}
            {formData.defects && formData.defects.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Eklenen Hatalar ({formData.defects.length})
                </Typography>
                <List>
                  {formData.defects.map((defect, index) => (
                    <ListItem
                      key={defect.id}
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: 'background.paper'
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {productionUnits.find(u => u.value === defect.productionUnit)?.icon}
                            <Typography variant="subtitle1" fontWeight="bold">
                              {productionUnits.find(u => u.value === defect.productionUnit)?.label}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={defect.severity} 
                              sx={{ backgroundColor: getSeverityColor(defect.severity), color: 'white' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {defect.defectType}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {defect.defectDescription}
                            </Typography>
                            <Typography variant="caption">
                              Tekrarlama: {defect.repeatCount}x
                            </Typography>
                          </Box>
                        }
                      />
                      {(dialogMode === 'create' || dialogMode === 'edit') && (
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => removeDefectFromForm(defect.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}

            {/* Overall Status */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Genel Durum</InputLabel>
                <Select
                  value={formData.status || 'open'}
                  label="Genel Durum"
                                     onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'open' | 'in_progress' | 'closed' }))}
                  disabled={dialogMode === 'view'}
                >
                  <MenuItem value="open">Açık</MenuItem>
                  <MenuItem value="in_progress">Devam Ediyor</MenuItem>
                  <MenuItem value="closed">Kapalı</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>
            {dialogMode === 'view' ? 'Kapat' : 'İptal'}
          </Button>
          {(dialogMode === 'create' || dialogMode === 'edit') && (
            <Button onClick={handleSave} variant="contained">
              Kaydet
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ✅ PROFESYONELLEŞTİRİLMİŞ DETAY ANALİZ DIALOG'U */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            minHeight: '500px',
            maxHeight: '85vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
                          background: `linear-gradient(135deg, ${appearanceSettings.primaryColor}dd 0%, ${appearanceSettings.primaryColor} 50%, ${appearanceSettings.primaryColor}aa 100%)`, 
          color: 'white',
          position: 'relative',
          py: 3,
          px: 4,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AssessmentIcon sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {selectedDetailData?.title || 'Detay Analizi'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Kapsamlı Performans ve Trend Analizi
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setDetailDialogOpen(false)}
              sx={{ 
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ 
          p: 4, 
          backgroundColor: '#f8f9fa',
          overflow: 'auto',
          maxHeight: 'calc(90vh - 200px)'
        }}>
          {/* KPI Detay Analizi */}
          {detailDialogType === 'kpi' && selectedDetailData && (
            <Box>
              {/* Ana Metrik - Profesyonel Hero Card */}
              <Card sx={{ 
                mb: 4, 
                background: `linear-gradient(135deg, ${appearanceSettings.primaryColor}dd 0%, ${appearanceSettings.primaryColor} 50%, ${appearanceSettings.primaryColor}aa 100%)`,
                color: 'white',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(21, 101, 192, 0.3)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3, px: 3 }}>
                  <Box sx={{ mb: 1.5 }}>
                    <AssessmentIcon sx={{ fontSize: 36, opacity: 0.9 }} />
                  </Box>
                  <Typography variant="h2" fontWeight="bold" sx={{ mb: 1.5, fontSize: '2.5rem' }}>
                    {selectedDetailData.mainValue}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    {selectedDetailData.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                    Detaylı analiz ve trend verileri aşağıda gösterilmektedir
                  </Typography>
                </CardContent>
              </Card>

              {/* Alt Metrikler - Profesyonel KPI Kartları */}
              <Box sx={{ mb: 4 }}>
                              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#1565c0' }}>
                Detaylı Performans Metrikleri
              </Typography>
                <Grid container spacing={3}>
                  {selectedDetailData.subMetrics?.map((metric: any, index: number) => {
                    const colors = ['#1976d2', '#ff9800', '#4caf50', '#f44336'];
                    const bgColors = ['#e3f2fd', '#fff3e0', '#e8f5e8', '#ffebee'];
                    return (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card sx={{ 
                          height: '100%', 
                          borderRadius: 3,
                          borderLeft: `5px solid ${colors[index % 4]}`,
                          backgroundColor: bgColors[index % 4],
                          '&:hover': { 
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            transition: 'all 0.3s ease'
                          }
                        }}>
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontWeight: 600, display: 'block' }}>
                              {metric.label}
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" sx={{ color: colors[index % 4], mb: 0.5 }}>
                              {metric.value}
                            </Typography>
                            <Box sx={{ 
                              width: '100%', 
                              height: 4, 
                              bgcolor: 'rgba(0,0,0,0.1)', 
                              borderRadius: 2,
                              overflow: 'hidden'
                            }}>
                              <Box sx={{ 
                                width: '75%', 
                                height: '100%', 
                                bgcolor: colors[index % 4],
                                borderRadius: 2
                              }} />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>

              {/* Detaylı Breakdown */}
              {selectedDetailData.detailedBreakdown && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Detaylı Dağılım</Typography>
                  <Grid container spacing={2}>
                    {selectedDetailData.detailedBreakdown.map((item: any, index: number) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ 
                          p: 2, 
                          borderLeft: `4px solid ${item.color}`,
                          '&:hover': { boxShadow: 4, transform: 'translateY(-2px)', transition: 'all 0.3s ease' }
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {item.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.additional}
                              </Typography>
                            </Box>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                              {item.value}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}


            </Box>
          )}

          {/* Birim Detay Analizi - Profesyonel */}
          {detailDialogType === 'unit' && selectedDetailData && (
            <Box>
              {/* Birim Başlığı */}
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" sx={{ color: '#1565c0', mb: 1 }}>
                  {selectedDetailData.unitName}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Departman Performans Analizi ve Trend Verileri
                </Typography>
              </Box>

              {/* Ana Metrikler - Profesyonel Dashboard */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                    borderLeft: '5px solid #f44336',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(244, 67, 54, 0.3)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent sx={{ py: 3 }}>
                      <ErrorIcon sx={{ fontSize: 32, color: '#f44336', mb: 1.5 }} />
                      <Typography variant="h4" fontWeight="bold" color="error" sx={{ mb: 0.5 }}>
                        {selectedDetailData.mainMetrics?.totalDefects || 0}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" fontWeight="600">
                        Toplam Hata
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tekrar sayısı dahil
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    borderLeft: '5px solid #1976d2',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(25, 118, 210, 0.3)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent sx={{ py: 3 }}>
                      <RepeatIcon sx={{ fontSize: 32, color: '#1976d2', mb: 1.5 }} />
                      <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 0.5 }}>
                        {selectedDetailData.mainMetrics?.repeatedVehicles || 0}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" fontWeight="600">
                        Tekrarlanan Hatalar
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Araç sayısı
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%)',
                    borderLeft: '5px solid #4caf50',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent sx={{ py: 3 }}>
                      <AssessmentIcon sx={{ fontSize: 32, color: '#4caf50', mb: 1.5 }} />
                      <Typography variant="h4" fontWeight="bold" color="success" sx={{ mb: 0.5 }}>
                        {selectedDetailData.mainMetrics?.averageDefectsPerVehicle?.toFixed(1) || '0.0'}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" fontWeight="600">
                        Ortalama Hata/Araç
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Hata yoğunluğu
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    textAlign: 'center', 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)',
                    borderLeft: '5px solid #ff9800',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(255, 152, 0, 0.3)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent sx={{ py: 3 }}>
                      <FactoryIcon sx={{ fontSize: 32, color: '#ff9800', mb: 1.5 }} />
                      <Typography variant="h4" fontWeight="bold" color="warning" sx={{ mb: 0.5 }}>
                        {selectedDetailData.mainMetrics?.totalVehicles || 0}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" fontWeight="600">
                        İşlenen Araç
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Toplam sayı
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Zaman Serisi Grafiği */}
              {selectedDetailData.timeSeriesData && (
                <Card sx={{ mb: 4 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Son 12 Aylık Hata Trendi</Typography>
                    <Box sx={{ height: 300, width: '100%' }}>
                      <ResponsiveContainer>
                        <LineChart data={selectedDetailData.timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="dateLabel" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line 
                            type="monotone" 
                            dataKey="defects" 
                            stroke="#1976d2" 
                            strokeWidth={3}
                            dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Hata Türü Breakdown */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {selectedDetailData.defectTypeBreakdown && (
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>Hata Türü Dağılımı (Top 5)</Typography>
                        <List>
                          {selectedDetailData.defectTypeBreakdown.map((item: any, index: number) => (
                            <ListItem key={index} sx={{ py: 1 }}>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1">{item.name}</Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                      {item.value} (%{item.percentage})
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {selectedDetailData.severityAnalysis && (
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>Kritiklik Analizi</Typography>
                        <List>
                          {selectedDetailData.severityAnalysis.map((item: any, index: number) => (
                            <ListItem key={index} sx={{ py: 1 }}>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ 
                                        width: 12, 
                                        height: 12, 
                                        borderRadius: '50%', 
                                        backgroundColor: item.color 
                                      }} />
                                      <Typography variant="body1">{item.name}</Typography>
                                    </Box>
                                    <Typography variant="body1" fontWeight="bold">
                                      {item.value} (%{item.percentage})
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>


            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 4, 
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e0e0e0',
          gap: 2
        }}>
          <Button 
            onClick={() => setDetailDialogOpen(false)} 
            variant="outlined"
            size="large"
            startIcon={<CloseIcon />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600
            }}
          >
            Kapat
          </Button>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<ViewIcon />}
            onClick={() => {
              setDetailDialogOpen(false);
              // Veri Yönetimi sekmesine geç
              setActiveTab(2);
            }}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
                              background: `linear-gradient(135deg, ${appearanceSettings.primaryColor}dd 0%, ${appearanceSettings.primaryColor} 100%)`,
              '&:hover': {
                background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(21, 101, 192, 0.4)'
              }
            }}
          >
            Detay Kayıtları Görüntüle
          </Button>
        </DialogActions>
      </Dialog>

      
    </Container>
  );
};

export default ProductionQualityTracking; 
