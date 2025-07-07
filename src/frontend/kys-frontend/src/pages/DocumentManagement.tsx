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

// ✅ SADECE GEREKLİ INTERFACES - Karmaşıklık kaldırıldı
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
  pdfFile?: string;  // Base64 encoded PDF file
  pdfFileName?: string;
  pdfSize?: number;
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
  'Eğitim ve Gelişim Belgeleri': [
    'Mesleki Gelişim Eğitimi Sertifikası',
    'Teknik Eğitim Sertifikası',
    'Liderlik Eğitimi Sertifikası',
    'Proje Yönetimi Eğitimi (PMP)',
    'Lean Six Sigma Eğitimi',
    'Kaizen Eğitimi Sertifikası',
    '5S Eğitimi Sertifikası',
    'İstatistiksel Proses Kontrol Eğitimi',
    'Müşteri Memnuniyeti Eğitimi',
    'Tedarikçi Geliştirme Eğitimi',
    'Bilgisayar Destekli Tasarım (CAD) Eğitimi',
    'Bilgisayar Destekli İmalat (CAM) Eğitimi'
  ],
  'Diğer Belgeler': [
    'Müşteri Onay Belgesi',
    'Tedarikçi Onay Belgesi',
    'Ürün Onay Belgesi',
    'Prototip Onay Belgesi',
    'Değişiklik Onay Belgesi',
    'Sapma Onay Belgesi',
    'Özel Durum Onay Belgesi',
    'Konfidansiyel Belge',
    'Gizlilik Sözleşmesi',
    'Kalite Sözleşmesi'
  ]
};

// ✅ DETAYLANDIRILMIŞ DEPARTMANLAR
const DEPARTMENTS = [
  'Kaynak Atölyesi', 
  'Kalite Kontrol',
  'Kalite Güvence',
  'Üretim',
  'Montaj',
  'Makine İmalat',
  'Sac İşleri',
  'Boyahane',
  'Paketleme',
  'Sevkiyat',
  'Satın Alma',
  'Teknik Büro',
  'Ar-Ge',
  'Proje Yönetimi',
  'İnsan Kaynakları',
  'İSG',
  'Çevre',
  'Bilgi İşlem',
  'Muhasebe',
  'Genel Müdürlük'
];

// ✅ DETAYLANDIRILMIŞ SERTİFİKA TİPLERİ
const CERTIFICATE_TYPES = [
    'EN ISO 9606-1 (Çelik Kaynak)',
    'EN ISO 9606-2 (Alüminyum Kaynak)',
  'EN ISO 9606-3 (Bakır Kaynak)',
  'EN ISO 9606-4 (Nikel Kaynak)',
  'EN ISO 14732 (Personel Kaynak)',
  'ASME IX (Kaynakçı Nitelik)',
  'AWS D1.1 (Yapısal Kaynak)',
  'EN 287-1 (Kaynak Operatörü)',
  'API 1104 (Boru Hattı Kaynak)',
  'DNV GL (Offshore Kaynak)',
  'EN ISO 9712 Level 1 (NDT)',
  'EN ISO 9712 Level 2 (NDT)',
  'EN ISO 9712 Level 3 (NDT)',
  'ASNT SNT-TC-1A (NDT)',
  'PCN (Personnel Certification)',
  'MYB Seviye 4 (Mesleki Yeterlilik)',
  'MYB Seviye 5 (Mesleki Yeterlilik)',
  'MYB Seviye 6 (Mesleki Yeterlilik)'
];

