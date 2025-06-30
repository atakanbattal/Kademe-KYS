import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
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
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Grid,
  Tooltip,
  Fab,
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
  FormHelperText,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Switch,
  FormControlLabel,
  ButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Build as ReworkIcon,
  Delete as ScrapIcon,
  CheckCircle as ApprovalIcon,
  Business as DepartmentIcon,
  Print as PrintIcon,
  Check as CheckIcon,
  CloudUpload as UploadIcon,
  PhotoCamera as PhotoIcon,
  AttachFile as AttachFileIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Assessment as AssessmentIcon,
  AutoAwesome as AutoAwesomeIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon,
  Schedule,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useThemeContext } from '../context/ThemeContext';

// ============================================
// 🔥 ENHANCED INTERFACES & TYPES
// ============================================

interface QuarantineRecord {
  id: string;
  partCode: string;
  partName: string;
  quantity: number;
  unit: string;
  quarantineReason: string;
  responsibleDepartment: string;
  responsiblePersons: ResponsiblePerson[];
  quarantineDate: string;
  supplierName?: string;
  productionOrder?: string;
  inspectionResults?: string;
  notes: string;
  status: 'KARANTINADA' | 'HURDA' | 'SAPMA_ONAYI' | 'YENIDEN_ISLEM' | 'SERBEST_BIRAKILDI';
  decisionDate?: string;
  decisionBy?: string;
  decisionNotes?: string;
  priority: 'DUSUK' | 'ORTA' | 'YUKSEK' | 'KRITIK';
  estimatedCost: number;
  attachments: AttachmentFile[];
  followUpActions: QuarantineAction[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
  // Yeni alanlar
  location?: string;
  inspectionType?: string;
  inspectionDate?: string;
  inspectorName?: string;
  customerName?: string;
  drawingNumber?: string;
  revision?: string;
  materialType?: string;
  vehicleModel?: string; // Araç modeli eklendi
  nonConformityDetails?: NonConformityDetail[];
  correctiveActions?: CorrectiveAction[];
  photos?: PhotoAttachment[];
  relatedDocuments?: string[];
  riskLevel?: 'DUSUK' | 'ORTA' | 'YUKSEK' | 'KRITIK';
  immediateAction?: string;
  containmentAction?: string;
  rootCause?: string;
  preventiveAction?: string;
}

interface AttachmentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  url?: string;
  description?: string;
}

interface PhotoAttachment {
  id: string;
  name: string;
  url: string;
  uploadDate: string;
  description?: string;
  location?: string;
}

interface NonConformityDetail {
  id: string;
  type: string;
  description: string;
  severity: 'DUSUK' | 'ORTA' | 'YUKSEK' | 'KRITIK';
  location: string;
  measurement?: string;
  specification?: string;
  deviation?: string;
}

interface CorrectiveAction {
  id: string;
  action: string;
  responsible: string;
  targetDate: string;
  completionDate?: string;
  status: 'PLANLANMIS' | 'DEVAM_EDIYOR' | 'TAMAMLANDI' | 'GECIKTI';
  priority: 'DUSUK' | 'ORTA' | 'YUKSEK' | 'KRITIK';
  notes?: string;
}

interface ResponsiblePerson {
  id: string;
  name: string;
  department: string;
  role: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}

interface QuarantineAction {
  id: string;
  action: string;
  performedBy: string;
  performedDate: string;
  notes: string;
  status: 'TAMAMLANDI' | 'DEVAM_EDIYOR' | 'BEKLEMEDE';
}

interface QuarantineStats {
  totalItems: number;
  inQuarantine: number;
  scrapped: number;
  approved: number;
  reworked: number;
  released: number;
  totalCost: number;
  avgProcessingTime: number;
}

interface FormValidation {
  [key: string]: {
    isValid: boolean;
    message: string;
  };
}

// ============================================
// 🎯 ENHANCED CONSTANTS
// ============================================

const QUARANTINE_REASONS = [
  'Boyut Hatası',
  'Kaynak Hatası', 
  'Malzeme Hatası',
  'Yüzey Kalite Problemi',
  'Geometrik Tolerans Hatası',
  'Müşteri Şikayeti',
  'Üretim Hatası',
  'Montaj Hatası',
  'Taşıma Hasarı',
  'Tedarikçi Kalite Problemi',
  'Test Başarısızlığı',
  'Sertifika Eksikliği',
  'Boyama Hatası',
  'Ambalaj Hasarı',
  'Eksik Parça',
  'Yanlış Parça',
  'Kalibrasyon Hatası',
  'Ölçüm Hatası',
  'Diğer'
];

const DEPARTMENTS = [
  'Girdi Kontrol',
  'Kalite Kontrol',
  'Kalite Güvence',
  'Kesim',
  'Büküm',
  'Kaynakhane',
  'Mekanik Montaj',
  'Elektrik Montaj',
  'Boyahane',
  'Sevkiyat',
  'Depo',
  'Satın Alma',
  'Üretim Planlama',
  'Ar-Ge',
  'Proje Yönetimi',
  'İnsan Kaynakları',
  'Finans',
  'Genel Müdürlük',
  'Diğer'
];

const UNITS = [
  'adet',
  'kg',
  'mm',
  'm²',
  'm³',
  'lt'
];

const INSPECTION_TYPES = [
  'Görsel Muayene',
  'Boyutsal Kontrol',
  'Kaynak Muayenesi',
  'Malzeme Testi',
  'Fonksiyonel Test',
  'Performans Testi',
  'Sızdırmazlık Testi',
  'Basınç Testi',
  'Elektriksel Test',
  'Mekanik Test',
  'Kimyasal Analiz',
  'Metalografik Muayene',
  'NDT Muayene',
  'Diğer'
];

const MATERIAL_TYPES = [
  'Çelik',
  'Paslanmaz Çelik',
  'Alüminyum',
  'Bakır',
  'Pirinç',
  'Döküm',
  'Plastik',
  'Kompozit',
  'Lastik',
  'Cam',
  'Seramik',
  'Diğer'
];

const VEHICLE_MODELS = [
  'FTH-240',
  'Çelik-2000',
  'Aga2100',
  'Aga3000',
  'Aga6000',
  'Kompost Makinesi',
  'Çay Toplama Makinesi',
  'KDM 35',
  'KDM 70',
  'KDM 80',
  'Rusya Motor Odası',
  'Ural',
  'HSCK'
];

const NONCONFORMITY_TYPES = [
  'Boyut Hatası',
  'Form Hatası',
  'Pozisyon Hatası',
  'Yüzey Hatası',
  'Malzeme Hatası',
  'İşlem Hatası',
  'Montaj Hatası',
  'Temizlik Sorunu',
  'Etiketleme Hatası',
  'Ambalaj Sorunu',
  'Dokümantasyon Eksikliği',
  'Diğer'
];

const PRIORITY_COLORS = {
  'DUSUK': '#4caf50',
  'ORTA': '#ff9800', 
  'YUKSEK': '#f44336',
  'KRITIK': '#d32f2f'
};

const STATUS_COLORS = {
  'KARANTINADA': '#ff9800',
  'HURDA': '#f44336',
  'SAPMA_ONAYI': '#2196f3',
  'YENIDEN_ISLEM': '#9c27b0',
  'SERBEST_BIRAKILDI': '#4caf50'
};

const STATUS_LABELS = {
  'KARANTINADA': 'Karantinada',
  'HURDA': 'Hurda',
  'SAPMA_ONAYI': 'Sapma Onayı',
  'YENIDEN_ISLEM': 'Yeniden İşlem',
  'SERBEST_BIRAKILDI': 'Serbest Bırakıldı'
};

const PRIORITY_LABELS = {
  'DUSUK': 'Düşük',
  'ORTA': 'Orta',
  'YUKSEK': 'Yüksek',
  'KRITIK': 'Kritik'
};

const ACTION_STATUS_LABELS = {
  'PLANLANMIS': 'Planlanmış',
  'DEVAM_EDIYOR': 'Devam Ediyor',
  'TAMAMLANDI': 'Tamamlandı',
  'GECIKTI': 'Gecikti'
};

const FORM_STEPS = [
  'Temel Bilgiler',
  'Detaylı Bilgiler', 
  'Muayene Sonuçları',
  'Ekler ve Dökümanlar',
  'Özet ve Onay'
];

