import React, { useState, useMemo } from 'react';
import {
  Typography,
  Box,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  TextField,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Engineering as EngineeringIcon,
  Construction as ConstructionIcon,
  FilterList as FilterListIcon,
  Calculate as CalculateIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

// Modern Types
interface WeldData {
  materialThickness: number;
  weldType: string;
  weldWidth: number;
  weldHeight?: number;
  defectCode: string;
  defectType: string;
  qualityLevel: string;
  dynamicParameters: { [key: string]: any };
  nominalThroatThickness?: number;
  actualThroatThickness?: number;
  legLength1?: number;
  legLength2?: number;
}

interface ModernCalculationResult {
  defectInfo: {
    code: string;
    name: string;
    description: string;
    category: string;
  };
  weldDetails?: {
    materialThickness: number;
    weldType: string;
    qualityLevel: string;
  };
  parameters: { [key: string]: any };
  calculation: {
    allowed: boolean;
    result: string;
    reason: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    [key: string]: any;
  };
  qualityLevel: string;
  standard: string;
  calculatedAt: string;
  timestamp?: string;
}

// Weld Types
const WELD_TYPES = [
  { value: 'butt', label: 'Alın Birleştirme', description: 'İki parçanın uç uca kaynaklanması' },
  { value: 'fillet', label: 'Köşe Birleştirme', description: 'L şeklinde birleştirme' },
  { value: 'edge', label: 'Kenar Birleştirme', description: 'Kenarların birleştirilmesi' },
  { value: 't-joint', label: 'T-Kaynağı', description: 'T şeklinde birleştirme' },
  { value: 'corner', label: 'Köşe Kaynağı', description: 'Köşe birleştirmesi' },
  { value: 'lap', label: 'Bindirme Kaynağı', description: 'Üst üste bindirme' },
];

// Defect Types - ISO 5817 Complete Classification
const DEFECT_TYPES = [
  // 3.1 YÜZEY KUSURLARI (Surface Imperfections)
  
  // 1.1 Çatlaklar (ISO 6520-1 Ref. No. 100)
  {
    code: '100',
    name: 'Çatlaklar',
    description: 'ISO 6520-1 Ref. No. 100 - Kaynak ve çevresindeki tüm çatlak türleri',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness'],
    calculation: 'surface_crack'
  },
  // 1.2 Krater Çatlağı (ISO 6520-1 Ref. No. 104)
  {
    code: '104',
    name: 'Krater Çatlağı',
    description: 'ISO 6520-1 Ref. No. 104 - Kaynak krateri içindeki çatlaklar',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness'],
    calculation: 'crater_crack'
  },
  
  // 1.3 Yüzey Gözeneği (ISO 6520-1 Ref. No. 2017)
  {
    code: '2017',
    name: 'Yüzey Gözeneği',
    description: 'ISO 6520-1 Ref. No. 2017 - Tek bir deliğin en büyük boyutu',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet'],
    parameters: ['thickness', 'diameter', 'nominalThickness'],
    calculation: 'surface_porosity'
  },
  
  // 1.4 Uç Krater Olukları (ISO 6520-1 Ref. No. 2025)
  {
    code: '2025',
    name: 'Uç Krater Olukları',
    description: 'ISO 6520-1 Ref. No. 2025 - Kaynak sonunda oluşan krater olukları',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness', 'depth'],
    calculation: 'end_crater_groove'
  },
  
  // 1.5 Yetersiz Ergime (ISO 6520-1 Ref. No. 401)
  {
    code: '401',
    name: 'Yetersiz Ergime (Yetersiz Birleşme)',
    description: 'ISO 6520-1 Ref. No. 401 - Ana metal ile kaynak metali arasında yetersiz birleşme',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness'],
    calculation: 'insufficient_fusion'
  },
  
  // 1.6 Tamamlanmamış Kök Nüfuziyeti (ISO 6520-1 Ref. No. 4021)
  {
    code: '4021',
    name: 'Tamamlanmamış Kök Nüfuziyeti',
    description: 'ISO 6520-1 Ref. No. 4021 - Sadece tek taraftan alın kaynakları için',
    category: 'yüzey',
    appliesTo: ['butt'],
    parameters: ['thickness', 'depth'],
    calculation: 'incomplete_root_penetration'
  },
  
  // 1.7 Sürekli ve Kesintili Yanma Olukları (ISO 6520-1 Ref. No. 5011, 5012)
  {
    code: '5011',
    name: 'Sürekli Yanma Olukları',
    description: 'ISO 6520-1 Ref. No. 5011 - Düzgün geçiş gerektiren sistemik olmayan kusur',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness', 'depth'],
    calculation: 'continuous_undercut'
  },
  
  {
    code: '5012',
    name: 'Kesintili Yanma Olukları',
    description: 'ISO 6520-1 Ref. No. 5012 - Düzgün geçiş gerektiren sistemik olmayan kusur',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness', 'depth'],
    calculation: 'intermittent_undercut'
  },
  
  // 1.8 Çekme Olukları (Büzülme Çukurları) (ISO 6520-1 Ref. No. 5013)
  {
    code: '5013',
    name: 'Çekme Olukları (Büzülme Çukurları)',
    description: 'ISO 6520-1 Ref. No. 5013 - Düzgün geçiş gerektiren büzülme çukurları',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness', 'depth'],
    calculation: 'shrinkage_groove'
  },
  
  // 1.9 Aşırı Kaynak Metali (Alın Kaynağı) (ISO 6520-1 Ref. No. 502)
  {
    code: '502',
    name: 'Aşırı Kaynak Metali (Alın Kaynağı)',
    description: 'ISO 6520-1 Ref. No. 502 - Düzgün geçiş gerektiren aşırı kaynak metali',
    category: 'yüzey',
    appliesTo: ['butt'],
    parameters: ['weldWidth', 'height'],
    calculation: 'excess_weld_metal_butt'
  },
  
  // 1.10 Aşırı Dışbükeylik (İç Köşe Kaynağı) (ISO 6520-1 Ref. No. 503)
  {
    code: '503',
    name: 'Aşırı Dışbükeylik (İç Köşe Kaynağı)',
    description: 'ISO 6520-1 Ref. No. 503 - İç köşe kaynağında aşırı dışbükeylik',
    category: 'yüzey',
    appliesTo: ['fillet'],
    parameters: ['weldWidth', 'height'],
    calculation: 'excess_convexity_fillet'
  },
  
  // 1.11 Aşırı Nüfuziyet (ISO 6520-1 Ref. No. 504)
  {
    code: '504',
    name: 'Aşırı Nüfuziyet',
    description: 'ISO 6520-1 Ref. No. 504 - Kaynak penetrasyonunun fazla olması',
    category: 'yüzey',
    appliesTo: ['butt'],
    parameters: ['thickness', 'weldWidth', 'height'],
    calculation: 'excess_penetration'
  },
  
  // 1.12 Yanlış Kaynak Kenarı (ISO 6520-1 Ref. No. 505)
  {
    code: '505',
    name: 'Yanlış Kaynak Kenarı',
    description: 'ISO 6520-1 Ref. No. 505 - Kaynak kenarlarında yanlış açı',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet'],
    parameters: ['angle'],
    calculation: 'incorrect_weld_toe'
  },
  
  // 1.13 Binme/Taşma (ISO 6520-1 Ref. No. 506)
  {
    code: '506',
    name: 'Binme/Taşma (Overlap)',
    description: 'ISO 6520-1 Ref. No. 506 - Kaynak metalinin ana metal üzerine taşması',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['weldWidth', 'height'],
    calculation: 'overlap'
  },
  
  // 1.14 Çökme / Yetersiz Oldurulmuş Kaynak Ağzı (ISO 6520-1 Ref. No. 509, 511)
  {
    code: '509',
    name: 'Çökme / Yetersiz Oldurulmuş Kaynak Ağzı',
    description: 'ISO 6520-1 Ref. No. 509, 511 - Düzgün geçiş gerektiren çökme',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness', 'depth'],
    calculation: 'sagging_concave_root'
  },
  
  // 1.15 İçe Yanma (ISO 6520-1 Ref. No. 510)
  {
    code: '510',
    name: 'İçe Yanma',
    description: 'ISO 6520-1 Ref. No. 510 - Ana metalde aşırı ısıdan kaynaklanan yanma',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness'],
    calculation: 'burn_through'
  },
  
  // 1.16 İç Köşe Kaynağının Aşırı Asimetrikliği (ISO 6520-1 Ref. No. 512)
  {
    code: '512',
    name: 'İç Köşe Kaynağının Aşırı Asimetrikliği',
    description: 'ISO 6520-1 Ref. No. 512 - Aşırı kenar (bacak) eşitsizliği',
    category: 'yüzey',
    appliesTo: ['fillet'],
    parameters: ['nominalLeg', 'height'],
    calculation: 'excessive_asymmetry'
  },
  
  // 1.17 Kök İçbükeyliği (ISO 6520-1 Ref. No. 515)
  {
    code: '515',
    name: 'Kök İçbükeyliği',
    description: 'ISO 6520-1 Ref. No. 515 - Düzgün geçiş gerektiren kök içbükeyliği',
    category: 'yüzey',
    appliesTo: ['butt'],
    parameters: ['thickness', 'depth'],
    calculation: 'root_concavity'
  },
  
  // 1.18 Kök Gözenekleri (ISO 6520-1 Ref. No. 516)
  {
    code: '516',
    name: 'Kök Gözenekleri',
    description: 'ISO 6520-1 Ref. No. 516 - Kaynak kökünde süngerimsi oluşum',
    category: 'yüzey',
    appliesTo: ['butt', 't-joint'],
    parameters: ['thickness'],
    calculation: 'root_porosity'
  },
  
  // 1.19 Kötü Yeniden Başlatma (ISO 6520-1 Ref. No. 517)
  {
    code: '517',
    name: 'Kötü Yeniden Başlatma',
    description: 'ISO 6520-1 Ref. No. 517 - Yeniden başlatma sebebiyle oluşan kusur',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness'],
    calculation: 'poor_restart'
  },
  
  // 1.20 Yetersiz (Boğaz) Kalınlık (ISO 6520-1 Ref. No. 5213)
  {
    code: '5213',
    name: 'Yetersiz (Boğaz) Kalınlık',
    description: 'ISO 6520-1 Ref. No. 5213 - Köşe kaynakta yetersiz boğaz kalınlığı',
    category: 'yüzey',
    appliesTo: ['fillet'],
    parameters: ['thickness', 'nominalLeg', 'depth'],
    calculation: 'insufficient_throat_thickness'
  },
  
  // 1.21 Aşırı (Boğaz) Kalınlık (ISO 6520-1 Ref. No. 5214)
  {
    code: '5214',
    name: 'Aşırı (Boğaz) Kalınlık',
    description: 'ISO 6520-1 Ref. No. 5214 - İç köşe kaynağının gerçek kalınlığı çok büyük',
    category: 'yüzey',
    appliesTo: ['fillet'],
    parameters: ['nominalLeg', 'height'],
    calculation: 'excessive_throat_thickness'
  },
  
  // 1.22 Rastgele Ark (ISO 6520-1 Ref. No. 601)
  {
    code: '601',
    name: 'Rastgele Ark',
    description: 'ISO 6520-1 Ref. No. 601 - Kontrolsüz ark çarpması',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness'],
    calculation: 'stray_arc'
  },
  
  // 1.23 Sıçrantı (ISO 6520-1 Ref. No. 602)
  {
    code: '602',
    name: 'Sıçrantı',
    description: 'ISO 6520-1 Ref. No. 602 - Kaynak çevresindeki metal sıçramaları',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness'],
    calculation: 'spatter'
  },
  
  // 1.24 Temper Renkleri (ISO 6520-1 Ref. No. 610)
  {
    code: '610',
    name: 'Temper Renkleri (Görünür Oksit)',
    description: 'ISO 6520-1 Ref. No. 610 - Yüzeyde görünür oksitlenme',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness'],
    calculation: 'temper_colors'
  },

  // 3.2 İÇ KUSURLAR (Internal Imperfections)
  
  // 2.1 Çatlaklar (ISO 6520-1 Ref. No. 100)
  {
    code: '100_internal',
    name: 'İç Çatlaklar',
    description: 'ISO 6520-1 Ref. No. 100 - Mikro çatlaklar ve krater çatlakları haricindeki tüm çatlaklar',
    category: 'dahili',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness'],
    calculation: 'internal_crack'
  },
  
  // 2.2 Mikro Çatlaklar (ISO 6520-1 Ref. No. 1001)
  {
    code: '1001',
    name: 'Mikro Çatlaklar',
    description: 'ISO 6520-1 Ref. No. 1001 - Genellikle mikroskop (50x) altında görülebilen çatlaklar',
    category: 'dahili',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness'],
    calculation: 'micro_crack'
  },
  
  // 2.3 Gaz Deliği / Düzenli Dağılmış Gözenek (ISO 6520-1 Ref. No. 2011, 2012)
  {
    code: '2011',
    name: 'Gaz Deliği / Düzenli Dağılmış Gözenek',
    description: 'ISO 6520-1 Ref. No. 2011, 2012 - Kaynak metalinde düzenli dağılmış gözenekler',
    category: 'dahili',
    appliesTo: ['butt', 'fillet'],
    parameters: ['thickness', 'diameter', 'nominalThickness'],
    calculation: 'gas_pore_distributed'
  },
  
  // 2.4 Toplu (Mevzii) Gözenek (ISO 6520-1 Ref. No. 2013)
  {
    code: '2013',
    name: 'Toplu (Mevzii) Gözenek',
    description: 'ISO 6520-1 Ref. No. 2013 - Belirli bölgelerde toplanan gözenekler',
    category: 'dahili',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness', 'diameter'],
    calculation: 'localized_porosity'
  },
  
  // 2.5 Doğrusal Gözenek (ISO 6520-1 Ref. No. 2014)
  {
    code: '2014',
    name: 'Doğrusal Gözenek',
    description: 'ISO 6520-1 Ref. No. 2014 - Doğrusal dizilimde gözenekler',
    category: 'dahili',
    appliesTo: ['butt', 'fillet'],
    parameters: ['thickness', 'nominalThickness', 'height', 'length'],
    calculation: 'linear_porosity'
  },
  
  // 2.6 Uzamış Boşluk / Kurt Delikleri (ISO 6520-1 Ref. No. 2015, 2016)
  {
    code: '2015',
    name: 'Uzamış Boşluk / Kurt Delikleri',
    description: 'ISO 6520-1 Ref. No. 2015, 2016 - Uzun boşluk şeklindeki kusurlar',
    category: 'dahili',
    appliesTo: ['butt', 'fillet'],
    parameters: ['thickness', 'nominalThickness', 'height', 'length'],
    calculation: 'elongated_cavity'
  },
  
  // 2.7 Çekme Oyuğu (ISO 6520-1 Ref. No. 202)
  {
    code: '202',
    name: 'Çekme Oyuğu',
    description: 'ISO 6520-1 Ref. No. 202 - Yüzeye çıkmayan kısa kusurlar müsaade edilir',
    category: 'dahili',
    appliesTo: ['butt', 'fillet'],
    parameters: ['thickness', 'nominalThickness', 'height'],
    calculation: 'shrinkage_cavity'
  },
  
  // 2.8 Krater Borusu (ISO 6520-1 Ref. No. 2024)
  {
    code: '2024',
    name: 'Krater Borusu',
    description: 'ISO 6520-1 Ref. No. 2024 - h veya l\'nin en büyük değeri ölçülecek',
    category: 'dahili',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness', 'height', 'length'],
    calculation: 'crater_pipe'
  },
  
  // 2.9 Katı Kalıntılar (ISO 6520-1 Ref. No. 300, 301, 302, 303)
  {
    code: '300',
    name: 'Katı Kalıntılar (Cüruf, Toz, Oksit)',
    description: 'ISO 6520-1 Ref. No. 300, 301, 302, 303 - Kaynak metalinde katı kalıntılar',
    category: 'dahili',
    appliesTo: ['butt', 'fillet'],
    parameters: ['thickness', 'nominalThickness', 'height', 'length'],
    calculation: 'solid_inclusions'
  },
  
  // 2.10 Bakır Haricindeki Diğer Metalik Kalıntılar (ISO 6520-1 Ref. No. 304)
  {
    code: '304',
    name: 'Bakır Haricindeki Diğer Metalik Kalıntılar',
    description: 'ISO 6520-1 Ref. No. 304 - Bakır dışındaki metalik yabancı maddeler',
    category: 'dahili',
    appliesTo: ['butt', 'fillet'],
    parameters: ['thickness', 'nominalThickness', 'height'],
    calculation: 'metallic_inclusions'
  },
  
  // 2.11 Bakır Kalıntıları (ISO 6520-1 Ref. No. 3042)
  {
    code: '3042',
    name: 'Bakır Kalıntıları',
    description: 'ISO 6520-1 Ref. No. 3042 - Kaynak metalinde bakır kalıntıları',
    category: 'dahili',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness'],
    calculation: 'copper_inclusions'
  },
  
  // 2.12 Ergime Noksanlığı (ISO 6520-1 Ref. No. 401, 4011, 4012, 4013)
  {
    code: '401_internal',
    name: 'Ergime Noksanlığı (Yetersiz Ergime)',
    description: 'ISO 6520-1 Ref. No. 401, 4011, 4012, 4013 - Yan duvar, pasolar arası, kök ergime noksanlığı',
    category: 'dahili',
    appliesTo: ['butt', 'fillet'],
    parameters: ['thickness', 'nominalThickness', 'height'],
    calculation: 'internal_lack_of_fusion'
  },
  
  // 2.13 Nüfuziyet Noksanlığı (ISO 6520-1 Ref. No. 402)
  {
    code: '402',
    name: 'Nüfuziyet Noksanlığı',
    description: 'ISO 6520-1 Ref. No. 402 - T-birleştirme veya kısmi nüfuziyet için',
    category: 'dahili',
    appliesTo: ['butt', 't-joint'],
    parameters: ['thickness', 'nominalThickness', 'height'],
    calculation: 'lack_of_penetration'
  },
  
  // 3.3 BİRLEŞTİRME GEOMETRİSİNDEKİ KUSURLAR (Shape and Dimensional Imperfections)
  
  // 3.1 Doğrusal Kaçıklık / Tabakalar Arası Doğrusal Kaçıklık (ISO 6520-1 Ref. No. 507, 5071, 5072)
  {
    code: '507',
    name: 'Doğrusal Kaçıklık',
    description: 'ISO 6520-1 Ref. No. 507, 5071, 5072 - Doğru konumdan sapma ile ilgili sınırlar',
    category: 'geometri',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness', 'height'],
    calculation: 'linear_misalignment'
  },
  
  // 3.2 Uygun Olmayan Kök Dolgu Kaynağı (ISO 6520-1 Ref. No. 617)
  {
    code: '617',
    name: 'Uygun Olmayan Kök Dolgu Kaynağı',
    description: 'ISO 6520-1 Ref. No. 617 - Verilen sınırlar içindeki doğrusal kaçıklık sistemik kusur değil',
    category: 'geometri',
    appliesTo: ['butt', 't-joint'],
    parameters: ['thickness', 'nominalLeg', 'height'],
    calculation: 'inappropriate_root_filling'
  },
  
  // 3.4 ÇOKLU KUSURLAR (Multiple Imperfections)
  
  // 4.1 Her Bir Enine Kesitteki Çoklu Kusurlar
  {
    code: 'MULTI_001',
    name: 'Her Bir Enine Kesitteki Çoklu Kusurlar',
    description: 'En olumsuz birleştirme aralığındaki enine kesit (makrograf)',
    category: 'çoklu',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness', 'nominalThickness', 'totalHeight'],
    calculation: 'multiple_cross_section'
  },
  
  // 4.2 Boyuna Yönde İzdüşüm veya Enine Kesit Alanı
  {
    code: 'MULTI_002',
    name: 'Boyuna Yönde İzdüşüm veya Enine Kesit Alanı',
    description: 'Σ hxl alanlarının toplamı lp x wp değerlendirme alanının yüzdesi olarak hesaplanmalıdır',
    category: 'çoklu',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness', 'totalArea'],
    calculation: 'multiple_longitudinal_area'
  },

  // LEGACY DEFINITIONS (will be cleaned up)
  {
    code: '301',
    name: 'Akı Kalıntısı',
    description: 'Kaynak metalinde akı artıkları',
    category: 'dahili',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['length', 'width'],
    calculation: 'inclusion_based'
  },
  {
    code: '302',
    name: 'Oksit Kalıntısı',
    description: 'Kaynak metalinde oksit artıkları',
    category: 'dahili',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['length', 'width'],
    calculation: 'inclusion_based'
  },
  {
    code: '303',
    name: 'Metal Kalıntısı',
    description: 'Yabancı metal parçacıkları',
    category: 'dahili',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['length', 'width'],
    calculation: 'inclusion_based'
  },

  // Group 4: Lack of fusion and penetration (400-403)
  {
    code: '401',
    name: 'Kenarda Kaynaşmama',
    description: 'Kaynak kenarında ana metal ile kaynaşmama',
    category: 'fusion',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['length', 'depth'],
    calculation: 'fusion_defect'
  },
  {
    code: '402',
    name: 'Katmanlar Arası Kaynaşmama',
    description: 'Kaynak katmanları arasında kaynaşmama',
    category: 'fusion',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['length', 'depth'],
    calculation: 'fusion_defect'
  },
  {
    code: '403',
    name: 'Kök Kaynaşması Eksikliği',
    description: 'Kaynak kökünde kaynaşma eksikliği',
    category: 'fusion',
    appliesTo: ['butt', 't-joint'],
    parameters: ['length', 'depth'],
    calculation: 'root_fusion'
  },
  {
    code: '4011',
    name: 'Yetersiz Nüfuziyet',
    description: 'Kaynak kökünde yetersiz nüfuziyet',
    category: 'penetration',
    appliesTo: ['butt', 't-joint'],
    parameters: ['thickness', 'rootPenetration'],
    calculation: 'penetration_based'
  },
  {
    code: '4012',
    name: 'Aşırı Nüfuziyet',
    description: 'Kaynak penetrasyonunun fazla olması',
    category: 'penetration',
    appliesTo: ['butt'],
    parameters: ['thickness', 'penetration'],
    calculation: 'excess_penetration'
  },

  // Group 5: Imperfect shape and dimensions (500-521)
  {
    code: '5011',
    name: 'Kaynak Çökük (Undercut)',
    description: 'Kaynak kenarında oluşan oyuklar',
    category: 'boyut',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['thickness', 'depth'],
    calculation: 'undercut_based'
  },
  {
    code: '5012',
    name: 'Aşırı Taşma',
    description: 'Kaynak metalinin aşırı taşması',
    category: 'boyut',
    appliesTo: ['butt', 'fillet'],
    parameters: ['width', 'height'],
    calculation: 'overflow_based'
  },
  {
    code: '5013',
    name: 'Düzensiz Kaynak Genişliği',
    description: 'Kaynak genişliğinin düzensizliği',
    category: 'boyut',
    appliesTo: ['butt', 'fillet'],
    parameters: ['nominalWidth', 'actualWidth'],
    calculation: 'width_variation'
  },
  {
    code: '5014',
    name: 'Düzensiz Kaynak Yüksekliği',
    description: 'Kaynak yüksekliğinin düzensizliği',
    category: 'boyut',
    appliesTo: ['butt', 'fillet'],
    parameters: ['nominalHeight', 'actualHeight'],
    calculation: 'height_variation'
  },
  {
    code: '5015',
    name: 'Yetersiz Boğaz Kalınlığı',
    description: 'Köşe kaynakta yetersiz boğaz kalınlığı',
    category: 'boyut',
    appliesTo: ['fillet'],
    parameters: ['nominalThickness', 'actualThickness'],
    calculation: 'throat_thickness'
  },
  {
    code: '5016',
    name: 'Aşırı Dışbükey',
    description: 'Kaynak yüzeyinin aşırı dışbükey olması',
    category: 'boyut',
    appliesTo: ['butt', 'fillet'],
    parameters: ['width', 'height'],
    calculation: 'convexity'
  },
  {
    code: '5017',
    name: 'Aşırı İçbükey',
    description: 'Kaynak yüzeyinin aşırı içbükey olması',
    category: 'boyut',
    appliesTo: ['butt'],
    parameters: ['width', 'depth'],
    calculation: 'concavity'
  },
  {
    code: '5018',
    name: 'Düzensiz Kaynak Yüzeyi',
    description: 'Kaynak yüzeyinin düzensizliği',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet'],
    parameters: ['roughness'],
    calculation: 'surface_roughness'
  },
  {
    code: '5019',
    name: 'Kaynak Sıçraması',
    description: 'Kaynak çevresindeki metal sıçramaları',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['coverage', 'size'],
    calculation: 'spatter'
  },
  {
    code: '5020',
    name: 'Temizlenmemiş Kaynak Başlangıcı',
    description: 'Kaynak başlangıç noktasının temizlenmemesi',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['length', 'height'],
    calculation: 'start_defect'
  },
  {
    code: '5021',
    name: 'Temizlenmemiş Kaynak Bitişi',
    description: 'Kaynak bitiş noktasının temizlenmemesi',
    category: 'yüzey',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['length', 'height'],
    calculation: 'end_defect'
  },

  // Group 6: Miscellaneous imperfections (600-618)
  {
    code: '601',
    name: 'Yeniden Başlatma Hatası',
    description: 'Kaynak yeniden başlatma noktasındaki hatalar',
    category: 'process',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['length', 'height'],
    calculation: 'restart_defect'
  },
  {
    code: '602',
    name: 'Çok Geçişli Kaynak Hatası',
    description: 'Çok geçişli kaynaklarda geçiş hataları',
    category: 'process',
    appliesTo: ['butt', 't-joint'],
    parameters: ['length', 'depth'],
    calculation: 'multipass_defect'
  },
  {
    code: '603',
    name: 'Yanık Deliği',
    description: 'Aşırı ısıdan kaynaklanan delikler',
    category: 'thermal',
    appliesTo: ['butt', 'edge'],
    parameters: ['diameter', 'depth'],
    calculation: 'burn_through'
  },
  {
    code: '604',
    name: 'Kaynak Dikişi Sapması',
    description: 'Kaynak dikişinin hedef hattan sapması',
    category: 'boyut',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['deviation', 'length'],
    calculation: 'deviation'
  },
  {
    code: '605',
    name: 'Yetersiz Köşe Boyu',
    description: 'Köşe kaynakta yetersiz bacak boyu',
    category: 'boyut',
    appliesTo: ['fillet'],
    parameters: ['nominalLeg', 'actualLeg'],
    calculation: 'leg_length'
  },
  {
    code: '606',
    name: 'Asimetrik Köşe Kaynak',
    description: 'Köşe kaynakta bacak boylarının eşitsizliği',
    category: 'boyut',
    appliesTo: ['fillet'],
    parameters: ['leg1', 'leg2'],
    calculation: 'asymmetric_fillet'
  },
  {
    code: '607',
    name: 'Kök Konkavitesi',
    description: 'Kaynak kökünde içbükey şekil',
    category: 'boyut',
    appliesTo: ['butt'],
    parameters: ['width', 'depth'],
    calculation: 'root_concavity'
  },
  {
    code: '608',
    name: 'Lineer Sapma',
    description: 'Kaynak ekseninin lineer sapması',
    category: 'boyut',
    appliesTo: ['butt', 'fillet', 't-joint'],
    parameters: ['deviation', 'length'],
    calculation: 'linear_misalignment'
  },
  {
    code: '609',
    name: 'Açısal Sapma',
    description: 'Kaynak açısının hedeften sapması',
    category: 'boyut',
    appliesTo: ['fillet', 't-joint', 'corner'],
    parameters: ['nominalAngle', 'actualAngle'],
    calculation: 'angular_misalignment'
  },
  {
    code: '610',
    name: 'Yetersiz Penetrasyon Genişliği',
    description: 'Kaynak kökünde yetersiz genişlik',
    category: 'penetration',
    appliesTo: ['butt'],
    parameters: ['nominalWidth', 'actualWidth'],
    calculation: 'root_width'
  }
];

// Parameter Definitions
const PARAMETER_DEFINITIONS: { [key: string]: any } = {
  length: { label: 'Uzunluk', unit: 'mm', type: 'number', min: 0, max: 1000 },
  depth: { label: 'Derinlik', unit: 'mm', type: 'number', min: 0, max: 50 },
  thickness: { label: 'Malzeme Kalınlığı', unit: 'mm', type: 'number', min: 0, max: 100 },
  width: { label: 'Genişlik', unit: 'mm', type: 'number', min: 0, max: 100 },
  height: { label: 'Yükseklik', unit: 'mm', type: 'number', min: 0, max: 50 },
  penetration: { label: 'Penetrasyon', unit: 'mm', type: 'number', min: 0, max: 50 },
  rootPenetration: { label: 'Kök Penetrasyonu', unit: 'mm', type: 'number', min: 0, max: 20 },
  nominalThickness: { label: 'Nominal Kalınlık', unit: 'mm', type: 'number', min: 0, max: 50 },
  actualThickness: { label: 'Fiili Kalınlık', unit: 'mm', type: 'number', min: 0, max: 50 },
  diameter: { label: 'Çap', unit: 'mm', type: 'number', min: 0, max: 20 },
  density: { label: 'Yoğunluk', unit: 'adet/cm²', type: 'number', min: 0, max: 100 },
  roughness: { label: 'Pürüzlülük', unit: 'μm', type: 'number', min: 0, max: 1000 },
  // Additional parameters for extended defect types
  clusterSize: { label: 'Küme Boyutu', unit: 'mm²', type: 'number', min: 0, max: 100 },
  nominalWidth: { label: 'Nominal Genişlik', unit: 'mm', type: 'number', min: 0, max: 100 },
  actualWidth: { label: 'Fiili Genişlik', unit: 'mm', type: 'number', min: 0, max: 100 },
  nominalHeight: { label: 'Nominal Yükseklik', unit: 'mm', type: 'number', min: 0, max: 50 },
  actualHeight: { label: 'Fiili Yükseklik', unit: 'mm', type: 'number', min: 0, max: 50 },
  coverage: { label: 'Kaplama Alanı', unit: '%', type: 'number', min: 0, max: 100 },
  size: { label: 'Boyut', unit: 'mm', type: 'number', min: 0, max: 10 },
  deviation: { label: 'Sapma', unit: 'mm', type: 'number', min: 0, max: 50 },
  nominalLeg: { label: 'Nominal Bacak Boyu', unit: 'mm', type: 'number', min: 0, max: 50 },
  actualLeg: { label: 'Fiili Bacak Boyu', unit: 'mm', type: 'number', min: 0, max: 50 },
  leg1: { label: '1. Bacak Boyu', unit: 'mm', type: 'number', min: 0, max: 50 },
  leg2: { label: '2. Bacak Boyu', unit: 'mm', type: 'number', min: 0, max: 50 },
  nominalAngle: { label: 'Nominal Açı', unit: '°', type: 'number', min: 0, max: 180 },
  actualAngle: { label: 'Fiili Açı', unit: '°', type: 'number', min: 0, max: 180 },
  
  // ISO 5817 için yeni parametreler
  weldWidth: { label: 'Kaynak Genişliği (b)', unit: 'mm', type: 'number', min: 0, max: 200 },
  angle: { label: 'Açı (α)', unit: '°', type: 'number', min: 0, max: 180 },
  totalHeight: { label: 'Toplam Yükseklik (Σh)', unit: 'mm', type: 'number', min: 0, max: 50 },
  totalArea: { label: 'Toplam Alan (Σhxl)', unit: '%', type: 'number', min: 0, max: 100 }
};

// Parametre doğrulama helper fonksiyonu
const validateParams = (params: any, requiredParams: string[]): { valid: boolean; error?: string; validatedParams?: any } => {
  if (!params || typeof params !== 'object') {
    return { valid: false, error: 'Parametre nesnesi bulunamadı' };
  }

  const validatedParams: any = {};
  
  for (const paramName of requiredParams) {
    const value = params[paramName];
    
    // Değer kontrolü
    if (value === undefined || value === null || value === '') {
      return { valid: false, error: `${paramName} parametresi gerekli ancak tanımlanmamış` };
    }
    
    // Sayısal değer kontrolü
    const numValue = Number(value);
    if (isNaN(numValue) || !isFinite(numValue)) {
      return { valid: false, error: `${paramName} parametresi geçerli bir sayı değil: ${value}` };
    }
    
    // Negatif değer kontrolü (fiziksel ölçümler negatif olamaz)
    if (numValue < 0) {
      return { valid: false, error: `${paramName} parametresi negatif olamaz: ${numValue}` };
    }
    
    validatedParams[paramName] = numValue;
  }
  
  return { valid: true, validatedParams };
};

// ISO 5817 Hesaplama Motorları
const CALCULATION_ENGINE: { [key: string]: (params: any, qualityLevel: string) => any } = {
  // YÜZEY KUSURLARI HESAPLAMALARI
  
  surface_crack: (params: any, level: string) => {
    const validation = validateParams(params, ['thickness']);
    if (!validation.valid) {
      return {
        allowed: false,
        result: 'Parametre hatası',
        reason: validation.error || 'Geçersiz parametreler'
      };
    }
    
    // Tüm kalite seviyeleri için çatlaklar müsaade edilmez
    return {
      allowed: false,
      result: 'Çatlaklar müsaade edilmez',
      reason: 'ISO 5817\'ye göre D, C, B kalite seviyelerinde çatlaklar kabul edilemez'
    };
  },
  
  crater_crack: (params: any, level: string) => {
    const validation = validateParams(params, ['thickness']);
    if (!validation.valid) {
      return {
        allowed: false,
        result: 'Parametre hatası',
        reason: validation.error || 'Geçersiz parametreler'
      };
    }
    
    // Krater çatlağı da müsaade edilmez
    return {
      allowed: false,
      result: 'Krater çatlağı müsaade edilmez',
      reason: 'ISO 5817\'ye göre D, C, B kalite seviyelerinde krater çatlakları kabul edilemez'
    };
  },
  
  surface_porosity: (params: any, level: string) => {
    const validation = validateParams(params, ['thickness', 'diameter', 'nominalThickness']);
    if (!validation.valid) {
      return {
        allowed: false,
        result: 'Parametre hatası',
        reason: validation.error || 'Geçersiz parametreler'
      };
    }
    
    const { thickness, diameter, nominalThickness } = validation.validatedParams!;
    
    // Ek mantık kontrolleri
    if (diameter > thickness) {
      return {
        allowed: false,
        result: 'Mantık hatası',
        reason: 'Gözenek çapı malzeme kalınlığından büyük olamaz'
      };
    }
    
    if (thickness < 0.5) {
      return { allowed: false, result: 'Minimum kalınlık 0.5mm olmalıdır', reason: 'ISO 5817 gerekliliği' };
    }
    
    let limits: any = {};
    const s = thickness; // Alın kaynakları için
    const a = nominalThickness || thickness; // Köşe kaynakları için
    
    if (thickness >= 0.5 && thickness <= 3) {
      limits = {
        D: { butt: 0.3 * s, fillet: 0.3 * a },
        C: { butt: false, fillet: false }, // Müsaade edilmez
        B: { butt: false, fillet: false }  // Müsaade edilmez
      };
    } else if (thickness > 3) {
      limits = {
        D: { butt: Math.min(0.3 * s, 3), fillet: Math.min(0.3 * a, 3) },
        C: { butt: Math.min(0.2 * s, 2), fillet: Math.min(0.2 * a, 2) },
        B: { butt: false, fillet: false } // Müsaade edilmez
      };
    }
    
    const currentLevel = limits[level];
    if (!currentLevel || currentLevel.butt === false) {
      return {
        allowed: false,
        result: `${level} kalite seviyesinde yüzey gözeneği müsaade edilmez`,
        reason: 'ISO 5817 standardı gereği'
      };
    }
    
    const maxAllowed = currentLevel.butt || currentLevel.fillet;
    const allowed = diameter <= maxAllowed;
    
    return {
      allowed,
      result: allowed ? `Yüzey gözeneği kabul edilebilir (d=${diameter}mm ≤ ${maxAllowed.toFixed(1)}mm)` : 
                       `Yüzey gözeneği kabul edilemez (d=${diameter}mm > ${maxAllowed.toFixed(1)}mm)`,
      reason: `${level} kalite seviyesi için maksimum çap: ${maxAllowed.toFixed(1)}mm`
    };
  },
  
  end_crater_groove: (params: any, level: string) => {
    const { thickness, depth } = params;
    
    let limits: any = {};
    
    if (thickness >= 0.5 && thickness <= 3) {
      limits = {
        D: 0.2 * thickness,
        C: false, // Müsaade edilmez
        B: false  // Müsaade edilmez
      };
    } else if (thickness > 3) {
      limits = {
        D: Math.min(0.2 * thickness, 2),
        C: Math.min(0.1 * thickness, 1),
        B: false // Müsaade edilmez
      };
    }
    
    const maxLimit = limits[level];
    if (maxLimit === false) {
      return {
        allowed: false,
        result: `${level} kalite seviyesinde uç krater olukları müsaade edilmez`,
        reason: 'ISO 5817 standardı gereği'
      };
    }
    
    const allowed = depth <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Uç krater olukları kabul edilebilir (h=${depth}mm ≤ ${maxLimit.toFixed(1)}mm)` : 
                       `Uç krater olukları kabul edilemez (h=${depth}mm > ${maxLimit.toFixed(1)}mm)`,
      reason: `${level} kalite seviyesi için maksimum derinlik: ${maxLimit.toFixed(1)}mm`
    };
  },
  
  continuous_undercut: (params: any, level: string) => {
    const { thickness, depth } = params;
    
    let limits: any = {};
    
    if (thickness >= 0.5 && thickness <= 3) {
      limits = {
        D: 0.2 * thickness,
        C: 0.1 * thickness,
        B: false // Müsaade edilmez
      };
    } else if (thickness > 3) {
      limits = {
        D: Math.min(0.2 * thickness, 1),
        C: Math.min(0.1 * thickness, 0.5),
        B: Math.min(0.05 * thickness, 0.5)
      };
    }
    
    const maxLimit = limits[level];
    if (maxLimit === false) {
      return {
        allowed: false,
        result: `${level} kalite seviyesinde sürekli yanma olukları müsaade edilmez`,
        reason: 'ISO 5817 standardı gereği'
      };
    }
    
    const allowed = depth <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Sürekli yanma olukları kabul edilebilir (h=${depth}mm ≤ ${maxLimit.toFixed(2)}mm)` : 
                       `Sürekli yanma olukları kabul edilemez (h=${depth}mm > ${maxLimit.toFixed(2)}mm)`,
      reason: `${level} kalite seviyesi için maksimum derinlik: ${maxLimit.toFixed(2)}mm`
    };
  },
  
  excess_weld_metal_butt: (params: any, level: string) => {
    const { weldWidth, height } = params;
    const b = weldWidth;
    
    const limits = {
      D: 1 + 0.25 * b, // maksimum 10mm
      C: 1 + 0.15 * b, // maksimum 7mm  
      B: 1 + 0.1 * b   // maksimum 5mm
    };
    
    const maxLimits = { D: 10, C: 7, B: 5 };
    const calculatedLimit = limits[level as keyof typeof limits];
    const absoluteLimit = maxLimits[level as keyof typeof maxLimits];
    const maxLimit = Math.min(calculatedLimit, absoluteLimit);
    
    const allowed = height <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Aşırı kaynak metali kabul edilebilir (h=${height}mm ≤ ${maxLimit.toFixed(1)}mm)` : 
                       `Aşırı kaynak metali kabul edilemez (h=${height}mm > ${maxLimit.toFixed(1)}mm)`,
      reason: `${level} kalite seviyesi için: h ≤ 1 + 0.${level==='D'?'25':level==='C'?'15':'1'}b, ancak en çok ${absoluteLimit}mm`
    };
  },
  
  // İÇ KUSURLAR HESAPLAMALARI
  
  internal_crack: (params: any, level: string) => {
    // İç çatlaklar da müsaade edilmez
    return {
      allowed: false,
      result: 'İç çatlaklar müsaade edilmez',
      reason: 'ISO 5817\'ye göre D, C, B kalite seviyelerinde iç çatlaklar kabul edilemez'
    };
  },
  
  micro_crack: (params: any, level: string) => {
    const { thickness } = params;
    
    if (level === 'D') {
      return {
        allowed: true,
        result: 'Mikro çatlaklar D kalite seviyesinde müsaade edilir',
        reason: 'ISO 5817 standardı gereği'
      };
    } else {
      return {
        allowed: false,
        result: `${level} kalite seviyesinde mikro çatlaklar çatlama hassasiyetine özel atıfta bulunulan esas metalin tipine bağlı`,
        reason: 'Malzeme tipine özel değerlendirme gereklidir'
      };
    }
  },
  
  gas_pore_distributed: (params: any, level: string) => {
    const { thickness, diameter, nominalThickness } = params;
    const s = thickness; // Alın kaynakları için
    const a = nominalThickness || thickness; // İç köşe kaynakları için
    
    // b) Tek bir delik için en büyük boyut
    const diameterLimits = {
      D: { butt: Math.min(0.4 * s, 5), fillet: Math.min(0.4 * a, 5) },
      C: { butt: Math.min(0.3 * s, 4), fillet: Math.min(0.3 * a, 4) },
      B: { butt: Math.min(0.2 * s, 3), fillet: Math.min(0.2 * a, 3) }
    };
    
    const currentDiameterLimit = diameterLimits[level as keyof typeof diameterLimits];
    const maxDiameter = currentDiameterLimit.butt || currentDiameterLimit.fillet;
    
    const allowed = diameter <= maxDiameter;
    
    return {
      allowed,
      result: allowed ? `Düzenli dağılmış gözenek kabul edilebilir (d=${diameter}mm ≤ ${maxDiameter.toFixed(1)}mm)` : 
                       `Düzenli dağılmış gözenek kabul edilemez (d=${diameter}mm > ${maxDiameter.toFixed(1)}mm)`,
      reason: `${level} kalite seviyesi için tek delik maks çapı: ${maxDiameter.toFixed(1)}mm`
    };
  },
  
  // GEOMETRİ KUSURLARI HESAPLAMALARI
  
  linear_misalignment: (params: any, level: string) => {
    const { thickness, height } = params;
    
    let limits: any = {};
    
    if (thickness >= 0.5 && thickness <= 3) {
      // Tabakalar arası doğrusal kaçıklık
      limits = {
        D: 0.25 * thickness + 0.2,
        C: 0.15 * thickness + 0.2,
        B: 0.1 * thickness + 0.2
      };
    } else if (thickness > 3) {
      limits = {
        D: Math.min(0.25 * thickness, 5),
        C: Math.min(0.15 * thickness, 4), 
        B: Math.min(0.1 * thickness, 3)
      };
    }
    
    const maxLimit = limits[level];
    const allowed = height <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Doğrusal kaçıklık kabul edilebilir (h=${height}mm ≤ ${maxLimit.toFixed(2)}mm)` : 
                       `Doğrusal kaçıklık kabul edilemez (h=${height}mm > ${maxLimit.toFixed(2)}mm)`,
      reason: `${level} kalite seviyesi için maksimum kaçıklık: ${maxLimit.toFixed(2)}mm`
    };
  },
  
  // ÇOKLU KUSURLAR HESAPLAMALARI
  
  multiple_cross_section: (params: any, level: string) => {
    const { thickness, nominalThickness, totalHeight } = params;
    
    if (thickness >= 0.5 && thickness <= 3) {
      return {
        allowed: false,
        result: 'Kalınlık 0.5-3mm aralığında çoklu kusurlar müsaade edilmez',
        reason: 'ISO 5817 standardı gereği'
      };
    }
    
    const limits = {
      D: Math.min(0.4 * thickness, 0.25 * (nominalThickness || thickness)),
      C: Math.min(0.3 * thickness, 0.2 * (nominalThickness || thickness)),
      B: Math.min(0.2 * thickness, 0.15 * (nominalThickness || thickness))
    };
    
    const maxLimit = limits[level as keyof typeof limits];
    const allowed = totalHeight <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Çoklu kusurlar kabul edilebilir (Σh=${totalHeight}mm ≤ ${maxLimit.toFixed(2)}mm)` : 
                       `Çoklu kusurlar kabul edilemez (Σh=${totalHeight}mm > ${maxLimit.toFixed(2)}mm)`,
      reason: `${level} kalite seviyesi için maksimum toplam yükseklik: ${maxLimit.toFixed(2)}mm`
    };
  },
  
  multiple_longitudinal_area: (params: any, level: string) => {
    const { thickness, totalArea } = params;
    
    const limits = {
      D: 16, // %
      C: 8,
      B: 4
    };
    
    const maxLimit = limits[level as keyof typeof limits];
    const allowed = totalArea <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Boyuna yönde çoklu kusurlar kabul edilebilir (Σhxl=${totalArea}% ≤ ${maxLimit}%)` : 
                       `Boyuna yönde çoklu kusurlar kabul edilemez (Σhxl=${totalArea}% > ${maxLimit}%)`,
      reason: `${level} kalite seviyesi için maksimum alan yüzdesi: ${maxLimit}%`
    };
  },
  
  // Eksik hesaplama motorları
  excessive_asymmetry: (params: any, level: string) => {
    const { nominalLeg, height } = params;
    const GA = nominalLeg; // Nominal bacak boyu
    const h = height; // Asimetri yüksekliği
    
    const limits = {
      D: 0.2 * GA + 2, // mm
      C: 0.15 * GA + 2, // mm  
      B: 0.15 * GA + 1.5 // mm
    };
    
    const maxLimit = limits[level as keyof typeof limits];
    const allowed = h <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Aşırı asimetriklik kabul edilebilir (h=${h}mm ≤ ${maxLimit.toFixed(1)}mm)` : 
                       `Aşırı asimetriklik kabul edilemez (h=${h}mm > ${maxLimit.toFixed(1)}mm)`,
      reason: `${level} kalite seviyesi için: h ≤ 0.${level==='D'?'2':level==='C'?'15':'15'}GA + ${level==='B'?'1.5':'2'}mm`
    };
  },
  
  insufficient_fusion: (params: any, level: string) => {
    // Yetersiz ergime - tüm seviyelerde müsaade edilmez
    return {
      allowed: false,
      result: 'Yetersiz ergime müsaade edilmez',
      reason: 'ISO 5817\'ye göre D, C, B kalite seviyelerinde yetersiz ergime kabul edilemez'
    };
  },
  
  incomplete_root_penetration: (params: any, level: string) => {
    const { thickness, depth } = params;
    
    if (level === 'D') {
      const maxLimit = Math.min(0.2 * thickness, 2);
      const allowed = depth <= maxLimit;
      
      return {
        allowed,
        result: allowed ? `Tamamlanmamış kök nüfuziyeti kabul edilebilir (h=${depth}mm ≤ ${maxLimit.toFixed(1)}mm)` : 
                         `Tamamlanmamış kök nüfuziyeti kabul edilemez (h=${depth}mm > ${maxLimit.toFixed(1)}mm)`,
        reason: `D kalite seviyesi için kısa kusurlar: h ≤ 0.2t, ancak en çok 2mm`
      };
    } else {
      return {
        allowed: false,
        result: `${level} kalite seviyesinde tamamlanmamış kök nüfuziyeti müsaade edilmez`,
        reason: 'ISO 5817 standardı gereği'
      };
    }
  },
  
  intermittent_undercut: (params: any, level: string) => {
    // Aynı continuous_undercut ile
    return CALCULATION_ENGINE.continuous_undercut(params, level);
  },
  
  shrinkage_groove: (params: any, level: string) => {
    const { thickness, depth } = params;
    
    let limits: any = {};
    
    if (thickness >= 0.5 && thickness <= 3) {
      limits = {
        D: 0.2 + 0.1 * thickness,
        C: 0.1 * thickness,
        B: false // Müsaade edilmez
      };
    } else if (thickness > 3) {
      limits = {
        D: Math.min(0.2 * thickness, 2),
        C: Math.min(0.1 * thickness, 1),
        B: Math.min(0.05 * thickness, 0.5)
      };
    }
    
    const maxLimit = limits[level];
    if (maxLimit === false) {
      return {
        allowed: false,
        result: `${level} kalite seviyesinde çekme olukları müsaade edilmez`,
        reason: 'ISO 5817 standardı gereği'
      };
    }
    
    const allowed = depth <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Çekme olukları kabul edilebilir (h=${depth}mm ≤ ${maxLimit.toFixed(2)}mm)` : 
                       `Çekme olukları kabul edilemez (h=${depth}mm > ${maxLimit.toFixed(2)}mm)`,
      reason: `${level} kalite seviyesi için maksimum derinlik: ${maxLimit.toFixed(2)}mm`
    };
  },
  
  // Ek hesaplama motorları
  excess_convexity_fillet: (params: any, level: string) => {
    const { weldWidth, height } = params;
    const b = weldWidth;
    
    const limits = {
      D: 1 + 0.25 * b, // maksimum 5mm
      C: 1 + 0.15 * b, // maksimum 4mm  
      B: 1 + 0.1 * b   // maksimum 3mm
    };
    
    const maxLimits = { D: 5, C: 4, B: 3 };
    const calculatedLimit = limits[level as keyof typeof limits];
    const absoluteLimit = maxLimits[level as keyof typeof maxLimits];
    const maxLimit = Math.min(calculatedLimit, absoluteLimit);
    
    const allowed = height <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Aşırı dışbükeylik kabul edilebilir (h=${height}mm ≤ ${maxLimit.toFixed(1)}mm)` : 
                       `Aşırı dışbükeylik kabul edilemez (h=${height}mm > ${maxLimit.toFixed(1)}mm)`,
      reason: `${level} kalite seviyesi için: h ≤ 1 + 0.${level==='D'?'25':level==='C'?'15':'1'}b, ancak en çok ${absoluteLimit}mm`
    };
  },
  
  excess_penetration: (params: any, level: string) => {
    const { thickness, weldWidth, height } = params;
    const b = weldWidth;
    
    let limits: any = {};
    
    if (thickness >= 0.5 && thickness <= 3) {
      limits = {
        D: 1 + 0.6 * b,
        C: 1 + 0.3 * b,
        B: 1 + 0.1 * b
      };
    } else if (thickness > 3) {
      limits = {
        D: Math.min(1 + 1.0 * b, 5),
        C: Math.min(1 + 0.45 * b, 4),
        B: Math.min(1 + 0.2 * b, 3)
      };
    }
    
    const maxLimit = limits[level];
    const allowed = height <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Aşırı nüfuziyet kabul edilebilir (h=${height}mm ≤ ${maxLimit.toFixed(1)}mm)` : 
                       `Aşırı nüfuziyet kabul edilemez (h=${height}mm > ${maxLimit.toFixed(1)}mm)`,
      reason: `${level} kalite seviyesi için maksimum nüfuziyet: ${maxLimit.toFixed(1)}mm`
    };
  },
  
  incorrect_weld_toe: (params: any, level: string) => {
    const { angle } = params;
    
    const limits = {
      D: 90, // derece
      C: 110,
      B: 150
    };
    
    const minAngle = limits[level as keyof typeof limits];
    const allowed = angle >= minAngle;
    
    return {
      allowed,
      result: allowed ? `Kaynak kenarı açısı kabul edilebilir (α=${angle}° ≥ ${minAngle}°)` : 
                       `Kaynak kenarı açısı kabul edilemez (α=${angle}° < ${minAngle}°)`,
      reason: `${level} kalite seviyesi için minimum açı: α ≥ ${minAngle}°`
    };
  },
  
  overlap: (params: any, level: string) => {
    const { weldWidth, height } = params;
    const b = weldWidth;
    
    if (level === 'D') {
      const maxLimit = 0.2 * b;
      const allowed = height <= maxLimit;
      
      return {
        allowed,
        result: allowed ? `Binme/taşma kabul edilebilir (h=${height}mm ≤ ${maxLimit.toFixed(1)}mm)` : 
                         `Binme/taşma kabul edilemez (h=${height}mm > ${maxLimit.toFixed(1)}mm)`,
        reason: `D kalite seviyesi için: h ≤ 0.2b`
      };
    } else {
      return {
        allowed: false,
        result: `${level} kalite seviyesinde binme/taşma müsaade edilmez`,
        reason: 'ISO 5817 standardı gereği'
      };
    }
  },
  
  sagging_concave_root: (params: any, level: string) => {
    const { thickness, depth } = params;
    
    let limits: any = {};
    
    if (thickness >= 0.5 && thickness <= 3) {
      limits = {
        D: 0.25 * thickness,
        C: 0.1 * thickness,
        B: false // Müsaade edilmez
      };
    } else if (thickness > 3) {
      limits = {
        D: Math.min(0.25 * thickness, 2),
        C: Math.min(0.1 * thickness, 1),
        B: Math.min(0.05 * thickness, 0.5)
      };
    }
    
    const maxLimit = limits[level];
    if (maxLimit === false) {
      return {
        allowed: false,
        result: `${level} kalite seviyesinde çökme müsaade edilmez`,
        reason: 'ISO 5817 standardı gereği'
      };
    }
    
    const allowed = depth <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Çökme kabul edilebilir (h=${depth}mm ≤ ${maxLimit.toFixed(2)}mm)` : 
                       `Çökme kabul edilemez (h=${depth}mm > ${maxLimit.toFixed(2)}mm)`,
      reason: `${level} kalite seviyesi için maksimum derinlik: ${maxLimit.toFixed(2)}mm`
    };
  },
  
  burn_through: (params: any, level: string) => {
    // İçe yanma - tüm seviyelerde müsaade edilmez
    return {
      allowed: false,
      result: 'İçe yanma müsaade edilmez',
      reason: 'ISO 5817\'ye göre D, C, B kalite seviyelerinde içe yanma kabul edilemez'
    };
  },
  
  root_concavity: (params: any, level: string) => {
    const { thickness, depth } = params;
    
    let limits: any = {};
    
    if (thickness >= 0.5 && thickness <= 3) {
      limits = {
        D: 0.1 * thickness + 0.2,
        C: 0.1 * thickness,
        B: false // Müsaade edilmez
      };
    } else if (thickness > 3) {
      limits = {
        D: Math.min(0.2 * thickness, 2),
        C: Math.min(0.1 * thickness, 1),
        B: Math.min(0.05 * thickness, 0.5)
      };
    }
    
    const maxLimit = limits[level];
    if (maxLimit === false) {
      return {
        allowed: false,
        result: `${level} kalite seviyesinde kök içbükeyliği müsaade edilmez`,
        reason: 'ISO 5817 standardı gereği'
      };
    }
    
    const allowed = depth <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Kök içbükeyliği kabul edilebilir (h=${depth}mm ≤ ${maxLimit.toFixed(2)}mm)` : 
                       `Kök içbükeyliği kabul edilemez (h=${depth}mm > ${maxLimit.toFixed(2)}mm)`,
      reason: `${level} kalite seviyesi için maksimum derinlik: ${maxLimit.toFixed(2)}mm`
    };
  },
  
  root_porosity: (params: any, level: string) => {
    const { thickness } = params;
    
    if (level === 'D') {
      return {
        allowed: true,
        result: 'Kök gözenekleri D kalite seviyesinde uygulamaya bağlı kabul',
        reason: 'Malzeme ve korozyon koruması dikkate alınarak değerlendirilir'
      };
    } else {
      return {
        allowed: false,
        result: `${level} kalite seviyesinde kök gözenekleri müsaade edilmez`,
        reason: 'ISO 5817 standardı gereği'
      };
    }
  },
  
  poor_restart: (params: any, level: string) => {
    const { thickness } = params;
    
    if (level === 'D') {
      return {
        allowed: true,
        result: 'Kötü yeniden başlatma D kalite seviyesinde müsaade edilir',
        reason: 'ISO 5817 standardı gereği'
      };
    } else {
      return {
        allowed: false,
        result: `${level} kalite seviyesinde kötü yeniden başlatma müsaade edilmez`,
        reason: 'ISO 5817 standardı gereği'
      };
    }
  },
  
  insufficient_throat_thickness: (params: any, level: string) => {
    const { thickness, nominalLeg, depth } = params;
    const a = nominalLeg;
    
    let limits: any = {};
    
    if (thickness >= 0.5 && thickness <= 3) {
      limits = {
        D: 0.1 * a + 0.2,
        C: 0.2,
        B: false // Müsaade edilmez
      };
    } else if (thickness > 3) {
      limits = {
        D: Math.min(0.1 * a + 0.3, 2),
        C: Math.min(0.1 * a + 0.3, 1),
        B: false // Müsaade edilmez
      };
    }
    
    const maxLimit = limits[level];
    if (maxLimit === false) {
      return {
        allowed: false,
        result: `${level} kalite seviyesinde yetersiz boğaz kalınlığı müsaade edilmez`,
        reason: 'ISO 5817 standardı gereği'
      };
    }
    
    const allowed = depth <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Yetersiz boğaz kalınlığı kabul edilebilir (h=${depth}mm ≤ ${maxLimit.toFixed(2)}mm)` : 
                       `Yetersiz boğaz kalınlığı kabul edilemez (h=${depth}mm > ${maxLimit.toFixed(2)}mm)`,
      reason: `${level} kalite seviyesi için maksimum eksiklik: ${maxLimit.toFixed(2)}mm`
    };
  },
  
  excessive_throat_thickness: (params: any, level: string) => {
    const { nominalLeg, height } = params;
    const a = nominalLeg;
    
    if (level === 'D') {
      return {
        allowed: true,
        result: 'Aşırı boğaz kalınlığı D kalite seviyesinde müsaade edilir',
        reason: 'ISO 5817 standardı gereği'
      };
    }
    
    const limits = {
      C: Math.min(0.2 * a + 1, 4),
      B: Math.min(0.15 * a + 1, 3)
    };
    
    const maxLimit = limits[level as keyof typeof limits];
    const allowed = height <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Aşırı boğaz kalınlığı kabul edilebilir (h=${height}mm ≤ ${maxLimit.toFixed(1)}mm)` : 
                       `Aşırı boğaz kalınlığı kabul edilemez (h=${height}mm > ${maxLimit.toFixed(1)}mm)`,
      reason: `${level} kalite seviyesi için maksimum kalınlık: ${maxLimit.toFixed(1)}mm`
    };
  },
  
  stray_arc: (params: any, level: string) => {
    const { thickness } = params;
    
    if (level === 'D') {
      return {
        allowed: true,
        result: 'Rastgele ark D kalite seviyesinde esas metal özellikleri etkilenmediğinde müsaade edilir',
        reason: 'Malzeme özelliklerinin korunması şartıyla'
      };
    } else {
      return {
        allowed: false,
        result: `${level} kalite seviyesinde rastgele ark müsaade edilmez`,
        reason: 'ISO 5817 standardı gereği'
      };
    }
  },
  
  spatter: (params: any, level: string) => {
    return {
      allowed: true,
      result: 'Sıçrantı uygulamaya bağlı kabul',
      reason: 'Malzeme ve korozyon koruması dikkate alınarak değerlendirilir'
    };
  },
  
  temper_colors: (params: any, level: string) => {
    return {
      allowed: true,
      result: 'Temper renkleri uygulamaya bağlı kabul',
      reason: 'Malzeme ve korozyon koruması dikkate alınarak değerlendirilir'
    };
  },
  
  localized_porosity: (params: any, level: string) => {
    const { thickness, diameter } = params;
    
    if (level === 'D') {
      const maxDiameter = Math.min(20, thickness); // wp (kaynak genişliği) yerine kalınlık kullanıyoruz
      const allowed = diameter <= maxDiameter;
      
      return {
        allowed,
        result: allowed ? `Toplu gözenek kabul edilebilir (dA=${diameter}mm ≤ ${maxDiameter}mm)` : 
                         `Toplu gözenek kabul edilemez (dA=${diameter}mm > ${maxDiameter}mm)`,
        reason: `D kalite seviyesi için: dA ≤ 20mm veya dA ≤ Wp`
      };
    } else {
      return {
        allowed: false,
        result: `${level} kalite seviyesinde toplu gözenek müsaade edilmez`,
        reason: 'ISO 5817 standardı gereği'
      };
    }
  },
  
  linear_porosity: (params: any, level: string) => {
    const { thickness, nominalThickness, height, length } = params;
    const s = thickness; // Alın kaynakları için
    const a = nominalThickness || thickness; // İç köşe kaynakları için
    
    const limits = {
      D: { 
        heightLimit: Math.min(0.4 * s, 4), 
        lengthLimit: Math.min(s, 75),
        heightLimitFillet: Math.min(0.4 * a, 4),
        lengthLimitFillet: Math.min(a, 75)
      },
      C: { 
        heightLimit: Math.min(0.3 * s, 3), 
        lengthLimit: Math.min(s, 50),
        heightLimitFillet: Math.min(0.3 * a, 3),
        lengthLimitFillet: Math.min(a, 50)
      },
      B: { 
        heightLimit: Math.min(0.2 * s, 2), 
        lengthLimit: Math.min(s, 25),
        heightLimitFillet: Math.min(0.2 * a, 2),
        lengthLimitFillet: Math.min(a, 25)
      }
    };
    
    const currentLimits = limits[level as keyof typeof limits];
    const heightAllowed = height <= currentLimits.heightLimit;
    const lengthAllowed = length <= currentLimits.lengthLimit;
    const allowed = heightAllowed && lengthAllowed;
    
    return {
      allowed,
      result: allowed ? `Doğrusal gözenek kabul edilebilir` : `Doğrusal gözenek kabul edilemez`,
      reason: `${level} kalite seviyesi için: h ≤ ${currentLimits.heightLimit.toFixed(1)}mm, l ≤ ${currentLimits.lengthLimit}mm`
    };
  },
  
  elongated_cavity: (params: any, level: string) => {
    // Uzamış boşluk - linear_porosity ile aynı sınırlar
    return CALCULATION_ENGINE.linear_porosity(params, level);
  },
  
  shrinkage_cavity: (params: any, level: string) => {
    const { thickness, nominalThickness, height } = params;
    const s = thickness; // Alın kaynakları için
    const a = nominalThickness || thickness; // İç köşe kaynakları için
    
    if (level === 'D') {
      const maxLimit = Math.min(0.4 * s, 4); // veya 0.4 * a köşe kaynakları için
      const allowed = height <= maxLimit;
      
      return {
        allowed,
        result: allowed ? `Çekme oyuğu kabul edilebilir (h=${height}mm ≤ ${maxLimit.toFixed(1)}mm)` : 
                         `Çekme oyuğu kabul edilemez (h=${height}mm > ${maxLimit.toFixed(1)}mm)`,
        reason: `D kalite seviyesi için: h ≤ 0.4s, ancak en çok 4mm`
      };
    } else {
      return {
        allowed: false,
        result: `${level} kalite seviyesinde çekme oyuğu müsaade edilmez`,
        reason: 'ISO 5817 standardı gereği'
      };
    }
  },
  
  crater_pipe: (params: any, level: string) => {
    // Krater borusu - tüm seviyelerde müsaade edilmez
    return {
      allowed: false,
      result: 'Krater borusu müsaade edilmez',
      reason: 'ISO 5817\'ye göre D, C, B kalite seviyelerinde krater borusu kabul edilemez'
    };
  },
  
  solid_inclusions: (params: any, level: string) => {
    const { thickness, nominalThickness, height, length } = params;
    // Katı kalıntılar için linear_porosity ile aynı sınırları kullan
    return CALCULATION_ENGINE.linear_porosity(params, level);
  },
  
  metallic_inclusions: (params: any, level: string) => {
    const { thickness, nominalThickness, height } = params;
    const s = thickness; // Alın kaynakları için
    const a = nominalThickness || thickness; // İç köşe kaynakları için
    
    const limits = {
      D: { butt: Math.min(0.4 * s, 4), fillet: Math.min(0.4 * a, 4) },
      C: { butt: Math.min(0.3 * s, 3), fillet: Math.min(0.3 * a, 3) },
      B: { butt: Math.min(0.2 * s, 2), fillet: Math.min(0.2 * a, 2) }
    };
    
    const currentLimits = limits[level as keyof typeof limits];
    const maxLimit = currentLimits.butt || currentLimits.fillet;
    const allowed = height <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Metalik kalıntılar kabul edilebilir (h=${height}mm ≤ ${maxLimit.toFixed(1)}mm)` : 
                       `Metalik kalıntılar kabul edilemez (h=${height}mm > ${maxLimit.toFixed(1)}mm)`,
      reason: `${level} kalite seviyesi için maksimum yükseklik: ${maxLimit.toFixed(1)}mm`
    };
  },
  
  copper_inclusions: (params: any, level: string) => {
    // Bakır kalıntıları - tüm seviyelerde müsaade edilmez
    return {
      allowed: false,
      result: 'Bakır kalıntıları müsaade edilmez',
      reason: 'ISO 5817\'ye göre D, C, B kalite seviyelerinde bakır kalıntıları kabul edilemez'
    };
  },
  
  internal_lack_of_fusion: (params: any, level: string) => {
    const { thickness, nominalThickness, height } = params;
    const s = thickness; // Alın kaynakları için
    const a = nominalThickness || thickness; // İç köşe kaynakları için
    
    if (level === 'D') {
      const maxLimit = Math.min(0.4 * s, 4); // veya 0.4 * a köşe kaynakları için
      const allowed = height <= maxLimit;
      
      return {
        allowed,
        result: allowed ? `İç ergime noksanlığı kabul edilebilir (h=${height}mm ≤ ${maxLimit.toFixed(1)}mm)` : 
                         `İç ergime noksanlığı kabul edilemez (h=${height}mm > ${maxLimit.toFixed(1)}mm)`,
        reason: `D kalite seviyesi için yüzeye çıkmayan kısa kusurlar: h ≤ 0.4s, ancak en çok 4mm`
      };
    } else {
      return {
        allowed: false,
        result: `${level} kalite seviyesinde iç ergime noksanlığı müsaade edilmez`,
        reason: 'ISO 5817 standardı gereği'
      };
    }
  },
  
  lack_of_penetration: (params: any, level: string) => {
    const { thickness, nominalThickness, height } = params;
    const s = thickness; 
    const i = nominalThickness || thickness; // i parametresi için
    
    if (thickness > 0.5) {
      const limits = {
        D: { butt: Math.min(0.2 * s, 2), joint: Math.min(0.2 * i, 2) },
        C: { butt: Math.min(0.1 * s, 1.5), joint: Math.min(0.1 * i, 1.5) },
        B: false // Müsaade edilmez
      };
      
      if (limits[level as keyof typeof limits] === false) {
        return {
          allowed: false,
          result: `${level} kalite seviyesinde nüfuziyet noksanlığı müsaade edilmez`,
          reason: 'ISO 5817 standardı gereği'
        };
      }
      
      const currentLimits = limits[level as keyof typeof limits] as any;
      const maxLimit = currentLimits.butt || currentLimits.joint;
      const allowed = height <= maxLimit;
      
      return {
        allowed,
        result: allowed ? `Nüfuziyet noksanlığı kabul edilebilir (h=${height}mm ≤ ${maxLimit.toFixed(1)}mm)` : 
                         `Nüfuziyet noksanlığı kabul edilemez (h=${height}mm > ${maxLimit.toFixed(1)}mm)`,
        reason: `${level} kalite seviyesi için kısa kusurlar: h ≤ 0.${level==='D'?'2':'1'}t, ancak en çok ${level==='D'?'2':'1.5'}mm`
      };
    } else {
      if (level === 'D') {
        const maxLimit = Math.min(0.2 * nominalThickness, 2);
        const allowed = height <= maxLimit;
        
        return {
          allowed,
          result: allowed ? `Nüfuziyet noksanlığı kabul edilebilir (h=${height}mm ≤ ${maxLimit.toFixed(1)}mm)` : 
                           `Nüfuziyet noksanlığı kabul edilemez (h=${height}mm > ${maxLimit.toFixed(1)}mm)`,
          reason: `D kalite seviyesi için: h ≤ 0.2a, ancak en çok 2mm`
        };
      } else {
        return {
          allowed: false,
          result: `${level} kalite seviyesinde nüfuziyet noksanlığı müsaade edilmez`,
          reason: 'ISO 5817 standardı gereği'
        };
      }
    }
  },
  
  inappropriate_root_filling: (params: any, level: string) => {
    const { thickness, nominalLeg, height } = params;
    const GA = nominalLeg;
    
    let limits: any = {};
    
    if (thickness >= 0.5 && thickness <= 3) {
      limits = {
        D: 0.1 * GA + 0.5,
        C: 0.1 * GA + 0.3,
        B: 0.1 * GA + 0.2
      };
    } else if (thickness > 3) {
      limits = {
        D: Math.min(0.2 * GA + 1, 4),
        C: Math.min(0.2 * GA + 0.5, 3),
        B: Math.min(0.2 * GA + 0.5, 2)
      };
    }
    
    const maxLimit = limits[level];
    const allowed = height <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Uygun olmayan kök dolgu kabul edilebilir (h=${height}mm ≤ ${maxLimit.toFixed(1)}mm)` : 
                       `Uygun olmayan kök dolgu kabul edilemez (h=${height}mm > ${maxLimit.toFixed(1)}mm)`,
      reason: `${level} kalite seviyesi için maksimum sapma: ${maxLimit.toFixed(1)}mm`
    };
  },

  // LEGACY CALCULATION ENGINES (korunacak)
  crack_based: (params, level) => ({
    allowed: false,
    result: 'Çatlak müsaade edilmez',
    reason: 'ISO 5817 standardına göre hiçbir kalite seviyesinde çatlak kabul edilmez'
  }),
  
  undercut_based: (params, level) => {
    const { thickness, depth } = params;
    const limits = { B: 0.05 * thickness, C: 0.1 * thickness, D: 0.2 * thickness };
    const maxLimit = limits[level as keyof typeof limits] || 0;
    const allowed = depth <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Undercut kabul edilebilir (${depth}mm ≤ ${maxLimit.toFixed(2)}mm)` : `Undercut kabul edilemez (${depth}mm > ${maxLimit.toFixed(2)}mm)`,
      reason: `${level} kalite seviyesi için maksimum undercut derinliği: ${maxLimit.toFixed(2)}mm`
    };
  },
  
  penetration_based: (params, level) => {
    const { thickness, rootPenetration } = params;
    const minRequired = thickness * 0.7; // Minimum %70 penetrasyon
    const allowed = rootPenetration >= minRequired;
    
    return {
      allowed,
      result: allowed ? `Penetrasyon yeterli (${rootPenetration}mm ≥ ${minRequired.toFixed(2)}mm)` : `Penetrasyon yetersiz (${rootPenetration}mm < ${minRequired.toFixed(2)}mm)`,
      reason: `Minimum gerekli penetrasyon: malzeme kalınlığının %70'i (${minRequired.toFixed(2)}mm)`
    };
  },


  
  overflow_based: (params, level) => {
    const { width, height } = params;
    const limits = { B: 1, C: 2, D: 3 };
    const maxLimit = limits[level as keyof typeof limits] || 0;
    const allowed = height <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Taşma kabul edilebilir (${height}mm ≤ ${maxLimit}mm)` : `Taşma kabul edilemez (${height}mm > ${maxLimit}mm)`,
      reason: `${level} kalite seviyesi için maksimum taşma yüksekliği: ${maxLimit}mm`
    };
  },
  
  throat_thickness: (params, level) => {
    const { nominalThickness, actualThickness } = params;
    const minRequired = nominalThickness * 0.9; // Minimum %90 nominal değer
    const allowed = actualThickness >= minRequired;
    
    return {
      allowed,
      result: allowed ? `Boğaz kalınlığı yeterli (${actualThickness}mm ≥ ${minRequired.toFixed(2)}mm)` : `Boğaz kalınlığı yetersiz (${actualThickness}mm < ${minRequired.toFixed(2)}mm)`,
      reason: `Minimum gerekli boğaz kalınlığı: nominal değerin %90'ı (${minRequired.toFixed(2)}mm)`
    };
  },
  
  surface_roughness: (params, level) => {
    const { roughness } = params;
    const limits = { B: 40, C: 80, D: 160 }; // μm
    const maxLimit = limits[level as keyof typeof limits] || 0;
    const allowed = roughness <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Yüzey pürüzlülüğü kabul edilebilir (${roughness}μm ≤ ${maxLimit}μm)` : `Yüzey pürüzlülüğü kabul edilemez (${roughness}μm > ${maxLimit}μm)`,
      reason: `${level} kalite seviyesi için maksimum pürüzlülük: ${maxLimit}μm`
    };
  },
  
  porosity_based: (params, level) => {
    const { diameter, density } = params;
    const maxDiameter = { B: 1, C: 2, D: 3 };
    const maxDensity = { B: 1, C: 2, D: 4 };
    const diameterLimit = maxDiameter[level as keyof typeof maxDiameter] || 0;
    const densityLimit = maxDensity[level as keyof typeof maxDensity] || 0;
    
    const allowed = diameter <= diameterLimit && density <= densityLimit;
    
    return {
      allowed,
      result: allowed ? `Gözenek kabul edilebilir` : `Gözenek kabul edilemez`,
      reason: `${level} kalite seviyesi için maks çap: ${diameterLimit}mm, maks yoğunluk: ${densityLimit} adet/cm²`
    };
  },

  porosity_cluster: (params, level) => {
    const { diameter, clusterSize } = params;
    const maxCluster = { B: 5, C: 10, D: 20 }; // mm²
    const maxDiameter = { B: 1, C: 2, D: 3 };
    const clusterLimit = maxCluster[level as keyof typeof maxCluster] || 0;
    const diameterLimit = maxDiameter[level as keyof typeof maxDiameter] || 0;
    
    const allowed = diameter <= diameterLimit && clusterSize <= clusterLimit;
    
    return {
      allowed,
      result: allowed ? `Toplu gözenek kabul edilebilir` : `Toplu gözenek kabul edilemez`,
      reason: `${level} kalite seviyesi için maks çap: ${diameterLimit}mm, maks küme: ${clusterLimit}mm²`
    };
  },
  
  inclusion_based: (params, level) => {
    const { length, width } = params;
    const area = length * width;
    const limits = { B: 5, C: 10, D: 20 }; // mm²
    const maxArea = limits[level as keyof typeof limits] || 0;
    const allowed = area <= maxArea;
    
    return {
      allowed,
      result: allowed ? `Kalıntı kabul edilebilir (${area.toFixed(2)}mm² ≤ ${maxArea}mm²)` : `Kalıntı kabul edilemez (${area.toFixed(2)}mm² > ${maxArea}mm²)`,
      reason: `${level} kalite seviyesi için maksimum kalıntı alanı: ${maxArea}mm²`
    };
  },

  fusion_defect: (params, level) => {
    const { length, depth } = params;
    const maxLength = { B: 0, C: 0.1 * length, D: 0.2 * length };
    const lengthLimit = maxLength[level as keyof typeof maxLength] || 0;
    const allowed = length <= lengthLimit;
    
    return {
      allowed,
      result: allowed ? `Kaynaşmama kabul edilebilir` : `Kaynaşmama kabul edilemez`,
      reason: `${level} kalite seviyesi için maksimum uzunluk: ${lengthLimit.toFixed(2)}mm`
    };
  },

  root_fusion: (params, level) => {
    const { length, depth } = params;
    const limits = { B: 0, C: 2, D: 5 }; // mm
    const maxLimit = limits[level as keyof typeof limits] || 0;
    const allowed = length <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Kök kaynaşması kabul edilebilir` : `Kök kaynaşması kabul edilemez`,
      reason: `${level} kalite seviyesi için maksimum uzunluk: ${maxLimit}mm`
    };
  },

  width_variation: (params, level) => {
    const { nominalWidth, actualWidth } = params;
    const variation = Math.abs(actualWidth - nominalWidth);
    const tolerance = { B: nominalWidth * 0.05, C: nominalWidth * 0.1, D: nominalWidth * 0.15 };
    const maxTolerance = tolerance[level as keyof typeof tolerance] || 0;
    const allowed = variation <= maxTolerance;
    
    return {
      allowed,
      result: allowed ? `Genişlik varyasyonu kabul edilebilir` : `Genişlik varyasyonu kabul edilemez`,
      reason: `${level} kalite seviyesi için maksimum tolerans: ±${maxTolerance.toFixed(2)}mm`
    };
  },

  height_variation: (params, level) => {
    const { nominalHeight, actualHeight } = params;
    const variation = Math.abs(actualHeight - nominalHeight);
    const tolerance = { B: nominalHeight * 0.05, C: nominalHeight * 0.1, D: nominalHeight * 0.15 };
    const maxTolerance = tolerance[level as keyof typeof tolerance] || 0;
    const allowed = variation <= maxTolerance;
    
    return {
      allowed,
      result: allowed ? `Yükseklik varyasyonu kabul edilebilir` : `Yükseklik varyasyonu kabul edilemez`,
      reason: `${level} kalite seviyesi için maksimum tolerans: ±${maxTolerance.toFixed(2)}mm`
    };
  },

  convexity: (params, level) => {
    const { width, height } = params;
    const ratio = height / width;
    const limits = { B: 0.1, C: 0.15, D: 0.2 };
    const maxRatio = limits[level as keyof typeof limits] || 0;
    const allowed = ratio <= maxRatio;
    
    return {
      allowed,
      result: allowed ? `Dışbükeylik kabul edilebilir` : `Dışbükeylik kabul edilemez`,
      reason: `${level} kalite seviyesi için maksimum h/w oranı: ${maxRatio}`
    };
  },

  concavity: (params, level) => {
    const { width, depth } = params;
    const ratio = depth / width;
    const limits = { B: 0.05, C: 0.1, D: 0.15 };
    const maxRatio = limits[level as keyof typeof limits] || 0;
    const allowed = ratio <= maxRatio;
    
    return {
      allowed,
      result: allowed ? `İçbükeylik kabul edilebilir` : `İçbükeylik kabul edilemez`,
      reason: `${level} kalite seviyesi için maksimum d/w oranı: ${maxRatio}`
    };
  },



  start_defect: (params, level) => {
    const { length, height } = params;
    const limits = { B: 1, C: 2, D: 3 }; // mm
    const maxLimit = limits[level as keyof typeof limits] || 0;
    const allowed = length <= maxLimit && height <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Başlangıç hatası kabul edilebilir` : `Başlangıç hatası kabul edilemez`,
      reason: `${level} kalite seviyesi için maksimum boyut: ${maxLimit}mm`
    };
  },

  end_defect: (params, level) => {
    const { length, height } = params;
    const limits = { B: 1, C: 2, D: 3 }; // mm
    const maxLimit = limits[level as keyof typeof limits] || 0;
    const allowed = length <= maxLimit && height <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Bitiş hatası kabul edilebilir` : `Bitiş hatası kabul edilemez`,
      reason: `${level} kalite seviyesi için maksimum boyut: ${maxLimit}mm`
    };
  },

  restart_defect: (params, level) => {
    const { length, height } = params;
    const limits = { B: 1, C: 2, D: 4 }; // mm
    const maxLimit = limits[level as keyof typeof limits] || 0;
    const allowed = length <= maxLimit && height <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Yeniden başlatma hatası kabul edilebilir` : `Yeniden başlatma hatası kabul edilemez`,
      reason: `${level} kalite seviyesi için maksimum boyut: ${maxLimit}mm`
    };
  },

  multipass_defect: (params, level) => {
    const { length, depth } = params;
    const limits = { B: 0.5, C: 1, D: 2 }; // mm
    const maxLimit = limits[level as keyof typeof limits] || 0;
    const allowed = length <= maxLimit && depth <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Çok geçişli kaynak hatası kabul edilebilir` : `Çok geçişli kaynak hatası kabul edilemez`,
      reason: `${level} kalite seviyesi için maksimum boyut: ${maxLimit}mm`
    };
  },



  deviation: (params, level) => {
    const { deviation, length } = params;
    const limits = { B: 1, C: 2, D: 3 }; // mm
    const maxLimit = limits[level as keyof typeof limits] || 0;
    const allowed = deviation <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Sapma kabul edilebilir (${deviation}mm ≤ ${maxLimit}mm)` : `Sapma kabul edilemez (${deviation}mm > ${maxLimit}mm)`,
      reason: `${level} kalite seviyesi için maksimum sapma: ${maxLimit}mm`
    };
  },

  leg_length: (params, level) => {
    const { nominalLeg, actualLeg } = params;
    const minRequired = nominalLeg * 0.9; // Minimum %90 nominal değer
    const allowed = actualLeg >= minRequired;
    
    return {
      allowed,
      result: allowed ? `Bacak boyu yeterli (${actualLeg}mm ≥ ${minRequired.toFixed(2)}mm)` : `Bacak boyu yetersiz (${actualLeg}mm < ${minRequired.toFixed(2)}mm)`,
      reason: `Minimum gerekli bacak boyu: nominal değerin %90'ı (${minRequired.toFixed(2)}mm)`
    };
  },

  asymmetric_fillet: (params, level) => {
    const { leg1, leg2 } = params;
    const difference = Math.abs(leg1 - leg2);
    const limits = { B: 1, C: 2, D: 3 }; // mm
    const maxDifference = limits[level as keyof typeof limits] || 0;
    const allowed = difference <= maxDifference;
    
    return {
      allowed,
      result: allowed ? `Asimetri kabul edilebilir (${difference.toFixed(2)}mm ≤ ${maxDifference}mm)` : `Asimetri kabul edilemez (${difference.toFixed(2)}mm > ${maxDifference}mm)`,
      reason: `${level} kalite seviyesi için maksimum bacak farkı: ${maxDifference}mm`
    };
  },



  angular_misalignment: (params, level) => {
    const { nominalAngle, actualAngle } = params;
    const deviation = Math.abs(actualAngle - nominalAngle);
    const limits = { B: 1, C: 2, D: 3 }; // derece
    const maxLimit = limits[level as keyof typeof limits] || 0;
    const allowed = deviation <= maxLimit;
    
    return {
      allowed,
      result: allowed ? `Açısal sapma kabul edilebilir (${deviation.toFixed(1)}° ≤ ${maxLimit}°)` : `Açısal sapma kabul edilemez (${deviation.toFixed(1)}° > ${maxLimit}°)`,
      reason: `${level} kalite seviyesi için maksimum açısal sapma: ${maxLimit}°`
    };
  },

  root_width: (params, level) => {
    const { nominalWidth, actualWidth } = params;
    const minRequired = nominalWidth * 0.8; // Minimum %80 nominal değer
    const allowed = actualWidth >= minRequired;
    
    return {
      allowed,
      result: allowed ? `Kök genişliği yeterli (${actualWidth}mm ≥ ${minRequired.toFixed(2)}mm)` : `Kök genişliği yetersiz (${actualWidth}mm < ${minRequired.toFixed(2)}mm)`,
      reason: `Minimum gerekli kök genişliği: nominal değerin %80'i (${minRequired.toFixed(2)}mm)`
    };
  }
};

