import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
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
  Alert,
  FormControlLabel,
  Radio,
  RadioGroup,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  TablePagination,
  Grid,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Save as SaveIcon,
  Engineering as EngineeringIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Science as ScienceIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  Assessment as StatsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
  CleaningServices as CleaningServicesIcon,
  Refresh as RefreshIcon,
  AttachMoney as AttachMoneyIcon,
  Visibility as VisibilityIcon,
  CheckCircle as RepairDoneIcon,
  Report as ReportIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterListIcon,
  FilterAlt as FilterAltIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// DÖF/8D Integration Import
import { navigateToDOFForm, checkDOFStatus, DOFCreationParams } from '../utils/dofIntegration';

// Theme Context Import
import { useThemeContext } from '../context/ThemeContext';

// Styled Components (Tema entegreli olacak şekilde component içinde tanımlanacak)

// Types
interface TankInfo {
  serialNumber: string;
  type: string;
  material: string;
  capacity: number;
  productionDate: string;
  batchNumber: string;
}

interface PersonnelItem {
  id: string;
  name: string;
  employeeId: string;
}

interface Personnel {
  welder: string;
  inspector: string;
}

interface VehicleInfo {
  model: string;
  vinNumber: string;
  tankPosition: string;
  projectCode: string;
}

interface TestParameters {
  testType: string;
  testDate: string;
  testPressure: number;
  testDuration: number;
  ambientTemp: number;
  testEquipment: string;
  pressureDrop: number;
  testConditions?: TestConditions;
}

interface TestConditions {
  preTestChecks: string[];
  safetyRequirements: string[];
  environmentalConditions: string[];
  equipmentRequirements: string[];
  proceduralSteps: string[];
  acceptanceCriteria: string[];
}

interface ErrorRecord {
  id: string;
  errorType: string;
  location: string;
  size: number;
  repairMethod: string;
}

interface TestResult {
  result: 'passed' | 'failed' | 'conditional';
  retestRequired: boolean;
  notes: string;
}

interface TestRecord {
  id: string;
  tankInfo: TankInfo;
  personnel: Personnel;
  vehicleInfo: VehicleInfo;
  testParameters: TestParameters;
  errors: ErrorRecord[];
  testResult: TestResult;
  createdAt: string;
  updatedAt: string;
  repairRecordId?: string; // Tamir kaydı linklemesi
}

// Tamir/Tashih Formu Interface'leri
interface RepairMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

interface RepairStep {
  id: string;
  stepNumber: number;
  description: string;
  responsible: string;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
}

interface QualityCheck {
  id: string;
  checkType: string;
  inspector: string;
  result: 'passed' | 'failed' | 'conditional';
  checkDate: string;
  notes: string;
}

interface RepairRecord {
  id: string;
  testRecordId: string; // Hangi test sonucu ile ilişkili
  tankInfo: TankInfo; // Test'ten kopyalanır
  repairInfo: {
    repairDate: string;
    estimatedDuration: number; // saat
    actualDuration?: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    repairType: 'welding' | 'patching' | 'replacement' | 'cleaning' | 'adjustment' | 'other';
    rootCause: string;
    preventiveAction: string;
  };
  personnel: {
    repairTechnician: string;
    qualityControlPersonnel: string;
  };
  errors: ErrorRecord[]; // Test'ten kopyalanır
  repairPlan: {
    plannedActions: string[];
    requiredTools: string[];
    safetyPrecautions: string[];
    estimatedCost: number;
  };
  repairSteps: RepairStep[];
  materialsUsed: RepairMaterial[];
  qualityChecks: QualityCheck[];
  retestRecord?: {
    retestId: string;
    retestDate: string;
    retestResult: 'passed' | 'failed' | 'conditional';
    finalApproval: boolean;
  };
  status: 'planned' | 'in_progress' | 'quality_check' | 'retest_required' | 'completed' | 'cancelled';
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Tank izlenebilirlik için
interface TankHistory {
  serialNumber: string;
  tankInfo: TankInfo;
  records: {
    testRecords: TestRecord[];
    repairRecords: RepairRecord[];
  };
  statistics: {
    totalTests: number;
    totalRepairs: number;
    averageRepairTime: number;
    totalRepairCost: number;
    successRate: number;
    lastTestDate?: string;
    lastRepairDate?: string;
  };
}

interface TestStatistics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  conditionalTests: number;
  averagePressureDrop: number;
  mostCommonErrorType: string;
  testsThisMonth: number;
  successRate: number;
}

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: '16px',
  border: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.25)' 
    : '0 4px 20px rgba(0, 0, 0, 0.08)',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 30px rgba(0, 0, 0, 0.35)'
      : '0 8px 30px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
    transition: 'all 0.3s ease-in-out',
  },
}));

const ErrorCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
  border: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
}));

// Constants
const TANK_TYPES = [
  'Yağ Tankı',
  'Su Tankı', 
  'Mazot Tankı',
  'Hidrolik Sıvı Tankı',
  'Diğer'
];

const TANK_MATERIALS = [
  'Karbon Çeliği',
  'Paslanmaz Çelik',
  'Alüminyum',
  'Plastik',
  'Diğer'
];

const TANK_POSITIONS = [
  'Ön',
  'Arka',
  'Sol',
  'Sağ', 
  'Orta',
  'Şase Altı',
  'Kabin İçi',
  'Motor Bölümü',
  'Diğer'
];

const TEST_TYPES = [
  'Hava Basıncı Testi',
  'Su Testi',
  'Helyum Testi',
  'Köpük/Kabarcık Testi',
  'Vakum Testi',
  'Diğer'
];

const TEST_EQUIPMENTS = [
  'Hidrolik Test Ünitesi',
  'Pnömatik Test Ünitesi',
  'Manuel Test Pompası',
  'Elektronik Test Cihazı',
  'Diğer'
];

const ERROR_TYPES = [
  'Kaynak Hatası',
  'Çatlak',
  'Delik',
  'Porözite',
  'Bağlantı Sorunu',
  'Malzeme Kusuru',
  'İşçilik Hatası',
  'Diğer'
];

const REPAIR_METHODS = [
  'Yeniden Kaynak',
  'Taşlama+Kaynak',
  'Sızdırmazlık Macunu',
  'Parça Değişimi',
  'Tamir Edilmedi',
  'Diğer'
];

// Test türlerine göre önceden tanımlanmış test koşulları
const PREDEFINED_TEST_CONDITIONS: { [key: string]: TestConditions } = {
  'Hava Basıncı Testi': {
    preTestChecks: [
      'Tank görsel kontrolü yapılmıştır',
      'Tüm bağlantı noktaları kontrol edilmiştir',
      'Güvenlik ventilleri kapatılmıştır',
      'Test ekipmanı kalibre edilmiştir'
    ],
    safetyRequirements: [
      'Test alanında başka personel bulunmamalıdır',
      'Güvenlik gözlüğü takılmalıdır',
      'Test basıncı maksimum çalışma basıncının 1.5 katını geçmemelidir',
      'Acil durumda basıncı tahliye edecek mekanizma hazır olmalıdır'
    ],
    environmentalConditions: [
      'Test ortamı sıcaklığı: 15-35°C arası',
      'Nem oranı: %30-70 arası',
      'Rüzgar hızı: 10 m/s altında',
      'Yağışsız hava koşulları'
    ],
    equipmentRequirements: [
      'Kalibreli basınç göstergesi',
      'Hava kompresörü (uygun kapasitede)',
      'Güvenlik ventili',
      'Basınç regülatörü',
      'Bağlantı hortumları ve nipelleri'
    ],
    proceduralSteps: [
      'Tankı test konumuna yerleştirin',
      'Test bağlantılarını yapın',
      'Yavaşça test basıncına çıkın',
      'Belirtilen süre boyunca basıncı koruyun',
      'Basınç düşüşünü kaydedin',
      'Güvenli şekilde basıncı tahliye edin'
    ],
    acceptanceCriteria: [
      'Basınç düşüşü: <0.1 bar/10 dakika',
      'Görsel sızıntı yok',
      'Anormal ses veya titreşim yok',
      'Deformasyon yok'
    ]
  },
  'Su Testi': {
    preTestChecks: [
      'Tank iç temizliği yapılmıştır',
      'Drenaj bağlantıları kontrol edilmiştir',
      'Su kalitesi test edilmiştir',
      'Tank kapasitesi ölçülmüştür'
    ],
    safetyRequirements: [
      'Tank tamamen boşaltılabilir konumda olmalıdır',
      'Kaymaya karşı güvenlik önlemleri alınmalıdır',
      'Su sıcaklığı kontrol edilmelidir',
      'Elektriksel güvenlik sağlanmalıdır'
    ],
    environmentalConditions: [
      'Test ortamı sıcaklığı: 5-40°C arası',
      'Su sıcaklığı: 10-30°C arası',
      'İyi havalandırma sağlanmalıdır',
      'Zemin düz ve stabil olmalıdır'
    ],
    equipmentRequirements: [
      'Temiz test suyu',
      'Su pompası',
      'Seviye göstergesi',
      'Drenaj sistemi',
      'Su basıncı ölçer'
    ],
    proceduralSteps: [
      'Tankı uygun konuma yerleştirin',
      'Su giriş bağlantısını yapın',
      'Yavaşça su doldurun',
      'Tam kapasiteye ulaştığınızda bekleyin',
      'Sızıntı kontrolü yapın',
      'Suyu güvenli şekilde boşaltın'
    ],
    acceptanceCriteria: [
      'Görsel sızıntı yok',
      'Su seviyesi düşüşü yok',
      'Yapısal deformasyon yok',
      'Bağlantı noktalarında sızıntı yok'
    ]
  },
  'Helyum Testi': {
    preTestChecks: [
      'Helyum dedektörü kalibre edilmiştir',
      'Test ortamı temizlenmiştir',
      'Ventilasyon sistemi kontrol edilmiştir',
      'Helyum gaz kaynaği yeterlidir'
    ],
    safetyRequirements: [
      'Kapalı alanda çalışılmamalıdır',
      'Helyum gaz konsantrasyonu izlenmelidir',
      'Nefes alma güvenliği sağlanmalıdır',
      'Yangın kaynaklarından uzak durulmalıdır'
    ],
    environmentalConditions: [
      'İyi havalandırma zorunludur',
      'Rüzgar koşulları stabil olmalıdır',
      'Sıcaklık: 10-35°C arası',
      'Nem kontrol edilmelidir'
    ],
    equipmentRequirements: [
      'Helyum dedektörü',
      'Helyum gazı',
      'Gaz regülatörü',
      'Vakum pompası',
      'Bağlantı sistemleri'
    ],
    proceduralSteps: [
      'Sistemi vakum altına alın',
      'Helyum gazını sisteme verin',
      'Dedektörle tüm yüzeyleri tarayın',
      'Sızıntı noktalarını işaretleyin',
      'Gaz konsantrasyonunu ölçün',
      'Sistemi temizleyin'
    ],
    acceptanceCriteria: [
      'Sızıntı oranı: <1x10⁻⁵ mbar·l/s',
      'Dedektör alarm vermiyor',
      'Helyum konsantrasyonu güvenli seviyede',
      'Tüm noktalar kontrol edilmiştir'
    ]
  },
  'Köpük/Kabarcık Testi': {
    preTestChecks: [
      'Köpük solüsyonu hazırlanmıştır',
      'Yüzey temizliği yapılmıştır',
      'Test basıncı ayarlanmıştır',
      'Görsel kontrol tamamlanmıştır'
    ],
    safetyRequirements: [
      'Kaygan yüzeylere dikkat edilmelidir',
      'Göz koruması kullanılmalıdır',
      'Test basıncı güvenli seviyede olmalıdır',
      'İlk yardım malzemeleri hazır olmalıdır'
    ],
    environmentalConditions: [
      'Rüzgar hızı düşük olmalıdır',
      'Sıcaklık: 5-35°C arası',
      'Yağışsız hava koşulları',
      'İyi aydınlatma gereklidir'
    ],
    equipmentRequirements: [
      'Köpük solüsyonu',
      'Uygulama fırçası/spreyi',
      'Basınç kaynağı',
      'Temizlik malzemeleri',
      'Foto/video kayıt cihazı'
    ],
    proceduralSteps: [
      'Sisteme test basıncı verin',
      'Köpük solüsyonunu yüzeye uygulayın',
      'Kabarcık oluşumunu gözlemleyin',
      'Sızıntı noktalarını işaretleyin',
      'Foto/video kayıt alın',
      'Yüzeyi temizleyin'
    ],
    acceptanceCriteria: [
      'Kabarcık oluşumu yok',
      'Köpük birikmesi yok',
      'Sürekli hava kaçağı yok',
      'Görsel sızıntı belirtisi yok'
    ]
  },
  'Vakum Testi': {
    preTestChecks: [
      'Vakum pompası test edilmiştir',
      'Sistem sızdırmazlığı kontrol edilmiştir',
      'Vakum göstergeleri kalibre edilmiştir',
      'Güvenlik ventilleri ayarlanmıştır'
    ],
    safetyRequirements: [
      'Vakum basıncı güvenli seviyede olmalıdır',
      'Ani basınç değişimlerine karşı önlem alınmalıdır',
      'Tank deformasyonu izlenmelidir',
      'Acil durumda vakumu kırabilme imkanı olmalıdır'
    ],
    environmentalConditions: [
      'Stabil ortam sıcaklığı',
      'Nem kontrol edilmelidir',
      'Titreşim minimum seviyede',
      'İyi aydınlatma gereklidir'
    ],
    equipmentRequirements: [
      'Vakum pompası',
      'Vakum göstergesi',
      'Güvenlik ventili',
      'Bağlantı sistemleri',
      'Basınç sensörleri'
    ],
    proceduralSteps: [
      'Sistemi vakum pompasına bağlayın',
      'Yavaşça vakum seviyesini artırın',
      'Hedef vakum seviyesinde bekleyin',
      'Vakum düşüşünü izleyin',
      'Deformasyonu kontrol edin',
      'Güvenli şekilde vakumu kırın'
    ],
    acceptanceCriteria: [
      'Vakum kaybı: <10% / 10 dakika',
      'Yapısal deformasyon yok',
      'Anormal ses yok',
      'Bağlantılarda sızıntı yok'
    ]
  }
};

// Personnel Lists
const WELDERS_LIST: PersonnelItem[] = [
  { id: '1', name: 'Ahmet Yılmaz', employeeId: 'W001' },
  { id: '2', name: 'Mehmet Demir', employeeId: 'W002' },
  { id: '3', name: 'Ali Kaya', employeeId: 'W003' },
  { id: '4', name: 'Hasan Özdemir', employeeId: 'W004' },
  { id: '5', name: 'İbrahim Şahin', employeeId: 'W005' }
];

const INSPECTORS_LIST: PersonnelItem[] = [
  { id: '1', name: 'Fatma Avcı', employeeId: 'I001' },
  { id: '2', name: 'Ayşe Çelik', employeeId: 'I002' },
  { id: '3', name: 'Zeynep Arslan', employeeId: 'I003' },
  { id: '4', name: 'Elif Doğan', employeeId: 'I004' },
  { id: '5', name: 'Meryem Koç', employeeId: 'I005' }
];

