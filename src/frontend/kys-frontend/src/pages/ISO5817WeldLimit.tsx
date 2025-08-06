import React, { useState } from 'react';
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
  Divider,
  Tooltip,
  Container,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Calculate as CalculateIcon,
  Engineering as EngineeringIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Construction as ConstructionIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Modern Types
interface WeldData {
  materialThickness: number;
  weldType: string;
  weldWidth: number;
  weldHeight?: number;             // Kaynak yüksekliği (h) - alın kaynak için
  defectCode: string;
  defectType: string;              // Modern: Dinamik hata türü
  qualityLevel: string;            // B, C, D
  dynamicParameters: { [key: string]: any }; // Dinamik parametreler
  // Köşe kaynak özel parametreleri
  nominalThroatThickness?: number; // Nominal boğaz kalınlığı (a)
  actualThroatThickness?: number;  // Fiili boğaz kalınlığı (aA)
  legLength1?: number;             // İlk bacak boyu (z1)
  legLength2?: number;             // İkinci bacak boyu (z2)
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

interface DefectLimit {
  code: string;
  name: string;
  description: string;
  levelB: string;
  levelC: string;
  levelD: string;
  formula?: string;
}

interface CalculationResult {
  defectInfo: {
    code: string;
    name: string;
    description: string;
  };
  weldDetails: {
    materialThickness: number;
    weldType: string;
    weldWidth: number;
    weldHeight?: number;
    nominalThroatThickness?: number;
    actualThroatThickness?: number;
    legLength1?: number;
    legLength2?: number;
  };
  limits: {
    levelB: { limit: string; calculated: number; status: 'pass' | 'fail' };
    levelC: { limit: string; calculated: number; status: 'pass' | 'fail' };
    levelD: { limit: string; calculated: number; status: 'pass' | 'fail' };
  };
}

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

const ResultCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
  border: '1px solid',
  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
}));

const CalculateButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  fontWeight: 600,
  borderRadius: theme.spacing(3),
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

// Constants
const WELD_TYPES = [
  { value: 'butt', label: 'Alın Kaynağı', description: 'İki parçanın uç uca kaynaklanması' },
  { value: 'fillet', label: 'Köşe Kaynağı', description: 'İki parçanın köşe şeklinde kaynaklanması' },
  { value: 'corner', label: 'Köşe Kaynak', description: 'Köşe birleştirmeler' },
  { value: 'edge', label: 'Kenar Kaynak', description: 'Kenar birleştirmeler' },
  { value: 'overlap', label: 'Bindirme Kaynak', description: 'Bindirme birleştirmeler' },
  { value: 'tee', label: 'T-Kaynak', description: 'T şeklinde birleştirmeler' },
];

// Modern Dinamik Hata Türleri ve Parametreleri
const DEFECT_TYPES = [
  {
    code: '100',
    name: 'Çatlak (Crack)',
    category: 'yüzey',
    parameters: ['length', 'depth'], // Sadece uzunluk ve derinlik
    description: 'Her kalite seviyesinde müsaade edilmeyen kritik hata',
    calculation: 'length_based', // Uzunluk bazlı hesaplama
    appliesTo: ['butt', 'fillet', 'corner', 'edge', 'overlap', 'tee']
  },
  {
    code: '101',
    name: 'Yüzey Porozitesi (Surface Porosity)',
    category: 'yüzey',
    parameters: ['diameter', 'count', 'area'],
    description: 'Kaynak yüzeyindeki gözenekler',
    calculation: 'area_density',
    appliesTo: ['butt', 'fillet', 'corner', 'edge', 'overlap', 'tee']
  },
  {
    code: '201',
    name: 'Penetrasyon Eksikliği (Lack of Penetration)',
    category: 'iç',
    parameters: ['depth', 'length', 'materialThickness'],
    description: 'Kaynak kökünde penetrasyon eksikliği',
    calculation: 'penetration_based',
    appliesTo: ['butt', 'tee']
  },
  {
    code: '202',
    name: 'Kaynak Eksikliği (Lack of Fusion)',
    category: 'iç',
    parameters: ['length', 'depth', 'location'],
    description: 'Ana metal ile kaynak metali arasında füzyon eksikliği',
    calculation: 'fusion_based',
    appliesTo: ['butt', 'fillet', 'tee']
  },
  {
    code: '300',
    name: 'Undercut',
    category: 'geometrik',
    parameters: ['depth', 'length', 'materialThickness'],
    description: 'Kaynak kenarındaki oyuk',
    calculation: 'undercut_based',
    appliesTo: ['butt', 'fillet', 'corner', 'tee']
  },
  {
    code: '301',
    name: 'Aşırı Yığılma (Excessive Reinforcement)',
    category: 'geometrik',
    parameters: ['height', 'width', 'throatThickness'],
    description: 'Kaynak metalinin aşırı yığılması',
    calculation: 'height_based',
    appliesTo: ['butt', 'fillet']
  },
  {
    code: '400',
    name: 'İç Porozite (Internal Porosity)',
    category: 'iç',
    parameters: ['diameter', 'count', 'volume', 'inspectionArea'],
    description: 'Kaynak içindeki gözenekler',
    calculation: 'volume_density',
    appliesTo: ['butt', 'fillet', 'corner', 'edge', 'overlap', 'tee']
  },
  {
    code: '401',
    name: 'Cüruf Kalıntısı (Slag Inclusion)',
    category: 'iç',
    parameters: ['length', 'width', 'depth'],
    description: 'Kaynak içinde kalan cüruf parçacıkları',
    calculation: 'inclusion_based',
    appliesTo: ['butt', 'fillet', 'corner', 'tee']
  }
];

// Dinamik Parametre Tanımları
const PARAMETER_DEFINITIONS = {
  length: { label: 'Uzunluk', unit: 'mm', type: 'number', min: 0, max: 1000 },
  depth: { label: 'Derinlik', unit: 'mm', type: 'number', min: 0, max: 100 },
  width: { label: 'Genişlik', unit: 'mm', type: 'number', min: 0, max: 100 },
  height: { label: 'Yükseklik', unit: 'mm', type: 'number', min: 0, max: 50 },
  diameter: { label: 'Çap', unit: 'mm', type: 'number', min: 0, max: 50 },
  count: { label: 'Adet', unit: 'adet', type: 'number', min: 1, max: 100 },
  area: { label: 'Alan', unit: 'mm²', type: 'number', min: 1, max: 10000 },
  volume: { label: 'Hacim', unit: 'mm³', type: 'number', min: 1, max: 1000000 },
  materialThickness: { label: 'Malzeme Kalınlığı', unit: 'mm', type: 'number', min: 1, max: 200 },
  throatThickness: { label: 'Boğaz Kalınlığı', unit: 'mm', type: 'number', min: 1, max: 50 },
  inspectionArea: { label: 'Muayene Alanı', unit: 'mm²', type: 'number', min: 100, max: 100000 },
  location: { label: 'Konum', unit: '', type: 'select', options: ['köök', 'yüzey', 'kenar'] }
};