const ISO5817WeldLimit: React.FC = () => {
  // Modern State Management
  const [modernWizardOpen, setModernWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedWeldType, setSelectedWeldType] = useState('');
  const [selectedDefect, setSelectedDefect] = useState<any>(null);
  const [wizardParameters, setWizardParameters] = useState<{ [key: string]: any }>({});
  const [wizardResult, setWizardResult] = useState<ModernCalculationResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDefects, setFilteredDefects] = useState<any[]>([]);

  // Filtered defects based on selected weld type
  const availableDefects = useMemo(() => {
    if (!selectedWeldType) return [];
    const baseDefects = DEFECT_TYPES.filter(defect => 
      defect.appliesTo.includes(selectedWeldType)
    );
    
    if (!searchTerm) return baseDefects;
    
    return baseDefects.filter(defect => 
      defect.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defect.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defect.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedWeldType, searchTerm]);

  // Wizard Steps
  const wizardSteps = ['Kaynak Tipi', 'Hata Seçimi', 'Parametreler', 'Sonuç'];

  // Modern Wizard Functions
  const openModernWizard = () => {
    setModernWizardOpen(true);
    setCurrentStep(0);
    setSelectedWeldType('');
    setSelectedDefect(null);
    setWizardParameters({});
    setWizardResult(null);
    setSearchTerm('');
    setFilteredDefects([]);
  };

  const closeModernWizard = () => {
    setModernWizardOpen(false);
  };

  const nextStep = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateModernResult = () => {
    if (!selectedDefect) return;
    
    const calculationEngine = CALCULATION_ENGINE[selectedDefect.calculation];
    if (!calculationEngine) return;

    // Tüm kalite seviyeleri için hesaplama yap
    const qualityLevels = ['B', 'C', 'D'];
    const allCalculations = qualityLevels.map(level => ({
      level,
      result: calculationEngine(wizardParameters, level)
    }));
    
    const modernResult = {
      defectInfo: {
        code: selectedDefect.code,
        name: selectedDefect.name,
        category: selectedDefect.category,
        description: selectedDefect.description
      },
      parameters: wizardParameters,
      allCalculations, // Tüm seviyeler için sonuçlar
      standard: 'ISO 5817',
      calculatedAt: new Date().toISOString()
    };
    
    setWizardResult(modernResult as any);
    setCurrentStep(3); // Go to results step
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default'
    }}>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            fontWeight={700} 
            gutterBottom 
            sx={{ 
              color: 'primary.main',
              mb: 2,
              background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            ISO 5817 Kaynak Limit Değerlendirmesi
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: '500px', mx: 'auto', lineHeight: 1.6, fontWeight: 400 }}>
            ISO 5817 standardına uygun kaynak kalite kontrolü ve değerlendirme sistemi.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<EngineeringIcon />}
            onClick={openModernWizard}
            sx={{
              py: 3,
              px: 6,
              borderRadius: '16px',
              fontSize: '1.2rem',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
              textTransform: 'none',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 40px rgba(33, 150, 243, 0.4)',
              }
            }}
          >
            Hesaplama Başlat
          </Button>
        </Box>

        {/* Features */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <ConstructionIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Birleştirme Tipi Belirleme
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ISO 5817 kapsamındaki alın, köşe, kenar ve T-kaynak birleştirme tiplerinden 
                değerlendirme yapılacak olanı seçin
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <FilterListIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Akıllı Hata Sınıflandırması
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Seçilen birleştirme tipine uygun ISO 5817 hata kategorileri 
                otomatik filtrelenerek sunulur
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <CalculateIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Hassas Parametre Analizi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Her hata türüne özgü ölçüm parametreleri dinamik olarak 
                belirlenerek doğru değerlendirme sağlanır
              </Typography>
            </Card>
          </Grid>
        </Grid>

      </Container>

      {/* Modern Wizard Modal */}
      <Dialog
        open={modernWizardOpen}
        onClose={closeModernWizard}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            borderBottom: '1px solid #e0e0e0',
            background: 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)',
            color: 'white',
            fontWeight: 600,
            py: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EngineeringIcon sx={{ fontSize: '2rem' }} />
            <Box>
              <Typography variant="h5" fontWeight={700}>
                ISO 5817 Modern Hesaplama Sihirbazı
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Adım adım kaynak kalitesi değerlendirmesi
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {/* Stepper */}
          <Box sx={{ px: 4, py: 3, bgcolor: '#f8f9fa' }}>
            <Stepper activeStep={currentStep} alternativeLabel>
              {wizardSteps.map((label, index) => (
                <Step key={label}>
                  <StepLabel 
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontWeight: currentStep === index ? 600 : 400,
                        fontSize: '0.9rem'
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Step Content */}
          <Box sx={{ p: 4, minHeight: '400px' }}>
            {/* Step 1: Weld Type Selection */}
            {currentStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                  Kaynak Tipini Seçin
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  İnceleme yapılacak birleştirme tipini belirleyin. Seçiminize göre ilgili hata sınıflandırmaları 
                  ISO 5817 standardı kapsamında filtrelenecektir.
                </Typography>
                
                <Grid container spacing={2}>
                  {WELD_TYPES.map((weldType) => (
                    <Grid item xs={12} sm={6} md={4} key={weldType.value}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: selectedWeldType === weldType.value ? '2px solid' : '1px solid',
                          borderColor: selectedWeldType === weldType.value ? 'primary.main' : 'divider',
                          bgcolor: selectedWeldType === weldType.value ? 'primary.50' : 'background.paper',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                        onClick={() => setSelectedWeldType(weldType.value)}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                          <Avatar
                            sx={{
                              bgcolor: selectedWeldType === weldType.value ? 'primary.main' : 'grey.300',
                              color: 'white',
                              width: 56,
                              height: 56,
                              mx: 'auto',
                              mb: 2,
                              fontSize: '1.5rem',
                              fontWeight: 600
                            }}
                          >
                            {weldType.value.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="h6" fontWeight={600} gutterBottom>
                            {weldType.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {weldType.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Step 2: Defect Selection */}
            {currentStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                  Hata Türünü Seçin
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  <strong>{WELD_TYPES.find(w => w.value === selectedWeldType)?.label}</strong> birleştirme tipi için 
                  uygun olan ISO 5817 hata kategorilerini inceleyiniz.
                </Typography>
                
                {/* Hata Arama Kısmı */}
                <TextField
                  fullWidth
                  placeholder="Hata kodunu veya adını arayın (örn: 5011, çökük, taşma...)"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  sx={{ mb: 3 }}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                
                {/* Kabul Seviyeleri Bilgi Kartı */}
                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>ISO 5817 Kabul Seviyeleri</AlertTitle>
                  <Typography variant="body2">
                    <strong>B Seviyesi:</strong> Yüksek kalite - Kritik uygulamalar için
                  </Typography>
                  <Typography variant="body2">
                    <strong>C Seviyesi:</strong> Orta kalite - Genel uygulamalar için  
                  </Typography>
                  <Typography variant="body2">
                    <strong>D Seviyesi:</strong> Düşük kalite - Basit uygulamalar için
                  </Typography>
                </Alert>

                {availableDefects.length > 0 ? (
                  <Grid container spacing={2}>
                    {availableDefects.map((defect) => (
                      <Grid item xs={12} md={6} key={defect.code}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            border: selectedDefect?.code === defect.code ? '2px solid' : '1px solid',
                            borderColor: selectedDefect?.code === defect.code ? 'primary.main' : 'divider',
                            bgcolor: selectedDefect?.code === defect.code ? 'primary.50' : 'background.paper',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: 'primary.main',
                              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)',
                              transform: 'translateY(-1px)'
                            }
                          }}
                          onClick={() => setSelectedDefect(defect)}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <Chip 
                                label={defect.code} 
                                size="small" 
                                color="primary" 
                                variant={selectedDefect?.code === defect.code ? "filled" : "outlined"}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                  {defect.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {defect.description}
                                </Typography>
                                <Chip 
                                  label={defect.category} 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="warning">
                    Bu kaynak tipi için henüz hata tanımı bulunmamaktadır.
                  </Alert>
                )}
              </Box>
            )}

            {/* Step 3: Parameter Input */}
            {currentStep === 2 && selectedDefect && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                  Parametreleri Girin
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  <strong>{selectedDefect.name}</strong> hata türünün değerlendirmesi için 
                  gerekli ölçüm parametrelerini hassas olarak giriniz.
                </Typography>

                <Grid container spacing={3}>
                  {selectedDefect.parameters?.map((paramName: string) => {
                    const paramDef = PARAMETER_DEFINITIONS[paramName];
                    if (!paramDef) return null;
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={paramName}>
                        <TextField
                          fullWidth
                          label={`${paramDef.label} (${paramDef.unit})`}
                          type={paramDef.type}
                          value={wizardParameters[paramName] || ''}
                          onChange={(e) => {
                            const value = paramDef.type === 'number' ? Number(e.target.value) : e.target.value;
                            setWizardParameters(prev => ({
                              ...prev,
                              [paramName]: value
                            }));
                          }}
                          inputProps={paramDef.type === 'number' ? {
                            min: paramDef.min,
                            max: paramDef.max,
                            step: 0.1
                          } : {}}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'background.paper'
                            }
                          }}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}

            {/* Step 4: Results */}
            {currentStep === 3 && wizardResult && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                  Tüm Kalite Seviyeleri İçin Hesaplama Sonuçları
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Hata Bilgileri
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                          <Typography><strong>Kod:</strong> {wizardResult.defectInfo.code}</Typography>
                          <Typography><strong>Adı:</strong> {wizardResult.defectInfo.name}</Typography>
                          <Typography><strong>Kategori:</strong> {wizardResult.defectInfo.category}</Typography>
                          <Typography><strong>Açıklama:</strong> {wizardResult.defectInfo.description}</Typography>
                        </Box>

                        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                          Kullanılan Parametreler
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                          {Object.entries(wizardResult.parameters).map(([key, value]) => {
                            const paramDef = PARAMETER_DEFINITIONS[key];
                            const label = paramDef ? paramDef.label : key;
                            const unit = paramDef ? paramDef.unit : '';
                            return (
                              <Chip 
                                key={key} 
                                label={`${label}: ${value}${unit}`} 
                                variant="outlined" 
                                size="small"
                                color="primary"
                              />
                            );
                          })}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Tüm Kalite Seviyeleri için Sonuçlar */}
                  {(wizardResult as any).allCalculations?.map((calc: any, index: number) => (
                    <Grid item xs={12} md={4} key={calc.level}>
                      <Card sx={{ 
                        height: '100%',
                        border: calc.result.allowed ? '2px solid' : '2px solid',
                        borderColor: calc.result.allowed ? 'success.main' : 'error.main',
                        bgcolor: calc.result.allowed ? 'success.50' : 'error.50'
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Chip 
                              label={`Seviye ${calc.level}`} 
                              color={
                                calc.level === 'B' ? 'success' :
                                calc.level === 'C' ? 'info' : 'warning'
                              } 
                              sx={{ fontWeight: 600 }}
                            />
                            <Typography variant="subtitle2" color="text.secondary">
                              {calc.level === 'B' ? 'Yüksek Kalite' :
                               calc.level === 'C' ? 'Orta Kalite' : 'Düşük Kalite'}
                            </Typography>
                          </Box>
                          
                          <Alert 
                            severity={calc.result.allowed ? "success" : "error"}
                            sx={{ mb: 2 }}
                          >
                            <Typography variant="body2" fontWeight={600}>
                              {calc.result.allowed ? '✓ Kabul Edilebilir' : '✗ Kabul Edilemez'}
                            </Typography>
                          </Alert>
                          
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Sonuç:</strong> {calc.result.result}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            <strong>Açıklama:</strong> {calc.result.reason}
                          </Typography>
                          
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {calc.level === 'B' ? 'Kritik uygulamalar için' :
                             calc.level === 'C' ? 'Genel uygulamalar için' : 'Basit uygulamalar için'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Özet Tablosu */}
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Kalite Seviyeleri Özet Tablosu
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Seviye</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Kalite</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Uygulama Alanı</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Sonuç</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(wizardResult as any).allCalculations?.map((calc: any) => (
                            <TableRow 
                              key={calc.level}
                              sx={{ 
                                bgcolor: calc.result.allowed ? 'success.50' : 'error.50',
                                '&:hover': { bgcolor: calc.result.allowed ? 'success.100' : 'error.100' }
                              }}
                            >
                              <TableCell>
                                <Chip 
                                  label={calc.level} 
                                  color={
                                    calc.level === 'B' ? 'success' :
                                    calc.level === 'C' ? 'info' : 'warning'
                                  } 
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {calc.level === 'B' ? 'Yüksek' :
                                 calc.level === 'C' ? 'Orta' : 'Düşük'}
                              </TableCell>
                              <TableCell>
                                {calc.level === 'B' ? 'Kritik uygulamalar' :
                                 calc.level === 'C' ? 'Genel uygulamalar' : 'Basit uygulamalar'}
                              </TableCell>
                              <TableCell sx={{ maxWidth: 300 }}>
                                <Typography variant="body2">
                                  {calc.result.result}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={calc.result.allowed ? 'Kabul Edilebilir' : 'Kabul Edilemez'} 
                                  color={calc.result.allowed ? 'success' : 'error'}
                                  size="small"
                                  variant="filled"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
          <Button onClick={closeModernWizard} color="inherit">
            Kapat
          </Button>
          
          {currentStep > 0 && currentStep < 3 && (
            <Button onClick={prevStep} variant="outlined" color="primary">
              Önceki
            </Button>
          )}
          
          {currentStep === 0 && selectedWeldType && (
            <Button onClick={nextStep} variant="contained" color="primary">
              Hataları Listele
            </Button>
          )}
          
          {currentStep === 1 && selectedDefect && (
            <Button onClick={nextStep} variant="contained" color="primary">
              Parametreleri Gir
            </Button>
          )}
          
          {currentStep === 2 && selectedDefect && (
            <Button onClick={calculateModernResult} variant="contained" color="success">
              Hesapla
            </Button>
          )}
          
          {currentStep === 3 && (
            <Button 
              onClick={() => {
                // Reset for new calculation
                setCurrentStep(0);
                setSelectedWeldType('');
                setSelectedDefect(null);
                setWizardParameters({});
                setWizardResult(null);
                setSearchTerm('');
                setFilteredDefects([]);
              }} 
              variant="contained" 
              color="primary"
            >
              Yeni Hesaplama
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default ISO5817WeldLimit;