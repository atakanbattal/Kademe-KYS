import React, { useState, useMemo, memo, useCallback, useEffect, useRef } from 'react';
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
  FormHelperText,
  Autocomplete,
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
  Error as ErrorIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Storage as StorageIcon,
  CleaningServices as CleaningServicesIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useThemeContext } from '../context/ThemeContext';
import {
  ProfessionalCard,
  StatusChip as ProfessionalStatusChip,
  ProfessionalButton,
  ProfessionalTextField,
  ProfessionalAccordion,
  SectionHeader,
  PROFESSIONAL_COLORS,
  SHADOWS,
  TRANSITIONS,
  BORDER_RADIUS,
  SPACING
} from '../shared/components';
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

// ============================================
// EQUIPMENT CALIBRATION PDF STORAGE MANAGER
// ============================================

class EquipmentCalibrationPDFStorage {
  private dbName = 'EquipmentCalibrationDB';
  private dbVersion = 1;
  private storeNames = {
    certificates: 'calibration-certificates',
    images: 'equipment-images'
  };
  
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('❌ EquipmentCalibrationPDFStorage: IndexedDB açılamadı');
        reject(new Error('IndexedDB açılamadı'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('✅ EquipmentCalibrationPDFStorage: IndexedDB başarıyla açıldı');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Kalibrasyon sertifikaları store'u
        if (!db.objectStoreNames.contains(this.storeNames.certificates)) {
          const certificateStore = db.createObjectStore(this.storeNames.certificates, { keyPath: 'id' });
          certificateStore.createIndex('equipmentId', 'equipmentId', { unique: false });
          certificateStore.createIndex('certificateNumber', 'certificateNumber', { unique: false });
          console.log('✅ Kalibrasyon sertifikaları store oluşturuldu');
        }
        
        // Ekipman görselleri store'u
        if (!db.objectStoreNames.contains(this.storeNames.images)) {
          const imageStore = db.createObjectStore(this.storeNames.images, { keyPath: 'id' });
          imageStore.createIndex('equipmentId', 'equipmentId', { unique: false });
          console.log('✅ Ekipman görselleri store oluşturuldu');
        }
      };
    });
  }

  async saveCertificate(certificateData: any): Promise<string> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const certificateId = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const certificate = {
      id: certificateId,
      equipmentId: certificateData.equipmentId,
      certificateNumber: certificateData.certificateNumber,
      fileName: certificateData.fileName,
      fileType: certificateData.fileType,
      fileSize: certificateData.fileSize,
      fileData: certificateData.fileData,
      uploadDate: new Date().toISOString(),
      calibrationDate: certificateData.calibrationDate,
      nextDueDate: certificateData.nextDueDate,
      calibratorName: certificateData.calibratorName,
      calibratorCompany: certificateData.calibratorCompany,
      accreditationNumber: certificateData.accreditationNumber,
      notes: certificateData.notes || ''
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeNames.certificates], 'readwrite');
      const store = transaction.objectStore(this.storeNames.certificates);
      const request = store.add(certificate);

      request.onsuccess = () => {
        console.log('✅ Kalibrasyon sertifikası IndexedDB\'ye kaydedildi:', certificateId);
        resolve(certificateId);
      };

      request.onerror = () => {
        console.error('❌ Kalibrasyon sertifikası kaydedilemedi:', request.error);
        reject(request.error);
      };
    });
  }

  async saveImage(imageData: any): Promise<string> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const image = {
      id: imageId,
      equipmentId: imageData.equipmentId,
      fileName: imageData.fileName,
      fileType: imageData.fileType,
      fileSize: imageData.fileSize,
      fileData: imageData.fileData,
      uploadDate: new Date().toISOString(),
      description: imageData.description || ''
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeNames.images], 'readwrite');
      const store = transaction.objectStore(this.storeNames.images);
      const request = store.add(image);

      request.onsuccess = () => {
        console.log('✅ Ekipman görseli IndexedDB\'ye kaydedildi:', imageId);
        resolve(imageId);
      };

      request.onerror = () => {
        console.error('❌ Ekipman görseli kaydedilemedi:', request.error);
        reject(request.error);
      };
    });
  }

  async getCertificate(certificateId: string): Promise<any> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeNames.certificates], 'readonly');
      const store = transaction.objectStore(this.storeNames.certificates);
      const request = store.get(certificateId);

      request.onsuccess = () => {
        if (request.result) {
          console.log('✅ Kalibrasyon sertifikası IndexedDB\'den alındı:', certificateId);
          resolve(request.result);
        } else {
          console.log('⚠️ Kalibrasyon sertifikası bulunamadı:', certificateId);
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('❌ Kalibrasyon sertifikası alınamadı:', request.error);
        reject(request.error);
      };
    });
  }

  async getImage(imageId: string): Promise<any> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeNames.images], 'readonly');
      const store = transaction.objectStore(this.storeNames.images);
      const request = store.get(imageId);

      request.onsuccess = () => {
        if (request.result) {
          console.log('✅ Ekipman görseli IndexedDB\'den alındı:', imageId);
          resolve(request.result);
        } else {
          console.log('⚠️ Ekipman görseli bulunamadı:', imageId);
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('❌ Ekipman görseli alınamadı:', request.error);
        reject(request.error);
      };
    });
  }

  async getCertificatesByEquipment(equipmentId: string): Promise<any[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeNames.certificates], 'readonly');
      const store = transaction.objectStore(this.storeNames.certificates);
      const index = store.index('equipmentId');
      const request = index.getAll(equipmentId);

      request.onsuccess = () => {
        console.log(`✅ Ekipman sertifikaları alındı (${equipmentId}):`, request.result.length);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Ekipman sertifikaları alınamadı:', request.error);
        reject(request.error);
      };
    });
  }

  async getImagesByEquipment(equipmentId: string): Promise<any[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeNames.images], 'readonly');
      const store = transaction.objectStore(this.storeNames.images);
      const index = store.index('equipmentId');
      const request = index.getAll(equipmentId);

      request.onsuccess = () => {
        console.log(`✅ Ekipman görselleri alındı (${equipmentId}):`, request.result.length);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Ekipman görselleri alınamadı:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteCertificate(certificateId: string): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeNames.certificates], 'readwrite');
      const store = transaction.objectStore(this.storeNames.certificates);
      const request = store.delete(certificateId);

      request.onsuccess = () => {
        console.log('✅ Kalibrasyon sertifikası silindi:', certificateId);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Kalibrasyon sertifikası silinemedi:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteImage(imageId: string): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeNames.images], 'readwrite');
      const store = transaction.objectStore(this.storeNames.images);
      const request = store.delete(imageId);

      request.onsuccess = () => {
        console.log('✅ Ekipman görseli silindi:', imageId);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Ekipman görseli silinemedi:', request.error);
        reject(request.error);
      };
    });
  }

  async clearAllCertificates(): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeNames.certificates], 'readwrite');
      const store = transaction.objectStore(this.storeNames.certificates);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('✅ Tüm kalibrasyon sertifikaları temizlendi');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Sertifikalar temizlenemedi:', request.error);
        reject(request.error);
      };
    });
  }

  async clearAllImages(): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeNames.images], 'readwrite');
      const store = transaction.objectStore(this.storeNames.images);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('✅ Tüm ekipman görselleri temizlendi');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Görseller temizlenemedi:', request.error);
        reject(request.error);
      };
    });
  }

  async getStorageInfo(): Promise<{
    certificateCount: number;
    imageCount: number;
    totalSize: number;
    storageEstimate?: any;
  }> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const [certificates, images] = await Promise.all([
      this.getAllCertificates(),
      this.getAllImages()
    ]);

    let totalSize = 0;
    certificates.forEach(cert => {
      if (cert.fileData) {
        totalSize += cert.fileData.length;
      }
    });
    images.forEach(img => {
      if (img.fileData) {
        totalSize += img.fileData.length;
      }
    });

    let storageEstimate = null;
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        storageEstimate = await navigator.storage.estimate();
      } catch (error) {
        console.warn('Storage estimate alınamadı:', error);
      }
    }

    return {
      certificateCount: certificates.length,
      imageCount: images.length,
      totalSize,
      storageEstimate
    };
  }

  private async getAllCertificates(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeNames.certificates], 'readonly');
      const store = transaction.objectStore(this.storeNames.certificates);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllImages(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeNames.images], 'readonly');
      const store = transaction.objectStore(this.storeNames.images);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Global instance
const equipmentPDFStorage = new EquipmentCalibrationPDFStorage();

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
    )
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

// ============================================
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
  status: 'active' | 'inactive' | 'calibration' | 'out_of_service' | 'scrapped';
  calibrationRequired: boolean;
  calibrationFrequency: number; // months
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  calibrationStatus: 'valid' | 'due' | 'overdue' | 'invalid';
  criticalEquipment: boolean;
  specifications: string;
  operatingManual: string;
  notes: string;
  qrCode?: string;
  // PDF depolama sistemi için güncellenmiş alanlar
  imageIds: string[]; // IndexedDB'deki görsel ID'leri
  certificateIds: string[]; // IndexedDB'deki sertifika ID'leri
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
  // PDF depolama sistemi için güncellenmiş alanlar
  hasCertificateFile: boolean; // Sertifika dosyası var mı?
  certificateFileName?: string; // Dosya adı
  certificateFileSize?: number; // Dosya boyutu
  certificateFileType?: string; // Dosya tipi
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

// Interfaces removed - not currently used in the component

interface FilterState {
  searchTerm: string;
  category: string;
  location: string;
  department: string;
  status: string;
  calibrationStatus: string;
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
  'Boyahane',
  'Büküm',
  'Çatım',
  'Depo',
  'Dış Saha',
  'Elektrik Montaj',
  'Final Kalite Kontrol',
  'Girdi Kalite Kontrol',
  'Kaynakhane',
  'Kesim',
  'Makine İşleme',
  'Mekanik Montaj',
  'Planlama',
  'Proses Kalite Kontrol',
  'Satın Alma',
  'SSH',
  'Stok',
  'Test Sahası',
  'Tesellüm',
  'Torna'
];

const DEPARTMENTS = [
  'Ar-Ge',
  'Girdi Kalite Kontrol',
  'Proses Kalite Kontrol', 
  'Final Kalite Kontrol',
  'Kalite Kontrol Laboratuvarı',
  'Kalite Kontrol Müdürlüğü',
  'Kalite Güvence',
  'Kalite Sistem',
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
  'Güvenlik',
  'SSH'
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
    { id: '12', sicilNo: '012', name: 'Osman Polat', department: 'Depo', position: 'Depo Sorumlusu', email: 'osman.polat@kademe.com', phone: '0532 234 5678', isActive: true },
    { id: '13', sicilNo: '013', name: 'Canan Özdemir', department: 'SSH', position: 'SSH Uzmanı', email: 'canan.ozdemir@kademe.com', phone: '0532 345 6789', isActive: true }
  ];
  
  localStorage.setItem('personnel_data', JSON.stringify(samplePersonnel));
  return samplePersonnel;
};

