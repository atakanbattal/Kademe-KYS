import React, { useState, useMemo, useCallback } from 'react';
import {
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tabs,
  Tab,
  Tooltip,
  Avatar,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormGroup,
  FormControlLabel,
  Checkbox,
  ListItemButton,
  Snackbar,
  ListSubheader,
  InputAdornment,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  AttachFile as AttachFileIcon,
  Approval as ApprovalIcon,
  Star as StarIcon,
  Info as InfoIcon,
  VerifiedUser as VerifiedUserIcon,
  Work as CertificateIcon,
  Person as PersonIcon,
  Verified as VerifiedIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useThemeContext } from '../context/ThemeContext';

// 🔍 BASİT VE STABİL ARAMA KUTUSU - Focus kaybı sorunu yok
const UltraStableSearchInput = React.memo<{
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
    
    // Clear previous timeout
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timeout for debounced callback
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

// Types & Interfaces
interface Document {
  id: string;
  type: DocumentType;
  name: string;
  number: string;
  unit: string;
  effectiveDate: string;
  revisionNo: number;
  owner: string;
  uploadDate: string;
  description: string;
  status: DocumentStatus;
  approvalStatus: ApprovalStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isActive: boolean;
  expiryDate?: string;
  lastViewedDate?: string;
  viewCount: number;
  isFavorite: boolean;
  approvalHistory: ApprovalRecord[];
  revisionHistory: Document[];
  keywords: string[];
  attachments: DocumentAttachment[];
  // Dinamik form alanları
  personnelName?: string;
  personnelId?: string;
  registrationNo?: string;
  welderName?: string;
  certificateNumber?: string;
  issuingAuthority?: string;
  weldingProcess?: string[];
  materialGroup?: string[];
  weldingPosition?: string[];
  trainingHours?: number;
  examResult?: string;
  criticalityLevel?: CriticalityLevel;
}

interface WelderCertificate {
  id: string;
  welderName: string;
  registrationNo: string;
  department: string;
  certificateType: CertificateType;
  certificateNumber: string;
  validityDate: string;
  expiryDate: string;
  issuingAuthority: string;
  weldingProcess: string[];
  materialGroup: string[];
  weldingPosition: string[];
  status: CertificateStatus;
  fileUrl?: string;
  fileName?: string;
  revisionHistory: WelderCertificate[];
  lastInspectionDate?: string;
  nextInspectionDate?: string;
  attachments: DocumentAttachment[];
}

interface PersonnelDocument {
  id: string;
  personnelName: string;
  personnelId: string; // Sicil numarası
  nationalId: string; // TC kimlik no
  department: string;
  position: string; // Pozisyon/görev
  documentCategory: PersonnelDocumentCategory;
  documentType: string;
  certificateNumber: string;
  issuingAuthority: string;
  issueDate: string;
  validityDate: string;
  expiryDate: string;
  trainingHours?: number;
  examResult?: string;
  criticalityLevel: CriticalityLevel;
  status: PersonnelDocumentStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadDate: string;
  lastRenewalDate?: string;
  nextRenewalDate?: string;
  renewalRequired: boolean;
  authorizedBy: string;
  notes: string;
  attachments: DocumentAttachment[];
  revisionHistory: PersonnelDocument[];
}

interface DocumentAttachment {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: string;
  uploadedBy: string;
}

interface ApprovalRecord {
  id: string;
  approverName: string;
  approverRole: string;
  action: 'approved' | 'rejected' | 'pending';
  date: string;
  comments: string;
  level: number;
}

type DocumentType = 
  | 'WPS' 
  | 'WPQR' 
  | 'Teknik Resim' 
  | 'Prosedür' 
  | 'Talimat' 
  | 'Kalite Planı'
  | 'Test Prosedürü'
  | 'Kontrol Listesi'
  | 'Spesifikasyon'
  | 'Standart'
  | 'ISO 9001 Belgesi'
  | 'ISO 14001 Belgesi'
  | 'ISO 45001 Belgesi'
  | 'TS 3834-2 Belgesi'
  | 'ISO 50001 Belgesi'
  | 'ISO 27001 Belgesi'
  | 'Kaynakçı Sertifikası'
  | 'Kaynakçı Nitelik Belgesi'
  | 'Kaynak Operatörü Belgesi'
  | 'NDT Sertifikası'
  | 'Yetki Belgesi'
  | 'İSG Sertifikası';

type DocumentStatus = 'draft' | 'review' | 'active' | 'obsolete' | 'archived';
type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_required';
type CertificateType = 
  | 'EN ISO 9606-1'
  | 'EN ISO 9606-2' 
  | 'EN ISO 14732'
  | 'WPQ'
  | 'WPQR'
  | 'ASME IX'
  | 'AWS D1.1'
  | 'EN 287-1';

type CertificateStatus = 'active' | 'expired' | 'suspended' | 'renewed';

type PersonnelDocumentCategory = 
  | 'Kaynakçı Belgeleri'
  | 'NDT Sertifikaları'
  | 'İSG Belgeleri'
  | 'Yetki Belgeleri'
  | 'Operatör Belgeleri'
  | 'Eğitim Sertifikaları'
  | 'Mesleki Yeterlilik'
  | 'Makine Operatörü'
  | 'Vinç Operatörü'
  | 'Forklift Belgesi'
  | 'İlk Yardım'
  | 'Yangın Güvenliği'
  | 'İş Güvenliği Uzmanı'
  | 'İşyeri Hekimi'
  | 'Radyoloji'
  | 'Ultrasonik Test'
  | 'Penetrant Test'
  | 'Manyetik Parçacık'
  | 'Görsel Muayene';

type PersonnelDocumentStatus = 'active' | 'expired' | 'suspended' | 'pending_renewal' | 'cancelled';

type CriticalityLevel = 'Kritik' | 'Yüksek' | 'Orta' | 'Düşük';

// Kalite belgeleri için interface'ler
interface QualityCertificate {
  id: string;
  name: string;
  type: string;
  expiry: string;
  status: 'active' | 'expired' | 'expiring';
  authority: string;
}

interface ProductCertificate {
  id: string;
  name: string;
  type: string;
  expiry: string;
  status: 'active' | 'expired' | 'expiring';
  authority: string;
}

interface FilterState {
  searchTerm: string;
  type: string;
  unit: string;
  status: string;
  approvalStatus: string;
  dateRange: {
    start: string;
    end: string;
  };
  showFavoritesOnly: boolean;
  showExpiring: boolean;
}

interface WelderFilterState {
  searchTerm: string;
  certificateType: string;
  department: string;
  status: string;
  expiringWithin: number; // days
}

interface PersonnelDocumentFilterState {
  searchTerm: string;
  documentCategory: string; // Kaynakçı, NDT, İSG, Yetki, etc.
  certificateType: string;
  department: string;
  status: string;
  issuingAuthority: string;
  expiringWithin: number; // days
  validityDateRange: {
    start: string;
    end: string;
  };
  criticalityLevel: string;
  renewalRequired: boolean;
}

// Personel seçimi için interface
interface PersonnelOption {
  id: string;
  name: string;
  registrationNo: string;
  department: string;
  position: string;
  nationalId: string;
}

// Kaynakçı seçimi için interface
interface WelderOption {
  id: string;
  welderName: string;
  registrationNo: string;
  department: string;
  certificateType: CertificateType;
  certificateNumber: string;
  status: CertificateStatus;
}

// Constants
const DOCUMENT_TYPES: DocumentType[] = [
  // Kaynak Dokümanları
  'WPS', 
  'WPQR', 
  
  // Teknik Dokümanlar
  'Kontrol Listesi',
  'Prosedür', 
  'Spesifikasyon',
  'Standart',
  'Talimat',
  'Teknik Resim', 
  'Test Prosedürü',
  
  // Kalite Yönetim Dokümanları
  'Kalite Planı',
  
  // ISO Kalite Belgeleri
  'ISO 9001 Belgesi',
  'ISO 14001 Belgesi',
  'ISO 27001 Belgesi',
  'ISO 45001 Belgesi',
  'ISO 50001 Belgesi',
  'TS 3834-2 Belgesi',
  
  // Personel Belgeleri
  'İSG Sertifikası',
  'Kaynakçı Nitelik Belgesi',
  'Kaynakçı Sertifikası',
  'Kaynak Operatörü Belgesi',
  'NDT Sertifikası',
  'Yetki Belgesi'
];

const UNITS = [
  'Kaynak Atölyesi', 'Boyahane', 'Montaj Hattı', 'Kalite Kontrol',
  'Elektrik', 'Han', 'Büküm', 'Arge', 'Satın Alma', 'Kesim', 'Ambar/Depo'
];

const CERTIFICATE_TYPES: CertificateType[] = [
  'EN ISO 9606-1', 'EN ISO 9606-2', 'EN ISO 14732', 
  'WPQ', 'WPQR', 'ASME IX', 'AWS D1.1', 'EN 287-1'
];

const DEPARTMENTS = [
  'Kaynak Atölyesi', 'Boyahane', 'Montaj', 'Kalite Kontrol',
  'Elektrik', 'Han', 'Büküm', 'Kesim'
];

const PERSONNEL_DOCUMENT_CATEGORIES = [
  'Kaynakçı Belgeleri',
  'NDT Sertifikaları', 
  'İSG Belgeleri',
  'Yetki Belgeleri',
  'Operatör Belgeleri',
  'Eğitim Sertifikaları',
  'Mesleki Yeterlilik',
  'Makine Operatörü',
  'Vinç Operatörü',
  'Forklift Belgesi',
  'İlk Yardım',
  'Yangın Güvenliği',
  'İş Güvenliği Uzmanı',
  'İşyeri Hekimi',
  'Radyoloji',
  'Ultrasonik Test',
  'Penetrant Test',
  'Manyetik Parçacık',
  'Görsel Muayene'
];

const PERSONNEL_DOCUMENT_TYPES = {
  'Kaynakçı Belgeleri': [
    'EN ISO 9606-1 (Çelik Kaynak)',
    'EN ISO 9606-2 (Alüminyum Kaynak)',
    'EN ISO 14732 (TIG Kaynak)',
    'ASME IX (Amerikan Standard)',
    'AWS D1.1 (Yapı Kaynağı)',
    'EN 287-1 (Kaynakçı Yeterlilik)',
    'Kaynakçı Nitelik Belgesi',
    'Kaynak Operatörü Belgesi'
  ],
  'NDT Sertifikaları': [
    'Level 1 - Görsel Muayene (VT)',
    'Level 2 - Görsel Muayene (VT)',
    'Level 3 - Görsel Muayene (VT)',
    'Level 1 - Penetrant Test (PT)',
    'Level 2 - Penetrant Test (PT)',
    'Level 3 - Penetrant Test (PT)',
    'Level 1 - Manyetik Parçacık (MT)',
    'Level 2 - Manyetik Parçacık (MT)',
    'Level 3 - Manyetik Parçacık (MT)',
    'Level 1 - Ultrasonik Test (UT)',
    'Level 2 - Ultrasonik Test (UT)',
    'Level 3 - Ultrasonik Test (UT)',
    'Level 1 - Radyografi (RT)',
    'Level 2 - Radyografi (RT)',
    'Level 3 - Radyografi (RT)'
  ],
  'İSG Belgeleri': [
    'İSG Uzmanı Belgesi',
    'İşyeri Hekimi Belgesi',
    'İş Güvenliği Sertifikası',
    'İlk Yardım Sertifikası',
    'Yangın Güvenliği Sertifikası',
    'Yüksekte Çalışma Belgesi',
    'Kapalı Alan Çalışma Belgesi',
    'Sıcak Çalışma İzni'
  ],
  'Yetki Belgeleri': [
    'Forklift Operatörü Belgesi',
    'Vinç Operatörü Belgesi',
    'İş Makinesi Operatör Belgesi',
    'Elektrik Panosu Çalışma İzni',
    'Basınçlı Kap Operatörü',
    'Kimyasal Madde Çalışma İzni',
    'Radyasyon Güvenliği Belgesi'
  ],
  'Operatör Belgeleri': [
    'CNC Operatörü Sertifikası',
    'Kaynak Makinesi Operatörü',
    'Plazma Kesim Operatörü',
    'Lazer Kesim Operatörü',
    'Büküm Makinesi Operatörü',
    'Pres Operatörü Belgesi',
    'Kalite Kontrol Operatörü'
  ],
  'Eğitim Sertifikaları': [
    'Mesleki Yeterlilik Belgesi',
    'Teknik Eğitim Sertifikası',
    'Kalite Yönetimi Eğitimi',
    'Çevre Yönetimi Eğitimi',
    'Enerji Yönetimi Eğitimi',
    'Bilgi Güvenliği Eğitimi',
    '5S Eğitimi',
    'Lean Manufacturing Eğitimi'
  ]
};

const ISSUING_AUTHORITIES = [
  'TSE (Türk Standartları Enstitüsü)',
  'TÜV NORD',
  'TÜV SÜD', 
  'Bureau Veritas',
  'SGS',
  'İSG Uzmanı',
  'Çalışma Bakanlığı',
  'TMMO (Türk Metalurji Mühendisleri Odası)',
  'İMO (İnşaat Mühendisleri Odası)',
  'Firmaya Özel Eğitim'
];

const CRITICALITY_LEVELS = [
  'Kritik',
  'Yüksek',
  'Orta', 
  'Düşük'
];

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
})) as any;

const StatusChip = styled(Chip)<{ statustype: string }>(({ statustype }) => {
  const getColors = () => {
    switch (statustype) {
      case 'active':
        return { bg: '#4caf50', color: '#fff' };
      case 'pending':
        return { bg: '#ff9800', color: '#fff' };
      case 'expired':
      case 'rejected':
        return { bg: '#f44336', color: '#fff' };
      case 'draft':
        return { bg: '#2196f3', color: '#fff' };
      default:
        return { bg: '#9e9e9e', color: '#fff' };
    }
  };
  
  const colors = getColors();
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 600,
    '& .MuiChip-icon': {
      color: colors.color,
    }
  };
}) as any;

const DocumentCard = styled(Card)(() => ({
  height: '100%',
  background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative' as const,
  overflow: 'hidden' as const,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
    borderColor: '#1976d2',
  },
  '&::before': {
    content: '""',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #1976d2, #9c27b0)',
  },
})) as any;

