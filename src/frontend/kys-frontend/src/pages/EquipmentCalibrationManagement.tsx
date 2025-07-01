import React, { useState, useMemo, useRef, memo, useCallback, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Tooltip,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Switch,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  Engineering as EngineeringIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Assessment as AssessmentIcon,
  MonetizationOn as MoneyIcon,
  Science as ScienceIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  CalendarToday as CalendarIcon,
  NotificationsActive as NotificationsIcon,
  Assignment as CertificateIcon,
  PlaylistAddCheck as ChecklistIcon,
  Block as BlockIcon,
  Verified as VerifiedIcon,
  PriorityHigh as UrgentIcon,
  Security as SecurityIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useThemeContext } from '../context/ThemeContext';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';

// Types & Interfaces
interface Equipment {
  id: string;
  equipmentCode: string;
  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  category: string;
  location: string;
  department: string;
  responsiblePersons: string[]; // Sicil numaraları array'i
  purchaseDate: string;
  installationDate: string;
  warrantyExpiry: string;
  status: 'active' | 'inactive' | 'maintenance' | 'calibration' | 'out_of_service';
  calibrationRequired: boolean;
  calibrationFrequency: number; // months
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  calibrationStatus: 'valid' | 'due' | 'overdue' | 'invalid';
  maintenanceRequired: boolean;
  maintenanceFrequency: number; // months
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceStatus: 'good' | 'due' | 'overdue' | 'critical';
  criticalEquipment: boolean;
  specifications: string;
  operatingManual: string;
  notes: string;
  qrCode?: string;
  images: string[];
  certificates: CalibrationCertificate[];
  maintenanceRecords: MaintenanceRecord[];
  // Yeni eklenen alanlar
  measurementRange?: string; // Hangi değerler arasında ölçüm yaptığı
  measurementUncertainty?: string; // Ölçüm belirsizliği ±
  customMeasurementRange?: string; // Özel ölçüm aralığı
  customMeasurementUncertainty?: string; // Özel ölçüm belirsizliği
  calibrationCompany?: string; // Nereye kalibre ettirdiğimiz yer
  lastCalibrationCertificateNumber?: string; // En son kalibrasyon sertifika numarası
  responsiblePersonName?: string; // Ana sorumlu kişinin adı
  responsiblePersonSicilNo?: string; // Ana sorumlu kişinin sicil numarası
}

interface CalibrationCertificate {
  id: string;
  equipmentId: string;
  calibrationDate: string;
  nextDueDate: string;
  calibratorName: string;
  calibratorCompany: string;
  certificateNumber: string;
  accreditationNumber: string;
  calibrationStandard: string;
  measurementResults: MeasurementResult[];
  uncertainty: string;
  temperature: number;
  humidity: number;
  status: 'valid' | 'expired' | 'invalid';
  certificateFile: string;
  notes: string;
  traceability: string;
  environmentalConditions: string;
  equipmentUsed: string[];
  conformityAssessment: 'pass' | 'fail' | 'conditional';
}

interface MeasurementResult {
  parameter: string;
  nominalValue: number;
  measuredValue: number;
  tolerance: number;
  unit: string;
  deviation: number;
  conformity: 'pass' | 'fail';
}

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  maintenanceDate: string;
  maintenanceType: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  description: string;
  performedBy: string;
  partsReplaced: string[];
  nextMaintenanceDate: string;
  workOrderNumber: string;
  duration: number; // hours
  status: 'completed' | 'pending' | 'in_progress' | 'cancelled';
  notes: string;
  attachments: string[];
}

// Interfaces removed - not currently used in the component

interface FilterState {
  searchTerm: string;
  category: string;
  location: string;
  department: string;
  status: string;
  calibrationStatus: string;
  maintenanceStatus: string;
  responsiblePerson: string;
  dateRange: {
    start: string;
    end: string;
  };
  criticalOnly: boolean;
  overdueOnly: boolean;
}

// Constants
const EQUIPMENT_CATEGORIES = [
  'Ölçüm Cihazları',
  'Test Ekipmanları',
  'Üretim Makineleri', 
  'Kalite Kontrol Cihazları',
  'Kaynak Ekipmanları',
  'Elektrikli Cihazlar',
  'Pnömatik Sistemler',
  'Hidrolik Sistemler',
  'Bilgisayar ve IT',
  'Güvenlik Ekipmanları',
  'Çevre Ölçüm Cihazları',
  'Laboratuvar Ekipmanları',
  'Diğer'
];

const LOCATIONS = [
  'Ar-Ge',
  'Girdi Kalite Kontrol',
  'Proses Kalite Kontrol',
  'Final Kalite Kontrol',
  'Depo',
  'Tesellüm',
  'Kesim',
  'Büküm',
  'Çatım',
  'Kaynakhane',
  'Boyahane',
  'Elektrik Montaj',
  'Mekanik Montaj',
  'Planlama',
  'Satın Alma',
  'Makine İşleme',
  'Test Sahası',
  'Dış Saha'
];

const DEPARTMENTS = [
  'Ar-Ge',
  'Girdi Kalite Kontrol',
  'Proses Kalite Kontrol', 
  'Final Kalite Kontrol',
  'Üretim',
  'Kaynakhane',
  'Boyahane',
  'Elektrik Montaj',
  'Mekanik Montaj',
  'Planlama',
  'Satın Alma',
  'Depo',
  'Tesellüm',
  'Bakım-Onarım',
  'Bilgi İşlem',
  'Güvenlik'
];

// Personel interface'i
interface Personnel {
  id: string;
  sicilNo: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  isActive: boolean;
}

// Personel verileri - localStorage'dan yüklenecek
const getPersonnelData = (): Personnel[] => {
  const stored = localStorage.getItem('personnel_data');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Eğer hiç veri yoksa örnek personel verileri oluştur
  const samplePersonnel: Personnel[] = [
    { id: '1', sicilNo: '001', name: 'Ahmet Yılmaz', department: 'Ar-Ge', position: 'Mühendis', email: 'ahmet.yilmaz@kademe.com', phone: '0532 123 4567', isActive: true },
    { id: '2', sicilNo: '002', name: 'Mehmet Kaya', department: 'Girdi Kalite Kontrol', position: 'Tekniker', email: 'mehmet.kaya@kademe.com', phone: '0532 234 5678', isActive: true },
    { id: '3', sicilNo: '003', name: 'Fatma Demir', department: 'Proses Kalite Kontrol', position: 'Uzman', email: 'fatma.demir@kademe.com', phone: '0532 345 6789', isActive: true },
    { id: '4', sicilNo: '004', name: 'Ali Özkan', department: 'Final Kalite Kontrol', position: 'Mühendis', email: 'ali.ozkan@kademe.com', phone: '0532 456 7890', isActive: true },
    { id: '5', sicilNo: '005', name: 'Ayşe Şahin', department: 'Üretim', position: 'Operatör', email: 'ayse.sahin@kademe.com', phone: '0532 567 8901', isActive: true },
    { id: '6', sicilNo: '006', name: 'Mustafa Çelik', department: 'Kaynakhane', position: 'Kaynakçı', email: 'mustafa.celik@kademe.com', phone: '0532 678 9012', isActive: true },
    { id: '7', sicilNo: '007', name: 'Zehra Arslan', department: 'Boyahane', position: 'Tekniker', email: 'zehra.arslan@kademe.com', phone: '0532 789 0123', isActive: true },
    { id: '8', sicilNo: '008', name: 'Hasan Yıldız', department: 'Elektrik Montaj', position: 'Elektrikçi', email: 'hasan.yildiz@kademe.com', phone: '0532 890 1234', isActive: true },
    { id: '9', sicilNo: '009', name: 'Emine Koç', department: 'Mekanik Montaj', position: 'Tekniker', email: 'emine.koc@kademe.com', phone: '0532 901 2345', isActive: true },
    { id: '10', sicilNo: '010', name: 'İbrahim Güzel', department: 'Planlama', position: 'Planlama Uzmanı', email: 'ibrahim.guzel@kademe.com', phone: '0532 012 3456', isActive: true },
    { id: '11', sicilNo: '011', name: 'Sema Aydın', department: 'Satın Alma', position: 'Satın Alma Uzmanı', email: 'sema.aydin@kademe.com', phone: '0532 123 4567', isActive: true },
    { id: '12', sicilNo: '012', name: 'Osman Polat', department: 'Depo', position: 'Depo Sorumlusu', email: 'osman.polat@kademe.com', phone: '0532 234 5678', isActive: true }
  ];
  
  localStorage.setItem('personnel_data', JSON.stringify(samplePersonnel));
  return samplePersonnel;
};

// Dinamik ölçüm aralıkları - cihaz kategorisine göre
const MEASUREMENT_RANGES_BY_CATEGORY = {
  'Ölçüm Cihazları': [
    '0-25 mm', '0-50 mm', '0-100 mm', '0-150 mm', '0-200 mm', 
    '0-300 mm', '0-500 mm', '0-1000 mm', '0-2000 mm', 'Diğer'
  ],
  'Test Ekipmanları': [
    '0-10 V', '0-100 V', '0-1000 V', '0-10 A', '0-100 A', 
    '0-1000 A', '0-1 kHz', '0-100 kHz', '0-1 MHz', 'Diğer'
  ],
  'Üretim Makineleri': [
    '0-100 kN', '0-500 kN', '0-1000 kN', '0-5000 kN',
    '0-100 Nm', '0-500 Nm', '0-1000 Nm', 'Diğer'
  ],
  'Kalite Kontrol Cihazları': [
    '0-25 mm', '0-50 mm', '0-100 mm', '0-200 mm',
    '0-500 mm', '0-1000 mm', 'Diğer'
  ],
  'Kaynak Ekipmanları': [
    '0-300 A', '0-500 A', '0-1000 A', '10-50 V',
    '20-80 V', '0-100%', 'Diğer'
  ],
  'Elektrikli Cihazlar': [
    '0-12 V', '0-24 V', '0-110 V', '0-220 V', '0-380 V',
    '0-1000 V', '0-10 A', '0-100 A', '0-1000 A', 'Diğer'
  ],
  'Pnömatik Sistemler': [
    '0-6 bar', '0-10 bar', '0-16 bar', '0-25 bar',
    '0-100 bar', '0-300 bar', 'Diğer'
  ],
  'Hidrolik Sistemler': [
    '0-100 bar', '0-250 bar', '0-400 bar', '0-630 bar',
    '0-1000 bar', '0-2000 bar', 'Diğer'
  ],
  'Bilgisayar ve IT': [
    'Digital', 'Analog', '0-5 V', '0-10 V', '0-24 V', 'Diğer'
  ],
  'Güvenlik Ekipmanları': [
    'Açık/Kapalı', '0-100%', '0-1000 ppm', 'Diğer'
  ],
  'Çevre Ölçüm Cihazları': [
    '-50°C - +150°C', '-100°C - +300°C', '0-100% RH',
    '0-2000 ppm', '0-10000 lux', 'Diğer'
  ],
  'Laboratuvar Ekipmanları': [
    '0.1-1000 mg', '0.01-100 g', '0.1-10 kg', 
    '-80°C - +200°C', '0-14 pH', 'Diğer'
  ],
  'Diğer': ['Diğer']
};

