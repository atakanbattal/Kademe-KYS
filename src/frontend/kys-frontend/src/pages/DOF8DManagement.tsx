import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Grid,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  DateRange as DateRangeIcon,
  Cancel as CancelIcon,
  SwapHoriz as SwapHorizIcon,
  Merge as MergeIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { styled } from '@mui/material/styles';
import { useThemeContext } from '../context/ThemeContext';

// ✅ Gelişmiş Interface Definitions
interface DOFRecord {
  id: string;
  dofNumber: string;
  type: 'corrective' | 'preventive' | '8d' | 'improvement' | 'mdi';
  title: string;
  description: string;
  department: string;
  responsible: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'awaiting_approval' | 'overdue' | 'closed' | 'rejected';
  createdDate: string;
  openingDate: string; // ✅ Açılış tarihi (geçmişe yönelik veriler için)
  dueDate: string;
  closedDate?: string;
  rootCause: string;
  actions: Action[];
  attachments: Attachment[];
  history: HistoryRecord[];
  delayReason?: string;
  rejectionReason?: string; // ✅ DÖF reddedildiğinde neden açıklaması
  mdiNumber?: string; // ✅ MDİ numarası (Manuel girilen Mühendislik Değişiklik İsteği numarası)
  remainingDays?: number;
  delayStatus?: 'on_time' | 'warning' | 'overdue';
  notificationSent?: boolean;
  // Context7 - 8D Specific Fields
  d8Steps?: {
    d1_team?: string;
    d2_problem?: string;
    d3_containment?: string;
    d4_rootCause?: string;
    d5_permanentAction?: string;
    d6_implementation?: string;
    d7_prevention?: string;
    d8_recognition?: string;
  };
  d8Progress?: number; // 0-100 percentage
  metadata?: {
    rootCauseCategory?: string;
    migrationConfidence?: number;
    migrationDate?: string;
    createdBy?: string;
    creationTime?: string;
    lastModified?: string;
    modifiedBy?: string;
    version?: string;
    closedBy?: string;
    closureTime?: string;
    finalStatus?: string;
    cleanupDate?: string;
    cleanupVersion?: string;
    isSampleData?: boolean;
    isTestData?: boolean;
  };
}

interface Action {
  id: string;
  description: string;
  responsible: string;
  dueDate: string;
  status: 'pending' | 'completed';
  completedDate?: string;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  type: string;
}

interface HistoryRecord {
  id: string;
  action: string;
  user: string;
  date: string;
  details: string;
}

interface FilterState {
  department: string;
  status: string;
  type: string;
  searchTerm: string;
  year: string;
  month: string;
  delayStatus: string;
  priority: string;
}





// ✅ Temiz Constants
const DEPARTMENTS = [
  'Ar-Ge',
  'Bakım Onarım',
  'Boyahane',
  'Büküm',
  'Depo',
  'Elektrik Montaj',
  'Finans',
  'İdari İşler',
  'İnsan Kaynakları',
  'İş Sağlığı ve Güvenliği',
  'Kalite Kontrol',
  'Kaynakhane',
  'Kesim',
  'Mekanik Montaj',
  'Satın Alma',
  'Satış Sonrası Hizmetleri',
  'Tedarikçi Geliştirme',
  'Tesellüm',
  'Yurtiçi Satış',
  'Yurtdışı Satış',
  'Üretim',
  'Üretim Planlama',
  'Üst Yönetim'
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Açık', color: '#2196f3' },
  { value: 'in_progress', label: 'İşlemde', color: '#ff9800' },
  { value: 'awaiting_approval', label: 'Onay Bekliyor', color: '#9c27b0' },
  { value: 'overdue', label: 'Gecikmiş', color: '#f44336' },
  { value: 'closed', label: 'Kapalı', color: '#4caf50' },
  { value: 'rejected', label: 'Reddedildi', color: '#607d8b' }
];

const DOF_TYPES = [
  { value: 'corrective', label: 'Düzeltici', color: '#f44336' },
  { value: 'preventive', label: 'Önleyici', color: '#4caf50' },
  { value: '8d', label: '8D', color: '#2196f3' },
  { value: 'improvement', label: 'İyileştirme', color: '#ff9800' },
  { value: 'mdi', label: 'MDİ', color: '#9c27b0' }
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

const DELAY_STATUS_OPTIONS = [
  { value: 'on_time', label: 'Zamanında', color: '#4caf50' },
  { value: 'warning', label: 'Terminine Az Kalan', color: '#ff9800' },
  { value: 'overdue', label: 'Gecikmiş', color: '#f44336' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Düşük', color: '#4caf50' },
  { value: 'medium', label: 'Orta', color: '#ff9800' },
  { value: 'high', label: 'Yüksek', color: '#f44336' },
  { value: 'critical', label: 'Kritik', color: '#d32f2f' }
];

// ✅ Gelişmiş Kök Neden Kategorileme Sistemi
const ROOT_CAUSE_CATEGORIES = [
  {
    category: 'İnsan Faktörleri',
    color: '#f44336',
    icon: 'IF',
    causes: [
      'Dikkat dağınıklığı ve konsantrasyon eksikliği',
      'Eğitim programı yetersizliği ve bilgi eksikliği',
      'Ergonomik uyumsuzluk ve fiziksel zorlanma',
      'İletişim eksikliği ve koordinasyon sorunu',
      'İş güvenliği kurallarına uymama',
      'İş talimatlarını okumama ve anlama eksikliği',
      'Motivasyon düşüklüğü ve iş tatminsizliği',
      'Operatör deneyimsizliği ve yetkinlik eksikliği',
      'Oryantasyon eğitimi eksikliği (yeni personel)',
      'Performans değerlendirme ve geri bildirim eksikliği',
      'Sorumluluk bilinci eksikliği ve sahiplenme sorunu',
      'Stres ve yorgunluk faktörleri',
      'Sürekli gelişim ve öğrenme eksikliği',
      'Takım çalışması ve işbirliği problemleri',
      'Yetki ve sorumluluk belirsizliği'
    ],
    keywords: ['operatör', 'eğitim', 'personel', 'insan', 'yetkinlik', 'dikkat', 'yorgunluk', 'motivasyon', 'iletişim', 'oryantasyon', 'deneyim', 'güvenlik', 'ergonomi', 'konsantrasyon', 'koordinasyon', 'takım', 'performans', 'stres', 'sahiplenme', 'yetki']
  },
  {
    category: 'Makine/Ekipman',
    color: '#ff9800',
    icon: 'ME',
    causes: [
      'Aşınma ve yıpranma problemleri',
      'Ayar ve konfigürasyon bozukluğu',
      'Donanım arızası ve bileşen hatası',
      'Elektrik ve elektronik sistem problemleri',
      'Emniyet sistemleri ve güvenlik donanımı hatası',
      'Eskimiş ekipman ve teknoloji yetersizliği',
      'Hidraulik ve pnömatik sistem problemleri',
      'Kalibrasyon sapması ve ölçüm hatası',
      'Makine tasarım eksikliği ve ergonomi problemi',
      'Mekanik bileşen hatası ve montaj sorunu',
      'Ölçüm ve kontrol cihazı problemleri',
      'Periyodik bakım eksikliği ve gecikme',
      'Sensör ve algılama sistemi hatası',
      'Yedek parça eksikliği ve temin sorunu',
      'Yazılım hatası ve firmware güncellemesi'
    ],
    keywords: ['makine', 'ekipman', 'arıza', 'kalibrasyon', 'bakım', 'sensör', 'yedek', 'aşınma', 'ayar', 'yazılım', 'elektrik', 'donanım', 'bileşen', 'mekanik', 'hidraulik', 'pnömatik', 'emniyet', 'ölçüm', 'kontrol', 'firmware', 'elektronik', 'tasarım', 'montaj']
  },
  {
    category: 'Malzeme/Hammadde',
    color: '#9c27b0',
    icon: 'MH',
    causes: [
      'Ambalaj hasarı ve koruma eksikliği',
      'Depolama koşulları ve ortam kontrolü yetersizliği',
      'Fiziksel özellik sapması ve mekanik test hatası',
      'Gelen malzeme muayene ve test eksikliği',
      'Hammadde spesifikasyon uyumsuzluğu',
      'Karışım ve kontaminasyon problemleri',
      'Kimyasal bileşim sapması ve analiz hatası',
      'Lot takibi ve izlenebilirlik eksikliği',
      'Malzeme etiketleme ve tanımlama hatası',
      'Malzeme seçim hatası ve uyumluluk sorunu',
      'Nakliye ve taşıma hasarı',
      'Raf ömrü ve son kullanma tarihi kontrolü',
      'Sertifika ve test raporu eksikliği',
      'Tedarikçi kalite problemleri ve uyumsuzluk',
      'Yüzey kalitesi ve görsel defektler'
    ],
    keywords: ['tedarikçi', 'malzeme', 'hammadde', 'spesifikasyon', 'depolama', 'taşıma', 'lot', 'karışım', 'kirlilik', 'ambalaj', 'test', 'kimyasal', 'fiziksel', 'sertifika', 'muayene', 'kontaminasyon', 'raf', 'ömrü', 'etiketleme', 'tanımlama', 'yüzey', 'defekt', 'izlenebilirlik', 'ortam']
  },
  {
    category: 'Ortam/Çevre',
    color: '#4caf50',
    icon: 'OÇ',
    causes: [
      'Alan yetersizliği ve yerleşim problemi',
      'Aydınlatma yetersizliği ve görüş problemi',
      'Çevresel koşullar ve dış etken problemleri',
      'Elektromanyetik girişim ve radyasyon etkisi',
      'Ergonomik koşullar ve çalışma pozisyonu',
      'Gürültü seviyesi ve akustik problemler',
      'Havalandırma sistemi ve hava kalitesi problemi',
      'Hijyen ve sanitasyon eksikliği',
      'İklim kontrolü ve sıcaklık regülasyonu',
      'Nem oranı ve rutubet kontrolü problemi',
      'Temizlik eksikliği ve kirlilik problemleri',
      'Titreşim etkisi ve mekanik salınım',
      'Toz ve partikül kirliliği',
      'Yer döşemesi ve zemin problemi',
      'Çevresel güvenlik ve koruma eksikliği'
    ],
    keywords: ['çevre', 'sıcaklık', 'nem', 'titreşim', 'aydınlatma', 'gürültü', 'temizlik', 'hava', 'ergonomi', 'alan', 'hijyen', 'toz', 'partikül', 'iklim', 'rutubet', 'sanitasyon', 'elektromanyetik', 'radyasyon', 'akustik', 'zemin', 'döşeme', 'güvenlik', 'koruma', 'kirlilik']
  },
  {
    category: 'Sistem/Teknoloji',
    color: '#607d8b',
    icon: 'ST',
    causes: [
      'Ağ bağlantısı ve iletişim problemi',
      'Bilgi güvenliği ve siber güvenlik açığı',
      'Database bütünlüğü ve veri tutarlılığı sorunu',
      'Entegrasyon problemi ve sistem uyumsuzluğu',
      'Kapasiter ve performans yetersizliği',
      'Konfigürasyon hatası ve ayar problemleri',
      'Lisans ve yazılım güncellemesi problemi',
      'Sistem mimarisi ve tasarım eksikliği',
      'Teknoloji eskitilmesi ve uyumluluk sorunu',
      'Uygulamalar arası veri transferi hatası',
      'Veri kaybı ve yedekleme sistemleri',
      'Versiyon kontrolü ve değişiklik yönetimi',
      'Yazılım hatası ve kod kalitesi problemi',
      'Yük dağılımı ve kaynak yönetimi sorunu',
      'Zaman aşımı ve yanıt süresi problemleri'
    ],
    keywords: ['yazılım', 'sistem', 'entegrasyon', 'veri', 'ağ', 'güvenlik', 'yedek', 'performans', 'uyumluluk', 'database', 'konfigürasyon', 'siber', 'bütünlük', 'tutarlılık', 'kapasite', 'mimari', 'tasarım', 'lisans', 'güncelleme', 'transfer', 'versiyon', 'kod', 'yük', 'kaynak', 'zaman', 'yanıt']
  },
  {
    category: 'Yöntem/Prosedür',
    color: '#2196f3',
    icon: 'YP',
    causes: [
      'Akış şeması ve süreç tanımı eksikliği',
      'Doğrulama ve verifikasyon süreç hatası',
      'Dokümantasyon eksikliği ve güncellik sorunu',
      'Değişiklik kontrolü ve revizyon yönetimi',
      'Eğitim materyali ve öğretim yöntemi eksikliği',
      'İş talimatı belirsizliği ve eksik bilgi',
      'Kalite kontrol noktası ve checkpoint eksikliği',
      'Kritik kontrol noktası belirleme hatası',
      'Onay süreçleri ve yetkilendirme problemi',
      'Prosedür güncelliği ve revizyon eksikliği',
      'Risk değerlendirmesi ve analiz yetersizliği',
      'Standart çalışma yöntemi belirleme hatası',
      'Süreç performans ölçümü ve analiz eksikliği',
      'Uygunluk değerlendirmesi ve denetim yetersizliği',
      'Validasyon ve metot doğrulama problemi'
    ],
    keywords: ['prosedür', 'talimat', 'standart', 'yöntem', 'kontrol', 'doğrulama', 'risk', 'süreç', 'kriter', 'döküman', 'onay', 'akış', 'şema', 'verifikasyon', 'güncellik', 'revizyon', 'eğitim', 'materyal', 'checkpoint', 'kritik', 'yetkilendirme', 'performans', 'ölçüm', 'uygunluk', 'denetim', 'validasyon', 'metot']
  },
  {
    category: 'Yönetim/Organizasyon',
    color: '#795548',
    icon: 'YO',
    causes: [
      'Bütçe kısıtları ve finansal kaynak yetersizliği',
      'Değişiklik yönetimi ve adaptasyon sorunu',
      'İnsan kaynağı planlaması ve yetkinlik eksikliği',
      'Karar alma süreçleri ve yetki belirsizliği',
      'Koordinasyon eksikliği ve departmanlar arası işbirlik',
      'Kriz yönetimi ve acil durum planlaması eksik',
      'Liderlik ve yönetim tarzı problemleri',
      'Müşteri gereksinim değişikliği ve talep yönetimi',
      'Organizasyon yapısı ve rol tanımları belirsiz',
      'Öncelik belirleme ve kaynak dağılımı hatası',
      'Planlama eksikliği ve zaman yönetimi sorunu',
      'Proje yönetimi ve takip sistemleri yetersiz',
      'Sorumluluk dağılımı ve hesap verebilirlik eksik',
      'Stratejik planlama ve vizyon belirsizliği',
      'Üst yönetim desteği ve taahhüdü eksikliği'
    ],
    keywords: ['kaynak', 'zaman', 'öncelik', 'sorumluluk', 'karar', 'koordinasyon', 'planlama', 'müşteri', 'bütçe', 'strateji', 'liderlik', 'yönetim', 'organizasyon', 'rol', 'yetki', 'proje', 'takip', 'değişiklik', 'adaptasyon', 'kriz', 'acil', 'durum', 'hesap', 'verebilirlik', 'vizyon', 'taahhüt', 'finansal']
  },
  {
    category: 'Ar-Ge Faktörleri',
    color: '#673ab7',
    icon: 'ARG',
    causes: [
      'Ar-Ge ve üretim koordinasyon problemi',
      'Bilimsel araştırma ve metodoloji eksikliği',
      'Deneysel tasarım ve validasyon hatası',
      'Fikri mülkiyet ve patent kısıtları',
      'Geliştirme süreç yönetimi eksikliği',
      'Hesaplama ve simülasyon modeli hatası',
      'İnovasyon stratejisi ve uygulama yetersizliği',
      'Kalite fonksiyon dağılımı (QFD) eksikliği',
      'Literatür tarama ve prior art araştırması yetersiz',
      'Malzeme karakterizasyon ve seçim hatası',
      'Müşteri ihtiyaç analizi ve pazar araştırması eksik',
      'Optimizasyon ve performans analizi yetersizliği',
      'Prototip geliştirme ve test süreç hatası',
      'Risk analizi ve FMEA uygulaması eksik',
      'Standart, norm ve regülasyon uyumsuzluğu',
      'Tasarım spesifikasyon ve gereksinim eksikliği',
      'Teknoloji transfer ve ölçeklendirme problemi',
      'Teknolojik olgunluk seviyesi (TRL) belirleme hatası',
      'Teknik dokümantasyon ve raporlama eksikliği',
      'Test ve analiz ekipman kalibrasyonu problemi',
      'Tolerans analizi ve stack-up hesaplama hatası',
      'Ürün yaşam döngüsü yönetimi eksikliği',
      'Veri analizi ve istatistiksel değerlendirme hatası',
      'Yeni teknoloji entegrasyonu ve adaptasyon sorunu'
    ],
    keywords: ['tasarım', 'prototip', 'spesifikasyon', 'tolerans', 'hesaplama', 'simülasyon', 'standart', 'norm', 'teknoloji', 'patent', 'lisans', 'inovasyon', 'dokümantasyon', 'geliştirme', 'test', 'validasyon', 'analiz', 'olgunluk', 'ar-ge', 'arge', 'araştırma', 'metodoloji', 'deneysel', 'kalite', 'literatür', 'karakterizasyon', 'pazar', 'optimizasyon', 'performans', 'risk', 'fmea', 'regülasyon', 'transfer', 'ölçeklendirme', 'trl', 'kalibrasyon', 'stack-up', 'yaşam', 'döngü', 'istatistik', 'entegrasyon', 'adaptasyon']
  }
];

// ✅ Akıllı Kök Neden Eşleştirme Fonksiyonları
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Noktalama işaretlerini kaldır
    .replace(/\s+/g, ' ') // Çoklu boşlukları tek boşluğa çevir
    .trim();
};

const findBestRootCauseCategory = (inputText: string): { category: string; confidence: number; suggestedCause?: string } => {
  if (!inputText || inputText.trim().length === 0) {
    return { category: '', confidence: 0 };
  }

  const normalizedInput = normalizeText(inputText);
  let bestMatch = { category: '', confidence: 0, suggestedCause: '' };

  ROOT_CAUSE_CATEGORIES.forEach(categoryData => {
    let categoryConfidence = 0;
    let matchedCause = '';

    // 1. Anahtar kelime eşleştirmesi
    const keywordMatches = categoryData.keywords.filter(keyword => 
      normalizedInput.includes(keyword.toLowerCase())
    ).length;
    
    if (keywordMatches > 0) {
      categoryConfidence += (keywordMatches / categoryData.keywords.length) * 60;
    }

    // 2. Önceden tanımlanmış nedenlerde tam/kısmi eşleşme
    categoryData.causes.forEach(cause => {
      const normalizedCause = normalizeText(cause);
      
      // Tam eşleşme
      if (normalizedInput === normalizedCause) {
        categoryConfidence = 100;
        matchedCause = cause;
        return;
      }
      
      // Kısmi eşleşme (substring)
      if (normalizedInput.includes(normalizedCause) || normalizedCause.includes(normalizedInput)) {
        const similarity = Math.min(normalizedInput.length, normalizedCause.length) / 
                          Math.max(normalizedInput.length, normalizedCause.length);
        const partialScore = similarity * 80;
        
        if (partialScore > categoryConfidence) {
          categoryConfidence = partialScore;
          matchedCause = cause;
        }
      }
    });

    // En iyi eşleşmeyi güncelle
    if (categoryConfidence > bestMatch.confidence) {
      bestMatch = {
        category: categoryData.category,
        confidence: categoryConfidence,
        suggestedCause: matchedCause || categoryData.causes[0]
      };
    }
  });

  return bestMatch;
};

const getRootCauseSuggestions = (inputText: string): Array<{category: string; cause: string; confidence: number}> => {
  if (!inputText || inputText.trim().length < 2) return [];

  const normalizedInput = normalizeText(inputText);
  const suggestions: Array<{category: string; cause: string; confidence: number}> = [];

  ROOT_CAUSE_CATEGORIES.forEach(categoryData => {
    categoryData.causes.forEach(cause => {
      const normalizedCause = normalizeText(cause);
      
      if (normalizedCause.includes(normalizedInput)) {
        const confidence = (normalizedInput.length / normalizedCause.length) * 100;
        suggestions.push({
          category: categoryData.category,
          cause: cause,
          confidence: confidence
        });
      }
    });
  });

  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5); // En iyi 5 öneri
};

// ✅ Context7 - Safe LocalStorage Functions
const safeSaveToLocalStorage = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('Context7 - LocalStorage save error:', error);
    return false;
  }
};

const safeGetFromLocalStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Context7 - LocalStorage read error:', error);
    return null;
  }
};

// Context7 - Utility Functions (need to be defined before component)
const calculateRemainingDays = (dueDate: string): number => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getDelayStatus = (dueDate: string, status: string): 'on_time' | 'warning' | 'overdue' => {
  if (status === 'closed') return 'on_time';
  
  const remainingDays = calculateRemainingDays(dueDate);
  if (remainingDays < 0) return 'overdue';
  if (remainingDays <= 3) return 'warning';
  return 'on_time';
};

// ============================================
// 🎯 PDF OLUŞTURMA FONKSİYONU - PROFESYONEL TÜRKÇE DESTEKLİ
// ============================================