const DocumentManagement: React.FC = () => {
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
  const [expanded, setExpanded] = useState<string | false>('document-filters');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [activeStep, setActiveStep] = useState(0);
  const [userRole] = useState<'admin' | 'manager' | 'user'>('admin');
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedDocumentForView, setSelectedDocumentForView] = useState<Document | null>(null);
  const [selectedCertificateForView, setSelectedCertificateForView] = useState<WelderCertificate | null>(null);
  const [selectedPersonnelDocumentForView, setSelectedPersonnelDocumentForView] = useState<PersonnelDocument | null>(null);
  const [editPersonnelDialog, setEditPersonnelDialog] = useState(false);
  const [selectedPersonnelDocumentForEdit, setSelectedPersonnelDocumentForEdit] = useState<PersonnelDocument | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [welderCertificates, setWelderCertificates] = useState<WelderCertificate[]>([]);
  
  // Personel seçimi için veri
  const [personnelOptions, setPersonnelOptions] = useState<PersonnelOption[]>([
    { id: 'P001', name: 'Ahmet Yılmaz', registrationNo: '001', department: 'Kaynak Atölyesi', position: 'Kaynakçı', nationalId: '12345678901' },
    { id: 'P002', name: 'Mehmet Kaya', registrationNo: '002', department: 'Kaynak Atölyesi', position: 'Kaynakçı', nationalId: '12345678902' },
    { id: 'P003', name: 'Ali Demir', registrationNo: '003', department: 'Kaynak Atölyesi', position: 'Kaynakçı', nationalId: '12345678903' },
    { id: 'P004', name: 'Fatma Ak', registrationNo: '004', department: 'Kalite Kontrol', position: 'NDT Uzmanı', nationalId: '12345678904' },
    { id: 'P005', name: 'Ayşe Özkan', registrationNo: '005', department: 'Kalite Kontrol', position: 'Kalite Teknisyeni', nationalId: '12345678905' },
    { id: 'P006', name: 'Osman Şen', registrationNo: '006', department: 'Üretim', position: 'Operatör', nationalId: '12345678906' },
    { id: 'P007', name: 'Zeynep Çelik', registrationNo: '007', department: 'İSG', position: 'İş Güvenliği Uzmanı', nationalId: '12345678907' },
    { id: 'P008', name: 'Hasan Güven', registrationNo: '008', department: 'Montaj', position: 'Montaj Teknisyeni', nationalId: '12345678908' },
  ]);
  
  // Kaynakçı seçimi için veri
  const [welderOptions, setWelderOptions] = useState<WelderOption[]>([
    { id: 'W001', welderName: 'Ahmet Yılmaz', registrationNo: '001', department: 'Kaynak Atölyesi', certificateType: 'EN ISO 9606-1', certificateNumber: 'W001-2024', status: 'active' },
    { id: 'W002', welderName: 'Mehmet Kaya', registrationNo: '002', department: 'Kaynak Atölyesi', certificateType: 'EN ISO 9606-2', certificateNumber: 'W002-2024', status: 'active' },
    { id: 'W003', welderName: 'Ali Demir', registrationNo: '003', department: 'Kaynak Atölyesi', certificateType: 'EN ISO 14732', certificateNumber: 'W003-2024', status: 'active' },
    { id: 'W004', welderName: 'Mustafa Öz', registrationNo: '004', department: 'Kaynak Atölyesi', certificateType: 'ASME IX', certificateNumber: 'W004-2024', status: 'active' },
    { id: 'W005', welderName: 'Emre Baz', registrationNo: '005', department: 'Kaynak Atölyesi', certificateType: 'AWS D1.1', certificateNumber: 'W005-2024', status: 'active' },
  ]);
  const [personnelDocuments, setPersonnelDocuments] = useState<PersonnelDocument[]>([]);
  const [qualityCertificates, setQualityCertificates] = useState<QualityCertificate[]>([]);
  const [productCertificates, setProductCertificates] = useState<ProductCertificate[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    type: '',
    unit: '',
    status: '',
    approvalStatus: '',
    dateRange: { start: '', end: '' },
    showFavoritesOnly: false,
    showExpiring: false,
  });
  const [welderFilters, setWelderFilters] = useState<WelderFilterState>({
    searchTerm: '',
    certificateType: '',
    department: '',
    status: '',
    expiringWithin: 60,
  });
  const [personnelFilters, setPersonnelFilters] = useState<PersonnelDocumentFilterState>({
    searchTerm: '',
    documentCategory: '',
    certificateType: '',
    department: '',
    status: '',
    issuingAuthority: '',
    expiringWithin: 30,
    validityDateRange: { start: '', end: '' },
    criticalityLevel: '',
    renewalRequired: false,
  });
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedWelder, setSelectedWelder] = useState<WelderCertificate | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [welderPage, setWelderPage] = useState(0);
  const [welderRowsPerPage, setWelderRowsPerPage] = useState(10);
  const [expandedApprovalPanel, setExpandedApprovalPanel] = useState<string | false>('pending');
  const [openApproverDialog, setOpenApproverDialog] = useState(false);
  
  // Get colors function
  const getColors = () => ({
    primary: { main: '#1976d2', light: '#42a5f5' },
    success: { main: '#2e7d32', light: '#4caf50' },
    warning: { main: '#ed6c02', light: '#ff9800' },
    error: { main: '#d32f2f', light: '#f44336' }
  });

  const colors = getColors();

  // Certificate data arrays
  const weldingCertificates = [
    { name: 'TS 3834-2:2019', type: 'Kaynak Kalite Yönetimi', expiry: '2025-12-31', status: 'active', authority: 'TSE' },
    { name: 'EN 1090-1:2009+A1', type: 'Çelik Yapı Uygunluk', expiry: '2025-09-15', status: 'active', authority: 'TÜV NORD' },
    { name: 'EN ISO 3834-2:2021', type: 'Kaynak Kalite Gereklilikleri', expiry: '2024-10-20', status: 'expiring', authority: 'Bureau Veritas' },
  ];

  // Initialize sample documents with approval data - ONLY ON FIRST LOAD
  React.useEffect(() => {
    const isInitialized = localStorage.getItem('documentManagement_initialized');
    if (!isInitialized && documents.length === 0) {
      const sampleDocuments: Document[] = [
        {
          id: '1',
          type: 'WPS',
          name: 'WPS-001 Çelik Kaynak Prosedürü',
          number: 'WPS-001',
          unit: 'Kaynak Atölyesi',
          effectiveDate: '2024-01-15',
          revisionNo: 1,
          owner: 'Mehmet Kaya',
          uploadDate: '2024-01-10',
          description: 'S355 çelik için MAG kaynak prosedürü',
          status: 'active',
          approvalStatus: 'pending',
          isActive: true,
          viewCount: 5,
          isFavorite: false,
          keywords: ['çelik', 'kaynak', 'MAG'],
          approvalHistory: [],
          revisionHistory: [],
          attachments: []
        },
        {
          id: '2',
          type: 'ISO 9001 Belgesi',
          name: 'ISO 9001:2015 Kalite Yönetim Sistemi',
          number: 'ISO-9001-2024',
          unit: 'Kalite Kontrol',
          effectiveDate: '2024-02-01',
          revisionNo: 3,
          owner: 'Ayşe Demir',
          uploadDate: '2024-01-25',
          description: 'Kalite yönetim sistemi standart belgesi',
          status: 'active',
          approvalStatus: 'approved',
          isActive: true,
          viewCount: 12,
          isFavorite: true,
          keywords: ['ISO', 'kalite', 'yönetim'],
          approvalHistory: [
            {
              id: '1',
              approverName: 'Fatma Öz',
              approverRole: 'Genel Müdür',
              action: 'approved',
              date: '2024-01-30T10:30:00Z',
              comments: 'Kalite sistemi güncellemeleri uygun.',
              level: 2
            }
          ],
          revisionHistory: [],
          attachments: []
        },
        {
          id: '3',
          type: 'Prosedür',
          name: 'PR-005 Malzeme Kontrol Prosedürü',
          number: 'PR-005',
          unit: 'Kalite Kontrol',
          effectiveDate: '2024-03-01',
          revisionNo: 2,
          owner: 'Ali Vural',
          uploadDate: '2024-02-20',
          description: 'Gelen malzeme kontrol ve muayene prosedürü',
          status: 'review',
          approvalStatus: 'rejected',
          isActive: false,
          viewCount: 8,
          isFavorite: false,
          keywords: ['malzeme', 'kontrol', 'muayene'],
          approvalHistory: [
            {
              id: '2',
              approverName: 'Ayşe Demir',
              approverRole: 'Kalite Müdürü',
              action: 'rejected',
              date: '2024-02-25T14:15:00Z',
              comments: 'Kontrol adımları eksik, revizyon gerekli.',
              level: 1
            }
          ],
          revisionHistory: [],
          attachments: []
        },
        {
          id: '4',
          type: 'WPQR',
          name: 'WPQR-001 Kaynak Kalite Kaydı',
          number: 'WPQR-001',
          unit: 'Kaynak Atölyesi',
          effectiveDate: '2024-01-20',
          revisionNo: 1,
          owner: 'Mustafa Tan',
          uploadDate: '2024-01-18',
          description: 'WPS-001 için kaynak kalite test kaydı',
          status: 'active',
          approvalStatus: 'revision_required',
          isActive: true,
          viewCount: 3,
          isFavorite: false,
          keywords: ['WPQR', 'test', 'kalite'],
          approvalHistory: [
            {
              id: '3',
              approverName: 'Mehmet Kaya',
              approverRole: 'Kaynak Mühendisi',
              action: 'pending',
              date: '2024-01-19T09:00:00Z',
              comments: 'Test sonuçları gözden geçiriliyor.',
              level: 1
            }
          ],
          revisionHistory: [],
          attachments: []
        },
        {
          id: '5',
          type: 'Teknik Resim',
          name: 'TR-100 Tank Kapak Detayı',
          number: 'TR-100',
          unit: 'Tasarım',
          effectiveDate: '2024-03-15',
          revisionNo: 1,
          owner: 'Zeynep Ak',
          uploadDate: '2024-03-10',
          description: 'Basınçlı tank kapak imalat resmi',
          status: 'draft',
          approvalStatus: 'pending',
          isActive: false,
          viewCount: 2,
          isFavorite: false,
          keywords: ['teknik', 'resim', 'tank'],
          approvalHistory: [],
          revisionHistory: [],
          attachments: []
        }
      ];
      setDocuments(sampleDocuments);
      localStorage.setItem('documentManagement_initialized', 'true');
    }
  }, []);

  // Initialize sample personnel documents - ONLY ON FIRST LOAD
  React.useEffect(() => {
    const isPersonnelInitialized = localStorage.getItem('documentManagement_personnel_initialized');
    if (!isPersonnelInitialized && personnelDocuments.length === 0) {
      const sampleDocuments: PersonnelDocument[] = [
        {
          id: '1',
          personnelName: 'Ahmet Yılmaz',
          personnelId: 'KDM-001',
          nationalId: '12345678901',
          department: 'Kaynak Atölyesi',
          position: 'Usta Kaynakçı',
          documentCategory: 'Kaynakçı Belgeleri',
          documentType: 'EN ISO 9606-1 (Çelik Kaynak)',
          certificateNumber: 'KYN-2024-001',
          issuingAuthority: 'TSE (Türk Standartları Enstitüsü)',
          issueDate: '2024-01-15',
          validityDate: '2024-01-15',
          expiryDate: '2027-01-15',
          trainingHours: 80,
          examResult: 'Başarılı - 85 puan',
          criticalityLevel: 'Kritik',
          status: 'active',
          uploadDate: '2024-01-20',
          renewalRequired: false,
          authorizedBy: 'Kalite Müdürü',
          notes: 'Tüm pozisyonlarda kaynak yapma yetkisi',
          attachments: [],
          revisionHistory: []
        },
        {
          id: '2',
          personnelName: 'Mehmet Kaya',
          personnelId: 'KDM-002',
          nationalId: '98765432109',
          department: 'Kalite Kontrol',
          position: 'NDT Uzmanı',
          documentCategory: 'NDT Sertifikaları',
          documentType: 'Level 2 - Ultrasonik Test (UT)',
          certificateNumber: 'UT-L2-2024-005',
          issuingAuthority: 'TÜV NORD',
          issueDate: '2024-03-10',
          validityDate: '2024-03-10',
          expiryDate: '2026-03-10',
          trainingHours: 120,
          examResult: 'Başarılı - 92 puan',
          criticalityLevel: 'Yüksek',
          status: 'active',
          uploadDate: '2024-03-15',
          renewalRequired: false,
          authorizedBy: 'Teknik Müdür',
          notes: 'Kaynak dikişi ve döküm parça muayenesi yetkili',
          attachments: [],
          revisionHistory: []
        },
        {
          id: '3',
          personnelName: 'Fatma Demir',
          personnelId: 'KDM-003',
          nationalId: '11111111111',
          department: 'Montaj',
          position: 'İş Güvenliği Uzmanı',
          documentCategory: 'İSG Belgeleri',
          documentType: 'İSG Uzmanı Belgesi',
          certificateNumber: 'ISG-UZ-2024-012',
          issuingAuthority: 'Çalışma Bakanlığı',
          issueDate: '2024-02-20',
          validityDate: '2024-02-20',
          expiryDate: '2025-02-20',
          trainingHours: 180,
          examResult: 'Başarılı - 88 puan',
          criticalityLevel: 'Kritik',
          status: 'active',
          uploadDate: '2024-02-25',
          renewalRequired: true,
          authorizedBy: 'İnsan Kaynakları Müdürü',
          notes: 'Tüm departmanlar için İSG denetim yetkisi',
          attachments: [],
          revisionHistory: []
        },
        {
          id: '4',
          personnelName: 'Ali Çelik',
          personnelId: 'KDM-004',
          nationalId: '22222222222',
          department: 'Elektrik',
          position: 'Forklift Operatörü',
          documentCategory: 'Yetki Belgeleri',
          documentType: 'Forklift Operatörü Belgesi',
          certificateNumber: 'FLF-2023-089',
          issuingAuthority: 'İMO (İnşaat Mühendisleri Odası)',
          issueDate: '2023-06-15',
          validityDate: '2023-06-15',
          expiryDate: '2025-06-15',
          trainingHours: 40,
          examResult: 'Başarılı - 78 puan',
          criticalityLevel: 'Orta',
          status: 'active',
          uploadDate: '2023-06-20',
          renewalRequired: false,
          authorizedBy: 'Lojistik Şefi',
          notes: '5 ton kapasiteye kadar forklift kullanma yetkisi',
          attachments: [],
          revisionHistory: []
        },
        {
          id: '5',
          personnelName: 'Ayşe Özkan',
          personnelId: 'KDM-005',
          nationalId: '33333333333',
          department: 'Boyahane',
          position: 'İlk Yardım Sorumlusu',
          documentCategory: 'İSG Belgeleri',
          documentType: 'İlk Yardım Sertifikası',
          certificateNumber: 'IY-2024-067',
          issuingAuthority: 'Kızılay Eğitim Merkezi',
          issueDate: '2024-01-10',
          validityDate: '2024-01-10',
          expiryDate: '2025-01-10',
          trainingHours: 24,
          examResult: 'Başarılı - 95 puan',
          criticalityLevel: 'Yüksek',
          status: 'active',
          uploadDate: '2024-01-15',
          renewalRequired: true,
          authorizedBy: 'İSG Uzmanı',
          notes: 'Acil durumlarda ilk müdahale yetkisi',
          attachments: [],
          revisionHistory: []
        }
      ];
      setPersonnelDocuments(sampleDocuments);
      localStorage.setItem('documentManagement_personnel_initialized', 'true');
    }
  }, []);

  // Initialize product certificates - ONLY ON FIRST LOAD
  React.useEffect(() => {
    const isProductCertInitialized = localStorage.getItem('documentManagement_productCert_initialized');
    if (!isProductCertInitialized && productCertificates.length === 0) {
      const sampleProductCertificates: ProductCertificate[] = [
        { id: '1', name: 'CE İşaretleme', type: 'Ürün Uygunluk Belgesi', expiry: '2025-07-30', status: 'active', authority: 'Notified Body' },
        { id: '2', name: 'TSE Belgesi', type: 'Türk Standartları Belgesi', expiry: '2025-05-15', status: 'active', authority: 'TSE' },
        { id: '3', name: 'GOST-R Belgesi', type: 'Rus Federasyonu Belgesi', expiry: '2023-11-10', status: 'expired', authority: 'GOST-R' },
        { id: '4', name: 'PED Direktifi', type: 'Basınçlı Ekipman Direktifi', expiry: '2026-01-20', status: 'active', authority: 'TÜV SÜD' },
      ];
      setProductCertificates(sampleProductCertificates);
      localStorage.setItem('documentManagement_productCert_initialized', 'true');
    }
  }, []);

  // Initialize quality certificates - ONLY ON FIRST LOAD  
  React.useEffect(() => {
    const isQualityCertInitialized = localStorage.getItem('documentManagement_qualityCert_initialized');
    if (!isQualityCertInitialized && qualityCertificates.length === 0) {
      const sampleQualityCertificates: QualityCertificate[] = [
        { id: '1', name: 'ISO 9001:2015', type: 'Kalite Yönetim Sistemi', expiry: '2025-06-15', status: 'active', authority: 'TÜV NORD' },
        { id: '2', name: 'ISO 14001:2015', type: 'Çevre Yönetim Sistemi', expiry: '2025-08-20', status: 'active', authority: 'Bureau Veritas' },
        { id: '3', name: 'ISO 45001:2018', type: 'İSG Yönetim Sistemi', expiry: '2024-12-10', status: 'expiring', authority: 'SGS' },
        { id: '4', name: 'ISO 50001:2018', type: 'Enerji Yönetim Sistemi', expiry: '2026-03-15', status: 'active', authority: 'TÜV SÜD' },
        { id: '5', name: 'ISO 27001:2013', type: 'Bilgi Güvenliği Yönetimi', expiry: '2024-11-30', status: 'expiring', authority: 'BSI' }
      ];
      setQualityCertificates(sampleQualityCertificates);
      localStorage.setItem('documentManagement_qualityCert_initialized', 'true');
    }
  }, []);

  // Updated certificate statistics with dynamic data
  const certificateStats = {
    total: qualityCertificates.length,
    active: qualityCertificates.filter(c => c.status === 'active').length,
    expiring: qualityCertificates.filter(c => c.status === 'expiring').length,
    expired: qualityCertificates.filter(c => c.status === 'expired').length,
    certificatesWithStatus: qualityCertificates
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleApprovalAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedApprovalPanel(isExpanded ? panel : false);
  };

  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleWelderFilterChange = (field: keyof WelderFilterState, value: any) => {
    setWelderFilters(prev => ({ ...prev, [field]: value }));
  };

  const handlePersonnelFilterChange = (field: keyof PersonnelDocumentFilterState, value: any) => {
    setPersonnelFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApproveDocument = (documentId: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              approvalStatus: 'approved' as ApprovalStatus,
              approvalHistory: [
                ...doc.approvalHistory,
                {
                  id: Date.now().toString(),
                  approverName: 'Mevcut Kullanıcı', // Bu gerçek uygulamada auth context'ten gelecek
                  approverRole: 'Kalite Müdürü',
                  action: 'approved' as const,
                  date: new Date().toISOString(),
                  comments: 'Doküman incelendi ve onaylandı.',
                  level: 1
                }
              ]
            }
          : doc
      )
    );
    setSnackbar({ 
      open: true, 
      message: 'Doküman başarıyla onaylandı.', 
      severity: 'success' 
    });
  };

  const handleRejectDocument = (documentId: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              approvalStatus: 'rejected' as ApprovalStatus,
              approvalHistory: [
                ...doc.approvalHistory,
                {
                  id: Date.now().toString(),
                  approverName: 'Mevcut Kullanıcı', // Bu gerçek uygulamada auth context'ten gelecek
                  approverRole: 'Kalite Müdürü',
                  action: 'rejected' as const,
                  date: new Date().toISOString(),
                  comments: 'Doküman revizyon gerektiriyor.',
                  level: 1
                }
              ]
            }
          : doc
      )
    );
    setSnackbar({ 
      open: true, 
      message: 'Doküman reddedildi.', 
      severity: 'warning' 
    });
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (filters.searchTerm && !doc.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !doc.number.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      if (filters.type && doc.type !== filters.type) return false;
      if (filters.unit && doc.unit !== filters.unit) return false;
      if (filters.status && doc.status !== filters.status) return false;
      if (filters.approvalStatus && doc.approvalStatus !== filters.approvalStatus) return false;
      if (filters.showFavoritesOnly && !doc.isFavorite) return false;
      if (filters.showExpiring) {
        const today = new Date();
        const expiryDate = doc.expiryDate ? new Date(doc.expiryDate) : null;
        if (!expiryDate || (expiryDate.getTime() - today.getTime()) > (30 * 24 * 60 * 60 * 1000)) return false;
      }
      return true;
    });
  }, [documents, filters]);

  // Filtered welder certificates
  const filteredWelderCertificates = useMemo(() => {
    return welderCertificates.filter(cert => {
      if (welderFilters.searchTerm && 
          !cert.welderName.toLowerCase().includes(welderFilters.searchTerm.toLowerCase()) &&
          !cert.registrationNo.toLowerCase().includes(welderFilters.searchTerm.toLowerCase())) return false;
      if (welderFilters.certificateType && cert.certificateType !== welderFilters.certificateType) return false;
      if (welderFilters.department && cert.department !== welderFilters.department) return false;
      if (welderFilters.status && cert.status !== welderFilters.status) return false;
      if (welderFilters.expiringWithin > 0) {
        const today = new Date();
        const expiryDate = new Date(cert.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
        if (daysUntilExpiry > welderFilters.expiringWithin) return false;
      }
      return true;
    });
  }, [welderCertificates, welderFilters]);

  // Filtered personnel documents
  const filteredPersonnelDocuments = useMemo(() => {
    return personnelDocuments.filter(doc => {
      if (personnelFilters.searchTerm && 
          !doc.personnelName.toLowerCase().includes(personnelFilters.searchTerm.toLowerCase()) &&
          !doc.personnelId.toLowerCase().includes(personnelFilters.searchTerm.toLowerCase()) &&
          !doc.nationalId.includes(personnelFilters.searchTerm)) return false;
      if (personnelFilters.documentCategory && doc.documentCategory !== personnelFilters.documentCategory) return false;
      if (personnelFilters.certificateType && doc.documentType !== personnelFilters.certificateType) return false;
      if (personnelFilters.department && doc.department !== personnelFilters.department) return false;
      if (personnelFilters.status && doc.status !== personnelFilters.status) return false;
      if (personnelFilters.issuingAuthority && doc.issuingAuthority !== personnelFilters.issuingAuthority) return false;
      if (personnelFilters.criticalityLevel && doc.criticalityLevel !== personnelFilters.criticalityLevel) return false;
      if (personnelFilters.renewalRequired && !doc.renewalRequired) return false;
      if (personnelFilters.expiringWithin > 0) {
        const today = new Date();
        const expiryDate = new Date(doc.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
        if (daysUntilExpiry > personnelFilters.expiringWithin) return false;
      }
      return true;
    });
  }, [personnelDocuments, personnelFilters]);

  // Statistics
  const documentStats = useMemo(() => {
    const total = documents.length;
    const active = documents.filter(d => d.status === 'active').length;
    const pending = documents.filter(d => d.approvalStatus === 'pending').length;
    const expiring = documents.filter(d => {
      if (!d.expiryDate) return false;
      const today = new Date();
      const expiry = new Date(d.expiryDate);
      return (expiry.getTime() - today.getTime()) <= (30 * 24 * 60 * 60 * 1000) && expiry.getTime() > today.getTime();
    }).length;
    
    return { total, active, pending, expiring };
  }, [documents]);

  const welderStats = useMemo(() => {
    const total = welderCertificates.length;
    const active = welderCertificates.filter(w => w.status === 'active').length;
    const expiring = welderCertificates.filter(w => {
      const today = new Date();
      const expiry = new Date(w.expiryDate);
      return (expiry.getTime() - today.getTime()) <= (30 * 24 * 60 * 60 * 1000) && expiry.getTime() > today.getTime();
    }).length;
    const expired = welderCertificates.filter(w => {
      const today = new Date();
      const expiry = new Date(w.expiryDate);
      return expiry.getTime() <= today.getTime();
    }).length;
    
    return { total, active, expiring, expired };
  }, [welderCertificates]);

  const personnelStats = useMemo(() => {
    const total = personnelDocuments.length;
    const active = personnelDocuments.filter(p => p.status === 'active').length;
    const expiring = personnelDocuments.filter(p => {
      const today = new Date();
      const expiry = new Date(p.expiryDate);
      return (expiry.getTime() - today.getTime()) <= (30 * 24 * 60 * 60 * 1000) && expiry.getTime() > today.getTime();
    }).length;
    const expired = personnelDocuments.filter(p => {
      const today = new Date();
      const expiry = new Date(p.expiryDate);
      return expiry.getTime() <= today.getTime();
    }).length;
    const renewalRequired = personnelDocuments.filter(p => p.renewalRequired).length;
    const critical = personnelDocuments.filter(p => p.criticalityLevel === 'Kritik').length;
    
    return { total, active, expiring, expired, renewalRequired, critical };
  }, [personnelDocuments]);

  const openCreateDialog = (type: 'document' | 'welder' | 'personnel') => {
    // Form verilerini temizle ve yeni doküman için hazırla
    setDocumentForm({
      id: undefined,
      type: 'WPS',
      name: '',
      number: '',
      unit: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      revisionNo: 1,
      owner: '',
      description: '',
      status: 'draft',
      approvalStatus: 'pending',
      keywords: [],
      // Dinamik alanları da temizle
      personnelName: undefined,
      personnelId: undefined,
      registrationNo: undefined,
      welderName: undefined,
      certificateNumber: undefined,
      issuingAuthority: undefined,
      weldingProcess: undefined,
      materialGroup: undefined,
      weldingPosition: undefined,
      trainingHours: undefined,
      examResult: undefined,
      criticalityLevel: undefined
    });
    
    setSelectedDocument(null);
    setActiveStep(0);
    setDialogMode('create');
    setOpenDialog(true);
    console.log('Opening create dialog for:', type);
  };

  // Document action handlers
  const handleViewDocument = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      setSelectedDocument(doc);
      setViewDialog(true);
      console.log('Viewing document:', doc.name);
    }
  };

  const handleDownloadDocument = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc && doc.fileUrl) {
      console.log('Downloading document:', doc.name);
      // Simulate download by creating a blob and download link
      const downloadContent = `Doküman: ${doc.name}\nNumara: ${doc.number}\nTip: ${doc.type}\nBirim: ${doc.unit}\nRevizyon: ${doc.revisionNo}\nSahip: ${doc.owner}\nAçıklama: ${doc.description}`;
      const blob = new Blob([downloadContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.number}-${doc.name}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: `"${doc.name}" başarıyla indirildi!`, severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Dosya bulunamadı!', severity: 'error' });
    }
  };

  const handleEditDocument = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      // Seçilen dokümanı set et
      setSelectedDocument({
        ...doc,
        effectiveDate: doc.effectiveDate,
        keywords: doc.keywords || []
      });
      
      // Form verilerini seçilen dokümanın bilgileriyle doldur
      setDocumentForm({
        id: doc.id,
        type: doc.type,
        name: doc.name,
        number: doc.number,
        unit: doc.unit,
        effectiveDate: doc.effectiveDate,
        revisionNo: doc.revisionNo,
        owner: doc.owner,
        description: doc.description,
        status: doc.status,
        approvalStatus: doc.approvalStatus,
        expiryDate: doc.expiryDate,
        keywords: doc.keywords || [],
        attachments: doc.attachments || [],
        // Dinamik alanları da doldur
        personnelName: doc.personnelName,
        personnelId: doc.personnelId,
        registrationNo: doc.registrationNo,
        welderName: doc.welderName,
        certificateNumber: doc.certificateNumber,
        issuingAuthority: doc.issuingAuthority,
        weldingProcess: doc.weldingProcess,
        materialGroup: doc.materialGroup,
        weldingPosition: doc.weldingPosition,
        trainingHours: doc.trainingHours,
        examResult: doc.examResult,
        criticalityLevel: doc.criticalityLevel
      });
      
      setDialogMode('edit');
      setOpenDialog(true);
      setSnackbar({ open: true, message: `"${doc.name}" düzenleme modunda açıldı`, severity: 'info' });
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      // Doküman silme onayı kaldırıldı - sessiz silme
    const confirmation = true;
      if (confirmation) {
        console.log('Deleting document:', documentId);
        // Actually remove the document from state
        setDocuments(prevDocs => prevDocs.filter(d => d.id !== documentId));
        setSnackbar({ open: true, message: `"${doc.name}" başarıyla silindi!`, severity: 'success' });
      }
    }
  };

  const handleToggleFavorite = (documentId: string) => {
    setDocuments(prevDocs => 
      prevDocs.map(doc => {
        if (doc.id === documentId) {
          const newFavoriteStatus = !doc.isFavorite;
          setSnackbar({ 
            open: true, 
            message: newFavoriteStatus 
              ? `"${doc.name}" favorilere eklendi` 
              : `"${doc.name}" favorilerden çıkarıldı`, 
            severity: 'info' 
          });
          return { ...doc, isFavorite: newFavoriteStatus };
        }
        return doc;
      })
    );
  };

  // Welder certificate action handlers
  const handleViewWelderCertificate = (certificateId: string) => {
    const cert = welderCertificates.find(c => c.id === certificateId);
    if (cert) {
      setSelectedWelder(cert);
      setViewDialog(true);
      console.log('Viewing welder certificate:', cert.welderName);
    }
  };

  const handleDownloadWelderCertificate = (certificateId: string) => {
    const cert = welderCertificates.find(c => c.id === certificateId);
    if (cert && cert.fileUrl) {
      console.log('Downloading welder certificate:', cert.welderName);
      // Simulate download
      const downloadContent = `Kaynakçı: ${cert.welderName}\nSicil No: ${cert.registrationNo}\nSertifika Tipi: ${cert.certificateType}\nSertifika No: ${cert.certificateNumber}\nDepartman: ${cert.department}\nGeçerlilik: ${cert.validityDate} - ${cert.expiryDate}\nVeren Kurum: ${cert.issuingAuthority}\nKaynak Prosesleri: ${cert.weldingProcess.join(', ')}\nMalzeme Grupları: ${cert.materialGroup.join(', ')}\nKaynak Pozisyonları: ${cert.weldingPosition.join(', ')}`;
      const blob = new Blob([downloadContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cert.registrationNo}-${cert.welderName}-sertifika.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: `${cert.welderName} sertifikası başarıyla indirildi!`, severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Sertifika dosyası bulunamadı!', severity: 'error' });
    }
  };

  const handleEditWelderCertificate = (certificateId: string) => {
    const cert = welderCertificates.find(c => c.id === certificateId);
    if (cert) {
      // Open edit dialog for welder certificate
      setDialogMode('edit');
      setSelectedWelder(cert);
      setViewDialog(true);
      setSnackbar({ open: true, message: `${cert.welderName} sertifikası düzenleme modunda açıldı`, severity: 'info' });
      console.log('Editing welder certificate:', cert.welderName);
    }
  };

  const handleDeleteWelderCertificate = (certificateId: string) => {
    const cert = welderCertificates.find(c => c.id === certificateId);
    if (cert) {
      // Sertifika silme onayı kaldırıldı - sessiz silme
    const confirmation = true;
      if (confirmation) {
        console.log('Deleting welder certificate:', certificateId);
        // Actually remove the certificate from state
        setWelderCertificates(prevCerts => prevCerts.filter(c => c.id !== certificateId));
        setSnackbar({ open: true, message: `${cert.welderName} sertifikası başarıyla silindi!`, severity: 'success' });
      }
    }
  };

  // Personnel document action handlers
  const handleViewPersonnelDocument = (documentId: string) => {
    const doc = personnelDocuments.find(d => d.id === documentId);
    if (doc) {
      console.log('Viewing personnel document:', doc.personnelName);
      setSelectedPersonnelDocumentForView(doc);
      setViewDialog(true);
      setSnackbar({ open: true, message: `${doc.personnelName} - ${doc.documentType} belgesi görüntüleniyor`, severity: 'info' });
    }
  };

  const handleDownloadPersonnelDocument = (documentId: string) => {
    const doc = personnelDocuments.find(d => d.id === documentId);
    if (doc) {
      console.log('Downloading personnel document:', doc.personnelName);
      // Simulate download
      const downloadContent = `Personel: ${doc.personnelName}\nSicil No: ${doc.personnelId}\nTC Kimlik: ${doc.nationalId}\nDepartman: ${doc.department}\nPozisyon: ${doc.position}\nBelge Kategorisi: ${doc.documentCategory}\nBelge Tipi: ${doc.documentType}\nSertifika No: ${doc.certificateNumber}\nVeren Kurum: ${doc.issuingAuthority}\nVeriliş Tarihi: ${doc.issueDate}\nGeçerlilik: ${doc.validityDate} - ${doc.expiryDate}\nEğitim Saati: ${doc.trainingHours || 'Belirtilmemiş'}\nSınav Sonucu: ${doc.examResult || 'Belirtilmemiş'}\nÖnem Düzeyi: ${doc.criticalityLevel}\nDurum: ${doc.status}\nYetkili: ${doc.authorizedBy}\nNotlar: ${doc.notes}`;
      const blob = new Blob([downloadContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.personnelId}-${doc.personnelName}-${doc.documentType}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: `${doc.personnelName} - ${doc.documentType} belgesi başarıyla indirildi!`, severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Belge dosyası bulunamadı!', severity: 'error' });
    }
  };

  const handleEditPersonnelDocument = (documentId: string) => {
    const doc = personnelDocuments.find(d => d.id === documentId);
    if (doc) {
      console.log('Editing personnel document:', doc.personnelName);
      setSelectedPersonnelDocumentForEdit(doc);
      setEditPersonnelDialog(true);
      setSnackbar({ open: true, message: `${doc.personnelName} - ${doc.documentType} belgesi düzenleme modunda açıldı`, severity: 'info' });
    }
  };

  const handleDeletePersonnelDocument = (documentId: string) => {
    const doc = personnelDocuments.find(d => d.id === documentId);
    if (doc) {
      // Personel belgesi silme onayı kaldırıldı - sessiz silme
    const confirmation = true;
      if (confirmation) {
        console.log('Deleting personnel document:', documentId);
        // Actually remove the document from state
        setPersonnelDocuments(prevDocs => prevDocs.filter(d => d.id !== documentId));
        setSnackbar({ open: true, message: `${doc.personnelName} - ${doc.documentType} belgesi başarıyla silindi!`, severity: 'success' });
      }
    }
  };

  const handleDeleteQualityCertificate = (certificateId: string) => {
    const cert = qualityCertificates.find(c => c.id === certificateId);
    if (cert) {
      setQualityCertificates(prev => prev.filter(c => c.id !== certificateId));
      setSnackbar({ 
        open: true, 
        message: `${cert.name} kalite belgesi başarıyla silindi.`, 
        severity: 'success' 
      });
    }
  };

  const handleDeleteProductCertificate = (certificateId: string) => {
    const cert = productCertificates.find(c => c.id === certificateId);
    if (cert) {
      setProductCertificates(prev => prev.filter(c => c.id !== certificateId));
      setSnackbar({ 
        open: true, 
        message: `${cert.name} ürün belgesi başarıyla silindi.`, 
        severity: 'success' 
      });
    }
  };

  // Report generation handlers
  const handleGenerateDocumentInventoryReport = () => {
    console.log('Generating document inventory report...');
    setSnackbar({ open: true, message: 'Doküman envanteri PDF raporu oluşturuluyor...', severity: 'info' });
    
    // Simulate report generation
    setTimeout(() => {
      const reportContent = `DOKÜMAN ENVANTERİ RAPORU
Tarih: ${new Date().toLocaleDateString('tr-TR')}

Toplam Doküman Sayısı: ${documents.length}
Aktif Dokümanlar: ${documents.filter(d => d.status === 'active').length}
Taslak Dokümanlar: ${documents.filter(d => d.status === 'draft').length}

DOKÜMAN LİSTESİ:
${documents.map(doc => `- ${doc.number}: ${doc.name} (${doc.type}) - ${doc.status.toUpperCase()}`).join('\n')}`;
      
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dokuman-envanteri-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: 'Doküman envanteri raporu başarıyla oluşturuldu!', severity: 'success' });
    }, 2000);
  };

  const handleGenerateRevisionHistoryReport = () => {
    console.log('Generating revision history report...');
    setSnackbar({ open: true, message: 'Revizyon geçmişi Excel raporu oluşturuluyor...', severity: 'info' });
    
    setTimeout(() => {
      const reportContent = `REVİZYON GEÇMİŞİ RAPORU
Tarih: ${new Date().toLocaleDateString('tr-TR')}

${documents.map(doc => `${doc.number} - ${doc.name}
Mevcut Revizyon: ${doc.revisionNo}
Son Güncelleme: ${doc.uploadDate}
Sahip: ${doc.owner}
---`).join('\n')}`;
      
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `revizyon-gecmisi-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: 'Revizyon geçmişi raporu başarıyla oluşturuldu!', severity: 'success' });
    }, 2000);
  };

  const handleGenerateActiveWelderReport = () => {
    console.log('Generating active welder report...');
    setSnackbar({ open: true, message: 'Aktif kaynakçı listesi PDF raporu oluşturuluyor...', severity: 'info' });
    
    setTimeout(() => {
      const reportContent = `AKTİF KAYNAKÇI LİSTESİ RAPORU
Tarih: ${new Date().toLocaleDateString('tr-TR')}

Toplam Aktif Kaynakçı: ${welderCertificates.filter(c => c.status === 'active').length}

${welderCertificates.filter(c => c.status === 'active').map(cert => 
`${cert.welderName} (${cert.registrationNo})
Departman: ${cert.department}
Sertifika: ${cert.certificateType}
Geçerlilik: ${cert.expiryDate}
---`).join('\n')}`;
      
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aktif-kaynakci-listesi-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: 'Aktif kaynakçı listesi raporu başarıyla oluşturuldu!', severity: 'success' });
    }, 2000);
  };

  const handleGenerateExpiryReport = () => {
    console.log('Generating expiry report...');
    setSnackbar({ open: true, message: 'Süre dolum Excel raporu oluşturuluyor...', severity: 'info' });
    
    setTimeout(() => {
      const today = new Date();
      const expiringDocs = documents.filter(doc => {
        if (!doc.expiryDate) return false;
        const expiry = new Date(doc.expiryDate);
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
        return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
      });
      
      const expiringCerts = welderCertificates.filter(cert => {
        const expiry = new Date(cert.expiryDate);
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
        return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
      });
      
      const reportContent = `SÜRE DOLUM RAPORU
Tarih: ${new Date().toLocaleDateString('tr-TR')}

30 GÜN İÇİNDE SÜRESİ DOLACAK DOKÜMANLAR (${expiringDocs.length} adet):
${expiringDocs.map(doc => `- ${doc.number}: ${doc.name} (${doc.expiryDate})`).join('\n')}

30 GÜN İÇİNDE SÜRESİ DOLACAK SERTİFİKALAR (${expiringCerts.length} adet):
${expiringCerts.map(cert => `- ${cert.welderName} (${cert.registrationNo}): ${cert.certificateType} (${cert.expiryDate})`).join('\n')}`;
      
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sure-dolum-raporu-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: 'Süre dolum raporu başarıyla oluşturuldu!', severity: 'success' });
    }, 2000);
  };

  const handleExportData = () => {
    console.log('Exporting all data...');
    setSnackbar({ open: true, message: 'Tüm veriler dışa aktarılıyor...', severity: 'info' });
    
    setTimeout(() => {
      const exportContent = `KADEME A.Ş. KALİTE YÖNETİM SİSTEMİ VERİ DIŞA AKTARIMI
Tarih: ${new Date().toLocaleDateString('tr-TR')}

=== DOKÜMANLAR ===
${documents.map(doc => JSON.stringify(doc, null, 2)).join('\n---\n')}

=== KAYNAKÇI SERTİFİKALARI ===
${welderCertificates.map(cert => JSON.stringify(cert, null, 2)).join('\n---\n')}`;
      
      const blob = new Blob([exportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kys-veri-disa-aktarimi-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: 'Tüm veriler başarıyla dışa aktarıldı!', severity: 'success' });
    }, 3000);
  };

  // Helper function to close view dialog and clear selected items
  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedDocumentForView(null);
    setSelectedCertificateForView(null);
    setSelectedPersonnelDocumentForView(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon />;
      case 'pending':
        return <PendingIcon />;
      case 'expired':
        return <ErrorIcon />;
      case 'draft':
        return <EditIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getExpiryWarning = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    
    if (daysUntilExpiry < 0) {
      return { color: 'error', text: 'Süresi Dolmuş', icon: <ErrorIcon /> };
    } else if (daysUntilExpiry <= 7) {
      return { color: 'error', text: `${daysUntilExpiry} gün kaldı`, icon: <WarningIcon /> };
    } else if (daysUntilExpiry <= 30) {
      return { color: 'warning', text: `${daysUntilExpiry} gün kaldı`, icon: <ScheduleIcon /> };
    }
    return null;
  };

  // Quality Certificate handlers
  const handleViewQualityCertificate = (certName: string, certData: any) => {
    // Create a temporary document object for quality certificates
    const tempDoc: Document = {
      id: `QUAL-${Date.now()}`,
      type: certData.name.includes('ISO') ? 'ISO 9001 Belgesi' : 'TS 3834-2 Belgesi',
      name: certData.name,
      number: `QUAL-${certData.name.replace(/\s+/g, '-')}`,
      unit: 'Kalite Güvence',
      effectiveDate: '2024-01-01',
      revisionNo: 1,
      owner: 'Kalite Müdürü',
      uploadDate: '2024-01-01',
      description: certData.type,
      status: 'active',
      approvalStatus: 'approved',
      isActive: true,
      expiryDate: certData.expiry,
      lastViewedDate: new Date().toISOString().split('T')[0],
      viewCount: 1,
      isFavorite: false,
      keywords: [certData.authority],
      approvalHistory: [],
      revisionHistory: [],
      attachments: []
    };
    
    setSelectedDocumentForView(tempDoc);
    setViewDialog(true);
  };

  const handleDownloadQualityCertificate = (certName: string, certData: any) => {
    const downloadContent = `KALİTE BELGESİ
Belge Adı: ${certData.name}
Tip: ${certData.type}
Veren Kurum: ${certData.authority}
Son Geçerlilik: ${certData.expiry}
Durum: ${certData.status === 'active' ? 'Aktif' : 'Yenileme Gerekli'}
İndirilme Tarihi: ${new Date().toLocaleDateString('tr-TR')}`;
    
    const blob = new Blob([downloadContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${certData.name.replace(/\s+/g, '-')}-kalite-belgesi.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: `${certData.name} belgesi başarıyla indirildi!`, severity: 'success' });
  };

  const handleEditQualityCertificate = (certName: string, certData: any) => {
    setDialogMode('edit');
    setActiveStep(0);
    setOpenDialog(true);
    setSnackbar({ open: true, message: `${certData.name} belgesi düzenleme modunda açıldı`, severity: 'info' });
  };

  const handleSaveDocument = () => {
    if (!documentForm.name || !documentForm.number || !documentForm.type || !documentForm.unit || !documentForm.owner) {
      setSnackbar({ open: true, message: 'Lütfen tüm zorunlu alanları doldurun!', severity: 'error' });
      return;
    }

    const now = new Date().toISOString().split('T')[0];
    
    if (dialogMode === 'create') {
      // Create new document
      const newDocument: Document = {
        id: `DOC-${Date.now()}`,
        type: documentForm.type as DocumentType,
        name: documentForm.name!,
        number: documentForm.number!,
        unit: documentForm.unit!,
        effectiveDate: documentForm.effectiveDate!,
        revisionNo: documentForm.revisionNo || 1,
        owner: documentForm.owner!,
        uploadDate: now,
        description: documentForm.description || '',
        status: documentForm.status as DocumentStatus || 'draft',
        approvalStatus: documentForm.approvalStatus as ApprovalStatus || 'pending',
        fileUrl: undefined,
        fileName: undefined,
        fileSize: undefined,
        isActive: documentForm.status === 'active',
        expiryDate: documentForm.expiryDate,
        lastViewedDate: undefined,
        viewCount: 0,
        isFavorite: false,
        approvalHistory: [],
        revisionHistory: [],
        keywords: documentForm.keywords || [],
        attachments: documentForm.attachments || [],
        // Dinamik alanlar
        personnelName: documentForm.personnelName,
        personnelId: documentForm.personnelId,
        registrationNo: documentForm.registrationNo,
        welderName: documentForm.welderName,
        certificateNumber: documentForm.certificateNumber,
        issuingAuthority: documentForm.issuingAuthority,
        weldingProcess: documentForm.weldingProcess,
        materialGroup: documentForm.materialGroup,
        weldingPosition: documentForm.weldingPosition,
        trainingHours: documentForm.trainingHours,
        examResult: documentForm.examResult,
        criticalityLevel: documentForm.criticalityLevel
      };
      
      setDocuments(prevDocs => [...prevDocs, newDocument]);
      setSnackbar({ open: true, message: `"${newDocument.name}" başarıyla oluşturuldu!`, severity: 'success' });
    } else if (dialogMode === 'edit') {
      // Update existing document
      setDocuments(prevDocs => 
        prevDocs.map(doc => {
          if (doc.id === documentForm.id) {
            return {
              ...doc,
              name: documentForm.name!,
              number: documentForm.number!,
              type: documentForm.type as DocumentType,
              unit: documentForm.unit!,
              effectiveDate: documentForm.effectiveDate!,
              revisionNo: documentForm.revisionNo || doc.revisionNo,
              owner: documentForm.owner!,
              description: documentForm.description || '',
              status: documentForm.status as DocumentStatus || doc.status,
              approvalStatus: documentForm.approvalStatus as ApprovalStatus || doc.approvalStatus,
              expiryDate: documentForm.expiryDate,
              keywords: documentForm.keywords || [],
              isActive: (documentForm.status as DocumentStatus || doc.status) === 'active',
              // Dinamik alanlar
              personnelName: documentForm.personnelName,
              personnelId: documentForm.personnelId,
              registrationNo: documentForm.registrationNo,
              welderName: documentForm.welderName,
              certificateNumber: documentForm.certificateNumber,
              issuingAuthority: documentForm.issuingAuthority,
              weldingProcess: documentForm.weldingProcess,
              materialGroup: documentForm.materialGroup,
              weldingPosition: documentForm.weldingPosition,
              trainingHours: documentForm.trainingHours,
              examResult: documentForm.examResult,
              criticalityLevel: documentForm.criticalityLevel
            };
          }
          return doc;
        })
      );
      setSnackbar({ open: true, message: `"${documentForm.name}" başarıyla güncellendi!`, severity: 'success' });
    }
    
    // Close dialog and reset form
    setOpenDialog(false);
    setActiveStep(0);
    setSelectedDocument(null);
    setDocumentForm({
      id: undefined,
      type: 'WPS',
      name: '',
      number: '',
      unit: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      revisionNo: 1,
      owner: '',
      description: '',
      status: 'draft',
      approvalStatus: 'pending',
      keywords: [],
      // Dinamik alanları da temizle
      personnelName: undefined,
      personnelId: undefined,
      registrationNo: undefined,
      welderName: undefined,
      certificateNumber: undefined,
      issuingAuthority: undefined,
      weldingProcess: undefined,
      materialGroup: undefined,
      weldingPosition: undefined,
      trainingHours: undefined,
      examResult: undefined,
      criticalityLevel: undefined
    });
  };

  // Document form state
  const [documentForm, setDocumentForm] = useState<Partial<Document>>({
    id: undefined,
    type: 'WPS',
    name: '',
    number: '',
    unit: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    revisionNo: 1,
    owner: '',
    description: '',
    status: 'draft',
    approvalStatus: 'pending',
    keywords: [],
    // Dinamik alanları başlangıçta boş
    personnelName: undefined,
    personnelId: undefined,
    registrationNo: undefined,
    welderName: undefined,
    certificateNumber: undefined,
    issuingAuthority: undefined,
    weldingProcess: undefined,
    materialGroup: undefined,
    weldingPosition: undefined,
    trainingHours: undefined,
    examResult: undefined,
    criticalityLevel: undefined
  });

  return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExportData}
            sx={{ color: 'primary.main', borderColor: 'primary.main', '&:hover': { borderColor: 'primary.dark', bgcolor: 'primary.lighter' } }}
          >
            Dışa Aktar
          </Button>
          {userRole === 'admin' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openCreateDialog('document')}
              size="large"
            >
              Yeni Doküman
            </Button>
          )}
        </Box>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab 
            label="Teknik Dokümanlar" 
            icon={<DescriptionIcon />} 
            iconPosition="start"
            sx={{ minHeight: 64, fontSize: '1rem' }}
          />
          <Tab 
            label="Personel Belgeleri" 
            icon={<PersonIcon />} 
            iconPosition="start"
            sx={{ minHeight: 64, fontSize: '1rem' }}
          />
          <Tab 
            label="Kalite Belgeleri" 
            icon={<VerifiedUserIcon />} 
            iconPosition="start"
            sx={{ minHeight: 64, fontSize: '1rem' }}
          />
          <Tab 
            label="Onay Süreçleri" 
            icon={<ApprovalIcon />} 
            iconPosition="start"
            sx={{ minHeight: 64, fontSize: '1rem' }}
          />
          <Tab 
            label="Raporlar ve Analizler" 
            icon={<AssessmentIcon />} 
            iconPosition="start"
            sx={{ minHeight: 64, fontSize: '1rem' }}
          />
        </Tabs>

        {/* Document Management Tab */}
        {activeTab === 0 && (
          <Box>
            {/* Statistics Cards */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 4 
            }}>
              <DocumentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="primary">
                        {documentStats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Toplam Teknik Doküman
                      </Typography>
                    </Box>
                    <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                </CardContent>
              </DocumentCard>
              <DocumentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {documentStats.active}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aktif Doküman
                      </Typography>
                    </Box>
                    <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
              </DocumentCard>
              <DocumentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {documentStats.pending}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Onay Bekleyen
                      </Typography>
                    </Box>
                    <PendingIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  </Box>
                </CardContent>
              </DocumentCard>
              <DocumentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="error.main">
                        {documentStats.expiring}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Süresi Dolacak
                      </Typography>
                    </Box>
                    <ScheduleIcon sx={{ fontSize: 40, color: 'error.main' }} />
                  </Box>
                </CardContent>
              </DocumentCard>
            </Box>

            {/* Filters */}
            <StyledAccordion
              expanded={expanded === 'document-filters'}
              onChange={handleAccordionChange('document-filters')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterListIcon sx={{ color: '#ffffff' }} />
                  <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>Filtreler ve Arama</Typography>
                  {Object.values(filters).some(v => v !== '' && v !== false && !(typeof v === 'object' && v !== null && !(v as any).start && !(v as any).end)) && (
                    <Badge color="error" variant="dot" />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
                  gap: 3,
                  mb: 3
                }}>
                  <UltraStableSearchInput
                    value={filters.searchTerm}
                    onChange={(value) => handleFilterChange('searchTerm', value)}
                    label="Arama"
                    placeholder="Doküman adı, numarası veya açıklama..."
                    size="medium"
                    fullWidth={true}
                  />
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Doküman Tipi</InputLabel>
                    <Select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      label="Doküman Tipi"
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      
                      <ListSubheader>Kaynak Dokümanları</ListSubheader>
                      <MenuItem value="WPS">WPS - Kaynak Prosedürü</MenuItem>
                      <MenuItem value="WPQR">WPQR - Kaynak Kalite Kaydı</MenuItem>
                      
                      <ListSubheader>Teknik Dokümanlar</ListSubheader>
                      <MenuItem value="Teknik Resim">Teknik Resim</MenuItem>
                      <MenuItem value="Prosedür">Prosedür</MenuItem>
                      <MenuItem value="Talimat">Talimat</MenuItem>
                      <MenuItem value="Test Prosedürü">Test Prosedürü</MenuItem>
                      <MenuItem value="Kontrol Listesi">Kontrol Listesi</MenuItem>
                      <MenuItem value="Spesifikasyon">Spesifikasyon</MenuItem>
                      <MenuItem value="Standart">Standart</MenuItem>
                      
                      <ListSubheader>Kalite Yönetim Dokümanları</ListSubheader>
                      <MenuItem value="Kalite Planı">Kalite Planı</MenuItem>
                      
                      <ListSubheader>ISO Kalite Belgeleri</ListSubheader>
                      <MenuItem value="ISO 9001 Belgesi">ISO 9001 Belgesi</MenuItem>
                      <MenuItem value="ISO 14001 Belgesi">ISO 14001 Belgesi</MenuItem>
                      <MenuItem value="ISO 27001 Belgesi">ISO 27001 Belgesi</MenuItem>
                      <MenuItem value="ISO 45001 Belgesi">ISO 45001 Belgesi</MenuItem>
                      <MenuItem value="ISO 50001 Belgesi">ISO 50001 Belgesi</MenuItem>
                      <MenuItem value="TS 3834-2 Belgesi">TS 3834-2 Belgesi</MenuItem>
                      
                      <ListSubheader>Personel Belgeleri</ListSubheader>
                      <MenuItem value="İSG Sertifikası">İSG Sertifikası</MenuItem>
                      <MenuItem value="Kaynakçı Nitelik Belgesi">Kaynakçı Nitelik Belgesi</MenuItem>
                      <MenuItem value="Kaynakçı Sertifikası">Kaynakçı Sertifikası</MenuItem>
                      <MenuItem value="Kaynak Operatörü Belgesi">Kaynak Operatörü Belgesi</MenuItem>
                      <MenuItem value="NDT Sertifikası">NDT Sertifikası</MenuItem>
                      <MenuItem value="Yetki Belgesi">Yetki Belgesi</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Birim</InputLabel>
                    <Select
                      value={filters.unit}
                      onChange={(e) => handleFilterChange('unit', e.target.value)}
                      label="Birim"
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      {UNITS.map((unit) => (
                        <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Durum</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      label="Durum"
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      <MenuItem value="active">Aktif</MenuItem>
                      <MenuItem value="draft">Taslak</MenuItem>
                      <MenuItem value="review">İnceleme</MenuItem>
                      <MenuItem value="obsolete">Geçersiz</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ 
                  mt: 2, 
                  p: 3, 
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  borderRadius: 2,
                  border: '1px solid rgba(25, 118, 210, 0.12)'
                }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Ek Filtreler
                  </Typography>
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.showFavoritesOnly}
                          onChange={(e) => handleFilterChange('showFavoritesOnly', e.target.checked)}
                          sx={{ color: 'primary.main' }}
                        />
                      }
                      label="Sadece Favoriler"
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.showExpiring}
                          onChange={(e) => handleFilterChange('showExpiring', e.target.checked)}
                          sx={{ color: 'primary.main' }}
                        />
                      }
                      label="Süresi Dolacaklar"
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                    />
                  </FormGroup>
                </Box>
              </AccordionDetails>
            </StyledAccordion>

            {/* Document List */}
            <Paper sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                      <TableCell><Typography variant="body2" fontWeight="bold">Doküman</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight="bold">Tip</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight="bold">Birim</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight="bold">Rev.</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight="bold">Durum</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight="bold">Onay</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight="bold">Son Tarih</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight="bold">İşlemler</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDocuments.map((doc) => {
                      const expiryWarning = doc.expiryDate ? getExpiryWarning(doc.expiryDate) : null;
                      return (
                        <TableRow key={doc.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {doc.isFavorite && (
                                <Tooltip title="Favorilerden çıkar">
                                  <IconButton size="small" onClick={() => handleToggleFavorite(doc.id)}>
                                    <StarIcon sx={{ color: 'warning.main', fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {!doc.isFavorite && (
                                <Tooltip title="Favorilere ekle">
                                  <IconButton size="small" onClick={() => handleToggleFavorite(doc.id)}>
                                    <StarIcon sx={{ color: 'grey.400', fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {doc.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {doc.number}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <StatusChip
                              label={doc.type}
                              statustype={doc.type.toLowerCase()}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{doc.unit}</TableCell>
                          <TableCell>
                            <Chip label={`Rev ${doc.revisionNo}`} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <StatusChip
                              label={doc.status === 'active' ? 'Aktif' : doc.status === 'draft' ? 'Taslak' : 'İnceleme'}
                              statustype={doc.status}
                              size="small"
                              icon={getStatusIcon(doc.status)}
                            />
                          </TableCell>
                          <TableCell>
                            <StatusChip
                              label={
                                doc.approvalStatus === 'approved' ? 'Onaylandı' :
                                doc.approvalStatus === 'pending' ? 'Bekliyor' : 'Reddedildi'
                              }
                              statustype={doc.approvalStatus}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">{doc.effectiveDate}</Typography>
                              {expiryWarning && (
                                <Chip
                                  label={expiryWarning.text}
                                  size="small"
                                  color={expiryWarning.color as any}
                                  icon={expiryWarning.icon}
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Görüntüle">
                                <IconButton size="small" onClick={() => handleViewDocument(doc.id)}>
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="İndir">
                                <IconButton size="small" onClick={() => handleDownloadDocument(doc.id)}>
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                              {userRole === 'admin' && (
                                <>
                                  <Tooltip title="Düzenle">
                                    <IconButton size="small" onClick={() => handleEditDocument(doc.id)}>
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Sil">
                                    <IconButton size="small" onClick={() => handleDeleteDocument(doc.id)}>
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}

        {/* Welder Certificates Tab */}
        {activeTab === 1 && (
          <Box>
            {/* Personnel Statistics */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 4 
            }}>
              <DocumentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="primary">
                        {personnelStats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Toplam Personel Belgesi
                      </Typography>
                    </Box>
                    <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                </CardContent>
              </DocumentCard>
              <DocumentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {personnelStats.active}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aktif Belge
                      </Typography>
                    </Box>
                    <VerifiedUserIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
              </DocumentCard>
              <DocumentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {personnelStats.expiring}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Süresi Dolacak
                      </Typography>
                    </Box>
                    <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  </Box>
                </CardContent>
              </DocumentCard>
              <DocumentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="error.main">
                        {personnelStats.expired}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Süresi Dolmuş
                      </Typography>
                    </Box>
                    <ErrorIcon sx={{ fontSize: 40, color: 'error.main' }} />
                  </Box>
                </CardContent>
              </DocumentCard>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openCreateDialog('personnel')}
              >
                Yeni Personel Belgesi
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExportData}
              >
                Rapor Dışa Aktar
              </Button>
            </Box>

            {/* Personnel Filters */}
            <StyledAccordion
              expanded={expanded === 'welder-filters'}
              onChange={handleAccordionChange('welder-filters')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterListIcon sx={{ color: '#ffffff' }} />
                  <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>Personel Belge Filtreleri</Typography>
                  {Object.values(personnelFilters).some(v => 
                    v !== '' && v !== false && v !== 30 && 
                    !(typeof v === 'object' && v !== null && !(v as any).start && !(v as any).end)
                  ) && (
                    <Badge color="error" variant="dot" />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: 3,
                  mb: 3
                }}>
                  <TextField
                    fullWidth
                    label="Personel Adı / Sicil No"
                    value={personnelFilters.searchTerm}
                    onChange={(e) => handlePersonnelFilterChange('searchTerm', e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                    }}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Belge Kategorisi</InputLabel>
                    <Select
                      value={personnelFilters.documentCategory}
                      onChange={(e) => handlePersonnelFilterChange('documentCategory', e.target.value)}
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      {PERSONNEL_DOCUMENT_CATEGORIES.map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Belge Tipi</InputLabel>
                    <Select
                      value={personnelFilters.certificateType}
                      onChange={(e) => handlePersonnelFilterChange('certificateType', e.target.value)}
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      {personnelFilters.documentCategory && PERSONNEL_DOCUMENT_TYPES[personnelFilters.documentCategory as keyof typeof PERSONNEL_DOCUMENT_TYPES] ? 
                        PERSONNEL_DOCUMENT_TYPES[personnelFilters.documentCategory as keyof typeof PERSONNEL_DOCUMENT_TYPES].map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        )) :
                        Object.values(PERSONNEL_DOCUMENT_TYPES).flat().map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
                  gap: 3,
                  mb: 3
                }}>
                  <FormControl fullWidth>
                    <InputLabel>Departman</InputLabel>
                    <Select
                      value={personnelFilters.department}
                      onChange={(e) => handlePersonnelFilterChange('department', e.target.value)}
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      {DEPARTMENTS.map((department) => (
                        <MenuItem key={department} value={department}>{department}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Veren Kurum</InputLabel>
                    <Select
                      value={personnelFilters.issuingAuthority}
                      onChange={(e) => handlePersonnelFilterChange('issuingAuthority', e.target.value)}
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      {ISSUING_AUTHORITIES.map((authority) => (
                        <MenuItem key={authority} value={authority}>{authority}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Önem Düzeyi</InputLabel>
                    <Select
                      value={personnelFilters.criticalityLevel}
                      onChange={(e) => handlePersonnelFilterChange('criticalityLevel', e.target.value)}
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      {CRITICALITY_LEVELS.map((level) => (
                        <MenuItem key={level} value={level}>{level}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    type="number"
                    label="Süresi Dolacaklar (Gün)"
                    value={personnelFilters.expiringWithin}
                    onChange={(e) => handlePersonnelFilterChange('expiringWithin', parseInt(e.target.value) || 0)}
                    helperText="Bu süre içinde süresi dolacakları göster"
                  />
                  <FormControl fullWidth>
                    <InputLabel>Durum</InputLabel>
                    <Select
                      value={personnelFilters.status}
                      onChange={(e) => handlePersonnelFilterChange('status', e.target.value)}
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      <MenuItem value="active">Aktif</MenuItem>
                      <MenuItem value="expired">Süresi Dolmuş</MenuItem>
                      <MenuItem value="pending_renewal">Yenileme Bekliyor</MenuItem>
                      <MenuItem value="suspended">Askıya Alındı</MenuItem>
                      <MenuItem value="cancelled">İptal</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                {/* Ek Filtreler */}
                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={personnelFilters.renewalRequired}
                        onChange={(e) => handlePersonnelFilterChange('renewalRequired', e.target.checked)}
                      />
                    }
                    label="Yenileme Gerekli Olanlar"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={personnelFilters.expiringWithin <= 30}
                        onChange={(e) => handlePersonnelFilterChange('expiringWithin', e.target.checked ? 30 : 365)}
                      />
                    }
                    label="Yakında Süre Dolacaklar"
                  />
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={() => setPersonnelFilters({
                      searchTerm: '',
                      documentCategory: '',
                      certificateType: '',
                      department: '',
                      status: '',
                      issuingAuthority: '',
                      expiringWithin: 30,
                      validityDateRange: { start: '', end: '' },
                      criticalityLevel: '',
                      renewalRequired: false
                    })}
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        backgroundColor: 'primary.light',
                        color: '#ffffff'
                      }
                    }}
                  >
                    Filtreleri Temizle
                  </Button>
                </Box>
              </AccordionDetails>
            </StyledAccordion>

            {/* Personnel Documents List */}
            <Paper sx={{ p: 0 }}>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                      <TableCell sx={{ width: '20%', minWidth: 160 }}>
                        <Typography variant="body2" fontWeight="bold">Personel</Typography>
                      </TableCell>
                      <TableCell sx={{ width: '18%', minWidth: 140 }}>
                        <Typography variant="body2" fontWeight="bold">Belge Tipi</Typography>
                      </TableCell>
                      <TableCell sx={{ width: '15%', minWidth: 120 }}>
                        <Typography variant="body2" fontWeight="bold">Sertifika</Typography>
                      </TableCell>
                      <TableCell sx={{ width: '15%', minWidth: 120 }}>
                        <Typography variant="body2" fontWeight="bold">Departman</Typography>
                      </TableCell>
                      <TableCell sx={{ width: '17%', minWidth: 140 }}>
                        <Typography variant="body2" fontWeight="bold">Geçerlilik</Typography>
                      </TableCell>
                      <TableCell sx={{ width: '8%', minWidth: 80 }}>
                        <Typography variant="body2" fontWeight="bold">Durum</Typography>
                      </TableCell>
                      <TableCell sx={{ width: '7%', minWidth: 100 }}>
                        <Typography variant="body2" fontWeight="bold">İşlemler</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPersonnelDocuments.map((doc) => {
                      const expiryWarning = getExpiryWarning(doc.expiryDate);
                      const getCriticalityColor = (level: string) => {
                        switch (level) {
                          case 'Kritik': return 'error';
                          case 'Yüksek': return 'warning';
                          case 'Orta': return 'info';
                          case 'Düşük': return 'success';
                          default: return 'default';
                        }
                      };
                      
                      return (
                        <TableRow key={doc.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}>
                          <TableCell sx={{ px: 1.5, py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: '100%' }}>
                              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.75rem', flexShrink: 0 }}>
                                {doc.personnelName.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                              <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                                <Typography variant="body2" fontWeight={600} noWrap title={doc.personnelName}>
                                  {doc.personnelName.length > 18 ? doc.personnelName.substring(0, 18) + '...' : doc.personnelName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap title={doc.personnelId}>
                                  {doc.personnelId}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap title={doc.position} sx={{ display: 'block' }}>
                                  {doc.position.length > 18 ? doc.position.substring(0, 18) + '...' : doc.position}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ px: 1.5, py: 1.5 }}>
                            <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
                              <Chip
                                label={doc.documentCategory.length > 10 ? doc.documentCategory.substring(0, 10) + '...' : doc.documentCategory}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ mb: 0.5, fontSize: '0.65rem', height: 20, maxWidth: '100%' }}
                                title={doc.documentCategory}
                              />
                              <Typography variant="caption" display="block" color="text.secondary" noWrap title={doc.documentType}>
                                {doc.documentType.length > 18 ? doc.documentType.substring(0, 18) + '...' : doc.documentType}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ px: 1.5, py: 1.5 }}>
                            <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
                              <Typography variant="body2" fontWeight={600} noWrap title={doc.certificateNumber}>
                                {doc.certificateNumber}
                              </Typography>
                              <Chip
                                label={doc.criticalityLevel}
                                size="small"
                                color={getCriticalityColor(doc.criticalityLevel) as any}
                                sx={{ fontSize: '0.65rem', height: 18, mt: 0.5 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell sx={{ px: 1.5, py: 1.5 }}>
                            <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
                              <Typography variant="body2" fontWeight={500} noWrap title={doc.department}>
                                {doc.department.length > 12 ? doc.department.substring(0, 12) + '...' : doc.department}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap title={doc.issuingAuthority}>
                                {doc.issuingAuthority.length > 15 ? doc.issuingAuthority.substring(0, 15) + '...' : doc.issuingAuthority}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ px: 1.5, py: 1.5 }}>
                            <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
                              <Typography variant="caption" color="text.secondary" display="block" title={`${new Date(doc.validityDate).toLocaleDateString('tr-TR')} - ${new Date(doc.expiryDate).toLocaleDateString('tr-TR')}`}>
                                {new Date(doc.validityDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })} -
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {new Date(doc.expiryDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3, mt: 0.3 }}>
                                {expiryWarning && (
                                  <Chip
                                    label={expiryWarning.text.length > 8 ? expiryWarning.text.substring(0, 8) + '...' : expiryWarning.text}
                                    size="small"
                                    color={expiryWarning.color as any}
                                    sx={{ fontSize: '0.6rem', height: 16 }}
                                    title={expiryWarning.text}
                                  />
                                )}
                                {doc.renewalRequired && (
                                  <Chip
                                    label="Yenile"
                                    size="small"
                                    color="info"
                                    sx={{ fontSize: '0.6rem', height: 16 }}
                                    title="Yenileme Gerekli"
                                  />
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ px: 1, py: 1.5 }}>
                            <Chip
                              label={
                                doc.status === 'active' ? 'Aktif' : 
                                doc.status === 'expired' ? 'Dolmuş' :
                                doc.status === 'pending_renewal' ? 'Bekliyor' :
                                doc.status === 'suspended' ? 'Askıda' : 'İptal'
                              }
                              size="small"
                              color={
                                doc.status === 'active' ? 'success' :
                                doc.status === 'expired' ? 'error' :
                                doc.status === 'pending_renewal' ? 'warning' :
                                doc.status === 'suspended' ? 'info' : 'default'
                              }
                              sx={{ fontSize: '0.65rem', height: 20, maxWidth: '100%' }}
                            />
                          </TableCell>
                          <TableCell sx={{ px: 0.5, py: 1.5 }}>
                            <Box sx={{ display: 'flex', gap: 0.2, justifyContent: 'center' }}>
                              <Tooltip title="Görüntüle">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewPersonnelDocument(doc.id)}
                                  sx={{ width: 24, height: 24 }}
                                >
                                  <ViewIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="İndir">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDownloadPersonnelDocument(doc.id)}
                                  sx={{ width: 24, height: 24 }}
                                >
                                  <DownloadIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Düzenle">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditPersonnelDocument(doc.id)}
                                  sx={{ width: 24, height: 24 }}
                                >
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Sil">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeletePersonnelDocument(doc.id)}
                                  color="error"
                                  sx={{ width: 24, height: 24 }}
                                >
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}

        {/* Quality Certificates Tab */}
        {activeTab === 2 && (
          <Box>
            {/* Quality Certificates Statistics */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
              gap: 3, 
              mb: 4 
            }}>
              <DocumentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="primary">
                        {certificateStats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Toplam ISO Belgesi
                      </Typography>
                    </Box>
                    <VerifiedUserIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                </CardContent>
              </DocumentCard>
              
              <DocumentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {certificateStats.active}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aktif Belge
                      </Typography>
                    </Box>
                    <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
              </DocumentCard>
              
              <DocumentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {certificateStats.expiring}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Yenileme Gerekli
                      </Typography>
                    </Box>
                    <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  </Box>
                </CardContent>
              </DocumentCard>
              
              <DocumentCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="error.main">
                        {certificateStats.expired}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Süresi Dolmuş
                      </Typography>
                    </Box>
                    <ErrorIcon sx={{ fontSize: 40, color: 'error.main' }} />
                  </Box>
                </CardContent>
              </DocumentCard>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openCreateDialog('document')}
              >
                Yeni Kalite Belgesi
              </Button>
              <Button
                variant="outlined"
                startIcon={<AssessmentIcon />}
                onClick={handleGenerateDocumentInventoryReport}
              >
                Kalite Raporu
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExportData}
              >
                Dışa Aktar
              </Button>
            </Box>

            {/* Quality Certificates List */}
            <Box sx={{ display: 'grid', gap: 3 }}>
              {/* ISO Management System Certificates */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedUserIcon color="primary" />
                  ISO Yönetim Sistemi Belgeleri
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  {certificateStats.certificatesWithStatus
                    .filter(cert => ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018', 'ISO 50001:2018', 'ISO 27001:2013'].includes(cert.name))
                    .map((cert, index) => (
                    <Card key={cert.id || index} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {cert.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {cert.type}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Veren Kurum: {cert.authority}
                          </Typography>
                        </Box>
                        <StatusChip
                          label={
                            cert.status === 'active' ? 'Aktif' : 
                            cert.status === 'expiring' ? 'Yenileme Gerekli' : 
                            'Süresi Dolmuş'
                          }
                          statustype={cert.status}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="caption" color={cert.status === 'expired' ? 'error.main' : 'text.secondary'}>
                          Son Geçerlilik: {cert.expiry}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Görüntüle">
                            <IconButton size="small" onClick={() => handleViewQualityCertificate(cert.name, cert)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="İndir">
                            <IconButton size="small" onClick={() => handleDownloadQualityCertificate(cert.name, cert)}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Düzenle">
                            <IconButton size="small" onClick={() => handleEditQualityCertificate(cert.name, cert)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton size="small" onClick={() => handleDeleteQualityCertificate(cert.id)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Paper>

              {/* Welding Standards */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CertificateIcon color="primary" />
                  Kaynak Kalite Belgeleri
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  {weldingCertificates.map((cert, index) => (
                    <Card key={index} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {cert.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {cert.type}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Veren Kurum: {cert.authority}
                          </Typography>
                        </Box>
                        <StatusChip
                          label={cert.status === 'active' ? 'Aktif' : 'Yenileme Gerekli'}
                          statustype={cert.status}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="caption">
                          Son Geçerlilik: {cert.expiry}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Görüntüle">
                            <IconButton size="small" onClick={() => handleViewQualityCertificate(cert.name, cert)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="İndir">
                            <IconButton size="small" onClick={() => handleDownloadQualityCertificate(cert.name, cert)}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Düzenle">
                            <IconButton size="small" onClick={() => handleEditQualityCertificate(cert.name, cert)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton size="small" color="error" onClick={() => handleDeleteQualityCertificate(cert.name)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Paper>

              {/* Product Certifications */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon color="primary" />
                  Ürün Sertifikaları
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  {productCertificates.map((cert, index) => (
                    <Card key={cert.id || index} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {cert.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {cert.type}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Veren Kurum: {cert.authority}
                          </Typography>
                        </Box>
                        <StatusChip
                          label={cert.status === 'active' ? 'Aktif' : 'Yenileme Gerekli'}
                          statustype={cert.status}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="caption">
                          Son Geçerlilik: {cert.expiry}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Görüntüle">
                            <IconButton size="small" onClick={() => handleViewQualityCertificate(cert.name, cert)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="İndir">
                            <IconButton size="small" onClick={() => handleDownloadQualityCertificate(cert.name, cert)}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Düzenle">
                            <IconButton size="small" onClick={() => handleEditQualityCertificate(cert.name, cert)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton size="small" onClick={() => handleDeleteProductCertificate(cert.id)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>
        )}

        {/* Approval Processes Tab */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ApprovalIcon color="primary" />
              Onay Süreçleri Yönetimi
            </Typography>

            {/* Onay İstatistikleri */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
              <DocumentCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <PendingIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {documents.filter(d => d.approvalStatus === 'pending').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bekleyen Onaylar
                    </Typography>
                  </Box>
                </CardContent>
              </DocumentCard>

              <DocumentCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {documents.filter(d => d.approvalStatus === 'approved').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Onaylanmış
                    </Typography>
                  </Box>
                </CardContent>
              </DocumentCard>

              <DocumentCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ErrorIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {documents.filter(d => d.approvalStatus === 'rejected').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reddedilen
                    </Typography>
                  </Box>
                </CardContent>
              </DocumentCard>

              <DocumentCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {documents.filter(d => d.approvalStatus === 'revision_required').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Revizyon Gerekli
                    </Typography>
                  </Box>
                </CardContent>
              </DocumentCard>
            </Box>

            {/* Ana İçerik - Accordion Yapısı */}
            <Box sx={{ mb: 3 }}>
              {/* Bekleyen Onaylar */}
              <Accordion expanded={expandedApprovalPanel === 'pending'} onChange={handleApprovalAccordionChange('pending')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge badgeContent={documents.filter(d => d.approvalStatus === 'pending').length} color="warning">
                      <PendingIcon color="warning" />
                    </Badge>
                    <Typography variant="h6" fontWeight="bold">
                      Bekleyen Onaylar
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    {documents.filter(d => d.approvalStatus === 'pending').length === 0 ? (
                      <Alert severity="success">
                        <Typography>Bekleyen onay bulunmamaktadır.</Typography>
                      </Alert>
                    ) : (
                      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell><Typography variant="subtitle2" fontWeight="bold">Doküman</Typography></TableCell>
                              <TableCell><Typography variant="subtitle2" fontWeight="bold">Tip</Typography></TableCell>
                              <TableCell><Typography variant="subtitle2" fontWeight="bold">Yüklenme Tarihi</Typography></TableCell>
                              <TableCell><Typography variant="subtitle2" fontWeight="bold">Sahip</Typography></TableCell>
                              <TableCell><Typography variant="subtitle2" fontWeight="bold">Öncelik</Typography></TableCell>
                              <TableCell align="center"><Typography variant="subtitle2" fontWeight="bold">İşlemler</Typography></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {documents.filter(d => d.approvalStatus === 'pending').map((doc) => (
                              <TableRow key={doc.id} hover>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold">{doc.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{doc.number}</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip label={doc.type} size="small" color="primary" variant="outlined" />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {new Date(doc.uploadDate).toLocaleDateString('tr-TR')}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                      {doc.owner.charAt(0)}
                                    </Avatar>
                                    <Typography variant="body2">{doc.owner}</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={doc.type.includes('ISO') || doc.type.includes('WPS') ? 'Yüksek' : 'Normal'} 
                                    size="small" 
                                    color={doc.type.includes('ISO') || doc.type.includes('WPS') ? 'error' : 'default'}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Tooltip title="Onayla">
                                      <IconButton 
                                        size="small" 
                                        color="success"
                                        onClick={() => handleApproveDocument(doc.id)}
                                      >
                                        <CheckCircleIcon />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Reddet">
                                      <IconButton 
                                        size="small" 
                                        color="error"
                                        onClick={() => handleRejectDocument(doc.id)}
                                      >
                                        <ErrorIcon />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Görüntüle">
                                      <IconButton 
                                        size="small" 
                                        onClick={() => handleViewDocument(doc.id)}
                                      >
                                        <ViewIcon />
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
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Onay Akış Matrisi */}
              <Accordion expanded={expandedApprovalPanel === 'matrix'} onChange={handleApprovalAccordionChange('matrix')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Onay Akış Matrisi
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Doküman tiplerini onaylayıcı roller ve seviyeler
                    </Typography>
                    
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Doküman Tipi</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">1. Seviye Onay</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">2. Seviye Onay</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">3. Seviye Onay</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Süre (Gün)</Typography></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[
                            { type: 'WPS', level1: 'Kaynak Mühendisi', level2: 'Kalite Müdürü', level3: 'Teknik Müdür', days: 5 },
                            { type: 'WPQR', level1: 'Kaynak Mühendisi', level2: 'Kalite Müdürü', level3: '-', days: 3 },
                            { type: 'ISO Belgeleri', level1: 'Kalite Müdürü', level2: 'Genel Müdür', level3: 'Yönetim Kurulu', days: 10 },
                            { type: 'Prosedür', level1: 'Birim Müdürü', level2: 'Kalite Müdürü', level3: '-', days: 3 },
                            { type: 'Talimat', level1: 'Birim Şefi', level2: 'Birim Müdürü', level3: '-', days: 2 },
                            { type: 'Teknik Resim', level1: 'Tasarım Mühendisi', level2: 'Proje Müdürü', level3: '-', days: 3 },
                            { type: 'Test Prosedürü', level1: 'Test Mühendisi', level2: 'Kalite Müdürü', level3: '-', days: 4 },
                          ].map((rule, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Chip label={rule.type} size="small" color="primary" variant="outlined" />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <PersonIcon fontSize="small" color="action" />
                                  <Typography variant="body2">{rule.level1}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <PersonIcon fontSize="small" color="action" />
                                  <Typography variant="body2">{rule.level2}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {rule.level3 !== '-' ? (
                                    <>
                                      <PersonIcon fontSize="small" color="action" />
                                      <Typography variant="body2">{rule.level3}</Typography>
                                    </>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">-</Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={`${rule.days} gün`} 
                                  size="small" 
                                  color={rule.days <= 2 ? 'success' : rule.days <= 5 ? 'warning' : 'error'}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Onay Geçmişi */}
              <Accordion expanded={expandedApprovalPanel === 'history'} onChange={handleApprovalAccordionChange('history')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Onay Geçmişi
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Son 30 günde yapılan onay işlemleri
                    </Typography>
                    
                    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Tarih</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Doküman</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">İşlem</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Onaylayıcı</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Yorum</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Süre</Typography></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {documents
                            .filter(d => d.approvalHistory && d.approvalHistory.length > 0)
                            .flatMap(d => d.approvalHistory.map(h => ({...h, documentName: d.name, documentType: d.type})))
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 20)
                            .map((record, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Typography variant="body2">
                                  {new Date(record.date).toLocaleDateString('tr-TR')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(record.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {record.documentName}
                                  </Typography>
                                  <Chip label={record.documentType} size="small" variant="outlined" />
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={
                                    record.action === 'approved' ? 'Onaylandı' :
                                    record.action === 'rejected' ? 'Reddedildi' : 'Bekliyor'
                                  }
                                  size="small"
                                  color={
                                    record.action === 'approved' ? 'success' :
                                    record.action === 'rejected' ? 'error' : 'warning'
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                    {record.approverName.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2">{record.approverName}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {record.approverRole}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                  {record.comments || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={`Seviye ${record.level}`} 
                                  size="small" 
                                  color="primary"
                                  variant="outlined"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Onaylayıcı Atamaları */}
              <Accordion expanded={expandedApprovalPanel === 'assignments'} onChange={handleApprovalAccordionChange('assignments')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VerifiedUserIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Onaylayıcı Atamaları
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Sistem kullanıcıları ve onay yetkileri
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<AddIcon />}
                        onClick={() => setOpenApproverDialog(true)}
                      >
                        Yeni Onaylayıcı
                      </Button>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
                      {[
                        { name: 'Mehmet Kaya', role: 'Kaynak Mühendisi', permissions: ['WPS', 'WPQR'], active: true },
                        { name: 'Ayşe Demir', role: 'Kalite Müdürü', permissions: ['WPS', 'WPQR', 'Prosedür', 'ISO Belgeleri'], active: true },
                        { name: 'Ali Vural', role: 'Teknik Müdür', permissions: ['WPS', 'ISO Belgeleri', 'Teknik Resim'], active: true },
                        { name: 'Fatma Öz', role: 'Genel Müdür', permissions: ['ISO Belgeleri', 'Yüksek Seviye'], active: true },
                        { name: 'Mustafa Tan', role: 'Birim Müdürü', permissions: ['Prosedür', 'Talimat'], active: false },
                        { name: 'Zeynep Ak', role: 'Test Mühendisi', permissions: ['Test Prosedürü'], active: true },
                      ].map((approver, index) => (
                        <DocumentCard key={index}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 40, height: 40 }}>
                                  {approver.name.split(' ').map(n => n.charAt(0)).join('')}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {approver.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {approver.role}
                                  </Typography>
                                </Box>
                              </Box>
                              <Chip 
                                label={approver.active ? 'Aktif' : 'Pasif'}
                                size="small"
                                color={approver.active ? 'success' : 'default'}
                              />
                            </Box>
                            
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                              Onay Yetkileri:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                              {approver.permissions.map((permission, idx) => (
                                <Chip 
                                  key={idx}
                                  label={permission} 
                                  size="small" 
                                  variant="outlined"
                                  color="primary"
                                />
                              ))}
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton size="small" color="primary">
                                <EditIcon />
                              </IconButton>
                              <IconButton size="small" color="error">
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </DocumentCard>
                      ))}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Box>
        )}

        {/* Reports and Analytics Tab */}
        {activeTab === 4 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Raporlar ve Analizler
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
              <DocumentCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Doküman Raporları
                  </Typography>
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton onClick={handleGenerateDocumentInventoryReport}>
                        <ListItemIcon>
                          <PdfIcon color="error" />
                        </ListItemIcon>
                        <ListItemText primary="Doküman Envanteri (PDF)" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton onClick={handleGenerateRevisionHistoryReport}>
                        <ListItemIcon>
                          <ExcelIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Revizyon Geçmişi (Excel)" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </CardContent>
              </DocumentCard>
              
              <DocumentCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Personel Raporları
                  </Typography>
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton onClick={handleGenerateActiveWelderReport}>
                        <ListItemIcon>
                          <PdfIcon color="error" />
                        </ListItemIcon>
                        <ListItemText primary="Aktif Kaynakçı Listesi (PDF)" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton onClick={handleGenerateExpiryReport}>
                        <ListItemIcon>
                          <ExcelIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary="Süre Dolum Raporu (Excel)" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </CardContent>
              </DocumentCard>
            </Box>
          </Box>
        )}

        {/* Document Creation Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setSelectedDocument(null);
            setActiveStep(0);
            // Form verilerini temizle
            setDocumentForm({
              id: undefined,
              type: 'WPS',
              name: '',
              number: '',
              unit: '',
              effectiveDate: new Date().toISOString().split('T')[0],
              revisionNo: 1,
              owner: '',
              description: '',
              status: 'draft',
              approvalStatus: 'pending',
              keywords: [],
              personnelName: undefined,
              personnelId: undefined,
              registrationNo: undefined,
              welderName: undefined,
              certificateNumber: undefined,
              issuingAuthority: undefined,
              weldingProcess: undefined,
              materialGroup: undefined,
              weldingPosition: undefined,
              trainingHours: undefined,
              examResult: undefined,
              criticalityLevel: undefined
            });
          }}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>{dialogMode === 'create' ? 'Yeni Doküman Oluştur' : 'Doküman Düzenle'}</DialogTitle>
          <DialogContent>
            {/* Stepper and form content */}
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              <Step>
                <StepLabel>Temel Bilgiler</StepLabel>
              </Step>
              <Step>
                <StepLabel>Detaylar ve İçerik</StepLabel>
              </Step>
              <Step>
                <StepLabel>Onay ve Tamamlama</StepLabel>
              </Step>
            </Stepper>

            {/* Step 0: Basic Information */}
            {activeStep === 0 && (
              <Box sx={{ display: 'grid', gap: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Temel Doküman Bilgileri
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <TextField
                    label="Doküman Adı"
                    required
                    fullWidth
                    value={documentForm.name || ''}
                    onChange={(e) => setDocumentForm(prev => ({ ...prev, name: e.target.value }))}
                    helperText="Doküman için açıklayıcı bir isim girin"
                  />
                  
                  <TextField
                    label="Doküman Numarası"
                    required
                    fullWidth
                    value={documentForm.number || ''}
                    onChange={(e) => setDocumentForm(prev => ({ ...prev, number: e.target.value }))}
                    helperText="Benzersiz doküman numarası"
                  />
                  
                  <FormControl fullWidth required>
                    <InputLabel>Doküman Tipi</InputLabel>
                    <Select
                      value={documentForm.type || 'WPS'}
                      onChange={(e) => {
                        const selectedType = e.target.value as DocumentType;
                        setDocumentForm(prev => ({ 
                          ...prev, 
                          type: selectedType,
                          // Tip değiştiğinde dinamik alanları temizle
                          personnelName: undefined,
                          personnelId: undefined,
                          registrationNo: undefined,
                          welderName: undefined,
                          certificateNumber: undefined,
                          issuingAuthority: undefined,
                          weldingProcess: undefined,
                          materialGroup: undefined,
                          weldingPosition: undefined,
                          trainingHours: undefined,
                          examResult: undefined,
                          criticalityLevel: undefined
                        }));
                      }}
                      label="Doküman Tipi"
                    >
                      <ListSubheader>Kaynak Dokümanları</ListSubheader>
                      <MenuItem value="WPS">WPS - Kaynak Prosedürü</MenuItem>
                      <MenuItem value="WPQR">WPQR - Kaynak Kalite Kaydı</MenuItem>
                      
                      <ListSubheader>Teknik Dokümanlar</ListSubheader>
                      <MenuItem value="Teknik Resim">Teknik Resim</MenuItem>
                      <MenuItem value="Prosedür">Prosedür</MenuItem>
                      <MenuItem value="Talimat">Talimat</MenuItem>
                      <MenuItem value="Test Prosedürü">Test Prosedürü</MenuItem>
                      <MenuItem value="Kontrol Listesi">Kontrol Listesi</MenuItem>
                      <MenuItem value="Spesifikasyon">Spesifikasyon</MenuItem>
                      <MenuItem value="Standart">Standart</MenuItem>
                      
                      <ListSubheader>Kalite Yönetim Dokümanları</ListSubheader>
                      <MenuItem value="Kalite Planı">Kalite Planı</MenuItem>
                      
                      <ListSubheader>ISO Kalite Belgeleri</ListSubheader>
                      <MenuItem value="ISO 9001 Belgesi">ISO 9001 Belgesi</MenuItem>
                      <MenuItem value="ISO 14001 Belgesi">ISO 14001 Belgesi</MenuItem>
                      <MenuItem value="ISO 27001 Belgesi">ISO 27001 Belgesi</MenuItem>
                      <MenuItem value="ISO 45001 Belgesi">ISO 45001 Belgesi</MenuItem>
                      <MenuItem value="ISO 50001 Belgesi">ISO 50001 Belgesi</MenuItem>
                      <MenuItem value="TS 3834-2 Belgesi">TS 3834-2 Belgesi</MenuItem>
                      
                      <ListSubheader>Personel Belgeleri</ListSubheader>
                      <MenuItem value="İSG Sertifikası">İSG Sertifikası</MenuItem>
                      <MenuItem value="Kaynakçı Nitelik Belgesi">Kaynakçı Nitelik Belgesi</MenuItem>
                      <MenuItem value="Kaynakçı Sertifikası">Kaynakçı Sertifikası</MenuItem>
                      <MenuItem value="Kaynak Operatörü Belgesi">Kaynak Operatörü Belgesi</MenuItem>
                      <MenuItem value="NDT Sertifikası">NDT Sertifikası</MenuItem>
                      <MenuItem value="Yetki Belgesi">Yetki Belgesi</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth required>
                    <InputLabel>Birim</InputLabel>
                    <Select
                      value={documentForm.unit || ''}
                      onChange={(e) => setDocumentForm(prev => ({ ...prev, unit: e.target.value }))}
                      label="Birim"
                    >
                      <MenuItem value="Kaynak Atölyesi">Kaynak Atölyesi</MenuItem>
                      <MenuItem value="Kalite Kontrol">Kalite Kontrol</MenuItem>
                      <MenuItem value="Üretim">Üretim</MenuItem>
                      <MenuItem value="Montaj">Montaj</MenuItem>
                      <MenuItem value="Boyahane">Boyahane</MenuItem>
                      <MenuItem value="Makine Atölyesi">Makine Atölyesi</MenuItem>
                      <MenuItem value="Planlama">Planlama</MenuItem>
                      <MenuItem value="İSG">İSG</MenuItem>
                      <MenuItem value="Genel">Genel</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="Doküman Sahibi"
                    required
                    fullWidth
                    value={documentForm.owner || ''}
                    onChange={(e) => setDocumentForm(prev => ({ ...prev, owner: e.target.value }))}
                    helperText="Dokümandan sorumlu kişi"
                  />
                  
                  <TextField
                    label="Yürürlük Tarihi"
                    type="date"
                    required
                    fullWidth
                    value={documentForm.effectiveDate || ''}
                    onChange={(e) => setDocumentForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>

                {/* Doküman Tipine Göre Dinamik Alanlar - Sadece gerekli tiplerde göster */}
                {documentForm.type && (documentForm.type === 'Kaynakçı Sertifikası' || 
                                       documentForm.type === 'Kaynakçı Nitelik Belgesi' || 
                                       documentForm.type === 'Kaynak Operatörü Belgesi' ||
                                       documentForm.type === 'NDT Sertifikası' ||
                                       documentForm.type === 'İSG Sertifikası' ||
                                       documentForm.type === 'Yetki Belgesi') && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {documentForm.type} Özel Bilgileri
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                      {/* Kaynakçı Sertifikası veya Kaynakçı Nitelik Belgesi için */}
                      {(documentForm.type === 'Kaynakçı Sertifikası' || documentForm.type === 'Kaynakçı Nitelik Belgesi' || documentForm.type === 'Kaynak Operatörü Belgesi') && (
                        <>
                          <FormControl fullWidth required>
                            <InputLabel>Kaynakçı Seçimi</InputLabel>
                            <Select
                              value={documentForm.welderName || ''}
                              onChange={(e) => {
                                const selectedWelder = welderOptions.find(w => w.welderName === e.target.value);
                                setDocumentForm(prev => ({ 
                                  ...prev, 
                                  welderName: e.target.value,
                                  registrationNo: selectedWelder?.registrationNo || '',
                                  certificateNumber: selectedWelder?.certificateNumber || ''
                                }));
                              }}
                              label="Kaynakçı Seçimi"
                            >
                              {welderOptions.map((welder) => (
                                <MenuItem key={welder.id} value={welder.welderName}>
                                  {welder.welderName} - {welder.registrationNo} ({welder.department})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          
                          <TextField
                            label="Sicil Numarası"
                            fullWidth
                            value={documentForm.registrationNo || ''}
                            onChange={(e) => setDocumentForm(prev => ({ ...prev, registrationNo: e.target.value }))}
                            InputProps={{ readOnly: true }}
                            helperText="Kaynakçı seçildiğinde otomatik doldurulur"
                          />
                          
                          <TextField
                            label="Sertifika Numarası"
                            fullWidth
                            value={documentForm.certificateNumber || ''}
                            onChange={(e) => setDocumentForm(prev => ({ ...prev, certificateNumber: e.target.value }))}
                            helperText="Kaynakçı seçildiğinde otomatik doldurulur, düzenlenebilir"
                          />
                          
                          <TextField
                            label="Veren Kurum"
                            fullWidth
                            value={documentForm.issuingAuthority || ''}
                            onChange={(e) => setDocumentForm(prev => ({ ...prev, issuingAuthority: e.target.value }))}
                            helperText="Örn: TSE, TÜRKAK, Bureau Veritas"
                          />
                          
                          <FormControl fullWidth>
                            <InputLabel>Kaynak Prosesleri</InputLabel>
                            <Select
                              multiple
                              value={documentForm.weldingProcess || []}
                              onChange={(e) => setDocumentForm(prev => ({ ...prev, weldingProcess: e.target.value as string[] }))}
                              label="Kaynak Prosesleri"
                            >
                              <MenuItem value="111">111 - MMA (Elektrod Kaynak)</MenuItem>
                              <MenuItem value="131">131 - MIG (Gaz Altı Kaynak)</MenuItem>
                              <MenuItem value="141">141 - TIG (Argon Kaynak)</MenuItem>
                              <MenuItem value="121">121 - SAW (Alttan Kaynak)</MenuItem>
                              <MenuItem value="114">114 - Flux Cored</MenuItem>
                            </Select>
                          </FormControl>
                          
                          <FormControl fullWidth>
                            <InputLabel>Malzeme Grupları</InputLabel>
                            <Select
                              multiple
                              value={documentForm.materialGroup || []}
                              onChange={(e) => setDocumentForm(prev => ({ ...prev, materialGroup: e.target.value as string[] }))}
                              label="Malzeme Grupları"
                            >
                              <MenuItem value="1">Grup 1 - Karbon Çelik</MenuItem>
                              <MenuItem value="2">Grup 2 - Düşük Alaşımlı Çelik</MenuItem>
                              <MenuItem value="3">Grup 3 - Yüksek Alaşımlı Çelik</MenuItem>
                              <MenuItem value="4">Grup 4 - Paslanmaz Çelik</MenuItem>
                              <MenuItem value="5">Grup 5 - Alüminyum</MenuItem>
                            </Select>
                          </FormControl>
                          
                          <FormControl fullWidth>
                            <InputLabel>Kaynak Pozisyonları</InputLabel>
                            <Select
                              multiple
                              value={documentForm.weldingPosition || []}
                              onChange={(e) => setDocumentForm(prev => ({ ...prev, weldingPosition: e.target.value as string[] }))}
                              label="Kaynak Pozisyonları"
                            >
                              <MenuItem value="PA">PA - Düz Pozisyon</MenuItem>
                              <MenuItem value="PB">PB - Yatay Pozisyon</MenuItem>
                              <MenuItem value="PC">PC - Dikey Pozisyon</MenuItem>
                              <MenuItem value="PD">PD - Tavan Pozisyon</MenuItem>
                              <MenuItem value="PE">PE - Tüp Yatay</MenuItem>
                              <MenuItem value="PF">PF - Tüp Dikey</MenuItem>
                              <MenuItem value="PG">PG - Tüp Eğik</MenuItem>
                            </Select>
                          </FormControl>
                        </>
                      )}
                      
                      {/* NDT Sertifikası için */}
                      {documentForm.type === 'NDT Sertifikası' && (
                        <>
                          <FormControl fullWidth required>
                            <InputLabel>Personel Seçimi</InputLabel>
                            <Select
                              value={documentForm.personnelName || ''}
                              onChange={(e) => {
                                const selectedPersonnel = personnelOptions.find(p => p.name === e.target.value);
                                setDocumentForm(prev => ({ 
                                  ...prev, 
                                  personnelName: e.target.value,
                                  personnelId: selectedPersonnel?.registrationNo || ''
                                }));
                              }}
                              label="Personel Seçimi"
                            >
                              {personnelOptions.filter(p => p.position.includes('NDT')).map((personnel) => (
                                <MenuItem key={personnel.id} value={personnel.name}>
                                  {personnel.name} - {personnel.registrationNo} ({personnel.position})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          
                          <TextField
                            label="Sicil Numarası"
                            fullWidth
                            value={documentForm.personnelId || ''}
                            onChange={(e) => setDocumentForm(prev => ({ ...prev, personnelId: e.target.value }))}
                            InputProps={{ readOnly: true }}
                            helperText="Personel seçildiğinde otomatik doldurulur"
                          />
                          
                          <TextField
                            label="Sertifika Numarası"
                            fullWidth
                            value={documentForm.certificateNumber || ''}
                            onChange={(e) => setDocumentForm(prev => ({ ...prev, certificateNumber: e.target.value }))}
                            helperText="NDT sertifika numarası"
                          />
                          
                          <TextField
                            label="Veren Kurum"
                            fullWidth
                            value={documentForm.issuingAuthority || ''}
                            onChange={(e) => setDocumentForm(prev => ({ ...prev, issuingAuthority: e.target.value }))}
                            helperText="Örn: TÜRKAK, ASNT, PCN"
                          />
                          
                          <FormControl fullWidth>
                            <InputLabel>Önem Düzeyi</InputLabel>
                            <Select
                              value={documentForm.criticalityLevel || ''}
                              onChange={(e) => setDocumentForm(prev => ({ ...prev, criticalityLevel: e.target.value as CriticalityLevel }))}
                              label="Önem Düzeyi"
                            >
                              <MenuItem value="Kritik">Kritik</MenuItem>
                              <MenuItem value="Yüksek">Yüksek</MenuItem>
                              <MenuItem value="Orta">Orta</MenuItem>
                              <MenuItem value="Düşük">Düşük</MenuItem>
                            </Select>
                          </FormControl>
                        </>
                      )}
                      
                      {/* İSG Sertifikası için */}
                      {documentForm.type === 'İSG Sertifikası' && (
                        <>
                          <FormControl fullWidth required>
                            <InputLabel>Personel Seçimi</InputLabel>
                            <Select
                              value={documentForm.personnelName || ''}
                              onChange={(e) => {
                                const selectedPersonnel = personnelOptions.find(p => p.name === e.target.value);
                                setDocumentForm(prev => ({ 
                                  ...prev, 
                                  personnelName: e.target.value,
                                  personnelId: selectedPersonnel?.registrationNo || ''
                                }));
                              }}
                              label="Personel Seçimi"
                            >
                              {personnelOptions.map((personnel) => (
                                <MenuItem key={personnel.id} value={personnel.name}>
                                  {personnel.name} - {personnel.registrationNo} ({personnel.position})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          
                          <TextField
                            label="Sicil Numarası"
                            fullWidth
                            value={documentForm.personnelId || ''}
                            onChange={(e) => setDocumentForm(prev => ({ ...prev, personnelId: e.target.value }))}
                            InputProps={{ readOnly: true }}
                            helperText="Personel seçildiğinde otomatik doldurulur"
                          />
                          
                          <TextField
                            label="Sertifika Numarası"
                            fullWidth
                            value={documentForm.certificateNumber || ''}
                            onChange={(e) => setDocumentForm(prev => ({ ...prev, certificateNumber: e.target.value }))}
                            helperText="İSG sertifika numarası"
                          />
                          
                          <TextField
                            label="Veren Kurum"
                            fullWidth
                            value={documentForm.issuingAuthority || ''}
                            onChange={(e) => setDocumentForm(prev => ({ ...prev, issuingAuthority: e.target.value }))}
                            helperText="Örn: İSGÜM, Çalışma Bakanlığı"
                          />
                          
                          <TextField
                            label="Eğitim Saati"
                            type="number"
                            fullWidth
                            value={documentForm.trainingHours || ''}
                            onChange={(e) => setDocumentForm(prev => ({ ...prev, trainingHours: parseInt(e.target.value) || 0 }))}
                            helperText="Toplam eğitim süresi (saat)"
                          />
                          
                          <TextField
                            label="Sınav Sonucu"
                            fullWidth
                            value={documentForm.examResult || ''}
                            onChange={(e) => setDocumentForm(prev => ({ ...prev, examResult: e.target.value }))}
                            helperText="Örn: Başarılı, 85/100"
                          />
                          
                          <FormControl fullWidth>
                            <InputLabel>Önem Düzeyi</InputLabel>
                            <Select
                              value={documentForm.criticalityLevel || ''}
                              onChange={(e) => setDocumentForm(prev => ({ ...prev, criticalityLevel: e.target.value as CriticalityLevel }))}
                              label="Önem Düzeyi"
                            >
                              <MenuItem value="Kritik">Kritik</MenuItem>
                              <MenuItem value="Yüksek">Yüksek</MenuItem>
                              <MenuItem value="Orta">Orta</MenuItem>
                              <MenuItem value="Düşük">Düşük</MenuItem>
                            </Select>
                          </FormControl>
                        </>
                      )}
                      
                      {/* Yetki Belgesi için */}
                      {documentForm.type === 'Yetki Belgesi' && (
                        <>
                          <FormControl fullWidth required>
                            <InputLabel>Personel Seçimi</InputLabel>
                            <Select
                              value={documentForm.personnelName || ''}
                              onChange={(e) => {
                                const selectedPersonnel = personnelOptions.find(p => p.name === e.target.value);
                                setDocumentForm(prev => ({ 
                                  ...prev, 
                                  personnelName: e.target.value,
                                  personnelId: selectedPersonnel?.registrationNo || ''
                                }));
                              }}
                              label="Personel Seçimi"
                            >
                              {personnelOptions.map((personnel) => (
                                <MenuItem key={personnel.id} value={personnel.name}>
                                  {personnel.name} - {personnel.registrationNo} ({personnel.position})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          
                          <TextField
                            label="Sicil Numarası"
                            fullWidth
                            value={documentForm.personnelId || ''}
                            onChange={(e) => setDocumentForm(prev => ({ ...prev, personnelId: e.target.value }))}
                            InputProps={{ readOnly: true }}
                            helperText="Personel seçildiğinde otomatik doldurulur"
                          />
                          
                          <TextField
                            label="Yetki Belge Numarası"
                            fullWidth
                            value={documentForm.certificateNumber || ''}
                            onChange={(e) => setDocumentForm(prev => ({ ...prev, certificateNumber: e.target.value }))}
                            helperText="Yetki belgesi numarası"
                          />
                          
                          <TextField
                            label="Veren Kurum"
                            fullWidth
                            value={documentForm.issuingAuthority || ''}
                            onChange={(e) => setDocumentForm(prev => ({ ...prev, issuingAuthority: e.target.value }))}
                            helperText="Yetkiyi veren kurum"
                          />
                          
                          <FormControl fullWidth>
                            <InputLabel>Önem Düzeyi</InputLabel>
                            <Select
                              value={documentForm.criticalityLevel || ''}
                              onChange={(e) => setDocumentForm(prev => ({ ...prev, criticalityLevel: e.target.value as CriticalityLevel }))}
                              label="Önem Düzeyi"
                            >
                              <MenuItem value="Kritik">Kritik</MenuItem>
                              <MenuItem value="Yüksek">Yüksek</MenuItem>
                              <MenuItem value="Orta">Orta</MenuItem>
                              <MenuItem value="Düşük">Düşük</MenuItem>
                            </Select>
                          </FormControl>
                        </>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* Step 1: Details and Content */}
            {activeStep === 1 && (
              <Box sx={{ display: 'grid', gap: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Doküman Detayları
                </Typography>
                
                <TextField
                  label="Açıklama"
                  multiline
                  rows={4}
                  fullWidth
                  value={documentForm.description || ''}
                  onChange={(e) => setDocumentForm(prev => ({ ...prev, description: e.target.value }))}
                  helperText="Dokümanın içeriği ve amacı hakkında detaylı bilgi"
                />
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <TextField
                    label="Revizyon Numarası"
                    type="number"
                    inputProps={{ min: 1 }}
                    fullWidth
                    value={documentForm.revisionNo || 1}
                    onChange={(e) => setDocumentForm(prev => ({ ...prev, revisionNo: parseInt(e.target.value) || 1 }))}
                  />
                  
                  <TextField
                    label="Son Geçerlilik Tarihi"
                    type="date"
                    fullWidth
                    value={documentForm.expiryDate || ''}
                    onChange={(e) => setDocumentForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    helperText="İsteğe bağlı"
                  />
                </Box>
                
                <TextField
                  label="Anahtar Kelimeler"
                  fullWidth
                  value={documentForm.keywords?.join(', ') || ''}
                  onChange={(e) => setDocumentForm(prev => ({ 
                    ...prev, 
                    keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                  }))}
                  helperText="Virgülle ayırarak girin (örn: kaynak, çelik, prosedür)"
                />
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Durum</InputLabel>
                    <Select
                      value={documentForm.status || 'draft'}
                      onChange={(e) => setDocumentForm(prev => ({ ...prev, status: e.target.value as DocumentStatus }))}
                      label="Durum"
                    >
                      <MenuItem value="draft">Taslak</MenuItem>
                      <MenuItem value="review">İnceleme</MenuItem>
                      <MenuItem value="active">Aktif</MenuItem>
                      <MenuItem value="obsolete">Geçersiz</MenuItem>
                      <MenuItem value="archived">Arşivlenmiş</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth>
                    <InputLabel>Onay Durumu</InputLabel>
                    <Select
                      value={documentForm.approvalStatus || 'pending'}
                      onChange={(e) => setDocumentForm(prev => ({ ...prev, approvalStatus: e.target.value as ApprovalStatus }))}
                      label="Onay Durumu"
                    >
                      <MenuItem value="pending">Bekliyor</MenuItem>
                      <MenuItem value="approved">Onaylandı</MenuItem>
                      <MenuItem value="rejected">Reddedildi</MenuItem>
                      <MenuItem value="revision_required">Revizyon Gerekli</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ border: '2px dashed', borderColor: 'primary.main', borderRadius: 2, p: 3, textAlign: 'center' }}>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Dosya Yükle
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    PDF, DOC, DOCX formatlarında dosya yükleyebilirsiniz
                  </Typography>
                  <Button variant="outlined" component="label">
                    Dosya Seç
                    <input type="file" hidden accept=".pdf,.doc,.docx" />
                  </Button>
                </Box>
              </Box>
            )}

            {/* Step 2: Review and Completion */}
            {activeStep === 2 && (
              <Box sx={{ display: 'grid', gap: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Doküman Özeti ve Onay
                </Typography>
                
                <Alert severity="info">
                  Lütfen doküman bilgilerini kontrol edin ve doğruluğundan emin olun.
                </Alert>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                      Doküman Bilgileri
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 1 }}>
                      <Typography><strong>Ad:</strong> {documentForm.name}</Typography>
                      <Typography><strong>Numara:</strong> {documentForm.number}</Typography>
                      <Typography><strong>Tip:</strong> {documentForm.type}</Typography>
                      <Typography><strong>Birim:</strong> {documentForm.unit}</Typography>
                      <Typography><strong>Sahip:</strong> {documentForm.owner}</Typography>
                      <Typography><strong>Yürürlük:</strong> {documentForm.effectiveDate}</Typography>
                      <Typography><strong>Revizyon:</strong> {documentForm.revisionNo}</Typography>
                      {documentForm.expiryDate && (
                        <Typography><strong>Geçerlilik:</strong> {documentForm.expiryDate}</Typography>
                      )}
                      {documentForm.description && (
                        <Typography><strong>Açıklama:</strong> {documentForm.description}</Typography>
                      )}
                      {documentForm.keywords && documentForm.keywords.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography component="span"><strong>Anahtar Kelimeler:</strong> </Typography>
                          {documentForm.keywords.map((keyword, index) => (
                            <Chip key={index} label={keyword} size="small" variant="outlined" sx={{ ml: 0.5 }} />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
                
                <FormControlLabel
                  control={<Checkbox />}
                  label="Doküman bilgilerinin doğruluğunu onaylıyorum ve onay sürecine göndermek istiyorum."
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button onClick={() => setOpenDialog(false)} size="large">
              İptal
            </Button>
            {activeStep > 0 && (
              <Button 
                onClick={() => setActiveStep(activeStep - 1)} 
                size="large"
                startIcon={<EditIcon />}
              >
                Geri
              </Button>
            )}
            {activeStep < 2 ? (
              <Button
                variant="contained"
                onClick={() => setActiveStep(activeStep + 1)}
                disabled={
                  activeStep === 0 && (!documentForm.name || !documentForm.number || !documentForm.type || !documentForm.unit || !documentForm.owner)
                }
                size="large"
                endIcon={<EditIcon />}
              >
                İleri
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="success" 
                size="large"
                startIcon={<CheckCircleIcon />}
                onClick={handleSaveDocument}
              >
                Kaydet ve Onaya Gönder
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog
          open={viewDialog}
          onClose={handleCloseViewDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedDocumentForView ? <DescriptionIcon /> : 
             selectedCertificateForView ? <CertificateIcon /> :
             selectedPersonnelDocumentForView ? <BadgeIcon /> : <DescriptionIcon />}
            {selectedDocumentForView ? 'Doküman Detayları' : 
             selectedCertificateForView ? 'Sertifika Detayları' :
             selectedPersonnelDocumentForView ? 'Personel Belgesi Detayları' : 'Detaylar'}
          </DialogTitle>
          <DialogContent dividers>
            {selectedDocumentForView && (
              <Box sx={{ display: 'grid', gap: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Temel Bilgiler
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Doküman Adı:</Typography>
                        <Typography variant="body1" fontWeight={600}>{selectedDocumentForView.name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Doküman Numarası:</Typography>
                        <Typography variant="body1">{selectedDocumentForView.number}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Tip:</Typography>
                        <StatusChip label={selectedDocumentForView.type} statustype="active" size="small" />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Birim:</Typography>
                        <Typography variant="body1">{selectedDocumentForView.unit}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Revizyon No:</Typography>
                        <Chip label={`Rev ${selectedDocumentForView.revisionNo}`} variant="outlined" size="small" />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Sahip:</Typography>
                        <Typography variant="body1">{selectedDocumentForView.owner}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Durum Bilgileri
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Durum:</Typography>
                        <StatusChip 
                          label={selectedDocumentForView.status === 'active' ? 'Aktif' : 'Taslak'} 
                          statustype={selectedDocumentForView.status} 
                          size="small" 
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Onay Durumu:</Typography>
                        <StatusChip 
                          label={selectedDocumentForView.approvalStatus === 'approved' ? 'Onaylandı' : 'Bekliyor'} 
                          statustype={selectedDocumentForView.approvalStatus} 
                          size="small" 
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Yürürlük Tarihi:</Typography>
                        <Typography variant="body1">{selectedDocumentForView.effectiveDate}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Son Geçerlilik:</Typography>
                        <Typography variant="body1">{selectedDocumentForView.expiryDate || 'Belirtilmemiş'}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {selectedDocumentForView.description && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Açıklama
                      </Typography>
                      <Typography variant="body1">{selectedDocumentForView.description}</Typography>
                    </CardContent>
                  </Card>
                )}

                {selectedDocumentForView.keywords && selectedDocumentForView.keywords.length > 0 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Anahtar Kelimeler
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedDocumentForView.keywords.map((keyword, index) => (
                          <Chip key={index} label={keyword} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}

            {selectedCertificateForView && (
              <Box sx={{ display: 'grid', gap: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Kaynakçı Bilgileri
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Kaynakçı Adı:</Typography>
                        <Typography variant="body1" fontWeight={600}>{selectedCertificateForView.welderName}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Sicil No:</Typography>
                        <Typography variant="body1">{selectedCertificateForView.registrationNo}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Departman:</Typography>
                        <Typography variant="body1">{selectedCertificateForView.department}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Durum:</Typography>
                        <StatusChip 
                          label={selectedCertificateForView.status === 'active' ? 'Aktif' : 'Pasif'} 
                          statustype={selectedCertificateForView.status} 
                          size="small" 
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Sertifika Bilgileri
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Sertifika Tipi:</Typography>
                        <StatusChip label={selectedCertificateForView.certificateType} statustype="active" size="small" />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Sertifika No:</Typography>
                        <Typography variant="body1">{selectedCertificateForView.certificateNumber}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Veren Kurum:</Typography>
                        <Typography variant="body1">{selectedCertificateForView.issuingAuthority}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Geçerlilik Süresi:</Typography>
                        <Typography variant="body1">
                          {selectedCertificateForView.validityDate} - {selectedCertificateForView.expiryDate}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Teknik Detaylar
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Kaynak Prosesleri:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {selectedCertificateForView.weldingProcess.map((process, index) => (
                            <Chip key={index} label={process} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Malzeme Grupları:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {selectedCertificateForView.materialGroup.map((material, index) => (
                            <Chip key={index} label={material} size="small" variant="outlined" color="primary" />
                          ))}
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Kaynak Pozisyonları:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {selectedCertificateForView.weldingPosition.map((position, index) => (
                            <Chip key={index} label={position} size="small" variant="outlined" color="secondary" />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}

            {selectedPersonnelDocumentForView && (
              <Box sx={{ display: 'grid', gap: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Personel Bilgileri
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Personel Adı:</Typography>
                        <Typography variant="body1" fontWeight={600}>{selectedPersonnelDocumentForView.personnelName}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Sicil No:</Typography>
                        <Typography variant="body1">{selectedPersonnelDocumentForView.personnelId}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">TC Kimlik No:</Typography>
                        <Typography variant="body1">{selectedPersonnelDocumentForView.nationalId}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Departman:</Typography>
                        <Typography variant="body1">{selectedPersonnelDocumentForView.department}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Pozisyon:</Typography>
                        <Typography variant="body1">{selectedPersonnelDocumentForView.position}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Durum:</Typography>
                        <Chip
                          label={
                            selectedPersonnelDocumentForView.status === 'active' ? 'Aktif' : 
                            selectedPersonnelDocumentForView.status === 'expired' ? 'Süresi Dolmuş' :
                            selectedPersonnelDocumentForView.status === 'pending_renewal' ? 'Yenileme Bekliyor' :
                            selectedPersonnelDocumentForView.status === 'suspended' ? 'Askıya Alındı' : 'İptal'
                          }
                          size="small"
                          color={
                            selectedPersonnelDocumentForView.status === 'active' ? 'success' :
                            selectedPersonnelDocumentForView.status === 'expired' ? 'error' :
                            selectedPersonnelDocumentForView.status === 'pending_renewal' ? 'warning' :
                            selectedPersonnelDocumentForView.status === 'suspended' ? 'info' : 'default'
                          }
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Belge Bilgileri
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Belge Kategorisi:</Typography>
                        <Chip label={selectedPersonnelDocumentForView.documentCategory} size="small" color="primary" variant="outlined" />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Belge Tipi:</Typography>
                        <Typography variant="body1">{selectedPersonnelDocumentForView.documentType}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Sertifika No:</Typography>
                        <Typography variant="body1" fontWeight={600}>{selectedPersonnelDocumentForView.certificateNumber}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Veren Kurum:</Typography>
                        <Typography variant="body1">{selectedPersonnelDocumentForView.issuingAuthority}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Veriliş Tarihi:</Typography>
                        <Typography variant="body1">{new Date(selectedPersonnelDocumentForView.issueDate).toLocaleDateString('tr-TR')}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Geçerlilik Süresi:</Typography>
                        <Typography variant="body1">
                          {new Date(selectedPersonnelDocumentForView.validityDate).toLocaleDateString('tr-TR')} - {new Date(selectedPersonnelDocumentForView.expiryDate).toLocaleDateString('tr-TR')}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Eğitim ve Değerlendirme
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Eğitim Saati:</Typography>
                        <Typography variant="body1">{selectedPersonnelDocumentForView.trainingHours || 'Belirtilmemiş'} saat</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Sınav Sonucu:</Typography>
                        <Typography variant="body1">{selectedPersonnelDocumentForView.examResult || 'Belirtilmemiş'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Önem Düzeyi:</Typography>
                        <Chip
                          label={selectedPersonnelDocumentForView.criticalityLevel}
                          size="small"
                          color={
                            selectedPersonnelDocumentForView.criticalityLevel === 'Kritik' ? 'error' :
                            selectedPersonnelDocumentForView.criticalityLevel === 'Yüksek' ? 'warning' :
                            selectedPersonnelDocumentForView.criticalityLevel === 'Orta' ? 'info' : 'success'
                          }
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Yetkili:</Typography>
                        <Typography variant="body1">{selectedPersonnelDocumentForView.authorizedBy}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {selectedPersonnelDocumentForView.notes && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Notlar
                      </Typography>
                      <Typography variant="body1">{selectedPersonnelDocumentForView.notes}</Typography>
                    </CardContent>
                  </Card>
                )}

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Yenileme Bilgileri
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Yenileme Gerekli:</Typography>
                        <Chip
                          label={selectedPersonnelDocumentForView.renewalRequired ? 'Evet' : 'Hayır'}
                          size="small"
                          color={selectedPersonnelDocumentForView.renewalRequired ? 'warning' : 'success'}
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Yükleme Tarihi:</Typography>
                        <Typography variant="body1">{new Date(selectedPersonnelDocumentForView.uploadDate).toLocaleDateString('tr-TR')}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewDialog}>
              Kapat
            </Button>
            {selectedDocumentForView && (
              <>
                <Button 
                  startIcon={<DownloadIcon />} 
                  onClick={() => handleDownloadDocument(selectedDocumentForView.id)}
                >
                  İndir
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<EditIcon />}
                  onClick={() => {
                    handleCloseViewDialog();
                    handleEditDocument(selectedDocumentForView.id);
                  }}
                >
                  Düzenle
                </Button>
              </>
            )}
            {selectedCertificateForView && (
              <>
                <Button 
                  startIcon={<DownloadIcon />} 
                  onClick={() => handleDownloadWelderCertificate(selectedCertificateForView.id)}
                >
                  İndir
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<EditIcon />}
                  onClick={() => {
                    handleCloseViewDialog();
                    handleEditWelderCertificate(selectedCertificateForView.id);
                  }}
                >
                  Düzenle
                </Button>
              </>
            )}
            {selectedPersonnelDocumentForView && (
              <>
                <Button 
                  startIcon={<DownloadIcon />} 
                  onClick={() => handleDownloadPersonnelDocument(selectedPersonnelDocumentForView.id)}
                >
                  İndir
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<EditIcon />}
                  onClick={() => {
                    handleCloseViewDialog();
                    handleEditPersonnelDocument(selectedPersonnelDocumentForView.id);
                  }}
                >
                  Düzenle
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Edit Personnel Document Dialog */}
        <Dialog
          open={editPersonnelDialog}
          onClose={() => {
            setEditPersonnelDialog(false);
            setSelectedPersonnelDocumentForEdit(null);
          }}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon />
            Personel Belgesi Düzenle
          </DialogTitle>
          <DialogContent>
            {selectedPersonnelDocumentForEdit && (
              <Box sx={{ display: 'grid', gap: 3, mt: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Personel Adı"
                    defaultValue={selectedPersonnelDocumentForEdit.personnelName}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Sicil No"
                    defaultValue={selectedPersonnelDocumentForEdit.personnelId}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="TC Kimlik No"
                    defaultValue={selectedPersonnelDocumentForEdit.nationalId}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Pozisyon"
                    defaultValue={selectedPersonnelDocumentForEdit.position}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Departman"
                    defaultValue={selectedPersonnelDocumentForEdit.department}
                    variant="outlined"
                  />
                  <FormControl fullWidth>
                    <InputLabel>Belge Kategorisi</InputLabel>
                    <Select
                      defaultValue={selectedPersonnelDocumentForEdit.documentCategory}
                      label="Belge Kategorisi"
                    >
                      <MenuItem value="Kaynakçı Belgeleri">Kaynakçı Belgeleri</MenuItem>
                      <MenuItem value="NDT Sertifikaları">NDT Sertifikaları</MenuItem>
                      <MenuItem value="İSG Belgeleri">İSG Belgeleri</MenuItem>
                      <MenuItem value="Yetki Belgeleri">Yetki Belgeleri</MenuItem>
                      <MenuItem value="Operatör Belgeleri">Operatör Belgeleri</MenuItem>
                      <MenuItem value="Eğitim Sertifikaları">Eğitim Sertifikaları</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Belge Tipi"
                    defaultValue={selectedPersonnelDocumentForEdit.documentType}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Sertifika No"
                    defaultValue={selectedPersonnelDocumentForEdit.certificateNumber}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Veren Kurum"
                    defaultValue={selectedPersonnelDocumentForEdit.issuingAuthority}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Veriliş Tarihi"
                    type="date"
                    defaultValue={selectedPersonnelDocumentForEdit.issueDate}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="Geçerlilik Başlangıç"
                    type="date"
                    defaultValue={selectedPersonnelDocumentForEdit.validityDate}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="Geçerlilik Bitiş"
                    type="date"
                    defaultValue={selectedPersonnelDocumentForEdit.expiryDate}
                    InputLabelProps={{ shrink: true }}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Önem Düzeyi</InputLabel>
                    <Select
                      defaultValue={selectedPersonnelDocumentForEdit.criticalityLevel}
                      label="Önem Düzeyi"
                    >
                      <MenuItem value="Kritik">Kritik</MenuItem>
                      <MenuItem value="Yüksek">Yüksek</MenuItem>
                      <MenuItem value="Orta">Orta</MenuItem>
                      <MenuItem value="Düşük">Düşük</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Durum</InputLabel>
                    <Select
                      defaultValue={selectedPersonnelDocumentForEdit.status}
                      label="Durum"
                    >
                      <MenuItem value="active">Aktif</MenuItem>
                      <MenuItem value="expired">Süresi Dolmuş</MenuItem>
                      <MenuItem value="suspended">Askıya Alındı</MenuItem>
                      <MenuItem value="pending_renewal">Yenileme Bekliyor</MenuItem>
                      <MenuItem value="cancelled">İptal</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Eğitim Saati"
                    type="number"
                    defaultValue={selectedPersonnelDocumentForEdit.trainingHours || ''}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Sınav Sonucu"
                    defaultValue={selectedPersonnelDocumentForEdit.examResult || ''}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Yetkili"
                    defaultValue={selectedPersonnelDocumentForEdit.authorizedBy}
                    variant="outlined"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={selectedPersonnelDocumentForEdit.renewalRequired}
                      />
                    }
                    label="Yenileme Gerekli"
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Notlar"
                  multiline
                  rows={3}
                  defaultValue={selectedPersonnelDocumentForEdit.notes}
                  variant="outlined"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setEditPersonnelDialog(false);
                setSelectedPersonnelDocumentForEdit(null);
              }}
            >
              İptal
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                setSnackbar({ open: true, message: 'Personel belgesi başarıyla güncellendi!', severity: 'success' });
                setEditPersonnelDialog(false);
                setSelectedPersonnelDocumentForEdit(null);
              }}
            >
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
   );
 };
 
 export default DocumentManagement; 