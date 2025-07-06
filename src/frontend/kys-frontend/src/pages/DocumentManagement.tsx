import React, { useState } from 'react';
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
}

interface WelderData {
  id: string;
  name: string;
  registrationNo: string;
  department: string;
  certificateType: string;
  certificateNumber: string;
}

interface PersonnelData {
  id: string;
  name: string;
  registrationNo: string;
  department: string;
  position: string;
  nationalId: string;
}

// ✅ DETAYLANDIRILMIŞ VE GRUPLANDIRILMIŞ BELGE TİPLERİ
const DOCUMENT_TYPES = {
  'Kalite Sistem Belgeleri': [
    'ISO 9001:2015 Kalite Yönetim Sistemi Belgesi',
    'ISO 14001:2015 Çevre Yönetim Sistemi Belgesi',
    'ISO 45001:2018 İSG Yönetim Sistemi Belgesi',
    'ISO 50001:2018 Enerji Yönetim Sistemi Belgesi',
    'ISO 27001:2013 Bilgi Güvenliği Yönetim Sistemi',
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
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    description: ''
  });
  
  const [welderForm, setWelderForm] = useState({
    name: '',
    registrationNo: '',
    department: '',
    certificateType: '',
    certificateNumber: ''
  });
  
  const [personnelForm, setPersonnelForm] = useState({
    name: '',
    registrationNo: '',
    department: '',
    position: '',
    nationalId: ''
  });
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

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
        effectiveDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        description: ''
      });
    } else if (type === 'welder') {
      setWelderForm({
        name: '',
        registrationNo: '',
        department: '',
        certificateType: '',
        certificateNumber: ''
      });
    } else {
      setPersonnelForm({
        name: '',
        registrationNo: '',
        department: '',
        position: '',
        nationalId: ''
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
    const newDoc: Document = {
      id: editingItem?.id || `DOC-${Date.now()}`,
      type: documentForm.type,
      name: documentForm.name,
      number: documentForm.number || `${documentForm.type.slice(0,3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
      unit: documentForm.unit || 'Kalite Güvence',
      welderName: documentForm.welderName,
      personnelName: documentForm.personnelName,
      certificateNumber: documentForm.certificateNumber,
      issuingAuthority: documentForm.issuingAuthority,
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
      certificateType: welderForm.certificateType,
      certificateNumber: welderForm.certificateNumber
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
      nationalId: personnelForm.nationalId
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
        effectiveDate: item.effectiveDate,
        expiryDate: item.expiryDate || '',
        description: item.description
      });
    } else if (type === 'welder') {
      setWelderForm({
        name: item.name,
        registrationNo: item.registrationNo,
        department: item.department,
        certificateType: item.certificateType,
        certificateNumber: item.certificateNumber
      });
    } else {
      setPersonnelForm({
        name: item.name,
        registrationNo: item.registrationNo,
        department: item.department,
        position: item.position,
        nationalId: item.nationalId
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

  const filteredWelders = welders.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.registrationNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPersonnel = personnel.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.registrationNo.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Belgeler ({filteredDocuments.length})
            </Typography>
            {filteredDocuments.length === 0 ? (
              <Alert severity="info">
                Henüz belge eklenmemiş. "Yeni Belge" butonunu kullanarak belge ekleyebilirsiniz.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Belge Adı</TableCell>
                      <TableCell>Tip</TableCell>
                      <TableCell>Numara</TableCell>
                      <TableCell>İlgili Kişi</TableCell>
                      <TableCell>Sertifika No</TableCell>
                      <TableCell>Veren Kuruluş</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Tarih</TableCell>
                      <TableCell>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.name}</TableCell>
                        <TableCell>
                          <Chip label={doc.type} size="small" />
                        </TableCell>
                        <TableCell>{doc.number}</TableCell>
                        <TableCell>{doc.welderName || doc.personnelName || '-'}</TableCell>
                        <TableCell>{doc.certificateNumber || '-'}</TableCell>
                        <TableCell>{doc.issuingAuthority || '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={doc.status === 'active' ? 'Aktif' : 'Pasif'} 
                            color={doc.status === 'active' ? 'success' : 'default'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>{doc.effectiveDate}</TableCell>
                        <TableCell>
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
            )}
          </CardContent>
        </Card>
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
                      <TableCell>Sertifika Tipi</TableCell>
                      <TableCell>Sertifika No</TableCell>
                      <TableCell>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredWelders.map((welder) => (
                      <TableRow key={welder.id}>
                        <TableCell>{welder.name}</TableCell>
                        <TableCell>{welder.registrationNo}</TableCell>
                        <TableCell>{welder.department}</TableCell>
                        <TableCell>
                          <Chip label={welder.certificateType} size="small" />
                        </TableCell>
                        <TableCell>{welder.certificateNumber}</TableCell>
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
                      <TableCell>TC Kimlik</TableCell>
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
                        <TableCell>{person.nationalId}</TableCell>
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
              <FormControl fullWidth required>
                <InputLabel>Belge Tipi</InputLabel>
                <Select
                  value={documentForm.type}
                  onChange={(e) => setDocumentForm(prev => ({ ...prev, type: e.target.value }))}
                  label="Belge Tipi"
                >
                  {Object.entries(DOCUMENT_TYPES).map(([category, types]) => [
                    <MenuItem key={category} disabled sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {category}
                    </MenuItem>,
                    ...types.map((type) => (
                      <MenuItem key={type} value={type} sx={{ pl: 3 }}>
                        {type}
                      </MenuItem>
                    ))
                  ])}
                </Select>
              </FormControl>
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
              <TextField
                fullWidth
                label="Birim"
                value={documentForm.unit}
                onChange={(e) => setDocumentForm(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="Kalite Güvence"
              />
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
                  onChange={(e) => setDocumentForm(prev => ({ ...prev, issuingAuthority: e.target.value }))}
                  label="Veren Kuruluş"
                >
                  {ISSUING_AUTHORITIES.map((authority) => (
                    <MenuItem key={authority} value={authority}>{authority}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
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
              <FormControl fullWidth>
                <InputLabel>Sertifika Tipi</InputLabel>
                <Select
                  value={welderForm.certificateType}
                  onChange={(e) => setWelderForm(prev => ({ ...prev, certificateType: e.target.value }))}
                  label="Sertifika Tipi"
                >
                  {CERTIFICATE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sertifika Numarası"
                value={welderForm.certificateNumber}
                onChange={(e) => setWelderForm(prev => ({ ...prev, certificateNumber: e.target.value }))}
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
              <TextField
                fullWidth
                label="TC Kimlik Numarası"
                value={personnelForm.nationalId}
                onChange={(e) => setPersonnelForm(prev => ({ ...prev, nationalId: e.target.value }))}
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