// Dinamik ölçüm aralıkları - cihaz kategorisine göre
// Alt kategoriye göre ölçüm aralıkları
const getMeasurementRangesBySubCategory = () => {
  const stored = localStorage.getItem('measurement_ranges_by_sub_category');
  const version = localStorage.getItem('measurement_ranges_version');
  
  // Versiyon kontrolü - Yeni cihazlar eklendiğinde cache'i yenile
  // Takometre, Sentil Çakısı, Radius Mastar, Dijital Isı Ölçer, Su Terazisi kontrolü
  if (stored && version === '2.2') {
    try {
      const data = JSON.parse(stored);
      // Yeni eklenen cihazların varlığını kontrol et
      if (data['Takometre - Digital'] && data['Sentil Çakısı - 0.001mm'] && 
          data['Radius Mastar - İç R'] && data['Dijital Isı Ölçer - İnfrared'] && 
          data['Su Terazisi - Standart']) {
        return data;
      }
    } catch (e) {
      console.log('Cache bozuk, yeniden oluşturuluyor...');
    }
  }
  
  // Cache'i temizle ve yeniden oluştur
  localStorage.removeItem('measurement_ranges_by_sub_category');
  localStorage.removeItem('measurement_ranges_version');
  
  const defaultRanges = {
    // Kumpas Çeşitleri - Çok Detaylı
    'Kumpas - Digital': [
      '0-150 mm', '0-200 mm', '0-300 mm', '0-500 mm', '0-600 mm', '0-1000 mm', '0-1500 mm', '0-2000 mm',
      '0-100 mm', '0-125 mm', '0-160 mm', '0-250 mm', '0-400 mm', '0-800 mm', '0-1200 mm',
      // İnç Ölçümler
      '0-6 inch', '0-8 inch', '0-12 inch', '0-20 inch', '0-24 inch', '0-40 inch', '0-60 inch',
      // Özel Aralıklar
      '10-50 mm', '20-100 mm', '50-200 mm', '100-500 mm'
    ],
    'Kumpas - Analog': ['0-150 mm', '0-200 mm', '0-300 mm', '0-125 mm', '0-6 inch', '0-8 inch'],
    'Kumpas - Abaküs': ['0-150 mm', '0-200 mm', '0-300 mm', '0-125 mm', '0-6 inch'],
    'Kumpas - İç Çap': [
      '10-150 mm', '50-200 mm', '100-300 mm', '200-500 mm', '300-800 mm', '500-1200 mm',
      '5-30 mm', '20-100 mm', '80-250 mm', '150-400 mm',
      '0.5-6 inch', '2-10 inch', '4-20 inch', '8-40 inch'
    ],
    'Kumpas - Dış Çap': [
      '0-150 mm', '0-200 mm', '0-300 mm', '0-500 mm', '0-800 mm', '0-1200 mm',
      '0-6 inch', '0-8 inch', '0-12 inch', '0-20 inch', '0-40 inch'
    ],
    'Kumpas - Derinlik': [
      '0-150 mm', '0-200 mm', '0-300 mm', '0-500 mm', '0-600 mm',
      '0-6 inch', '0-8 inch', '0-12 inch', '0-20 inch'
    ],
    'Kumpas - Yükseklik': [
      '0-200 mm', '0-300 mm', '0-500 mm', '0-1000 mm', '0-1500 mm', '0-2000 mm',
      '0-8 inch', '0-12 inch', '0-20 inch', '0-40 inch', '0-60 inch', '0-80 inch'
    ],

    // Mikrometre Çeşitleri - Son Derece Detaylı
    'Mikrometre - Dış Çap': [
      '0-25 mm', '25-50 mm', '50-75 mm', '75-100 mm', '100-125 mm', '125-150 mm', 
      '150-175 mm', '175-200 mm', '200-225 mm', '225-250 mm', '250-275 mm', '275-300 mm', 
      '300-325 mm', '325-350 mm', '350-375 mm', '375-400 mm', '400-425 mm', '425-450 mm',
      '450-475 mm', '475-500 mm', '500-600 mm', '600-700 mm', '700-800 mm', '800-900 mm', '900-1000 mm',
      // İnç Ölçümler
      '0-1 inch', '1-2 inch', '2-3 inch', '3-4 inch', '4-5 inch', '5-6 inch',
      '6-7 inch', '7-8 inch', '8-9 inch', '9-10 inch', '10-12 inch', '12-15 inch', '15-18 inch'
    ],
    'Mikrometre - İç Çap': [
      '5-30 mm', '20-50 mm', '50-75 mm', '75-100 mm', '100-125 mm', '125-150 mm', 
      '150-175 mm', '175-200 mm', '200-250 mm', '250-300 mm', '300-400 mm', '400-500 mm',
      '25-50 mm', '40-65 mm', '60-85 mm', '80-105 mm',
      '0.2-1.2 inch', '0.8-2 inch', '2-3 inch', '3-4 inch', '4-6 inch', '6-8 inch'
    ],
    'Mikrometre - Derinlik': [
      '0-25 mm', '0-50 mm', '0-75 mm', '0-100 mm', '0-150 mm', '0-200 mm', '0-300 mm', '0-400 mm',
      '0-1 inch', '0-2 inch', '0-3 inch', '0-4 inch', '0-6 inch', '0-8 inch', '0-12 inch'
    ],
    'Mikrometre - Dişli': [
      '0-25 mm', '25-50 mm', '50-75 mm', '75-100 mm', '100-125 mm',
      '0-1 inch', '1-2 inch', '2-3 inch', '3-4 inch', '4-5 inch'
    ],
    'Mikrometre - V-Blok': [
      '0-25 mm', '25-50 mm', '50-75 mm', '75-100 mm', '100-125 mm',
      '0-1 inch', '1-2 inch', '2-3 inch', '3-4 inch'
    ],
    'Mikrometre - Boru Duvar Kalınlığı': [
      '0-25 mm', '0-50 mm', '0-75 mm', '5-30 mm', '10-35 mm',
      '0-1 inch', '0-2 inch', '0.2-1.2 inch', '0.4-1.4 inch'
    ],

    // Şerit Metre ve Cetveller
    'Şerit Metre': [
      '0-1000 mm', '0-2000 mm', '0-3000 mm', '0-5000 mm', '0-7500 mm', '0-10000 mm', 
      '0-15000 mm', '0-20000 mm', '0-25000 mm', '0-30000 mm', '0-50000 mm', '0-100000 mm',
      '0-1 m', '0-2 m', '0-3 m', '0-5 m', '0-7.5 m', '0-10 m', '0-15 m', '0-20 m', 
      '0-25 m', '0-30 m', '0-50 m', '0-100 m',
      '0-3 ft', '0-10 ft', '0-16 ft', '0-25 ft', '0-33 ft', '0-50 ft', '0-66 ft', 
      '0-100 ft', '0-164 ft', '0-328 ft'
    ],
    'Cetvel - Çelik': [
      '0-150 mm', '0-200 mm', '0-300 mm', '0-500 mm', '0-1000 mm', '0-1500 mm', '0-2000 mm',
      '0-6 inch', '0-8 inch', '0-12 inch', '0-18 inch', '0-24 inch', '0-36 inch', '0-48 inch'
    ],
    'Cetvel - Alüminyum': [
      '0-300 mm', '0-500 mm', '0-1000 mm', '0-1500 mm', '0-2000 mm', '0-3000 mm',
      '0-12 inch', '0-18 inch', '0-24 inch', '0-36 inch', '0-48 inch', '0-60 inch'
    ],

    // Yükseklik Ölçerler
    'Yükseklik Ölçer - Digital': [
      '0-200 mm', '0-300 mm', '0-500 mm', '0-600 mm', '0-1000 mm', '0-1500 mm', '0-2000 mm',
      '0-8 inch', '0-12 inch', '0-20 inch', '0-24 inch', '0-40 inch', '0-60 inch', '0-80 inch'
    ],
    'Yükseklik Ölçer - Analog': [
      '0-200 mm', '0-300 mm', '0-500 mm', '0-1000 mm',
      '0-8 inch', '0-12 inch', '0-20 inch', '0-40 inch'
    ],

    // Komparatörler
    'Komparatör - Digital': [
      '±0.5 mm', '±1 mm', '±2 mm', '±5 mm', '±10 mm', '±25 mm', '±50 mm',
      '±0.02 inch', '±0.04 inch', '±0.08 inch', '±0.2 inch', '±0.4 inch', '±1 inch', '±2 inch'
    ],
    'Komparatör - Analog': [
      '±0.1 mm', '±0.5 mm', '±1 mm', '±2 mm', '±5 mm', '±10 mm',
      '±0.004 inch', '±0.02 inch', '±0.04 inch', '±0.08 inch', '±0.2 inch', '±0.4 inch'
    ],

    // Açı Ölçüm Cihazları - Detaylı
    'Açı Ölçer - Digital': [
      '0-360°', '±180°', '0-90°', '0-45°', '±90°', '±45°', '0-180°',
      '0-90° x 4 yön', '±30°', '±60°', '0-270°', '±1°', '±2°', '±3°', '±5°', '±10°', '±15°', '±20°', '±25°',
      '0-30°', '0-60°', '0-120°', '0-135°', '0-270°', '0-315°', '±0.5°', '±0.1°', '±0.05°', '±0.02°', '±0.01°'
    ],
    'Açı Ölçer - Analog': [
      '0-180°', '0-90°', '±90°', '±45°', '0-360°', '0-30°', '0-60°', '0-120°', '0-135°', '0-270°', '0-315°',
      '±1°', '±2°', '±3°', '±5°', '±10°', '±15°', '±20°', '±25°', '±30°', '±60°', '±120°'
    ],
    'Gonyometre - Universal': [
      '0-180°', '0-90°', '±180°', '0-360°', '±90°',
      '0° - 320°', '0° - 270°', '0-30°', '0-60°', '0-120°', '0-135°', '0-150°', '0-210°', '0-240°', '0-300°',
      '±1°', '±2°', '±3°', '±5°', '±10°', '±15°', '±20°', '±25°', '±30°', '±45°', '±60°', '±120°'
    ],
    'İnklinometre - Digital': [
      '±90°', '±45°', '0-90°', '±180°', '±30°', '±60°',
      '0-360°', '±5°', '±10°', '±15°', '±1°', '±2°', '±3°', '±20°', '±25°',
      '0-30°', '0-60°', '0-120°', '0-135°', '0-270°', '±0.5°', '±0.1°', '±0.05°', '±0.02°', '±0.01°'
    ],

    // Sıcaklık Ölçüm Cihazları - Kapsamlı
    'Termometre - Digital': [
      '-50°C - +300°C', '-100°C - +500°C', '-200°C - +800°C', '0°C - +100°C', '0°C - +200°C',
      '-40°C - +250°C', '-80°C - +400°C', '-150°C - +600°C', '-30°C - +150°C',
      '-58°F - +572°F', '-148°F - +932°F', '-328°F - +1472°F', '32°F - +212°F', '32°F - +392°F'
    ],
    'PT100 - Sınıf A': [
      '-200°C - +650°C', '-50°C - +300°C', '0°C - +100°C', '-100°C - +400°C', '-150°C - +500°C',
      '-328°F - +1202°F', '-58°F - +572°F', '32°F - +212°F', '-148°F - +752°F'
    ],
    'PT100 - Sınıf B': [
      '-200°C - +650°C', '-50°C - +300°C', '0°C - +100°C', '-100°C - +450°C',
      '-328°F - +1202°F', '-58°F - +572°F', '32°F - +212°F'
    ],
    'Termoçift - K Tipi': [
      '-200°C - +1250°C', '0°C - +1000°C', '200°C - +800°C', '-100°C - +900°C', '100°C - +1200°C',
      '-328°F - +2282°F', '32°F - +1832°F', '392°F - +1472°F', '-148°F - +1652°F'
    ],
    'Termoçift - J Tipi': [
      '-40°C - +750°C', '0°C - +600°C', '100°C - +700°C', '-20°C - +500°C',
      '-40°F - +1382°F', '32°F - +1112°F', '212°F - +1292°F'
    ],
    'Termoçift - T Tipi': [
      '-200°C - +350°C', '-100°C - +200°C', '0°C - +300°C', '-50°C - +250°C',
      '-328°F - +662°F', '-148°F - +392°F', '32°F - +572°F'
    ],

    // Test Ekipmanları - Çok Detaylı
    'Multimetre - Digital': [
      // DC Voltaj
      '0-200 mV DC', '0-2 V DC', '0-20 V DC', '0-200 V DC', '0-1000 V DC',
      // AC Voltaj
      '0-200 mV AC', '0-2 V AC', '0-20 V AC', '0-200 V AC', '0-750 V AC',
      // DC Akım
      '0-200 µA DC', '0-2 mA DC', '0-20 mA DC', '0-200 mA DC', '0-2 A DC', '0-10 A DC', '0-20 A DC',
      // AC Akım
      '0-200 µA AC', '0-2 mA AC', '0-20 mA AC', '0-200 mA AC', '0-2 A AC', '0-10 A AC',
      // Direnç
      '0-200 Ω', '0-2 kΩ', '0-20 kΩ', '0-200 kΩ', '0-2 MΩ', '0-20 MΩ', '0-200 MΩ',
      // Kapasitans
      '0-2 nF', '0-20 nF', '0-200 nF', '0-2 µF', '0-20 µF', '0-200 µF', '0-2000 µF',
      // Frekans
      '0-200 Hz', '0-2 kHz', '0-20 kHz', '0-200 kHz', '0-2 MHz', '0-20 MHz'
    ],
    'Osiloskop - Digital': [
      // Voltaj/Div
      '1 mV/div', '2 mV/div', '5 mV/div', '10 mV/div', '20 mV/div', '50 mV/div',
      '100 mV/div', '200 mV/div', '500 mV/div', '1 V/div', '2 V/div', '5 V/div', '10 V/div',
      // Zaman/Div
      '1 ns/div', '2 ns/div', '5 ns/div', '10 ns/div', '20 ns/div', '50 ns/div',
      '100 ns/div', '200 ns/div', '500 ns/div', '1 µs/div', '2 µs/div', '5 µs/div',
      '10 µs/div', '20 µs/div', '50 µs/div', '100 µs/div', '200 µs/div', '500 µs/div',
      '1 ms/div', '2 ms/div', '5 ms/div', '10 ms/div', '20 ms/div', '50 ms/div',
      '100 ms/div', '200 ms/div', '500 ms/div', '1 s/div', '2 s/div', '5 s/div', '10 s/div',
      // Bant Genişliği
      '20 MHz BW', '50 MHz BW', '100 MHz BW', '200 MHz BW', '500 MHz BW', '1 GHz BW', '2 GHz BW'
    ],

    // Basınç Cihazları - Detaylı
    'Manometre': [
      // Bar Ölçümler
      '0-1 bar', '0-1.6 bar', '0-2.5 bar', '0-4 bar', '0-6 bar', '0-10 bar', '0-16 bar', 
      '0-25 bar', '0-40 bar', '0-60 bar', '0-100 bar', '0-160 bar', '0-250 bar', '0-400 bar', '0-600 bar',
      // PSI Ölçümler
      '0-15 psi', '0-30 psi', '0-60 psi', '0-100 psi', '0-160 psi', '0-300 psi', '0-500 psi',
      '0-1000 psi', '0-1500 psi', '0-3000 psi', '0-5000 psi', '0-10000 psi',
      // kPa Ölçümler
      '0-100 kPa', '0-160 kPa', '0-250 kPa', '0-400 kPa', '0-600 kPa', '0-1000 kPa',
      '0-1600 kPa', '0-2500 kPa', '0-4000 kPa', '0-6000 kPa', '0-10000 kPa'
    ],

    // Hassas Teraziler - Detaylı
    'Hassas Terazi - 0.1mg': [
      '0-82 g', '0-120 g', '0-220 g', '0-320 g', '0-520 g',
      '0-3 oz', '0-4 oz', '0-8 oz', '0-11 oz', '0-18 oz'
    ],
    'Hassas Terazi - 0.01mg': [
      '0-52 g', '0-82 g', '0-120 g', '0-220 g',
      '0-2 oz', '0-3 oz', '0-4 oz', '0-8 oz'
    ],
    'Hassas Terazi - 1mg': [
      '0-220 g', '0-320 g', '0-520 g', '0-820 g', '0-1200 g', '0-2200 g', '0-3200 g', '0-5200 g',
      '0-8 oz', '0-11 oz', '0-18 oz', '0-29 oz', '0-42 oz', '0-78 oz', '0-113 oz', '0-184 oz'
    ],

    // Yeni Ölçüm Cihazları - Genişletilmiş Kategori
    'Takometre - Digital': [
      '0-1000 RPM', '0-2000 RPM', '0-5000 RPM', '0-10000 RPM', '0-15000 RPM', 
      '0-20000 RPM', '0-30000 RPM', '0-50000 RPM', '0-100000 RPM',
      '50-1000 RPM', '100-5000 RPM', '500-10000 RPM', '1000-20000 RPM',
      '5-1000 RPM', '10-5000 RPM', '20-10000 RPM', '100-50000 RPM'
    ],
    'Takometre - Laser': [
      '0-999999 RPM', '1-999999 RPM', '5-999999 RPM', '10-999999 RPM',
      '0-100000 RPM', '0-200000 RPM', '0-500000 RPM',
      '10-100000 RPM', '50-500000 RPM', '100-999999 RPM'
    ],
    'Takometre - Optik': [
      '0-50000 RPM', '0-100000 RPM', '0-200000 RPM', '0-500000 RPM',
      '5-50000 RPM', '10-100000 RPM', '50-200000 RPM', '100-500000 RPM'
    ],

    'Sentil Çakısı - 0.001mm': [
      '0-13 mm', '0-25 mm', '0-30 mm', '0-50 mm', '0-75 mm', '0-100 mm',
      '0-0.5 inch', '0-1 inch', '0-1.2 inch', '0-2 inch', '0-3 inch', '0-4 inch',
      '3-13 mm', '5-25 mm', '10-50 mm', '20-75 mm', '25-100 mm'
    ],
    'Sentil Çakısı - 0.002mm': [
      '0-13 mm', '0-25 mm', '0-50 mm', '0-100 mm', '0-150 mm',
      '0-0.5 inch', '0-1 inch', '0-2 inch', '0-4 inch', '0-6 inch',
      '5-25 mm', '10-50 mm', '25-100 mm', '50-150 mm'
    ],
    'Sentil Çakısı - 0.005mm': [
      '0-25 mm', '0-50 mm', '0-100 mm', '0-150 mm', '0-200 mm',
      '0-1 inch', '0-2 inch', '0-4 inch', '0-6 inch', '0-8 inch',
      '10-50 mm', '25-100 mm', '50-150 mm', '75-200 mm'
    ],

    'Radius Mastar - İç R': [
      'R 1-7 mm', 'R 2-12 mm', 'R 3-17 mm', 'R 7-14 mm', 'R 8-15 mm',
      'R 1-25 mm', 'R 3.5-17 mm', 'R 7-14.5 mm', 'R 15-25 mm',
      'R 0.5-2.5 mm', 'R 1-6 mm', 'R 2.5-12.5 mm', 'R 6-25 mm',
      'R 0.04-0.28 inch', 'R 0.08-0.47 inch', 'R 0.12-0.67 inch',
      'R 0.28-0.55 inch', 'R 0.31-0.59 inch', 'R 0.04-0.98 inch'
    ],
    'Radius Mastar - Dış R': [
      'R 1-7 mm', 'R 2-12 mm', 'R 3-17 mm', 'R 7-14 mm', 'R 8-15 mm',
      'R 1-25 mm', 'R 3.5-17 mm', 'R 7-14.5 mm', 'R 15-25 mm',
      'R 0.5-2.5 mm', 'R 1-6 mm', 'R 2.5-12.5 mm', 'R 6-25 mm',
      'R 0.04-0.28 inch', 'R 0.08-0.47 inch', 'R 0.12-0.67 inch',
      'R 0.28-0.55 inch', 'R 0.31-0.59 inch', 'R 0.04-0.98 inch'
    ],
    'Radius Mastar - Universal': [
      'R 0.5-25 mm', 'R 1-15 mm', 'R 2-20 mm', 'R 3-25 mm', 'R 5-30 mm',
      'R 0.02-0.98 inch', 'R 0.04-0.59 inch', 'R 0.08-0.79 inch',
      'R 0.12-0.98 inch', 'R 0.2-1.18 inch'
    ],

    'Dijital Isı Ölçer - İnfrared': [
      '-50°C - +380°C', '-50°C - +500°C', '-50°C - +800°C', '-50°C - +1000°C',
      '-32°C - +760°C', '-32°C - +1350°C', '-18°C - +1650°C',
      '-60°C - +500°C', '-80°C - +1000°C', '-100°C - +1500°C',
      '-58°F - +716°F', '-58°F - +932°F', '-58°F - +1472°F', '-58°F - +1832°F',
      '-25°F - +1382°F', '-25°F - +2462°F', '0°F - +3002°F'
    ],
    'Dijital Isı Ölçer - Temaslı': [
      '-50°C - +300°C', '-100°C - +500°C', '-200°C - +1000°C', '-250°C - +1200°C',
      '-40°C - +200°C', '-80°C - +400°C', '-150°C - +800°C', '-200°C - +1100°C',
      '-58°F - +572°F', '-148°F - +932°F', '-328°F - +1832°F', '-418°F - +2192°F',
      '-40°F - +392°F', '-112°F - +752°F', '-238°F - +1472°F'
    ],
    'Dijital Isı Ölçer - Problu': [
      '-50°C - +300°C', '-100°C - +400°C', '-200°C - +800°C', '-250°C - +1000°C',
      '-40°C - +150°C', '-60°C - +250°C', '-150°C - +600°C', '-200°C - +900°C',
      '-58°F - +572°F', '-148°F - +752°F', '-328°F - +1472°F', '-418°F - +1832°F',
      '-40°F - +302°F', '-76°F - +482°F', '-238°F - +1112°F'
    ],

    // Su Terazisi Çeşitleri
    'Su Terazisi - Standart': [
      '0-90°', '±45°', '±30°', '±15°', '±10°', '±5°', 
      '0-180°', '±90°', '±60°', '±20°', '±1°', '±0.5°',
      '0-30°', '0-60°', '0-120°', '0-135°', '0-270°', '±2°', '±3°', '±25°', '±35°', '±40°',
      '200mm uzunluk', '300mm uzunluk', '400mm uzunluk', '500mm uzunluk',
      '600mm uzunluk', '800mm uzunluk', '1000mm uzunluk', '1200mm uzunluk'
    ],
    'Su Terazisi - Hassas': [
      '±1°', '±0.5°', '±0.2°', '±0.1°', '±0.05°', '±0.02°', '±0.01°',
      '±2°', '±3°', '±0.3°', '±0.4°', '±0.06°', '±0.07°', '±0.08°', '±0.09°', '±0.03°', '±0.04°',
      '±0.5 mm/m', '±0.2 mm/m', '±0.1 mm/m', '±0.05 mm/m', '±0.02 mm/m',
      '±0.3 mm/m', '±0.4 mm/m', '±0.06 mm/m', '±0.07 mm/m', '±0.08 mm/m', '±0.09 mm/m', '±0.03 mm/m', '±0.04 mm/m',
      '150mm uzunluk', '200mm uzunluk', '250mm uzunluk', '300mm uzunluk',
      '400mm uzunluk', '500mm uzunluk', '600mm uzunluk'
    ],
    'Su Terazisi - Digital': [
      '±90°', '±45°', '±30°', '±15°', '±10°', '±5°', '±1°', '±0.5°',
      '±0.1°', '±0.05°', '±0.02°', '±0.01°', '±0.005°', '±0.002°', '±0.001°',
      '0-360°', '±180°', '±120°', '±60°', '±20°',
      '0-30°', '0-60°', '0-90°', '0-120°', '0-135°', '0-150°', '0-210°', '0-240°', '0-270°', '0-300°', '0-315°',
      '±2°', '±3°', '±25°', '±35°', '±40°', '±0.0005°', '±0.0002°', '±0.0001°',
      '200mm uzunluk', '300mm uzunluk', '400mm uzunluk', '600mm uzunluk', '800mm uzunluk'
    ],

    // Mesafe Ölçüm Cihazları
    'Lazer Mesafe Ölçer': [
      '0-30 m', '0-50 m', '0-80 m', '0-100 m', '0-150 m', '0-200 m', '0-250 m', '0-300 m',
      '0-100 ft', '0-164 ft', '0-262 ft', '0-328 ft', '0-492 ft', '0-656 ft', '0-820 ft', '0-984 ft',
      '0.05-30 m', '0.1-50 m', '0.2-100 m', '0.5-200 m',
      '0.002-98 ft', '0.003-164 ft', '0.007-328 ft', '0.016-656 ft'
    ],
    'Ultrasonik Mesafe Ölçer': [
      '0-1 m', '0-3 m', '0-5 m', '0-10 m', '0-15 m', '0-20 m', '0-30 m', '0-50 m',
      '0.3-15 m', '0.5-20 m', '1-30 m', '2-50 m',
      '0-3 ft', '0-10 ft', '0-16 ft', '0-33 ft', '0-49 ft', '0-66 ft', '0-98 ft', '0-164 ft'
    ],
    'Ultrasonik Kalınlık Ölçer': [
      '0.8-300 mm', '1-500 mm', '2-1000 mm', '0.5-100 mm', '0.1-50 mm',
      '1.2-225 mm (Çelik)', '0.8-200 mm (Alüminyum)', '1.0-300 mm (Plastik)',
      '0.03-12 inch', '0.04-20 inch', '0.08-40 inch', '0.02-4 inch', '0.004-2 inch'
    ],

    // Coating ve Kalınlık Ölçerler
    'Coating Thickness Meter': [
      '0-1500 μm', '0-3000 μm', '0-5000 μm', '0-10000 μm', '0-15000 μm',
      '0-60 mils', '0-120 mils', '0-200 mils', '0-400 mils', '0-600 mils',
      '0-1.5 mm', '0-3 mm', '0-5 mm', '0-10 mm', '0-15 mm'
    ],
    'Pin Type Thickness Meter': [
      '0-500 μm', '0-1000 μm', '0-2000 μm', '0-3000 μm', '0-5000 μm',
      '0-20 mils', '0-40 mils', '0-80 mils', '0-120 mils', '0-200 mils'
    ],
    'Eddy Current Thickness Meter': [
      '0-1000 μm', '0-2000 μm', '0-3000 μm', '0-5000 μm', '0-10000 μm',
      '0-40 mils', '0-80 mils', '0-120 mils', '0-200 mils', '0-400 mils'
    ],

    // Çevresel Ölçüm Cihazları
    'Lüks Ölçer - Digital': [
      '0-50 lx', '0-200 lx', '0-2000 lx', '0-20000 lx', '0-200000 lx',
      '0-4.6 fc', '0-18.6 fc', '0-186 fc', '0-1860 fc', '0-18600 fc',
      '1-50000 lx', '10-200000 lx', '100-999999 lx'
    ],
    'Lüks Ölçer - Analog': [
      '0-100 lx', '0-1000 lx', '0-10000 lx', '0-100000 lx',
      '0-9.3 fc', '0-93 fc', '0-930 fc', '0-9300 fc'
    ],
    'UV Ölçer': [
      '0-20 mW/cm²', '0-200 mW/cm²', '0-2000 mW/cm²', '0-20000 mW/cm²',
      '0-2 W/cm²', '0-20 W/cm²', '280-400 nm (UV)', '315-400 nm (UV-A)',
      '280-315 nm (UV-B)', '200-280 nm (UV-C)'
    ],
    'IR Ölçer': [
      '0-20 mW/cm²', '0-200 mW/cm²', '0-2000 mW/cm²',
      '700-1400 nm (NIR)', '1400-3000 nm (SWIR)', '3000-5000 nm (MWIR)',
      '8000-14000 nm (LWIR)'
    ],

    // Ses ve Titreşim Ölçerler
    'Ses Seviyesi Ölçer': [
      '30-130 dB', '40-140 dB', '50-150 dB', '25-140 dB',
      '30-100 dB (A)', '40-120 dB (A)', '50-130 dB (A)',
      '20-20000 Hz', '31.5-8000 Hz', '100-10000 Hz'
    ],
    'Vibrasyon Ölçer - Digital': [
      '0-200 m/s²', '0-500 m/s²', '0-1000 m/s²', '0-2000 m/s²',
      '0-20 g', '0-50 g', '0-100 g', '0-200 g',
      '10-1000 Hz', '10-10000 Hz', '5-20000 Hz',
      '0-200 mm/s', '0-500 mm/s', '0-1000 mm/s'
    ],
    'Vibrasyon Ölçer - Analog': [
      '0-100 m/s²', '0-200 m/s²', '0-500 m/s²',
      '0-10 g', '0-20 g', '0-50 g',
      '10-1000 Hz', '10-5000 Hz'
    ],

    // Nem ve Atmosferik Ölçerler
    'Nem Ölçer - Digital': [
      '0-100% RH', '5-95% RH', '10-90% RH', '20-80% RH',
      '-40°C - +125°C', '-20°C - +60°C', '0°C - +50°C',
      '-40°F - +257°F', '-4°F - +140°F', '32°F - +122°F'
    ],
    'Nem Ölçer - Analog': [
      '0-100% RH', '10-90% RH', '20-80% RH',
      '-10°C - +50°C', '0°C - +40°C',
      '14°F - +122°F', '32°F - +104°F'
    ],
    'Higrometre': [
      '0-100% RH', '5-95% RH', '10-90% RH',
      '±1% RH', '±2% RH', '±3% RH', '±5% RH'
    ],
    'Barometer - Digital': [
      '300-1100 hPa', '800-1200 hPa', '500-1500 hPa',
      '8.85-32.48 inHg', '23.62-35.43 inHg', '14.76-44.29 inHg',
      '225-825 mmHg', '600-900 mmHg', '375-1125 mmHg'
    ],
    'Barometer - Analog': [
      '960-1060 hPa', '900-1100 hPa', '800-1200 hPa',
      '28.35-31.30 inHg', '26.57-32.48 inHg', '23.62-35.43 inHg'
    ],

    // Basınç Ölçüm Cihazları
    'Dijital Manometre': [
      '0-1 bar', '0-10 bar', '0-100 bar', '0-1000 bar', '0-2000 bar',
      '0-14.5 psi', '0-145 psi', '0-1450 psi', '0-14500 psi', '0-29000 psi',
      '0-100 kPa', '0-1 MPa', '0-10 MPa', '0-100 MPa', '0-200 MPa',
      '-1-0 bar (Vakum)', '-1-1 bar', '-1-10 bar'
    ],
    'Analog Manometre': [
      '0-1.6 bar', '0-6 bar', '0-16 bar', '0-60 bar', '0-160 bar', '0-600 bar',
      '0-23 psi', '0-87 psi', '0-232 psi', '0-870 psi', '0-2320 psi', '0-8700 psi'
    ],
    'Diferansiyel Basınç Ölçer': [
      '0-100 Pa', '0-1 kPa', '0-10 kPa', '0-100 kPa', '0-1 MPa',
      '0-0.4 inH2O', '0-4 inH2O', '0-40 inH2O', '0-400 inH2O',
      '0-25 mmH2O', '0-250 mmH2O', '0-2500 mmH2O', '0-25000 mmH2O'
    ],

    // Elektriksel Ölçüm Cihazları
    'Dijital Multimetre': [
      // DC Voltaj
      '0-200 mV DC', '0-2 V DC', '0-20 V DC', '0-200 V DC', '0-1000 V DC',
      // AC Voltaj
      '0-200 mV AC', '0-2 V AC', '0-20 V AC', '0-200 V AC', '0-750 V AC',
      // DC Akım
      '0-2 mA DC', '0-20 mA DC', '0-200 mA DC', '0-2 A DC', '0-10 A DC', '0-20 A DC',
      // AC Akım
      '0-2 mA AC', '0-20 mA AC', '0-200 mA AC', '0-2 A AC', '0-10 A AC', '0-20 A AC',
      // Direnç
      '0-200 Ω', '0-2 kΩ', '0-20 kΩ', '0-200 kΩ', '0-2 MΩ', '0-20 MΩ', '0-200 MΩ',
      // Frekans
      '0-200 Hz', '0-2 kHz', '0-20 kHz', '0-200 kHz', '0-2 MHz', '0-20 MHz'
    ],
    'Klamp Ampermetre': [
      '0-200 A AC', '0-400 A AC', '0-600 A AC', '0-1000 A AC', '0-2000 A AC',
      '0-200 A DC', '0-400 A DC', '0-600 A DC', '0-1000 A DC',
      '0-20 mA', '0-200 mA', '0-2 A', '0-20 A', '0-200 A'
    ],

    // Kimyasal Ölçüm Cihazları
    'pH Ölçer - Digital': [
      '0-14 pH', '0-14.00 pH', '2-12 pH', '4-10 pH',
      '-2.00-16.00 pH', '0.00-14.00 pH',
      '-1999-1999 mV', '±1999 mV', '±2000 mV'
    ],
    'pH Ölçer - Portable': [
      '0-14 pH', '2-12 pH', '4-10 pH', '6-8 pH',
      '0.0-14.0 pH', '0.00-14.00 pH'
    ],
    'Conductivity Ölçer': [
      '0-200 μS/cm', '0-2000 μS/cm', '0-20000 μS/cm', '0-200000 μS/cm',
      '0-0.2 mS/cm', '0-2 mS/cm', '0-20 mS/cm', '0-200 mS/cm',
      '0-200 ppm', '0-2000 ppm', '0-20000 ppm', '0-100000 ppm'
    ],
    'TDS Ölçer': [
      '0-999 ppm', '0-9999 ppm', '0-99999 ppm',
      '0-999 mg/L', '0-9999 mg/L', '0-99999 mg/L',
      '0-10000 μS/cm', '0-100000 μS/cm'
    ],
    'ORP Ölçer': [
      '-2000-2000 mV', '-1999-1999 mV', '±1999 mV',
      '-2000-0 mV', '0-2000 mV', '-500-500 mV'
    ],
    'Dissolved Oxygen Ölçer': [
      '0-20 mg/L', '0-50 mg/L', '0-100 mg/L',
      '0-20 ppm', '0-50 ppm', '0-100 ppm',
      '0-200% sat', '0-500% sat', '0-1000% sat'
    ],
    'Refraktometre': [
      '0-32% Brix', '0-50% Brix', '0-80% Brix', '0-95% Brix',
      '1.3330-1.5040 nD', '1.3000-1.7000 nD',
      '0-25% Salt', '0-100 g/L', '0-26% Alcohol'
    ],

    // Kaynak İşleri Ölçüm Cihazları
    'Kaynak Akım Ölçer - Digital': [
      '0-50 A', '0-100 A', '0-200 A', '0-300 A', '0-500 A', '0-800 A', '0-1000 A',
      '10-500 A', '20-800 A', '50-1000 A', '100-1500 A', '200-2000 A',
      '0-100 A DC', '0-300 A DC', '0-500 A DC', '0-1000 A DC'
    ],
    'Kaynak Akım Ölçer - Analog': [
      '0-100 A', '0-200 A', '0-300 A', '0-500 A', '0-800 A',
      '0-150 A AC', '0-300 A AC', '0-600 A AC'
    ],
    'Kaynak Voltaj Ölçer - Digital': [
      '0-50 V', '0-100 V', '0-150 V', '0-200 V', '0-250 V', '0-300 V',
      '10-80 V', '15-45 V', '20-60 V', '25-80 V',
      '0-80 V DC', '0-100 V DC', '0-150 V DC'
    ],
    'Kaynak Voltaj Ölçer - RMS': [
      '0-100 V RMS', '0-150 V RMS', '0-200 V RMS', '0-300 V RMS',
      '10-80 V RMS', '20-100 V RMS', '30-150 V RMS'
    ],
    'Gaz Flow Ölçer - Argon': [
      '0-10 L/min', '0-20 L/min', '0-30 L/min', '0-50 L/min', '0-100 L/min',
      '2-15 L/min', '5-25 L/min', '10-50 L/min',
      '0-2.5 CFH', '0-5 CFH', '0-10 CFH', '0-20 CFH', '0-35 CFH'
    ],
    'Gaz Flow Ölçer - CO2': [
      '0-15 L/min', '0-25 L/min', '0-40 L/min', '0-60 L/min',
      '5-20 L/min', '10-35 L/min', '15-50 L/min',
      '0-5 CFH', '0-15 CFH', '0-25 CFH', '0-40 CFH'
    ],
    'Gaz Flow Ölçer - Mixed Gas': [
      '0-20 L/min', '0-35 L/min', '0-50 L/min', '0-80 L/min',
      '5-30 L/min', '10-40 L/min', '0-10 CFH', '0-25 CFH'
    ],
    'Kaynak Penetrasyon Ölçer': [
      '0-5 mm', '0-10 mm', '0-15 mm', '0-25 mm', '0-50 mm',
      '1-8 mm', '2-12 mm', '3-20 mm', '5-35 mm',
      '0-0.2 inch', '0-0.4 inch', '0-0.6 inch', '0-1 inch', '0-2 inch'
    ],
    'Ark Voltaj Ölçer': [
      '10-50 V', '15-80 V', '20-100 V', '25-120 V', '30-150 V',
      '0-80 V RMS', '0-100 V RMS', '0-150 V RMS'
    ],
    'Kaynak Kalitesi Testi': [
      '0-100% Kalite', '0-10 Hata/cm', '0-5 Porosity/cm²',
      '0-50 mm Penetrasyon', '0-20 mm Diş Genişliği'
    ],
    'Heat Input Hesaplayıcı': [
      '0-10 kJ/mm', '0-5 kJ/mm', '0-20 kJ/mm', '0-50 kJ/mm',
      '500-5000 J/mm', '1000-10000 J/mm'
    ],

    // Büküm ve Şekillendirme Ölçümleri
    'Tork Ölçer - Digital': [
      '0-10 Nm', '0-25 Nm', '0-50 Nm', '0-100 Nm', '0-200 Nm', '0-500 Nm', '0-1000 Nm',
      '0-5000 Nm', '0-10000 Nm', '1-50 Nm', '5-200 Nm', '10-500 Nm',
      '0-90 in-lb', '0-180 in-lb', '0-450 in-lb', '0-900 in-lb',
      '0-75 ft-lb', '0-150 ft-lb', '0-370 ft-lb', '0-740 ft-lb'
    ],
    'Tork Ölçer - Analog': [
      '0-50 Nm', '0-100 Nm', '0-200 Nm', '0-500 Nm', '0-1000 Nm',
      '0-180 in-lb', '0-450 in-lb', '0-75 ft-lb', '0-370 ft-lb'
    ],
    'Momentometre': [
      '5-25 Nm', '10-50 Nm', '20-100 Nm', '40-200 Nm', '80-400 Nm',
      '100-500 Nm', '200-1000 Nm', '500-2500 Nm',
      '45-220 in-lb', '90-450 in-lb', '180-900 in-lb'
    ],
    'Büküm Açısı Ölçer': [
      '0-90°', '0-180°', '0-270°', '0-360°', '±90°', '±180°',
      '±45°', '±30°', '±15°', '±10°', '±5°', '±2°', '±1°',
      '0-30°', '0-60°', '0-120°', '0-135°', '0-150°', '0-210°', '0-240°', '0-300°', '0-315°',
      '±3°', '±4°', '±6°', '±7°', '±8°', '±9°', '±12°', '±20°', '±25°', '±35°', '±40°', '±60°', '±120°',
      '±0.5°', '±0.1°', '±0.05°', '±0.02°', '±0.01°'
    ],
    'Spring Back Ölçer': [
      '0-10°', '0-20°', '0-45°', '0-90°', '±5°', '±10°', '±20°',
      '0-5 mm', '0-10 mm', '0-25 mm', '0-50 mm'
    ],
    'Kuvvet Ölçer - Push/Pull': [
      '0-10 N', '0-50 N', '0-100 N', '0-500 N', '0-1000 N', '0-5000 N', '0-10000 N',
      '0-2 kg', '0-5 kg', '0-10 kg', '0-50 kg', '0-100 kg', '0-500 kg', '0-1000 kg',
      '0-2 lbf', '0-10 lbf', '0-50 lbf', '0-100 lbf', '0-500 lbf', '0-1000 lbf', '0-5000 lbf'
    ],
    'Gerilim Ölçer - Strain Gauge': [
      '±500 με', '±1000 με', '±2000 με', '±5000 με', '±10000 με', '±20000 με',
      '0-3000 με', '0-5000 με', '0-10000 με', '0-50000 με'
    ],
    'Elastikiyet Modülü Ölçer': [
      '0-300 GPa', '0-500 GPa', '50-250 GPa', '100-400 GPa',
      '0-45000 ksi', '7000-36000 ksi', '15000-60000 ksi'
    ],

    // Kesim İşleri Ölçüm Cihazları
    'Plazma Kesim Güç Ölçer': [
      '0-50 A', '0-100 A', '0-200 A', '0-400 A', '0-600 A', '0-1000 A',
      '20-130 A', '30-200 A', '50-400 A', '100-800 A'
    ],
    'Lazer Kesim Güç Ölçer': [
      '0-1 kW', '0-2 kW', '0-5 kW', '0-10 kW', '0-20 kW', '0-50 kW',
      '0.5-6 kW', '1-15 kW', '2-25 kW', '5-50 kW'
    ],
    'Su Jeti Basınç Ölçer': [
      '0-1000 bar', '0-2000 bar', '0-3000 bar', '0-4000 bar', '0-6000 bar',
      '500-4000 bar', '1000-6000 bar', '2000-8000 bar',
      '0-14500 psi', '0-30000 psi', '0-60000 psi', '0-87000 psi'
    ],
    'Kesit Pürüzlülük Ölçer': [
      '0-10 μm Ra', '0-25 μm Ra', '0-50 μm Ra', '0-100 μm Ra', '0-200 μm Ra',
      '0.1-20 μm Ra', '0.5-50 μm Ra', '1-100 μm Ra'
    ],
    'Kesim Kenarı Kalitesi Ölçer': [
      'Grade 1-5', 'ISO 9013 Kalite', '0-5 Kalite Sınıfı',
      '0-2 mm Kenar Kalitesi', '0-10° Eğiklik'
    ],
    'Oksijen Saflık Ölçer': [
      '90-100% O2', '95-100% O2', '99-100% O2', '99.5-100% O2',
      '0-25% O2', '0-100% O2', '80-100% O2'
    ],
    'Kesim Hızı Ölçer': [
      '0-10 m/min', '0-50 m/min', '0-100 m/min', '0-500 m/min',
      '0-500 mm/min', '0-2000 mm/min', '0-5000 mm/min'
    ],
    'Kerf Genişliği Ölçer': [
      '0-5 mm', '0-10 mm', '0-20 mm', '0-50 mm',
      '0.1-3 mm', '0.5-8 mm', '1-15 mm'
    ],

    // Boya ve Kaplama Ölçümleri
    'Yaş Film Kalınlığı Ölçer': [
      '0-100 μm', '0-300 μm', '0-500 μm', '0-1000 μm', '0-2000 μm',
      '25-300 μm', '50-500 μm', '100-1000 μm',
      '0-4 mils', '0-12 mils', '0-20 mils', '0-40 mils', '0-80 mils'
    ],
    'Kuru Film Kalınlığı Ölçer': [
      '0-300 μm', '0-500 μm', '0-1000 μm', '0-2000 μm', '0-5000 μm',
      '0-12 mils', '0-20 mils', '0-40 mils', '0-80 mils', '0-200 mils'
    ],
    'Viskozite Ölçer - Rotasyonel': [
      '1-100 cP', '10-10000 cP', '100-100000 cP', '1-1000000 cP',
      '1-200 cP', '10-40000 cP', '100-2000000 cP'
    ],
    'Viskozite Ölçer - Kapiler': [
      '0.3-30000 cSt', '1-100000 cSt', '0.5-20000 cSt',
      '1-1000 cP', '10-100000 cP'
    ],
    'Renk Ölçer - Colorimeter': [
      'L* 0-100', 'a* ±120', 'b* ±120', 'ΔE* 0-100',
      'CIE XYZ', 'RGB 0-255', 'LAB Color Space'
    ],
    'Parlaklık Ölçer - Gloss Meter': [
      '0-100 GU (20°)', '0-200 GU (60°)', '0-1000 GU (85°)',
      '0-100 GU (60°)', '0-1000 GU (20°)', '0-2000 GU (85°)'
    ],
    'Adhesion Test Cihazı': [
      '0-5 MPa', '0-10 MPa', '0-25 MPa', '0-50 MPa',
      '0-725 psi', '0-1450 psi', '0-3625 psi', '0-7250 psi'
    ],
    'Cross Hatch Test Kiti': [
      'ASTM D3359', 'ISO 2409', '0-5 Sınıf',
      '1 mm Grid', '2 mm Grid', '3 mm Grid'
    ],
    'Boya Sıcaklığı Ölçer': [
      '0-100°C', '0-200°C', '0-300°C', '0-500°C',
      '32-212°F', '32-392°F', '32-572°F', '32-932°F'
    ],

    // Montaj İşleri Ölçüm Cihazları
    'Cıvata Momentometesi - Digital': [
      '2-20 Nm', '5-50 Nm', '10-100 Nm', '20-200 Nm', '50-500 Nm',
      '100-1000 Nm', '200-2000 Nm', '500-5000 Nm',
      '18-177 in-lb', '44-442 in-lb', '89-885 in-lb',
      '15-150 ft-lb', '37-370 ft-lb', '74-740 ft-lb'
    ],
    'Cıvata Momentometesi - Klik Tipi': [
      '5-25 Nm', '10-50 Nm', '20-100 Nm', '40-200 Nm', '80-400 Nm',
      '44-221 in-lb', '89-442 in-lb', '177-885 in-lb'
    ],
    'Gap Ölçer - Feeler Gauge': [
      '0.02-1.00 mm', '0.05-2.00 mm', '0.1-5.0 mm',
      '0.0008-0.040 inch', '0.002-0.080 inch', '0.004-0.200 inch'
    ],
    'Clearance Ölçer': [
      '0-5 mm', '0-10 mm', '0-25 mm', '0-50 mm',
      '0-0.2 inch', '0-0.4 inch', '0-1 inch', '0-2 inch'
    ],
    'Fitting Testi Cihazı': [
      '0-1000 N', '0-5000 N', '0-10000 N',
      '0-100 kg', '0-500 kg', '0-1000 kg'
    ],
    'Montaj Toleransı Ölçer': [
      '±0.01 mm', '±0.02 mm', '±0.05 mm', '±0.1 mm', '±0.2 mm',
      '±0.0004 inch', '±0.0008 inch', '±0.002 inch', '±0.004 inch'
    ],
    'Vida Adım Ölçer': [
      'M1-M100', '0.25-6 mm pitch', '4-80 TPI',
      '1/4"-4" UNC/UNF', 'Metric/Imperial'
    ],

    // NDT Cihazları
    'Ultrasonik Flaw Detector': [
      '0-10000 mm (Çelik)', '0-5000 mm (Alüminyum)', '0-2000 mm (Plastik)',
      '0.1-9999 mm', '1-25000 mm', '0.004-400 inch'
    ],
    'Çatlak Derinliği Ölçer': [
      '0-20 mm', '0-50 mm', '0-100 mm', '0-250 mm',
      '0.5-50 mm', '1-100 mm', '0.02-4 inch', '0.04-10 inch'
    ],
    'Porosity Test Cihazı': [
      '0-100% Porosity', '0-50% Void Ratio', '0-20 Vol%',
      '0.1-50% Porozite'
    ],
    'Hardness Tester - Portable': [
      '200-900 HV', '150-650 HB', '20-70 HRC', '80-100 HRA',
      '100-1000 HV', '80-650 HB', '10-80 HRC'
    ],
    'Ferrite Scope': [
      '0-100% Ferrit', '0-50% Ferrit', '0-20% Delta Ferrit',
      'FN 0-100', 'FN 0-50'
    ],

    // Elektrik Montaj Test Cihazları
    'Kontinüite Test Cihazı': [
      '0-200 Ω', '0-2000 Ω', '0-20 kΩ', '0-200 kΩ',
      '0.1-999 Ω', '1-9999 Ω'
    ],
    'Megger - İzolasyon Test': [
      '250V-10 GΩ', '500V-10 GΩ', '1000V-10 GΩ', '2500V-10 GΩ',
      '5000V-100 GΩ', '10000V-1000 GΩ'
    ],
    'ELCB Test Cihazı': [
      '6-500 mA', '10-1000 mA', '30-300 mA',
      '0-300 ms', '0-500 ms', '0-1000 ms'
    ],
    'Faz Sırası Test Cihazı': [
      '80-600 V AC', '100-750 V AC', '90-528 V AC',
      '15-400 Hz', '45-65 Hz', '40-70 Hz'
    ],
    'Motor Test Cihazı': [
      '0-1000 V', '0-200 A', '0-50 Hz', '0-3600 RPM',
      '0-500 HP', '0-375 kW', '0-1000 kW'
    ],
    'Transformatör Test Cihazı': [
      '0-50 kV', '0-100 kV', '0-200 kV', '0-500 kV',
      '0-1000 A', '0-5000 A', '50/60 Hz'
    ],
    'Kablo Test Cihazı': [
      '0-10 km', '0-50 km', '0-100 km', '0-500 km',
      '0-50 MΩ', '0-100 GΩ', '0-1000 GΩ'
    ],
    'Termik Test Cihazı': [
      '0-200°C', '0-500°C', '0-1000°C', '0-1500°C',
      '32-392°F', '32-932°F', '32-1832°F', '32-2732°F'
    ],

    // Ek Kaynaklı İmalat Ölçüm Cihazları
    'Kaynak Kumpası - Digital': [
      '0-150 mm', '0-200 mm', '0-300 mm', '0-500 mm',
      '0-6 inch', '0-8 inch', '0-12 inch', '0-20 inch',
      '10-150 mm', '20-200 mm', '50-300 mm'
    ],
    'Kaynak Kumpası - Analog': [
      '0-150 mm', '0-200 mm', '0-300 mm',
      '0-6 inch', '0-8 inch', '0-12 inch'
    ],
    'Kaynak Kumpası - V-Groove': [
      '0-100 mm', '0-150 mm', '0-200 mm', '0-300 mm',
      '0-4 inch', '0-6 inch', '0-8 inch', '0-12 inch',
      'Φ5-100 mm', 'Φ10-150 mm', 'Φ20-200 mm'
    ],
    'Torkmetre - Mekanik': [
      '5-50 Nm', '10-100 Nm', '20-200 Nm', '50-500 Nm', '100-1000 Nm',
      '200-2000 Nm', '500-5000 Nm', '1000-10000 Nm',
      '45-440 in-lb', '90-880 in-lb', '180-1770 in-lb',
      '15-150 ft-lb', '75-750 ft-lb', '150-1500 ft-lb'
    ],
    'Torkmetre - Elektronik': [
      '1-20 Nm', '2-50 Nm', '5-100 Nm', '10-200 Nm', '20-500 Nm',
      '50-1000 Nm', '100-2000 Nm', '200-5000 Nm',
      '9-177 in-lb', '18-442 in-lb', '44-885 in-lb'
    ],
    'Torkmetre - Pneumatik': [
      '10-100 Nm', '20-200 Nm', '50-500 Nm', '100-1000 Nm',
      '200-2000 Nm', '500-5000 Nm'
    ],
    'Gönye - Çelik': [
      '90°', '45°', '30°', '60°', '120°', '135°',
      '0-90°', '0-180°', '0-360°'
    ],
    'Gönye - Alüminyum': [
      '90°', '45°', '30°', '60°', '120°', '135°'
    ],
    'Gönye - Ayarlanabilir': [
      '0-90°', '0-180°', '0-270°', '0-360°',
      '±45°', '±90°', '±180°'
    ],
    'Gönye - Digital': [
      '0-360°', '±180°', '±90°', '±45°',
      '0.1° Çözünürlük', '0.05° Çözünürlük', '0.01° Çözünürlük'
    ],
    'Terazi - Hassas': [
      '0-200 g ±0.1 mg', '0-500 g ±0.1 mg', '0-1000 g ±1 mg',
      '0-2000 g ±10 mg', '0-5000 g ±100 mg',
      '0-7 oz ±0.000004 oz', '0-18 oz ±0.000004 oz'
    ],
    'Terazi - Endüstriyel': [
      '0-30 kg ±1 g', '0-60 kg ±10 g', '0-150 kg ±50 g',
      '0-300 kg ±100 g', '0-600 kg ±500 g',
      '0-66 lb ±0.002 lb', '0-132 lb ±0.02 lb', '0-330 lb ±0.1 lb'
    ],
    'Terazi - Analitik': [
      '0-220 g ±0.01 mg', '0-320 g ±0.01 mg', '0-520 g ±0.1 mg',
      '0-120 g ±0.001 mg', '0-210 g ±0.01 mg'
    ],
    'Terazi - Platform': [
      '0-50 kg ±10 g', '0-100 kg ±20 g', '0-300 kg ±50 g',
      '0-500 kg ±100 g', '0-1000 kg ±200 g', '0-3000 kg ±500 g',
      '0-110 lb ±0.02 lb', '0-660 lb ±0.2 lb', '0-6600 lb ±1 lb'
    ],
    'Desibelmetre - Digital': [
      '30-130 dB', '30-140 dB', '25-140 dB', '20-140 dB',
      'A-Weighted', 'C-Weighted', 'Z-Weighted',
      'Fast/Slow Response', 'Peak Hold'
    ],
    'Desibelmetre - Analog': [
      '40-120 dB', '50-130 dB', '30-130 dB',
      'A-Weighted', 'C-Weighted'
    ],
    'Desibelmetre - Integrating': [
      '20-140 dB', '30-140 dB', '25-135 dB',
      'LAeq', 'LAFmax', 'LAFmin', 'LA90', 'LA10'
    ],
    'Sertlik Ölçüm Cihazı - Rockwell': [
      '20-88 HRA', '20-100 HRB', '20-70 HRC', '80-100 HRD',
      '70-100 HRE', '60-100 HRF', '30-94 HRG', '80-100 HRH'
    ],
    'Sertlik Ölçüm Cihazı - Shore': [
      '0-100 Shore A', '0-100 Shore D', '0-100 Shore O',
      '20-90 Shore A', '30-95 Shore D'
    ],
    'Sertlik Ölçüm Cihazı - Leeb': [
      '170-960 HLD', '80-1000 HLD', '200-800 HLD',
      'HV 80-940', 'HRC 17-68', 'HRB 13-95'
    ],
    'Mihengir - Granit': [
      '300x200 mm', '500x300 mm', '630x400 mm', '1000x630 mm',
      '1250x800 mm', '1600x1000 mm', '2000x1250 mm',
      'Grade 0', 'Grade 1', 'Grade 2', 'Grade 3'
    ],
    'Mihengir - Döküm': [
      '300x200 mm', '500x300 mm', '630x400 mm', '1000x630 mm',
      '1250x800 mm', 'Grade 1', 'Grade 2', 'Grade 3'
    ],
    'Mihengir - Çelik': [
      '300x200 mm', '500x300 mm', '630x400 mm', '1000x630 mm',
      'Grade 1', 'Grade 2', 'Sertleştirilmiş'
    ],
    'Boya Kalınlık Ölçüm Cihazı - Manyetik': [
      '0-1000 μm', '0-2000 μm', '0-5000 μm', '0-10000 μm',
      '0-40 mils', '0-80 mils', '0-200 mils', '0-400 mils'
    ],
    'Boya Kalınlık Ölçüm Cihazı - Eddy Current': [
      '0-500 μm', '0-1000 μm', '0-2000 μm', '0-5000 μm',
      '0-20 mils', '0-40 mils', '0-80 mils', '0-200 mils'
    ],
    'Kızıl Ötesi Termometre': [
      '-50°C - +550°C', '-30°C - +400°C', '-18°C - +1650°C',
      '0°C - +500°C', '0°C - +1000°C', '0°C - +1800°C',
      '-58°F - +1022°F', '-22°F - +752°F', '32°F - +3002°F'
    ],
    'İnfrared Termometre - Lazer': [
      '-50°C - +800°C', '-30°C - +600°C', '0°C - +1200°C',
      '-58°F - +1472°F', '-22°F - +1112°F', '32°F - +2192°F',
      'Dual Laser', 'Circle Laser', 'Cross Laser'
    ],
    'İnfrared Termometre - Probsuz': [
      '-40°C - +500°C', '-20°C - +350°C', '0°C - +800°C',
      '-40°F - +932°F', '-4°F - +662°F', '32°F - +1472°F'
    ],
    'Mercekli Açı Ölçer': [
      '0-90°', '0-180°', '0-360°', '±90°', '±180°',
      '±1°', '±0.5°', '±0.1°', '±0.05°', '±0.01°'
    ],
    'Mercekli Gönye': [
      '90° ±0.01°', '45° ±0.01°', '30° ±0.01°', '60° ±0.01°',
      '120° ±0.02°', '135° ±0.02°'
    ],
    'Optik Açı Ölçer': [
      '0-360° ±0.001°', '0-180° ±0.001°', '0-90° ±0.0005°',
      '±180° ±0.001°', '±90° ±0.0005°', '±45° ±0.0002°'
    ],
    'Ölçüm Plate\'i - Granit': [
      '300x200 mm', '500x300 mm', '630x400 mm', '800x500 mm',
      '1000x630 mm', '1250x800 mm', '1600x1000 mm', '2000x1250 mm',
      'Grade 0', 'Grade 1', 'Grade 2', 'Grade 3'
    ],
    'Ölçüm Plate\'i - Çelik': [
      '300x200 mm', '500x300 mm', '630x400 mm', '1000x630 mm',
      'Grade 1', 'Grade 2', 'Sertleştirilmiş'
    ],
    'Ölçüm Plate\'i - Döküm': [
      '300x200 mm', '500x300 mm', '630x400 mm', '1000x630 mm',
      '1250x800 mm', 'Grade 1', 'Grade 2'
    ],

    // Varsayılan değerler
    'Diğer': ['0-100', '0-1000', 'Özel Aralık']
  };
  
  localStorage.setItem('measurement_ranges_by_sub_category', JSON.stringify(defaultRanges));
  localStorage.setItem('measurement_ranges_version', '2.2');
  console.log('✅ Yeni ölçüm aralıkları yüklendi:', Object.keys(defaultRanges).length, 'cihaz tipi');
  return defaultRanges;
};

const getMeasurementRangesByCategory = () => {
  // Önce localStorage'dan yükle, yoksa default değerleri oluştur
  const stored = localStorage.getItem('measurement_ranges_by_category');
  // Versiyon kontrolü için - eğer "0 mm" belirsizlik değeri yoksa yeniden yükle
  if (stored) {
    const data = JSON.parse(stored);
    if (!data['Ölçüm Cihazları'] || !data['Ölçüm Cihazları'].includes('25-50 mm')) {
      localStorage.removeItem('measurement_ranges_by_category');
    } else {
      return data;
    }
  }
  
  const defaultRanges = {
  'Ölçüm Cihazları': [
      '0-25 mm', '25-50 mm', '50-75 mm', '75-100 mm', '100-125 mm',
      '125-150 mm', '150-175 mm', '175-200 mm', '200-250 mm', '250-300 mm',
      '300-400 mm', '400-500 mm', '500-600 mm', '600-800 mm', '800-1000 mm',
      '0-50 mm', '0-100 mm', '0-150 mm', '0-200 mm', '0-300 mm', 
      '0-500 mm', '0-1000 mm', '0-1500 mm', '0-2000 mm', '0-3000 mm', 
      '0-5000 mm', '0-10000 mm', 'Diğer'
    ],

    'Açı Ölçüm Cihazları': [
      '0-90°', '0-180°', '0-360°', '0-90° ±90°', '±180°', '±360°',
      '0-30°', '0-45°', '0-60°', '30-90°', '90-180°', '180-270°',
      '270-360°', '0-1° (Hassas)', '0-5° (Hassas)', '0-10° (Hassas)',
      '0-0.1° (Ultra Hassas)', '0-0.01° (Ultra Hassas)', 'Diğer'
    ],

    'Sıcaklık Ölçüm Cihazları': [
      '-50°C - +300°C', '-100°C - +500°C', '-200°C - +800°C',
      '-50°C - +150°C', '-100°C - +300°C', '0°C - +100°C',
      '0°C - +200°C', '0°C - +300°C', '0°C - +500°C', '0°C - +1000°C',
      '-80°C - +200°C', '-40°C - +125°C', '-20°C - +80°C',
      '0°C - +50°C', '10°C - +40°C', 'Diğer'
    ],

  'Test Ekipmanları': [
    '0-10 V', '0-100 V', '0-1000 V', '0-10 A', '0-100 A', 
      '0-1000 A', '0-1 kHz', '0-100 kHz', '0-1 MHz', '0-10 MHz',
      '0-100 MHz', '0-1 GHz', '0-50 Ω', '0-1000 Ω', '0-10 kΩ',
      '0-1 MΩ', '0-100 MΩ', 'Diğer'
  ],
  'Üretim Makineleri': [
    '0-100 kN', '0-500 kN', '0-1000 kN', '0-5000 kN',
      '0-100 Nm', '0-500 Nm', '0-1000 Nm', '0-5000 Nm',
      '0-10000 Nm', '0-50000 Nm', 'Diğer'
  ],
  'Kalite Kontrol Cihazları': [
      '0-25 mm', '25-50 mm', '50-75 mm', '75-100 mm', '100-125 mm',
      '125-150 mm', '150-175 mm', '175-200 mm', '200-250 mm', '250-300 mm',
      '0-50 mm', '0-100 mm', '0-200 mm', '0-300 mm', '0-500 mm', 
      '0-1000 mm', '0-1500 mm', '0-2000 mm', 'Diğer'
  ],
  'Kaynak Ekipmanları': [
    '0-300 A', '0-500 A', '0-1000 A', '10-50 V',
    '20-80 V', '0-100%', 'Diğer'
  ],
  'Elektrikli Cihazlar': [
      '0-12 V', '0-24 V', '0-48 V', '0-110 V', '0-220 V', '0-380 V',
      '0-400 V', '0-500 V', '0-690 V', '0-1000 V', '0-1500 V',
      '0-10 A', '0-50 A', '0-100 A', '0-200 A', '0-500 A', '0-1000 A',
      '0-50 Hz', '0-60 Hz', '0-400 Hz', '0-1000 Hz', '0-10 kHz',
      '0-50 Ω', '0-1000 Ω', '0-10 kΩ', '0-1 MΩ', '0-100 MΩ',
      '0-1000 W', '0-10 kW', '0-100 kW', 'Diğer'
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
      '-50°C - +300°C', '-100°C - +500°C', '-200°C - +800°C',
    '-50°C - +150°C', '-100°C - +300°C', '0-100% RH',
    '0-2000 ppm', '0-10000 lux', 'Diğer'
  ],
  'Laboratuvar Ekipmanları': [
    '0.1-1000 mg', '0.01-100 g', '0.1-10 kg', 
    '-80°C - +200°C', '0-14 pH', 'Diğer'
  ],
  'Diğer': ['Diğer']
  };
  
  localStorage.setItem('measurement_ranges_by_category', JSON.stringify(defaultRanges));
  return defaultRanges;
};