// Modern Hesaplama Motoru
const CALCULATION_ENGINE = {
  length_based: (params: any, qualityLevel: string) => {
    // Çatlak için uzunluk bazlı hesaplama - hiçbir kalite seviyesinde müsaade edilmez
    return {
      allowed: false,
      result: 'REDDEDİLDİ',
      reason: 'Çatlaklar hiçbir kalite seviyesinde kabul edilemez',
      severity: 'CRITICAL'
    };
  },
  
  area_density: (params: any, qualityLevel: string) => {
    // Yüzey porozitesi için alan yoğunluğu hesaplaması
    const { diameter, count, area } = params;
    const totalPoreArea = Math.PI * Math.pow(diameter / 2, 2) * count;
    const density = (totalPoreArea / area) * 100; // Yüzde olarak
    
    const limits = {
      'B': 2, // %2 maksimum
      'C': 4, // %4 maksimum  
      'D': 6  // %6 maksimum
    };
    
    const limit = limits[qualityLevel] || limits['D'];
    const allowed = density <= limit;
    
    return {
      allowed,
      result: allowed ? 'KABUL EDİLDİ' : 'REDDEDİLDİ',
      reason: `Porozite yoğunluğu: ${density.toFixed(2)}% (Limit: ${limit}%)`,
      density: density.toFixed(2),
      limit,
      severity: density > limit * 1.5 ? 'HIGH' : density > limit ? 'MEDIUM' : 'LOW'
    };
  },
  
  penetration_based: (params: any, qualityLevel: string) => {
    // Penetrasyon eksikliği hesaplaması
    const { depth, length, materialThickness } = params;
    const penetrationRatio = (depth / materialThickness) * 100;
    
    const limits = {
      'B': 10, // %10 maksimum penetrasyon eksikliği
      'C': 20, // %20 maksimum
      'D': 30  // %30 maksimum
    };
    
    const limit = limits[qualityLevel] || limits['D'];
    const allowed = penetrationRatio <= limit;
    
    return {
      allowed,
      result: allowed ? 'KABUL EDİLDİ' : 'REDDEDİLDİ',
      reason: `Penetrasyon eksikliği: ${penetrationRatio.toFixed(1)}% (Limit: ${limit}%)`,
      penetrationRatio: penetrationRatio.toFixed(1),
      limit,
      severity: penetrationRatio > limit * 1.5 ? 'HIGH' : penetrationRatio > limit ? 'MEDIUM' : 'LOW'
    };
  },
  
  undercut_based: (params: any, qualityLevel: string) => {
    // Undercut hesaplaması
    const { depth, length, materialThickness } = params;
    const depthRatio = (depth / materialThickness) * 100;
    
    const limits = {
      'B': { maxDepth: 0.5, maxRatio: 5 },   // 0.5mm veya %5
      'C': { maxDepth: 1.0, maxRatio: 10 },  // 1.0mm veya %10
      'D': { maxDepth: 2.0, maxRatio: 15 }   // 2.0mm veya %15
    };
    
    const limit = limits[qualityLevel] || limits['D'];
    const depthOk = depth <= limit.maxDepth;
    const ratioOk = depthRatio <= limit.maxRatio;
    const allowed = depthOk && ratioOk;
    
    return {
      allowed,
      result: allowed ? 'KABUL EDİLDİ' : 'REDDEDİLDİ',
      reason: `Undercut derinliği: ${depth}mm (${depthRatio.toFixed(1)}%) - Limit: ${limit.maxDepth}mm (${limit.maxRatio}%)`,
      depth,
      depthRatio: depthRatio.toFixed(1),
      limit,
      severity: !depthOk || !ratioOk ? (depth > limit.maxDepth * 1.5 ? 'HIGH' : 'MEDIUM') : 'LOW'
    };
  },
  
  volume_density: (params: any, qualityLevel: string) => {
    // İç porozite hacim yoğunluğu hesaplaması
    const { diameter, count, volume, inspectionArea } = params;
    const poreVolume = Math.PI * Math.pow(diameter / 2, 2) * (diameter / 2) * (4/3) * count; // Küre hacmi yaklaşımı
    const density = (poreVolume / volume) * 100;
    
    const limits = {
      'B': 2,  // %2 maksimum hacim yoğunluğu
      'C': 4,  // %4 maksimum
      'D': 8   // %8 maksimum
    };
    
    const limit = limits[qualityLevel] || limits['D'];
    const allowed = density <= limit;
    
    return {
      allowed,
      result: allowed ? 'KABUL EDİLDİ' : 'REDDEDİLDİ',
      reason: `İç porozite yoğunluğu: ${density.toFixed(2)}% (Limit: ${limit}%)`,
      density: density.toFixed(2),
      limit,
      severity: density > limit * 2 ? 'HIGH' : density > limit ? 'MEDIUM' : 'LOW'
    };
  },
  
  height_based: (params: any, qualityLevel: string) => {
    // Aşırı yığılma yükseklik hesaplaması
    const { height, width, throatThickness } = params;
    const heightRatio = (height / throatThickness) * 100;
    
    const limits = {
      'B': { maxHeight: 3, maxRatio: 20 },   // 3mm veya %20
      'C': { maxHeight: 5, maxRatio: 30 },   // 5mm veya %30
      'D': { maxHeight: 7, maxRatio: 40 }    // 7mm veya %40
    };
    
    const limit = limits[qualityLevel] || limits['D'];
    const heightOk = height <= limit.maxHeight;
    const ratioOk = heightRatio <= limit.maxRatio;
    const allowed = heightOk && ratioOk;
    
    return {
      allowed,
      result: allowed ? 'KABUL EDİLDİ' : 'REDDEDİLDİ',
      reason: `Aşırı yığılma: ${height}mm (${heightRatio.toFixed(1)}%) - Limit: ${limit.maxHeight}mm (${limit.maxRatio}%)`,
      height,
      heightRatio: heightRatio.toFixed(1),
      limit,
      severity: !heightOk || !ratioOk ? 'MEDIUM' : 'LOW'
    };
  }
};

const QUALITY_LEVELS = [
  { 
    value: 'B', 
    label: 'B - Yüksek', 
    description: 'En sıkı toleranslar, kritik uygulamalar için',
    color: '#4caf50'
  },
  { 
    value: 'C', 
    label: 'C - Orta', 
    description: 'Genel amaçlı kullanım, standart uygulamalar',
    color: '#ff9800'
  },
  { 
    value: 'D', 
    label: 'D - Düşük', 
    description: 'Temel gereksinimler, düşük stres uygulamaları',
    color: '#f44336'
  },
];

