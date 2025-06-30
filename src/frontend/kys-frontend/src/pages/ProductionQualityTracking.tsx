import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
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
  Close as CloseIcon
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

// 🔥 ULTRA AGGRESSIVE SEARCH INPUT - 2 saniye focus kaybı problemi için
const UltimateStableSearchInput = memo(({ 
  label, 
  placeholder, 
  onChange, 
  defaultValue = '', 
  debounceMs = 350,
  icon: Icon,
  ...otherProps 
}: {
  label: string;
  placeholder: string;
  onChange: (value: string) => void;
  defaultValue?: string;
  debounceMs?: number;
  icon?: any;
  [key: string]: any;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const valueRef = useRef<string>(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);
  const focusGuardRef = useRef<NodeJS.Timeout | null>(null);
  const aggressiveFocusRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // 🔥 ULTRA AGGRESSIVE FOCUS PROTECTION
  useEffect(() => {
    const focusProtection = () => {
      if (isMountedRef.current && inputRef.current && 
          document.activeElement !== inputRef.current) {
        
        // Eğer input container'da ise focus'u geri al
        const container = containerRef.current;
        if (container && container.contains(document.activeElement)) {
          inputRef.current.focus();
        }
      }
    };

    // Her 25ms focus kontrolü - çok agresif
    const interval = setInterval(focusProtection, 25);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // 🔥 BLUR PREVENTION - Hiç blur olmasın
  const handleBlur = useCallback((event: React.FocusEvent) => {
    // Blur'u engelle
    event.preventDefault();
    
    // Hemen tekrar focus al
    if (aggressiveFocusRef.current) {
      clearTimeout(aggressiveFocusRef.current);
    }
    
    aggressiveFocusRef.current = setTimeout(() => {
      if (isMountedRef.current && inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
  }, []);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    valueRef.current = newValue;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  }, [onChange, debounceMs]);

  const handleContainerMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputMouseDown = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  const handleInputFocus = useCallback(() => {
    // Focus alındığında aggressive protection başlat
    if (focusGuardRef.current) {
      clearTimeout(focusGuardRef.current);
    }
  }, []);

  // 🔥 MOUNT/UNMOUNT CONTROL
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (focusGuardRef.current) clearTimeout(focusGuardRef.current);
      if (aggressiveFocusRef.current) clearTimeout(aggressiveFocusRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleContainerMouseDown}
      style={{ width: '100%' }}
    >
      <TextField
        {...otherProps}
        ref={inputRef}
        fullWidth
        size="small"
        label={label}
        defaultValue={defaultValue}
        onChange={handleChange}
        onFocus={handleInputFocus}
        onBlur={handleBlur}
        onMouseDown={handleInputMouseDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        InputProps={{
          startAdornment: Icon ? (
            <InputAdornment position="start">
              <Icon />
            </InputAdornment>
          ) : undefined,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
              borderWidth: '2px',
            },
          },
        }}
      />
    </div>
  );
}, () => true); // Aggressive memo to prevent ALL re-renders

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
    period: '', // dönem (ay/çeyrek)
    year: new Date().getFullYear().toString(),
    month: '',
    quarter: ''
  });

  // Filter expansion state
  const [filterExpanded, setFilterExpanded] = useState(false);

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
  
  // Dynamic defect types management
  const [defectTypesByUnit, setDefectTypesByUnit] = useState(initialDefectTypesByUnit);
  const [newDefectType, setNewDefectType] = useState('');
  const [showAddDefectType, setShowAddDefectType] = useState(false);
  
  // Etkileşimli Dashboard için state'ler
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailDialogType, setDetailDialogType] = useState<'unit' | 'kpi' | 'trend'>('unit');
  const [selectedDetailData, setSelectedDetailData] = useState<any>(null);
  const [unitAnalysisDialogOpen, setUnitAnalysisDialogOpen] = useState(false);
  const [selectedUnitForAnalysis, setSelectedUnitForAnalysis] = useState<string>('');

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
  }, []);

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
      }
    ];

    setDefectRecords(sampleData);
    localStorage.setItem('productionQualityData', JSON.stringify(sampleData));
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
    if (!formData.serialNumber || !formData.vehicleType || !formData.inspector || !formData.defects?.length) {
      alert('Lütfen zorunlu alanları doldurunuz ve en az bir hata ekleyiniz!');
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

  // DÖF/8D oluşturma fonksiyonu
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

    // DÖF kaydı oluştur
    const result = createDOFFromSourceRecord(dofParams);
    
    if (result.success) {
      // DÖF form açma bilgilerini localStorage'a kaydet
      localStorage.setItem('dof-auto-open-form', 'true');
      localStorage.setItem('dof-form-prefill', JSON.stringify({
        ...dofParams,
        dofNumber: result.dofRecord?.dofNumber,
        openInEditMode: true
      }));
      
      // DÖF/8D Management sayfasına direkt yönlendir
      window.location.href = '/dof-8d-management';
    } else {
      alert(`DÖF oluşturma hatası: ${result.error}`);
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
      
      // İLK GEÇİŞ ORANI: Sadece bu birimde hata olan araçlar baz alınır
      const vehiclesPassedFirstTime = vehiclesWithUnitDefects.filter(record => {
        const unitDefectsForVehicle = record.defects ? record.defects.filter(defect => 
          defect.productionUnit === unit.value
        ) : [];
        // Bu birimde hata varsa hepsi ilk seferde (repeatCount <= 1) olmalı
        return unitDefectsForVehicle.every(defect => defect.repeatCount <= 1);
      });
      
      const firstTimePassRate = vehiclesWithUnitDefects.length > 0 ? 
        (vehiclesPassedFirstTime.length / vehiclesWithUnitDefects.length) * 100 : 0;
      
      // Araç başına ortalama hata sayısı (sadece bu birimde hata olan araçlar)
      const avgDefectsPerVehicle = vehiclesWithUnitDefects.length > 0 ? 
        totalUnitDefectsWithRepeats / vehiclesWithUnitDefects.length : 0;
      
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

      return {
        unit: unit.value,
        unitName: unit.label,
        totalDefects: totalUnitDefectsWithRepeats, // Tekrarlama sayısı dahil toplam hata
        averageDefectsPerVehicle: Math.round(avgDefectsPerVehicle * 100) / 100,
        firstTimePassRate: Math.round(firstTimePassRate * 100) / 100,
        qualityScore: qualityScore,
        totalVehicles: vehiclesWithUnitDefects.length,
        repeatedVehicles: repeatedVehiclesCount,
        color: unit.color
      };
    });
  };

  // Quality Performance KPIs
  const getQualityKPIs = () => {
    // Tekrarlama sayısını dahil ederek toplam hata sayısını hesapla
    const totalDefects = defectRecords.reduce((sum, record) => {
      if (!record.defects) return sum;
      return sum + record.defects.reduce((defectSum, defect) => defectSum + defect.repeatCount, 0);
    }, 0);
    
    // Hata olan araçlar
    const vehiclesWithDefects = defectRecords.filter(record => 
      record.defects && record.defects.length > 0
    );
    
    const totalVehicles = defectRecords.length;
    const avgDefectsPerVehicle = vehiclesWithDefects.length > 0 ? totalDefects / vehiclesWithDefects.length : 0;
    
    // İlk geçiş başarılı araçlar: Hiç hata olmayan + tüm hataları ilk seferde olan
    const vehiclesWithoutDefects = defectRecords.filter(record => 
      !record.defects || record.defects.length === 0
    );
    
    const firstTimeSuccessVehicles = vehiclesWithDefects.filter(record =>
      record.defects && record.defects.every(defect => defect.repeatCount <= 1)
    );
    
    const totalFirstTimePass = vehiclesWithoutDefects.length + firstTimeSuccessVehicles.length;
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
      criticalDefects: defectRecords.reduce((sum, record) => {
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
      
      // Tarih filtreleme
      let matchDate = true;
      
      if (filters.period === 'monthly' && filters.year && filters.month) {
        const recordDate = new Date(record.submissionDate);
        const recordYear = recordDate.getFullYear();
        const recordMonth = String(recordDate.getMonth() + 1).padStart(2, '0');
        matchDate = recordYear.toString() === filters.year && recordMonth === filters.month;
      } else if (filters.period === 'quarterly' && filters.year && filters.quarter) {
        const recordDate = new Date(record.submissionDate);
        const recordYear = recordDate.getFullYear();
        const recordMonth = recordDate.getMonth() + 1; // 1-12
        
        let quarterMatch = false;
        switch (filters.quarter) {
          case 'Q1': quarterMatch = recordMonth >= 1 && recordMonth <= 3; break;
          case 'Q2': quarterMatch = recordMonth >= 4 && recordMonth <= 6; break;
          case 'Q3': quarterMatch = recordMonth >= 7 && recordMonth <= 9; break;
          case 'Q4': quarterMatch = recordMonth >= 10 && recordMonth <= 12; break;
        }
        matchDate = recordYear.toString() === filters.year && quarterMatch;
      } else if (filters.period === 'custom') {
        const matchDateFrom = !filters.dateFrom || record.submissionDate >= filters.dateFrom;
        const matchDateTo = !filters.dateTo || record.submissionDate <= filters.dateTo;
        matchDate = matchDateFrom && matchDateTo;
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
    
    const totalVehicles = records.length;
    const avgDefectsPerVehicle = vehiclesWithDefects.length > 0 ? totalDefects / vehiclesWithDefects.length : 0;
    
    // İlk geçiş başarılı araçlar: Hiç hata olmayan + tüm hataları ilk seferde olan
    const vehiclesWithoutDefects = records.filter(record => 
      !record.defects || record.defects.length === 0
    );
    
    const firstTimeSuccessVehicles = vehiclesWithDefects.filter(record =>
      record.defects && record.defects.every(defect => defect.repeatCount <= 1)
    );
    
    const totalFirstTimePass = vehiclesWithoutDefects.length + firstTimeSuccessVehicles.length;
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

      // İLK GEÇİŞ ORANI: Sadece bu birimde hata olan araçlar baz alınır
      const vehiclesPassedFirstTime = vehiclesWithUnitDefects.filter(record => {
        const unitDefectsForVehicle = record.defects ? record.defects.filter(defect => 
          defect.productionUnit === unit.value
        ) : [];
        // Bu birimde hata varsa hepsi ilk seferde (repeatCount <= 1) olmalı
        return unitDefectsForVehicle.every(defect => defect.repeatCount <= 1);
      });
      
      const firstTimePassRate = vehiclesWithUnitDefects.length > 0 ? 
        (vehiclesPassedFirstTime.length / vehiclesWithUnitDefects.length) * 100 : 0;

      // Araç başına ortalama hata sayısı (sadece bu birimde hata olan araçlar)
      const avgDefectsPerVehicle = vehiclesWithUnitDefects.length > 0 ? 
        totalUnitDefectsWithRepeats / vehiclesWithUnitDefects.length : 0;

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

      return {
        unit: unit.value,
        unitName: unit.label,
        totalDefects: totalUnitDefectsWithRepeats,
        averageDefectsPerVehicle: Math.round(avgDefectsPerVehicle * 100) / 100,
        firstTimePassRate: Math.round(firstTimePassRate * 100) / 100,
        qualityScore: qualityScore,
        totalVehicles: vehiclesWithUnitDefects.length,
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
                <UltimateStableSearchInput
                  label="Arama"
                  placeholder="Seri no, hata türü..."
                  defaultValue={filters.searchTerm}
                  onChange={(value: string) => setFilters(prev => ({ ...prev, searchTerm: value }))}
                  debounceMs={350}
                  icon={SearchIcon}
                />
              </Grid>

              {/* Temizle Butonu */}
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  size="medium"
                  fullWidth
                  onClick={() => setFilters({
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
                  })}
                  sx={{ height: 40 }}
                >
                  Filtreleri Temizle
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </StyledAccordion>

        {/* KPI Metrics - Filtreleme sisteminin altına taşındı */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
                            <Card sx={{ background: `linear-gradient(135deg, ${appearanceSettings.primaryColor} 0%, ${appearanceSettings.primaryColor}aa 100%)`, color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">{kpiMetrics.totalDefects}</Typography>
                <Typography variant="body2">Toplam Hata</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">{kpiMetrics.totalVehicles}</Typography>
                <Typography variant="body2">Toplam Araç</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">{kpiMetrics.avgDefectsPerVehicle}</Typography>
                <Typography variant="body2">Araç Başına Hata</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">%{kpiMetrics.firstTimePassRate}</Typography>
                <Typography variant="body2">İlk Geçiş Oranı</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">%{kpiMetrics.repeatRate}</Typography>
                <Typography variant="body2">Tekrar Oran</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #455a64 0%, #78909c 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">{kpiMetrics.criticalDefects}</Typography>
                <Typography variant="body2">Kritik Hatalar</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tab label="Executive Dashboard" icon={<AssessmentIcon />} />
                      <Tab label="Birim Analizi" icon={<SearchIcon />} />
          <Tab label="Hata Listesi" icon={<AssessmentIcon />} />
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
                        // Toplam araç sayısı
                        const filteredUnits = getFilteredProductionUnitPerformance();
                        return filteredUnits.reduce((sum, stat) => sum + stat.totalVehicles, 0);
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
                        // Tekrarlanan hata sayısı (repeatCount > 1)
                        return filteredData.reduce((sum, record) => {
                          if (!record.defects) return sum;
                          return sum + record.defects.filter(defect => defect.repeatCount > 1).length;
                        }, 0);
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
                // Bu birimde hata olan araç sayısı
                const affectedVehicles = filteredData.filter(r => 
                  r.defects && r.defects.some(d => d.productionUnit === stat.unit)
                ).length;
                
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
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      border: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      '&:hover': { 
                        transform: 'translateY(-4px) scale(1.02)', 
                        boxShadow: 8, 
                        transition: 'all 0.3s ease',
                        border: '1px solid #1976d2'
                      }
                    }}
                    onClick={() => handleUnitCardClick(stat.unit, stat)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        {/* Department Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                              width: 16, 
                              height: 16, 
                              borderRadius: '50%', 
                              backgroundColor: stat.color 
                            }} />
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              {stat.unitName}
                            </Typography>
                            {/* Sıralama Göstergesi */}
                            <Chip 
                              label={`#${sortedIndex + 1}`}
                              size="small"
                              variant="outlined"
                              color={
                                sortedIndex === 0 ? 'error' : // En problemli
                                sortedIndex === 1 ? 'warning' : // İkinci
                                'default' // Diğerleri
                              }
                              sx={{ 
                                fontSize: '0.7rem', 
                                height: 20,
                                fontWeight: 'bold'
                              }}
                            />
                          </Box>
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
                            Başarılı Araç: {stat.totalVehicles - stat.repeatedVehicles}
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
                          
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Toplam Hata</Typography>
                              <Typography variant="h5" color="error.main">{stat.totalDefects}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Araç Sayısı</Typography>
                              <Typography variant="h5">{stat.totalVehicles}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Araç Başına Hata</Typography>
                              <Typography variant="h5" color="warning.main">{stat.averageDefectsPerVehicle.toFixed(1)}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">İlk Geçiş Oranı</Typography>
                              <Typography variant="h5" color="success.main">%{stat.firstTimePassRate.toFixed(1)}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Kalite Puanı</Typography>
                              <Typography variant="h5" color={stat.qualityScore === 0 ? "text.secondary" : "success.main"}>
                                {stat.qualityScore === 0 ? "Veri Yok" : stat.qualityScore}
                              </Typography>
                            </Grid>
                          </Grid>

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


      </Paper>

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
              <TextField
                fullWidth
                label="Seri Numarası *"
                value={formData.serialNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                disabled={dialogMode === 'view'}
              />
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