// ✅ Ultra Stable Search Input Component - Focus kaybı tamamen önlenmiş
const UltraStableSearchInput = React.memo<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}>(({ value, onChange, placeholder = "", label = "", size = "small", fullWidth = true }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = React.useState(value);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastParentValueRef = React.useRef(value);
  
  // İlk initialization
  React.useEffect(() => {
    if (!isInitialized) {
      setInternalValue(value);
      lastParentValueRef.current = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);
  
  // Parent value değişikliklerini sadece gerçekten farklıysa ve user typing yapmıyorsa kabul et
  React.useEffect(() => {
    if (isInitialized && value !== lastParentValueRef.current) {
      // User typing yapmıyorsa (debounce timer yoksa) parent'tan gelen değeri kabul et
      if (!debounceTimerRef.current) {
        setInternalValue(value);
        lastParentValueRef.current = value;
      }
    }
  }, [value, isInitialized]);
  
  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    // Önceki timer'ı temizle
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Yeni timer başlat
    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue);
      lastParentValueRef.current = newValue;
      debounceTimerRef.current = null;
    }, 400); // Tank test için orta hızlı - 400ms
    
  }, [onChange]);
  
  // Component unmount olduğunda timer'ı temizle
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  return (
    <TextField
      ref={inputRef}
      fullWidth={fullWidth}
      size={size}
      label={label}
      value={internalValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      // Input focus'u korumak için ek props
      onFocus={(e) => {
        e.target.selectionStart = e.target.value.length;
        e.target.selectionEnd = e.target.value.length;
      }}
    />
  );
}, (prevProps, nextProps) => {
  // Çok strict comparison - neredeyse hiç re-render olmasın
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
});