// Alt kategoriye göre ölçüm belirsizlikleri
const getMeasurementUncertaintiesBySubCategory = () => {
  const stored = localStorage.getItem('measurement_uncertainties_by_sub_category');
  const version = localStorage.getItem('measurement_uncertainties_version');
  
  // Versiyon kontrolü - Yeni cihazlar eklendiğinde cache'i yenile
  if (stored && version === '2.3') {
    try {
      const data = JSON.parse(stored);
      // Yeni eklenen cihazların varlığını kontrol et
      if (data['Takometre - Digital'] && data['Sentil Çakısı - 0.001mm'] && 
          data['Radius Mastar - İç R'] && data['Dijital Isı Ölçer - İnfrared'] && 
          data['Su Terazisi - Standart']) {
        return data;
      }
    } catch (e) {
      console.log('Belirsizlik cache bozuk, yeniden oluşturuluyor...');
    }
  }
  
  // Cache'i temizle ve yeniden oluştur
  localStorage.removeItem('measurement_uncertainties_by_sub_category');
  localStorage.removeItem('measurement_uncertainties_version');
  
  const defaultUncertainties = {
    // Kumpas Çeşitleri - Detaylı Belirsizlik Değerleri
    'Kumpas - Digital': [
      '±0.01 mm', '±0.02 mm', '±0.03 mm', '±0.04 mm', '±0.05 mm', 
      '±0.06 mm', '±0.07 mm', '±0.08 mm', '±0.09 mm', '±0.1 mm', 
      '±0.12 mm', '±0.15 mm', '±0.18 mm', '±0.2 mm', '±0.25 mm',
      '±0.0004 inch', '±0.0008 inch', '±0.001 inch', '±0.002 inch', 
      '±0.003 inch', '±0.004 inch', '±0.005 inch', '±0.006 inch', '±0.008 inch'
    ],
    'Kumpas - Analog': [
      '±0.02 mm', '±0.05 mm', '±0.1 mm', '±0.15 mm', '±0.2 mm', '±0.3 mm',
      '±0.0008 inch', '±0.002 inch', '±0.004 inch', '±0.006 inch', '±0.008 inch'
    ],
    'Kumpas - Abaküs': [
      '±0.02 mm', '±0.05 mm', '±0.1 mm', '±0.15 mm',
      '±0.0008 inch', '±0.002 inch', '±0.004 inch', '±0.006 inch'
    ],
    'Kumpas - İç Çap': [
      '±0.01 mm', '±0.02 mm', '±0.03 mm', '±0.04 mm', '±0.05 mm', 
      '±0.06 mm', '±0.08 mm', '±0.1 mm', '±0.12 mm', '±0.15 mm',
      '±0.0004 inch', '±0.0008 inch', '±0.001 inch', '±0.002 inch', 
      '±0.003 inch', '±0.004 inch', '±0.006 inch'
    ],
    'Kumpas - Dış Çap': [
      '±0.01 mm', '±0.02 mm', '±0.03 mm', '±0.04 mm', '±0.05 mm',
      '±0.06 mm', '±0.08 mm', '±0.1 mm', '±0.12 mm', '±0.15 mm',
      '±0.0004 inch', '±0.0008 inch', '±0.001 inch', '±0.002 inch', 
      '±0.003 inch', '±0.004 inch', '±0.006 inch'
    ],
    'Kumpas - Derinlik': [
      '±0.02 mm', '±0.03 mm', '±0.04 mm', '±0.05 mm', '±0.06 mm', 
      '±0.08 mm', '±0.1 mm', '±0.12 mm', '±0.15 mm',
      '±0.0008 inch', '±0.001 inch', '±0.002 inch', '±0.003 inch', 
      '±0.004 inch', '±0.006 inch'
    ],
    'Kumpas - Yükseklik': [
      '±0.02 mm', '±0.03 mm', '±0.04 mm', '±0.05 mm', '±0.06 mm', 
      '±0.08 mm', '±0.1 mm', '±0.15 mm', '±0.2 mm', '±0.25 mm',
      '±0.0008 inch', '±0.001 inch', '±0.002 inch', '±0.003 inch', 
      '±0.004 inch', '±0.006 inch', '±0.008 inch', '±0.01 inch'
    ],

    // Mikrometre Çeşitleri - Son Derece Hassas Belirsizlik Değerleri
    'Mikrometre - Dış Çap': [
      '±0.0005 mm', '±0.001 mm', '±0.0015 mm', '±0.002 mm', '±0.0025 mm',
      '±0.003 mm', '±0.0035 mm', '±0.004 mm', '±0.0045 mm', '±0.005 mm',
      '±0.006 mm', '±0.007 mm', '±0.008 mm', '±0.009 mm', '±0.01 mm',
      '±0.012 mm', '±0.015 mm', '±0.018 mm', '±0.02 mm', '±0.025 mm',
      // İnç değerleri
      '±0.00002 inch', '±0.00004 inch', '±0.00006 inch', '±0.00008 inch',
      '±0.0001 inch', '±0.00012 inch', '±0.00015 inch', '±0.0002 inch',
      '±0.00025 inch', '±0.0003 inch', '±0.0004 inch', '±0.0005 inch',
      '±0.0006 inch', '±0.0008 inch', '±0.001 inch'
    ],
    'Mikrometre - İç Çap': [
      '±0.002 mm', '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm',
      '±0.007 mm', '±0.008 mm', '±0.01 mm', '±0.012 mm', '±0.015 mm',
      '±0.018 mm', '±0.02 mm', '±0.025 mm', '±0.03 mm',
      // İnç değerleri
      '±0.00008 inch', '±0.0001 inch', '±0.00012 inch', '±0.00015 inch',
      '±0.0002 inch', '±0.00025 inch', '±0.0003 inch', '±0.0004 inch',
      '±0.0005 inch', '±0.0006 inch', '±0.0008 inch', '±0.001 inch'
    ],
    'Mikrometre - Derinlik': [
      '±0.002 mm', '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm',
      '±0.008 mm', '±0.01 mm', '±0.012 mm', '±0.015 mm', '±0.02 mm',
      // İnç değerleri
      '±0.00008 inch', '±0.0001 inch', '±0.00012 inch', '±0.00015 inch',
      '±0.0002 inch', '±0.0003 inch', '±0.0004 inch', '±0.0006 inch', '±0.0008 inch'
    ],
    'Mikrometre - Dişli': [
      '±0.002 mm', '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm',
      '±0.008 mm', '±0.01 mm', '±0.012 mm', '±0.015 mm',
      // İnç değerleri
      '±0.00008 inch', '±0.0001 inch', '±0.00012 inch', '±0.00015 inch',
      '±0.0002 inch', '±0.0003 inch', '±0.0004 inch', '±0.0006 inch'
    ],
    'Mikrometre - V-Blok': [
      '±0.002 mm', '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm',
      '±0.008 mm', '±0.01 mm', '±0.012 mm',
      // İnç değerleri
      '±0.00008 inch', '±0.0001 inch', '±0.00012 inch', '±0.00015 inch',
      '±0.0002 inch', '±0.0003 inch', '±0.0004 inch'
    ],
    'Mikrometre - Boru Duvar Kalınlığı': [
      '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm', '±0.008 mm',
      '±0.01 mm', '±0.012 mm', '±0.015 mm',
      // İnç değerleri
      '±0.0001 inch', '±0.00012 inch', '±0.00015 inch', '±0.0002 inch',
      '±0.0003 inch', '±0.0004 inch', '±0.0006 inch'
    ],

    // Şerit Metre ve Cetveller
    'Şerit Metre': [
      // Standart belirsizlikler (Sınıf bazlı)
      '±0.3 mm/m', '±0.5 mm/m', '±1 mm/m', '±1.5 mm/m', '±2 mm/m',
      '±3 mm/m', '±5 mm/m', '±8 mm/m', '±10 mm/m', '±15 mm/m',
      // Mutlak değerler (kısa mesafeler için)
      '±1 mm', '±2 mm', '±3 mm', '±5 mm', '±10 mm', '±15 mm', '±20 mm', '±30 mm', '±50 mm',
      // Sınıf I (Hassas şerit metreler)
      '±(0.1 + 0.1L) mm', '±(0.2 + 0.1L) mm',
      // Sınıf II (Standart şerit metreler)
      '±(0.3 + 0.2L) mm', '±(0.6 + 0.4L) mm',
      // Sınıf III (Genel amaçlı)
      '±(1.5 + 0.3L) mm', '±(3 + 0.5L) mm',
      // İnç değerleri
      '±0.012 inch/ft', '±0.02 inch/ft', '±0.04 inch/ft', '±0.06 inch/ft',
      '±0.08 inch/ft', '±0.12 inch/ft', '±0.2 inch/ft', '±0.3 inch/ft', '±0.5 inch/ft',
      // Mutlak inç değerleri
      '±1/32 inch', '±1/16 inch', '±1/8 inch', '±1/4 inch', '±1/2 inch', '±1 inch'
    ],
    'Cetvel - Çelik': [
      '±0.1 mm', '±0.15 mm', '±0.2 mm', '±0.3 mm', '±0.4 mm', '±0.5 mm',
      '±1 mm', '±1.5 mm', '±2 mm', '±3 mm',
      '±0.004 inch', '±0.006 inch', '±0.008 inch', '±0.012 inch',
      '±0.016 inch', '±0.02 inch', '±0.04 inch', '±0.06 inch', '±0.08 inch'
    ],
    'Cetvel - Alüminyum': [
      '±0.2 mm', '±0.3 mm', '±0.4 mm', '±0.5 mm', '±0.8 mm', '±1 mm',
      '±1.5 mm', '±2 mm', '±3 mm', '±5 mm',
      '±0.008 inch', '±0.012 inch', '±0.016 inch', '±0.02 inch',
      '±0.03 inch', '±0.04 inch', '±0.06 inch', '±0.08 inch', '±0.12 inch', '±0.2 inch'
    ],

    // Yükseklik Ölçerler
    'Yükseklik Ölçer - Digital': [
      '±0.02 mm', '±0.03 mm', '±0.04 mm', '±0.05 mm', '±0.06 mm',
      '±0.08 mm', '±0.1 mm', '±0.12 mm', '±0.15 mm', '±0.2 mm',
      '±0.25 mm', '±0.3 mm', '±0.4 mm', '±0.5 mm',
      // İnç değerleri
      '±0.0008 inch', '±0.001 inch', '±0.0012 inch', '±0.0015 inch',
      '±0.002 inch', '±0.003 inch', '±0.004 inch', '±0.006 inch',
      '±0.008 inch', '±0.01 inch', '±0.012 inch', '±0.015 inch', '±0.02 inch'
    ],
    'Yükseklik Ölçer - Analog': [
      '±0.05 mm', '±0.08 mm', '±0.1 mm', '±0.15 mm', '±0.2 mm',
      '±0.3 mm', '±0.4 mm', '±0.5 mm',
      // İnç değerleri
      '±0.002 inch', '±0.003 inch', '±0.004 inch', '±0.006 inch',
      '±0.008 inch', '±0.012 inch', '±0.016 inch', '±0.02 inch'
    ],

    // Komparatörler
    'Komparatör - Digital': [
      '±0.0002 mm', '±0.0005 mm', '±0.001 mm', '±0.002 mm', '±0.003 mm',
      '±0.005 mm', '±0.01 mm', '±0.02 mm', '±0.05 mm', '±0.1 mm',
      '±0.2 mm', '±0.5 mm', '±1 mm', '±2 mm', '±5 mm',
      // İnç değerleri
      '±0.000008 inch', '±0.00002 inch', '±0.00004 inch', '±0.00008 inch',
      '±0.0001 inch', '±0.0002 inch', '±0.0004 inch', '±0.0008 inch',
      '±0.002 inch', '±0.004 inch', '±0.008 inch', '±0.02 inch', '±0.04 inch',
      '±0.08 inch', '±0.2 inch'
    ],
    'Komparatör - Analog': [
      '±0.001 mm', '±0.002 mm', '±0.005 mm', '±0.01 mm', '±0.02 mm',
      '±0.05 mm', '±0.1 mm', '±0.2 mm', '±0.5 mm', '±1 mm',
      // İnç değerleri
      '±0.00004 inch', '±0.00008 inch', '±0.0002 inch', '±0.0004 inch',
      '±0.0008 inch', '±0.002 inch', '±0.004 inch', '±0.008 inch',
      '±0.02 inch', '±0.04 inch'
    ],

    // Açı Ölçüm Cihazları - Son Derece Detaylı
    'Açı Ölçer - Digital': [
      '±0.001°', '±0.002°', '±0.003°', '±0.005°', '±0.008°', '±0.01°',
      '±0.015°', '±0.02°', '±0.03°', '±0.05°', '±0.08°', '±0.1°',
      '±0.15°', '±0.2°', '±0.3°', '±0.5°', '±1°',
      // Arcmin cinsinden
      '±0.1 arcmin', '±0.2 arcmin', '±0.5 arcmin', '±1 arcmin',
      '±2 arcmin', '±5 arcmin', '±10 arcmin',
      // Arcsec cinsinden
      '±1 arcsec', '±2 arcsec', '±5 arcsec', '±10 arcsec', '±30 arcsec'
    ],
    'Açı Ölçer - Analog': [
      '±0.1°', '±0.2°', '±0.3°', '±0.5°', '±1°', '±2°', '±5°', '±10°',
      // Arcmin cinsinden
      '±5 arcmin', '±10 arcmin', '±15 arcmin', '±30 arcmin'
    ],
    'Gonyometre - Universal': [
      '±1 arcmin', '±2 arcmin', '±5 arcmin', '±10 arcmin', '±15 arcmin',
      '±30 arcmin', '±60 arcmin',
      // Derece cinsinden
      '±0.02°', '±0.05°', '±0.1°', '±0.2°', '±0.5°', '±1°'
    ],
    'İnklinometre - Digital': [
      '±0.01°', '±0.02°', '±0.03°', '±0.05°', '±0.08°', '±0.1°',
      '±0.15°', '±0.2°', '±0.3°', '±0.5°', '±1°',
      // Özel açılar için
      '±0.005° (0-15°)', '±0.01° (15-90°)', '±0.02° (90-180°)'
    ],

    // Sıcaklık Ölçüm Cihazları - Kapsamlı ve Detaylı
    'Termometre - Digital': [
      '±0.01°C', '±0.02°C', '±0.03°C', '±0.05°C', '±0.08°C', '±0.1°C',
      '±0.15°C', '±0.2°C', '±0.3°C', '±0.5°C', '±0.8°C', '±1°C',
      '±1.5°C', '±2°C', '±3°C', '±5°C',
      // Fahrenheit değerleri
      '±0.02°F', '±0.04°F', '±0.06°F', '±0.1°F', '±0.15°F', '±0.2°F',
      '±0.3°F', '±0.4°F', '±0.5°F', '±1°F', '±1.5°F', '±2°F', '±3°F', '±5°F'
    ],
    'PT100 - Sınıf A': [
      '±(0.15 + 0.002|t|)°C', '±(0.27 + 0.004|t|)°F',
      '±0.1°C @ 0°C', '±0.15°C @ 100°C', '±0.35°C @ 200°C',
      '±0.55°C @ 300°C', '±0.75°C @ 400°C', '±0.95°C @ 500°C',
      '±1.15°C @ 600°C', '±1.45°C @ 650°C'
    ],
    'PT100 - Sınıf B': [
      '±(0.3 + 0.005|t|)°C', '±(0.54 + 0.009|t|)°F',
      '±0.3°C @ 0°C', '±0.8°C @ 100°C', '±1.3°C @ 200°C',
      '±1.8°C @ 300°C', '±2.3°C @ 400°C', '±2.8°C @ 500°C',
      '±3.3°C @ 600°C', '±3.6°C @ 650°C'
    ],
    'Termoçift - K Tipi': [
      '±1.5°C (-40°C~375°C)', '±0.4% FS (375°C~1000°C)', 
      '±0.75% FS (1000°C~1200°C)',
      '±2.5°C (-40°C~333°C)', '±0.75% FS (333°C~1200°C)',
      // Fahrenheit
      '±2.7°F (-40°F~705°F)', '±0.4% FS (705°F~1832°F)',
      '±0.75% FS (1832°F~2192°F)'
    ],
    'Termoçift - J Tipi': [
      '±1.5°C (-40°C~375°C)', '±0.4% FS (375°C~750°C)',
      '±2.5°C (-40°C~333°C)', '±0.75% FS (333°C~750°C)',
      // Fahrenheit
      '±2.7°F (-40°F~705°F)', '±0.4% FS (705°F~1382°F)'
    ],
    'Termoçift - T Tipi': [
      '±0.5°C (-40°C~125°C)', '±0.4% FS (125°C~350°C)',
      '±1°C (-40°C~133°C)', '±0.75% FS (133°C~350°C)',
      // Fahrenheit
      '±1°F (-40°F~257°F)', '±0.4% FS (257°F~662°F)'
    ],

    // Test Ekipmanları - Son Derece Detaylı
    'Multimetre - Digital': [
      // DC Voltaj Belirsizlikleri
      '±(0.01% + 2d) DC V', '±(0.02% + 3d) DC V', '±(0.05% + 5d) DC V',
      '±(0.08% + 8d) DC V', '±(0.1% + 10d) DC V', '±(0.15% + 15d) DC V',
      '±(0.2% + 20d) DC V', '±(0.3% + 30d) DC V', '±(0.5% + 50d) DC V',
      // AC Voltaj Belirsizlikleri
      '±(0.05% + 5d) AC V', '±(0.1% + 10d) AC V', '±(0.2% + 20d) AC V',
      '±(0.3% + 30d) AC V', '±(0.5% + 50d) AC V', '±(1% + 100d) AC V',
      // DC Akım Belirsizlikleri
      '±(0.02% + 5d) DC A', '±(0.05% + 8d) DC A', '±(0.1% + 15d) DC A',
      '±(0.2% + 25d) DC A', '±(0.3% + 40d) DC A', '±(0.5% + 60d) DC A',
      // AC Akım Belirsizlikleri
      '±(0.1% + 15d) AC A', '±(0.2% + 25d) AC A', '±(0.3% + 40d) AC A',
      '±(0.5% + 60d) AC A', '±(1% + 100d) AC A',
      // Direnç Belirsizlikleri
      '±(0.01% + 5d) Ω', '±(0.02% + 8d) Ω', '±(0.05% + 15d) Ω',
      '±(0.1% + 25d) Ω', '±(0.2% + 50d) Ω', '±(0.5% + 100d) Ω',
      // Frekans Belirsizlikleri
      '±(0.001% + 2d) Hz', '±(0.002% + 3d) Hz', '±(0.005% + 5d) Hz',
      '±(0.01% + 8d) Hz', '±(0.02% + 15d) Hz'
    ],
    'Osiloskop - Digital': [
      // Voltaj Doğruluğu
      '±1% FS', '±2% FS', '±3% FS', '±5% FS',
      // Zaman Doğruluğu
      '±10 ppm', '±25 ppm', '±50 ppm', '±100 ppm',
      // Bant Genişliği Belirsizlikleri
      '±3 dB @ BW', '±1 dB @ BW/2', '±0.5 dB @ BW/4',
      // Sample Rate Belirsizlikleri
      '±0.01% SR', '±0.02% SR', '±0.05% SR', '±0.1% SR'
    ],

    // Basınç Cihazları - Son Derece Detaylı
    'Manometre': [
      // Sınıf 0.1
      '±0.1% FS (Sınıf 0.1)', '±0.16% FS (Sınıf 0.16)',
      // Sınıf 0.25
      '±0.25% FS (Sınıf 0.25)', '±0.4% FS (Sınıf 0.4)',
      // Sınıf 0.6
      '±0.6% FS (Sınıf 0.6)', '±1% FS (Sınıf 1)',
      // Sınıf 1.6
      '±1.6% FS (Sınıf 1.6)', '±2.5% FS (Sınıf 2.5)',
      // Sınıf 4
      '±4% FS (Sınıf 4)', '±6% FS (Sınıf 6)',
      // Mutlak değerler
      '±0.01 bar', '±0.02 bar', '±0.05 bar', '±0.1 bar',
      '±0.2 bar', '±0.5 bar', '±1 bar', '±2 bar', '±5 bar', '±10 bar',
      // PSI değerleri
      '±0.15 psi', '±0.3 psi', '±0.7 psi', '±1.5 psi',
      '±3 psi', '±7 psi', '±15 psi', '±30 psi', '±70 psi', '±150 psi'
    ],

    // Hassas Teraziler - Çok Detaylı Belirsizlik Analizi
    'Hassas Terazi - 0.1mg': [
      '±0.1 mg (Okunabilirlik)', '±0.2 mg (Tekrarlanabilirlik)',
      '±0.3 mg (Doğrusallık)', '±0.5 mg (Toplam Belirsizlik)',
      '±1 mg (Geniş Aralık)', '±2 mg (Maksimum Yük)',
      // Ounce değerleri
      '±0.000004 oz', '±0.000007 oz', '±0.00001 oz', '±0.000018 oz'
    ],
    'Hassas Terazi - 0.01mg': [
      '±0.01 mg (Okunabilirlik)', '±0.02 mg (Tekrarlanabilirlik)',
      '±0.03 mg (Doğrusallık)', '±0.05 mg (Toplam Belirsizlik)',
      '±0.1 mg (Geniş Aralık)', '±0.2 mg (Maksimum Yük)',
      // Ounce değerleri
      '±0.0000004 oz', '±0.0000007 oz', '±0.000001 oz', '±0.0000018 oz'
    ],
    'Hassas Terazi - 1mg': [
      '±1 mg (Okunabilirlik)', '±2 mg (Tekrarlanabilirlik)',
      '±3 mg (Doğrusallık)', '±5 mg (Toplam Belirsizlik)',
      '±8 mg (Geniş Aralık)', '±10 mg (Maksimum Yük)',
      '±15 mg (Çok Yüksek Yük)', '±20 mg (Maksimum Kapasite)',
      // Ounce değerleri
      '±0.00004 oz', '±0.00007 oz', '±0.0001 oz', '±0.00018 oz',
      '±0.0003 oz', '±0.0004 oz', '±0.0005 oz', '±0.0007 oz'
    ],

    // Yeni Ölçüm Cihazları Belirsizlikleri - Genişletilmiş
    'Takometre - Digital': [
      '±0.01 RPM', '±0.02 RPM', '±0.05 RPM', '±0.1 RPM', '±0.2 RPM', '±0.5 RPM',
      '±1 RPM', '±2 RPM', '±5 RPM', '±10 RPM', '±20 RPM', '±50 RPM',
      '±0.01%', '±0.02%', '±0.05%', '±0.1%', '±0.2%', '±0.5%',
      '±0.01% + 1d', '±0.02% + 1d', '±0.05% + 1d', '±0.1% + 1d',
      '±(0.01% FS + 1 RPM)', '±(0.02% FS + 2 RPM)', '±(0.05% FS + 5 RPM)',
      '±1 sayım', '±2 sayım', '±5 sayım', '±10 sayım'
    ],
    'Takometre - Laser': [
      '±0.01 RPM', '±0.02 RPM', '±0.05 RPM', '±0.1 RPM', '±0.2 RPM',
      '±0.5 RPM', '±1 RPM', '±2 RPM', '±5 RPM', '±10 RPM',
      '±0.01%', '±0.02%', '±0.05%', '±0.1%', '±0.2%',
      '±(0.01% FS + 0.1 RPM)', '±(0.02% FS + 0.2 RPM)', '±(0.05% FS + 0.5 RPM)',
      '±1 sayım', '±2 sayım', '±5 sayım'
    ],
    'Takometre - Optik': [
      '±0.02 RPM', '±0.05 RPM', '±0.1 RPM', '±0.2 RPM', '±0.5 RPM',
      '±1 RPM', '±2 RPM', '±5 RPM', '±10 RPM', '±20 RPM',
      '±0.02%', '±0.05%', '±0.1%', '±0.2%', '±0.5%',
      '±(0.02% FS + 1 RPM)', '±(0.05% FS + 2 RPM)', '±(0.1% FS + 5 RPM)',
      '±1 sayım', '±2 sayım', '±5 sayım', '±10 sayım'
    ],

    'Sentil Çakısı - 0.001mm': [
      '±0.001 mm', '±0.0015 mm', '±0.002 mm', '±0.0025 mm', '±0.003 mm',
      '±0.004 mm', '±0.005 mm', '±0.006 mm', '±0.008 mm', '±0.01 mm',
      '±0.00004 inch', '±0.00006 inch', '±0.00008 inch', '±0.0001 inch',
      '±0.00012 inch', '±0.00015 inch', '±0.0002 inch', '±0.00024 inch',
      '±0.0003 inch', '±0.0004 inch'
    ],
    'Sentil Çakısı - 0.002mm': [
      '±0.002 mm', '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm',
      '±0.008 mm', '±0.01 mm', '±0.012 mm', '±0.015 mm', '±0.02 mm',
      '±0.00008 inch', '±0.00012 inch', '±0.00015 inch', '±0.0002 inch',
      '±0.00024 inch', '±0.0003 inch', '±0.0004 inch', '±0.0005 inch',
      '±0.0006 inch', '±0.0008 inch'
    ],
    'Sentil Çakısı - 0.005mm': [
      '±0.005 mm', '±0.006 mm', '±0.008 mm', '±0.01 mm', '±0.012 mm',
      '±0.015 mm', '±0.02 mm', '±0.025 mm', '±0.03 mm', '±0.04 mm',
      '±0.0002 inch', '±0.00024 inch', '±0.0003 inch', '±0.0004 inch',
      '±0.0005 inch', '±0.0006 inch', '±0.0008 inch', '±0.001 inch',
      '±0.0012 inch', '±0.0015 inch'
    ],

    'Radius Mastar - İç R': [
      '±0.002 mm', '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm',
      '±0.008 mm', '±0.01 mm', '±0.012 mm', '±0.015 mm', '±0.02 mm',
      '±0.025 mm', '±0.03 mm', '±0.04 mm', '±0.05 mm',
      '±0.00008 inch', '±0.00012 inch', '±0.00015 inch', '±0.0002 inch',
      '±0.00024 inch', '±0.0003 inch', '±0.0004 inch', '±0.0005 inch',
      '±0.0006 inch', '±0.0008 inch', '±0.001 inch', '±0.0012 inch',
      '±0.0015 inch', '±0.002 inch'
    ],
    'Radius Mastar - Dış R': [
      '±0.002 mm', '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm',
      '±0.008 mm', '±0.01 mm', '±0.012 mm', '±0.015 mm', '±0.02 mm',
      '±0.025 mm', '±0.03 mm', '±0.04 mm', '±0.05 mm',
      '±0.00008 inch', '±0.00012 inch', '±0.00015 inch', '±0.0002 inch',
      '±0.00024 inch', '±0.0003 inch', '±0.0004 inch', '±0.0005 inch',
      '±0.0006 inch', '±0.0008 inch', '±0.001 inch', '±0.0012 inch',
      '±0.0015 inch', '±0.002 inch'
    ],
    'Radius Mastar - Universal': [
      '±0.003 mm', '±0.004 mm', '±0.005 mm', '±0.006 mm', '±0.008 mm',
      '±0.01 mm', '±0.012 mm', '±0.015 mm', '±0.02 mm', '±0.025 mm',
      '±0.03 mm', '±0.04 mm', '±0.05 mm', '±0.06 mm', '±0.08 mm',
      '±0.00012 inch', '±0.00015 inch', '±0.0002 inch', '±0.00024 inch',
      '±0.0003 inch', '±0.0004 inch', '±0.0005 inch', '±0.0006 inch',
      '±0.0008 inch', '±0.001 inch', '±0.0012 inch', '±0.0015 inch',
      '±0.002 inch', '±0.0024 inch', '±0.003 inch'
    ],

    'Dijital Isı Ölçer - İnfrared': [
      '±0.1°C', '±0.2°C', '±0.3°C', '±0.5°C', '±0.8°C', '±1°C',
      '±1.5°C', '±2°C', '±3°C', '±5°C', '±8°C', '±10°C', '±15°C',
      '±0.2°F', '±0.4°F', '±0.5°F', '±1°F', '±1.5°F', '±2°F',
      '±3°F', '±4°F', '±5°F', '±9°F', '±15°F', '±18°F', '±27°F',
      // Yüzde tabanlı belirsizlikler
      '±0.5% FS', '±1% FS', '±1.5% FS', '±2% FS', '±3% FS', '±5% FS',
      // Kombinasyon belirsizlikler
      '±(0.5% FS + 1°C)', '±(1% FS + 1°C)', '±(1% FS + 2°C)',
      '±(1.5% FS + 3°C)', '±(2% FS + 5°C)'
    ],
    'Dijital Isı Ölçer - Temaslı': [
      '±0.05°C', '±0.1°C', '±0.15°C', '±0.2°C', '±0.3°C', '±0.5°C',
      '±0.8°C', '±1°C', '±1.5°C', '±2°C', '±3°C', '±5°C',
      '±0.1°F', '±0.2°F', '±0.3°F', '±0.4°F', '±0.5°F', '±1°F',
      '±1.5°F', '±2°F', '±3°F', '±4°F', '±5°F', '±9°F',
      // Standart tip sensörler için
      '±(0.1% FS + 0.1°C)', '±(0.2% FS + 0.2°C)', '±(0.3% FS + 0.3°C)',
      '±(0.5% FS + 0.5°C)', '±(1% FS + 1°C)'
    ],
    'Dijital Isı Ölçer - Problu': [
      '±0.1°C', '±0.15°C', '±0.2°C', '±0.3°C', '±0.5°C', '±0.8°C',
      '±1°C', '±1.5°C', '±2°C', '±3°C', '±5°C', '±8°C',
      '±0.2°F', '±0.3°F', '±0.4°F', '±0.5°F', '±1°F', '±1.5°F',
      '±2°F', '±3°F', '±4°F', '±5°F', '±9°F', '±15°F',
      // Prob tipine göre belirsizlikler
      '±(0.2% FS + 0.2°C)', '±(0.3% FS + 0.3°C)', '±(0.5% FS + 0.5°C)',
      '±(0.8% FS + 0.8°C)', '±(1% FS + 1°C)', '±(1.5% FS + 1.5°C)'
    ],

    // Su Terazisi Belirsizlikleri
    'Su Terazisi - Standart': [
      '±1°', '±0.5°', '±0.2°', '±0.1°', '±0.05°', '±0.02°', '±0.01°',
      '±2°', '±1.5°', '±0.8°', '±0.3°', '±0.15°', '±0.08°', '±0.03°',
      // mm/m cinsinden
      '±1 mm/m', '±0.5 mm/m', '±0.2 mm/m', '±0.1 mm/m', '±0.05 mm/m',
      '±0.02 mm/m', '±0.01 mm/m', '±0.005 mm/m', '±0.002 mm/m',
      // Kabarcık hassasiyeti
      '±1 bölme', '±0.5 bölme', '±0.2 bölme', '±0.1 bölme',
      // İnç birimler
      '±0.04 inch/ft', '±0.02 inch/ft', '±0.008 inch/ft', '±0.004 inch/ft'
    ],
    'Su Terazisi - Hassas': [
      '±0.1°', '±0.05°', '±0.02°', '±0.01°', '±0.005°', '±0.002°', '±0.001°',
      '±0.08°', '±0.03°', '±0.015°', '±0.008°', '±0.003°', '±0.0015°', '±0.0008°',
      // mm/m cinsinden - Hassas Teraziler
      '±0.1 mm/m', '±0.05 mm/m', '±0.02 mm/m', '±0.01 mm/m', '±0.005 mm/m',
      '±0.002 mm/m', '±0.001 mm/m', '±0.0005 mm/m', '±0.0002 mm/m',
      // Arcmin/arcsec cinsinden
      '±6 arcmin', '±3 arcmin', '±1 arcmin', '±30 arcsec', '±15 arcsec',
      '±10 arcsec', '±5 arcsec', '±2 arcsec', '±1 arcsec'
    ],
    'Su Terazisi - Digital': [
      '±0.01°', '±0.005°', '±0.002°', '±0.001°', '±0.0005°', '±0.0002°', '±0.0001°',
      '±0.008°', '±0.003°', '±0.0015°', '±0.0008°', '±0.0003°', '±0.00015°', '±0.00008°',
      // Digital hassasiyet - çok hassas
      '±0.01% FS', '±0.005% FS', '±0.002% FS', '±0.001% FS', '±0.0005% FS',
      // Arcsec cinsinden - Digital
      '±36 arcsec', '±18 arcsec', '±7 arcsec', '±4 arcsec', '±2 arcsec',
      '±1 arcsec', '±0.5 arcsec', '±0.2 arcsec', '±0.1 arcsec',
      // mm/m cinsinden - Digital
      '±0.01 mm/m', '±0.005 mm/m', '±0.002 mm/m', '±0.001 mm/m', '±0.0005 mm/m'
    ],

    // Mesafe Ölçüm Cihazları Belirsizlikleri
    'Lazer Mesafe Ölçer': [
      '±1 mm', '±1.5 mm', '±2 mm', '±3 mm', '±5 mm', '±10 mm',
      '±0.04 inch', '±0.06 inch', '±0.08 inch', '±0.12 inch', '±0.2 inch', '±0.4 inch',
      '±0.05%', '±0.1%', '±0.15%', '±0.2%', '±0.3%', '±0.5%'
    ],
    'Ultrasonik Mesafe Ölçer': [
      '±0.5%', '±1%', '±1.5%', '±2%', '±3%', '±5%',
      '±1 mm', '±2 mm', '±5 mm', '±10 mm', '±20 mm',
      '±0.04 inch', '±0.08 inch', '±0.2 inch', '±0.4 inch', '±0.8 inch'
    ],
    'Ultrasonik Kalınlık Ölçer': [
      '±0.01 mm', '±0.02 mm', '±0.05 mm', '±0.1 mm', '±0.2 mm',
      '±0.0004 inch', '±0.0008 inch', '±0.002 inch', '±0.004 inch', '±0.008 inch',
      '±0.1%', '±0.2%', '±0.5%', '±1%', '±2%'
    ],

    // Coating ve Kalınlık Ölçer Belirsizlikleri
    'Coating Thickness Meter': [
      '±1 μm', '±2 μm', '±5 μm', '±10 μm', '±20 μm', '±50 μm',
      '±0.04 mils', '±0.08 mils', '±0.2 mils', '±0.4 mils', '±0.8 mils', '±2 mils',
      '±1%', '±2%', '±3%', '±5%', '±10%'
    ],
    'Pin Type Thickness Meter': [
      '±2 μm', '±5 μm', '±10 μm', '±20 μm', '±50 μm',
      '±0.08 mils', '±0.2 mils', '±0.4 mils', '±0.8 mils', '±2 mils',
      '±2%', '±3%', '±5%', '±10%'
    ],
    'Eddy Current Thickness Meter': [
      '±1 μm', '±2 μm', '±5 μm', '±10 μm', '±25 μm',
      '±0.04 mils', '±0.08 mils', '±0.2 mils', '±0.4 mils', '±1 mils',
      '±1%', '±2%', '±3%', '±5%'
    ],

    // Çevresel Ölçüm Cihazları Belirsizlikleri
    'Lüks Ölçer - Digital': [
      '±2%', '±3%', '±4%', '±5%', '±7%', '±10%',
      '±1 lx', '±2 lx', '±5 lx', '±10 lx', '±20 lx', '±50 lx',
      '±0.1 fc', '±0.2 fc', '±0.5 fc', '±1 fc', '±2 fc', '±5 fc'
    ],
    'Lüks Ölçer - Analog': [
      '±5%', '±7%', '±10%', '±15%', '±20%',
      '±2 lx', '±5 lx', '±10 lx', '±25 lx', '±50 lx'
    ],
    'UV Ölçer': [
      '±3%', '±5%', '±7%', '±10%', '±15%',
      '±0.1 mW/cm²', '±0.2 mW/cm²', '±0.5 mW/cm²', '±1 mW/cm²', '±2 mW/cm²'
    ],
    'IR Ölçer': [
      '±3%', '±5%', '±7%', '±10%', '±15%',
      '±0.1 mW/cm²', '±0.2 mW/cm²', '±0.5 mW/cm²', '±1 mW/cm²'
    ],

    // Ses ve Titreşim Ölçer Belirsizlikleri
    'Ses Seviyesi Ölçer': [
      '±0.1 dB', '±0.2 dB', '±0.5 dB', '±1 dB', '±1.5 dB', '±2 dB',
      '±0.5%', '±1%', '±1.5%', '±2%', '±3%', '±5%'
    ],
    'Vibrasyon Ölçer - Digital': [
      '±0.5%', '±1%', '±2%', '±3%', '±5%', '±7%', '±10%',
      '±0.1 m/s²', '±0.2 m/s²', '±0.5 m/s²', '±1 m/s²', '±2 m/s²',
      '±0.01 g', '±0.02 g', '±0.05 g', '±0.1 g', '±0.2 g'
    ],
    'Vibrasyon Ölçer - Analog': [
      '±2%', '±3%', '±5%', '±7%', '±10%', '±15%',
      '±0.5 m/s²', '±1 m/s²', '±2 m/s²', '±5 m/s²'
    ],

    // Nem ve Atmosferik Ölçer Belirsizlikleri
    'Nem Ölçer - Digital': [
      '±1% RH', '±1.5% RH', '±2% RH', '±2.5% RH', '±3% RH', '±5% RH',
      '±0.1°C', '±0.2°C', '±0.3°C', '±0.5°C', '±1°C', '±2°C',
      '±0.2°F', '±0.4°F', '±0.5°F', '±0.9°F', '±1.8°F', '±3.6°F'
    ],
    'Nem Ölçer - Analog': [
      '±2% RH', '±3% RH', '±5% RH', '±7% RH', '±10% RH',
      '±0.5°C', '±1°C', '±2°C', '±3°C', '±5°C'
    ],
    'Higrometre': [
      '±1% RH', '±1.5% RH', '±2% RH', '±2.5% RH', '±3% RH', '±5% RH'
    ],
    'Barometer - Digital': [
      '±0.1 hPa', '±0.2 hPa', '±0.3 hPa', '±0.5 hPa', '±1 hPa', '±2 hPa',
      '±0.003 inHg', '±0.006 inHg', '±0.009 inHg', '±0.015 inHg', '±0.03 inHg',
      '±0.1 mmHg', '±0.2 mmHg', '±0.4 mmHg', '±0.8 mmHg', '±1.5 mmHg'
    ],
    'Barometer - Analog': [
      '±1 hPa', '±2 hPa', '±3 hPa', '±5 hPa', '±10 hPa',
      '±0.03 inHg', '±0.06 inHg', '±0.09 inHg', '±0.15 inHg', '±0.3 inHg'
    ],
    'Altimetre': [
      '±1 m', '±2 m', '±5 m', '±10 m', '±20 m', '±50 m',
      '±3 ft', '±7 ft', '±16 ft', '±33 ft', '±66 ft', '±164 ft'
    ],
    'Rüzgar Hızı Ölçer': [
      '±0.1 m/s', '±0.2 m/s', '±0.5 m/s', '±1 m/s', '±2 m/s',
      '±0.2 mph', '±0.4 mph', '±1.1 mph', '±2.2 mph', '±4.5 mph',
      '±2%', '±3%', '±5%', '±7%', '±10%'
    ],
    'Hava Hızı Ölçer': [
      '±0.05 m/s', '±0.1 m/s', '±0.2 m/s', '±0.5 m/s', '±1 m/s',
      '±0.1 mph', '±0.2 mph', '±0.4 mph', '±1.1 mph', '±2.2 mph',
      '±2%', '±3%', '±5%', '±7%', '±10%'
    ],
    'Anemometre': [
      '±0.1 m/s', '±0.2 m/s', '±0.5 m/s', '±1 m/s', '±2 m/s',
      '±0.2 mph', '±0.4 mph', '±1.1 mph', '±2.2 mph', '±4.5 mph',
      '±2%', '±3%', '±5%', '±7%', '±10%'
    ],

    // Basınç Ölçüm Cihazları Belirsizlikleri
    'Dijital Manometre': [
      '±0.01%', '±0.02%', '±0.05%', '±0.1%', '±0.2%', '±0.25%', '±0.5%', '±1%',
      '±0.001 bar', '±0.002 bar', '±0.005 bar', '±0.01 bar', '±0.02 bar', '±0.05 bar',
      '±0.0145 psi', '±0.029 psi', '±0.072 psi', '±0.145 psi', '±0.29 psi', '±0.72 psi',
      '±0.1 kPa', '±0.2 kPa', '±0.5 kPa', '±1 kPa', '±2 kPa', '±5 kPa'
    ],
    'Analog Manometre': [
      '±0.5%', '±1%', '±1.6%', '±2.5%', '±4%', '±6%',
      '±0.008 bar', '±0.016 bar', '±0.025 bar', '±0.04 bar', '±0.064 bar', '±0.096 bar',
      '±0.12 psi', '±0.23 psi', '±0.36 psi', '±0.58 psi', '±0.93 psi', '±1.39 psi'
    ],
    'Diferansiyel Basınç Ölçer': [
      '±0.25%', '±0.5%', '±1%', '±1.5%', '±2%', '±5%',
      '±0.25 Pa', '±0.5 Pa', '±1 Pa', '±2.5 Pa', '±5 Pa', '±25 Pa',
      '±0.001 inH2O', '±0.002 inH2O', '±0.004 inH2O', '±0.01 inH2O', '±0.02 inH2O'
    ],
    'Vakum Ölçer': [
      '±0.5%', '±1%', '±2%', '±3%', '±5%', '±10%',
      '±0.001 mbar', '±0.005 mbar', '±0.01 mbar', '±0.05 mbar', '±0.1 mbar',
      '±0.001 Torr', '±0.004 Torr', '±0.008 Torr', '±0.04 Torr', '±0.08 Torr'
    ],
    'Hidrolik Test Cihazı': [
      '±0.1%', '±0.2%', '±0.5%', '±1%', '±2%', '±5%',
      '±0.1 bar', '±0.2 bar', '±0.5 bar', '±1 bar', '±2 bar', '±5 bar',
      '±1.5 psi', '±2.9 psi', '±7.3 psi', '±14.5 psi', '±29 psi', '±73 psi'
    ],
    'Pneumatik Test Cihazı': [
      '±0.1%', '±0.2%', '±0.5%', '±1%', '±2%', '±3%',
      '±0.01 bar', '±0.02 bar', '±0.05 bar', '±0.1 bar', '±0.2 bar', '±0.3 bar',
      '±0.15 psi', '±0.29 psi', '±0.73 psi', '±1.45 psi', '±2.9 psi', '±4.4 psi'
    ],

    // Elektriksel Ölçüm Cihazları Belirsizlikleri
    'Dijital Multimetre': [
      // DC Voltaj Belirsizlikleri
      '±(0.025% + 5 digit)', '±(0.05% + 5 digit)', '±(0.1% + 5 digit)', '±(0.2% + 5 digit)',
      '±(0.5% + 5 digit)', '±(1% + 5 digit)', '±(2% + 5 digit)',
      // AC Voltaj Belirsizlikleri
      '±(0.5% + 10 digit)', '±(1% + 10 digit)', '±(2% + 10 digit)', '±(3% + 10 digit)',
      // Akım Belirsizlikleri
      '±(0.1% + 3 digit)', '±(0.2% + 3 digit)', '±(0.5% + 3 digit)', '±(1% + 3 digit)',
      // Direnç Belirsizlikleri
      '±(0.05% + 2 digit)', '±(0.1% + 2 digit)', '±(0.2% + 2 digit)', '±(0.5% + 2 digit)',
      // Frekans Belirsizlikleri
      '±(0.01% + 1 digit)', '±(0.02% + 1 digit)', '±(0.05% + 1 digit)', '±(0.1% + 1 digit)'
    ],
    'Analog Multimetre': [
      '±2%', '±3%', '±5%', '±7%', '±10%', '±15%',
      '±0.1 V', '±0.2 V', '±0.5 V', '±1 V', '±2 V', '±5 V',
      '±1 mA', '±2 mA', '±5 mA', '±10 mA', '±20 mA', '±50 mA'
    ],
    'Klamp Ampermetre': [
      '±1%', '±1.5%', '±2%', '±2.5%', '±3%', '±5%', '±7%',
      '±0.1 A', '±0.2 A', '±0.5 A', '±1 A', '±2 A', '±5 A', '±10 A',
      '±1 mA', '±2 mA', '±5 mA', '±10 mA', '±20 mA'
    ],
    'İzolasyon Test Cihazı': [
      '±2%', '±3%', '±5%', '±10%', '±15%',
      '±0.1 MΩ', '±0.2 MΩ', '±0.5 MΩ', '±1 MΩ', '±2 MΩ', '±5 MΩ',
      '±1 V', '±2 V', '±5 V', '±10 V', '±25 V', '±50 V'
    ],
    'Topraklama Test Cihazı': [
      '±2%', '±3%', '±5%', '±10%', '±15%',
      '±0.01 Ω', '±0.02 Ω', '±0.05 Ω', '±0.1 Ω', '±0.2 Ω', '±0.5 Ω'
    ],
    'RCD Test Cihazı': [
      '±1%', '±2%', '±5%', '±10%',
      '±0.1 mA', '±0.2 mA', '±0.5 mA', '±1 mA', '±2 mA',
      '±1 ms', '±2 ms', '±5 ms', '±10 ms', '±20 ms'
    ],
    'Power Quality Analyzer': [
      '±0.1%', '±0.2%', '±0.5%', '±1%', '±2%',
      '±0.1 V', '±0.2 V', '±0.5 V', '±1 V', '±2 V',
      '±0.1 A', '±0.2 A', '±0.5 A', '±1 A', '±2 A'
    ],
    'Harmonik Analizör': [
      '±0.5%', '±1%', '±2%', '±3%', '±5%',
      '±0.1%', '±0.2%', '±0.5%', '±1%', '±2%'
    ],
    'Frekans Sayıcı': [
      '±1 ppm', '±2 ppm', '±5 ppm', '±10 ppm', '±20 ppm',
      '±0.001 Hz', '±0.01 Hz', '±0.1 Hz', '±1 Hz', '±10 Hz'
    ],
    'Kapasitans Ölçer': [
      '±0.1%', '±0.2%', '±0.5%', '±1%', '±2%', '±5%',
      '±0.1 pF', '±1 pF', '±10 pF', '±100 pF', '±1 nF', '±10 nF'
    ],
    'İndüktans Ölçer': [
      '±0.2%', '±0.5%', '±1%', '±2%', '±5%',
      '±0.1 μH', '±1 μH', '±10 μH', '±100 μH', '±1 mH', '±10 mH'
    ],
    'LCR Metre': [
      '±0.05%', '±0.1%', '±0.2%', '±0.5%', '±1%', '±2%',
      '±0.1 pF', '±1 pF', '±10 pF', '±0.1 μH', '±1 μH', '±10 μH',
      '±0.1 Ω', '±1 Ω', '±10 Ω', '±100 Ω', '±1 kΩ', '±10 kΩ'
    ],

    // Kimyasal Ölçüm Cihazları Belirsizlikleri
    'pH Ölçer - Digital': [
      '±0.001 pH', '±0.002 pH', '±0.005 pH', '±0.01 pH', '±0.02 pH', '±0.05 pH', '±0.1 pH',
      '±0.1 mV', '±0.2 mV', '±0.5 mV', '±1 mV', '±2 mV', '±5 mV'
    ],
    'pH Ölçer - Portable': [
      '±0.01 pH', '±0.02 pH', '±0.05 pH', '±0.1 pH', '±0.2 pH'
    ],
    'Conductivity Ölçer': [
      '±0.5%', '±1%', '±1.5%', '±2%', '±3%', '±5%',
      '±1 μS/cm', '±2 μS/cm', '±5 μS/cm', '±10 μS/cm', '±20 μS/cm',
      '±0.001 mS/cm', '±0.002 mS/cm', '±0.005 mS/cm', '±0.01 mS/cm', '±0.02 mS/cm'
    ],
    'TDS Ölçer': [
      '±1%', '±2%', '±3%', '±5%', '±10%',
      '±1 ppm', '±2 ppm', '±5 ppm', '±10 ppm', '±20 ppm', '±50 ppm'
    ],
    'ORP Ölçer': [
      '±0.2 mV', '±0.5 mV', '±1 mV', '±2 mV', '±5 mV', '±10 mV',
      '±0.2%', '±0.5%', '±1%', '±2%', '±5%'
    ],
    'Dissolved Oxygen Ölçer': [
      '±0.1 mg/L', '±0.2 mg/L', '±0.5 mg/L', '±1 mg/L', '±2 mg/L',
      '±0.1 ppm', '±0.2 ppm', '±0.5 ppm', '±1 ppm', '±2 ppm',
      '±1% sat', '±2% sat', '±5% sat', '±10% sat'
    ],
    'Chlorine Ölçer': [
      '±0.01 mg/L', '±0.02 mg/L', '±0.05 mg/L', '±0.1 mg/L', '±0.2 mg/L',
      '±0.01 ppm', '±0.02 ppm', '±0.05 ppm', '±0.1 ppm', '±0.2 ppm',
      '±2%', '±3%', '±5%', '±10%'
    ],
    'Turbidity Ölçer': [
      '±0.01 NTU', '±0.02 NTU', '±0.05 NTU', '±0.1 NTU', '±0.2 NTU',
      '±2%', '±3%', '±5%', '±10%', '±15%'
    ],
    'Refraktometre': [
      '±0.1% Brix', '±0.2% Brix', '±0.5% Brix', '±1% Brix',
      '±0.0001 nD', '±0.0002 nD', '±0.0005 nD', '±0.001 nD',
      '±0.1% Salt', '±0.2% Salt', '±0.5% Salt', '±1% Salt'
    ],

    // Kaynak İşleri Ölçüm Cihazları Belirsizlikleri
    'Kaynak Akım Ölçer - Digital': [
      '±0.5% rdg ±5 dgt', '±1% rdg ±3 dgt', '±1.5% rdg ±5 dgt',
      '±0.3% FS', '±0.5% FS', '±1% FS', '±2% FS'
    ],
    'Kaynak Akım Ölçer - Analog': [
      '±2% FS', '±3% FS', '±5% FS', '±1.5% FS', '±2.5% FS'
    ],
    'Kaynak Voltaj Ölçer - Digital': [
      '±0.5% rdg ±2 dgt', '±1% rdg ±2 dgt', '±1.5% rdg ±3 dgt',
      '±0.3% FS', '±0.5% FS', '±1% FS'
    ],
    'Kaynak Voltaj Ölçer - RMS': [
      '±0.5% rdg ±2 dgt', '±1% rdg ±3 dgt', '±1.5% rdg ±5 dgt',
      '±0.3% FS RMS', '±0.5% FS RMS'
    ],
    'Gaz Flow Ölçer - Argon': [
      '±2% FS', '±3% FS', '±5% FS', '±1.5% rdg',
      '±2% rdg ±0.1 L/min', '±3% rdg ±0.2 L/min'
    ],
    'Gaz Flow Ölçer - CO2': [
      '±2% FS', '±3% FS', '±4% FS', '±2% rdg',
      '±2.5% rdg ±0.15 L/min', '±3% rdg ±0.2 L/min'
    ],
    'Gaz Flow Ölçer - Mixed Gas': [
      '±3% FS', '±4% FS', '±5% FS', '±2.5% rdg',
      '±3% rdg ±0.2 L/min'
    ],
    'Kaynak Penetrasyon Ölçer': [
      '±0.1 mm', '±0.2 mm', '±0.5 mm', '±1 mm',
      '±5% rdg ±0.1 mm', '±0.004 inch', '±0.008 inch'
    ],
    'Ark Voltaj Ölçer': [
      '±1% rdg ±2 dgt', '±2% rdg ±3 dgt', '±1.5% FS',
      '±0.5% rdg RMS ±2 dgt'
    ],
    'Kaynak Kalitesi Testi': [
      '±5% Kalite', '±10% Hata Oranı', '±0.1 Porosity/cm²',
      '±0.2 mm Penetrasyon', '±0.5 mm Diş Genişliği'
    ],
    'Heat Input Hesaplayıcı': [
      '±2% Hesaplama', '±5% Hesaplama', '±10% Hesaplama',
      '±50 J/mm', '±100 J/mm', '±0.1 kJ/mm'
    ],

    // Büküm ve Şekillendirme Ölçümleri Belirsizlikleri
    'Tork Ölçer - Digital': [
      '±0.5% rdg ±1 dgt', '±1% rdg ±2 dgt', '±2% rdg ±3 dgt',
      '±0.3% FS', '±0.5% FS', '±1% FS', '±1.5% FS'
    ],
    'Tork Ölçer - Analog': [
      '±2% FS', '±3% FS', '±4% FS', '±5% FS'
    ],
    'Momentometre': [
      '±3% FS', '±4% FS', '±5% FS', '±6% FS',
      '±2% rdg', '±3% rdg', '±4% rdg'
    ],
    'Büküm Açısı Ölçer': [
      '±0.1°', '±0.2°', '±0.5°', '±1°', '±2°',
      '±0.5% rdg ±0.1°', '±1% rdg ±0.2°'
    ],
    'Spring Back Ölçer': [
      '±0.1°', '±0.2°', '±0.5°', '±1°',
      '±0.05 mm', '±0.1 mm', '±0.2 mm'
    ],
    'Kuvvet Ölçer - Push/Pull': [
      '±0.5% FS', '±1% FS', '±2% FS', '±3% FS',
      '±0.5% rdg ±1 dgt', '±1% rdg ±2 dgt'
    ],
    'Gerilim Ölçer - Strain Gauge': [
      '±1 με', '±2 με', '±5 με', '±10 με',
      '±0.5% rdg ±1 με', '±1% rdg ±2 με'
    ],
    'Elastikiyet Modülü Ölçer': [
      '±2% rdg', '±3% rdg', '±5% rdg',
      '±5 GPa', '±10 GPa', '±500 ksi'
    ],

    // Kesim İşleri Ölçüm Cihazları Belirsizlikleri
    'Plazma Kesim Güç Ölçer': [
      '±1% rdg ±3 dgt', '±2% rdg ±5 dgt', '±3% rdg ±5 dgt',
      '±1% FS', '±2% FS', '±3% FS'
    ],
    'Lazer Kesim Güç Ölçer': [
      '±1% rdg', '±2% rdg', '±3% rdg', '±5% rdg',
      '±0.1 kW', '±0.2 kW', '±0.5 kW'
    ],
    'Su Jeti Basınç Ölçer': [
      '±0.5% FS', '±1% FS', '±2% FS', '±3% FS',
      '±10 bar', '±25 bar', '±50 bar', '±100 psi'
    ],
    'Kesit Pürüzlülük Ölçer': [
      '±5% rdg ±0.02 μm', '±10% rdg ±0.05 μm',
      '±0.1 μm Ra', '±0.2 μm Ra', '±0.5 μm Ra'
    ],
    'Kesim Kenarı Kalitesi Ölçer': [
      '±0.5 Grade', '±1 Grade', '±0.1 mm Kenar',
      '±1° Eğiklik', '±2° Eğiklik'
    ],
    'Oksijen Saflık Ölçer': [
      '±0.1% O2', '±0.2% O2', '±0.5% O2', '±1% O2',
      '±0.5% rdg ±0.1% O2'
    ],
    'Kesim Hızı Ölçer': [
      '±1% rdg', '±2% rdg', '±3% rdg',
      '±0.1 m/min', '±1 mm/min', '±5 mm/min'
    ],
    'Kerf Genişliği Ölçer': [
      '±0.01 mm', '±0.02 mm', '±0.05 mm', '±0.1 mm',
      '±2% rdg ±0.01 mm'
    ],

    // Boya ve Kaplama Ölçümleri Belirsizlikleri
    'Yaş Film Kalınlığı Ölçer': [
      '±2% rdg ±1 μm', '±3% rdg ±2 μm', '±5% rdg ±5 μm',
      '±1 μm', '±2 μm', '±5 μm', '±0.1 mils'
    ],
    'Kuru Film Kalınlığı Ölçer': [
      '±1% rdg ±1 μm', '±2% rdg ±2 μm', '±3% rdg ±3 μm',
      '±1 μm', '±2 μm', '±5 μm', '±0.1 mils'
    ],
    'Viskozite Ölçer - Rotasyonel': [
      '±1% FS', '±2% FS', '±3% FS',
      '±1% rdg', '±2% rdg', '±5% rdg'
    ],
    'Viskozite Ölçer - Kapiler': [
      '±0.5% rdg', '±1% rdg', '±2% rdg',
      '±0.1 cSt', '±1 cSt', '±5 cSt'
    ],
    'Renk Ölçer - Colorimeter': [
      '±0.1 ΔE*', '±0.2 ΔE*', '±0.5 ΔE*',
      '±0.5 L*', '±1 a*', '±1 b*'
    ],
    'Parlaklık Ölçer - Gloss Meter': [
      '±1 GU', '±2 GU', '±5 GU',
      '±1% rdg ±1 GU', '±2% rdg ±2 GU'
    ],
    'Adhesion Test Cihazı': [
      '±0.1 MPa', '±0.2 MPa', '±0.5 MPa',
      '±15 psi', '±25 psi', '±50 psi'
    ],
    'Cross Hatch Test Kiti': [
      '±0.5 Sınıf', '±1 Sınıf', 'Manuel Değerlendirme',
      '±0.1 mm Grid'
    ],
    'Boya Sıcaklığı Ölçer': [
      '±0.5°C', '±1°C', '±2°C', '±5°C',
      '±1°F', '±2°F', '±5°F', '±10°F'
    ],

    // Montaj İşleri Ölçüm Cihazları Belirsizlikleri
    'Cıvata Momentometesi - Digital': [
      '±2% rdg ±1 dgt', '±3% rdg ±2 dgt', '±4% rdg ±3 dgt',
      '±1% FS', '±2% FS', '±3% FS'
    ],
    'Cıvata Momentometesi - Klik Tipi': [
      '±3% FS', '±4% FS', '±5% FS', '±6% FS'
    ],
    'Gap Ölçer - Feeler Gauge': [
      '±0.005 mm', '±0.01 mm', '±0.02 mm',
      '±0.0002 inch', '±0.0005 inch', '±0.001 inch'
    ],
    'Clearance Ölçer': [
      '±0.01 mm', '±0.02 mm', '±0.05 mm',
      '±0.0005 inch', '±0.001 inch', '±0.002 inch'
    ],
    'Fitting Testi Cihazı': [
      '±1% FS', '±2% FS', '±3% FS',
      '±5 N', '±10 N', '±1 kg'
    ],
    'Montaj Toleransı Ölçer': [
      '±0.002 mm', '±0.005 mm', '±0.01 mm',
      '±0.0001 inch', '±0.0002 inch', '±0.0005 inch'
    ],
    'Vida Adım Ölçer': [
      '±0.01 mm pitch', '±0.02 mm pitch',
      '±1 TPI', '±2 TPI', '±0.5% pitch'
    ],

    // NDT Cihazları Belirsizlikleri
    'Ultrasonik Flaw Detector': [
      '±0.1 mm', '±0.2 mm', '±0.5 mm', '±1 mm',
      '±1% rdg ±0.1 mm', '±0.004 inch'
    ],
    'Çatlak Derinliği Ölçer': [
      '±0.1 mm', '±0.2 mm', '±0.5 mm',
      '±5% rdg ±0.1 mm', '±0.004 inch'
    ],
    'Porosity Test Cihazı': [
      '±1% Porosity', '±2% Porosity', '±5% Porosity',
      '±0.5% Void Ratio', '±1% Vol%'
    ],
    'Hardness Tester - Portable': [
      '±2 HV', '±3 HV', '±5 HV',
      '±1 HRC', '±2 HRC', '±5 HB'
    ],
    'Ferrite Scope': [
      '±0.5% Ferrit', '±1% Ferrit', '±2% Ferrit',
      '±1 FN', '±2 FN', '±0.1% Delta Ferrit'
    ],

    // Elektrik Montaj Test Cihazları Belirsizlikleri
    'Kontinüite Test Cihazı': [
      '±1% rdg ±3 dgt', '±2% rdg ±5 dgt',
      '±0.1 Ω', '±1 Ω', '±10 Ω'
    ],
    'Megger - İzolasyon Test': [
      '±3% rdg', '±5% rdg', '±10% rdg',
      '±50 MΩ', '±100 MΩ', '±1 GΩ'
    ],
    'ELCB Test Cihazı': [
      '±5% rdg ±3 dgt', '±10% rdg ±5 dgt',
      '±1 mA', '±5 mA', '±10 ms', '±50 ms'
    ],
    'Faz Sırası Test Cihazı': [
      '±2% rdg ±5 dgt', '±3% rdg ±10 dgt',
      '±5 V', '±1 Hz', '±2 Hz'
    ],
    'Motor Test Cihazı': [
      '±1% rdg ±5 dgt', '±2% rdg ±10 dgt',
      '±5 V', '±1 A', '±1 Hz', '±10 RPM'
    ],
    'Transformatör Test Cihazı': [
      '±1% rdg', '±2% rdg', '±3% rdg',
      '±100 V', '±10 A', '±0.1 Hz'
    ],
    'Kablo Test Cihazı': [
      '±1% rdg ±5 m', '±2% rdg ±10 m',
      '±10 m', '±1 MΩ', '±10 MΩ'
    ],
    'Termik Test Cihazı': [
      '±1°C', '±2°C', '±5°C', '±10°C',
      '±2°F', '±5°F', '±10°F', '±20°F'
    ],

    // Ek Kaynaklı İmalat Ölçüm Cihazları Belirsizlikleri
    'Kaynak Kumpası - Digital': [
      '±0.02 mm', '±0.03 mm', '±0.05 mm', '±0.1 mm',
      '±0.001 inch', '±0.002 inch', '±0.004 inch',
      '±0.01% rdg ±0.02 mm'
    ],
    'Kaynak Kumpası - Analog': [
      '±0.05 mm', '±0.1 mm', '±0.2 mm', '±0.3 mm',
      '±0.002 inch', '±0.004 inch', '±0.008 inch'
    ],
    'Kaynak Kumpası - V-Groove': [
      '±0.05 mm', '±0.1 mm', '±0.2 mm', '±0.3 mm',
      '±0.002 inch', '±0.004 inch', '±0.008 inch',
      '±0.02 mm (Çap Ölçümü)'
    ],
    'Torkmetre - Mekanik': [
      '±3% FS', '±4% FS', '±5% FS', '±6% FS',
      '±2% rdg', '±3% rdg', '±4% rdg', '±5% rdg'
    ],
    'Torkmetre - Elektronik': [
      '±0.5% FS', '±1% FS', '±1.5% FS', '±2% FS',
      '±0.5% rdg ±1 dgt', '±1% rdg ±2 dgt'
    ],
    'Torkmetre - Pneumatik': [
      '±2% FS', '±3% FS', '±4% FS', '±5% FS',
      '±1.5% rdg', '±2% rdg', '±3% rdg'
    ],
    'Gönye - Çelik': [
      '±0.02°', '±0.05°', '±0.1°', '±0.2°',
      '±2 arcmin', '±5 arcmin', '±10 arcmin'
    ],
    'Gönye - Alüminyum': [
      '±0.05°', '±0.1°', '±0.2°', '±0.3°',
      '±3 arcmin', '±6 arcmin', '±12 arcmin'
    ],
    'Gönye - Ayarlanabilir': [
      '±0.1°', '±0.2°', '±0.3°', '±0.5°',
      '±6 arcmin', '±12 arcmin', '±30 arcmin'
    ],
    'Gönye - Digital': [
      '±0.01°', '±0.02°', '±0.05°', '±0.1°',
      '±0.6 arcmin', '±1.2 arcmin', '±3 arcmin'
    ],
    'Terazi - Hassas': [
      '±0.1 mg', '±0.2 mg', '±0.5 mg', '±1 mg',
      '±0.01 g', '±0.02 g', '±0.05 g', '±0.1 g'
    ],
    'Terazi - Endüstriyel': [
      '±1 g', '±2 g', '±5 g', '±10 g', '±20 g',
      '±0.002 lb', '±0.005 lb', '±0.01 lb', '±0.02 lb'
    ],
    'Terazi - Analitik': [
      '±0.01 mg', '±0.02 mg', '±0.05 mg', '±0.1 mg',
      '±0.001 g', '±0.002 g', '±0.005 g'
    ],
    'Terazi - Platform': [
      '±10 g', '±20 g', '±50 g', '±100 g', '±200 g',
      '±0.02 lb', '±0.05 lb', '±0.1 lb', '±0.2 lb'
    ],
    'Desibelmetre - Digital': [
      '±0.1 dB', '±0.2 dB', '±0.5 dB', '±1 dB',
      '±1.5 dB', '±2 dB', '±0.7 dB (IEC 61672-1)'
    ],
    'Desibelmetre - Analog': [
      '±1 dB', '±1.5 dB', '±2 dB', '±2.5 dB', '±3 dB'
    ],
    'Desibelmetre - Integrating': [
      '±0.2 dB', '±0.5 dB', '±1 dB', '±1.5 dB',
      '±0.3 dB (LAeq)', '±0.5 dB (LAFmax)'
    ],
    'Sertlik Ölçüm Cihazı - Rockwell': [
      '±0.5 HR', '±1 HR', '±1.5 HR', '±2 HR',
      '±0.3 HRC', '±0.5 HRC', '±1 HRC'
    ],
    'Sertlik Ölçüm Cihazı - Shore': [
      '±0.5 Shore', '±1 Shore', '±1.5 Shore', '±2 Shore',
      '±0.3 Shore A', '±0.5 Shore D'
    ],
    'Sertlik Ölçüm Cihazı - Leeb': [
      '±4 HLD', '±6 HLD', '±9 HLD', '±12 HLD',
      '±3% HV', '±4% HV', '±5% HV'
    ],
    'Mihengir - Granit': [
      '±0.002 mm/m', '±0.003 mm/m', '±0.005 mm/m',
      '±0.001 mm (Düzlük)', '±0.002 mm (Düzlük)'
    ],
    'Mihengir - Döküm': [
      '±0.005 mm/m', '±0.008 mm/m', '±0.01 mm/m',
      '±0.003 mm (Düzlük)', '±0.005 mm (Düzlük)'
    ],
    'Mihengir - Çelik': [
      '±0.003 mm/m', '±0.005 mm/m', '±0.008 mm/m',
      '±0.002 mm (Düzlük)', '±0.003 mm (Düzlük)'
    ],
    'Boya Kalınlık Ölçüm Cihazı - Manyetik': [
      '±1 μm', '±2 μm', '±3 μm', '±5 μm',
      '±0.04 mils', '±0.08 mils', '±0.12 mils', '±0.2 mils',
      '±1% rdg ±1 μm', '±2% rdg ±2 μm'
    ],
    'Boya Kalınlık Ölçüm Cihazı - Eddy Current': [
      '±1 μm', '±2 μm', '±3 μm', '±5 μm',
      '±0.04 mils', '±0.08 mils', '±0.2 mils',
      '±1% rdg ±1 μm', '±2% rdg ±2 μm'
    ],
    'Kızıl Ötesi Termometre': [
      '±1°C', '±1.5°C', '±2°C', '±3°C', '±5°C',
      '±2°F', '±3°F', '±4°F', '±6°F', '±9°F',
      '±1% rdg ±1°C', '±2% rdg ±2°C'
    ],
    'İnfrared Termometre - Lazer': [
      '±0.75°C', '±1°C', '±1.5°C', '±2°C', '±3°C',
      '±1.5°F', '±2°F', '±3°F', '±4°F', '±5°F',
      '±0.75% rdg ±1°C', '±1% rdg ±1°C'
    ],
    'İnfrared Termometre - Probsuz': [
      '±1°C', '±2°C', '±3°C', '±5°C',
      '±2°F', '±4°F', '±6°F', '±9°F',
      '±1% rdg ±1°C', '±2% rdg ±2°C'
    ],
    'Mercekli Açı Ölçer': [
      '±0.005°', '±0.01°', '±0.02°', '±0.05°',
      '±0.3 arcmin', '±0.6 arcmin', '±1.2 arcmin', '±3 arcmin',
      '±18 arcsec', '±36 arcsec', '±72 arcsec'
    ],
    'Mercekli Gönye': [
      '±0.005°', '±0.01°', '±0.02°', '±0.03°',
      '±0.3 arcmin', '±0.6 arcmin', '±1.2 arcmin',
      '±18 arcsec', '±36 arcsec'
    ],
    'Optik Açı Ölçer': [
      '±0.001°', '±0.002°', '±0.005°', '±0.01°',
      '±0.06 arcmin', '±0.12 arcmin', '±0.3 arcmin',
      '±3.6 arcsec', '±7.2 arcsec', '±18 arcsec'
    ],
    'Ölçüm Plate\'i - Granit': [
      '±0.002 mm/m', '±0.003 mm/m', '±0.005 mm/m',
      '±0.001 mm (Düzlük)', '±0.002 mm (Düzlük)',
      '±0.003 mm (Düzlük)', '±0.005 mm (Düzlük)'
    ],
    'Ölçüm Plate\'i - Çelik': [
      '±0.003 mm/m', '±0.005 mm/m', '±0.008 mm/m',
      '±0.002 mm (Düzlük)', '±0.003 mm (Düzlük)',
      '±0.005 mm (Düzlük)'
    ],
    'Ölçüm Plate\'i - Döküm': [
      '±0.005 mm/m', '±0.008 mm/m', '±0.01 mm/m',
      '±0.003 mm (Düzlük)', '±0.005 mm (Düzlük)',
      '±0.008 mm (Düzlük)'
    ],

    // Varsayılan değerler
    'Diğer': ['±0.1%', '±0.2%', '±0.5%', '±1%', '±2%', '±5%', 'Özel Belirsizlik']
  };
  
  localStorage.setItem('measurement_uncertainties_by_sub_category', JSON.stringify(defaultUncertainties));
  localStorage.setItem('measurement_uncertainties_version', '2.4');
  console.log('✅ Yeni belirsizlik değerleri yüklendi:', Object.keys(defaultUncertainties).length, 'cihaz tipi');
  return defaultUncertainties;
};