// Dinamik ölçüm belirsizlikleri - cihaz kategorisine göre
const MEASUREMENT_UNCERTAINTIES_BY_CATEGORY = {
  'Ölçüm Cihazları': [
    '±0.01 mm', '±0.02 mm', '±0.05 mm', '±0.1 mm', 
    '±0.2 mm', '±0.5 mm', '±1 mm', 'Diğer'
  ],
  'Test Ekipmanları': [
    '±0.01 V', '±0.1 V', '±1 V', '±0.01 A', '±0.1 A', 
    '±1 A', '±0.1%', '±0.5%', '±1%', 'Diğer'
  ],
  'Üretim Makineleri': [
    '±0.5%', '±1%', '±2%', '±5%', '±0.1 kN', '±1 kN', 'Diğer'
  ],
  'Kalite Kontrol Cihazları': [
    '±0.01 mm', '±0.02 mm', '±0.05 mm', '±0.1 mm', 
    '±0.2 mm', '±0.5 mm', 'Diğer'
  ],
  'Kaynak Ekipmanları': [
    '±1 A', '±5 A', '±10 A', '±0.5 V', '±1 V', '±2%', 'Diğer'
  ],
  'Elektrikli Cihazlar': [
    '±0.1 V', '±0.5 V', '±1 V', '±0.1 A', '±0.5 A', 
    '±1 A', '±0.5%', '±1%', 'Diğer'
  ],
  'Pnömatik Sistemler': [
    '±0.01 bar', '±0.05 bar', '±0.1 bar', '±0.2 bar', 
    '±0.5 bar', '±1%', '±2%', 'Diğer'
  ],
  'Hidrolik Sistemler': [
    '±0.1 bar', '±0.5 bar', '±1 bar', '±2 bar', 
    '±0.5%', '±1%', '±2%', 'Diğer'
  ],
  'Bilgisayar ve IT': [
    '±0.1%', '±0.5%', '±1%', '±1 bit', 'Diğer'
  ],
  'Güvenlik Ekipmanları': [
    '±1%', '±2%', '±5%', '±10 ppm', 'Diğer'
  ],
  'Çevre Ölçüm Cihazları': [
    '±0.1°C', '±0.5°C', '±1°C', '±2°C', '±2% RH', 
    '±5% RH', '±10 ppm', '±5%', 'Diğer'
  ],
  'Laboratuvar Ekipmanları': [
    '±0.1 mg', '±1 mg', '±0.01 g', '±0.1 g', 
    '±0.1°C', '±0.5°C', '±0.01 pH', 'Diğer'
  ],
  'Diğer': ['Diğer']
};

// Üretici firmaları (kayıt eklenebilir)
const getManufacturers = (): string[] => {
  const stored = localStorage.getItem('manufacturers_list');
  if (stored) {
    return JSON.parse(stored);
  }
  
  const defaultManufacturers = [
    'Mitutoyo', 'Starrett', 'Tesa', 'Mahr', 'Zeiss', 'Fluke', 'Keysight',
    'Yokogawa', 'Endress+Hauser', 'Siemens', 'Bosch', 'Festo', 'SMC',
    'Parker', 'Rexroth', 'Danfoss', 'Schneider Electric', 'ABB', 'WIKA',
    'Kimo', 'Testo', 'Omega', 'Honeywell', 'Emerson', 'Rosemount'
  ];
  
  localStorage.setItem('manufacturers_list', JSON.stringify(defaultManufacturers));
  return defaultManufacturers;
};

// Model listesi (üreticiye göre dinamik olabilir)
const getModels = (): string[] => {
  const stored = localStorage.getItem('models_list');
  if (stored) {
    return JSON.parse(stored);
  }
  return []; // Boş başlat, kullanıcı ekleyecek
};

// Kalibrasyon laboratuvarları (kayıt eklenebilir/silinebilir)
const getCalibrationCompanies = (): string[] => {
  const stored = localStorage.getItem('calibration_companies_list');
  if (stored) {
    return JSON.parse(stored);
  }
  
  const defaultCompanies = [
    'TÜBITAK UME',
    'TSE Kalibrasyon Laboratuvarı',
    'TURKAK Akredite Laboratuvar',
    'Bosch Kalibrasyon',
    'Siemens Kalibrasyon',
    'Mitutoyo Kalibrasyon',
    'Fluke Kalibrasyon',
    'Mettler Toledo Kalibrasyon',
    'Sartorius Kalibrasyon',
    'Endress+Hauser Kalibrasyon',
    'Testo Kalibrasyon',
    'Yokogawa Kalibrasyon',
    'Omega Kalibrasyon',
    'Kimo Kalibrasyon',
    'WIKA Kalibrasyon'
  ];
  
  localStorage.setItem('calibration_companies_list', JSON.stringify(defaultCompanies));
  return defaultCompanies;
};

// Styled Components
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
}));

const EquipmentCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
  border: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 28px rgba(0, 0, 0, 0.15)`,
    borderColor: theme.palette.primary.main,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const StatusChip = styled(Chip)<{ statustype: string }>(({ theme, statustype }) => {
  const getStatusColor = () => {
    switch (statustype) {
      case 'valid':
      case 'active':
      case 'good':
      case 'pass':
        return { bg: theme.palette.success.main, color: theme.palette.success.contrastText };
      case 'due':
      case 'pending':
        return { bg: theme.palette.warning.main, color: theme.palette.warning.contrastText };
      case 'overdue':
      case 'invalid':
      case 'fail':
      case 'critical':
        return { bg: theme.palette.error.main, color: theme.palette.error.contrastText };
      case 'inactive':
      case 'maintenance':
        return { bg: theme.palette.grey[500], color: theme.palette.grey[50] };
      default:
        return { bg: theme.palette.primary.main, color: theme.palette.primary.contrastText };
    }
  };

  const colors = getStatusColor();
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 600,
    '& .MuiChip-icon': {
      color: colors.color,
    },
  };
});

// 🎯 BALANCED STABLE SEARCH INPUT - Tıklanabilir ve focus korumalı
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
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isAliveRef = useRef(true);
  const lastUserActionRef = useRef(Date.now());
  const focusProtectionRef = useRef<NodeJS.Timeout | null>(null);
  
  // 🎯 BALANCED FOCUS PROTECTION - Hem tıklanabilir hem korumalı
  useEffect(() => {
    let focusInterval: NodeJS.Timeout;
    
    const balancedFocusProtection = () => {
      if (!isAliveRef.current || !inputRef.current) return;
      
      const input = inputRef.current;
      
      // Focus kaybolmuşsa geri al - ZAman sınırı olmadan
      if (document.activeElement !== input) {
        // Sadece başka bir input'a focus olunmamışsa
        const activeElement = document.activeElement;
        if (!activeElement || activeElement.tagName !== 'INPUT') {
          try {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
          } catch (e) {
            // Silent fail
          }
        }
      }
    };
    
    // Her 100ms kontrol et - daha yumuşak
    focusInterval = setInterval(balancedFocusProtection, 100);
    
    return () => {
      clearInterval(focusInterval);
    };
  }, []);
  
  // 🎯 SMART DOM EVENT HANDLING 
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    
    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const value = target.value;
      
      lastUserActionRef.current = Date.now();
      
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        if (isAliveRef.current) {
          onChange(value);
        }
      }, 200);
    };
    
    const handleFocus = () => {
      lastUserActionRef.current = Date.now();
    };
    
    const handleClick = (event: Event) => {
      lastUserActionRef.current = Date.now();
      // Normal click behavior'ı koru
    };
    
    const handleKeyDown = () => {
      lastUserActionRef.current = Date.now();
    };
    
    const handleBlur = (event: FocusEvent) => {
      // Sadece container dışına blur oluyorsa engelle
      const relatedTarget = event.relatedTarget as Element;
      if (!containerRef.current?.contains(relatedTarget)) {
        // 50ms bekle, zaman sınırı olmadan focus'u geri al
        setTimeout(() => {
          if (isAliveRef.current && input) {
            input.focus();
          }
        }, 50);
      }
    };
    
    // Event listener'ları ekle
    input.addEventListener('input', handleInput);
    input.addEventListener('focus', handleFocus);
    input.addEventListener('click', handleClick);
    input.addEventListener('keydown', handleKeyDown);
    input.addEventListener('blur', handleBlur);
    
    return () => {
      input.removeEventListener('input', handleInput);
      input.removeEventListener('focus', handleFocus);
      input.removeEventListener('click', handleClick);
      input.removeEventListener('keydown', handleKeyDown);
      input.removeEventListener('blur', handleBlur);
    };
  }, [onChange]);
  
  // 🎯 CONTAINER INTERACTION
  const handleContainerClick = useCallback((event: React.MouseEvent) => {
    // Sadece container'a tıklanırsa input'a focus ver
    if (event.target === containerRef.current && inputRef.current) {
      lastUserActionRef.current = Date.now();
      inputRef.current.focus();
    }
  }, []);
  
  // 🎯 CLEANUP
  useEffect(() => {
    isAliveRef.current = true;
    
    return () => {
      isAliveRef.current = false;
      if (focusProtectionRef.current) clearTimeout(focusProtectionRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      onClick={handleContainerClick}
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
}, () => true); // Memo lock

const EquipmentCalibrationManagement: React.FC = () => {
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
  const [activeTab, setActiveTab] = useState(0);
  const [expanded, setExpanded] = useState<string | false>('filters');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view' | 'calibration' | 'maintenance'>('create');
  const [dialogTitle, setDialogTitle] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    category: '',
    location: '',
    department: '',
    status: '',
    calibrationStatus: '',
    maintenanceStatus: '',
    responsiblePerson: '',
    dateRange: {
      start: '',
      end: ''
    },
    criticalOnly: false,
    overdueOnly: false
  });

  // Form state for new/edit equipment
  const [formData, setFormData] = useState<Partial<Equipment>>({
    equipmentCode: '',
    name: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    category: '',
    location: '',
    department: '',
    responsiblePersons: [],
    status: 'active',
    calibrationRequired: false,
    calibrationFrequency: 12,
    maintenanceRequired: true,
    maintenanceFrequency: 6,
    criticalEquipment: false,
    specifications: '',
    notes: ''
  });

  // Equipment data - localStorage'dan yüklenir
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => {
    const stored = localStorage.getItem('equipment_calibration_data');
    return stored ? JSON.parse(stored) : [];
  });

  // Personnel data
  const [personnelList, setPersonnelList] = useState<Personnel[]>(() => getPersonnelData());
  
  // Personnel management states
  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([]);
  const [openPersonnelDialog, setOpenPersonnelDialog] = useState(false);
  const [openPersonnelManagementDialog, setOpenPersonnelManagementDialog] = useState(false);
  const [newPersonnelData, setNewPersonnelData] = useState({
    sicilNo: '',
    name: '',
    department: '',
    position: ''
  });

  // Yeni eklenen state'ler - Dinamik yönetim için
  const [manufacturersList, setManufacturersList] = useState<string[]>(() => getManufacturers());
  const [modelsList, setModelsList] = useState<string[]>(() => getModels());
  const [calibrationCompaniesList, setCalibrationCompaniesList] = useState<string[]>(() => getCalibrationCompanies());
  
  // Dialog state'leri
  const [openManufacturerDialog, setOpenManufacturerDialog] = useState(false);
  const [openModelDialog, setOpenModelDialog] = useState(false);
  const [openCalibrationCompanyDialog, setOpenCalibrationCompanyDialog] = useState(false);
  
  // Yeni ekleme için input state'leri
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newCalibrationCompany, setNewCalibrationCompany] = useState('');

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const filteredEquipment = equipmentList.filter(equipment => {
      if (filters.searchTerm && !equipment.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !equipment.equipmentCode.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      if (filters.category && equipment.category !== filters.category) return false;
      if (filters.location && equipment.location !== filters.location) return false;
      if (filters.department && equipment.department !== filters.department) return false;
      if (filters.status && equipment.status !== filters.status) return false;
      if (filters.calibrationStatus && equipment.calibrationStatus !== filters.calibrationStatus) return false;
      if (filters.maintenanceStatus && equipment.maintenanceStatus !== filters.maintenanceStatus) return false;
      if (filters.responsiblePerson && !equipment.responsiblePersons.includes(filters.responsiblePerson)) return false;
      if (filters.criticalOnly && !equipment.criticalEquipment) return false;
      if (filters.overdueOnly && equipment.calibrationStatus !== 'overdue' && equipment.maintenanceStatus !== 'overdue') return false;
      return true;
    });

    const totalEquipment = filteredEquipment.length;
    const activeEquipment = filteredEquipment.filter(eq => eq.status === 'active').length;
    const criticalEquipment = filteredEquipment.filter(eq => eq.criticalEquipment).length;
    const calibrationDue = filteredEquipment.filter(eq => eq.calibrationStatus === 'due' || eq.calibrationStatus === 'overdue').length;
    const maintenanceDue = filteredEquipment.filter(eq => eq.maintenanceStatus === 'due' || eq.maintenanceStatus === 'overdue').length;

    // Status distribution for charts
    const statusDistribution = [
      { name: 'Aktif', value: filteredEquipment.filter(eq => eq.status === 'active').length, color: '#4caf50' },
      { name: 'Bakımda', value: filteredEquipment.filter(eq => eq.status === 'maintenance').length, color: '#ff9800' },
      { name: 'Kalibrasyonda', value: filteredEquipment.filter(eq => eq.status === 'calibration').length, color: '#2196f3' },
      { name: 'Devre Dışı', value: filteredEquipment.filter(eq => eq.status === 'out_of_service').length, color: '#f44336' },
    ].filter(item => item.value > 0);

    const calibrationStatusDistribution = [
      { name: 'Geçerli', value: filteredEquipment.filter(eq => eq.calibrationStatus === 'valid').length, color: '#4caf50' },
      { name: 'Vadesi Yaklaşan', value: filteredEquipment.filter(eq => eq.calibrationStatus === 'due').length, color: '#ff9800' },
      { name: 'Vadesi Geçen', value: filteredEquipment.filter(eq => eq.calibrationStatus === 'overdue').length, color: '#f44336' },
      { name: 'Geçersiz', value: filteredEquipment.filter(eq => eq.calibrationStatus === 'invalid').length, color: '#9c27b0' },
    ].filter(item => item.value > 0);

    const categoryDistribution = EQUIPMENT_CATEGORIES.map(category => ({
      name: category,
      value: filteredEquipment.filter(eq => eq.category === category).length,
      color: `hsl(${EQUIPMENT_CATEGORIES.indexOf(category) * 360 / EQUIPMENT_CATEGORIES.length}, 70%, 60%)`
    })).filter(item => item.value > 0);

    return {
      totalEquipment,
      activeEquipment,
      criticalEquipment,
      calibrationDue,
      maintenanceDue,
      statusDistribution,
      calibrationStatusDistribution,
      categoryDistribution,
      filteredEquipment
    };
  }, [equipmentList, filters]);

  const openCreateDialog = () => {
    setDialogMode('create');
    setDialogTitle('Yeni Ekipman Kaydı');
    setSelectedPersonnel([]);
    setFormData({
      equipmentCode: '',
      name: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      category: '',
      location: '',
      department: '',
      responsiblePersons: [],
      status: 'active',
      calibrationRequired: false,
      calibrationFrequency: 12,
      maintenanceRequired: true,
      maintenanceFrequency: 6,
      criticalEquipment: false,
      specifications: '',
      notes: ''
    });
    setActiveStep(0);
    setOpenDialog(true);
  };

  // ✅ İşlem butonları için fonksiyonlar eklendi
  const handleViewEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setDialogMode('view');
    setDialogTitle(`${equipment.name} - Detaylar`);
    setOpenDialog(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setDialogTitle(`${equipment.name} - Düzenle`);
    setSelectedPersonnel(equipment.responsiblePersons || []);
    setFormData({
      equipmentCode: equipment.equipmentCode,
      name: equipment.name,
      manufacturer: equipment.manufacturer,
      model: equipment.model,
      serialNumber: equipment.serialNumber,
      category: equipment.category,
      location: equipment.location,
      department: equipment.department,
      responsiblePersons: equipment.responsiblePersons,
      status: equipment.status,
      calibrationRequired: equipment.calibrationRequired,
      calibrationFrequency: equipment.calibrationFrequency,
      maintenanceRequired: equipment.maintenanceRequired,
      maintenanceFrequency: equipment.maintenanceFrequency,
      criticalEquipment: equipment.criticalEquipment,
      specifications: equipment.specifications,
      notes: equipment.notes
    });
    setDialogMode('edit');
    setActiveStep(0);
    setOpenDialog(true);
  };

  const handleCalibration = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setDialogMode('calibration');
    setDialogTitle(`Kalibrasyon İşlemi - ${equipment.name}`);
    setOpenDialog(true);
  };

  const handleMaintenance = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setDialogMode('maintenance');
    setDialogTitle(`Bakım İşlemi - ${equipment.name}`);
    setOpenDialog(true);
  };

  const handleDeleteEquipment = (equipment: Equipment) => {
    if (window.confirm(`"${equipment.name}" ekipmanını silmek istediğinize emin misiniz?`)) {
      setEquipmentList(prevList => prevList.filter(eq => eq.id !== equipment.id));
      // Success notification can be added here
      console.log(`${equipment.name} ekipmanı silindi`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
      case 'active':
      case 'good':
        return <CheckCircleIcon />;
      case 'due':
      case 'pending':
        return <WarningIcon />;
      case 'overdue':
      case 'invalid':
      case 'critical':
        return <ErrorIcon />;
      case 'maintenance':
        return <BuildIcon />;
      case 'calibration':
        return <ScienceIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getDaysUntilDue = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  // Yeni personel kaydetme fonksiyonu
  const handleSavePersonnel = () => {
    if (!newPersonnelData.sicilNo || !newPersonnelData.name || !newPersonnelData.department) {
      alert('Sicil No, Ad Soyad ve Departman alanları zorunludur!');
      return;
    }

    // Sicil numarası zaten var mı kontrol et
    if (personnelList.some(p => p.sicilNo === newPersonnelData.sicilNo)) {
      alert('Bu sicil numarası zaten kullanılıyor!');
      return;
    }

    const newPersonnel: Personnel = {
      id: `PER-${Date.now()}`,
      sicilNo: newPersonnelData.sicilNo,
      name: newPersonnelData.name,
      department: newPersonnelData.department,
      position: newPersonnelData.position,
      email: '',
      phone: '',
      isActive: true
    };

    // Personnel listesini güncelle
    const updatedPersonnelList = [...personnelList, newPersonnel];
    setPersonnelList(updatedPersonnelList);
    
    // LocalStorage'a kaydet
    localStorage.setItem('personnel_data', JSON.stringify(updatedPersonnelList));

    // Formu temizle ve dialog'u kapat
    setNewPersonnelData({
      sicilNo: '',
      name: '',
      department: '',
      position: ''
    });
    setOpenPersonnelDialog(false);

    // Başarı - sessiz ekleme
  };

  // Personel silme fonksiyonu
  const handleDeletePersonnel = (sicilNo: string) => {
    const updatedPersonnelList = personnelList.filter(p => p.sicilNo !== sicilNo);
    setPersonnelList(updatedPersonnelList);
    localStorage.setItem('personnel_data', JSON.stringify(updatedPersonnelList));
    
    // Eğer bu personel seçili personeller arasındaysa onu da kaldır
    setSelectedPersonnel(prev => prev.filter(s => s !== sicilNo));
  };

  // Yeni eklenen yönetim fonksiyonları
  const handleSaveManufacturer = () => {
    if (newManufacturer.trim()) {
      const updatedList = [...manufacturersList, newManufacturer.trim()];
      setManufacturersList(updatedList);
      localStorage.setItem('manufacturers_list', JSON.stringify(updatedList));
      setNewManufacturer('');
      setOpenManufacturerDialog(false);
    }
  };

  const handleSaveModel = () => {
    if (newModel.trim()) {
      const updatedList = [...modelsList, newModel.trim()];
      setModelsList(updatedList);
      localStorage.setItem('models_list', JSON.stringify(updatedList));
      setNewModel('');
      setOpenModelDialog(false);
    }
  };

  const handleSaveCalibrationCompany = () => {
    if (newCalibrationCompany.trim()) {
      const updatedList = [...calibrationCompaniesList, newCalibrationCompany.trim()];
      setCalibrationCompaniesList(updatedList);
      localStorage.setItem('calibration_companies_list', JSON.stringify(updatedList));
      setNewCalibrationCompany('');
      setOpenCalibrationCompanyDialog(false);
    }
  };

  const handleDeleteCalibrationCompany = (company: string) => {
    if (window.confirm(`${company} firmasını listeden çıkarmak istediğinize emin misiniz?`)) {
      const updatedList = calibrationCompaniesList.filter(c => c !== company);
      setCalibrationCompaniesList(updatedList);
      localStorage.setItem('calibration_companies_list', JSON.stringify(updatedList));
    }
  };

  // Form kaydetme fonksiyonu
  const handleSave = () => {
    const newEquipment: Equipment = {
      id: dialogMode === 'edit' ? selectedEquipment?.id || Date.now().toString() : Date.now().toString(),
      equipmentCode: formData.equipmentCode || '',
      name: formData.name || '',
      manufacturer: formData.manufacturer || '',
      model: formData.model || '',
      serialNumber: formData.serialNumber || '',
      category: formData.category || '',
      location: formData.location || '',
      department: formData.department || '',
      responsiblePersons: formData.responsiblePersonSicilNo ? [formData.responsiblePersonSicilNo] : [],
      purchaseDate: new Date().toISOString().split('T')[0],
      installationDate: new Date().toISOString().split('T')[0],
      warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      calibrationRequired: true,
      calibrationFrequency: formData.calibrationFrequency || 12,
      lastCalibrationDate: formData.lastCalibrationDate || new Date().toISOString().split('T')[0],
      nextCalibrationDate: formData.nextCalibrationDate || '',
      calibrationStatus: 'valid',
      maintenanceRequired: true,
      maintenanceFrequency: 6,
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      nextMaintenanceDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maintenanceStatus: 'good',
      criticalEquipment: formData.criticalEquipment || false,
      specifications: formData.specifications || '',
      operatingManual: '',
      notes: formData.notes || '',
      images: [],
      certificates: [],
      maintenanceRecords: [],
      // Yeni alanlar
      measurementRange: formData.measurementRange === 'Diğer' ? formData.customMeasurementRange : formData.measurementRange,
      measurementUncertainty: formData.measurementUncertainty === 'Diğer' ? formData.customMeasurementUncertainty : formData.measurementUncertainty,
      calibrationCompany: formData.calibrationCompany || '',
      lastCalibrationCertificateNumber: formData.lastCalibrationCertificateNumber || '',
      responsiblePersonName: formData.responsiblePersonName || '',
      responsiblePersonSicilNo: formData.responsiblePersonSicilNo || ''
    };

    if (dialogMode === 'edit') {
      // Güncelleme
      const updatedList = equipmentList.map(eq => eq.id === newEquipment.id ? newEquipment : eq);
      setEquipmentList(updatedList);
      localStorage.setItem('equipment_calibration_data', JSON.stringify(updatedList));
    } else {
      // Yeni ekleme
      const updatedList = [...equipmentList, newEquipment];
      setEquipmentList(updatedList);
      localStorage.setItem('equipment_calibration_data', JSON.stringify(updatedList));
    }

    // Dialog'u kapat ve formu temizle
    setOpenDialog(false);
    setFormData({
      equipmentCode: '',
      name: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      category: '',
      location: '',
      department: '',
      responsiblePersons: [],
      status: 'active',
      calibrationRequired: false,
      calibrationFrequency: 12,
      maintenanceRequired: true,
      maintenanceFrequency: 6,
      criticalEquipment: false,
      specifications: '',
      notes: ''
    });
    setSelectedPersonnel([]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          size="large"
        >
          Yeni Ekipman
        </Button>
      </Box>

      {/* TÜM MODÜL İÇİN GLOBAL FİLTRELER */}
      <StyledAccordion
        expanded={expanded === 'filters'}
        onChange={handleAccordionChange('filters')}
        sx={{ mb: 3 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon sx={{ color: '#ffffff' }} />
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>Filtreler ve Arama (Tüm Modül)</Typography>
            {Object.values(filters).some(v => v !== '' && !(typeof v === 'object' && !v.start && !v.end) && v !== false) && (
              <Badge color="primary" variant="dot" />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <UltimateStableSearchInput
                label="Ekipman Arama"
                placeholder="Ekipman adı veya kodu ile arayın..."
                defaultValue={filters.searchTerm}
                onChange={(value: string) => handleFilterChange('searchTerm', value)}
                fullWidth
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <MenuItem value="">Tüm Kategoriler</MenuItem>
                  {EQUIPMENT_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Lokasyon</InputLabel>
                <Select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                >
                  <MenuItem value="">Tüm Lokasyonlar</MenuItem>
                  {LOCATIONS.map((location) => (
                    <MenuItem key={location} value={location}>{location}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Departman</InputLabel>
                <Select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                >
                  <MenuItem value="">Tüm Departmanlar</MenuItem>
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel>Kalibrasyon Durumu</InputLabel>
                <Select
                  value={filters.calibrationStatus}
                  onChange={(e) => handleFilterChange('calibrationStatus', e.target.value)}
                >
                  <MenuItem value="">Tüm Durumlar</MenuItem>
                  <MenuItem value="valid">Geçerli</MenuItem>
                  <MenuItem value="due">Vadesi Yaklaşan</MenuItem>
                  <MenuItem value="overdue">Vadesi Geçen</MenuItem>
                  <MenuItem value="invalid">Geçersiz</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.criticalOnly}
                    onChange={(e) => handleFilterChange('criticalOnly', e.target.checked)}
                  />
                }
                label="Sadece Kritik Ekipmanlar"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.overdueOnly}
                    onChange={(e) => handleFilterChange('overdueOnly', e.target.checked)}
                  />
                }
                label="Sadece Vadesi Geçenler"
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={() => setFilters({
                  searchTerm: '',
                  category: '',
                  location: '',
                  department: '',
                  status: '',
                  calibrationStatus: '',
                  maintenanceStatus: '',
                  responsiblePerson: '',
                  dateRange: { start: '', end: '' },
                  criticalOnly: false,
                  overdueOnly: false
                })}
                sx={{ height: 56 }}
              >
                Filtreleri Temizle
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </StyledAccordion>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Dashboard" icon={<DashboardIcon />} />
        <Tab label="Ekipman Listesi" icon={<EngineeringIcon />} />
        <Tab label="Kalibrasyon Takibi" icon={<ScienceIcon />} />
        <Tab label="Bakım Takibi" icon={<BuildIcon />} />
        <Tab label="Planlar ve Uyarılar" icon={<ScheduleIcon />} />
        <Tab label="Raporlar" icon={<AssessmentIcon />} />
      </Tabs>

      {/* Dashboard Tab */}
      {activeTab === 0 && (
        <Box>

          {/* Özet Kartları */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: '1 1 240px', minWidth: '240px' }}>
              <EquipmentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="primary">
                        {metrics.totalEquipment}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Toplam Ekipman
                      </Typography>
                    </Box>
                    <EngineeringIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                </CardContent>
              </EquipmentCard>
            </Box>
            <Box sx={{ flex: '1 1 240px', minWidth: '240px' }}>
              <EquipmentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {metrics.activeEquipment}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aktif Ekipman
                      </Typography>
                    </Box>
                    <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
              </EquipmentCard>
            </Box>
            <Box sx={{ flex: '1 1 240px', minWidth: '240px' }}>
              <EquipmentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="error.main">
                        {metrics.criticalEquipment}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Kritik Ekipman
                      </Typography>
                    </Box>
                    <UrgentIcon sx={{ fontSize: 40, color: 'error.main' }} />
                  </Box>
                </CardContent>
              </EquipmentCard>
            </Box>
            <Box sx={{ flex: '1 1 240px', minWidth: '240px' }}>
              <EquipmentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {metrics.calibrationDue}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Kalibrasyon Gerekli
                      </Typography>
                    </Box>
                    <ScienceIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  </Box>
                </CardContent>
              </EquipmentCard>
            </Box>
            <Box sx={{ flex: '1 1 240px', minWidth: '240px' }}>
              <EquipmentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="info.main">
                        {metrics.maintenanceDue}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bakım Gerekli
                      </Typography>
                    </Box>
                    <BuildIcon sx={{ fontSize: 40, color: 'info.main' }} />
                  </Box>
                </CardContent>
              </EquipmentCard>
            </Box>
          </Box>

          {/* Grafikler */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Paper sx={{ p: 3, height: 400, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>Ekipman Durum Dağılımı</Typography>
                {metrics.statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={metrics.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} %${(percent * 100).toFixed(1)}`}
                        labelLine={false}
                      >
                        {metrics.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                    <Typography variant="body1" color="text.secondary">
                      Veri bulunamadı
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Paper sx={{ p: 3, height: 400, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>Kalibrasyon Durum Dağılımı</Typography>
                {metrics.calibrationStatusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.calibrationStatusDistribution}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis fontSize={11} />
                      <RechartsTooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {metrics.calibrationStatusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                    <Typography variant="body1" color="text.secondary">
                      Veri bulunamadı
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        </Box>
      )}

      {/* Ekipman Listesi Tab */}
      {activeTab === 1 && (
        <Box>
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              maxHeight: '70vh'
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '120px',
                      minWidth: '120px'
                    }}
                  >
                    Kod / Kritik
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '200px',
                      minWidth: '200px'
                    }}
                  >
                    Ekipman Bilgileri
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '140px',
                      minWidth: '140px'
                    }}
                  >
                    Lokasyon
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '140px',
                      minWidth: '140px'
                    }}
                  >
                    Zimmet / Sorumlu
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '180px',
                      minWidth: '180px'
                    }}
                  >
                    Ölçüm Aralığı / Belirsizlik
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '100px',
                      minWidth: '100px'
                    }}
                  >
                    Durum
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '150px',
                      minWidth: '150px'
                    }}
                  >
                    Kalibrasyon
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '150px',
                      minWidth: '150px'
                    }}
                  >
                    Bakım
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '12px 8px',
                      width: '160px',
                      minWidth: '160px'
                    }}
                  >
                    İşlemler
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {metrics.filteredEquipment.map((equipment, index) => (
                  <TableRow 
                    key={equipment.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? 'background.default' : 'grey.50',
                      '&:hover': {
                        backgroundColor: 'primary.50',
                        transform: 'scale(1.002)',
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
                      },
                      height: '64px'
                    }}
                  >
                    <TableCell sx={{ padding: '8px', borderLeft: equipment.criticalEquipment ? '4px solid #f44336' : '4px solid transparent' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                          {equipment.equipmentCode}
                        </Typography>
                        {equipment.criticalEquipment && (
                          <Chip 
                            label="KRİTİK" 
                            color="error" 
                            size="small" 
                            sx={{ 
                              height: '16px', 
                              fontSize: '0.6rem',
                              fontWeight: 600,
                              '& .MuiChip-label': { padding: '0 4px' }
                            }} 
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Tooltip title={equipment.name} placement="top">
                          <Typography 
                            variant="body2" 
                            fontWeight={500}
                            sx={{ 
                              fontSize: '0.75rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '180px'
                            }}
                          >
                            {equipment.name}
                          </Typography>
                        </Tooltip>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.65rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '180px'
                          }}
                        >
                          {equipment.manufacturer} {equipment.model}
                        </Typography>
                        <Chip 
                          label={equipment.category} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            height: '18px', 
                            fontSize: '0.6rem',
                            '& .MuiChip-label': { padding: '0 4px' }
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '120px'
                          }}
                        >
                          {equipment.location}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.65rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '120px'
                          }}
                        >
                          {equipment.department}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography 
                        variant="body2" 
                          fontWeight={600}
                        sx={{ 
                          fontSize: '0.75rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                            maxWidth: '120px',
                            color: 'primary.main'
                        }}
                      >
                          {equipment.responsiblePersonName || 'Belirtilmemiş'}
                      </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.65rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '120px'
                          }}
                        >
                          Sicil: {equipment.responsiblePersonSicilNo || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Tooltip title={equipment.measurementRange || 'Belirtilmemiş'} placement="top">
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.75rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '160px',
                              fontWeight: 500
                            }}
                          >
                            {equipment.measurementRange || 'Belirtilmemiş'}
                          </Typography>
                        </Tooltip>
                        <Typography 
                          variant="caption" 
                          color="warning.main"
                          sx={{ 
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '160px'
                          }}
                        >
                          ± {equipment.measurementUncertainty || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <StatusChip
                        label={
                          equipment.status === 'active' ? 'Aktif' :
                          equipment.status === 'maintenance' ? 'Bakımda' :
                          equipment.status === 'calibration' ? 'Kalibrasyon' :
                          equipment.status === 'inactive' ? 'Pasif' : 'Devre Dışı'
                        }
                        statustype={equipment.status}
                        size="small"
                        icon={getStatusIcon(equipment.status)}
                        sx={{ 
                          height: '24px',
                          fontSize: '0.65rem',
                          '& .MuiChip-label': { padding: '0 6px' },
                          '& .MuiChip-icon': { fontSize: '12px' }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <StatusChip
                          label={
                            equipment.calibrationStatus === 'valid' ? 'Geçerli' :
                            equipment.calibrationStatus === 'due' ? 'Yaklaşan' :
                            equipment.calibrationStatus === 'overdue' ? 'Geciken' : 'Geçersiz'
                          }
                          statustype={equipment.calibrationStatus}
                          size="small"
                          icon={getStatusIcon(equipment.calibrationStatus)}
                          sx={{ 
                            height: '20px',
                            fontSize: '0.6rem',
                            '& .MuiChip-label': { padding: '0 4px' },
                            '& .MuiChip-icon': { fontSize: '10px' }
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            fontSize: '0.6rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {formatDate(equipment.nextCalibrationDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <StatusChip
                          label={
                            equipment.maintenanceStatus === 'good' ? 'İyi' :
                            equipment.maintenanceStatus === 'due' ? 'Yaklaşan' :
                            equipment.maintenanceStatus === 'overdue' ? 'Geciken' : 'Kritik'
                          }
                          statustype={equipment.maintenanceStatus}
                          size="small"
                          icon={getStatusIcon(equipment.maintenanceStatus)}
                          sx={{ 
                            height: '20px',
                            fontSize: '0.6rem',
                            '& .MuiChip-label': { padding: '0 4px' },
                            '& .MuiChip-icon': { fontSize: '10px' }
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            fontSize: '0.6rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {formatDate(equipment.nextMaintenanceDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '8px' }}>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Tooltip title="Görüntüle">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewEquipment(equipment)}
                            sx={{ 
                              padding: '4px',
                              '&:hover': { 
                                backgroundColor: 'primary.50',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <ViewIcon sx={{ fontSize: '16px' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Düzenle">
                          <IconButton 
                            size="small"
                            onClick={() => handleEditEquipment(equipment)}
                            sx={{ 
                              padding: '4px',
                              '&:hover': { 
                                backgroundColor: 'warning.50',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <EditIcon sx={{ fontSize: '16px' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Kalibrasyon">
                          <IconButton 
                            size="small"
                            onClick={() => handleCalibration(equipment)}
                            sx={{ 
                              padding: '4px',
                              '&:hover': { 
                                backgroundColor: 'success.50',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <ScienceIcon sx={{ fontSize: '16px' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Bakım">
                          <IconButton 
                            size="small"
                            onClick={() => handleMaintenance(equipment)}
                            sx={{ 
                              padding: '4px',
                              '&:hover': { 
                                backgroundColor: 'info.50',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <BuildIcon sx={{ fontSize: '16px' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton 
                            size="small"
                            onClick={() => handleDeleteEquipment(equipment)}
                            sx={{ 
                              padding: '4px',
                              '&:hover': { 
                                backgroundColor: 'error.50',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: '16px', color: 'error.main' }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {metrics.filteredEquipment.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography>
                Seçilen kriterlere uygun ekipman bulunamadı.
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {/* Kalibrasyon Takibi Tab */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>Kalibrasyon Takip Sistemi</Typography>
          


          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Yaklaşan Kalibrasyonlar */}
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="warning" />
                  Yaklaşan Kalibrasyonlar
                </Typography>
                <List>
                  {metrics.filteredEquipment
                    .filter(eq => eq.calibrationStatus === 'due')
                    .map((equipment) => (
                    <ListItem key={equipment.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <ScienceIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={equipment.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Kod: {equipment.equipmentCode}
                            </Typography>
                            <Typography variant="body2" color="warning.main">
                              Tarih: {formatDate(equipment.nextCalibrationDate)} 
                              ({getDaysUntilDue(equipment.nextCalibrationDate)} gün kaldı)
                            </Typography>
                          </Box>
                        }
                      />
                      <Button variant="outlined" size="small" startIcon={<ScienceIcon />}>
                        Kalibrasyon Planla
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>

            {/* Vadesi Geçen Kalibrasyonlar */}
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ErrorIcon color="error" />
                  Vadesi Geçen Kalibrasyonlar
                </Typography>
                <List>
                  {metrics.filteredEquipment
                    .filter(eq => eq.calibrationStatus === 'overdue')
                    .map((equipment) => (
                    <ListItem key={equipment.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <ErrorIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={equipment.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Kod: {equipment.equipmentCode}
                            </Typography>
                            <Typography variant="body2" color="error.main">
                              Vadesi: {formatDate(equipment.nextCalibrationDate)} 
                              ({Math.abs(getDaysUntilDue(equipment.nextCalibrationDate))} gün geçmiş)
                            </Typography>
                          </Box>
                        }
                      />
                      <Button variant="contained" color="error" size="small" startIcon={<BlockIcon />}>
                        İzlemeye Al
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          </Box>
        </Box>
      )}

      {/* Bakım Takibi Tab */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h5" gutterBottom>Bakım Takip Sistemi</Typography>
          


          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Yaklaşan Bakımlar */}
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="warning" />
                  Yaklaşan Bakımlar
                </Typography>
                <List>
                  {metrics.filteredEquipment
                    .filter(eq => eq.maintenanceStatus === 'due')
                    .map((equipment) => (
                    <ListItem key={equipment.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <BuildIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={equipment.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Kod: {equipment.equipmentCode}
                            </Typography>
                            <Typography variant="body2" color="warning.main">
                              Tarih: {formatDate(equipment.nextMaintenanceDate)} 
                              ({getDaysUntilDue(equipment.nextMaintenanceDate)} gün kaldı)
                            </Typography>
                          </Box>
                        }
                      />
                      <Button variant="outlined" size="small" startIcon={<BuildIcon />}>
                        Bakım Planla
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>

            {/* Vadesi Geçen Bakımlar */}
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ErrorIcon color="error" />
                  Vadesi Geçen Bakımlar
                </Typography>
                <List>
                  {metrics.filteredEquipment
                    .filter(eq => eq.maintenanceStatus === 'overdue')
                    .map((equipment) => (
                    <ListItem key={equipment.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <ErrorIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={equipment.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Kod: {equipment.equipmentCode}
                            </Typography>
                            <Typography variant="body2" color="error.main">
                              Vadesi: {formatDate(equipment.nextMaintenanceDate)} 
                              ({Math.abs(getDaysUntilDue(equipment.nextMaintenanceDate))} gün geçmiş)
                            </Typography>
                          </Box>
                        }
                      />
                      <Button variant="contained" color="error" size="small" startIcon={<UrgentIcon />}>
                        Acil Bakım
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          </Box>
        </Box>
      )}

      {/* Planlar ve Uyarılar Tab */}
      {activeTab === 4 && (
        <Box>
          <Typography variant="h5" gutterBottom>Planlar ve Uyarı Sistemi</Typography>
          
          <Box>
            {/* Uyarı Paneli */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsIcon color="primary" />
                Otomatik Uyarı Sistemi
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {metrics.calibrationDue > 0 && (
                  <Alert severity="warning" sx={{ flex: '1 1 300px' }}>
                    <Typography variant="body2">
                      <strong>{metrics.calibrationDue}</strong> ekipmanın kalibrasyonu yaklaşıyor!
                    </Typography>
                  </Alert>
                )}
                {metrics.maintenanceDue > 0 && (
                  <Alert severity="info" sx={{ flex: '1 1 300px' }}>
                    <Typography variant="body2">
                      <strong>{metrics.maintenanceDue}</strong> ekipmanın bakımı yaklaşıyor!
                    </Typography>
                  </Alert>
                )}
                {metrics.filteredEquipment.filter(eq => eq.calibrationStatus === 'overdue').length > 0 && (
                  <Alert severity="error" sx={{ flex: '1 1 300px' }}>
                    <Typography variant="body2">
                      <strong>{metrics.filteredEquipment.filter(eq => eq.calibrationStatus === 'overdue').length}</strong> ekipmanın kalibrasyon vadesi geçmiş!
                    </Typography>
                  </Alert>
                )}
              </Box>
            </Paper>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {/* Aylık Plan */}
              <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="primary" />
                    Bu Ay Planlanan İşlemler
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <ScienceIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${metrics.calibrationDue} Kalibrasyon İşlemi`}
                        secondary={`${metrics.calibrationDue > 0 ? 'Vadesi yaklaşan ekipmanlar' : 'Planlanan kalibrasyon yok'}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BuildIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${metrics.maintenanceDue} Bakım İşlemi`}
                        secondary={`${metrics.maintenanceDue > 0 ? 'Vadesi yaklaşan bakımlar' : 'Planlanan bakım yok'}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ChecklistIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${metrics.totalEquipment} Toplam Ekipman`}
                        secondary={`${metrics.activeEquipment} aktif ekipman takip ediliyor`}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>

              {/* Durum Özeti */}
              <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon color="secondary" />
                    Durum Özeti
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Kalibrasyon Durumu"
                        secondary={`${metrics.filteredEquipment.filter(eq => eq.calibrationStatus === 'valid').length} geçerli, ${metrics.filteredEquipment.filter(eq => eq.calibrationStatus === 'due').length} vadesi yakın, ${metrics.filteredEquipment.filter(eq => eq.calibrationStatus === 'overdue').length} vadesi geçmiş`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Bakım Durumu"
                        secondary={`${metrics.filteredEquipment.filter(eq => eq.maintenanceStatus === 'good').length} iyi durumda, ${metrics.filteredEquipment.filter(eq => eq.maintenanceStatus === 'due').length} bakım gerekli, ${metrics.filteredEquipment.filter(eq => eq.maintenanceStatus === 'critical').length} kritik`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Kritik Ekipmanlar"
                        secondary={`${metrics.filteredEquipment.filter(eq => eq.criticalEquipment).length} kritik ekipman takip ediliyor`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Lokasyon Dağılımı"
                        secondary={`${new Set(metrics.filteredEquipment.map(eq => eq.location)).size} farklı lokasyonda ekipman`}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Raporlar Tab */}
      {activeTab === 5 && (
        <Box>
          <Typography variant="h5" gutterBottom>Raporlar ve Analizler</Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Standart Raporlar</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PdfIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Kalibrasyon Durum Raporu"
                      secondary="Tüm ekipmanların kalibrasyon durumu"
                    />
                    <Button variant="outlined" size="small">
                      PDF İndir
                    </Button>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ExcelIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Ekipman Envanteri"
                      secondary="Detaylı ekipman listesi ve özellikleri"
                    />
                    <Button variant="outlined" size="small">
                      Excel İndir
                    </Button>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AssessmentIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Maliyet Analizi"
                      secondary="Aylık ve yıllık maliyet raporları"
                    />
                    <Button variant="outlined" size="small">
                      Görüntüle
                    </Button>
                  </ListItem>
                </List>
              </Paper>
            </Box>
 
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>ISO Uyumluluk Raporları</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <VerifiedIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="ISO 9001:2015 Uyumluluk"
                      secondary="Madde 7.1.5 gereklilikleri"
                    />
                    <Button variant="outlined" size="small">
                      PDF İndir
                    </Button>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CertificateIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="ISO 10012 Uyumluluk"
                      secondary="Ölçüm yönetim sistemi gereklilikleri"
                    />
                    <Button variant="outlined" size="small">
                      PDF İndir
                    </Button>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="İzlenebilirlik Raporu"
                      secondary="Kalibrasyon zinciri ve izlenebilirlik"
                    />
                    <Button variant="outlined" size="small">
                      PDF İndir
                    </Button>
                  </ListItem>
                </List>
              </Paper>
            </Box>
          </Box>
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xl" fullWidth>
        <DialogTitle>
          {dialogTitle || (dialogMode === 'create' ? 'Yeni Ekipman Ekle' :
           dialogMode === 'edit' ? 'Ekipman Düzenle' :
           dialogMode === 'calibration' ? 'Kalibrasyon Kaydı' :
           dialogMode === 'maintenance' ? 'Bakım Kaydı' : 'Ekipman Detayları')}
        </DialogTitle>
        <DialogContent>
          {dialogMode === 'create' || dialogMode === 'edit' ? (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {/* Temel Bilgiler */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                        <TextField
                          fullWidth
                          label="Ekipman Kodu *"
                          value={formData.equipmentCode || ''}
                          onChange={(e) => setFormData({...formData, equipmentCode: e.target.value})}
                          required
                        />
                        <TextField
                          fullWidth
                          label="Cihazın Adı *"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </Box>
                                            {/* Üretici ve Model Satırı */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2, alignItems: 'start' }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
                          <FormControl fullWidth sx={{ flex: 1 }}>
                            <InputLabel>Üretici</InputLabel>
                            <Select
                              value={formData.manufacturer || ''}
                              onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                              sx={{ height: 56 }}
                            >
                              {manufacturersList.map((manufacturer) => (
                                <MenuItem key={manufacturer} value={manufacturer}>{manufacturer}</MenuItem>
                              ))}
                              <MenuItem value="Diğer">Diğer</MenuItem>
                            </Select>
                          </FormControl>
                          <Button 
                            variant="outlined" 
                            onClick={() => setOpenManufacturerDialog(true)}
                            sx={{ minWidth: 50, height: 56 }}
                            title="Yeni Üretici Ekle"
                          >
                            +
                          </Button>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
                          <FormControl fullWidth sx={{ flex: 1 }}>
                            <InputLabel>Model</InputLabel>
                            <Select
                              value={formData.model || ''}
                              onChange={(e) => setFormData({...formData, model: e.target.value})}
                              sx={{ height: 56 }}
                            >
                              {modelsList.map((model) => (
                                <MenuItem key={model} value={model}>{model}</MenuItem>
                              ))}
                              <MenuItem value="Diğer">Diğer</MenuItem>
                            </Select>
                          </FormControl>
                          <Button 
                            variant="outlined" 
                            onClick={() => setOpenModelDialog(true)}
                            sx={{ minWidth: 50, height: 56 }}
                            title="Yeni Model Ekle"
                          >
                            +
                          </Button>
                        </Box>
                      </Box>
                      
                      {/* Seri Numarası */}
                      <Box sx={{ mb: 2 }}>
                        <TextField
                          fullWidth
                          label="Cihaz Seri Numarası *"
                          value={formData.serialNumber || ''}
                          onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                          required
                        />
                      </Box>
                      {/* Kategori, Lokasyon, Departman */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                        <FormControl fullWidth required>
                          <InputLabel>Kategori</InputLabel>
                          <Select
                            value={formData.category || ''}
                            onChange={(e) => {
                              const newCategory = e.target.value as string;
                              setFormData({
                                ...formData, 
                                category: newCategory,
                                // Kategori değiştiğinde mevcut ölçüm değerlerini temizle
                                measurementRange: '',
                                measurementUncertainty: ''
                              });
                            }}
                          >
                            {EQUIPMENT_CATEGORIES.map((category) => (
                              <MenuItem key={category} value={category}>{category}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        <FormControl fullWidth required>
                          <InputLabel>Lokasyon</InputLabel>
                          <Select
                            value={formData.location || ''}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                          >
                            {LOCATIONS.map((location) => (
                              <MenuItem key={location} value={location}>{location}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        <FormControl fullWidth required>
                          <InputLabel>Departman</InputLabel>
                          <Select
                            value={formData.department || ''}
                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                          >
                            {DEPARTMENTS.map((dept) => (
                              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                      {/* Zimmet Bilgileri */}
                      <Box sx={{ mt: 4, p: 3, border: '2px solid', borderColor: 'primary.main', borderRadius: 2, bgcolor: 'primary.50' }}>
                        <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                          Zimmet Bilgileri
                        </Typography>
                        
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, mb: 2 }}>
                                                    <FormControl fullWidth required>
                            <InputLabel>Sorumlu Personel</InputLabel>
                            <Select
                              value={formData.responsiblePersonSicilNo || ''}
                              onChange={(e) => {
                                const sicilNo = e.target.value as string;
                                const person = personnelList.find(p => p.sicilNo === sicilNo);
                                setFormData({
                                  ...formData,
                                  responsiblePersonSicilNo: sicilNo,
                                  responsiblePersonName: person?.name || ''
                                });
                              }}
                            >
                              {personnelList
                                .filter(p => p.isActive)
                                .map((person) => (
                                  <MenuItem key={person.sicilNo} value={person.sicilNo}>
                                    {person.name} ({person.sicilNo}) - {person.department}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                          
                            <Button
                              variant="contained"
                              onClick={() => setOpenPersonnelDialog(true)}
                            sx={{ height: 56 }}
                              startIcon={<PersonAddIcon />}
                            >
                            Yeni Personel
                            </Button>
                          </Box>
                        
                        {formData.responsiblePersonName && (
                          <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Seçilen Personel: <strong>{formData.responsiblePersonName}</strong> (Sicil: {formData.responsiblePersonSicilNo})
                            </Typography>
                          </Box>
                        )}
                        </Box>

                      {/* Teknik Özellikler */}
                      <Box sx={{ mt: 4, p: 3, border: '2px solid', borderColor: 'success.main', borderRadius: 2, bgcolor: 'success.50' }}>
                        <Typography variant="h6" sx={{ mb: 3, color: 'success.main', fontWeight: 600 }}>
                          Cihazın Teknik Özellikleri
                        </Typography>
                        
                                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2, alignItems: 'start' }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
                            <FormControl fullWidth required sx={{ flex: 1 }}>
                              <InputLabel>Ölçüm Aralığı</InputLabel>
                              <Select
                                value={formData.measurementRange || ''}
                                onChange={(e) => setFormData({...formData, measurementRange: e.target.value})}
                                disabled={!formData.category}
                                sx={{ height: 56 }}
                              >
                                {formData.category && (MEASUREMENT_RANGES_BY_CATEGORY[formData.category] || MEASUREMENT_RANGES_BY_CATEGORY['Diğer']).map((range) => (
                                  <MenuItem key={range} value={range}>{range}</MenuItem>
                                ))}
                              </Select>
                              {!formData.category && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                  Önce kategori seçiniz
                                </Typography>
                              )}
                            </FormControl>
                            <Button 
                              variant="outlined" 
                              onClick={() => {
                                const newRange = prompt('Yeni ölçüm aralığı giriniz (örn: 0-750 mm):');
                                if (newRange) {
                                  const category = formData.category || 'Diğer';
                                  MEASUREMENT_RANGES_BY_CATEGORY[category] = [...(MEASUREMENT_RANGES_BY_CATEGORY[category] || []), newRange.trim()];
                                }
                              }}
                              sx={{ minWidth: 50, height: 56 }}
                              title="Yeni Ölçüm Aralığı Ekle"
                              disabled={!formData.category}
                            >
                              +
                            </Button>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
                            <FormControl fullWidth required sx={{ flex: 1 }}>
                              <InputLabel>Ölçüm Belirsizliği</InputLabel>
                              <Select
                                value={formData.measurementUncertainty || ''}
                                onChange={(e) => setFormData({...formData, measurementUncertainty: e.target.value})}
                                disabled={!formData.category}
                                sx={{ height: 56 }}
                              >
                                {formData.category && (MEASUREMENT_UNCERTAINTIES_BY_CATEGORY[formData.category] || MEASUREMENT_UNCERTAINTIES_BY_CATEGORY['Diğer']).map((uncertainty) => (
                                  <MenuItem key={uncertainty} value={uncertainty}>{uncertainty}</MenuItem>
                                ))}
                              </Select>
                              {!formData.category && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                  Önce kategori seçiniz
                                </Typography>
                              )}
                            </FormControl>
                            <Button 
                              variant="outlined" 
                              onClick={() => {
                                const newUncertainty = prompt('Yeni ölçüm belirsizliği giriniz (örn: ±0.03 mm):');
                                if (newUncertainty) {
                                  const category = formData.category || 'Diğer';
                                  MEASUREMENT_UNCERTAINTIES_BY_CATEGORY[category] = [...(MEASUREMENT_UNCERTAINTIES_BY_CATEGORY[category] || []), newUncertainty.trim()];
                                }
                              }}
                              sx={{ minWidth: 50, height: 56 }}
                              title="Yeni Ölçüm Belirsizliği Ekle"
                              disabled={!formData.category}
                            >
                              +
                            </Button>
                          </Box>
                        </Box>
                          
                        {/* Diğer seçeneği için özel input alanları */}
                        {(formData.measurementRange === 'Diğer' || formData.measurementUncertainty === 'Diğer') && (
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                            {formData.measurementRange === 'Diğer' && (
                              <TextField
                                fullWidth
                                label="Özel Ölçüm Aralığı *"
                                value={formData.customMeasurementRange || ''}
                                onChange={(e) => setFormData({...formData, customMeasurementRange: e.target.value})}
                                placeholder="Örn: 0-500 µm, -20°C / +80°C"
                                required
                              />
                            )}
                            
                            {formData.measurementUncertainty === 'Diğer' && (
                              <TextField
                                fullWidth
                                label="Özel Ölçüm Belirsizliği *"
                                value={formData.customMeasurementUncertainty || ''}
                                onChange={(e) => setFormData({...formData, customMeasurementUncertainty: e.target.value})}
                                placeholder="Örn: ±0.005 mm, ±0.15% rdg"
                                required
                              />
                            )}
                          </Box>
                        )}
                        
                        {/* Detaylı Teknik Özellikler */}
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            fullWidth
                            label="Detaylı Teknik Özellikler"
                            multiline
                            rows={3}
                            value={formData.specifications || ''}
                            onChange={(e) => setFormData({...formData, specifications: e.target.value})}
                            placeholder="Cihazın tüm teknik özelliklerini detaylı şekilde giriniz..."
                          />
                        </Box>
                      </Box>

                      {/* Kalibrasyon Bilgileri */}
                      <Box sx={{ mt: 4, p: 3, border: '2px solid', borderColor: 'warning.main', borderRadius: 2, bgcolor: 'warning.50' }}>
                        <Typography variant="h6" sx={{ mb: 3, color: 'warning.main', fontWeight: 600 }}>
                          Kalibrasyon Bilgileri
                              </Typography>
                        
                        {/* Kalibrasyon Tarihleri */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                          <TextField
                            fullWidth
                            label="En Son Kalibre Edildiği Tarih"
                            type="date"
                            value={formData.lastCalibrationDate || new Date().toISOString().split('T')[0]}
                            onChange={(e) => setFormData({...formData, lastCalibrationDate: e.target.value})}
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            fullWidth
                            label="Kalibrasyon Periyodu (Ay) *"
                            type="number"
                            value={formData.calibrationFrequency || 12}
                            onChange={(e) => {
                              const months = parseInt(e.target.value) || 12;
                              const nextDate = new Date();
                              nextDate.setMonth(nextDate.getMonth() + months);
                              setFormData({
                                ...formData, 
                                calibrationFrequency: months,
                                nextCalibrationDate: nextDate.toISOString().split('T')[0]
                              });
                            }}
                            required
                            inputProps={{ min: 1, max: 60 }}
                            helperText="Kaç ayda bir kalibre edilecek"
                          />
                            </Box>
                        
                        {/* Hedef Tarih ve Laboratuvar */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                          <TextField
                            fullWidth
                            label="Bir Sonraki Hedef Kalibre Tarihi"
                            type="date"
                            value={formData.nextCalibrationDate || ''}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                              readOnly: true,
                            }}
                            helperText="Otomatik olarak hesaplanır"
                          />
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <FormControl fullWidth required>
                              <InputLabel>Kalibrasyon Laboratuvarı</InputLabel>
                              <Select
                                value={formData.calibrationCompany || ''}
                                onChange={(e) => setFormData({...formData, calibrationCompany: e.target.value})}
                              >
                                {calibrationCompaniesList.map((company) => (
                                  <MenuItem key={company} value={company}>{company}</MenuItem>
                                ))}
                                <MenuItem value="Diğer">Diğer</MenuItem>
                              </Select>
                            </FormControl>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => setOpenCalibrationCompanyDialog(true)}
                              sx={{ minWidth: 50, height: 56 }}
                              title="Yeni Kalibrasyon Firması Ekle"
                            >
                              +
                            </Button>
                            </Box>
                        </Box>
                        
                        {/* Sertifika Numarası */}
                        <Box sx={{ mb: 3 }}>
                          <TextField
                            fullWidth
                            label="Kalibrasyon Sertifika Numarası"
                            value={formData.lastCalibrationCertificateNumber || ''}
                            onChange={(e) => setFormData({...formData, lastCalibrationCertificateNumber: e.target.value})}
                            placeholder="Örn: CAL-2024-001234"
                            helperText="En son kalibrasyon sertifika numarası"
                          />
                      </Box>
                      </Box>
                      
                      {/* Kaydet Buton */}
                      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={() => setOpenDialog(false)}
                          sx={{ px: 4, py: 1.5 }}
                        >
                          İptal
                        </Button>
                        <Button
                          variant="contained"
                          size="large"
                          onClick={handleSave}
                          disabled={
                            !formData.equipmentCode || 
                            !formData.name || 
                            !formData.category ||
                            !formData.serialNumber ||
                            !formData.responsiblePersonSicilNo ||
                            !formData.measurementRange ||
                            !formData.measurementUncertainty ||
                            !formData.calibrationCompany ||
                            (formData.measurementRange === 'Diğer' && !formData.customMeasurementRange) ||
                            (formData.measurementUncertainty === 'Diğer' && !formData.customMeasurementUncertainty)
                          }
                          sx={{ px: 4, py: 1.5 }}
                        >
                          Ekipmanı Kaydet
                        </Button>
                      </Box>
                </Box>
          ) : dialogMode === 'view' ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mb: 3 }}>
                Ekipman Detayları - {selectedEquipment?.name}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Temel Bilgiler */}
                <Card sx={{ border: '2px solid', borderColor: 'primary.main', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}>
                      Temel Bilgiler
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Ekipman Kodu:</Typography>
                        <Typography variant="body1" fontWeight={500}>{selectedEquipment?.equipmentCode}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Cihaz Seri Numarası:</Typography>
                        <Typography variant="body1" fontWeight={500}>{selectedEquipment?.serialNumber}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Kategori:</Typography>
                        <Chip label={selectedEquipment?.category} color="primary" size="small" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Lokasyon:</Typography>
                        <Typography variant="body1">{selectedEquipment?.location}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Departman:</Typography>
                        <Typography variant="body1">{selectedEquipment?.department}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Durum:</Typography>
                        <Chip 
                          label={
                            selectedEquipment?.status === 'active' ? 'Aktif' :
                            selectedEquipment?.status === 'maintenance' ? 'Bakımda' :
                            selectedEquipment?.status === 'calibration' ? 'Kalibrasyon' :
                            selectedEquipment?.status === 'inactive' ? 'Pasif' : 'Devre Dışı'
                          }
                          color={selectedEquipment?.status === 'active' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Zimmet Bilgileri */}
                <Card sx={{ border: '2px solid', borderColor: 'success.main', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 600, mb: 2 }}>
                      Zimmet Bilgileri
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Zimmetlenecek Personelin Adı:</Typography>
                        <Typography variant="body1" fontWeight={600} color="primary.main">
                          {selectedEquipment?.responsiblePersonName || 'Belirtilmemiş'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Sicil Numarası:</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedEquipment?.responsiblePersonSicilNo || 'Belirtilmemiş'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Teknik Özellikler */}
                <Card sx={{ border: '2px solid', borderColor: 'info.main', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'info.main', fontWeight: 600, mb: 2 }}>
                      Cihazın Teknik Özellikleri
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Ölçüm Aralığı (Değer Aralığı):</Typography>
                        <Typography variant="body1" fontWeight={500} color="info.main">
                          {selectedEquipment?.measurementRange || 'Belirtilmemiş'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Ölçüm Belirsizliği:</Typography>
                        <Typography variant="body1" fontWeight={600} color="warning.main">
                          ± {selectedEquipment?.measurementUncertainty || 'Belirtilmemiş'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Detaylı Teknik Özellikler:</Typography>
                        <Typography variant="body2" sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          {selectedEquipment?.specifications || 'Belirtilmemiş'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Kalibrasyon Bilgileri */}
                <Card sx={{ border: '2px solid', borderColor: 'warning.main', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'warning.main', fontWeight: 600, mb: 2 }}>
                      Kalibrasyon Bilgileri
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Kalibrasyon Periyodu:</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedEquipment?.calibrationFrequency} Ay
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">En Son Kalibre Edildiği Tarih:</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatDate(selectedEquipment?.lastCalibrationDate || '')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Bir Sonraki Hedef Kalibre Tarihi:</Typography>
                        <Typography variant="body1" fontWeight={600} color="error.main">
                          {formatDate(selectedEquipment?.nextCalibrationDate || '')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Kalibrasyon Laboratuvarı:</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedEquipment?.calibrationCompany || 'Belirtilmemiş'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Kalibrasyon Sertifika Numarası:</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedEquipment?.lastCalibrationCertificateNumber || 'Belirtilmemiş'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Kalibrasyon Durumu:</Typography>
                        <Chip 
                          label={
                            selectedEquipment?.calibrationStatus === 'valid' ? 'Geçerli' :
                            selectedEquipment?.calibrationStatus === 'due' ? 'Yaklaşan' :
                            selectedEquipment?.calibrationStatus === 'overdue' ? 'Geciken' : 'Geçersiz'
                          }
                          color={
                            selectedEquipment?.calibrationStatus === 'valid' ? 'success' :
                            selectedEquipment?.calibrationStatus === 'due' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Notlar */}
                {selectedEquipment?.notes && (
                  <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <CardContent>
                                          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600, mb: 2 }}>
                      Notlar
                    </Typography>
                      <Typography variant="body2" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        {selectedEquipment.notes}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            </Box>
          ) : dialogMode === 'calibration' ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Kalibrasyon İşlemi - {selectedEquipment?.name}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Kalibrasyon Tarihi"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  fullWidth
                  label="Kalibratör Firma"
                  placeholder="Kalibrasyon yapan firma adı"
                />
                
                <TextField
                  fullWidth
                  label="Sertifika Numarası"
                  placeholder="Kalibrasyon sertifika numarası"
                />
                
                <TextField
                  fullWidth
                  label="Akreditasyon Numarası"
                  placeholder="Akreditasyon numarası"
                />
                
                <TextField
                  fullWidth
                  label="Kalibrasyon Standardı"
                  placeholder="Kullanılan kalibrasyon standardı"
                />
                
                <TextField
                  fullWidth
                  label="Ölçüm Belirsizliği"
                  placeholder="±0.02 mm"
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Sıcaklık (°C)"
                    type="number"
                    defaultValue={20}
                  />
                  <TextField
                    fullWidth
                    label="Nem (%)"
                    type="number"
                    defaultValue={50}
                  />
                </Box>
                
                <TextField
                  fullWidth
                  label="Kalibrasyon Sonucu"
                  multiline
                  rows={4}
                  placeholder="Kalibrasyon sonuçları ve ölçüm değerleri"
                />
                
                <FormControl fullWidth>
                  <InputLabel>Uygunluk Değerlendirmesi</InputLabel>
                  <Select defaultValue="pass">
                    <MenuItem value="pass">Uygun</MenuItem>
                    <MenuItem value="fail">Uygun Değil</MenuItem>
                    <MenuItem value="conditional">Şartlı Uygun</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Sonraki Kalibrasyon Tarihi"
                  type="date"
                  defaultValue={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  fullWidth
                  label="Notlar"
                  multiline
                  rows={3}
                  placeholder="Ek bilgiler ve özel notlar"
                />
              </Box>
            </Box>
          ) : dialogMode === 'maintenance' ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Bakım İşlemi - {selectedEquipment?.name}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Bakım Tarihi"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  InputLabelProps={{ shrink: true }}
                />
                
                <FormControl fullWidth>
                  <InputLabel>Bakım Türü</InputLabel>
                  <Select defaultValue="preventive">
                    <MenuItem value="preventive">Önleyici Bakım</MenuItem>
                    <MenuItem value="corrective">Düzeltici Bakım</MenuItem>
                    <MenuItem value="predictive">Öngörülü Bakım</MenuItem>
                    <MenuItem value="emergency">Acil Bakım</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="İş Emri Numarası"
                  placeholder="WO-2024-001"
                />
                
                <TextField
                  fullWidth
                  label="Bakım Yapan Kişi"
                  placeholder="Bakım teknisyeninin adı"
                />
                
                <TextField
                  fullWidth
                  label="Bakım Açıklaması"
                  multiline
                  rows={4}
                  placeholder="Yapılan bakım işlemlerinin detaylı açıklaması"
                />
                
                <TextField
                  fullWidth
                  label="Değiştirilen Parçalar"
                  multiline
                  rows={2}
                  placeholder="Değiştirilen parça listesi (her satıra bir parça)"
                />
                
                <TextField
                  fullWidth
                  label="Bakım Süresi (Saat)"
                  type="number"
                  defaultValue={2}
                />
                
                <FormControl fullWidth>
                  <InputLabel>Bakım Durumu</InputLabel>
                  <Select defaultValue="completed">
                    <MenuItem value="completed">Tamamlandı</MenuItem>
                    <MenuItem value="pending">Beklemede</MenuItem>
                    <MenuItem value="in_progress">Devam Ediyor</MenuItem>
                    <MenuItem value="cancelled">İptal Edildi</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Sonraki Bakım Tarihi"
                  type="date"
                  defaultValue={new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  fullWidth
                  label="Bakım Notları"
                  multiline
                  rows={3}
                  placeholder="Bakım sonrası gözlemler ve öneriler"
                />
              </Box>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" color="text.secondary">
                İçerik yakında eklenecek...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {dialogMode === 'view' ? 'Kapat' : 'İptal'}
          </Button>
          {(dialogMode === 'calibration' || dialogMode === 'maintenance') && (
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<SaveIcon />}
              onClick={() => {
                // Save calibration/maintenance record
                console.log(`${dialogMode} kaydedildi`);
                setOpenDialog(false);
              }}
            >
              Kaydet
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Yeni Personel Ekleme Dialog'u */}
      <Dialog 
        open={openPersonnelDialog} 
        onClose={() => setOpenPersonnelDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAddIcon color="primary" />
            Yeni Personel Ekle
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <TextField
              fullWidth
              label="Sicil Numarası *"
              value={newPersonnelData.sicilNo}
              onChange={(e) => setNewPersonnelData({...newPersonnelData, sicilNo: e.target.value})}
              placeholder="001, 002, 003..."
              inputProps={{ maxLength: 10 }}
            />
            
            <TextField
              fullWidth
              label="Ad Soyad *"
              value={newPersonnelData.name}
              onChange={(e) => setNewPersonnelData({...newPersonnelData, name: e.target.value})}
              placeholder="Ahmet YILMAZ"
            />
            
            <FormControl fullWidth>
              <InputLabel>Departman *</InputLabel>
              <Select
                value={newPersonnelData.department}
                onChange={(e) => setNewPersonnelData({...newPersonnelData, department: e.target.value})}
              >
                {DEPARTMENTS.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Pozisyon"
              value={newPersonnelData.position}
              onChange={(e) => setNewPersonnelData({...newPersonnelData, position: e.target.value})}
              placeholder="Kalite Teknisyeni, Makine Operatörü..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPersonnelDialog(false)}>
            İptal
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSavePersonnel}
            startIcon={<SaveIcon />}
          >
            Personel Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Personel Yönetimi Dialog'u */}
      <Dialog 
        open={openPersonnelManagementDialog} 
        onClose={() => setOpenPersonnelManagementDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon color="primary" />
            Personel Yönetimi
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {personnelList.length === 0 ? (
              <Box sx={{ 
                p: 4, 
                textAlign: 'center', 
                bgcolor: 'grey.50', 
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'grey.300'
              }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Henüz personel bulunmuyor
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  "Yeni Personel Ekle" butonunu kullanarak personel ekleyebilirsiniz.
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Kayıtlı Personeller ({personnelList.length})
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {personnelList.map((person) => (
                    <Paper key={person.sicilNo} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {person.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sicil: {person.sicilNo} • {person.department} • {person.position}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={selectedPersonnel.includes(person.sicilNo) ? "Seçili" : "Seçili Değil"}
                          color={selectedPersonnel.includes(person.sicilNo) ? "success" : "default"}
                          size="small"
                        />
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeletePersonnel(person.sicilNo)}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPersonnelManagementDialog(false)}>
            Kapat
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setOpenPersonnelManagementDialog(false);
              setOpenPersonnelDialog(true);
            }}
            startIcon={<PersonAddIcon />}
          >
            Yeni Personel Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Üretici Ekleme Dialogi */}
      <Dialog open={openManufacturerDialog} onClose={() => setOpenManufacturerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Üretici Ekle</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Üretici Adı"
            value={newManufacturer}
            onChange={(e) => setNewManufacturer(e.target.value)}
            margin="dense"
            placeholder="Örn: Mitutoyo, Starrett, Tesa..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenManufacturerDialog(false)}>İptal</Button>
          <Button 
            onClick={handleSaveManufacturer} 
            variant="contained"
            disabled={!newManufacturer.trim()}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Model Ekleme Dialogi */}
      <Dialog open={openModelDialog} onClose={() => setOpenModelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Model Ekle</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Model Adı"
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
            margin="dense"
            placeholder="Örn: CD-15APX, 799-1234, HD-2000..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModelDialog(false)}>İptal</Button>
          <Button 
            onClick={handleSaveModel} 
            variant="contained"
            disabled={!newModel.trim()}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Kalibrasyon Firması Ekleme/Yönetme Dialogi */}
      <Dialog open={openCalibrationCompanyDialog} onClose={() => setOpenCalibrationCompanyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Kalibrasyon Laboratuvarları Yönetimi</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Yeni Kalibrasyon Firması"
              value={newCalibrationCompany}
              onChange={(e) => setNewCalibrationCompany(e.target.value)}
              margin="dense"
              placeholder="Örn: ABC Kalibrasyon Ltd., Teknik Ölçüm A.Ş..."
            />
            <Button 
              variant="contained" 
              onClick={handleSaveCalibrationCompany}
              disabled={!newCalibrationCompany.trim()}
              sx={{ mt: 1 }}
            >
              Ekle
            </Button>
          </Box>

          <Typography variant="h6" sx={{ mb: 2 }}>Mevcut Kalibrasyon Firmaları:</Typography>
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {calibrationCompaniesList.map((company, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 1,
                  borderBottom: '1px solid #eee'
                }}
              >
                <Typography>{company}</Typography>
                {!['TÜBITAK UME', 'TSE Kalibrasyon Laboratuvarı', 'TURKAK Akredite Laboratuvar'].includes(company) && (
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteCalibrationCompany(company)}
                  >
                    Sil
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCalibrationCompanyDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentCalibrationManagement; 