const TankLeakTest: React.FC = () => {
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
  const [activePage, setActivePage] = useState<'form' | 'history' | 'repair'>('form');
  
  // Personnel management states
  const [personnelDialog, setPersonnelDialog] = useState<'welder' | 'inspector' | null>(null);
  const [newPersonnel, setNewPersonnel] = useState({
    firstName: '',
    lastName: '',
    employeeId: ''
  });
  
  // Form States
  const [tankInfo, setTankInfo] = useState<TankInfo>({
    serialNumber: '',
    type: '',
    material: '',
    capacity: 0,
    productionDate: '',
    batchNumber: '',
  });

  const [personnel, setPersonnel] = useState<Personnel>({
    welder: '',
    inspector: '',
  });

  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    model: '',
    vinNumber: '',
    tankPosition: '',
    projectCode: '',
  });

  const [testParameters, setTestParameters] = useState<TestParameters>({
    testType: '',
    testDate: '',
    testPressure: 0,
    testDuration: 0,
    ambientTemp: 20,
    testEquipment: '',
    pressureDrop: 0,
    testConditions: undefined,
  });

  const [errors, setErrors] = useState<ErrorRecord[]>([]);
  const [testResult, setTestResult] = useState<TestResult>({
    result: 'passed',
    retestRequired: false,
    notes: '',
  });

  const [customLists, setCustomLists] = useState({
    tankTypes: TANK_TYPES,
    tankMaterials: TANK_MATERIALS,
    tankPositions: TANK_POSITIONS,
    testTypes: TEST_TYPES,
    testEquipments: TEST_EQUIPMENTS,
    errorTypes: ERROR_TYPES,
    repairMethods: REPAIR_METHODS,
    welders: WELDERS_LIST,
    inspectors: INSPECTORS_LIST,
  });

  const [savedTests, setSavedTests] = useState<TestRecord[]>([]);
  
  // Tamir Yönetimi States
  const [repairRecords, setRepairRecords] = useState<RepairRecord[]>([]);
  const [tankHistories, setTankHistories] = useState<TankHistory[]>([]);
  const [selectedRepairRecord, setSelectedRepairRecord] = useState<RepairRecord | null>(null);
  const [repairFormOpen, setRepairFormOpen] = useState(false);
  const [isEditingRepair, setIsEditingRepair] = useState(false);
  const [editRepairData, setEditRepairData] = useState<RepairRecord | null>(null);
  const [tankRepairHistory, setTankRepairHistory] = useState<{ [serialNumber: string]: number }>({});
  
  // Test tracking states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [testStatistics, setTestStatistics] = useState<TestStatistics>({
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    conditionalTests: 0,
    averagePressureDrop: 0,
    mostCommonErrorType: '',
    testsThisMonth: 0,
    successRate: 0,
  });

  // Filtreleme states
  const [filters, setFilters] = useState({
    serialNumber: '',
    tankType: '',
    testType: '',
    testResult: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
    repairStatus: '', // Tamir durumu
    period: '', // dönem (ay/çeyrek)
    year: new Date().getFullYear().toString(),
    month: '',
    quarter: ''
  });

  // Filter expansion state
  const [filterExpanded, setFilterExpanded] = useState(false);

  // Filtreleme seçenekleri
  const periodOptions = [
    { value: 'monthly', label: 'Aylık' },
    { value: 'quarterly', label: 'Çeyreklik' },
    { value: 'custom', label: 'Özel Tarih Aralığı' }
  ];

  const yearOptions = [
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' }
  ];

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

  const quarterOptions = [
    { value: 'Q1', label: '1. Çeyrek (Ocak-Mart)' },
    { value: 'Q2', label: '2. Çeyrek (Nisan-Haziran)' },
    { value: 'Q3', label: '3. Çeyrek (Temmuz-Eylül)' },
    { value: 'Q4', label: '4. Çeyrek (Ekim-Aralık)' }
  ];

  // ✅ OPTIMIZED: Filtrelenmiş veri döndüren fonksiyon - useCallback ile performance artışı
  const getFilteredData = React.useCallback(() => {
    return savedTests.filter(test => {
      // Seri numarası filtresi
      if (filters.serialNumber && !test.tankInfo.serialNumber.toLowerCase().includes(filters.serialNumber.toLowerCase())) {
        return false;
      }

      // Tank tipi filtresi
      if (filters.tankType && test.tankInfo.type !== filters.tankType) {
        return false;
      }

      // Test tipi filtresi
      if (filters.testType && test.testParameters.testType !== filters.testType) {
        return false;
      }

      // Test sonucu filtresi
      if (filters.testResult && test.testResult.result !== filters.testResult) {
        return false;
      }

      // Tamir durumu filtresi
      if (filters.repairStatus) {
        const relatedRepair = repairRecords.find(r => r.testRecordId === test.id);
        if (!relatedRepair && filters.repairStatus !== 'none') return false;
        if (relatedRepair && relatedRepair.status !== filters.repairStatus) return false;
        if (filters.repairStatus === 'none' && relatedRepair) return false;
      }

      // Tarih filtreleri
      const testDate = new Date(test.testParameters.testDate);
      
      // Dönem filtreleri
      if (filters.period === 'monthly' && filters.year && filters.month) {
        const filterYear = parseInt(filters.year);
        const filterMonth = parseInt(filters.month);
        if (testDate.getFullYear() !== filterYear || testDate.getMonth() + 1 !== filterMonth) {
          return false;
        }
      } else if (filters.period === 'quarterly' && filters.year && filters.quarter) {
        const filterYear = parseInt(filters.year);
        const testYear = testDate.getFullYear();
        const testMonth = testDate.getMonth() + 1;
        
        if (testYear !== filterYear) return false;
        
        const quarter = filters.quarter;
        if (quarter === 'Q1' && !(testMonth >= 1 && testMonth <= 3)) return false;
        if (quarter === 'Q2' && !(testMonth >= 4 && testMonth <= 6)) return false;
        if (quarter === 'Q3' && !(testMonth >= 7 && testMonth <= 9)) return false;
        if (quarter === 'Q4' && !(testMonth >= 10 && testMonth <= 12)) return false;
      } else if (filters.period === 'custom') {
        if (filters.dateFrom && testDate < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && testDate > new Date(filters.dateTo)) return false;
      }

      // Genel arama
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          test.tankInfo.serialNumber.toLowerCase().includes(searchLower) ||
          test.tankInfo.type.toLowerCase().includes(searchLower) ||
          test.testParameters.testType.toLowerCase().includes(searchLower) ||
          test.vehicleInfo.model.toLowerCase().includes(searchLower) ||
          test.personnel.welder.toLowerCase().includes(searchLower) ||
          test.personnel.inspector.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [filters, savedTests, repairRecords]);

  // Load saved tests from localStorage on component mount
  useEffect(() => {
    const storedTests = localStorage.getItem('tankLeakTests');
    if (storedTests) {
      try {
        const tests = JSON.parse(storedTests);
        if (Array.isArray(tests) && tests.length > 0) {
          console.log('🔍 Tank test verileri yüklendi:', tests.length, 'kayıt');
          console.log('📋 İlk kayıt örneği:', tests[0]);
          console.log('🔧 tankInfo içeriği:', tests[0]?.tankInfo);
          console.log('⚙️ testParameters içeriği:', tests[0]?.testParameters);
          console.log('✅ testResult içeriği:', tests[0]?.testResult);
          setSavedTests(tests);
          calculateStatistics(tests);
        } else {
          // Boş array ise örnek veri oluştur
          const sampleTests = generateSampleTestData();
          console.log('🔄 Yeni örnek veriler oluşturuldu:', sampleTests.length, 'kayıt');
          console.log('📋 Oluşturulan ilk kayıt:', sampleTests[0]);
          setSavedTests(sampleTests);
          localStorage.setItem('tankLeakTests', JSON.stringify(sampleTests));
          calculateStatistics(sampleTests);
        }
      } catch (error) {
        console.error('❌ Tank test verileri parse edilemedi:', error);
        const sampleTests = generateSampleTestData();
        setSavedTests(sampleTests);
        localStorage.setItem('tankLeakTests', JSON.stringify(sampleTests));
        calculateStatistics(sampleTests);
      }
    } else {
      // localStorage'da veri yoksa örnek veri oluştur
      const sampleTests = generateSampleTestData();
      console.log('🚀 Tank test modülü başlatıldı - ilk örnek kayıt:', sampleTests[0]);
      setSavedTests(sampleTests);
      localStorage.setItem('tankLeakTests', JSON.stringify(sampleTests));
      calculateStatistics(sampleTests);
    }
    
    // Load custom personnel lists
    loadPersonnelLists();
    
    // Load repair records
    loadRepairRecords();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load repair records from localStorage
  const loadRepairRecords = () => {
    const storedRepairs = localStorage.getItem('tankRepairRecords');
    if (storedRepairs) {
      try {
        const repairs = JSON.parse(storedRepairs);
        if (Array.isArray(repairs)) {
          console.log('🔧 Tamir kayıtları yüklendi:', repairs.length, 'kayıt');
          console.log('📋 İlk tamir kaydı:', repairs[0]);
          setRepairRecords(repairs);
          calculateTankRepairHistory(repairs);
        }
      } catch (error) {
        console.error('❌ Tamir kayıtları parse edilemedi:', error);
      }
    } else {
      // Örnek tamir kayıtları oluştur
      const sampleRepairs = generateSampleRepairData();
      setRepairRecords(sampleRepairs);
      localStorage.setItem('tankRepairRecords', JSON.stringify(sampleRepairs));
      calculateTankRepairHistory(sampleRepairs);
    }
  };

  // Tank tamir geçmişi hesaplama
  const calculateTankRepairHistory = (records: RepairRecord[]) => {
    const history: { [serialNumber: string]: number } = {};
    records.forEach(record => {
      const serialNumber = record.tankInfo.serialNumber;
      history[serialNumber] = (history[serialNumber] || 0) + 1;
    });
    setTankRepairHistory(history);
  };

  // Kalitesizlik maliyeti entegrasyonu ile maliyet hesaplama
  const calculateRepairCost = (estimatedDuration: number, repairType: string) => {
    try {
      // Kalitesizlik maliyeti ayarlarını localStorage'dan çek
      const qualityCostSettings = localStorage.getItem('qualityCostSettings');
      if (!qualityCostSettings) {
        console.warn('Kalitesizlik maliyeti ayarları bulunamadı, varsayılan değerler kullanılıyor');
        return {
          estimatedCost: estimatedDuration * 150, // Varsayılan saat ücreti 150 TL
          breakdown: {
            laborCost: estimatedDuration * 150,
            materialCost: 0,
            equipmentCost: 0
          }
        };
      }

      const settings = JSON.parse(qualityCostSettings);
      
      // Kaynakhane ve kalite kontrol personel maliyet bilgileri
      const laborCostPerHour = settings.kaynahaneMaliyeti || 150; // TL/saat
      const qualityControlCostPerHour = settings.kaliteKontrolMaliyeti || 100; // TL/saat
      
      // Tamir türüne göre maliyet katsayıları
      const repairTypeMultiplier = {
        'welding': 1.5,    // Kaynak tamiri
        'patching': 1.2,   // Yama
        'replacement': 2.0, // Değişim
        'cleaning': 0.8,   // Temizlik
        'adjustment': 0.6, // Ayar
        'other': 1.0       // Diğer
      };

      const multiplier = repairTypeMultiplier[repairType as keyof typeof repairTypeMultiplier] || 1.0;
      
      // Maliyet hesaplamaları
      const laborCost = estimatedDuration * laborCostPerHour * multiplier;
      const qualityControlCost = (estimatedDuration * 0.3) * qualityControlCostPerHour; // Kalite kontrol %30 süre
      const materialCost = laborCost * 0.2; // Malzeme maliyeti işçilik maliyetinin %20'si
      const equipmentCost = laborCost * 0.1; // Ekipman maliyeti işçilik maliyetinin %10'u
      
      const totalCost = laborCost + qualityControlCost + materialCost + equipmentCost;

      return {
        estimatedCost: Math.round(totalCost),
        breakdown: {
          laborCost: Math.round(laborCost),
          qualityControlCost: Math.round(qualityControlCost),
          materialCost: Math.round(materialCost),
          equipmentCost: Math.round(equipmentCost)
        }
      };
    } catch (error) {
      console.error('Maliyet hesaplama hatası:', error);
      return {
        estimatedCost: estimatedDuration * 150,
        breakdown: {
          laborCost: estimatedDuration * 150,
          materialCost: 0,
          equipmentCost: 0
        }
      };
    }
  };

  // Tamir kaydı kaydetme/güncelleme
  const saveRepairRecord = (repairData: RepairRecord) => {
    const updatedRecords = repairRecords.map(record => 
      record.id === repairData.id ? repairData : record
    );
    setRepairRecords(updatedRecords);
    localStorage.setItem('tankRepairRecords', JSON.stringify(updatedRecords));
    calculateTankRepairHistory(updatedRecords);
  };

  // Başarısız testten tamir kaydı oluşturma
  const handleCreateRepairFromTest = (test: TestRecord) => {
    try {
      // Yeni tamir ID'si oluştur
      // Kısa ID formatı: RPR-051002 (DDMMYY formatında) + saat/dakika
      const now = new Date();
      const shortId = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear().toString().slice(-2)}`;
      const timeId = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
      const newRepairId = `RPR-${shortId}-${timeId}`;
      
      // Tamir türünü hataya göre belirle
      const determineRepairType = (): 'welding' | 'patching' | 'replacement' | 'cleaning' | 'adjustment' | 'other' => {
        if (test.errors && test.errors.length > 0) {
          const firstError = test.errors[0];
          if (firstError.errorType.toLowerCase().includes('kaynak')) return 'welding';
          if (firstError.errorType.toLowerCase().includes('çatlak')) return 'patching';
          if (firstError.errorType.toLowerCase().includes('delik')) return 'patching';
          if (firstError.errorType.toLowerCase().includes('korozyon')) return 'cleaning';
          if (firstError.errorType.toLowerCase().includes('deformasyon')) return 'adjustment';
        }
        return 'welding'; // Default
      };

      // Öncelik belirleme (hata boyutuna göre)
      const determinePriority = (): 'low' | 'medium' | 'high' | 'critical' => {
        if (test.errors && test.errors.length > 0) {
          const maxErrorSize = Math.max(...test.errors.map(e => e.size));
          if (maxErrorSize >= 10) return 'critical';
          if (maxErrorSize >= 5) return 'high';
          if (maxErrorSize >= 2) return 'medium';
        }
        return 'low';
      };

      const repairType = determineRepairType();
      const priority = determinePriority();
      const estimatedDuration = priority === 'critical' ? 8 : priority === 'high' ? 6 : 4;
      
      // Maliyet hesapla
      const costCalculation = calculateRepairCost(estimatedDuration, repairType);

      // Yeni tamir kaydı oluştur
      const newRepairRecord: RepairRecord = {
        id: newRepairId,
        testRecordId: test.id,
        tankInfo: test.tankInfo,
        repairInfo: {
          repairDate: new Date().toISOString().split('T')[0],
          estimatedDuration: estimatedDuration,
          priority: priority,
          repairType: repairType,
          rootCause: `${test.testParameters.testType} testinde başarısızlık tespit edildi`,
          preventiveAction: 'Test parametrelerinin gözden geçirilmesi ve iyileştirilmesi'
        },
        personnel: {
          repairTechnician: test.personnel.welder || 'Belirtilmemiş',
          qualityControlPersonnel: test.personnel.inspector || 'Belirtilmemiş'
        },
        errors: test.errors || [],
        repairPlan: {
          plannedActions: [
            'Hasarlı bölgenin belirlenmesi',
            'Gerekli malzeme temini',
            `${repairType === 'welding' ? 'Kaynak tamiri' : 
              repairType === 'patching' ? 'Yama uygulaması' : 
              repairType === 'cleaning' ? 'Temizlik işlemi' : 'Gerekli tamir işlemi'} yapılması`,
            'Kalite kontrolü ve test'
          ],
          requiredTools: [
            repairType === 'welding' ? 'Kaynak makinesi' : 'Tamir ekipmanları',
            'Ölçüm cihazları',
            'Güvenlik ekipmanları',
            'Test ekipmanları'
          ],
          safetyPrecautions: [
            'Koruyucu ekipman kullanımı',
            'Çalışma alanının güvenli hale getirilmesi',
            'Havalandırma kontrolü',
            'Acil durum prosedürlerinin hazır bulundurulması'
          ],
          estimatedCost: costCalculation.estimatedCost
        },
        repairSteps: [
          {
            id: `STEP-${newRepairId}-1`,
            stepNumber: 1,
            description: 'Ön hazırlık ve planlama',
            responsible: test.personnel.welder || 'Belirtilmemiş',
            startTime: new Date().toISOString(),
            status: 'pending',
            notes: 'Test sonucuna dayalı tamir planı hazırlandı'
          }
        ],
        materialsUsed: [],
        qualityChecks: [],
        status: 'planned',
        totalCost: costCalculation.estimatedCost,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Tamir kaydını kaydet
      const updatedRepairRecords = [...repairRecords, newRepairRecord];
      setRepairRecords(updatedRepairRecords);
      localStorage.setItem('tankRepairRecords', JSON.stringify(updatedRepairRecords));
      calculateTankRepairHistory(updatedRepairRecords);

      // Test kaydını güncelle (tamir ID'si ile bağla)
      const updatedTest: TestRecord = {
        ...test,
        repairRecordId: newRepairId,
        updatedAt: new Date().toISOString()
      };
      
      const updatedTests = savedTests.map(t => t.id === test.id ? updatedTest : t);
      setSavedTests(updatedTests);
      localStorage.setItem('tankLeakTests', JSON.stringify(updatedTests));

      // Tamir sayfasına geç
      setActivePage('repair');

      // Tamir kaydı oluşturuldu - sessiz işlem

      console.log('🔧 Yeni tamir kaydı oluşturuldu:', newRepairRecord);
      
    } catch (error) {
      console.error('❌ Tamir kaydı oluşturulurken hata:', error);
      // Hata bildirimi kaldırıldı - sessiz hata yönetimi
    }
  };

  // ✅ DÖF/8D Integration Functions
  const handleCreateDOFForTest = (test: TestRecord) => {
    // DÖF form verilerini localStorage'a kaydet - form otomatik açılsın
    const dofFormData = {
      title: `Tank Sızdırmazlık Testi Başarısızlığı - ${test.tankInfo.serialNumber}`,
      department: 'Kaynakhane',
      responsiblePerson: test.personnel.welder || 'Kaynak Ustası',
      priority: test.errors.length > 3 ? 'critical' : test.errors.length > 1 ? 'high' : 'medium',
      description: `Tank sızdırmazlık testi başarısız sonuçlandı.\n\nTank Bilgileri:\n- Seri No: ${test.tankInfo.serialNumber}\n- Tank Türü: ${test.tankInfo.type}\n- Kapasite: ${test.tankInfo.capacity}L\n- Araç Modeli: ${test.vehicleInfo.model}\n- VIN: ${test.vehicleInfo.vinNumber}\n\nTest Detayları:\n- Test Türü: ${test.testParameters.testType}\n- Test Basıncı: ${test.testParameters.testPressure} bar\n- Basınç Düşümü: ${test.testParameters.pressureDrop} bar\n- Test Sonucu: ${test.testResult.result === 'failed' ? 'Başarısız' : test.testResult.result === 'conditional' ? 'Şartlı' : 'Başarılı'}\n\nTespit Edilen Hatalar (${test.errors.length} adet):\n${test.errors.map((error, i) => `${i+1}. ${error.errorType} - ${error.location} (${error.size}mm)`).join('\n')}\n\nAcil tamir gereklidir ve kök neden analizi yapılmalıdır.`,
      sourceModule: 'tankLeakTest',
      sourceRecordId: test.id
    };

    // Form otomatik açılması için flag
    localStorage.setItem('dof-auto-open-form', 'true');
    localStorage.setItem('dof-prefill-data', JSON.stringify(dofFormData));
    
    // DÖF/8D yönetimi sayfasına yönlendir
    window.location.href = '/dof-8d-management';
  };

  const getDOFStatusForTest = (test: TestRecord) => {
    return checkDOFStatus('tankLeak', test.id);
  };

  // Test kaydı silme fonksiyonu
  const handleDeleteTest = (testId: string) => {
    if (!window.confirm('Bu test kaydını silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      // Test kaydını sil
      const updatedTests = savedTests.filter(test => test.id !== testId);
      setSavedTests(updatedTests);
      localStorage.setItem('tankLeakTests', JSON.stringify(updatedTests));
      
      // İlgili tamir kayıtlarını da sil
      const updatedRepairs = repairRecords.filter(repair => repair.testRecordId !== testId);
      setRepairRecords(updatedRepairs);
      localStorage.setItem('tankRepairRecords', JSON.stringify(updatedRepairs));
      
      // İstatistikleri güncelle
      calculateStatistics(updatedTests);
      calculateTankRepairHistory(updatedRepairs);
      
      console.log('🗑️ Test kaydı silindi:', testId);
    } catch (error) {
      console.error('❌ Test kaydı silinirken hata:', error);
    }
  };

  // Tamir kaydı silme fonksiyonu
  const handleDeleteRepair = (repairId: string) => {
    if (!window.confirm('Bu tamir kaydını silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      // Tamir kaydını sil
      const updatedRepairs = repairRecords.filter(repair => repair.id !== repairId);
      setRepairRecords(updatedRepairs);
      localStorage.setItem('tankRepairRecords', JSON.stringify(updatedRepairs));
      
      // İlgili test kaydının repairRecordId'sini temizle
      const updatedTests = savedTests.map(test => {
        if (test.repairRecordId === repairId) {
          const { repairRecordId, ...testWithoutRepairId } = test;
          return testWithoutRepairId;
        }
        return test;
      });
      setSavedTests(updatedTests);
      localStorage.setItem('tankLeakTests', JSON.stringify(updatedTests));
      
      // İstatistikleri güncelle
      calculateTankRepairHistory(updatedRepairs);
      
      console.log('🗑️ Tamir kaydı silindi:', repairId);
    } catch (error) {
      console.error('❌ Tamir kaydı silinirken hata:', error);
    }
  };

  // Generate sample repair data
  const generateSampleRepairData = (): RepairRecord[] => {
    console.log('🔧 generateSampleRepairData başladı...');
    
    const sampleRepairs: RepairRecord[] = [];
    const repairTypes: Array<'welding' | 'patching' | 'replacement' | 'cleaning' | 'adjustment' | 'other'> = 
      ['welding', 'patching', 'replacement', 'cleaning', 'adjustment'];
    const priorities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
    const statuses: Array<'planned' | 'in_progress' | 'quality_check' | 'retest_required' | 'completed' | 'cancelled'> = 
      ['planned', 'in_progress', 'quality_check', 'retest_required', 'completed'];
    
    const now = new Date();
    
    // 3 tamir kaydı oluştur
    for (let i = 0; i < 3; i++) {
      const repairDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Son 30 gün
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const repairType = repairTypes[Math.floor(Math.random() * repairTypes.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      
      const repairRecord: RepairRecord = {
        id: `RPR-${String(i + 1).padStart(3, '0')}`,
        testRecordId: `TST-${String(i + 1).padStart(3, '0')}`,
        tankInfo: {
          serialNumber: `TK-2024-${String(i + 1).padStart(3, '0')}`,
          type: ['Yakıt Tankı', 'Hidrolik Tankı', 'Su Tankı'][i % 3],
          material: 'Çelik',
          capacity: 200 + (i * 100),
          productionDate: repairDate.toISOString().split('T')[0],
          batchNumber: `BT-${String(i + 1).padStart(3, '0')}`
        },
        repairInfo: {
          repairDate: repairDate.toISOString().split('T')[0],
          estimatedDuration: 4 + (i * 2), // 4, 6, 8 saat
          actualDuration: status === 'completed' ? (4 + (i * 2) + Math.floor(Math.random() * 2)) : undefined,
          priority: priority,
          repairType: repairType,
          rootCause: 'Kaynak kalitesi yetersiz',
          preventiveAction: 'WPS prosedürlerinin güncellenmesi'
        },
        personnel: {
          repairTechnician: WELDERS_LIST[i % WELDERS_LIST.length].name,
          qualityControlPersonnel: INSPECTORS_LIST[i % INSPECTORS_LIST.length].name
        },
        errors: [{
          id: `ERR-${i + 1}`,
          errorType: 'Kaynak Hatası',
          location: `Bölge ${i + 1}`,
          size: 2.5 + (i * 0.5),
          repairMethod: 'Yeniden kaynak'
        }],
        repairPlan: {
          plannedActions: ['Hasarlı bölgenin temizlenmesi', 'Yeniden kaynak yapılması', 'Kalite kontrolü'],
          requiredTools: ['Kaynak makinesi', 'Taşlama makinesi', 'Test ekipmanları'],
          safetyPrecautions: ['Koruyucu ekipman kullanımı', 'Havalandırma kontrolü'],
          estimatedCost: 1500 + (i * 500) // 1500, 2000, 2500 TL
        },
        repairSteps: [
          {
            id: `STEP-${i + 1}-1`,
            stepNumber: 1,
            description: 'Hasarlı bölgenin temizlenmesi',
            responsible: WELDERS_LIST[i % WELDERS_LIST.length].name,
            startTime: repairDate.toISOString(),
            endTime: status !== 'planned' ? new Date(repairDate.getTime() + 60*60*1000).toISOString() : undefined,
            status: status === 'planned' ? 'pending' : 'completed',
            notes: 'Temizlik tamamlandı'
          }
        ],
        materialsUsed: [
          {
            id: `MAT-${i + 1}`,
            name: 'Kaynak Tel',
            quantity: 2,
            unit: 'kg',
            cost: 150
          }
        ],
        qualityChecks: status !== 'planned' ? [
          {
            id: `QC-${i + 1}`,
            checkType: 'Görsel Kontrol',
            inspector: INSPECTORS_LIST[i % INSPECTORS_LIST.length].name,
            result: 'passed',
            checkDate: new Date(repairDate.getTime() + 2*60*60*1000).toISOString().split('T')[0],
            notes: 'Kalite standartlarına uygun'
          }
        ] : [],
        retestRecord: status === 'completed' ? {
          retestId: `RT-${i + 1}`,
          retestDate: new Date(repairDate.getTime() + 3*60*60*1000).toISOString().split('T')[0],
          retestResult: 'passed',
          finalApproval: true
        } : undefined,
        status: status,
        totalCost: 1500 + (i * 500),
        createdAt: repairDate.toISOString(),
        updatedAt: repairDate.toISOString(),
        completedAt: status === 'completed' ? new Date(repairDate.getTime() + 4*60*60*1000).toISOString() : undefined
      };
      
      sampleRepairs.push(repairRecord);
    }
    
    console.log('✅ generateSampleRepairData tamamlandı. Toplam kayıt:', sampleRepairs.length);
    return sampleRepairs;
  };

  // Örnek test verisi oluşturma fonksiyonu
  const generateSampleTestData = (): TestRecord[] => {
    console.log('🔧 generateSampleTestData başladı...');
    
    const sampleTests: TestRecord[] = [];
    const testResults: Array<'passed' | 'failed' | 'conditional'> = ['passed', 'failed', 'conditional'];
    const tankTypes = ['Yakıt Tankı', 'Hidrolik Tankı', 'Su Tankı', 'Yağ Tankı'];
    const materials = ['Çelik', 'Alüminyum', 'Paslanmaz Çelik'];
    const vehicleModels = ['Kamyon A', 'Kamyon B', 'Kamyon C', 'Özel Araç'];
    const errorTypes = ['Kaynak Hatası', 'Çatlak', 'Delik', 'Bağlantı Sorunu'];
    const testTypes = ['Basınç Testi', 'Sızdırmazlık Testi', 'Tam Test'];
    
    const now = new Date();
    
    // Son 6 ay içinde 20 test oluştur
    for (let i = 0; i < 20; i++) {
      const testDate = new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000); // Son 180 gün
      const result = testResults[Math.floor(Math.random() * testResults.length)];
      const hasErrors = result !== 'passed';
      
      const errors: ErrorRecord[] = hasErrors ? [{
        id: `ERR-${i + 1}`,
        errorType: errorTypes[Math.floor(Math.random() * errorTypes.length)],
        location: `Bölge ${Math.floor(Math.random() * 4) + 1}`,
        size: Math.round((Math.random() * 10 + 1) * 100) / 100, // 1-11 mm, 2 ondalık
        repairMethod: 'Yeniden kaynak'
      }] : [];
      
      // Güvenli veri oluşturma
      const serialNumber = `TK-2024-${String(i + 1).padStart(3, '0')}`;
      const tankType = tankTypes[Math.floor(Math.random() * tankTypes.length)];
      const material = materials[Math.floor(Math.random() * materials.length)];
      const capacity = Math.floor(Math.random() * 500) + 100; // 100-600 litre
      const testType = testTypes[Math.floor(Math.random() * testTypes.length)];
      const testDateString = testDate.toISOString().split('T')[0];
      
      console.log(`📝 ${i + 1}. kayıt oluşturuluyor:`, {
        serialNumber,
        tankType,
        testType,
        testDate: testDateString,
        result
      });
      
      const testRecord: TestRecord = {
        id: `TST-${String(i + 1).padStart(3, '0')}`,
        tankInfo: {
          serialNumber: serialNumber,
          type: tankType,
          material: material,
          capacity: capacity,
          productionDate: testDateString,
          batchNumber: `BT-${String(i + 1).padStart(3, '0')}`
        },
        personnel: {
          welder: WELDERS_LIST[Math.floor(Math.random() * WELDERS_LIST.length)].name,
          inspector: INSPECTORS_LIST[Math.floor(Math.random() * INSPECTORS_LIST.length)].name
        },
        vehicleInfo: {
          model: vehicleModels[Math.floor(Math.random() * vehicleModels.length)],
          vinNumber: `VIN${String(i + 1).padStart(6, '0')}`,
          tankPosition: ['Sol', 'Sağ', 'Merkez'][Math.floor(Math.random() * 3)],
          projectCode: `PRJ-${String(i + 1).padStart(3, '0')}`
        },
        testParameters: {
          testType: testType,
          testDate: testDateString,
          testPressure: Math.floor(Math.random() * 5) + 3, // 3-8 bar
          testDuration: Math.floor(Math.random() * 30) + 10, // 10-40 dakika
          ambientTemp: Math.floor(Math.random() * 30) + 10, // 10-40°C
          testEquipment: 'Hidrolik Test Ünitesi',
          pressureDrop: Math.round(Math.random() * 0.5 * 100) / 100 // 0-0.5 bar, 2 ondalık
        },
        errors: errors,
        testResult: {
          result: result,
          retestRequired: result === 'failed',
          notes: result === 'passed' ? 'Test başarıyla tamamlandı' : 
                 result === 'failed' ? 'Test başarısız - düzeltme gerekli' : 
                 'Şartlı onay - kontrol tekrarı önerilir'
        },
        createdAt: testDate.toISOString(),
        updatedAt: testDate.toISOString()
      };
      
      sampleTests.push(testRecord);
    }
    
    const sortedTests = sampleTests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    console.log('✅ generateSampleTestData tamamlandı. Toplam kayıt:', sortedTests.length);
    console.log('🔍 İlk test detayları:', sortedTests[0]);
    
    return sortedTests;
  };

  // Save tests to localStorage whenever savedTests changes
  useEffect(() => {
    if (savedTests.length > 0) {
      localStorage.setItem('tankLeakTests', JSON.stringify(savedTests));
      calculateStatistics(savedTests);
    }
  }, [savedTests]);

  // Load personnel lists from localStorage
  const loadPersonnelLists = () => {
    const storedWelders = localStorage.getItem('tankLeakTest_welders');
    const storedInspectors = localStorage.getItem('tankLeakTest_inspectors');
    
    setCustomLists(prev => ({
      ...prev,
      welders: storedWelders ? JSON.parse(storedWelders) : WELDERS_LIST,
      inspectors: storedInspectors ? JSON.parse(storedInspectors) : INSPECTORS_LIST,
    }));
  };

  // Save personnel lists to localStorage
  const savePersonnelLists = (welders: PersonnelItem[], inspectors: PersonnelItem[]) => {
    localStorage.setItem('tankLeakTest_welders', JSON.stringify(welders));
    localStorage.setItem('tankLeakTest_inspectors', JSON.stringify(inspectors));
    setCustomLists(prev => ({
      ...prev,
      welders,
      inspectors,
    }));
  };

  // Add new personnel (welder or inspector)
  const addPersonnel = () => {
    if (!newPersonnel.firstName || !newPersonnel.lastName || !newPersonnel.employeeId) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    const fullName = `${newPersonnel.firstName} ${newPersonnel.lastName}`;
    const newPersonnelItem: PersonnelItem = {
      id: Date.now().toString(),
      name: fullName,
      employeeId: newPersonnel.employeeId
    };

    let updatedWelders = [...customLists.welders];
    let updatedInspectors = [...customLists.inspectors];

    if (personnelDialog === 'welder') {
      // Check if employee ID already exists
      if (updatedWelders.some(w => w.employeeId === newPersonnel.employeeId)) {
        alert('Bu sicil numarası zaten mevcut!');
        return;
      }
      updatedWelders.push(newPersonnelItem);
    } else if (personnelDialog === 'inspector') {
      // Check if employee ID already exists
      if (updatedInspectors.some(i => i.employeeId === newPersonnel.employeeId)) {
        alert('Bu sicil numarası zaten mevcut!');
        return;
      }
      updatedInspectors.push(newPersonnelItem);
    }

    savePersonnelLists(updatedWelders, updatedInspectors);
    
    // Reset form and close dialog
    setNewPersonnel({ firstName: '', lastName: '', employeeId: '' });
    setPersonnelDialog(null);
  };

  // Delete personnel
  const deletePersonnel = (personnelId: string, type: 'welder' | 'inspector') => {
    if (!window.confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
      return;
    }

    let updatedWelders = [...customLists.welders];
    let updatedInspectors = [...customLists.inspectors];

    if (type === 'welder') {
      updatedWelders = updatedWelders.filter(w => w.id !== personnelId);
    } else {
      updatedInspectors = updatedInspectors.filter(i => i.id !== personnelId);
    }

    savePersonnelLists(updatedWelders, updatedInspectors);
  };

  // Calculate test statistics
  const calculateStatistics = (tests: TestRecord[]) => {
    const totalTests = tests.length;
    
    // Sadece testResult'ı olan testleri filtrele
    const validTests = tests.filter(test => test.testResult && test.testResult.result);
    
    const passedTests = validTests.filter(test => test.testResult.result === 'passed').length;
    const failedTests = validTests.filter(test => test.testResult.result === 'failed').length;
    const conditionalTests = validTests.filter(test => test.testResult.result === 'conditional').length;
    
    // testParameters kontrolü de ekle
    const testsWithValidParams = tests.filter(test => test.testParameters && typeof test.testParameters.pressureDrop === 'number');
    const averagePressureDrop = testsWithValidParams.length > 0 ? 
      testsWithValidParams.reduce((sum, test) => sum + test.testParameters.pressureDrop, 0) / testsWithValidParams.length : 0;
    
    // Find most common error type - null check ekle
    const errorTypes: { [key: string]: number } = {};
    tests.forEach(test => {
      if (test.errors && Array.isArray(test.errors)) {
        test.errors.forEach(error => {
          if (error && error.errorType) {
            errorTypes[error.errorType] = (errorTypes[error.errorType] || 0) + 1;
          }
        });
      }
    });
    
    const mostCommonErrorType = Object.keys(errorTypes).length > 0 
      ? Object.keys(errorTypes).reduce((a, b) => errorTypes[a] > errorTypes[b] ? a : b, '')
      : 'Hata yok';
    
    // Tests this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const testsThisMonth = tests.filter(test => {
      if (!test.createdAt) return false;
      try {
        const testDate = new Date(test.createdAt);
        return testDate.getMonth() === currentMonth && testDate.getFullYear() === currentYear;
      } catch (error) {
        console.warn('Geçersiz test tarihi:', test.createdAt);
        return false;
      }
    }).length;
    
    const successRate = validTests.length > 0 ? (passedTests / validTests.length) * 100 : 0;
    
    console.log(`📊 Tank Test İstatistikleri - Toplam: ${totalTests}, Geçerli: ${validTests.length}, Başarılı: ${passedTests}`);
    
    setTestStatistics({
      totalTests,
      passedTests,
      failedTests,
      conditionalTests,
      averagePressureDrop: Number(averagePressureDrop.toFixed(3)),
      mostCommonErrorType: mostCommonErrorType || 'Hata yok',
      testsThisMonth,
      successRate: Number(successRate.toFixed(1)),
    });
  };

  // Test türü değiştiğinde otomatik test koşullarını doldur
  const handleTestTypeChange = (selectedTestType: string) => {
    const updatedTestParameters = {
      ...testParameters,
      testType: selectedTestType,
      testConditions: PREDEFINED_TEST_CONDITIONS[selectedTestType] || undefined
    };
    setTestParameters(updatedTestParameters);
  };

  // Professional PDF generation for specific test
  // Form'dan yeni test kaydetme fonksiyonu
  const handleSaveTest = () => {
    try {
      // Form validasyonu
      if (!tankInfo.serialNumber || !tankInfo.type || !personnel.welder || !personnel.inspector) {
        alert('Lütfen zorunlu alanları doldurun: Seri No, Tank Türü, Kaynakçı ve Kontrol Sorumlusu');
        return;
      }

      if (!testParameters.testType || !testParameters.testDate) {
        alert('Lütfen test türü ve test tarihi seçin');
        return;
      }

      if (!testResult.result) {
        alert('Lütfen test sonucunu seçin');
        return;
      }

      // Yeni test kaydı oluştur
      const newTest: TestRecord = {
        id: (() => {
        const now = new Date();
        const shortId = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear().toString().slice(-2)}`;
        const timeId = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
        return `TST-${shortId}-${timeId}`;
      })(),
        tankInfo: tankInfo,
        personnel: personnel,
        vehicleInfo: vehicleInfo,
        testParameters: {
          ...testParameters,
          testConditions: testParameters.testConditions || undefined
        },
        errors: errors,
        testResult: testResult,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Kayıtlı testlere ekle
      const updatedTests = [...savedTests, newTest];
      setSavedTests(updatedTests);
      localStorage.setItem('tankLeakTests', JSON.stringify(updatedTests));
      calculateStatistics(updatedTests);

      // Formu temizle
      setTankInfo({
        serialNumber: '',
        type: '',
        material: '',
        capacity: 0,
        productionDate: '',
        batchNumber: '',
      });
      setPersonnel({ welder: '', inspector: '' });
      setVehicleInfo({
        model: '',
        vinNumber: '',
        tankPosition: '',
        projectCode: '',
      });
      setTestParameters({
        testType: '',
        testDate: '',
        testPressure: 0,
        testDuration: 0,
        ambientTemp: 20,
        testEquipment: '',
        pressureDrop: 0,
        testConditions: undefined,
      });
      setErrors([]);
      setTestResult({
        result: 'passed',
        retestRequired: false,
        notes: '',
      });

      alert('Test başarıyla kaydedildi!');
      
      // Test geçmişi sayfasına geç
      setActivePage('history');
      
    } catch (error) {
      console.error('Test kaydetme hatası:', error);
      alert('Test kaydedilirken bir hata oluştu.');
    }
  };

  // Form'dan PDF oluşturma fonksiyonu
  const handleGeneratePDFFromForm = () => {
    try {
      // Form validasyonu
      if (!tankInfo.serialNumber || !tankInfo.type || !personnel.welder || !personnel.inspector) {
        alert('PDF oluşturmak için zorunlu alanları doldurun: Seri No, Tank Türü, Kaynakçı ve Kontrol Sorumlusu');
        return;
      }

      if (!testParameters.testType || !testParameters.testDate) {
        alert('PDF oluşturmak için test türü ve test tarihi seçin');
        return;
      }

      if (!testResult.result) {
        alert('PDF oluşturmak için test sonucunu seçin');
        return;
      }

      // Geçici test kaydı oluştur (sadece PDF için)
      const tempTest: TestRecord = {
        id: `TEMP-${Date.now()}`,
        tankInfo: tankInfo,
        personnel: personnel,
        vehicleInfo: vehicleInfo,
        testParameters: {
          ...testParameters,
          testConditions: testParameters.testConditions || undefined
        },
        errors: errors,
        testResult: testResult,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // PDF oluştur
      handleGeneratePDFForTest(tempTest);
      
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken bir hata oluştu.');
    }
  };

  const handleGeneratePDFForTest = (test: TestRecord) => {
    try {
      // Temel veriler eksikse PDF oluşturma
      if (!test.tankInfo || !test.testResult) {
        alert('Test verileri eksik! PDF oluşturulamaz.');
        console.error('❌ PDF oluşturulamaz - eksik veriler:', { tankInfo: !!test.tankInfo, testResult: !!test.testResult });
        return;
      }

      const doc = new jsPDF();
      // Kısa ID formatı: TST-051002 (DDMMYY formatında) + saat/dakika
      const now = new Date();
      const shortId = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear().toString().slice(-2)}`;
      const timeId = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
      const reportNumber = `TST-${shortId}-${timeId}`;
      
      // Turkish character conversion for PDF compatibility
      const convertTurkish = (text: string): string => {
        if (!text) return '';
        return text
          .replace(/Ç/g, 'C').replace(/ç/g, 'c')
          .replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
          .replace(/İ/g, 'I').replace(/ı/g, 'i')
          .replace(/Ö/g, 'O').replace(/ö/g, 'o')
          .replace(/Ş/g, 'S').replace(/ş/g, 's')
          .replace(/Ü/g, 'U').replace(/ü/g, 'u');
      };
      
             // KADEME A.Ş. Corporate Colors
       const colors = {
         primary: [0, 102, 204] as [number, number, number],        // KADEME Blue
         secondary: [52, 152, 219] as [number, number, number],     // Light Blue
         success: [46, 204, 113] as [number, number, number],       // Green
         warning: [243, 156, 18] as [number, number, number],       // Orange
         danger: [231, 76, 60] as [number, number, number],         // Red
         dark: [44, 62, 80] as [number, number, number],            // Dark Gray
         light: [236, 240, 241] as [number, number, number],        // Light Gray
         white: [255, 255, 255] as [number, number, number]
       };
      
      doc.setFont('helvetica');
      
      // HEADER - Corporate Identity
      doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.rect(0, 0, 210, 40, 'F');
      
      // Company Info - Left Side
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.text('KADEME A.S.', 20, 17);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(convertTurkish('Kalite Yönetim Sistemi'), 20, 25);
      doc.text(convertTurkish('Kalite Kontrol Birimi'), 20, 32);
      
      // Report Title - Center
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(convertTurkish('TANK SIZDIRMAZLIK TEST RAPORU'), 105, 17, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('(Tank Leak Test Report)', 105, 25, { align: 'center' });
      doc.text('ISO 9001:2015 Uyumlu', 105, 32, { align: 'center' });
      
      // Report Info - Right Side
      doc.setFontSize(9);
      doc.text(`Rapor No: ${reportNumber}`, 195, 17, { align: 'right' });
      doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 195, 25, { align: 'right' });
      doc.text(`Saat: ${new Date().toLocaleTimeString('tr-TR')}`, 195, 32, { align: 'right' });
      
      doc.setTextColor(0, 0, 0);
      let y = 55;
      
      // Report Information Table
      autoTable(doc, {
        startY: y,
        head: [[convertTurkish('RAPOR BİLGİLERİ'), '']],
        body: [
          [convertTurkish('Rapor Numarası'), reportNumber],
          ['Test ID', test.id],
          ['Tarih', new Date().toLocaleDateString('tr-TR')],
          ['Saat', new Date().toLocaleTimeString('tr-TR')],
          ['Durum', test.testResult.result === 'passed' ? convertTurkish('ONAYLANMIŞ') : 
                    test.testResult.result === 'failed' ? convertTurkish('REDDEDİLMİŞ') : 
                    convertTurkish('ŞARTLI ONAY')]
        ],
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: colors.secondary, textColor: 255, fontSize: 11, fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold' }, 1: { cellWidth: 110 } }
      });
      
      y = (doc as any).lastAutoTable.finalY + 15;
      
      // Tank Information Table
      const tankInfo = [
        [convertTurkish('Tank Türü'), convertTurkish(test.tankInfo.type || 'Belirtilmemiş')],
        [convertTurkish('Malzeme'), convertTurkish(test.tankInfo.material || 'Belirtilmemiş')],
        [convertTurkish('Kapasite'), `${test.tankInfo.capacity || 0} m³`],
        [convertTurkish('Üretim Tarihi'), test.tankInfo.productionDate || convertTurkish('Belirtilmemiş')],
        [convertTurkish('Parti Numarası'), test.tankInfo.batchNumber || convertTurkish('Belirtilmemiş')]
      ];
      
      autoTable(doc, {
        startY: y,
        head: [[convertTurkish('TANK BİLGİLERİ'), '']],
        body: tankInfo,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: colors.success, textColor: 255, fontSize: 11, fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold' }, 1: { cellWidth: 110 } }
      });
      
      y = (doc as any).lastAutoTable.finalY + 15;
      
      // Personnel Information
      const personnelInfo = [
        [convertTurkish('Kaynakçı'), convertTurkish(test.personnel?.welder || 'Belirtilmemiş')],
        [convertTurkish('Kontrol Sorumlusu'), convertTurkish(test.personnel?.inspector || 'Belirtilmemiş')]
      ];
      
      autoTable(doc, {
        startY: y,
        head: [[convertTurkish('PERSONEL BİLGİLERİ'), '']],
        body: personnelInfo,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [155, 89, 182], textColor: 255, fontSize: 11, fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold' }, 1: { cellWidth: 110 } }
      });
      
      y = (doc as any).lastAutoTable.finalY + 15;
      
      // Vehicle Information
      const vehicleInfo = [
        [convertTurkish('Araç Modeli'), convertTurkish(test.vehicleInfo?.model || 'Belirtilmemiş')],
        [convertTurkish('Şasi Numarası'), test.vehicleInfo?.vinNumber || convertTurkish('Belirtilmemiş')],
        [convertTurkish('Tank Pozisyonu'), convertTurkish(test.vehicleInfo?.tankPosition || 'Belirtilmemiş')],
        [convertTurkish('Seri Numarası'), test.tankInfo?.serialNumber || convertTurkish('Belirtilmemiş')]
      ];
      
      autoTable(doc, {
        startY: y,
        head: [[convertTurkish('ARAÇ BİLGİLERİ'), '']],
        body: vehicleInfo,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [230, 126, 34], textColor: 255, fontSize: 11, fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold' }, 1: { cellWidth: 110 } }
      });
      
      y = (doc as any).lastAutoTable.finalY + 15;
      
      // Page break check
      if (y > 200) {
        doc.addPage();
        y = 30;
      }
      
      // Test Parameters - null check eklendi
      if (test.testParameters) {
        const testParams = [
          [convertTurkish('Test Türü'), convertTurkish(test.testParameters.testType || 'Belirtilmemiş')],
          [convertTurkish('Test Tarihi'), test.testParameters.testDate ? new Date(test.testParameters.testDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'],
          [convertTurkish('Test Basıncı'), `${test.testParameters.testPressure || 0} bar`],
          [convertTurkish('Test Süresi'), `${test.testParameters.testDuration || 0} dakika`],
          [convertTurkish('Ortam Sıcaklığı'), `${test.testParameters.ambientTemp || 0} °C`],
          [convertTurkish('Test Ekipmanı'), convertTurkish(test.testParameters.testEquipment || 'Belirtilmemiş')],
          [convertTurkish('Basınç Düşüşü'), `${test.testParameters.pressureDrop || 0} bar`]
        ];
        
        autoTable(doc, {
          startY: y,
          head: [[convertTurkish('TEST PARAMETRELERİ'), '']],
          body: testParams,
          theme: 'grid',
          styles: { font: 'helvetica', fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: colors.warning, textColor: 255, fontSize: 11, fontStyle: 'bold' },
          columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold' }, 1: { cellWidth: 110 } }
        });
        
        y = (doc as any).lastAutoTable.finalY + 15;
      }
      
      // Test Koşulları - Test türüne göre otomatik doldurulur
      if (test.testParameters?.testConditions) {
        const testConditions = [
          [convertTurkish('Test Öncesi Kontroller'), ''],
          ...(test.testParameters.testConditions.preTestChecks || []).map((check) => ['✓', convertTurkish(check)]),
          [convertTurkish('Güvenlik Gereksinimleri'), ''],
          ...(test.testParameters.testConditions.safetyRequirements || []).map((requirement) => ['⚠', convertTurkish(requirement)]),
          [convertTurkish('Çevresel Koşullar'), ''],
          ...(test.testParameters.testConditions.environmentalConditions || []).map((condition) => ['🌡', convertTurkish(condition)]),
          [convertTurkish('Ekipman Gereksinimleri'), ''],
          ...(test.testParameters.testConditions.equipmentRequirements || []).map((equipment) => ['🔧', convertTurkish(equipment)]),
          [convertTurkish('Prosedür Adımları'), ''],
          ...(test.testParameters.testConditions.proceduralSteps || []).map((step, index) => [`${index + 1}.`, convertTurkish(step)]),
          [convertTurkish('Kabul Kriterleri'), ''],
          ...(test.testParameters.testConditions.acceptanceCriteria || []).map((criteria) => ['✅', convertTurkish(criteria)])
        ];
        
        autoTable(doc, {
          startY: y,
          head: [[convertTurkish('TEST KOŞULLARI'), '']],
          body: testConditions,
          theme: 'grid',
          styles: { font: 'helvetica', fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: colors.secondary, textColor: 255, fontSize: 11, fontStyle: 'bold' },
          columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 150 } }
        });
        
        y = (doc as any).lastAutoTable.finalY + 15;
      }
      
      // Errors/Leaks if any
      if (test.errors && test.errors.length > 0) {
        const errorTableData = test.errors.map((error, index) => [
          `Hata ${index + 1}`,
          convertTurkish(error.errorType),
          convertTurkish(error.location),
          `${error.size} mm`,
          convertTurkish(error.repairMethod)
        ]);
        
        autoTable(doc, {
          startY: y,
          head: [[convertTurkish('HATA/SIZDIRMA BİLGİLERİ')]],
          body: [],
          theme: 'grid',
          styles: { font: 'helvetica', fontSize: 9 },
          headStyles: { fillColor: colors.danger, textColor: 255, fontSize: 11, fontStyle: 'bold', halign: 'center' },
          columnStyles: { 0: { cellWidth: 180 } }
        });
        
        y = (doc as any).lastAutoTable.finalY + 2;
        
        autoTable(doc, {
          startY: y,
          head: [['Hata No', convertTurkish('Hata Türü'), 'Konum', 'Boyut', convertTurkish('Tamir Yöntemi')]],
          body: errorTableData,
          theme: 'grid',
          styles: { font: 'helvetica', fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: colors.danger, textColor: 255, fontSize: 9, fontStyle: 'bold', halign: 'center' },
          columnStyles: {
            0: { cellWidth: 25, fontStyle: 'bold' },
            1: { cellWidth: 45 },
            2: { cellWidth: 40 },
            3: { cellWidth: 25 },
            4: { cellWidth: 45 }
          }
        });
        
        y = (doc as any).lastAutoTable.finalY + 15;
      }
      
      // Final Result Section
      if (y > 240) {
        doc.addPage();
        y = 30;
      }
      
      const statusColor = test.testResult.result === 'passed' ? colors.success :
                         test.testResult.result === 'failed' ? colors.danger :
                         colors.warning;
      
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.rect(30, y, 150, 25, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.text(convertTurkish('TEST SONUCU'), 105, y + 10, { align: 'center' });
      
             const resultText = test.testResult.result === 'passed' ? convertTurkish('BAŞARILI') :
                         test.testResult.result === 'failed' ? convertTurkish('BAŞARISIZ') :
                         convertTurkish('ŞARTLI KABUL');
       doc.text(resultText, 105, y + 20, { align: 'center' });
      
      y += 35;
      
      // Notes if any
      if (test.testResult.notes) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(convertTurkish('Açıklamalar:'), 30, y);
        doc.setFont('helvetica', 'normal');
        doc.text(convertTurkish(test.testResult.notes), 30, y + 8);
        y += 20;
      }
      
      // Signature Section
      const footerY = Math.max(y + 10, 275);
      doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
      doc.rect(15, footerY - 20, 180, 25, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(convertTurkish('İMZA VE ONAY'), 20, footerY - 12);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(convertTurkish('Test Operatörü:'), 25, footerY - 5);
      doc.text(convertTurkish(test.personnel?.inspector), 25, footerY);
      doc.text(convertTurkish('Kalite Kontrol:'), 95, footerY - 5);
      doc.text('..............................', 95, footerY);
      doc.text(convertTurkish('Müdür Onayı:'), 140, footerY - 5);
      doc.text('..............................', 140, footerY);
      
      // Footer (all pages)
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Sayfa ${i} / ${pageCount}`, 105, 285, { align: 'center' });
        doc.text(`Rapor No: ${reportNumber}`, 20, 285);
        doc.text(convertTurkish('KADEME A.Ş. - Kalite Kontrol Birimi'), 190, 285, { align: 'right' });
      }
      
      // Generate and download PDF
      const fileName = `TankSizdirmazlikTest_${test.tankInfo?.serialNumber || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken bir hata oluştu.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Professional Navigation Bar */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 4, 
        p: 2, 
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Button
          variant={activePage === 'form' ? 'contained' : 'outlined'}
          startIcon={<EngineeringIcon />}
          onClick={() => setActivePage('form')}
          size="large"
          sx={{ 
            minWidth: 180,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2
          }}
        >
          Test Formu
        </Button>
        <Button
          variant={activePage === 'history' ? 'contained' : 'outlined'}
          startIcon={<HistoryIcon />}
          onClick={() => setActivePage('history')}
          size="large"
          endIcon={
            <Chip 
              label={savedTests.length} 
              size="small"
              color={activePage === 'history' ? 'default' : 'primary'}
              sx={{ 
                bgcolor: activePage === 'history' ? 'rgba(255,255,255,0.2)' : 'primary.main',
                color: activePage === 'history' ? 'inherit' : 'white',
                fontWeight: 'bold'
              }}
            />
          }
          sx={{ 
            minWidth: 220,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2
          }}
        >
          Test Geçmişi & İzleme
        </Button>
        <Button
          variant={activePage === 'repair' ? 'contained' : 'outlined'}
          startIcon={<BuildIcon />}
          onClick={() => setActivePage('repair')}
          size="large"
          endIcon={
            <Chip 
              label={repairRecords.length} 
              size="small"
              color={activePage === 'repair' ? 'default' : 'primary'}
              sx={{ 
                bgcolor: activePage === 'repair' ? 'rgba(255,255,255,0.2)' : 'primary.main',
                color: activePage === 'repair' ? 'inherit' : 'white',
                fontWeight: 'bold'
              }}
            />
          }
          sx={{ 
            minWidth: 220,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2
          }}
        >
          Tamir/Tashih Yönetimi
        </Button>
        <Button
          variant="outlined"
          startIcon={<StatsIcon />}
          onClick={() => {/* handleExportAllTests(); */}}
          disabled={savedTests.length === 0}
          size="large"
          sx={{ 
            minWidth: 180,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            opacity: savedTests.length === 0 ? 0.5 : 1
          }}
        >
          Rapor İndir
        </Button>
      </Box>

      {/* Filtreleme Bölümü */}
      <StyledAccordion 
        expanded={filterExpanded} 
        onChange={(_, isExpanded) => setFilterExpanded(isExpanded)}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          sx={{
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
              gap: 2
            }
          }}
        >
          <FilterAltIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Filtreleme ve Arama
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Genel Arama */}
            <Grid item xs={12} md={6}>
              <UltraStableSearchInput
                value={filters.searchTerm}
                onChange={(value) => setFilters({...filters, searchTerm: value})}
                label="Genel Arama"
                placeholder="Seri no, tank türü, model, personel..."
                size="medium"
                fullWidth={true}
              />
            </Grid>

            {/* Seri Numarası */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Seri Numarası"
                value={filters.serialNumber}
                onChange={(e) => setFilters({...filters, serialNumber: e.target.value})}
              />
            </Grid>

            {/* Tank Türü */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Tank Türü</InputLabel>
                <Select
                  value={filters.tankType}
                  onChange={(e) => setFilters({...filters, tankType: e.target.value})}
                  label="Tank Türü"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="Mazot Tankı">Mazot Tankı</MenuItem>
                  <MenuItem value="Su Tankı">Su Tankı</MenuItem>
                  <MenuItem value="AdBlue Tankı">AdBlue Tankı</MenuItem>
                  <MenuItem value="Yağ Tankı">Yağ Tankı</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Test Türü */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Test Türü</InputLabel>
                <Select
                  value={filters.testType}
                  onChange={(e) => setFilters({...filters, testType: e.target.value})}
                  label="Test Türü"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="Basınç Testi">Basınç Testi</MenuItem>
                  <MenuItem value="Sızdırmazlık Testi">Sızdırmazlık Testi</MenuItem>
                  <MenuItem value="Vakum Testi">Vakum Testi</MenuItem>
                  <MenuItem value="Hidrostatik Test">Hidrostatik Test</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Test Sonucu */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Test Sonucu</InputLabel>
                <Select
                  value={filters.testResult}
                  onChange={(e) => setFilters({...filters, testResult: e.target.value})}
                  label="Test Sonucu"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="passed">Başarılı</MenuItem>
                  <MenuItem value="failed">Başarısız</MenuItem>
                  <MenuItem value="conditional">Şartlı Kabul</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Tamir Durumu */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Tamir Durumu</InputLabel>
                <Select
                  value={filters.repairStatus}
                  onChange={(e) => setFilters({...filters, repairStatus: e.target.value})}
                  label="Tamir Durumu"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="none">Tamir Yok</MenuItem>
                  <MenuItem value="planned">Planlanan</MenuItem>
                  <MenuItem value="in_progress">Devam Ediyor</MenuItem>
                  <MenuItem value="completed">Tamamlandı</MenuItem>
                  <MenuItem value="cancelled">İptal Edildi</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Dönem Seçimi */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Dönem</InputLabel>
                <Select
                  value={filters.period}
                  onChange={(e) => setFilters({...filters, period: e.target.value})}
                  label="Dönem"
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

            {/* Yıl Seçimi */}
            {filters.period && filters.period !== 'custom' && (
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Yıl</InputLabel>
                  <Select
                    value={filters.year}
                    onChange={(e) => setFilters({...filters, year: e.target.value})}
                    label="Yıl"
                  >
                    {yearOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Ay Seçimi */}
            {filters.period === 'monthly' && (
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Ay</InputLabel>
                  <Select
                    value={filters.month}
                    onChange={(e) => setFilters({...filters, month: e.target.value})}
                    label="Ay"
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

            {/* Çeyrek Seçimi */}
            {filters.period === 'quarterly' && (
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Çeyrek</InputLabel>
                  <Select
                    value={filters.quarter}
                    onChange={(e) => setFilters({...filters, quarter: e.target.value})}
                    label="Çeyrek"
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
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Başlangıç Tarihi"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Bitiş Tarihi"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

            {/* Filter Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => setFilters({
                    serialNumber: '',
                    tankType: '',
                    testType: '',
                    testResult: '',
                    dateFrom: '',
                    dateTo: '',
                    searchTerm: '',
                    repairStatus: '',
                    period: '',
                    year: new Date().getFullYear().toString(),
                    month: '',
                    quarter: ''
                  })}
                  startIcon={<ClearIcon />}
                >
                  Filtreleri Temizle
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setFilterExpanded(false)}
                  startIcon={<FilterAltIcon />}
                >
                  Filtreleri Uygula
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </StyledAccordion>

      {/* Test Formu */}
      {activePage === 'form' && (
        <Box>
          {/* Tank Bilgileri */}
          <StyledCard>
            <CardHeader
              avatar={<EngineeringIcon color="primary" />}
              title="Tank Bilgileri"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                <TextField
                  label="Seri Numarası"
                  value={tankInfo.serialNumber}
                  onChange={(e) => setTankInfo({ ...tankInfo, serialNumber: e.target.value })}
                  fullWidth
                  required
                />
                <FormControl fullWidth required>
                  <InputLabel>Tank Türü</InputLabel>
                  <Select
                    value={tankInfo.type}
                    onChange={(e) => setTankInfo({ ...tankInfo, type: e.target.value })}
                    label="Tank Türü"
                  >
                    {customLists.tankTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>Malzeme</InputLabel>
                  <Select
                    value={tankInfo.material}
                    onChange={(e) => setTankInfo({ ...tankInfo, material: e.target.value })}
                    label="Malzeme"
                  >
                    {customLists.tankMaterials.map((material) => (
                      <MenuItem key={material} value={material}>{material}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                              <TextField
                  label="Kapasite (m³)"
                type="number"
                  value={tankInfo.capacity || ''}
                  onChange={(e) => setTankInfo({ ...tankInfo, capacity: Number(e.target.value) })}
                  fullWidth
                  required
                />
                <TextField
                  label="Üretim Tarihi"
                  type="date"
                  value={tankInfo.productionDate}
                  onChange={(e) => setTankInfo({ ...tankInfo, productionDate: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  label="Parti Numarası"
                  value={tankInfo.batchNumber}
                  onChange={(e) => setTankInfo({ ...tankInfo, batchNumber: e.target.value })}
                  fullWidth
                  required
                />
              </Box>
            </CardContent>
          </StyledCard>

          {/* Test Parametreleri */}
          <StyledCard>
            <CardHeader
              avatar={<ScienceIcon color="primary" />}
              title="Test Parametreleri"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel>Test Türü</InputLabel>
                  <Select
                    value={testParameters.testType}
                    onChange={(e) => handleTestTypeChange(e.target.value)}
                    label="Test Türü"
                  >
                    {customLists.testTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Test Tarihi"
                  type="date"
                  value={testParameters.testDate}
                  onChange={(e) => setTestParameters({ ...testParameters, testDate: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  label="Test Basıncı (bar)"
                  type="number"
                  value={testParameters.testPressure || ''}
                  onChange={(e) => setTestParameters({ ...testParameters, testPressure: Number(e.target.value) })}
                  fullWidth
                  required
                />
                <TextField
                  label="Test Süresi (dk)"
                  type="number"
                  value={testParameters.testDuration || ''}
                  onChange={(e) => setTestParameters({ ...testParameters, testDuration: Number(e.target.value) })}
                  fullWidth
                  required
                />
                <TextField
                  label="Ortam Sıcaklığı (°C)"
                  type="number"
                  value={testParameters.ambientTemp || ''}
                  onChange={(e) => setTestParameters({ ...testParameters, ambientTemp: Number(e.target.value) })}
                  fullWidth
                  required
                />
                <TextField
                  label="Test Ekipmanı"
                  value={testParameters.testEquipment}
                  onChange={(e) => setTestParameters({ ...testParameters, testEquipment: e.target.value })}
                  fullWidth
                  required
                />
              </Box>
            </CardContent>
          </StyledCard>

          {/* Test Koşulları - Test türüne göre otomatik doldurulur */}
          {testParameters.testConditions && (
            <StyledCard>
              <CardHeader
                avatar={<InfoIcon color="primary" />}
                title="Test Koşulları"
                titleTypographyProps={{ variant: 'h6' }}
                subheader={`${testParameters.testType} için otomatik belirlenen test koşulları`}
              />
              <CardContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 4 }}>
                  
                  {/* Test Öncesi Kontroller */}
                  <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckCircleIcon sx={{ fontSize: 20, mr: 1.5, color: 'success.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        Test Öncesi Kontroller
                      </Typography>
                    </Box>
                    <Box component="ul" sx={{ pl: 2, m: 0, listStyle: 'none' }}>
                      {testParameters.testConditions.preTestChecks.map((check, index) => (
                        <Box component="li" key={index} sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                          <Box sx={{ 
                            width: 6, 
                            height: 6, 
                            borderRadius: '50%', 
                            bgcolor: 'success.main', 
                            mt: 1, 
                            mr: 1.5,
                            flexShrink: 0
                          }} />
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {check}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>

                  {/* Güvenlik Gereksinimleri */}
                  <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <WarningIcon sx={{ fontSize: 20, mr: 1.5, color: 'warning.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                        Güvenlik Gereksinimleri
                      </Typography>
                    </Box>
                    <Box component="ul" sx={{ pl: 2, m: 0, listStyle: 'none' }}>
                      {testParameters.testConditions.safetyRequirements.map((requirement, index) => (
                        <Box component="li" key={index} sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                          <Box sx={{ 
                            width: 6, 
                            height: 6, 
                            borderRadius: '50%', 
                            bgcolor: 'warning.main', 
                            mt: 1, 
                            mr: 1.5,
                            flexShrink: 0
                          }} />
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {requirement}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>

                  {/* Çevresel Koşullar */}
                  <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <InfoIcon sx={{ fontSize: 20, mr: 1.5, color: 'info.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                        Çevresel Koşullar
                      </Typography>
                    </Box>
                    <Box component="ul" sx={{ pl: 2, m: 0, listStyle: 'none' }}>
                      {testParameters.testConditions.environmentalConditions.map((condition, index) => (
                        <Box component="li" key={index} sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                          <Box sx={{ 
                            width: 6, 
                            height: 6, 
                            borderRadius: '50%', 
                            bgcolor: 'info.main', 
                            mt: 1, 
                            mr: 1.5,
                            flexShrink: 0
                          }} />
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {condition}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>

                  {/* Ekipman Gereksinimleri */}
                  <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EngineeringIcon sx={{ fontSize: 20, mr: 1.5, color: 'secondary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                        Ekipman Gereksinimleri
                      </Typography>
                    </Box>
                    <Box component="ul" sx={{ pl: 2, m: 0, listStyle: 'none' }}>
                      {testParameters.testConditions.equipmentRequirements.map((equipment, index) => (
                        <Box component="li" key={index} sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                          <Box sx={{ 
                            width: 6, 
                            height: 6, 
                            borderRadius: '50%', 
                            bgcolor: 'secondary.main', 
                            mt: 1, 
                            mr: 1.5,
                            flexShrink: 0
                          }} />
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {equipment}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>

                  {/* Prosedür Adımları */}
                  <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TimelineIcon sx={{ fontSize: 20, mr: 1.5, color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Prosedür Adımları
                      </Typography>
                    </Box>
                    <Box component="ol" sx={{ pl: 0, m: 0, listStyle: 'none', counter: 'reset: step-counter' }}>
                      {testParameters.testConditions.proceduralSteps.map((step, index) => (
                        <Box 
                          component="li" 
                          key={index} 
                          sx={{ 
                            mb: 1.5, 
                            display: 'flex', 
                            alignItems: 'flex-start',
                            counterIncrement: 'step-counter'
                          }}
                        >
                          <Box sx={{ 
                            minWidth: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            mr: 1.5,
                            mt: 0.25
                          }}>
                            {index + 1}
                          </Box>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {step}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>

                  {/* Kabul Kriterleri */}
                  <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckCircleIcon sx={{ fontSize: 20, mr: 1.5, color: 'success.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        Kabul Kriterleri
                      </Typography>
                    </Box>
                    <Box component="ul" sx={{ pl: 2, m: 0, listStyle: 'none' }}>
                      {testParameters.testConditions.acceptanceCriteria.map((criteria, index) => (
                        <Box component="li" key={index} sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                          <CheckCircleIcon sx={{ 
                            fontSize: 16, 
                            color: 'success.main', 
                            mt: 0.25, 
                            mr: 1.5,
                            flexShrink: 0
                          }} />
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {criteria}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>

                </Box>
              </CardContent>
            </StyledCard>
          )}

          {/* Üretim Personeli */}
          <StyledCard>
            <CardHeader
              avatar={<PersonIcon color="primary" />}
              title="Üretim Personeli"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 4,
                alignItems: 'start'
              }}>
                {/* Kaynak Personeli Seçimi */}
                <Box sx={{ 
                  width: '100%',
                  minWidth: 0
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    mb: 2,
                    height: 40
                  }}>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 'bold', 
                      color: 'primary.main',
                      fontSize: '1rem'
                    }}>
                      Kaynak Personeli
                    </Typography>
                    <Tooltip title="Yeni Kaynak Personeli Ekle">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => setPersonnelDialog('welder')}
                        sx={{ 
                          bgcolor: 'primary.light',
                          color: 'white',
                          width: 36,
                          height: 36,
                          flexShrink: 0,
                          '&:hover': { 
                            bgcolor: 'primary.main',
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        <PersonAddIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <FormControl fullWidth required>
                    <InputLabel>Kaynak Personeli Seçin</InputLabel>
                    <Select
                      value={personnel.welder}
                      onChange={(e) => setPersonnel({ ...personnel, welder: e.target.value })}
                      label="Kaynak Personeli Seçin"
                      sx={{ 
                        height: 56,
                        width: '100%',
                        minWidth: 0,
                        '& .MuiSelect-select': {
                          height: '56px !important',
                          boxSizing: 'border-box',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 14px !important'
                        },
                        '& .MuiOutlinedInput-root': {
                          height: '56px !important'
                        },
                        '& .MuiInputLabel-root': {
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }
                      }}
                    >
                      {customLists.welders.map((welder) => (
                        <MenuItem key={welder.id} value={welder.name}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {welder.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Sicil: {welder.employeeId}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePersonnel(welder.id, 'welder');
                              }}
                              sx={{ ml: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Kalite Kontrol Sorumlusu Seçimi */}
                <Box sx={{ 
                  width: '100%',
                  minWidth: 0
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    mb: 2,
                    height: 40
                  }}>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 'bold', 
                      color: 'primary.main',
                      fontSize: '1rem'
                    }}>
                      Kalite Kontrol Sorumlusu
                    </Typography>
                    <Tooltip title="Yeni Kalite Kontrol Sorumlusu Ekle">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => setPersonnelDialog('inspector')}
                        sx={{ 
                          bgcolor: 'primary.light',
                          color: 'white',
                          width: 36,
                          height: 36,
                          flexShrink: 0,
                          '&:hover': { 
                            bgcolor: 'primary.main',
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        <PersonAddIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <FormControl fullWidth required>
                    <InputLabel>Kalite Kontrol Sorumlusu Seçin</InputLabel>
                    <Select
                      value={personnel.inspector}
                      onChange={(e) => setPersonnel({ ...personnel, inspector: e.target.value })}
                      label="Kalite Kontrol Sorumlusu Seçin"
                      sx={{ 
                        height: 56,
                        width: '100%',
                        minWidth: 0,
                        '& .MuiSelect-select': {
                          height: '56px !important',
                          boxSizing: 'border-box',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 14px !important'
                        },
                        '& .MuiOutlinedInput-root': {
                          height: '56px !important'
                        },
                        '& .MuiInputLabel-root': {
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }
                      }}
                    >
                      {customLists.inspectors.map((inspector) => (
                        <MenuItem key={inspector.id} value={inspector.name}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {inspector.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Sicil: {inspector.employeeId}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePersonnel(inspector.id, 'inspector');
                              }}
                              sx={{ ml: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>

          {/* Araç Bilgileri */}
          <StyledCard>
            <CardHeader
              avatar={<CarIcon color="primary" />}
              title="Araç Bilgileri"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                <TextField
                  label="Araç Modeli"
                  value={vehicleInfo.model}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, model: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Şasi Numarası (VIN)"
                  value={vehicleInfo.vinNumber}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, vinNumber: e.target.value })}
                  fullWidth
                  required
                />
                <FormControl fullWidth required>
                  <InputLabel>Tank Pozisyonu</InputLabel>
                  <Select
                    value={vehicleInfo.tankPosition}
                    onChange={(e) => setVehicleInfo({ ...vehicleInfo, tankPosition: e.target.value })}
                    label="Tank Pozisyonu"
                  >
                    {customLists.tankPositions.map((position) => (
                      <MenuItem key={position} value={position}>{position}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Seri Numarası"
                  value={tankInfo.serialNumber}
                  onChange={(e) => setTankInfo({ ...tankInfo, serialNumber: e.target.value })}
                  fullWidth
                  required
                  placeholder="örn: TK-2024-001"
                  helperText="Tank seri numarasını girin"
                />
              </Box>
            </CardContent>
          </StyledCard>

          {/* Test Parametrelerinden sonra Basınç Düşüşü ekleyelim */}
          <StyledCard>
            <CardHeader
              avatar={<ScienceIcon color="primary" />}
              title="Test Sonuçları"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                <TextField
                  label="Basınç Düşüşü (bar)"
                  type="number"
                  value={testParameters.pressureDrop || ''}
                  onChange={(e) => setTestParameters({ ...testParameters, pressureDrop: Number(e.target.value) })}
                  fullWidth
                  required
                  InputProps={{
                    inputProps: { step: 0.001, min: 0 }
                  }}
                />
              </Box>
            </CardContent>
          </StyledCard>

          {/* Hata/Sızıntı Bilgileri */}
          <StyledCard>
            <CardHeader
              avatar={<BugReportIcon color="primary" />}
              title="Hata/Sızıntı Bilgileri"
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <Button
                  startIcon={<AddIcon />}
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const newError: ErrorRecord = {
                      id: Date.now().toString(),
                      errorType: '',
                      location: '',
                      size: 0,
                      repairMethod: ''
                    };
                    setErrors([...errors, newError]);
                  }}
                >
                  Hata Ekle
                </Button>
              }
            />
            <CardContent>
              {errors.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  Hata/sızıntı bilgisi bulunamadı. Yeni hata eklemek için "Hata Ekle" butonunu kullanın.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {errors.map((error, index) => (
                    <ErrorCard key={error.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2">Hata #{index + 1}</Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setErrors(errors.filter(e => e.id !== error.id))}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                        <FormControl fullWidth>
                          <InputLabel>Hata Türü</InputLabel>
                          <Select
                            value={error.errorType}
                            onChange={(e) => {
                              const updatedErrors = errors.map(err => 
                                err.id === error.id ? { ...err, errorType: e.target.value } : err
                              );
                              setErrors(updatedErrors);
                            }}
                            label="Hata Türü"
                          >
                            {customLists.errorTypes.map((type) => (
                              <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          label="Konum/Lokasyon"
                          value={error.location}
                          onChange={(e) => {
                            const updatedErrors = errors.map(err => 
                              err.id === error.id ? { ...err, location: e.target.value } : err
                            );
                            setErrors(updatedErrors);
                          }}
                          fullWidth
                        />
                        <TextField
                          label="Boyut (mm)"
                          type="number"
                          value={error.size || ''}
                          onChange={(e) => {
                            const updatedErrors = errors.map(err => 
                              err.id === error.id ? { ...err, size: Number(e.target.value) } : err
                            );
                            setErrors(updatedErrors);
                          }}
                          fullWidth
                        />
                        <FormControl fullWidth>
                          <InputLabel>Tamir Yöntemi</InputLabel>
                          <Select
                            value={error.repairMethod}
                            onChange={(e) => {
                              const updatedErrors = errors.map(err => 
                                err.id === error.id ? { ...err, repairMethod: e.target.value } : err
                              );
                              setErrors(updatedErrors);
                            }}
                            label="Tamir Yöntemi"
                          >
                            {customLists.repairMethods.map((method) => (
                              <MenuItem key={method} value={method}>{method}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </ErrorCard>
                  ))}
                </Box>
              )}
            </CardContent>
          </StyledCard>

          {/* Sonuç ve Onay */}
          <StyledCard>
            <CardHeader
              avatar={<CheckCircleIcon color="primary" />}
              title="Sonuç ve Onay"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl component="fieldset">
                  <Typography variant="subtitle1" gutterBottom>Test Sonucu</Typography>
                  <RadioGroup
                    value={testResult.result}
                    onChange={(e) => setTestResult({ ...testResult, result: e.target.value as 'passed' | 'failed' | 'conditional' })}
                    row
                  >
                    <FormControlLabel
                      value="passed"
                      control={<Radio color="success" />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon color="success" fontSize="small" />
                          <span>Başarılı</span>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="failed"
                      control={<Radio color="error" />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ErrorIcon color="error" fontSize="small" />
                          <span>Başarısız</span>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="conditional"
                      control={<Radio color="warning" />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WarningIcon color="warning" fontSize="small" />
                          <span>Şartlı Kabul</span>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                <FormControlLabel
                  control={
                    <Radio
                      checked={testResult.retestRequired}
                      onChange={(e) => setTestResult({ ...testResult, retestRequired: e.target.checked })}
                      color="warning"
                    />
                  }
                  label="Yeniden Test Gerekli"
                />

                <TextField
                  label="Açıklamalar/Notlar"
                  multiline
                  rows={4}
                  value={testResult.notes}
                  onChange={(e) => setTestResult({ ...testResult, notes: e.target.value })}
                  fullWidth
                  placeholder="Test ile ilgili özel notlar, gözlemler ve açıklamalar..."
                />
              </Box>
            </CardContent>
          </StyledCard>

          {/* Kaydet Butonları */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              size="large"
              sx={{ minWidth: 200 }}
              onClick={handleSaveTest}
            >
              Testi Kaydet ve Değerlendir
            </Button>
            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              size="large"
              sx={{ minWidth: 200 }}
              onClick={handleGeneratePDFFromForm}
            >
              PDF Rapor Oluştur
            </Button>
          </Box>
        </Box>
      )}

      {/* Test Geçmişi */}
      {activePage === 'history' && (
        <Box>
          {/* İstatistikler */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <StatsIcon color="primary" sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h4" color="primary">{testStatistics.totalTests}</Typography>
              <Typography variant="body2" color="text.secondary">Toplam Test</Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h4" color="success.main">{testStatistics.passedTests}</Typography>
              <Typography variant="body2" color="text.secondary">Başarılı Test</Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <ErrorIcon color="error" sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h4" color="error.main">{testStatistics.failedTests}</Typography>
              <Typography variant="body2" color="text.secondary">Başarısız Test</Typography>
            </Paper>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <TimelineIcon color="info" sx={{ fontSize: 30, mb: 1 }} />
              <Typography variant="h4" color="info.main">{testStatistics.successRate}%</Typography>
              <Typography variant="body2" color="text.secondary">Başarı Oranı</Typography>
            </Paper>
          </Box>

          {/* Test Tablosu */}
          <StyledCard>
            <CardHeader
              avatar={<HistoryIcon color="primary" />}
              title="Test Kayıtları"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              {getFilteredData().length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <InfoIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    {savedTests.length === 0 ? 'Henüz kayıtlı test bulunmuyor' : 'Filtrelere uygun test bulunamadı'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {savedTests.length === 0 ? 'İlk testinizi eklemek için "Test Formu" sekmesini kullanın' : 'Filtreleri değiştirerek tekrar deneyin'}
                  </Typography>
                </Box>
              ) : (
                <TableContainer 
                  component={Paper} 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2, 
                    maxHeight: 600, 
                    overflow: 'auto',
                    '& .MuiTableHead-root': {
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      backgroundColor: 'background.paper'
                    }
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ 
                        '& .MuiTableCell-head': {
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          padding: '8px 4px',
                          borderRight: '1px solid rgba(255,255,255,0.2)'
                        }
                      }}>
                        <TableCell sx={{ width: '90px' }}>Seri No</TableCell>
                        <TableCell sx={{ width: '80px' }}>Tür</TableCell>
                        <TableCell sx={{ width: '70px' }}>Tarih</TableCell>
                        <TableCell sx={{ width: '80px' }}>Test</TableCell>
                        <TableCell sx={{ width: '100px' }}>Kaynak</TableCell>
                        <TableCell sx={{ width: '100px' }}>Kontrol</TableCell>
                        <TableCell sx={{ width: '80px' }}>Tamir</TableCell>
                        <TableCell sx={{ width: '80px' }}>Sonuç</TableCell>
                        <TableCell sx={{ width: '100px' }} align="center">İşlemler</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getFilteredData().slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((test) => {
                        // İlgili tamir kaydını bul
                        const relatedRepair = test.repairRecordId ? 
                          repairRecords.find(r => r.id === test.repairRecordId) : null;
                        
                        return (
                          <TableRow 
                            key={test.id}
                            sx={{ 
                              '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                              '&:hover': { backgroundColor: 'action.selected' },
                              '& .MuiTableCell-body': {
                                fontSize: '0.7rem',
                                padding: '6px 4px',
                                borderRight: '1px solid rgba(0,0,0,0.1)'
                              }
                            }}
                          >
                            <TableCell>
                              <Typography variant="caption" fontWeight="bold" sx={{ color: 'primary.main' }}>
                                {test.tankInfo?.serialNumber || 'Yok'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" sx={{ 
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {(test.tankInfo?.type || 'Yok').replace(' Tankı', '')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">
                                {test.testParameters?.testDate 
                                  ? new Date(test.testParameters.testDate).toLocaleDateString('tr-TR', {day: '2-digit', month: '2-digit', year: '2-digit'})
                                  : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" sx={{ 
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {(test.testParameters?.testType || 'Yok').replace(' Testi', '')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" sx={{ 
                                color: 'primary.main',
                                fontWeight: 'medium',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {test.personnel?.welder || 'Yok'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" sx={{ 
                                color: 'success.main',
                                fontWeight: 'medium',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {test.personnel?.inspector || 'Yok'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" sx={{ 
                                color: 'text.secondary',
                                fontStyle: 'italic'
                              }}>
                                {(() => {
                                  if (relatedRepair && relatedRepair.status === 'completed' && relatedRepair.completedAt) {
                                    return new Date(relatedRepair.completedAt).toLocaleDateString('tr-TR', {day: '2-digit', month: '2-digit', year: '2-digit'});
                                  }
                                  return '-';
                                })()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  test.testResult?.result === 'passed' ? 'Başarılı' :
                                  test.testResult?.result === 'failed' ? 'Başarısız' : 
                                  test.testResult?.result === 'conditional' ? 'Şartlı' : 'Belirsiz'
                                }
                                color={
                                  test.testResult?.result === 'passed' ? 'success' :
                                  test.testResult?.result === 'failed' ? 'error' : 
                                  test.testResult?.result === 'conditional' ? 'warning' : 'default'
                                }
                                size="small"
                                sx={{ height: '20px', fontSize: '0.6rem' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                <Tooltip title="Düzenle">
                                  <IconButton 
                                    size="small"
                                    onClick={() => {
                                      // Test verilerini forma yükle - null check ile
                                      if (test.tankInfo) setTankInfo(test.tankInfo);
                                      if (test.personnel) setPersonnel(test.personnel);
                                      if (test.vehicleInfo) setVehicleInfo(test.vehicleInfo);
                                      if (test.testParameters) setTestParameters(test.testParameters);
                                      if (test.errors) setErrors(test.errors);
                                      if (test.testResult) setTestResult(test.testResult);
                                      // Test formu sayfasına geç
                                      setActivePage('form');
                                    }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="PDF İndir">
                                  <IconButton 
                                    size="small"
                                    color="error"
                                    onClick={() => handleGeneratePDFForTest(test)}
                                    disabled={!test.tankInfo || !test.testResult}
                                  >
                                    <PdfIcon />
                                  </IconButton>
                                </Tooltip>
                                {/* Başarısız ve şartlı testler için Tamir/Tashih Kaydı Oluştur butonu */}
                                {(test.testResult?.result === 'failed' || test.testResult?.result === 'conditional') && (
                                  <>
                                    {test.repairRecordId ? (
                                      <Tooltip title={`Tamir Kaydı Mevcut: ${test.repairRecordId}`}>
                                        <IconButton 
                                          size="small"
                                          color="success"
                                          onClick={() => {
                                            // Tamir sayfasına geç ve ilgili kaydı göster
                                            setActivePage('repair');
                                            const repairRecord = repairRecords.find(r => r.id === test.repairRecordId);
                                            if (repairRecord) {
                                              setSelectedRepairRecord(repairRecord);
                                            }
                                          }}
                                        >
                                          <RepairDoneIcon />
                                        </IconButton>
                                      </Tooltip>
                                    ) : (
                                      <Tooltip title="Tamir/Tashih Kaydı Oluştur">
                                        <IconButton 
                                          size="small"
                                          color="warning"
                                          onClick={() => handleCreateRepairFromTest(test)}
                                          disabled={!test.tankInfo || !test.testResult}
                                        >
                                          <BuildIcon />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </>
                                )}
                                {/* DÖF Oluştur butonu - sadece başarısız ve şartlı testler için */}
                                {(test.testResult?.result === 'failed' || test.testResult?.result === 'conditional') && (
                                  <Tooltip title={getDOFStatusForTest(test) ? `DÖF Mevcut: ${getDOFStatusForTest(test)?.dofNumber}` : "Uygunsuzluk Oluştur"}>
                                    <IconButton 
                                      size="small"
                                      onClick={() => handleCreateDOFForTest(test)}
                                      disabled={!!getDOFStatusForTest(test)}
                                      sx={{ 
                                        color: getDOFStatusForTest(test) ? 'success.main' : 'error.main',
                                        '&:disabled': { color: 'success.main' }
                                      }}
                                    >
                                      <ReportIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {/* Test kaydı silme butonu */}
                                <Tooltip title="Test Kaydını Sil">
                                  <IconButton 
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteTest(test.id)}
                                    sx={{ color: 'error.main' }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={getFilteredData().length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                    labelRowsPerPage="Sayfa başına:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                  />
                </TableContainer>
              )}
            </CardContent>
          </StyledCard>
        </Box>
      )}

      {/* Tamir/Tashih Yönetimi Sayfası */}
      {activePage === 'repair' && (
        <Box>
          {/* İstatistik Kartları */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Toplam Tamir
                      </Typography>
                      <Typography variant="h4">
                        {repairRecords.length}
                      </Typography>
                    </Box>
                    <BuildIcon color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Devam Eden
                      </Typography>
                      <Typography variant="h4">
                        {repairRecords.filter(r => r.status === 'in_progress').length}
                      </Typography>
                    </Box>
                    <SettingsIcon color="warning" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        Tamamlanan
                      </Typography>
                      <Typography variant="h4">
                        {repairRecords.filter(r => r.status === 'completed').length}
                      </Typography>
                    </Box>
                    <CleaningServicesIcon color="success" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>

          </Grid>

          {/* Tamir Kayıtları Tablosu */}
          <StyledCard>
            <CardHeader
              avatar={<BuildIcon color="primary" />}
              title="Tamir/Tashih Kayıtları"
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      // Yeni tamir planı dialog'u açılacak
                      console.log('Yeni tamir planı oluştur');
                    }}
                    size="small"
                  >
                    Yeni Tamir Planı
                  </Button>
                  <IconButton
                    onClick={() => {
                      loadRepairRecords();
                      calculateTankRepairHistory(repairRecords);
                    }}
                    size="small"
                    color="primary"
                  >
                    <RefreshIcon />
                  </IconButton>
                </Box>
              }
            />
            <CardContent>
              {repairRecords.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <BuildIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Tamir kaydı bulunamadı
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Başarısız testler sonrası tamir kayıtları burada görünecek
                  </Typography>
                </Box>
              ) : (
                <TableContainer 
                  component={Paper} 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2, 
                    maxHeight: 600, 
                    overflow: 'auto',
                    '& .MuiTableHead-root': {
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      backgroundColor: 'background.paper'
                    }
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ 
                        '& .MuiTableCell-head': {
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          padding: '8px 4px',
                          borderRight: '1px solid rgba(255,255,255,0.2)'
                        }
                      }}>
                        <TableCell sx={{ width: '120px' }}>Seri No</TableCell>
                        <TableCell sx={{ width: '80px' }}>Tarih</TableCell>
                        <TableCell sx={{ width: '120px' }}>Kaynak Yapan</TableCell>
                        <TableCell sx={{ width: '120px' }}>Kalite Kontrol</TableCell>
                        <TableCell sx={{ width: '100px' }}>Tamir Türü</TableCell>
                        <TableCell sx={{ width: '80px' }}>Öncelik</TableCell>
                        <TableCell sx={{ width: '120px' }}>Durum</TableCell>
                        <TableCell sx={{ width: '80px' }} align="center">İşlem</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {repairRecords.map((repair, index) => (
                        <TableRow 
                          key={repair.id}
                          sx={{ 
                            '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                            '&:hover': { backgroundColor: 'action.selected' },
                            '& .MuiTableCell-body': {
                              fontSize: '0.7rem',
                              padding: '6px 4px',
                              borderRight: '1px solid',
                              borderColor: 'divider'
                            }
                          }}
                        >
                          <TableCell>
                            <Typography variant="caption" fontWeight="bold">
                              {repair.tankInfo.serialNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(repair.repairInfo.repairDate).toLocaleDateString('tr-TR', {day: '2-digit', month: '2-digit', year: '2-digit'})}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ 
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              color: 'primary.main',
                              fontWeight: 'medium'
                            }}>
                              {repair.personnel.repairTechnician || 'Belirtilmemiş'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ 
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              color: 'success.main',
                              fontWeight: 'medium'
                            }}>
                              {repair.personnel.qualityControlPersonnel || 'Belirtilmemiş'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                repair.repairInfo.repairType === 'welding' ? 'Kaynak' :
                                repair.repairInfo.repairType === 'patching' ? 'Yama' :
                                repair.repairInfo.repairType === 'replacement' ? 'Değişim' :
                                repair.repairInfo.repairType === 'cleaning' ? 'Temizlik' :
                                repair.repairInfo.repairType === 'adjustment' ? 'Ayarlama' : 'Diğer'
                              }
                              size="small"
                              variant="outlined"
                              sx={{ 
                                height: '24px',
                                fontSize: '0.65rem',
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                repair.repairInfo.priority === 'critical' ? 'Kritik' :
                                repair.repairInfo.priority === 'high' ? 'Yüksek' :
                                repair.repairInfo.priority === 'medium' ? 'Orta' : 'Düşük'
                              }
                              color={
                                repair.repairInfo.priority === 'critical' ? 'error' :
                                repair.repairInfo.priority === 'high' ? 'warning' :
                                repair.repairInfo.priority === 'medium' ? 'info' : 'default'
                              }
                              size="small"
                              sx={{ 
                                height: '24px',
                                fontSize: '0.65rem',
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                repair.status === 'planned' ? 'Planlanan' :
                                repair.status === 'in_progress' ? 'Devam Ediyor' :
                                repair.status === 'quality_check' ? 'Kalite Kontrolü' :
                                repair.status === 'retest_required' ? 'Yeniden Test' :
                                repair.status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'
                              }
                              color={
                                repair.status === 'completed' ? 'success' :
                                repair.status === 'in_progress' ? 'warning' :
                                repair.status === 'cancelled' ? 'error' : 'default'
                              }
                              size="small"
                              sx={{ 
                                height: '24px',
                                fontSize: '0.65rem',
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              <Tooltip title="Görüntüle">
                                <IconButton 
                                  size="small" 
                                  sx={{ p: 0.5 }}
                                  onClick={() => {
                                    setSelectedRepairRecord(repair);
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {(repair.status === 'planned' || repair.status === 'in_progress') && (
                                <Tooltip title="Düzenle">
                                  <IconButton 
                                    size="small" 
                                    sx={{ p: 0.5 }}
                                    onClick={() => {
                                      setEditRepairData(repair);
                                      setIsEditingRepair(true);
                                      setRepairFormOpen(true);
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Tamir Kaydını Sil">
                                <IconButton 
                                  size="small" 
                                  sx={{ p: 0.5, color: 'error.main' }}
                                  onClick={() => handleDeleteRepair(repair.id)}
                                >
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
              )}
            </CardContent>
          </StyledCard>
        </Box>
      )}

      {/* Tamir Düzenleme Dialog */}
      <Dialog
        open={repairFormOpen && isEditingRepair}
        onClose={() => {
          setRepairFormOpen(false);
          setIsEditingRepair(false);
          setEditRepairData(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 38px 3px rgba(0,0,0,0.14)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 2
        }}>
          <BuildIcon color="primary" />
          <Box>
            <Typography variant="h6">
              Tamir Kaydını Düzenle
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editRepairData?.id} - {editRepairData?.tankInfo.serialNumber}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ py: 3 }}>
          {editRepairData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Durum Değiştirme */}
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Durum Güncelleme
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Tamir Durumu</InputLabel>
                  <Select
                    value={editRepairData.status}
                    label="Tamir Durumu"
                    onChange={(e) => {
                      setEditRepairData({
                        ...editRepairData,
                        status: e.target.value as RepairRecord['status'],
                        updatedAt: new Date().toISOString()
                      });
                    }}
                  >
                    <MenuItem value="planned">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'grey.400' }} />
                        Planlanan
                      </Box>
                    </MenuItem>
                    <MenuItem value="in_progress">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
                        Devam Ediyor
                      </Box>
                    </MenuItem>
                    <MenuItem value="quality_check">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'info.main' }} />
                        Kalite Kontrolü
                      </Box>
                    </MenuItem>
                    <MenuItem value="retest_required">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.dark' }} />
                        Yeniden Test Gerekli
                      </Box>
                    </MenuItem>
                    <MenuItem value="completed">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                        Tamamlandı
                      </Box>
                    </MenuItem>
                    <MenuItem value="cancelled">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                        İptal Edildi
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Öncelik Değiştirme */}
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Öncelik Güncelleme
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Öncelik Seviyesi</InputLabel>
                  <Select
                    value={editRepairData.repairInfo.priority}
                    label="Öncelik Seviyesi"
                    onChange={(e) => {
                      setEditRepairData({
                        ...editRepairData,
                        repairInfo: {
                          ...editRepairData.repairInfo,
                          priority: e.target.value as RepairRecord['repairInfo']['priority']
                        },
                        updatedAt: new Date().toISOString()
                      });
                    }}
                  >
                    <MenuItem value="low">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.light' }} />
                        Düşük (7+ gün)
                      </Box>
                    </MenuItem>
                    <MenuItem value="medium">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'info.main' }} />
                        Orta (3-7 gün)
                      </Box>
                    </MenuItem>
                    <MenuItem value="high">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
                        Yüksek (1-3 gün)
                      </Box>
                    </MenuItem>
                    <MenuItem value="critical">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                        Kritik (24 saat)
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>



              {/* Personel Güncelleme */}
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Personel Güncelleme
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Tamir Teknisyeni"
                      value={editRepairData.personnel.repairTechnician}
                      onChange={(e) => {
                        setEditRepairData({
                          ...editRepairData,
                          personnel: {
                            ...editRepairData.personnel,
                            repairTechnician: e.target.value
                          },
                          updatedAt: new Date().toISOString()
                        });
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Kalite Kontrol Personeli"
                      value={editRepairData.personnel.qualityControlPersonnel}
                      onChange={(e) => {
                        setEditRepairData({
                          ...editRepairData,
                          personnel: {
                            ...editRepairData.personnel,
                            qualityControlPersonnel: e.target.value
                          },
                          updatedAt: new Date().toISOString()
                        });
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Tamir Bilgileri Görüntüleme */}
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Tamir Detayları
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Tamir Türü</Typography>
                    <Chip
                      label={
                        editRepairData.repairInfo.repairType === 'welding' ? 'Kaynak' :
                        editRepairData.repairInfo.repairType === 'patching' ? 'Yama' :
                        editRepairData.repairInfo.repairType === 'replacement' ? 'Değişim' :
                        editRepairData.repairInfo.repairType === 'cleaning' ? 'Temizlik' :
                        editRepairData.repairInfo.repairType === 'adjustment' ? 'Ayar' : 'Diğer'
                      }
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Tahmini Süre</Typography>
                    <Typography variant="body1">{editRepairData.repairInfo.estimatedDuration} saat</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            onClick={() => {
              setRepairFormOpen(false);
              setIsEditingRepair(false);
              setEditRepairData(null);
            }}
            color="inherit"
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (editRepairData) {
                // Eğer durum 'completed' olarak değiştirilmişse completedAt tarihini otomatik set et
                let updatedRepairData = editRepairData;
                if (editRepairData.status === 'completed' && !editRepairData.completedAt) {
                  updatedRepairData = {
                    ...editRepairData,
                    completedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                }

                // Güncellenmiş tamir kaydını kaydet
                const updatedRecords = repairRecords.map(record =>
                  record.id === updatedRepairData.id ? updatedRepairData : record
                );
                setRepairRecords(updatedRecords);
                localStorage.setItem('tankRepairRecords', JSON.stringify(updatedRecords));
                calculateTankRepairHistory(updatedRecords);

                // Dialog'u kapat
                setRepairFormOpen(false);
                setIsEditingRepair(false);
                setEditRepairData(null);

                // Başarı mesajı kaldırıldı - sessiz güncelleme
              }
            }}
            startIcon={<BuildIcon />}
          >
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tamir Görüntüleme Dialog */}
      <Dialog
        open={!!selectedRepairRecord && !isEditingRepair}
        onClose={() => setSelectedRepairRecord(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 38px 3px rgba(0,0,0,0.14)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 2
        }}>
          <VisibilityIcon color="primary" />
          <Box>
            <Typography variant="h6">
              Tamir Kaydı Detayları
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedRepairRecord?.id} - {selectedRepairRecord?.tankInfo.serialNumber}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ py: 3 }}>
          {selectedRepairRecord && (
            <Grid container spacing={3}>
              {/* Tank Bilgileri */}
              <Grid item xs={12} md={6}>
                <StyledCard>
                  <CardHeader
                    avatar={<BuildIcon color="primary" />}
                    title="Tank Bilgileri"
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Seri No:</Typography>
                        <Typography variant="body2" fontWeight="bold">{selectedRepairRecord.tankInfo.serialNumber}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Türü:</Typography>
                        <Typography variant="body2">{selectedRepairRecord.tankInfo.type}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Malzeme:</Typography>
                        <Typography variant="body2">{selectedRepairRecord.tankInfo.material}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Kapasite:</Typography>
                        <Typography variant="body2">{selectedRepairRecord.tankInfo.capacity} L</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>

              {/* Araç Bilgileri */}
              <Grid item xs={12} md={6}>
                <StyledCard>
                  <CardHeader
                    avatar={<CarIcon color="secondary" />}
                    title="Araç Bilgileri"
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {(() => {
                        // testRecordId ile ilgili test kaydını bul
                        const relatedTestRecord = savedTests.find(test => test.id === selectedRepairRecord.testRecordId);
                        if (!relatedTestRecord) {
                          return (
                            <Typography variant="body2" color="text.secondary" style={{ fontStyle: 'italic' }}>
                              İlgili test kaydı bulunamadı
                            </Typography>
                          );
                        }
                        return (
                          <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Araç Modeli:</Typography>
                              <Typography variant="body2" fontWeight="bold">{relatedTestRecord.vehicleInfo.model}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Şasi No:</Typography>
                              <Typography variant="body2">{relatedTestRecord.vehicleInfo.vinNumber}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Tank Konumu:</Typography>
                              <Typography variant="body2">{relatedTestRecord.vehicleInfo.tankPosition}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Seri Numarası:</Typography>
                              <Typography variant="body2">{relatedTestRecord.tankInfo.serialNumber}</Typography>
                            </Box>
                          </>
                        );
                      })()}
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>

              {/* Tamir Durumu */}
              <Grid item xs={12} md={6}>
                <StyledCard>
                  <CardHeader
                    avatar={<SettingsIcon color="warning" />}
                    title="Tamir Durumu"
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Durum:</Typography>
                        <Chip
                          label={
                            selectedRepairRecord.status === 'planned' ? 'Planlanan' :
                            selectedRepairRecord.status === 'in_progress' ? 'Devam Ediyor' :
                            selectedRepairRecord.status === 'quality_check' ? 'Kalite Kontrolü' :
                            selectedRepairRecord.status === 'retest_required' ? 'Yeniden Test' :
                            selectedRepairRecord.status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'
                          }
                          color={
                            selectedRepairRecord.status === 'completed' ? 'success' :
                            selectedRepairRecord.status === 'in_progress' ? 'warning' :
                            selectedRepairRecord.status === 'cancelled' ? 'error' : 'default'
                          }
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Öncelik:</Typography>
                        <Chip
                          label={
                            selectedRepairRecord.repairInfo.priority === 'critical' ? 'Kritik' :
                            selectedRepairRecord.repairInfo.priority === 'high' ? 'Yüksek' :
                            selectedRepairRecord.repairInfo.priority === 'medium' ? 'Orta' : 'Düşük'
                          }
                          color={
                            selectedRepairRecord.repairInfo.priority === 'critical' ? 'error' :
                            selectedRepairRecord.repairInfo.priority === 'high' ? 'warning' :
                            selectedRepairRecord.repairInfo.priority === 'medium' ? 'info' : 'default'
                          }
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Tamir Türü:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {selectedRepairRecord.repairInfo.repairType === 'welding' ? 'Kaynak' :
                           selectedRepairRecord.repairInfo.repairType === 'patching' ? 'Yama' :
                           selectedRepairRecord.repairInfo.repairType === 'replacement' ? 'Değişim' :
                           selectedRepairRecord.repairInfo.repairType === 'cleaning' ? 'Temizlik' :
                           selectedRepairRecord.repairInfo.repairType === 'adjustment' ? 'Ayar' : 'Diğer'}
                        </Typography>
                      </Box>

                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>

              {/* Tamir Tarihi ve Personel Bilgileri - ÇOK ÖNEMLİ! */}
              <Grid item xs={12}>
                <StyledCard>
                  <CardHeader
                    avatar={<PersonIcon color="primary" />}
                    title="Tamir Tarihi ve Sorumlu Personel"
                    subheader="Tamir sürecinde görev alan personel ve tarih bilgileri"
                    titleTypographyProps={{ variant: 'h6' }}
                  />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ 
                          p: 2, 
                          border: '2px solid', 
                          borderColor: 'warning.main',
                          borderRadius: 2,
                          bgcolor: 'warning.50'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <DateRangeIcon color="warning" />
                            <Typography variant="subtitle2" fontWeight="bold" color="warning.dark">
                              Tamir Tarihi
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="warning.dark" fontWeight="bold">
                            {selectedRepairRecord.repairInfo.repairDate ? 
                              new Date(selectedRepairRecord.repairInfo.repairDate).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                weekday: 'long'
                              }) : 
                              'Belirtilmemiş'
                            }
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box sx={{ 
                          p: 2, 
                          border: '2px solid', 
                          borderColor: 'primary.main',
                          borderRadius: 2,
                          bgcolor: 'primary.50'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <BuildIcon color="primary" />
                            <Typography variant="subtitle2" fontWeight="bold" color="primary.dark">
                              Kaynak Yapan
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="primary.dark" fontWeight="bold">
                            {selectedRepairRecord.personnel.repairTechnician || 'Belirtilmemiş'}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box sx={{ 
                          p: 2, 
                          border: '2px solid', 
                          borderColor: 'success.main',
                          borderRadius: 2,
                          bgcolor: 'success.50'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <ScienceIcon color="success" />
                            <Typography variant="subtitle2" fontWeight="bold" color="success.dark">
                              Kalite Kontrol Yapan
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="success.dark" fontWeight="bold">
                            {selectedRepairRecord.personnel.qualityControlPersonnel || 'Belirtilmemiş'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </StyledCard>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            onClick={() => setSelectedRepairRecord(null)}
            color="inherit"
          >
            Kapat
          </Button>
          {selectedRepairRecord?.status !== 'completed' && selectedRepairRecord?.status !== 'cancelled' && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                setEditRepairData(selectedRepairRecord);
                setIsEditingRepair(true);
                setRepairFormOpen(true);
                setSelectedRepairRecord(null);
              }}
            >
              Düzenle
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Personnel Management Dialog */}
      <Dialog 
        open={personnelDialog !== null} 
        onClose={() => {
          setPersonnelDialog(null);
          setNewPersonnel({ firstName: '', lastName: '', employeeId: '' });
        }}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PersonAddIcon color="primary" />
            <Typography variant="h6">
              {personnelDialog === 'welder' ? 'Yeni Kaynak Personeli Ekle' : 'Yeni Kalite Kontrol Sorumlusu Ekle'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              {personnelDialog === 'welder' 
                ? 'Kaynak personeli bilgilerini girin. Sicil numarası benzersiz olmalıdır.'
                : 'Kalite kontrol sorumlusu personel bilgilerini girin. Sicil numarası benzersiz olmalıdır.'
              }
            </Alert>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Ad"
                value={newPersonnel.firstName}
                onChange={(e) => setNewPersonnel({ ...newPersonnel, firstName: e.target.value })}
                required
                autoFocus
                placeholder="Personelin adını girin"
              />
              
              <TextField
                fullWidth
                label="Soyad"
                value={newPersonnel.lastName}
                onChange={(e) => setNewPersonnel({ ...newPersonnel, lastName: e.target.value })}
                required
                placeholder="Personelin soyadını girin"
              />
              
              <TextField
                fullWidth
                label="Sicil Numarası"
                value={newPersonnel.employeeId}
                onChange={(e) => setNewPersonnel({ ...newPersonnel, employeeId: e.target.value.toUpperCase() })}
                required
                placeholder="KYN001, KTR001 vb."
                helperText="Benzersiz sicil numarası girin (otomatik büyük harfe çevrilir)"
              />
            </Box>

            {/* Personnel Preview */}
            {newPersonnel.firstName && newPersonnel.lastName && newPersonnel.employeeId && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Önizleme:
                </Typography>
                <Typography variant="body1">
                  {newPersonnel.firstName} {newPersonnel.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sicil: {newPersonnel.employeeId}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setPersonnelDialog(null);
              setNewPersonnel({ firstName: '', lastName: '', employeeId: '' });
            }}
          >
            İptal
          </Button>
          <Button 
            onClick={addPersonnel}
            variant="contained"
            disabled={!newPersonnel.firstName || !newPersonnel.lastName || !newPersonnel.employeeId}
            startIcon={<SaveIcon />}
          >
            Personeli Ekle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TankLeakTest; 