// Dinamik ölçüm belirsizlikleri - cihaz kategorisine göre
const getMeasurementUncertaintiesByCategory = () => {
  // Önce localStorage'dan yükle, yoksa default değerleri oluştur
  const stored = localStorage.getItem('measurement_uncertainties_by_category');
  // Versiyon kontrolü için - eğer "0 mm" belirsizlik değeri yoksa yeniden yükle
  if (stored) {
    const data = JSON.parse(stored);
    if (!data['Ölçüm Cihazları'] || !data['Ölçüm Cihazları'].includes('0 mm')) {
      localStorage.removeItem('measurement_uncertainties_by_category');
    } else {
      return data;
    }
  }
  
  const defaultUncertainties = {
  'Ölçüm Cihazları': [
      '0 mm', '±0.001 mm', '±0.002 mm', '±0.003 mm', '±0.004 mm', '±0.005 mm',
      '±0.006 mm', '±0.007 mm', '±0.008 mm', '±0.009 mm', '±0.01 mm', 
      '±0.015 mm', '±0.02 mm', '±0.025 mm', '±0.03 mm', '±0.035 mm',
      '±0.04 mm', '±0.045 mm', '±0.05 mm', '±0.06 mm', '±0.07 mm',
      '±0.08 mm', '±0.09 mm', '±0.1 mm', '±0.15 mm', '±0.2 mm', 
      '±0.25 mm', '±0.3 mm', '±0.35 mm', '±0.4 mm', '±0.45 mm',
      '±0.5 mm', '±0.6 mm', '±0.7 mm', '±0.8 mm', '±0.9 mm',
      '±1 mm', '±1.5 mm', '±2 mm', '±2.5 mm', '±3 mm', '±4 mm', 
      '±5 mm', '±10 mm', 'Diğer'
    ],

    'Açı Ölçüm Cihazları': [
      '0°', '±0.001°', '±0.002°', '±0.003°', '±0.004°', '±0.005°',
      '±0.01°', '±0.02°', '±0.03°', '±0.04°', '±0.05°',
      '±0.1°', '±0.2°', '±0.3°', '±0.4°', '±0.5°',
      '±1°', '±2°', '±3°', '±4°', '±5°', '±10°',
      '±0.5 arcmin', '±1 arcmin', '±2 arcmin', '±5 arcmin',
      '±0.5 arcsec', '±1 arcsec', '±2 arcsec', '±5 arcsec',
      '±10 arcsec', '±30 arcsec', '±60 arcsec', 'Diğer'
    ],

    'Sıcaklık Ölçüm Cihazları': [
      '0°C', '±0.001°C', '±0.002°C', '±0.003°C', '±0.004°C', '±0.005°C',
      '±0.01°C', '±0.02°C', '±0.03°C', '±0.04°C', '±0.05°C',
      '±0.1°C', '±0.2°C', '±0.3°C', '±0.4°C', '±0.5°C',
      '±1°C', '±2°C', '±3°C', '±4°C', '±5°C', '±10°C',
      '±0.01% FS', '±0.02% FS', '±0.05% FS', '±0.1% FS',
      '±0.2% FS', '±0.3% FS', '±0.4% FS', '±0.5% FS',
      '±1% FS', '±2% FS', '±3% FS', 'Diğer'
    ],

  'Test Ekipmanları': [
      '±0.001 V', '±0.005 V', '±0.01 V', '±0.02 V',
      '±0.05 V', '±0.1 V', '±0.2 V', '±0.5 V', '±1 V',
      '±0.001 A', '±0.005 A', '±0.01 A', '±0.02 A',
      '±0.05 A', '±0.1 A', '±0.2 A', '±0.5 A', '±1 A',
      '±0.01%', '±0.02%', '±0.05%', '±0.1%', '±0.2%',
      '±0.3%', '±0.4%', '±0.5%', '±1%', '±2%', 'Diğer'
  ],
  'Üretim Makineleri': [
      '±0.1%', '±0.2%', '±0.3%', '±0.4%', '±0.5%',
      '±1%', '±2%', '±3%', '±4%', '±5%',
      '±0.01 kN', '±0.05 kN', '±0.1 kN', '±0.2 kN',
      '±0.5 kN', '±1 kN', '±2 kN', '±5 kN', 'Diğer'
  ],
  'Kalite Kontrol Cihazları': [
      '0 mm', '±0.001 mm', '±0.002 mm', '±0.003 mm', '±0.004 mm', '±0.005 mm',
      '±0.006 mm', '±0.007 mm', '±0.008 mm', '±0.009 mm', '±0.01 mm', 
      '±0.015 mm', '±0.02 mm', '±0.025 mm', '±0.03 mm', '±0.035 mm',
      '±0.04 mm', '±0.045 mm', '±0.05 mm', '±0.06 mm', '±0.07 mm',
      '±0.08 mm', '±0.09 mm', '±0.1 mm', '±0.15 mm', '±0.2 mm', 
      '±0.25 mm', '±0.3 mm', '±0.35 mm', '±0.4 mm', '±0.45 mm',
      '±0.5 mm', '±0.6 mm', '±0.7 mm', '±0.8 mm', '±0.9 mm',
      '±1 mm', '±1.5 mm', '±2 mm', '±2.5 mm', '±3 mm', '±4 mm', 
      '±5 mm', '±10 mm', 'Diğer'
  ],
  'Kaynak Ekipmanları': [
      '±0.1 A', '±0.2 A', '±0.3 A', '±0.4 A', '±0.5 A',
      '±1 A', '±2 A', '±3 A', '±4 A', '±5 A',
      '±10 A', '±15 A', '±20 A', '±0.1 V', '±0.2 V',
      '±0.3 V', '±0.4 V', '±0.5 V', '±1 V', '±2 V',
      '±1%', '±2%', '±3%', '±4%', '±5%', 'Diğer'
  ],
  'Elektrikli Cihazlar': [
      '±0.01 V', '±0.02 V', '±0.03 V', '±0.04 V', '±0.05 V',
      '±0.1 V', '±0.2 V', '±0.3 V', '±0.4 V', '±0.5 V',
      '±1 V', '±2 V', '±5 V', '±0.01 A', '±0.02 A',
      '±0.03 A', '±0.04 A', '±0.05 A', '±0.1 A', '±0.2 A',
      '±0.3 A', '±0.4 A', '±0.5 A', '±1 A', '±0.1%',
      '±0.2%', '±0.3%', '±0.4%', '±0.5%', '±1%', 'Diğer'
  ],
  'Pnömatik Sistemler': [
      '±0.001 bar', '±0.002 bar', '±0.003 bar', '±0.004 bar',
      '±0.005 bar', '±0.01 bar', '±0.02 bar', '±0.03 bar',
      '±0.04 bar', '±0.05 bar', '±0.1 bar', '±0.2 bar',
      '±0.3 bar', '±0.4 bar', '±0.5 bar', '±1 bar',
      '±0.1%', '±0.2%', '±0.3%', '±0.4%', '±0.5%',
      '±1%', '±2%', '±3%', '±4%', '±5%', 'Diğer'
  ],
  'Hidrolik Sistemler': [
      '±0.01 bar', '±0.02 bar', '±0.03 bar', '±0.04 bar',
      '±0.05 bar', '±0.1 bar', '±0.2 bar', '±0.3 bar',
      '±0.4 bar', '±0.5 bar', '±1 bar', '±2 bar',
      '±3 bar', '±4 bar', '±5 bar', '±10 bar',
      '±0.1%', '±0.2%', '±0.3%', '±0.4%', '±0.5%',
      '±1%', '±2%', '±3%', '±4%', '±5%', 'Diğer'
  ],
  'Bilgisayar ve IT': [
      '±0.01%', '±0.02%', '±0.03%', '±0.04%', '±0.05%',
      '±0.1%', '±0.2%', '±0.3%', '±0.4%', '±0.5%',
      '±1%', '±2%', '±3%', '±4%', '±5%',
      '±1 bit', '±2 bit', '±4 bit', '±8 bit', 'Diğer'
  ],
  'Güvenlik Ekipmanları': [
      '±0.1%', '±0.2%', '±0.3%', '±0.4%', '±0.5%',
      '±1%', '±2%', '±3%', '±4%', '±5%',
      '±10%', '±1 ppm', '±2 ppm', '±3 ppm', '±4 ppm',
      '±5 ppm', '±10 ppm', '±20 ppm', '±50 ppm', 'Diğer'
  ],
  'Çevre Ölçüm Cihazları': [
      '±0.01°C', '±0.02°C', '±0.03°C', '±0.04°C', '±0.05°C',
      '±0.1°C', '±0.2°C', '±0.3°C', '±0.4°C', '±0.5°C',
      '±1°C', '±2°C', '±3°C', '±4°C', '±5°C',
      '±1% RH', '±2% RH', '±3% RH', '±4% RH', '±5% RH',
      '±1 ppm', '±2 ppm', '±3 ppm', '±4 ppm', '±5 ppm',
      '±10 ppm', '±1%', '±2%', '±3%', '±4%', '±5%', 'Diğer'
  ],
  'Laboratuvar Ekipmanları': [
      '±0.01 mg', '±0.02 mg', '±0.03 mg', '±0.04 mg', '±0.05 mg',
      '±0.1 mg', '±0.2 mg', '±0.3 mg', '±0.4 mg', '±0.5 mg',
      '±1 mg', '±2 mg', '±5 mg', '±0.001 g', '±0.002 g',
      '±0.003 g', '±0.004 g', '±0.005 g', '±0.01 g', '±0.02 g',
      '±0.03 g', '±0.04 g', '±0.05 g', '±0.1 g', '±0.2 g',
      '±0.01°C', '±0.02°C', '±0.03°C', '±0.04°C', '±0.05°C',
      '±0.1°C', '±0.2°C', '±0.3°C', '±0.4°C', '±0.5°C',
      '±0.001 pH', '±0.002 pH', '±0.003 pH', '±0.004 pH',
      '±0.005 pH', '±0.01 pH', '±0.02 pH', '±0.03 pH',
      '±0.04 pH', '±0.05 pH', '±0.1 pH', 'Diğer'
    ],
    'Diğer': [
      '±0.001', '±0.002', '±0.003', '±0.004', '±0.005',
      '±0.01', '±0.02', '±0.03', '±0.04', '±0.05',
      '±0.1', '±0.2', '±0.3', '±0.4', '±0.5',
      '±1', '±2', '±3', '±4', '±5', 'Diğer'
    ]
  };
  
  localStorage.setItem('measurement_uncertainties_by_category', JSON.stringify(defaultUncertainties));
  return defaultUncertainties;
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

// Kategoriye göre cihaz adları listesi
const getEquipmentNamesByCategory = () => {
  const stored = localStorage.getItem('equipment_names_by_category');
  const version = localStorage.getItem('equipment_names_version');
  
  // Versiyon kontrolü - Yeni cihazlar eklendiğinde cache'i yenile
  if (stored && version === '2.4') {
    try {
      const data = JSON.parse(stored);
      // Ölçüm Cihazları kategorisinde yeni cihazların varlığını kontrol et
      const olcumCihazlari = data['Ölçüm Cihazları'] || [];
      if (olcumCihazlari.includes('Kaynak Kumpası - Digital') && 
          olcumCihazlari.includes('Torkmetre - Mekanik') && 
          olcumCihazlari.includes('Gönye - Digital') && 
          olcumCihazlari.includes('Terazi - Hassas')) {
        return data;
      }
    } catch (e) {
      console.log('Ekipman adları cache bozuk, yeniden oluşturuluyor...');
    }
  }
  
  // Cache'i temizle ve yeniden oluştur
  localStorage.removeItem('equipment_names_by_category');
  localStorage.removeItem('equipment_names_version');
  
  const defaultEquipmentNames = {
    'Ölçüm Cihazları': [
      // Boyut Ölçüm Cihazları
      'Kumpas - Digital', 'Kumpas - Analog', 'Kumpas - Abaküs', 'Kumpas - İç Çap',
      'Kumpas - Dış Çap', 'Kumpas - Derinlik', 'Kumpas - Yükseklik',
      'Mikrometre - Dış Çap', 'Mikrometre - İç Çap', 'Mikrometre - Derinlik',
      'Mikrometre - Dişli', 'Mikrometre - V-Blok', 'Mikrometre - Boru Duvar Kalınlığı',
      'Şerit Metre', 'Cetvel - Çelik', 'Cetvel - Alüminyum', 'Metre - Katlanır',
      'Yükseklik Ölçer - Digital', 'Yükseklik Ölçer - Analog',
      'Profil Ölçer', 'Çap Ölçer', 'Kalınlık Ölçer',
      'Komparatör - Digital', 'Komparatör - Analog', 'Komparatör - Pneumatik',
      'Blok Takımı', 'Pin Gauge Takımı', 'Ring Gauge Takımı',
      'Master Ring', 'Master Plug', 'Kalibre Blok',
      // Yeni Eklenen Ölçüm Cihazları
      'Takometre - Digital', 'Takometre - Laser', 'Takometre - Optik',
      'Sentil Çakısı - 0.001mm', 'Sentil Çakısı - 0.002mm', 'Sentil Çakısı - 0.005mm',
      'Radius Mastar - İç R', 'Radius Mastar - Dış R', 'Radius Mastar - Universal',
      'Dijital Isı Ölçer - İnfrared', 'Dijital Isı Ölçer - Temaslı', 'Dijital Isı Ölçer - Problu',
      'Su Terazisi - Standart', 'Su Terazisi - Hassas', 'Su Terazisi - Digital',
      // Mesafe ve Boyut Ölçüm Cihazları
      'Lazer Mesafe Ölçer', 'Ultrasonik Mesafe Ölçer', 'Ultrasonik Kalınlık Ölçer',
      'Coating Thickness Meter', 'Pin Type Thickness Meter', 'Eddy Current Thickness Meter',
      // Çevresel Ölçüm Cihazları
      'Lüks Ölçer - Digital', 'Lüks Ölçer - Analog', 'UV Ölçer', 'IR Ölçer',
      'Ses Seviyesi Ölçer', 'Vibrasyon Ölçer - Digital', 'Vibrasyon Ölçer - Analog',
      'Nem Ölçer - Digital', 'Nem Ölçer - Analog', 'Higrometre',
      'Barometer - Digital', 'Barometer - Analog', 'Altimetre',
      'Rüzgar Hızı Ölçer', 'Hava Hızı Ölçer', 'Anemometre',
      // Basınç Ölçüm Cihazları
      'Dijital Manometre', 'Analog Manometre', 'Diferansiyel Basınç Ölçer',
      'Vakum Ölçer', 'Hidrolik Test Cihazı', 'Pneumatik Test Cihazı',
      // Elektriksel Ölçüm Cihazları
      'Dijital Multimetre', 'Analog Multimetre', 'Klamp Ampermetre',
      'İzolasyon Test Cihazı', 'Topraklama Test Cihazı', 'RCD Test Cihazı',
      'Power Quality Analyzer', 'Harmonik Analizör', 'Frekans Sayıcı',
      'Kapasitans Ölçer', 'İndüktans Ölçer', 'LCR Metre',
      // Kimyasal Ölçüm Cihazları
      'pH Ölçer - Digital', 'pH Ölçer - Portable', 'Conductivity Ölçer',
      'TDS Ölçer', 'ORP Ölçer', 'Dissolved Oxygen Ölçer',
      'Chlorine Ölçer', 'Turbidity Ölçer', 'Refraktometre',
      // Hassas Ölçüm Cihazları
      'Koordinat Ölçüm Makinesi (CMM)', 'Optik Komparatör',
      'Projektör - Profil', 'Projektör - Werkstück',
      'Form Tester', 'Yüzey Pürüzlülük Cihazı',
      'Dişli Ölçüm Cihazı', 'Vida Ölçüm Cihazı',
      // Kaynak İşleri Ölçüm Cihazları
      'Kaynak Akım Ölçer - Digital', 'Kaynak Akım Ölçer - Analog',
      'Kaynak Voltaj Ölçer - Digital', 'Kaynak Voltaj Ölçer - RMS',
      'Gaz Flow Ölçer - Argon', 'Gaz Flow Ölçer - CO2', 'Gaz Flow Ölçer - Mixed Gas',
      'Kaynak Penetrasyon Ölçer', 'Ark Voltaj Ölçer', 'Kaynak Kalitesi Testi',
      'Kaynak Diş Derinliği Ölçer', 'Heat Input Hesaplayıcı',
      // Büküm ve Şekillendirme Ölçümleri
      'Tork Ölçer - Digital', 'Tork Ölçer - Analog', 'Momentometre',
      'Büküm Açısı Ölçer', 'Spring Back Ölçer', 'Kuvvet Ölçer - Push/Pull',
      'Gerilim Ölçer - Strain Gauge', 'Elastikiyet Modülü Ölçer',
      'Plastik Deformasyon Ölçer', 'Yay Sabiti Ölçer',
      // Kesim İşleri Ölçüm Cihazları
      'Plazma Kesim Güç Ölçer', 'Lazer Kesim Güç Ölçer',
      'Su Jeti Basınç Ölçer', 'Kesit Pürüzlülük Ölçer',
      'Kesim Kenarı Kalitesi Ölçer', 'Oksijen Saflık Ölçer',
      'Kesim Hızı Ölçer', 'Kerf Genişliği Ölçer',
      // Boya ve Kaplama Ölçümleri
      'Yaş Film Kalınlığı Ölçer', 'Kuru Film Kalınlığı Ölçer',
      'Viskozite Ölçer - Rotasyonel', 'Viskozite Ölçer - Kapiler',
      'Renk Ölçer - Colorimeter', 'Parlaklık Ölçer - Gloss Meter',
      'Adhesion Test Cihazı', 'Cross Hatch Test Kiti',
      'Boya Sıcaklığı Ölçer', 'Atomizasyon Kalitesi Ölçer',
      // Montaj İşleri Ölçüm Cihazları
      'Cıvata Momentometesi - Digital', 'Cıvata Momentometesi - Klik Tipi',
      'Gap Ölçer - Feeler Gauge', 'Clearance Ölçer',
      'Fitting Testi Cihazı', 'Montaj Toleransı Ölçer',
      'Vida Adım Ölçer', 'Diş Profil Ölçer',
      // NDT (Non-Destructive Testing) Cihazları
      'Ultrasonik Flaw Detector', 'Manyetik Partikül Test Cihazı',
      'Penetrant Test Kiti - Renkli', 'Penetrant Test Kiti - Floresan',
      'Radyografi Film Densitometresi', 'Kaynak Dikişi Test Cihazı',
      'Çatlak Derinliği Ölçer', 'Porosity Test Cihazı',
      'Hardness Tester - Portable', 'Ferrite Scope',
      // Elektrik Montaj Test Cihazları
      'Kontinüite Test Cihazı', 'Megger - İzolasyon Test',
      'ELCB Test Cihazı', 'Faz Sırası Test Cihazı',
      'Motor Test Cihazı', 'Transformatör Test Cihazı',
      'Kablo Test Cihazı', 'Termik Test Cihazı',
      // Ek Kaynaklı İmalat Ölçüm Cihazları
      'Kaynak Kumpası - Digital', 'Kaynak Kumpası - Analog', 'Kaynak Kumpası - V-Groove',
      'Torkmetre - Mekanik', 'Torkmetre - Elektronik', 'Torkmetre - Pneumatik',
      'Gönye - Çelik', 'Gönye - Alüminyum', 'Gönye - Ayarlanabilir', 'Gönye - Digital',
      'Terazi - Hassas', 'Terazi - Endüstriyel', 'Terazi - Analitik', 'Terazi - Platform',
      'Desibelmetre - Digital', 'Desibelmetre - Analog', 'Desibelmetre - Integrating',
      'Sertlik Ölçüm Cihazı - Rockwell', 'Sertlik Ölçüm Cihazı - Shore', 'Sertlik Ölçüm Cihazı - Leeb',
      'Mihengir - Granit', 'Mihengir - Döküm', 'Mihengir - Çelik',
      'Boya Kalınlık Ölçüm Cihazı - Manyetik', 'Boya Kalınlık Ölçüm Cihazı - Eddy Current',
      'Kızıl Ötesi Termometre', 'İnfrared Termometre - Lazer', 'İnfrared Termometre - Probsuz',
      'Mercekli Açı Ölçer', 'Mercekli Gönye', 'Optik Açı Ölçer',
      'Ölçüm Plate\'i - Granit', 'Ölçüm Plate\'i - Çelik', 'Ölçüm Plate\'i - Döküm'
    ],

    'Açı Ölçüm Cihazları': [
      'Açı Ölçer - Digital', 'Açı Ölçer - Analog', 
      'Gonyometre - Universal', 'Gonyometre - Ayarlanabilir',
      'İnklinometre - Digital', 'İnklinometre - Analog',
      'Su Terazisi - Standart', 'Su Terazisi - Hassas', 'Su Terazisi - Digital',
      'Niveau - Hava Kabarcıklı', 'Niveau - Magnetic',
      'Sinüs Bar', 'Açı Blokları', 'Konik Gauge',
      'Dönüş Masası', 'Endeksli Kafa', 'Açı Dekupatörü'
    ],

    'Sıcaklık Ölçüm Cihazları': [
      'Termometre - Digital', 'Termometre - Analog', 'Termometre - Cıvalı',
      'Termometre - Alkollü', 'Termometre - Bimetal',
      'PT100 - Sınıf A', 'PT100 - Sınıf B', 'PT1000',
      'Termoçift - K Tipi', 'Termoçift - J Tipi', 'Termoçift - T Tipi',
      'Termoçift - E Tipi', 'Termoçift - R Tipi', 'Termoçift - S Tipi',
      'Kızılötesi Termometre', 'Termal Kamera',
      'Sıcaklık Datalogger', 'Sıcaklık Kalibratörü',
      'Sıcaklık Banyosu - Sıvı', 'Sıcaklık Banyosu - Kuru Blok',
      'Fırın - Kalibrasyon', 'Soğutma Ünitesi - Kalibrasyon'
    ],

    'Test Ekipmanları': [
      'Multimetre - Digital', 'Multimetre - Analog',
      'Osiloskop - Digital', 'Osiloskop - Analog', 'Osiloskop - Mixed Signal',
      'Güç Analizörü', 'Güç Kaynağı - DC', 'Güç Kaynağı - AC',
      'Sinyal Generatörü - Fonksiyon', 'Sinyal Generatörü - RF',
      'Sinyal Generatörü - Darbe', 'Spektrum Analizörü',
      'Network Analizörü', 'LCR Metre', 'Kapasitans Metre',
      'İndüktans Metre', 'Direnç Metre - Düşük', 'Direnç Metre - Yüksek',
      'İzolasyon Test Cihazı', 'Hipot Test Cihazı',
      'Güç Kalitesi Analizörü', 'Harmonik Analizörü'
    ],

    'Üretim Makineleri': [
      'Torna Tezgahı - CNC', 'Torna Tezgahı - Konvansiyonel',
      'Freze Tezgahı - CNC', 'Freze Tezgahı - Konvansiyonel',
      'Kaynak Makinesi - TIG', 'Kaynak Makinesi - MIG/MAG',
      'Kaynak Makinesi - Elektrot', 'Kaynak Makinesi - Plazma',
      'Pres - Hidrolik', 'Pres - Mekanik', 'Pres - Pneumatik',
      'Şerit Testere', 'Daire Testere', 'Taşlama Tezgahı',
      'Delme Tezgahı', 'Honlama Tezgahı', 'Rayba Tezgahı',
      'Balata Makinesi', 'Büküm Makinesi', 'Kesme Makinesi'
    ],

    'Kalite Kontrol Cihazları': [
      'Sertlik Test Cihazı - Rockwell', 'Sertlik Test Cihazı - Brinell',
      'Sertlik Test Cihazı - Vickers', 'Sertlik Test Cihazı - Shore',
      'Çekme Test Cihazı', 'Basma Test Cihazı', 'Eğme Test Cihazı',
      'Darbe Test Cihazı - Charpy', 'Darbe Test Cihazı - Izod',
      'Yorulma Test Cihazı', 'Krip Test Cihazı',
      'Ultrasonik Test Cihazı', 'Manyetik Partikül Test Cihazı',
      'Penetrant Test Kiti', 'Radyografi Test Cihazı',
      'Endoskop', 'Borescope', 'Videoscope',
      'Optik Mikroskop', 'Elektron Mikroskop',
      'Stereomikroskop', 'Metalografi Mikroskop'
    ],

    'Kaynak Ekipmanları': [
      'Kaynak Makinesi - TIG AC/DC', 'Kaynak Makinesi - MIG/MAG',
      'Kaynak Makinesi - Elektrot', 'Kaynak Makinesi - Plazma Kesme',
      'Kaynak Makinesi - Lazer', 'Kaynak Makinesi - Elektron Işını',
      'Kaynak Teli Besleme Ünitesi', 'Gaz Flowmetre',
      'Gaz Karışım Ünitesi', 'Argon Regülatörü', 'CO2 Regülatörü',
      'Kaynak Torcu - TIG', 'Kaynak Torcu - MIG', 
      'Elektrot Tutucusu', 'Topraklama Kablosu',
      'Kaynak Ampermetre', 'Kaynak Voltmetre',
      'Ark Voltajı Ölçer', 'Kaynak Sıcaklık Ölçer'
    ],

    'Elektrikli Cihazlar': [
      'Motor - AC Asenkron', 'Motor - DC', 'Motor - Servo',
      'Motor - Step', 'Motor - Linear', 'Generator - AC',
      'Generator - DC', 'Transformatör - Güç', 'Transformatör - Ölçü',
      'Akım Trafosu', 'Gerilim Trafosu', 'Röle - Koruma',
      'Röle - Kontrol', 'Kontaktör', 'Sigorta - Güç',
      'Sigorta - Kontrol', 'Şalter - Ana', 'Şalter - Yardımcı',
      'Pano - Ana Dağıtım', 'Pano - Alt Dağıtım',
      'UPS - Kesintisiz Güç', 'Regülatör - Gerilim',
      'İnvertör - Frekans', 'Soft Starter', 'PLC - Kontrol',
      'HMI - Operatör Paneli', 'Enerji Analizörü'
    ],

    'Pnömatik Sistemler': [
      'Kompresör - Pistonlu', 'Kompresör - Vidalı', 'Kompresör - Santrifüj',
      'Hava Tankı', 'Hava Kurutucusu', 'Hava Filtresi',
      'Basınç Regülatörü', 'Basınç Şalteri', 'Basınç Transmitteri',
      'Pneumatik Silindir - Tek Etkili', 'Pneumatik Silindir - Çift Etkili',
      'Pneumatik Motor', 'Hava Dağıtım Valfi',
      'Hızlı Bağlantı', 'Hava Hortumu', 'Plastik Boru',
      'Sessize Alıcı', 'Hava Tabancası', 'Püskürme Tabancası'
    ],

    'Hidrolik Sistemler': [
      'Hidrolik Pompa - Dişli', 'Hidrolik Pompa - Piston',
      'Hidrolik Motor', 'Hidrolik Silindir - Tek Etkili',
      'Hidrolik Silindir - Çift Etkili', 'Hidrolik Tank',
      'Hidrolik Filtre', 'Hidrolik Soğutucu',
      'Basınç Valfi', 'Yön Kontrol Valfi', 'Akış Kontrol Valfi',
      'Basınç Transmitteri', 'Seviye Transmitteri',
      'Hidrolik Hortum', 'Hidrolik Boru', 'Hızlı Bağlantı',
      'Manometre - Gliserinli', 'Akümülatör - Mesane Tipi'
    ],

    'Bilgisayar ve IT': [
      'Bilgisayar - Masaüstü', 'Bilgisayar - Dizüstü', 'Tablet',
      'Server - Rack', 'Server - Tower', 'NAS - Network Storage',
      'Switch - Managed', 'Switch - Unmanaged', 'Router - Enterprise',
      'Firewall - Network', 'Access Point - WiFi', 'Modem - ADSL',
      'UPS - Bilgisayar', 'Monitör - LCD', 'Monitör - LED',
      'Printer - Lazer', 'Printer - Inkjet', 'Scanner - Flatbed',
      'Projektör - LCD', 'Projektör - DLP', 'Kamera - IP',
      'Mikrofon - Kondens', 'Hoparlör - Aktif'
    ],

    'Güvenlik Ekipmanları': [
      'Güvenlik Kamerası - IP', 'Güvenlik Kamerası - Analog',
      'DVR - Kayıt Cihazı', 'NVR - Network Kayıt',
      'Alarm Paneli', 'Hareket Sensörü', 'Kapı Sensörü',
      'Cam Kırılma Sensörü', 'Duman Dedektörü', 'Yangın Alarmı',
      'Gaz Dedektörü - Yanıcı', 'Gaz Dedektörü - Zehirli',
      'Karbonmonoksit Dedektörü', 'Sprinkler Sistemi',
      'Yangın Söndürme Tüpü', 'Yangın Dolabı',
      'Acil Çıkış Işığı', 'Güvenlik Işığı', 'İtfaiye Sireni'
    ],

    'Çevre Ölçüm Cihazları': [
      'Nem Ölçer - Digital', 'Nem Ölçer - Analog', 'Higrometre',
      'Lüksmetre - Digital', 'Lüksmetre - Analog', 'UV Metre',
      'Ses Seviyesi Ölçer', 'Titreşim Ölçer', 'Rüzgar Hızı Ölçer',
      'Barometer', 'Altimetre', 'Hava Kalitesi Ölçer',
      'CO2 Ölçer', 'CO Ölçer', 'O2 Ölçer', 'VOC Ölçer',
      'Partikül Sayıcı', 'Formaldehit Ölçer',
      'Radyasyon Ölçer - Alpha', 'Radyasyon Ölçer - Beta',
      'Radyasyon Ölçer - Gamma', 'Elektromanyetik Alan Ölçer'
    ],

    'Laboratuvar Ekipmanları': [
      'Hassas Terazi - 0.1mg', 'Hassas Terazi - 0.01mg', 'Hassas Terazi - 1mg',
      'Analitik Terazi - 0.1mg', 'Analitik Terazi - 0.01mg',
      'pH Metre - Masaüstü', 'pH Metre - Taşınabilir',
      'Conductivity Metre', 'TDS Metre', 'ORP Metre',
      'Spektrofotometre - UV/VIS', 'Spektrofotometre - IR',
      'Kromatografi - HPLC', 'Kromatografi - GC',
      'Mikroskop - Optik', 'Mikroskop - Stereo',
      'Centrifüj - Masaüstü', 'Centrifüj - Soğutmalı',
      'İnkübatör - CO2', 'İnkübatör - Normal', 'Etüv - Kurutma',
      'Autoklav - Steam', 'Soğutucu - Ultralow', 'Donduruk - -80°C'
    ],

    'Diğer': [
      'Diğer Ölçüm Cihazı', 'Özel Ölçüm Aleti', 'Prototip Cihaz'
    ]
  };
  
  localStorage.setItem('equipment_names_by_category', JSON.stringify(defaultEquipmentNames));
  localStorage.setItem('equipment_names_version', '2.4');
  console.log('✅ Yeni ekipman adları yüklendi - Ölçüm Cihazları:', defaultEquipmentNames['Ölçüm Cihazları'].length, 'adet');
  return defaultEquipmentNames;
};

// Cihaz adları listesi (kullanıcı tarafından eklenenler kaydedilir)
const getEquipmentNames = (): string[] => {
  const stored = localStorage.getItem('equipment_names_list');
  if (stored) {
    return JSON.parse(stored);
  }
  
  const defaultNames = [
    'Kumpas', 'Mikrometre', 'Gönyemetre', 'Derinlik Mikrometresi', 'İç Çap Mikrometresi',
    'Dış Çap Mikrometresi', 'Yükseklik Ölçer', 'Çap Ölçer', 'Kalınlık Ölçer', 'Profil Ölçer',
    'Açı Ölçer', 'Gonyometre', 'Digital Açı Ölçer', 'İnklinometre', 'Niveau',
    'Termometre', 'Sıcaklık Sensörü', 'PT100', 'Termoçift', 'Kızılötesi Termometre',
    'Multimetre', 'Osiloskop', 'Güç Analizörü', 'Ohmmetre', 'Voltmetre', 'Ampermetre',
    'Manometre', 'Basınç Sensörü', 'Vakum Ölçer', 'Diferansiyel Basınç Ölçer',
    'Tartı', 'Hassas Terazi', 'Analitik Terazi', 'Platform Tartısı', 'Kanca Tartısı',
    'Nem Ölçer', 'Higrometre', 'pH Metre', 'Conductivity Metre', 'Lüksmetre',
    'Ses Seviyesi Ölçer', 'Titreşim Ölçer', 'Gaz Dedektörü', 'Oksijen Ölçer'
  ];
  
  localStorage.setItem('equipment_names_list', JSON.stringify(defaultNames));
  return defaultNames;
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

// Departmanlara göre pozisyon listesi
const getPositionsByDepartment = (department: string): string[] => {
  const positionsByDept: { [key: string]: string[] } = {
    'Kalite Güvence': [
      'Kalite Güvence Müdürü',
      'Kalite Güvence Uzmanı',
      'Kalite Güvence Teknisyeni',
      'Kalite Kontrol Elemanı',
      'Ürün Kalite Sorumlusu'
    ],
    'Üretim': [
      'Üretim Müdürü',
      'Üretim Şef',
      'Makine Operatörü',
      'Vardiya Amiri',
      'Üretim Teknisyeni',
      'Hat Lideri'
    ],
    'Ar-Ge': [
      'Ar-Ge Müdürü',
      'Ar-Ge Uzmanı',
      'Test Teknisyeni',
      'Laboratuvar Teknisyeni',
      'Ürün Geliştirme Uzmanı'
    ],
    'Satın Alma': [
      'Satın Alma Müdürü',
      'Satın Alma Uzmanı',
      'Tedarik Zinciri Uzmanı',
      'Malzeme Kontrol Elemanı'
    ],
    'Bakım': [
      'Bakım Müdürü',
      'Bakım Şef',
      'Makine Bakım Teknisyeni',
      'Elektrik Teknisyeni',
      'Mekanik Teknisyeni'
    ],
    'Depo': [
      'Depo Sorumlusu',
      'Depo Elemanı',
      'Sevkiyat Sorumlusu',
      'Forklift Operatörü'
    ],
    'Proses': [
      'Proses Müdürü',
      'Proses Uzmanı',
      'Kaynakçı',
      'Torna Tezgahı Operatörü',
      'CNC Operatörü'
    ],
    'SSH': [
      'SSH Müdürü',
      'SSH Uzmanı',
      'Servis Teknisyeni',
      'Saha Teknisyeni',
      'Müşteri Hizmetleri Uzmanı',
      'Teknik Destek Uzmanı',
      'Montaj Teknisyeni',
      'Bakım Teknisyeni'
    ]
  };
  
  return positionsByDept[department] || [
    'Uzman',
    'Teknisyen',
    'Elemanı',
    'Sorumlusu'
  ];
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

// Using Professional Design System Card
const EquipmentCard = styled(ProfessionalCard)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  alignItems: 'stretch',
  minHeight: 120, // Ensuring consistent height
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: `${BORDER_RADIUS.lg}px ${BORDER_RADIUS.lg}px 0 0`
  }
}));