// ✅ DETAYLANDIRILMIŞ VEREN KURULUŞLAR
const ISSUING_AUTHORITIES = [
  'TSE (Türk Standartları Enstitüsü)',
  'TÜV NORD Türkiye',
  'TÜV SÜD Türkiye',
  'TÜV AUSTRIA Türkiye',
  'TÜV RHEINLAND Türkiye',
  'Bureau Veritas Türkiye',
  'SGS Türkiye',
  'DEKRA Türkiye',
  'RINA Türkiye',
  'DNV GL Türkiye',
  'Lloyd\'s Register Türkiye',
  'Intertek Türkiye',
  'Çalışma ve Sosyal Güvenlik Bakanlığı',
  'Aile ve Sosyal Hizmetler Bakanlığı',
  'Mesleki Yeterlilik Kurumu (MYK)',
  'Türkiye İnsan Kaynakları Geliştirme Vakfı',
  'MESS (Türkiye Metal Sanayicileri Sendikası)',
  'İSKİ (İstanbul Su ve Kanalizasyon İdaresi)',
  'Kızılay Eğitim Merkezi',
  'AFAD (Afet ve Acil Durum Yönetimi)',
  'İMO (İnşaat Mühendisleri Odası)',
  'MMO (Makine Mühendisleri Odası)',
  'TMMOB (Türk Mühendis ve Mimar Odaları Birliği)',
  'KGM (Karayolları Genel Müdürlüğü)',
  'TCDD (Türkiye Cumhuriyeti Devlet Demiryolları)',
  'Diğer Kuruluş'
];

// ✅ BİRİM SEÇENEKLERİ
const UNIT_OPTIONS = [
  'Kalite Güvence',
  'Kalite Kontrol',
  'Üretim',
  'Ar-Ge',
  'İSG',
  'Satın Alma',
  'Proje Yönetimi',
  'Bakım',
  'Planlama',
  'İnsan Kaynakları',
  'Muhasebe',
  'Genel Müdürlük',
  'Diğer'
];

// ✅ AUTOCOMPLETE İÇİN DÜZLEŞTIRILMIŞ BELGE TİPLERİ
const ALL_DOCUMENT_TYPES = Object.entries(DOCUMENT_TYPES).reduce((acc, [category, types]) => {
  types.forEach(type => {
    acc.push({
      category,
      type,
      label: type,
      group: category
    });
  });
  return acc;
}, [] as Array<{category: string, type: string, label: string, group: string}>);

