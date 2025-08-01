import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import {
  Typography, Box, Paper, Card, CardContent, CardHeader, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Tabs, Tab, Avatar, Grid, IconButton, Tooltip, Alert, Snackbar,
  List, ListItem, ListItemText, ListItemIcon, Switch, FormControlLabel,
  Accordion, AccordionSummary, AccordionDetails, Badge, Divider, Checkbox,
  CircularProgress, Autocomplete, LinearProgress, ButtonGroup, TablePagination,
  Slider
} from '@mui/material';
import {
  Business as BusinessIcon, Add as AddIcon, Dashboard as DashboardIcon,
  Assessment as AssessmentIcon, Warning as WarningIcon, Edit as EditIcon,
  Delete as DeleteIcon, Link as LinkIcon, Schedule as ScheduleIcon,
  BugReport as BugReportIcon, Report as ReportIcon, CheckCircle as CheckCircleIcon,
  SwapHoriz as SwapHorizIcon, Visibility as VisibilityIcon, ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon, Security as SecurityIcon, Star as StarIcon,
  Search as SearchIcon, Error as ErrorIcon, FileDownload as FileDownloadIcon,
  ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon, Info as InfoIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  CloudUpload as UploadIcon, AttachFile as AttachFileIcon, Download as DownloadIcon,
  AttachMoney as AttachMoneyIcon, ViewList as ViewListIcon
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// ✅ GELIŞMIŞ PDF DEPOLAMA SİSTEMİ - IndexedDB ile (Supplier Audits için)
class SupplierAuditPDFStorage {
  private dbName = 'SupplierQualityDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('audit-attachments')) {
          db.createObjectStore('audit-attachments', { keyPath: 'id' });
        }
      };
    });
  }

  async saveAttachment(attachmentId: string, fileData: string, fileName: string, size: number, fileType: string): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audit-attachments'], 'readwrite');
      const store = transaction.objectStore('audit-attachments');
      
      const request = store.put({
        id: attachmentId,
        fileData,
        fileName,
        size,
        fileType,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAttachment(attachmentId: string): Promise<any> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audit-attachments'], 'readonly');
      const store = transaction.objectStore('audit-attachments');
      const request = store.get(attachmentId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audit-attachments'], 'readwrite');
      const store = transaction.objectStore('audit-attachments');
      const request = store.delete(attachmentId);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllAttachments(): Promise<any[]> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audit-attachments'], 'readonly');
      const store = transaction.objectStore('audit-attachments');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllAttachments(): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audit-attachments'], 'readwrite');
      const store = transaction.objectStore('audit-attachments');
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageInfo(): Promise<{ used: number; attachments: number }> {
    try {
      const attachments = await this.getAllAttachments();
      const used = attachments.reduce((total, att) => total + (att.size || 0), 0);
      return { used, attachments: attachments.length };
    } catch (error) {
      console.error('Storage info error:', error);
      return { used: 0, attachments: 0 };
    }
  }
}

// ============================================
// KUSURSUZ ARAMA COMPONENT'İ
// ============================================

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
  
  // Input ref - focus yönetimi için
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Clear trigger etkisi - sadece external clear için
  useEffect(() => {
    if (clearTrigger > 0) {
      console.log('🧹 External clear trigger activated');
      setLocalValue('');
      if (inputRef.current) {
        inputRef.current.focus(); // Clear sonrası focus kal
      }
    }
  }, [clearTrigger]);
  
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
      <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
    ),
    sx: { bgcolor: 'white' }
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

// ✅ GLOBAL PDF STORAGE MANAGER
const auditPDFStorage = new SupplierAuditPDFStorage();

// ============================================
// Enhanced interfaces for comprehensive supplier management
interface Supplier {
  id: string;
  name: string;
  type: 'onaylı' | 'alternatif' | 'potansiyel' | 'bloklu';
  category: 'stratejik' | 'kritik' | 'rutin' | 'genel';
  // Yeni tedarik türü alanları
  supplyType: 'malzeme' | 'hizmet' | 'hibrit';
  supplySubcategories: string[];
  contact: {
    email: string;
    phone: string;
    address: string;
    contactPerson: string;
  };
  materialTypes: string[];
  performanceScore: number;
  qualityScore: number;
  deliveryScore: number;
  riskLevel: 'düşük' | 'orta' | 'yüksek' | 'kritik';
  status: 'aktif' | 'pasif' | 'denetimde' | 'bloklu';
  registrationDate: string;
  lastAuditDate: string;
  nextAuditDate: string;
  auditStatus: 'planlı' | 'gecikmiş' | 'tamamlandı';
  nonconformityCount: number;
  defectCount: number;
  dofCount: number;
  isActive: boolean;
  attachments?: Attachment[]; // Dosya ekleri
}

interface SupplierPair {
  id: string;
  primarySupplier?: Supplier; // Ana tedarikçi opsiyonel
  alternativeSuppliers: Supplier[];
  category: string;
  performanceComparison: {
    primaryScore?: number; // Ana tedarikçi yoksa opsiyonel
    alternativeScores: { id: string; score: number }[];
    recommendation: string;
  };
  lastReviewDate: string;
  nextReviewDate: string;
}

interface AuditRecord {
  id: string;
  supplierId: string;
  auditDate: string; // Planlanan tarih
  actualAuditDate?: string; // Gerçekleştirilen tarih (opsiyonel)
  auditType: 'planlı' | 'ani' | 'takip' | 'acil' | 'kapsamlı';
  auditorName: string;
  score: number;
  findings: string[];
  status: 'planlı' | 'devam_ediyor' | 'tamamlandı' | 'gecikmiş' | 'iptal';
  nextAuditDate: string;
  isAutoScheduled: boolean;
  // Gecikme yönetimi
  delayReason?: string; // Gecikme açıklaması
  delayDays?: number; // Kaç gün gecikti
  isDelayed?: boolean; // Gecikmiş mi?
  attachments?: Attachment[]; // Dosya ekleri
}

interface NonconformityRecord {
  id: string;
  supplierId: string;
  title: string;
  description: string;
  category: 'kalite' | 'teslimat' | 'doküman' | 'servis';
  severity: 'kritik' | 'yüksek' | 'orta' | 'düşük';
  detectedDate: string;
  status: 'açık' | 'araştırılıyor' | 'düzeltiliyor' | 'kapalı';
  dueDate: string;

  dofId?: string;
  recurrence: boolean;
  // Yeni zorunlu alanlar
  partCode: string; // Zorunlu parça kodu
  quantityAffected?: number; // Kalite problemi için etkilenen adet
  delayDays?: number; // Teslimat problemi için gecikme günü
}

interface DefectRecord {
  id: string;
  supplierId: string;
  defectType: string;
  description: string;
  quantity: number;
  detectedDate: string;
  batchNumber: string;
  severity: 'kritik' | 'major' | 'minor';
  status: 'açık' | 'düzeltildi' | 'kabul';

  dofId?: string;
}

// Otomatik denetim önerisi interface
interface AutoAuditRecommendation {
  id: string;
  supplierId: string;
  supplierName: string;
  reason: string;
  urgencyLevel: 'düşük' | 'orta' | 'yüksek' | 'kritik';
  recommendedDate: string;
  performanceIssues: string[];
  currentScore: number;
  previousScore: number;
  riskFactors: string[];
  auditType: 'performans' | 'kalite' | 'teslimat' | 'kapsamlı';
  estimatedDuration: number; // hours
  priority: number; // 1-5
  autoGenerated: boolean;
  createdAt: string;
}

// Dosya ekleri interface - MaterialCertificateTracking modülünden uyarlandı
interface Attachment {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  type: string;
  hasFile?: boolean; // IndexedDB'de dosya var mı?
  url?: string; // Geriye uyumluluk için opsiyonel
}

// Tedarik türü alt kategorileri
const SUPPLY_SUBCATEGORIES = {
  malzeme: [
    'Ambalaj Malzemeleri',
    'Bağlantı Elemanları ve Fittings',
    'Conta ve Sızdırmazlık Elemanları',
    'Dişli ve Dişli Kutuları',
    'Egzoz Sistemi Parçaları',
    'Elektrik ve Elektronik Parçalar',
    'Elektronik Komponentler',
    'Filtre Sistemleri (Endüstriyel)',
    'Filtre Sistemleri (Hava, Yağ, Yakıt)',
    'Fırça Sistemleri (Cam Silecek, Temizlik)',
    'Fırça ve Temizlik Sistemleri',
    'Fren Sistemi Parçaları',
    'Ham Madde (Çelik, Alüminyum, Plastik)',
    'Hidrolik Sistem Parçaları',
    'Hidrolik ve Pnömatik Komponentler',
    'Kabin Profil Alımı',
    'Kablaj ve Elektrik Bağlantıları',
    'Karoseri ve Şasi Parçaları',
    'Kavrama ve Fren Sistemi',
    'Kayış ve Zincir Parçaları',
    'Kilit Sistemleri ve Güvenlik',
    'Kilit ve Güvenlik Sistemleri',
    'Kimyasal Maddeler (Boya, Temizlik)',
    'Koltuk Sistemleri ve İç Donanım',
    'Kompresör ve Hava Kurutu',
    'Kontrol Sistemleri',
    'Lastik ve Jant',
    'Mil ve Şaft Parçaları',
    'Motor Parçaları (Piston, Volan, Blok)',
    'Sensörler ve Aktüatörler',
    'Soğutma Sistemi Parçaları',
    'Standart Parçalar (Vida, Somun, Rondela)',
    'Süspansiyon ve Direksiyon Parçaları',
    'Şanzıman ve Aktarım Organları',
    'Yağlama Malzemeleri',
    'Yapıştırıcı ve Sızdırmazlık Malzemeleri',
    'Yarı Mamul (Profil, Sac, Boru)',
    'Yataklar ve Yatak Yuvaları',
    'Yay ve Amortisör Parçaları'
  ],
  hizmet: [
    'Bakım ve Onarım Hizmetleri',
    'Danışmanlık Hizmetleri',
    'Isıl İşlem Hizmetleri',
    'Kalibrasyon Hizmetleri',
    'Lojistik ve Nakliye',
    'Makine İşleme Hizmetleri',
    'Taşeron İşçilik (Kaynak, Montaj)',
    'Temizlik ve Bakım Hizmetleri',
    'Test ve Muayene Hizmetleri',
    'Yüzey Kaplama Hizmetleri'
  ],
  hibrit: [
    'İşleme + Kaplama',
    'Malzeme + Lojistik',
    'Montaj + Bakım',
    'Tasarım + Üretim',
    'Test + Sertifikasyon',
    'Üretim + Test'
  ]
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 SupplierQualityManagement Error Boundary yakaladı:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={3}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tedarikçi Kalite Yönetimi Modülü Hatası
            </Typography>
            <Typography variant="body2" gutterBottom>
              {this.state.error?.message || 'Bilinmeyen bir hata oluştu'}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              sx={{ mt: 2 }}
            >
              Sayfayı Yenile
            </Button>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

const SupplierQualityManagement: React.FC = () => {
  // State Management
  const [currentTab, setCurrentTab] = useState(0);
  const [qualityIssuesTab, setQualityIssuesTab] = useState(0); // 0: Uygunsuzluklar, 1: Hatalar
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierPairs, setSupplierPairs] = useState<SupplierPair[]>([]);
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [nonconformities, setNonconformities] = useState<NonconformityRecord[]>([]);
  const [defects, setDefects] = useState<DefectRecord[]>([]);
  const [autoAuditRecommendations, setAutoAuditRecommendations] = useState<AutoAuditRecommendation[]>([]);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'supplier' | 'pair' | 'nonconformity' | 'defect' | 'audit'>('supplier');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  
  // Audit date edit dialog
  const [auditDateDialogOpen, setAuditDateDialogOpen] = useState(false);
  const [selectedSupplierForAudit, setSelectedSupplierForAudit] = useState<Supplier | null>(null);
  const [newAuditDate, setNewAuditDate] = useState('');
  
  // Audit execution dialog
  const [auditExecutionDialogOpen, setAuditExecutionDialogOpen] = useState(false);
  const [selectedAuditForExecution, setSelectedAuditForExecution] = useState<AuditRecord | null>(null);
  const [auditScore, setAuditScore] = useState<number>(0);
  const [auditFindings, setAuditFindings] = useState<string>('');
  const [auditActualDate, setAuditActualDate] = useState<string>('');
  const [auditDelayReason, setAuditDelayReason] = useState<string>('');
  const [delayDays, setDelayDays] = useState<number>(0);
  const [isDelayed, setIsDelayed] = useState<boolean>(false);
  
  // Audit details view dialog
  const [auditDetailsDialogOpen, setAuditDetailsDialogOpen] = useState(false);
  const [selectedAuditForView, setSelectedAuditForView] = useState<AuditRecord | null>(null);
  
  // Audit attachments view dialog
  const [auditAttachmentsDialogOpen, setAuditAttachmentsDialogOpen] = useState(false);
  const [selectedAuditForAttachments, setSelectedAuditForAttachments] = useState<AuditRecord | null>(null);
  
  // Auto-audit settings
  const [autoAuditEnabled, setAutoAuditEnabled] = useState(true);
  const [auditInterval, setAuditInterval] = useState(90); // days
  
  // Performance radar settings
  const [selectedSuppliersForRadar, setSelectedSuppliersForRadar] = useState<string[]>([]);
  
  // Notification
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Search and filter states - Tedarikçi Listesi
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierTypeFilter, setSupplierTypeFilter] = useState('all');
  const [supplierCategoryFilter, setSupplierCategoryFilter] = useState('all');
  const [supplierStatusFilter, setSupplierStatusFilter] = useState('all');
  const [supplierRiskFilter, setSupplierRiskFilter] = useState('all');

  // ✅ CLEAR TRIGGER - Arama kutusunu temizlemek için
  const [clearTrigger, setClearTrigger] = useState(0);

  // ✅ ULTRA İZOLE EDİLMİŞ ARAMA HANDLER - HİÇBİR RE-RENDER TETİKLEMEZ
  const handleDebouncedSearchChange = useCallback((debouncedSearchTerm: string) => {
    console.log('🔍 Debounced arama terimi geldi:', debouncedSearchTerm);
    setSearchTerm(prev => {
      // Eğer değer değişmemişse state'i güncelleme
      if (prev === debouncedSearchTerm) {
        console.log('🔍 Arama terimi aynı, state güncellenmeyecek');
        return prev;
      }
      console.log('🔍 Arama terimi farklı, state güncelleniyor:', debouncedSearchTerm);
      return debouncedSearchTerm;
    });
  }, []);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Search and filter states - Tedarikçi Eşleştirme
  const [pairingSearchTerm, setPairingSearchTerm] = useState('');
  const [pairingCategoryFilter, setPairingCategoryFilter] = useState('all');
  const [pairingStatusFilter, setPairingStatusFilter] = useState('all'); // primary-missing, alternatives-only, complete

  // ✅ PAIRING CLEAR TRIGGER
  const [pairingClearTrigger, setPairingClearTrigger] = useState(0);

  // ✅ PAIRING ARAMA HANDLER
  const handlePairingDebouncedSearchChange = useCallback((debouncedSearchTerm: string) => {
    console.log('🔍 Pairing arama terimi geldi:', debouncedSearchTerm);
    setPairingSearchTerm(prev => {
      if (prev === debouncedSearchTerm) {
        return prev;
      }
      return debouncedSearchTerm;
    });
  }, []);

  // Performans karşılaştırması filtresi
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'top10' | 'worst10'>('all');

  // Supplier switch dialog states
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const [selectedPairForSwitch, setSelectedPairForSwitch] = useState<SupplierPair | null>(null);
  const [selectedAlternativeForSwitch, setSelectedAlternativeForSwitch] = useState<string>('');

  // Load initial data
  const [dataLoaded, setDataLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // localStorage Protection System - Component mount/unmount koruma
  useEffect(() => {
    console.log('🛡️ SupplierQualityManagement component MOUNT - localStorage koruması aktif - VERSION 2.0.0 DEPLOYED');
    
    // Component mount olduğunda localStorage'ı backup'la
    const backupData = () => {
      const currentSuppliers = localStorage.getItem('suppliers');
      if (currentSuppliers && currentSuppliers !== '[]' && currentSuppliers !== 'null') {
        localStorage.setItem('suppliers-backup', currentSuppliers);
        console.log('💾 Tedarikçi verileri backup\'landı');
      }
    };
    
    backupData();
    loadStoredData();
    
    // ✅ IndexedDB PDF storage'ı initialize et
    auditPDFStorage.initialize().then(() => {
      console.log('✅ Audit PDF Storage başarıyla initialize edildi');
    }).catch((error) => {
      console.error('❌ Audit PDF Storage initialize hatası:', error);
    });
    
    // ❌ generateAutoAuditRecommendations ve syncDataConsistency çağrıları kaldırıldı
    // Bu fonksiyonlar veri çakışması yaratıyordu
    
    // Component unmount olduğunda cleanup
    return () => {
      console.log('🛡️ SupplierQualityManagement component UNMOUNT - veri koruması');
      // Unmount sırasında localStorage'ı koruma
      const currentData = localStorage.getItem('suppliers');
      if (!currentData || currentData === '[]' || currentData === 'null') {
        // Veri silinmişse backup'tan restore et
        const backupData = localStorage.getItem('suppliers-backup');
        if (backupData) {
          localStorage.setItem('suppliers', backupData);
          console.log('🔄 Tedarikçi verileri backup\'tan restore edildi');
        }
      }
    };
  }, []);

  // ❌ localStorage Monitoring DEVRE DIŞI - Çakışma sorunu yaratıyordu
  // Monitoring sistemi otomatik kaydetme ile çakışıp veri kaybına neden oluyordu

  // ❌ Veri tutarlılığı kontrolü DEVRE DIŞI - Çakışma sorunu yaratıyordu
  // syncDataConsistency fonksiyonu otomatik kaydetme ile çakışıp veri kaybına neden oluyordu

  // 🚀 SÜPER GÜÇLENDİRİLMİŞ OTOMATİK KAYDETME SİSTEMİ - Veri kaybolmasını önlemek için
  // Suppliers değiştiğinde otomatik kaydet - VERİ KAYBI ENGELLEME V2.0
  useEffect(() => {
    if (dataLoaded) {
      try {
        localStorage.setItem('suppliers', JSON.stringify(suppliers));
        localStorage.setItem('suppliers-backup', JSON.stringify(suppliers));
        localStorage.setItem('suppliers-timestamp', Date.now().toString());
        console.log('✅ Suppliers otomatik localStorage\'a kaydedildi - BACKUP DAHIL');
      } catch (error) {
        console.error('❌ Suppliers localStorage kaydetme hatası:', error);
      }
    }
  }, [suppliers, dataLoaded]);

  // Supplier pairs değiştiğinde otomatik kaydet - VERİ KAYBI ENGELLEME V2.0
  useEffect(() => {
    if (dataLoaded) {
      try {
        localStorage.setItem('supplier-pairs', JSON.stringify(supplierPairs));
        localStorage.setItem('supplier-pairs-backup', JSON.stringify(supplierPairs));
        localStorage.setItem('supplier-pairs-timestamp', Date.now().toString());
        console.log('✅ Supplier pairs otomatik localStorage\'a kaydedildi - BACKUP DAHIL');
      } catch (error) {
        console.error('❌ Supplier pairs localStorage kaydetme hatası:', error);
      }
    }
  }, [supplierPairs, dataLoaded]);

  // Nonconformities değiştiğinde otomatik kaydet
  useEffect(() => {
    if (dataLoaded) {
      try {
        localStorage.setItem('supplier-nonconformities', JSON.stringify(nonconformities));
        console.log('✅ Nonconformities otomatik localStorage\'a kaydedildi');
      } catch (error) {
        console.error('❌ Nonconformities localStorage kaydetme hatası:', error);
      }
    }
  }, [nonconformities, dataLoaded]);

  // Defects değiştiğinde otomatik kaydet
  useEffect(() => {
    if (dataLoaded) {
      try {
        localStorage.setItem('supplier-defects', JSON.stringify(defects));
        console.log('✅ Defects otomatik localStorage\'a kaydedildi');
      } catch (error) {
        console.error('❌ Defects localStorage kaydetme hatası:', error);
      }
    }
  }, [defects, dataLoaded]);

  // Audits değiştiğinde otomatik kaydet
  useEffect(() => {
    if (dataLoaded) {
      try {
        localStorage.setItem('supplier-audits', JSON.stringify(audits));
        console.log('✅ Audits otomatik localStorage\'a kaydedildi');
      } catch (error) {
        console.error('❌ Audits localStorage kaydetme hatası:', error);
      }
    }
  }, [audits, dataLoaded]);

  // MANUEL KAYDETME FONKSİYONLARI - Acil durum için
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('suppliers', JSON.stringify(suppliers));
      localStorage.setItem('supplier-nonconformities', JSON.stringify(nonconformities));
      localStorage.setItem('supplier-defects', JSON.stringify(defects));
      localStorage.setItem('supplier-pairs', JSON.stringify(supplierPairs));
      localStorage.setItem('supplier-audits', JSON.stringify(audits)); // EKSİK AUDIT VERİLERİ EKLENDİ
      console.log('💾 Tüm tedarikçi verileri (denetimler dahil) manuel olarak localStorage\'a kaydedildi');
    } catch (error) {
      console.error('❌ localStorage kaydetme hatası:', error);
    }
  };

  const loadStoredData = () => {
    try {
      // 🚨 ACİL KURTARMA SİSTEMİ - VERİ KAYBI ENGELLEME V2.0
      // localStorage'dan verileri yükle - BACKUP kontrollü
      let storedSuppliers = localStorage.getItem('suppliers');
      let storedNonconformities = localStorage.getItem('supplier-nonconformities');
      let storedDefects = localStorage.getItem('supplier-defects');
      let storedPairs = localStorage.getItem('supplier-pairs');
      let storedAudits = localStorage.getItem('supplier-audits');
      
      // Eğer ana veri yoksa veya bozuksa backup'tan yükle
      if (!storedSuppliers || storedSuppliers === 'null' || storedSuppliers === '[]') {
        storedSuppliers = localStorage.getItem('suppliers-backup');
        console.log('🔄 Suppliers backup\'tan yüklendi');
      }
      if (!storedPairs || storedPairs === 'null' || storedPairs === '[]') {
        storedPairs = localStorage.getItem('supplier-pairs-backup');
        console.log('🔄 Supplier pairs backup\'tan yüklendi');
      }
      
      console.log('🔍 localStorage kontrol:', {
        suppliers: !!storedSuppliers,
        suppliersLength: storedSuppliers ? JSON.parse(storedSuppliers).length : 0,
        nonconformities: !!storedNonconformities,
        defects: !!storedDefects,
        pairs: !!storedPairs,
        audits: !!storedAudits
      });
      
      // Veri yükleme başarısızlık kontrolü - hasAnyData kaldırıldı
      
      if (storedSuppliers && storedSuppliers !== 'null' && storedSuppliers !== '[]') {
        const parsedSuppliers = JSON.parse(storedSuppliers);
        if (parsedSuppliers.length > 0) {
          setSuppliers(parsedSuppliers);
          console.log('✅ Tedarikçi verileri localStorage\'dan yüklendi:', parsedSuppliers.length, 'kayıt');
        }
      }
      
      if (storedNonconformities && storedNonconformities !== 'null' && storedNonconformities !== '[]') {
        const parsedNonconformities = JSON.parse(storedNonconformities);
        if (parsedNonconformities.length > 0) {
          setNonconformities(parsedNonconformities);
          console.log('✅ Uygunsuzluk verileri localStorage\'dan yüklendi:', parsedNonconformities.length, 'kayıt');
        }
      }
      
      if (storedDefects && storedDefects !== 'null' && storedDefects !== '[]') {
        const parsedDefects = JSON.parse(storedDefects);
        if (parsedDefects.length > 0) {
          setDefects(parsedDefects);
          console.log('✅ Hata verileri localStorage\'dan yüklendi:', parsedDefects.length, 'kayıt');
        }
      }
      
      if (storedPairs && storedPairs !== 'null' && storedPairs !== '[]') {
        const parsedPairs = JSON.parse(storedPairs);
        if (parsedPairs.length > 0) {
          setSupplierPairs(parsedPairs);
          console.log('✅ Eşleştirme verileri localStorage\'dan yüklendi:', parsedPairs.length, 'kayıt');
        }
      }
      
      if (storedAudits && storedAudits !== 'null' && storedAudits !== '[]') {
        const parsedAudits = JSON.parse(storedAudits);
        if (parsedAudits.length > 0) {
          setAudits(parsedAudits);
          console.log('✅ Denetim verileri localStorage\'dan yüklendi:', parsedAudits.length, 'kayıt');
        }
      }
      
      // Veri yükleme tamamlandı - Eğer hiç veri yoksa mock veri yükle
      let hasAnyData = false;
      
      // LocalStorage'dan yüklenen veriler kontrol et
      if (storedSuppliers && storedSuppliers !== 'null' && storedSuppliers !== '[]' && JSON.parse(storedSuppliers).length > 0) {
        hasAnyData = true;
      }
      if (storedNonconformities && storedNonconformities !== 'null' && storedNonconformities !== '[]' && JSON.parse(storedNonconformities).length > 0) {
        hasAnyData = true;
      }
      if (storedDefects && storedDefects !== 'null' && storedDefects !== '[]' && JSON.parse(storedDefects).length > 0) {
        hasAnyData = true;
      }
      if (storedPairs && storedPairs !== 'null' && storedPairs !== '[]' && JSON.parse(storedPairs).length > 0) {
        hasAnyData = true;
      }
      if (storedAudits && storedAudits !== 'null' && storedAudits !== '[]' && JSON.parse(storedAudits).length > 0) {
        hasAnyData = true;
      }
      
      // Eğer hiç veri yoksa mock veri yükle
      if (!hasAnyData) {
        console.log('🎯 LocalStorage boş, mock veri yükleniyor...');
        loadMockData();
      }
      
      setDataLoaded(true);
      setIsLoading(false);
      console.log('🎯 Tedarikçi modülü veri yükleme tamamlandı');
      
    } catch (error) {
      console.error('❌ localStorage veri yükleme hatası:', error);
      // Hata durumunda mock veri yükle
      console.log('🎯 Hata nedeniyle mock veri yükleniyor...');
      loadMockData();
      setDataLoaded(true);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    // Mock data - gerçek uygulamada API'den gelecek
    const mockSuppliers: Supplier[] = [
      // Ana tedarikçiler (Onaylı)
      {
        id: 'SUP-001',
        name: 'Seçkinler Metal A.Ş.',
        type: 'onaylı',
        category: 'stratejik',
        supplyType: 'malzeme',
        supplySubcategories: ['Ham Madde (Çelik, Alüminyum, Plastik)', 'Yarı Mamul (Profil, Sac, Boru)'],
        contact: {
          email: 'info@seckinlermetal.com',
          phone: '+90 212 555 0123',
          address: 'İstanbul Sanayi Sitesi',
          contactPerson: 'Ahmet Seçkin'
        },
        materialTypes: ['St 37 Yapı Çeliği', 'DKP Saç (Derin Çekme)'],
        performanceScore: 92,
        qualityScore: 95,
        deliveryScore: 88,
        riskLevel: 'düşük',
        status: 'aktif',
        registrationDate: '2020-01-15',
        lastAuditDate: '2024-06-15',
        nextAuditDate: '2025-06-15',
        auditStatus: 'planlı',
        nonconformityCount: 2,
        defectCount: 1,
        dofCount: 0,
        isActive: true
      },
      {
        id: 'SUP-002',
        name: 'Nisa Metal Ltd.',

        type: 'alternatif',
        category: 'stratejik',
        supplyType: 'hizmet',
        supplySubcategories: ['Taşeron İşçilik (Kaynak, Montaj)', 'Bakım ve Onarım Hizmetleri'],
        contact: {
          email: 'info@nisametal.com',
          phone: '+90 212 555 0124',
          address: 'Bursa Sanayi Sitesi',
          contactPerson: 'Fatma Nisa'
        },
        materialTypes: ['S 235 JR Yapı Çeliği', 'Elektro Galvanizli Saç'],
        performanceScore: 87,
        qualityScore: 90,
        deliveryScore: 85,
        riskLevel: 'düşük',
        status: 'aktif',
        registrationDate: '2021-03-20',
        lastAuditDate: '2024-07-10',
        nextAuditDate: '2025-07-10',
        auditStatus: 'planlı',
        nonconformityCount: 1,
        defectCount: 0,
        dofCount: 0,
        isActive: true
      },
      {
        id: 'SUP-003',
        name: 'Demir Döküm Sanayi A.Ş.',
        type: 'onaylı',
        category: 'kritik',
        supplyType: 'malzeme',
        supplySubcategories: ['Ham Madde (Çelik, Alüminyum, Plastik)', 'Standart Parçalar (Vida, Somun, Rondela)'],
        contact: {
          email: 'contact@demirdokum.com',
          phone: '+90 232 555 0145',
          address: 'İzmir Aliağa Organize Sanayi',
          contactPerson: 'Cemil Demir'
        },
        materialTypes: ['GGG-40 Küresel Grafitli Döküm', 'DIN 912 İmbus Cıvata'],
        performanceScore: 89,
        qualityScore: 91,
        deliveryScore: 87,
        riskLevel: 'düşük',
        status: 'aktif',
        registrationDate: '2019-07-22',
        lastAuditDate: '2024-05-20',
        nextAuditDate: '2025-05-20',
        auditStatus: 'planlı',
        nonconformityCount: 3,
        defectCount: 2,
        dofCount: 1,
        isActive: true
      },
      {
        id: 'SUP-004',
        name: 'Altın Kaynak Teknolojileri Ltd.',
        type: 'alternatif',
        category: 'kritik',
        supplyType: 'hizmet',
        supplySubcategories: ['Taşeron İşçilik (Kaynak, Montaj)', 'Test ve Muayene Hizmetleri'],
        contact: {
          email: 'info@altinkaynak.com',
          phone: '+90 262 555 0167',
          address: 'Kocaeli Gebze Organize Sanayi',
          contactPerson: 'Mustafa Altın'
        },
        materialTypes: ['Galvanizli Saç', 'S 355 JR Yüksek Mukavemetli Çelik'],
        performanceScore: 84,
        qualityScore: 88,
        deliveryScore: 81,
        riskLevel: 'orta',
        status: 'aktif',
        registrationDate: '2020-11-18',
        lastAuditDate: '2024-08-12',
        nextAuditDate: '2025-08-12',
        auditStatus: 'planlı',
        nonconformityCount: 4,
        defectCount: 3,
        dofCount: 1,
        isActive: true
      },
      // Düşük performanslı tedarikçiler (otomatik denetim önerisi için)
      {
        id: 'SUP-005',
        name: 'Problematik Metal San. Tic.',
        type: 'onaylı',
        category: 'kritik',
        supplyType: 'malzeme',
        supplySubcategories: ['Ham Madde (Çelik, Alüminyum, Plastik)'],
        contact: {
          email: 'info@problematikmetal.com',
          phone: '+90 212 555 0567',
          address: 'Ankara Organize Sanayi',
          contactPerson: 'Mehmet Problem'
        },
        materialTypes: ['DDQ Saç (Ekstra Derin Çekme)'],
        performanceScore: 65, // Düşük performans
        qualityScore: 68, // Düşük kalite
        deliveryScore: 70, // Düşük teslimat
        riskLevel: 'yüksek',
        status: 'aktif',
        registrationDate: '2019-03-20',
        lastAuditDate: '2022-12-15', // Eski denetim
        nextAuditDate: '2024-12-15',
        auditStatus: 'gecikmiş',
        nonconformityCount: 8, // Yüksek uygunsuzluk
        defectCount: 6, // Yüksek hata
        dofCount: 3,
        isActive: true
      },
      {
        id: 'SUP-006',
        name: 'Kalitesiz Üretim A.Ş.',
        type: 'onaylı',
        category: 'kritik',
        supplyType: 'malzeme',
        supplySubcategories: ['Yarı Mamul (Profil, Sac, Boru)'],
        contact: {
          email: 'kalite@kalitesizuretim.com',
          phone: '+90 216 555 0789',
          address: 'İzmir Atatürk Organize Sanayi',
          contactPerson: 'Ayşe Kalitesiz'
        },
        materialTypes: ['AA 6061 Alüminyum Alaşımı', 'PE-HD Polietilen (Yüksek Yoğunluklu)'],
        performanceScore: 58, // Çok düşük performans
        qualityScore: 60, // Çok düşük kalite
        deliveryScore: 65, // Düşük teslimat
        riskLevel: 'kritik',
        status: 'aktif',
        registrationDate: '2018-11-10',
        lastAuditDate: '2022-08-20', // Çok eski denetim
        nextAuditDate: '2023-08-20',
        auditStatus: 'gecikmiş',
        nonconformityCount: 12, // Çok yüksek uygunsuzluk
        defectCount: 9, // Çok yüksek hata
        dofCount: 5,
        isActive: true
      },
      // Ek tedarikçiler
      {
        id: 'SUP-007',
        name: 'Premium Çelik Teknolojileri A.Ş.',
        type: 'onaylı',
        category: 'stratejik',
        supplyType: 'malzeme',
        supplySubcategories: ['Ham Madde (Çelik, Alüminyum, Plastik)', 'Yarı Mamul (Profil, Sac, Boru)'],
        contact: {
          email: 'sales@premiumcelik.com',
          phone: '+90 224 555 0201',
          address: 'Bursa Nilüfer Organize Sanayi',
          contactPerson: 'Hasan Premium'
        },
        materialTypes: ['AISI 304 Paslanmaz Çelik', 'AISI 316 Paslanmaz Çelik'],
        performanceScore: 95,
        qualityScore: 97,
        deliveryScore: 93,
        riskLevel: 'düşük',
        status: 'aktif',
        registrationDate: '2021-05-12',
        lastAuditDate: '2024-09-10',
        nextAuditDate: '2025-09-10',
        auditStatus: 'planlı',
        nonconformityCount: 0,
        defectCount: 0,
        dofCount: 0,
        isActive: true
      },
      {
        id: 'SUP-008',
        name: 'Güven Makine Parçaları Ltd.',
        type: 'alternatif',
        category: 'rutin',
        supplyType: 'hibrit',
        supplySubcategories: ['Standart Parçalar (Vida, Somun, Rondela)', 'Montaj + Bakım'],
        contact: {
          email: 'info@guvenmakine.com',
          phone: '+90 274 555 0298',
          address: 'Edirne Sanayi Sitesi',
          contactPerson: 'Ali Güven'
        },
        materialTypes: ['Bronz Yatak Malzemesi', 'DIN 931 Altı Köşe Cıvata'],
        performanceScore: 79,
        qualityScore: 82,
        deliveryScore: 77,
        riskLevel: 'orta',
        status: 'aktif',
        registrationDate: '2020-09-15',
        lastAuditDate: '2024-04-18',
        nextAuditDate: '2025-04-18',
        auditStatus: 'planlı',
        nonconformityCount: 5,
        defectCount: 4,
        dofCount: 2,
        isActive: true
      },
      {
        id: 'SUP-009',
        name: 'Elektronik Sistem Çözümleri A.Ş.',
        type: 'onaylı',
        category: 'genel',
        supplyType: 'malzeme',
        supplySubcategories: ['Elektronik Komponentler'],
        contact: {
          email: 'teknik@elektroniksistem.com',
          phone: '+90 312 555 0345',
          address: 'Ankara Ostim Sanayi Sitesi',
          contactPerson: 'Zeynep Elektronik'
        },
        materialTypes: ['PCB Baskı Devre Kartları', 'IC Entegre Devreler', 'Konnektörler ve Soketler'],
        performanceScore: 86,
        qualityScore: 89,
        deliveryScore: 84,
        riskLevel: 'düşük',
        status: 'aktif',
        registrationDate: '2022-01-08',
        lastAuditDate: '2024-07-25',
        nextAuditDate: '2025-07-25',
        auditStatus: 'planlı',
        nonconformityCount: 2,
        defectCount: 1,
        dofCount: 0,
        isActive: true
      },
      {
        id: 'SUP-010',
        name: 'Kimya Endüstri Malzemeleri Ltd.',
        type: 'potansiyel',
        category: 'genel',
        supplyType: 'malzeme',
        supplySubcategories: ['Kimyasal Maddeler (Boya, Temizlik)'],
        contact: {
          email: 'musteri@kimyaendus.com',
          phone: '+90 264 555 0412',
          address: 'Adapazarı Organize Sanayi',
          contactPerson: 'Erkan Kimya'
        },
        materialTypes: ['NBR Nitril Kauçuk', 'Seramik Malzemeler'],
        performanceScore: 75,
        qualityScore: 78,
        deliveryScore: 73,
        riskLevel: 'orta',
        status: 'aktif',
        registrationDate: '2023-03-14',
        lastAuditDate: '2024-10-05',
        nextAuditDate: '2025-10-05',
        auditStatus: 'planlı',
        nonconformityCount: 3,
        defectCount: 2,
        dofCount: 1,
        isActive: true
      },
      // N/A puanlı tedarikçiler - Henüz değerlendirilmemiş
      {
        id: 'SUP-011',
        name: 'Yeni Değerlendirilmemiş Metal A.Ş.',
        type: 'potansiyel',
        category: 'stratejik',
        supplyType: 'malzeme',
        supplySubcategories: ['Ham Madde (Çelik, Alüminyum, Plastik)'],
        contact: {
          email: 'info@yenimetal.com',
          phone: '+90 312 555 0888',
          address: 'Ankara Sanayi Sitesi',
          contactPerson: 'Yeni Değerlendirme'
        },
        materialTypes: ['Çelik Malzemeler'],
        performanceScore: -1, // N/A değeri (-1 olarak kodlanmış)
        qualityScore: -1, // N/A değeri
        deliveryScore: -1, // N/A değeri
        riskLevel: 'düşük',
        status: 'denetimde',
        registrationDate: '2024-11-01',
        lastAuditDate: '',
        nextAuditDate: '2024-12-15',
        auditStatus: 'planlı',
        nonconformityCount: 0,
        defectCount: 0,
        dofCount: 0,
        isActive: true
      },
      {
        id: 'SUP-012',
        name: 'Beklemede Olan Tedarikçi Ltd.',
        type: 'potansiyel',
        category: 'kritik',
        supplyType: 'hizmet',
        supplySubcategories: ['Test ve Muayene Hizmetleri'],
        contact: {
          email: 'info@beklemede.com',
          phone: '+90 216 555 0999',
          address: 'İstanbul Pendik',
          contactPerson: 'Beklemede Kişi'
        },
        materialTypes: ['Test Ekipmanları'],
        performanceScore: -1, // N/A değeri
        qualityScore: -1, // N/A değeri 
        deliveryScore: -1, // N/A değeri
        riskLevel: 'orta',
        status: 'denetimde',
        registrationDate: '2024-10-15',
        lastAuditDate: '',
        nextAuditDate: '2024-12-20',
        auditStatus: 'planlı',
        nonconformityCount: 0,
        defectCount: 0,
        dofCount: 0,
        isActive: true
      },
      {
        id: 'SUP-013',
        name: 'Değerlendirme Aşamasındaki Firma',
        type: 'potansiyel',
        category: 'rutin',
        supplyType: 'malzeme',
        supplySubcategories: ['Standart Parçalar (Vida, Somun, Rondela)'],
        contact: {
          email: 'info@degerlendirme.com',
          phone: '+90 232 555 0777',
          address: 'İzmir Kemalpaşa',
          contactPerson: 'Değerlendirme Sorumlusu'
        },
        materialTypes: ['Bağlantı Elemanları'],
        performanceScore: -1, // N/A değeri
        qualityScore: -1, // N/A değeri
        deliveryScore: -1, // N/A değeri
        riskLevel: 'düşük',
        status: 'denetimde',
        registrationDate: '2024-11-20',
        lastAuditDate: '',
        nextAuditDate: '2025-01-15',
        auditStatus: 'planlı',
        nonconformityCount: 0,
        defectCount: 0,
        dofCount: 0,
        isActive: true
      }
    ];

    const mockPairs: SupplierPair[] = [
      {
        id: 'PAIR-001',
        primarySupplier: mockSuppliers.find(s => s.id === 'SUP-001')!,
        alternativeSuppliers: [mockSuppliers.find(s => s.id === 'SUP-002')!, mockSuppliers.find(s => s.id === 'SUP-007')!],
        category: 'stratejik',
        performanceComparison: {
          primaryScore: 92,
          alternativeScores: [
            { id: 'SUP-002', score: 87 },
            { id: 'SUP-007', score: 95 }
          ],
          recommendation: 'SUP-007 Premium Çelik alternatifi değerlendirilmeli'
        },
        lastReviewDate: '2024-10-15',
        nextReviewDate: '2025-04-15'
      },
      {
        id: 'PAIR-002',
        primarySupplier: mockSuppliers.find(s => s.id === 'SUP-003')!,
        alternativeSuppliers: [mockSuppliers.find(s => s.id === 'SUP-008')!],

        category: 'kritik',
        performanceComparison: {
          primaryScore: 89,
          alternativeScores: [{ id: 'SUP-008', score: 79 }],
          recommendation: 'Ana tedarikçi performansı üstün'
        },
        lastReviewDate: '2024-11-20',
        nextReviewDate: '2025-05-20'
      },
      {
        id: 'PAIR-003',
        primarySupplier: mockSuppliers.find(s => s.id === 'SUP-009')!,
        alternativeSuppliers: [mockSuppliers.find(s => s.id === 'SUP-004')!],

        category: 'genel',
        performanceComparison: {
          primaryScore: 86,
          alternativeScores: [{ id: 'SUP-004', score: 84 }],
          recommendation: 'Mevcut performans dengeli'
        },
        lastReviewDate: '2024-09-12',
        nextReviewDate: '2025-03-12'
      },
      {
        id: 'PAIR-004',
        primarySupplier: mockSuppliers.find(s => s.id === 'SUP-005')!,
        alternativeSuppliers: [mockSuppliers.find(s => s.id === 'SUP-007')!, mockSuppliers.find(s => s.id === 'SUP-001')!],

        category: 'kritik',
        performanceComparison: {
          primaryScore: 65,
          alternativeScores: [
            { id: 'SUP-007', score: 95 },
            { id: 'SUP-001', score: 92 }
          ],
          recommendation: 'ACİL: Ana tedarikçi değişimi gerekli - her iki alternatif daha üstün'
        },
        lastReviewDate: '2024-11-25',
        nextReviewDate: '2024-12-25'
      },
      {
        id: 'PAIR-005',
        alternativeSuppliers: [mockSuppliers.find(s => s.id === 'SUP-006')!],
        category: 'genel',
        performanceComparison: {
          alternativeScores: [{ id: 'SUP-006', score: 58 }],
          recommendation: 'Ana tedarikçi atanması gerekli - alternatif tedarikçi mevcut'
        },
        lastReviewDate: '2024-10-30',
        nextReviewDate: '2025-04-30'
      },
      {
        id: 'PAIR-006',
        primarySupplier: mockSuppliers.find(s => s.id === 'SUP-004')!,
        alternativeSuppliers: [mockSuppliers.find(s => s.id === 'SUP-002')!, mockSuppliers.find(s => s.id === 'SUP-008')!],
        category: 'rutin',
        performanceComparison: {
          primaryScore: 84,
          alternativeScores: [
            { id: 'SUP-002', score: 87 },
            { id: 'SUP-008', score: 79 }
          ],
          recommendation: 'Nisa Metal alternatifi ana tedarikçiden daha üstün performansta'
        },
        lastReviewDate: '2024-11-01',
        nextReviewDate: '2025-05-01'
      }
    ];

    // Mock audit records - Planlanan denetimler (çeşitli durumlar)
    const mockAudits: AuditRecord[] = [
      // Tamamlanan denetim - planlanan tarihte
      {
        id: 'AUDIT-001',
        supplierId: 'SUP-001',
        auditDate: '2024-11-15', // Planlanan tarih
        actualAuditDate: '2024-11-15', // Gerçekleştirilen tarih (aynı gün)
        auditType: 'planlı',
        auditorName: 'Kalite Müdürü - Ahmet Yılmaz',
        score: 92,
        findings: ['Kalite standartları yeterli', 'Dokümantasyon tam'],
        status: 'tamamlandı',
        nextAuditDate: '2025-11-15',
        isAutoScheduled: false,
        delayDays: 0,
        isDelayed: false
      },
      // Tamamlanan denetim - gecikmeyle
      {
        id: 'AUDIT-002',
        supplierId: 'SUP-002',
        auditDate: '2024-10-20', // Planlanan tarih
        actualAuditDate: '2024-10-27', // 7 gün gecikmeyle gerçekleşti
        auditType: 'takip',
        auditorName: 'Denetim Uzmanı - Fatma Demir',
        score: 87,
        findings: ['İyileştirmeler uygulanmış', 'Küçük eksikler giderilmiş'],
        status: 'tamamlandı',
        nextAuditDate: '2025-04-20',
        isAutoScheduled: false,
        delayDays: 7,
        delayReason: 'Tedarikçinin üretim yoğunluğu nedeniyle talep ettiği gecikme',
        isDelayed: true
      },
      // Gecikmiş denetim - henüz yapılmamış
      {
        id: 'AUDIT-003',
        supplierId: 'SUP-005',
        auditDate: '2024-11-25', // Planlanan tarih geçti
        auditType: 'acil',
        auditorName: 'Baş Denetçi - Mehmet Öztürk',
        score: 0,
        findings: [],
        status: 'gecikmiş',
        nextAuditDate: '2025-03-25',
        isAutoScheduled: true,
        delayDays: 9, // Bugün 4 Aralık olduğuna göre
        delayReason: 'Tedarikçi tesisinde yangın nedeniyle denetim ertelendi',
        isDelayed: true
      },
      // Devam eden denetim
      {
        id: 'AUDIT-004',
        supplierId: 'SUP-006',
        auditDate: '2024-12-02', // Planlanan tarih
        actualAuditDate: '2024-12-03', // 1 gün gecikmeyle başladı
        auditType: 'kapsamlı',
        auditorName: 'Kalite Kontrol - Ayşe Kaya',
        score: 0,
        findings: ['İlk bulgular kaydediliyor'],
        status: 'devam_ediyor',
        nextAuditDate: '2025-06-02',
        isAutoScheduled: true,
        delayDays: 1,
        delayReason: 'Denetçi hastalığı nedeniyle 1 gün ertelendi',
        isDelayed: true
      },
      // İleride planlanan denetim
      {
        id: 'AUDIT-005',
        supplierId: 'SUP-003',
        auditDate: '2024-12-20', // İleride planlanan
        auditType: 'planlı',
        auditorName: 'Sistem Denetçisi - Murat Çelik',
        score: 0,
        findings: [],
        status: 'planlı',
        nextAuditDate: '2025-12-20',
        isAutoScheduled: false,
        delayDays: 0,
        isDelayed: false
      },
      // İptal edilen denetim
      {
        id: 'AUDIT-006',
        supplierId: 'SUP-007',
        auditDate: '2024-11-10', // Planlanan tarih
        auditType: 'takip',
        auditorName: 'Kalite Uzmanı - Elif Yılmaz',
        score: 0,
        findings: [],
        status: 'iptal',
        nextAuditDate: '2025-01-15',
        isAutoScheduled: false,
        delayReason: 'Tedarikçi sözleşme yenileme süreci nedeniyle iptal edildi',
        isDelayed: false
      },
      // Yeni planlanan denetim
      {
        id: 'AUDIT-007',
        supplierId: 'SUP-008',
        auditDate: '2025-01-10', // Gelecek ay planlanan
        auditType: 'planlı',
        auditorName: 'Denetim Koordinatörü - Serkan Aydın',
        score: 0,
        findings: [],
        status: 'planlı',
        nextAuditDate: '2025-07-10',
        isAutoScheduled: false,
        delayDays: 0,
        isDelayed: false
      }
    ];



    // Mock nonconformity records
    const mockNonconformities: NonconformityRecord[] = [
      {
        id: 'NC-001',
        supplierId: 'SUP-001',
        title: 'Boyut Sapması',
        description: 'Çelik levhalarda boyut toleransı aşımı tespit edildi',
        category: 'kalite',
        severity: 'yüksek',
        detectedDate: '2024-11-15',
        status: 'açık',
        dueDate: '2024-12-15',

        recurrence: false,
        partCode: 'CL-001',
        quantityAffected: 25
      },
      {
        id: 'NC-002',
        supplierId: 'SUP-005',
        title: 'Teslimat Gecikmesi',
        description: 'Planlanan teslimat tarihinden 5 gün gecikme',
        category: 'teslimat',
        severity: 'orta',
        detectedDate: '2024-11-20',
        status: 'araştırılıyor',
        dueDate: '2024-12-20',

        recurrence: true,
        partCode: 'PM-002',
        delayDays: 5
      },
      {
        id: 'NC-003',
        supplierId: 'SUP-006',
        title: 'Kalite Sertifikası Eksik',
        description: 'Malzeme sertifikası zamanında teslim edilmedi',
        category: 'doküman',
        severity: 'kritik',
        detectedDate: '2024-11-25',
        status: 'açık',
        dueDate: '2024-12-10',

        recurrence: false,
        partCode: 'SR-003'
      }
    ];

    // Mock defect records
    const mockDefects: DefectRecord[] = [
      {
        id: 'DEF-001',
        supplierId: 'SUP-001',
        defectType: 'Kaynak Hatası',
        description: 'Kaynak dikişlerinde porozite tespit edildi',
        quantity: 12,
        detectedDate: '2024-11-10',
        batchNumber: 'BT-2024-001',
        severity: 'major',
        status: 'açık',

      },
      {
        id: 'DEF-002',
        supplierId: 'SUP-005',
        defectType: 'Boyut Hatası',
        description: 'Parça boyutlarında tolerans dışı sapma',
        quantity: 8,
        detectedDate: '2024-11-18',
        batchNumber: 'BT-2024-002',
        severity: 'kritik',
        status: 'düzeltildi',

      },
      {
        id: 'DEF-003',
        supplierId: 'SUP-006',
        defectType: 'Yüzey Kalitesi',
        description: 'Yüzey pürüzlülüğü standart dışı',
        quantity: 15,
        detectedDate: '2024-11-22',
        batchNumber: 'BT-2024-003',
        severity: 'minor',
        status: 'açık',

      }
    ];

    setSuppliers(mockSuppliers);
    setSupplierPairs(mockPairs);
    setAudits(mockAudits);
    setNonconformities(mockNonconformities);
    setDefects(mockDefects);
    
    // LocalStorage'a kaydet
    saveToLocalStorage();
    
    // Veri yükleme tamamlandığını işaretle
    setDataLoaded(true);
    setIsLoading(false);
    console.log('🎯 Mock tedarikçi verileri yüklendi ve dataLoaded true oldu');
    console.log('📊 Yüklenen veriler:', {
      suppliers: mockSuppliers.length,
      pairs: mockPairs.length,
      audits: mockAudits.length,
      nonconformities: mockNonconformities.length,
      defects: mockDefects.length
    });
    
    // Auto-audit check
    if (autoAuditEnabled) {
      checkAutoAuditRequirements(mockSuppliers);
    }
  };

  // Veri tutarlılığını kontrol et ve senkronize et
  const syncDataConsistency = () => {
    console.log('🔄 Veri tutarlılığı kontrol ediliyor...');
    
    // Eşleştirmelerdeki tedarikçilerin ana listede olup olmadığını kontrol et
    const missingSuppliers: string[] = [];
    
    supplierPairs.forEach(pair => {
      // Ana tedarikçi kontrolü
      if (!suppliers.find(s => s.id === pair.primarySupplier.id)) {
        missingSuppliers.push(pair.primarySupplier.id);
      }
      
      // Alternatif tedarikçiler kontrolü
      pair.alternativeSuppliers.forEach(altSupplier => {
        if (!suppliers.find(s => s.id === altSupplier.id)) {
          missingSuppliers.push(altSupplier.id);
        }
      });
    });
    
    if (missingSuppliers.length > 0) {
      console.warn('⚠️ Eşleştirmelerde eksik tedarikçiler tespit edildi:', missingSuppliers);
      showSnackbar(`${missingSuppliers.length} tedarikçi eşleştirmede var ama ana listede yok. Veriler senkronize ediliyor...`, 'warning');
      
      // Eksik tedarikçileri eşleştirmelerden ana listeye ekle
      const suppliersToAdd: Supplier[] = [];
      
      supplierPairs.forEach(pair => {
        if (!suppliers.find(s => s.id === pair.primarySupplier.id)) {
          suppliersToAdd.push(pair.primarySupplier);
        }
        
        pair.alternativeSuppliers.forEach(altSupplier => {
          if (!suppliers.find(s => s.id === altSupplier.id) && 
              !suppliersToAdd.find(s => s.id === altSupplier.id)) {
            suppliersToAdd.push(altSupplier);
          }
        });
      });
      
      if (suppliersToAdd.length > 0) {
        const updatedSuppliers = [...suppliers, ...suppliersToAdd];
        setSuppliers(updatedSuppliers);
        console.log('✅ Eksik tedarikçiler ana listeye eklendi:', suppliersToAdd.map(s => s.name));
        showSnackbar(`${suppliersToAdd.length} tedarikçi ana listeye eklendi`, 'success');
      }
    } else {
      console.log('✅ Veri tutarlılığı kontrol edildi - sorun yok');
    }
  };

  // Cache temizleme fonksiyonu
  const clearSupplierCache = () => {
    try {
      localStorage.removeItem('suppliers');
      localStorage.removeItem('supplier-nonconformities');
      localStorage.removeItem('supplier-defects');
      localStorage.removeItem('supplier-pairs');
      localStorage.removeItem('supplier-audits');
      console.log('🗑️ Tedarikçi cache temizlendi');
      
      // State'leri temizle
      setSuppliers([]);
      setNonconformities([]);
      setDefects([]);
      setSupplierPairs([]);
      setAudits([]);
      
      showSnackbar('Tedarikçi verileri cache\'i temizlendi. Yeni veriler girilebilir.', 'info');
    } catch (error) {
      console.error('❌ Cache temizleme hatası:', error);
      showSnackbar('Cache temizleme sırasında hata oluştu', 'error');
    }
  };

  // Auto-audit system
  const checkAutoAuditRequirements = (suppliers: Supplier[]) => {
    const today = new Date();
    suppliers.forEach(supplier => {
      const nextAudit = new Date(supplier.nextAuditDate);
      const daysDiff = Math.ceil((nextAudit.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      if (daysDiff <= 30 || supplier.performanceScore < 70) {
        scheduleAutoAudit(supplier);
      }
    });
  };

  const scheduleAutoAudit = (supplier: Supplier) => {
    showSnackbar(`${supplier.name} için otomatik denetim planlandı`, 'warning');
  };

  // Otomatik denetim önerisi oluşturma
  const generateAutoAuditRecommendations = () => {
    const recommendations: AutoAuditRecommendation[] = [];
    const today = new Date();

    // Sadece değerlendirilmiş tedarikçiler için otomatik denetim önerisi oluştur
    // %0 değerler de N/A kabul ediliyor
    const ratedSuppliers = suppliers.filter(s => 
      s.performanceScore > 0 && s.qualityScore > 0 && s.deliveryScore > 0
    );

    ratedSuppliers.forEach(supplier => {
      const performanceIssues: string[] = [];
      const riskFactors: string[] = [];
      let shouldRecommendAudit = false;
      let urgencyLevel: 'düşük' | 'orta' | 'yüksek' | 'kritik' = 'düşük';
      let auditType: 'performans' | 'kalite' | 'teslimat' | 'kapsamlı' = 'performans';
      let priority = 1;

      // Performans skorları kontrolü
      if (supplier.performanceScore < 70) {
        performanceIssues.push(`Genel performans skoru düşük: ${supplier.performanceScore}/100`);
        shouldRecommendAudit = true;
        urgencyLevel = 'yüksek';
        priority = 4;
      } else if (supplier.performanceScore < 80) {
        performanceIssues.push(`Performans skoru ortalamanın altında: ${supplier.performanceScore}/100`);
        shouldRecommendAudit = true;
        urgencyLevel = 'orta';
        priority = 3;
      }

      // Kalite skoru kontrolü
      if (supplier.qualityScore < 75) {
        performanceIssues.push(`Kalite skoru düşük: ${supplier.qualityScore}/100`);
        riskFactors.push('Kalite standartlarının altında performans');
        shouldRecommendAudit = true;
        auditType = 'kalite';
        if (urgencyLevel === 'düşük') urgencyLevel = 'orta';
        priority = Math.max(priority, 3);
      }

      // Teslimat skoru kontrolü
      if (supplier.deliveryScore < 75) {
        performanceIssues.push(`Teslimat skoru düşük: ${supplier.deliveryScore}/100`);
        riskFactors.push('Teslimat güvenilirliği düşük');
        shouldRecommendAudit = true;
        auditType = 'teslimat';
        if (urgencyLevel === 'düşük') urgencyLevel = 'orta';
        priority = Math.max(priority, 3);
      }

      // Uygunsuzluk sayısı kontrolü
      if (supplier.nonconformityCount > 5) {
        performanceIssues.push(`Yüksek uygunsuzluk sayısı: ${supplier.nonconformityCount} adet`);
        riskFactors.push('Tekrarlayan kalite sorunları');
        shouldRecommendAudit = true;
        urgencyLevel = 'yüksek';
        priority = Math.max(priority, 4);
      }

      // Hata sayısı kontrolü
      if (supplier.defectCount > 3) {
        performanceIssues.push(`Yüksek hata sayısı: ${supplier.defectCount} adet`);
        riskFactors.push('Sık hata oluşumu');
        shouldRecommendAudit = true;
        priority = Math.max(priority, 3);
      }

      // Risk seviyesi kontrolü
      if (supplier.riskLevel === 'kritik' || supplier.riskLevel === 'yüksek') {
        riskFactors.push(`${supplier.riskLevel.charAt(0).toUpperCase() + supplier.riskLevel.slice(1)} risk seviyesi`);
        shouldRecommendAudit = true;
        urgencyLevel = supplier.riskLevel === 'kritik' ? 'kritik' : 'yüksek';
        priority = supplier.riskLevel === 'kritik' ? 5 : 4;
      }

      // Son denetim tarihi kontrolü
      const lastAuditDate = new Date(supplier.lastAuditDate);
      const monthsSinceLastAudit = Math.floor((today.getTime() - lastAuditDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      if (monthsSinceLastAudit > 12) {
        riskFactors.push(`Son denetimden bu yana ${monthsSinceLastAudit} ay geçti`);
        shouldRecommendAudit = true;
        if (urgencyLevel === 'düşük') urgencyLevel = 'orta';
        priority = Math.max(priority, 3);
      }

      // Önerilen tarih hesaplama
      let recommendedDays = 30; // default
      if (urgencyLevel === 'kritik') recommendedDays = 3;
      else if (urgencyLevel === 'yüksek') recommendedDays = 7;
      else if (urgencyLevel === 'orta') recommendedDays = 14;

      const recommendedDate = new Date(today.getTime() + (recommendedDays * 24 * 60 * 60 * 1000));

      // Süre tahmini
      let estimatedDuration = 4; // hours
      if (performanceIssues.length > 3) estimatedDuration = 6;

      // Kapsamlı denetim gereksinimi
      if (performanceIssues.length > 2 && riskFactors.length > 2) {
        estimatedDuration = 8;
        priority = Math.max(priority, 4);
      }

      if (shouldRecommendAudit) {
        const recommendation: AutoAuditRecommendation = {
          id: `AUTO-${supplier.id}-${Date.now()}`,
          supplierId: supplier.id,
          supplierName: supplier.name,
          reason: `Performans göstergeleri denetim gerekliliği işaret ediyor. ${performanceIssues.join(', ')}`,
          urgencyLevel,
          recommendedDate: recommendedDate.toISOString().split('T')[0],
          performanceIssues,
          currentScore: supplier.performanceScore,
          previousScore: supplier.performanceScore + Math.floor(Math.random() * 20) - 10, // Simulated previous score
          riskFactors,
          auditType,
          estimatedDuration,
          priority,
          autoGenerated: true,
          createdAt: today.toISOString()
        };

        recommendations.push(recommendation);
      }
    });

    // Önceliğe göre sırala
    recommendations.sort((a, b) => b.priority - a.priority);
    setAutoAuditRecommendations(recommendations);
    
    if (recommendations.length > 0) {
      showSnackbar(`${recommendations.length} otomatik denetim önerisi oluşturuldu`, 'info');
    } else {
      showSnackbar('Şu anda denetim önerisi gerektiren tedarikçi bulunmuyor', 'success');
    }
  };

  // Otomatik denetim önerisini kabul etme
  const acceptAuditRecommendation = (recommendation: AutoAuditRecommendation) => {
    const newAudit: AuditRecord = {
      id: `AUD-${Date.now()}`,
      supplierId: recommendation.supplierId,
      auditDate: recommendation.recommendedDate,
      auditType: 'planlı',
      auditorName: 'Kalite Ekibi',
      score: 0,
      findings: [],
      status: 'planlı',
      nextAuditDate: '',
      isAutoScheduled: true
    };

    setAudits(prev => [...prev, newAudit]);
    
    // Öneriyi listeden çıkar
    setAutoAuditRecommendations(prev => 
      prev.filter(rec => rec.id !== recommendation.id)
    );

    showSnackbar(`${recommendation.supplierName} için denetim planlandı`, 'success');
  };

  // Otomatik denetim önerisini reddetme
  const rejectAuditRecommendation = (recommendationId: string) => {
    setAutoAuditRecommendations(prev => 
      prev.filter(rec => rec.id !== recommendationId)
    );
    showSnackbar('Denetim önerisi reddedildi', 'info');
  };

  // DÖF Integration - Prefill form ile DÖF formunu direkt açma
  const createDOFFromNonconformity = (nonconformity: NonconformityRecord) => {
    const supplier = suppliers.find(s => s.id === nonconformity.supplierId);
    if (!supplier) return;

    try {
      // DÖF form prefill data oluştur
      const dofPrefillData = {
        title: `Tedarikçi Uygunsuzluğu - ${supplier.name}`,
        description: `Tedarikçi: ${supplier.name}
Uygunsuzluk Başlığı: ${nonconformity.title}
Açıklama: ${nonconformity.description}
Kategori: ${nonconformity.category}
Parça Kodu: ${nonconformity.partCode}
Tespit Tarihi: ${nonconformity.detectedDate}
${nonconformity.quantityAffected ? `Etkilenen Miktar: ${nonconformity.quantityAffected} adet` : ''}
${nonconformity.delayDays ? `Gecikme Süresi: ${nonconformity.delayDays} gün` : ''}`,
        department: 'Satın Alma',
        responsible: 'Atakan Battal',
        priority: nonconformity.severity === 'kritik' ? 'critical' : 
                  nonconformity.severity === 'yüksek' ? 'high' : 
                  nonconformity.severity === 'orta' ? 'medium' : 'low',
        source: 'SupplierQualityManagement',
        sourceId: nonconformity.id,
        supplierInfo: {
          name: supplier.name,
          category: supplier.category,
          contactPerson: supplier.contact.contactPerson
        }
      };

      // Prefill data'yı localStorage'a kaydet (DÖF modülünün beklediği format)
      const prefillWrapper = {
        prefillData: dofPrefillData
      };
      localStorage.setItem('dof-form-prefill', JSON.stringify(prefillWrapper));
      localStorage.setItem('dof-auto-open-form', 'true');

      // Update nonconformity with DOF creation flag
      const updatedNonconformities = nonconformities.map(nc => 
        nc.id === nonconformity.id ? { ...nc, dofId: 'creating' } : nc
      );
      setNonconformities(updatedNonconformities);

      showSnackbar(`DÖF formu prefill verilerle açılıyor...`, 'info');
      
      // DÖF form sayfasını yeni sekmede aç
      window.open('/dof-8d-management', '_blank');
    } catch (error) {
      console.error('DÖF oluşturma hatası:', error);
      showSnackbar('DÖF oluşturulurken hata oluştu', 'error');
    }
  };

  // Utility functions
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };







  // 📎 DOSYA YÜKLEME FONKSİYONLARI - MaterialCertificateTracking'den uyarlandı
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const currentSupplier = selectedItem as Supplier;
    if (!currentSupplier) {
      showSnackbar('Önce bir tedarikçi seçmelisiniz', 'error');
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    const validFiles = Array.from(files).filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        showSnackbar(`${file.name} dosyası çok büyük (Max: 10MB)`, 'error');
        return false;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        showSnackbar(`${file.name} desteklenmeyen format`, 'error');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Dosyaları base64 formatına çevirip kalıcı olarak kaydet
    let processedFiles = 0;
    const newAttachments: Attachment[] = [];
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        
        const newAttachment: Attachment = {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          uploadDate: new Date().toISOString(),
          type: file.type,
          url: base64Data // Base64 data URL olarak kaydet
        };
        
        newAttachments.push(newAttachment);
        processedFiles++;
        
        // Tüm dosyalar işlendiğinde state'i güncelle
        if (processedFiles === validFiles.length) {
          const currentAttachments = currentSupplier.attachments || [];
          const updatedAttachments = [...currentAttachments, ...newAttachments];
          
          setFormData({
            ...formData,
            attachments: updatedAttachments
          });

          showSnackbar(`${validFiles.length} dosya yüklendi ve kalıcı olarak kaydedildi`, 'success');
        }
      };
      
      reader.onerror = () => {
        showSnackbar(`${file.name} dosyası yüklenirken hata oluştu`, 'error');
        processedFiles++;
      };
      
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    const currentSupplier = selectedItem as Supplier;
    if (!currentSupplier) return;

    const updatedAttachments = (currentSupplier.attachments || []).filter(att => att.id !== attachmentId);
    setFormData({
      ...formData,
      attachments: updatedAttachments
    });
    showSnackbar('Dosya silindi', 'success');
  };

  const handleDownloadAttachment = (attachment: Attachment) => {
    try {
      // Base64 data URL'den direkt indirme
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      
      // Geçici olarak DOM'a ekle ve click'le
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSnackbar(`${attachment.name} indirildi`, 'success');
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      showSnackbar('Dosya indirme sırasında hata oluştu', 'error');
    }
  };

  const handleViewAttachment = (attachment: Attachment) => {
    try {
      // Base64 data URL'yi doğrudan aç
      if (attachment.type === 'application/pdf') {
        window.open(attachment.url, '_blank');
      } else if (attachment.type.startsWith('image/')) {
        window.open(attachment.url, '_blank');
      } else {
        // Diğer dosya tipleri için indirme öner
        handleDownloadAttachment(attachment);
      }
      showSnackbar('Dosya görüntüleniyor', 'info');
    } catch (error) {
      console.error('Dosya görüntüleme hatası:', error);
      showSnackbar('Dosya görüntüleme sırasında hata oluştu', 'error');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ✅ GELIŞMIŞ DENETIM DENETİM DOSYA YÜKLEME - IndexedDB ile
  const handleAuditFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, auditId: string) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ Dosya seçilmedi');
      return;
    }

    console.log('📄 Denetim dosyası seçildi:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified)
    });

    // Dosya tipi doğrulaması
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 
                         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !validExtensions.some(ext => fileName.endsWith(ext))) {
      showSnackbar(`Geçersiz dosya formatı! Sadece PDF, JPG, PNG, DOC, DOCX dosyaları yüklenebilir. Seçilen dosya: ${file.type}`, 'error');
      return;
    }

    // Dosya boyutu kontrolü - IndexedDB ile daha büyük dosyalar
    const maxSize = 20 * 1024 * 1024; // 20MB (denetim raporları büyük olabilir)
    if (file.size > maxSize) {
      showSnackbar(`Dosya boyutu çok büyük! Maksimum 20MB olabilir. Seçilen dosya: ${formatFileSize(file.size)}`, 'error');
      return;
    }

    if (file.size === 0) {
      showSnackbar('Dosya boş! Lütfen geçerli bir dosya seçin.', 'error');
      return;
    }

    try {
      console.log('📊 Denetim dosyası yükleme başlıyor...');
      showSnackbar('Dosya yükleniyor...', 'info');

      // FileReader ile dosyayı base64'e çevir
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const base64Data = e.target?.result as string;
          
          // Base64 format kontrol
          if (!base64Data || !base64Data.includes('base64,')) {
            throw new Error('Base64 format hatası');
          }

          console.log('✅ Dosya Base64 dönüşümü başarılı:', base64Data.length, 'karakter');
          
          const attachmentId = Date.now().toString();
          
          // IndexedDB'ye dosyayı kaydet
          await auditPDFStorage.saveAttachment(attachmentId, base64Data, file.name, file.size, file.type);
          
          // Denetim kaydındaki attachments'ı güncelle - sadece metadata
          const newAttachment: Attachment = {
            id: attachmentId,
            name: file.name,
            size: file.size,
            uploadDate: new Date().toISOString(),
            type: file.type,
            hasFile: true // IndexedDB'de dosya var
          };

          setAudits(prevAudits => prevAudits.map(audit => 
            audit.id === auditId 
              ? { ...audit, attachments: [...(audit.attachments || []), newAttachment] }
              : audit
          ));

          console.log('✅ Denetim dosyası başarıyla IndexedDB\'ye kaydedildi');
          showSnackbar(`Dosya başarıyla yüklendi! ${file.name} (${formatFileSize(file.size)})`, 'success');
          
        } catch (error) {
          console.error('❌ Denetim dosyası işleme hatası:', error);
          showSnackbar('Dosya işlenemedi! Lütfen farklı bir dosya deneyin.', 'error');
        }
      };

      reader.onerror = (error) => {
        console.error('❌ FileReader hatası:', error);
        showSnackbar('Dosya okuma hatası! Lütfen dosyayı kontrol edin ve tekrar deneyin.', 'error');
      };

      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('❌ Denetim dosyası yükleme hatası:', error);
      showSnackbar('Dosya yükleme hatası! Lütfen tekrar deneyin.', 'error');
    }
  };

  const handleAuditDeleteAttachment = async (auditId: string, attachmentId: string) => {
    try {
      // IndexedDB'den dosyayı sil
      await auditPDFStorage.deleteAttachment(attachmentId);
      
      // State'den attachment'ı kaldır
      setAudits(prevAudits => prevAudits.map(audit => 
        audit.id === auditId 
          ? { ...audit, attachments: audit.attachments?.filter(att => att.id !== attachmentId) }
          : audit
      ));
      
      console.log('✅ Denetim dosyası IndexedDB\'den silindi');
      showSnackbar('Dosya başarıyla silindi', 'success');
    } catch (error) {
      console.error('❌ Denetim dosyası silme hatası:', error);
      showSnackbar('Dosya silme hatası! Lütfen tekrar deneyin.', 'error');
    }
  };

  const handleAuditDownloadAttachment = async (attachment: Attachment) => {
    try {
      // Eski format için geriye uyumluluk
      if (attachment.url && !attachment.hasFile) {
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSnackbar('Dosya indiriliyor', 'info');
        return;
      }

      // IndexedDB'den dosyayı al
      const fileData = await auditPDFStorage.getAttachment(attachment.id);
      
      if (!fileData || !fileData.fileData) {
        showSnackbar('Dosya bulunamadı! Dosya IndexedDB\'de mevcut değil.', 'error');
        return;
      }

      // Base64'ten blob oluştur
      const base64Data = fileData.fileData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: attachment.type });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      
      console.log('✅ Denetim dosyası IndexedDB\'den indirildi');
      showSnackbar(`Dosya indirildi: ${attachment.name}`, 'success');
      
    } catch (error) {
      console.error('❌ Denetim dosyası indirme hatası:', error);
      showSnackbar('Dosya indirme sırasında hata oluştu! Dosya bozuk olabilir.', 'error');
    }
  };

  const handleAuditViewAttachment = async (attachment: Attachment) => {
    try {
      console.log('🔍 Denetim dosyası görüntüleme başlıyor:', attachment.name, attachment.type);
      
      let fileUrl = '';
      
      // Eski format için geriye uyumluluk
      if (attachment.url && !attachment.hasFile) {
        if (!attachment.url.startsWith('data:')) {
          console.error('❌ Geçersiz dosya URL\'si:', attachment.url);
          showSnackbar('Dosya URL\'si geçersiz! Dosya yeniden yüklenmeli.', 'error');
          return;
        }
        fileUrl = attachment.url;
      } else {
        // IndexedDB'den dosyayı al
        const fileData = await auditPDFStorage.getAttachment(attachment.id);
        
        if (!fileData || !fileData.fileData) {
          showSnackbar('Dosya bulunamadı! Dosya IndexedDB\'de mevcut değil.', 'error');
          return;
        }
        
        fileUrl = fileData.fileData;
      }

      // PDF dosyaları için
      if (attachment.type === 'application/pdf') {
        console.log('📄 PDF dosyası açılıyor...');
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>${attachment.name}</title>
                <style>
                  body { margin: 0; }
                  iframe { width: 100%; height: 100vh; border: none; }
                </style>
              </head>
              <body>
                <iframe src="${fileUrl}" type="application/pdf"></iframe>
              </body>
            </html>
          `);
          newWindow.document.close();
        } else {
          // Popup engellenirse direkt link aç
          window.open(fileUrl, '_blank');
        }
      } 
      // Resim dosyaları için
      else if (attachment.type.startsWith('image/')) {
        console.log('🖼️ Resim dosyası açılıyor...');
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>${attachment.name}</title>
                <style>
                  body { 
                    margin: 0; 
                    padding: 20px; 
                    background: #f5f5f5; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    min-height: 100vh; 
                  }
                  img { 
                    max-width: 100%; 
                    max-height: 100vh; 
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1); 
                    border-radius: 8px; 
                  }
                </style>
              </head>
              <body>
                <img src="${fileUrl}" alt="${attachment.name}" />
              </body>
            </html>
          `);
          newWindow.document.close();
        } else {
          window.open(fileUrl, '_blank');
        }
      } 
      // Diğer dosya tipleri için indirme öner
      else {
        console.log('📎 Desteklenmeyen dosya tipi, indirme öneriliyor...');
        await handleAuditDownloadAttachment(attachment);
        return;
      }
      
      console.log('✅ Denetim dosyası görüntülendi');
      showSnackbar(`${attachment.name} görüntüleniyor`, 'success');
    } catch (error) {
      console.error('❌ Denetim dosyası görüntüleme hatası:', error);
      showSnackbar('Dosya görüntüleme sırasında hata oluştu. Lütfen dosyayı yeniden yükleyin.', 'error');
    }
  };

  // Supplier switch functions
  const handleOpenSwitchDialog = (pair: SupplierPair) => {
    if (pair.alternativeSuppliers.length === 0) {
      showSnackbar('Bu eşleştirmede alternatif tedarikçi bulunmuyor', 'warning');
      return;
    }
    
    if (pair.alternativeSuppliers.length === 1) {
      // Tek alternatif varsa doğrudan değiştir
      handleDirectSwitch(pair, pair.alternativeSuppliers[0]);
      return;
    }
    
    // Birden fazla alternatif varsa dialog aç
    setSelectedPairForSwitch(pair);
    setSelectedAlternativeForSwitch('');
    setSwitchDialogOpen(true);
  };

  const handleDirectSwitch = (pair: SupplierPair, selectedAlternative: Supplier) => {
    const remainingAlternatives = pair.alternativeSuppliers.filter(s => s.id !== selectedAlternative.id);
    if (pair.primarySupplier) {
      remainingAlternatives.push(pair.primarySupplier);
    }
    
    const updatedPair = {
      ...pair,
      primarySupplier: selectedAlternative,
      alternativeSuppliers: remainingAlternatives,
      performanceComparison: {
        primaryScore: selectedAlternative.performanceScore,
        alternativeScores: remainingAlternatives.map(s => ({ id: s.id, score: s.performanceScore })),
        recommendation: `${selectedAlternative.name} ana tedarikçi olarak seçildi`
      },
      lastReviewDate: new Date().toISOString().split('T')[0]
    };
    
    // Supplier pairs'i güncelle
    const updatedPairs = supplierPairs.map(p => 
      p.id === pair.id ? updatedPair : p
    );
    setSupplierPairs(updatedPairs);
    
    // ✅ DOĞRUDAN KAYDETME - setTimeout kaldırıldı, veri kaybi engellendi
    localStorage.setItem('supplier-pairs', JSON.stringify(updatedPairs));
    console.log('💾 Tedarikçi değişimi localStorage\'a kaydedildi');
    window.dispatchEvent(new Event('supplierDataUpdated'));
    
    showSnackbar(`${selectedAlternative.name} ana tedarikçi olarak seçildi`, 'success');
  };

  const handleConfirmSwitch = () => {
    if (!selectedPairForSwitch || !selectedAlternativeForSwitch) {
      showSnackbar('Lütfen bir alternatif tedarikçi seçin', 'error');
      return;
    }
    
    const selectedAlternative = selectedPairForSwitch.alternativeSuppliers.find(s => s.id === selectedAlternativeForSwitch);
    if (!selectedAlternative) {
      showSnackbar('Seçilen tedarikçi bulunamadı', 'error');
      return;
    }
    
    handleDirectSwitch(selectedPairForSwitch, selectedAlternative);
    setSwitchDialogOpen(false);
    setSelectedPairForSwitch(null);
    setSelectedAlternativeForSwitch('');
  };

  // Dialog handlers for all button functionalities
  const handleCreateSupplier = () => {
    setDialogType('supplier');
    setSelectedItem(null);
    setFormData({
      name: '',
      type: 'onaylı',
      category: 'genel',
      supplyType: 'malzeme',
      supplySubcategories: [],
      contact: { email: '', phone: '', address: '', contactPerson: '' },
      materialTypes: [],
      performanceScore: 88,
      qualityScore: 88,
      deliveryScore: 90,
      riskLevel: 'düşük',
      status: 'aktif'
    });
    setDialogOpen(true);
  };

  const handleCreatePair = () => {
    setDialogType('pair');
    setSelectedItem(null);
    setFormData({
      primarySupplierId: '',
      alternativeSupplierIds: [],
      category: 'genel'
    });
    setDialogOpen(true);
  };

  const handleCreateNonconformity = () => {
    setDialogType('nonconformity');
    setSelectedItem(null);
    setFormData({
      supplierId: '',
      title: '',
      description: '',
      category: 'kalite',
      severity: 'düşük',
      detectedDate: new Date().toISOString().split('T')[0],
      status: 'açık',
      dueDate: '',
      partCode: '', // Zorunlu alan
      quantityAffected: undefined,
      delayDays: undefined,
      recurrence: false
    });
    setDialogOpen(true);
  };

  const handleCreateDefect = () => {
    setDialogType('defect');
    setSelectedItem(null);
    setFormData({
      supplierId: '',
      defectType: '',
      description: '',
      quantity: 0,
      detectedDate: new Date().toISOString().split('T')[0],
      batchNumber: '',
      severity: 'minor',
      status: 'açık'
    });
    setDialogOpen(true);
  };

  const handleCreateAudit = () => {
    setDialogType('audit');
    setSelectedItem(null);
    setFormData({
      supplierId: '',
      auditDate: '',
      auditType: 'planlı',
      auditorName: '',
      findings: [],
      status: 'planlı'
    });
    setDialogOpen(true);
  };

  const handleEditAuditDate = (supplier: Supplier) => {
    setSelectedSupplierForAudit(supplier);
    setNewAuditDate(supplier.nextAuditDate);
    setAuditDateDialogOpen(true);
  };

  const handleSaveAuditDate = () => {
    if (selectedSupplierForAudit && newAuditDate) {
      const updatedSuppliers = suppliers.map(supplier => 
        supplier.id === selectedSupplierForAudit.id 
          ? { ...supplier, nextAuditDate: newAuditDate }
          : supplier
      );
      setSuppliers(updatedSuppliers);
      setAuditDateDialogOpen(false);
      setSelectedSupplierForAudit(null);
      setNewAuditDate('');
      showSnackbar(`${selectedSupplierForAudit.name} denetim tarihi güncellendi`, 'success');
    }
  };

  // Gecikme hesaplama fonksiyonu
  const calculateDelayDays = (plannedDate: string, actualDate: string): number => {
    const planned = new Date(plannedDate);
    const actual = new Date(actualDate);
    const diffTime = actual.getTime() - planned.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleExecuteAudit = (audit: AuditRecord) => {
    setSelectedAuditForExecution(audit);
    setAuditScore(0);
    setAuditFindings('');
    setAuditDelayReason('');
    const today = new Date().toISOString().split('T')[0];
    setAuditActualDate(today);
    
    // Gecikme hesaplama
    const delayDays = calculateDelayDays(audit.auditDate, today);
    setDelayDays(delayDays);
    setIsDelayed(delayDays > 0);
    
    setAuditExecutionDialogOpen(true);
  };

  // Denetim tarihini değiştirdiğinde gecikmeyi yeniden hesapla
  const handleAuditDateChange = (newDate: string) => {
    setAuditActualDate(newDate);
    if (selectedAuditForExecution) {
      const delayDays = calculateDelayDays(selectedAuditForExecution.auditDate, newDate);
      setDelayDays(delayDays);
      setIsDelayed(delayDays > 0);
      
      // Eğer gecikme kalktıysa gecikme açıklamasını temizle
      if (delayDays === 0) {
        setAuditDelayReason('');
      }
    }
  };

  // Denetim detaylarını görüntüleme fonksiyonu
  const handleViewAuditDetails = (audit: AuditRecord) => {
    setSelectedAuditForView(audit);
    setAuditDetailsDialogOpen(true);
  };

  const handleSaveAuditExecution = () => {
    if (!selectedAuditForExecution || auditScore === 0) {
      showSnackbar('Lütfen geçerli bir puan girin', 'error');
      return;
    }

    if (!auditActualDate) {
      showSnackbar('Lütfen denetim gerçekleşme tarihini seçin', 'error');
      return;
    }

    // Gecikme varsa açıklama zorunlu
    if (isDelayed && !auditDelayReason.trim()) {
      showSnackbar('Gecikme varsa açıklama girmeniz zorunludur', 'error');
      return;
    }
      
    // Denetim kaydını güncelle
    const updatedAudits = audits.map(audit => 
      audit.id === selectedAuditForExecution.id 
        ? { 
            ...audit, 
            status: 'tamamlandı' as const,
            actualAuditDate: auditActualDate, // Seçilen gerçekleşme tarihini kullan
            score: auditScore,
            findings: auditFindings ? auditFindings.split('\n').filter(f => f.trim()) : [],
            delayDays: delayDays,
            isDelayed: isDelayed,
            delayReason: isDelayed ? auditDelayReason : undefined
          }
        : audit
    );
    setAudits(updatedAudits);

    // Tedarikçi performans puanını güncelle
    const supplier = suppliers.find(s => s.id === selectedAuditForExecution.supplierId);
    if (supplier) {
      const updatedSuppliers = suppliers.map(s => 
        s.id === supplier.id 
          ? { 
              ...s, 
              performanceScore: auditScore,
              lastAuditDate: auditActualDate, // Seçilen gerçekleşme tarihini kullan
              auditStatus: 'tamamlandı' as const,
              status: 'aktif' as const // Denetim tamamlandığında aktif yap
            }
          : s
      );
      setSuppliers(updatedSuppliers);
      showSnackbar(`${supplier.name} denetimi başarıyla tamamlandı`, 'success');
    }

    // Dialog'u kapat ve form'u temizle
    setAuditExecutionDialogOpen(false);
    setSelectedAuditForExecution(null);
    setAuditScore(0);
    setAuditFindings('');
    setAuditActualDate('');
    setAuditDelayReason('');
    setDelayDays(0);
    setIsDelayed(false);
  };

  const handleEditItem = (item: any, type: string) => {
    setDialogType(type as any);
    setSelectedItem(item);
    
    // Düzenleme için form data'yı doğru şekilde hazırla
    let editFormData = { ...item };
    
    // Tedarikçi düzenlemesi için özel hazırlama
    if (type === 'supplier') {
      editFormData = {
        ...item,
        // Contact bilgilerini güvence altına al
        contact: {
          email: item.contact?.email || '',
          phone: item.contact?.phone || '',
          address: item.contact?.address || '',
          contactPerson: item.contact?.contactPerson || ''
        },
        // Array alanlarını güvence altına al
        materialTypes: item.materialTypes || [],
        supplySubcategories: item.supplySubcategories || [],
        // Skorları güvence altına al
        qualityScore: item.qualityScore || 0,
        deliveryScore: item.deliveryScore || 0,
        performanceScore: item.performanceScore || 0,
        // Diğer alanları güvence altına al
        supplyType: item.supplyType || 'malzeme',
        type: item.type || 'onaylı',
        category: item.category || 'genel',
        riskLevel: item.riskLevel || 'düşük',
        status: item.status || 'aktif'
      };
    }
    
    setFormData(editFormData);
    setDialogOpen(true);
    
    console.log('🔧 Düzenleme için form hazırlandı:', { type, original: item, prepared: editFormData });
  };

  const handleDeleteItem = (id: string, type: string) => {
    // Silme onay mesajını türe göre özelleştir
    let confirmMessage = 'Bu kaydı silmek istediğinizden emin misiniz?';
    let itemName = '';
    
    if (type === 'supplier') {
      const supplier = suppliers.find(s => s.id === id);
      itemName = supplier ? supplier.name : 'Bilinmeyen Tedarikçi';
      confirmMessage = `"${itemName}" tedarikçisini ve ilgili tüm kayıtlarını (eşleştirmeler, uygunsuzluklar, hatalar, denetimler) silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`;
    } else if (type === 'pair') {
      confirmMessage = 'Bu tedarikçi eşleştirmesini silmek istediğinizden emin misiniz?';
    } else if (type === 'nonconformity') {
      confirmMessage = 'Bu uygunsuzluk kaydını silmek istediğinizden emin misiniz?';
    } else if (type === 'defect') {
      confirmMessage = 'Bu hata kaydını silmek istediğinizden emin misiniz?';
    } else if (type === 'audit') {
      confirmMessage = 'Bu denetim planını silmek istediğinizden emin misiniz?';
    }
    
    if (window.confirm(confirmMessage)) {
      switch (type) {
        case 'supplier':
          // Silinecek tedarikçiyi bul
          const supplierToDelete = suppliers.find(s => s.id === id);
          if (!supplierToDelete) {
            showSnackbar('Tedarikçi bulunamadı', 'error');
            break;
          }
          
          // Tedarikçi listesinden kaldır
          const updatedSuppliers = suppliers.filter(s => s.id !== id);
          setSuppliers(updatedSuppliers);
          
          // Eşleştirmelerden temizle
          const cleanedPairs = supplierPairs.filter(pair => {
            // Ana tedarikçi bu değilse ve alternatif listesinde yoksa eşleştirmeyi koru
            return pair.primarySupplier.id !== id && 
                   !pair.alternativeSuppliers.some(alt => alt.id === id);
          }).map(pair => {
            // Alternatif listesinden kaldır (varsa)
            const filteredAlternatives = pair.alternativeSuppliers.filter(alt => alt.id !== id);
            if (filteredAlternatives.length !== pair.alternativeSuppliers.length) {
              // Alternatif skor listesini de güncelle
              const updatedAlternativeScores = pair.performanceComparison.alternativeScores.filter(score => score.id !== id);
              return {
                ...pair,
                alternativeSuppliers: filteredAlternatives,
                performanceComparison: {
                  ...pair.performanceComparison,
                  alternativeScores: updatedAlternativeScores
                }
              };
            }
            return pair;
          });
          setSupplierPairs(cleanedPairs);
          
          // İlgili uygunsuzlukları sil
          const cleanedNonconformities = nonconformities.filter(n => n.supplierId !== id);
          setNonconformities(cleanedNonconformities);
          
          // İlgili hataları sil
          const cleanedDefects = defects.filter(d => d.supplierId !== id);
          setDefects(cleanedDefects);
          
          // İlgili denetimleri sil
          const cleanedAudits = audits.filter(a => a.supplierId !== id);
          setAudits(cleanedAudits);
          
          // Otomatik kaydetme useEffect tarafından yapılacak - setTimeout kaldırıldı
          console.log('🔄 Tedarikçi ve ilgili tüm kayıtlar silindi, otomatik kaydetme useEffect tarafından yapılacak');
            window.dispatchEvent(new Event('supplierDataUpdated'));
          
          showSnackbar(
            `${supplierToDelete.name} tedarikçisi ve ilgili tüm kayıtlar başarıyla silindi`,
            'success'
          );
          break;
        case 'pair':
          const updatedPairs = supplierPairs.filter(p => p.id !== id);
          setSupplierPairs(updatedPairs);
          // Otomatik kaydetme useEffect tarafından yapılacak - setTimeout kaldırıldı
          console.log('🔄 Eşleştirme silindi, otomatik kaydetme useEffect tarafından yapılacak');
            window.dispatchEvent(new Event('supplierDataUpdated'));
          showSnackbar('Eşleştirme başarıyla silindi', 'success');
          break;
        case 'nonconformity':
          const updatedNonconformities = nonconformities.filter(n => n.id !== id);
          setNonconformities(updatedNonconformities);
          // Otomatik kaydetme useEffect tarafından yapılacak - setTimeout kaldırıldı
          console.log('🔄 Uygunsuzluk silindi, otomatik kaydetme useEffect tarafından yapılacak');
            window.dispatchEvent(new Event('supplierDataUpdated'));
          showSnackbar('Uygunsuzluk başarıyla silindi', 'success');
          break;
        case 'defect':
          const updatedDefects = defects.filter(d => d.id !== id);
          setDefects(updatedDefects);
          // Otomatik kaydetme useEffect tarafından yapılacak - setTimeout kaldırıldı
          console.log('🔄 Hata silindi, otomatik kaydetme useEffect tarafından yapılacak');
            window.dispatchEvent(new Event('supplierDataUpdated'));
          showSnackbar('Hata kaydı başarıyla silindi', 'success');
          break;
        case 'audit':
          const updatedAudits = audits.filter(a => a.id !== id);
          setAudits(updatedAudits);
          // Otomatik kaydetme useEffect tarafından yapılacak - setTimeout kaldırıldı
          console.log('🔄 Denetim silindi, otomatik kaydetme useEffect tarafından yapılacak');
            window.dispatchEvent(new Event('supplierDataUpdated'));
          showSnackbar('Denetim planı başarıyla silindi', 'success');
          break;
      }
    }
  };

  // Otomatik performans skoru hesaplama fonksiyonu
  const calculatePerformanceScore = (qualityScore: number, deliveryScore: number) => {
    // Kalite %60, Teslimat %40 ağırlıklı ortalama
    const weightedScore = (qualityScore * 0.6) + (deliveryScore * 0.4);
    return Math.round(weightedScore);
  };

  // Performans skoruna göre grade hesaplama fonksiyonu
  const getPerformanceGrade = (score: number, supplier?: Supplier) => {
    // N/A değerleri için özel durum (-1 veya negatif değerler)
    if (score < 0) {
      return { 
        grade: 'N/A', 
        color: 'default', 
        bgColor: '#9e9e9e', 
        description: 'Henüz değerlendirilmemiş' 
      };
    }
    
    // Henüz denetlenmemiş tedarikçiler için özel durum
    if (supplier && score === 0 && (!supplier.lastAuditDate || supplier.lastAuditDate === '')) {
      return { 
        grade: 'N/A', 
        color: 'default', 
        bgColor: '#9e9e9e', 
        description: 'Denetim bekleniyor' 
      };
    }
    
    // Yeni sınıflandırma sistemi
    if (score >= 90) return { grade: 'A', color: 'success', bgColor: '#4caf50', description: 'A Sınıfı (90-100)' };
    if (score >= 75) return { grade: 'B', color: 'info', bgColor: '#2196f3', description: 'B Sınıfı (75-89)' };
    if (score >= 60) return { grade: 'C', color: 'warning', bgColor: '#ff9800', description: 'C Sınıfı (60-74)' };
    return { grade: 'D', color: 'error', bgColor: '#f44336', description: 'D Sınıfı (0-59)' };
  };

  // Tedarikçi eşleştirmelerini güncelleme fonksiyonu
  const updateSupplierPairings = (updatedSupplier: Supplier) => {
    const updatedPairs = supplierPairs.map(pair => {
      let updated = false;
      let newPair = { ...pair };

      // Ana tedarikçi güncellemesi
      if (pair.primarySupplier.id === updatedSupplier.id) {
        newPair.primarySupplier = updatedSupplier;
        newPair.performanceComparison = {
          ...pair.performanceComparison,
          primaryScore: updatedSupplier.performanceScore
        };
        updated = true;
      }

      // Alternatif tedarikçi güncellemesi
      const altIndex = pair.alternativeSuppliers.findIndex(alt => alt.id === updatedSupplier.id);
      if (altIndex !== -1) {
        newPair.alternativeSuppliers[altIndex] = updatedSupplier;
        newPair.performanceComparison = {
          ...pair.performanceComparison,
          alternativeScores: pair.performanceComparison.alternativeScores.map(score => 
            score.id === updatedSupplier.id 
              ? { ...score, score: updatedSupplier.performanceScore }
              : score
          )
        };
        updated = true;
      }

      // Öneri metnini güncelle
      if (updated) {
        const primaryScore = newPair.performanceComparison.primaryScore;
        const maxAltScore = Math.max(...newPair.performanceComparison.alternativeScores.map(s => s.score));
        
        if (primaryScore >= maxAltScore + 5) {
          newPair.performanceComparison.recommendation = 'Ana tedarikçi performansı üstün';
        } else if (maxAltScore >= primaryScore + 5) {
          newPair.performanceComparison.recommendation = 'Alternatif tedarikçi değerlendirilmeli';
        } else {
          newPair.performanceComparison.recommendation = 'Performans skorları yakın, detaylı analiz gerekli';
        }
        
        newPair.lastReviewDate = new Date().toISOString().split('T')[0];
      }

      return newPair;
    });

    setSupplierPairs(updatedPairs);
    
    // ✅ DOĞRUDAN KAYDETME - setTimeout kaldırıldı, veri kaybi engellendi
    localStorage.setItem('supplier-pairs', JSON.stringify(updatedPairs));
    console.log('💾 Tedarikçi eşleştirmeleri güncellendi ve localStorage\'a kaydedildi');
    window.dispatchEvent(new Event('supplierDataUpdated'));
  };

  const handleSaveDialog = () => {
    const newId = `${dialogType.toUpperCase()}-${Date.now()}`;
    
    switch (dialogType) {
      case 'supplier':
        // Performans skorları doğrulama
        const qualityScore = Number(formData.qualityScore) || 0;
        const deliveryScore = Number(formData.deliveryScore) || 0;
        
        // Skorlar 0-100 arasında olmalı
        if (qualityScore < 0 || qualityScore > 100) {
          showSnackbar('Kalite skoru 0-100 arasında olmalıdır', 'error');
          return;
        }
        
        if (deliveryScore < 0 || deliveryScore > 100) {
          showSnackbar('Teslimat skoru 0-100 arasında olmalıdır', 'error');
          return;
        }
        
        // Otomatik performans skoru hesaplama
        const calculatedPerformanceScore = calculatePerformanceScore(qualityScore, deliveryScore);
        
        const newSupplier: Supplier = {
          ...formData,
          id: selectedItem ? selectedItem.id : newId,
          // Performans skorları - hesaplanmış değerler
          performanceScore: calculatedPerformanceScore,
          qualityScore: qualityScore,
          deliveryScore: deliveryScore,
          // Risk ve durum - default değerler
          riskLevel: formData.riskLevel || 'düşük',
          status: formData.status || 'aktif',
          // İletişim bilgileri - default değerler
          contact: {
            email: formData.contact?.email || '',
            phone: formData.contact?.phone || '',
            address: formData.contact?.address || '',
            contactPerson: formData.contact?.contactPerson || ''
          },
          // Malzeme türleri - default değer
          materialTypes: formData.materialTypes || [],
          // Tedarik bilgileri - default değerler
          supplyType: formData.supplyType || 'malzeme',
          supplySubcategories: formData.supplySubcategories || [],
          // Tarih bilgileri
          registrationDate: selectedItem ? selectedItem.registrationDate : new Date().toISOString().split('T')[0],
          lastAuditDate: selectedItem ? selectedItem.lastAuditDate : '',
          nextAuditDate: selectedItem ? selectedItem.nextAuditDate : '',
          auditStatus: 'planlı' as any,
          // Sayaçlar
          nonconformityCount: selectedItem ? selectedItem.nonconformityCount : 0,
          defectCount: selectedItem ? selectedItem.defectCount : 0,
          dofCount: selectedItem ? selectedItem.dofCount : 0,
          isActive: true,
          // Dosya ekleri
          attachments: formData.attachments || []
        };
        
        // Form validasyonu
        if (!formData.name || !formData.type) {
          showSnackbar('Tedarikçi adı ve türü zorunludur', 'error');
          return;
        }

        console.log('🔵 Tedarikçi kaydetme işlemi başlıyor:', {
          formData,
          newSupplier,
          selectedItem: !!selectedItem,
          calculatedScore: calculatedPerformanceScore
        });

        if (selectedItem) {
          const updatedSuppliers = suppliers.map(s => s.id === selectedItem.id ? newSupplier : s);
          console.log('✏️ Tedarikçi güncelleniyor:', {
            before: suppliers.length,
            after: updatedSuppliers.length,
            updated: newSupplier
          });
          setSuppliers(updatedSuppliers);
          
          // Tedarikçi eşleştirmelerini güncelle
          updateSupplierPairings(newSupplier);
          
          // Otomatik kaydetme useEffect tarafından yapılacak - setTimeout kaldırıldı
          console.log('🔄 Tedarikçi güncellendi, otomatik kaydetme useEffect tarafından yapılacak');
            window.dispatchEvent(new Event('supplierDataUpdated'));
          
          showSnackbar(`Tedarikçi başarıyla güncellendi. Genel performans skoru: ${calculatedPerformanceScore}`, 'success');
        } else {
          const updatedSuppliers = [...suppliers, newSupplier];
          console.log('➕ Yeni tedarikçi ekleniyor:', {
            before: suppliers.length,
            after: updatedSuppliers.length,
            new: newSupplier
          });
          setSuppliers(updatedSuppliers);
          
          // Otomatik kaydetme useEffect tarafından yapılacak - setTimeout kaldırıldı
          console.log('🔄 Yeni tedarikçi eklendi, otomatik kaydetme useEffect tarafından yapılacak');
            window.dispatchEvent(new Event('supplierDataUpdated'));
          
          showSnackbar(`Yeni tedarikçi başarıyla eklendi. Genel performans skoru: ${calculatedPerformanceScore}`, 'success');
        }
        break;
        
      case 'nonconformity':
        // Form validasyonu
        if (!formData.supplierId || !formData.title || !formData.partCode) {
          showSnackbar('Tedarikçi, başlık ve parça kodu alanları zorunludur', 'error');
          return;
        }
        
        if (!formData.description || formData.description.trim() === '') {
          showSnackbar('Uygunsuzluk açıklaması zorunludur', 'error');
          return;
        }
        
        if (!formData.dueDate) {
          showSnackbar('Tamamlanma tarihi zorunludur', 'error');
          return;
        }
        
        // Parça kodu validasyonu
        if (formData.partCode.length < 3) {
          showSnackbar('Parça kodu en az 3 karakter olmalıdır', 'error');
          return;
        }
        
        const newNonconformity: NonconformityRecord = {
          ...formData,
          id: selectedItem ? selectedItem.id : newId,
          recurrence: false
        };
        
        if (selectedItem) {
          const updatedNonconformities = nonconformities.map(n => n.id === selectedItem.id ? newNonconformity : n);
          setNonconformities(updatedNonconformities);
          
          // Otomatik kaydetme useEffect tarafından yapılacak - setTimeout kaldırıldı
          console.log('🔄 Uygunsuzluk güncellendi, otomatik kaydetme useEffect tarafından yapılacak');
            window.dispatchEvent(new Event('supplierDataUpdated'));
          
          showSnackbar('Uygunsuzluk başarıyla güncellendi', 'success');
        } else {
          const updatedNonconformities = [...nonconformities, newNonconformity];
          setNonconformities(updatedNonconformities);
          
          // Otomatik kaydetme useEffect tarafından yapılacak - setTimeout kaldırıldı
          console.log('🔄 Yeni uygunsuzluk eklendi, otomatik kaydetme useEffect tarafından yapılacak');
            window.dispatchEvent(new Event('supplierDataUpdated'));
          
          showSnackbar('Yeni uygunsuzluk başarıyla eklendi', 'success');
        }
        // ✅ DOĞRUDAN GÜNCELLEME - setTimeout kaldırıldı, veri kaybi engellendi
        updateSupplierPerformances();
        break;
        
      case 'defect':
        const newDefect: DefectRecord = {
          ...formData,
          id: selectedItem ? selectedItem.id : newId
        };
        
        if (selectedItem) {
          const updatedDefects = defects.map(d => d.id === selectedItem.id ? newDefect : d);
          setDefects(updatedDefects);
          
          // Otomatik kaydetme useEffect tarafından yapılacak - setTimeout kaldırıldı
          console.log('🔄 Hata güncellendi, otomatik kaydetme useEffect tarafından yapılacak');
            window.dispatchEvent(new Event('supplierDataUpdated'));
          
          showSnackbar('Hata kaydı başarıyla güncellendi', 'success');
        } else {
          const updatedDefects = [...defects, newDefect];
          setDefects(updatedDefects);
          
          // Otomatik kaydetme useEffect tarafından yapılacak - setTimeout kaldırıldı
          console.log('🔄 Yeni hata eklendi, otomatik kaydetme useEffect tarafından yapılacak');
            window.dispatchEvent(new Event('supplierDataUpdated'));
          
          showSnackbar('Yeni hata kaydı başarıyla eklendi', 'success');
        }
        // ✅ DOĞRUDAN GÜNCELLEME - setTimeout kaldırıldı, veri kaybi engellendi
        updateSupplierPerformances();
        break;
        
      case 'pair':
        // Form validasyonu - En az bir tedarikçi seçilmeli
        const alternativeSupplierIds = formData.alternativeSupplierIds || [];
        
        if (!formData.primarySupplierId && alternativeSupplierIds.length === 0) {
          showSnackbar('En az bir ana tedarikçi veya alternatif tedarikçi seçilmelidir', 'error');
          return;
        }
        
        // Ana tedarikçi kontrolü (opsiyonel)
        let primarySupplier: Supplier | undefined;
        if (formData.primarySupplierId) {
          primarySupplier = suppliers.find(s => s.id === formData.primarySupplierId);
          if (!primarySupplier) {
            showSnackbar('Seçilen ana tedarikçi bulunamadı', 'error');
          return;
          }
        }
        
        // Alternatif tedarikçiler
        const alternativeSuppliers: Supplier[] = [];
        
        // Alternatif tedarikçi varsa kontrol et
        for (const altId of alternativeSupplierIds) {
          if (altId === formData.primarySupplierId) {
            showSnackbar('Ana tedarikçi ile alternatif tedarikçi aynı olamaz', 'error');
          return;
          }
          
          const altSupplier = suppliers.find(s => s.id === altId);
          if (!altSupplier) {
            showSnackbar('Seçilen alternatif tedarikçilerden biri bulunamadı', 'error');
            return;
          }
          alternativeSuppliers.push(altSupplier);
        }
        
        // Performans karşılaştırması
        const alternativeScores = alternativeSuppliers.map(supplier => ({
          id: supplier.id,
          score: supplier.performanceScore
        }));
        
        let recommendation = '';
        if (primarySupplier && alternativeSuppliers.length > 0) {
          const bestAlternativeScore = Math.max(...alternativeSuppliers.map(s => s.performanceScore));
          recommendation = primarySupplier.performanceScore >= bestAlternativeScore 
            ? 'Ana tedarikçi önerilen' 
            : 'Alternatif tedarikçi değerlendirilebilir';
        } else if (primarySupplier) {
          recommendation = 'Ana tedarikçi mevcut - alternatif önerilir';
        } else if (alternativeSuppliers.length > 0) {
          const bestSupplier = alternativeSuppliers.reduce((best, current) => 
            current.performanceScore > best.performanceScore ? current : best
          );
          recommendation = `En iyi performans: ${bestSupplier.name} (${bestSupplier.performanceScore} puan)`;
        }
        
        const newPair: SupplierPair = {
          id: selectedItem ? selectedItem.id : newId,
          primarySupplier: primarySupplier || undefined,
          alternativeSuppliers,
          category: formData.category || 'genel',
          performanceComparison: {
            primaryScore: primarySupplier?.performanceScore,
            alternativeScores,
            recommendation
          },
          lastReviewDate: new Date().toISOString().split('T')[0],
          nextReviewDate: new Date(Date.now() + (parseInt(formData.reviewPeriod || '3') * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        };
        
        if (selectedItem) {
          const updatedPairs = supplierPairs.map(sp => sp.id === selectedItem.id ? newPair : sp);
          setSupplierPairs(updatedPairs);
          
          // ✅ DOĞRUDAN KAYDETME - setTimeout kaldırıldı, veri kaybi engellendi
          localStorage.setItem('supplier-pairs', JSON.stringify(updatedPairs));
          console.log('💾 Güncellenmiş eşleştirme localStorage\'a kaydedildi');
          window.dispatchEvent(new Event('supplierDataUpdated'));
          
          showSnackbar('Tedarikçi eşleştirmesi başarıyla güncellendi', 'success');
        } else {
          const updatedPairs = [...supplierPairs, newPair];
          setSupplierPairs(updatedPairs);
          
          // ✅ DOĞRUDAN KAYDETME - setTimeout kaldırıldı, veri kaybi engellendi
          localStorage.setItem('supplier-pairs', JSON.stringify(updatedPairs));
          console.log('💾 Yeni eşleştirme localStorage\'a kaydedildi');
          window.dispatchEvent(new Event('supplierDataUpdated'));
          
          showSnackbar('Yeni tedarikçi eşleştirmesi başarıyla oluşturuldu', 'success');
        }
        break;
        
      case 'audit':
        // Form validasyonu
        if (!formData.supplierId || !formData.auditDate || !formData.auditorName) {
          showSnackbar('Tedarikçi, denetim tarihi ve denetçi seçimi zorunludur', 'error');
          return;
        }
        
        const auditSupplier = suppliers.find(s => s.id === formData.supplierId);
        if (!auditSupplier) {
          showSnackbar('Seçilen tedarikçi bulunamadı', 'error');
          return;
        }
        
        const newAudit: AuditRecord = {
          id: selectedItem ? selectedItem.id : newId,
          supplierId: formData.supplierId,
          auditDate: formData.auditDate,
          actualAuditDate: formData.actualAuditDate,
          auditType: formData.auditType || 'planlı',
          auditorName: formData.auditorName,
          score: selectedItem ? selectedItem.score || 0 : 0, // Denetim tamamlandığında girülecek
          findings: selectedItem ? selectedItem.findings || [] : [],
          status: formData.status || 'planlı',
          nextAuditDate: new Date(new Date(formData.auditDate).getTime() + (365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // 1 yıl sonra
          isAutoScheduled: false,
          // Gecikme yönetimi alanları
          delayReason: formData.delayReason,
          delayDays: formData.delayDays,
          isDelayed: formData.isDelayed || false
        };
        
        if (selectedItem) {
          const updatedAudits = audits.map(a => a.id === selectedItem.id ? newAudit : a);
          setAudits(updatedAudits);
          
          // ✅ DOĞRUDAN KAYDETME - setTimeout kaldırıldı, veri kaybi engellendi
          localStorage.setItem('supplier-audits', JSON.stringify(updatedAudits));
          console.log('💾 Güncellenmiş denetim localStorage\'a kaydedildi');
          window.dispatchEvent(new Event('supplierDataUpdated'));
          
          showSnackbar('Denetim planı başarıyla güncellendi', 'success');
        } else {
          const updatedAudits = [...audits, newAudit];
          setAudits(updatedAudits);
          
          // ✅ DOĞRUDAN KAYDETME - setTimeout kaldırıldı, veri kaybi engellendi
          localStorage.setItem('supplier-audits', JSON.stringify(updatedAudits));
          console.log('💾 Yeni denetim localStorage\'a kaydedildi');
          window.dispatchEvent(new Event('supplierDataUpdated'));
          
          showSnackbar('Yeni denetim planı başarıyla oluşturuldu', 'success');
        }
        
        // Tedarikçinin denetim bilgilerini güncelle
        const updatedSuppliers = suppliers.map(s => 
          s.id === formData.supplierId 
            ? { ...s, nextAuditDate: formData.auditDate, auditStatus: 'planlı' as any }
            : s
        );
        setSuppliers(updatedSuppliers);
        
        // ✅ DOĞRUDAN KAYDETME - setTimeout kaldırıldı, veri kaybi engellendi
        localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
        console.log('💾 Tedarikçi denetim bilgileri localStorage\'a kaydedildi');
        window.dispatchEvent(new Event('supplierDataUpdated'));
        break;
    }
    
    setDialogOpen(false);
    setFormData({});
    setSelectedItem(null);
  };

  const getPerformanceColor = (score: number) => {
    // Yeni sınıflandırma sistemi renkleri
    if (score >= 90) return '#4caf50';  // A Sınıfı - Yeşil
    if (score >= 75) return '#2196f3';  // B Sınıfı - Mavi
    if (score >= 60) return '#ff9800';  // C Sınıfı - Turuncu
    return '#f44336';                   // D Sınıfı - Kırmızı
  };

  // Dinamik performans hesaplama fonksiyonu
  const calculateSupplierPerformance = React.useCallback((supplier: Supplier) => {
    console.log(`\n=== PERFORMANS HESAPLAMA: ${supplier.name} ===`);
    
    // Temel skorlar (başlangıç değerleri)
    let qualityScore = 100;
    let deliveryScore = 100;
    let performanceScore = 100;

    // Uygunsuzluk sayısına göre kalite skoru düşürme
    const supplierNonconformities = nonconformities.filter(nc => nc.supplierId === supplier.id);
    const activeNonconformities = supplierNonconformities.filter(nc => nc.status !== 'kapalı');
    
    console.log(`Toplam uygunsuzluk: ${supplierNonconformities.length}`);
    console.log(`Açık uygunsuzluk: ${activeNonconformities.length}`);
    
    // Her açık uygunsuzluk için puan düşürme
    qualityScore -= activeNonconformities.length * 5;
    console.log(`Açık uygunsuzluk düşümü: -${activeNonconformities.length * 5} puan`);
    
    // Kritik uygunsuzluklar için ek puan düşürme
    const criticalNonconformities = supplierNonconformities.filter(nc => nc.severity === 'kritik');
    qualityScore -= criticalNonconformities.length * 10;
    console.log(`Kritik uygunsuzluk: ${criticalNonconformities.length}, düşüm: -${criticalNonconformities.length * 10} puan`);

    // Hata sayısına göre kalite skoru düşürme
    const supplierDefects = defects.filter(d => d.supplierId === supplier.id);
    const activeDefects = supplierDefects.filter(d => d.status !== 'düzeltildi');
    
    console.log(`Toplam hata: ${supplierDefects.length}`);
    console.log(`Açık hata: ${activeDefects.length}`);
    
    // Her açık hata için puan düşürme
    qualityScore -= activeDefects.length * 3;
    console.log(`Açık hata düşümü: -${activeDefects.length * 3} puan`);
    
    // Kritik hatalar için ek puan düşürme
    const criticalDefects = supplierDefects.filter(d => d.severity === 'kritik');
    qualityScore -= criticalDefects.length * 8;
    console.log(`Kritik hata: ${criticalDefects.length}, düşüm: -${criticalDefects.length * 8} puan`);

    // Teslimat performansı (uygunsuzluk kategorisine göre)
    const deliveryNonconformities = supplierNonconformities.filter(nc => nc.category === 'teslimat');
    deliveryScore -= deliveryNonconformities.length * 7;
    console.log(`Teslimat uygunsuzluğu: ${deliveryNonconformities.length}, teslimat skoru düşümü: -${deliveryNonconformities.length * 7} puan`);

    // Son denetim tarihi kontrolü
    const lastAuditDate = new Date(supplier.lastAuditDate);
    const today = new Date();
    const monthsDiff = (today.getTime() - lastAuditDate.getTime()) / (1000 * 3600 * 24 * 30);
    
    console.log(`Son denetimden geçen ay sayısı: ${monthsDiff.toFixed(1)}`);
    
    // 12 aydan eski denetim için puan düşürme
    if (monthsDiff > 12) {
      const auditPenalty = Math.min(20, Math.floor(monthsDiff - 12) * 2);
      performanceScore -= auditPenalty;
      console.log(`Eski denetim cezası: -${auditPenalty} puan`);
    }

    // Risk seviyesine göre ek düşürme
    let riskPenalty = 0;
    switch (supplier.riskLevel) {
      case 'kritik':
        riskPenalty = 15;
        break;
      case 'yüksek':
        riskPenalty = 10;
        break;
      case 'orta':
        riskPenalty = 5;
        break;
      default:
        break;
    }
    performanceScore -= riskPenalty;
    console.log(`Risk seviyesi (${supplier.riskLevel}) cezası: -${riskPenalty} puan`);

    // Minimum skor 0, maksimum 100
    qualityScore = Math.max(0, Math.min(100, qualityScore));
    deliveryScore = Math.max(0, Math.min(100, deliveryScore));
    
    // Genel performans skoru (ağırlıklı ortalama)
    performanceScore = Math.round((qualityScore * 0.6 + deliveryScore * 0.4));
    performanceScore = Math.max(0, Math.min(100, performanceScore));

    console.log(`SONUÇ - Kalite: ${qualityScore}, Teslimat: ${deliveryScore}, Genel: ${performanceScore}`);
    console.log(`=== HESAPLAMA BİTTİ ===\n`);

    return {
      qualityScore: Math.round(qualityScore),
      deliveryScore: Math.round(deliveryScore),
      performanceScore: Math.round(performanceScore)
    };
  }, [nonconformities, defects]);

  // Tedarikçi performanslarını güncelleyen fonksiyon
  const updateSupplierPerformances = React.useCallback(() => {
    console.log('📊 Performans güncellemesi başlıyor...');
    const updatedSuppliers = suppliers.map(supplier => {
          // Sadece değerlendirilmiş tedarikçilerin performansını güncelle
    // N/A değerleri (-1 veya 0) olan tedarikçileri olduğu gibi bırak
    if (supplier.performanceScore <= 0 || supplier.qualityScore <= 0 || supplier.deliveryScore <= 0) {
      console.log(`⏭️ ${supplier.name}: N/A (${supplier.performanceScore}/${supplier.qualityScore}/${supplier.deliveryScore}) - performans hesaplaması atlandı`);
      return supplier; // N/A tedarikçiyi değiştirmeden geri döndür
    }
      
      const newScores = calculateSupplierPerformance(supplier);
      console.log(`🎯 ${supplier.name}: Genel ${newScores.performanceScore}, Kalite ${newScores.qualityScore}, Teslimat ${newScores.deliveryScore}`);
      return {
        ...supplier,
        ...newScores
      };
    });
    setSuppliers(updatedSuppliers);
    
    // ✅ DOĞRUDAN KAYDETME - setTimeout kaldırıldı, veri kaybi engellendi
    localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
    console.log('💾 Güncellenmiş performans skoru localStorage\'a kaydedildi');
    window.dispatchEvent(new Event('supplierDataUpdated'));
    
    console.log('✅ Performans güncellemesi tamamlandı');
  }, [suppliers, calculateSupplierPerformance]);

  // Radar chart data preparation
  const prepareRadarData = React.useCallback(() => {
    // Sadece değerlendirilmiş tedarikçileri al (N/A değerleri hariç)
    // %0 değerler de N/A kabul ediliyor
    const ratedSuppliers = suppliers.filter(s => 
      s.performanceScore > 0 && s.qualityScore > 0 && s.deliveryScore > 0
    );
    
    const selectedSuppliers = selectedSuppliersForRadar.length > 0 
      ? ratedSuppliers.filter(s => selectedSuppliersForRadar.includes(s.id))
      : ratedSuppliers.slice(0, 3); // İlk 3 değerlendirilmiş tedarikçi default

    // Performans boyutları
    const performanceDimensions = [
      { dimension: 'Kalite', key: 'qualityScore' },
      { dimension: 'Teslimat', key: 'deliveryScore' },
      { dimension: 'Güvenilirlik', key: 'reliabilityScore' },
      { dimension: 'İnovasyon', key: 'innovationScore' },
      { dimension: 'Sürdürülebilirlik', key: 'sustainabilityScore' }
    ];

    return performanceDimensions.map(dim => {
      const dataPoint: any = { dimension: dim.dimension };
      
      selectedSuppliers.forEach(supplier => {
        let score = 0;
        
        switch(dim.key) {
          case 'qualityScore':
            score = supplier.qualityScore > 0 ? supplier.qualityScore : 0; // N/A değerleri (%0 dahil) 0 olarak göster
            break;
          case 'deliveryScore':
            score = supplier.deliveryScore > 0 ? supplier.deliveryScore : 0; // N/A değerleri (%0 dahil) 0 olarak göster
            break;
          case 'reliabilityScore':
            // Güvenilirlik: Son denetim tarihi + uygunsuzluk sayısı bazlı
            const monthsSinceAudit = Math.floor((new Date().getTime() - new Date(supplier.lastAuditDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
            score = Math.max(50, 100 - (monthsSinceAudit * 2) - (supplier.nonconformityCount * 5));
            break;

          case 'innovationScore':
            // İnovasyon: Tedarikçi kategorisi ve türü bazlı
            const categoryBonus = supplier.category === 'stratejik' ? 20 : supplier.category === 'kritik' ? 15 : 10;
            const typeBonus = supplier.supplyType === 'hibrit' ? 15 : supplier.supplyType === 'hizmet' ? 10 : 5;
            score = Math.min(100, 60 + categoryBonus + typeBonus);
            break;
          case 'sustainabilityScore':
            // Sürdürülebilirlik: Tedarikçi yaşı + sertifikasyon durumu bazlı
            const registrationAge = Math.floor((new Date().getTime() - new Date(supplier.registrationDate).getTime()) / (1000 * 60 * 60 * 24 * 365));
            const ageBonus = Math.min(20, registrationAge * 3);
            score = Math.min(100, 70 + ageBonus);
            break;
          default:
            score = supplier.performanceScore;
        }
        
        dataPoint[supplier.name.split(' ')[0]] = Math.round(score);
      });
      
      return dataPoint;
    });
  }, [suppliers, selectedSuppliersForRadar]);

  // Dashboard component
  const renderDashboard = () => {
    // Temel metrikler - N/A değerleri ayrı hesaplanıyor
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.status === 'aktif');
    
    // N/A değerleri (-1) hariç ortalama hesapla
    const ratedSuppliers = suppliers.filter(s => s.performanceScore > 0); // %0 değerler de N/A kabul ediliyor
    const naSuppliers = suppliers.filter(s => s.performanceScore <= 0); // %0 değerler de N/A kabul ediliyor
    
    const avgPerformance = ratedSuppliers.length > 0 
      ? Math.round(ratedSuppliers.reduce((acc, s) => acc + s.performanceScore, 0) / ratedSuppliers.length)
      : 0;
    
    const openNonconformities = nonconformities.filter(nc => nc.status === 'açık');
    const criticalSuppliers = suppliers.filter(s => s.riskLevel === 'kritik' || s.riskLevel === 'yüksek');
    
    // Uygunsuzluk çözüm performansı
    const totalNonconformities = nonconformities.length;
    const resolvedNonconformities = nonconformities.filter(nc => nc.status === 'kapalı').length;
    const resolutionRate = totalNonconformities > 0 
      ? Math.round((resolvedNonconformities / totalNonconformities) * 100) 
      : 100;
    
    // Kategori bazlı performans - N/A değerleri ayrı hesaplanıyor
    const categoryData = [
      { name: 'Stratejik', key: 'stratejik' },
      { name: 'Kritik', key: 'kritik' },
      { name: 'Rutin', key: 'rutin' },
      { name: 'Genel', key: 'genel' }
    ].map(cat => {
      const categorySuppliers = suppliers.filter(s => s.category === cat.key);
      
      // N/A değerleri (-1 veya 0) ayrı say - tüm performans puanlarını kontrol et
      const ratedSuppliers = categorySuppliers.filter(s => 
        s.performanceScore > 0 && s.qualityScore > 0 && s.deliveryScore > 0
      );
      const naSuppliers = categorySuppliers.filter(s => 
        s.performanceScore <= 0 || s.qualityScore <= 0 || s.deliveryScore <= 0
      );
      
      const avgScore = ratedSuppliers.length > 0 
        ? Math.round(ratedSuppliers.reduce((acc, s) => acc + s.performanceScore, 0) / ratedSuppliers.length)
        : 0;
      
      return {
        category: cat.name,
        ortalama: avgScore,
        adet: categorySuppliers.length,
        ratedCount: ratedSuppliers.length,
        naCount: naSuppliers.length,
        hedef: cat.key === 'stratejik' ? 90 : cat.key === 'kritik' ? 85 : cat.key === 'rutin' ? 85 : 85
      };
    }).filter(cat => cat.adet > 0); // Sadece tedarikçisi olan kategorileri göster
    
    // Performans karşılaştırması için tedarikçiler - sadece değerlendirilmiş aktif tedarikçiler
    // %0 değerler de N/A kabul ediliyor
    const filteredSuppliers = suppliers
      .filter(s => s.status === 'aktif' && s.performanceScore > 0 && s.qualityScore > 0 && s.deliveryScore > 0) // Tüm N/A değerleri (%0 dahil) hariç
      .sort((a, b) => b.performanceScore - a.performanceScore); // Performansa göre sırala
      
    let performanceData = filteredSuppliers;
    
    // Filtreye göre veri seçimi
    if (performanceFilter === 'top10') {
      performanceData = filteredSuppliers.slice(0, 10); // En iyi 10
    } else if (performanceFilter === 'worst10') {
      performanceData = filteredSuppliers.slice(-10).reverse(); // En kötü 10 (ters sıralı)
    } else {
      performanceData = filteredSuppliers.slice(0, 8); // Tümü (mevcut 8 limit)
    }
    
    // Chart için veri hazırlama
    const chartData = performanceData.map(s => ({
        name: s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name,
        kalite: s.qualityScore,
        teslimat: s.deliveryScore,
        genel: s.performanceScore
      }));

    return (
    <Grid container spacing={3}>
        {/* Tedarikçi Sayısı */}
      <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            height: '140px'
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <BusinessIcon fontSize="large" />
              </Avatar>
                <Box flex={1}>
                <Typography variant="h4" fontWeight="bold">
                    {totalSuppliers}
                </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Toplam Tedarikçi
                </Typography>
                  {totalSuppliers > 0 && (
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {activeSuppliers.length} aktif
                    </Typography>
                  )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Ortalama Performans */}
      <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ 
            borderRadius: 3, 
            background: avgPerformance >= 90 ? 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)' :  // A Sınıfı - Yeşil
                        avgPerformance >= 75 ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' :  // B Sınıfı - Mavi
                        avgPerformance >= 60 ? 'linear-gradient(135deg, #e65100 0%, #d84315 100%)' :  // C Sınıfı - Turuncu
                        'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',                            // D Sınıfı - Kırmızı
            color: 'white',
            height: '140px'
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <AssessmentIcon fontSize="large" />
              </Avatar>
                <Box flex={1}>
                <Typography variant="h4" fontWeight="bold">
                    {totalSuppliers > 0 ? avgPerformance : 0}
                </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Ortalama Performans
                </Typography>
                  {totalSuppliers > 0 && (
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {ratedSuppliers.length} değerlendirilmiş tedarikçi ortalaması
                    </Typography>
                  )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Açık Sorun */}
      <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
            color: 'white',
            height: '140px'
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <WarningIcon fontSize="large" />
              </Avatar>
                <Box flex={1}>
                <Typography variant="h4" fontWeight="bold">
                    {openNonconformities.length}
                </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Açık Sorun
                </Typography>
                  {totalNonconformities > 0 && (
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {totalNonconformities} toplam kayıt
                    </Typography>
                  )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Çözüm Oranı */}
      <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #e65100 0%, #d84315 100%)',
            color: 'white',
            height: '140px'
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <CheckCircleIcon fontSize="large" />
              </Avatar>
                <Box flex={1}>
                <Typography variant="h4" fontWeight="bold">
                    %{resolutionRate}
                </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Çözüm Oranı
                </Typography>
                  {totalNonconformities > 0 && (
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {resolvedNonconformities}/{totalNonconformities}
                    </Typography>
                  )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

        {/* Kategori Bazlı Performans Analizi */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardHeader 
              title="Kategori Bazlı Performans" 
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              sx={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #e1f5fe 100%)' }}
            />
          <CardContent>
              {categoryData.length > 0 ? (
                <Box height={280}>
              <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <ChartTooltip 
                        formatter={(value: any, name: any, props: any) => [
                          `${value} puan`,
                          name === 'ortalama' ? 'Ortalama Performans' : 
                          name === 'hedef' ? 'Hedef Performans' : 'Tedarikçi Puanı'
                        ]}
                        labelFormatter={(label: any) => {
                          const categoryInfo = categoryData.find(cat => cat.category === label);
                          if (categoryInfo) {
                            return `${label} Kategori (${categoryInfo.ratedCount} değerlendirilmiş, ${categoryInfo.naCount} N/A)`;
                          }
                          return label;
                        }}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #ddd',
                          borderRadius: '8px'
                        }}
                      />
                  <Legend />
                      <Bar dataKey="ortalama" fill="#1976d2" name="Ortalama Performans" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="hedef" fill="#f57c00" name="Hedef" radius={[4, 4, 0, 0]} stroke="#e65100" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
              ) : (
                <Box height={280} display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={2}>
                  <BusinessIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Henüz tedarikçi bulunmuyor.<br />
                    Performans analizi için tedarikçi ekleyin.
                  </Typography>
                </Box>
              )}
          </CardContent>
        </Card>
      </Grid>

        {/* Risk Dağılımı */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
          <CardHeader 
            title="Risk Dağılımı" 
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              sx={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}
            />
            <CardContent>
              {totalSuppliers > 0 ? (
                <Grid container spacing={2} sx={{ height: 280 }}>
                  {[
                    { level: 'Kritik', count: suppliers.filter(s => s.riskLevel === 'kritik').length, color: '#d32f2f' },
                    { level: 'Yüksek', count: suppliers.filter(s => s.riskLevel === 'yüksek').length, color: '#f57c00' },
                    { level: 'Orta', count: suppliers.filter(s => s.riskLevel === 'orta').length, color: '#fbc02d' },
                    { level: 'Düşük', count: suppliers.filter(s => s.riskLevel === 'düşük').length, color: '#388e3c' }
                  ].map((risk, index) => (
                    <Grid item xs={6} key={risk.level}>
                      <Card 
                        elevation={2} 
            sx={{ 
                          p: 2, 
                          textAlign: 'center', 
                          background: `linear-gradient(135deg, ${risk.color}15 0%, ${risk.color}25 100%)`,
                          border: `2px solid ${risk.color}30`,
                          borderRadius: 3,
                          height: '120px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography variant="h4" fontWeight="bold" sx={{ color: risk.color }}>
                          {risk.count}
                        </Typography>
                        <Typography variant="body2" sx={{ color: risk.color, fontWeight: 600 }}>
                          {risk.level} Risk
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                          {totalSuppliers > 0 ? `%${Math.round((risk.count / totalSuppliers) * 100)}` : '0%'}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box height={280} display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={2}>
                  <SecurityIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Henüz tedarikçi bulunmuyor.<br />
                    Risk analizi için tedarikçi ekleyin.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sistem İstatistikleri - Sayfa Boyunca İnce */}
        <Grid item xs={12}>
          <Card elevation={2} sx={{ borderRadius: 3, mb: 2 }}>
            <CardContent sx={{ py: 2, px: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                {/* Başlık */}
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                    <AssessmentIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    Sistem İstatistikleri
                  </Typography>
                </Box>

                {/* İstatistik Kartları */}
                <Box display="flex" gap={3} alignItems="center" flexWrap="wrap">
                {/* Çözüm Oranı */}
                  <Box display="flex" alignItems="center" gap={2} 
                    sx={{ 
                      bgcolor: 'rgba(33, 150, 243, 0.08)', 
                      borderRadius: 2, 
                      px: 2, 
                      py: 1,
                      border: '1px solid rgba(33, 150, 243, 0.2)'
                    }}
                  >
                    <Box textAlign="center">
                      <Typography variant="h5" fontWeight="bold" color="primary.main">
                    %{resolutionRate}
                  </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Çözüm Oranı
                  </Typography>
                    </Box>
                    <Box sx={{ width: 60, height: 4 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={resolutionRate} 
                      sx={{ 
                          height: 4, 
                          borderRadius: 2,
                          backgroundColor: 'rgba(33, 150, 243, 0.2)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: resolutionRate >= 90 ? '#4caf50' : 
                                           resolutionRate >= 75 ? '#ff9800' : '#f44336'
                        }
                      }} 
                    />
                  </Box>
                </Box>

                  {/* Açık Sorunlar */}
                  <Box display="flex" alignItems="center" gap={2}
                    sx={{ 
                      bgcolor: 'rgba(255, 152, 0, 0.08)', 
                      borderRadius: 2, 
                      px: 2, 
                      py: 1,
                      border: '1px solid rgba(255, 152, 0, 0.2)'
                    }}
                  >
                    <Box textAlign="center">
                      <Typography variant="h5" fontWeight="bold" color="warning.main">
                    {openNonconformities.length}
                  </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Açık Sorun
                  </Typography>
                    </Box>
                  <Typography variant="caption" color="text.secondary">
                      / {totalNonconformities}
                  </Typography>
                </Box>

                {/* Risk Seviyesi */}
                  <Box display="flex" alignItems="center" gap={2}
                    sx={{ 
                      bgcolor: 'rgba(244, 67, 54, 0.08)', 
                      borderRadius: 2, 
                      px: 2, 
                      py: 1,
                      border: '1px solid rgba(244, 67, 54, 0.2)'
                    }}
                  >
                    <Box textAlign="center">
                      <Typography variant="h5" fontWeight="bold" color="error.main">
                    {criticalSuppliers.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Yüksek Risk
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      / {totalSuppliers}
                    </Typography>
                  </Box>

                  {/* Aktif Tedarikçi */}
                  <Box display="flex" alignItems="center" gap={2}
                    sx={{ 
                      bgcolor: 'rgba(76, 175, 80, 0.08)', 
                      borderRadius: 2, 
                      px: 2, 
                      py: 1,
                      border: '1px solid rgba(76, 175, 80, 0.2)'
                    }}
                  >
                    <Box textAlign="center">
                      <Typography variant="h5" fontWeight="bold" color="success.main">
                        {activeSuppliers.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Aktif Tedarikçi
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      / {totalSuppliers}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tedarikçi Performans Karşılaştırması - Tam Genişlik */}
        <Grid item xs={12}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardHeader 
              title="Tedarikçi Performans Karşılaştırması" 
              titleTypographyProps={{ variant: 'h5', fontWeight: 600 }}
              sx={{ 
                background: 'linear-gradient(135deg, #e8f5e8 0%, #e1f5fe 100%)',
                '& .MuiCardHeader-title': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }
              }}
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AssessmentIcon />
                </Avatar>
              }
              action={
                <Box display="flex" alignItems="center" gap={1} sx={{ pr: 2 }}>
                  <Chip 
                    label={`${performanceData.length} Tedarikçi`} 
                    color="primary" 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
              }
          />
          <CardContent sx={{ p: 4 }}>
              {performanceData.length > 0 ? (
                <Box>
                  {/* Performans Özeti ve Filtre Butonları */}
                  <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Box display="flex" alignItems="center" gap={4}>
                      <Box textAlign="center">
                        <Typography variant="h4" fontWeight="bold" color="primary.main">
                          {Math.round(chartData.reduce((acc, item) => acc + item.genel, 0) / chartData.length)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                          Ortalama Genel Performans
                        </Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="h4" fontWeight="bold" color="info.main">
                          {Math.round(chartData.reduce((acc, item) => acc + item.kalite, 0) / chartData.length)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ortalama Kalite Skoru
                        </Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="h4" fontWeight="bold" color="success.main">
                          {Math.round(chartData.reduce((acc, item) => acc + item.teslimat, 0) / chartData.length)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ortalama Teslimat Skoru
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Filtre Butonları */}
                    <Box display="flex" gap={1}>
                      <Button
                        variant={performanceFilter === 'all' ? 'contained' : 'outlined'}
                        color="primary"
                        size="small"
                        onClick={() => setPerformanceFilter('all')}
                        sx={{ minWidth: 80 }}
                      >
                        Tümü
                      </Button>
                      <Button
                        variant={performanceFilter === 'top10' ? 'contained' : 'outlined'}
                        color="success"
                        size="small"
                        onClick={() => setPerformanceFilter('top10')}
                        sx={{ minWidth: 80 }}
                      >
                        Top 10
                      </Button>
                      <Button
                        variant={performanceFilter === 'worst10' ? 'contained' : 'outlined'}
                        color="error"
                        size="small"
                        onClick={() => setPerformanceFilter('worst10')}
                        sx={{ minWidth: 80 }}
                      >
                        En Kötü 10
                      </Button>
                    </Box>
                  </Box>

                  {/* Büyük Chart */}
                  <Box height={500} sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 2, 
                    p: 2,
                    background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)'
                  }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={chartData} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                        barCategoryGap="15%"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.7} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12, fill: '#666' }} 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tick={{ fontSize: 12, fill: '#666' }}
                          label={{ 
                            value: 'Performans Skoru (%)', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { textAnchor: 'middle', fontSize: '14px', fill: '#666' }
                          }}
                        />
                        <ChartTooltip 
                          formatter={(value: any, name: any) => [`${value} puan`, name]}
                          labelStyle={{ fontWeight: 'bold', color: '#333' }}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                            border: '1px solid #ddd',
                            borderRadius: '12px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            fontSize: '13px'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ 
                            paddingTop: '20px',
                            fontSize: '14px'
                          }}
                        />
                        <Bar 
                          dataKey="kalite" 
                          fill="#2196f3" 
                          name="Kalite Performansı" 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={80}
                        />
                        <Bar 
                          dataKey="teslimat" 
                          fill="#4caf50" 
                          name="Teslimat Performansı" 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={80}
                        />
                        <Bar 
                          dataKey="genel" 
                          fill="#1976d2" 
                          name="Genel Performans" 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={80}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>

                  {/* Performans Sıralaması - Profesyonel Tablo */}
                  <Box mt={4}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography variant="h6" fontWeight={600} color="text.primary">
                        Performans Sıralaması
                      </Typography>
                      <Chip 
                        label={`${performanceData.length} Tedarikçi`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    
                    <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'linear-gradient(135deg, #f5f5f5 0%, #e8f5e8 100%)' }}>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Sıra</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Tedarikçi</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary', textAlign: 'center' }}>Genel</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary', textAlign: 'center' }}>Kalite</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary', textAlign: 'center' }}>Teslimat</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'text.primary', textAlign: 'center' }}>Durum</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {performanceData
                              .sort((a, b) => b.performanceScore - a.performanceScore)
                              .map((supplier, index) => {
                                const isTopPerformer = index === 0;
                                const supplierFullName = supplier.name;
                                
                                return (
                                  <TableRow 
                                    key={supplier.id}
                                    hover
                                    sx={{ 
                                      bgcolor: isTopPerformer ? 'rgba(33, 150, 243, 0.04)' : 'inherit',
                                      borderLeft: isTopPerformer ? '4px solid #2196f3' : '4px solid transparent',
                                      '&:hover': {
                                        bgcolor: isTopPerformer ? 'rgba(33, 150, 243, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                                      }
                                    }}
                                  >
                                    <TableCell>
                                      <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar 
                                          sx={{ 
                                            width: 32, 
                                            height: 32,
                                            bgcolor: isTopPerformer ? 'gold' : 
                                                     index === 1 ? 'silver' : 
                                                     index === 2 ? '#cd7f32' : 'grey.300',
                                            color: isTopPerformer ? 'black' : 'white',
                                            fontSize: '14px',
                                            fontWeight: 'bold'
                                          }}
                                        >
                                          {index + 1}
                                        </Avatar>
                                        {isTopPerformer && (
                                          <Chip 
                                            label="En İyi" 
                                            color="primary" 
                                            size="small" 
                                            sx={{ fontSize: '11px' }}
                                          />
                                        )}
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Box>
                                        <Typography variant="body1" fontWeight={500}>
                                          {supplier.name.length > 20 ? supplier.name.substring(0, 20) + '...' : supplier.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                                          {supplier.category}
                  </Typography>
                </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Box display="flex" flexDirection="column" alignItems="center">
                                        <Typography variant="h6" fontWeight={600} color={
                                          supplier.performanceScore >= 90 ? 'success.main' :
                                          supplier.performanceScore >= 75 ? 'info.main' :
                                          supplier.performanceScore >= 60 ? 'warning.main' : 'error.main'
                                        }>
                                          {supplier.performanceScore}%
                                        </Typography>
                                        <LinearProgress 
                                          variant="determinate" 
                                          value={supplier.performanceScore} 
                                          sx={{ 
                                            width: 60,
                                            height: 4,
                                            borderRadius: 2,
                                            bgcolor: 'grey.200',
                                            '& .MuiLinearProgress-bar': {
                                              bgcolor: supplier.performanceScore >= 90 ? '#4caf50' :
                                                       supplier.performanceScore >= 75 ? '#2196f3' :
                                                       supplier.performanceScore >= 60 ? '#ff9800' : '#f44336'
                                            }
                                          }} 
                                        />
              </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Typography variant="body2" fontWeight={500}>
                                        {supplier.qualityScore}%
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Typography variant="body2" fontWeight={500}>
                                        {supplier.deliveryScore}%
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      <Chip 
                                        label={
                                          supplier.performanceScore >= 90 ? 'Mükemmel' :
                                          supplier.performanceScore >= 75 ? 'İyi' :
                                          supplier.performanceScore >= 60 ? 'Orta' : 'Zayıf'
                                        }
                                        color={
                                          supplier.performanceScore >= 90 ? 'success' :
                                          supplier.performanceScore >= 75 ? 'info' :
                                          supplier.performanceScore >= 60 ? 'warning' : 'error'
                                        }
                                        variant={isTopPerformer ? 'filled' : 'outlined'}
                                        size="small"
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Box>
                </Box>
              ) : (
                <Box height={350} display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={2}>
                  <AssessmentIcon sx={{ fontSize: 64, color: 'grey.400' }} />
                  <Typography variant="h6" color="text.secondary" textAlign="center">
                    Henüz aktif tedarikçi bulunmuyor
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Performans karşılaştırması için en az bir tedarikçi ekleyin ve değerlendirin.
                  </Typography>
                </Box>
              )}
          </CardContent>
        </Card>
      </Grid>




    </Grid>
  );
  };

  // Supplier Pairing Component
  const renderSupplierPairing = () => {
    // Filtrelenmiş eşleştirme verilerini hesapla
    const filteredPairs = supplierPairs.filter(pair => {
      const matchesSearch = pairingSearchTerm === '' || 
        (pair.primarySupplier?.name.toLowerCase().includes(pairingSearchTerm.toLowerCase())) ||
        pair.alternativeSuppliers.some(alt => alt.name.toLowerCase().includes(pairingSearchTerm.toLowerCase())) ||
        pair.category.toLowerCase().includes(pairingSearchTerm.toLowerCase());
      
      const matchesCategory = pairingCategoryFilter === 'all' || pair.category === pairingCategoryFilter;
      
      const matchesStatus = pairingStatusFilter === 'all' || (
        pairingStatusFilter === 'primary-missing' && !pair.primarySupplier ||
        pairingStatusFilter === 'alternatives-only' && !pair.primarySupplier && pair.alternativeSuppliers.length > 0 ||
        pairingStatusFilter === 'complete' && pair.primarySupplier && pair.alternativeSuppliers.length > 0
      );
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Özet istatistikler
    const stats = {
      totalPairs: supplierPairs.length,
      completePairs: supplierPairs.filter(p => p.primarySupplier && p.alternativeSuppliers.length > 0).length,
      missingPrimary: supplierPairs.filter(p => !p.primarySupplier).length,
      alternativesOnly: supplierPairs.filter(p => !p.primarySupplier && p.alternativeSuppliers.length > 0).length,
      avgPerformance: supplierPairs.length > 0 ? Math.round(
        supplierPairs
          .filter(p => p.primarySupplier)
          .reduce((acc, p) => acc + (p.performanceComparison.primaryScore || 0), 0) / 
        supplierPairs.filter(p => p.primarySupplier).length
      ) : 0
    };

    return (
    <Box>
        {/* Özet İstatistikler */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                <LinkIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">{stats.totalPairs}</Typography>
              <Typography variant="caption" color="text.secondary">Toplam Eşleştirme</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                <CheckCircleIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold" color="success.main">{stats.completePairs}</Typography>
              <Typography variant="caption" color="text.secondary">Tam Eşleştirme</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                <WarningIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold" color="warning.main">{stats.missingPrimary}</Typography>
              <Typography variant="caption" color="text.secondary">Ana Tedarikçi Eksik</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                <AssessmentIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold" color="info.main">{stats.avgPerformance}%</Typography>
              <Typography variant="caption" color="text.secondary">Ortar. Performans</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                <BusinessIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold" color="secondary.main">{filteredPairs.length}</Typography>
              <Typography variant="caption" color="text.secondary">Filtre Sonucu</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Filtre ve Arama */}
        <Card elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <UltraIsolatedSearchInput
                initialValue={pairingSearchTerm}
                onDebouncedChange={handlePairingDebouncedSearchChange}
                placeholder="Eşleştirme ara (tedarikçi adı, kategori)..."
                size="small"
                fullWidth
                clearTrigger={pairingClearTrigger}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ bgcolor: 'white', px: 1 }}>Kategori</InputLabel>
                <Select 
                  value={pairingCategoryFilter}
                  onChange={(e) => setPairingCategoryFilter(e.target.value)}
                  sx={{ bgcolor: 'white' }}
                >
                  <MenuItem value="all">Tüm Kategoriler</MenuItem>
                  <MenuItem value="stratejik">Stratejik</MenuItem>
                  <MenuItem value="kritik">Kritik</MenuItem>
                  <MenuItem value="rutin">Rutin</MenuItem>
                  <MenuItem value="genel">Genel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ bgcolor: 'white', px: 1 }}>Durum</InputLabel>
                <Select 
                  value={pairingStatusFilter}
                  onChange={(e) => setPairingStatusFilter(e.target.value)}
                  sx={{ bgcolor: 'white' }}
                >
                  <MenuItem value="all">Tüm Durumlar</MenuItem>
                  <MenuItem value="complete">Tam Eşleştirme</MenuItem>
                  <MenuItem value="primary-missing">Ana Tedarikçi Eksik</MenuItem>
                  <MenuItem value="alternatives-only">Sadece Alternatifler</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button 
                fullWidth
                variant="contained" 
                startIcon={<LinkIcon />} 
                onClick={handleCreatePair}
                sx={{ height: 40 }}
              >
          Yeni Eşleştirme
        </Button>
            </Grid>
          </Grid>
        </Card>

      {/* Modern Card-Based Layout */}
      <Grid container spacing={3}>
        {filteredPairs.map((pair) => (
          <Grid item xs={12} key={pair.id}>
            <Card 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: '1px solid',
                borderColor: pair.primarySupplier && pair.alternativeSuppliers.length > 0 ? 'success.200' : 
                            !pair.primarySupplier ? 'warning.200' : 'info.200',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  boxShadow: 4,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {/* Header with Category and Status */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Chip 
                    icon={<BusinessIcon />}
                    label={`${pair.category.charAt(0).toUpperCase() + pair.category.slice(1)} (${pair.id})`}
                    color={pair.category === 'stratejik' ? 'error' : 
                           pair.category === 'kritik' ? 'warning' : 
                           pair.category === 'rutin' ? 'info' : 'default'}
                    variant="outlined" 
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip 
                    label={pair.primarySupplier && pair.alternativeSuppliers.length > 0 ? 'Tam Eşleştirme' :
                           !pair.primarySupplier ? 'Ana Tedarikçi Eksik' : 'Alternatif Eksik'}
                    color={pair.primarySupplier && pair.alternativeSuppliers.length > 0 ? 'success' : 'warning'}
                    size="small" 
                  />
                </Box>
                <Box display="flex" gap={1}>
                  <Tooltip title="Performans Analizi">
                    <IconButton 
                      color="primary" 
                      onClick={() => {
                        showSnackbar(`${pair.primarySupplier?.name || 'N/A'} vs ${pair.alternativeSuppliers[0]?.name || 'Alternatif'} performans karşılaştırması`, 'info');
                        setCurrentTab(6);
                      }}
                    >
                      <AssessmentIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Düzenle">
                    <IconButton color="info" onClick={() => handleEditItem(pair, 'pair')}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Tedarikçi Değiştir">
                    <IconButton color="warning" onClick={() => handleOpenSwitchDialog(pair)}>
                      <SwapHorizIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Main Content */}
              <Grid container spacing={3}>
                {/* Primary Supplier Section */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2.5, 
                      borderRadius: 2, 
                      background: pair.primarySupplier ? 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)' : 'linear-gradient(135deg, #fff3e0 0%, #ffeaa7 100%)',
                      border: '1px solid',
                      borderColor: pair.primarySupplier ? 'success.200' : 'warning.200',
                      height: '100%'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                      <Avatar sx={{ bgcolor: pair.primarySupplier ? 'success.main' : 'warning.main', width: 32, height: 32 }}>
                        <StarIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold" color={pair.primarySupplier ? 'success.dark' : 'warning.dark'}>
                        Ana Tedarikçi
                      </Typography>
                    </Box>
                    
                    {pair.primarySupplier ? (
                      <>
                        <Typography variant="h6" fontWeight="bold" mb={1.5}>
                      {pair.primarySupplier.name}
                    </Typography>
                        
                        {/* Performance Badge */}
                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                              width: 40,
                              height: 40,
                          borderRadius: '50%',
                              backgroundColor: getPerformanceGrade(pair.performanceComparison.primaryScore || 0, pair.primarySupplier).bgColor,
                          color: 'white',
                          fontWeight: 'bold',
                              fontSize: '1.1rem',
                              boxShadow: 2
                        }}
                      >
                            {getPerformanceGrade(pair.performanceComparison.primaryScore || 0, pair.primarySupplier).grade}
                      </Box>
                          <Box>
                            <Typography variant="h5" fontWeight="bold" color="success.main">
                              {pair.performanceComparison.primaryScore || 0}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Performans Skoru
                            </Typography>
                          </Box>
                        </Box>

                        {/* Subcategories */}
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold" mb={1} color="text.secondary">
                            Tedarik Kategorileri
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {pair.primarySupplier.supplySubcategories.length > 0 ? (
                              pair.primarySupplier.supplySubcategories.map((subcategory, index) => (
                      <Chip 
                                  key={index}
                                  label={subcategory} 
                        color="success" 
                                  variant="outlined"
                        size="small" 
                                  sx={{ fontSize: '0.7rem', height: '24px' }}
                                />
                              ))
                            ) : (
                              <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                Kategori belirtilmemiş
                              </Typography>
                            )}
                    </Box>
                  </Box>
                      </>
                    ) : (
                      <Box textAlign="center" py={3}>
                        <ErrorIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                        <Typography variant="body1" fontWeight="bold" color="warning.main" mb={1}>
                          Ana Tedarikçi Atanmamış
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Bu kategori için ana tedarikçi seçimi yapılmalı
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Alternative Suppliers Section */}
                <Grid item xs={12} md={5}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2.5, 
                      borderRadius: 2, 
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                      border: '1px solid',
                      borderColor: 'info.200',
                      height: '100%'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                      <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                        <LinkIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold" color="info.dark">
                        Alternatif Tedarikçiler ({pair.alternativeSuppliers.length})
                      </Typography>
                    </Box>
                    
                    {pair.alternativeSuppliers.length > 0 ? (
                      <Box sx={{ maxHeight: '280px', overflow: 'auto' }}>
                  {pair.alternativeSuppliers.map((altSupplier, index) => {
                    const altScore = pair.performanceComparison.alternativeScores.find(s => s.id === altSupplier.id)?.score || 0;
                    return (
                            <Card 
                              key={altSupplier.id} 
                              elevation={0}
                              sx={{ 
                                p: 2, 
                                mb: index < pair.alternativeSuppliers.length - 1 ? 1.5 : 0,
                                border: '1px solid',
                                borderColor: 'grey.200',
                                borderRadius: 2,
                                background: 'rgba(255,255,255,0.7)'
                              }}
                            >
                              <Box display="flex" justifyContent="between" alignItems="center" mb={1}>
                                <Typography variant="subtitle1" fontWeight="bold">
                        {altSupplier.name}
                      </Typography>
                              </Box>
                              
                              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                                    width: 32,
                                    height: 32,
                              borderRadius: '50%',
                                    backgroundColor: getPerformanceGrade(altScore, altSupplier).bgColor,
                              color: 'white',
                              fontWeight: 'bold',
                                    fontSize: '0.9rem'
                            }}
                          >
                                  {getPerformanceGrade(altScore, altSupplier).grade}
                          </Box>
                                <Box>
                                  <Typography variant="h6" fontWeight="bold" color="info.main">
                                    {altScore}%
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Performans
                                  </Typography>
                                </Box>
                              </Box>

                              <Box display="flex" flexWrap="wrap" gap={0.5}>
                                {altSupplier.supplySubcategories.length > 0 ? (
                                  altSupplier.supplySubcategories.slice(0, 3).map((subcategory, idx) => (
                        <Chip 
                                      key={idx}
                                      label={subcategory} 
                                      color="info"
                                      variant="outlined"
                          size="small" 
                                      sx={{ fontSize: '0.65rem', height: '20px' }}
                                    />
                                  ))
                                ) : (
                                  <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                    Kategori yok
                                  </Typography>
                                )}
                                {altSupplier.supplySubcategories.length > 3 && (
                                  <Chip 
                                    label={`+${altSupplier.supplySubcategories.length - 3}`}
                                    color="default"
                                    size="small"
                                    sx={{ fontSize: '0.65rem', height: '20px' }}
                                  />
                                )}
                      </Box>
                            </Card>
                    );
                  })}
                      </Box>
                    ) : (
                      <Box textAlign="center" py={3}>
                        <BusinessIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                        <Typography variant="body1" fontWeight="bold" color="text.secondary" mb={1}>
                          Alternatif Tedarikçi Yok
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Bu kategori için alternatif seçenekler eklenebilir
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Performance Comparison & Insights */}
                <Grid item xs={12} md={3}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2.5, 
                      borderRadius: 2, 
                      background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                      border: '1px solid',
                      borderColor: 'grey.300',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <AssessmentIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold" color="primary.dark">
                        Analiz & Öneri
                      </Typography>
                    </Box>
                    
                    {/* Performance Comparison */}
                    {pair.primarySupplier && pair.alternativeSuppliers.length > 0 ? (
                      <Box flex={1}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2, 
                            mb: 2,
                            background: (pair.performanceComparison.primaryScore || 0) > 
                      Math.max(...pair.performanceComparison.alternativeScores.map(s => s.score)) 
                              ? 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)' 
                              : 'linear-gradient(135deg, #fff8e1 0%, #fff3e0 100%)',
                            border: '1px solid',
                            borderColor: (pair.performanceComparison.primaryScore || 0) > 
                       Math.max(...pair.performanceComparison.alternativeScores.map(s => s.score)) 
                              ? 'success.200' : 'warning.200'
                          }}
                        >
                          <Typography 
                            variant="subtitle2" 
                            fontWeight="bold" 
                            color={(pair.performanceComparison.primaryScore || 0) > 
                              Math.max(...pair.performanceComparison.alternativeScores.map(s => s.score)) 
                              ? 'success.main' : 'warning.main'}
                            mb={1}
                          >
                            {(pair.performanceComparison.primaryScore || 0) > 
                             Math.max(...pair.performanceComparison.alternativeScores.map(s => s.score)) 
                              ? '✓ Ana Tedarikçi Üstün' : '⚠ Alternatif Değerlendir'}
                    </Typography>
                          <Typography variant="body2" color="text.secondary">
                      {pair.performanceComparison.recommendation}
                    </Typography>
                  </Box>

                        {/* Review Dates */}
                        <Box sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block">
                            Son Değerlendirme
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" mb={0.5}>
                    {new Date(pair.lastReviewDate).toLocaleDateString('tr-TR')}
                  </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                    Sonraki: {new Date(pair.nextReviewDate).toLocaleDateString('tr-TR')}
                  </Typography>
                        </Box>
                      </Box>
                    ) : pair.primarySupplier && pair.alternativeSuppliers.length === 0 ? (
                      <Box flex={1} textAlign="center">
                        <InfoIcon sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                        <Typography variant="subtitle2" fontWeight="bold" color="info.main" mb={1}>
                          Sadece Ana Tedarikçi
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          Risk azaltmak için alternatif tedarikçi eklenmeli
                        </Typography>
                        <Button
                        size="small" 
                          variant="outlined"
                          startIcon={<LinkIcon />}
                          onClick={() => handleEditItem(pair, 'pair')}
                        >
                          Alternatif Ekle
                        </Button>
                      </Box>
                    ) : !pair.primarySupplier && pair.alternativeSuppliers.length > 0 ? (
                      <Box flex={1} textAlign="center">
                        <WarningIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                        <Typography variant="subtitle2" fontWeight="bold" color="warning.main" mb={1}>
                          Ana Tedarikçi Eksik
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          Alternatifler arasından ana tedarikçi seçilmeli
                        </Typography>
                        <Button
                        size="small" 
                          variant="outlined"
                        color="warning" 
                          startIcon={<StarIcon />}
                          onClick={() => handleOpenSwitchDialog(pair)}
                        >
                          Ana Seç
                        </Button>
                      </Box>
                    ) : (
                      <Box flex={1} textAlign="center">
                        <ErrorIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
                        <Typography variant="subtitle2" fontWeight="bold" color="error.main" mb={1}>
                          Tedarikçi Eksik
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          Bu kategori için tedarikçi tanımlanmalı
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<BusinessIcon />}
                          onClick={() => handleEditItem(pair, 'pair')}
                        >
                          Tedarikçi Ekle
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredPairs.length === 0 && (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)'
          }}
        >
          <BusinessIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" fontWeight="bold" color="text.secondary" mb={1}>
            Eşleştirme Bulunamadı
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {pairingSearchTerm || pairingCategoryFilter !== 'all' || pairingStatusFilter !== 'all' 
              ? 'Arama kriterlerinize uygun eşleştirme bulunamadı. Filtreleri temizleyip tekrar deneyin.'
              : 'Henüz tedarikçi eşleştirmesi tanımlanmamış. İlk eşleştirmenizi oluşturun.'
            }
          </Typography>
          <Button
            variant="contained"
            startIcon={<LinkIcon />}
            onClick={handleCreatePair}
            size="large"
          >
            {supplierPairs.length === 0 ? 'İlk Eşleştirmeyi Oluştur' : 'Yeni Eşleştirme Ekle'}
          </Button>
        </Paper>
      )}
    </Box>
    );
  };

  // Supplier List Component with advanced filtering, sorting, and pagination
  const renderSupplierList = () => {
    // Advanced filtering
    const filteredSuppliers = suppliers.filter(supplier => {
      const matchesSearch = searchTerm === '' || 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.supplySubcategories.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase())) ||
        supplier.materialTypes.some(mat => mat.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = supplierTypeFilter === 'all' || supplier.type === supplierTypeFilter;
      const matchesCategory = supplierCategoryFilter === 'all' || supplier.category === supplierCategoryFilter;
      const matchesStatus = supplierStatusFilter === 'all' || supplier.status === supplierStatusFilter;
      const matchesRisk = supplierRiskFilter === 'all' || supplier.riskLevel === supplierRiskFilter;
      
      return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesRisk;
    });

    // Sorting
    const sortedSuppliers = filteredSuppliers.sort((a, b) => {
      if (!sortColumn) return 0;
      
      let aValue = '';
      let bValue = '';
      
      switch (sortColumn) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'performance':
          return sortDirection === 'asc' ? a.performanceScore - b.performanceScore : b.performanceScore - a.performanceScore;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'lastAudit':
          return sortDirection === 'asc' ? 
            new Date(a.lastAuditDate).getTime() - new Date(b.lastAuditDate).getTime() :
            new Date(b.lastAuditDate).getTime() - new Date(a.lastAuditDate).getTime();
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
                          } else {
        return bValue.localeCompare(aValue);
      }
    });

    // Pagination
    const paginatedSuppliers = sortedSuppliers.slice(
      currentPage * rowsPerPage,
      currentPage * rowsPerPage + rowsPerPage
    );

    // Handle column sorting
    const handleSort = (column: string) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
    };

    // Handle bulk actions
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        setSelectedSuppliers(filteredSuppliers.map(s => s.id));
      } else {
        setSelectedSuppliers([]);
      }
    };

    const handleSelectSupplier = (supplierId: string) => {
      setSelectedSuppliers(prev => 
        prev.includes(supplierId) 
          ? prev.filter(id => id !== supplierId)
          : [...prev, supplierId]
      );
    };

    // Export functions
    const exportToPDF = () => {
      showSnackbar('PDF export özelliği geliştirilmektedir...', 'info');
    };

    const exportToExcel = () => {
      showSnackbar('Excel export özelliği geliştirilmektedir...', 'info');
    };

    return (
    <Box>
        {/* Enhanced Filter Panel */}
        <Card elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Grid container spacing={2} alignItems="center" mb={2}>
            <Grid item xs={12} md={3}>
              <UltraIsolatedSearchInput
                initialValue={searchTerm}
                onDebouncedChange={handleDebouncedSearchChange}
                placeholder="Tedarikçi ara (ad, kişi, kategori)..."
                size="small"
                fullWidth
                clearTrigger={clearTrigger}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ bgcolor: 'white', px: 1 }}>Tür</InputLabel>
                <Select 
                  value={supplierTypeFilter}
                  onChange={(e) => setSupplierTypeFilter(e.target.value)}
                  sx={{ bgcolor: 'white' }}
                >
              <MenuItem value="all">Tümü</MenuItem>
              <MenuItem value="onaylı">Onaylı</MenuItem>
              <MenuItem value="alternatif">Alternatif</MenuItem>
              <MenuItem value="potansiyel">Potansiyel</MenuItem>
                  <MenuItem value="bloklu">Bloklu</MenuItem>
            </Select>
          </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ bgcolor: 'white', px: 1 }}>Kategori</InputLabel>
                <Select 
                  value={supplierCategoryFilter}
                  onChange={(e) => setSupplierCategoryFilter(e.target.value)}
                  sx={{ bgcolor: 'white' }}
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  <MenuItem value="stratejik">Stratejik</MenuItem>
                  <MenuItem value="kritik">Kritik</MenuItem>
                  <MenuItem value="rutin">Rutin</MenuItem>
                  <MenuItem value="genel">Genel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ bgcolor: 'white', px: 1 }}>Durum</InputLabel>
                <Select 
                  value={supplierStatusFilter}
                  onChange={(e) => setSupplierStatusFilter(e.target.value)}
                  sx={{ bgcolor: 'white' }}
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  <MenuItem value="aktif">Aktif</MenuItem>
                  <MenuItem value="pasif">Pasif</MenuItem>
                  <MenuItem value="denetimde">Denetimde</MenuItem>
                  <MenuItem value="bloklu">Bloklu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ bgcolor: 'white', px: 1 }}>Risk</InputLabel>
                <Select 
                  value={supplierRiskFilter}
                  onChange={(e) => setSupplierRiskFilter(e.target.value)}
                  sx={{ bgcolor: 'white' }}
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  <MenuItem value="düşük">Düşük</MenuItem>
                  <MenuItem value="orta">Orta</MenuItem>
                  <MenuItem value="yüksek">Yüksek</MenuItem>
                  <MenuItem value="kritik">Kritik</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <ButtonGroup variant="outlined" size="small" fullWidth>
                <Tooltip title="PDF Export">
                  <IconButton onClick={exportToPDF} color="primary">
                    <FileDownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excel Export">
                  <IconButton onClick={exportToExcel} color="success">
                    <FileDownloadIcon />
                  </IconButton>
                </Tooltip>
              </ButtonGroup>
            </Grid>
          </Grid>

          {/* Bulk Actions */}
          {selectedSuppliers.length > 0 && (
            <Box display="flex" alignItems="center" gap={2} p={1} bgcolor="primary.50" borderRadius={1}>
              <Typography variant="body2" fontWeight="bold">
                {selectedSuppliers.length} tedarikçi seçili
              </Typography>
              <Button size="small" variant="outlined" color="warning">
                Toplu Denetim Planla
              </Button>
              <Button size="small" variant="outlined" color="info">
                Toplu Mail Gönder
              </Button>
              <Button size="small" variant="outlined" color="error">
                Toplu Değerlendirme
              </Button>
            </Box>
          )}
        </Card>

        {/* Results Summary */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2" color="text.secondary">
            {filteredSuppliers.length} tedarikçi bulundu (toplam {suppliers.length})
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel>Sayfa</InputLabel>
              <Select 
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(0);
                }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 1400 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.50' }}>
              <TableCell padding="checkbox" sx={{ width: '50px' }}>
                <Checkbox
                  color="primary"
                  indeterminate={selectedSuppliers.length > 0 && selectedSuppliers.length < filteredSuppliers.length}
                  checked={filteredSuppliers.length > 0 && selectedSuppliers.length === filteredSuppliers.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  width: '200px',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => handleSort('name')}
              >
                <Box display="flex" alignItems="center">
                  Tedarikçi
                  {sortColumn === 'name' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  width: '120px',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => handleSort('type')}
              >
                <Box display="flex" alignItems="center" justifyContent="center">
                  Tür
                  {sortColumn === 'type' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  width: '100px',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => handleSort('category')}
              >
                <Box display="flex" alignItems="center" justifyContent="center">
                  Kategori
                  {sortColumn === 'category' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  width: '220px',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle'
                }}
              >
                Alt Kategoriler
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  width: '150px',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => handleSort('performance')}
              >
                <Box display="flex" alignItems="center" justifyContent="center">
                  Performans
                  {sortColumn === 'performance' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  width: '130px',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => handleSort('lastAudit')}
              >
                <Box display="flex" alignItems="center" justifyContent="center">
                  Son Denetim
                  {sortColumn === 'lastAudit' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  width: '100px',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => handleSort('status')}
              >
                <Box display="flex" alignItems="center" justifyContent="center">
                  Durum
                  {sortColumn === 'status' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  width: '120px',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'middle',
                  textAlign: 'center'
                }}
              >
                İşlemler
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSuppliers.map((supplier) => (
              <TableRow 
                key={supplier.id}
                hover
                selected={selectedSuppliers.includes(supplier.id)}
                sx={{ 
                  '&.Mui-selected': { 
                    bgcolor: 'action.selected',
                    '&:hover': { bgcolor: 'action.hover' }
                  }
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    checked={selectedSuppliers.includes(supplier.id)}
                    onChange={() => handleSelectSupplier(supplier.id)}
                  />
                </TableCell>
                <TableCell sx={{ width: '200px', verticalAlign: 'top' }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold" noWrap>
                      {supplier.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {supplier.contact.contactPerson}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '130px', textAlign: 'center', verticalAlign: 'middle' }}>
                  <Chip 
                    label={supplier.type.charAt(0).toUpperCase() + supplier.type.slice(1)} 
                    color={supplier.type === 'onaylı' ? 'success' : 'warning'}
                    size="small"
                    sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  />
                </TableCell>
                <TableCell sx={{ width: '110px', textAlign: 'center', verticalAlign: 'middle' }}>
                  <Chip 
                    label={supplier.category.charAt(0).toUpperCase() + supplier.category.slice(1)} 
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  />
                </TableCell>
                <TableCell sx={{ width: '250px', verticalAlign: 'top' }}>
                  <Box sx={{ maxHeight: '80px', overflow: 'auto' }}>
                    {supplier.supplySubcategories.length > 0 ? (
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {supplier.supplySubcategories.map((subcategory, index) => (
                          <Chip 
                            key={index}
                            label={subcategory} 
                            color="secondary"
                            variant="outlined"
                            size="small"
                            sx={{ fontSize: '0.65rem', height: '20px' }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Belirtilmemiş
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '180px', textAlign: 'center', verticalAlign: 'middle' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                    {/* Grade Badge */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: getPerformanceGrade(supplier.performanceScore, supplier).bgColor,
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        boxShadow: 1,
                        minWidth: 36,
                        flexShrink: 0
                      }}
                    >
                      {getPerformanceGrade(supplier.performanceScore, supplier).grade}
                    </Box>
                    
                    {/* Performans Detayları */}
                    <Box>
                      <Typography variant="body2" fontWeight="bold" textAlign="center">
                          {supplier.performanceScore}%
                        </Typography>
                      {getPerformanceGrade(supplier.performanceScore, supplier).description && (
                        <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                          {getPerformanceGrade(supplier.performanceScore, supplier).description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '140px', textAlign: 'center', verticalAlign: 'middle' }}>
                  <Typography variant="body2" textAlign="center" fontSize="0.8rem">
                    {new Date(supplier.lastAuditDate).toLocaleDateString('tr-TR')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" textAlign="center" display="block" fontSize="0.7rem">
                    Sonraki: {new Date(supplier.nextAuditDate).toLocaleDateString('tr-TR')}
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: '110px', textAlign: 'center', verticalAlign: 'middle' }}>
                  <Chip 
                    label={supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                    color={supplier.status === 'aktif' ? 'success' : 'error'}
                    size="small"
                    sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  />
                </TableCell>
                <TableCell sx={{ width: '130px', textAlign: 'center', verticalAlign: 'middle' }}>
                  <Box display="flex" gap={0.5} justifyContent="center">
                    <Tooltip title="Görüntüle">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => {
                          setSelectedItem(supplier);
                          setDialogType('supplier');
                          setFormData(supplier);
                          setDialogOpen(true);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzenle">
                      <IconButton size="small" color="info" onClick={() => handleEditItem(supplier, 'supplier')}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteItem(supplier.id, 'supplier')}
                        sx={{ 
                          '&:hover': { 
                            bgcolor: 'error.50' 
                          } 
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="DÖF Oluştur">
                      <IconButton size="small" color="warning" onClick={() => createDOFFromNonconformity({ 
                        id: 'temp', 
                        supplierId: supplier.id, 
                        title: `${supplier.name} için uygunsuzluk`,
                        description: 'Tedarikçi kaynaklı uygunsuzluk',
                        category: 'kalite',
                        severity: 'orta',
                        detectedDate: new Date().toISOString().split('T')[0],
                                                  status: 'açık',
                          dueDate: '',
                          recurrence: false,
                          partCode: 'TEMP-001' // Zorunlu alan eklendi
                      })}>
                        <ReportIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredSuppliers.length}
        page={currentPage}
        onPageChange={(_, newPage) => setCurrentPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setCurrentPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Sayfa başına:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
        sx={{ borderTop: '1px solid', borderColor: 'divider' }}
      />
    </Box>
  );
  };

  // Audit Tracking Component
  const renderAuditTracking = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" gap={2}>
          <Button 
            variant="outlined" 
            startIcon={<AssessmentIcon />} 
            onClick={generateAutoAuditRecommendations}
            color="info"
          >
            Otomatik Analiz
          </Button>
          <Button variant="contained" startIcon={<ScheduleIcon />} onClick={handleCreateAudit}>
            Denetim Planla
          </Button>
        </Box>
      </Box>

      {/* Otomatik Denetim Önerileri */}
      {autoAuditRecommendations.length > 0 && (
        <Paper elevation={1} sx={{ p: 2.5, mb: 3, border: '1px solid', borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <AssessmentIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={600}>
              Otomatik Denetim Önerileri
            </Typography>
            <Chip 
              size="small" 
              label={autoAuditRecommendations.length} 
              color="primary" 
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Box>
          
          <Grid container spacing={2}>
            {autoAuditRecommendations.slice(0, 3).map(recommendation => (
              <Grid item xs={12} sm={6} md={4} key={recommendation.id}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'grey.200',
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      boxShadow: 2,
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <Chip 
                      size="small" 
                      label={
                        recommendation.urgencyLevel === 'kritik' ? 'Kritik' :
                        recommendation.urgencyLevel === 'yüksek' ? 'Yüksek' :
                        recommendation.urgencyLevel === 'orta' ? 'Orta' : 'Düşük'
                      } 
                      color={
                        recommendation.urgencyLevel === 'kritik' ? 'error' :
                        recommendation.urgencyLevel === 'yüksek' ? 'warning' :
                        recommendation.urgencyLevel === 'orta' ? 'info' : 'default'
                      }
                      sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                  </Box>
                  
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontSize: '0.95rem', 
                      fontWeight: 600, 
                      mb: 1.5,
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {recommendation.supplierName}
                  </Typography>
                  
                  <Box display="flex" justifyContent="center" mb={1}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      Performans: {recommendation.currentScore}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mb: 2 }}>
                    Tarih: {new Date(recommendation.recommendedDate).toLocaleDateString('tr-TR', { 
                      day: '2-digit', 
                      month: 'short',
                      year: '2-digit'
                    })}
                  </Typography>
                  
                  <Box display="flex" gap={1}>
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="primary"
                      onClick={() => acceptAuditRecommendation(recommendation)}
                      sx={{ 
                        fontSize: '0.75rem', 
                        py: 0.5, 
                        px: 1.5, 
                        flex: 1,
                        textTransform: 'none'
                      }}
                    >
                      Kabul Et
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="error"
                      onClick={() => rejectAuditRecommendation(recommendation.id)}
                      sx={{ 
                        fontSize: '0.75rem', 
                        py: 0.5, 
                        px: 1.5,
                        textTransform: 'none'
                      }}
                    >
                      Reddet
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
          
          {autoAuditRecommendations.length > 3 && (
            <Box mt={2} textAlign="center">
              <Typography variant="body2" color="primary.main" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                +{autoAuditRecommendations.length - 3} öneri daha (aşağıdaki detaylı tabloda görüntülenebilir)
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* Yaklaşan Denetimler - DÜZELTME: audits array'inden veriler çekiliyor */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Yaklaşan Denetimler" />
            <CardContent>
              <List>
                {audits
                  .filter(a => {
                    const auditDate = new Date(a.auditDate);
                    const today = new Date();
                    const daysDiff = Math.ceil((auditDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                    return a.status === 'planlı' && daysDiff <= 90;
                  })
                  .sort((a, b) => new Date(a.auditDate).getTime() - new Date(b.auditDate).getTime())
                  .map(audit => {
                    const auditDate = new Date(audit.auditDate);
                    const today = new Date();
                    const daysDiff = Math.ceil((auditDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                    const supplier = suppliers.find(s => s.id === audit.supplierId);
                    
                    return (
                      <ListItem key={audit.id} divider>
                        <ListItemIcon>
                          <ScheduleIcon color={daysDiff <= 30 ? 'error' : 'warning'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={supplier ? supplier.name : 'Bilinmiyor'}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                Denetim Tarihi: {auditDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Denetçi: {audit.auditorName || 'Atanmadı'}
                              </Typography>
                              <Chip 
                                size="small" 
                                label={daysDiff <= 0 ? 'Gecikmiş' : `${daysDiff} gün kaldı`}
                                color={daysDiff <= 0 ? 'error' : daysDiff <= 30 ? 'warning' : 'info'}
                              />
                            </Box>
                          }
                        />
                        <Box display="flex" gap={1}>
                          <Button 
                            size="small" 
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                              if (supplier) {
                                scheduleAutoAudit(supplier);
                                showSnackbar(`${supplier.name} denetimi başlatıldı`, 'success');
                              }
                            }}
                          >
                            Denetle
                          </Button>
                          <IconButton 
                            size="small" 
                            color="info"
                            onClick={() => handleEditItem(audit, 'audit')}
                            sx={{ border: '1px solid', borderColor: 'info.main' }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </ListItem>
                    );
                  })}
                {audits.filter(a => {
                  const auditDate = new Date(a.auditDate);
                  const today = new Date();
                  const daysDiff = Math.ceil((auditDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                  return a.status === 'planlı' && daysDiff <= 90;
                }).length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box textAlign="center" py={2}>
                          <Typography variant="body2" color="text.secondary">
                            Yaklaşan 90 gün içinde planlanan denetim bulunmuyor
                          </Typography>
                          <Button 
                            size="small" 
                            startIcon={<ScheduleIcon />} 
                            onClick={handleCreateAudit}
                            sx={{ mt: 1 }}
                          >
                            Denetim Planla
                          </Button>
                        </Box>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Audit Statistics - DÜZELTME: audits array'inden veriler çekiliyor */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Denetim İstatistikleri" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2} bgcolor="success.50" borderRadius={1}>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {audits.filter(a => a.status === 'tamamlandı').length}
                    </Typography>
                    <Typography variant="body2">Tamamlanan</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2} bgcolor="warning.50" borderRadius={1}>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {audits.filter(a => a.status === 'planlı').length}
                    </Typography>
                    <Typography variant="body2">Planlanan</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2} bgcolor="error.50" borderRadius={1}>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {audits.filter(a => {
                        const auditDate = new Date(a.auditDate);
                        const today = new Date();
                        return a.status === 'planlı' && auditDate < today;
                      }).length}
                    </Typography>
                    <Typography variant="body2">Gecikmiş</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" p={2} bgcolor="info.50" borderRadius={1}>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {audits.length}
                    </Typography>
                    <Typography variant="body2">Toplam</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

                {/* Planlanan Denetimler Tablosu - Gelişmiş Görünüm */}
        <Grid item xs={12}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardHeader 
              title={
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Planlanan Denetimler
                </Typography>
              }
              action={
                <Box display="flex" gap={1}>
                <Chip 
                  size="small" 
                    label={`${audits.length} toplam`} 
                  color="info"
                    sx={{ fontWeight: 500 }}
                  />
                  <Chip 
                    size="small" 
                    label={`${audits.filter(a => a.status === 'gecikmiş' || a.isDelayed).length} gecikmiş`} 
                    color="error"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              }
              sx={{ 
                borderBottom: '1px solid', 
                borderColor: 'divider',
                bgcolor: 'background.paper'
              }}
            />
            <CardContent sx={{ p: 0 }}>
              <TableContainer 
                sx={{ 
                  maxHeight: 600,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                    height: '8px'
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#c1c1c1',
                    borderRadius: '4px',
                    '&:hover': {
                      background: '#a8a8a8'
                    }
                  },
                  overflowX: 'auto'
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ 
                      '& > .MuiTableCell-root': { 
                        bgcolor: 'primary.50', 
                        fontWeight: 700, 
                        fontSize: '0.8rem', 
                        py: 1.5,
                        borderBottom: '2px solid',
                        borderColor: 'primary.200',
                        color: 'primary.dark',
                        whiteSpace: 'nowrap'
                      } 
                    }}>
                      <TableCell sx={{ minWidth: 180, maxWidth: 200 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Tedarikçi
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ minWidth: 110 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Planlanan Tarih
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ minWidth: 120 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Gerçekleştirilen Tarih
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ minWidth: 120 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Durum
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ minWidth: 100 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Puan
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ minWidth: 90 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Tür
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 160, maxWidth: 180 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Denetçi
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 200, maxWidth: 250 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Gecikme Açıklaması
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ minWidth: 120 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          İşlemler
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {audits
                      .sort((a, b) => {
                        // İlk öncelik: planlama tarihine göre sırala (en erken tarih en üstte)
                        return new Date(a.auditDate).getTime() - new Date(b.auditDate).getTime();
                      })
                      .map((audit, index) => {
                        const supplier = suppliers.find(s => s.id === audit.supplierId);
                        const plannedDate = new Date(audit.auditDate);
                        const actualDate = audit.actualAuditDate ? new Date(audit.actualAuditDate) : null;
                        const today = new Date();
                        const daysDiff = Math.ceil((plannedDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                        
                        // Durum rengi ve metni
                        const getStatusInfo = (status: string, isDelayed?: boolean): { 
                          color: 'error' | 'default' | 'success' | 'warning' | 'info' | 'primary' | 'secondary', 
                          text: string 
                        } => {
                          switch(status) {
                            case 'tamamlandı':
                              return { 
                                color: isDelayed ? 'warning' : 'success', 
                                text: isDelayed ? 'Gecikmeli Tamamlandı' : 'Tamamlandı' 
                              };
                            case 'devam_ediyor':
                              return { color: 'info', text: 'Devam Ediyor' };
                            case 'gecikmiş':
                              return { color: 'error', text: 'Gecikmiş' };
                            case 'iptal':
                              return { color: 'default', text: 'İptal' };
                            default:
                              return daysDiff <= 0 ? 
                                { color: 'error', text: 'Gecikmiş' } : 
                                { color: 'primary', text: 'Planlı' };
                          }
                        };
                        
                        const statusInfo = getStatusInfo(audit.status, audit.isDelayed);
                        
                        return (
                          <TableRow 
                            key={audit.id} 
                            hover 
                            sx={{ 
                              '& > .MuiTableCell-root': { 
                                py: 1.5, 
                                px: 2,
                                borderBottom: '1px solid',
                                borderColor: 'grey.200'
                              },
                              backgroundColor: audit.status === 'gecikmiş' || (audit.status === 'planlı' && daysDiff <= 0) ? 
                                'error.50' : 
                                audit.isDelayed ? 'warning.50' : 
                                index % 2 === 0 ? 'grey.25' : 'transparent',
                              '&:hover': {
                                backgroundColor: audit.status === 'gecikmiş' || (audit.status === 'planlı' && daysDiff <= 0) ? 
                                  'error.100' : 
                                  audit.isDelayed ? 'warning.100' : 'action.hover',
                                transform: 'scale(1.001)',
                                transition: 'all 0.2s ease-in-out'
                              }
                            }}
                          >
                            <TableCell sx={{ minWidth: 180, maxWidth: 200 }}>
                              <Box>
                                <Typography 
                                  variant="body2" 
                                  fontWeight={600} 
                                  sx={{ 
                                    fontSize: '0.875rem',
                                    color: 'text.primary',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    lineHeight: 1.4
                                  }}
                                  title={supplier ? supplier.name : 'Tedarikçi Bulunamadı'}
                                >
                                  {supplier ? supplier.name : 'Tedarikçi Bulunamadı'}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary" 
                                  sx={{ 
                                    fontSize: '0.75rem',
                                    fontFamily: 'monospace',
                                    backgroundColor: 'grey.100',
                                    px: 0.5,
                                    py: 0.25,
                                    borderRadius: 0.5,
                                    display: 'inline-block',
                                    mt: 0.5
                                  }}
                                >
                                  {supplier ? supplier.name : audit.supplierId}
                                </Typography>
                              </Box>
                            </TableCell>
                            
                            <TableCell align="center" sx={{ minWidth: 110 }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: '0.8rem', 
                                  fontWeight: 500,
                                  fontFamily: 'monospace'
                                }}
                              >
                                {plannedDate.toLocaleDateString('tr-TR', { 
                                  day: '2-digit', 
                                  month: '2-digit', 
                                  year: '2-digit' 
                                })}
                                </Typography>
                            </TableCell>
                            
                            <TableCell align="center" sx={{ minWidth: 120 }}>
                              {actualDate ? (
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontSize: '0.8rem', 
                                    fontWeight: 500,
                                    color: 'success.main',
                                    fontFamily: 'monospace'
                                  }}
                                >
                                  {actualDate.toLocaleDateString('tr-TR', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: '2-digit' 
                                  })}
                                </Typography>
                              ) : (
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ 
                                    fontSize: '0.8rem',
                                    fontStyle: 'italic'
                                  }}
                                >
                                  Henüz gerçekleşmedi
                                </Typography>
                              )}
                            </TableCell>
                            
                            <TableCell align="center" sx={{ minWidth: 120 }}>
                                <Chip 
                                  size="small" 
                                label={statusInfo.text}
                                color={statusInfo.color}
                                sx={{ 
                                  height: 26, 
                                  fontSize: '0.75rem', 
                                  fontWeight: 600,
                                  minWidth: 100,
                                  '& .MuiChip-label': {
                                    px: 1.5
                                  }
                                }}
                                />
                            </TableCell>
                            
                            <TableCell align="center" sx={{ minWidth: 100 }}>
                              {audit.status === 'tamamlandı' ? (
                                <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontSize: '0.9rem', 
                                      fontWeight: 700,
                                      color: audit.score >= 90 ? 'success.main' :
                                             audit.score >= 75 ? 'info.main' :
                                             audit.score >= 60 ? 'warning.main' : 'error.main'
                                    }}
                                  >
                                    {audit.score}/100
                                  </Typography>
                                  <Chip 
                                    size="small" 
                                    label={
                                      audit.score >= 90 ? 'A' :
                                      audit.score >= 75 ? 'B' :
                                      audit.score >= 60 ? 'C' : 'D'
                                    }
                                    color={
                                      audit.score >= 90 ? 'success' :
                                      audit.score >= 75 ? 'info' :
                                      audit.score >= 60 ? 'warning' : 'error'
                                    }
                                    sx={{ 
                                      height: 20, 
                                      fontSize: '0.7rem', 
                                      fontWeight: 600,
                                      minWidth: 28
                                    }}
                                  />
                                </Box>
                              ) : (
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ 
                                    fontSize: '0.8rem',
                                    fontStyle: 'italic'
                                  }}
                                >
                                  -
                                </Typography>
                              )}
                            </TableCell>
                            
                            <TableCell align="center" sx={{ minWidth: 90 }}>
                              <Chip 
                                size="small" 
                                label={
                                  audit.auditType === 'planlı' ? 'Planlı' :
                                  audit.auditType === 'ani' ? 'Ani' :
                                  audit.auditType === 'takip' ? 'Takip' : 
                                  audit.auditType === 'acil' ? 'Acil' : 'Kapsamlı'
                                }
                                variant="outlined"
                                color={
                                  audit.auditType === 'acil' ? 'error' :
                                  audit.auditType === 'ani' ? 'warning' :
                                  audit.auditType === 'takip' ? 'info' : 'default'
                                }
                                sx={{ 
                                  height: 24, 
                                  fontSize: '0.7rem', 
                                  fontWeight: 500,
                                  minWidth: 70
                                }}
                              />
                            </TableCell>
                            
                            <TableCell sx={{ minWidth: 160, maxWidth: 180 }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: '0.8rem',
                                  fontWeight: 500,
                                  color: 'text.primary',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                                title={audit.auditorName || 'Henüz atanmadı'}
                              >
                                {audit.auditorName || 'Henüz atanmadı'}
                              </Typography>
                            </TableCell>
                            
                            <TableCell sx={{ minWidth: 200, maxWidth: 250 }}>
                              {audit.delayReason ? (
                                <Tooltip 
                                  title={audit.delayReason} 
                                  arrow 
                                  placement="top"
                                  sx={{
                                    '& .MuiTooltip-tooltip': {
                                      maxWidth: 300,
                                  fontSize: '0.8rem'
                                    }
                                  }}
                                >
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <WarningIcon 
                                      sx={{ 
                                        fontSize: 16, 
                                        color: audit.status === 'gecikmiş' ? 'error.main' : 'warning.main',
                                        flexShrink: 0
                                      }} 
                                    />
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        fontSize: '0.75rem',
                                        color: 'text.secondary',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                        lineHeight: 1.4
                                      }}
                              >
                                      {audit.delayReason}
                              </Typography>
                                  </Box>
                                </Tooltip>
                              ) : (
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ 
                                    fontSize: '0.8rem',
                                    fontStyle: 'italic',
                                    textAlign: 'center'
                                  }}
                                >
                                  Gecikme yok
                                </Typography>
                              )}
                            </TableCell>
                            
                            <TableCell align="center" sx={{ minWidth: 120 }}>
                              <Box display="flex" justifyContent="center" gap={0.5}>
                                {audit.status === 'planlı' && (
                                  <Tooltip title="Denetimi Gerçekleştir" arrow>
                                    <IconButton 
                                      size="small" 
                                      color="success"
                                      onClick={() => handleExecuteAudit(audit)}
                                      sx={{ 
                                        width: 28, 
                                        height: 28,
                                        border: '1px solid',
                                        borderColor: 'success.main',
                                        '&:hover': {
                                          backgroundColor: 'success.50'
                                        }
                                      }}
                                    >
                                      <AssignmentTurnedInIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Detayları Görüntüle" arrow>
                                  <IconButton 
                                    size="small" 
                                    color="info"
                                    onClick={() => handleViewAuditDetails(audit)}
                                    sx={{ 
                                      width: 28, 
                                      height: 28,
                                      border: '1px solid',
                                      borderColor: 'info.main',
                                      '&:hover': {
                                        backgroundColor: 'info.50'
                                      }
                                    }}
                                  >
                                    <VisibilityIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Düzenle" arrow>
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleEditItem(audit, 'audit')}
                                    sx={{ 
                                      width: 28, 
                                      height: 28,
                                      border: '1px solid',
                                      borderColor: 'primary.main',
                                      '&:hover': {
                                        backgroundColor: 'primary.50'
                                      }
                                    }}
                                  >
                                    <EditIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Sil" arrow>
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleDeleteItem(audit.id, 'audit')}
                                    sx={{ 
                                      width: 28, 
                                      height: 28,
                                      border: '1px solid',
                                      borderColor: 'error.main',
                                      '&:hover': {
                                        backgroundColor: 'error.50'
                                      }
                                    }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                              {/* Dosya Ekleme ve Silme Butonları */}
                              <Box display="flex" justifyContent="center" gap={0.5} mt={1}>
                                <input
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  style={{ display: 'none' }}
                                  id={`audit-file-upload-${audit.id}`}
                                  type="file"
                                  onChange={(e) => handleAuditFileUpload(e, audit.id)}
                                />
                                <label htmlFor={`audit-file-upload-${audit.id}`}>
                                  <Tooltip title="Dosya Ekle" arrow>
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      component="span"
                                      sx={{ 
                                        width: 28, 
                                        height: 28,
                                        border: '1px solid',
                                        borderColor: 'primary.main',
                                        '&:hover': {
                                          backgroundColor: 'primary.50'
                                        }
                                      }}
                                    >
                                      <UploadIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Tooltip>
                                </label>
                                                                {audit.attachments && audit.attachments.length > 0 && (
                                   <Tooltip title={`${audit.attachments.length} dosya var`} arrow>
                                     <IconButton 
                                       size="small" 
                                       color="info"
                                       onClick={() => {
                                         setSelectedAuditForAttachments(audit);
                                         setAuditAttachmentsDialogOpen(true);
                                       }}
                                       sx={{ 
                                         width: 28, 
                                         height: 28,
                                         border: '1px solid',
                                         borderColor: 'info.main',
                                         '&:hover': {
                                           backgroundColor: 'info.50'
                                         }
                                       }}
                                     >
                                       <AttachFileIcon sx={{ fontSize: 14 }} />
                                     </IconButton>
                                   </Tooltip>
                                 )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {audits.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                            <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                              Henüz denetim kaydı bulunmuyor
                            </Typography>
                          <Typography variant="body2" color="text.secondary">
                              İlk denetimi planlamak için aşağıdaki butona tıklayın
                          </Typography>
                          <Button 
                              variant="contained"
                            startIcon={<ScheduleIcon />} 
                            onClick={handleCreateAudit}
                              sx={{ 
                                mt: 1,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600
                              }}
                          >
                            İlk Denetimi Planla
                          </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Detaylı Denetim Önerileri Tablosu */}
        {autoAuditRecommendations.length > 0 && (
          <Grid item xs={12}>
            <Card elevation={1} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={1}>
                    <AssessmentIcon color="primary" fontSize="small" />
                    <Typography variant="h6" fontWeight={600}>
                      Detaylı Denetim Önerileri
                    </Typography>
                    <Chip 
                      size="small" 
                      label={`${autoAuditRecommendations.length} öneri`} 
                      color="primary" 
                      sx={{ height: 22, fontSize: '0.75rem' }}
                    />
                  </Box>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => setAutoAuditRecommendations([])}
                    sx={{ textTransform: 'none' }}
                  >
                    Tümünü Temizle
                  </Button>
                </Box>
              </Box>
              
              <TableContainer sx={{ maxHeight: 450 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ '& > .MuiTableCell-root': { bgcolor: 'grey.50', fontWeight: 600 } }}>
                      <TableCell sx={{ minWidth: 180, fontSize: '0.85rem' }}>Tedarikçi</TableCell>
                      <TableCell align="center" sx={{ width: 90, fontSize: '0.85rem' }}>Aciliyet</TableCell>
                      <TableCell align="center" sx={{ width: 80, fontSize: '0.85rem' }}>Puan</TableCell>
                      <TableCell align="center" sx={{ width: 100, fontSize: '0.85rem' }}>Tarih</TableCell>
                      <TableCell align="center" sx={{ width: 110, fontSize: '0.85rem' }}>Sorun</TableCell>
                      <TableCell align="center" sx={{ width: 120, fontSize: '0.85rem' }}>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {autoAuditRecommendations.map(recommendation => (
                      <TableRow 
                        key={recommendation.id} 
                        hover 
                        sx={{ 
                          '&:hover': { bgcolor: 'action.hover' },
                          '&:nth-of-type(even)': { bgcolor: 'grey.25' }
                        }}
                      >
                        <TableCell sx={{ py: 1.5 }}>
                          <Box>
                            <Typography 
                              variant="body2" 
                              fontWeight={500} 
                              sx={{ 
                                fontSize: '0.85rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {recommendation.supplierName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              ID: {recommendation.supplierId}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Chip 
                            size="small" 
                            label={
                              recommendation.urgencyLevel === 'kritik' ? 'Kritik' :
                              recommendation.urgencyLevel === 'yüksek' ? 'Yüksek' :
                              recommendation.urgencyLevel === 'orta' ? 'Orta' : 'Düşük'
                            } 
                            color={
                              recommendation.urgencyLevel === 'kritik' ? 'error' :
                              recommendation.urgencyLevel === 'yüksek' ? 'warning' :
                              recommendation.urgencyLevel === 'orta' ? 'info' : 'default'
                            }
                            sx={{ 
                              height: 24, 
                              fontSize: '0.7rem', 
                              fontWeight: 500,
                              minWidth: 65
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Box textAlign="center">
                            <Typography 
                              variant="body2" 
                              fontWeight={600} 
                              sx={{ 
                                fontSize: '0.85rem',
                                color: recommendation.currentScore < 70 ? 'error.main' : 
                                      recommendation.currentScore < 80 ? 'warning.main' : 'success.main'
                              }}
                            >
                              {recommendation.currentScore}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                              /{recommendation.previousScore}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {new Date(recommendation.recommendedDate).toLocaleDateString('tr-TR', { 
                              day: '2-digit', 
                              month: '2-digit' 
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Tooltip 
                            title={`Performans sorunları: ${recommendation.performanceIssues.join(', ')} • Risk faktörleri: ${recommendation.riskFactors.join(', ')}`}
                            placement="top"
                            arrow
                          >
                            <Box textAlign="center" sx={{ cursor: 'help' }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: '0.8rem', 
                                  fontWeight: 600,
                                  color: recommendation.performanceIssues.length > 2 ? 'error.main' : 'warning.main'
                                }}
                              >
                                {recommendation.performanceIssues.length}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                sorun
                              </Typography>
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Box display="flex" justifyContent="center" gap={1}>
                            <Tooltip title="Denetimi Kabul Et">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => acceptAuditRecommendation(recommendation)}
                                sx={{ 
                                  width: 32, 
                                  height: 32,
                                  border: '1px solid',
                                  borderColor: 'primary.main',
                                  '&:hover': { bgcolor: 'primary.50' }
                                }}
                              >
                                <CheckCircleIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reddet">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => rejectAuditRecommendation(recommendation.id)}
                                sx={{ 
                                  width: 32, 
                                  height: 32,
                                  border: '1px solid',
                                  borderColor: 'error.main',
                                  '&:hover': { bgcolor: 'error.50' }
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Özet İstatistikler */}
              <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                <Typography variant="subtitle2" gutterBottom sx={{ mb: 1, fontSize: '0.85rem' }}>
                  Aciliyet Dağılımı
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Box textAlign="center" p={1} bgcolor="error.50" borderRadius={1}>
                      <Typography variant="h6" color="error.main" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        {autoAuditRecommendations.filter(r => r.urgencyLevel === 'kritik').length}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Kritik</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box textAlign="center" p={1} bgcolor="warning.50" borderRadius={1}>
                      <Typography variant="h6" color="warning.main" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        {autoAuditRecommendations.filter(r => r.urgencyLevel === 'yüksek').length}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Yüksek</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box textAlign="center" p={1} bgcolor="info.50" borderRadius={1}>
                      <Typography variant="h6" color="info.main" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        {autoAuditRecommendations.filter(r => r.urgencyLevel === 'orta').length}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Orta</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box textAlign="center" p={1} bgcolor="primary.50" borderRadius={1}>
                      <Typography variant="h6" color="primary.main" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        {autoAuditRecommendations.length}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Toplam</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  // Quality Issues Management Component - Ana wrapper
  const renderQualityIssuesManagement = () => {
    // Entegre veri hazırlığı
    const safeNonconformities = nonconformities || [];
    const safeDefects = defects || [];
    const safeSuppliers = suppliers || [];
    
    // Entegre istatistikler
    const totalQualityIssues = safeNonconformities.length + safeDefects.length;
    const openNonconformities = safeNonconformities.filter(nc => nc.status === 'açık').length;
    const openDefects = safeDefects.filter(d => d.status === 'açık').length;
    const totalOpenIssues = openNonconformities + openDefects;
    
    const criticalNonconformities = safeNonconformities.filter(nc => nc.severity === 'kritik').length;
    const criticalDefects = safeDefects.filter(d => d.severity === 'kritik').length;
    const totalCriticalIssues = criticalNonconformities + criticalDefects;
    


    return (
      <Box>
        {/* Entegre İstatistik Kartları */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <AssessmentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {totalQualityIssues}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toplam Kalite Sorunu
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {safeNonconformities.length} Uygunsuzluk + {safeDefects.length} Hata
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'error.main' }}>
                    <ErrorIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {totalOpenIssues}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Açık Sorunlar
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {openNonconformities} Uygunsuzluk + {openDefects} Hata
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <SecurityIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {totalCriticalIssues}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Kritik Sorunlar
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {criticalNonconformities} Uygunsuzluk + {criticalDefects} Hata
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

        </Grid>

        {/* Alt Tab'lar */}
        <Paper sx={{ width: '100%', mb: 3 }}>
          <Tabs 
            value={qualityIssuesTab} 
            onChange={(e, newValue) => setQualityIssuesTab(newValue)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              icon={<BugReportIcon />} 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <span>Uygunsuzluklar</span>
                  <Chip 
                    label={safeNonconformities.length} 
                    size="small" 
                    color="primary"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              } 
              sx={{ minHeight: 72 }}
            />
            <Tab 
              icon={<WarningIcon />} 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <span>Hatalar</span>
                  <Chip 
                    label={safeDefects.length} 
                    size="small" 
                    color="secondary"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              } 
              sx={{ minHeight: 72 }}
            />
            <Tab 
              icon={<ViewListIcon />} 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <span>Birleşik Görünüm</span>
                  <Chip 
                    label={totalQualityIssues} 
                    size="small" 
                    color="success"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              } 
              sx={{ minHeight: 72 }}
            />
          </Tabs>
        </Paper>

        {/* İçerik */}
        <Box>
          {qualityIssuesTab === 0 && renderNonconformityManagement()}
          {qualityIssuesTab === 1 && renderDefectTracking()}
          {qualityIssuesTab === 2 && renderIntegratedQualityView()}
        </Box>
      </Box>
    );
  };

  // Nonconformity Management Component
  const renderNonconformityManagement = () => {
    console.log('🔍 renderNonconformityManagement çağrıldı');
    console.log('📊 Detaylı veri durumu:', {
      nonconformities: nonconformities,
      nonconformitiesLength: nonconformities?.length || 0,
      suppliers: suppliers,
      suppliersLength: suppliers?.length || 0,
      dataLoaded: dataLoaded,
      isLoading: isLoading
    });
    
    if (!dataLoaded || isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Uygunsuzluk verileri yükleniyor...
          </Typography>
        </Box>
      );
    }

    // Güvenlik kontrolü - array'lerin var olduğundan emin ol
    const safeNonconformities = nonconformities || [];
    const safeSuppliers = suppliers || [];
    
    return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Uygunsuzluk Yönetimi</Typography>
        <Button variant="contained" startIcon={<BugReportIcon />} onClick={handleCreateNonconformity}>
          Uygunsuzluk Kaydet
        </Button>
      </Box>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <BugReportIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {safeNonconformities.filter(nc => nc && nc.status === 'açık').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Açık Uygunsuzluk
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <SecurityIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {safeNonconformities.filter(nc => nc && nc.severity === 'kritik').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Kritik Uygunsuzluk
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <ReportIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {safeNonconformities.filter(nc => nc && nc.dofId).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    DÖF Oluşturulan
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {safeNonconformities.length > 0 ? Math.round((safeNonconformities.filter(nc => nc && nc.status === 'kapalı').length / safeNonconformities.length) * 100) : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Çözüm Oranı
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.50' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Başlık</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tedarikçi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Kategori</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Önem</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Durum</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tespit Tarihi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeNonconformities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    Henüz uygunsuzluk kaydı bulunmamaktadır
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<BugReportIcon />}
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setDialogType('nonconformity');
                      setDialogOpen(true);
                    }}
                  >
                    İlk Uygunsuzluğu Kaydet
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              safeNonconformities.filter(nc => nc && nc.id).map((nonconformity) => (
                <TableRow key={nonconformity.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {nonconformity.title || 'Başlık Belirtilmemiş'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {nonconformity.description && nonconformity.description.length > 50 
                          ? `${nonconformity.description.substring(0, 50)}...` 
                          : (nonconformity.description || 'Açıklama belirtilmemiş')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {safeSuppliers.find(s => s.id === nonconformity.supplierId)?.name || 'Bilinmiyor'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={nonconformity.category ? 
                        nonconformity.category.charAt(0).toUpperCase() + nonconformity.category.slice(1) : 
                        'Belirtilmemiş'
                      }
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={nonconformity.severity ? 
                        nonconformity.severity.charAt(0).toUpperCase() + nonconformity.severity.slice(1) : 
                        'Belirtilmemiş'
                      }
                      color={
                        nonconformity.severity === 'kritik' ? 'error' : 
                        nonconformity.severity === 'yüksek' ? 'warning' : 
                        nonconformity.severity === 'orta' ? 'info' : 'success'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={nonconformity.status ? 
                        nonconformity.status.charAt(0).toUpperCase() + nonconformity.status.slice(1) : 
                        'Belirtilmemiş'
                      }
                      color={
                        nonconformity.status === 'kapalı' ? 'success' : 
                        nonconformity.status === 'düzeltiliyor' ? 'info' : 
                        nonconformity.status === 'araştırılıyor' ? 'warning' : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {nonconformity.detectedDate ? 
                        new Date(nonconformity.detectedDate).toLocaleDateString('tr-TR') : 
                        'Tarih belirtilmemiş'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Görüntüle">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => {
                            setSelectedItem(nonconformity);
                            setDialogType('nonconformity');
                            setFormData(nonconformity);
                            setDialogOpen(true);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Düzenle">
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleEditItem(nonconformity, 'nonconformity')}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={
                        !nonconformity.dofId ? "DÖF Oluştur" : 
                        nonconformity.dofId === 'creating' ? "DÖF Oluşturuluyor..." : 
                        "DÖF Oluşturuldu"
                      }>
                        <IconButton 
                          size="small" 
                          color={
                            !nonconformity.dofId ? "warning" : 
                            nonconformity.dofId === 'creating' ? "info" : 
                            "success"
                          }
                          onClick={() => createDOFFromNonconformity(nonconformity)}
                          disabled={!!nonconformity.dofId}
                          sx={{
                            '&.Mui-disabled': {
                              color: nonconformity.dofId === 'creating' ? 'info.main' : 'success.main',
                              opacity: 0.7
                            }
                          }}
                        >
                          {!nonconformity.dofId ? <ReportIcon /> : 
                           nonconformity.dofId === 'creating' ? <CircularProgress size={20} /> : 
                           <CheckCircleIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteItem(nonconformity.id, 'nonconformity')}
                        >
                          <DeleteIcon />
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
    </Box>
    );
  };

  // Integrated Quality View Component
  const renderIntegratedQualityView = () => {
    // Veri entegrasyonu
    const safeNonconformities = nonconformities || [];
    const safeDefects = defects || [];
    const safeSuppliers = suppliers || [];
    
    // Birleşik liste oluşturma
    const integratedIssues = [
      ...safeNonconformities.map(nc => ({
        id: `nc-${nc.id}`,
        type: 'nonconformity',
        originalId: nc.id,
        title: nc.title,
        description: nc.description,
        supplierId: nc.supplierId,
        supplierName: safeSuppliers.find(s => s.id === nc.supplierId)?.name || 'Bilinmiyor',
        category: nc.category,
        severity: nc.severity,
        status: nc.status,
        detectedDate: nc.detectedDate,

        dofId: nc.dofId,
        icon: BugReportIcon,
        typeLabel: 'Uygunsuzluk',
        partCode: nc.partCode,
        additionalInfo: nc.quantityAffected ? `${nc.quantityAffected} adet` : null
      })),
      ...safeDefects.map(d => ({
        id: `def-${d.id}`,
        type: 'defect',
        originalId: d.id,
        title: d.defectType,
        description: d.description,
        supplierId: d.supplierId,
        supplierName: safeSuppliers.find(s => s.id === d.supplierId)?.name || 'Bilinmiyor',
        category: 'kalite',
        severity: d.severity,
        status: d.status,
        detectedDate: d.detectedDate,

        dofId: d.dofId,
        icon: WarningIcon,
        typeLabel: 'Hata',
        partCode: d.batchNumber,
        additionalInfo: `${d.quantity} adet`
      }))
    ].sort((a, b) => new Date(b.detectedDate).getTime() - new Date(a.detectedDate).getTime());

    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Birleşik Kalite Sorunları ({integratedIssues.length})
          </Typography>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Tür</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Başlık/Açıklama</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tedarikçi</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Kategori</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Önem</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tarih</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {integratedIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      Henüz kalite sorunu kaydı bulunmamaktadır
                    </Typography>
                    <Box display="flex" gap={2} justifyContent="center" mt={2}>
                      <Button 
                        variant="contained" 
                        startIcon={<BugReportIcon />}
                        onClick={() => {
                          setQualityIssuesTab(0);
                          setDialogType('nonconformity');
                          setDialogOpen(true);
                        }}
                      >
                        Uygunsuzluk Kaydet
                      </Button>
                      <Button 
                        variant="contained" 
                        startIcon={<WarningIcon />}
                        onClick={() => {
                          setQualityIssuesTab(1);
                          setDialogType('defect');
                          setDialogOpen(true);
                        }}
                      >
                        Hata Kaydet
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                integratedIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar 
                          sx={{ 
                            bgcolor: issue.type === 'nonconformity' ? 'primary.main' : 'secondary.main',
                            width: 32, 
                            height: 32 
                          }}
                        >
                          <issue.icon style={{ fontSize: 18 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {issue.typeLabel}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {issue.partCode}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {issue.title || 'Belirtilmemiş'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {issue.description && issue.description.length > 50 
                            ? `${issue.description.substring(0, 50)}...` 
                            : issue.description || 'Açıklama yok'}
                        </Typography>
                        {issue.additionalInfo && (
                          <Typography variant="caption" color="primary.main" display="block">
                            {issue.additionalInfo}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {issue.supplierName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={issue.category ? 
                          issue.category.charAt(0).toUpperCase() + issue.category.slice(1) : 
                          'Belirtilmemiş'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={issue.severity ? 
                          issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1) : 
                          'Belirtilmemiş'}
                        color={
                          issue.severity === 'kritik' ? 'error' : 
                          issue.severity === 'yüksek' || issue.severity === 'major' ? 'warning' : 
                          issue.severity === 'orta' ? 'info' : 'success'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={issue.status ? 
                          issue.status.charAt(0).toUpperCase() + issue.status.slice(1) : 
                          'Durum belirtilmemiş'}
                        color={
                          issue.status === 'düzeltildi' || issue.status === 'kapalı' ? 'success' : 
                          issue.status === 'araştırılıyor' || issue.status === 'düzeltiliyor' ? 'warning' : 
                          'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {issue.detectedDate ? 
                          new Date(issue.detectedDate).toLocaleDateString('tr-TR') : 
                          'Tarih belirtilmemiş'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Görüntüle">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => {
                              if (issue.type === 'nonconformity') {
                                setQualityIssuesTab(0);
                                const nonconformity = safeNonconformities.find(nc => nc.id === issue.originalId);
                                if (nonconformity) {
                                  setSelectedItem(nonconformity);
                                  setDialogType('nonconformity');
                                  setFormData(nonconformity);
                                  setDialogOpen(true);
                                }
                              } else {
                                setQualityIssuesTab(1);
                                const defect = safeDefects.find(d => d.id === issue.originalId);
                                if (defect) {
                                  setSelectedItem(defect);
                                  setDialogType('defect');
                                  setFormData(defect);
                                  setDialogOpen(true);
                                }
                              }
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={
                          !issue.dofId ? "DÖF Oluştur" : 
                          issue.dofId === 'creating' ? "DÖF Oluşturuluyor..." : 
                          "DÖF Oluşturuldu"
                        }>
                          <IconButton 
                            size="small" 
                            color={
                              !issue.dofId ? "warning" : 
                              issue.dofId === 'creating' ? "info" : 
                              "success"
                            }
                            onClick={() => {
                              if (issue.dofId) return;
                              
                              if (issue.type === 'nonconformity') {
                                const nonconformity = safeNonconformities.find(nc => nc.id === issue.originalId);
                                if (nonconformity) {
                                  createDOFFromNonconformity(nonconformity);
                                }
                              } else {
                                // Defect için DÖF oluştur
                                const defect = safeDefects.find(d => d.id === issue.originalId);
                                if (defect) {
                                  const mockNonconformity: NonconformityRecord = {
                                    id: `temp-${Date.now()}`,
                                    supplierId: defect.supplierId,
                                    title: `${defect.defectType} Hatası`,
                                    description: `${defect.description} - Miktar: ${defect.quantity}`,
                                    category: 'kalite',
                                    severity: defect.severity === 'kritik' ? 'kritik' : defect.severity === 'major' ? 'yüksek' : 'orta',
                                    detectedDate: defect.detectedDate,
                                    status: 'açık',
                                    dueDate: '',
                                    recurrence: false,
                                    partCode: defect.batchNumber || 'UNKNOWN-001'
                                  };
                                  createDOFFromNonconformity(mockNonconformity);
                                }
                              }
                            }}
                            disabled={!!issue.dofId}
                          >
                            {!issue.dofId ? <ReportIcon /> : 
                             issue.dofId === 'creating' ? <CircularProgress size={20} /> : 
                             <CheckCircleIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteItem(issue.originalId, issue.type)}
                          >
                            <DeleteIcon />
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
      </Box>
    );
  };

  // Defect Tracking Component
  const renderDefectTracking = () => {
    // Güvenlik kontrolü - array'lerin var olduğundan emin ol
    const safeDefects = defects || [];
    const safeSuppliers = suppliers || [];

    return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Hata Takibi</Typography>
        <Button variant="contained" startIcon={<WarningIcon />} onClick={handleCreateDefect}>
          Hata Kaydet
        </Button>
      </Box>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Hata Kategorileri</Typography>
              <Box height={200}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={[
                        { name: 'Boyutsal', value: 15, fill: '#2196f3' },
                        { name: 'Görsel', value: 8, fill: '#4caf50' },
                        { name: 'Fonksiyonel', value: 5, fill: '#ff9800' },
                        { name: 'Materyal', value: 3, fill: '#f44336' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label
                    >
                      {[
                        { name: 'Boyutsal', value: 15, fill: '#2196f3' },
                        { name: 'Görsel', value: 8, fill: '#4caf50' },
                        { name: 'Fonksiyonel', value: 5, fill: '#ff9800' },
                        { name: 'Materyal', value: 3, fill: '#f44336' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Aylık Hata Trendi</Typography>
              <Box height={200}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { month: 'Oca', defects: 12, resolved: 10 },
                    { month: 'Şub', defects: 8, resolved: 9 },
                    { month: 'Mar', defects: 15, resolved: 12 },
                    { month: 'Nis', defects: 6, resolved: 8 },
                    { month: 'May', defects: 10, resolved: 11 },
                    { month: 'Haz', defects: 4, resolved: 6 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="defects" stroke="#f44336" name="Yeni Hatalar" />
                    <Line type="monotone" dataKey="resolved" stroke="#4caf50" name="Çözülen Hatalar" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.50' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Hata Türü</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tedarikçi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Miktar</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Önem</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tespit Tarihi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Durum</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeDefects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    Henüz hata kaydı bulunmamaktadır
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<WarningIcon />}
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setDialogType('defect');
                      setDialogOpen(true);
                    }}
                  >
                    İlk Hatayı Kaydet
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              safeDefects.filter(d => d && d.id).map((defect) => (
                <TableRow key={defect.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {defect.defectType || 'Belirtilmemiş'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Parti No: {defect.batchNumber || 'Belirtilmemiş'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {safeSuppliers.find(s => s.id === defect.supplierId)?.name || 'Bilinmiyor'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {defect.quantity || 0} adet
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={defect.severity ? 
                        defect.severity.charAt(0).toUpperCase() + defect.severity.slice(1) : 
                        'Belirtilmemiş'}
                      color={
                        defect.severity === 'kritik' ? 'error' : 
                        defect.severity === 'major' ? 'warning' : 'info'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {defect.detectedDate ? 
                        new Date(defect.detectedDate).toLocaleDateString('tr-TR') : 
                        'Tarih belirtilmemiş'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={defect.status ? 
                        defect.status.charAt(0).toUpperCase() + defect.status.slice(1) : 
                        'Durum belirtilmemiş'}
                      color={
                        defect.status === 'düzeltildi' ? 'success' : 
                        defect.status === 'kabul' ? 'info' : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Görüntüle">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => {
                            setSelectedItem(defect);
                            setDialogType('defect');
                            setFormData(defect);
                            setDialogOpen(true);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Düzenle">
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleEditItem(defect, 'defect')}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={
                        !defect.dofId ? "DÖF Oluştur" : 
                        defect.dofId === 'creating' ? "DÖF Oluşturuluyor..." : 
                        "DÖF Oluşturuldu"
                      }>
                        <IconButton 
                          size="small" 
                          color={
                            !defect.dofId ? "warning" : 
                            defect.dofId === 'creating' ? "info" : 
                            "success"
                          }
                          onClick={() => {
                            if (defect.dofId) return;
                            
                            // Defect için DÖF ID'sini 'creating' olarak işaretle
                            const updatedDefects = defects.map(d => 
                              d.id === defect.id ? { ...d, dofId: 'creating' } : d
                            );
                            setDefects(updatedDefects);
                            
                            const mockNonconformity: NonconformityRecord = {
                              id: `temp-${Date.now()}`,
                              supplierId: defect.supplierId,
                              title: `${defect.defectType} Hatası`,
                              description: `${defect.description} - Miktar: ${defect.quantity}`,
                              category: 'kalite',
                              severity: defect.severity === 'kritik' ? 'kritik' : defect.severity === 'major' ? 'yüksek' : 'orta',
                              detectedDate: defect.detectedDate,
                              status: 'açık',
                              dueDate: '',
                              recurrence: false,
                              partCode: defect.batchNumber || 'UNKNOWN-001' // Zorunlu alan eklendi
                            };
                            createDOFFromNonconformity(mockNonconformity);
                          }}
                          disabled={!!defect.dofId}
                          sx={{
                            '&.Mui-disabled': {
                              color: defect.dofId === 'creating' ? 'info.main' : 'success.main',
                              opacity: 0.7
                            }
                          }}
                        >
                          {!defect.dofId ? <ReportIcon /> : 
                           defect.dofId === 'creating' ? <CircularProgress size={20} /> : 
                           <CheckCircleIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteItem(defect.id, 'defect')}
                        >
                          <DeleteIcon />
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
    </Box>
    );
  };

  // Performance Analysis Component
  const renderPerformanceAnalysis = () => {
    const radarData = prepareRadarData();
    const availableSuppliers = suppliers.slice(0, 5); // İlk 5 tedarikçi
    
    return (
      <Box>
        <Grid container spacing={3}>
          {/* Professional Supplier Selection */}
          <Grid item xs={12}>
            <Paper 
              elevation={0} 
              sx={{ 
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 3,
                overflow: 'hidden'
              }}
            >
              {/* Header - Compact */}
              <Box 
                sx={{ 
                  bgcolor: 'grey.50',
                  borderBottom: '1px solid',
                  borderColor: 'grey.200',
                  p: 2,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center'
                }}
              >
                <Paper 
                  elevation={1}
                  sx={{ 
                    p: 1,
                    bgcolor: selectedSuppliersForRadar.length === 3 ? 'success.main' : 'primary.main',
                    color: 'white',
                    minWidth: 50,
                    textAlign: 'center',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {selectedSuppliersForRadar.length}/3
                  </Typography>
                </Paper>
              </Box>

              {/* Content */}
              <Box sx={{ p: 3 }}>
                <FormControl fullWidth>
                  <InputLabel 
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      '&.Mui-focused': { color: 'primary.main' }
                    }}
                  >
                    Tedarikçi Seçimi
                  </InputLabel>
                  <Select
                    multiple
                    value={selectedSuppliersForRadar}
                    onChange={(event) => {
                      const value = event.target.value as string[];
                      if (value.length <= 3) {
                        setSelectedSuppliersForRadar(value);
                      } else {
                        showSnackbar('Maksimum 3 tedarikçi seçebilirsiniz', 'warning');
                      }
                    }}
                    label="Tedarikçi Seçimi"
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      },
                      '& .MuiSelect-select': {
                        minHeight: 48
                      }
                    }}
                    renderValue={(selected) => {
                      if ((selected as string[]).length === 0) {
                        return (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Tedarikçi seçiniz...
                          </Typography>
                        );
                      }
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as string[]).map((value) => {
                            const supplier = suppliers.find(s => s.id === value);
                            return supplier ? (
                              <Chip 
                                key={value} 
                                label={supplier.name}
                                size="small"
                                sx={{ 
                                  height: 28,
                                  fontSize: '0.8rem',
                                  fontWeight: 500,
                                  bgcolor: 'primary.main',
                                  color: 'white',
                                  '& .MuiChip-deleteIcon': {
                                    color: 'white'
                                  }
                                }}
                              />
                            ) : null;
                          })}
                        </Box>
                      );
                    }}
                  >
                    {suppliers.map((supplier) => (
                      <MenuItem 
                        key={supplier.id} 
                        value={supplier.id}
                        disabled={!selectedSuppliersForRadar.includes(supplier.id) && selectedSuppliersForRadar.length >= 3}
                        sx={{
                          py: 1.5,
                          '&:hover': {
                            bgcolor: 'grey.50'
                          },
                          '&.Mui-disabled': {
                            opacity: 0.5
                          }
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                          <Box>
                            <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                              {supplier.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {supplier.category}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Chip 
                              size="small" 
                              label={`${supplier.performanceScore}%`}
                              sx={{
                                bgcolor: supplier.performanceScore >= 90 ? 'success.main' : 
                                        supplier.performanceScore >= 75 ? 'warning.main' : 'error.main',
                                color: 'white',
                                fontWeight: 600,
                                height: 22,
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Selected Suppliers Preview */}
                {selectedSuppliersForRadar.length > 0 && (
                  <Box mt={3}>
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
                      Seçilen Tedarikçiler
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedSuppliersForRadar.map((supplierId, index) => {
                        const supplier = suppliers.find(s => s.id === supplierId);
                        const colors = ['#2196f3', '#ff9800', '#4caf50'];
                        return supplier ? (
                          <Grid item xs={12} sm={4} key={supplierId}>
                            <Paper 
                              elevation={2}
                              sx={{ 
                                p: 2, 
                                borderRadius: 2,
                                border: '2px solid',
                                borderColor: colors[index],
                                position: 'relative',
                                bgcolor: 'white'
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                <Typography variant="body1" fontWeight={600} noWrap>
                                  {supplier.name}
                                </Typography>
                                <Typography 
                                  variant="h6" 
                                  fontWeight={700}
                                  sx={{ color: colors[index] }}
                                >
                                  {supplier.performanceScore}%
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {supplier.category}
                              </Typography>
                              <Box 
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: colors[index]
                                }}
                              />
                            </Paper>
                          </Grid>
                        ) : null;
                      })}
                    </Grid>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Performance Radar Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader 
                title="Çok Boyutlu Performans Radarı" 
                subheader="Tedarikçilerin 6 farklı boyuttaki performans karşılaştırması"
              />
              <CardContent>
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                      />
                      {selectedSuppliersForRadar.length > 0 
                        ? suppliers
                            .filter(s => selectedSuppliersForRadar.includes(s.id))
                            .map((supplier, index) => {
                              const colors = ['#2196f3', '#ff9800', '#4caf50', '#f44336', '#9c27b0'];
                              return (
                                <Radar
                                  key={supplier.id}
                                  name={supplier.name.split(' ')[0]}
                                  dataKey={supplier.name.split(' ')[0]}
                                  stroke={colors[index]}
                                  fill={colors[index]}
                                  fillOpacity={0.1}
                                  strokeWidth={2}
                                />
                              );
                            })
                        : suppliers.slice(0, 3).map((supplier, index) => {
                            const colors = ['#2196f3', '#ff9800', '#4caf50'];
                            return (
                              <Radar
                                key={supplier.id}
                                name={supplier.name.split(' ')[0]}
                                dataKey={supplier.name.split(' ')[0]}
                                stroke={colors[index]}
                                fill={colors[index]}
                                fillOpacity={0.1}
                                strokeWidth={2}
                              />
                            );
                          })
                      }
                      <ChartTooltip 
                        formatter={(value: any, name: any) => [`${value}%`, name]}
                        labelFormatter={(label) => `Boyut: ${label}`}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
                
                {/* Boyut Açıklamaları - Kompakt */}
                <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="overline" display="block" gutterBottom sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                    Performans Boyutları
                  </Typography>
                  <Grid container spacing={0.5}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        <strong>Kalite:</strong> Uygunsuzluk/Hata
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        <strong>Teslimat:</strong> Zamanında Teslim
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        <strong>Güvenilirlik:</strong> Denetim Geçmişi
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        <strong>İnovasyon:</strong> Kategori/Hizmet
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        <strong>Sürdürülebilirlik:</strong> İş Birliği
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

        {/* Performance Insights - Kompakt */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="Performans İçgörüleri" 
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            />
            <CardContent sx={{ pt: 1 }}>
              <Box display="flex" flexDirection="column" gap={1.5}>
                
                {/* En güçlü boyut */}
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'success.50', borderLeft: 3, borderColor: 'success.main' }}>
                  <Typography variant="overline" sx={{ color: 'success.main', fontWeight: 'bold', fontSize: '0.7rem' }}>
                    En Güçlü Boyut
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
                    Kalite skoru sektör ortalamasının %15 üzerinde
                  </Typography>
                </Paper>
                
                {/* Gelişim alanı */}
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'warning.50', borderLeft: 3, borderColor: 'warning.main' }}>
                  <Typography variant="overline" sx={{ color: 'warning.main', fontWeight: 'bold', fontSize: '0.7rem' }}>
                    Gelişim Alanı
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
                    İnovasyon boyutunda iyileştirme fırsatı
                  </Typography>
                </Paper>
                
                {/* Öneri */}
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'info.50', borderLeft: 3, borderColor: 'info.main' }}>
                  <Typography variant="overline" sx={{ color: 'info.main', fontWeight: 'bold', fontSize: '0.7rem' }}>
                    Aksiyon Önerisi
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
                    Stratejik tedarikçilerle inovasyon projelerine odaklanma
                  </Typography>
                </Paper>
                
                {/* Benchmark kompakt */}
                <Box mt={1}>
                  <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.7rem' }}>
                    Sektör Karşılaştırması
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Ortalama Performans</Typography>
                    <Chip size="small" label="87.5%" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>Sektör Ortalaması</Typography>
                    <Chip size="small" label="82.1%" color="default" sx={{ height: 20, fontSize: '0.7rem' }} />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Ranking - Kompakt */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title="Performans Sıralaması" 
              titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            />
            <CardContent sx={{ pt: 1 }}>
              <List dense>
                {suppliers
                  .sort((a, b) => b.performanceScore - a.performanceScore)
                  .slice(0, 5)
                  .map((supplier, index) => (
                    <ListItem 
                      key={supplier.id} 
                      divider 
                      sx={{ 
                        py: 1, 
                        borderRadius: 1, 
                        mb: 0.5,
                        bgcolor: index < 3 ? `${index === 0 ? 'warning' : index === 1 ? 'info' : 'success'}.50` : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Avatar sx={{ 
                          bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'grey.400',
                          width: 28, height: 28, fontSize: '0.75rem', fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
                            {supplier.name}
                          </Typography>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <Typography variant="body2" fontWeight="bold" color="primary" sx={{ fontSize: '0.8rem' }}>
                              {supplier.performanceScore}%
                            </Typography>
                            <Box display="flex" gap={0.5}>
                              <Chip 
                                size="small" 
                                label={`K:${supplier.qualityScore}`} 
                                color="primary" 
                                sx={{ height: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.5 } }}
                              />
                              <Chip 
                                size="small" 
                                label={`T:${supplier.deliveryScore}`} 
                                color="success" 
                                sx={{ height: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.5 } }}
                              />
                            </Box>
                          </Box>
                        }
                      />
                      <Box display="flex" alignItems="center">
                        {index < 3 && <StarIcon sx={{ color: '#FFD700', fontSize: '1.2rem' }} />}
                      </Box>
                    </ListItem>
                  ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Trends */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Performans Trendleri" />
            <CardContent>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { month: 'Oca', 'Seçkinler Metal': 88, 'Nisa Metal': 85 },
                    { month: 'Şub', 'Seçkinler Metal': 90, 'Nisa Metal': 86 },
                    { month: 'Mar', 'Seçkinler Metal': 91, 'Nisa Metal': 87 },
                    { month: 'Nis', 'Seçkinler Metal': 89, 'Nisa Metal': 85 },
                    { month: 'May', 'Seçkinler Metal': 92, 'Nisa Metal': 88 },
                    { month: 'Haz', 'Seçkinler Metal': 92, 'Nisa Metal': 87 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[70, 100]} />
                    <ChartTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Seçkinler Metal" stroke="#2196f3" strokeWidth={2} />
                    <Line type="monotone" dataKey="Nisa Metal" stroke="#ff9800" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
    );
  };

  // Loading durumunda gösterilecek içerik
  if (isLoading) {
    return (
      <ErrorBoundary>
        <Box 
          display="flex" 
          flexDirection="column" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="60vh"
          p={3}
        >
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>
            Tedarikçi Kalite Yönetimi Yükleniyor...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Veriler hazırlanıyor, lütfen bekleyin
          </Typography>
        </Box>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Box p={3}>
        <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
          <Box display="flex" gap={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={autoAuditEnabled}
                  onChange={(e) => setAutoAuditEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Otomatik Denetim"
            />
            <Button
              variant="outlined"
              startIcon={<AssessmentIcon />}
              onClick={() => {
                console.log('🔄 Manuel performans güncelleme başlatıldı...');
                console.log('Mevcut tedarikçi sayısı:', suppliers.length);
                console.log('Mevcut uygunsuzluk sayısı:', nonconformities.length);
                console.log('Mevcut hata sayısı:', defects.length);
                updateSupplierPerformances();
                showSnackbar('Performanslar güncellendi', 'success');
              }}
              color="info"
            >
              Performans Yenile
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateSupplier}
            >
              Yeni Tedarikçi
            </Button>
          </Box>
        </Box>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            <Tab icon={<DashboardIcon />} label="Dashboard" />
            <Tab icon={<LinkIcon />} label="Onaylı/Alternatif Eşleştirme" />
            <Tab icon={<BusinessIcon />} label="Tedarikçi Listesi" />
            <Tab icon={<ScheduleIcon />} label="Denetim Takibi" />
            <Tab icon={<BugReportIcon />} label="Kalite Sorunları Yönetimi" />
            <Tab icon={<AssessmentIcon />} label="Performans Analizi" />
          </Tabs>
        </Paper>

                 <Box>
           {(() => {
             try {
               switch (currentTab) {
                 case 0:
                   return renderDashboard();
                 case 1:
                   return renderSupplierPairing();
                 case 2:
                   return renderSupplierList();
                 case 3:
                   return renderAuditTracking();
                 case 4:
                   console.log('🎯 Kalite Sorunları Yönetimi tab\'ı render ediliyor...');
                   return renderQualityIssuesManagement();
                 case 5:
                   return renderPerformanceAnalysis();
                 default:
                   return renderDashboard();
               }
             } catch (error) {
               console.error('❌ Tab render hatası:', error);
               return (
                 <Box p={3}>
                   <Alert severity="error">
                     <Typography variant="h6" gutterBottom>
                       Sekme Yükleme Hatası
                     </Typography>
                     <Typography variant="body2" gutterBottom>
                       {error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu'}
                     </Typography>
                     <Button 
                       variant="contained" 
                       onClick={() => {
                         setCurrentTab(0);
                         window.location.reload();
                       }}
                       sx={{ mt: 2 }}
                     >
                       Ana Sayfaya Dön
                     </Button>
                   </Alert>
                 </Box>
               );
             }
           })()}
         </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Universal Dialog for all operations */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {dialogType === 'supplier' && (selectedItem ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi Ekle')}
            {dialogType === 'pair' && (selectedItem ? 'Eşleştirme Düzenle' : 'Yeni Eşleştirme Oluştur')}
            {dialogType === 'nonconformity' && (selectedItem ? 'Uygunsuzluk Düzenle' : 'Yeni Uygunsuzluk Kaydet')}
            {dialogType === 'defect' && (selectedItem ? 'Hata Düzenle' : 'Yeni Hata Kaydet')}
            {dialogType === 'audit' && (selectedItem ? 'Denetim Düzenle' : 'Yeni Denetim Planla')}
          </DialogTitle>
          
          <DialogContent>
            {dialogType === 'supplier' && (
              <Box component="form" sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tedarikçi Adı"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Tür</InputLabel>
                      <Select
                        value={formData.type || 'onaylı'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <MenuItem value="onaylı">Onaylı</MenuItem>
                        <MenuItem value="alternatif">Alternatif</MenuItem>
                        <MenuItem value="potansiyel">Potansiyel</MenuItem>
                        <MenuItem value="bloklu">Bloklu</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Kategori</InputLabel>
                      <Select
                        value={formData.category || 'genel'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <MenuItem value="stratejik">Stratejik</MenuItem>
                        <MenuItem value="kritik">Kritik</MenuItem>
                        <MenuItem value="rutin">Rutin</MenuItem>
                        <MenuItem value="genel">Genel</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Yeni Tedarik Türü Alanları */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Tedarik Türü</InputLabel>
                      <Select
                        value={formData.supplyType || 'malzeme'}
                        onChange={(e) => {
                          const newSupplyType = e.target.value as 'malzeme' | 'hizmet' | 'hibrit';
                          setFormData({ 
                            ...formData, 
                            supplyType: newSupplyType,
                            supplySubcategories: [] // Reset subcategories when type changes
                          });
                        }}
                      >
                        <MenuItem value="malzeme">Malzeme Tedarikçisi</MenuItem>
                        <MenuItem value="hizmet">Hizmet Sağlayıcısı</MenuItem>
                        <MenuItem value="hibrit">Hibrit (Malzeme + Hizmet)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Alt Kategoriler</InputLabel>
                      <Select
                        multiple
                        value={formData.supplySubcategories || []}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          supplySubcategories: e.target.value as string[]
                        })}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {formData.supplyType && SUPPLY_SUBCATEGORIES[formData.supplyType as keyof typeof SUPPLY_SUBCATEGORIES]?.map((subcategory) => (
                          <MenuItem key={subcategory} value={subcategory}>
                            {subcategory}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="İletişim Kişisi"
                      value={formData.contact?.contactPerson || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        contact: { ...formData.contact, contactPerson: e.target.value }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="E-posta"
                      type="email"
                      value={formData.contact?.email || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        contact: { ...formData.contact, email: e.target.value }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Telefon"
                      value={formData.contact?.phone || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        contact: { ...formData.contact, phone: e.target.value }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Adres"
                      value={formData.contact?.address || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        contact: { ...formData.contact, address: e.target.value }
                      })}
                    />
                  </Grid>
                  
                  {/* Performans Skorları */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Performans Skorları</Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Genel performans skoru kalite (%60) ve teslimat (%40) skorlarına göre otomatik hesaplanır.
                    </Alert>
                  </Grid>
                  
                  {/* Kalite ve Teslimat Skorları - Düzenlenebilir */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Kalite Skoru"
                      type="number"
                      value={formData.qualityScore ?? 88}
                      onChange={(e) => {
                        const newQualityScore = e.target.value === '' ? 0 : Math.max(0, Math.min(100, Number(e.target.value)));
                        const currentDeliveryScore = formData.deliveryScore ?? 90;
                        const calculatedPerformance = calculatePerformanceScore(newQualityScore, currentDeliveryScore);
                        
                        setFormData({ 
                          ...formData, 
                          qualityScore: newQualityScore,
                          performanceScore: calculatedPerformance
                        });
                      }}
                      InputProps={{
                        endAdornment: <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', minWidth: 'auto' }}>%</Typography>
                      }}
                      inputProps={{ 
                        min: 0, 
                        max: 100, 
                        step: 1,
                        'aria-label': 'Kalite Skoru'
                      }}
                      helperText="0-100 arası puan"
                      error={formData.qualityScore !== undefined && (formData.qualityScore < 0 || formData.qualityScore > 100)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Teslimat Skoru"
                      type="number"
                      value={formData.deliveryScore ?? 90}
                      onChange={(e) => {
                        const newDeliveryScore = e.target.value === '' ? 0 : Math.max(0, Math.min(100, Number(e.target.value)));
                        const currentQualityScore = formData.qualityScore ?? 88;
                        const calculatedPerformance = calculatePerformanceScore(currentQualityScore, newDeliveryScore);
                        
                        setFormData({ 
                          ...formData, 
                          deliveryScore: newDeliveryScore,
                          performanceScore: calculatedPerformance
                        });
                      }}
                      InputProps={{
                        endAdornment: <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', minWidth: 'auto' }}>%</Typography>
                      }}
                      inputProps={{ 
                        min: 0, 
                        max: 100, 
                        step: 1,
                        'aria-label': 'Teslimat Skoru'
                      }}
                      helperText="0-100 arası puan"
                      error={formData.deliveryScore !== undefined && (formData.deliveryScore < 0 || formData.deliveryScore > 100)}
                    />
                  </Grid>
                  
                  {/* Genel Performans Skoru - Otomatik Hesaplanan, Sadece Okunur */}
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body1" fontWeight="bold">
                          Genel Performans Skoru (Otomatik)
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography 
                            variant="h4" 
                            fontWeight="bold" 
                            color={
                              (formData.performanceScore !== undefined ? formData.performanceScore : 
                               calculatePerformanceScore(
                                 formData.qualityScore !== undefined ? formData.qualityScore : (selectedItem ? selectedItem.qualityScore : 88),
                                 formData.deliveryScore !== undefined ? formData.deliveryScore : (selectedItem ? selectedItem.deliveryScore : 90)
                               )) >= 90 ? 'success.main' :    // A Sınıfı
                              (formData.performanceScore !== undefined ? formData.performanceScore : 
                               calculatePerformanceScore(
                                 formData.qualityScore !== undefined ? formData.qualityScore : (selectedItem ? selectedItem.qualityScore : 88),
                                 formData.deliveryScore !== undefined ? formData.deliveryScore : (selectedItem ? selectedItem.deliveryScore : 90)
                               )) >= 75 ? 'info.main' :       // B Sınıfı
                              (formData.performanceScore !== undefined ? formData.performanceScore : 
                               calculatePerformanceScore(
                                 formData.qualityScore !== undefined ? formData.qualityScore : (selectedItem ? selectedItem.qualityScore : 88),
                                 formData.deliveryScore !== undefined ? formData.deliveryScore : (selectedItem ? selectedItem.deliveryScore : 90)
                               )) >= 60 ? 'warning.main' :    // C Sınıfı
                              'error.main'                     // D Sınıfı
                            }
                          >
                            {formData.performanceScore !== undefined ? formData.performanceScore : 
                             calculatePerformanceScore(
                               formData.qualityScore !== undefined ? formData.qualityScore : (selectedItem ? selectedItem.qualityScore : 88),
                               formData.deliveryScore !== undefined ? formData.deliveryScore : (selectedItem ? selectedItem.deliveryScore : 90)
                             )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>%</Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Kalite Skoru (%60) + Teslimat Skoru (%40) ağırlıklı ortalaması
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {/* Risk Seviyesi ve Durum */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Risk Seviyesi</InputLabel>
                      <Select
                        value={formData.riskLevel || 'düşük'}
                        onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                      >
                        <MenuItem value="düşük">Düşük Risk</MenuItem>
                        <MenuItem value="orta">Orta Risk</MenuItem>
                        <MenuItem value="yüksek">Yüksek Risk</MenuItem>
                        <MenuItem value="kritik">Kritik Risk</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Durum</InputLabel>
                      <Select
                        value={formData.status || 'aktif'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <MenuItem value="aktif">Aktif</MenuItem>
                        <MenuItem value="pasif">Pasif</MenuItem>
                        <MenuItem value="denetimde">Denetimde</MenuItem>
                        <MenuItem value="bloklu">Bloklu</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                {/* 📎 DOSYA EKLERİ YÖNETİMİ - Sadece tedarikçi dialog'u için */}
                {dialogType === 'supplier' && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Dosya Ekleri
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <input
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        style={{ display: 'none' }}
                        id="attachment-upload"
                        multiple
                        type="file"
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="attachment-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<UploadIcon />}
                          sx={{ mr: 2 }}
                        >
                          Dosya Yükle
                        </Button>
                      </label>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Desteklenen formatlar: PDF, JPG, PNG, DOC, DOCX (Maks. 10MB)
                      </Typography>
                    </Box>
                    
                    {/* Yüklenen dosyalar listesi */}
                    {formData.attachments && formData.attachments.length > 0 && (
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Yüklenen Dosyalar ({formData.attachments.length})
                        </Typography>
                        <List dense>
                          {formData.attachments.map((attachment) => (
                            <ListItem key={attachment.id}>
                              <ListItemIcon>
                                <AttachFileIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary={attachment.name}
                                secondary={`${formatFileSize(attachment.size)} • ${new Date(attachment.uploadDate).toLocaleDateString('tr-TR')}`}
                              />
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewAttachment(attachment)} 
                                title="Görüntüle"
                              >
                                <VisibilityIcon />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDownloadAttachment(attachment)} 
                                title="İndir"
                              >
                                <DownloadIcon />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteAttachment(attachment.id)} 
                                title="Sil"
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {dialogType === 'nonconformity' && (
              <Box component="form" sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Tedarikçi</InputLabel>
                      <Select
                        value={formData.supplierId || ''}
                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                      >
                        {suppliers.map(supplier => (
                          <MenuItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Uygunsuzluk Başlığı"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </Grid>
                  
                  {/* Zorunlu Parça Kodu */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Parça Kodu"
                      value={formData.partCode || ''}
                      onChange={(e) => setFormData({ ...formData, partCode: e.target.value })}
                      required
                      helperText="Bu alan zorunludur"
                      error={!formData.partCode}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Uygunsuzluk Kategorisi</InputLabel>
                      <Select
                        value={formData.category || 'kalite'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <MenuItem value="kalite">Kalite Problemi</MenuItem>
                        <MenuItem value="teslimat">Teslimat Problemi</MenuItem>
                        <MenuItem value="doküman">Doküman Problemi</MenuItem>
                        <MenuItem value="servis">Servis Problemi</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Dinamik Alanlar - Kategori Bazında */}
                  {formData.category === 'kalite' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Etkilenen Parça Adedi (adet)"
                        type="number"
                        value={formData.quantityAffected || ''}
                        onChange={(e) => setFormData({ ...formData, quantityAffected: Number(e.target.value) })}
                        helperText="Kalite probleminden etkilenen parça sayısı"
                        inputProps={{ min: 0, step: 1 }}
                      />
                    </Grid>
                  )}
                  
                  {formData.category === 'teslimat' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Gecikme Süresi (gün)"
                        type="number"
                        value={formData.delayDays || ''}
                        onChange={(e) => setFormData({ ...formData, delayDays: Number(e.target.value) })}
                        helperText="Teslimat gecikmesi gün olarak"
                        inputProps={{ min: 0, step: 1 }}
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Uygunsuzluk Açıklaması"
                      multiline
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      helperText="Uygunsuzluğun detaylı açıklaması"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Önem Derecesi</InputLabel>
                      <Select
                        value={formData.severity || 'düşük'}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      >
                        <MenuItem value="kritik">Kritik</MenuItem>
                        <MenuItem value="yüksek">Yüksek</MenuItem>
                        <MenuItem value="orta">Orta</MenuItem>
                        <MenuItem value="düşük">Düşük</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tespit Tarihi"
                      type="date"
                      value={formData.detectedDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, detectedDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Hedef Tamamlanma Tarihi"
                      type="date"
                      value={formData.dueDate || ''}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      helperText="Uygunsuzluğun giderilmesi gereken tarih"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Durum</InputLabel>
                      <Select
                        value={formData.status || 'açık'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <MenuItem value="açık">Açık</MenuItem>
                        <MenuItem value="araştırılıyor">Araştırılıyor</MenuItem>
                        <MenuItem value="düzeltiliyor">Düzeltiliyor</MenuItem>
                        <MenuItem value="kapalı">Kapalı</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}

            {dialogType === 'defect' && (
              <Box component="form" sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Tedarikçi</InputLabel>
                      <Select
                        value={formData.supplierId || ''}
                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                      >
                        {suppliers.map(supplier => (
                          <MenuItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Hata Türü"
                      value={formData.defectType || ''}
                      onChange={(e) => setFormData({ ...formData, defectType: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Parti Numarası"
                      value={formData.batchNumber || ''}
                      onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Açıklama"
                      multiline
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Miktar (adet)"
                      type="number"
                      value={formData.quantity || 0}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      inputProps={{ min: 0, step: 1 }}
                      helperText="Hatalı parça adedi"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Önem Derecesi</InputLabel>
                      <Select
                        value={formData.severity || 'minor'}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      >
                        <MenuItem value="kritik">Kritik</MenuItem>
                        <MenuItem value="major">Major</MenuItem>
                        <MenuItem value="minor">Minor</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                </Grid>
              </Box>
            )}

            {dialogType === 'pair' && (
              <Box component="form" sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Tedarikçi Eşleştirme Bilgileri
                    </Typography>
                  </Grid>
                  
                  {/* Ana Tedarikçi Seçimi - Opsiyonel */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      fullWidth
                      options={suppliers.filter(s => s.type === 'onaylı')}
                      getOptionLabel={(option) => option.name}
                      value={suppliers.find(s => s.id === formData.primarySupplierId) || null}
                      onChange={(event, newValue) => {
                        const selectedSupplierId = newValue?.id || '';
                        
                        setFormData({ 
                          ...formData, 
                          primarySupplierId: selectedSupplierId
                        });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Ana Tedarikçi (Opsiyonel)"
                          helperText="Alternatifler arasından seçim yapmak için boş bırakabilirsiniz"
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <CheckCircleIcon color="success" fontSize="small" />
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {option.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.category} • Puan: {option.performanceScore}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      )}
                      filterOptions={(options, { inputValue }) =>
                        options.filter(option =>
                          option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                          option.category.toLowerCase().includes(inputValue.toLowerCase()) ||
                          option.materialTypes.some(mt => mt.toLowerCase().includes(inputValue.toLowerCase()))
                        )
                      }
                      noOptionsText="Tedarikçi bulunamadı"
                    />
                  </Grid>

                  {/* 1. Alternatif Tedarikçi Seçimi */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      fullWidth
                      options={suppliers.filter(s => (s.type === 'alternatif' || s.type === 'onaylı') && 
                        s.id !== formData.primarySupplierId && 
                        s.id !== (formData.alternativeSupplierIds || [])[1])}
                      getOptionLabel={(option) => option.name}
                      value={suppliers.find(s => s.id === (formData.alternativeSupplierIds || [])[0]) || null}
                      onChange={(event, newValue) => {
                        const currentIds = formData.alternativeSupplierIds || [];
                        const newIds = [...currentIds];
                        newIds[0] = newValue?.id || '';
                        // Boş stringleri filtrele
                        const filteredIds = newIds.filter(id => id !== '');
                        setFormData({ ...formData, alternativeSupplierIds: filteredIds });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="1. Alternatif Tedarikçi (Opsiyonel)"
                          helperText="Arama yaparak tedarikçi bulabilirsiniz"
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <SwapHorizIcon color="warning" fontSize="small" />
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {option.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.type} • {option.category} • Puan: {option.performanceScore}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      )}
                      filterOptions={(options, { inputValue }) =>
                        options.filter(option =>
                          option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                          option.category.toLowerCase().includes(inputValue.toLowerCase()) ||
                          option.type.toLowerCase().includes(inputValue.toLowerCase()) ||
                          option.materialTypes.some(mt => mt.toLowerCase().includes(inputValue.toLowerCase()))
                        )
                      }
                      noOptionsText="Tedarikçi bulunamadı"
                    />
                  </Grid>

                  {/* 2. Alternatif Tedarikçi Seçimi */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      fullWidth
                      options={suppliers.filter(s => (s.type === 'alternatif' || s.type === 'onaylı') && 
                        s.id !== formData.primarySupplierId && 
                        s.id !== (formData.alternativeSupplierIds || [])[0])}
                      getOptionLabel={(option) => option.name}
                      value={suppliers.find(s => s.id === (formData.alternativeSupplierIds || [])[1]) || null}
                      onChange={(event, newValue) => {
                        const currentIds = formData.alternativeSupplierIds || [];
                        const newIds = [...currentIds];
                        newIds[1] = newValue?.id || '';
                        // Boş stringleri filtrele
                        const filteredIds = newIds.filter(id => id !== '');
                        setFormData({ ...formData, alternativeSupplierIds: filteredIds });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="2. Alternatif Tedarikçi (Opsiyonel)"
                          helperText="İkinci alternatif tedarikçi seçebilirsiniz"
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <SwapHorizIcon color="info" fontSize="small" />
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {option.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.type} • {option.category} • Puan: {option.performanceScore}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      )}
                      filterOptions={(options, { inputValue }) =>
                        options.filter(option =>
                          option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                          option.category.toLowerCase().includes(inputValue.toLowerCase()) ||
                          option.type.toLowerCase().includes(inputValue.toLowerCase()) ||
                          option.materialTypes.some(mt => mt.toLowerCase().includes(inputValue.toLowerCase()))
                        )
                      }
                      noOptionsText="Tedarikçi bulunamadı"
                    />
                  </Grid>

                  {/* 3. Alternatif Tedarikçi Seçimi */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      fullWidth
                      options={suppliers.filter(s => (s.type === 'alternatif' || s.type === 'onaylı') && 
                        s.id !== formData.primarySupplierId && 
                        s.id !== (formData.alternativeSupplierIds || [])[0] &&
                        s.id !== (formData.alternativeSupplierIds || [])[1])}
                      getOptionLabel={(option) => option.name}
                      value={suppliers.find(s => s.id === (formData.alternativeSupplierIds || [])[2]) || null}
                      onChange={(event, newValue) => {
                        const currentIds = formData.alternativeSupplierIds || [];
                        const newIds = [...currentIds];
                        newIds[2] = newValue?.id || '';
                        // Boş stringleri filtrele
                        const filteredIds = newIds.filter(id => id !== '');
                        setFormData({ ...formData, alternativeSupplierIds: filteredIds });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="3. Alternatif Tedarikçi (Opsiyonel)"
                          helperText="Üçüncü alternatif tedarikçi seçebilirsiniz"
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <SwapHorizIcon color="secondary" fontSize="small" />
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {option.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.type} • {option.category} • Puan: {option.performanceScore}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      )}
                      filterOptions={(options, { inputValue }) =>
                        options.filter(option =>
                          option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                          option.category.toLowerCase().includes(inputValue.toLowerCase()) ||
                          option.type.toLowerCase().includes(inputValue.toLowerCase()) ||
                          option.materialTypes.some(mt => mt.toLowerCase().includes(inputValue.toLowerCase()))
                        )
                      }
                      noOptionsText="Tedarikçi bulunamadı"
                    />
                  </Grid>

                  {/* Kategori */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Kategori</InputLabel>
                      <Select
                        value={formData.category || ''}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <MenuItem value="stratejik">Stratejik</MenuItem>
                        <MenuItem value="kritik">Kritik</MenuItem>
                        <MenuItem value="rutin">Rutin</MenuItem>
                        <MenuItem value="genel">Genel</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Eşleştirme Nedeni */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Eşleştirme Nedeni"
                      multiline
                      rows={3}
                      value={formData.reason || ''}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Bu eşleştirmenin nedenini açıklayın (örn: Risk azaltma, yedek tedarik, maliyet optimizasyonu)"
                      helperText="Eşleştirmenin amacını ve gerekçesini belirtin"
                    />
                  </Grid>

                  {/* Önerilen İnceleme Tarihi */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="İlk İnceleme Tarihi"
                      type="date"
                      value={formData.firstReviewDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, firstReviewDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      helperText="Eşleştirmenin ne zaman gözden geçirileceği"
                    />
                  </Grid>

                  {/* İnceleme Periyodu */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>İnceleme Periyodu</InputLabel>
                      <Select
                        value={formData.reviewPeriod || '3'}
                        onChange={(e) => setFormData({ ...formData, reviewPeriod: e.target.value })}
                      >
                        <MenuItem value="1">1 Ay</MenuItem>
                        <MenuItem value="3">3 Ay</MenuItem>
                        <MenuItem value="6">6 Ay</MenuItem>
                        <MenuItem value="12">12 Ay</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Ek Notlar */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Ek Notlar"
                      multiline
                      rows={2}
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Varsa ek bilgiler ve özel durumlar"
                    />
                  </Grid>

                  {/* Risk Değerlendirmesi */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      Risk Değerlendirmesi
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Risk Seviyesi</InputLabel>
                      <Select
                        value={formData.riskLevel || 'düşük'}
                        onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                      >
                        <MenuItem value="düşük">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box width={12} height={12} bgcolor="success.main" borderRadius="50%" />
                            Düşük Risk
                          </Box>
                        </MenuItem>
                        <MenuItem value="orta">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box width={12} height={12} bgcolor="warning.main" borderRadius="50%" />
                            Orta Risk
                          </Box>
                        </MenuItem>
                        <MenuItem value="yüksek">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box width={12} height={12} bgcolor="error.main" borderRadius="50%" />
                            Yüksek Risk
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}

            {dialogType === 'audit' && (
              <Box component="form" sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Denetim Planlama
                    </Typography>
                  </Grid>
                  
                  {/* Tedarikçi Seçimi */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      fullWidth
                      options={suppliers}
                      getOptionLabel={(option) => option.name}
                      value={suppliers.find(s => s.id === formData.supplierId) || null}
                      onChange={(event, newValue) => {
                        setFormData({ ...formData, supplierId: newValue?.id || '' });
                      }}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tedarikçi *"
                          placeholder="Tedarikçi adı yazın veya listeden seçin..."
                          required
                          error={!formData.supplierId}
                          helperText={!formData.supplierId ? "Tedarikçi seçimi zorunludur" : ""}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <BusinessIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box display="flex" alignItems="center" gap={1} width="100%">
                            <BusinessIcon fontSize="small" color="primary" />
                            <Box flex={1}>
                              <Typography variant="body2" fontWeight="500">
                                {option.name}
                              </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Chip 
                                  label={option.type} 
                                  size="small" 
                                  color={option.type === 'onaylı' ? 'success' : 'default'}
                                  sx={{ fontSize: '0.7rem', height: 18 }}
                                />
                                <Chip 
                                  label={`${option.category}`} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 18 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {option.riskLevel} risk
                                </Typography>
                                {option.performanceScore > 0 ? (
                                  <Chip 
                                    label={`${option.performanceScore}%`} 
                                    size="small" 
                                    color={
                                      option.performanceScore >= 90 ? 'success' :  // A Sınıfı
                                      option.performanceScore >= 75 ? 'info' :     // B Sınıfı
                                      option.performanceScore >= 60 ? 'warning' :  // C Sınıfı
                                      'error'                                       // D Sınıfı
                                    }
                                    sx={{ fontSize: '0.7rem', height: 18, ml: 'auto' }}
                                  />
                                ) : (
                                  <Chip 
                                    label="N/A" 
                                    size="small" 
                                    color="default"
                                    sx={{ fontSize: '0.7rem', height: 18, ml: 'auto' }}
                                  />
                                )}
                            </Box>
                            </Box>
                          </Box>
                        </Box>
                      )}
                      noOptionsText="Tedarikçi bulunamadı"
                      loadingText="Yükleniyor..."
                      clearText="Temizle"
                      openText="Aç"
                      closeText="Kapat"
                    />
                  </Grid>

                  {/* Denetim Türü */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Denetim Türü</InputLabel>
                      <Select
                        value={formData.auditType || 'planlı'}
                        onChange={(e) => setFormData({ ...formData, auditType: e.target.value })}
                      >
                        <MenuItem value="planlı">Planlı Denetim</MenuItem>
                        <MenuItem value="ani">Ani Denetim</MenuItem>
                        <MenuItem value="takip">Takip Denetimi</MenuItem>
                        <MenuItem value="acil">Acil Denetim</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Denetim Tarihi */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Denetim Tarihi"
                      type="date"
                      value={formData.auditDate || ''}
                      onChange={(e) => setFormData({ ...formData, auditDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>

                  {/* Denetçi */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Denetçi Adı"
                      value={formData.auditorName || ''}
                      onChange={(e) => setFormData({ ...formData, auditorName: e.target.value })}
                      required
                    />
                  </Grid>

                  {/* Denetim Durumu */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Denetim Durumu</InputLabel>
                      <Select
                        value={formData.status || 'planlı'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <MenuItem value="planlı">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box width={8} height={8} bgcolor="primary.main" borderRadius="50%" />
                            Planlı
                          </Box>
                        </MenuItem>
                        <MenuItem value="devam_ediyor">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box width={8} height={8} bgcolor="info.main" borderRadius="50%" />
                            Devam Ediyor
                          </Box>
                        </MenuItem>
                        <MenuItem value="tamamlandı">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box width={8} height={8} bgcolor="success.main" borderRadius="50%" />
                            Tamamlandı
                          </Box>
                        </MenuItem>
                        <MenuItem value="gecikmiş">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box width={8} height={8} bgcolor="error.main" borderRadius="50%" />
                            Gecikmiş
                          </Box>
                        </MenuItem>
                        <MenuItem value="iptal">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box width={8} height={8} bgcolor="grey.main" borderRadius="50%" />
                            İptal
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Gerçekleştirilen Tarih - sadece tamamlandı veya devam_ediyor durumunda göster */}
                  {(formData.status === 'tamamlandı' || formData.status === 'devam_ediyor') && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Gerçekleştirilen Tarih"
                        type="date"
                        value={formData.actualAuditDate || ''}
                        onChange={(e) => setFormData({ ...formData, actualAuditDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        helperText="Denetimin fiilen gerçekleştirildiği tarih"
                      />
                    </Grid>
                  )}

                  {/* Gecikme Durumu - checkbox */}
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.isDelayed || false}
                          onChange={(e) => setFormData({ ...formData, isDelayed: e.target.checked })}
                          color="warning"
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <WarningIcon fontSize="small" color="warning" />
                          Denetim gecikmiş mi?
                        </Box>
                      }
                    />
                  </Grid>

                  {/* Gecikme Gün Sayısı - sadece gecikme varsa göster */}
                  {formData.isDelayed && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Gecikme Gün Sayısı"
                        type="number"
                        value={formData.delayDays || ''}
                        onChange={(e) => setFormData({ ...formData, delayDays: parseInt(e.target.value) || 0 })}
                        inputProps={{ min: 0, max: 365 }}
                        helperText="Kaç gün gecikti?"
                      />
                    </Grid>
                  )}

                  {/* Gecikme Açıklaması - sadece gecikme varsa göster */}
                  {formData.isDelayed && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Gecikme Açıklaması"
                        multiline
                        rows={3}
                        value={formData.delayReason || ''}
                        onChange={(e) => setFormData({ ...formData, delayReason: e.target.value })}
                        placeholder="Denetimin neden geciktiğini açıklayın (örn: Tedarikçi tesisinde yangın, denetçi hastalığı, üretim yoğunluğu)"
                        helperText="Gecikme nedenini detaylı olarak belirtin"
                        required={formData.isDelayed}
                      />
                    </Grid>
                  )}

                  {/* Denetim Kapsamı */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Denetim Kapsamı"
                      multiline
                      rows={3}
                      value={formData.auditScope || ''}
                      onChange={(e) => setFormData({ ...formData, auditScope: e.target.value })}
                      placeholder="Denetim kapsamını belirtin (örn: Kalite sistemi, üretim süreçleri, doküman kontrolü)"
                    />
                  </Grid>

                  {/* Özel Notlar */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Özel Notlar"
                      multiline
                      rows={2}
                      value={formData.auditNotes || ''}
                      onChange={(e) => setFormData({ ...formData, auditNotes: e.target.value })}
                      placeholder="Denetim ile ilgili özel durumlar veya dikkat edilmesi gerekenler"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color="inherit">
              İptal
            </Button>
            <Button onClick={handleSaveDialog} variant="contained" color="primary">
              {selectedItem ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Tedarikçi Değiştirme Dialog */}
        <Dialog 
          open={switchDialogOpen} 
          onClose={() => setSwitchDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <SwapHorizIcon color="warning" />
              Alternatif Tedarikçiyi Ana Yap
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {selectedPairForSwitch && (
                <>
                  <Typography variant="body1" gutterBottom>
                    <strong>Mevcut Ana Tedarikçi:</strong> {selectedPairForSwitch.primarySupplier?.name || 'Belirtilmemiş'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                    Hangi alternatif tedarikçiyi ana tedarikçi yapmak istiyorsunuz?
                  </Typography>

                  <FormControl fullWidth>
                    <InputLabel>Alternatif Tedarikçi Seçin</InputLabel>
                    <Select
                      value={selectedAlternativeForSwitch}
                      onChange={(e) => setSelectedAlternativeForSwitch(e.target.value)}
                      label="Alternatif Tedarikçi Seçin"
                    >
                      {selectedPairForSwitch.alternativeSuppliers.map((supplier) => (
                        <MenuItem key={supplier.id} value={supplier.id}>
                          <Box display="flex" alignItems="center" gap={1} width="100%">
                            <Box>
                              <Typography variant="body2" fontWeight="500">
                                {supplier.name}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="caption" color="text.secondary">
                                  {supplier.type} • {supplier.category}
                                </Typography>
                                <Chip 
                                  label={`${supplier.performanceScore}%`} 
                                  color={supplier.performanceScore >= 80 ? 'success' : 'warning'} 
                                  size="small" 
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Seçilen tedarikçi ana tedarikçi olacak, mevcut ana tedarikçi alternatif olarak kalacak.
                    </Typography>
                  </FormControl>

                  {/* Performans Karşılaştırması */}
                  {selectedAlternativeForSwitch && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Performans Karşılaştırması
                      </Typography>
                      {(() => {
                        const selectedSupplier = selectedPairForSwitch.alternativeSuppliers.find(s => s.id === selectedAlternativeForSwitch);
                        const currentPrimary = selectedPairForSwitch.primarySupplier;
                        
                        return (
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Box textAlign="center">
                                <Typography variant="body2" color="text.secondary">
                                  Mevcut Ana
                                </Typography>
                                <Typography variant="h6">
                                  {currentPrimary?.performanceScore || 0}%
                                </Typography>
                                <Typography variant="caption">
                                  {currentPrimary?.name}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box textAlign="center">
                                <Typography variant="body2" color="text.secondary">
                                  Yeni Ana
                                </Typography>
                                <Typography variant="h6" color={
                                  (selectedSupplier?.performanceScore || 0) > (currentPrimary?.performanceScore || 0) 
                                    ? 'success.main' : 'warning.main'
                                }>
                                  {selectedSupplier?.performanceScore || 0}%
                                </Typography>
                                <Typography variant="caption">
                                  {selectedSupplier?.name}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        );
                      })()}
                    </Box>
                  )}
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setSwitchDialogOpen(false);
                setSelectedPairForSwitch(null);
                setSelectedAlternativeForSwitch('');
              }} 
              color="inherit"
            >
              İptal
            </Button>
            <Button 
              onClick={handleConfirmSwitch} 
              variant="contained" 
              color="warning"
              disabled={!selectedAlternativeForSwitch}
              startIcon={<SwapHorizIcon />}
            >
              Tedarikçiyi Değiştir
            </Button>
          </DialogActions>
        </Dialog>

        {/* Denetim Gerçekleştirme Dialog */}
        <Dialog 
          open={auditExecutionDialogOpen} 
          onClose={() => setAuditExecutionDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <AssignmentTurnedInIcon color="success" />
              Denetimi Gerçekleştir
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {selectedAuditForExecution && (
                <>
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#ffffff', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                    <Typography variant="h6" gutterBottom>
                      Denetim Bilgileri
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Tedarikçi:
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {suppliers.find(s => s.id === selectedAuditForExecution.supplierId)?.name || 'Bilinmiyor'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Planlanan Tarih:
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {new Date(selectedAuditForExecution.auditDate).toLocaleDateString('tr-TR')}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Denetim Türü:
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {selectedAuditForExecution.auditType === 'planlı' ? 'Planlı' :
                           selectedAuditForExecution.auditType === 'ani' ? 'Ani' :
                           selectedAuditForExecution.auditType === 'takip' ? 'Takip' :
                           selectedAuditForExecution.auditType === 'acil' ? 'Acil' : 'Kapsamlı'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Denetçi:
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {selectedAuditForExecution.auditorName}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Denetim Sonuçları
                    </Typography>

                    {/* Gerçekleşme Tarihi */}
                    <TextField
                      fullWidth
                      type="date"
                      label="Denetim Gerçekleşme Tarihi"
                      value={auditActualDate}
                      onChange={(e) => handleAuditDateChange(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 2 }}
                      helperText="Denetimin gerçekten yapıldığı tarihi seçin"
                    />

                    {/* Gecikme Durumu Uyarısı */}
                    {isDelayed && (
                      <Alert severity="warning" sx={{ mb: 3 }}>
                        <Typography variant="body2" fontWeight="600">
                          DENETİM GECİKMESİ TESPİT EDİLDİ
                        </Typography>
                        <Typography variant="body2">
                          Planlanan tarih: {new Date(selectedAuditForExecution.auditDate).toLocaleDateString('tr-TR')}
                        </Typography>
                        <Typography variant="body2">
                          Gerçekleşme tarihi: {new Date(auditActualDate).toLocaleDateString('tr-TR')}
                        </Typography>
                        <Typography variant="body1" color="error" fontWeight="600">
                          Gecikme süresi: {delayDays} gün
                        </Typography>
                      </Alert>
                    )}

                    {/* Gecikme Açıklaması */}
                    {isDelayed && (
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Gecikme Açıklaması *"
                        value={auditDelayReason}
                        onChange={(e) => setAuditDelayReason(e.target.value)}
                        placeholder="Denetimin neden geciktiğini detaylı olarak açıklayın..."
                        required
                        error={isDelayed && !auditDelayReason.trim()}
                        helperText={isDelayed && !auditDelayReason.trim() ? 
                          "Gecikme durumunda açıklama girmeniz zorunludur" : 
                          "Gecikme nedenini detaylı şekilde belirtiniz"}
                        sx={{ mb: 3 }}
                      />
                    )}
                    
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Denetim Puanı (0-100)
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Slider
                          value={auditScore}
                          onChange={(_, value) => setAuditScore(value as number)}
                          min={0}
                          max={100}
                          step={5}
                          marks={[
                            { value: 0, label: '0' },
                            { value: 25, label: '25' },
                            { value: 50, label: '50' },
                            { value: 75, label: '75' },
                            { value: 100, label: '100' }
                          ]}
                          valueLabelDisplay="on"
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          type="number"
                          value={auditScore}
                          onChange={(e) => setAuditScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          inputProps={{ min: 0, max: 100 }}
                          sx={{ width: 80 }}
                        />
                      </Box>
                      <Box display="flex" justifyContent="center" mt={1}>
                        <Chip
                          label={
                            auditScore >= 90 ? 'A Sınıfı (90-100)' :
                            auditScore >= 75 ? 'B Sınıfı (75-89)' :
                            auditScore >= 60 ? 'C Sınıfı (60-74)' : 'D Sınıfı (0-59)'
                          }
                          color={
                            auditScore >= 90 ? 'success' :
                            auditScore >= 75 ? 'info' :
                            auditScore >= 60 ? 'warning' : 'error'
                          }
                        />
                      </Box>
                    </FormControl>

                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Denetim Bulguları ve Notları"
                      value={auditFindings}
                      onChange={(e) => setAuditFindings(e.target.value)}
                      placeholder="Denetim sırasında tespit edilen bulgular, iyileştirme önerileri ve notlar..."
                      helperText="Her satıra bir bulgu yazabilirsiniz. Bu alanı boş bırakabilirsiniz."
                    />
                  </Box>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setAuditExecutionDialogOpen(false);
                setSelectedAuditForExecution(null);
                setAuditScore(0);
                setAuditFindings('');
                setAuditActualDate('');
                setAuditDelayReason('');
                setDelayDays(0);
                setIsDelayed(false);
              }} 
              color="inherit"
            >
              İptal
            </Button>
            <Button 
              onClick={handleSaveAuditExecution} 
              variant="contained" 
              color="success"
              disabled={auditScore === 0 || !auditActualDate || (isDelayed && !auditDelayReason.trim())}
              startIcon={<AssignmentTurnedInIcon />}
            >
              Denetimi Tamamla
            </Button>
          </DialogActions>
        </Dialog>

        {/* Denetim Detayları Görüntüleme Dialog */}
        <Dialog 
          open={auditDetailsDialogOpen} 
          onClose={() => setAuditDetailsDialogOpen(false)} 
          maxWidth="lg" 
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
                                      <VisibilityIcon color="info" />
              Denetim Detayları
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {selectedAuditForView && (
                <>
                  {/* Temel Bilgiler */}
                  <Paper sx={{ p: 3, mb: 3, bgcolor: '#ffffff' }}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                      Temel Bilgiler
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">Denetim ID:</Typography>
                          <Typography variant="body1" fontWeight="600">{selectedAuditForView.id}</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">Tedarikçi:</Typography>
                          <Typography variant="body1" fontWeight="600">
                            {suppliers.find(s => s.id === selectedAuditForView.supplierId)?.name || 'Bilinmiyor'}
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">Denetim Türü:</Typography>
                          <Chip 
                            label={
                              selectedAuditForView.auditType === 'planlı' ? 'Planlı Denetim' :
                              selectedAuditForView.auditType === 'ani' ? 'Ani Denetim' :
                              selectedAuditForView.auditType === 'takip' ? 'Takip Denetimi' :
                              selectedAuditForView.auditType === 'acil' ? 'Acil Denetim' : 'Kapsamlı Denetim'
                            }
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">Denetçi:</Typography>
                          <Typography variant="body1" fontWeight="600">{selectedAuditForView.auditorName}</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">Durum:</Typography>
                          <Chip 
                            label={
                              selectedAuditForView.status === 'planlı' ? 'Planlı' :
                              selectedAuditForView.status === 'devam_ediyor' ? 'Devam Ediyor' :
                              selectedAuditForView.status === 'tamamlandı' ? 'Tamamlandı' :
                              selectedAuditForView.status === 'gecikmiş' ? 'Gecikmiş' : 'İptal'
                            }
                            color={
                              selectedAuditForView.status === 'tamamlandı' ? 'success' :
                              selectedAuditForView.status === 'devam_ediyor' ? 'info' :
                              selectedAuditForView.status === 'gecikmiş' ? 'error' :
                              selectedAuditForView.status === 'planlı' ? 'warning' : 'default'
                            }
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">Otomatik Planlandı:</Typography>
                          <Chip 
                            label={selectedAuditForView.isAutoScheduled ? 'Evet' : 'Hayır'}
                            color={selectedAuditForView.isAutoScheduled ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Tarih Bilgileri */}
                  <Paper sx={{ p: 3, mb: 3, bgcolor: '#ffffff' }}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'info.main' }}>
                      Tarih Bilgileri
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="body2" color="text.secondary">Planlanan Tarih</Typography>
                          <Typography variant="h6" fontWeight="600" color="primary.main">
                            {new Date(selectedAuditForView.auditDate).toLocaleDateString('tr-TR')}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="body2" color="text.secondary">Gerçekleşen Tarih</Typography>
                          <Typography variant="h6" fontWeight="600" color={selectedAuditForView.actualAuditDate ? 'success.main' : 'text.disabled'}>
                            {selectedAuditForView.actualAuditDate ? 
                              new Date(selectedAuditForView.actualAuditDate).toLocaleDateString('tr-TR') : 
                              'Henüz gerçekleştirilmedi'
                            }
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="body2" color="text.secondary">Sonraki Denetim</Typography>
                          <Typography variant="h6" fontWeight="600" color="warning.main">
                            {new Date(selectedAuditForView.nextAuditDate).toLocaleDateString('tr-TR')}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Gecikme Bilgileri */}
                    {selectedAuditForView.isDelayed && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="600">
                          Bu denetim {selectedAuditForView.delayDays} gün gecikmiştir
                        </Typography>
                        {selectedAuditForView.delayReason && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Gecikme Açıklaması:</strong> {selectedAuditForView.delayReason}
                          </Typography>
                        )}
                      </Alert>
                    )}
                  </Paper>

                  {/* Sonuçlar */}
                  {selectedAuditForView.status === 'tamamlandı' && (
                    <Paper sx={{ p: 3, mb: 3, bgcolor: '#ffffff' }}>
                      <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                        Denetim Sonuçları
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="body2" color="text.secondary">Denetim Puanı</Typography>
                            <Typography variant="h4" fontWeight="700" color="success.main">
                              {selectedAuditForView.score}/100
                            </Typography>
                            <Chip 
                              label={
                                selectedAuditForView.score >= 90 ? 'A Sınıfı (Mükemmel)' :
                                selectedAuditForView.score >= 75 ? 'B Sınıfı (İyi)' :
                                selectedAuditForView.score >= 60 ? 'C Sınıfı (Orta)' : 'D Sınıfı (Zayıf)'
                              }
                              color={
                                selectedAuditForView.score >= 90 ? 'success' :
                                selectedAuditForView.score >= 75 ? 'info' :
                                selectedAuditForView.score >= 60 ? 'warning' : 'error'
                              }
                              sx={{ mt: 1, fontWeight: 600 }}
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ p: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Denetim Bulguları
                            </Typography>
                            {selectedAuditForView.findings && selectedAuditForView.findings.length > 0 ? (
                              <Box sx={{ 
                                maxHeight: 150, 
                                overflow: 'auto',
                                bgcolor: 'white',
                                p: 2,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'grey.300'
                              }}>
                                {selectedAuditForView.findings.map((finding, index) => (
                                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                                    • {finding}
                                  </Typography>
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                Herhangi bir bulgu kaydedilmemiş
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  )}

                  {/* Planlı denetimler için ek bilgi */}
                  {selectedAuditForView.status === 'planlı' && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Bu denetim henüz gerçekleştirilmemiştir. İşlemler kısmından "Denetimi Gerçekleştir" butonuna tıklayarak denetimi başlatabilirsiniz.
                      </Typography>
                    </Alert>
                  )}
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAuditDetailsDialogOpen(false)} color="inherit">
              Kapat
            </Button>
            {selectedAuditForView?.status === 'planlı' && (
              <Button 
                onClick={() => {
                  setAuditDetailsDialogOpen(false);
                  if (selectedAuditForView) {
                    handleExecuteAudit(selectedAuditForView);
                  }
                }} 
                variant="contained" 
                color="success"
                startIcon={<AssignmentTurnedInIcon />}
              >
                Denetimi Gerçekleştir
              </Button>
            )}
            {selectedAuditForView?.status === 'tamamlandı' && (
              <Button 
                onClick={() => {
                  setAuditDetailsDialogOpen(false);
                  if (selectedAuditForView) {
                    handleEditItem(selectedAuditForView, 'audit');
                  }
                }} 
                variant="outlined" 
                color="primary"
                startIcon={<EditIcon />}
              >
                Düzenle
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Denetim Tarihi Düzenleme Dialog */}
        <Dialog open={auditDateDialogOpen} onClose={() => setAuditDateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <ScheduleIcon color="primary" />
              Denetim Tarihi Düzenle
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {selectedSupplierForAudit && (
                <>
                  <Typography variant="body1" gutterBottom>
                    <strong>Tedarikçi:</strong> {selectedSupplierForAudit.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                    Mevcut denetim tarihi: {new Date(selectedSupplierForAudit.nextAuditDate).toLocaleDateString('tr-TR')}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Yeni Denetim Tarihi"
                    type="date"
                    value={newAuditDate}
                    onChange={(e) => setNewAuditDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    helperText="Denetim için yeni tarih seçin"
                  />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAuditDateDialogOpen(false)} color="inherit">
              İptal
            </Button>
            <Button 
              onClick={handleSaveAuditDate} 
              variant="contained" 
              color="primary"
              disabled={!newAuditDate}
            >
              Tarihi Güncelle
            </Button>
                   </DialogActions>
         </Dialog>

        {/* Denetim Dosya Ekleri Dialog */}
        <Dialog open={auditAttachmentsDialogOpen} onClose={() => setAuditAttachmentsDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <AttachFileIcon color="primary" />
              Denetim Dosya Ekleri
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {selectedAuditForAttachments && (
                <>
                  <Typography variant="body1" gutterBottom>
                    <strong>Tedarikçi:</strong> {suppliers.find(s => s.id === selectedAuditForAttachments.supplierId)?.name || 'Bilinmiyor'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                    Denetim Tarihi: {new Date(selectedAuditForAttachments.auditDate).toLocaleDateString('tr-TR')}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom>
                    Dosya Ekleri ({selectedAuditForAttachments.attachments?.length || 0})
                  </Typography>
                  
                  {selectedAuditForAttachments.attachments && selectedAuditForAttachments.attachments.length > 0 ? (
                    <List>
                      {selectedAuditForAttachments.attachments.map((attachment, index) => (
                        <ListItem 
                          key={attachment.id} 
                          sx={{ 
                            border: '1px solid',
                            borderColor: 'grey.300',
                            borderRadius: 1,
                            mb: 1,
                            bgcolor: 'grey.50'
                          }}
                        >
                          <ListItemIcon>
                            <AttachFileIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={attachment.name}
                            secondary={
                              <Box display="flex" gap={2}>
                                <Typography variant="caption">
                                  {formatFileSize(attachment.size)}
                                </Typography>
                                <Typography variant="caption">
                                  {new Date(attachment.uploadDate).toLocaleDateString('tr-TR')}
                                </Typography>
                              </Box>
                            }
                          />
                          <Box display="flex" gap={1}>
                            <Tooltip title="Görüntüle" arrow>
                              <IconButton 
                                size="small" 
                                color="info"
                                onClick={() => handleAuditViewAttachment(attachment)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="İndir" arrow>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleAuditDownloadAttachment(attachment)}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sil" arrow>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleAuditDeleteAttachment(selectedAuditForAttachments.id, attachment.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box textAlign="center" py={4}>
                      <AttachFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Bu denetim için henüz dosya eklenmemiş
                      </Typography>
                    </Box>
                  )}

                  {/* Dosya Ekleme Butonları */}
                  <Box mt={3} display="flex" justifyContent="center">
                    <input
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                      id={`audit-file-upload-dialog-${selectedAuditForAttachments.id}`}
                      type="file"
                      onChange={(e) => handleAuditFileUpload(e, selectedAuditForAttachments.id)}
                    />
                    <label htmlFor={`audit-file-upload-dialog-${selectedAuditForAttachments.id}`}>
                      <Button
                        variant="contained"
                        color="primary"
                        component="span"
                        startIcon={<UploadIcon />}
                      >
                        Dosya Ekle
                      </Button>
                    </label>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                    PDF, DOC, DOCX, JPG, PNG dosyaları yükleyebilirsiniz (Max 10MB)
                  </Typography>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAuditAttachmentsDialogOpen(false)} color="inherit">
              Kapat
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
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ErrorBoundary>
  );
};

export default SupplierQualityManagement; 