const MONTHS = [
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

// ============================================
// 🚀 ENHANCED MAIN COMPONENT
// ============================================

const QuarantineManagement: React.FC = () => {
  const { appearanceSettings } = useThemeContext();
  
  // StyledAccordion tanımı
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
    '&.Mui-expanded': {
      margin: 'auto',
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

  // States
  const [activeTab, setActiveTab] = useState(0);
  const [quarantineData, setQuarantineData] = useState<QuarantineRecord[]>([]);
  const [filteredData, setFilteredData] = useState<QuarantineRecord[]>([]);
  const [stats, setStats] = useState<QuarantineStats>({
    totalItems: 0,
    inQuarantine: 0,
    scrapped: 0,
    approved: 0,
    reworked: 0,
    released: 0,
    totalCost: 0,
    avgProcessingTime: 0
  });
  
  // Enhanced Dialog states
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [decisionDialog, setDecisionDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<QuarantineRecord | null>(null);
  
  // Enhanced Form states
  const [activeStep, setActiveStep] = useState(0);
  const [formValidation, setFormValidation] = useState<FormValidation>({});
  const [formProgress, setFormProgress] = useState(0);
  const [autoSave, setAutoSave] = useState(true);

  
  const [formData, setFormData] = useState<Partial<QuarantineRecord>>({
    partCode: '',
    partName: '',
    quantity: 0,
    unit: 'adet',
    quarantineReason: '',
    responsibleDepartment: '',
    responsiblePersons: [],
    supplierName: '',
    productionOrder: '',
    inspectionResults: '',
    notes: '',
    priority: 'ORTA',
    estimatedCost: 0,
    attachments: [],
    followUpActions: [],
    // Yeni alanlar
    location: '',
    inspectionType: '',
    inspectionDate: '',
    inspectorName: '',
    customerName: '',
    drawingNumber: '',
    revision: '',
    materialType: '',
    vehicleModel: '', // Araç modeli eklendi
    nonConformityDetails: [],
    correctiveActions: [],
    photos: [],
    relatedDocuments: [],
    riskLevel: 'ORTA',
    immediateAction: '',
    containmentAction: '',
    rootCause: '',
    preventiveAction: ''
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'ALL',
    department: 'ALL',
    priority: 'ALL',
    type: 'ALL',
    year: 'ALL',
    month: 'ALL',
    delayStatus: 'ALL',
    dateRange: 'ALL',
    startDate: '',
    endDate: '',
    searchText: ''
  });
  
  // Notification states
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Filter expansion state
  const [expanded, setExpanded] = useState<string | false>('panel1');

  // Dynamic suggestions and management
  const [partCodeSuggestions, setPartCodeSuggestions] = useState<string[]>(() => {
    const saved = localStorage.getItem('partCodeSuggestions');
    return saved ? JSON.parse(saved) : ['KD-001-2024', 'KD-002-2024', 'KD-003-2024', 'MT-001-2024', 'SW-001-2024'];
  });
  const [supplierSuggestions] = useState<string[]>([
    'ABC Metal A.Ş.', 'XYZ Makina Ltd.', 'DEF Endüstri A.Ş.', 'GHI Çelik A.Ş.'
  ]);
  const [inspectorSuggestions, setInspectorSuggestions] = useState<string[]>(() => {
    const saved = localStorage.getItem('inspectorSuggestions');
    return saved ? JSON.parse(saved) : ['Ahmet Yılmaz', 'Mehmet Demir', 'Ayşe Kaya', 'Fatma Öz', 'Ali Şen'];
  });

  // Global responsible persons management
  const [responsiblePersonSuggestions, setResponsiblePersonSuggestions] = useState<ResponsiblePerson[]>(() => {
    const saved = localStorage.getItem('responsiblePersonSuggestions');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Ahmet Yılmaz', department: 'Kalite Kontrol', role: 'Kalite Uzmanı', email: 'ahmet.yilmaz@kademe.com', phone: '+90 532 111 2233', isPrimary: false },
      { id: '2', name: 'Mehmet Demir', department: 'Kaynakhane', role: 'Kaynak Şefi', email: 'mehmet.demir@kademe.com', phone: '+90 533 444 5566', isPrimary: false },
      { id: '3', name: 'Ayşe Kaya', department: 'Ar-Ge', role: 'Proses Mühendisi', email: 'ayse.kaya@kademe.com', phone: '+90 534 777 8899', isPrimary: false },
      { id: '4', name: 'Fatma Öz', department: 'Üretim Planlama', role: 'Planlama Uzmanı', email: 'fatma.oz@kademe.com', phone: '+90 535 222 3344', isPrimary: false },
      { id: '5', name: 'Ali Şen', department: 'Girdi Kontrol', role: 'Girdi Kontrol Uzmanı', email: 'ali.sen@kademe.com', phone: '+90 536 999 1122', isPrimary: false },
      { id: '6', name: 'Zeynep Arslan', department: 'Kalite Güvence', role: 'Kalite Güvence Uzmanı', email: 'zeynep.arslan@kademe.com', phone: '+90 537 333 4455', isPrimary: false },
      { id: '7', name: 'Can Özkan', department: 'Mekanik Montaj', role: 'Montaj Şefi', email: 'can.ozkan@kademe.com', phone: '+90 538 777 8844', isPrimary: false },
      { id: '8', name: 'Elif Şahin', department: 'Elektrik Montaj', role: 'Elektrik Sorumlusu', email: 'elif.sahin@kademe.com', phone: '+90 539 555 6677', isPrimary: false },
      { id: '9', name: 'Murat Kaya', department: 'Boyahane', role: 'Boyahane Şefi', email: 'murat.kaya@kademe.com', phone: '+90 531 444 5533', isPrimary: false },
      { id: '10', name: 'Seda Demir', department: 'Kesim', role: 'Kesim Operatörü', email: 'seda.demir@kademe.com', phone: '+90 532 666 7788', isPrimary: false }
    ];
  });

  // Dialog states for managing dynamic lists
  const [partCodeDialog, setPartCodeDialog] = useState(false);
  const [inspectorDialog, setInspectorDialog] = useState(false);
  const [responsiblePersonDialog, setResponsiblePersonDialog] = useState(false);
  const [newPartCode, setNewPartCode] = useState('');
  const [newInspector, setNewInspector] = useState('');
  const [newResponsiblePerson, setNewResponsiblePerson] = useState<Partial<ResponsiblePerson>>({
    name: '',
    department: '',
    role: '',
    email: '',
    phone: '',
    isPrimary: false
  });

  // ============================================
  // 🔥 HANDLER FUNCTIONS
  // ============================================
  
  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'ALL',
      department: 'ALL',
      priority: 'ALL',
      type: 'ALL',
      year: 'ALL',
      month: 'ALL',
      delayStatus: 'ALL',
      dateRange: 'ALL',
      startDate: '',
      endDate: '',
      searchText: ''
    });
    showNotification('Tüm filtreler temizlendi', 'success');
  };

  // ============================================
  // 🔥 DYNAMIC LIST MANAGEMENT FUNCTIONS
  // ============================================

  const handleAddPartCode = () => {
    if (newPartCode.trim() && !partCodeSuggestions.includes(newPartCode.trim())) {
      const updated = [...partCodeSuggestions, newPartCode.trim()];
      setPartCodeSuggestions(updated);
      localStorage.setItem('partCodeSuggestions', JSON.stringify(updated));
      setNewPartCode('');
      setPartCodeDialog(false);
      showNotification('Parça kodu eklendi', 'success');
    }
  };

  const handleRemovePartCode = (partCode: string) => {
    const updated = partCodeSuggestions.filter(code => code !== partCode);
    setPartCodeSuggestions(updated);
    localStorage.setItem('partCodeSuggestions', JSON.stringify(updated));
    showNotification('Parça kodu silindi', 'success');
  };

  const handleAddInspector = () => {
    if (newInspector.trim() && !inspectorSuggestions.includes(newInspector.trim())) {
      const updated = [...inspectorSuggestions, newInspector.trim()];
      setInspectorSuggestions(updated);
      localStorage.setItem('inspectorSuggestions', JSON.stringify(updated));
      setNewInspector('');
      setInspectorDialog(false);
      showNotification('Muayene yapan kişi eklendi', 'success');
    }
  };

  const handleRemoveInspector = (inspector: string) => {
    const updated = inspectorSuggestions.filter(insp => insp !== inspector);
    setInspectorSuggestions(updated);
    localStorage.setItem('inspectorSuggestions', JSON.stringify(updated));
    showNotification('Muayene yapan kişi silindi', 'success');
  };

  const handleAddResponsiblePersonToGlobal = () => {
    if (newResponsiblePerson.name?.trim() && newResponsiblePerson.department?.trim()) {
      const personId = `RP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newPerson: ResponsiblePerson = {
        id: personId,
        name: newResponsiblePerson.name.trim(),
        department: newResponsiblePerson.department,
        role: newResponsiblePerson.role || '',
        email: newResponsiblePerson.email || '',
        phone: newResponsiblePerson.phone || '',
        isPrimary: false
      };

      const updated = [...responsiblePersonSuggestions, newPerson];
      setResponsiblePersonSuggestions(updated);
      localStorage.setItem('responsiblePersonSuggestions', JSON.stringify(updated));
      
      setNewResponsiblePerson({
        name: '',
        department: '',
        role: '',
        email: '',
        phone: '',
        isPrimary: false
      });
      setResponsiblePersonDialog(false);
      showNotification('Sorumlu kişi eklendi', 'success');
    }
  };

  const handleRemoveResponsiblePersonFromGlobal = (personId: string) => {
    const updated = responsiblePersonSuggestions.filter(person => person.id !== personId);
    setResponsiblePersonSuggestions(updated);
    localStorage.setItem('responsiblePersonSuggestions', JSON.stringify(updated));
    showNotification('Sorumlu kişi silindi', 'success');
  };

  const handleUpdateResponsiblePersonInGlobal = (personId: string, field: keyof ResponsiblePerson, value: any) => {
    const updated = responsiblePersonSuggestions.map(person => 
      person.id === personId ? { ...person, [field]: value } : person
    );
    setResponsiblePersonSuggestions(updated);
    localStorage.setItem('responsiblePersonSuggestions', JSON.stringify(updated));
  };

  // ============================================
  // 🔥 ENHANCED UTILITY FUNCTIONS
  // ============================================
  
  const formatUnit = (unit: string): string => {
    switch (unit.toLowerCase()) {
      case 'adet':
        return 'Adet';
      default:
        return unit;
    }
  };
  




  const validateFormField = (fieldName: string, value: any): {isValid: boolean, message: string} => {
    switch (fieldName) {
      case 'partCode':
        if (!value || value.length < 3) {
          return { isValid: false, message: 'Parça kodu en az 3 karakter olmalıdır' };
        }
        return { isValid: true, message: '' };
      
      case 'partName':
        if (!value || value.length < 2) {
          return { isValid: false, message: 'Parça adı en az 2 karakter olmalıdır' };
        }
        return { isValid: true, message: '' };
      
      case 'quantity':
        if (!value || value <= 0) {
          return { isValid: false, message: 'Miktar 0\'dan büyük olmalıdır' };
        }
        return { isValid: true, message: '' };
      
      case 'quarantineReason':
        if (!value) {
          return { isValid: false, message: 'Karantina nedeni seçilmelidir' };
        }
        return { isValid: true, message: '' };
      
      case 'responsibleDepartment':
        if (!value) {
          return { isValid: false, message: 'Sorumlu birim seçilmelidir' };
        }
        return { isValid: true, message: '' };
      
      case 'estimatedCost':
        if (value < 0) {
          return { isValid: false, message: 'Tahmini maliyet negatif olamaz' };
        }
        return { isValid: true, message: '' };
      
      default:
        return { isValid: true, message: '' };
    }
  };

  const validateForm = (): boolean => {
    const validationResults: FormValidation = {};
    const requiredFields = ['partCode', 'partName', 'quantity', 'quarantineReason', 'responsibleDepartment'];
    
    requiredFields.forEach(field => {
      const result = validateFormField(field, formData[field as keyof typeof formData]);
      validationResults[field] = result;
    });
    
    setFormValidation(validationResults);
    
    return Object.values(validationResults).every(validation => validation.isValid);
  };

  const calculateFormProgress = useCallback((): number => {
    const totalFields = 15; // Ana alanların sayısı
    let filledFields = 0;
    
    const checkFields = [
      'partCode', 'partName', 'quantity', 'quarantineReason', 'responsibleDepartment',
      'supplierName', 'productionOrder', 
      'inspectionResults', 'notes', 'location', 'inspectionType', 'inspectorName', 'materialType', 'vehicleModel'
    ];
    
    checkFields.forEach(field => {
      const value = formData[field as keyof typeof formData];
      if (value && value !== '' && value !== 0) {
        filledFields++;
      }
    });
    
    return Math.round((filledFields / totalFields) * 100);
  }, [formData]);

  // ============================================
  // 🔥 DATA PERSISTENCE FUNCTIONS (Same as before)
  // ============================================
  
  const STORAGE_KEY = 'quarantine_management_data';
  
  const saveToStorage = useCallback((data: QuarantineRecord[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('✅ Karantina verileri başarıyla kaydedildi:', data.length);
    } catch (error) {
      console.error('❌ Karantina verileri kaydedilemedi:', error);
    }
  }, []);
  
  const loadFromStorage = useCallback((): QuarantineRecord[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        console.log('✅ Karantina verileri yüklendi:', data.length);
        return data;
      }
    } catch (error) {
      console.error('❌ Karantina verileri yüklenemedi:', error);
    }
    return [];
  }, []);

  // 🚀 Otomatik Karantina Takip Numarası Generator
  const generateQuarantineTrackingNumber = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}-${month}`;
    
    // Mevcut kayıtlarda aynı ay/yıl ile başlayan kayıtları say
    const existingRecords = quarantineData.filter(record => 
      record.id.startsWith(yearMonth)
    );
    
    // Sıradaki numara
    const nextNumber = String(existingRecords.length + 1).padStart(3, '0');
    
    return `${yearMonth}-${nextNumber}`;
  }, [quarantineData]);

  const generateId = () => generateQuarantineTrackingNumber();
  
  const calculateStats = useCallback((data: QuarantineRecord[]): QuarantineStats => {
    const totalItems = data.length;
    const inQuarantine = data.filter(item => item.status === 'KARANTINADA').length;
    const scrapped = data.filter(item => item.status === 'HURDA').length;
    const approved = data.filter(item => item.status === 'SAPMA_ONAYI').length;
    const reworked = data.filter(item => item.status === 'YENIDEN_ISLEM').length;
    const released = data.filter(item => item.status === 'SERBEST_BIRAKILDI').length;
    const totalCost = data.reduce((sum, item) => sum + item.estimatedCost, 0);
    
    // Calculate average processing time for completed items
    const completedItems = data.filter(item => 
      item.status !== 'KARANTINADA' && item.decisionDate
    );
    
    let avgProcessingTime = 0;
    if (completedItems.length > 0) {
      const totalProcessingTime = completedItems.reduce((sum, item) => {
        const quarantineDate = new Date(item.quarantineDate);
        const decisionDate = new Date(item.decisionDate!);
        const processingTime = (decisionDate.getTime() - quarantineDate.getTime()) / (1000 * 60 * 60 * 24); // days
        return sum + processingTime;
      }, 0);
      avgProcessingTime = totalProcessingTime / completedItems.length;
    }
    
    return {
      totalItems,
      inQuarantine,
      scrapped,
      approved,
      reworked,
      released,
      totalCost,
      avgProcessingTime: Math.round(avgProcessingTime * 10) / 10
    };
  }, []);
  
  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ open: true, message, severity });
  };

  // ============================================
  // 🔥 DATA OPERATIONS (Same as before)
  // ============================================
  
  const loadData = useCallback(() => {
    const data = loadFromStorage();
    setQuarantineData(data);
    setFilteredData(data);
    setStats(calculateStats(data));
  }, [loadFromStorage, calculateStats]);
  
  const applyFilters = useCallback(() => {
    let filtered = [...quarantineData];
    
    // Status filter
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    // Department filter
    if (filters.department !== 'ALL') {
      filtered = filtered.filter(item => item.responsibleDepartment === filters.department);
    }
    
    // Priority filter
    if (filters.priority !== 'ALL') {
      filtered = filtered.filter(item => item.priority === filters.priority);
    }

    // Type filter (simulating based on item properties)
    if (filters.type !== 'ALL') {
      filtered = filtered.filter(item => {
        // Simulate type based on part code or other properties
        if (filters.type === 'MALZEME') {
          return item.partCode.includes('ML') || item.partName.toLowerCase().includes('malzeme');
        } else if (filters.type === 'URUN') {
          return item.partCode.includes('UR') || item.partName.toLowerCase().includes('ürün');
        } else if (filters.type === 'TEDARIK') {
          return item.partCode.includes('TD') || item.supplierName;
        }
        return true;
      });
    }

    // Year filter
    if (filters.year !== 'ALL') {
      filtered = filtered.filter(item => {
        const itemYear = new Date(item.quarantineDate).getFullYear().toString();
        return itemYear === filters.year;
      });
    }

    // Month filter
    if (filters.month !== 'ALL') {
      filtered = filtered.filter(item => {
        const itemMonth = String(new Date(item.quarantineDate).getMonth() + 1).padStart(2, '0');
        return itemMonth === filters.month;
      });
    }

    // Delay status filter (simulated based on dates and status)
    if (filters.delayStatus !== 'ALL') {
      filtered = filtered.filter(item => {
        const quarantineDate = new Date(item.quarantineDate);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - quarantineDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (filters.delayStatus === 'ZAMANINDA') {
          return daysDiff <= 7 && item.status !== 'KARANTINADA';
        } else if (filters.delayStatus === 'UYARI') {
          return daysDiff > 7 && daysDiff <= 14 && item.status === 'KARANTINADA';
        } else if (filters.delayStatus === 'GECIKME') {
          return daysDiff > 14 && item.status === 'KARANTINADA';
        }
        return true;
      });
    }
    
    // Search text filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(item =>
        item.partCode.toLowerCase().includes(searchLower) ||
        item.partName.toLowerCase().includes(searchLower) ||
        item.quarantineReason.toLowerCase().includes(searchLower) ||
        item.responsibleDepartment.toLowerCase().includes(searchLower) ||
        item.notes.toLowerCase().includes(searchLower) ||
        (item.supplierName && item.supplierName.toLowerCase().includes(searchLower))
      );
    }
    
    // Date range filter
    if (filters.dateRange !== 'ALL') {
      const now = new Date();
      const startDate = new Date();
      
      switch (filters.dateRange) {
        case 'TODAY':
          startDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.quarantineDate);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate.getTime() === startDate.getTime();
          });
          break;
        case 'WEEK':
          startDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(item => new Date(item.quarantineDate) >= startDate);
          break;
        case 'MONTH':
          startDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(item => new Date(item.quarantineDate) >= startDate);
          break;
        case 'QUARTER':
          startDate.setMonth(now.getMonth() - 3);
          filtered = filtered.filter(item => new Date(item.quarantineDate) >= startDate);
          break;
        case 'YEAR':
          startDate.setFullYear(now.getFullYear() - 1);
          filtered = filtered.filter(item => new Date(item.quarantineDate) >= startDate);
          break;
      }
    }

    // Custom date range filter
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.quarantineDate);
        let matchesRange = true;
        
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          matchesRange = matchesRange && itemDate >= startDate;
        }
        
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999); // Include the entire end date
          matchesRange = matchesRange && itemDate <= endDate;
        }
        
        return matchesRange;
      });
    }
    
    setFilteredData(filtered);
    setStats(calculateStats(filtered)); // İstatistikleri filtrelenmiş veriye göre güncelle
  }, [quarantineData, filters, calculateStats]);

  // ============================================
  // 🔥 COMPONENT LIFECYCLE
  // ============================================
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    setFormProgress(calculateFormProgress());
  }, [formData, calculateFormProgress]);

  useEffect(() => {
    if (autoSave && addDialog) {
      // Auto-save functionality 
      const timeoutId = setTimeout(() => {
        console.log('Auto-saving form data...');
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData, autoSave, addDialog]);

  // ============================================
  // 🔥 ENHANCED EVENT HANDLERS
  // ============================================
  
  const handleAddRecord = () => {
    // 🚀 Otomatik karantina takip numarası oluştur
    const newTrackingNumber = generateQuarantineTrackingNumber();
    
    setFormData({
      id: newTrackingNumber,
      partCode: '',
      partName: '',
      quantity: 0,
      unit: 'adet',
      quarantineReason: '',
      responsibleDepartment: '',
      responsiblePersons: [],
      supplierName: '',
      productionOrder: '',
      inspectionResults: '',
      notes: '',
      priority: 'ORTA',
      estimatedCost: 0,
      attachments: [],
      followUpActions: [],
      location: '',
      inspectionType: '',
      inspectionDate: '',
      inspectorName: '',
      customerName: '',
      drawingNumber: '',
      revision: '',
      materialType: '',
      vehicleModel: '',
      nonConformityDetails: [],
      correctiveActions: [],
      photos: [],
      relatedDocuments: [],
      riskLevel: 'ORTA',
      immediateAction: '',
      containmentAction: '',
      rootCause: '',
      preventiveAction: ''
    });
    setActiveStep(0);
    setFormValidation({});
    setFormProgress(0);
    setAddDialog(true);
    
    // Takip numarası bilgisi göster
    showNotification(`Yeni karantina takip numarası: ${newTrackingNumber}`, 'info');
  };



  const handleStepChange = (step: number) => {
    if (step < activeStep || validateCurrentStep()) {
      setActiveStep(step);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (activeStep) {
      case 0: // Temel Bilgiler
        return ['partCode', 'partName', 'quarantineReason', 'responsibleDepartment'].every(field => {
          const validation = validateFormField(field, formData[field as keyof typeof formData]);
          return validation.isValid;
        });
      case 1: // Detaylı Bilgiler
        return true; // İsteğe bağlı alanlar
      case 2: // Muayene Sonuçları
        return true; // İsteğe bağlı alanlar
      case 3: // Ekler
        return true; // İsteğe bağlı alanlar
      case 4: // Özet
        return validateForm();
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep(prev => Math.min(prev + 1, FORM_STEPS.length - 1));
    } else {
      showNotification('Lütfen gerekli alanları doldurun!', 'error');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments: AttachmentFile[] = Array.from(files).map(file => ({
        id: generateId(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        description: ''
      }));
      
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...newAttachments]
      }));
      
      showNotification(`${files.length} dosya yüklendi!`, 'success');
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter(att => att.id !== attachmentId) || []
    }));
    showNotification('Dosya kaldırıldı!', 'info');
  };

  const handleAddNonConformity = () => {
    const newNonConformity: NonConformityDetail = {
      id: generateId(),
      type: '',
      description: '',
      severity: 'ORTA',
      location: '',
      measurement: '',
      specification: '',
      deviation: ''
    };
    
    setFormData(prev => ({
      ...prev,
      nonConformityDetails: [...(prev.nonConformityDetails || []), newNonConformity]
    }));
  };

  const handleAddCorrectiveAction = () => {
    const newAction: CorrectiveAction = {
      id: generateId(),
      action: '',
      responsible: '',
      targetDate: '',
      status: 'PLANLANMIS',
      priority: 'ORTA',
      notes: ''
    };
    
    setFormData(prev => ({
      ...prev,
      correctiveActions: [...(prev.correctiveActions || []), newAction]
    }));
  };



  // Sorumlu kişi yönetimi fonksiyonları
  const handleAddResponsiblePerson = () => {
    const newPerson: ResponsiblePerson = {
      id: generateId(),
      name: '',
      department: '',
      role: '',
      email: '',
      phone: '',
      isPrimary: (formData.responsiblePersons?.length || 0) === 0 // İlk kişi otomatik primary olur
    };
    
    setFormData(prev => ({
      ...prev,
      responsiblePersons: [...(prev.responsiblePersons || []), newPerson]
    }));
  };

  const handleRemoveResponsiblePerson = (personId: string) => {
    setFormData(prev => ({
      ...prev,
      responsiblePersons: prev.responsiblePersons?.filter(person => person.id !== personId) || []
    }));
    showNotification('Sorumlu kişi kaldırıldı!', 'info');
  };

  const handleUpdateResponsiblePerson = (personId: string, field: keyof ResponsiblePerson, value: any) => {
    setFormData(prev => ({
      ...prev,
      responsiblePersons: prev.responsiblePersons?.map(person => 
        person.id === personId ? { ...person, [field]: value } : person
      ) || []
    }));
  };

  const handleSetPrimaryResponsible = (personId: string) => {
    setFormData(prev => ({
      ...prev,
      responsiblePersons: prev.responsiblePersons?.map(person => ({
        ...person,
        isPrimary: person.id === personId
      })) || []
    }));
    showNotification('Ana sorumlu kişi belirlendi!', 'success');
  };

  const handleEditRecord = (record: QuarantineRecord) => {
    setSelectedRecord(record);
    setFormData(record);
    setEditDialog(true);
  };
  
  const handleDecisionDialog = (record: QuarantineRecord) => {
    setSelectedRecord(record);
    setDecisionDialog(true);
  };
  
  const handleViewRecord = (record: QuarantineRecord) => {
    setSelectedRecord(record);
    setViewDialog(true);
  };

  const handleSaveRecord = () => {
    if (!validateForm()) {
      showNotification('Lütfen zorunlu alanları doldurun!', 'error');
      return;
    }
    
    const now = new Date().toISOString();
    const currentUser = 'Sistem Kullanıcısı'; // This should come from auth context
    
    const newRecord: QuarantineRecord = {
      id: selectedRecord?.id || generateId(),
      partCode: formData.partCode!,
      partName: formData.partName!,
      quantity: formData.quantity || 0,
      unit: formData.unit || 'adet',
      quarantineReason: formData.quarantineReason!,
      responsibleDepartment: formData.responsibleDepartment!,
      responsiblePersons: formData.responsiblePersons || [],
      quarantineDate: selectedRecord?.quarantineDate || now,
      supplierName: formData.supplierName || '',
      productionOrder: formData.productionOrder || '',
      inspectionResults: formData.inspectionResults || '',
      notes: formData.notes || '',
      status: selectedRecord?.status || 'KARANTINADA',
      priority: formData.priority || 'ORTA',
      estimatedCost: formData.estimatedCost || 0,
      attachments: formData.attachments || [],
      followUpActions: formData.followUpActions || [],
      createdBy: selectedRecord?.createdBy || currentUser,
      createdDate: selectedRecord?.createdDate || now,
      lastModified: now,
      decisionDate: selectedRecord?.decisionDate,
      decisionBy: selectedRecord?.decisionBy,
      decisionNotes: selectedRecord?.decisionNotes,
      // Yeni alanlar
      location: formData.location,
      inspectionType: formData.inspectionType,
      inspectionDate: formData.inspectionDate,
      inspectorName: formData.inspectorName,
      customerName: formData.customerName,
      drawingNumber: formData.drawingNumber,
      revision: formData.revision,
      materialType: formData.materialType,
      vehicleModel: formData.vehicleModel,
      nonConformityDetails: formData.nonConformityDetails || [],
      correctiveActions: formData.correctiveActions || [],
      photos: formData.photos || [],
      relatedDocuments: formData.relatedDocuments || [],
      riskLevel: formData.riskLevel || 'ORTA',
      immediateAction: formData.immediateAction,
      containmentAction: formData.containmentAction,
      rootCause: formData.rootCause,
      preventiveAction: formData.preventiveAction
    };
    
    let updatedData;
    if (selectedRecord) {
      // Update existing record
      updatedData = quarantineData.map(item => 
        item.id === selectedRecord.id ? newRecord : item
      );
      showNotification('Kayıt başarıyla güncellendi!');
    } else {
      // Add new record
      updatedData = [...quarantineData, newRecord];
      showNotification('Yeni kayıt başarıyla eklendi!');
    }
    
    setQuarantineData(updatedData);
    saveToStorage(updatedData);
    setStats(calculateStats(updatedData));
    
    setAddDialog(false);
    setEditDialog(false);
    setSelectedRecord(null);
  };

  const handleMakeDecision = (decision: QuarantineRecord['status'], notes: string) => {
    if (!selectedRecord) return;
    
    const now = new Date().toISOString();
    const currentUser = 'Sistem Kullanıcısı'; // This should come from auth context
    
    const updatedRecord: QuarantineRecord = {
      ...selectedRecord,
      status: decision,
      decisionDate: now,
      decisionBy: currentUser,
      decisionNotes: notes,
      lastModified: now
    };
    
    const updatedData = quarantineData.map(item =>
      item.id === selectedRecord.id ? updatedRecord : item
    );
    
    setQuarantineData(updatedData);
    saveToStorage(updatedData);
    setStats(calculateStats(updatedData));
    
    const decisionText = {
      'HURDA': 'hurda',
      'SAPMA_ONAYI': 'sapma onayı',
      'YENIDEN_ISLEM': 'yeniden işlem',
      'SERBEST_BIRAKILDI': 'serbest bırakılma'
    }[decision] || 'güncelleme';
    
    showNotification(`${selectedRecord.partCode} için ${decisionText} kararı verildi!`);
    setDecisionDialog(false);
    setSelectedRecord(null);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      const updatedData = quarantineData.filter(item => item.id !== id);
      setQuarantineData(updatedData);
      saveToStorage(updatedData);
      setStats(calculateStats(updatedData));
      showNotification('Kayıt başarıyla silindi!');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: appearanceSettings.primaryColor }}>
            <CardContent sx={{ color: 'white' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Toplam Kayıt</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {stats.totalItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800, #f57c00)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Karantinada</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {stats.inQuarantine}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f44336, #d32f2f)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Tahmini Maliyet</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                ₺{stats.totalCost.toLocaleString('tr-TR')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50, #388e3c)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Ort. İşlem Süresi</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {stats.avgProcessingTime} gün
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters - All Module */}
      <StyledAccordion
        expanded={expanded === 'panel1'}
        onChange={handleAccordionChange('panel1')}
        sx={{ mb: 3 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <FilterListIcon sx={{ color: '#ffffff' }} />
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>Filtreleme ve Arama</Typography>
            {(filters.searchText || filters.status !== 'ALL' || filters.department !== 'ALL' || 
              filters.priority !== 'ALL' || filters.type !== 'ALL' || filters.year !== 'ALL' || 
              filters.month !== 'ALL' || filters.delayStatus !== 'ALL') && (
              <Badge color="error" variant="dot" />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-end' }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 600 }}>Birim/Departman</InputLabel>
                <Select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  sx={{
                    height: 56,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <MenuItem value="ALL">Tümü</MenuItem>
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 160px', minWidth: '160px' }}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 600 }}>Durum</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  sx={{
                    height: 56,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <MenuItem value="ALL">Tümü</MenuItem>
                  {Object.entries(STATUS_LABELS).map(([status, label]) => (
                    <MenuItem key={status} value={status}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 140px', minWidth: '140px' }}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 600 }}>Tür</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  sx={{
                    height: 56,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <MenuItem value="ALL">Tümü</MenuItem>
                  <MenuItem value="MALZEME">Malzeme</MenuItem>
                  <MenuItem value="URUN">Ürün</MenuItem>
                  <MenuItem value="TEDARIK">Tedarik</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Gelişmiş Arama"
                placeholder="Parça kodu, başlık, açıklama..."
                value={filters.searchText}
                onChange={(e) => handleFilterChange('searchText', e.target.value)}
                sx={{
                  height: 56,
                  '& .MuiOutlinedInput-root': {
                    height: 56,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 600 }}>Yıl</InputLabel>
                <Select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  sx={{
                    height: 56,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <MenuItem value="ALL">Tümü</MenuItem>
                  <MenuItem value="2023">2023</MenuItem>
                  <MenuItem value="2024">2024</MenuItem>
                  <MenuItem value="2025">2025</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 600 }}>Ay</InputLabel>
                <Select
                  value={filters.month}
                  onChange={(e) => handleFilterChange('month', e.target.value)}
                  sx={{
                    height: 56,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <MenuItem value="ALL">Tümü</MenuItem>
                  {MONTHS.map((month) => (
                    <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 180px', minWidth: '180px' }}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 600 }}>Gecikme Durumu</InputLabel>
                <Select
                  value={filters.delayStatus}
                  onChange={(e) => handleFilterChange('delayStatus', e.target.value)}
                  sx={{
                    height: 56,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <MenuItem value="ALL">Tümü</MenuItem>
                  <MenuItem value="ZAMANINDA">Zamanında</MenuItem>
                  <MenuItem value="UYARI">Uyarı</MenuItem>
                  <MenuItem value="GECIKME">Gecikme</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 600 }}>Kritiklik</InputLabel>
                <Select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  sx={{
                    height: 56,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <MenuItem value="ALL">Tümü</MenuItem>
                  {Object.entries(PRIORITY_LABELS).map(([priority, label]) => (
                    <MenuItem key={priority} value={priority}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 180px', minWidth: '180px' }}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={clearFilters}
                startIcon={<ClearIcon />}
                sx={{ height: 56 }}
              >
                Filtreleri Temizle
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </StyledAccordion>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Karantina Listesi" />
          <Tab label="İstatistikler" />
          <Tab label="Raporlar" />
        </Tabs>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 0 && (
        <Card sx={{ 
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)', 
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.06)'
        }}>
          <CardContent sx={{ p: 0 }}>
            {/* Professional Table Header */}
            <Box sx={{ 
              background: appearanceSettings.primaryColor,
              color: 'white',
              p: 2.5,
              borderBottom: '3px solid #0d47a1'
            }}>
              <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center' }}>
                <InventoryIcon sx={{ mr: 1.5 }} />
                Karantina Kayıtları ({filteredData.length})
              </Typography>
            </Box>

            {/* Professional Table */}
            <TableContainer sx={{ 
              maxHeight: 600,
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px'
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '10px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '10px',
                '&:hover': {
                  background: '#a8a8a8'
                }
              }
            }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      bgcolor: '#f8f9fa', 
                      fontWeight: 700, 
                      fontSize: '0.85rem',
                      borderBottom: '2px solid #e0e0e0',
                      color: appearanceSettings.primaryColor,
                      minWidth: 140,
                      textAlign: 'center'
                    }}>
                      Takip No
                    </TableCell>
                    <TableCell sx={{ 
                      bgcolor: '#f8f9fa', 
                      fontWeight: 700, 
                      fontSize: '0.85rem',
                      borderBottom: '2px solid #e0e0e0',
                      color: '#424242',
                      minWidth: 120
                    }}>
                      Parça Kodu
                    </TableCell>
                    <TableCell sx={{ 
                      bgcolor: '#f8f9fa', 
                      fontWeight: 700, 
                      fontSize: '0.85rem',
                      borderBottom: '2px solid #e0e0e0',
                      color: '#424242',
                      minWidth: 180
                    }}>
                      Parça Adı
                    </TableCell>
                    <TableCell sx={{ 
                      bgcolor: '#f8f9fa', 
                      fontWeight: 700, 
                      fontSize: '0.85rem',
                      borderBottom: '2px solid #e0e0e0',
                      color: '#424242',
                      textAlign: 'center',
                      minWidth: 100
                    }}>
                      Miktar
                    </TableCell>
                    <TableCell sx={{ 
                      bgcolor: '#f8f9fa', 
                      fontWeight: 700, 
                      fontSize: '0.85rem',
                      borderBottom: '2px solid #e0e0e0',
                      color: '#424242',
                      minWidth: 170
                    }}>
                      Karantina Nedeni
                    </TableCell>
                    <TableCell sx={{ 
                      bgcolor: '#f8f9fa', 
                      fontWeight: 700, 
                      fontSize: '0.85rem',
                      borderBottom: '2px solid #e0e0e0',
                      color: '#424242',
                      minWidth: 140
                    }}>
                      Sorumlu Birim
                    </TableCell>
                    <TableCell sx={{ 
                      bgcolor: '#f8f9fa', 
                      fontWeight: 700, 
                      fontSize: '0.85rem',
                      borderBottom: '2px solid #e0e0e0',
                      color: '#424242',
                      textAlign: 'center',
                      minWidth: 150
                    }}>
                      Durum
                    </TableCell>
                    <TableCell sx={{ 
                      bgcolor: '#f8f9fa', 
                      fontWeight: 700, 
                      fontSize: '0.85rem',
                      borderBottom: '2px solid #e0e0e0',
                      color: '#424242',
                      textAlign: 'center',
                      minWidth: 100
                    }}>
                      Öncelik
                    </TableCell>
                    <TableCell sx={{ 
                      bgcolor: '#f8f9fa', 
                      fontWeight: 700, 
                      fontSize: '0.85rem',
                      borderBottom: '2px solid #e0e0e0',
                      color: '#424242',
                      textAlign: 'center',
                      minWidth: 120
                    }}>
                      Tarih
                    </TableCell>
                    <TableCell sx={{ 
                      bgcolor: '#f8f9fa', 
                      fontWeight: 700, 
                      fontSize: '0.85rem',
                      borderBottom: '2px solid #e0e0e0',
                      color: '#424242',
                      textAlign: 'center',
                      minWidth: 140
                    }}>
                      İşlemler
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                          <InventoryIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                          <Typography variant="h6" gutterBottom>
                            Henüz karantina kaydı bulunmamaktadır
                          </Typography>
                          <Typography variant="body2">
                            Yeni kayıt eklemek için "+" butonunu kullanın
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((record, index) => (
                      <TableRow 
                        key={record.id} 
                        hover
                        sx={{ 
                          '&:hover': { 
                            bgcolor: 'rgba(25, 118, 210, 0.04)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          },
                          transition: 'all 0.2s ease',
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa'
                        }}
                      >
                        {/* Takip Numarası */}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            bgcolor: appearanceSettings.primaryColor,
                            color: 'white',
                            px: 1,
                            py: 0.3,
                            borderRadius: 1.5,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            minWidth: 120,
                            justifyContent: 'center',
                            boxShadow: `0 2px 8px ${appearanceSettings.primaryColor}50`
                          }}>
                            <QrCodeIcon sx={{ fontSize: 14, mr: 0.3 }} />
                            {record.id}
                          </Box>
                        </TableCell>
                        {/* Parça Kodu */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color={appearanceSettings.primaryColor}>
                            {record.partCode}
                          </Typography>
                        </TableCell>

                        {/* Parça Adı */}
                        <TableCell>
                          <Typography variant="body2" sx={{ 
                            minWidth: 180,
                            wordWrap: 'break-word'
                          }}>
                            {record.partName}
                          </Typography>
                        </TableCell>

                        {/* Miktar */}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" fontWeight={500}>
                            {record.quantity} {formatUnit(record.unit)}
                          </Typography>
                        </TableCell>

                        {/* Karantina Nedeni */}
                        <TableCell>
                          <Typography variant="body2" sx={{ 
                            minWidth: 170,
                            wordWrap: 'break-word'
                          }}>
                            {record.quarantineReason}
                          </Typography>
                        </TableCell>
                        {/* Sorumlu Birim */}
                        <TableCell>
                          <Chip 
                            icon={<DepartmentIcon />}
                            label={record.responsibleDepartment}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: appearanceSettings.primaryColor,
                              color: appearanceSettings.primaryColor,
                              fontSize: '0.7rem',
                              height: 24,
                              '& .MuiChip-icon': {
                                fontSize: 14
                              }
                            }}
                          />
                        </TableCell>
                        {/* Durum */}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip
                            label={STATUS_LABELS[record.status]}
                            sx={{ 
                              backgroundColor: STATUS_COLORS[record.status],
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 24,
                              minWidth: 100,
                              maxWidth: 140,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              '& .MuiChip-label': {
                                px: 1,
                                lineHeight: 1.2
                              }
                            }}
                            size="small"
                          />
                        </TableCell>

                        {/* Öncelik */}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip
                            label={PRIORITY_LABELS[record.priority]}
                            sx={{
                              backgroundColor: PRIORITY_COLORS[record.priority],
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 24,
                              minWidth: 70,
                              maxWidth: 90,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              '& .MuiChip-label': {
                                px: 0.8,
                                lineHeight: 1.2
                              }
                            }}
                            size="small"
                          />
                        </TableCell>
                        {/* Tarih */}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            {new Date(record.quarantineDate).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </Typography>
                        </TableCell>
                        {/* İşlemler */}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="Görüntüle" arrow>
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewRecord(record)}
                                sx={{ 
                                  color: 'info.main',
                                  '&:hover': { 
                                    bgcolor: 'info.main',
                                    color: 'white',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s'
                                }}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Düzenle" arrow>
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditRecord(record)}
                                sx={{ 
                                  color: appearanceSettings.primaryColor,
                                  '&:hover': { 
                                    bgcolor: appearanceSettings.primaryColor,
                                    color: 'white',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s'
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {record.status === 'KARANTINADA' && (
                              <Tooltip title="Karar Ver" arrow>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleDecisionDialog(record)}
                                  sx={{ 
                                    color: 'warning.main',
                                    '&:hover': { 
                                      bgcolor: 'warning.main',
                                      color: 'white',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  <ApprovalIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            <Tooltip title="Sil" arrow>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteRecord(record.id)}
                                sx={{ 
                                  color: 'error.main',
                                  '&:hover': { 
                                    bgcolor: 'error.main',
                                    color: 'white',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s'
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Table Footer with Pagination Info */}
            {filteredData.length > 0 && (
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f8f9fa',
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="body2" color="text.secondary">
                  Toplam {filteredData.length} kayıt gösteriliyor
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
                  </Typography>
                  <IconButton size="small" onClick={loadData} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* İstatistikler Tab */}
      {activeTab === 1 && (
        <Box>
          {/* Detaylı İstatistik Kartları */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Durum Dağılımı
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {Object.entries(STATUS_LABELS).map(([status, label]) => {
                      const count = filteredData.filter(item => item.status === status).length;
                      const percentage = filteredData.length > 0 ? (count / filteredData.length * 100).toFixed(1) : '0';
                      return (
                        <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                bgcolor: STATUS_COLORS[status as keyof typeof STATUS_COLORS], 
                                borderRadius: '50%', 
                                mr: 1 
                              }} 
                            />
                            <Typography variant="body2">{label}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" fontWeight="bold">{count}</Typography>
                            <Typography variant="caption" color="text.secondary">%{percentage}</Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <CategoryIcon sx={{ mr: 1, color: 'warning.main' }} />
                    Öncelik Dağılımı
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {Object.entries(PRIORITY_LABELS).map(([priority, label]) => {
                      const count = filteredData.filter(item => item.priority === priority).length;
                      const percentage = filteredData.length > 0 ? (count / filteredData.length * 100).toFixed(1) : '0';
                      return (
                        <Box key={priority} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                bgcolor: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS], 
                                borderRadius: '50%', 
                                mr: 1 
                              }} 
                            />
                            <Typography variant="body2">{label}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" fontWeight="bold">{count}</Typography>
                            <Typography variant="caption" color="text.secondary">%{percentage}</Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <DepartmentIcon sx={{ mr: 1, color: 'info.main' }} />
                    Birim Bazlı Dağılım
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {DEPARTMENTS.slice(0, 5).map(dept => {
                      const count = filteredData.filter(item => item.responsibleDepartment === dept).length;
                      return (
                        <Box key={dept} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2">{dept}</Typography>
                          <Typography variant="body2" fontWeight="bold">{count}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <InventoryIcon sx={{ mr: 1, color: 'success.main' }} />
                    Birim Türü Dağılımı
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {UNITS.map(unit => {
                      const count = filteredData.filter(item => item.unit === unit).length;
                      return count > 0 ? (
                        <Box key={unit} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2">{unit}</Typography>
                          <Typography variant="body2" fontWeight="bold">{count}</Typography>
                        </Box>
                      ) : null;
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Trend Analizi */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                Son 30 Gün Trendi
              </Typography>
              <Box sx={{ mt: 3, p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body1" color="text.secondary">
                  Trend grafikleri için veri toplanıyor...
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Daha fazla veri girişi yapıldıkça detaylı trend analizleri görüntülenecektir.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Performans Metrikleri */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performans Metrikleri
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {stats.avgProcessingTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ortalama İşlem Süresi (gün)
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {filteredData.length > 0 ? ((stats.released / filteredData.length) * 100).toFixed(1) : 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Başarılı Çıkış Oranı
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.50', borderRadius: 1 }}>
                    <Typography variant="h4" color="error.main" fontWeight="bold">
                      ₺{stats.totalCost.toLocaleString('tr-TR')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toplam Tahmini Maliyet
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Raporlar Tab */}
      {activeTab === 2 && (
        <Box>
          {/* Rapor Filtreleri */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rapor Filtreleri
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Durum</InputLabel>
                    <Select defaultValue="ALL" label="Durum">
                      <MenuItem value="ALL">Tümü</MenuItem>
                      {Object.entries(STATUS_LABELS).map(([status, label]) => (
                        <MenuItem key={status} value={status}>{label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Öncelik</InputLabel>
                    <Select defaultValue="ALL" label="Öncelik">
                      <MenuItem value="ALL">Tümü</MenuItem>
                      {Object.entries(PRIORITY_LABELS).map(([priority, label]) => (
                        <MenuItem key={priority} value={priority}>{label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Başlangıç Tarihi"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Bitiş Tarihi"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Rapor Türleri */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PrintIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Standart Raporlar
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <AssessmentIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Karantina Özet Raporu"
                        secondary="Tüm karantina kayıtlarının özet raporu"
                      />
                      <ListItemSecondaryAction>
                        <Button variant="outlined" size="small" startIcon={<PrintIcon />}>
                          PDF
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <CategoryIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Birim Bazlı Rapor"
                        secondary="Birimlere göre karantina dağılımı"
                      />
                      <ListItemSecondaryAction>
                        <Button variant="outlined" size="small" startIcon={<PrintIcon />}>
                          PDF
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Kritik Parçalar Raporu"
                        secondary="Yüksek ve kritik öncelikli parçalar"
                      />
                      <ListItemSecondaryAction>
                        <Button variant="outlined" size="small" startIcon={<PrintIcon />}>
                          PDF
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <Schedule color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Zaman Bazlı Rapor"
                        secondary="Tarih aralığına göre karantina analizi"
                      />
                      <ListItemSecondaryAction>
                        <Button variant="outlined" size="small" startIcon={<PrintIcon />}>
                          PDF
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssessmentIcon sx={{ mr: 1, color: 'success.main' }} />
                    Analiz Raporları
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <DepartmentIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Performans Analizi"
                        secondary="İşlem süreleri ve başarı oranları"
                      />
                      <ListItemSecondaryAction>
                        <Button variant="outlined" size="small" startIcon={<PrintIcon />}>
                          PDF
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <InventoryIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Maliyet Analizi"
                        secondary="Karantina maliyetleri ve dağılımı"
                      />
                      <ListItemSecondaryAction>
                        <Button variant="outlined" size="small" startIcon={<PrintIcon />}>
                          PDF
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <AutoAwesomeIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Trend Analizi"
                        secondary="Aylık ve haftalık trendler"
                      />
                      <ListItemSecondaryAction>
                        <Button variant="outlined" size="small" startIcon={<PrintIcon />}>
                          PDF
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Karar Analizi"
                        secondary="Alınan kararlar ve sonuçları"
                      />
                      <ListItemSecondaryAction>
                        <Button variant="outlined" size="small" startIcon={<PrintIcon />}>
                          PDF
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Hızlı Rapor Oluşturma */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hızlı Rapor Oluşturma
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<PrintIcon />}
                  onClick={() => showNotification('Günlük rapor oluşturuluyor...', 'info')}
                >
                  Günlük Rapor
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary"
                  startIcon={<PrintIcon />}
                  onClick={() => showNotification('Haftalık rapor oluşturuluyor...', 'info')}
                >
                  Haftalık Rapor
                </Button>
                <Button 
                  variant="contained" 
                  color="success"
                  startIcon={<PrintIcon />}
                  onClick={() => showNotification('Aylık rapor oluşturuluyor...', 'info')}
                >
                  Aylık Rapor
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<AssessmentIcon />}
                  onClick={() => showNotification('Özel rapor tasarlayıcısı açılıyor...', 'info')}
                >
                  Özel Rapor Tasarla
                </Button>
              </Box>

              {/* Rapor Notları */}
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Rapor Notları:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  • PDF raporları otomatik olarak indirilir<br/>
                  • Raporlar Türkçe karakter desteği ile oluşturulur<br/>
                  • Filtrelenen veriler rapor kapsamına dahil edilir<br/>
                  • Grafik ve tablolar yüksek çözünürlükte export edilir
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleAddRecord}
      >
        <AddIcon />
      </Fab>

      {/* Enhanced Add/Edit Dialog with Multi-Step Form */}
      <Dialog 
        open={addDialog || editDialog} 
        onClose={() => {
          setAddDialog(false);
          setEditDialog(false);
          setSelectedRecord(null);
          setActiveStep(0);
        }}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '90vh' } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedRecord ? 'Karantina Kaydını Düzenle' : 'Yeni Karantina Kaydı'}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    size="small"
                  />
                }
                label="Otomatik Kaydet"
                sx={{ mr: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                İlerleme: {formProgress}%
              </Typography>
            </Box>
          </Box>
          <LinearProgress variant="determinate" value={formProgress} sx={{ mt: 1 }} />
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', height: '100%' }}>
            {/* Left Sidebar - Stepper */}
            <Box sx={{ width: 280, borderRight: 1, borderColor: 'divider', p: 2 }}>
              <Stepper orientation="vertical" activeStep={activeStep}>
                {FORM_STEPS.map((label, index) => (
                  <Step key={label}>
                    <StepLabel 
                      onClick={() => handleStepChange(index)}
                      sx={{ cursor: 'pointer' }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Right Content Area */}
            <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
              {/* Step 0: Temel Bilgiler */}
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <InventoryIcon sx={{ mr: 1 }} />
                    Temel Bilgiler
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {/* 🚀 Karantina Takip Numarası */}
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Karantina Takip Numarası"
                        value={formData.id || ''}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              <QrCodeIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                        sx={{
                          '& .MuiInputBase-input': {
                            fontWeight: 'bold',
                            color: 'primary.main',
                            textAlign: 'center'
                          },
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'action.hover'
                          }
                        }}
                        helperText="Otomatik oluşturulan takip numarası"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={8}>
                      <Autocomplete
                        freeSolo
                        options={partCodeSuggestions}
                        value={formData.partCode || ''}
                        onInputChange={(event, newInputValue) => {
                          setFormData(prev => ({ ...prev, partCode: newInputValue }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Parça Kodu *"
                            required
                            error={formValidation.partCode && !formValidation.partCode.isValid}
                            helperText={formValidation.partCode?.message}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Tooltip title="Parça kodlarını yönet">
                                    <IconButton onClick={() => setPartCodeDialog(true)} size="small">
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>

                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Parça Adı *"
                        value={formData.partName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, partName: e.target.value }))}
                        required
                        error={formValidation.partName && !formValidation.partName.isValid}
                        helperText={formValidation.partName?.message}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Miktar *"
                        type="number"
                        value={formData.quantity || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                        required
                        error={formValidation.quantity && !formValidation.quantity.isValid}
                        helperText={formValidation.quantity?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Birim</InputLabel>
                        <Select
                          value={formData.unit || 'adet'}
                          label="Birim"
                          onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                        >
                          {UNITS.map(unit => (
                            <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Öncelik</InputLabel>
                        <Select
                          value={formData.priority || 'ORTA'}
                          label="Öncelik"
                          onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as QuarantineRecord['priority'] }))}
                        >
                          <MenuItem value="DUSUK">Düşük</MenuItem>
                          <MenuItem value="ORTA">Orta</MenuItem>
                          <MenuItem value="YUKSEK">Yüksek</MenuItem>
                          <MenuItem value="KRITIK">Kritik</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Karantina Nedeni *</InputLabel>
                        <Select
                          value={formData.quarantineReason || ''}
                          label="Karantina Nedeni *"
                          onChange={(e) => setFormData(prev => ({ ...prev, quarantineReason: e.target.value }))}
                          required
                          error={formValidation.quarantineReason && !formValidation.quarantineReason.isValid}
                        >
                          {QUARANTINE_REASONS.map(reason => (
                            <MenuItem key={reason} value={reason}>{reason}</MenuItem>
                          ))}
                        </Select>
                        {formValidation.quarantineReason && !formValidation.quarantineReason.isValid && (
                          <FormHelperText error>{formValidation.quarantineReason.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Sorumlu Birim *</InputLabel>
                        <Select
                          value={formData.responsibleDepartment || ''}
                          label="Sorumlu Birim *"
                          onChange={(e) => setFormData(prev => ({ ...prev, responsibleDepartment: e.target.value }))}
                          required
                          error={formValidation.responsibleDepartment && !formValidation.responsibleDepartment.isValid}
                        >
                          {DEPARTMENTS.map(dept => (
                            <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                          ))}
                        </Select>
                        {formValidation.responsibleDepartment && !formValidation.responsibleDepartment.isValid && (
                          <FormHelperText error>{formValidation.responsibleDepartment.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ mr: 1 }} />
                            Sorumlu Kişiler
                          </Typography>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Sorumlu kişileri yönet">
                              <IconButton
                                size="small"
                                onClick={() => setResponsiblePersonDialog(true)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={handleAddResponsiblePerson}
                            >
                              Sorumlu Ekle
                            </Button>
                          </Box>
                        </Box>
                        
                        {formData.responsiblePersons && formData.responsiblePersons.length > 0 ? (
                          <Box>
                            {formData.responsiblePersons.map((person, index) => (
                              <Card key={person.id} variant="outlined" sx={{ mb: 2, p: 2, position: 'relative' }}>
                                {person.isPrimary && (
                                  <Chip
                                    label="Ana Sorumlu"
                                    color="primary"
                                    size="small"
                                    sx={{ position: 'absolute', top: 8, right: 8 }}
                                  />
                                )}
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={6}>
                                    <Autocomplete
                                      freeSolo
                                      options={responsiblePersonSuggestions.map(rp => rp.name)}
                                      value={person.name}
                                      onChange={(event, newValue) => {
                                        // Seçilen kişinin bilgilerini otomatik doldur
                                        const selectedPerson = responsiblePersonSuggestions.find(rp => rp.name === newValue);
                                        if (selectedPerson) {
                                          handleUpdateResponsiblePerson(person.id, 'name', selectedPerson.name);
                                          handleUpdateResponsiblePerson(person.id, 'department', selectedPerson.department);
                                          handleUpdateResponsiblePerson(person.id, 'role', selectedPerson.role);
                                          handleUpdateResponsiblePerson(person.id, 'email', selectedPerson.email);
                                          handleUpdateResponsiblePerson(person.id, 'phone', selectedPerson.phone);
                                        } else if (newValue) {
                                          handleUpdateResponsiblePerson(person.id, 'name', newValue);
                                        }
                                      }}
                                      onInputChange={(event, newInputValue) => {
                                        handleUpdateResponsiblePerson(person.id, 'name', newInputValue);
                                      }}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          label="Ad Soyad *"
                                          size="small"
                                          required={person.isPrimary}
                                        />
                                      )}
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                      <InputLabel>Birim</InputLabel>
                                      <Select
                                        value={person.department}
                                        label="Birim"
                                        onChange={(e) => handleUpdateResponsiblePerson(person.id, 'department', e.target.value)}
                                      >
                                        {DEPARTMENTS.map(dept => (
                                          <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <TextField
                                      fullWidth
                                      label="Rol/Görev"
                                      size="small"
                                      value={person.role}
                                      onChange={(e) => handleUpdateResponsiblePerson(person.id, 'role', e.target.value)}
                                      placeholder="Örn: Muayene Sorumlusu"
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <TextField
                                      fullWidth
                                      label="E-posta"
                                      size="small"
                                      type="email"
                                      value={person.email}
                                      onChange={(e) => handleUpdateResponsiblePerson(person.id, 'email', e.target.value)}
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <TextField
                                      fullWidth
                                      label="Telefon"
                                      size="small"
                                      value={person.phone}
                                      onChange={(e) => handleUpdateResponsiblePerson(person.id, 'phone', e.target.value)}
                                    />
                                  </Grid>
                                </Grid>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                  <Box>
                                    {!person.isPrimary && (
                                      <Button
                                        size="small"
                                        onClick={() => handleSetPrimaryResponsible(person.id)}
                                        startIcon={<CheckIcon />}
                                      >
                                        Ana Sorumlu Yap
                                      </Button>
                                    )}
                                  </Box>
                                  <Button
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveResponsiblePerson(person.id)}
                                    startIcon={<DeleteIcon />}
                                    disabled={person.isPrimary && formData.responsiblePersons!.length === 1}
                                  >
                                    Kaldır
                                  </Button>
                                </Box>
                              </Card>
                            ))}
                          </Box>
                        ) : (
                          <Box textAlign="center" py={3}>
                            <Typography color="text.secondary" variant="body2">
                              Henüz sorumlu kişi eklenmemiş
                            </Typography>
                            <Typography color="text.secondary" variant="caption">
                              En az bir sorumlu kişi eklemeniz önerilir
                            </Typography>
                          </Box>
                        )}
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Konum"
                        value={formData.location || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Örn: Ambar-A1-Raf3"
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Step 1: Detaylı Bilgiler */}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <CategoryIcon sx={{ mr: 1 }} />
                    Detaylı Bilgiler
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        freeSolo
                        options={supplierSuggestions}
                        value={formData.supplierName || ''}
                        onInputChange={(event, newInputValue) => {
                          setFormData(prev => ({ ...prev, supplierName: newInputValue }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Tedarikçi"
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: <DepartmentIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Müşteri"
                        value={formData.customerName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Araç Modeli</InputLabel>
                        <Select
                          value={formData.vehicleModel || ''}
                          label="Araç Modeli"
                          onChange={(e) => setFormData(prev => ({ ...prev, vehicleModel: e.target.value }))}
                        >
                          {VEHICLE_MODELS.map(model => (
                            <MenuItem key={model} value={model}>{model}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Üretim Emri"
                        value={formData.productionOrder || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, productionOrder: e.target.value }))}
                      />
                    </Grid>


                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Çizim Numarası"
                        value={formData.drawingNumber || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, drawingNumber: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Revizyon"
                        value={formData.revision || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, revision: e.target.value }))}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Malzeme Tipi</InputLabel>
                        <Select
                          value={formData.materialType || ''}
                          label="Malzeme Tipi"
                          onChange={(e) => setFormData(prev => ({ ...prev, materialType: e.target.value }))}
                        >
                          {MATERIAL_TYPES.map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>


                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Risk Seviyesi</InputLabel>
                        <Select
                          value={formData.riskLevel || 'ORTA'}
                          label="Risk Seviyesi"
                          onChange={(e) => setFormData(prev => ({ ...prev, riskLevel: e.target.value as QuarantineRecord['riskLevel'] }))}
                        >
                          <MenuItem value="DUSUK">Düşük</MenuItem>
                          <MenuItem value="ORTA">Orta</MenuItem>
                          <MenuItem value="YUKSEK">Yüksek</MenuItem>
                          <MenuItem value="KRITIK">Kritik</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Tahmini Maliyet (₺)"
                        type="number"
                        value={formData.estimatedCost || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                        error={formValidation.estimatedCost && !formValidation.estimatedCost.isValid}
                        helperText={formValidation.estimatedCost?.message}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Step 2: Muayene Sonuçları */}
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AssessmentIcon sx={{ mr: 1 }} />
                    Muayene Sonuçları
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Muayene Tipi</InputLabel>
                        <Select
                          value={formData.inspectionType || ''}
                          label="Muayene Tipi"
                          onChange={(e) => setFormData(prev => ({ ...prev, inspectionType: e.target.value }))}
                        >
                          {INSPECTION_TYPES.map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Muayene Tarihi"
                        type="date"
                        value={formData.inspectionDate || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, inspectionDate: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Autocomplete
                        freeSolo
                        options={inspectorSuggestions}
                        value={formData.inspectorName || ''}
                        onInputChange={(event, newInputValue) => {
                          setFormData(prev => ({ ...prev, inspectorName: newInputValue }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Muayeneyi Yapan"
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Tooltip title="Muayene yapan kişileri yönet">
                                    <IconButton onClick={() => setInspectorDialog(true)} size="small">
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Muayene Sonuçları"
                        multiline
                        rows={4}
                        value={formData.inspectionResults || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, inspectionResults: e.target.value }))}
                        placeholder="Detaylı muayene sonuçlarını buraya yazın..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Derhal Alınacak Aksiyonlar"
                        multiline
                        rows={3}
                        value={formData.immediateAction || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, immediateAction: e.target.value }))}
                        placeholder="Acil olarak alınması gereken önlemler..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Çevreleme Aksiyonu"
                        multiline
                        rows={3}
                        value={formData.containmentAction || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, containmentAction: e.target.value }))}
                        placeholder="Problemin yayılmasını önlemek için alınan tedbirler..."
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Kök Neden"
                        multiline
                        rows={3}
                        value={formData.rootCause || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, rootCause: e.target.value }))}
                        placeholder="Problemin temel nedeni..."
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Önleyici Faaliyet"
                        multiline
                        rows={3}
                        value={formData.preventiveAction || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, preventiveAction: e.target.value }))}
                        placeholder="Gelecekte benzer sorunları önlemek için..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Genel Notlar"
                        multiline
                        rows={3}
                        value={formData.notes || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Ek bilgiler ve notlar..."
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Step 3: Ekler ve Dökümanlar */}
              {activeStep === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AttachFileIcon sx={{ mr: 1 }} />
                    Ekler ve Dökümanlar
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="subtitle1">Dosya Ekleri</Typography>
                          <ButtonGroup variant="outlined" size="small">
                            <Button
                              component="label"
                              startIcon={<UploadIcon />}
                            >
                              Dosya Yükle
                              <input
                                type="file"
                                hidden
                                multiple
                                onChange={handleFileUpload}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                              />
                            </Button>
                            <Button startIcon={<PhotoIcon />}>
                              Fotoğraf Ekle
                            </Button>
                          </ButtonGroup>
                        </Box>
                        
                        {formData.attachments && formData.attachments.length > 0 ? (
                          <List>
                            {formData.attachments.map((attachment) => (
                              <ListItem key={attachment.id}>
                                <ListItemIcon>
                                  <AttachFileIcon />
                                </ListItemIcon>
                                <ListItemText
                                  primary={attachment.name}
                                  secondary={`${(attachment.size / 1024).toFixed(1)} KB - ${new Date(attachment.uploadDate).toLocaleString('tr-TR')}`}
                                />
                                <ListItemSecondaryAction>
                                  <IconButton
                                    edge="end"
                                    onClick={() => handleRemoveAttachment(attachment.id)}
                                    color="error"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Box textAlign="center" py={3}>
                            <Typography color="text.secondary">
                              Henüz dosya eklenmemiş
                            </Typography>
                          </Box>
                        )}
                      </Card>
                    </Grid>

                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="subtitle1">Uygunsuzluk Detayları</Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={handleAddNonConformity}
                          >
                            Uygunsuzluk Ekle
                          </Button>
                        </Box>
                        
                        {formData.nonConformityDetails && formData.nonConformityDetails.length > 0 ? (
                          <Box>
                            {formData.nonConformityDetails.map((nonConformity, index) => (
                              <Card key={nonConformity.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                      <InputLabel>Uygunsuzluk Tipi</InputLabel>
                                      <Select
                                        value={nonConformity.type}
                                        label="Uygunsuzluk Tipi"
                                        onChange={(e) => {
                                          const updated = [...(formData.nonConformityDetails || [])];
                                          updated[index] = { ...updated[index], type: e.target.value };
                                          setFormData(prev => ({ ...prev, nonConformityDetails: updated }));
                                        }}
                                      >
                                        {NONCONFORMITY_TYPES.map(type => (
                                          <MenuItem key={type} value={type}>{type}</MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                      <InputLabel>Önem Derecesi</InputLabel>
                                      <Select
                                        value={nonConformity.severity}
                                        label="Önem Derecesi"
                                        onChange={(e) => {
                                          const updated = [...(formData.nonConformityDetails || [])];
                                          updated[index] = { ...updated[index], severity: e.target.value as any };
                                          setFormData(prev => ({ ...prev, nonConformityDetails: updated }));
                                        }}
                                      >
                                        <MenuItem value="DUSUK">Düşük</MenuItem>
                                        <MenuItem value="ORTA">Orta</MenuItem>
                                        <MenuItem value="YUKSEK">Yüksek</MenuItem>
                                        <MenuItem value="KRITIK">Kritik</MenuItem>
                                      </Select>
                                    </FormControl>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <TextField
                                      fullWidth
                                      label="Açıklama"
                                      size="small"
                                      multiline
                                      rows={2}
                                      value={nonConformity.description}
                                      onChange={(e) => {
                                        const updated = [...(formData.nonConformityDetails || [])];
                                        updated[index] = { ...updated[index], description: e.target.value };
                                        setFormData(prev => ({ ...prev, nonConformityDetails: updated }));
                                      }}
                                    />
                                  </Grid>
                                </Grid>
                              </Card>
                            ))}
                          </Box>
                        ) : (
                          <Box textAlign="center" py={2}>
                            <Typography color="text.secondary" variant="body2">
                              Henüz uygunsuzluk detayı eklenmemiş
                            </Typography>
                          </Box>
                        )}
                      </Card>
                    </Grid>

                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="subtitle1">Düzeltici Faaliyetler</Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={handleAddCorrectiveAction}
                          >
                            Faaliyet Ekle
                          </Button>
                        </Box>
                        
                        {formData.correctiveActions && formData.correctiveActions.length > 0 ? (
                          <Box>
                            {formData.correctiveActions.map((action, index) => (
                              <Card key={action.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                                <Grid container spacing={2}>
                                  <Grid item xs={12}>
                                    <TextField
                                      fullWidth
                                      label="Faaliyet"
                                      size="small"
                                      value={action.action}
                                      onChange={(e) => {
                                        const updated = [...(formData.correctiveActions || [])];
                                        updated[index] = { ...updated[index], action: e.target.value };
                                        setFormData(prev => ({ ...prev, correctiveActions: updated }));
                                      }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                      fullWidth
                                      label="Sorumlu"
                                      size="small"
                                      value={action.responsible}
                                      onChange={(e) => {
                                        const updated = [...(formData.correctiveActions || [])];
                                        updated[index] = { ...updated[index], responsible: e.target.value };
                                        setFormData(prev => ({ ...prev, correctiveActions: updated }));
                                      }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                      fullWidth
                                      label="Hedef Tarih"
                                      type="date"
                                      size="small"
                                      value={action.targetDate}
                                      onChange={(e) => {
                                        const updated = [...(formData.correctiveActions || [])];
                                        updated[index] = { ...updated[index], targetDate: e.target.value };
                                        setFormData(prev => ({ ...prev, correctiveActions: updated }));
                                      }}
                                      InputLabelProps={{ shrink: true }}
                                    />
                                  </Grid>
                                </Grid>
                              </Card>
                            ))}
                          </Box>
                        ) : (
                          <Box textAlign="center" py={2}>
                            <Typography color="text.secondary" variant="body2">
                              Henüz düzeltici faaliyet eklenmemiş
                            </Typography>
                          </Box>
                        )}
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Step 4: Özet ve Onay */}
              {activeStep === 4 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <CheckIcon sx={{ mr: 1 }} />
                    Özet ve Onay
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Lütfen girdiğiniz bilgileri kontrol edin ve kaydetmek için "Kaydet" butonuna tıklayın.
                  </Alert>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom color="primary">
                          Temel Bilgiler
                        </Typography>
                        <Typography variant="body2"><strong>Parça Kodu:</strong> {formData.partCode}</Typography>
                        <Typography variant="body2"><strong>Parça Adı:</strong> {formData.partName}</Typography>
                                                    <Typography variant="body2"><strong>Miktar:</strong> {formData.quantity} {formatUnit(formData.unit || 'adet')}</Typography>
                        <Typography variant="body2"><strong>Öncelik:</strong> {formData.priority}</Typography>
                        <Typography variant="body2"><strong>Karantina Nedeni:</strong> {formData.quarantineReason}</Typography>
                        <Typography variant="body2"><strong>Sorumlu Birim:</strong> {formData.responsibleDepartment}</Typography>
                        <Typography variant="body2">
                          <strong>Sorumlu Kişiler:</strong> {formData.responsiblePersons && formData.responsiblePersons.length > 0 
                            ? formData.responsiblePersons.map(p => `${p.name} (${p.department})`).join(', ')
                            : 'Henüz eklenmemiş'
                          }
                        </Typography>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom color="primary">
                          Ek Bilgiler
                        </Typography>
                        <Typography variant="body2"><strong>Tedarikçi:</strong> {formData.supplierName || '-'}</Typography>
                        <Typography variant="body2"><strong>Araç Modeli:</strong> {formData.vehicleModel || '-'}</Typography>
                        <Typography variant="body2"><strong>Muayene Tipi:</strong> {formData.inspectionType || '-'}</Typography>
                        <Typography variant="body2"><strong>Malzeme Tipi:</strong> {formData.materialType || '-'}</Typography>
                        <Typography variant="body2"><strong>Risk Seviyesi:</strong> {formData.riskLevel}</Typography>
                        <Typography variant="body2"><strong>Tahmini Maliyet:</strong> ₺{formData.estimatedCost?.toLocaleString('tr-TR')}</Typography>
                      </Card>
                    </Grid>

                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom color="primary">
                          Muayene ve Aksiyon Özeti
                        </Typography>
                        {formData.inspectionResults && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Muayene Sonuçları:</strong> {formData.inspectionResults.substring(0, 200)}
                            {formData.inspectionResults.length > 200 ? '...' : ''}
                          </Typography>
                        )}
                        <Typography variant="body2"><strong>Ekli Dosya Sayısı:</strong> {formData.attachments?.length || 0}</Typography>
                        <Typography variant="body2"><strong>Uygunsuzluk Sayısı:</strong> {formData.nonConformityDetails?.length || 0}</Typography>
                        <Typography variant="body2"><strong>Düzeltici Faaliyet Sayısı:</strong> {formData.correctiveActions?.length || 0}</Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  startIcon={<ExpandLessIcon />}
                >
                  Geri
                </Button>
                
                <Box display="flex" gap={2}>
                  {activeStep < FORM_STEPS.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<ExpandMoreIcon />}
                    >
                      İleri
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleSaveRecord}
                      startIcon={<SaveIcon />}
                      color="success"
                    >
                      Kaydet
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
          <Button 
            onClick={() => {
              setAddDialog(false);
              setEditDialog(false);
              setSelectedRecord(null);
              setActiveStep(0);
            }}
            startIcon={<CancelIcon />}
          >
            İptal
          </Button>
          
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
                showNotification('Form verileri panoya kopyalandı!', 'info');
              }}
            >
              Kopyala
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                                 setFormData({
                   partCode: '',
                   partName: '',
                   quantity: 0,
                   unit: 'adet',
                   quarantineReason: '',
                   responsibleDepartment: '',
                   responsiblePersons: [],
                   supplierName: '',
                   productionOrder: '',
                   inspectionResults: '',
                   notes: '',
                   priority: 'ORTA',
                   estimatedCost: 0,
                   attachments: [],
                   followUpActions: []
                 });
                setActiveStep(0);
                showNotification('Form temizlendi!', 'info');
              }}
            >
              Temizle
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Decision Dialog */}
      <Dialog 
        open={decisionDialog} 
        onClose={() => {
          setDecisionDialog(false);
          setSelectedRecord(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Karantina Kararı - {selectedRecord?.partCode}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Bu parça için ne karar veriyorsunuz?
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                color="error"
                startIcon={<ScrapIcon />}
                onClick={() => {
                  const notes = prompt('Hurda kararı için açıklama:');
                  if (notes !== null) {
                    handleMakeDecision('HURDA', notes || 'Hurda kararı verildi');
                  }
                }}
                sx={{ mb: 2 }}
              >
                Hurda
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                color="info"
                startIcon={<ApprovalIcon />}
                onClick={() => {
                  const notes = prompt('Sapma onayı için açıklama:');
                  if (notes !== null) {
                    handleMakeDecision('SAPMA_ONAYI', notes || 'Sapma onayı verildi');
                  }
                }}
                sx={{ mb: 2 }}
              >
                Sapma Onayı
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={<ReworkIcon />}
                onClick={() => {
                  const notes = prompt('Yeniden işlem için açıklama:');
                  if (notes !== null) {
                    handleMakeDecision('YENIDEN_ISLEM', notes || 'Yeniden işlem kararı verildi');
                  }
                }}
                sx={{ mb: 2 }}
              >
                Yeniden İşlem
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                onClick={() => {
                  const notes = prompt('Serbest bırakma için açıklama:');
                  if (notes !== null) {
                    handleMakeDecision('SERBEST_BIRAKILDI', notes || 'Serbest bırakıldı');
                  }
                }}
                sx={{ mb: 2 }}
              >
                Serbest Bırak
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDecisionDialog(false);
            setSelectedRecord(null);
          }}>
            İptal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Professional View Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => {
          setViewDialog(false);
          setSelectedRecord(null);
        }}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '90vh' } }}
      >
        {selectedRecord && (
          <>
            <DialogTitle sx={{ pb: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Karantina Kaydı Detayları
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    {selectedRecord.partCode} - {selectedRecord.partName}
                  </Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <Chip 
                    label={STATUS_LABELS[selectedRecord.status]} 
                    size="medium"
                    sx={{
                      bgcolor: STATUS_COLORS[selectedRecord.status],
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }}
                  />
                  <Chip 
                    label={PRIORITY_LABELS[selectedRecord.priority]} 
                    size="medium"
                    sx={{
                      bgcolor: PRIORITY_COLORS[selectedRecord.priority],
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }}
                  />
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', height: '100%' }}>
                {/* Left Sidebar - Quick Info */}
                <Box sx={{ width: 320, borderRight: 1, borderColor: 'divider', p: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
                    Özet Bilgiler
                  </Typography>
                  
                  <Card sx={{ mb: 3, p: 2 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight="bold">Parça Bilgileri</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Kod: <strong>{selectedRecord.partCode}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Ad: <strong>{selectedRecord.partName}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Miktar: <strong>{selectedRecord.quantity} {formatUnit(selectedRecord.unit)}</strong>
                    </Typography>
                    {selectedRecord.location && (
                      <Typography variant="body2" color="text.secondary">
                        Konum: <strong>{selectedRecord.location}</strong>
                      </Typography>
                    )}
                  </Card>

                  <Card sx={{ mb: 3, p: 2 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight="bold">Zaman Çizelgesi</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Karantina: <strong>{new Date(selectedRecord.quarantineDate).toLocaleDateString('tr-TR')}</strong>
                    </Typography>
                    {selectedRecord.inspectionDate && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Muayene: <strong>{new Date(selectedRecord.inspectionDate).toLocaleDateString('tr-TR')}</strong>
                      </Typography>
                    )}
                    {selectedRecord.decisionDate && (
                      <Typography variant="body2" color="text.secondary">
                        Karar: <strong>{new Date(selectedRecord.decisionDate).toLocaleDateString('tr-TR')}</strong>
                      </Typography>
                    )}
                  </Card>

                  <Card sx={{ mb: 3, p: 2 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight="bold">Maliyet Analizi</Typography>
                    </Box>
                    <Typography variant="h5" color="error.main" fontWeight="bold" sx={{ mb: 1 }}>
                      ₺{selectedRecord.estimatedCost.toLocaleString('tr-TR')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tahmini toplam maliyet
                    </Typography>
                  </Card>

                  {selectedRecord.responsiblePersons && selectedRecord.responsiblePersons.length > 0 && (
                    <Card sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle1" fontWeight="bold">Sorumlu Kişiler</Typography>
                      </Box>
                      {selectedRecord.responsiblePersons.map((person, index) => (
                        <Box key={index} sx={{ mb: 1.5, p: 1.5, bgcolor: person.isPrimary ? 'primary.light' : 'grey.100', borderRadius: 1 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" fontWeight={person.isPrimary ? 'bold' : 'normal'} 
                                        color={person.isPrimary ? 'primary.contrastText' : 'text.primary'}>
                              {person.name}
                            </Typography>
                            {person.isPrimary && (
                              <Chip label="Ana" size="small" sx={{ bgcolor: 'white', color: 'primary.main' }} />
                            )}
                          </Box>
                          <Typography variant="caption" 
                                      color={person.isPrimary ? 'primary.contrastText' : 'text.secondary'}>
                            {person.department} - {person.role}
                          </Typography>
                          {person.email && (
                            <Typography variant="caption" display="block"
                                        color={person.isPrimary ? 'primary.contrastText' : 'text.secondary'}>
                              E-posta: {person.email}
                            </Typography>
                          )}
                          {person.phone && (
                            <Typography variant="caption" display="block"
                                        color={person.isPrimary ? 'primary.contrastText' : 'text.secondary'}>
                              Telefon: {person.phone}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Card>
                  )}
                </Box>

                {/* Right Content Area */}
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <Box sx={{ p: 4 }}>
                    {/* Karantina Detayları */}
                    <Card variant="outlined" sx={{ mb: 3, p: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
                        Karantina Detayları
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Karantina Nedeni
                            </Typography>
                            <Box display="flex" alignItems="center" sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                              <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                              <Typography variant="body1" fontWeight="medium" color="warning.contrastText">
                                {selectedRecord.quarantineReason}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Sorumlu Birim
                            </Typography>
                            <Box display="flex" alignItems="center" sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                              <DepartmentIcon sx={{ mr: 1, color: 'info.main' }} />
                              <Typography variant="body1" fontWeight="medium" color="info.contrastText">
                                {selectedRecord.responsibleDepartment}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        {selectedRecord.supplierName && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Tedarikçi</Typography>
                            <Typography variant="body1" sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: 1 }}>
                              {selectedRecord.supplierName}
                            </Typography>
                          </Grid>
                        )}
                        {selectedRecord.vehicleModel && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Araç Modeli</Typography>
                            <Typography variant="body1" sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: 1 }}>
                              {selectedRecord.vehicleModel}
                            </Typography>
                          </Grid>
                        )}
                        {selectedRecord.productionOrder && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Üretim Emri</Typography>
                            <Typography variant="body1" sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: 1 }}>
                              {selectedRecord.productionOrder}
                            </Typography>
                          </Grid>
                        )}

                      </Grid>
                    </Card>

                    {/* Muayene Sonuçları */}
                    {selectedRecord.inspectionResults && (
                      <Card variant="outlined" sx={{ mb: 3, p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
                          Muayene Sonuçları
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                          {selectedRecord.inspectionType && (
                            <Grid item xs={12} sm={4}>
                              <Typography variant="subtitle2" color="text.secondary">Muayene Tipi</Typography>
                              <Typography variant="body1" fontWeight="medium">{selectedRecord.inspectionType}</Typography>
                            </Grid>
                          )}
                          {selectedRecord.inspectorName && (
                            <Grid item xs={12} sm={4}>
                              <Typography variant="subtitle2" color="text.secondary">Muayeneci</Typography>
                              <Typography variant="body1" fontWeight="medium">{selectedRecord.inspectorName}</Typography>
                            </Grid>
                          )}
                          {selectedRecord.inspectionDate && (
                            <Grid item xs={12} sm={4}>
                              <Typography variant="subtitle2" color="text.secondary">Muayene Tarihi</Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {new Date(selectedRecord.inspectionDate).toLocaleDateString('tr-TR')}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                        <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 1, borderLeft: 4, borderColor: 'info.main' }}>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {selectedRecord.inspectionResults}
                          </Typography>
                        </Box>
                      </Card>
                    )}

                    {/* Ek Bilgiler */}
                    <Card variant="outlined" sx={{ mb: 3, p: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
                        Ek Bilgiler
                      </Typography>
                      <Grid container spacing={3}>
                        {selectedRecord.materialType && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle2" color="text.secondary">Malzeme Tipi</Typography>
                            <Typography variant="body1">{selectedRecord.materialType}</Typography>
                          </Grid>
                        )}

                        {selectedRecord.riskLevel && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle2" color="text.secondary">Risk Seviyesi</Typography>
                            <Chip 
                              label={PRIORITY_LABELS[selectedRecord.riskLevel as keyof typeof PRIORITY_LABELS]} 
                              size="small"
                              sx={{
                                bgcolor: PRIORITY_COLORS[selectedRecord.riskLevel as keyof typeof PRIORITY_COLORS],
                                color: 'white'
                              }}
                            />
                          </Grid>
                        )}
                        {selectedRecord.customerName && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle2" color="text.secondary">Müşteri</Typography>
                            <Typography variant="body1">{selectedRecord.customerName}</Typography>
                          </Grid>
                        )}

                        {selectedRecord.drawingNumber && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle2" color="text.secondary">Çizim No</Typography>
                            <Typography variant="body1">{selectedRecord.drawingNumber}</Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Card>

                    {/* Kök Neden ve Akcıonlar */}
                    {(selectedRecord.rootCause || selectedRecord.immediateAction || selectedRecord.preventiveAction || selectedRecord.containmentAction) && (
                      <Card variant="outlined" sx={{ mb: 3, p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
                          Kök Neden ve Akcıonlar
                        </Typography>
                        <Grid container spacing={3}>
                          {selectedRecord.rootCause && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Kök Neden</Typography>
                              <Box sx={{ bgcolor: 'error.light', p: 2, borderRadius: 1, color: 'error.contrastText' }}>
                                <Typography variant="body2">{selectedRecord.rootCause}</Typography>
                              </Box>
                            </Grid>
                          )}
                          {selectedRecord.immediateAction && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Derhal Aksiyon</Typography>
                              <Box sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 1, color: 'warning.contrastText' }}>
                                <Typography variant="body2">{selectedRecord.immediateAction}</Typography>
                              </Box>
                            </Grid>
                          )}
                          {selectedRecord.containmentAction && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Çevreleme Aksiyonu</Typography>
                              <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 1, color: 'info.contrastText' }}>
                                <Typography variant="body2">{selectedRecord.containmentAction}</Typography>
                              </Box>
                            </Grid>
                          )}
                          {selectedRecord.preventiveAction && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Önleyici Faaliyet</Typography>
                              <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 1, color: 'success.contrastText' }}>
                                <Typography variant="body2">{selectedRecord.preventiveAction}</Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Card>
                    )}

                    {/* Uygunsuzluk Detayları */}
                    {selectedRecord.nonConformityDetails && selectedRecord.nonConformityDetails.length > 0 && (
                      <Card variant="outlined" sx={{ mb: 3, p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
                          Uygunsuzluk Detayları
                        </Typography>
                        {selectedRecord.nonConformityDetails.map((nonConformity, index) => (
                          <Card key={index} variant="outlined" sx={{ mb: 2, p: 2, borderLeft: 4, borderColor: PRIORITY_COLORS[nonConformity.severity as keyof typeof PRIORITY_COLORS] }}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} sm={8}>
                                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                  {nonConformity.type}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {nonConformity.description}
                                </Typography>
                                {nonConformity.location && (
                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    Konum: {nonConformity.location}
                                  </Typography>
                                )}
                              </Grid>
                              <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                                <Chip 
                                  label={PRIORITY_LABELS[nonConformity.severity as keyof typeof PRIORITY_LABELS]} 
                                  size="small"
                                  sx={{
                                    bgcolor: PRIORITY_COLORS[nonConformity.severity as keyof typeof PRIORITY_COLORS],
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </Card>
                        ))}
                      </Card>
                    )}

                    {/* Düzeltici Faaliyetler */}
                    {selectedRecord.correctiveActions && selectedRecord.correctiveActions.length > 0 && (
                      <Card variant="outlined" sx={{ mb: 3, p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
                          Düzeltici Faaliyetler
                        </Typography>
                        {selectedRecord.correctiveActions.map((action, index) => (
                          <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" fontWeight="bold">{action.action}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Sorumlu: {action.responsible}
                                </Typography>
                                {action.notes && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Not: {action.notes}
                                  </Typography>
                                )}
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <Typography variant="caption" color="text.secondary">Hedef Tarih</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {new Date(action.targetDate).toLocaleDateString('tr-TR')}
                                </Typography>
                                {action.completionDate && (
                                  <>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                      Tamamlanma
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                      {new Date(action.completionDate).toLocaleDateString('tr-TR')}
                                    </Typography>
                                  </>
                                )}
                              </Grid>
                              <Grid item xs={12} sm={3} sx={{ textAlign: 'right' }}>
                                <Chip 
                                  label={ACTION_STATUS_LABELS[action.status as keyof typeof ACTION_STATUS_LABELS]} 
                                  size="small"
                                  color={
                                    action.status === 'TAMAMLANDI' ? 'success' : 
                                    action.status === 'GECIKTI' ? 'error' : 
                                    action.status === 'DEVAM_EDIYOR' ? 'warning' : 'default'
                                  }
                                />
                                <Box sx={{ mt: 1 }}>
                                  <Chip 
                                    label={PRIORITY_LABELS[action.priority as keyof typeof PRIORITY_LABELS]} 
                                    size="small"
                                    sx={{
                                      bgcolor: PRIORITY_COLORS[action.priority as keyof typeof PRIORITY_COLORS],
                                      color: 'white'
                                    }}
                                  />
                                </Box>
                              </Grid>
                            </Grid>
                          </Card>
                        ))}
                      </Card>
                    )}

                    {/* Notlar */}
                    {selectedRecord.notes && (
                      <Card variant="outlined" sx={{ mb: 3, p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
                          Notlar
                        </Typography>
                        <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 1, borderLeft: 4, borderColor: 'grey.400' }}>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {selectedRecord.notes}
                          </Typography>
                        </Box>
                      </Card>
                    )}

                    {/* Karar Detayları */}
                    {selectedRecord.decisionDate && (
                      <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
                          Karar Detayları
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Karar Tarihi</Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {new Date(selectedRecord.decisionDate).toLocaleDateString('tr-TR')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Karar Veren</Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {selectedRecord.decisionBy || '-'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Final Durum</Typography>
                            <Chip 
                              label={STATUS_LABELS[selectedRecord.status]} 
                              sx={{
                                bgcolor: STATUS_COLORS[selectedRecord.status],
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </Grid>
                          {selectedRecord.decisionNotes && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Karar Notları</Typography>
                              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, borderLeft: 4, borderColor: 'primary.main' }}>
                                <Typography variant="body1">
                                  {selectedRecord.decisionNotes}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Card>
                    )}
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
              <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Oluşturulma: {new Date(selectedRecord.createdDate).toLocaleString('tr-TR')} | 
                    Son Güncelleme: {new Date(selectedRecord.lastModified).toLocaleString('tr-TR')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Oluşturan: {selectedRecord.createdBy}
                  </Typography>
                </Box>
                <Box display="flex" gap={2}>
                  <Button 
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={() => {
                      showNotification('PDF çıktı özelliği yakında eklenecek!', 'info');
                    }}
                  >
                    PDF Çıktı
                  </Button>
                  <Button 
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setViewDialog(false);
                      handleEditRecord(selectedRecord);
                    }}
                  >
                    Düzenle
                  </Button>
                  <Button 
                    variant="contained"
                    onClick={() => {
                      setViewDialog(false);
                      setSelectedRecord(null);
                    }}
                  >
                    Kapat
                  </Button>
                </Box>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Parça Kodu Yönetimi Dialog */}
      <Dialog 
        open={partCodeDialog} 
        onClose={() => setPartCodeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <QrCodeIcon sx={{ mr: 1 }} />
            Parça Kodları Yönetimi
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Yeni Parça Kodu"
              value={newPartCode}
              onChange={(e) => setNewPartCode(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddPartCode();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={handleAddPartCode}
                      disabled={!newPartCode.trim()}
                    >
                      Ekle
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
            Mevcut Parça Kodları ({partCodeSuggestions.length})
          </Typography>
          
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {partCodeSuggestions.map((partCode, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 1,
                  borderBottom: 1,
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'grey.50'
                  }
                }}
              >
                <Typography variant="body2">{partCode}</Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemovePartCode(partCode)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPartCodeDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Muayene Yapan Kişiler Yönetimi Dialog */}
      <Dialog 
        open={inspectorDialog} 
        onClose={() => setInspectorDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1 }} />
            Muayene Yapan Kişiler Yönetimi
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Yeni Muayene Yapan Kişi"
              value={newInspector}
              onChange={(e) => setNewInspector(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddInspector();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={handleAddInspector}
                      disabled={!newInspector.trim()}
                    >
                      Ekle
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
            Mevcut Muayene Yapan Kişiler ({inspectorSuggestions.length})
          </Typography>
          
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {inspectorSuggestions.map((inspector, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 1,
                  borderBottom: 1,
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'grey.50'
                  }
                }}
              >
                <Typography variant="body2">{inspector}</Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveInspector(inspector)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInspectorDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Sorumlu Kişiler Yönetimi Dialog */}
      <Dialog 
        open={responsiblePersonDialog} 
        onClose={() => setResponsiblePersonDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1 }} />
            Sorumlu Kişiler Yönetimi
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>Yeni Sorumlu Kişi Ekle</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ad Soyad *"
                  value={newResponsiblePerson.name || ''}
                  onChange={(e) => setNewResponsiblePerson(prev => ({...prev, name: e.target.value}))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Birim *</InputLabel>
                  <Select
                    value={newResponsiblePerson.department || ''}
                    label="Birim *"
                    onChange={(e) => setNewResponsiblePerson(prev => ({...prev, department: e.target.value}))}
                  >
                    {DEPARTMENTS.map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Rol/Görev"
                  value={newResponsiblePerson.role || ''}
                  onChange={(e) => setNewResponsiblePerson(prev => ({...prev, role: e.target.value}))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="E-posta"
                  type="email"
                  value={newResponsiblePerson.email || ''}
                  onChange={(e) => setNewResponsiblePerson(prev => ({...prev, email: e.target.value}))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={newResponsiblePerson.phone || ''}
                  onChange={(e) => setNewResponsiblePerson(prev => ({...prev, phone: e.target.value}))}
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  onClick={handleAddResponsiblePersonToGlobal}
                  disabled={!newResponsiblePerson.name?.trim() || !newResponsiblePerson.department?.trim()}
                  startIcon={<AddIcon />}
                >
                  Sorumlu Kişi Ekle
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
            Mevcut Sorumlu Kişiler ({responsiblePersonSuggestions.length})
          </Typography>
          
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {responsiblePersonSuggestions.map((person) => (
              <Card key={person.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Ad Soyad"
                      size="small"
                      value={person.name}
                      onChange={(e) => handleUpdateResponsiblePersonInGlobal(person.id, 'name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Birim</InputLabel>
                      <Select
                        value={person.department}
                        label="Birim"
                        onChange={(e) => handleUpdateResponsiblePersonInGlobal(person.id, 'department', e.target.value)}
                      >
                        {DEPARTMENTS.map(dept => (
                          <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      label="Rol"
                      size="small"
                      value={person.role}
                      onChange={(e) => handleUpdateResponsiblePersonInGlobal(person.id, 'role', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      label="E-posta"
                      size="small"
                      type="email"
                      value={person.email}
                      onChange={(e) => handleUpdateResponsiblePersonInGlobal(person.id, 'email', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      label="Telefon"
                      size="small"
                      value={person.phone}
                      onChange={(e) => handleUpdateResponsiblePersonInGlobal(person.id, 'phone', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveResponsiblePersonFromGlobal(person.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponsiblePersonDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QuarantineManagement; 