const DocumentManagement: React.FC = () => {
  // ✅ BASİT STATE YÖNETİMİ - Karmaşıklık kaldırıldı
  const [activeTab, setActiveTab] = useState(0);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [welders, setWelders] = useState<WelderData[]>([]);
  const [personnel, setPersonnel] = useState<PersonnelData[]>([]);
  
  // Form states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'document' | 'welder' | 'personnel'>('document');
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form data
  const [documentForm, setDocumentForm] = useState({
    type: '',
    name: '',
    number: '',
    unit: '',
    welderName: '',
    personnelName: '',
    certificateNumber: '',
    issuingAuthority: '',
    customIssuingAuthority: '', // Manuel veren kuruluş girişi için
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    description: ''
  });
  
  const [welderForm, setWelderForm] = useState({
    name: '',
    registrationNo: '',
    department: '',
    position: ''
  });
  
  const [personnelForm, setPersonnelForm] = useState({
    name: '',
    registrationNo: '',
    department: '',
    position: '',
  });
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  // Modal state
  const [viewModal, setViewModal] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // ✅ KALAN GÜN SAYISI HESAPLAMA
  const calculateDaysRemaining = (expiryDate: string): number => {
    if (!expiryDate) return -1;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // ✅ KALAN GÜN DURUMU VE RENK
  const getDaysRemainingStatus = (daysRemaining: number) => {
    if (daysRemaining < 0) return { text: 'Süresi Doldu', color: 'error' as const };
    if (daysRemaining === 0) return { text: 'Bugün Sona Eriyor', color: 'warning' as const };
    if (daysRemaining <= 7) return { text: `${daysRemaining} gün kaldı`, color: 'warning' as const };
    if (daysRemaining <= 30) return { text: `${daysRemaining} gün kaldı`, color: 'info' as const };
    return { text: `${daysRemaining} gün kaldı`, color: 'success' as const };
  };

  // ✅ PDF YÜKLEME VE İŞLEME FONKSİYONLARI
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, documentId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setSnackbar({ open: true, message: 'Sadece PDF dosyaları yüklenebilir!', severity: 'error' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setSnackbar({ open: true, message: 'Dosya boyutu 10MB\'dan küçük olmalıdır!', severity: 'error' });
      return;
    }

    setUploadingFile(true);
    const reader = new FileReader();
    
    reader.onload = () => {
      const base64 = reader.result as string;
      
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              pdfFile: base64,
              pdfFileName: file.name,
              pdfSize: file.size
            }
          : doc
      ));

      setSnackbar({ open: true, message: 'PDF başarıyla yüklendi!', severity: 'success' });
      setUploadingFile(false);
    };

    reader.onerror = () => {
      setSnackbar({ open: true, message: 'Dosya yükleme hatası!', severity: 'error' });
      setUploadingFile(false);
    };

    reader.readAsDataURL(file);
  };

  const handleViewDocument = (doc: Document) => {
    setViewingDocument(doc);
    setViewModal(true);
  };

  const handleDownloadPDF = (doc: Document) => {
    if (!doc.pdfFile) {
      setSnackbar({ open: true, message: 'PDF dosyası yüklenememiş!', severity: 'error' });
      return;
    }

    const link = document.createElement('a');
    link.href = doc.pdfFile;
    link.download = doc.pdfFileName || `${doc.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ✅ SADECE GERÇEK VERİ YÜKLEME - Mock veriler tamamen kaldırıldı
  React.useEffect(() => {
    // Documents yükle
    const savedDocs = localStorage.getItem('dm-documents');
    if (savedDocs) {
      try {
        const parsed = JSON.parse(savedDocs);
        if (Array.isArray(parsed)) setDocuments(parsed);
      } catch (error) {
        console.log('Documents yükleme hatası:', error);
      }
    }

    // Welders yükle
    const savedWelders = localStorage.getItem('dm-welders');
    if (savedWelders) {
      try {
        const parsed = JSON.parse(savedWelders);
        if (Array.isArray(parsed)) setWelders(parsed);
      } catch (error) {
        console.log('Welders yükleme hatası:', error);
      }
    }

    // Personnel yükle
    const savedPersonnel = localStorage.getItem('dm-personnel');
    if (savedPersonnel) {
      try {
        const parsed = JSON.parse(savedPersonnel);
        if (Array.isArray(parsed)) setPersonnel(parsed);
      } catch (error) {
        console.log('Personnel yükleme hatası:', error);
      }
    }
  }, []);

  // ✅ OTOMATIK KAYDETME
  React.useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem('dm-documents', JSON.stringify(documents));
    }
  }, [documents]);

  React.useEffect(() => {
    if (welders.length > 0) {
      localStorage.setItem('dm-welders', JSON.stringify(welders));
    }
  }, [welders]);

  React.useEffect(() => {
    if (personnel.length > 0) {
      localStorage.setItem('dm-personnel', JSON.stringify(personnel));
    }
  }, [personnel]);

  // ✅ BASİT FORMLAR AÇMA
  const openCreateDialog = (type: 'document' | 'welder' | 'personnel') => {
    setDialogType(type);
    setEditingItem(null);
    
    // Form temizle
    if (type === 'document') {
    setDocumentForm({
        type: '',
      name: '',
      number: '',
      unit: '',
        welderName: '',
        personnelName: '',
        certificateNumber: '',
        issuingAuthority: '',
        customIssuingAuthority: '',
      effectiveDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        description: ''
      });
    } else if (type === 'welder') {
      setWelderForm({
        name: '',
        registrationNo: '',
        department: '',
        position: ''
      });
    } else {
      setPersonnelForm({
        name: '',
        registrationNo: '',
        department: '',
        position: '',
      });
    }
    
      setOpenDialog(true);
  };

  // ✅ BASİT KAYDETME FONKSİYONLARI
  const handleSaveDocument = () => {
    if (!documentForm.name || !documentForm.type) {
      setSnackbar({ open: true, message: 'Lütfen belge adı ve tipi doldurun!', severity: 'error' });
      return;
    }

    const now = new Date().toISOString().split('T')[0];
    
    // Veren kuruluş bilgisini doğru şekilde al
    const finalIssuingAuthority = documentForm.issuingAuthority === 'Diğer Kuruluş' 
      ? documentForm.customIssuingAuthority 
      : documentForm.issuingAuthority;
    
    const newDoc: Document = {
      id: editingItem?.id || `DOC-${Date.now()}`,
      type: documentForm.type,
      name: documentForm.name,
      number: documentForm.number || `${documentForm.type.slice(0,3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
      unit: documentForm.unit || 'Kalite Güvence',
      welderName: documentForm.welderName,
      personnelName: documentForm.personnelName,
      certificateNumber: documentForm.certificateNumber,
      issuingAuthority: finalIssuingAuthority,
      effectiveDate: documentForm.effectiveDate,
      expiryDate: documentForm.expiryDate,
      status: 'active',
      uploadDate: now,
      description: documentForm.description || `${documentForm.name} belgesi`
    };

    if (editingItem) {
      setDocuments(prev => prev.map(doc => doc.id === editingItem.id ? newDoc : doc));
      setSnackbar({ open: true, message: `${newDoc.name} güncellendi!`, severity: 'success' });
    } else {
      setDocuments(prev => [...prev, newDoc]);
      setSnackbar({ open: true, message: `${newDoc.name} eklendi!`, severity: 'success' });
    }

    setOpenDialog(false);
  };

  const handleSaveWelder = () => {
    if (!welderForm.name || !welderForm.registrationNo) {
      setSnackbar({ open: true, message: 'Lütfen ad ve sicil numarası doldurun!', severity: 'error' });
      return;
    }

    const newWelder: WelderData = {
      id: editingItem?.id || `W-${Date.now()}`,
      name: welderForm.name,
      registrationNo: welderForm.registrationNo,
      department: welderForm.department,
      position: welderForm.position
    };

    if (editingItem) {
      setWelders(prev => prev.map(w => w.id === editingItem.id ? newWelder : w));
      setSnackbar({ open: true, message: `${newWelder.name} güncellendi!`, severity: 'success' });
    } else {
      setWelders(prev => [...prev, newWelder]);
      setSnackbar({ open: true, message: `${newWelder.name} eklendi!`, severity: 'success' });
    }

    setOpenDialog(false);
  };

  const handleSavePersonnel = () => {
    if (!personnelForm.name || !personnelForm.registrationNo) {
      setSnackbar({ open: true, message: 'Lütfen ad ve sicil numarası doldurun!', severity: 'error' });
      return;
    }

    const newPersonnel: PersonnelData = {
      id: editingItem?.id || `P-${Date.now()}`,
      name: personnelForm.name,
      registrationNo: personnelForm.registrationNo,
      department: personnelForm.department,
      position: personnelForm.position,
    };

    if (editingItem) {
      setPersonnel(prev => prev.map(p => p.id === editingItem.id ? newPersonnel : p));
      setSnackbar({ open: true, message: `${newPersonnel.name} güncellendi!`, severity: 'success' });
    } else {
      setPersonnel(prev => [...prev, newPersonnel]);
      setSnackbar({ open: true, message: `${newPersonnel.name} eklendi!`, severity: 'success' });
    }

    setOpenDialog(false);
  };

  // ✅ BASİT DÜZENLEME VE SİLME
  const handleEdit = (item: any, type: 'document' | 'welder' | 'personnel') => {
    setEditingItem(item);
    setDialogType(type);
    
    if (type === 'document') {
      setDocumentForm({
        type: item.type,
        name: item.name,
        number: item.number,
        unit: item.unit,
        welderName: item.welderName || '',
        personnelName: item.personnelName || '',
        certificateNumber: item.certificateNumber || '',
        issuingAuthority: item.issuingAuthority || '',
        customIssuingAuthority: '',
        effectiveDate: item.effectiveDate,
        expiryDate: item.expiryDate || '',
        description: item.description
      });
    } else if (type === 'welder') {
      setWelderForm({
        name: item.name,
        registrationNo: item.registrationNo,
        department: item.department,
        position: item.position
      });
    } else {
      setPersonnelForm({
        name: item.name,
        registrationNo: item.registrationNo,
        department: item.department,
        position: item.position,
      });
    }
    
    setOpenDialog(true);
  };

  const handleDelete = (id: string, type: 'document' | 'welder' | 'personnel') => {
    if (type === 'document') {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } else if (type === 'welder') {
      setWelders(prev => prev.filter(w => w.id !== id));
    } else {
      setPersonnel(prev => prev.filter(p => p.id !== id));
    }
    setSnackbar({ open: true, message: 'Başarıyla silindi!', severity: 'success' });
  };

  // ✅ KALİTE BELGELERİ AYIRMA
  const QUALITY_CERTIFICATE_CATEGORIES = [
    'Kalite Sistem Belgeleri',
    'Kaynakçı Belgeleri', 
    'NDT Personel Belgeleri',
    'İSG ve Güvenlik Belgeleri',
    'Mesleki Yeterlilik Belgeleri'
  ];

  // ✅ FİLTRELEME VE AYIRMA
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

  // Kalite sertifikalarını ve diğer belgeleri ayır
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
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Belgeler" icon={<DescriptionIcon />} iconPosition="start" />
        <Tab label="Kaynakçılar" icon={<PersonIcon />} iconPosition="start" />
        <Tab label="Personel" icon={<VerifiedUserIcon />} iconPosition="start" />
      </Tabs>

      {/* Belgeler Tabı */}
      {activeTab === 0 && (
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
                                {doc.pdfFile && (
                                  <Chip 
                                    label="PDF" 
                            size="small"
                                    color="success" 
                                    icon={<DescriptionIcon />}
                                  />
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
                            {doc.pdfFile ? (
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
                            <IconButton onClick={() => handleViewDocument(doc)} size="small" color="info">
                              <ViewIcon />
                                      </IconButton>
                            <IconButton onClick={() => handleEdit(doc, 'document')} size="small">
                              <EditIcon />
                                      </IconButton>
                            <IconButton onClick={() => handleDelete(doc.id, 'document')} size="small">
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
      {activeTab === 1 && (
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
      {activeTab === 2 && (
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
      <Dialog open={openDialog && dialogType === 'document'} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Belge Düzenle' : 'Yeni Belge Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
          fullWidth
                options={ALL_DOCUMENT_TYPES}
                groupBy={(option) => option.group}
                getOptionLabel={(option) => option.label}
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
                  {UNIT_OPTIONS.map((unit) => (
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
          <Button onClick={() => setOpenDialog(false)}>İptal</Button>
          <Button onClick={handleSaveDocument} variant="contained">
            {editingItem ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog - Kaynakçı Formu */}
      <Dialog open={openDialog && dialogType === 'welder'} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
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
          <Button onClick={() => setOpenDialog(false)}>İptal</Button>
          <Button onClick={handleSaveWelder} variant="contained">
            {editingItem ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog - Personel Formu */}
      <Dialog open={openDialog && dialogType === 'personnel'} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
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
          <Button onClick={() => setOpenDialog(false)}>İptal</Button>
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
                    
                    {viewingDocument.pdfFile ? (
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
                  startIcon={<DownloadIcon />} 
                          onClick={() => handleDownloadPDF(viewingDocument)}
                >
                  İndir
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
                            {uploadingFile ? 'Yükleniyor...' : 'Değiştir'}
                          </Button>
                        </label>
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
                            {uploadingFile ? 'Yükleniyor...' : 'PDF Yükle'}
            </Button>
                        </label>
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