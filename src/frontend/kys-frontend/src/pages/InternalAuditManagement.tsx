import React, { useState, useEffect } from 'react';
// TypeScript re-analysis force
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Snackbar,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Badge,
  Divider,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  OutlinedInput,
  InputAdornment,
  ListSubheader,
  Switch,
  Autocomplete
} from '@mui/material';

import {
  Add as AddIcon,
  Assignment as AuditIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  WarningAmber as WarningAmberIcon,
  TrendingUp as TrendingUpIcon,
  ShowChart as ShowChartIcon,
  Dashboard as DashboardIcon,
  Report as ReportIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  Timeline as TimelineIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Event as EventIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  AttachFile as AttachIcon,
  Camera as CameraIcon,
  Verified as VerifiedIcon,
  PendingActions as PendingIcon,
  AccessTime as ClockIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  BusinessCenter as DepartmentIcon,
  Description as DescriptionIcon,
  DateRange as DateRangeIcon,
  Group as TeamIcon,
  Assignment as ProcessIcon,
  Security as StandardIcon,
  Flag as PriorityIcon,
  Numbers as NumbersIcon,
  Category as CategoryIcon,
  Article as ArticleIcon,
  Assignment as AssignmentIcon,
  FindInPage as FindInPageIcon,
  LocationOn as LocationOnIcon,
  // Yeni icon'lar - Soru Listesi Sistemi için
  Quiz as QuizIcon,
  QuestionAnswer as QuestionIcon,
  Checklist as ChecklistIcon,
  PlaylistAddCheck as PlaylistIcon,
  FormatListBulleted as ListIcon,
  ReportGmailerrorred as NonConformityIcon,
  ContentCopy as CopyIcon,
  Build as BuildIcon,
  Create as CreateIcon,
  AccessTime as TimeIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';

import { styled } from '@mui/material/styles';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  ...(status === 'completed' && {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  }),
  ...(status === 'in_progress' && {
    backgroundColor: '#fff3e0',
    color: '#ef6c00',
  }),
  ...(status === 'planned' && {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
  }),
  ...(status === 'overdue' && {
    backgroundColor: '#ffebee',
    color: '#c62828',
  }),
}));

const PriorityChip = styled(Chip)<{ priority: string }>(({ theme, priority }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  ...(priority === 'low' && {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  }),
  ...(priority === 'medium' && {
    backgroundColor: '#fff3e0',
    color: '#ef6c00',
  }),
  ...(priority === 'high' && {
    backgroundColor: '#ffebee',
    color: '#c62828',
  }),
  ...(priority === 'critical' && {
    backgroundColor: '#f3e5f5',
    color: '#7b1fa2',
  }),
}));

// Basic interfaces
interface AuditPlan {
  id: string;
  title: string;
  description: string;
  auditType: 'internal' | 'cross' | 'supplier' | 'process' | 'document' | 'system';
  scope: string[];
  department: string;
  process: string[];
  plannedDate: string;
  duration: number;
  status: 'planned' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  auditorTeam: AuditorMember[];
  auditees: string[];
  standards: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdBy: string;
  createdDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  findings?: Finding[];
  actions?: Action[];
}

interface AuditorMember {
  id: string;
  name: string;
  role: 'lead_auditor' | 'auditor' | 'observer' | 'technical_expert';
  qualifications: string[];
  department: string;
  email: string;
  isActive: boolean;
}

interface Finding {
  id: string;
  auditId: string;
  findingNumber: string;
  type: 'nonconformity' | 'improvement_opportunity' | 'positive_finding' | 'observation';
  severity: 'major' | 'minor' | 'observation';
  category: string;
  clause: string;
  requirement: string;
  description: string;
  evidence: string;
  location: string;
  department: string;
  process: string;
  discoveredDate: string;
  discoveredBy: string;
  status: 'open' | 'action_assigned' | 'in_progress' | 'verification_pending' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  actions: Action[];
}

interface Action {
  id: string;
  findingId: string;
  auditId: string;
  actionType: 'corrective' | 'preventive' | 'improvement';
  description: string;
  responsible: string;
  targetDate: string;
  actualCompletionDate?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue' | 'verified';
  progress: number;
  verificationRequired: boolean;
}

interface AuditMetrics {
  totalAudits: number;
  completedAudits: number;
  onTimeCompletion: number;
  totalFindings: number;
  findingsByType: { [key: string]: number };
  findingsBySeverity: { [key: string]: number };
  openActions: number;
  overdueActions: number;
  actionCompletionRate: number;
  departmentPerformance: { [key: string]: number };
}

// YENİ INTERFACE'LER - Birim Bazlı Soru Listesi Sistemi
interface AuditQuestion {
  id: string;
  questionNumber: string;
  questionText: string;
  category: 'iso9001' | 'iso14001' | 'iso45001' | 'ts3834' | 'general' | 'process_specific';
  subcategory: string;
  standardClause: string;  // ISO standardı madde numarası
  department: string;
  process: string[];
  answerType: 'yes_no' | 'yes_no_partial' | 'rating' | 'text' | 'multiple_choice';
  answerOptions?: string[];  // Multiple choice için seçenekler
  isRequired: boolean;
  isCritical: boolean;  // Kritik sorular için uygunsuzluk açma zorunlu
  weight: number;  // Soru ağırlığı (1-5)
  expectedAnswer: string;  // Beklenen cevap
  guidelines: string;  // Denetçi için rehber notlar
  evidence: string[];  // Kanıt türleri
  createdBy: string;
  createdDate: string;
  lastModified: string;
  version: string;
  isActive: boolean;
}

interface DepartmentQuestionSet {
  id: string;
  departmentId: string;
  departmentName: string;
  version: string;
  effectiveDate: string;
  createdBy: string;
  questions: AuditQuestion[];
  isActive: boolean;
  description: string;
  estimatedDuration: number;  // Dakika cinsinden
  completionRate?: number;
}

interface AuditForm {
  id: string;
  auditId: string;
  departmentId: string;
  formName: string;
  auditorName: string;
  auditDate: string;
  startTime: string;
  endTime: string;
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed';
  questionResponses: QuestionResponse[];
  overallScore: number;
  completionPercentage: number;
  nonConformitiesCount: number;
  improvementOpportunitiesCount: number;
  notes: string;
  attachments: string[];
  createdDate: string;
  submittedDate?: string;
  reviewedBy?: string;
  reviewedDate?: string;
}

interface QuestionResponse {
  questionId: string;
  answer: string;
  answerType: 'conform' | 'non_conform' | 'partial' | 'not_applicable' | 'improvement';
  score: number;  // 0-5 arası puan
  evidence: string;
  notes: string;
  attachments: string[];
  nonConformityCreated?: boolean;
  nonConformityId?: string;
  answeredBy: string;
  answeredDate: string;
  verifiedBy?: string;
  verifiedDate?: string;
}

interface QuestionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  applicableDepartments: string[];
  questions: AuditQuestion[];
  createdBy: string;
  createdDate: string;
  isPublic: boolean;
}

const InternalAuditManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [auditPlans, setAuditPlans] = useState<AuditPlan[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [auditors, setAuditors] = useState<AuditorMember[]>([]);
  const [metrics, setMetrics] = useState<AuditMetrics | null>(null);
  
  // YENİ STATE'LER - Soru Listesi Sistemi
  const [questionSets, setQuestionSets] = useState<DepartmentQuestionSet[]>([]);
  const [auditForms, setAuditForms] = useState<AuditForm[]>([]);
  const [questionTemplates, setQuestionTemplates] = useState<QuestionTemplate[]>([]);
  const [activeQuestionSet, setActiveQuestionSet] = useState<DepartmentQuestionSet | null>(null);
  const [activeAuditForm, setActiveAuditForm] = useState<AuditForm | null>(null);
  
  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'plan' | 'finding' | 'action' | 'auditor' | 'question' | 'form' | 'template'>('plan');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // YENİ DIALOG STATE'LERİ - Soru Sistemi
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [questionFormMode, setQuestionFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedQuestion, setSelectedQuestion] = useState<AuditQuestion | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [auditFormMode, setAuditFormMode] = useState<'conduct' | 'review' | 'view'>('conduct');
  
  // Soru Listesi Dialog State'leri
  const [questionSetDialogOpen, setQuestionSetDialogOpen] = useState(false);
  const [questionViewDialogOpen, setQuestionViewDialogOpen] = useState(false);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState<DepartmentQuestionSet | null>(null);
  const [questionSetFormData, setQuestionSetFormData] = useState({
    departmentName: '',
    description: '',
    estimatedDuration: 60,
    questions: [] as AuditQuestion[]
  });

  // Denetim Formu State'leri
  const [auditFormDialogOpen, setAuditFormDialogOpen] = useState(false);
  const [currentAuditForm, setCurrentAuditForm] = useState<AuditForm | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [auditStartTime, setAuditStartTime] = useState<string>('');
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form States
  const [formStep, setFormStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    auditType: 'internal' as 'internal' | 'cross' | 'supplier' | 'process' | 'document' | 'system',
    scope: [] as string[],
    department: '',
    process: [] as string[],
    plannedDate: '',
    duration: 8,
    auditorTeam: [] as AuditorMember[],
    auditees: [] as string[],
    standards: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    // Finding specific fields
    findingNumber: '',
    type: 'nonconformity' as 'nonconformity' | 'improvement_opportunity' | 'positive_finding' | 'observation',
    severity: 'minor' as 'major' | 'minor' | 'observation',
    category: '',
    clause: '',
    requirement: '',
    evidence: '',
    location: '',
    discoveredDate: '',
    discoveredBy: '',
    // Action specific fields
    actionNumber: '',
    actionType: 'corrective' as 'corrective' | 'preventive' | 'improvement',
    actionDescription: '',
    responsible: '',
    targetDate: '',
    verificationRequired: true,
    verificationMethod: '',
    verificationDate: '',
    verificationBy: '',
    resources: '',
    budget: 0,
    expectedResult: '',
    riskAssessment: '',
    successCriteria: ''
  });
  
  // Constants for dropdowns
  const departments = [
    'Kalite', 'Üretim', 'Satın Alma', 'İnsan Kaynakları', 'Finans', 
    'Ar-Ge', 'Pazarlama', 'Satış', 'Bilgi İşlem', 'Çevre', 'İSG'
  ];
  
  const auditTypes = [
    { value: 'internal', label: 'İç Tetkik' },
    { value: 'cross', label: 'Çapraz Tetkik' },
    { value: 'supplier', label: 'Tedarikçi Tetkiki' },
    { value: 'process', label: 'Süreç Tetkiki' },
    { value: 'document', label: 'Doküman Tetkiki' },
    { value: 'system', label: 'Sistem Tetkiki' }
  ];
  
  const standardsList = [
    'ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018', 'ISO 27001:2013',
    'IATF 16949:2016', 'TS 3834-2', 'EN 1090', 'ISO 50001:2018',
    'ISO 17025:2017', 'AS9100D', 'ISO 13485:2016'
  ];
  
  const processList = [
    'Kaynak İşlemleri', 'Montaj', 'Test ve Kontrol', 'Kalite Kontrol',
    'Depo Yönetimi', 'Sevkiyat', 'Satın Alma', 'Tedarikçi Yönetimi',
    'İnsan Kaynakları', 'Eğitim', 'Dokümantasyon', 'Bakım',
    'Planlama', 'Tasarım', 'Ar-Ge', 'Müşteri İlişkileri'
  ];
  
  const scopeList = [
    'Üretim Planlama', 'Kalite Kontrol', 'Depo Yönetimi', 'Sevkiyat',
    'Tedarikçi Değerlendirme', 'Satın Alma Süreci', 'İnsan Kaynakları',
    'Eğitim Yönetimi', 'Doküman Kontrolü', 'Bakım Planlaması',
    'Çevre Politikası', 'Atık Yönetimi', 'Emisyon Kontrolü', 'İSG',
    'Risk Yönetimi', 'Müşteri Memnuniyeti'
  ];

  // Sample Data
  useEffect(() => {
    initializeSampleData();
    initializeQuestionSets();
  }, []);

  const initializeSampleData = () => {
    // Sample audit plans
    const samplePlans: AuditPlan[] = [
      {
        id: '1',
        title: 'Q1 2024 İç Tetkik - Üretim Departmanı',
        description: 'Üretim süreçlerinin ISO 9001:2015 gerekliliklerine uygunluk tetkiki',
        auditType: 'internal',
        scope: ['Üretim Planlama', 'Kalite Kontrol', 'Depo Yönetimi'],
        department: 'Üretim',
        process: ['Kaynak İşlemleri', 'Montaj', 'Test ve Kontrol'],
        plannedDate: '2024-03-15',
        duration: 8,
        status: 'completed',
        auditorTeam: [
          {
            id: '1',
            name: 'Ahmet Yılmaz',
            role: 'lead_auditor',
            qualifications: ['ISO 9001 Baş Denetçi'],
            department: 'Kalite',
            email: 'ahmet.yilmaz@kademe.com',
            isActive: true
          }
        ],
        auditees: ['Mehmet Demir', 'Fatma Kaya', 'Osman Çelik'],
        standards: ['ISO 9001:2015', 'TS 3834-2'],
        priority: 'high',
        createdBy: 'Sistem',
        createdDate: '2024-01-15',
        actualStartDate: '2024-03-15',
        actualEndDate: '2024-03-15'
      },
      {
        id: '2',
        title: 'IATF 16949 Çapraz Tetkik - Satın Alma',
        description: 'Tedarikçi değerlendirme süreçlerinin IATF 16949 uygunluğu',
        auditType: 'cross',
        scope: ['Tedarikçi Değerlendirme', 'Satın Alma Süreci'],
        department: 'Satın Alma',
        process: ['Tedarikçi Seçimi', 'Sipariş Yönetimi'],
        plannedDate: '2024-04-20',
        duration: 6,
        status: 'in_progress',
        auditorTeam: [
          {
            id: '2',
            name: 'Ayşe Özkan',
            role: 'lead_auditor',
            qualifications: ['IATF 16949 Denetçi'],
            department: 'Kalite',
            email: 'ayse.ozkan@kademe.com',
            isActive: true
          }
        ],
        auditees: ['Hasan Yıldız', 'Zeynep Acar'],
        standards: ['IATF 16949:2016'],
        priority: 'medium',
        createdBy: 'Sistem',
        createdDate: '2024-02-10'
      },
      {
        id: '3',
        title: 'ISO 14001 Sistem Tetkiki - Çevre Yönetimi',
        description: 'Çevre yönetim sisteminin etkinlik değerlendirmesi',
        auditType: 'system',
        scope: ['Çevre Politikası', 'Atık Yönetimi', 'Emisyon Kontrolü'],
        department: 'Çevre',
        process: ['Atık Toplama', 'Emisyon Ölçümü'],
        plannedDate: '2024-05-10',
        duration: 4,
        status: 'planned',
        auditorTeam: [
          {
            id: '3',
            name: 'Can Erdoğan',
            role: 'auditor',
            qualifications: ['ISO 14001 Denetçi'],
            department: 'Çevre',
            email: 'can.erdogan@kademe.com',
            isActive: true
          }
        ],
        auditees: ['Elif Şahin', 'Murat Kaya'],
        standards: ['ISO 14001:2015'],
        priority: 'low',
        createdBy: 'Sistem',
        createdDate: '2024-03-05'
      }
    ];

    // Sample findings
    const sampleFindings: Finding[] = [
      {
        id: 'f1',
        auditId: '1',
        findingNumber: 'F-2024-001',
        type: 'nonconformity',
        severity: 'minor',
        category: 'Doküman Kontrolü',
        clause: '7.5.3',
        requirement: 'Dokümantasyonlu bilginin kontrolü',
        description: 'Kaynak prosedürlerinin güncel versiyonları sahada bulunmuyor.',
        evidence: 'WPS-001 dokümantının Rev.2 versiyonu kullanılırken Rev.3 yürürlükte.',
        location: 'Kaynak Atölyesi',
        department: 'Üretim',
        process: 'Kaynak İşlemleri',
        discoveredDate: '2024-03-15',
        discoveredBy: 'Ahmet Yılmaz',
        status: 'closed',
        priority: 'medium',
        actions: []
      },
      {
        id: 'f2',
        auditId: '2',
        findingNumber: 'F-2024-002',
        type: 'improvement_opportunity',
        severity: 'observation',
        category: 'Tedarikçi Yönetimi',
        clause: '8.4.2',
        requirement: 'Dış kaynak sağlanan süreçlerin kontrolü',
        description: 'Tedarikçi performans değerlendirme sistemi geliştirilebilir.',
        evidence: 'Mevcut sistem manuel, otomatik raporlama eksik.',
        location: 'Satın Alma Ofisi',
        department: 'Satın Alma',
        process: 'Tedarikçi Değerlendirme',
        discoveredDate: '2024-04-20',
        discoveredBy: 'Ayşe Özkan',
        status: 'action_assigned',
        priority: 'low',
        actions: []
      }
    ];

    // Sample actions
    const sampleActions: Action[] = [
      {
        id: 'a1',
        findingId: 'f1',
        auditId: '1',
        actionType: 'corrective',
        description: 'Güncel WPS dokümanlarının sahaya yerleştirilmesi ve eski versiyonların toplanması',
        responsible: 'Mehmet Demir',
        targetDate: '2024-03-25',
        actualCompletionDate: '2024-03-22',
        status: 'completed',
        progress: 100,
        verificationRequired: true
      },
      {
        id: 'a2',
        findingId: 'f2',
        auditId: '2',
        actionType: 'improvement',
        description: 'Tedarikçi performans değerlendirme sisteminin otomatikleştirilmesi',
        responsible: 'Hasan Yıldız',
        targetDate: '2024-06-30',
        status: 'in_progress',
        progress: 35,
        verificationRequired: false
      }
    ];

    setAuditPlans(samplePlans);
    setFindings(sampleFindings);
    setActions(sampleActions);
    setAuditors([
      {
        id: '1',
        name: 'Ahmet Yılmaz',
        role: 'lead_auditor',
        qualifications: ['ISO 9001 Baş Denetçi', 'IATF 16949 Denetçi'],
        department: 'Kalite',
        email: 'ahmet.yilmaz@kademe.com',
        isActive: true
      },
      {
        id: '2',
        name: 'Ayşe Özkan',
        role: 'lead_auditor',
        qualifications: ['IATF 16949 Denetçi', 'ISO 14001 Denetçi'],
        department: 'Kalite',
        email: 'ayse.ozkan@kademe.com',
        isActive: true
      },
      {
        id: '3',
        name: 'Can Erdoğan',
        role: 'auditor',
        qualifications: ['ISO 14001 Denetçi'],
        department: 'Çevre',
        email: 'can.erdogan@kademe.com',
        isActive: true
      }
    ]);
    
    calculateMetrics(samplePlans, sampleFindings, sampleActions);
  };

  const initializeQuestionSets = () => {
    // İnsan Kaynakları Departmanı Soru Listesi - ISO 9001:2015 Kapsamlı Tetkik
    const ikQuestions: AuditQuestion[] = [
      // 4.1 Kuruluş ve bağlamının anlaşılması
      {
        id: 'ik-q-001',
        questionNumber: '1',
        questionText: 'Süreçlere ait iç ve dış hususlar tanımlanmış mı?',
        category: 'iso9001',
        subcategory: 'Kuruluş ve bağlamının anlaşılması',
        standardClause: '4.1',
        department: 'İnsan Kaynakları',
        process: ['Süreç Yönetimi', 'Stratejik Planlama'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Süreçlere ait iç ve dış hususların tanımlandığını kontrol edin',
        evidence: ['Süreç Haritası', 'İç/Dış Husus Analizi', 'Dokümantasyon'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-002',
        questionNumber: '2',
        questionText: 'İç ve dış hususlar hakkındaki bilgiler izleniyor ve gözden geçiriliyor mu? Ne zaman ve kim tarafından gözden geçirileceği tanımlanmış mı?',
        category: 'iso9001',
        subcategory: 'Kuruluş ve bağlamının anlaşılması',
        standardClause: '4.1',
        department: 'İnsan Kaynakları',
        process: ['İzleme ve Gözden Geçirme', 'Bilgi Yönetimi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'İç ve dış hususların izleme ve gözden geçirme süreçlerini kontrol edin',
        evidence: ['Gözden Geçirme Kayıtları', 'Sorumluluk Matrisi', 'Zaman Planı'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-003',
        questionNumber: '3',
        questionText: 'KYS ile ilgili taraflar ve bu tarafların beklentileri (iç – dış) tanımlanmış mı?',
        category: 'iso9001',
        subcategory: 'İlgili tarafların ihtiyaç ve beklentilerini anlama',
        standardClause: '4.2',
        department: 'İnsan Kaynakları',
        process: ['Paydaş Yönetimi', 'İhtiyaç Analizi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'KYS ile ilgili tarafların ve beklentilerinin tanımlandığını kontrol edin',
        evidence: ['Paydaş Listesi', 'Beklenti Analizi', 'İç/Dış Taraf Matrisi'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-004',
        questionNumber: '4',
        questionText: 'İlgili taraflar ve beklentileri izleniyor ve gözden geçiriliyor mu? Gözden geçirme sıklığı, sorumlusu ve yöntemi belirlenmiş mi?',
        category: 'iso9001',
        subcategory: 'İlgili tarafların ihtiyaç ve beklentilerini anlama',
        standardClause: '4.2',
        department: 'İnsan Kaynakları',
        process: ['Paydaş Yönetimi', 'İzleme ve Değerlendirme'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'İlgili tarafların izleme ve gözden geçirme süreçlerini kontrol edin',
        evidence: ['Gözden Geçirme Planı', 'İzleme Kayıtları', 'Sorumluluk Tanımları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      // 6.1 Riskler ve fırsatlarla ilgili faaliyetler
      {
        id: 'ik-q-005',
        questionNumber: '5',
        questionText: 'Risk analiz yöntemi tanımlanmış mı?',
        category: 'iso9001',
        subcategory: 'Riskler ve fırsatlarla ilgili faaliyetler',
        standardClause: '6.1',
        department: 'İnsan Kaynakları',
        process: ['Risk Yönetimi', 'Analiz'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'Risk analiz yönteminin tanımlandığını ve uygulandığını kontrol edin',
        evidence: ['Risk Yönetim Prosedürü', 'Risk Analiz Metodolojisi', 'Risk Kayıtları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-006',
        questionNumber: '6',
        questionText: 'İç ve dış hususlar ile ilgili taraf beklentileri kapsamında riskler belirlenmiş mi? Süreçlere adapte edilmiş mi? Fırsatlar tanımlanmış mı? Risk noktaları için önlemler alınmış mı?',
        category: 'iso9001',
        subcategory: 'Riskler ve fırsatlarla ilgili faaliyetler',
        standardClause: '6.1',
        department: 'İnsan Kaynakları',
        process: ['Risk Yönetimi', 'Süreç Yönetimi', 'Fırsat Yönetimi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'Risk belirleme, süreç adaptasyonu, fırsat tanımlama ve önlem alma süreçlerini kontrol edin',
        evidence: ['Risk Matrisi', 'Fırsat Analizi', 'Önlem Planları', 'Süreç Entegrasyonu'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-007',
        questionNumber: '7',
        questionText: 'İhtiyaç duyulan süreçler tanımlanmış mı? Süreçlerin sorumluları, girdileri, çıktıları, metodları, performans kriterleri ve kaynakları belirlenmiş mi?',
        category: 'iso9001',
        subcategory: 'Süreç Yönetimi',
        standardClause: '4.4',
        department: 'İnsan Kaynakları',
        process: ['Süreç Tanımlama', 'Süreç Yönetimi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'Süreç tanımlamaları ve tüm süreç bileşenlerinin belirlendiğini kontrol edin',
        evidence: ['Süreç Haritası', 'Süreç Tanımları', 'Sorumluluk Matrisi', 'Performans Kriterleri'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-008',
        questionNumber: '8',
        questionText: 'Süreçlerin etkinlik ve verimlilik göstergeleri tanımlanmış mı? Üst yönetim YGG toplantılarında bu kriterleri gözden geçiriyor mu?',
        category: 'iso9001',
        subcategory: 'Süreç Performansı',
        standardClause: '4.4',
        department: 'İnsan Kaynakları',
        process: ['Performans Yönetimi', 'Üst Yönetim Gözden Geçirmesi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Süreç performans göstergelerini ve üst yönetim gözden geçirmelerini kontrol edin',
        evidence: ['Performans Göstergeleri', 'YGG Toplantı Kayıtları', 'Gözden Geçirme Raporları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-009',
        questionNumber: '9',
        questionText: 'Süreç sahipleri tanımlı mı? Rollerini anlamış ve yerine getirmeye yetkili mi? Görev tanımlarında bu bilgiler mevcut mu?',
        category: 'iso9001',
        subcategory: 'Süreç Sahipliği',
        standardClause: '5.3',
        department: 'İnsan Kaynakları',
        process: ['Süreç Yönetimi', 'Yetki ve Sorumluluk'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Süreç sahiplerinin tanımlı olduğunu ve yetkilerinin belirlendiğini kontrol edin',
        evidence: ['Süreç Sahipliği Matrisi', 'Görev Tanımları', 'Yetki Belgeleri'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-010',
        questionNumber: '10',
        questionText: 'Yetki ve sorumluluklar açıkça belirlenmiş mi? Vekalet durumları tanımlanmış mı?',
        category: 'iso9001',
        subcategory: 'Yetki ve Sorumluluk',
        standardClause: '5.3',
        department: 'İnsan Kaynakları',
        process: ['Organizasyon Yapısı', 'Yetki Devri'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Yetki ve sorumlulukların açık olduğunu ve vekalet durumlarının tanımlandığını kontrol edin',
        evidence: ['Yetki Matrisi', 'Sorumluluk Tanımları', 'Vekalet Prosedürü'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      // 7.1.2 İnsan kaynakları
      {
        id: 'ik-q-011',
        questionNumber: '11',
        questionText: 'KYS nin etkin şekilde işletilmesi ile proseslerin işletilmesi ve kontrolü için gerekli personeli sağın ve korudu mu? (Organizasyon şeması)',
        category: 'iso9001',
        subcategory: 'İnsan kaynakları',
        standardClause: '7.1.2',
        department: 'İnsan Kaynakları',
        process: ['Personel Tedarik', 'Organizasyon Yapısı', 'İnsan Kaynakları Planlama'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'KYS için gerekli personelin sağlandığını ve korunduğunu kontrol edin',
        evidence: ['Organizasyon Şeması', 'Personel Planı', 'İstihdam Kayıtları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      // 7.1.4 Proseslerin işletimi için çevre
      {
        id: 'ik-q-012',
        questionNumber: '12',
        questionText: 'Sosyal ortamın yönetilmesi mi? (Dokümana bağlanmış, sosyal iletişim alanları vb yönetimde, güvenilirlik, açıklık, güven, saygı, güvenlik)',
        category: 'iso9001',
        subcategory: 'Proseslerin işletimi için çevre',
        standardClause: '7.1.4',
        department: 'İnsan Kaynakları',
        process: ['Sosyal Ortam Yönetimi', 'İç İletişim', 'Çalışan İlişkileri'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: false,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Sosyal ortamın yönetildiğini ve dokümante edildiğini kontrol edin',
        evidence: ['Sosyal Ortam Politikası', 'İletişim Prosedürleri', 'Çalışan Memnuniyet Anketleri'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      // 7.2 Yetkinlik
      {
        id: 'ik-q-013',
        questionNumber: '13',
        questionText: 'KYS performansını ve etkinliğini etkileyen kendi kontrolü altında olan kişilerin gerekli yetkinliğini tanımlamış mı?',
        category: 'iso9001',
        subcategory: 'Yetkinlik',
        standardClause: '7.2',
        department: 'İnsan Kaynakları',
        process: ['Yetkinlik Yönetimi', 'Performans Yönetimi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'Gerekli yetkinliklerin tanımlandığını kontrol edin',
        evidence: ['Yetkinlik Matrisi', 'İş Tanımları', 'Yetkinlik Gereksinimleri'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-014',
        questionNumber: '14',
        questionText: 'Yetkinliklerin tanımlanması yapan eğitim, öğretim ve tecrübelerine dikkate alınmış mı?',
        category: 'iso9001',
        subcategory: 'Yetkinlik',
        standardClause: '7.2',
        department: 'İnsan Kaynakları',
        process: ['Eğitim Yönetimi', 'Yetkinlik Geliştirme'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Yetkinlik tanımlamada eğitim, öğretim ve tecrübenin dikkate alındığını kontrol edin',
        evidence: ['Eğitim Kayıtları', 'Tecrübe Değerlendirmeleri', 'Yetkinlik Değerlendirme Formları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      // 7.3 Farkındalık
      {
        id: 'ik-q-015',
        questionNumber: '15',
        questionText: 'Tüm Personelin Aşağıdaki konularda eğitimler planlanmış mı? Eğitim veya altına alınmış ve kalite politikası, hedefleri, kalite yönetim sistemine katkıları, kalite yönetim sistemi şartlarına uymamanın sonuçları, müşteri olarak',
        category: 'iso9001',
        subcategory: 'Farkındalık',
        standardClause: '7.3',
        department: 'İnsan Kaynakları',
        process: ['Eğitim Planlama', 'Farkındalık Eğitimleri'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'Farkındalık eğitimlerinin planlandığını ve verildiğini kontrol edin',
        evidence: ['Eğitim Planı', 'Eğitim Kayıtları', 'Katılım Listeleri'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      // 9.1.1 Genel
      {
        id: 'ik-q-016',
        questionNumber: '16',
        questionText: 'Süreç Performans hedefleri tanımlanmış mı? (personelle ilgili ve zaman aralıklı olabilecek) - kalite ve değerlendirmelerini yönetmeli vb.',
        category: 'iso9001',
        subcategory: 'İzleme, ölçme, analiz ve değerlendirme - Genel',
        standardClause: '9.1.1',
        department: 'İnsan Kaynakları',
        process: ['Performans İzleme', 'Hedef Yönetimi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Süreç performans hedeflerinin tanımlandığını kontrol edin',
        evidence: ['Performans Hedefleri', 'KPI Tanımları', 'Ölçüm Planı'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-017',
        questionNumber: '17',
        questionText: 'Performans göstergelerini kıyaslayacağı mı?',
        category: 'iso9001',
        subcategory: 'İzleme, ölçme, analiz ve değerlendirme - Genel',
        standardClause: '9.1.1',
        department: 'İnsan Kaynakları',
        process: ['Performans Değerlendirme', 'Kıyaslama'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: false,
        weight: 3,
        expectedAnswer: 'Evet',
        guidelines: 'Performans göstergelerinin kıyaslandığını kontrol edin',
        evidence: ['Kıyaslama Raporları', 'Benchmark Analizleri', 'Performans Karşılaştırmaları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-018',
        questionNumber: '18',
        questionText: 'Bu hedeflere ulaşılmadığında düzeltici tedbiyat faaliyeti başlatılmış mı?',
        category: 'iso9001',
        subcategory: 'İzleme, ölçme, analiz ve değerlendirme - Genel',
        standardClause: '9.1.1',
        department: 'İnsan Kaynakları',
        process: ['Düzeltici Faaliyetler', 'Performans İyileştirme'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'Hedeflere ulaşılamadığında düzeltici faaliyetlerin başlatıldığını kontrol edin',
        evidence: ['Düzeltici Faaliyet Kayıtları', 'İyileştirme Planları', 'Aksiyon Takip Formları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      // Kalan 40 soru ekleniyor
      {
        id: 'ik-q-019',
        questionNumber: '19',
        questionText: 'Üretim süreçlerine ve altyapı ekipmanlarına yönelik iç ve dış riskler değerlendirilmiş mi? Müşteri etkisine göre acil durum planları hazırlanmış mı?',
        category: 'iso9001',
        subcategory: 'Risk Yönetimi',
        standardClause: '6.1',
        department: 'İnsan Kaynakları',
        process: ['Risk Değerlendirme', 'Acil Durum Planlama'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'Üretim ve altyapı risklerinin değerlendirildiğini ve acil durum planlarının hazırlandığını kontrol edin',
        evidence: ['Risk Değerlendirme Raporu', 'Acil Durum Planları', 'Müşteri Etki Analizi'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-020',
        questionNumber: '20',
        questionText: 'Hizmet kesintisi, doğal afet, yangın, program kesintisi, işçi gücü kaybı gibi durumlara yönelik acil durum planı hazırlanmış mı?',
        category: 'iso9001',
        subcategory: 'Acil Durum Yönetimi',
        standardClause: '6.1',
        department: 'İnsan Kaynakları',
        process: ['Acil Durum Planlama', 'İş Sürekliliği'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'Çeşitli acil durumlara yönelik planların hazırlandığını kontrol edin',
        evidence: ['Acil Durum Planları', 'İş Sürekliliği Planı', 'Kriz Yönetim Prosedürü'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-021',
        questionNumber: '21',
        questionText: 'Acil durumlar en az yılda bir tatbikat ile test ediliyor mu?',
        category: 'iso9001',
        subcategory: 'Acil Durum Tatbikatı',
        standardClause: '6.1',
        department: 'İnsan Kaynakları',
        process: ['Tatbikat Yönetimi', 'Acil Durum Testleri'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Acil durum tatbikatlarının düzenli olarak yapıldığını kontrol edin',
        evidence: ['Tatbikat Kayıtları', 'Tatbikat Raporları', 'Katılım Listeleri'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-022',
        questionNumber: '22',
        questionText: 'Çok disiplinli ekiplerle acil durum planları gözden geçiriliyor ve güncelleniyor mu?',
        category: 'iso9001',
        subcategory: 'Acil Durum Plan Güncelleme',
        standardClause: '6.1',
        department: 'İnsan Kaynakları',
        process: ['Plan Gözden Geçirme', 'Çok Disiplinli Çalışma'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: false,
        weight: 3,
        expectedAnswer: 'Evet',
        guidelines: 'Acil durum planlarının çok disiplinli ekiplerle gözden geçirildiğini kontrol edin',
        evidence: ['Gözden Geçirme Kayıtları', 'Ekip Toplantı Tutanakları', 'Plan Güncelleme Kayıtları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-023',
        questionNumber: '23',
        questionText: 'Kalite amaç ve hedefleri oluşturulmuş, dokümante edilmiş ve kalite politikası ile uyumlu mu?',
        category: 'iso9001',
        subcategory: 'Kalite Hedefleri',
        standardClause: '6.2',
        department: 'İnsan Kaynakları',
        process: ['Hedef Belirleme', 'Politika Uyumu'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'Kalite amaç ve hedeflerinin oluşturulduğunu ve politika ile uyumlu olduğunu kontrol edin',
        evidence: ['Kalite Hedefleri', 'Kalite Politikası', 'Uyumluluk Analizi'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-024',
        questionNumber: '24',
        questionText: 'Kalite amaçlarının ne yapılacağı, kaynakları, sorumluları, tamamlanma süreleri ve değerlendirme yöntemleri tanımlanmış mı?',
        category: 'iso9001',
        subcategory: 'Kalite Hedef Planlaması',
        standardClause: '6.2',
        department: 'İnsan Kaynakları',
        process: ['Hedef Planlama', 'Kaynak Yönetimi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'Kalite amaçları için detaylı planlamanın yapıldığını kontrol edin',
        evidence: ['Hedef Planları', 'Kaynak Planı', 'Sorumluluk Matrisi'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-025',
        questionNumber: '25',
        questionText: 'KYS\'nin işletilmesi ve kontrolü için gerekli personel görevlendirilmiş mi? Organizasyon şeması güncel mi?',
        category: 'iso9001',
        subcategory: 'İnsan Kaynakları',
        standardClause: '7.1.2',
        department: 'İnsan Kaynakları',
        process: ['Personel Görevlendirme', 'Organizasyon Yapısı'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'KYS için gerekli personelin görevlendirildiğini ve organizasyon şemasının güncel olduğunu kontrol edin',
        evidence: ['Organizasyon Şeması', 'Görevlendirme Belgeleri', 'Personel Listesi'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-026',
        questionNumber: '26',
        questionText: 'Çalışanlar için sosyal ortamlar (dinlenme alanı, iletişim alanı vb.) sağlanmış mı?',
        category: 'iso9001',
        subcategory: 'Sosyal Ortam',
        standardClause: '7.1.4',
        department: 'İnsan Kaynakları',
        process: ['Sosyal Ortam Yönetimi', 'Çalışan Refahı'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: false,
        weight: 3,
        expectedAnswer: 'Evet',
        guidelines: 'Çalışanlar için sosyal ortamların sağlandığını kontrol edin',
        evidence: ['Sosyal Alan Planları', 'Çalışan Memnuniyet Anketleri', 'Tesis Fotoğrafları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-027',
        questionNumber: '27',
        questionText: 'Fiziksel çevre koşulları (ısı, ışık, nem, hava kalitesi, hijyen, gürültü vb.) izleniyor ve yönetiliyor mu?',
        category: 'iso9001',
        subcategory: 'Fiziksel Çevre',
        standardClause: '7.1.4',
        department: 'İnsan Kaynakları',
        process: ['Çevre Koşulları İzleme', 'İş Sağlığı'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Fiziksel çevre koşullarının izlendiğini ve yönetildiğini kontrol edin',
        evidence: ['Çevre Ölçüm Kayıtları', 'İzleme Prosedürü', 'Düzeltici Faaliyetler'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-028',
        questionNumber: '28',
        questionText: 'Psikolojik iyilik hali ve İSG açısından önlemler alınmış mı? (stres, tükenmişlik vb.)',
        category: 'iso9001',
        subcategory: 'Psikolojik İyilik',
        standardClause: '7.1.4',
        department: 'İnsan Kaynakları',
        process: ['Psikolojik Destek', 'İSG Yönetimi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Psikolojik iyilik hali için önlemlerin alındığını kontrol edin',
        evidence: ['Psikolojik Destek Programları', 'Stres Yönetimi Eğitimleri', 'İSG Kayıtları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-029',
        questionNumber: '29',
        questionText: 'Personel bilgilerine erişim sağlanabiliyor mu? (kan grubu, beden ölçüleri vb.)',
        category: 'iso9001',
        subcategory: 'Personel Bilgi Yönetimi',
        standardClause: '7.1.2',
        department: 'İnsan Kaynakları',
        process: ['Personel Bilgi Sistemi', 'Veri Yönetimi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: false,
        weight: 3,
        expectedAnswer: 'Evet',
        guidelines: 'Personel bilgilerine erişimin sağlandığını kontrol edin',
        evidence: ['Personel Bilgi Sistemi', 'Veri Tabanı', 'Erişim Kayıtları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-030',
        questionNumber: '30',
        questionText: 'Acil müdahale ekiplerinin yangın ve iş güvenliği eğitimleri mevcut mu?',
        category: 'iso9001',
        subcategory: 'Acil Müdahale Eğitimleri',
        standardClause: '7.2',
        department: 'İnsan Kaynakları',
        process: ['Acil Müdahale Eğitimi', 'İSG Eğitimleri'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'Acil müdahale ekiplerinin eğitimlerinin mevcut olduğunu kontrol edin',
        evidence: ['Eğitim Kayıtları', 'Sertifikalar', 'Eğitim Programları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-031',
        questionNumber: '31',
        questionText: 'Bu eğitimlerin değerlendirmeleri yapılmış mı ve kayıt altına alınmış mı?',
        category: 'iso9001',
        subcategory: 'Eğitim Değerlendirme',
        standardClause: '7.2',
        department: 'İnsan Kaynakları',
        process: ['Eğitim Değerlendirme', 'Kayıt Yönetimi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Eğitim değerlendirmelerinin yapıldığını ve kayıt altına alındığını kontrol edin',
        evidence: ['Değerlendirme Formları', 'Eğitim Kayıtları', 'Etkinlik Raporları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-032',
        questionNumber: '32',
        questionText: 'Yangın tüplerinin listesi mevcut mu? Dolum tarihleri takip ediliyor mu?',
        category: 'iso9001',
        subcategory: 'Yangın Güvenliği',
        standardClause: '7.1.3',
        department: 'İnsan Kaynakları',
        process: ['Yangın Güvenliği', 'Ekipman Yönetimi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Yangın tüplerinin listesinin mevcut olduğunu ve dolum tarihlerinin takip edildiğini kontrol edin',
        evidence: ['Yangın Tüpü Listesi', 'Dolum Kayıtları', 'Bakım Planı'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-033',
        questionNumber: '33',
        questionText: 'Acil durum telefonları tanımlı ve görünür yerlerde erişilebilir mi?',
        category: 'iso9001',
        subcategory: 'Acil Durum İletişimi',
        standardClause: '7.4',
        department: 'İnsan Kaynakları',
        process: ['Acil Durum İletişimi', 'İletişim Yönetimi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Acil durum telefonlarının tanımlı ve erişilebilir olduğunu kontrol edin',
        evidence: ['Acil Durum Telefon Listesi', 'Görsel Belgeler', 'Erişilebilirlik Kontrolü'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-034',
        questionNumber: '34',
        questionText: 'Personelin kullanacağı güvenlik ekipmanları tanımlı mı?',
        category: 'iso9001',
        subcategory: 'Güvenlik Ekipmanları',
        standardClause: '7.1.3',
        department: 'İnsan Kaynakları',
        process: ['Güvenlik Ekipmanları', 'KKD Yönetimi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Personelin kullanacağı güvenlik ekipmanlarının tanımlı olduğunu kontrol edin',
        evidence: ['KKD Listesi', 'Güvenlik Ekipman Kataloğu', 'Kullanım Talimatları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-035',
        questionNumber: '35',
        questionText: 'Bu ekipmanlar personele zimmetlenmiş mi?',
        category: 'iso9001',
        subcategory: 'Ekipman Zimmetleme',
        standardClause: '7.1.3',
        department: 'İnsan Kaynakları',
        process: ['Zimmet Yönetimi', 'Ekipman Takibi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: false,
        weight: 3,
        expectedAnswer: 'Evet',
        guidelines: 'Güvenlik ekipmanlarının personele zimmetlendiğini kontrol edin',
        evidence: ['Zimmet Kayıtları', 'Teslim Tutanakları', 'Zimmet Listeleri'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-036',
        questionNumber: '36',
        questionText: 'İç dokümanlar (prosedür, talimat, form vb.) tanımlanmış mı?',
        category: 'iso9001',
        subcategory: 'Dokümantasyon',
        standardClause: '7.5',
        department: 'İnsan Kaynakları',
        process: ['Dokümantasyon', 'Doküman Yönetimi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'İç dokümanların tanımlandığını kontrol edin',
        evidence: ['Doküman Listesi', 'Prosedürler', 'Talimatlar', 'Formlar'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-037',
        questionNumber: '37',
        questionText: 'Dış kaynaklı dokümanlar (standart, teknik resim, müşteri/tedarikçi dokümanları) tanımlanmış mı?',
        category: 'iso9001',
        subcategory: 'Dış Dokümanlar',
        standardClause: '7.5',
        department: 'İnsan Kaynakları',
        process: ['Dış Doküman Yönetimi', 'Standart Yönetimi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: false,
        weight: 3,
        expectedAnswer: 'Evet',
        guidelines: 'Dış kaynaklı dokümanların tanımlandığını kontrol edin',
        evidence: ['Dış Doküman Listesi', 'Standartlar', 'Müşteri Dokümanları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-038',
        questionNumber: '38',
        questionText: 'Süreçlerin iç ve dış bilgi kaynaklarına ulaşımı sağlanmış mı?',
        category: 'iso9001',
        subcategory: 'Bilgi Erişimi',
        standardClause: '7.5',
        department: 'İnsan Kaynakları',
        process: ['Bilgi Yönetimi', 'Erişim Kontrolü'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: false,
        weight: 3,
        expectedAnswer: 'Evet',
        guidelines: 'Süreçlerin bilgi kaynaklarına erişiminin sağlandığını kontrol edin',
        evidence: ['Erişim Kayıtları', 'Bilgi Sistemi', 'Kullanıcı Yetkileri'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-039',
        questionNumber: '39',
        questionText: 'Görev yapan tüm çalışanların yeterlilikleri tanımlanmış mı?',
        category: 'iso9001',
        subcategory: 'Yetkinlik',
        standardClause: '7.2',
        department: 'İnsan Kaynakları',
        process: ['Yetkinlik Tanımlama', 'Personel Değerlendirme'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'Tüm çalışanların yeterliliklerinin tanımlandığını kontrol edin',
        evidence: ['Yetkinlik Matrisi', 'İş Tanımları', 'Yeterlilik Kriterleri'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-040',
        questionNumber: '40',
        questionText: 'Eğitim ihtiyaçları analiz edilip planlanıyor mu?',
        category: 'iso9001',
        subcategory: 'Eğitim Planlama',
        standardClause: '7.2',
        department: 'İnsan Kaynakları',
        process: ['Eğitim İhtiyaç Analizi', 'Eğitim Planlama'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'Eğitim ihtiyaçlarının analiz edildiğini ve planlandığını kontrol edin',
        evidence: ['İhtiyaç Analizi Raporu', 'Eğitim Planı', 'Analiz Formları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-041',
        questionNumber: '41',
        questionText: 'Yetkinlikler tanımlanırken eğitim, öğretim, deneyim dikkate alınıyor mu?',
        category: 'iso9001',
        subcategory: 'Yetkinlik Değerlendirme',
        standardClause: '7.2',
        department: 'İnsan Kaynakları',
        process: ['Yetkinlik Değerlendirme', 'Eğitim Yönetimi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Yetkinlik tanımlamada eğitim, öğretim ve deneyimin dikkate alındığını kontrol edin',
        evidence: ['Yetkinlik Değerlendirme Kriterleri', 'Eğitim Kayıtları', 'Deneyim Belgeleri'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-042',
        questionNumber: '42',
        questionText: 'Eğitim faaliyetleri planlanıyor, uygulanıyor ve etkinliği değerlendiriliyor mu? Geliştirmeler kayıt altına alınıyor mu?',
        category: 'iso9001',
        subcategory: 'Eğitim Yönetimi',
        standardClause: '7.2',
        department: 'İnsan Kaynakları',
        process: ['Eğitim Planlama', 'Eğitim Uygulama', 'Etkinlik Değerlendirme'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'Eğitim faaliyetlerinin planlandığını, uygulandığını ve etkinliğinin değerlendirildiğini kontrol edin',
        evidence: ['Eğitim Planı', 'Uygulama Kayıtları', 'Etkinlik Raporları', 'Geliştirme Kayıtları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-043',
        questionNumber: '43',
        questionText: 'Eğitim yönetimi için prosedür mevcut mu?',
        category: 'iso9001',
        subcategory: 'Eğitim Prosedürü',
        standardClause: '7.2',
        department: 'İnsan Kaynakları',
        process: ['Prosedür Yönetimi', 'Eğitim Sistemi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Eğitim yönetimi için prosedürün mevcut olduğunu kontrol edin',
        evidence: ['Eğitim Yönetimi Prosedürü', 'Süreç Tanımları', 'İş Akışları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-044',
        questionNumber: '44',
        questionText: 'Ürün/proses gereklerini etkileyen personel için eğitim planı mevcut mu?',
        category: 'iso9001',
        subcategory: 'Özel Eğitim Planları',
        standardClause: '7.2',
        department: 'İnsan Kaynakları',
        process: ['Özel Eğitim Planlama', 'Ürün Kalitesi'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'Ürün/proses gereklerini etkileyen personel için özel eğitim planının mevcut olduğunu kontrol edin',
        evidence: ['Özel Eğitim Planları', 'Ürün Gereklilikleri', 'Proses Eğitimleri'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-045',
        questionNumber: '45',
        questionText: 'Müşteri gerekliliklerine yönelik eğitimler veriliyor mu? Kayıtları ve değerlendirme sonuçları mevcut mu?',
        category: 'iso9001',
        subcategory: 'Müşteri Odaklı Eğitimler',
        standardClause: '7.2',
        department: 'İnsan Kaynakları',
        process: ['Müşteri Eğitimleri', 'Müşteri Memnuniyeti'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Müşteri gerekliliklerine yönelik eğitimlerin verildiğini ve kayıtlarının mevcut olduğunu kontrol edin',
        evidence: ['Müşteri Eğitim Kayıtları', 'Değerlendirme Sonuçları', 'Müşteri Gereklilikleri'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-046',
        questionNumber: '46',
        questionText: 'Yeni işe alınacak personelin nitelikleri tanımlanmış mı?',
        category: 'iso9001',
        subcategory: 'İşe Alım Kriterleri',
        standardClause: '7.2',
        department: 'İnsan Kaynakları',
        process: ['İşe Alım', 'Nitelik Belirleme'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'Yeni işe alınacak personelin niteliklerinin tanımlandığını kontrol edin',
        evidence: ['İş Tanımları', 'Nitelik Kriterleri', 'İşe Alım Prosedürü'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-047',
        questionNumber: '47',
        questionText: 'İşe başvuran personel için başvuru formu tutuluyor mu?',
        category: 'iso9001',
        subcategory: 'Başvuru Süreci',
        standardClause: '7.2',
        department: 'İnsan Kaynakları',
        process: ['Başvuru Yönetimi', 'Kayıt Tutma'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: false,
        weight: 3,
        expectedAnswer: 'Evet',
        guidelines: 'İşe başvuran personel için başvuru formunun tutulduğunu kontrol edin',
        evidence: ['Başvuru Formları', 'Başvuru Kayıtları', 'Dosyalama Sistemi'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-048',
        questionNumber: '48',
        questionText: 'Yeni veya görev yeri değişen personel için işbaşı eğitimleri kayıt altına alınıyor mu?',
        category: 'iso9001',
        subcategory: 'İşbaşı Eğitimleri',
        standardClause: '7.2',
        department: 'İnsan Kaynakları',
        process: ['İşbaşı Eğitimi', 'Oryantasyon'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 4,
        expectedAnswer: 'Evet',
        guidelines: 'İşbaşı eğitimlerinin kayıt altına alındığını kontrol edin',
        evidence: ['İşbaşı Eğitim Kayıtları', 'Oryantasyon Programı', 'Eğitim Formları'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-049',
        questionNumber: '49',
        questionText: 'İşbaşı eğitimleri tanımlı mı ve aşağıdaki içerikleri kapsıyor mu? • Müşteri şartlarına uyumsuzluğun sonuçları • Günlük görev tanımı • Müşteri özel istekleri',
        category: 'iso9001',
        subcategory: 'İşbaşı Eğitim İçeriği',
        standardClause: '7.2',
        department: 'İnsan Kaynakları',
        process: ['İşbaşı Eğitimi', 'Müşteri Odaklılık'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'İşbaşı eğitimlerinin belirtilen içerikleri kapsadığını kontrol edin',
        evidence: ['Eğitim Müfredatı', 'Eğitim İçerikleri', 'Müşteri Gereklilikleri'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      },
      {
        id: 'ik-q-050',
        questionNumber: '50',
        questionText: 'Eğitim planlarında aşağıdaki konulara yer verilmiş mi ve kayıt altına alınmış mı? • Kalite politikası • Kalite hedefleri • KYS katkısı • Uygunsuzluklara müdahale',
        category: 'iso9001',
        subcategory: 'Farkındalık Eğitimleri',
        standardClause: '7.3',
        department: 'İnsan Kaynakları',
        process: ['Farkındalık Eğitimi', 'Kalite Bilinci'],
        answerType: 'yes_no',
        isRequired: true,
        isCritical: true,
        weight: 5,
        expectedAnswer: 'Evet',
        guidelines: 'Eğitim planlarında belirtilen konuların yer aldığını ve kayıt altına alındığını kontrol edin',
        evidence: ['Eğitim Planları', 'Farkındalık Eğitim Kayıtları', 'Kalite Politikası Eğitimleri'],
        createdBy: 'Sistem',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '00',
        isActive: true
      }
    ];

    const ikQuestionSet: DepartmentQuestionSet = {
      id: 'qs-ik-001',
      departmentId: 'insan-kaynaklari',
      departmentName: 'İnsan Kaynakları',
      version: '00',
      effectiveDate: new Date().toISOString().split('T')[0],
      createdBy: 'Sistem Yöneticisi',
      questions: ikQuestions,
      isActive: true,
      description: 'İnsan Kaynakları departmanı için ISO 9001:2015 standardına uygun kapsamlı 50 soruluk tetkik listesi. Kuruluş bağlamı, risk yönetimi, kalite hedefleri, insan kaynakları yönetimi, yetkinlik, farkındalık, eğitim yönetimi, acil durum planları, güvenlik ekipmanları, dokümantasyon ve performans izleme konularını kapsar.',
      estimatedDuration: 180 // 3 saat
    };

    setQuestionSets([ikQuestionSet]);
  };

  const calculateMetrics = (plans: AuditPlan[], findings: Finding[], actions: Action[]) => {
    const metrics: AuditMetrics = {
      totalAudits: plans.length,
      completedAudits: plans.filter(p => p.status === 'completed').length,
      onTimeCompletion: 85,
      totalFindings: findings.length,
      findingsByType: {
        'nonconformity': findings.filter(f => f.type === 'nonconformity').length,
        'improvement_opportunity': findings.filter(f => f.type === 'improvement_opportunity').length,
        'positive_finding': findings.filter(f => f.type === 'positive_finding').length,
        'observation': findings.filter(f => f.type === 'observation').length
      },
      findingsBySeverity: {
        'major': findings.filter(f => f.severity === 'major').length,
        'minor': findings.filter(f => f.severity === 'minor').length,
        'observation': findings.filter(f => f.severity === 'observation').length
      },
      openActions: actions.filter(a => a.status !== 'completed').length,
      overdueActions: actions.filter(a => a.status === 'overdue').length,
      actionCompletionRate: Math.round((actions.filter(a => a.status === 'completed').length / actions.length) * 100) || 0,
      departmentPerformance: {
        'Üretim': 85,
        'Kalite': 92,
        'Satın Alma': 78,
        'Çevre': 88,
        'İK': 90
      }
    };
    setMetrics(metrics);
  };

  // Event Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleNewAudit = () => {
    setDialogType('plan');
    setSelectedItem(null);
    setFormStep(0);
    setFormData({
      title: '',
      description: '',
      auditType: 'internal',
      scope: [],
      department: '',
      process: [],
      plannedDate: '',
      duration: 8,
      auditorTeam: [],
      auditees: [],
      standards: [],
      priority: 'medium',
      findingNumber: '',
      type: 'nonconformity',
      severity: 'minor',
      category: '',
      clause: '',
      requirement: '',
      evidence: '',
      location: '',
      discoveredDate: '',
      discoveredBy: '',
      actionNumber: '',
      actionType: 'corrective',
      actionDescription: '',
      responsible: '',
      targetDate: '',
      verificationRequired: true,
      verificationMethod: '',
      verificationDate: '',
      verificationBy: '',
      resources: '',
      budget: 0,
      expectedResult: '',
      riskAssessment: '',
      successCriteria: ''
    });
    setDialogOpen(true);
  };

  const handleFormDataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextStep = () => {
    if (formStep < 3) {
      setFormStep(formStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (formStep > 0) {
      setFormStep(formStep - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    if (dialogType === 'action') {
      switch (step) {
        case 0: // Aksiyon Temel Bilgileri
          return formData.actionNumber.trim() !== '' && 
                 formData.actionDescription.trim() !== '' && 
                 formData.actionType.trim() !== '';
        case 1: // Sorumlu ve Zamanlama
          return formData.responsible.trim() !== '' && 
                 formData.targetDate !== '' && 
                 formData.expectedResult.trim() !== '';
        case 2: // Kaynak ve Doğrulama
          return formData.resources.trim() !== '' && 
                 formData.verificationMethod.trim() !== '' && 
                 formData.successCriteria.trim() !== '';
        default:
          return true;
      }
    } else if (dialogType === 'finding') {
      switch (step) {
        case 0: // Bulgu Temel Bilgileri
          return formData.findingNumber.trim() !== '' && 
                 formData.description.trim() !== '' && 
                 formData.category.trim() !== '';
        case 1: // Standart ve Gereksinimler
          return formData.clause.trim() !== '' && 
                 formData.department !== '' && 
                 formData.requirement.trim() !== '' && 
                 formData.evidence.trim() !== '';
        case 2: // Lokasyon ve Sorumlu
          return formData.location.trim() !== '' && 
                 formData.process.toString().trim() !== '' && 
                 formData.discoveredDate !== '' && 
                 formData.discoveredBy.trim() !== '';
        default:
          return true;
      }
    } else {
      // Plan validation
      switch (step) {
        case 0: // Temel Bilgiler
          return formData.title.trim() !== '' && 
                 formData.description.trim() !== '' && 
                 formData.auditType.trim() !== '';
        case 1: // Kapsam ve Detaylar
          return formData.department !== '' && 
                 formData.scope.length > 0 && 
                 formData.process.length > 0;
        case 2: // Zamanlama ve Standartlar
          return formData.plannedDate !== '' && 
                 formData.duration > 0 && 
                 formData.standards.length > 0;
        case 3: // Takım ve Sorumlu
          return formData.auditorTeam.length > 0;
        default:
          return true;
      }
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 0: return <DescriptionIcon />;
      case 1: return <BusinessIcon />;
      case 2: return <DateRangeIcon />;
      case 3: return <TeamIcon />;
      default: return <CheckIcon />;
    }
  };

  const handleEditAudit = (audit: AuditPlan) => {
    setDialogType('plan');
    setSelectedItem(audit);
    setDialogOpen(true);
  };

  const handleStartAudit = (plan: AuditPlan) => {
    const departmentQuestionSet = questionSets.find(qs => 
      qs.departmentName === plan.department && qs.isActive
    );

    if (!departmentQuestionSet) {
      setSnackbarMessage(`${plan.department} departmanı için soru listesi bulunamadı.`);
      setSnackbarOpen(true);
      return;
    }

    setAuditPlans(prev => prev.map(p => 
      p.id === plan.id ? { ...p, status: 'in_progress' as const } : p
    ));
    setSnackbarMessage('Denetim başlatıldı!');
    setSnackbarOpen(true);
  };

  const handleOpenAuditForm = (plan: AuditPlan) => {
    setSnackbarMessage('Denetim formu açılıyor...');
    setSnackbarOpen(true);
  };

  const handleNewFinding = () => {
    setDialogType('finding');
    setSelectedItem(null);
    setFormStep(0);
    setFormData({
      title: '',
      description: '',
      auditType: 'internal',
      scope: [],
      department: '',
      process: [],
      plannedDate: '',
      duration: 8,
      auditorTeam: [],
      auditees: [],
      standards: [],
      priority: 'medium',
      // Finding specific fields
      findingNumber: '',
      type: 'nonconformity',
      severity: 'minor',
      category: '',
      clause: '',
      requirement: '',
      evidence: '',
      location: '',
      discoveredDate: new Date().toISOString().split('T')[0],
      discoveredBy: 'Mevcut Denetçi',
      actionNumber: '',
      actionType: 'corrective',
      actionDescription: '',
      responsible: '',
      targetDate: '',
      verificationRequired: true,
      verificationMethod: '',
      verificationDate: '',
      verificationBy: '',
      resources: '',
      budget: 0,
      expectedResult: '',
      riskAssessment: '',
      successCriteria: ''
    });
    setDialogOpen(true);
  };

  const handleEditFinding = (finding: Finding) => {
    setDialogType('finding');
    setSelectedItem(finding);
    setDialogOpen(true);
  };

  const handleNewAction = () => {
    setDialogType('action');
    setSelectedItem(null);
    setFormStep(0);
    setFormData({
      title: '',
      description: '',
      auditType: 'internal',
      scope: [],
      department: '',
      process: [],
      plannedDate: '',
      duration: 8,
      auditorTeam: [],
      auditees: [],
      standards: [],
      priority: 'medium',
      findingNumber: '',
      type: 'nonconformity',
      severity: 'minor',
      category: '',
      clause: '',
      requirement: '',
      evidence: '',
      location: '',
      discoveredDate: new Date().toISOString().split('T')[0],
      discoveredBy: 'Mevcut Denetçi',
      // Action specific fields
      actionNumber: '',
      actionType: 'corrective',
      actionDescription: '',
      responsible: '',
      targetDate: '',
      verificationRequired: true,
      verificationMethod: '',
      verificationDate: '',
      verificationBy: '',
      resources: '',
      budget: 0,
      expectedResult: '',
      riskAssessment: '',
      successCriteria: ''
    });
    setDialogOpen(true);
  };

  const handleEditAction = (action: Action) => {
    setDialogType('action');
    setSelectedItem(action);
    setDialogOpen(true);
  };

  const handleDeleteItem = (id: string, type: string) => {
    if (window.confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) {
      switch (type) {
        case 'plan':
          setAuditPlans(prev => prev.filter(p => p.id !== id));
          break;
        case 'finding':
          setFindings(prev => prev.filter(f => f.id !== id));
          break;
        case 'action':
          setActions(prev => prev.filter(a => a.id !== id));
          break;
      }
      setSnackbarMessage('Öğe başarıyla silindi');
      setSnackbarOpen(true);
    }
  };

  const handleSaveItem = () => {
    setDialogOpen(false);
    setSnackbarMessage('Değişiklikler başarıyla kaydedildi');
    setSnackbarOpen(true);
    // Recalculate metrics after save
    calculateMetrics(auditPlans, findings, actions);
  };

  const handleExportReport = () => {
    setSnackbarMessage('Rapor dışa aktarılıyor...');
    setSnackbarOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'in_progress': return '#ff9800';
      case 'planned': return '#2196f3';
      case 'overdue': return '#f44336';
      case 'cancelled': return '#9c27b0';
      default: return theme.palette.grey[500];
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      case 'critical': return '#9c27b0';
      default: return theme.palette.grey[500];
    }
  };

  // Dashboard Component
  const Dashboard = () => (
    <Box>
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={3} mb={3}>
        {/* KPI Cards */}
        <StyledCard>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Toplam Tetkik
                </Typography>
                <Typography variant="h4" component="div" color="primary">
                  {metrics?.totalAudits || 0}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                <AuditIcon />
              </Avatar>
            </Box>
          </CardContent>
        </StyledCard>

        <StyledCard>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Tamamlanan
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  {metrics?.completedAudits || 0}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                <CheckIcon />
              </Avatar>
            </Box>
          </CardContent>
        </StyledCard>

        <StyledCard>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Toplam Bulgu
                </Typography>
                <Typography variant="h4" component="div" color="warning.main">
                  {metrics?.totalFindings || 0}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                <WarningIcon />
              </Avatar>
            </Box>
          </CardContent>
        </StyledCard>

        <StyledCard>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Aksiyon Tamamlama
                </Typography>
                <Typography variant="h4" component="div" color="info.main">
                  %{metrics?.actionCompletionRate || 0}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                <TrendingUpIcon />
              </Avatar>
            </Box>
          </CardContent>
        </StyledCard>
      </Box>

      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={3}>
        {/* Recent Activities */}
        <Box flex={2}>
          <StyledCard>
            <CardHeader 
              title="Son Tetkikler" 
              action={
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ViewIcon />}
                  onClick={() => setActiveTab(1)}
                >
                  Tümünü Gör
                </Button>
              }
            />
            <CardContent>
              <List>
                {auditPlans.slice(0, 5).map((audit) => (
                  <ListItem key={audit.id}>
                    <ListItemIcon>
                      <AuditIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={audit.title}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          <Typography variant="caption" color="textSecondary">
                            {audit.department} • {new Date(audit.plannedDate).toLocaleDateString('tr-TR')}
                          </Typography>
                          <StatusChip 
                            status={audit.status} 
                            label={audit.status === 'completed' ? 'Tamamlandı' : 
                                   audit.status === 'in_progress' ? 'Devam Ediyor' :
                                   audit.status === 'planned' ? 'Planlandı' : 'Gecikmiş'} 
                            size="small" 
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </StyledCard>
        </Box>

        {/* Department Performance */}
        <Box flex={1}>
          <StyledCard>
            <CardHeader title="Departman Performansı" />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={2}>
                {metrics?.departmentPerformance && Object.entries(metrics.departmentPerformance).map(([dept, score]) => (
                  <Box key={dept}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">{dept}</Typography>
                      <Typography variant="body2" fontWeight={600}>%{score}</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={score} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: score >= 90 ? '#4caf50' : score >= 75 ? '#ff9800' : '#f44336'
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </StyledCard>
        </Box>
      </Box>

      <Box mt={3}>
        <Box display="flex" flexWrap="wrap" gap={3}>
          {/* Findings by Type */}
          <Box flex="1 1 400px" minWidth="300px">
            <StyledCard>
              <CardHeader 
                title="Bulgu Türleri" 
                action={
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => setActiveTab(2)}
                  >
                    Detay
                  </Button>
                }
              />
              <CardContent>
                {metrics?.findingsByType && Object.entries(metrics.findingsByType).map(([type, count]) => (
                  <Box key={type} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">
                      {type === 'nonconformity' ? 'Uygunsuzluk' :
                       type === 'improvement_opportunity' ? 'İyileştirme Fırsatı' :
                       type === 'positive_finding' ? 'Pozitif Bulgu' : 'Gözlem'}
                    </Typography>
                    <Chip 
                      label={count} 
                      size="small" 
                      color={type === 'nonconformity' ? 'error' : 
                             type === 'improvement_opportunity' ? 'warning' : 'success'}
                    />
                  </Box>
                ))}
              </CardContent>
            </StyledCard>
          </Box>

          {/* Quick Actions */}
          <Box flex="1 1 400px" minWidth="300px">
            <StyledCard>
              <CardHeader title="Hızlı İşlemler" />
              <CardContent>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={handleNewAudit}
                    fullWidth
                  >
                    Yeni Tetkik Planla
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<WarningIcon />}
                    onClick={handleNewFinding}
                    fullWidth
                  >
                    Bulgu Ekle
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<TimelineIcon />}
                    onClick={handleNewAction}
                    fullWidth
                  >
                    Aksiyon Ata
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<ReportIcon />}
                    onClick={handleExportReport}
                    fullWidth
                  >
                    Rapor Oluştur
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  // Audit Plans Component
  const AuditPlans = () => {
    const filteredPlans = auditPlans.filter(plan => {
      const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           plan.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || plan.status === statusFilter;
      const matchesType = !typeFilter || plan.auditType === typeFilter;
      const matchesDepartment = !departmentFilter || plan.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesDepartment;
    });

    return (
      <Box>
        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
            <Box flex="1 1 300px" minWidth="200px">
              <TextField
                fullWidth
                size="small"
                placeholder="Tetkik ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Box>
            <Box flex="1 1 150px" minWidth="120px">
              <FormControl fullWidth size="small">
                <InputLabel>Durum</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Durum"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="planned">Planlandı</MenuItem>
                  <MenuItem value="in_progress">Devam Ediyor</MenuItem>
                  <MenuItem value="completed">Tamamlandı</MenuItem>
                  <MenuItem value="overdue">Gecikmiş</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box flex="1 1 150px" minWidth="120px">
              <FormControl fullWidth size="small">
                <InputLabel>Tür</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Tür"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="internal">İç Tetkik</MenuItem>
                  <MenuItem value="cross">Çapraz Tetkik</MenuItem>
                  <MenuItem value="supplier">Tedarikçi</MenuItem>
                  <MenuItem value="process">Süreç</MenuItem>
                  <MenuItem value="system">Sistem</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box flex="1 1 150px" minWidth="120px">
              <FormControl fullWidth size="small">
                <InputLabel>Departman</InputLabel>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  label="Departman"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="Üretim">Üretim</MenuItem>
                  <MenuItem value="Kalite">Kalite</MenuItem>
                  <MenuItem value="Satın Alma">Satın Alma</MenuItem>
                  <MenuItem value="Çevre">Çevre</MenuItem>
                  <MenuItem value="İK">İK</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNewAudit}
              >
                Yeni Tetkik
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExportReport}
              >
                Dışa Aktar
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Audit Plans Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Tetkik Başlığı</TableCell>
                  <TableCell>Tür</TableCell>
                  <TableCell>Departman</TableCell>
                  <TableCell>Planlanan Tarih</TableCell>
                  <TableCell>Süre</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>Öncelik</TableCell>
                  <TableCell>Denetçi</TableCell>
                  <TableCell align="center">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlans
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((plan) => (
                    <TableRow key={plan.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {plan.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {plan.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={
                            plan.auditType === 'internal' ? 'İç Tetkik' :
                            plan.auditType === 'cross' ? 'Çapraz' :
                            plan.auditType === 'supplier' ? 'Tedarikçi' :
                            plan.auditType === 'process' ? 'Süreç' : 'Sistem'
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{plan.department}</TableCell>
                      <TableCell>{new Date(plan.plannedDate).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{plan.duration} saat</TableCell>
                      <TableCell>
                        <StatusChip 
                          status={plan.status}
                          label={
                            plan.status === 'planned' ? 'Planlandı' :
                            plan.status === 'in_progress' ? 'Devam Ediyor' :
                            plan.status === 'completed' ? 'Tamamlandı' : 'Gecikmiş'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <PriorityChip 
                          priority={plan.priority}
                          label={plan.priority === 'low' ? 'Düşük' :
                                 plan.priority === 'medium' ? 'Orta' :
                                 plan.priority === 'high' ? 'Yüksek' : 'Kritik'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {plan.auditorTeam[0]?.name || 'Atanmadı'}
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={0.5}>
                          {plan.status === 'planned' && (
                            <Tooltip title="Denetime Başla">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleStartAudit(plan)}
                                sx={{ bgcolor: 'success.light', color: 'white', '&:hover': { bgcolor: 'success.main' } }}
                              >
                                <PlayArrowIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {plan.status === 'in_progress' && (
                            <Tooltip title="Denetim Formunu Aç">
                              <IconButton 
                                size="small" 
                                color="warning"
                                onClick={() => handleOpenAuditForm(plan)}
                                sx={{ bgcolor: 'warning.light', color: 'white', '&:hover': { bgcolor: 'warning.main' } }}
                              >
                                <AssignmentIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Görüntüle">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => {
                                setSelectedItem(plan);
                                setDialogType('plan');
                                setDialogOpen(true);
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Düzenle">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEditAudit(plan)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteItem(plan.id, 'plan')}
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
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredPlans.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      </Box>
    );
  };

  // Findings Component
  const FindingsComponent = () => {
    const filteredFindings = findings.filter(finding => {
      const matchesSearch = finding.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           finding.findingNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || finding.status === statusFilter;
      const matchesDepartment = !departmentFilter || finding.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });

    return (
      <Box>
        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
            <Box flex="1 1 300px" minWidth="200px">
              <TextField
                fullWidth
                size="small"
                placeholder="Bulgu ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Box>
            <Box flex="1 1 150px" minWidth="120px">
              <FormControl fullWidth size="small">
                <InputLabel>Durum</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Durum"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="open">Açık</MenuItem>
                  <MenuItem value="action_assigned">Aksiyon Atandı</MenuItem>
                  <MenuItem value="in_progress">Devam Ediyor</MenuItem>
                  <MenuItem value="verification_pending">Doğrulama Bekliyor</MenuItem>
                  <MenuItem value="closed">Kapalı</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box flex="1 1 150px" minWidth="120px">
              <FormControl fullWidth size="small">
                <InputLabel>Departman</InputLabel>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  label="Departman"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="Üretim">Üretim</MenuItem>
                  <MenuItem value="Kalite">Kalite</MenuItem>
                  <MenuItem value="Satın Alma">Satın Alma</MenuItem>
                  <MenuItem value="Çevre">Çevre</MenuItem>
                  <MenuItem value="İK">İK</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNewFinding}
              >
                Yeni Bulgu
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExportReport}
              >
                Dışa Aktar
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Findings Cards */}
        <Box display="flex" flexWrap="wrap" gap={2}>
          {filteredFindings.map((finding) => (
            <StyledCard key={finding.id} sx={{ flex: '1 1 350px', maxWidth: '500px' }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ 
                    bgcolor: finding.severity === 'major' ? '#f44336' : 
                            finding.severity === 'minor' ? '#ff9800' : '#4caf50' 
                  }}>
                    <WarningIcon />
                  </Avatar>
                }
                title={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">{finding.findingNumber}</Typography>
                    <StatusChip 
                      status={finding.status}
                      label={
                        finding.status === 'open' ? 'Açık' :
                        finding.status === 'action_assigned' ? 'Aksiyon Atandı' :
                        finding.status === 'in_progress' ? 'Devam Ediyor' :
                        finding.status === 'verification_pending' ? 'Doğrulama Bekliyor' : 'Kapalı'
                      }
                      size="small"
                    />
                  </Box>
                }
                subheader={
                  <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                    <Chip 
                      label={finding.type === 'nonconformity' ? 'Uygunsuzluk' :
                             finding.type === 'improvement_opportunity' ? 'İyileştirme' :
                             finding.type === 'positive_finding' ? 'Pozitif' : 'Gözlem'}
                      size="small"
                      color={finding.type === 'nonconformity' ? 'error' : 
                             finding.type === 'improvement_opportunity' ? 'warning' : 'success'}
                    />
                    <PriorityChip 
                      priority={finding.severity}
                      label={finding.severity === 'major' ? 'Majör' :
                             finding.severity === 'minor' ? 'Minör' : 'Gözlem'}
                      size="small"
                    />
                  </Box>
                }
                action={
                  <Box display="flex" gap={0.5}>
                    <Tooltip title="Düzenle">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditFinding(finding)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteItem(finding.id, 'finding')}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Kategori:</strong> {finding.category}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Madde:</strong> {finding.clause}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Açıklama:</strong> {finding.description}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Kanıt:</strong> {finding.evidence}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Typography variant="caption" color="textSecondary">
                    {finding.department} • {new Date(finding.discoveredDate).toLocaleDateString('tr-TR')}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {finding.discoveredBy}
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>
          ))}
        </Box>
      </Box>
    );
  };

  // Actions Component
  const ActionsComponent = () => {
    const filteredActions = actions.filter(action => {
      const matchesSearch = action.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           action.responsible.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || action.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    return (
      <Box>
        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
            <Box flex="1 1 300px" minWidth="200px">
              <TextField
                fullWidth
                size="small"
                placeholder="Aksiyon ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Box>
            <Box flex="1 1 150px" minWidth="120px">
              <FormControl fullWidth size="small">
                <InputLabel>Durum</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Durum"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="assigned">Atandı</MenuItem>
                  <MenuItem value="in_progress">Devam Ediyor</MenuItem>
                  <MenuItem value="completed">Tamamlandı</MenuItem>
                  <MenuItem value="overdue">Gecikmiş</MenuItem>
                  <MenuItem value="verified">Doğrulandı</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNewAction}
              >
                Yeni Aksiyon
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExportReport}
              >
                Dışa Aktar
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Actions Cards */}
        <Box display="flex" flexWrap="wrap" gap={2}>
          {filteredActions.map((action) => (
            <StyledCard key={action.id} sx={{ flex: '1 1 350px', maxWidth: '500px' }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ 
                    bgcolor: action.actionType === 'corrective' ? '#f44336' : 
                            action.actionType === 'preventive' ? '#ff9800' : '#4caf50' 
                  }}>
                    <TimelineIcon />
                  </Avatar>
                }
                title={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">
                      {action.actionType === 'corrective' ? 'Düzeltici' :
                       action.actionType === 'preventive' ? 'Önleyici' : 'İyileştirme'} Aksiyon
                    </Typography>
                    <StatusChip 
                      status={action.status}
                      label={
                        action.status === 'assigned' ? 'Atandı' :
                        action.status === 'in_progress' ? 'Devam Ediyor' :
                        action.status === 'completed' ? 'Tamamlandı' :
                        action.status === 'overdue' ? 'Gecikmiş' : 'Doğrulandı'
                      }
                      size="small"
                    />
                  </Box>
                }
                subheader={
                  <Box mt={1}>
                    <LinearProgress 
                      variant="determinate" 
                      value={action.progress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: action.progress >= 90 ? '#4caf50' : 
                                          action.progress >= 50 ? '#ff9800' : '#f44336'
                        }
                      }}
                    />
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                      %{action.progress} tamamlandı
                    </Typography>
                  </Box>
                }
                action={
                  <Box display="flex" gap={0.5}>
                    <Tooltip title="Düzenle">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditAction(action)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteItem(action.id, 'action')}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="body2" gutterBottom>
                  <strong>Açıklama:</strong> {action.description}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Sorumlu:</strong> {action.responsible}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Typography variant="caption" color="textSecondary">
                    Hedef: {new Date(action.targetDate).toLocaleDateString('tr-TR')}
                  </Typography>
                  {action.actualCompletionDate && (
                    <Typography variant="caption" color="success.main">
                      Tamamlandı: {new Date(action.actualCompletionDate).toLocaleDateString('tr-TR')}
                    </Typography>
                  )}
                </Box>
                {action.verificationRequired && (
                  <Box mt={1}>
                    <Chip 
                      label="Doğrulama Gerekli" 
                      size="small" 
                      color="warning" 
                      icon={<VerifiedIcon />}
                    />
                  </Box>
                )}
              </CardContent>
            </StyledCard>
          ))}
        </Box>
      </Box>
    );
  };

  // Reports Component
  const ReportsComponent = () => {
    const [reportType, setReportType] = useState('audit_summary');
    const [dateFrom, setDateFrom] = useState('2024-01-01');
    const [dateTo, setDateTo] = useState('2024-12-31');

    const generateReport = () => {
      setSnackbarMessage('Rapor oluşturuluyor...');
      setSnackbarOpen(true);
    };

    return (
      <Box>
        <Box display="flex" flexWrap="wrap" gap={3}>
          {/* Report Generator */}
          <Box flex="1 1 400px" minWidth="300px">
            <StyledCard>
              <CardHeader 
                title="Rapor Oluşturucu" 
                avatar={<ReportIcon color="primary" />}
              />
              <CardContent>
                <Box display="flex" flexDirection="column" gap={3}>
                  <FormControl fullWidth>
                    <InputLabel>Rapor Türü</InputLabel>
                    <Select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      label="Rapor Türü"
                    >
                      <MenuItem value="audit_summary">Tetkik Özet Raporu</MenuItem>
                      <MenuItem value="findings_report">Bulgular Raporu</MenuItem>
                      <MenuItem value="actions_report">Aksiyonlar Raporu</MenuItem>
                      <MenuItem value="performance_report">Performans Raporu</MenuItem>
                      <MenuItem value="compliance_report">Uygunluk Raporu</MenuItem>
                      <MenuItem value="trend_analysis">Trend Analizi</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Başlangıç Tarihi"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />

                  <TextField
                    label="Bitiş Tarihi"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />

                  <FormControl fullWidth>
                    <InputLabel>Departman</InputLabel>
                    <Select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      label="Departman"
                    >
                      <MenuItem value="">Tümü</MenuItem>
                      <MenuItem value="Üretim">Üretim</MenuItem>
                      <MenuItem value="Kalite">Kalite</MenuItem>
                      <MenuItem value="Satın Alma">Satın Alma</MenuItem>
                      <MenuItem value="Çevre">Çevre</MenuItem>
                      <MenuItem value="İK">İK</MenuItem>
                    </Select>
                  </FormControl>

                  <Box display="flex" gap={2}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<PrintIcon />}
                      onClick={generateReport}
                    >
                      PDF Oluştur
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<ExportIcon />}
                      onClick={generateReport}
                    >
                      Excel Çıktısı
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Box>

          {/* Report Templates */}
          <Box flex="1 1 400px" minWidth="300px">
            <StyledCard>
              <CardHeader title="Hazır Rapor Şablonları" />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemButton onClick={generateReport}>
                      <ListItemIcon>
                        <DashboardIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Aylık Tetkik Özeti"
                        secondary="Bu ay gerçekleşen tüm tetkiklerin özet raporu"
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemButton onClick={generateReport}>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Açık Bulgular Raporu"
                        secondary="Henüz kapatılmamış tüm bulgular"
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemButton onClick={generateReport}>
                      <ListItemIcon>
                        <PendingIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Geciken Aksiyonlar"
                        secondary="Hedef tarihini geçen aksiyonlar"
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemButton onClick={generateReport}>
                      <ListItemIcon>
                        <TrendingUpIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Performans Analizi"
                        secondary="Departman bazında performans değerlendirmesi"
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemButton onClick={generateReport}>
                      <ListItemIcon>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Uygunluk Raporu"
                        secondary="ISO standartlarına uygunluk değerlendirmesi"
                      />
                    </ListItemButton>
                  </ListItem>
                </List>
              </CardContent>
            </StyledCard>
          </Box>
        </Box>

        {/* Report Statistics */}
        <Box mt={3}>
          <StyledCard>
            <CardHeader title="Rapor İstatistikleri" />
            <CardContent>
              <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" color="primary">
                    {auditPlans.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Toplam Tetkik
                  </Typography>
                </Box>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" color="success.main">
                    {auditPlans.filter(p => p.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tamamlanan Tetkik
                  </Typography>
                </Box>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" color="warning.main">
                    {findings.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Toplam Bulgu
                  </Typography>
                </Box>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" color="info.main">
                    {actions.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Toplam Aksiyon
                  </Typography>
                </Box>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" color="error.main">
                    {actions.filter(a => a.status === 'overdue').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Geciken Aksiyon
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Box>
      </Box>
    );
  };

  // ============ SORU LİSTESİ YÖNETİM FONKSİYONLARI ============
  
  // Soru listesi yönetim fonksiyonları
  const handleCreateQuestionSet = () => {
    setQuestionSetDialogOpen(true);
    setSelectedQuestionSet(null);
    setQuestionSetFormData({
      departmentName: '',
      description: '',
      estimatedDuration: 60,
      questions: []
    });
  };

  const handleViewQuestionSet = (questionSet: DepartmentQuestionSet) => {
    setSelectedQuestionSet(questionSet);
    setQuestionViewDialogOpen(true);
  };

  const handleEditQuestionSet = (questionSet: DepartmentQuestionSet) => {
    setSelectedQuestionSet(questionSet);
    setQuestionSetFormData({
      departmentName: questionSet.departmentName,
      description: questionSet.description,
      estimatedDuration: questionSet.estimatedDuration,
      questions: questionSet.questions
    });
    setQuestionSetDialogOpen(true);
  };

  const handleSaveQuestionSet = () => {
    const newQuestionSet: DepartmentQuestionSet = {
      id: selectedQuestionSet?.id || `qs-${Date.now()}`,
      departmentId: questionSetFormData.departmentName.toLowerCase().replace(/\s+/g, '-'),
      departmentName: questionSetFormData.departmentName,
      version: selectedQuestionSet ? 
        String(parseInt(selectedQuestionSet.version) + 1).padStart(2, '0') : '00',
      effectiveDate: new Date().toISOString().split('T')[0],
      createdBy: 'Sistem Yöneticisi',
      questions: questionSetFormData.questions,
      isActive: true,
      description: questionSetFormData.description,
      estimatedDuration: questionSetFormData.estimatedDuration
    };

    if (selectedQuestionSet) {
      setQuestionSets(prev => prev.map(qs => qs.id === selectedQuestionSet.id ? newQuestionSet : qs));
    } else {
      setQuestionSets(prev => [...prev, newQuestionSet]);
    }

    setQuestionSetDialogOpen(false);
    setSnackbarMessage('Soru listesi başarıyla kaydedildi');
    setSnackbarOpen(true);
  };

  const handleDeleteQuestionSet = (id: string) => {
    setQuestionSets(prev => prev.filter(qs => qs.id !== id));
    setSnackbarMessage('Soru listesi silindi');
    setSnackbarOpen(true);
  };

  const handleCopyQuestionSet = (questionSet: DepartmentQuestionSet) => {
    const copiedQuestionSet: DepartmentQuestionSet = {
      ...questionSet,
      id: `qs-${Date.now()}`,
      departmentName: `${questionSet.departmentName} (Kopya)`,
      version: '00',
      effectiveDate: new Date().toISOString().split('T')[0],
      createdBy: 'Sistem Yöneticisi'
    };
    
    setQuestionSets(prev => [...prev, copiedQuestionSet]);
    setSnackbarMessage('Soru listesi kopyalandı');
    setSnackbarOpen(true);
  };

  const handleAddQuestion = () => {
    const newQuestion: AuditQuestion = {
      id: `q-${Date.now()}`,
      questionNumber: `${questionSetFormData.questions.length + 1}`,
      questionText: '',
      category: 'iso9001',
      subcategory: '',
      standardClause: '',
      department: questionSetFormData.departmentName,
      process: [],
      answerType: 'yes_no',
      isRequired: true,
      isCritical: false,
      weight: 3,
      expectedAnswer: 'Evet',
      guidelines: '',
      evidence: [],
      createdBy: 'Sistem Yöneticisi',
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      version: '00',
      isActive: true
    };

    setQuestionSetFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    setQuestionSetFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value, lastModified: new Date().toISOString() } : q
      )
    }));
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestionSetFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleCreateNonConformityFromQuestion = (questionId: string, questionText: string) => {
    // Soru bazlı uygunsuzluk oluşturma
    const newFinding: Finding = {
      id: `f-${Date.now()}`,
      auditId: activeAuditForm?.auditId || '',
      findingNumber: `F-${new Date().getFullYear()}-${String(findings.length + 1).padStart(3, '0')}`,
      type: 'nonconformity',
      severity: 'minor',
      category: 'Soru Bazlı Uygunsuzluk',
      clause: '',
      requirement: questionText,
      description: `${questionText} sorusuna verilen yanıt uygunsuzluk teşkil etmektedir.`,
      evidence: '',
      location: activeAuditForm?.departmentId || '',
      department: activeAuditForm?.departmentId || '',
      process: '',
      discoveredDate: new Date().toISOString().split('T')[0],
      discoveredBy: activeAuditForm?.auditorName || 'Denetçi',
      status: 'open',
      priority: 'medium',
      actions: []
    };

    setFindings(prev => [...prev, newFinding]);
    setSnackbarMessage('Uygunsuzluk başarıyla oluşturuldu');
    setSnackbarOpen(true);
  };

  // Soru Listeleri Component
  const QuestionListsComponent = () => {
    return (
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateQuestionSet}
            size="large"
          >
            Yeni Soru Listesi
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2} mb={3}>
          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <QuizIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {questionSets.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Toplam Soru Listesi
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>

          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <ChecklistIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {questionSets.reduce((total, qs) => total + qs.questions.length, 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Toplam Soru Sayısı
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>

          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {new Set(questionSets.map(qs => qs.departmentName)).size}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Kapsanan Departman
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>

          <StyledCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TimeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {Math.round(questionSets.reduce((total, qs) => total + qs.estimatedDuration, 0) / questionSets.length) || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ort. Süre (dk)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Box>

        {/* Question Sets List */}
        <StyledCard>
          <CardHeader 
            title="Soru Listeleri"
            avatar={<PlaylistIcon color="primary" />}
          />
          <CardContent>
            {questionSets.length === 0 ? (
              <Box textAlign="center" py={4}>
                <QuizIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Henüz soru listesi oluşturulmamış
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  İlk soru listenizi oluşturmak için yukarıdaki butonu kullanın
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleCreateQuestionSet}
                >
                  İlk Soru Listesini Oluştur
                </Button>
              </Box>
            ) : (
              <Box display="grid" gap={2}>
                {questionSets.map((questionSet) => (
                  <Paper
                    key={questionSet.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="start">
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <Typography variant="h6" fontWeight={600}>
                            {questionSet.departmentName}
                          </Typography>
                          <Chip
                            label={`Rev.${questionSet.version.padStart(2, '0')}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={questionSet.isActive ? 'Aktif' : 'Pasif'}
                            size="small"
                            color={questionSet.isActive ? 'success' : 'default'}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {questionSet.description}
                        </Typography>
                        
                        <Box display="flex" gap={3}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <QuizIcon fontSize="small" color="action" />
                            <Typography variant="caption">
                              {questionSet.questions.length} soru
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <TimeIcon fontSize="small" color="action" />
                            <Typography variant="caption">
                              ~{questionSet.estimatedDuration} dk
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="caption">
                              {new Date(questionSet.effectiveDate).toLocaleDateString('tr-TR')}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box display="flex" gap={1}>
                        <Tooltip title="Görüntüle">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => {
                              setSelectedQuestionSet(questionSet);
                              setQuestionViewDialogOpen(true);
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Düzenle">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditQuestionSet(questionSet)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Kopyala">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleCopyQuestionSet(questionSet)}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteQuestionSet(questionSet.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </CardContent>
        </StyledCard>
      </Box>
    );
  };

  // Settings Component
  const SettingsComponent = () => {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [autoReminders, setAutoReminders] = useState(true);
    const [reportFrequency, setReportFrequency] = useState('monthly');
    const [auditNumberPrefix, setAuditNumberPrefix] = useState('KDM-AUDIT');
    const [findingNumberPrefix, setFindingNumberPrefix] = useState('F');

    const saveSettings = () => {
      setSnackbarMessage('Ayarlar başarıyla kaydedildi');
      setSnackbarOpen(true);
    };

    return (
      <Box>
        <Box display="flex" flexWrap="wrap" gap={3}>
          {/* General Settings */}
          <Box flex="1 1 400px" minWidth="300px">
            <StyledCard>
              <CardHeader 
                title="Genel Ayarlar" 
                avatar={<SettingsIcon color="primary" />}
              />
              <CardContent>
                <Box display="flex" flexDirection="column" gap={3}>
                  <TextField
                    label="Tetkik Numara Ön Eki"
                    value={auditNumberPrefix}
                    onChange={(e) => setAuditNumberPrefix(e.target.value)}
                    fullWidth
                    helperText="Örnek: KDM-AUDIT-2024-001"
                  />

                  <TextField
                    label="Bulgu Numara Ön Eki"
                    value={findingNumberPrefix}
                    onChange={(e) => setFindingNumberPrefix(e.target.value)}
                    fullWidth
                    helperText="Örnek: F-2024-001"
                  />

                  <FormControl fullWidth>
                    <InputLabel>Rapor Sıklığı</InputLabel>
                    <Select
                      value={reportFrequency}
                      onChange={(e) => setReportFrequency(e.target.value)}
                      label="Rapor Sıklığı"
                    >
                      <MenuItem value="weekly">Haftalık</MenuItem>
                      <MenuItem value="monthly">Aylık</MenuItem>
                      <MenuItem value="quarterly">Üç Aylık</MenuItem>
                      <MenuItem value="yearly">Yıllık</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                      />
                    }
                    label="E-posta Bildirimleri"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={autoReminders}
                        onChange={(e) => setAutoReminders(e.target.checked)}
                      />
                    }
                    label="Otomatik Hatırlatmalar"
                  />

                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={saveSettings}
                    fullWidth
                  >
                    Ayarları Kaydet
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>
          </Box>

          {/* User Management */}
          <Box flex="1 1 400px" minWidth="300px">
            <StyledCard>
              <CardHeader title="Denetçi Yönetimi" />
              <CardContent>
                <List>
                  {auditors.map((auditor) => (
                    <ListItem key={auditor.id}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: auditor.isActive ? 'success.main' : 'grey.500' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={auditor.name}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {auditor.role === 'lead_auditor' ? 'Baş Denetçi' :
                               auditor.role === 'auditor' ? 'Denetçi' :
                               auditor.role === 'observer' ? 'Gözlemci' : 'Teknik Uzman'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {auditor.department} • {auditor.qualifications.join(', ')}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Düzenle">
                          <IconButton size="small" color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={auditor.isActive ? 'Pasifleştir' : 'Aktifleştir'}>
                          <IconButton 
                            size="small" 
                            color={auditor.isActive ? 'warning' : 'success'}
                          >
                            {auditor.isActive ? <PendingIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                  ))}
                </List>
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    fullWidth
                  >
                    Yeni Denetçi Ekle
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>
          </Box>
        </Box>

        {/* System Information */}
        <Box mt={3}>
          <StyledCard>
            <CardHeader title="Sistem Bilgileri" />
            <CardContent>
              <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Sistem Sürümü
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    v2.1.0
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Son Güncelleme
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    15.03.2024
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Toplam Kullanıcı
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {auditors.length} aktif denetçi
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Veri Tabanı Boyutu
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    2.3 MB
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              fontWeight: 600,
            }
          }}
        >
          <Tab
            icon={<DashboardIcon />}
            label="Dashboard"
            iconPosition="start"
          />
          <Tab
            icon={<AuditIcon />}
            label="Tetkik Planları"
            iconPosition="start"
          />
          <Tab
            icon={<QuizIcon />}
            label="Soru Listeleri"
            iconPosition="start"
          />
          <Tab
            icon={<WarningIcon />}
            label="Bulgular"
            iconPosition="start"
          />
          <Tab
            icon={<TimelineIcon />}
            label="Aksiyonlar"
            iconPosition="start"
          />
          <Tab
            icon={<ReportIcon />}
            label="Raporlar"
            iconPosition="start"
          />
          <Tab
            icon={<SettingsIcon />}
            label="Ayarlar"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && <Dashboard />}
        {activeTab === 1 && <AuditPlans />}
        {activeTab === 2 && <QuestionListsComponent />}
        {activeTab === 3 && <FindingsComponent />}
        {activeTab === 4 && <ActionsComponent />}
        {activeTab === 5 && <ReportsComponent />}
        {activeTab === 6 && <SettingsComponent />}
      </Box>

      {/* Advanced Dialog for Adding/Editing Audit Plans */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            minHeight: isMobile ? '100vh' : '80vh',
            maxHeight: isMobile ? '100vh' : '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <AuditIcon color="primary" />
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {selectedItem ? 'Tetkik Planını Düzenle' : 'Yeni Tetkik Planı Oluştur'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {dialogType === 'plan' ? 'Kapsamlı tetkik planınızı adım adım oluşturun' :
                   dialogType === 'finding' ? 'Bulgu Ekle/Düzenle' :
                   dialogType === 'action' ? 'Aksiyon Ekle/Düzenle' : 'Denetçi Ekle/Düzenle'}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setDialogOpen(false)} sx={{ p: 1 }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {dialogType === 'plan' && (
            <Box sx={{ height: '100%' }}>
              {/* Professional Stepper Form */}
              <Stepper activeStep={formStep} orientation="vertical" sx={{ p: 3 }}>
                
                {/* Step 1: Temel Bilgiler */}
                <Step>
                  <StepLabel 
                    icon={getStepIcon(0)}
                    error={formStep > 0 && !validateStep(0)}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Temel Bilgiler
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tetkik başlığı, açıklama ve türü
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ display: 'grid', gap: 3, mb: 3 }}>
                      <TextField
                        fullWidth
                        label="Tetkik Başlığı"
                        value={formData.title}
                        onChange={(e) => handleFormDataChange('title', e.target.value)}
                        error={formData.title.trim() === ''}
                        helperText={formData.title.trim() === '' ? 'Tetkik başlığı zorunludur' : ''}
                        placeholder="Örn: Q1 2024 İç Tetkik - Üretim Departmanı"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DescriptionIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Tetkik Açıklaması"
                        value={formData.description}
                        onChange={(e) => handleFormDataChange('description', e.target.value)}
                        multiline
                        rows={3}
                        error={formData.description.trim() === ''}
                        helperText={formData.description.trim() === '' ? 'Açıklama zorunludur' : 'Tetki amacı ve genel kapsamını açıklayın'}
                        placeholder="Tetkikin amacı, kapsamı ve beklenen sonuçlarını detaylı olarak açıklayın..."
                      />
                      
                      <FormControl fullWidth>
                        <InputLabel>Tetkik Türü</InputLabel>
                        <Select
                          value={formData.auditType}
                          onChange={(e) => handleFormDataChange('auditType', e.target.value)}
                          label="Tetkik Türü"
                          startAdornment={
                            <InputAdornment position="start">
                              <AuditIcon color="primary" />
                            </InputAdornment>
                          }
                        >
                          {auditTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              <Typography>{type.label}</Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <FormControl fullWidth>
                        <InputLabel>Öncelik Düzeyi</InputLabel>
                        <Select
                          value={formData.priority}
                          onChange={(e) => handleFormDataChange('priority', e.target.value)}
                          label="Öncelik Düzeyi"
                          startAdornment={
                            <InputAdornment position="start">
                              <PriorityIcon color="primary" />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="low">
                            <Chip label="Düşük" size="small" color="success" sx={{ minWidth: 60 }} />
                          </MenuItem>
                          <MenuItem value="medium">
                            <Chip label="Orta" size="small" color="warning" sx={{ minWidth: 60 }} />
                          </MenuItem>
                          <MenuItem value="high">
                            <Chip label="Yüksek" size="small" color="error" sx={{ minWidth: 60 }} />
                          </MenuItem>
                          <MenuItem value="critical">
                            <Chip label="Kritik" size="small" color="error" variant="filled" sx={{ minWidth: 60 }} />
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </StepContent>
                </Step>

                {/* Step 2: Kapsam ve Detaylar */}
                <Step>
                  <StepLabel 
                    icon={getStepIcon(1)}
                    error={formStep > 1 && !validateStep(1)}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Kapsam ve Detaylar
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Departman, süreçler ve kapsam alanları
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ display: 'grid', gap: 3, mb: 3 }}>
                      <FormControl fullWidth>
                        <InputLabel>Departman</InputLabel>
                        <Select
                          value={formData.department}
                          onChange={(e) => handleFormDataChange('department', e.target.value)}
                          label="Departman"
                          error={formData.department === ''}
                          startAdornment={
                            <InputAdornment position="start">
                              <DepartmentIcon color="primary" />
                            </InputAdornment>
                          }
                        >
                          {departments.map((dept) => (
                            <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <Autocomplete
                        multiple
                        options={scopeList}
                        value={formData.scope}
                        onChange={(_, newValue) => handleFormDataChange('scope', newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Kapsam Alanları"
                            error={formData.scope.length === 0}
                            helperText={formData.scope.length === 0 ? 'En az bir kapsam alanı seçiniz' : `${formData.scope.length} alan seçildi`}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start">
                                    <ProcessIcon color="primary" />
                                  </InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              label={option}
                              size="small"
                              color="primary"
                              variant="outlined"
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                      />
                      
                      <Autocomplete
                        multiple
                        options={processList}
                        value={formData.process}
                        onChange={(_, newValue) => handleFormDataChange('process', newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="İlgili Süreçler"
                            error={formData.process.length === 0}
                            helperText={formData.process.length === 0 ? 'En az bir süreç seçiniz' : `${formData.process.length} süreç seçildi`}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start">
                                    <ProcessIcon color="primary" />
                                  </InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              label={option}
                              size="small"
                              color="secondary"
                              variant="outlined"
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                      />
                    </Box>
                  </StepContent>
                </Step>

                {/* Step 3: Zamanlama ve Standartlar */}
                <Step>
                  <StepLabel 
                    icon={getStepIcon(2)}
                    error={formStep > 2 && !validateStep(2)}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Zamanlama ve Standartlar
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tarih, süre ve uygulanacak standartlar
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ display: 'grid', gap: 3, mb: 3 }}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Planlanan Tarih"
                        value={formData.plannedDate}
                        onChange={(e) => handleFormDataChange('plannedDate', e.target.value)}
                        error={formData.plannedDate === ''}
                        helperText={formData.plannedDate === '' ? 'Tetkik tarihi zorunludur' : ''}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DateRangeIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        type="number"
                        label="Süre (Saat)"
                        value={formData.duration}
                        onChange={(e) => handleFormDataChange('duration', parseInt(e.target.value) || 8)}
                        error={formData.duration <= 0}
                        helperText="Tetkikin tahmini süresi (saat cinsinden)"
                        inputProps={{ min: 1, max: 40 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ClockIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      
                      <Autocomplete
                        multiple
                        options={standardsList}
                        value={formData.standards}
                        onChange={(_, newValue) => handleFormDataChange('standards', newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Uygulanacak Standartlar"
                            error={formData.standards.length === 0}
                            helperText={formData.standards.length === 0 ? 'En az bir standart seçiniz' : `${formData.standards.length} standart seçildi`}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start">
                                    <StandardIcon color="primary" />
                                  </InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              label={option}
                              size="small"
                              color="info"
                              variant="outlined"
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                      />
                    </Box>
                  </StepContent>
                </Step>

                {/* Step 4: Takım ve Sorumlu */}
                <Step>
                  <StepLabel 
                    icon={getStepIcon(3)}
                    error={formStep > 3 && !validateStep(3)}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Denetçi Takımı ve Sorumlu Kişiler
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Denetçiler ve denetlenecek kişiler
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ display: 'grid', gap: 3, mb: 3 }}>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                          Denetçi Takımı Seçimi
                        </Typography>
                        <Typography variant="caption">
                          Mevcut aktif denetçiler arasından tetkik takımını oluşturun. 
                          En az bir baş denetçi veya denetçi seçmelisiniz.
                        </Typography>
                      </Alert>
                      
                      <FormControl fullWidth>
                        <Typography variant="subtitle2" gutterBottom>
                          Denetçi Takımı ({formData.auditorTeam.length} kişi seçildi)
                        </Typography>
                        <List sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          {auditors.filter(a => a.isActive).map((auditor) => (
                            <ListItem key={auditor.id} dense>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={formData.auditorTeam.some(member => member.id === auditor.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        handleFormDataChange('auditorTeam', [...formData.auditorTeam, auditor]);
                                      } else {
                                        handleFormDataChange('auditorTeam', formData.auditorTeam.filter(member => member.id !== auditor.id));
                                      }
                                    }}
                                  />
                                }
                                label={
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                      <PersonIcon fontSize="small" />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" fontWeight={600}>
                                        {auditor.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {auditor.role === 'lead_auditor' ? 'Baş Denetçi' :
                                         auditor.role === 'auditor' ? 'Denetçi' :
                                         auditor.role === 'observer' ? 'Gözlemci' : 'Teknik Uzman'} - {auditor.department}
                                      </Typography>
                                    </Box>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                        {formData.auditorTeam.length === 0 && (
                          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                            En az bir denetçi seçmelisiniz
                          </Typography>
                        )}
                      </FormControl>
                      
                      <Autocomplete
                        multiple
                        freeSolo
                        options={['Ahmet Yılmaz', 'Fatma Demir', 'Mehmet Özkan', 'Ayşe Kaya', 'Osman Çelik']}
                        value={formData.auditees}
                        onChange={(_, newValue) => handleFormDataChange('auditees', newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Denetlenecek Kişiler"
                            helperText="İsim yazarak yeni kişi ekleyebilir veya mevcut listeden seçebilirsiniz"
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <InputAdornment position="start">
                                    <PersonIcon color="primary" />
                                  </InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              label={option}
                              size="small"
                              color="default"
                              variant="outlined"
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                      />
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>
            </Box>
          )}
          
          {/* Finding Dialog */}
          {dialogType === 'finding' && (
            <Box>
              <Stepper activeStep={formStep} orientation="vertical">
                {/* Step 1: Bulgu Temel Bilgileri */}
                <Step>
                  <StepLabel 
                    icon={getStepIcon(0)}
                    error={formStep > 0 && !validateStep(0)}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Bulgu Temel Bilgileri
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bulgu türü, numarası ve açıklama
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ display: 'grid', gap: 3, mb: 3 }}>
                      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                        <TextField
                          label="Bulgu Numarası"
                          value={formData.findingNumber}
                          onChange={(e) => handleFormDataChange('findingNumber', e.target.value)}
                          required
                          placeholder="Ör: BGU-2024-001"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <NumbersIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                        
                        <FormControl required>
                          <InputLabel>Bulgu Türü</InputLabel>
                          <Select
                            value={formData.type}
                            onChange={(e) => handleFormDataChange('type', e.target.value)}
                            label="Bulgu Türü"
                          >
                            <MenuItem value="nonconformity">Uygunsuzluk</MenuItem>
                            <MenuItem value="improvement_opportunity">İyileştirme Fırsatı</MenuItem>
                            <MenuItem value="positive_finding">Olumlu Bulgu</MenuItem>
                            <MenuItem value="observation">Gözlem</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                        <FormControl required>
                          <InputLabel>Önem Derecesi</InputLabel>
                          <Select
                            value={formData.severity}
                            onChange={(e) => handleFormDataChange('severity', e.target.value)}
                            label="Önem Derecesi"
                          >
                            <MenuItem value="major">Majör</MenuItem>
                            <MenuItem value="minor">Minör</MenuItem>
                            <MenuItem value="observation">Gözlem</MenuItem>
                          </Select>
                        </FormControl>

                        <TextField
                          label="Kategori"
                          value={formData.category}
                          onChange={(e) => handleFormDataChange('category', e.target.value)}
                          required
                          placeholder="Ör: Doküman Kontrolü"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CategoryIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>

                      <TextField
                        label="Bulgu Açıklaması"
                        value={formData.description}
                        onChange={(e) => handleFormDataChange('description', e.target.value)}
                        required
                        multiline
                        rows={4}
                        placeholder="Bulgunu detaylı olarak açıklayın..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DescriptionIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </StepContent>
                </Step>

                {/* Step 2: Standart ve Gereksinimler */}
                <Step>
                  <StepLabel 
                    icon={getStepIcon(1)}
                    error={formStep > 1 && !validateStep(1)}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Standart ve Gereksinimler
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      İlgili standart maddeleri ve gereksinimler
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ display: 'grid', gap: 3, mb: 3 }}>
                      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                        <TextField
                          label="Standart Maddesi"
                          value={formData.clause}
                          onChange={(e) => handleFormDataChange('clause', e.target.value)}
                          required
                          placeholder="Ör: ISO 9001:2015 - 8.5.1"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ArticleIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />

                        <FormControl required>
                          <InputLabel>Departman</InputLabel>
                          <Select
                            value={formData.department}
                            onChange={(e) => handleFormDataChange('department', e.target.value)}
                            label="Departman"
                          >
                            <MenuItem value="Üretim">Üretim</MenuItem>
                            <MenuItem value="Kalite">Kalite</MenuItem>
                            <MenuItem value="Satın Alma">Satın Alma</MenuItem>
                            <MenuItem value="İK">İnsan Kaynakları</MenuItem>
                            <MenuItem value="Çevre">Çevre</MenuItem>
                            <MenuItem value="İSG">İş Sağlığı ve Güvenliği</MenuItem>
                            <MenuItem value="Ar-Ge">Ar-Ge</MenuItem>
                            <MenuItem value="Pazarlama">Pazarlama</MenuItem>
                            <MenuItem value="Finans">Finans</MenuItem>
                            <MenuItem value="Bilgi İşlem">Bilgi İşlem</MenuItem>
                            <MenuItem value="Genel Müdürlük">Genel Müdürlük</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <TextField
                        label="Gereksinim/Kriter"
                        value={formData.requirement}
                        onChange={(e) => handleFormDataChange('requirement', e.target.value)}
                        required
                        multiline
                        rows={3}
                        placeholder="İlgili standardın gereksinimini yazın..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AssignmentIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        label="Kanıt/Delil"
                        value={formData.evidence}
                        onChange={(e) => handleFormDataChange('evidence', e.target.value)}
                        required
                        multiline
                        rows={3}
                        placeholder="Bulgunu destekleyen kanıtları yazın..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FindInPageIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </StepContent>
                </Step>

                {/* Step 3: Lokasyon ve Sorumlu */}
                <Step>
                  <StepLabel 
                    icon={getStepIcon(2)}
                    error={formStep > 2 && !validateStep(2)}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Lokasyon ve Sorumlu Bilgileri
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bulgunun keşfedildiği yer ve sorumlu kişiler
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ display: 'grid', gap: 3, mb: 3 }}>
                      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                        <TextField
                          label="Lokasyon/Yer"
                          value={formData.location}
                          onChange={(e) => handleFormDataChange('location', e.target.value)}
                          required
                          placeholder="Ör: Üretim Sahası - A Blok"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOnIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />

                        <TextField
                          label="Süreç"
                          value={formData.process}
                          onChange={(e) => handleFormDataChange('process', e.target.value)}
                          required
                          placeholder="Ör: Kaynak İşlemi"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SettingsIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>

                      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                        <TextField
                          label="Keşif Tarihi"
                          type="date"
                          value={formData.discoveredDate}
                          onChange={(e) => handleFormDataChange('discoveredDate', e.target.value)}
                          required
                          InputLabelProps={{
                            shrink: true,
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <DateRangeIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />

                        <TextField
                          label="Keşfeden Kişi"
                          value={formData.discoveredBy}
                          onChange={(e) => handleFormDataChange('discoveredBy', e.target.value)}
                          required
                          placeholder="Denetçi adı"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>

                      <FormControl required>
                        <InputLabel>Öncelik Düzeyi</InputLabel>
                        <Select
                          value={formData.priority}
                          onChange={(e) => handleFormDataChange('priority', e.target.value)}
                          label="Öncelik Düzeyi"
                        >
                          <MenuItem value="low">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip size="small" color="success" label="Düşük" />
                              <Typography variant="body2">30 gün içinde</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="medium">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip size="small" color="warning" label="Orta" />
                              <Typography variant="body2">15 gün içinde</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="high">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip size="small" color="error" label="Yüksek" />
                              <Typography variant="body2">7 gün içinde</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="critical">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip size="small" color="error" label="Kritik" />
                              <Typography variant="body2">Derhal</Typography>
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>
            </Box>
          )}

          {/* Action Dialog */}
          {dialogType === 'action' && (
            <Box>
              <Alert severity="info" sx={{ mb: 2, bgcolor: 'primary.50', border: 1, borderColor: 'primary.200' }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Aksiyon Ataması ve Takibi
                </Typography>
                <Typography variant="caption">
                  Bulgulara karşı alınacak önleyici/düzeltici aksiyonları planlayın, sorumlularını atayın ve takip edin.
                  Tüm adımları tamamlayarak profesyonel aksiyon planı oluşturun.
                </Typography>
              </Alert>
              
              <Stepper activeStep={formStep} orientation="vertical">
                {/* Step 1: Aksiyon Temel Bilgileri */}
                <Step>
                  <StepLabel 
                    icon={getStepIcon(0)}
                    error={formStep > 0 && !validateStep(0)}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Aksiyon Temel Bilgileri
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Aksiyon numarası, türü ve detaylı açıklama
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ display: 'grid', gap: 3, mb: 3 }}>
                      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                        <TextField
                          label="Aksiyon Numarası"
                          value={formData.actionNumber}
                          onChange={(e) => handleFormDataChange('actionNumber', e.target.value)}
                          required
                          placeholder="Ör: AKS-2024-001"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                                                 <AssignmentIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />

                        <FormControl required>
                          <InputLabel>Aksiyon Türü</InputLabel>
                          <Select
                            value={formData.actionType}
                            onChange={(e) => handleFormDataChange('actionType', e.target.value)}
                            label="Aksiyon Türü"
                          >
                            <MenuItem value="corrective">
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip size="small" color="error" label="Düzeltici" />
                                <Typography variant="body2">Mevcut hatayı düzelt</Typography>
                              </Box>
                            </MenuItem>
                            <MenuItem value="preventive">
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip size="small" color="warning" label="Önleyici" />
                                <Typography variant="body2">Gelecekteki hatayı önle</Typography>
                              </Box>
                            </MenuItem>
                            <MenuItem value="improvement">
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip size="small" color="success" label="İyileştirme" />
                                <Typography variant="body2">Süreci geliştir</Typography>
                              </Box>
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <TextField
                        label="Detaylı Aksiyon Açıklaması"
                        value={formData.actionDescription}
                        onChange={(e) => handleFormDataChange('actionDescription', e.target.value)}
                        required
                        multiline
                        rows={4}
                        placeholder="Alınacak aksiyonun detaylı açıklaması..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DescriptionIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <FormControl required>
                        <InputLabel>Öncelik Düzeyi</InputLabel>
                        <Select
                          value={formData.priority}
                          onChange={(e) => handleFormDataChange('priority', e.target.value)}
                          label="Öncelik Düzeyi"
                        >
                          <MenuItem value="low">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip size="small" color="success" label="Düşük" />
                              <Typography variant="body2">60 gün içinde</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="medium">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip size="small" color="warning" label="Orta" />
                              <Typography variant="body2">30 gün içinde</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="high">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip size="small" color="error" label="Yüksek" />
                              <Typography variant="body2">15 gün içinde</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="critical">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip size="small" color="error" label="Kritik" />
                              <Typography variant="body2">7 gün içinde</Typography>
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </StepContent>
                </Step>

                {/* Step 2: Sorumlu ve Zamanlama */}
                <Step>
                  <StepLabel 
                    icon={getStepIcon(1)}
                    error={formStep > 1 && !validateStep(1)}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Sorumlu ve Zamanlama
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Sorumlu kişi, hedef tarih ve beklenen sonuç
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ display: 'grid', gap: 3, mb: 3 }}>
                      <Autocomplete
                        options={departments.map(dept => `${dept} Sorumlusu`)}
                        freeSolo
                        value={formData.responsible}
                        onChange={(event, newValue) => {
                          handleFormDataChange('responsible', newValue || '');
                        }}
                        onInputChange={(event, newInputValue) => {
                          handleFormDataChange('responsible', newInputValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Sorumlu Kişi/Departman"
                            required
                            placeholder="Aksiyon sorumlusu seçin veya yazın"
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonIcon color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />

                      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                        <TextField
                          label="Hedef Tamamlanma Tarihi"
                          type="date"
                          value={formData.targetDate}
                          onChange={(e) => handleFormDataChange('targetDate', e.target.value)}
                          required
                          InputLabelProps={{
                            shrink: true,
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <DateRangeIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />

                        <TextField
                          label="Bütçe (TL)"
                          type="number"
                          value={formData.budget}
                          onChange={(e) => handleFormDataChange('budget', Number(e.target.value))}
                          placeholder="0"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                                                 <AttachIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>

                      <TextField
                        label="Beklenen Sonuç"
                        value={formData.expectedResult}
                        onChange={(e) => handleFormDataChange('expectedResult', e.target.value)}
                        required
                        multiline
                        rows={3}
                        placeholder="Bu aksiyondan beklenen somut sonuçlar..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                                                             <StarIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        label="Risk Değerlendirmesi"
                        value={formData.riskAssessment}
                        onChange={(e) => handleFormDataChange('riskAssessment', e.target.value)}
                        multiline
                        rows={2}
                        placeholder="Aksiyonla ilgili riskler ve önlemler..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <WarningIcon color="warning" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </StepContent>
                </Step>

                {/* Step 3: Kaynak ve Doğrulama */}
                <Step>
                  <StepLabel 
                    icon={getStepIcon(2)}
                    error={formStep > 2 && !validateStep(2)}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Kaynak ve Doğrulama
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Gerekli kaynaklar ve etkinlik doğrulama yöntemi
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ display: 'grid', gap: 3, mb: 3 }}>
                      <TextField
                        label="Gerekli Kaynaklar"
                        value={formData.resources}
                        onChange={(e) => handleFormDataChange('resources', e.target.value)}
                        required
                        multiline
                        rows={3}
                        placeholder="İnsan kaynağı, malzeme, ekipman, eğitim vb..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                                                             <SettingsIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <Box display="grid" gridTemplateColumns="auto 1fr" gap={2} alignItems="center">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.verificationRequired}
                              onChange={(e) => handleFormDataChange('verificationRequired', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Etkinlik Doğrulaması Gerekli"
                        />
                      </Box>

                      {formData.verificationRequired && (
                        <>
                          <TextField
                            label="Doğrulama Yöntemi"
                            value={formData.verificationMethod}
                            onChange={(e) => handleFormDataChange('verificationMethod', e.target.value)}
                            required
                            multiline
                            rows={2}
                            placeholder="Nasıl doğrulanacak? (Test, gözlem, ölçüm, inceleme vb.)"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <VerifiedIcon color="success" />
                                </InputAdornment>
                              ),
                            }}
                          />

                          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                            <TextField
                              label="Doğrulama Tarihi"
                              type="date"
                              value={formData.verificationDate}
                              onChange={(e) => handleFormDataChange('verificationDate', e.target.value)}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                                                         <CalendarIcon color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                            />

                            <TextField
                              label="Doğrulama Sorumlusu"
                              value={formData.verificationBy}
                              onChange={(e) => handleFormDataChange('verificationBy', e.target.value)}
                              placeholder="Doğrulama yapacak kişi"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonIcon color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Box>
                        </>
                      )}

                      <TextField
                        label="Başarı Kriterleri"
                        value={formData.successCriteria}
                        onChange={(e) => handleFormDataChange('successCriteria', e.target.value)}
                        required
                        multiline
                        rows={3}
                        placeholder="Aksiyonun başarılı olduğu nasıl anlaşılacak? Ölçülebilir kriterler..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TrendingUpIcon color="success" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          {(dialogType === 'plan' || dialogType === 'finding' || dialogType === 'action') && (
            <Box display="flex" justifyContent="space-between" width="100%">
              <Button
                variant="outlined"
                onClick={handlePrevStep}
                disabled={formStep === 0}
                startIcon={<ExpandMoreIcon sx={{ transform: 'rotate(90deg)' }} />}
              >
                Önceki
              </Button>
              
              <Box display="flex" gap={1}>
                <Button onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                
                {((dialogType === 'plan' && formStep < 3) || 
                  (dialogType === 'finding' && formStep < 2) || 
                  (dialogType === 'action' && formStep < 2)) ? (
                  <Button
                    variant="contained"
                    onClick={handleNextStep}
                    disabled={!validateStep(formStep)}
                    endIcon={<ExpandMoreIcon sx={{ transform: 'rotate(-90deg)' }} />}
                  >
                    Sonraki
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleSaveItem}
                    disabled={!validateStep(formStep)}
                    startIcon={<SaveIcon />}
                    color="success"
                  >
                    {dialogType === 'plan' ? 'Tetkik Planını Kaydet' : 
                     dialogType === 'finding' ? 'Bulguyu Kaydet' : 
                     'Aksiyonu Kaydet'}
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </DialogActions>
      </Dialog>

      {/* Soru Listesi Oluşturma/Düzenleme Dialog */}
      <Dialog
        open={questionSetDialogOpen}
        onClose={() => setQuestionSetDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <QuizIcon color="primary" />
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {selectedQuestionSet ? 'Soru Listesini Düzenle' : 'Yeni Soru Listesi Oluştur'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Departman için özel tetkik soru listesi oluşturun
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setQuestionSetDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ p: 2 }}>
            {/* Temel Bilgiler */}
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>Temel Bilgiler</Typography>
              <Box display="grid" gap={2}>
                <TextField
                  label="Departman Adı"
                  value={questionSetFormData.departmentName}
                  onChange={(e) => setQuestionSetFormData(prev => ({...prev, departmentName: e.target.value}))}
                  required
                  fullWidth
                />
                <TextField
                  label="Açıklama"
                  value={questionSetFormData.description}
                  onChange={(e) => setQuestionSetFormData(prev => ({...prev, description: e.target.value}))}
                  multiline
                  rows={2}
                  fullWidth
                />
                <TextField
                  label="Tahmini Süre (dakika)"
                  type="number"
                  value={questionSetFormData.estimatedDuration}
                  onChange={(e) => setQuestionSetFormData(prev => ({...prev, estimatedDuration: parseInt(e.target.value)}))}
                  fullWidth
                />
              </Box>
            </Box>

            {/* Sorular */}
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Sorular ({questionSetFormData.questions.length})</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddQuestion}
                  size="small"
                >
                  Soru Ekle
                </Button>
              </Box>
              
              {questionSetFormData.questions
                .map((question, originalIndex) => ({ question, originalIndex }))
                .filter((item, index, self) => 
                  index === self.findIndex(i => i.question.questionNumber === item.question.questionNumber)
                )
                .sort((a, b) => parseInt(a.question.questionNumber) - parseInt(b.question.questionNumber))
                .map(({ question, originalIndex }) => (
                <Paper key={originalIndex} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, minWidth: '80px' }}>
                      Soru {question.questionNumber}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteQuestion(originalIndex)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Box display="grid" gap={2}>
                    <TextField
                      label="Soru Metni"
                      value={question.questionText}
                      onChange={(e) => handleUpdateQuestion(originalIndex, 'questionText', e.target.value)}
                      multiline
                      rows={2}
                      fullWidth
                    />
                    
                    <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                      <FormControl>
                        <InputLabel>Kategori</InputLabel>
                        <Select
                          value={question.category}
                          onChange={(e) => handleUpdateQuestion(originalIndex, 'category', e.target.value)}
                          label="Kategori"
                        >
                          <MenuItem value="iso9001">ISO 9001</MenuItem>
                          <MenuItem value="iso14001">ISO 14001</MenuItem>
                          <MenuItem value="iso45001">ISO 45001</MenuItem>
                          <MenuItem value="ts3834">TS 3834</MenuItem>
                          <MenuItem value="general">Genel</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <TextField
                        label="Standart Maddesi"
                        value={question.standardClause}
                        onChange={(e) => handleUpdateQuestion(originalIndex, 'standardClause', e.target.value)}
                      />
                      
                      <FormControl>
                        <InputLabel>Ağırlık</InputLabel>
                        <Select
                          value={question.weight}
                          onChange={(e) => handleUpdateQuestion(originalIndex, 'weight', e.target.value)}
                          label="Ağırlık"
                        >
                          <MenuItem value={1}>1 - Düşük</MenuItem>
                          <MenuItem value={2}>2 - Düşük-Orta</MenuItem>
                          <MenuItem value={3}>3 - Orta</MenuItem>
                          <MenuItem value={4}>4 - Yüksek</MenuItem>
                          <MenuItem value={5}>5 - Kritik</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    
                    <Box display="flex" gap={2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={question.isRequired}
                            onChange={(e) => handleUpdateQuestion(originalIndex, 'isRequired', e.target.checked)}
                          />
                        }
                        label="Zorunlu"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={question.isCritical}
                            onChange={(e) => handleUpdateQuestion(originalIndex, 'isCritical', e.target.checked)}
                          />
                        }
                        label="Kritik (Uygunsuzluk Açma Zorunlu)"
                      />
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setQuestionSetDialogOpen(false)}>
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveQuestionSet}
            startIcon={<SaveIcon />}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Soru Listesi Görüntüleme Dialog */}
      <Dialog
        open={questionViewDialogOpen}
        onClose={() => setQuestionViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <ViewIcon color="primary" />
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {selectedQuestionSet?.departmentName} - Soru Listesi
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedQuestionSet?.questions.length} soru • v{selectedQuestionSet?.version}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setQuestionViewDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedQuestionSet && (
            <Box>
              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {selectedQuestionSet.description}
                </Typography>
                <Box display="flex" gap={2}>
                  <Chip label={`${selectedQuestionSet.questions.length} Soru`} size="small" />
                  <Chip label={`~${selectedQuestionSet.estimatedDuration} dk`} size="small" />
                  <Chip 
                    label={selectedQuestionSet.isActive ? 'Aktif' : 'Pasif'} 
                    size="small" 
                    color={selectedQuestionSet.isActive ? 'success' : 'default'}
                  />
                </Box>
              </Box>
              
              <List>
                {selectedQuestionSet.questions
                  .filter((question, index, self) => 
                    index === self.findIndex(q => q.questionNumber === question.questionNumber)
                  )
                  .sort((a, b) => parseInt(a.questionNumber) - parseInt(b.questionNumber))
                  .map((question, index) => (
                  <ListItem key={question.id} divider>
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
                            Soru {question.questionNumber}
                          </Typography>
                          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                            {question.questionText}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box mt={1}>
                          <Box display="flex" gap={1} mb={1}>
                            <Chip label={question.category.toUpperCase()} size="small" variant="outlined" />
                            <Chip label={question.standardClause} size="small" variant="outlined" />
                            <Chip 
                              label={`Ağırlık: ${question.weight}`} 
                              size="small" 
                              color={question.weight >= 4 ? 'error' : question.weight >= 3 ? 'warning' : 'default'}
                            />
                            {question.isCritical && (
                              <Chip label="Kritik" size="small" color="error" />
                            )}
                          </Box>
                          {question.guidelines && (
                            <Typography variant="caption" color="text.secondary">
                              Rehber: {question.guidelines}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setQuestionViewDialogOpen(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default InternalAuditManagement; 