// PDF Validasyon fonksiyonu
const validatePDFData = (record: DOFRecord): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Zorunlu alanları kontrol et
  if (!record.title || record.title.trim() === '') {
    errors.push('• DÖF Başlığı boş olamaz');
  }
  
  if (!record.description || record.description.trim() === '' || record.description === 'Detay bilgi yok') {
    errors.push('• Problem açıklaması yazılmalıdır ("Detay bilgi yok" kabul edilmez)');
  }
  
  if (!record.responsible || record.responsible.trim() === '') {
    errors.push('• Sorumlu kişi belirtilmelidir');
  }
  
  if (!record.department || record.department.trim() === '') {
    errors.push('• Sorumlu departman belirtilmelidir');
  }
  
  if (!record.dueDate || record.dueDate.trim() === '') {
    errors.push('• Hedef kapanış tarihi belirtilmelidir');
  }
  
  if (!record.rootCause || record.rootCause.trim() === '' || record.rootCause === 'Belirtilmemiş') {
    errors.push('• Kök neden analizi yapılmalıdır');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const generateDOFPDF = (record: DOFRecord): void => {
  try {
    console.log('📄 PDF oluşturuluyor:', record.dofNumber);
    
    // ============================================
    // 🔍 PDF VALİDASYON KONTROLÜ
    // ============================================
    
    const validation = validatePDFData(record);
    if (!validation.isValid) {
      alert(`❌ PDF oluşturulamadı!\n\nAşağıdaki zorunlu alanları tamamlayın:\n\n${validation.errors.join('\n')}\n\nTüm zorunlu alanları doldurduktan sonra tekrar deneyin.`);
      return;
    }
    
    // Veri kontrolü
    if (!record || !record.dofNumber) {
      alert('DÖF kaydı eksik veya hatalı. PDF oluşturulamadı.');
      return;
    }
    
    // PDF oluştur - A4 boyut
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let currentY = margin;

    // ============================================
    // 🔤 TÜRKÇE KARAKTER VE METİN TEMİZLEYİCİ
    // ============================================
    // Türkçe karakter DOĞRU kullanımı - Encoding koruma sistemi
    const cleanText = (text: string): string => {
      if (!text) return '';
      
      // Türkçe karakterleri koruyalım ve sadece gerekli temizlik yapalım
      return text
        .replace(/₺/g, 'TL')
        .replace(/€/g, 'EUR')
        .replace(/\s+/g, ' ')
        .trim();
    };

    // Türkçe karakter desteği için özel font encoding fonksiyonu
    const turkishSafeText = (text: string): string => {
      if (!text) return '';
      
      // Türkçe karakterleri koruma (jsPDF compatible)
      const safeText = cleanText(text)
        .replace(/İ/g, 'I')
        .replace(/ı/g, 'i')
        .replace(/Ğ/g, 'G')
        .replace(/ğ/g, 'g')
        .replace(/Ü/g, 'U')
        .replace(/ü/g, 'u')
        .replace(/Ş/g, 'S')
        .replace(/ş/g, 's')
        .replace(/Ö/g, 'O')
        .replace(/ö/g, 'o')
        .replace(/Ç/g, 'C')
        .replace(/ç/g, 'c');
      
      return safeText;
    };

    const safeText = (text: any): string => {
      if (!text) return 'Belirtilmemiş';
      return turkishSafeText(String(text));
    };



    // Font ayarları - Türkçe karakter için özel encoding
    doc.setFont('helvetica', 'normal');
    
    // ============================================
    // 📋 BAŞLIK VE LOGO ALANI
    // ============================================
    
    // Firma başlığı
    doc.setFontSize(20);
    doc.setTextColor(31, 81, 143); // Koyu mavi
    const companyTitle = turkishSafeText('KADEME A.S.');
    const titleWidth = doc.getTextWidth(companyTitle);
    doc.text(companyTitle, (pageWidth - titleWidth) / 2, currentY);
    currentY += 8;
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    const subtitle = turkishSafeText('Kalite Yonetim Sistemi');
    const subtitleWidth = doc.getTextWidth(subtitle);
    doc.text(subtitle, (pageWidth - subtitleWidth) / 2, currentY);
    currentY += 15;
    
    // Çizgi
    doc.setDrawColor(31, 81, 143);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;
    
    // ============================================
    // 📊 DÖF BAŞLIK BİLGİLERİ
    // ============================================
    
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
          const recordTitle = record.type === '8d' ? 
        turkishSafeText('8D Problem Çözme Raporu') : 
              'Düzeltici Faaliyet Raporu (DÖF)';
    const recordTitleWidth = doc.getTextWidth(recordTitle);
    doc.text(recordTitle, (pageWidth - recordTitleWidth) / 2, currentY);
    currentY += 15;
    
    // ============================================
    // 📝 TEMEL BİLGİLER TABLOSU
    // ============================================
    
    const getStatusText = (status: string) => {
      const statusMap: { [key: string]: string } = {
        'open': 'Açık',
        'in_progress': 'İşlemde',
        'awaiting_approval': 'Onay Bekliyor',
        'overdue': 'Gecikmiş',
        'closed': 'Kapalı',
        'rejected': 'Reddedildi'
      };
      return turkishSafeText(statusMap[status] || status);
    };
    
    const getTypeText = (type: string) => {
      const typeMap: { [key: string]: string } = {
        'corrective': 'Düzeltici',
        'preventive': 'Önleyici',
        '8d': '8D',
        'improvement': 'İyileştirme',
        'mdi': 'MDI'
      };
      return turkishSafeText(typeMap[type] || type);
    };
    
    const getPriorityText = (priority: string) => {
      const priorityMap: { [key: string]: string } = {
        'low': 'Düşük',
        'medium': 'Orta',
        'high': 'Yüksek',
        'critical': 'Kritik'
      };
      return turkishSafeText(priorityMap[priority] || priority);
    };
    
    const safeDate = (dateStr: any): string => {
      try {
        if (!dateStr) return turkishSafeText('Belirtilmemiş');
        const date = new Date(dateStr);
                  if (isNaN(date.getTime())) return turkishSafeText('Geçersiz tarih');
        return turkishSafeText(date.toLocaleDateString('tr-TR'));
      } catch {
                  return turkishSafeText('Geçersiz tarih');
      }
    };
    
    // ============================================
    // 📊 BELGE BİLGİLERİ KUTUSU
    // ============================================
    
    // Üst bilgi kutusu
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.rect(margin, currentY, pageWidth - 2 * margin, 25);
    
    // Sol bölüm - Belge bilgileri
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(turkishSafeText('BELGE BILGILERI'), margin + 5, currentY + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${turkishSafeText('DÖF Tipi')}: ${getTypeText(record.type || 'corrective')}`, margin + 5, currentY + 14);
    doc.text(`${turkishSafeText('DÖF No')}: ${safeText(record.dofNumber)}`, margin + 5, currentY + 18);
    doc.text(`${turkishSafeText('Oluşturma')}: ${safeDate(record.openingDate || record.createdDate)}`, margin + 5, currentY + 22);
    
    // Durum bilgisi - sağ üstte profesyonel görünüm
    const statusText = getStatusText(record.status || 'open');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${turkishSafeText('Durum')}: ${statusText}`, pageWidth - margin - 60, currentY + 14);
    
    // Sağ alt - tarih bilgileri
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${turkishSafeText('Yazdırma')}: ${turkishSafeText(new Date().toLocaleDateString('tr-TR'))} ${turkishSafeText(new Date().toLocaleTimeString('tr-TR'))}`, pageWidth - margin - 60, currentY + 18);
    doc.text(turkishSafeText('Sistem: KADEME KYS'), pageWidth - margin - 60, currentY + 22);
    
    currentY += 35;

    // ============================================
    // 📋 1. TEMEL BİLGİLER TABLOSU
    // ============================================
    
    // Başlık
    doc.setFillColor(63, 81, 181);
    doc.rect(margin, currentY, pageWidth - 2 * margin, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(turkishSafeText('1. TEMEL BILGILER'), margin + 5, currentY + 8);
    currentY += 12;

    // Tablo başlıkları
    doc.setFillColor(63, 81, 181);
    doc.rect(margin, currentY, pageWidth - 2 * margin, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(turkishSafeText('PARAMETRE'), margin + 5, currentY + 7);
    doc.text(turkishSafeText('DEĞER'), margin + 80, currentY + 7);
    currentY += 10;

    // Tablo verileri
    const basicInfoRows = [
      [turkishSafeText('DÖF Başlığı'), safeText(record.title)],
      [turkishSafeText('Tip'), getTypeText(record.type || 'corrective')],
      [turkishSafeText('Durum'), getStatusText(record.status || 'open')],
      [turkishSafeText('Öncelik Seviyesi'), getPriorityText(record.priority || 'medium')],
      [turkishSafeText('Sorumlu Departman'), safeText(record.department)],
      [turkishSafeText('Sorumlu Kişi'), safeText(record.responsible)],
      [turkishSafeText('Açılış Tarihi'), safeDate(record.openingDate || record.createdDate)],
      [turkishSafeText('Hedef Kapanış Tarihi'), safeDate(record.dueDate)],
      ...(record.closedDate ? [[turkishSafeText('Gerçek Kapanış Tarihi'), safeDate(record.closedDate)]] : [])
    ];

    basicInfoRows.forEach((row, index) => {
      const isEven = index % 2 === 0;
      const bgColor = isEven ? [248, 249, 250] : [255, 255, 255];
      
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');
      
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, currentY, pageWidth - 2 * margin, 8);
      
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(row[0], margin + 3, currentY + 5.5);
      
      doc.setFont('helvetica', 'normal');
      doc.text(row[1], margin + 80, currentY + 5.5);
      
      currentY += 8;
    });
    
    currentY += 10;
    
    // ============================================
    // 📋 2. PROBLEM TANIMI VE AÇIKLAMA
    // ============================================
    
    // Başlık
    doc.setFillColor(235, 98, 56);
    doc.rect(margin, currentY, pageWidth - 2 * margin, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(turkishSafeText('2. PROBLEM TANIMI VE AÇIKLAMA'), margin + 5, currentY + 8);
    currentY += 12;
    
    // İçerik kutusu - düzenli satır satır yazım
    const description = safeText(record.description);
    
    // Açıklama metnini al ve maddeleri alt alta düzenle
    let formattedDescription = description;
    if (description) {
      // Madde işaretlerini yeni satırdan başlat
      formattedDescription = description
        .replace(/\s+-\s+/g, '\n- ')  // " - " ifadelerini yeni satırdan başlat
        .replace(/(\d+\.)\s+/g, '\n$1 ')  // "1. " gibi numaraları yeni satırdan başlat
        .replace(/^\n/, '')  // Başındaki gereksiz yeni satırı kaldır
        .trim();
    }
    const lines = formattedDescription.split('\n');
    const descriptionHeight = Math.max(50, lines.length * 7 + 20);
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, currentY, pageWidth - 2 * margin, descriptionHeight, 'FD');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
          if (formattedDescription && formattedDescription !== 'Belirtilmemiş') {
      let lineY = currentY + 8;
      lines.forEach(line => {
        // Her satırı olduğu gibi yaz, sadece satır uzunluğunu ayarla
        const splitLine = doc.splitTextToSize(turkishSafeText(line), pageWidth - 2 * margin - 10);
        splitLine.forEach((subLine) => {
          doc.text(subLine, margin + 5, lineY);
          lineY += 6;
        });
        // Boş satırlar için de yer bırak
        if (!line.trim()) {
          lineY += 3;
        }
      });
    } else {
      doc.setTextColor(120, 120, 120);
      doc.setFont('helvetica', 'italic');
      doc.text(turkishSafeText('Problem tanımı ve açıklama bulunmuyor.'), margin + 5, currentY + 8);
    }
    currentY += descriptionHeight + 10;
    
    // ============================================
    // 🔍 3. KÖK NEDEN ANALİZİ
    // ============================================
    
    const rootCause = safeText(record.rootCause);
    
    // Yeni sayfa kontrolü - kök neden analizi için
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = margin;
    }
    
    // Başlık
    doc.setFillColor(76, 175, 80);
    doc.rect(margin, currentY, pageWidth - 2 * margin, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(turkishSafeText('3. KÖK NEDEN ANALİZİ'), margin + 5, currentY + 8);
    currentY += 12;
    
    // İçerik kutusu
          const rootCauseLines = rootCause && rootCause !== 'Belirtilmemiş' 
      ? doc.splitTextToSize(turkishSafeText(rootCause), pageWidth - 2 * margin - 10)
              : [turkishSafeText('Araştırılacak - Kalitesizlik maliyet analizi gerekli')];
    
    const rootCauseHeight = Math.max(30, rootCauseLines.length * 6 + 15);
    
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, currentY, pageWidth - 2 * margin, rootCauseHeight, 'FD');
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    let rootCauseY = currentY + 8;
    rootCauseLines.forEach((line: string) => {
      doc.text(line, margin + 5, rootCauseY);
      rootCauseY += 6;
    });
    
    currentY += rootCauseHeight + 10;
    
    // ============================================
    // 🎯 4. 8D METODOLOJI ADIMLARI (8D için)
    // ============================================
    
    if (record.type === '8d' && record.d8Steps) {
      // Yeni sayfa kontrolü
      if (currentY > pageHeight - 100) {
        doc.addPage();
        currentY = margin;
        
        // Sayfa başlığı
        doc.setFillColor(63, 81, 181);
        doc.rect(margin, currentY, pageWidth - 2 * margin, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(turkishSafeText('KADEME A.Ş. - DÖF RAPORU (DEVAM)'), margin + 5, currentY + 10);
        currentY += 25;
      }
      
      // Başlık
      doc.setFillColor(156, 39, 176);
      doc.rect(margin, currentY, pageWidth - 2 * margin, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(turkishSafeText('4. 8D METODOLOJI ADIMLARI'), margin + 5, currentY + 8);
      currentY += 12;

      // Tablo başlıkları
      doc.setFillColor(156, 39, 176);
      doc.rect(margin, currentY, pageWidth - 2 * margin, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(turkishSafeText('8D ADIMI'), margin + 5, currentY + 7);
      doc.text(turkishSafeText('AÇIKLAMA VE DETAYLAR'), margin + 60, currentY + 7);
      currentY += 10;

      // 8D Adımları tablosu
      const d8StepsRows = [
        [turkishSafeText('D1 - Takım Kurma'), turkishSafeText(record.d8Steps.d1_team || 'Belirtilmemiş')],
        [turkishSafeText('D2 - Problemi Tanımlama'), turkishSafeText(record.d8Steps.d2_problem || 'Belirtilmemiş')],
        [turkishSafeText('D3 - Geçici Önlemler'), turkishSafeText(record.d8Steps.d3_containment || 'Belirtilmemiş')],
        [turkishSafeText('D4 - Kök Neden Analizi'), turkishSafeText(record.d8Steps.d4_rootCause || 'Belirtilmemiş')],
        [turkishSafeText('D5 - Kalıcı Düzeltici Faaliyetler'), turkishSafeText(record.d8Steps.d5_permanentAction || 'Belirtilmemiş')],
        [turkishSafeText('D6 - Uygulama ve Doğrulama'), turkishSafeText(record.d8Steps.d6_implementation || 'Belirtilmemiş')],
        [turkishSafeText('D7 - Önleyici Faaliyetler'), turkishSafeText(record.d8Steps.d7_prevention || 'Belirtilmemiş')],
        [turkishSafeText('D8 - Takım ve Başarının Tanınması'), turkishSafeText(record.d8Steps.d8_recognition || 'Belirtilmemiş')]
      ];

      d8StepsRows.forEach((row, index) => {
        const isEven = index % 2 === 0;
        const bgColor = isEven ? [248, 249, 250] : [255, 255, 255];
        const rowHeight = Math.max(12, Math.min(20, row[1].length / 8)); // Dinamik yükseklik
        
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(margin, currentY, pageWidth - 2 * margin, rowHeight, 'F');
        
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, currentY, pageWidth - 2 * margin, rowHeight);
        
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(row[0], margin + 3, currentY + 8);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        // Uzun metinleri böl
        const splitText = doc.splitTextToSize(row[1], pageWidth - margin - 65);
        doc.text(splitText, margin + 60, currentY + 8);
        
        currentY += rowHeight;
      });
      
      currentY += 10;
    }
    
    // ============================================
    // ⚡ AKSİYON PLANI
    // ============================================
    
    if (record.actions && record.actions.length > 0) {
      // Yeni sayfa kontrolü
      if (currentY > pageHeight - 80) {
        doc.addPage();
        currentY = margin;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 81, 143);
      doc.text(turkishSafeText('AKSIYON PLANI'), margin, currentY);
      currentY += 10;
      
      const actionsData = record.actions.map(action => [
        turkishSafeText(action.description),
        turkishSafeText(action.responsible),
        new Date(action.dueDate).toLocaleDateString('tr-TR'),
        action.status === 'completed' ? turkishSafeText('Tamamlandi') : turkishSafeText('Beklemede'),
        action.completedDate ? new Date(action.completedDate).toLocaleDateString('tr-TR') : '-'
      ]);

      // @ts-ignore
      doc.autoTable({
        startY: currentY,
        head: [[turkishSafeText('Aksiyon'), turkishSafeText('Sorumlu'), turkishSafeText('Son Tarih'), turkishSafeText('Durum'), turkishSafeText('Tamamlanma')]],
        body: actionsData,
        theme: 'grid',
        headStyles: {
          fillColor: [255, 152, 0],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 }
        },
        margin: { left: margin, right: margin }
      });

      // @ts-ignore
      currentY = doc.lastAutoTable.finalY + 10;
    }
    
    // ============================================
    // 📎 EKLER LİSTESİ
    // ============================================
    
    if (record.attachments && record.attachments.length > 0) {
      // Yeni sayfa kontrolü
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = margin;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 81, 143);
      doc.text(turkishSafeText('EKLER'), margin, currentY);
      currentY += 10;
      
      const attachmentsData = record.attachments.map((attachment, index) => [
        (index + 1).toString(),
        turkishSafeText(attachment.name),
        (attachment.size / 1024).toFixed(1) + ' KB',
        new Date(attachment.uploadDate).toLocaleDateString('tr-TR')
      ]);

      // @ts-ignore
      doc.autoTable({
        startY: currentY,
        head: [[turkishSafeText('#'), turkishSafeText('Dosya Adi'), turkishSafeText('Boyut'), turkishSafeText('Yuklenme Tarihi')]],
        body: attachmentsData,
        theme: 'striped',
        headStyles: {
          fillColor: [76, 175, 80],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3
        },
        margin: { left: margin, right: margin }
      });

      // @ts-ignore
      currentY = doc.lastAutoTable.finalY + 10;
    }
    
    // ============================================
    // ✍️ İMZA VE ONAY BÖLÜMÜ - YENİ TASARIM
    // ============================================
    
    // Yeni sayfa kontrolü
    if (currentY > pageHeight - 120) {
      doc.addPage();
      currentY = margin;
    }
    
    // Başlık bölümü
    doc.setFillColor(52, 73, 94); // Daha profesyonel koyu mavi
    doc.rect(margin, currentY, pageWidth - 2 * margin, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(turkishSafeText('5. İMZA VE ONAY BÖLÜMÜ'), margin + 5, currentY + 10);
    currentY += 20;
    
    // İmza tablosu daha geniş ve net
    const signatureTableWidth = pageWidth - 2 * margin;
    const signatureColWidth = signatureTableWidth / 3;
    const signatureRowHeight = 55; // Daha yüksek
    
    // Başlık satırı - gradient effect
    doc.setFillColor(70, 130, 180); // Steel blue
    doc.rect(margin, currentY, signatureTableWidth, 12, 'F');
    
    // Başlık metinleri
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    
    // Ortalanmış başlıklar
    const preparerText = turkishSafeText('HAZIRLAYAN');
    const checkerText = turkishSafeText('KONTROL EDEN');
    const approverText = turkishSafeText('ONAYLAYAN');
    
    const preparerWidth = doc.getTextWidth(preparerText);
    const checkerWidth = doc.getTextWidth(checkerText);
    const approverWidth = doc.getTextWidth(approverText);
    
    doc.text(preparerText, margin + (signatureColWidth - preparerWidth) / 2, currentY + 8);
    doc.text(checkerText, margin + signatureColWidth + (signatureColWidth - checkerWidth) / 2, currentY + 8);
    doc.text(approverText, margin + 2 * signatureColWidth + (signatureColWidth - approverWidth) / 2, currentY + 8);
    
    currentY += 12;
    
    // İmza alanları çerçeveleri
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.setFillColor(250, 250, 250); // Çok açık gri background
    
    // HAZIRLAYAN kolonu
    doc.rect(margin, currentY, signatureColWidth, signatureRowHeight, 'FD');
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Satır çizgileri
    doc.setDrawColor(200, 200, 200);
    doc.line(margin + 5, currentY + 18, margin + signatureColWidth - 5, currentY + 18);
    doc.line(margin + 5, currentY + 35, margin + signatureColWidth - 5, currentY + 35);
    
    doc.text(turkishSafeText('Ad Soyad:'), margin + 8, currentY + 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(turkishSafeText('Atakan Battal'), margin + 8, currentY + 25);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(turkishSafeText('Tarih:'), margin + 8, currentY + 40);
    
    // KONTROL EDEN kolonu - SİYAH KUTU SORUNU DÜZELTİLDİ
    doc.setFillColor(250, 250, 250); // Açık gri background
    doc.setDrawColor(100, 100, 100); // Gri border
    doc.rect(margin + signatureColWidth, currentY, signatureColWidth, signatureRowHeight, 'FD');
    
    // Satır çizgileri
    doc.setDrawColor(200, 200, 200);
    doc.line(margin + signatureColWidth + 5, currentY + 18, margin + 2 * signatureColWidth - 5, currentY + 18);
    doc.line(margin + signatureColWidth + 5, currentY + 35, margin + 2 * signatureColWidth - 5, currentY + 35);
    
    doc.setTextColor(0, 0, 0); // Siyah yazı
    doc.text(turkishSafeText('Ad Soyad:'), margin + signatureColWidth + 8, currentY + 12);
    doc.text(turkishSafeText('Tarih:'), margin + signatureColWidth + 8, currentY + 40);
    
    // ONAYLAYAN kolonu - SİYAH KUTU SORUNU DÜZELTİLDİ
    doc.setFillColor(250, 250, 250); // Açık gri background
    doc.setDrawColor(100, 100, 100); // Gri border
    doc.rect(margin + 2 * signatureColWidth, currentY, signatureColWidth, signatureRowHeight, 'FD');
    
    // Satır çizgileri
    doc.setDrawColor(200, 200, 200);
    doc.line(margin + 2 * signatureColWidth + 5, currentY + 18, margin + signatureTableWidth - 5, currentY + 18);
    doc.line(margin + 2 * signatureColWidth + 5, currentY + 35, margin + signatureTableWidth - 5, currentY + 35);
    
    doc.setTextColor(0, 0, 0); // Siyah yazı
    doc.text(turkishSafeText('Ad Soyad:'), margin + 2 * signatureColWidth + 8, currentY + 12);
    doc.text(turkishSafeText('Tarih:'), margin + 2 * signatureColWidth + 8, currentY + 40);
    
    currentY += signatureRowHeight + 15;
    
    // Ek bilgi notu
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(turkishSafeText('Not: Bu belge elektronik ortamda oluşturulmuş ve dijital imza ile geçerlidir.'), margin, currentY + 5);
    
    currentY += 15;
    
    // ============================================
    // 📜 FOOTER - SAYFA NUMARASI VE TARİH
    // ============================================
    
    const addFooter = () => {
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        
        // Footer çizgisi
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        // Sol alt - sistem bilgisi
        doc.text(turkishSafeText('KADEME A.Ş. Kalite Yönetim Sistemi'), margin, pageHeight - 10);
        
        // Sağ alt - sayfa numarası
        const pageText = turkishSafeText(`Sayfa ${i} / ${pageCount}`);
        const pageTextWidth = doc.getTextWidth(pageText);
        doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 10);
        
        // Orta alt - yazdırma tarihi
        const printText = turkishSafeText(`Yazdırma: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`);
        const printTextWidth = doc.getTextWidth(printText);
        doc.text(printText, (pageWidth - printTextWidth) / 2, pageHeight - 10);
      }
    };
    
    addFooter();
    
    // ============================================
    // 💾 PDF KAYDETME
    // ============================================
    
    // Güvenli dosya adı oluşturma (Türkçe karakterleri koruyarak)
    const createSafeFileName = (text: string): string => {
      return text
        .replace(/[<>:"/\\|?*]/g, '') // Sadece Windows/Mac'te yasaklı karakterleri kaldır
        .replace(/\s+/g, '_')
        .substring(0, 50) // Maksimum 50 karakter
        .trim();
    };
    
    const safeTitle = createSafeFileName(record.title || 'DÖF');
    const safeDOFNumber = createSafeFileName(record.dofNumber || 'NO');
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `DÖF_${safeDOFNumber}_${safeTitle}_${currentDate}.pdf`;
    
    doc.save(fileName);
    
    console.log('✅ PDF başarıyla oluşturuldu:', fileName);
    
  } catch (error) {
    console.error('❌ PDF oluşturma hatası:', error);
    alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz.');
  }
};

// ✅ Styled Components
const MetricCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  border: '1px solid',
  borderColor: theme.palette.divider,
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
    borderColor: theme.palette.primary.main,
  }
}));

const DOF8DManagement: React.FC = () => {
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
  const [activeTab, setActiveTab] = useState(0);
  const [expanded, setExpanded] = useState<string | false>('panel1');
  const [filters, setFilters] = useState<FilterState>({
    department: '',
    status: '',
    type: '',
    searchTerm: '',
    year: '',
    month: '',
    delayStatus: '',
    priority: '',
  });

  // ✅ Yeni State'ler - Gelişmiş Özellikler İçin

  // ✅ Dialog Management States
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRecord, setSelectedRecord] = useState<DOFRecord | null>(null);
  const [formData, setFormData] = useState<any>({
    type: 'corrective',
    title: '',
    description: '',
    department: '',
    responsible: '',
    priority: 'medium',
    status: 'open',
    openingDate: new Date().toISOString().split('T')[0], // ✅ Açılış tarihi default olarak bugün
    dueDate: '',
    rootCause: '',
    rejectionReason: '', // ✅ Red nedeni alanı
    mdiNumber: '', // ✅ MDİ numarası alanı
    actions: [],
    attachments: [],
    d8Steps: {
      d1_team: '',
      d2_problem: '',
      d3_containment: '',
      d4_rootCause: '',
      d5_permanentAction: '',
      d6_implementation: '',
      d7_prevention: '',
      d8_recognition: ''
    },
    d8Progress: 0
  });

  // Context7 - 8D Accordion Management
  const [d8AccordionStates, setD8AccordionStates] = useState<{[key: string]: boolean}>({
    'd1': true, // İlk panel açık başlasın
    'd2': false,
    'd3': false,
    'd4': false,
    'd5': false,
    'd6': false,
    'd7': false,
    'd8': false
  });

  // ✅ Kaynak modülden gelen prefill verilerini kontrol et
  const [hasPrefillData, setHasPrefillData] = useState(false);
  
  const [previewDOFNumber, setPreviewDOFNumber] = useState<string>('');

  // ✅ DÖF Kapatma Modal State'leri
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [selectedRecordForClose, setSelectedRecordForClose] = useState<DOFRecord | null>(null);
  const [closureData, setClosureData] = useState({
    closedDate: new Date().toISOString().split('T')[0],
    closeReason: 'completed',
    closureNotes: ''
  });

  
  // Context7 - ENHANCED: Güvenli ve Akıllı Veri Yönetimi Sistemi
  const [dofRecords, setDofRecords] = useState<DOFRecord[]>(() => {
    console.log('🚀 Context7 - DÖF Veri Yönetimi Başlatılıyor...');
    
    try {
      const storedRecords = localStorage.getItem('dofRecords');
      console.log('🔍 Context7 - LocalStorage kontrolü:', storedRecords ? 'Veri mevcut' : 'Veri yok');
      
      if (storedRecords && storedRecords.trim().length > 0) {
        const parsedRecords = JSON.parse(storedRecords) as DOFRecord[];
        console.log('📊 Context7 - Parse edilen kayıt sayısı:', parsedRecords.length);
        
        // Context7 - KULLANICI KORUMA: Sadece kesin sample data'ları filtrele
        const userCreatedRecords = parsedRecords.filter(record => {
          // SADECE ÇOK SPESİFİK VE KESİN SAMPLE DATA TESPİTİ
          const isDefinitelySampleData = 
            // Sadece metadata flag'li kayıtlar
            (record.metadata && (
              record.metadata.cleanupDate ||
              record.metadata.cleanupVersion ||
              record.metadata.isSampleData === true ||
              record.metadata.isTestData === true
            )) ||
            
            // Sadece kesin test ID'leri
            record.id?.includes('SAMPLE') ||
            record.id?.includes('TEST') ||
            record.id?.includes('EXAMPLE') ||
            record.id?.includes('DEMO') ||
            
            // Sadece test user'ları (tam eşleşme)
            record.responsible === 'Test User' ||
            record.responsible === 'Sample User' ||
            record.responsible === 'Demo User';
          
          if (isDefinitelySampleData) {
            console.log('🚫 Context7 - Kesin sample data reddedildi:', record.id);
            return false;
          }
          
          // Temel zorunlu alanları kontrol et (çok minimal)
          if (!record || !record.id) {
            console.warn('⚠️ Context7 - Eksik ID olan kayıt silindi:', record?.id || 'NO-ID');
            return false;
          }
          
          // KULLANICI KORUMA: Gerçek verileri koru
          console.log('🛡️ Context7 - Gerçek kullanıcı verisi korundu:', record.id);
          return true;
        });
        
        console.log('🧹 Context7 - Temizlik sonrası kalan kayıt sayısı:', userCreatedRecords.length);
        
        if (userCreatedRecords.length > 0) {
          // Context7 - GÜÇLÜ VERİ VALİDASYONU VE TEMİZLEME
          const currentDate = new Date().toISOString().split('T')[0];
          
          const validatedRecords = userCreatedRecords
            .map(record => {
              // Context7 - Kayıt güçlendirme ve normalizasyon
              const enhancedRecord = {
                ...record,
                // Zorunlu alanları garanti et
                actions: Array.isArray(record.actions) ? record.actions : [],
                attachments: Array.isArray(record.attachments) ? record.attachments : [],
                history: Array.isArray(record.history) ? record.history : [],
                dofNumber: record.dofNumber || `DOF-${record.id}`,
                metadata: record.metadata || {},
                
                // Context7 - Gerçek zamanlı hesaplamalar
                remainingDays: record.dueDate ? calculateRemainingDays(record.dueDate) : 0,
                delayStatus: (record.dueDate && record.status) ? getDelayStatus(record.dueDate, record.status) : 'on_time',
                
                // Context7 - Veri bütünlüğü kontrolleri
                createdDate: record.createdDate || currentDate,
                status: record.status || 'open',
                priority: record.priority || 'medium'
              };
              
              console.log('✅ Context7 - Kullanıcı kaydı güçlendirildi:', {
                id: enhancedRecord.id,
                dofNumber: enhancedRecord.dofNumber,
                status: enhancedRecord.status,
                remainingDays: enhancedRecord.remainingDays
              });
              
              return enhancedRecord;
            })
            .sort((a, b) => {
              // Context7 - En yeni kayıtlar üstte
              return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
            });

          console.log('✅ Context7 - Başarıyla yüklenen kullanıcı kayıt sayısı:', validatedRecords.length);
          console.log('📈 Context7 - Durum dağılımı:', {
            total: validatedRecords.length,
            open: validatedRecords.filter(r => r.status !== 'closed').length,
            closed: validatedRecords.filter(r => r.status === 'closed').length,
            overdue: validatedRecords.filter(r => r.delayStatus === 'overdue').length
          });
          
          // 🔍 TÜR DAĞILIMI DEBUG
          const typeCount = validatedRecords.reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
          }, {} as any);
          console.log('🔍 DÖF Tür Dağılımı Debug:', typeCount);
          console.log('📊 DÖF Tür Detay:', validatedRecords.map(r => ({ 
            id: r.id.substring(0, 15), 
            type: r.type, 
            title: r.title?.substring(0, 30) 
          })));
          
          // Context7 - Temizlenmiş veriyi kaydet
          localStorage.setItem('dofRecords', JSON.stringify(validatedRecords));
          console.log('💾 Context7 - Temizlenmiş veri localStorage\'a kaydedildi');
          
          return validatedRecords;
        }
      }
    } catch (error) {
      console.error('❌ Context7 - LocalStorage okuma hatası:', error);
      // Bozuk veriyi temizle
      localStorage.removeItem('dofRecords');
      console.log('🧹 Context7 - Bozuk veri temizlendi');
    }
    
    console.log('📝 Context7 - Temiz sistem başlatıldı (örnek kayıtlar temizlendi)');
    return [];
  });

  // ✅ localStorage değişikliklerini izle (QualityCostManagement'tan gelen yeni kayıtlar için)
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 localStorage değişikliği tespit edildi, DOF kayıtları yeniden yükleniyor...');
      try {
        const storedRecords = localStorage.getItem('dofRecords');
        if (storedRecords) {
          const parsedRecords = JSON.parse(storedRecords) as DOFRecord[];
          console.log('📊 Yeni DOF kayıt sayısı:', parsedRecords.length);
          setDofRecords(parsedRecords);
        }
      } catch (error) {
        console.error('❌ localStorage değişikliği işlenirken hata:', error);
      }
    };

    // localStorage event listener ekle
    window.addEventListener('storage', handleStorageChange);
    
    // Component unmount olduğunda temizle
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ✅ Periyodik localStorage kontrolü (QualityCostManagement'tan gelen kayıtları yakalamak için)
  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        const storedRecords = localStorage.getItem('dofRecords');
        if (storedRecords) {
          const parsedRecords = JSON.parse(storedRecords) as DOFRecord[];
          if (parsedRecords.length !== dofRecords.length) {
            console.log('🔄 Periyodik kontrol: Yeni DOF kayıtları tespit edildi');
            setDofRecords(parsedRecords);
          }
        }
      } catch (error) {
        console.error('❌ Periyodik localStorage kontrolü hatası:', error);
      }
    }, 2000); // Her 2 saniyede bir kontrol et

    return () => clearInterval(intervalId);
  }, [dofRecords.length]);

  // ✅ Kaynak modülden prefill verilerini kontrol et ve otomatik form açma
  useEffect(() => {
    const checkPrefillData = () => {
      try {
        const prefillData = localStorage.getItem('dof-form-prefill');
        const autoOpenForm = localStorage.getItem('dof-auto-open-form');
        
        if (prefillData && autoOpenForm === 'true') {
          console.log('🎯 DÖF Prefill verisi bulundu, form açılıyor...');
          const parsedData = JSON.parse(prefillData);
          
          // Güvenli veri erişimi
          const prefill = parsedData.prefillData || parsedData;
          
          // Form verilerini doldur
          setFormData(prevFormData => ({
            ...prevFormData,
            title: prefill.title || `${prefill.department || 'Bilinmiyor'} - Uygunsuzluk`,
            description: prefill.description || prefill.issueDescription || 'Uygunsuzluk tespit edildi',
            department: prefill.department || 'Genel',
            responsible: prefill.responsible || 'Belirtilmemiş',
            priority: prefill.priority || 'medium',
            type: prefill.type || prefill.suggestedType || 'corrective',
            status: 'open',
            openingDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 gün sonra
            rootCause: prefill.rootCause || 'Araştırılacak',
          }));



          // Dialog'u aç
          setDialogMode('create');
          setSelectedRecord(null);
          setOpenDialog(true);
          setHasPrefillData(true);
          
          // Prefill verisini ve auto-open flag'ini temizle
          localStorage.removeItem('dof-form-prefill');
          localStorage.removeItem('dof-auto-open-form');
          
          console.log('✅ DÖF formu prefill verileriyle açıldı');
        }
      } catch (error) {
        console.error('❌ Prefill veri okuma hatası:', error);
        localStorage.removeItem('dof-form-prefill');
        localStorage.removeItem('dof-auto-open-form');
      }
    };

    checkPrefillData();
  }, []);

  // ✅ SÜREKLI PREFILL KONTROL SİSTEMİ - localStorage değişikliklerini izle
  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        const prefillData = localStorage.getItem('dof-form-prefill');
        const autoOpenForm = localStorage.getItem('dof-auto-open-form');
        
        // Eğer form zaten açık değilse ve prefill verisi varsa
        if (prefillData && autoOpenForm === 'true' && !openDialog) {
          console.log('🔄 Periyodik kontrol: Yeni prefill verisi tespit edildi, form açılıyor...');
          const parsedData = JSON.parse(prefillData);
          
          // Güvenli veri erişimi
          const prefill = parsedData.prefillData || parsedData;
          
          // Form verilerini doldur
          setFormData({
            title: prefill.title || `${prefill.department || 'Bilinmiyor'} - Uygunsuzluk`,
            description: prefill.description || prefill.issueDescription || 'Uygunsuzluk tespit edildi',
            department: prefill.department || 'Genel',
            responsible: prefill.responsible || 'Belirtilmemiş',
            priority: prefill.priority || 'medium',
            type: prefill.type || prefill.suggestedType || 'corrective',
            status: 'open',
            openingDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            rootCause: prefill.rootCause || 'Araştırılacak',
            rejectionReason: '',
            mdiNumber: '',
            actions: [],
            attachments: []
          });

          // Dialog'u aç
          setDialogMode('create');
          setSelectedRecord(null);
          setOpenDialog(true);
          setHasPrefillData(true);
          
          // Prefill verisini ve auto-open flag'ini temizle
          localStorage.removeItem('dof-form-prefill');
          localStorage.removeItem('dof-auto-open-form');
          
          console.log('✅ Periyodik kontrol: DÖF formu prefill verileriyle açıldı');
        }
      } catch (error) {
        console.error('❌ Periyodik prefill kontrol hatası:', error);
        localStorage.removeItem('dof-form-prefill');
        localStorage.removeItem('dof-auto-open-form');
      }
    }, 1000); // Her 1 saniyede bir kontrol et

    return () => clearInterval(intervalId);
  }, [openDialog]); // openDialog değiştiğinde yeniden başlat

  // Context7 - ENHANCED: Akıllı ve Güvenli Veri Kaydetme Sistemi
  const saveToContext7 = useCallback((records: DOFRecord[]) => {
    try {
      console.log('💾 Context7 - Veri kaydetme başlatılıyor...', records.length, 'kayıt');
      
      // Context7 - Veri kalitesi kontrolü
      const qualityRecords = records.filter(record => {
        const isValid = record && 
          record.id && 
          record.title && 
          record.department &&
          record.status &&
          record.createdDate;
          
        if (!isValid) {
          console.warn('⚠️ Context7 - Kalitesi düşük kayıt atlandı:', record?.id || 'NO-ID');
        }
        return isValid;
      });
      
      // Context7 - En son 100 kaydı sakla (performans için)
      const optimizedRecords = qualityRecords
        .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
        .slice(0, 100);
      
      const dataToSave = JSON.stringify(optimizedRecords, null, 0);
      
      // Context7 - LocalStorage boyut kontrolü
      if (dataToSave.length > 5 * 1024 * 1024) { // 5MB limit
        console.warn('⚠️ Context7 - Veri boyutu çok büyük, en son 50 kayıt saklanacak');
        const reducedRecords = optimizedRecords.slice(0, 50);
        localStorage.setItem('dofRecords', JSON.stringify(reducedRecords));
        console.log('✅ Context7 - Optimize edilmiş veri kaydedildi:', reducedRecords.length, 'kayıt');
      } else {
        localStorage.setItem('dofRecords', dataToSave);
        console.log('✅ Context7 - Tam veri kaydedildi:', optimizedRecords.length, 'kayıt');
      }
      
      // Context7 - Kaydetme timestamp'i
      localStorage.setItem('dofRecords_timestamp', new Date().toISOString());
      
    } catch (error) {
      console.error('❌ Context7 - Veri kaydetme hatası:', error);
      
      // Context7 - Hata durumunda yedek kaydetme
      if (error.name === 'QuotaExceededError') {
        console.log('🔄 Context7 - LocalStorage dolu, acil temizlik yapılıyor...');
        
        // Diğer uygulamaların verilerini temizle
        const keysToKeep = ['dofRecords', 'dofRecords_timestamp'];
        Object.keys(localStorage).forEach(key => {
          if (!keysToKeep.includes(key)) {
            localStorage.removeItem(key);
          }
        });
        
        // En kritik kayıtları sakla
        const criticalRecords = records
          .filter(r => r.status !== 'closed' || r.priority === 'critical')
          .slice(0, 20);
          
        try {
          localStorage.setItem('dofRecords', JSON.stringify(criticalRecords));
          console.log('✅ Context7 - Kritik veriler kaydedildi:', criticalRecords.length, 'kayıt');
        } catch (finalError) {
          console.error('❌ Context7 - Kritik veri kaydetme de başarısız:', finalError);
        }
      }
    }
  }, []);

  // ✅ NUMARA ÜRETİM FONKSİYONU (Component seviyesinde)
  const generateUniqueNumber = useCallback((prefix: string, existingRecords: DOFRecord[]) => {
    const currentYear = new Date().getFullYear();
    // Mevcut numaraları topla (hem localStorage hem de state'ten)
    const allExistingNumbers = new Set<number>();
    
    // State'teki kayıtları kontrol et
    existingRecords
      .filter(r => r.dofNumber?.startsWith(`${prefix}-${currentYear}`))
      .forEach(r => {
        const match = r.dofNumber?.match(new RegExp(`${prefix}-\\d{4}-(\\d{3})`));
        if (match) {
          allExistingNumbers.add(parseInt(match[1]));
        }
      });
    
    // localStorage'daki kayıtları da kontrol et (çifte güvenlik)
    try {
      const storedRecords = localStorage.getItem('dofRecords');
      if (storedRecords) {
        const parsedRecords = JSON.parse(storedRecords) as DOFRecord[];
        parsedRecords
          .filter(r => r.dofNumber?.startsWith(`${prefix}-${currentYear}`))
          .forEach(r => {
            const match = r.dofNumber?.match(new RegExp(`${prefix}-\\d{4}-(\\d{3})`));
            if (match) {
              allExistingNumbers.add(parseInt(match[1]));
            }
          });
      }
    } catch (error) {
      console.warn('⚠️ localStorage okuma hatası:', error);
    }
    
    // Sıradaki benzersiz numarayı bul
    let nextNumber = 1;
    while (allExistingNumbers.has(nextNumber)) {
      nextNumber++;
    }
    
    return `${prefix}-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
  }, []);

  // ✅ NUMARA ÖNİZLEME FONKSİYONU
  const updatePreviewNumber = useCallback(() => {
    if (dialogMode === 'create') {
      if (formData.type === 'mdi' && formData.mdiNumber?.trim()) {
        // MDİ türü ve manuel numara girilmişse onu göster
        setPreviewDOFNumber(formData.mdiNumber.trim());
      } else if (formData.type === 'mdi') {
        // MDİ türü ama numara girilmemişse uyarı
        setPreviewDOFNumber('MDİ numarası giriniz');
      } else {
        // Normal DÖF/8D numarası üret
        const prefix = formData.type === '8d' ? '8D' : 'DÖF';
        const generatedNumber = generateUniqueNumber(prefix, dofRecords);
        setPreviewDOFNumber(generatedNumber);
      }
    } else {
      // Edit/View modunda mevcut numarayı göster
      setPreviewDOFNumber(formData.dofNumber || '');
    }
  }, [dialogMode, formData.type, formData.mdiNumber, formData.dofNumber, generateUniqueNumber, dofRecords]);

  // ✅ Form değişikliklerinde numara önizlemesini güncelle
  useEffect(() => {
    updatePreviewNumber();
  }, [updatePreviewNumber]);

  // ✅ Açılış tarihi migration - mevcut kayıtlarda eksik olanları düzelt
  useEffect(() => {
    const migrateOpeningDates = () => {
      console.log('🔧 Açılış tarihi migration başlatılıyor...');
      
      let migrationNeeded = false;
      const updatedRecords = dofRecords.map(record => {
        // Açılış tarihi eksikse createdDate'i kullan
        if (!record.openingDate) {
          console.log(`📅 ${record.dofNumber}: Açılış tarihi eksik, createdDate kullanılıyor`);
          migrationNeeded = true;
          return {
            ...record,
            openingDate: record.createdDate || new Date().toISOString().split('T')[0]
          };
        }
        return record;
      });

      if (migrationNeeded) {
        console.log('✅ Açılış tarihi migration tamamlandı, localStorage güncellenecek');
        setDofRecords(updatedRecords);
        localStorage.setItem('dofRecords', JSON.stringify(updatedRecords));
      } else {
        console.log('📊 Tüm kayıtlarda açılış tarihi mevcut, migration gerekmiyor');
      }
    };

    if (dofRecords.length > 0) {
      migrateOpeningDates();
    }
  }, []); // Sadece component ilk mount olduğunda çalışsın

  // Context7 - Optimized veri kaydetme (5 saniye debounce - performans için)
  useEffect(() => {
    if (dofRecords && dofRecords.length > 0) {
      const saveTimeout = setTimeout(() => {
        try {
          saveToContext7(dofRecords);
        } catch (error) {
          console.error('⚠️ Context7 - Save error:', error);
        }
      }, 5000); // ✅ 1→5 saniye - performans optimizasyonu

      return () => clearTimeout(saveTimeout);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dofRecords]); // ✅ saveToContext7'yi dependency'den çıkardım - circular dependency önleme

  // Context7 - Department migration devre dışı - performans için
  // useEffect(() => {
  //   updateExistingDepartments();
  // }, []);

  // Context7 - Smart Root Cause Migration (only runs when needed)
  const migrateRootCausesToCategories = useCallback(() => {
    console.log('🔄 Context7 - Starting root cause categorization migration');
    
    setDofRecords(prevRecords => {
      // Context7 - Check if migration is actually needed
      const needsMigration = prevRecords.some(record => 
        record.rootCause && 
        record.rootCause.trim().length > 0 && 
        !record.metadata?.rootCauseCategory
      );

      if (!needsMigration) {
        console.log('✅ Context7 - Migration not needed, all records already categorized');
        return prevRecords;
      }

      const updatedRecords = prevRecords.map(record => {
        // Context7 - Skip if already migrated
        if (record.metadata?.rootCauseCategory) {
          return record;
        }

        if (record.rootCause && record.rootCause.trim().length > 0) {
          const match = findBestRootCauseCategory(record.rootCause);
          
          // Context7 - Only update metadata, don't change original rootCause
          if (match.confidence > 20) {
            return {
              ...record,
              metadata: {
                ...record.metadata,
                rootCauseCategory: match.category,
                migrationConfidence: match.confidence,
                migrationDate: new Date().toISOString() // Context7 - Track when migration happened
              }
            };
          }
        }
        
        return record;
      });
      
      console.log('✅ Context7 - Root cause categorization migration completed');
      return updatedRecords;
    });
  }, []);

  // Context7 - Disable heavy migration for performance
  // Migration devre dışı - performans için

  // Context7 - Professional Enhanced Metrics Calculation
  const metrics = useMemo(() => {
    // Context7 - Filter records for LIST DISPLAY (includes closed records)
    const filteredRecords = dofRecords.filter(record => {
      if (filters.department && record.department !== filters.department) return false;
      // Context7 - CRITICAL: Only filter by status if user specifically selected a status
      // This ensures closed records remain visible unless explicitly filtered out
      if (filters.status && record.status !== filters.status) return false;
      if (filters.type && record.type !== filters.type) return false;
      // ✅ Basitleştirilmiş arama - performans için
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const mainText = `${record.title} ${record.description} ${record.dofNumber} ${record.department} ${record.responsible}`.toLowerCase();
        if (!mainText.includes(searchLower)) return false;
      }
      if (filters.year && !record.createdDate.startsWith(filters.year)) return false;
      if (filters.month && record.createdDate.split('-')[1] !== filters.month) return false;
      return true; // Context7 - Show ALL records including closed ones by default
    });

    // Basic metrics from filtered records
    const total = filteredRecords.length; // Total from filtered records
    const open = filteredRecords.filter(r => r.status !== 'closed').length;
    const closed = filteredRecords.filter(r => r.status === 'closed').length;
    const critical = filteredRecords.filter(r => r.priority === 'critical').length;
    
    // Context7 - Accurate overdue calculation from filtered records
    const overdue = filteredRecords.filter(r => {
      if (r.status === 'closed') return false;
      const dueDate = new Date(r.dueDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      return dueDate < today;
    }).length;

    const closureRate = total > 0 ? Math.round((closed / total) * 100 * 10) / 10 : 0; // Round to 1 decimal

    // Context7 - CONSISTENT: Dynamic status distribution (use filtered records for consistency)
    const statusDistribution = STATUS_OPTIONS.map(status => ({
      name: status.label,
      value: filteredRecords.filter(r => r.status === status.value).length,
      color: status.color
    }));

    // Context7 - CONSISTENT: Dynamic type distribution (use filtered records for consistency)
    const typeDistribution = DOF_TYPES.map(type => ({
      name: type.label,
      value: filteredRecords.filter(r => r.type === type.value).length,
      color: type.color
    }));
    
    // Debug console kaldırıldı - performans için



    // Context7 - CONSISTENT: Dynamic 6-month trend calculation (uses filtered records for consistency)
    const monthlyTrend = (() => {
      const months = [];
      
      // 2025 için Ocak-Haziran aylarını göster
      for (let month = 1; month <= 6; month++) {
        const year = 2025;
        
        // Records opened in this month from filtered records (for consistency with other charts)
        const monthRecords = filteredRecords.filter(r => {
          // ✅ DÜZELTME: Açılış tarihi kullan (createdDate değil!)
          if (!r.openingDate) return false;
          const recordDate = new Date(r.openingDate);
          return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month;
        });
        
        // Records closed in this month from filtered records (for consistency with other charts)
        const monthClosedRecords = filteredRecords.filter(r => {
          if (!r.closedDate) return false;
          const closedDate = new Date(r.closedDate);
          return closedDate.getFullYear() === year && closedDate.getMonth() + 1 === month;
        });
        
        const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'];
        
        months.push({
          month: monthNames[month - 1],
          opened: monthRecords.length,
          closed: monthClosedRecords.length,
          year: year,
          monthNum: month
        });
      }
      
      return months;
    })();



    return {
      total,
      open,
      closed,
      overdue,
      critical,
      closureRate,
      statusDistribution,
      typeDistribution,
      filteredRecords, // This is for list filtering
      monthlyTrend
    };
  }, [dofRecords, filters]);

  // ✅ Context7 - Optimized Delay Message Function
  const getDelayMessage = useCallback((remainingDays: number, status: string): string => {
    if (status === 'closed') return 'Kapalı';
    if (remainingDays < 0) return `${Math.abs(remainingDays)} gün gecikti`;
    if (remainingDays === 0) return 'Bugün son gün';
    if (remainingDays <= 3) return `${remainingDays} gün kaldı`;
    return `${remainingDays} gün var`;
  }, []);



  // Context7 - Safe Enhanced Filtered Records
  const enhancedFilteredRecords = useMemo(() => {
    // Context7 - Safe array handling
    if (!metrics.filteredRecords || !Array.isArray(metrics.filteredRecords)) {
      return [];
    }

    return metrics.filteredRecords
      .filter(record => {
        // Context7 - Null check for record
        if (!record) return false;
        
        // Gecikme durumu filtresi
        if (filters.delayStatus && record.dueDate && record.status) {
          const delayStatus = getDelayStatus(record.dueDate, record.status);
          if (filters.delayStatus !== delayStatus) return false;
        }
        
        // Öncelik filtresi
        if (filters.priority && record.priority !== filters.priority) return false;
        
        return true;
      })
      .map(record => {
        // Context7 - Safe record mapping with defaults
        if (!record) return null;
        
        try {
          return {
            ...record,
            // Ensure required fields have defaults
            history: record.history || [],
            actions: record.actions || [],
            attachments: record.attachments || [],
            remainingDays: record.dueDate ? calculateRemainingDays(record.dueDate) : 0,
            delayStatus: (record.dueDate && record.status) ? getDelayStatus(record.dueDate, record.status) : 'on_time',
            delayMessage: (record.dueDate && record.status) ? getDelayMessage(
              record.dueDate ? calculateRemainingDays(record.dueDate) : 0, 
              record.status
            ) : 'Veri eksik'
          };
        } catch (error) {
          console.warn('Record mapping error:', error, record);
          return null;
        }
      })
      .filter(Boolean) // Context7 - Remove null records
      .sort((a, b) => {
        // Context7 - Safe sorting with null checks
        if (!a || !b) return 0;
        
        // DÖF numarasına göre sıralama (DÖF-2025-001, DÖF-2025-002, 8D-2025-001, vb.)
        const aDofNumber = a.dofNumber || '';
        const bDofNumber = b.dofNumber || '';
        
        // Önce tür bazında sıralama (8D, DÖF, MDİ)
        const aType = aDofNumber.startsWith('8D-') ? '1' : aDofNumber.startsWith('DÖF-') ? '2' : '3';
        const bType = bDofNumber.startsWith('8D-') ? '1' : bDofNumber.startsWith('DÖF-') ? '2' : '3';
        
        if (aType !== bType) {
          return aType.localeCompare(bType);
        }
        
        // Aynı tür içinde numara sıralaması
        // DÖF-2025-001 formatından yıl ve sıra numarasını çıkar
        const extractNumber = (dofNum: string) => {
          const match = dofNum.match(/(8D|DÖF|MDİ)-(\d{4})-(\d{3})/);
          if (match) {
            const year = parseInt(match[2]);
            const number = parseInt(match[3]);
            return year * 1000 + number; // 2025001, 2025002 şeklinde
          }
        return 0;
        };
        
        const aNum = extractNumber(aDofNumber);
        const bNum = extractNumber(bDofNumber);
        
        // Büyükten küçüğe sıralama (en yeni en üstte)
        return bNum - aNum;
      });
  }, [metrics.filteredRecords, filters.delayStatus, filters.priority, getDelayMessage]); // Context7 - Remove unnecessary dependencies

  // Context7 - ENHANCED: Profesyonel DÖF Kapatma Sistemi
  const closeDOF = useCallback((recordId: string, closeReason: string = 'Manuel kapatma') => {
    try {
      console.log('🔒 Context7 - DÖF kapatma işlemi başlatılıyor...', recordId);
      
      // Context7 - GÜVENLI KAYIT BULMA
      const recordToClose = dofRecords.find(r => r.id === recordId);
      if (!recordToClose) {
        console.error('❌ Context7 - Kayıt bulunamadı:', recordId);
        // Kayıt bulunamadı - sessiz hata
        return;
      }

      // Context7 - DURUM KONTROLÜ
      if (recordToClose.status === 'closed') {
        console.warn('⚠️ Context7 - Kayıt zaten kapalı:', recordToClose.dofNumber);
        // Zaten kapatılmış - sessiz kontrol
        return;
      }

      console.log('📋 Context7 - Kapatılacak kayıt detayları:', {
        id: recordToClose.id,
        dofNumber: recordToClose.dofNumber,
        status: recordToClose.status,
        department: recordToClose.department,
        remainingDays: recordToClose.remainingDays
      });

      // DÖF kapatma modal'ını aç
      setSelectedRecordForClose(recordToClose);
      setClosureData({
        closedDate: new Date().toISOString().split('T')[0],
        closeReason: 'completed',
        closureNotes: ''
      });
      setCloseModalOpen(true);
      
    } catch (error) {
      console.error('❌ Context7 - DÖF kapatma hatası:', error);
      // Kapatma hatası - sessiz hata
    }
  }, [dofRecords]);

  // ✅ Modal'dan gelen kapatma işlemini gerçekleştir
  const confirmCloseDOF = useCallback(() => {
    try {
      if (!selectedRecordForClose) {
        console.error('❌ Kapatılacak kayıt bulunamadı');
        return;
      }

      const recordId = selectedRecordForClose.id;
      const closedDate = closureData.closedDate;
      const closedTime = new Date().toLocaleString('tr-TR');
      const closeReason = closureData.closeReason;
      
      console.log('⏰ Context7 - Kapatma zamanı:', { closedDate, closedTime, closeReason });

      // Context7 - Kapatma durumu hesaplama
      const wasOverdue = selectedRecordForClose.delayStatus === 'overdue';
      const finalRemainingDays = calculateRemainingDays(selectedRecordForClose.dueDate);
      
      console.log('📈 Context7 - Kapatma istatistikleri:', {
        wasOverdue,
        finalRemainingDays,
        originalDueDate: selectedRecordForClose.dueDate
      });

      // Context7 - GÜVENLI STATE GÜNCELLEME
      setDofRecords(prev => {
        if (!prev || !Array.isArray(prev)) {
          console.error('❌ Context7 - DofRecords array geçersiz');
          return [];
        }

        const updatedRecords = prev.map(record => {
          if (record && record.id === recordId) {
            // Context7 - Güvenli kayıt güncelleme
            const updatedRecord: DOFRecord = {
              ...record,
              // Context7 - Kapatma durumu
              status: 'closed',
              closedDate: closedDate,
              
              // Context7 - Hesaplanan final değerler
              remainingDays: finalRemainingDays,
              delayStatus: wasOverdue ? 'overdue' : 'on_time',
              
              // Context7 - Meta veri güncelleme
              metadata: {
                ...record.metadata,
                closedBy: 'Sistem Kullanıcısı',
                closureTime: closedTime,
                finalStatus: wasOverdue ? 'Gecikmeli Kapatıldı' : 'Zamanında Kapatıldı',
                version: (parseFloat(record.metadata?.version || '1.0') + 0.1).toFixed(1)
              },
              
              // Context7 - Geçmiş kaydını güncelle
              history: [
                ...(record.history || []),
                {
                  id: `close_${Date.now()}`,
                  action: 'DÖF Kapatıldı',
                  user: 'Sistem Kullanıcısı',
                  date: closedDate,
                  details: `${getCloseReasonText(closeReason)} | Kapanış: ${closedTime} | ${wasOverdue ? '⚠️ Gecikme ile' : '✅ Zamanında'} kapatıldı | Kalan gün: ${finalRemainingDays}${closureData.closureNotes ? ` | Not: ${closureData.closureNotes}` : ''}`
                }
              ]
            };
            
            console.log('✅ Context7 - Kayıt kapatma hazırlandı:', {
              id: updatedRecord.id,
              dofNumber: updatedRecord.dofNumber,
              closedDate: updatedRecord.closedDate,
              finalStatus: updatedRecord.metadata?.finalStatus
            });
            
            return updatedRecord;
          }
          return record;
        }).filter(Boolean); // Context7 - Null kayıtları temizle

        // Context7 - İstatistik güncelleme
        const newStats = {
          total: updatedRecords.length,
          closed: updatedRecords.filter(r => r.status === 'closed').length,
          open: updatedRecords.filter(r => r.status !== 'closed').length
        };
        
        console.log('📊 Context7 - Güncel istatistikler:', newStats);

        return updatedRecords;
      });

      // Modal'ı kapat
      setCloseModalOpen(false);
      setSelectedRecordForClose(null);
      setClosureData({
        closedDate: new Date().toISOString().split('T')[0],
        closeReason: 'completed',
        closureNotes: ''
      });
      
      console.log('✅ Context7 - DÖF kapatma işlemi başarıyla tamamlandı');
      
    } catch (error) {
      console.error('❌ Context7 - DÖF kapatma hatası:', error);
    }
  }, [selectedRecordForClose, closureData, dofRecords]);

  // ✅ Kapatma nedeni metinleri
  const getCloseReasonText = (reason: string) => {
    switch (reason) {
      case 'completed': return 'Başarıyla Tamamlandı';
      case 'resolved': return 'Çözüm Bulundu';
      case 'cancelled': return 'İptal Edildi';
      case 'transferred': return 'Transfer Edildi';
      case 'merged': return 'Birleştirildi';
      default: return 'Kapatıldı';
    }
  };

  // Context7 - ENHANCED: Profesyonel DÖF Silme Sistemi
  const deleteDOFRecord = useCallback((recordId: string) => {
    try {
      console.log('🗑️ Context7 - DÖF silme işlemi başlatılıyor:', recordId);
      
      setDofRecords(prev => {
        const updatedRecords = prev.filter(record => record.id !== recordId);
        console.log(`✅ Context7 - DÖF silindi. Önceki: ${prev.length}, Sonrası: ${updatedRecords.length}`);
        
        // Context7 - Silme sonrası localStorage'a kaydet
        try {
          saveToContext7(updatedRecords);
        } catch (saveError) {
          console.error('⚠️ Context7 - Silme sonrası kaydetme hatası:', saveError);
        }
        
        return updatedRecords;
      });
      
      // DÖF başarıyla silindi - sessiz işlem
      
      console.log('✅ Context7 - DÖF silme işlemi başarıyla tamamlandı');
      
    } catch (error) {
      console.error('❌ Context7 - DÖF silme hatası:', error);
      // Silme hatası - sessiz hata
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [dofRecords]); // ✅ saveToContext7 dependency çıkarıldı - circular dependency önleme

  // ✅ 8D Progress Hesaplama Fonksiyonu
  const calculate8DProgress = useCallback((d8Steps: any): number => {
    if (!d8Steps) return 0;
    
    const stepKeys = [
      'd1_team', 'd2_problem', 'd3_containment', 'd4_rootCause',
      'd5_permanentAction', 'd6_implementation', 'd7_prevention', 'd8_recognition'
    ];
    
    const completedSteps = stepKeys.filter(key => d8Steps[key]?.trim()?.length > 0).length;
    return Math.round((completedSteps / stepKeys.length) * 100);
  }, []);

  // ⚡ PERFORMANCE OPTIMIZED: Form Input Handlers
  const handleFormFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNestedFieldChange = useCallback((parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  }, []);

  // ⚡ PERFORMANCE OPTIMIZED: 8D Step Update Handler
  const handle8DStepChange = useCallback((stepNumber: number, value: string) => {
    const stepKeys = ['team', 'problem', 'containment', 'rootCause', 'permanentAction', 'implementation', 'prevention', 'recognition'];
    const stepKey = `d${stepNumber}_${stepKeys[stepNumber - 1]}`;
    
    setFormData(prev => ({
      ...prev,
      d8Steps: {
        ...prev.d8Steps,
        [stepKey]: value
      }
    }));
  }, []);

  // ✅ 8D Accordion Toggle Fonksiyonu
  const toggle8DAccordion = useCallback((accordionKey: string) => {
    setD8AccordionStates(prev => ({
      ...prev,
      [accordionKey]: !prev[accordionKey]
    }));
  }, []);

  // ✅ 8D Open All Accordions Fonksiyonu
  const openAll8DAccordions = useCallback(() => {
    setD8AccordionStates({
      'd1': true,
      'd2': true,
      'd3': true,
      'd4': true,
      'd5': true,
      'd6': true,
      'd7': true,
      'd8': true
    });
  }, []);

  // ⚡ PERFORMANCE OPTIMIZED: Debounced 8D Progress Update
  const debouncedUpdateProgress = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (d8Steps: any, type: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (type === '8d' && d8Steps) {
            const progress = calculate8DProgress(d8Steps);
            setFormData(prev => ({ ...prev, d8Progress: progress }));
          }
        }, 500); // 500ms debounce to prevent excessive updates
      };
    })(),
    [calculate8DProgress]
  );

  // ⚡ PERFORMANCE OPTIMIZED: Update 8D Progress when steps change (with debounce)
  useEffect(() => {
    if (formData.type === '8d' && formData.d8Steps) {
      debouncedUpdateProgress(formData.d8Steps, formData.type);
    }
  }, [formData.d8Steps, formData.type, debouncedUpdateProgress]);

  // Context7 - Auto-open 8D accordions when type changes to 8D
  useEffect(() => {
    if (formData.type === '8d') {
      openAll8DAccordions();
    }
  }, [formData.type, openAll8DAccordions]);

  // Context7 - KULLANICI KORUMA: SADECE ÇOK SPESİFİK SAMPLE DATA TEMİZLİK - GERÇEk VERİ KORUMA
  useEffect(() => {
    // Sadece çok spesifik sample data kayıtlarını temizle, gerçek kullanıcı verilerini KORU
    try {
      console.log('🛡️ Context7 - KORUMALI Sample Data Temizlik başlatılıyor...');
      
      const storedData = localStorage.getItem('dofRecords');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log(`📊 Context7 - ${parsedData.length} kayıt kontrolü yapılıyor...`);
        
        // KULLANICI KORUMA: Sadece kesin sample data örneklerini temizle
        const cleanData = parsedData.filter(record => {
          // SADECE ÇOK SPESİFİK SAMPLE DATA TESPİTİ - GERÇEK VERİLERİ KORU
          const isDefinitelySampleData = 
            // Sadece çok spesifik metadata flag'leri
            (record.metadata && (
              record.metadata.cleanupDate ||
              record.metadata.cleanupVersion ||
              record.metadata.isSampleData === true ||
              record.metadata.isTestData === true
            )) ||
            
            // Sadece kesin test ID'leri (yeni formatlar)
            record.id?.includes('SAMPLE') ||
            record.id?.includes('TEST') ||
            record.id?.includes('EXAMPLE') ||
            record.id?.includes('DEMO') ||
            
            // Sadece çok spesifik tam eşleşme başlıkları
            record.title === 'TEST Ürün Boyut Sapması' ||
            record.title === 'SAMPLE Makine Arızası' ||
            record.title === 'DEMO Kalite Problemi' ||
            
            // Sadece test kelimeli responsible (tam eşleşme)
            record.responsible === 'Test User' ||
            record.responsible === 'Sample User' ||
            record.responsible === 'Demo User' ||
            record.responsible?.includes('SAMPLE_') ||
            record.responsible?.includes('TEST_');
          
          if (isDefinitelySampleData) {
            console.log('🗑️ Context7 - Kesin sample data silindi:', record.id);
            return false;
          }
          
          // KULLANICI KORUMA: Gerçek verileri koru
          console.log('🛡️ Context7 - Gerçek kullanıcı verisi korundu:', record.id);
          return true;
        });
        
        // SONUÇ RAPORU
        const removedCount = parsedData.length - cleanData.length;
        if (removedCount > 0) {
          localStorage.setItem('dofRecords', JSON.stringify(cleanData));
          console.log(`✅ Context7 - ${removedCount} kesin sample data temizlendi`);
          console.log(`🛡️ Context7 - ${cleanData.length} gerçek kullanıcı kaydı korundu`);
        } else {
          console.log('✅ Context7 - Sample data bulunamadı, tüm veriler gerçek kullanıcı verisi');
        }
      } else {
        console.log('📝 Context7 - localStorage boş');
      }
    } catch (error) {
      console.error('❌ Context7 - Temizlik hatası:', error);
    }
  }, []); // Sadece component mount olduğunda çalış

  // ✅ Event Handlers
  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openCreateDialog = () => {
    setDialogMode('create');
    
    // ✅ Eğer prefill verisi varsa, onu koru; yoksa varsayılan formu aç
    if (!hasPrefillData) {
      setFormData({
        type: 'corrective',
        title: '',
        description: '',
        department: '',
        responsible: '',
        priority: 'medium',
        status: 'open',
        openingDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        rootCause: '',
        rejectionReason: '',
        mdiNumber: '',
        actions: [],
        attachments: []
      });
    }
    // Prefill verisi varsa formData zaten dolu
    
    setSelectedRecord(null);
    setOpenDialog(true);
    
    // Prefill flag'ini sıfırla
    if (hasPrefillData) {
      setHasPrefillData(false);
    }
  };

  const openEditDialog = (record: DOFRecord) => {
    setDialogMode('edit');
    setFormData(record);
    setSelectedRecord(record);
    setOpenDialog(true);
  };

  const openViewDialog = (record: DOFRecord) => {
    setDialogMode('view');
    setSelectedRecord(record);
    // ✅ View mode için formData'yı doldur
    setFormData(record);
    setOpenDialog(true);
  };

  // ✅ Etkileşimli Tablo Fonksiyonları
  const handleDepartmentClick = (department: string) => {
    console.log('🏢 Context7 - Department clicked:', department);
    // Filtreyi departmana göre ayarla ve DÖF Listesi tab'ına geç
    handleFilterChange('department', department);
    setActiveTab(1); // DÖF Listesi tab'ına geç
  };

  const handleStatusClick = (status: string) => {
    console.log('📊 Context7 - Status clicked:', status);
    // Filtreyi duruma göre ayarla ve DÖF Listesi tab'ına geç
    handleFilterChange('status', status);
    setActiveTab(1);
  };

  const handlePriorityClick = (priority: string) => {
    console.log('⚠️ Context7 - Priority clicked:', priority);
    // Filtreyi öncelik durumuna göre ayarla ve DÖF Listesi tab'ına geç
    handleFilterChange('priority', priority);
    setActiveTab(1);
  };

  const handleDelayStatusClick = (delayStatus: string) => {
    console.log('⏰ Context7 - Delay status clicked:', delayStatus);
    // Filtreyi gecikme durumuna göre ayarla ve DÖF Listesi tab'ına geç
    handleFilterChange('delayStatus', delayStatus);
    setActiveTab(1);
  };

  const handleDOFNumberClick = (dofNumber: string) => {
    console.log('📋 Context7 - DOF number clicked:', dofNumber);
    // İlgili DÖF kaydını bul ve görüntüle
    const record = dofRecords.find(r => r.dofNumber === dofNumber);
    if (record) {
      openViewDialog(record);
    }
  };

  // Tarih düzenleme fonksiyonu kaldırıldı - artık gerekli değil

  const handleSave = () => {
    try {
      console.log('💾 Context7 - Kayıt işlemi başlatılıyor...', {
        mode: dialogMode,
        formData: { 
          title: formData.title, 
          department: formData.department, 
          type: formData.type 
        }
      });

      // Context7 - GÜÇLÜ FORM VALİDASYONU
      const validationErrors = [];
      if (!formData.title?.trim()) validationErrors.push('Başlık alanı zorunludur');
      if (!formData.department?.trim()) validationErrors.push('Departman seçimi zorunludur');
      if (!formData.responsible?.trim()) validationErrors.push('Sorumlu kişi alanı zorunludur');
      if (!formData.dueDate) validationErrors.push('Hedef kapanış tarihi zorunludur');
      if (!formData.description?.trim()) validationErrors.push('Açıklama alanı zorunludur');
      
      // ✅ Rejected status için red nedeni zorunlu
      if (formData.status === 'rejected' && !formData.rejectionReason?.trim()) {
        validationErrors.push('DÖF reddedildiğinde red nedeni açıklaması zorunludur');
      }
      
      // ✅ MDİ türü için MDİ numarası zorunlu
      if (formData.type === 'mdi' && !formData.mdiNumber?.trim()) {
        validationErrors.push('MDİ türü seçildiğinde MDİ numarası zorunludur');
      }

      if (validationErrors.length > 0) {
        // Form validasyon hatası - kullanıcıya bildirim göster
        console.warn('❌ Form validasyon hataları:', validationErrors);
        alert('Lütfen aşağıdaki alanları kontrol ediniz:\n\n' + validationErrors.join('\n'));
        return;
      }

      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toLocaleString('tr-TR');

      if (dialogMode === 'create') {
        console.log('🆕 Context7 - Yeni kayıt oluşturuluyor...');
        
        const dofPrefix = formData.type === '8d' ? '8D' : 'DÖF';
        const recordId = `${dofPrefix}-${now.getTime()}`;
        
        // Context7 - AKILLI NUMARA ÜRETİMİ (QualityCostManagement ile uyumlu)
        const currentYear = now.getFullYear();
        let dofNumber;
        
        // ✅ GÜÇLÜ VE BENZERSİZ NUMARA ÜRETİMİ (Component seviyesindeki fonksiyonu kullan)
        if (formData.type === '8d') {
          // 8D kayıtları için benzersiz numara
          dofNumber = generateUniqueNumber('8D', dofRecords);
        } else {
          // DÖF kayıtları için benzersiz numara
          dofNumber = generateUniqueNumber('DÖF', dofRecords);
        }

        const newRecord: DOFRecord = {
          // Context7 - Temel bilgiler
          id: recordId,
          dofNumber: formData.type === 'mdi' && formData.mdiNumber ? formData.mdiNumber : dofNumber, // ✅ MDİ için manuel numara veya otomatik
          type: formData.type,
          title: formData.title.trim(),
          description: formData.description.trim(),
          department: formData.department,
          responsible: formData.responsible.trim(),
          priority: formData.priority,
          status: formData.status, // ✅ Formdan gelen status değerini kullan
          createdDate: currentDate,
          openingDate: formData.openingDate || currentDate, // ✅ Açılış tarihi (geçmişe yönelik veriler için)
          dueDate: formData.dueDate,
          closedDate: formData.status === 'closed' ? currentDate : undefined, // ✅ Kapalı durumda kapanış tarihi ata
          rootCause: formData.rootCause?.trim() || '',
          rejectionReason: formData.rejectionReason?.trim() || '', // ✅ Red nedeni alanı
          mdiNumber: formData.type === 'mdi' ? formData.mdiNumber?.trim() || '' : undefined, // ✅ MDİ numarası
          
          // Context7 - Koleksiyonlar
          actions: Array.isArray(formData.actions) ? formData.actions : [],
          attachments: Array.isArray(formData.attachments) ? formData.attachments : [],
          
          // Context7 - 8D özel alanları
          d8Steps: formData.type === '8d' ? (formData.d8Steps || {}) : undefined,
          d8Progress: formData.type === '8d' ? calculate8DProgress(formData.d8Steps) : undefined,
          
          // Context7 - Meta veriler
          metadata: {
            createdBy: 'Atakan Battal',
            creationTime: currentTime,
            version: '1.0',
            ...(formData.status === 'closed' && {
              closedBy: 'Atakan Battal',
              closureTime: currentTime,
              finalStatus: 'closed'
            })
          },
          
          // Context7 - Hesaplanan alanlar
          remainingDays: calculateRemainingDays(formData.dueDate),
          delayStatus: getDelayStatus(formData.dueDate, formData.status),
          
          // Context7 - Geçmiş kaydı
          history: [{
            id: `h1_${now.getTime()}`,
            action: `${formData.type === '8d' ? '8D Problemi' : 'DÖF'} Oluşturuldu`,
            user: 'Atakan Battal',
            date: currentDate,
            details: `Yeni ${formData.type === '8d' ? '8D problemi çözme' : 'DÖF'} kaydı oluşturuldu. Tip: ${DOF_TYPES.find(t => t.value === formData.type)?.label}, Departman: ${formData.department}, Sorumlu: ${formData.responsible}, Durum: ${STATUS_OPTIONS.find(s => s.value === formData.status)?.label}`
          }].concat(formData.status === 'closed' ? [{
            id: `h2_${now.getTime()}`,
            action: 'DÖF Kapatıldı',
            user: 'Atakan Battal',
            date: currentDate,
            details: `DÖF kapalı durumda oluşturuldu ve otomatik olarak kapatıldı.`
          }] : [])
        };

        console.log('✅ Context7 - Yeni kayıt hazırlandı:', {
          id: newRecord.id,
          dofNumber: newRecord.dofNumber,
          type: newRecord.type,
          remainingDays: newRecord.remainingDays,
          d8Progress: newRecord.d8Progress
        });

        // Context7 - GÜVENLI STATE GÜNCELLEME
        setDofRecords(prev => {
          const updated = [newRecord, ...prev]; // Yeni kayıt en üstte
          console.log('📊 Context7 - State güncellendi, toplam kayıt:', updated.length);
          
          // ✅ LOCALSTORAGE'A HEMEN KAYDET
          try {
            localStorage.setItem('dofRecords', JSON.stringify(updated));
            console.log('💾 Context7 - localStorage güncellendi');
          } catch (error) {
            console.error('❌ Context7 - localStorage kaydetme hatası:', error);
          }
          
          return updated;
        });
        
        // DÖF başarıyla oluşturuldu - Alert kaldırıldı
        
      } else if (dialogMode === 'edit' && selectedRecord) {
        console.log('✏️ Context7 - Kayıt güncelleniyor...', selectedRecord.id);
        
        const updatedRecord: DOFRecord = {
          ...selectedRecord,
          ...formData,
          
          // Context7 - Güncelleme meta verileri
          title: formData.title.trim(),
          description: formData.description.trim(),
          responsible: formData.responsible.trim(),
          rootCause: formData.rootCause?.trim() || selectedRecord.rootCause,
          rejectionReason: formData.rejectionReason?.trim() || selectedRecord.rejectionReason, // ✅ Red nedeni alanı
          
          // Context7 - 8D progress hesaplama
          d8Progress: formData.type === '8d' ? calculate8DProgress(formData.d8Steps) : selectedRecord.d8Progress,
          
          // Context7 - Hesaplanan alanları güncelle
          remainingDays: calculateRemainingDays(formData.dueDate),
          delayStatus: getDelayStatus(formData.dueDate, formData.status),
          
          // Context7 - Meta veri güncellemesi
          metadata: {
            ...selectedRecord.metadata,
            lastModified: currentTime,
            modifiedBy: 'Atakan Battal',
            version: (parseFloat(selectedRecord.metadata?.version || '1.0') + 0.1).toFixed(1)
          },
          
          // Context7 - Geçmiş kaydına ekleme
          history: [
            ...selectedRecord.history,
            {
              id: `edit_${now.getTime()}`,
              action: 'DÖF/8D Güncellendi',
              user: 'Atakan Battal',
              date: currentDate,
              details: `Kayıt güncellendi. ${formData.type === '8d' ? `8D İlerleme: %${calculate8DProgress(formData.d8Steps)}` : ''} | Değişiklik zamanı: ${currentTime}`
            }
          ]
        };
        
        console.log('✅ Context7 - Güncelleme hazırlandı:', {
          id: updatedRecord.id,
          version: updatedRecord.metadata?.version,
          d8Progress: updatedRecord.d8Progress
        });
        
        // Context7 - GÜVENLI STATE GÜNCELLEME
        setDofRecords(prev => {
          const updated = prev.map(record => 
            record.id === selectedRecord.id ? updatedRecord : record
          );
          console.log('📊 Context7 - Kayıt güncelleme tamamlandı');
          
          // ✅ LOCALSTORAGE'A HEMEN KAYDET
          try {
            localStorage.setItem('dofRecords', JSON.stringify(updated));
            console.log('💾 Context7 - localStorage güncellendi');
          } catch (error) {
            console.error('❌ Context7 - localStorage kaydetme hatası:', error);
          }
          
          return updated;
        });
        
        // DÖF başarıyla güncellendi - Alert kaldırıldı
      }
      
      // ✅ Prefill verilerini temizle (kayıt tamamlandığında)
      try {
        localStorage.removeItem('dof-form-prefill');
        setHasPrefillData(false);
        console.log('🧹 Prefill verileri temizlendi');
      } catch (error) {
        console.warn('⚠️ Prefill temizleme uyarısı:', error);
      }
      
      // Context7 - Dialog'u kapat ve formu temizle
      setOpenDialog(false);
      setSelectedRecord(null);
      
      console.log('✅ Context7 - Kayıt işlemi başarıyla tamamlandı');
      
    } catch (error) {
      console.error('❌ Context7 - Kayıt hatası:', error);
      // Kayıt hatası - kullanıcıya hata mesajı göster
      alert('❌ DÖF kaydetme sırasında bir hata oluştu. Lütfen tekrar deneyiniz.\n\nHata: ' + (error as Error).message);
    }
  };



  // Eski departman isimlerini yeni isimlerle eşleştir
  const updateExistingDepartments = () => {
    const departmentMapping: {[key: string]: string} = {
      'Bakım ve Onarım': 'Bakım Onarım',
      'Paketleme': 'Üretim', // Paketleme Üretim'e dahil
      'Bilgi İşlem': 'İdari İşler', // Bilgi İşlem İdari İşler'e dahil
      'İşçi Sağlığı ve Güvenliği': 'İş Sağlığı ve Güvenliği',
      'Kalite Güvence': 'Kalite Kontrol',
      'Süreç Geliştirme': 'Ar-Ge',
      'Çevre': 'İş Sağlığı ve Güvenliği'
    };

    setDofRecords(prevRecords => {
      const updatedRecords = prevRecords.map(record => {
        const mappedDepartment = departmentMapping[record.department] || record.department;
        // Yeni departman listesinde yoksa Kalite Kontrol'e ata
        const finalDepartment = DEPARTMENTS.includes(mappedDepartment) ? mappedDepartment : 'Kalite Kontrol';
        
        return {
          ...record,
          department: finalDepartment
        };
      });
      
      // localStorage'ı güncelle
      try {
        localStorage.setItem('dofRecords', JSON.stringify(updatedRecords));
      } catch (error) {
        console.warn('⚠️ LocalStorage update error:', error);
      }
      
      return updatedRecords;
    });
  };

  // Context7 - Test data functions removed for production

  return (
    <Box sx={{ p: 3 }}>
      {/* Global Filtreler - Tüm Modülde Etkili */}
      <StyledAccordion
        expanded={expanded === 'panel1'}
        onChange={handleAccordionChange('panel1')}
        sx={{ mb: 3 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <FilterListIcon sx={{ color: '#ffffff' }} />
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>Filtreleme ve Arama</Typography>
            {filters.department && (
              <Chip label={`Birim: ${filters.department}`} size="small" onDelete={() => handleFilterChange('department', '')} />
            )}
            {filters.year && (
              <Chip label={`Yıl: ${filters.year}`} size="small" onDelete={() => handleFilterChange('year', '')} />
            )}
            {filters.status && (
              <Chip label={`Durum: ${STATUS_OPTIONS.find(s => s.value === filters.status)?.label}`} size="small" onDelete={() => handleFilterChange('status', '')} />
            )}
            {Object.values(filters).some(filter => filter) && (
              <Chip 
                label={`${metrics.filteredRecords.length} kayıt bulundu`} 
                size="small" 
                color="primary" 
                variant="filled"
              />
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
                  <MenuItem value="">Tüm Birimler</MenuItem>
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
                  <MenuItem value="">Tüm Durumlar</MenuItem>
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: status.color 
                          }} 
                        />
                        {status.label}
                      </Box>
                    </MenuItem>
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
                  <MenuItem value="">Tüm Türler</MenuItem>
                  {DOF_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: type.color 
                          }} 
                        />
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <TextField
                fullWidth
                label="Gelişmiş Arama"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontWeight: 600
                  },
                  '& .MuiOutlinedInput-root': {
                    height: 56,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
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
                  <MenuItem value="">Tüm Yıllar</MenuItem>
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
                  <MenuItem value="">Tüm Aylar</MenuItem>
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
                  <MenuItem value="">Tüm Durumlar</MenuItem>
                  {DELAY_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: option.color 
                          }} 
                        />
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
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
                  <MenuItem value="">Tüm Seviyeler</MenuItem>
                  {PRIORITY_OPTIONS.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: priority.color 
                          }} 
                        />
                        {priority.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: '1 1 180px', minWidth: '180px' }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={() => setFilters({
                  department: '',
                  status: '',
                  type: '',
                  searchTerm: '',
                  year: '',
                  month: '',
                  delayStatus: '',
                  priority: '',
                })}
                sx={{ 
                  height: 56,
                  fontWeight: 600,
                  borderColor: 'error.main',
                  color: 'error.main',
                  '&:hover': {
                    borderColor: 'error.dark',
                    backgroundColor: 'error.light',
                    color: 'error.dark'
                  }
                }}
              >
                Filtreleri Temizle
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </StyledAccordion>

      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)} 
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Dashboard" icon={<DashboardIcon />} />
        <Tab label="DÖF/8D Listesi" icon={<AssignmentIcon />} />
        <Tab label="Raporlar" icon={<AssessmentIcon />} />
      </Tabs>

      {/* Dashboard Tab */}
      {activeTab === 0 && (
        <Box>

          {/* Filter Alert kaldırıldı - sessiz filtre */}

          {/* Metrik Kartları - Üstten Boşluk Eklendi */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3, 
            mb: 4,
            mt: 5 // ✅ Filtre bölümünden daha fazla boşluk
          }}>
            <MetricCard sx={{ height: '140px' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h3" fontWeight={700} color="primary.main" sx={{ mb: 1 }}>
                        {metrics.total}
                      </Typography>
                      <Typography variant="h6" color="text.primary" fontWeight={600}>
                        Toplam DÖF/8D
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                      {Object.values(filters).some(filter => filter) ? 'Filtreli kayıt sayısı' : 'Aktif kayıt sayısı'}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: '12px', 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <AssignmentIcon sx={{ fontSize: 32 }} />
                    </Box>
                  </Box>
                </CardContent>
              </MetricCard>

            <MetricCard sx={{ height: '140px' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h3" fontWeight={700} color="error.main" sx={{ mb: 1 }}>
                        {metrics.open}
                      </Typography>
                      <Typography variant="h6" color="text.primary" fontWeight={600}>
                        Açık Kayıtlar
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        İşlem bekleyen
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: '12px', 
                      bgcolor: 'error.main', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ErrorIcon sx={{ fontSize: 32 }} />
                    </Box>
                  </Box>
                </CardContent>
              </MetricCard>

            <MetricCard sx={{ height: '140px' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h3" fontWeight={700} color="warning.main" sx={{ mb: 1 }}>
                        {metrics.overdue}
                      </Typography>
                      <Typography variant="h6" color="text.primary" fontWeight={600}>
                        Gecikmiş
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Süre aşımı olan
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: '12px', 
                      bgcolor: 'warning.main', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <WarningIcon sx={{ fontSize: 32 }} />
                    </Box>
                  </Box>
                </CardContent>
              </MetricCard>

            <MetricCard sx={{ height: '140px' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h3" fontWeight={700} color="success.main" sx={{ mb: 1 }}>
                        %{metrics.closureRate.toFixed(1)}
                      </Typography>
                      <Typography variant="h6" color="text.primary" fontWeight={600}>
                        Kapanma Oranı
                      </Typography>

                    </Box>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: '12px', 
                      bgcolor: 'success.main', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <TrendingUpIcon sx={{ fontSize: 32 }} />
                    </Box>
                  </Box>
                </CardContent>
              </MetricCard>
          </Box>



          {/* Basit İstatistikler */}
          {/* ✅ Gelişmiş İstatistikler ve Chart'lar */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
            {/* Durum Dağılımı */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Durum Dağılımı
                  </Typography>
              {metrics.statusDistribution.some(item => item.value > 0) ? (
                metrics.statusDistribution.map((item, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.value} adet ({metrics.total > 0 ? Math.round((item.value / metrics.total) * 100) : 0}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.total > 0 ? Math.max((item.value / metrics.total) * 100, item.value > 0 ? 5 : 0) : 0}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        bgcolor: item.value > 0 ? item.color : 'grey.300'
                      }
                    }}
                  />
                  </Box>
              ))
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                  <Typography variant="body2" color="text.secondary">
                    Henüz veri bulunmuyor
                    </Typography>
                  </Box>
                )}
              </Paper>

            {/* Tür Dağılımı */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Tür Dağılımı
                  </Typography>
              {metrics.typeDistribution.some(item => item.value > 0) ? (
                metrics.typeDistribution.map((item, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.value} adet ({metrics.total > 0 ? Math.round((item.value / metrics.total) * 100) : 0}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.total > 0 ? Math.max((item.value / metrics.total) * 100, item.value > 0 ? 5 : 0) : 0}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        bgcolor: item.value > 0 ? item.color : 'grey.300'
                      }
                    }}
                  />
                  </Box>
              ))
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                  <Typography variant="body2" color="text.secondary">
                    Henüz veri bulunmuyor
                    </Typography>
                  </Box>
                )}
              </Paper>

            {/* Aylık Trend */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                6 Aylık Trend
                  </Typography>
              {metrics.monthlyTrend.some(data => data.opened > 0 || data.closed > 0) ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {metrics.monthlyTrend.map((data, index) => (
                  <Box key={index}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      {data.month}: Açılan {data.opened}, Kapanan {data.closed}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(() => {
                          const maxOpened = Math.max(...metrics.monthlyTrend.map(m => m.opened), 1);
                          return Math.max((data.opened / maxOpened) * 100, data.opened > 0 ? 10 : 0);
                        })()}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'grey.200',
                          flex: 1,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            bgcolor: '#f44336'
                          }
                        }}
                      />
                      <LinearProgress
                        variant="determinate"
                        value={(() => {
                          const maxClosed = Math.max(...metrics.monthlyTrend.map(m => m.closed), 1);
                          return Math.max((data.closed / maxClosed) * 100, data.closed > 0 ? 10 : 0);
                        })()}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'grey.200',
                          flex: 1,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            bgcolor: '#4caf50'
                          }
                        }}
                      />
                  </Box>
            </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 6, bgcolor: '#f44336', borderRadius: 3 }} />
                    <Typography variant="caption">Açılan</Typography>
          </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 6, bgcolor: '#4caf50', borderRadius: 3 }} />
                    <Typography variant="caption">Kapanan</Typography>
        </Box>
                </Box>
              </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                  <Typography variant="body2" color="text.secondary">
                    Henüz aylık trend verisi bulunmuyor
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>





          {/* ✅ Gelişmiş Analiz Tabloları */}
          <Box sx={{ mt: 4 }}>

            {/* 1. Departman Bazlı Performans Tablosu */}
            <Paper sx={{ 
              p: 0, 
              borderRadius: 3, 
              mb: 4, 
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ 
                p: 3, 
                bgcolor: 'primary.main', 
                color: 'white',
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <DashboardIcon />
                <Typography variant="h6" fontWeight={600}>
                  1. Departman Bazlı Performans Tablosu
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 450 }}>
                <Table stickyHeader size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'primary.main',
                        color: 'primary.main'
                      }}>
                        Birim Adı
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'primary.main',
                        color: 'primary.main'
                      }}>
                        Açılan
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'primary.main',
                        color: 'primary.main'
                      }}>
                        Kapanan
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'primary.main',
                        color: 'primary.main'
                      }}>
                        Gecikmiş
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'primary.main',
                        color: 'primary.main'
                      }}>
                        Ortalama Kapanma Süresi (gün)
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'primary.main',
                        color: 'primary.main'
                      }}>
                        Gecikme Oranı (%)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(() => {
                      // Context7 - Calculate department performance from filtered records
                      const deptStats = DEPARTMENTS.map(dept => {
                        const deptRecords = metrics.filteredRecords.filter(record => record.department === dept);
                        const openCount = deptRecords.filter(r => r.status !== 'closed').length;
                        const closedCount = deptRecords.filter(r => r.status === 'closed').length;
                        const overdueCount = deptRecords.filter(r => {
                          if (r.status === 'closed') return false;
                          const dueDate = new Date(r.dueDate);
                          const today = new Date();
                          today.setHours(23, 59, 59, 999);
                          return dueDate < today;
                        }).length;
                        const avgClosingTime = closedCount > 0 ? 
                          Math.round(deptRecords
                            .filter(r => r.status === 'closed' && r.closedDate && r.openingDate)
                            .reduce((acc, r) => {
                              const days = Math.abs(new Date(r.closedDate!).getTime() - new Date(r.openingDate).getTime()) / (1000 * 60 * 60 * 24);
                              return acc + days;
                            }, 0) / closedCount) : 0;
                        const delayPercentage = deptRecords.length > 0 ? Math.round((overdueCount / deptRecords.length) * 100) : 0;
                        
                        return {
                          department: dept,
                          openCount,
                          closedCount,
                          overdueCount,
                          avgClosingTime,
                          delayPercentage
                        };
                      }).filter(stat => stat.openCount + stat.closedCount > 0);
                      
                      return deptStats.map((stat, index) => (
                        <TableRow 
                          key={stat.department} 
                          hover
                          sx={{ 
                            '&:hover': { 
                              bgcolor: 'primary.50',
                              transform: 'scale(1.005)',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            },
                            '&:nth-of-type(even)': {
                              bgcolor: 'grey.25'
                            },
                            borderLeft: '4px solid',
                            borderColor: stat.delayPercentage > 40 ? 'error.main' : 
                                       stat.delayPercentage > 20 ? 'warning.main' : 'success.main'
                          }}
                          onClick={() => handleDepartmentClick(stat.department)}
                        >
                          <TableCell sx={{ 
                            fontWeight: 600,
                            color: 'text.primary',
                            fontSize: '0.95rem'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: stat.delayPercentage > 40 ? 'error.main' : 
                                          stat.delayPercentage > 20 ? 'warning.main' : 'success.main'
                                }}
                              />
                              {stat.department}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={stat.openCount} 
                              size="small" 
                              color={stat.openCount > 3 ? 'error' : 'primary'}
                              sx={{ 
                                fontWeight: 600,
                                minWidth: 45,
                                '&:hover': { transform: 'scale(1.1)' }
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={stat.closedCount} 
                              size="small" 
                              color="success"
                              sx={{ 
                                fontWeight: 600,
                                minWidth: 45,
                                '&:hover': { transform: 'scale(1.1)' }
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={stat.overdueCount} 
                              size="small" 
                              color={stat.overdueCount > 0 ? 'error' : 'default'}
                              sx={{ 
                                fontWeight: 600,
                                minWidth: 45,
                                '&:hover': { transform: 'scale(1.1)' }
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography 
                              variant="body2" 
                              fontWeight={600}
                              sx={{ 
                                px: 2, 
                                py: 0.5, 
                                borderRadius: 1,
                                bgcolor: stat.avgClosingTime > 30 ? 'error.50' : 
                                        stat.avgClosingTime > 15 ? 'warning.50' : 'success.50',
                                color: stat.avgClosingTime > 30 ? 'error.main' : 
                                       stat.avgClosingTime > 15 ? 'warning.main' : 'success.main'
                              }}
                            >
                              {stat.avgClosingTime} gün
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Typography 
                                variant="body1" 
                                fontWeight={700}
                                color={stat.delayPercentage > 40 ? 'error.main' : stat.delayPercentage > 20 ? 'warning.main' : 'success.main'}
                                sx={{ fontSize: '1.1rem' }}
                              >
                                %{stat.delayPercentage}
                              </Typography>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: 'grey.200',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${stat.delayPercentage}%`,
                                    height: '100%',
                                    bgcolor: stat.delayPercentage > 40 ? 'error.main' : 
                                            stat.delayPercentage > 20 ? 'warning.main' : 'success.main',
                                    borderRadius: 3,
                                    transition: 'width 0.5s ease'
                                  }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </TableContainer>

              </Paper>

            {/* 2. Termin Süresi Dağılım Tablosu */}
            <Paper sx={{ 
              p: 0, 
              borderRadius: 3, 
              mb: 4, 
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ 
                p: 3, 
                bgcolor: 'warning.main', 
                color: 'white',
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <DateRangeIcon />
                <Typography variant="h6" fontWeight={600}>
                  2. Termin Süresi Dağılım Tablosu
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 450, overflowX: 'auto' }}>
                <Table stickyHeader sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'warning.main',
                        color: 'warning.main',
                        minWidth: 120,
                        maxWidth: 120
                      }}>
                        DÖF No
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'warning.main',
                        color: 'warning.main',
                        minWidth: 250,
                        maxWidth: 250
                      }}>
                        Başlık
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'warning.main',
                        color: 'warning.main',
                        minWidth: 120,
                        maxWidth: 120
                      }}>
                        Birim
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'warning.main',
                        color: 'warning.main',
                        minWidth: 100,
                        maxWidth: 100
                      }}>
                        Termin Tarihi
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'warning.main',
                        color: 'warning.main',
                        minWidth: 110,
                        maxWidth: 110
                      }}>
                        Kalan Gün
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'warning.main',
                        color: 'warning.main',
                        minWidth: 90,
                        maxWidth: 90
                      }}>
                        Durum
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(() => {
                      // ✅ FIXED: Termin süresi dağılım tablosu - En çok geciken verileri önce göster
                      const recordsWithDelay = metrics.filteredRecords
                        .filter(record => record.status !== 'closed' && record.dueDate) // Sadece açık ve termin tarihi olan kayıtlar
                        .map(record => {
                          const today = new Date();
                          const dueDate = new Date(record.dueDate);
                          const diffTime = dueDate.getTime() - today.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          let status = 'Zamanında';
                          let statusColor: 'success' | 'warning' | 'error' = 'success';
                          let priority = 0; // Sıralama için öncelik puanı
                          
                          if (diffDays < 0) {
                            status = 'Gecikmiş';
                            statusColor = 'error';
                            priority = 1000 + Math.abs(diffDays); // Gecikmiş olanlar en üstte, gecikme miktarına göre sıralı
                          } else if (diffDays <= 3) {
                            status = 'Yaklaşıyor';
                            statusColor = 'warning';
                            priority = 500 + (3 - diffDays); // Yaklaşan olanlar ortada, yakınlığa göre sıralı
                          } else {
                            priority = 100 - diffDays; // Zamanında olanlar en altta, yakın olana göre sıralı
                          }
                          
                          return {
                            ...record,
                            diffDays,
                            status,
                            statusColor,
                            priority
                          };
                        })
                        // ✅ CRITICAL FIX: En çok geciken kayıtları önce göster
                        .sort((a, b) => b.priority - a.priority) // Yüksek öncelik (gecikmiş) üstte
                        .slice(0, 15); // İlk 15 kayıt göster
                      
                      console.log('🚨 Termin Süresi Analizi:', {
                        totalRecords: metrics.filteredRecords.length,
                        openRecords: metrics.filteredRecords.filter(r => r.status !== 'closed').length,
                        delayedRecords: recordsWithDelay.filter(r => r.diffDays < 0).length,
                        approachingRecords: recordsWithDelay.filter(r => r.diffDays >= 0 && r.diffDays <= 3).length,
                        onTimeRecords: recordsWithDelay.filter(r => r.diffDays > 3).length
                      });
                      
                      return recordsWithDelay.map(record => {
                          
                          return (
                            <TableRow 
                              key={record.id} 
                              hover
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: 'warning.50',
                                  transform: 'scale(1.002)',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                },
                                '&:nth-of-type(even)': {
                                  bgcolor: 'grey.25'
                                },
                                borderLeft: '4px solid',
                                borderColor: record.diffDays < 0 ? 'error.main' : record.diffDays <= 3 ? 'warning.main' : 'success.main'
                              }}
                            >
                              <TableCell sx={{ 
                                fontWeight: 600,
                                color: 'primary.main',
                                fontSize: '0.85rem',
                                width: 120
                              }}>
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 0.5,
                                    cursor: 'pointer',
                                    '&:hover': {
                                      color: 'primary.dark',
                                      textDecoration: 'underline'
                                    }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDOFNumberClick(record.dofNumber);
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      bgcolor: record.diffDays < 0 ? 'error.main' : record.diffDays <= 3 ? 'warning.main' : 'success.main'
                                    }}
                                  />
                                  <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                  {record.dofNumber}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ width: 250 }}>
                                <Typography 
                                  variant="body2" 
                                  fontWeight={600}
                                  sx={{ 
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    lineHeight: 1.3,
                                    color: 'text.primary',
                                    fontSize: '0.8rem',
                                    mb: 0.25
                                  }}
                                  title={record.title} // Full text on hover
                                >
                                  {record.title || 'Başlık belirtilmemiş'}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  sx={{ 
                                    fontSize: '0.65rem',
                                    fontWeight: 500
                                  }}
                                >
                                  {DOF_TYPES.find(t => t.value === record.type)?.label || record.type}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ 
                                fontWeight: 500,
                                color: 'text.primary',
                                width: 120,
                                fontSize: '0.8rem'
                              }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontSize: '0.8rem'
                                  }}
                                  title={record.department}
                                >
                                {record.department}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography 
                                  variant="body2" 
                                  fontWeight={600}
                                  sx={{ 
                                    px: 2, 
                                    py: 0.5, 
                                    borderRadius: 1,
                                    bgcolor: 'info.50',
                                    color: 'info.main'
                                  }}
                                >
                                  {new Date(record.dueDate).toLocaleDateString('tr-TR')}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    gap: 0.5 
                                  }}>
                                    <Typography 
                                      variant="h6" 
                                      fontWeight={700}
                                      color={record.diffDays < 0 ? 'error.main' : record.diffDays <= 3 ? 'warning.main' : 'success.main'}
                                      sx={{ 
                                        fontSize: '1.3rem',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 2,
                                        bgcolor: record.diffDays < 0 ? 'error.100' : record.diffDays <= 3 ? 'warning.100' : 'success.100',
                                        minWidth: 40,
                                        textAlign: 'center'
                                      }}
                                    >
                                      {Math.abs(record.diffDays)}
                                    </Typography>
                                    <Chip
                                      label={record.diffDays < 0 ? 'GECİKMİŞ' : record.diffDays <= 3 ? 'RİSKLİ' : 'NORMAL'}
                                      size="small"
                                      color={record.diffDays < 0 ? 'error' : record.diffDays <= 3 ? 'warning' : 'success'}
                                      sx={{ 
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                        height: 20,
                                        '& .MuiChip-label': {
                                          px: 1
                                        }
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={record.status} 
                                  size="medium" 
                                  color={record.statusColor}
                                  sx={{ 
                                    fontWeight: 600,
                                    minWidth: 80,
                                    '&:hover': { transform: 'scale(1.05)' }
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        });
                    })()}
                  </TableBody>
                </Table>
              </TableContainer>

            </Paper>

            {/* 3. Aksiyon Takip Durumu Tablosu */}
            <Paper sx={{ 
              p: 0, 
              borderRadius: 3, 
              mb: 4, 
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ 
                p: 3, 
                bgcolor: 'success.main', 
                color: 'white',
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <CheckCircleIcon />
                <Typography variant="h6" fontWeight={600}>
                  3. Aksiyon Takip Durumu Tablosu
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 450, overflowX: 'auto' }}>
                <Table stickyHeader sx={{ minWidth: 950 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'success.main',
                        color: 'success.main',
                        minWidth: 120,
                        maxWidth: 120
                      }}>
                        DÖF No
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'success.main',
                        color: 'success.main',
                        minWidth: 250,
                        maxWidth: 250
                      }}>
                        Başlık
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'success.main',
                        color: 'success.main',
                        minWidth: 100,
                        maxWidth: 100
                      }}>
                        Toplam
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'success.main',
                        color: 'success.main',
                        minWidth: 130,
                        maxWidth: 130
                      }}>
                        Tamamlanan
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'success.main',
                        color: 'success.main',
                        minWidth: 80,
                        maxWidth: 80
                      }}>
                        Eksik
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'success.main',
                        color: 'success.main',
                        minWidth: 110,
                        maxWidth: 110
                      }}>
                        Durum
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(() => {
                      return metrics.filteredRecords
                        .filter(record => record.actions && record.actions.length > 0)
                        .slice(0, 10)
                        .map(record => {
                          const totalActions = record.actions?.length || 0;
                          const completedActions = record.actions?.filter(a => a.status === 'completed').length || 0;
                          const pendingActions = totalActions - completedActions;
                          
                          let status = 'Kapanabilir';
                          let statusColor: 'success' | 'warning' | 'error' = 'success';
                          
                          if (pendingActions > 0) {
                            status = pendingActions > 2 ? 'Gecikiyor' : 'Eksik Aksiyon';
                            statusColor = pendingActions > 2 ? 'error' : 'warning';
                          }
                          
                          return (
                            <TableRow 
                              key={record.id} 
                              hover
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: 'success.50',
                                  transform: 'scale(1.002)',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                },
                                '&:nth-of-type(even)': {
                                  bgcolor: 'grey.25'
                                },
                                borderLeft: '4px solid',
                                borderColor: pendingActions > 2 ? 'error.main' : 
                                           pendingActions > 0 ? 'warning.main' : 'success.main'
                              }}
                            >
                              <TableCell sx={{ 
                                fontWeight: 600,
                                color: 'primary.main',
                                fontSize: '0.85rem',
                                width: 120
                              }}>
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 0.5,
                                    cursor: 'pointer',
                                    '&:hover': {
                                      color: 'primary.dark',
                                      textDecoration: 'underline'
                                    }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDOFNumberClick(record.dofNumber);
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      bgcolor: pendingActions > 2 ? 'error.main' : 
                                              pendingActions > 0 ? 'warning.main' : 'success.main'
                                    }}
                                  />
                                  <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                  {record.dofNumber}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ width: 250 }}>
                                <Typography 
                                  variant="body2" 
                                  fontWeight={600}
                                  sx={{ 
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    lineHeight: 1.3,
                                    color: 'text.primary',
                                    fontSize: '0.8rem',
                                    mb: 0.25
                                  }}
                                  title={record.title} // Full text on hover
                                >
                                  {record.title || 'Başlık belirtilmemiş'}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  sx={{ 
                                    fontSize: '0.65rem',
                                    fontWeight: 500
                                  }}
                                >
                                  {DOF_TYPES.find(t => t.value === record.type)?.label || record.type}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={totalActions} 
                                  size="medium" 
                                  color="primary"
                                  sx={{ 
                                    fontWeight: 600,
                                    minWidth: 50,
                                    '&:hover': { transform: 'scale(1.1)' }
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                  <Chip 
                                    label={completedActions} 
                                    size="medium" 
                                    color="success"
                                    sx={{ 
                                      fontWeight: 600,
                                      minWidth: 50,
                                      '&:hover': { transform: 'scale(1.1)' }
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      width: 30,
                                      height: 6,
                                      borderRadius: 3,
                                      bgcolor: 'grey.200',
                                      position: 'relative',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: `${totalActions > 0 ? (completedActions / totalActions) * 100 : 0}%`,
                                        height: '100%',
                                        bgcolor: 'success.main',
                                        borderRadius: 3,
                                        transition: 'width 0.5s ease'
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={pendingActions} 
                                  size="medium" 
                                  color={pendingActions > 0 ? 'error' : 'default'}
                                  sx={{ 
                                    fontWeight: 600,
                                    minWidth: 50,
                                    '&:hover': { transform: 'scale(1.1)' }
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={status} 
                                  size="medium" 
                                  color={statusColor}
                                  sx={{ 
                                    fontWeight: 600,
                                    minWidth: 100,
                                    '&:hover': { transform: 'scale(1.05)' }
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        });
                    })()}
                  </TableBody>
                </Table>
              </TableContainer>

            </Paper>

            {/* 4. Kritiklik Bazlı DÖF Dağılımı */}
            <Paper sx={{ 
              p: 0, 
              borderRadius: 3, 
              mb: 4, 
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ 
                p: 3, 
                bgcolor: 'info.main', 
                color: 'white',
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <TrendingUpIcon />
                <Typography variant="h6" fontWeight={600}>
                  4. Kritiklik Bazlı DÖF Dağılımı
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 450 }}>
                <Table stickyHeader size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'info.main',
                        color: 'info.main'
                      }}>
                        Kritiklik Seviyesi
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'info.main',
                        color: 'info.main'
                      }}>
                        Toplam DÖF
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'info.main',
                        color: 'info.main'
                      }}>
                        Gecikmiş
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'info.main',
                        color: 'info.main'
                      }}>
                        Kapanmış
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'info.main',
                        color: 'info.main'
                      }}>
                        Ortalama Süre
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(() => {
                      return PRIORITY_OPTIONS.map(priority => {
                        const priorityRecords = metrics.filteredRecords.filter(r => r.priority === priority.value);
                        const totalCount = priorityRecords.length;
                        const overdueCount = priorityRecords.filter(r => r.delayStatus === 'overdue').length;
                        const closedCount = priorityRecords.filter(r => r.status === 'closed').length;
                        const avgTime = closedCount > 0 ? 
                          Math.round(priorityRecords
                            .filter(r => r.status === 'closed' && r.closedDate && r.openingDate)
                            .reduce((acc, r) => {
                              const days = Math.abs(new Date(r.closedDate!).getTime() - new Date(r.openingDate).getTime()) / (1000 * 60 * 60 * 24);
                              return acc + days;
                            }, 0) / closedCount) : 0;
                        
                        if (totalCount === 0) return null;
                        
                        return (
                          <TableRow 
                            key={priority.value} 
                            hover
                            sx={{ 
                              '&:hover': { 
                                bgcolor: 'info.50',
                                transform: 'scale(1.002)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                              },
                              '&:nth-of-type(even)': {
                                bgcolor: 'grey.25'
                              },
                              borderLeft: '4px solid',
                              borderColor: priority.color
                            }}
                            onClick={() => handlePriorityClick(priority.value)}
                          >
                            <TableCell sx={{ 
                              fontWeight: 600,
                              color: 'text.primary',
                              fontSize: '0.95rem'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: priority.color
                                  }}
                                />
                                <Typography variant="body2" fontWeight={600}>
                                  {priority.label}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={totalCount} 
                                size="medium" 
                                sx={{
                                  bgcolor: priority.color,
                                  color: 'white',
                                  fontWeight: 600,
                                  minWidth: 50,
                                  '&:hover': { transform: 'scale(1.1)' }
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <Chip 
                                  label={overdueCount} 
                                  size="medium" 
                                  color={overdueCount > 0 ? 'error' : 'success'}
                                  sx={{ 
                                    fontWeight: 600,
                                    minWidth: 50,
                                    '&:hover': { transform: 'scale(1.1)' }
                                  }}
                                />
                                {overdueCount > 0 && (
                                  <Box
                                    sx={{
                                      width: 30,
                                      height: 6,
                                      borderRadius: 3,
                                      bgcolor: 'grey.200',
                                      position: 'relative',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: `${(overdueCount / totalCount) * 100}%`,
                                        height: '100%',
                                        bgcolor: 'error.main',
                                        borderRadius: 3,
                                        transition: 'width 0.5s ease'
                                      }}
                                    />
                                  </Box>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <Chip 
                                  label={closedCount} 
                                  size="medium" 
                                  color="success"
                                  sx={{ 
                                    fontWeight: 600,
                                    minWidth: 50,
                                    '&:hover': { transform: 'scale(1.1)' }
                                  }}
                                />
                                <Box
                                  sx={{
                                    width: 30,
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: 'grey.200',
                                    position: 'relative',
                                    overflow: 'hidden'
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: `${(closedCount / totalCount) * 100}%`,
                                      height: '100%',
                                      bgcolor: 'success.main',
                                      borderRadius: 3,
                                      transition: 'width 0.5s ease'
                                    }}
                                  />
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Typography 
                                variant="body2" 
                                fontWeight={600}
                                sx={{ 
                                  px: 2, 
                                  py: 0.5, 
                                  borderRadius: 1,
                                  bgcolor: avgTime > 30 ? 'error.50' : avgTime > 15 ? 'warning.50' : 'success.50',
                                  color: avgTime > 30 ? 'error.main' : avgTime > 15 ? 'warning.main' : 'success.main'
                                }}
                              >
                                {avgTime} gün
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      }).filter(Boolean);
                    })()}
                  </TableBody>
                </Table>
              </TableContainer>

            </Paper>

            {/* 5. En Çok Tekrar Eden Kök Nedenler */}
            <Paper sx={{ 
              p: 0, 
              borderRadius: 3, 
              mb: 4, 
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ 
                p: 3, 
                bgcolor: 'secondary.main', 
                color: 'white',
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <SearchIcon />
                <Typography variant="h6" fontWeight={600}>
                  5. En Çok Tekrar Eden Kök Nedenler
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 450 }}>
                <Table stickyHeader size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'secondary.main',
                        color: 'secondary.main'
                      }}>
                        Kök Neden Kategorisi
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'grey.50',
                        borderBottom: '2px solid',
                        borderColor: 'secondary.main',
                        color: 'secondary.main'
                      }}>
                        Tekrar Sayısı
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(() => {
                      // Context7 - Gelişmiş Kök Neden Kategorileme Analizi
                      const categoryMap = new Map<string, number>();
                      
                      console.log('🔍 Context7 - Root Cause Analysis Debug:');
                      console.log('📊 Filtered Records:', metrics.filteredRecords.length);
                      console.log('🎯 Sample Records:', metrics.filteredRecords.slice(0, 3));
                      console.log('💾 LocalStorage Data:', safeGetFromLocalStorage('dofRecords') ? 'Found' : 'Empty');
                      
                      metrics.filteredRecords.forEach(record => {
                        if (record.rootCause) {
                          console.log('📝 Processing record:', {
                            id: record.id,
                            rootCause: record.rootCause,
                            metadata: record.metadata
                          });
                          
                          // Context7 - Önce metadata'daki kategoriye bak
                          if (record.metadata?.rootCauseCategory) {
                            categoryMap.set(record.metadata.rootCauseCategory, (categoryMap.get(record.metadata.rootCauseCategory) || 0) + 1);
                            console.log('✅ Used metadata category:', record.metadata.rootCauseCategory);
                          } else {
                            // Metadata yoksa, real-time kategorileme yap
                            const match = findBestRootCauseCategory(record.rootCause);
                            console.log('🎯 Real-time match:', match);
                            
                            if (match.confidence > 20) {
                              // Kategori eşleşmesi bulundu
                              categoryMap.set(match.category, (categoryMap.get(match.category) || 0) + 1);
                              console.log('✅ Added to category:', match.category);
                            } else {
                              // Kategori bulunamadı, "Diğer" kategorisine ekle
                              categoryMap.set('Diğer', (categoryMap.get('Diğer') || 0) + 1);
                              console.log('📁 Added to "Diğer"');
                            }
                          }
                        }
                      });
                      
                      console.log('📈 Final category map:', Array.from(categoryMap.entries()));
                      
                      // Eğer hiç kategori yoksa boş mesajı göster
                      if (categoryMap.size === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={2} align="center" sx={{ py: 6 }}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Henüz kategorize edilmiş kök neden bulunmuyor
                  </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                  {metrics.filteredRecords.length === 0 
                                    ? 'Hiç DÖF kaydı yok' 
                                    : `${metrics.filteredRecords.length} kayıt var, ancak kök neden bilgisi eksik`}
                                </Typography>
                                {metrics.filteredRecords.length === 0 && (
                                  <Typography variant="caption" color="primary.main" sx={{ fontStyle: 'italic' }}>
                                    Dashboard sekmesine gidip "Yeni DÖF/8D Ekle" butonunu kullanarak kayıt oluşturabilirsiniz
                                  </Typography>
                                )}
                </Box>
                            </TableCell>
                          </TableRow>
                        );
                      }
                      
                      // Sort by count and prioritize main categories, then show max 8 entries
                      return Array.from(categoryMap.entries())
                        .sort((a, b) => {
                          // Önce ana kategorileri sırala
                          const aIsMain = ROOT_CAUSE_CATEGORIES.some(cat => cat.category === a[0]);
                          const bIsMain = ROOT_CAUSE_CATEGORIES.some(cat => cat.category === b[0]);
                          
                          if (aIsMain && !bIsMain) return -1;
                          if (!aIsMain && bIsMain) return 1;
                          
                          // Sonra sayıya göre sırala
                          return b[1] - a[1];
                        })
                        .slice(0, 8) // En fazla 8 satır göster
                        .map(([category, count]) => {
                          // Context7 - Kategori verilerini al (ana kategoriler + "Diğer")
                          const categoryData = ROOT_CAUSE_CATEGORIES.find(cat => cat.category === category);
                          
                          // "Diğer" kategorisi için özel ayarlar
                          const displayData = categoryData || {
                            category: 'Diğer',
                            color: '#9e9e9e',
                            icon: 'Diğer'
                          };
                          
                          return (
                            <TableRow 
                              key={category} 
                              hover
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: 'secondary.50',
                                  transform: 'scale(1.002)',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                },
                                '&:nth-of-type(even)': {
                                  bgcolor: 'grey.25'
                                },
                                borderLeft: '4px solid',
                                borderColor: displayData.color
                              }}
                              onClick={() => {
                                // Kök neden kategorisine göre filtreleme 
                                // Bu özellik geliştirilecek - şimdilik console log
                                console.log('🔍 Context7 - Root cause category clicked:', category);
                                setActiveTab(1); // DÖF Listesi tab'ına geç
                              }}
                            >
                              <TableCell sx={{ 
                                fontWeight: 600,
                                color: 'text.primary',
                                fontSize: '0.95rem'
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: '50%',
                                      bgcolor: displayData.color
                                    }}
                                  />
                                  <Typography variant="body2" fontWeight={600}>
                                    {category}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={count} 
                                  size="medium" 
                                  sx={{
                                    bgcolor: displayData.color + '20',
                                    color: displayData.color,
                                    fontWeight: 600,
                                    minWidth: 50,
                                    '&:hover': { 
                                      transform: 'scale(1.1)',
                                      bgcolor: displayData.color + '30'
                                    }
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        });
                    })()}
                  </TableBody>
                </Table>
              </TableContainer>

              </Paper>
          </Box>
        </Box>
      )}

      {/* ✅ Gelişmiş DÖF/8D Listesi Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>
              DÖF/8D Kayıtları ({enhancedFilteredRecords.length})
          </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ExcelIcon />}
                        size="small"
              >
                Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<PdfIcon />}
                        size="small"
              >
                PDF
              </Button>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateDialog}
                                sx={{ borderRadius: 2 }}
              >
                Yeni DÖF/8D Ekle
              </Button>
              

              

            </Box>
          </Box>



          {/* Uyarılar kaldırıldı - sessiz tablo */}

          <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: 'auto' }}>
            <Table sx={{ minWidth: 1200 }}>
                <TableHead>
                  <TableRow>
                  <TableCell sx={{ minWidth: 150, maxWidth: 150 }}>
                    <Typography fontWeight={600} variant="body2">DÖF No</Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 280, maxWidth: 280 }}>
                    <Typography fontWeight={600} variant="body2">Başlık</Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 140, maxWidth: 140 }}>
                    <Typography fontWeight={600} variant="body2">Sorumlu Birim</Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 100, maxWidth: 100 }}>
                    <Typography fontWeight={600} variant="body2">Kritiklik</Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 120, maxWidth: 120 }}>
                    <Typography fontWeight={600} variant="body2">Termin Tarihi</Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 130, maxWidth: 130 }}>
                    <Typography fontWeight={600} variant="body2">Kalan Gün</Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 100, maxWidth: 100 }}>
                    <Typography fontWeight={600} variant="body2">Statü</Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 120, maxWidth: 120 }}>
                    <Typography fontWeight={600} variant="body2">İşlemler</Typography>
                  </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                {enhancedFilteredRecords.map((record) => (
                  <TableRow 
                    key={record.id} 
                    hover
                    sx={{
                      bgcolor: record.priority === 'critical' ? 'error.50' : 
                               record.delayStatus === 'overdue' ? 'warning.50' : 'inherit'
                    }}
                  >
                      <TableCell sx={{ width: 150 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                          {record.dofNumber || record.id}
                        </Typography>
                        {record.priority === 'critical' && (
                              <WarningIcon color="error" fontSize="small" sx={{ width: 16, height: 16 }} />
                        )}
                      </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {new Date(record.openingDate || record.createdDate).toLocaleDateString('tr-TR')}
                        </Typography>
                                                 {/* MDİ numarası varsa göster */}
                        {record.type === 'mdi' && record.mdiNumber && (
                            <Chip 
                              label={`MDİ: ${record.mdiNumber}`} 
                              size="small" 
                              color="secondary" 
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          )}
                          </Box>
                      </TableCell>
                      <TableCell sx={{ width: 280 }}>
                        <Box sx={{ width: '100%' }}>
                          <Typography 
                            variant="body2" 
                            fontWeight={600}
                            sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: 1.3,
                              mb: 0.5,
                              fontSize: '0.85rem'
                            }}
                            title={record.title} // Full text on hover
                          >
                            {record.title || 'Başlık belirtilmemiş'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ 
                                fontSize: '0.7rem',
                                fontWeight: 500
                              }}
                            >
                              {DOF_TYPES.find(t => t.value === record.type)?.label || record.type}
                            </Typography>
                            {record.type === '8d' && record.d8Progress && (
                              <Chip 
                                label={`${record.d8Progress}%`} 
                                size="small" 
                                sx={{ 
                                  height: 16,
                                  fontSize: '0.65rem',
                                  bgcolor: record.d8Progress === 100 ? 'success.50' : 'warning.50',
                                  color: record.d8Progress === 100 ? 'success.dark' : 'warning.dark'
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                    <TableCell sx={{ width: 140 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        sx={{ 
                          fontSize: '0.85rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={record.department}
                      >
                        {record.department}
                        </Typography>
                      </TableCell>
                    <TableCell sx={{ width: 100 }}>
                        <Chip 
                        label={PRIORITY_OPTIONS.find(p => p.value === record.priority)?.label}
                          size="small"
                        sx={{ 
                          bgcolor: PRIORITY_OPTIONS.find(p => p.value === record.priority)?.color, 
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 22,
                          '& .MuiChip-label': {
                            px: 1
                          }
                        }}
                        />
                      </TableCell>
                    <TableCell sx={{ width: 120 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        {new Date(record.dueDate).toLocaleDateString('tr-TR')}
                        </Typography>
                      </TableCell>
                    <TableCell align="center" sx={{ width: 130 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        sx={{
                          fontSize: '0.8rem',
                          color: record.delayStatus === 'overdue' ? 'error.main' : 
                                 record.delayStatus === 'warning' ? 'warning.main' : 'text.primary'
                        }}
                      >
                        {record.delayMessage}
                        </Typography>
                      </TableCell>
                    <TableCell sx={{ width: 100 }}>
                      <Chip 
                        label={STATUS_OPTIONS.find(s => s.value === record.status)?.label}
                        size="small"
                        sx={{ 
                          bgcolor: STATUS_OPTIONS.find(s => s.value === record.status)?.color, 
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 22,
                          '& .MuiChip-label': {
                            px: 1
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ width: 120 }}>
                      <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => openViewDialog(record)} 
                          title="Görüntüle"
                          sx={{ width: 24, height: 24 }}
                        >
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => openEditDialog(record)} 
                          title="Düzenle"
                          sx={{ width: 24, height: 24 }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => generateDOFPDF(record)} 
                          title="PDF İndir"
                          sx={{ 
                            width: 24, 
                            height: 24,
                            color: 'error.main',
                            '&:hover': { bgcolor: 'error.50' }
                          }}
                        >
                          <PdfIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        {record.status !== 'closed' && (
                          <IconButton 
                            size="small" 
                            color="success" 
                            onClick={() => closeDOF(record.id, 'Manuel kapatma')}
                            title="DÖF'ü Kapat"
                            sx={{ width: 24, height: 24 }}
                          >
                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => deleteDOFRecord(record.id)}
                          title="Sil"
                          sx={{ width: 24, height: 24 }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {enhancedFilteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Filtrelere uygun DÖF kaydı bulunamadı.
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Filtreleri değiştirerek farklı sonuçlara ulaşabilirsiniz
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                </TableBody>
              </Table>
            </TableContainer>
                    </Box>
      )}
                    
      {/* Raporlar Tab */}
      {activeTab === 2 && (
                      <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" fontWeight={600}>
              DÖF/8D Gelişmiş Analiz Raporları
                        </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<ExcelIcon />} size="small">
                Tüm Raporları Excel'e Aktar
              </Button>
              <Button variant="outlined" startIcon={<PdfIcon />} size="small">
                Tüm Raporları PDF'e Aktar
              </Button>
                      </Box>
                      </Box>

          {/* Basit Rapor Kartları */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            {/* Özet Raporu */}
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <AssessmentIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Özet Raporu
                        </Typography>
                      </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Tüm DÖF/8D kayıtlarının genel durumu ve istatistikleri
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PdfIcon />}
                  sx={{ mb: 1 }}
                >
                  PDF İndir
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ExcelIcon />}
                >
                  Excel İndir
                </Button>
              </CardContent>
            </Card>

            {/* Departman Raporu */}
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <DashboardIcon color="secondary" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Departman Raporu
                          </Typography>
                        </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PdfIcon />}
                  sx={{ mb: 1 }}
                >
                  PDF İndir
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ExcelIcon />}
                >
                  Excel İndir
                </Button>
                  </CardContent>
                </Card>
            </Box>

        </Box>
      )}

      {/* ✅ Gelişmiş Dialog for Create/Edit/View */}
      <Dialog open={openDialog} onClose={() => {
        setOpenDialog(false);
      }} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: '8px', 
              bgcolor: formData.type === '8d' ? 'primary.main' : 'secondary.main', 
              color: 'white' 
            }}>
              {formData.type === '8d' ? '8D' : 'DÖF'}
            </Box>
            <Typography variant="h6">
              {dialogMode === 'create' ? 'Yeni DÖF/8D Oluştur' : 
               dialogMode === 'edit' ? 'DÖF/8D Düzenle' : 'DÖF/8D Görüntüle'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            


            {/* Temel Bilgiler */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Temel Bilgiler
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                <FormControl fullWidth>
                        <InputLabel>Tür</InputLabel>
                        <Select
                          value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                          disabled={dialogMode === 'view'}
                        >
                          {DOF_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                
                {/* ✅ UYGUNSUZLUK NUMARASI ALANI */}
                <TextField
                  fullWidth
                  label="Uygunsuzluk Numarası"
                  value={previewDOFNumber || 'Numara üretiliyor...'}
                  disabled
                  helperText={
                    dialogMode === 'create' 
                      ? (formData.type === 'mdi' 
                          ? 'Manuel numara giriniz' 
                          : 'Otomatik oluşturulur')
                      : ''
                  }
                  sx={{
                    '& .MuiInputBase-input': {
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      letterSpacing: '0.5px',
                      color: dialogMode === 'create' 
                        ? (previewDOFNumber === 'MDİ numarası giriniz' ? 'error.main' : 'primary.main')
                        : 'text.primary'
                    }
                  }}
                />
                
                <FormControl fullWidth>
                  <InputLabel>Departman</InputLabel>
                        <Select
                          value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                          disabled={dialogMode === 'view'}
                        >
                          {DEPARTMENTS.map((dept) => (
                            <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={formData.status || 'open'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    disabled={dialogMode === 'view'}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              bgcolor: status.color 
                            }} 
                          />
                          {status.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Kritiklik</InputLabel>
                  <Select
                    value={formData.priority || 'medium'}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    disabled={dialogMode === 'view'}
                  >
                    {PRIORITY_OPTIONS.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>{priority.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <TextField
                      fullWidth
                      label="Başlık"
                      value={formData.title}
                onChange={(e) => handleFormFieldChange('title', e.target.value)}
                      disabled={dialogMode === 'view'}
                sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                label="Problemin Tanımı"
                      multiline
                      rows={dialogMode === 'view' ? 8 : 4}
                      value={formData.description}
                onChange={(e) => handleFormFieldChange('description', e.target.value)}
                      disabled={dialogMode === 'view'}
                sx={{ 
                  mb: 2,
                  '& .MuiInputBase-root': {
                    fontSize: dialogMode === 'view' ? '16px' : '14px',
                    lineHeight: dialogMode === 'view' ? '1.6' : '1.4',
                  },
                  '& .MuiInputBase-input': {
                    padding: dialogMode === 'view' ? '16px' : '14px',
                  }
                }}
                    />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                      <TextField
                  fullWidth
                  label="Sorumlu Kişi"
                        value={formData.responsible}
                  onChange={(e) => handleFormFieldChange('responsible', e.target.value)}
                        disabled={dialogMode === 'view'}
                      />
                    <TextField
                      fullWidth
                  label="Hedef Kapanış Tarihi"
                      type="date"
                      value={formData.dueDate}
                  onChange={(e) => handleFormFieldChange('dueDate', e.target.value)}
                      disabled={dialogMode === 'view'}
                      InputLabelProps={{ shrink: true }}
                    />
                    </Box>
                    
                    {/* AÇILIŞ TARİHİ VE MDİ NUMARASI ALANLARI */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Açılış Tarihi"
                        type="date"
                        value={formData.openingDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData(prev => ({ ...prev, openingDate: e.target.value }))}
                        disabled={dialogMode === 'view'}
                        InputLabelProps={{ shrink: true }}
                        helperText="Geçmişe yönelik veriler için açılış tarihi girebilirsiniz"
                      />
                      
                                             {/* MDİ NUMARASI ALANI - Sadece MDİ türü seçildiğinde görünür */}
                      {formData.type === 'mdi' ? (
                        <TextField
                          fullWidth
                          label="MDİ Numarası"
                          value={formData.mdiNumber || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, mdiNumber: e.target.value }))}
                          disabled={dialogMode === 'view'}
                          placeholder="Örn: MDI-2024-001, ENG-CHG-2024-015"
                          helperText="Sistemden aldığınız MDİ numarasını manuel olarak giriniz"
                          required
                          error={formData.type === 'mdi' && !formData.mdiNumber?.trim()}
                        />
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                   bgcolor: 'grey.100', borderRadius: 1, p: 2, minHeight: '56px' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            {formData.type === 'mdi' ? 'MDİ numarası girilebilir' : 'MDİ türü seçildiğinde numara girişi aktifleşir'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    {/* ✅ DİNAMİK RED NEDENİ ALANI - Status 'rejected' seçildiğinde görünür */}
                    {formData.status === 'rejected' && (
                      <Box sx={{ mt: 2 }}>
                        <Alert severity="error" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            <strong>Red Nedeni Açıklaması Gerekli!</strong> Bu DÖF reddedilmiş durumda. 
                            Lütfen red nedenini detaylı bir şekilde açıklayın.
                          </Typography>
                        </Alert>
                        <TextField
                          fullWidth
                          label="🚫 Red Nedeni Açıklaması"
                          multiline
                          rows={4}
                          value={formData.rejectionReason || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                          disabled={dialogMode === 'view'}
                          placeholder="Red nedenini detaylı olarak açıklayın... (Örn: Teknik eksiklik, yeterli kanıt yok, prosedür uyumsuzluğu vb.)"
                          required
                          error={formData.status === 'rejected' && !formData.rejectionReason?.trim()}
                          helperText={
                            formData.status === 'rejected' && !formData.rejectionReason?.trim() 
                              ? "Bu alan DÖF reddedildiğinde zorunludur" 
                              : "Red nedeni açıklaması sistem geçmişinde saklanacaktır"
                          }
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'error.50'
                            },
                            '& .MuiInputLabel-root': {
                              color: 'error.main',
                              fontWeight: 600
                            }
                          }}
                        />
                      </Box>
                    )}

                    {/* ✅ DÖF KAPATMA ÖZELLİKLERİ - Status 'closed' seçildiğinde görünür */}
                    {formData.status === 'closed' && (
                      <Box sx={{ mt: 2 }}>
                        <Alert severity="success" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            <strong>DÖF Kapatma Bilgileri</strong> Bu DÖF kapatılmış durumda. 
                            Kapatma tarihi ve nedeni aşağıda belirtilmelidir.
                          </Typography>
                        </Alert>
                        
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 2 }}>
                          <TextField
                            fullWidth
                            label="✅ Kapatma Tarihi"
                            type="date"
                            value={formData.closedDate || new Date().toISOString().split('T')[0]}
                            onChange={(e) => setFormData(prev => ({ ...prev, closedDate: e.target.value }))}
                            disabled={dialogMode === 'view'}
                            InputLabelProps={{ shrink: true }}
                            required
                            helperText="DÖF'ün kapatıldığı tarih"
                            sx={{ 
                              '& .MuiOutlinedInput-root': {
                                bgcolor: 'success.50'
                              },
                              '& .MuiInputLabel-root': {
                                color: 'success.main',
                                fontWeight: 600
                              }
                            }}
                          />
                          
                          <FormControl fullWidth>
                            <InputLabel sx={{ color: 'success.main', fontWeight: 600 }}>✅ Kapatma Nedeni</InputLabel>
                            <Select
                              value={formData.metadata?.finalStatus || 'completed'}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                metadata: { 
                                  ...prev.metadata, 
                                  finalStatus: e.target.value 
                                } 
                              }))}
                              disabled={dialogMode === 'view'}
                              sx={{ 
                                bgcolor: 'success.50',
                                '& .MuiSelect-select': {
                                  color: 'success.main',
                                  fontWeight: 600
                                }
                              }}
                            >
                              <MenuItem value="completed">✅ Başarıyla Tamamlandı</MenuItem>
                              <MenuItem value="solved">🔧 Çözüm Bulundu</MenuItem>
                              <MenuItem value="implemented">⚙️ Uygulama Tamamlandı</MenuItem>
                              <MenuItem value="verified">🔍 Doğrulama Yapıldı</MenuItem>
                              <MenuItem value="no_action_needed">ℹ️ İşlem Gerektirmez</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        
                        <TextField
                          fullWidth
                          label="📝 Kapatma Notları (İsteğe Bağlı)"
                          multiline
                          rows={3}
                          value={formData.metadata?.closureNotes || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            metadata: { 
                              ...prev.metadata, 
                              closureNotes: e.target.value 
                            } 
                          }))}
                          disabled={dialogMode === 'view'}
                          placeholder="Kapatma ile ilgili ek notlar, açıklamalar veya gelecek için öneriler..."
                          helperText="Kapatma sürecinde yapılan işlemler ve sonuçlar hakkında detaylı bilgi"
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'success.25'
                            }
                          }}
                        />
                      </Box>
                    )}
            </Paper>

            {/* 8D Özel Alanları - Geliştirilmiş */}
            {formData.type === '8d' && (
              <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'primary.50', border: '2px solid', borderColor: 'primary.main' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AssessmentIcon color="primary" />
                  <Typography variant="h6" gutterBottom color="primary">
                    8D Metodolojisi Adımları
                  </Typography>
                </Box>
                {/* 8D bilgilendirme kaldırıldı - sessiz form */}
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { 
                      step: 1, 
                      title: 'D1 - Takım Kurma', 
                      desc: 'Çok disiplinli problem çözme takımını belirleyin ve rolleri atayın',
                      color: 'primary',
                      placeholder: 'Ekip Lideri: Ad Soyad - Rol\nKalite Uzmanı: Ad Soyad - Rol\nÜretim Sorumlusu: Ad Soyad - Rol\nMühendis: Ad Soyad - Rol'
                    },
                    { 
                      step: 2, 
                      title: 'D2 - Problemi Tanımlama', 
                      desc: 'IS/IS NOT formatında problemi net bir şekilde tanımlayın',
                      color: 'warning',
                      placeholder: 'Problem NE (IS):\n• Hangi ürün/süreçte?\n• Ne zaman oluyor?\n• Nerede görülüyor?\n\nProblem NE DEĞİL (IS NOT):\n• Hangi ürünlerde olmuyor?\n• Ne zaman olmuyor?'
                    },
                    { 
                      step: 3, 
                      title: 'D3 - Geçici Aksiyon', 
                      desc: 'Müşteriyi koruyacak ve problemin yayılmasını önleyecek geçici aksiyonlar',
                      color: 'error',
                      placeholder: '• Problemi izole etme\n• Mevcut stokları kontrol etme\n• Müşteri koruma önlemleri\n• Acil müdahale aksiyonları'
                    },
                    { 
                      step: 4, 
                      title: 'D4 - Kök Neden Analizi', 
                      desc: '5 Neden-Niçin, Balık Kılçığı vb. yöntemlerle kök nedeni belirleyin',
                      color: 'info',
                      placeholder: '5 NEDEN-NİÇİN Analizi:\n1. Problem: ...\n2. Neden: ... → Niçin: ...\n3. Neden: ... → Niçin: ...\n4. Neden: ... → Niçin: ...\n5. KÖK NEDEN: ...'
                    },
                    { 
                      step: 5, 
                      title: 'D5 - Kalıcı Düzeltici Aksiyon', 
                      desc: 'Kök nedeni elimine edecek kalıcı çözüm yöntemlerini seçin ve uygulayın',
                      color: 'success',
                      placeholder: '• Proses değişiklikleri\n• Prosedür güncellemeleri\n• Eğitim programları\n• Teknik iyileştirmeler\n• Kalite kontrol noktaları'
                    },
                    { 
                      step: 6, 
                      title: 'D6 - Uygulamak ve Doğrulamak', 
                      desc: 'Kalıcı aksiyonları uygulayın ve etkinliklerini doğrulayın',
                      color: 'secondary',
                      placeholder: '• Aksiyonların uygulanması\n• Etkinlik testleri\n• Ölçüm ve izleme\n• Sonuç değerlendirmesi\n• Doğrulama kanıtları'
                    },
                    { 
                      step: 7, 
                      title: 'D7 - Tekrarı Önlemek', 
                      desc: 'Sistemleri, prosedürleri ve kontrolleri güncelleyerek tekrarı önleyin',
                      color: 'primary',
                      placeholder: '• FMEA güncellemeleri\n• Prosedür revizyonları\n• Kontrol planı güncellemeleri\n• Eğitim programları genişletme\n• Sistem iyileştirmeleri'
                    },
                    { 
                      step: 8, 
                      title: 'D8 - Takımı Takdir Etmek', 
                      desc: 'Takım çalışmasını takdir edin ve öğrenilenleri organizasyonla paylaşın',
                      color: 'success',
                      placeholder: '• Takım başarılarının paylaşılması\n• Teşekkür ve takdir mesajları\n• Öğrenilen derslerin dokumentasyonu\n• Best practice paylaşımı'
                    }
                  ].map((step) => (
                    <Accordion 
                      key={step.step}
                      expanded={d8AccordionStates[`d${step.step}`] || false}
                      onChange={() => toggle8DAccordion(`d${step.step}`)}
                      sx={{ 
                        mb: 0.5,
                        '&:before': { display: 'none' },
                        boxShadow: 1,
                        borderRadius: 1,
                        '& .Mui-expanded': {
                          margin: 0
                        }
                      }}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ 
                          bgcolor: `${step.color}.50`,
                          borderRadius: 1,
                          '&.Mui-expanded': {
                            borderRadius: '4px 4px 0 0'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={`D${step.step}`} 
                            size="small" 
                            color={step.color as any} 
                            sx={{ fontWeight: 600 }}
                          />
                          <Typography fontWeight={600} color={`${step.color}.main`}>
                            {step.title}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ bgcolor: 'background.paper', pt: 2 }}>
                        {/* Adım açıklaması kaldırıldı - sessiz form */}
                    <TextField
                      fullWidth
                      multiline
                          rows={4}
                          placeholder={step.placeholder}
                      disabled={dialogMode === 'view'}
                        variant="outlined"
                          value={formData.d8Steps?.[`d${step.step}_${['team', 'problem', 'containment', 'rootCause', 'permanentAction', 'implementation', 'prevention', 'recognition'][step.step - 1]}`] || ''}
                          onChange={(e) => handle8DStepChange(step.step, e.target.value)}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'background.default'
                            }
                          }}
                        />
                        
                        {/* D1 için ek alanlar */}
                        {step.step === 1 && (
                          <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                            <TextField
                              label="Ekip Lideri"
                              placeholder="Ad Soyad"
                              disabled={dialogMode === 'view'}
                              size="small"
                            />
                            <TextField
                              label="Ekip Büyüklüğü"
                              type="number"
                              placeholder="5-8 kişi"
                              disabled={dialogMode === 'view'}
                              size="small"
                            />
                          </Box>
                        )}
                        
                        {/* D4 için analiz yöntemi seçimi */}
                        {step.step === 4 && (
                          <Box sx={{ mt: 2 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Analiz Yöntemi</InputLabel>
                              <Select
                                defaultValue=""
                                disabled={dialogMode === 'view'}
                              >
                                <MenuItem value="5why">5 Neden-Niçin</MenuItem>
                                <MenuItem value="fishbone">Balık Kılçığı (Ishikawa)</MenuItem>
                                <MenuItem value="4m">4M Analizi (Man-Machine-Material-Method)</MenuItem>
                                <MenuItem value="fta">Hata Ağacı Analizi</MenuItem>
                                <MenuItem value="pareto">Pareto Analizi</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
                
                {/* 8D Progress Indicator */}
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    8D Adım Tamamlanma Durumu
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={formData.d8Progress || 0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: formData.d8Progress === 100 ? 'success.main' : 
                                formData.d8Progress >= 50 ? 'warning.main' : 'primary.main'
                      }
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {Math.round((formData.d8Progress || 0) / 12.5)}/8 adım tamamlandı (%{formData.d8Progress || 0})
                    {formData.d8Progress === 100 && (
                      <Typography component="span" color="success.main" sx={{ ml: 1, fontWeight: 600 }}>
                        Tamamlandı!
                      </Typography>
                    )}
                  </Typography>
                    </Box>
              </Paper>
            )}

            {/* Kök Neden Analizi */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Kök Neden Analizi
              </Typography>
              
              {dialogMode === 'view' ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Belirlenen Kök Neden:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formData.rootCause || 'Belirtilmemiş'}
                  </Typography>
                </Box>
              ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Kategori Seçimi */}
                  <FormControl fullWidth>
                    <InputLabel>Kök Neden Kategorisi</InputLabel>
                    <Select
                      value={(() => {
                        if (formData.rootCause) {
                          const match = findBestRootCauseCategory(formData.rootCause);
                          return match.confidence > 50 ? match.category : '';
                        }
                        return '';
                      })()}
                      onChange={(e) => {
                        const selectedCategory = e.target.value;
                        const categoryData = ROOT_CAUSE_CATEGORIES.find(cat => cat.category === selectedCategory);
                        if (categoryData) {
                          // İlk nedeni varsayılan olarak seç
                          setFormData(prev => ({ ...prev, rootCause: categoryData.causes[0] }));
                        }
                      }}
                    >
                      <MenuItem value="">Kategori Seçin</MenuItem>
                      {ROOT_CAUSE_CATEGORIES.map((category) => (
                        <MenuItem key={category.category} value={category.category}>
                          <Typography>{category.category}</Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Önceden Tanımlanmış Nedenler */}
                  {(() => {
                    const currentMatch = findBestRootCauseCategory(formData.rootCause || '');
                    const categoryData = ROOT_CAUSE_CATEGORIES.find(cat => cat.category === currentMatch.category);
                    
                    if (categoryData) {
                      return (
                        <FormControl fullWidth>
                          <InputLabel>Önceden Tanımlanmış Nedenler</InputLabel>
                          <Select
                            value={formData.rootCause || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, rootCause: e.target.value }))}
                          >
                            {categoryData.causes.map((cause) => (
                              <MenuItem key={cause} value={cause}>
                                {cause}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      );
                    }
                    return null;
                  })()}

                  {/* ⚡ PERFORMANCE OPTIMIZED: Özel Kök Neden Girişi */}
                  <TextField
                    fullWidth
                    label="Özel Kök Neden (İsteğe Bağlı)"
                    multiline
                    rows={3}
                    value={formData.rootCause || ''}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      setFormData(prev => ({ ...prev, rootCause: inputValue }));
                      
                      // ⚡ PERFORMANCE: Removed real-time suggestions to prevent lag
                      // Akıllı öneriler sadece blur event'inde çalışsın
                    }}
                    onBlur={(e) => {
                      // Akıllı öneriler sadece focus kaybında çalış
                      const inputValue = e.target.value;
                      if (inputValue.length > 2) {
                        const suggestions = getRootCauseSuggestions(inputValue);
                        console.log('Kök Neden Önerileri:', suggestions);
                      }
                    }}
                    placeholder="Örn: Operatör eğitim eksikliği, makine bakım problemi, prosedür güncel değil..."
                    helperText="5 Neden-Niçin tekniği kullanarak kök nedeni detaylandırın"
                  />

                  {/* Akıllı Öneriler */}
                  {(() => {
                    if (formData.rootCause && formData.rootCause.length > 2) {
                      const suggestions = getRootCauseSuggestions(formData.rootCause);
                      if (suggestions.length > 0) {
                        return (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Önerilen Kök Nedenler:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {suggestions.slice(0, 3).map((suggestion, index) => (
                            <Chip
                                  key={index}
                                  label={`${suggestion.cause} (${Math.round(suggestion.confidence)}%)`}
                                  size="small"
                                  variant="outlined"
                                  onClick={() => setFormData(prev => ({ ...prev, rootCause: suggestion.cause }))}
                                  sx={{ 
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'primary.50' }
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        );
                      }
                    }
                    return null;
                  })()}
                </Box>
              )}
            </Paper>

            {/* Aksiyon Planı */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Aksiyon Planı
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Problemi çözmek için gerekli aksiyonları ekleyin
                </Typography>
                <Button 
                              size="small"
                  startIcon={<AddIcon />}
                  disabled={dialogMode === 'view'}
                  onClick={() => {
                    // Context7 - Add new action to formData
                    const newAction = {
                      id: `action_${Date.now()}`,
                      description: '',
                      responsible: '',
                      dueDate: '',
                      status: 'pending' as const
                    };
                    setFormData(prev => ({
                      ...prev,
                      actions: [...(prev.actions || []), newAction]
                    }));
                  }}
                >
                  Aksiyon Ekle
                </Button>
              </Box>
              
              {formData.actions && formData.actions.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {formData.actions.map((action, index) => (
                    <Card key={action.id || index} variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                      <CardContent sx={{ p: 3 }}>
                        {dialogMode === 'view' ? (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {action.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Sorumlu: {action.responsible} | Termin: {action.dueDate ? new Date(action.dueDate).toLocaleDateString('tr-TR') : 'Belirlenmemiş'}
                              </Typography>
                            </Box>
                            <Chip 
                              label={action.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                              size="small"
                              color={action.status === 'completed' ? 'success' : 'warning'}
                            />
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" color="primary">
                                Aksiyon #{index + 1}
                          </Typography>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => {
                                  // Context7 - Remove action from formData
                                  setFormData(prev => ({
                                    ...prev,
                                    actions: prev.actions?.filter((_, i) => i !== index) || []
                                  }));
                                }}
                              >
                                Sil
                              </Button>
                            </Box>
                          <TextField
                            fullWidth
                              label="Aksiyon Açıklaması"
                            multiline
                            rows={2}
                              value={action.description}
                              onChange={(e) => {
                                // Context7 - Update action description
                                setFormData(prev => ({
                                  ...prev,
                                  actions: prev.actions?.map((act, i) => 
                                    i === index ? { ...act, description: e.target.value } : act
                                  ) || []
                                }));
                              }}
                              placeholder="Ne yapılması gerekiyor?"
                            size="small"
                          />
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                              <TextField
                                label="Sorumlu Kişi"
                                value={action.responsible}
                                onChange={(e) => {
                                  // Context7 - Update action responsible
                                  setFormData(prev => ({
                                    ...prev,
                                    actions: prev.actions?.map((act, i) => 
                                      i === index ? { ...act, responsible: e.target.value } : act
                                    ) || []
                                  }));
                                }}
                                placeholder="Ad Soyad"
                                size="small"
                              />
                              <TextField
                                label="Termin Tarihi"
                                type="date"
                                value={action.dueDate}
                                onChange={(e) => {
                                  // Context7 - Update action due date
                                  setFormData(prev => ({
                                    ...prev,
                                    actions: prev.actions?.map((act, i) => 
                                      i === index ? { ...act, dueDate: e.target.value } : act
                                    ) || []
                                  }));
                                }}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                              />
                              <FormControl size="small" fullWidth>
                                <InputLabel>Durum</InputLabel>
                                <Select
                                  value={action.status}
                                  label="Durum"
                                  onChange={(e) => {
                                    // Context7 - Update action status
                                    setFormData(prev => ({
                                      ...prev,
                                      actions: prev.actions?.map((act, i) => 
                                        i === index ? { 
                                          ...act, 
                                          status: e.target.value as 'pending' | 'completed',
                                          completedDate: e.target.value === 'completed' ? new Date().toISOString().split('T')[0] : undefined
                                        } : act
                                      ) || []
                                    }));
                                  }}
                                >
                                  <MenuItem value="pending">Bekliyor</MenuItem>
                                  <MenuItem value="completed">Tamamlandı</MenuItem>
                                </Select>
                              </FormControl>
                      </Box>
                    </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                  Henüz aksiyon eklenmemiş
                </Typography>
              )}
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} size="large">
            {dialogMode === 'view' ? 'Kapat' : 'İptal'}
          </Button>
          {dialogMode !== 'view' && (
            <Button onClick={handleSave} variant="contained" size="large">
              {dialogMode === 'create' ? 'Oluştur' : 'Güncelle'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ✅ DÖF Kapatma Modal'ı - Şık ve Modern Tasarım */}
      <Dialog
        open={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 50%, #ef5350 100%)', 
          color: 'white',
          position: 'relative',
          py: 3,
          px: 4,
          textAlign: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                DÖF Kapatma İşlemi
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedRecordForClose?.dofNumber} - {selectedRecordForClose?.title}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ 
          p: 4, 
          backgroundColor: '#f8f9fa'
        }}>
          <Grid container spacing={3}>
            {/* Kapatma Tarihi */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Kapatma Tarihi"
                type="date"
                value={closureData.closedDate}
                onChange={(e) => setClosureData(prev => ({ ...prev, closedDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>

            {/* Kapatma Nedeni */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Kapatma Nedeni</InputLabel>
                <Select
                  value={closureData.closeReason}
                  label="Kapatma Nedeni"
                  onChange={(e) => setClosureData(prev => ({ ...prev, closeReason: e.target.value }))}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: 'white',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1976d2',
                      borderWidth: 2,
                    },
                  }}
                >
                  <MenuItem value="completed">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                      Başarıyla Tamamlandı
                    </Box>
                  </MenuItem>
                  <MenuItem value="resolved">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: 'info.main', fontSize: 20 }} />
                      Çözüm Bulundu
                    </Box>
                  </MenuItem>
                  <MenuItem value="cancelled">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CancelIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                      İptal Edildi
                    </Box>
                  </MenuItem>
                  <MenuItem value="transferred">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SwapHorizIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                      Transfer Edildi
                    </Box>
                  </MenuItem>
                  <MenuItem value="merged">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MergeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                      Birleştirildi
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Kapatma Notları */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Kapatma Notları (Opsiyonel)"
                multiline
                rows={3}
                value={closureData.closureNotes}
                onChange={(e) => setClosureData(prev => ({ ...prev, closureNotes: e.target.value }))}
                placeholder="Kapatma ile ilgili ek bilgiler..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white',
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>

            {/* Özet Bilgiler */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 2, 
                backgroundColor: '#e3f2fd',
                borderRadius: 2,
                border: '1px solid #1976d2'
              }}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
                  Kapatma Özeti
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="body2">
                    <strong>DÖF:</strong> {selectedRecordForClose?.dofNumber}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Departman:</strong> {selectedRecordForClose?.department}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Sorumlu:</strong> {selectedRecordForClose?.responsible}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Termin:</strong> {selectedRecordForClose?.dueDate ? new Date(selectedRecordForClose.dueDate).toLocaleDateString('tr-TR') : 'Belirlenmemiş'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Durum:</strong> {selectedRecordForClose?.delayStatus === 'overdue' ? 
                      <Chip label="Gecikmiş" color="error" size="small" sx={{ ml: 1 }} /> :
                      <Chip label="Zamanında" color="success" size="small" sx={{ ml: 1 }} />
                    }
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ 
          p: 4, 
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e0e0e0',
          gap: 2
        }}>
          <Button 
            onClick={() => setCloseModalOpen(false)} 
            variant="outlined"
            size="large"
            startIcon={<CancelIcon />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              borderColor: '#9e9e9e',
              color: '#616161',
              '&:hover': {
                borderColor: '#757575',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            İptal
          </Button>
          <Button 
            onClick={confirmCloseDOF}
            variant="contained" 
            size="large"
            startIcon={<CheckCircleIcon />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
              }
            }}
          >
            DÖF'ü Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DOF8DManagement; 