// Using Professional Design System StatusChip
const StatusChip = ProfessionalStatusChip;

// 🔍 PROFESSIONAL SEARCH INPUT - Using Design System
const UltimateStableSearchInput = memo<{
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  resetTrigger?: any;
}>(({ value = '', onChange, placeholder = "", label = "", size = "small", fullWidth = true, resetTrigger }) => {
  const [inputValue, setInputValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update value when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Reset value when resetTrigger changes
  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      setInputValue('');
    }
  }, [resetTrigger]);
  
  // Simple input change handler with debounce
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Set new timeout for debounced callback
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  }, [onChange]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
  
  return (
    <ProfessionalTextField
      fullWidth={fullWidth}
      size={size}
      label={label}
      value={inputValue}
      onChange={handleChange}
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
      }}
    />
  );
});

const EquipmentCalibrationManagement: React.FC = () => {
  const { theme: muiTheme, appearanceSettings } = useThemeContext();

  // Using Professional Design System Accordion
  const StyledAccordion = ProfessionalAccordion;

  // Component state
  const [activeTab, setActiveTab] = useState(0);
  const [viewModalTab, setViewModalTab] = useState(0);
  const [expanded, setExpanded] = useState<string | false>('filters');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view' | 'calibration'>('create');
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
    responsiblePerson: '',
    dateRange: {
      start: '',
      end: ''
    },
    criticalOnly: false,
    overdueOnly: false
  });

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
    criticalEquipment: false,
    specifications: '',
    notes: '',
    measurementRange: '',
    measurementUncertainty: '',
    imageIds: [],
    certificateIds: []
  });

  // Equipment data - localStorage'dan yüklenir ve PDF depolama sistemine uyumlu hale getirilir
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => {
    const stored = localStorage.getItem('equipment_calibration_data');
    if (stored) {
      const equipmentData = JSON.parse(stored);
      // Eski verileri yeni formata dönüştür
      return equipmentData.map((equipment: any) => ({
        ...equipment,
        // Eski images ve certificates verilerini yeni formata dönüştür
        imageIds: equipment.imageIds || (equipment.images || []).map(() => `legacy_image_${Date.now()}_${Math.random()}`),
        certificateIds: equipment.certificateIds || (equipment.certificates || []).map(() => `legacy_cert_${Date.now()}_${Math.random()}`),
        // Eski alanları kaldır
        images: undefined,
        certificates: undefined
      }));
    }
    return [];
  });

  // Personnel data
  const [personnelList, setPersonnelList] = useState<Personnel[]>(() => getPersonnelData());

  // Sonraki kalibrasyon tarihini hesaplama fonksiyonu
  const calculateNextCalibrationDate = useCallback((lastDate: string, frequency: number): string => {
    if (!lastDate || !frequency) return '';
    
    const lastCalDate = new Date(lastDate);
    if (isNaN(lastCalDate.getTime())) return '';
    
    const nextDate = new Date(lastCalDate);
    nextDate.setMonth(nextDate.getMonth() + frequency);
    return nextDate.toISOString().split('T')[0];
  }, []);

  // Kalibrasyon durumunu otomatik güncelleme fonksiyonu
  const updateCalibrationStatus = useCallback((equipment: Equipment): Equipment => {
    // Önce nextCalibrationDate'i hesapla/düzelt
    let nextCalibrationDate = equipment.nextCalibrationDate;
    
    // Eğer nextCalibrationDate yoksa ama lastCalibrationDate ve frequency varsa hesapla
    if (!nextCalibrationDate && equipment.lastCalibrationDate && equipment.calibrationFrequency) {
      nextCalibrationDate = calculateNextCalibrationDate(equipment.lastCalibrationDate, equipment.calibrationFrequency);
    }
    
    // Eğer hala nextCalibrationDate yoksa, bugünden itibaren frequency kadar sonrasını kullan
    if (!nextCalibrationDate && equipment.calibrationFrequency) {
      const today = new Date();
      today.setMonth(today.getMonth() + equipment.calibrationFrequency);
      nextCalibrationDate = today.toISOString().split('T')[0];
    }
    
    if (!nextCalibrationDate) {
      return {
        ...equipment,
        calibrationStatus: 'invalid'
      };
    }
    
    const daysUntilDue = getDaysUntilDue(nextCalibrationDate);
    let newStatus: Equipment['calibrationStatus'] = 'valid';
    
    if (daysUntilDue < 0) {
      newStatus = 'overdue';
    } else if (daysUntilDue <= 30) {
      newStatus = 'due';
    } else {
      newStatus = 'valid';
    }
    
    return {
      ...equipment,
      nextCalibrationDate,
      calibrationStatus: newStatus
    };
  }, [calculateNextCalibrationDate]);

  // Tüm ekipmanların kalibrasyon durumunu güncelleme
  const updateAllCalibrationStatuses = useCallback(() => {
    setEquipmentList(prevList => {
      const updatedList = prevList.map(equipment => updateCalibrationStatus(equipment));
      // LocalStorage'a kaydet
      localStorage.setItem('equipment_calibration_data', JSON.stringify(updatedList));
      return updatedList;
    });
  }, [updateCalibrationStatus]);

  // Component mount edildiğinde localStorage verilerini sadece bir kez yükle
  useEffect(() => {
    // Sadece ilk yüklemede verileri güncelle - temizleme yapmadan
    const updatedSubCategoryRanges = getMeasurementRangesBySubCategory();
    setMeasurementRangesBySubCategory(updatedSubCategoryRanges);
    
    const updatedRanges = getMeasurementRangesByCategory();
    setMeasurementRanges(updatedRanges);
    
    const updatedSubCategoryUncertainties = getMeasurementUncertaintiesBySubCategory();
    setMeasurementUncertaintiesBySubCategory(updatedSubCategoryUncertainties);
    
    const updatedUncertainties = getMeasurementUncertaintiesByCategory();
    setMeasurementUncertainties(updatedUncertainties);

    // Kalibrasyon durumlarını otomatik güncelle
    updateAllCalibrationStatuses();
  }, [updateAllCalibrationStatuses]); // updateAllCalibrationStatuses'i dependency'e ekledim

  // Kalibrasyon durumlarını günlük otomatik güncelleme
  useEffect(() => {
    const interval = setInterval(() => {
      updateAllCalibrationStatuses();
    }, 24 * 60 * 60 * 1000); // 24 saatte bir güncelle

    return () => clearInterval(interval);
  }, [updateAllCalibrationStatuses]);



  // Helper fonksiyonlar için onChange handler'lar
  const handleCategoryChange = useCallback((newCategory: string) => {
    setFormData(prev => ({
      ...prev,
      category: newCategory,
      name: '',
      measurementRange: '',
      measurementUncertainty: '',
      customMeasurementRange: '',
      customMeasurementUncertainty: ''
    }));
  }, []);

  const handleNameChange = useCallback((newName: string) => {
    setFormData(prev => ({
      ...prev,
      name: newName,
      measurementRange: '',
      measurementUncertainty: '',
      customMeasurementRange: '',
      customMeasurementUncertainty: ''
    }));
  }, []);

  // Throttled localStorage save fonksiyonu
  const throttledSaveToLocalStorage = useCallback((key: string, data: any) => {
    // Throttle için basit bir debounce implementasyonu
    clearTimeout((window as any)[`timeout_${key}`]);
    (window as any)[`timeout_${key}`] = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(data));
    }, 300); // 300ms throttle
  }, []);

  // 🚀 PERFORMANCE: Enhanced filterOptions for autocomplete with virtualization
  const optimizedFilterOptions = useCallback((options: string[], params: any) => {
    const inputValue = params.inputValue.toLowerCase().trim();
    
    // Limit initial display for performance with large datasets (94 equipment)
    if (!inputValue) {
      return options.slice(0, 100); // Limit initial display to 100 items
    }
    
    // Fast string matching with early return for performance
    const filtered = options.filter(option => {
      return option.toLowerCase().includes(inputValue);
    });
    
    // Limit results to 50 items for optimal performance
    return filtered.slice(0, 50);
  }, []);
  
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
  const [isEditingPersonnel, setIsEditingPersonnel] = useState(false);
  const [editingPersonnelId, setEditingPersonnelId] = useState<string | null>(null);

  // Yeni eklenen state'ler - Dinamik yönetim için
  const [manufacturersList, setManufacturersList] = useState<string[]>(() => getManufacturers());
  const [modelsList, setModelsList] = useState<string[]>(() => getModels());
  const [equipmentNamesList, setEquipmentNamesList] = useState<string[]>(() => getEquipmentNames());
  const [calibrationCompaniesList, setCalibrationCompaniesList] = useState<string[]>(() => getCalibrationCompanies());
  
  // Kategoriye göre cihaz adları
  const [equipmentNamesByCategory, setEquipmentNamesByCategory] = useState<any>(() => getEquipmentNamesByCategory());
  
  // Ölçüm aralığı ve belirsizlik verileri
  const [measurementRanges, setMeasurementRanges] = useState<any>(() => getMeasurementRangesByCategory());
  const [measurementUncertainties, setMeasurementUncertainties] = useState<any>(() => getMeasurementUncertaintiesByCategory());
  const [measurementRangesBySubCategory, setMeasurementRangesBySubCategory] = useState<any>(() => getMeasurementRangesBySubCategory());
  const [measurementUncertaintiesBySubCategory, setMeasurementUncertaintiesBySubCategory] = useState<any>(() => getMeasurementUncertaintiesBySubCategory());
  
  // Dialog state'leri
  const [openManufacturerDialog, setOpenManufacturerDialog] = useState(false);
  const [openManufacturerManagementDialog, setOpenManufacturerManagementDialog] = useState(false);
  const [openModelDialog, setOpenModelDialog] = useState(false);
  const [openModelManagementDialog, setOpenModelManagementDialog] = useState(false);
  const [openEquipmentNameDialog, setOpenEquipmentNameDialog] = useState(false);
  const [openEquipmentNameManagementDialog, setOpenEquipmentNameManagementDialog] = useState(false);
  const [openCalibrationCompanyDialog, setOpenCalibrationCompanyDialog] = useState(false);
  
  // Ölçüm yönetimi dialog state'leri
  const [openMeasurementRangeManagementDialog, setOpenMeasurementRangeManagementDialog] = useState(false);
  const [openMeasurementUncertaintyManagementDialog, setOpenMeasurementUncertaintyManagementDialog] = useState(false);
  
  // Yeni ekleme için input state'leri
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [newCalibrationCompany, setNewCalibrationCompany] = useState('');
  const [newMeasurementRange, setNewMeasurementRange] = useState('');
  
  // PDF depolama sistemi için state'ler
  const [storageInfo, setStorageInfo] = useState<{
    certificateCount: number;
    imageCount: number;
    totalSize: number;
    storageEstimate?: any;
  }>({
    certificateCount: 0,
    imageCount: 0,
    totalSize: 0
  });
  
  // Dosya yükleme state'leri
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [fileUploadSuccess, setFileUploadSuccess] = useState<string | null>(null);
  const [newMeasurementUncertainty, setNewMeasurementUncertainty] = useState('');
  
  // PDF Storage fonksiyonları
  const handleCertificateUpload = async (event: React.ChangeEvent<HTMLInputElement>, equipmentId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya tipi kontrolü
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      setFileUploadError('Sadece PDF ve resim dosyaları yüklenebilir.');
      return;
    }

    // Dosya boyutu kontrolü (20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setFileUploadError('Dosya boyutu 20MB\'dan büyük olamaz.');
      return;
    }

    setUploadingFile(true);
    setFileUploadError(null);
    setFileUploadSuccess(null);

    try {
      // Dosyayı base64'e çevir
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        try {
          // IndexedDB'ye kaydet
          const certificateId = await equipmentPDFStorage.saveCertificate({
            equipmentId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData: base64Data,
            certificateNumber: `CERT-${Date.now()}`,
            calibrationDate: new Date().toISOString().split('T')[0],
            nextDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            calibratorName: 'Kalibratör',
            calibratorCompany: 'Kalibrasyon Firması',
            accreditationNumber: 'ACC-001',
            notes: 'Yüklenen sertifika'
          });

          // Equipment'ın certificateIds listesini güncelle
          const updatedEquipmentList = equipmentList.map(eq => 
            eq.id === equipmentId 
              ? { ...eq, certificateIds: [...(eq.certificateIds || []), certificateId] }
              : eq
          );
          
          setEquipmentList(updatedEquipmentList);
          localStorage.setItem('equipment_calibration_data', JSON.stringify(updatedEquipmentList));
          
          setFileUploadSuccess('Sertifika başarıyla yüklendi.');
          console.log('✅ Sertifika yüklendi:', certificateId);
          
        } catch (error) {
          console.error('❌ Sertifika yükleme hatası:', error);
          setFileUploadError('Sertifika yüklenirken bir hata oluştu.');
        } finally {
          setUploadingFile(false);
        }
      };

      reader.onerror = () => {
        setFileUploadError('Dosya okuma hatası.');
        setUploadingFile(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Dosya yükleme hatası:', error);
      setFileUploadError('Dosya yükleme hatası.');
      setUploadingFile(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, equipmentId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya tipi kontrolü
    if (!file.type.includes('image')) {
      setFileUploadError('Sadece resim dosyaları yüklenebilir.');
      return;
    }

    // Dosya boyutu kontrolü (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setFileUploadError('Dosya boyutu 10MB\'dan büyük olamaz.');
      return;
    }

    setUploadingFile(true);
    setFileUploadError(null);
    setFileUploadSuccess(null);

    try {
      // Dosyayı base64'e çevir
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        try {
          // IndexedDB'ye kaydet
          const imageId = await equipmentPDFStorage.saveImage({
            equipmentId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData: base64Data,
            description: 'Ekipman görseli'
          });

          // Equipment'ın imageIds listesini güncelle
          const updatedEquipmentList = equipmentList.map(eq => 
            eq.id === equipmentId 
              ? { ...eq, imageIds: [...(eq.imageIds || []), imageId] }
              : eq
          );
          
          setEquipmentList(updatedEquipmentList);
          localStorage.setItem('equipment_calibration_data', JSON.stringify(updatedEquipmentList));
          
          setFileUploadSuccess('Görsel başarıyla yüklendi.');
          console.log('✅ Görsel yüklendi:', imageId);
          
        } catch (error) {
          console.error('❌ Görsel yükleme hatası:', error);
          setFileUploadError('Görsel yüklenirken bir hata oluştu.');
        } finally {
          setUploadingFile(false);
        }
      };

      reader.onerror = () => {
        setFileUploadError('Dosya okuma hatası.');
        setUploadingFile(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Dosya yükleme hatası:', error);
      setFileUploadError('Dosya yükleme hatası.');
      setUploadingFile(false);
    }
  };

  const handleViewCertificate = async (certificateId: string) => {
    try {
      const certificate = await equipmentPDFStorage.getCertificate(certificateId);
      if (certificate && certificate.fileData) {
        // PDF'yi yeni sekmede aç
        const byteCharacters = atob(certificate.fileData.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: certificate.fileType });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('❌ Sertifika görüntüleme hatası:', error);
      setFileUploadError('Sertifika görüntülenirken bir hata oluştu.');
    }
  };

  const handleViewImage = async (imageId: string) => {
    try {
      const image = await equipmentPDFStorage.getImage(imageId);
      if (image && image.fileData) {
        // Resmi yeni sekmede aç
        const byteCharacters = atob(image.fileData.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: image.fileType });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('❌ Görsel görüntüleme hatası:', error);
      setFileUploadError('Görsel görüntülenirken bir hata oluştu.');
    }
  };

  const handleDownloadCertificate = async (certificateId: string) => {
    try {
      const certificate = await equipmentPDFStorage.getCertificate(certificateId);
      if (certificate && certificate.fileData) {
        // PDF'yi indir
        const byteCharacters = atob(certificate.fileData.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: certificate.fileType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = certificate.fileName || 'sertifika.pdf';
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('❌ Sertifika indirme hatası:', error);
      setFileUploadError('Sertifika indirilirken bir hata oluştu.');
    }
  };

  const handleDownloadImage = async (imageId: string) => {
    try {
      const image = await equipmentPDFStorage.getImage(imageId);
      if (image && image.fileData) {
        // Resmi indir
        const byteCharacters = atob(image.fileData.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: image.fileType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = image.fileName || 'gorsel.jpg';
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('❌ Görsel indirme hatası:', error);
      setFileUploadError('Görsel indirilirken bir hata oluştu.');
    }
  };

  const handleDeleteCertificate = async (certificateId: string, equipmentId: string) => {
    if (!window.confirm('Bu sertifikayı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await equipmentPDFStorage.deleteCertificate(certificateId);
      
      // Equipment'ın certificateIds listesinden çıkar
      const updatedEquipmentList = equipmentList.map(eq => 
        eq.id === equipmentId 
          ? { ...eq, certificateIds: (eq.certificateIds || []).filter(id => id !== certificateId) }
          : eq
      );
      
      setEquipmentList(updatedEquipmentList);
      localStorage.setItem('equipment_calibration_data', JSON.stringify(updatedEquipmentList));
      
      setFileUploadSuccess('Sertifika başarıyla silindi.');
      console.log('✅ Sertifika silindi:', certificateId);
      
    } catch (error) {
      console.error('❌ Sertifika silme hatası:', error);
      setFileUploadError('Sertifika silinirken bir hata oluştu.');
    }
  };

  const handleDeleteImage = async (imageId: string, equipmentId: string) => {
    if (!window.confirm('Bu görseli silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await equipmentPDFStorage.deleteImage(imageId);
      
      // Equipment'ın imageIds listesinden çıkar
      const updatedEquipmentList = equipmentList.map(eq => 
        eq.id === equipmentId 
          ? { ...eq, imageIds: (eq.imageIds || []).filter(id => id !== imageId) }
          : eq
      );
      
      setEquipmentList(updatedEquipmentList);
      localStorage.setItem('equipment_calibration_data', JSON.stringify(updatedEquipmentList));
      
      setFileUploadSuccess('Görsel başarıyla silindi.');
      console.log('✅ Görsel silindi:', imageId);
      
    } catch (error) {
      console.error('❌ Görsel silme hatası:', error);
      setFileUploadError('Görsel silinirken bir hata oluştu.');
    }
  };

  // Storage durumu güncelleme
  const updateStorageInfo = async () => {
    try {
      const info = await equipmentPDFStorage.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('❌ Storage info alınamadı:', error);
    }
  };

  // Storage temizleme fonksiyonları
  const handleClearAllCertificates = async () => {
    if (!window.confirm('Tüm sertifikaları silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      await equipmentPDFStorage.clearAllCertificates();
      
      // Tüm equipmentların certificateIds listesini temizle
      const updatedEquipmentList = equipmentList.map(eq => ({
        ...eq,
        certificateIds: []
      }));
      
      setEquipmentList(updatedEquipmentList);
      localStorage.setItem('equipment_calibration_data', JSON.stringify(updatedEquipmentList));
      
      setFileUploadSuccess('Tüm sertifikalar temizlendi.');
      await updateStorageInfo();
      
    } catch (error) {
      console.error('❌ Sertifika temizleme hatası:', error);
      setFileUploadError('Sertifikalar temizlenirken bir hata oluştu.');
    }
  };

  const handleClearAllImages = async () => {
    if (!window.confirm('Tüm görselleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      await equipmentPDFStorage.clearAllImages();
      
      // Tüm equipmentların imageIds listesini temizle
      const updatedEquipmentList = equipmentList.map(eq => ({
        ...eq,
        imageIds: []
      }));
      
      setEquipmentList(updatedEquipmentList);
      localStorage.setItem('equipment_calibration_data', JSON.stringify(updatedEquipmentList));
      
      setFileUploadSuccess('Tüm görseller temizlendi.');
      await updateStorageInfo();
      
    } catch (error) {
      console.error('❌ Görsel temizleme hatası:', error);
      setFileUploadError('Görseller temizlenirken bir hata oluştu.');
    }
  };

  // Sayfa yüklendiğinde storage durumunu güncelle
  useEffect(() => {
    updateStorageInfo();
  }, []);

  // Dosya yükleme mesajlarını otomatik temizleme
  useEffect(() => {
    if (fileUploadSuccess) {
      const timer = setTimeout(() => {
        setFileUploadSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [fileUploadSuccess]);

  useEffect(() => {
    if (fileUploadError) {
      const timer = setTimeout(() => {
        setFileUploadError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [fileUploadError]);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // 🚀 PERFORMANCE: Memoized form handlers to prevent unnecessary re-renders
  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Ölçüm aralığı seçimi için memoized helper fonksiyon
  const getMeasurementRangeOptions = useMemo(() => {
    // Önce cihaz adına göre özel aralıkları kontrol et
    if (formData.name && measurementRangesBySubCategory[formData.name]) {
      const subCategoryRanges = measurementRangesBySubCategory[formData.name];
      if (Array.isArray(subCategoryRanges) && subCategoryRanges.length > 0) {
        return subCategoryRanges;
      }
    }
    // Kategori bazlı aralıkları getir
    else if (formData.category) {
      const categoryRanges = measurementRanges[formData.category] || [];
      // Boş array ise varsayılan değerleri kullan
      return categoryRanges.length > 0 ? categoryRanges : (measurementRanges['Diğer'] || []);
    }
    // Hiçbir seçim yoksa boş array
    return [];
  }, [formData.name, formData.category, measurementRangesBySubCategory, measurementRanges]);

  // Ölçüm belirsizliği seçimi için memoized helper fonksiyon
  const getMeasurementUncertaintyOptions = useMemo(() => {
    // Önce cihaz adına göre özel belirsizlikleri kontrol et
    if (formData.name && measurementUncertaintiesBySubCategory[formData.name]) {
      const subCategoryUncertainties = measurementUncertaintiesBySubCategory[formData.name];
      if (Array.isArray(subCategoryUncertainties) && subCategoryUncertainties.length > 0) {
        return subCategoryUncertainties;
      }
    }
    // Kategori bazlı belirsizlikleri getir
    else if (formData.category) {
      const categoryUncertainties = measurementUncertainties[formData.category] || [];
      // Boş array ise varsayılan değerleri kullan
      return categoryUncertainties.length > 0 ? categoryUncertainties : (measurementUncertainties['Diğer'] || []);
    }
    // Hiçbir seçim yoksa boş array
    return [];
  }, [formData.name, formData.category, measurementUncertaintiesBySubCategory, measurementUncertainties]);

  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Memoized filtered equipment list - sadece equipmentList veya filters değiştiğinde yeniden hesapla
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(equipment => {
      // 🔍 GENİŞLETİLMİŞ ARAMA FONKSİYONU - Kalibrasyon sertifika numarası dahil
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchFields = [
          equipment.name,
          equipment.equipmentCode,
          equipment.serialNumber,
          equipment.manufacturer,
          equipment.model,
          equipment.lastCalibrationCertificateNumber, // ✅ Kalibrasyon sertifika numarası
          equipment.calibrationCompany,
          equipment.specifications,
          equipment.notes,
          // Sertifikalar array'inde arama - artık certificateIds kullanıyoruz
          ...(equipment.certificateIds || []).map(certId => certId),
          // Sorumlu personel bilgileri
          equipment.responsiblePersonName,
          equipment.responsiblePersonSicilNo
        ];
        
        const hasMatch = searchFields.some(field => 
          field && field.toString().toLowerCase().includes(searchLower)
        );
        
        if (!hasMatch) return false;
      }
      if (filters.category && equipment.category !== filters.category) return false;
      if (filters.location && equipment.location !== filters.location) return false;
      if (filters.department && equipment.department !== filters.department) return false;
      if (filters.status && equipment.status !== filters.status) return false;
      if (filters.calibrationStatus && equipment.calibrationStatus !== filters.calibrationStatus) return false;
      if (filters.responsiblePerson && !equipment.responsiblePersons.includes(filters.responsiblePerson)) return false;
      if (filters.criticalOnly && !equipment.criticalEquipment) return false;
      if (filters.overdueOnly && equipment.calibrationStatus !== 'overdue') return false;
      return true;
    });
  }, [equipmentList, filters]);

  // Utility function - getDaysUntilDue fonksiyonu metrics'ten önce tanımlanmalı
  const getDaysUntilDue = (dueDateString: string) => {
    if (!dueDateString) return 999; // Çok büyük bir sayı döndür ki sorun yaratmasın
    const dueDate = new Date(dueDateString);
    if (isNaN(dueDate.getTime())) return 999; // Geçersiz tarih ise güvenli değer döndür
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Memoized metrics calculation - sadece filteredEquipment değiştiğinde yeniden hesapla
  const metrics = useMemo(() => {
    const totalEquipment = filteredEquipment.length;
    const activeEquipment = filteredEquipment.filter(eq => eq.status === 'active').length;
    const criticalEquipment = filteredEquipment.filter(eq => eq.criticalEquipment).length;
    const calibrationDue = filteredEquipment.filter(eq => eq.calibrationStatus === 'due' || eq.calibrationStatus === 'overdue').length;

    // Detaylı kalibrasyon takibi
    const today = new Date();
    const overdueEquipment = filteredEquipment.filter(eq => {
      if (!eq.nextCalibrationDate) return false;
      return getDaysUntilDue(eq.nextCalibrationDate) < 0;
    });
    
    const critical1Day = filteredEquipment.filter(eq => {
      if (!eq.nextCalibrationDate) return false;
      const days = getDaysUntilDue(eq.nextCalibrationDate);
      return days >= 0 && days <= 1;
    });
    
    const urgent7Days = filteredEquipment.filter(eq => {
      if (!eq.nextCalibrationDate) return false;
      const days = getDaysUntilDue(eq.nextCalibrationDate);
      return days > 1 && days <= 7;
    });
    
    const warning30Days = filteredEquipment.filter(eq => {
      if (!eq.nextCalibrationDate) return false;
      const days = getDaysUntilDue(eq.nextCalibrationDate);
      return days > 7 && days <= 30;
    });

    const validEquipment = filteredEquipment.filter(eq => {
      if (!eq.nextCalibrationDate) return false;
      return getDaysUntilDue(eq.nextCalibrationDate) > 30;
    });

    // Kalibrasyon durumu dağılımı
    const calibrationDistribution = [
      { name: 'Geçerli', value: validEquipment.length, color: '#4caf50' },
      { name: '30 Gün İçinde', value: warning30Days.length, color: '#ffc107' },
      { name: '7 Gün İçinde', value: urgent7Days.length, color: '#ff9800' },
      { name: '1 Gün İçinde', value: critical1Day.length, color: '#f44336' },
      { name: 'Vadesi Geçen', value: overdueEquipment.length, color: '#d32f2f' }
    ];

    // Status distribution for charts
    const statusDistribution = [
      { name: 'Aktif', value: filteredEquipment.filter(eq => eq.status === 'active').length, color: '#4caf50' },
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
      statusDistribution,
      calibrationStatusDistribution,
      categoryDistribution,
      calibrationDistribution,
      filteredEquipment,
      // Detaylı kalibrasyon takip verileri
      overdueEquipment,
      critical1Day,
      urgent7Days,
      warning30Days,
      validEquipment
    };
  }, [filteredEquipment]); // Sadece filteredEquipment değişikliğinde yeniden hesapla

  // Dialog kapama optimizasyonu
  const closeDialog = useCallback(() => {
    setOpenDialog(false);
    // State cleanup
    setTimeout(() => {
      setSelectedEquipment(null);
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
                        criticalEquipment: false,
        specifications: '',
        notes: '',
        measurementRange: '',
        measurementUncertainty: ''
      });
      setActiveStep(0);
      setDialogMode('create');
      setDialogTitle('');
    }, 150); // Dialog kapatma animasyonu için kısa delay
  }, []);

  // Modal scroll prevention
  useEffect(() => {
    if (openDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [openDialog]);

  // Performance optimizasyonu için event listener cleanup
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openDialog) {
        closeDialog();
      }
    };

    const handleUnload = () => {
      document.body.style.overflow = 'unset';
    };

    document.addEventListener('keydown', handleEscape);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [openDialog, closeDialog]);

  const openCreateDialog = useCallback(() => {
    // Yeni ekipman kodu otomatik oluştur (001, 002, 003...)
    // En yüksek mevcut kodu bul ve +1 yap
    const existingCodes = equipmentList.map(eq => {
      const codeNumber = parseInt(eq.equipmentCode);
      return isNaN(codeNumber) ? 0 : codeNumber;
    });
    const maxCode = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
    const nextCode = (maxCode + 1).toString().padStart(3, '0');
    
    setDialogMode('create');
    setDialogTitle('Yeni Ekipman Kaydı');
    setSelectedPersonnel([]);
    setFormData({
      equipmentCode: nextCode,
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
      criticalEquipment: false,
      specifications: '',
      notes: '',
      measurementRange: '',
      measurementUncertainty: ''
    });
    setActiveStep(0);
    setOpenDialog(true);
  }, [equipmentList]);

  // ✅ İşlem butonları için fonksiyonlar eklendi
  const handleViewEquipment = useCallback((equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setDialogMode('view');
    setDialogTitle(`${equipment.name} - Detaylar`);
    setViewModalTab(0); // Tab'ı sıfırla
    setOpenDialog(true);
  }, []);

  const handleEditEquipment = useCallback((equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setDialogTitle(`${equipment.name} - Düzenle`);
    setSelectedPersonnel(equipment.responsiblePersons || []);
    setFormData({
      id: equipment.id,
      equipmentCode: equipment.equipmentCode,
      name: equipment.name,
      manufacturer: equipment.manufacturer,
      model: equipment.model,
      serialNumber: equipment.serialNumber,
      category: equipment.category,
      location: equipment.location,
      department: equipment.department,
      responsiblePersons: equipment.responsiblePersons,
      purchaseDate: equipment.purchaseDate,
      installationDate: equipment.installationDate,
      warrantyExpiry: equipment.warrantyExpiry,
      status: equipment.status,
      calibrationRequired: equipment.calibrationRequired,
      calibrationFrequency: equipment.calibrationFrequency,
      lastCalibrationDate: equipment.lastCalibrationDate,
      nextCalibrationDate: equipment.nextCalibrationDate,
      calibrationStatus: equipment.calibrationStatus,
      criticalEquipment: equipment.criticalEquipment,
      specifications: equipment.specifications,
      operatingManual: equipment.operatingManual,
      notes: equipment.notes,
      qrCode: equipment.qrCode,
      imageIds: equipment.imageIds || [],
      certificateIds: equipment.certificateIds || [],
      measurementRange: equipment.measurementRange || '',
      measurementUncertainty: equipment.measurementUncertainty || '',
      customMeasurementRange: equipment.customMeasurementRange || '',
      customMeasurementUncertainty: equipment.customMeasurementUncertainty,
      calibrationCompany: equipment.calibrationCompany,
      lastCalibrationCertificateNumber: equipment.lastCalibrationCertificateNumber,
      responsiblePersonName: equipment.responsiblePersonName,
      responsiblePersonSicilNo: equipment.responsiblePersonSicilNo
    });
    setDialogMode('edit');
    setActiveStep(0);
    setOpenDialog(true);
  }, []);

  const handleCalibration = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setDialogMode('calibration');
    setDialogTitle(`Kalibrasyon İşlemi - ${equipment.name}`);
    setOpenDialog(true);
  };

  

  const handleDeleteEquipment = (equipment: Equipment) => {
    if (window.confirm(`"${equipment.name}" ekipmanını silmek istediğinize emin misiniz?`)) {
      setEquipmentList(prevList => prevList.filter(eq => eq.id !== equipment.id));
      // Success notification can be added here
      console.log(`${equipment.name} ekipmanı silindi`);
    }
  };

  const handleScrapEquipment = (equipment: Equipment) => {
    if (window.confirm(`"${equipment.name}" ekipmanını hurdaya ayırmak istediğinize emin misiniz?`)) {
      setEquipmentList(prevList => {
        const updatedList = prevList.map(eq => 
          eq.id === equipment.id 
            ? { ...eq, status: 'scrapped' as const, notes: `${eq.notes ? eq.notes + '\n' : ''}Hurdaya Ayrılma Tarihi: ${new Date().toLocaleDateString('tr-TR')}` }
            : eq
        );
        // LocalStorage'a kaydet
        localStorage.setItem('equipment_calibration_data', JSON.stringify(updatedList));
        return updatedList;
      });
      console.log(`${equipment.name} ekipmanı hurdaya ayrıldı`);
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
      case 'fail':
      case 'critical':
        return <ErrorIcon />;
      
      case 'calibration':
        return <ScienceIcon />;
      case 'scrapped':
        return <DeleteIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('tr-TR');
  };

  // Kalibrasyon uyarı seviyesini belirleme
  const getCalibrationWarningLevel = useCallback((equipment: Equipment) => {
    if (!equipment.nextCalibrationDate) return 'none';
    
    const daysUntilDue = getDaysUntilDue(equipment.nextCalibrationDate);
    
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 1) return 'critical';
    if (daysUntilDue <= 7) return 'urgent';
    if (daysUntilDue <= 30) return 'warning';
    return 'normal';
  }, []);

  // Kalibrasyon uyarı rengini belirleme
  const getCalibrationWarningColor = useCallback((warningLevel: string) => {
    switch (warningLevel) {
      case 'overdue': return '#d32f2f';
      case 'critical': return '#f44336';
      case 'urgent': return '#ff9800';
      case 'warning': return '#ffc107';
      case 'normal': return '#4caf50';
      default: return '#9e9e9e';
    }
  }, []);

  // Kalibrasyon bildirimleri sistemi - useMemo ile optimize edildi
  const notifications = useMemo(() => {
    const notificationList: { id: string; type: 'error' | 'warning' | 'info'; message: string; equipment: Equipment }[] = [];
    
    equipmentList.forEach(equipment => {
      if (!equipment.nextCalibrationDate) return;
      
      const daysUntilDue = getDaysUntilDue(equipment.nextCalibrationDate);
      const warningLevel = getCalibrationWarningLevel(equipment);
      
      if (warningLevel === 'overdue') {
        notificationList.push({
          id: `overdue-${equipment.id}`,
          type: 'error',
          message: `${equipment.name} (${equipment.equipmentCode}) kalibrasyonu ${Math.abs(daysUntilDue)} gün önce dolmuş! Acil kalibrasyon gerekli.`,
          equipment
        });
      } else if (warningLevel === 'critical') {
        notificationList.push({
          id: `critical-${equipment.id}`,
          type: 'error',
          message: `${equipment.name} (${equipment.equipmentCode}) kalibrasyonu ${daysUntilDue} gün içinde dolacak! Hemen ilgilenin.`,
          equipment
        });
      } else if (warningLevel === 'urgent') {
        notificationList.push({
          id: `urgent-${equipment.id}`,
          type: 'warning',
          message: `${equipment.name} (${equipment.equipmentCode}) kalibrasyonu ${daysUntilDue} gün içinde dolacak. Planlama yapın.`,
          equipment
        });
      } else if (warningLevel === 'warning') {
        notificationList.push({
          id: `warning-${equipment.id}`,
          type: 'info',
          message: `${equipment.name} (${equipment.equipmentCode}) kalibrasyonu ${daysUntilDue} gün içinde dolacak. Hazırlık yapabilirsiniz.`,
          equipment
        });
      }
    });
    
    return notificationList.sort((a, b) => {
      if (a.type === 'error' && b.type !== 'error') return -1;
      if (a.type !== 'error' && b.type === 'error') return 1;
      if (a.type === 'warning' && b.type === 'info') return -1;
      if (a.type === 'info' && b.type === 'warning') return 1;
      return 0;
    });
  }, [equipmentList]); // Sadece equipmentList değiştiğinde yeniden hesapla

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  // Personel düzenleme fonksiyonu
  const handleEditPersonnel = (personnelId: string) => {
    const personnel = personnelList.find(p => p.id === personnelId);
    if (personnel) {
      setNewPersonnelData({
        sicilNo: personnel.sicilNo,
        name: personnel.name,
        department: personnel.department,
        position: personnel.position || ''
      });
      setIsEditingPersonnel(true);
      setEditingPersonnelId(personnelId);
      setOpenPersonnelDialog(true);
    }
  };

  // Yeni personel kaydetme fonksiyonu
  const handleSavePersonnel = () => {
    if (!newPersonnelData.sicilNo || !newPersonnelData.name || !newPersonnelData.department) {
      alert('Sicil No, Ad Soyad ve Departman alanları zorunludur!');
      return;
    }

    if (isEditingPersonnel) {
      // Düzenleme modu
      const updatedPersonnelList = personnelList.map(p => 
        p.id === editingPersonnelId ? {
          ...p,
          sicilNo: newPersonnelData.sicilNo,
          name: newPersonnelData.name,
          department: newPersonnelData.department,
          position: newPersonnelData.position
        } : p
      );
      setPersonnelList(updatedPersonnelList);
      localStorage.setItem('personnel_data', JSON.stringify(updatedPersonnelList));
      
      // Düzenleme modundan çık
      setIsEditingPersonnel(false);
      setEditingPersonnelId(null);
    } else {
      // Yeni ekleme modu
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
      localStorage.setItem('personnel_data', JSON.stringify(updatedPersonnelList));
    }

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

  const handleSaveEquipmentName = () => {
    if (newEquipmentName.trim()) {
      const updatedList = [...equipmentNamesList, newEquipmentName.trim()];
      setEquipmentNamesList(updatedList);
      localStorage.setItem('equipment_names_list', JSON.stringify(updatedList));
      setNewEquipmentName('');
      setOpenEquipmentNameDialog(false);
    }
  };

  const handleDeleteEquipmentName = (name: string) => {
    if (window.confirm(`${name} cihaz adını listeden çıkarmak istediğinize emin misiniz?`)) {
      const updatedList = equipmentNamesList.filter(n => n !== name);
      setEquipmentNamesList(updatedList);
      localStorage.setItem('equipment_names_list', JSON.stringify(updatedList));
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

  // Ölçüm aralığı yönetimi fonksiyonları
  const handleSaveMeasurementRange = () => {
    if (newMeasurementRange.trim() && formData.category) {
      // Eğer mm eklenmemişse otomatik ekle
      const range = newMeasurementRange.trim().includes('mm') ? newMeasurementRange.trim() : `${newMeasurementRange.trim()} mm`;
      
      const updatedRanges = {...measurementRanges};
      // Mevcut aralıklarda var mı kontrol et
      const existingRanges = updatedRanges[formData.category] || [];
      if (!existingRanges.includes(range)) {
        updatedRanges[formData.category] = [...existingRanges, range];
        setMeasurementRanges(updatedRanges);
        throttledSaveToLocalStorage('measurement_ranges_by_category', updatedRanges);
        
        // Form'a otomatik seç
        setFormData(prev => ({...prev, measurementRange: range}));
      }
      
      setNewMeasurementRange('');
      setOpenMeasurementRangeManagementDialog(false);
    }
  };

  const handleDeleteMeasurementRange = (range: string) => {
    if (formData.category) {
      const updatedRanges = {...measurementRanges};
      updatedRanges[formData.category] = updatedRanges[formData.category].filter((r: string) => r !== range);
      setMeasurementRanges(updatedRanges);
      throttledSaveToLocalStorage('measurement_ranges_by_category', updatedRanges);
    }
  };

  // Ölçüm belirsizliği yönetimi fonksiyonları
  const handleSaveMeasurementUncertainty = () => {
    if (newMeasurementUncertainty.trim() && formData.category) {
      // Eğer ± ve mm eklenmemişse otomatik ekle
      let uncertainty = newMeasurementUncertainty.trim();
      if (!uncertainty.startsWith('±')) uncertainty = `±${uncertainty}`;
      if (!uncertainty.includes('mm')) uncertainty = `${uncertainty} mm`;
      
      const updatedUncertainties = {...measurementUncertainties};
      // Mevcut belirsizliklerde var mı kontrol et
      const existingUncertainties = updatedUncertainties[formData.category] || [];
      if (!existingUncertainties.includes(uncertainty)) {
        updatedUncertainties[formData.category] = [...existingUncertainties, uncertainty];
        setMeasurementUncertainties(updatedUncertainties);
        throttledSaveToLocalStorage('measurement_uncertainties_by_category', updatedUncertainties);
        
        // Form'a otomatik seç
        setFormData(prev => ({...prev, measurementUncertainty: uncertainty}));
      }
      
      setNewMeasurementUncertainty('');
      setOpenMeasurementUncertaintyManagementDialog(false);
    }
  };

  const handleDeleteMeasurementUncertainty = (uncertainty: string) => {
    if (formData.category) {
      const updatedUncertainties = {...measurementUncertainties};
      updatedUncertainties[formData.category] = updatedUncertainties[formData.category].filter((u: string) => u !== uncertainty);
      setMeasurementUncertainties(updatedUncertainties);
      throttledSaveToLocalStorage('measurement_uncertainties_by_category', updatedUncertainties);
    }
  };

  // Form kaydetme fonksiyonu
  const handleSave = () => {
    // Yeni cihaz adını otomatik olarak listeye ekle
    if (formData.name && formData.name.trim() && !equipmentNamesList.includes(formData.name.trim())) {
      const updatedNames = [...equipmentNamesList, formData.name.trim()];
      setEquipmentNamesList(updatedNames);
      throttledSaveToLocalStorage('equipment_names_list', updatedNames);
    }

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
      criticalEquipment: formData.criticalEquipment || false,
      specifications: formData.specifications || '',
      operatingManual: '',
      notes: formData.notes || '',
      imageIds: [],
      certificateIds: [],
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
      throttledSaveToLocalStorage('equipment_calibration_data', updatedList);
    } else {
      // Yeni ekleme
      const updatedList = [...equipmentList, newEquipment];
      setEquipmentList(updatedList);
      throttledSaveToLocalStorage('equipment_calibration_data', updatedList);
    }

    // Dialog'u kapat ve formu temizle
    closeDialog();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Üst Aksiyon Çubuğu */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          size="large"
          sx={{ 
            px: 3,
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
          }}
        >
          Yeni Ekipman
        </Button>
        
        {/* Hızlı Filtre Butonları */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={filters.overdueOnly ? "contained" : "outlined"}
            color="error"
            size="small"
            onClick={() => handleFilterChange('overdueOnly', !filters.overdueOnly)}
            startIcon={<ErrorIcon />}
          >
            Vadesi Geçen ({metrics.overdueEquipment.length})
          </Button>
          <Button
            variant={filters.calibrationStatus === 'due' ? "contained" : "outlined"}
            color="warning"
            size="small"
            onClick={() => handleFilterChange('calibrationStatus', filters.calibrationStatus === 'due' ? '' : 'due')}
            startIcon={<WarningIcon />}
          >
            Vadesi Yaklaşan ({metrics.warning30Days.length + metrics.urgent7Days.length + metrics.critical1Day.length})
          </Button>
          <Button
            variant={filters.criticalOnly ? "contained" : "outlined"}
            color="error"
            size="small"
            onClick={() => handleFilterChange('criticalOnly', !filters.criticalOnly)}
            startIcon={<UrgentIcon />}
          >
            Kritik ({metrics.criticalEquipment})
          </Button>
        </Box>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Dashboard" icon={<DashboardIcon />} />
        <Tab label="Ekipman Listesi" icon={<EngineeringIcon />} />
        <Tab label="Kalibrasyon Takibi" icon={<ScienceIcon />} />

        <Tab label="Planlar ve Uyarılar" icon={<ScheduleIcon />} />
        <Tab label="Raporlar" icon={<AssessmentIcon />} />
      </Tabs>

      {/* Dashboard Tab */}
      {activeTab === 0 && (
        <Box>

          {/* Özet Kartları */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, alignItems: 'stretch' }}>
            <Box sx={{ flex: '1 1 240px', minWidth: '240px' }}>
              <EquipmentCard sx={{ height: 120 }}>
                <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
              <EquipmentCard sx={{ height: 120 }}>
                <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
              <EquipmentCard sx={{ height: 120 }}>
                <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
              <EquipmentCard sx={{ height: 120 }}>
                <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
          </Box>

          {/* Detaylı Kalibrasyon Takip Kartları */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, alignItems: 'stretch' }}>
            <Box sx={{ flex: '1 1 240px', minWidth: '240px' }}>
              <EquipmentCard 
                sx={{ 
                  height: 140,
                  background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  '&::before': { display: 'none' }
                }}
                onClick={() => setFilters(prev => ({ ...prev, calibrationStatus: 'overdue' }))}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {metrics.overdueEquipment.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Vadesi Geçen
                      </Typography>
                    </Box>
                    <ErrorIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                  {metrics.overdueEquipment.length > 0 && (
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
                      Acil kalibrasyon gerekli!
                    </Typography>
                  )}
                </CardContent>
              </EquipmentCard>
            </Box>
            
            <Box sx={{ flex: '1 1 240px', minWidth: '240px' }}>
              <EquipmentCard 
                sx={{ 
                  height: 140,
                  background: 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  '&::before': { display: 'none' }
                }}
                onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {metrics.critical1Day.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        1 Gün İçinde
                      </Typography>
                    </Box>
                    <UrgentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                  {metrics.critical1Day.length > 0 && (
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
                      Hemen ilgilenin!
                    </Typography>
                  )}
                </CardContent>
              </EquipmentCard>
            </Box>
            
            <Box sx={{ flex: '1 1 240px', minWidth: '240px' }}>
              <EquipmentCard 
                sx={{ 
                  height: 140,
                  background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  '&::before': { display: 'none' }
                }}
                onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {metrics.urgent7Days.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        7 Gün İçinde
                      </Typography>
                    </Box>
                    <WarningIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                  {metrics.urgent7Days.length > 0 && (
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
                      Planlama yapın
                    </Typography>
                  )}
                </CardContent>
              </EquipmentCard>
            </Box>
            
            <Box sx={{ flex: '1 1 240px', minWidth: '240px' }}>
              <EquipmentCard 
                sx={{ 
                  height: 140,
                  background: 'linear-gradient(135deg, #ffc107 0%, #ffeb3b 100%)',
                  color: '#333',
                  cursor: 'pointer',
                  '&::before': { display: 'none' }
                }}
                onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {metrics.warning30Days.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        30 Gün İçinde
                      </Typography>
                    </Box>
                    <ScheduleIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                  </Box>
                  {metrics.warning30Days.length > 0 && (
                    <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                      Hazırlık yapabilirsiniz
                    </Typography>
                  )}
                </CardContent>
              </EquipmentCard>
            </Box>
            
            <Box sx={{ flex: '1 1 240px', minWidth: '240px' }}>
              <EquipmentCard 
                sx={{ 
                  height: 140,
                  background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  '&::before': { display: 'none' }
                }}
                onClick={() => setFilters(prev => ({ ...prev, calibrationStatus: 'valid' }))}
              >
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {metrics.validEquipment.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Geçerli Kalibrasyon
                      </Typography>
                    </Box>
                    <VerifiedIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
                    30+ gün geçerli
                  </Typography>
                </CardContent>
              </EquipmentCard>
            </Box>
          </Box>

          {/* Kalibrasyon Bildirimleri */}
          {notifications.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Paper sx={{ p: 3, borderRadius: 3, border: notifications.some(n => n.type === 'error') ? '2px solid #d32f2f' : '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <NotificationsIcon color={notifications.some(n => n.type === 'error') ? 'error' : 'warning'} />
                  <Typography variant="h6" fontWeight={600}>
                    Kalibrasyon Bildirimleri ({notifications.length})
                  </Typography>
                </Box>
                
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {notifications.map((notification) => (
                    <Alert 
                      key={notification.id}
                      severity={notification.type}
                      sx={{ 
                        mb: 2, 
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 2 }
                      }}
                      onClick={() => {
                        setFilters(prev => ({ ...prev, searchTerm: notification.equipment.name }));
                        setActiveTab(1);
                      }}
                      action={
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEquipment(notification.equipment);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <Typography variant="body2">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
                        Kategori: {notification.equipment.category} | Lokasyon: {notification.equipment.location}
                      </Typography>
                    </Alert>
                  ))}
                </Box>
              </Paper>
            </Box>
          )}

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
          {/* Ekipman Listesi İçin Kompakt Filtreler */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
                <UltraIsolatedSearchInput
                  label="Ekipman Arama"
                  placeholder="Ekipman adı, kodu, seri no, sertifika no, üretici ile arayın..."
                  initialValue={filters.searchTerm}
                  onDebouncedChange={handleDebouncedSearchChange}
                  fullWidth
                  size="small"
                  clearTrigger={clearTrigger}
                />
              </Box>
              
              <Box sx={{ flex: '0 0 150px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {EQUIPMENT_CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: '0 0 120px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Lokasyon</InputLabel>
                  <Select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {LOCATIONS.map((location) => (
                      <MenuItem key={location} value={location}>{location}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: '0 0 140px' }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Kalibrasyon</InputLabel>
                  <Select
                    value={filters.calibrationStatus}
                    onChange={(e) => handleFilterChange('calibrationStatus', e.target.value)}
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="valid">✅ Geçerli</MenuItem>
                    <MenuItem value="due">⚠️ Vadesi Yakın</MenuItem>
                    <MenuItem value="overdue">❌ Vadesi Geçen</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={() => {
                  console.log('🧹 Tüm filtreler temizleniyor...');
                  setFilters({
                    searchTerm: '',
                    category: '',
                    location: '',
                    department: '',
                    status: '',
                    calibrationStatus: '',
                    responsiblePerson: '',
                    dateRange: { start: '', end: '' },
                    criticalOnly: false,
                    overdueOnly: false
                  });
                  // Clear trigger ile arama kutusunu da temizle
                  setClearTrigger(prev => prev + 1);
                  console.log('🧹 Clear trigger tetiklendi, arama kutusu temizleniyor');
                }}
                sx={{ minWidth: 'auto' }}
              >
                Temizle
              </Button>
            </Box>
            
            {/* Filtre Durumu Göstergesi */}
            {Object.values(filters).some(v => v !== '' && !(typeof v === 'object' && !v.start && !v.end) && v !== false) && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Aktif Filtreler:
                </Typography>
                {filters.searchTerm && (
                  <Chip 
                    label={`Arama: "${filters.searchTerm}"`}
                    size="small"
                    onDelete={() => handleFilterChange('searchTerm', '')}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {filters.category && (
                  <Chip 
                    label={`Kategori: ${filters.category}`}
                    size="small"
                    onDelete={() => handleFilterChange('category', '')}
                    color="secondary"
                    variant="outlined"
                  />
                )}
                {filters.calibrationStatus && (
                  <Chip 
                    label={`Kalibrasyon: ${
                      filters.calibrationStatus === 'valid' ? 'Geçerli' :
                      filters.calibrationStatus === 'due' ? 'Vadesi Yakın' :
                      filters.calibrationStatus === 'overdue' ? 'Vadesi Geçen' : filters.calibrationStatus
                    }`}
                    size="small"
                    onDelete={() => handleFilterChange('calibrationStatus', '')}
                    color="warning"
                    variant="outlined"
                  />
                )}
                {filters.criticalOnly && (
                  <Chip 
                    label="Sadece Kritik"
                    size="small"
                    onDelete={() => handleFilterChange('criticalOnly', false)}
                    color="error"
                    variant="outlined"
                  />
                )}
                {filters.overdueOnly && (
                  <Chip 
                    label="Sadece Vadesi Geçen"
                    size="small"
                    onDelete={() => handleFilterChange('overdueOnly', false)}
                    color="error"
                    variant="outlined"
                  />
                )}
              </Box>
            )}
          </Paper>
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              overflow: 'auto',
              overflowX: 'auto',
              overflowY: 'auto',
              maxHeight: '85vh',
              minHeight: '600px',
              minWidth: '1200px',
              width: '100%',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(25, 118, 210, 0.3)',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.5)',
                },
              },
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
                      fontSize: '0.9rem',
                      padding: '16px 12px',
                      width: '140px',
                      minWidth: '140px'
                    }}
                  >
                    Kod / Kritik
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      padding: '16px 12px',
                      width: '220px',
                      minWidth: '220px'
                    }}
                  >
                    Ekipman Bilgileri
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      padding: '16px 12px',
                      width: '160px',
                      minWidth: '160px'
                    }}
                  >
                    Lokasyon
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      padding: '16px 12px',
                      width: '160px',
                      minWidth: '160px'
                    }}
                  >
                    Zimmet / Sorumlu
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      padding: '16px 12px',
                      width: '200px',
                      minWidth: '200px'
                    }}
                  >
                    Ölçüm Aralığı / Belirsizlik
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      padding: '16px 12px',
                      width: '120px',
                      minWidth: '120px'
                    }}
                  >
                    Durum
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      padding: '16px 12px',
                      width: '150px',
                      minWidth: '150px'
                    }}
                  >
                    Sertifika No
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      padding: '16px 12px',
                      width: '140px',
                      minWidth: '140px'
                    }}
                  >
                    Kalibrasyon
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      padding: '16px 12px',
                      width: '180px',
                      minWidth: '180px'
                    }}
                  >
                    İşlemler
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {metrics.filteredEquipment.map((equipment, index) => {
                  const warningLevel = getCalibrationWarningLevel(equipment);
                  let backgroundColor = '#ffffff'; // Profesyonel beyaz arka plan
                  let borderLeft = equipment.criticalEquipment ? '4px solid #f44336' : '4px solid transparent';
                  
                  // Kalibrasyon durumuna göre arka plan rengi - profesyonel beyaz tonları
                  if (warningLevel === 'overdue') {
                    backgroundColor = '#ffffff'; // Beyaz fon
                    borderLeft = '4px solid #d32f2f';
                  } else if (warningLevel === 'critical') {
                    backgroundColor = '#ffffff'; // Beyaz fon
                    borderLeft = '4px solid #f44336';
                  } else if (warningLevel === 'urgent') {
                    backgroundColor = '#ffffff'; // Beyaz fon
                    borderLeft = '4px solid #ff9800';
                  } else if (warningLevel === 'warning') {
                    backgroundColor = '#ffffff'; // Beyaz fon
                    borderLeft = '4px solid #ffc107';
                  }
                  
                  return (
                  <TableRow 
                    key={equipment.id}
                    sx={{
                      backgroundColor,
                      '&:hover': {
                        backgroundColor: warningLevel === 'overdue' ? 'rgba(211, 47, 47, 0.15)' : 
                                      warningLevel === 'critical' ? 'rgba(244, 67, 54, 0.12)' :
                                      warningLevel === 'urgent' ? 'rgba(255, 152, 0, 0.12)' :
                                      warningLevel === 'warning' ? 'rgba(255, 193, 7, 0.1)' :
                                      'primary.50',
                        transform: 'scale(1.002)',
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer',
                        boxShadow: warningLevel === 'overdue' ? '0 4px 12px rgba(211, 47, 47, 0.25)' : 
                                  warningLevel === 'critical' ? '0 4px 12px rgba(244, 67, 54, 0.2)' :
                                  '0 4px 12px rgba(25, 118, 210, 0.15)'
                      },
                      height: '80px',
                      ...(warningLevel === 'overdue' && {
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { opacity: 1 },
                          '50%': { opacity: 0.8 },
                          '100%': { opacity: 1 }
                        }
                      })
                    }}
                  >
                    <TableCell sx={{ padding: '12px', borderLeft }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                          {equipment.equipmentCode}
                        </Typography>
                        {equipment.criticalEquipment && (
                          <Chip 
                            label="KRİTİK" 
                            color="error" 
                            size="small" 
                            sx={{ 
                              height: '18px', 
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              '& .MuiChip-label': { padding: '0 6px' }
                            }} 
                          />
                        )}
                </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '12px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Tooltip title={equipment.name} placement="top">
                          <Typography 
                            variant="body2" 
                            fontWeight={500}
                            sx={{ 
                              fontSize: '0.85rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px'
                            }}
                          >
                            {equipment.name}
                          </Typography>
                        </Tooltip>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.7rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '200px'
                          }}
                        >
                          {equipment.manufacturer} {equipment.model}
                        </Typography>
                        <Chip 
                          label={equipment.category} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            height: '20px', 
                            fontSize: '0.65rem',
                            '& .MuiChip-label': { padding: '0 6px' }
                          }}
                        />
                </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '12px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '140px'
                          }}
                        >
                          {equipment.location}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.7rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '140px'
                          }}
                        >
                          {equipment.department}
                        </Typography>
                </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '12px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography 
                        variant="body2" 
                          fontWeight={600}
                        sx={{ 
                          fontSize: '0.85rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                            maxWidth: '140px',
                            color: 'primary.main'
                        }}
                      >
                          {equipment.responsiblePersonName || 'Belirtilmemiş'}
                      </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.7rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '140px'
                          }}
                        >
                          Sicil: {equipment.responsiblePersonSicilNo || 'N/A'}
                        </Typography>
                </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '12px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Tooltip title={equipment.measurementRange || 'Belirtilmemiş'} placement="top">
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.85rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '180px',
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
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '180px'
                          }}
                        >
                          ± {equipment.measurementUncertainty || 'N/A'}
                        </Typography>
                </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '12px' }}>
                      <StatusChip
                        label={
                          equipment.status === 'active' ? 'Aktif' :
                          
                          equipment.status === 'calibration' ? 'Kalibrasyon' :
                          equipment.status === 'inactive' ? 'Pasif' : 'Devre Dışı'
                        }
                        statustype={equipment.status}
                        size="small"
                        icon={getStatusIcon(equipment.status)}
                        sx={{ 
                          height: '26px',
                          fontSize: '0.75rem',
                          '& .MuiChip-label': { padding: '0 8px' },
                          '& .MuiChip-icon': { fontSize: '14px' }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '12px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '130px',
                            color: equipment.lastCalibrationCertificateNumber ? 'primary.main' : 'text.disabled'
                          }}
                        >
                          {equipment.lastCalibrationCertificateNumber || 'Yok'}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.7rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '130px'
                          }}
                        >
                          {equipment.calibrationCompany || 'Belirtilmemiş'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: '12px' }}>
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
                            height: '22px',
                            fontSize: '0.7rem',
                            '& .MuiChip-label': { padding: '0 6px' },
                            '& .MuiChip-icon': { fontSize: '12px' }
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          color={
                            equipment.calibrationStatus === 'overdue' ? 'error.main' :
                            equipment.calibrationStatus === 'due' ? 'warning.main' : 
                            'text.secondary'
                          }
                          sx={{ 
                            fontSize: '0.7rem',
                            fontWeight: equipment.calibrationStatus !== 'valid' ? 600 : 400,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {equipment.nextCalibrationDate 
                            ? formatDate(equipment.nextCalibrationDate)
                            : (equipment.lastCalibrationDate && equipment.calibrationFrequency
                                ? formatDate(calculateNextCalibrationDate(equipment.lastCalibrationDate, equipment.calibrationFrequency))
                                : 'Tarih hesaplanamadı'
                              )
                          }
                        </Typography>
                </Box>
                    </TableCell>

                                          <TableCell sx={{ padding: '12px' }}>
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
                        
                        {equipment.status !== 'scrapped' && (
                          <Tooltip title="Hurdaya Ayır">
                            <IconButton 
                              size="small"
                              onClick={() => handleScrapEquipment(equipment)}
                              sx={{
                                padding: '4px',
                                '&:hover': { 
                                  backgroundColor: 'warning.50',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: '16px', color: 'warning.main' }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        
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
                  );
                })}
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
              
              {/* Kalibrasyon Takibi İçin Özel Filtreler */}
              <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#ffffff' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <UltraIsolatedSearchInput
                      label="Ekipman Arama"
                      placeholder="Ekipman adı, sertifika no, kalibratör ile arayın..."
                      initialValue={filters.searchTerm}
                      onDebouncedChange={handleDebouncedSearchChange}
                      fullWidth
                      size="small"
                      clearTrigger={clearTrigger}
                    />
                  </Box>
                  
                  <Button
                    variant={filters.calibrationStatus === 'due' ? "contained" : "outlined"}
                    color="warning"
                    size="small"
                    onClick={() => handleFilterChange('calibrationStatus', filters.calibrationStatus === 'due' ? '' : 'due')}
                    startIcon={<WarningIcon />}
                  >
                    Vadesi Yaklaşan
                  </Button>
                  
                  <Button
                    variant={filters.calibrationStatus === 'overdue' ? "contained" : "outlined"}
                    color="error"
                    size="small"
                    onClick={() => handleFilterChange('calibrationStatus', filters.calibrationStatus === 'overdue' ? '' : 'overdue')}
                    startIcon={<ErrorIcon />}
                  >
                    Vadesi Geçen
                  </Button>
                  
                  <Button
                    variant={filters.criticalOnly ? "contained" : "outlined"}
                    color="error"
                    size="small"
                    onClick={() => handleFilterChange('criticalOnly', !filters.criticalOnly)}
                    startIcon={<UrgentIcon />}
                  >
                    Kritik Ekipman
                  </Button>
                </Box>
              </Paper>

              {/* Detaylı Kalibrasyon Listesi */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: '#ffffff', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary', mb: 2 }}>
                  <ScienceIcon color="primary" />
                  Kalibrasyon Listesi - Kalan Gün Takibi
                </Typography>
                
                <TableContainer 
                  component={Paper}
                  sx={{ 
                    borderRadius: 2,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    maxHeight: '70vh',
                    overflowY: 'auto'
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
                            fontSize: '0.9rem'
                          }}
                        >
                          Ekipman
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}
                        >
                          Kod
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}
                        >
                          Son Kalibrasyon
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}
                        >
                          Sonraki Kalibrasyon
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            minWidth: '140px'
                          }}
                        >
                          Kalan Gün
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}
                        >
                          Durum
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}
                        >
                          İşlemler
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {metrics.filteredEquipment
                        .sort((a, b) => {
                          const daysA = a.nextCalibrationDate ? getDaysUntilDue(a.nextCalibrationDate) : 999;
                          const daysB = b.nextCalibrationDate ? getDaysUntilDue(b.nextCalibrationDate) : 999;
                          return daysA - daysB;
                        })
                        .map((equipment) => {
                          const nextCalDate = equipment.nextCalibrationDate || 
                            (equipment.lastCalibrationDate && equipment.calibrationFrequency
                              ? calculateNextCalibrationDate(equipment.lastCalibrationDate, equipment.calibrationFrequency)
                              : null);
                          const daysUntilDue = nextCalDate ? getDaysUntilDue(nextCalDate) : null;
                          
                          return (
                            <TableRow key={equipment.id} hover>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {equipment.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {equipment.category}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={500}>
                                  {equipment.equipmentCode}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {equipment.lastCalibrationDate 
                                    ? formatDate(equipment.lastCalibrationDate)
                                    : '-'
                                  }
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {nextCalDate 
                                    ? formatDate(nextCalDate)
                                    : '-'
                                  }
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {daysUntilDue !== null ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                      label={
                                        daysUntilDue < 0 
                                          ? `${Math.abs(daysUntilDue)} gün geçmiş`
                                          : daysUntilDue === 0
                                          ? 'Bugün'
                                          : `${daysUntilDue} gün kaldı`
                                      }
                                      color={
                                        daysUntilDue < 0 
                                          ? 'error'
                                          : daysUntilDue <= 7
                                          ? 'error'
                                          : daysUntilDue <= 30
                                          ? 'warning'
                                          : 'success'
                                      }
                                      size="small"
                                      variant="filled"
                                      sx={{ 
                                        fontWeight: 600,
                                        minWidth: '100px',
                                        '& .MuiChip-label': {
                                          fontSize: '0.75rem'
                                        }
                                      }}
                                    />
                                    {daysUntilDue <= 7 && (
                                      <UrgentIcon 
                                        color="error" 
                                        fontSize="small" 
                                        sx={{ ml: 0.5 }}
                                      />
                                    )}
                                  </Box>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    Hesaplanamadı
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    equipment.calibrationStatus === 'valid' ? 'Geçerli' :
                                    equipment.calibrationStatus === 'due' ? 'Vadesi Yakın' :
                                    equipment.calibrationStatus === 'overdue' ? 'Vadesi Geçmiş' :
                                    'Belirsiz'
                                  }
                                  color={
                                    equipment.calibrationStatus === 'valid' ? 'success' :
                                    equipment.calibrationStatus === 'due' ? 'warning' :
                                    equipment.calibrationStatus === 'overdue' ? 'error' :
                                    'default'
                                  }
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<ScienceIcon />}
                                    onClick={() => handleCalibration(equipment)}
                                    color={equipment.calibrationStatus === 'overdue' ? 'error' : 'primary'}
                                    disabled={equipment.calibrationStatus === 'valid' && daysUntilDue && daysUntilDue > 30}
                                  >
                                    {equipment.calibrationStatus === 'overdue' ? 'Acil' : 'Planla'}
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<ViewIcon />}
                                    onClick={() => {
                                      setSelectedEquipment(equipment);
                                      setDialogMode('view');
                                      setOpenDialog(true);
                                    }}
                                    color="info"
                                  >
                                    Detay
                                  </Button>
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Yaklaşan Kalibrasyonlar */}
            <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
              <Paper sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                  <WarningIcon color="warning" />
                  Yaklaşan Kalibrasyonlar ({metrics.filteredEquipment.filter(eq => eq.calibrationStatus === 'due').length})
                </Typography>
                <List>
                  {metrics.filteredEquipment
                    .filter(eq => eq.calibrationStatus === 'due')
                    .slice(0, 5)
                    .map((equipment) => (
                    <ListItem key={equipment.id} sx={{ px: 0, bgcolor: '#ffffff' }}>
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
                              Tarih: {equipment.nextCalibrationDate 
                                ? formatDate(equipment.nextCalibrationDate)
                                : (equipment.lastCalibrationDate && equipment.calibrationFrequency
                                    ? formatDate(calculateNextCalibrationDate(equipment.lastCalibrationDate, equipment.calibrationFrequency))
                                    : 'Hesaplanamadı'
                                  )
                              } 
                              ({equipment.nextCalibrationDate 
                                ? getDaysUntilDue(equipment.nextCalibrationDate)
                                : (equipment.lastCalibrationDate && equipment.calibrationFrequency
                                    ? getDaysUntilDue(calculateNextCalibrationDate(equipment.lastCalibrationDate, equipment.calibrationFrequency))
                                    : 0
                                  )
                              } gün kaldı)
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
              <Paper sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                  <ErrorIcon color="error" />
                  Vadesi Geçen Kalibrasyonlar ({metrics.filteredEquipment.filter(eq => eq.calibrationStatus === 'overdue').length})
                </Typography>
                <List>
                  {metrics.filteredEquipment
                    .filter(eq => eq.calibrationStatus === 'overdue')
                    .slice(0, 5)
                    .map((equipment) => (
                    <ListItem key={equipment.id} sx={{ px: 0, bgcolor: '#ffffff' }}>
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
                              Vadesi: {equipment.nextCalibrationDate 
                                ? formatDate(equipment.nextCalibrationDate)
                                : (equipment.lastCalibrationDate && equipment.calibrationFrequency
                                    ? formatDate(calculateNextCalibrationDate(equipment.lastCalibrationDate, equipment.calibrationFrequency))
                                    : 'Hesaplanamadı'
                                  )
                              } 
                              ({equipment.nextCalibrationDate 
                                ? Math.abs(getDaysUntilDue(equipment.nextCalibrationDate))
                                : (equipment.lastCalibrationDate && equipment.calibrationFrequency
                                    ? Math.abs(getDaysUntilDue(calculateNextCalibrationDate(equipment.lastCalibrationDate, equipment.calibrationFrequency)))
                                    : 0
                                  )
                              } gün geçmiş)
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
                        primary="Bakım İşlemi"
                        secondary="Planlanan bakım yok"
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
                        secondary="Kalibrasyon durumu takip ediliyor"
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
                
                {/* PDF Depolama Durumu Kartı */}
                <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StorageIcon color="info" />
                      PDF Depolama Durumu
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Toplam Sertifika"
                          secondary={`${storageInfo.certificateCount} adet sertifika`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Toplam Görsel"
                          secondary={`${storageInfo.imageCount} adet görsel`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Kullanılan Depolama"
                          secondary={`${(storageInfo.totalSize / (1024 * 1024)).toFixed(2)} MB`}
                        />
                      </ListItem>
                      {storageInfo.storageEstimate && (
                        <ListItem>
                          <ListItemText
                            primary="Tarayıcı Depolama Kotası"
                            secondary={`${((storageInfo.storageEstimate.usage || 0) / (1024 * 1024 * 1024)).toFixed(2)} GB / ${((storageInfo.storageEstimate.quota || 0) / (1024 * 1024 * 1024)).toFixed(2)} GB kullanıldı`}
                          />
                        </ListItem>
                      )}
                    </List>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CleaningServicesIcon />}
                        onClick={handleClearAllCertificates}
                        color="warning"
                      >
                        Sertifikaları Temizle
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CleaningServicesIcon />}
                        onClick={handleClearAllImages}
                        color="warning"
                      >
                        Görselleri Temizle
                      </Button>
                    </Box>
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

      {/* Create/Edit Dialog - YENİ PROFESYONELLEŞTİRİLMİŞ FORM */}
              <Dialog 
          open={openDialog} 
        onClose={closeDialog}
          maxWidth="lg" 
          fullWidth
        disableEscapeKeyDown={false}
        keepMounted={false}
                  sx={{
          '& .MuiDialog-paper': {
            maxHeight: '95vh',
            margin: '16px',
            borderRadius: '12px',
            overflow: 'hidden'
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }
        }}
        >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          borderBottom: '4px solid',
          borderColor: 'primary.dark'
        }}>
          <BuildIcon />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {dialogMode === 'create' ? 'Yeni Ekipman Kaydı' :
           dialogMode === 'edit' ? 'Ekipman Düzenle' :
            dialogMode === 'calibration' ? 'Kalibrasyon Kaydı' : 'Ekipman Detayları'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {dialogMode === 'edit' ? 'Mevcut ekipman bilgilerini güncelleyin' : ''}
            </Typography>
              </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {dialogMode === 'create' || dialogMode === 'edit' ? (
            <Box sx={{ bgcolor: 'grey.50', minHeight: '70vh' }}>
              {/* Form Container */}
              <Box sx={{ p: 4 }}>
                
                {/* FORM BAŞLIK */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
                    Ekipman Bilgileri Formu
                  </Typography>
            </Box>

                {/* TEMEL BİLGİLER SEKSİYONU */}
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderLeft: '4px solid', borderColor: 'primary.main' }}>
                  <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EngineeringIcon />
                    Temel Ekipman Bilgileri
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                  <TextField
                    fullWidth
                      label="Ekipman Kodu"
                    value={formData.equipmentCode || ''}
                    onChange={(e) => handleFormChange('equipmentCode', e.target.value)}
                    required
                      error={!formData.equipmentCode?.trim()}
                      helperText={!formData.equipmentCode?.trim() ? "Ekipman kodu zorunludur" : ""}
                      placeholder="EQ-001, MEAS-001, CAL-001"
                  />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Autocomplete
                    fullWidth
                        options={formData.category ? (equipmentNamesByCategory[formData.category] || []) : equipmentNamesList}
                    value={formData.name || ''}
                        onChange={(_, newValue) => handleNameChange(newValue || '')}
                        disabled={!formData.category}
                        renderInput={(params) => (
                  <TextField
                            {...params}
                            label="Cihazın Adı"
                    required
                            error={!formData.name?.trim()}
                            helperText={
                              !formData.category ? "Önce kategori seçiniz" :
                              !formData.name?.trim() ? "Cihaz adı zorunludur" : 
                              formData.category ? `${formData.category} kategorisine ait cihazlar gösteriliyor` : ""
                            }
                            placeholder={formData.category ? `${formData.category} cihazı ara... (örn: Kumpas - Digital, Mikrometre - Dış Çap)` : "Önce kategori seçin"}
                            disabled={!formData.category}
                          />
                        )}
                        freeSolo
                        includeInputInList
                        clearOnBlur={false}
                        selectOnFocus
                        handleHomeEndKeys
                        getOptionLabel={(option) => option}
                        isOptionEqualToValue={(option, value) => option === value}
                        filterOptions={optimizedFilterOptions}
                      />
                      <Tooltip title="Yeni cihaz adı ekle">
                    <Button 
                          variant="contained" 
                          onClick={() => setOpenEquipmentNameDialog(true)}
                          sx={{ minWidth: 50 }}
                          color="success"
                          disabled={!formData.category}
                        >
                          <AddIcon />
                    </Button>
                      </Tooltip>
                </Box>
                </Box>
                
                  <TextField
                    fullWidth
                    label="Seri Numarası"
                    value={formData.serialNumber || ''}
                    onChange={(e) => handleFormChange('serialNumber', e.target.value)}
                    required
                    error={!formData.serialNumber?.trim()}
                    helperText={!formData.serialNumber?.trim() ? "Seri numarası zorunludur" : ""}
                    placeholder="ABC123456, SN-789456123"
                    sx={{ mb: 3 }}
                  />

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
                    <Autocomplete
                      options={EQUIPMENT_CATEGORIES}
                      value={formData.category || ''}
                      onChange={(_, newValue) => handleCategoryChange(newValue || '')}
                      renderInput={(params) => (
                  <TextField
                          {...params}
                          label="Kategori"
                          required
                          error={!formData.category}
                          helperText={!formData.category ? "Kategori seçimi zorunludur" : ""}
                          placeholder="Kategori ara..."
                        />
                      )}
                      freeSolo
                      includeInputInList
                      clearOnBlur={false}
                      selectOnFocus
                      handleHomeEndKeys
                      getOptionLabel={(option) => option}
                      isOptionEqualToValue={(option, value) => option === value}
                      filterOptions={optimizedFilterOptions}
                    />
                    
                    <Autocomplete
                      options={LOCATIONS}
                      value={formData.location || ''}
                      onChange={(_, newValue) => handleFormChange('location', newValue || '')}
                      renderInput={(params) => (
                  <TextField
                          {...params}
                          label="Lokasyon"
                          required
                          error={!formData.location}
                          helperText={!formData.location ? "Lokasyon seçimi zorunludur" : ""}
                          placeholder="Lokasyon ara..."
                        />
                      )}
                      freeSolo
                      includeInputInList
                      clearOnBlur={false}
                      selectOnFocus
                      handleHomeEndKeys
                      getOptionLabel={(option) => option}
                      isOptionEqualToValue={(option, value) => option === value}
                      filterOptions={optimizedFilterOptions}
                    />
                    
                    <Autocomplete
                      options={DEPARTMENTS}
                      value={formData.department || ''}
                      onChange={(_, newValue) => handleFormChange('department', newValue || '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Departman"
                          required
                          error={!formData.department}
                          helperText={!formData.department ? "Departman seçimi zorunludur" : ""}
                          placeholder="Departman ara..."
                        />
                      )}
                      freeSolo
                      includeInputInList
                      clearOnBlur={false}
                      selectOnFocus
                      handleHomeEndKeys
                      getOptionLabel={(option) => option}
                      isOptionEqualToValue={(option, value) => option === value}
                      filterOptions={optimizedFilterOptions}
                  />
                </Box>


                </Paper>

                {/* ÜRETİCİ VE MODEL SEKSİYONU */}
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderLeft: '4px solid', borderColor: 'info.main' }}>
                  <Typography variant="h6" sx={{ mb: 3, color: 'info.main', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BuildIcon />
                    Üretici ve Model Bilgileri
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    {/* Üretici Seçimi */}
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Autocomplete
                          fullWidth
                          options={manufacturersList}
                          value={formData.manufacturer || ''}
                          onChange={(_, newValue) => handleFormChange('manufacturer', newValue || '')}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Üretici"
                              placeholder="Üretici ara..."
                            />
                          )}
                          freeSolo
                          includeInputInList
                          clearOnBlur={false}
                          selectOnFocus
                          handleHomeEndKeys
                          getOptionLabel={(option) => option}
                          isOptionEqualToValue={(option, value) => option === value}
                          filterOptions={optimizedFilterOptions}
                        />
                        <Tooltip title="Yeni üretici ekle">
                  <Button
                    variant="contained"
                            onClick={() => setOpenManufacturerDialog(true)}
                            sx={{ minWidth: 50 }}
                            color="success"
                  >
                            <AddIcon />
                  </Button>
                        </Tooltip>
                </Box>
                
                      {/* Üretici Yönetimi */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Üretici yönet">
                  <Button
                    variant="outlined"
                            size="small"
                            onClick={() => setOpenManufacturerManagementDialog(true)}
                            startIcon={<EditIcon />}
                            color="info"
                          >
                            Üretici Yönet
                  </Button>
                        </Tooltip>
                </Box>
              </Box>

                    {/* Model Seçimi */}
              <Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Autocomplete
                          fullWidth
                          options={modelsList}
                          value={formData.model || ''}
                          onChange={(_, newValue) => setFormData({...formData, model: newValue || ''})}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Model"
                              placeholder="Model ara..."
                            />
                          )}
                          freeSolo
                          includeInputInList
                          clearOnBlur={false}
                          selectOnFocus
                          handleHomeEndKeys
                          getOptionLabel={(option) => option}
                          isOptionEqualToValue={(option, value) => option === value}
                          filterOptions={(options, params) => {
                            const inputValue = params.inputValue.toLowerCase().trim();
                            if (!inputValue) return options;
                            
                            return options.filter(option => {
                              const optionLower = option.toLowerCase();
                              return optionLower.includes(inputValue) || 
                                     optionLower.startsWith(inputValue) || 
                                     optionLower.indexOf(inputValue) !== -1;
                            });
                          }}
                        />
                        <Tooltip title="Yeni model ekle">
                          <Button 
                            variant="contained" 
                            onClick={() => setOpenModelDialog(true)}
                            sx={{ minWidth: 50 }}
                            color="success"
                          >
                            <AddIcon />
                          </Button>
                        </Tooltip>
                </Box>
                      
                      {/* Model Yönetimi */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Model yönet">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setOpenModelManagementDialog(true)}
                            startIcon={<EditIcon />}
                            color="info"
                          >
                            Model Yönet
                          </Button>
                        </Tooltip>
                </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* SORUMLU PERSONEL SEKSİYONU */}
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderLeft: '4px solid', borderColor: 'success.main' }}>
                  <Typography variant="h6" sx={{ mb: 3, color: 'success.main', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonAddIcon />
                    Zimmet ve Sorumlu Personel
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 3 }}>
                    <Autocomplete
                    fullWidth
                      options={personnelList.filter(p => p.isActive)}
                      value={personnelList.find(p => p.sicilNo === formData.responsiblePersonSicilNo) || null}
                      onChange={(_, newValue) => {
                          setFormData({
                            ...formData,
                          responsiblePersonSicilNo: newValue?.sicilNo || '',
                          responsiblePersonName: newValue?.name || ''
                          });
                        }}
                      getOptionLabel={(option) => `${option.name} (${option.sicilNo}) - ${option.department}`}
                      isOptionEqualToValue={(option, value) => option.sicilNo === value?.sicilNo}
                      renderInput={(params) => (
                  <TextField
                          {...params}
                          label="Sorumlu Personel *"
                          placeholder="Personel ara... (isim, sicil veya departman)"
                          error={!formData.responsiblePersonSicilNo}
                          helperText={!formData.responsiblePersonSicilNo ? "Sorumlu personel seçimi zorunludur" : ""}
                        />
                      )}
                      includeInputInList
                      clearOnBlur={false}
                      selectOnFocus
                      handleHomeEndKeys
                      filterOptions={(options, params) => {
                        const inputValue = params.inputValue.toLowerCase().trim();
                        if (!inputValue) return options;
                        
                        return options.filter((option) => {
                          const nameMatch = option.name.toLowerCase().includes(inputValue);
                          const sicilMatch = option.sicilNo.toLowerCase().includes(inputValue);
                          const deptMatch = option.department.toLowerCase().includes(inputValue);
                          const positionMatch = option.position.toLowerCase().includes(inputValue);
                          
                          return nameMatch || sicilMatch || deptMatch || positionMatch;
                        });
                      }}
                    />
                  
                    <Button
                      variant="contained"
                      onClick={() => setOpenPersonnelDialog(true)}
                      startIcon={<PersonAddIcon />}
                      color="success"
                      sx={{ height: 56 }}
                    >
                      Yeni Personel
                    </Button>
                </Box>
                
                  {/* Seçilen Personel Bilgisi */}
                  {formData.responsiblePersonName && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Seçilen Personel:</strong> {formData.responsiblePersonName} (Sicil: {formData.responsiblePersonSicilNo})
                      </Typography>
                    </Alert>
                  )}

                  {/* Personel Yönetimi */}
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Tooltip title="Personel yönet">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setOpenPersonnelManagementDialog(true)}
                        startIcon={<EditIcon />}
                        color="success"
                      >
                        Personel Yönet
                      </Button>
                    </Tooltip>
                </Box>


                </Paper>

                {/* TEKNİK ÖZELLİKLER SEKSİYONU */}
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderLeft: '4px solid', borderColor: 'warning.main' }}>
                  <Typography variant="h6" sx={{ mb: 3, color: 'warning.main', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScienceIcon />
                    Teknik Özellikler
                  </Typography>
                  


                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                    {/* Ölçüm Aralığı */}
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Autocomplete
                    fullWidth
                          options={getMeasurementRangeOptions}
                          value={formData.measurementRange || ''}
                          onChange={(_, newValue) => {
                            setFormData({...formData, measurementRange: newValue || ''});
                          }}
                          disabled={!formData.category}
                          renderInput={(params) => (
                  <TextField
                              {...params}
                              label={formData.name ? `Ölçüm Aralığı (${formData.name}) *` : "Ölçüm Aralığı *"}
                              placeholder={formData.name ? `${formData.name} için aralık seçin...` : "Ölçüm aralığı seçin..."}
                              disabled={!formData.category}
                              helperText={
                                formData.name ? 
                                  `${formData.name} cihazına özel aralıklar gösteriliyor` : 
                                  formData.category ? 
                                    `${formData.category} kategorisine ait aralıklar gösteriliyor` : 
                                    "Önce kategori seçin"
                              }
                            />
                          )}
                          freeSolo
                          includeInputInList
                          clearOnBlur={false}
                          selectOnFocus
                          handleHomeEndKeys
                          getOptionLabel={(option) => option}
                          isOptionEqualToValue={(option, value) => option === value}
                          filterOptions={(options, params) => {
                            const inputValue = params.inputValue.toLowerCase().trim();
                            if (!inputValue) return options;
                            
                            // Daha hassas filtreleme yapılacak
                            return options.filter((option: string) => {
                              const optionLower = option.toLowerCase();
                              // Tam eşleşme önceliği
                              if (optionLower === inputValue) return true;
                              // Başlangıç eşleşmesi
                              if (optionLower.startsWith(inputValue)) return true;
                              // İçerik eşleşmesi
                              if (optionLower.includes(inputValue)) return true;
                              // Sayısal değer eşleşmesi (sadece rakamları karşılaştır)
                              const optionNumbers = option.match(/\d+/g);
                              const inputNumbers = params.inputValue.match(/\d+/g);
                              if (optionNumbers && inputNumbers) {
                                return optionNumbers.some(num => inputNumbers.includes(num));
                              }
                              return false;
                            });
                          }}
                        />
                        <Tooltip title="Yeni ölçüm aralığı ekle">
                      <Button
                            variant="contained"
                        onClick={() => {
                              const newRange = prompt('Yeni ölçüm aralığı giriniz (örn: 0-150mm):');
                              if (newRange?.trim()) {
                            const category = formData.category || 'Diğer';
                                // Eğer mm eklenmemişse otomatik ekle
                                const range = newRange.trim().includes('mm') ? newRange.trim() : `${newRange.trim()} mm`;
                                
                                const updatedRanges = {...measurementRanges};
                                updatedRanges[category] = [...(updatedRanges[category] || []), range];
                                setMeasurementRanges(updatedRanges);
                                
                                // localStorage'a kaydet
                                localStorage.setItem('measurement_ranges_by_category', JSON.stringify(updatedRanges));
                                
                                // Form'a otomatik seç
                                setFormData({...formData, measurementRange: range});
                              }
                            }}
                            sx={{ minWidth: 50 }}
                        disabled={!formData.category}
                            color="warning"
                      >
                            <AddIcon />
                      </Button>
                        </Tooltip>
                        <Tooltip title="Ölçüm aralıklarını yönet">
                          <Button
                            variant="outlined"
                            onClick={() => setOpenMeasurementRangeManagementDialog(true)}
                            sx={{ minWidth: 50 }}
                            disabled={!formData.category}
                            color="warning"
                          >
                            <EditIcon />
                          </Button>
                        </Tooltip>
                </Box>
                </Box>
                    
                    {/* Ölçüm Belirsizliği */}
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Autocomplete
                          fullWidth
                          options={getMeasurementUncertaintyOptions}
                          value={formData.measurementUncertainty || ''}
                          onChange={(_, newValue) => {
                            setFormData({...formData, measurementUncertainty: newValue || ''});
                          }}
                          disabled={!formData.category}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={formData.name ? `Ölçüm Belirsizliği (${formData.name}) *` : "Ölçüm Belirsizliği *"}
                              placeholder={formData.name ? `${formData.name} için belirsizlik seçin...` : "Ölçüm belirsizliği seçin..."}
                              disabled={!formData.category}
                              helperText={
                                formData.name ? 
                                  `${formData.name} cihazına özel belirsizlikler gösteriliyor` : 
                                  formData.category ? 
                                    `${formData.category} kategorisine ait belirsizlikler gösteriliyor` : 
                                    "Önce kategori seçin"
                              }
                            />
                          )}
                          freeSolo
                          includeInputInList
                          clearOnBlur={false}
                          selectOnFocus
                          handleHomeEndKeys
                          getOptionLabel={(option) => option}
                          isOptionEqualToValue={(option, value) => option === value}
                          filterOptions={(options, params) => {
                            const inputValue = params.inputValue.toLowerCase().trim();
                            if (!inputValue) return options;
                            
                            // Daha hassas filtreleme yapılacak
                            return options.filter((option: string) => {
                              const optionLower = option.toLowerCase();
                              // Tam eşleşme önceliği
                              if (optionLower === inputValue) return true;
                              // Başlangıç eşleşmesi
                              if (optionLower.startsWith(inputValue)) return true;
                              // İçerik eşleşmesi
                              if (optionLower.includes(inputValue)) return true;
                              // ± veya sayısal değer eşleşmesi
                              const optionNumbers = option.match(/[\d.]+/g);
                              const inputNumbers = params.inputValue.match(/[\d.]+/g);
                              if (optionNumbers && inputNumbers) {
                                return optionNumbers.some(num => inputNumbers.includes(num));
                              }
                              return false;
                            });
                          }}
                        />
                        <Tooltip title="Yeni belirsizlik değeri ekle">
                  <Button
                    variant="contained"
                        onClick={() => {
                              const newUncertainty = prompt('Yeni ölçüm belirsizliği giriniz (örn: ±0.01mm):');
                              if (newUncertainty?.trim()) {
                            const category = formData.category || 'Diğer';
                                // Eğer ± ve mm eklenmemişse otomatik ekle
                                let uncertainty = newUncertainty.trim();
                                if (!uncertainty.startsWith('±')) uncertainty = `±${uncertainty}`;
                                if (!uncertainty.includes('mm')) uncertainty = `${uncertainty} mm`;
                                
                                const updatedUncertainties = {...measurementUncertainties};
                                updatedUncertainties[category] = [...(updatedUncertainties[category] || []), uncertainty];
                                setMeasurementUncertainties(updatedUncertainties);
                                
                                // localStorage'a kaydet
                                localStorage.setItem('measurement_uncertainties_by_category', JSON.stringify(updatedUncertainties));
                                
                                // Form'a otomatik seç
                                setFormData({...formData, measurementUncertainty: uncertainty});
                              }
                            }}
                            sx={{ minWidth: 50 }}
                        disabled={!formData.category}
                            color="warning"
                      >
                            <AddIcon />
                  </Button>
                        </Tooltip>
                        <Tooltip title="Ölçüm belirsizliklerini yönet">
                  <Button
                    variant="outlined"
                            onClick={() => setOpenMeasurementUncertaintyManagementDialog(true)}
                            sx={{ minWidth: 50 }}
                            disabled={!formData.category}
                            color="warning"
                          >
                            <EditIcon />
                  </Button>
                        </Tooltip>
              </Box>

                      {/* Belirsizlik Arama */}
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={formData.category ? `${formData.category} belirsizliği ara...` : "Önce kategori seçin"}
                        disabled={!formData.category}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                          endAdornment: null
                        }}
                  sx={{
                          '& .MuiOutlinedInput-root': { 
                            bgcolor: formData.category ? 'warning.50' : 'grey.200',
                            '&:hover': { bgcolor: formData.category ? 'warning.100' : 'grey.200' }
                          }
                  }}
                />
              </Box>
            </Box>

              <TextField
                fullWidth
                      label="Detaylı Teknik Özellikler"
                      multiline
                    rows={4}
                      value={formData.specifications || ''}
                      onChange={(e) => setFormData({...formData, specifications: e.target.value})}
                      placeholder="Cihazın tüm teknik özelliklerini detaylı şekilde giriniz..."
                    helperText="Cihazın işlevselliği, doğruluk sınıfı, çalışma koşulları vb. bilgileri ekleyiniz"
                  />
                </Paper>

                {/* KALİBRASYON BİLGİLERİ SEKSİYONU */}
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderLeft: '4px solid', borderColor: 'error.main' }}>
                  <Typography variant="h6" sx={{ mb: 3, color: 'error.main', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon />
                    Kalibrasyon Programı
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
              <TextField
                fullWidth
                      label="Son Kalibrasyon Tarihi"
                      type="date"
                      value={formData.lastCalibrationDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newLastDate = e.target.value;
                        const nextDate = calculateNextCalibrationDate(
                          newLastDate, 
                          formData.calibrationFrequency || 12
                        );
                        setFormData({
                          ...formData, 
                          lastCalibrationDate: newLastDate,
                          nextCalibrationDate: nextDate
                        });
                      }}
                      InputLabelProps={{ shrink: true }}
                      helperText="En son kalibre edildiği tarihi giriniz"
                    />
              <TextField
                fullWidth
                      label="Kalibrasyon Periyodu (Ay)"
                      type="number"
                      value={formData.calibrationFrequency || 12}
                      onChange={(e) => {
                        const months = parseInt(e.target.value) || 12;
                        const nextDate = calculateNextCalibrationDate(
                          formData.lastCalibrationDate || new Date().toISOString().split('T')[0], 
                          months
                        );
                        setFormData({
                          ...formData, 
                          calibrationFrequency: months,
                          nextCalibrationDate: nextDate
                        });
                      }}
                      required
                      inputProps={{ min: 1, max: 60 }}
                      helperText="Kaç ayda bir kalibre edilecek"
                    />
            </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
              <TextField
                fullWidth
                      label="Hedef Kalibrasyon Tarihi"
                      type="date"
                      value={formData.nextCalibrationDate || ''}
                      onChange={(e) => setFormData({...formData, nextCalibrationDate: e.target.value})}
                      InputLabelProps={{ shrink: true }}
                      helperText="Bir sonraki kalibrasyon için hedef tarih"
                      disabled
                    />
                    
                    {/* Kalibrasyon Laboratuvarı */}
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Autocomplete
                fullWidth
                          options={calibrationCompaniesList}
                          value={formData.calibrationCompany || ''}
                          onChange={(_, newValue) => setFormData({...formData, calibrationCompany: newValue || ''})}
                          renderInput={(params) => (
              <TextField
                              {...params}
                              label="Kalibrasyon Laboratuvarı"
                              placeholder="Laboratuvar ara..."
                            />
                          )}
                          freeSolo
                          includeInputInList
                          clearOnBlur={false}
                          selectOnFocus
                          handleHomeEndKeys
                          getOptionLabel={(option) => option}
                          isOptionEqualToValue={(option, value) => option === value}
                          filterOptions={(options, params) => {
                            const inputValue = params.inputValue.toLowerCase().trim();
                            if (!inputValue) return options;
                            
                            return options.filter(option => {
                              const optionLower = option.toLowerCase();
                              return optionLower.includes(inputValue) || 
                                     optionLower.startsWith(inputValue) || 
                                     optionLower.indexOf(inputValue) !== -1;
                            });
                          }}
                        />
                        <Tooltip title="Yeni laboratuvar ekle">
                          <Button 
                            variant="contained"
                            onClick={() => setOpenCalibrationCompanyDialog(true)}
                            sx={{ minWidth: 50 }}
                            color="secondary"
                          >
                            <AddIcon />
                          </Button>
                        </Tooltip>
            </Box>
                      
                      {/* Laboratuvar Yönetimi */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Laboratuvar yönet">
                      <Button 
                        variant="outlined"
                            size="small"
                        onClick={() => setOpenCalibrationCompanyDialog(true)}
                            startIcon={<EditIcon />}
                            color="secondary"
                      >
                            Laboratuvar Yönet
                      </Button>
                        </Tooltip>
            </Box>
            </Box>
                  </Box>
                  
              <TextField
                fullWidth
                    label="Son Kalibrasyon Sertifika Numarası"
                      value={formData.lastCalibrationCertificateNumber || ''}
                      onChange={(e) => setFormData({...formData, lastCalibrationCertificateNumber: e.target.value})}
                    placeholder="CERT-2024-001, KAL-24-123456"
                    helperText="En son alınan kalibrasyon sertifikasının numarası"
                  />
                </Paper>

                {/* FORM VALİDASYON DURUMU */}
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'info.50', borderLeft: '4px solid', borderColor: 'info.main' }}>
                  <Typography variant="body2" color="info.main" sx={{ mb: 1, fontWeight: 600 }}>
                    Form Durumu
                  </Typography>
                  {(() => {
                    const requiredFields = [
                      { field: 'equipmentCode', label: 'Ekipman Kodu' },
                      { field: 'name', label: 'Cihaz Adı' },
                      { field: 'serialNumber', label: 'Seri Numarası' },
                      { field: 'category', label: 'Kategori' },
                      { field: 'location', label: 'Lokasyon' },
                      { field: 'department', label: 'Departman' },
                      { field: 'responsiblePersonSicilNo', label: 'Sorumlu Personel' },
                      { field: 'measurementRange', label: 'Ölçüm Aralığı' },
                      { field: 'measurementUncertainty', label: 'Ölçüm Belirsizliği' }
                    ];
                    
                    const missingFields = requiredFields.filter(item => !formData[item.field]?.toString().trim());
                    const completedFields = requiredFields.length - missingFields.length;
                    const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);
                    
                    return (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="body2">
                            Tamamlanan: {completedFields}/{requiredFields.length} (%{completionPercentage})
                          </Typography>
                          <Box sx={{ 
                            width: 100, 
                            height: 8, 
                            bgcolor: 'grey.300', 
                            borderRadius: 4,
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: `${completionPercentage}%`, 
                              height: '100%', 
                              bgcolor: completionPercentage === 100 ? 'success.main' : 'warning.main',
                              transition: 'all 0.3s'
                            }} />
            </Box>
            </Box>
                        {missingFields.length > 0 && (
                          <Typography variant="caption" color="error">
                            Eksik alanlar: {missingFields.map(f => f.label).join(', ')}
                          </Typography>
                        )}
            </Box>
                    );
                  })()}
                </Paper>

            </Box>
            </Box>
          ) : dialogMode === 'view' ? (
            <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
              {selectedEquipment && (
                <Box sx={{ p: 3 }}>
                  {/* Başlık ve Temel Bilgiler */}
                  <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <BuildIcon sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          {selectedEquipment.name}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                          Ekipman Kodu: {selectedEquipment.equipmentCode}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={selectedEquipment.status === 'active' ? 'Aktif' : 
                              selectedEquipment.status === 'inactive' ? 'İnaktif' :
                              selectedEquipment.status === 'calibration' ? 'Kalibrasyonda' : 
                              selectedEquipment.status === 'scrapped' ? 'Hurdaya Ayrılmış' : 'Hizmet Dışı'}
                        color={selectedEquipment.status === 'active' ? 'success' : 
                               selectedEquipment.status === 'calibration' ? 'warning' : 'error'}
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                      <Chip 
                        label={selectedEquipment.calibrationStatus === 'valid' ? 'Kalibrasyon Geçerli' :
                               selectedEquipment.calibrationStatus === 'due' ? 'Kalibrasyon Yakın' :
                               selectedEquipment.calibrationStatus === 'overdue' ? 'Kalibrasyon Gecikmiş' : 'Kalibrasyon Geçersiz'}
                        color={selectedEquipment.calibrationStatus === 'valid' ? 'success' : 
                               selectedEquipment.calibrationStatus === 'due' ? 'warning' : 'error'}
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                      {selectedEquipment.criticalEquipment && (
                        <Chip 
                          label="Kritik Ekipman" 
                          color="error"
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        />
                      )}
                    </Box>
                  </Paper>

                  <Tabs value={viewModalTab} onChange={(e, newValue) => setViewModalTab(newValue)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Genel Bilgiler" />
                    <Tab label="Kalibrasyon Bilgileri" />
                    <Tab label="Sertifikalar" />
                    <Tab label="Görseller" />
                    <Tab label="Sorumlu Personel" />
                  </Tabs>
                  
                  {/* Dosya yükleme durumu ve hata mesajları */}
                  {fileUploadError && (
                    <Alert severity="error" sx={{ mt: 2 }} onClose={() => setFileUploadError(null)}>
                      {fileUploadError}
                    </Alert>
                  )}
                  {fileUploadSuccess && (
                    <Alert severity="success" sx={{ mt: 2 }} onClose={() => setFileUploadSuccess(null)}>
                      {fileUploadSuccess}
                    </Alert>
                  )}
                  {uploadingFile && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Dosya yükleniyor, lütfen bekleyin...
                    </Alert>
                  )}

                  {/* Tab 0: Genel Bilgiler */}
                  {viewModalTab === 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EngineeringIcon color="primary" />
                        Genel Bilgiler
                      </Typography>
                    
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                        {/* Sol Panel */}
                        <Paper sx={{ p: 3, borderLeft: '4px solid', borderColor: 'primary.main' }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                            Teknik Özellikler
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                              <Typography variant="body2" color="text.secondary">Üretici</Typography>
                              <Typography variant="body1" fontWeight="bold">{selectedEquipment.manufacturer || 'Belirtilmemiş'}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">Model</Typography>
                              <Typography variant="body1" fontWeight="bold">{selectedEquipment.model || 'Belirtilmemiş'}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">Seri Numarası</Typography>
                              <Typography variant="body1" fontWeight="bold">{selectedEquipment.serialNumber}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">Kategori</Typography>
                              <Typography variant="body1" fontWeight="bold">{selectedEquipment.category}</Typography>
                            </Box>
                            {selectedEquipment.measurementRange && (
                              <Box>
                                <Typography variant="body2" color="text.secondary">Ölçüm Aralığı</Typography>
                                <Typography variant="body1" fontWeight="bold">{selectedEquipment.measurementRange}</Typography>
                              </Box>
                            )}
                            {selectedEquipment.measurementUncertainty && (
                              <Box>
                                <Typography variant="body2" color="text.secondary">Ölçüm Belirsizliği</Typography>
                                <Typography variant="body1" fontWeight="bold">±{selectedEquipment.measurementUncertainty}</Typography>
                              </Box>
                            )}
                          </Box>
                        </Paper>

                        {/* Sağ Panel */}
                        <Paper sx={{ p: 3, borderLeft: '4px solid', borderColor: 'info.main' }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="info.main">
                            Konum ve Organizasyon
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                              <Typography variant="body2" color="text.secondary">Konum</Typography>
                              <Typography variant="body1" fontWeight="bold">{selectedEquipment.location || 'Belirtilmemiş'}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">Departman</Typography>
                              <Typography variant="body1" fontWeight="bold">{selectedEquipment.department || 'Belirtilmemiş'}</Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Box>

                      {/* Ek Bilgiler */}
                      {(selectedEquipment.specifications || selectedEquipment.notes || selectedEquipment.operatingManual) && (
                        <Paper sx={{ p: 3, mt: 3, borderLeft: '4px solid', borderColor: 'grey.400' }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AssessmentIcon color="action" />
                            Ek Bilgiler
                          </Typography>
                          {selectedEquipment.specifications && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>Teknik Özellikler</Typography>
                              <Typography variant="body2" sx={{ 
                                bgcolor: 'grey.50', 
                                p: 2, 
                                borderRadius: 1, 
                                border: '1px solid', 
                                borderColor: 'grey.200' 
                              }}>
                                {selectedEquipment.specifications}
                              </Typography>
                            </Box>
                          )}
                          {selectedEquipment.operatingManual && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>Kullanım Kılavuzu</Typography>
                              <Typography variant="body2" sx={{ 
                                bgcolor: 'grey.50', 
                                p: 2, 
                                borderRadius: 1, 
                                border: '1px solid', 
                                borderColor: 'grey.200' 
                              }}>
                                {selectedEquipment.operatingManual}
                              </Typography>
                            </Box>
                          )}
                          {selectedEquipment.notes && (
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>Notlar</Typography>
                              <Typography variant="body2" sx={{ 
                                bgcolor: 'grey.50', 
                                p: 2, 
                                borderRadius: 1, 
                                border: '1px solid', 
                                borderColor: 'grey.200' 
                              }}>
                                {selectedEquipment.notes}
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      )}
                    </Box>
                  )}

                  {/* Tab 1: Kalibrasyon Bilgileri */}
                  {viewModalTab === 1 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScienceIcon color="warning" />
                        Kalibrasyon Bilgileri
                      </Typography>
                      
                      <Paper sx={{ p: 3, borderLeft: '4px solid', borderColor: 'warning.main' }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScienceIcon />
                          Kalibrasyon Durumu
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Kalibrasyon Gerekli</Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {selectedEquipment.calibrationRequired ? 'Evet' : 'Hayır'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Kalibrasyon Sıklığı</Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {selectedEquipment.calibrationFrequency} ay
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Son Kalibrasyon</Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {selectedEquipment.lastCalibrationDate ? formatDate(selectedEquipment.lastCalibrationDate) : 'Hiç yapılmamış'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Sonraki Kalibrasyon</Typography>
                            <Typography variant="body1" fontWeight="bold" color={
                              selectedEquipment.calibrationStatus === 'overdue' ? 'error.main' :
                              selectedEquipment.calibrationStatus === 'due' ? 'warning.main' : 'success.main'
                            }>
                              {selectedEquipment.nextCalibrationDate ? formatDate(selectedEquipment.nextCalibrationDate) : 'Planlanmamış'}
                            </Typography>
                          </Box>
                          {selectedEquipment.calibrationCompany && (
                            <Box>
                              <Typography variant="body2" color="text.secondary">Kalibrasyon Firması</Typography>
                              <Typography variant="body1" fontWeight="bold">{selectedEquipment.calibrationCompany}</Typography>
                            </Box>
                          )}
                          {selectedEquipment.lastCalibrationCertificateNumber && (
                            <Box>
                              <Typography variant="body2" color="text.secondary">Son Sertifika No</Typography>
                              <Typography variant="body1" fontWeight="bold">{selectedEquipment.lastCalibrationCertificateNumber}</Typography>
                            </Box>
                          )}
                        </Box>
                      </Paper>
                    </Box>
                  )}

                  {/* Tab 2: Sertifikalar */}
                  {viewModalTab === 2 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CertificateIcon color="secondary" />
                        Sertifikalar
                      </Typography>
                      
                      {selectedEquipment.certificateIds && selectedEquipment.certificateIds.length > 0 ? (
                        <Paper sx={{ p: 3, borderLeft: '4px solid', borderColor: 'secondary.main' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="secondary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CertificateIcon />
                              Kalibrasyon Sertifikaları ({selectedEquipment.certificateIds.length})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <input
                                accept=".pdf,.jpg,.jpeg,.png"
                                style={{ display: 'none' }}
                                id="certificate-upload-button"
                                type="file"
                                onChange={(e) => handleCertificateUpload(e, selectedEquipment.id)}
                              />
                              <label htmlFor="certificate-upload-button">
                                <Button
                                  variant="contained"
                                  component="span"
                                  size="small"
                                  startIcon={<CloudUploadIcon />}
                                  disabled={uploadingFile}
                                >
                                  Sertifika Yükle
                                </Button>
                              </label>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {selectedEquipment.certificateIds.map((certId, index) => (
                              <Paper key={certId} sx={{ p: 2, bgcolor: '#ffffff', border: '1px solid', borderColor: 'grey.200' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CertificateIcon color="primary" />
                                    <Box>
                                      <Typography variant="body2" fontWeight="bold">Sertifika #{index + 1}</Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        ID: {certId}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<ViewIcon />}
                                      onClick={() => handleViewCertificate(certId)}
                                    >
                                      Görüntüle
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<DownloadIcon />}
                                      onClick={() => handleDownloadCertificate(certId)}
                                    >
                                      İndir
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      startIcon={<DeleteIcon />}
                                      onClick={() => handleDeleteCertificate(certId, selectedEquipment.id)}
                                    >
                                      Sil
                                    </Button>
                                  </Box>
                                </Box>
                              </Paper>
                            ))}
                          </Box>
                        </Paper>
                      ) : (
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                          <Typography variant="body1" color="text.secondary" gutterBottom>
                            Bu ekipman için henüz sertifika kaydı bulunmamaktadır.
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <input
                              accept=".pdf,.jpg,.jpeg,.png"
                              style={{ display: 'none' }}
                              id="certificate-upload-empty-button"
                              type="file"
                              onChange={(e) => handleCertificateUpload(e, selectedEquipment.id)}
                            />
                            <label htmlFor="certificate-upload-empty-button">
                              <Button
                                variant="contained"
                                component="span"
                                startIcon={<CloudUploadIcon />}
                                disabled={uploadingFile}
                              >
                                İlk Sertifikayı Yükle
                              </Button>
                            </label>
                          </Box>
                        </Paper>
                      )}
                    </Box>
                  )}

                  {/* Tab 3: Görseller */}
                  {viewModalTab === 3 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ViewIcon color="info" />
                        Ekipman Görselleri
                      </Typography>
                      
                      {selectedEquipment.imageIds && selectedEquipment.imageIds.length > 0 ? (
                        <Paper sx={{ p: 3, borderLeft: '4px solid', borderColor: 'info.main' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="info.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ViewIcon />
                              Ekipman Görselleri ({selectedEquipment.imageIds.length})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <input
                                accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
                                style={{ display: 'none' }}
                                id="image-upload-button"
                                type="file"
                                onChange={(e) => handleImageUpload(e, selectedEquipment.id)}
                              />
                              <label htmlFor="image-upload-button">
                                <Button
                                  variant="contained"
                                  component="span"
                                  size="small"
                                  startIcon={<CloudUploadIcon />}
                                  disabled={uploadingFile}
                                >
                                  Görsel Yükle
                                </Button>
                              </label>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {selectedEquipment.imageIds.map((imageId, index) => (
                              <Paper key={imageId} sx={{ p: 2, bgcolor: '#ffffff', border: '1px solid', borderColor: 'grey.200' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <ViewIcon color="primary" />
                                    <Box>
                                      <Typography variant="body2" fontWeight="bold">Görsel #{index + 1}</Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        ID: {imageId}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<ViewIcon />}
                                      onClick={() => handleViewImage(imageId)}
                                    >
                                      Görüntüle
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<DownloadIcon />}
                                      onClick={() => handleDownloadImage(imageId)}
                                    >
                                      İndir
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      startIcon={<DeleteIcon />}
                                      onClick={() => handleDeleteImage(imageId, selectedEquipment.id)}
                                    >
                                      Sil
                                    </Button>
                                  </Box>
                                </Box>
                              </Paper>
                            ))}
                          </Box>
                        </Paper>
                      ) : (
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                          <Typography variant="body1" color="text.secondary" gutterBottom>
                            Bu ekipman için henüz görsel kaydı bulunmamaktadır.
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <input
                              accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
                              style={{ display: 'none' }}
                              id="image-upload-empty-button"
                              type="file"
                              onChange={(e) => handleImageUpload(e, selectedEquipment.id)}
                            />
                            <label htmlFor="image-upload-empty-button">
                              <Button
                                variant="contained"
                                component="span"
                                startIcon={<CloudUploadIcon />}
                                disabled={uploadingFile}
                              >
                                İlk Görseli Yükle
                              </Button>
                            </label>
                          </Box>
                        </Paper>
                      )}
                    </Box>
                  )}

                  {/* Tab 4: Sorumlu Personel */}
                  {viewModalTab === 4 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonAddIcon color="success" />
                        Sorumlu Personel
                      </Typography>
                      
                      {selectedEquipment.responsiblePersonName ? (
                        <Paper sx={{ p: 3, borderLeft: '4px solid', borderColor: 'success.main' }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonAddIcon />
                            Atanmış Personel Bilgileri
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                            <Box>
                              <Typography variant="body2" color="text.secondary">Ana Sorumlu</Typography>
                              <Typography variant="body1" fontWeight="bold">{selectedEquipment.responsiblePersonName}</Typography>
                            </Box>
                            {selectedEquipment.responsiblePersonSicilNo && (
                              <Box>
                                <Typography variant="body2" color="text.secondary">Sicil Numarası</Typography>
                                <Typography variant="body1" fontWeight="bold">{selectedEquipment.responsiblePersonSicilNo}</Typography>
                              </Box>
                            )}
                          </Box>
                          
                          {/* Ek sorumlu personel listesi varsa */}
                          {selectedEquipment.responsiblePersons && selectedEquipment.responsiblePersons.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Diğer Sorumlu Personel
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {selectedEquipment.responsiblePersons.map((sicilNo, index) => {
                                  const person = getPersonnelData().find(p => p.sicilNo === sicilNo);
                                  return (
                                    <Chip 
                                      key={index}
                                      label={person ? `${person.name} (${sicilNo})` : sicilNo}
                                      color="primary"
                                      variant="outlined"
                                      size="small"
                                    />
                                  );
                                })}
                              </Box>
                            </Box>
                          )}
                        </Paper>
                      ) : (
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                          <Typography variant="body1" color="text.secondary">
                            Bu ekipman için henüz sorumlu personel atanmamıştır.
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              <Typography>Diğer modlar için içerik</Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={() => setOpenDialog(false)} 
            size="large"
            startIcon={<ClearIcon />}
          >
            İptal
          </Button>
          {(dialogMode === 'create' || dialogMode === 'edit') && (
            <Button 
              onClick={handleSave} 
              variant="contained" 
              size="large"
              startIcon={<SaveIcon />}
              disabled={!formData.equipmentCode?.trim() || !formData.name?.trim() || !formData.serialNumber?.trim()}
              sx={{ minWidth: 150 }}
            >
              {dialogMode === 'create' ? 'Ekipmanı Kaydet' : 'Değişiklikleri Kaydet'}
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
        keepMounted={false}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '12px',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isEditingPersonnel ? <EditIcon color="primary" /> : <PersonAddIcon color="primary" />}
            {isEditingPersonnel ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
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
                onChange={(e) => setNewPersonnelData({...newPersonnelData, department: e.target.value, position: ''})}
              >
                {DEPARTMENTS.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Pozisyon</InputLabel>
              <Select
              value={newPersonnelData.position}
              onChange={(e) => setNewPersonnelData({...newPersonnelData, position: e.target.value})}
                disabled={!newPersonnelData.department}
              >
                {newPersonnelData.department && getPositionsByDepartment(newPersonnelData.department).map((position) => (
                  <MenuItem key={position} value={position}>{position}</MenuItem>
                ))}
              </Select>
            </FormControl>
            </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenPersonnelDialog(false);
            setIsEditingPersonnel(false);
            setEditingPersonnelId(null);
            setNewPersonnelData({
              sicilNo: '',
              name: '',
              department: '',
              position: ''
            });
          }}>
            İptal
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSavePersonnel}
            startIcon={<SaveIcon />}
          >
            {isEditingPersonnel ? 'Güncelle' : 'Personel Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Personel Yönetimi Dialog'u */}
      <Dialog 
        open={openPersonnelManagementDialog} 
        onClose={() => setOpenPersonnelManagementDialog(false)}
        maxWidth="md"
                fullWidth
        keepMounted={false}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '12px',
            maxHeight: '90vh'
          }
        }}
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
                          color="primary"
                          size="small"
                          onClick={() => handleEditPersonnel(person.id)}
                          sx={{ ml: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
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
              setIsEditingPersonnel(false);
              setEditingPersonnelId(null);
              setNewPersonnelData({
                sicilNo: '',
                name: '',
                department: '',
                position: ''
              });
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

      {/* Üretici Yönetimi Dialogi */}
      <Dialog open={openManufacturerManagementDialog} onClose={() => setOpenManufacturerManagementDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon color="info" />
            Üretici Yönetimi
            </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
              label="Yeni Üretici Ekle"
              value={newManufacturer}
              onChange={(e) => setNewManufacturer(e.target.value)}
              margin="dense"
              placeholder="Örn: Mitutoyo, Starrett, Tesa..."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      variant="contained" 
                      onClick={handleSaveManufacturer}
                      disabled={!newManufacturer.trim()}
                      size="small"
                      color="info"
                    >
                      Ekle
                    </Button>
                  </InputAdornment>
                )
              }}
              />
            </Box>

          <Typography variant="h6" sx={{ mb: 2, color: 'info.main' }}>
            Kayıtlı Üreticiler ({manufacturersList.length})
          </Typography>
          
          {manufacturersList.length === 0 ? (
            <Box sx={{ 
              p: 4, 
              textAlign: 'center', 
              bgcolor: 'grey.50', 
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'grey.300'
            }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Henüz üretici bulunmuyor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yukarıdaki alandan yeni üretici ekleyebilirsiniz.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {manufacturersList.map((manufacturer, index) => (
                <Paper 
                  key={index}
                  sx={{ 
                    p: 2,
                    mb: 1,
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    '&:hover': { bgcolor: 'info.50' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BuildIcon color="info" fontSize="small" />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {manufacturer}
                    </Typography>
            </Box>
                  <Button 
                    size="small" 
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      if (window.confirm(`"${manufacturer}" üreticisini silmek istediğinize emin misiniz?`)) {
                        const updatedList = manufacturersList.filter(m => m !== manufacturer);
                        setManufacturersList(updatedList);
                        localStorage.setItem('manufacturers_list', JSON.stringify(updatedList));
                      }
                    }}
                  >
                    Sil
                  </Button>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenManufacturerManagementDialog(false)}>
            Kapat
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setOpenManufacturerManagementDialog(false);
              setOpenManufacturerDialog(true);
            }}
            startIcon={<AddIcon />}
            color="info"
          >
            Hızlı Ekle
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

      {/* Model Yönetimi Dialogi */}
      <Dialog open={openModelManagementDialog} onClose={() => setOpenModelManagementDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon color="info" />
            Model Yönetimi
            </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
              label="Yeni Model Ekle"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              margin="dense"
              placeholder="Örn: CD-15APX, 799-1234, HD-2000..."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      variant="contained" 
                      onClick={handleSaveModel}
                      disabled={!newModel.trim()}
                      size="small"
                      color="info"
                    >
                      Ekle
                    </Button>
                  </InputAdornment>
                )
              }}
              />
            </Box>

          <Typography variant="h6" sx={{ mb: 2, color: 'info.main' }}>
            Kayıtlı Modeller ({modelsList.length})
          </Typography>
          
          {modelsList.length === 0 ? (
            <Box sx={{ 
              p: 4, 
              textAlign: 'center', 
              bgcolor: 'grey.50', 
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'grey.300'
            }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Henüz model bulunmuyor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yukarıdaki alandan yeni model ekleyebilirsiniz.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {modelsList.map((model, index) => (
                <Paper 
                  key={index}
                  sx={{ 
                    p: 2,
                    mb: 1,
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    '&:hover': { bgcolor: 'info.50' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BuildIcon color="info" fontSize="small" />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {model}
                    </Typography>
            </Box>
                  <Button 
                    size="small" 
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      if (window.confirm(`"${model}" modelini silmek istediğinize emin misiniz?`)) {
                        const updatedList = modelsList.filter(m => m !== model);
                        setModelsList(updatedList);
                        localStorage.setItem('models_list', JSON.stringify(updatedList));
                      }
                    }}
                  >
                    Sil
                  </Button>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModelManagementDialog(false)}>
            Kapat
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setOpenModelManagementDialog(false);
              setOpenModelDialog(true);
            }}
            startIcon={<AddIcon />}
            color="info"
          >
            Hızlı Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cihaz Adı Ekleme Dialogi */}
      <Dialog open={openEquipmentNameDialog} onClose={() => setOpenEquipmentNameDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Cihaz Adı Ekle</DialogTitle>
        <DialogContent>
              <TextField
                fullWidth
            label="Cihaz Adı"
            value={newEquipmentName}
            onChange={(e) => setNewEquipmentName(e.target.value)}
            margin="dense"
            placeholder="Örn: Dijital Kumpas, Mikrometre, Termometre..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEquipmentNameDialog(false)}>İptal</Button>
          <Button 
            onClick={handleSaveEquipmentName} 
            variant="contained"
            disabled={!newEquipmentName.trim()}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cihaz Adı Yönetimi Dialogi */}
      <Dialog open={openEquipmentNameManagementDialog} onClose={() => setOpenEquipmentNameManagementDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon color="info" />
            Cihaz Adları Yönetimi
            </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
              label="Yeni Cihaz Adı Ekle"
              value={newEquipmentName}
              onChange={(e) => setNewEquipmentName(e.target.value)}
              margin="dense"
              placeholder="Örn: Dijital Kumpas, Mikrometre, Termometre..."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      variant="contained" 
                      onClick={handleSaveEquipmentName}
                      disabled={!newEquipmentName.trim()}
                      size="small"
                      color="info"
                    >
                      Ekle
                    </Button>
                  </InputAdornment>
                )
              }}
              />
            </Box>

          <Typography variant="h6" sx={{ mb: 2, color: 'info.main' }}>
            Kayıtlı Cihaz Adları ({equipmentNamesList.length})
          </Typography>
          
          {equipmentNamesList.length === 0 ? (
            <Box sx={{ 
              p: 4, 
              textAlign: 'center', 
              bgcolor: 'grey.50', 
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'grey.300'
            }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Henüz cihaz adı bulunmuyor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yukarıdaki alandan yeni cihaz adı ekleyebilirsiniz.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {equipmentNamesList.map((name, index) => (
                <Paper 
                  key={index}
                  sx={{ 
                    p: 2,
                    mb: 1,
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    '&:hover': { bgcolor: 'info.50' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScienceIcon color="info" fontSize="small" />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {name}
                    </Typography>
            </Box>
                  <Button 
                    size="small" 
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteEquipmentName(name)}
                  >
                    Sil
                  </Button>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEquipmentNameManagementDialog(false)}>
            Kapat
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setOpenEquipmentNameManagementDialog(false);
              setOpenEquipmentNameDialog(true);
            }}
            startIcon={<AddIcon />}
            color="info"
          >
            Hızlı Ekle
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

      {/* Ölçüm Aralığı Yönetimi Dialogi */}
      <Dialog open={openMeasurementRangeManagementDialog} onClose={() => setOpenMeasurementRangeManagementDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScienceIcon color="warning" />
            Ölçüm Aralığı Yönetimi - {formData.category}
            </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
              label="Yeni Ölçüm Aralığı Ekle"
              value={newMeasurementRange}
              onChange={(e) => setNewMeasurementRange(e.target.value)}
              margin="dense"
              placeholder="Örn: 0-150mm, 0-500mm, 0-1000mm..."
              helperText="mm eklenmemişse otomatik eklenecektir"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      variant="contained" 
                      onClick={handleSaveMeasurementRange}
                      disabled={!newMeasurementRange.trim()}
                      size="small"
                      color="warning"
                    >
                      Ekle
                    </Button>
                  </InputAdornment>
                )
              }}
              />
            </Box>

          <Typography variant="h6" sx={{ mb: 2, color: 'warning.main' }}>
            {formData.category} Kategorisi Ölçüm Aralıkları ({formData.category ? (measurementRanges[formData.category] || []).length : 0})
          </Typography>
          
          {!formData.category ? (
            <Alert severity="warning">
              Önce kategori seçmelisiniz.
            </Alert>
          ) : (measurementRanges[formData.category] || []).length === 0 ? (
            <Box sx={{ 
              p: 4, 
              textAlign: 'center', 
              bgcolor: 'warning.50', 
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'warning.300'
            }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Bu kategori için ölçüm aralığı bulunmuyor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yukarıdaki alandan yeni ölçüm aralığı ekleyebilirsiniz.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {(measurementRanges[formData.category] || []).map((range: string, index: number) => (
                range !== 'Diğer' && (
                  <Paper 
                    key={index}
                    sx={{ 
                      p: 2,
                      mb: 1,
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      '&:hover': { bgcolor: 'warning.50' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScienceIcon color="warning" fontSize="small" />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {range}
                      </Typography>
                    </Box>
                    <Button 
                      size="small" 
                      color="error"
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        if (window.confirm(`"${range}" aralığını silmek istediğinize emin misiniz?`)) {
                          handleDeleteMeasurementRange(range);
                        }
                      }}
                    >
                      Sil
                    </Button>
                  </Paper>
                )
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMeasurementRangeManagementDialog(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ölçüm Belirsizliği Yönetimi Dialogi */}
      <Dialog open={openMeasurementUncertaintyManagementDialog} onClose={() => setOpenMeasurementUncertaintyManagementDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScienceIcon color="warning" />
            Ölçüm Belirsizliği Yönetimi - {formData.category}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
              label="Yeni Ölçüm Belirsizliği Ekle"
              value={newMeasurementUncertainty}
              onChange={(e) => setNewMeasurementUncertainty(e.target.value)}
              margin="dense"
              placeholder="Örn: ±0.01mm, ±0.1mm, ±0.5mm..."
              helperText="± ve mm eklenmemişse otomatik eklenecektir"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      variant="contained" 
                      onClick={handleSaveMeasurementUncertainty}
                      disabled={!newMeasurementUncertainty.trim()}
                      size="small"
                      color="warning"
                    >
                      Ekle
                    </Button>
                  </InputAdornment>
                )
              }}
              />
            </Box>

          <Typography variant="h6" sx={{ mb: 2, color: 'warning.main' }}>
            {formData.category} Kategorisi Ölçüm Belirsizlikleri ({formData.category ? (measurementUncertainties[formData.category] || []).length : 0})
          </Typography>
          
          {!formData.category ? (
            <Alert severity="warning">
              Önce kategori seçmelisiniz.
            </Alert>
          ) : (measurementUncertainties[formData.category] || []).length === 0 ? (
            <Box sx={{ 
              p: 4, 
              textAlign: 'center', 
              bgcolor: 'warning.50', 
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'warning.300'
            }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Bu kategori için ölçüm belirsizliği bulunmuyor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yukarıdaki alandan yeni ölçüm belirsizliği ekleyebilirsiniz.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {(measurementUncertainties[formData.category] || []).map((uncertainty: string, index: number) => (
                uncertainty !== 'Diğer' && (
                  <Paper 
                    key={index}
                    sx={{ 
                      p: 2,
                      mb: 1,
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      '&:hover': { bgcolor: 'warning.50' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScienceIcon color="warning" fontSize="small" />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {uncertainty}
                      </Typography>
                    </Box>
                    <Button 
                      size="small" 
                      color="error"
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        if (window.confirm(`"${uncertainty}" belirsizliğini silmek istediğinize emin misiniz?`)) {
                          handleDeleteMeasurementUncertainty(uncertainty);
                        }
                      }}
                    >
                      Sil
                    </Button>
                  </Paper>
                )
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMeasurementUncertaintyManagementDialog(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
  };
  
export default EquipmentCalibrationManagement; 