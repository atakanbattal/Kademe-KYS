import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
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
  Tabs,
  Tab,
  Alert,
  Snackbar,
  InputAdornment,
  Grid,
  Autocomplete,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  VerifiedUser as VerifiedUserIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../context/ThemeContext';

// ✅ GELIŞMIŞ PDF DEPOLAMA SİSTEMİ - IndexedDB ile
class PDFStorageManager {
  private dbName = 'DocumentManagementDB';
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
        if (!db.objectStoreNames.contains('pdfs')) {
          db.createObjectStore('pdfs', { keyPath: 'id' });
        }
      };
    });
  }

  async savePDF(documentId: string, pdfData: string, fileName: string, size: number): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pdfs'], 'readwrite');
      const store = transaction.objectStore('pdfs');
      
      const request = store.put({
        id: documentId,
        pdfData,
        fileName,
        size,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPDF(documentId: string): Promise<any> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pdfs'], 'readonly');
      const store = transaction.objectStore('pdfs');
      const request = store.get(documentId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deletePDF(documentId: string): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pdfs'], 'readwrite');
      const store = transaction.objectStore('pdfs');
      const request = store.delete(documentId);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllPDFs(): Promise<any[]> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pdfs'], 'readonly');
      const store = transaction.objectStore('pdfs');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllPDFs(): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pdfs'], 'readwrite');
      const store = transaction.objectStore('pdfs');
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageInfo(): Promise<{ used: number; pdfs: number }> {
    try {
      const pdfs = await this.getAllPDFs();
      const used = pdfs.reduce((total, pdf) => total + (pdf.size || 0), 0);
      return { used, pdfs: pdfs.length };
    } catch (error) {
      console.error('Storage info error:', error);
      return { used: 0, pdfs: 0 };
    }
  }
}

// ✅ SADECE GEREKLİ INTERFACES - PDF bilgileri kaldırıldı
interface Document {
  id: string;
  type: string;
  name: string;
  number: string;
  unit: string;
  welderName?: string;
  personnelName?: string;
  certificateNumber?: string;
  issuingAuthority?: string;
  effectiveDate: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'draft';
  uploadDate: string;
  description: string;
  // PDF bilgileri artık burada yok - IndexedDB'de saklanıyor
  hasPDF?: boolean;  // Sadece PDF olup olmadığını belirtir
  pdfFileName?: string;  // Sadece dosya adı
  pdfSize?: number;  // Sadece boyut bilgisi
}

interface WelderData {
  id: string;
  name: string;
  registrationNo: string;
  department: string;
  position: string;
}

interface PersonnelData {
  id: string;
  name: string;
  registrationNo: string;
  department: string;
  position: string;
}

// ✅ DETAYLANDIRILMIŞ VE GRUPLANDIRILMIŞ BELGE TİPLERİ
const DOCUMENT_TYPES = {
  'Kalite Sistem Belgeleri': [
    'ISO 9001:2015 Kalite Yönetim Sistemi Belgesi',
    'ISO 14001:2015 Çevre Yönetim Sistemi Belgesi',
    'ISO 45001:2018 İSG Yönetim Sistemi Belgesi',
    'ISO 18001:2007 İSG Yönetim Sistemi Belgesi (OHSAS 18001)',
    'ISO 50001:2018 Enerji Yönetim Sistemi Belgesi',
    'ISO 27001:2013 Bilgi Güvenliği Yönetim Sistemi',
    'ISO 28001:2007 Tedarik Zinciri Güvenlik Yönetim Sistemi',
    'ISO 10002:2018 Müşteri Memnuniyeti Yönetim Sistemi',
    'TS 3834-2 Kaynak Kalite Gereksinimleri',
    'TS EN ISO 15085 Demiryolu Uygulamaları',
    'PED 2014/68/EU Basınçlı Ekipman Direktifi',
    'CE İşaretleme Uygunluk Belgesi',
    'GOST-R Rus Federasyonu Uygunluk Belgesi',
    'EAC Avrasya Gümrük Birliği Belgesi'
  ],
  'Kaynakçı Belgeleri': [
    'EN ISO 9606-1 Çelik Kaynak Sertifikası',
    'EN ISO 9606-2 Alüminyum Kaynak Sertifikası',
    'EN ISO 9606-3 Bakır Kaynak Sertifikası',
    'EN ISO 9606-4 Nikel Kaynak Sertifikası',
    'EN ISO 14732 Personel Kaynak Sertifikası',
    'ASME IX Kaynakçı Nitelik Belgesi',
    'AWS D1.1 Yapısal Kaynak Sertifikası',
    'EN 287-1 Kaynak Operatörü Belgesi',
    'API 1104 Boru Hattı Kaynak Sertifikası',
    'DNV GL Offshore Kaynak Sertifikası'
  ],
  'NDT Personel Belgeleri': [
    'EN ISO 9712 Level 1 - Görsel Muayene (VT)',
    'EN ISO 9712 Level 2 - Görsel Muayene (VT)',
    'EN ISO 9712 Level 3 - Görsel Muayene (VT)',
    'EN ISO 9712 Level 1 - Penetrant Test (PT)',
    'EN ISO 9712 Level 2 - Penetrant Test (PT)',
    'EN ISO 9712 Level 3 - Penetrant Test (PT)',
    'EN ISO 9712 Level 1 - Manyetik Parçacık (MT)',
    'EN ISO 9712 Level 2 - Manyetik Parçacık (MT)',
    'EN ISO 9712 Level 3 - Manyetik Parçacık (MT)',
    'EN ISO 9712 Level 1 - Ultrasonik Test (UT)',
    'EN ISO 9712 Level 2 - Ultrasonik Test (UT)',
    'EN ISO 9712 Level 3 - Ultrasonik Test (UT)',
    'EN ISO 9712 Level 1 - Radyografik Test (RT)',
    'EN ISO 9712 Level 2 - Radyografik Test (RT)',
    'EN ISO 9712 Level 3 - Radyografik Test (RT)',
    'EN ISO 9712 Level 2 - Eddy Current Test (ET)',
    'EN ISO 9712 Level 3 - Eddy Current Test (ET)',
    'ASNT SNT-TC-1A NDT Sertifikası',
    'PCN (Personnel Certification in NDT) Belgesi'
  ],
  'İSG ve Güvenlik Belgeleri': [
    'İSG Uzmanı Belgesi (A Sınıfı)',
    'İSG Uzmanı Belgesi (B Sınıfı)',
    'İSG Uzmanı Belgesi (C Sınıfı)',
    'İş Güvenliği Uzmanı Yetki Belgesi',
    'İşyeri Hekimi Belgesi',
    'İlk Yardım Eğitimi Sertifikası',
    'Yangın Güvenliği Eğitimi Sertifikası',
    'Çalışma Yüksekliği Eğitimi Belgesi',
    'Kapalı Alan Güvenliği Eğitimi',
    'Forklift Operatörü Belgesi',
    'Vinç Operatörü Belgesi',
    'İş Makinesi Operatörü Belgesi',
    'Gerçek Kişi Güvenlik Görevlisi Belgesi',
    'Tüzel Kişi Güvenlik Görevlisi Belgesi',
    'Radyasyon Güvenliği Eğitimi Belgesi'
  ],
  'Mesleki Yeterlilik Belgeleri': [
    'Kaynak Teknolojisi Seviye 4 MYB',
    'Kaynak Teknolojisi Seviye 5 MYB',
    'Makine İmalat Teknolojisi Seviye 4 MYB',
    'Makine İmalat Teknolojisi Seviye 5 MYB',
    'Kalite Kontrol Teknisyeni Seviye 4 MYB',
    'Kalite Kontrol Teknisyeni Seviye 5 MYB',
    'Endüstriyel Bakım Teknisyeni Seviye 4 MYB',
    'Endüstriyel Bakım Teknisyeni Seviye 5 MYB',
    'Proje Yöneticisi Seviye 6 MYB',
    'Üretim Planlama Uzmanı Seviye 5 MYB'
  ],
  'Teknik Belgeler': [
    'WPS (Welding Procedure Specification)',
    'WPQR (Welding Procedure Qualification Record)',
    'WQT (Welder Qualification Test)',
    'Teknik Resim / Çizim',
    'Malzeme Sertifikası (Mill Certificate)',
    'Isıl İşlem Sertifikası',
    'Boyutsal Kontrol Raporu',
    'NDT Muayene Raporu',
    'Basınç Testi Raporu',
    'Kalibrmasyon Sertifikası',
    'Test Prosedürü',
    'Kontrol Planı',
    'FMEA (Failure Mode and Effects Analysis)',
    'SPC (Statistical Process Control) Çalışması'
  ],
  'Sistem Prosedür ve Talimatlar': [
    'Kalite Prosedürü',
    'İş Talimatı',
    'Kontrol Listesi',
    'Kalite Planı',
    'Muayene ve Test Planı',
    'Ürün Spesifikasyonu',
    'Malzeme Spesifikasyonu',
    'Üretim Prosedürü',
    'Paketleme ve Sevkiyat Talimatı',
    'Satın Alma Spesifikasyonu',
    'Tedarikçi Değerlendirme Prosedürü',
    'Düzeltici ve Önleyici Faaliyet Prosedürü',
    'İç Denetim Prosedürü',
    'Yönetim Gözden Geçirme Prosedürü'
  ],
};

// ✅ BELGE TİPLERİNİ DROPDOWN İÇİN HAZIRLA
const ALL_DOCUMENT_TYPES = Object.entries(DOCUMENT_TYPES).flatMap(([category, types]) =>
  types.map(type => ({ type, category }))
);

// ✅ KALİTE SERTİFİKASI KATEGORİLERİ
const QUALITY_CERTIFICATE_CATEGORIES = [
  'Kalite Sistem Belgeleri',
  'Kaynakçı Belgeleri',
  'NDT Personel Belgeleri',
  'İSG ve Güvenlik Belgeleri',
  'Mesleki Yeterlilik Belgeleri'
];

// ✅ UNITS (BİRİMLER) - FABRİKADAKİ GERÇEK BİRİMLER
const UNITS = [
  'Genel Müdürlük',
  'Kalite Kontrol',
  'Üretim',
  'Kaynak Bölümü',
  'Makine İmalat',
  'Montaj',
  'Boyahane',
  'Depo',
  'Satın Alma',
  'Proje',
  'Ar-Ge',
  'İnsan Kaynakları',
  'Muhasebe',
  'Bilgi İşlem',
  'Güvenlik',
  'Temizlik',
  'Yemekhane',
  'Laboratuvar',
  'Kalibrasyon',
  'NDT Muayene',
  'İSG'
];

// ✅ FORM STATES VE INITIAL VALUES
const initialDocumentState = {
  type: '',
  name: '',
  number: '',
  unit: '',
  welderName: '',
  personnelName: '',
  certificateNumber: '',
  issuingAuthority: '',
  customIssuingAuthority: '',
  effectiveDate: '',
  expiryDate: '',
  status: 'active' as const,
  description: ''
};

const initialWelderState = {
  name: '',
  registrationNo: '',
  department: '',
  position: ''
};

const initialPersonnelState = {
  name: '',
  registrationNo: '',
  department: '',
  position: ''
};

// ✅ VEREN KURULUŞLAR
const ISSUING_AUTHORITIES = [
  'TSE (Türk Standardları Enstitüsü)',
  'TÜRKAK (Türk Akreditasyon Kurumu)',
  'Bureau Veritas',
  'Lloyd\'s Register',
  'DNV GL',
  'TÜV SÜD',
  'TÜV NORD',
  'SGS',
  'DEKRA',
  'Intertek',
  'BSI Group',
  'ASME',
  'AWS (American Welding Society)',
  'API (American Petroleum Institute)',
  'ISO (International Organization for Standardization)',
  'CEN (European Committee for Standardization)',
  'NORSOK',
  'ÇALIŞMA VE SOSYAL GÜVENLİK BAKANLIĞI',
  'MEB (Milli Eğitim Bakanlığı)',
  'MTSK (Mesleki Yeterlilik Kurumu)',
  'UYUM',
  'KALDER',
  'Diğer Kuruluş'
];

// ✅ DEPARTMANLAR
const DEPARTMENTS = [
  'Genel Müdürlük',
  'Kalite Kontrol',
  'Üretim',
  'Kaynak Bölümü',
  'Makine İmalat',
  'Montaj',
  'Boyahane',
  'Depo',
  'Satın Alma',
  'Proje',
  'Ar-Ge',
  'İnsan Kaynakları',
  'Muhasebe',
  'Bilgi İşlem',
  'Güvenlik',
  'Temizlik',
  'Yemekhane',
  'Laboratuvar',
  'Kalibrasyon',
  'NDT Muayene',
  'İSG'
];

// ✅ GLOBAL PDF STORAGE MANAGER
const pdfStorage = new PDFStorageManager();

// ✅ MAIN COMPONENT
const DocumentManagement: React.FC = () => {
  const { } = useThemeContext();
  
  // ✅ STATES
  const [documents, setDocuments] = useState<Document[]>([]);
  const [welders, setWelders] = useState<WelderData[]>([]);
  const [personnel, setPersonnel] = useState<PersonnelData[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [currentType, setCurrentType] = useState<'document' | 'welder' | 'personnel'>('document');
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storageInfo, setStorageInfo] = useState({ used: 0, pdfs: 0 });
  
  // ✅ FORM STATES
  const [documentForm, setDocumentForm] = useState(initialDocumentState);
  const [welderForm, setWelderForm] = useState(initialWelderState);
  const [personnelForm, setPersonnelForm] = useState(initialPersonnelState);
  const [editingItem, setEditingItem] = useState<any>(null);

  // ✅ UTILITY FUNCTIONS
  const calculateDaysRemaining = (expiryDate: string): number => {
    if (!expiryDate) return 999;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysRemainingStatus = (daysRemaining: number) => {
    if (daysRemaining < 0) return { text: 'Süresi Dolmuş', color: 'error' as const };
    if (daysRemaining === 0) return { text: 'Bugün Sona Eriyor', color: 'warning' as const };
    if (daysRemaining <= 7) return { text: `${daysRemaining} gün kaldı`, color: 'warning' as const };
    if (daysRemaining <= 30) return { text: `${daysRemaining} gün kaldı`, color: 'info' as const };
    return { text: `${daysRemaining} gün kaldı`, color: 'success' as const };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ✅ GELIŞMIŞ PDF YÜKLEME - IndexedDB ile
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentId: string) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ Dosya seçilmedi');
      return;
    }

    console.log('📄 Dosya seçildi:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified)
    });

    // Dosya tipi doğrulaması
    const validTypes = ['application/pdf'];
    const validExtensions = ['.pdf'];
    const fileName = file.name.toLowerCase();
    
    if (!validTypes.includes(file.type) && !validExtensions.some(ext => fileName.endsWith(ext))) {
      setSnackbar({ 
        open: true, 
        message: `Geçersiz dosya formatı! Sadece PDF dosyaları (.pdf) yüklenebilir. Seçilen dosya: ${file.type}`, 
        severity: 'error' 
      });
      return;
    }

    // Dosya boyutu kontrolü - IndexedDB ile daha büyük dosyalar
    const maxSize = 10 * 1024 * 1024; // 10MB (IndexedDB ile rahat)
    if (file.size > maxSize) {
      setSnackbar({ 
        open: true, 
        message: `Dosya boyutu çok büyük! Maksimum 10MB olabilir. Seçilen dosya: ${formatFileSize(file.size)}`, 
        severity: 'error' 
      });
      return;
    }

    if (file.size === 0) {
      setSnackbar({ 
        open: true, 
        message: 'Dosya boş! Lütfen geçerli bir PDF dosyası seçin.', 
        severity: 'error' 
      });
      return;
    }

    setUploadingFile(true);
    setUploadProgress(0);
    setSnackbar({ 
      open: true, 
      message: 'PDF dosyası yükleniyor...', 
      severity: 'info' 
    });

    try {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          
          // Base64 format kontrol
          if (!base64 || !base64.startsWith('data:application/pdf;base64,')) {
            throw new Error('Base64 format hatası');
          }

          console.log('✅ PDF Base64 dönüşümü başarılı:', base64.length, 'karakter');
          
          // IndexedDB'ye PDF kaydet
          await pdfStorage.savePDF(documentId, base64, file.name, file.size);
          
          // Belge bilgilerini güncelle - sadece metadata
          const updatedDocs = documents.map(doc => 
            doc.id === documentId 
              ? { 
                  ...doc, 
                  hasPDF: true,
                  pdfFileName: file.name,
                  pdfSize: file.size
                }
              : doc
          );
          
          setDocuments(updatedDocs);
          
          // Sadece metadata'yı localStorage'a kaydet
          try {
            localStorage.setItem('dm-documents', JSON.stringify(updatedDocs));
            console.log('✅ Belge metadata başarıyla kaydedildi');
          } catch (error) {
            console.error('❌ Metadata kaydetme hatası:', error);
          }
          
          // Storage info güncelle
          updateStorageInfo();
          
          setSnackbar({ 
            open: true, 
            message: `PDF başarıyla yüklendi! Dosya: ${file.name} (${formatFileSize(file.size)})`, 
            severity: 'success' 
          });
          
        } catch (error) {
          console.error('❌ PDF işleme hatası:', error);
          setSnackbar({ 
            open: true, 
            message: 'PDF dosyası işlenemedi! Lütfen farklı bir dosya deneyin.', 
            severity: 'error' 
          });
        }
        
        setUploadingFile(false);
        setUploadProgress(0);
      };

      reader.onerror = (error) => {
        console.error('❌ FileReader hatası:', error);
        setSnackbar({ 
          open: true, 
          message: 'Dosya okuma hatası! Lütfen dosyayı kontrol edin ve tekrar deneyin.', 
          severity: 'error' 
        });
        setUploadingFile(false);
        setUploadProgress(0);
      };

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
          console.log(`📊 PDF yükleme ilerlemesi: ${percentComplete}%`);
        }
      };

      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('❌ PDF yükleme hatası:', error);
      setSnackbar({ 
        open: true, 
        message: 'PDF yükleme hatası! Lütfen tekrar deneyin.', 
        severity: 'error' 
      });
      setUploadingFile(false);
      setUploadProgress(0);
    }
  };

  // ✅ PDF GÖRÜNTÜLEME - IndexedDB'den
  const handleViewPDF = async (doc: Document) => {
    if (!doc.hasPDF) {
      setSnackbar({ open: true, message: 'Bu belgeye PDF yüklenmemiş!', severity: 'error' });
      return;
    }

    try {
      const pdfData = await pdfStorage.getPDF(doc.id);
      
      if (!pdfData || !pdfData.pdfData) {
        setSnackbar({ open: true, message: 'PDF bulunamadı! Lütfen tekrar yükleyin.', severity: 'error' });
        return;
      }

      const blob = new Blob([Uint8Array.from(atob(pdfData.pdfData.split(',')[1]), c => c.charCodeAt(0))], {
        type: 'application/pdf'
      });
      
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      
    } catch (error) {
      console.error('❌ PDF görüntüleme hatası:', error);
      setSnackbar({ 
        open: true, 
        message: 'PDF görüntüleme hatası! Dosya bozuk olabilir.', 
        severity: 'error' 
      });
    }
  };

  // ✅ PDF İNDİRME - IndexedDB'den
  const handleDownloadPDF = async (doc: Document) => {
    if (!doc.hasPDF) {
      setSnackbar({ open: true, message: 'Bu belgeye PDF yüklenmemiş!', severity: 'error' });
      return;
    }

    try {
      const pdfData = await pdfStorage.getPDF(doc.id);
      
      if (!pdfData || !pdfData.pdfData) {
        setSnackbar({ open: true, message: 'PDF bulunamadı! Lütfen tekrar yükleyin.', severity: 'error' });
        return;
      }

      const base64Data = pdfData.pdfData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfData.fileName || `${doc.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      
      setSnackbar({ 
        open: true, 
        message: `PDF indirildi: ${pdfData.fileName}`, 
        severity: 'success' 
      });
      
    } catch (error) {
      console.error('❌ PDF indirme hatası:', error);
      setSnackbar({ 
        open: true, 
        message: 'PDF indirme hatası! Dosya bozuk olabilir.', 
        severity: 'error' 
      });
    }
  };

  // ✅ PDF KALDIRMA - IndexedDB'den
  const handleRemovePDF = async (doc: Document) => {
    if (!doc.hasPDF) {
      setSnackbar({ open: true, message: 'Bu belgeye PDF yüklenmemiş!', severity: 'error' });
      return;
    }

    if (window.confirm(`${doc.name} belgesinin PDF dosyasını kaldırmak istiyor musunuz? Belge bilgileri korunacak.`)) {
      try {
        await pdfStorage.deletePDF(doc.id);
        
        const updatedDocs = documents.map(d => 
          d.id === doc.id 
            ? { ...d, hasPDF: false, pdfFileName: undefined, pdfSize: undefined }
            : d
        );
        
        setDocuments(updatedDocs);
        localStorage.setItem('dm-documents', JSON.stringify(updatedDocs));
        
        updateStorageInfo();
        
        setSnackbar({ 
          open: true, 
          message: 'PDF başarıyla kaldırıldı!', 
          severity: 'success' 
        });
        
      } catch (error) {
        console.error('❌ PDF kaldırma hatası:', error);
        setSnackbar({ 
          open: true, 
          message: 'PDF kaldırma hatası! Lütfen tekrar deneyin.', 
          severity: 'error' 
        });
      }
    }
  };

  // ✅ STORAGE INFO GÜNCELLEME
  const updateStorageInfo = async () => {
    try {
      const info = await pdfStorage.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Storage info update error:', error);
    }
  };

  // ✅ DATA LOADING - GELİŞMİŞ HATA KONTROLÜ
  useEffect(() => {
    const loadDocuments = () => {
      try {
        const sources = ['dm-documents', 'documentManagementData'];
        
        for (const source of sources) {
          const data = localStorage.getItem(source);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              if (Array.isArray(parsed) && parsed.length > 0) {
                console.log(`✅ Belgeler yüklendi (${source}):`, parsed.length);
                setDocuments(parsed);
                return;
              }
            } catch (parseError) {
              console.error(`❌ Parse hatası (${source}):`, parseError);
            }
          }
        }
        
        console.log('📝 Hiç belge bulunamadı, boş liste başlatılıyor');
        setDocuments([]);
      } catch (error) {
        console.error('❌ Belge yükleme hatası:', error);
        setDocuments([]);
      }
    };

    const loadWelders = () => {
      try {
        const data = localStorage.getItem('dm-welders');
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            setWelders(parsed);
            console.log('✅ Kaynakçılar yüklendi:', parsed.length);
          }
        }
      } catch (error) {
        console.error('❌ Kaynakçı yükleme hatası:', error);
        setWelders([]);
      }
    };

    const loadPersonnel = () => {
      try {
        const data = localStorage.getItem('dm-personnel');
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            setPersonnel(parsed);
            console.log('✅ Personel yüklendi:', parsed.length);
          }
        }
      } catch (error) {
        console.error('❌ Personel yükleme hatası:', error);
        setPersonnel([]);
      }
    };

    loadDocuments();
    loadWelders();
    loadPersonnel();
    
    // PDF storage'ı initialize et
    pdfStorage.initialize().then(() => {
      updateStorageInfo();
    });
  }, []);

  // ✅ VIEW DOCUMENT
  const handleViewDocument = (doc: Document) => {
    setViewingDocument(doc);
    setViewModal(true);
  };

  // ✅ GELIŞMIŞ VERİ DURUMU KONTROLÜ - IndexedDB ile
  const checkDataStatus = async () => {
    try {
      const localStorageData = [
        'dm-documents',
        'dm-welders',
        'dm-personnel'
      ];
      
      let localStorageSize = 0;
      
      console.log('📊 DETAYLI VERİ DURUMU RAPORU:');
      console.log('==========================================');
      
      localStorageData.forEach(source => {
        const data = localStorage.getItem(source);
        if (data) {
          try {
            const dataSize = data.length;
            localStorageSize += dataSize;
            const parsed = JSON.parse(data);
            
            console.log(`✅ ${source}:`);
            console.log(`   - Boyut: ${formatFileSize(dataSize)}`);
            console.log(`   - Kayıt: ${Array.isArray(parsed) ? parsed.length : 'N/A'}`);
          } catch (error) {
            console.log(`❌ ${source}: Parse hatası`);
          }
        } else {
          console.log(`❌ ${source}: Bulunamadı`);
        }
      });
      
      // IndexedDB bilgilerini al
      const indexedDBInfo = await pdfStorage.getStorageInfo();
      
      console.log('==========================================');
      console.log(`🔍 DEPOLAMA ÖZETİ:`);
      console.log(`   - LocalStorage: ${formatFileSize(localStorageSize)}`);
      console.log(`   - IndexedDB: ${formatFileSize(indexedDBInfo.used)}`);
      console.log(`   - Toplam PDF: ${indexedDBInfo.pdfs} adet`);
      console.log(`   - Toplam Boyut: ${formatFileSize(localStorageSize + indexedDBInfo.used)}`);
      
      setSnackbar({ 
        open: true, 
        message: `Veri durumu F12 konsolunda görüntülendi. LocalStorage: ${formatFileSize(localStorageSize)}, IndexedDB: ${formatFileSize(indexedDBInfo.used)}, PDF: ${indexedDBInfo.pdfs} adet.`, 
        severity: 'info' 
      });
      
    } catch (error) {
      console.error('❌ Veri durumu kontrol hatası:', error);
      setSnackbar({ 
        open: true, 
        message: 'Veri durumu kontrol hatası!', 
        severity: 'error' 
      });
    }
  };

  // ✅ PDF TEMİZLEME - IndexedDB'den
  const clearAllPDFs = async () => {
    if (window.confirm('UYARI: Tüm PDF dosyaları IndexedDB\'den silinecek! Belgeler korunacak ancak PDF içerikleri kaldırılacak. Devam etmek istiyor musunuz?')) {
      try {
        await pdfStorage.clearAllPDFs();
        
        const cleanedDocs = documents.map(doc => ({
          ...doc,
          hasPDF: false,
          pdfFileName: undefined,
          pdfSize: undefined
        }));
        
        setDocuments(cleanedDocs);
        localStorage.setItem('dm-documents', JSON.stringify(cleanedDocs));
        
        updateStorageInfo();
        
        console.log('🧹 Tüm PDF dosyaları IndexedDB\'den temizlendi');
        setSnackbar({ 
          open: true, 
          message: 'Tüm PDF dosyaları temizlendi! Belgeler korundu, artık yeni PDF yükleyebilirsiniz.', 
          severity: 'success' 
        });
      } catch (error) {
        console.error('❌ PDF temizleme hatası:', error);
        setSnackbar({ 
          open: true, 
          message: 'PDF temizleme hatası! Lütfen tekrar deneyin.', 
          severity: 'error' 
        });
      }
    }
  };

  // ✅ TÜM VERİ TEMİZLEME
  const clearAllData = async () => {
    if (window.confirm('UYARI: Tüm belgeler, kaynakçılar, personel bilgileri ve PDF dosyaları silinecek! Devam etmek istiyor musunuz?')) {
      try {
        const localStorageKeys = [
          'dm-documents',
          'dm-welders',
          'dm-personnel'
        ];
        
        localStorageKeys.forEach(key => {
          localStorage.removeItem(key);
        });
        
        await pdfStorage.clearAllPDFs();
        
        setDocuments([]);
        setWelders([]);
        setPersonnel([]);
        
        updateStorageInfo();
        
        console.log('🧹 Tüm veriler temizlendi');
        setSnackbar({ 
          open: true, 
          message: 'Tüm veriler temizlendi.', 
          severity: 'success' 
        });
        
      } catch (error) {
        console.error('❌ Veri temizleme hatası:', error);
        setSnackbar({ 
          open: true, 
          message: 'Veri temizleme hatası! Lütfen tekrar deneyin.', 
          severity: 'error' 
        });
      }
    }
  };

  // ✅ DIALOG AÇMA
  const openCreateDialog = (type: 'document' | 'welder' | 'personnel') => {
    setCurrentType(type);
    setEditingItem(null);
    setDocumentForm(initialDocumentState);
    setWelderForm(initialWelderState);
    setPersonnelForm(initialPersonnelState);
    setCreateDialog(true);
  };

  // ✅ BELGE KAYDETME
  const handleSaveDocument = () => {
    if (!documentForm.name || !documentForm.type || !documentForm.number || !documentForm.unit) {
      setSnackbar({ open: true, message: 'Lütfen tüm zorunlu alanları doldurun!', severity: 'error' });
      return;
    }

    const newDocument: Document = {
      id: Date.now().toString(),
      ...documentForm,
      uploadDate: new Date().toISOString().split('T')[0],
      hasPDF: false
    };

    const updatedDocs = [...documents, newDocument];
    setDocuments(updatedDocs);
    
    try {
      localStorage.setItem('dm-documents', JSON.stringify(updatedDocs));
      setSnackbar({ open: true, message: 'Belge başarıyla kaydedildi!', severity: 'success' });
      setCreateDialog(false);
    } catch (error) {
      console.error('❌ Belge kaydetme hatası:', error);
      setSnackbar({ open: true, message: 'Belge kaydetme hatası!', severity: 'error' });
    }
  };

  // ✅ KAYNAKÇI KAYDETME
  const handleSaveWelder = () => {
    if (!welderForm.name || !welderForm.registrationNo) {
      setSnackbar({ open: true, message: 'Lütfen tüm zorunlu alanları doldurun!', severity: 'error' });
      return;
    }

    const newWelder: WelderData = {
      id: Date.now().toString(),
      ...welderForm
    };

    const updatedWelders = [...welders, newWelder];
    setWelders(updatedWelders);
    
    try {
      localStorage.setItem('dm-welders', JSON.stringify(updatedWelders));
      setSnackbar({ open: true, message: 'Kaynakçı başarıyla kaydedildi!', severity: 'success' });
      setCreateDialog(false);
    } catch (error) {
      console.error('❌ Kaynakçı kaydetme hatası:', error);
      setSnackbar({ open: true, message: 'Kaynakçı kaydetme hatası!', severity: 'error' });
    }
  };

  // ✅ PERSONEL KAYDETME
  const handleSavePersonnel = () => {
    if (!personnelForm.name || !personnelForm.registrationNo) {
      setSnackbar({ open: true, message: 'Lütfen tüm zorunlu alanları doldurun!', severity: 'error' });
      return;
    }

    const newPersonnel: PersonnelData = {
      id: Date.now().toString(),
      ...personnelForm
    };

    const updatedPersonnel = [...personnel, newPersonnel];
    setPersonnel(updatedPersonnel);
    
    try {
      localStorage.setItem('dm-personnel', JSON.stringify(updatedPersonnel));
      setSnackbar({ open: true, message: 'Personel başarıyla kaydedildi!', severity: 'success' });
      setCreateDialog(false);
    } catch (error) {
      console.error('❌ Personel kaydetme hatası:', error);
      setSnackbar({ open: true, message: 'Personel kaydetme hatası!', severity: 'error' });
    }
  };

  // ✅ DÜZENLEME
  const handleEdit = (item: any, type: 'document' | 'welder' | 'personnel') => {
    setCurrentType(type);
    setEditingItem(item);
    
    if (type === 'document') {
      setDocumentForm(item);
    } else if (type === 'welder') {
      setWelderForm(item);
    } else {
      setPersonnelForm(item);
    }
    
    setEditDialog(true);
  };

  // ✅ GÜNCELLEME
  const handleUpdate = async () => {
    if (currentType === 'document') {
      if (!documentForm.name || !documentForm.type || !documentForm.number || !documentForm.unit) {
        setSnackbar({ open: true, message: 'Lütfen tüm zorunlu alanları doldurun!', severity: 'error' });
        return;
      }

      const updatedDocs = documents.map(doc => 
        doc.id === editingItem.id 
          ? { ...doc, ...documentForm }
          : doc
      );
      setDocuments(updatedDocs);
      
      try {
        localStorage.setItem('dm-documents', JSON.stringify(updatedDocs));
        setSnackbar({ open: true, message: 'Belge başarıyla güncellendi!', severity: 'success' });
        setEditDialog(false);
      } catch (error) {
        console.error('❌ Belge güncelleme hatası:', error);
        setSnackbar({ open: true, message: 'Belge güncelleme hatası!', severity: 'error' });
      }
    } else if (currentType === 'welder') {
      if (!welderForm.name || !welderForm.registrationNo) {
        setSnackbar({ open: true, message: 'Lütfen tüm zorunlu alanları doldurun!', severity: 'error' });
        return;
      }

      const updatedWelders = welders.map(welder => 
        welder.id === editingItem.id 
          ? { ...welder, ...welderForm }
          : welder
      );
      setWelders(updatedWelders);
      
      try {
        localStorage.setItem('dm-welders', JSON.stringify(updatedWelders));
        setSnackbar({ open: true, message: 'Kaynakçı başarıyla güncellendi!', severity: 'success' });
        setEditDialog(false);
      } catch (error) {
        console.error('❌ Kaynakçı güncelleme hatası:', error);
        setSnackbar({ open: true, message: 'Kaynakçı güncelleme hatası!', severity: 'error' });
      }
    } else {
      if (!personnelForm.name || !personnelForm.registrationNo) {
        setSnackbar({ open: true, message: 'Lütfen tüm zorunlu alanları doldurun!', severity: 'error' });
        return;
      }

      const updatedPersonnel = personnel.map(p => 
        p.id === editingItem.id 
          ? { ...p, ...personnelForm }
          : p
      );
      setPersonnel(updatedPersonnel);
      
      try {
        localStorage.setItem('dm-personnel', JSON.stringify(updatedPersonnel));
        setSnackbar({ open: true, message: 'Personel başarıyla güncellendi!', severity: 'success' });
        setEditDialog(false);
      } catch (error) {
        console.error('❌ Personel güncelleme hatası:', error);
        setSnackbar({ open: true, message: 'Personel güncelleme hatası!', severity: 'error' });
      }
    }
  };

  // ✅ SİLME
  const handleDelete = async (id: string, type: 'document' | 'welder' | 'personnel') => {
    if (window.confirm('Bu kaydı silmek istiyor musunuz?')) {
      if (type === 'document') {
        const doc = documents.find(d => d.id === id);
        if (doc && doc.hasPDF) {
          try {
            await pdfStorage.deletePDF(id);
            updateStorageInfo();
          } catch (error) {
            console.error('❌ PDF silme hatası:', error);
          }
        }
        
        const updatedDocs = documents.filter(d => d.id !== id);
        setDocuments(updatedDocs);
        
        try {
          localStorage.setItem('dm-documents', JSON.stringify(updatedDocs));
          setSnackbar({ open: true, message: 'Belge başarıyla silindi!', severity: 'success' });
        } catch (error) {
          console.error('❌ Belge silme hatası:', error);
        }
      } else if (type === 'welder') {
        const updatedWelders = welders.filter(w => w.id !== id);
        setWelders(updatedWelders);
        
        try {
          localStorage.setItem('dm-welders', JSON.stringify(updatedWelders));
          setSnackbar({ open: true, message: 'Kaynakçı başarıyla silindi!', severity: 'success' });
        } catch (error) {
          console.error('❌ Kaynakçı silme hatası:', error);
        }
      } else {
        const updatedPersonnel = personnel.filter(p => p.id !== id);
        setPersonnel(updatedPersonnel);
        
        try {
          localStorage.setItem('dm-personnel', JSON.stringify(updatedPersonnel));
          setSnackbar({ open: true, message: 'Personel başarıyla silindi!', severity: 'success' });
        } catch (error) {
          console.error('❌ Personel silme hatası:', error);
        }
      }
    }
  };

  // ✅ FİLTRELEME
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.welderName && doc.welderName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (doc.personnelName && doc.personnelName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (doc.certificateNumber && doc.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (doc.issuingAuthority && doc.issuingAuthority.toLowerCase().includes(searchTerm.toLowerCase())) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const qualityCertificates = filteredDocuments.filter(doc => {
    const docCategory = ALL_DOCUMENT_TYPES.find(dt => dt.type === doc.type)?.category;
    return docCategory && QUALITY_CERTIFICATE_CATEGORIES.includes(docCategory);
  });

  const otherDocuments = filteredDocuments.filter(doc => {
    const docCategory = ALL_DOCUMENT_TYPES.find(dt => dt.type === doc.type)?.category;
    return !docCategory || !QUALITY_CERTIFICATE_CATEGORIES.includes(docCategory);
  });

  const filteredWelders = welders.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.registrationNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPersonnel = personnel.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.registrationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Başlık ve Ana Buttonlar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600} color="primary">
          Doküman Yönetimi
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openCreateDialog('document')}
            sx={{ bgcolor: 'primary.main' }}
            >
            Yeni Belge
            </Button>
          <Button
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={() => openCreateDialog('welder')}
          >
            Yeni Kaynakçı
          </Button>
          <Button
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={() => openCreateDialog('personnel')}
          >
            Yeni Personel
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={checkDataStatus}
            sx={{ ml: 1, color: 'text.secondary' }}
          >
            Veri Durumu
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={clearAllPDFs}
            sx={{ ml: 1, color: 'warning.main', borderColor: 'warning.main', '&:hover': { borderColor: 'warning.dark' } }}
          >
            PDF'leri Temizle
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={clearAllData}
            sx={{ ml: 1, color: 'error.main', borderColor: 'error.main', '&:hover': { borderColor: 'error.dark' } }}
          >
            Tüm Verileri Temizle
          </Button>
                </Box>
                </Box>

      {/* İstatistikler */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
                <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DescriptionIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {documents.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                    Toplam Belge
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
                <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonIcon color="success" sx={{ fontSize: 40 }} />
                    <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {welders.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                    Kaynakçı
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
                <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <VerifiedUserIcon color="warning" sx={{ fontSize: 40 }} />
                    <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {personnel.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                    Personel
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
                <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                    <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {documents.filter(d => d.status === 'active').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                    Aktif Belge
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Arama */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
                  <TextField
                    fullWidth
            label="Arama"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Belge adı, tipi, sertifika numarası, kaynakçı veya personel adına göre arayın..."
                    InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} sx={{ mb: 3 }}>
        <Tab label="Belgeler" icon={<DescriptionIcon />} iconPosition="start" />
        <Tab label="Kaynakçılar" icon={<PersonIcon />} iconPosition="start" />
        <Tab label="Personel" icon={<VerifiedUserIcon />} iconPosition="start" />
      </Tabs>

      {/* Belgeler Tabı */}
      {tabIndex === 0 && (
        <Box>
          {/* Kalite Sertifikaları - Kart Görünümü */}
          {qualityCertificates.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedUserIcon color="primary" />
                  Kalite Sertifikaları ({qualityCertificates.length})
                </Typography>
                <Grid container spacing={2}>
                  {qualityCertificates.map((doc) => {
                    const docCategory = ALL_DOCUMENT_TYPES.find(dt => dt.type === doc.type)?.category;
                    const getCategoryColor = (category: string) => {
                      switch(category) {
                        case 'Kalite Sistem Belgeleri': return 'primary';
                        case 'Kaynakçı Belgeleri': return 'success';
                        case 'NDT Personel Belgeleri': return 'warning';
                        case 'İSG ve Güvenlik Belgeleri': return 'error';
                        case 'Mesleki Yeterlilik Belgeleri': return 'info';
                        default: return 'default';
                      }
                    };
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={doc.id}>
                        <Card 
                    sx={{
                            height: '100%', 
                            border: '1px solid #e0e0e0',
                      '&:hover': {
                              boxShadow: 6,
                              transform: 'translateY(-2px)',
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Chip
                                label={docCategory || 'Diğer'} 
                                color={getCategoryColor(docCategory || '')} 
                                size="small"
                              />
                              <Chip
                                label={doc.status === 'active' ? 'Aktif' : 'Pasif'} 
                                color={doc.status === 'active' ? 'success' : 'default'} 
                                size="small"
                              />
                            </Box>
                            
                            <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
                              {doc.name}
                      </Typography>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {doc.type}
                      </Typography>
                            
                            <Box sx={{ mt: 2, mb: 2 }}>
                              <Typography variant="caption" display="block" color="text.secondary">
                                <strong>Belge No:</strong> {doc.number}
                      </Typography>
                              {doc.welderName && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  <strong>Kaynakçı:</strong> {doc.welderName}
                      </Typography>
                              )}
                              {doc.personnelName && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  <strong>Personel:</strong> {doc.personnelName}
                      </Typography>
                              )}
                              {doc.certificateNumber && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  <strong>Sertifika No:</strong> {doc.certificateNumber}
                      </Typography>
                              )}
                              {doc.issuingAuthority && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  <strong>Veren Kuruluş:</strong> {doc.issuingAuthority}
                </Typography>
                              )}
                              <Typography variant="caption" display="block" color="text.secondary">
                                <strong>Yürürlük:</strong> {doc.effectiveDate}
                          </Typography>
                              {doc.expiryDate && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  <strong>Son Geçerlilik:</strong> {doc.expiryDate}
                          </Typography>
                              )}
                              {doc.expiryDate && (
                                <Box sx={{ mt: 1 }}>
                                  <Chip 
                                    label={getDaysRemainingStatus(calculateDaysRemaining(doc.expiryDate)).text}
                                    color={getDaysRemainingStatus(calculateDaysRemaining(doc.expiryDate)).color}
                          size="small"
                                    variant="outlined"
                        />
                      </Box>
                              )}
                        </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {doc.hasPDF && (
                                  <>
                                    <Chip 
                                      label="PDF" 
                              size="small"
                                      color="success" 
                                      icon={<DescriptionIcon />}
                                    />
                                    <IconButton 
                                      onClick={() => handleViewPDF(doc)} 
                                      size="small" 
                                      color="info"
                                      title="PDF Görüntüle"
                                    >
                                      <ViewIcon />
                                    </IconButton>
                                  </>
                                )}
                                <IconButton onClick={() => handleEdit(doc, 'document')} size="small" color="primary">
                                  <EditIcon />
                            </IconButton>
                                <IconButton onClick={() => handleDelete(doc.id, 'document')} size="small" color="error">
                                  <DeleteIcon />
                            </IconButton>
                        </Box>
                              <Button 
                          size="small"
                                startIcon={<ViewIcon />}
                                onClick={() => handleViewDocument(doc)}
                              >
                                Görüntüle
                              </Button>
                      </Box>
                          </CardContent>
                    </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
                    </Card>
          )}

          {/* Diğer Belgeler - Liste Görünümü */}
          {otherDocuments.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon color="secondary" />
                  Diğer Belgeler ({otherDocuments.length})
            </Typography>
                <TableContainer>
                  <Table>
                          <TableHead>
                            <TableRow>
                        <TableCell>Belge Adı</TableCell>
                        <TableCell>Tip</TableCell>
                        <TableCell>Numara</TableCell>
                        <TableCell>PDF</TableCell>
                        <TableCell>Durum</TableCell>
                        <TableCell>Tarih</TableCell>
                        <TableCell>İşlemler</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                      {otherDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>{doc.name}</TableCell>
                                <TableCell>
                            <Chip label={doc.type} size="small" />
                                </TableCell>
                          <TableCell>{doc.number}</TableCell>
                                <TableCell>
                            {doc.hasPDF ? (
                              <Chip 
                                label="Yüklendi" 
                                size="small" 
                                color="success" 
                                icon={<CheckCircleIcon />}
                              />
                            ) : (
                              <Chip 
                                label="Yok" 
                                size="small" 
                                color="default"
                              />
                            )}
                                </TableCell>
                                <TableCell>
                                  <Chip 
                              label={doc.status === 'active' ? 'Aktif' : 'Pasif'} 
                              color={doc.status === 'active' ? 'success' : 'default'} 
                                    size="small" 
                                  />
                                </TableCell>
                          <TableCell>{doc.effectiveDate}</TableCell>
                          <TableCell>
                            {doc.hasPDF && (
                              <IconButton 
                                onClick={() => handleViewPDF(doc)} 
                                size="small" 
                                color="info"
                                title="PDF Görüntüle"
                              >
                                <ViewIcon />
                              </IconButton>
                            )}
                            <IconButton onClick={() => handleViewDocument(doc)} size="small" color="secondary" title="Belge Detayları">
                              <DescriptionIcon />
                                      </IconButton>
                            <IconButton onClick={() => handleEdit(doc, 'document')} size="small" title="Düzenle">
                              <EditIcon />
                                      </IconButton>
                            <IconButton onClick={() => handleDelete(doc.id, 'document')} size="small" color="error" title="Sil">
                              <DeleteIcon />
                                      </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Hiç belge yoksa */}
          {filteredDocuments.length === 0 && (
            <Card>
              <CardContent>
                <Alert severity="info">
                  Henüz belge eklenmemiş. "Yeni Belge" butonunu kullanarak belge ekleyebilirsiniz.
                </Alert>
              </CardContent>
            </Card>
          )}
                  </Box>
      )}

      {/* Kaynakçılar Tabı */}
      {tabIndex === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Kaynakçılar ({filteredWelders.length})
            </Typography>
            {filteredWelders.length === 0 ? (
              <Alert severity="info">
                Henüz kaynakçı eklenmemiş. "Yeni Kaynakçı" butonunu kullanarak kaynakçı ekleyebilirsiniz.
              </Alert>
            ) : (
              <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                      <TableCell>Ad Soyad</TableCell>
                      <TableCell>Sicil No</TableCell>
                      <TableCell>Departman</TableCell>
                      <TableCell>Pozisyon</TableCell>
                      <TableCell>İşlemler</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                    {filteredWelders.map((welder) => (
                      <TableRow key={welder.id}>
                        <TableCell>{welder.name}</TableCell>
                        <TableCell>{welder.registrationNo}</TableCell>
                        <TableCell>{welder.department}</TableCell>
                        <TableCell>{welder.position}</TableCell>
                              <TableCell>
                          <IconButton onClick={() => handleEdit(welder, 'welder')} size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(welder.id, 'welder')} size="small">
                            <DeleteIcon />
                          </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Personel Tabı */}
      {tabIndex === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Personel ({filteredPersonnel.length})
                    </Typography>
            {filteredPersonnel.length === 0 ? (
              <Alert severity="info">
                Henüz personel eklenmemiş. "Yeni Personel" butonunu kullanarak personel ekleyebilirsiniz.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                        <TableHead>
                          <TableRow>
                      <TableCell>Ad Soyad</TableCell>
                      <TableCell>Sicil No</TableCell>
                      <TableCell>Departman</TableCell>
                      <TableCell>Pozisyon</TableCell>
                      <TableCell>İşlemler</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                    {filteredPersonnel.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell>{person.name}</TableCell>
                        <TableCell>{person.registrationNo}</TableCell>
                        <TableCell>{person.department}</TableCell>
                        <TableCell>{person.position}</TableCell>
                              <TableCell>
                          <IconButton onClick={() => handleEdit(person, 'personnel')} size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(person.id, 'personnel')} size="small">
                            <DeleteIcon />
                          </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
            )}
                </CardContent>
        </Card>
      )}

      {/* Dialog - Belge Formu */}
      <Dialog open={createDialog && currentType === 'document'} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Belge Düzenle' : 'Yeni Belge Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
          fullWidth
                options={ALL_DOCUMENT_TYPES}
                groupBy={(option) => option.category}
                getOptionLabel={(option) => option.type}
                value={ALL_DOCUMENT_TYPES.find(item => item.type === documentForm.type) || null}
                onChange={(event, newValue) => {
                  setDocumentForm(prev => ({ ...prev, type: newValue?.type || '' }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Belge Tipi"
                    required
                    placeholder="Belge tipi arayın veya seçin..."
                  />
                )}
                renderGroup={(params) => (
                  <Box key={params.key}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        px: 2,
                        py: 1,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      {params.group}
                </Typography>
                    {params.children}
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                required
                label="Belge Adı"
                value={documentForm.name}
                    onChange={(e) => setDocumentForm(prev => ({ ...prev, name: e.target.value }))}
                  />
            </Grid>
            <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                label="Belge Numarası"
                value={documentForm.number}
                    onChange={(e) => setDocumentForm(prev => ({ ...prev, number: e.target.value }))}
                placeholder="Otomatik oluşturulacak"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Birim</InputLabel>
                    <Select
                  value={documentForm.unit}
                      onChange={(e) => setDocumentForm(prev => ({ ...prev, unit: e.target.value }))}
                  label="Birim"
                    >
                  {UNITS.map((unit) => (
                        <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
            </Grid>

            {/* Kaynakçı Sertifikaları için özel alanlar */}
            {DOCUMENT_TYPES['Kaynakçı Belgeleri'] && DOCUMENT_TYPES['Kaynakçı Belgeleri'].includes(documentForm.type) && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                            <InputLabel>Kaynakçı Seçimi</InputLabel>
                            <Select
                      value={documentForm.welderName}
                      onChange={(e) => setDocumentForm(prev => ({ ...prev, welderName: e.target.value }))}
                              label="Kaynakçı Seçimi"
                            >
                      {welders.length === 0 && (
                        <MenuItem disabled value="">Önce kaynakçı ekleyin</MenuItem>
                      )}
                      {welders.map((welder) => (
                        <MenuItem key={welder.id} value={welder.name}>
                          {welder.name} - {welder.registrationNo}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Sertifika Numarası"
                    value={documentForm.certificateNumber}
                            onChange={(e) => setDocumentForm(prev => ({ ...prev, certificateNumber: e.target.value }))}
                  />
                </Grid>
                        </>
                      )}
                      
            {/* Personel belgeleri için özel alanlar */}
            {(DOCUMENT_TYPES['NDT Personel Belgeleri']?.includes(documentForm.type) ||
              DOCUMENT_TYPES['İSG ve Güvenlik Belgeleri']?.includes(documentForm.type) ||
              DOCUMENT_TYPES['Mesleki Yeterlilik Belgeleri']?.includes(documentForm.type) ||
              DOCUMENT_TYPES['Eğitim ve Gelişim Belgeleri']?.includes(documentForm.type)) && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                            <InputLabel>Personel Seçimi</InputLabel>
                            <Select
                      value={documentForm.personnelName}
                      onChange={(e) => setDocumentForm(prev => ({ ...prev, personnelName: e.target.value }))}
                              label="Personel Seçimi"
                            >
                      {personnel.length === 0 && (
                        <MenuItem disabled value="">Önce personel ekleyin</MenuItem>
                      )}
                      {personnel.map((person) => (
                        <MenuItem key={person.id} value={person.name}>
                          {person.name} - {person.registrationNo}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Sertifika Numarası"
                    value={documentForm.certificateNumber}
                            onChange={(e) => setDocumentForm(prev => ({ ...prev, certificateNumber: e.target.value }))}
                  />
                </Grid>
                        </>
                      )}
                      
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Veren Kuruluş</InputLabel>
                            <Select
                  value={documentForm.issuingAuthority}
                              onChange={(e) => {
                                setDocumentForm(prev => ({ 
                                  ...prev, 
                      issuingAuthority: e.target.value,
                      customIssuingAuthority: e.target.value === 'Diğer Kuruluş' ? prev.customIssuingAuthority : ''
                                }));
                              }}
                  label="Veren Kuruluş"
                >
                  {ISSUING_AUTHORITIES.map((authority) => (
                    <MenuItem key={authority} value={authority}>{authority}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
            </Grid>
            
            {/* Manuel Veren Kuruluş Girişi */}
            {documentForm.issuingAuthority === 'Diğer Kuruluş' && (
              <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                  required
                  label="Veren Kuruluş Adı"
                  value={documentForm.customIssuingAuthority}
                  onChange={(e) => setDocumentForm(prev => ({ ...prev, customIssuingAuthority: e.target.value }))}
                  placeholder="Veren kuruluş adını girin..."
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                type="date"
                label="Yürürlük Tarihi"
                value={documentForm.effectiveDate}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                type="date"
                label="Son Geçerlilik Tarihi"
                value={documentForm.expiryDate}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
                          <TextField
                            fullWidth
                multiline
                rows={3}
                label="Açıklama"
                value={documentForm.description}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Belge hakkında açıklama..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>İptal</Button>
          <Button onClick={handleSaveDocument} variant="contained">
            {editingItem ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog - Kaynakçı Formu */}
      <Dialog open={createDialog && currentType === 'welder'} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Kaynakçı Düzenle' : 'Yeni Kaynakçı Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
                          <TextField
                            fullWidth
                required
                label="Ad Soyad"
                value={welderForm.name}
                onChange={(e) => setWelderForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Sicil Numarası"
                value={welderForm.registrationNo}
                onChange={(e) => setWelderForm(prev => ({ ...prev, registrationNo: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                <InputLabel>Departman</InputLabel>
                            <Select
                  value={welderForm.department}
                  onChange={(e) => setWelderForm(prev => ({ ...prev, department: e.target.value }))}
                  label="Departman"
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                label="Pozisyon"
                value={welderForm.position}
                onChange={(e) => setWelderForm(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Kaynakçı, Operatör, Teknisyen..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>İptal</Button>
          <Button onClick={handleSaveWelder} variant="contained">
            {editingItem ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog - Personel Formu */}
      <Dialog open={createDialog && currentType === 'personnel'} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
                          <TextField
                            fullWidth
                required
                label="Ad Soyad"
                value={personnelForm.name}
                onChange={(e) => setPersonnelForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                required
                label="Sicil Numarası"
                value={personnelForm.registrationNo}
                onChange={(e) => setPersonnelForm(prev => ({ ...prev, registrationNo: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                <InputLabel>Departman</InputLabel>
                            <Select
                  value={personnelForm.department}
                  onChange={(e) => setPersonnelForm(prev => ({ ...prev, department: e.target.value }))}
                  label="Departman"
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                            </Select>
                          </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                label="Pozisyon"
                value={personnelForm.position}
                onChange={(e) => setPersonnelForm(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Kalite Teknisyeni, NDT Uzmanı, Kaynakçı, İSG Uzmanı, Proje Yöneticisi..."
              />
            </Grid>
          </Grid>
          </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>İptal</Button>
          <Button onClick={handleSavePersonnel} variant="contained">
            {editingItem ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogActions>
        </Dialog>

      {/* Modal - Belge Görüntüleme */}
        <Dialog
        open={viewModal} 
        onClose={() => setViewModal(false)} 
          maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {viewingDocument?.name}
                    </Typography>
          <IconButton onClick={() => setViewModal(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {viewingDocument && (
                      <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Belge Tipi:</strong> {viewingDocument.type}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Belge Numarası:</strong> {viewingDocument.number}
                      </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Birim:</strong> {viewingDocument.unit}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Durum:</strong> {viewingDocument.status === 'active' ? 'Aktif' : 'Pasif'}
                  </Typography>
                </Grid>
                {viewingDocument.welderName && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Kaynakçı:</strong> {viewingDocument.welderName}
                    </Typography>
                  </Grid>
                )}
                {viewingDocument.personnelName && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Personel:</strong> {viewingDocument.personnelName}
                      </Typography>
                  </Grid>
                )}
                {viewingDocument.certificateNumber && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Sertifika No:</strong> {viewingDocument.certificateNumber}
                    </Typography>
                  </Grid>
                )}
                {viewingDocument.issuingAuthority && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Veren Kuruluş:</strong> {viewingDocument.issuingAuthority}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Yürürlük Tarihi:</strong> {viewingDocument.effectiveDate}
                    </Typography>
                </Grid>
                {viewingDocument.expiryDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Son Geçerlilik:</strong> {viewingDocument.expiryDate}
                        </Typography>
                  </Grid>
                )}
                {viewingDocument.expiryDate && (
                  <Grid item xs={12}>
                    <Box sx={{ mt: 1 }}>
                        <Chip
                        label={getDaysRemainingStatus(calculateDaysRemaining(viewingDocument.expiryDate)).text}
                        color={getDaysRemainingStatus(calculateDaysRemaining(viewingDocument.expiryDate)).color}
                          size="small"
                        />
                      </Box>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Açıklama:</strong> {viewingDocument.description}
                    </Typography>
                </Grid>
                
                {/* PDF Yükleme Bölümü */}
                <Grid item xs={12}>
                  <Box sx={{ mt: 3, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      PDF Dosyası
                    </Typography>
                    
                    {viewingDocument.hasPDF ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <DescriptionIcon color="error" />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {viewingDocument.pdfFileName}
                      </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {viewingDocument.pdfSize && formatFileSize(viewingDocument.pdfSize)}
                    </Typography>
                      </Box>
                <Button 
                          variant="outlined"
                          size="small"
                  startIcon={<ViewIcon />} 
                          onClick={() => handleViewPDF(viewingDocument)}
                >
                  Görüntüle
                </Button>
                <Button 
                          variant="outlined"
                          size="small"
                  startIcon={<DownloadIcon />} 
                          onClick={() => handleDownloadPDF(viewingDocument)}
                >
                  İndir
                </Button>
                <Button 
                          variant="outlined"
                          size="small"
                          color="error"
                  startIcon={<DeleteIcon />} 
                          onClick={() => handleRemovePDF(viewingDocument)}
                >
                  PDF Sil
                </Button>
                        <input
                          accept="application/pdf"
                          style={{ display: 'none' }}
                          id={`upload-button-${viewingDocument.id}`}
                          type="file"
                          onChange={(e) => handleFileUpload(e, viewingDocument.id)}
                        />
                        <label htmlFor={`upload-button-${viewingDocument.id}`}>
                          <Button variant="outlined" size="small" component="span" disabled={uploadingFile}>
                            {uploadingFile ? `Yükleniyor ${uploadProgress}%` : 'Değiştir'}
                          </Button>
                        </label>
                        {uploadingFile && (
                          <Box sx={{ width: '100%', mt: 1 }}>
                            <LinearProgress variant="determinate" value={uploadProgress} />
                          </Box>
                        )}
                </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Henüz PDF dosyası yüklenmemiş
                        </Typography>
                        <input
                          accept="application/pdf"
                          style={{ display: 'none' }}
                          id={`upload-button-${viewingDocument.id}`}
                          type="file"
                          onChange={(e) => handleFileUpload(e, viewingDocument.id)}
                        />
                        <label htmlFor={`upload-button-${viewingDocument.id}`}>
            <Button 
              variant="contained" 
                            component="span" 
              startIcon={<AddIcon />}
                            disabled={uploadingFile}
            >
                            {uploadingFile ? `PDF Yükleniyor ${uploadProgress}%` : 'PDF Yükle'}
            </Button>
                        </label>
                        {uploadingFile && (
                          <Box sx={{ width: '100%', mt: 2 }}>
                            <LinearProgress variant="determinate" value={uploadProgress} />
                          </Box>
                        )}
          </Box>
                    )}
          </Box>
                </Grid>
              </Grid>
          </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModal(false)}>Kapat</Button>
          <Button 
            onClick={() => handleEdit(viewingDocument, 'document')} 
            variant="contained" 
            startIcon={<EditIcon />}
          >
            Düzenle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
};

export default DocumentManagement; 