const DEFECT_CODES: DefectLimit[] = [
  // 1. YÜZEY KUSURLARI
  {
    code: '100',
    name: 'Çatlak',
    description: 'Her üç kalite seviyesinde müsaade edilmez',
    levelB: 'Müsaade Edilmez',
    levelC: 'Müsaade Edilmez',
    levelD: 'Müsaade Edilmez',
  },
  {
    code: '104',
    name: 'Krater Çatlağı',
    description: 'Her üç kalite seviyesinde müsaade edilmez',
    levelB: 'Müsaade Edilmez',
    levelC: 'Müsaade Edilmez',
    levelD: 'Müsaade Edilmez',
  },
  {
    code: '2017',
    name: 'Yüzey Gözenek',
    description: 'Kalınlığa göre değişken toleranslar',
    levelB: 't≤3mm: Müsaade Edilmez; t>3mm: Müsaade Edilmez',
    levelC: 't≤3mm: Müsaade Edilmez; t>3mm: Alın: d≤0.2s (maks.2mm), İç köşe: d≤0.2GA (maks.2mm)',
    levelD: 't≤3mm: Alın: d≤0.3s, İç köşe: d≤0.3GA; t>3mm: Alın: d≤0.3s (maks.3mm), İç köşe: d≤0.3GA (maks.3mm)',
  },
  {
    code: '2025',
    name: 'Uç Krater Oluğu',
    description: 'Kalınlığa göre değişken toleranslar',
    levelB: 't≤3mm: Müsaade Edilmez; t>3mm: Müsaade Edilmez',
    levelC: 't≤3mm: Müsaade Edilmez; t>3mm: h≤0.1t (maks.1mm)',
    levelD: 't≤3mm: h≤0.2t; t>3mm: h≤0.2t (maks.2mm)',
    formula: '0.2*t'
  },
  {
    code: '401',
    name: 'Yetersiz Ergime',
    description: 'Her üç kalite seviyesinde müsaade edilmez',
    levelB: 'Müsaade Edilmez',
    levelC: 'Müsaade Edilmez',
    levelD: 'Müsaade Edilmez',
  },
  {
    code: '4021',
    name: 'Tamamlanmamış Kök Nüfuziyeti',
    description: 'Yalnızca tek taraftan alın kaynakları için',
    levelB: 'Müsaade Edilmez',
    levelC: 'Müsaade Edilmez',
    levelD: 'Kısa kusurlar: h≤0.2t (maks.2mm)',
    formula: '0.2*t'
  },
  {
    code: '5011',
    name: 'Sürekli Yanma Oluğu',
    description: 'Düzgün geçiş gerektirir, sistematik kusur olarak kabul edilmez',
    levelB: 't≤3mm: Müsaade Edilmez; t>3mm: Kısa kusurlar: h≤0.05t (maks.0.5mm)',
    levelC: 't≤3mm: Kısa kusurlar: h≤0.1t; t>3mm: Kısa kusurlar: h≤0.1t (maks.0.5mm)',
    levelD: 't≤3mm: Kısa kusurlar: h≤0.2t; t>3mm: Kısa kusurlar: h≤0.2t (maks.1mm)',
    formula: '0.2*t'
  },
  {
    code: '5012',
    name: 'Kesintili Yanma Oluğu',
    description: 'Düzgün geçiş gerektirir, sistematik kusur olarak kabul edilmez',
    levelB: 't≤3mm: Müsaade Edilmez; t>3mm: Kısa kusurlar: h≤0.05t (maks.0.5mm)',
    levelC: 't≤3mm: Kısa kusurlar: h≤0.1t; t>3mm: Kısa kusurlar: h≤0.1t (maks.0.5mm)',
    levelD: 't≤3mm: Kısa kusurlar: h≤0.2t; t>3mm: Kısa kusurlar: h≤0.2t (maks.1mm)',
    formula: '0.2*t'
  },
  {
    code: '5013',
    name: 'Çekme Oluğu',
    description: 'Düzgün geçiş gerektirir',
    levelB: 't≤3mm: Müsaade Edilmez; t>3mm: Kısa kusurlar: h≤0.05t (maks.0.5mm)',
    levelC: 't≤3mm: Kısa kusurlar: h≤0.1t; t>3mm: Kısa kusurlar: h≤0.1t (maks.1mm)',
    levelD: 't≤3mm: h≤0.2mm+0.1t; t>3mm: Kısa kusurlar: h≤0.2t (maks.2mm)',
    formula: '0.2*t + 0.1*t'
  },
  {
    code: '502',
    name: 'Aşırı Kaynak Metali (Alın Kaynağı)',
    description: 'Düzgün geçiş gerektirir',
    levelB: 'h≤1mm+0.1b (maks.5mm)',
    levelC: 'h≤1mm+0.15b (maks.7mm)',
    levelD: 'h≤1mm+0.25b (maks.10mm)',
    formula: '1 + 0.25*b'
  },
  {
    code: '503',
    name: 'Aşırı Dış Bükeylik (İç Köşe Kaynağı)',
    description: 'İç köşe kaynağında aşırı yükseklik',
    levelB: 'h≤1mm+0.1b (maks.3mm)',
    levelC: 'h≤1mm+0.15b (maks.4mm)',
    levelD: 'h≤1mm+0.25b (maks.5mm)',
    formula: '1 + 0.25*b'
  },
  {
    code: '504',
    name: 'Aşırı Nüfuziyet',
    description: 'Kalınlığa göre değişken toleranslar',
    levelB: 't≤3mm: h≤1mm+0.1b; t>3mm: h≤1mm+0.2b (maks.3mm)',
    levelC: 't≤3mm: h≤1mm+0.3b; t>3mm: h≤1mm+0.45b (maks.4mm)',
    levelD: 't≤3mm: h≤1mm+0.6b; t>3mm: h≤1mm+1.0b (maks.5mm)',
    formula: '1 + 1.0*b'
  },
  {
    code: '505',
    name: 'Yanlış Kaynak Kenarı',
    description: 'Açı toleransları kaynak türüne göre',
    levelB: 'Alın kaynağı: α≥150°; İç köşe kaynağı: α≥110°',
    levelC: 'Alın kaynağı: α≥110°; İç köşe kaynağı: α≥100°',
    levelD: 'Alın kaynağı: α≥90°; İç köşe kaynağı: α≥90°',
  },
  {
    code: '506',
    name: 'Binme/Taşma',
    description: 'Kaynak metalinin ana metal üzerine taşması',
    levelB: 'Müsaade Edilmez',
    levelC: 'Müsaade Edilmez',
    levelD: 'h≤0.2b',
    formula: '0.2*b'
  },
  {
    code: '509',
    name: 'Çökme',
    description: 'Düzgün geçiş gerekir',
    levelB: 't≤3mm: Müsaade Edilmez; t>3mm: Kısa kusurlar: h≤0.05t (maks.0.5mm)',
    levelC: 't≤3mm: Kısa kusurlar: h≤0.1t; t>3mm: Kısa kusurlar: h≤0.1t (maks.1mm)',
    levelD: 't≤3mm: Kısa kusurlar: h≤0.25t; t>3mm: Kısa kusurlar: h≤0.25t (maks.2mm)',
    formula: '0.25*t'
  },
  {
    code: '510',
    name: 'İçe Yanma',
    description: 'Her üç kalite seviyesinde müsaade edilmez',
    levelB: 'Müsaade Edilmez',
    levelC: 'Müsaade Edilmez',
    levelD: 'Müsaade Edilmez',
  },
  {
    code: '511',
    name: 'Yetersiz Doldurulmuş Kaynak Ağzı',
    description: 'Düzgün geçiş gerekir',
    levelB: 't≤3mm: Müsaade Edilmez; t>3mm: Kısa kusurlar: h≤0.05t (maks.0.5mm)',
    levelC: 't≤3mm: Kısa kusurlar: h≤0.1t; t>3mm: Kısa kusurlar: h≤0.1t (maks.1mm)',
    levelD: 't≤3mm: Kısa kusurlar: h≤0.25t; t>3mm: Kısa kusurlar: h≤0.25t (maks.2mm)',
    formula: '0.25*t'
  },

  // 2. İÇ KUSURLAR
  {
    code: '2011',
    name: 'Dağınık Porozite',
    description: 'Kaynak içinde dağınık gözenekler',
    levelB: 'V≤1%, Küçük gözenekler: d≤0.2t (maks.2mm)',
    levelC: 'V≤1.5%, Küçük gözenekler: d≤0.25t (maks.3mm)',
    levelD: 'V≤2%, Küçük gözenekler: d≤0.3t (maks.4mm)',
    formula: '0.3*t'
  },
  {
    code: '2012',
    name: 'Lokalize Porozite',
    description: 'Belirli bölgelerde yoğunlaşmış gözenekler',
    levelB: 'V≤1.5%, d≤0.2t (maks.3mm)',
    levelC: 'V≤2.5%, d≤0.25t (maks.4mm)',
    levelD: 'V≤4%, d≤0.3t (maks.5mm)',
    formula: '0.3*t'
  },
  {
    code: '2013',
    name: 'Sıralı Porozite',
    description: 'Düzenli sıralarda yerleşmiş gözenekler',
    levelB: 'Müsaade Edilmez',
    levelC: 'Kısa bölümler: l≤25mm, d≤3mm',
    levelD: 'Kısa bölümler: l≤50mm, d≤4mm',
  },
  {
    code: '2014',
    name: 'Solucan Deliği Porozitesi',
    description: 'Uzun tünel şeklinde gözenekler',
    levelB: 'Müsaade Edilmez',
    levelC: 'Kısa bölümler: l≤25mm',
    levelD: 'Kısa bölümler: l≤50mm',
  },
  {
    code: '301',
    name: 'Katı İçermeler (Cüruf, Akı, Oksit)',
    description: 'Kaynak içinde kalan yabancı maddeler',
    levelB: 'l≤0.5t (maks.3mm)',
    levelC: 'l≤0.75t (maks.5mm)',
    levelD: 'l≤t (maks.8mm)',
    formula: 't'
  },
  {
    code: '4011',
    name: 'Eksik Yan Füzyon',
    description: 'Kaynak metalinin yan yüzeylerle füzyon eksikliği',
    levelB: 'Müsaade Edilmez',
    levelC: 'Müsaade Edilmez',
    levelD: 'Kısa bölümler: l≤25mm',
  },
  {
    code: '4012',
    name: 'Eksik Ara Paso Füzyonu',
    description: 'Çok geçişli kaynaklarda geçişler arası füzyon eksikliği',
    levelB: 'Müsaade Edilmez',
    levelC: 'Müsaade Edilmez',
    levelD: 'Kısa bölümler: l≤25mm',
  },
  {
    code: '4013',
    name: 'Eksik Kök Füzyonu',
    description: 'Kök bölgesinde füzyon eksikliği',
    levelB: 'Müsaade Edilmez',
    levelC: 'Müsaade Edilmez',
    levelD: 'Kısa bölümler: l≤25mm',
  },

  // 3. GEOMETRİK SAPMAALAR
  {
    code: '515',
    name: 'Açısal Sapma',
    description: 'Planlanan açıdan sapma',
    levelB: '≤2°',
    levelC: '≤4°',
    levelD: '≤6°',
  },
  {
    code: '516',
    name: 'Boyutsal Sapma',
    description: 'Planlanan boyutlardan sapma',
    levelB: '≤±1mm',
    levelC: '≤±2mm',
    levelD: '≤±3mm',
  },
     {
     code: '517',
     name: 'Açı Toleransı',
     description: 'Köşe kaynağında açı sapması',
     levelB: '≤±1°',
     levelC: '≤±2°',
     levelD: '≤±3°',
   },

   // 4. MİKRO ERGİME NOKSANLIĞI (ÖzelDurum)
   {
     code: 'ME001',
     name: 'Mikro Ergime Noksanlığı',
     description: 'Yalnızca mikroskopla (50x) görülebilir',
     levelB: 'Müsaade Edilmez',
     levelC: 'Müsaade Edilir',
     levelD: 'Müsaade Edilir',
   },

   // 5. YER DEĞİŞTİRME VE DISTORSIYON
   {
     code: 'D001',
     name: 'Boyuna Büzülme',
     description: 'Kaynak sonrası uzunluk değişimi',
     levelB: '≤0.5mm/m',
     levelC: '≤1.0mm/m',
     levelD: '≤2.0mm/m',
   },
      {
     code: 'D002',
     name: 'Enine Büzülme',
     description: 'Kaynak sonrası genişlik değişimi',
     levelB: '≤0.3mm/m',
     levelC: '≤0.6mm/m',
     levelD: '≤1.0mm/m',
   },
   {
     code: '518',
    name: 'Kök Çıkıntısı',
    description: 'Kök tarafında aşırı metal birikimi',
    levelB: 'h ≤ 1 mm',
    levelC: 'h ≤ 2 mm',
    levelD: 'h ≤ 3 mm',
  },

  // 600 SERİSİ - ÇEŞİTLİ HATALAR
  {
    code: '601',
    name: 'Kaynak Sıçraması',
    description: 'Ana metal üzerinde kaynak sıçramaları',
    levelB: 'Sınırlı miktarda, kolay temizlenebilir',
    levelC: 'Orta miktarda',
    levelD: 'Yoğun sıçrama kabul edilebilir',
  },
  {
    code: '602',
    name: 'Temperleme Renkleri',
    description: 'Isıdan etkilenme bölgesinde renk değişimi',
    levelB: 'Mavi renk kabul edilemez',
    levelC: 'Hafif temperleme renkleri',
    levelD: 'Belirgin temperleme renkleri kabul edilebilir',
  },
  {
    code: '603',
    name: 'Yetersiz Temizlik',
    description: 'Kaynak bölgesinde yetersiz temizlik',
    levelB: 'Mükemmel temizlik gerekli',
    levelC: 'İyi temizlik gerekli',
    levelD: 'Temel temizlik yeterli',
  },
  {
    code: '617',
    name: 'Titreşim İzleri',
    description: 'Kaynak sırasında titreşim kaynaklı düzensizlikler',
    levelB: 'h ≤ 0.5 mm',
    levelC: 'h ≤ 1 mm',
    levelD: 'h ≤ 2 mm',
  },
  {
    code: '618',
    name: 'Manyetik Üflenme İzleri',
    description: 'Manyetik alanın neden olduğu düzensizlikler',
    levelB: 'Kabul edilemez',
    levelC: 'Sınırlı kabul edilebilir',
    levelD: 'Belirgin izler kabul edilebilir',
  },

  // EK HATALAR
  {
    code: '511',
    name: 'Kaynak Kenarında Çentik',
    description: 'Kaynak kenarında keskin çentikler',
    levelB: 'h ≤ 0.05×t, maks. 0.5 mm',
    levelC: 'h ≤ 0.1×t, maks. 1 mm',
    levelD: 'h ≤ 0.2×t, maks. 2 mm',
  },
  {
    code: '512',
    name: 'Kaynak Kenarında Erime',
    description: 'Ana metalin aşırı erimesi',
    levelB: 'h ≤ 0.5 mm',
    levelC: 'h ≤ 1 mm',
    levelD: 'h ≤ 2 mm',
  },
  {
    code: '513',
    name: 'Overlap (Bindirme)',
    description: 'Kaynak metalinin ana metal üzerine binmesi',
    levelB: 'h ≤ 0.1×t, maks. 1 mm',
    levelC: 'h ≤ 0.15×t, maks. 2 mm',
    levelD: 'h ≤ 0.25×t, maks. 4 mm',
  },
  {
    code: '514',
    name: 'Asimetrik Köşe Kaynak',
    description: 'Köşe kaynağında asimetrik ayak uzunlukları',
    levelB: '|z1-z2| ≤ 1 mm',
    levelC: '|z1-z2| ≤ 2 mm',
    levelD: '|z1-z2| ≤ 3 mm',
  },
  {
    code: '515',
    name: 'Kök Konkavlığı',
    description: 'Kaynak kökünde oluşan içbükeylik',
    levelB: 'h ≤ 0.05×b, maks. 1 mm',
    levelC: 'h ≤ 0.1×b, maks. 2 mm',
    levelD: 'h ≤ 0.15×b, maks. 4 mm',
  },
  {
    code: '516',
    name: 'Kök Porozitesi',
    description: 'Kaynak kökünde oluşan gaz boşlukları',
    levelB: 'd ≤ 0.2×t, maks. 2 mm',
    levelC: 'd ≤ 0.3×t, maks. 3 mm',
    levelD: 'd ≤ 0.4×t, maks. 4 mm',
  },
  {
    code: '517',
    name: 'Kök Çıkıntısı',
    description: 'Kaynak kökünde oluşan dışbükeylik',
    levelB: 'h ≤ 1 mm',
    levelC: 'h ≤ 2 mm',
    levelD: 'h ≤ 3 mm',
  },
  // 600 SERİSİ - ÇEŞİTLİ HATALAR
  {
    code: '601',
    name: 'Ark Çarpması',
    description: 'Ana metalde oluşan ark izleri',
    levelB: 'Kabul edilemez',
    levelC: 'Küçük izler kabul edilebilir',
    levelD: 'Hafif izler kabul edilebilir',
  },
  {
    code: '617',
    name: 'Titreşim İzleri',
    description: 'Kaynak yüzeyinde oluşan düzensizlikler',
    levelB: 'h ≤ 0.5 mm',
    levelC: 'h ≤ 1 mm',
    levelD: 'h ≤ 2 mm',
  },
];

const ISO5817WeldLimit: React.FC = () => {
  const [weldData, setWeldData] = useState<WeldData>({
    materialThickness: 0,
    weldType: '',
    weldWidth: 0,
    weldHeight: 0,
    defectCode: '',
    defectType: '',
    qualityLevel: 'C',
    dynamicParameters: {},
    nominalThroatThickness: 0,
    actualThroatThickness: 0,
    legLength1: 0,
    legLength2: 0,
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [modernResult, setModernResult] = useState<ModernCalculationResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [defectSearchTerm, setDefectSearchTerm] = useState<string>('');

  // Hata kodlarını filtreleme
  const filteredDefectCodes = DEFECT_CODES.filter(defect =>
    defectSearchTerm === '' ||
    defect.code.toLowerCase().includes(defectSearchTerm.toLowerCase()) ||
    defect.name.toLowerCase().includes(defectSearchTerm.toLowerCase()) ||
    defect.description.toLowerCase().includes(defectSearchTerm.toLowerCase())
  );

  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!weldData.materialThickness || weldData.materialThickness <= 0) {
      newErrors.materialThickness = 'Malzeme kalınlığı 0\'dan büyük olmalıdır';
    }
    if (!weldData.weldType) {
      newErrors.weldType = 'Kaynak tipi seçiniz';
    }
    // Alın kaynak için kaynak genişliği ve yüksekliği kontrolü
    if (weldData.weldType !== 'fillet') {
      if (!weldData.weldWidth || weldData.weldWidth <= 0) {
        newErrors.weldWidth = 'Kaynak genişliği 0\'dan büyük olmalıdır';
      }
      if (!weldData.weldHeight || weldData.weldHeight <= 0) {
        newErrors.weldHeight = 'Kaynak yüksekliği 0\'dan büyük olmalıdır';
      }
    }
    
    // Köşe kaynak için ek validasyonlar
    if (weldData.weldType === 'fillet') {
      if (!weldData.nominalThroatThickness || weldData.nominalThroatThickness <= 0) {
        newErrors.nominalThroatThickness = 'Nominal boğaz kalınlığı 0\'dan büyük olmalıdır';
      }
      if (!weldData.actualThroatThickness || weldData.actualThroatThickness <= 0) {
        newErrors.actualThroatThickness = 'Fiili boğaz kalınlığı 0\'dan büyük olmalıdır';
      }
      if (!weldData.legLength1 || weldData.legLength1 <= 0) {
        newErrors.legLength1 = 'İlk bacak boyu (z1) 0\'dan büyük olmalıdır';
      }
      if (!weldData.legLength2 || weldData.legLength2 <= 0) {
        newErrors.legLength2 = 'İkinci bacak boyu (z2) 0\'dan büyük olmalıdır';
      }
    }
    
    if (!weldData.defectCode) {
      newErrors.defectCode = 'Hata kodu seçiniz';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateLimits = () => {
    if (!validateInputs()) {
      return;
    }

    // Modern sistem için defect type bulma
    const modernDefect = DEFECT_TYPES.find(d => d.code === weldData.defectCode);
    if (modernDefect && modernDefect.calculation && CALCULATION_ENGINE[modernDefect.calculation]) {
      // Modern hesaplama motoru kullan
      const calculationResult = CALCULATION_ENGINE[modernDefect.calculation](
        weldData.dynamicParameters, 
        weldData.qualityLevel
      );
      
      const modernResult: ModernCalculationResult = {
        calculation: calculationResult,
        defectInfo: {
          code: modernDefect.code,
          name: modernDefect.name,
          category: modernDefect.category,
          description: modernDefect.description
        },
        parameters: weldData.dynamicParameters,
        qualityLevel: weldData.qualityLevel,
        standard: 'ISO 5817',
        calculatedAt: new Date().toISOString()
      };
      
      setModernResult(modernResult);
      return;
    }

    // Fallback: Eski sistem
    const defect = DEFECT_CODES.find(d => d.code === weldData.defectCode);
    if (!defect) return;

    const { 
      materialThickness: t, 
      weldWidth: b, 
      weldHeight: h = 0,
      nominalThroatThickness: a = 0,
      actualThroatThickness: aA = 0,
      legLength1: z1 = 0,
      legLength2: z2 = 0
    } = weldData;

    // DEBUG: 514 için critical variable values
    if (defect.code === '514') {
      console.log('514 Debug - calculateLimits Variable Check:', {
        weldDataLegLength1: weldData.legLength1,
        weldDataLegLength2: weldData.legLength2,
        destructuredZ1: z1,
        destructuredZ2: z2,
        fullWeldData: weldData,
        difference: Math.abs(z1 - z2)
      });
    }

    // TS EN ISO 5817 Standart Hesaplamaları
    const calculateLimit = (formula: string, level: 'B' | 'C' | 'D'): number => {
      const s = Math.min(t, b); // Küçük değer (t veya b'nin minimum)
      const GA = aA; // Fiili boğaz kalınlığı
      
      switch (defect.code) {
        // 1.1 ÇATLAK (100) - HER SEVİYEDE KABUL EDİLMEZ
        case '100':
        case '101': // Boyuna Çatlak
        case '102': // Enine Çatlak  
        case '103': // Radyal Çatlak
        case '510': // İçe yanma
          return 0; // Müsaade Edilmez
          
        // 1.2 KRATER ÇATLAĞI (104) - HER SEVİYEDE KABUL EDİLMEZ  
        case '104':
          return 0; // Müsaade Edilmez
          
        // 2025 - UÇ KRATER OLUĞU
        case '2025': {
          if (t <= 3) {
            switch (level) {
              case 'D': return 0.2 * t;
              case 'C': 
              case 'B': return 0; // Müsaade edilmez
              default: return 0;
            }
          } else {
            switch (level) {
              case 'D': return Math.min(0.2 * t, 2); // maks. 2 mm
              case 'C': return Math.min(0.1 * t, 1); // maks. 1 mm
              case 'B': return 0; // Müsaade edilmez
              default: return 0;
            }
          }
          break;
        }

        // 5011, 5012 - SÜREKLI/KESİNTİLİ YANMA OLUĞU
        case '5011':
        case '5012': {
          if (t <= 3) {
            switch (level) {
              case 'D': return 0.2 * t;
              case 'C': return 0.1 * t;
              case 'B': return 0; // Müsaade edilmez
              default: return 0;
            }
          } else {
            switch (level) {
              case 'D': return Math.min(0.2 * t, 1); // maks. 1 mm
              case 'C': return Math.min(0.1 * t, 0.5); // maks. 0.5 mm
              case 'B': return Math.min(0.05 * t, 0.5); // maks. 0.5 mm
              default: return 0;
            }
          }
          break;
        }

        // 5013 - ÇEKME OLUĞU
        case '5013': {
          if (t <= 3) {
            switch (level) {
              case 'D': return 0.2 + (0.1 * t);
              case 'C': return 0.1 * t;
              case 'B': return 0; // Müsaade edilmez
              default: return 0;
            }
          } else {
            switch (level) {
              case 'D': return Math.min(0.2 * t, 2); // maks. 2 mm
              case 'C': return Math.min(0.1 * t, 1); // maks. 1 mm
              case 'B': return Math.min(0.05 * t, 0.5); // maks. 0.5 mm
              default: return 0;
            }
          }
          break;
        }

        // 503 - AŞIRI DIŞ BÜKEYLİK (İç Köşe Kaynağı)
        case '503': {
          switch (level) {
            case 'D': return Math.min(1 + (0.25 * b), 5); // maks. 5 mm
            case 'C': return Math.min(1 + (0.15 * b), 4); // maks. 4 mm
            case 'B': return Math.min(1 + (0.1 * b), 3);  // maks. 3 mm
            default: return 0;
          }
          break;
        }

        // 506 - BİNME/TAŞMA
        case '506': {
          switch (level) {
            case 'D': return 0.2 * b;
            case 'C':
            case 'B': return 0; // Müsaade edilmez
            default: return 0;
          }
          break;
        }

        // 509, 511 - ÇÖKME / YETERSİZ DOLDURULMUŞ KAYNAK AĞZI
        case '509':
        case '511': {
          if (t <= 3) {
            switch (level) {
              case 'D': return 0.25 * t;
              case 'C': return 0.1 * t;
              case 'B': return 0; // Müsaade edilmez
              default: return 0;
            }
          } else {
            switch (level) {
              case 'D': return Math.min(0.25 * t, 2); // maks. 2 mm
              case 'C': return Math.min(0.1 * t, 1);  // maks. 1 mm
              case 'B': return Math.min(0.05 * t, 0.5); // maks. 0.5 mm
              default: return 0;
            }
          }
          break;
        }

        // 513 - OVERLAP (BİNDİRME)
        case '513': {
          switch (level) {
            case 'D': return Math.min(0.25 * t, 4); // maks. 4 mm
            case 'C': return Math.min(0.15 * t, 2); // maks. 2 mm
            case 'B': return Math.min(0.1 * t, 1);  // maks. 1 mm
            default: return 0;
          }
          break;
        }
          
        // 514 - ASİMETRİK KÖŞE KAYNAK
        case '514': {
          // Bacak uzunlukları arasındaki fark için limit hesaplama
          switch (level) {
            case 'D': return 3; // |z1-z2| ≤ 3 mm
            case 'C': return 2; // |z1-z2| ≤ 2 mm
            case 'B': return 1; // |z1-z2| ≤ 1 mm
            default: return 0;
          }
          break;
        }

        // 515 - AÇISAL SAPMA
        case '515': {
          switch (level) {
            case 'D': return 6; // ≤6°
            case 'C': return 4; // ≤4°
            case 'B': return 2; // ≤2°
            default: return 0;
          }
          break;
        }

        // 516 - BOYUTSAL SAPMA
        case '516': {
          switch (level) {
            case 'D': return 3; // ≤±3mm
            case 'C': return 2; // ≤±2mm
            case 'B': return 1; // ≤±1mm
            default: return 0;
          }
          break;
        }

        // 517 - AÇI TOLERANSI
        case '517': {
          switch (level) {
            case 'D': return 3; // ≤±3°
            case 'C': return 2; // ≤±2°
            case 'B': return 1; // ≤±1°
            default: return 0;
          }
          break;
        }
        
        // DİĞER KUSUR KODLARI - Mevcut hesaplama mantığını koru
        default: {
          // Diğer kodlar için mevcut basit hesaplama
          const factors = { B: 0.1, C: 0.2, D: 0.3 };
          return factors[level] * t;
        }
      }
      
      return 0;
    };

    // TS EN ISO 5817 Hesaplanabilir hata kodları listesi
    const calculableDefects = [
      '2025', '5011', '5012', '5013', '502', '503', '504', '505', 
      '506', '509', '510', '511', '2011', '2012', '2013', 
      '2014', '301', '4011', '4012', '4013', '513', '514', '515', '516', '517'
    ];

    const isCalculable = calculableDefects.includes(defect.code);

    // TS EN ISO 5817'ye göre gerçek ölçülen değeri belirle
    const getActualValue = (): number => {
      // DEBUG: 514 kodu için debug bilgileri
      if (defect.code === '514') {
        console.log('514 Debug - getActualValue (inside calculateLimits):', {
          defectCode: defect.code,
          z1: z1,
          z2: z2,
          calculated: Math.abs(z1 - z2),
          weldDataScope: { z1, z2, weldData }
        });
      }

      switch (defect.code) {
        // Yüzey kusurları - yükseklik bazlı ölçümler
        case '2025': // Uç Krater Oluğu
        case '5011': // Sürekli Yanma Oluğu
        case '5012': // Kesintili Yanma Oluğu
        case '5013': // Çekme Oluğu
        case '502':  // Aşırı Kaynak Metali
        case '503':  // Aşırı Dış Bükeylik
        case '504':  // Aşırı Nüfuziyet
        case '509':  // Çökme
        case '511':  // Yetersiz Doldurulmuş Kaynak Ağzı
          return h; // kaynak yüksekliği
          
        // Yüzey gözenekleri - çap bazlı ölçümler
        case '2017': // Yüzey Gözenek
        case '2011': // Dağınık Porozite
        case '2012': // Lokalize Porozite
          return Math.min(t, b); // Gözenek çapı (kullanıcıdan alınacak)
          
        // Binme/Taşma - yükseklik bazlı
        case '506': // Binme/Taşma
          return h; // taşma yüksekliği
          
        // Açı ölçümleri
        case '505': // Yanlış Kaynak Kenarı
          return 90; // kullanıcıdan açı değeri alınmalı (varsayılan 90°)
          
        // Kabul edilmeyen kusurlar - değer 0 olarak kalabilir
        case '100': // Çatlak
        case '104': // Krater Çatlağı
        case '401': // Yetersiz Ergime
        case '510': // İçe Yanma
          return 1; // Var/yok durumu (1=var, 0=yok)
          
        // Mikro ergime noksanlığı - mikroskopik görünürlük
        case 'ME001':
          return 1; // Mikroskopla görülür/görülmez
          
        // Kök nüfuziyeti - derinlik ölçümü
        case '4021': // Tamamlanmamış Kök Nüfuziyeti
          return h; // nüfuziyet derinliği
          
        // İç kusurlar - uzunluk bazlı
        case '2013': // Sıralı Porozite
        case '2014': // Solucan Deliği Porozitesi
        case '301':  // Katı İçermeler
        case '4011': // Eksik Yan Füzyon
        case '4012': // Eksik Ara Paso Füzyonu
        case '4013': // Eksik Kök Füzyonu
          return t; // kusur uzunluğu (kullanıcıdan alınacak)
          
        // Geometrik sapmalar
        case '515': // Açısal Sapma
        case '516': // Boyutsal Sapma
        case '517': // Açı Toleransı
          return 1; // sapma miktarı (kullanıcıdan alınacak)
          
        // Asimetrik Köşe Kaynak - bacak uzunlukları arasındaki fark
        case '514': // Asimetrik Köşe Kaynak
          return Math.abs(z1 - z2); // |z1-z2| farkı
          
        default:
          return 0;
      }
    };

    const actualValue = getActualValue();

    // Status hesaplama fonksiyonu
    const calculateStatus = (maxLimit: number): 'pass' | 'fail' => {
      // Müsaade edilmeyen durumlar (limit = 0) için her zaman fail
      if (maxLimit <= 0) {
        return 'fail';
      }
      
      // Hesaplanamayan durumlar için pass
      if (!isCalculable) {
        return 'pass';
      }
      
      // Ölçüm değeri ile karşılaştırma
      return actualValue <= maxLimit ? 'pass' : 'fail';
    };

    const limitB = isCalculable ? calculateLimit('', 'B') : 0;
    const limitC = isCalculable ? calculateLimit('', 'C') : 0;
    const limitD = isCalculable ? calculateLimit('', 'D') : 0;

    const limits = {
      levelB: {
        limit: defect.levelB,
        calculated: limitB,
        status: calculateStatus(limitB)
      },
      levelC: {
        limit: defect.levelC,
        calculated: limitC,
        status: calculateStatus(limitC)
      },
      levelD: {
        limit: defect.levelD,
        calculated: limitD,
        status: calculateStatus(limitD)
      },
    };

    const calculationResult: CalculationResult = {
      defectInfo: {
        code: defect.code,
        name: defect.name,
        description: defect.description,
      },
      weldDetails: {
        materialThickness: weldData.materialThickness,
        weldType: WELD_TYPES.find(w => w.value === weldData.weldType)?.label || '',
        weldWidth: weldData.weldWidth,
        weldHeight: weldData.weldHeight,

        nominalThroatThickness: weldData.nominalThroatThickness,
        actualThroatThickness: weldData.actualThroatThickness,
        legLength1: weldData.legLength1,
        legLength2: weldData.legLength2,
      },
      limits,
    };

    setResult(calculationResult);
  };

  const getQualityLevelColor = (level: string) => {
    const qualityLevel = QUALITY_LEVELS.find(q => q.value === level);
    return qualityLevel?.color || '#757575';
  };

  const getStatusIcon = (status: 'pass' | 'fail') => {
    return status === 'pass' ? 
      <CheckCircleIcon sx={{ color: '#4caf50', ml: 1 }} /> : 
      <CloseIcon sx={{ color: '#f44336', ml: 1, fontSize: '1.5rem', fontWeight: 'bold' }} />;
  };

  // Export functionality
  const exportResults = () => {
    if (!result) return;
    
    const actualValue = getActualValueForDisplay();
    const exportData = {
      timestamp: new Date().toISOString(),
      standard: 'ISO 5817:2023',
      defect: {
        code: result.defectInfo.code,
        name: result.defectInfo.name,
        description: result.defectInfo.description
      },
      weldDetails: result.weldDetails,
      actualMeasuredValue: actualValue,
      qualityLimits: {
        levelB: {
          formula: result.limits.levelB.limit,
          calculatedLimit: result.limits.levelB.calculated,
          status: result.limits.levelB.status,
          passes: actualValue <= result.limits.levelB.calculated
        },
        levelC: {
          formula: result.limits.levelC.limit,
          calculatedLimit: result.limits.levelC.calculated,
          status: result.limits.levelC.status,
          passes: actualValue <= result.limits.levelC.calculated
        },
        levelD: {
          formula: result.limits.levelD.limit,
          calculatedLimit: result.limits.levelD.calculated,
          status: result.limits.levelD.status,
          passes: actualValue <= result.limits.levelD.calculated
        }
      },
      recommendation: getQualityRecommendation()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ISO5817_Analysis_${result.defectInfo.code}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Quality recommendation based on results
  const getQualityRecommendation = (): string => {
    if (!result) return '';
    
    const actualValue = getActualValueForDisplay();
    const { levelB, levelC, levelD } = result.limits;
    
    if (actualValue <= levelB.calculated) {
      return 'Kaynak B kalite seviyesini karşılamaktadır. Kritik uygulamalar için uygundur.';
    } else if (actualValue <= levelC.calculated) {
      return 'Kaynak C kalite seviyesini karşılamaktadır. Genel uygulamalar için uygundur.';
    } else if (actualValue <= levelD.calculated) {
      return 'Kaynak sadece D kalite seviyesini karşılamaktadır. Düşük stres uygulamaları için uygundur.';
    } else {
      return 'Kaynak hiçbir kalite seviyesini karşılamamaktadır. Onarım gereklidir.';
    }
  };

  // Reset form
  const resetForm = () => {
    setWeldData({
      materialThickness: 0,
      weldType: '',
      weldWidth: 0,
      weldHeight: 0,
      defectCode: '',
      defectType: '',
      qualityLevel: 'C',
      dynamicParameters: {},
      nominalThroatThickness: 0,
      actualThroatThickness: 0,
      legLength1: 0,
      legLength2: 0,
    });
    setResult(null);
    setModernResult(null);
    setErrors({});
  };

  // TS EN ISO 5817'ye göre gerçek ölçülen değeri hesaplama - display için
  const getActualValueForDisplay = (): number => {
    if (!result) return 0;
    
    const defect = DEFECT_CODES.find(d => d.code === weldData.defectCode);
    if (!defect) return 0;

    const { weldHeight: h = 0, weldWidth: b = 0, actualThroatThickness: aA = 0, 
            legLength1: z1 = 0, legLength2: z2 = 0, materialThickness: t = 0 } = weldData;

    // DEBUG: 514 kodu için debug bilgileri
    if (defect.code === '514') {
      console.log('514 Debug - getActualValueForDisplay:', {
        defectCode: defect.code,
        z1: z1,
        z2: z2,
        calculated: Math.abs(z1 - z2),
        weldData: weldData
      });
    }

    // DEBUG: Her hesaplama için genel debug
    console.log('getActualValueForDisplay Debug:', {
      defectCode: defect.code,
      weldData: weldData,
      z1: z1,
      z2: z2
    });

    switch (defect.code) {
      // Yüzey kusurları - yükseklik bazlı ölçümler
      case '2025': // Uç Krater Oluğu
      case '5011': // Sürekli Yanma Oluğu
      case '5012': // Kesintili Yanma Oluğu
      case '5013': // Çekme Oluğu
      case '502':  // Aşırı Kaynak Metali
      case '503':  // Aşırı Dış Bükeylik
      case '504':  // Aşırı Nüfuziyet
      case '509':  // Çökme
      case '511':  // Yetersiz Doldurulmuş Kaynak Ağzı
      case '4021': // Tamamlanmamış Kök Nüfuziyeti
        return h; // kaynak yüksekliği
        
      // Yüzey gözenekleri - çap bazlı ölçümler
      case '2017': // Yüzey Gözenek
      case '2011': // Dağınık Porozite
      case '2012': // Lokalize Porozite
        return Math.min(t, b); // Gözenek çapı
        
      // Binme/Taşma - yükseklik bazlı
      case '506': // Binme/Taşma
        return h; // taşma yüksekliği
        
      // Açı ölçümleri
      case '505': // Yanlış Kaynak Kenarı
        return 90; // açı değeri (derece)
        
      // Kabul edilmeyen kusurlar - varlık durumu
      case '100': // Çatlak
      case '104': // Krater Çatlağı
      case '401': // Yetersiz Ergime
      case '510': // İçe Yanma
        return 1; // Var/yok durumu
        
      // Mikro ergime noksanlığı
      case 'ME001':
        return 1; // Mikroskopla görülür
        
      // İç kusurlar - uzunluk bazlı
      case '2013': // Sıralı Porozite
      case '2014': // Solucan Deliği Porozitesi
      case '301':  // Katı İçermeler
      case '4011': // Eksik Yan Füzyon
      case '4012': // Eksik Ara Paso Füzyonu
      case '4013': // Eksik Kök Füzyonu
        return t; // kusur uzunluğu
        
      // Geometrik sapmalar
      case '515': // Açısal Sapma
      case '516': // Boyutsal Sapma
      case '517': // Açı Toleransı
        return 1; // sapma miktarı
        
      // Asimetrik Köşe Kaynak - bacak uzunlukları arasındaki fark
      case '514': // Asimetrik Köşe Kaynak
        return Math.abs(z1 - z2); // |z1-z2| farkı
        
      default:
        return 0;
    }
  };

  // Değerlerin sıfır veya boş olup olmadığını kontrol eden yardımcı fonksiyon
  const isValidValue = (value: any): boolean => {
    if (value === null || value === undefined || value === '') return false;
    const numValue = Number(value);
    const strValue = String(value).trim();
    return numValue > 0 && !['0', '00', '000', '0000'].includes(strValue);
  };

  return (
          <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default'
    }}>


      {/* Main Content */}
      <Container maxWidth="xl" sx={{ pb: 4 }}>
        {/* Parameters Section */}
      <Paper sx={{ 
          p: 4, 
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalculateIcon color="primary" />
                Kaynak Parametreleri ve Hata Kodu Seçimi
            </Typography>
              <Typography variant="body2" color="text.secondary">
                Kaynak kalitesi değerlendirmesi için gerekli tüm parametreleri girin
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={resetForm}
                size="small"
              >
                Formu Sıfırla
              </Button>
              {result && (
                <Button
                  variant="contained"
                  startIcon={<ExportIcon />}
                  onClick={exportResults}
                  size="small"
                >
                  Sonuçları Dışa Aktar
                </Button>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Temel Parametreler */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Temel Kaynak Parametreleri
                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 3 }}>
                  <TextField
                      label="Malzeme Kalınlığı (t) - mm"
                    type="number"
                    value={weldData.materialThickness || ''}
                    onChange={(e) => setWeldData({...weldData, materialThickness: Number(e.target.value)})}
                    error={!!errors.materialThickness}
                    helperText={errors.materialThickness}
                    required
                    inputProps={{ min: 0, step: 0.1 }}
                      sx={{ '& .MuiInputLabel-root': { fontSize: '0.95rem' } }}
                  />
                  
                  <FormControl error={!!errors.weldType} required sx={{ '& .MuiInputLabel-root': { fontSize: '0.95rem' } }}>
                    <InputLabel>Kaynak Tipi</InputLabel>
                    <Select
                      value={weldData.weldType}
                      label="Kaynak Tipi"
                      onChange={(e) => setWeldData({...weldData, weldType: e.target.value})}
                    >
                      {WELD_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          <Typography variant="body2" fontWeight={600}>
                              {type.label}
                            </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Kaynak Tipine Özel Parametreler */}
              {weldData.weldType && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {weldData.weldType === 'fillet' ? 'Köşe Kaynak Parametreleri' : 'Alın Kaynak Parametreleri'}
                  </Typography>
                  
                  {weldData.weldType === 'fillet' ? (
                    // Köşe Kaynak Parametreleri
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
                      <TextField
                        label="Nominal Boğaz Kalınlığı (a) - mm"
                        type="number"
                        value={weldData.nominalThroatThickness || ''}
                        onChange={(e) => setWeldData({...weldData, nominalThroatThickness: Number(e.target.value)})}
                        error={!!errors.nominalThroatThickness}
                        helperText={errors.nominalThroatThickness}
                        required
                        inputProps={{ min: 0, step: 0.1 }}
                        sx={{ '& .MuiInputLabel-root': { fontSize: '0.95rem' } }}
                      />
                      <TextField
                        label="Fiili Boğaz Kalınlığı (aA) - mm"
                        type="number"
                        value={weldData.actualThroatThickness || ''}
                        onChange={(e) => setWeldData({...weldData, actualThroatThickness: Number(e.target.value)})}
                        error={!!errors.actualThroatThickness}
                        helperText={errors.actualThroatThickness}
                        required
                        inputProps={{ min: 0, step: 0.1 }}
                        sx={{ '& .MuiInputLabel-root': { fontSize: '0.95rem' } }}
                      />
                      <TextField
                        label="İlk Bacak Boyu (z1) - mm"
                        type="number"
                        value={weldData.legLength1 || ''}
                        onChange={(e) => setWeldData({...weldData, legLength1: Number(e.target.value)})}
                        error={!!errors.legLength1}
                        helperText={errors.legLength1}
                        required
                        inputProps={{ min: 0, step: 0.1 }}
                        sx={{ '& .MuiInputLabel-root': { fontSize: '0.95rem' } }}
                      />
                      <TextField
                        label="İkinci Bacak Boyu (z2) - mm"
                        type="number"
                        value={weldData.legLength2 || ''}
                        onChange={(e) => setWeldData({...weldData, legLength2: Number(e.target.value)})}
                        error={!!errors.legLength2}
                        helperText={errors.legLength2}
                        required
                        inputProps={{ min: 0, step: 0.1 }}
                        sx={{ '& .MuiInputLabel-root': { fontSize: '0.95rem' } }}
                      />
                    </Box>
                  ) : (
                    // Alın Kaynak Parametreleri
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
                      <TextField
                        label="Kaynak Genişliği (b) - mm"
                        type="number"
                        value={weldData.weldWidth || ''}
                        onChange={(e) => setWeldData({...weldData, weldWidth: Number(e.target.value)})}
                        error={!!errors.weldWidth}
                        helperText={errors.weldWidth}
                        required
                        inputProps={{ min: 0, step: 0.1 }}
                        sx={{ '& .MuiInputLabel-root': { fontSize: '0.95rem' } }}
                      />
                      <TextField
                        label="Kaynak Yüksekliği (h) - mm"
                        type="number"
                        value={weldData.weldHeight || ''}
                        onChange={(e) => setWeldData({...weldData, weldHeight: Number(e.target.value)})}
                        inputProps={{ min: 0, step: 0.1 }}
                        sx={{ '& .MuiInputLabel-root': { fontSize: '0.95rem' } }}
                      />
                    </Box>
                  )}
                </Box>
              )}

                             {/* Hata Kodu Seçimi */}
               <Box>
                 <Typography variant="h6" gutterBottom>
                   Hata Kodu Seçimi
                 </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Hata Kodu Ara..."
                    variant="outlined"
                    value={defectSearchTerm}
                    onChange={(e) => setDefectSearchTerm(e.target.value)}
                    placeholder="Hata kodu veya açıklama ile arama yapın"
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    }}
                    sx={{ maxWidth: 400 }}
                  />
                 
                 <FormControl fullWidth error={!!errors.defectCode} required>
                   <InputLabel>Hata Kodu</InputLabel>
                   <Select
                     value={weldData.defectCode}
                     label="Hata Kodu"
                     onChange={(e) => setWeldData({...weldData, defectCode: e.target.value})}
                     MenuProps={{
                       PaperProps: {
                         style: {
                           maxHeight: 400,
                         },
                       },
                     }}
                   >
                      {filteredDefectCodes.map((defect) => (
                       <MenuItem key={defect.code} value={defect.code}>
                          <Box sx={{ width: '100%' }}>
                            <Typography variant="body2" fontWeight={600} color="primary.main">
                              {defect.code}
                            </Typography>
                           <Typography variant="body2" fontWeight={500}>
                              {defect.name}
                           </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                             {defect.description}
                           </Typography>
                         </Box>
                       </MenuItem>
                     ))}
                      {filteredDefectCodes.length === 0 && (
                        <MenuItem disabled>
                          <Typography variant="body2" color="text.secondary">
                            Arama kriterine uygun hata kodu bulunamadı
                          </Typography>
                        </MenuItem>
                      )}
                   </Select>
                    {errors.defectCode && (
                      <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                        {errors.defectCode}
                      </Typography>
                    )}
                 </FormControl>
                </Box>
               </Box>

              {/* Dinamik Parametre Alanları */}
              {weldData.defectCode && (() => {
                const selectedDefect = DEFECT_TYPES.find(d => d.code === weldData.defectCode);
                if (!selectedDefect || !selectedDefect.parameters || selectedDefect.parameters.length === 0) {
                  return null;
                }
                
                return (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {selectedDefect.name} - Dinamik Parametreler
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {selectedDefect.description}
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
                      {selectedDefect.parameters.map((paramName) => {
                        const paramDef = PARAMETER_DEFINITIONS[paramName];
                        if (!paramDef) return null;
                        
                        return (
                          <TextField
                            key={paramName}
                            label={`${paramDef.label} (${paramDef.unit})`}
                            type={paramDef.type}
                            value={weldData.dynamicParameters[paramName] || ''}
                            onChange={(e) => {
                              const value = paramDef.type === 'number' ? Number(e.target.value) : e.target.value;
                              setWeldData({
                                ...weldData,
                                dynamicParameters: {
                                  ...weldData.dynamicParameters,
                                  [paramName]: value
                                }
                              });
                            }}
                            inputProps={{
                              min: paramDef.min,
                              max: paramDef.max,
                              step: paramDef.type === 'number' ? 0.1 : undefined
                            }}
                            helperText={`${paramDef.min !== undefined ? `Min: ${paramDef.min}` : ''} ${paramDef.max !== undefined ? `Max: ${paramDef.max}` : ''}`}
                            required
                            sx={{ '& .MuiInputLabel-root': { fontSize: '0.95rem' } }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                );
              })()}

              {/* Kalite Seviyesi Seçimi */}
              {weldData.defectCode && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Kalite Seviyesi
                  </Typography>
                  <FormControl fullWidth required>
                    <InputLabel>Kalite Seviyesi</InputLabel>
                    <Select
                      value={weldData.qualityLevel}
                      label="Kalite Seviyesi"
                      onChange={(e) => setWeldData({...weldData, qualityLevel: e.target.value})}
                    >
                      <MenuItem value="B">B - En Yüksek Kalite</MenuItem>
                      <MenuItem value="C">C - Orta Kalite</MenuItem>
                      <MenuItem value="D">D - Ortalama Kalite</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}

              {/* Hesapla Butonu */}
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                <Button
                   variant="contained"
                   size="large"
                   startIcon={<CalculateIcon />}
                   onClick={calculateLimits}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                 >
                   Kalite Limitlerini Hesapla
                </Button>
             </Box>
           </Box>
                  </Paper>

        {/* Modern Results Section */}
        {modernResult && (
         <Paper sx={{ 
            p: 4, 
            mb: 4,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon color="primary" />
                Modern Hesaplama Sonuçları - {modernResult.defectInfo.code}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ISO 5817 standardına göre dinamik parametre tabanlı kalite değerlendirmesi
             </Typography>
           </Box>
           
           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
             {/* Hata Bilgisi */}
             <Card variant="outlined">
               <CardContent>
                 <Typography variant="h6" gutterBottom>
                   <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                   Hata Bilgisi
                 </Typography>
                 <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                   <Box>
                     <Typography variant="caption" color="text.secondary">Hata Kodu</Typography>
                     <Typography variant="body1" fontWeight={600}>{modernResult.defectInfo.code}</Typography>
                   </Box>
                   <Box>
                     <Typography variant="caption" color="text.secondary">Hata Adı</Typography>
                     <Typography variant="body1" fontWeight={600}>{modernResult.defectInfo.name}</Typography>
                   </Box>
                   <Box>
                     <Typography variant="caption" color="text.secondary">Kategori</Typography>
                     <Typography variant="body1" fontWeight={600}>{modernResult.defectInfo.category}</Typography>
                   </Box>
                   <Box>
                     <Typography variant="caption" color="text.secondary">Kalite Seviyesi</Typography>
                     <Typography variant="body1" fontWeight={600}>{modernResult.qualityLevel}</Typography>
                   </Box>
                 </Box>
                 <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                   {modernResult.defectInfo.description}
                 </Typography>
               </CardContent>
             </Card>

             {/* Hesaplama Sonucu */}
             <Card variant="outlined">
               <CardContent>
                 <Typography variant="h6" gutterBottom>
                   <CalculateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                   Hesaplama Sonucu
                 </Typography>
                 <Box sx={{ 
                   display: 'flex', 
                   alignItems: 'center', 
                   gap: 2, 
                   p: 2, 
                   borderRadius: 2,
                   bgcolor: modernResult.calculation.allowed ? 'success.light' : 'error.light'
                 }}>
                   {modernResult.calculation.allowed ? (
                     <CheckCircleIcon sx={{ color: 'success.dark', fontSize: 40 }} />
                   ) : (
                     <CancelIcon sx={{ color: 'error.dark', fontSize: 40 }} />
                   )}
                   <Box>
                     <Typography variant="h6" fontWeight={700} 
                       color={modernResult.calculation.allowed ? 'success.dark' : 'error.dark'}>
                       {modernResult.calculation.result}
                     </Typography>
                     <Typography variant="body1">
                       {modernResult.calculation.reason}
                     </Typography>
                     {modernResult.calculation.severity && (
                       <Typography variant="caption" sx={{ 
                         px: 1, 
                         py: 0.5, 
                         borderRadius: 1, 
                         bgcolor: modernResult.calculation.severity === 'HIGH' ? 'error.main' : 
                                 modernResult.calculation.severity === 'MEDIUM' ? 'warning.main' : 'info.main',
                         color: 'white',
                         fontWeight: 600
                       }}>
                         Öncelik: {modernResult.calculation.severity}
                       </Typography>
                     )}
                   </Box>
                 </Box>
               </CardContent>
             </Card>

             {/* Girilen Parametreler */}
             <Card variant="outlined">
               <CardContent>
                 <Typography variant="h6" gutterBottom>
                   <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                   Girilen Parametreler
                 </Typography>
                 <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                   {Object.entries(modernResult.parameters).map(([key, value]) => {
                     const paramDef = PARAMETER_DEFINITIONS[key];
                     return (
                       <Box key={key}>
                         <Typography variant="caption" color="text.secondary">
                           {paramDef?.label || key}
                         </Typography>
                         <Typography variant="body1" fontWeight={600}>
                           {value} {paramDef?.unit || ''}
                         </Typography>
                       </Box>
                     );
                   })}
                 </Box>
               </CardContent>
             </Card>
           </Box>
         </Paper>
        )}

        {/* Results Section */}
        {result && (
         <Paper sx={{ 
            p: 4, 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon color="primary" />
                Hesaplama Sonuçları - {result.defectInfo.code}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                TS EN ISO 5817 standardına göre kalite değerlendirme sonuçları
             </Typography>
           </Box>
           
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Hata Bilgisi */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Hata Bilgisi
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Hata Kodu</Typography>
                        <Typography variant="body1" fontWeight={500}>{result.defectInfo.code}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Hata Adı</Typography>
                        <Typography variant="body1" fontWeight={500}>{result.defectInfo.name}</Typography>
                      </Box>
                      <Box sx={{ gridColumn: 'span 2' }}>
                        <Typography variant="subtitle2" color="text.secondary">Açıklama</Typography>
                        <Typography variant="body2">{result.defectInfo.description}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                                 {/* Kaynak Detayları */}
                 <Card variant="outlined">
                   <CardContent>
                     <Typography variant="h6" gutterBottom>
                       <ConstructionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                       Kaynak Detayları
                     </Typography>
                     <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
                       {isValidValue(result.weldDetails.materialThickness) && (
                         <Box>
                           <Typography variant="subtitle2" color="text.secondary">Malzeme Kalınlığı</Typography>
                           <Typography variant="h6" fontWeight={600}>{result.weldDetails.materialThickness} mm</Typography>
                         </Box>
                       )}
                       {result.weldDetails.weldType && result.weldDetails.weldType !== '' && (
                         <Box>
                           <Typography variant="subtitle2" color="text.secondary">Kaynak Tipi</Typography>
                           <Typography variant="h6" fontWeight={600}>
                             {result.weldDetails.weldType === 'butt' ? 'Alın Kaynağı' : 
                              result.weldDetails.weldType === 'fillet' ? 'Köşe Kaynağı' : result.weldDetails.weldType}
                           </Typography>
                         </Box>
                       )}
                       {isValidValue(result.weldDetails.weldWidth) && (
                         <Box>
                           <Typography variant="subtitle2" color="text.secondary">Genişlik (b)</Typography>
                           <Typography variant="h6" fontWeight={600}>{result.weldDetails.weldWidth} mm</Typography>
                         </Box>
                       )}
                       {isValidValue(result.weldDetails.weldHeight) && (
                         <Box>
                           <Typography variant="subtitle2" color="text.secondary">Yükseklik (h)</Typography>
                           <Typography variant="h6" fontWeight={600}>{result.weldDetails.weldHeight} mm</Typography>
                         </Box>
                       )}
                       {isValidValue(result.weldDetails.nominalThroatThickness) && (
                         <Box>
                           <Typography variant="subtitle2" color="text.secondary">Nominal Boğaz (a)</Typography>
                           <Typography variant="h6" fontWeight={600}>{result.weldDetails.nominalThroatThickness} mm</Typography>
                         </Box>
                       )}
                       {isValidValue(result.weldDetails.actualThroatThickness) && (
                         <Box>
                           <Typography variant="subtitle2" color="text.secondary">Fiili Boğaz (aA)</Typography>
                           <Typography variant="h6" fontWeight={600}>{result.weldDetails.actualThroatThickness} mm</Typography>
                         </Box>
                       )}
                       {isValidValue(result.weldDetails.legLength1) && (
                         <Box>
                           <Typography variant="subtitle2" color="text.secondary">Bacak 1 (z1)</Typography>
                           <Typography variant="h6" fontWeight={600}>{result.weldDetails.legLength1} mm</Typography>
                         </Box>
                       )}
                       {isValidValue(result.weldDetails.legLength2) && (
                         <Box>
                           <Typography variant="subtitle2" color="text.secondary">Bacak 2 (z2)</Typography>
                           <Typography variant="h6" fontWeight={600}>{result.weldDetails.legLength2} mm</Typography>
                         </Box>
                       )}
                     </Box>
                   </CardContent>
                 </Card>

                {/* Kalite Limitleri Sonuçları */}
              <Card variant="outlined">
                                     <CardContent>
                     <Typography variant="h6" gutterBottom>
                       <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                       Kalite Seviyesi Limitleri ve Değerlendirme
                     </Typography>
                     
                     {/* Ölçülen Değer */}
                                          <Alert severity="info" sx={{ mb: 3 }}>
                       <Typography variant="body1">
                         <strong>Ölçülen/Hesaplanan Değer:</strong> {getActualValueForDisplay().toFixed(2)} mm
                       </Typography>
                     </Alert>

                  <TableContainer 
                    component={Paper} 
                    variant="outlined" 
                    sx={{ 
                      mt: 2, 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      overflow: 'auto'
                    }}
                  >
                    <Table sx={{ minWidth: 650 }}>
                         <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell 
                            sx={{ 
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              py: 2,
                              minWidth: 140,
                              borderRight: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            Kalite Seviyesi
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              py: 2,
                              minWidth: 280,
                              borderRight: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            Standart Limiti
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ 
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              py: 2,
                              minWidth: 140,
                              borderRight: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            Hesaplanan (mm)
                          </TableCell>
                          <TableCell 
                            align="center"
                            sx={{ 
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              py: 2,
                              minWidth: 100
                            }}
                          >
                            Durum
                          </TableCell>
                           </TableRow>
                         </TableHead>
                         <TableBody>
                        {Object.entries(result.limits).map(([level, data], index) => {
                             const levelLetter = level.replace('level', '');
                             const color = getQualityLevelColor(levelLetter);
                          const isNotAllowed = data.limit.includes('Müsaade Edilmez') || data.limit.includes('Müsade Edilmez');
                             
                             return (
                            <TableRow 
                              key={level}
                              sx={{ 
                                '&:nth-of-type(even)': { bgcolor: 'grey.25' },
                                '&:hover': { bgcolor: 'action.hover' },
                                borderBottom: index === Object.entries(result.limits).length - 1 ? 'none' : '1px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <TableCell 
                                sx={{ 
                                  py: 2.5,
                                  borderRight: '1px solid',
                                  borderColor: 'divider'
                                }}
                              >
                                   <Chip
                                     label={`Seviye ${levelLetter}`}
                                  size="medium"
                                     sx={{ 
                                       bgcolor: color,
                                       color: 'white',
                                       fontWeight: 600,
                                    fontSize: '0.8rem',
                                    height: 28,
                                    minWidth: 80
                                     }}
                                   />
                                 </TableCell>
                              <TableCell 
                                sx={{ 
                                  py: 2.5,
                                  borderRight: '1px solid',
                                  borderColor: 'divider'
                                }}
                              >
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontSize: '0.85rem',
                                    color: isNotAllowed ? 'error.main' : 'text.primary',
                                    fontWeight: isNotAllowed ? 600 : 400,
                                    lineHeight: 1.4
                                  }}
                                >
                                  {isNotAllowed ? 'Müsaade Edilmez' : data.limit}
                                   </Typography>
                                 </TableCell>
                              <TableCell 
                                align="center"
                                sx={{ 
                                  py: 2.5,
                                  borderRight: '1px solid',
                                  borderColor: 'divider'
                                }}
                              >
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    fontWeight: 600,
                                    color: isNotAllowed ? 'error.main' : 'text.primary',
                                    fontSize: '1rem'
                                  }}
                                >
                                  {isNotAllowed ? '-' : (data.calculated > 0 ? data.calculated.toFixed(2) : '-')}
                                   </Typography>
                                 </TableCell>
                              <TableCell 
                                align="center"
                                sx={{ py: 2.5 }}
                              >
                                {/* Müsaade edilmeyen durumlar için her zaman X */}
                                {isNotAllowed ? (
                                  <CloseIcon 
                                    sx={{ 
                                      color: 'error.main', 
                                      fontSize: '1.8rem',
                                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                    }} 
                                  />
                                ) : (
                                  /* Hesaplanan değer > 0 ise normal geçti/kaldı kontrolü */
                                  data.calculated > 0 && data.status === 'pass' ? (
                                    <CheckCircleIcon 
                                      sx={{ 
                                        color: 'success.main', 
                                        fontSize: '1.8rem',
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                      }} 
                                    />
                                  ) : data.calculated > 0 ? (
                                    <CloseIcon 
                                      sx={{ 
                                        color: 'error.main', 
                                        fontSize: '1.8rem',
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                      }} 
                                    />
                                  ) : (
                                    /* Hesaplanan değer 0 ise "-" göster */
                                    <Typography 
                                      variant="h6" 
                                      sx={{ 
                                        fontWeight: 600,
                                        color: 'text.disabled',
                                        fontSize: '1.2rem'
                                      }}
                                    >
                                      -
                                    </Typography>
                                  )
                                   )}
                                 </TableCell>
                               </TableRow>
                             );
                           })}
                         </TableBody>
                       </Table>
                     </TableContainer>

                    {/* Öneri */}
                    <Alert 
                      severity={
                        result.limits.levelB.status === 'pass' ? 'success' :
                        result.limits.levelC.status === 'pass' ? 'warning' :
                        result.limits.levelD.status === 'pass' ? 'info' : 'error'
                      } 
                      sx={{ mt: 3 }}
                    >
                      <Typography variant="body1">
                        <strong>Öneri:</strong> {getQualityRecommendation()}
                      </Typography>
                    </Alert>
                                     </CardContent>
              </Card>
               </Box>
          </Paper>
        )}
      </Container>
      </Box>
  );
};

export default ISO5817WeldLimit; 